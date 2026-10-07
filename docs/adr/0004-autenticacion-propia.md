# 0004. Autenticación propia con JWT en cookie httpOnly

Fecha: 2026-10-06 · Estado: aceptado · Vigencia: hasta 2026-10-24

## Contexto

El estándar exige autenticar con el proveedor de identidad institucional, que no existe para este proyecto.

## Decisión

El backend autentica usuario y contraseña y emite un JWT firmado. El token viaja en una cookie httpOnly, `Secure` y `SameSite`, que solo lee y escribe el servidor de Next.js; el navegador nunca accede a él. La sesión y los permisos se verifican en el servidor, en el layout o la página del segmento y dentro de cada acción de servidor.

## Consecuencias

- Las contraseñas se guardan con hash; nunca se devuelven al cliente.
- El token no es accesible desde JavaScript del navegador.
- Si aparece un proveedor institucional, solo cambia el módulo de usuarios y la emisión de la cookie.

## Norma afectada

DES-STD-002 §14.3 (proveedor de identidad institucional)
