import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying SentinelVault with owner: ${deployer.address}`);

    const SentinelVault = await ethers.getContractFactory("SentinelVault");
    const vault = await SentinelVault.deploy(deployer.address);
    await vault.waitForDeployment();
    const vaultAddress = await vault.getAddress();

    console.log(`SentinelVault deployed to: ${vaultAddress}`);
    console.log("\nUpdate your .env with:");
    console.log(`SENTINEL_VAULT_ADDRESS=${vaultAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
