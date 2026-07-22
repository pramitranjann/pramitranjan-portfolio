import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { DM_Serif_Display, DM_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import { Agentation } from 'agentation'
import './globals.css'
import { JsonLd } from '@/components/JsonLd'
import { MotionSettingsProvider } from '@/components/MotionSettingsProvider'
import { SiteCopyProvider } from '@/components/SiteCopyProvider'
import { SoundRouteListener } from '@/components/SoundRouteListener'
import { ScrollToTopOnRouteChange } from '@/components/ScrollToTopOnRouteChange'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  HOME_TITLE,
  PERSON_KEYWORDS,
  SITE_NAME,
  SITE_URL,
  buildPersonJsonLd,
  buildWebSiteJsonLd,
  getEmailFromLinks,
  getSameAsLinks,
} from '@/lib/seo'
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

const clashDisplay = localFont({
  src: './fonts/clash-display/ClashDisplay-Variable.woff2',
  weight: '200 700',
  variable: '--font-clash-display',
  display: 'swap',
})

// Reading typeface for prose. DM Mono stays on labels, eyebrows, meta and tags.
const cabinetGrotesk = localFont({
  src: [
    { path: './fonts/cabinet-grotesk/CabinetGrotesk-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/cabinet-grotesk/CabinetGrotesk-Medium.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-cabinet-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: HOME_TITLE,
    template: '%s | Pramit Ranjan',
  },
  description: DEFAULT_DESCRIPTION,
  keywords: PERSON_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: HOME_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: HOME_TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent()
  const motion = content.design.motion
  const layout = content.design.layout
  const typography = content.design.typography
  const navigation = content.design.navigation
  const contactLinks = [...content.copy.home.contactLinks, ...content.aboutPage.contactLinks]
  const sameAsLinks = getSameAsLinks(contactLinks)
  const email = getEmailFromLinks(contactLinks)
  const selectedDisplayFont =
    typography.displayFont === 'clash-display'
      ? 'var(--font-clash-display), var(--font-dm-serif), serif'
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
    <html
      lang="en"
      className={`${dmSerif.variable} ${dmMono.variable} ${clashDisplay.variable} ${cabinetGrotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add('js-ready')` }} />
        <JsonLd
          data={[
            buildWebSiteJsonLd(DEFAULT_DESCRIPTION),
            buildPersonJsonLd({
              description: content.aboutPage.heroBody || DEFAULT_DESCRIPTION,
              sameAs: sameAsLinks,
              email,
            }),
          ]}
        />
      </head>
      <body style={{ backgroundColor: '#0d0d0d', color: 'rgb(245, 242, 237)', ...motionCssVars }}>
        <SoundRouteListener />
        <ScrollToTopOnRouteChange />
        <MotionSettingsProvider settings={motion}>
          <SiteCopyProvider copy={content.copy} sitePages={content.sitePages}>
            {children}
          </SiteCopyProvider>
        </MotionSettingsProvider>
        <Analytics />
        {process.env.NODE_ENV === 'development' && <Agentation />}
      </body>
    </html>
  )
}
