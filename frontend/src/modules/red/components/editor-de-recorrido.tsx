'use client';

import type { ReactElement } from 'react';
import { Boton, EnlaceBoton } from '@/shared/components/acciones';
import { EstadoVacio } from '@/shared/components/datos';
import { AccionesFormulario, ResumenErrores } from '@/shared/components/formulario';
import { Tarjeta } from '@/shared/components/superficies';
import { formatearKm } from '@/shared/lib/formato';
import type { FilaEditable } from '../hooks/recorrido';
import { useEditorDeRecorrido } from '../hooks/use-editor-de-recorrido';
import type { OpcionEstacion } from '../schemas/estacion';
import { BuscadorDeEstaciones } from './buscador-de-estaciones';
import { FilaDeRecorrido } from './fila-de-recorrido';

const ID_BUSCADOR = 'buscador-estaciones';

type Propiedades = Readonly<{
  lineaId: number;
  codigoLinea: string;
  /** Recorrido vigente, en orden. */
  recorrido: FilaEditable[];
  /** Todas las estaciones de la red, para el buscador. */
  estaciones: readonly OpcionEstacion[];
}>;

/** Edita el recorrido completo de una línea; se guarda de una vez y el backend lo valida entero. */
export function EditorDeRecorrido({
  lineaId,
  codigoLinea,
  recorrido,
  estaciones,
}: Propiedades): ReactElement {
  const editor = useEditorDeRecorrido(lineaId, recorrido);
  const { errors, submitCount } = editor.formulario.formState;
  const agregadas = new Set(editor.paradas.map((parada) => parada.estacionId));
  const disponibles = estaciones
    .filter((estacion) => !agregadas.has(estacion.id))
    .map((estacion) => ({
      valor: String(estacion.id),
      etiqueta: `${estacion.codigo} · ${estacion.nombre}`,
    }));
  const errorGeneral = errors.root?.servidor?.message;

  const agregar = (valor: string): void => {
    const estacion = estaciones.find((opcion) => String(opcion.id) === valor);
    if (estacion) {
      editor.agregar({ estacionId: estacion.id, codigo: estacion.codigo, nombre: estacion.nombre });
    }
  };

  return (
    <form noValidate onSubmit={editor.guardar} className="flex flex-col gap-6">
      {errorGeneral ? <ResumenErrores key={submitCount} mensaje={errorGeneral} /> : null}
      <Tarjeta className="flex flex-col gap-4">
        <BuscadorDeEstaciones
          id={ID_BUSCADOR}
          etiqueta="Agregar estación al final"
          ayuda="Escribe el código o el nombre y elige con las flechas y Enter."
          opciones={disponibles}
          onElegir={(opcion) => agregar(opcion.valor)}
        />
        {editor.filas.length === 0 ? (
          <EstadoVacio
            variante="sin-datos"
            titulo="Recorrido vacío"
            texto="Agrega estaciones con el buscador para armar el recorrido."
          />
        ) : (
          <ol aria-label="Estaciones del recorrido" className="flex flex-col">
            {editor.filas.map((fila, indice) => (
              <FilaDeRecorrido
                key={fila.id}
                clave={fila.id}
                codigoLinea={codigoLinea}
                fila={fila}
                posicion={indice + 1}
                total={editor.filas.length}
                distancia={editor.formulario.register(`paradas.${indice}.distancia`)}
                error={errors.paradas?.[indice]?.distancia?.message}
                onSubir={() => editor.mover(indice, -1)}
                onBajar={() => editor.mover(indice, 1)}
                onQuitar={() => {
                  editor.quitar(indice);
                  // La fila quitada tenía el foco; vuelve al buscador para seguir editando.
                  document.getElementById(ID_BUSCADOR)?.focus();
                }}
              />
            ))}
          </ol>
        )}
        <p className="border-t border-border pt-4 text-body text-ink">
          Longitud al guardar:{' '}
          <span className="text-label tabular-nums">{formatearKm(editor.longitudKm)}</span>
        </p>
        <p aria-live="polite" className="sr-only">
          {editor.anuncio}
        </p>
      </Tarjeta>
      <AccionesFormulario>
        <EnlaceBoton href={`/lineas/${lineaId}`} variante="secundario">
          Descartar
        </EnlaceBoton>
        <Boton type="submit" variante="principal" cargando={editor.pendiente}>
          Guardar recorrido
        </Boton>
      </AccionesFormulario>
    </form>
  );
}
