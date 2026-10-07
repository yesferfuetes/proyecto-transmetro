'use client';

import type { ReactElement } from 'react';
import { Boton } from '@/shared/components/acciones';
import { ModalNativo, type PropiedadesModal } from './modal-nativo';

type Confirmacion = Readonly<{ texto: string; alConfirmar: () => void; cancelar?: string }>;

type Propiedades = Omit<PropiedadesModal, 'pie'> &
  Readonly<
    | { variante: 'confirmacion' | 'destructivo'; confirmacion: Confirmacion }
    | { variante: 'formulario'; confirmacion?: never }
  >;

/**
 * Diálogo modal. En confirmaciones dibuja Cancelar y el botón de confirmar (de peligro si la
 * acción destruye algo); en formularios, las acciones van dentro del propio formulario.
 */
export function Dialogo({
  variante,
  confirmacion,
  alCerrar,
  ...propiedades
}: Propiedades): ReactElement {
  const pie = confirmacion ? (
    <>
      <Boton variante="secundario" onClick={alCerrar}>
        {confirmacion.cancelar ?? 'Cancelar'}
      </Boton>
      <Boton
        variante={variante === 'destructivo' ? 'peligro' : 'principal'}
        onClick={confirmacion.alConfirmar}
      >
        {confirmacion.texto}
      </Boton>
    </>
  ) : undefined;
  return <ModalNativo {...propiedades} alCerrar={alCerrar} pie={pie} posicion="centro" />;
}
