# Transmetro

Sistema de Información y Control Operativo de Transmetro para la Municipalidad de Guatemala.
Aplicación web administrativa para operadores de estación, supervisores municipales y
administradores. No la usan los pasajeros.

- **Responsable:** Yesfer Bany — Análisis de Sistemas II.
- **Decisiones de arquitectura:** [`docs/adr/`](docs/adr/README.md).

## Arquitectura

Monolito modular en NestJS con CQRS, una base PostgreSQL y una aplicación Next.js con App Router.
El navegador solo habla con el servidor de Next.js; Next.js llama al backend por la red privada.

```
Navegador ──HTTPS──▶ Next.js (servidor) ──red privada──▶ NestJS (CQRS) ──▶ PostgreSQL
                     componentes de servidor              commands / queries
                     acciones de servidor
```

| Carpeta     | Contenido                                                                                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `backend/`  | API NestJS: un módulo por contexto de negocio en `src/<modulo>/`, núcleo técnico en `src/shared/`, migraciones en `src/migrations/`, datos semilla en `src/seeds/` |
| `frontend/` | Next.js: rutas en `src/app/`, lógica en `src/modules/<modulo>/`, piezas comunes en `src/shared/`                                                                   |
| `docs/adr/` | Decisiones de arquitectura y desviaciones de los estándares                                                                                                        |
| `scripts/`  | Verificación de términos del repositorio y análisis local de SonarQube                                                                                             |

Módulos de negocio: usuarios, red, accesos, flota, pilotos, alertas y reportes.

## Requisitos

- Node.js 24 (`.nvmrc`).
- Docker, para PostgreSQL local y para construir las imágenes.

## Ejecución local

```bash
# 1. Base de datos (PostgreSQL 18 en el puerto 5432)
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env
npm ci
npm run build
npm run migration:run
SEED_CONTRASENA=<contraseña de los usuarios de la demo> npm run seed
npm run start:dev          # http://localhost:3001 · Swagger en http://localhost:3001/docs

# 3. Frontend, en otra terminal
cd frontend
cp .env.example .env
npm ci
npm run dev                # http://localhost:3000
```

## Comandos de calidad

Iguales en `backend/` y `frontend/`:

| Comando                         | Hace                               |
| ------------------------------- | ---------------------------------- |
| `npm run format:check`          | Verifica el formato con Prettier   |
| `npm run lint`                  | ESLint sin advertencias permitidas |
| `npm run typecheck`             | Verificación de tipos              |
| `npm test` / `npm run test:cov` | Pruebas unitarias, con cobertura   |
| `npm run build`                 | Construcción                       |

Solo en el backend:

| Comando                                      | Hace                                                                               |
| -------------------------------------------- | ---------------------------------------------------------------------------------- |
| `npm run test:integracion`                   | Pruebas contra PostgreSQL real (usa `DATABASE_URL`; crea y borra bases temporales) |
| `npm run migration:run` / `migration:revert` | Aplica o revierte migraciones (requiere `npm run build`)                           |
| `npm run migration:check`                    | Falla si las entidades difieren del esquema migrado                                |
| `npm run seed`                               | Carga los datos semilla; puede repetirse sin duplicar                              |
| `npm run openapi`                            | Escribe `openapi.json` sin conectarse a la base                                    |

Solo en el frontend:

| Comando                  | Hace                                                                        |
| ------------------------ | --------------------------------------------------------------------------- |
| `npm run e2e`            | Pruebas de extremo a extremo con Playwright (requiere `npm run build`)      |
| `npm run tamano-paquete` | Mide el JavaScript que recibe el navegador y falla si supera el presupuesto |

En la raíz:

| Comando                              | Hace                                                                                                                 |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `bash scripts/verificar-terminos.sh` | Verifica que los archivos versionados no contengan términos internos de documentación. Se corre antes de cada commit |
| `bash scripts/sonar-local.sh`        | Genera cobertura y analiza el repositorio con la instancia local de SonarQube                                        |

