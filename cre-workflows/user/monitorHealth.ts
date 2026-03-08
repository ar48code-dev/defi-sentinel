import { ethers } from "ethers";



// ─── Contract addresses (Sepolia) ─────────────────────────────────────────────

const AAVE_POOL_ADDRESS     = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951";
const AUTO_PROTECTOR_ADDRESS = "0x3b29D86d5f9F755a17BfA04eD62ab01316C1F0cb";
const SENTINEL_VAULT_ADDRESS = "0x2f3B8aC8B0d513acB2bb90775238616d018335D0";
const USDC_SEPOLIA           = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";

// ─── ABIs ─────────────────────────────────────────────────────────────────────

const AAVE_POOL_ABI = [
    "function getUserAccountData(address user) external view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)"
];

const AUTO_PROTECTOR_ABI = [
    "function executeProtection(address user, address token, uint256 amount, address aavePool, uint256 healthFactorBefore) external",
    "function userConfigs(address user) external view returns (address vault, uint256 minAmount, uint256 maxAmount, bool active)"
];

// ─── Main workflow function ────────────────────────────────────────────────────

export async function run(inputs: any) {
    const { 
        userAddress, 
        threshold = 1.5, 
        rpcUrl,
        privateKey  // CRE node private key — must be authorized in SentinelCore
    } = inputs;

    if (!userAddress || !rpcUrl) {
        return { status: "ERROR", message: "Missing userAddress or rpcUrl" };
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const aavePool = new ethers.Contract(AAVE_POOL_ADDRESS, AAVE_POOL_ABI, provider);

    console.log(`[DeFi Sentinel] Checking health factor for ${userAddress}...`);

    // ── Step 1: Read health factor from Aave ──────────────────────────────────
    let healthFactor: number;
    let totalCollateral: number;

    try {
        const accountData = await aavePool.getUserAccountData(userAddress);
        healthFactor = Number(accountData.healthFactor) / 1e18;
        totalCollateral = Number(accountData.totalCollateralBase) / 1e8;

        console.log(`[DeFi Sentinel] Health Factor: ${healthFactor.toFixed(4)}`);
        console.log(`[DeFi Sentinel] Total Collateral: $${totalCollateral.toFixed(2)}`);
    } catch (err: any) {
        return { status: "ERROR", message: `Aave read failed: ${err.message}` };
    }

    // ── Step 2: Position is safe — no action needed ───────────────────────────
    if (healthFactor >= threshold) {
        return {
            status: "SAFE",
            healthFactor,
            totalCollateral,
            message: `Position healthy. Health factor ${healthFactor.toFixed(4)} above threshold ${threshold}.`,
            needsAction: false,
            timestamp: Date.now()
        };
    }

    // ── Step 3: DANGER — health factor below threshold ────────────────────────
    console.log(`[DeFi Sentinel] ⚠️  ALERT! Health factor ${healthFactor.toFixed(4)} below ${threshold}`);
    console.log(`[DeFi Sentinel] Triggering AutoProtector...`);

    // ── Step 4: Check if user has protection configured ───────────────────────
    if (!privateKey) {
        // No key provided — return alert only (read-only mode)
        return {
            status: "ALERT",
            healthFactor,
            totalCollateral,
            message: `Health factor ${healthFactor.toFixed(4)} BELOW threshold ${threshold}! Protection not configured.`,
            needsAction: true,
            protectionTriggered: false,
            timestamp: Date.now()
        };
    }

    try {
        // ── Step 5: Connect as CRE node (authorized signer) ──────────────────
        const signer = new ethers.Wallet(privateKey, provider);
        const autoProtector = new ethers.Contract(
            AUTO_PROTECTOR_ADDRESS, 
            AUTO_PROTECTOR_ABI, 
            signer
        );

        // ── Step 6: Check user config ─────────────────────────────────────────
        const userConfig = await autoProtector.userConfigs(userAddress);
        if (!userConfig.active) {
            return {
                status: "ALERT",
                healthFactor,
                message: `Health factor critical but user protection not active. Enable via dashboard.`,
                needsAction: true,
                protectionTriggered: false
            };
        }

        // ── Step 7: Calculate protection amount ───────────────────────────────
        // Top up enough to bring health factor back to 2.0
        const protectionAmount = userConfig.minAmount; // Use user's configured min amount

        // ── Step 8: Execute protection on-chain ───────────────────────────────
        console.log(`[DeFi Sentinel] Executing protection: ${ethers.formatUnits(protectionAmount, 6)} USDC`);
        
        const tx = await autoProtector.executeProtection(
            userAddress,
            USDC_SEPOLIA,
            protectionAmount,
            AAVE_POOL_ADDRESS,
            BigInt(Math.floor(healthFactor * 1e18))
        );

        console.log(`[DeFi Sentinel] ✅ Protection tx sent: ${tx.hash}`);
        await tx.wait();
        console.log(`[DeFi Sentinel] ✅ Protection confirmed on-chain!`);

        return {
            status: "PROTECTED",
            healthFactor,
            totalCollateral,
            message: `Auto-protection executed! Collateral topped up. Tx: ${tx.hash}`,
            needsAction: false,
            protectionTriggered: true,
            txHash: tx.hash,
            timestamp: Date.now()
        };

    } catch (err: any) {
        console.error(`[DeFi Sentinel] Protection execution failed: ${err.message}`);
        return {
            status: "ALERT",
            healthFactor,
            message: `Health factor critical! Protection failed: ${err.message}`,
            needsAction: true,
            protectionTriggered: false,
            error: err.message
        };
    }
}
