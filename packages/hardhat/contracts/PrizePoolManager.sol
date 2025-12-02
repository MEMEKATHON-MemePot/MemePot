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
        Daily,       // 1 day
        Weekly,      // 7 days
        BiWeekly,    // 14 days
        Monthly,     // 30 days
        Quarterly,   // 90 days
        SemiAnnual   // 180 days
    }

    struct PrizePool {
        string name;
        address token;
        uint256 totalPrize;
        DrawFrequency frequency;
        uint256 drawInterval;
        uint256 nextDrawTime;
        uint256 lastDrawTime;
        PoolStatus status;
        uint256 totalParticipants;
        uint256 totalTickets;
        uint256 drawCount;
    }

    struct DrawResult {
        uint256 poolId;
        uint256 drawNumber;
        address[] winners;
        uint256[] prizes;
        uint256 timestamp;
        bytes32 randomness; // For VRF integration
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

    // Counter for pool IDs
    uint256 public poolCounter;

    // Ticket conversion rate (amount per ticket per week)
    uint256 public ticketConversionRate = 10 * 10**18; // 10 tokens = 1 ticket per week

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

        prizePools[poolId] = PrizePool({
            name: name,
            token: token,
            totalPrize: totalPrize,
            frequency: frequency,
            drawInterval: drawInterval,
            nextDrawTime: block.timestamp + drawInterval,
            lastDrawTime: 0,
            status: PoolStatus.Active,
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
        pool.totalPrize += amount;

        emit PoolFunded(poolId, amount);
    }

    /**
     * @notice Issue tickets to a user
     * @param poolId The pool ID
     * @param user The user address
     * @param ticketCount Number of tickets to issue
     */
    function issueTickets(
        uint256 poolId,
        address user,
        uint256 ticketCount
    ) external onlyRole(OPERATOR_ROLE) {
        PrizePool storage pool = prizePools[poolId];
        require(pool.status == PoolStatus.Active, "PrizePoolManager: Pool not active");
        require(ticketCount > 0, "PrizePoolManager: Invalid ticket count");

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
        pool.totalTickets += ticketCount;

        emit TicketsIssued(poolId, user, ticketCount);
    }

    /**
     * @notice Execute a draw (simplified version without VRF)
     * @param poolId The pool ID
     * @param winners Array of winner addresses
     * @param prizes Array of prize amounts
     */
    function executeDraw(
        uint256 poolId,
        address[] calldata winners,
        uint256[] calldata prizes
    ) external onlyRole(DRAWER_ROLE) nonReentrant {
        PrizePool storage pool = prizePools[poolId];
        require(pool.status == PoolStatus.Active, "PrizePoolManager: Pool not active");
        require(block.timestamp >= pool.nextDrawTime, "PrizePoolManager: Draw time not reached");
        require(winners.length == prizes.length, "PrizePoolManager: Array length mismatch");
        require(winners.length > 0, "PrizePoolManager: No winners");

        // Validate total prizes
        uint256 totalPrizeAmount = 0;
        for (uint256 i = 0; i < prizes.length; i++) {
            totalPrizeAmount += prizes[i];
        }
        require(totalPrizeAmount <= pool.totalPrize, "PrizePoolManager: Insufficient prize pool");

        // Update pool status
        pool.status = PoolStatus.Drawing;

        // Record draw result
        uint256 drawNumber = pool.drawCount;
        drawResults[poolId][drawNumber] = DrawResult({
            poolId: poolId,
            drawNumber: drawNumber,
            winners: winners,
            prizes: prizes,
            timestamp: block.timestamp,
            randomness: bytes32(0) // Placeholder for VRF
        });

        // Distribute prizes
        for (uint256 i = 0; i < winners.length; i++) {
            userPrizes[poolId][winners[i]] += prizes[i];
        }

        // Update pool
        pool.drawCount++;
        pool.lastDrawTime = block.timestamp;
        pool.nextDrawTime = block.timestamp + pool.drawInterval;
        pool.totalPrize -= totalPrizeAmount;
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
