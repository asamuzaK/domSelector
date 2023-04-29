/**
 * parser.js
 */

import { parse, toPlainObject } from 'css-tree';
export { walk as walkAst } from 'css-tree';

/**
 * create AST from CSS selector
 * @param {string} selector - CSS selector
 * @returns {object} - AST
 */
export const parseSelector = selector => {
  const ast = parse(selector, {
    context: 'selectorList',
    parseCustomProperty: true
  });
  return toPlainObject(ast);
};
