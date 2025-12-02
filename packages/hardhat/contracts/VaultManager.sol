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

    // Vault information for each token
    struct VaultInfo {
        bool isActive;
        uint256 totalDeposits;
        uint256 baseAPR; // in basis points (e.g., 420 = 4.20%)
        uint256 ticketAPR; // in basis points (e.g., 280 = 2.80%)
        uint256 maxDepositPerUser;
    }

    // User deposit information
    struct UserDeposit {
        uint256 amount;
        uint256 depositTime;
        uint256 lastRewardClaim;
    }

    // Token address => VaultInfo
    mapping(address => VaultInfo) public vaults;

    // User address => Token address => UserDeposit
    mapping(address => mapping(address => UserDeposit)) public userDeposits;

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
    event YieldGeneratorUpdated(address indexed oldAddress, address indexed newAddress);
    event RewardsManagerUpdated(address indexed oldAddress, address indexed newAddress);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    /**
     * @notice Create a new vault for a token
     * @param token The ERC20 token address
     * @param baseAPR The base APR in basis points
     * @param ticketAPR The ticket APR in basis points
     * @param maxDepositPerUser Maximum deposit amount per user
     */
    function createVault(
        address token,
        uint256 baseAPR,
        uint256 ticketAPR,
        uint256 maxDepositPerUser
    ) external onlyRole(OPERATOR_ROLE) {
        require(token != address(0), "VaultManager: Invalid token address");
        require(!vaults[token].isActive, "VaultManager: Vault already exists");
        require(baseAPR + ticketAPR <= 10000, "VaultManager: Total APR exceeds 100%");

        vaults[token] = VaultInfo({
            isActive: true,
            totalDeposits: 0,
            baseAPR: baseAPR,
            ticketAPR: ticketAPR,
            maxDepositPerUser: maxDepositPerUser
        });

        supportedTokens.push(token);

        emit VaultCreated(token, baseAPR, ticketAPR);
    }

    /**
     * @notice Update vault APR settings
     * @param token The ERC20 token address
     * @param baseAPR The new base APR in basis points
     * @param ticketAPR The new ticket APR in basis points
     */
    function updateVaultAPR(
        address token,
        uint256 baseAPR,
        uint256 ticketAPR
    ) external onlyRole(OPERATOR_ROLE) {
        require(vaults[token].isActive, "VaultManager: Vault not active");
        require(baseAPR + ticketAPR <= 10000, "VaultManager: Total APR exceeds 100%");

        vaults[token].baseAPR = baseAPR;
        vaults[token].ticketAPR = ticketAPR;

        emit VaultUpdated(token, baseAPR, ticketAPR);
    }

    /**
     * @notice Deposit tokens into a vault
     * @param token The ERC20 token address
     * @param amount The amount to deposit
     */
    function deposit(address token, uint256 amount) external nonReentrant whenNotPaused {
        require(vaults[token].isActive, "VaultManager: Vault not active");
        require(amount > 0, "VaultManager: Amount must be greater than 0");

        UserDeposit storage userDeposit = userDeposits[msg.sender][token];

        // Check max deposit limit
        if (vaults[token].maxDepositPerUser > 0) {
            require(
                userDeposit.amount + amount <= vaults[token].maxDepositPerUser,
                "VaultManager: Exceeds max deposit per user"
            );
        }

        // Transfer tokens from user
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        // Update user deposit
        if (userDeposit.amount == 0) {
            userDeposit.depositTime = block.timestamp;
            userDeposit.lastRewardClaim = block.timestamp;
        }
        userDeposit.amount += amount;

        // Update vault total deposits
        vaults[token].totalDeposits += amount;

        // Transfer to YieldGenerator if set
        if (yieldGenerator != address(0)) {
            IERC20(token).safeTransfer(yieldGenerator, amount);
        }

        emit Deposited(msg.sender, token, amount);
    }

    /**
     * @notice Withdraw tokens from a vault
     * @param token The ERC20 token address
     * @param percentage The percentage to withdraw (0-100)
     */
    function withdraw(address token, uint256 percentage) external nonReentrant whenNotPaused {
        require(vaults[token].isActive, "VaultManager: Vault not active");
        require(percentage > 0 && percentage <= 100, "VaultManager: Invalid percentage");

        UserDeposit storage userDeposit = userDeposits[msg.sender][token];
        require(userDeposit.amount > 0, "VaultManager: No deposits found");

        uint256 withdrawAmount = (userDeposit.amount * percentage) / 100;
        require(withdrawAmount > 0, "VaultManager: Withdrawal amount is 0");

        // Update user deposit
        userDeposit.amount -= withdrawAmount;

        // Update vault total deposits
        vaults[token].totalDeposits -= withdrawAmount;

        // Transfer tokens back to user
        // In production, this would request withdrawal from YieldGenerator
        IERC20(token).safeTransfer(msg.sender, withdrawAmount);

        emit Withdrawn(msg.sender, token, withdrawAmount);
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
     * @notice Get vault information
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
}
