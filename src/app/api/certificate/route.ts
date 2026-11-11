import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { jsPDF } from 'jspdf'

export interface CertificateRequest {
  sourcePanel?: string
  payload: string
  verdict?: string
  confidence?: string
  category?: string
  flags?: string[]
  requestId?: string
  model?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CertificateRequest
    const payload = typeof body?.payload === 'string' ? body.payload.trim() : ''

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'payload is required to generate BSA 2023 §63 certificate' },
        { status: 400 }
      )
    }

    const timestampIso = new Date().toISOString()
    const timestampIst = new Date(timestampIso).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    const canonicalRecord = JSON.stringify({
      platform: 'TRINETRA CyberShield Bharat',
      statute: 'Bharatiya Sakshya Adhiniyam (BSA) 2023 Section 63',
      sourcePanel: body.sourcePanel || 'TRINETRA SOC Console',
      timestampIso,
      requestId: body.requestId || null,
      model: body.model || 'trinetra-deterministic',
      verdict: body.verdict || 'EVIDENCE_CAPTURE',
      confidence: body.confidence || 'N/A',
      category: body.category || 'CYBER_INCIDENT',
      flags: Array.isArray(body.flags) ? body.flags : [],
      payload,
    })

    const sha256Hash = createHash('sha256').update(canonicalRecord, 'utf8').digest('hex')
    const certId = `BSA63-${sha256Hash.slice(0, 10).toUpperCase()}`

    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    doc.setFont('Courier', 'bold')
    doc.setFontSize(12)
    doc.text('CERTIFICATE UNDER SECTION 63 OF BHARATIYA SAKSHYA ADHINIYAM (BSA), 2023', 40, 48)

    doc.setFont('Courier', 'normal')
    doc.setFontSize(9)
    const lines = [
      `Certificate ID   : ${certId}`,
      `Generated (UTC)  : ${timestampIso}`,
      `Generated (IST)  : ${timestampIst}`,
      `Source Panel     : ${body.sourcePanel || 'TRINETRA SOC Console'}`,
      `Model / Engine   : ${body.model || 'trinetra-kernel'}`,
      `Request Trace ID : ${body.requestId || 'N/A'}`,
      `SHA-256 Digest   : ${sha256Hash}`,
      '',
      '--------------------------------------------------------------------------------',
      '1. VERDICT & CLASSIFICATION',
      '--------------------------------------------------------------------------------',
      `Verdict          : ${body.verdict || 'EVIDENCE_CAPTURE'} (${body.confidence || 'N/A'})`,
      `Category         : ${body.category || 'CYBER_INCIDENT'}`,
      '',
      '--------------------------------------------------------------------------------',
      '2. PRESERVED ELECTRONIC RECORD (PAYLOAD)',
      '--------------------------------------------------------------------------------',
      ...doc.splitTextToSize(payload, 515),
      ...(Array.isArray(body.flags) && body.flags.length
        ? [
            '',
            '--------------------------------------------------------------------------------',
            '3. DETECTED INDICATORS',
            '--------------------------------------------------------------------------------',
            ...body.flags.flatMap((f, idx) => doc.splitTextToSize(`${idx + 1}. ${f}`, 515)),
          ]
        : []),
      '',
      '--------------------------------------------------------------------------------',
      '4. STATUTORY ATTESTATION',
      '--------------------------------------------------------------------------------',
      ...doc.splitTextToSize(
        'Generated without alteration for Section 63 BSA 2023 electronic evidence preservation. AI-assisted verdicts are probabilistic indications and must be verified manually before legal or enforcement action.',
        515
      ),
    ]

    let y = 74
    for (const line of lines) {
      if (y > 790) {
        doc.addPage()
        y = 45
      }
      doc.text(line, 40, y)
      y += 13
    }

    const pdfBase64 = Buffer.from(doc.output('arraybuffer')).toString('base64')

    return NextResponse.json({
      success: true,
      certificate: {
        certId,
        sha256Hash,
        timestampIso,
        timestampIst,
        requestId: body.requestId || null,
        pdfBase64,
        downloadUrl: `data:application/pdf;base64,${pdfBase64}`,
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to generate BSA 2023 §63 certificate'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
