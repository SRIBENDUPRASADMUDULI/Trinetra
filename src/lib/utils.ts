import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ---------------------------------------------------------------------------
// Tailwind class merging
// ---------------------------------------------------------------------------

/** Merges Tailwind CSS classes safely, resolving conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// ---------------------------------------------------------------------------
// Byte formatter
// ---------------------------------------------------------------------------

/**
 * Converts a raw byte count to a human-readable string.
 * e.g. 1536 -> "1.50 KB", 2097152 -> "2.00 MB"
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

// ---------------------------------------------------------------------------
// Hash truncation
// ---------------------------------------------------------------------------

/**
 * Truncates a hash/long hex string to show first+last N chars with ellipsis.
 * e.g. truncateHash("aabbccdd11223344", 4) -> "aabb...3344"
 */
export function truncateHash(hash: string, chars = 8): string {
  if (hash.length <= chars * 2 + 3) return hash
  return `${hash.slice(0, chars)}...${hash.slice(-chars)}`
}

// ---------------------------------------------------------------------------
// Relative time
// ---------------------------------------------------------------------------

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const MONTH = 30 * DAY
const YEAR = 365 * DAY

/**
 * Returns a human-readable relative time string.
 * e.g. getRelativeTime(new Date(Date.now() - 90000)) -> "1 min ago"
 */
export function getRelativeTime(date: Date): string {
  const now = Date.now()
  const diff = now - date.getTime()

  if (diff < 0) {
    const absDiff = Math.abs(diff)
    if (absDiff < MINUTE) return `in ${Math.floor(absDiff / SECOND)}s`
    if (absDiff < HOUR) return `in ${Math.floor(absDiff / MINUTE)} min`
    return `in ${Math.floor(absDiff / HOUR)} hr`
  }

  if (diff < SECOND * 10) return 'just now'
  if (diff < MINUTE) return `${Math.floor(diff / SECOND)}s ago`
  if (diff < MINUTE * 2) return '1 min ago'
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} mins ago`
  if (diff < HOUR * 2) return '1 hr ago'
  if (diff < DAY) return `${Math.floor(diff / HOUR)} hrs ago`
  if (diff < DAY * 2) return 'yesterday'
  if (diff < WEEK) return `${Math.floor(diff / DAY)} days ago`
  if (diff < MONTH) return `${Math.floor(diff / WEEK)} wks ago`
  if (diff < YEAR) return `${Math.floor(diff / MONTH)} mo ago`
  return `${Math.floor(diff / YEAR)} yr ago`
}

// ---------------------------------------------------------------------------
// Session ID generator
// ---------------------------------------------------------------------------

/**
 * Generates a cryptographically random hex session ID.
 * Uses crypto.getRandomValues for browser/edge, crypto.randomBytes for Node.
 * Length defaults to 32 hex chars (128-bit entropy).
 */
export function generateSessionId(bytes = 16): string {
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
    const arr = new Uint8Array(bytes)
    globalThis.crypto.getRandomValues(arr)
    return Array.from(arr)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
  // Node.js fallback (server-side)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { randomBytes } = require('crypto') as typeof import('crypto')
  return randomBytes(bytes).toString('hex')
}

// ---------------------------------------------------------------------------
// Severity colour helpers
// ---------------------------------------------------------------------------

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO'

/** Returns Tailwind text-color class for a severity level. */
export function severityColor(severity: Severity): string {
  switch (severity) {
    case 'CRITICAL': return 'text-red-500'
    case 'HIGH': return 'text-orange-500'
    case 'MEDIUM': return 'text-amber-400'
    case 'LOW': return 'text-yellow-300'
    case 'INFO': return 'text-cyan-400'
  }
}

/** Returns Tailwind border-color class for a severity level. */
export function severityBorder(severity: Severity): string {
  switch (severity) {
    case 'CRITICAL': return 'border-red-600'
    case 'HIGH': return 'border-orange-500'
    case 'MEDIUM': return 'border-amber-500'
    case 'LOW': return 'border-yellow-400'
    case 'INFO': return 'border-cyan-500'
  }
}

// ---------------------------------------------------------------------------
// CVSS badge helper
// ---------------------------------------------------------------------------

/** Converts a CVSS score to a categorical severity label. */
export function cvssToSeverity(score: number): Severity {
  if (score >= 9.0) return 'CRITICAL'
  if (score >= 7.0) return 'HIGH'
  if (score >= 4.0) return 'MEDIUM'
  if (score >= 0.1) return 'LOW'
  return 'INFO'
}

// ---------------------------------------------------------------------------
// IP address helpers
// ---------------------------------------------------------------------------

/** Returns true if the string is a valid IPv4 address. */
export function isValidIPv4(ip: string): boolean {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) &&
    ip.split('.').every((octet) => parseInt(octet, 10) <= 255)
}

/** Returns true if the string is a valid IPv6 address (simple check). */
export function isValidIPv6(ip: string): boolean {
  return /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(ip) ||
    /^::([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/.test(ip) ||
    ip === '::'
}

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------

/** Clamps a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Pads a number to a given length with leading zeros. */
export function zeroPad(n: number, length = 2): string {
  return String(n).padStart(length, '0')
}

/** Formats an ISO timestamp to a SOC-style display string. */
export function formatTimestamp(isoString: string): string {
  const d = new Date(isoString)
  return (
    `${d.getUTCFullYear()}-${zeroPad(d.getUTCMonth() + 1)}-${zeroPad(d.getUTCDate())}` +
    `T${zeroPad(d.getUTCHours())}:${zeroPad(d.getUTCMinutes())}:${zeroPad(d.getUTCSeconds())}Z`
  )
}
