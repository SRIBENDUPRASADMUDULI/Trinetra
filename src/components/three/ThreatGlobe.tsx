'use client'

import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line } from '@react-three/drei'
import * as THREE from 'three'
import {
  Globe, ShieldAlert, Radio, RefreshCw, Satellite, Activity, Flame,
  Search, Crosshair, ChevronRight, AlertTriangle, ShieldCheck, Zap
} from 'lucide-react'
import type { OsintCyberNode, OsintHazard, OsintSatellite, OsintSeismic } from '@/app/api/intel/osint/route'

export type SensorMode = 'EARTH' | 'FLIR' | 'NVG' | 'RADAR'

export interface SelectedEntity {
  id: string
  kind: 'DEFENSE' | 'THREAT' | 'ADVISORY' | 'SATELLITE' | 'SEISMIC' | 'HAZARD'
  title: string
  subtitle: string
  badge: string
  coords: string
  lat: number
  lon: number
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO'
  category?: string
  status?: string
}

const FALLBACK_CYBER_NODES: OsintCyberNode[] = [
  { id: 'DEL', name: 'New Delhi · National SOC (CII Core)', lat: 28.61, lon: 77.21, kind: 'DEFENSE', detail: 'CERT-In / NCIIPC Statutory Defense Hub', ttps: 'DEF CON 3 Watch' },
  { id: 'BOM', name: 'Mumbai · BFSI Payment & Subsea Gateway', lat: 19.07, lon: 72.87, kind: 'ADVISORY', detail: 'NPCI, RBI Core & Subsea Cable Landing', ttps: 'T1566.002 Spearphish Watch' },
  { id: 'BLR', name: 'Bengaluru · Sovereign Cloud & AI Mesh', lat: 12.97, lon: 77.59, kind: 'DEFENSE', detail: 'Sovereign Compute & DevSecOps Mesh', ttps: 'SAST Guard Active' },
  { id: 'HYD', name: 'Hyderabad · Telecom Registry NOC', lat: 17.38, lon: 78.48, kind: 'ADVISORY', detail: 'SIM-Swap & Telecom Registry Monitor', ttps: 'T1078 Credential Abuse' },
  { id: 'MAA', name: 'Chennai · Bay of Bengal Subsea Hub', lat: 13.08, lon: 80.27, kind: 'DEFENSE', detail: 'i2i / TIC Submarine Fiber Landing', ttps: 'Subsea Physical Guard' },
  { id: 'SGP', name: 'Singapore · Phishing Proxy Relay', lat: 1.35, lon: 103.82, kind: 'THREAT', detail: 'Active .top/.xyz Typosquat Proxy Cluster', ttps: 'T1583.001 Spoofed Infra' },
  { id: 'FRA', name: 'Frankfurt · Automated Credential Sweeper', lat: 50.11, lon: 8.68, kind: 'THREAT', detail: 'Exposed .env & Git Scanner Network', ttps: 'T1552 Unsecured Creds' },
  { id: 'MOW', name: 'Eastern Europe · Synthetic Media C2', lat: 55.75, lon: 37.61, kind: 'THREAT', detail: 'Deepfake Voice & Face-Swap C2 Botnet', ttps: 'T1204 Synthetic Bait' },
  { id: 'C2-QAK', name: 'US East · QakBot C2 Botnet IP 50.16.16.211', lat: 38.90, lon: -77.03, kind: 'THREAT', detail: 'Abuse.ch Feodo Tracker Active C2 Beacon: Port 443', ttps: 'T1071 C2 Communication' },
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
  selectedEntity: SelectedEntity
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
  selectedEntity,
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
  const cloudsRef = useRef<THREE.Mesh>(null)
  const targetRingRef = useRef<THREE.Group>(null)
  const packetsGroupRef = useRef<THREE.Group>(null)
  const satGroupRef = useRef<THREE.Group>(null)
  const radius = 1.65

  // Load NASA / Google Earth photorealistic satellite textures
  const { earthTexture, cloudsTexture } = useMemo(() => {
    const loader = new THREE.TextureLoader()
    const earth = loader.load('/textures/earth_atmos_2048.jpg')
    const clouds = loader.load('/textures/earth_clouds_1024.png')
    earth.colorSpace = THREE.SRGBColorSpace
    return { earthTexture: earth, cloudsTexture: clouds }
  }, [])

  // Calculate target rotation to face selected entity directly
  const targetEuler = useMemo(() => {
    // When group.rotation is 'YXZ':
    // rotX = -(lat * Math.PI) / 180
    // rotY = -((lon + 90) * Math.PI) / 180
    const rotX = -((selectedEntity.lat || 28.61) * Math.PI) / 180
    const rotY = -(((selectedEntity.lon || 77.21) + 90) * Math.PI) / 180
    return { rotX, rotY }
  }, [selectedEntity.lat, selectedEntity.lon])

  // Set initial orientation on mount
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = -2.7
      groupRef.current.rotation.x = 0.25
    }
  }, [])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    if (autoRotate) {
      groupRef.current.rotation.y += delta * 0.1
    } else {
      // Smoothly slerp/lerp camera view to center the target
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetEuler.rotY,
        Math.min(1, delta * 3.2)
      )
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetEuler.rotX,
        Math.min(1, delta * 3.2)
      )
    }

    // Slowly drift realistic cloud layer
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.04
    }

    // Pulse target reticle ring
    if (targetRingRef.current) {
      const s = 1 + Math.sin(Date.now() * 0.007) * 0.25
      targetRingRef.current.scale.set(s, s, s)
    }

    // Animate traveling attack energy packets along ballistic arcs in real-time
    if (packetsGroupRef.current) {
      const time = Date.now() * 0.001
      packetsGroupRef.current.children.forEach((child, i) => {
        const arc = plotted.arcs[i]
        if (arc && arc.curve) {
          const progress = (time * 0.42 + i * 0.26) % 1
          const pos = arc.curve.getPoint(progress)
          child.position.set(pos.x, pos.y, pos.z)
          const s = 0.8 + Math.sin(progress * Math.PI) * 0.7
          child.scale.set(s, s, s)
        }
      })
    }

    // Continuously rotate satellites along orbital paths
    if (satGroupRef.current) {
      satGroupRef.current.rotation.y += delta * 0.04
    }
  })

  // Visual Palette depending on sensor mode
  const palette = useMemo(() => {
    if (sensorMode === 'FLIR') {
      return {
        baseColor: '#1A0C06',
        wireColor: '#FF6B00',
        wireOpacity: 0.35,
        ringColor: '#FFD166',
        arcColor: '#FF3B30',
        useTexture: false,
      }
    }
    if (sensorMode === 'NVG') {
      return {
        baseColor: '#051A0A',
        wireColor: '#22C55E',
        wireOpacity: 0.38,
        ringColor: '#86EFAC',
        arcColor: '#FACC15',
        useTexture: false,
      }
    }
    if (sensorMode === 'RADAR') {
      return {
        baseColor: '#070712',
        wireColor: '#00D4FF',
        wireOpacity: 0.45,
        ringColor: '#FF9F1C',
        arcColor: '#FF1B1B',
        useTexture: false,
      }
    }
    // Default 'EARTH': Google Earth realistic photorealistic texture
    return {
      baseColor: '#0B1426',
      wireColor: '#38BDF8',
      wireOpacity: 0.08,
      ringColor: '#F59E0B',
      arcColor: '#EF4444',
      useTexture: true,
    }
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
          curve,
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

    // Calculate selected entity 3D position
    const selectedPos = latLonToVec3(selectedEntity.lat || 28.61, selectedEntity.lon || 77.21, radius + 0.04)

    return { nodes, arcs, satPoints, eqPoints, hazPoints, selectedPos }
  }, [cyberNodes, satellites, seismic, hazards, selectedEntity.lat, selectedEntity.lon])

  return (
    <group ref={groupRef}>
      {/* 1. Photorealistic Earth Satellite Globe Surface (Google Earth Style) */}
      <mesh>
        <sphereGeometry args={[radius - 0.015, 64, 64]} />
        {palette.useTexture ? (
          <meshStandardMaterial
            map={earthTexture}
            roughness={0.7}
            metalness={0.12}
          />
        ) : (
          <meshStandardMaterial color={palette.baseColor} roughness={0.8} metalness={0.3} />
        )}
      </mesh>

      {/* 2. Realistic Dynamic Cloud Layer (Visible in EARTH mode) */}
      {palette.useTexture && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[radius + 0.008, 48, 48]} />
          <meshStandardMaterial
            map={cloudsTexture}
            transparent={true}
            opacity={0.34}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* 3. Outer Atmospheric Halo Glow */}
      <mesh>
        <sphereGeometry args={[radius + 0.045, 36, 36]} />
        <meshBasicMaterial
          color={sensorMode === 'NVG' ? '#22C55E' : sensorMode === 'FLIR' ? '#FF6B00' : '#00D4FF'}
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>

      {/* 4. Coordinate Lat/Long Grid Wireframe */}
      <mesh>
        <sphereGeometry args={[radius, 32, 24]} />
        <meshBasicMaterial
          color={palette.wireColor}
          wireframe
          transparent
          opacity={palette.wireOpacity}
        />
      </mesh>

      {/* 5. Orbital Surveillance Equator Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius + 0.22, 0.006, 12, 90]} />
        <meshBasicMaterial color={palette.ringColor} transparent opacity={0.4} />
      </mesh>

      {/* 6. Active Attack Bezier Arcs from Threat C2 to National SOC */}
      {layers.cyber &&
        plotted.arcs.map((arc) => (
          <Line
            key={arc.id}
            points={arc.points}
            color={palette.arcColor}
            lineWidth={1.6}
            transparent
            opacity={0.82}
          />
        ))}

      {/* 6.1 Real-Time Traveling Attack Energy Beacons */}
      {layers.cyber && (
        <group ref={packetsGroupRef}>
          {plotted.arcs.map((arc) => (
            <mesh key={`beacon-${arc.id}`}>
              <sphereGeometry args={[0.038, 12, 12]} />
              <meshBasicMaterial color={palette.arcColor} />
            </mesh>
          ))}
        </group>
      )}

      {/* 7. Target Reticle / Radar Pulse over Currently Selected Threat */}
      <group ref={targetRingRef} position={plotted.selectedPos}>
        <mesh>
          <ringGeometry args={[0.07, 0.09, 24]} />
          <meshBasicMaterial
            color={selectedEntity.kind === 'THREAT' ? '#FF1B1B' : '#00D4FF'}
            side={THREE.DoubleSide}
            transparent
            opacity={0.85}
          />
        </mesh>
      </group>

      {/* 8. Cyber & Threat Nodes */}
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
                  lat: node.lat,
                  lon: node.lon,
                  severity: node.kind === 'THREAT' ? 'CRITICAL' : node.kind === 'ADVISORY' ? 'HIGH' : 'INFO',
                  category: 'Cyber Warfare & CII',
                  status: node.kind === 'THREAT' ? 'ACTIVE ATTACK' : 'SECURED CORE',
                })
              }}
              scale={isSelected ? 1.8 : 1}
            >
              <sphereGeometry args={[0.048, 16, 16]} />
              <meshBasicMaterial color={color} />
            </mesh>
          )
        })}

      {/* 9. Live CelesTrak Satellites (Diamond Meshes) in Real-Time Orbit */}
      {layers.satellites && (
        <group ref={satGroupRef}>
          {plotted.satPoints.map((sat) => {
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
                    subtitle: `Live CelesTrak Orbital Vector · Alt ${sat.altKm} km · Speed ${sat.velocityKms} km/s`,
                    badge: 'ORBITAL ASSET',
                    coords: `${sat.lat.toFixed(2)}°, ${sat.lon.toFixed(2)}°`,
                    lat: sat.lat,
                    lon: sat.lon,
                    severity: 'INFO',
                    category: 'Space-Based Reconnaissance',
                    status: 'TRACKED ORBIT',
                  })
                }}
                scale={isSelected ? 1.9 : 1}
              >
                <octahedronGeometry args={[0.038, 0]} />
                <meshBasicMaterial color="#38BDF8" />
              </mesh>
            )
          })}
        </group>
      )}

      {/* 10. Live USGS Seismic Disruptions */}
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
                  subtitle: `USGS Live Seismic Event · Depth ${eq.depthKm} km (Submarine Fiber/Power Grid Impact)`,
                  badge: `M${eq.mag} QUAKE`,
                  coords: `${eq.lat.toFixed(2)}°, ${eq.lon.toFixed(2)}°`,
                  lat: eq.lat,
                  lon: eq.lon,
                  severity: eq.mag >= 5.0 ? 'CRITICAL' : 'HIGH',
                  category: 'Geophysical Subsea Cable Risk',
                  status: 'TELEMETRY RECORDED',
                })
              }}
              scale={isSelected ? 1.8 : 1}
            >
              <sphereGeometry args={[0.034, 12, 12]} />
              <meshBasicMaterial color="#F59E0B" />
            </mesh>
          )
        })}

      {/* 11. NASA EONET Hazards */}
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
                  lat: haz.lat,
                  lon: haz.lon,
                  severity: 'HIGH',
                  category: 'Environmental Hazard',
                  status: 'OPEN EVENT',
                })
              }}
              scale={isSelected ? 1.7 : 1}
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
  externalSelectedId?: string
  onThreatSelect?: (threat: SelectedEntity) => void
}

