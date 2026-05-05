import Image from 'next/image'
import Link from 'next/link'
import { GsapReveal } from '@/components/GsapReveal'
import { Footer } from '@/components/Footer'
import { Nav } from '@/components/Nav'
import { getPublicSiteContent } from '@/lib/site-content'
import type { SiteContent } from '@/lib/site-content-schema'


export default async function PlayPageLive({
  content: providedContent,
}: {
  content?: SiteContent
} = {}) {
  /*
    CONTENT SOURCE
    This pulls your site content from your content system.
    The games are stored inside caseStudies and filtered by section: 'play'.
  */
  const content = providedContent ?? await getPublicSiteContent()

  /*
    GAMES LIST
    This only shows case studies where section is 'play'.
    If a game is not showing, check that its content entry has:
    section: 'play'
  */
  const games = content.caseStudies.filter((item) => item.section === 'play' && !item.hidden)

  /*
    PLAY PAGE COPY
    This expects your content file to have copy.playPage.
    It controls the eyebrow, hero title, body text, and card CTA label.
  */
  const copy = content.copy.playPage

  return (
    <>
      <Nav />

      <main style={{ paddingTop: '57px' }}>
        {/* 
  PAGE HERO
  This copies the Creative page hero spacing and eyebrow line,
  but does not touch the Play cards below.
*/}
<section
  className="creative-hero-section border-b border-divider"
  style={{
    /*
      HERO HEIGHT
      This controls how tall the top Play intro section feels.
      Lower first number = less top space.
      Lower third number = less bottom space before the card grid.
    */
    padding: '48px var(--layout-page-gutter) 56px',
  }}
>
  <div
    className="eyebrow-animate flex items-center"
    style={{
      gap: '10px',
      marginBottom: '24px',
    }}
  >
    <div
      className="eyebrow-line"
      style={{
        width: '32px',
        height: '1px',
        backgroundColor: 'var(--color-red)',
      }}
    />
    <span
      className="eyebrow-label font-mono"
      style={{
        fontSize: 'var(--text-eyebrow)',
        letterSpacing: '0.18em',
        color: 'var(--color-red)',
      }}
    >
      {copy.eyebrow}
    </span>
  </div>

  <GsapReveal>
    <h1
      data-reveal
      className="font-serif"
      style={{
        fontSize: 'var(--text-h1)',
        fontWeight: 'var(--font-weight-serif)',
        color: 'var(--color-heading)',
        lineHeight: 1.05,
        marginBottom: '20px',
      }}
    >
      {copy.heroTitle}
    </h1>

    <p
      data-reveal
      className="font-mono"
      style={{
        fontSize: 'var(--text-body-lg)',
        letterSpacing: '0.04em',
        color: 'var(--color-body)',
        lineHeight: 1.9,
        maxWidth: '480px',
        margin: 0,
      }}
    >
      {copy.heroBody}
    </p>
  </GsapReveal>
</section>

        {/* 
          GAME CARD SECTION
          This is the full area that holds the grid of game cards.
          The padding controls how much breathing room the cards have from the page edges.
        */}
      <section
  className="work-grid-section"
  style={{ padding: '32px var(--layout-page-gutter) 56px' }}
>
           {/*

    GAME CARD GRID
    This controls how the cards sit on the Play page.

    gridTemplateColumns: 'repeat(2, 560px)'
    - makes exactly 2 columns on desktop
    - each card column is 560px wide

    columnGap:
    - controls the horizontal space between Bowl and Sling
    - lower this if you want them closer
    - try 8px if 16px still feels too wide

    rowGap:
    - controls vertical space between rows

    justifyContent: 'center'
    - keeps the two-card grid centered on the page
    - change to 'start' if you want the grid aligned left

  */}

<div
  className="grid play-card-grid"
  style={{
    /*
      PLAY CARD GRID POSITIONING

      This makes the Play grid align like the Photography grid:
      - starts from the same left page gutter
      - uses the full available content width
      - creates 2 equal columns on desktop

      columnGap controls the space between Bowl and Sling.
      rowGap controls the space between rows.
    */
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    columnGap: '16px',
    rowGap: '16px',
    width: '100%',
    margin: 0,
  }}
>
            {games.map((game) => {
              /*
                CARD IMAGE SOURCE

                The card will look for an image in this order:
                1. heroImage
                2. solutionHeroImage
                3. researchImage

                Best option:
                Add heroImage to each game content entry.

                Example:
                heroImage: '/images/play/bowl-cover.jpg'
              */
              const image =
                game.heroImage ||
                game.solutionHeroImage ||
                game.researchImage ||
                ''

              return (
                <Link
                  key={game.slug}
                  href={`/play/${game.slug}`}
                  className="portfolio-card block"
                  style={{
  background: '#111111',
  border: '1px solid #1a1a1a',
  /*

    CARD INNER SPACING

    Reduce this to make the full card shorter.

    16px = current

    12px = tighter

  */
  padding: '12px',
  textDecoration: 'none',

  /*
    This makes each card fill its grid column.
    The grid maxWidth on the parent grid controls the final card size.
  */
  width: '100%',
  maxWidth: 'none',
}}
                >
                  {/* 
                    CARD IMAGE AREA
                    This is the visual preview block at the top of each card.

                    aspectRatio: '16 / 10' controls the shape.
                    Use '16 / 9' for wider images.
                    Use '4 / 3' for slightly taller images.
                  */}
                  <div
                    className="play-card-image"
                    style={{
  position: 'relative',
  width: '100%',
  aspectRatio: '16 / 5',
  background: '#161616',
  border: '1px solid #222222',
  overflow: 'hidden',
  marginBottom: '10px',
}}
                  >
                    {image ? (
                      <Image
                        src={image}
                        alt={game.title}
                        fill
                        style={{
                          /*
                            IMAGE FIT
                            cover = fills the whole image box and crops if needed.
                            contain = shows the full image but may leave empty space.
                          */
                          objectFit: 'cover',
                          objectPosition: 'center center',
                        }}
                        sizes="(max-width: 767px) 100vw, 520px"
                      />
                    ) : (
                      /*
                        FALLBACK STATE
                        This shows when a game does not have a preview image yet.
                        Add heroImage to the game content to replace this.
                      */
                      <div
                        className="font-mono"
                        style={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#444444',
                          fontSize: 'var(--text-meta)',
                          letterSpacing: '0.12em',
                        }}
                      >
                        GAME PREVIEW
                      </div>
                    )}
                  </div>

                  {/* 
                    CARD TITLE
                    This uses the game title from your content file.
                  */}
                  <h2
                    className="font-serif"
                    style={{
                      fontSize: 'var(--text-h3)',
                      fontWeight: 'var(--font-weight-serif)',
                      color: 'var(--color-heading)',
                      lineHeight: 1.15,
                      marginBottom: '18px',
                    }}
                  >
                    {game.title}
                  </h2>

                  {/* 
                    CARD DESCRIPTION
                    This uses the oneliner from your game content.
                  */}
                  <p
                    className="font-mono"
                    style={{
                      fontSize: 'var(--text-body)',
                      letterSpacing: '0.04em',
                      color: 'var(--color-body)',
                      lineHeight: 1.5,
                      marginBottom: '10px',
                    }}
                  >
                    {game.oneliner}
                  </p>

                  {/* 
                    CARD META
                    This shows the game type, for example:
                    WEB GAME · 2026
                  */}
                  <p
                    className="font-mono"
                    style={{
                      fontSize: 'var(--text-meta)',
                      letterSpacing: '0.12em',
                      color: 'var(--color-label)',
                      textTransform: 'uppercase',
                      marginBottom: '8px',
                    }}
                  >
                    {game.type}
                  </p>

                  {/* 
                    CARD CTA
                    This is the red action text at the bottom.
                    It uses copy.playPage.cardCtaLabel from your content file.
                  */}
                  <p
                    className="font-mono"
                    style={{
                      fontSize: 'var(--text-meta)',
                      letterSpacing: '0.12em',
                      color: 'var(--color-red)',
                      marginTop: 0,
                      marginBottom: 0,
                    }}
                  >
                    {copy.cardCtaLabel} <span className="arrow-nudge">→</span>
                  </p>
                </Link>
              )
            })}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
