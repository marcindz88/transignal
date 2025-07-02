import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import json from '@eslint/json';
import css from '@eslint/css';
import { defineConfig } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import unusedImports from 'eslint-plugin-unused-imports';
import importPlugin from 'eslint-plugin-import';

export default defineConfig([
  {
    ignores: ['dist/**/*', 'node_modules/**/*', '.angular/**/*'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended'],
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: { globals: globals.browser },
  },
  tseslint.configs.recommended,
  {
    files: ['**/*.json'],
    plugins: { json },
    language: 'json/jsonc',
    extends: ['json/recommended'],
  },
  {
    files: ['**/*.css'],
    plugins: { css },
    language: 'css/css',
    extends: ['css/recommended'],
  },
  {
    files: ['**/*.ts', '**/*.js'],
    extends: [importPlugin.flatConfigs.recommended],
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'no-console': 'error',
      'no-debugger': 'error',
      'import/first': [2],
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'off',
      'import/named': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'object-property-newline': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'import/order': [
        'error',
        {
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',

          alphabetize: {
            order: 'asc',
            caseInsensitive: false,
          },

          groups: ['builtin', 'external', 'index', 'object', 'internal', ['sibling', 'parent']],
        },
      ],
    },
  },
  eslintPluginPrettierRecommended,
]);
