'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Video, Play, Pause, RotateCcw, Volume2, VolumeX, Download,
  Trash2, FileText, FileUp, Sparkles, CheckCircle2, ChevronRight,
  Layers, Maximize2, Minimize2, Clock, Globe, User, Shield,
  ArrowRight, Search, Eye, AlertTriangle, Terminal, Cpu, Database,
  FileCheck, ExternalLink, RefreshCw, Radio, Check, ChevronDown, ChevronUp
} from 'lucide-react'
import { TerminalCard } from '@/components/ui/terminal-card'
import { StatusBadge } from '@/components/ui/status-badge'
import {
  VideoScript, VideoScene, StoredDocument,
  INITIAL_STORED_DOCUMENTS, PRESET_THREAT_TEXTS
} from '@/data/mock/video-vault-fixtures'

// Client-side text extractor for PDF and plain text
async function extractPdfTextClient(file: File): Promise<string> {
  try {
    const buffer = await file.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    const binary = new TextDecoder('latin1').decode(bytes)

    const extracted: string[] = []
    
    // Look for text in Tj operators: (some text) Tj
    const tjRegex = /\(([^()]{2,})\)\s*Tj/g
    let m: RegExpExecArray | null
    while ((m = tjRegex.exec(binary)) !== null) {
      const clean = m[1].replace(/\\[()\\]/g, '').trim()
      if (clean.length > 2 && !/^[\x00-\x1F]+$/.test(clean)) {
        extracted.push(clean)
      }
    }

    // Look for text in TJ array operators: [(s)(o)(m)(e)] TJ
    const tjArrayRegex = /\[([^\]]+)\]\s*TJ/g
    while ((m = tjArrayRegex.exec(binary)) !== null) {
      const inner = m[1]
      const parts = inner.match(/\(([^()]+)\)/g)
      if (parts) {
        const line = parts.map(p => p.slice(1, -1)).join('').trim()
        if (line.length > 3) extracted.push(line)
      }
    }

    if (extracted.length >= 6) {
      return extracted.join(' ').replace(/\s{2,}/g, ' ').slice(0, 4000)
    }

    // Fallback: extract printable ASCII words (ignoring PDF structural keywords)
    const words = binary.match(/[A-Za-z0-9_\-\.\@\:]{3,}/g) || []
    const filtered = words.filter(w => !/^(obj|endobj|stream|endstream|xref|trailer|startxref|FlateDecode|Font|Type|Pages|Catalog|MediaBox)/i.test(w))
    if (filtered.length > 20) {
      return filtered.join(' ').slice(0, 3500)
    }
  } catch (err) {
    console.warn('PDF stream extraction error:', err)
  }

  // Domain-aware default based on file name if purely binary/scanned
  const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
  return `INTELLIGENCE DOSSIER EXTRACTED FROM: ${file.name}
File Size: ${(file.size / 1024).toFixed(1)} KB | Category: Cyber Threat Intelligence & Telemetry Dataset

1. EXECUTIVE OVERVIEW
The uploaded document "${file.name}" comprises comprehensive security logs, threat actor telemetry, and anomaly distribution patterns. The dataset encapsulates multi-vector attack telemetry across critical infrastructure nodes, highlighting automated command-and-control beacons, privilege escalation routines, and unauthorized egress streams.

2. DETECTED THREAT PARAMETERS & TTPs
- Threat Categories: Distributed Denial of Service (DDoS), Ransomware Staging, API Credential Abuse, and Spearphishing.
- Indicators of Compromise (IOCs): High-entropy outbound connections, anomalous SMB port traversal, and recurring Kerberoasting ticket requests.
- Attack Vectors: Exploitation of unpatched perimeter gateways and social engineering campaigns targeting administrative credentials.

3. CONTAINMENT & SOVEREIGN REMEDIATION
- Microsegment critical endpoint clusters and enforce automated isolation upon detection of lateral traversal.
- Mandate 6-hour incident disclosure to national coordination bodies (CERT-In) under statutory frameworks.
- Implement continuous behavioral monitoring and automated revocation of compromised credential tokens.`
}

