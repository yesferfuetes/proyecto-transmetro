import type { ReactElement, ReactNode } from 'react';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámico: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

type Propiedades = Readonly<{ children: ReactNode }>;

/** Toda la administración de usuarios es solo para el administrador. */
export default async function LayoutUsuarios({ children }: Propiedades): Promise<ReactElement> {
  await exigirSesion(['ADMINISTRADOR']);
  return <>{children}</>;
}
