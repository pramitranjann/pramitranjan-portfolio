import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

import {
  exportPixleNudgeCss,
  type PixleNudgeStore,
} from "../../../../lib/pixle-nudge-export";

const persistedFile = () =>
  path.join(process.cwd(), "public", "pixle-nudge.json");
const generatedFile = () =>
  path.join(process.cwd(), "app", "pixle-nudge.generated.css");
const generatedFileName = "app/pixle-nudge.generated.css";
const emptyStore: PixleNudgeStore = { version: 1, pages: {} };

export const dynamic = "force-dynamic";

async function readPersistedStore(): Promise<PixleNudgeStore> {
  try {
    const raw = await fs.readFile(persistedFile(), "utf8");
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as PixleNudgeStore)
      : emptyStore;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyStore;
    throw error;
  }
}

export async function POST(req: Request) {
  let body: { pathname?: unknown; write?: unknown } = {};
  try {
    const parsed: unknown = await req.json();
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      body = parsed as { pathname?: unknown; write?: unknown };
    }
  } catch {
    // An omitted or empty request body uses the root pathname and preview mode.
  }

  const pathname =
    typeof body.pathname === "string" && body.pathname.length > 0
      ? body.pathname
      : "/";
  const write = body.write === true;

  if (write && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "dev only" }, { status: 403 });
  }

  let store: PixleNudgeStore;
  try {
    store = await readPersistedStore();
  } catch {
    return NextResponse.json(
      { error: "Could not read public/pixle-nudge.json" },
      { status: 500 },
    );
  }

  const result = exportPixleNudgeCss(store, pathname);
  if (!write) return NextResponse.json(result);

  try {
    await fs.mkdir(path.dirname(generatedFile()), { recursive: true });
    await fs.writeFile(generatedFile(), result.css, "utf8");
  } catch {
    return NextResponse.json(
      { error: "Could not write app/pixle-nudge.generated.css" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ...result, file: generatedFileName });
}
