import type { ReactElement } from 'react';
import { Aviso } from '@/shared/components/superposiciones';

export function AvisoSesionExpirada(): ReactElement {
  return (
    <Aviso estado="advertencia" titulo="Tu sesión terminó.">
      Inicia sesión de nuevo para continuar.
    </Aviso>
  );
}
