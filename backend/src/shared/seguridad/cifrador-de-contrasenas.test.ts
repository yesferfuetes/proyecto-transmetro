import { cifrarContrasena, verificarContrasena } from './cifrador-de-contrasenas';

describe('cifrador de contraseñas', () => {
  it('verifica la contraseña con la que se cifró', async () => {
    const guardado = await cifrarContrasena('Transmetro2026');
    expect(guardado).toMatch(/^scrypt\$32768\$8\$1\$[^$]+\$[^$]+$/);
    expect(guardado).not.toContain('Transmetro2026');
    await expect(verificarContrasena('Transmetro2026', guardado)).resolves.toBe(true);
  });

  it('rechaza una contraseña incorrecta', async () => {
    const guardado = await cifrarContrasena('Transmetro2026');
    await expect(verificarContrasena('transmetro2026', guardado)).resolves.toBe(false);
  });

  it('usa una sal distinta en cada cifrado', async () => {
    const primero = await cifrarContrasena('Transmetro2026');
    const segundo = await cifrarContrasena('Transmetro2026');
    expect(primero).not.toBe(segundo);
  });

  it.each([
    ['vacío', ''],
    ['otro algoritmo', 'bcrypt$10$abc'],
    ['partes de menos', 'scrypt$32768$8$1$c2Fs'],
    ['parámetro no numérico', 'scrypt$N$8$1$c2Fs$Y2xhdmU='],
    ['clave vacía', 'scrypt$32768$8$1$c2Fs$'],
    ['parámetro inválido para scrypt', 'scrypt$3$8$1$c2Fs$Y2xhdmU='],
  ])('un valor guardado con formato inválido (%s) nunca coincide', async (_caso, guardado) => {
    await expect(verificarContrasena('Transmetro2026', guardado)).resolves.toBe(false);
  });
});
