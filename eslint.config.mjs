import jsdoc from 'eslint-plugin-jsdoc';
import regexp from 'eslint-plugin-regexp';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import neostandard, { plugins as neostdplugins } from 'neostandard';

export default [
  ...neostandard({
    semi: true
  }),
  jsdoc.configs['flat/recommended'],
  regexp.configs['flat/recommended'],
  {
    ignores: ['dist/', 'test/file/', 'test/wpt/', 'benchmark/']
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.webextensions
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    plugins: {
      '@stylistic': neostdplugins['@stylistic'],
      regexp,
      unicorn
    },
    rules: {
      '@stylistic/space-before-function-paren': ['error', {
        anonymous: 'always',
        asyncArrow: 'always',
        named: 'never'
      }],
      'import-x/order': ['error', {
        alphabetize: {
          order: 'ignore',
          caseInsensitive: false
        }
      }],
      'no-await-in-loop': 'error',
      'no-use-before-define': ['error', {
        allowNamedExports: false,
        classes: true,
        functions: true,
        variables: true
      }],
      'prefer-object-has-own': 'error',
      'unicorn/prefer-node-protocol': 'error'
    }
  }
];
