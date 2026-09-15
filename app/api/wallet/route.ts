import { createWalletPass, WalletConfigurationError } from '@/lib/wallet/pass'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const pass = await createWalletPass()
    return new Response(new Uint8Array(pass), {
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': 'attachment; filename="pramit-ranjan.pkpass"',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'noindex',
      },
    })
  } catch (error) {
    const unavailable = error instanceof WalletConfigurationError
    console.error('[wallet]', unavailable ? 'Signing configuration unavailable' : 'Pass generation failed')
    return Response.json(
      { error: unavailable ? 'Apple Wallet is not available yet.' : 'Unable to create the Wallet pass. Please try again.' },
      { status: unavailable ? 503 : 500, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } },
    )
  }
}
