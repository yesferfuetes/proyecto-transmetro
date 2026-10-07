import type { EntityManager } from 'typeorm';
import { Bus } from '../../flota/entities/bus.entity';
import { Piloto } from '../../pilotos/entities/piloto.entity';
import { APELLIDOS, HISTORIALES_EDUCATIVOS, NOMBRES } from '../datos/personas';
import { elegir, rellenar } from '../numeros';
import { Resumen, sincronizar } from '../sincronizar';

/** Un piloto ficticio por bus. */
export async function sembrarPilotos(gestor: EntityManager): Promise<Resumen> {
  const buses = await gestor.getRepository(Bus).find({ order: { placa: 'ASC' } });
  const pilotos = buses.map((bus, indice) => {
    const numero = indice + 1;
    return {
      nombre: `${elegir(NOMBRES, indice * 3 + 1)} ${elegir(APELLIDOS, indice * 5 + 2)} ${elegir(APELLIDOS, indice + 9)}`,
      dpi: `9${rellenar(numero, 3)} ${rellenar(numero, 5)} 0101`,
      direccionResidencia: `Zona ${elegir([1, 2, 5, 6, 7, 11, 12, 18], indice)}, Ciudad de Guatemala`,
      telefono: `5${rellenar(numero, 3)}-${rellenar(numero, 4)}`,
      email: `piloto${rellenar(numero, 3)}@example.com`,
      historialEducativo: elegir(HISTORIALES_EDUCATIVOS, indice),
      busId: bus.id,
    };
  });
  return sincronizar(gestor, Piloto, pilotos, ['dpi']);
}
