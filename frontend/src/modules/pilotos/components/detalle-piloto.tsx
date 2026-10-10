import type { ReactElement, ReactNode } from 'react';
import { FranjaSuperior, Seccion, Tarjeta } from '@/shared/components/superficies';
import { Aviso } from '@/shared/components/superposiciones';
import type { FichaDePiloto, PilotoReducido } from '../schemas/piloto';
import { BusDeBaja } from './bus-de-baja';
import { LineaDelPiloto } from './linea-del-piloto';
import { ListaDeDatos, type Dato } from './lista-de-datos';

type Propiedades = Readonly<{
  ficha: FichaDePiloto;
  /** Acciones de escritura; solo llegan para el rol que puede usarlas. */
  acciones?: ReactNode;
  /** Formulario del cambio de bus; solo para el supervisor. */
  cambioDeBus?: ReactNode;
}>;

function datosDelExpediente(ficha: FichaDePiloto): Dato[] {
  const telefono = { clave: 'telefono', etiqueta: 'Teléfono', valor: ficha.piloto.telefono };
  if (ficha.vista === 'reducida') {
    return [telefono];
  }
  const { piloto } = ficha;
  return [
    { clave: 'dpi', etiqueta: 'DPI', valor: <span className="tabular-nums">{piloto.dpi}</span> },
    telefono,
    { clave: 'correo', etiqueta: 'Correo', valor: piloto.correo ?? 'Sin correo' },
    { clave: 'direccion', etiqueta: 'Dirección de residencia', valor: piloto.direccionResidencia },
    {
      clave: 'historial',
      etiqueta: 'Historial educativo',
      valor: <span className="whitespace-pre-line">{piloto.historialEducativo}</span>,
    },
  ];
}

function BloqueDeBus({
  piloto,
  cambioDeBus,
}: Readonly<{ piloto: PilotoReducido; cambioDeBus?: ReactNode }>): ReactElement {
  return (
    <Tarjeta className="flex flex-col gap-4">
      <h3 className="text-subheading text-ink">Bus y línea</h3>
      {piloto.bus === null ? (
        <p className="text-body text-ink-muted">Este piloto no tiene bus asignado.</p>
      ) : (
        <p className="flex flex-wrap items-center gap-3 text-body">
          <b>{piloto.bus.placa}</b>
          {piloto.busDeBaja ? <BusDeBaja /> : null}
        </p>
      )}
      <LineaDelPiloto linea={piloto.linea} tamano="mediano" />
      {cambioDeBus ? <div className="border-t border-border pt-4">{cambioDeBus}</div> : null}
    </Tarjeta>
  );
}

/** Ficha de un piloto: reducida para el operador, expediente completo para los demás. */
export function DetallePiloto({ ficha, acciones, cambioDeBus }: Propiedades): ReactElement {
  const { piloto } = ficha;
  return (
    <div className="flex flex-col gap-6">
      <FranjaSuperior variante="compacta" etiqueta={`Piloto ${piloto.nombre}`}>
        <h1 className="text-title text-ink-inverse lg:text-title-lg">{piloto.nombre}</h1>
      </FranjaSuperior>
      {piloto.busDeBaja ? (
        <Aviso estado="advertencia" titulo="El bus de este piloto está de baja.">
          {cambioDeBus
            ? 'Asígnale otro bus o déjalo sin bus.'
            : 'El supervisor debe asignarle otro bus.'}
        </Aviso>
      ) : null}
      {acciones ? <div className="flex flex-wrap gap-3">{acciones}</div> : null}
      <Seccion id="expediente" destacado="Expediente" resto="del piloto">
        <Tarjeta>
          <ListaDeDatos datos={datosDelExpediente(ficha)} />
        </Tarjeta>
      </Seccion>
      <Seccion id="bus" destacado="Bus" resto="del piloto">
        <BloqueDeBus piloto={piloto} cambioDeBus={cambioDeBus} />
      </Seccion>
    </div>
  );
}
