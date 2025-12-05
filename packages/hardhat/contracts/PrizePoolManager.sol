// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface ITicketNFT {
    function mint(address to, uint256 poolId, uint256 amount) external returns (uint256[] memory);
    function burn(uint256 tokenId) external;
    function getUserTickets(address user, uint256 poolId) external view returns (uint256[] memory);
    function getTicketCount(uint256 poolId) external view returns (uint256);
}

/**
 * @title PrizePoolManager
 * @notice Manages prize pools and lottery drawings
 * @dev Handles ticket-based no-loss lottery system
 */
contract PrizePoolManager is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant DRAWER_ROLE = keccak256("DRAWER_ROLE");

    enum PoolStatus {
        Active,
        Drawing,
        Completed,
        Cancelled
    }

    enum DrawFrequency {
        Daily, // 1 day
        Weekly, // 7 days
        BiWeekly, // 14 days
        Monthly, // 30 days
        Quarterly, // 90 days
        SemiAnnual // 180 days
    }

    struct PrizePool {
        string name;
        address token; // 20 bytes
        PoolStatus status; // 1 byte - packed with token
        DrawFrequency frequency; // 1 byte - packed with token
        uint96 totalPrize; // 12 bytes - sufficient for most tokens (79B tokens with 18 decimals)
        uint32 drawInterval; // 4 bytes - max 136 years in seconds
        uint48 nextDrawTime; // 6 bytes - valid until year 8921
        uint48 lastDrawTime; // 6 bytes
        uint64 totalParticipants; // 8 bytes - max 18.4 quintillion participants
        uint64 totalTickets; // 8 bytes
        uint32 drawCount; // 4 bytes - max 4.2 billion draws
    }

    struct DrawResult {
        uint256 poolId;
        uint256 drawNumber;
        address[] winners;
        uint256[] prizes;
        uint256 timestamp;
        bytes32 randomness; // For VRF integration
    }

    struct DrawCommit {
        bytes32 commitHash;
        uint256 commitTime;
        bool revealed;
    }

    struct UserParticipation {
        uint256[] ticketIds;
        uint256 ticketCount;
        bool hasClaimed;
    }

    // TicketNFT contract
    ITicketNFT public ticketNFT;

    // Pool ID => PrizePool
    mapping(uint256 => PrizePool) public prizePools;

    // Pool ID => Draw Number => DrawResult
    mapping(uint256 => mapping(uint256 => DrawResult)) public drawResults;

    // Pool ID => User => UserParticipation
    mapping(uint256 => mapping(address => UserParticipation)) public userParticipations;

    // Pool ID => User => Prize amount
    mapping(uint256 => mapping(address => uint256)) public userPrizes;

    // Pool ID => Draw Number => DrawCommit
    mapping(uint256 => mapping(uint256 => DrawCommit)) public drawCommits;

    // Counter for pool IDs
    uint256 public poolCounter;

    // Minimum time between commit and reveal (prevents manipulation)
    uint256 public constant MIN_COMMIT_REVEAL_DELAY = 1 hours;

    // Ticket conversion rate (amount per ticket per week)
    uint256 public ticketConversionRate = 10 * 10 ** 18; // 10 tokens = 1 ticket per week

    // Maximum tickets per transaction (DoS protection)
    uint256 public constant MAX_TICKETS_PER_TX = 100;

    // Maximum winners per draw (DoS protection)
    uint256 public constant MAX_WINNERS_PER_DRAW = 50;

    // Events
    event PoolCreated(
        uint256 indexed poolId,
        string name,
        address indexed token,
        uint256 totalPrize,
        DrawFrequency frequency
    );
    event PoolFunded(uint256 indexed poolId, uint256 amount);
    event TicketsIssued(uint256 indexed poolId, address indexed user, uint256 ticketCount);
    event DrawExecuted(uint256 indexed poolId, uint256 drawNumber, address[] winners, uint256[] prizes);
    event PrizeClaimed(uint256 indexed poolId, address indexed user, uint256 amount);
    event PoolStatusChanged(uint256 indexed poolId, PoolStatus oldStatus, PoolStatus newStatus);
    event DrawCommitted(uint256 indexed poolId, uint256 drawNumber, bytes32 commitHash);
    event DrawRevealed(uint256 indexed poolId, uint256 drawNumber, bytes32 randomness);

    constructor(address _ticketNFT) {
        require(_ticketNFT != address(0), "PrizePoolManager: Invalid TicketNFT address");
        ticketNFT = ITicketNFT(_ticketNFT);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        _grantRole(DRAWER_ROLE, msg.sender);
    }

    /**
     * @notice Create a new prize pool
     * @param name Pool name
     * @param token Prize token address
     * @param totalPrize Total prize amount
     * @param frequency Draw frequency
     */
    function createPool(
        string calldata name,
        address token,
        uint256 totalPrize,
        DrawFrequency frequency
    ) external onlyRole(OPERATOR_ROLE) returns (uint256 poolId) {
        require(token != address(0), "PrizePoolManager: Invalid token");
        require(totalPrize > 0, "PrizePoolManager: Invalid prize amount");

        poolId = poolCounter++;

        uint256 drawInterval = _getDrawInterval(frequency);
        uint256 nextDrawTime = _calculateNextDrawTime(frequency);

        prizePools[poolId] = PrizePool({
            name: name,
            token: token,
            status: PoolStatus.Active,
            frequency: frequency,
            totalPrize: uint96(totalPrize),
            drawInterval: uint32(drawInterval),
            nextDrawTime: uint48(nextDrawTime),
            lastDrawTime: 0,
            totalParticipants: 0,
            totalTickets: 0,
            drawCount: 0
        });

        emit PoolCreated(poolId, name, token, totalPrize, frequency);

        return poolId;
    }

    /**
     * @notice Fund a prize pool
     * @param poolId The pool ID
     * @param amount Amount to add to prize pool
     */
    function fundPool(uint256 poolId, uint256 amount) external onlyRole(OPERATOR_ROLE) {
        PrizePool storage pool = prizePools[poolId];
        require(pool.status == PoolStatus.Active, "PrizePoolManager: Pool not active");
        require(amount > 0, "PrizePoolManager: Invalid amount");

        IERC20(pool.token).safeTransferFrom(msg.sender, address(this), amount);
        pool.totalPrize += uint96(amount);

        emit PoolFunded(poolId, amount);
    }

    /**
     * @notice Issue tickets to a user
     * @param poolId The pool ID
     * @param user The user address
     * @param ticketCount Number of tickets to issue
     */
    function issueTickets(uint256 poolId, address user, uint256 ticketCount) external onlyRole(OPERATOR_ROLE) {
        PrizePool storage pool = prizePools[poolId];
        require(pool.status == PoolStatus.Active, "PrizePoolManager: Pool not active");
        require(ticketCount > 0, "PrizePoolManager: Invalid ticket count");
        require(ticketCount <= MAX_TICKETS_PER_TX, "PrizePoolManager: Too many tickets");

        UserParticipation storage participation = userParticipations[poolId][user];

        // Mint tickets
        uint256[] memory ticketIds = ticketNFT.mint(user, poolId, ticketCount);

        // Update user participation
        for (uint256 i = 0; i < ticketIds.length; i++) {
            participation.ticketIds.push(ticketIds[i]);
        }
        participation.ticketCount += ticketCount;

        // Update pool stats
        if (participation.ticketCount == ticketCount) {
            pool.totalParticipants++;
        }
        pool.totalTickets += uint64(ticketCount);

        emit TicketsIssued(poolId, user, ticketCount);
    }

    /**
     * @notice Commit to a draw (step 1 of 2-phase commit-reveal)
     * @param poolId The pool ID
     * @param commitHash Hash of (secret + winners + prizes)
     */
    function commitDraw(uint256 poolId, bytes32 commitHash) external onlyRole(DRAWER_ROLE) {
        PrizePool storage pool = prizePools[poolId];
        require(pool.status == PoolStatus.Active, "PrizePoolManager: Pool not active");
        require(block.timestamp >= pool.nextDrawTime, "PrizePoolManager: Draw time not reached");
        require(commitHash != bytes32(0), "PrizePoolManager: Invalid commit hash");

        uint256 drawNumber = pool.drawCount;
        require(!drawCommits[poolId][drawNumber].revealed, "PrizePoolManager: Draw already revealed");

        drawCommits[poolId][drawNumber] = DrawCommit({
            commitHash: commitHash,
            commitTime: block.timestamp,
            revealed: false
        });

        emit DrawCommitted(poolId, drawNumber, commitHash);
    }

    /**
     * @notice Execute a draw (step 2 of 2-phase commit-reveal)
     * @param poolId The pool ID
     * @param secret The secret used in commit
     * @param winners Array of winner addresses
     * @param prizes Array of prize amounts
     */
    function executeDraw(
        uint256 poolId,
        bytes32 secret,
        address[] calldata winners,
        uint256[] calldata prizes
    ) external onlyRole(DRAWER_ROLE) nonReentrant {
        PrizePool storage pool = prizePools[poolId];
        require(pool.status == PoolStatus.Active, "PrizePoolManager: Pool not active");
        require(winners.length == prizes.length, "PrizePoolManager: Array length mismatch");
        require(winners.length > 0, "PrizePoolManager: No winners");
        require(winners.length <= MAX_WINNERS_PER_DRAW, "PrizePoolManager: Too many winners");

        uint256 drawNumber = pool.drawCount;
        DrawCommit storage commit = drawCommits[poolId][drawNumber];

        // Verify commit-reveal
        require(commit.commitTime > 0, "PrizePoolManager: No commit found");
        require(!commit.revealed, "PrizePoolManager: Draw already revealed");
        require(block.timestamp >= commit.commitTime + MIN_COMMIT_REVEAL_DELAY, "PrizePoolManager: Reveal too soon");

        // Verify commit hash matches reveal
        bytes32 revealHash = keccak256(abi.encodePacked(secret, winners, prizes));
        require(revealHash == commit.commitHash, "PrizePoolManager: Invalid reveal");

        // Mark as revealed
        commit.revealed = true;

        // Validate total prizes
        uint256 totalPrizeAmount = 0;
        for (uint256 i = 0; i < prizes.length; i++) {
            totalPrizeAmount += prizes[i];
        }
        require(totalPrizeAmount <= pool.totalPrize, "PrizePoolManager: Insufficient prize pool");

        // Update pool status
        pool.status = PoolStatus.Drawing;

        // Record draw result
        drawResults[poolId][drawNumber] = DrawResult({
            poolId: poolId,
            drawNumber: drawNumber,
            winners: winners,
            prizes: prizes,
            timestamp: block.timestamp,
            randomness: secret
        });

        emit DrawRevealed(poolId, drawNumber, secret);

        // Distribute prizes
        for (uint256 i = 0; i < winners.length; i++) {
            userPrizes[poolId][winners[i]] += prizes[i];
        }

        // Update pool
        pool.drawCount++;
        pool.lastDrawTime = uint48(block.timestamp);
        pool.nextDrawTime = uint48(_calculateNextDrawTime(pool.frequency));
        pool.totalPrize -= uint96(totalPrizeAmount);
        pool.status = PoolStatus.Active;

        emit DrawExecuted(poolId, drawNumber, winners, prizes);
    }

    /**
     * @notice Claim prize
     * @param poolId The pool ID
     */
    function claimPrize(uint256 poolId) external nonReentrant whenNotPaused {
        uint256 prizeAmount = userPrizes[poolId][msg.sender];
        require(prizeAmount > 0, "PrizePoolManager: No prize to claim");

        PrizePool storage pool = prizePools[poolId];

        // Reset user prize
        userPrizes[poolId][msg.sender] = 0;

        // Transfer prize
        IERC20(pool.token).safeTransfer(msg.sender, prizeAmount);

        emit PrizeClaimed(poolId, msg.sender, prizeAmount);
    }

    /**
     * @notice Get user's ticket count for a pool
     * @param poolId The pool ID
     * @param user The user address
     * @return Ticket count
     */
    function getUserTicketCount(uint256 poolId, address user) external view returns (uint256) {
        return userParticipations[poolId][user].ticketCount;
    }

    /**
     * @notice Get user's win chance for a pool
     * @param poolId The pool ID
     * @param user The user address
     * @return Win chance in basis points (e.g., 234 = 2.34%)
     */
    function getUserWinChance(uint256 poolId, address user) external view returns (uint256) {
        PrizePool storage pool = prizePools[poolId];
        uint256 userTickets = userParticipations[poolId][user].ticketCount;

        if (pool.totalTickets == 0 || userTickets == 0) {
            return 0;
        }

        // Return as basis points
        return (userTickets * 10000) / pool.totalTickets;
    }

    /**
     * @notice Get pool information
     * @param poolId The pool ID
     * @return Pool information
     */
    function getPoolInfo(uint256 poolId) external view returns (PrizePool memory) {
        return prizePools[poolId];
    }

    /**
     * @notice Get draw result
     * @param poolId The pool ID
     * @param drawNumber The draw number
     * @return Draw result
     */
    function getDrawResult(uint256 poolId, uint256 drawNumber) external view returns (DrawResult memory) {
        return drawResults[poolId][drawNumber];
    }

    /**
     * @notice Update pool status
     * @param poolId The pool ID
     * @param newStatus The new status
     */
    function updatePoolStatus(uint256 poolId, PoolStatus newStatus) external onlyRole(OPERATOR_ROLE) {
        PrizePool storage pool = prizePools[poolId];
        PoolStatus oldStatus = pool.status;
        pool.status = newStatus;
        emit PoolStatusChanged(poolId, oldStatus, newStatus);
    }

    /**
     * @notice Set ticket conversion rate
     * @param rate New conversion rate
     */
    function setTicketConversionRate(uint256 rate) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(rate > 0, "PrizePoolManager: Invalid rate");
        ticketConversionRate = rate;
    }

    /**
     * @notice Get draw interval based on frequency
     * @param frequency The draw frequency
     * @return The interval in seconds
     */
    function _getDrawInterval(DrawFrequency frequency) internal pure returns (uint256) {
        if (frequency == DrawFrequency.Daily) return 1 days;
        if (frequency == DrawFrequency.Weekly) return 7 days;
        if (frequency == DrawFrequency.BiWeekly) return 14 days;
        if (frequency == DrawFrequency.Monthly) return 30 days;
        if (frequency == DrawFrequency.Quarterly) return 90 days;
        if (frequency == DrawFrequency.SemiAnnual) return 180 days;
        return 30 days; // Default to monthly
    }

    /**
     * @notice Calculate next draw time based on frequency (aligned to calendar)
     * @param frequency The draw frequency
     * @return The next draw timestamp
     */
    function _calculateNextDrawTime(DrawFrequency frequency) internal view returns (uint256) {
        if (frequency == DrawFrequency.Daily) {
            return _getNextDayMidnight();
        } else if (frequency == DrawFrequency.Weekly) {
            return _getNextMondayMidnight();
        } else if (frequency == DrawFrequency.Monthly) {
            return _getNextMonthFirst();
        } else {
            // For other frequencies, use simple interval
            return block.timestamp + _getDrawInterval(frequency);
        }
    }

    /**
     * @notice Get next day at midnight (00:00:00)
     * @return Timestamp of tomorrow at 00:00:00
     */
    function _getNextDayMidnight() internal view returns (uint256) {
        uint256 secondsInDay = 1 days;
        uint256 currentDayStart = (block.timestamp / secondsInDay) * secondsInDay;
        return currentDayStart + secondsInDay;
    }

    /**
     * @notice Get next Monday at midnight (00:00:00)
     * @return Timestamp of next Monday at 00:00:00
     */
    function _getNextMondayMidnight() internal view returns (uint256) {
        uint256 secondsInDay = 1 days;
        uint256 currentDayStart = (block.timestamp / secondsInDay) * secondsInDay;

        // Thursday, Jan 1, 1970 was day 4 (0=Thu, 1=Fri, 2=Sat, 3=Sun, 4=Mon, 5=Tue, 6=Wed)
        // We need to adjust: Monday should be 1
        uint256 dayOfWeek = ((currentDayStart / secondsInDay) + 4) % 7; // 0=Sun, 1=Mon, ..., 6=Sat

        uint256 daysUntilMonday;
        if (dayOfWeek == 0) {
            // Sunday
            daysUntilMonday = 1;
        } else if (dayOfWeek == 1) {
            // Already Monday, get next Monday
            daysUntilMonday = 7;
        } else {
            // Tue-Sat
            daysUntilMonday = 8 - dayOfWeek;
        }

        return currentDayStart + (daysUntilMonday * secondsInDay);
    }

    /**
     * @notice Get first day of next month at midnight (00:00:00)
     * @return Timestamp of next month's first day at 00:00:00
     */
    function _getNextMonthFirst() internal view returns (uint256) {
        uint256 currentTimestamp = block.timestamp;

        // Get current year, month, day
        (uint256 year, uint256 month, ) = _timestampToDate(currentTimestamp);

        // Calculate next month
        if (month == 12) {
            month = 1;
            year++;
        } else {
            month++;
        }

        // Return timestamp for first day of next month
        return _dateToTimestamp(year, month, 1);
    }

    /**
     * @notice Convert timestamp to date (year, month, day)
     * @param timestamp Unix timestamp
     * @return year The year
     * @return month The month (1-12)
     * @return day The day (1-31)
     */
    function _timestampToDate(uint256 timestamp) internal pure returns (uint256 year, uint256 month, uint256 day) {
        uint256 secondsInDay = 1 days;
        uint256 daysSinceEpoch = timestamp / secondsInDay;

        // Simplified calendar calculation (good enough for near future)
        uint256 z = daysSinceEpoch + 719468;
        uint256 era = z / 146097;
        uint256 doe = z - era * 146097;
        uint256 yoe = (doe - doe/1460 + doe/36524 - doe/146096) / 365;
        year = yoe + era * 400;
        uint256 doy = doe - (365 * yoe + yoe/4 - yoe/100);
        uint256 mp = (5 * doy + 2) / 153;
        day = doy - (153 * mp + 2) / 5 + 1;
        month = mp + (mp < 10 ? 3 : 0) - 9;
        year += (month <= 2 ? 1 : 0);

        return (year, month, day);
    }

    /**
     * @notice Convert date to timestamp
     * @param year Year
     * @param month Month (1-12)
     * @param day Day (1-31)
     * @return Unix timestamp at 00:00:00 of that day
     */
    function _dateToTimestamp(uint256 year, uint256 month, uint256 day) internal pure returns (uint256) {
        require(month >= 1 && month <= 12, "Invalid month");
        require(day >= 1 && day <= 31, "Invalid day");

        // Adjust for months before March
        uint256 adjustedYear = month <= 2 ? year - 1 : year;
        uint256 adjustedMonth = month <= 2 ? month + 9 : month - 3;

        // Calculate era
        uint256 era = adjustedYear / 400;
        uint256 yoe = adjustedYear - era * 400;
        uint256 doy = (153 * adjustedMonth + 2) / 5 + day - 1;
        uint256 doe = yoe * 365 + yoe/4 - yoe/100 + doy;

        uint256 daysSinceEpoch = era * 146097 + doe - 719468;

        return daysSinceEpoch * 1 days;
    }

    /**
     * @notice Pause contract
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @notice Unpause contract
     */
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @notice Emergency withdraw tokens
     * @param token Token address
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20(token).safeTransfer(msg.sender, amount);
    }
}
