import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAvisos } from '@/shared/hooks/use-avisos';
import { DURACION_AVISO_MS } from './aviso-efimero';
import { RegionAvisos } from './region-avisos';

function agregar(mensaje: string): void {
  act(() => useAvisos.getState().agregar({ estado: 'exito', mensaje }));
}

describe('RegionAvisos y AvisoEfimero', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useAvisos.setState({ avisos: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('un aviso agregado aparece dentro de la región viva', () => {
    const { container } = render(<RegionAvisos />);

    agregar('Bus registrado.');

    const region = container.querySelector('[aria-live="polite"]');
    expect(region).toHaveTextContent('Bus registrado.');
  });

  it('desaparece solo al cumplirse su duración', () => {
    render(<RegionAvisos />);
    agregar('Bus registrado.');

    act(() => {
      vi.advanceTimersByTime(DURACION_AVISO_MS);
    });

    expect(screen.queryByText('Bus registrado.')).toBeNull();
  });

  it('no desaparece mientras tiene el foco', () => {
    render(<RegionAvisos />);
    agregar('Bus registrado.');

    fireEvent.focus(screen.getByRole('button', { name: 'Cerrar aviso' }));
    act(() => {
      vi.advanceTimersByTime(DURACION_AVISO_MS * 2);
    });

    expect(screen.getByText('Bus registrado.')).toBeInTheDocument();
  });

  it('el botón cerrar lo quita', () => {
    render(<RegionAvisos />);
    agregar('Bus registrado.');

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar aviso' }));

    expect(screen.queryByText('Bus registrado.')).toBeNull();
  });
});
