'use client';

import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type React from 'react';
import * as THREE from "three";

import { vertexShader, fragmentShader } from "./orb.shaders";
import type { AgentState, OrbSceneProps, OrbUniforms } from "./orb.types";
import { clamp01, createSeededRandom, generateOffsets, isDarkMode } from "./orb.utils";

/**
 * Internal Scene component that renders the animated orb using Three.js
 * Handles all WebGL rendering, animations, and volume-based effects
 */
export function OrbScene({
  colors,
  colorsRef,
  seed,
  agentState,
  volumeMode,
  manualInput,
  manualOutput,
  inputVolumeRef,
  outputVolumeRef,
  getInputVolume,
  getOutputVolume,
  isStatic,
}: OrbSceneProps): React.ReactNode {
  const { gl, invalidate } = useThree()
  const circleRef = useRef<THREE.Mesh<THREE.CircleGeometry, THREE.ShaderMaterial>>(null)
  const initialColorsRef = useRef<[string, string]>(colors)
  const targetColor1Ref = useRef(new THREE.Color(colors[0]))
  const targetColor2Ref = useRef(new THREE.Color(colors[1]))
  const animSpeedRef = useRef(0.1)

  // Refs for agent state and volume tracking
  const agentRef = useRef<AgentState>(agentState)
  const modeRef = useRef<"auto" | "manual">(volumeMode)
  const manualInRef = useRef<number>(manualInput ?? 0)
  const manualOutRef = useRef<number>(manualOutput ?? 0)
  const curInRef = useRef(0)
  const curOutRef = useRef(0)

  // Set transparent background on mount
  useEffect(() => {
    gl.setClearColor(0x000000, 0)
  }, [gl])

  // Update agent state ref when prop changes
  useEffect(() => {
    agentRef.current = agentState
  }, [agentState])

  // Update volume mode ref when prop changes
  useEffect(() => {
    modeRef.current = volumeMode
  }, [volumeMode])

  // Update manual input volume
  useEffect(() => {
    manualInRef.current = clamp01(
      manualInput ?? inputVolumeRef?.current ?? getInputVolume?.() ?? 0
    )
  }, [manualInput, inputVolumeRef, getInputVolume])

  // Update manual output volume
  useEffect(() => {
    manualOutRef.current = clamp01(
      manualOutput ?? outputVolumeRef?.current ?? getOutputVolume?.() ?? 0
    )
  }, [manualOutput, outputVolumeRef, getOutputVolume])

  // Generate seeded random offsets for consistent animation
  const random = useMemo(
    () => createSeededRandom(seed ?? Math.floor(Math.random() * 2 ** 32)),
    [seed]
  )
  const offsets = useMemo(() => generateOffsets(7, random), [random])

  // Update target colors when colors prop changes
  useEffect(() => {
    targetColor1Ref.current = new THREE.Color(colors[0])
    targetColor2Ref.current = new THREE.Color(colors[1])
    if (isStatic) {
      invalidate() // Trigger one render for static orbs when colors change
    }
  }, [colors, isStatic, invalidate])

  // Apply dark mode changes to shader uniforms
  const applyDarkMode = useCallback(() => {
    if (!circleRef.current) return
    const dark = isDarkMode()
    circleRef.current.material.uniforms.uInverted.value = dark ? 1 : 0
    if (isStatic) {
      invalidate() // Trigger render when dark mode changes
    }
  }, [isStatic, invalidate])

  // Watch for dark mode changes - optimized to prevent memory leaks
  useEffect(() => {
    applyDarkMode()

    // For static orbs, don't set up observer to save resources
    if (isStatic) return;

    const observer = new MutationObserver(() => {
      // Debounce the callback to prevent excessive updates
      applyDarkMode();
    })
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    
    return () => {
      observer.disconnect()
    }
  }, [applyDarkMode, isStatic])

  // Trigger initial render for static orbs
  useEffect(() => {
    if (isStatic) {
      invalidate()
    }
  }, [isStatic, invalidate])

  // Main animation loop - optimized for static orbs
  useFrame((_, delta: number) => {
    const mat = circleRef.current?.material
    if (!mat) return

    const u = mat.uniforms as unknown as OrbUniforms

    // For static orbs, skip all processing - colors are set once in uniforms
    if (isStatic) return;

    const live = colorsRef?.current
    if (live) {
      if (live[0]) targetColor1Ref.current.set(live[0])
      if (live[1]) targetColor2Ref.current.set(live[1])
    }

    // Update colors with smooth interpolation for animated orbs
    u.uColor1.value.lerp(targetColor1Ref.current, 0.08)
    u.uColor2.value.lerp(targetColor2Ref.current, 0.08)

    u.uTime.value += delta * 0.5

    // Fade in opacity on initial render
    if (u.uOpacity.value < 1) {
      u.uOpacity.value = Math.min(1, u.uOpacity.value + delta * 2)
    }

    let targetIn = 0
    let targetOut = 0.3

    if (modeRef.current === "manual") {
      targetIn = clamp01(
        manualInput ?? inputVolumeRef?.current ?? getInputVolume?.() ?? 0
      )
      targetOut = clamp01(
        manualOutput ?? outputVolumeRef?.current ?? getOutputVolume?.() ?? 0
      )
    } else {
      const t = u.uTime.value * 2
      if (agentRef.current === null) {
        targetIn = 0
        targetOut = 0.3
      } else if (agentRef.current === "listening") {
        targetIn = clamp01(0.55 + Math.sin(t * 3.2) * 0.35)
        targetOut = 0.45
      } else if (agentRef.current === "talking") {
        targetIn = clamp01(0.65 + Math.sin(t * 4.8) * 0.22)
        targetOut = clamp01(0.75 + Math.sin(t * 3.6) * 0.22)
      } else {
        // "thinking" state
        const base = 0.38 + 0.07 * Math.sin(t * 0.7)
        const wander = 0.05 * Math.sin(t * 2.1) * Math.sin(t * 0.37 + 1.2)
        targetIn = clamp01(base + wander)
        targetOut = clamp01(0.48 + 0.12 * Math.sin(t * 1.05 + 0.6))
      }
    }

    // Smooth volume transitions
    curInRef.current += (targetIn - curInRef.current) * 0.2
    curOutRef.current += (targetOut - curOutRef.current) * 0.2

    // Dynamic animation speed based on output volume
    const targetSpeed = 0.1 + (1 - Math.pow(curOutRef.current - 1, 2)) * 0.9
    animSpeedRef.current += (targetSpeed - animSpeedRef.current) * 0.12

    u.uAnimation.value += delta * animSpeedRef.current
    u.uInputVolume.value = curInRef.current
    u.uOutputVolume.value = curOutRef.current

    // Set agent active state (0 = idle, 1 = active)
    const isActive =
      agentRef.current === "talking" ||
      agentRef.current === "listening" ||
      agentRef.current === "thinking"
    const targetActive = isActive ? 1 : 0
    u.uAgentActive.value += (targetActive - u.uAgentActive.value) * 0.1
  })

  // Handle WebGL context loss and restoration - with proper cleanup
  useEffect(() => {
    const canvas = gl.domElement
    let restoreTimeout: ReturnType<typeof setTimeout> | null = null;
    
    const onContextLost = (event: Event): void => {
      event.preventDefault()
      restoreTimeout = setTimeout(() => {
        gl.forceContextRestore()
      }, 1)
    }
    
    const onContextRestored = (): void => {
      // Re-apply dark mode after context restore
      applyDarkMode()
      if (isStatic) {
        invalidate()
      }
    }
    
    canvas.addEventListener("webglcontextlost", onContextLost, false)
    canvas.addEventListener("webglcontextrestored", onContextRestored, false)
    
    return () => {
      if (restoreTimeout) clearTimeout(restoreTimeout)
      canvas.removeEventListener("webglcontextlost", onContextLost, false)
      canvas.removeEventListener("webglcontextrestored", onContextRestored, false)
    }
  }, [gl, applyDarkMode, isStatic, invalidate])

  // Initialize shader uniforms
  const uniforms = useMemo<OrbUniforms>(() => {
    const dark = isDarkMode()
    return {
      uColor1: new THREE.Uniform(new THREE.Color(initialColorsRef.current[0])),
      uColor2: new THREE.Uniform(new THREE.Color(initialColorsRef.current[1])),
      uOffsets: { value: offsets },
      uTime: new THREE.Uniform(0),
      uAnimation: new THREE.Uniform(isStatic ? 2.5 : 0.1), // Fixed value for static
      uInverted: new THREE.Uniform(dark ? 1 : 0),
      uInputVolume: new THREE.Uniform(0),
      uOutputVolume: new THREE.Uniform(isStatic ? 0.3 : 0), // Default value for static
      uOpacity: new THREE.Uniform(isStatic ? 1 : 0), // Instant opacity for static
      uAgentActive: new THREE.Uniform(0),
    }
  }, [offsets, isStatic])

  // Cleanup Three.js resources on unmount - comprehensive cleanup
  useEffect(() => {
    return () => {
      const mesh = circleRef.current
      if (mesh) {
        // Dispose geometry
        if (mesh.geometry) {
          mesh.geometry.dispose()
        }
        // Dispose material and its uniforms
        if (mesh.material) {
          mesh.material.dispose()
        }
        // Clear mesh reference
        circleRef.current = null
      }
    }
  }, [])

  return (
    <mesh ref={circleRef}>
      {/* Reduced segments for static orbs: 32 vs 64 for better performance */}
      <circleGeometry args={[6.5, isStatic ? 32 : 128]} />
      <shaderMaterial
        uniforms={uniforms}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        transparent={true}
      />
    </mesh>
  )
}

