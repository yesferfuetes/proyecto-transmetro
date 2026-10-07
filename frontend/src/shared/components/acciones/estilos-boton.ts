export type VarianteBoton =
  'principal' | 'secundario' | 'fantasma' | 'peligro' | 'acento' | 'sobre-oscuro';

export type TamanoBoton = 'normal' | 'denso';

export const BASE_BOTON =
  'inline-flex items-center justify-center gap-2 rounded-full text-label whitespace-nowrap focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 motion-safe:transition-colors';

export const VARIANTES_BOTON: Record<VarianteBoton, string> = {
  principal:
    'bg-primary text-ink-inverse hover:bg-primary-strong focus-visible:ring-primary active:bg-primary-950',
  secundario:
    'border-2 border-primary text-primary hover:bg-primary-soft focus-visible:ring-primary active:bg-primary-100',
  fantasma: 'text-primary hover:bg-primary-soft focus-visible:ring-primary active:bg-primary-100',
  peligro:
    'bg-danger text-ink-inverse hover:bg-danger-700 focus-visible:ring-primary active:bg-danger-800',
  acento:
    'bg-accent text-ink hover:bg-accent-light focus-visible:ring-accent focus-visible:ring-offset-night active:bg-accent-500',
  'sobre-oscuro':
    'border-2 border-ink-inverse text-ink-inverse hover:bg-night-mid focus-visible:ring-accent focus-visible:ring-offset-night active:bg-night-raised',
};

export const TAMANOS_BOTON: Record<TamanoBoton, string> = {
  normal: 'h-control px-5',
  denso: 'h-control-dense px-4',
};

export const VARIANTES_BOTON_ICONO = {
  fantasma: 'text-ink-muted hover:bg-canvas hover:text-ink focus-visible:ring-primary',
  'sobre-oscuro':
    'text-ink-inverse hover:bg-night-mid focus-visible:ring-accent focus-visible:ring-offset-night',
} as const;
