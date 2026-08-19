// app/about/page.tsx
import type { Metadata } from 'next'
import { JsonLd } from '@/components/JsonLd'
import { UnderConstructionPage } from '@/components/UnderConstructionPage'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { AboutPageClient } from '@/components/AboutPageClient'
import { getPublicSiteContent } from '@/lib/site-content'
import {
  buildBreadcrumbJsonLd,
  buildMetadata,
  buildProfilePageJsonLd,
  getEmailFromLinks,
  getSameAsLinks,
  shouldIndexPage,
} from '@/lib/seo'
import { getSitePage } from '@/lib/site-pages'

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublicSiteContent()
  const pageSettings = getSitePage(content, 'about')

  return buildMetadata({
    title: 'About',
    description: `${content.aboutPage.heroBody} ${content.aboutPage.whoIAm}`,
    path: '/about',
    keywords: ['About Pramit Ranjan', 'Pramit Ranjan SCAD', 'Pramit Ranjan biography'],
    noIndex: !shouldIndexPage(pageSettings?.status),
  })
}

export default async function AboutPage() {
  const content = await getPublicSiteContent()
  const pageSettings = getSitePage(content, 'about')
  const copy = content.copy.aboutPage
  const contactLinks = [...content.copy.home.contactLinks, ...content.aboutPage.contactLinks]
  const sameAsLinks = getSameAsLinks(contactLinks)
  const email = getEmailFromLinks(contactLinks)

  if (pageSettings?.status === 'construction') {
    return (
      <UnderConstructionPage
        label="ABOUT_"
        title={pageSettings.constructionTitle}
        body={pageSettings.constructionBody}
        ctaLabel={pageSettings.constructionCtaLabel}
        ctaHref={pageSettings.constructionCtaHref ?? '/'}
      />
    )
  }

  if (pageSettings?.status === 'hidden') {
    return (
      <UnderConstructionPage
        label="HIDDEN_"
        title="This page is not currently public."
        body="This section is temporarily hidden while the work is being updated."
        ctaLabel="BACK TO HOME"
        ctaHref="/"
      />
    )
  }

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
          ]),
          buildProfilePageJsonLd({
            description: `${content.aboutPage.heroBody} ${content.aboutPage.whoIAm}`,
            sameAs: sameAsLinks,
            email,
          }),
        ]}
      />
      <Nav />
      <main style={{ paddingTop: '57px' }}>
        <AboutPageClient
          heroBody={content.aboutPage.heroBody}
          whoIAm={content.aboutPage.whoIAm}
          experience={content.aboutPage.experience}
          education={content.aboutPage.education}
          professionalActivities={content.aboutPage.professionalActivities}
          tools={content.aboutPage.tools}
          nowCards={content.aboutPage.nowCards}
          contactTitleHtml={content.aboutPage.contactTitleHtml}
          contactBody={content.aboutPage.contactBody}
          contactLinks={content.aboutPage.contactLinks}
          labels={{
            experience: copy.experienceLabel,
            education: copy.educationLabel,
            activities: copy.professionalActivitiesLabel,
            tools: copy.toolsLabel,
            cv: copy.cvLabel,
          }}
        />
      </main>
      <Footer />
    </>
  )
}
