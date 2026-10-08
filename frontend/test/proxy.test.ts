import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { config, proxy } from '../src/proxy';

function solicitud(ruta: string, conCookie: boolean): NextRequest {
  const peticion = new NextRequest(new URL(ruta, 'http://transmetro.prueba'));
  if (conCookie) {
    peticion.cookies.set('transmetro_sesion', 'tok');
  }
  return peticion;
}

describe('proxy', () => {
  it('sin cookie lleva a iniciar sesión', () => {
    const respuesta = proxy(solicitud('/usuarios', false));
    expect(respuesta.headers.get('location')).toBe('http://transmetro.prueba/login');
  });

  it('con cookie deja pasar sin validar el token', () => {
    const respuesta = proxy(solicitud('/lineas/3', true));
    expect(respuesta.headers.get('location')).toBeNull();
  });

  it.each([
    ['/inicio', true],
    ['/usuarios/4', true],
    ['/login', false],
    ['/login?motivo=expirada', false],
    ['/', false],
    ['/_next/static/chunks/a.js', false],
    ['/favicon.ico', false],
    ['/logo.svg', false],
  ])('el filtro de rutas aplica a %s: %s', (ruta, aplica) => {
    // El filtro de Next acepta esta forma como expresión regular sobre la ruta.
    const expresion = new RegExp(`^${config.matcher[0] ?? ''}$`);
    expect(expresion.test(new URL(ruta, 'http://x').pathname)).toBe(aplica);
  });
});
