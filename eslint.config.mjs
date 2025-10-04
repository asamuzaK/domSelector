import jsdoc from 'eslint-plugin-jsdoc';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import regexp from 'eslint-plugin-regexp';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import neostandard from 'neostandard';

export default [
  ...neostandard({
    noStyle: true
  }),
  jsdoc.configs['flat/recommended'],
  regexp.configs['flat/recommended'],
  prettierRecommended,
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
      regexp,
      unicorn
    },
    rules: {
      'import-x/order': [
        'error',
        {
          alphabetize: {
            order: 'ignore',
            caseInsensitive: false
          }
        }
      ],
      'no-await-in-loop': 'error',
      'no-use-before-define': [
        'error',
        {
          allowNamedExports: false,
          classes: true,
          functions: true,
          variables: true
        }
      ],
      'prefer-object-has-own': 'error',
      'unicorn/prefer-node-protocol': 'error'
    }
  }
];
