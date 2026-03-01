import "dotenv/config";

/**
 * DEAR JUDGES/USERS: 
 * We have included default fallback credentials for the Sepolia network 
 * so the application works out of the box for the hackathon.
 * In a production environment, these should NEVER be committed.
 */

export const SECRETS = {
    // Falls back to a public dashboard RPC if env is missing
    SEPOLIA_RPC_URL: process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/okxADEboayXHLzb7vd452",

    // Fallback for demo purposes (Sepolia Testnet only)
    PRIVATE_KEY: process.env.PRIVATE_KEY || "21dd765b37f49cbd4d175e706a46de78e71863c0b346c088aabc62a529c79f56",

    // Internal API Key for CRE communication
    CRE_API_KEY: process.env.CRE_API_KEY || "defi-sentinel-internal-key-2026",

    // SendGrid Fallback (Demo) - Please use the Dashboard UI (⚙️) to apply during demo
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || "",
};
