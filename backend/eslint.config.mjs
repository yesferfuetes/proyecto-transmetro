// @ts-check
import eslint from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

const MODULOS = ['usuarios', 'red', 'accesos', 'flota', 'pilotos', 'alertas', 'reportes'];

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ['*.mjs', '*.js'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      complexity: ['error', 10],
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-ignore': true,
          'ts-nocheck': true,
          'ts-expect-error': 'allow-with-description',
          minimumDescriptionLength: 10,
        },
      ],
    },
  },
  {
    files: ['src/**/*.ts'],
    plugins: { boundaries },
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.json' } },
      'boundaries/elements': [
        { type: 'shared', pattern: 'src/shared' },
        { type: 'migracion', pattern: 'src/migrations' },
        { type: 'semilla', pattern: 'src/seeds' },
        { type: 'modulo', pattern: `src/(${MODULOS.join('|')})`, capture: ['nombre'] },
      ],
      'boundaries/files': [{ pattern: 'src/*.ts', category: 'raiz' }],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            { allow: { to: [{ module: { origin: 'external' } }, { module: { origin: 'core' } }] } },
            {
              from: { element: { type: 'modulo' } },
              allow: {
                to: [
                  { element: { type: 'shared' } },
                  {
                    element: {
                      type: 'modulo',
                      captured: { nombre: '{{from.element.captured.nombre}}' },
                    },
                  },
                ],
              },
            },
            {
              from: { element: { type: 'shared' } },
              allow: { to: { element: { type: 'shared' } } },
            },
            {
              from: { file: { categories: 'raiz' } },
              allow: { to: [{ element: { type: '*' } }, { file: { categories: 'raiz' } }] },
            },
            {
              from: { element: { type: 'semilla' } },
              allow: {
                to: [{ element: { types: { anyOf: ['shared', 'semilla', 'modulo'] } } }],
              },
            },
          ],
        },
      ],
    },
  },
  {
    files: ['*.js'],
    languageOptions: { sourceType: 'commonjs', globals: globals.node },
  },
  {
    files: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
    },
  },
  prettier,
);
