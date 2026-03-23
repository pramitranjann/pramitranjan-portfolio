import type { Metadata } from 'next'
import { DM_Serif_Display, DM_Mono } from 'next/font/google'
import './globals.css'
import { SoundRouteListener } from '@/components/SoundRouteListener'

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const dmMono = DM_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Pramit Ranjan',
  description: 'UX designer and photographer. Portfolio of case studies, creative work, and photography.',
  openGraph: {
    title: 'Pramit Ranjan',
    description: 'UX designer and photographer.',
    url: 'https://pramitranjan.com',
    siteName: 'Pramit Ranjan',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pramit Ranjan',
    description: 'UX designer and photographer.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <head>
<script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add('js-ready')` }} />
      </head>
      <body style={{ backgroundColor: '#0d0d0d', color: '#f5f2ed' }}>
        <SoundRouteListener />
        {children}
      </body>
    </html>
  )
}
