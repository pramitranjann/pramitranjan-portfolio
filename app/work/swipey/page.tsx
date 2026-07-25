import { SwipeyHubClient } from '@/components/SwipeyHubClient'
import { getPublicSiteContent, getSwipeyStories } from '@/lib/site-content'

export default async function SwipeyPage() {
  const [stories, content] = await Promise.all([getSwipeyStories(), getPublicSiteContent()])
  const project = content.workPage.projects.find((item) => item.href === '/work/swipey')
  return (
    <SwipeyHubClient
      stories={stories}
      cardStyle={content.design.supportingCards}
      hoverPreviewSettings={content.design.hoverPreviews}
      coverImage={project?.cover || '/work/swipey-fields/cover.png'}
      coverBackground={project?.coverBackground}
      coverFit={project?.coverFit}
    />
  )
}
