import type { ReactElement } from 'react';
import { EnlaceBoton } from '@/shared/components/acciones';
import { TablaDatos, type Columna } from '@/shared/components/tabla';
import { TextoOculto } from '@/shared/components/utilidades';
import type { PilotoDeLista, PilotoReducido, VistaDePilotos } from '../schemas/piloto';
import { BusDeBaja } from './bus-de-baja';
import { LineaDelPiloto } from './linea-del-piloto';
import { SinResultados } from './sin-resultados';

type Fila = PilotoReducido | PilotoDeLista;

type Propiedades = Readonly<{
  pilotos: readonly Fila[];
  /** La vista completa agrega el DPI; la reducida nunca lo muestra. */
  vista: VistaDePilotos;
  hayFiltros: boolean;
}>;

function Bus({ piloto }: Readonly<{ piloto: Fila }>): ReactElement {
  if (piloto.bus === null) {
    return <span className="text-ink-muted">Sin bus</span>;
  }
  return (
    <span className="flex items-center gap-3">
      <b>{piloto.bus.placa}</b>
      {piloto.busDeBaja ? <BusDeBaja /> : null}
    </span>
  );
}

function columnas(vista: VistaDePilotos): Columna<Fila>[] {
  const dpi: Columna<Fila>[] =
    vista === 'completa'
      ? [{ clave: 'dpi', encabezado: 'DPI', celda: (p) => ('dpi' in p ? p.dpi : null) }]
      : [];
  return [
    {
      clave: 'nombre',
      encabezado: 'Nombre',
      fija: true,
      celda: (p) => <b>{p.nombre}</b>,
    },
    ...dpi,
    { clave: 'bus', encabezado: 'Bus', celda: (p) => <Bus piloto={p} /> },
    { clave: 'linea', encabezado: 'Línea', celda: (p) => <LineaDelPiloto linea={p.linea} /> },
    { clave: 'telefono', encabezado: 'Teléfono', celda: (p) => p.telefono },
    {
      clave: 'acciones',
      encabezado: 'Acciones',
      celda: (p) => (
        <EnlaceBoton href={`/pilotos/${p.id}`} variante="fantasma" tamano="denso">
          Abrir<TextoOculto> {`piloto ${p.nombre}`}</TextoOculto>
        </EnlaceBoton>
      ),
    },
  ];
}

/** Listado de pilotos con su bus y su línea; la vista reducida no tiene columna de DPI. */
export function TablaPilotos({ pilotos, vista, hayFiltros }: Propiedades): ReactElement {
  return (
    <TablaDatos
      id="tabla-pilotos"
      titulo="Pilotos"
      columnas={columnas(vista)}
      filas={pilotos}
      claveDeFila={(piloto) => String(piloto.id)}
      vacio={<SinResultados hayFiltros={hayFiltros} hrefLimpiar="/pilotos" objeto="pilotos" />}
    />
  );
}
