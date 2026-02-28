const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function fetchHealth() {
    const res = await fetch(`${BACKEND_URL}/api/health`);
    return res.json();
}

export async function fetchPrices() {
    const res = await fetch(`${BACKEND_URL}/api/status/prices`);
    return res.json();
}

export async function fetchIncidents() {
    const res = await fetch(`${BACKEND_URL}/api/status/incidents`);
    return res.json();
}

export async function fetchUserPosition(address: string) {
    const res = await fetch(`${BACKEND_URL}/api/user/position/${address}`);
    return res.json();
}
