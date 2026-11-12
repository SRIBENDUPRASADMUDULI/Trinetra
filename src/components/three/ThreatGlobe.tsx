'use client'

import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line } from '@react-three/drei'
import * as THREE from 'three'
import { Globe, ShieldAlert, Radio, RefreshCw, Satellite, Activity, Flame } from 'lucide-react'
import type { OsintCyberNode, OsintHazard, OsintSatellite, OsintSeismic } from '@/app/api/intel/osint/route'

type SensorMode = 'OPTICAL' | 'FLIR' | 'NVG'

interface SelectedEntity {
  id: string
  kind: 'DEFENSE' | 'THREAT' | 'ADVISORY' | 'SATELLITE' | 'SEISMIC' | 'HAZARD'
  title: string
  subtitle: string
  badge: string
  coords: string
}

const FALLBACK_CYBER_NODES: OsintCyberNode[] = [
  { id: 'DEL', name: 'New Delhi · National SOC', lat: 28.61, lon: 77.21, kind: 'DEFENSE', detail: 'CERT-In / NCIIPC Statutory Core', ttps: 'DEF CON 3 Watch' },
  { id: 'BOM', name: 'Mumbai · BFSI Payment Hub', lat: 19.07, lon: 72.87, kind: 'ADVISORY', detail: 'NPCI & Submarine Cable Landing', ttps: 'T1566.002 Spearphish' },
  { id: 'BLR', name: 'Bengaluru · Cloud & AI Corridor', lat: 12.97, lon: 77.59, kind: 'DEFENSE', detail: 'Sovereign Compute & DevSecOps Mesh', ttps: 'SAST Guard Active' },
  { id: 'HYD', name: 'Hyderabad · Telecom NOC', lat: 17.38, lon: 78.48, kind: 'ADVISORY', detail: 'SIM-Swap & Telecom Registry Monitor', ttps: 'T1078 Credential Abuse' },
  { id: 'MAA', name: 'Chennai · Bay of Bengal Cable Hub', lat: 13.08, lon: 80.27, kind: 'DEFENSE', detail: 'i2i / TIC Submarine Fiber Gateway', ttps: 'Subsea Infra Watch' },
  { id: 'SGP', name: 'Singapore · Phishing Relay', lat: 1.35, lon: 103.82, kind: 'THREAT', detail: 'Suspicious .top/.xyz Typosquat Host', ttps: 'T1583.001 Spoofed Infra' },
  { id: 'FRA', name: 'Frankfurt · Automated Scanner', lat: 50.11, lon: 8.68, kind: 'THREAT', detail: 'Exposed .env Credential Sweeps', ttps: 'T1552 Unsecured Creds' },
  { id: 'MOW', name: 'Eastern Europe · Deepfake C2', lat: 55.75, lon: 37.61, kind: 'THREAT', detail: 'Synthetic Voice & Face-Swap Lures', ttps: 'T1204 Synthetic Bait' },
]

function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lon + 180) * (Math.PI / 180)
  const x = -(radius * Math.sin(phi) * Math.cos(theta))
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  return new THREE.Vector3(x, y, z)
}

interface GlobeSceneProps {
  selectedId: string
  onSelectEntity: (entity: SelectedEntity) => void
  autoRotate: boolean
  sensorMode: SensorMode
  layers: { cyber: boolean; satellites: boolean; seismic: boolean; hazards: boolean }
  cyberNodes: OsintCyberNode[]
  satellites: OsintSatellite[]
  seismic: OsintSeismic[]
  hazards: OsintHazard[]
}

