'use client'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { TerminalCard } from '@/components/ui/terminal-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { BlinkCursor } from '@/components/ui/blink-cursor'
import { Terminal, BookOpen, Shield, Flag } from 'lucide-react'

const FLASHCARDS = [
  {
    id: 1, classification: 'TLP:AMBER', threat: 'ARP Poisoning',
    front: 'What is ARP Poisoning and how does it enable MITM attacks?',
    description: 'ARP Cache Poisoning exploits the stateless nature of ARP protocol by flooding the network with gratuitous ARP replies, linking the attacker\'s MAC address to a legitimate IP.',
    indicators: ['Duplicate ARP entries in cache', 'Unusual MAC-IP associations', 'Increased network latency'],
    mitigations: ['Dynamic ARP Inspection (DAI)', 'Static ARP entries for critical hosts', 'VLAN segmentation', '802.1X port authentication'],
    mitre: 'T1557.002',
  },
  {
    id: 2, classification: 'TLP:RED', threat: 'SQL Injection',
    front: 'Explain UNION-based SQL injection and how to detect it in logs.',
    description: 'UNION-based SQLi appends additional SELECT statements to extract data from other tables. Detectable by unusual query patterns in database logs.',
    indicators: ['UNION SELECT in URL params', 'Error messages with SQL syntax', 'Unusual quotes in form fields'],
    mitigations: ['Parameterized queries', 'Stored procedures', 'WAF with SQLi rules', 'Least privilege DB accounts'],
    mitre: 'T1190',
  },
  {
    id: 3, classification: 'TLP:AMBER', threat: 'Spear Phishing',
    front: 'Differentiate spear phishing from generic phishing. What are APT36\'s TTPs?',
    description: 'Spear phishing targets specific individuals using personalized lures from OSINT. APT36 uses LinkedIn profiling to craft contextually accurate emails with weaponized Office docs.',
    indicators: ['Targeted sender spoofing', '.docm/.xlsm attachments', 'Macro execution prompts', 'C2 callback to known APT36 IPs'],
    mitigations: ['Email authentication (DMARC/DKIM/SPF)', 'Disable macros by Group Policy', 'Employee security awareness training', 'Sandbox email attachments'],
    mitre: 'T1566.001',
  },
  {
    id: 4, classification: 'TLP:RED', threat: 'Ransomware — LockBit 3.0',
    front: 'Describe the LockBit 3.0 attack chain and containment procedures.',
    description: 'LockBit 3.0 (BlackMatter rebranded) uses double-extortion: encrypt + exfiltrate. Targets Windows domain controllers, deletes shadow copies, deploys via Cobalt Strike.',
    indicators: ['Shadow copies deleted (vssadmin)', 'Mass file renaming with .lockbit extension', 'ransom note HLJkNskOq.README.txt', 'Port scanning on 445/SMB'],
    mitigations: ['ISOLATE endpoint immediately', 'Preserve shadow copies', 'Block C2 domains at perimeter', 'Report to CERT-In and NCIIPC'],
    mitre: 'T1486',
  },
  {
    id: 5, classification: 'TLP:WHITE', threat: 'Zero-Day Exploit',
    front: 'Define zero-day vulnerability lifecycle and responsible disclosure process.',
    description: 'Zero-days are vulnerabilities unknown to the vendor with no available patch. Lifecycle: discovery → weaponization → exploitation → disclosure → patch → end-of-life.',
    indicators: ['Novel exploit code not matching known signatures', 'Exploitation before vendor awareness', 'Nation-state attribution patterns'],
    mitigations: ['Defense-in-depth layering', 'Application whitelisting', 'Exploit mitigation (ASLR/DEP/CFG)', 'Threat intelligence sharing via MISP'],
    mitre: 'T1203',
  },
]