export function ThreatGlobe({ compact = false, externalSelectedId, onThreatSelect }: ThreatGlobeProps) {
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
  const [autoRotate, setAutoRotate] = useState(false) // Default paused so user can search & examine threats!
  const [sensorMode, setSensorMode] = useState<SensorMode>('EARTH')
  const [searchQuery, setSearchQuery] = useState('')
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
    lat: 28.61,
    lon: 77.21,
    severity: 'INFO',
    category: 'National Cyber Grid Core',
    status: 'OPERATIONAL',
  })

  // Handle entity selection
  const handleSelectEntity = useCallback((ent: SelectedEntity) => {
    setSelected(ent)
    setAutoRotate(false)
    if (onThreatSelect) onThreatSelect(ent)
  }, [onThreatSelect])

  // Sync external selection if provided
  useEffect(() => {
    if (!externalSelectedId) return
    const matched: (OsintCyberNode | OsintSatellite | OsintSeismic) | undefined =
      (cyberNodes.find((n) => n.id === externalSelectedId) as OsintCyberNode | undefined) ||
      (satellites.find((s) => s.id === externalSelectedId) as OsintSatellite | undefined) ||
      (seismic.find((e) => e.id === externalSelectedId) as OsintSeismic | undefined)
    if (matched) {
      const m = matched as OsintCyberNode & OsintSatellite & OsintSeismic
      handleSelectEntity({
        id: m.id,
        kind: 'kind' in m ? (m.kind as SelectedEntity['kind']) : 'THREAT',
        title: 'name' in m ? m.name : 'title' in m ? (m as any).title : m.id,
        subtitle: 'detail' in m ? m.detail : 'Live Telemetry',
        badge: 'ttps' in m ? m.ttps : 'LIVE TARGET',
        coords: `${m.lat.toFixed(2)}°, ${m.lon.toFixed(2)}°`,
        lat: m.lat,
        lon: m.lon,
        severity: 'CRITICAL',
      })
    }
  }, [externalSelectedId, cyberNodes, satellites, seismic, handleSelectEntity])

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
      // Keep fallbacks
    } finally {
      setLoadingOsint(false)
    }
  }, [])

  const [nextSyncIn, setNextSyncIn] = useState(10)
  const [livePulseFlash, setLivePulseFlash] = useState(false)

  // Automatic real-time polling loop every 10 seconds
  useEffect(() => {
    const pollInterval = setInterval(() => {
      loadOsint()
      setLivePulseFlash(true)
      setTimeout(() => setLivePulseFlash(false), 1200)
      setNextSyncIn(10)
    }, 10000)

    const countdownInterval = setInterval(() => {
      setNextSyncIn((prev) => (prev <= 1 ? 10 : prev - 1))
    }, 1000)

    return () => {
      clearInterval(pollInterval)
      clearInterval(countdownInterval)
    }
  }, [loadOsint])

  // Simulate an incoming live APT / Ransomware burst attack
  const simulateIncomingAttack = useCallback(() => {
    const newThreatId = `APT-${Date.now().toString().slice(-4)}`
    const attackCoords = [
      { city: 'Bucharest Proxy', lat: 44.42, lon: 26.10 },
      { city: 'Shenzhen C2 Relay', lat: 22.54, lon: 114.05 },
      { city: 'Tehran Scanning Node', lat: 35.68, lon: 51.38 },
      { city: 'Chicago Botnet Cluster', lat: 41.87, lon: -87.62 },
    ]
    const pick = attackCoords[Math.floor(Math.random() * attackCoords.length)]

    const newThreat: OsintCyberNode = {
      id: newThreatId,
      name: `${pick.city} · LIVE APT BEACON`,
      lat: pick.lat,
      lon: pick.lon,
      kind: 'THREAT',
      detail: `Real-time C2 outbound beacon detected. T1071 C2 Communication underway.`,
      ttps: 'T1071 LIVE ACTIVE',
    }

    setCyberNodes((prev) => [newThreat, ...prev])
    setLivePulseFlash(true)
    setTimeout(() => setLivePulseFlash(false), 2000)

    handleSelectEntity({
      id: newThreat.id,
      kind: 'THREAT',
      title: newThreat.name,
      subtitle: newThreat.detail,
      badge: 'LIVE APT BURST',
      coords: `${newThreat.lat.toFixed(2)}°, ${newThreat.lon.toFixed(2)}°`,
      lat: newThreat.lat,
      lon: newThreat.lon,
      severity: 'CRITICAL',
    })
  }, [handleSelectEntity])

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

  // Combined searchable catalog of all threats, nodes, satellites, and events
  const allSearchableTargets = useMemo(() => {
    const list: SelectedEntity[] = []
    for (const n of cyberNodes) {
      list.push({
        id: n.id,
        kind: n.kind,
        title: n.name,
        subtitle: n.detail,
        badge: n.ttps,
        coords: `${n.lat.toFixed(2)}°, ${n.lon.toFixed(2)}°`,
        lat: n.lat,
        lon: n.lon,
        severity: n.kind === 'THREAT' ? 'CRITICAL' : n.kind === 'ADVISORY' ? 'HIGH' : 'INFO',
        category: 'Cyber Attack / CII Node',
        status: n.kind === 'THREAT' ? 'ACTIVE ATTACK' : 'SECURED CORE',
      })
    }
    for (const sat of satellites.slice(0, 10)) {
      list.push({
        id: sat.id,
        kind: 'SATELLITE',
        title: `${sat.name} (NORAD ${sat.noradId})`,
        subtitle: `Orbital Vector · Alt ${sat.altKm} km · ${sat.velocityKms} km/s`,
        badge: 'ORBITAL ASSET',
        coords: `${sat.lat.toFixed(2)}°, ${sat.lon.toFixed(2)}°`,
        lat: sat.lat,
        lon: sat.lon,
        severity: 'INFO',
        category: 'Satellite Telemetry',
        status: 'ORBITAL',
      })
    }
    for (const eq of seismic.slice(0, 8)) {
      list.push({
        id: eq.id,
        kind: 'SEISMIC',
        title: eq.title,
        subtitle: `USGS M${eq.mag} Quake · Depth ${eq.depthKm} km`,
        badge: `M${eq.mag} QUAKE`,
        coords: `${eq.lat.toFixed(2)}°, ${eq.lon.toFixed(2)}°`,
        lat: eq.lat,
        lon: eq.lon,
        severity: eq.mag >= 5.0 ? 'CRITICAL' : 'HIGH',
        category: 'Subsea Cable Disruption',
        status: 'SEISMIC IMPACT',
      })
    }
    return list
  }, [cyberNodes, satellites, seismic])

  // Filtered threats based on search input
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase().trim()
    return allSearchableTargets.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q) ||
        t.badge.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
    ).slice(0, 5)
  }, [searchQuery, allSearchableTargets])

  const badgeTone =
    selected.kind === 'DEFENSE' || selected.kind === 'SATELLITE'
      ? 'text-[#00D4FF] border-[#00D4FF]/40 bg-[#00D4FF]/10'
      : selected.kind === 'THREAT'
        ? 'text-[#FF1B1B] border-[#FF1B1B]/40 bg-[#FF1B1B]/10'
        : selected.kind === 'HAZARD'
          ? 'text-[#C084FC] border-[#A855F7]/40 bg-[#A855F7]/15'
          : 'text-[#FF9F1C] border-[#FF9F1C]/40 bg-[#FF9F1C]/10'

  return (
    <div className="rounded-xl bg-[#07090E] border border-[#1E293B] overflow-hidden shadow-[0_0_32px_rgba(0,212,255,0.14)]">
      {/* 1. Header Bar: Title + Sensor View Toggle + Live Polling Status + Sync */}
      <div className="px-4 py-2.5 border-b border-[#1E293B] bg-[#030508] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Globe className="w-4 h-4 text-[#00D4FF]" />
          <span className="font-mono text-[11px] font-bold tracking-wider text-[#F8FAFC] uppercase">
            God&apos;s Eye · Google Earth 3D Sovereign Globe
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 transition-colors ${
            livePulseFlash ? 'bg-rose-500/30 text-rose-300 border border-rose-500' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${livePulseFlash ? 'bg-rose-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
            {livePulseFlash ? 'NEW ATTACK DETECTED' : `REAL-TIME SYNC IN ${nextSyncIn}s`}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={simulateIncomingAttack}
            className="px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/40 text-[10px] font-mono text-rose-400 hover:bg-rose-500/30 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Zap className="w-3 h-3 text-rose-400" />
            <span>TEST ATTACK BURST</span>
          </button>
          {(['EARTH', 'FLIR', 'NVG', 'RADAR'] as SensorMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSensorMode(mode)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer transition-colors ${
                sensorMode === mode
                  ? 'bg-[#00D4FF] text-[#030508] border-[#00D4FF] font-bold'
                  : 'bg-[#0A0E17] text-[#94A3B8] border-[#1E293B] hover:text-[#F8FAFC]'
              }`}
            >
              {mode}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAutoRotate((r) => !r)}
            className="px-2 py-0.5 rounded bg-[#0A0E17] border border-[#1E293B] hover:border-[#00D4FF]/50 text-[10px] font-mono text-[#00D4FF] cursor-pointer"
          >
            {autoRotate ? 'ORBIT: ON' : 'LOCKED ON TARGET'}
          </button>
          <button
            type="button"
            onClick={loadOsint}
            disabled={loadingOsint}
            className="px-2 py-0.5 rounded bg-[#0A0E17] border border-[#1E293B] hover:border-[#00FF9D]/50 text-[10px] font-mono text-[#00FF9D] flex items-center gap-1 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3 h-3 ${loadingOsint ? 'animate-spin' : ''}`} />
            SYNC
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC THREAT FINDER SEARCH BAR */}
      <div className="px-4 py-2 bg-[#090D16] border-b border-[#1E293B] relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#00D4FF] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find threat dynamically: enter IP, CVE, C2, city, or keyword (e.g. QakBot, Delhi, MOW, ISS)..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#030508] border border-[#1E293B] text-xs font-mono text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#00D4FF]"
            />
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-2 py-1 rounded bg-[#1E293B] text-[10px] font-mono text-[#94A3B8] hover:text-white"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Dynamic Search Autocomplete Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-4 right-4 z-30 mt-1 bg-[#030508] border border-[#00D4FF]/50 rounded-lg shadow-2xl divide-y divide-[#1E293B] overflow-hidden">
            {searchResults.map((res) => (
              <button
                key={res.id}
                type="button"
                onClick={() => {
                  handleSelectEntity(res)
                  setSearchQuery('')
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#00D4FF]/10 flex items-center justify-between gap-2 text-xs font-mono cursor-pointer transition-colors"
              >
                <div className="truncate">
                  <div className="font-bold text-[#F8FAFC] flex items-center gap-1.5">
                    <Crosshair className="w-3 h-3 text-[#00D4FF]" />
                    {res.title}
                  </div>
                  <div className="text-[11px] text-[#94A3B8] truncate">{res.subtitle}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-[#00FF9D]">{res.coords}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF1B1B]/15 text-[#FF1B1B] border border-[#FF1B1B]/40">
                    FOCUS 3D
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Layer Toggles Strip */}
      <div className="px-4 py-1.5 border-b border-[#1E293B] bg-[#05070D] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setLayers((l) => ({ ...l, cyber: !l.cyber }))}
            className={`px-2 py-0.5 rounded border cursor-pointer ${
              layers.cyber ? 'bg-[#00D4FF]/15 border-[#00D4FF]/50 text-[#00D4FF]' : 'bg-[#0A0E17] border-[#1E293B] text-[#64748B]'
            }`}
          >
            Cyber Targets ({cyberNodes.length})
          </button>
          <button
            type="button"
            onClick={() => setLayers((l) => ({ ...l, satellites: !l.satellites }))}
            className={`px-2 py-0.5 rounded border flex items-center gap-1 cursor-pointer ${
              layers.satellites ? 'bg-[#38BDF8]/15 border-[#38BDF8]/50 text-[#38BDF8]' : 'bg-[#0A0E17] border-[#1E293B] text-[#64748B]'
            }`}
          >
            <Satellite className="w-3 h-3" /> Satellites ({satellites.length})
          </button>
          <button
            type="button"
            onClick={() => setLayers((l) => ({ ...l, seismic: !l.seismic }))}
            className={`px-2 py-0.5 rounded border flex items-center gap-1 cursor-pointer ${
              layers.seismic ? 'bg-[#F59E0B]/15 border-[#F59E0B]/50 text-[#F59E0B]' : 'bg-[#0A0E17] border-[#1E293B] text-[#64748B]'
            }`}
          >
            <Activity className="w-3 h-3" /> Seismic M2.5+ ({seismic.length})
          </button>
          <button
            type="button"
            onClick={() => setLayers((l) => ({ ...l, hazards: !l.hazards }))}
            className={`px-2 py-0.5 rounded border flex items-center gap-1 cursor-pointer ${
              layers.hazards ? 'bg-[#A855F7]/15 border-[#A855F7]/50 text-[#C084FC]' : 'bg-[#0A0E17] border-[#1E293B] text-[#64748B]'
            }`}
          >
            <Flame className="w-3 h-3" /> NASA Hazards ({hazards.length})
          </button>
        </div>
        <span className="flex items-center gap-1 text-[10px] text-[#00FF9D]">
          <Radio className="w-3 h-3 animate-pulse" />
          CelesTrak: {sources.celestrak} · USGS: {sources.usgs}
        </span>
      </div>

      {/* 4. Interactive 3D Canvas with Google Earth Texture & Camera Tracking */}
      <div className={compact ? 'h-80 relative' : 'h-[490px] relative'}>
        {webglReady ? (
          <Canvas camera={{ position: [0, 0, 4.35], fov: 44 }} dpr={[1, 1.75]}>
            <ambientLight intensity={sensorMode === 'EARTH' ? 1.4 : 0.8} />
            <directionalLight position={[6, 4, 6]} intensity={2.6} color="#FFFFFF" />
            <directionalLight position={[-6, -2, -4]} intensity={1.1} color="#38BDF8" />
            <pointLight position={[0, 8, 2]} intensity={0.9} color="#FFFFFF" />
            <GlobeMesh
              selectedId={selected.id}
              selectedEntity={selected}
              onSelectEntity={handleSelectEntity}
              autoRotate={autoRotate}
              sensorMode={sensorMode}
              layers={layers}
              cyberNodes={cyberNodes}
              satellites={satellites}
              seismic={seismic}
              hazards={hazards}
            />
            <OrbitControls enableZoom={true} minDistance={2.6} maxDistance={6.5} enablePan={false} rotateSpeed={0.65} />
          </Canvas>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2">
            <div className="w-28 h-28 rounded-full border-2 border-dashed border-[#00D4FF]/60 flex items-center justify-center animate-[spin_20s_linear_infinite]">
              <ShieldAlert className="w-8 h-8 text-[#FF1B1B]" />
            </div>
            <div className="font-mono text-xs text-[#00D4FF]">3D GEOSPATIAL VECTOR FALLBACK</div>
          </div>
        )}

        {/* Dynamic Target Reticle HUD Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none text-[10px] font-mono">
          <div className="px-2.5 py-1 rounded bg-[#030508]/85 border border-[#00D4FF]/40 text-[#00D4FF] backdrop-blur-xs flex items-center gap-1.5 shadow-md">
            <Crosshair className="w-3 h-3 animate-spin text-[#00D4FF]" />
            <span>TARGET LOCKED: {selected.title.split('·')[0]}</span>
          </div>
          <div className="px-2 py-0.5 rounded bg-[#030508]/80 border border-[#64748B]/40 text-[#94A3B8]">
            COORDINATES: {selected.coords}
          </div>
        </div>

        {/* Legend Overlay */}
        <div className="absolute top-3 right-3 flex flex-wrap gap-1.5 pointer-events-none text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded bg-[#030508]/85 border border-[#00D4FF]/40 text-[#00D4FF]">
            ● Defense Core
          </span>
          <span className="px-2 py-0.5 rounded bg-[#030508]/85 border border-[#FF1B1B]/40 text-[#FF1B1B]">
            ● Threat Origin
          </span>
          <span className="px-2 py-0.5 rounded bg-[#030508]/85 border border-[#38BDF8]/40 text-[#38BDF8]">
            ◆ Satellite
          </span>
          <span className="px-2 py-0.5 rounded bg-[#030508]/85 border border-[#F59E0B]/40 text-[#F59E0B]">
            ● Seismic
          </span>
        </div>
      </div>

      {/* 5. Dynamic Quick Threat Targets Navigation Strip */}
      <div className="p-3 border-t border-[#1E293B] bg-[#030508] space-y-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono text-[#64748B] mr-1">QUICK TARGETS:</span>
          {cyberNodes.map((n) => {
            const active = n.id === selected.id
            const isThreat = n.kind === 'THREAT'
            return (
              <button
                key={n.id}
                type="button"
                onClick={() =>
                  handleSelectEntity({
                    id: n.id,
                    kind: n.kind,
                    title: n.name,
                    subtitle: n.detail,
                    badge: n.ttps,
                    coords: `${n.lat.toFixed(2)}°, ${n.lon.toFixed(2)}°`,
                    lat: n.lat,
                    lon: n.lon,
                    severity: isThreat ? 'CRITICAL' : 'INFO',
                    category: 'Cyber Attack / CII Node',
                    status: isThreat ? 'ACTIVE ATTACK' : 'SECURED CORE',
                  })
                }
                className={`px-2 py-0.5 rounded font-mono text-[10px] border transition-colors cursor-pointer ${
                  active
                    ? isThreat
                      ? 'bg-[#FF1B1B] text-white border-[#FF1B1B] font-bold shadow-xs'
                      : 'bg-[#00D4FF] text-[#030508] border-[#00D4FF] font-bold shadow-xs'
                    : isThreat
                      ? 'bg-[#0A0E17] text-[#FF6B6B] border-[#FF1B1B]/30 hover:border-[#FF1B1B]'
                      : 'bg-[#0A0E17] text-[#94A3B8] border-[#1E293B] hover:text-[#F8FAFC]'
                }`}
              >
                {n.id}
              </button>
            )
          })}
        </div>

        {/* 6. Active Target Telemetry Dossier Card */}
        <div className="p-3 rounded-lg bg-[#090D16] border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#F8FAFC] text-sm flex items-center gap-1.5">
                {selected.kind === 'THREAT' ? (
                  <AlertTriangle className="w-4 h-4 text-[#FF1B1B]" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-[#00D4FF]" />
                )}
                {selected.title}
              </span>
              <span className={`px-2 py-0.5 rounded border font-mono text-[10px] font-bold ${badgeTone}`}>
                {selected.badge}
              </span>
            </div>
            <div className="text-[11px] text-[#94A3B8] font-mono">{selected.subtitle}</div>
          </div>

          <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
            <div className="text-right">
              <div className="text-[#00FF9D] font-bold">{selected.coords}</div>
              <div className="text-[10px] text-[#64748B]">{selected.status || 'ACTIVE SIGNAL'}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                // Focus / trigger view
                setAutoRotate(false)
              }}
              className="px-3 py-1.5 rounded-lg bg-[#00D4FF] hover:bg-[#00B4D8] text-[#030508] text-xs font-bold font-sans flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            >
              <Zap className="w-3.5 h-3.5" />
              Focus Threat
            </button>
          </div>
        </div>

        <div className="text-[10px] font-mono text-[#64748B] pt-1 flex items-center justify-between">
          <span>NASA Blue Marble / Photorealistic Earth Map · Three.js Vector Orbit Engine</span>
          <span className="text-[#00D4FF]">Click any node or live feed item to lock target</span>
        </div>
      </div>
    </div>
  )
}
