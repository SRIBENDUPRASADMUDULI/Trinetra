'use client'
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { TerminalCard } from '@/components/ui/terminal-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { BlinkCursor } from '@/components/ui/blink-cursor'
import {
  Terminal, BookOpen, Shield, Flag, Play, Square,
  Volume2, FastForward, CheckCircle2, Copy, Check,
  ExternalLink, Layers, Cpu, ArrowRight, Radio
} from 'lucide-react'

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

const HEX_DUMP_DATA = [
  { offset: '00000000', hex: '45 00 00 3c 1a 2b 40 00  40 06 d2 e1 c0 a8 01 69', ascii: 'E..<.+@.@......i' },
  { offset: '00000010', hex: '2d 21 20 9c c0 00 1f 90  9b 8c 3e 11 00 00 00 00', ascii: '-! .......>.....' },
  { offset: '00000020', hex: 'a0 02 72 10 a3 44 00 00  02 04 05 b4 04 02 08 0a', ascii: '..r..D..........' },
  { offset: '00000030', hex: '38 49 18 29 00 00 00 00  01 03 03 07 50 4f 53 54', ascii: '8I.)........POST' },
  { offset: '00000040', hex: '20 2f 61 70 69 2f 76 31  2f 61 75 74 68 2f 72 65', ascii: ' /api/v1/auth/re' },
  { offset: '00000050', hex: '73 65 74 20 48 54 54 50  2f 32 2e 30 0d 0a 48 6f', ascii: 'set HTTP/2.0..Ho' },
  { offset: '00000060', hex: '73 74 3a 20 63 32 2e 61  70 74 33 36 2e 6f 72 67', ascii: 'st: c2.apt36.org' },
  { offset: '00000070', hex: '0d 0a 55 73 65 72 2d 41  67 65 6e 74 3a 20 54 52', ascii: '..User-Agent: TR' },
  { offset: '00000080', hex: '49 4e 45 54 52 41 2d 58  5a 2d 50 41 59 4c 4f 41', ascii: 'INETRA-XZ-PAYLOA' },
  { offset: '00000090', hex: '44 5f 56 45 43 54 4f 52  0d 0a 0d 0a 7b 22 73 65', ascii: 'D_VECTOR....{"se' },
]

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
  const [activeChapter, setActiveChapter] = useState(1)
  const [copiedHex, setCopiedHex] = useState(false)
  const termRef = useRef<HTMLDivElement>(null)

  function toggleBriefingAudio() {
    if (typeof window === 'undefined') return
    if (isPlayingBriefing) {
      window.speechSynthesis?.cancel()
      setIsPlayingBriefing(false)
    } else {
      window.speechSynthesis?.cancel()
      const chapterTexts: Record<number, string> = {
        1: 'Tactical Briefing initialized. Module 07: Advanced Persistent Threat, Supply Chain Intrusion. Classification: TLP:AMBER. Threat Landscape: State-sponsored adversaries weaponize upstream dependencies like SolarWinds and XZ Utils to bypass perimeter defenses. Operators must enforce Software Bill of Materials, cryptographic package signing, and zero-trust sandboxing.',
        2: 'Chapter 2: In-depth analysis of the SolarWinds Sunburst back door and XZ Utils liblzma multi-stage injection. Attackers compromised upstream build test files to hook RSA public key verification within OpenSSH sshd process space.',
        3: 'Chapter 3: Detection and Incident Response Procedures. Correlate memory strings and packet level Rapid Reset spikes. Prepare BNS 2023 Section 318 and 336 forensic dossiers with electronic admissibility certificates under BSA Section 63.',
      }
      const text = chapterTexts[activeChapter] ?? chapterTexts[1]
      const utter = new SpeechSynthesisUtterance(text)
      utter.rate = 1.02
      utter.pitch = 0.95
      utter.onend = () => setIsPlayingBriefing(false)
      utter.onerror = () => setIsPlayingBriefing(false)
      window.speechSynthesis?.speak(utter)
      setIsPlayingBriefing(true)
    }
  }

  function handleSelectChapter(ch: number) {
    setActiveChapter(ch)
    if (isPlayingBriefing) {
      window.speechSynthesis?.cancel()
      setIsPlayingBriefing(false)
    }
  }

  function copyHexDump() {
    const text = HEX_DUMP_DATA.map(d => `${d.offset}  ${d.hex}  |${d.ascii}|`).join('\n')
    navigator.clipboard.writeText(text)
    setCopiedHex(true)
    setTimeout(() => setCopiedHex(false), 2000)
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
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto select-none">
      {/* Symmetrical High-Craft Header Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0F1523]/90 border border-white/[0.08] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xl">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 font-mono text-[11px] font-bold">
              01 // CYBER RANGE & ACADEMY
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-[11px] font-mono text-slate-400">TACTICAL WORKBENCH · CTF SHELL · WIRE FORENSICS</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Cyber Range & Intelligence Academy
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Immersive tactical training simulators: split-pane briefing terminal with live packet hex dump stream, phishing email sandbox with header forensics, CTF shell, and MITRE ATT&amp;CK flashcards.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-shrink-0 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>RANGE ONLINE</span>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>TRAINING MODE</span>
          </div>
        </div>
      </div>

      {/* Panel Tabs */}
      <div className="flex gap-2 flex-wrap font-mono text-xs">
        {[
          { id: 'briefing' as const, icon: Terminal, label: 'Tactical Briefing Workbench' },
          { id: 'ctf' as const, icon: Flag, label: 'CTF Challenge Shell' },
          { id: 'phishing' as const, icon: Shield, label: 'Phishing Sandbox' },
          { id: 'flashcards' as const, icon: BookOpen, label: 'Threat Flashcards' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActivePanel(id)}
            className="flex items-center gap-1.5 px-3.5 py-2 font-bold rounded-xl transition-all cursor-pointer"
            style={{
              border: `1px solid ${activePanel === id ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
              color: activePanel === id ? '#818cf8' : '#94a3b8',
              backgroundColor: activePanel === id ? 'rgba(99,102,241,0.15)' : 'rgba(15,21,35,0.6)',
            }}
          >
            <Icon size={13} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tactical Briefing Split-Pane Workbench */}
      {activePanel === 'briefing' && (
        <TerminalCard
          title="Tactical Briefing Workbench — Split-Pane Operations Console"
          label="MODULE_07"
          labelColor="cyan"
          noPadding
          headerRight={
            <span className="text-[11px] font-mono text-slate-400">
              Target: Supply Chain Intrusion (SolarWinds &amp; XZ Utils)
            </span>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
            {/* Left Pane (Audio Briefing & Telemetry Controls) - 6 Cols */}
            <div className="lg:col-span-6 p-5 sm:p-6 space-y-5 bg-[#0A0E17]/60">
              <div className="flex items-center justify-between">
                <StatusBadge label="BRIEFING LOADED" variant="ok" />
                <span className="text-[10px] font-mono text-slate-500">
                  CLASSIFICATION: TLP:AMBER · LEVEL: ADVANCED
                </span>
              </div>

              <div>
                <h3 className="font-mono text-base font-bold text-white flex items-center gap-2">
                  <span className="text-emerald-400">MODULE_07:</span>
                  <span>Advanced Persistent Threat — Supply Chain Intrusion</span>
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-1">
                  Adversaries weaponize upstream dependencies and build systems to bypass zero-trust perimeter verification.
                </p>
              </div>

              {/* Dynamic Waveform Visualizer */}
              <div className="p-4 rounded-xl bg-[#0F1523] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Radio size={12} className={isPlayingBriefing ? 'text-emerald-400 animate-pulse' : 'text-slate-500'} />
                    {isPlayingBriefing ? 'AUDIO STREAM TRANSMITTING' : 'STREAM STANDBY'}
                  </span>
                  <span>00:04:32 / 00:12:00</span>
                </div>

                {/* Animated Soundwave Frequency Bars */}
                <div className="flex items-end gap-1 h-12 py-1 justify-center">
                  {Array.from({ length: 42 }, (_, i) => {
                    const dynamicHeight = isPlayingBriefing
                      ? Math.max(8, Math.sin(i * 0.45 + Date.now() / 300) * 22 + 24)
                      : 12 + Math.sin(i * 0.5) * 6
                    return (
                      <div
                        key={i}
                        className="w-1.5 rounded-sm transition-all duration-150"
                        style={{
                          height: `${dynamicHeight}px`,
                          backgroundColor: isPlayingBriefing ? '#10B981' : '#334155',
                          opacity: isPlayingBriefing ? 0.6 + (i % 5) * 0.08 : 0.4,
                        }}
                      />
                    )
                  })}
                </div>

                {/* Playback Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <button
                    onClick={toggleBriefingAudio}
                    className="font-mono text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-md"
                    style={{
                      backgroundColor: isPlayingBriefing ? '#ef4444' : '#10b981',
                      color: '#050507',
                    }}
                  >
                    {isPlayingBriefing ? (
                      <>
                        <Square size={12} />
                        <span>[STOP BRIEFING]</span>
                      </>
                    ) : (
                      <>
                        <Play size={12} />
                        <span>[PLAY BRIEFING]</span>
                      </>
                    )}
                  </button>

                  <Link
                    href="/video-gen"
                    className="font-mono text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 transition-all"
                  >
                    <span>LAUNCH VIDEO STUDIO</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              {/* Interactive Chapter Roadmap */}
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                  Module Chapters &amp; Takeaway Milestones
                </p>
                <div className="space-y-1.5 font-mono text-xs">
                  {[
                    { ch: 1, title: 'Ch.1: Supply Chain Threat Landscape', time: '00:00' },
                    { ch: 2, title: 'Ch.2: SolarWinds & XZ Utils Case Studies', time: '04:15' },
                    { ch: 3, title: 'Ch.3: Detection & IR Procedures', time: '08:30' },
                  ].map(c => (
                    <div
                      key={c.ch}
                      onClick={() => handleSelectChapter(c.ch)}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                        activeChapter === c.ch
                          ? 'bg-indigo-950/20 border-indigo-500/40 text-indigo-200'
                          : 'bg-white/[0.02] border-white/[0.05] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={activeChapter === c.ch ? 'text-indigo-400' : 'text-slate-600'}>
                          ▶
                        </span>
                        <span>{c.title}</span>
                      </span>
                      <span className="text-[10px] text-slate-500">{c.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Pane (Live Packet Hex Dump & Stream Dissection) - 6 Cols */}
            <div className="lg:col-span-6 p-5 sm:p-6 space-y-4 bg-[#080B12]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusBadge label="PCAP_DISSECTION" variant="info" />
                  <span className="font-mono text-xs text-white font-semibold">
                    wire_packet_04.hex
                  </span>
                </div>
                <button
                  onClick={copyHexDump}
                  className="px-2.5 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-[11px] font-mono text-slate-300 border border-white/[0.08] flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copiedHex ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span>{copiedHex ? 'Copied' : 'Copy Hex'}</span>
                </button>
              </div>

              {/* Protocol Breakdown Tags */}
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-slate-500 block">L2/L3 HEADER</span>
                  <span className="text-indigo-300">IPv4 · 192.168.1.105:8080</span>
                </div>
                <div className="p-2 rounded bg-white/[0.02] border border-white/[0.06]">
                  <span className="text-slate-500 block">VULNERABILITY</span>
                  <span className="text-rose-300">CVE-2023-44487 (Rapid Reset)</span>
                </div>
              </div>

              {/* Synchronized Hex Dump Terminal Box */}
              <div className="p-3.5 rounded-xl bg-[#04060A] border border-white/[0.08] font-mono text-[11px] space-y-1 overflow-x-auto max-h-[300px]">
                <div className="text-slate-500 pb-1 border-b border-white/[0.06] text-[10px] flex justify-between">
                  <span>OFFSET    HEXADECIMAL DATA</span>
                  <span>ASCII DECODE</span>
                </div>
                {HEX_DUMP_DATA.map((row, idx) => (
                  <div key={idx} className="flex justify-between hover:bg-white/[0.04] px-1 rounded transition-colors">
                    <span className="text-slate-500 mr-2">{row.offset}</span>
                    <span className="text-indigo-300 font-medium tracking-wider mr-4">
                      {row.hex}
                    </span>
                    <span className="text-emerald-400 font-bold tracking-tight">
                      |{row.ascii}|
                    </span>
                  </div>
                ))}
              </div>

              {/* Extracted IOC Hashes & Quick Sandbox Triggers */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2 font-mono text-[11px]">
                <div className="text-slate-400 flex items-center justify-between">
                  <span>FORENSIC SIGNATURE:</span>
                  <span className="text-emerald-400">SHA-256 MATCH VERIFIED</span>
                </div>
                <div className="p-2 rounded bg-black/40 text-[10px] text-slate-300 break-all select-all border border-white/[0.04]">
                  7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setActivePanel('ctf')}
                    className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-center font-bold text-xs transition-all cursor-pointer"
                  >
                    [LOAD IN CTF SHELL]
                  </button>
                  <button
                    onClick={() => setActivePanel('phishing')}
                    className="p-2 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-center font-bold text-xs transition-all cursor-pointer"
                  >
                    [SANDBOX ANALYSIS]
                  </button>
                </div>
              </div>
            </div>
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
          <div className="flex items-center gap-2 px-3 py-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#020304' }}>
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
          <div className="flex gap-2 px-3 pt-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {(['body', 'headers'] as const).map(t => (
              <button key={t} onClick={() => setPhishingTab(t)}
                className="font-mono text-xs px-3 py-1.5 rounded-none cursor-pointer"
                style={{
                  border: `1px solid ${phishingTab === t ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                  color: phishingTab === t ? '#22c55e' : '#94a3b8',
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
              <div className="space-y-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
                <p><span className="text-slate-500">FROM:</span> <span style={{ color: '#ef4444' }}>alerts@sbi-kyc-helpdesk.in</span> <StatusBadge label="SPF_FAIL" variant="critical" /></p>
                <p><span className="text-slate-500">TO:</span> <span className="text-slate-300">customer@domain.com</span></p>
                <p><span className="text-slate-500">SUBJECT:</span> <span style={{ color: '#f59e0b' }}>⚠ URGENT: Your SBI account will be BLOCKED in 24 hours</span></p>
                <p><span className="text-slate-500">DATE:</span> <span className="text-slate-400">Mon, 18 Nov 2024 02:14:33 +0530</span></p>
              </div>
              <div className="space-y-2 leading-relaxed font-sans">
                <p className="text-slate-300">Dear Valued Customer,</p>
                <p className="text-slate-300">We have detected <span className="px-1" style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>SUSPICIOUS ACTIVITY</span> on your account. Your account will be <span style={{ color: '#ef4444' }}>PERMANENTLY BLOCKED</span> within <span className="font-bold" style={{ color: '#f59e0b' }}>24 HOURS</span> if you do not verify your KYC.</p>
                <p><span className="text-slate-500 font-mono">Click here:</span> <a className="underline font-mono" style={{ color: '#ef4444' }}>http://sbi-kyc-update-portal.xyz/verify?ref=3847291</a></p>
                <div className="flex gap-2 mt-3 font-mono">
                  <StatusBadge label="PUNYCODE_DOMAIN" variant="critical" />
                  <StatusBadge label="URGENCY_TRIGGER" variant="warning" />
                  <StatusBadge label="CREDENTIAL_HARVEST" variant="critical" />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 font-mono text-xs space-y-2">
              <div className="space-y-0.5 text-slate-500" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                <p><span style={{ color: '#ef4444' }}>Received-SPF: fail</span> (domain of sbi-kyc-helpdesk.in does not designate 45.33.32.156 as permitted)</p>
                <p><span style={{ color: '#ef4444' }}>Authentication-Results: spf=fail; dkim=none; dmarc=fail</span></p>
                <p>X-Originating-IP: 45.33.32.156 (AS63949 - Linode LLC)</p>
                <p>X-Mailer: PHPMailer 6.1.4 (detected mass-mailer)</p>
              </div>
              <p className="text-slate-500 mt-2">HEX DUMP (first 64 bytes of body):</p>
              <pre className="text-slate-400 leading-relaxed text-xs">
{`00000000  44 65 61 72 20 56 61 6c  75 65 64 20 43 75 73 74  |Dear Valued Cust|
00000010  6f 6d 65 72 2c 20 57 65  20 68 61 76 65 20 64 65  |omer, We have de|
00000020  74 65 63 74 65 64 20 53  55 53 50 49 43 49 4f 55  |tected SUSPICIOU|
00000030  53 20 41 43 54 49 56 49  54 59 20 6f 6e 20 79 6f  |S ACTIVITY on yo|`}
              </pre>
            </div>
          )}
          <div className="px-4 py-2 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
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
              <div className="h-1.5 w-full rounded-none bg-white/[0.08]">
                <div className="h-full" style={{ width: `${(completedCards.size / FLASHCARDS.length) * 100}%`, backgroundColor: '#10b981' }} />
              </div>

              {/* Card */}
              <div className="p-5 cursor-pointer rounded-xl border border-white/[0.08] bg-[#0A0E17]" onClick={() => setFlipped(f => !f)}
                style={{ minHeight: '200px' }}>
                <div className="flex justify-between items-start mb-4">
                  <span className="font-mono text-xs font-bold" style={{ color: '#f59e0b' }}>[{card.classification}]</span>
                  <StatusBadge label={card.mitre} variant="info" />
                </div>
                {!flipped ? (
                  <div className="space-y-3 font-mono">
                    <p className="text-xs text-slate-500 tracking-widest">THREAT VECTOR</p>
                    <p className="text-lg font-bold" style={{ color: '#ef4444' }}>{card.threat}</p>
                    <p className="text-sm text-slate-300 font-sans">{card.front}</p>
                    <p className="text-xs text-slate-500 mt-4">[CLICK TO REVEAL ANSWER]</p>
                  </div>
                ) : (
                  <div className="space-y-3 font-mono">
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{card.description}</p>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">IOC INDICATORS:</p>
                      {card.indicators.map((ind, i) => <p key={i} className="text-xs" style={{ color: '#f59e0b' }}>• {ind}</p>)}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">MITIGATIONS:</p>
                      {card.mitigations.map((m, i) => <p key={i} className="text-xs" style={{ color: '#22c55e' }}>✓ {m}</p>)}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between font-mono text-xs">
                <button
                  onClick={() => { setCardIdx(i => Math.max(0, i - 1)); setFlipped(false) }}
                  disabled={cardIdx === 0}
                  className="px-3.5 py-1.5 rounded-lg border border-white/[0.1] text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                >
                  ← PREV
                </button>
                <button
                  onClick={() => { setCompletedCards(s => new Set([...s, card.id])); setCardIdx(i => Math.min(FLASHCARDS.length - 1, i + 1)); setFlipped(false) }}
                  className="px-4 py-1.5 rounded-lg font-bold cursor-pointer"
                  style={{ backgroundColor: '#10b981', color: '#050507' }}
                >
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
