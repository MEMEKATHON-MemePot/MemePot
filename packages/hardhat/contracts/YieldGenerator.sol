// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IRewardsManager {
    function initializeUserRewards(address user, address token) external;
}

interface IPrizePoolManager {
    function fundPool(uint256 poolId, uint256 amount) external;
}

/**
 * @title YieldGenerator
 * @notice Generates yield from deposited tokens and distributes to rewards and prize pools
 * @dev Simplified yield generation for testnet. In production, integrate with DeFi protocols
 */
contract YieldGenerator is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    struct YieldConfig {
        bool isActive;
        uint256 baseAPR; // in basis points
        uint256 ticketAPR; // in basis points
        uint256 totalDeposited;
        uint256 lastHarvestTime;
        uint256 totalYieldGenerated;
        uint256 totalBaseYield;
        uint256 totalTicketYield;
    }

    // Token address => YieldConfig
    mapping(address => YieldConfig) public yieldConfigs;

    // RewardsManager contract
    IRewardsManager public rewardsManager;

    // PrizePoolManager contract
    IPrizePoolManager public prizePoolManager;

    // VaultManager contract
    address public vaultManager;

    // Supported tokens
    address[] public supportedTokens;

    // Default prize pool ID for ticket yield distribution
    uint256 public defaultPrizePoolId;

    // Events
    event YieldConfigured(address indexed token, uint256 baseAPR, uint256 ticketAPR);
    event Deposited(address indexed token, uint256 amount);
    event Withdrawn(address indexed token, uint256 amount);
    event YieldHarvested(
        address indexed token,
        uint256 totalYield,
        uint256 baseYield,
        uint256 ticketYield,
        uint256 timestamp
    );
    event RewardsManagerUpdated(address indexed oldAddress, address indexed newAddress);
    event PrizePoolManagerUpdated(address indexed oldAddress, address indexed newAddress);
    event VaultManagerUpdated(address indexed oldAddress, address indexed newAddress);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    /**
     * @notice Configure yield parameters for a token
     * @param token The token address
     * @param baseAPR The base APR in basis points
     * @param ticketAPR The ticket APR in basis points
     */
    function configureYield(
        address token,
        uint256 baseAPR,
        uint256 ticketAPR
    ) external onlyRole(OPERATOR_ROLE) {
        require(token != address(0), "YieldGenerator: Invalid token");
        require(baseAPR + ticketAPR <= 10000, "YieldGenerator: Total APR exceeds 100%");

        YieldConfig storage config = yieldConfigs[token];

        if (!config.isActive) {
            supportedTokens.push(token);
        }

        config.isActive = true;
        config.baseAPR = baseAPR;
        config.ticketAPR = ticketAPR;
        config.lastHarvestTime = block.timestamp;

        emit YieldConfigured(token, baseAPR, ticketAPR);
    }

    /**
     * @notice Allocate tokens to yield generation
     * @param token The token address
     * @param amount The amount to allocate
     */
    function allocate(address token, uint256 amount) external nonReentrant whenNotPaused {
        require(msg.sender == vaultManager, "YieldGenerator: Only VaultManager");
        require(yieldConfigs[token].isActive, "YieldGenerator: Token not configured");
        require(amount > 0, "YieldGenerator: Invalid amount");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        yieldConfigs[token].totalDeposited += amount;

        emit Deposited(token, amount);
    }

    /**
     * @notice Withdraw tokens from yield generation
     * @param token The token address
     * @param amount The amount to withdraw
     */
    function withdraw(address token, uint256 amount) external nonReentrant whenNotPaused {
        require(msg.sender == vaultManager, "YieldGenerator: Only VaultManager");
        require(yieldConfigs[token].isActive, "YieldGenerator: Token not configured");
        require(amount > 0, "YieldGenerator: Invalid amount");
        require(yieldConfigs[token].totalDeposited >= amount, "YieldGenerator: Insufficient balance");

        yieldConfigs[token].totalDeposited -= amount;

        IERC20(token).safeTransfer(msg.sender, amount);

        emit Withdrawn(token, amount);
    }

    /**
     * @notice Harvest yield for a token
     * @param token The token address
     * @dev In production, this would interact with external DeFi protocols
     */
    function harvest(address token) external nonReentrant whenNotPaused {
        YieldConfig storage config = yieldConfigs[token];
        require(config.isActive, "YieldGenerator: Token not configured");
        require(config.totalDeposited > 0, "YieldGenerator: No deposits");

        uint256 timeElapsed = block.timestamp - config.lastHarvestTime;
        require(timeElapsed > 0, "YieldGenerator: No time elapsed");

        // Calculate yield
        // Formula: (totalDeposited * APR * timeElapsed) / (365 days * 10000)
        uint256 baseYield = (config.totalDeposited * config.baseAPR * timeElapsed) / (365 days * 10000);
        uint256 ticketYield = (config.totalDeposited * config.ticketAPR * timeElapsed) / (365 days * 10000);
        uint256 totalYield = baseYield + ticketYield;

        // Update config
        config.lastHarvestTime = block.timestamp;
        config.totalYieldGenerated += totalYield;
        config.totalBaseYield += baseYield;
        config.totalTicketYield += ticketYield;

        // Distribute base yield to RewardsManager
        if (baseYield > 0 && address(rewardsManager) != address(0)) {
            // In production, transfer to rewardsManager and call fundRewardPool(token, baseYield)
            // For now, we keep the yield in this contract
        }

        // Distribute ticket yield to PrizePoolManager
        if (ticketYield > 0 && address(prizePoolManager) != address(0)) {
            // In production, transfer to prizePoolManager and call fundPool(defaultPrizePoolId, ticketYield)
            // For now, we keep the yield in this contract
        }

        emit YieldHarvested(token, totalYield, baseYield, ticketYield, block.timestamp);
    }

    /**
     * @notice Harvest yield for all configured tokens
     */
    function harvestAll() external nonReentrant whenNotPaused {
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            address token = supportedTokens[i];
            YieldConfig storage config = yieldConfigs[token];

            if (config.isActive && config.totalDeposited > 0) {
                uint256 timeElapsed = block.timestamp - config.lastHarvestTime;

                if (timeElapsed > 0) {
                    uint256 baseYield = (config.totalDeposited * config.baseAPR * timeElapsed) /
                        (365 days * 10000);
                    uint256 ticketYield = (config.totalDeposited * config.ticketAPR * timeElapsed) /
                        (365 days * 10000);
                    uint256 totalYield = baseYield + ticketYield;

                    config.lastHarvestTime = block.timestamp;
                    config.totalYieldGenerated += totalYield;
                    config.totalBaseYield += baseYield;
                    config.totalTicketYield += ticketYield;

                    emit YieldHarvested(token, totalYield, baseYield, ticketYield, block.timestamp);
                }
            }
        }
    }

    /**
     * @notice Calculate pending yield for a token
     * @param token The token address
     * @return totalYield The total pending yield
     * @return baseYield The pending base yield
     * @return ticketYield The pending ticket yield
     */
    function calculatePendingYield(
        address token
    ) external view returns (uint256 totalYield, uint256 baseYield, uint256 ticketYield) {
        YieldConfig storage config = yieldConfigs[token];

        if (!config.isActive || config.totalDeposited == 0) {
            return (0, 0, 0);
        }

        uint256 timeElapsed = block.timestamp - config.lastHarvestTime;

        baseYield = (config.totalDeposited * config.baseAPR * timeElapsed) / (365 days * 10000);
        ticketYield = (config.totalDeposited * config.ticketAPR * timeElapsed) / (365 days * 10000);
        totalYield = baseYield + ticketYield;

        return (totalYield, baseYield, ticketYield);
    }

    /**
     * @notice Get yield statistics for a token
     * @param token The token address
     * @return YieldConfig struct
     */
    function getYieldConfig(address token) external view returns (YieldConfig memory) {
        return yieldConfigs[token];
    }

    /**
     * @notice Get all supported tokens
     * @return Array of token addresses
     */
    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokens;
    }

    /**
     * @notice Set RewardsManager contract address
     * @param _rewardsManager The RewardsManager address
     */
    function setRewardsManager(address _rewardsManager) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_rewardsManager != address(0), "YieldGenerator: Invalid address");
        address oldAddress = address(rewardsManager);
        rewardsManager = IRewardsManager(_rewardsManager);
        emit RewardsManagerUpdated(oldAddress, _rewardsManager);
    }

    /**
     * @notice Set PrizePoolManager contract address
     * @param _prizePoolManager The PrizePoolManager address
     */
    function setPrizePoolManager(address _prizePoolManager) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_prizePoolManager != address(0), "YieldGenerator: Invalid address");
        address oldAddress = address(prizePoolManager);
        prizePoolManager = IPrizePoolManager(_prizePoolManager);
        emit PrizePoolManagerUpdated(oldAddress, _prizePoolManager);
    }

    /**
     * @notice Set VaultManager contract address
     * @param _vaultManager The VaultManager address
     */
    function setVaultManager(address _vaultManager) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_vaultManager != address(0), "YieldGenerator: Invalid address");
        address oldAddress = vaultManager;
        vaultManager = _vaultManager;
        emit VaultManagerUpdated(oldAddress, _vaultManager);
    }

    /**
     * @notice Set default prize pool ID
     * @param poolId The prize pool ID
     */
    function setDefaultPrizePoolId(uint256 poolId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        defaultPrizePoolId = poolId;
    }

    /**
     * @notice Emergency withdraw tokens
     * @param token Token address
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20(token).safeTransfer(msg.sender, amount);
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
