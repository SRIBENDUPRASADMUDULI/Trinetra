// =============================================================================
// CyberShield Bharat -- MITRE ATT&CK TTP Data
// 20 techniques with detection, mitigation, and recent campaign attributions
// =============================================================================

export interface AttackTTP {
  id: string
  name: string
  tactic: string
  description: string
  detection: string
  mitigation: string
  recentCampaigns: string[]
}

export const ATTACK_TTPS: AttackTTP[] = [
  {
    id: 'T1566.001',
    name: 'Spearphishing Attachment',
    tactic: 'Initial Access',
    description:
      'Adversaries send spearphishing emails with malicious attachments as a vector to gain access to victim systems. The attachment may be a document (Word, Excel, PDF), archive, or executable that exploits a vulnerability or contains a malicious macro.',
    detection:
      'Monitor inbound email attachments; alert on macro-enabled Office files (.xlsm, .docm), double-extension files (invoice.pdf.exe), and archives containing executables. Correlate with process creation events when attachment is opened.',
    mitigation:
      'Enable Protected View and Attack Surface Reduction rules in Windows Defender. Disable Office macros from internet-sourced files via Group Policy. Deploy email gateway with sandbox detonation. User phishing awareness training.',
    recentCampaigns: ['APT-SideWinder vs MEA India', 'Lazarus Group vs Indian Defence', 'APT28 vs Ukraine', 'Storm-0978 NATO Summit'],
  },
  {
    id: 'T1190',
    name: 'Exploit Public-Facing Application',
    tactic: 'Initial Access',
    description:
      'Adversaries attempt to exploit weaknesses in an internet-facing application such as a web server, VPN, firewall, or database. Common exploits target SQL injection, path traversal, deserialization flaws, and authentication bypasses.',
    detection:
      'WAF logs for anomalous request patterns (SQL keywords, path traversal sequences, oversized payloads). Monitor for new process spawns from web server processes (e.g., w3wp.exe, httpd spawning cmd.exe). Alert on web server reading files outside webroot.',
    mitigation:
      'Maintain patch cadence for all public-facing applications. Deploy WAF with OWASP Core Rule Set. Implement virtual patching for zero-days. Regular DAST/penetration testing. Segment application from internal network.',
    recentCampaigns: ['Cl0p MOVEit campaign', 'FIN11 Accellion attacks', 'APT41 vs NTPC India', 'POSOCO ICS breach'],
  },
  {
    id: 'T1078',
    name: 'Valid Accounts',
    tactic: 'Defense Evasion / Persistence / Privilege Escalation / Initial Access',
    description:
      'Adversaries may obtain and abuse credentials of existing accounts as a means of gaining Initial Access, Persistence, Privilege Escalation, or Defense Evasion. Compromised credentials may be used to bypass access controls.',
    detection:
      'Alert on logins from unusual geographies, impossible travel (login from Mumbai then London within 30 min), off-hours logins, and user agents inconsistent with normal behavior. Monitor for new service account creation and privilege escalation post-login.',
    mitigation:
      'Enforce MFA across all accounts. Implement Privileged Access Workstations (PAW) for admin accounts. Password manager enforcement. Regular access reviews and least-privilege principle. Monitor haveibeenpwned for corporate email exposure.',
    recentCampaigns: ['DMRC Momentum credential stuffing', 'BSNL SS7 SIM swap', 'Storm-1575 Microsoft 365 BEC', 'Scattered Spider MGM'],
  },
  {
    id: 'T1486',
    name: 'Data Encrypted for Impact',
    tactic: 'Impact',
    description:
      'Adversaries encrypt data on target systems to interrupt availability of system and network resources. Ransomware typically discovers and encrypts files on local drives, network shares, and backup systems before presenting a ransom demand.',
    detection:
      'Alert on mass file rename events (extension changes), rapid file creation matching encryption patterns, deletion of volume shadow copies (vssadmin delete shadows), and sudden spike in disk I/O. Honeypot files in user directories trigger instant alerts.',
    mitigation:
      'Immutable offsite backups (3-2-1 rule). Disable VSS deletion for non-admin accounts. Controlled folder access (Windows Defender). EDR behavioral detection for ransomware patterns. Network segmentation to prevent lateral spread.',
    recentCampaigns: ['LockBit 3.0 vs AIIMS Delhi', 'ALPHV/BlackCat vs Indian healthcare', 'Rhysida vs hospitals', 'Play vs manufacturing'],
  },
  {
    id: 'T1055.001',
    name: 'Process Injection: Dynamic-link Library Injection',
    tactic: 'Defense Evasion / Privilege Escalation',
    description:
      'Adversaries inject malicious DLLs into running processes to evade process-based defenses and potentially elevate privileges. The malicious code then runs in the context of the host process, inheriting its permissions and network connections.',
    detection:
      'Monitor for CreateRemoteThread, WriteProcessMemory, and VirtualAllocEx API calls across process boundaries. Alert on unsigned DLLs loaded into signed processes. Watch for unusual parent-child process relationships.',
    mitigation:
      'Enable Windows Defender Credential Guard and Protected Processes for LSASS. Deploy EDR with memory scanning. Enforce driver signature enforcement. Block unsigned DLL loading via AppLocker or WDAC policies.',
    recentCampaigns: ['APT41 vs NTPC India', 'Cobalt Strike campaigns', 'FIN7 financial sector attacks', 'Turla group espionage'],
  },
  {
    id: 'T1110.004',
    name: 'Brute Force: Credential Stuffing',
    tactic: 'Credential Access',
    description:
      'Adversaries use credentials (username + password pairs) obtained from data breaches to attempt to authenticate to target services. Credential stuffing differs from password spraying in that it uses real leaked pairs rather than guessing common passwords.',
    detection:
      'Alert on login attempts with high failure rate followed by success. Detect distributed login attempts from multiple IPs with same username list. Monitor for velocity anomalies: >10 failed logins per user per minute. Check against known breach databases.',
    mitigation:
      'Implement account lockout and CAPTCHA after N failed attempts. Bot management solutions (Cloudflare Bot Management, Akamai Bot Manager). Breach password checks at login. Passkeys/WebAuthn to eliminate password entirely.',
    recentCampaigns: ['DMRC Momentum app attack', 'Rockyou2024 stuffing wave', 'Okta BeyondTrust breach', 'Okta support portal attack'],
  },
  {
    id: 'T1041',
    name: 'Exfiltration Over C2 Channel',
    tactic: 'Exfiltration',
    description:
      'Adversaries may steal data by exfiltrating it over an existing command and control channel. Stolen data is encoded into the normal communications channel using the same protocol as C2 communications, making detection difficult.',
    detection:
      'Baseline and alert on unusual outbound data volume from internal servers. Inspect C2 beacon traffic for base64-encoded or compressed payloads. Monitor DNS query sizes and HTTP/S request body sizes for anomalies above baseline.',
    mitigation:
      'Network DLP with content inspection at egress. TLS inspection on known-bad domains. DNS RPZ (Response Policy Zone) blocking C2 domains. Egress firewall whitelisting only approved cloud destinations.',
    recentCampaigns: ['SBI SQL injection exfiltration', 'APT-SideWinder MEA espionage', 'Lazarus crypto heist', 'FIN11 data theft extortion'],
  },
  {
    id: 'T1195.002',
    name: 'Supply Chain Compromise: Compromise Software Supply Chain',
    tactic: 'Initial Access',
    description:
      'Adversaries manipulate application or software source code in software supply chains prior to receipt by the final consumer. This enables adversaries to infect all users of a software package without needing to attack them individually.',
    detection:
      'Software composition analysis (SCA) in CI/CD pipelines. Monitor package registries for typosquats of internal dependencies. Alert on postinstall scripts in newly added NPM/PyPI packages. Verify checksums against known-good hashes.',
    mitigation:
      'Pin dependency versions and use lockfiles (package-lock.json, requirements.txt). Enable provenance attestation (Sigstore). Private dependency mirrors with manual approval workflow. SBOM generation and monitoring.',
    recentCampaigns: ['Razorpay NPM typosquat India', 'XZ Utils backdoor (JiaT75)', 'SolarWinds SUNBURST', 'Codecov bash uploader'],
  },
  {
    id: 'T1071.001',
    name: 'Application Layer Protocol: Web Protocols',
    tactic: 'Command and Control',
    description:
      'Adversaries communicate using application layer protocols associated with web traffic (HTTP/HTTPS) to avoid detection and network filtering. C2 traffic blends with legitimate web traffic, making network-based detection difficult.',
    detection:
      'Alert on HTTP/S connections to newly registered domains or domains with low Alexa rank. Detect beaconing patterns (consistent intervals, small payload sizes). Inspect JA3/JA3S TLS fingerprints against known malicious signatures. DNS-based C2 traffic analysis.',
    mitigation:
      'DNS RPZ and threat intelligence feed integration on firewall. TLS inspection with certificate validation. Web proxy with categorization. User and Entity Behavior Analytics (UEBA) for outbound connection baselining.',
    recentCampaigns: ['Cobalt Strike HTTP beaconing', 'DNS-over-HTTPS C2 evasion', 'SideWinder APT India MEA', 'IcedID banking trojan'],
  },
  {
    id: 'T1498.002',
    name: 'Network Denial of Service: Reflection Amplification',
    tactic: 'Impact',
    description:
      'Adversaries may attempt to cause a denial of service by reflecting a high-volume of network traffic to a target via exploiting third-party servers for reflection. DNS, NTP, memcached, SSDP amplification attacks can generate traffic 10,000x the original request size.',
    detection:
      'NetFlow analysis for asymmetric UDP traffic patterns. Alert on DNS query rate from single source exceeding baseline. Monitor for memcached, NTP, SSDP amplification signatures at ISP/upstream provider level. Scrubbing center integration.',
    mitigation:
      'BCP38/BCP84 ingress filtering to prevent spoofed source IPs. Rate-limit UDP responses on public-facing DNS servers. Anycast routing for DDoS distribution. Upstream transit provider DDoS protection agreements.',
    recentCampaigns: ['NIC DNS amplification 380Gbps', 'Cloudflare 3.8Tbps Mirai DDoS', 'HTTP/2 Rapid Reset 398Mrps', 'Google Cloud 46Mpps memcached'],
  },
  {
    id: 'T1567.002',
    name: 'Exfiltration Over Web Service: Exfiltration to Cloud Storage',
    tactic: 'Exfiltration',
    description:
      'Adversaries may exfiltrate data to a cloud storage service rather than over their primary command and control channel. Data is uploaded using cloud storage APIs (Google Drive, Dropbox, OneDrive, AWS S3), blending with legitimate traffic.',
    detection:
      'DLP solution monitoring uploads to cloud storage from sensitive data classification zones. Alert on large uploads to cloud storage from service accounts or servers (not typical user behavior). Track OAuth token usage for cloud apps.',
    mitigation:
      'CASB (Cloud Access Security Broker) to enforce DLP policies on cloud uploads. Block unauthorized cloud storage apps via proxy. Require managed devices for cloud storage access. Data classification and watermarking for sensitive documents.',
    recentCampaigns: ['Apollo Hospitals insider threat', 'LockBit double extortion exfil', 'Lapsus$ Microsoft source code', 'APT29 Google Drive C2'],
  },
  {
    id: 'T1489',
    name: 'Service Stop',
    tactic: 'Impact',
    description:
      'Adversaries may stop or disable services on a system to render those services unavailable to legitimate users. Stopping critical services can inhibit or stop response to an incident, render antivirus ineffective, or clear the path for ransomware deployment.',
    detection:
      'Alert on unexpected stopping of critical security services (WinDefend, EventLog, VSS). Monitor for sc.exe, net stop, and taskkill commands targeting security tools. Correlate service-stop events with preceding lateral movement indicators.',
    mitigation:
      'Protect security service binaries with tamper protection. Run EDR in protected mode. Alert-only mode for security tool service changes. Privileged access required to stop security services.',
    recentCampaigns: ['LockBit pre-ransomware preparation', 'BlackBasta pre-deployment', 'ALPHV ransomware staging', 'Hive ransomware sequence'],
  },
  {
    id: 'T1557',
    name: 'Adversary-in-the-Middle',
    tactic: 'Credential Access / Collection',
    description:
      'Adversaries attempt to position themselves between two or more networked devices to support follow-on behaviors. AiTM enables capture of credentials, session tokens, and other authentication material. Includes ARP poisoning, BGP hijacking, SSL stripping.',
    detection:
      'Monitor ARP tables for suspicious changes (multiple IPs mapping to same MAC). Alert on BGP route announcements not matching expected ASN paths. Detect SSL stripping with HSTS violation logs. Monitor for Evilginx2/Modlishka tool signatures in HTTP traffic.',
    mitigation:
      'Enable 802.1X port-based NAC. RPKI for BGP route validation. HSTS preloading for web services. Certificate pinning for mobile apps. Implement DNSSEC. Use FIDO2/WebAuthn which is phish-resistant.',
    recentCampaigns: ['BSNL SS7 interception', 'Jio BGP route leak', 'EvilProxy AiTM phishing', 'Cloudflare MITM detection'],
  },
  {
    id: 'T1552.001',
    name: 'Unsecured Credentials: Credentials In Files',
    tactic: 'Credential Access',
    description:
      'Adversaries may search local file systems and remote file shares for files containing insecurely stored credentials. These can include user credentials, private keys, certificates, API keys, and database connection strings stored in configuration files, bash history, or environment files.',
    detection:
      'SIEM alert on file access to .env, config.yml, credentials.xml, .aws/credentials files by non-owner processes. DLP scanning for credential patterns (private key headers, connection strings) in unencrypted files. Git repository scanning for secrets.',
    mitigation:
      'Secrets management vault (HashiCorp Vault, AWS Secrets Manager, Azure Key Vault). Pre-commit git hooks (gitleaks, trufflehog). Regular scanning of version control for accidentally committed secrets. Environment variable injection instead of file storage.',
    recentCampaigns: ['Razorpay NPM postinstall theft', 'CircleCI secrets breach', 'Uber GitHub token exposure', 'Samsung source code Slack leak'],
  },
  {
    id: 'T1491.001',
    name: 'Defacement: Internal Defacement',
    tactic: 'Impact',
    description:
      'Adversaries modify visual content available to internal users on enterprise systems. This may include intranet portals, SharePoint sites, or internal communications. Used for impact, disinformation, or to signal successful compromise.',
    detection:
      'File integrity monitoring on web content directories. Alert on changes to index.html, web.config, or site images without deployment pipeline trigger. Monitor CMS admin panel login events from unusual IPs.',
    mitigation:
      'Content delivery from immutable pipeline (CI/CD deployment only). File integrity monitoring with real-time alerting. Web server process runs with read-only access to content. Rollback capability from version control.',
    recentCampaigns: ['Team Insane PK vs up.gov.in', 'Anonymous vs Indian govt sites', 'DragonForce Malaysia defacements', 'GhostSec vs Israel'],
  },
  {
    id: 'T1200',
    name: 'Hardware Additions',
    tactic: 'Initial Access',
    description:
      'Adversaries introduce compromised hardware into the target environment, such as rogue network devices, keyloggers, implants on USB peripherals, or malicious hardware connected to OT/ICS systems.',
    detection:
      'Asset inventory alerting on new MAC addresses on network. USB device control policy violations. Physical security review of OT/ICS device inventories. Network scanning for rogue wireless access points.',
    mitigation:
      'USB port lockdown via Group Policy or endpoint management. Physical access controls for ICS environments. Disable unused network ports (802.1X). Regular hardware audit against approved asset list.',
    recentCampaigns: ['DMRC IoT sensor tampering', 'SBI ATM jackpotting USB', 'Stuxnet PLC compromise', 'Industroyer2 ICS implant'],
  },
  {
    id: 'T1027',
    name: 'Obfuscated Files or Information',
    tactic: 'Defense Evasion',
    description:
      'Adversaries may attempt to make an executable or file difficult to discover or analyze by encrypting, encoding, or otherwise obfuscating its contents on the system or in transit. Techniques include base64 encoding, XOR encryption, packing, and steganography.',
    detection:
      'Alert on high-entropy file content in non-expected locations (encrypted data in temp directories). Monitor for abnormal use of certutil, PowerShell -EncodedCommand, or MSHTA with encoded payloads. YARA rules for packer signatures.',
    mitigation:
      'EDR with memory scanning to detect unpacked malware at runtime. Script block logging for PowerShell. AMSI (Antimalware Scan Interface) integration. Sandboxed analysis of suspicious files before execution.',
    recentCampaigns: ['SideWinder DNS-over-HTTPS obfuscation', 'APT40 PowerShell staging', 'IcedID JS obfuscation', 'Emotet obfuscated macros'],
  },
  {
    id: 'T1543.003',
    name: 'Create or Modify System Process: Windows Service',
    tactic: 'Persistence / Privilege Escalation',
    description:
      'Adversaries create or modify Windows services to repeatedly execute malicious payloads as part of persistence. When Windows boots up, it starts services, so creating a malicious service ensures the adversary payload runs automatically.',
    detection:
      'Alert on new service creation (EventID 7045) with unusual binary paths. Monitor services pointing to non-standard directories (Temp, AppData). Alert on services with LocalSystem privileges and unsigned binaries.',
    mitigation:
      'Restricted service installation permissions. Baseline approved service list and alert on deviations. Code signing enforcement for service binaries. Service control manager audit logging.',
    recentCampaigns: ['PloutusD ATM malware persistence', 'Cobalt Strike service install', 'BlackByte ransomware persistence', 'TrickBot service install'],
  },
  {
    id: 'T1583.001',
    name: 'Acquire Infrastructure: Domains',
    tactic: 'Resource Development',
    description:
      'Adversaries register domains to use during operations. The adversary can purchase, register, or take over expired domains for malicious purposes, often creating typosquats or lookalike domains of legitimate organizations to support phishing or C2.',
    detection:
      'Monitor newly registered domain feeds (WHOIS, passive DNS) for lookalikes of protected brand names (Levenshtein distance < 3). Alert on domain registration using same registrant details as known malicious actors. Passive DNS tracking of threat actor infrastructure.',
    mitigation:
      'Register common typosquats of own brand proactively. Monitor domain registration alerts. DMARC p=reject policy to prevent email domain spoofing. Takedown process for malicious lookalike domains via registrar abuse reports.',
    recentCampaigns: ['ICICI iMobile phishing kit', 'SBI KYC domain registration', 'APT29 lookalike domains', 'FIN7 company impersonation'],
  },
  {
    id: 'T1565.002',
    name: 'Data Manipulation: Transmitted Data Manipulation',
    tactic: 'Impact',
    description:
      'Adversaries manipulate data in transit to target specific resources or systems. Manipulation of transmitted data may also include changes to upstream data feeds to influence real-world outcomes such as financial markets, election results, or safety systems.',
    detection:
      'Implement cryptographic integrity checks (HMAC, digital signatures) on all critical data channels. Alert on checksum mismatches. Monitor ICS protocol integrity (DNP3, IEC 61850) for unauthorized command sequences.',
    mitigation:
      'End-to-end encryption and integrity verification for all critical communications. IEC 62351 for power grid communications security. Code signing and data signing for firmware and OT updates. Network monitoring for protocol anomalies.',
    recentCampaigns: ['POSOCO EMS data manipulation', 'Industroyer grid attack Ukraine', 'Sandworm Ukrainian power grid', 'TRITON/TRISIS safety system'],
  },
]
