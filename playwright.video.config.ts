import { defineConfig } from '@playwright/test';

import baseConfig from './playwright.config';

const htmlOutputDir = process.env.PLAYWRIGHT_HTML_OUTPUT_DIR;

export default defineConfig({
  ...baseConfig,
  reporter: [
    ['list'],
    ['html', htmlOutputDir ? { open: 'never', outputFolder: htmlOutputDir } : { open: 'never' }],
  ],
  use: {
    ...baseConfig.use,
    video: 'on',
  },
});