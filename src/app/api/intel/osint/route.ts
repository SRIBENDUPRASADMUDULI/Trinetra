import { NextResponse } from 'next/server'
import {
  degreesLat,
  degreesLong,
  eciToGeodetic,
  gstime,
  json2satrec,
  propagate,
  type OMMJsonObject,
} from 'satellite.js'

export interface OsintSatellite {
  id: string
  name: string
  noradId: number
  lat: number
  lon: number
  altKm: number
  velocityKms: number
}

export interface OsintSeismic {
  id: string
  title: string
  mag: number
  lat: number
  lon: number
  depthKm: number
  time: number
}

export interface OsintHazard {
  id: string
  title: string
  category: string
  lat: number
  lon: number
  date: string
}

export interface OsintCyberNode {
  id: string
  name: string
  lat: number
  lon: number
  kind: 'DEFENSE' | 'THREAT' | 'ADVISORY'
  detail: string
  ttps: string
}

interface OsintPayload {
  generatedAt: string
  cached: boolean
  sources: {
    celestrak: 'LIVE' | 'ERROR'
    usgs: 'LIVE' | 'ERROR'
    eonet: 'LIVE' | 'ERROR'
  }
  satellites: OsintSatellite[]
  seismic: OsintSeismic[]
  hazards: OsintHazard[]
  cyberNodes: OsintCyberNode[]
  attribution: string
}

const CACHE_TTL_MS = 60_000
let osintCache: { fetchedAt: number; payload: OsintPayload } | null = null

const CYBER_NODES: OsintCyberNode[] = [
  { id: 'DEL', name: 'New Delhi · National SOC', lat: 28.61, lon: 77.21, kind: 'DEFENSE', detail: 'CERT-In / NCIIPC Statutory Core', ttps: 'DEF CON 3 Watch' },
  { id: 'BOM', name: 'Mumbai · BFSI Payment Hub', lat: 19.07, lon: 72.87, kind: 'ADVISORY', detail: 'NPCI & Submarine Cable Landing', ttps: 'T1566.002 Spearphish' },
  { id: 'BLR', name: 'Bengaluru · Cloud & AI Corridor', lat: 12.97, lon: 77.59, kind: 'DEFENSE', detail: 'Sovereign Compute & DevSecOps Mesh', ttps: 'SAST Guard Active' },
  { id: 'HYD', name: 'Hyderabad · Telecom NOC', lat: 17.38, lon: 78.48, kind: 'ADVISORY', detail: 'SIM-Swap & Telecom Registry Monitor', ttps: 'T1078 Credential Abuse' },
  { id: 'MAA', name: 'Chennai · Bay of Bengal Cable Hub', lat: 13.08, lon: 80.27, kind: 'DEFENSE', detail: 'i2i / TIC Submarine Fiber Gateway', ttps: 'Subsea Infra Watch' },
  { id: 'SGP', name: 'Singapore · Phishing Relay', lat: 1.35, lon: 103.82, kind: 'THREAT', detail: 'Suspicious .top/.xyz Typosquat Host', ttps: 'T1583.001 Spoofed Infra' },
  { id: 'FRA', name: 'Frankfurt · Automated Scanner', lat: 50.11, lon: 8.68, kind: 'THREAT', detail: 'Exposed .env Credential Sweeps', ttps: 'T1552 Unsecured Creds' },
  { id: 'MOW', name: 'Eastern Europe · Deepfake C2', lat: 55.75, lon: 37.61, kind: 'THREAT', detail: 'Synthetic Voice & Face-Swap Lures', ttps: 'T1204 Synthetic Bait' },
]

async function fetchWithTimeout(url: string, timeoutMs = 4500): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { signal: controller.signal, cache: 'no-store' })
  } finally {
    clearTimeout(timer)
  }
}

