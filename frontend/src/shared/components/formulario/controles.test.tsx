import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AccionesFormulario } from './acciones-formulario';
import { CampoArea } from './campo-area';
import { CampoNumero } from './campo-numero';
import { CampoContrasena, CampoFecha } from './campo-texto';
import { Casilla } from './casilla';
import { GrupoOpciones } from './grupo-opciones';
import { Selector } from './selector';

const ROLES = [
  { valor: 'operador', etiqueta: 'Operador de estación' },
  { valor: 'supervisor', etiqueta: 'Supervisor municipal' },
];

describe('controles de formulario', () => {
  it('el selector ofrece una opción vacía y las opciones dadas', () => {
    render(
      <Selector aria-label="Rol" opciones={ROLES} textoVacio="Elige un rol" defaultValue="" />,
    );

    const selector = screen.getByRole('combobox', { name: 'Rol' });
    expect(selector).toHaveValue('');
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('el campo numérico muestra su unidad y usa cifras tabulares', () => {
    render(<CampoNumero aria-label="Capacidad" unidad="pasajeros" defaultValue={160} />);

    expect(screen.getByRole('spinbutton', { name: 'Capacidad' })).toHaveClass('tabular-nums');
    expect(screen.getByText('pasajeros')).toBeVisible();
  });

  it('fecha y contraseña usan el tipo nativo', () => {
    render(
      <>
        <CampoFecha aria-label="Fecha" />
        <CampoContrasena aria-label="Contraseña" />
      </>,
    );

    expect(screen.getByLabelText('Fecha')).toHaveAttribute('type', 'date');
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password');
  });

  it('el campo de área es un cuadro de varias líneas con el aspecto del sistema', () => {
    render(<CampoArea aria-label="Historial" maxLength={2000} defaultValue="Línea 1" />);

    const area = screen.getByRole('textbox', { name: 'Historial' });
    expect(area.tagName).toBe('TEXTAREA');
    expect(area).toHaveAttribute('rows', '4');
    expect(area).toHaveAttribute('maxlength', '2000');
    expect(area).toHaveClass('border-border-strong', 'min-h-control');
    expect(area).not.toHaveClass('h-control');
  });

  it('la casilla lleva su etiqueta', () => {
    render(<Casilla etiqueta="Activo" defaultChecked />);

    expect(screen.getByRole('checkbox', { name: 'Activo' })).toBeChecked();
  });

  it('el grupo de opciones tiene leyenda, marca el valor y describe el error', () => {
    render(
      <GrupoOpciones
        nombre="rol"
        leyenda="Rol"
        opciones={ROLES}
        valor="supervisor"
        error="Elige un rol."
      />,
    );

    const grupo = screen.getByRole('group', { name: 'Rol' });
    expect(grupo).toHaveAccessibleDescription('Elige un rol.');
    expect(screen.getByRole('radio', { name: 'Supervisor municipal' })).toBeChecked();
  });

  it('las acciones del formulario contienen sus botones', () => {
    render(
      <AccionesFormulario>
        <button type="submit">Guardar</button>
      </AccionesFormulario>,
    );

    expect(screen.getByRole('button', { name: 'Guardar' })).toBeVisible();
  });
});
