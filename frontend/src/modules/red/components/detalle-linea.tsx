import type { ReactElement, ReactNode } from 'react';
import { EstadoVacio, InsigniaLinea } from '@/shared/components/datos';
import { FranjaSuperior, Seccion, Tarjeta } from '@/shared/components/superficies';
import { formatearFechaHora, formatearKm } from '@/shared/lib/formato';
import type { LineaDetalle } from '../schemas/linea';
import { EstadoDeLinea } from './estado-de-linea';
import { ListaDeDatos } from './lista-de-datos';
import { RecorridoDeLinea } from './recorrido-de-linea';

type Propiedades = Readonly<{
  linea: LineaDetalle;
  estacionResaltadaId?: number;
  /** Acciones de escritura; solo llegan para el rol que puede usarlas. */
  acciones?: ReactNode;
  /** Formulario para cambiar el estado; solo para el rol que puede usarlo. */
  cambioDeEstado?: ReactNode;
}>;

/** Ficha de una línea: franja con su identidad, datos y recorrido. */
export function DetalleLinea({
  linea,
  estacionResaltadaId,
  acciones,
  cambioDeEstado,
}: Propiedades): ReactElement {
  return (
    <div className="flex flex-col gap-6">
      <FranjaSuperior variante="compacta" etiqueta={`Línea ${linea.codigo}`}>
        <div className="flex flex-wrap items-center gap-4">
          <InsigniaLinea codigo={linea.codigo} tamano="grande" tono="oscuro" />
          <h1 className="text-title text-ink-inverse lg:text-title-lg">{linea.nombre}</h1>
          <EstadoDeLinea estado={linea.estado} tono="oscuro" />
        </div>
      </FranjaSuperior>
      {acciones ? <div className="flex flex-wrap gap-3">{acciones}</div> : null}
      <Tarjeta como="section" className="flex flex-col gap-6">
        <ListaDeDatos
          datos={[
            { clave: 'codigo', etiqueta: 'Código', valor: linea.codigo },
            {
              clave: 'municipalidad',
              etiqueta: 'Municipalidad',
              valor: linea.municipalidad.nombre,
            },
            {
              clave: 'estaciones',
              etiqueta: 'Estaciones',
              valor: <span className="tabular-nums">{linea.recorrido.length}</span>,
            },
            {
              clave: 'longitud',
              etiqueta: 'Longitud',
              valor: <span className="tabular-nums">{formatearKm(linea.longitudKm)}</span>,
            },
            { clave: 'creada', etiqueta: 'Registrada', valor: formatearFechaHora(linea.creadoEn) },
          ]}
        />
        {cambioDeEstado ? (
          <div className="border-t border-border pt-6">{cambioDeEstado}</div>
        ) : null}
      </Tarjeta>
      <Seccion id="recorrido" destacado="Recorrido" resto="de la línea">
        <Tarjeta>
          {linea.recorrido.length === 0 ? (
            <EstadoVacio
              variante="sin-datos"
              titulo="Sin recorrido"
              texto="Esta línea todavía no tiene estaciones en su recorrido."
            />
          ) : (
            <RecorridoDeLinea
              codigoLinea={linea.codigo}
              recorrido={linea.recorrido}
              longitudKm={linea.longitudKm}
              estacionResaltadaId={estacionResaltadaId}
            />
          )}
        </Tarjeta>
      </Seccion>
    </div>
  );
}
