import { Router, Request, Response } from "express";
import { priceService } from "../services/shared/priceService";
import { protocolService } from "../services/protocol/protocolService";

const router = Router();

// GET /api/status — Public status page data
router.get("/", async (req: Request, res: Response) => {
    try {
        const prices = await priceService.getAllPrices();
        const incidents = await protocolService.getRecentIncidents(10);
        res.json({
            success: true,
            data: {
                platform: "operational",
                timestamp: Date.now(),
                prices,
                recentIncidents: incidents,
                stats: {
                    uptime: "99.9%",
                    monitored: 1,
                },
            },
        });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/status/prices — Just price data
router.get("/prices", async (req: Request, res: Response) => {
    try {
        const prices = await priceService.getAllPrices();
        res.json({ success: true, data: prices });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/status/incidents — Just incident data
router.get("/incidents", async (req: Request, res: Response) => {
    try {
        const incidents = await protocolService.getRecentIncidents(10);
        res.json({ success: true, data: incidents });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
