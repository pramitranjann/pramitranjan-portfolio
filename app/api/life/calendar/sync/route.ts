import { NextRequest, NextResponse } from "next/server";

import { isAuthenticatedLifeRequest, unauthorizedJson } from '@/lib/life/auth'
import { syncCalendarEvents } from '@/lib/life/calendar'

export async function POST(request: NextRequest) {
  if (!isAuthenticatedLifeRequest(request)) {
    return unauthorizedJson();
  }

  const body = (await request.json().catch(() => null)) as { localDate?: string } | null;

  try {
    const result = await syncCalendarEvents(body?.localDate);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Calendar sync failed", error);
    return NextResponse.json({ error: "Calendar sync failed." }, { status: 500 });
  }
}
