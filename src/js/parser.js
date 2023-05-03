/**
 * parser.js
 */

const { parse, toPlainObject, walk: walkAst } = require('css-tree');

/**
 * create AST from CSS selector
 * @param {string} selector - CSS selector
 * @returns {object} - AST
 */
const parseSelector = selector => {
  const ast = parse(selector, {
    context: 'selectorList',
    parseCustomProperty: true
  });
  return toPlainObject(ast);
};

module.exports = {
  parseSelector,
  walkAst
};
