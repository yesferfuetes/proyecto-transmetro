import type { ReactElement } from 'react';
import { EnlaceBoton } from '@/shared/components/acciones';
import { InsigniaLinea } from '@/shared/components/datos';
import { TablaDatos, type Columna } from '@/shared/components/tabla';
import { TextoOculto } from '@/shared/components/utilidades';
import type { FlotaDeLinea } from '../schemas/flota-por-linea';
import { EstadoDeLaFlota } from './estado-de-flota';
import { SinResultados } from './sin-resultados';

type Propiedades = Readonly<{ lineas: readonly FlotaDeLinea[] }>;

const COLUMNAS: Columna<FlotaDeLinea>[] = [
  {
    clave: 'linea',
    encabezado: 'Línea',
    fija: true,
    celda: ({ linea }) => (
      <span className="flex items-center gap-3">
        <InsigniaLinea codigo={linea.codigo} />
        <span className="text-label">{linea.nombre}</span>
      </span>
    ),
  },
  { clave: 'estaciones', encabezado: 'Estaciones', alineacion: 'fin', celda: (f) => f.estaciones },
  { clave: 'minimo', encabezado: 'Mínimo', alineacion: 'fin', celda: (f) => f.minimo },
  { clave: 'maximo', encabezado: 'Máximo', alineacion: 'fin', celda: (f) => f.maximo },
  { clave: 'buses', encabezado: 'Buses', alineacion: 'fin', celda: (f) => f.buses },
  {
    clave: 'estado',
    encabezado: 'Estado de la flota',
    celda: (f) => <EstadoDeLaFlota estado={f.estadoDeFlota} />,
  },
  {
    clave: 'acciones',
    encabezado: 'Acciones',
    celda: ({ linea }) => (
      <EnlaceBoton href={`/flota?lineaId=${linea.id}`} variante="fantasma" tamano="denso">
        Ver buses<TextoOculto> {`de la línea ${linea.codigo}`}</TextoOculto>
      </EnlaceBoton>
    ),
  },
];

/** Por línea: estaciones, mínimo y máximo de buses, buses asignados y estado de la flota. */
export function TablaFlotaPorLinea({ lineas }: Propiedades): ReactElement {
  return (
    <TablaDatos
      id="tabla-flota-por-linea"
      titulo="Flota por línea"
      columnas={COLUMNAS}
      filas={lineas}
      claveDeFila={(fila) => String(fila.linea.id)}
      vacio={<SinResultados hayFiltros={false} hrefLimpiar="/flota/lineas" objeto="líneas" />}
    />
  );
}
