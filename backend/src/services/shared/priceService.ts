

import axios from "axios";

// ─── Same interface as original — "pair" field kept identical ─────────────────

export interface PriceData {
    pair: string;           // e.g. "ETH/USD"  ← same as original
    price: number;
    decimals: number;
    timestamp: number;
    roundId: string;
    source: "blockchain" | "fallback" | "coingecko" | "binance" | "cached";
    rpc?: string;
}

// ─── CoinGecko config ────────────────────────────────────────────────────────

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const BINANCE_BASE   = "https://api.binance.com/api/v3";

const COINGECKO_IDS: Record<string, string> = {
    "ETH/USD":  "ethereum",
    "WBTC/USD": "wrapped-bitcoin",
    "LINK/USD": "chainlink",
    "USDC/USD": "usd-coin",
    "DAI/USD":  "dai",
    "AAVE/USD": "aave",
    "UNI/USD":  "uniswap",
    "MATIC/USD":"matic-network",
};

const BINANCE_PAIRS: Record<string, string> = {
    "ETH/USD":  "ETHUSDT",
    "WBTC/USD": "BTCUSDT",
    "LINK/USD": "LINKUSDT",
    "AAVE/USD": "AAVEUSDT",
    "UNI/USD":  "UNIUSDT",
};

const STABLECOINS = new Set(["USDC/USD", "DAI/USD", "USDT/USD", "BUSD/USD"]);

// ─── Batch fetch from CoinGecko (one request for all symbols) ─────────────────

async function batchFetchCoinGecko(pairs: string[]): Promise<Map<string, number>> {
    const results = new Map<string, number>();
    const knownPairs = pairs.filter(p => COINGECKO_IDS[p]);
    if (knownPairs.length === 0) return results;

    const ids = [...new Set(knownPairs.map(p => COINGECKO_IDS[p]))].join(",");

    try {
        const res = await axios.get(`${COINGECKO_BASE}/simple/price`, {
            params: { ids, vs_currencies: "usd", include_24hr_change: "true" },
            timeout: 8000,
            headers: { "Accept": "application/json" },
        });

        for (const pair of knownPairs) {
            const id    = COINGECKO_IDS[pair];
            const entry = res.data[id];
            if (entry?.usd) results.set(pair, entry.usd);
        }
        console.log(`[PriceService] ✅ CoinGecko returned ${results.size} prices`);
    } catch (err: any) {
        console.warn(`[PriceService] ⚠️  CoinGecko failed: ${err.message}`);
    }
    return results;
}

async function fetchBinancePrice(pair: string): Promise<number | null> {
    const binancePair = BINANCE_PAIRS[pair];
    if (!binancePair) return null;
    try {
        const res = await axios.get(`${BINANCE_BASE}/ticker/price`, {
            params: { symbol: binancePair },
            timeout: 6000,
        });
        return parseFloat(res.data.price);
    } catch {
        return null;
    }
}

// ─── PriceService class — SAME API as original ───────────────────────────────

export class PriceService {
    private cache: Map<string, { data: PriceData; expiresAt: number }> = new Map();
    private CACHE_TTL = 30_000; // 30 seconds — same as original

    async getLatestPrice(pair: string): Promise<PriceData> {
        // Return cached if fresh
        const cached = this.cache.get(pair);
        if (cached && Date.now() < cached.expiresAt) {
            return cached.data;
        }

        // Stablecoins never change
        if (STABLECOINS.has(pair)) {
            const data: PriceData = {
                pair,
                price:     1.0,
                decimals:  8,
                timestamp: Math.floor(Date.now() / 1000),
                roundId:   "1",
                source:    "coingecko",
            };
            this.cache.set(pair, { data, expiresAt: Date.now() + this.CACHE_TTL });
            return data;
        }

        // Try CoinGecko
        const cgPrices = await batchFetchCoinGecko([pair]);
        if (cgPrices.has(pair)) {
            const data: PriceData = {
                pair,
                price:     cgPrices.get(pair)!,
                decimals:  8,
                timestamp: Math.floor(Date.now() / 1000),
                roundId:   Date.now().toString(),
                source:    "coingecko",
            };
            this.cache.set(pair, { data, expiresAt: Date.now() + this.CACHE_TTL });
            console.log(`[PriceService] ✅ ${pair} = $${data.price.toFixed(2)} (coingecko)`);
            return data;
        }

        // Try Binance as backup
        const binancePrice = await fetchBinancePrice(pair);
        if (binancePrice) {
            const data: PriceData = {
                pair,
                price:     binancePrice,
                decimals:  8,
                timestamp: Math.floor(Date.now() / 1000),
                roundId:   Date.now().toString(),
                source:    "binance",
            };
            this.cache.set(pair, { data, expiresAt: Date.now() + this.CACHE_TTL });
            console.log(`[PriceService] ✅ ${pair} = $${data.price.toFixed(2)} (binance)`);
            return data;
        }

        // Use stale cache if we have it (better than fake numbers)
        const stale = this.cache.get(pair);
        if (stale) {
            console.warn(`[PriceService] ⚠️  Using stale cache for ${pair}`);
            return { ...stale.data, source: "cached" };
        }

        // Absolute last resort — real-ish fallback numbers, not random mock
        console.error(`[PriceService] ❌ All sources failed for ${pair}`);
        const FALLBACK_PRICES: Record<string, number> = {
            "ETH/USD":  2800,
            "WBTC/USD": 85000,
            "LINK/USD": 18,
            "AAVE/USD": 200,
            "UNI/USD":  8,
            "USDC/USD": 1.00,
            "DAI/USD":  1.00,
        };
        return {
            pair,
            price:     FALLBACK_PRICES[pair] || 0,
            decimals:  8,
            timestamp: Math.floor(Date.now() / 1000),
            roundId:   "0",
            source:    "fallback",
        };
    }

    // ── Same as original ──────────────────────────────────────────────────────

    async getAllPrices(): Promise<Record<string, PriceData>> {
        const pairs = [
            "ETH/USD", "USDC/USD", "DAI/USD",
            "LINK/USD", "WBTC/USD", "AAVE/USD",
        ];

        // Batch fetch all at once from CoinGecko (1 API call, not 6)
        const cgPrices = await batchFetchCoinGecko(pairs);
        cgPrices.forEach((price, pair) => {
            const data: PriceData = {
                pair, price, decimals: 8,
                timestamp: Math.floor(Date.now() / 1000),
                roundId: Date.now().toString(),
                source: "coingecko",
            };
            this.cache.set(pair, { data, expiresAt: Date.now() + this.CACHE_TTL });
        });

        const results: Record<string, PriceData> = {};
        await Promise.all(pairs.map(async (pair) => {
            results[pair] = await this.getLatestPrice(pair);
        }));
        return results;
    }

    monitorPrice(
        pair: string,
        thresholdPercent: number,
        callback: (data: PriceData) => void
    ): NodeJS.Timer {
        let lastPrice: number | null = null;
        return setInterval(async () => {
            try {
                const data = await this.getLatestPrice(pair);
                if (lastPrice !== null) {
                    const changePercent = Math.abs((data.price - lastPrice) / lastPrice) * 100;
                    if (changePercent >= thresholdPercent) callback(data);
                }
                lastPrice = data.price;
            } catch (err) {
                console.error(`[PriceService] Monitor error for ${pair}:`, err);
            }
        }, 30_000) as unknown as NodeJS.Timer;
    }
}

// ── Same singleton export as original ────────────────────────────────────────
export const priceService = new PriceService();
