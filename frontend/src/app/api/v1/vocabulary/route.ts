import { NextRequest, NextResponse } from 'next/server';
import { VOCABULARY_WORDS } from '@/lib/data/mockData';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q')?.toLowerCase();
  const collection = searchParams.get('collection');

  let results = [...VOCABULARY_WORDS];

  if (collection && collection !== 'all') {
    results = results.filter((w) => w.collectionId === collection);
  }

  if (q) {
    results = results.filter(
      (w) =>
        w.lemma.toLowerCase().includes(q) ||
        w.senses.some(
          (s) =>
            s.definition.toLowerCase().includes(q) ||
            s.viDefinition.toLowerCase().includes(q)
        )
    );
  }

  return NextResponse.json({
    success: true,
    data: results,
    meta: {
      total: results.length,
      limit: 50,
      page: 1,
    },
  });
}
