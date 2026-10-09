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
} from '@/shared/components/formulario';
import { Tarjeta } from '@/shared/components/superficies';
import { editarGuardia } from '../actions/editar-guardia';
import { registrarGuardia } from '../actions/registrar-guardia';
import { erroresDeCampo, mensajeDe, useEnvio } from '../hooks/use-envio';
import { esquemaFormularioGuardia, type FormularioGuardia as Datos } from '../schemas/guardia';

type Valores = z.input<typeof esquemaFormularioGuardia>;

/** Lo que el formulario necesita de un guardia existente. */
export type GuardiaEditable = Readonly<{
  id: number;
  nombre: string;
  dpi: string;
  telefono: string | null;
}>;

type Propiedades = Readonly<{
  /** Sin guardia se registra uno nuevo; con él, se edita. */
  guardia?: GuardiaEditable;
}>;

const VACIOS: Valores = { nombre: '', dpi: '', telefono: '' };

function valoresIniciales(guardia?: GuardiaEditable): Valores {
  return guardia ? { ...guardia, telefono: guardia.telefono ?? '' } : VACIOS;
}

/** Registrar o editar un guardia de seguridad. */
export function FormularioGuardia({ guardia }: Propiedades): ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors, submitCount },
  } = useForm<Valores, unknown, Datos>({
    resolver: zodResolver(esquemaFormularioGuardia),
    defaultValues: valoresIniciales(guardia),
  });
  const { pendiente, error, enviar } = useEnvio((datos: Datos) =>
    guardia ? editarGuardia(guardia.id, datos) : registrarGuardia(datos),
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
              id="dpi"
              etiqueta="DPI"
              ayuda="13 dígitos; puedes separarlos con espacios."
              error={mensajeDe(errors, 'dpi')}
            >
              {(control) => (
                <CampoTexto
                  {...control}
                  {...register('dpi')}
                  maxLength={20}
                  inputMode="numeric"
                  autoComplete="off"
                />
              )}
            </Campo>
          </div>
          <div className="md:col-span-6">
            <Campo
              id="telefono"
              etiqueta="Teléfono"
              opcional
              ayuda="8 dígitos; el guion es opcional."
              error={mensajeDe(errors, 'telefono')}
            >
              {(control) => (
                <CampoTexto {...control} {...register('telefono')} type="tel" maxLength={20} />
              )}
            </Campo>
          </div>
        </Tarjeta>
        <AccionesFormulario>
          <EnlaceBoton href="/guardias" variante="secundario">
            Cancelar
          </EnlaceBoton>
          <Boton type="submit" variante="principal" cargando={pendiente}>
            {guardia ? 'Guardar cambios' : 'Registrar guardia'}
          </Boton>
        </AccionesFormulario>
      </form>
    </div>
  );
}
