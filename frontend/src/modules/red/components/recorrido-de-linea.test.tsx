import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ParadaDeRecorrido } from '../schemas/linea';
import { RecorridoDeLinea } from './recorrido-de-linea';

const RECORRIDO: ParadaDeRecorrido[] = [
  {
    posicion: 1,
    estacion: { id: 10, codigo: 'CEN', nombre: 'Centra Norte', municipalidadNombre: 'Guatemala' },
    distanciaSiguienteKm: 1.2,
    distanciaAcumuladaKm: 0,
  },
  {
    posicion: 2,
    estacion: { id: 11, codigo: 'TRE', nombre: 'El Trébol', municipalidadNombre: 'Guatemala' },
    distanciaSiguienteKm: 0.8,
    distanciaAcumuladaKm: 1.2,
  },
  {
    posicion: 3,
    estacion: { id: 12, codigo: 'MIX', nombre: 'Mixco Sur', municipalidadNombre: 'Mixco' },
    distanciaSiguienteKm: null,
    distanciaAcumuladaKm: 2,
  },
];

describe('RecorridoDeLinea', () => {
  it('la línea L12 usa el color de la línea 12 en puntos y trazo', () => {
    const { container } = render(
      <RecorridoDeLinea codigoLinea="L12" recorrido={RECORRIDO} longitudKm={2} />,
    );

    const puntos = container.querySelectorAll('[data-punto]');
    const trazos = container.querySelectorAll('[data-trazo]');
    expect(puntos).toHaveLength(3);
    expect(trazos).toHaveLength(2);
    for (const marca of [...puntos, ...trazos]) {
      expect(marca).toHaveClass('bg-linea-12');
    }
    expect(screen.getByRole('list', { name: 'Recorrido de Línea 12' })).toBeInTheDocument();
  });

  it('muestra posiciones, distancias y el total en texto', () => {
    render(<RecorridoDeLinea codigoLinea="L12" recorrido={RECORRIDO} longitudKm={2} />);

    const paradas = screen.getAllByRole('listitem');
    expect(paradas).toHaveLength(3);
    expect(paradas[0]).toHaveTextContent('1.');
    expect(paradas[0]).toHaveTextContent('CEN');
    expect(paradas[0]).toHaveTextContent(/1[.,]200 km a la siguiente/);
    expect(paradas[1]).toHaveTextContent(/1[.,]200 km desde el inicio/);
    expect(paradas[2]).toHaveTextContent('Última estación');
    expect(paradas[2]).toHaveTextContent('Mixco');
    expect(screen.getByText('Longitud total').nextElementSibling).toHaveTextContent(/2[.,]000 km/);
  });

  it('la estación del operador lleva "Tu estación"', () => {
    render(
      <RecorridoDeLinea
        codigoLinea="L12"
        recorrido={RECORRIDO}
        longitudKm={2}
        estacionResaltadaId={11}
      />,
    );

    const paradas = screen.getAllByRole('listitem');
    expect(within(paradas[1]).getByText('Tu estación')).toBeInTheDocument();
    expect(screen.getAllByText('Tu estación')).toHaveLength(1);
  });
});
