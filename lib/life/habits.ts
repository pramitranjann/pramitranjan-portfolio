import { OWNER_ID } from '@/lib/life/constants'
import { getSupabaseAdmin } from '@/lib/life/supabase'
import type { HabitRecord, HabitWithStatus } from '@/lib/life/types'

export async function getHabits(): Promise<HabitRecord[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', OWNER_ID)
    .eq('archived', false)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data || []) as HabitRecord[]
}

export async function getHabitsForDate(localDate: string): Promise<HabitWithStatus[]> {
  const supabase = getSupabaseAdmin()
  const [{ data: habits, error: habitsError }, { data: logs, error: logsError }] = await Promise.all([
    supabase
      .from('habits')
      .select('*')
      .eq('user_id', OWNER_ID)
      .eq('archived', false)
      .order('created_at', { ascending: true }),
    supabase
      .from('habit_logs')
      .select('habit_id')
      .eq('user_id', OWNER_ID)
      .eq('local_date', localDate),
  ])

  if (habitsError) throw habitsError
  if (logsError) throw logsError

  const doneSet = new Set((logs || []).map((log) => log.habit_id as string))
  return ((habits || []) as HabitRecord[]).map((habit) => ({
    ...habit,
    done: doneSet.has(habit.id),
  }))
}

export async function createHabit(input: { title: string; cadence?: string | null }): Promise<HabitRecord> {
  const title = input.title?.trim()
  if (!title) throw new Error('Habit title is required.')

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('habits')
    .insert({
      user_id: OWNER_ID,
      title,
      cadence: input.cadence?.trim() || 'daily',
    })
    .select('*')
    .single()

  if (error) throw error
  return data as HabitRecord
}

/** Toggle a habit's completion for a given local date. Returns the new done state. */
export async function toggleHabitForDate(habitId: string, localDate: string): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  const { data: existing, error: selectError } = await supabase
    .from('habit_logs')
    .select('id')
    .eq('user_id', OWNER_ID)
    .eq('habit_id', habitId)
    .eq('local_date', localDate)
    .maybeSingle()

  if (selectError) throw selectError

  if (existing) {
    const { error: deleteError } = await supabase.from('habit_logs').delete().eq('id', existing.id)
    if (deleteError) throw deleteError
    return false
  }

  const { error: insertError } = await supabase.from('habit_logs').insert({
    user_id: OWNER_ID,
    habit_id: habitId,
    local_date: localDate,
  })
  if (insertError) throw insertError
  return true
}