const CTF_COMMANDS: Record<string, string> = {
  help: `Available commands:
  help          — Show this help
  ls            — List challenge files
  cat flag.txt  — Read the flag file (encoded)
  scan <ip>     — Perform port scan
  decode <str>  — Base64 decode a string
  submit <flag> — Submit a flag for verification
  clear         — Clear terminal`,
  ls: `total 6
  drwxr-xr-x  operator  staff   96B  challenge/
  -rw-r--r--  operator  staff  128B  readme.txt
  -rw-r-----  root      root   64B   flag.txt
  -rw-r--r--  operator  staff  2.1K  pcap_fragment.hex`,
  'cat flag.txt': `[PERMISSION DENIED] flag.txt: owner=root mode=640
  [HINT] Decode the pcap_fragment.hex first:
  → cat pcap_fragment.hex | xxd -r | strings | grep "CS{"`,
  'cat readme.txt': `CHALLENGE_04: Network Capture Analysis
  Difficulty: INTERMEDIATE | Points: 250
  
  A suspicious packet was captured on the wire.
  The flag is hidden within the HTTP response body.
  Extract it from pcap_fragment.hex using forensic tools.
  
  Target: 192.168.1.105:8080`,
  'scan 192.168.1.105': `Starting port scan on 192.168.1.105...
  PORT     STATE  SERVICE  VERSION
  22/tcp   open   ssh      OpenSSH 8.9p1
  80/tcp   open   http     nginx 1.18.0  
  8080/tcp open   http-alt [VULNERABLE: unauth RCE CVE-2023-44487]
  443/tcp  closed https
  
  [FINDING] Port 8080 — HTTP/2 Rapid Reset vulnerability detected!`,
  clear: '__CLEAR__',
}

interface TermLine {
  ts: string
  type: 'input' | 'output' | 'error' | 'system'
  content: string
}

