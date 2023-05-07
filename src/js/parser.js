/**
 * parser.js
 */

/* api */
const { parse, toPlainObject, walk } = require('css-tree');
const { SELECTOR } = require('./constant.js');

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

/**
 * walk AST
 * @param {object} ast - AST
 * @returns {Array.<object|undefined>} - array of selectors
 */
const walkAst = (ast = {}) => {
  const selectors = new Set();
  const opt = {
    enter: leaf => {
      if (leaf.type === SELECTOR) {
        selectors.add(leaf.children);
      }
    },
    leave: leaf => {
      let skip;
      if (leaf.type === SELECTOR) {
        skip = walkAst.skip;
      }
      return skip;
    }
  };
  walk(ast, opt);
  return [...selectors];
};

/* export */
module.exports = {
  parseSelector,
  walkAst
};
