// lib/sounds.ts
// Web Audio API micro-sounds — Soft Digital / Precise
// No audio files. No dependencies. SSR safe.
//
// iOS unlock strategy:
//   AudioContext.resume() is called in every play function (fire-and-forget).
//   Tones are scheduled OFFSET seconds in the future — enough time for resume()
//   to complete on iOS before the scheduled audio fires.
//   touchstart pre-unlock is a bonus for the very first interaction.

let _ctx: AudioContext | null = null
let _unlocking: Promise<void> | null = null

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
        _unlocking = null
      })
    }
    document.removeEventListener('touchstart', handler)
    document.removeEventListener('pointerdown', handler)
    document.removeEventListener('click', handler)
    document.removeEventListener('keydown', handler)
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

// 0.3s offset — enough for iOS resume() to complete before tones fire
const OFFSET = 0.3

// Single clean tone — nav / back links
export function playNav() {
  const ctx = getCtx()
  if (!ctx) return
  void ctx.resume()
  tone(ctx, 1100, 0.09, ctx.currentTime + OFFSET, 0.008, 0.09)
}

// Two-tone slide — lightbox frame change
export function playLightboxNav() {
  const ctx = getCtx()
  if (!ctx) return
  void ctx.resume()
  const t = ctx.currentTime + OFFSET
  tone(ctx, 1050, 0.07, t,        0.008, 0.12)
  tone(ctx, 880,  0.05, t + 0.06, 0.008, 0.10)
}

// Ascending pair — entering a project card
export function playCardEnter() {
  const ctx = getCtx()
  if (!ctx) return
  void ctx.resume()
  const t = ctx.currentTime + OFFSET
  tone(ctx, 880,  0.08, t,         0.008, 0.09)
  tone(ctx, 1320, 0.07, t + 0.055, 0.008, 0.10)
}

// Soft layered arrival — new page settled
export function playPageArrive() {
  const ctx = getCtx()
  if (!ctx) return
  void ctx.resume()
  const t = ctx.currentTime + OFFSET
  tone(ctx, 660, 0.05, t,        0.04, 0.22)
  tone(ctx, 990, 0.03, t + 0.03, 0.04, 0.18)
}

// Soft typewriter tick — intro animation keystroke (P or R)
// Fires from setTimeout so only plays if context already running (iOS: silent on first load)
export function playIntroKey(pitch: 'P' | 'R') {
  const ctx = getCtx()
  if (!ctx) return
  void ctx.resume()
  const freq = pitch === 'P' ? 820 : 960
  tone(ctx, freq, 0.06, ctx.currentTime + 0.01, 0.006, 0.07)
}

// Subtle lift tone — curtain begins to rise
export function playIntroLift() {
  const ctx = getCtx()
  if (!ctx) return
  void ctx.resume()
  const t = ctx.currentTime + 0.01
  tone(ctx, 440, 0.04, t,        0.06, 0.30)
  tone(ctx, 660, 0.03, t + 0.08, 0.04, 0.25)
}
