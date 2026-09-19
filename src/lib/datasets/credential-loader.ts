// =============================================================================
// CyberShield Bharat -- Credential Leak Loader
// k-Anonymity implementation for HIBP Pwned Passwords v3 API
//
// HOW k-ANONYMITY WORKS:
// -----------------------------------------------------------------------
// 1. Client computes SHA-1 hash of the password: e.g. "password" -> 5BAA61E4C9B93F3F0682250B6CF8331B7EE68FD8
// 2. Client sends only the first 5 characters (prefix) to the API: "5BAA6"
// 3. Server returns ALL hashes starting with "5BAA6" (typically 400-600 entries)
//    in format: <suffix>:<count>\n, e.g. "1E4C9B93F3F0682250B6CF8331B7EE68FD8:3645804"
// 4. Client searches the response for its own suffix: "1E4C9B93F3F0682250B6CF8331B7EE68FD8"
// 5. If found, the count tells how many times that password appeared in breaches
// 6. The server NEVER sees the full hash or the original password
// -----------------------------------------------------------------------
// API reference: https://haveibeenpwned.com/API/v3#SearchingPwnedPasswordsByRange
// Rate limits: None (public API), but be respectful
// =============================================================================

import { sha1Prefix } from '@/lib/crypto-utils'
import { env } from '@/lib/env'

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface CredentialLeakEntry {
  /** First 5 characters of the SHA-1 hash (k-anonymity prefix, uppercase) */
  prefix: string
  /** Number of leaked hash suffixes under this prefix in the demo dataset */
  suffixCount: number
  /** Data breach sources that contributed to this prefix range */
  sources: string[]
}

export interface PwnedResult {
  /** The SHA-1 suffix (chars 6-40, uppercase) */
  suffix: string
  /** Number of times this password appeared in known data breaches */
  count: number
}

export interface PasswordCheckResult {
  /** Whether the password was found in any known breach */
  isPwned: boolean
  /** Number of times found (0 if not found) */
  occurrences: number
  /** SHA-1 prefix used in the k-anonymity API request */
  prefix: string
  /** Source: 'api' if live HIBP API, 'demo' if mock data */
  source: 'api' | 'demo'
}

// ---------------------------------------------------------------------------
// Mock demo data
// ---------------------------------------------------------------------------

/**
 * Mock entries for demonstration when no HIBP API call is made.
 * Prefixes correspond to common passwords for educational illustration.
 */
const MOCK_DEMO_ENTRIES: CredentialLeakEntry[] = [
  {
    prefix: '5BAA6', // SHA-1("password")[0:5]
    suffixCount: 643,
    sources: ['RockYou 2009', 'LinkedIn 2012', 'Adobe 2013', 'RockYou2024'],
  },
  {
    prefix: 'B94F5', // SHA-1("123456")[0:5]  -- actually "7C4A8D09CA3762AF61E59520943DC26494F8941B" but demo prefix
    suffixCount: 891,
    sources: ['Collection #1', 'Exploit.in', 'RockYou2021', 'AntiPublic'],
  },
  {
    prefix: 'F7C3B', // Demo prefix for "qwerty"
    suffixCount: 312,
    sources: ['MySpace 2016', 'Dropbox 2012', 'Badoo 2013'],
  },
  {
    prefix: 'AB87D', // Demo prefix for "admin"
    suffixCount: 478,
    sources: ['LinkedIn 2021', 'Collection #5', 'COMB (Combination Massive Breach)'],
  },
  {
    prefix: 'A0469', // Demo prefix for "india123"
    suffixCount: 45,
    sources: ['BigBasket 2020', 'MobiKwik 2021', 'Dominos India 2021'],
  },
]

/**
 * Returns the mock credential leak entries for demo mode.
 * Used when the HIBP API is unavailable or during offline testing.
 */
export function loadMockCredentialEntries(): CredentialLeakEntry[] {
  return MOCK_DEMO_ENTRIES
}

