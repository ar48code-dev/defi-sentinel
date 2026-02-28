// ✅ Always use relative /api/* URLs in the browser.
// Next.js rewrites proxy them server-side to http://localhost:3001/api/* — no CORS issues ever.
// For server-side (SSR) calls, we use the full backend URL via env var.
const isBrowser = typeof window !== "undefined";
const BACKEND_URL = isBrowser
    ? ""  // relative URL — Next.js proxy handles it
    : (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001");

async function fetchWithTimeout(url: string, timeout = 8000): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response;
    } catch (err) {
        clearTimeout(id);
        throw err;
    }
}

export async function fetchHealth() {
    const res = await fetchWithTimeout(`${BACKEND_URL}/api/health`);
    return res.json();
}

export async function fetchPrices() {
    // In browser → /api/status/prices → proxied by Next.js to http://localhost:3001/api/status/prices
    const res = await fetchWithTimeout(`${BACKEND_URL}/api/status/prices`);
    return res.json();
}

export async function fetchIncidents() {
    const res = await fetchWithTimeout(`${BACKEND_URL}/api/status/incidents`);
    return res.json();
}

export async function fetchUserPosition(address: string) {
    const res = await fetchWithTimeout(`${BACKEND_URL}/api/user/position/${address}`);
    return res.json();
}

export const backendApi = {
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001",
};
