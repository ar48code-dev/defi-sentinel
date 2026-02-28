import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        const response = await fetch(`${BACKEND_URL}/api/status/prices`);
        const data = await response.json();
        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({
            success: false,
            error: "Backend prices unavailable"
        });
    }
}
