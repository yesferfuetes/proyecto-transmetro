'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactElement, type ReactNode } from 'react';

type Propiedades = Readonly<{ children: ReactNode }>;

/** Un cliente de consultas por navegador: se crea una vez y no se comparte entre usuarios. */
export function ProveedorDeConsultas({ children }: Propiedades): ReactElement {
  const [cliente] = useState(() => new QueryClient());
  return <QueryClientProvider client={cliente}>{children}</QueryClientProvider>;
}
