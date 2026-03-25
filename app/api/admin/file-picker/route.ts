import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { NextResponse } from 'next/server'
import { getAdminCookieName, isValidAdminSessionToken } from '@/lib/admin-auth'
import { isLocalDashboardWriteEnabled } from '@/lib/dashboard-storage'

const execFileAsync = promisify(execFile)

function isAuthorized(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const session = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${getAdminCookieName()}=`))
    ?.split('=')
    .slice(1)
    .join('=')

  return isValidAdminSessionToken(session)
}

function escapeAppleScript(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isLocalDashboardWriteEnabled()) {
    return NextResponse.json({ error: 'File picker is only available locally.' }, { status: 409 })
  }

  if (process.platform !== 'darwin') {
    return NextResponse.json({ error: 'Finder picker is only supported on macOS.' }, { status: 409 })
  }

  const publicDir = path.join(process.cwd(), 'public')
  const script = `
set defaultFolder to POSIX file "${escapeAppleScript(publicDir)}"
try
  set chosenFile to choose file with prompt "Choose an image from the public folder" default location defaultFolder of type {"public.image"}
  return POSIX path of chosenFile
on error number -128
  return ""
end try
`.trim()

  try {
    const { stdout } = await execFileAsync('osascript', ['-e', script])
    const chosenPath = stdout.trim()

    if (!chosenPath) {
      return NextResponse.json({ cancelled: true })
    }

    const normalizedPublicDir = path.resolve(publicDir)
    const normalizedChosenPath = path.resolve(chosenPath)

    if (!normalizedChosenPath.startsWith(`${normalizedPublicDir}${path.sep}`)) {
      return NextResponse.json(
        {
          error: 'Choose an image from this project’s public folder so the site can reference it correctly.',
        },
        { status: 400 }
      )
    }

    const relativePath = path.relative(normalizedPublicDir, normalizedChosenPath).split(path.sep).join('/')
    return NextResponse.json({
      src: `/${relativePath}`,
      absolutePath: normalizedChosenPath,
    })
  } catch {
    return NextResponse.json({ error: 'Could not open Finder.' }, { status: 500 })
  }
}
