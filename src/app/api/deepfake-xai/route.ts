import { NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { loadDeepfakeXaiResults } from '@/lib/deepfake-xai'
import { env, features } from '@/lib/env'

const execFileAsync = promisify(execFile)

async function checkPythonRuntime(): Promise<{ available: boolean; version?: string }> {
  for (const cmd of ['python', 'python3']) {
    try {
      const { stdout } = await execFileAsync(cmd, ['--version'], { timeout: 3000 })
      return { available: true, version: stdout.trim() }
    } catch {
      // try next
    }
  }
  return { available: false }
}

export async function GET() {
  try {
    const data = loadDeepfakeXaiResults()
    const runtime = await checkPythonRuntime()
    return NextResponse.json({
      success: true,
      pythonAvailable: runtime.available,
      pythonVersion: runtime.version ?? null,
      bharatcodeEnabled: features.bharatcodeEnabled,
      bharatcodeModel: env.BHARATCODE_MODEL,
      ...data,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load XAI results'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
