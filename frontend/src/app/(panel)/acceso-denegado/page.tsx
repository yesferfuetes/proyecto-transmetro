import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { TarjetaBloqueada } from '@/shared/components/datos';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Acceso denegado' };

export default async function AccesoDenegado(): Promise<ReactElement> {
  await exigirSesion();
  return (
    <div className="lg:max-w-4xl">
      <TarjetaBloqueada
        variante="pagina"
        titulo="Vista restringida"
        icono="candado"
        explicacion="Esta vista está disponible para otro rol. Si la necesitas, solicita el cambio de rol al administrador."
        volverA="/inicio"
      />
    </div>
  );
}
