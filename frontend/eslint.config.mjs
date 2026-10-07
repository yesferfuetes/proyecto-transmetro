// @ts-check
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import boundaries from 'eslint-plugin-boundaries';
import prettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    '.next/**',
    'out/**',
    'coverage/**',
    'playwright-report/**',
    'test-results/**',
    'next-env.d.ts',
  ]),
  ...nextVitals,
  ...nextTs,
  {
    files: ['**/*.{ts,tsx,mts}'],
    extends: [tseslint.configs.recommendedTypeCheckedOnly],
    languageOptions: {
      parserOptions: {
        projectService: true,
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
    files: ['**/*.{ts,tsx}'],
    plugins: { 'better-tailwindcss': betterTailwindcss },
    settings: { 'better-tailwindcss': { entryPoint: 'src/app/globals.css' } },
    rules: {
      'better-tailwindcss/no-unknown-classes': 'error',
      'better-tailwindcss/no-restricted-classes': [
        'error',
        {
          restrict: [
            {
              pattern: '\\[.*\\]',
              message: 'Valor arbitrario: usa un token declarado en globals.css.',
            },
          ],
        },
      ],
      'better-tailwindcss/no-conflicting-classes': 'error',
      'better-tailwindcss/no-duplicate-classes': 'error',
      'better-tailwindcss/no-concatenated-classes': 'error',
    },
  },
  {
    files: ['src/modules/*/components/**/*.tsx'],
    rules: { 'max-lines': ['error', { max: 200 }] },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.json' } },
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app' },
        { type: 'shared', pattern: 'src/shared' },
        { type: 'config', pattern: 'src/config' },
        { type: 'modulo', pattern: 'src/modules/*', capture: ['nombre'] },
      ],
      'boundaries/files': [
        { pattern: 'src/modules/*/index.ts', category: 'publico' },
        { pattern: 'src/*.ts', category: 'raiz' },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            { allow: { to: [{ module: { origin: 'external' } }, { module: { origin: 'core' } }] } },
            {
              from: [{ element: { type: 'app' } }, { file: { categories: 'raiz' } }],
              allow: {
                to: [
                  { element: { type: 'modulo' }, file: { categories: 'publico' } },
                  { element: { types: { anyOf: ['app', 'shared', 'config'] } } },
                ],
              },
            },
            {
              from: { element: { type: 'modulo' } },
              allow: {
                to: [
                  {
                    element: {
                      type: 'modulo',
                      captured: { nombre: '{{from.element.captured.nombre}}' },
                    },
                  },
                  { element: { type: 'modulo' }, file: { categories: 'publico' } },
                  { element: { types: { anyOf: ['shared', 'config'] } } },
                ],
              },
            },
            {
              from: { element: { types: { anyOf: ['shared', 'config'] } } },
              allow: { to: { element: { types: { anyOf: ['shared', 'config'] } } } },
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'e2e/**/*.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true }],
    },
  },
  prettier,
]);
