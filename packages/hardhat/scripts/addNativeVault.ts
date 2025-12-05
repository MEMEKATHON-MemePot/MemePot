import { ethers } from "hardhat";

async function main() {
  const NATIVE_TOKEN = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  const VAULT_MANAGER_ADDRESS = "0x9e99A4aE1a462EEFaB306bB4e5a6A40D7570530d";

  console.log("Adding native MEME vault...");

  const VaultManager = await ethers.getContractAt("VaultManager", VAULT_MANAGER_ADDRESS);

  // Create native MEME vault
  const tx = await VaultManager.createVault(
    17, // id
    "Native MEME Vault", // name
    "MEME", // symbol
    NATIVE_TOKEN, // tokenContract (special address for native token)
    550, // 5.5% APR
    "Memecore", // chain
    18, // decimals
    true, // isNative
  );

  await tx.wait();
  console.log("✅ Native MEME Vault created!");
  console.log("Transaction hash:", tx.hash);

  // Verify vault was created
  const vaultInfo = await VaultManager.getVaultInfo(NATIVE_TOKEN);
  console.log("\nVault Info:");
  console.log("  Name:", vaultInfo.name);
  console.log("  Symbol:", vaultInfo.token);
  console.log("  APR:", (Number(vaultInfo.apr) / 100).toFixed(2) + "%");
  console.log("  Is Native:", vaultInfo.isNative);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
