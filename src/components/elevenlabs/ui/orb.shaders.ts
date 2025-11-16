/**
 * Vertex shader for the orb effect
 * Passes UV coordinates to the fragment shader
 */
export const vertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

/**
 * Fragment shader for the orb effect
 * Creates animated gradient patterns with color ramps and wave effects
 */
export const fragmentShader = /* glsl */ `
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

