import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

import {
  normalizePixleLayout,
  patchPixleLayout,
  type PixleLayoutDocument,
} from "../../../../lib/pixle-nudge-components";

const layoutFile = () =>
  path.join(process.cwd(), "public", "pixle-nudge-layout.json");

export const dynamic = "force-dynamic";

async function readLayout(): Promise<PixleLayoutDocument> {
  try {
    return normalizePixleLayout(JSON.parse(await fs.readFile(layoutFile(), "utf8")));
  } catch {
    return normalizePixleLayout(null);
  }
}

async function writeLayout(layout: PixleLayoutDocument) {
  await fs.mkdir(path.dirname(layoutFile()), { recursive: true });
  await fs.writeFile(layoutFile(), JSON.stringify(layout, null, 2) + "\n");
}

function isProduction() {
  return process.env.NODE_ENV === "production";
}

export async function GET() {
  return NextResponse.json(await readLayout());
}

export async function PUT(req: Request) {
  if (isProduction()) {
    return NextResponse.json({ error: "dev only" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const next = normalizePixleLayout(body);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "invalid layout" }, { status: 400 });
  }

  await writeLayout(next);
  return NextResponse.json(next);
}

export async function PATCH(req: Request) {
  if (isProduction()) {
    return NextResponse.json({ error: "dev only" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "invalid layout" }, { status: 400 });
  }

  const next = patchPixleLayout(await readLayout(), body);
  await writeLayout(next);
  return NextResponse.json(next);
}
