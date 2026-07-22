import { isSafeEmbedUrl, isSafeLinkHref, isSafeRichTextHtml } from '@/lib/security'

export interface WorkProject {
  title: string
  oneliner: string
  tags: string[]
  href: string
  cover?: string
  hoverImage?: string
  coverPosition?: string
  coverScale?: string
  hoverImagePosition?: string
  hoverImageScale?: string
  previewImages?: string[]
}

export interface HomeSection {
  heading: string
  body: string
  items: WorkProject[]
}

export interface HomeAboutContent {
  body: string
  spotifyLabel: string
}

export interface EntryItem {
  org: string
  role: string
  date: string
  desc: string
}

export interface LinkItem {
  label: string
  href: string
}

export interface NowCard {
  label: string
  value: string
  sub: string
}

export interface PhotographyCity {
  slug: string
  title: string
  desc: string
  cover: string
  previewImages?: string[]
  imagePosition?: string
  imageScale?: string
  hoverImagePosition?: string
  hoverImageScale?: string
  comingSoon: boolean
}

export interface PhotographyGallery {
  slug: string
  city: string
  descriptor: string
  images: string[]
  contextTitle?: string
  contextBody?: string
  imageDetails?: PhotographyImageDetails[]
  spotify?: ProjectSpotifyMedia
}

export interface PhotographyImageDetails {
  alt?: string
  title?: string
  meta?: string
  caption?: string
}

export interface SpotifyReference {
  spotifyId?: string
  spotifyUrl?: string
}

export interface SpotifyTrackReference extends SpotifyReference {}

export interface SpotifyPlaylistReference extends SpotifyReference {
  description?: string
}

export interface ProjectSpotifyMedia {
  context?: string
  soundtrack?: SpotifyTrackReference
  playlist?: SpotifyPlaylistReference
}

export interface CardStyleSettings {
  titleSize: string
  metaSize: string
  bodySize?: string
  imageRatio: string
  cardPadding: string
  imageFit: 'contain' | 'cover'
  imageBackground: string
  imageBorderColor: string
  imageBorderWidth: string
}

export interface HoverPreviewSettings {
  enabled: boolean
  width: string
  padding: string
  offsetX: string
  offsetY: string
  background: string
  borderColor: string
  titleColor: string
  bodyColor: string
  metaColor: string
  accentColor: string
  shadow: string
}

export interface PhotographyCardStyleSettings {
  titleSize: string
  bodySize: string
  imageAspectRatio: string
  cardPadding: string
  imageFit: 'contain' | 'cover'
  imageBackground: string
  imageBorderColor: string
  imageBorderWidth: string
}

export interface GalleryStyleSettings {
  imageAspectRatio: string
  gridGap: string
  descriptorSize: string
}

export interface NowCardStyleSettings {
  labelSize: string
  titleSize: string
  bodySize: string
  cardPadding: string
}

export interface ListeningCardStyleSettings {
  labelSize: string
  titleSize: string
  artistSize: string
  creativeWidgetRestingLabel: string
  creativeWidgetRestingSubcopy: string
  creativeWidgetHeading: string
  cardPadding: string
  artworkSize: string
  hoverArtworkSize: string
  hoverMinHeight: string
  hoverScale: string
  hoverProgressHeight: string
  hoverCopyPlaying: string
  hoverCopyIdle: string
  progressMetaSize: string
  cardBackground: string
  cardBorderColor: string
  labelColor: string
  titleColor: string
  artistColor: string
  idleDotColor: string
  activeDotColor: string
  artworkBorderColor: string
  progressTrackColor: string
  progressFillColor: string
  progressMetaColor: string
}

export interface CaseStudyNavStyleSettings {
  background: string
  borderColor: string
  dividerColor: string
  activeTextColor: string
  inactiveTextColor: string
  activeBackground: string
  activeIndicatorColor: string
}

export interface MotionSettings {
  pageRevealDistance: number
  pageRevealDuration: number
  pageRevealStagger: number
  simpleRevealDistance: number
  simpleRevealDuration: number
  simpleRevealStagger: number
  gridStartScale: number
  gridRevealDuration: number
  gridRevealStagger: number
  eyebrowOffset: number
  eyebrowLineDuration: number
  eyebrowLabelDuration: number
  eyebrowLabelDelay: number
  introStartDelay: number
  introKeyGap: number
  introPauseBeforeLift: number
  introLiftDuration: number
}

export interface AudioSettings {
  interactionVolume: number
}

export interface LayoutSettings {
  pageGutter: string
  heroPaddingY: string
  sectionPaddingY: string
  compactSectionPaddingY: string
  cardGap: string
  navPaddingY: string
  footerPaddingY: string
}

