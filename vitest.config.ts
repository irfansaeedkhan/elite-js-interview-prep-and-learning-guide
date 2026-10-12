import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // forks/threads lose the Vitest runner binding on this Vite 8 + Windows setup.
    pool: 'vmForks',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '#site/content': path.resolve(__dirname, 'src/test/mocks/site-content.ts'),
    },
  },
});
