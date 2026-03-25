export interface WorkProject {
  title: string
  oneliner: string
  tags: string[]
  href: string
  cover?: string
  coverPosition?: string
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
  imagePosition?: string
  comingSoon: boolean
}

export interface PhotographyGallery {
  slug: string
  city: string
  descriptor: string
  images: string[]
}

export interface CardStyleSettings {
  titleSize: string
  metaSize: string
  bodySize?: string
  imageRatio: string
  cardPadding: string
}

export interface PhotographyCardStyleSettings {
  titleSize: string
  bodySize: string
  imageAspectRatio: string
  cardPadding: string
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
  cardPadding: string
  artworkSize: string
  progressMetaSize: string
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

export type CaseStudySection = 'work' | 'mixed-media' | 'branding'

export interface CaseStudyContent {
  slug: string
  section: CaseStudySection
  title: string
  oneliner: string
  type: string
  tags: string[]
  prev: ProjectLink | null
  next: ProjectLink | null
  backHref?: string
  backLabel?: string
  problem?: string
  role?: string
  research?: string
  challenge?: string
  process?: string
  usabilityTesting?: string
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
  researchImage?: string
  challengeImages?: string[]
  solutionHeroImage?: string
  solutionImages?: string[]
  uiCopy?: CaseStudyUiCopy
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
    gallery: GalleryStyleSettings
    nowCards: NowCardStyleSettings
    listeningCard: ListeningCardStyleSettings
    motion: MotionSettings
    audio: AudioSettings
  }
  copy: {
    home: HomePageCopy
    aboutPage: AboutPageCopy
    workPage: WorkPageCopy
    creativePage: CreativePageCopy
    caseStudy: CaseStudyUiCopy
  }
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
    (item.cover === undefined || isString(item.cover)) &&
    (item.coverPosition === undefined || isString(item.coverPosition))
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
  return isString(item.label) && isString(item.href)
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
    (item.imagePosition === undefined || isString(item.imagePosition))
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
  return isString(item.slug) && isString(item.city) && isString(item.descriptor) && isStringArray(item.images)
}

function isCardStyleSettings(value: unknown): value is CardStyleSettings {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    isString(item.titleSize) &&
    isString(item.metaSize) &&
    isString(item.imageRatio) &&
    isString(item.cardPadding) &&
    (item.bodySize === undefined || isString(item.bodySize))
  )
}

function isPhotographyCardStyleSettings(value: unknown): value is PhotographyCardStyleSettings {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return isString(item.titleSize) && isString(item.bodySize) && isString(item.imageAspectRatio) && isString(item.cardPadding)
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
    isString(item.cardPadding) &&
    isString(item.artworkSize) &&
    isString(item.progressMetaSize)
  )
}

function isHeroStageCopy(value: unknown): value is HeroStageCopy {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return isString(item.number) && isString(item.titleHtml) && isString(item.body) && isOptionalString(item.footerLabel)
}

function isHomePageCopy(value: unknown): value is HomePageCopy {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return (
    Array.isArray(item.heroStages) &&
    item.heroStages.every(isHeroStageCopy) &&
    isString(item.aboutEyebrow) &&
    isString(item.aboutTitleHtml) &&
    isString(item.aboutReadMoreLabel) &&
    isString(item.photographyEyebrow) &&
    isString(item.photographyTitleHtml) &&
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
  return value === 'work' || value === 'mixed-media' || value === 'branding'
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
    isString(item.title) &&
    isString(item.oneliner) &&
    isString(item.type) &&
    isStringArray(item.tags) &&
    isNullable(item.prev, isProjectLink) &&
    isNullable(item.next, isProjectLink) &&
    isOptionalString(item.backHref) &&
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
    isOptionalString(item.researchImage) &&
    isOptionalStringArray(item.challengeImages) &&
    isOptionalString(item.solutionHeroImage) &&
    isOptionalStringArray(item.solutionImages) &&
    (item.uiCopy === undefined || isCaseStudyUiCopy(item.uiCopy))
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
    isGalleryStyleSettings(design.gallery) &&
    isNowCardStyleSettings(design.nowCards) &&
    isListeningCardStyleSettings(design.listeningCard) &&
    isMotionSettings(design.motion) &&
    isAudioSettings(design.audio) &&
    isHomePageCopy(copy.home) &&
    isAboutPageCopy(copy.aboutPage) &&
    isWorkPageCopy(copy.workPage) &&
    isCreativePageCopy(copy.creativePage) &&
    isCaseStudyUiCopy(copy.caseStudy) &&
    Array.isArray(content.caseStudies) &&
    content.caseStudies.every(isCaseStudyContent)
  )
}
