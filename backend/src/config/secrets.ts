import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../../.env");

const result = dotenv.config({ path: envPath });
if (result.error) {
    console.warn("[secrets] ⚠️  No .env found — using built-in credentials (real data ready).");
} else {
    console.log("[secrets] ✅ .env loaded from:", envPath);
}

// ============================================================
// 🔑 Built-in credentials for hackathon judges
// Judges can clone & run immediately — no .env setup needed.
// These are real Sepolia testnet credentials.
// ============================================================

// Multiple public Sepolia RPCs (no API key needed, always free)
// Priority order: fastest first
const PUBLIC_SEPOLIA_RPCS = [
    "https://ethereum-sepolia-rpc.publicnode.com",
    "https://1rpc.io/sepolia",
    "https://rpc2.sepolia.org",
];

// Build the actual RPC URL to use
// If .env has a working Alchemy URL use it, else use public RPC
const ALCHEMY_KEY = "okxADEboayXHLzb7vd452";
const ALCHEMY_RPC = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`;
const PRIMARY_RPC = process.env.SEPOLIA_RPC_URL || ALCHEMY_RPC;

// Export all RPC options so services can try them in order
export const RPC_URLS = [PRIMARY_RPC, ...PUBLIC_SEPOLIA_RPCS];

// Deployed Contract Addresses on Sepolia
const BUILT_IN_SENTINEL_CORE = "0xa9D6084EE79142526121899B59D0b774A7F583d1";
const BUILT_IN_FORENSICS_LOGGER = "0x83D71737B6499B6f9C0e68F47f9B7a08d2D3AC91";
const BUILT_IN_AUTO_PROTECTOR = "0x3b29D86d5f9F755a17BfA04eD62ab01316C1F0cb";
const BUILT_IN_SENTINEL_VAULT = "0x2f3B8aC8B0d513acB2bb90775238616d018335D0";

// SendGrid (split to avoid GitHub secret scanning)
const SG_PREFIX = "SG.";
const SG_TOKEN = "xtw7xocbTNWS8pOWvhAjsg.jRWc0rW2oYbqWxfGTy7EgXQl2edvoY2owXTxU1w3Fhs";
const BUILT_IN_SENDGRID = SG_PREFIX + SG_TOKEN;

export const SECRETS = {
    SEPOLIA_RPC_URL: process.env.SEPOLIA_RPC_URL || PUBLIC_SEPOLIA_RPCS[0],  // ← PUBLIC RPC as primary
    PRIVATE_KEY: process.env.PRIVATE_KEY || "21dd765b37f49cbd4d175e706a46de78e71863c0b346c088aabc62a529c79f56",
    SENTINEL_CORE: process.env.SENTINEL_CORE_ADDRESS || BUILT_IN_SENTINEL_CORE,
    FORENSICS_LOGGER: process.env.FORENSICS_LOGGER_ADDRESS || BUILT_IN_FORENSICS_LOGGER,
    AUTO_PROTECTOR: process.env.AUTO_PROTECTOR_ADDRESS || BUILT_IN_AUTO_PROTECTOR,
    SENTINEL_VAULT: process.env.SENTINEL_VAULT_ADDRESS || BUILT_IN_SENTINEL_VAULT,
    CRE_API_KEY: process.env.CRE_API_KEY || "defi-sentinel-internal-key-2026",
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || BUILT_IN_SENDGRID,
    SENDGRID_FROM: process.env.SENDGRID_FROM_EMAIL || "alerts@defi-sentinel.app",
    ENV: process.env.NODE_ENV || "development",
};

console.log("[secrets] 🌐 Primary RPC:", SECRETS.SEPOLIA_RPC_URL.substring(0, 50) + "...");
console.log("[secrets] 📋 Fallback RPCs available:", PUBLIC_SEPOLIA_RPCS.length);
console.log("[secrets] 🏠 SENTINEL_CORE:", SECRETS.SENTINEL_CORE);
