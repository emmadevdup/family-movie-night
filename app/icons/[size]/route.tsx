import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ size: string }> }) {
  const { size: sizeParam } = await params
  const dim = sizeParam === 'icon-512.png' ? 512 : 192

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#4f46e5',
          borderRadius: String(Math.round(dim * 0.18)) + 'px',
          fontSize: Math.round(dim * 0.6),
        }}
      >
        🎬
      </div>
    ),
    { width: dim, height: dim },
  )
}
