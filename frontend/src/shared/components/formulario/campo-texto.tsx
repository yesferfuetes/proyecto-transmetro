import type { InputHTMLAttributes, ReactElement } from 'react';
import { cn } from '@/shared/lib/cn';
import { CONTROL } from './estilos-campo';

type Propiedades = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> &
  Readonly<{ type?: 'text' | 'email' | 'password' | 'date' | 'tel' | 'search' }>;

/** Campo de una línea con el aspecto del sistema. */
export function CampoTexto({ type = 'text', className, ...atributos }: Propiedades): ReactElement {
  return <input type={type} className={cn(CONTROL, className)} {...atributos} />;
}

/** Fecha nativa del navegador. */
export function CampoFecha(propiedades: Omit<Propiedades, 'type'>): ReactElement {
  return <CampoTexto type="date" {...propiedades} className="tabular-nums" />;
}

/** Contraseña, sin autocompletar texto visible. */
export function CampoContrasena(propiedades: Omit<Propiedades, 'type'>): ReactElement {
  return <CampoTexto type="password" {...propiedades} />;
}
