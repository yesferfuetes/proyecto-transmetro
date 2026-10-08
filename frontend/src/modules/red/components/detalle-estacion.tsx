import Link from 'next/link';
import type { ReactElement, ReactNode } from 'react';
import { EstadoVacio, InsigniaLinea } from '@/shared/components/datos';
import { EncabezadoPagina, Seccion, Tarjeta } from '@/shared/components/superficies';
import type { EstacionDetalle } from '../schemas/estacion';
import { EstadoDeLinea } from './estado-de-linea';
import { ListaDeDatos } from './lista-de-datos';

type Propiedades = Readonly<{
  estacion: EstacionDetalle;
  esTuEstacion: boolean;
  /** Acciones de escritura; solo llegan para el rol que puede usarlas. */
  acciones?: ReactNode;
}>;

function coordenadas(estacion: EstacionDetalle): string {
  return estacion.latitud === null || estacion.longitud === null
    ? 'Sin coordenadas'
    : `${estacion.latitud}, ${estacion.longitud}`;
}

/** Ficha de una estación con las líneas que pasan por ella y su posición en cada una. */
export function DetalleEstacion({ estacion, esTuEstacion, acciones }: Propiedades): ReactElement {
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Estación"
        resto={`${estacion.codigo} · ${estacion.nombre}`}
        descripcion={esTuEstacion ? 'Es tu estación.' : undefined}
        acciones={acciones}
      />
      <Tarjeta como="section">
        <ListaDeDatos
          datos={[
            { clave: 'codigo', etiqueta: 'Código', valor: estacion.codigo },
            {
              clave: 'municipalidad',
              etiqueta: 'Municipalidad',
              valor: estacion.municipalidad.nombre,
            },
            { clave: 'parqueo', etiqueta: 'Parqueo', valor: estacion.tieneParqueo ? 'Sí' : 'No' },
            { clave: 'coordenadas', etiqueta: 'Coordenadas', valor: coordenadas(estacion) },
          ]}
        />
      </Tarjeta>
      <Seccion id="lineas-de-la-estacion" destacado="Líneas" resto="que pasan por aquí">
        <Tarjeta>
          {estacion.lineas.length === 0 ? (
            <EstadoVacio
              variante="sin-datos"
              titulo="Sin línea"
              texto="Esta estación todavía no está en el recorrido de ninguna línea."
            />
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {estacion.lineas.map((linea) => (
                <li key={linea.id} className="flex flex-wrap items-center gap-4 py-3">
                  <InsigniaLinea codigo={linea.codigo} tamano="mediano" />
                  <Link
                    href={`/lineas/${linea.id}`}
                    className="text-label text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                  >
                    {linea.nombre}
                  </Link>
                  <span className="text-dense text-ink-muted tabular-nums">
                    Posición {linea.posicion} del recorrido
                  </span>
                  <EstadoDeLinea estado={linea.estado} />
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </Seccion>
    </div>
  );
}
