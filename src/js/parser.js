/**
 * parser.js
 */

/* api */
const { generate, parse, toPlainObject, walk } = require('css-tree');
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
 * @returns {Array.<object|undefined>} - collection of AST branches
 */
const walkAST = (ast = {}) => {
  const selectors = new Set();
  const opt = {
    enter: branch => {
      if (branch.type === SELECTOR) {
        selectors.add(branch.children);
      }
    },
    leave: branch => {
      let skip;
      if (branch.type === SELECTOR) {
        skip = walkAST.skip;
      }
      return skip;
    }
  };
  walk(ast, opt);
  return [...selectors];
};

/* export */
module.exports = {
  generateCSS: generate,
  parseSelector,
  walkAST
};
