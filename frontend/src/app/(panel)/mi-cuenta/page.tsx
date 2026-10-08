import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { EncabezadoPagina, Seccion, Tarjeta } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';
import { DatosDeCuenta, FormularioCambiarContrasena } from '@/modules/usuarios';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Mi cuenta' };

export default async function MiCuenta(): Promise<ReactElement> {
  const cuenta = await exigirSesion();
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina destacado="Mi" resto="cuenta" />
      <Tarjeta className="lg:max-w-4xl">
        <DatosDeCuenta cuenta={cuenta} />
      </Tarjeta>
      <Seccion id="cambiar-contrasena" destacado="Cambiar" resto="contraseña">
        <Tarjeta className="lg:max-w-4xl">
          <FormularioCambiarContrasena />
        </Tarjeta>
      </Seccion>
    </div>
  );
}
