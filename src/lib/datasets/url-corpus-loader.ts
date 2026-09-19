// =============================================================================
// CyberShield Bharat -- URL Corpus Loader
// Loads and analyzes URL risk data for the phishing ML classifier
//
// DATA INGESTION CONTRACT:
// -----------------------------------------------------------------------
// PhishTank (https://www.phishtank.com/developer_info.php):
//   - Download verified_online.csv daily
//   - Fields: phish_id, url, phish_detail_url, submission_time,
//             verified, verification_time, online, target
//   - Label: isMalicious = true, source = 'phishtank'
//
// URLhaus (https://urlhaus.abuse.ch/api/):
//   - GET https://urlhaus-api.abuse.ch/v1/urls/recent/limit/1000/
//   - Fields: id, dateadded, url, url_status, threat, tags, urlhaus_link
//   - Label: isMalicious = true, source = 'urlhaus'
//
// Tranco (https://tranco-list.eu/):
//   - Download tranco_<ID>.csv.zip weekly
//   - Fields: rank, domain
//   - Label: isMalicious = false, source = 'tranco'
//   - Use top 100K as benign baseline
//
// Processing pipeline:
//   ingest(rawUrl) -> normalizeUrl() -> extractUrlFeatures() -> UrlRiskEntry
// =============================================================================

import { extractUrlFeatures, shannonEntropy, homoglyphScore } from '@/lib/crypto-utils'

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

/**
 * Full feature vector for a URL used by the phishing classifier.
 * 32 lexical, structural, and reputation features.
 */
export interface UrlRiskEntry {
  // --- Identity ---
  url: string
  label: 0 | 1                      // 0 = benign, 1 = phishing/malicious
  source: 'phishtank' | 'urlhaus' | 'tranco' | 'manual' | 'demo'

  // --- Lexical features ---
  length: number                    // Total URL character length
  entropy: number                   // Shannon entropy of full URL
  dotCount: number                  // Number of '.' in URL
  hyphenCount: number               // Number of '-' in URL
  underscoreCount: number           // Number of '_' in URL
  digitCount: number                // Number of digit chars
  specialCharCount: number          // @, ?, =, &, %, #, !, $ count
  atSignCount: number               // '@' count (credential embedding indicator)
  doubleSlashCount: number          // '//' count beyond initial scheme

  // --- Structural / Domain features ---
  tld: string                       // Top-level domain (e.g. 'com', 'tk')
  tldRiskScore: number              // 0.0 = safe, 0.5 = medium, 1.0 = high
  domainLength: number              // Character length of registered domain
  domainEntropy: number             // Shannon entropy of domain label only
  subdomainDepth: number            // Number of subdomain labels
  pathDepth: number                 // Number of path segments
  queryParamCount: number           // Number of query string parameters
  hasFragment: boolean              // URL contains # fragment
  isIp: boolean                     // Host is raw IP address
  hasPort: boolean                  // Non-standard port in URL
  pathLength: number                // Character length of URL path

  // --- Keyword features ---
  hasBrandKeyword: boolean          // Contains known brand name (bank, paypal, sbi, etc.)
  hasSecurityKeyword: boolean       // Contains 'secure', 'login', 'verify', 'update'
  hasFinanceKeyword: boolean        // Contains 'payment', 'upi', 'kyc', 'refund', 'card'
  hasSuspiciousPattern: boolean     // Contains IP-in-path, hex encoding, etc.

  // --- Script / Encoding features ---
  homoglyphScore: number            // Homoglyph/homograph attack score (0-1)
  hasXnDashPrefix: boolean          // Punycode domain (xn--)

  // --- Reputation (populated after lookup) ---
  virusTotalPositives?: number      // VT engine detections (0 = clean)
  safeBrowsingCategory?: string     // Google Safe Browsing threat type or 'SAFE'
  isDomainNewlyRegistered?: boolean // Domain registered < 30 days ago
  whoisCountry?: string            // Registrant country code
}

// ---------------------------------------------------------------------------
// Brand and keyword lists
// ---------------------------------------------------------------------------

const BRAND_KEYWORDS = [
  'sbi', 'icici', 'hdfc', 'axis', 'kotak', 'npci', 'upi', 'paytm',
  'phonepe', 'gpay', 'amazon', 'flipkart', 'paypal', 'apple', 'microsoft',
  'google', 'facebook', 'instagram', 'whatsapp', 'netflix', 'irctc',
  'aadhaar', 'uidai', 'digilocker', 'incometax', 'epf', 'esic',
]

const SECURITY_KEYWORDS = [
  'secure', 'login', 'verify', 'verification', 'update', 'confirm',
  'account', 'password', 'signin', 'auth', 'authenticate', 'unlock',
  'suspended', 'alert', 'warning', 'kyc',
]

const FINANCE_KEYWORDS = [
  'payment', 'upi', 'kyc', 'refund', 'card', 'bank', 'netbanking',
  'wallet', 'recharge', 'transaction', 'transfer', 'credit', 'debit',
  'invoice', 'billing',
]

// ---------------------------------------------------------------------------
// Feature extraction helper
// ---------------------------------------------------------------------------

