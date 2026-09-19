// =============================================================================
// CyberShield Bharat -- Crypto Utilities
// Uses the Web Crypto API (works in browser, Next.js Edge, and Node 18+)
// =============================================================================

// ---------------------------------------------------------------------------
// Internal: digest helper
// ---------------------------------------------------------------------------

async function digest(algorithm: 'SHA-1' | 'SHA-256' | 'SHA-512', text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest(algorithm, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

// ---------------------------------------------------------------------------
// SHA-1
// ---------------------------------------------------------------------------

/**
 * Computes SHA-1 of a UTF-8 string and returns the lowercase hex digest.
 * Used for HIBP Pwned Passwords k-anonymity.
 */
export async function sha1(text: string): Promise<string> {
  return digest('SHA-1', text)
}

/**
 * Returns the SHA-1 k-anonymity prefix (first 5 chars) and suffix (remainder).
 * The prefix is sent to the API; the suffix is matched locally.
 */
export async function sha1Prefix(
  text: string,
): Promise<{ prefix: string; suffix: string; hash: string }> {
  const full = (await sha1(text)).toUpperCase()
  return {
    prefix: full.slice(0, 5),
    suffix: full.slice(5),
    hash: full,
  }
}

// ---------------------------------------------------------------------------
// SHA-256
// ---------------------------------------------------------------------------

/**
 * Computes SHA-256 of a UTF-8 string and returns the lowercase hex digest.
 * Used for file integrity, VirusTotal lookups, and evidence hashing.
 */
export async function sha256(text: string): Promise<string> {
  return digest('SHA-256', text)
}

// ---------------------------------------------------------------------------
// Shannon Entropy
// ---------------------------------------------------------------------------

/**
 * Calculates the Shannon entropy of a string in bits per character.
 * High entropy (>3.5) in a domain name or URL path is a strong phishing indicator.
 *
 * Range: 0 (all chars identical) to log2(N) where N is alphabet size.
 */
export function shannonEntropy(str: string): number {
  if (!str || str.length === 0) return 0
  const freq: Record<string, number> = {}
  for (const char of str) {
    freq[char] = (freq[char] ?? 0) + 1
  }
  const len = str.length
  let entropy = 0
  for (const count of Object.values(freq)) {
    const p = count / len
    entropy -= p * Math.log2(p)
  }
  return Math.round(entropy * 10000) / 10000
}

// ---------------------------------------------------------------------------
// Homoglyph / Homograph Attack Detection
// ---------------------------------------------------------------------------

/**
 * Unicode ranges for scripts that can be used in homograph attacks:
 * Characters that look visually similar to ASCII Latin chars.
 */
const CYRILLIC_RANGE = /[\u0400-\u04FF]/
const GREEK_RANGE = /[\u0370-\u03FF]/
const ARMENIAN_RANGE = /[\u0530-\u058F]/
const GEORGIAN_RANGE = /[\u10A0-\u10FF]/
const LATIN_RANGE = /[a-zA-Z]/

/**
 * Common homoglyph pairs: (confusable char --> latin equivalent)
 * Cyrillic: a->a, e->e, o->o, p->p, c->c, x->x, y->y, B->B, H->H, K->K, M->M, T->T
 */
const KNOWN_HOMOGLYPHS = new Set([
  '\u0430', // a (Cyrillic a)
  '\u0435', // e (Cyrillic e)
  '\u043E', // o (Cyrillic o)
  '\u0440', // p (Cyrillic r)
  '\u0441', // c (Cyrillic c)
  '\u0445', // x (Cyrillic x)
  '\u0443', // y (Cyrillic y)
  '\u0412', // B (Cyrillic V)
  '\u041D', // H (Cyrillic H)
  '\u041A', // K (Cyrillic K)
  '\u041C', // M (Cyrillic M)
  '\u0422', // T (Cyrillic T)
  '\u03BF', // o (Greek omicron)
  '\u03B1', // a (Greek alpha)
  '\u03B5', // e (Greek epsilon)
  '\u03C1', // p (Greek rho)
])

/**
 * Scores a URL for homograph/homoglyph attack indicators (0.0 = clean, 1.0 = very suspicious).
 *
 * Checks:
 * - Mix of Latin + Cyrillic/Greek/Armenian/Georgian characters
 * - Presence of known visually-confusable Unicode codepoints
 * - Punycode xn-- prefix (IDN encoding of non-ASCII domain)
 */
export function homoglyphScore(url: string): number {
  let score = 0

  // Punycode detection
  if (url.includes('xn--')) {
    score += 0.4
  }

  const hasLatin = LATIN_RANGE.test(url)
  const hasCyrillic = CYRILLIC_RANGE.test(url)
  const hasGreek = GREEK_RANGE.test(url)
  const hasArmenian = ARMENIAN_RANGE.test(url)
  const hasGeorgian = GEORGIAN_RANGE.test(url)

  // Mixed script detection
  if (hasLatin && hasCyrillic) score += 0.4
  if (hasLatin && hasGreek) score += 0.3
  if (hasLatin && hasArmenian) score += 0.35
  if (hasLatin && hasGeorgian) score += 0.35

  // Known confusable character detection
  let confusableCount = 0
  for (const char of url) {
    if (KNOWN_HOMOGLYPHS.has(char)) confusableCount++
  }
  if (confusableCount > 0) {
    score += Math.min(0.4, confusableCount * 0.1)
  }

  return Math.min(1.0, Math.round(score * 100) / 100)
}

// ---------------------------------------------------------------------------
// TLD Risk Scoring
// ---------------------------------------------------------------------------

/**
 * High-risk TLDs frequently abused for phishing and malware distribution.
 * Based on Spamhaus Top-TLD abuse list and APWG eCrime reports.
 */
const HIGH_RISK_TLDS = new Set([
  'tk', 'ml', 'ga', 'cf', 'gq',   // Free Freenom TLDs heavily abused
  'xyz', 'top', 'club', 'online', 'site', 'store', 'live',
  'click', 'download', 'stream', 'loan', 'date', 'faith',
  'win', 'party', 'review', 'trade', 'science', 'work',
  'link', 'bid', 'racing', 'accountant',
])

const MEDIUM_RISK_TLDS = new Set([
  'info', 'biz', 'pw', 'cc', 'su', 'ws', 'me', 'to', 'name',
])

function getTld(hostname: string): string {
  const parts = hostname.split('.')
  return parts[parts.length - 1].toLowerCase()
}

function getTldRiskScore(tld: string): number {
  if (HIGH_RISK_TLDS.has(tld)) return 100
  if (MEDIUM_RISK_TLDS.has(tld)) return 50
  return 0
}

// ---------------------------------------------------------------------------
// URL Feature Extraction
// ---------------------------------------------------------------------------

export interface UrlFeatures {
  entropy: number
  length: number
  dotCount: number
  hyphenCount: number
  digitCount: number
  specialCharCount: number
  tldRiskScore: number
  homoglyphScore: number
  isIp: boolean
  hasPort: boolean
  pathDepth: number
  subdomainDepth: number
  hasAtSign: boolean
  riskScore: number
  rawUrl: string
}

function computeRiskScore(f: Omit<UrlFeatures, 'riskScore' | 'rawUrl'>, url: string, hostname: string): number {
  let score = 0
  const lower = url.toLowerCase()
  const hostLower = hostname.toLowerCase()

  // Verified Sovereign / Official Domains
  const isOfficial =
    hostLower.endsWith('.gov.in') ||
    hostLower.endsWith('.nic.in') ||
    hostLower.endsWith('.sbi') ||
    hostLower === 'onlinesbi.sbi' ||
    hostLower.endsWith('.onlinesbi.sbi')

  if (isOfficial && !f.isIp && f.homoglyphScore === 0) {
    return 4 // Highly trusted sovereign root
  }

  // 1. Phishing & Brand Impersonation Keywords
  const brandKeywords = [
    'sbi', 'kyc', 'bank', 'paytm', 'hdfc', 'icici', 'axis', 'pnb',
    'aadhaar', 'incometax', 'refund', 'otp', 'verify', 'update-portal', 'login', 'secure', 'netbanking'
  ]
  const matchedKeywords = brandKeywords.filter(kw => hostLower.includes(kw) || lower.includes(kw))
  if (matchedKeywords.length > 0) {
    score += Math.min(50, matchedKeywords.length * 20)
  }

  // 2. High-Risk TLD (e.g. .xyz, .site, .top)
  if (f.tldRiskScore >= 90) score += 35
  else if (f.tldRiskScore >= 50) score += 20

  // 3. Shannon Entropy
  if (f.entropy > 4.5) score += 20
  else if (f.entropy > 3.5) score += 10

  // 4. Raw IP Address Host & Port
  if (f.isIp) score += 35
  if (f.hasPort) score += 15
  if (f.hasAtSign) score += 20

  // 5. Homoglyph / Confusable detection
  if (f.homoglyphScore > 0.3) score += 30
  else if (f.homoglyphScore > 0) score += 15

  // 6. Structural flags
  if (f.hyphenCount >= 2) score += 10
  if (f.subdomainDepth > 2) score += 10
  if (f.length > 80) score += 10

  return Math.min(100, Math.max(0, score))
}

export function extractUrlFeatures(url: string): UrlFeatures {
  let parsed: URL | null = null
  let hostname = ''
  let pathname = ''

  const hasAtSign = url.includes('@')

  try {
    // Prepend scheme if missing so URL constructor works
    const normalized = /^https?:\/\//i.test(url) ? url : `http://${url}`
    parsed = new URL(normalized)
    hostname = parsed.hostname
    pathname = parsed.pathname
  } catch {
    const partialFeatures = {
      entropy: shannonEntropy(url),
      length: url.length,
      dotCount: (url.match(/\./g) ?? []).length,
      hyphenCount: (url.match(/-/g) ?? []).length,
      digitCount: (url.match(/\d/g) ?? []).length,
      specialCharCount: (url.match(/[@?=&%#!$]/g) ?? []).length,
      tldRiskScore: 100,
      homoglyphScore: homoglyphScore(url),
      isIp: false,
      hasPort: false,
      pathDepth: 0,
      subdomainDepth: 0,
      hasAtSign,
    }
    return { ...partialFeatures, riskScore: computeRiskScore(partialFeatures, url, url), rawUrl: url }
  }

  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)
  const hasPort = !!parsed?.port && parsed.port !== '80' && parsed.port !== '443'

  // Path depth: count non-empty segments
  const pathSegments = pathname.split('/').filter((s) => s.length > 0)
  const pathDepth = pathSegments.length

  // Subdomain depth: parts beyond the registrable domain (last 2 labels)
  const hostParts = hostname.replace(/^www\./, '').split('.')
  const subdomainDepth = Math.max(0, hostParts.length - 2)

  const tld = getTld(hostname)

  const features = {
    entropy: shannonEntropy(url),
    length: url.length,
    dotCount: (url.match(/\./g) ?? []).length,
    hyphenCount: (url.match(/-/g) ?? []).length,
    digitCount: (url.match(/\d/g) ?? []).length,
    specialCharCount: (url.match(/[@?=&%#!$]/g) ?? []).length,
    tldRiskScore: getTldRiskScore(tld),
    homoglyphScore: homoglyphScore(url),
    isIp,
    hasPort,
    pathDepth,
    subdomainDepth,
    hasAtSign,
  }

  return { ...features, riskScore: computeRiskScore(features, url, hostname), rawUrl: url }
}