export interface TypographySettings {
  displayFont: string
  serifWeight: string
  monoWeight: string
  displaySize: string
  heroSize: string
  h1Size: string
  h2Size: string
  h3Size: string
  eyebrowSize: string
  bodyLgSize: string
  bodySize: string
  metaSize: string
  headingColor: string
  bodyColor: string
  labelColor: string
  accentColor: string
}

export interface NavigationStyleSettings {
  navBackground: string
  navBorderColor: string
  navLogoColor: string
  navLogoSize: string
  navLinkColor: string
  navLinkHoverColor: string
  navLinkActiveColor: string
  navDotColor: string
  navLinkSize: string
  backLinkColor: string
  readingTrackColor: string
  readingFillColor: string
  footerBorderColor: string
  footerTextColor: string
  footerMarkColor: string
  socialLinkColor: string
  socialLinkUnderlineColor: string
}

export interface HeroStageCopy {
  number: string
  titleHtml: string
  body: string
  footerLabel?: string
}

export interface HomePageCopy {
  heroStages: HeroStageCopy[]
  aboutEyebrow: string
  aboutTitleHtml: string
  aboutReadMoreLabel: string
  photographyEyebrow: string
  photographyTitleHtml: string
  photographyBody: string
  photographyCtaLabel: string
  contactTitle: string
  contactAccent: string
  contactLinks: LinkItem[]
}

export interface AboutPageCopy {
  heroEyebrow: string
  heroTitleHtml: string
  cvLabel: string
  scrollLabel: string
  whoIAmLabel: string
  onRotationLabel: string
  experienceLabel: string
  professionalActivitiesLabel: string
  educationLabel: string
  toolsLabel: string
}

export interface WorkPageCopy {
  eyebrow: string
  emptyStateLabel: string
}

export type SitePageKey = 'work' | 'play' | 'creative' | 'about'
export type SitePageStatus = 'live' | 'construction' | 'hidden'

export interface SitePageSettings {
  key: SitePageKey
  label: string
  href: string
  order: number
  visible: boolean
  status: SitePageStatus
  constructionTitle?: string
  constructionBody?: string
  constructionCtaLabel?: string
  constructionCtaHref?: string
}

export interface CreativePageCopy {
  eyebrow: string
  heroTitle: string
  heroBody: string
  photographyLabel: string
  photographyCount: string
  mixedMediaLabel: string
  mixedMediaCount: string
  brandingLabel: string
  brandingCount: string
  mixedMediaIndexTitle: string
  brandingIndexTitle: string
  backLabel: string
  photoBackLabel: string
}

export interface PlayPageCopy {
  eyebrow: string
  heroTitle: string
  heroBody: string
  cardCtaLabel: string
}

export interface CaseStudyUiCopy {
  problemLabel: string
  roleLabel: string
  researchLabel: string
  challengeLabel: string
  processLabel: string
  solutionLabel: string
  outcomesLabel: string
  keyInsightLabel: string
  prevLabel: string
  nextLabel: string
  navProblemLabel: string
  navRoleLabel: string
  navResearchLabel: string
  navChallengeLabel: string
  navProcessLabel: string
  navSolutionLabel: string
  navOutcomesLabel: string
  defaultProblem: string
  defaultRole: string
}

export interface ProjectLink {
  slug: string
  title: string
}

export type CaseStudySection = 'work' | 'mixed-media' | 'branding' | 'play'
export type CaseStudyMediaBlockSection = 'research' | 'challenge' | 'process' | 'solution'
export type CaseStudyMediaBlockLayout = 'single' | 'pair'
export type CaseStudyMediaAlign = 'left' | 'center' | 'right'
export type CaseStudyMediaPlacement = 'below' | 'side-right' | 'between-solution-outcomes'

export interface CaseStudyMediaSlotSettings {
  height?: string
  fit?: 'contain' | 'cover'
  position?: string
  background?: string
}

export interface CaseStudyImagePairSettings {
  height?: string
  gap?: string
  fit?: 'contain' | 'cover'
  firstPosition?: string
  secondPosition?: string
  background?: string
}

export interface CaseStudyMediaSettings {
  hero?: CaseStudyMediaSlotSettings
  research?: CaseStudyMediaSlotSettings
  challengePair?: CaseStudyImagePairSettings
  solutionHero?: CaseStudyMediaSlotSettings
  solutionPair?: CaseStudyImagePairSettings
}

export interface CaseStudyMediaImage {
  src: string
  alt?: string
  fit?: 'contain' | 'cover'
  position?: string
  aspectRatio?: string
  background?: string
}

