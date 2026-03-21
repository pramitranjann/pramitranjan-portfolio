// components/RuleLabel.tsx
export function RuleLabel({ number, className }: { number: string; className?: string }) {
  return (
    <div className={`flex items-center gap-3 mb-4 ${className ?? ''}`}>
      <div className="flex-shrink-0 bg-red" style={{ width: '32px', height: '1px' }} />
      <span
        className="font-mono text-red"
        style={{ fontSize: '9px', letterSpacing: '0.18em', lineHeight: 1 }}
      >
        {number}
      </span>
    </div>
  )
}
