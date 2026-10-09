// Superficie pública del módulo. Ningún otro módulo consume accesos por ahora.

// Para las rutas de accesos y guardias en app/(panel).
export { AccesosDeLinea } from './components/accesos-de-linea';
export { CargaDeListado } from './components/carga-de-listado';
export { DetalleAcceso } from './components/detalle-acceso';
export { FiltrosAccesos } from './components/filtros-accesos';
export { FiltrosGuardias } from './components/filtros-guardias';
export { FormularioAcceso } from './components/formulario-acceso';
export { FormularioAsignacion } from './components/formulario-asignacion';
export { FormularioGuardia } from './components/formulario-guardia';
export { hrefConFiltros } from './components/presentacion';
export { TablaAccesosPorEstacion } from './components/tabla-accesos-por-estacion';
export { TablaGuardias } from './components/tabla-guardias';
export {
  listarAccesos,
  listarAccesosDeLinea,
  listarOpcionesDeEstacion,
  obtenerAcceso,
} from './data/accesos';
export { exigirDatos } from './data/exigir-datos';
export { listarGuardias, listarOpcionesDeGuardia, obtenerGuardia } from './data/guardias';
export { listarOpcionesDeLinea } from './data/lineas';
export { esquemaId, esquemaIdOpcional } from './schemas/comunes';
export { esquemaFiltrosAccesos } from './schemas/acceso';
export { esquemaFiltrosGuardias } from './schemas/guardia';
