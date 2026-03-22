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
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%230d0d0d'/><text x='16' y='22' text-anchor='middle' font-family='monospace' font-size='13' font-weight='500' letter-spacing='1' fill='%23FF3120'>PR</text></svg>" />
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add('js-ready')` }} />
      </head>
      <body style={{ backgroundColor: '#0d0d0d', color: '#f5f2ed' }}>{children}</body>
    </html>
  )
}
