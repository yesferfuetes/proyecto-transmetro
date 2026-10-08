import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { errorDeEntrada } from './acciones';

const esquema = z.object({
  nombre: z.string().min(1, 'Escribe el nombre.'),
  correo: z.email('Escribe un correo válido.'),
  paradas: z.array(z.object({ km: z.number().positive('Debe ser mayor que cero.') })),
});

describe('errorDeEntrada', () => {
  it('agrupa los mensajes por campo con el código de entrada inválida', () => {
    const fallo = esquema.safeParse({ nombre: '', correo: 'x', paradas: [{ km: 1 }, { km: 0 }] });
    if (fallo.success) {
      throw new Error('La entrada de prueba debía ser inválida.');
    }

    const estado = errorDeEntrada(fallo.error);

    expect(estado.ok).toBe(false);
    expect(estado.error.codigo).toBe('ENTRADA_INVALIDA');
    expect(estado.error.estado).toBe(0);
    expect(estado.error.detalles).toEqual([
      { campo: 'nombre', mensajes: ['Escribe el nombre.'] },
      { campo: 'correo', mensajes: ['Escribe un correo válido.'] },
      { campo: 'paradas.1.km', mensajes: ['Debe ser mayor que cero.'] },
    ]);
  });

  it('junta varios mensajes del mismo campo', () => {
    const doble = z.string().min(8, 'Al menos 8 caracteres.').regex(/\d/, 'Al menos un número.');
    const fallo = z.object({ contrasena: doble }).safeParse({ contrasena: 'abc' });
    if (fallo.success) {
      throw new Error('La entrada de prueba debía ser inválida.');
    }

    expect(errorDeEntrada(fallo.error).error.detalles).toEqual([
      { campo: 'contrasena', mensajes: ['Al menos 8 caracteres.', 'Al menos un número.'] },
    ]);
  });
});
