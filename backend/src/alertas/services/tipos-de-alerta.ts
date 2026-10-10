export const TIPOS_DE_ALERTA = ['SOBRECUPO', 'BAJA_OCUPACION'] as const;
export type TipoDeAlerta = (typeof TIPOS_DE_ALERTA)[number];

export const ESTADOS_DE_ALERTA = ['pendiente', 'atendida'] as const;
export type EstadoDeAlerta = (typeof ESTADOS_DE_ALERTA)[number];
