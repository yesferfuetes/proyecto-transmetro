'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { ReactElement } from 'react';
import { leerHuellaDeAlertas } from '../actions/leer-huella';
import type { Huella } from '../schemas/alerta';

/** Desfase máximo con que una alerta de otra sesión aparece en la lista. */
const INTERVALO_MS = 5000;

type Propiedades = Readonly<{
  /** Huella con la que el servidor pintó la tabla. */
  huellaInicial: Huella;
  intervaloMs?: number;
}>;

function cambio(a: Huella, b: Huella): boolean {
  return a.pendientes !== b.pendientes || a.atendidas !== b.atendidas || a.ultimaId !== b.ultimaId;
}

/**
 * Consulta cada pocos segundos una huella barata y, solo si cambió, pide al servidor que vuelva
 * a pintar la tabla. No dibuja nada ni guarda las alertas.
 */
export function ActualizacionAutomatica({
  huellaInicial,
  intervaloMs = INTERVALO_MS,
}: Propiedades): ReactElement | null {
  const router = useRouter();
  useQuery({
    queryKey: ['huella-de-alertas'],
    refetchInterval: intervaloMs,
    queryFn: async () => {
      const resultado = await leerHuellaDeAlertas();
      if (resultado.ok && cambio(huellaInicial, resultado.datos)) {
        router.refresh();
      }
      return resultado;
    },
  });
  return null;
}
