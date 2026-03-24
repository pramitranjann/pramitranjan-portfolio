'use client'

import { createContext, useContext } from 'react'
import type { MotionSettings } from '@/lib/site-content-schema'

const defaultMotionSettings: MotionSettings = {
  pageRevealDistance: 16,
  pageRevealDuration: 0.6,
  pageRevealStagger: 0.08,
  simpleRevealDistance: 20,
  simpleRevealDuration: 0.5,
  simpleRevealStagger: 0.2,
  gridStartScale: 0.93,
  gridRevealDuration: 0.5,
  gridRevealStagger: 0.11,
  eyebrowOffset: 8,
  eyebrowLineDuration: 0.4,
  eyebrowLabelDuration: 0.4,
  eyebrowLabelDelay: 0.2,
  introStartDelay: 1100,
  introKeyGap: 550,
  introPauseBeforeLift: 250,
  introLiftDuration: 850,
}

const MotionSettingsContext = createContext<MotionSettings>(defaultMotionSettings)

export function MotionSettingsProvider({
  settings,
  children,
}: {
  settings: MotionSettings
  children: React.ReactNode
}) {
  return <MotionSettingsContext.Provider value={settings}>{children}</MotionSettingsContext.Provider>
}

export function useMotionSettings() {
  return useContext(MotionSettingsContext)
}
