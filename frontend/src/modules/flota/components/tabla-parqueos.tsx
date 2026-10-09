import type { ReactElement } from 'react';
import { EnlaceBoton } from '@/shared/components/acciones';
import { TablaDatos, type Columna } from '@/shared/components/tabla';
import { TextoOculto } from '@/shared/components/utilidades';
import type { Parqueo } from '../schemas/parqueo';
import { EliminarParqueo } from './eliminar-parqueo';
import { SinResultados } from './sin-resultados';

type Propiedades = Readonly<{
  parqueos: readonly Parqueo[];
  /** Solo el supervisor ve las acciones de escritura. */
  puedeEscribir: boolean;
}>;

function columnas(puedeEscribir: boolean): Columna<Parqueo>[] {
  const base: Columna<Parqueo>[] = [
    {
      clave: 'estacion',
      encabezado: 'Estación',
      fija: true,
      celda: (p) => `${p.estacion.codigo} · ${p.estacion.nombre}`,
    },
    { clave: 'codigo', encabezado: 'Código', celda: (p) => p.codigo },
    {
      clave: 'capacidad',
      encabezado: 'Capacidad',
      alineacion: 'fin',
      celda: (p) => p.capacidadVehiculos,
    },
    { clave: 'buses', encabezado: 'Buses', alineacion: 'fin', celda: (p) => p.buses },
    {
      clave: 'ocupacion',
      encabezado: 'Ocupación',
      celda: (p) => `${p.buses} de ${p.capacidadVehiculos}`,
    },
  ];
  if (!puedeEscribir) {
    return base;
  }
  return [
    ...base,
    {
      clave: 'acciones',
      encabezado: 'Acciones',
      celda: (p) => (
        <span className="flex items-center gap-2">
          <EnlaceBoton href={`/flota/parqueos/${p.id}/editar`} variante="fantasma" tamano="denso">
            Editar<TextoOculto> {`parqueo ${p.codigo} de ${p.estacion.nombre}`}</TextoOculto>
          </EnlaceBoton>
          <EliminarParqueo id={p.id} codigo={p.codigo} estacion={p.estacion.nombre} />
        </span>
      ),
    },
  ];
}

/** Parqueos con los buses que guardan y su ocupación. */
export function TablaParqueos({ parqueos, puedeEscribir }: Propiedades): ReactElement {
  return (
    <TablaDatos
      id="tabla-parqueos"
      titulo="Parqueos de la red"
      columnas={columnas(puedeEscribir)}
      filas={parqueos}
      claveDeFila={(parqueo) => String(parqueo.id)}
      vacio={<SinResultados hayFiltros={false} hrefLimpiar="/flota/parqueos" objeto="parqueos" />}
    />
  );
}
