import { esEventoAuditable, EventoAuditable } from './evento-auditable';

class CambioDePrueba extends EventoAuditable {
  constructor() {
    super(3, 'COSA_EDITADA', 'cosa', '9', { campos: 'nombre' });
  }
}

class AvisoComun {
  readonly accion = 'COSA_EDITADA';
}

describe('esEventoAuditable', () => {
  it('reconoce un evento que extiende EventoAuditable', () => {
    const evento = new CambioDePrueba();
    expect(esEventoAuditable(evento)).toBe(true);
    expect(evento).toMatchObject({
      usuarioId: 3,
      accion: 'COSA_EDITADA',
      entidad: 'cosa',
      entidadId: '9',
      resumen: { campos: 'nombre' },
      correoIntentado: null,
    });
  });

  it('rechaza un evento que solo se le parece', () => {
    expect(esEventoAuditable(new AvisoComun())).toBe(false);
  });
});
