import type { ReactElement } from 'react';
import { ChipEstado, InsigniaLinea } from '@/shared/components/datos';
import { FranjaSuperior, Tarjeta } from '@/shared/components/superficies';
import type { AccesosDeLinea as Datos } from '../schemas/acceso';
import { ListaDeAccesos } from './lista-de-accesos';

type Propiedades = Readonly<{
  datos: Datos;
  /** Estación del operador; se marca como "Tu estación". */
  estacionResaltadaId?: number;
}>;

/** Estaciones de una línea en orden de recorrido, cada una con sus accesos o la marca "Sin accesos". */
export function AccesosDeLinea({ datos, estacionResaltadaId }: Propiedades): ReactElement {
  const { linea, estaciones } = datos;
  return (
    <div className="flex flex-col gap-6">
      <FranjaSuperior variante="compacta" etiqueta={`Accesos de la línea ${linea.codigo}`}>
        <div className="flex flex-wrap items-center gap-4">
          <InsigniaLinea codigo={linea.codigo} tamano="grande" tono="oscuro" />
          <h1 className="text-title text-ink-inverse lg:text-title-lg">
            Accesos de {linea.nombre}
          </h1>
        </div>
      </FranjaSuperior>
      <Tarjeta linea={linea.codigo}>
        <ol
          aria-label={`Estaciones de ${linea.nombre} en orden de recorrido`}
          className="divide-y divide-border"
        >
          {estaciones.map((estacion) => (
            <li key={estacion.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0">
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body text-ink">
                <span className="text-ink-muted tabular-nums">{estacion.posicion}.</span>
                <span className="text-label">{estacion.codigo}</span>
                <span>{estacion.nombre}</span>
                {estacion.id === estacionResaltadaId ? (
                  <ChipEstado estado="informacion" icono="estaciones">
                    Tu estación
                  </ChipEstado>
                ) : null}
              </p>
              <ListaDeAccesos accesos={estacion.accesos} estacion={estacion.nombre} />
            </li>
          ))}
        </ol>
      </Tarjeta>
    </div>
  );
}
