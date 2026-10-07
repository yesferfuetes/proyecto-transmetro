import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactElement } from 'react';
import './globals.css';

const fuenteSans = Inter({ subsets: ['latin'], variable: '--fuente-sans' });

export const metadata: Metadata = {
  title: { default: 'Transmetro', template: '%s · Transmetro' },
  description: 'Sistema de Información y Control Operativo de Transmetro.',
};

export default function LayoutRaiz({ children }: LayoutProps<'/'>): ReactElement {
  return (
    <html lang="es" className={fuenteSans.variable}>
      <body className="min-h-screen font-sans antialiased">
        <a
          href="#contenido"
          className="sr-only rounded-md bg-primary px-4 py-2 text-surface focus:not-sr-only focus:absolute focus:top-4 focus:left-4"
        >
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
