import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import {
  emptyStore,
  isGuides,
  isPages,
  isRecord,
  isResponsivePages,
  normalizeStore,
  type Store,
} from "../../../lib/pixle-nudge-model";

const file = () => path.join(process.cwd(), "public", "pixle-nudge.json");

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(file(), "utf8");
    return normalizeStore(JSON.parse(raw));
  } catch {
    return emptyStore();
  }
}

export async function GET() {
  return NextResponse.json(await readStore());
}

export async function PUT(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "dev only" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (!isRecord(body)) {
    return NextResponse.json({ error: "invalid store" }, { status: 400 });
  }

  // Read first so a partial editor update cannot erase fields introduced by
  // an older editor (or by a concurrent responsive-aware editor).
  const current = await readStore();
  const next: Store = {
    version: 1,
    pages: isPages(body.pages) ? body.pages : current.pages,
    guides: isGuides(body.guides) ? body.guides : current.guides,
  };

  if (isResponsivePages(body.responsive)) {
    next.responsive = body.responsive;
  } else if (current.responsive) {
    next.responsive = current.responsive;
  }

  await fs.mkdir(path.dirname(file()), { recursive: true });
  await fs.writeFile(file(), JSON.stringify(next, null, 2) + "\n");
  return NextResponse.json({ ok: true });
}
