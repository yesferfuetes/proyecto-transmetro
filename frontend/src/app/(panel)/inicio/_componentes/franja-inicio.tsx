import type { ReactElement } from 'react';
import { EnlaceBoton } from '@/shared/components/acciones';
import { ChipEstado, Cifra } from '@/shared/components/datos';
import { FranjaSuperior } from '@/shared/components/superficies';
import type { ResumenInicio } from '../../_ejemplo/inicio';

const HORA = new Intl.DateTimeFormat('es-GT', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Guatemala',
});

type Propiedades = Readonly<{ resumen: ResumenInicio }>;

/** Franja oscura de Inicio: las alertas de capacidad activas como cifra protagonista. */
export function FranjaInicio({ resumen }: Propiedades): ReactElement {
  const sinAlertas = resumen.activas === 0;
  return (
    <FranjaSuperior etiqueta="Resumen de alertas">
      <p className="mb-6 flex flex-col lg:hidden">
        <span className="text-heading">Transmetro</span>
        <span className="text-dense text-ink-inverse-muted">Municipalidad de Guatemala</span>
      </p>
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-5">
          <Cifra
            tono="oscuro"
            etiqueta={`Alertas de capacidad activas · ${resumen.ambito}`}
            valor={resumen.activas}
            estado={
              sinAlertas ? (
                <ChipEstado estado="exito" tono="oscuro">
                  Sin alertas activas
                </ChipEstado>
              ) : null
            }
          />
        </div>
        {sinAlertas ? null : (
          <ul className="flex flex-wrap gap-2 lg:col-span-4 lg:flex-col lg:items-start">
            <li>
              <ChipEstado estado="error" tono="oscuro" icono="sobrecupo">
                {resumen.sobrecupo} sobrecupo
              </ChipEstado>
            </li>
            <li>
              <ChipEstado estado="advertencia" tono="oscuro" icono="baja-ocupacion">
                {resumen.bajaOcupacion} baja ocupación
              </ChipEstado>
            </li>
          </ul>
        )}
        <div className="flex flex-col items-start gap-3 lg:col-span-3 lg:col-start-10 lg:items-end">
          <EnlaceBoton href="/alertas" variante="acento" icono="flecha-derecha" posicionIcono="fin">
            Ver alertas
          </EnlaceBoton>
          <p className="text-dense text-ink-inverse-muted">
            Actualizado a las{' '}
            <time dateTime={resumen.actualizado.toISOString()} className="tabular-nums">
              {HORA.format(resumen.actualizado)}
            </time>
          </p>
        </div>
      </div>
    </FranjaSuperior>
  );
}
