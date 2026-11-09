// =============================================================================
// CyberShield Bharat -- Mock Threat Feed
// Realistic SOC threat events targeting Indian critical infrastructure
// =============================================================================

export type ThreatSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export type ThreatSector = 'FINANCE' | 'POWER' | 'TELECOM' | 'GOVT' | 'HEALTHCARE' | 'DMRC'
export type ThreatStatus = 'ACTIVE' | 'CONTAINED' | 'INVESTIGATING'

export interface ThreatEvent {
  id: string
  timestamp: string
  severity: ThreatSeverity
  sector: ThreatSector
  attackType: string
  sourceIp: string
  sourceCountry: string
  targetAsset: string
  ttps: string[]
  status: ThreatStatus
  description: string
  iocHash?: string
}

export const MOCK_THREAT_FEED: ThreatEvent[] = [
  {
    id: 'EVT-2024-001',
    timestamp: '2024-09-14T18:42:11Z',
    severity: 'CRITICAL',
    sector: 'FINANCE',
    attackType: 'SQL Injection / Data Exfiltration',
    sourceIp: '185.220.101.47',
    sourceCountry: 'RU',
    targetAsset: 'SBI Internet Banking Portal — api.onlinesbi.sbi.co.in',
    ttps: ['T1190', 'T1071.001', 'T1041'],
    status: 'ACTIVE',
    description:
      'Automated SQL injection campaign targeting the SBI NetBanking login endpoint. Attacker using Tor exit node; 14,000 credential stuffing attempts detected in 6-minute window. Payloads include UNION-based extraction of session tokens. WAF signatures updated; DB audit logs show anomalous SELECT on customer_accounts table.',
    iocHash: 'a3f8c1e29d4b7f6a0c5d2e1b8f4a9c3d7e6b2f1a',
  },
  {
    id: 'EVT-2024-002',
    timestamp: '2024-09-14T17:15:33Z',
    severity: 'CRITICAL',
    sector: 'FINANCE',
    attackType: 'API Abuse / UPI Fraud Loop',
    sourceIp: '103.75.190.22',
    sourceCountry: 'CN',
    targetAsset: 'NPCI UPI Switch — upi.npci.org.in',
    ttps: ['T1078', 'T1059.003', 'T1566.002'],
    status: 'INVESTIGATING',
    description:
      'Anomalous high-frequency API calls to NPCI UPI /collect endpoint using 847 compromised merchant VPA credentials. Transactions routed through mule accounts in sequence to evade daily-limit checks. Amount pattern: Rs 9,999 repeated 3x before stepping up. CERT-In notified. Temporary rate-limit enforcement applied.',
    iocHash: 'e7d3a8f1c4b9e2d6a0f5c8b3e1d4a7f2c9b6e3d',
  },
  {
    id: 'EVT-2024-003',
    timestamp: '2024-09-14T15:58:47Z',
    severity: 'HIGH',
    sector: 'POWER',
    attackType: 'Spear Phishing / SCADA Reconnaissance',
    sourceIp: '45.142.212.100',
    sourceCountry: 'CN',
    targetAsset: 'Power Grid Corporation of India — SCADA HMI Network',
    ttps: ['T1566.001', 'T1203', 'T1082', 'T1016'],
    status: 'INVESTIGATING',
    description:
      'Spear phishing email sent to 23 Power Grid Corp engineers. Attachment: "Grid_Maintenance_Q3_2024.xlsm" containing macro dropper (Cobalt Strike Beacon). Malware fingerprinted to APT41 (Winnti). Three workstations in SCADA DMZ show anomalous LDAP enumeration and ping sweeps to ICS subnet 10.4.0.0/16.',
    iocHash: 'c2b5e8a1f4d7c0b3e6a9d2f5c8b1e4a7d0c3b6e',
  },
  {
    id: 'EVT-2024-004',
    timestamp: '2024-09-14T14:22:09Z',
    severity: 'HIGH',
    sector: 'TELECOM',
    attackType: 'SS7 Protocol Exploit / SIM Swap',
    sourceIp: '91.108.4.212',
    sourceCountry: 'UA',
    targetAsset: 'BSNL SS7 Gateway — GW-BSNL-DEL-01',
    ttps: ['T1557', 'T1078.001', 'T1111'],
    status: 'ACTIVE',
    description:
      'SS7 MAP SendRoutingInfo abuse detected from rogue telecom node. Attacker intercepting OTPs for 1,200 BSNL subscribers. SIM swap transactions spiked 340% above baseline in Delhi/NCR region. Targeted users appear to be customers of HDFC Bank and Zerodha — correlated OTP interception with financial fraud attempts.',
    iocHash: 'f4a7d0c3b6e9a2f5c8b1e4d7a0c3f6b9e2a5d8',
  },
  {
    id: 'EVT-2024-005',
    timestamp: '2024-09-14T13:05:22Z',
    severity: 'CRITICAL',
    sector: 'HEALTHCARE',
    attackType: 'Ransomware / Double Extortion',
    sourceIp: '5.188.206.14',
    sourceCountry: 'RU',
    targetAsset: 'AIIMS Delhi — Electronic Health Record System (EHRS)',
    ttps: ['T1486', 'T1490', 'T1489', 'T1567.002'],
    status: 'ACTIVE',
    description:
      'LockBit 3.0 ransomware deployment confirmed on AIIMS Delhi EHRS servers. 150 TB of patient data encrypted. Ransom demand: $5M in Monero. Attacker claims exfiltration of 40M patient records including PM-JABY beneficiary data. Hospital operations shifted to paper-based fallback. National Cyber Incident Response Team (NCIRT) deployed on-site.',
    iocHash: 'b9e2a5d8f1c4b7e0a3d6c9b2e5a8d1f4c7b0e3',
  },
  {
    id: 'EVT-2024-006',
    timestamp: '2024-09-14T11:47:55Z',
    severity: 'HIGH',
    sector: 'DMRC',
    attackType: 'Credential Stuffing / Unauthorized Access',
    sourceIp: '194.165.16.78',
    sourceCountry: 'PK',
    targetAsset: 'Delhi Metro Rail Corp — DMRC Momentum App Backend',
    ttps: ['T1110.004', 'T1078', 'T1530'],
    status: 'CONTAINED',
    description:
      'Credential stuffing attack using combo-list of 820K email:password pairs against DMRC Momentum app API. 6,200 accounts successfully compromised. Attacker attempted to dump stored Paytm/UPI payment tokens. Suspicious S3-equivalent blob storage access to metro card top-up receipts. Affected accounts force-reset. IP range blocked at load balancer.',
    iocHash: 'a1d4c7f0b3e6a9d2f5c8b1e4a7d0f3c6b9e2a5',
  },
  {
    id: 'EVT-2024-007',
    timestamp: '2024-09-14T10:33:18Z',
    severity: 'MEDIUM',
    sector: 'GOVT',
    attackType: 'DDoS — DNS Amplification',
    sourceIp: '23.227.38.65',
    sourceCountry: 'US',
    targetAsset: 'NIC — National Informatics Centre DNS Infrastructure',
    ttps: ['T1498.002', 'T1071.004'],
    status: 'CONTAINED',
    description:
      'DNS amplification DDoS peaking at 380 Gbps targeting NIC authoritative nameservers. Queries for government.in and nic.in zone files from 14,000 open resolvers globally. gov.in portal experienced 22-minute partial outage. Scrubbing center mitigation applied; anycast routing updated to distribute load.',
    iocHash: 'd7c0b3e6a9d2c5b8f1e4a7d0c3f6b9e2a5d8f1',
  },
  {
    id: 'EVT-2024-008',
    timestamp: '2024-09-14T09:18:41Z',
    severity: 'HIGH',
    sector: 'FINANCE',
    attackType: 'Supply Chain Attack / Malicious NPM Package',
    sourceIp: '104.21.35.190',
    sourceCountry: 'NL',
    targetAsset: 'Razorpay Payment Gateway — Node.js SDK Build Pipeline',
    ttps: ['T1195.002', 'T1059.006', 'T1552.001'],
    status: 'INVESTIGATING',
    description:
      'Typosquat NPM package "razorpay-sdk-india" (vs legitimate "razorpay") published 72 hours ago. Contains obfuscated postinstall script that exfiltrates environment variables (API keys, DB connection strings) to attacker C2 at razorpay-support[.]xyz. Package downloaded 2,100 times. NPM abuse report filed. Affected merchant CI/CD pipelines being audited.',
    iocHash: 'e3a6d9c2b5f8e1a4d7c0b3f6a9d2c5b8e1a4d7',
  },
  {
    id: 'EVT-2024-009',
    timestamp: '2024-09-14T08:05:12Z',
    severity: 'MEDIUM',
    sector: 'GOVT',
    attackType: 'Website Defacement',
    sourceIp: '178.73.215.155',
    sourceCountry: 'ID',
    targetAsset: 'Uttar Pradesh State Government Portal — up.gov.in',
    ttps: ['T1491.001', 'T1190'],
    status: 'CONTAINED',
    description:
      'Hacktivist group "Team Insane PK" defaced up.gov.in main page with political message and Pakistani flag imagery. Exploited CVE-2024-4577 (PHP-CGI argument injection) on Apache web server running PHP 8.1. Defacement lasted 47 minutes. Site restored from backup; PHP patched to 8.3.11.',
    iocHash: 'c8b1e4a7d0f3c6b9e2a5d8f1c4b7e0a3d6c9b2',
  },
  {
    id: 'EVT-2024-010',
    timestamp: '2024-09-13T22:14:37Z',
    severity: 'CRITICAL',
    sector: 'FINANCE',
    attackType: 'ATM Network Jackpotting',
    sourceIp: '172.105.52.14',
    sourceCountry: 'NG',
    targetAsset: 'SBI ATM Network — Bangalore Zone ATM Switch',
    ttps: ['T1059.003', 'T1543.003', 'T1485'],
    status: 'ACTIVE',
    description:
      'Black-box ATM jackpotting attacks on 34 SBI ATMs across Bangalore. Attackers drilled ATM casing to access USB port, deployed Tyupkin/PloutusD malware via bootable USB. Rs 2.3 Cr dispensed before detection. XFS protocol logs show DISPENSE commands without corresponding transaction IDs. Physical security teams and forensic kits dispatched.',
    iocHash: 'f1c4b7e0a3d6c9b2e5a8d1f4c7b0e3a6d9c2b5',
  },
  {
    id: 'EVT-2024-011',
    timestamp: '2024-09-13T20:55:04Z',
    severity: 'HIGH',
    sector: 'POWER',
    attackType: 'Watering Hole Attack',
    sourceIp: '162.245.144.100',
    sourceCountry: 'CN',
    targetAsset: 'NTPC Ltd — Corporate Intranet Portal',
    ttps: ['T1189', 'T1203', 'T1055.001'],
    status: 'INVESTIGATING',
    description:
      'Watering hole attack on NTPC engineering forum using IE-11 memory corruption exploit (CVE-2023-28282). Malicious JavaScript loaded via compromised third-party widget. Process injection into NTPC_FieldReports.exe observed on 7 infected endpoints. C2 traffic to 162.245.144.100 over HTTPS mimicking CDN traffic with JA3 fingerprint evasion.',
    iocHash: 'a4d7c0b3e6a9d2f5c8b1e4a7d0c3f6b9e2a5d8',
  },
  {
    id: 'EVT-2024-012',
    timestamp: '2024-09-13T19:02:18Z',
    severity: 'MEDIUM',
    sector: 'TELECOM',
    attackType: 'BGP Hijacking',
    sourceIp: '203.88.141.5',
    sourceCountry: 'IN',
    targetAsset: 'Jio Reliance — BGP Routing Infrastructure AS55836',
    ttps: ['T1557', 'T1498'],
    status: 'CONTAINED',
    description:
      'Unauthorized BGP route announcements for Jio IP prefix 49.40.0.0/14 observed from AS9829 (BSNL). Traffic black-holing affected ~800K Jio users for 14 minutes. Appears accidental route leak rather than deliberate attack but under investigation for insider threat angle. ROA validation (RPKI) flagged the invalid announcement; auto-mitigation triggered.',
    iocHash: 'b5e8a1d4c7f0b3e6a9d2c5b8f1e4a7d0c3b6e9',
  },
  {
    id: 'EVT-2024-013',
    timestamp: '2024-09-13T16:40:55Z',
    severity: 'HIGH',
    sector: 'GOVT',
    attackType: 'Spear Phishing / RAT Deployment',
    sourceIp: '119.28.94.207',
    sourceCountry: 'CN',
    targetAsset: 'Ministry of External Affairs — MEA Secure Mail Server',
    ttps: ['T1566.001', 'T1105', 'T1071.001', 'T1027'],
    status: 'INVESTIGATING',
    description:
      'APT-SideWinder spear phishing targeting MEA staff with subject "India-China Border Meeting Agenda — CONFIDENTIAL". Attachment dropper installs SideWinder RAT with keylogging and screenshot capability. C2 over DNS-over-HTTPS to disguise traffic. Three diplomat mailboxes show signs of exfiltration over past 6 days. NSA SIGINT shared with NTRO.',
    iocHash: 'c6b9e2a5d8f1c4b7e0a3d6c9b2e5a8d1f4c7b0',
  },
  {
    id: 'EVT-2024-014',
    timestamp: '2024-09-13T14:28:31Z',
    severity: 'LOW',
    sector: 'FINANCE',
    attackType: 'Phishing Kit Takedown',
    sourceIp: '35.154.89.47',
    sourceCountry: 'IN',
    targetAsset: 'ICICI Bank — iMobile App Brand Impersonation',
    ttps: ['T1566.002', 'T1583.001'],
    status: 'CONTAINED',
    description:
      'Phishing kit mimicking ICICI iMobile app login page hosted on AWS EC2 in ap-south-1. Kit harvests username, password, and OTP in real-time via Telegram bot relay. 230 victims identified from kit logs. Domain: icicibank-secure-login[.]top. AWS abuse report filed; instance terminated. Victims notified via CERT-In advisory.',
    iocHash: 'd7c0b3e6f9a2d5c8b1e4a7d0f3c6b9e2a5d8f1',
  },
  {
    id: 'EVT-2024-015',
    timestamp: '2024-09-13T12:11:47Z',
    severity: 'HIGH',
    sector: 'HEALTHCARE',
    attackType: 'Insider Threat / Data Theft',
    sourceIp: '10.8.15.42',
    sourceCountry: 'IN',
    targetAsset: 'Apollo Hospitals — Patient Database Server (Internal)',
    ttps: ['T1078.002', 'T1048', 'T1560.001'],
    status: 'INVESTIGATING',
    description:
      'DLP alert: 1.2 GB compressed archive of patient PII (name, Aadhaar, diagnosis, insurance ID) uploaded to personal Google Drive by internal database administrator account "dbadmin_rkumar". User accessed records outside normal working hours (02:00-04:00 IST). HR has been notified; account suspended. Forensic imaging of workstation initiated. Potential violation of IT Act Section 43A.',
    iocHash: 'e8d1a4f7c0b3e6a9d2f5c8b1e4a7d0c3f6b9e2',
  },
  {
    id: 'EVT-2024-016',
    timestamp: '2024-09-13T10:55:03Z',
    severity: 'MEDIUM',
    sector: 'DMRC',
    attackType: 'IoT Sensor Tampering',
    sourceIp: '172.31.200.18',
    sourceCountry: 'IN',
    targetAsset: 'DMRC — Passenger Counting System (IoT Sensors) Line-3',
    ttps: ['T1200', 'T1059', 'T1498'],
    status: 'INVESTIGATING',
    description:
      'Anomalous firmware update commands sent to 47 DMRC Alstom passenger counting sensors on Dwarka-Noida corridor. Commands originated from unauthorized device on OT management VLAN. Sensors reporting passenger counts 300% above physical capacity — affecting crowd management AI model. ICS security team isolating affected VLAN segment.',
    iocHash: 'a2f5c8b1e4d7a0c3f6b9e2a5d8f1c4b7e0a3d6',
  },
  {
    id: 'EVT-2024-017',
    timestamp: '2024-09-13T08:22:19Z',
    severity: 'CRITICAL',
    sector: 'POWER',
    attackType: 'Zero-Day Exploit / OT Network Compromise',
    sourceIp: '45.83.92.11',
    sourceCountry: 'CN',
    targetAsset: 'POSOCO — National Load Despatch Centre, New Delhi',
    ttps: ['T1190', 'T1040', 'T1565.002'],
    status: 'ACTIVE',
    description:
      'Exploitation of zero-day in GE Grid Solutions EMS (Energy Management System) — unpatched CVE pending assignment. Attacker gained access to POSOCO real-time grid monitoring console. Suspicious read operations on load-flow model and generator dispatch instructions. No evidence of actuator commands yet. IEC 62351 encrypted comms bypassed via MITM on legacy RS-232 serial link. NSG cyber wing and GE PSIRT engaged.',
    iocHash: 'b3e6a9d2f5c8b1e4d7a0c3f6b9e2a5d8f1c4b7',
  },
  {
    id: 'EVT-2024-018',
    timestamp: '2024-09-13T06:08:55Z',
    severity: 'MEDIUM',
    sector: 'GOVT',
    attackType: 'Open Redirect / OAuth Phishing',
    sourceIp: '95.182.121.33',
    sourceCountry: 'RO',
    targetAsset: 'DigiLocker — UIDAI-linked Document Wallet',
    ttps: ['T1550.001', 'T1539', 'T1185'],
    status: 'CONTAINED',
    description:
      'Open redirect vulnerability in DigiLocker OAuth2 callback parameter abused to steal authorization codes. Malicious redirect URI: digilocker[.]net-secure[.]info. 140 user accounts had OAuth tokens hijacked, exposing Aadhaar, PAN, driving licence documents. Vulnerability patched; affected tokens revoked. UIDAI published advisory. No data modification confirmed.',
    iocHash: 'c4b7e0a3d6c9b2e5a8d1f4c7b0e3a6d9c2b5f8',
  },
  {
    id: 'EVT-2024-019',
    timestamp: '2024-09-12T23:47:12Z',
    severity: 'HIGH',
    sector: 'TELECOM',
    attackType: 'CDN Cache Poisoning',
    sourceIp: '82.157.123.55',
    sourceCountry: 'CN',
    targetAsset: 'Airtel CDN — Akamai Edge Nodes (India Region)',
    ttps: ['T1557', 'T1565.001', 'T1491.002'],
    status: 'CONTAINED',
    description:
      'HTTP response splitting attack poisoned Airtel Akamai edge cache for popular news domain ndtv.com. Served malicious JavaScript to ~45,000 users over 8-minute window before detection. Script attempted silent crypto-mining (XMRig) and session cookie theft. Akamai cache purged globally; headers corrected. MITM performed on HTTP (non-HSTS) connections.',
    iocHash: 'd5c8b1e4a7d0f3c6b9e2a5d8f1c4b7e0a3d6c9',
  },
  {
    id: 'EVT-2024-020',
    timestamp: '2024-09-12T21:30:04Z',
    severity: 'LOW',
    sector: 'FINANCE',
    attackType: 'Subdomain Takeover',
    sourceIp: '54.204.34.130',
    sourceCountry: 'US',
    targetAsset: 'HDFC Bank — Expired Subdomain assets.hdfcbank.com',
    ttps: ['T1584.001', 'T1608.001'],
    status: 'CONTAINED',
    description:
      'Subdomain takeover of assets.hdfcbank.com via unclaimed Azure CDN endpoint (azureedge.net CNAME dangling). Researcher-reported; bounty program disclosure. No active exploitation confirmed but subdomain was serving researcher-controlled HTML page for 72 hours. CNAME record removed; Azure CDN profile cleaned up. Bug bounty payout processed.',
    iocHash: 'e6a9d2f5c8b1e4d7a0c3b6f9e2a5d8f1c4b7e0',
  },
]

export const THREAT_FEED = MOCK_THREAT_FEED

export const SECTOR_THREAT_LEVELS: Record<string, { level: number; events: number }> = {
  FINANCE:     { level: 92, events: 8 },
  POWER:       { level: 71, events: 2 },
  TELECOM:     { level: 68, events: 3 },
  GOVT:        { level: 78, events: 3 },
  HEALTHCARE:  { level: 85, events: 2 },
  DMRC:        { level: 54, events: 2 },
  DEFENCE:     { level: 88, events: 1 },
  EDUCATION:   { level: 62, events: 2 },
}
