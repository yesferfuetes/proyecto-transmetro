import type { ReactElement } from 'react';
import { EnlaceBoton } from '@/shared/components/acciones';
import { ChipEstado, EstadoVacio } from '@/shared/components/datos';
import { TablaDatos, type Columna } from '@/shared/components/tabla';
import { TextoOculto } from '@/shared/components/utilidades';
import type { MunicipalidadListado } from '../schemas/municipalidad';
import { formatearFecha } from './presentacion';

type Propiedades = Readonly<{
  municipalidades: readonly MunicipalidadListado[];
  /** Solo el administrador las edita. */
  puedeEditar: boolean;
}>;

function columnas(puedeEditar: boolean): Columna<MunicipalidadListado>[] {
  const base: Columna<MunicipalidadListado>[] = [
    {
      clave: 'nombre',
      encabezado: 'Municipalidad',
      fija: true,
      celda: (m) => (
        <span className="flex flex-wrap items-center gap-3">
          <span className="text-label">{m.nombre}</span>
          {m.sinRed ? <ChipEstado estado="neutro">Sin red</ChipEstado> : null}
        </span>
      ),
    },
    { clave: 'departamento', encabezado: 'Departamento', celda: (m) => m.departamento ?? '—' },
    {
      clave: 'incorporacion',
      encabezado: 'Incorporación',
      celda: (m) => <span className="tabular-nums">{formatearFecha(m.fechaIncorporacion)}</span>,
    },
    { clave: 'lineas', encabezado: 'Líneas', alineacion: 'fin', celda: (m) => m.numeroDeLineas },
    {
      clave: 'estaciones',
      encabezado: 'Estaciones',
      alineacion: 'fin',
      celda: (m) => m.numeroDeEstaciones,
    },
  ];
  if (!puedeEditar) {
    return base;
  }
  return [
    ...base,
    {
      clave: 'acciones',
      encabezado: 'Acciones',
      celda: (m) => (
        <EnlaceBoton href={`/municipalidades/${m.id}/editar`} variante="fantasma" tamano="denso">
          Editar<TextoOculto> {m.nombre}</TextoOculto>
        </EnlaceBoton>
      ),
    },
  ];
}

/** Municipalidades con su parte de la red; "Sin red" marca la expansión pendiente. */
export function TablaMunicipalidades({ municipalidades, puedeEditar }: Propiedades): ReactElement {
  return (
    <TablaDatos
      id="tabla-municipalidades"
      titulo="Municipalidades de la red"
      columnas={columnas(puedeEditar)}
      filas={municipalidades}
      claveDeFila={(m) => String(m.id)}
      vacio={
        <EstadoVacio
          variante="sin-datos"
          titulo="Aún no hay municipalidades"
          texto="Cuando se registren municipalidades, aparecerán aquí."
        />
      }
    />
  );
}