export interface CaseStudyMediaBlock {
  id: string
  section: CaseStudyMediaBlockSection
  hidden?: boolean
  layout: CaseStudyMediaBlockLayout
  placement?: CaseStudyMediaPlacement
  portraitSplitCount?: 2 | 3
  align?: CaseStudyMediaAlign
  width?: string
  inlineTextWidth?: string
  inlineMediaMinWidth?: string
  gap?: string
  images: CaseStudyMediaImage[]
}

export interface CaseStudyContent {
  slug: string
  section: CaseStudySection
  useEmbedPreview?: boolean
  hidden?: boolean
  title: string
  oneliner: string
  type: string
  tags: string[]
  prev: ProjectLink | null
  next: ProjectLink | null
  backHref?: string
  backLabel?: string
  solution?: string
  outcomes?: string
  problemHeadline?: string
  roleHeadline?: string
  researchHeadline?: string
  challengeHeadline?: string
  processHeadline?: string
  solutionHeadline?: string
  outcomesHeadline?: string
  pullQuote?: string
  heroImage?: string
  cardImagePosition?: string
  cardImageScale?: string
  cardHoverImagePosition?: string
  cardHoverImageScale?: string
  researchImage?: string
  challengeImages?: string[]
  solutionHeroImage?: string
  solutionImages?: string[]
  mediaSettings?: CaseStudyMediaSettings
  mediaBlocks?: CaseStudyMediaBlock[]
  uiCopy?: CaseStudyUiCopy
  solutionEmbedUrl?: string
  solutionEmbedTitle?: string
  solutionEmbedAspectRatio?: string
  solutionEmbedWidth?: string
  solutionEmbedCalloutLabel?: string
  solutionEmbedCalloutTitle?: string
  solutionEmbedCalloutBody?: string
  solutionEmbedCtaLabel?: string
  spotify?: ProjectSpotifyMedia
}

export interface SiteContent {
  home: {
    selectedWork: HomeSection
    moreWork: HomeSection
    about: HomeAboutContent
  }
  aboutPage: {
    heroBody: string
    whoIAm: string
    experience: EntryItem[]
    professionalActivities: EntryItem[]
    education: EntryItem[]
    tools: string[]
    nowHeading: string
    nowDescription: string
    nowCards: NowCard[]
    contactTitleHtml: string
    contactBody: string
    contactLinks: LinkItem[]
  }
  workPage: {
    heroTitle: string
    heroBody: string
    projects: WorkProject[]
  }
  photography: {
    heroTitle: string
    cities: PhotographyCity[]
    galleries: PhotographyGallery[]
  }
  design: {
    supportingCards: CardStyleSettings
    photographyCards: PhotographyCardStyleSettings
    hoverPreviews: HoverPreviewSettings
    gallery: GalleryStyleSettings
    nowCards: NowCardStyleSettings
    listeningCard: ListeningCardStyleSettings
    caseStudyNav: CaseStudyNavStyleSettings
    layout: LayoutSettings
    typography: TypographySettings
    navigation: NavigationStyleSettings
    motion: MotionSettings
    audio: AudioSettings
  }
  copy: {
    home: HomePageCopy
    aboutPage: AboutPageCopy
    workPage: WorkPageCopy
    creativePage: CreativePageCopy
    playPage: PlayPageCopy
    caseStudy: CaseStudyUiCopy
  }
  sitePages: SitePageSettings[]
  caseStudies: CaseStudyContent[]
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString)
}

function isNullable<T>(value: unknown, predicate: (value: unknown) => value is T): value is T | null {
  return value === null || predicate(value)
}

function isWorkProject(value: unknown): value is WorkProject {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    isString(item.title) &&
    isString(item.oneliner) &&
    isStringArray(item.tags) &&
    isString(item.href) &&
    isSafeLinkHref(item.href) &&
    (item.cover === undefined || isString(item.cover)) &&
    (item.hoverImage === undefined || isString(item.hoverImage)) &&
    (item.coverPosition === undefined || isString(item.coverPosition)) &&
    isOptionalString(item.coverScale) &&
    isOptionalString(item.hoverImagePosition) &&
    isOptionalString(item.hoverImageScale) &&
    isOptionalStringArray(item.previewImages)
  )
}

function isEntryItem(value: unknown): value is EntryItem {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return isString(item.org) && isString(item.role) && isString(item.date) && isString(item.desc)
}

function isLinkItem(value: unknown): value is LinkItem {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return isString(item.label) && isString(item.href) && isSafeLinkHref(item.href)
}

function isNowCard(value: unknown): value is NowCard {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return isString(item.label) && isString(item.value) && isString(item.sub)
}

