import path from 'node:path';
import { fileURLToPath } from 'node:url';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sharedSrcRoot = path.resolve(__dirname, '../../packages/shared/src');

const alias = [
  {
    find: '@~',
    replacement: path.resolve(__dirname, './src'),
  },
  {
    find: '@kaeri/shared/',
    replacement: `${sharedSrcRoot}/`,
  },
  {
    find: '@kaeri/shared',
    replacement: path.resolve(sharedSrcRoot, 'index.ts'),
  },
];

const commonTestConfig = {
  globals: true,
  environment: 'node',
  clearMocks: true,
  restoreMocks: true,
  mockReset: true,
  watchExclude: ['dist/**', '.vitest/**'],
  env: {
    NODE_ENV: 'test',
  },
};

const baseProjectConfig = {
  plugins: [swc.vite({ tsconfigFile: './tsconfig.json' })],
  resolve: {
    alias,
  },
  cacheDir: 'node_modules/.vitest',
};

export default defineConfig({
  ...baseProjectConfig,
  test: {
    ...commonTestConfig,
    include: ['test/**/*.test.ts'],
    projects: [
      {
        ...baseProjectConfig,
        test: {
          ...commonTestConfig,
          name: 'unit',
          include: ['test/unit/**/*.test.ts', 'test/**/*.unit.test.ts'],
          exclude: ['test/integration/**', 'test/**/*.int.test.ts'],
          setupFiles: ['./test/helpers/matchers.ts'],
          isolate: true,
          sequence: {
            groupOrder: 0,
          },
        },
      },
      {
        ...baseProjectConfig,
        test: {
          ...commonTestConfig,
          name: 'integration',
          include: ['test/**/*.test.ts'],
          exclude: ['test/unit/**', 'test/**/*.unit.test.ts'],
          globalSetup: ['./test/global-setup.ts'],
          setupFiles: ['./test/helpers/setup.ts'],
          testTimeout: 10000,
          hookTimeout: 10000,
          isolate: false,
          fileParallelism: false,
          maxWorkers: 1,
          minWorkers: 1,
          sequence: {
            groupOrder: 1,
          },
        },
      },
    ],
  },
});
