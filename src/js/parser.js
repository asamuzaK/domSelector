/**
 * parser.js
 */
'use strict';

/* import */
const { generate, parse, toPlainObject, walk } = require('css-tree');
const { SELECTOR } = require('./constant.js');
const DOMException = require('./domexception.js');

/* constants */
const TYPE_FROM = 8;
const TYPE_TO = -1;

/**
 * create AST from CSS selector
 * @param {string} selector - CSS selector
 * @returns {object} - AST
 */
const parseSelector = selector => {
  if (selector === undefined || selector === null) {
    selector = Object.prototype.toString.call(selector)
      .slice(TYPE_FROM, TYPE_TO).toLowerCase();
  }
  // invalid selectors
  if (typeof selector !== 'string' || selector === '' ||
      selector.startsWith('>') || selector.endsWith(',') ||
      selector.includes('= ')) {
    throw new DOMException(`invalid selector ${selector}`, 'SyntaxError');
  }
  let res;
  try {
    const ast = parse(selector, {
      context: 'selectorList',
      parseCustomProperty: true
    });
    res = toPlainObject(ast);
  } catch (e) {
    throw new DOMException(e.message, 'SyntaxError');
  }
  return res;
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