## Variables de entorno

Los valores reales viven en Railway (ADR 0005). Ningún secreto lleva prefijo público.

| Servicio | Variable            | Uso                                                                       |
| -------- | ------------------- | ------------------------------------------------------------------------- |
| backend  | `DATABASE_URL`      | Conexión a PostgreSQL                                                     |
| backend  | `PORT`              | Puerto HTTP (por defecto 3001)                                            |
| backend  | `NODE_ENV`          | `development`, `test` o `production`; en producción no se publica Swagger |
| backend  | `JWT_SECRETO`       | Firma de las sesiones; al menos 32 caracteres aleatorios                  |
| backend  | `SEED_CONTRASENA`   | Solo al sembrar: contraseña inicial de los usuarios de la demo            |
| frontend | `BACKEND_URL`       | URL interna del backend; solo la lee el servidor                          |
| frontend | `PORT` / `HOSTNAME` | Puerto e interfaz del servidor standalone                                 |

Si falta una variable obligatoria, el servicio no inicia y dice cuál falta. Las pruebas de extremo
a extremo leen `E2E_CONTRASENA`, la misma contraseña con la que se sembraron los usuarios.

## Flujos críticos

Determinan la cobertura mínima de pruebas de extremo a extremo (DES-STD-002 §10):

- Inicio de sesión.
- Toda mutación de datos.

Cubiertos hoy en `frontend/e2e/`: iniciar y cerrar sesión con cada rol y ver su menú; registrar,
editar, desactivar, reactivar y asignar contraseña a un usuario; cambiar la propia contraseña;
registrar municipalidades, estaciones y líneas; armar, reordenar y activar un recorrido; registrar
y editar accesos, asignarles guardias por turno y quitarlos; registrar y editar guardias; registrar
buses, asignarlos a una línea, moverlos entre líneas, cambiar su parqueo y su estado; registrar,
editar y eliminar parqueos; consulta de la red, los accesos y la flota por un operador, sin
escritura.

## Accesos, guardias y flota

| Ruta                                          | Qué hace                                                                    | Escritura  |
| --------------------------------------------- | --------------------------------------------------------------------------- | ---------- |
| `/accesos`, `/accesos/[id]`                   | Accesos por estación, con sus guardias y turnos; `?estacionId=` filtra      | Supervisor |
| `/accesos/lineas/[lineaId]`                   | Accesos de cada línea                                                       | —          |
| `/guardias`, `/guardias/[id]`                 | Guardias de seguridad                                                       | Supervisor |
| `/flota`, `/flota/[id]`, `/flota/[id]/editar` | Buses, con filtros por línea, estado y parqueo                              | Supervisor |
| `/flota/lineas`                               | Flota por línea: mínimo, máximo y si está completa, insuficiente o excedida | —          |
| `/flota/parqueos`                             | Parqueos, su capacidad y los buses que tienen                               | Supervisor |

Reglas que el backend aplica y el frontend solo muestra:

- Una línea admite entre tantos buses como estaciones tiene y el doble; el máximo se exige al
  asignar y el mínimo al quitar un bus de una línea activa.
- Un bus tiene siempre un parqueo y un parqueo no excede su capacidad. Un bus de baja no tiene línea.
- Un guardia no puede tener turnos que se traslapen en estaciones distintas; los turnos que cruzan
  la medianoche se tratan como dos tramos.
- A una estación con parqueos registrados no se le puede quitar la marca de parqueo.

## Estrategia de renderizado por ruta

