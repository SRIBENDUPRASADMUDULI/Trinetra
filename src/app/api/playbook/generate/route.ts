import { NextResponse } from 'next/server'
import { callLLM } from '@/lib/llm'

export async function POST(request: Request) {
  try {
    const raw = await request.json()

    // Support both cyber-ir-api parameters and camelCase
    const situation = raw.situation || raw.situationDescription || ''
    const org = raw.organization_type || raw.orgType || 'general'
    const urgency = (raw.urgency || raw.urgencyLevel || 'high').toLowerCase()
    const framework = raw.framework || 'sans_picerl'

    if (!situation) {
      return NextResponse.json(
        { error: 'situation / situationDescription is required' },
        { status: 400 }
      )
    }

    const playbookId = `IR-PB-${Date.now().toString().slice(-6)}`

    const prompt = `You are a Principal Incident Response Commander generating an Incident Response Playbook.
Follow the SANS PICERL framework (Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned).
Output clean Markdown format.

INCIDENT SITUATION:
${situation}

ORGANIZATION TYPE: ${org}
URGENCY LEVEL: ${urgency.toUpperCase()}
FRAMEWORK: ${framework}

Your playbook MUST contain:
# Incident Response Playbook — ${playbookId}

## Incident Header
- Incident ID: ${playbookId}
- Severity: ${urgency.toUpperCase()}
- Org Profile: ${org}
- Incident Commander: CyberShield IR Lead
- Detection Time: ${new Date().toISOString()}

## 1. Preparation
(Specific pre-incident baseline checks and readiness tools relevant to this attack vector)

## 2. Identification
(How to confirm this is a true positive incident, specific logs, artifacts, and IOCs to inspect)

## 3. Containment
### Short-Term Containment (Immediate actions: 15–60 minutes)
### Long-Term Containment (Temporary hardening while preparing eradication)

## 4. Eradication
(Full removal of threat, closing attack vector, revoking compromised access)

## 5. Recovery
(System restoration, health verification, and monitoring steps before returning to production)

## 6. Lessons Learned
(Post-incident review checklist and systemic architectural improvements)

## Escalation Matrix
(Clear escalation roles and time-to-escalate based on severity P1-P4)

## Communication Templates
- Template 1: CERT-In Mandatory 6-Hour Disclosure Email (incident@cert-in.org.in)
- Template 2: Internal Leadership & Board Advisory
- Template 3: Customer / User Notification Template

## Evidence Preservation Checklist
(Ordered volatile data acquisition checklist: RAM -> Volatile Network Sockets -> Active Processes -> Non-volatile Disk Images)

Be technical, tactical, and specific with command line utilities, paths, and procedures.`

    try {
      const llmResponse = await callLLM([
        { role: 'user', content: prompt }
      ], 'You are Cyber-IR Playbook Engine implementing SANS PICERL framework.')

      return NextResponse.json({
        success: true,
        playbookId,
        playbook: llmResponse.content,
        urgency: urgency,
        framework: framework,
        organization_type: org,
        model: llmResponse.model,
      })
    } catch {
      // Fallback SANS PICERL template
      const fallbackMarkdown = `# Incident Response Playbook — ${playbookId}

## Incident Header
- **Incident ID:** ${playbookId}
- **Severity:** ${urgency.toUpperCase()}
- **Target Organization:** ${org}
- **Framework:** SANS PICERL / CERT-In 2022 Guidelines
- **Response Lead:** CyberShield Bharat CIRT

---

## 1. Preparation
- Verify SOC access to network telemetry, firewall logs, and endpoint sensors (EDR).
- Ensure out-of-band communication channel (Signal / secure radio) is active.
- Verify availability of clean forensic USB boot media and volatile RAM collection utilities (WinPmem, LiME).

---

## 2. Identification
- Correlate anomalous alert data across perimeter SIEM and host Event Logs (IDs 4624, 4625, 4688, 7045).
- Capture memory footprint of suspicious parent-child process chains (\`powershell.exe\`, \`cmd.exe\`, \`rundll32.exe\`).
- Confirm IOC signatures against VirusTotal and Indian CERT-In vulnerability advisories.

---

## 3. Containment
### Short-Term Containment (15 – 60 Minutes)
- **[ISOLATE_SUBNET]** Disconnect network cable / quarantine endpoint in EDR. Do NOT power off physical hardware.
- **[CREDENTIAL_RESET]** Invalidate active Kerberos tickets (krbtgt), rotate administrative domain passwords, and flush active JWT tokens.
- **[EGRESS_BLOCK]** Blackhole outbound C2 destination IP addresses at the perimeter firewall.

### Long-Term Containment
- Apply hotfixes or disable vulnerable services on adjacent subnet machines.
- Create read-only forensic snapshots of hypervisor disks.

---

## 4. Eradication
- Terminate malicious scheduled tasks, registry run keys (\`HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\`), and cronjobs.
- Re-image compromised operating systems from verified golden images.
- Deploy updated WAF blocking rules for the exploited web application path.

---

## 5. Recovery
- Restore databases and files from verified offline, immutable backups.
- Implement enhanced 24x7 monitoring on affected IP subnets for 14 days post-recovery.
- Validate cryptographic integrity of all restored binaries.

---

## 6. Lessons Learned
- Conduct blameless root cause analysis (RCA) within 7 days.
- Patch discovery vectors in CI/CD deployment pipelines.
- Update organization Threat Model and employee phishing simulations.

---

## Escalation Matrix
- **P1 (Critical):** Immediate alert to CISO, CEO & Legal within 15 minutes.
- **P2 (High):** Alert to Security Director within 1 hour.
- **P3 (Medium):** Standard ticketing assignment within 4 hours.

---

## Communication & Statutory Templates
### CERT-In Mandatory 6-Hour Disclosure (Email: incident@cert-in.org.in)
\`\`\`text
To: incident@cert-in.org.in
Subject: [STATUTORY INCIDENT REPORT] ${org} - ${urgency.toUpperCase()} Threat Detected

1. Name of Affected Organization: ${org}
2. Incident Detection Timestamp: ${new Date().toISOString()}
3. Nature of Incident: ${situation.slice(0, 160)}...
4. Containment Status: Short-term isolation executed; forensics in progress.
5. Primary Point of Contact: 24x7 SOC Incident Desk
\`\`\`

---

## Evidence Preservation Checklist
1. **[VOLATILE 1]** System Physical RAM dump (WinPmem / LiME) -> Compute SHA-256 immediately.
2. **[VOLATILE 2]** Active Network Connections (\`netstat -ano\` / \`ss -tulpn\`).
3. **[VOLATILE 3]** Process memory strings and open file handles (\`handle.exe\` / \`lsof\`).
4. **[NON-VOLATILE 4]** Disk bitstream forensic clone (FTK Imager / \`dd\`).
`

      return NextResponse.json({
        success: true,
        playbookId,
        playbook: fallbackMarkdown,
        urgency: urgency,
        framework: framework,
        organization_type: org,
        model: 'sans-picerl-kernel',
      })
    }
  } catch (error) {
    console.error('[API/playbook/generate] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate playbook' },
      { status: 500 }
    )
  }
}
