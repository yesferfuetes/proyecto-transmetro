import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { exigirDatos, listarFlotaPorLinea, TablaFlotaPorLinea } from '@/modules/flota';
import { EnlaceBoton } from '@/shared/components/acciones';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Flota por línea' };

export default async function PaginaFlotaPorLinea(): Promise<ReactElement> {
  await exigirSesion();
  const lineas = exigirDatos(await listarFlotaPorLinea());
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Flota"
        resto="por línea"
        descripcion="Cuántos buses tiene cada línea frente al mínimo y el máximo que le corresponden."
        acciones={
          <EnlaceBoton href="/flota" variante="secundario" icono="bus">
            Ver todos los buses
          </EnlaceBoton>
        }
      />
      <TablaFlotaPorLinea lineas={lineas} />
    </div>
  );
}
