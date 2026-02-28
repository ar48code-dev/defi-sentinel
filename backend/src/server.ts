import "dotenv/config";

import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import protocolRoutes from "./routes/protocol.routes.js";
import statusRoutes from "./routes/status.routes.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
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
app.get("/api/prices", async (req, res) => {
    res.redirect("/api/status/prices");
});

// Health check
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