function isPhotographyCity(value: unknown): value is PhotographyCity {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    isString(item.slug) &&
    isString(item.title) &&
    isString(item.desc) &&
    isString(item.cover) &&
    typeof item.comingSoon === 'boolean' &&
    (item.imagePosition === undefined || isString(item.imagePosition)) &&
    isOptionalString(item.imageScale) &&
    isOptionalString(item.hoverImagePosition) &&
    isOptionalString(item.hoverImageScale) &&
    isOptionalStringArray(item.previewImages)
  )
}

function isHomeSection(value: unknown): value is HomeSection {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return isString(item.heading) && isString(item.body) && Array.isArray(item.items) && item.items.every(isWorkProject)
}

function isPhotographyGallery(value: unknown): value is PhotographyGallery {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    isString(item.slug) &&
    isString(item.city) &&
    isString(item.descriptor) &&
    isStringArray(item.images) &&
    isOptionalString(item.contextTitle) &&
    isOptionalString(item.contextBody) &&
    (item.imageDetails === undefined || (Array.isArray(item.imageDetails) && item.imageDetails.every(isPhotographyImageDetails))) &&
    (item.spotify === undefined || isProjectSpotifyMedia(item.spotify))
  )
}

function isPhotographyImageDetails(value: unknown): value is PhotographyImageDetails {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    isOptionalString(item.alt) &&
    isOptionalString(item.title) &&
    isOptionalString(item.meta) &&
    isOptionalString(item.caption)
  )
}

function isSpotifyReference(value: unknown): value is SpotifyReference {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return isOptionalString(item.spotifyId) && isOptionalString(item.spotifyUrl)
}

function isSpotifyPlaylistReference(value: unknown): value is SpotifyPlaylistReference {
  if (!isSpotifyReference(value)) return false
  const item = value as Record<string, unknown>
  return isOptionalString(item.description)
}

function isProjectSpotifyMedia(value: unknown): value is ProjectSpotifyMedia {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    isOptionalString(item.context) &&
    (item.soundtrack === undefined || isSpotifyReference(item.soundtrack)) &&
    (item.playlist === undefined || isSpotifyPlaylistReference(item.playlist))
  )
}

function isCardStyleSettings(value: unknown): value is CardStyleSettings {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    isString(item.titleSize) &&
    isString(item.metaSize) &&
    isString(item.imageRatio) &&
    isString(item.cardPadding) &&
    (item.imageFit === 'contain' || item.imageFit === 'cover') &&
    isString(item.imageBackground) &&
    isString(item.imageBorderColor) &&
    isString(item.imageBorderWidth) &&
    (item.bodySize === undefined || isString(item.bodySize))
  )
}

function isHoverPreviewSettings(value: unknown): value is HoverPreviewSettings {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.enabled === 'boolean' &&
    isString(item.width) &&
    isString(item.padding) &&
    isString(item.offsetX) &&
    isString(item.offsetY) &&
    isString(item.background) &&
    isString(item.borderColor) &&
    isString(item.titleColor) &&
    isString(item.bodyColor) &&
    isString(item.metaColor) &&
    isString(item.accentColor) &&
    isString(item.shadow)
  )
}

function isPhotographyCardStyleSettings(value: unknown): value is PhotographyCardStyleSettings {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    isString(item.titleSize) &&
    isString(item.bodySize) &&
    isString(item.imageAspectRatio) &&
    isString(item.cardPadding) &&
    (item.imageFit === 'contain' || item.imageFit === 'cover') &&
    isString(item.imageBackground) &&
    isString(item.imageBorderColor) &&
    isString(item.imageBorderWidth)
  )
}

function isGalleryStyleSettings(value: unknown): value is GalleryStyleSettings {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return isString(item.imageAspectRatio) && isString(item.gridGap) && isString(item.descriptorSize)
}

function isNowCardStyleSettings(value: unknown): value is NowCardStyleSettings {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return isString(item.labelSize) && isString(item.titleSize) && isString(item.bodySize) && isString(item.cardPadding)
}

function isListeningCardStyleSettings(value: unknown): value is ListeningCardStyleSettings {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    isString(item.labelSize) &&
    isString(item.titleSize) &&
    isString(item.artistSize) &&
    isString(item.creativeWidgetRestingLabel) &&
    isString(item.creativeWidgetRestingSubcopy) &&
    isString(item.creativeWidgetHeading) &&
    isString(item.cardPadding) &&
    isString(item.artworkSize) &&
    isString(item.hoverArtworkSize) &&
    isString(item.hoverMinHeight) &&
    isString(item.hoverScale) &&
    isString(item.hoverProgressHeight) &&
    isString(item.hoverCopyPlaying) &&
    isString(item.hoverCopyIdle) &&
    isString(item.progressMetaSize) &&
    isString(item.cardBackground) &&
    isString(item.cardBorderColor) &&
    isString(item.labelColor) &&
    isString(item.titleColor) &&
    isString(item.artistColor) &&
    isString(item.idleDotColor) &&
    isString(item.activeDotColor) &&
    isString(item.artworkBorderColor) &&
    isString(item.progressTrackColor) &&
    isString(item.progressFillColor) &&
    isString(item.progressMetaColor)
  )
}

