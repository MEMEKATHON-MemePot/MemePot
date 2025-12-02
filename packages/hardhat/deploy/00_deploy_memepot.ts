import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployMemePot: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("Deploying MemePot contracts with account:", deployer);

  // Deploy Mock Tokens
  console.log("\n📝 Deploying Mock Tokens...");

  const tokens = [
    { name: "Tether USD", symbol: "USDT", decimals: 6 },
    { name: "USD Coin", symbol: "USDC", decimals: 6 },
    { name: "Wrapped Ether", symbol: "WETH", decimals: 18 },
    { name: "Dai Stablecoin", symbol: "DAI", decimals: 18 },
    { name: "Wrapped Matic", symbol: "MATIC", decimals: 18 },
    { name: "ChainLink Token", symbol: "LINK", decimals: 18 },
    { name: "Maker", symbol: "MKR", decimals: 18 },
    { name: "yearn.finance", symbol: "YFI", decimals: 18 },
    { name: "Compound", symbol: "COMP", decimals: 18 },
    { name: "Aave Token", symbol: "AAVE", decimals: 18 },
    { name: "Wrapped Bitcoin", symbol: "WBTC", decimals: 8 },
    { name: "Balancer", symbol: "BAL", decimals: 18 },
    { name: "Curve DAO Token", symbol: "CRV", decimals: 18 },
    { name: "Synthetix Network Token", symbol: "SNX", decimals: 18 },
    { name: "SushiToken", symbol: "SUSHI", decimals: 18 },
    { name: "Uniswap", symbol: "UNI", decimals: 18 },
  ];

  const deployedTokens: { [key: string]: any } = {};

  for (const token of tokens) {
    const deployed = await deploy(token.symbol, {
      contract: "MockERC20",
      from: deployer,
      args: [token.name, token.symbol, token.decimals],
      log: true,
      autoMine: true,
    });
    deployedTokens[token.symbol] = deployed;
    console.log(`✅ ${token.symbol} deployed at: ${deployed.address}`);
  }

  // Deploy TicketNFT
  console.log("\n🎫 Deploying TicketNFT...");
  const ticketNFT = await deploy("TicketNFT", {
    from: deployer,
    args: ["MemePot Ticket", "MPTICKET", "https://api.memepot.com/ticket/"],
    log: true,
    autoMine: true,
  });
  console.log("✅ TicketNFT deployed at:", ticketNFT.address);

  // Deploy VaultManager
  console.log("\n🏦 Deploying VaultManager...");
  const vaultManager = await deploy("VaultManager", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log("✅ VaultManager deployed at:", vaultManager.address);

  // Deploy RewardsManager
  console.log("\n🎁 Deploying RewardsManager...");
  const rewardsManager = await deploy("RewardsManager", {
    from: deployer,
    args: [vaultManager.address],
    log: true,
    autoMine: true,
  });
  console.log("✅ RewardsManager deployed at:", rewardsManager.address);

  // Deploy PriceOracle
  console.log("\n💰 Deploying PriceOracle...");
  const priceOracle = await deploy("PriceOracle", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log("✅ PriceOracle deployed at:", priceOracle.address);

  // Deploy YieldGenerator
  console.log("\n📈 Deploying YieldGenerator...");
  const yieldGenerator = await deploy("YieldGenerator", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log("✅ YieldGenerator deployed at:", yieldGenerator.address);

  // Deploy PrizePoolManager
  console.log("\n🏆 Deploying PrizePoolManager...");
  const prizePoolManager = await deploy("PrizePoolManager", {
    from: deployer,
    args: [ticketNFT.address],
    log: true,
    autoMine: true,
  });
  console.log("✅ PrizePoolManager deployed at:", prizePoolManager.address);

  // Setup contracts
  console.log("\n⚙️  Setting up contract connections...");

  const VaultManager = await hre.ethers.getContractAt("VaultManager", vaultManager.address);
  const YieldGenerator = await hre.ethers.getContractAt("YieldGenerator", yieldGenerator.address);
  const PrizePoolManager = await hre.ethers.getContractAt("PrizePoolManager", prizePoolManager.address);
  const TicketNFT = await hre.ethers.getContractAt("TicketNFT", ticketNFT.address);
  const PriceOracle = await hre.ethers.getContractAt("PriceOracle", priceOracle.address);

  // Set contract references
  await VaultManager.setRewardsManager(rewardsManager.address);
  console.log("✅ VaultManager -> RewardsManager");

  await VaultManager.setYieldGenerator(yieldGenerator.address);
  console.log("✅ VaultManager -> YieldGenerator");

  await YieldGenerator.setVaultManager(vaultManager.address);
  console.log("✅ YieldGenerator -> VaultManager");

  await YieldGenerator.setRewardsManager(rewardsManager.address);
  console.log("✅ YieldGenerator -> RewardsManager");

  await YieldGenerator.setPrizePoolManager(prizePoolManager.address);
  console.log("✅ YieldGenerator -> PrizePoolManager");

  // Grant MINTER_ROLE to PrizePoolManager
  const MINTER_ROLE = await TicketNFT.MINTER_ROLE();
  await TicketNFT.grantRole(MINTER_ROLE, prizePoolManager.address);
  console.log("✅ Granted MINTER_ROLE to PrizePoolManager");

  // Create vaults with different APRs
  console.log("\n🏦 Creating Vaults...");

  const vaultConfigs = [
    { symbol: "USDT", baseAPR: 420, ticketAPR: 280, maxDeposit: "1000000", decimals: 6 },
    { symbol: "USDC", baseAPR: 510, ticketAPR: 320, maxDeposit: "1000000", decimals: 6 },
    { symbol: "WETH", baseAPR: 380, ticketAPR: 250, maxDeposit: "1000", decimals: 18 },
    { symbol: "DAI", baseAPR: 790, ticketAPR: 450, maxDeposit: "1000000", decimals: 18 },
    { symbol: "MATIC", baseAPR: 650, ticketAPR: 380, maxDeposit: "5000000", decimals: 18 },
    { symbol: "LINK", baseAPR: 580, ticketAPR: 340, maxDeposit: "100000", decimals: 18 },
    { symbol: "MKR", baseAPR: 490, ticketAPR: 310, maxDeposit: "10000", decimals: 18 },
    { symbol: "YFI", baseAPR: 720, ticketAPR: 410, maxDeposit: "1000", decimals: 18 },
    { symbol: "COMP", baseAPR: 610, ticketAPR: 360, maxDeposit: "50000", decimals: 18 },
    { symbol: "AAVE", baseAPR: 560, ticketAPR: 330, maxDeposit: "100000", decimals: 18 },
    { symbol: "WBTC", baseAPR: 410, ticketAPR: 270, maxDeposit: "100", decimals: 8 },
    { symbol: "BAL", baseAPR: 670, ticketAPR: 390, maxDeposit: "200000", decimals: 18 },
    { symbol: "CRV", baseAPR: 730, ticketAPR: 420, maxDeposit: "500000", decimals: 18 },
    { symbol: "SNX", baseAPR: 640, ticketAPR: 370, maxDeposit: "300000", decimals: 18 },
    { symbol: "SUSHI", baseAPR: 690, ticketAPR: 400, maxDeposit: "500000", decimals: 18 },
    { symbol: "UNI", baseAPR: 540, ticketAPR: 320, maxDeposit: "200000", decimals: 18 },
  ];

  for (const config of vaultConfigs) {
    await VaultManager.createVault(
      deployedTokens[config.symbol].address,
      config.baseAPR,
      config.ticketAPR,
      hre.ethers.parseUnits(config.maxDeposit, config.decimals),
    );
    console.log(`✅ ${config.symbol} Vault: ${config.baseAPR / 100}% Base + ${config.ticketAPR / 100}% Ticket`);
  }

  // Configure yield for all tokens
  console.log("\n📈 Configuring Yield...");

  for (const config of vaultConfigs) {
    await YieldGenerator.configureYield(deployedTokens[config.symbol].address, config.baseAPR, config.ticketAPR);
    console.log(`✅ ${config.symbol} Yield configured`);
  }

  // Set prices
  console.log("\n💰 Setting Token Prices...");

  const prices: { [key: string]: string } = {
    USDT: "100000000", // $1.00
    USDC: "100000000", // $1.00
    WETH: "350000000000", // $3,500.00
    DAI: "100000000", // $1.00
    MATIC: "8500000000", // $85.00
    LINK: "1450000000", // $14.50
    MKR: "180000000000", // $1,800.00
    YFI: "750000000000", // $7,500.00
    COMP: "5200000000", // $52.00
    AAVE: "9500000000", // $95.00
    WBTC: "6800000000000", // $68,000.00
    BAL: "450000000", // $4.50
    CRV: "7000000", // $0.70
    SNX: "230000000", // $2.30
    SUSHI: "8500000", // $0.85
    UNI: "620000000", // $6.20
  };

  for (const [symbol, price] of Object.entries(prices)) {
    await PriceOracle.updatePrice(deployedTokens[symbol].address, price);
    const displayPrice = (Number(price) / 1e8).toFixed(2);
    console.log(`✅ ${symbol}: $${displayPrice}`);
  }

  // Create prize pools
  console.log("\n🏆 Creating Prize Pools...");

  await PrizePoolManager.createPool("Daily Quick Draw", deployedTokens.USDC.address, hre.ethers.parseUnits("24", 6), 0);
  console.log("✅ Daily Pool: 24 USDC");

  await PrizePoolManager.createPool(
    "Weekly USDT Pool",
    deployedTokens.USDT.address,
    hre.ethers.parseUnits("343", 6),
    1,
  );
  console.log("✅ Weekly Pool: 343 USDT");

  await PrizePoolManager.createPool(
    "Monthly Meme Jackpot",
    deployedTokens.USDT.address,
    hre.ethers.parseUnits("1569", 6),
    2,
  );
  console.log("✅ Monthly Pool: 1,569 USDT");

  await PrizePoolManager.createPool(
    "Quarterly Lottery",
    deployedTokens.WETH.address,
    hre.ethers.parseUnits("8750", 18),
    3,
  );
  console.log("✅ Quarterly Pool: 8,750 WETH");

  await PrizePoolManager.createPool(
    "Ethereum Grand Prize",
    deployedTokens.WETH.address,
    hre.ethers.parseUnits("11585", 18),
    4,
  );
  console.log("✅ Semi-annual Pool: 11,585 WETH");

  console.log("\n✨ MemePot Deployment Complete! ✨\n");
  console.log("📋 Contract Addresses:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Tokens:");
  for (const symbol of Object.keys(deployedTokens)) {
    console.log(`  ${symbol.padEnd(8)}: ${deployedTokens[symbol].address}`);
  }
  console.log("\nCore Contracts:");
  console.log(`  VaultManager:      ${vaultManager.address}`);
  console.log(`  RewardsManager:    ${rewardsManager.address}`);
  console.log(`  PriceOracle:       ${priceOracle.address}`);
  console.log(`  YieldGenerator:    ${yieldGenerator.address}`);
  console.log(`  PrizePoolManager:  ${prizePoolManager.address}`);
  console.log(`  TicketNFT:         ${ticketNFT.address}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
};

export default deployMemePot;
deployMemePot.tags = ["MemePot"];
