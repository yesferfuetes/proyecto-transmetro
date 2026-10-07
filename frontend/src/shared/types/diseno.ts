/** Superficie sobre la que se dibuja un componente: fondo claro o plano oscuro. */
export type Tono = 'claro' | 'oscuro';

/** Estados de negocio que la interfaz comunica siempre con color, ícono y texto. */
export type Estado = 'error' | 'advertencia' | 'exito' | 'informacion' | 'neutro';

/** Código de una línea tal como lo identifica la red: '1', '12', 'R5'… */
export type CodigoLinea = string;
