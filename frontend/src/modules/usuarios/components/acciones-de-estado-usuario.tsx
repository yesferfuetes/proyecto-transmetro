'use client';

import { useState, type ReactElement } from 'react';
import { Boton } from '@/shared/components/acciones';
import { Aviso, Dialogo } from '@/shared/components/superposiciones';
import { desactivarUsuario } from '../actions/desactivar-usuario';
import { reactivarUsuario } from '../actions/reactivar-usuario';
import { useEnvio } from '../hooks/use-envio';
import { ErrorDeEnvio } from './error-de-envio';
import { envioExitoso } from './errores-de-envio';

type Propiedades = Readonly<{ id: number; nombre: string; activo: boolean }>;

/** Desactivar (con confirmación) o reactivar a un usuario. Los usuarios no se eliminan. */
export function AccionesDeEstadoUsuario({ id, nombre, activo }: Propiedades): ReactElement {
  const [confirmando, setConfirmando] = useState(false);
  const desactivacion = useEnvio(desactivarUsuario);
  const reactivacion = useEnvio(reactivarUsuario);
  // Tras un cambio exitoso el estado del usuario ya es el otro; un rechazo lo deja igual.
  const ultimoExito = activo ? reactivacion : desactivacion;
  const intentoActual = activo ? desactivacion : reactivacion;

  return (
    <div className="flex flex-col gap-4">
      {envioExitoso(ultimoExito.estado) ? (
        <Aviso estado="exito" titulo={activo ? 'Usuario reactivado.' : 'Usuario desactivado.'} />
      ) : null}
      <ErrorDeEnvio estado={intentoActual.estado} prefijo="estado" />
      <p className="text-body text-ink-muted">
        {activo
          ? 'Un usuario desactivado no puede iniciar sesión; su historial se conserva.'
          : 'Este usuario está desactivado. Al reactivarlo podrá entrar con su contraseña anterior.'}
      </p>
      {activo ? (
        <Boton
          variante="peligro"
          className="w-fit"
          cargando={desactivacion.pendiente}
          disabled={desactivacion.pendiente}
          onClick={() => setConfirmando(true)}
        >
          Desactivar
        </Boton>
      ) : (
        <Boton
          variante="secundario"
          className="w-fit"
          cargando={reactivacion.pendiente}
          disabled={reactivacion.pendiente}
          onClick={() => reactivacion.enviar(id)}
        >
          Reactivar
        </Boton>
      )}
      <Dialogo
        variante="destructivo"
        abierto={confirmando}
        alCerrar={() => setConfirmando(false)}
        titulo={`¿Desactivar a ${nombre}?`}
        confirmacion={{
          texto: 'Desactivar',
          alConfirmar: () => {
            setConfirmando(false);
            desactivacion.enviar(id);
          },
        }}
      >
        <p className="text-body text-ink">
          No podrá iniciar sesión y perderá la sesión que tenga abierta. Puedes reactivarlo después.
        </p>
      </Dialogo>
    </div>
  );
}
