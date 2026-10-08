import type { ReactElement } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Campo, CampoTexto, Selector, type Opcion } from '@/shared/components/formulario';
import { esquemaRol, ETIQUETA_DE_ROL } from '@/shared/schemas/sesion';
import type { EstadoDeEnvio } from '../hooks/use-envio';
import type { EdicionUsuario } from '../schemas/formularios';
import type { EstacionAsignable } from '../schemas/usuario';
import { mensajeDelServidor } from './errores-de-envio';

export const PREFIJO_USUARIO = 'usuario';

const OPCIONES_DE_ROL: readonly Opcion[] = esquemaRol.options.map((rol) => ({
  valor: rol,
  etiqueta: ETIQUETA_DE_ROL[rol],
}));

function aEstacion(valor: unknown): number | null {
  return valor === '' || valor === null || valor === undefined ? null : Number(valor);
}

type Propiedades = Readonly<{ estaciones: readonly EstacionAsignable[]; estado: EstadoDeEnvio }>;

/**
 * Nombre, correo, rol y, solo para el operador de estación, su estación. Es parte del formulario
 * cliente de usuario: lee su contexto de React Hook Form.
 */
export function CamposDeUsuario({ estaciones, estado }: Propiedades): ReactElement {
  const {
    register,
    control: controlDelFormulario,
    formState: { errors },
  } = useFormContext<EdicionUsuario>();
  const rol = useWatch({ control: controlDelFormulario, name: 'rol' });
  const error = (campo: keyof EdicionUsuario): string | undefined =>
    errors[campo]?.message ?? mensajeDelServidor(estado, campo);

  return (
    <>
      <Campo id={`${PREFIJO_USUARIO}-nombre`} etiqueta="Nombre completo" error={error('nombre')}>
        {(control) => <CampoTexto {...control} autoComplete="off" {...register('nombre')} />}
      </Campo>
      <Campo id={`${PREFIJO_USUARIO}-correo`} etiqueta="Correo" error={error('correo')}>
        {(control) => (
          <CampoTexto {...control} type="email" autoComplete="off" {...register('correo')} />
        )}
      </Campo>
      <Campo id={`${PREFIJO_USUARIO}-rol`} etiqueta="Rol" error={error('rol')}>
        {(control) => (
          <Selector
            {...control}
            opciones={OPCIONES_DE_ROL}
            textoVacio="Elige un rol"
            {...register('rol')}
          />
        )}
      </Campo>
      {rol === 'OPERADOR_ESTACION' ? (
        <Campo
          id={`${PREFIJO_USUARIO}-estacionId`}
          etiqueta="Estación"
          ayuda="La estación desde cuya computadora trabaja el operador."
          error={error('estacionId')}
        >
          {(control) => (
            <Selector
              {...control}
              opciones={estaciones.map((estacion) => ({
                valor: String(estacion.id),
                etiqueta: `${estacion.codigo} · ${estacion.nombre}`,
              }))}
              textoVacio="Elige una estación"
              {...register('estacionId', { setValueAs: aEstacion })}
            />
          )}
        </Campo>
      ) : null}
    </>
  );
}
