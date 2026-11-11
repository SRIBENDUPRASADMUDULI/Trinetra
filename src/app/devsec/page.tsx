'use client'
import React, { useState } from 'react'
import { TerminalCard } from '@/components/ui/terminal-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { SAST_PAIRS } from '@/lib/datasets/sast-loader'
import { Copy, Check, ShieldAlert, ShieldCheck, Code, Sparkles, AlertTriangle, FileText } from 'lucide-react'
import { consumeTokenStream } from '@/lib/sse-stream'

const SAMPLE_POLICIES = [
  {
    title: 'Predatory Fintech Instant Loan App Terms',
    text: `4.2 Verification & Identity: The User unconditionally grants the Application irrevocable permission to access, harvest, and transmit the User's full Device Contacts List, complete Call Logs, and Real-Time Location (including background tracking) to our offshore risk calculation servers.
    
6.3 Third Party Monetization: Personal financial data, Aadhaar details, and device IDs may be shared with up to 14 affiliate marketing networks and debt recovery agencies without prior notice.

9.1 Data Retention: We reserve the right to retain all user biometric and behavioral data indefinitely on our servers even after account deletion requests.`,
  },
  {
    title: 'Casual Mobile Gaming App Policy',
    text: `Section 3: Device Access & Permissions. This game requires access to the device Microphone and Camera for analytical enhancement. Canvas device fingerprinting and AudioContext identifiers are collected across sessions to deliver personalized advertising. We track installed application packages on the device to assess user interests.`,
  },
]

const PRIVACY_MOCK = [
  { category: 'Aadhaar / Contact Scraping', finding: 'Harvests full contact book and location without explicit consent', risk: 'CRITICAL', evidence: 'Terms §4.2 — "harvest and transmit Device Contacts"', law: 'IT Act 2000 §43A & DPDP Act 2023 §6' },
  { category: 'Indefinite Data Retention', finding: 'Retains biometric and behavioral records permanently after account closure', risk: 'CRITICAL', evidence: 'Terms §9.1 — "retain all data indefinitely"', law: 'DPDP Act 2023 §8 (Mandatory Erasure)' },
  { category: 'Third-Party Data Brokers', finding: 'Shares private debt & identity data with unnamed third-party recovery networks', risk: 'HIGH', evidence: 'Terms §6.3 — "14 affiliate marketing networks"', law: 'RBI Fair Practices Code & IT Act §72' },
  { category: 'Acoustic & Microphone Tracking', finding: 'Requests microphone and camera permissions for a non-audio game', risk: 'HIGH', evidence: 'Policy §3 — "access to device Microphone"', law: 'IT Act 2000 §66E (Privacy Violation)' },
  { category: 'Device Canvas Fingerprinting', finding: 'Generates persistent cross-app tracking hashes to circumvent user resets', risk: 'MEDIUM', evidence: 'Policy §3 — "AudioContext identifiers"', law: 'DPDP Act 2023 §7' },
]

function RiskBadge({ risk }: { risk: string }) {
  const v = risk === 'CRITICAL' ? 'critical' : risk === 'HIGH' ? 'warning' : 'info'
  return <StatusBadge label={risk} variant={v as 'critical' | 'warning' | 'info'} />
}

