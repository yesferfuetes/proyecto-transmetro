import type { ReactElement } from 'react';
import { EnlaceBoton } from '@/shared/components/acciones';
import { Icono, type NombreIcono } from '@/shared/components/utilidades';

type Propiedades = Readonly<{
  variante?: 'tarjeta' | 'pagina';
  /** Nombre de la función bloqueada, solo para la vista previa atenuada. */
  titulo: string;
  icono: NombreIcono;
  /** Qué rol la permite y a quién acudir. */
  explicacion: string;
  volverA?: string;
}>;

/**
 * Función que el rol no permite. La vista previa es estática y no contiene datos de la función:
 * al navegador no llega nada que el rol no pueda ver.
 */
export function TarjetaBloqueada({
  variante = 'tarjeta',
  titulo,
  icono,
  explicacion,
  volverA = '/inicio',
}: Propiedades): ReactElement {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6">
      <div className="relative">
        <div
          inert
          aria-hidden="true"
          className="flex items-center gap-3 rounded-lg bg-canvas p-4 opacity-50 grayscale"
        >
          <Icono nombre={icono} tamano={24} />
          <span className="text-subheading">{titulo}</span>
          <span className="ms-auto text-figure-sm">—</span>
        </div>
        <span className="absolute inset-0 m-auto flex size-12 items-center justify-center rounded-full border border-border bg-surface text-ink">
          <Icono nombre="candado" tamano={24} />
        </span>
      </div>
      {variante === 'pagina' ? (
        <h1 className="text-subheading text-ink">Esta función no está disponible para tu rol</h1>
      ) : null}
      <p className="text-body text-ink">{explicacion}</p>
      {variante === 'pagina' ? (
        <EnlaceBoton href={volverA} variante="secundario" className="w-fit">
          Volver al inicio
        </EnlaceBoton>
      ) : null}
    </section>
  );
}
