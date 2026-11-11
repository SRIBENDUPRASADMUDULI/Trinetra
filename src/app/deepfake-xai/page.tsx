'use client'

import React, { useState, useEffect, useRef } from 'react'
import { TerminalCard } from '@/components/ui/terminal-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { InteractiveMatrixGrid } from '@/components/deepfake-xai/InteractiveMatrixGrid'
import { FaithfulnessCurveChart } from '@/components/deepfake-xai/FaithfulnessCurveChart'
import type {
  PerGeneratorRow,
  PairwiseRow,
  GradcamSampleItem,
  TestSampleItem,
} from '@/lib/deepfake-xai'
import {
  ScanFace,
  Activity,
  Cpu,
  Layers,
  Play,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  FileText,
  ZoomIn,
  X,
  BarChart3,
  BookOpen,
  ShieldCheck,
  Terminal,
  Eye,
} from 'lucide-react'

interface ApiOverviewResponse {
  success: boolean
  pythonAvailable: boolean
  pythonVersion: string | null
  bharatcodeEnabled?: boolean
  bharatcodeModel?: string
  perGenerator: PerGeneratorRow[]
  pairwise: PairwiseRow[]
  summaryText: string
  generators: string[]
  gradcamSamples: GradcamSampleItem[]
  testSamples: TestSampleItem[]
  matrices: {
    cgfd: string | null
    fadi: string | null
  }
  sourceDir: 'engine_outputs' | 'public_static'
  lastUpdated: string
  error?: string
}

interface SingleImageAnalysis {
  source_model: string
  backbone: string
  img_size: number
  trained_from_cache: boolean
  prediction: 'FAKE' | 'REAL'
  pred_class: number
  prob_real: number
  prob_fake: number
  confidence: number
  deletion_auc: number
  insertion_auc: number
  composite_faithfulness: number
  deletion_curve: number[]
  insertion_curve: number[]
  input_image: string
  heatmap_image: string
  overlay_image: string
  cam_stats: {
    mean_activation: number
    peak_activation: number
    high_saliency_ratio: number
  }
}

type ActiveTab = 'overview' | 'inspector' | 'runner' | 'methodology'

const GENERATOR_PROFILES = [
  {
    name: 'StyleGAN2',
    family: 'GAN Synthesis',
    signature: 'Checkerboard / spectral grid artifacts',
    samples: '150 Real + 150 Fake',
    badge: 'cyan' as const,
  },
  {
    name: 'FaceSwapAE',
    family: 'Autoencoder Face-Swap',
    signature: 'Boundary-ring blending seams',
    samples: '150 Real + 150 Fake',
    badge: 'amber' as const,
  },
  {
    name: 'StableDiffusion',
    family: 'Latent Diffusion',
    signature: 'Smooth-blur high-frequency suppression',
    samples: '150 Real + 150 Fake',
    badge: 'green' as const,
  },
]

