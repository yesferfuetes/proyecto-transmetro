const ZONA_HORARIA = 'America/Guatemala';

const FECHA_HORA = new Intl.DateTimeFormat('es-GT', {
  timeZone: ZONA_HORARIA,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const KILOMETROS = new Intl.NumberFormat('es-GT', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
});

/** Fecha y hora en la zona de Guatemala, por ejemplo "07/10/2026, 14:05". */
export function formatearFechaHora(fecha: Date | string): string {
  return FECHA_HORA.format(typeof fecha === 'string' ? new Date(fecha) : fecha);
}

/** Kilómetros con tres decimales; "—" cuando no hay dato. */
export function formatearKm(numero: number | null): string {
  return numero === null ? '—' : `${KILOMETROS.format(numero)} km`;
}
