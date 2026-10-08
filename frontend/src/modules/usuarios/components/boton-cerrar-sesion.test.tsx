import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { cerrarSesion } from '../actions/cerrar-sesion';
import { BotonCerrarSesion } from './boton-cerrar-sesion';

vi.mock('../actions/cerrar-sesion', () => ({ cerrarSesion: vi.fn() }));

describe('BotonCerrarSesion', () => {
  it('es un formulario con un botón de envío con nombre accesible', () => {
    render(<BotonCerrarSesion />);

    const boton = screen.getByRole('button', { name: 'Cerrar sesión' });
    expect(boton).toHaveAttribute('type', 'submit');
    expect(boton.closest('form')).not.toBeNull();
  });

  it('al enviarlo ejecuta la acción de cerrar sesión', async () => {
    render(<BotonCerrarSesion />);

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));

    expect(cerrarSesion).toHaveBeenCalledOnce();
  });
});
