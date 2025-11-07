/**
 * Type declarations for @react-three/fiber JSX elements
 * This extends the JSX namespace to recognize Three.js elements
 */

import { ThreeElements } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}

