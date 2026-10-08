'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Boton, EnlaceBoton } from '@/shared/components/acciones';
import {
  AccionesFormulario,
  Campo,
  CampoFecha,
  CampoTexto,
  ResumenErrores,
} from '@/shared/components/formulario';
import { Tarjeta } from '@/shared/components/superficies';
import { editarMunicipalidad } from '../actions/editar-municipalidad';
import { registrarMunicipalidad } from '../actions/registrar-municipalidad';
import { erroresDeCampo, mensajeDe, useEnvio } from '../hooks/use-envio';
import {
  esquemaFormularioMunicipalidad,
  type FormularioMunicipalidad as Datos,
  type Municipalidad,
} from '../schemas/municipalidad';

type Valores = z.input<typeof esquemaFormularioMunicipalidad>;

type Propiedades = Readonly<{
  /** Sin municipalidad se registra una nueva; con ella, se edita. */
  municipalidad?: Municipalidad;
}>;

function valoresIniciales(municipalidad?: Municipalidad): Valores {
  return {
    nombre: municipalidad?.nombre ?? '',
    departamento: municipalidad?.departamento ?? '',
    fechaIncorporacion: municipalidad?.fechaIncorporacion ?? '',
  };
}

/** Registrar o editar una municipalidad. */
export function FormularioMunicipalidad({ municipalidad }: Propiedades): ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors, submitCount },
  } = useForm<Valores, unknown, Datos>({
    resolver: zodResolver(esquemaFormularioMunicipalidad),
    defaultValues: valoresIniciales(municipalidad),
  });
  const { pendiente, error, enviar } = useEnvio((datos: Datos) =>
    municipalidad ? editarMunicipalidad(municipalidad.id, datos) : registrarMunicipalidad(datos),
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
          <div className="md:col-span-12">
            <Campo id="nombre" etiqueta="Nombre" error={mensajeDe(errors, 'nombre')}>
              {(control) => <CampoTexto {...control} {...register('nombre')} maxLength={150} />}
            </Campo>
          </div>
          <div className="md:col-span-6">
            <Campo
              id="departamento"
              etiqueta="Departamento"
              opcional
              error={mensajeDe(errors, 'departamento')}
            >
              {(control) => (
                <CampoTexto {...control} {...register('departamento')} maxLength={100} />
              )}
            </Campo>
          </div>
          <div className="md:col-span-6">
            <Campo
              id="fechaIncorporacion"
              etiqueta="Fecha de incorporación a la red"
              opcional
              error={mensajeDe(errors, 'fechaIncorporacion')}
            >
              {(control) => <CampoFecha {...control} {...register('fechaIncorporacion')} />}
            </Campo>
          </div>
        </Tarjeta>
        <AccionesFormulario>
          <EnlaceBoton href="/municipalidades" variante="secundario">
            Cancelar
          </EnlaceBoton>
          <Boton type="submit" variante="principal" cargando={pendiente}>
            {municipalidad ? 'Guardar cambios' : 'Registrar municipalidad'}
          </Boton>
        </AccionesFormulario>
      </form>
    </div>
  );
}