function isCaseStudyNavStyleSettings(value: unknown): value is CaseStudyNavStyleSettings {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    isString(item.background) &&
    isString(item.borderColor) &&
    isString(item.dividerColor) &&
    isString(item.activeTextColor) &&
    isString(item.inactiveTextColor) &&
    isString(item.activeBackground) &&
    isString(item.activeIndicatorColor)
  )
}

function isHeroStageCopy(value: unknown): value is HeroStageCopy {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    isString(item.number) &&
    isString(item.titleHtml) &&
    isSafeRichTextHtml(item.titleHtml) &&
    isString(item.body) &&
    isOptionalString(item.footerLabel)
  )
}

function isLayoutSettings(value: unknown): value is LayoutSettings {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    isString(item.pageGutter) &&
    isString(item.heroPaddingY) &&
    isString(item.sectionPaddingY) &&
    isString(item.compactSectionPaddingY) &&
    isString(item.cardGap) &&
    isString(item.navPaddingY) &&
    isString(item.footerPaddingY)
  )
}

function isTypographySettings(value: unknown): value is TypographySettings {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    isString(item.displayFont) &&
    isString(item.serifWeight) &&
    isString(item.monoWeight) &&
    isString(item.displaySize) &&
    isString(item.heroSize) &&
    isString(item.h1Size) &&
    isString(item.h2Size) &&
    isString(item.h3Size) &&
    isString(item.eyebrowSize) &&
    isString(item.bodyLgSize) &&
    isString(item.bodySize) &&
    isString(item.metaSize) &&
    isString(item.headingColor) &&
    isString(item.bodyColor) &&
    isString(item.labelColor) &&
    isString(item.accentColor)
  )
}

function isNavigationStyleSettings(value: unknown): value is NavigationStyleSettings {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    isString(item.navBackground) &&
    isString(item.navBorderColor) &&
    isString(item.navLogoColor) &&
    isString(item.navLogoSize) &&
    isString(item.navLinkColor) &&
    isString(item.navLinkHoverColor) &&
    isString(item.navLinkActiveColor) &&
    isString(item.navDotColor) &&
    isString(item.navLinkSize) &&
    isString(item.backLinkColor) &&
    isString(item.readingTrackColor) &&
    isString(item.readingFillColor) &&
    isString(item.footerBorderColor) &&
    isString(item.footerTextColor) &&
    isString(item.footerMarkColor) &&
    isString(item.socialLinkColor) &&
    isString(item.socialLinkUnderlineColor)
  )
}

function isHomePageCopy(value: unknown): value is HomePageCopy {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    Array.isArray(item.heroStages) &&
    item.heroStages.every(isHeroStageCopy) &&
    isString(item.aboutEyebrow) &&
    isString(item.aboutTitleHtml) &&
    isSafeRichTextHtml(item.aboutTitleHtml) &&
    isString(item.aboutReadMoreLabel) &&
    isString(item.photographyEyebrow) &&
    isString(item.photographyTitleHtml) &&
    isSafeRichTextHtml(item.photographyTitleHtml) &&
    isString(item.photographyBody) &&
    isString(item.photographyCtaLabel) &&
    isString(item.contactTitle) &&
    isString(item.contactAccent) &&
    Array.isArray(item.contactLinks) &&
    item.contactLinks.every(isLinkItem)
  )
}

function isAboutPageCopy(value: unknown): value is AboutPageCopy {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    isString(item.heroEyebrow) &&
    isString(item.heroTitleHtml) &&
    isSafeRichTextHtml(item.heroTitleHtml) &&
    isString(item.cvLabel) &&
    isString(item.scrollLabel) &&
    isString(item.whoIAmLabel) &&
    isString(item.onRotationLabel) &&
    isString(item.experienceLabel) &&
    isString(item.professionalActivitiesLabel) &&
    isString(item.educationLabel) &&
    isString(item.toolsLabel)
  )
}

function isWorkPageCopy(value: unknown): value is WorkPageCopy {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return isString(item.eyebrow) && isString(item.emptyStateLabel)
}

function isSitePageKey(value: unknown): value is SitePageKey {
  return value === 'work' || value === 'play' || value === 'creative' || value === 'about'
}

