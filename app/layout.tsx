import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { DM_Serif_Display, DM_Mono } from 'next/font/google'
import './globals.css'
import { MotionSettingsProvider } from '@/components/MotionSettingsProvider'
import { SiteCopyProvider } from '@/components/SiteCopyProvider'
import { SoundRouteListener } from '@/components/SoundRouteListener'
import { ScrollToTopOnRouteChange } from '@/components/ScrollToTopOnRouteChange'
import { getSiteContent } from '@/lib/site-content'

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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent()
  const motion = content.design.motion
  const motionCssVars = {
    '--motion-page-reveal-distance': `${motion.pageRevealDistance}px`,
    '--motion-page-reveal-duration': `${motion.pageRevealDuration}s`,
    '--motion-simple-reveal-distance': `${motion.simpleRevealDistance}px`,
    '--motion-simple-reveal-duration': `${motion.simpleRevealDuration}s`,
    '--motion-eyebrow-offset': `${motion.eyebrowOffset}px`,
    '--motion-eyebrow-line-duration': `${motion.eyebrowLineDuration}s`,
    '--motion-eyebrow-label-duration': `${motion.eyebrowLabelDuration}s`,
    '--motion-eyebrow-label-delay': `${motion.eyebrowLabelDelay}s`,
    '--audio-interaction-volume': `${content.design.audio.interactionVolume}`,
  } as CSSProperties

  return (
    <html lang="en" className={`${dmSerif.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <head>
<script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add('js-ready')` }} />
      </head>
      <body style={{ backgroundColor: '#0d0d0d', color: '#f5f2ed', ...motionCssVars }}>
        <SoundRouteListener />
        <ScrollToTopOnRouteChange />
        <MotionSettingsProvider settings={motion}>
          <SiteCopyProvider copy={content.copy}>
            {children}
          </SiteCopyProvider>
        </MotionSettingsProvider>
      </body>
    </html>
  )
}
