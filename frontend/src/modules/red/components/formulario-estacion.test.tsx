import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FormularioEstacion } from './formulario-estacion';

const registrarEstacion = vi.hoisted(() => vi.fn());
const editarEstacion = vi.hoisted(() => vi.fn());
vi.mock('../actions/registrar-estacion', () => ({ registrarEstacion }));
vi.mock('../actions/editar-estacion', () => ({ editarEstacion }));

const MUNICIPALIDADES = [{ valor: '1', etiqueta: 'Guatemala' }];

describe('FormularioEstacion', () => {
  it('cada campo tiene su etiqueta', () => {
    render(<FormularioEstacion municipalidades={MUNICIPALIDADES} />);

    for (const etiqueta of ['Código', 'Nombre', 'Municipalidad', 'Tiene parqueo']) {
      expect(screen.getByLabelText(etiqueta)).toBeInTheDocument();
    }
    expect(screen.getByLabelText(/Latitud/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Longitud/)).toBeInTheDocument();
  });

  it('una sola coordenada se marca y se anuncia en el campo que falta, sin enviar', async () => {
    const usuario = userEvent.setup();
    render(<FormularioEstacion municipalidades={MUNICIPALIDADES} />);

    await usuario.type(screen.getByLabelText('Código'), 'NUE');
    await usuario.type(screen.getByLabelText('Nombre'), 'Nueva');
    await usuario.selectOptions(screen.getByLabelText('Municipalidad'), '1');
    await usuario.type(screen.getByLabelText(/Latitud/), '14.6');
    await usuario.click(screen.getByRole('button', { name: 'Registrar estación' }));

    const longitud = screen.getByLabelText(/Longitud/);
    expect(longitud).toHaveAttribute('aria-invalid', 'true');
    expect(longitud).toHaveAccessibleDescription(
      'Escribe la latitud y la longitud, o deja las dos vacías.',
    );
    expect(registrarEstacion).not.toHaveBeenCalled();
  });
});
