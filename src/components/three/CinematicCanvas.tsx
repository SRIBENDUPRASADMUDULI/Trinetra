'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'

function CyberLattice() {
  const ringRef = useRef<THREE.Mesh>(null)
  const hexRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.04
      ringRef.current.rotation.x = Math.sin(t * 0.15) * 0.12 + 1.15
    }
    if (hexRef.current) {
      hexRef.current.rotation.y = -t * 0.06
      hexRef.current.rotation.x = t * 0.03
    }
  })

  return (
    <group>
      {/* Subtle Electric Blue wireframe sphere far in depth */}
      <mesh ref={hexRef} position={[4.5, 1.2, -7]}>
        <icosahedronGeometry args={[3.4, 1]} />
        <meshBasicMaterial color="#00D4FF" wireframe transparent opacity={0.12} />
      </mesh>

      {/* Subtle Spider Red orbital wireframe ring */}
      <mesh ref={ringRef} position={[-4.2, -1.6, -8]}>
        <torusGeometry args={[3.8, 0.02, 12, 64]} />
        <meshBasicMaterial color="#FF1B1B" wireframe transparent opacity={0.14} />
      </mesh>
    </group>
  )
}

export function CinematicCanvas() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const isDesktop = window.innerWidth > 768
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!isDesktop || reduced) return

    try {
      const testCanvas = document.createElement('canvas')
      const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl')
      if (gl) setEnabled(true)
    } catch {
      setEnabled(false)
    }
  }, [])

  if (!enabled) {
    return <div className="fixed inset-0 z-0 bg-[#03030A] pointer-events-none" aria-hidden="true" />
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#03030A]" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 5], fov: 55 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      >
        <color attach="background" args={['#03030A']} />
        <Stars radius={45} depth={30} count={1400} factor={2.6} saturation={0.3} fade speed={0.45} />
        <CyberLattice />
      </Canvas>
    </div>
  )
}
