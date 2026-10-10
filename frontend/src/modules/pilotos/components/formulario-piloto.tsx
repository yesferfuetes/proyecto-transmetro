'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Boton, EnlaceBoton } from '@/shared/components/acciones';
import {
  AccionesFormulario,
  Campo,
  CampoArea,
  CampoTexto,
  ResumenErrores,
  Selector,
  type Opcion,
} from '@/shared/components/formulario';
import { Tarjeta } from '@/shared/components/superficies';
import { editarPiloto } from '../actions/editar-piloto';
import { registrarPiloto } from '../actions/registrar-piloto';
import { erroresDeCampo, mensajeDe, useEnvio } from '../hooks/use-envio';
import { esquemaFormularioPiloto, type FormularioPiloto as Datos } from '../schemas/piloto';

type Valores = z.input<typeof esquemaFormularioPiloto>;

/** Lo que el formulario necesita de un piloto existente. */
export type PilotoEditable = Readonly<{
  id: number;
  nombre: string;
  dpi: string;
  direccionResidencia: string;
  telefono: string;
  correo: string | null;
  historialEducativo: string;
}>;

type Propiedades = Readonly<{
  /** Buses que reciben pilotos; solo se ofrecen al registrar. */
  buses: readonly Opcion[];
  /** Sin piloto se registra uno nuevo; con él, se edita su expediente. */
  piloto?: PilotoEditable;
}>;

const VALORES_VACIOS: Valores = {
  nombre: '',
  dpi: '',
  direccionResidencia: '',
  telefono: '',
  correo: '',
  historialEducativo: '',
  busId: '',
};

function valoresIniciales(piloto?: PilotoEditable): Valores {
  return piloto ? { ...VALORES_VACIOS, ...piloto, correo: piloto.correo ?? '' } : VALORES_VACIOS;
}

/** Registrar un piloto o editar su expediente; el bus solo se elige al registrar. */
export function FormularioPiloto({ buses, piloto }: Propiedades): ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors, submitCount },
  } = useForm<Valores, unknown, Datos>({
    resolver: zodResolver(esquemaFormularioPiloto),
    defaultValues: valoresIniciales(piloto),
  });
  const { pendiente, error, enviar } = useEnvio((datos: Datos) =>
    piloto ? editarPiloto(piloto.id, datos) : registrarPiloto(datos),
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
          <div className="md:col-span-8">
            <Campo id="nombre" etiqueta="Nombre" error={mensajeDe(errors, 'nombre')}>
              {(control) => <CampoTexto {...control} {...register('nombre')} maxLength={150} />}
            </Campo>
          </div>
          <div className="md:col-span-4">
            <Campo id="dpi" etiqueta="DPI" ayuda="13 dígitos." error={mensajeDe(errors, 'dpi')}>
              {(control) => (
                <CampoTexto {...control} {...register('dpi')} inputMode="numeric" maxLength={20} />
              )}
            </Campo>
          </div>
          <div className="md:col-span-4">
            <Campo
              id="telefono"
              etiqueta="Teléfono"
              ayuda="8 dígitos."
              error={mensajeDe(errors, 'telefono')}
            >
              {(control) => (
                <CampoTexto {...control} {...register('telefono')} type="tel" maxLength={9} />
              )}
            </Campo>
          </div>
          <div className="md:col-span-8">
            <Campo id="correo" etiqueta="Correo" opcional error={mensajeDe(errors, 'correo')}>
              {(control) => (
                <CampoTexto {...control} {...register('correo')} type="email" maxLength={150} />
              )}
            </Campo>
          </div>
          <div className="md:col-span-12">
            <Campo
              id="direccionResidencia"
              etiqueta="Dirección de residencia"
              error={mensajeDe(errors, 'direccionResidencia')}
            >
              {(control) => (
                <CampoTexto {...control} {...register('direccionResidencia')} maxLength={250} />
              )}
            </Campo>
          </div>
          <div className="md:col-span-12">
            <Campo
              id="historialEducativo"
              etiqueta="Historial educativo"
              ayuda="Estudios y títulos, hasta 2000 caracteres."
              error={mensajeDe(errors, 'historialEducativo')}
            >
              {(control) => (
                <CampoArea {...control} {...register('historialEducativo')} maxLength={2000} />
              )}
            </Campo>
          </div>
          {piloto ? null : (
            <div className="md:col-span-6">
              <Campo
                id="busId"
                etiqueta="Bus"
                opcional
                ayuda="Puedes asignarlo después."
                error={mensajeDe(errors, 'busId')}
              >
                {(control) => (
                  <Selector
                    {...control}
                    {...register('busId')}
                    opciones={buses}
                    textoVacio="Sin bus"
                  />
                )}
              </Campo>
            </div>
          )}
        </Tarjeta>
        <AccionesFormulario>
          <EnlaceBoton href={piloto ? `/pilotos/${piloto.id}` : '/pilotos'} variante="secundario">
            Cancelar
          </EnlaceBoton>
          <Boton type="submit" variante="principal" cargando={pendiente}>
            {piloto ? 'Guardar cambios' : 'Registrar piloto'}
          </Boton>
        </AccionesFormulario>
      </form>
    </div>
  );
}
