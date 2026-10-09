import type { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Boton } from '@/shared/components/acciones';
import { Campo, CampoTexto, ResumenErrores } from '@/shared/components/formulario';
import { Aviso } from '@/shared/components/superposiciones';
import { editarAcceso } from '../actions/editar-acceso';
import { erroresDeCampo, mensajeDe, useEnvio } from '../hooks/use-envio';
import {
  esquemaFormularioEdicionAcceso,
  type FormularioEdicionAcceso as Datos,
} from '../schemas/acceso';

type Propiedades = Readonly<{ accesoId: number; nombre: string | null }>;

/** Cambio del nombre de un acceso: el código y la estación no se editan. */
export function EdicionDeNombreDeAcceso({ accesoId, nombre }: Propiedades): ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors, submitCount },
  } = useForm<Datos>({
    resolver: zodResolver(esquemaFormularioEdicionAcceso),
    defaultValues: { nombre: nombre ?? '' },
  });
  const { pendiente, error, guardado, enviar } = useEnvio((datos: Datos) =>
    editarAcceso(accesoId, datos),
  );

  return (
    <form
      noValidate
      onSubmit={(evento) => void handleSubmit(enviar)(evento)}
      className="flex flex-col gap-4"
    >
      {error ? (
        <ResumenErrores key={submitCount} mensaje={error.mensaje} errores={erroresDeCampo(error)} />
      ) : null}
      {guardado && !error ? <Aviso estado="exito" titulo="Nombre actualizado." /> : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="sm:w-96">
          <Campo id="nombre" etiqueta="Nombre del acceso" error={mensajeDe(errors, 'nombre')}>
            {(control) => <CampoTexto {...control} {...register('nombre')} maxLength={100} />}
          </Campo>
        </div>
        <Boton type="submit" variante="secundario" cargando={pendiente}>
          Guardar nombre
        </Boton>
      </div>
    </form>
  );
}