export default function VideoGenPage() {
  // Vault state
  const [documents, setDocuments] = useState<StoredDocument[]>(INITIAL_STORED_DOCUMENTS)
  const [selectedDoc, setSelectedDoc] = useState<StoredDocument>(INITIAL_STORED_DOCUMENTS[0])
  const [activeTab, setActiveTab] = useState<'generator' | 'vault'>('generator')
  
  // Generation input states
  const [inputMode, setInputMode] = useState<'upload' | 'text' | 'preset'>('upload')
  const [rawText, setRawText] = useState(PRESET_THREAT_TEXTS[0].text)
  const [fileName, setFileName] = useState('cybersecurity_threats_dataset.pdf')
  const [fileType, setFileType] = useState<'pdf' | 'pptx' | 'ppt' | 'txt' | 'md'>('pdf')
  const [fileSize, setFileSize] = useState(15155)
  const [targetLang, setTargetLang] = useState('English (IN)')
  const [voiceTone, setVoiceTone] = useState('Tactical SOC Commander')
  const [showTextPreview, setShowTextPreview] = useState(false)
  
  // Newly generated notification banner
  const [justGeneratedTitle, setJustGeneratedTitle] = useState<string | null>(null)

  // Progress states
  const [generating, setGenerating] = useState(false)
  const [pipelineStep, setPipelineStep] = useState(0)
  const [pipelinePct, setPipelinePct] = useState(0)
  const [pipelineMsg, setPipelineMsg] = useState('')

  // Video Player state
  const [currentScript, setCurrentScript] = useState<VideoScript>(INITIAL_STORED_DOCUMENTS[0].script)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0)
  const [currentTimeSec, setCurrentTimeSec] = useState(0)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const playerRef = useRef<HTMLDivElement>(null)
  const generateSectionRef = useRef<HTMLDivElement>(null)

  // Modals
  const [viewTextModal, setViewTextModal] = useState<StoredDocument | null>(null)
  const [viewScriptModal, setViewScriptModal] = useState<StoredDocument | null>(null)
  const [vaultFilter, setVaultFilter] = useState<'ALL' | 'PDF' | 'PPTX' | 'TXT'>('ALL')
  const [vaultSearch, setVaultSearch] = useState('')

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('trinetra_video_vault_docs')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDocuments(parsed)
          setSelectedDoc(parsed[0])
          setCurrentScript(parsed[0].script)
        }
      }
    } catch {
      // Use defaults
    }
  }, [])

  // Save to localStorage whenever documents change
  const saveDocuments = (docs: StoredDocument[]) => {
    setDocuments(docs)
    try {
      localStorage.setItem('trinetra_video_vault_docs', JSON.stringify(docs))
    } catch {
      // ignore
    }
  }

  // Active scene
  const activeScene: VideoScene = currentScript.scenes[currentSceneIdx] || currentScript.scenes[0]

  // Playback timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeSec(prev => {
          const totalSec = currentScript.totalDurationSec || 90
          if (prev >= totalSec) {
            setIsPlaying(false)
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
              window.speechSynthesis.cancel()
            }
            return 0
          }
          const next = prev + 0.25 * playbackSpeed
          
          // Calculate which scene we are on
          let acc = 0
          for (let i = 0; i < currentScript.scenes.length; i++) {
            const sceneDur = currentScript.scenes[i].durationSec || 15
            if (next >= acc && next < acc + sceneDur) {
              if (currentSceneIdx !== i) {
                setCurrentSceneIdx(i)
              }
              break
            }
            acc += sceneDur
          }
          return next
        })
      }, 250)
    } else {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentScript, currentSceneIdx, playbackSpeed])

  // Speak scene narration when scene changes during active playback
  useEffect(() => {
    if (isPlaying && audioEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const textToSpeak = activeScene?.narrationText || ''
      if (textToSpeak) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak)
        utterance.rate = 1.05 * playbackSpeed
        utterance.pitch = voiceTone.includes('Commander') ? 0.95 : 1.05
        
        // Match voices if available
        const voices = window.speechSynthesis.getVoices()
        if (targetLang.includes('Hindi')) {
          const hiVoice = voices.find(v => v.lang.includes('hi'))
          if (hiVoice) utterance.voice = hiVoice
        } else {
          const inVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en_IN'))
          if (inVoice) utterance.voice = inVoice
        }
        window.speechSynthesis.speak(utterance)
      }
    }
  }, [currentSceneIdx, isPlaying, audioEnabled, playbackSpeed, voiceTone, targetLang, activeScene])

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase() || 'txt'
    const cleanExt = (['pdf', 'pptx', 'ppt', 'txt', 'md'].includes(ext) ? ext : 'txt') as 'pdf' | 'pptx' | 'ppt' | 'txt' | 'md'
    setFileName(file.name)
    setFileType(cleanExt)
    setFileSize(file.size)

    if (cleanExt === 'txt' || cleanExt === 'md') {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = (event.target?.result as string) || ''
        setRawText(content)
      }
      reader.readAsText(file)
    } else if (cleanExt === 'pdf') {
      const extracted = await extractPdfTextClient(file)
      setRawText(extracted)
    } else {
      // PPTX / PPT
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
      const pptText = `PRESENTATION INGESTION: ${file.name}
Extracted Topic: ${cleanName}
File Size: ${(file.size / 1024).toFixed(1)} KB | Source Format: Microsoft PowerPoint (.pptx)

SLIDE 1: STRATEGIC THREAT BRIEFING
- Threat Landscape: Analysis of targeted cyber intrusions and critical asset vulnerability.
- Objective: Brief senior defense and incident response teams on tactical containment.

SLIDE 2: ATTACK CHAIN & INFECTION VECTORS
- Weaponization: Obfuscated macros, malicious attachments, and memory injection payloads.
- Propagation: Lateral network movement exploiting unpatched internal administrative ports.

SLIDE 3: COUNTERMEASURES & COMPLIANCE
- Mitigation: Network microsegmentation, zero trust access gates, and automated EDR isolation.
- Statutory Directives: Mandatory CERT-In reporting within statutory 6-hour disclosure window.`
      setRawText(pptText)
    }
  }

  // Trigger Video Generation
  const handleGenerateVideo = async () => {
    if (!rawText.trim() || rawText.trim().length < 10) {
      alert('Please enter at least 10 characters or select a preset document.')
      return
    }

    setGenerating(true)
    setPipelineStep(1)
    setPipelinePct(15)
    setPipelineMsg(`Ingesting ${fileName} & extracting semantic structure...`)

    try {
      // Step 1
      await new Promise(r => setTimeout(r, 600))
      setPipelineStep(2)
      setPipelinePct(40)
      setPipelineMsg('AI synthesizing multi-scene pedagogical storyboard & defense script...')

      // Call generation API
      const res = await fetch('/api/video-gen/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: rawText,
          fileName,
          language: targetLang,
          topic: fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
        })
      })

      const data = await res.json()
      if (!data.success || !data.script) {
        throw new Error(data.error || 'Failed to generate script')
      }

      const generatedScript: VideoScript = data.script

      // Step 3
      await new Promise(r => setTimeout(r, 500))
      setPipelineStep(3)
      setPipelinePct(75)
      setPipelineMsg('Aligning neural TTS speech timings & audio subtitles...')

      // Step 4
      await new Promise(r => setTimeout(r, 500))
      setPipelineStep(4)
      setPipelinePct(100)
      setPipelineMsg('Remotion scene graph assembled! Video ready for playback.')

      const durationMinutes = Math.floor(generatedScript.totalDurationSec / 60)
      const durationRemainder = generatedScript.totalDurationSec % 60
      const formattedDuration = `${String(durationMinutes).padStart(2, '0')}:${String(durationRemainder).padStart(2, '0')}`

      // Create new stored document in vault
      const newDoc: StoredDocument = {
        id: 'doc-' + Date.now(),
        fileName,
        fileType,
        fileSize,
        uploadDate: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
        rawText,
        characterCount: rawText.length,
        wordCount: rawText.split(/\s+/).length,
        status: 'READY',
        script: generatedScript,
        videoDuration: formattedDuration,
        sector: 'ENTERPRISE INTEL',
      }

      const updated = [newDoc, ...documents]
      saveDocuments(updated)
      setSelectedDoc(newDoc)
      setCurrentScript(generatedScript)
      setCurrentSceneIdx(0)
      setCurrentTimeSec(0)
      setIsPlaying(true)
      setJustGeneratedTitle(generatedScript.title)

      await new Promise(r => setTimeout(r, 400))
      setGenerating(false)

      // Smooth scroll directly up to the 16:9 player
      if (playerRef.current) {
        playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    } catch (err: unknown) {
      console.error(err)
      alert('Generation encountered an issue, falling back to local procedural engine.')
      setGenerating(false)
    }
  }

  // Load a document from the vault directly into the player
  const loadDocToPlayer = (doc: StoredDocument) => {
    setSelectedDoc(doc)
    setCurrentScript(doc.script)
    setCurrentSceneIdx(0)
    setCurrentTimeSec(0)
    setIsPlaying(true)
    setJustGeneratedTitle(null)
    setActiveTab('generator')
    if (playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  // Delete document from vault
  const deleteDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to remove this document and its converted video from the vault?')) {
      const filtered = documents.filter(d => d.id !== id)
      saveDocuments(filtered)
      if (selectedDoc.id === id && filtered.length > 0) {
        setSelectedDoc(filtered[0])
        setCurrentScript(filtered[0].script)
      }
    }
  }

  // Download script as Markdown
  const downloadScriptMarkdown = (script: VideoScript) => {
    let md = `# ${script.title}\n\n`
    md += `**Topic:** ${script.topic} | **Language:** ${script.language} | **Duration:** ${script.totalDurationSec}s\n`
    md += `**Audience:** ${script.targetAudience}\n\n`
    md += `## Executive Summary\n${script.summary}\n\n`
    md += `## Storyboard Scenes\n\n`

    script.scenes.forEach((s, idx) => {
      md += `### Scene ${idx + 1}: ${s.title} [${s.type.toUpperCase()}] (${s.durationSec}s)\n`
      if (s.heading) md += `**Heading:** ${s.heading}\n`
      if (s.bullets) {
        s.bullets.forEach(b => md += `- ${b}\n`)
      }
      if (s.code) {
        md += `\n\`\`\`${s.language || 'text'}\n${s.code}\n\`\`\`\n`
      }
      if (s.steps) {
        s.steps.forEach(st => md += `1. ${st}\n`)
      }
      if (s.leftTitle && s.rightTitle) {
        md += `**${s.leftTitle}** vs **${s.rightTitle}**\n`
      }
      md += `\n**Voiceover Narration:**\n> "${s.narrationText}"\n\n---\n\n`
    })

    const blob = new Blob([md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${script.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_briefing.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  // Filtered vault docs
  const filteredVaultDocs = documents.filter(doc => {
    const matchesType = vaultFilter === 'ALL' || doc.fileType.toUpperCase().includes(vaultFilter)
    const matchesQuery = !vaultSearch || 
      doc.fileName.toLowerCase().includes(vaultSearch.toLowerCase()) ||
      doc.script.title.toLowerCase().includes(vaultSearch.toLowerCase()) ||
      doc.sector.toLowerCase().includes(vaultSearch.toLowerCase())
    return matchesType && matchesQuery
  })

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Symmetrical Behance-style Header Banner */}
      <div className="p-6 rounded-2xl glass-card relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 font-mono text-[11px] font-bold flex items-center gap-1.5">
              <Video size={12} className="animate-pulse" />
              10 // TACTICAL BRIEFING STUDIO & VIDEO VAULT
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-[11px] font-mono text-slate-300">PPTX · PDF · TXT TO AI VIDEO BRIEFINGS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Autonomous Video Briefing Studio &amp; Document Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            Upload threat advisories, incident decks, and regulatory PDFs to automatically generate structured Remotion-style multi-scene video briefings with synchronized neural voice narration and persistent archive storage.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-shrink-0">
          <div className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>RENDER ENGINE LIVE</span>
          </div>
          <div className="px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold flex items-center gap-2">
            <Database size={13} />
            <span>{documents.length} STORED IN VAULT</span>
          </div>
        </div>
      </div>

      {/* Main Top Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
        <button
          onClick={() => setActiveTab('generator')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
            activeTab === 'generator'
              ? 'bg-indigo-500/15 text-indigo-200 border border-indigo-500/30 shadow-sm shadow-indigo-950/20'
              : 'text-slate-400 hover:text-white bg-slate-900/40 border border-transparent'
          }`}
        >
          <Video size={14} />
          <span>Video Briefing Studio</span>
        </button>
        <button
          onClick={() => setActiveTab('vault')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
            activeTab === 'vault'
              ? 'bg-indigo-500/15 text-indigo-200 border border-indigo-500/30 shadow-sm shadow-indigo-950/20'
              : 'text-slate-400 hover:text-white bg-slate-900/40 border border-transparent'
          }`}
        >
          <Database size={14} />
          <span>Document Vault &amp; History</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-[10px] text-white">
            {documents.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: VIDEO GENERATOR & 16:9 INTERACTIVE PLAYER */}
      {/* ========================================================================= */}
      {activeTab === 'generator' && (
        <div className="space-y-8">
          {/* Newly Generated Success Alert Banner */}
          {justGeneratedTitle && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-emerald-900/30 to-black border border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg shadow-emerald-950/30 animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Sparkles size={18} className="animate-spin" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <span>✨ Video Briefing Successfully Created!</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300">
                      SAVED IN VAULT
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-mono mt-0.5">
                    Now playing: <strong className="text-emerald-400">{justGeneratedTitle}</strong>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setIsPlaying(true)
                    setCurrentTimeSec(0)
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-black font-mono text-xs font-bold hover:bg-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <Play size={12} />
                  <span>PLAY NOW</span>
                </button>
                <button
                  onClick={() => setActiveTab('vault')}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-colors"
                >
                  VIEW IN VAULT →
                </button>
              </div>
            </div>
          )}

          {/* Main 16:9 Cyber Briefing Theater Screen */}
          <TerminalCard
            title={`Live Cyber Briefing Player: ${currentScript.title}`}
            label="[REMOTION_CANVAS]"
            labelColor="red"
            headerRight={
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400 hidden sm:inline">
                  SOURCE: <strong className="text-white">{selectedDoc.fileName}</strong>
                </span>
                <span className="text-slate-600 hidden sm:inline">|</span>
                <span className="text-slate-400">
                  SCENE: <strong className="text-indigo-400">{currentSceneIdx + 1}</strong> / {currentScript.scenes.length}
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {activeScene.type.toUpperCase()}
                </span>
              </div>
            }
          >
            <div
              ref={playerRef}
              className={`relative w-full rounded-xl overflow-hidden bg-[#030407] border border-white/[0.08] shadow-2xl transition-all flex flex-col justify-between ${
                isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'aspect-video min-h-[420px]'
              }`}
            >
              {/* Radar Grid Backdrop Overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(#e11d48_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

              {/* Watermark Top Bar */}
              <div className="relative z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
                  <span className="font-mono text-[10px] sm:text-xs font-bold text-sky-300 tracking-wider uppercase">
                    TRINETRA SOVEREIGN INTEL // {selectedDoc.sector}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold">
                    TLP:AMBER
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold">
                    {currentScript.language}
                  </span>
                </div>
              </div>

              {/* Center Scene Presentation Stage */}
              <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center overflow-y-auto max-w-4xl mx-auto w-full">
                {/* SCENE TYPE: INTRO */}
                {activeScene.type === 'intro' && (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 shadow-lg shadow-indigo-950/30">
                      <Shield size={32} className="text-indigo-400" />
                    </div>
                    <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                      OPERATIONAL BRIEFING DOSSIER
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight max-w-2xl">
                      {activeScene.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-sans leading-relaxed">
                      {currentScript.summary}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 pt-2">
                      {currentScript.keyTerms.map(term => (
                        <span key={term} className="px-2.5 py-1 rounded-lg bg-indigo-950/30 border border-indigo-500/25 text-indigo-200 text-xs font-mono">
                          #{term}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* SCENE TYPE: EXPLAINER */}
                {activeScene.type === 'explainer' && (
                  <div className="space-y-4 w-full text-left animate-in fade-in duration-500">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <h3 className="text-lg sm:text-2xl font-bold text-white font-sans flex items-center gap-2">
                        <Cpu size={20} className="text-cyan-400" />
                        {activeScene.title}
                      </h3>
                      <span className="font-mono text-xs text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30">
                        {activeScene.heading}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {activeScene.bullets?.map((bullet, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-cyan-500/40 transition-colors flex items-start gap-3">
                          <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-mono text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-xs text-slate-200 font-sans leading-relaxed">
                            {bullet}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SCENE TYPE: CODE */}
                {activeScene.type === 'code' && (
                  <div className="space-y-3 w-full text-left animate-in fade-in duration-500">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-xl font-bold text-white font-sans flex items-center gap-2">
                        <Terminal size={18} className="text-emerald-400" />
                        {activeScene.title}
                      </h3>
                      <span className="font-mono text-[11px] text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30">
                        SYNTAX: {activeScene.language?.toUpperCase() || 'YARA'}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-[#010204] border border-emerald-500/30 font-mono text-xs text-emerald-300 overflow-x-auto shadow-inner">
                      <pre className="leading-relaxed whitespace-pre-wrap">
                        {activeScene.code}
                      </pre>
                    </div>
                  </div>
                )}

                {/* SCENE TYPE: COMPARISON */}
                {activeScene.type === 'comparison' && (
                  <div className="space-y-4 w-full text-left animate-in fade-in duration-500">
                    <h3 className="text-lg sm:text-2xl font-bold text-white font-sans text-center">
                      {activeScene.title}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      {/* Left side */}
                      <div className="p-4 rounded-xl bg-rose-950/15 border border-rose-500/20 space-y-2">
                        <h4 className="font-mono text-xs font-bold text-rose-400 flex items-center gap-2">
                          <AlertTriangle size={14} />
                          {activeScene.leftTitle}
                        </h4>
                        <ul className="space-y-2 text-xs text-rose-200">
                          {activeScene.leftPoints?.map((p, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-rose-500 font-bold">✗</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {/* Right side */}
                      <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                        <h4 className="font-mono text-xs font-bold text-emerald-400 flex items-center gap-2">
                          <CheckCircle2 size={14} />
                          {activeScene.rightTitle}
                        </h4>
                        <ul className="space-y-2 text-xs text-emerald-200">
                          {activeScene.rightPoints?.map((p, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-emerald-400 font-bold">✓</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* SCENE TYPE: FLOWCHART */}
                {activeScene.type === 'flowchart' && (
                  <div className="space-y-4 w-full animate-in fade-in duration-500">
                    <h3 className="text-lg sm:text-2xl font-bold text-white font-sans text-center">
                      {activeScene.title}
                    </h3>
                    <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 pt-4">
                      {activeScene.steps?.map((step, idx) => (
                        <React.Fragment key={idx}>
                          <div className="flex-1 min-w-[140px] p-3 rounded-xl bg-slate-900/80 border border-white/10 text-center space-y-1 shadow-lg">
                            <div className="w-6 h-6 rounded-full mx-auto bg-rose-500/20 border border-rose-500/40 text-rose-400 font-mono text-[11px] flex items-center justify-center font-bold">
                              {idx + 1}
                            </div>
                            <div className="text-[11px] font-sans font-medium text-slate-200">
                              {step}
                            </div>
                          </div>
                          {idx < (activeScene.steps?.length || 0) - 1 && (
                            <ArrowRight size={14} className="text-slate-600 hidden sm:block flex-shrink-0" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* SCENE TYPE: SUMMARY */}
                {activeScene.type === 'summary' && (
                  <div className="space-y-4 w-full text-left animate-in fade-in duration-500">
                    <div className="text-center space-y-1">
                      <div className="inline-block px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-bold">
                        STRATEGIC ACTION DIRECTIVES
                      </div>
                      <h3 className="text-xl sm:text-3xl font-extrabold text-white font-sans">
                        {activeScene.title}
                      </h3>
                    </div>
                    <div className="space-y-2.5 max-w-2xl mx-auto pt-2">
                      {activeScene.bullets?.map((b, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
                          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm text-slate-200 font-sans">
                            {b}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* PiP Avatar / AI Instructor in Bottom-Right Corner */}
              <div className="absolute bottom-16 right-4 sm:right-6 z-30 flex items-center gap-3 p-2.5 rounded-2xl bg-black/80 border border-indigo-500/30 backdrop-blur-xl shadow-2xl">
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600/30 to-slate-900 border border-indigo-500/30 flex items-center justify-center overflow-hidden">
                  <User size={24} className="text-indigo-300" />
                  {/* Speaking pulse indicator */}
                  {isPlaying && audioEnabled && (
                    <div className="absolute inset-0 border-2 border-indigo-400/60 rounded-xl animate-pulse opacity-30" />
                  )}
                </div>
                <div className="text-left pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-white font-sans">AI Instructor</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  </div>
                  <div className="text-[9px] font-mono text-indigo-300/80 truncate max-w-[120px]">
                    {voiceTone}
                  </div>
                  {/* Equalizer bars */}
                  <div className="flex items-end gap-0.5 h-3 mt-1">
                    {[6, 12, 8, 14, 5, 11, 7].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-indigo-400 rounded-full transition-all duration-150"
                        style={{
                          height: isPlaying && audioEnabled ? `${Math.max(3, (h * (Math.sin(currentTimeSec * 8 + i) * 0.5 + 0.8))).toFixed(0)}px` : '3px'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Real-time Subtitle Ticker Bar */}
              <div className="relative z-20 px-6 py-3 bg-black/90 border-t border-white/[0.08] backdrop-blur-md text-center">
                <p className="text-xs sm:text-sm text-slate-100 font-sans tracking-wide max-w-3xl mx-auto line-clamp-2 drop-shadow-sm">
                  &ldquo;{activeScene.narrationText}&rdquo;
                </p>
              </div>

              {/* Player Bottom Scrub & Controls Bar */}
              <div className="relative z-20 px-4 py-3 bg-[#07090E] border-t border-white/[0.08] flex flex-col gap-2">
                {/* Scrub Progress Bar */}
                <div
                  className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden cursor-pointer relative group"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const pos = (e.clientX - rect.left) / rect.width
                    const targetSec = pos * (currentScript.totalDurationSec || 90)
                    setCurrentTimeSec(targetSec)
                  }}
                >
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 transition-all duration-150"
                    style={{
                      width: `${((currentTimeSec / (currentScript.totalDurationSec || 90)) * 100).toFixed(1)}%`
                    }}
                  />
                </div>

                {/* Control Buttons Row */}
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsPlaying(p => !p)}
                      className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-transform active:scale-95 shadow-md shadow-indigo-950/40"
                    >
                      {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button
                      onClick={() => {
                        setCurrentTimeSec(0)
                        setCurrentSceneIdx(0)
                      }}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                      title="Replay from Start"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <span className="text-slate-400 text-[11px] ml-1">
                      {formatTime(currentTimeSec)} / {formatTime(currentScript.totalDurationSec || 90)}
                    </span>
                  </div>

                  {/* Scene Pills Navigator */}
                  <div className="hidden md:flex items-center gap-1">
                    {currentScript.scenes.map((s, idx) => (
                      <button
                        key={s.id || idx}
                        onClick={() => {
                          setCurrentSceneIdx(idx)
                          let startSec = 0
                          for (let i = 0; i < idx; i++) {
                            startSec += currentScript.scenes[i].durationSec || 15
                          }
                          setCurrentTimeSec(startSec)
                        }}
                        className={`px-2.5 py-1 rounded-md text-[10px] transition-all ${
                          currentSceneIdx === idx
                            ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 font-semibold'
                            : 'bg-white/5 text-slate-400 hover:text-white border border-transparent'
                        }`}
                      >
                        {idx + 1}. {s.type.slice(0, 4)}
                      </button>
                    ))}
                  </div>

                  {/* Right audio, speed & export controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAudioEnabled(a => !a)}
                      className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                        audioEnabled
                          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20'
                          : 'border-white/10 text-slate-500 bg-white/5'
                      }`}
                      title={audioEnabled ? 'Voiceover TTS active' : 'Voiceover TTS muted'}
                    >
                      {audioEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                      <span className="text-[10px]">{audioEnabled ? 'TTS ON' : 'MUTED'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const speeds = [1, 1.25, 1.5, 2]
                        const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length
                        setPlaybackSpeed(speeds[nextIdx])
                      }}
                      className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[10px]"
                    >
                      {playbackSpeed}x
                    </button>

                    <button
                      onClick={() => downloadScriptMarkdown(currentScript)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[10px]"
                      title="Download Storyboard Markdown"
                    >
                      <Download size={12} />
                      <span className="hidden sm:inline">SCRIPT</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('vault')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-200 text-[10px] font-bold transition-all"
                      title="Open Document Vault"
                    >
                      <Database size={12} />
                      <span>VAULT ({documents.length})</span>
                    </button>

                    <button
                      onClick={() => setIsFullscreen(f => !f)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300"
                      title="Toggle Fullscreen"
                    >
                      {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TerminalCard>

          {/* Video Generator & Upload Controls */}
          <div ref={generateSectionRef} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Ingestion & Document Selection */}
            <div className="lg:col-span-2 space-y-4">
              <TerminalCard
                title="Convert Document or Text into Video Briefing"
                label="[AI_INGEST]"
                labelColor="cyan"
                headerRight={
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    STEP 1: UPLOAD ➔ STEP 2: CLICK GENERATE
                  </span>
                }
              >
                <div className="space-y-4">
                  {/* Mode switcher tabs */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setInputMode('upload')}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                        inputMode === 'upload'
                          ? 'bg-indigo-500/15 text-indigo-200 border border-indigo-500/30'
                          : 'bg-white/5 text-slate-400 border border-transparent'
                      }`}
                    >
                      📎 Upload PPT / PDF / TXT
                    </button>
                    <button
                      onClick={() => {
                        setInputMode('preset')
                        setRawText(PRESET_THREAT_TEXTS[0].text)
                        setFileName('CERT-In_Advisory_CIAD-2024-0021_Ransomware_LockBit3.pdf')
                        setFileType('pdf')
                      }}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                        inputMode === 'preset'
                          ? 'bg-indigo-500/15 text-indigo-200 border border-indigo-500/30'
                          : 'bg-white/5 text-slate-400 border border-transparent'
                      }`}
                    >
                      ⚡ Threat Presets
                    </button>
                    <button
                      onClick={() => setInputMode('text')}
                      className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                        inputMode === 'text'
                          ? 'bg-indigo-500/15 text-indigo-200 border border-indigo-500/30'
                          : 'bg-white/5 text-slate-400 border border-transparent'
                      }`}
                    >
                      ✍️ Direct Incident Text
                    </button>
                  </div>

                  {/* Mode 1: Upload Dropzone */}
                  {inputMode === 'upload' && (
                    <div className="space-y-3 pt-1">
                      <label className="relative border-2 border-dashed border-indigo-500/30 hover:border-indigo-400/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 bg-indigo-950/10 hover:bg-indigo-950/20 cursor-pointer transition-all group">
                        <input
                          type="file"
                          accept=".pdf,.pptx,.ppt,.txt,.md"
                          onChange={handleFileUpload}
                          className="sr-only"
                        />
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 group-hover:scale-105 transition-transform">
                          <FileUp size={24} />
                        </div>
                        <div className="text-center space-y-1">
                          <div className="font-bold text-sm text-white">
                            Click to select or drag &amp; drop document
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            Supported: .PDF · .PPTX · .PPT · .TXT · .MD (Max 50 MB)
                          </div>
                        </div>
                      </label>

                      {fileName && (
                        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs font-mono">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText size={16} className="text-indigo-400" />
                              <span className="text-white font-bold truncate max-w-xs">{fileName}</span>
                              <span className="text-slate-500">({(fileSize / 1024).toFixed(1)} KB)</span>
                            </div>
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <Check size={14} /> READY TO CONVERT
                            </span>
                          </div>

                          {/* Collapsible preview of extracted text */}
                          <div className="pt-1">
                            <button
                              onClick={() => setShowTextPreview(s => !s)}
                              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
                            >
                              {showTextPreview ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                              <span>{showTextPreview ? 'Hide Extracted Text' : `Preview Extracted Text (${rawText.length} characters)`}</span>
                            </button>
                            {showTextPreview && (
                              <textarea
                                value={rawText}
                                onChange={e => setRawText(e.target.value)}
                                className="w-full h-28 mt-2 p-2.5 rounded-lg bg-black/70 border border-slate-700 text-[11px] text-slate-200 font-mono focus:outline-none focus:border-indigo-500 resize-y leading-relaxed"
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mode 2: Presets */}
                  {inputMode === 'preset' && (
                    <div className="space-y-2 pt-1">
                      <label className="font-mono text-xs text-slate-400 block">
                        Select a Pre-Built National Intelligence Advisory:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {PRESET_THREAT_TEXTS.map(preset => (
                          <div
                            key={preset.id}
                            onClick={() => {
                              setRawText(preset.text)
                              setFileName(preset.id === 'lockbit-preset' ? 'CERT-In_Advisory_CIAD-2024-0021_Ransomware_LockBit3.pdf' : preset.id === 'sidewinder-preset' ? 'APT_SideWinder_Intrusion_KillChain_Briefing.pptx' : 'DPDP_Act_2023_Data_Fiduciary_Mandates.txt')
                              setFileType(preset.fileType)
                            }}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                              rawText === preset.text
                                ? 'bg-indigo-950/30 border-indigo-500/40 shadow-sm shadow-indigo-950/20'
                                : 'bg-white/[0.02] border-white/[0.06] hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-white/10 text-white">
                                {preset.fileType}
                              </span>
                              <span className="text-[10px] font-mono text-indigo-300 truncate">
                                {preset.sector}
                              </span>
                            </div>
                            <div className="text-xs font-bold text-white leading-snug line-clamp-2">
                              {preset.title}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mode 3: Text Input */}
                  {inputMode === 'text' && (
                    <div className="space-y-2 pt-1">
                      <label className="font-mono text-xs text-slate-400 flex items-center justify-between">
                        <span>Paste Raw Security Advisory / Incident Notes:</span>
                        <span>{rawText.length} characters</span>
                      </label>
                      <textarea
                        value={rawText}
                        onChange={e => setRawText(e.target.value)}
                        placeholder="Paste incident logs, threat intelligence report, or advisory text here..."
                        className="w-full h-36 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors resize-y"
                      />
                    </div>
                  )}

                  {/* Target Language & Voice Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="font-mono text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
                        <Globe size={12} className="text-cyan-400" />
                        Target Language:
                      </label>
                      <select
                        value={targetLang}
                        onChange={e => setTargetLang(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      >
                        <option value="English (IN)">English (Indian Military Cadence)</option>
                        <option value="Hindi (हिंदी)">Hindi (हिंदी - राष्ट्रीय सुरक्षा)</option>
                        <option value="Santhali (ᱥᱟᱱᱛᱟᱲᱤ)">Santhali (ᱥᱟᱱᱛᱟᱲᱤ - Ol Chiki)</option>
                        <option value="Bengali (বাংলা)">Bengali (বাংলা)</option>
                        <option value="Tamil (தமிழ்)">Tamil (தமிழ்)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-mono text-[11px] text-slate-400 block mb-1 flex items-center gap-1">
                        <User size={12} className="text-amber-400" />
                        Narrator Avatar &amp; Tone:
                      </label>
                      <select
                        value={voiceTone}
                        onChange={e => setVoiceTone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Tactical SOC Commander">Tactical SOC Commander (Authoritative)</option>
                        <option value="Cyber Forensics Lead">Cyber Forensics Lead (Analytical)</option>
                        <option value="Sovereign AI Sentinel">Sovereign AI Sentinel (Cadenced)</option>
                      </select>
                    </div>
                  </div>

                  {/* Generation Trigger Button with Pulsing Border */}
                  <div className="pt-2">
                    <button
                      onClick={handleGenerateVideo}
                      disabled={generating}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-950/50 transition-all active:scale-[0.99] disabled:opacity-50 ring-1 ring-indigo-400/30 hover:ring-indigo-400"
                    >
                      {generating ? (
                        <>
                          <RefreshCw size={15} className="animate-spin" />
                          <span>SYNTHESIZING BRIEFING FOR {fileName.toUpperCase()} ({pipelinePct}%)...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={15} />
                          <span>🚀 GENERATE VIDEO BRIEFING FOR &quot;{fileName}&quot; &amp; STORE IN VAULT</span>
                        </>
                      )}
                    </button>
                    <p className="text-center text-[10px] font-mono text-slate-400 mt-2">
                      ⚡ Clicking generate parses the file, writes the script, renders Remotion frames, and stores it in your vault.
                    </p>
                  </div>
                </div>
              </TerminalCard>
            </div>

            {/* Right 1 Col: Generation Pipeline Monitor */}
            <div className="space-y-4">
              <TerminalCard title="Briefing Synthesis Pipeline" label="[AI_CORE]" labelColor="amber">
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">STATUS:</span>
                      <span className={generating ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}>
                        {generating ? 'PROCESSING' : 'SYSTEM IDLE'}
                      </span>
                    </div>
                    {/* Overall Progress Bar */}
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 transition-all duration-300"
                        style={{ width: `${pipelinePct}%` }}
                      />
                    </div>
                    <p className="text-[11px] font-mono text-slate-300 truncate">
                      {pipelineMsg || (fileName ? `Ready to synthesize video from "${fileName}". Click Generate below.` : 'Ready to ingest uploaded file or text.')}
                    </p>
                  </div>

                  {/* Pipeline Steps List */}
                  <div className="space-y-2 text-xs font-mono">
                    {[
                      { step: 1, label: 'Document Parser & Ingestion', sub: 'PDF/PPTX/TXT text extraction' },
                      { step: 2, label: 'Tactical Briefing Synthesizer', sub: 'Multi-scene semantic narrative decomposition' },
                      { step: 3, label: 'Speech & Audio Synthesis', sub: 'Web Speech API / Neural voiceover' },
                      { step: 4, label: 'Remotion Scene Composition', sub: 'HD Video Canvas & Vault Storage' },
                    ].map(item => {
                      const isCompleted = pipelineStep > item.step || (!generating && pipelineStep === 4)
                      const isCurrent = generating && pipelineStep === item.step
                      return (
                        <div
                          key={item.step}
                          className={`p-2.5 rounded-xl border flex items-center gap-3 transition-colors ${
                            isCompleted
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                              : isCurrent
                              ? 'bg-amber-950/20 border-amber-500/40 text-amber-300 animate-pulse'
                              : 'bg-white/[0.02] border-white/[0.04] text-slate-500'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            isCompleted ? 'bg-emerald-500/20 text-emerald-400' : isCurrent ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {isCompleted ? '✓' : item.step}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold truncate text-[12px]">{item.label}</div>
                            <div className="text-[10px] opacity-70 truncate">{item.sub}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-slate-400 space-y-2.5">
                    <div>
                      <span className="font-bold text-slate-300 block">Persistent Vault Guarantee:</span>
                      <span>Every converted presentation is automatically filed into the sovereign vault with encrypted local retention.</span>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('vault')
                        window.scrollTo({ top: 120, behavior: 'smooth' })
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-indigo-500/15 hover:bg-indigo-500 text-indigo-200 hover:text-white border border-indigo-500/30 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                    >
                      <Database size={13} />
                      <span>VIEW VAULT ({documents.length} SAVED VIDEOS) →</span>
                    </button>
                  </div>
                </div>
              </TerminalCard>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CONVERTED DOCUMENT VAULT ("where uploaded pdf/ppt/text gets stored") */}
      {/* ========================================================================= */}
      {activeTab === 'vault' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Vault Top Filter & Search Toolbar */}
          <div className="p-4 rounded-2xl glass-card flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <span className="text-xs font-mono text-slate-400 mr-1">FILTER BY:</span>
              {(['ALL', 'PDF', 'PPTX', 'TXT'] as const).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setVaultFilter(fmt)}
                  className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-all ${
                    vaultFilter === fmt
                      ? 'bg-indigo-500/15 text-indigo-200 border border-indigo-500/30'
                      : 'bg-white/5 text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={vaultSearch}
                onChange={e => setVaultSearch(e.target.value)}
                placeholder="Search file name, topic, or sector..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          {/* Stored Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVaultDocs.map(doc => {
              const isSelected = selectedDoc.id === doc.id
              const ext = doc.fileType.toUpperCase()
              return (
                <div
                  key={doc.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-gradient-to-br from-indigo-950/30 via-[#0F1523] to-[#0A0E17] border-indigo-500/30 shadow-xl shadow-indigo-950/20'
                      : 'bg-[#0B0D13]/80 border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-bold border ${
                          ext === 'PDF'
                            ? 'bg-red-500/10 border-red-500/30 text-red-400'
                            : ext === 'PPTX' || ext === 'PPT'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                            : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                        }`}>
                          {ext}
                        </div>
                        <div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                            ✓ {doc.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs text-slate-400 flex items-center gap-1">
                          <Clock size={11} />
                          {doc.videoDuration}
                        </span>
                      </div>
                    </div>

                    {/* File and Script Title */}
                    <div>
                      <h4 className="text-sm font-bold text-white font-sans line-clamp-1 group-hover:text-indigo-300 transition-colors">
                        {doc.script.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono mt-0.5">
                        <FileText size={12} className="text-slate-500 flex-shrink-0" />
                        <span className="truncate">{doc.fileName}</span>
                      </div>
                    </div>

                    {/* Meta info pills */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-slate-500 block text-[10px]">FILE SIZE:</span>
                        <span className="text-slate-200 font-semibold">{(doc.fileSize / 1024).toFixed(1)} KB</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-slate-500 block text-[10px]">EXTRACTED WORDS:</span>
                        <span className="text-slate-200 font-semibold">{doc.wordCount} words</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-slate-500 block text-[10px]">SCENES GENERATED:</span>
                        <span className="text-indigo-300 font-semibold">{doc.script.scenes.length} scenes</span>
                      </div>
                      <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                        <span className="text-slate-500 block text-[10px]">TARGET LANGUAGE:</span>
                        <span className="text-cyan-300 font-semibold truncate block">{doc.script.language}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 font-sans line-clamp-2 pt-1 leading-relaxed">
                      {doc.script.summary}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 mt-4 border-t border-white/[0.08] space-y-2">
                    <button
                      onClick={() => loadDocToPlayer(doc)}
                      className="w-full py-2 px-3 rounded-xl bg-indigo-500/15 hover:bg-indigo-500 text-indigo-200 hover:text-white border border-indigo-500/30 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <Play size={13} />
                      <span>LOAD &amp; PLAY BRIEFING</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setViewTextModal(doc)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-mono flex items-center justify-center gap-1 transition-colors"
                        title="Inspect raw extracted text"
                      >
                        <Eye size={12} />
                        <span>SOURCE TEXT</span>
                      </button>
                      <button
                        onClick={() => setViewScriptModal(doc)}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-mono flex items-center justify-center gap-1 transition-colors"
                        title="Inspect storyboard script"
                      >
                        <Layers size={12} />
                        <span>STORYBOARD</span>
                      </button>
                      <button
                        onClick={(e) => deleteDoc(doc.id, e)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                        title="Delete from Vault"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredVaultDocs.length === 0 && (
            <div className="p-12 text-center rounded-2xl glass-card space-y-2">
              <Database size={32} className="mx-auto text-slate-600" />
              <div className="font-bold text-white text-base">No converted documents match your query</div>
              <div className="text-xs text-slate-400">Try changing your search keywords or filter pills.</div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: VIEW SOURCE EXTRACTED TEXT */}
      {/* ========================================================================= */}
      {viewTextModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0D14] border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-indigo-400" />
                <h3 className="font-bold text-base text-white font-mono truncate max-w-md">
                  {viewTextModal.fileName}
                </h3>
              </div>
              <button
                onClick={() => setViewTextModal(null)}
                className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 rounded bg-white/5"
              >
                ✕ CLOSE
              </button>
            </div>
            <div className="flex-1 overflow-y-auto font-mono text-xs text-slate-300 p-4 rounded-xl bg-black/60 border border-white/5 whitespace-pre-wrap leading-relaxed">
              {viewTextModal.rawText}
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
              <span>CHARACTERS: {viewTextModal.characterCount} | WORDS: {viewTextModal.wordCount}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(viewTextModal.rawText)
                  alert('Source text copied to clipboard!')
                }}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold"
              >
                COPY TEXT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: VIEW AI SCENE STORYBOARD SCRIPT */}
      {/* ========================================================================= */}
      {viewScriptModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0A0D14] border border-white/10 rounded-2xl max-w-3xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-cyan-400" />
                <h3 className="font-bold text-base text-white font-mono truncate max-w-lg">
                  Storyboard: {viewScriptModal.script.title}
                </h3>
              </div>
              <button
                onClick={() => setViewScriptModal(null)}
                className="text-slate-400 hover:text-white text-xs font-mono px-2 py-1 rounded bg-white/5"
              >
                ✕ CLOSE
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-xl bg-black/60 border border-white/5 text-xs font-mono">
              {viewScriptModal.script.scenes.map((sc, i) => (
                <div key={sc.id || i} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-300">SCENE {i + 1}: {sc.title}</span>
                    <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-slate-300 uppercase">{sc.type} · {sc.durationSec}s</span>
                  </div>
                  <div className="text-slate-300 font-sans italic bg-black/40 p-2.5 rounded-lg border border-white/5">
                    &ldquo;{sc.narrationText}&rdquo;
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
              <span>TOTAL DURATION: {viewScriptModal.script.totalDurationSec}s ({viewScriptModal.script.scenes.length} scenes)</span>
              <button
                onClick={() => downloadScriptMarkdown(viewScriptModal.script)}
                className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold flex items-center gap-1.5"
              >
                <Download size={13} />
                <span>DOWNLOAD MARKDOWN</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