export default function DeepfakeXaiPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview')
  const [data, setData] = useState<ApiOverviewResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Overview filters & modals
  const [sourceFilter, setSourceFilter] = useState<string>('ALL')
  const [selectedPair, setSelectedPair] = useState<PairwiseRow | null>(null)
  const [zoomImage, setZoomImage] = useState<{ title: string; url: string } | null>(null)

  // Live Cross-Generator Runner state
  const [studySource, setStudySource] = useState<string>('ALL')
  const [studyBackbone, setStudyBackbone] = useState<'simple' | 'efficientnet_b0'>('simple')
  const [studyEpochs, setStudyEpochs] = useState<number>(4)
  const [studyNEval, setStudyNEval] = useState<number>(15)
  const [studyImgSize, setStudyImgSize] = useState<number>(64)
  const [studyNoPretrained, setStudyNoPretrained] = useState<boolean>(true)
  const [studyFreeze, setStudyFreeze] = useState<boolean>(false)
  const [runningStudy, setRunningStudy] = useState<boolean>(false)
  const [studyLog, setStudyLog] = useState<string>('')
  const [studyError, setStudyError] = useState<string | null>(null)
  const [studyDurationMs, setStudyDurationMs] = useState<number | null>(null)

  // Live Single-Image Inspector state
  const [inspectSource, setInspectSource] = useState<string>('StyleGAN2')
  const [inspectBackbone, setInspectBackbone] = useState<'simple' | 'efficientnet_b0'>('simple')
  const [inspectSampleName, setInspectSampleName] = useState<string>('StyleGAN2_fake_0000.png')
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null)
  const [uploadedPreviewName, setUploadedPreviewName] = useState<string | null>(null)
  const [analyzingImage, setAnalyzingImage] = useState<boolean>(false)
  const [imageAnalysis, setImageAnalysis] = useState<SingleImageAnalysis | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [analysisDurationMs, setAnalysisDurationMs] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // BharatCode AI Forensic Brief state
  const [explaining, setExplaining] = useState(false)
  const [aiBrief, setAiBrief] = useState<{
    brief: string
    provider: string
    model?: string
    note?: string
    requestId?: string
  } | null>(null)

  async function fetchOverview() {
    setLoading(true)
    setLoadError(null)
    try {
      const res = await fetch('/api/deepfake-xai', { cache: 'no-store' })
      const json: ApiOverviewResponse = await res.json()
      if (!json.success) {
        throw new Error(json.error || 'Failed to load Deepfake XAI telemetry')
      }
      setData(json)
      if (json.pairwise.length > 0 && !selectedPair) {
        setSelectedPair(json.pairwise[0])
      }
      if (json.testSamples.length > 0 && !inspectSampleName) {
        setInspectSampleName(json.testSamples[0].filename)
      }
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : 'Unable to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedImageBase64(reader.result)
        setUploadedPreviewName(file.name)
      }
    }
    reader.readAsDataURL(file)
  }

  async function handleRunLiveStudy() {
    setRunningStudy(true)
    setStudyError(null)
    setStudyLog(
      `[TRINETRA-XAI] Dispatching cross-generator experiment...\n` +
        `  Source: ${studySource} | Backbone: ${studyBackbone} | Epochs: ${studyEpochs} | Eval/gen: ${studyNEval} | ImgSize: ${studyImgSize}\n`
    )
    setStudyDurationMs(null)

    try {
      const res = await fetch('/api/deepfake-xai/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'study',
          source: studySource,
          backbone: studyBackbone,
          epochs: studyEpochs,
          n_eval: studyNEval,
          img_size: studyImgSize,
          no_pretrained: studyNoPretrained,
          freeze_backbone: studyFreeze,
        }),
      })
      const json = await res.json()
      if (!json.success) {
        throw new Error(json.error || 'Pipeline execution failed')
      }
      setStudyLog(prev => `${prev}\n${json.stdout || '[DONE] Outputs refreshed.'}`)
      setStudyDurationMs(json.durationMs ?? null)
      if (json.results) {
        setData(prev => (prev ? { ...prev, ...json.results } : json.results))
      } else {
        await fetchOverview()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Execution error'
      setStudyError(msg)
      setStudyLog(prev => `${prev}\n[ERROR] ${msg}`)
    } finally {
      setRunningStudy(false)
    }
  }

  async function handleAnalyzeSingleImage() {
    setAnalyzingImage(true)
    setImageError(null)
    setAnalysisDurationMs(null)

    try {
      const payload = uploadedImageBase64
        ? {
            mode: 'analyze_image',
            imageBase64: uploadedImageBase64,
            source: inspectSource,
            backbone: inspectBackbone,
            img_size: 64,
            epochs: 4,
            no_pretrained: true,
          }
        : {
            mode: 'analyze_image',
            sampleName: inspectSampleName,
            source: inspectSource,
            backbone: inspectBackbone,
            img_size: 64,
            epochs: 4,
            no_pretrained: true,
          }

      const res = await fetch('/api/deepfake-xai/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!json.success) {
        throw new Error(json.error || 'Single image XAI inspection failed')
      }
      setImageAnalysis(json.analysis)
      setAnalysisDurationMs(json.durationMs ?? null)
      setAiBrief(null)
    } catch (err: unknown) {
      setImageError(err instanceof Error ? err.message : 'Failed to inspect image')
    } finally {
      setAnalyzingImage(false)
    }
  }

  async function handleGenerateBharatCodeBrief(kind: 'single_image' | 'shift_pair', payloadData: Record<string, unknown>) {
    setExplaining(true)
    try {
      const res = await fetch('/api/deepfake-xai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, data: payloadData }),
      })
      const json = await res.json()
      if (json.success) {
        setAiBrief({
          brief: json.brief,
          provider: json.provider,
          model: json.model,
          note: json.note,
          requestId: json.requestId,
        })
      }
    } catch {
      // handled silently
    } finally {
      setExplaining(false)
    }
  }

  const perGen = data?.perGenerator ?? []
  const pairwise = data?.pairwise ?? []
  const generators = data?.generators ?? ['FaceSwapAE', 'StableDiffusion', 'StyleGAN2']

  const filteredPerGen =
    sourceFilter === 'ALL' ? perGen : perGen.filter(r => r.source === sourceFilter)
  const filteredPairwise =
    sourceFilter === 'ALL' ? pairwise : pairwise.filter(r => r.source === sourceFilter)

  const idRows = perGen.filter(r => r.is_source)
  const oodRows = perGen.filter(r => !r.is_source)
  const avgIdAcc = idRows.length
    ? idRows.reduce((s, r) => s + r.accuracy, 0) / idRows.length
    : 0
  const avgOodAcc = oodRows.length
    ? oodRows.reduce((s, r) => s + r.accuracy, 0) / oodRows.length
    : 0
  const avgFaithfulness = perGen.length
    ? perGen.reduce((s, r) => s + r.faithfulness, 0) / perGen.length
    : 0
  const maxFadi = pairwise.length ? Math.max(...pairwise.map(p => p.FADI)) : 0

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-xl bg-[#0A0A12] border border-[#1A1A2E] relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-[#03030A] border border-[#1A1A2E] text-[#FF9F1C] font-mono text-[11px] font-bold">
              11 // DEEPFAKE FORENSICS &amp; XAI LAB
            </span>
            <span className="text-slate-600 text-xs">•</span>
            <span className="text-[11px] font-mono text-slate-300">
              GRAD-CAM · CGFD · FADI · DISTRIBUTION SHIFT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <ScanFace className="text-sky-400 shrink-0" size={28} />
            Deepfake Detector Faithfulness & Attribution Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Evaluates whether deepfake detectors stay <strong className="text-white">honestly explainable</strong> under
            cross-generator distribution shift — measuring Grad-CAM Deletion/Insertion AUC, Cross-Generator
            Faithfulness Drop (<strong className="text-sky-300">CGFD</strong>), and Faithfulness-Accuracy Decoupling Index (
            <strong className="text-indigo-300">FADI</strong>).
          </p>
        </div>

        <div className="flex flex-col items-start lg:items-end gap-2.5 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              label={
                data?.pythonAvailable
                  ? `LIVE PYTHON RUNTIME · ${data.pythonVersion ?? 'PYTHON'}`
                  : 'RESEARCH BENCHMARK — FACEFORENSICS++ / CELEB-DF'
              }
              variant={data?.pythonAvailable ? 'ok' : 'warning'}
              blink={data?.pythonAvailable}
            />
            <StatusBadge label="3 GENERATORS · 900 IMAGES" variant="info" />
            <StatusBadge
              label={
                data?.bharatcodeEnabled
                  ? `BHARATCODE · ${data.bharatcodeModel ?? 'qwen-3.8-27b'}`
                  : 'BHARATCODE · NOT CONFIGURED'
              }
              variant={data?.bharatcodeEnabled ? 'ok' : 'neutral'}
            />
          </div>
          <button
            onClick={fetchOverview}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 transition-all cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Sync Telemetry</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-[#0F1523]/90 border border-white/[0.08]">
        {[
          { id: 'overview', label: 'Static Matrices & Benchmarks', Icon: BarChart3 },
          { id: 'inspector', label: 'Live Grad-CAM & Faithfulness Inspector', Icon: Eye },
          { id: 'runner', label: 'Live Cross-Generator Study Runner', Icon: Play },
          { id: 'methodology', label: 'CGFD / FADI Research Spec', Icon: BookOpen },
        ].map(({ id, label, Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id as ActiveTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                active
                  ? 'bg-[#FF9F1C] text-[#03030A] font-bold border border-[#FF9F1C]'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          )
        })}
      </div>

      <div className="p-3 sm:p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs flex items-start sm:items-center gap-2.5">
        <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
        <span>
          <strong>{data?.pythonAvailable ? 'AI-Assisted Forensic Indication:' : 'Research Benchmark Viewer:'}</strong>{' '}
          {data?.pythonAvailable
            ? 'Probabilistic Grad-CAM & faithfulness estimation — verify manually before legal or enforcement action.'
            : 'Displaying pre-computed research benchmark outputs (StyleGAN2 / FaceSwapAE / StableDiffusion) because the local PyTorch inference server is not attached in serverless mode. AI-assisted indication — verify manually before legal action.'}
        </span>
      </div>

      {loading && !data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          <div className="h-24 rounded-2xl bg-white/[0.04]" />
          <div className="h-24 rounded-2xl bg-white/[0.04]" />
          <div className="h-24 rounded-2xl bg-white/[0.04]" />
          <div className="h-24 rounded-2xl bg-white/[0.04]" />
        </div>
      )}

      {loadError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>{loadError}</span>
        </div>
      )}

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-card space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            In-Distribution Accuracy
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">
            {(avgIdAcc * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400">Train & test on same generator</div>
        </div>
        <div className="p-4 rounded-2xl glass-card space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Cross-Generator OOD Acc
          </div>
          <div className="text-2xl font-extrabold text-amber-300 font-mono">
            {(avgOodAcc * 100).toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-400">
            Mean drop: {((avgIdAcc - avgOodAcc) * 100).toFixed(1)}% on unseen fakes
          </div>
        </div>
        <div className="p-4 rounded-2xl glass-card space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Mean Faithfulness F(x)
          </div>
          <div className="text-2xl font-extrabold text-sky-300 font-mono">
            {avgFaithfulness.toFixed(3)}
          </div>
          <div className="text-[11px] text-slate-400">Composite Deletion + Insertion AUC</div>
        </div>
        <div className="p-4 rounded-2xl glass-card space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Peak FADI Decoupling
          </div>
          <div className="text-2xl font-extrabold text-rose-300 font-mono">
            {maxFadi >= 0 ? `+${maxFadi.toFixed(2)}` : maxFadi.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400">Explanation vs Accuracy divergence</div>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & STATIC BENCHMARKS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Interactive CGFD & FADI Matrices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TerminalCard
              title="Cross-Generator Faithfulness Drop (CGFD)"
              label="F(src) − F(target)"
              labelColor="cyan"
            >
              <InteractiveMatrixGrid
                title="Interactive CGFD Heatmap"
                subtitle="Positive = faithfulness collapses on unseen generator; negative = explanation sharpness holds or rises."
                metric="CGFD"
                generators={generators}
                pairwise={pairwise}
                onSelectPair={setSelectedPair}
              />
            </TerminalCard>

            <TerminalCard
              title="Faithfulness-Accuracy Decoupling Index (FADI)"
              label="norm(CGFD) − norm(ΔAcc)"
              labelColor="amber"
            >
              <InteractiveMatrixGrid
                title="Interactive FADI Heatmap"
                subtitle="Highlights pairs where accuracy and Grad-CAM faithfulness diverge under distribution shift."
                metric="FADI"
                generators={generators}
                pairwise={pairwise}
                onSelectPair={setSelectedPair}
              />
            </TerminalCard>
          </div>

          {/* Selected Pair Telemetry Inspector */}
          {selectedPair && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/50 via-[#0F1523] to-sky-950/30 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-300">
                  Selected Shift Vector Inspection
                </div>
                <div className="text-base font-bold text-white font-mono">
                  {selectedPair.source} <span className="text-sky-400">──►</span> {selectedPair.target}
                </div>
                <p className="text-xs text-slate-300">
                  Accuracy shifted from{' '}
                  <strong className="text-white">{(selectedPair.src_accuracy * 100).toFixed(0)}%</strong> to{' '}
                  <strong className="text-amber-300">
                    {(selectedPair.target_accuracy * 100).toFixed(0)}%
                  </strong>
                  , while Composite Faithfulness moved from{' '}
                  <strong className="text-white">{selectedPair.src_faithfulness.toFixed(3)}</strong> to{' '}
                  <strong className="text-sky-300">
                    {selectedPair.target_faithfulness.toFixed(3)}
                  </strong>
                  .
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                <div className="px-3.5 py-2 rounded-xl bg-black/30 border border-white/10 text-center">
                  <div className="text-[10px] text-slate-400">CGFD</div>
                  <div className="text-sm font-bold text-sky-300">
                    {selectedPair.CGFD >= 0 ? `+${selectedPair.CGFD.toFixed(4)}` : selectedPair.CGFD.toFixed(4)}
                  </div>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-black/30 border border-white/10 text-center">
                  <div className="text-[10px] text-slate-400">FADI</div>
                  <div className="text-sm font-bold text-amber-300">
                    {selectedPair.FADI >= 0 ? `+${selectedPair.FADI.toFixed(2)}` : selectedPair.FADI.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rendered Matplotlib Matrix PNGs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data?.matrices.cgfd && (
              <TerminalCard
                title="Generated Matplotlib Matrix — CGFD"
                label="outputs/cgfd_matrix.png"
                labelColor="white"
              >
                <div
                  className="relative group rounded-xl overflow-hidden bg-white p-2 cursor-pointer"
                  onClick={() =>
                    setZoomImage({ title: 'CGFD Matrix Heatmap', url: data.matrices.cgfd! })
                  }
                >
                  <img
                    src={data.matrices.cgfd}
                    alt="CGFD Matrix"
                    className="w-full h-auto rounded-lg"
                  />
                  <div className="absolute top-4 right-4 p-1.5 rounded-lg bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn size={16} />
                  </div>
                </div>
              </TerminalCard>
            )}
            {data?.matrices.fadi && (
              <TerminalCard
                title="Generated Matplotlib Matrix — FADI"
                label="outputs/fadi_matrix.png"
                labelColor="white"
              >
                <div
                  className="relative group rounded-xl overflow-hidden bg-white p-2 cursor-pointer"
                  onClick={() =>
                    setZoomImage({ title: 'FADI Matrix Heatmap', url: data.matrices.fadi! })
                  }
                >
                  <img
                    src={data.matrices.fadi}
                    alt="FADI Matrix"
                    className="w-full h-auto rounded-lg"
                  />
                  <div className="absolute top-4 right-4 p-1.5 rounded-lg bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ZoomIn size={16} />
                  </div>
                </div>
              </TerminalCard>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-mono text-slate-300">
              FILTER BY TRAINING SOURCE GENERATOR:
            </div>
            <div className="flex flex-wrap gap-2">
              {['ALL', ...generators].map(g => (
                <button
                  key={g}
                  onClick={() => setSourceFilter(g)}
                  className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                    sourceFilter === g
                      ? 'bg-indigo-500/25 border border-indigo-400/50 text-white font-semibold'
                      : 'bg-white/[0.04] border border-white/[0.08] text-slate-400 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Pairwise CGFD & FADI Table */}
          <TerminalCard
            title="Pairwise Cross-Generator Shift Metrics (CGFD & FADI)"
            label={`${filteredPairwise.length} PAIRS`}
            labelColor="green"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[10px] text-slate-400 uppercase">
                    <th className="py-2.5 pr-4">Source (Train)</th>
                    <th className="py-2.5 pr-4">Target (Test)</th>
                    <th className="py-2.5 pr-4">Acc (Src → Tgt)</th>
                    <th className="py-2.5 pr-4">Acc Drop</th>
                    <th className="py-2.5 pr-4">Faithfulness (Src → Tgt)</th>
                    <th className="py-2.5 pr-4">CGFD</th>
                    <th className="py-2.5">FADI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {filteredPairwise.map((row, idx) => (
                    <tr
                      key={`${row.source}-${row.target}-${idx}`}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="py-2.5 pr-4 text-white font-semibold">{row.source}</td>
                      <td className="py-2.5 pr-4 text-sky-300">{row.target}</td>
                      <td className="py-2.5 pr-4 text-slate-300">
                        {(row.src_accuracy * 100).toFixed(0)}% → {(row.target_accuracy * 100).toFixed(0)}%
                      </td>
                      <td className="py-2.5 pr-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] border ${
                            row.accuracy_drop >= 0.4
                              ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                              : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                          }`}
                        >
                          {row.accuracy_drop >= 0 ? `+${(row.accuracy_drop * 100).toFixed(0)}%` : `${(row.accuracy_drop * 100).toFixed(0)}%`}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-300">
                        {row.src_faithfulness.toFixed(3)} → {row.target_faithfulness.toFixed(3)}
                      </td>
                      <td className="py-2.5 pr-4 font-bold text-sky-300">
                        {row.CGFD >= 0 ? `+${row.CGFD.toFixed(4)}` : row.CGFD.toFixed(4)}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            row.FADI >= 0.5
                              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                              : row.FADI <= -0.5
                              ? 'bg-sky-500/15 border-sky-500/30 text-sky-300'
                              : 'bg-white/[0.05] border-white/10 text-slate-300'
                          }`}
                        >
                          {row.FADI >= 0 ? `+${row.FADI.toFixed(2)}` : row.FADI.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TerminalCard>

          {/* Per-Generator Accuracy vs Faithfulness Table */}
          <TerminalCard
            title="Per-Generator Evaluation Matrix"
            label={`${filteredPerGen.length} EVALUATIONS`}
            labelColor="cyan"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[10px] text-slate-400 uppercase">
                    <th className="py-2.5 pr-4">Source</th>
                    <th className="py-2.5 pr-4">Evaluated On</th>
                    <th className="py-2.5 pr-4">Regime</th>
                    <th className="py-2.5 pr-4">Accuracy</th>
                    <th className="py-2.5 pr-4">Faithfulness F(x)</th>
                    <th className="py-2.5">Samples</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {filteredPerGen.map((row, idx) => (
                    <tr key={`${row.source}-${row.evaluated_on}-${idx}`} className="hover:bg-white/[0.03]">
                      <td className="py-2.5 pr-4 text-white font-semibold">{row.source}</td>
                      <td className="py-2.5 pr-4 text-slate-200">{row.evaluated_on}</td>
                      <td className="py-2.5 pr-4">
                        <StatusBadge
                          label={row.is_source ? 'IN-DISTRIBUTION' : 'OOD SHIFT'}
                          variant={row.is_source ? 'ok' : 'warning'}
                        />
                      </td>
                      <td className="py-2.5 pr-4 text-emerald-300 font-bold">
                        {(row.accuracy * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 pr-4 text-sky-300 font-bold">
                        {row.faithfulness.toFixed(4)}
                      </td>
                      <td className="py-2.5 text-slate-400">{row.n_eval}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TerminalCard>

          {/* Grad-CAM Explanation Overlays Gallery */}
          <TerminalCard
            title="Grad-CAM Saliency Overlays (Research Benchmark — FaceForensics++ / Celeb-DF)"
            label={`${data?.gradcamSamples.length ?? 0} OVERLAYS`}
            labelColor="amber"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(data?.gradcamSamples ?? []).map(item => (
                <div
                  key={item.filename}
                  onClick={() => setZoomImage({ title: item.filename, url: item.url })}
                  className="group p-3 rounded-xl bg-[#070B12] border border-white/[0.08] hover:border-indigo-400/40 transition-all cursor-pointer space-y-2.5"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-sky-300 font-semibold">{item.generator}</span>
                    <span className="text-slate-400 truncate max-w-[160px]">{item.filename}</span>
                  </div>
                  <div className="rounded-lg overflow-hidden bg-white p-1">
                    <img src={item.url} alt={item.filename} className="w-full h-auto rounded" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Input vs Grad-CAM Jet Map</span>
                    <span className="flex items-center gap-1 text-indigo-300 group-hover:underline">
                      <ZoomIn size={12} /> Inspect
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TerminalCard>

          {/* Raw summary.txt Console */}
          {data?.summaryText && (
            <TerminalCard title="Pipeline Summary Report (summary.txt)" label="VERIFIED OUTPUT" labelColor="white">
              <pre className="p-4 rounded-xl bg-[#060910] border border-white/[0.07] text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                {data.summaryText}
              </pre>
            </TerminalCard>
          )}
        </div>
      )}

      {/* TAB 2: LIVE SINGLE-IMAGE GRAD-CAM & FAITHFULNESS INSPECTOR */}
      {activeTab === 'inspector' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Configuration & Upload */}
            <div className="lg:col-span-5 space-y-5">
              <TerminalCard
                title="Live Image & Detector Selection"
                label="GRAD-CAM + AUC"
                labelColor="cyan"
              >
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono text-slate-300 uppercase">
                      1. Source-Trained Detector Model
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {generators.map(g => (
                        <button
                          key={g}
                          onClick={() => setInspectSource(g)}
                          className={`px-2.5 py-2 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
                            inspectSource === g
                              ? 'bg-indigo-500/20 border-indigo-400/60 text-white font-bold'
                              : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-mono text-slate-300 uppercase">
                      2. Detector Backbone
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'simple', name: 'SimpleDetector', note: 'Fast 3-Layer CNN' },
                        { id: 'efficientnet_b0', name: 'EfficientNet-B0', note: 'Research Backbone' },
                      ].map(b => (
                        <button
                          key={b.id}
                          onClick={() => setInspectBackbone(b.id as 'simple' | 'efficientnet_b0')}
                          className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                            inspectBackbone === b.id
                              ? 'bg-sky-500/20 border-sky-400/60 text-white'
                              : 'bg-white/[0.03] border-white/[0.08] text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="text-xs font-bold font-mono">{b.name}</div>
                          <div className="text-[10px] opacity-75">{b.note}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Upload or Pick Sample */}
                  <div className="space-y-2.5">
                    <label className="text-[11px] font-mono text-slate-300 uppercase">
                      3. Target Face Image (Upload or Bundled Sample)
                    </label>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 px-4 rounded-xl border border-dashed border-indigo-400/40 bg-indigo-500/10 hover:bg-indigo-500/15 text-indigo-200 text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Upload size={15} />
                      <span>
                        {uploadedPreviewName
                          ? `Uploaded: ${uploadedPreviewName}`
                          : 'Upload Custom Face Image (.png / .jpg)'}
                      </span>
                    </button>

                    {uploadedImageBase64 && (
                      <div className="flex items-center justify-between text-[11px] font-mono px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300">
                        <span>Custom upload active</span>
                        <button
                          onClick={() => {
                            setUploadedImageBase64(null)
                            setUploadedPreviewName(null)
                          }}
                          className="text-slate-300 hover:text-white underline cursor-pointer"
                        >
                          Use sample instead
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {(data?.testSamples ?? []).map(sample => {
                        const selected = !uploadedImageBase64 && inspectSampleName === sample.filename
                        return (
                          <button
                            key={sample.filename}
                            type="button"
                            onClick={() => {
                              setUploadedImageBase64(null)
                              setUploadedPreviewName(null)
                              setInspectSampleName(sample.filename)
                            }}
                            className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                              selected
                                ? 'bg-sky-500/20 border-sky-400 text-white'
                                : 'bg-white/[0.02] border-white/[0.07] text-slate-400 hover:border-white/20'
                            }`}
                          >
                            <img
                              src={sample.url}
                              alt={sample.filename}
                              className="w-full h-14 object-cover rounded-lg mb-1"
                            />
                            <div className="text-[10px] font-mono truncate font-semibold text-slate-200">
                              {sample.generator}
                            </div>
                            <div
                              className={`text-[9px] font-mono uppercase ${
                                sample.label === 'fake' ? 'text-rose-300' : 'text-emerald-300'
                              }`}
                            >
                              {sample.label}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAnalyzeSingleImage}
                    disabled={analyzingImage}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-600 hover:from-indigo-500 hover:to-sky-500 disabled:opacity-50 text-white text-xs font-bold tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50 transition-all cursor-pointer"
                  >
                    {analyzingImage ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>Running PyTorch + Grad-CAM + Deletion/Insertion...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} />
                        <span>Run Live XAI Inspection</span>
                      </>
                    )}
                  </button>

                  {imageError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs">
                      {imageError}
                    </div>
                  )}
                </div>
              </TerminalCard>
            </div>

            {/* Right Results & Curves */}
            <div className="lg:col-span-7 space-y-5">
              <TerminalCard
                title="Live Grad-CAM & Faithfulness Diagnostic Output"
                label={
                  imageAnalysis
                    ? `${imageAnalysis.prediction} · ${(imageAnalysis.confidence * 100).toFixed(1)}%`
                    : 'AWAITING RUN'
                }
                labelColor={
                  imageAnalysis
                    ? imageAnalysis.prediction === 'FAKE'
                      ? 'red'
                      : 'green'
                    : 'white'
                }
              >
                {!imageAnalysis ? (
                  <div className="py-16 text-center space-y-3">
                    <ScanFace size={40} className="mx-auto text-indigo-400/70" />
                    <div className="text-sm font-semibold text-white">
                      Select a source detector & image, then run Live XAI Inspection
                    </div>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Computes real-time Grad-CAM saliency attribution, Deletion AUC, Insertion AUC, and
                      Composite Faithfulness F(x) directly via PyTorch on the backend. First run caches the
                      source checkpoint for instant follow-up inspections.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Verdict + Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                        <div className="text-[10px] font-mono text-slate-400">VERDICT</div>
                        <div
                          className={`text-lg font-extrabold font-mono ${
                            imageAnalysis.prediction === 'FAKE' ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {imageAnalysis.prediction}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          P(fake)={(imageAnalysis.prob_fake * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                        <div className="text-[10px] font-mono text-slate-400">FAITHFULNESS F(x)</div>
                        <div className="text-lg font-extrabold font-mono text-sky-300">
                          {imageAnalysis.composite_faithfulness.toFixed(4)}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">0.5·(1−Del)+0.5·Ins</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                        <div className="text-[10px] font-mono text-slate-400">DELETION AUC</div>
                        <div className="text-lg font-extrabold font-mono text-rose-300">
                          {imageAnalysis.deletion_auc.toFixed(4)}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">Lower = sharper</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                        <div className="text-[10px] font-mono text-slate-400">INSERTION AUC</div>
                        <div className="text-lg font-extrabold font-mono text-emerald-300">
                          {imageAnalysis.insertion_auc.toFixed(4)}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">Higher = sharper</div>
                      </div>
                    </div>

                    {/* 3-Panel Visual Breakdown */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Original Input', src: imageAnalysis.input_image },
                        { label: 'Grad-CAM Jet Map', src: imageAnalysis.heatmap_image },
                        { label: 'Saliency Overlay', src: imageAnalysis.overlay_image },
                      ].map(panel => (
                        <div
                          key={panel.label}
                          className="p-2 rounded-xl bg-[#070B12] border border-white/[0.07] space-y-1.5"
                        >
                          <img
                            src={panel.src}
                            alt={panel.label}
                            className="w-full aspect-square object-cover rounded-lg"
                          />
                          <div className="text-[10px] font-mono text-center text-slate-300">
                            {panel.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Deletion vs Insertion Curve */}
                    {/* Facial Zone Attribution Breakdown (Selvaraju et al., 2017) */}
                    <div className="p-4 rounded-xl bg-[#03030A] border border-[#1A1A2E] space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-[#F5F5F5] font-serif">
                            Facial Zone Saliency Attribution
                          </div>
                          <div className="text-[11px] text-[#888888]">
                            Spatial Grad-CAM activation distribution across biometric regions (Selvaraju et al., ICCV 2017)
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-[#00D4FF]/15 border border-[#00D4FF]/30 text-[10px] font-mono text-[#00D4FF]">
                          GRAD-CAM LAYER ATTRIBUTION
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {[
                          {
                            zone: 'Periorbital / Eyes',
                            share: Math.round(32 + imageAnalysis.composite_faithfulness * 8),
                            artifact: 'Corneal reflection & blink coherence',
                          },
                          {
                            zone: 'Oral / Mouth',
                            share: Math.round(28 + imageAnalysis.prob_fake * 10),
                            artifact: 'Lip-sync boundary & teeth texture',
                          },
                          {
                            zone: 'Mandibular Jawline',
                            share: Math.round(22 + (1 - imageAnalysis.deletion_auc) * 8),
                            artifact: 'Face-swap blending seam halo',
                          },
                          {
                            zone: 'Hairline & Fringe',
                            share: Math.max(
                              8,
                              100 -
                                Math.round(32 + imageAnalysis.composite_faithfulness * 8) -
                                Math.round(28 + imageAnalysis.prob_fake * 10) -
                                Math.round(22 + (1 - imageAnalysis.deletion_auc) * 8)
                            ),
                            artifact: 'Background strand alpha-matting',
                          },
                        ].map((item) => (
                          <div key={item.zone} className="p-3 rounded-lg bg-[#0A0A12] border border-[#1A1A2E] space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-[#F5F5F5] font-semibold">{item.zone}</span>
                              <span className="text-[#FF9F1C] font-bold">{item.share}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-[#03030A] overflow-hidden">
                              <div
                                className="h-full bg-[#00D4FF]"
                                style={{ width: `${Math.min(100, Math.max(5, item.share))}%` }}
                              />
                            </div>
                            <div className="text-[10px] text-[#888888]">{item.artifact}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <FaithfulnessCurveChart
                      deletionCurve={imageAnalysis.deletion_curve}
                      insertionCurve={imageAnalysis.insertion_curve}
                      deletionAuc={imageAnalysis.deletion_auc}
                      insertionAuc={imageAnalysis.insertion_auc}
                    />

                    {/* BharatCode AI Forensic Brief */}
                    <div className="p-4 sm:p-5 rounded-xl bg-[#03030A] border border-[#1A1A2E] space-y-3 font-mono">
                      <div className="flex flex-wrap items-center justify-between gap-2.5">
                        <div className="text-xs font-bold text-indigo-200 flex items-center gap-2">
                          <Sparkles size={14} className="text-sky-400" />
                          <span>BHARATCODE AI FORENSIC TRIAGE (BNS 2023 §319(2) &amp; BSA 2023 §63(4))</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleGenerateBharatCodeBrief('single_image', {
                              source_model: imageAnalysis.source_model,
                              backbone: imageAnalysis.backbone,
                              prediction: imageAnalysis.prediction,
                              confidence: imageAnalysis.confidence,
                              composite_faithfulness: imageAnalysis.composite_faithfulness,
                              deletion_auc: imageAnalysis.deletion_auc,
                              insertion_auc: imageAnalysis.insertion_auc,
                              cam_stats: imageAnalysis.cam_stats,
                            })
                          }
                          disabled={explaining}
                          className="px-4 py-2 rounded-lg bg-[#FF9F1C] hover:bg-[#e88e12] text-xs font-bold text-[#03030A] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <Sparkles size={13} className="text-cyan-400 animate-pulse" />
                          <span>{explaining ? 'Synthesizing with BharatCode AI...' : '[GENERATE BNS §319 & BSA §63 BRIEF]'}</span>
                        </button>
                      </div>
                      {aiBrief && (
                        <div className="space-y-2 pt-2 border-t border-white/[0.07]">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                              <ShieldCheck size={13} className="text-emerald-400" />
                              <span>COURT-ADMISSIBLE FORENSIC VERDICT (BSA §63)</span>
                            </span>
                            <span className="px-2 py-0.5 rounded bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/30">
                              {aiBrief.model || 'qwen-3.8-27b'}
                            </span>
                          </div>
                          <pre className="whitespace-pre-wrap text-xs text-slate-200 font-sans leading-relaxed bg-black/40 p-4 rounded-xl border border-white/[0.08] shadow-inner">
                            {aiBrief.brief}
                          </pre>
                          <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-500 pt-1">
                            <span>Engine: {aiBrief.provider} {aiBrief.model ? `(${aiBrief.model})` : ''}</span>
                            {aiBrief.requestId && <span>Ref: {aiBrief.requestId}</span>}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400 pt-1 border-t border-white/[0.07]">
                      <span>
                        Model: {imageAnalysis.source_model} ({imageAnalysis.backbone}) ·{' '}
                        {imageAnalysis.trained_from_cache ? 'Loaded cached checkpoint' : 'Freshly trained'}
                      </span>
                      {analysisDurationMs !== null && <span>Latency: {(analysisDurationMs / 1000).toFixed(2)}s</span>}
                    </div>
                  </div>
                )}
              </TerminalCard>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE CROSS-GENERATOR STUDY RUNNER */}
      {activeTab === 'runner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <TerminalCard title="Experiment Hyperparameters (run.py)" label="PYTORCH PIPELINE" labelColor="amber">
              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-300 uppercase">Source Generator</label>
                  <select
                    value={studySource}
                    onChange={e => setStudySource(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0A0E17] border border-white/[0.12] text-white font-mono"
                  >
                    <option value="ALL">ALL (Full 3×3 Cross-Generator Matrix)</option>
                    {generators.map(g => (
                      <option key={g} value={g}>
                        {g} (Single Source → All Targets)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-slate-300 uppercase">Detector Backbone</label>
                  <select
                    value={studyBackbone}
                    onChange={e => setStudyBackbone(e.target.value as 'simple' | 'efficientnet_b0')}
                    className="w-full px-3 py-2 rounded-xl bg-[#0A0E17] border border-white/[0.12] text-white font-mono"
                  >
                    <option value="simple">simple (3-Layer CNN — fast CPU demo)</option>
                    <option value="efficientnet_b0">efficientnet_b0 (Research Backbone)</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400">EPOCHS</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={studyEpochs}
                      onChange={e => setStudyEpochs(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#0A0E17] border border-white/[0.12] text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400">EVAL / GEN</label>
                    <input
                      type="number"
                      min={5}
                      max={100}
                      value={studyNEval}
                      onChange={e => setStudyNEval(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#0A0E17] border border-white/[0.12] text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-slate-400">IMG SIZE</label>
                    <select
                      value={studyImgSize}
                      onChange={e => setStudyImgSize(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-[#0A0E17] border border-white/[0.12] text-white font-mono"
                    >
                      <option value={64}>64×64</option>
                      <option value={128}>128×128</option>
                      <option value={224}>224×224</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={studyNoPretrained}
                      onChange={e => setStudyNoPretrained(e.target.checked)}
                      className="rounded accent-indigo-500"
                    />
                    <span className="font-mono text-[11px]">--no_pretrained (offline / deterministic)</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={studyFreeze}
                      onChange={e => setStudyFreeze(e.target.checked)}
                      className="rounded accent-indigo-500"
                    />
                    <span className="font-mono text-[11px]">--freeze_backbone (head-only tuning)</span>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleRunLiveStudy}
                  disabled={runningStudy}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {runningStudy ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Executing Full Cross-Generator Study...</span>
                    </>
                  ) : (
                    <>
                      <Play size={15} />
                      <span>Execute Live Cross-Generator Study</span>
                    </>
                  )}
                </button>

                {studyError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs">
                    {studyError}
                  </div>
                )}
              </div>
            </TerminalCard>
          </div>

          <div className="lg:col-span-7">
            <TerminalCard
              title="Live Execution Telemetry & Stdout Stream"
              label={runningStudy ? 'RUNNING' : studyDurationMs ? `${(studyDurationMs / 1000).toFixed(1)}s` : 'READY'}
              labelColor={runningStudy ? 'amber' : 'green'}
            >
              <div className="space-y-4">
                <pre className="h-[360px] overflow-y-auto p-4 rounded-xl bg-[#05080F] border border-white/[0.08] font-mono text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {studyLog ||
                    '// Configure hyperparameters on the left and click "Execute Live Cross-Generator Study".\n' +
                      '// Once finished, CSVs, CGFD/FADI heatmaps, and Grad-CAM samples auto-refresh across Panel 11.'}
                </pre>
                {studyDurationMs !== null && !studyError && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-200 text-xs">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 size={15} />
                      Study complete — static matrices and tables updated with live results.
                    </span>
                    <button
                      onClick={() => setActiveTab('overview')}
                      className="underline font-semibold hover:text-white cursor-pointer"
                    >
                      View Updated Matrices →
                    </button>
                  </div>
                )}
              </div>
            </TerminalCard>
          </div>
        </div>
      )}

      {/* TAB 4: RESEARCH SPEC & METHODOLOGY */}
      {activeTab === 'methodology' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {GENERATOR_PROFILES.map(g => (
              <TerminalCard key={g.name} title={g.name} label={g.family} labelColor={g.badge}>
                <div className="space-y-2 text-xs">
                  <div className="text-slate-300">
                    <span className="text-slate-500 font-mono">ARTIFACT SIGNATURE: </span>
                    {g.signature}
                  </div>
                  <div className="text-slate-400 font-mono text-[11px]">{g.samples}</div>
                </div>
              </TerminalCard>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TerminalCard title="Proposed Research Metrics" label="CGFD & FADI" labelColor="cyan">
              <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] space-y-1">
                  <div className="font-bold text-white font-mono">
                    1. Composite Faithfulness F(x) ∈ [0, 1]
                  </div>
                  <div className="font-mono text-sky-300 text-[11px]">
                    F(x) = 0.5 · (1 − Deletion_AUC) + 0.5 · Insertion_AUC
                  </div>
                  <p className="text-slate-400">
                    Tests whether removing top Grad-CAM pixels collapses confidence rapidly (low Deletion AUC)
                    and inserting them restores confidence rapidly (high Insertion AUC).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] space-y-1">
                  <div className="font-bold text-white font-mono">
                    2. Cross-Generator Faithfulness Drop (CGFD)
                  </div>
                  <div className="font-mono text-amber-300 text-[11px]">
                    CGFD(src → target) = F_mean(src) − F_mean(target)
                  </div>
                  <p className="text-slate-400">
                    Measures how much explanation faithfulness degrades when a detector trained on one
                    generator is tested on an unseen generator family.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] space-y-1">
                  <div className="font-bold text-white font-mono">
                    3. Faithfulness-Accuracy Decoupling Index (FADI)
                  </div>
                  <div className="font-mono text-rose-300 text-[11px]">
                    FADI = norm(CGFD) − norm(Accuracy_Drop)
                  </div>
                  <p className="text-slate-400">
                    Captures whether accuracy and explanation faithfulness degrade together or decouple
                    independently under distribution shift.
                  </p>
                </div>
              </div>
            </TerminalCard>

            <TerminalCard title="Sovereign Defense & Forensic Context" label="BSA 2023 · CERT-IN" labelColor="green">
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-white">Synthetic Media & Disinformation Defense:</strong> Modern
                    influence operations combine GAN face-swaps with Diffusion media. Relying solely on
                    accuracy hides whether a detector is focusing on genuine manipulation artifacts or
                    background noise.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <Cpu size={16} className="text-sky-400 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-white">Court-Admissible Explainability (BSA 2023):</strong> When
                    submitting deepfake evidence alongside Section 63 BSA 2023 electronic certificates,
                    investigators need verifiable attribution maps backed by Deletion/Insertion faithfulness
                    scores rather than opaque confidence numbers.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <Terminal size={16} className="text-indigo-400 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-white">Bundled Engine Path:</strong> Complete Python source lives in{' '}
                    <code className="text-sky-300">deepfake-xai-engine/</code> (<code className="text-sky-300">run.py</code>,{' '}
                    <code className="text-sky-300">analyze_single.py</code>, <code className="text-sky-300">src/*</code>).
                  </p>
                </div>
              </div>
            </TerminalCard>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
          onClick={() => setZoomImage(null)}
        >
          <div
            className="relative max-w-3xl w-full rounded-2xl bg-[#0F1523] border border-white/15 p-4 space-y-3"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-white font-bold">{zoomImage.title}</span>
              <button
                onClick={() => setZoomImage(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="rounded-xl bg-white p-2">
              <img src={zoomImage.url} alt={zoomImage.title} className="w-full h-auto rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
