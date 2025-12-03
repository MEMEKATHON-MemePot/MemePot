import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MemePotModule = buildModule("MemePotModule", m => {
  // Deploy Mock Tokens for testing - 16 tokens
  const usdt = m.contract("MockERC20", ["Tether USD", "USDT", 6]);
  const usdc = m.contract("MockERC20", ["USD Coin", "USDC", 6]);
  const weth = m.contract("MockERC20", ["Wrapped Ether", "WETH", 18]);
  const dai = m.contract("MockERC20", ["Dai Stablecoin", "DAI", 18]);
  const matic = m.contract("MockERC20", ["Wrapped Matic", "MATIC", 18]);
  const link = m.contract("MockERC20", ["ChainLink Token", "LINK", 18]);
  const mkr = m.contract("MockERC20", ["Maker", "MKR", 18]);
  const yfi = m.contract("MockERC20", ["yearn.finance", "YFI", 18]);
  const comp = m.contract("MockERC20", ["Compound", "COMP", 18]);
  const aave = m.contract("MockERC20", ["Aave Token", "AAVE", 18]);
  const wbtc = m.contract("MockERC20", ["Wrapped Bitcoin", "WBTC", 8]);
  const bal = m.contract("MockERC20", ["Balancer", "BAL", 18]);
  const crv = m.contract("MockERC20", ["Curve DAO Token", "CRV", 18]);
  const snx = m.contract("MockERC20", ["Synthetix Network Token", "SNX", 18]);
  const sushi = m.contract("MockERC20", ["SushiToken", "SUSHI", 18]);
  const uni = m.contract("MockERC20", ["Uniswap", "UNI", 18]);

  // Deploy TicketNFT
  const ticketNFT = m.contract("TicketNFT", ["MemePot Ticket", "MPTICKET", "https://api.memepot.com/ticket/"]);

  // Deploy VaultManager
  const vaultManager = m.contract("VaultManager");

  // Deploy RewardsManager
  const rewardsManager = m.contract("RewardsManager", [vaultManager]);

  // Deploy PriceOracle
  const priceOracle = m.contract("PriceOracle");

  // Deploy YieldGenerator
  const yieldGenerator = m.contract("YieldGenerator");

  // Deploy PrizePoolManager
  const prizePoolManager = m.contract("PrizePoolManager", [ticketNFT]);

  // Setup VaultManager
  m.call(vaultManager, "setRewardsManager", [rewardsManager]);
  m.call(vaultManager, "setYieldGenerator", [yieldGenerator]);

  // Setup YieldGenerator
  m.call(yieldGenerator, "setVaultManager", [vaultManager]);
  m.call(yieldGenerator, "setRewardsManager", [rewardsManager]);
  m.call(yieldGenerator, "setPrizePoolManager", [prizePoolManager]);

  // Grant roles to PrizePoolManager
  const minterRole = m.staticCall(ticketNFT, "MINTER_ROLE", []);
  m.call(ticketNFT, "grantRole", [minterRole, prizePoolManager]);

  // Create vaults for all 16 tokens
  m.call(vaultManager, "createVault", [usdt, 420, 280, "1000000000000"]); // USDT: 4.2% + 2.8%, 1M max
  m.call(vaultManager, "createVault", [usdc, 510, 320, "1000000000000"]); // USDC: 5.1% + 3.2%, 1M max

  // Create native MEME token vault
  const NATIVE_TOKEN = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  m.call(vaultManager, "createVault", [NATIVE_TOKEN, 380, 250, "1000000000000000000000"]); // MEME: 3.8% + 2.5%, 1000 max
  m.call(vaultManager, "createVault", [weth, 380, 250, "1000000000000000000000"]); // WETH: 3.8% + 2.5%, 1000 max
  m.call(vaultManager, "createVault", [dai, 790, 450, "1000000000000000000000000"]); // DAI: 7.9% + 4.5%, 1M max
  m.call(vaultManager, "createVault", [matic, 650, 380, "5000000000000000000000000"]); // MATIC: 6.5% + 3.8%, 5M max
  m.call(vaultManager, "createVault", [link, 580, 340, "100000000000000000000000"]); // LINK: 5.8% + 3.4%, 100K max
  m.call(vaultManager, "createVault", [mkr, 490, 310, "10000000000000000000000"]); // MKR: 4.9% + 3.1%, 10K max
  m.call(vaultManager, "createVault", [yfi, 720, 410, "1000000000000000000000"]); // YFI: 7.2% + 4.1%, 1K max
  m.call(vaultManager, "createVault", [comp, 610, 360, "50000000000000000000000"]); // COMP: 6.1% + 3.6%, 50K max
  m.call(vaultManager, "createVault", [aave, 560, 330, "100000000000000000000000"]); // AAVE: 5.6% + 3.3%, 100K max
  m.call(vaultManager, "createVault", [wbtc, 410, 270, "10000000000"]); // WBTC: 4.1% + 2.7%, 100 max (8 decimals)
  m.call(vaultManager, "createVault", [bal, 670, 390, "200000000000000000000000"]); // BAL: 6.7% + 3.9%, 200K max
  m.call(vaultManager, "createVault", [crv, 730, 420, "500000000000000000000000"]); // CRV: 7.3% + 4.2%, 500K max
  m.call(vaultManager, "createVault", [snx, 640, 370, "300000000000000000000000"]); // SNX: 6.4% + 3.7%, 300K max
  m.call(vaultManager, "createVault", [sushi, 690, 400, "500000000000000000000000"]); // SUSHI: 6.9% + 4.0%, 500K max
  m.call(vaultManager, "createVault", [uni, 540, 320, "200000000000000000000000"]); // UNI: 5.4% + 3.2%, 200K max

  // Configure yield for all 16 tokens
  m.call(yieldGenerator, "configureYield", [usdt, 420, 280]);
  m.call(yieldGenerator, "configureYield", [usdc, 510, 320]);
  m.call(yieldGenerator, "configureYield", [weth, 380, 250]);
  m.call(yieldGenerator, "configureYield", [dai, 790, 450]);
  m.call(yieldGenerator, "configureYield", [matic, 650, 380]);
  m.call(yieldGenerator, "configureYield", [link, 580, 340]);
  m.call(yieldGenerator, "configureYield", [mkr, 490, 310]);
  m.call(yieldGenerator, "configureYield", [yfi, 720, 410]);
  m.call(yieldGenerator, "configureYield", [comp, 610, 360]);
  m.call(yieldGenerator, "configureYield", [aave, 560, 330]);
  m.call(yieldGenerator, "configureYield", [wbtc, 410, 270]);
  m.call(yieldGenerator, "configureYield", [bal, 670, 390]);
  m.call(yieldGenerator, "configureYield", [crv, 730, 420]);
  m.call(yieldGenerator, "configureYield", [snx, 640, 370]);
  m.call(yieldGenerator, "configureYield", [sushi, 690, 400]);
  m.call(yieldGenerator, "configureYield", [uni, 540, 320]);

  // Initialize prices in oracle for all 16 tokens (8 decimals)
  m.call(priceOracle, "updatePrice", [usdt, 100000000]); // $1.00
  m.call(priceOracle, "updatePrice", [usdc, 100000000]); // $1.00
  m.call(priceOracle, "updatePrice", [weth, 350000000000]); // $3,500.00
  m.call(priceOracle, "updatePrice", [dai, 100000000]); // $1.00
  m.call(priceOracle, "updatePrice", [matic, 8500000000]); // $85.00
  m.call(priceOracle, "updatePrice", [link, 1450000000]); // $14.50
  m.call(priceOracle, "updatePrice", [mkr, 180000000000]); // $1,800.00
  m.call(priceOracle, "updatePrice", [yfi, 750000000000]); // $7,500.00
  m.call(priceOracle, "updatePrice", [comp, 5200000000]); // $52.00
  m.call(priceOracle, "updatePrice", [aave, 9500000000]); // $95.00
  m.call(priceOracle, "updatePrice", [wbtc, 6800000000000]); // $68,000.00
  m.call(priceOracle, "updatePrice", [bal, 450000000]); // $4.50
  m.call(priceOracle, "updatePrice", [crv, 7000000]); // $0.70
  m.call(priceOracle, "updatePrice", [snx, 230000000]); // $2.30
  m.call(priceOracle, "updatePrice", [sushi, 8500000]); // $0.85
  m.call(priceOracle, "updatePrice", [uni, 620000000]); // $6.20

  // Create prize pools
  // Daily USDC pool - 24 USDC
  const dailyPool = m.call(prizePoolManager, "createPool", [
    "Daily Quick Draw",
    usdc,
    m.getParameter("dailyPrize", "24000000"), // 24 USDC (6 decimals)
    0, // DrawFrequency.Daily
  ]);

  // Weekly USDT pool - 343 USDT
  const weeklyPool = m.call(prizePoolManager, "createPool", [
    "Weekly USDT Pool",
    usdt,
    m.getParameter("weeklyPrize", "343000000"), // 343 USDT (6 decimals)
    1, // DrawFrequency.Weekly
  ]);

  // Monthly pool - 1,569 USDT
  const monthlyPool = m.call(prizePoolManager, "createPool", [
    "Monthly Meme Jackpot",
    usdt,
    m.getParameter("monthlyPrize", "1569000000"), // 1,569 USDT (6 decimals)
    3, // DrawFrequency.Monthly
  ]);

  // Quarterly pool - 8,750 WETH (assuming MEME token uses 18 decimals)
  const quarterlyPool = m.call(prizePoolManager, "createPool", [
    "Mega Memecore Lottery",
    weth,
    m.getParameter("quarterlyPrize", "8750000000000000000000"), // 8,750 WETH (18 decimals)
    4, // DrawFrequency.Quarterly
  ]);

  // Semi-annual pool - 11,585 WETH (representing ETH)
  const semiAnnualPool = m.call(prizePoolManager, "createPool", [
    "Ethereum Grand Prize",
    weth,
    m.getParameter("semiAnnualPrize", "11585000000000000000000"), // 11,585 WETH (18 decimals)
    5, // DrawFrequency.SemiAnnual
  ]);

  return {
    // All 16 Tokens
    usdt,
    usdc,
    weth,
    dai,
    matic,
    link,
    mkr,
    yfi,
    comp,
    aave,
    wbtc,
    bal,
    crv,
    snx,
    sushi,
    uni,
    // Core contracts
    vaultManager,
    rewardsManager,
    priceOracle,
    yieldGenerator,
    prizePoolManager,
    ticketNFT,
    // Prize pools
    dailyPool,
    weeklyPool,
    monthlyPool,
    quarterlyPool,
    semiAnnualPool,
  };
});

export default MemePotModule;
