import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import IdentityManager from '@/components/IdentityManager'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Movie Night',
  description: 'Family movie and series tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50">
        <IdentityManager />
        {/* pt-14 offsets the fixed header */}
        <main className="flex-1 pt-14">{children}</main>
      </body>
    </html>
  )
}
