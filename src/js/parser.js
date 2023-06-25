/**
 * parser.js
 */

/* import */
import { findAll, parse, toPlainObject, walk } from 'css-tree';

/* constants */
import { PSEUDO_CLASS_SELECTOR, SELECTOR } from './constant.js';
const CODE_POINT_UNIT = parseInt('10000', 16);
const HEX = 16;
const PAIR = 2;
const TYPE_FROM = 8;
const TYPE_TO = -1;

/* regexp */
const PSEUDO_FUNC = /^(?:(?:ha|i)s|not|where)$/;

/**
 * preprocess
 * @see https://drafts.csswg.org/css-syntax-3/#input-preprocessing
 * @param {...*} args - arguments
 * @returns {string} - filtered selector string
 */
export const preprocess = (...args) => {
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
export const parseSelector = selector => {
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
    } else if (e.message === '")" is expected' && !selector.endsWith(')')) {
      res = parseSelector(`${selector})`);
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
export const walkAST = (ast = {}) => {
  const branches = new Set();
  let hasPseudoFunc;
  const opt = {
    enter: node => {
      if (node.type === SELECTOR) {
        branches.add(node.children);
      } else if (node.type === PSEUDO_CLASS_SELECTOR &&
                 PSEUDO_FUNC.test(node.name)) {
        hasPseudoFunc = true;
      }
    }
  };
  walk(ast, opt);
  if (hasPseudoFunc) {
    findAll(ast, (node, item, list) => {
      if (node.type === PSEUDO_CLASS_SELECTOR && PSEUDO_FUNC.test(node.name) &&
          list) {
        const itemList = list.filter(i => {
          const { name, type } = i;
          return type === PSEUDO_CLASS_SELECTOR && PSEUDO_FUNC.test(name);
        });
        for (const i of itemList) {
          const { children } = i;
          // SelectorList
          for (const j of children) {
            const { children: grandChildren } = j;
            // Selector
            for (const k of grandChildren) {
              const { children: greatGrandChildren } = k;
              if (branches.has(greatGrandChildren)) {
                branches.delete(greatGrandChildren);
              }
            }
          }
        }
      }
    });
  }
  return [...branches];
};

/* export */
export { generate as generateCSS } from 'css-tree';
