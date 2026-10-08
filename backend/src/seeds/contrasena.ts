/**
 * Lee la contraseña inicial de los usuarios de la demo. Debe cumplir la misma política que exige la
 * aplicación: al menos 8 caracteres, una letra y un número.
 */
export function leerContrasenaDeSiembra(
  variables: Record<string, string | undefined> = process.env,
): string {
  const contrasena = variables.SEED_CONTRASENA;
  if (contrasena === undefined || contrasena === '') {
    throw new Error(
      'Falta SEED_CONTRASENA: la contraseña inicial de los usuarios de la demo. No se guarda en el repositorio.',
    );
  }
  if (contrasena.length < 8 || !/\p{L}/u.test(contrasena) || !/\d/.test(contrasena)) {
    throw new Error(
      'SEED_CONTRASENA debe tener al menos 8 caracteres, con al menos una letra y un número.',
    );
  }
  return contrasena;
}
