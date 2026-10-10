import type { ReactElement, ReactNode } from 'react';
import { leerPendientesDeAlertas } from '@/modules/alertas';
import { BotonCerrarSesion } from '@/modules/usuarios';
import { destinosPermitidos, NavegacionPrincipal } from '@/shared/components/navegacion';
import { RegionAvisos } from '@/shared/components/superposiciones';
import { exigirSesion } from '@/shared/lib/sesion/sesion';
import { ETIQUETA_DE_ROL } from '@/shared/schemas/sesion';
import { DESTINOS } from './destinos';

// Dinámico: depende de la sesión y no se guarda en caché compartida.
export const dynamic = 'force-dynamic';

type Propiedades = Readonly<{ children: ReactNode }>;

export default async function LayoutPanel({ children }: Propiedades): Promise<ReactElement> {
  const sesion = await exigirSesion();
  const rol = ETIQUETA_DE_ROL[sesion.rol];
  const pendientes = await leerPendientesDeAlertas();
  const destinos = destinosPermitidos(DESTINOS, sesion.rol).map((destino) =>
    destino.href === '/alertas' ? { ...destino, contador: pendientes } : destino,
  );
  return (
    <div className="lg:flex">
      <NavegacionPrincipal
        destinos={destinos}
        usuario={{
          nombre: sesion.nombre,
          rol: sesion.estacion === null ? rol : `${rol} · ${sesion.estacion.nombre}`,
        }}
        cuenta="/mi-cuenta"
        cierreDeSesion={<BotonCerrarSesion />}
      />
      <main
        id="contenido"
        tabIndex={-1}
        className="min-w-0 flex-1 px-gutter pt-6 pb-32 focus:outline-none lg:px-gutter-lg lg:pt-gutter lg:pb-section"
      >
        <div className="mx-auto max-w-content">{children}</div>
      </main>
      <RegionAvisos />
    </div>
  );
}
