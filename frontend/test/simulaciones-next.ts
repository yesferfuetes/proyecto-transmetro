import { vi } from 'vitest';

/**
 * Simulaciones de las APIs de servidor de Next.js para probar acciones de servidor y la capa de
 * datos sin levantar el framework. Cada prueba configura lo que necesite, por ejemplo:
 *   cookiesSimuladas.get.mockReturnValue({ name: 'sesion', value: 'token' });
 */
export const cookiesSimuladas = {
  get: vi.fn<(nombre: string) => { name: string; value: string } | undefined>(),
  set: vi.fn(),
  delete: vi.fn(),
  has: vi.fn<(nombre: string) => boolean>(),
};

export const cabecerasSimuladas = {
  get: vi.fn<(nombre: string) => string | null>(),
};

export const cachesimulada = {
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
};
