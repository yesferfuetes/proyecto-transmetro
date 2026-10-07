import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Campo } from './campo';
import { CampoTexto } from './campo-texto';

describe('Campo', () => {
  it('asocia la etiqueta con el control', () => {
    render(
      <Campo id="placa" etiqueta="Placa">
        {(control) => <CampoTexto {...control} />}
      </Campo>,
    );

    const campo = screen.getByRole('textbox', { name: 'Placa' });
    expect(campo).not.toHaveAttribute('aria-invalid');
    expect(campo).not.toHaveAttribute('aria-describedby');
  });

  it('describe el control con su ayuda y su error y lo marca inválido', () => {
    render(
      <Campo id="placa" etiqueta="Placa" ayuda="Formato P-123ABC." error="La placa ya existe.">
        {(control) => <CampoTexto {...control} />}
      </Campo>,
    );

    const campo = screen.getByRole('textbox', { name: 'Placa' });
    expect(campo).toHaveAttribute('aria-invalid', 'true');
    expect(campo).toHaveAccessibleDescription('Formato P-123ABC. La placa ya existe.');
  });

  it('marca los campos opcionales en la etiqueta', () => {
    render(
      <Campo id="nota" etiqueta="Nota" opcional>
        {(control) => <CampoTexto {...control} />}
      </Campo>,
    );

    expect(screen.getByRole('textbox', { name: 'Nota (opcional)' })).toBeInTheDocument();
  });
});
