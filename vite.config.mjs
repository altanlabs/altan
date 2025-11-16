import react from '@vitejs/plugin-react';
import fs from 'fs/promises';
import { createRequire } from 'module';
import path from 'path';
import url from 'url';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import wasm from 'vite-plugin-wasm';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

const WRONG_CODE = `import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";`;

function reactVirtualized() {
  return {
    name: 'flat:react-virtualized',
    configResolved: async () => {
      try {
        const require = createRequire(import.meta.url);
        const reactVirtualizedPath = require.resolve('react-virtualized');
        const { pathname: reactVirtualizedFilePath } = new url.URL(
          reactVirtualizedPath,
          import.meta.url,
        );
        const file = reactVirtualizedFilePath.replace(
          path.join('dist', 'commonjs', 'index.js'),
          path.join('dist', 'es', 'WindowScroller', 'utils', 'onScroll.js'),
        );
        const code = await fs.readFile(file, 'utf-8');
        
        // Skip if already patched
        if (!code.includes(WRONG_CODE)) {
          console.log('react-virtualized already patched or patch not needed');
          return;
        }
        
        const modified = code.replace(WRONG_CODE, '');
        await fs.writeFile(file, modified);
        console.log('react-virtualized patched successfully');
      } catch (error) {
        // In CI environments, node_modules might be readonly
        console.warn('Could not patch react-virtualized (this is usually fine in CI):', error.message);
      }
    },
  };
}


