import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { exigirDatos, FormularioLinea, listarTodasLasMunicipalidades } from '@/modules/red';
import { EncabezadoPagina } from '@/shared/components/superficies';
import { exigirSesion } from '@/shared/lib/sesion/sesion';

// Dinámica: depende de la sesión; sin caché compartida.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Nueva línea' };

export default async function PaginaNuevaLinea(): Promise<ReactElement> {
  await exigirSesion(['SUPERVISOR_MUNICIPAL']);
  const municipalidades = exigirDatos(await listarTodasLasMunicipalidades());
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        destacado="Nueva"
        resto="línea"
        descripcion="Se registra sin recorrido; después defines sus estaciones."
      />
      <FormularioLinea
        municipalidades={municipalidades.map((m) => ({ valor: String(m.id), etiqueta: m.nombre }))}
      />
    </div>
  );
}
