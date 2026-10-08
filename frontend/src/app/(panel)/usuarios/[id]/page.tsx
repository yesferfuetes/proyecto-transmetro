import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { ChipEstado } from '@/shared/components/datos';
import { EncabezadoPagina, Seccion, Tarjeta } from '@/shared/components/superficies';
import { formatearFechaHora } from '@/shared/lib/formato';
import { exigirSesion } from '@/shared/lib/sesion/sesion';
import {
  AccionesDeEstadoUsuario,
  esquemaIdUsuario,
  exigirDatos,
  FormularioAsignarContrasena,
  FormularioUsuario,
  listarEstacionesAsignables,
  obtenerUsuario,
} from '@/modules/usuarios';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Usuario' };

export default async function DetalleDeUsuario({
  params,
}: PageProps<'/usuarios/[id]'>): Promise<ReactElement> {
  await exigirSesion(['ADMINISTRADOR']);
  const id = esquemaIdUsuario.safeParse((await params).id);
  if (!id.success) {
    notFound();
  }
  const [resultado, estaciones] = await Promise.all([
    obtenerUsuario(id.data),
    listarEstacionesAsignables().then(exigirDatos),
  ]);
  if (!resultado.ok && resultado.error.codigo === 'USUARIO_NO_EXISTE') {
    notFound();
  }
  const usuario = exigirDatos(resultado);

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Editar"
        resto="usuario"
        descripcion={`${usuario.nombre} · registrado el ${formatearFechaHora(usuario.creadoEn)}`}
        acciones={
          usuario.activo ? (
            <ChipEstado estado="exito">Activo</ChipEstado>
          ) : (
            <ChipEstado estado="neutro">Inactivo</ChipEstado>
          )
        }
      />
      <Tarjeta className="lg:max-w-4xl">
        <FormularioUsuario estaciones={estaciones} usuario={usuario} />
      </Tarjeta>
      <Seccion id="estado-de-la-cuenta" destacado="Estado" resto="de la cuenta">
        <Tarjeta className="lg:max-w-4xl">
          <AccionesDeEstadoUsuario
            id={usuario.id}
            nombre={usuario.nombre}
            activo={usuario.activo}
          />
        </Tarjeta>
      </Seccion>
      <Seccion id="contrasena-nueva" destacado="Contraseña" resto="nueva">
        <Tarjeta className="lg:max-w-4xl">
          <FormularioAsignarContrasena id={usuario.id} />
        </Tarjeta>
      </Seccion>
    </div>
  );
}
