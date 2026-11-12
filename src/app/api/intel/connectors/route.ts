import { NextRequest, NextResponse } from 'next/server'
import { env, features } from '@/lib/env'

export interface ConnectorIoc {
  id: string
  type: string
  value: string
  category: string
  source: 'MISP' | 'ABUSE_CH_FEODO' | 'FALLBACK'
  firstSeen?: string
}

export interface OpsHealthSnapshot {
  source: 'NETDATA' | 'SERVERLESS_RUNTIME'
  status: 'ONLINE' | 'DEGRADED'
  cpuPercent?: number
  ramUsedMb: number
  uptimeSec: number
  hostname: string
}

export interface DomainOsintResult {
  domain: string
  aRecords: string[]
  mxRecords: string[]
  txtRecords: string[]
  registrar?: string
  createdAt?: string
  expiresAt?: string
  rdapStatus?: string[]
  spiderfootActive: boolean
  sourcesUsed: string[]
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 4500): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal, cache: 'no-store' })
  } finally {
    clearTimeout(timer)
  }
}

async function fetchThreatIocs(): Promise<{ source: string; iocs: ConnectorIoc[] }> {
  if (features.mispEnabled) {
    try {
      const base = env.MISP_URL.replace(/\/+$/, '')
      const res = await fetchWithTimeout(`${base}/attributes/restSearch`, {
        method: 'POST',
        headers: {
          Authorization: env.MISP_API_KEY,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ returnFormat: 'json', limit: 10, enforceWarninglist: true }),
      })
      if (res.ok) {
        const data = (await res.json()) as {
          response?: { Attribute?: Array<{ id?: string; type?: string; value?: string; category?: string; timestamp?: string }> }
        }
        const attrs = data.response?.Attribute ?? []
        if (attrs.length > 0) {
          return {
            source: 'MISP',
            iocs: attrs.slice(0, 10).map((a, idx) => ({
              id: String(a.id ?? idx),
              type: String(a.type ?? 'ioc'),
              value: String(a.value ?? ''),
              category: String(a.category ?? 'Network activity'),
              source: 'MISP',
              firstSeen: a.timestamp ? new Date(Number(a.timestamp) * 1000).toISOString().slice(0, 10) : undefined,
            })),
          }
        }
      }
    } catch {
      // Fall through to Abuse.ch public IOC feed
    }
  }

  try {
    const res = await fetchWithTimeout('https://feodotracker.abuse.ch/downloads/ipblocklist_recommended.json')
    if (res.ok) {
      const list = (await res.json()) as Array<{
        ip_address?: string
        port?: number
        malware?: string
        first_seen?: string
        country?: string
      }>
      if (Array.isArray(list) && list.length > 0) {
        return {
          source: 'Abuse.ch Feodo Tracker (Public IOC Feed)',
          iocs: list.slice(0, 8).map((item, idx) => ({
            id: `feodo-${idx}`,
            type: 'ip-dst|port',
            value: `${item.ip_address ?? 'unknown'}:${item.port ?? 443}`,
            category: `${item.malware ?? 'Botnet C2'}${item.country ? ` (${item.country})` : ''}`,
            source: 'ABUSE_CH_FEODO',
            firstSeen: item.first_seen?.slice(0, 10),
          })),
        }
      }
    }
  } catch {
    // Graceful empty fallback
  }

  return { source: 'Unavailable (Offline)', iocs: [] }
}

async function fetchOpsHealth(): Promise<OpsHealthSnapshot> {
  const mem = process.memoryUsage()
  const ramUsedMb = Math.round(mem.rss / (1024 * 1024))
  const uptimeSec = Math.round(process.uptime())

  if (features.netdataEnabled) {
    try {
      const base = env.NETDATA_URL.replace(/\/+$/, '')
      const [infoRes, cpuRes] = await Promise.all([
        fetchWithTimeout(`${base}/api/v1/info`),
        fetchWithTimeout(`${base}/api/v1/data?chart=system.cpu&after=-60&points=1&format=json`),
      ])
      if (infoRes.ok) {
        const info = (await infoRes.json()) as { hostname?: string }
        let cpuPercent: number | undefined
        if (cpuRes.ok) {
          const cpuJson = (await cpuRes.json()) as { data?: number[][] }
          const row = cpuJson.data?.[0]
          if (Array.isArray(row) && row.length > 1) {
            const sum = row.slice(1).reduce((acc, v) => acc + (typeof v === 'number' ? v : 0), 0)
            cpuPercent = Number(Math.min(100, sum).toFixed(1))
          }
        }
        return {
          source: 'NETDATA',
          status: 'ONLINE',
          cpuPercent,
          ramUsedMb,
          uptimeSec,
          hostname: info.hostname || 'netdata-node',
        }
      }
    } catch {
      // Fall back to runtime telemetry
    }
  }

  return {
    source: 'SERVERLESS_RUNTIME',
    status: 'ONLINE',
    ramUsedMb,
    uptimeSec,
    hostname: 'trinetra-nextjs-runtime',
  }
}

export interface LiveThreatFeedItem {
  id: string
  timestamp: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM'
  sector: 'CRITICAL' | 'FINANCE' | 'TELECOM' | 'GOVT' | 'CLOUD'
  attackType: string
  status: 'ACTIVE' | 'INVESTIGATING'
  source: string
}

