import type { Metadata } from 'next'
import { DM_Serif_Display, DM_Mono } from 'next/font/google'
import './globals.css'

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
  description: 'UX design student at SCAD.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add('js-ready')` }} />
      </head>
      <body style={{ backgroundColor: '#0d0d0d', color: '#f5f2ed' }}>{children}</body>
    </html>
  )
}
