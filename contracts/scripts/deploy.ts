import { ethers } from "hardhat";

async function main() {
    console.log("Starting deployment...");

    // 1. Deploy SentinelCore
    const SentinelCore = await ethers.getContractFactory("SentinelCore");
    const core = await SentinelCore.deploy();
    await core.waitForDeployment();
    const coreAddress = await core.getAddress();
    console.log(`SentinelCore deployed to: ${coreAddress}`);

    // 2. Deploy ForensicsLogger
    const ForensicsLogger = await ethers.getContractFactory("ForensicsLogger");
    const logger = await ForensicsLogger.deploy();
    await logger.waitForDeployment();
    const loggerAddress = await logger.getAddress();
    console.log(`ForensicsLogger deployed to: ${loggerAddress}`);

    // 3. Deploy AutoProtector
    const AutoProtector = await ethers.getContractFactory("AutoProtector");
    const protector = await AutoProtector.deploy(coreAddress, loggerAddress);
    await protector.waitForDeployment();
    const protectorAddress = await protector.getAddress();
    console.log(`AutoProtector deployed to: ${protectorAddress}`);

    console.log("Deployment complete!");

    // Output for .env
    console.log("\nAdd these to your .env file:");
    console.log(`SENTINEL_CORE_ADDRESS=${coreAddress}`);
    console.log(`FORENSICS_LOGGER_ADDRESS=${loggerAddress}`);
    console.log(`AUTO_PROTECTOR_ADDRESS=${protectorAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
