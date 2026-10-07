import type { ValueTransformer } from 'typeorm';

/** PostgreSQL entrega NUMERIC como texto; las entidades lo exponen como número. */
export const transformadorDecimal: ValueTransformer = {
  to: (valor: number | null | undefined): number | null | undefined => valor,
  from: (valor: string | null): number | null => (valor === null ? null : Number(valor)),
};
