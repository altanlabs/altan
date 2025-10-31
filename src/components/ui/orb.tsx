import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from "three"

export type AgentState = null | "thinking" | "listening" | "talking"

type OrbProps = {
  colors?: [string, string]
  colorsRef?: React.RefObject<[string, string]>
  resizeDebounce?: number
  seed?: number
  agentState?: AgentState
  volumeMode?: "auto" | "manual"
  manualInput?: number
  manualOutput?: number
  inputVolumeRef?: React.RefObject<number>
  outputVolumeRef?: React.RefObject<number>
  getInputVolume?: () => number
  getOutputVolume?: () => number
  className?: string
  static?: boolean
}

export function Orb({
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
}: OrbProps) {
  return (
    <div className={className ?? "relative h-full w-full"} style={{ padding: 0, margin: 0, background: 'transparent' }}>
      <Canvas
        resize={{ debounce: resizeDebounce }}
        gl={{
          alpha: true,
          antialias: true,
          premultipliedAlpha: true,
        }}
        frameloop={isStatic ? "demand" : "always"}
        style={{ display: 'block', width: '100%', height: '100%', background: 'transparent' }}
        camera={{ position: [0, 0, 3.5], fov: 90 }}
        orthographic={false}
      >
        <Scene
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
}

function Scene({
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
}: {
  colors: [string, string]
  colorsRef?: React.RefObject<[string, string]>
  seed?: number
  agentState: AgentState
  volumeMode: "auto" | "manual"
  manualInput?: number
  manualOutput?: number
  inputVolumeRef?: React.RefObject<number>
  outputVolumeRef?: React.RefObject<number>
  getInputVolume?: () => number
  getOutputVolume?: () => number
  isStatic: boolean
}) {
  const { gl, invalidate } = useThree()
  const circleRef =
    useRef<THREE.Mesh<THREE.CircleGeometry, THREE.ShaderMaterial>>(null)
  const initialColorsRef = useRef<[string, string]>(colors)
  const targetColor1Ref = useRef(new THREE.Color(colors[0]))
  const targetColor2Ref = useRef(new THREE.Color(colors[1]))
  const animSpeedRef = useRef(0.1)

  // Set transparent background
  useEffect(() => {
    gl.setClearColor(0x000000, 0)
  }, [gl])

  const agentRef = useRef<AgentState>(agentState)
  const modeRef = useRef<"auto" | "manual">(volumeMode)
  const manualInRef = useRef<number>(manualInput ?? 0)
  const manualOutRef = useRef<number>(manualOutput ?? 0)
  const curInRef = useRef(0)
  const curOutRef = useRef(0)

  useEffect(() => {
    agentRef.current = agentState
  }, [agentState])

  useEffect(() => {
    modeRef.current = volumeMode
  }, [volumeMode])

  useEffect(() => {
    manualInRef.current = clamp01(
      manualInput ?? inputVolumeRef?.current ?? getInputVolume?.() ?? 0
    )
  }, [manualInput, inputVolumeRef, getInputVolume])

  useEffect(() => {
    manualOutRef.current = clamp01(
      manualOutput ?? outputVolumeRef?.current ?? getOutputVolume?.() ?? 0
    )
  }, [manualOutput, outputVolumeRef, getOutputVolume])

  const random = useMemo(
    () => splitmix32(seed ?? Math.floor(Math.random() * 2 ** 32)),
    [seed]
  )
  const offsets = useMemo(
    () =>
      new Float32Array(Array.from({ length: 7 }, () => random() * Math.PI * 2)),
    [random]
  )

  useEffect(() => {
    targetColor1Ref.current = new THREE.Color(colors[0])
    targetColor2Ref.current = new THREE.Color(colors[1])
    if (isStatic) {
      invalidate() // Trigger one render for static orbs when colors change
    }
  }, [colors, isStatic, invalidate])

  useEffect(() => {
    const apply = () => {
      if (!circleRef.current) return
      const isDark = document.documentElement.classList.contains("dark")
      circleRef.current.material.uniforms.uInverted.value = isDark ? 1 : 0
      if (isStatic) {
        invalidate() // Trigger render when dark mode changes
      }
    }

    apply()

    const observer = new MutationObserver(apply)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => observer.disconnect()
  }, [isStatic, invalidate])
  
  // Trigger initial render for static orbs
  useEffect(() => {
    if (isStatic) {
      invalidate()
    }
  }, [isStatic, invalidate])

  useFrame((_, delta: number) => {
    const mat = circleRef.current?.material
    if (!mat) return
    const live = colorsRef?.current
    if (live) {
      if (live[0]) targetColor1Ref.current.set(live[0])
      if (live[1]) targetColor2Ref.current.set(live[1])
    }
    const u = mat.uniforms
    
    // Update colors even for static orbs
    u.uColor1.value.lerp(targetColor1Ref.current, isStatic ? 1 : 0.08)
    u.uColor2.value.lerp(targetColor2Ref.current, isStatic ? 1 : 0.08)
    
    if (isStatic) return // Skip animation for static orbs after color update
    
    u.uTime.value += delta * 0.5

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
        const base = 0.38 + 0.07 * Math.sin(t * 0.7)
        const wander = 0.05 * Math.sin(t * 2.1) * Math.sin(t * 0.37 + 1.2)
        targetIn = clamp01(base + wander)
        targetOut = clamp01(0.48 + 0.12 * Math.sin(t * 1.05 + 0.6))
      }
    }

    curInRef.current += (targetIn - curInRef.current) * 0.2
    curOutRef.current += (targetOut - curOutRef.current) * 0.2

    const targetSpeed = 0.1 + (1 - Math.pow(curOutRef.current - 1, 2)) * 0.9
    animSpeedRef.current += (targetSpeed - animSpeedRef.current) * 0.12

    u.uAnimation.value += delta * animSpeedRef.current
    u.uInputVolume.value = curInRef.current
    u.uOutputVolume.value = curOutRef.current
    u.uColor1.value.lerp(targetColor1Ref.current, 0.08)
    u.uColor2.value.lerp(targetColor2Ref.current, 0.08)
    
    // Set agent active state (0 = idle, 1 = active)
    const isActive = agentRef.current === "talking" || agentRef.current === "listening" || agentRef.current === "thinking"
    const targetActive = isActive ? 1 : 0
    u.uAgentActive.value += (targetActive - u.uAgentActive.value) * 0.1
  })

  useEffect(() => {
    const canvas = gl.domElement
    const onContextLost = (event: Event) => {
      event.preventDefault()
      setTimeout(() => {
        gl.forceContextRestore()
      }, 1)
    }
    canvas.addEventListener("webglcontextlost", onContextLost, false)
    return () =>
      canvas.removeEventListener("webglcontextlost", onContextLost, false)
  }, [gl])

  const uniforms = useMemo(() => {
    const isDark =
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark")
    return {
      uColor1: new THREE.Uniform(new THREE.Color(initialColorsRef.current[0])),
      uColor2: new THREE.Uniform(new THREE.Color(initialColorsRef.current[1])),
      uOffsets: { value: offsets },
      uTime: new THREE.Uniform(0),
      uAnimation: new THREE.Uniform(isStatic ? 2.5 : 0.1), // Fixed value for static
      uInverted: new THREE.Uniform(isDark ? 1 : 0),
      uInputVolume: new THREE.Uniform(0),
      uOutputVolume: new THREE.Uniform(isStatic ? 0.3 : 0), // Default value for static
      uOpacity: new THREE.Uniform(isStatic ? 1 : 0), // Instant opacity for static
      uAgentActive: new THREE.Uniform(0),
    }
  }, [offsets, isStatic])

  return (
    <mesh ref={circleRef}>
      <circleGeometry args={[6.5, isStatic ? 64 : 128]} />
      <shaderMaterial
        uniforms={uniforms}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        transparent={true}
      />
    </mesh>
  )
}