export default function AcademyPage() {
  const [activePanel, setActivePanel] = useState<'briefing' | 'phishing' | 'ctf' | 'flashcards'>('briefing')
  const [termHistory, setTermHistory] = useState<TermLine[]>([
    { ts: '00:00:00', type: 'system', content: '[CYBERSHIELD CTF TERMINAL v2.4]\n[CHALLENGE_04: Network Capture Analysis | 250 pts]\n[Target: 192.168.1.105 | Type "help" to begin]' },
  ])
  const [termInput, setTermInput] = useState('')
  const [cardIdx, setCardIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [phishingTab, setPhishingTab] = useState<'body' | 'headers'>('body')
  const [completedCards, setCompletedCards] = useState<Set<number>>(new Set())
  const [isPlayingBriefing, setIsPlayingBriefing] = useState(false)
  const termRef = useRef<HTMLDivElement>(null)

  function toggleBriefingAudio() {
    if (typeof window === 'undefined') return
    if (isPlayingBriefing) {
      window.speechSynthesis?.cancel()
      setIsPlayingBriefing(false)
    } else {
      window.speechSynthesis?.cancel()
      const text = 'Tactical Briefing initialized. Module 07: Advanced Persistent Threat, Supply Chain Intrusion. Classification: TLP:AMBER. Threat Landscape: State-sponsored adversaries weaponize upstream dependencies like SolarWinds and XZ Utils to bypass perimeter defenses. Operators must enforce Software Bill of Materials, cryptographic package signing, and zero-trust sandboxing.'
      const utter = new SpeechSynthesisUtterance(text)
      utter.rate = 1.05
      utter.pitch = 0.95
      utter.onend = () => setIsPlayingBriefing(false)
      utter.onerror = () => setIsPlayingBriefing(false)
      window.speechSynthesis?.speak(utter)
      setIsPlayingBriefing(true)
    }
  }

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
    }
  }, [])

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight
  }, [termHistory])

  function submitCommand(cmd: string) {
    if (!cmd.trim()) return
    const ts = new Date().toTimeString().slice(0, 8)
    const cmdLower = cmd.trim().toLowerCase()
    let output = ''
    let type: TermLine['type'] = 'output'

    if (cmdLower === 'clear') {
      setTermHistory([])
      setTermInput('')
      return
    } else if (cmdLower.startsWith('decode ')) {
      const b64 = cmd.trim().slice(7)
      try {
        output = `[DECODE_RESULT] ${atob(b64)}`
      } catch {
        output = '[ERROR] Invalid base64 string'
        type = 'error'
      }
    } else if (cmdLower.startsWith('submit ')) {
      const flag = cmd.trim().slice(7)
      if (flag === 'CS{http2_rapid_reset_cve_2023_44487}') {
        output = '[SUCCESS] ✓ FLAG ACCEPTED! +250 points | Rank: #14 → #7'
      } else {
        output = '[WRONG_FLAG] Incorrect. Keep investigating.'
        type = 'error'
      }
    } else if (cmdLower.startsWith('scan ')) {
      output = CTF_COMMANDS['scan 192.168.1.105'] ?? `[ERROR] Cannot reach host. Check network routing.`
    } else {
      output = CTF_COMMANDS[cmdLower] ?? `[ERROR] Command not found: "${cmd.trim()}". Type "help" for available commands.`
      if (!CTF_COMMANDS[cmdLower]) type = 'error'
    }

    setTermHistory(prev => [
      ...prev,
      { ts, type: 'input', content: `operator@cybershield:~$ ${cmd.trim()}` },
      { ts, type, content: output },
    ])
    setTermInput('')
  }

  const card = FLASHCARDS[cardIdx]

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Symmetrical Behance-style Header Banner */}
      <div className="p-6 rounded-2xl glass-card relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 font-mono text-[11px] font-bold">
              01 // CYBER RANGE & ACADEMY
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-[11px] font-mono text-slate-300">TACTICAL TRAINING · CTF · PHISHING LAB · FLASHCARDS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cyber Range & Intelligence Academy
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Immersive tactical training simulators: live CTF shell, phishing email sandbox with header forensics, intelligence flashcards with MITRE ATT&amp;CK mapping, and briefing theater.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-shrink-0">
          <div className="px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>RANGE ONLINE</span>
          </div>
          <div className="px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>TRAINING MODE</span>
          </div>
        </div>
      </div>

      {/* Panel tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'briefing' as const, icon: Terminal, label: 'Tactical Briefing' },
          { id: 'phishing' as const, icon: Shield, label: 'Phishing Sandbox' },
          { id: 'ctf' as const, icon: Flag, label: 'CTF Shell' },
          { id: 'flashcards' as const, icon: BookOpen, label: 'Threat Flashcards' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActivePanel(id)}
            className="flex items-center gap-1.5 px-4 py-2 font-mono text-xs font-bold rounded-xl transition-all"
            style={{
              border: `1px solid ${activePanel === id ? 'rgba(99,102,241,0.4)' : 'rgba(51,65,85,0.4)'}`,
              color: activePanel === id ? '#818cf8' : '#94a3b8',
              backgroundColor: activePanel === id ? 'rgba(99,102,241,0.15)' : 'rgba(15,23,42,0.4)',
            }}
          >
            <Icon size={13} />{label}
          </button>
        ))}
      </div>

      {/* Tactical Briefing */}
      {activePanel === 'briefing' && (
        <TerminalCard title="Tactical Briefing Terminal" label="[MODULE_07]" labelColor="cyan" noPadding>
          <div className="relative" style={{ aspectRatio: '16/7', backgroundColor: '#020304' }}>
            {/* Corner brackets */}
            {[['top-3 left-3', 'border-t border-l'], ['top-3 right-3', 'border-t border-r'], ['bottom-3 left-3', 'border-b border-l'], ['bottom-3 right-3', 'border-b border-r']].map(([pos, borders], i) => (
              <div key={i} className={`absolute ${pos} w-6 h-6 ${borders}`} style={{ borderColor: '#10b981' }} />
            ))}
            <div className="flex flex-col items-center justify-center h-full gap-4 px-12 text-center">
              <StatusBadge label="BRIEFING LOADED" variant="ok" />
              <p className="font-mono text-base font-bold" style={{ color: '#22c55e' }}>
                MODULE_07: Advanced Persistent Threat — Supply Chain Intrusion
              </p>
              <p className="font-mono text-xs text-slate-500">Runtime: 00:12:00 | Classification: TLP:AMBER | Level: ADVANCED</p>
              {/* Waveform */}
              <div className="flex items-end gap-0.5 h-8">
                {Array.from({ length: 48 }, (_, i) => (
                  <div key={i} className="w-1 rounded-none"
                    style={{
                      height: `${14 + Math.sin(i * 0.45) * 8 + Math.cos(i * 0.9) * 6}px`,
                      backgroundColor: '#10b981',
                      opacity: 0.5 + ((i % 6) * 0.08),
                    }} />
                ))}
              </div>
              <p className="font-mono text-xs text-slate-600">00:04:32 / 00:12:00</p>
              <div className="flex items-center gap-3 flex-wrap justify-center">
                <button
                  onClick={toggleBriefingAudio}
                  className="font-mono text-xs font-bold px-6 py-2 rounded-xl transition-all shadow-md flex items-center gap-2"
                  style={{
                    backgroundColor: isPlayingBriefing ? '#ef4444' : '#10b981',
                    color: '#050507',
                  }}
                >
                  {isPlayingBriefing ? '⏹ [STOP BRIEFING]' : '▶ [PLAY BRIEFING]'}
                </button>
                <Link
                  href="/video-gen"
                  className="font-mono text-xs font-bold px-5 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500 text-indigo-200 hover:text-white border border-indigo-500/30 transition-all flex items-center gap-1.5"
                >
                  <span>LAUNCH VIDEO VAULT &amp; STUDIO →</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 space-y-1.5" style={{ borderTop: '1px solid rgba(30,41,59,0.4)' }}>
            {['Ch.1: Supply Chain Threat Landscape [00:00]', 'Ch.2: SolarWinds & XZ Utils Case Studies [04:15]', 'Ch.3: Detection & IR Procedures [08:30]'].map((ch, i) => (
              <div key={i} className="flex items-center gap-3 font-mono text-xs cursor-pointer hover:text-slate-300 transition-colors text-slate-500">
                <span style={{ color: '#475569' }}>▶</span>{ch}
              </div>
            ))}
          </div>
        </TerminalCard>
      )}

      {/* CTF Shell */}
      {activePanel === 'ctf' && (
        <TerminalCard title="CTF Challenge Shell" label="[CHALLENGE_04 | 250 PTS]" labelColor="green" noPadding>
          <div ref={termRef} className="overflow-y-auto p-4 font-mono text-xs space-y-1" style={{ height: '360px', backgroundColor: '#020304' }}>
            {termHistory.map((line, i) => (
              <pre key={i} className="whitespace-pre-wrap leading-relaxed" style={{
                color: line.type === 'input' ? '#e2e8f0' : line.type === 'error' ? '#ef4444' : line.type === 'system' ? '#06b6d4' : '#22c55e',
              }}>
                {line.content}
              </pre>
            ))}
          </div>
          <div className="flex items-center gap-2 px-3 py-2" style={{ borderTop: '1px solid rgba(30,41,59,0.65)', backgroundColor: '#020304' }}>
            <span className="font-mono text-xs flex-shrink-0" style={{ color: '#10b981' }}>operator@cybershield:~$</span>
            <input value={termInput} onChange={e => setTermInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submitCommand(termInput) }}
              className="flex-1 font-mono text-xs bg-transparent outline-none"
              style={{ color: '#e2e8f0' }}
              placeholder="Type command..." autoFocus />
            <BlinkCursor />
          </div>
        </TerminalCard>
      )}

      {/* Phishing Sandbox */}
      {activePanel === 'phishing' && (
        <TerminalCard title="Phishing Sandbox — Email Client" label="[THREAT_SCORE: 94/100]" labelColor="red" noPadding>
          <div className="flex gap-2 px-3 pt-2" style={{ borderBottom: '1px solid rgba(30,41,59,0.4)' }}>
            {(['body', 'headers'] as const).map(t => (
              <button key={t} onClick={() => setPhishingTab(t)}
                className="font-mono text-xs px-3 py-1.5 rounded-none"
                style={{
                  border: `1px solid ${phishingTab === t ? '#10b981' : 'rgba(30,41,59,0.65)'}`,
                  color: phishingTab === t ? '#22c55e' : '#475569',
                  borderBottom: 'none',
                  marginBottom: '-1px',
                  backgroundColor: phishingTab === t ? '#0f1117' : 'transparent',
                }}>
                [{t === 'body' ? 'EMAIL_BODY' : 'HEADERS & HEX'}]
              </button>
            ))}
          </div>
          {phishingTab === 'body' ? (
            <div className="p-4 space-y-3 font-mono text-xs">
              <div className="space-y-1" style={{ borderBottom: '1px solid rgba(30,41,59,0.4)', paddingBottom: '12px' }}>
                <p><span className="text-slate-500">FROM:</span> <span style={{ color: '#ef4444' }}>alerts@sbi-kyc-helpdesk.in</span> <StatusBadge label="SPF_FAIL" variant="critical" /></p>
                <p><span className="text-slate-500">TO:</span> <span className="text-slate-300">customer@domain.com</span></p>
                <p><span className="text-slate-500">SUBJECT:</span> <span style={{ color: '#f59e0b' }}>⚠ URGENT: Your SBI account will be BLOCKED in 24 hours</span></p>
                <p><span className="text-slate-500">DATE:</span> <span className="text-slate-400">Mon, 18 Nov 2024 02:14:33 +0530</span></p>
              </div>
              <div className="space-y-2 leading-relaxed">
                <p className="text-slate-300">Dear Valued Customer,</p>
                <p className="text-slate-300">We have detected <span className="px-1" style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>SUSPICIOUS ACTIVITY</span> on your account. Your account will be <span style={{ color: '#ef4444' }}>PERMANENTLY BLOCKED</span> within <span className="font-bold" style={{ color: '#f59e0b' }}>24 HOURS</span> if you do not verify your KYC.</p>
                <p><span className="text-slate-500">Click here:</span> <a className="underline" style={{ color: '#ef4444' }}>http://sbi-kyc-update-portal.xyz/verify?ref=3847291</a></p>
                <div className="flex gap-2 mt-3">
                  <StatusBadge label="PUNYCODE_DOMAIN" variant="critical" />
                  <StatusBadge label="URGENCY_TRIGGER" variant="warning" />
                  <StatusBadge label="CREDENTIAL_HARVEST" variant="critical" />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 font-mono text-xs space-y-2">
              <div className="space-y-0.5 text-slate-500" style={{ borderBottom: '1px solid rgba(30,41,59,0.4)', paddingBottom: '10px' }}>
                <p><span style={{ color: '#ef4444' }}>Received-SPF: fail</span> (domain of sbi-kyc-helpdesk.in does not designate 45.33.32.156 as permitted)</p>
                <p><span style={{ color: '#ef4444' }}>Authentication-Results: spf=fail; dkim=none; dmarc=fail</span></p>
                <p>X-Originating-IP: 45.33.32.156 (AS63949 - Linode LLC)</p>
                <p>X-Mailer: PHPMailer 6.1.4 (detected mass-mailer)</p>
              </div>
              <p className="text-slate-500 mt-2">HEX DUMP (first 64 bytes of body):</p>
              <pre className="text-slate-600 leading-relaxed text-xs">
{`00000000  44 65 61 72 20 56 61 6c  75 65 64 20 43 75 73 74  |Dear Valued Cust|
00000010  6f 6d 65 72 2c 20 57 65  20 68 61 76 65 20 64 65  |omer, We have de|
00000020  74 65 63 74 65 64 20 53  55 53 50 49 43 49 4f 55  |tected SUSPICIOU|
00000030  53 20 41 43 54 49 56 49  54 59 20 6f 6e 20 79 6f  |S ACTIVITY on yo|`}
              </pre>
            </div>
          )}
          <div className="px-4 py-2 flex items-center justify-between" style={{ borderTop: '1px solid rgba(30,41,59,0.4)' }}>
            <StatusBadge label="CONFIRMED_PHISH" variant="critical" blink />
            <span className="font-mono text-xs text-slate-500">THREAT SCORE: 94/100</span>
          </div>
        </TerminalCard>
      )}

      {/* Flashcards */}
      {activePanel === 'flashcards' && (
        <div className="space-y-4">
          <TerminalCard title="Threat Intelligence Flashcards" label={`[${cardIdx + 1} OF ${FLASHCARDS.length}]`} labelColor="amber">
            <div className="space-y-4">
              {/* Progress bar */}
              <div className="h-1.5 w-full rounded-none" style={{ backgroundColor: 'rgba(30,41,59,0.6)' }}>
                <div className="h-full" style={{ width: `${(completedCards.size / FLASHCARDS.length) * 100}%`, backgroundColor: '#10b981' }} />
              </div>

              {/* Card */}
              <div className="p-5 cursor-pointer" onClick={() => setFlipped(f => !f)}
                style={{ border: '1px solid rgba(30,41,59,0.65)', minHeight: '200px', backgroundColor: '#0a0c10' }}>
                <div className="flex justify-between items-start mb-4">
                  <span className="font-mono text-xs font-bold" style={{ color: '#f59e0b' }}>[{card.classification}]</span>
                  <StatusBadge label={card.mitre} variant="info" />
                </div>
                {!flipped ? (
                  <div className="space-y-3">
                    <p className="font-mono text-xs text-slate-500 tracking-widest">THREAT VECTOR</p>
                    <p className="font-mono text-lg font-bold" style={{ color: '#ef4444' }}>{card.threat}</p>
                    <p className="font-mono text-sm text-slate-300">{card.front}</p>
                    <p className="font-mono text-xs text-slate-600 mt-4">[CLICK TO REVEAL ANSWER]</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="font-mono text-xs text-slate-400 leading-relaxed">{card.description}</p>
                    <div>
                      <p className="font-mono text-xs text-slate-500 mb-1">IOC INDICATORS:</p>
                      {card.indicators.map((ind, i) => <p key={i} className="font-mono text-xs" style={{ color: '#f59e0b' }}>• {ind}</p>)}
                    </div>
                    <div>
                      <p className="font-mono text-xs text-slate-500 mb-1">MITIGATIONS:</p>
                      {card.mitigations.map((m, i) => <p key={i} className="font-mono text-xs" style={{ color: '#22c55e' }}>✓ {m}</p>)}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => { setCardIdx(i => Math.max(0, i - 1)); setFlipped(false) }}
                  disabled={cardIdx === 0}
                  className="font-mono text-xs px-3 py-1.5 rounded-none disabled:opacity-30"
                  style={{ border: '1px solid rgba(30,41,59,0.65)', color: '#475569' }}>
                  ← PREV
                </button>
                <button
                  onClick={() => { setCompletedCards(s => new Set([...s, card.id])); setCardIdx(i => Math.min(FLASHCARDS.length - 1, i + 1)); setFlipped(false) }}
                  className="font-mono text-xs px-3 py-1.5 rounded-none font-bold"
                  style={{ backgroundColor: '#10b981', color: '#050507' }}>
                  [MARK COMPLETE] NEXT →
                </button>
              </div>
            </div>
          </TerminalCard>
        </div>
      )}
    </div>
  )
}