export async function GET() {
  const [intel, ops, kevRes] = await Promise.all([
    fetchThreatIocs(),
    fetchOpsHealth(),
    fetchWithTimeout('https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json', {}, 4500)
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null) as Promise<{
        vulnerabilities?: Array<{
          cveID?: string
          vendorProject?: string
          product?: string
          vulnerabilityName?: string
          dateAdded?: string
          knownRansomwareCampaignUse?: string
        }>
      } | null>,
  ])

  const liveFeed: LiveThreatFeedItem[] = []
  const nowIso = new Date().toISOString()

  if (kevRes?.vulnerabilities?.length) {
    const recent = kevRes.vulnerabilities.slice(-8).reverse()
    for (const v of recent) {
      liveFeed.push({
        id: String(v.cveID || Math.random()),
        timestamp: v.dateAdded ? `${v.dateAdded}T00:00:00Z` : nowIso,
        severity: v.knownRansomwareCampaignUse === 'Known' ? 'CRITICAL' : 'HIGH',
        sector: 'CRITICAL',
        attackType: `${v.cveID}: ${v.vendorProject ?? ''} ${v.product ?? ''} — ${v.vulnerabilityName ?? 'Exploited Vulnerability'}`.trim(),
        status: 'ACTIVE',
        source: 'CISA KEV',
      })
    }
  }

  for (const ioc of intel.iocs.slice(0, 8)) {
    liveFeed.push({
      id: ioc.id,
      timestamp: ioc.firstSeen ? `${ioc.firstSeen}T00:00:00Z` : nowIso,
      severity: 'HIGH',
      sector: 'FINANCE',
      attackType: `${ioc.source === 'MISP' ? 'MISP IOC' : 'C2 Botnet'} ${ioc.value} (${ioc.category})`,
      status: 'INVESTIGATING',
      source: ioc.source,
    })
  }

  return NextResponse.json({
    success: true,
    generatedAt: nowIso,
    connectors: {
      misp: features.mispEnabled ? 'CONFIGURED' : 'PUBLIC_FALLBACK',
      netdata: features.netdataEnabled ? 'CONFIGURED' : 'RUNTIME_FALLBACK',
      spiderfoot: features.spiderfootEnabled ? 'CONFIGURED' : 'SERVERLESS_DNS_RDAP',
      huggingface: features.hfInferenceEnabled ? 'CONFIGURED' : 'NOT_CONFIGURED',
    },
    intelSource: intel.source,
    iocs: intel.iocs,
    liveFeed,
    ops,
  })
}

async function resolveDnsType(domain: string, type: 'A' | 'MX' | 'TXT'): Promise<string[]> {
  try {
    const res = await fetchWithTimeout(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`,
      {},
      3500
    )
    if (!res.ok) return []
    const data = (await res.json()) as { Answer?: Array<{ data?: string }> }
    return (data.Answer ?? [])
      .map((a) => String(a.data ?? '').replace(/^"|"$/g, '').trim())
      .filter(Boolean)
      .slice(0, 6)
  } catch {
    return []
  }
}

async function fetchRdap(domain: string): Promise<{
  registrar?: string
  createdAt?: string
  expiresAt?: string
  rdapStatus?: string[]
}> {
  try {
    const res = await fetchWithTimeout(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {}, 4500)
    if (!res.ok) return {}
    const data = (await res.json()) as {
      status?: string[]
      events?: Array<{ eventAction?: string; eventDate?: string }>
      entities?: Array<{ roles?: string[]; vcardArray?: [string, Array<[string, unknown, string, string]>] }>
    }

    const created = data.events?.find((e) => e.eventAction === 'registration')?.eventDate?.slice(0, 10)
    const expires = data.events?.find((e) => e.eventAction === 'expiration')?.eventDate?.slice(0, 10)
    const registrarEnt = data.entities?.find((e) => e.roles?.includes('registrar'))
    const fnEntry = registrarEnt?.vcardArray?.[1]?.find((item) => item[0] === 'fn')
    const registrar = fnEntry?.[3] ? String(fnEntry[3]) : undefined

    return {
      registrar,
      createdAt: created,
      expiresAt: expires,
      rdapStatus: Array.isArray(data.status) ? data.status.slice(0, 4) : undefined,
    }
  } catch {
    return {}
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const rawInput = typeof body?.domain === 'string' ? body.domain.trim() : ''
    if (!rawInput || rawInput.length < 3) {
      return NextResponse.json({ success: false, error: 'Provide a domain or URL to enrich' }, { status: 400 })
    }

    let domain = rawInput.toLowerCase()
    try {
      const normalized = rawInput.startsWith('http') ? rawInput : `https://${rawInput}`
      domain = new URL(normalized).hostname.replace(/^www\./, '')
    } catch {
      domain = rawInput.replace(/^www\./, '').split('/')[0]
    }

    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(domain)) {
      return NextResponse.json({ success: false, error: 'Invalid domain format' }, { status: 400 })
    }

    const [aRecords, mxRecords, txtRecords, rdap] = await Promise.all([
      resolveDnsType(domain, 'A'),
      resolveDnsType(domain, 'MX'),
      resolveDnsType(domain, 'TXT'),
      fetchRdap(domain),
    ])

    const result: DomainOsintResult = {
      domain,
      aRecords,
      mxRecords,
      txtRecords,
      ...rdap,
      spiderfootActive: features.spiderfootEnabled,
      sourcesUsed: [
        'dns.google (DoH A/MX/TXT)',
        'rdap.org (WHOIS/RDAP)',
        ...(features.spiderfootEnabled ? ['SpiderFoot REST API'] : []),
      ],
    }

    return NextResponse.json({ success: true, osint: result })
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'OSINT lookup failed' },
      { status: 500 }
    )
  }
}
