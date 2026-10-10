import { NextResponse } from 'next/server';
import { MODULES_DATA } from '@/lib/data/mockData';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: MODULES_DATA,
    meta: {
      total: MODULES_DATA.length,
    },
  });
}
