/**
 * Red vigente de Transmetro según el mapa oficial de la Municipalidad de Guatemala
 * (actualización de noviembre de 2024). Nombres y orden de las estaciones son reales; las
 * distancias entre estaciones son ficticias (ver README).
 */

export interface DatosMunicipalidad {
  nombre: string;
  departamento: string;
}

export interface DatosLinea {
  codigo: string;
  nombre: string;
  recorrido: readonly string[];
}

export const MUNICIPALIDADES: readonly DatosMunicipalidad[] = [
  { nombre: 'Guatemala', departamento: 'Guatemala' },
  // Municipio aledaño sin líneas todavía: muestra la expansión de la red.
  { nombre: 'Mixco', departamento: 'Guatemala' },
];

export const MUNICIPALIDAD_DE_LA_RED = 'Guatemala';

export const LINEAS: readonly DatosLinea[] = [
  {
    codigo: 'L1',
    nombre: 'San Sebastián – Centro Cívico',
    recorrido: [
      'San Sebastián',
      'Mercado Central',
      'Correos',
      'Beatas de Belén',
      'Paseo de las Letras',
      'Centro Cívico',
      'Sur 2',
      'Gómez Carrillo',
      'San Agustín',
      'Parque Centenario',
    ],
  },
  {
    codigo: 'L2',
    nombre: 'Hipódromo del Norte – San Sebastián',
    recorrido: [
      'San Sebastián',
      'Jocotenango',
      'San José de la Montaña',
      'Hipódromo del Norte',
      'Simeón Cañas',
    ],
  },
  {
    codigo: 'L6',
    nombre: 'Proyectos – FEGUA',
    recorrido: [
      'FEGUA',
      'Francos y Monroy',
      'Colón',
      'Cerro del Carmen',
      'Parroquia',
      'IGSS Zona 6',
      'Centro Zona 6',
      'Academia',
      'Cipresales',
      'Proyectos 4-4',
      'Proyectos',
      'Quintanal',
      'Corpus Christi',
      'José Martí',
      'Santa Teresa',
      'Capuchinas',
    ],
  },
  {
    codigo: 'L7',
    nombre: 'USAC Periférico – La Merced',
    recorrido: [
      'USAC Periférico',
      'Granai',
      'Rodolfo Robles',
      'Cejusa',
      'San Jorge',
      'Roosevelt',
      'San Juan',
      'Ciudad de Plata II',
      'Villa Linda',
      '4 de Febrero',
      'Bethania',
      'Incienso',
      'San Juan de Dios',
      'Pasaje Aycinena',
      'La Merced',
      'Cruz Roja',
      'Archivo General',
      'Santuario de Guadalupe',
    ],
  },
  {
    codigo: 'L12',
    nombre: 'Centra Sur – Plaza Barrios',
    recorrido: [
      'Centra Sur',
      'Monte María',
      'Javier',
      'Las Charcas',
      'El Carmen',
      'Reformita',
      'Mariscal',
      'Trébol',
      'Santa Cecilia',
      'Bolívar',
      'Don Bosco',
      'Plaza Municipal',
      'Plaza Barrios',
      'Plaza El Amate',
    ],
  },
  {
    codigo: 'L13',
    nombre: 'Plaza Argentina – Tipografía',
    recorrido: [
      'Tipografía',
      'El Calvario',
      '4 Grados Sur',
      'Exposición',
      'Terminal',
      'Industria',
      'Tívoli',
      'Montúfar',
      'Acueducto',
      'Fuerza Aérea',
      'Hangares',
      'Plaza Berlín',
      'Juan Pablo II',
      'Plaza Argentina',
      'Los Arcos',
      'Plaza España',
      'IGSS Zona 9',
      'Seis 26',
      'Torre del Reformador',
      'Plaza de la República',
      'Cantón Exposición',
      'Banco de Guatemala',
    ],
  },
  {
    codigo: 'L18',
    nombre: 'Atlántida – FEGUA',
    recorrido: [
      'FEGUA',
      'Francos y Monroy',
      'Colón',
      'Cerro del Carmen',
      'San Martín',
      'Victorias',
      'Portales',
      'Atlántida',
      'Capuchinas',
    ],
  },
  {
    codigo: 'R5',
    nombre: 'Parque Colón – Puente de la Penitenciaría',
    recorrido: [
      'Parque Colón',
      'Matamoros',
      'Cipreses',
      'Jardines de la Asunción',
      'Arrivillaga',
      'Parque Navidad',
      'La Palmita',
      'Palacio de los Deportes',
      'Puente de la Penitenciaría',
      'Mercado La Palmita',
      'Vivibien',
    ],
  },
];

/** Estaciones con parqueo para la flota, y la línea cuyos buses guardan preferentemente. */
export const PARQUEOS: readonly { estacion: string; capacidad: number }[] = [
  { estacion: 'Centra Sur', capacidad: 30 },
  { estacion: 'Atlántida', capacidad: 30 },
  { estacion: 'FEGUA', capacidad: 30 },
  { estacion: 'USAC Periférico', capacidad: 30 },
];

export const PARQUEO_PREFERIDO_POR_LINEA: Readonly<Record<string, string>> = {
  L1: 'FEGUA',
  L2: 'Atlántida',
  L6: 'FEGUA',
  L7: 'USAC Periférico',
  L12: 'Centra Sur',
  L13: 'Centra Sur',
  L18: 'Atlántida',
  R5: 'Atlántida',
};
