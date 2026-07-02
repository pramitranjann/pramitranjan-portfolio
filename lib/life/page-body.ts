const LIFE_METADATA_COMMENT_RE = /<!--\s*life:([a-z0-9-]+)=([a-z0-9-]+)\s*-->\s*/gi

export interface LifePageBodyParts {
  body: string
  metadataComments: string[]
  templateArchetype: string | null
}

export function splitLifePageBody(value: string): LifePageBodyParts {
  const metadataComments: string[] = []
  let templateArchetype: string | null = null

  const body = value.replace(LIFE_METADATA_COMMENT_RE, (comment, key: string, rawValue: string) => {
    metadataComments.push(comment.trim())
    if (key === 'template-archetype') {
      templateArchetype = rawValue.trim()
    }
    return ''
  }).trimStart()

  return {
    body,
    metadataComments,
    templateArchetype,
  }
}

export function stripLifePageMetadata(value: string) {
  return splitLifePageBody(value).body
}

export function mergeLifePageMetadata(storedBody: string, visibleBody: string) {
  const { metadataComments } = splitLifePageBody(storedBody)
  const body = visibleBody.trimStart()

  if (metadataComments.length === 0) return body
  return `${metadataComments.join('\n')}\n\n${body}`.trimEnd()
}
