import type { ReactElement } from 'react';
import { EnlaceBoton } from '@/shared/components/acciones';
import { ChipEstado, EstadoVacio } from '@/shared/components/datos';
import { TablaDatos, type Columna } from '@/shared/components/tabla';
import { TextoOculto } from '@/shared/components/utilidades';
import { ETIQUETA_DE_ROL } from '@/shared/schemas/sesion';
import type { UsuarioListado } from '../schemas/usuario';

const COLUMNAS: readonly Columna<UsuarioListado>[] = [
  { clave: 'nombre', encabezado: 'Nombre', fija: true, celda: (usuario) => usuario.nombre },
  { clave: 'correo', encabezado: 'Correo', celda: (usuario) => usuario.correo },
  { clave: 'rol', encabezado: 'Rol', celda: (usuario) => ETIQUETA_DE_ROL[usuario.rol] },
  {
    clave: 'estacion',
    encabezado: 'Estación',
    celda: (usuario) =>
      usuario.estacion ? `${usuario.estacion.codigo} · ${usuario.estacion.nombre}` : '—',
  },
  {
    clave: 'estado',
    encabezado: 'Estado',
    celda: (usuario) =>
      usuario.activo ? (
        <ChipEstado estado="exito">Activo</ChipEstado>
      ) : (
        <ChipEstado estado="neutro">Inactivo</ChipEstado>
      ),
  },
  {
    clave: 'acciones',
    encabezado: 'Acciones',
    alineacion: 'fin',
    celda: (usuario) => (
      <EnlaceBoton href={`/usuarios/${usuario.id}`} variante="fantasma" tamano="denso">
        Abrir<TextoOculto> {usuario.nombre}</TextoOculto>
      </EnlaceBoton>
    ),
  },
];

type Propiedades = Readonly<{ usuarios: readonly UsuarioListado[]; conFiltros: boolean }>;

/** Usuarios ordenados por nombre, con su rol, estación y estado. */
export function TablaUsuarios({ usuarios, conFiltros }: Propiedades): ReactElement {
  return (
    <TablaDatos
      id="tabla-usuarios"
      titulo="Usuarios del sistema"
      columnas={COLUMNAS}
      filas={usuarios}
      claveDeFila={(usuario) => String(usuario.id)}
      vacio={
        conFiltros ? (
          <EstadoVacio
            variante="sin-resultados"
            titulo="Ningún usuario coincide"
            texto="Prueba con otros filtros o con otra búsqueda."
            accion={
              <EnlaceBoton href="/usuarios" variante="secundario">
                Limpiar filtros
              </EnlaceBoton>
            }
          />
        ) : (
          <EstadoVacio
            variante="sin-datos"
            titulo="Todavía no hay usuarios"
            texto="Registra el primero con el botón Nuevo usuario."
          />
        )
      }
    />
  );
}
