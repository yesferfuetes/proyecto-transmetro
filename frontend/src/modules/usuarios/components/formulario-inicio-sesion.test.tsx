import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { iniciarSesion } from '../actions/iniciar-sesion';
import { FormularioInicioSesion } from './formulario-inicio-sesion';

vi.mock('../actions/iniciar-sesion', () => ({ iniciarSesion: vi.fn() }));

describe('FormularioInicioSesion', () => {
  it('cada campo tiene su etiqueta', () => {
    render(<FormularioInicioSesion />);

    expect(screen.getByLabelText('Correo')).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toHaveAttribute(
      'type',
      'submit',
    );
  });

  it('se completa y se envía solo con el teclado', async () => {
    vi.mocked(iniciarSesion).mockResolvedValue({ ok: true });
    const usuario = userEvent.setup();
    render(<FormularioInicioSesion />);

    await usuario.tab();
    await usuario.keyboard('ana@transmetro.test');
    await usuario.tab();
    await usuario.keyboard('clave1234{Enter}');

    expect(iniciarSesion).toHaveBeenCalledWith({
      correo: 'ana@transmetro.test',
      contrasena: 'clave1234',
    });
  });

  it('con campos vacíos indica qué falta y no consulta al sistema', async () => {
    render(<FormularioInicioSesion />);

    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByText('Escribe tu contraseña.')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Correo')).toHaveFocus();
    expect(iniciarSesion).not.toHaveBeenCalled();
  });

  it('anuncia el mensaje del backend tal cual', async () => {
    vi.mocked(iniciarSesion).mockResolvedValue({
      ok: false,
      error: {
        codigo: 'CREDENCIALES_INVALIDAS',
        mensaje: 'El correo o la contraseña no son correctos.',
        detalles: [],
        estado: 401,
      },
    });
    render(<FormularioInicioSesion />);

    await userEvent.type(screen.getByLabelText('Correo'), 'ana@transmetro.test');
    await userEvent.type(screen.getByLabelText('Contraseña'), 'mala');
    await userEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    const alerta = await screen.findByRole('alert');
    expect(alerta).toHaveTextContent('El correo o la contraseña no son correctos.');
    expect(alerta).not.toHaveTextContent('CREDENCIALES_INVALIDAS');
    expect(alerta).toHaveFocus();
  });
});
