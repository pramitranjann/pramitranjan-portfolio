import type { Metadata } from 'next'
import PlayPageLive from '@/components/PlayPageLive'

export const metadata: Metadata = {
  title: 'Play Test',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default async function PlayTestPage() {
  return <PlayPageLive />
}
