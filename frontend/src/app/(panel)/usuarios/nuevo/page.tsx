import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { EncabezadoPagina, Tarjeta } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';
import { exigirDatos, FormularioUsuario, listarEstacionesAsignables } from '@/modules/usuarios';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Nuevo usuario' };

export default async function NuevoUsuario(): Promise<ReactElement> {
  await exigirSesion(['ADMINISTRADOR']);
  const estaciones = exigirDatos(await listarEstacionesAsignables());
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Nuevo"
        resto="usuario"
        descripcion="El usuario queda activo y puede iniciar sesión con la contraseña inicial."
      />
      <Tarjeta className="lg:max-w-4xl">
        <FormularioUsuario estaciones={estaciones} />
      </Tarjeta>
    </div>
  );
}
