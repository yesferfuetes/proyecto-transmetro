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
  ResumenErrores,
  Selector,
  type Opcion,
} from '@/shared/components/formulario';
import { Tarjeta } from '@/shared/components/superficies';
import { editarParqueo } from '../actions/editar-parqueo';
import { registrarParqueo } from '../actions/registrar-parqueo';
import { erroresDeCampo, mensajeDe, useEnvio } from '../hooks/use-envio';
import { esquemaFormularioParqueo, type FormularioParqueo as Datos } from '../schemas/parqueo';

type Valores = z.input<typeof esquemaFormularioParqueo>;

/** Lo que el formulario necesita de un parqueo existente. */
export type ParqueoEditable = Readonly<{
  id: number;
  estacionId: number;
  codigo: string;
  capacidadVehiculos: number;
}>;

type Propiedades = Readonly<{
  estaciones: readonly Opcion[];
  /** Sin parqueo se registra uno nuevo; con él, se edita su capacidad. */
  parqueo?: ParqueoEditable;
}>;

function valoresIniciales(parqueo?: ParqueoEditable): Valores {
  return parqueo
    ? {
        estacionId: String(parqueo.estacionId),
        codigo: parqueo.codigo,
        capacidadVehiculos: String(parqueo.capacidadVehiculos),
      }
    : { estacionId: '', codigo: '', capacidadVehiculos: '' };
}

/** Registrar un parqueo o editar su capacidad. La estación y el código no cambian. */
export function FormularioParqueo({ estaciones, parqueo }: Propiedades): ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors, submitCount },
  } = useForm<Valores, unknown, Datos>({
    resolver: zodResolver(esquemaFormularioParqueo),
    defaultValues: valoresIniciales(parqueo),
  });
  const { pendiente, error, enviar } = useEnvio((datos: Datos) =>
    parqueo
      ? editarParqueo(parqueo.id, { capacidadVehiculos: datos.capacidadVehiculos })
      : registrarParqueo(datos),
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
          {parqueo ? null : (
            <>
              <div className="md:col-span-6">
                <Campo id="estacionId" etiqueta="Estación" error={mensajeDe(errors, 'estacionId')}>
                  {(control) => (
                    <Selector
                      {...control}
                      {...register('estacionId')}
                      opciones={estaciones}
                      textoVacio="Elige una estación"
                    />
                  )}
                </Campo>
              </div>
              <div className="md:col-span-6">
                <Campo
                  id="codigo"
                  etiqueta="Código"
                  ayuda="Por ejemplo P1. No se puede cambiar después."
                  error={mensajeDe(errors, 'codigo')}
                >
                  {(control) => <CampoTexto {...control} {...register('codigo')} maxLength={10} />}
                </Campo>
              </div>
            </>
          )}
          <div className="md:col-span-6">
            <Campo
              id="capacidadVehiculos"
              etiqueta="Capacidad de vehículos"
              error={mensajeDe(errors, 'capacidadVehiculos')}
            >
              {(control) => (
                <CampoNumero {...control} {...register('capacidadVehiculos')} unidad="vehículos" />
              )}
            </Campo>
          </div>
        </Tarjeta>
        <AccionesFormulario>
          <EnlaceBoton href="/flota/parqueos" variante="secundario">
            Cancelar
          </EnlaceBoton>
          <Boton type="submit" variante="principal" cargando={pendiente}>
            {parqueo ? 'Guardar cambios' : 'Registrar parqueo'}
          </Boton>
        </AccionesFormulario>
      </form>
    </div>
  );
}
