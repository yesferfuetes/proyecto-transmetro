import type { ReactElement, ReactNode } from 'react';
import { ProveedorDeConsultas } from '@/shared/lib/consultas/proveedor-de-consultas';

type Propiedades = Readonly<{ children: ReactNode }>;

// Solo el segmento de alertas pide datos desde el navegador (actualización automática).
export default function LayoutDeAlertas({ children }: Propiedades): ReactElement {
  return <ProveedorDeConsultas>{children}</ProveedorDeConsultas>;
}
