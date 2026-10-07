import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import type { ReactElement } from 'react';
import { SaltarAlContenido } from '@/shared/components/utilidades';
import './globals.css';

// Fuente variable (pesos 200–800): un solo archivo latino servido desde el propio servidor.
const fuenteSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--fuente-sans',
});

export const metadata: Metadata = {
  title: { default: 'Transmetro', template: '%s · Transmetro' },
  description: 'Sistema de Información y Control Operativo de Transmetro.',
};

export default function LayoutRaiz({ children }: LayoutProps<'/'>): ReactElement {
  return (
    <html lang="es" className={fuenteSans.variable}>
      <body className="min-h-screen font-sans text-body antialiased">
        <SaltarAlContenido />
        {children}
      </body>
    </html>
  );
}
