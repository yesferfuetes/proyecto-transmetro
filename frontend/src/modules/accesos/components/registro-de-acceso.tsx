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
import { registrarAcceso } from '../actions/registrar-acceso';
import { erroresDeCampo, mensajeDe, useEnvio } from '../hooks/use-envio';
import { esquemaFormularioAcceso, type FormularioAcceso as Datos } from '../schemas/acceso';

type Valores = z.input<typeof esquemaFormularioAcceso>;

type Propiedades = Readonly<{
  estaciones: readonly Opcion[];
  guardias: readonly Opcion[];
  /** Estación con la que arranca el formulario, por ejemplo la que se venía consultando. */
  estacionInicialId?: string;
}>;

/** Registro de un acceso junto con su primer guardia y turno. */
export function RegistroDeAcceso({
  estaciones,
  guardias,
  estacionInicialId = '',
}: Propiedades): ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors, submitCount },
  } = useForm<Valores, unknown, Datos>({
    resolver: zodResolver(esquemaFormularioAcceso),
    defaultValues: {
      estacionId: estacionInicialId,
      codigo: '',
      nombre: '',
      guardiaId: '',
      turno: '',
    },
  });
  const { pendiente, error, enviar } = useEnvio((datos: Datos) => registrarAcceso(datos));

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
              ayuda="No se puede cambiar después."
              error={mensajeDe(errors, 'codigo')}
            >
              {(control) => <CampoTexto {...control} {...register('codigo')} maxLength={10} />}
            </Campo>
          </div>
          <div className="md:col-span-6">
            <Campo id="nombre" etiqueta="Nombre" opcional error={mensajeDe(errors, 'nombre')}>
              {(control) => <CampoTexto {...control} {...register('nombre')} maxLength={100} />}
            </Campo>
          </div>
          <h3 className="mt-4 text-subheading text-ink md:col-span-12">Primer guardia</h3>
          <div className="md:col-span-6">
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
          <div className="md:col-span-6">
            <Campo
              id="turno"
              etiqueta="Turno"
              ayuda="Hora de inicio y de fin, por ejemplo 06:00-14:00."
              error={mensajeDe(errors, 'turno')}
            >
              {(control) => (
                <CampoTexto {...control} {...register('turno')} maxLength={20} autoComplete="off" />
              )}
            </Campo>
          </div>
        </Tarjeta>
        <AccionesFormulario>
          <EnlaceBoton href="/accesos" variante="secundario">
            Cancelar
          </EnlaceBoton>
          <Boton type="submit" variante="principal" cargando={pendiente}>
            Registrar acceso
          </Boton>
        </AccionesFormulario>
      </form>
    </div>
  );
}
