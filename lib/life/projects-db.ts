import 'server-only'

import { cache } from 'react'

import { LIFE_PROJECTS } from '@/lib/life/projects'
import { getSupabaseAdmin } from '@/lib/life/supabase'
import { OWNER_ID } from '@/lib/life/constants'
import type { LifeProjectClient, ProjectRecord, ProjectStatus } from '@/lib/life/types'

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

/** The seed list, used as a fallback if the projects table can't be reached. */
function seedProjects(): ProjectRecord[] {
  const now = new Date().toISOString()
  return LIFE_PROJECTS.map((project, index) => ({
    slug: project.slug,
    name: project.name,
    summary: project.summary,
    color: null,
    aliases: project.aliases,
    status: 'active' as const,
    target_date: null,
    archived: false,
    sort_order: index,
    created_at: now,
    updated_at: now,
  }))
}

/**
 * All active projects, ordered. Cached per request. Falls back to the static
 * seed list so the UI keeps working even if the migration hasn't run yet.
 */
export const listProjects = cache(async function listProjects(
  options: { includeArchived?: boolean } = {},
): Promise<ProjectRecord[]> {
  try {
    const supabase = getSupabaseAdmin()
    let query = supabase.from('projects').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: true })
    if (!options.includeArchived) {
      query = query.eq('archived', false)
    }
    const { data, error } = await query
    if (error) throw error
    if (!data || data.length === 0) return seedProjects()
    return data as ProjectRecord[]
  } catch (error) {
    console.error('listProjects failed, falling back to seed list', error)
    return seedProjects()
  }
})

/** A slug→project map for fast label/colour lookups in server components. */
export const getProjectMap = cache(async function getProjectMap() {
  const projects = await listProjects({ includeArchived: true })
  return new Map(projects.map((project) => [project.slug, project]))
})

export async function getProjectBySlugDb(slug: string | null | undefined): Promise<ProjectRecord | null> {
  if (!slug) return null
  return (await getProjectMap()).get(slug) || null
}

export async function getProjectLabelAsync(slug: string | null | undefined): Promise<string | null> {
  if (!slug) return null
  return (await getProjectBySlugDb(slug))?.name || null
}

/** The trimmed-down list handed to client components through context. */
export async function listProjectsClient(): Promise<LifeProjectClient[]> {
  const projects = await listProjects()
  return projects.map((project) => ({ slug: project.slug, name: project.name, color: project.color }))
}

/** Resolve a free-text/slug value to a known project slug (or null). */
export async function normalizeProjectSlugDb(value: string | null | undefined): Promise<string | null> {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  const map = await getProjectMap()
  return map.has(normalized) ? normalized : null
}

/** Detect a project from arbitrary text by matching stored aliases. */
export async function detectProjectSlugDb(text: string | null | undefined): Promise<string | null> {
  if (!text) return null
  const normalized = text.toLowerCase()
  const projects = await listProjects()
  for (const project of projects) {
    for (const alias of project.aliases) {
      if (alias && normalized.includes(alias.toLowerCase())) {
        return project.slug
      }
    }
  }
  return null
}

export async function createProject(input: {
  name: string
  summary?: string | null
  color?: string | null
  aliases?: string[]
}): Promise<ProjectRecord> {
  const name = input.name.trim()
  if (!name) throw new Error('Project name is required.')

  const supabase = getSupabaseAdmin()

  // Derive a unique slug from the name.
  const base = slugify(name) || 'project'
  const existing = await listProjects({ includeArchived: true })
  const taken = new Set(existing.map((project) => project.slug))
  let slug = base
  let suffix = 2
  while (taken.has(slug)) {
    slug = `${base}-${suffix++}`
  }

  const sortOrder = existing.reduce((max, project) => Math.max(max, project.sort_order), -1) + 1

  const { data, error } = await supabase
    .from('projects')
    .insert({
      slug,
      name,
      summary: input.summary?.trim() || null,
      color: input.color || null,
      aliases: input.aliases?.map((alias) => alias.trim().toLowerCase()).filter(Boolean) || [],
      sort_order: sortOrder,
      user_id: OWNER_ID,
    })
    .select('*')
    .single()

  if (error) throw error
  return data as ProjectRecord
}

export async function updateProject(
  slug: string,
  patch: {
    name?: string
    summary?: string | null
    color?: string | null
    aliases?: string[]
    status?: ProjectStatus
    targetDate?: string | null
    archived?: boolean
  },
): Promise<ProjectRecord> {
  const supabase = getSupabaseAdmin()
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (patch.name !== undefined) update.name = patch.name.trim()
  if (patch.summary !== undefined) update.summary = patch.summary?.trim() || null
  if (patch.color !== undefined) update.color = patch.color || null
  if (patch.aliases !== undefined) update.aliases = patch.aliases.map((a) => a.trim().toLowerCase()).filter(Boolean)
  if (patch.status !== undefined) update.status = patch.status
  if (patch.targetDate !== undefined) update.target_date = patch.targetDate || null
  if (patch.archived !== undefined) update.archived = patch.archived

  const { data, error } = await supabase.from('projects').update(update).eq('slug', slug).select('*').single()
  if (error) throw error
  return data as ProjectRecord
}

/**
 * Delete a project. Tasks/entries that reference it keep their slug (it simply
 * stops resolving to a name); refs and event mappings cascade away.
 */
export async function deleteProject(slug: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('projects').delete().eq('slug', slug)
  if (error) throw error
}
