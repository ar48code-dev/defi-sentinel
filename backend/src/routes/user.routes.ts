import { Router, Request, Response } from "express";
import { priceService } from "../services/shared/priceService";
import { aaveService } from "../services/user/aaveService";
import { notificationService } from "../services/shared/notificationService";

const router = Router();

// GET /api/user/position/:address
router.get("/position/:address", async (req: Request, res: Response) => {
    try {
        const address = req.params.address as string;
        const position = await aaveService.getUserPosition(address);
        res.json({ success: true, data: position });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/user/has-position/:address
router.get("/has-position/:address", async (req: Request, res: Response) => {
    try {
        const hasPosition = await aaveService.hasOpenPosition(req.params.address as string);
        res.json({ success: true, hasPosition });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/user/register-monitoring
router.post("/register-monitoring", async (req: Request, res: Response) => {
    try {
        const { address, alertThreshold, protectThreshold, email, telegramId } = req.body;
        if (!address) return res.status(400).json({ success: false, error: "address required" });

        // Start health factor monitoring
        aaveService.monitorHealthFactor(address, alertThreshold || 1.5, async (position) => {
            await notificationService.sendLiquidationAlert(email || "", telegramId || null, {
                userAddress: address,
                healthFactor: position.healthFactor,
                collateralUSD: position.totalCollateralUSD,
                debtUSD: position.totalDebtUSD,
                riskLevel: position.riskLevel,
            });
        });

        res.json({ success: true, message: "Monitoring started", address });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/user/send-test-alert
router.post("/send-test-alert", async (req: Request, res: Response) => {
    try {
        const { email, telegramId } = req.body;
        await notificationService.sendLiquidationAlert(email, telegramId, {
            userAddress: "0xTest...",
            healthFactor: "1.42",
            collateralUSD: "5000.00",
            debtUSD: "3500.00",
            riskLevel: "danger",
        });
        res.json({ success: true, message: "Test alert sent" });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
