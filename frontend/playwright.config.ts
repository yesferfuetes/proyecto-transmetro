import { defineConfig, devices } from '@playwright/test';

const PUERTO = 3100;
const urlBase = process.env.E2E_BASE_URL ?? `http://localhost:${PUERTO}`;
const enIntegracionContinua = Boolean(process.env.CI);

export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/*.test.ts',
  fullyParallel: true,
  forbidOnly: enIntegracionContinua,
  retries: enIntegracionContinua ? 1 : 0,
  reporter: enIntegracionContinua ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: urlBase,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Sin E2E_BASE_URL se levanta la salida standalone ya construida (npm run build).
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run start',
        url: urlBase,
        reuseExistingServer: !enIntegracionContinua,
        env: {
          PORT: String(PUERTO),
          BACKEND_URL: process.env.BACKEND_URL ?? 'http://localhost:3001',
        },
      },
});
