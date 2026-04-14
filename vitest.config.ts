import { defineConfig } from 'vitest/config';

/**
 * Vitest Configuration for Angular
 *
 * @see https://vitest.dev/config/
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setup-vitest.ts'],
    include: ['src/**/*.spec.ts'],
    transformMode: {
      ssr: true,
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.spec.ts',
        '**/*.d.ts',
        '**/*.config.*',
        'e2e/',
      ],
      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src/app',
      '@core': '/src/app/core',
      '@shared': '/src/app/shared',
      '@features': '/src/app/features',
    },
  },
});
