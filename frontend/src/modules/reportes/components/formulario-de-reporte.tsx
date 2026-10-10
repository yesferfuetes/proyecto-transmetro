'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';
import { Boton } from '@/shared/components/acciones';
import {
  AccionesFormulario,
  Campo,
  ResumenErrores,
  Selector,
} from '@/shared/components/formulario';
import { Tarjeta } from '@/shared/components/superficies';
import { FiltroFechas } from '@/shared/components/tabla';
import { generarReporte } from '../actions/generar-reporte';
import { erroresDeCampo, mensajeDe, useEnvio } from '../hooks/use-envio';
import {
  esquemaSolicitudDeReporte,
  ETIQUETA_DE_TIPO,
  TIPOS_DE_REPORTE,
  type SolicitudDeReporte,
} from '../schemas/consulta';
import type { OpcionesDelFormulario } from './presentacion';

type Valores = z.input<typeof esquemaSolicitudDeReporte>;

const VALORES_INICIALES: Valores = { tipo: '', lineaId: '', estacionId: '', municipalidadId: '' };

const TIPOS = TIPOS_DE_REPORTE.map((tipo) => ({ valor: tipo, etiqueta: ETIQUETA_DE_TIPO[tipo] }));

type Propiedades = Readonly<{ opciones: OpcionesDelFormulario }>;

/** Elige el tipo de reporte y sus filtros; al generarlo queda la constancia y se abre el reporte. */
export function FormularioDeReporte({ opciones }: Propiedades): ReactElement {
  const {
    register,
    handleSubmit,
    formState: { errors, submitCount },
  } = useForm<Valores, unknown, SolicitudDeReporte>({
    resolver: zodResolver(esquemaSolicitudDeReporte),
    defaultValues: VALORES_INICIALES,
  });
  const { pendiente, error, enviar } = useEnvio(generarReporte);
  return (
    <div className="grid lg:grid-cols-12">
      <form
        noValidate
        onSubmit={(evento) => void handleSubmit(enviar)(evento)}
        className="flex flex-col gap-6 lg:col-span-8"
      >
        {error ? (
          <ResumenErrores
            key={submitCount}
            mensaje={error.mensaje}
            errores={erroresDeCampo(error)}
          />
        ) : null}
        <Tarjeta className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-12">
            <Campo id="tipo" etiqueta="Tipo de reporte" error={mensajeDe(errors, 'tipo')}>
              {(control) => (
                <Selector
                  {...control}
                  {...register('tipo')}
                  opciones={TIPOS}
                  textoVacio="Elige un tipo de reporte"
                />
              )}
            </Campo>
          </div>
          <div className="md:col-span-6">
            <Campo id="lineaId" etiqueta="Línea" opcional error={mensajeDe(errors, 'lineaId')}>
              {(control) => (
                <Selector
                  {...control}
                  {...register('lineaId')}
                  opciones={opciones.lineas}
                  textoVacio="Todas las líneas"
                />
              )}
            </Campo>
          </div>
          <div className="md:col-span-6">
            <Campo
              id="estacionId"
              etiqueta="Estación"
              opcional
              error={mensajeDe(errors, 'estacionId')}
            >
              {(control) => (
                <Selector
                  {...control}
                  {...register('estacionId')}
                  opciones={opciones.estaciones}
                  textoVacio="Todas las estaciones"
                />
              )}
            </Campo>
          </div>
          <div className="md:col-span-6">
            <Campo
              id="municipalidadId"
              etiqueta="Municipalidad"
              opcional
              error={mensajeDe(errors, 'municipalidadId')}
            >
              {(control) => (
                <Selector
                  {...control}
                  {...register('municipalidadId')}
                  opciones={opciones.municipalidades}
                  textoVacio="Todas las municipalidades"
                />
              )}
            </Campo>
          </div>
          <div className="flex flex-col gap-1.5 md:col-span-6">
            <span className="text-label text-ink">Rango de fechas</span>
            <fieldset
              disabled
              aria-describedby="rango-de-fechas-ayuda"
              className="w-fit opacity-50"
            >
              <FiltroFechas etiqueta="Rango de fechas" nombreDesde="desde" nombreHasta="hasta" />
            </fieldset>
            <p id="rango-de-fechas-ayuda" className="text-dense text-ink-muted">
              El reporte refleja el estado actual.
            </p>
          </div>
        </Tarjeta>
        <AccionesFormulario>
          <Boton type="submit" variante="principal" cargando={pendiente}>
            Generar reporte
          </Boton>
        </AccionesFormulario>
      </form>
    </div>
  );
}
