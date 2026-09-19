import { NextRequest, NextResponse } from 'next/server'
import { callLLM } from '@/lib/llm'
import { VideoScript, VideoScene } from '@/data/mock/video-vault-fixtures'

export async function POST(req: NextRequest) {
  try {
    const { text, language = 'English (IN)', topic = 'Cybersecurity Briefing', fileName = 'Document' } = await req.json()

    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return NextResponse.json({ error: 'Text must be at least 10 characters' }, { status: 400 })
    }

    const systemPrompt = `You are TRINETRA Video AI Engine, an elite military & enterprise intelligence briefing generator.
Convert raw input text (advisories, breach reports, forensic notes, regulatory policies) into an engaging, high-impact multi-scene video briefing script.
The target language is: ${language}.

You MUST respond strictly with a valid, parseable JSON object matching this schema:
{
  "title": "Clear punchy briefing title (max 70 chars)",
  "topic": "${topic}",
  "language": "${language}",
  "summary": "2-3 sentence executive summary of the briefing",
  "keyTerms": ["Term 1", "Term 2", "Term 3", "Term 4"],
  "targetAudience": "SOC Responders, C-Level, Forensics",
  "totalDurationSec": 90,
  "scenes": [
    {
      "id": "scene-1",
      "type": "intro",
      "title": "Scene 1 title",
      "narrationText": "Spoken voice narration for intro (3-4 sentences)",
      "durationSec": 15
    },
    {
      "id": "scene-2",
      "type": "explainer",
      "title": "Scene 2 title",
      "heading": "Threat Mechanics",
      "bullets": ["Bullet 1", "Bullet 2", "Bullet 3", "Bullet 4"],
      "highlights": ["Keyword 1", "Keyword 2"],
      "narrationText": "Voice narration explaining the concepts (4-5 sentences)",
      "durationSec": 22
    },
    {
      "id": "scene-3",
      "type": "code",
      "title": "Detection or Mitigation Syntax",
      "code": "YARA / Snort / CLI command / Remediation snippet",
      "language": "yara",
      "narrationText": "Voice narration walking through the code/rule",
      "durationSec": 20
    },
    {
      "id": "scene-4",
      "type": "flowchart",
      "title": "Incident Containment Lifecycle",
      "steps": ["Step 1", "Step 2", "Step 3", "Step 4"],
      "colors": ["#ef4444", "#f59e0b", "#06b6d4", "#10b981"],
      "narrationText": "Voice narration describing step-by-step lifecycle",
      "durationSec": 20
    },
    {
      "id": "scene-5",
      "type": "summary",
      "title": "Strategic Recommendations",
      "bullets": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
      "highlights": ["Key Takeaway"],
      "narrationText": "Concluding summary narration",
      "durationSec": 15
    }
  ]
}

DO NOT include markdown, backticks, or preamble. Return ONLY raw JSON.`

    const userPrompt = `INPUT DOCUMENT / TEXT (${fileName}):\n${text.slice(0, 3500)}`

    let script: VideoScript | null = null

    try {
      const llmRes = await callLLM([{ role: 'user', content: userPrompt }], systemPrompt)
      if (llmRes && llmRes.content && !llmRes.content.includes('[LLM_OFFLINE]')) {
        const cleaned = llmRes.content.replace(/^```(json)?/m, '').replace(/```$/m, '').trim()
        script = JSON.parse(cleaned)
      }
    } catch {
      // Fall through to procedural engine
    }

    if (!script || !script.scenes || script.scenes.length === 0) {
      script = generateProceduralScript(text, fileName, language, topic)
    }

    const totalSec = script.scenes.reduce((acc, s) => acc + (s.durationSec || 15), 0)
    script.totalDurationSec = totalSec

    return NextResponse.json({ success: true, script })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

function generateProceduralScript(text: string, fileName: string, language: string, topic: string): VideoScript {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const title = lines[0]?.slice(0, 65) || `${fileName.replace(/\.[^/.]+$/, '')} Tactical Briefing`
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 30)

  const scenes: VideoScene[] = [
    {
      id: 'sc-auto-1',
      type: 'intro',
      title: `${title.slice(0, 45)} // INGESTION`,
      narrationText: `Initiating sovereign briefing for ${fileName}. This intelligence dossier details threat postures, critical telemetry anomalies, and prioritized countermeasures under Indian national cybersecurity directives.`,
      durationSec: 15,
    },
    {
      id: 'sc-auto-2',
      type: 'explainer',
      title: 'Dossier Analysis & Vectors',
      heading: 'Extracted Threat Parameters',
      bullets: paragraphs.slice(0, 4).map((p, idx) => `Observation ${idx + 1}: ${p.slice(0, 95)}...`),
      highlights: ['Threat Vector', 'CERT-In Mandate', 'Telemetry Spike'],
      narrationText: `Examining the primary threat characteristics extracted from the document. The telemetry identifies persistent exposure vectors requiring immediate containment across enterprise endpoint zones.`,
      durationSec: 24,
    },
    {
      id: 'sc-auto-3',
      type: 'comparison',
      title: 'Vector Exposure vs SOC Posture',
      leftTitle: 'Observed Vulnerability Vector',
      leftPoints: [
        'Unmitigated attack surface identified in document',
        'Unverified inbound payload transit',
        'Missing secondary verification gate',
        'Elevated dwell time vulnerability',
      ],
      rightTitle: 'Hardened SOC Remediated Posture',
      rightPoints: [
        'Microsegmented trust boundaries deployed',
        'Automated telemetry ingestion & IOC matching',
        'BNS 2023 & DPDP Act audit logging',
        'Real-time behavioral blocking via EDR',
      ],
      narrationText: `Contrasting the current state against recommended defense baselines. Deploying zero trust segmentation and strict forensic isolation eliminates the observed exposure path.`,
      durationSec: 22,
    },
    {
      id: 'sc-auto-4',
      type: 'flowchart',
      title: 'Triage & Remediation Runbook',
      steps: [
        'Step 1: Raw Artifact Capture & Hashing',
        'Step 2: DNS & Network Egress Sinkhole',
        'Step 3: Host Privilege Revocation',
        'Step 4: Statutory Advisory Filing',
      ],
      colors: ['#ef4444', '#f59e0b', '#06b6d4', '#10b981'],
      narrationText: `Executing the four-phase response protocol: capture immutable forensic evidence, sever external command-and-control beaconing, revoke compromised credentials, and file timely incident disclosures.`,
      durationSec: 22,
    },
    {
      id: 'sc-auto-5',
      type: 'summary',
      title: 'Executive Mandate & Takeaways',
      bullets: [
        'Continuous surveillance of flagged Indicators of Compromise (IOCs)',
        'Compliance alignment with CERT-In 6-hour disclosure frameworks',
        'Quarterly validation of disaster recovery backups and immutable snapshots',
      ],
      highlights: ['Zero Dwell Time', 'Statutory Compliance', 'Immutable Backups'],
      narrationText: `In conclusion: maintain heightened watchfulness across all sovereign critical infrastructure nodes. This briefing has been committed to the TRINETRA secure document vault for ongoing operational review.`,
      durationSec: 18,
    },
  ]

  return {
    title,
    topic,
    language,
    summary: paragraphs[0]?.slice(0, 180) || 'Comprehensive security briefing analyzing file contents, vulnerability vectors, and remediation milestones.',
    keyTerms: ['IOC Detection', 'CERT-In Compliance', 'Threat Hunting', 'Zero Trust', 'BNS 2023'],
    targetAudience: 'SecOps Engineers & Cybersecurity Specialists',
    totalDurationSec: 101,
    scenes,
  }
}
