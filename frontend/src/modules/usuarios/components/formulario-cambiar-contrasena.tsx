'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { Boton } from '@/shared/components/acciones';
import { Campo, CampoContrasena } from '@/shared/components/formulario';
import { Aviso } from '@/shared/components/superposiciones';
import { cambiarMiContrasena } from '../actions/cambiar-mi-contrasena';
import { useEnvio } from '../hooks/use-envio';
import { esquemaCambioDeContrasena, type CambioDeContrasena } from '../schemas/formularios';
import { ErrorDeEnvio } from './error-de-envio';
import { envioExitoso, mensajeDelServidor } from './errores-de-envio';

const PREFIJO = 'cambio';

/** Cambio de la propia contraseña: la actual y la nueva dos veces. */
export function FormularioCambiarContrasena(): ReactElement {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CambioDeContrasena>({
    resolver: zodResolver(esquemaCambioDeContrasena),
    defaultValues: { contrasenaActual: '', contrasenaNueva: '', confirmacion: '' },
  });
  const { estado, enviar, pendiente } = useEnvio<CambioDeContrasena>(cambiarMiContrasena, () =>
    reset(),
  );

  return (
    <form
      noValidate
      onSubmit={(evento) => void handleSubmit(enviar)(evento)}
      className="flex flex-col gap-4"
    >
      {envioExitoso(estado) ? (
        <Aviso estado="exito" titulo="Contraseña cambiada.">
          La próxima vez que inicies sesión usa la contraseña nueva.
        </Aviso>
      ) : null}
      <ErrorDeEnvio estado={estado} prefijo={PREFIJO} />
      <Campo
        id={`${PREFIJO}-contrasenaActual`}
        etiqueta="Contraseña actual"
        error={errors.contrasenaActual?.message ?? mensajeDelServidor(estado, 'contrasenaActual')}
      >
        {(control) => (
          <CampoContrasena
            {...control}
            autoComplete="current-password"
            {...register('contrasenaActual')}
          />
        )}
      </Campo>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Campo
          id={`${PREFIJO}-contrasenaNueva`}
          etiqueta="Contraseña nueva"
          ayuda="Al menos 8 caracteres, con una letra y un número."
          error={errors.contrasenaNueva?.message ?? mensajeDelServidor(estado, 'contrasenaNueva')}
        >
          {(control) => (
            <CampoContrasena
              {...control}
              autoComplete="new-password"
              {...register('contrasenaNueva')}
            />
          )}
        </Campo>
        <Campo
          id={`${PREFIJO}-confirmacion`}
          etiqueta="Repite la contraseña nueva"
          error={errors.confirmacion?.message}
        >
          {(control) => (
            <CampoContrasena
              {...control}
              autoComplete="new-password"
              {...register('confirmacion')}
            />
          )}
        </Campo>
      </div>
      <Boton
        type="submit"
        variante="principal"
        className="w-fit"
        cargando={pendiente}
        disabled={pendiente}
      >
        Cambiar contraseña
      </Boton>
    </form>
  );
}
