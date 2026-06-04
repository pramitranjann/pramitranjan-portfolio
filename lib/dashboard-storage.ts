export type DashboardWriteMode = 'local' | 'github' | 'readonly'

function hasGitHubValue(value: string | undefined) {
  return typeof value === 'string' && value.trim().length > 0
}

export function isGitHubDashboardPublishConfigured() {
  return (
    hasGitHubValue(process.env.GITHUB_TOKEN) &&
    hasGitHubValue(process.env.GITHUB_REPO_OWNER) &&
    hasGitHubValue(process.env.GITHUB_REPO_NAME) &&
    hasGitHubValue(process.env.GITHUB_CONTENT_BRANCH)
  )
}

export function getDashboardWriteMode(): DashboardWriteMode {
  if (isGitHubDashboardPublishConfigured()) return 'github'
  if (process.env.VERCEL !== '1') return 'local'
  return 'readonly'
}

export function isDashboardSaveEnabled() {
  return getDashboardWriteMode() !== 'readonly'
}

export function isLocalDashboardWriteEnabled() {
  return getDashboardWriteMode() === 'local'
}

export function getDashboardWriteModeLabel() {
  const mode = getDashboardWriteMode()

  if (mode === 'github') return 'GITHUB PUBLISH MODE'
  if (mode === 'local') return 'LOCAL FILE MODE'
  return 'VIEW-ONLY ON VERCEL'
}
