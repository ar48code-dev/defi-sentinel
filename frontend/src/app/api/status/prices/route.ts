import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export async function GET() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/status/prices`, { cache: 'no-store' });
        const data = await response.json();
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ success: false, error: `Backend unreachable: ${e.message}` }, { status: 503 });
    }
}
