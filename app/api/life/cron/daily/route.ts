import { NextRequest, NextResponse } from "next/server";

import { isAuthenticatedLifeRequest, unauthorizedJson } from '@/lib/life/auth'
import { syncCalendarEvents } from '@/lib/life/calendar'
import { generateEodReport, generateWeeklySummary } from '@/lib/life/synthesis'
import { getOwnerSettings } from '@/lib/life/settings'
import { getCurrentLocalDate } from '@/lib/life/time'

export async function GET(request: NextRequest) {
  if (!isAuthenticatedLifeRequest(request)) {
    return unauthorizedJson();
  }

  try {
    const settings = await getOwnerSettings()
    const localDate = getCurrentLocalDate(settings.timezone)
    const calendar = await syncCalendarEvents(localDate)
    const eod = await generateEodReport({ localDate })
    const weekly = await generateWeeklySummary({ localDate })

    return NextResponse.json({
      localDate,
      timezone: settings.timezone,
      calendar,
      eod,
      weekly,
    })
  } catch (error) {
    console.error("Daily life cron failed", error);
    return NextResponse.json({ error: "Daily life cron failed." }, { status: 500 });
  }
}
