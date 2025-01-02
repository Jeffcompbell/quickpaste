import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        // Shortcut of `build.lib.entry`
        entry: 'electron/main.ts',
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`
        input: 'electron/preload.ts',
      },
      // Manually transform some third-party dependencies
      // See: https://github.com/electron-vite/vite-plugin-electron/tree/main/packages/electron-renderer#usage
      renderer: {},
    }),
  ],
  build: {
    rollupOptions: {
      external: ['node-fetch'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
