'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { Component, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { ListeningCardStyleSettings, ProjectSpotifyMedia } from '@/lib/site-content-schema'

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
  listeningStyle,
}: {
  spotify?: ProjectSpotifyMedia
  listeningStyle?: ListeningCardStyleSettings
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!spotify) return null
  if (!mounted) return null

  return createPortal(
    <SpotifySectionBoundary>
      <ProjectSpotifySection spotify={spotify} listeningStyle={listeningStyle} />
    </SpotifySectionBoundary>,
    document.body,
  )
}