export default function DevSecPage() {
  const [tab, setTab] = useState<'sast' | 'privacy'>('sast')
  const [selectedPair, setSelectedPair] = useState(SAST_PAIRS[0])
  const [copied, setCopied] = useState(false)
  const [privacyText, setPrivacyText] = useState(SAMPLE_POLICIES[0].text)
  const [analyzing, setAnalyzing] = useState(false)
  const [privacyError, setPrivacyError] = useState<string | null>(null)
  const [privacyResults, setPrivacyResults] = useState(PRIVACY_MOCK)
  const [customCode, setCustomCode] = useState('')
  const [sastLoading, setSastLoading] = useState(false)
  const [sastError, setSastError] = useState<string | null>(null)
  const [sastReport, setSastReport] = useState<string | null>(null)

  function handleCopy() {
    navigator.clipboard.writeText(selectedPair.patchedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function analyzePrivacy() {
    if (!privacyText.trim()) return
    setAnalyzing(true)
    setPrivacyError(null)
    try {
      const res = await fetch('/api/devsec/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'privacy', text: privacyText.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Privacy policy analysis failed')
      }
      if (Array.isArray(data.findings)) {
        setPrivacyResults(data.findings)
      }
    } catch (err: unknown) {
      setPrivacyError(err instanceof Error ? err.message : 'Unable to audit policy text')
    } finally {
      setAnalyzing(false)
    }
  }

  async function auditCustomCode() {
    if (!customCode.trim()) return
    setSastLoading(true)
    setSastError(null)
    setSastReport(null)
    try {
      const res = await fetch('/api/devsec/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'sast', text: customCode.trim(), stream: true }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Custom SAST audit failed')
      }
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('text/event-stream')) {
        setSastLoading(false)
        setSastReport('')
        await consumeTokenStream(res, accumulated => {
          setSastReport(accumulated)
        })
      } else {
        const data = await res.json()
        setSastReport(data.report)
      }
    } catch (err: unknown) {
      setSastError(err instanceof Error ? err.message : 'Unable to audit source code')
    } finally {
      setSastLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Symmetrical Behance-style Header Banner */}
      <div className="p-6 rounded-2xl glass-card relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-[#DC2626] font-mono text-[11px] font-bold">
              03 // DEVSEC AUDITOR
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-[11px] font-mono text-slate-700">OWASP TOP 10 · DPDP ACT 2023 · BNS 2023</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            DevSec Auditor & Privacy Enforcement
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
            Static code security analysis (SAST) with real vulnerable/patched code pairs, plus an automated scanner that audits Terms & Conditions for illegal data harvesting under Indian privacy law (DPDP Act 2023, IT Act 2000).
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-shrink-0">
          <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[#15803D] text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SAST ENGINE LIVE</span>
          </div>
          <div className="px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-[#D97706] text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>8 VULN PAIRS</span>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-800 text-xs flex items-center gap-2">
        <AlertTriangle size={14} className="text-[#D97706] shrink-0" />
        <span><strong>AI-Assisted Indication:</strong> SAST &amp; DPDP Act audit results require manual engineering and legal review before production deployment.</span>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setTab('sast')}
          className="px-4 py-2 font-mono text-xs font-bold rounded-xl transition-all"
          style={{
            backgroundColor: tab === 'sast' ? 'rgba(99,102,241,0.15)' : 'rgba(15,23,42,0.4)',
            color: tab === 'sast' ? '#818cf8' : '#94a3b8',
            border: `1px solid ${tab === 'sast' ? 'rgba(99,102,241,0.35)' : 'rgba(51,65,85,0.4)'}`,
          }}
        >
          🔍 SAST Source Code Auditor
        </button>
        <button
          onClick={() => setTab('privacy')}
          className="px-4 py-2 font-mono text-xs font-bold rounded-xl transition-all"
          style={{
            backgroundColor: tab === 'privacy' ? 'rgba(99,102,241,0.15)' : 'rgba(15,23,42,0.4)',
            color: tab === 'privacy' ? '#818cf8' : '#94a3b8',
            border: `1px solid ${tab === 'privacy' ? 'rgba(99,102,241,0.35)' : 'rgba(51,65,85,0.4)'}`,
          }}
        >
          📜 Privacy & Surveillance Scanner
        </button>
      </div>

      {tab === 'sast' && (
        <div className="space-y-5">
          {/* Vulnerability Selection Chips */}
          <div className="space-y-2">
            <span className="font-mono text-xs font-bold text-slate-600 block">
              SELECT COMMON SECURITY FLAW TO AUDIT:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAST_PAIRS.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedPair(p); setCopied(false) }}
                  className="px-3 py-1.5 font-mono text-xs rounded-sm transition-all flex items-center gap-1.5"
                  style={{
                    border: `1px solid ${selectedPair.id === p.id ? '#10b981' : 'rgba(51,65,85,0.7)'}`,
                    color: selectedPair.id === p.id ? '#34d399' : '#94a3b8',
                    backgroundColor: selectedPair.id === p.id ? 'rgba(16,185,129,0.12)' : '#07090e',
                  }}
                >
                  <span className="font-bold">{p.cweId}:</span>
                  <span>{p.cweName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Diagnostic Info Bar */}
          <div className="p-3 bg-slate-100 border border-slate-200 rounded-sm flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span><span className="text-slate-500">VULN:</span> <strong className="text-red-400">[{selectedPair.cweId}] {selectedPair.cweName}</strong></span>
              <span><span className="text-slate-500">SEVERITY CVSS:</span> <strong className="text-[#D97706]">{selectedPair.cvssScore}</strong></span>
              <span><span className="text-slate-500">LANGUAGE:</span> <strong className="text-[#059669]">{selectedPair.language.toUpperCase()}</strong></span>
              <span><span className="text-slate-500">CATEGORY:</span> <span className="text-slate-700">{selectedPair.owaspCategory}</span></span>
            </div>
            <StatusBadge label="VERIFIED PATCH AVAILABLE" variant="ok" />
          </div>

          {/* Educational Threat Explanation */}
          <div className="p-4 bg-slate-100 border border-slate-200 rounded-sm font-sans text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-mono font-bold text-slate-800">
              <AlertTriangle size={15} className="text-[#D97706]" />
              <span>WHAT IS THIS SECURITY RISK & HOW ATTACKERS EXPLOIT IT:</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {selectedPair.description}
            </p>
          </div>

          {/* Dual-Pane Code Inspection */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Vulnerable Code */}
            <TerminalCard
              title="Vulnerable Source Code"
              label="[INSECURE PATTERN]"
              labelColor="red"
              noPadding
            >
              <div className="p-3 bg-red-50 border-b border-slate-200 text-xs font-mono text-red-300 flex items-center gap-2">
                <ShieldAlert size={14} className="text-red-400 flex-shrink-0" />
                <span>Flaw: Unsanitized execution vector detected</span>
              </div>
              <pre
                className="p-4 overflow-x-auto font-mono text-xs leading-relaxed bg-slate-50 text-red-300 whitespace-pre-wrap select-text max-h-[380px]"
              >
                {selectedPair.vulnerableCode}
              </pre>
            </TerminalCard>

            {/* Sanitized Patch Code */}
            <TerminalCard
              title="Sanitized & Patched Code"
              label="[REMEDIATION READY]"
              labelColor="green"
              noPadding
              headerRight={
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-2 py-1 font-mono text-[11px] bg-emerald-50 border border-slate-200 text-emerald-700 hover:bg-emerald-50 rounded-sm transition-colors"
                >
                  {copied ? <Check size={12} className="text-[#15803D]" /> : <Copy size={12} />}
                  <span>{copied ? 'COPIED!' : 'COPY FIX'}</span>
                </button>
              }
            >
              <div className="p-3 bg-emerald-50 border-b border-slate-200 text-xs font-mono text-emerald-700 flex items-center gap-2">
                <ShieldCheck size={14} className="text-[#15803D] flex-shrink-0" />
                <span>Remediated: Safe execution with input boundary enforcement</span>
              </div>
              <pre
                className="p-4 overflow-x-auto font-mono text-xs leading-relaxed bg-slate-50 text-emerald-700 whitespace-pre-wrap select-text max-h-[380px]"
              >
                {selectedPair.patchedCode}
              </pre>
            </TerminalCard>
          </div>

          {/* Live Custom Code SAST Audit */}
          <TerminalCard title="Live Custom Source Code Audit (BharatCode AI)" label="INTERACTIVE SAST" labelColor="amber">
            <div className="space-y-3 text-xs">
              <textarea
                value={customCode}
                onChange={e => setCustomCode(e.target.value)}
                rows={4}
                placeholder="Paste any Python, JS/TS, PHP, or SQL snippet to check for CWE vulnerabilities and receive patched code..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-sm font-mono text-xs text-slate-800 placeholder:text-slate-600 outline-none focus:border-indigo-500"
              />
              {sastError && (
                <div className="p-2.5 rounded-sm bg-rose-500/10 border border-rose-500/30 text-rose-700">{sastError}</div>
              )}
              <div className="flex justify-end">
                <button
                  onClick={auditCustomCode}
                  disabled={sastLoading || customCode.trim().length < 10}
                  className="px-4 py-2 bg-indigo-600 hover:bg-[#ECFDF5]0 disabled:opacity-40 text-white font-mono text-xs font-bold rounded-sm cursor-pointer"
                >
                  {sastLoading ? '[AUDITING SOURCE CODE...]' : '[RUN LIVE SAST AUDIT]'}
                </button>
              </div>
              {sastLoading && (
                <div className="space-y-2 animate-pulse p-3 bg-slate-50 rounded-sm border border-slate-200">
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-3 bg-slate-100 rounded w-5/6" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
              )}
              {sastReport && !sastLoading && (
                <pre className="p-4 bg-slate-50 border border-slate-200 rounded-sm font-mono text-xs text-slate-800 whitespace-pre-wrap max-h-80 overflow-y-auto">
                  {sastReport}
                </pre>
              )}
            </div>
          </TerminalCard>

          {/* Unified Diff View */}
          <TerminalCard title="Git Diff Representation" label="[CHANGESET]" labelColor="cyan" noPadding>
            <div className="p-4 bg-slate-50 font-mono text-xs leading-relaxed overflow-x-auto">
              {selectedPair.diff.split('\n').map((line, i) => (
                <div
                  key={i}
                  className="py-0.5 px-1 rounded-none"
                  style={{
                    backgroundColor: line.startsWith('+') ? 'rgba(16,185,129,0.1)' : line.startsWith('-') ? 'rgba(239,68,68,0.1)' : 'transparent',
                    color: line.startsWith('+') ? '#4ade80' : line.startsWith('-') ? '#f87171' : line.startsWith('@') ? '#34D399' : '#6B726D',
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          </TerminalCard>
        </div>
      )}

      {tab === 'privacy' && (
        <div className="space-y-5">
          {/* Privacy Input with 1-Click Samples */}
          <TerminalCard title="App Terms & Conditions / Privacy Policy Input" labelColor="amber">
            <div className="space-y-4">
              {/* Sample Buttons */}
              <div>
                <label className="text-xs text-slate-600 font-sans block mb-1.5 font-medium">
                  Test with real predatory Indian app terms (1-click demo):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SAMPLE_POLICIES.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setPrivacyText(p.text); setPrivacyResults(PRIVACY_MOCK) }}
                      className="text-left p-2.5 bg-slate-100 hover:bg-slate-100 border border-slate-200 rounded-sm text-xs font-sans text-slate-700 transition-colors"
                    >
                      <span className="font-semibold text-amber-700 block mb-0.5">{p.title}</span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{p.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-mono text-xs text-slate-600 block mb-1 font-semibold">
                  OR PASTE PRIVACY POLICY / TERMS TEXT TO SCAN:
                </label>
                <textarea
                  value={privacyText}
                  onChange={e => setPrivacyText(e.target.value)}
                  placeholder="Paste Terms of Service or Privacy Policy text here to detect violations of Digital Personal Data Protection (DPDP) Act 2023, Aadhaar Act, and illegal surveillance clauses..."
                  rows={6}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-sm font-mono text-xs text-slate-800 placeholder:text-slate-600 outline-none focus:border-amber-500"
                />
              </div>

              {privacyError && (
                <div className="p-3 rounded-sm bg-rose-500/10 border border-rose-500/30 text-rose-700 font-mono text-xs">
                  {privacyError}
                </div>
              )}

              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-mono text-xs text-slate-500">{privacyText.length} characters loaded</span>
                <button
                  onClick={analyzePrivacy}
                  disabled={analyzing || !privacyText.trim()}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-mono text-xs font-bold rounded-sm transition-all"
                >
                  {analyzing ? '[SCANNING POLICY CLAUSES...]' : '[ANALYZE FOR PRIVACY VIOLATIONS]'}
                </button>
              </div>
            </div>
          </TerminalCard>

          {/* Policy Scan Results */}
          <TerminalCard
            title="Policy Audit & Statutory Compliance Report"
            label="[DPDP ACT 2023 ASSESSMENT]"
            labelColor="red"
            noPadding
          >
            {analyzing ? (
              <div className="p-4 space-y-3 animate-pulse">
                <div className="h-10 bg-slate-100 rounded" />
                <div className="h-10 bg-slate-100 rounded" />
                <div className="h-10 bg-slate-100 rounded" />
              </div>
            ) : (
            <div className="overflow-x-auto font-mono text-xs">
              <table className="w-full">
                <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-3">VIOLATION CATEGORY</th>
                    <th className="text-left p-3">FINDING & EVIDENCE</th>
                    <th className="text-left p-3">RISK LEVEL</th>
                    <th className="text-left p-3">INDIAN STATUTORY LAW</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {privacyResults.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-100">
                      <td className="p-3 text-slate-800 font-semibold whitespace-nowrap">{r.category}</td>
                      <td className="p-3 text-slate-700 font-sans max-w-sm">
                        <p>{r.finding}</p>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">Evidence: {r.evidence}</p>
                      </td>
                      <td className="p-3 whitespace-nowrap"><RiskBadge risk={r.risk} /></td>
                      <td className="p-3 text-[#15803D] font-semibold whitespace-nowrap">{r.law}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </TerminalCard>
        </div>
      )}
    </div>
  )
}