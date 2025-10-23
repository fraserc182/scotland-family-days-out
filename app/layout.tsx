import type { Metadata, Viewport } from 'next'
import '../src/index.css'

export const metadata: Metadata = {
  title: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland Days Out - Family Activities & Days Out',
  description: 'Discover amazing activities and days out for the whole family across Scotland. Find free and paid activities, beaches, parks, museums, and more.',
  keywords: ['Scotland', 'family activities', 'days out', 'things to do', 'family fun'],
  authors: [{ name: 'Fraser Clark' }],
  creator: 'Fraser Clark',
  publisher: 'Scotland Days Out',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://scotland-days-out.com',
    siteName: 'Scotland Days Out',
    title: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland Days Out - Family Activities & Days Out',
    description: 'Discover amazing activities and days out for the whole family across Scotland.',
    images: [
      {
        url: 'https://scotland-days-out.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Scotland Days Out',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland Days Out',
    description: 'Discover amazing activities and days out for the whole family across Scotland.',
    images: ['https://scotland-days-out.com/og-image.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0369a1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="canonical" href="https://scotland-days-out.com" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>{children}</body>
    </html>
  )
}

