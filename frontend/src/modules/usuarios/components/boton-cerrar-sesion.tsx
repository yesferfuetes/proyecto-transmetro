import type { ReactElement } from 'react';
import { Boton } from '@/shared/components/acciones';
import { cerrarSesion } from '../actions/cerrar-sesion';

/** Formulario con la acción de cerrar sesión: funciona sin JavaScript en el navegador. */
export function BotonCerrarSesion(): ReactElement {
  return (
    <form action={cerrarSesion}>
      <Boton type="submit" variante="fantasma" icono="salir">
        Cerrar sesión
      </Boton>
    </form>
  );
}
