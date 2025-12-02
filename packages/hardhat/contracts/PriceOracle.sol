// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title PriceOracle
 * @notice Provides price feeds for tokens in USD
 * @dev Simple oracle for testnet. In production, integrate with Chainlink Price Feeds
 */
contract PriceOracle is AccessControl {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    // Token address => Price in USD (with 8 decimals precision)
    mapping(address => uint256) public tokenPrices;

    // Token address => Last update timestamp
    mapping(address => uint256) public lastUpdated;

    // Price staleness threshold (default: 1 hour)
    uint256 public stalenessThreshold = 1 hours;

    // Events
    event PriceUpdated(address indexed token, uint256 price, uint256 timestamp);
    event PricesUpdated(address[] tokens, uint256[] prices, uint256 timestamp);
    event StalenessThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    /**
     * @notice Update price for a single token
     * @param token The token address
     * @param price The price in USD (8 decimals)
     */
    function updatePrice(address token, uint256 price) external onlyRole(OPERATOR_ROLE) {
        require(token != address(0), "PriceOracle: Invalid token address");
        require(price > 0, "PriceOracle: Price must be greater than 0");

        tokenPrices[token] = price;
        lastUpdated[token] = block.timestamp;

        emit PriceUpdated(token, price, block.timestamp);
    }

    /**
     * @notice Update prices for multiple tokens
     * @param tokens Array of token addresses
     * @param prices Array of prices in USD (8 decimals)
     */
    function updatePrices(
        address[] calldata tokens,
        uint256[] calldata prices
    ) external onlyRole(OPERATOR_ROLE) {
        require(tokens.length == prices.length, "PriceOracle: Array length mismatch");
        require(tokens.length > 0, "PriceOracle: Empty arrays");

        for (uint256 i = 0; i < tokens.length; i++) {
            require(tokens[i] != address(0), "PriceOracle: Invalid token address");
            require(prices[i] > 0, "PriceOracle: Price must be greater than 0");

            tokenPrices[tokens[i]] = prices[i];
            lastUpdated[tokens[i]] = block.timestamp;
        }

        emit PricesUpdated(tokens, prices, block.timestamp);
    }

    /**
     * @notice Get the latest price for a token
     * @param token The token address
     * @return price The price in USD (8 decimals)
     */
    function getPrice(address token) external view returns (uint256 price) {
        price = tokenPrices[token];
        require(price > 0, "PriceOracle: Price not available");
        require(!isPriceStale(token), "PriceOracle: Price is stale");
        return price;
    }

    /**
     * @notice Get prices for multiple tokens
     * @param tokens Array of token addresses
     * @return prices Array of prices in USD (8 decimals)
     */
    function getPrices(address[] calldata tokens) external view returns (uint256[] memory prices) {
        prices = new uint256[](tokens.length);

        for (uint256 i = 0; i < tokens.length; i++) {
            uint256 price = tokenPrices[tokens[i]];
            require(price > 0, "PriceOracle: Price not available");
            require(!isPriceStale(tokens[i]), "PriceOracle: Price is stale");
            prices[i] = price;
        }

        return prices;
    }

    /**
     * @notice Convert token amount to USD value
     * @param token The token address
     * @param amount The token amount (in token decimals)
     * @param tokenDecimals The token decimals
     * @return usdValue The USD value (8 decimals)
     */
    function getUSDValue(
        address token,
        uint256 amount,
        uint8 tokenDecimals
    ) external view returns (uint256 usdValue) {
        uint256 price = tokenPrices[token];
        require(price > 0, "PriceOracle: Price not available");
        require(!isPriceStale(token), "PriceOracle: Price is stale");

        // Convert: (amount * price) / (10^tokenDecimals)
        // Result is in 8 decimals (USD)
        usdValue = (amount * price) / (10 ** tokenDecimals);
        return usdValue;
    }

    /**
     * @notice Get total USD value for multiple token amounts
     * @param tokens Array of token addresses
     * @param amounts Array of token amounts
     * @param tokenDecimals Array of token decimals
     * @return totalValue Total USD value (8 decimals)
     */
    function getTotalUSDValue(
        address[] calldata tokens,
        uint256[] calldata amounts,
        uint8[] calldata tokenDecimals
    ) external view returns (uint256 totalValue) {
        require(
            tokens.length == amounts.length && amounts.length == tokenDecimals.length,
            "PriceOracle: Array length mismatch"
        );

        totalValue = 0;

        for (uint256 i = 0; i < tokens.length; i++) {
            uint256 price = tokenPrices[tokens[i]];
            require(price > 0, "PriceOracle: Price not available");
            require(!isPriceStale(tokens[i]), "PriceOracle: Price is stale");

            uint256 value = (amounts[i] * price) / (10 ** tokenDecimals[i]);
            totalValue += value;
        }

        return totalValue;
    }

    /**
     * @notice Check if a price is stale
     * @param token The token address
     * @return True if price is stale, false otherwise
     */
    function isPriceStale(address token) public view returns (bool) {
        if (lastUpdated[token] == 0) {
            return true;
        }
        return (block.timestamp - lastUpdated[token]) > stalenessThreshold;
    }

    /**
     * @notice Update staleness threshold
     * @param newThreshold The new threshold in seconds
     */
    function setStalenessThreshold(uint256 newThreshold) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newThreshold > 0, "PriceOracle: Invalid threshold");
        uint256 oldThreshold = stalenessThreshold;
        stalenessThreshold = newThreshold;
        emit StalenessThresholdUpdated(oldThreshold, newThreshold);
    }

    /**
     * @notice Initialize prices for common tokens (for testing)
     * @dev This is for testnet only. Remove in production.
     */
    function initializeTestPrices() external onlyRole(OPERATOR_ROLE) {
        // Prices with 8 decimals precision
        address[] memory tokens = new address[](16);
        uint256[] memory prices = new uint256[](16);

        // Example addresses (replace with actual token addresses)
        // These are placeholder addresses for demonstration
        tokens[0] = address(0x1111111111111111111111111111111111111111); // USDT
        prices[0] = 100000000; // $1.00

        tokens[1] = address(0x2222222222222222222222222222222222222222); // USDC
        prices[1] = 100000000; // $1.00

        tokens[2] = address(0x3333333333333333333333333333333333333333); // WETH
        prices[2] = 350000000000; // $3,500.00

        tokens[3] = address(0x4444444444444444444444444444444444444444); // DAI
        prices[3] = 100000000; // $1.00

        tokens[4] = address(0x5555555555555555555555555555555555555555); // WBTC
        prices[4] = 9500000000000; // $95,000.00

        tokens[5] = address(0x6666666666666666666666666666666666666666); // MATIC
        prices[5] = 80000000; // $0.80

        tokens[6] = address(0x7777777777777777777777777777777777777777); // LINK
        prices[6] = 1500000000; // $15.00

        tokens[7] = address(0x8888888888888888888888888888888888888888); // UNI
        prices[7] = 700000000; // $7.00

        tokens[8] = address(0x9999999999999999999999999999999999999999); // AAVE
        prices[8] = 18000000000; // $180.00

        tokens[9] = address(0xaAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa); // SUSHI
        prices[9] = 120000000; // $1.20

        tokens[10] = address(0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB); // CRV
        prices[10] = 60000000; // $0.60

        tokens[11] = address(0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC); // SNX
        prices[11] = 250000000; // $2.50

        tokens[12] = address(0xDDdDddDdDdddDDddDDddDDDDdDdDDdDDdDDDDDDd); // COMP
        prices[12] = 5000000000; // $50.00

        tokens[13] = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE); // MKR
        prices[13] = 150000000000; // $1,500.00

        tokens[14] = address(0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF); // YFI
        prices[14] = 800000000000; // $8,000.00

        tokens[15] = address(0x0000000000000000000000000000000000000001); // BAL
        prices[15] = 350000000; // $3.50

        for (uint256 i = 0; i < tokens.length; i++) {
            tokenPrices[tokens[i]] = prices[i];
            lastUpdated[tokens[i]] = block.timestamp;
        }

        emit PricesUpdated(tokens, prices, block.timestamp);
    }
}
