// =============================================================================
// TRINETRA -- Video Studio & Converted Document Vault Fixtures
// Pre-populated with realistic Indian Cybersecurity briefings & advisories
// =============================================================================

export interface VideoScene {
  id: string
  type: 'intro' | 'explainer' | 'code' | 'comparison' | 'flowchart' | 'summary'
  title: string
  heading?: string
  bullets?: string[]
  highlights?: string[]
  code?: string
  language?: string
  leftTitle?: string
  leftPoints?: string[]
  rightTitle?: string
  rightPoints?: string[]
  steps?: string[]
  colors?: string[]
  narrationText: string
  durationSec: number
}

export interface VideoScript {
  title: string
  topic: string
  language: string
  summary: string
  keyTerms: string[]
  targetAudience: string
  totalDurationSec: number
  scenes: VideoScene[]
}

export interface StoredDocument {
  id: string
  fileName: string
  fileType: 'pdf' | 'pptx' | 'ppt' | 'txt' | 'md'
  fileSize: number
  uploadDate: string
  rawText: string
  characterCount: number
  wordCount: number
  status: 'READY' | 'PROCESSING' | 'FAILED'
  script: VideoScript
  videoDuration: string
  sector: string
}

export const PRESET_THREAT_TEXTS = [
  {
    id: 'lockbit-preset',
    title: 'CERT-In Advisory: LockBit 3.0 Ransomware Defense',
    fileType: 'pdf' as const,
    sector: 'HEALTHCARE & FINANCE',
    text: `CERT-In ADVISORY CIAD-2024-0021
Title: LockBit 3.0 (LockBit Black) Ransomware Targeting Critical Infrastructure
Severity: CRITICAL | Impact: Data Encryption, Double Extortion, Service Denial

1. EXECUTIVE SUMMARY
A surge in LockBit 3.0 ransomware activity has been observed targeting Indian critical infrastructure sectors including healthcare institutions, regional banking nodes, and municipal administrative portals. LockBit 3.0 utilizes anti-analysis techniques, code obfuscation, and deletes volume shadow copies prior to launching multi-threaded encryption routines.

2. INFECTION VECTORS & TTPs
- Initial Access (T1566): Phishing campaigns featuring malicious ZIP attachments containing obfuscated VBScript and LNK files.
- Privilege Escalation & Defense Evasion (T1055, T1562.001): Process injection into svchost.exe; disabling Windows Defender via PowerShell and modifying registry keys.
- Lateral Movement (T1021.002): Exploitation of SMB and PsExec utility to spread across domain controllers.
- Exfiltration (T1567): Deployment of StealBit utility uploading confidential patient and financial records to mega.nz and decentralized darkweb storage nodes.

3. CONTAINMENT & REMEDIATION MANDATE
- Immediate network isolation of affected host segments using VLAN tagging.
- Enforce mandatory 6-hour incident disclosure to CERT-In (incident@cert-in.org.in) under the 2022 cybersecurity directives.
- Revoke all domain administrative credentials and terminate active Kerberos ticket sessions.
- Deploy host-level YARA signatures to detect LockBit mutex creation and payload staging.`,
  },
  {
    id: 'sidewinder-preset',
    title: 'APT-C-17 SideWinder Espionage Campaign Analysis',
    fileType: 'pptx' as const,
    sector: 'DEFENSE & AEROSPACE',
    text: `APT-C-17 SIDEWINDER INTRUSION DECLASSIFIED BRIEFING
Topic: State-Sponsored Targeted Espionage Against Maritime & Defense Research
Classification: TLP:AMBER | Threat Actor: SideWinder (Rattlesnake)

SLIDE 1: CAMPAIGN OVERVIEW
SideWinder is an advanced persistent threat (APT) actor active since 2012, primarily targeting defense establishments, military universities, and foreign affairs ministries in South Asia. Over 1,000 targeted spearphishing attacks were identified in the recent reconnaissance cycle.

SLIDE 2: WEAPONIZATION & DELIVERY
The threat actor weaponizes malicious RTF documents exploiting Equation Editor vulnerability CVE-2017-11882. Documents are disguised as official defense symposium invitations and naval procurement requests.

SLIDE 3: MEMORY EXECUTION & STAGER
Upon opening the attachment, the exploit triggers shellcode execution in memory. It launches a multi-stage JavaScript and PowerShell beacon that communicates with attacker-controlled dynamic DNS infrastructure disguised as legitimate telecom webmail servers.

SLIDE 4: DEFENSIVE CONTROLS
- Disable Microsoft Equation Editor 3.0 via Group Policy (HKLM\\SOFTWARE\\Microsoft\\Office\\Common\\COM Compatibility).
- Deploy DNS filtering for dynamic DNS providers (DDNS) frequently leveraged by APT-C-17.
- Enforce Zero Trust Application Whitelisting on all classified research air-gapped workstations.`,
  },
  {
    id: 'dpdp-preset',
    title: 'DPDP Act 2023: Corporate Cyber Compliance Guide',
    fileType: 'txt' as const,
    sector: 'LEGAL & PRIVACY',
    text: `DIGITAL PERSONAL DATA PROTECTION (DPDP) ACT 2023 - IMPLEMENTATION FRAMEWORK
Ministry of Electronics and Information Technology (MeitY), Government of India

CHAPTER I: DATA FIDUCIARY OBLIGATIONS
Every entity processing digital personal data of Indian citizens is recognized as a Data Fiduciary. Fiduciaries must implement reasonable technical and organizational safeguards to prevent personal data breaches. Failure to prevent breaches attracts penalties up to 250 Crores per violation.

CHAPTER II: MANDATORY BREACH NOTIFICATION
In the event of a personal data breach:
1. The Data Protection Board of India (DPBI) must be notified in the prescribed format within the statutory timeframe.
2. Every affected Data Principal (user) must receive direct electronic notification detailing the nature of the breach, affected data categories, and recommended self-protection steps.

CHAPTER III: CHILDREN'S DATA & VERIFIABLE PARENTAL CONSENT
Processing personal data of children (individuals under 18 years) requires verifiable consent of the parent or lawful guardian. Tracking, behavioral monitoring, or targeted advertising directed at children is strictly prohibited with severe penalty multipliers under Section 9 of the Act.`,
  },
]

