import { defineConfig } from 'vitest/config'

// Separate from vite.config.ts so tests don't load the Cloudflare Workers plugin.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
