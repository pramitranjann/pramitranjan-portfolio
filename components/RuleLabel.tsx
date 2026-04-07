// components/RuleLabel.tsx
export function RuleLabel({ number, className }: { number: string; className?: string }) {
  return (
    <div className={`flex items-center gap-3 mb-4 ${className ?? ''}`}>
      <div className="flex-shrink-0" style={{ width: '32px', height: '1px', backgroundColor: 'var(--color-red)' }} />
      <span
        className="font-mono"
        style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', lineHeight: 1, color: 'var(--color-red)' }}
      >
        {number}
      </span>
    </div>
  )
}
