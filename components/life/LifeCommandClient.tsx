'use client'

// Wires the finished LifeCommand palette into the live app. LifeCommand
// already owns its own open state and its own document Cmd/Ctrl+K listener
// (see components/life/ui/LifeCommand.tsx) — this wrapper's only job is to
// supply real navigation items via useRouter().

import { useRouter } from 'next/navigation'

import { LifeCommand, type CommandItem } from '@/components/life/ui/LifeCommand'

export function LifeCommandClient() {
  const router = useRouter()

  const items: CommandItem[] = [
    { id: 'nav-today', group: 'Go to', label: 'Today', onRun: () => router.push('/life') },
    { id: 'nav-tasks', group: 'Go to', label: 'Tasks', onRun: () => router.push('/life/tasks') },
    { id: 'nav-projects', group: 'Go to', label: 'Projects', onRun: () => router.push('/life/projects') },
    { id: 'nav-people', group: 'Go to', label: 'People', onRun: () => router.push('/life/people') },
    { id: 'nav-studio', group: 'Go to', label: 'Studio', onRun: () => router.push('/life/studio') },
    { id: 'nav-calendar', group: 'Go to', label: 'Calendar', onRun: () => router.push('/life/month') },
    { id: 'nav-reports', group: 'Go to', label: 'Reports', onRun: () => router.push('/life/report') },
    { id: 'nav-entries', group: 'Go to', label: 'Entries', onRun: () => router.push('/life/history') },
    { id: 'nav-search', group: 'Go to', label: 'Search', onRun: () => router.push('/life/search') },
  ]

  return <LifeCommand items={items} />
}
