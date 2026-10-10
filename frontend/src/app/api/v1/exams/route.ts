import { NextResponse } from 'next/server';
import { EXAMS_DATA } from '@/lib/data/mockData';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: EXAMS_DATA,
    meta: {
      total: EXAMS_DATA.length,
    },
  });
}
