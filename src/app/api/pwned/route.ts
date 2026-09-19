import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const prefix = searchParams.get('prefix')?.toUpperCase()

  if (!prefix || prefix.length !== 5) {
    return NextResponse.json({ error: 'prefix must be exactly 5 hex chars' }, { status: 400 })
  }

  try {
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'User-Agent': 'CyberShield-Bharat/1.0 (Security Research)',
        'Add-Padding': 'true',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'HIBP API unavailable' }, { status: 502 })
    }

    const text = await response.text()
    // Return raw HIBP range response — client parses suffix:count lines
    return new NextResponse(text, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    })
  } catch (error) {
    console.error('[API/pwned] Error:', error)
    // Return empty to not crash client — client shows "not found"
    return new NextResponse('', { status: 200, headers: { 'Content-Type': 'text/plain' } })
  }
}
