import type { ReactElement } from 'react';
import { EnlaceBoton } from '@/shared/components/acciones';
import { InsigniaLinea } from '@/shared/components/datos';
import { TablaDatos, type Columna } from '@/shared/components/tabla';
import { TextoOculto } from '@/shared/components/utilidades';
import type { Bus } from '../schemas/bus';
import { EstadoDelBus } from './estado-de-bus';
import { SinResultados } from './sin-resultados';

type Propiedades = Readonly<{
  buses: readonly Bus[];
  /** Líneas que pasan por la estación del operador; sus buses se resaltan. */
  resaltadas: readonly number[];
  hayFiltros: boolean;
}>;

function LineaDelBus({ bus, resaltada }: Readonly<{ bus: Bus; resaltada: boolean }>): ReactElement {
  if (bus.linea === null) {
    return <span className="text-ink-muted">Sin línea</span>;
  }
  return (
    <span className="flex items-center gap-3">
      <InsigniaLinea codigo={bus.linea.codigo} />
      <span className="flex flex-col">
        <span>{bus.linea.nombre}</span>
        {resaltada ? <span className="text-ink-muted">Pasa por tu estación</span> : null}
      </span>
    </span>
  );
}

function columnas(resaltadas: ReadonlySet<number>): Columna<Bus>[] {
  return [
    { clave: 'placa', encabezado: 'Placa', fija: true, celda: (b) => <b>{b.placa}</b> },
    {
      clave: 'capacidad',
      encabezado: 'Capacidad',
      alineacion: 'fin',
      celda: (b) => b.capacidadMax,
    },
    {
      clave: 'linea',
      encabezado: 'Línea',
      celda: (b) => (
        <LineaDelBus bus={b} resaltada={b.linea !== null && resaltadas.has(b.linea.id)} />
      ),
    },
    {
      clave: 'parqueo',
      encabezado: 'Parqueo',
      celda: (b) => `${b.parqueo.estacion.nombre} · ${b.parqueo.codigo}`,
    },
    { clave: 'estado', encabezado: 'Estado', celda: (b) => <EstadoDelBus estado={b.estado} /> },
    {
      clave: 'acciones',
      encabezado: 'Acciones',
      celda: (b) => (
        <EnlaceBoton href={`/flota/${b.id}`} variante="fantasma" tamano="denso">
          Abrir<TextoOculto> {`bus ${b.placa}`}</TextoOculto>
        </EnlaceBoton>
      ),
    },
  ];
}

/** Listado de buses con su línea, parqueo y estado. */
export function TablaBuses({ buses, resaltadas, hayFiltros }: Propiedades): ReactElement {
  const conjunto = new Set(resaltadas);
  return (
    <TablaDatos
      id="tabla-buses"
      titulo="Buses de la flota"
      columnas={columnas(conjunto)}
      filas={buses}
      claveDeFila={(bus) => String(bus.id)}
      seleccionada={(bus) => bus.linea !== null && conjunto.has(bus.linea.id)}
      vacio={<SinResultados hayFiltros={hayFiltros} hrefLimpiar="/flota" objeto="buses" />}
    />
  );
}
