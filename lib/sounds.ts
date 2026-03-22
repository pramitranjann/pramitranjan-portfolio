// lib/sounds.ts
// Web Audio API micro-sounds — Soft Digital / Variant A (Precise)
// No audio files. No dependencies. SSR safe.
//
// iOS unlock strategy:
//   1. On first gesture, play a 1-sample silent buffer synchronously —
//      iOS uses this to detect and allow audio from this context.
//   2. Await ctx.resume() before scheduling tones so currentTime is live.

let _ctx: AudioContext | null = null
let _unlocked = false

async function getCtx(): Promise<AudioContext | null> {
  if (typeof window === 'undefined') return null
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null
  try {
    if (!_ctx) {
      _ctx = new AudioContext()
    }
    // Unlock once: play a silent 1-sample buffer synchronously in the gesture.
    // This is the iOS-required "audio activity" that gates further playback.
    if (!_unlocked) {
      const buf = _ctx.createBuffer(1, 1, _ctx.sampleRate)
      const src = _ctx.createBufferSource()
      src.buffer = buf
      src.connect(_ctx.destination)
      src.start(0)
      _unlocked = true
    }
    // Await resume so currentTime is accurate when we schedule tones.
    if (_ctx.state !== 'running') {
      await _ctx.resume()
    }
    return _ctx
  } catch {
    return null
  }
}

function tone(
  ctx: AudioContext,
  freq: number,
  gain: number,
  startTime: number,
  attackSec: number,
  decaySec: number,
) {
  const osc = ctx.createOscillator()
  const g = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = freq
  g.gain.setValueAtTime(0, startTime)
  g.gain.linearRampToValueAtTime(gain, startTime + attackSec)
  g.gain.exponentialRampToValueAtTime(0.0001, startTime + decaySec)
  osc.connect(g)
  g.connect(ctx.destination)
  osc.start(startTime)
  osc.stop(startTime + decaySec + 0.01)
}

// Single clean tone — tight nav confirmation
export async function playNav() {
  const ctx = await getCtx()
  if (!ctx) return
  tone(ctx, 1100, 0.09, ctx.currentTime, 0.008, 0.09)
}

// Two-tone slide — lightbox frame change
export async function playLightboxNav() {
  const ctx = await getCtx()
  if (!ctx) return
  const t = ctx.currentTime
  tone(ctx, 1050, 0.07, t,        0.008, 0.12)
  tone(ctx, 880,  0.05, t + 0.06, 0.008, 0.10)
}

// Ascending pair — entering a project
export async function playCardEnter() {
  const ctx = await getCtx()
  if (!ctx) return
  const t = ctx.currentTime
  tone(ctx, 880,  0.08, t,         0.008, 0.09)
  tone(ctx, 1320, 0.07, t + 0.055, 0.008, 0.10)
}

// Soft layered arrival — new page settled
// SoundRouteListener skips first mount; this guard catches any edge cases.
export async function playPageArrive() {
  const ctx = await getCtx()
  if (!ctx) return
  const t = ctx.currentTime
  tone(ctx, 660, 0.05, t,        0.04, 0.22)
  tone(ctx, 990, 0.03, t + 0.03, 0.04, 0.18)
}
