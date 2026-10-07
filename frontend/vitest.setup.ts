import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { instalarDialogo } from './test/dialogo-jsdom';
import { cachesimulada, cabecerasSimuladas, cookiesSimuladas } from './test/simulaciones-next';

instalarDialogo();

vi.mock('next/headers', () => ({
  cookies: (): Promise<typeof cookiesSimuladas> => Promise.resolve(cookiesSimuladas),
  headers: (): Promise<typeof cabecerasSimuladas> => Promise.resolve(cabecerasSimuladas),
}));

vi.mock('next/cache', () => cachesimulada);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
