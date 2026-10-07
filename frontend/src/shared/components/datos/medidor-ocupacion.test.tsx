import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MedidorOcupacion } from './medidor-ocupacion';

const UMBRALES = { bajo: 25, alto: 150 };

describe('MedidorOcupacion', () => {
  it('expone el valor como medidor accesible y lo muestra en texto', () => {
    render(<MedidorOcupacion porcentaje={182} etiqueta="Ocupación" umbrales={UMBRALES} />);

    const medidor = screen.getByRole('meter', { name: 'Ocupación' });
    expect(medidor).toHaveAttribute('aria-valuenow', '182');
    expect(medidor).toHaveAttribute('aria-valuemax', '200');
    expect(medidor).toHaveAttribute('aria-valuetext', '182 %, sobrecupo');
    expect(screen.getByText('182 %')).toBeVisible();
    expect(screen.getByText('Sobrecupo')).toBeVisible();
  });

  it('marca la baja ocupación por debajo del umbral bajo', () => {
    render(<MedidorOcupacion porcentaje={18} etiqueta="Ocupación" umbrales={UMBRALES} />);

    expect(screen.getByText('Baja ocupación')).toBeVisible();
  });

  it('por encima de 200 % se queda al final y lo dice', () => {
    render(<MedidorOcupacion porcentaje={260} etiqueta="Ocupación" umbrales={UMBRALES} />);

    const medidor = screen.getByRole('meter');
    expect(medidor).toHaveAttribute('aria-valuenow', '200');
    expect(medidor).toHaveAttribute('aria-valuetext', 'más de 200 %, sobrecupo');
  });
});
