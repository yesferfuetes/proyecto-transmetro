import { Transform } from 'class-transformer';

/** Quita los espacios a los lados de un texto; deja igual cualquier otro valor. */
export function Recortar(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );
}

/** Convierte `true` y `false` de la cadena de consulta a booleano. */
export function BooleanoDeConsulta(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) => {
    if (value === 'true') {
      return true;
    }
    return value === 'false' ? false : value;
  });
}
