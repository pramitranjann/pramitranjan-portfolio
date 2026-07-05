import { redirect } from 'next/navigation'

import { PeopleIndex, type PersonListItem } from '@/components/life/people/PeopleIndex'
import { isAdminSession } from '@/lib/admin-auth'
import { latestInteractionDates, listPeople } from '@/lib/life/people'
import { getOwnerSettings } from '@/lib/life/settings'
import { getCurrentLocalDate } from '@/lib/life/time'

export default async function LifePeoplePage() {
  if (!(await isAdminSession())) {
    redirect('/life/login?next=/life/people')
  }

  const settings = await getOwnerSettings()
  const today = getCurrentLocalDate(settings.timezone)

  // The 008 migration may not have been applied yet — render a note, not a
  // crash, when the people table doesn't exist.
  let items: PersonListItem[] = []
  let unavailable = false
  try {
    const [people, lastByPerson] = await Promise.all([listPeople(), latestInteractionDates()])
    items = people.map((person) => {
      const last = lastByPerson.get(person.id) || null
      return {
        id: person.id,
        name: person.name,
        role: person.role,
        relationship: person.relationship,
        cadenceDays: person.cadence_days,
        lastDate: last || person.created_at.slice(0, 10),
        noHistory: !last,
      }
    })
  } catch (error) {
    console.error('Failed to load people (008_rolodex migration applied?)', error)
    unavailable = true
  }

  return <PeopleIndex people={items} today={today} unavailable={unavailable} />
}