function GlobeMesh({
  selectedId,
  onSelectEntity,
  autoRotate,
  sensorMode,
  layers,
  cyberNodes,
  satellites,
  seismic,
  hazards,
}: GlobeSceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const radius = 1.65

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = -2.7
      groupRef.current.rotation.x = 0.25
    }
  }, [])

  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.12
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.18
    }
  })

  const palette = useMemo(() => {
    if (sensorMode === 'FLIR') {
      return { sphere: '#140905', wire: '#FF7A18', ring: '#FFD166', arc: '#FF3B30' }
    }
    if (sensorMode === 'NVG') {
      return { sphere: '#041208', wire: '#22C55E', ring: '#86EFAC', arc: '#FACC15' }
    }
    return { sphere: '#0A0A12', wire: '#00D4FF', ring: '#FF9F1C', arc: '#FF1B1B' }
  }, [sensorMode])

  const plotted = useMemo(() => {
    const delhiPos = latLonToVec3(28.61, 77.21, radius + 0.03)
    const nodes = cyberNodes.map((n) => ({
      ...n,
      pos: latLonToVec3(n.lat, n.lon, radius + 0.03),
    }))

    const arcs = nodes
      .filter((n) => n.kind === 'THREAT')
      .map((n) => {
        const mid = n.pos.clone().add(delhiPos).multiplyScalar(0.5).normalize().multiplyScalar(radius + 0.48)
        const curve = new THREE.QuadraticBezierCurve3(n.pos, mid, delhiPos)
        return {
          id: n.id,
          points: curve.getPoints(28).map((p) => [p.x, p.y, p.z] as [number, number, number]),
        }
      })

    const satPoints = satellites.map((s) => {
      const orbitOffset = Math.min(0.45, Math.max(0.14, (s.altKm / 36000) * 0.45 + 0.14))
      return { ...s, pos: latLonToVec3(s.lat, s.lon, radius + orbitOffset) }
    })

    const eqPoints = seismic.map((e) => ({
      ...e,
      pos: latLonToVec3(e.lat, e.lon, radius + 0.025),
    }))

    const hazPoints = hazards.map((h) => ({
      ...h,
      pos: latLonToVec3(h.lat, h.lon, radius + 0.035),
    }))

    return { nodes, arcs, satPoints, eqPoints, hazPoints }
  }, [cyberNodes, satellites, seismic, hazards])

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[radius - 0.02, 36, 36]} />
        <meshStandardMaterial color={palette.sphere} roughness={0.85} metalness={0.25} />
      </mesh>

      <mesh>
        <sphereGeometry args={[radius, 24, 18]} />
        <meshBasicMaterial color={palette.wire} wireframe transparent opacity={0.22} />
      </mesh>

      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius + 0.24, 0.008, 12, 80]} />
        <meshBasicMaterial color={palette.ring} transparent opacity={0.45} />
      </mesh>

      {layers.cyber &&
        plotted.arcs.map((arc) => (
          <Line key={arc.id} points={arc.points} color={palette.arc} lineWidth={1.3} transparent opacity={0.72} />
        ))}

      {layers.cyber &&
        plotted.nodes.map((node) => {
          const isSelected = node.id === selectedId
          const color =
            node.kind === 'DEFENSE' ? '#00D4FF' : node.kind === 'THREAT' ? '#FF1B1B' : '#FF9F1C'
          return (
            <mesh
              key={node.id}
              position={node.pos}
              onClick={(e) => {
                e.stopPropagation()
                onSelectEntity({
                  id: node.id,
                  kind: node.kind,
                  title: node.name,
                  subtitle: node.detail,
                  badge: node.ttps,
                  coords: `${node.lat.toFixed(2)}°, ${node.lon.toFixed(2)}°`,
                })
              }}
              scale={isSelected ? 1.55 : 1}
            >
              <sphereGeometry args={[0.048, 16, 16]} />
              <meshBasicMaterial color={color} />
            </mesh>
          )
        })}

      {layers.satellites &&
        plotted.satPoints.map((sat) => {
          const isSelected = sat.id === selectedId
          return (
            <mesh
              key={sat.id}
              position={sat.pos}
              onClick={(e) => {
                e.stopPropagation()
                onSelectEntity({
                  id: sat.id,
                  kind: 'SATELLITE',
                  title: `${sat.name} (NORAD ${sat.noradId})`,
                  subtitle: `Live CelesTrak Orbital Telemetry · Alt ${sat.altKm} km · Vel ${sat.velocityKms} km/s`,
                  badge: 'ORBITAL ASSET',
                  coords: `${sat.lat.toFixed(2)}°, ${sat.lon.toFixed(2)}°`,
                })
              }}
              scale={isSelected ? 1.7 : 1}
            >
              <octahedronGeometry args={[0.038, 0]} />
              <meshBasicMaterial color="#38BDF8" />
            </mesh>
          )
        })}

      {layers.seismic &&
        plotted.eqPoints.map((eq) => {
          const isSelected = eq.id === selectedId
          return (
            <mesh
              key={eq.id}
              position={eq.pos}
              onClick={(e) => {
                e.stopPropagation()
                onSelectEntity({
                  id: eq.id,
                  kind: 'SEISMIC',
                  title: eq.title,
                  subtitle: `USGS Live Seismic Monitor · Depth ${eq.depthKm} km (Subsea Cable / Grid Watch)`,
                  badge: `M${eq.mag}`,
                  coords: `${eq.lat.toFixed(2)}°, ${eq.lon.toFixed(2)}°`,
                })
              }}
              scale={isSelected ? 1.65 : 1}
            >
              <sphereGeometry args={[0.032, 12, 12]} />
              <meshBasicMaterial color="#F59E0B" />
            </mesh>
          )
        })}

      {layers.hazards &&
        plotted.hazPoints.map((haz) => {
          const isSelected = haz.id === selectedId
          return (
            <mesh
              key={haz.id}
              position={haz.pos}
              onClick={(e) => {
                e.stopPropagation()
                onSelectEntity({
                  id: haz.id,
                  kind: 'HAZARD',
                  title: haz.title,
                  subtitle: `NASA EONET Active Event · Category: ${haz.category}`,
                  badge: haz.category.toUpperCase(),
                  coords: `${haz.lat.toFixed(2)}°, ${haz.lon.toFixed(2)}°`,
                })
              }}
              scale={isSelected ? 1.65 : 1}
            >
              <boxGeometry args={[0.045, 0.045, 0.045]} />
              <meshBasicMaterial color="#A855F7" />
            </mesh>
          )
        })}
    </group>
  )
}