export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  const isMobile = process.env.VITE_BUILD_TARGET === 'mobile';
  const isAnalyze = process.env.ANALYZE === 'true';
  
  return {
    base: '/',  
    build: {
      target: isMobile ? 'es2019' : 'esnext',
      cssCodeSplit: true,
      emptyOutDir: true,
      minify: 'esbuild', // Enable minification for production
      sourcemap: isDev || isMobile,
      outDir: 'dist',
      assetsInlineLimit: isMobile ? 4096 : 0,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 500, // Lower threshold to catch issues early
      rollupOptions: {
        treeshake: true, // Enable tree-shaking
        output: {
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js', 
          assetFileNames: 'assets/[name]-[hash].[ext]',
          // Strategic code splitting to reduce bundle sizes
          manualChunks(id) {
            // Core vendors that rarely change
            if (id.includes('node_modules')) {
              // ===== TIER 1: Core React (loaded on every page) =====
              if (id.includes('react/') || id.includes('react-dom/')) {
                return 'react-core';
              }
              
              if (id.includes('react-router')) {
                return 'react-router';
              }
              
              // Redux & state management
              if (id.includes('redux') || id.includes('@reduxjs')) {
                return 'redux-vendor';
              }
              
              // ===== TIER 2: UI Frameworks (large, split by framework) =====
              
              // MUI components
              if (id.includes('@mui/material') || id.includes('@mui/system') || id.includes('@mui/base')) {
                return 'mui-core';
              }
              
              if (id.includes('@mui/x-') || id.includes('@mui/lab')) {
                return 'mui-x';
              }
              
              if (id.includes('@emotion')) {
                return 'emotion';
              }
              
              // Ionic (massive)
              if (id.includes('@ionic/')) {
                return 'ionic-vendor';
              }
              
              // Ant Design
              if (id.includes('antd/') || id.includes('ant-design')) {
                return 'antd-vendor';
              }
              
              // Radix UI
              if (id.includes('@radix-ui')) {
                return 'radix-vendor';
              }
              
              // ===== TIER 3: Data & Visualization (heavy, lazy load) =====
              
              // AG Grid (huge library)
              if (id.includes('ag-grid') || id.includes('@ag-grid')) {
                return 'ag-grid-vendor';
              }
              
              // Chart libraries
              if (id.includes('recharts') || id.includes('chart.js') || id.includes('react-chartjs')) {
                return 'charts-core';
              }
              
              if (id.includes('apexcharts') || id.includes('react-apexcharts')) {
                return 'apexcharts-vendor';
              }
              
              if (id.includes('ag-charts')) {
                return 'ag-charts-vendor';
              }
              
              // ===== TIER 4: 3D & Graphics (very heavy) =====
              
              if (id.includes('three/') || id.includes('three-')) {
                return 'three-core';
              }
              
              if (id.includes('@react-three')) {
                return 'react-three-vendor';
              }
              
              if (id.includes('postprocessing')) {
                return 'three-postprocessing';
              }
              
              // Cytoscape (graph visualization)
              if (id.includes('cytoscape')) {
                return 'cytoscape-vendor';
              }
              
              // ===== TIER 5: Code Editors (heavy) =====
              
              if (id.includes('monaco-editor') || id.includes('@monaco-editor')) {
                return 'monaco-vendor';
              }
              
              if (id.includes('ace-builds') || id.includes('react-ace')) {
                return 'ace-vendor';
              }
              
              if (id.includes('lexical') || id.includes('@lexical')) {
                return 'lexical-vendor';
              }
              
              if (id.includes('@codeium')) {
                return 'codeium-vendor';
              }
              
              // ===== TIER 6: Diagrams & Flow =====
              
              if (id.includes('mermaid')) {
                return 'mermaid-vendor';
              }
              
              if (id.includes('reactflow') || id.includes('@reactflow')) {
                return 'reactflow-vendor';
              }
              
              if (id.includes('elkjs')) {
                return 'elk-vendor';
              }
              
              // ===== TIER 7: Forms & Surveys =====
              
              if (id.includes('survey-core') || id.includes('survey-creator') || id.includes('survey-react')) {
                return 'survey-vendor';
              }
              
              if (id.includes('react-hook-form') || id.includes('@hookform')) {
                return 'form-vendor';
              }
              
              if (id.includes('@rjsf/')) {
                return 'rjsf-vendor';
              }
              
              // ===== TIER 8: Backend Services =====
              
              if (id.includes('firebase') || id.includes('@firebase')) {
                return 'firebase-vendor';
              }
              
              if (id.includes('@supabase')) {
                return 'supabase-vendor';
              }
              
              if (id.includes('axios')) {
                return 'axios-vendor';
              }
              
              // ===== TIER 9: Icons & Media =====
              
              if (id.includes('@iconify')) {
                return 'iconify-vendor';
              }
              
              if (id.includes('lucide-react')) {
                return 'lucide-vendor';
              }
              
              if (id.includes('@mui/icons-material')) {
                return 'mui-icons';
              }
              
              if (id.includes('lottie') || id.includes('@lottiefiles')) {
                return 'lottie-vendor';
              }
              
              // ===== TIER 10: Animation & Effects =====
              
              if (id.includes('framer-motion') || id.includes('motion/')) {
                return 'motion-vendor';
              }
              
              if (id.includes('gsap')) {
                return 'gsap-vendor';
              }
              
              if (id.includes('@tsparticles')) {
                return 'particles-vendor';
              }
              
              // ===== TIER 11: Drag & Drop =====
              
              if (id.includes('@dnd-kit')) {
                return 'dnd-kit-vendor';
              }
              
              if (id.includes('react-beautiful-dnd') || id.includes('@hello-pangea/dnd')) {
                return 'dnd-vendor';
              }
              
              // ===== TIER 12: Utilities =====
              
              if (id.includes('lodash')) {
                return 'lodash-vendor';
              }
              
              if (id.includes('date-fns')) {
                return 'date-vendor';
              }
              
              if (id.includes('yup') || id.includes('ajv')) {
                return 'validation-vendor';
              }
              
              // Maps
              if (id.includes('mapbox-gl') || id.includes('react-map-gl')) {
                return 'maps-vendor';
              }
              
              // Markdown & Highlighting
              if (id.includes('react-markdown') || id.includes('remark-') || id.includes('rehype-')) {
                return 'markdown-vendor';
              }
              
              if (id.includes('highlight.js')) {
                return 'highlight-vendor';
              }
              
              if (id.includes('katex')) {
                return 'katex-vendor';
              }
              
              // Audio/Video
              if (id.includes('@elevenlabs')) {
                return 'elevenlabs-vendor';
              }
              
              if (id.includes('react-player')) {
                return 'player-vendor';
              }
              
              // Stripe
              if (id.includes('@stripe')) {
                return 'stripe-vendor';
              }
              
              // Capacitor (mobile)
              if (id.includes('@capacitor')) {
                return 'capacitor-vendor';
              }
              
              // JSON editors
              if (id.includes('json-edit-react') || id.includes('react-json')) {
                return 'json-editor-vendor';
              }
              
              // Virtual scrolling
              if (id.includes('react-virtualized') || id.includes('react-window') || id.includes('react-virtuoso')) {
                return 'virtual-vendor';
              }
              
              // Tables
              if (id.includes('@tanstack/react-table')) {
                return 'tanstack-vendor';
              }
              
              // Resizable components
              if (id.includes('react-resizable') || id.includes('re-resizable') || id.includes('react-rnd')) {
                return 'resizable-vendor';
              }
              
              // Cron editor
              if (id.includes('react-js-cron')) {
                return 'cron-vendor';
              }
              
              // Calendar
              if (id.includes('@fullcalendar')) {
                return 'calendar-vendor';
              }
              
              // ===== TIER 13: Smaller utilities (group together) =====
              
              // Group smaller utility libraries
              if (
                id.includes('numeral') ||
                id.includes('fuse.js') ||
                id.includes('query-string') ||
                id.includes('clipboard') ||
                id.includes('file-saver') ||
                id.includes('dompurify') ||
                id.includes('diff') ||
                id.includes('fflate') ||
                id.includes('tiktoken')
              ) {
                return 'utils-small';
              }
              
              // Group React utility hooks and components
              if (
                id.includes('react-use') ||
                id.includes('react-error-boundary') ||
                id.includes('react-helmet') ||
                id.includes('notistack') ||
                id.includes('nprogress')
              ) {
                return 'react-utils';
              }
              
              // All other node_modules (should be small now)
              return 'vendor-misc';
            }
          },
          minifyInternalExports: true,
          format: 'es',
        },
        maxParallelFileOps: isMobile ? 1 : 20,
      },
    },
    plugins: [
      react(),
      reactVirtualized(),
      wasm(),
      ...(isDev ? [mkcert()] : []),
      // Pre-compress assets with gzip for faster server delivery
      ...(!isDev ? [
        viteCompression({
          algorithm: 'gzip',
          ext: '.gz',
          threshold: 10240, // Only compress files > 10KB
          deleteOriginFile: false,
        }),
        // Also create brotli versions for modern browsers
        viteCompression({
          algorithm: 'brotliCompress',
          ext: '.br',
          threshold: 10240,
          deleteOriginFile: false,
        }),
      ] : []),
      ...(isAnalyze ? [visualizer({
        open: true,
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
        template: 'treemap', // sunburst, treemap, network
      })] : []),
    ],
    optimizeDeps: {
      exclude: [
        'fsevents',
        // Common problematic packages
        'react-virtualized',
        'react-beautiful-dnd',
        '@hello-pangea/dnd',
        'three',
        'firebase',
        '@monaco-editor/react',
        'monaco-editor',
        // AG Grid packages
        'ag-grid-react',
        '@ag-grid-community/react',
        '@ag-grid-community/core',
        '@ag-grid-enterprise/core',
        // Chart libraries
        'chart.js',
        'react-chartjs-2',
        // Survey libraries  
        'survey-core',
        'survey-creator-core',
        'survey-react-ui',
        'survey-creator-react',
        // JSON editors
        'react-json-editor-ajrm',
        'json-edit-react',
        // Lexical editor
        'lexical',
        '@lexical/react',
      ],
      include: [
        // Force include commonly needed packages
        'react',
        'react-dom',
        'react-router-dom',
        'react-redux',
        '@reduxjs/toolkit',
      ],
      ...(isMobile && { esbuildOptions: { target: 'es2019' } }),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@agents-sdk': path.resolve(__dirname, './agents-sdk/src'),
        ...Object.fromEntries(
          [
            'components',
            'assets',
            'pages',
            'sections',
            'hooks',
            'auth',
            'widgets',
            'routes',
            'editor',
            'redux',
            'lib',
            'utils',
            'api',
            '_mock',
            'locales',
          ].map((dir) => [`@${dir}`, path.resolve(__dirname, `./src/${dir}`)]),
        ),
        lodash: 'lodash-es',
      },
    },
    server: {
      proxy: {
        '/api': {
          target: 'https://api.altan.ai/',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
      https: isDev,
      host: isDev ? 'dev-local.altan.ai' : undefined,
    },
    esbuild: isMobile ? {
        target: 'es2019',
        supported: { 'top-level-await': false },
        drop: !isDev ? ['console', 'debugger'] : undefined,
        legalComments: 'none', // Remove comments to reduce size
        treeShaking: true,
    } : {
      // Drop console logs in production builds
      drop: !isDev ? ['console', 'debugger'] : undefined,
      legalComments: 'none',
      treeShaking: true,
    },
    // Performance optimizations
    worker: {
      format: 'es',
      rollupOptions: {
        output: {
          inlineDynamicImports: false,
        },
      },
    },
  };
});
