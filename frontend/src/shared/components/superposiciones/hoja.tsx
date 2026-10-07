'use client';

import type { ReactElement } from 'react';
import { ModalNativo, type PropiedadesModal } from './modal-nativo';

/** Hoja modal que sube desde el borde inferior. */
export function Hoja(propiedades: PropiedadesModal): ReactElement {
  return <ModalNativo {...propiedades} posicion="abajo" />;
}
