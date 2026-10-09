import type { ReactElement } from 'react';
import { EnlaceBoton } from '@/shared/components/acciones';
import { ChipEstado } from '@/shared/components/datos';
import { TablaDatos, type Columna } from '@/shared/components/tabla';
import { TextoOculto } from '@/shared/components/utilidades';
import type { GuardiaListado } from '../schemas/guardia';
import { SinResultados } from './sin-resultados';

type Propiedades = Readonly<{
  guardias: readonly GuardiaListado[];
  /** Solo el rol que puede editar ve la columna de acciones. */
  puedeEditar: boolean;
  hayFiltros: boolean;
}>;

function columnas(puedeEditar: boolean): Columna<GuardiaListado>[] {
  const base: Columna<GuardiaListado>[] = [
    { clave: 'nombre', encabezado: 'Nombre', fija: true, celda: (g) => g.nombre },
    {
      clave: 'dpi',
      encabezado: 'DPI',
      celda: (g) => <span className="tabular-nums">{g.dpi}</span>,
    },
    {
      clave: 'telefono',
      encabezado: 'Teléfono',
      celda: (g) => <span className="tabular-nums">{g.telefono ?? '—'}</span>,
    },
    {
      clave: 'asignaciones',
      encabezado: 'Asignaciones',
      alineacion: 'fin',
      celda: (g) => g.asignaciones,
    },
    {
      clave: 'estado',
      encabezado: 'Estado',
      celda: (g) =>
        g.sinAsignacion ? <ChipEstado estado="neutro">Sin asignación</ChipEstado> : null,
    },
  ];
  if (!puedeEditar) {
    return base;
  }
  return [
    ...base,
    {
      clave: 'acciones',
      encabezado: 'Acciones',
      celda: (g) => (
        <EnlaceBoton href={`/guardias/${g.id}/editar`} variante="fantasma" tamano="denso">
          Editar<TextoOculto> {`guardia ${g.nombre}`}</TextoOculto>
        </EnlaceBoton>
      ),
    },
  ];
}

/** Listado de guardias con el número de asignaciones de cada uno. */
export function TablaGuardias({ guardias, puedeEditar, hayFiltros }: Propiedades): ReactElement {
  return (
    <TablaDatos
      id="tabla-guardias"
      titulo="Guardias de seguridad"
      columnas={columnas(puedeEditar)}
      filas={guardias}
      claveDeFila={(guardia) => String(guardia.id)}
      vacio={<SinResultados hayFiltros={hayFiltros} hrefLimpiar="/guardias" objeto="guardias" />}
    />
  );
}
