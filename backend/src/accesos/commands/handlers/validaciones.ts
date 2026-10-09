import type { ContextoTransaccional } from '../../../shared/database/unidad-de-trabajo';
import { AccesoGuardia } from '../../entities/acceso-guardia.entity';
import { GuardiaSeguridad } from '../../entities/guardia-seguridad.entity';
import {
  AsignacionDuplicada,
  DpiInvalido,
  GuardiaAsignadoNoExiste,
  TelefonoInvalido,
  TurnoInvalido,
  TurnoTraslapado,
} from '../../errors/errores-de-accesos';
import type { RedAdapter } from '../../infrastructure/adapters/red.adapter';
import {
  normalizarDpi,
  normalizarTelefono,
  recortar,
  recortarONulo,
} from '../../services/normalizacion';
import { normalizarTurno, turnosSeTraslapan } from '../../services/turnos';
import type { DatosDeGuardia } from '../impl/registrar-guardia.command';

/** El turno se escribe como `06:00-14:00`; se guarda siempre con ese formato. */
export function exigirTurnoValido(texto: string): string {
  const turno = normalizarTurno(texto);
  if (turno === null) {
    throw new TurnoInvalido();
  }
  return turno;
}

/** Nombre recortado, DPI con 13 dígitos y teléfono con 8, todos en su forma de guardado. */
export function normalizarDatosDeGuardia(datos: DatosDeGuardia): DatosDeGuardia {
  const dpi = normalizarDpi(datos.dpi);
  if (dpi === null) {
    throw new DpiInvalido();
  }
  const texto = recortarONulo(datos.telefono);
  const telefono = texto === null ? null : normalizarTelefono(texto);
  if (texto !== null && telefono === null) {
    throw new TelefonoInvalido();
  }
  return { nombre: recortar(datos.nombre), dpi, telefono };
}

/**
 * El guardia de una asignación existe. Su fila queda bloqueada hasta el final de la transacción:
 * dos asignaciones simultáneas del mismo guardia se atienden una tras otra.
 */
export async function bloquearGuardiaAsignable(
  contexto: ContextoTransaccional,
  guardiaId: number,
): Promise<void> {
  const guardia = await contexto
    .repositorio(GuardiaSeguridad)
    .findOne({ where: { id: guardiaId }, lock: { mode: 'pessimistic_write' } });
  if (!guardia) {
    throw new GuardiaAsignadoNoExiste();
  }
}

export interface AsignacionPorValidar {
  /** Acceso al que se asigna; no existe todavía cuando se registra el acceso. */
  accesoId: number | null;
  estacionId: number;
  guardiaId: number;
  turno: string;
}

/**
 * El guardia ya tiene bloqueada su fila. La asignación no se repite y su turno no se traslapa con
 * el de ningún acceso de otra estación; en la misma estación sí puede coincidir.
 */
export async function validarAsignacion(
  contexto: ContextoTransaccional,
  red: RedAdapter,
  asignacion: AsignacionPorValidar,
): Promise<void> {
  const asignaciones = contexto.repositorio(AccesoGuardia);
  if (
    asignacion.accesoId !== null &&
    (await asignaciones.existsBy({
      accesoId: asignacion.accesoId,
      guardiaId: asignacion.guardiaId,
      turno: asignacion.turno,
    }))
  ) {
    throw new AsignacionDuplicada();
  }
  const delGuardia = await asignaciones.find({
    where: { guardiaId: asignacion.guardiaId },
    relations: { acceso: true },
  });
  const choque = delGuardia.find(
    (existente) =>
      existente.acceso !== undefined &&
      existente.acceso.estacionId !== asignacion.estacionId &&
      turnosSeTraslapan(existente.turno, asignacion.turno),
  );
  if (choque?.acceso) {
    const estacion = await red.obtenerEstacion(choque.acceso.estacionId);
    throw new TurnoTraslapado(choque.turno, estacion?.nombre ?? String(choque.acceso.estacionId));
  }
}
