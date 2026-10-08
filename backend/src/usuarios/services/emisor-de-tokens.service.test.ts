import { JwtService } from '@nestjs/jwt';
import { DURACION_SESION_SEGUNDOS, EmisorDeTokens } from './emisor-de-tokens.service';

const SECRETO = 'secreto-de-prueba-con-mas-de-32-caracteres';
const INICIO = new Date('2026-10-07T08:00:00.000Z');

describe('EmisorDeTokens', () => {
  const emisor = new EmisorDeTokens(new JwtService({ secret: SECRETO }));

  beforeEach(() => {
    jest.useFakeTimers({ now: INICIO });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('emite un token que vence exactamente 8 horas después', () => {
    const { expiraEn } = emisor.emitir(7);

    expect(DURACION_SESION_SEGUNDOS).toBe(8 * 60 * 60);
    expect(expiraEn.toISOString()).toBe('2026-10-07T16:00:00.000Z');
  });

  it('el token solo lleva el id del usuario, sin rol ni estación', () => {
    const { token } = emisor.emitir(7);

    const contenido = new JwtService().decode<Record<string, unknown>>(token);
    expect(Object.keys(contenido).sort()).toEqual(['exp', 'iat', 'sub']);
    expect(contenido.sub).toBe('7');
  });

  it('verifica un token vigente y devuelve el id', () => {
    const { token } = emisor.emitir(7);
    jest.setSystemTime(new Date('2026-10-07T15:59:00.000Z'));

    expect(emisor.verificar(token)).toEqual({ usuarioId: 7 });
  });

  it('distingue un token vencido', () => {
    const { token } = emisor.emitir(7);
    jest.setSystemTime(new Date('2026-10-07T16:00:01.000Z'));

    expect(emisor.verificar(token)).toBe('vencido');
  });

  it('distingue un token inválido: alterado, de otro secreto o sin forma de token', () => {
    const { token } = emisor.emitir(7);
    const ajeno = new JwtService({ secret: 'otro-secreto-distinto-de-mas-de-32-caracteres' }).sign({
      sub: '7',
    });

    expect(emisor.verificar(`${token.slice(0, -2)}xx`)).toBe('invalido');
    expect(emisor.verificar(ajeno)).toBe('invalido');
    expect(emisor.verificar('no-es-un-token')).toBe('invalido');
  });

  it('rechaza un token firmado cuyo sujeto no es un id', () => {
    const firmador = new JwtService({ secret: SECRETO });

    expect(emisor.verificar(firmador.sign({ sub: 'abc' }))).toBe('invalido');
    expect(emisor.verificar(firmador.sign({ otro: 1 }))).toBe('invalido');
  });
});
