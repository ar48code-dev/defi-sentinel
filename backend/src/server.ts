import "dotenv/config";
import express from "express";
import cors from "cors";
import { priceService } from "./services/shared/priceService.js";
import userRoutes from "./routes/user.routes.js";
import protocolRoutes from "./routes/protocol.routes.js";
import statusRoutes from "./routes/status.routes.js";

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ CORS — allow frontend on port 3000 (and any other local origin)
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use("/api/user", userRoutes);
app.use("/api/protocol", protocolRoutes);
app.use("/api/status", statusRoutes);

// ✅ Flat /api/prices endpoint (no redirect — direct response)
app.get("/api/prices", async (req, res) => {
    try {
        const prices = await priceService.getAllPrices();
        res.json({ success: true, data: prices });
    } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ✅ Health check
app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        version: "1.0.0",
        network: "sepolia",
        timestamp: new Date().toISOString(),
        services: ["priceService", "aaveService", "notificationService", "protocolService"],
    });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
});

app.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════╗
  ║   DeFi-Sentinel Backend              ║
  ║   Running on http://localhost:${PORT}   ║
  ║   Network: Sepolia Testnet           ║
  ╚═══════════════════════════════════════╝
  `);
});

export default app;
