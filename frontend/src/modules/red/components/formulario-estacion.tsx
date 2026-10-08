'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Boton, EnlaceBoton } from '@/shared/components/acciones';
import {
  AccionesFormulario,
  Campo,
  CampoNumero,
  CampoTexto,
  Casilla,
  ResumenErrores,
  Selector,
  type Opcion,
} from '@/shared/components/formulario';
import { Tarjeta } from '@/shared/components/superficies';
import { editarEstacion } from '../actions/editar-estacion';
import { registrarEstacion } from '../actions/registrar-estacion';
import { erroresDeCampo, mensajeDe, useEnvio } from '../hooks/use-envio';
import { esquemaFormularioEstacion, type FormularioEstacion as Datos } from '../schemas/estacion';

type Valores = z.input<typeof esquemaFormularioEstacion>;

/** Lo que el formulario necesita de una estación existente. */
export type EstacionEditable = Readonly<{
  id: number;
  codigo: string;
  nombre: string;
  municipalidadId: number;
  tieneParqueo: boolean;
  latitud: number | null;
  longitud: number | null;
}>;

type Propiedades = Readonly<{
  municipalidades: readonly Opcion[];
  /** Sin estación se registra una nueva; con ella, se edita (el código no cambia). */
  estacion?: EstacionEditable;
}>;

const VACIOS: Valores = {
  codigo: '',
  nombre: '',
  municipalidadId: '',
  tieneParqueo: false,
  latitud: '',
  longitud: '',
};

function textoDe(numero: number | null): string {
  return numero === null ? '' : String(numero);
}

function valoresIniciales(estacion?: EstacionEditable): Valores {
  if (estacion === undefined) {
    return VACIOS;
  }
  return {
    ...estacion,
    municipalidadId: String(estacion.municipalidadId),
    latitud: textoDe(estacion.latitud),
    longitud: textoDe(estacion.longitud),
  };
}

/** Registrar o editar una estación. */
export function FormularioEstacion({ municipalidades, estacion }: Propiedades): ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors, submitCount },
  } = useForm<Valores, unknown, Datos>({
    resolver: zodResolver(esquemaFormularioEstacion),
    defaultValues: valoresIniciales(estacion),
  });
  const { pendiente, error, enviar } = useEnvio((datos: Datos) =>
    estacion ? editarEstacion(estacion.id, datos) : registrarEstacion(datos),
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
          {estacion ? null : (
            <div className="md:col-span-6">
              <Campo
                id="codigo"
                etiqueta="Código"
                ayuda="No se puede cambiar después."
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
          <div className="flex items-end md:col-span-6">
            <Casilla id="tieneParqueo" etiqueta="Tiene parqueo" {...register('tieneParqueo')} />
          </div>
          <h3 className="mt-4 text-subheading text-ink md:col-span-12">Ubicación</h3>
          <div className="md:col-span-6">
            <Campo id="latitud" etiqueta="Latitud" opcional error={mensajeDe(errors, 'latitud')}>
              {(control) => <CampoNumero {...control} {...register('latitud')} step="any" />}
            </Campo>
          </div>
          <div className="md:col-span-6">
            <Campo id="longitud" etiqueta="Longitud" opcional error={mensajeDe(errors, 'longitud')}>
              {(control) => <CampoNumero {...control} {...register('longitud')} step="any" />}
            </Campo>
          </div>
        </Tarjeta>
        <AccionesFormulario>
          <EnlaceBoton
            href={estacion ? `/estaciones/${estacion.id}` : '/estaciones'}
            variante="secundario"
          >
            Cancelar
          </EnlaceBoton>
          <Boton type="submit" variante="principal" cargando={pendiente}>
            {estacion ? 'Guardar cambios' : 'Registrar estación'}
          </Boton>
        </AccionesFormulario>
      </form>
    </div>
  );
}
