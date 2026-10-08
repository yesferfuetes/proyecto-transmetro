'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Boton, EnlaceBoton } from '@/shared/components/acciones';
import {
  AccionesFormulario,
  Campo,
  CampoTexto,
  ResumenErrores,
  Selector,
  type Opcion,
} from '@/shared/components/formulario';
import { Tarjeta } from '@/shared/components/superficies';
import { editarLinea } from '../actions/editar-linea';
import { registrarLinea } from '../actions/registrar-linea';
import { erroresDeCampo, mensajeDe, useEnvio } from '../hooks/use-envio';
import { ETIQUETA_DE_ESTADO, esquemaEstadoLinea } from '../schemas/comunes';
import type { EstadoLinea } from '../schemas/comunes';
import { esquemaFormularioLinea, type FormularioLinea as Datos } from '../schemas/linea';

type Valores = z.input<typeof esquemaFormularioLinea>;

const ESTADOS: readonly Opcion[] = esquemaEstadoLinea.options.map((estado) => ({
  valor: estado,
  etiqueta: ETIQUETA_DE_ESTADO[estado],
}));

/** Lo que el formulario necesita de una línea existente. */
export type LineaEditable = Readonly<{
  id: number;
  codigo: string;
  nombre: string;
  municipalidadId: number;
  estado: EstadoLinea;
}>;

type Propiedades = Readonly<{
  municipalidades: readonly Opcion[];
  /** Sin línea se registra una nueva; con ella, se editan nombre y municipalidad. */
  linea?: LineaEditable;
}>;

function valoresIniciales(linea?: LineaEditable): Valores {
  if (linea === undefined) {
    return { codigo: '', nombre: '', municipalidadId: '', estado: 'EN_CONSTRUCCION' };
  }
  return { ...linea, municipalidadId: String(linea.municipalidadId) };
}

/** Registrar o editar una línea. El código y el estado solo se eligen al registrarla. */
export function FormularioLinea({ municipalidades, linea }: Propiedades): ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors, submitCount },
  } = useForm<Valores, unknown, Datos>({
    resolver: zodResolver(esquemaFormularioLinea),
    defaultValues: valoresIniciales(linea),
  });
  const { pendiente, error, enviar } = useEnvio((datos: Datos) =>
    linea ? editarLinea(linea.id, datos) : registrarLinea(datos),
  );

  return (
    <div className="grid lg:grid-cols-12">
      <form
        noValidate
        onSubmit={(evento) => void handleSubmit(enviar)(evento)}
        className="flex flex-col gap-6 lg:col-span-8"
      >
        {error ? (
          <ResumenErrores
            key={submitCount}
            mensaje={error.mensaje}
            errores={erroresDeCampo(error)}
          />
        ) : null}
        <Tarjeta className="grid gap-4 md:grid-cols-12">
          {linea ? null : (
            <div className="md:col-span-6">
              <Campo
                id="codigo"
                etiqueta="Código"
                ayuda="Por ejemplo L20. No se puede cambiar después."
                error={mensajeDe(errors, 'codigo')}
              >
                {(control) => <CampoTexto {...control} {...register('codigo')} maxLength={10} />}
              </Campo>
            </div>
          )}
          <div className="md:col-span-6">
            <Campo id="nombre" etiqueta="Nombre" error={mensajeDe(errors, 'nombre')}>
              {(control) => <CampoTexto {...control} {...register('nombre')} maxLength={150} />}
            </Campo>
          </div>
          <div className="md:col-span-6">
            <Campo
              id="municipalidadId"
              etiqueta="Municipalidad"
              error={mensajeDe(errors, 'municipalidadId')}
            >
              {(control) => (
                <Selector
                  {...control}
                  {...register('municipalidadId')}
                  opciones={municipalidades}
                  textoVacio="Elige una municipalidad"
                />
              )}
            </Campo>
          </div>
          {linea ? null : (
            <div className="md:col-span-6">
              <Campo
                id="estado"
                etiqueta="Estado inicial"
                ayuda="Una línea nueva no tiene recorrido; normalmente empieza en construcción."
                error={mensajeDe(errors, 'estado')}
              >
                {(control) => <Selector {...control} {...register('estado')} opciones={ESTADOS} />}
              </Campo>
            </div>
          )}
        </Tarjeta>
        <AccionesFormulario>
          <EnlaceBoton href={linea ? `/lineas/${linea.id}` : '/lineas'} variante="secundario">
            Cancelar
          </EnlaceBoton>
          <Boton type="submit" variante="principal" cargando={pendiente}>
            {linea ? 'Guardar cambios' : 'Registrar línea'}
          </Boton>
        </AccionesFormulario>
      </form>
    </div>
  );
}
