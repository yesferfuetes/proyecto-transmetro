import type { ReactElement, ReactNode } from 'react';
import { InsigniaLinea } from '@/shared/components/datos';
import { FranjaSuperior, Seccion, Tarjeta } from '@/shared/components/superficies';
import { Aviso } from '@/shared/components/superposiciones';
import type { Bus } from '../schemas/bus';
import { EstadoDelBus } from './estado-de-bus';
import { ListaDeDatos } from './lista-de-datos';

type Propiedades = Readonly<{
  bus: Bus;
  /** Acciones de escritura; solo llegan para el rol que puede usarlas. */
  acciones?: ReactNode;
  /** Formularios de línea, parqueo y estado; solo para el rol que puede usarlos. */
  cambioDeLinea?: ReactNode;
  cambioDeParqueo?: ReactNode;
  cambioDeEstado?: ReactNode;
}>;

function Lineas({ bus }: Readonly<{ bus: Bus }>): ReactElement {
  if (bus.linea === null) {
    return <p className="text-body text-ink-muted">Este bus no sirve a ninguna línea.</p>;
  }
  return (
    <p className="flex items-center gap-3 text-body">
      <InsigniaLinea codigo={bus.linea.codigo} tamano="mediano" />
      {bus.linea.nombre}
    </p>
  );
}

function Bloque({
  titulo,
  formulario,
  children,
}: Readonly<{ titulo: string; formulario?: ReactNode; children: ReactNode }>): ReactElement {
  return (
    <Tarjeta className="flex flex-col gap-4">
      <h3 className="text-subheading text-ink">{titulo}</h3>
      {children}
      {formulario ? <div className="border-t border-border pt-4">{formulario}</div> : null}
    </Tarjeta>
  );
}

/** Ficha de un bus: franja con su placa y estado, datos, línea y parqueo. */
export function DetalleBus({
  bus,
  acciones,
  cambioDeLinea,
  cambioDeParqueo,
  cambioDeEstado,
}: Propiedades): ReactElement {
  return (
    <div className="flex flex-col gap-6">
      <FranjaSuperior variante="compacta" etiqueta={`Bus ${bus.placa}`}>
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-title text-ink-inverse lg:text-title-lg">{bus.placa}</h1>
          <EstadoDelBus estado={bus.estado} tono="oscuro" />
        </div>
      </FranjaSuperior>
      {bus.estado === 'BAJA' ? (
        <Aviso estado="informacion" titulo="Este bus está de baja.">
          La baja es definitiva: no cambia de línea ni de estado.
        </Aviso>
      ) : null}
      {acciones ? <div className="flex flex-wrap gap-3">{acciones}</div> : null}
      <Tarjeta como="section">
        <ListaDeDatos
          datos={[
            { clave: 'placa', etiqueta: 'Placa', valor: bus.placa },
            {
              clave: 'capacidad',
              etiqueta: 'Capacidad máxima',
              valor: <span className="tabular-nums">{bus.capacidadMax} pasajeros</span>,
            },
          ]}
        />
      </Tarjeta>
      <Seccion id="linea" destacado="Línea" resto="del bus">
        <Bloque titulo="Línea asignada" formulario={cambioDeLinea}>
          <Lineas bus={bus} />
        </Bloque>
      </Seccion>
      <Seccion id="parqueo" destacado="Parqueo" resto="del bus">
        <Bloque titulo="Parqueo donde se guarda" formulario={cambioDeParqueo}>
          <p className="text-body">
            {bus.parqueo.estacion.nombre} · {bus.parqueo.codigo}
          </p>
        </Bloque>
      </Seccion>
      {cambioDeEstado ? (
        <Seccion id="estado" destacado="Estado" resto="del bus">
          <Tarjeta>{cambioDeEstado}</Tarjeta>
        </Seccion>
      ) : null}
    </div>
  );
}
