/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import path from 'path';

export default defineConfig(({ mode }) => ({
  define: {
    "process.env": {
    ...loadEnv(mode, path.resolve(__dirname), "")
    }
  },
  plugins: [
    react(),
    legacy(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
}));
