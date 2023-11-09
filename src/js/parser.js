/**
 * parser.js
 */

/* import */
import { findAll, parse, toPlainObject, walk } from 'css-tree';

/* constants */
import {
  PSEUDO_CLASS_SELECTOR, SELECTOR, SYNTAX_ERR, TYPE_FROM, TYPE_TO
} from './constant.js';
const CODE_POINT_UNIT = parseInt('10000', 16);
const HEX = 16;
const PAIR = 2;

/* regexp */
const HEX_CAPTURE = /^([\da-f]{1,6}\s?)/i;
const PSEUDO_FUNC = /^(?:(?:ha|i)s|not|where)$/;
const QUOTED_LANG = /(:lang\(\s*("[A-Z\d\-*]+")\s*\))/i;
const WHITESPACE = /^[\n\r\f]/;

/**
 * unescape selector
 * @param {string} selector - CSS selector
 * @returns {?string} - unescaped selector
 */
export const unescapeSelector = (selector = '') => {
  if (typeof selector === 'string' && selector.indexOf('\\', 0) >= 0) {
    const arr = selector.split('\\');
    const l = arr.length;
    for (let i = 1; i < l; i++) {
      let item = arr[i];
      if (i === l - 1 && item === '') {
        item = '\uFFFD';
      } else {
        const hexExists = HEX_CAPTURE.exec(item);
        if (hexExists) {
          const [, hex] = hexExists;
          let str;
          try {
            const low = parseInt('D800', 16);
            const high = parseInt('DFFF', 16);
            const deci = parseInt(hex, 16);
            if (deci === 0 || (deci >= low && deci <= high)) {
              str = '\uFFFD';
            } else {
              str = String.fromCodePoint(deci);
            }
          } catch (e) {
            str = '\uFFFD';
          }
          let postStr = '';
          if (item.length > hex.length) {
            postStr = item.substring(hex.length);
          }
          item = `${str}${postStr}`;
        } else if (WHITESPACE.test(item)) {
          item = '\\' + item;
        }
      }
      arr[i] = item;
    }
    selector = arr.join('');
  }
  return selector;
};

/**
 * preprocess
 * @see https://drafts.csswg.org/css-syntax-3/#input-preprocessing
 * @param {...*} args - arguments
 * @returns {string} - filtered selector string
 */
export const preprocess = (...args) => {
  if (!args.length) {
    throw new TypeError('1 argument required, but only 0 present.');
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
    throw new DOMException(`Invalid selector ${selector}`, SYNTAX_ERR);
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
  if (/^$|^\s*>|,\s*$/.test(selector)) {
    throw new DOMException(`Invalid selector ${selector}`, SYNTAX_ERR);
  }
  let res;
  try {
    const ast = parse(selector, {
      context: 'selectorList',
      parseCustomProperty: true
    });
    res = toPlainObject(ast);
  } catch (e) {
    // workaround for https://github.com/csstree/csstree/issues/265
    // NOTE: still throws on `:lang("")`;
    if (e.message === 'Identifier is expected' && QUOTED_LANG.test(selector)) {
      const [, lang, range] = QUOTED_LANG.exec(selector);
      const escapedRange =
        range.replace('*', '\\*').replace(/^"/, '').replace(/"$/, '');
      const escapedLang = lang.replace(range, escapedRange);
      res = parseSelector(selector.replace(lang, escapedLang));
    } else if (e.message === '"]" is expected' && !selector.endsWith(']')) {
      res = parseSelector(`${selector}]`);
    } else if (e.message === '")" is expected' && !selector.endsWith(')')) {
      res = parseSelector(`${selector})`);
    } else {
      throw new DOMException(e.message, SYNTAX_ERR);
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
        for (const { children } of itemList) {
          // SelectorList
          for (const { children: grandChildren } of children) {
            // Selector
            for (const { children: greatGrandChildren } of grandChildren) {
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
