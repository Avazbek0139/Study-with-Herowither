import './globals.css'
import { Inter } from 'next/font/google'
import { Metadata, Viewport } from 'next'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { Background } from '@/components/ui/Background'

const inter = Inter({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '800', '900'] })

export const metadata: Metadata = {
  title: 'Study with HERO - Learn English Vocabulary & Context',
  description: "Ingliz tili so'zlarini kontekst orqali mukammal o'rganing va testlar orqali bilimingizni sinang.",
  metadataBase: new URL('https://studywithhero.com'),
  openGraph: {
    title: 'Study with HERO',
    description: "Ingliz tili so'zlarini kontekst orqali mukammal o'rganing va testlar orqali bilimingizni sinang.",
    url: 'https://studywithhero.com',
    siteName: 'Study with HERO',
    locale: 'uz_UZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Study with HERO',
    description: "Learn words. Understand context. Master English.",
  },
  icons: {
    icon: '/favicon.svg',
  },
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
