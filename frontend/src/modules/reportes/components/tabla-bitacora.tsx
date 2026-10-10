import type { ReactElement } from 'react';
import { TablaDatos, type Columna } from '@/shared/components/tabla';
import { formatearFechaHora } from '@/shared/lib/formato';
import type { Constancia } from '../schemas/bitacora';
import { ETIQUETA_DE_TIPO } from '../schemas/consulta';
import { FiltrosAplicadosDeLaConsulta } from './filtros-aplicados';
import { SinResultados } from './sin-resultados';

type Propiedades = Readonly<{ constancias: readonly Constancia[] }>;

const COLUMNAS: Columna<Constancia>[] = [
  {
    clave: 'fecha',
    encabezado: 'Fecha y hora',
    fija: true,
    celda: (c) => <span className="tabular-nums">{formatearFechaHora(c.fechaHora)}</span>,
  },
  {
    clave: 'usuario',
    encabezado: 'Usuario',
    celda: (c) => (
      <span className="flex flex-col">
        <span className="text-label">{c.usuario.nombre}</span>
        <span className="text-ink-muted">{c.usuario.correo}</span>
      </span>
    ),
  },
  { clave: 'tipo', encabezado: 'Reporte', celda: (c) => ETIQUETA_DE_TIPO[c.tipo] },
  {
    clave: 'filtros',
    encabezado: 'Filtros aplicados',
    celda: (c) => <FiltrosAplicadosDeLaConsulta filtros={c.filtros} />,
  },
];

/** Constancias de las consultas, de la más reciente a la más antigua. Solo se leen. */
export function TablaBitacora({ constancias }: Propiedades): ReactElement {
  return (
    <TablaDatos
      id="tabla-bitacora"
      titulo="Bitácora de consultas"
      columnas={COLUMNAS}
      filas={constancias}
      claveDeFila={(constancia) => String(constancia.id)}
      vacio={
        <SinResultados
          hrefLimpiar="/reportes/bitacora"
          textoDelEnlace="Limpiar filtros"
          objeto="consultas"
        />
      }
    />
  );
}
