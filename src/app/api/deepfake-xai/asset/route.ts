import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getEngineOutputsDir, getPublicXaiDir } from '@/lib/deepfake-xai'

const ALLOWED_ROOT_FILES = new Set(['cgfd_matrix.png', 'fadi_matrix.png'])

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const file = searchParams.get('file') || ''
  const folder = searchParams.get('folder') || ''

  if (!file) {
    return NextResponse.json({ error: 'Missing file parameter' }, { status: 400 })
  }

  const safeName = path.basename(file)
  let relPath = ''

  if (folder === 'gradcam_samples' && /\.(png|jpg|jpeg)$/i.test(safeName)) {
    relPath = path.join('gradcam_samples', safeName)
  } else if (ALLOWED_ROOT_FILES.has(safeName)) {
    relPath = safeName
  } else {
    return NextResponse.json({ error: 'Asset not allowed' }, { status: 403 })
  }

  const candidates = [
    path.join(getEngineOutputsDir(), relPath),
    path.join(getPublicXaiDir(), relPath),
  ]

  for (const target of candidates) {
    if (fs.existsSync(target) && fs.statSync(target).isFile()) {
      const buf = fs.readFileSync(target)
      return new NextResponse(buf, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-store, max-age=0',
        },
      })
    }
  }

  return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
}
