import type { ReactElement } from 'react';
import { Boton } from '@/shared/components/acciones';
import { BarraFiltros, FiltroFechas, FiltroSeleccion } from '@/shared/components/tabla';
import type { FiltrosDeBitacora } from '../schemas/bitacora';
import { ETIQUETA_DE_TIPO, TIPOS_DE_REPORTE } from '../schemas/consulta';
import type { OpcionesDeReporte } from '../schemas/opciones';

type Propiedades = Readonly<{
  filtros: FiltrosDeBitacora;
  usuarios: OpcionesDeReporte['usuarios'];
  total: number;
}>;

export function hayFiltrosDeBitacora(filtros: FiltrosDeBitacora): boolean {
  return (
    filtros.usuarioId !== undefined ||
    filtros.tipo !== undefined ||
    filtros.desde !== undefined ||
    filtros.hasta !== undefined
  );
}

/** Filtros por usuario, tipo de reporte y rango de fechas; viven en la URL. */
export function FiltrosBitacora({ filtros, usuarios, total }: Propiedades): ReactElement {
  return (
    <BarraFiltros
      accion="/reportes/bitacora"
      etiqueta="Filtros de la bitácora"
      total={total}
      hayFiltros={hayFiltrosDeBitacora(filtros)}
      hrefLimpiar="/reportes/bitacora"
    >
      <FiltroSeleccion
        nombre="usuarioId"
        etiqueta="Usuario"
        valor={filtros.usuarioId?.toString()}
        etiquetaTodas="Todos"
        opciones={usuarios.map((u) => ({ valor: String(u.id), etiqueta: u.nombre }))}
      />
      <FiltroSeleccion
        nombre="tipo"
        etiqueta="Reporte"
        valor={filtros.tipo}
        opciones={TIPOS_DE_REPORTE.map((tipo) => ({
          valor: tipo,
          etiqueta: ETIQUETA_DE_TIPO[tipo],
        }))}
      />
      <FiltroFechas
        etiqueta="Fechas"
        nombreDesde="desde"
        nombreHasta="hasta"
        desde={filtros.desde}
        hasta={filtros.hasta}
      />
      <Boton type="submit" variante="secundario" tamano="denso">
        Aplicar fechas
      </Boton>
    </BarraFiltros>
  );
}
