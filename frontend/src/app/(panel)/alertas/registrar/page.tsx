import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { exigirDatos, FormularioDeLectura, listarBusesParaLectura } from '@/modules/alertas';
import { EstadoVacio } from '@/shared/components/datos';
import { EncabezadoPagina, Seccion, Tarjeta } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Registrar lectura' };

export default async function PaginaRegistrarLectura(): Promise<ReactElement> {
  const sesion = await exigirSesion(['OPERADOR_ESTACION']);
  const buses = exigirDatos(await listarBusesParaLectura());
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Registrar"
        resto="lectura"
        descripcion={`Pasajeros en ${sesion.estacion?.nombre ?? 'tu estación'}: la cifra la captura una persona.`}
      />
      {buses.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface">
          <EstadoVacio
            variante="sin-datos"
            titulo="No hay buses para registrar"
            texto="Ningún bus activo sirve a tu estación por ahora."
          />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Seccion id="demanda" destacado="Demanda" resto="en la estación">
            <Tarjeta>
              <FormularioDeLectura tipo="demanda" buses={buses} />
            </Tarjeta>
          </Seccion>
          <Seccion id="ocupacion" destacado="Ocupación" resto="de un bus">
            <Tarjeta>
              <FormularioDeLectura tipo="ocupacion" buses={buses} />
            </Tarjeta>
          </Seccion>
        </div>
      )}
    </div>
  );
}
