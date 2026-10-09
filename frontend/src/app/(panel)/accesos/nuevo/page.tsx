import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { EnlaceBoton } from '@/shared/components/acciones';
import {
  esquemaIdOpcional,
  exigirDatos,
  FormularioAcceso,
  listarOpcionesDeEstacion,
  listarOpcionesDeGuardia,
} from '@/modules/accesos';
import { Aviso } from '@/shared/components/superposiciones';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Nuevo acceso' };

export default async function PaginaNuevoAcceso({
  searchParams,
}: PageProps<'/accesos/nuevo'>): Promise<ReactElement> {
  await exigirSesion(['SUPERVISOR_MUNICIPAL']);
  const estacionInicial = esquemaIdOpcional.parse((await searchParams).estacionId);
  const [estaciones, guardias] = await Promise.all([
    listarOpcionesDeEstacion().then(exigirDatos),
    listarOpcionesDeGuardia().then(exigirDatos),
  ]);
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Nuevo"
        resto="acceso"
        descripcion="Todo acceso se registra con su primer guardia y su turno."
      />
      {guardias.length === 0 ? (
        <Aviso estado="advertencia" titulo="Aún no hay guardias registrados.">
          <p>Registra al menos un guardia para poder crear un acceso.</p>
          <EnlaceBoton href="/guardias/nuevo" variante="secundario" className="mt-3">
            Registrar guardia
          </EnlaceBoton>
        </Aviso>
      ) : null}
      <FormularioAcceso
        estaciones={estaciones.map((e) => ({
          valor: String(e.id),
          etiqueta: `${e.codigo} · ${e.nombre}`,
        }))}
        guardias={guardias.map((g) => ({
          valor: String(g.id),
          etiqueta: `${g.nombre} · ${g.dpi}`,
        }))}
        estacionInicialId={estacionInicial === undefined ? undefined : String(estacionInicial)}
      />
    </div>
  );
}