function isSitePageStatus(value: unknown): value is SitePageStatus {
  return value === 'live' || value === 'construction' || value === 'hidden'
}

function isSitePageSettings(value: unknown): value is SitePageSettings {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>

  return (
    isSitePageKey(item.key) &&
    isString(item.label) &&
    isString(item.href) &&
    isSafeLinkHref(item.href) &&
    typeof item.order === 'number' &&
    typeof item.visible === 'boolean' &&
    isSitePageStatus(item.status) &&
    isOptionalString(item.constructionTitle) &&
    isOptionalString(item.constructionBody) &&
    isOptionalString(item.constructionCtaLabel) &&
    (item.constructionCtaHref === undefined || (isString(item.constructionCtaHref) && isSafeLinkHref(item.constructionCtaHref)))
  )
}

function isCreativePageCopy(value: unknown): value is CreativePageCopy {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    isString(item.eyebrow) &&
    isString(item.heroTitle) &&
    isString(item.heroBody) &&
    isString(item.photographyLabel) &&
    isString(item.photographyCount) &&
    isString(item.mixedMediaLabel) &&
    isString(item.mixedMediaCount) &&
    isString(item.brandingLabel) &&
    isString(item.brandingCount) &&
    isString(item.mixedMediaIndexTitle) &&
    isString(item.brandingIndexTitle) &&
    isString(item.backLabel) &&
    isString(item.photoBackLabel)
  )
}

function isPlayPageCopy(value: unknown): value is PlayPageCopy {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    isString(item.eyebrow) &&
    isString(item.heroTitle) &&
    isString(item.heroBody) &&
    isString(item.cardCtaLabel)
  )
}

function isCaseStudyUiCopy(value: unknown): value is CaseStudyUiCopy {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    isString(item.problemLabel) &&
    isString(item.roleLabel) &&
    isString(item.researchLabel) &&
    isString(item.challengeLabel) &&
    isString(item.processLabel) &&
    isString(item.solutionLabel) &&
    isString(item.outcomesLabel) &&
    isString(item.keyInsightLabel) &&
    isString(item.prevLabel) &&
    isString(item.nextLabel) &&
    isString(item.navProblemLabel) &&
    isString(item.navRoleLabel) &&
    isString(item.navResearchLabel) &&
    isString(item.navChallengeLabel) &&
    isString(item.navProcessLabel) &&
    isString(item.navSolutionLabel) &&
    isString(item.navOutcomesLabel) &&
    isString(item.defaultProblem) &&
    isString(item.defaultRole)
  )
}

function isCaseStudyMediaSlotSettings(value: unknown): value is CaseStudyMediaSlotSettings {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    isOptionalString(item.height) &&
    (item.fit === undefined || item.fit === 'contain' || item.fit === 'cover') &&
    isOptionalString(item.position) &&
    isOptionalString(item.background)
  )
}

function isCaseStudyImagePairSettings(value: unknown): value is CaseStudyImagePairSettings {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    isOptionalString(item.height) &&
    isOptionalString(item.gap) &&
    (item.fit === undefined || item.fit === 'contain' || item.fit === 'cover') &&
    isOptionalString(item.firstPosition) &&
    isOptionalString(item.secondPosition) &&
    isOptionalString(item.background)
  )
}

function isCaseStudyMediaSettings(value: unknown): value is CaseStudyMediaSettings {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    (item.hero === undefined || isCaseStudyMediaSlotSettings(item.hero)) &&
    (item.research === undefined || isCaseStudyMediaSlotSettings(item.research)) &&
    (item.challengePair === undefined || isCaseStudyImagePairSettings(item.challengePair)) &&
    (item.solutionHero === undefined || isCaseStudyMediaSlotSettings(item.solutionHero)) &&
    (item.solutionPair === undefined || isCaseStudyImagePairSettings(item.solutionPair))
  )
}

function isCaseStudyMediaBlockSection(value: unknown): value is CaseStudyMediaBlockSection {
  return value === 'research' || value === 'challenge' || value === 'process' || value === 'solution'
}

function isCaseStudyMediaAlign(value: unknown): value is CaseStudyMediaAlign {
  return value === 'left' || value === 'center' || value === 'right'
}

function isCaseStudyMediaPlacement(value: unknown): value is CaseStudyMediaPlacement {
  return value === 'below' || value === 'side-right' || value === 'between-solution-outcomes'
}

function isCaseStudyMediaImage(value: unknown): value is CaseStudyMediaImage {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    isString(item.src) &&
    isOptionalString(item.alt) &&
    (item.fit === undefined || item.fit === 'contain' || item.fit === 'cover') &&
    isOptionalString(item.position) &&
    isOptionalString(item.aspectRatio) &&
    isOptionalString(item.background)
  )
}

