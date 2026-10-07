import type { ReactElement, ReactNode } from 'react';
import { destinosPermitidos, NavegacionPrincipal } from '@/shared/components/navegacion';
import { RegionAvisos } from '@/shared/components/superposiciones';
import { obtenerSesionDeEjemplo } from './_ejemplo/sesion';
import { DESTINOS, ETIQUETA_DE_ROL } from './destinos';

// Dinámico: depende de la sesión y no se guarda en caché compartida.
export const dynamic = 'force-dynamic';

type Propiedades = Readonly<{ children: ReactNode }>;

export default async function LayoutPanel({ children }: Propiedades): Promise<ReactElement> {
  const sesion = await obtenerSesionDeEjemplo();
  return (
    <div className="lg:flex">
      <NavegacionPrincipal
        destinos={destinosPermitidos(DESTINOS, sesion.rol)}
        usuario={{ nombre: sesion.nombre, rol: ETIQUETA_DE_ROL[sesion.rol] ?? sesion.rol }}
      />
      <main
        id="contenido"
        className="min-w-0 flex-1 px-gutter pt-6 pb-32 lg:px-gutter-lg lg:pt-gutter lg:pb-section"
      >
        <div className="mx-auto max-w-content">{children}</div>
      </main>
      <RegionAvisos />
    </div>
  );
}