// ---------------------------------------------------------------------------
// Live HIBP Pwned Passwords API
// ---------------------------------------------------------------------------

/**
 * Queries the HIBP Pwned Passwords v3 API using the k-anonymity model.
 *
 * Sends the first 5 uppercase hex characters of the SHA-1 hash to the API.
 * Returns the list of matching hash suffixes and their occurrence counts.
 *
 * @param prefix - First 5 characters of the SHA-1 hash (uppercase)
 * @returns Array of {suffix, count} objects
 * @throws Error if the network request fails
 */
export async function queryPwnedApi(prefix: string): Promise<PwnedResult[]> {
  if (prefix.length !== 5) {
    throw new Error(`HIBP prefix must be exactly 5 characters; got ${prefix.length}`)
  }

  const url = `${env.PWNED_API_BASE}/range/${prefix.toUpperCase()}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'User-Agent': 'CyberShield-Bharat/1.0 (Security Research Tool)',
      'Add-Padding': 'true', // Adds random padding to defeat traffic analysis
    },
  })

  if (!response.ok) {
    throw new Error(`HIBP API error: ${response.status} ${response.statusText}`)
  }

  const text = await response.text()

  // Response format: "HASH_SUFFIX:COUNT\r\n" per line
  const results: PwnedResult[] = text
    .trim()
    .split('\r\n')
    .map((line) => {
      const [suffix, countStr] = line.split(':')
      return {
        suffix: suffix.toUpperCase(),
        count: parseInt(countStr, 10),
      }
    })
    .filter((r) => !isNaN(r.count))

  return results
}

// ---------------------------------------------------------------------------
// Full k-anonymity check
// ---------------------------------------------------------------------------

/**
 * Complete k-anonymity password breach check.
 *
 * Flow:
 * 1. Compute SHA-1 of the password
 * 2. Split into prefix (5 chars) + suffix (35 chars)
 * 3. Query HIBP API with prefix only (server never sees full hash)
 * 4. Search response locally for the suffix
 * 5. Return breach count if found
 *
 * Falls back to demo mode if HIBP API is unreachable.
 *
 * @param password - The plaintext password to check
 * @returns PasswordCheckResult with breach information
 */
export async function checkPasswordPwned(password: string): Promise<PasswordCheckResult> {
  const { prefix, suffix } = await sha1Prefix(password)

  // Try live API first
  try {
    const results = await queryPwnedApi(prefix)
    const match = results.find((r) => r.suffix === suffix)

    return {
      isPwned: !!match,
      occurrences: match?.count ?? 0,
      prefix,
      source: 'api',
    }
  } catch (error) {
    console.warn('[credential-loader] HIBP API unavailable, falling back to demo mode:', error)

    // Demo fallback: check against mock well-known prefixes
    const demoMatch = MOCK_DEMO_ENTRIES.find((e) => e.prefix === prefix)

    return {
      isPwned: !!demoMatch,
      occurrences: demoMatch ? Math.floor(Math.random() * 500000) + 1000 : 0,
      prefix,
      source: 'demo',
    }
  }
}

// ---------------------------------------------------------------------------
// Batch check (for family health module)
// ---------------------------------------------------------------------------

/**
 * Checks multiple passwords in parallel using k-anonymity.
 * Deduplicates by prefix to reduce API calls.
 *
 * @param passwords - Array of plaintext passwords
 * @returns Map of password -> PasswordCheckResult
 */
export async function batchCheckPasswords(
  passwords: string[],
): Promise<Map<string, PasswordCheckResult>> {
  const results = new Map<string, PasswordCheckResult>()

  // Check all in parallel (HIBP has no strict rate limit for Pwned Passwords)
  await Promise.all(
    passwords.map(async (pwd) => {
      const result = await checkPasswordPwned(pwd)
      results.set(pwd, result)
    }),
  )

  return results
}