| Ruta                                                  | Estrategia | Motivo                                         |
| ----------------------------------------------------- | ---------- | ---------------------------------------------- |
| `/`                                                   | Dinámica   | Lleva a `/inicio` o a `/login` según la sesión |
| `/login`                                              | Dinámica   | Lee la cookie y el motivo de la redirección    |
| `/inicio`, `/mi-cuenta`, `/acceso-denegado`           | Dinámica   | Dependen de la sesión                          |
| `/usuarios/**`                                        | Dinámica   | Sesión de administrador; datos al momento      |
| `/lineas/**`, `/estaciones/**`, `/municipalidades/**` | Dinámica   | Dependen de la sesión y del rol                |
| `/accesos/**`, `/guardias/**`                         | Dinámica   | Dependen de la sesión y del rol                |
| `/flota/**` (buses, flota por línea y parqueos)       | Dinámica   | Dependen de la sesión y del rol                |

El intermediario (`src/proxy.ts`) solo redirige a `/login` cuando no hay cookie de sesión; los
permisos se verifican en el servidor, en cada layout, página y acción.

Las vistas con sesión son dinámicas y no se guardan en caché compartida. Cada ruta declara su
estrategia en el propio segmento.

## Calidad y SonarQube

El pipeline de GitHub Actions corre formato, lint, tipos, pruebas, construcción, pruebas de
integración, pruebas de extremo a extremo y el análisis de SonarQube.

SonarQube corre en una instancia local y el trabajo `sonar` se ejecuta en un runner propio de
GitHub Actions instalado en la misma máquina (ADR 0012). **Al hacer push, esa máquina debe estar
encendida con Docker y el contenedor `sonarqube` en marcha**; si no, el pipeline queda en espera y
el despliegue también.

## Despliegue

Railway, un entorno de producción, tres servicios (ADR 0003):

| Servicio   | Origen                | Red                                                                                                             |
| ---------- | --------------------- | --------------------------------------------------------------------------------------------------------------- |
| `postgres` | PostgreSQL 18         | Privada                                                                                                         |
| `backend`  | `backend/Dockerfile`  | Privada, sin dominio público. Antes de cada despliegue corre `npm run migration:run`; si falla, no se despliega |
| `frontend` | `frontend/Dockerfile` | Dominio público HTTPS                                                                                           |

La configuración de cada servicio se fija con `bash scripts/railway-configurar.sh backend|frontend` (requiere la CLI de Railway con sesión iniciada). Railway despliega la rama `main` solo cuando el pipeline pasa completo. Los datos semilla se cargan
una vez con `npm run seed` dentro del contenedor del backend.

## Datos semilla

| Dato                                                                  | Origen                                                                                                                                                                                               |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Líneas 1, 2, 6, 7, 12, 13, 18 y Ruta 5 con sus 99 estaciones en orden | Reales: mapa oficial de Transmetro, Municipalidad de Guatemala, actualización de noviembre de 2024                                                                                                   |
| Distancias entre estaciones                                           | **Ficticias**: entre 0.4 y 1.2 km                                                                                                                                                                    |
| Accesos, guardias y turnos                                            | **Ficticios**: accesos A y B por estación; un guardia por estación y turno                                                                                                                           |
| Parqueos                                                              | **Ficticios**: 4 parqueos de 30 vehículos en Centra Sur, Atlántida, FEGUA y USAC Periférico                                                                                                          |
| Buses                                                                 | **Ficticios**: estaciones de la línea + 1 por línea (113), placas `TM-0001` en adelante                                                                                                              |
| Pilotos                                                               | **Ficticios**: uno por bus; nombres, DPI, teléfonos y correos inventados                                                                                                                             |
| Municipalidades                                                       | Guatemala, y Mixco sin líneas para mostrar la expansión de la red                                                                                                                                    |
| Usuarios                                                              | **Ficticios**: `admin@transmetro.test`, `supervisor@transmetro.test` y un operador por primera estación de las líneas 1, 2 y 12 (`operador.e001@…`). La contraseña inicial sale de `SEED_CONTRASENA` |

Aproximaciones sobre los datos reales: el sentido del circuito de la Línea 2 y la posición de
Capuchinas en la Línea 18 no se leen con certeza en el mapa. El servicio San Rafael–Paraíso no se
incluye.
