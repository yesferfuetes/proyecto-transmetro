# Registro de decisiones de arquitectura

Cada documento registra una desviación de los estándares DES-STD-004 (backend) y DES-STD-002
(frontend), o una decisión de diseño relevante. Vigencia: hasta la entrega final del 24 de
octubre de 2026, salvo revisión.

| Número                                                   | Decisión                                                    | Norma afectada                                                                    |
| -------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------- |
| [0001](0001-monolito-modular.md)                         | Monolito modular con una sola base de datos                 | DES-STD-004 §3.1 (microservicios con base propia) y §12 (criterios de aceptación) |
| [0002](0002-bus-de-eventos-en-proceso.md)                | Eventos de dominio por el bus en proceso                    | DES-STD-004 §2 (mensajería por message broker)                                    |
| [0003](0003-despliegue-en-railway.md)                    | Despliegue en Railway en lugar de Cloud Run                 | DES-STD-002 §2 (contenedor sobre Cloud Run)                                       |
| [0004](0004-autenticacion-propia.md)                     | Autenticación propia con JWT en cookie httpOnly             | DES-STD-002 §14.3 (proveedor de identidad institucional)                          |
| [0005](0005-secretos-en-railway.md)                      | Secretos en las variables de Railway                        | DES-STD-002 §14.1 (gestor de secretos institucional)                              |
| [0006](0006-sin-feature-flags.md)                        | Sin servicio de feature flags                               | DES-STD-002 §2 y §9                                                               |
| [0007](0007-sin-carga-de-archivos.md)                    | Sin carga de archivos                                       | DES-STD-002 §6.5                                                                  |
| [0008](0008-documentos-referenciados.md)                 | Documentos institucionales referenciados no disponibles     | DES-STD-001, DES-STD-005, DES-ARQ-001 y DES-POL-001                               |
| [0009](0009-nucleo-compartido-y-llaves-entre-modulos.md) | Núcleo técnico compartido y llaves foráneas entre módulos   | DES-STD-004 §5 (estructura) y §12 (acoplamiento). Decisión de diseño              |
| [0010](0010-backend-en-red-privada.md)                   | El navegador solo habla con Next.js; backend en red privada | DES-STD-002 §6 y §14. Decisión de diseño                                          |
| [0011](0011-alertas-por-consulta-periodica.md)           | Alertas por consulta periódica                              | DES-STD-002 §6.1. Decisión de diseño                                              |
| [0012](0012-sonarqube-local.md)                          | SonarQube en instancia local con runner propio              | DES-STD-004 §9                                                                    |
| [0013](0013-fechas-con-zona-horaria.md)                  | Columnas de fecha y hora con zona horaria                   | Ninguna. Decisión de diseño                                                       |
