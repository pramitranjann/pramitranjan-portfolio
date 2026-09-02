import type { NextConfig } from "next";

const projectRoot = __dirname

// Compatibility bridge only. The embedded Life application has moved to its
// own deployment; old browser and native-client URLs continue to resolve.
const lifeWebOrigin = 'https://life.pramitranjan.com'

// Vercel Hobby does not expose UTM reporting. Keep campaign attribution in
// the pathname instead: the visitor sees the normal homepage while Web
// Analytics records each source as a separate page.
const campaignRewrites = [
  { source: '/portfolio', destination: '/' },
  { source: '/hello', destination: '/' },
  { source: '/latest', destination: '/' },
]

const isProduction = process.env.NODE_ENV === 'production'
const scriptSrc = [
  "'self'",
  "'unsafe-inline'",
  ...(!isProduction ? ["'unsafe-eval'"] : []),
  ...(!isProduction ? ['https://mcp.figma.com'] : []),
  'https://va.vercel-scripts.com',
].join(' ')
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  `frame-ancestors ${isProduction ? "'none'" : "'self'"}`,
  "form-action 'self'",
  "object-src 'none'",
  `script-src ${scriptSrc}`,
  "style-src 'self' 'unsafe-inline' https://api.fontshare.com",
  "font-src 'self' data: https:",
  "img-src 'self' data: blob: https:",
  `connect-src 'self' https://api.github.com https://accounts.spotify.com https://api.spotify.com https://vitals.vercel-insights.com https://va.vercel-scripts.com${isProduction ? '' : ' https://mcp.figma.com'}`,
  "frame-src 'self' https://open.spotify.com https://*.vercel.app https://www.pramitranjan.com",
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  ...(isProduction ? ['upgrade-insecure-requests'] : []),
].join('; ')

// Vendored prototypes under /proto are embedded in case study pages via iframe,
// and transpile JSX at runtime (Babel standalone), so they need same-origin
// framing and eval. Scoped to /proto only; the site-wide policy stays strict.
const protoContentSecurityPolicy = contentSecurityPolicy
  .replace("frame-ancestors 'none'", "frame-ancestors 'self'")
  .replace(`script-src ${scriptSrc}`, `script-src ${scriptSrc}${isProduction ? " 'unsafe-eval'" : ''}`)

const nextConfig: NextConfig = {
  /* Phone testing hits the dev server over the LAN; without this Next blocks its own dev
     resources from that origin and the page never hydrates. The host lives in the ignored
     .env.local so no machine's address is committed. Dev-only. */
  allowedDevOrigins: process.env.DEV_ORIGIN ? [process.env.DEV_ORIGIN] : [],
  images: {
    remotePatterns: [new URL('https://jqklreasrzeulcsjewav.supabase.co/storage/v1/object/public/**')],
    // A single allowed quality raises the whole site off the default 75:
    // findClosestQuality() snaps <Image>'s unset default to the nearest entry,
    // so every image encodes at 100 without touching a component. Adding 75 back
    // to this list would silently undo that.
    qualities: [100],
    // AVIF first for the browsers that take it — flat UI mockups and gradients
    // band badly in WebP at any quality. WebP stays as the fallback.
    formats: ['image/avif', 'image/webp'],
  },
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
  async redirects() {
    // /creative became /play. Redirects run before public/ is served, so these
    // stay one segment deep — image assets live at /creative/:section/:slug/:file.
    return [
      { source: '/life', destination: lifeWebOrigin, permanent: true },
      { source: '/life/:path*', destination: `${lifeWebOrigin}/:path*`, permanent: true },
      { source: '/creative', destination: '/play', permanent: true },
      { source: '/creative/:section', destination: '/play/:section', permanent: true },
      { source: '/creative/:section/:slug', destination: '/play/:section/:slug', permanent: true },
    ]
  },
  async rewrites() {
    return {
      beforeFiles: [
        ...campaignRewrites,
        {
          source: '/api/life/:path*',
          destination: `${lifeWebOrigin}/api/life/:path*`,
        },
      ],
      afterFiles: [],
      fallback: [],
    }
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: isProduction ? 'DENY' : 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=(), browsing-topics=()' },
          ...(isProduction
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' }]
            : []),
        ],
      },
      {
        // Later match wins per-key: relax framing for embedded prototypes only.
        source: '/proto/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: protoContentSecurityPolicy },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ]
  },
};

export default nextConfig;
