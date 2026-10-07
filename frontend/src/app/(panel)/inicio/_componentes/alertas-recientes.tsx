import type { ReactElement } from 'react';
import { ChipEstado, EstadoVacio, InsigniaLinea } from '@/shared/components/datos';
import { TablaDatos, type Columna } from '@/shared/components/tabla';
import type { AlertaReciente } from '../../_ejemplo/inicio';

const COLUMNAS: readonly Columna<AlertaReciente>[] = [
  {
    clave: 'linea',
    encabezado: 'Línea',
    fija: true,
    celda: (alerta) => <InsigniaLinea codigo={alerta.linea} />,
  },
  { clave: 'estacion', encabezado: 'Estación', celda: (alerta) => alerta.estacion },
  { clave: 'bus', encabezado: 'Bus', celda: (alerta) => alerta.bus },
  {
    clave: 'ocupacion',
    encabezado: 'Ocupación',
    alineacion: 'fin',
    celda: (alerta) => `${alerta.porcentaje} %`,
  },
  {
    clave: 'estado',
    encabezado: 'Estado',
    celda: (alerta) =>
      alerta.tipo === 'sobrecupo' ? (
        <ChipEstado estado="error" icono="sobrecupo">
          Sobrecupo
        </ChipEstado>
      ) : (
        <ChipEstado estado="advertencia" icono="baja-ocupacion">
          Baja ocupación
        </ChipEstado>
      ),
  },
];

type Propiedades = Readonly<{ alertas: readonly AlertaReciente[] }>;

/** Las últimas alertas activas en una tabla densa. */
export function AlertasRecientes({ alertas }: Propiedades): ReactElement {
  return (
    <TablaDatos
      id="alertas-recientes-tabla"
      titulo="Últimas alertas de capacidad activas"
      columnas={COLUMNAS}
      filas={alertas}
      claveDeFila={(alerta) => alerta.id}
      vacio={
        <EstadoVacio
          variante="sin-datos"
          titulo="Sin alertas activas"
          texto="Cuando una estación o un bus crucen un umbral de capacidad, la alerta aparecerá aquí."
        />
      }
    />
  );
}
