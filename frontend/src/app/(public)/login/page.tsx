import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { ReactElement } from 'react';
import { Tarjeta, TituloDosTonos } from '@/shared/components/superficies';
import { obtenerSesion } from '@/shared/lib/sesion/sesion';
import { AvisoSesionExpirada, FormularioInicioSesion } from '@/modules/usuarios';

// Dinámica: lee la cookie de sesión y los parámetros de búsqueda en cada solicitud.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Iniciar sesión' };

export default async function InicioDeSesion({
  searchParams,
}: PageProps<'/login'>): Promise<ReactElement> {
  if ((await obtenerSesion()) !== null) {
    redirect('/inicio');
  }
  const { motivo } = await searchParams;
  return (
    <main
      id="contenido"
      tabIndex={-1}
      className="flex min-h-screen items-center justify-center bg-canvas px-gutter py-section focus:outline-none"
    >
      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-heading text-primary">Transmetro</p>
          <p className="text-dense text-ink-muted">Municipalidad de Guatemala</p>
        </div>
        {motivo === 'expirada' ? <AvisoSesionExpirada /> : null}
        <Tarjeta className="flex flex-col gap-6">
          <TituloDosTonos nivel={1} destacado="Iniciar" resto="sesión" />
          <FormularioInicioSesion />
        </Tarjeta>
      </div>
    </main>
  );
}
