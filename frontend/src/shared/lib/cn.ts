import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * La fusión de clases debe conocer los tokens propios: sin esto, `text-label` y `text-ink` se
 * toman como dos colores en conflicto y se pierde el tamaño de texto.
 */
const fusionar = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        'figure',
        'figure-lg',
        'figure-sm',
        'title',
        'title-lg',
        'heading',
        'subheading',
        'body',
        'dense',
        'label',
        'eyebrow',
        'line-number',
        'line-number-lg',
      ],
      spacing: [
        'gutter',
        'gutter-lg',
        'section',
        'tile',
        'tile-lg',
        'control',
        'control-dense',
        'row',
        'nav-bar',
        'sidebar',
      ],
      container: ['content', 'dialog'],
      shadow: ['float', 'dialog'],
    },
  },
});

/** Compone clases condicionales y resuelve los conflictos de Tailwind a favor de la última. */
export function cn(...entradas: ClassValue[]): string {
  return fusionar(clsx(entradas));
}
