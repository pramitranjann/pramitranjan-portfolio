import type { CSSProperties } from 'react'
import styles from './TransitionRail.module.css'

interface TransitionRailProps {
  className?: string
  style?: CSSProperties
}

export function TransitionRail({ className, style }: TransitionRailProps) {
  return (
    <span
      className={`${styles.track}${className ? ` ${className}` : ''}`}
      style={style}
      aria-hidden="true"
    >
      <span className={styles.runner} />
    </span>
  )
}
