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

  // Native token address constant
  const NATIVE_TOKEN = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

  const vaultConfigs = [
    { id: 1, name: "Tether USD Vault", symbol: "USDT", apr: 100, chain: "Ethereum", decimals: 6, isNative: false },
    { id: 2, name: "USD Coin Vault", symbol: "USDC", apr: 100, chain: "Ethereum", decimals: 6, isNative: false },
  ];

  for (const config of vaultConfigs) {
    await VaultManager.createVault(
      config.id,
      config.name,
      config.symbol,
      deployedTokens[config.symbol].address,
      config.apr,
      config.chain,
      config.decimals,
      config.isNative,
    );
    console.log(`✅ ${config.symbol} Vault: ${config.apr / 100}% APR`);
  }

  // Create Native MEME Vault
  await VaultManager.createVault(17, "Native MEME Vault", "MEME", NATIVE_TOKEN, 200, "Memecore", 18, true);
  console.log(`✅ MEME Vault: 2% APR (Native)`);

  // Add to deployedTokens for later use
  deployedTokens["MEME"] = { address: NATIVE_TOKEN };

  // Configure yield for all tokens
  console.log("\n📈 Configuring Yield...");

  for (const config of vaultConfigs) {
    // Split APR into base and ticket (60/40 split)
    const baseAPR = Math.floor(config.apr * 0.6);
    const ticketAPR = config.apr - baseAPR;
    await YieldGenerator.configureYield(deployedTokens[config.symbol].address, baseAPR, ticketAPR);
    console.log(`✅ ${config.symbol} Yield configured: ${baseAPR / 100}% Base + ${ticketAPR / 100}% Ticket`);
  }

  // Configure yield for Native MEME
  const memeBaseAPR = Math.floor(200 * 0.6);
  const memeTicketAPR = 200 - memeBaseAPR;
  await YieldGenerator.configureYield(NATIVE_TOKEN, memeBaseAPR, memeTicketAPR);
  console.log(`✅ MEME Yield configured: ${memeBaseAPR / 100}% Base + ${memeTicketAPR / 100}% Ticket`);

  // Set prices
  console.log("\n💰 Setting Token Prices...");

  const prices: { [key: string]: string } = {
    USDT: "100000000", // $1.00
    USDC: "100000000", // $1.00
    MEME: "5000000", // $0.05
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
    "Monthly USDC Jackpot",
    deployedTokens.USDC.address,
    hre.ethers.parseUnits("1569", 6),
    2,
  );
  console.log("✅ Monthly Pool: 1,569 USDC");

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
