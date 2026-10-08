import { redirect } from 'next/navigation';
import { describe, expect, it, vi } from 'vitest';
import { borrarToken } from '@/shared/lib/sesion/cookie';
import { cerrarSesion } from './cerrar-sesion';

vi.mock('@/shared/lib/sesion/cookie', () => ({ borrarToken: vi.fn() }));
vi.mock('next/navigation', () => ({
  redirect: vi.fn((destino: string) => {
    throw new Error(`redirect:${destino}`);
  }),
}));

describe('cerrarSesion', () => {
  it('borra la cookie y lleva a iniciar sesión', async () => {
    await expect(cerrarSesion()).rejects.toThrow('redirect:/login');

    expect(borrarToken).toHaveBeenCalledOnce();
    expect(redirect).toHaveBeenCalledWith('/login');
  });
});
