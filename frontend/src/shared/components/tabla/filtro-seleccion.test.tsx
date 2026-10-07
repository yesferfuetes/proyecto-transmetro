import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FormEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { FiltroSeleccion } from './filtro-seleccion';

const LINEAS = [
  { valor: '12', etiqueta: 'Línea 12' },
  { valor: '13', etiqueta: 'Línea 13' },
];

describe('FiltroSeleccion', () => {
  it('al elegir una opción envía el formulario con el valor elegido', async () => {
    const enviado = vi.fn<(valor: FormDataEntryValue | null) => void>();
    const alEnviar = (evento: FormEvent<HTMLFormElement>): void => {
      evento.preventDefault();
      enviado(new FormData(evento.currentTarget).get('linea'));
    };
    render(
      <form onSubmit={alEnviar}>
        <FiltroSeleccion nombre="linea" etiqueta="Línea" opciones={LINEAS} />
      </form>,
    );

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Línea' }), '13');

    expect(enviado).toHaveBeenCalledWith('13');
  });

  it('sin valor muestra la opción de todas', () => {
    render(<FiltroSeleccion nombre="linea" etiqueta="Línea" opciones={LINEAS} />);

    expect(screen.getByRole('combobox', { name: 'Línea' })).toHaveValue('');
    expect(screen.getByRole('option', { name: 'Todas' })).toBeInTheDocument();
  });
});
