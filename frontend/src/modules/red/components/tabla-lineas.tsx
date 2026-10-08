import type { ReactElement } from 'react';
import { EnlaceBoton } from '@/shared/components/acciones';
import { InsigniaLinea } from '@/shared/components/datos';
import { TablaDatos, type Columna } from '@/shared/components/tabla';
import { TextoOculto } from '@/shared/components/utilidades';
import { formatearKm } from '@/shared/lib/formato';
import type { LineaListado } from '../schemas/linea';
import { EstadoDeLinea } from './estado-de-linea';
import { SinResultados } from './sin-resultados';

type Propiedades = Readonly<{
  lineas: readonly LineaListado[];
  /** Líneas que pasan por la estación del operador; se resaltan. */
  resaltadas: readonly number[];
  hayFiltros: boolean;
}>;

function columnas(resaltadas: ReadonlySet<number>): Columna<LineaListado>[] {
  return [
    {
      clave: 'linea',
      encabezado: 'Línea',
      fija: true,
      celda: (linea) => (
        <span className="flex items-center gap-3">
          <InsigniaLinea codigo={linea.codigo} />
          <span className="flex flex-col">
            <span className="text-label">{linea.nombre}</span>
            {resaltadas.has(linea.id) ? (
              <span className="text-ink-muted">Pasa por tu estación</span>
            ) : null}
          </span>
        </span>
      ),
    },
    { clave: 'municipalidad', encabezado: 'Municipalidad', celda: (l) => l.municipalidad.nombre },
    { clave: 'estado', encabezado: 'Estado', celda: (l) => <EstadoDeLinea estado={l.estado} /> },
    {
      clave: 'estaciones',
      encabezado: 'Estaciones',
      alineacion: 'fin',
      celda: (l) => l.numeroDeEstaciones,
    },
    {
      clave: 'longitud',
      encabezado: 'Longitud',
      alineacion: 'fin',
      celda: (l) => formatearKm(l.longitudKm),
    },
    {
      clave: 'acciones',
      encabezado: 'Acciones',
      celda: (l) => (
        <EnlaceBoton href={`/lineas/${l.id}`} variante="fantasma" tamano="denso">
          Abrir<TextoOculto> {`línea ${l.codigo}`}</TextoOculto>
        </EnlaceBoton>
      ),
    },
  ];
}

/** Listado de líneas con su identidad de color, estado y longitud. */
export function TablaLineas({ lineas, resaltadas, hayFiltros }: Propiedades): ReactElement {
  const conjunto = new Set(resaltadas);
  return (
    <TablaDatos
      id="tabla-lineas"
      titulo="Líneas de la red"
      columnas={columnas(conjunto)}
      filas={lineas}
      claveDeFila={(linea) => String(linea.id)}
      seleccionada={(linea) => conjunto.has(linea.id)}
      vacio={<SinResultados hayFiltros={hayFiltros} hrefLimpiar="/lineas" objeto="líneas" />}
    />
  );
}
