import type React from 'react'
import type * as THREE from 'three'

export type AgentState = null | "thinking" | "listening" | "talking"

export type VolumeMode = "auto" | "manual"

export interface OrbProps {
  colors?: [string, string]
  colorsRef?: React.RefObject<[string, string]>
  resizeDebounce?: number
  seed?: number
  agentState?: AgentState
  volumeMode?: VolumeMode
  manualInput?: number
  manualOutput?: number
  inputVolumeRef?: React.RefObject<number>
  outputVolumeRef?: React.RefObject<number>
  getInputVolume?: () => number
  getOutputVolume?: () => number
  className?: string
  static?: boolean
}

export interface OrbSceneProps {
  colors: [string, string]
  colorsRef?: React.RefObject<[string, string]> | undefined
  seed?: number | undefined
  agentState: AgentState
  volumeMode: VolumeMode
  manualInput?: number | undefined
  manualOutput?: number | undefined
  inputVolumeRef?: React.RefObject<number> | undefined
  outputVolumeRef?: React.RefObject<number> | undefined
  getInputVolume?: (() => number) | undefined
  getOutputVolume?: (() => number) | undefined
  isStatic: boolean
}

export interface OrbUniforms {
  uColor1: THREE.Uniform<THREE.Color>
  uColor2: THREE.Uniform<THREE.Color>
  uOffsets: { value: Float32Array }
  uTime: THREE.Uniform<number>
  uAnimation: THREE.Uniform<number>
  uInverted: THREE.Uniform<number>
  uInputVolume: THREE.Uniform<number>
  uOutputVolume: THREE.Uniform<number>
  uOpacity: THREE.Uniform<number>
  uAgentActive: THREE.Uniform<number>
  [uniform: string]: THREE.IUniform<unknown> | { value: Float32Array }
}

