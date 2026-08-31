import type { CaseStudyContent, PhotographyCity } from '@/lib/site-content-schema'

/* The play wall's order is shared by the live page and the dashboard's arrangement
   editor. Both must build the list the same way or the editor reorders a list the
   visitor never sees, so the assembly lives here rather than in either consumer. */

export type PlayWallItem =
  | { key: string; medium: 'game'; title: string; game: CaseStudyContent }
  | { key: string; medium: 'photo'; title: string; city: PhotographyCity }
  | { key: string; medium: 'mixed'; title: string; project: CaseStudyContent }

export type PlayWallSources = {
  games: CaseStudyContent[]
  cities: PhotographyCity[]
  mixedMediaProjects: CaseStudyContent[]
}

/* Mirrors the filters app/play/page.tsx applies before handing content to the client,
   so the dashboard lists exactly the cards that reach the wall. */
export function getPlayWallSources(content: {
  caseStudies: CaseStudyContent[]
  photography: { cities: PhotographyCity[] }
}): PlayWallSources {
  return {
    games: content.caseStudies.filter((item) => item.section === 'play' && !item.hidden),
    cities: content.photography.cities,
    mixedMediaProjects: content.caseStudies.filter((item) => item.section === 'mixed-media'),
  }
}

/* A curated interleave rather than an algorithm — every row is meant to carry more than
   one medium. Anything the recipe does not name is appended, so new content still shows up. */
function defaultOrder({ games, cities, mixedMediaProjects }: PlayWallSources): PlayWallItem[] {
  const g = games.map<PlayWallItem>((game) => ({ key: `game-${game.slug}`, medium: 'game', title: game.title, game }))
  const p = cities.map<PlayWallItem>((city) => ({ key: `photo-${city.slug}`, medium: 'photo', title: city.title, city }))
  const m = mixedMediaProjects.map<PlayWallItem>((project) => ({ key: `mixed-${project.slug}`, medium: 'mixed', title: project.title, project }))

  const seq: PlayWallItem[] = []
  for (const item of [g[0], p[0], m[0], p[1], g[1], p[2], m[1], p[3]]) {
    if (item) seq.push(item)
  }
  const used = new Set(seq.map((item) => item.key))
  for (const item of [...g, ...p, ...m]) {
    if (!used.has(item.key)) seq.push(item)
  }
  return seq
}

export function buildPlayWall(sources: PlayWallSources, cardOrder?: string[]): PlayWallItem[] {
  const seq = defaultOrder(sources)
  if (!cardOrder?.length) return seq

  /* A saved order names the cards that existed when it was saved. Anything it does not
     name keeps its default position and lands at the end, so adding a game or a city
     never makes it invisible until someone opens the dashboard. Sort is stable, so those
     unnamed cards hold their relative default order. */
  const rank = new Map(cardOrder.map((key, index) => [key, index]))
  return [...seq].sort((a, b) => (rank.get(a.key) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.key) ?? Number.MAX_SAFE_INTEGER))
}