function splitmix32(a: number) {
  return function () {
    a |= 0
    a = (a + 0x9e3779b9) | 0
    let t = a ^ (a >>> 16)
    t = Math.imul(t, 0x21f0aaad)
    t = t ^ (t >>> 15)
    t = Math.imul(t, 0x735a2d97)
    return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296
  }
}

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0
  return Math.min(1, Math.max(0, n))
}
const vertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uAnimation;
uniform float uInverted;
uniform float uOffsets[7];
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uInputVolume;
uniform float uOutputVolume;
uniform float uOpacity;
uniform float uAgentActive;
varying vec2 vUv;

const float PI = 3.14159265358979323846;

// Map grayscale value to a 4-color ramp with better distribution
vec3 colorRamp(float grayscale, vec3 color1, vec3 color2, vec3 color3, vec3 color4) {
    // Adjusted thresholds to give more weight to middle colors
    if (grayscale < 0.25) {
        return mix(color1, color2, grayscale * 4.0);
    } else if (grayscale < 0.75) {
        // This is where most of the action happens - blend the two main colors
        return mix(color2, color3, (grayscale - 0.25) * 2.0);
    } else {
        return mix(color3, color4, (grayscale - 0.75) * 4.0);
    }
}

// Smooth value noise-like function
float smoothValue(float x) {
    float i = floor(x);
    float f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(sin(i * 12.9898) * 43758.5453, sin((i + 1.0) * 12.9898) * 43758.5453, f);
}

