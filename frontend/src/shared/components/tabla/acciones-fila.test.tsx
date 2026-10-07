import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AccionesFila } from './acciones-fila';

const ACCIONES = [
  { clave: 'ver', etiqueta: 'Ver detalle', href: '/flota/1' },
  { clave: 'editar', etiqueta: 'Editar', href: '/flota/1/editar' },
];

describe('AccionesFila', () => {
  it('abre el menú con clic y enfoca la primera opción', async () => {
    render(<AccionesFila etiqueta="Acciones del bus P-123ABC" acciones={ACCIONES} />);
    const boton = screen.getByRole('button', { name: 'Acciones del bus P-123ABC' });

    await userEvent.click(boton);

    expect(boton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menuitem', { name: 'Ver detalle' })).toHaveFocus();
  });

  it('se abre con Enter y las flechas recorren las opciones en ciclo', async () => {
    render(<AccionesFila etiqueta="Acciones" acciones={ACCIONES} />);
    screen.getByRole('button', { name: 'Acciones' }).focus();

    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Editar' })).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Ver detalle' })).toHaveFocus();

    await userEvent.keyboard('{ArrowUp}');
    expect(screen.getByRole('menuitem', { name: 'Editar' })).toHaveFocus();
  });

  it('Esc cierra y devuelve el foco al botón', async () => {
    render(<AccionesFila etiqueta="Acciones" acciones={ACCIONES} />);
    const boton = screen.getByRole('button', { name: 'Acciones' });

    await userEvent.click(boton);
    await userEvent.keyboard('{Escape}');

    expect(boton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(boton).toHaveFocus();
  });

  it('un clic fuera lo cierra', async () => {
    render(
      <>
        <p>Fuera</p>
        <AccionesFila etiqueta="Acciones" acciones={ACCIONES} />
      </>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Acciones' }));
    await userEvent.click(screen.getByText('Fuera'));

    expect(screen.queryByRole('menu')).toBeNull();
  });
});
