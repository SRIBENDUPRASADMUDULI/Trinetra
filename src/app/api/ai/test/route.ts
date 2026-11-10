import { NextResponse } from 'next/server'
import { pingBharatCode, getAIHarnessTelemetry } from '@/lib/ai-harness'

export async function POST() {
  try {
    const pingResult = await pingBharatCode()
    const telemetry = getAIHarnessTelemetry()
    return NextResponse.json({
      success: true,
      ping: pingResult,
      telemetry,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to ping AI gateway' },
      { status: 500 }
    )
  }
}
