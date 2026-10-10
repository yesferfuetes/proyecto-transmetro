'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ReactElement } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import type { z } from 'zod';
import { Boton } from '@/shared/components/acciones';
import { InsigniaLinea } from '@/shared/components/datos';
import { Campo, CampoNumero, ResumenErrores, Selector } from '@/shared/components/formulario';
import { Aviso } from '@/shared/components/superposiciones';
import type { ErrorDeBackend } from '@/shared/lib/http/resultado';
import { registrarDemanda } from '../actions/registrar-demanda';
import { registrarOcupacion } from '../actions/registrar-ocupacion';
import { useLectura } from '../hooks/use-lectura';
import {
  esquemaFormularioDeLectura,
  type BusParaLectura,
  type FormularioDeLectura as Datos,
} from '../schemas/lectura';
import type { EstadoDeLectura } from '../types/estado-de-lectura';

type Valores = z.input<typeof esquemaFormularioDeLectura>;

type Tipo = 'demanda' | 'ocupacion';

const TEXTOS: Readonly<Record<Tipo, { cifra: string; ayuda: string; boton: string }>> = {
  demanda: {
    cifra: 'Pasajeros esperando',
    ayuda: 'Cuántas personas esperan en tu estación a este bus.',
    boton: 'Registrar demanda',
  },
  ocupacion: {
    cifra: 'Pasajeros a bordo',
    ayuda: 'Cuántas personas trae el bus al llegar.',
    boton: 'Registrar ocupación',
  },
};

const ACCIONES: Readonly<Record<Tipo, (datos: Datos) => Promise<EstadoDeLectura>>> = {
  demanda: registrarDemanda,
  ocupacion: registrarOcupacion,
};

type Propiedades = Readonly<{ tipo: Tipo; buses: readonly BusParaLectura[] }>;

function mensajeDeCampo(mensaje: unknown): string | undefined {
  return typeof mensaje === 'string' ? mensaje : undefined;
}

function erroresDeCampo(error: ErrorDeBackend, tipo: Tipo): { campoId: string; mensaje: string }[] {
  return error.detalles.map((detalle) => ({
    campoId: `${tipo}-${detalle.campo}`,
    mensaje: detalle.mensajes.join(' '),
  }));
}

function Resultado({
  resultado,
  tipo,
}: Readonly<{ resultado: EstadoDeLectura | null; tipo: Tipo }>): ReactElement | null {
  if (resultado === null) {
    return null;
  }
  if (resultado.ok) {
    return (
      <Aviso estado="informacion" titulo="No corresponde alerta">
        La lectura no genera ninguna alerta.
      </Aviso>
    );
  }
  // Una alerta repetida no es una falla: ya hay una pendiente para este bus.
  if (resultado.error.codigo === 'ALERTA_PENDIENTE_EXISTENTE') {
    return <Aviso estado="informacion" titulo={resultado.error.mensaje} />;
  }
  return (
    <ResumenErrores
      mensaje={resultado.error.mensaje}
      errores={erroresDeCampo(resultado.error, tipo)}
    />
  );
}

/** Una lectura de pasajeros (demanda en la estación u ocupación de un bus) y su resultado. */
export function FormularioDeLectura({ tipo, buses }: Propiedades): ReactElement {
  const {
    register,
    handleSubmit,
    control: controlDelFormulario,
    formState: { errors },
  } = useForm<Valores, unknown, Datos>({
    resolver: zodResolver(esquemaFormularioDeLectura),
    defaultValues: { busId: '', pasajeros: '' },
  });
  const { pendiente, resultado, enviar } = useLectura(ACCIONES[tipo]);
  const busId = useWatch({ control: controlDelFormulario, name: 'busId' });
  const elegido = buses.find((bus) => String(bus.id) === String(busId));
  const textos = TEXTOS[tipo];
  return (
    <form
      noValidate
      onSubmit={(evento) => void handleSubmit(enviar)(evento)}
      className="flex flex-col gap-4"
    >
      <Resultado resultado={resultado} tipo={tipo} />
      <Campo id={`${tipo}-busId`} etiqueta="Bus" error={mensajeDeCampo(errors.busId?.message)}>
        {(control) => (
          <Selector
            {...control}
            {...register('busId')}
            textoVacio="Elige un bus"
            opciones={buses.map((bus) => ({
              valor: String(bus.id),
              etiqueta: `${bus.placa} · ${bus.linea.nombre} (capacidad ${bus.capacidadMax})`,
            }))}
          />
        )}
      </Campo>
      {elegido ? (
        <p className="flex items-center gap-3 text-dense text-ink-muted">
          <InsigniaLinea codigo={elegido.linea.codigo} />
          {elegido.linea.nombre} · capacidad de {elegido.capacidadMax} pasajeros
        </p>
      ) : null}
      <Campo
        id={`${tipo}-pasajeros`}
        etiqueta={textos.cifra}
        ayuda={textos.ayuda}
        error={mensajeDeCampo(errors.pasajeros?.message)}
      >
        {(control) => <CampoNumero {...control} {...register('pasajeros')} unidad="pasajeros" />}
      </Campo>
      <div className="flex sm:justify-end">
        <Boton type="submit" variante="principal" cargando={pendiente}>
          {textos.boton}
        </Boton>
      </div>
    </form>
  );
}
