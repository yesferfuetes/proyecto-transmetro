import { useState, useTransition, type BaseSyntheticEvent } from 'react';
import {
  useFieldArray,
  useForm,
  useWatch,
  type UseFieldArrayReturn,
  type UseFormReturn,
} from 'react-hook-form';
import { definirRecorrido } from '../actions/definir-recorrido';
import { esquemaFormularioRecorrido } from '../schemas/recorrido';
import { entradaDeRecorrido, longitudResultante, type FilaEditable } from './recorrido';

export type ValoresEditor = { paradas: FilaEditable[] };

type Editor = Readonly<{
  formulario: UseFormReturn<ValoresEditor>;
  filas: UseFieldArrayReturn<ValoresEditor, 'paradas'>['fields'];
  paradas: readonly FilaEditable[];
  longitudKm: number | null;
  anuncio: string;
  pendiente: boolean;
  mover: (indice: number, paso: -1 | 1) => void;
  quitar: (indice: number) => void;
  agregar: (fila: Omit<FilaEditable, 'distancia'>) => void;
  guardar: (evento?: BaseSyntheticEvent) => void;
}>;

const nombreDe = (fila: FilaEditable): string => `${fila.codigo} ${fila.nombre}`;

/** Estado del editor: lista ordenada, anuncios para lector de pantalla y envío. */
export function useEditorDeRecorrido(lineaId: number, inicial: FilaEditable[]): Editor {
  const formulario = useForm<ValoresEditor>({ defaultValues: { paradas: inicial } });
  const lista = useFieldArray({ control: formulario.control, name: 'paradas' });
  const paradas = useWatch({ control: formulario.control, name: 'paradas' });
  const [anuncio, setAnuncio] = useState('');
  const [pendiente, iniciar] = useTransition();

  const mover = (indice: number, paso: -1 | 1): void => {
    const destino = indice + paso;
    const fila = paradas[indice];
    if (fila === undefined || destino < 0 || destino >= paradas.length) {
      return;
    }
    formulario.clearErrors();
    lista.move(indice, destino);
    setAnuncio(`${nombreDe(fila)} pasó a la posición ${destino + 1} de ${paradas.length}.`);
  };

  const quitar = (indice: number): void => {
    const fila = paradas[indice];
    if (fila === undefined) {
      return;
    }
    formulario.clearErrors();
    lista.remove(indice);
    setAnuncio(`Se quitó ${nombreDe(fila)} del recorrido.`);
  };

  const agregar = (fila: Omit<FilaEditable, 'distancia'>): void => {
    lista.append({ ...fila, distancia: '' }, { shouldFocus: false });
    setAnuncio(`Se agregó ${fila.codigo} ${fila.nombre} en la posición ${paradas.length + 1}.`);
  };

  const enviar = formulario.handleSubmit((valores) => {
    formulario.clearErrors();
    const validacion = esquemaFormularioRecorrido.safeParse(entradaDeRecorrido(valores.paradas));
    if (!validacion.success) {
      for (const problema of validacion.error.issues) {
        const [, indice, campo] = problema.path;
        const ruta =
          campo === 'distanciaSiguienteKm' && typeof indice === 'number'
            ? (`paradas.${indice}.distancia` as const)
            : ('root.servidor' as const);
        formulario.setError(ruta, { message: problema.message });
      }
      return;
    }
    iniciar(async () => {
      const resultado = await definirRecorrido(lineaId, validacion.data);
      if (!resultado.ok) {
        formulario.setError('root.servidor', { message: resultado.error.mensaje });
      }
    });
  });

  return {
    formulario,
    filas: lista.fields,
    paradas,
    longitudKm: longitudResultante(paradas),
    anuncio,
    pendiente,
    mover,
    quitar,
    agregar,
    guardar: (evento): void => {
      void enviar(evento);
    },
  };
}
