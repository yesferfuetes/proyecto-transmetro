import Link from 'next/link';
import type { ReactElement, ReactNode } from 'react';
import { Seccion, Tarjeta, EncabezadoPagina } from '@/shared/components/superficies';
import { TablaDatos, type Columna } from '@/shared/components/tabla';
import { EstadoVacio } from '@/shared/components/datos';
import type { AccesoDetalle, Asignacion } from '../schemas/acceso';
import { ListaDeDatos } from './lista-de-datos';
import { rotuloDeAcceso } from './presentacion';
import { QuitarAsignacion } from './quitar-asignacion';

type Propiedades = Readonly<{
  acceso: AccesoDetalle;
  esTuEstacion: boolean;
  /** Quitar asignaciones; solo para el rol que puede escribir. */
  puedeEscribir: boolean;
  /** Edición del nombre y asignación de guardias; solo llegan para el rol que puede usarlas. */
  formularios?: ReactNode;
}>;

function columnas(accesoId: number, puedeQuitar: boolean): Columna<Asignacion>[] {
  const base: Columna<Asignacion>[] = [
    { clave: 'guardia', encabezado: 'Guardia', fija: true, celda: (a) => a.guardia.nombre },
    {
      clave: 'dpi',
      encabezado: 'DPI',
      celda: (a) => <span className="tabular-nums">{a.guardia.dpi}</span>,
    },
    {
      clave: 'turno',
      encabezado: 'Turno',
      celda: (a) => <span className="tabular-nums">{a.turno}</span>,
    },
  ];
  if (!puedeQuitar) {
    return base;
  }
  return [
    ...base,
    {
      clave: 'acciones',
      encabezado: 'Acciones',
      celda: (a) => (
        <QuitarAsignacion
          accesoId={accesoId}
          guardiaId={a.guardia.id}
          guardiaNombre={a.guardia.nombre}
          turno={a.turno}
        />
      ),
    },
  ];
}

/** Ficha de un acceso con sus asignaciones ordenadas por turno. */
export function DetalleAcceso({
  acceso,
  esTuEstacion,
  puedeEscribir,
  formularios,
}: Propiedades): ReactElement {
  const { estacion } = acceso;
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Acceso"
        resto={`${rotuloDeAcceso(acceso.codigo, acceso.nombre)} · ${estacion.nombre}`}
        descripcion={esTuEstacion ? 'Es un acceso de tu estación.' : undefined}
      />
      <Tarjeta como="section">
        <ListaDeDatos
          datos={[
            { clave: 'codigo', etiqueta: 'Código', valor: acceso.codigo },
            { clave: 'nombre', etiqueta: 'Nombre', valor: acceso.nombre ?? 'Sin nombre' },
            {
              clave: 'estacion',
              etiqueta: 'Estación',
              valor: (
                <Link
                  href={`/accesos?estacionId=${estacion.id}`}
                  className="rounded-sm text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                >
                  {estacion.codigo} · {estacion.nombre}
                </Link>
              ),
            },
          ]}
        />
      </Tarjeta>
      <Seccion id="asignaciones" destacado="Guardias" resto="y turnos">
        <TablaDatos
          id="tabla-asignaciones"
          titulo="Guardias asignados al acceso"
          columnas={columnas(acceso.id, puedeEscribir)}
          filas={acceso.asignaciones}
          claveDeFila={(a) => `${a.guardia.id}-${a.turno}`}
          vacio={
            <EstadoVacio
              variante="sin-datos"
              titulo="Sin guardias"
              texto="Este acceso no tiene guardias asignados."
            />
          }
        />
      </Seccion>
      {formularios}
    </div>
  );
}
