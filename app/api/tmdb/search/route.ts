import { NextRequest, NextResponse } from 'next/server'
import { searchTMDB } from '@/lib/tmdb'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const query = typeof body?.query === 'string' ? body.query.trim() : ''

  if (!query || query.length > 200) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 400 })
  }

  const results = await searchTMDB(query)
  return NextResponse.json(results)
}
