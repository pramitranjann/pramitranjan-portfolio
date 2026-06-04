import 'server-only'

import type { SiteContent } from '@/lib/site-content-schema'

const DEFAULT_CONTENT_PATH = 'content/site-content.json'
const GITHUB_API_VERSION = '2022-11-28'

type GitHubContentsResponse = {
  sha: string
}

type GitHubCommitResponse = {
  content?: {
    path?: string
    sha?: string
  }
  commit?: {
    sha?: string
    html_url?: string
  }
}

function getRequiredEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is not set`)
  }
  return value
}

function getGitHubConfig() {
  return {
    token: getRequiredEnv('GITHUB_TOKEN'),
    owner: getRequiredEnv('GITHUB_REPO_OWNER'),
    repo: getRequiredEnv('GITHUB_REPO_NAME'),
    branch: getRequiredEnv('GITHUB_CONTENT_BRANCH'),
    path: process.env.GITHUB_CONTENT_PATH?.trim() || DEFAULT_CONTENT_PATH,
    committerName: process.env.GITHUB_COMMITTER_NAME?.trim(),
    committerEmail: process.env.GITHUB_COMMITTER_EMAIL?.trim(),
  }
}

async function githubRequest(path: string, init?: RequestInit) {
  const { token } = getGitHubConfig()
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': GITHUB_API_VERSION,
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  })

  return response
}

async function getCurrentContentSha() {
  const { owner, repo, branch, path } = getGitHubConfig()
  const response = await githubRequest(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(branch)}`
  )

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`GitHub read failed (${response.status}): ${details}`)
  }

  const data = (await response.json()) as GitHubContentsResponse
  if (!data.sha) {
    throw new Error('GitHub response did not include a file SHA')
  }

  return data.sha
}

function buildCommitPayload(content: SiteContent, sha: string) {
  const {
    branch,
    committerEmail,
    committerName,
  } = getGitHubConfig()

  const payload: Record<string, unknown> = {
    message: `Publish site content from dashboard (${new Date().toISOString()})`,
    content: Buffer.from(`${JSON.stringify(content, null, 2)}\n`, 'utf8').toString('base64'),
    branch,
    sha,
  }

  if (committerName && committerEmail) {
    payload.committer = {
      name: committerName,
      email: committerEmail,
    }
  }

  return payload
}

export async function publishSiteContentToGitHub(content: SiteContent) {
  const { owner, repo, path } = getGitHubConfig()
  const sha = await getCurrentContentSha()
  const response = await githubRequest(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path.split('/').map(encodeURIComponent).join('/')}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildCommitPayload(content, sha)),
    }
  )

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`GitHub publish failed (${response.status}): ${details}`)
  }

  const data = (await response.json()) as GitHubCommitResponse
  return {
    path: data.content?.path ?? path,
    commitSha: data.commit?.sha ?? '',
    commitUrl: data.commit?.html_url ?? null,
  }
}
