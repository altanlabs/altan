/* eslint-env node */
import react from '@vitejs/plugin-react';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { defineConfig, type PluginOption, type UserConfig } from 'vite';
import type { GetManualChunk } from 'rollup';
import mkcert from 'vite-plugin-mkcert';
import wasm from 'vite-plugin-wasm';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

const nodeRequire = createRequire(import.meta.url);
const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SRC_ALIAS_DIRS = [
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
] as const;

const WRONG_CODE = `import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";`;
const VENDOR_CHUNK_PREFIX = 'vendor';

type CriticalVendorGroup = {
  name: string;
  reason: string;
  matchers: RegExp[];
};

const CRITICAL_VENDOR_GROUPS: CriticalVendorGroup[] = [
  {
    name: 'vendor-mui',
    reason: 'MUI packages rely on Emotion at module evaluation time.',
    matchers: [/^@mui\//, /^@emotion\//],
  },
  {
    name: 'vendor-react-three',
    reason: 'React Three Fiber decorates three exports during module init.',
    matchers: [/^three$/, /^@react-three\//, /^postprocessing$/],
  },
  {
    name: 'vendor-reactflow',
    reason: 'React Flow integrates tightly with elk layout utilities.',
    matchers: [/^@reactflow\//, /^reactflow$/, /^elkjs$/],
  },
];

const manualChunkResolver: GetManualChunk = (() => {
  const cache = new Map<string, string>();

  return (id) => {
    if (!id.includes('node_modules')) {
      return undefined;
    }

    const packageName = getPackageNameFromId(id);
    if (!packageName) {
      return undefined;
    }

    if (cache.has(packageName)) {
      return cache.get(packageName);
    }

    const criticalGroup = CRITICAL_VENDOR_GROUPS.find(({ matchers }) =>
      matchers.some((matcher) => matcher.test(packageName)),
    );

    const chunkName = criticalGroup?.name ?? buildVendorChunkName(packageName);
    cache.set(packageName, chunkName);
    return chunkName;
  };
})();

function getPackageNameFromId(id: string): string | null {
  const normalizedId = id.replace(/\\/g, '/');
  const nodeModulesSegment = '/node_modules/';
  const index = normalizedId.lastIndexOf(nodeModulesSegment);

  if (index === -1) {
    return null;
  }

  const pathAfterNodeModules = normalizedId.slice(index + nodeModulesSegment.length);
  const [maybeScopeOrName, maybePackageName] = pathAfterNodeModules.split('/');

  if (!maybeScopeOrName) {
    return null;
  }

  if (maybeScopeOrName.startsWith('@')) {
    if (!maybePackageName) {
      return null;
    }
    return `${maybeScopeOrName}/${maybePackageName}`;
  }

  return maybeScopeOrName;
}

function buildVendorChunkName(packageName: string): string {
  return `${VENDOR_CHUNK_PREFIX}-${packageName
    .replace(/^@/, '')
    .replace(/[/.]/g, '-')
    .toLowerCase()}`;
}

function reactVirtualizedPatch(): PluginOption {
  return {
    name: 'altan:react-virtualized-patch',
    enforce: 'post',
    async configResolved(config) {
      try {
        const reactVirtualizedPath = nodeRequire.resolve('react-virtualized');
        const file = reactVirtualizedPath.replace(
          path.join('dist', 'commonjs', 'index.js'),
          path.join('dist', 'es', 'WindowScroller', 'utils', 'onScroll.js'),
        );
        const code = await fs.readFile(file, 'utf-8');

        if (!code.includes(WRONG_CODE)) {
          config.logger.info('[react-virtualized] patch not required');
          return;
        }

        const patchedCode = code.replace(WRONG_CODE, '');
        await fs.writeFile(file, patchedCode);
        config.logger.info('[react-virtualized] patched WindowScroller helper');
      } catch (error) {
        config.logger.warn(
          `[react-virtualized] failed to patch: ${(error as Error).message}`,
        );
      }
    },
  };
}

export default defineConfig(({ mode }): UserConfig => {
  const isDev = mode === 'development';
  const isMobile = process.env.VITE_BUILD_TARGET === 'mobile';
  const isAnalyze = process.env.ANALYZE === 'true';
  const buildTarget = isMobile ? 'es2019' : 'esnext';

  return {
    base: '/',
    build: {
      target: buildTarget,
      cssCodeSplit: true,
      emptyOutDir: true,
      minify: 'esbuild',
      sourcemap: isDev || isMobile,
      outDir: 'dist',
      assetsInlineLimit: isMobile ? 4096 : 0,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        treeshake: true,
        output: {
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          manualChunks: manualChunkResolver,
          minifyInternalExports: true,
          format: 'es',
        },
        maxParallelFileOps: isMobile ? 1 : 20,
      },
    },
    plugins: [
      react(),
      reactVirtualizedPatch(),
      wasm(),
      ...(isDev ? [mkcert()] : []),
      ...(!isDev
        ? [
            viteCompression({
              algorithm: 'gzip',
              ext: '.gz',
              threshold: 10240,
              deleteOriginFile: false,
            }),
            viteCompression({
              algorithm: 'brotliCompress',
              ext: '.br',
              threshold: 10240,
              deleteOriginFile: false,
            }),
          ]
        : []),
      ...(isAnalyze
        ? [
            visualizer({
              open: true,
              filename: 'dist/stats.html',
              gzipSize: true,
              brotliSize: true,
              template: 'treemap',
            }),
          ]
        : []),
    ],
    optimizeDeps: {
      exclude: [
        'fsevents',
        'react-virtualized',
        'react-beautiful-dnd',
        '@hello-pangea/dnd',
        'three',
        'firebase',
        '@monaco-editor/react',
        'monaco-editor',
        'ag-grid-react',
        '@ag-grid-community/react',
        '@ag-grid-community/core',
        '@ag-grid-enterprise/core',
        'chart.js',
        'react-chartjs-2',
        'survey-core',
        'survey-creator-core',
        'survey-react-ui',
        'survey-creator-react',
        'react-json-editor-ajrm',
        'json-edit-react',
        'lexical',
        '@lexical/react',
      ],
      include: ['react', 'react-dom', 'react-router-dom', 'react-redux', '@reduxjs/toolkit'],
      ...(isMobile && { esbuildOptions: { target: 'es2019' } }),
    },
    resolve: {
      alias: {
        '@': path.resolve(ROOT_DIR, './src'),
        '@agents-sdk': path.resolve(ROOT_DIR, './agents-sdk/src'),
        ...Object.fromEntries(
          SRC_ALIAS_DIRS.map((dir) => [`@${dir}`, path.resolve(ROOT_DIR, `./src/${dir}`)]),
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
          rewrite: (pathname) => pathname.replace(/^\/api/, ''),
        },
      },
      // mkcert plugin provides trusted local certificates in dev mode
      https: isDev ? {} : undefined,
      host: isDev ? 'dev-local.altan.ai' : undefined,
    },
    esbuild: isMobile
      ? {
          target: 'es2019',
          supported: { 'top-level-await': false },
          drop: !isDev ? ['console', 'debugger'] : undefined,
          legalComments: 'none',
          treeShaking: true,
        }
      : {
          drop: !isDev ? ['console', 'debugger'] : undefined,
          legalComments: 'none',
          treeShaking: true,
        },
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

