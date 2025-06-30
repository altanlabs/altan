// vite.config.mjs
import react from '@vitejs/plugin-react-swc';
import autoprefixer from 'autoprefixer';
import fs from 'fs/promises';
import { createRequire } from 'module';
import path from 'path';
import tailwindcss from 'tailwindcss';
import url from 'url';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import wasm from 'vite-plugin-wasm';

// import topLevelAwait from "vite-plugin-top-level-await";

const WRONG_CODE = `import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";`;

function reactVirtualized() {
  return {
    name: 'flat:react-virtualized',
    // Note: we cannot use the `transform` hook here
    //       because libraries are pre-bundled in vite directly,
    //       plugins aren't able to hack that step currently.
    //       so instead we manually edit the file in node_modules.
    //       all we need is to find the timing before pre-bundling.
    configResolved: async () => {
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
      const modified = code.replace(WRONG_CODE, '');
      await fs.writeFile(file, modified);
    },
  };
}

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  const isMobile = process.env.VITE_BUILD_TARGET === 'mobile';
  // const isProd = mode === 'production';

  return {
    build: {
      target: 'esnext', // Use modern JS
      cssCodeSplit: !isMobile, // For mobile, keep CSS together
      emptyOutDir: true,                 // wipe old chunks → avoids 404s
      minify: isDev ? false : 'esbuild', // Faster dev builds, minified production
      sourcemap: isDev, // Generate sourcemaps only in dev
      outDir: 'dist', // Build output directory
      assetsInlineLimit: 0, // Extract small assets instead of inlining
      reportCompressedSize: false, // Disable compressed size reporting for speed
      chunkSizeWarningLimit: 1000, // Raise default chunk size warning limit
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Always use chunking for better memory management
            if (id.includes('node_modules')) {
              // Group vendor chunks more efficiently
              if (id.includes('@mui')) return 'mui';
              if (id.includes('react') && !id.includes('react-router')) return 'react-vendor';
              if (id.includes('redux')) return 'redux';
              if (id.includes('@ionic')) return 'ionic';
              if (id.includes('recharts') || id.includes('chart')) return 'charts';
              if (id.includes('@ag-grid')) return 'ag-grid';
              if (id.includes('lexical') || id.includes('@lexical')) return 'lexical';
              return 'vendor';
            }
          },
          minifyInternalExports: true,
        },
        // Increase memory for Rollup
        maxParallelFileOps: 2, // Reduce parallel operations to save memory
      },
    },
    plugins: [
      react(),
      reactVirtualized(),
      wasm(),
      ...(isDev ? [mkcert()] : []), // Only use mkcert in dev
      {
        name: 'vite:tailwind',
        enforce: 'post',
        config: () => ({
          css: {
            postcss: {
              plugins: [tailwindcss(), autoprefixer()],
            },
          },
        }),
      },
      // topLevelAwait()
      // comlink()
    ],
    // worker: {
    //   plugins: [comlink()],
    // },
    optimizeDeps: {
      include: ['react', 'react-dom', '@ionic/react', '@ionic/core'],
      exclude: ['fsevents'],
    },
    resolve: {
      alias: {
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
  };
});
