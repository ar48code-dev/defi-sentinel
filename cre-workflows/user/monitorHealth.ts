import { ethers } from "ethers";

// This is a Chainlink CRE Workflow
// It monitors a user's health factor on Aave V3 (Sepolia)
// And triggers an alert if it falls below a threshold

export async function run(inputs: any) {
    const { userAddress, threshold = 1.5, rpcUrl } = inputs;

    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Aave V3 Pool Address on Sepolia
    const AAVE_POOL_ADDRESS = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951";
    const AAVE_POOL_ABI = [
        "function getUserAccountData(address user) external view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)"
    ];

    const pool = new ethers.Contract(AAVE_POOL_ADDRESS, AAVE_POOL_ABI, provider);

    console.log(`Checking health factor for ${userAddress}...`);

    try {
        const accountData = await pool.getUserAccountData(userAddress);
        const healthFactor = Number(accountData.healthFactor) / 1e18;

        console.log(`Current Health Factor: ${healthFactor}`);

        if (healthFactor < threshold) {
            return {
                status: "ALERT",
                healthFactor: healthFactor,
                message: `Health factor ${healthFactor} is below threshold ${threshold}!`,
                needsAction: true
            };
        }

        return {
            status: "SAFE",
            healthFactor: healthFactor,
            message: "Position is healthy.",
            needsAction: false
        };
    } catch (error: any) {
        return {
            status: "ERROR",
            message: error.message
        };
    }
}
