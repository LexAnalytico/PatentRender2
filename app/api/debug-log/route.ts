import { NextResponse } from 'next/server'

// Gate server-side debug logging behind an explicit env flag.
// Set DEBUG_BEACONS=1 (or ENABLE_DEBUG_BEACONS=1) on the server to enable logging.
const DEBUG_BEACONS =
  process.env.DEBUG_BEACONS === '1' || process.env.ENABLE_DEBUG_BEACONS === '1'

export async function POST(request: Request) {
  // If disabled, short-circuit with 204 (no content) to minimize noise and work.
  if (!DEBUG_BEACONS) {
    return new Response(null, { status: 204 })
  }

  try {
    const body = await request.json().catch(() => null)
    // Print client debug payload to server terminal with basic size limiting
    const payload = body ?? '[no-json]'
    let printable: string
    try {
      printable = typeof payload === 'object' ? JSON.stringify(payload) : String(payload)
    } catch {
      printable = String(payload)
    }
    // Truncate extremely large payloads to avoid terminal spam
    if (printable.length > 10_000) {
      printable = printable.slice(0, 10_000) + '…[truncated]'
    }
    // eslint-disable-next-line no-console
    console.log('[client-debug]', printable)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('[client-debug] invalid payload', e)
  }
  return NextResponse.json({ ok: true })
}
