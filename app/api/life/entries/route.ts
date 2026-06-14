import { NextRequest, NextResponse } from "next/server";

import { OWNER_ID } from '@/lib/life/constants'
import { isAuthenticatedLifeRequest, unauthorizedJson } from '@/lib/life/auth'
import { getOwnerSettings } from '@/lib/life/settings'
import { getSupabaseAdmin } from '@/lib/life/supabase'
import { getCurrentLocalDate } from '@/lib/life/time'
import type { EntrySource } from '@/lib/life/types'

export async function GET(request: NextRequest) {
  if (!isAuthenticatedLifeRequest(request)) {
    return unauthorizedJson();
  }

  const settings = await getOwnerSettings();
  const date = request.nextUrl.searchParams.get("date") || getCurrentLocalDate(settings.timezone);
  const order = request.nextUrl.searchParams.get("order") === "asc" ? true : false;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", OWNER_ID)
    .eq("local_date", date)
    .order("created_at", { ascending: order });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    localDate: date,
    timezone: settings.timezone,
    entries: data || [],
  });
}

export async function POST(request: NextRequest) {
  if (!isAuthenticatedLifeRequest(request)) {
    return unauthorizedJson();
  }

  const contentType = request.headers.get("content-type") || "";
  const isJsonRequest = contentType.includes("application/json");
  let content = "";
  let source: EntrySource = "voice";

  if (isJsonRequest) {
    const body = (await request.json().catch(() => null)) as { content?: string; source?: EntrySource } | null;
    content = body?.content?.trim() || "";
    source = body?.source === "text" ? "text" : "voice";
  } else {
    const formData = await request.formData().catch(() => null);
    content = typeof formData?.get("content") === "string" ? String(formData.get("content")).trim() : "";
    source = formData?.get("source") === "voice" ? "voice" : "text";
  }

  if (!content) {
    if (!isJsonRequest) {
      return NextResponse.redirect(new URL("/life?error=content", request.url), { status: 303 });
    }
    return NextResponse.json({ error: "Content is required." }, { status: 400 });
  }

  const settings = await getOwnerSettings();
  const localDate = getCurrentLocalDate(settings.timezone);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("entries")
    .insert({
      user_id: OWNER_ID,
      content,
      source,
      local_date: localDate,
    })
    .select("*")
    .single();

  if (error) {
    if (!isJsonRequest) {
      return NextResponse.redirect(new URL(`/life?error=${encodeURIComponent(error.message)}`, request.url), { status: 303 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!isJsonRequest) {
    return NextResponse.redirect(new URL("/life", request.url), { status: 303 });
  }

  return NextResponse.json({
    localDate,
    timezone: settings.timezone,
    entry: data,
  });
}
