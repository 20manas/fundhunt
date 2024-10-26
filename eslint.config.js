import js from '@eslint/js';
import comments from '@eslint-community/eslint-plugin-eslint-comments/configs';
import preferEarlyReturn from '@regru/eslint-plugin-prefer-early-return';
import tanstackQueryPlugin from '@tanstack/eslint-plugin-query';
import prettier from 'eslint-config-prettier';
import functional from 'eslint-plugin-functional';
import importXPlugin from 'eslint-plugin-import-x';
import preferArrowFunctions from 'eslint-plugin-prefer-arrow-functions';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

import svelteConfig from './svelte.config.js';

/** @type {import('eslint').Linter.Config[]} */
export default ts.config(
  {
    plugins: {
      'prefer-early-return': preferEarlyReturn,
      'prefer-arrow-functions': preferArrowFunctions,
    },
  },
  js.configs.recommended,
  ...ts.configs.strictTypeChecked,
  ...ts.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['svelte.config.js', 'eslint.config.js', 'tsconfig.json'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  ...svelte.configs['flat/recommended'],
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
        svelteConfig: svelteConfig,
        svelteFeatures: {
          experimentalGenerics: true,
        },
      },
    },
  },
  // importX Config
  {
    plugins: {
      'import-x': importXPlugin,
    },
    settings: {
      'import-x/parsers': {
        '@typescript-eslint/parser': ['.ts', '.svelte'],
      },
      'import-x/resolver': {
        typescript: true,
        node: true,
      },
    },
  },
  functional.configs.stylistic,
  comments.recommended,
  ...tanstackQueryPlugin.configs['flat/recommended'],
  prettier,
  ...svelte.configs['flat/prettier'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        $state: 'readonly',
        $derived: 'readonly',
        $props: 'readonly',
        $bindable: 'readonly',
        $effect: 'readonly',
      },
    },
  },
  {
    ignores: ['build/', '.svelte-kit/', 'dist/'],
  },
  {
    rules: {
      'curly': ['error', 'multi-line'],
      'max-depth': ['error', {max: 3}],
      'eqeqeq': 'error',
      'arrow-body-style': 'error',
      'yoda': 'error',
      'no-restricted-syntax': [
        'error',
        {selector: 'TSEnumDeclaration:not([const=true])', message: "Don't declare non-const enums"},
      ],
      'no-duplicate-imports': ['error', {includeExports: true}],
      'svelte/valid-compile': ['error', {ignoreWarnings: true}],
      '@typescript-eslint/no-explicit-any': ['error', {fixToUnknown: true}],
      '@typescript-eslint/no-invalid-void-type': 'off',
      '@typescript-eslint/non-nullable-type-assertion-style': 'off',
      '@typescript-eslint/restrict-template-expressions': [
        'warn',
        {
          allowAny: false,
          allowBoolean: false,
          allowNullish: false,
          allowRegExp: false,
          allowNever: false,
        },
      ],
      '@typescript-eslint/no-unsafe-enum-comparison': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': [
        'error',
        {ignoreConditionalTests: true, ignoreMixedLogicalExpressions: true},
      ],
      '@typescript-eslint/array-type': ['error', {default: 'array-simple'}],
      '@typescript-eslint/no-unused-vars': ['warn', {argsIgnorePattern: '_.*'}],
      '@typescript-eslint/no-confusing-void-expression': ['error', {ignoreArrowShorthand: true}],
      // disabling prefer-literal-enum-member should be fine since non-const enums are not allowed through `no-restricted-syntax`
      '@typescript-eslint/prefer-literal-enum-member': 'off',
      '@typescript-eslint/strict-boolean-expressions': ['error', {allowNullableBoolean: true}],
      '@typescript-eslint/no-misused-promises': ['error', {checksVoidReturn: {attributes: false}}],
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      'import-x/no-absolute-path': 'error',
      'import-x/no-useless-path-segments': ['error', {noUselessIndex: true}],
      'import-x/order': [
        'error',
        {
          'groups': [['builtin', 'external'], 'internal', 'parent', 'sibling', 'index', 'object', 'unknown'],
          'pathGroups': [
            {
              pattern: '*.{css,scss}',
              patternOptions: {matchBase: true},
              group: 'unknown',
              position: 'before',
            },
          ],
          'newlines-between': 'always',
          'alphabetize': {
            order: 'asc',
            orderImportKind: 'asc',
          },
          'warnOnUnassignedImports': true,
        },
      ],
      'prefer-early-return/prefer-early-return': 'error',
      'prefer-arrow-functions/prefer-arrow-functions': 'error',
      '@eslint-community/eslint-comments/no-unused-disable': 'error',
    },
  },
);
