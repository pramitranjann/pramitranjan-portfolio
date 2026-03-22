// lib/sounds.ts
// Web Audio API micro-sounds — Soft Digital / Variant A (Precise)
// No audio files. No dependencies. SSR safe.
//
// iOS unlock strategy:
//   `touchstart` fires before `click` and is still a user gesture.
//   We pre-unlock the AudioContext there so it's already running
//   by the time any play function is called — avoiding issues with
//   Next.js routing microtasks breaking iOS's gesture detection chain.

let _ctx: AudioContext | null = null
let _unlocked = false

function unlock() {
  if (_unlocked) return
  try {
    if (!_ctx) _ctx = new AudioContext()
    const buf = _ctx.createBuffer(1, 1, _ctx.sampleRate)
    const src = _ctx.createBufferSource()
    src.buffer = buf
    src.connect(_ctx.destination)
    src.start()
    _ctx.resume()
    _unlocked = true
  } catch {}
}

// Pre-unlock on first touch — runs before any click handler
if (typeof window !== 'undefined') {
  const handler = () => {
    unlock()
    document.removeEventListener('touchstart', handler)
    document.removeEventListener('touchend', handler)
  }
  document.addEventListener('touchstart', handler, { passive: true })
  document.addEventListener('touchend', handler, { passive: true })
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null
  // Fallback unlock for non-touch devices (desktop)
  unlock()
  return _ctx
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

// Small offset ensures tones fire after resume() completes
const OFFSET = 0.05

// Single clean tone — tight nav confirmation
export function playNav() {
  const ctx = getCtx()
  if (!ctx) return
  tone(ctx, 1100, 0.09, ctx.currentTime + OFFSET, 0.008, 0.09)
}

// Two-tone slide — lightbox frame change
export function playLightboxNav() {
  const ctx = getCtx()
  if (!ctx) return
  const t = ctx.currentTime + OFFSET
  tone(ctx, 1050, 0.07, t,        0.008, 0.12)
  tone(ctx, 880,  0.05, t + 0.06, 0.008, 0.10)
}

// Ascending pair — entering a project
export function playCardEnter() {
  const ctx = getCtx()
  if (!ctx) return
  const t = ctx.currentTime + OFFSET
  tone(ctx, 880,  0.08, t,         0.008, 0.09)
  tone(ctx, 1320, 0.07, t + 0.055, 0.008, 0.10)
}

// Soft layered arrival — new page settled
// SoundRouteListener skips first mount via prevPathname ref.
export function playPageArrive() {
  const ctx = getCtx()
  if (!ctx || ctx.state !== 'running') return
  const t = ctx.currentTime + OFFSET
  tone(ctx, 660, 0.05, t,        0.04, 0.22)
  tone(ctx, 990, 0.03, t + 0.03, 0.04, 0.18)
}
