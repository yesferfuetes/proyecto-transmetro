'use client';

import { useState, type KeyboardEvent, type ReactElement } from 'react';
import { Campo, CampoTexto } from '@/shared/components/formulario';
import { cn } from '@/shared/lib/cn';

export type OpcionBuscador = Readonly<{ valor: string; etiqueta: string }>;

type Propiedades = Readonly<{
  id: string;
  etiqueta: string;
  ayuda?: string;
  /** Opciones elegibles; quien usa el buscador excluye las que ya no apliquen. */
  opciones: readonly OpcionBuscador[];
  onElegir: (opcion: OpcionBuscador) => void;
}>;

const MAXIMO_VISIBLE = 8;

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

function filtrar(opciones: readonly OpcionBuscador[], texto: string): OpcionBuscador[] {
  const buscado = normalizar(texto);
  return opciones
    .filter((opcion) => normalizar(opcion.etiqueta).includes(buscado))
    .slice(0, MAXIMO_VISIBLE);
}

/**
 * Campo con lista de sugerencias (combobox). Se opera con flechas, Enter elige y Esc cierra; el
 * foco se queda en el campo y la opción activa se indica con `aria-activedescendant`.
 */
export function BuscadorDeEstaciones({
  id,
  etiqueta,
  ayuda,
  opciones,
  onElegir,
}: Propiedades): ReactElement {
  const [texto, setTexto] = useState('');
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const coincidencias = abierto ? filtrar(opciones, texto) : [];
  const visible = coincidencias.length > 0;
  const idLista = `${id}-lista`;
  const idOpcion = (opcion: OpcionBuscador): string => `${id}-opcion-${opcion.valor}`;
  const opcionActiva = coincidencias[Math.min(activo, coincidencias.length - 1)];

  const elegir = (opcion: OpcionBuscador): void => {
    onElegir(opcion);
    setTexto('');
    setAbierto(false);
    setActivo(0);
  };

  const alPresionarTecla = (evento: KeyboardEvent<HTMLInputElement>): void => {
    const acciones: Record<string, () => void> = {
      ArrowDown: () => {
        setActivo(abierto ? Math.min(activo + 1, coincidencias.length - 1) : 0);
        setAbierto(true);
      },
      ArrowUp: () => setActivo(Math.max(activo - 1, 0)),
      Escape: () => setAbierto(false),
      Enter: () => {
        if (opcionActiva) {
          elegir(opcionActiva);
        }
      },
    };
    const accion = acciones[evento.key];
    if (accion && (evento.key !== 'Enter' || visible)) {
      evento.preventDefault();
      accion();
    }
  };

  return (
    <div className="relative">
      <Campo id={id} etiqueta={etiqueta} ayuda={ayuda}>
        {(control) => (
          <CampoTexto
            {...control}
            role="combobox"
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={visible}
            aria-controls={idLista}
            aria-activedescendant={visible && opcionActiva ? idOpcion(opcionActiva) : undefined}
            value={texto}
            onChange={(evento) => {
              setTexto(evento.target.value);
              setAbierto(true);
              setActivo(0);
            }}
            onKeyDown={alPresionarTecla}
            onBlur={() => setAbierto(false)}
          />
        )}
      </Campo>
      <ul
        id={idLista}
        role="listbox"
        aria-label={etiqueta}
        hidden={!visible}
        className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border border-border bg-surface py-2 shadow-md"
      >
        {coincidencias.map((opcion) => (
          <li
            key={opcion.valor}
            id={idOpcion(opcion)}
            role="option"
            aria-selected={opcion === opcionActiva}
            onMouseDown={(evento) => evento.preventDefault()}
            onClick={() => elegir(opcion)}
            className={cn(
              'flex min-h-control cursor-pointer items-center px-4 text-dense text-ink',
              opcion === opcionActiva ? 'bg-primary-soft' : 'hover:bg-canvas',
            )}
          >
            {opcion.etiqueta}
          </li>
        ))}
      </ul>
    </div>
  );
}
