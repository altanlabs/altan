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

const WRONG_CODE = `import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";`;

function reactVirtualized() {
  return {
    name: 'flat:react-virtualized',
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
        output: {
          // Fix chunk naming to ensure all assets go to assets/ directory
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js', 
          assetFileNames: 'assets/[name]-[hash].[ext]',
          // Remove ALL manual chunking - let Vite handle dependencies automatically
          manualChunks: undefined,
          minifyInternalExports: true,
          format: isMobile ? 'es' : 'es',
        },
        maxParallelFileOps: 2,
      },
    },
    plugins: [
      react({ jsxRuntime: 'automatic' }),
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
      exclude: ['fsevents'], // Only exclude platform-specific files
      ...(isMobile && { esbuildOptions: { target: 'es2019' } }),
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
    ...(isMobile && {
      esbuild: {
        target: 'es2019',
        supported: { 'top-level-await': false },
      },
    }),
  };
});
