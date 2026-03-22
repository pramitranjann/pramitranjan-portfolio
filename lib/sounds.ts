// lib/sounds.ts
// Web Audio API micro-sounds — Soft Digital / Variant A (Precise)
// No audio files. No dependencies. SSR safe.
//
// iOS unlock strategy:
//   Everything must stay synchronous inside the gesture handler —
//   any `await` breaks iOS's user-gesture detection chain.
//   1. On first call: play a 1-sample silent BufferSource synchronously.
//      This is the iOS "warm up" that gates future playback.
//   2. Call resume() (fire-and-forget, no await).
//   3. Schedule tones 100ms ahead so they fire after resume() completes.

let _ctx: AudioContext | null = null
let _unlocked = false

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null
  try {
    if (!_ctx) _ctx = new AudioContext()

    // First call: play a silent buffer synchronously to unlock iOS audio output
    if (!_unlocked) {
      const buf = _ctx.createBuffer(1, 1, _ctx.sampleRate)
      const src = _ctx.createBufferSource()
      src.buffer = buf
      src.connect(_ctx.destination)
      src.start(0)
      _unlocked = true
    }

    if (_ctx.state === 'suspended') _ctx.resume()
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

// 100ms scheduling offset — gives resume() time to complete on iOS
// without needing await (which would break gesture detection)
const OFFSET = 0.1

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
