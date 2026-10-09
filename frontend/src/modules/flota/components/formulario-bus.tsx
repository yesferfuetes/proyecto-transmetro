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
import { editarBus } from '../actions/editar-bus';
import { registrarBus } from '../actions/registrar-bus';
import { erroresDeCampo, mensajeDe, useEnvio } from '../hooks/use-envio';
import { esquemaFormularioBus, type FormularioBus as Datos } from '../schemas/bus';

type Valores = z.input<typeof esquemaFormularioBus>;

/** Lo que el formulario necesita de un bus existente. */
export type BusEditable = Readonly<{
  id: number;
  placa: string;
  capacidadMax: number;
  parqueoId: number;
}>;

type Propiedades = Readonly<{
  parqueos: readonly Opcion[];
  lineas: readonly Opcion[];
  /** Sin bus se registra uno nuevo; con él, se edita su capacidad. */
  bus?: BusEditable;
}>;

function valoresIniciales(bus?: BusEditable): Valores {
  return bus
    ? {
        placa: bus.placa,
        capacidadMax: String(bus.capacidadMax),
        parqueoId: String(bus.parqueoId),
        lineaId: '',
      }
    : { placa: '', capacidadMax: '', parqueoId: '', lineaId: '' };
}

/** Registrar un bus o editar su capacidad. La placa no cambia después del registro. */
export function FormularioBus({ parqueos, lineas, bus }: Propiedades): ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors, submitCount },
  } = useForm<Valores, unknown, Datos>({
    resolver: zodResolver(esquemaFormularioBus),
    defaultValues: valoresIniciales(bus),
  });
  const { pendiente, error, enviar } = useEnvio((datos: Datos) =>
    bus ? editarBus(bus.id, { capacidadMax: datos.capacidadMax }) : registrarBus(datos),
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
          <div className="md:col-span-6">
            <Campo
              id="placa"
              etiqueta="Placa"
              ayuda={bus ? 'La placa no se puede cambiar.' : 'De 1 a 15 caracteres.'}
              error={mensajeDe(errors, 'placa')}
            >
              {(control) => (
                <CampoTexto
                  {...control}
                  {...register('placa')}
                  maxLength={15}
                  readOnly={bus !== undefined}
                />
              )}
            </Campo>
          </div>
          <div className="md:col-span-6">
            <Campo
              id="capacidadMax"
              etiqueta="Capacidad máxima"
              error={mensajeDe(errors, 'capacidadMax')}
            >
              {(control) => (
                <CampoNumero {...control} {...register('capacidadMax')} unidad="pasajeros" />
              )}
            </Campo>
          </div>
          {bus ? null : (
            <>
              <div className="md:col-span-6">
                <Campo id="parqueoId" etiqueta="Parqueo" error={mensajeDe(errors, 'parqueoId')}>
                  {(control) => (
                    <Selector
                      {...control}
                      {...register('parqueoId')}
                      opciones={parqueos}
                      textoVacio="Elige un parqueo"
                    />
                  )}
                </Campo>
              </div>
              <div className="md:col-span-6">
                <Campo
                  id="lineaId"
                  etiqueta="Línea"
                  opcional
                  ayuda="Puedes asignarla después."
                  error={mensajeDe(errors, 'lineaId')}
                >
                  {(control) => (
                    <Selector
                      {...control}
                      {...register('lineaId')}
                      opciones={lineas}
                      textoVacio="Sin línea"
                    />
                  )}
                </Campo>
              </div>
            </>
          )}
        </Tarjeta>
        <AccionesFormulario>
          <EnlaceBoton href={bus ? `/flota/${bus.id}` : '/flota'} variante="secundario">
            Cancelar
          </EnlaceBoton>
          <Boton type="submit" variante="principal" cargando={pendiente}>
            {bus ? 'Guardar cambios' : 'Registrar bus'}
          </Boton>
        </AccionesFormulario>
      </form>
    </div>
  );
}
