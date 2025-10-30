import react from '@vitejs/plugin-react';
import autoprefixer from 'autoprefixer';
import fs from 'fs/promises';
import { createRequire } from 'module';
import path from 'path';
import tailwindcss from 'tailwindcss';
import url from 'url';
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import wasm from 'vite-plugin-wasm';

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
  return {
    base: '/',  
    build: {
      target: isMobile ? 'es2019' : 'esnext',
      cssCodeSplit: !isMobile,
      emptyOutDir: true,
      minify: false, // Disable minification to avoid PropTypes circular dependency issues
      sourcemap: isDev || isMobile,
      outDir: 'dist',
      assetsInlineLimit: isMobile ? 4096 : 0,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        treeshake: false, // Disable tree-shaking to avoid readonly property issues
        output: {
          // Fix chunk naming to ensure all assets go to assets/ directory
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js', 
          assetFileNames: 'assets/[name]-[hash].[ext]',
          // Remove ALL manual chunking - let Vite handle dependencies automatically
          manualChunks: undefined,
          minifyInternalExports: false, // Disable this to avoid property assignment issues
          format: isMobile ? 'es' : 'es',
        },
        maxParallelFileOps: 1, // Reduce parallel operations in CI
      },
    },
    plugins: [
      react(),
      reactVirtualized(),
      wasm(),
      ...(isDev ? [mkcert()] : []),
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
    ...(isMobile && {
      esbuild: {
        target: 'es2019',
        supported: { 'top-level-await': false },
      },
    }),
  };
});
