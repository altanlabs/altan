import { Canvas } from "@react-three/fiber"
import type React from 'react'
import { memo } from "react"

import { OrbScene } from "./orb-scene"
import type { OrbProps } from "./orb.types"

/**
 * Orb Component - Renders an animated WebGL orb with customizable colors and states
 * 
 * Features:
 * - Customizable gradient colors
 * - Multiple agent states (thinking, listening, talking)
 * - Volume-reactive animations
 * - Static or animated mode
 * - Dark mode support
 * - Memory-efficient with proper cleanup
 * 
 * @example
 * ```tsx
 * <Orb
 *   colors={["#CADCFC", "#A0B9D1"]}
 *   agentState="talking"
 *   static={false}
 * />
 * ```
 */
export const Orb = memo(function Orb({
  colors = ["#CADCFC", "#A0B9D1"],
  colorsRef,
  resizeDebounce = 100,
  seed,
  agentState = null,
  volumeMode = "auto",
  manualInput,
  manualOutput,
  inputVolumeRef,
  outputVolumeRef,
  getInputVolume,
  getOutputVolume,
  className,
  static: isStatic = true,
}: OrbProps): React.ReactNode {
  return (
    <div 
      className={className ?? "relative h-full w-full"} 
      style={{ padding: 0, margin: 0, background: 'transparent' }}
    >
      <Canvas
        resize={{ debounce: resizeDebounce }}
        gl={{
          alpha: true,
          antialias: isStatic ? false : true, // Disable AA for static orbs
          premultipliedAlpha: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: false, // Don't preserve buffer - saves memory
          depth: false, // No depth buffer needed
          stencil: false, // No stencil buffer needed
        }}
        frameloop={isStatic ? "demand" : "always"}
        style={{ display: 'block', width: '100%', height: '100%', background: 'transparent' }}
        camera={{ position: [0, 0, 3.5], fov: 90 }}
        orthographic={false}
        dpr={isStatic ? 1 : [1, 2]} // Fixed 1x DPR for static orbs
      >
        <OrbScene
          colors={colors}
          colorsRef={colorsRef}
          seed={seed}
          agentState={agentState}
          volumeMode={volumeMode}
          manualInput={manualInput}
          manualOutput={manualOutput}
          inputVolumeRef={inputVolumeRef}
          outputVolumeRef={outputVolumeRef}
          getInputVolume={getInputVolume}
          getOutputVolume={getOutputVolume}
          isStatic={isStatic}
        />
      </Canvas>
    </div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for better memoization
  if (prevProps.static !== nextProps.static) return false;
  if (prevProps.agentState !== nextProps.agentState) return false;
  if (prevProps.seed !== nextProps.seed) return false;
  if (prevProps.className !== nextProps.className) return false;
  
  // Safely compare colors with defaults
  const prevColors = prevProps.colors ?? ["#CADCFC", "#A0B9D1"];
  const nextColors = nextProps.colors ?? ["#CADCFC", "#A0B9D1"];
  if (prevColors[0] !== nextColors[0]) return false;
  if (prevColors[1] !== nextColors[1]) return false;
  
  // For static orbs, ignore other prop changes
  if (nextProps.static) return true;
  
  // For animated orbs, check volume props
  if (prevProps.volumeMode !== nextProps.volumeMode) return false;
  if (prevProps.manualInput !== nextProps.manualInput) return false;
  if (prevProps.manualOutput !== nextProps.manualOutput) return false;
  
  return true;
})

// Re-export types for convenience
export type { AgentState, OrbProps } from "./orb.types"
