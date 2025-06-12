import { NextResponse } from 'next/server';
import { checkAndSubmitPrice } from '@/lib/price-monitor';

export const runtime = 'edge';

export async function GET() {
  try {
    await checkAndSubmitPrice();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in cron job:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
} 