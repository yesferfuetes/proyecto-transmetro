import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { FilaEditable } from '../hooks/recorrido';
import type { OpcionEstacion } from '../schemas/estacion';
import { EditorDeRecorrido } from './editor-de-recorrido';

const definirRecorrido = vi.hoisted(() => vi.fn());
vi.mock('../actions/definir-recorrido', () => ({ definirRecorrido }));

const RECORRIDO: FilaEditable[] = [
  { estacionId: 1, codigo: 'AAA', nombre: 'Alfa', distancia: '1.2' },
  { estacionId: 2, codigo: 'BBB', nombre: 'Beta', distancia: '0.8' },
  { estacionId: 3, codigo: 'CCC', nombre: 'Gamma', distancia: '' },
];

const ESTACIONES: OpcionEstacion[] = [
  { id: 1, codigo: 'AAA', nombre: 'Alfa' },
  { id: 2, codigo: 'BBB', nombre: 'Beta' },
  { id: 3, codigo: 'CCC', nombre: 'Gamma' },
  { id: 4, codigo: 'DDD', nombre: 'Delta' },
];

function dibujar(): void {
  render(
    <EditorDeRecorrido
      lineaId={7}
      codigoLinea="L1"
      recorrido={RECORRIDO}
      estaciones={ESTACIONES}
    />,
  );
}

const codigosEnOrden = (): string[] =>
  within(screen.getByRole('list', { name: 'Estaciones del recorrido' }))
    .getAllByRole('listitem')
    .map((fila) => /AAA|BBB|CCC|DDD/.exec(fila.textContent ?? '')?.[0] ?? '');

const anuncio = (): HTMLElement =>
  screen.getByText((_, elemento) => elemento?.getAttribute('aria-live') === 'polite');

describe('EditorDeRecorrido', () => {
  it('subir y bajar con teclado cambian el orden y se anuncian', async () => {
    const usuario = userEvent.setup();
    dibujar();

    screen.getByRole('button', { name: 'Subir BBB Beta' }).focus();
    await usuario.keyboard('{Enter}');
    expect(codigosEnOrden()).toEqual(['BBB', 'AAA', 'CCC']);
    expect(anuncio()).toHaveTextContent('BBB Beta pasó a la posición 1 de 3.');

    screen.getByRole('button', { name: 'Bajar AAA Alfa' }).focus();
    await usuario.keyboard(' ');
    expect(codigosEnOrden()).toEqual(['BBB', 'CCC', 'AAA']);
    expect(anuncio()).toHaveTextContent('AAA Alfa pasó a la posición 3 de 3.');
  });

  it('la última parada no tiene distancia', () => {
    dibujar();

    const ultima = screen.getByLabelText('Distancia de CCC a la siguiente');
    expect(ultima).toBeDisabled();
    expect(ultima).toHaveValue(null);
    expect(screen.getByText('Última estación')).toBeInTheDocument();
    expect(screen.getByLabelText('Distancia de AAA a la siguiente')).toBeEnabled();
  });

  it('la longitud resultante suma bien: 1.200 + 0.800 = 2.000', () => {
    dibujar();

    expect(screen.getByText(/Longitud al guardar/)).toHaveTextContent(/2[.,]000 km/);
  });

  it('agrega una estación desde el buscador solo con teclado', async () => {
    const usuario = userEvent.setup();
    dibujar();

    const buscador = screen.getByRole('combobox', { name: 'Agregar estación al final' });
    await usuario.click(buscador);
    await usuario.keyboard('del');
    expect(buscador).toHaveAttribute('aria-expanded', 'true');
    const opciones = within(screen.getByRole('listbox')).getAllByRole('option');
    expect(opciones.map((opcion) => opcion.textContent)).toEqual(['DDD · Delta']);
    expect(buscador).toHaveAttribute('aria-activedescendant', opciones[0]?.id);

    await usuario.keyboard('{Enter}');
    expect(codigosEnOrden()).toEqual(['AAA', 'BBB', 'CCC', 'DDD']);
    expect(anuncio()).toHaveTextContent('Se agregó DDD Delta en la posición 4.');
    expect(screen.getByLabelText('Distancia de CCC a la siguiente')).toBeEnabled();
  });

  it('el buscador excluye las estaciones ya agregadas', async () => {
    const usuario = userEvent.setup();
    dibujar();

    await usuario.click(screen.getByRole('combobox', { name: 'Agregar estación al final' }));
    await usuario.keyboard('a');
    const textos = within(screen.getByRole('listbox'))
      .getAllByRole('option')
      .map((opcion) => opcion.textContent);
    expect(textos).toEqual(['DDD · Delta']);
  });
});
