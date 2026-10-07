/** Pruebas de integración: necesitan PostgreSQL en DATABASE_URL. Cada archivo usa una base propia. */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test/integracion'],
  testRegex: '\\.test\\.ts$',
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }] },
  testTimeout: 60000,
};