export const INITIAL_STORED_DOCUMENTS: StoredDocument[] = [
  {
    id: 'doc-001',
    fileName: 'CERT-In_Advisory_CIAD-2024-0021_Ransomware_LockBit3.pdf',
    fileType: 'pdf',
    fileSize: 4404019,
    uploadDate: '2026-09-18 14:32 IST',
    rawText: PRESET_THREAT_TEXTS[0].text,
    characterCount: PRESET_THREAT_TEXTS[0].text.length,
    wordCount: PRESET_THREAT_TEXTS[0].text.split(/\s+/).length,
    status: 'READY',
    sector: 'HEALTHCARE & FINANCE',
    videoDuration: '01:45',
    script: {
      title: 'CERT-In Flash Briefing: LockBit 3.0 Ransomware Containment',
      topic: 'LockBit 3.0 Ransomware & Double Extortion',
      language: 'English (IN)',
      summary: 'Critical security advisory analyzing LockBit 3.0 tactics, execution flow, lateral propagation, and CERT-In 6-hour mandatory compliance protocol.',
      keyTerms: ['LockBit 3.0', 'T1566 Phishing', 'StealBit Exfiltration', 'Volume Shadow Copies', 'CERT-In Directive'],
      targetAudience: 'SOC Analysts, Incident Responders & CISOs',
      totalDurationSec: 105,
      scenes: [
        {
          id: 'sc-1',
          type: 'intro',
          title: 'Emergency Advisory: LockBit 3.0 Ransomware Surge',
          narrationText: 'Attention SOC teams. CERT-In has issued high-priority advisory CIAD-2024-0021 regarding an active LockBit 3.0 ransomware campaign targeting Indian banking nodes and healthcare systems.',
          durationSec: 15,
        },
        {
          id: 'sc-2',
          type: 'explainer',
          title: 'Execution Mechanics & TTPs',
          heading: 'Threat Actor Modus Operandi',
          bullets: [
            'Spearphishing with password-protected ZIP archives bypassing email gateways',
            'Execution of StealBit info-stealer exfiltrating confidential records before encryption',
            'PowerShell script terminating 45+ enterprise backup and security processes',
            'Deletion of Volume Shadow Copies using vssadmin to prevent local recovery',
          ],
          highlights: ['StealBit', 'vssadmin delete shadows', 'svchost.exe injection'],
          narrationText: 'LockBit 3.0 relies on double extortion. Prior to executing its high-speed multi-threaded encryption, the ransomware deploys StealBit to exfiltrate database records to offshore servers, leaving victims no leverage.',
          durationSec: 25,
        },
        {
          id: 'sc-3',
          type: 'code',
          title: 'Host Hunting & Forensic Detection Rule',
          code: `rule LockBit3_Ransomware_Hunting {
    meta:
        author = "TRINETRA Cyber Threat Intel"
        severity = "CRITICAL"
    strings:
        $mutex = "Global\\{5D41402ABC4B2A76B9719D911017C592}"
        $vss_kill = "vssadmin.exe Delete Shadows /All /Quiet"
    condition:
        uint16(0) == 0x5A4D and any of them
}`,
          language: 'yara',
          narrationText: 'Deploy this YARA signature across all enterprise endpoint detection sensors. It identifies the unique mutex creation and the automated shadow copy deletion commands characteristic of LockBit.',
          durationSec: 22,
        },
        {
          id: 'sc-4',
          type: 'flowchart',
          title: 'Mandatory CERT-In Response Timeline',
          steps: [
            'T+00m: Segment Host Network Isolation',
            'T+30m: Forensic RAM & Registry Capture',
            'T+02h: Root-Cause Vector Identification',
            'T+06h: Mandatory CERT-In Incident Filing',
            'T+24h: Clean Immutable Backup Restoration',
          ],
          colors: ['#ef4444', '#f59e0b', '#06b6d4', '#10b981', '#6366f1'],
          narrationText: 'Compliance mandate under Indian cyber law: affected entities must submit formal incident disclosure to CERT-In within six hours of initial anomaly detection, while preserving raw forensic artifacts.',
          durationSec: 25,
        },
        {
          id: 'sc-5',
          type: 'summary',
          title: 'Strategic Defense Posture & Legal Guardrails',
          bullets: [
            'Verify immutable, air-gapped 3-2-1 backup architecture weekly',
            'Enforce MFA on all Remote Desktop (RDP) and VPN gateways without exception',
            'DPDP Act 2023 compliance: Notify affected data principals within 72 hours',
          ],
          highlights: ['Immutable Backups', 'Zero Trust RDP', 'DPDP Compliance'],
          narrationText: 'To summarize: ensure immutable offline backups are verified, terminate legacy SMB shares, and maintain active coordination with the TRINETRA sovereign SOC grid.',
          durationSec: 18,
        },
      ],
    },
  },
  {
    id: 'doc-002',
    fileName: 'APT_SideWinder_Intrusion_KillChain_Briefing.pptx',
    fileType: 'pptx',
    fileSize: 9122611,
    uploadDate: '2026-09-17 19:15 IST',
    rawText: PRESET_THREAT_TEXTS[1].text,
    characterCount: PRESET_THREAT_TEXTS[1].text.length,
    wordCount: PRESET_THREAT_TEXTS[1].text.split(/\s+/).length,
    status: 'READY',
    sector: 'DEFENSE & AEROSPACE',
    videoDuration: '01:25',
    script: {
      title: 'Tactical Recon: SideWinder APT Espionage Campaign',
      topic: 'State-Sponsored Targeted Espionage',
      language: 'English (IN)',
      summary: 'Tactical breakdown of SideWinder exploitation targeting South Asian defense research organizations using weaponized RTF documents and Equation Editor flaws.',
      keyTerms: ['SideWinder (APT-C-17)', 'CVE-2017-11882', 'Dynamic DNS C2', 'In-Memory Payload', 'Zero Trust'],
      targetAudience: 'Defense Intelligence Officers & Red/Blue Teams',
      totalDurationSec: 85,
      scenes: [
        {
          id: 'sc-201',
          type: 'intro',
          title: 'APT-C-17 SideWinder Threat Dossier',
          narrationText: 'Declassified intelligence briefing on APT-C-17, known as SideWinder. Over 1,000 highly targeted spearphishing lures have targeted Indian defense institutions over the past quarter.',
          durationSec: 14,
        },
        {
          id: 'sc-202',
          type: 'explainer',
          title: 'Weaponized Lures & Memory Injection',
          heading: 'CVE-2017-11882 Exploitation Chain',
          bullets: [
            'Delivery disguised as official naval tenders and bilateral symposium invites',
            'Exploits legacy Microsoft Equation Editor stack buffer overflow in memory',
            'Bypasses conventional disk-based antivirus via fileless DLL injection',
            'Communicates with dynamic DNS staging infrastructure spoofing Indian ISPs',
          ],
          highlights: ['Fileless Execution', 'Equation Editor', 'Dynamic DNS Spoofing'],
          narrationText: 'SideWinder weaponizes old vulnerabilities with modern delivery mechanisms. By exploiting Equation Editor buffer overflows, the actor runs fileless code directly inside memory without writing binaries to disk.',
          durationSec: 24,
        },
        {
          id: 'sc-203',
          type: 'comparison',
          title: 'Defense Architecture: Legacy vs Zero Trust',
          leftTitle: 'Perimeter-Only Security (Vulnerable)',
          leftPoints: [
            'Implicit trust inside corporate LAN',
            'Equation Editor enabled across workstations',
            'Outbound dynamic DNS traffic unmonitored',
            'Antivirus checks only disk files',
          ],
          rightTitle: 'TRINETRA Hardened Posture (Defended)',
          rightPoints: [
            'Microsegmentation & strict least-privilege',
            'Equation Editor disabled via Group Policy',
            'Dynamic DNS blocked at central DNS sinkhole',
            'Behavioral memory scanning with EDR active',
          ],
          narrationText: 'Comparing security paradigms: traditional perimeter defenses allow fileless payloads to dwell undetected. Modern zero-trust architecture disables vulnerable COM objects and sinkholes unauthorized outbound beaconing.',
          durationSec: 25,
        },
        {
          id: 'sc-204',
          type: 'summary',
          title: 'Tactical Hardening Directives',
          bullets: [
            'Block all dynamic DNS domains and untrusted TLDs at core firewalls',
            'Isolate air-gapped defense research laboratories from public routing',
            'Report matching telemetry to NCIIPC threat intelligence sharing exchange',
          ],
          highlights: ['DNS Sinkholing', 'Air-Gap Isolation', 'NCIIPC Alignment'],
          narrationText: 'All defense sector endpoints must verify COM compatibility registry settings immediately to neutralize equation editor abuse.',
          durationSec: 22,
        },
      ],
    },
  },
  {
    id: 'doc-003',
    fileName: 'DPDP_Act_2023_Data_Fiduciary_Mandates.txt',
    fileType: 'txt',
    fileSize: 49152,
    uploadDate: '2026-09-16 11:05 IST',
    rawText: PRESET_THREAT_TEXTS[2].text,
    characterCount: PRESET_THREAT_TEXTS[2].text.length,
    wordCount: PRESET_THREAT_TEXTS[2].text.split(/\s+/).length,
    status: 'READY',
    sector: 'LEGAL & PRIVACY',
    videoDuration: '00:58',
    script: {
      title: 'Executive Legal Briefing: DPDP Act 2023 Directives',
      topic: 'Data Protection Law & Breach Penalties',
      language: 'English (IN)',
      summary: 'Executive briefing on the Digital Personal Data Protection Act 2023, data fiduciary obligations, mandatory reporting, and 250 Cr penalty exposure.',
      keyTerms: ['DPDP Act 2023', 'Data Fiduciary', '250 Crore Penalty', 'Data Protection Board', 'Child Data Protection'],
      targetAudience: 'Compliance Officers, Legal Counsel & DevOps Teams',
      totalDurationSec: 58,
      scenes: [
        {
          id: 'sc-301',
          type: 'intro',
          title: 'DPDP Act 2023: Sovereign Data Governance',
          narrationText: 'Welcome to this executive legal briefing on India Digital Personal Data Protection Act 2023. This legislation fundamentally reshapes corporate accountability for cybersecurity and consumer data privacy.',
          durationSec: 12,
        },
        {
          id: 'sc-302',
          type: 'explainer',
          title: 'Core Duties of Data Fiduciaries',
          heading: 'Statutory Compliance Mandates',
          bullets: [
            'Duty to implement robust technical security safeguards against breach',
            'Mandatory notification to the Data Protection Board and impacted users',
            'Right to correction, erasure, and grievance redressal for all citizens',
            'Strict ban on tracking or targeted advertising directed at children under 18',
          ],
          highlights: ['Mandatory Notification', '250 Cr Max Penalty', 'No Child Tracking'],
          narrationText: 'Under the Act, every organization handling citizen data is held liable as a Data Fiduciary. Breaches resulting from negligence face statutory fines scaling up to two hundred and fifty crore rupees.',
          durationSec: 24,
        },
        {
          id: 'sc-303',
          type: 'summary',
          title: 'Actionable SOC Preparation Checklist',
          bullets: [
            'Audit all third-party data pipelines and automated analytics trackers',
            'Implement automated breach detection and user communication workflows',
            'Appoint a Data Protection Officer based in India for regulatory liaison',
          ],
          highlights: ['Data Audit', 'Automated Triage', 'Indian Resident DPO'],
          narrationText: 'Ensure your enterprise incident response runbooks incorporate formal notification workflows for the Data Protection Board to eliminate statutory penalty risk.',
          durationSec: 22,
        },
      ],
    },
  },
]
