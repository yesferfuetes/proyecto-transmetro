/** Turno normalizado: `HH:MM-HH:MM`, en 24 horas. Si el fin es menor que el inicio, cruza la medianoche. */
export type Turno = string;

const MINUTOS_POR_DIA = 1440;
const FORMATO_DE_TURNO = /^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/;

type Intervalo = readonly [inicio: number, fin: number];

function aMinutos(horas: string, minutos: string): number | null {
  const hora = Number(horas);
  const minuto = Number(minutos);
  return hora > 23 || minuto > 59 ? null : hora * 60 + minuto;
}

function dosCifras(valor: number): string {
  return String(valor).padStart(2, '0');
}

function escribirHora(minutos: number): string {
  return `${dosCifras(Math.floor(minutos / 60))}:${dosCifras(minutos % 60)}`;
}

/** Inicio y fin del turno en minutos del día, o `null` si el texto no es un turno válido. */
function leerTurno(texto: string): Intervalo | null {
  const partes = FORMATO_DE_TURNO.exec(texto.trim());
  if (!partes) {
    return null;
  }
  const inicio = aMinutos(partes[1] ?? '', partes[2] ?? '');
  const fin = aMinutos(partes[3] ?? '', partes[4] ?? '');
  return inicio === null || fin === null || inicio === fin ? null : [inicio, fin];
}

/** `6:00 - 14:00` → `06:00-14:00`. Devuelve `null` si el texto no es un turno válido. */
export function normalizarTurno(texto: string): Turno | null {
  const turno = leerTurno(texto);
  return turno ? `${escribirHora(turno[0])}-${escribirHora(turno[1])}` : null;
}

/** Minuto del día en que empieza un turno ya normalizado; sirve para ordenar. */
export function inicioEnMinutos(turno: Turno): number {
  return leerTurno(turno)?.[0] ?? 0;
}

/** Un turno es `[inicio, fin)`; el que cruza la medianoche se parte en dos tramos. */
function tramos([inicio, fin]: Intervalo): Intervalo[] {
  return fin > inicio
    ? [[inicio, fin]]
    : [
        [inicio, MINUTOS_POR_DIA],
        [0, fin],
      ];
}

/** Dos turnos se traslapan si comparten algún minuto; que uno termine cuando el otro empieza no cuenta. */
export function turnosSeTraslapan(a: Turno, b: Turno): boolean {
  const turnoA = leerTurno(a);
  const turnoB = leerTurno(b);
  if (!turnoA || !turnoB) {
    return false;
  }
  return tramos(turnoA).some(([inicioA, finA]) =>
    tramos(turnoB).some(([inicioB, finB]) => inicioA < finB && inicioB < finA),
  );
}
