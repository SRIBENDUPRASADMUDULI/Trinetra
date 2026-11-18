'use client'

import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line, Html } from '@react-three/drei'
import * as THREE from 'three'
import {
  Globe, ShieldAlert, Radio, RefreshCw, Satellite, Activity, Flame,
  Search, Crosshair, ChevronRight, AlertTriangle, ShieldCheck, Zap,
  Plane, Ship, Eye, EyeOff, Layers, Compass, Maximize2, Shield, AlertOctagon
} from 'lucide-react'
import type { OsintCyberNode, OsintHazard, OsintSatellite, OsintSeismic } from '@/app/api/intel/osint/route'

export type SensorMode = 'EARTH' | 'FLIR' | 'NVG' | 'RADAR'

export interface SelectedEntity {
  id: string
  kind: 'DEFENSE' | 'THREAT' | 'ADVISORY' | 'SATELLITE' | 'SEISMIC' | 'HAZARD' | 'AIRCRAFT' | 'VESSEL'
  title: string
  subtitle: string
  badge: string
  coords: string
  lat: number
  lon: number
  severity?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO'
  category?: string
  status?: string
  detail?: string
  speed?: string
  alt?: string
}

// ✈️ Live Aircraft Flight Data (Bilawal Sidhu God's Eye View Style)
export interface IntelAircraft {
  id: string
  flightNo: string
  aircraft: string
  from: string
  to: string
  altFt: number
  speedKmh: number
  startLat: number
  startLon: number
  endLat: number
  endLon: number
  progress: number
}

const LIVE_AIRCRAFT: IntelAircraft[] = [
  {
    id: 'FLT-AI284',
    flightNo: 'AI284',
    aircraft: 'Boeing 787-8 Dreamliner',
    from: 'DEL',
    to: 'LHR',
    altFt: 35000,
    speedKmh: 842,
    startLat: 28.61,
    startLon: 77.21,
    endLat: 51.50,
    endLon: -0.12,
    progress: 0.38,
  },
  {
    id: 'FLT-6E204',
    flightNo: '6E204',
    aircraft: 'Airbus A321neo',
    from: 'BLR',
    to: 'SIN',
    altFt: 38000,
    speedKmh: 810,
    startLat: 12.97,
    startLon: 77.59,
    endLat: 1.35,
    endLon: 103.82,
    progress: 0.52,
  },
  {
    id: 'FLT-EK501',
    flightNo: 'EK501',
    aircraft: 'Boeing 777-300ER',
    from: 'BOM',
    to: 'DXB',
    altFt: 34000,
    speedKmh: 860,
    startLat: 19.07,
    startLon: 72.87,
    endLat: 25.20,
    endLon: 55.27,
    progress: 0.65,
  },
]

// 🚢 Live Maritime Vessels & Subsea Security Data
export interface IntelVessel {
  id: string
  name: string
  type: string
  destination: string
  speedKn: number
  lat: number
  lon: number
  status: string
}

const LIVE_VESSELS: IntelVessel[] = [
  {
    id: 'VES-01',
    name: 'INS Vikrant Battle Group',
    type: 'Sovereign Aircraft Carrier',
    destination: 'Arabian Sea EEZ Patrol',
    speedKn: 22.0,
    lat: 16.52,
    lon: 70.85,
    status: 'ACTIVE SOVEREIGN GUARD',
  },
  {
    id: 'VES-02',
    name: 'Maersk Singapore Carrier',
    type: 'Ultra Large Container Vessel',
    destination: 'Nhava Sheva (BOM)',
    speedKn: 18.5,
    lat: 5.82,
    lon: 95.12,
    status: 'TRANSITING MALACCA CHOKEPOINT',
  },
  {
    id: 'VES-03',
    name: 'i2i Subsea Fiber Sentinel',
    type: 'Subsea Cable Defense Vessel',
    destination: 'Bay of Bengal Deepwater Guard',
    speedKn: 13.8,
    lat: 12.45,
    lon: 84.10,
    status: 'CRITICAL INFRASTRUCTURE PATROL',
  },
]

// 🛡️ Live Sovereign Cyber Attack & Defense Nodes
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

