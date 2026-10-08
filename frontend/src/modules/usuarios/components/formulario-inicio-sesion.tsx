'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { Boton } from '@/shared/components/acciones';
import { Campo, CampoContrasena, CampoTexto } from '@/shared/components/formulario';
import { iniciarSesion } from '../actions/iniciar-sesion';
import { useEnvio } from '../hooks/use-envio';
import { esquemaCredenciales, type Credenciales } from '../schemas/sesion';
import { ErrorDeEnvio } from './error-de-envio';
import { mensajeDelServidor } from './errores-de-envio';

export function FormularioInicioSesion(): ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Credenciales>({
    resolver: zodResolver(esquemaCredenciales),
    defaultValues: { correo: '', contrasena: '' },
  });
  const { estado, enviar, pendiente } = useEnvio<Credenciales>(iniciarSesion);

  return (
    <form
      noValidate
      onSubmit={(evento) => void handleSubmit(enviar)(evento)}
      className="flex flex-col gap-4"
    >
      <ErrorDeEnvio estado={estado} prefijo="sesion" />
      <Campo
        id="sesion-correo"
        etiqueta="Correo"
        error={errors.correo?.message ?? mensajeDelServidor(estado, 'correo')}
      >
        {(control) => (
          <CampoTexto {...control} type="email" autoComplete="username" {...register('correo')} />
        )}
      </Campo>
      <Campo
        id="sesion-contrasena"
        etiqueta="Contraseña"
        error={errors.contrasena?.message ?? mensajeDelServidor(estado, 'contrasena')}
      >
        {(control) => (
          <CampoContrasena
            {...control}
            autoComplete="current-password"
            {...register('contrasena')}
          />
        )}
      </Campo>
      <Boton type="submit" variante="principal" cargando={pendiente} disabled={pendiente}>
        Iniciar sesión
      </Boton>
    </form>
  );
}
