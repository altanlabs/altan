/**
 * Orb Component - Animated 3D orb for voice agents
 * Self-contained with Three.js implementation
 */

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import * as THREE from 'three';
import type { OrbProps, AgentState } from '../types';

// Extend Three.js elements for JSX
extend(THREE);

function splitmix32(a: number): () => number {
  return function (): number {
    a |= 0;
    a = (a + 0x9e3779b9) | 0;
    let t = a ^ (a >>> 16);
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ (t >>> 15);
    t = Math.imul(t, 0x735a2d97);
    return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296;
  };
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

const vertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

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

vec3 colorRamp(float grayscale, vec3 color1, vec3 color2, vec3 color3, vec3 color4) {
    if (grayscale < 0.25) {
        return mix(color1, color2, grayscale * 4.0);
    } else if (grayscale < 0.75) {
        return mix(color2, color3, (grayscale - 0.25) * 2.0);
    } else {
        return mix(color3, color4, (grayscale - 0.75) * 4.0);
    }
}

float smoothValue(float x) {
    float i = floor(x);
    float f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(sin(i * 12.9898) * 43758.5453, sin((i + 1.0) * 12.9898) * 43758.5453, f);
}

void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float radius = length(uv);
    float angle = atan(uv.y, uv.x);
    float edgeFade = smoothstep(1.0, 0.3, radius);
    float speedMultiplier = mix(1.0, 2.5, uAgentActive);
    float waveIntensity = mix(1.0, 1.8, uAgentActive);
    float layer1Angle = angle + uAnimation * 0.8 * speedMultiplier;
    float layer2Angle = angle - uAnimation * 0.5 * speedMultiplier;
    float layer3Angle = angle + uAnimation * 1.2 * speedMultiplier;
    float wave1 = sin(radius * 8.0 - uAnimation * 3.0 * speedMultiplier) * 0.5 + 0.5;
    float wave2 = sin(radius * 12.0 + uAnimation * 2.0 * speedMultiplier) * 0.5 + 0.5;
    float wave3 = sin(radius * 16.0 - uAnimation * 4.0 * speedMultiplier) * 0.5 + 0.5;
    float turbulence = sin(radius * 20.0 + uAnimation * 5.0 * speedMultiplier) * 
                       sin(angle * 10.0 + uAnimation * 3.0 * speedMultiplier) * 0.5 + 0.5;
    turbulence *= uAgentActive * 0.3;
    float segments1 = sin(layer1Angle * 5.0) * 0.5 + 0.5;
    float segments2 = sin(layer2Angle * 7.0) * 0.5 + 0.5;
    float segments3 = sin(layer3Angle * 3.0) * 0.5 + 0.5;
    float pattern1 = wave1 * segments1;
    float pattern2 = wave2 * segments2;
    float pattern3 = wave3 * segments3;
    float volumePulse = mix(0.5, 1.0, uOutputVolume);
    float activityPulse = mix(0.8, 1.2, uAgentActive);
    float inputRing = smoothstep(0.6, 0.7, radius + sin(angle * 8.0 + uTime * 2.0) * 0.05) * 
                      smoothstep(0.9, 0.8, radius) * uInputVolume * 0.5;
    float combined = pattern1 * 0.45 + pattern2 * 0.35 + pattern3 * 0.3 + turbulence;
    combined = combined * volumePulse * activityPulse + inputRing;
    float radialGrad = 1.0 - smoothstep(0.0, 1.0, radius);
    radialGrad = pow(radialGrad, mix(1.3, 1.0, uAgentActive));
    float patternMix = mix(0.4, 0.6, uAgentActive);
    float finalPattern = mix(combined, radialGrad, patternMix);
    finalPattern = smoothstep(0.1, 0.9, finalPattern);
    finalPattern = finalPattern * 0.9 + 0.1;
    finalPattern *= edgeFade;
    vec3 color1 = uColor1 * 0.3;
    vec3 color2 = uColor1;
    vec3 color3 = uColor2;
    vec3 color4 = mix(uColor2, vec3(1.0), 0.3);
    float luminance = mix(finalPattern, 1.0 - finalPattern, uInverted);
    luminance = pow(luminance, 0.8);
    vec3 finalColor = colorRamp(luminance, color1, color2, color3, color4);
    finalColor = mix(finalColor, finalColor * 1.5, 0.4);
    float alpha = clamp(finalPattern * 1.3, 0.0, 1.0) * edgeFade * uOpacity;
    alpha = max(alpha, finalPattern * 0.3 * uOpacity);
    gl_FragColor = vec4(finalColor, alpha);
}
`;

interface SceneProps {
  colors: [string, string];
  seed?: number;
  agentState: AgentState;
  isStatic: boolean;
}

function Scene({
  colors,
  seed,
  agentState,
  isStatic,
}: SceneProps) {
  const { gl, invalidate } = useThree();
  const circleRef = useRef<THREE.Mesh>(null);
  const initialColorsRef = useRef<[string, string]>(colors);
  const targetColor1Ref = useRef(new THREE.Color(colors[0]));
  const targetColor2Ref = useRef(new THREE.Color(colors[1]));
  const animSpeedRef = useRef<number>(0.1);

  // Set transparent background
  useEffect(() => {
    gl.setClearColor(0x000000, 0);
  }, [gl]);

  const agentRef = useRef<AgentState>(agentState);
  const curInRef = useRef<number>(0);
  const curOutRef = useRef<number>(0);

  useEffect(() => {
    agentRef.current = agentState;
  }, [agentState]);

  const random = useMemo(
    () => splitmix32(seed ?? Math.floor(Math.random() * 2 ** 32)),
    [seed]
  );
  
  const offsets = useMemo(
    () => new Float32Array(Array.from({ length: 7 }, () => random() * Math.PI * 2)),
    [random]
  );

  useEffect(() => {
    targetColor1Ref.current = new THREE.Color(colors[0]);
    targetColor2Ref.current = new THREE.Color(colors[1]);
    if (isStatic) {
      invalidate();
    }
  }, [colors, isStatic, invalidate]);

  useEffect(() => {
    const apply = () => {
      if (!circleRef.current) return;
      const material = circleRef.current.material;
      if (!material || Array.isArray(material)) return;
      const mat = material as THREE.ShaderMaterial;
      if (!mat || !mat.uniforms) return;
      
      const isDark = document.documentElement.classList.contains('dark');
      mat.uniforms.uInverted.value = isDark ? 1 : 0;
      if (isStatic) {
        invalidate();
      }
    };

    apply();

    const observer = new MutationObserver(apply);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, [isStatic, invalidate]);

  useEffect(() => {
    if (isStatic) {
      invalidate();
    }
  }, [isStatic, invalidate]);

  useFrame((_, delta) => {
    if (!circleRef.current) return;
    const material = circleRef.current.material;
    if (!material || Array.isArray(material)) return;
    const mat = material as THREE.ShaderMaterial;
    if (!mat || !mat.uniforms) return;
    
    const u = mat.uniforms;
    
    u.uColor1.value.lerp(targetColor1Ref.current, isStatic ? 1 : 0.08);
    u.uColor2.value.lerp(targetColor2Ref.current, isStatic ? 1 : 0.08);
    
    if (isStatic) return;
    
    u.uTime.value += delta * 0.5;

    if (u.uOpacity.value < 1) {
      u.uOpacity.value = Math.min(1, u.uOpacity.value + delta * 2);
    }

    let targetIn = 0;
    let targetOut = 0.3;
    
    const t = u.uTime.value * 2;
    if (agentRef.current === null) {
      targetIn = 0;
      targetOut = 0.3;
    } else if (agentRef.current === 'listening') {
      targetIn = clamp01(0.55 + Math.sin(t * 3.2) * 0.35);
      targetOut = 0.45;
    } else if (agentRef.current === 'talking' || agentRef.current === 'speaking') {
      targetIn = clamp01(0.65 + Math.sin(t * 4.8) * 0.22);
      targetOut = clamp01(0.75 + Math.sin(t * 3.6) * 0.22);
    } else {
      const base = 0.38 + 0.07 * Math.sin(t * 0.7);
      const wander = 0.05 * Math.sin(t * 2.1) * Math.sin(t * 0.37 + 1.2);
      targetIn = clamp01(base + wander);
      targetOut = clamp01(0.48 + 0.12 * Math.sin(t * 1.05 + 0.6));
    }

    curInRef.current += (targetIn - curInRef.current) * 0.2;
    curOutRef.current += (targetOut - curOutRef.current) * 0.2;

    const targetSpeed = 0.1 + (1 - Math.pow(curOutRef.current - 1, 2)) * 0.9;
    animSpeedRef.current += (targetSpeed - animSpeedRef.current) * 0.12;

    u.uAnimation.value += delta * animSpeedRef.current;
    u.uInputVolume.value = curInRef.current;
    u.uOutputVolume.value = curOutRef.current;
    u.uColor1.value.lerp(targetColor1Ref.current, 0.08);
    u.uColor2.value.lerp(targetColor2Ref.current, 0.08);
    
    const isActive = agentRef.current === 'talking' || agentRef.current === 'listening' || agentRef.current === 'thinking' || agentRef.current === 'speaking';
    const targetActive = isActive ? 1 : 0;
    u.uAgentActive.value += (targetActive - u.uAgentActive.value) * 0.1;
  });

  useEffect(() => {
    const canvas = gl.domElement;
    const onContextLost = (event: Event) => {
      event.preventDefault();
      setTimeout(() => {
        gl.forceContextRestore();
      }, 1);
    };
    canvas.addEventListener('webglcontextlost', onContextLost, false);
    return () => canvas.removeEventListener('webglcontextlost', onContextLost, false);
  }, [gl]);

  const uniforms = useMemo(() => {
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    return {
      uColor1: new THREE.Uniform(new THREE.Color(initialColorsRef.current[0])),
      uColor2: new THREE.Uniform(new THREE.Color(initialColorsRef.current[1])),
      uOffsets: { value: offsets },
      uTime: new THREE.Uniform(0),
      uAnimation: new THREE.Uniform(isStatic ? 2.5 : 0.1),
      uInverted: new THREE.Uniform(isDark ? 1 : 0),
      uInputVolume: new THREE.Uniform(0),
      uOutputVolume: new THREE.Uniform(isStatic ? 0.3 : 0),
      uOpacity: new THREE.Uniform(isStatic ? 1 : 0),
      uAgentActive: new THREE.Uniform(0),
    };
  }, [offsets, isStatic]);

  // @ts-ignore - R3F JSX elements
  return (
    <mesh ref={circleRef}>
      {/* @ts-ignore */}
      <circleGeometry args={[6.5, isStatic ? 64 : 128]} />
      {/* @ts-ignore */}
      <shaderMaterial
        uniforms={uniforms}
        fragmentShader={fragmentShader}
        vertexShader={vertexShader}
        transparent={true}
      />
    </mesh>
  );
}

export function Orb({
  colors = ['#CADCFC', '#A0B9D1'],
  seed,
  agentState = null,
  className,
  static: isStatic = true,
}: OrbProps) {
  return (
    <div className={className ?? 'relative h-full w-full'} style={{ padding: 0, margin: 0, background: 'transparent' }}>
      <Canvas
        resize={{ debounce: 100 }}
        gl={{
          alpha: true,
          antialias: true,
          premultipliedAlpha: true,
        }}
        frameloop={isStatic ? 'demand' : 'always'}
        style={{ display: 'block', width: '100%', height: '100%', background: 'transparent' }}
        camera={{ position: [0, 0, 3.5], fov: 90 }}
        orthographic={false}
      >
        <Scene
          colors={colors}
          seed={seed}
          agentState={agentState}
          isStatic={isStatic}
        />
      </Canvas>
    </div>
  );
}

export default Orb;

