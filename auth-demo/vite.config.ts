import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@altanlabs/database': path.resolve(__dirname, '../packages/database/dist')
    }
  },
  optimizeDeps: {
    include: ['@altanlabs/database']
  },
  css: {
    postcss: path.resolve(__dirname, 'postcss.config.js'),
  },
});