void main() {
    // Normalize UV coordinates
    vec2 uv = vUv * 2.0 - 1.0;
    
    // Polar coordinates
    float radius = length(uv);
    float angle = atan(uv.y, uv.x);
    
    // Fade out at edges for smooth circular shape
    float edgeFade = smoothstep(1.0, 0.3, radius);
    
    // Adjust animation speeds based on agent activity
    float speedMultiplier = mix(1.0, 2.5, uAgentActive);
    float waveIntensity = mix(1.0, 1.8, uAgentActive);
    
    // Create multiple rotating layers with different speeds
    float layer1Angle = angle + uAnimation * 0.8 * speedMultiplier;
    float layer2Angle = angle - uAnimation * 0.5 * speedMultiplier;
    float layer3Angle = angle + uAnimation * 1.2 * speedMultiplier;
    
    // Create concentric wave patterns with increased intensity when active
    float wave1 = sin(radius * 8.0 - uAnimation * 3.0 * speedMultiplier) * 0.5 + 0.5;
    float wave2 = sin(radius * 12.0 + uAnimation * 2.0 * speedMultiplier) * 0.5 + 0.5;
    float wave3 = sin(radius * 16.0 - uAnimation * 4.0 * speedMultiplier) * 0.5 + 0.5;
    
    // Add extra turbulence when active
    float turbulence = sin(radius * 20.0 + uAnimation * 5.0 * speedMultiplier) * 
                       sin(angle * 10.0 + uAnimation * 3.0 * speedMultiplier) * 0.5 + 0.5;
    turbulence *= uAgentActive * 0.3;
    
    // Create angular segments with rotation
    float segments1 = sin(layer1Angle * 5.0) * 0.5 + 0.5;
    float segments2 = sin(layer2Angle * 7.0) * 0.5 + 0.5;
    float segments3 = sin(layer3Angle * 3.0) * 0.5 + 0.5;
    
    // Combine waves and segments
    float pattern1 = wave1 * segments1;
    float pattern2 = wave2 * segments2;
    float pattern3 = wave3 * segments3;
    
    // Add pulsing based on volume and activity
    float volumePulse = mix(0.5, 1.0, uOutputVolume);
    float activityPulse = mix(0.8, 1.2, uAgentActive);
    float inputRing = smoothstep(0.6, 0.7, radius + sin(angle * 8.0 + uTime * 2.0) * 0.05) * 
                      smoothstep(0.9, 0.8, radius) * uInputVolume * 0.5;
    
    // Combine all patterns with turbulence - increased weights for more variation
    float combined = pattern1 * 0.45 + pattern2 * 0.35 + pattern3 * 0.3 + turbulence;
    combined = combined * volumePulse * activityPulse + inputRing;
    
    // Create depth with radial gradient
    float radialGrad = 1.0 - smoothstep(0.0, 1.0, radius);
    radialGrad = pow(radialGrad, mix(1.3, 1.0, uAgentActive));
    
    // Mix patterns with radial gradient - show more pattern for better color distribution
    float patternMix = mix(0.4, 0.6, uAgentActive);
    float finalPattern = mix(combined, radialGrad, patternMix);
    
    // Enhance contrast to make colors pop more
    finalPattern = smoothstep(0.1, 0.9, finalPattern);
    // Add some remapping to spread colors more evenly
    finalPattern = finalPattern * 0.9 + 0.1;
    
    // Apply edge fade
    finalPattern *= edgeFade;
    
    // Define color ramp - use more of the custom colors
    vec3 color1 = uColor1 * 0.3; // Dark tint of first color
    vec3 color2 = uColor1; // First Color
    vec3 color3 = uColor2; // Second Color
    vec3 color4 = mix(uColor2, vec3(1.0), 0.3); // Bright tint of second color
    
    // Apply color based on pattern - enhanced contrast
    float luminance = mix(finalPattern, 1.0 - finalPattern, uInverted);
    // Boost the contrast to make colors more visible
    luminance = pow(luminance, 0.8);
    vec3 finalColor = colorRamp(luminance, color1, color2, color3, color4);
    
    // Increase overall brightness and visibility
    finalColor = mix(finalColor, finalColor * 1.5, 0.4);
    
    // Calculate alpha with smooth falloff - make it more opaque
    float alpha = clamp(finalPattern * 1.3, 0.0, 1.0) * edgeFade * uOpacity;
    // Add minimum alpha for better visibility
    alpha = max(alpha, finalPattern * 0.3 * uOpacity);
    
    gl_FragColor = vec4(finalColor, alpha);
}
`
