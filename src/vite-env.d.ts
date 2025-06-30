// @/src/vite-env.d.ts

/// <reference types="vite/client" />
/// <reference types="vite-plugin-comlink/client" />

interface ImportMetaEnv {
    readonly VITE_BACKEND_DEV: number
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }