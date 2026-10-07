import type { NextConfig } from 'next';

const esDesarrollo = process.env.NODE_ENV !== 'production';

// Next.js inyecta scripts en línea; sin nonce, la política necesita 'unsafe-inline'.
// En desarrollo, Turbopack necesita además 'unsafe-eval'.
const politicaDeContenido = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${esDesarrollo ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const cabecerasDeSeguridad = [
  { key: 'Content-Security-Policy', value: politicaDeContenido },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Frame-Options', value: 'DENY' },
];

const configuracion: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  headers: async () => [{ source: '/:path*', headers: cabecerasDeSeguridad }],
};

export default configuracion;
