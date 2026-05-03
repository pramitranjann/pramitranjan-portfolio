import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { DM_Serif_Display, DM_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { MotionSettingsProvider } from '@/components/MotionSettingsProvider'
import { SiteCopyProvider } from '@/components/SiteCopyProvider'
import { SoundRouteListener } from '@/components/SoundRouteListener'
import { ScrollToTopOnRouteChange } from '@/components/ScrollToTopOnRouteChange'
import { getSiteContent } from '@/lib/site-content'

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
  display: 'swap',
})

const dmMono = DM_Mono({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.pramitranjan.com'),
  title: 'Pramit Ranjan',
  description: 'UX designer and photographer. Portfolio of case studies, creative work, and photography.',
  openGraph: {
    title: 'Pramit Ranjan',
    description: 'UX designer and photographer.',
    url: 'https://www.pramitranjan.com',
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
  const layout = content.design.layout
  const typography = content.design.typography
  const navigation = content.design.navigation
  const selectedDisplayFont =
    typography.displayFont === 'clash-display'
      ? '"Clash Display", var(--font-dm-serif), serif'
      : 'var(--font-dm-serif), serif'
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
    '--layout-page-gutter': layout.pageGutter,
    '--layout-hero-padding-y': layout.heroPaddingY,
    '--layout-section-padding-y': layout.sectionPaddingY,
    '--layout-compact-section-padding-y': layout.compactSectionPaddingY,
    '--layout-card-gap': layout.cardGap,
    '--layout-nav-padding-y': layout.navPaddingY,
    '--layout-footer-padding-y': layout.footerPaddingY,
    '--text-display': typography.displaySize,
    '--text-hero': typography.heroSize,
    '--text-h1': typography.h1Size,
    '--text-h2': typography.h2Size,
    '--text-h3': typography.h3Size,
    '--text-eyebrow': typography.eyebrowSize,
    '--text-body-lg': typography.bodyLgSize,
    '--text-body': typography.bodySize,
    '--text-meta': typography.metaSize,
    '--font-serif': selectedDisplayFont,
    '--font-weight-serif': typography.serifWeight,
    '--font-weight-mono': typography.monoWeight,
    '--color-heading': typography.headingColor,
    '--color-body': typography.bodyColor,
    '--color-label': typography.labelColor,
    '--color-red': typography.accentColor,
    '--nav-background': navigation.navBackground,
    '--nav-border-color': navigation.navBorderColor,
    '--nav-logo-color': navigation.navLogoColor,
    '--nav-logo-size': navigation.navLogoSize,
    '--nav-link-color': navigation.navLinkColor,
    '--nav-link-hover-color': navigation.navLinkHoverColor,
    '--nav-link-active-color': navigation.navLinkActiveColor,
    '--nav-dot-color': navigation.navDotColor,
    '--nav-link-size': navigation.navLinkSize,
    '--back-link-color': navigation.backLinkColor,
    '--reading-track-color': navigation.readingTrackColor,
    '--reading-fill-color': navigation.readingFillColor,
    '--footer-border-color': navigation.footerBorderColor,
    '--footer-text-color': navigation.footerTextColor,
    '--footer-mark-color': navigation.footerMarkColor,
    '--social-link-color': navigation.socialLinkColor,
    '--social-link-underline-color': navigation.socialLinkUnderlineColor,
  } as CSSProperties

  return (
    <html lang="en" className={`${dmSerif.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap" />
<script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add('js-ready')` }} />
      </head>
      <body style={{ backgroundColor: '#0d0d0d', color: 'rgb(245, 242, 237)', ...motionCssVars }}>
        <SoundRouteListener />
        <ScrollToTopOnRouteChange />
        <MotionSettingsProvider settings={motion}>
          <SiteCopyProvider copy={content.copy}>
            {children}
          </SiteCopyProvider>
        </MotionSettingsProvider>
        <Analytics />
      </body>
    </html>
  )
}
