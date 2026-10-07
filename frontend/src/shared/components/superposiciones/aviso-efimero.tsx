'use client';

import { useEffect, useState, type ReactElement } from 'react';
import { BotonIcono } from '@/shared/components/acciones';
import { Icono } from '@/shared/components/utilidades';
import type { AvisoEfimeroDatos } from '@/shared/hooks/use-avisos';

export const DURACION_AVISO_MS = 6000;

type Propiedades = Readonly<{ aviso: AvisoEfimeroDatos; alCerrar: (id: number) => void }>;

/** Aviso que desaparece solo, salvo mientras tiene el foco o el cursor encima. */
export function AvisoEfimero({ aviso, alCerrar }: Propiedades): ReactElement {
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    if (pausado) {
      return undefined;
    }
    const temporizador = setTimeout(() => alCerrar(aviso.id), DURACION_AVISO_MS);
    return (): void => clearTimeout(temporizador);
  }, [pausado, aviso.id, alCerrar]);

  return (
    <div
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
      className="flex items-center gap-3 rounded-full bg-night py-1 ps-5 pe-1 text-dense text-ink-inverse shadow-float"
    >
      <Icono
        nombre={aviso.estado === 'exito' ? 'exito' : 'error'}
        className={aviso.estado === 'exito' ? 'text-success-on-night' : 'text-danger-on-night'}
      />
      <p>{aviso.mensaje}</p>
      <BotonIcono
        icono="cerrar"
        etiqueta="Cerrar aviso"
        variante="sobre-oscuro"
        onClick={() => alCerrar(aviso.id)}
      />
    </div>
  );
}