function isCaseStudyMediaBlock(value: unknown): value is CaseStudyMediaBlock {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    isString(item.id) &&
    isCaseStudyMediaBlockSection(item.section) &&
    (item.hidden === undefined || typeof item.hidden === 'boolean') &&
    (item.layout === 'single' || item.layout === 'pair') &&
    (item.placement === undefined || isCaseStudyMediaPlacement(item.placement)) &&
    (item.portraitSplitCount === undefined || item.portraitSplitCount === 2 || item.portraitSplitCount === 3) &&
    (item.align === undefined || isCaseStudyMediaAlign(item.align)) &&
    isOptionalString(item.width) &&
    isOptionalString(item.inlineTextWidth) &&
    isOptionalString(item.inlineMediaMinWidth) &&
    isOptionalString(item.gap) &&
    Array.isArray(item.images) &&
    item.images.every(isCaseStudyMediaImage)
  )
}

function isMotionSettings(value: unknown): value is MotionSettings {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    typeof item.pageRevealDistance === 'number' &&
    typeof item.pageRevealDuration === 'number' &&
    typeof item.pageRevealStagger === 'number' &&
    typeof item.simpleRevealDistance === 'number' &&
    typeof item.simpleRevealDuration === 'number' &&
    typeof item.simpleRevealStagger === 'number' &&
    typeof item.gridStartScale === 'number' &&
    typeof item.gridRevealDuration === 'number' &&
    typeof item.gridRevealStagger === 'number' &&
    typeof item.eyebrowOffset === 'number' &&
    typeof item.eyebrowLineDuration === 'number' &&
    typeof item.eyebrowLabelDuration === 'number' &&
    typeof item.eyebrowLabelDelay === 'number' &&
    typeof item.introStartDelay === 'number' &&
    typeof item.introKeyGap === 'number' &&
    typeof item.introPauseBeforeLift === 'number' &&
    typeof item.introLiftDuration === 'number'
  )
}

function isAudioSettings(value: unknown): value is AudioSettings {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.interactionVolume === 'number'
}

function isProjectLink(value: unknown): value is ProjectLink {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return isString(item.slug) && isString(item.title)
}

function isCaseStudySection(value: unknown): value is CaseStudySection {
  return value === 'work' || value === 'mixed-media' || value === 'branding' || value === 'play'
}

function isOptionalString(value: unknown) {
  return value === undefined || isString(value)
}

function isOptionalStringArray(value: unknown) {
  return value === undefined || isStringArray(value)
}

function isCaseStudyContent(value: unknown): value is CaseStudyContent {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>

  return (
    isString(item.slug) &&
    isCaseStudySection(item.section) &&
    (item.hidden === undefined || typeof item.hidden === 'boolean') &&
    isString(item.title) &&
    isString(item.oneliner) &&
    isString(item.type) &&
    isStringArray(item.tags) &&
    isNullable(item.prev, isProjectLink) &&
    isNullable(item.next, isProjectLink) &&
    (item.backHref === undefined || (isString(item.backHref) && isSafeLinkHref(item.backHref))) &&
    isOptionalString(item.backLabel) &&
    isOptionalString(item.problem) &&
    isOptionalString(item.role) &&
    isOptionalString(item.research) &&
    isOptionalString(item.challenge) &&
    isOptionalString(item.process) &&
    isOptionalString(item.usabilityTesting) &&
    isOptionalString(item.solution) &&
    isOptionalString(item.outcomes) &&
    isOptionalString(item.problemHeadline) &&
    isOptionalString(item.roleHeadline) &&
    isOptionalString(item.researchHeadline) &&
    isOptionalString(item.challengeHeadline) &&
    isOptionalString(item.processHeadline) &&
    isOptionalString(item.solutionHeadline) &&
    isOptionalString(item.outcomesHeadline) &&
    isOptionalString(item.pullQuote) &&
    isOptionalString(item.heroImage) &&
    isOptionalString(item.cardImagePosition) &&
    isOptionalString(item.cardImageScale) &&
    isOptionalString(item.cardHoverImagePosition) &&
    isOptionalString(item.cardHoverImageScale) &&
    isOptionalString(item.researchImage) &&
    isOptionalStringArray(item.challengeImages) &&
    isOptionalString(item.solutionHeroImage) &&
    isOptionalStringArray(item.solutionImages) &&
    (item.mediaSettings === undefined || isCaseStudyMediaSettings(item.mediaSettings)) &&
    (item.mediaBlocks === undefined || (Array.isArray(item.mediaBlocks) && item.mediaBlocks.every(isCaseStudyMediaBlock))) &&
    (item.uiCopy === undefined || isCaseStudyUiCopy(item.uiCopy)) &&
    (item.useEmbedPreview === undefined || typeof item.useEmbedPreview === 'boolean') &&
    (item.solutionEmbedUrl === undefined || (isString(item.solutionEmbedUrl) && isSafeEmbedUrl(item.solutionEmbedUrl))) &&
    isOptionalString(item.solutionEmbedTitle) &&
    isOptionalString(item.solutionEmbedAspectRatio) &&
    isOptionalString(item.solutionEmbedWidth) &&
    isOptionalString(item.solutionEmbedCalloutLabel) &&
    isOptionalString(item.solutionEmbedCalloutTitle) &&
    isOptionalString(item.solutionEmbedCalloutBody) &&
    isOptionalString(item.solutionEmbedCtaLabel) &&
    (item.spotify === undefined || isProjectSpotifyMedia(item.spotify))
  )
}

