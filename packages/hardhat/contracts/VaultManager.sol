// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title VaultManager
 * @notice Manages user deposits and withdrawals for the MemePot no-loss lottery system
 * @dev Handles multiple ERC20 tokens with deposit/withdrawal functionality
 */
contract VaultManager is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // Address used to represent native token (MEME) in mappings
    address public constant NATIVE_TOKEN = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);

    // Vault information for each token
    struct VaultInfo {
        uint256 id;
        string name;
        string token;
        address tokenContract;
        uint256 apr;
        uint256 totalDeposits;
        string chain;
        uint256 volume24h;
        uint8 decimals;
        bool isNative;
    }

    // User deposit information
    struct UserDeposit {
        uint128 amount; // 16 bytes - sufficient for most deposit amounts
        uint64 depositTime; // 8 bytes - valid until year 584 billion
        uint64 lastRewardClaim; // 8 bytes
    }

    // Token address => VaultInfo
    mapping(address => VaultInfo) public vaults;

    // User address => Token address => UserDeposit
    mapping(address => mapping(address => UserDeposit)) public userDeposits;

    // User address => Token address => Pending withdrawal amount (for failed native token transfers)
    mapping(address => mapping(address => uint256)) public pendingWithdrawals;

    // Supported tokens list
    address[] public supportedTokens;

    // YieldGenerator contract address
    address public yieldGenerator;

    // RewardsManager contract address
    address public rewardsManager;

    // Events
    event VaultCreated(address indexed token, uint256 baseAPR, uint256 ticketAPR);
    event VaultUpdated(address indexed token, uint256 baseAPR, uint256 ticketAPR);
    event Deposited(address indexed user, address indexed token, uint256 amount);
    event Withdrawn(address indexed user, address indexed token, uint256 amount);
    event WithdrawalPending(address indexed user, address indexed token, uint256 amount);
    event WithdrawalClaimed(address indexed user, address indexed token, uint256 amount);
    event YieldGeneratorUpdated(address indexed oldAddress, address indexed newAddress);
    event RewardsManagerUpdated(address indexed oldAddress, address indexed newAddress);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    /**
     * @notice Create a new vault for a token
     * @param id The vault ID
     * @param name The vault name
     * @param tokenSymbol The token symbol
     * @param tokenContract The ERC20 token contract address
     * @param apr The APR percentage
     * @param chain The blockchain name
     * @param decimals The token decimals
     * @param isNative Whether the token is native
     */
    function createVault(
        uint256 id,
        string memory name,
        string memory tokenSymbol,
        address tokenContract,
        uint256 apr,
        string memory chain,
        uint8 decimals,
        bool isNative
    ) external onlyRole(OPERATOR_ROLE) {
        require(tokenContract != address(0), "VaultManager: Invalid token address");
        require(vaults[tokenContract].tokenContract == address(0), "VaultManager: Vault already exists");

        vaults[tokenContract] = VaultInfo({
            id: id,
            name: name,
            token: tokenSymbol,
            tokenContract: tokenContract,
            apr: apr,
            totalDeposits: 0,
            chain: chain,
            volume24h: 0,
            decimals: decimals,
            isNative: isNative
        });

        supportedTokens.push(tokenContract);

        emit VaultCreated(tokenContract, apr, 0);
    }

    /**
     * @notice Update vault APR settings
     * @param token The ERC20 token address
     * @param apr The new APR percentage
     */
    function updateVaultAPR(address token, uint256 apr) external onlyRole(OPERATOR_ROLE) {
        require(vaults[token].tokenContract != address(0), "VaultManager: Vault not active");

        vaults[token].apr = apr;

        emit VaultUpdated(token, apr, 0);
    }

    /**
     * @notice Update vault 24h volume
     * @param token The ERC20 token address
     * @param volume The new 24h volume
     */
    function updateVaultVolume(address token, uint256 volume) external onlyRole(OPERATOR_ROLE) {
        require(vaults[token].tokenContract != address(0), "VaultManager: Vault not active");

        vaults[token].volume24h = volume;
    }

    /**
     * @notice Deposit tokens into a vault
     * @param token The ERC20 token address
     * @param amount The amount to deposit
     */
    function deposit(address token, uint256 amount) external nonReentrant whenNotPaused {
        require(vaults[token].tokenContract != address(0), "VaultManager: Vault not active");
        require(amount > 0, "VaultManager: Amount must be greater than 0");

        UserDeposit storage userDeposit = userDeposits[msg.sender][token];

        // Transfer tokens from user
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Update user deposit
        if (userDeposit.amount == 0) {
            userDeposit.depositTime = uint64(block.timestamp);
            userDeposit.lastRewardClaim = uint64(block.timestamp);
        }
        userDeposit.amount += uint128(amount);

        // Update vault total deposits
        vaults[token].totalDeposits += amount;

        // Transfer to YieldGenerator if set
        if (yieldGenerator != address(0)) {
            IERC20(token).safeTransfer(yieldGenerator, amount);
        }

        emit Deposited(msg.sender, token, amount);
    }

    /**
     * @notice Deposit native tokens (MEME) into a vault
     */
    function depositNative() external payable nonReentrant whenNotPaused {
        require(vaults[NATIVE_TOKEN].tokenContract != address(0), "VaultManager: Native vault not active");
        require(msg.value > 0, "VaultManager: Amount must be greater than 0");

        UserDeposit storage userDeposit = userDeposits[msg.sender][NATIVE_TOKEN];

        // Update user deposit
        if (userDeposit.amount == 0) {
            userDeposit.depositTime = uint64(block.timestamp);
            userDeposit.lastRewardClaim = uint64(block.timestamp);
        }
        userDeposit.amount += uint128(msg.value);

        // Update vault total deposits
        vaults[NATIVE_TOKEN].totalDeposits += msg.value;

        // Transfer to YieldGenerator if set
        if (yieldGenerator != address(0)) {
            (bool success, ) = yieldGenerator.call{ value: msg.value }("");
            require(success, "VaultManager: Transfer to yield generator failed");
        }

        emit Deposited(msg.sender, NATIVE_TOKEN, msg.value);
    }

    /**
     * @notice Withdraw tokens from a vault
     * @param token The ERC20 token address
     * @param percentage The percentage to withdraw (0-100)
     */
    function withdraw(address token, uint256 percentage) external nonReentrant whenNotPaused {
        require(vaults[token].tokenContract != address(0), "VaultManager: Vault not active");
        require(percentage > 0 && percentage <= 100, "VaultManager: Invalid percentage");

        UserDeposit storage userDeposit = userDeposits[msg.sender][token];
        require(userDeposit.amount > 0, "VaultManager: No deposits found");

        uint256 withdrawAmount = (userDeposit.amount * percentage) / 100;
        require(withdrawAmount > 0, "VaultManager: Withdrawal amount is 0");

        // Update user deposit
        userDeposit.amount -= uint128(withdrawAmount);

        // Update vault total deposits
        vaults[token].totalDeposits -= withdrawAmount;

        // Transfer tokens back to user
        // In production, this would request withdrawal from YieldGenerator
        if (token == NATIVE_TOKEN) {
            // Use pull pattern for native token to prevent DoS
            (bool success, ) = msg.sender.call{ value: withdrawAmount }("");
            if (!success) {
                // If transfer fails, mark as pending withdrawal
                pendingWithdrawals[msg.sender][token] += withdrawAmount;
                emit WithdrawalPending(msg.sender, token, withdrawAmount);
            } else {
                emit Withdrawn(msg.sender, token, withdrawAmount);
            }
        } else {
            IERC20(token).safeTransfer(msg.sender, withdrawAmount);
            emit Withdrawn(msg.sender, token, withdrawAmount);
        }
    }

    /**
     * @notice Claim pending native token withdrawal
     */
    function claimPendingWithdrawal() external nonReentrant whenNotPaused {
        uint256 pendingAmount = pendingWithdrawals[msg.sender][NATIVE_TOKEN];
        require(pendingAmount > 0, "VaultManager: No pending withdrawal");

        // Reset pending withdrawal before transfer (CEI pattern)
        pendingWithdrawals[msg.sender][NATIVE_TOKEN] = 0;

        // Attempt transfer
        (bool success, ) = msg.sender.call{ value: pendingAmount }("");
        require(success, "VaultManager: Native token transfer failed");

        emit WithdrawalClaimed(msg.sender, NATIVE_TOKEN, pendingAmount);
    }

    /**
     * @notice Get user's deposit balance for a token
     * @param user The user address
     * @param token The token address
     * @return The deposit amount
     */
    function getUserBalance(address user, address token) external view returns (uint256) {
        return userDeposits[user][token].amount;
    }

    /**
     * @notice Get vault information for a token
     * @param token The token address
     * @return VaultInfo struct
     */
    function getVaultInfo(address token) external view returns (VaultInfo memory) {
        return vaults[token];
    }

    /**
     * @notice Get all supported tokens
     * @return Array of token addresses
     */
    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokens;
    }

    /**
     * @notice Set YieldGenerator contract address
     * @param _yieldGenerator The YieldGenerator address
     */
    function setYieldGenerator(address _yieldGenerator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_yieldGenerator != address(0), "VaultManager: Invalid address");
        address oldAddress = yieldGenerator;
        yieldGenerator = _yieldGenerator;
        emit YieldGeneratorUpdated(oldAddress, _yieldGenerator);
    }

    /**
     * @notice Set RewardsManager contract address
     * @param _rewardsManager The RewardsManager address
     */
    function setRewardsManager(address _rewardsManager) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_rewardsManager != address(0), "VaultManager: Invalid address");
        address oldAddress = rewardsManager;
        rewardsManager = _rewardsManager;
        emit RewardsManagerUpdated(oldAddress, _rewardsManager);
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
     * @notice Allow contract to receive native tokens
     */
    receive() external payable {}
}