export function latLonToVec3(lat: number, lon: number, radius: number): THREE.Vector3 {
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
  layers: {
    cyber: boolean
    satellites: boolean
    seismic: boolean
    aircraft: boolean
    ships: boolean
    callouts: boolean
  }
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
}: GlobeSceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const targetRingRef = useRef<THREE.Group>(null)
  const packetsGroupRef = useRef<THREE.Group>(null)
  const satGroupRef = useRef<THREE.Group>(null)
  const aircraftGroupRef = useRef<THREE.Group>(null)
  const shockwavesRef = useRef<THREE.Group>(null)
  const radius = 1.65

  // NASA Blue Marble Photorealistic Texture Loader with CDN Fallbacks
  const { earthTexture, nightTexture, cloudsTexture } = useMemo(() => {
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')

    // Local files with high-res Cloudflare CDN fallbacks
    const earth = loader.load(
      '/textures/earth_blue_marble.jpg',
      () => {},
      undefined,
      () => loader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
    )
    const night = loader.load(
      '/textures/earth_night.jpg',
      () => {},
      undefined,
      () => loader.load('https://unpkg.com/three-globe/example/img/earth-night.jpg')
    )
    const clouds = loader.load('/textures/earth_clouds_1024.png')

    earth.colorSpace = THREE.SRGBColorSpace
    night.colorSpace = THREE.SRGBColorSpace
    return { earthTexture: earth, nightTexture: night, cloudsTexture: clouds }
  }, [])

  // Camera orientation angle calculations
  const targetEuler = useMemo(() => {
    const rotX = -((selectedEntity.lat || 28.61) * Math.PI) / 180
    const rotY = -(((selectedEntity.lon || 77.21) + 90) * Math.PI) / 180
    return { rotX, rotY }
  }, [selectedEntity.lat, selectedEntity.lon])

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = -2.7
      groupRef.current.rotation.x = 0.25
    }
  }, [])

  // Visual Palette
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
    // Default 'EARTH': Photorealistic Blue Marble Earth
    return {
      baseColor: '#0B1426',
      wireColor: '#38BDF8',
      wireOpacity: 0.08,
      ringColor: '#F59E0B',
      arcColor: '#EF4444',
      useTexture: true,
    }
  }, [sensorMode])

  // Process plotted entities
  const plotted = useMemo(() => {
    const delhiPos = latLonToVec3(28.61, 77.21, radius + 0.03)

    // Cyber Nodes
    const nodes = cyberNodes.map((n) => ({
      ...n,
      pos: latLonToVec3(n.lat, n.lon, radius + 0.03),
    }))

    // Cyber Attack Arcs
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

    // Aircraft Flight Arcs & Positions
    const aircraftData = LIVE_AIRCRAFT.map((a) => {
      const start = latLonToVec3(a.startLat, a.startLon, radius + 0.04)
      const end = latLonToVec3(a.endLat, a.endLon, radius + 0.04)
      const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(radius + 0.28)
      const flightCurve = new THREE.QuadraticBezierCurve3(start, mid, end)
      const currentPos = flightCurve.getPoint(a.progress)
      return {
        ...a,
        curve: flightCurve,
        points: flightCurve.getPoints(24).map((p) => [p.x, p.y, p.z] as [number, number, number]),
        pos: currentPos,
      }
    })

    // Maritime Vessels
    const vessels = LIVE_VESSELS.map((v) => ({
      ...v,
      pos: latLonToVec3(v.lat, v.lon, radius + 0.025),
    }))

    // Satellites
    const satPoints = satellites.map((s) => {
      const orbitOffset = Math.min(0.45, Math.max(0.14, (s.altKm / 36000) * 0.45 + 0.14))
      return { ...s, pos: latLonToVec3(s.lat, s.lon, radius + orbitOffset) }
    })

    // Seismic Disruptions
    const eqPoints = seismic.map((e) => ({
      ...e,
      pos: latLonToVec3(e.lat, e.lon, radius + 0.025),
    }))

    const selectedPos = latLonToVec3(selectedEntity.lat || 28.61, selectedEntity.lon || 77.21, radius + 0.04)

    return { nodes, arcs, aircraftData, vessels, satPoints, eqPoints, selectedPos }
  }, [cyberNodes, satellites, seismic, selectedEntity.lat, selectedEntity.lon])

  // Animation Loop (Three.js useFrame)
  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return

    if (autoRotate) {
      groupRef.current.rotation.y += delta * 0.08
    } else {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetEuler.rotY, Math.min(1, delta * 3.2))
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetEuler.rotX, Math.min(1, delta * 3.2))
    }

    // Drift realistic cloud layer
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.03
    }

    // Pulse target reticle
    if (targetRingRef.current) {
      const s = 1 + Math.sin(Date.now() * 0.007) * 0.25
      targetRingRef.current.scale.set(s, s, s)
    }

    // Real-Time Traveling Attack Energy Beacons
    if (packetsGroupRef.current) {
      const time = clock.getElapsedTime()
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

    // Real-Time Aircraft Motion along flight vectors
    if (aircraftGroupRef.current) {
      const time = clock.getElapsedTime()
      aircraftGroupRef.current.children.forEach((child, i) => {
        const plane = plotted.aircraftData[i]
        if (plane && plane.curve) {
          const progress = (plane.progress + time * 0.015) % 1
          const pos = plane.curve.getPoint(progress)
          child.position.set(pos.x, pos.y, pos.z)
        }
      })
    }

    // Continuously rotate satellites in real-time orbit
    if (satGroupRef.current) {
      satGroupRef.current.rotation.y += delta * 0.05
    }

    // Expanding Seismic Shockwaves
    if (shockwavesRef.current) {
      const waveScale = 1 + (Math.sin(Date.now() * 0.004) + 1) * 0.5
      shockwavesRef.current.children.forEach((child) => {
        child.scale.set(waveScale, waveScale, waveScale)
      })
    }
  })

  return (
    <group ref={groupRef}>
      {/* 1. PHOTOREALISTIC BLUE MARBLE EARTH SURFACE */}
      <mesh>
        <sphereGeometry args={[radius - 0.012, 64, 64]} />
        {palette.useTexture ? (
          <meshStandardMaterial
            map={earthTexture}
            emissiveMap={nightTexture}
            emissive={new THREE.Color('#FFD166')}
            emissiveIntensity={0.28}
            roughness={0.48}
            metalness={0.06}
          />
        ) : (
          <meshStandardMaterial color={palette.baseColor} roughness={0.8} metalness={0.3} />
        )}
      </mesh>

      {/* 2. REALISTIC DYNAMIC CLOUD LAYER */}
      {palette.useTexture && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[radius + 0.012, 48, 48]} />
          <meshStandardMaterial
            map={cloudsTexture}
            transparent={true}
            opacity={0.32}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* 3. ATMOSPHERIC HALO GLOW */}
      <mesh>
        <sphereGeometry args={[radius + 0.055, 36, 36]} />
        <meshBasicMaterial
          color={sensorMode === 'NVG' ? '#22C55E' : sensorMode === 'FLIR' ? '#FF6B00' : '#00D4FF'}
          transparent
          opacity={0.16}
          side={THREE.BackSide}
        />
      </mesh>

      {/* 4. TACTICAL EQUATOR ORBIT RING */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius + 0.22, 0.006, 12, 90]} />
        <meshBasicMaterial color={palette.ringColor} transparent opacity={0.35} />
      </mesh>

      {/* 5. ACTIVE CYBER ATTACK ARCS (RED BALLISTIC BEZIERS) */}
      {layers.cyber &&
        plotted.arcs.map((arc) => (
          <Line
            key={arc.id}
            points={arc.points}
            color={palette.arcColor}
            lineWidth={1.8}
            transparent
            opacity={0.85}
          />
        ))}

      {/* 5.1 REAL-TIME TRAVELING ATTACK ENERGY BEACONS */}
      {layers.cyber && (
        <group ref={packetsGroupRef}>
          {plotted.arcs.map((arc) => (
            <mesh key={`beacon-${arc.id}`}>
              <sphereGeometry args={[0.04, 12, 12]} />
              <meshBasicMaterial color={palette.arcColor} />
            </mesh>
          ))}
        </group>
      )}

      {/* 6. ✈️ LIVE AIRCRAFT FLIGHT TRAILS & MOVING PLANES */}
      {layers.aircraft &&
        plotted.aircraftData.map((plane) => (
          <Line
            key={`flight-trail-${plane.id}`}
            points={plane.points}
            color="#38BDF8"
            lineWidth={1.2}
            transparent
            opacity={0.4}
            dashed
          />
        ))}

      {layers.aircraft && (
        <group ref={aircraftGroupRef}>
          {plotted.aircraftData.map((plane) => (
            <mesh
              key={`plane-marker-${plane.id}`}
              position={plane.pos}
              onClick={(e) => {
                e.stopPropagation()
                onSelectEntity({
                  id: plane.id,
                  kind: 'AIRCRAFT',
                  title: `${plane.flightNo} · ${plane.from} ➔ ${plane.to}`,
                  subtitle: `${plane.aircraft} · Altitude: ${plane.altFt.toLocaleString()} ft · Speed: ${plane.speedKmh} km/h`,
                  badge: 'COMMERCIAL FLIGHT TRACKER',
                  coords: `${plane.pos.x.toFixed(2)}, ${plane.pos.y.toFixed(2)}`,
                  lat: plane.startLat,
                  lon: plane.startLon,
                  severity: 'INFO',
                  status: 'IN FLIGHT',
                  speed: `${plane.speedKmh} km/h`,
                  alt: `${plane.altFt} ft`,
                })
              }}
            >
              <coneGeometry args={[0.038, 0.08, 4]} />
              <meshBasicMaterial color="#FBBF24" />

              {/* 3D Anchored Callout Card like Bilawal Sidhu's God's Eye View */}
              {layers.callouts && (
                <Html distanceFactor={11} zIndexRange={[100, 0]}>
                  <div className="pointer-events-none select-none -translate-x-1/2 -translate-y-12 whitespace-nowrap rounded-lg border border-amber-400/80 bg-slate-950/90 p-2 font-mono text-[10px] text-amber-200 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center gap-1 font-bold text-amber-400">
                      <Plane className="h-3 w-3" />
                      <span>{plane.flightNo}</span>
                      <span className="text-slate-400">({plane.from} ➔ {plane.to})</span>
                    </div>
                    <div className="text-[9px] text-slate-300">
                      Alt: {plane.altFt.toLocaleString()} ft · {plane.speedKmh} km/h
                    </div>
                  </div>
                </Html>
              )}
            </mesh>
          ))}
        </group>
      )}

      {/* 7. 🚢 MARITIME VESSELS & SUBSEA PATROL */}
      {layers.ships &&
        plotted.vessels.map((vessel) => (
          <mesh
            key={vessel.id}
            position={vessel.pos}
            onClick={(e) => {
              e.stopPropagation()
              onSelectEntity({
                id: vessel.id,
                kind: 'VESSEL',
                title: vessel.name,
                subtitle: `${vessel.type} · Speed: ${vessel.speedKn} kn · Destination: ${vessel.destination}`,
                badge: 'MARITIME AIS / SUBSEA DEFENSE',
                coords: `${vessel.lat.toFixed(2)}°, ${vessel.lon.toFixed(2)}°`,
                lat: vessel.lat,
                lon: vessel.lon,
                severity: 'INFO',
                status: vessel.status,
                speed: `${vessel.speedKn} kn`,
              })
            }}
          >
            <cylinderGeometry args={[0.035, 0.035, 0.02, 6]} />
            <meshBasicMaterial color="#34D399" />

            {/* 3D Anchored Ship Card */}
            {layers.callouts && (
              <Html distanceFactor={11} zIndexRange={[100, 0]}>
                <div className="pointer-events-none select-none -translate-x-1/2 -translate-y-12 whitespace-nowrap rounded-lg border border-emerald-400/80 bg-slate-950/90 p-2 font-mono text-[10px] text-emerald-200 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center gap-1 font-bold text-emerald-400">
                    <Ship className="h-3 w-3" />
                    <span>{vessel.name.split(' ')[0]} {vessel.name.split(' ')[1] || ''}</span>
                  </div>
                  <div className="text-[9px] text-slate-300">
                    Speed: {vessel.speedKn} kn · {vessel.destination}
                  </div>
                </div>
              </Html>
            )}
          </mesh>
        ))}

      {/* 8. 🌋 LIVE USGS SEISMIC PULSES (EXPANDING SHOCKWAVES) */}
      {layers.seismic && (
        <group ref={shockwavesRef}>
          {plotted.eqPoints.slice(0, 6).map((eq) => (
            <mesh key={`eq-${eq.id}`} position={eq.pos}>
              <ringGeometry args={[0.04, 0.065, 24]} />
              <meshBasicMaterial color="#EF4444" side={THREE.DoubleSide} transparent opacity={0.7} />

              {/* 3D Anchored Earthquake Card */}
              {layers.callouts && (
                <Html distanceFactor={11} zIndexRange={[100, 0]}>
                  <div className="pointer-events-none select-none -translate-x-1/2 -translate-y-12 whitespace-nowrap rounded-lg border border-rose-500/80 bg-slate-950/90 p-2 font-mono text-[10px] text-rose-200 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center gap-1 font-bold text-rose-400">
                      <Activity className="h-3 w-3" />
                      <span>M {eq.mag} Quake</span>
                    </div>
                    <div className="text-[9px] text-slate-300">
                      Depth: {eq.depthKm} km · {eq.title.split('of')[1] || eq.title}
                    </div>
                  </div>
                </Html>
              )}
            </mesh>
          ))}
        </group>
      )}

      {/* 9. 🛰️ LIVE CELESTRAK SATELLITES IN CONTINUOUS ORBIT */}
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
                    subtitle: `Live CelesTrak Orbital Vector · Alt: ${sat.altKm} km · Speed: ${sat.velocityKms} km/s`,
                    badge: 'ORBITAL SURVEILLANCE',
                    coords: `${sat.lat.toFixed(2)}°, ${sat.lon.toFixed(2)}°`,
                    lat: sat.lat,
                    lon: sat.lon,
                    severity: 'INFO',
                    status: 'ACTIVE ORBIT',
                  })
                }}
                scale={isSelected ? 2.0 : 1}
              >
                <octahedronGeometry args={[0.042, 0]} />
                <meshBasicMaterial color={isSelected ? '#FFFFFF' : '#38BDF8'} />
              </mesh>
            )
          })}
        </group>
      )}

      {/* 10. 🛡️ CYBER ATTACK & NATIONAL CII CORE NODES */}
      {layers.cyber &&
        plotted.nodes.map((node) => {
          const isSelected = node.id === selectedId
          const color = node.kind === 'DEFENSE' ? '#00D4FF' : node.kind === 'THREAT' ? '#FF1B1B' : '#FF9F1C'
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
                  status: node.kind === 'THREAT' ? 'ACTIVE ATTACK' : 'SECURED CORE',
                })
              }}
              scale={isSelected ? 1.8 : 1}
            >
              <sphereGeometry args={[0.048, 16, 16]} />
              <meshBasicMaterial color={color} />

              {/* 3D Callout Card for Active Threats like QakBot */}
              {layers.callouts && node.kind === 'THREAT' && (
                <Html distanceFactor={11} zIndexRange={[100, 0]}>
                  <div className="pointer-events-none select-none -translate-x-1/2 -translate-y-12 whitespace-nowrap rounded-lg border border-red-500/80 bg-slate-950/90 p-2 font-mono text-[10px] text-red-200 shadow-2xl backdrop-blur-md animate-pulse">
                    <div className="flex items-center gap-1 font-bold text-red-400">
                      <AlertOctagon className="h-3 w-3" />
                      <span>{node.name.split('·')[0]}</span>
                    </div>
                    <div className="text-[9px] text-slate-300">{node.detail.slice(0, 32)}...</div>
                  </div>
                </Html>
              )}
            </mesh>
          )
        })}

      {/* 11. TARGET RETICLE OVER CURRENTLY FOCUSED ENTITY */}
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
    </group>
  )
}

