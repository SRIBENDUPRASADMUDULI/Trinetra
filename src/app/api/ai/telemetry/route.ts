import { NextResponse } from 'next/server'
import { getAIHarnessTelemetry } from '@/lib/ai-harness'

export async function GET() {
  try {
    const telemetry = getAIHarnessTelemetry()
    return NextResponse.json({
      success: true,
      telemetry,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch AI telemetry' },
      { status: 500 }
    )
  }
}
