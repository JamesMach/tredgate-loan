import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      'tests/failing_heal.spec.ts'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'tests/**',
        '**/*.config.ts',
        '**/main.ts'
      ]
    },
    reporters: ['default', 'html', 'json'],
    outputFile: {
      html: './test-results/index.html',
      json: './test-results/results.json'
    }
  }
})
