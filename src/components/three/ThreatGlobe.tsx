'use client'

import React, { useMemo, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line } from '@react-three/drei'
import * as THREE from 'three'
import { Globe, ShieldAlert, Radio } from 'lucide-react'

export interface ThreatNode {
  id: string
  name: string
  lat: number
  lon: number
  kind: 'DEFENSE' | 'THREAT' | 'ADVISORY'
  detail: string
  ttps: string
}

const GLOBE_NODES: ThreatNode[] = [
  { id: 'DEL', name: 'New Delhi · National SOC', lat: 28.61, lon: 77.21, kind: 'DEFENSE', detail: 'CERT-In / NCIIPC Statutory Core', ttps: 'DEF CON 3 Watch' },
  { id: 'BOM', name: 'Mumbai · BFSI Payment Hub', lat: 19.07, lon: 72.87, kind: 'ADVISORY', detail: 'NPCI & Core Banking KYC Gateways', ttps: 'T1566.002 Spearphish' },
  { id: 'BLR', name: 'Bengaluru · Cloud & AI Corridor', lat: 12.97, lon: 77.59, kind: 'DEFENSE', detail: 'Sovereign Compute & DevSecOps Mesh', ttps: 'SAST Guard Active' },
  { id: 'HYD', name: 'Hyderabad · Telecom NOC', lat: 17.38, lon: 78.48, kind: 'ADVISORY', detail: 'SIM-Swap & Telecom Registry Monitor', ttps: 'T1078 Credential Abuse' },
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
  onSelectNode: (id: string) => void
  autoRotate: boolean
}

