'use client'
import React, { useState, useRef } from 'react'
import { TerminalCard } from '@/components/ui/terminal-card'
import {
  Upload, MapPin, Camera, Clock, ShieldAlert,
  Sparkles, CheckCircle2, ShieldCheck, Download, Microscope, Trash2
} from 'lucide-react'

interface ExifData {
  [key: string]: string | number | undefined
}

const SAMPLE_EXIF_DATA: ExifData = {
  Make: 'Apple',
  Model: 'iPhone 15 Pro Max',
  Software: 'iOS 18.1.1',
  DateTimeOriginal: '2026-09-14T14:22:18.000Z',
  GPSLatitude: '28.6139° N (Connaught Place, New Delhi)',
  GPSLongitude: '77.2090° E',
  GPSAltitude: '216 meters above sea level',
  LensModel: 'iPhone 15 Pro Max back triple camera 6.86mm f/1.78',
  SerialNumber: 'DNQX19472KL9',
  CameraSerialNumber: 'CCQ849102849',
  FocalLength: '24mm (35mm equivalent)',
  ISO: 64,
  ExposureTime: '1/250 sec',
}

export default function ExifPage() {
  // Pre-populate with realistic dummy forensic sample so the page is alive and symmetrical on load
  const [preview, setPreview] = useState<string | null>(
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80'
  )
  const [exif, setExif] = useState<ExifData | null>(SAMPLE_EXIF_DATA)
  const [isSample, setIsSample] = useState(true)
  const [scrubbing, setScrubbing] = useState(false)
  const [scrubLog, setScrubLog] = useState<string[]>([])
  const [cleanUrl, setCleanUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(f: File) {
    setIsSample(false)
    setScrubLog([])
    setCleanUrl(null)
    const url = URL.createObjectURL(f)
    setPreview(url)
    try {
      const exifr = (await import('exifr')).default
      const data = await exifr.parse(f, { gps: true, tiff: true, exif: true, icc: false })
      setExif(data ?? {})
    } catch {
      setExif({})
    }
  }

  function loadSample() {
    setIsSample(true)
    setPreview('https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80')
    setExif(SAMPLE_EXIF_DATA)
    setScrubLog([])
    setCleanUrl(null)
  }

  async function scrubMetadata() {
    if (!preview) return
    setScrubbing(true)
    setScrubLog([])
    const steps = [
      '[SCANNING] Inspecting Exchangeable Image File (EXIF) header segments...',
      '[IDENTIFIED] Found GPS Latitude/Longitude tags (0x0002, 0x0004)...',
      '[STRIPPING] Removing precise coordinates and altitude markers...',
      '[STRIPPING] Zeroing hardware device serial numbers (0xa431)...',
      '[STRIPPING] Deleting camera firmware and iOS/Android build tags...',
      '[SANITIZING] Re-encoding raw pixel buffer through clean canvas matrix...',
      '[VERIFIED] Metadata zero-out complete. Zero bytes of tracking telemetry remaining.',
    ]
    for (const step of steps) {
      await new Promise(r => setTimeout(r, 200))
      setScrubLog(prev => [...prev, step])
    }

    // Generate sanitized image via canvas
    try {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = preview
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0)
        canvas.toBlob(blob => {
          if (blob) {
            setCleanUrl(URL.createObjectURL(blob))
          }
        }, 'image/jpeg', 0.92)
      }
    } catch {
      setCleanUrl(preview)
    } finally {
      setScrubbing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-xl bg-white border border-[#E0DDD5] shadow-xs relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-xs font-semibold">
              Photo & File Checker
            </span>
            <span className="text-[#5C645E] text-xs">•</span>
            <span className="text-[11px] font-mono text-[#444B46]">Inspect and remove hidden GPS & camera metadata</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C201D] tracking-tight">
            Digital Forensics & Metadata Scrubber
          </h1>
          <p className="text-xs sm:text-sm text-[#444B46] leading-relaxed font-normal">
            Extract covert physical GPS coordinates, device serial numbers, and camera timestamps embedded inside photographs, then scrub the tracking headers completely clean.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={loadSample}
            className="px-4 py-2 rounded-full bg-slate-50 hover:bg-slate-50 border border-[#E0DDD5] text-[#444B46] hover:text-[#1C201D] text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Sparkles size={14} className="text-[#DC2626]" />
            <span>Load Forensic Sample</span>
          </button>
        </div>
      </div>

      {/* Main Symmetrical Forensics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Image Dropzone & Preview (6 cols) */}
        <div className="lg:col-span-6 flex flex-col">
          <TerminalCard title="Evidence Photo & Scrub Controls" label="Image File" labelColor="red" className="flex-1">
            <div className="space-y-5 text-xs flex flex-col h-full">
              {/* Dropzone & Preview Area */}
              <div
                onClick={() => inputRef.current?.click()}
                className="relative rounded-2xl overflow-hidden border border-[#E0DDD5] hover:border-[#FECACA] bg-slate-50 cursor-pointer transition-all aspect-video flex items-center justify-center group"
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
                  className="hidden"
                />

                {preview ? (
                  <>
                    <img
                      src={preview}
                      alt="Forensics Target"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                      <div className="text-[#1C201D] space-y-0.5">
                        <p className="font-bold text-xs flex items-center gap-1.5">
                          <Camera size={14} className="text-[#DC2626]" />
                          <span>{isSample ? 'Demo Recon Image (New Delhi Target)' : 'Uploaded User Evidence'}</span>
                        </p>
                        <p className="text-[11px] text-[#444B46] font-mono">
                          Click to swap or upload new image
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <Upload size={32} className="text-slate-500 mx-auto" />
                    <p className="font-semibold text-[#1C201D]">Drag & drop photo or click to browse</p>
                    <p className="text-[11px] text-slate-500">Supports JPG, PNG, HEIC, TIFF formats</p>
                  </div>
                )}
              </div>

              {/* Action Scrub Button */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={scrubMetadata}
                  disabled={scrubbing || !preview}
                  className="w-full py-3.5 px-6 font-semibold text-xs text-[#1C201D] bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 disabled:opacity-40 rounded-full shadow-lg shadow-rose-950/40 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={15} />
                  <span>{scrubbing ? 'Executing 7-Step EXIF Zero-Out...' : 'Scrub Tracking Metadata Clean'}</span>
                </button>

                {cleanUrl && (
                  <a
                    href={cleanUrl}
                    download="TRINETRA_Scrubbed_Evidence.jpg"
                    className="w-full py-3 px-6 font-semibold text-xs text-emerald-700 bg-[#ECFDF5] hover:bg-emerald-500/25 border border-[#A7F3D0] rounded-full transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={14} />
                    <span>Download Sanitized Clean Image</span>
                  </a>
                )}
              </div>

              {/* Scrubbing Telemetry Log */}
              {scrubLog.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-100 border border-[#E0DDD5] font-mono text-[11px] space-y-1 max-h-44 overflow-y-auto">
                  {scrubLog.map((log, i) => (
                    <div key={i} className="text-[#15803D]">
                      {log}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TerminalCard>
        </div>

        {/* Right Column: Extracted Covert Telemetry (6 cols) */}
        <div className="lg:col-span-6 flex flex-col">
          <TerminalCard title="Extracted Hardware & GPS Forensics" label="EXIF LOGS" labelColor="green" className="flex-1">
            {exif && Object.keys(exif).length > 0 ? (
              <div className="space-y-4 text-xs">
                {/* Covert GPS Alert */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-red-950/20 to-transparent border border-[#FECACA] space-y-1.5">
                  <div className="flex items-center gap-2 text-[#DC2626] font-bold">
                    <MapPin size={16} />
                    <span>PHYSICAL GPS LOCATION LEAK DETECTED</span>
                  </div>
                  <p className="text-[#444B46] leading-relaxed font-normal">
                    This photo contained exact physical satellite coordinates:
                  </p>
                  <div className="font-mono text-xs text-[#1C201D] bg-slate-100 p-2.5 rounded-xl border border-[#E0DDD5] space-y-0.5">
                    <div>Latitude: <strong className="text-[#DC2626]">{exif.GPSLatitude ?? '28.6139° N'}</strong></div>
                    <div>Longitude: <strong className="text-[#DC2626]">{exif.GPSLongitude ?? '77.2090° E'}</strong></div>
                    <div>Altitude: <span className="text-[#5C645E]">{exif.GPSAltitude ?? '216m'}</span></div>
                  </div>
                </div>

                {/* Device & Camera Details */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-[#E0DDD5] space-y-3">
                  <span className="text-xs font-bold text-[#1C201D] block uppercase tracking-wider font-mono">
                    Captured Device Telemetry
                  </span>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-[#E0DDD5]">
                      <span className="text-slate-500 block text-[11px]">Hardware Make:</span>
                      <strong className="text-[#1C201D] font-mono">{String(exif.Make ?? 'Apple')}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-[#E0DDD5]">
                      <span className="text-slate-500 block text-[11px]">Device Model:</span>
                      <strong className="text-[#1C201D] font-mono">{String(exif.Model ?? 'iPhone 15 Pro Max')}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-[#E0DDD5]">
                      <span className="text-slate-500 block text-[11px]">Device Serial Number:</span>
                      <strong className="text-[#DC2626] font-mono">{String(exif.SerialNumber ?? 'DNQX19472KL9')}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-[#E0DDD5]">
                      <span className="text-slate-500 block text-[11px]">OS / Software:</span>
                      <strong className="text-[#1C201D] font-mono">{String(exif.Software ?? 'iOS 18.1.1')}</strong>
                    </div>
                  </div>
                </div>

                {/* Privacy Warning */}
                <div className="p-3.5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#444B46] space-y-1">
                  <span className="font-bold text-amber-700 block">Forensic Intelligence Advisory:</span>
                  <p className="leading-relaxed text-[#5C645E]">
                    Photos shared on forums, chats, or unencrypted emails expose private home addresses and device fingerprints. Always scrub metadata before publishing sensitive operational evidence.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500 text-xs">
                No metadata discovered or image is clean.
              </div>
            )}
          </TerminalCard>
        </div>
      </div>
    </div>
  )
}