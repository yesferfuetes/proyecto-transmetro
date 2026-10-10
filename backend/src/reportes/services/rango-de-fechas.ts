import { RangoDeFechasInvalido } from '../errors/errores-de-reportes';

const DIA_MS = 24 * 60 * 60 * 1000;
const DESFASE_DE_GUATEMALA_MS = 6 * 60 * 60 * 1000;
const FORMATO = /^(\d{4})-(\d{2})-(\d{2})$/;

export interface RangoDeInstantes {
  /** Inclusivo. */
  desde: Date | null;
  /** Exclusivo: el inicio del día siguiente al último día pedido. */
  hasta: Date | null;
}

/** Medianoche de Guatemala del día `AAAA-MM-DD`, o null si no es una fecha real. */
function inicioDelDia(texto: string): Date | null {
  const partes = FORMATO.exec(texto);
  if (!partes) {
    return null;
  }
  const [anio, mes, dia] = [Number(partes[1]), Number(partes[2]), Number(partes[3])];
  const utc = new Date(Date.UTC(anio, mes - 1, dia));
  const esReal =
    utc.getUTCFullYear() === anio && utc.getUTCMonth() === mes - 1 && utc.getUTCDate() === dia;
  return esReal ? new Date(utc.getTime() + DESFASE_DE_GUATEMALA_MS) : null;
}

function leerExtremo(texto: string | undefined, nombre: string): Date | null {
  if (texto === undefined || texto === '') {
    return null;
  }
  const inicio = inicioDelDia(texto);
  if (inicio === null) {
    throw new RangoDeFechasInvalido(`La fecha "${nombre}" no es válida; usa AAAA-MM-DD.`);
  }
  return inicio;
}

/**
 * Límites de instante de un rango de días de Guatemala, ambos días inclusivos. Cualquiera de los
 * dos puede faltar. Lanza `RANGO_DE_FECHAS_INVALIDO` si una fecha está mal o el inicio es
 * posterior al fin.
 */
export function leerRango(desde?: string, hasta?: string): RangoDeInstantes {
  const inicio = leerExtremo(desde, 'desde');
  const fin = leerExtremo(hasta, 'hasta');
  if (inicio !== null && fin !== null && inicio.getTime() > fin.getTime()) {
    throw new RangoDeFechasInvalido('La fecha de inicio no puede ser posterior a la de fin.');
  }
  return { desde: inicio, hasta: fin === null ? null : new Date(fin.getTime() + DIA_MS) };
}
