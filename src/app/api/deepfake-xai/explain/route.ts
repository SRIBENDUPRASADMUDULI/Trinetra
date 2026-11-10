import { NextRequest, NextResponse } from 'next/server'
import { env, features } from '@/lib/env'

interface ExplainPayload {
  kind: 'single_image' | 'shift_pair'
  data: Record<string, unknown>
}

function buildDeterministicBrief(payload: ExplainPayload): string {
  if (payload.kind === 'single_image') {
    const pred = String(payload.data.prediction ?? 'UNKNOWN')
    const src = String(payload.data.source_model ?? 'Unknown')
    const backbone = String(payload.data.backbone ?? 'simple')
    const f = Number(payload.data.composite_faithfulness ?? 0)
    const delAuc = Number(payload.data.deletion_auc ?? 0)
    const insAuc = Number(payload.data.insertion_auc ?? 0)
    const conf = Number(payload.data.confidence ?? 0)

    const verdictNote =
      f >= 0.6
        ? 'Grad-CAM saliency aligns strongly with decisive manipulation pixels (high faithfulness).'
        : 'Moderate saliency concentration; verify secondary regions before evidentiary filing.'

    return [
      `1. FORENSIC VERDICT: ${pred} (${(conf * 100).toFixed(1)}% confidence) via ${src}-trained ${backbone} detector.`,
      `2. EXPLANATION FAITHFULNESS: Composite F(x) = ${f.toFixed(4)} | Deletion AUC = ${delAuc.toFixed(4)} | Insertion AUC = ${insAuc.toFixed(4)}. ${verdictNote}`,
      `3. STATUTORY CONTEXT (INDIA): Preserve original input hash + Grad-CAM overlay under Section 63 of Bharatiya Sakshya Adhiniyam (BSA 2023); if malicious impersonation is confirmed, cite IT Act Section 66D / BNS Section 319.`,
    ].join('\n\n')
  }

  const src = String(payload.data.source ?? 'Source')
  const tgt = String(payload.data.target ?? 'Target')
  const cgfd = Number(payload.data.CGFD ?? 0)
  const fadi = Number(payload.data.FADI ?? 0)
  const accDrop = Number(payload.data.accuracy_drop ?? 0)

  return [
    `1. DISTRIBUTION SHIFT (${src} → ${tgt}): Accuracy dropped by ${(accDrop * 100).toFixed(0)}% under unseen generator shift.`,
    `2. CGFD = ${cgfd.toFixed(4)} | FADI = ${fadi.toFixed(2)}: ${
      Math.abs(fadi) >= 0.5
        ? 'Explanation faithfulness and classification accuracy decoupled significantly under this shift.'
        : 'Accuracy and explanation faithfulness shifted in proportion.'
    }`,
    `3. RECOMMENDED HARDENING: Include ${tgt}-family artifacts in calibration batches and gate automated takedowns on Composite Faithfulness F(x) ≥ 0.55.`,
  ].join('\n\n')
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ExplainPayload
    const fallbackBrief = buildDeterministicBrief(body)

    if (!features.bharatcodeEnabled) {
      return NextResponse.json({
        success: true,
        provider: 'deterministic-fallback',
        bharatcodeConnected: false,
        brief: fallbackBrief,
        note: 'BHARATCODE_API_KEY not configured in .env.local',
      })
    }

    const systemPrompt =
      'You are TRINETRA Deepfake XAI Forensic Analyst. Summarize Grad-CAM, Deletion/Insertion AUC, CGFD, and FADI metrics concisely in 3 numbered points including Indian statutory admissibility (BSA 2023 Section 63 / IT Act 66D) without inventing metrics.'

    const userPrompt = `Analyze this ${body.kind} deepfake XAI telemetry JSON and provide a crisp 3-point forensic briefing:\n${JSON.stringify(body.data, null, 2)}`

    const upstream = await fetch(`${env.BHARATCODE_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.BHARATCODE_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.BHARATCODE_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.25,
        max_tokens: 512,
      }),
    })

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => '')
      return NextResponse.json({
        success: true,
        provider: 'deterministic-fallback',
        bharatcodeConnected: true,
        bharatcodeStatus: upstream.status,
        model: env.BHARATCODE_MODEL,
        brief: fallbackBrief,
        note: `BharatCode API responded HTTP ${upstream.status}${
          upstream.status === 402 ? ' (Account credits/plan required on bharatcode.ai)' : ''
        }. Showing deterministic forensic brief.${errText ? ` [${errText.slice(0, 120)}]` : ''}`,
      })
    }

    const json = (await upstream.json()) as {
      model?: string
      choices?: Array<{ message?: { content?: string } }>
    }
    const brief = json.choices?.[0]?.message?.content?.trim() || fallbackBrief

    return NextResponse.json({
      success: true,
      provider: 'bharatcode',
      bharatcodeConnected: true,
      bharatcodeStatus: 200,
      model: json.model ?? env.BHARATCODE_MODEL,
      brief,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Explain request failed'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
