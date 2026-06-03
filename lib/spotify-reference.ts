export type SpotifyResourceKind = 'track' | 'playlist'

export interface SpotifyReferenceInput {
  spotifyId?: string
  spotifyUrl?: string
}

export interface ResolvedSpotifyReference {
  kind: SpotifyResourceKind
  id: string
  uri: `spotify:${SpotifyResourceKind}:${string}`
  openUrl: string
  embedUrl: string
}

const SPOTIFY_ID_PATTERN = /^[A-Za-z0-9]{22}$/

function createResolvedReference(kind: SpotifyResourceKind, id: string): ResolvedSpotifyReference | null {
  if (!SPOTIFY_ID_PATTERN.test(id)) return null

  return {
    kind,
    id,
    uri: `spotify:${kind}:${id}`,
    openUrl: `https://open.spotify.com/${kind}/${id}`,
    embedUrl: `https://open.spotify.com/embed/${kind}/${id}?utm_source=generator&theme=0`,
  }
}

function tryResolveFromUrl(value: string, expectedKind: SpotifyResourceKind): ResolvedSpotifyReference | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const uriMatch = trimmed.match(/^spotify:(track|playlist):([A-Za-z0-9]{22})$/i)
  if (uriMatch) {
    const kind = uriMatch[1].toLowerCase() as SpotifyResourceKind
    if (kind !== expectedKind) return null
    return createResolvedReference(kind, uriMatch[2])
  }

  try {
    const url = new URL(trimmed)
    if (!/(^|\.)spotify\.com$/i.test(url.hostname)) return null

    const segments = url.pathname.split('/').filter(Boolean)
    if (segments.length < 2) return null

    const [kindSegment, idSegment] =
      segments[0].toLowerCase() === 'embed' && segments.length >= 3
        ? [segments[1], segments[2]]
        : [segments[0], segments[1]]

    const kind = kindSegment.toLowerCase() as SpotifyResourceKind
    const id = idSegment
    if (kind !== expectedKind) return null

    return createResolvedReference(kind, id)
  } catch {
    return null
  }
}

export function resolveSpotifyReference(
  input: SpotifyReferenceInput | undefined,
  expectedKind: SpotifyResourceKind,
): ResolvedSpotifyReference | null {
  if (!input) return null

  const fromId = input.spotifyId ? createResolvedReference(expectedKind, input.spotifyId.trim()) : null
  if (fromId) return fromId

  if (!input.spotifyUrl) return null
  return tryResolveFromUrl(input.spotifyUrl, expectedKind)
}
