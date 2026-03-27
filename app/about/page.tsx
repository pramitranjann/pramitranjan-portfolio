// app/about/page.tsx
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { SpotifyWidget } from '@/components/SpotifyWidget'
import { GsapReveal } from '@/components/GsapReveal'
import { getSiteContent } from '@/lib/site-content'
import { AnimatedEyebrow } from '@/components/AnimatedEyebrow'
import type { NowCardStyleSettings } from '@/lib/site-content-schema'

function CVButton({ label }: { label: string }) {
  return (
    <a
      href="/pramit-ranjan-cv.pdf"
      download
      className="font-mono inline-block"
      style={{
        fontSize: 'var(--text-meta)',
        letterSpacing: '0.14em',
        color: '#FF3120',
        border: '1px solid #FF3120',
        padding: '10px 20px',
        textDecoration: 'none',
      }}
    >
      {label} →
    </a>
  )
}

// Eyebrow label used for section columns
function SectionLabel({ html }: { html: string }) {
  return (
    <span
      className="font-mono"
      style={{ fontSize: 'var(--text-body)', letterSpacing: '0.14em', color: '#f5f2ed', paddingTop: '6px', lineHeight: 1.6 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function EntryList({ items }: { items: Array<{ org: string; role: string; date: string; desc: string }> }) {
  return (
    <div className="flex flex-col" style={{ gap: '40px' }}>
      {items.map((item) => (
        <div key={item.org}>
          {/* H3 — org/institution name */}
          <h3
            className="font-serif"
            style={{ fontSize: 'var(--text-h3)', fontStyle: 'italic', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.2, marginBottom: '8px' }}
          >
            {item.org}
          </h3>
          {/* Meta row — role + date */}
          <div className="flex items-center justify-between" style={{ gap: '16px', marginBottom: '12px' }}>
            <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.12em', color: '#FF3120' }}>
              {item.role}
            </span>
            <span className="font-mono" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.1em', color: '#999999' }}>
              {item.date}
            </span>
          </div>
          {/* Body */}
          <p className="font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.03em', color: '#999999', lineHeight: 1.8 }}>
            {item.desc}
          </p>
        </div>
      ))}
    </div>
  )
}

function NowCell({
  label,
  value,
  sub,
  styleSettings,
}: {
  label: string
  value: string
  sub: string
  styleSettings: NowCardStyleSettings
}) {
  return (
    <div style={{ background: '#0d0d0d', padding: styleSettings.cardPadding }}>
      <span className="font-mono" style={{ fontSize: styleSettings.labelSize, letterSpacing: '0.18em', color: '#FF3120', display: 'block', marginBottom: '10px' }}>{label}</span>
      <div className="font-serif" style={{ fontSize: styleSettings.titleSize, fontStyle: 'italic', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.3, marginBottom: '7px' }}>{value}</div>
      <div className="font-mono" style={{ fontSize: styleSettings.bodySize, letterSpacing: '0.08em', color: '#999999', lineHeight: 1.6 }}>{sub}</div>
    </div>
  )
}

export default async function AboutPage() {
  const content = await getSiteContent()
  const copy = content.copy.aboutPage

  return (
    <>
      <Nav />
      <main style={{ paddingTop: '42px' }}>

        {/* Hero */}
        <section className="border-b border-divider" style={{ padding: '64px 40px' }}>
          <GsapReveal>
            {/* Eyebrow */}
            <div data-reveal>
              <AnimatedEyebrow label={copy.heroEyebrow} />
            </div>
            {/* H1 */}
            <h1
              data-reveal
              className="font-serif"
              style={{ fontSize: 'var(--text-h1)', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.05, marginBottom: '28px' }}
              dangerouslySetInnerHTML={{ __html: copy.heroTitleHtml }}
            />
            {/* Body LG */}
            <p
              data-reveal
              className="font-mono"
              style={{ fontSize: 'var(--text-body-lg)', letterSpacing: '0.04em', color: '#999999', lineHeight: 1.9, maxWidth: '560px', marginBottom: '40px' }}
            >
              {content.aboutPage.heroBody}
            </p>
            <div data-reveal className="flex items-center justify-between">
              <CVButton label={copy.cvLabel} />
              <span className="font-mono select-none" style={{ fontSize: 'var(--text-meta)', letterSpacing: '0.14em', color: '#666666' }}>
                {copy.scrollLabel}
              </span>
            </div>
          </GsapReveal>
        </section>

        {/* WHO I AM + Spotify sidebar */}
        <section className="border-b border-divider about-who-sidebar" style={{ display: 'grid', gridTemplateColumns: '1fr 320px' }}>
          <div style={{ padding: '28px 40px', borderRight: '1px solid #1f1f1f' }}>
            <GsapReveal>
              <span data-reveal className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: '#666666', display: 'block', marginBottom: '12px' }}>{copy.whoIAmLabel}</span>
              <p data-reveal className="font-mono" style={{ fontSize: 'var(--text-body)', letterSpacing: '0.03em', color: '#999999', lineHeight: 1.8 }}>
                {content.aboutPage.whoIAm}
              </p>
            </GsapReveal>
          </div>
          <div style={{ padding: '28px 24px' }}>
            <span className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: '#666666', display: 'block', marginBottom: '10px' }}>{copy.onRotationLabel}</span>
            <SpotifyWidget variant="sidebar" styleSettings={content.design.listeningCard} />
          </div>
        </section>

        {/* Experience */}
        <section className="border-b border-divider about-page-section" style={{ padding: '56px 40px' }}>
          <GsapReveal>
            <div data-reveal className="about-page-grid grid" style={{ gridTemplateColumns: '160px 1fr', gap: '48px' }}>
              <SectionLabel html={copy.experienceLabel} />
              <EntryList items={content.aboutPage.experience} />
            </div>
          </GsapReveal>
        </section>

        {/* Professional Activities */}
        <section className="border-b border-divider about-page-section" style={{ padding: '56px 40px' }}>
          <GsapReveal>
            <div data-reveal className="about-page-grid grid" style={{ gridTemplateColumns: '160px 1fr', gap: '48px' }}>
              <SectionLabel html={copy.professionalActivitiesLabel} />
              <EntryList items={content.aboutPage.professionalActivities} />
            </div>
          </GsapReveal>
        </section>

        {/* Education */}
        <section className="border-b border-divider about-page-section" style={{ padding: '56px 40px' }}>
          <GsapReveal>
            <div data-reveal className="about-page-grid grid" style={{ gridTemplateColumns: '160px 1fr', gap: '48px' }}>
              <SectionLabel html={copy.educationLabel} />
              <EntryList items={content.aboutPage.education} />
            </div>
          </GsapReveal>
        </section>

        {/* Tools */}
        <section className="border-b border-divider about-page-section" style={{ padding: '56px 40px' }}>
          <GsapReveal>
            <div data-reveal className="about-page-grid grid" style={{ gridTemplateColumns: '160px 1fr', gap: '48px' }}>
              <SectionLabel html={copy.toolsLabel} />
              <div className="flex flex-wrap" style={{ gap: '8px' }}>
                {content.aboutPage.tools.map((tool) => (
                  <span
                    key={tool}
                    className="font-mono"
                    style={{
                      fontSize: 'var(--text-meta)',
                      letterSpacing: '0.12em',
                      color: '#999999',
                      border: '1px solid #1f1f1f',
                      padding: '6px 14px',
                    }}
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </GsapReveal>
        </section>

        {/* /Now */}
        <section className="border-b border-divider about-page-section" style={{ padding: '56px 40px' }}>
          <GsapReveal>
            <div data-reveal className="flex items-center" style={{ gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '32px', height: '1px', backgroundColor: '#FF3120' }} />
              <span className="font-mono" style={{ fontSize: 'var(--text-eyebrow)', letterSpacing: '0.18em', color: '#FF3120' }}>{content.aboutPage.nowHeading}</span>
            </div>
            <p data-reveal className="font-mono" style={{ fontSize: '11px', letterSpacing: '0.04em', color: '#666666', lineHeight: 1.8, marginBottom: '24px' }}>
              {content.aboutPage.nowDescription}
            </p>
            <div data-reveal className="now-grid-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#1f1f1f', border: '1px solid #1f1f1f' }}>
              <SpotifyWidget variant="cell" styleSettings={content.design.listeningCard} />
              {content.aboutPage.nowCards.map((card) => (
                <NowCell key={card.label} label={card.label} value={card.value} sub={card.sub} styleSettings={content.design.nowCards} />
              ))}
            </div>
          </GsapReveal>
        </section>

        {/* Contact CTA */}
        <section className="about-page-section" style={{ padding: '72px 40px' }}>
          <div style={{ maxWidth: '560px' }}>
            <GsapReveal>
              <h2
                data-reveal
                className="font-serif"
                style={{ fontSize: 'var(--text-h1)', fontWeight: 400, color: '#f5f2ed', lineHeight: 1.05, marginBottom: '20px' }}
                dangerouslySetInnerHTML={{ __html: content.aboutPage.contactTitleHtml }}
              />
              <p
                data-reveal
                className="font-mono"
                style={{ fontSize: 'var(--text-body-lg)', letterSpacing: '0.04em', color: '#666666', lineHeight: 1.9, marginBottom: '36px' }}
              >
                {content.aboutPage.contactBody}
              </p>
              <div data-reveal className="flex items-center" style={{ gap: '16px', flexWrap: 'wrap' }}>
                {content.aboutPage.contactLinks.map((link) => (
                  <a
                    key={`${link.label}-${link.href}`}
                    href={link.href}
                    className="font-mono"
                    style={{
                      fontSize: 'var(--text-meta)',
                      letterSpacing: '0.14em',
                      color: '#FF3120',
                      border: '1px solid #FF3120',
                      padding: '10px 20px',
                      textDecoration: 'none',
                    }}
                  >
                    {link.label} →
                  </a>
                ))}
              </div>
            </GsapReveal>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
