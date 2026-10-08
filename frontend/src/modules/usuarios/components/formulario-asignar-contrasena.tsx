'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { Boton } from '@/shared/components/acciones';
import { Campo, CampoContrasena } from '@/shared/components/formulario';
import { Aviso } from '@/shared/components/superposiciones';
import { asignarContrasena } from '../actions/asignar-contrasena';
import { useEnvio } from '../hooks/use-envio';
import { esquemaAsignacionContrasena, type AsignacionContrasena } from '../schemas/formularios';
import { ErrorDeEnvio } from './error-de-envio';
import { envioExitoso, mensajeDelServidor } from './errores-de-envio';

const PREFIJO = 'asignacion';

type Propiedades = Readonly<{ id: number }>;

/** El administrador escribe una contraseña nueva para otro usuario. */
export function FormularioAsignarContrasena({ id }: Propiedades): ReactElement {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AsignacionContrasena>({
    resolver: zodResolver(esquemaAsignacionContrasena),
    defaultValues: { contrasena: '', confirmacion: '' },
  });
  const { estado, enviar, pendiente } = useEnvio(
    (datos: AsignacionContrasena) => asignarContrasena(id, datos),
    () => reset(),
  );

  return (
    <form
      noValidate
      onSubmit={(evento) => void handleSubmit(enviar)(evento)}
      className="flex flex-col gap-4"
    >
      {envioExitoso(estado) ? (
        <Aviso estado="exito" titulo="Contraseña asignada.">
          La anterior ya no sirve. Comunícale la nueva al usuario por un medio seguro.
        </Aviso>
      ) : null}
      <ErrorDeEnvio estado={estado} prefijo={PREFIJO} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Campo
          id={`${PREFIJO}-contrasena`}
          etiqueta="Contraseña nueva"
          ayuda="Al menos 8 caracteres, con una letra y un número."
          error={errors.contrasena?.message ?? mensajeDelServidor(estado, 'contrasena')}
        >
          {(control) => (
            <CampoContrasena {...control} autoComplete="new-password" {...register('contrasena')} />
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
        variante="secundario"
        className="w-fit"
        cargando={pendiente}
        disabled={pendiente}
      >
        Asignar contraseña
      </Boton>
    </form>
  );
}