function GlobeMesh({ selectedId, onSelectNode, autoRotate }: GlobeSceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const radius = 1.65

  // Orient India toward the camera initially
  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = -2.7
      groupRef.current.rotation.x = 0.25
    }
  }, [])

  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.14
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.2
    }
  })

  const plotted = useMemo(() => {
    const delhiPos = latLonToVec3(28.61, 77.21, radius + 0.03)
    const nodes = GLOBE_NODES.map((n) => ({
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

    return { nodes, arcs }
  }, [])

  return (
    <group ref={groupRef}>
      {/* Cinema Dark Inner Sphere */}
      <mesh>
        <sphereGeometry args={[radius - 0.02, 36, 36]} />
        <meshStandardMaterial color="#0A0A12" roughness={0.85} metalness={0.25} />
      </mesh>

      {/* Neon Slate Wireframe Lat/Long Lattice */}
      <mesh>
        <sphereGeometry args={[radius, 24, 18]} />
        <meshBasicMaterial color="#00D4FF" wireframe transparent opacity={0.22} />
      </mesh>

      {/* Equator & Defense Orbital Ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius + 0.24, 0.008, 12, 80]} />
        <meshBasicMaterial color="#FF9F1C" transparent opacity={0.45} />
      </mesh>

      {/* Threat Arcs toward National SOC */}
      {plotted.arcs.map((arc) => (
        <Line key={arc.id} points={arc.points} color="#FF1B1B" lineWidth={1.3} transparent opacity={0.7} />
      ))}

      {/* Geospatial Nodes */}
      {plotted.nodes.map((node) => {
        const isSelected = node.id === selectedId
        const color =
          node.kind === 'DEFENSE'
            ? '#00D4FF'
            : node.kind === 'THREAT'
              ? '#FF1B1B'
              : '#FF9F1C'
        return (
          <mesh
            key={node.id}
            position={node.pos}
            onClick={(e) => {
              e.stopPropagation()
              onSelectNode(node.id)
            }}
            scale={isSelected ? 1.55 : 1}
          >
            <sphereGeometry args={[0.048, 16, 16]} />
            <meshBasicMaterial color={color} />
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
  const [selectedId, setSelectedId] = useState<string>('DEL')
  const [autoRotate, setAutoRotate] = useState(true)
  const [webglReady, setWebglReady] = useState(false)

  useEffect(() => {
    try {
      const c = document.createElement('canvas')
      if (c.getContext('webgl2') || c.getContext('webgl')) {
        setWebglReady(true)
      }
    } catch {
      setWebglReady(false)
    }
  }, [])

  const activeNode = GLOBE_NODES.find((n) => n.id === selectedId) || GLOBE_NODES[0]
  const nodeColor =
    activeNode.kind === 'DEFENSE'
      ? 'text-[#00D4FF] border-[#00D4FF]/40 bg-[#00D4FF]/10'
      : activeNode.kind === 'THREAT'
        ? 'text-[#FF1B1B] border-[#FF1B1B]/40 bg-[#FF1B1B]/10'
        : 'text-[#FF9F1C] border-[#FF9F1C]/40 bg-[#FF9F1C]/10'

  return (
    <div className="rounded-xl bg-[#0A0A12] border border-[#1A1A2E] overflow-hidden shadow-[0_0_24px_rgba(0,212,255,0.12)]">
      {/* Header Bar */}
      <div className="px-4 py-2.5 border-b border-[#1A1A2E] bg-[#03030A] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#00D4FF]" />
          <span className="font-mono text-[11px] font-bold tracking-wider text-[#F5F5F5] uppercase">
            3D Cyber Telemetry Globe
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoRotate((r) => !r)}
            className="px-2 py-0.5 rounded bg-[#0A0A12] border border-[#1A1A2E] hover:border-[#00D4FF]/50 text-[10px] font-mono text-[#00D4FF] cursor-pointer"
          >
            {autoRotate ? 'ORBIT: ON' : 'ORBIT: PAUSED'}
          </button>
          <span className="flex items-center gap-1 text-[10px] font-mono text-[#00FF9D]">
            <Radio className="w-3 h-3 animate-pulse" /> LIVE
          </span>
        </div>
      </div>

      {/* Interactive Three.js Canvas */}
      <div className={compact ? 'h-60 relative' : 'h-80 relative'}>
        {webglReady ? (
          <Canvas camera={{ position: [0, 0.4, 4.3], fov: 44 }} dpr={[1, 1.75]}>
            <ambientLight intensity={0.7} />
            <pointLight position={[5, 5, 5]} intensity={1.4} color="#00D4FF" />
            <pointLight position={[-5, -3, -4]} intensity={0.9} color="#FF1B1B" />
            <GlobeMesh
              selectedId={selectedId}
              onSelectNode={setSelectedId}
              autoRotate={autoRotate}
            />
            <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.65} />
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
        <div className="absolute top-2.5 left-3 flex flex-wrap gap-2 pointer-events-none text-[10px] font-mono">
          <span className="px-2 py-0.5 rounded bg-[#03030A]/80 border border-[#00D4FF]/30 text-[#00D4FF]">
            ● CII Defense
          </span>
          <span className="px-2 py-0.5 rounded bg-[#03030A]/80 border border-[#FF1B1B]/30 text-[#FF1B1B]">
            ● Threat Origin
          </span>
          <span className="px-2 py-0.5 rounded bg-[#03030A]/80 border border-[#FF9F1C]/30 text-[#FF9F1C]">
            ● Advisory Watch
          </span>
        </div>
      </div>

      {/* Node Selector + Telemetry Readout */}
      <div className="p-3.5 border-t border-[#1A1A2E] bg-[#03030A]/90 space-y-2.5">
        <div className="flex flex-wrap gap-1.5">
          {GLOBE_NODES.map((n) => {
            const active = n.id === selectedId
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => setSelectedId(n.id)}
                className={`px-2 py-0.5 rounded font-mono text-[10px] border transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#00D4FF] text-[#03030A] border-[#00D4FF] font-bold'
                    : 'bg-[#0A0A12] text-[#888888] border-[#1A1A2E] hover:text-[#F5F5F5]'
                }`}
              >
                {n.id}
              </button>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div>
            <div className="font-semibold text-[#F5F5F5]">{activeNode.name}</div>
            <div className="text-[11px] text-[#888888]">{activeNode.detail}</div>
          </div>
          <span className={`px-2 py-0.5 rounded border font-mono text-[10px] font-bold ${nodeColor}`}>
            {activeNode.ttps}
          </span>
        </div>
      </div>
    </div>
  )
}
