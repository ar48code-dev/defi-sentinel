/**
 * protection.routes.ts
 * 
 * Adds POST /api/protect/trigger endpoint to the backend.
 * This lets the frontend manually trigger protection for demo purposes,
 * AND receives callbacks from CRE workflows when auto-protection fires.
 * 
 * HOW TO ADD THIS TO server.ts:
 *   import protectionRouter from "./routes/protection.routes.js";
 *   app.use("/api/protect", protectionRouter);
 */

import { Router, Request, Response } from "express";
import { ethers } from "ethers";
import { SECRETS, RPC_URLS } from "../config/secrets.js";

const router = Router();

const AUTO_PROTECTOR_ADDRESS = "0x3b29D86d5f9F755a17BfA04eD62ab01316C1F0cb";
const AAVE_POOL_ADDRESS      = "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951";
const USDC_SEPOLIA           = "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8";

const AUTO_PROTECTOR_ABI = [
    "function executeProtection(address user, address token, uint256 amount, address aavePool, uint256 healthFactorBefore) external",
    "function userConfigs(address user) external view returns (address vault, uint256 minAmount, uint256 maxAmount, bool active)",
    "function setConfig(address vault, uint256 minAmount, uint256 maxAmount, bool active) external",
];

const AAVE_POOL_ABI = [
    "function getUserAccountData(address user) external view returns (uint256 totalCollateralBase, uint256 totalDebtBase, uint256 availableBorrowsBase, uint256 currentLiquidationThreshold, uint256 ltv, uint256 healthFactor)"
];

// ── GET /api/protect/status/:userAddress ─────────────────────────────────────
// Returns current health factor and protection config for a user

router.get("/status/:userAddress", async (req: Request, res: Response) => {
    const { userAddress } = req.params;

    try {
        const provider = new ethers.JsonRpcProvider(RPC_URLS[0]);
        const aavePool = new ethers.Contract(AAVE_POOL_ADDRESS, AAVE_POOL_ABI, provider);
        const autoProtector = new ethers.Contract(AUTO_PROTECTOR_ADDRESS, AUTO_PROTECTOR_ABI, provider);

        const [accountData, userConfig] = await Promise.all([
            aavePool.getUserAccountData(userAddress),
            autoProtector.userConfigs(userAddress)
        ]);

        const healthFactor = Number(accountData.healthFactor) / 1e18;
        const totalCollateral = Number(accountData.totalCollateralBase) / 1e8;
        const totalDebt = Number(accountData.totalDebtBase) / 1e8;

        res.json({
            success: true,
            data: {
                userAddress,
                healthFactor: healthFactor,
                totalCollateral,
                totalDebt,
                status: healthFactor >= 1.5 ? "SAFE" : healthFactor >= 1.2 ? "WARNING" : "DANGER",
                protectionConfig: {
                    active: userConfig.active,
                    vault: userConfig.vault,
                    minAmount: ethers.formatUnits(userConfig.minAmount, 6),
                    maxAmount: ethers.formatUnits(userConfig.maxAmount, 6),
                }
            }
        });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── POST /api/protect/trigger ─────────────────────────────────────────────────
// Manually triggers protection (for demo + CRE webhook callback)

router.post("/trigger", async (req: Request, res: Response) => {
    const { userAddress, amount } = req.body;

    if (!userAddress) {
        return res.status(400).json({ success: false, error: "userAddress required" });
    }

    try {
        const provider = new ethers.JsonRpcProvider(RPC_URLS[0]);
        const signer = new ethers.Wallet(SECRETS.PRIVATE_KEY, provider);
        const autoProtector = new ethers.Contract(AUTO_PROTECTOR_ADDRESS, AUTO_PROTECTOR_ABI, signer);
        const aavePool = new ethers.Contract(AAVE_POOL_ADDRESS, AAVE_POOL_ABI, provider);

        // Get current health factor
        const accountData = await aavePool.getUserAccountData(userAddress);
        const healthFactor = Number(accountData.healthFactor) / 1e18;

        // Check user config
        const userConfig = await autoProtector.userConfigs(userAddress);
        if (!userConfig.active) {
            return res.status(400).json({
                success: false,
                error: "User protection not active. Configure via setConfig first."
            });
        }

        const protectionAmount = amount
            ? ethers.parseUnits(amount.toString(), 6)
            : userConfig.minAmount;

        console.log(`[Protection] Triggering for ${userAddress}, amount: ${ethers.formatUnits(protectionAmount, 6)} USDC`);

        const tx = await autoProtector.executeProtection(
            userAddress,
            USDC_SEPOLIA,
            protectionAmount,
            AAVE_POOL_ADDRESS,
            BigInt(Math.floor(healthFactor * 1e18))
        );

        console.log(`[Protection] ✅ Tx sent: ${tx.hash}`);
        const receipt = await tx.wait();

        res.json({
            success: true,
            data: {
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                userAddress,
                healthFactorBefore: healthFactor,
                amountProtected: ethers.formatUnits(protectionAmount, 6),
                message: "Protection executed successfully"
            }
        });

    } catch (err: any) {
        console.error(`[Protection] Failed: ${err.message}`);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
