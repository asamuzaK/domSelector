/**
 * parser.js
 */
'use strict';

/* import */
const { generate, parse, toPlainObject, walk } = require('css-tree');
const DOMException = require('./domexception.js');

/* constants */
const { SELECTOR } = require('./constant.js');
const CODE_POINT_UNIT = parseInt('10000', 16);
const HEX = 16;
const PAIR = 2;
const TYPE_FROM = 8;
const TYPE_TO = -1;

/**
 * preprocess
 * @see https://drafts.csswg.org/css-syntax-3/#input-preprocessing
 * @param {...*} args - arguments
 * @returns {string} - filtered selector string
 */
const preprocess = (...args) => {
  if (!args.length) {
    throw new TypeError('1 argument required, but only 0 present');
  }
  let [selector] = args;
  if (typeof selector === 'string') {
    let index = 0;
    while (index >= 0) {
      index = selector.indexOf('#', index);
      if (index < 0) {
        break;
      }
      const preHash = selector.substring(0, index + 1);
      let postHash = selector.substring(index + 1);
      const codePoint = postHash.codePointAt(0);
      if (codePoint >= CODE_POINT_UNIT) {
        const str = `\\${codePoint.toString(HEX)} `;
        if (postHash.length === PAIR) {
          postHash = str;
        } else {
          postHash = `${str}${postHash.substring(PAIR)}`;
        }
      }
      selector = `${preHash}${postHash}`;
      index++;
    }
    selector = selector.replace(/\f|\r\n?/g, '\n')
      .replace(/[\0\uD800-\uDFFF]|\\$/g, '\uFFFD');
  } else if (selector === undefined || selector === null) {
    selector = Object.prototype.toString.call(selector)
      .slice(TYPE_FROM, TYPE_TO).toLowerCase();
  } else {
    throw new DOMException(`invalid selector ${selector}`, 'SyntaxError');
  }
  return selector;
};

/**
 * create AST from CSS selector
 * @param {string} selector - CSS selector
 * @returns {object} - AST
 */
const parseSelector = selector => {
  selector = preprocess(selector);
  // invalid selectors
  if (selector === '' || /^\s*>/.test(selector) || /,\s*$/.test(selector)) {
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
    if (e.message === '"]" is expected' && !selector.endsWith(']')) {
      res = parseSelector(`${selector}]`);
    } else {
      throw new DOMException(e.message, 'SyntaxError');
    }
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
  preprocess,
  walkAST
};
