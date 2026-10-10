import type { ReactElement } from 'react';
import { ChipEstado, InsigniaLinea } from '@/shared/components/datos';
import { TablaDatos, type Columna } from '@/shared/components/tabla';
import { formatearFechaHora } from '@/shared/lib/formato';
import type { Alerta } from '../schemas/alerta';
import { ETIQUETA_DE_TIPO } from '../schemas/alerta';
import { AtenderAlerta } from './atender-alerta';
import { formatearPorcentaje } from './presentacion';
import { SinAlertas } from './sin-alertas';

type Propiedades = Readonly<{
  alertas: readonly Alerta[];
  /** Supervisor y administrador ven alertas de varias estaciones; el operador, solo la suya. */
  mostrarEstacion: boolean;
  /** Solo el operador atiende. */
  puedeAtender: boolean;
  resaltada?: number;
  hayFiltros: boolean;
}>;

function Tipo({ alerta }: Readonly<{ alerta: Alerta }>): ReactElement {
  const sobrecupo = alerta.tipo === 'SOBRECUPO';
  return (
    <ChipEstado
      estado={sobrecupo ? 'error' : 'advertencia'}
      icono={sobrecupo ? 'sobrecupo' : 'baja-ocupacion'}
    >
      {ETIQUETA_DE_TIPO[alerta.tipo]}
    </ChipEstado>
  );
}

function Linea({ alerta }: Readonly<{ alerta: Alerta }>): ReactElement {
  if (alerta.linea === null) {
    return <span className="text-ink-muted">Sin línea</span>;
  }
  return (
    <span className="flex items-center gap-3">
      <InsigniaLinea codigo={alerta.linea.codigo} />
      {alerta.linea.nombre}
    </span>
  );
}

function Estado({ alerta }: Readonly<{ alerta: Alerta }>): ReactElement {
  if (!alerta.atendida) {
    return <ChipEstado estado="advertencia">Pendiente</ChipEstado>;
  }
  return (
    <span className="flex flex-col items-start gap-1">
      <ChipEstado estado="exito">Atendida</ChipEstado>
      {alerta.atendidaPor ? (
        <span className="text-ink-muted">por {alerta.atendidaPor.nombre}</span>
      ) : null}
    </span>
  );
}

function columnas({
  mostrarEstacion,
  puedeAtender,
}: Pick<Propiedades, 'mostrarEstacion' | 'puedeAtender'>): Columna<Alerta>[] {
  const todas: (Columna<Alerta> | false)[] = [
    { clave: 'tipo', encabezado: 'Tipo', fija: true, celda: (a) => <Tipo alerta={a} /> },
    mostrarEstacion && {
      clave: 'estacion',
      encabezado: 'Estación',
      celda: (a) => a.estacion.nombre,
    },
    { clave: 'bus', encabezado: 'Bus', celda: (a) => <b>{a.bus.placa}</b> },
    { clave: 'linea', encabezado: 'Línea', celda: (a) => <Linea alerta={a} /> },
    {
      clave: 'porcentaje',
      encabezado: 'Porcentaje',
      alineacion: 'fin',
      celda: (a) => formatearPorcentaje(a.porcentaje),
    },
    {
      clave: 'fecha',
      encabezado: 'Fecha y hora',
      celda: (a) => <span className="tabular-nums">{formatearFechaHora(a.fechaHora)}</span>,
    },
    { clave: 'estado', encabezado: 'Estado', celda: (a) => <Estado alerta={a} /> },
    { clave: 'aviso', encabezado: 'Aviso', celda: (a) => a.aviso },
    puedeAtender && {
      clave: 'acciones',
      encabezado: 'Acciones',
      celda: (a) => (a.atendida ? null : <AtenderAlerta alertaId={a.id} placa={a.bus.placa} />),
    },
  ];
  return todas.filter((columna): columna is Columna<Alerta> => columna !== false);
}

/** Alertas de capacidad, pendientes primero. Es de servidor: el navegador no guarda las alertas. */
export function TablaAlertas({
  alertas,
  mostrarEstacion,
  puedeAtender,
  resaltada,
  hayFiltros,
}: Propiedades): ReactElement {
  return (
    <TablaDatos
      id="tabla-alertas"
      titulo="Alertas de capacidad"
      columnas={columnas({ mostrarEstacion, puedeAtender })}
      filas={alertas}
      claveDeFila={(alerta) => String(alerta.id)}
      seleccionada={(alerta) => alerta.id === resaltada}
      vacio={<SinAlertas hayFiltros={hayFiltros} />}
    />
  );
}
