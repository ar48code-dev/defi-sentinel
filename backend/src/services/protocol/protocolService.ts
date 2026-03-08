import { ethers } from "ethers";
import { CONTRACT_ADDRESSES } from "../../config/contracts";

const SENTINEL_CORE_ABI = [
    "function updateThreatLevel(address protocol, uint8 level) external",
    "function registerProtocol(address protocol, string name) external",
    "function isProtocolRegistered(address protocol) external view returns (bool)",
    "function protocols(address) external view returns (string name, uint8 threatLevel, address admin, bool isRegistered)",
    "event ThreatLevelUpdated(address indexed protocol, uint8 level)",
];

const FORENSICS_LOGGER_ABI = [
    "function logProtocolAlert(address protocol, string description, bytes32 dataHash, uint8 threatLevel) external",
    "function logEmergencyAction(address protocol, string description, bytes32 dataHash, uint8 threatLevel) external",
    "function getIncidentCount() external view returns (uint256)",
    "function getRecentIncidents(uint256 count) external view returns (tuple(uint256 id, uint256 timestamp, address target, string description, bytes32 dataHash, uint8 threatLevel, uint8 incidentType)[])",
];

// ✅ Known protocol addresses on Sepolia for name resolution
const KNOWN_PROTOCOLS: Record<string, string> = {
    "0xa9D6084EE79142526121899B59D0b774A7F583d1": "Sentinel Core",
    "0x83D71737B6499B6f9C0e68F47f9B7a08d2D3AC91": "Forensics Logger",
    "0x3b29D86d5f9F755a17BfA04eD62ab01316C1F0cb": "Auto Protector",
    "0x2f3B8aC8B0d513acB2bb90775238616d018335D0": "Sentinel Vault",
};

export interface ProtocolMetrics {
    address: string;
    name: string;
    threatLevel: number;
    tvlUSD: number;
    borrowRate: number;
    anomalyScore: number;
    lastChecked: number;
}

export class ProtocolService {
    private provider: ethers.JsonRpcProvider;
    private signer: ethers.Wallet;
    private sentinel: ethers.Contract;
    private logger: ethers.Contract;

    constructor() {
        this.provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

        let privateKey = process.env.PRIVATE_KEY || "";
        if (privateKey && !privateKey.startsWith("0x") && privateKey.length === 64) {
            privateKey = "0x" + privateKey;
        }
        const isValidKey =
            privateKey &&
            privateKey !== "YOUR_PRIVATE_KEY_HERE" &&
            privateKey.length === 66 &&
            privateKey.startsWith("0x");

        const coreAddress = CONTRACT_ADDRESSES.SENTINEL_CORE;
        const loggerAddress = CONTRACT_ADDRESSES.FORENSICS_LOGGER;
        const isValidAddress = (addr: string) =>
            addr && addr.startsWith("0x") && addr.length === 42;

        if (isValidKey && isValidAddress(coreAddress) && isValidAddress(loggerAddress)) {
            this.signer = new ethers.Wallet(privateKey, this.provider);
            this.sentinel = new ethers.Contract(coreAddress, SENTINEL_CORE_ABI, this.signer);
            this.logger = new ethers.Contract(loggerAddress, FORENSICS_LOGGER_ABI, this.signer);
            console.log("[ProtocolService] ✅ Running in read-write mode");
        } else if (isValidAddress(coreAddress) && isValidAddress(loggerAddress)) {
            console.warn("[ProtocolService] ⚠️ No private key — read-only mode");
            this.signer = null as any;
            this.sentinel = new ethers.Contract(coreAddress, SENTINEL_CORE_ABI, this.provider);
            this.logger = new ethers.Contract(loggerAddress, FORENSICS_LOGGER_ABI, this.provider);
        } else {
            console.warn("[ProtocolService] ❌ Contract addresses missing — service disabled");
            this.signer = null as any;
            this.sentinel = null as any;
            this.logger = null as any;
        }
    }

    async getProtocolInfo(address: string): Promise<{ name: string; threatLevel: number; isRegistered: boolean }> {
        try {
            if (!this.sentinel) throw new Error("Sentinel contract not initialized");
            const result = await this.sentinel.protocols(address);
            return {
                name: result.name || KNOWN_PROTOCOLS[address] || address,
                threatLevel: Number(result.threatLevel),
                isRegistered: result.isRegistered,
            };
        } catch {
            return { name: KNOWN_PROTOCOLS[address] || address, threatLevel: 0, isRegistered: false };
        }
    }

    async updateThreatLevel(protocol: string, level: number): Promise<string> {
        if (!this.sentinel || !this.signer) throw new Error("Write access not available");
        const tx = await this.sentinel.updateThreatLevel(protocol, level);
        await tx.wait();
        return tx.hash;
    }

    async logAlert(protocol: string, description: string, threatLevel: number): Promise<void> {
        if (!this.logger || !this.signer) throw new Error("Write access not available");
        const dataHash = ethers.keccak256(ethers.toUtf8Bytes(description + Date.now()));
        const tx = await this.logger.logProtocolAlert(protocol, description, dataHash, threatLevel);
        await tx.wait();
    }

    async getRecentIncidents(count: number = 10): Promise<any[]> {
        // ✅ If contract not initialized — return empty array, never mock data
        if (!this.logger) {
            console.warn("[ProtocolService] Logger not initialized — returning empty incidents");
            return [];
        }

        try {
            const raw = await this.logger.getRecentIncidents(count);

            // ✅ No incidents on chain yet — return empty, not mocks
            if (!raw || raw.length === 0) {
                console.log("[ProtocolService] No on-chain incidents found");
                return [];
            }

            return raw.map((i: any) => ({
                id: String(Number(i.id)),
                timestamp: Number(i.timestamp) * 1000,
                target: i.target,
                protocol: KNOWN_PROTOCOLS[i.target] || i.target,
                description: i.description,
                threatLevel: this.mapThreatLevel(Number(i.threatLevel)),
                status: "active",
                source: "blockchain", // ✅ Always blockchain, never fallback
            }));
        } catch (err: any) {
            // ✅ On RPC error — return empty array, not mock data
            console.error("[ProtocolService] getRecentIncidents failed:", err.message);
            return [];
        }
    }

    private mapThreatLevel(level: number): string {
        if (level >= 4) return "critical";
        if (level >= 3) return "high";
        if (level >= 2) return "medium";
        return "low";
    }

    calculateAnomalyScore(current: number, historical: number[]): number {
        if (historical.length === 0) return 0;
        const mean = historical.reduce((a, b) => a + b, 0) / historical.length;
        const std = Math.sqrt(
            historical.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / historical.length
        );
        if (std === 0) return 0;
        return Math.min(100, Math.abs((current - mean) / std) * 25);
    }
}

export const protocolService = new ProtocolService();
