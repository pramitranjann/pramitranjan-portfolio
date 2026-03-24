// lib/sounds.ts
// Web Audio API micro-sounds — Soft Digital / Precise
// No audio files. No dependencies. SSR safe.
//
// iOS/Safari unlock strategy:
//   All playback waits for a successful resume before scheduling tones.
//   A first-input pre-unlock still runs to make subsequent sounds immediate.

let _ctx: AudioContext | null = null
let _unlocking: Promise<void> | null = null
const IMMEDIATE_SOUND_WINDOW_MS = 120

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextCtor) return null
    if (!_ctx) _ctx = new AudioContextCtor()
    return _ctx
  } catch {
    return null
  }
}

async function unlockCtx() {
  const ctx = getCtx()
  if (!ctx) return
  if (ctx.state !== 'running') {
    try {
      await ctx.resume()
    } catch {
      return
    }
  }

  // Prime the output with a silent tick so Safari/iOS fully unlocks the graph.
  try {
    const gain = ctx.createGain()
    gain.gain.value = 0.00001
    gain.connect(ctx.destination)

    const osc = ctx.createOscillator()
    osc.frequency.value = 440
    osc.connect(gain)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.001)
  } catch {
    // Ignore unlock priming failures — regular play calls will still try to resume.
  }
}

// Pre-unlock on first input so route/audio clicks keep working on Safari/iOS.
if (typeof window !== 'undefined') {
  const handler = () => {
    if (!_unlocking) {
      _unlocking = unlockCtx().finally(() => {
        const ctx = getCtx()
        if (!ctx || ctx.state === 'running') {
          document.removeEventListener('touchstart', handler)
          document.removeEventListener('pointerdown', handler)
          document.removeEventListener('click', handler)
          document.removeEventListener('keydown', handler)
        }
        _unlocking = null
      })
    }
  }
  document.addEventListener('touchstart', handler, { passive: true })
  document.addEventListener('pointerdown', handler, { passive: true })
  document.addEventListener('click', handler, { passive: true })
  document.addEventListener('keydown', handler, { passive: true })
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

async function withRunningCtx(run: (ctx: AudioContext) => void) {
  const ctx = getCtx()
  if (!ctx) return

  if (ctx.state !== 'running') {
    if (!_unlocking) {
      _unlocking = unlockCtx().finally(() => {
        _unlocking = null
      })
    }
    await _unlocking
  }

  if (ctx.state !== 'running') return
  run(ctx)
}

async function withImmediateCtx(run: (ctx: AudioContext) => void) {
  const ctx = getCtx()
  if (!ctx) return

  const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now()

  if (ctx.state !== 'running') {
    if (!_unlocking) {
      _unlocking = unlockCtx().finally(() => {
        _unlocking = null
      })
    }
    await _unlocking
  }

  if (ctx.state !== 'running') return

  const finishedAt = typeof performance !== 'undefined' ? performance.now() : Date.now()
  if (finishedAt - startedAt > IMMEDIATE_SOUND_WINDOW_MS) return

  run(ctx)
}

function withHotCtx(run: (ctx: AudioContext) => void) {
  const ctx = getCtx()
  if (!ctx || ctx.state !== 'running') return
  run(ctx)
}

const OFFSET = 0.02

// Single clean tone — nav / back links
export function playNav() {
  void withImmediateCtx((ctx) => {
    tone(ctx, 1100, 0.09, ctx.currentTime + OFFSET, 0.008, 0.09)
  })
}

// Two-tone slide — lightbox frame change
export function playLightboxNav() {
  void withImmediateCtx((ctx) => {
    const t = ctx.currentTime + OFFSET
    tone(ctx, 1050, 0.07, t,        0.008, 0.12)
    tone(ctx, 880,  0.05, t + 0.06, 0.008, 0.10)
  })
}

// Ascending pair — entering a project card
export function playCardEnter() {
  void withImmediateCtx((ctx) => {
    const t = ctx.currentTime + OFFSET
    tone(ctx, 880,  0.08, t,         0.008, 0.09)
    tone(ctx, 1320, 0.07, t + 0.055, 0.008, 0.10)
  })
}

// Soft layered arrival — new page settled
export function playPageArrive() {
  withHotCtx((ctx) => {
    const t = ctx.currentTime + OFFSET
    tone(ctx, 660, 0.05, t,        0.04, 0.22)
    tone(ctx, 990, 0.03, t + 0.03, 0.04, 0.18)
  })
}

// Soft typewriter tick — intro animation keystroke (P or R)
// Fires from setTimeout so only plays if context already running (iOS: silent on first load)
export function playIntroKey(pitch: 'P' | 'R') {
  withHotCtx((ctx) => {
    const freq = pitch === 'P' ? 820 : 960
    tone(ctx, freq, 0.06, ctx.currentTime + 0.01, 0.006, 0.07)
  })
}

// Subtle lift tone — curtain begins to rise
export function playIntroLift() {
  withHotCtx((ctx) => {
    const t = ctx.currentTime + 0.01
    tone(ctx, 440, 0.04, t,        0.06, 0.30)
    tone(ctx, 660, 0.03, t + 0.08, 0.04, 0.25)
  })
}