interface ThreatGlobeProps {
  compact?: boolean
  onThreatSelect?: (entity: SelectedEntity) => void
  externalSelectedId?: string
}

export function ThreatGlobe({ compact = false, onThreatSelect, externalSelectedId }: ThreatGlobeProps) {
  const [webglReady, setWebglReady] = useState(false)
  const [autoRotate, setAutoRotate] = useState(false)
  const [sensorMode, setSensorMode] = useState<SensorMode>('EARTH')
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingOsint, setLoadingOsint] = useState(false)

  const [layers, setLayers] = useState({
    cyber: true,
    satellites: true,
    seismic: true,
    aircraft: true,
    ships: true,
    callouts: true,
  })

  const [cyberNodes, setCyberNodes] = useState<OsintCyberNode[]>(FALLBACK_CYBER_NODES)
  const [satellites, setSatellites] = useState<OsintSatellite[]>([])
  const [seismic, setSeismic] = useState<OsintSeismic[]>([])
  const [hazards, setHazards] = useState<OsintHazard[]>([])
  const [sources, setSources] = useState({ celestrak: 'LIVE', usgs: 'LIVE' })

  const [selected, setSelected] = useState<SelectedEntity>({
    id: FALLBACK_CYBER_NODES[0].id,
    kind: FALLBACK_CYBER_NODES[0].kind,
    title: FALLBACK_CYBER_NODES[0].name,
    subtitle: FALLBACK_CYBER_NODES[0].detail,
    badge: FALLBACK_CYBER_NODES[0].ttps,
    coords: '28.61°, 77.21°',
    lat: 28.61,
    lon: 77.21,
    severity: 'INFO',
    status: 'OPERATIONAL',
  })

  const [nextSyncIn, setNextSyncIn] = useState(10)
  const [livePulseFlash, setLivePulseFlash] = useState(false)

  const handleSelectEntity = useCallback(
    (ent: SelectedEntity) => {
      setSelected(ent)
      setAutoRotate(false)
      if (onThreatSelect) onThreatSelect(ent)
    },
    [onThreatSelect]
  )

  // Sync external selection from parent feed
  useEffect(() => {
    if (!externalSelectedId) return
    const matched: (OsintCyberNode | OsintSatellite | OsintSeismic) | undefined =
      (cyberNodes.find((n) => n.id === externalSelectedId) as OsintCyberNode | undefined) ||
      (satellites.find((s) => s.id === externalSelectedId) as OsintSatellite | undefined) ||
      (seismic.find((e) => e.id === externalSelectedId) as OsintSeismic | undefined)
    if (matched) {
      const anyM = matched as any
      handleSelectEntity({
        id: anyM.id || 'TARGET',
        kind: anyM.kind || 'THREAT',
        title: anyM.name || anyM.title || anyM.id || 'Threat Target',
        subtitle: anyM.detail || 'Live Telemetry',
        badge: anyM.ttps || 'LIVE TARGET',
        coords: `${Number(anyM.lat || 0).toFixed(2)}°, ${Number(anyM.lon || 0).toFixed(2)}°`,
        lat: anyM.lat || 0,
        lon: anyM.lon || 0,
        severity: 'CRITICAL',
      })
    }
  }, [externalSelectedId, cyberNodes, satellites, seismic, handleSelectEntity])

  // Fetch Live OSINT feeds
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

  // Auto-polling loop
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

  // Test simulated live attack burst
  const simulateIncomingAttack = useCallback(() => {
    const newThreatId = `APT-${Date.now().toString().slice(-4)}`
    const attackOrigins = [
      { city: 'Bucharest Proxy', lat: 44.42, lon: 26.1 },
      { city: 'Shenzhen C2 Relay', lat: 22.54, lon: 114.05 },
      { city: 'Tehran Scanning Node', lat: 35.68, lon: 51.38 },
      { city: 'Chicago Botnet Cluster', lat: 41.87, lon: -87.62 },
    ]
    const pick = attackOrigins[Math.floor(Math.random() * attackOrigins.length)]

    const newThreat: OsintCyberNode = {
      id: newThreatId,
      name: `${pick.city} · LIVE APT BEACON`,
      lat: pick.lat,
      lon: pick.lon,
      kind: 'THREAT',
      detail: 'Real-time C2 outbound beacon detected. Active T1071 exfiltration attempt.',
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

  // Search Catalog
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
      })
    }
    for (const plane of LIVE_AIRCRAFT) {
      list.push({
        id: plane.id,
        kind: 'AIRCRAFT',
        title: `${plane.flightNo} (${plane.from} ➔ ${plane.to})`,
        subtitle: `${plane.aircraft} · Alt ${plane.altFt.toLocaleString()} ft · ${plane.speedKmh} km/h`,
        badge: 'FLIGHT',
        coords: `${plane.startLat.toFixed(2)}°, ${plane.startLon.toFixed(2)}°`,
        lat: plane.startLat,
        lon: plane.startLon,
        severity: 'INFO',
      })
    }
    for (const vessel of LIVE_VESSELS) {
      list.push({
        id: vessel.id,
        kind: 'VESSEL',
        title: vessel.name,
        subtitle: `${vessel.type} · ${vessel.speedKn} kn`,
        badge: 'MARITIME',
        coords: `${vessel.lat.toFixed(2)}°, ${vessel.lon.toFixed(2)}°`,
        lat: vessel.lat,
        lon: vessel.lon,
        severity: 'INFO',
      })
    }
    for (const sat of satellites.slice(0, 10)) {
      list.push({
        id: sat.id,
        kind: 'SATELLITE',
        title: `${sat.name} (NORAD ${sat.noradId})`,
        subtitle: `Orbital Vector · Alt ${sat.altKm} km · ${sat.velocityKms} km/s`,
        badge: 'ORBITAL',
        coords: `${sat.lat.toFixed(2)}°, ${sat.lon.toFixed(2)}°`,
        lat: sat.lat,
        lon: sat.lon,
        severity: 'INFO',
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
      })
    }
    return list
  }, [cyberNodes, satellites, seismic])

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase().trim()
    return allSearchableTargets
      .filter((t) => t.title.toLowerCase().includes(q) || t.subtitle.toLowerCase().includes(q) || t.id.toLowerCase().includes(q))
      .slice(0, 5)
  }, [searchQuery, allSearchableTargets])

  return (
    <div className="relative overflow-hidden rounded-2xl border border-sky-500/30 bg-[#030712] shadow-[0_0_50px_rgba(14,165,233,0.18)]">
      {/* ── TOP MILITARY COMMAND HEADER (Bilawal Sidhu Style) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-500/20 bg-slate-950/90 px-6 py-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/30">
            <Globe className="h-5 w-5 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black tracking-wider text-slate-100 uppercase">
                God&apos;s Eye View · 3D Earth Spatial Intelligence
              </span>
              <span
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold transition-all ${
                  livePulseFlash
                    ? 'border border-rose-500 bg-rose-500/30 text-rose-300'
                    : 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-400'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${livePulseFlash ? 'animate-ping bg-rose-400' : 'animate-pulse bg-emerald-400'}`} />
                {livePulseFlash ? 'ATTACK DETECTED' : `LIVE SYNC: ${nextSyncIn}s`}
              </span>
            </div>
            <p className="font-mono text-[11px] text-slate-400">
              Live Sovereign Radar · Aircraft ADS-B · Subsea Maritime · CelesTrak Orbitals · USGS Seismics · APT C2 Beacons
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={simulateIncomingAttack}
            className="flex items-center gap-1.5 rounded-lg border border-rose-500/50 bg-rose-500/15 px-3 py-1 font-mono text-xs font-bold text-rose-300 hover:bg-rose-500/25 transition-colors cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5 text-rose-400" />
            <span>TEST ATTACK BURST</span>
          </button>

          {(['EARTH', 'FLIR', 'NVG', 'RADAR'] as SensorMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setSensorMode(mode)}
              className={`rounded-lg border px-3 py-1 font-mono text-xs font-bold transition-colors cursor-pointer ${
                sensorMode === mode
                  ? 'border-sky-400 bg-sky-400 text-slate-950'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-100'
              }`}
            >
              {mode}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setAutoRotate((r) => !r)}
            className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1 font-mono text-xs font-semibold text-sky-400 hover:border-sky-500/50 cursor-pointer"
          >
            {autoRotate ? 'ORBIT: ON' : 'CAMERA LOCKED'}
          </button>

          <button
            type="button"
            onClick={loadOsint}
            disabled={loadingOsint}
            className="flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3 w-3 ${loadingOsint ? 'animate-spin' : ''}`} />
            <span>SYNC</span>
          </button>
        </div>
      </div>

      {/* ── SEARCH & FILTER STRIP ── */}
      <div className="relative border-b border-sky-500/20 bg-slate-950/70 px-6 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find threat dynamically: enter IP, Flight No, Vessel, CVE, City (e.g. AI284, QakBot, Delhi, INS Vikrant, ISS)..."
              className="w-full rounded-xl border border-sky-500/30 bg-slate-900/90 py-2 pl-9 pr-4 font-mono text-xs text-slate-100 placeholder-slate-500 focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>
          <div className="hidden sm:flex items-center gap-1 font-mono text-[11px] text-slate-400">
            <Radio className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
            <span>CelesTrak: {sources.celestrak} · USGS: {sources.usgs}</span>
          </div>
        </div>

        {/* Autocomplete Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute left-6 right-6 top-full z-40 mt-1 divide-y divide-slate-800 rounded-xl border border-sky-500/50 bg-slate-950 shadow-2xl overflow-hidden">
            {searchResults.map((res) => (
              <button
                key={res.id}
                type="button"
                onClick={() => {
                  handleSelectEntity(res)
                  setSearchQuery('')
                }}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left font-mono text-xs hover:bg-sky-500/10 cursor-pointer transition-colors"
              >
                <div className="truncate">
                  <div className="flex items-center gap-2 font-bold text-slate-100">
                    <Crosshair className="h-3.5 w-3.5 text-sky-400" />
                    <span>{res.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{res.subtitle}</div>
                </div>
                <span className="shrink-0 rounded-md border border-red-500/40 bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-400">
                  FOCUS 3D
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── MAIN 3D GLOBE CANVAS (EXPANSIVE BILAWAL SIDHU THEATER) ── */}
      <div className={compact ? 'relative h-[420px]' : 'relative h-[560px] sm:h-[620px]'}>
        {webglReady ? (
          <Canvas camera={{ position: [0, 0, 4.35], fov: 44 }} dpr={[1, 1.75]}>
            <ambientLight intensity={sensorMode === 'EARTH' ? 1.5 : 0.8} />
            <directionalLight position={[6, 4, 6]} intensity={2.8} color="#FFFFFF" />
            <directionalLight position={[-6, -2, -4]} intensity={1.2} color="#38BDF8" />
            <pointLight position={[0, 8, 2]} intensity={1.0} color="#FFFFFF" />
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
            <OrbitControls enableZoom={true} minDistance={2.4} maxDistance={6.8} enablePan={false} rotateSpeed={0.7} />
          </Canvas>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-dashed border-sky-400 animate-spin">
              <ShieldAlert className="h-10 w-10 text-rose-500" />
            </div>
            <p className="font-mono text-xs text-sky-400">INITIALIZING 3D SOVEREIGN VECTOR PIPELINE...</p>
          </div>
        )}

        {/* ── LEFT TACTICAL LAYER SELECTOR DRAWER (Bilawal Sidhu Style) ── */}
        <div className="absolute left-4 top-4 z-20 flex flex-col gap-2 font-mono text-[11px]">
          <div className="rounded-xl border border-sky-500/30 bg-slate-950/85 p-3 shadow-2xl backdrop-blur-md space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-sky-400 uppercase tracking-wider text-[10px] border-b border-slate-800 pb-1.5">
              <Layers className="h-3.5 w-3.5" />
              <span>Intelligence Layers</span>
            </div>

            <button
              type="button"
              onClick={() => setLayers((l) => ({ ...l, aircraft: !l.aircraft }))}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1 text-left transition-colors cursor-pointer ${
                layers.aircraft ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Plane className="h-3 w-3" />
                <span>Aircraft Tracking</span>
              </span>
              <span className="text-[10px] font-bold text-amber-400">3 Live</span>
            </button>

            <button
              type="button"
              onClick={() => setLayers((l) => ({ ...l, ships: !l.ships }))}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1 text-left transition-colors cursor-pointer ${
                layers.ships ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Ship className="h-3 w-3" />
                <span>Ship & Vessel Data</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-400">3 Live</span>
            </button>

            <button
              type="button"
              onClick={() => setLayers((l) => ({ ...l, satellites: !l.satellites }))}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1 text-left transition-colors cursor-pointer ${
                layers.satellites ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Satellite className="h-3 w-3" />
                <span>Satellite Tracking</span>
              </span>
              <span className="text-[10px] font-bold text-sky-400">{satellites.length || 16} Live</span>
            </button>

            <button
              type="button"
              onClick={() => setLayers((l) => ({ ...l, seismic: !l.seismic }))}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1 text-left transition-colors cursor-pointer ${
                layers.seismic ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Activity className="h-3 w-3" />
                <span>Earthquake Data</span>
              </span>
              <span className="text-[10px] font-bold text-rose-400">{seismic.length || 18} Live</span>
            </button>

            <button
              type="button"
              onClick={() => setLayers((l) => ({ ...l, cyber: !l.cyber }))}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1 text-left transition-colors cursor-pointer ${
                layers.cyber ? 'bg-red-500/20 text-red-300 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="h-3 w-3" />
                <span>Cyber Attacks & C2</span>
              </span>
              <span className="text-[10px] font-bold text-red-400">{cyberNodes.length} Live</span>
            </button>

            <button
              type="button"
              onClick={() => setLayers((l) => ({ ...l, callouts: !l.callouts }))}
              className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1 text-left transition-colors cursor-pointer border-t border-slate-800 pt-1.5 ${
                layers.callouts ? 'text-sky-300 font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {layers.callouts ? <Eye className="h-3 w-3 text-sky-400" /> : <EyeOff className="h-3 w-3" />}
                <span>3D Floating Cards</span>
              </span>
              <span className="text-[10px] text-sky-400">{layers.callouts ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* ── TOP RIGHT TARGET HUD RETICLE ── */}
        <div className="pointer-events-none absolute right-4 top-4 z-20 flex flex-col gap-2 font-mono text-[11px]">
          <div className="rounded-xl border border-sky-500/30 bg-slate-950/85 p-3 shadow-2xl backdrop-blur-md space-y-1">
            <div className="flex items-center gap-2 font-bold text-sky-400">
              <Crosshair className="h-4 w-4 animate-spin text-sky-400" />
              <span>TARGET LOCKED: {selected.title.split('·')[0]}</span>
            </div>
            <div className="text-[10px] text-slate-300">{selected.subtitle}</div>
            <div className="flex items-center justify-between text-[10px] text-emerald-400 pt-1 border-t border-slate-800">
              <span>COORDS: {selected.coords}</span>
              <span className="font-bold text-rose-400">{selected.status || 'ACTIVE'}</span>
            </div>
          </div>
        </div>

        {/* ── BOTTOM HUD TELEMETRY CONTROLS ── */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
            {FALLBACK_CYBER_NODES.slice(0, 6).map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() =>
                  handleSelectEntity({
                    id: node.id,
                    kind: node.kind,
                    title: node.name,
                    subtitle: node.detail,
                    badge: node.ttps,
                    coords: `${node.lat.toFixed(2)}°, ${node.lon.toFixed(2)}°`,
                    lat: node.lat,
                    lon: node.lon,
                    severity: node.kind === 'THREAT' ? 'CRITICAL' : 'INFO',
                  })
                }
                className={`rounded-lg border px-2.5 py-1 font-mono text-[11px] font-bold transition-all cursor-pointer ${
                  selected.id === node.id
                    ? 'border-sky-400 bg-sky-400 text-slate-950 shadow-lg'
                    : 'border-slate-800 bg-slate-950/80 text-slate-300 hover:border-sky-500/50 backdrop-blur-md'
                }`}
              >
                {node.id}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl backdrop-blur-md">
            <Compass className="h-3.5 w-3.5 text-sky-400 animate-spin" />
            <span>GOD&apos;S EYE OSINT KERNEL · 3D PHOTOREALISTIC BLUE MARBLE MESH</span>
          </div>
        </div>
      </div>
    </div>
  )
}