interface ThreatGlobeProps {
  compact?: boolean
}

export function ThreatGlobe({ compact = false }: ThreatGlobeProps) {
  const [cyberNodes, setCyberNodes] = useState<OsintCyberNode[]>(FALLBACK_CYBER_NODES)
  const [satellites, setSatellites] = useState<OsintSatellite[]>([])
  const [seismic, setSeismic] = useState<OsintSeismic[]>([])
  const [hazards, setHazards] = useState<OsintHazard[]>([])
  const [sources, setSources] = useState<{ celestrak: string; usgs: string; eonet: string }>({
    celestrak: 'SYNCING',
    usgs: 'SYNCING',
    eonet: 'SYNCING',
  })
  const [loadingOsint, setLoadingOsint] = useState(false)
  const [autoRotate, setAutoRotate] = useState(true)
  const [sensorMode, setSensorMode] = useState<SensorMode>('OPTICAL')
  const [layers, setLayers] = useState({
    cyber: true,
    satellites: true,
    seismic: true,
    hazards: true,
  })
  const [webglReady, setWebglReady] = useState(false)
  const [selected, setSelected] = useState<SelectedEntity>({
    id: 'DEL',
    kind: 'DEFENSE',
    title: FALLBACK_CYBER_NODES[0].name,
    subtitle: FALLBACK_CYBER_NODES[0].detail,
    badge: FALLBACK_CYBER_NODES[0].ttps,
    coords: '28.61°, 77.21°',
  })

  const loadOsint = useCallback(async () => {
    setLoadingOsint(true)
    try {
      const res = await fetch('/api/intel/osint', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data.cyberNodes) && data.cyberNodes.length) setCyberNodes(data.cyberNodes)
      if (Array.isArray(data.satellites)) setSatellites(data.satellites)
      if (Array.isArray(data.seismic)) setSeismic(data.seismic)
      if (Array.isArray(data.hazards)) setHazards(data.hazards)
      if (data.sources) setSources(data.sources)
    } catch {
      // Keep fallback cyber nodes
    } finally {
      setLoadingOsint(false)
    }
  }, [])

  useEffect(() => {
    try {
      const c = document.createElement('canvas')
      if (c.getContext('webgl2') || c.getContext('webgl')) {
        setWebglReady(true)
      }
    } catch {
      setWebglReady(false)
    }
    loadOsint()
  }, [loadOsint])

  const badgeTone =
    selected.kind === 'DEFENSE' || selected.kind === 'SATELLITE'
      ? 'text-[#00D4FF] border-[#00D4FF]/40 bg-[#00D4FF]/10'
      : selected.kind === 'THREAT'
        ? 'text-[#FF1B1B] border-[#FF1B1B]/40 bg-[#FF1B1B]/10'
        : selected.kind === 'HAZARD'
          ? 'text-[#C084FC] border-[#A855F7]/40 bg-[#A855F7]/15'
          : 'text-[#FF9F1C] border-[#FF9F1C]/40 bg-[#FF9F1C]/10'

  return (
    <div className="rounded-xl bg-[#0A0A12] border border-[#1A1A2E] overflow-hidden shadow-[0_0_24px_rgba(0,212,255,0.12)]">
      {/* Header Bar */}
      <div className="px-4 py-2.5 border-b border-[#1A1A2E] bg-[#03030A] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#00D4FF]" />
          <span className="font-mono text-[11px] font-bold tracking-wider text-[#F5F5F5] uppercase">
            God&apos;s Eye Spatial OSINT Globe
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(['OPTICAL', 'FLIR', 'NVG'] as SensorMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSensorMode(mode)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer transition-colors ${
                sensorMode === mode
                  ? 'bg-[#00D4FF] text-[#03030A] border-[#00D4FF] font-bold'
                  : 'bg-[#0A0A12] text-[#9CA3AF] border-[#1A1A2E] hover:text-[#F5F5F5]'
              }`}
            >
              {mode}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAutoRotate((r) => !r)}
            className="px-2 py-0.5 rounded bg-[#0A0A12] border border-[#1A1A2E] hover:border-[#00D4FF]/50 text-[10px] font-mono text-[#00D4FF] cursor-pointer"
          >
            {autoRotate ? 'ORBIT: ON' : 'ORBIT: PAUSED'}
          </button>
          <button
            type="button"
            onClick={loadOsint}
            disabled={loadingOsint}
            className="px-2 py-0.5 rounded bg-[#0A0A12] border border-[#1A1A2E] hover:border-[#00FF9D]/50 text-[10px] font-mono text-[#00FF9D] flex items-center gap-1 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3 h-3 ${loadingOsint ? 'animate-spin' : ''}`} />
            SYNC
          </button>
        </div>
      </div>

      {/* Live Layer Toggles */}
      <div className="px-4 py-2 border-b border-[#1A1A2E] bg-[#06060C] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setLayers((l) => ({ ...l, cyber: !l.cyber }))}
            className={`px-2 py-0.5 rounded border cursor-pointer ${
              layers.cyber ? 'bg-[#00D4FF]/15 border-[#00D4FF]/50 text-[#00D4FF]' : 'bg-[#0A0A12] border-[#1A1A2E] text-[#6B7280]'
            }`}
          >
            Cyber Nodes ({cyberNodes.length})
          </button>
          <button
            type="button"
            onClick={() => setLayers((l) => ({ ...l, satellites: !l.satellites }))}
            className={`px-2 py-0.5 rounded border flex items-center gap-1 cursor-pointer ${
              layers.satellites ? 'bg-[#38BDF8]/15 border-[#38BDF8]/50 text-[#38BDF8]' : 'bg-[#0A0A12] border-[#1A1A2E] text-[#6B7280]'
            }`}
          >
            <Satellite className="w-3 h-3" /> Satellites ({satellites.length})
          </button>
          <button
            type="button"
            onClick={() => setLayers((l) => ({ ...l, seismic: !l.seismic }))}
            className={`px-2 py-0.5 rounded border flex items-center gap-1 cursor-pointer ${
              layers.seismic ? 'bg-[#F59E0B]/15 border-[#F59E0B]/50 text-[#F59E0B]' : 'bg-[#0A0A12] border-[#1A1A2E] text-[#6B7280]'
            }`}
          >
            <Activity className="w-3 h-3" /> Seismic M2.5+ ({seismic.length})
          </button>
          <button
            type="button"
            onClick={() => setLayers((l) => ({ ...l, hazards: !l.hazards }))}
            className={`px-2 py-0.5 rounded border flex items-center gap-1 cursor-pointer ${
              layers.hazards ? 'bg-[#A855F7]/15 border-[#A855F7]/50 text-[#C084FC]' : 'bg-[#0A0A12] border-[#1A1A2E] text-[#6B7280]'
            }`}
          >
            <Flame className="w-3 h-3" /> EONET Hazards ({hazards.length})
          </button>
        </div>
        <span className="flex items-center gap-1 text-[10px] text-[#00FF9D]">
          <Radio className="w-3 h-3 animate-pulse" />
          CelesTrak: {sources.celestrak} · USGS: {sources.usgs}
        </span>
      </div>

      {/* Interactive Three.js Canvas */}
      <div className={compact ? 'h-64 relative' : 'h-88 relative'}>
        {webglReady ? (
          <Canvas camera={{ position: [0, 0.4, 4.35], fov: 44 }} dpr={[1, 1.75]}>
            <ambientLight intensity={0.75} />
            <pointLight position={[5, 5, 5]} intensity={1.4} color="#00D4FF" />
            <pointLight position={[-5, -3, -4]} intensity={0.9} color="#FF1B1B" />
            <GlobeMesh
              selectedId={selected.id}
              onSelectEntity={setSelected}
              autoRotate={autoRotate}
              sensorMode={sensorMode}
              layers={layers}
              cyberNodes={cyberNodes}
              satellites={satellites}
              seismic={seismic}
              hazards={hazards}
            />
            <OrbitControls enableZoom={true} minDistance={2.8} maxDistance={6.2} enablePan={false} rotateSpeed={0.65} />
          </Canvas>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2">
            <div className="w-28 h-28 rounded-full border-2 border-dashed border-[#00D4FF]/60 flex items-center justify-center animate-[spin_20s_linear_infinite]">
              <ShieldAlert className="w-8 h-8 text-[#FF1B1B]" />
            </div>
            <div className="font-mono text-xs text-[#00D4FF]">3D GEOSPATIAL VECTOR FALLBACK</div>
          </div>
        )}

        {/* Legend Overlay */}
        <div className="absolute top-2.5 left-3 flex flex-wrap gap-1.5 pointer-events-none text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded bg-[#03030A]/80 border border-[#00D4FF]/30 text-[#00D4FF]">
            ● CII Defense
          </span>
          <span className="px-2 py-0.5 rounded bg-[#03030A]/80 border border-[#FF1B1B]/30 text-[#FF1B1B]">
            ● Threat Origin
          </span>
          <span className="px-2 py-0.5 rounded bg-[#03030A]/80 border border-[#38BDF8]/30 text-[#38BDF8]">
            ◆ Satellite
          </span>
          <span className="px-2 py-0.5 rounded bg-[#03030A]/80 border border-[#F59E0B]/30 text-[#F59E0B]">
            ● Seismic
          </span>
        </div>
      </div>

      {/* Node Selector + Telemetry Readout */}
      <div className="p-3.5 border-t border-[#1A1A2E] bg-[#03030A]/90 space-y-2.5">
        <div className="flex flex-wrap gap-1.5">
          {cyberNodes.map((n) => {
            const active = n.id === selected.id
            return (
              <button
                key={n.id}
                type="button"
                onClick={() =>
                  setSelected({
                    id: n.id,
                    kind: n.kind,
                    title: n.name,
                    subtitle: n.detail,
                    badge: n.ttps,
                    coords: `${n.lat.toFixed(2)}°, ${n.lon.toFixed(2)}°`,
                  })
                }
                className={`px-2 py-0.5 rounded font-mono text-[10px] border transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#00D4FF] text-[#03030A] border-[#00D4FF] font-bold'
                    : 'bg-[#0A0A12] text-[#9CA3AF] border-[#1A1A2E] hover:text-[#F5F5F5]'
                }`}
              >
                {n.id}
              </button>
            )
          })}
          {satellites.slice(0, 3).map((s) => {
            const active = s.id === selected.id
            return (
              <button
                key={s.id}
                type="button"
                onClick={() =>
                  setSelected({
                    id: s.id,
                    kind: 'SATELLITE',
                    title: `${s.name} (NORAD ${s.noradId})`,
                    subtitle: `Live CelesTrak Orbital Telemetry · Alt ${s.altKm} km · Vel ${s.velocityKms} km/s`,
                    badge: 'ORBITAL ASSET',
                    coords: `${s.lat.toFixed(2)}°, ${s.lon.toFixed(2)}°`,
                  })
                }
                className={`px-2 py-0.5 rounded font-mono text-[10px] border transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#38BDF8] text-[#03030A] border-[#38BDF8] font-bold'
                    : 'bg-[#0A0A12] text-[#38BDF8]/80 border-[#1A1A2E] hover:text-[#38BDF8]'
                }`}
              >
                {s.name.split(' ')[0]}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div>
            <div className="font-semibold text-[#F5F5F5]">{selected.title}</div>
            <div className="text-[11px] text-[#9CA3AF]">{selected.subtitle}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#9CA3AF]">{selected.coords}</span>
            <span className={`px-2 py-0.5 rounded border font-mono text-[10px] font-bold ${badgeTone}`}>
              {selected.badge}
            </span>
          </div>
        </div>

        <div className="text-[10px] font-mono text-[#6B7280] pt-1 border-t border-[#1A1A2E]">
          Spatial OSINT pipeline adapted from bilawalsidhu/gods-eye-view (MIT) · Live feeds: CelesTrak GP · USGS GeoJSON · NASA EONET
        </div>
      </div>
    </div>
  )
}
