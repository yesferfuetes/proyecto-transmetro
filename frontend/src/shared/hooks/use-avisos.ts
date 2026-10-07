import { create } from 'zustand';

export type EstadoAviso = 'exito' | 'error';

export type AvisoEfimeroDatos = Readonly<{ id: number; estado: EstadoAviso; mensaje: string }>;

type AlmacenAvisos = Readonly<{
  avisos: readonly AvisoEfimeroDatos[];
  agregar: (aviso: Omit<AvisoEfimeroDatos, 'id'>) => void;
  quitar: (id: number) => void;
}>;

let siguienteId = 1;

/** Cola de avisos efímeros que muestran las vistas tras una mutación. Estado solo del cliente. */
export const useAvisos = create<AlmacenAvisos>()((asignar) => ({
  avisos: [],
  agregar: (aviso): void => {
    const id = siguienteId;
    siguienteId += 1;
    asignar((estado) => ({ avisos: [...estado.avisos, { ...aviso, id }] }));
  },
  quitar: (id): void => {
    asignar((estado) => ({ avisos: estado.avisos.filter((aviso) => aviso.id !== id) }));
  },
}));
