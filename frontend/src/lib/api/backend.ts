const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

async function fetchWithTimeout(url: string, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
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
