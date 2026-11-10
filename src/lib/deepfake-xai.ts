import fs from 'fs'
import path from 'path'

export interface PerGeneratorRow {
  source: string
  evaluated_on: string
  is_source: boolean
  accuracy: number
  faithfulness: number
  n_eval: number
}

export interface PairwiseRow {
  source: string
  target: string
  src_faithfulness: number
  target_faithfulness: number
  CGFD: number
  src_accuracy: number
  target_accuracy: number
  accuracy_drop: number
  FADI: number
}

export interface GradcamSampleItem {
  filename: string
  generator: string
  url: string
}

export interface TestSampleItem {
  filename: string
  generator: string
  label: 'fake' | 'real'
  url: string
}

export interface DeepfakeXaiPayload {
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
}

export function getEngineRoot(): string {
  return path.join(process.cwd(), 'deepfake-xai-engine')
}

export function getEngineOutputsDir(): string {
  return path.join(getEngineRoot(), 'outputs')
}

export function getPublicXaiDir(): string {
  return path.join(process.cwd(), 'public', 'deepfake-xai')
}

function resolveOutputsBaseDir(): { dir: string; source: 'engine_outputs' | 'public_static' } {
  const engineOut = getEngineOutputsDir()
  if (fs.existsSync(path.join(engineOut, 'results_pairwise_CGFD_FADI.csv'))) {
    return { dir: engineOut, source: 'engine_outputs' }
  }
  return { dir: getPublicXaiDir(), source: 'public_static' }
}

function parseCsvLines(raw: string): Record<string, string>[] {
  const lines = raw
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim())
  return lines.slice(1).map(line => {
    const cols = line.split(',')
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      row[h] = (cols[idx] ?? '').trim()
    })
    return row
  })
}

export function loadDeepfakeXaiResults(): DeepfakeXaiPayload {
  const { dir, source } = resolveOutputsBaseDir()
  const pubDir = getPublicXaiDir()
  const cacheBust = Date.now()

  const perGenPath = path.join(dir, 'results_per_generator.csv')
  const pairwisePath = path.join(dir, 'results_pairwise_CGFD_FADI.csv')
  const summaryPath = path.join(dir, 'summary.txt')

  const perGenerator: PerGeneratorRow[] = fs.existsSync(perGenPath)
    ? parseCsvLines(fs.readFileSync(perGenPath, 'utf-8')).map(r => ({
        source: r.source,
        evaluated_on: r.evaluated_on,
        is_source: r.is_source === 'True' || r.is_source === 'true',
        accuracy: Number(r.accuracy),
        faithfulness: Number(r.faithfulness),
        n_eval: Number(r.n_eval),
      }))
    : []

  const pairwise: PairwiseRow[] = fs.existsSync(pairwisePath)
    ? parseCsvLines(fs.readFileSync(pairwisePath, 'utf-8')).map(r => ({
        source: r.source,
        target: r.target,
        src_faithfulness: Number(r.src_faithfulness),
        target_faithfulness: Number(r.target_faithfulness),
        CGFD: Number(r.CGFD),
        src_accuracy: Number(r.src_accuracy),
        target_accuracy: Number(r.target_accuracy),
        accuracy_drop: Number(r.accuracy_drop),
        FADI: Number(r.FADI),
      }))
    : []

  const summaryText = fs.existsSync(summaryPath)
    ? fs.readFileSync(summaryPath, 'utf-8')
    : ''

  const genSet = new Set<string>()
  perGenerator.forEach(r => {
    genSet.add(r.source)
    genSet.add(r.evaluated_on)
  })
  const generators = Array.from(genSet).sort()

  const gradcamDir = path.join(dir, 'gradcam_samples')
  const gradcamSamples: GradcamSampleItem[] = fs.existsSync(gradcamDir)
    ? fs
        .readdirSync(gradcamDir)
        .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
        .sort()
        .map(filename => ({
          filename,
          generator: filename.split('_')[0] || 'Unknown',
          url: `/api/deepfake-xai/asset?folder=gradcam_samples&file=${encodeURIComponent(filename)}&t=${cacheBust}`,
        }))
    : []

  const testSamplesDir = path.join(pubDir, 'test_samples')
  const testSamples: TestSampleItem[] = fs.existsSync(testSamplesDir)
    ? fs
        .readdirSync(testSamplesDir)
        .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
        .sort()
        .map(filename => {
          const parts = filename.split('_')
          const generator = parts[0] || 'Unknown'
          const label = parts[1] === 'real' ? 'real' : 'fake'
          return {
            filename,
            generator,
            label,
            url: `/deepfake-xai/test_samples/${encodeURIComponent(filename)}`,
          }
        })
    : []

  const hasCgfd = fs.existsSync(path.join(dir, 'cgfd_matrix.png'))
  const hasFadi = fs.existsSync(path.join(dir, 'fadi_matrix.png'))

  return {
    perGenerator,
    pairwise,
    summaryText,
    generators,
    gradcamSamples,
    testSamples,
    matrices: {
      cgfd: hasCgfd ? `/api/deepfake-xai/asset?file=cgfd_matrix.png&t=${cacheBust}` : null,
      fadi: hasFadi ? `/api/deepfake-xai/asset?file=fadi_matrix.png&t=${cacheBust}` : null,
    },
    sourceDir: source,
    lastUpdated: new Date().toISOString(),
  }
}

export function syncEngineOutputsToPublic(): void {
  const engineOut = getEngineOutputsDir()
  const pubDir = getPublicXaiDir()
  if (!fs.existsSync(engineOut)) return

  fs.mkdirSync(pubDir, { recursive: true })
  const rootFiles = [
    'results_per_generator.csv',
    'results_pairwise_CGFD_FADI.csv',
    'summary.txt',
    'cgfd_matrix.png',
    'fadi_matrix.png',
  ]
  for (const f of rootFiles) {
    const src = path.join(engineOut, f)
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, path.join(pubDir, f))
    }
  }

  const srcCam = path.join(engineOut, 'gradcam_samples')
  const dstCam = path.join(pubDir, 'gradcam_samples')
  if (fs.existsSync(srcCam)) {
    fs.mkdirSync(dstCam, { recursive: true })
    for (const f of fs.readdirSync(srcCam)) {
      const s = path.join(srcCam, f)
      if (fs.statSync(s).isFile()) {
        fs.copyFileSync(s, path.join(dstCam, f))
      }
    }
  }
}
