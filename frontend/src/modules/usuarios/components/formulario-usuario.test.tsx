import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { editarUsuario } from '../actions/editar-usuario';
import { registrarUsuario } from '../actions/registrar-usuario';
import { FormularioUsuario } from './formulario-usuario';

vi.mock('../actions/registrar-usuario', () => ({ registrarUsuario: vi.fn() }));
vi.mock('../actions/editar-usuario', () => ({ editarUsuario: vi.fn() }));

const ESTACIONES = [
  { id: 3, codigo: 'E03', nombre: 'Trébol' },
  { id: 4, codigo: 'E04', nombre: 'Bolívar' },
];

describe('FormularioUsuario', () => {
  it('el campo estación aparece solo cuando el rol es operador de estación', async () => {
    render(<FormularioUsuario estaciones={ESTACIONES} />);
    expect(screen.queryByLabelText('Estación')).not.toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText('Rol'), 'Operador de estación');
    expect(screen.getByLabelText('Estación')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'E03 · Trébol' })).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText('Rol'), 'Supervisor municipal');
    expect(screen.queryByLabelText('Estación')).not.toBeInTheDocument();
  });

  it('registra un operador con su estación', async () => {
    vi.mocked(registrarUsuario).mockResolvedValue({ ok: true });
    render(<FormularioUsuario estaciones={ESTACIONES} />);

    await userEvent.type(screen.getByLabelText('Nombre completo'), 'Luis Pérez');
    await userEvent.type(screen.getByLabelText('Correo'), 'luis@transmetro.test');
    await userEvent.selectOptions(screen.getByLabelText('Rol'), 'Operador de estación');
    await userEvent.selectOptions(screen.getByLabelText('Estación'), 'E04 · Bolívar');
    await userEvent.type(screen.getByLabelText('Contraseña inicial'), 'clave1234');
    await userEvent.click(screen.getByRole('button', { name: 'Registrar usuario' }));

    expect(registrarUsuario).toHaveBeenCalledWith({
      nombre: 'Luis Pérez',
      correo: 'luis@transmetro.test',
      rol: 'OPERADOR_ESTACION',
      estacionId: 4,
      contrasena: 'clave1234',
    });
  });

  it('un operador sin estación no se envía', async () => {
    render(<FormularioUsuario estaciones={ESTACIONES} />);

    await userEvent.type(screen.getByLabelText('Nombre completo'), 'Luis Pérez');
    await userEvent.type(screen.getByLabelText('Correo'), 'luis@transmetro.test');
    await userEvent.selectOptions(screen.getByLabelText('Rol'), 'Operador de estación');
    await userEvent.type(screen.getByLabelText('Contraseña inicial'), 'clave1234');
    await userEvent.click(screen.getByRole('button', { name: 'Registrar usuario' }));

    expect(await screen.findByText('Elige la estación del operador.')).toBeInTheDocument();
    expect(registrarUsuario).not.toHaveBeenCalled();
  });

  it('el error del backend se anuncia con su mensaje', async () => {
    vi.mocked(registrarUsuario).mockResolvedValue({
      ok: false,
      error: {
        codigo: 'EMAIL_DUPLICADO',
        mensaje: 'Ya existe un usuario con ese correo.',
        detalles: [],
        estado: 409,
      },
    });
    render(<FormularioUsuario estaciones={ESTACIONES} />);

    await userEvent.type(screen.getByLabelText('Nombre completo'), 'Ana');
    await userEvent.type(screen.getByLabelText('Correo'), 'ANA@muni.gt');
    await userEvent.selectOptions(screen.getByLabelText('Rol'), 'Supervisor municipal');
    await userEvent.type(screen.getByLabelText('Contraseña inicial'), 'clave1234');
    await userEvent.click(screen.getByRole('button', { name: 'Registrar usuario' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Ya existe un usuario con ese correo.',
    );
  });

  it('al editar un operador que pasa a supervisor ya no envía su estación', async () => {
    vi.mocked(editarUsuario).mockResolvedValue({ ok: true });
    render(
      <FormularioUsuario
        estaciones={ESTACIONES}
        usuario={{
          id: 5,
          nombre: 'Luis Pérez',
          correo: 'luis@transmetro.test',
          rol: 'OPERADOR_ESTACION',
          estacionId: 3,
        }}
      />,
    );
    expect(screen.getByLabelText('Estación')).toHaveValue('3');
    expect(screen.queryByLabelText('Contraseña inicial')).not.toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText('Rol'), 'Supervisor municipal');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    expect(editarUsuario).toHaveBeenCalledWith(5, {
      nombre: 'Luis Pérez',
      correo: 'luis@transmetro.test',
      rol: 'SUPERVISOR_MUNICIPAL',
    });
    expect(await screen.findByText('Cambios guardados.')).toBeInTheDocument();
  });
});
