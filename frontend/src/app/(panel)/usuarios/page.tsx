import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { EnlaceBoton } from '@/shared/components/acciones';
import { Paginacion } from '@/shared/components/navegacion';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';
import {
  esquemaFiltrosUsuarios,
  exigirDatos,
  FiltrosUsuarios,
  hrefDelListado,
  listarEstacionesAsignables,
  listarUsuarios,
  TablaUsuarios,
} from '@/modules/usuarios';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Usuarios' };

export default async function Usuarios({
  searchParams,
}: PageProps<'/usuarios'>): Promise<ReactElement> {
  await exigirSesion(['ADMINISTRADOR']);
  const filtros = esquemaFiltrosUsuarios.parse(await searchParams);
  const [pagina, estaciones] = await Promise.all([
    listarUsuarios(filtros).then(exigirDatos),
    listarEstacionesAsignables().then(exigirDatos),
  ]);
  const totalPaginas = Math.max(1, Math.ceil(pagina.total / pagina.tamano));
  const conFiltros = [filtros.rol, filtros.estacionId, filtros.activo, filtros.busqueda].some(
    (valor) => valor !== undefined,
  );

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Usuarios"
        resto="del sistema"
        descripcion="Quién entra a la aplicación, con qué rol y, si es operador, desde qué estación."
        acciones={
          <EnlaceBoton href="/usuarios/nuevo" variante="principal">
            Nuevo usuario
          </EnlaceBoton>
        }
      />
      <FiltrosUsuarios filtros={filtros} estaciones={estaciones} total={pagina.total} />
      <TablaUsuarios usuarios={pagina.elementos} conFiltros={conFiltros} />
      {pagina.total > 0 ? (
        <Paginacion
          pagina={pagina.pagina}
          totalPaginas={totalPaginas}
          hrefDePagina={(numero) => hrefDelListado({ ...filtros, pagina: numero })}
        />
      ) : null}
    </div>
  );
}
