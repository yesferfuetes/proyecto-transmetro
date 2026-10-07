import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpDown,
  BellRing,
  BusFront,
  ChartColumn,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleAlert,
  CircleCheck,
  CloudOff,
  Ellipsis,
  House,
  IdCard,
  Inbox,
  Info,
  Landmark,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  MapPin,
  Route,
  Search,
  SearchX,
  ShieldCheck,
  SquareParking,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { ReactElement } from 'react';
import { cn } from '@/shared/lib/cn';

/** Catálogo cerrado: un ícono por concepto en toda la aplicación. */
const ICONOS = {
  'flecha-abajo': ArrowDown,
  'flecha-arriba': ArrowUp,
  'flecha-derecha': ArrowRight,
  ordenar: ArrowUpDown,
  alertas: BellRing,
  bus: BusFront,
  reportes: ChartColumn,
  marca: Check,
  'chevron-abajo': ChevronDown,
  'chevron-izquierda': ChevronLeft,
  'chevron-derecha': ChevronRight,
  circulo: Circle,
  error: CircleAlert,
  exito: CircleCheck,
  'sin-conexion': CloudOff,
  mas: Ellipsis,
  inicio: House,
  pilotos: IdCard,
  'bandeja-vacia': Inbox,
  informacion: Info,
  municipalidad: Landmark,
  cargando: LoaderCircle,
  candado: LockKeyhole,
  salir: LogOut,
  estaciones: MapPin,
  lineas: Route,
  buscar: Search,
  'sin-resultados': SearchX,
  accesos: ShieldCheck,
  parqueo: SquareParking,
  'baja-ocupacion': TrendingDown,
  sobrecupo: TrendingUp,
  advertencia: TriangleAlert,
  usuarios: Users,
  cerrar: X,
} satisfies Record<string, LucideIcon>;

export type NombreIcono = keyof typeof ICONOS;
export type TamanoIcono = 16 | 20 | 24 | 28;

type Propiedades = Readonly<{
  nombre: NombreIcono;
  tamano?: TamanoIcono;
  /** Solo cuando el ícono comunica algo que no está en el texto vecino. */
  etiqueta?: string;
  className?: string;
}>;

/** Ícono de línea con trazo uniforme. Decorativo por defecto. */
export function Icono({ nombre, tamano = 20, etiqueta, className }: Propiedades): ReactElement {
  const Componente = ICONOS[nombre];
  const accesibilidad = etiqueta
    ? { role: 'img', 'aria-label': etiqueta }
    : { 'aria-hidden': true as const };
  return (
    <Componente
      size={tamano}
      strokeWidth={1.75}
      fill="none"
      focusable="false"
      className={cn('shrink-0', className)}
      {...accesibilidad}
    />
  );
}
