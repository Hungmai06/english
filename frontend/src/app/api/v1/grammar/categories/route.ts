import { NextResponse } from 'next/server';
import { GRAMMAR_CATEGORIES } from '@/lib/data/mockData';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: GRAMMAR_CATEGORIES,
    meta: {
      total: GRAMMAR_CATEGORIES.length,
    },
  });
}
