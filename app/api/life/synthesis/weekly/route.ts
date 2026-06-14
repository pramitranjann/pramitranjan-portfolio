import { NextRequest, NextResponse } from "next/server";

import { isAuthenticatedLifeRequest, unauthorizedJson } from '@/lib/life/auth'
import { generateWeeklySummary } from '@/lib/life/synthesis'

export async function POST(request: NextRequest) {
  if (!isAuthenticatedLifeRequest(request)) {
    return unauthorizedJson();
  }

  const body = (await request.json().catch(() => null)) as { localDate?: string; force?: boolean } | null;

  try {
    const result = await generateWeeklySummary({
      localDate: body?.localDate,
      force: body?.force,
    });

    return NextResponse.json(result, { status: result.skipped ? 202 : 200 });
  } catch (error) {
    console.error("Weekly synthesis failed", error);
    return NextResponse.json({ error: "Weekly synthesis failed." }, { status: 500 });
  }
}
