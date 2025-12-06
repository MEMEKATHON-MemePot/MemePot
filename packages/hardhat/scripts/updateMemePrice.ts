import { ethers } from "hardhat";

/**
 * Script to update MEME token price in PriceOracle
 * This fixes the issue where useMemecorePrice returns 0
 */
async function main() {
  const NATIVE_TOKEN = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  const MEME_PRICE = "5000000"; // $0.05 with 8 decimals

  console.log("🔄 Updating MEME token price...\n");

  // Get the deployed PriceOracle contract
  const priceOracleAddress = process.env.PRICE_ORACLE_ADDRESS;

  if (!priceOracleAddress) {
    console.error("❌ PRICE_ORACLE_ADDRESS not set in environment variables");
    console.log("Please set PRICE_ORACLE_ADDRESS to your deployed PriceOracle contract address");
    process.exit(1);
  }

  const PriceOracle = await ethers.getContractAt("PriceOracle", priceOracleAddress);

  console.log("📍 PriceOracle Address:", priceOracleAddress);
  console.log("💰 Setting MEME price to: $0.05");
  console.log("🔑 NATIVE_TOKEN:", NATIVE_TOKEN);

  // Update the price
  const tx = await PriceOracle.updatePrice(NATIVE_TOKEN, MEME_PRICE);
  console.log("\n⏳ Transaction sent:", tx.hash);

  await tx.wait();
  console.log("✅ Transaction confirmed!");

  // Verify the price was set correctly
  const price = await PriceOracle.getPrice(NATIVE_TOKEN);
  const priceInUSD = Number(price) / 1e8;

  console.log("\n✅ MEME token price updated successfully!");
  console.log(`💵 Current price: $${priceInUSD.toFixed(2)}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
