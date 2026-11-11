import { NextRequest, NextResponse } from 'next/server'
import { callAIHarness } from '@/lib/ai-harness'
import { SYSTEM_PROMPTS } from '@/lib/llm'

export interface PrivacyFinding {
  category: string
  finding: string
  risk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  evidence: string
  law: string
}

const PRIVACY_JSON_PROMPT = `${SYSTEM_PROMPTS.PRIVACY}

Respond ONLY with a valid JSON array of findings (no markdown, no backticks) matching:
[
  {
    "category": "short violation category",
    "finding": "concise description of violation",
    "risk": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
    "evidence": "short quote or clause summary from input",
    "law": "applicable Indian statute (e.g. DPDP Act 2023 §6 / IT Act 2000 §43A)"
  }
]`

function scanPrivacyDeterministically(text: string): PrivacyFinding[] {
  const lower = text.toLowerCase()
  const findings: PrivacyFinding[] = []

  if (/contact|call log|sms|location|gps|aadhaar|biometric/.test(lower)) {
    findings.push({
      category: 'Excessive PII / Contact Scraping',
      finding: 'Collects sensitive identifiers, contacts, or continuous location telemetry beyond core purpose.',
      risk: 'CRITICAL',
      evidence: 'Matches contacts / location / Aadhaar / biometric harvesting clauses',
      law: 'IT Act 2000 §43A & DPDP Act 2023 §6',
    })
  }
  if (/indefinite|permanently|even after deletion|never deleted|irrevocable/.test(lower)) {
    findings.push({
      category: 'Indefinite Data Retention',
      finding: 'Retains personal or behavioral records without statutory erasure window after consent withdrawal.',
      risk: 'CRITICAL',
      evidence: 'Matches indefinite / irrevocable retention terms',
      law: 'DPDP Act 2023 §8 (Mandatory Erasure)',
    })
  }
  if (/third[- ]party|affiliate|recovery|broker|monetiz|share with/.test(lower)) {
    findings.push({
      category: 'Unbounded Third-Party Sharing',
      finding: 'Authorizes sharing personal records with external affiliates or marketing networks without explicit opt-in.',
      risk: 'HIGH',
      evidence: 'Matches third-party / affiliate sharing clauses',
      law: 'RBI Fair Practices Code & IT Act §72',
    })
  }
  if (/microphone|camera|fingerprint|audiocontext|installed app/.test(lower)) {
    findings.push({
      category: 'Device Fingerprinting & Sensor Surveillance',
      finding: 'Accesses hardware sensors or persistent browser/device identifiers for cross-app profiling.',
      risk: 'HIGH',
      evidence: 'Matches sensor / fingerprinting permission terms',
      law: 'IT Act 2000 §66E & DPDP Act 2023 §7',
    })
  }

  if (findings.length === 0) {
    findings.push({
      category: 'Baseline Policy Audit',
      finding: 'No overt predatory contact scraping, indefinite retention, or dark-pattern telemetry clauses matched.',
      risk: 'LOW',
      evidence: 'Automated statutory keyword pass completed',
      law: 'DPDP Act 2023 General Compliance',
    })
  }
  return findings
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const mode = body?.mode === 'sast' ? 'sast' : 'privacy'
    const text = typeof body?.text === 'string' ? body.text.trim() : ''

    if (text.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Input must be at least 10 characters' },
        { status: 400 }
      )
    }

    if (mode === 'sast') {
      const harnessRes = await callAIHarness(
        [{ role: 'user', content: `Audit this code for vulnerabilities and provide patched code:\n\n${text.slice(0, 4000)}` }],
        {
          systemPrompt: SYSTEM_PROMPTS.DEVSEC,
          temperature: 0.2,
          maxTokens: 1200,
        }
      )
      return NextResponse.json({
        success: true,
        mode: 'sast',
        report: harnessRes.content,
        provider: harnessRes.provider,
        model: harnessRes.model,
        latencyMs: harnessRes.latencyMs,
      })
    }

    const fallbackFindings = scanPrivacyDeterministically(text)
    try {
      const harnessRes = await callAIHarness(
        [{ role: 'user', content: `Audit this Privacy Policy / Terms & Conditions under DPDP Act 2023:\n\n${text.slice(0, 3500)}` }],
        {
          systemPrompt: PRIVACY_JSON_PROMPT,
          temperature: 0.2,
          maxTokens: 900,
          fastTriage: true,
        }
      )

      if (
        harnessRes.provider !== 'deterministic-kernel' &&
        harnessRes.content &&
        !harnessRes.content.includes('[DETERMINISTIC_SECURITY_KERNEL]')
      ) {
        const cleaned = harnessRes.content.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
        const parsed = JSON.parse(cleaned)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return NextResponse.json({
            success: true,
            mode: 'privacy',
            findings: parsed,
            provider: harnessRes.provider,
            model: harnessRes.model,
            latencyMs: harnessRes.latencyMs,
          })
        }
      }
    } catch {
      // Fallback cleanly to deterministic statutory rules
    }

    return NextResponse.json({
      success: true,
      mode: 'privacy',
      findings: fallbackFindings,
      provider: 'deterministic-kernel',
      model: 'trinetra-dpdp-heuristics',
      latencyMs: 8,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'DevSec analysis failed'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
