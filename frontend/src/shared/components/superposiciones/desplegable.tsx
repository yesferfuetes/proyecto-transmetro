'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactElement } from 'react';
import { Icono } from '@/shared/components/utilidades';
import { cn } from '@/shared/lib/cn';

export type OpcionMenu = Readonly<{ clave: string; etiqueta: string; href: string }>;

type Propiedades = Readonly<{
  /** Nombre accesible del botón que abre el menú. */
  etiqueta: string;
  opciones: readonly OpcionMenu[];
}>;

function moverFoco(elementos: readonly HTMLElement[], paso: 1 | -1): void {
  const actual = elementos.findIndex((elemento) => elemento === document.activeElement);
  const siguiente = (actual + paso + elementos.length) % elementos.length;
  elementos[siguiente]?.focus();
}

/** Menú de acciones bajo un botón. Esc, clic fuera o elegir lo cierran; las flechas recorren. */
export function Desplegable({ etiqueta, opciones }: Propiedades): ReactElement {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const idMenu = useId();

  const opcionesDelMenu = (): HTMLElement[] =>
    Array.from(contenedor.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  useEffect(() => {
    if (!abierto) {
      return undefined;
    }
    opcionesDelMenu()[0]?.focus();
    const alPulsarFuera = (evento: MouseEvent): void => {
      if (!contenedor.current?.contains(evento.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', alPulsarFuera);
    return (): void => document.removeEventListener('mousedown', alPulsarFuera);
  }, [abierto]);

  const cerrar = (): void => {
    setAbierto(false);
    boton.current?.focus();
  };

  const alPresionarTecla = (evento: KeyboardEvent<HTMLUListElement>): void => {
    const acciones = new Map<string, () => void>([
      ['Escape', cerrar],
      ['ArrowDown', (): void => moverFoco(opcionesDelMenu(), 1)],
      ['ArrowUp', (): void => moverFoco(opcionesDelMenu(), -1)],
    ]);
    if (evento.key === 'Tab') {
      setAbierto(false);
      return;
    }
    const accion = acciones.get(evento.key);
    if (accion) {
      evento.preventDefault();
      accion();
    }
  };

  return (
    <div ref={contenedor} className="relative inline-block">
      <button
        ref={boton}
        type="button"
        aria-label={etiqueta}
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-controls={idMenu}
        onClick={() => setAbierto((previo) => !previo)}
        className="inline-flex size-control-dense items-center justify-center rounded-full text-ink-muted hover:bg-canvas hover:text-ink focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
      >
        <Icono nombre="mas" />
      </button>
      <ul
        id={idMenu}
        role="menu"
        aria-label={etiqueta}
        hidden={!abierto}
        onKeyDown={alPresionarTecla}
        className={cn(
          'absolute end-0 top-full z-20 mt-1 min-w-48 rounded-lg border border-border bg-surface py-2 shadow-md',
        )}
      >
        {opciones.map((opcion) => (
          <li key={opcion.clave} role="none">
            <Link
              role="menuitem"
              href={opcion.href}
              onClick={() => setAbierto(false)}
              className="flex h-control items-center px-4 text-dense text-ink hover:bg-canvas focus-visible:bg-primary-soft focus-visible:outline-none"
            >
              {opcion.etiqueta}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
