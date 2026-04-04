import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Movie Night',
    short_name: 'Movie Night',
    description: 'Family movie and series tracker',
    start_url: '/',
    display: 'standalone',
    background_color: '#f9fafb',
    theme_color: '#4f46e5',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
