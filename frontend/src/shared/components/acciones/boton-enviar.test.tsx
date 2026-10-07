import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { BotonEnviar } from './boton-enviar';

function accionPendiente(): { accion: () => Promise<void>; terminar: () => void } {
  let terminar = (): void => undefined;
  const promesa = new Promise<void>((resolver) => {
    terminar = resolver;
  });
  return { accion: () => promesa, terminar };
}

describe('BotonEnviar', () => {
  it('en reposo es un botón de envío habilitado y sin estado de carga', () => {
    render(
      <form>
        <BotonEnviar variante="principal">Guardar</BotonEnviar>
      </form>,
    );

    const boton = screen.getByRole('button', { name: 'Guardar' });
    expect(boton).toHaveAttribute('type', 'submit');
    expect(boton).toBeEnabled();
    expect(boton).not.toHaveAttribute('aria-busy');
  });

  it('mientras la acción está pendiente muestra carga y se deshabilita', async () => {
    const { accion, terminar } = accionPendiente();
    render(
      <form action={accion}>
        <BotonEnviar variante="principal">Guardar</BotonEnviar>
      </form>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    const boton = await screen.findByRole('button', { name: 'Guardar', busy: true });
    expect(boton).toBeDisabled();
    expect(boton).toHaveAttribute('aria-disabled', 'true');

    terminar();
    expect(await screen.findByRole('button', { name: 'Guardar', busy: false })).toBeEnabled();
  });
});
