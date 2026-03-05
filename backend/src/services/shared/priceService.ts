import { ethers } from "ethers";
import { CHAINLINK_PRICE_FEED_ABI, CONTRACT_ADDRESSES } from "../../config/contracts.js";
import { RPC_URLS } from "../../config/secrets.js";

export interface PriceData {
    pair: string;
    price: number;
    decimals: number;
    timestamp: number;
    roundId: string;
    source: "blockchain" | "fallback";
    rpc?: string;
}

// ✅ Only include feeds that have a valid address (some may not exist on Sepolia)
const ALL_PRICE_FEEDS: Record<string, string> = {
    "ETH/USD": CONTRACT_ADDRESSES.CHAINLINK_ETH_USD,
    "USDC/USD": CONTRACT_ADDRESSES.CHAINLINK_USDC_USD,
    "DAI/USD": CONTRACT_ADDRESSES.CHAINLINK_DAI_USD,
    "LINK/USD": CONTRACT_ADDRESSES.CHAINLINK_LINK_USD,
    "WBTC/USD": CONTRACT_ADDRESSES.CHAINLINK_WBTC_USD,
    "AAVE/USD": CONTRACT_ADDRESSES.CHAINLINK_AAVE_USD,
};
const PRICE_FEEDS: Record<string, string> = Object.fromEntries(
    Object.entries(ALL_PRICE_FEEDS).filter(([, addr]) => addr && addr.length === 42)
);

// ✅ Fetch with timeout — if an RPC is slow/down, give up fast and try the next one
async function fetchWithTimeout<T>(promise: Promise<T>, ms = 8000): Promise<T> {
    const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    );
    return Promise.race([promise, timeout]);
}

// ✅ Try each RPC in order until one works — returns real blockchain price data
async function fetchPriceFeedWithFallback(pair: string, feedAddress: string): Promise<PriceData> {
    let lastError = "";
    for (const rpcUrl of RPC_URLS) {
        try {
            const provider = new ethers.JsonRpcProvider(rpcUrl);
            const feed = new ethers.Contract(feedAddress, CHAINLINK_PRICE_FEED_ABI, provider);

            const [roundId, answer, , updatedAt] = await fetchWithTimeout(feed.latestRoundData(), 8000);
            const decimals = Number(await fetchWithTimeout(feed.decimals(), 5000));
            const price = Number(answer) / Math.pow(10, decimals);

            console.log(`[PriceService] ✅ ${pair} = $${price.toFixed(2)} (via ${rpcUrl.substring(0, 40)})`);
            return {
                pair,
                price,
                decimals,
                timestamp: Number(updatedAt),
                roundId: roundId.toString(),
                source: "blockchain",
                rpc: rpcUrl.substring(0, 40),
            };
        } catch (err: any) {
            lastError = err.message;
            console.warn(`[PriceService] ⚠️  RPC ${rpcUrl.substring(0, 40)} failed for ${pair}: ${err.message}`);
        }
    }
    throw new Error(`All RPCs failed for ${pair}. Last error: ${lastError}`);
}

export class PriceService {
    private cache: Map<string, { data: PriceData; expiresAt: number }> = new Map();
    private CACHE_TTL = 30_000; // 30 seconds

    async getLatestPrice(pair: string): Promise<PriceData> {
        // Check cache first
        const cached = this.cache.get(pair);
        if (cached && Date.now() < cached.expiresAt) {
            return cached.data;
        }

        const feedAddress = PRICE_FEEDS[pair];
        if (!feedAddress) throw new Error(`Unknown price pair: ${pair}`);

        try {
            const data = await fetchPriceFeedWithFallback(pair, feedAddress);
            this.cache.set(pair, { data, expiresAt: Date.now() + this.CACHE_TTL });
            return data;
        } catch (err: any) {
            console.error(`[PriceService] ❌ ALL RPCs failed for ${pair}: ${err.message}`);
            // Only fall back to static prices if truly everything failed
            const STATIC_PRICES: Record<string, number> = {
                "ETH/USD": 2845.42,
                "USDC/USD": 1.00,
                "DAI/USD": 1.001,
                "LINK/USD": 18.24,
                "WBTC/USD": 62500.00,
                "AAVE/USD": 115.30,
            };
            return {
                pair,
                price: STATIC_PRICES[pair] || 0,
                decimals: 8,
                timestamp: Math.floor(Date.now() / 1000),
                roundId: "0",
                source: "fallback",
            };
        }
    }

    async getAllPrices(): Promise<Record<string, PriceData>> {
        const results: Record<string, PriceData> = {};
        await Promise.all(
            Object.keys(PRICE_FEEDS).map(async (pair) => {
                try {
                    results[pair] = await this.getLatestPrice(pair);
                } catch (err) {
                    console.error(`[PriceService] Failed to fetch price for ${pair}:`, err);
                }
            })
        );
        return results;
    }

    monitorPrice(pair: string, thresholdPercent: number, callback: (data: PriceData) => void): NodeJS.Timer {
        let lastPrice: number | null = null;
        return setInterval(async () => {
            try {
                const data = await this.getLatestPrice(pair);
                if (lastPrice !== null) {
                    const changePercent = Math.abs((data.price - lastPrice) / lastPrice) * 100;
                    if (changePercent >= thresholdPercent) {
                        callback(data);
                    }
                }
                lastPrice = data.price;
            } catch (err) {
                console.error(`[PriceService] Monitor error for ${pair}:`, err);
            }
        }, 30_000) as unknown as NodeJS.Timer;
    }
}

export const priceService = new PriceService();
