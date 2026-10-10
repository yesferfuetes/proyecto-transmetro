import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import {
  ActualizacionAutomatica,
  esquemaFiltrosAlertas,
  exigirDatos,
  FiltrosAlertas,
  hayFiltrosDeAlertas,
  hrefConFiltros,
  leerHuella,
  listarAlertas,
  listarOpciones,
  TablaAlertas,
} from '@/modules/alertas';
import { EnlaceBoton } from '@/shared/components/acciones';
import { Paginacion } from '@/shared/components/navegacion';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión y de alertas que cambian; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Alertas' };

export default async function PaginaAlertas({
  searchParams,
}: PageProps<'/alertas'>): Promise<ReactElement> {
  const sesion = await exigirSesion();
  const esOperador = sesion.rol === 'OPERADOR_ESTACION';
  const consulta = esquemaFiltrosAlertas.parse(await searchParams);
  // El operador solo ve su estación: el backend ignora estos filtros y la pantalla no los ofrece.
  const filtros = esOperador ? { ...consulta, estacion: undefined, linea: undefined } : consulta;
  // La huella se lee antes que la lista: si llega una alerta entre las dos lecturas, la huella
  // inicial queda atrás de la tabla y el siguiente sondeo la actualiza.
  const huella = exigirDatos(await leerHuella());
  const [pagina, opciones] = await Promise.all([
    listarAlertas(filtros).then(exigirDatos),
    esOperador ? undefined : listarOpciones().then(exigirDatos),
  ]);
  const totalPaginas = Math.max(1, Math.ceil(pagina.total / pagina.tamano));
  const hrefDePagina = (numero: number): string =>
    hrefConFiltros('/alertas', {
      ...filtros,
      resaltada: undefined,
      pagina: numero === 1 ? undefined : numero,
    });
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Alertas"
        resto="de capacidad"
        descripcion={
          esOperador
            ? `Las alertas de ${sesion.estacion?.nombre ?? 'tu estación'}, pendientes primero.`
            : 'Las alertas de toda la red, pendientes primero.'
        }
        acciones={
          esOperador ? (
            <EnlaceBoton href="/alertas/registrar" variante="principal" icono="alertas">
              Registrar lectura
            </EnlaceBoton>
          ) : null
        }
      />
      <FiltrosAlertas filtros={filtros} opciones={opciones} total={pagina.total} />
      <TablaAlertas
        alertas={pagina.elementos}
        mostrarEstacion={!esOperador}
        puedeAtender={esOperador}
        resaltada={filtros.resaltada}
        hayFiltros={hayFiltrosDeAlertas(filtros)}
      />
      {totalPaginas > 1 ? (
        <Paginacion
          pagina={filtros.pagina}
          totalPaginas={totalPaginas}
          hrefDePagina={hrefDePagina}
        />
      ) : null}
      <ActualizacionAutomatica huellaInicial={huella} />
    </div>
  );
}
