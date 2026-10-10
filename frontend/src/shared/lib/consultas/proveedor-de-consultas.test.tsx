import { useQueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import { ProveedorDeConsultas } from './proveedor-de-consultas';

function capturador(clientes: unknown[]): () => ReactElement {
  return function Captura(): ReactElement {
    clientes.push(useQueryClient());
    return <p>ok</p>;
  };
}

describe('ProveedorDeConsultas', () => {
  it('muestra a sus hijos', () => {
    render(
      <ProveedorDeConsultas>
        <p>contenido</p>
      </ProveedorDeConsultas>,
    );

    expect(screen.getByText('contenido')).toBeInTheDocument();
  });

  it('conserva el mismo cliente entre renders', () => {
    const clientes: unknown[] = [];
    const Captura = capturador(clientes);
    const { rerender } = render(
      <ProveedorDeConsultas>
        <Captura />
      </ProveedorDeConsultas>,
    );
    rerender(
      <ProveedorDeConsultas>
        <Captura />
      </ProveedorDeConsultas>,
    );

    expect(clientes.length).toBeGreaterThan(1);
    expect(new Set(clientes).size).toBe(1);
  });

  it('cada montaje crea su propio cliente', () => {
    const clientes: unknown[] = [];
    const Captura = capturador(clientes);
    const primero = render(
      <ProveedorDeConsultas>
        <Captura />
      </ProveedorDeConsultas>,
    );
    primero.unmount();
    render(
      <ProveedorDeConsultas>
        <Captura />
      </ProveedorDeConsultas>,
    );

    expect(new Set(clientes).size).toBe(2);
  });
});
