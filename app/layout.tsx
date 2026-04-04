import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import IdentityManager from '@/components/IdentityManager'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Movie Night',
  description: 'Family movie and series tracker',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Movie Night',
  },
}

export const viewport: Viewport = {
  themeColor: '#4f46e5',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <IdentityManager />
        {/* pt-14 offsets the fixed header */}
        <main className="flex-1 pt-14">{children}</main>
        <Script id="register-sw" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js');
          }
        `}</Script>
      </body>
    </html>
  )
}
