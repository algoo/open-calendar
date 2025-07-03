import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
// INFO - CJ - 2025-07-03 - This plugin show tsc errors on vite dev
import pluginChecker from 'vite-plugin-checker'

export default defineConfig({
  plugins: [
    nodePolyfills(),
    pluginChecker({ typescript: true }),
  ],
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'CalendarClient',
      fileName: 'index',
    },
  },
  resolve: {
    alias: {
      'node-fetch': 'axios',
    },
  },
})
