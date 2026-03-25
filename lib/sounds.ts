// lib/sounds.ts
// Web Audio API micro-sounds — Soft Digital / Precise
// No audio files. No dependencies. SSR safe.
//
// iOS/Safari unlock strategy:
//   All playback waits for a successful resume before scheduling tones.
//   A first-input pre-unlock still runs to make subsequent sounds immediate.

let _ctx: AudioContext | null = null
let _unlocking: Promise<void> | null = null
const IMMEDIATE_SOUND_WINDOW_MS = 220
const SOUND_SAMPLE_RATE = 22050
const interactionSoundUrls = new Map<'nav' | 'lightbox' | 'card', string>()

function getInteractionVolume() {
  if (typeof window === 'undefined') return 1
  const value = window.getComputedStyle(document.body).getPropertyValue('--audio-interaction-volume').trim()
  const parsed = Number.parseFloat(value)
  if (!Number.isFinite(parsed)) return 1
  return Math.max(0, Math.min(parsed, 1.5))
}

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
    const ctx = getCtx()
    if (ctx?.state === 'running') return

    if (!_unlocking) {
      _unlocking = unlockCtx().finally(() => {
        _unlocking = null
      })
    }
  }
  document.addEventListener('touchstart', handler, { passive: true, capture: true })
  document.addEventListener('pointerdown', handler, { passive: true, capture: true })
  document.addEventListener('click', handler, { passive: true, capture: true })
  document.addEventListener('keydown', handler, { passive: true, capture: true })
  window.addEventListener('pageshow', handler)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') handler()
  })
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

type SoundSegment = {
  freq: number
  gain: number
  start: number
  attack: number
  decay: number
}

function clampSample(value: number) {
  return Math.max(-1, Math.min(1, value))
}

function writeAscii(view: DataView, offset: number, value: string) {
  for (let i = 0; i < value.length; i += 1) {
    view.setUint8(offset + i, value.charCodeAt(i))
  }
}

function renderInteractionSound(segments: SoundSegment[]) {
  const totalDuration = Math.max(...segments.map((segment) => segment.start + segment.decay), 0.12) + 0.02
  const sampleCount = Math.ceil(totalDuration * SOUND_SAMPLE_RATE)
  const samples = new Float32Array(sampleCount)

  for (const segment of segments) {
    const startIndex = Math.floor(segment.start * SOUND_SAMPLE_RATE)
    const endIndex = Math.min(sampleCount, Math.ceil((segment.start + segment.decay) * SOUND_SAMPLE_RATE))

    for (let index = startIndex; index < endIndex; index += 1) {
      const localTime = (index - startIndex) / SOUND_SAMPLE_RATE
      const attack = Math.max(segment.attack, 0.001)
      const envelope =
        localTime <= attack
          ? (localTime / attack) * segment.gain
          : segment.gain * Math.exp(-7 * ((localTime - attack) / Math.max(segment.decay - attack, 0.001)))

      samples[index] += Math.sin(2 * Math.PI * segment.freq * localTime) * envelope
    }
  }

  const buffer = new ArrayBuffer(44 + sampleCount * 2)
  const view = new DataView(buffer)
  writeAscii(view, 0, 'RIFF')
  view.setUint32(4, 36 + sampleCount * 2, true)
  writeAscii(view, 8, 'WAVE')
  writeAscii(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, SOUND_SAMPLE_RATE, true)
  view.setUint32(28, SOUND_SAMPLE_RATE * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeAscii(view, 36, 'data')
  view.setUint32(40, sampleCount * 2, true)

  for (let index = 0; index < sampleCount; index += 1) {
    const sample = clampSample(samples[index])
    view.setInt16(44 + index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
  }

  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }))
}

function getInteractionSoundUrl(kind: 'nav' | 'lightbox' | 'card') {
  const existing = interactionSoundUrls.get(kind)
  if (existing) return existing

  const url = renderInteractionSound(
    kind === 'nav'
      ? [{ freq: 1100, gain: 0.38, start: 0, attack: 0.005, decay: 0.09 }]
      : kind === 'lightbox'
        ? [
            { freq: 1050, gain: 0.28, start: 0, attack: 0.005, decay: 0.12 },
            { freq: 880, gain: 0.22, start: 0.06, attack: 0.005, decay: 0.1 },
          ]
        : [
            { freq: 880, gain: 0.32, start: 0, attack: 0.005, decay: 0.09 },
            { freq: 1320, gain: 0.26, start: 0.055, attack: 0.005, decay: 0.1 },
          ]
  )

  interactionSoundUrls.set(kind, url)
  return url
}

function playInteractionSound(kind: 'nav' | 'lightbox' | 'card') {
  if (typeof window === 'undefined') return

  try {
    const audio = new Audio(getInteractionSoundUrl(kind))
    const volume = getInteractionVolume()
    audio.volume = Math.max(0, Math.min(volume, 1))
    audio.play().catch(() => {
      if (kind === 'nav') {
        void withImmediateCtx((ctx) => {
          tone(ctx, 1100, 0.16 * volume, ctx.currentTime + OFFSET, 0.008, 0.09)
        })
      } else if (kind === 'lightbox') {
        void withImmediateCtx((ctx) => {
          const t = ctx.currentTime + OFFSET
          tone(ctx, 1050, 0.12 * volume, t, 0.008, 0.12)
          tone(ctx, 880, 0.09 * volume, t + 0.06, 0.008, 0.1)
        })
      } else {
        void withImmediateCtx((ctx) => {
          const t = ctx.currentTime + OFFSET
          tone(ctx, 880, 0.14 * volume, t, 0.008, 0.09)
          tone(ctx, 1320, 0.11 * volume, t + 0.055, 0.008, 0.1)
        })
      }
    })
  } catch {
    // Ignore and fall back to silence if media playback cannot initialize.
  }
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
  playInteractionSound('nav')
}

// Two-tone slide — lightbox frame change
export function playLightboxNav() {
  playInteractionSound('lightbox')
}

// Ascending pair — entering a project card
export function playCardEnter() {
  playInteractionSound('card')
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
