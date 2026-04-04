import { NextRequest, NextResponse } from 'next/server'
import { getTMDBDetails } from '@/lib/tmdb'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const tmdbId = parseInt(searchParams.get('tmdb_id') ?? '', 10)
  const type = searchParams.get('type')

  if (!tmdbId || isNaN(tmdbId) || (type !== 'movie' && type !== 'series')) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  }

  const details = await getTMDBDetails(tmdbId, type)
  return NextResponse.json(details)
}
