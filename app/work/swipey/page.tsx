import { SwipeyHubClient } from '@/components/SwipeyHubClient'
import { getPublicSiteContent, getSwipeyStories } from '@/lib/site-content'

export default async function SwipeyPage() {
  const [stories, content] = await Promise.all([getSwipeyStories(), getPublicSiteContent()])
  return (
    <SwipeyHubClient
      stories={stories}
      cardStyle={content.design.supportingCards}
      hoverPreviewSettings={content.design.hoverPreviews}
    />
  )
}
