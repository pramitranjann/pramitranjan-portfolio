'use client'
import dynamic from 'next/dynamic'

const Anim = dynamic(
  () => import('./IntroAnimation').then(m => m.IntroAnimation),
  { ssr: false }
)

export function IntroAnimationDynamic() {
  return <Anim />
}
