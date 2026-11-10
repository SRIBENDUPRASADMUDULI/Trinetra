import { NextRequest, NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import os from 'os'
import path from 'path'
import {
  getEngineRoot,
  getPublicXaiDir,
  loadDeepfakeXaiResults,
  syncEngineOutputsToPublic,
} from '@/lib/deepfake-xai'

const execFileAsync = promisify(execFile)

async function resolvePythonBin(): Promise<string | null> {
  for (const cmd of ['python', 'python3']) {
    try {
      await execFileAsync(cmd, ['--version'], { timeout: 3000 })
      return cmd
    } catch {
      // try next
    }
  }
  return null
}

const VALID_BACKBONES = new Set(['simple', 'efficientnet_b0'])

export async function POST(req: NextRequest) {
  const start = Date.now()
  try {
    const body = await req.json()
    const mode = body.mode as 'study' | 'analyze_image'
    const engineRoot = getEngineRoot()

    if (!fs.existsSync(engineRoot)) {
      return NextResponse.json(
        { success: false, error: 'deepfake-xai-engine directory not found on server.' },
        { status: 404 }
      )
    }

    const pythonBin = await resolvePythonBin()
    if (!pythonBin) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Python runtime not detected on server host. Static baseline results remain available; run locally with Python + PyTorch for live execution.',
        },
        { status: 503 }
      )
    }

    if (mode === 'study') {
      const source = typeof body.source === 'string' && body.source !== 'ALL' ? body.source : null
      const backbone = VALID_BACKBONES.has(body.backbone) ? body.backbone : 'simple'
      const epochs = Math.min(20, Math.max(1, Number(body.epochs) || 4))
      const nEval = Math.min(100, Math.max(5, Number(body.n_eval) || 15))
      const imgSize = [64, 128, 224].includes(Number(body.img_size)) ? Number(body.img_size) : 64
      const noPretrained = Boolean(body.no_pretrained)
      const freezeBackbone = Boolean(body.freeze_backbone)

      const args = [
        path.join(engineRoot, 'run.py'),
        '--backbone',
        backbone,
        '--epochs',
        String(epochs),
        '--n_eval',
        String(nEval),
        '--img_size',
        String(imgSize),
      ]
      if (source) {
        args.push('--source', source)
      }
      if (noPretrained) {
        args.push('--no_pretrained')
      }
      if (freezeBackbone) {
        args.push('--freeze_backbone')
      }

      const { stdout, stderr } = await execFileAsync(pythonBin, args, {
        cwd: engineRoot,
        timeout: 300_000,
        maxBuffer: 10 * 1024 * 1024,
      })

      syncEngineOutputsToPublic()
      const results = loadDeepfakeXaiResults()

      return NextResponse.json({
        success: true,
        mode: 'study',
        durationMs: Date.now() - start,
        stdout,
        stderr,
        results,
      })
    }

    if (mode === 'analyze_image') {
      const source = typeof body.source === 'string' ? body.source : 'StyleGAN2'
      const backbone = VALID_BACKBONES.has(body.backbone) ? body.backbone : 'simple'
      const imgSize = [64, 128, 224].includes(Number(body.img_size)) ? Number(body.img_size) : 64
      const epochs = Math.min(12, Math.max(1, Number(body.epochs) || 4))
      const nSteps = Math.min(20, Math.max(5, Number(body.n_steps) || 10))
      const noPretrained = body.no_pretrained !== false

      let tempFilePath: string | null = null
      let targetImagePath = ''

      try {
        if (typeof body.imageBase64 === 'string' && body.imageBase64.startsWith('data:image/')) {
          const match = body.imageBase64.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/i)
          if (!match) {
            return NextResponse.json({ success: false, error: 'Invalid base64 image payload.' }, { status: 400 })
          }
          const ext = match[1].toLowerCase() === 'jpeg' ? 'jpg' : match[1].toLowerCase()
          const buf = Buffer.from(match[2], 'base64')
          tempFilePath = path.join(os.tmpdir(), `trinetra_xai_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`)
          fs.writeFileSync(tempFilePath, buf)
          targetImagePath = tempFilePath
        } else if (typeof body.sampleName === 'string' && body.sampleName.trim()) {
          const safeSample = path.basename(body.sampleName.trim())
          const candidate = path.join(getPublicXaiDir(), 'test_samples', safeSample)
          if (!fs.existsSync(candidate)) {
            return NextResponse.json({ success: false, error: 'Selected sample image not found.' }, { status: 404 })
          }
          targetImagePath = candidate
        } else {
          return NextResponse.json(
            { success: false, error: 'Provide either an uploaded image or a sampleName.' },
            { status: 400 }
          )
        }

        const args = [
          path.join(engineRoot, 'analyze_single.py'),
          '--image',
          targetImagePath,
          '--source',
          source,
          '--backbone',
          backbone,
          '--img_size',
          String(imgSize),
          '--epochs',
          String(epochs),
          '--n_steps',
          String(nSteps),
        ]
        if (noPretrained) {
          args.push('--no_pretrained')
        }

        const { stdout } = await execFileAsync(pythonBin, args, {
          cwd: engineRoot,
          timeout: 180_000,
          maxBuffer: 10 * 1024 * 1024,
        })

        const lines = stdout.trim().split(/\r?\n/)
        const jsonLine = lines[lines.length - 1]
        const analysis = JSON.parse(jsonLine)

        return NextResponse.json({
          success: true,
          mode: 'analyze_image',
          durationMs: Date.now() - start,
          analysis,
        })
      } finally {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath)
        }
      }
    }

    return NextResponse.json({ success: false, error: 'Unsupported mode.' }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Execution failed'
    return NextResponse.json(
      { success: false, error: message, durationMs: Date.now() - start },
      { status: 500 }
    )
  }
}
