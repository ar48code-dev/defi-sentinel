import { Router, Request, Response } from "express";
import { priceService } from "../services/shared/priceService";
import { protocolService } from "../services/protocol/protocolService";

const router = Router();

// GET /api/protocol/:address
router.get("/:address", async (req: Request, res: Response) => {
    try {
        const info = await protocolService.getProtocolInfo(req.params.address as string);
        res.json({ success: true, data: info });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/protocol/:address/incidents
router.get("/:address/incidents", async (req: Request, res: Response) => {
    try {
        const incidents = await protocolService.getRecentIncidents(20);
        const filtered = incidents.filter((i) => i.target.toLowerCase() === (req.params.address as string).toLowerCase());
        res.json({ success: true, data: filtered });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/protocol/update-threat
router.post("/update-threat", async (req: Request, res: Response) => {
    try {
        const { protocol, level } = req.body;
        const txHash = await protocolService.updateThreatLevel(protocol, level);
        res.json({ success: true, txHash });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
