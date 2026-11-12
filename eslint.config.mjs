// @ts-check
// Older errors are listed in eslint-suppressions.json so they don't block
// commits; new errors still fail. After fixing an old one, run
// `yarn lint:prune` and commit the updated file.
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import jasmine from 'eslint-plugin-jasmine';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist/', 'coverage/']),

  js.configs.recommended,
  tseslint.configs.recommended,

  // Library source (runs in the browser)
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      'no-alert': 'error',
      'no-console': 'error',
      // A warning, not an error: the pre-commit hook auto-fixes it, and an
      // auto-fixed error would leave a stale entry in eslint-suppressions.json
      // and fail the commit.
      'prefer-const': 'warn',
    },
  },

  // Jasmine specs (run by Karma)
  {
    files: ['src/**/*.spec.ts'],
    plugins: { jasmine },
    languageOptions: {
      globals: globals.jasmine,
    },
    rules: {
      ...jasmine.configs.recommended.rules,
      // Blank-line rules are formatting; Prettier owns that.
      'jasmine/new-line-between-declarations': 'off',
      'jasmine/new-line-before-expect': 'off',
      'jasmine/no-spec-dupes': ['warn', 'branch'],
      'jasmine/no-suite-dupes': ['warn', 'branch'],
    },
  },

  // Node config files (webpack, karma)
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // Must be last: turns off rules that clash with Prettier
  prettier,
]);
