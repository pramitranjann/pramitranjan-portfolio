/* Run: node --experimental-strip-types scripts/check-play-wall.mjs
   Guards the play wall's ordering rules (the curated default, a saved order winning, and
   cards missing from a saved order still reaching the wall) and the card cross-dissolve
   stacking that keeps the card background from flickering through every image swap. */
import assert from 'node:assert/strict'
import { buildPlayWall, getPlayWallSources } from '../lib/play-wall.ts'
import { crossfadeLayer } from '../lib/crossfade-layer.ts'

const content = {
  caseStudies: [
    { slug: 'bowl', section: 'play', title: 'Bowl' },
    { slug: 'sling', section: 'play', title: 'Sling' },
    { slug: 'ghost', section: 'play', title: 'Ghost', hidden: true },
    { slug: 'south-china-sea', section: 'mixed-media', title: 'South China Sea' },
    { slug: 'faces-of-power', section: 'mixed-media', title: 'Faces of Power' },
    { slug: 'swipey-fields', section: 'work', title: 'Swipey Fields' },
  ],
  photography: { cities: ['kl', 'penang', 'hcmc', 'singapore'].map((slug) => ({ slug, title: slug.toUpperCase() })) },
}

const sources = getPlayWallSources(content)
assert.deepEqual(sources.games.map((g) => g.slug), ['bowl', 'sling'], 'hidden games and work case studies must not reach the wall')

const keys = (order) => buildPlayWall(sources, order).map((item) => item.key)

// Default: the curated interleave, then whatever the recipe did not name.
assert.deepEqual(keys(undefined), [
  'game-bowl', 'photo-kl', 'mixed-south-china-sea', 'photo-penang',
  'game-sling', 'photo-hcmc', 'mixed-faces-of-power', 'photo-singapore',
])
assert.deepEqual(keys([]), keys(undefined), 'an empty saved order falls back to the default')

// A saved order wins outright.
const reversed = [...keys(undefined)].reverse()
assert.deepEqual(keys(reversed), reversed)

// A partial saved order places what it names and appends the rest in default order.
assert.deepEqual(keys(['photo-singapore', 'game-sling']), [
  'photo-singapore', 'game-sling',
  'game-bowl', 'photo-kl', 'mixed-south-china-sea', 'photo-penang', 'photo-hcmc', 'mixed-faces-of-power',
])

// A stale key for deleted content must not drop or duplicate any live card.
assert.deepEqual(
  [...keys(['mixed-gone-forever', 'photo-hcmc'])].sort(),
  [...keys(undefined)].sort(),
  'every live card survives a saved order naming content that no longer exists',
)

// --- card cross-dissolve stacking ---

/* Replays what the component does over time: activeIndex advances, and settledIndex
   catches up once the dissolve finishes. The invariant that kills the flicker is that
   some layer is always fully opaque, so the card background is never visible. */
const replay = (frameCount, steps) => {
  let settledIndex = 0
  const observed = []
  for (const activeIndex of steps) {
    // Mid-dissolve: settledIndex still trails.
    observed.push({ activeIndex, settledIndex, layers: Array.from({ length: frameCount }, (_, i) => crossfadeLayer(i, activeIndex, settledIndex)) })
    // Dissolve finished.
    settledIndex = activeIndex
    observed.push({ activeIndex, settledIndex, layers: Array.from({ length: frameCount }, (_, i) => crossfadeLayer(i, activeIndex, settledIndex)) })
  }
  return observed
}

for (const frameCount of [2, 3, 4]) {
  const cycle = Array.from({ length: frameCount * 3 }, (_, step) => (step + 1) % frameCount)
  for (const { activeIndex, settledIndex, layers } of replay(frameCount, cycle)) {
    const where = `frames=${frameCount} active=${activeIndex} settled=${settledIndex}`

    assert.equal(layers[activeIndex].opacity, 1, `the incoming frame ends fully opaque (${where})`)
    assert.ok(
      layers.some((layer) => layer.opacity === 1),
      `some layer is always fully opaque, so the card background never shows through (${where})`,
    )

    const topmost = layers.indexOf(layers.reduce((a, b) => (b.zIndex > a.zIndex ? b : a)))
    assert.equal(topmost, activeIndex, `the incoming frame is the topmost layer (${where})`)

    if (settledIndex !== activeIndex) {
      assert.equal(layers[settledIndex].opacity, 1, `the outgoing frame is held opaque, never faded out (${where})`)
      assert.ok(layers[settledIndex].zIndex < layers[activeIndex].zIndex, `the outgoing frame sits below the incoming one (${where})`)
      assert.equal(layers.filter((layer) => layer.opacity === 1).length, 2, `exactly two layers are opaque mid-dissolve (${where})`)
    } else {
      assert.equal(layers.filter((layer) => layer.opacity === 1).length, 1, `one layer remains once the dissolve settles (${where})`)
    }
  }
}

/* The two-frame case is the one a ref-based outgoing index gets wrong: coming back to a
   frame, it is already opaque and cuts instead of dissolving. It must start from 0. */
assert.equal(crossfadeLayer(0, 1, 0).opacity, 1, 'frame 0 is held opaque while frame 1 dissolves in')
assert.equal(crossfadeLayer(0, 1, 1).opacity, 0, 'frame 0 is released once frame 1 has settled')
assert.equal(crossfadeLayer(0, 0, 1).opacity, 1, 'frame 0 dissolves back in from released, not from opaque')

console.log('play-wall ordering + card cross-dissolve OK')
