import type { ReactElement } from 'react';
import type { Opcion } from './selector';

type Propiedades = Readonly<{
  nombre: string;
  leyenda: string;
  opciones: readonly Opcion[];
  valor?: string;
  error?: string;
}>;

/** Opciones excluyentes agrupadas bajo su leyenda. */
export function GrupoOpciones({
  nombre,
  leyenda,
  opciones,
  valor,
  error,
}: Propiedades): ReactElement {
  const idError = `${nombre}-error`;
  return (
    <fieldset
      aria-describedby={error ? idError : undefined}
      aria-invalid={error ? true : undefined}
      className="flex flex-col gap-1"
    >
      <legend className="mb-1 text-label text-ink">{leyenda}</legend>
      {opciones.map((opcion) => (
        <label
          key={opcion.valor}
          className="inline-flex min-h-control items-center gap-3 text-dense text-ink"
        >
          <input
            type="radio"
            name={nombre}
            value={opcion.valor}
            defaultChecked={opcion.valor === valor}
            className="size-5 accent-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
          />
          {opcion.etiqueta}
        </label>
      ))}
      {error ? (
        <p id={idError} className="text-dense text-danger">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
