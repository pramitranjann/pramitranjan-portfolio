import { UnderConstructionPage } from '@/components/UnderConstructionPage'

export default async function PlayPage() {
  return (
    <UnderConstructionPage
      label="PLAY_"
      title="Play is warming up."
      body="This section is being built around playable web games and interaction experiments. It will be live once the games are ready."
      ctaLabel="BACK TO WORK"
      ctaHref="/work"
    />
  )
}

// import { PlayPageLive } from '@/components/PlayPageLive'

//export default async function PlayPage() {
  //return <PlayPageLive />
//}