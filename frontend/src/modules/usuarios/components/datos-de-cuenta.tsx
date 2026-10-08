import type { ReactElement } from 'react';
import { ETIQUETA_DE_ROL, type Sesion } from '@/shared/schemas/sesion';

type Propiedades = Readonly<{ cuenta: Sesion }>;

/** Nombre, correo, rol y estación de quien tiene la sesión. */
export function DatosDeCuenta({ cuenta }: Propiedades): ReactElement {
  const filas = [
    { termino: 'Nombre', valor: cuenta.nombre },
    { termino: 'Correo', valor: cuenta.correo },
    { termino: 'Rol', valor: ETIQUETA_DE_ROL[cuenta.rol] },
    {
      termino: 'Estación',
      valor: cuenta.estacion
        ? `${cuenta.estacion.codigo} · ${cuenta.estacion.nombre}`
        : 'No aplica: tu rol consulta toda la red',
    },
  ];
  return (
    <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {filas.map((fila) => (
        <div key={fila.termino} className="flex flex-col gap-1">
          <dt className="text-eyebrow text-ink-muted uppercase">{fila.termino}</dt>
          <dd className="text-body text-ink">{fila.valor}</dd>
        </div>
      ))}
    </dl>
  );
}
