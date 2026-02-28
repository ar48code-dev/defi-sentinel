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

// POST /api/status/config — Update environment variables in memory (for demo convenience)
router.post("/config", async (req: Request, res: Response) => {
    const { SEPOLIA_RPC_URL, PRIVATE_KEY, TELEGRAM_BOT_TOKEN, SENDGRID_API_KEY } = req.body;

    if (SEPOLIA_RPC_URL) process.env.SEPOLIA_RPC_URL = SEPOLIA_RPC_URL;
    if (PRIVATE_KEY) process.env.PRIVATE_KEY = PRIVATE_KEY;
    if (TELEGRAM_BOT_TOKEN) process.env.TELEGRAM_BOT_TOKEN = TELEGRAM_BOT_TOKEN;
    if (SENDGRID_API_KEY) process.env.SENDGRID_API_KEY = SENDGRID_API_KEY;

    console.log("[Config] Applied temporary configuration updates from UI");

    res.json({
        success: true,
        message: "Configuration applied to current session!",
        activeKeys: {
            rpc: !!process.env.SEPOLIA_RPC_URL,
            pk: !!process.env.PRIVATE_KEY,
            telegram: !!process.env.TELEGRAM_BOT_TOKEN,
            sendgrid: !!process.env.SENDGRID_API_KEY
        }
    });
});

export default router;
