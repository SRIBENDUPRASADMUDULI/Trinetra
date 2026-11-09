// =============================================================================
// CyberShield Bharat -- Family Endpoint Fixtures
// Mock device security posture data for the Family Cyber Health module
// =============================================================================

export type DeviceType = 'smartphone' | 'laptop' | 'tablet' | 'router'
export type PatchStatus = 'UP_TO_DATE' | 'OUTDATED' | 'CRITICAL'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface OpenPort {
  port: number
  protocol: 'TCP' | 'UDP'
  service: string
  note: string
}

export interface FamilyEndpoint {
  id: string
  name: string
  deviceType: DeviceType
  os: string
  osVersion: string
  patchStatus: PatchStatus
  twoFactorEnabled: boolean
  browserName?: string
  browserVersion?: string
  browserUpToDate?: boolean
  antivirusActive: boolean
  antivirusName?: string
  lastSeen: string
  riskScore: number
  riskLevel: RiskLevel
  openPorts: OpenPort[]
  vulnerabilities: string[]
}

export const FAMILY_ENDPOINTS: FamilyEndpoint[] = [
  {
    id: 'DEV-001',
    name: 'Papa\'s Android Phone',
    deviceType: 'smartphone',
    os: 'Android',
    osVersion: '11',
    patchStatus: 'CRITICAL',
    twoFactorEnabled: false,
    browserName: 'Chrome',
    browserVersion: '98.0.4758.101',
    browserUpToDate: false,
    antivirusActive: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 8).toISOString(), // 8 mins ago
    riskScore: 88,
    riskLevel: 'CRITICAL',
    openPorts: [
      { port: 5555, protocol: 'TCP', service: 'ADB (Android Debug Bridge)', note: 'ADB over network is enabled — remote code execution risk over LAN' },
      { port: 8080, protocol: 'TCP', service: 'HTTP Proxy', note: 'Unknown proxy app serving HTTP traffic from device' },
    ],
    vulnerabilities: [
      'Android 11 is End-of-Life; no longer receiving security patches from Google (EOL: Oct 2023)',
      'Chrome 98 has 8 known CVEs including CVE-2022-0971 (CVSS 8.8) — renderer sandbox escape',
      'ADB over network enabled on port 5555 — allows unauthenticated shell access on local network',
      'No screen lock configured — device accessible without PIN/biometric',
      '2FA not enabled on Gmail account — at risk of account hijacking',
      'Sideloaded app "FreeMovies.apk" from unknown source detected with SIDELOAD_INSTALL flag',
    ],
  },
  {
    id: 'DEV-002',
    name: 'Maa\'s iPhone',
    deviceType: 'smartphone',
    os: 'iOS',
    osVersion: '17.6.1',
    patchStatus: 'UP_TO_DATE',
    twoFactorEnabled: true,
    browserName: 'Safari',
    browserVersion: '17.6',
    browserUpToDate: true,
    antivirusActive: false, // iOS doesn't support traditional AV
    antivirusName: 'N/A (iOS sandboxed)',
    lastSeen: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 mins ago
    riskScore: 18,
    riskLevel: 'LOW',
    openPorts: [
      { port: 62078, protocol: 'TCP', service: 'Apple iTunes WiFi Sync', note: 'iTunes WiFi sync — normal for Apple ecosystem' },
    ],
    vulnerabilities: [
      'iCloud Keychain reuse: 3 saved passwords flagged as reused across multiple sites',
      'Private Relay disabled — ISP can observe DNS queries',
    ],
  },
  {
    id: 'DEV-003',
    name: 'My Laptop (Work)',
    deviceType: 'laptop',
    os: 'Windows',
    osVersion: '11 23H2',
    patchStatus: 'OUTDATED',
    twoFactorEnabled: true,
    browserName: 'Chrome',
    browserVersion: '128.0.6613.114',
    browserUpToDate: true,
    antivirusActive: true,
    antivirusName: 'Windows Defender (real-time: ON)',
    lastSeen: new Date(Date.now() - 1000 * 30).toISOString(), // 30 secs ago
    riskScore: 42,
    riskLevel: 'MEDIUM',
    openPorts: [
      { port: 445, protocol: 'TCP', service: 'SMB (Samba)', note: 'SMB file sharing enabled — ensure Windows firewall blocks inbound from untrusted networks' },
      { port: 3389, protocol: 'TCP', service: 'RDP (Remote Desktop)', note: 'RDP exposed — disable if not required; BlueKeep and DejaBlue affect older Windows RDP stacks' },
      { port: 135, protocol: 'TCP', service: 'MSRPC Endpoint Mapper', note: 'Normal for Windows but can be leveraged by lateral movement tools' },
    ],
    vulnerabilities: [
      'KB5041160 (Aug 2024 Patch Tuesday) not installed — 3 critical CVEs pending including CVE-2024-38063 (TCP/IP IPv6 RCE, CVSS 9.8)',
      'RDP (port 3389) exposed on work network — disable Network Level Authentication bypass risk',
      'Microsoft Office 2019 not updated since March 2024 — CVE-2024-21413 (Moniker Link, CVSS 9.8) unpatched',
      'Chrome extension "PDF Converter Pro" has excessive permissions (read all website data, clipboard)',
    ],
  },
  {
    id: 'DEV-004',
    name: 'Bhai\'s Gaming Laptop',
    deviceType: 'laptop',
    os: 'Windows',
    osVersion: '10 22H2',
    patchStatus: 'CRITICAL',
    twoFactorEnabled: false,
    browserName: 'Firefox',
    browserVersion: '118.0',
    browserUpToDate: false,
    antivirusActive: false,
    antivirusName: 'Windows Defender (DISABLED)',
    lastSeen: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    riskScore: 96,
    riskLevel: 'CRITICAL',
    openPorts: [
      { port: 27036, protocol: 'TCP', service: 'Steam Remote Play', note: 'Steam remote play — acceptable if Steam Guard enabled' },
      { port: 25565, protocol: 'TCP', service: 'Minecraft Server', note: 'Minecraft server running — ensure it is password protected and not exposed to internet' },
      { port: 4444, protocol: 'TCP', service: 'Unknown / Metasploit default', note: 'WARNING: Port 4444 is Metasploit default listener — possible malware beacon or RAT' },
      { port: 7777, protocol: 'TCP', service: 'Unknown Service', note: 'Unidentified service — requires investigation' },
    ],
    vulnerabilities: [
      'Windows Defender disabled — device has no active malware protection',
      'Windows 10 22H2 EOL November 2025 — begin upgrade planning now',
      'Firefox 118.0 missing 15+ months of security patches — multiple CVSS 9+ CVEs',
      'Port 4444 open — associated with Metasploit reverse shell and common RAT payloads',
      'Cracked software detected: "Adobe_CC_2024_crack.exe" in Downloads folder',
      'No 2FA on Steam account — gaming accounts are high-value phishing targets',
      'BitTorrent client with UPnP enabled — allowing inbound connections from internet',
      'Last Windows Update: 147 days ago — 89 security patches missing',
    ],
  },
  {
    id: 'DEV-005',
    name: 'Didi\'s iPad',
    deviceType: 'tablet',
    os: 'iPadOS',
    osVersion: '16.7.8',
    patchStatus: 'OUTDATED',
    twoFactorEnabled: true,
    browserName: 'Safari',
    browserVersion: '16.7.8',
    browserUpToDate: false,
    antivirusActive: false,
    antivirusName: 'N/A (iOS sandboxed)',
    lastSeen: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hrs ago
    riskScore: 35,
    riskLevel: 'MEDIUM',
    openPorts: [
      { port: 62078, protocol: 'TCP', service: 'Apple iTunes WiFi Sync', note: 'Normal Apple service' },
    ],
    vulnerabilities: [
      'iPadOS 16.7.8 is the latest patch for iPadOS 16 branch — iPad is ineligible for iPadOS 17 (requires iPad 6th gen or later A12 chip)',
      'Three apps have not been updated in >180 days — check for apps with known CVEs',
      'iCloud backup last successful: 32 days ago — data loss risk if device lost or damaged',
      'Screen Time passcode not set — children or unauthorized users can bypass parental controls',
    ],
  },
  {
    id: 'DEV-006',
    name: 'Home Wi-Fi Router (TP-Link)',
    deviceType: 'router',
    os: 'TP-Link TL-WR940N Firmware',
    osVersion: '3.16.9 Build 150504',
    patchStatus: 'CRITICAL',
    twoFactorEnabled: false,
    antivirusActive: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 1).toISOString(), // 1 min ago
    riskScore: 92,
    riskLevel: 'CRITICAL',
    openPorts: [
      { port: 80, protocol: 'TCP', service: 'HTTP Admin Panel', note: 'Admin panel exposed on HTTP (unencrypted) — credentials sent in cleartext' },
      { port: 8080, protocol: 'TCP', service: 'HTTP Admin (alternate)', note: 'Secondary HTTP admin port — disable if unused' },
      { port: 23, protocol: 'TCP', service: 'Telnet', note: 'CRITICAL: Telnet enabled — unencrypted remote admin with known backdoor credentials' },
      { port: 1900, protocol: 'UDP', service: 'SSDP / UPnP', note: 'UPnP enabled — attackers can add port forwarding rules without authentication' },
    ],
    vulnerabilities: [
      'Firmware 2015 build — over 9 years out of date; hundreds of CVEs including CVE-2023-1389 (CVSS 9.8 unauthenticated RCE)',
      'Telnet service enabled on port 23 — known default credentials (admin/admin) and multiple backdoors in this firmware version',
      'Admin panel using default credentials (admin/admin) — change immediately',
      'WPS (Wi-Fi Protected Setup) enabled — vulnerable to Pixie Dust attack (offline PIN brute-force in seconds)',
      'DNS set to ISP default — consider switching to Cloudflare (1.1.1.1) or Google (8.8.8.8) for malware filtering',
      'UPnP enabled — Mirai botnet and similar IoT malware exploit UPnP to open firewall rules',
      'No HTTPS for admin panel — credentials transmitted in cleartext on LAN',
      'Remote management enabled on WAN interface — admin panel accessible from internet',
    ],
  },
]
