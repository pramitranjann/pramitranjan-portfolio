'use client'

import dynamic from 'next/dynamic'
import { Component, type ReactNode } from 'react'
import type { ProjectSpotifyMedia } from '@/lib/site-content-schema'

const ProjectSpotifySection = dynamic(
  () => import('./ProjectSpotifySection').then((module) => module.ProjectSpotifySection),
  { ssr: false, loading: () => null },
)

class SpotifySectionBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch() {
    // Intentionally swallow widget-only failures so creative pages still render.
  }

  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

export function SafeProjectSpotifySection({
  spotify,
}: {
  spotify?: ProjectSpotifyMedia
}) {
  if (!spotify) return null

  return (
    <SpotifySectionBoundary>
      <ProjectSpotifySection spotify={spotify} />
    </SpotifySectionBoundary>
  )
}