async function fetchLiveSatellites(): Promise<{ ok: boolean; items: OsintSatellite[] }> {
  try {
    const res = await fetchWithTimeout('https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=json')
    if (!res.ok) return { ok: false, items: [] }
    const ommList = (await res.json()) as OMMJsonObject[]
    if (!Array.isArray(ommList)) return { ok: false, items: [] }

    const now = new Date()
    const gmst = gstime(now)
    const items: OsintSatellite[] = []

    for (const omm of ommList.slice(0, 16)) {
      try {
        const satrec = json2satrec(omm)
        const pv = propagate(satrec, now)
        if (!pv || !pv.position || typeof pv.position === 'boolean') continue
        const geo = eciToGeodetic(pv.position, gmst)
        const lat = Number(degreesLat(geo.latitude).toFixed(2))
        const lon = Number(degreesLong(geo.longitude).toFixed(2))
        const altKm = Math.round(geo.height)
        const vel = pv.velocity && typeof pv.velocity !== 'boolean'
          ? Math.sqrt(pv.velocity.x ** 2 + pv.velocity.y ** 2 + pv.velocity.z ** 2)
          : 7.66
        if (Number.isFinite(lat) && Number.isFinite(lon) && Number.isFinite(altKm)) {
          items.push({
            id: `SAT-${omm.NORAD_CAT_ID}`,
            name: String(omm.OBJECT_NAME || `NORAD ${omm.NORAD_CAT_ID}`).trim(),
            noradId: Number(omm.NORAD_CAT_ID),
            lat,
            lon,
            altKm,
            velocityKms: Number(vel.toFixed(2)),
          })
        }
      } catch {
        // Skip malformed orbital record
      }
    }
    return { ok: true, items }
  } catch {
    return { ok: false, items: [] }
  }
}

async function fetchLiveSeismic(): Promise<{ ok: boolean; items: OsintSeismic[] }> {
  try {
    const res = await fetchWithTimeout('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson')
    if (!res.ok) return { ok: false, items: [] }
    const data = (await res.json()) as {
      features?: Array<{
        id: string
        properties?: { title?: string; mag?: number; time?: number }
        geometry?: { coordinates?: [number, number, number] }
      }>
    }
    const features = Array.isArray(data.features) ? data.features : []
    const items: OsintSeismic[] = features
      .slice(0, 18)
      .map((f) => {
        const coords = f.geometry?.coordinates
        if (!coords || coords.length < 2) return null
        return {
          id: `EQ-${f.id}`,
          title: String(f.properties?.title || 'Seismic Event'),
          mag: Number((f.properties?.mag ?? 2.5).toFixed(1)),
          lon: Number(coords[0].toFixed(2)),
          lat: Number(coords[1].toFixed(2)),
          depthKm: Math.round(coords[2] ?? 10),
          time: Number(f.properties?.time ?? Date.now()),
        }
      })
      .filter((x): x is OsintSeismic => x !== null)
    return { ok: true, items }
  } catch {
    return { ok: false, items: [] }
  }
}

async function fetchLiveHazards(): Promise<{ ok: boolean; items: OsintHazard[] }> {
  try {
    const res = await fetchWithTimeout('https://eonet.gsfc.nasa.gov/api/v3/events?limit=10&status=open')
    if (!res.ok) return { ok: false, items: [] }
    const data = (await res.json()) as {
      events?: Array<{
        id: string
        title?: string
        categories?: Array<{ title?: string }>
        geometry?: Array<{ date?: string; coordinates?: unknown }>
      }>
    }
    const events = Array.isArray(data.events) ? data.events : []
    const items: OsintHazard[] = []
    for (const ev of events) {
      const lastGeo = ev.geometry?.[ev.geometry.length - 1]
      const coords = lastGeo?.coordinates
      if (Array.isArray(coords) && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
        items.push({
          id: `EO-${ev.id}`,
          title: String(ev.title || 'Natural Hazard'),
          category: String(ev.categories?.[0]?.title || 'Hazard'),
          lon: Number(coords[0].toFixed(2)),
          lat: Number(coords[1].toFixed(2)),
          date: String(lastGeo?.date || new Date().toISOString()),
        })
      }
    }
    return { ok: true, items }
  } catch {
    return { ok: false, items: [] }
  }
}

export async function GET() {
  const now = Date.now()
  if (osintCache && now - osintCache.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json({ ...osintCache.payload, cached: true })
  }

  const [satRes, eqRes, eoRes] = await Promise.all([
    fetchLiveSatellites(),
    fetchLiveSeismic(),
    fetchLiveHazards(),
  ])

  const payload: OsintPayload = {
    generatedAt: new Date().toISOString(),
    cached: false,
    sources: {
      celestrak: satRes.ok ? 'LIVE' : 'ERROR',
      usgs: eqRes.ok ? 'LIVE' : 'ERROR',
      eonet: eoRes.ok ? 'LIVE' : 'ERROR',
    },
    satellites: satRes.items,
    seismic: eqRes.items,
    hazards: eoRes.items,
    cyberNodes: CYBER_NODES,
    attribution: 'Adapted from bilawalsidhu/gods-eye-view (MIT) · CelesTrak · USGS · NASA EONET',
  }

  osintCache = { fetchedAt: now, payload }
  return NextResponse.json(payload)
}
