'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactElement, ReactNode } from 'react';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { Boton, EnlaceBoton } from '@/shared/components/acciones';
import { AccionesFormulario, Campo, CampoContrasena } from '@/shared/components/formulario';
import { Aviso } from '@/shared/components/superposiciones';
import { editarUsuario } from '../actions/editar-usuario';
import { registrarUsuario } from '../actions/registrar-usuario';
import { useEnvio, type EstadoDeEnvio } from '../hooks/use-envio';
import {
  esquemaEdicionUsuario,
  esquemaRegistroUsuario,
  type EdicionUsuario,
  type RegistroUsuario,
} from '../schemas/formularios';
import type { EstacionAsignable, UsuarioDetalle } from '../schemas/usuario';
import { CamposDeUsuario, PREFIJO_USUARIO } from './campos-de-usuario';
import { ErrorDeEnvio } from './error-de-envio';
import { envioExitoso, mensajeDelServidor } from './errores-de-envio';

type UsuarioEditable = Pick<UsuarioDetalle, 'id' | 'nombre' | 'correo' | 'rol' | 'estacionId'>;

type Propiedades = Readonly<{
  estaciones: readonly EstacionAsignable[];
  /** Sin usuario, el formulario registra uno nuevo. */
  usuario?: UsuarioEditable;
}>;

/** Registro y edición de un usuario. Al registrar se pide además la contraseña inicial. */
export function FormularioUsuario({ estaciones, usuario }: Propiedades): ReactElement {
  return usuario ? (
    <Edicion estaciones={estaciones} usuario={usuario} />
  ) : (
    <Registro estaciones={estaciones} />
  );
}

type Marco<T extends EdicionUsuario> = Readonly<{
  metodos: UseFormReturn<T>;
  estaciones: readonly EstacionAsignable[];
  estado: EstadoDeEnvio;
  pendiente: boolean;
  alEnviar: (datos: T) => void;
  textoPrincipal: string;
  children?: ReactNode;
}>;

function MarcoDeFormulario<T extends EdicionUsuario>({
  metodos,
  estaciones,
  estado,
  pendiente,
  alEnviar,
  textoPrincipal,
  children,
}: Marco<T>): ReactElement {
  return (
    <FormProvider {...metodos}>
      <form
        noValidate
        onSubmit={(evento) => void metodos.handleSubmit(alEnviar)(evento)}
        className="flex flex-col gap-4"
      >
        <ErrorDeEnvio estado={estado} prefijo={PREFIJO_USUARIO} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CamposDeUsuario estaciones={estaciones} estado={estado} />
          {children}
        </div>
        <AccionesFormulario>
          <EnlaceBoton href="/usuarios" variante="secundario">
            Cancelar
          </EnlaceBoton>
          <Boton type="submit" variante="principal" cargando={pendiente} disabled={pendiente}>
            {textoPrincipal}
          </Boton>
        </AccionesFormulario>
      </form>
    </FormProvider>
  );
}

function Registro({
  estaciones,
}: Readonly<{ estaciones: readonly EstacionAsignable[] }>): ReactElement {
  const metodos = useForm<RegistroUsuario>({
    resolver: zodResolver(esquemaRegistroUsuario),
    defaultValues: { nombre: '', correo: '', contrasena: '' },
    shouldUnregister: true,
  });
  const { estado, enviar, pendiente } = useEnvio<RegistroUsuario>(registrarUsuario);
  const error =
    metodos.formState.errors.contrasena?.message ?? mensajeDelServidor(estado, 'contrasena');
  return (
    <MarcoDeFormulario
      metodos={metodos}
      estaciones={estaciones}
      estado={estado}
      pendiente={pendiente}
      alEnviar={enviar}
      textoPrincipal="Registrar usuario"
    >
      <Campo
        id={`${PREFIJO_USUARIO}-contrasena`}
        etiqueta="Contraseña inicial"
        ayuda="Al menos 8 caracteres, con una letra y un número."
        error={error}
      >
        {(control) => (
          <CampoContrasena
            {...control}
            autoComplete="new-password"
            {...metodos.register('contrasena')}
          />
        )}
      </Campo>
    </MarcoDeFormulario>
  );
}

function Edicion({
  estaciones,
  usuario,
}: Readonly<{ estaciones: readonly EstacionAsignable[]; usuario: UsuarioEditable }>): ReactElement {
  const metodos = useForm<EdicionUsuario>({
    resolver: zodResolver(esquemaEdicionUsuario),
    defaultValues: {
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      estacionId: usuario.estacionId,
    },
    shouldUnregister: true,
  });
  const { estado, enviar, pendiente } = useEnvio((datos: EdicionUsuario) =>
    editarUsuario(usuario.id, datos),
  );
  return (
    <div className="flex flex-col gap-4">
      {envioExitoso(estado) ? <Aviso estado="exito" titulo="Cambios guardados." /> : null}
      <MarcoDeFormulario
        metodos={metodos}
        estaciones={estaciones}
        estado={estado}
        pendiente={pendiente}
        alEnviar={enviar}
        textoPrincipal="Guardar cambios"
      />
    </div>
  );
}
