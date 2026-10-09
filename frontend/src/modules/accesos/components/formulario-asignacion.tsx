'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Boton } from '@/shared/components/acciones';
import {
  Campo,
  CampoTexto,
  ResumenErrores,
  Selector,
  type Opcion,
} from '@/shared/components/formulario';
import { Aviso } from '@/shared/components/superposiciones';
import { asignarGuardia } from '../actions/asignar-guardia';
import { erroresDeCampo, mensajeDe, useEnvio } from '../hooks/use-envio';
import { esquemaFormularioAsignacion, type FormularioAsignacion as Datos } from '../schemas/acceso';

type Valores = z.input<typeof esquemaFormularioAsignacion>;

type Propiedades = Readonly<{ accesoId: number; guardias: readonly Opcion[] }>;

const VACIOS: Valores = { guardiaId: '', turno: '' };

/** Asigna un guardia a un acceso en un turno; el error del backend se muestra tal cual. */
export function FormularioAsignacion({ accesoId, guardias }: Propiedades): ReactElement {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, submitCount },
  } = useForm<Valores, unknown, Datos>({
    resolver: zodResolver(esquemaFormularioAsignacion),
    defaultValues: VACIOS,
  });
  const { pendiente, error, guardado, enviar } = useEnvio(
    (datos: Datos) => asignarGuardia(accesoId, datos),
    () => reset(VACIOS),
  );

  return (
    <form
      noValidate
      onSubmit={(evento) => void handleSubmit(enviar)(evento)}
      className="flex flex-col gap-4"
    >
      {error ? (
        <ResumenErrores key={submitCount} mensaje={error.mensaje} errores={erroresDeCampo(error)} />
      ) : null}
      {guardado && !error ? <Aviso estado="exito" titulo="Guardia asignado." /> : null}
      <div className="grid gap-4 md:grid-cols-12 md:items-start">
        <div className="md:col-span-5">
          <Campo id="guardiaId" etiqueta="Guardia" error={mensajeDe(errors, 'guardiaId')}>
            {(control) => (
              <Selector
                {...control}
                {...register('guardiaId')}
                opciones={guardias}
                textoVacio="Elige un guardia"
              />
            )}
          </Campo>
        </div>
        <div className="md:col-span-4">
          <Campo
            id="turno"
            etiqueta="Turno"
            ayuda="Por ejemplo 06:00-14:00."
            error={mensajeDe(errors, 'turno')}
          >
            {(control) => (
              <CampoTexto {...control} {...register('turno')} maxLength={20} autoComplete="off" />
            )}
          </Campo>
        </div>
        <div className="md:col-span-3 md:pt-7">
          <Boton type="submit" variante="principal" cargando={pendiente}>
            Asignar guardia
          </Boton>
        </div>
      </div>
    </form>
  );
}
