import { NextRequest, NextResponse } from 'next/server'
import { callAIHarness } from '@/lib/ai-harness'
import { SYSTEM_PROMPTS } from '@/lib/llm'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const narrative = String(data?.evidenceDescription || data?.incident_description || '').trim()

    if (narrative.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Detailed incident narrative (min 10 chars) is required' },
        { status: 400 }
      )
    }

    const promptBody = [
      `Complainant: ${data.complainantName || 'Anonymous'} | Phone: ${data.complainantPhone || 'N/A'} | Email: ${data.complainantEmail || 'N/A'}`,
      `Attack Category: ${data.attackType || 'Cyber Fraud'} | Date/Time: ${data.incidentDate || 'N/A'} ${data.incidentTime || ''} IST`,
      `Financial Loss: INR ${data.lossAmount || 'Under assessment'} | Bank: ${data.victimBank || 'N/A'} | Txn ID: ${data.transactionId || 'N/A'}`,
      `Suspect / IOCs: ${data.attackerIp || 'Under trace'}`,
      `Selected IT Act Sections: ${(data.itActSections || []).join(', ') || '43, 66, 66D'}`,
      `Selected BNS 2023 Sections: ${(data.bnsSections || []).join(', ') || '318(4), 319(2)'}`,
      '',
      'Incident Narrative:',
      narrative,
    ].join('\n')

    const harnessRes = await callAIHarness(
      [{ role: 'user', content: promptBody }],
      {
        systemPrompt: SYSTEM_PROMPTS.FIR,
        temperature: 0.2,
        maxTokens: 1400,
      }
    )

    const usedAI =
      harnessRes.provider !== 'deterministic-kernel' &&
      !harnessRes.content.includes('[DETERMINISTIC_SECURITY_KERNEL]')

    return NextResponse.json({
      success: true,
      usedAI,
      provider: harnessRes.provider,
      model: harnessRes.model,
      latencyMs: harnessRes.latencyMs,
      requestId: harnessRes.requestId || null,
      firDraft: usedAI ? harnessRes.content : null,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Incident FIR synthesis failed'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
