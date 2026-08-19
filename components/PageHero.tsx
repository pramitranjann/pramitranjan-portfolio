import { GsapReveal } from '@/components/GsapReveal'
import { AnimatedEyebrow } from '@/components/AnimatedEyebrow'

export function PageHero({
  eyebrow,
  title,
  titleHtml,
  body,
  sectionClassName = '',
  variant = 'full',
}: {
  eyebrow: string
  title?: string
  titleHtml?: string
  body: string
  sectionClassName?: string
  /* 'compact' drops the body copy and the hero's extra air — a tighter band for pages whose
     grid is the real content. */
  variant?: 'full' | 'compact'
}) {
  const compact = variant === 'compact'
  return (
    <section
      className={`border-b border-divider${sectionClassName ? ` ${sectionClassName}` : ''}`}
      style={{ padding: compact ? '56px var(--layout-page-gutter) 24px' : 'var(--layout-hero-padding-y) var(--layout-page-gutter)' }}
    >
      <AnimatedEyebrow label={eyebrow} />
      <GsapReveal>
        <h1
          data-reveal
          className="font-serif"
          style={{ fontSize: 'var(--text-h1)', fontWeight: 'var(--font-weight-serif)', color: 'var(--color-heading)', lineHeight: 1.05, marginBottom: compact ? 0 : '20px' }}
          {...(titleHtml ? { dangerouslySetInnerHTML: { __html: titleHtml } } : {})}
        >
          {titleHtml ? null : title}
        </h1>
        {compact ? null : <p
          data-reveal
          className="font-reading"
          style={{ fontSize: 'var(--text-body-lg)', letterSpacing: '0.04em', color: 'var(--color-heading)', lineHeight: 1.9, maxWidth: '480px' }}
        >
          {body}
        </p>}
      </GsapReveal>
    </section>
  )
}
