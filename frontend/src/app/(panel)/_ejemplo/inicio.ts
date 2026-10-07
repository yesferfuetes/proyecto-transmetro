import 'server-only';
import type { SesionDeEjemplo } from './sesion';

export type TipoAlerta = 'sobrecupo' | 'baja-ocupacion';

export type AlertaReciente = Readonly<{
  id: string;
  linea: string;
  estacion: string;
  bus: string;
  porcentaje: number;
  tipo: TipoAlerta;
}>;

export type ResumenInicio = Readonly<{
  /** Ámbito de la cifra: la estación del operador o toda la red. */
  ambito: string;
  activas: number;
  sobrecupo: number;
  bajaOcupacion: number;
  actualizado: Date;
  recientes: readonly AlertaReciente[];
}>;

// Datos ficticios con la forma que entregará el módulo de alertas. El tipo de cada alerta lo
// decide el backend; la interfaz no lo recalcula.
const RECIENTES: readonly AlertaReciente[] = [
  {
    id: 'a1',
    linea: '12',
    estacion: 'El Trébol',
    bus: 'P-123ABC',
    porcentaje: 182,
    tipo: 'sobrecupo',
  },
  {
    id: 'a2',
    linea: '6',
    estacion: 'Bolívar',
    bus: 'P-456DEF',
    porcentaje: 18,
    tipo: 'baja-ocupacion',
  },
  {
    id: 'a3',
    linea: '13',
    estacion: 'Centra Norte',
    bus: 'P-789GHI',
    porcentaje: 164,
    tipo: 'sobrecupo',
  },
  {
    id: 'a4',
    linea: '1',
    estacion: 'Plaza Barrios',
    bus: 'P-321JKL',
    porcentaje: 151,
    tipo: 'sobrecupo',
  },
  {
    id: 'a5',
    linea: 'R5',
    estacion: 'Hipódromo del Norte',
    bus: 'P-654MNO',
    porcentaje: 22,
    tipo: 'baja-ocupacion',
  },
];

/** Resumen de alertas para Inicio. Ocupa el lugar de la consulta real al módulo de alertas. */
export function obtenerResumenDeEjemplo(sesion: SesionDeEjemplo): Promise<ResumenInicio> {
  const recientes = sesion.estacion ? RECIENTES.slice(0, 2) : RECIENTES;
  const sobrecupo = recientes.filter((alerta) => alerta.tipo === 'sobrecupo').length;
  return Promise.resolve({
    ambito: sesion.estacion ?? 'toda la red',
    activas: recientes.length,
    sobrecupo,
    bajaOcupacion: recientes.length - sobrecupo,
    actualizado: new Date(),
    recientes,
  });
}
