import './globals.css'
import { Inter } from 'next/font/google'
import { Metadata, Viewport } from 'next'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { Background } from '@/components/ui/Background'

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '800', '900'] })

export const metadata: Metadata = {
  title: 'Study with HERO',
  description: 'Learn words. Understand context. Master English.',
}

export const viewport: Viewport = {
  themeColor: '#0a0e1a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.className} antialiased`}>
      <body className="bg-dark-950 text-dark-100 min-h-screen selection:bg-brand-500/30 selection:text-brand-100">
        <AuthProvider>
          <Background />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
