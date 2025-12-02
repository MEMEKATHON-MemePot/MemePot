// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

interface IVaultManager {
    function getUserBalance(address user, address token) external view returns (uint256);
    function getVaultInfo(address token) external view returns (bool, uint256, uint256, uint256, uint256);
}

/**
 * @title RewardsManager
 * @notice Manages reward accrual and claiming for vault depositors
 * @dev Calculates and distributes base APY rewards to users
 */
contract RewardsManager is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // User reward information per token
    struct UserReward {
        uint256 accruedReward;
        uint256 lastUpdateTime;
        uint256 rewardDebt;
    }

    // VaultManager contract
    IVaultManager public vaultManager;

    // User address => Token address => UserReward
    mapping(address => mapping(address => UserReward)) public userRewards;

    // Total rewards claimed per token
    mapping(address => uint256) public totalRewardsClaimed;

    // Reward pool balance per token
    mapping(address => uint256) public rewardPool;

    // Events
    event RewardAccrued(address indexed user, address indexed token, uint256 amount);
    event RewardClaimed(address indexed user, address indexed token, uint256 amount);
    event RewardsClaimed(address indexed user, address[] tokens, uint256[] amounts);
    event RewardPoolFunded(address indexed token, uint256 amount);
    event VaultManagerUpdated(address indexed oldAddress, address indexed newAddress);

    constructor(address _vaultManager) {
        require(_vaultManager != address(0), "RewardsManager: Invalid VaultManager address");
        vaultManager = IVaultManager(_vaultManager);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    /**
     * @notice Calculate pending rewards for a user
     * @param user The user address
     * @param token The token address
     * @return The pending reward amount
     */
    function calculatePendingReward(address user, address token) public view returns (uint256) {
        UserReward memory reward = userRewards[user][token];
        uint256 userBalance = vaultManager.getUserBalance(user, token);

        if (userBalance == 0) {
            return 0;
        }

        // Get vault info
        (bool isActive, , uint256 baseAPR, , ) = vaultManager.getVaultInfo(token);

        if (!isActive) {
            return 0;
        }

        // Calculate time elapsed since last update
        uint256 timeElapsed = block.timestamp - reward.lastUpdateTime;

        if (timeElapsed == 0) {
            return reward.accruedReward;
        }

        // Calculate reward: (balance * baseAPR * timeElapsed) / (365 days * 10000)
        // baseAPR is in basis points (e.g., 420 = 4.20%)
        uint256 newReward = (userBalance * baseAPR * timeElapsed) / (365 days * 10000);

        return reward.accruedReward + newReward;
    }

    /**
     * @notice Update user rewards
     * @param user The user address
     * @param token The token address
     */
    function updateRewards(address user, address token) public {
        UserReward storage reward = userRewards[user][token];

        uint256 pending = calculatePendingReward(user, token);

        if (pending > reward.accruedReward) {
            uint256 newReward = pending - reward.accruedReward;
            reward.accruedReward = pending;
            emit RewardAccrued(user, token, newReward);
        }

        reward.lastUpdateTime = block.timestamp;
    }

    /**
     * @notice Claim rewards for a single token
     * @param token The token address
     */
    function claimReward(address token) external nonReentrant whenNotPaused {
        updateRewards(msg.sender, token);

        UserReward storage reward = userRewards[msg.sender][token];
        uint256 claimAmount = reward.accruedReward;

        require(claimAmount > 0, "RewardsManager: No rewards to claim");
        require(rewardPool[token] >= claimAmount, "RewardsManager: Insufficient reward pool");

        // Reset accrued rewards
        reward.accruedReward = 0;

        // Update total claimed
        totalRewardsClaimed[token] += claimAmount;
        rewardPool[token] -= claimAmount;

        // Transfer rewards
        IERC20(token).safeTransfer(msg.sender, claimAmount);

        emit RewardClaimed(msg.sender, token, claimAmount);
    }

    /**
     * @notice Claim all rewards for multiple tokens
     * @param tokens Array of token addresses
     */
    function claimAllRewards(address[] calldata tokens) external nonReentrant whenNotPaused {
        require(tokens.length > 0, "RewardsManager: Empty tokens array");

        uint256[] memory amounts = new uint256[](tokens.length);

        for (uint256 i = 0; i < tokens.length; i++) {
            address token = tokens[i];
            updateRewards(msg.sender, token);

            UserReward storage reward = userRewards[msg.sender][token];
            uint256 claimAmount = reward.accruedReward;

            if (claimAmount > 0 && rewardPool[token] >= claimAmount) {
                // Reset accrued rewards
                reward.accruedReward = 0;

                // Update total claimed
                totalRewardsClaimed[token] += claimAmount;
                rewardPool[token] -= claimAmount;

                // Transfer rewards
                IERC20(token).safeTransfer(msg.sender, claimAmount);

                amounts[i] = claimAmount;
                emit RewardClaimed(msg.sender, token, claimAmount);
            }
        }

        emit RewardsClaimed(msg.sender, tokens, amounts);
    }

    /**
     * @notice Get claimable rewards for a user across multiple tokens
     * @param user The user address
     * @param tokens Array of token addresses
     * @return amounts Array of claimable amounts
     */
    function getClaimableRewards(
        address user,
        address[] calldata tokens
    ) external view returns (uint256[] memory amounts) {
        amounts = new uint256[](tokens.length);

        for (uint256 i = 0; i < tokens.length; i++) {
            amounts[i] = calculatePendingReward(user, tokens[i]);
        }

        return amounts;
    }

    /**
     * @notice Fund the reward pool for a token
     * @param token The token address
     * @param amount The amount to fund
     */
    function fundRewardPool(address token, uint256 amount) external onlyRole(OPERATOR_ROLE) {
        require(amount > 0, "RewardsManager: Amount must be greater than 0");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        rewardPool[token] += amount;

        emit RewardPoolFunded(token, amount);
    }

    /**
     * @notice Initialize user rewards when they make their first deposit
     * @param user The user address
     * @param token The token address
     */
    function initializeUserRewards(address user, address token) external onlyRole(OPERATOR_ROLE) {
        UserReward storage reward = userRewards[user][token];

        if (reward.lastUpdateTime == 0) {
            reward.lastUpdateTime = block.timestamp;
        }
    }

    /**
     * @notice Update VaultManager address
     * @param _vaultManager The new VaultManager address
     */
    function setVaultManager(address _vaultManager) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_vaultManager != address(0), "RewardsManager: Invalid address");
        address oldAddress = address(vaultManager);
        vaultManager = IVaultManager(_vaultManager);
        emit VaultManagerUpdated(oldAddress, _vaultManager);
    }

    /**
     * @notice Emergency withdraw tokens
     * @param token The token address
     * @param amount The amount to withdraw
     */
    function emergencyWithdraw(
        address token,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
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
}