function extractExtendedFeatures(rawUrl: string): Omit<UrlRiskEntry, 'label' | 'source' | 'virusTotalPositives' | 'safeBrowsingCategory' | 'isDomainNewlyRegistered' | 'whoisCountry'> {
  const lowerUrl = rawUrl.toLowerCase()
  const base = extractUrlFeatures(rawUrl)

  let parsed: URL | null = null
  try {
    const normalized = /^https?:\/\//i.test(rawUrl) ? rawUrl : `http://${rawUrl}`
    parsed = new URL(normalized)
  } catch {
    parsed = null
  }

  const hostname = parsed?.hostname ?? ''
  const pathname = parsed?.pathname ?? ''
  const search = parsed?.search ?? ''
  const hash = parsed?.hash ?? ''

  // Domain-only entropy
  const domainParts = hostname.replace(/^www\./, '').split('.')
  const registrableDomain = domainParts.slice(-2).join('.')
  const domainLabel = domainParts[0] ?? ''

  // Query param count
  const queryParamCount = search ? (search.slice(1).split('&').filter(Boolean).length) : 0

  // Counts
  const underscoreCount = (rawUrl.match(/_/g) ?? []).length
  const atSignCount = (rawUrl.match(/@/g) ?? []).length
  const doubleSlashCount = Math.max(0, (rawUrl.match(/\/\//g) ?? []).length - 1) // exclude scheme

  // Keyword checks
  const hasBrandKeyword = BRAND_KEYWORDS.some((kw) => lowerUrl.includes(kw))
  const hasSecurityKeyword = SECURITY_KEYWORDS.some((kw) => lowerUrl.includes(kw))
  const hasFinanceKeyword = FINANCE_KEYWORDS.some((kw) => lowerUrl.includes(kw))
  const hasSuspiciousPattern =
    /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(pathname) || // IP in path
    /%[0-9a-f]{2}/i.test(rawUrl) ||                         // percent-encoded chars in domain
    rawUrl.includes('//') && !rawUrl.startsWith('http')      // double slash trick

  const hasXnDashPrefix = hostname.includes('xn--')
  const tldParts = hostname.split('.')
  const tld = tldParts[tldParts.length - 1] ?? ''

  return {
    url: rawUrl,
    length: rawUrl.length,
    entropy: base.entropy,
    dotCount: base.dotCount,
    hyphenCount: base.hyphenCount,
    underscoreCount,
    digitCount: base.digitCount,
    specialCharCount: base.specialCharCount,
    atSignCount,
    doubleSlashCount,
    tld,
    tldRiskScore: base.tldRiskScore,
    domainLength: registrableDomain.length,
    domainEntropy: shannonEntropy(domainLabel),
    subdomainDepth: base.subdomainDepth,
    pathDepth: base.pathDepth,
    queryParamCount,
    hasFragment: hash.length > 0,
    isIp: base.isIp,
    hasPort: base.hasPort,
    pathLength: pathname.length,
    hasBrandKeyword,
    hasSecurityKeyword,
    hasFinanceKeyword,
    hasSuspiciousPattern,
    homoglyphScore: base.homoglyphScore,
    hasXnDashPrefix,
  }
}

// ---------------------------------------------------------------------------
// analyzeUrl: client-side feature extraction
// ---------------------------------------------------------------------------

/**
 * Analyzes a URL and returns a complete UrlRiskEntry with computed features.
 * Reputation fields (VirusTotal, SafeBrowsing) are not populated here —
 * those are filled in by the server-side API route after external lookups.
 */
export function analyzeUrl(url: string): UrlRiskEntry {
  const features = extractExtendedFeatures(url)
  return {
    ...features,
    label: 0, // Default; overridden by classifier prediction
    source: 'manual',
  }
}

// ---------------------------------------------------------------------------
// Mock corpus for demo mode
// ---------------------------------------------------------------------------

/**
 * Returns a small demo URL corpus for testing when full dataset is unavailable.
 * Production corpus ingested via PhishTank/URLhaus/Tranco pipeline.
 */
export function loadUrlCorpus(): UrlRiskEntry[] {
  const entries: Array<{ url: string; label: 0 | 1; source: UrlRiskEntry['source'] }> = [
    // Benign (Tranco top sites)
    { url: 'https://www.google.com', label: 0, source: 'tranco' },
    { url: 'https://www.sbi.co.in/web/personal-banking', label: 0, source: 'tranco' },
    { url: 'https://www.irctc.co.in/nget/train-search', label: 0, source: 'tranco' },
    { url: 'https://incometax.gov.in/iec/foportal', label: 0, source: 'tranco' },
    { url: 'https://uidai.gov.in/my-aadhaar/about-your-aadhaar.html', label: 0, source: 'tranco' },
    // Malicious (PhishTank samples)
    { url: 'http://sbi-kyc-update-portal.tk/verify?token=USR_78234_KYC_2024&redirect=collect', label: 1, source: 'phishtank' },
    { url: 'https://it-refund-verify.xyz/claim?pan=XXXXX1234X&amount=18742', label: 1, source: 'phishtank' },
    { url: 'https://irctc-payment-verify.store/repay?pnr=4812759623', label: 1, source: 'phishtank' },
    { url: 'https://aadhaar-secure-unlock.top/verify?aid=XXXX_7823', label: 1, source: 'urlhaus' },
    { url: 'https://upi-fraud-protection.online/approve?txn=UPI2024091412500X78234', label: 1, source: 'urlhaus' },
  ]

  return entries.map(({ url, label, source }) => ({
    ...extractExtendedFeatures(url),
    label,
    source,
  }))
}