export function isSiteContent(value: unknown): value is SiteContent {
  if (!value || typeof value !== 'object') return false
  const content = value as Record<string, unknown>

  if (!content.home || typeof content.home !== 'object') return false
  if (!content.aboutPage || typeof content.aboutPage !== 'object') return false
  if (!content.workPage || typeof content.workPage !== 'object') return false
  if (!content.photography || typeof content.photography !== 'object') return false
  if (!content.design || typeof content.design !== 'object') return false
  if (!content.copy || typeof content.copy !== 'object') return false

  const home = content.home as Record<string, unknown>
  const aboutPage = content.aboutPage as Record<string, unknown>
  const workPage = content.workPage as Record<string, unknown>
  const photography = content.photography as Record<string, unknown>
  const design = content.design as Record<string, unknown>
  const copy = content.copy as Record<string, unknown>

  return (
    isHomeSection(home.selectedWork) &&
    isHomeSection(home.moreWork) &&
    !!home.about &&
    typeof home.about === 'object' &&
    isString((home.about as Record<string, unknown>).body) &&
    isString((home.about as Record<string, unknown>).spotifyLabel) &&
    isString(aboutPage.heroBody) &&
    isString(aboutPage.whoIAm) &&
    Array.isArray(aboutPage.experience) &&
    aboutPage.experience.every(isEntryItem) &&
    Array.isArray(aboutPage.professionalActivities) &&
    aboutPage.professionalActivities.every(isEntryItem) &&
    Array.isArray(aboutPage.education) &&
    aboutPage.education.every(isEntryItem) &&
    isStringArray(aboutPage.tools) &&
    isString(aboutPage.nowHeading) &&
    isString(aboutPage.nowDescription) &&
    Array.isArray(aboutPage.nowCards) &&
    aboutPage.nowCards.every(isNowCard) &&
    isString(aboutPage.contactTitleHtml) &&
    isSafeRichTextHtml(aboutPage.contactTitleHtml) &&
    isString(aboutPage.contactBody) &&
    Array.isArray(aboutPage.contactLinks) &&
    aboutPage.contactLinks.every(isLinkItem) &&
    isString(workPage.heroTitle) &&
    isString(workPage.heroBody) &&
    Array.isArray(workPage.projects) &&
    workPage.projects.every(isWorkProject) &&
    isString(photography.heroTitle) &&
    Array.isArray(photography.cities) &&
    photography.cities.every(isPhotographyCity) &&
    Array.isArray(photography.galleries) &&
    photography.galleries.every(isPhotographyGallery) &&
    isCardStyleSettings(design.supportingCards) &&
    isPhotographyCardStyleSettings(design.photographyCards) &&
    isHoverPreviewSettings(design.hoverPreviews) &&
    isGalleryStyleSettings(design.gallery) &&
    isNowCardStyleSettings(design.nowCards) &&
    isListeningCardStyleSettings(design.listeningCard) &&
    isCaseStudyNavStyleSettings(design.caseStudyNav) &&
    isLayoutSettings(design.layout) &&
    isTypographySettings(design.typography) &&
    isNavigationStyleSettings(design.navigation) &&
    isMotionSettings(design.motion) &&
    isAudioSettings(design.audio) &&
    isHomePageCopy(copy.home) &&
    isAboutPageCopy(copy.aboutPage) &&
    isWorkPageCopy(copy.workPage) &&
    isCreativePageCopy(copy.creativePage) &&
    isPlayPageCopy(copy.playPage) &&
    isCaseStudyUiCopy(copy.caseStudy) &&
    Array.isArray(content.sitePages) &&
    content.sitePages.every(isSitePageSettings) &&
    Array.isArray(content.caseStudies) &&
    content.caseStudies.every(isCaseStudyContent)
  )
}
