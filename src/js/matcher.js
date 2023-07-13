/**
 * matcher.js
 */

/* import */
import isCustomElementName from 'is-potential-custom-element-name';
import xpath from 'xpath';
import { generateCSS, parseSelector, walkAST } from './parser.js';

/* constants */
import {
  ATTRIBUTE_SELECTOR, CLASS_SELECTOR, COMBINATOR, ID_SELECTOR,
  PSEUDO_CLASS_SELECTOR, PSEUDO_ELEMENT_SELECTOR, TYPE_SELECTOR
} from './constant.js';
const BIT_ATTRIBUTE_SELECTOR = 16;
const BIT_CLASS_SELECTOR = 2;
const BIT_ID_SELECTOR = 4;
const BIT_PSEUDO_CLASS_SELECTOR = 32;
const BIT_PSEUDO_ELEMENT_SELECTOR = 1;
const BIT_TYPE_SELECTOR = 8;
const DOCUMENT_NODE = 9;
const DOCUMENT_FRAGMENT_NODE = 11;
const DOCUMENT_POSITION_CONTAINED_BY = 16;
const DOCUMENT_POSITION_CONTAINS = 8;
const DOCUMENT_POSITION_PRECEDING = 2;
const ELEMENT_NODE = 1;
const FILTER_SHOW_ELEMENT = 1;
const TEXT_NODE = 3;

/* regexp */
const DIR_VALUE = /^(?:auto|ltr|rtl)$/;
const HEX_CAPTURE = /^([\da-f]{1,6}\s?)/i;
const HTML_FORM_INPUT = /^(?:(?:inpu|selec)t|textarea)$/;
const HTML_FORM_PARTS = /^(?:button|fieldset|opt(?:group|ion))$/;
const HTML_INTERACT = /^d(?:etails|ialog)$/;
const INPUT_RANGE = /(?:(?:rang|tim)e|date(?:time-local)?|month|number|week)$/;
const INPUT_TEXT = /^(?:(?:emai|te|ur)l|password|search|text)$/;
const PSEUDO_FUNC = /^(?:(?:ha|i)s|not|where)$/;
const PSEUDO_NTH = /^nth-(?:last-)?(?:child|of-type)$/;
const WHITESPACE = /^[\n\r\f]/;

/**
 * is content editable
 * NOTE: not implemented in jsdom https://github.com/jsdom/jsdom/issues/1670
 * @param {object} node - Element
 * @returns {boolean} - result
 */
export const isContentEditable = (node = {}) => {
  let res;
  if (node.nodeType === ELEMENT_NODE) {
    if (node.ownerDocument.designMode === 'on') {
      res = true;
    } else if (node.hasAttribute('contenteditable')) {
      const attr = node.getAttribute('contenteditable');
      if (/^(?:plaintext-only|true)$/.test(attr) || attr === '') {
        res = true;
      } else if (attr === 'inherit') {
        let parent = node.parentNode;
        while (parent) {
          if (isContentEditable(parent)) {
            res = true;
            break;
          }
          parent = parent.parentNode;
        }
      }
    }
  }
  return !!res;
};

/**
 * is namespace declared
 * @param {string} ns - namespace
 * @param {object} node - Element node
 * @returns {boolean} - result
 */
export const isNamespaceDeclared = (ns = '', node = {}) => {
  let res;
  if (ns && typeof ns === 'string' && node.nodeType === ELEMENT_NODE) {
    const attr = `xmlns:${ns}`;
    const root = node.ownerDocument.documentElement;
    let parent = node;
    while (parent) {
      if (typeof parent.hasAttribute === 'function' &&
          parent.hasAttribute(attr)) {
        res = true;
        break;
      } else if (parent === root) {
        break;
      }
      parent = parent.parentNode;
    }
  }
  return !!res;
};

/**
 * node is same or descendant of the root node
 * @param {object} node - Element node
 * @param {object} root - Document, DocumentFragment, Element node
 * @returns {boolean} - result
 */
export const isDescendant = (node = {}, root = {}) => {
  const { nodeType, ownerDocument } = node;
  let res;
  if (nodeType === ELEMENT_NODE && ownerDocument) {
    if (!root || root.nodeType !== ELEMENT_NODE) {
      root = ownerDocument;
    }
    if (node === root) {
      res = true;
    } else if (root) {
      res = root.compareDocumentPosition(node) & DOCUMENT_POSITION_CONTAINED_BY;
    }
  }
  return !!res;
};

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
 * parse AST name
 * @param {string} name - AST name
 * @param {object} [node] - Element node
 * @returns {object} - parsed AST name
 */
export const parseASTName = (name, node) => {
  let astPrefix, astNodeName;
  if (name && typeof name === 'string') {
    if (/\|/.test(name)) {
      [astPrefix, astNodeName] = name.split('|');
      if (astPrefix && astPrefix !== '*' &&
          node && !isNamespaceDeclared(astPrefix, node)) {
        throw new DOMException(`invalid selector ${name}`, 'SyntaxError');
      }
    } else {
      astPrefix = '*';
      astNodeName = name;
    }
  } else {
    throw new DOMException(`invalid selector ${name}`, 'SyntaxError');
  }
  return {
    astNodeName,
    astPrefix
  };
};

/**
 * Matcher
 * NOTE: #list[i] corresponds to #matrix[i]
 * #list: [
 *   {
 *     branch: branch[],
 *     skip: boolean
 *   },
 *   {
 *     branch: branch[],
 *     skip: boolean
 *   }
 * ]
 * #matrix: [
 *   [
 *     Set([node, node]),
 *     Set([node, node, node]
 *     Set([node, node])
 *   ],
 *   [
 *     Set([node, node, node]),
 *     Set([node, node])
 *   ]
 * ]
 * branch[]: [twig{}, twig{}]
 * twig{}: {
 *   combo: leaf{}|null,
 *   leaves: leaves[]
 * }
 * leaves[]: [leaf{}, leaf{}, leaf{}]
 * leaf{}: AST leaf
 * node: Element node
 */
export class Matcher {
  /* private fields */
  #list;
  #matrix;
  #node;
  #root;
  #selector;
  #sort;
  #warn;

  /**
   * construct
   * @param {string} selector - CSS selector
   * @param {object} node - Document, DocumentFragment, Element node
   * @param {object} [opt] - options
   * @param {boolean} [opt.sort] - sort results of querySelectorAll()
   * @param {boolean} [opt.warn] - console warn
   */
  constructor(selector, node, opt = {}) {
    const { sort, warn } = opt;
    this.#node = node;
    this.#root = this._getRoot(node);
    this.#selector = selector;
    this.#sort = !!sort;
    this.#warn = !!warn;
    this._prepare(selector);
  }

  /**
   * handle error
   * @param {Error} e - Error
   * @throws Error
   * @returns {void}
   */
  _onError(e) {
    if (e instanceof DOMException && e.name === 'NotSupportedError') {
      if (this.#warn) {
        console.warn(e.message);
      }
    } else {
      throw e;
    }
  }

  /**
   * get root
   * @param {object} node - Document, DocumentFragment, Element node
   * @returns {object} - root object
   */
  _getRoot(node = this.#node) {
    let document;
    let root;
    switch (node.nodeType) {
      case DOCUMENT_NODE: {
        document = node;
        root = node;
        break;
      }
      case DOCUMENT_FRAGMENT_NODE: {
        document = node.ownerDocument;
        root = node;
        break;
      }
      default: {
        if (isDescendant(node)) {
          document = node.ownerDocument;
          root = node.ownerDocument;
        } else {
          let parent = node;
          while (parent) {
            if (parent.parentNode) {
              parent = parent.parentNode;
            } else {
              break;
            }
          }
          document = parent.ownerDocument;
          root = parent;
        }
      }
    }
    return {
      document,
      root
    };
  }

  /**
   * sort AST leaves
   * @param {object} leaves - leaves
   * @returns {Array} - sorted leaves
   */
  _sortLeaves(leaves) {
    const arr = [...leaves];
    if (arr.length > 1) {
      const bitMap = new Map([
        [ATTRIBUTE_SELECTOR, BIT_ATTRIBUTE_SELECTOR],
        [CLASS_SELECTOR, BIT_CLASS_SELECTOR],
        [ID_SELECTOR, BIT_ID_SELECTOR],
        [PSEUDO_CLASS_SELECTOR, BIT_PSEUDO_CLASS_SELECTOR],
        [PSEUDO_ELEMENT_SELECTOR, BIT_PSEUDO_ELEMENT_SELECTOR],
        [TYPE_SELECTOR, BIT_TYPE_SELECTOR]
      ]);
      arr.sort((a, b) => {
        const { type: typeA } = a;
        const { type: typeB } = b;
        const bitA = bitMap.get(typeA);
        const bitB = bitMap.get(typeB);
        let res;
        if (bitA === bitB) {
          res = 0;
        } else if (bitA > bitB) {
          res = 1;
        } else {
          res = -1;
        }
        return res;
      });
    }
    return arr;
  }

  /**
   * prepare list and matrix
   * @param {string} selector - CSS selector
   * @returns {Array} - list and matrix
   */
  _prepare(selector = this.#selector) {
    const ast = parseSelector(selector);
    const branches = walkAST(ast).values();
    this.#list = [];
    this.#matrix = [];
    let i = 0;
    for (const branchItem of branches) {
      const [...items] = branchItem;
      const branch = [];
      let item = items.shift();
      if (item && item.type !== COMBINATOR) {
        const leaves = new Set();
        while (item) {
          if (item.type === COMBINATOR) {
            const [nextItem] = items;
            if (nextItem.type === COMBINATOR) {
              const msg = `invalid combinator, ${item.name}${nextItem.name}`;
              throw new DOMException(msg, 'SyntaxError');
            }
            branch.push({
              combo: item,
              leaves: this._sortLeaves(leaves)
            });
            leaves.clear();
          } else if (item) {
            leaves.add(item);
          }
          if (items.length) {
            item = items.shift();
          } else {
            branch.push({
              combo: null,
              leaves: this._sortLeaves(leaves)
            });
            leaves.clear();
            break;
          }
        }
      }
      const branchLen = branch.length;
      this.#matrix[i] = [];
      for (let j = 0; j < branchLen; j++) {
        this.#matrix[i][j] = new Set();
      }
      this.#list.push({
        branch,
        skip: false
      });
      i++;
    }
    return [
      this.#list,
      this.#matrix
    ];
  }

  /**
   * collect nth child
   * @param {object} anb - An+B options
   * @param {number} anb.a - a
   * @param {number} anb.b - b
   * @param {boolean} [anb.reverse] - reverse order
   * @param {object} [anb.selector] - AST
   * @param {object} node - Element node
   * @returns {object} - collection of matched nodes
   */
  _collectNthChild(anb, node) {
    const { a, b, reverse, selector } = anb;
    const { parentNode } = node;
    const selectorNodes = new Set();
    if (selector) {
      const branches = walkAST(selector);
      const branchLen = branches.length;
      const iterator = [...parentNode.children].values();
      for (const refNode of iterator) {
        let bool;
        for (let i = 0; i < branchLen; i++) {
          const leaves = branches[i];
          bool = this._matchLeaves(leaves, refNode);
          if (!bool) {
            break;
          }
        }
        if (bool) {
          selectorNodes.add(refNode);
        }
      }
    }
    const arr = [...parentNode.children];
    if (reverse) {
      arr.reverse();
    }
    const l = arr.length;
    const matched = new Set();
    // :first-child, :last-child, :nth-child(0 of S)
    if (a === 0) {
      if (b > 0 && b <= l) {
        if (selectorNodes.size) {
          for (let i = 0; i < l; i++) {
            const current = arr[i];
            if (selectorNodes.has(current)) {
              matched.add(current);
              break;
            }
          }
        } else {
          const current = arr[b - 1];
          matched.add(current);
        }
      }
    // :nth-child()
    } else {
      let n = 0;
      let nth = b - 1;
      if (a > 0) {
        while (nth < 0) {
          nth += (++n * a);
        }
      }
      if (nth >= 0 && nth < l) {
        let j = a > 0 ? 0 : b - 1;
        for (let i = 0; i < l && nth >= 0 && nth < l; i++) {
          const current = arr[i];
          if (selectorNodes.size) {
            if (selectorNodes.has(current)) {
              if (j === nth) {
                matched.add(current);
                nth += a;
              }
              if (a > 0) {
                j++;
              } else {
                j--;
              }
            }
          } else if (i === nth) {
            matched.add(current);
            nth += a;
          }
        }
      }
    }
    return matched;
  }

  /**
   * collect nth of type
   * @param {object} anb - An+B options
   * @param {number} anb.a - a
   * @param {number} anb.b - b
   * @param {boolean} [anb.reverse] - reverse order
   * @param {object} node - Element node
   * @returns {object} - collection of matched nodes
   */
  _collectNthOfType(anb, node) {
    const { a, b, reverse } = anb;
    const { localName, parentNode, prefix } = node;
    const arr = [...parentNode.children];
    if (reverse) {
      arr.reverse();
    }
    const l = arr.length;
    const matched = new Set();
    // :first-of-type, :last-of-type
    if (a === 0) {
      if (b > 0 && b <= l) {
        let j = 0;
        for (let i = 0; i < l; i++) {
          const current = arr[i];
          const { localName: itemLocalName, prefix: itemPrefix } = current;
          if (itemLocalName === localName && itemPrefix === prefix) {
            if (j === b - 1) {
              matched.add(current);
              break;
            }
            j++;
          }
        }
      }
    // :nth-of-type()
    } else {
      let nth = b - 1;
      if (a > 0) {
        while (nth < 0) {
          nth += a;
        }
      }
      if (nth >= 0 && nth < l) {
        let j = a > 0 ? 0 : b - 1;
        for (let i = 0; i < l; i++) {
          const current = arr[i];
          const { localName: itemLocalName, prefix: itemPrefix } = current;
          if (itemLocalName === localName && itemPrefix === prefix) {
            if (j === nth) {
              matched.add(current);
              nth += a;
            }
            if (nth < 0 || nth >= l) {
              break;
            } else if (a > 0) {
              j++;
            } else {
              j--;
            }
          }
        }
      }
    }
    return matched;
  }

  /**
   * match An+B
   * @param {object} ast - AST
   * @param {object} node - Element node
   * @param {string} nthName - nth pseudo-class name
   * @returns {object} - collection of matched nodes
   */
  _matchAnPlusB(ast, node, nthName) {
    const {
      nth: {
        a,
        b,
        name: nthIdentName
      },
      selector
    } = ast;
    const identName = unescapeSelector(nthIdentName);
    const anbMap = new Map();
    if (identName) {
      if (identName === 'even') {
        anbMap.set('a', 2);
        anbMap.set('b', 0);
      } else if (identName === 'odd') {
        anbMap.set('a', 2);
        anbMap.set('b', 1);
      }
      if (/last/.test(nthName)) {
        anbMap.set('reverse', true);
      }
    } else {
      if (typeof a === 'string' && /-?\d+/.test(a)) {
        anbMap.set('a', a * 1);
      } else {
        anbMap.set('a', 0);
      }
      if (typeof b === 'string' && /-?\d+/.test(b)) {
        anbMap.set('b', b * 1);
      } else {
        anbMap.set('b', 0);
      }
      if (/last/.test(nthName)) {
        anbMap.set('reverse', true);
      }
    }
    let matched = new Set();
    if (anbMap.has('a') && anbMap.has('b') && node.parentNode) {
      if (/^nth-(?:last-)?child$/.test(nthName)) {
        if (selector) {
          anbMap.set('selector', selector);
        }
        const anb = Object.fromEntries(anbMap);
        const nodes = this._collectNthChild(anb, node);
        if (nodes.size) {
          matched = nodes;
        }
      } else if (/^nth-(?:last-)?of-type$/.test(nthName)) {
        const anb = Object.fromEntries(anbMap);
        const nodes = this._collectNthOfType(anb, node);
        if (nodes.size) {
          matched = nodes;
        }
      }
    }
    return matched;
  }

  /**
   * match directionality pseudo-class - :dir()
   * @see https://html.spec.whatwg.org/multipage/dom.html#the-dir-attribute
   * @param {object} ast - AST
   * @param {object} node - Element node
   * @returns {?object} - matched node
   */
  _matchDirectionPseudoClass(ast, node) {
    const { dir: nodeDir, localName, type: inputType } = node;
    let res;
    if (isDescendant(node)) {
      const astName = unescapeSelector(ast.name);
      const { document } = this.#root;
      let dir;
      if (/^(?:ltr|rtl)$/.test(nodeDir)) {
        dir = nodeDir;
      } else if ((node === document.documentElement ||
                  (localName === 'input' && inputType === 'tel')) &&
                 !(nodeDir && DIR_VALUE.test(nodeDir))) {
        dir = 'ltr';
      // FIXME:
      } else if (nodeDir === 'auto' &&
                 (localName === 'textarea' ||
                  (localName === 'input' &&
                   (!inputType ||
                    /^(?:(?:emai|te|ur)l|search|text)$/.test(inputType))))) {
        throw new DOMException('Unsupported pseudo-class :dir()',
          'NotSupportedError');
      // FIXME:
      } else if (nodeDir === 'auto' || (localName === 'bdi' && !nodeDir)) {
        throw new DOMException('Unsupported pseudo-class :dir()',
          'NotSupportedError');
      } else if (!nodeDir) {
        let parent = node.parentNode;
        while (parent) {
          const { dir: parentDir } = parent;
          if (parent === document.documentElement) {
            if (parentDir) {
              dir = parentDir;
            } else {
              dir = 'ltr';
            }
            break;
          } else if (parentDir && /^(?:ltr|rtl)$/.test(parentDir)) {
            dir = parentDir;
            break;
          }
          parent = parent.parentNode;
        }
      }
      if (dir === astName) {
        res = node;
      }
    }
    return res ?? null;
  }

  /**
   * match language pseudo-class - :lang()
   * @see https://datatracker.ietf.org/doc/html/rfc4647#section-3.3.1
   * @param {object} ast - AST
   * @param {object} node - Element node
   * @returns {?object} - matched node
   */
  _matchLanguagePseudoClass(ast, node) {
    const { lang } = node;
    const astName = unescapeSelector(ast.name);
    let res;
    // TBD: what about xml:lang?
    if (astName === '') {
      if (node.getAttribute('lang') === '') {
        res = node;
      }
    } else if (astName === '*') {
      if (!node.hasAttribute('lang')) {
        res = node;
      }
    } else if (/[A-Za-z\d-]+/.test(astName)) {
      const codePart = '(?:-[A-Za-z\\d]+)?';
      let reg;
      if (/-/.test(astName)) {
        const [langMain, langSub, ...langRest] = astName.split('-');
        const extendedMain = `${langMain}${codePart}`;
        const extendedSub = `-${langSub}${codePart}`;
        const len = langRest.length;
        let extendedRest = '';
        if (len) {
          for (let i = 0; i < len; i++) {
            extendedRest += `-${langRest[i]}${codePart}`;
          }
        }
        reg = new RegExp(`^${extendedMain}${extendedSub}${extendedRest}$`, 'i');
      } else {
        reg = new RegExp(`^${astName}${codePart}$`, 'i');
      }
      if (lang) {
        if (reg.test(lang)) {
          res = node;
        }
      } else {
        let target = node;
        while (target.parentNode) {
          if (reg.test(target.lang)) {
            res = node;
            break;
          }
          target = target.parentNode;
        }
      }
    }
    return res ?? null;
  }

  /**
   * match logical pseudo-class functions - :has(), :is(), :not(), :where()
   * @param {object} ast - AST
   * @param {object} node - Element node
   * @returns {?object} - matched node
   */
  _matchLogicalPseudoFunc(ast, node) {
    const branches = walkAST(ast);
    const branchLen = branches.length;
    const branchSelectors = [];
    for (let i = 0; i < branchLen; i++) {
      const leaves = branches[i].values();
      for (const leaf of leaves) {
        const css = generateCSS(leaf);
        branchSelectors.push(css);
      }
    }
    const branchSelector = branchSelectors.join(',');
    const astName = unescapeSelector(ast.name);
    let res;
    if (astName === 'has') {
      if (branchSelector.includes(':has(')) {
        res = null;
      } else {
        let bool;
        for (let i = 0; i < branchLen; i++) {
          const leaves = branches[i];
          const [leaf] = leaves;
          const { type: leafType } = leaf;
          let combo;
          if (leafType === COMBINATOR) {
            combo = leaves.shift();
          } else {
            combo = {
              name: ' ',
              type: COMBINATOR
            };
          }
          const twig = {
            combo,
            leaves
          };
          const nodes = this._matchTwig(twig, node, {
            find: 'next'
          });
          if (nodes.size) {
            bool = true;
            break;
          }
        }
        if (bool) {
          res = node;
        }
      }
    // NOTE: according to MDN, :not() can not contain :not()
    // but spec says nothing about that?
    } else if (astName === 'not' && branchSelector.includes(':not(')) {
      res = null;
    } else {
      let bool;
      for (let i = 0; i < branchLen; i++) {
        const leaves = branches[i];
        bool = this._matchLeaves(leaves, node);
        if (bool) {
          break;
        }
      }
      if (astName === 'not') {
        if (!bool) {
          res = node;
        }
      } else if (bool) {
        res = node;
      }
    }
    return res ?? null;
  }

  /**
   * match pseudo-class selector
   * @see https://html.spec.whatwg.org/#pseudo-classes
   * @param {object} ast - AST
   * @param {object} node - Element node
   * @returns {object} - collection of matched nodes
   */
  _matchPseudoClassSelector(ast, node) {
    const { children: astChildren } = ast;
    const { localName, parentNode } = node;
    const astName = unescapeSelector(ast.name);
    let matched = new Set();
    // :has(), :is(), :not(), :where()
    if (PSEUDO_FUNC.test(astName)) {
      const res = this._matchLogicalPseudoFunc(ast, node);
      if (res) {
        matched.add(res);
      }
    } else if (Array.isArray(astChildren)) {
      const [branch] = astChildren;
      // :nth-child(), :nth-last-child(), nth-of-type(), :nth-last-of-type()
      if (PSEUDO_NTH.test(astName)) {
        const nodes = this._matchAnPlusB(branch, node, astName);
        if (nodes.size) {
          matched = nodes;
        }
      // :dir()
      } else if (astName === 'dir') {
        const res = this._matchDirectionPseudoClass(branch, node);
        if (res) {
          matched.add(res);
        }
      // :lang()
      } else if (astName === 'lang') {
        const res = this._matchLanguagePseudoClass(branch, node);
        if (res) {
          matched.add(res);
        }
      } else {
        switch (astName) {
          case 'current':
          case 'nth-col':
          case 'nth-last-col':
            throw new DOMException(`Unsupported pseudo-class :${astName}()`,
              'NotSupportedError');
          default:
            throw new DOMException(`Unknown pseudo-class :${astName}()`,
              'SyntaxError');
        }
      }
    } else {
      const { document } = this.#root;
      const root = document.documentElement;
      const docURL = new URL(document.URL);
      switch (astName) {
        case 'any-link':
        case 'link': {
          if (/^a(?:rea)?$/.test(localName) && node.hasAttribute('href')) {
            matched.add(node);
          }
          break;
        }
        case 'local-link': {
          if (/^a(?:rea)?$/.test(localName) && node.hasAttribute('href')) {
            const attrURL = new URL(node.getAttribute('href'), docURL.href);
            if (attrURL.origin === docURL.origin &&
                attrURL.pathname === docURL.pathname) {
              matched.add(node);
            }
          }
          break;
        }
        case 'visited': {
          // prevent fingerprinting
          break;
        }
        case 'target': {
          if (isDescendant(node) && docURL.hash &&
              node.id && docURL.hash === `#${node.id}`) {
            matched.add(node);
          }
          break;
        }
        case 'target-within': {
          if (docURL.hash) {
            const hash = docURL.hash.replace(/^#/, '');
            let current = document.getElementById(hash);
            while (current) {
              if (current === node) {
                matched.add(node);
                break;
              }
              current = current.parentNode;
            }
          }
          break;
        }
        case 'scope': {
          if (this.#node.nodeType === ELEMENT_NODE) {
            if (node === this.#node) {
              matched.add(node);
            }
          } else if (node === root) {
            matched.add(node);
          }
          break;
        }
        case 'focus': {
          if (node === document.activeElement) {
            matched.add(node);
          }
          break;
        }
        case 'focus-within': {
          let current = document.activeElement;
          while (current) {
            if (current === node) {
              matched.add(node);
              break;
            }
            current = current.parentNode;
          }
          break;
        }
        case 'open': {
          if (HTML_INTERACT.test(localName) && node.hasAttribute('open')) {
            matched.add(node);
          }
          break;
        }
        case 'closed': {
          if (HTML_INTERACT.test(localName) && !node.hasAttribute('open')) {
            matched.add(node);
          }
          break;
        }
        case 'disabled': {
          if (HTML_FORM_INPUT.test(localName) ||
              HTML_FORM_PARTS.test(localName) ||
              isCustomElementName(localName)) {
            if (node.disabled || node.hasAttribute('disabled')) {
              matched.add(node);
            } else {
              let parent = parentNode;
              while (parent) {
                if (parent.localName === 'fieldset') {
                  break;
                }
                parent = parent.parentNode;
              }
              if (parent && parent.hasAttribute('disabled') &&
                  parentNode.localName !== 'legend') {
                matched.add(node);
              }
            }
          }
          break;
        }
        case 'enabled': {
          if ((HTML_FORM_INPUT.test(localName) ||
               HTML_FORM_PARTS.test(localName) ||
               isCustomElementName(localName)) &&
              !(node.disabled && node.hasAttribute('disabled'))) {
            matched.add(node);
          }
          break;
        }
        case 'read-only': {
          if (/^(?:input|textarea)$/.test(localName)) {
            let targetNode;
            if (localName === 'input') {
              if (node.hasAttribute('type')) {
                const inputType = node.getAttribute('type');
                if (INPUT_TEXT.test(inputType)) {
                  targetNode = node;
                } else if (INPUT_RANGE.test(inputType) &&
                           inputType !== 'range') {
                  targetNode = node;
                }
              } else {
                targetNode = node;
              }
            } else if (localName === 'textarea') {
              targetNode = node;
            }
            if (targetNode) {
              if (node.readonly || node.hasAttribute('readonly') ||
                  node.disabled || node.hasAttribute('disabled')) {
                matched.add(node);
              }
            }
          } else if (!isContentEditable(node)) {
            matched.add(node);
          }
          break;
        }
        case 'read-write': {
          if (/^(?:input|textarea)$/.test(localName)) {
            let targetNode;
            if (localName === 'input') {
              if (node.hasAttribute('type')) {
                const inputType = node.getAttribute('type');
                if (INPUT_TEXT.test(inputType)) {
                  targetNode = node;
                } else if (INPUT_RANGE.test(inputType) &&
                           inputType !== 'range') {
                  targetNode = node;
                }
              } else {
                targetNode = node;
              }
            } else if (localName === 'textarea') {
              targetNode = node;
            }
            if (targetNode) {
              if (!(node.readonly || node.hasAttribute('readonly') ||
                    node.disabled || node.hasAttribute('disabled'))) {
                matched.add(node);
              }
            }
          } else if (isContentEditable(node)) {
            matched.add(node);
          }
          break;
        }
        case 'placeholder-shown': {
          let targetNode;
          if (localName === 'input') {
            if (node.hasAttribute('type')) {
              if (INPUT_TEXT.test(node.getAttribute('type')) ||
                  node.getAttribute('type') === 'number') {
                targetNode = node;
              }
            } else {
              targetNode = node;
            }
          } else if (localName === 'textarea') {
            targetNode = node;
          }
          if (targetNode && node.hasAttribute('placeholder') &&
              node.getAttribute('placeholder').trim().length &&
              node.value === '') {
            matched.add(node);
          }
          break;
        }
        case 'checked': {
          if ((localName === 'input' && node.hasAttribute('type') &&
               /^(?:checkbox|radio)$/.test(node.getAttribute('type')) &&
               node.checked) ||
              (localName === 'option' && node.selected)) {
            matched.add(node);
          }
          break;
        }
        case 'indeterminate': {
          if ((localName === 'input' && node.type === 'checkbox' &&
               node.indeterminate) ||
              (localName === 'progress' && !node.hasAttribute('value'))) {
            matched.add(node);
          } else if (localName === 'input' && node.type === 'radio' &&
                     !node.hasAttribute('checked')) {
            const nodeName = node.name;
            let parent = node.parentNode;
            while (parent) {
              if (parent.localName === 'form') {
                break;
              }
              parent = parent.parentNode;
            }
            if (!parent) {
              parent = root;
            }
            const nodes = [...parent.getElementsByTagName('input')].values();
            let checked;
            for (const item of nodes) {
              if (item.getAttribute('type') === 'radio') {
                if (nodeName) {
                  if (item.getAttribute('name') === nodeName) {
                    checked = !!item.checked;
                  }
                } else if (!item.hasAttribute('name')) {
                  checked = !!item.checked;
                }
                if (checked) {
                  break;
                }
              }
            }
            if (!checked) {
              matched.add(node);
            }
          }
          break;
        }
        case 'default': {
          // button[type="submit"], input[type="submit"], input[type="image"]
          if ((localName === 'button' &&
               !(node.hasAttribute('type') &&
                 /^(?:button|reset)$/.test(node.getAttribute('type')))) ||
              (localName === 'input' && node.hasAttribute('type') &&
               /^(?:image|submit)$/.test(node.getAttribute('type')))) {
            let form = node.parentNode;
            while (form) {
              if (form.localName === 'form') {
                break;
              }
              form = form.parentNode;
            }
            if (form) {
              const iterator =
                document.createNodeIterator(form, FILTER_SHOW_ELEMENT);
              let nextNode = iterator.nextNode();
              while (nextNode) {
                const nodeName = nextNode.localName;
                let m;
                if (nodeName === 'button') {
                  m = !(nextNode.hasAttribute('type') &&
                    /^(?:button|reset)$/.test(nextNode.getAttribute('type')));
                } else if (nodeName === 'input') {
                  m = nextNode.hasAttribute('type') &&
                    /^(?:image|submit)$/.test(nextNode.getAttribute('type'));
                }
                if (m) {
                  if (nextNode === node) {
                    matched.add(node);
                  }
                  break;
                }
                nextNode = iterator.nextNode();
              }
            }
          // input[type="checkbox"], input[type="radio"]
          } else if (localName === 'input' && node.hasAttribute('type') &&
                     /^(?:checkbox|radio)$/.test(node.getAttribute('type')) &&
                     node.hasAttribute('checked')) {
            matched.add(node);
          // option
          } else if (localName === 'option') {
            let isMultiple = false;
            let parent = parentNode;
            while (parent) {
              if (parent.localName === 'datalist') {
                break;
              } else if (parent.localName === 'select') {
                isMultiple = !!parent.multiple;
                break;
              }
              parent = parent.parentNode;
            }
            // FIXME:
            if (isMultiple) {
              throw new DOMException(`Unsupported pseudo-class :${astName}`,
                'NotSupportedError');
            } else {
              const firstOpt = parentNode.firstElementChild;
              const defaultOpt = new Set();
              let opt = firstOpt;
              while (opt) {
                if (opt.hasAttribute('selected')) {
                  defaultOpt.add(opt);
                  break;
                }
                opt = opt.nextElementSibling;
              }
              if (!defaultOpt.size) {
                defaultOpt.add(firstOpt);
              }
              if (defaultOpt.has(node)) {
                matched.add(node);
              }
            }
          }
          break;
        }
        case 'valid': {
          if (HTML_FORM_INPUT.test(localName) ||
              /^(?:f(?:ieldset|orm)|button)$/.test(localName)) {
            if (node.checkValidity()) {
              matched.add(node);
            }
          }
          break;
        }
        case 'invalid': {
          if (HTML_FORM_INPUT.test(localName) ||
              /^(?:f(?:ieldset|orm)|button)$/.test(localName)) {
            if (!node.checkValidity()) {
              matched.add(node);
            }
          }
          break;
        }
        case 'in-range': {
          if (localName === 'input' &&
              !(node.readonly || node.hasAttribute('readonly')) &&
              !(node.disabled || node.hasAttribute('disabled')) &&
              node.hasAttribute('type') &&
              INPUT_RANGE.test(node.getAttribute('type')) &&
              !(node.validity.rangeUnderflow ||
                node.validity.rangeOverflow) &&
              (node.hasAttribute('min') || node.hasAttribute('max') ||
               node.getAttribute('type') === 'range')) {
            matched.add(node);
          }
          break;
        }
        case 'out-of-range': {
          if (localName === 'input' &&
              !(node.readonly || node.hasAttribute('readonly')) &&
              !(node.disabled || node.hasAttribute('disabled')) &&
              node.hasAttribute('type') &&
              INPUT_RANGE.test(node.getAttribute('type')) &&
              (node.validity.rangeUnderflow || node.validity.rangeOverflow)) {
            matched.add(node);
          }
          break;
        }
        case 'required': {
          let targetNode;
          if (localName === 'input') {
            if (node.hasAttribute('type')) {
              const inputType = node.getAttribute('type');
              if (INPUT_TEXT.test(inputType)) {
                targetNode = node;
              } else if (INPUT_RANGE.test(inputType) &&
                         inputType !== 'range') {
                targetNode = node;
              } else if (inputType === 'checkbox' || inputType === 'radio' ||
                         inputType === 'file') {
                targetNode = node;
              }
            } else {
              targetNode = node;
            }
          } else if (/^(?:select|textarea)$/.test(localName)) {
            targetNode = node;
          }
          if (targetNode && (node.required ||
              node.hasAttribute('required'))) {
            matched.add(node);
          }
          break;
        }
        case 'optional': {
          let targetNode;
          if (localName === 'input') {
            if (node.hasAttribute('type')) {
              const inputType = node.getAttribute('type');
              if (INPUT_TEXT.test(inputType)) {
                targetNode = node;
              } else if (INPUT_RANGE.test(inputType) &&
                         inputType !== 'range') {
                targetNode = node;
              } else if (inputType === 'checkbox' || inputType === 'radio' ||
                         inputType === 'file') {
                targetNode = node;
              }
            } else {
              targetNode = node;
            }
          } else if (/^(?:select|textarea)$/.test(localName)) {
            targetNode = node;
          }
          if (targetNode &&
              !(node.required || node.hasAttribute('required'))) {
            matched.add(node);
          }
          break;
        }
        case 'root': {
          if (node === root) {
            matched.add(node);
          }
          break;
        }
        case 'empty': {
          if (node.hasChildNodes()) {
            const nodes = node.childNodes.values();
            let bool;
            for (const n of nodes) {
              bool = n.nodeType !== ELEMENT_NODE && n.nodeType !== TEXT_NODE;
              if (!bool) {
                break;
              }
            }
            if (bool) {
              matched.add(node);
            }
          } else {
            matched.add(node);
          }
          break;
        }
        case 'first-child': {
          if (parentNode && node === parentNode.firstElementChild) {
            matched.add(node);
          }
          break;
        }
        case 'last-child': {
          if (parentNode && node === parentNode.lastElementChild) {
            matched.add(node);
          }
          break;
        }
        case 'only-child': {
          if (parentNode && node === parentNode.firstElementChild &&
              node === parentNode.lastElementChild) {
            matched.add(node);
          }
          break;
        }
        case 'first-of-type': {
          if (parentNode) {
            const [node1] = this._collectNthOfType({
              a: 0,
              b: 1
            }, node);
            if (node1) {
              matched.add(node1);
            }
          }
          break;
        }
        case 'last-of-type': {
          if (parentNode) {
            const [node1] = this._collectNthOfType({
              a: 0,
              b: 1,
              reverse: true
            }, node);
            if (node1) {
              matched.add(node1);
            }
          }
          break;
        }
        case 'only-of-type': {
          if (parentNode) {
            const [node1] = this._collectNthOfType({
              a: 0,
              b: 1
            }, node);
            if (node1 === node) {
              const [node2] = this._collectNthOfType({
                a: 0,
                b: 1,
                reverse: true
              }, node);
              if (node2 === node) {
                matched.add(node);
              }
            }
          }
          break;
        }
        // legacy pseudo-elements
        case 'after':
        case 'before':
        case 'first-letter':
        case 'first-line': {
          throw new DOMException(`Unsupported pseudo-element ::${astName}`,
            'NotSupportedError');
        }
        case 'active':
        case 'autofill':
        case 'blank':
        case 'buffering':
        case 'current':
        case 'focus-visible':
        case 'fullscreen':
        case 'future':
        case 'hover':
        case 'modal':
        case 'muted':
        case 'past':
        case 'paused':
        case 'picture-in-picture':
        case 'playing':
        case 'seeking':
        case 'stalled':
        case 'user-invalid':
        case 'user-valid':
        case 'volume-locked':
        case '-webkit-autofill': {
          throw new DOMException(`Unsupported pseudo-class :${astName}`,
            'NotSupportedError');
        }
        default: {
          throw new DOMException(`Unknown pseudo-class :${astName}`,
            'SyntaxError');
        }
      }
    }
    return matched;
  }

  /**
   * match attribute selector
   * @param {object} ast - AST
   * @param {object} node - Element node
   * @returns {?object} - matched node
   */
  _matchAttributeSelector(ast, node) {
    const {
      flags: astFlags, matcher: astMatcher, name: astName, value: astValue
    } = ast;
    if (typeof astFlags === 'string' && !/^[is]$/i.test(astFlags)) {
      throw new DOMException('invalid attribute selector', 'SyntaxError');
    }
    const { attributes } = node;
    let res;
    if (attributes && attributes.length) {
      const { document } = this.#root;
      let caseInsensitive;
      if (document.contentType === 'text/html') {
        if (typeof astFlags === 'string' && /^s$/i.test(astFlags)) {
          caseInsensitive = false;
        } else {
          caseInsensitive = true;
        }
      } else if (typeof astFlags === 'string' && /^i$/i.test(astFlags)) {
        caseInsensitive = true;
      } else {
        caseInsensitive = false;
      }
      let { name: astAttrName } = astName;
      astAttrName = unescapeSelector(astAttrName);
      if (caseInsensitive) {
        astAttrName = astAttrName.toLowerCase();
      }
      const attrValues = new Set();
      // namespaced
      if (/\|/.test(astAttrName)) {
        const {
          astPrefix: astAttrPrefix, astNodeName: astAttrLocalName
        } = parseASTName(astAttrName);
        for (const attr of attributes) {
          let { name: itemName, value: itemValue } = attr;
          if (caseInsensitive) {
            itemName = itemName.toLowerCase();
            itemValue = itemValue.toLowerCase();
          }
          switch (astAttrPrefix) {
            case '': {
              if (astAttrLocalName === itemName) {
                attrValues.add(itemValue);
              }
              break;
            }
            case '*': {
              if (/:/.test(itemName)) {
                if (itemName.endsWith(`:${astAttrLocalName}`)) {
                  attrValues.add(itemValue);
                }
              } else if (astAttrLocalName === itemName) {
                attrValues.add(itemValue);
              }
              break;
            }
            default: {
              if (/:/.test(itemName)) {
                const [itemNamePrefix, itemNameLocalName] = itemName.split(':');
                if (astAttrPrefix === itemNamePrefix &&
                    astAttrLocalName === itemNameLocalName) {
                  attrValues.add(itemValue);
                }
              }
            }
          }
        }
      } else {
        for (const attr of attributes) {
          let { name: itemName, value: itemValue } = attr;
          if (caseInsensitive) {
            itemName = itemName.toLowerCase();
            itemValue = itemValue.toLowerCase();
          }
          if (/:/.test(itemName)) {
            const [, itemNameLocalName] = itemName.split(':');
            if (astAttrName === itemNameLocalName) {
              attrValues.add(itemValue);
            }
          } else if (astAttrName === itemName) {
            attrValues.add(itemValue);
          }
        }
      }
      if (attrValues.size) {
        const {
          name: astAttrIdentValue, value: astAttrStringValue
        } = astValue || {};
        let attrValue;
        if (astAttrIdentValue) {
          if (caseInsensitive) {
            attrValue = astAttrIdentValue.toLowerCase();
          } else {
            attrValue = astAttrIdentValue;
          }
        } else if (astAttrStringValue) {
          if (caseInsensitive) {
            attrValue = astAttrStringValue.toLowerCase();
          } else {
            attrValue = astAttrStringValue;
          }
        } else if (astAttrStringValue === '') {
          attrValue = astAttrStringValue;
        }
        switch (astMatcher) {
          case '=': {
            if (typeof attrValue === 'string' && attrValues.has(attrValue)) {
              res = node;
            }
            break;
          }
          case '~=': {
            if (attrValue && typeof attrValue === 'string') {
              for (const value of attrValues) {
                const item = new Set(value.split(/\s+/));
                if (item.has(attrValue)) {
                  res = node;
                  break;
                }
              }
            }
            break;
          }
          case '|=': {
            if (attrValue && typeof attrValue === 'string') {
              let item;
              for (const value of attrValues) {
                if (value === attrValue || value.startsWith(`${attrValue}-`)) {
                  item = value;
                  break;
                }
              }
              if (item) {
                res = node;
              }
            }
            break;
          }
          case '^=': {
            if (attrValue && typeof attrValue === 'string') {
              let item;
              for (const value of attrValues) {
                if (value.startsWith(`${attrValue}`)) {
                  item = value;
                  break;
                }
              }
              if (item) {
                res = node;
              }
            }
            break;
          }
          case '$=': {
            if (attrValue && typeof attrValue === 'string') {
              let item;
              for (const value of attrValues) {
                if (value.endsWith(`${attrValue}`)) {
                  item = value;
                  break;
                }
              }
              if (item) {
                res = node;
              }
            }
            break;
          }
          case '*=': {
            if (attrValue && typeof attrValue === 'string') {
              let item;
              for (const value of attrValues) {
                if (value.includes(`${attrValue}`)) {
                  item = value;
                  break;
                }
              }
              if (item) {
                res = node;
              }
            }
            break;
          }
          case null:
          default: {
            res = node;
          }
        }
      }
    }
    return res ?? null;
  }

  /**
   * match class selector
   * @param {object} ast - AST
   * @param {object} node - Element node
   * @returns {?object} - matched node
   */
  _matchClassSelector(ast, node) {
    const astName = unescapeSelector(ast.name);
    let res;
    if (node.classList.contains(astName)) {
      res = node;
    }
    return res ?? null;
  }

  /**
   * match ID selector
   * @param {object} ast - AST
   * @param {object} node - Element node
   * @returns {?object} - matched node
   */
  _matchIDSelector(ast, node) {
    const { id } = node;
    const astName = unescapeSelector(ast.name);
    let res;
    if (astName === id) {
      res = node;
    }
    return res ?? null;
  }

  /**
   * match pseudo-element selector
   * NOTE: throws DOMException
   * @param {object} ast - AST
   * @param {object} node - Element node
   * @returns {void}
   */
  _matchPseudoElementSelector(ast, node) {
    const astName = unescapeSelector(ast.name);
    switch (astName) {
      case 'after':
      case 'backdrop':
      case 'before':
      case 'cue':
      case 'cue-region':
      case 'first-letter':
      case 'first-line':
      case 'file-selector-button':
      case 'marker':
      case 'part':
      case 'placeholder':
      case 'selection':
      case 'slotted':
      case 'target-text': {
        throw new DOMException(`Unsupported pseudo-element ::${astName}`,
          'NotSupportedError');
      }
      default: {
        throw new DOMException(`Unknown pseudo-element ::${astName}`,
          'SyntaxError');
      }
    }
  }

  /**
   * match type selector
   * @param {object} ast - AST
   * @param {object} node - Element node
   * @returns {?object} - matched node
   */
  _matchTypeSelector(ast, node) {
    const astName = unescapeSelector(ast.name);
    const { localName, prefix } = node;
    const { document } = this.#root;
    let { astPrefix, astNodeName } = parseASTName(astName, node);
    if (document.contentType === 'text/html') {
      astPrefix = astPrefix.toLowerCase();
      astNodeName = astNodeName.toLowerCase();
    }
    let nodePrefix;
    let nodeName;
    // just in case that the namespaced content is parsed as text/html
    if (/:/.test(localName)) {
      [nodePrefix, nodeName] = localName.split(':');
    } else {
      nodePrefix = prefix || '';
      nodeName = localName;
    }
    let res;
    if (astPrefix === '' && nodePrefix === '') {
      if (node.namespaceURI === null &&
          (astNodeName === '*' || astNodeName === nodeName)) {
        res = node;
      }
    } else if (astPrefix === '*') {
      if (astNodeName === '*' || astNodeName === nodeName) {
        res = node;
      }
    } else if (astPrefix === nodePrefix) {
      if (astNodeName === '*' || astNodeName === nodeName) {
        res = node;
      }
    }
    return res ?? null;
  };

  /**
   * match selector
   * @param {object} ast - AST
   * @param {object} node - Document, DocumentFragment, Element node
   * @returns {object} - collection of matched nodes
   */
  _matchSelector(ast, node) {
    const { type } = ast;
    let matched = new Set();
    if (node.nodeType === ELEMENT_NODE) {
      switch (type) {
        case ATTRIBUTE_SELECTOR: {
          const res = this._matchAttributeSelector(ast, node);
          if (res) {
            matched.add(res);
          }
          break;
        }
        case CLASS_SELECTOR: {
          const res = this._matchClassSelector(ast, node);
          if (res) {
            matched.add(res);
          }
          break;
        }
        case ID_SELECTOR: {
          const res = this._matchIDSelector(ast, node);
          if (res) {
            matched.add(res);
          }
          break;
        }
        case PSEUDO_CLASS_SELECTOR: {
          const nodes = this._matchPseudoClassSelector(ast, node);
          if (nodes.size) {
            matched = nodes;
          }
          break;
        }
        case PSEUDO_ELEMENT_SELECTOR: {
          this._matchPseudoElementSelector(ast, node);
          break;
        }
        case TYPE_SELECTOR:
        default: {
          const res = this._matchTypeSelector(ast, node);
          if (res) {
            matched.add(res);
          }
        }
      }
    }
    return matched;
  }

  /**
   * match leaves
   * @param {Array} leaves - leaves
   * @param {object} node - node
   * @returns {boolean} - result
   */
  _matchLeaves(leaves, node) {
    const leafIterator = leaves.values();
    let bool;
    for (const leaf of leafIterator) {
      bool = this._matchSelector(leaf, node).has(node);
      if (!bool) {
        break;
      }
    }
    return !!bool;
  }

  /**
   * match twig
   * @param {object} twig - twig
   * @param {object} node - Element node
   * @param {object} [opt] - option
   * @param {string} [opt.find] - 'prev'|'next', which nodes to find
   * @returns {object} - collection of matched nodes
   */
  _matchTwig(twig, node, opt = {}) {
    const { combo, leaves } = twig;
    const { name: comboName } = combo;
    const { find } = opt;
    let matched = new Set();
    if (find === 'next') {
      switch (comboName) {
        case '+': {
          const refNode = node.nextElementSibling;
          if (refNode) {
            const bool = this._matchLeaves(leaves, refNode);
            if (bool) {
              matched.add(refNode);
            }
          }
          break;
        }
        case '~': {
          let refNode = node.nextElementSibling;
          while (refNode) {
            const bool = this._matchLeaves(leaves, refNode);
            if (bool) {
              matched.add(refNode);
            }
            refNode = refNode.nextElementSibling;
          }
          break;
        }
        case '>': {
          const iterator = [...node.children].values();
          for (const refNode of iterator) {
            const bool = this._matchLeaves(leaves, refNode);
            if (bool) {
              matched.add(refNode);
            }
          }
          break;
        }
        case ' ':
        default: {
          const { document } = this.#root;
          const iterator =
            document.createNodeIterator(node, FILTER_SHOW_ELEMENT);
          let refNode = iterator.nextNode();
          while (refNode) {
            const bool = this._matchLeaves(leaves, refNode);
            if (bool) {
              matched.add(refNode);
            }
            refNode = iterator.nextNode();
          }
        }
      }
    } else {
      switch (comboName) {
        case '+': {
          const refNode = node.previousElementSibling;
          if (refNode) {
            const bool = this._matchLeaves(leaves, refNode);
            if (bool) {
              matched.add(refNode);
            }
          }
          break;
        }
        case '~': {
          const arr = [];
          let refNode = node.previousElementSibling;
          while (refNode) {
            const bool = this._matchLeaves(leaves, refNode);
            if (bool) {
              arr.push(refNode);
            }
            refNode = refNode.previousElementSibling;
          }
          if (arr.length) {
            matched = new Set(arr.reverse());
          }
          break;
        }
        case '>': {
          const refNode = node.parentNode;
          if (refNode) {
            const bool = this._matchLeaves(leaves, refNode);
            if (bool) {
              matched.add(refNode);
            }
          }
          break;
        }
        case ' ':
        default: {
          const arr = [];
          let refNode = node.parentNode;
          while (refNode) {
            const bool = this._matchLeaves(leaves, refNode);
            if (bool) {
              arr.push(refNode);
            }
            refNode = refNode.parentNode;
          }
          if (arr.length) {
            matched = new Set(arr.reverse());
          }
        }
      }
    }
    return matched;
  }

  /**
   * match combinator
   * @param {object} combo - combinator
   * @param {object} prevNodes - collection of Element nodes
   * @param {object} nextNodes - collection of Element nodes
   * @returns {object} - collection of matched nodes
   */
  _matchCombo(combo, prevNodes, nextNodes) {
    const { name: comboName } = combo;
    const matched = new Set();
    for (const node of nextNodes) {
      const { parentNode, previousElementSibling } = node;
      switch (comboName) {
        case '+': {
          const refNode = previousElementSibling;
          if (refNode && prevNodes.has(refNode)) {
            matched.add(node);
          }
          break;
        }
        case '~': {
          let refNode = previousElementSibling;
          while (refNode) {
            if (refNode && prevNodes.has(refNode)) {
              matched.add(node);
              break;
            }
            refNode = refNode.previousElementSibling;
          }
          break;
        }
        case '>': {
          const refNode = parentNode;
          if (refNode && prevNodes.has(refNode)) {
            matched.add(node);
          }
          break;
        }
        case ' ':
        default: {
          let refNode = parentNode;
          while (refNode) {
            if (refNode && prevNodes.has(refNode)) {
              matched.add(node);
              break;
            }
            refNode = refNode.parentNode;
          }
        }
      }
    }
    return matched;
  }

  /**
   * find nodes
   * @param {object} twig - twig
   * @param {string} range - target range
   * @returns {object} - result
   */
  _findNodes(twig, range) {
    const { leaves: [leaf, ...items] } = twig;
    const len = items.length;
    const { type: leafType } = leaf;
    const leafName = unescapeSelector(leaf.name);
    const { document, root } = this.#root;
    let nodes = new Set();
    let pending = false;
    switch (leafType) {
      case ID_SELECTOR: {
        let node;
        if (range === 'self') {
          const bool = this._matchLeaves([leaf], this.#node);
          if (bool) {
            node = this.#node;
          }
        } else if (range === 'lineal') {
          let refNode = this.#node;
          while (refNode) {
            const bool = this._matchLeaves([leaf], refNode);
            if (bool) {
              node = refNode;
              break;
            }
            refNode = refNode.parentNode;
          }
        } else if (root.nodeType === ELEMENT_NODE) {
          pending = true;
        } else {
          node = root.getElementById(leafName);
        }
        if (node) {
          if (len) {
            const bool = this._matchLeaves(items, node);
            if (bool) {
              nodes.add(node);
            }
          } else {
            nodes.add(node);
          }
        }
        break;
      }
      case CLASS_SELECTOR: {
        const arr = [];
        if (range === 'self') {
          if (this.#node.nodeType === ELEMENT_NODE &&
              this.#node.classList.contains(leafName)) {
            arr.push(this.#node);
          }
        } else if (range === 'lineal') {
          let refNode = this.#node;
          while (refNode) {
            if (refNode.nodeType === ELEMENT_NODE) {
              if (refNode.classList.contains(leafName)) {
                arr.push(refNode);
              }
              refNode = refNode.parentNode;
            } else {
              break;
            }
          }
        } else if (root.nodeType === DOCUMENT_FRAGMENT_NODE) {
          const walker = document.createTreeWalker(root, FILTER_SHOW_ELEMENT);
          let nextNode = walker.firstChild();
          while (nextNode) {
            if (nextNode.classList.contains(leafName)) {
              arr.push(nextNode);
            }
            const a = [...nextNode.getElementsByClassName(leafName)];
            arr.push(...a);
            nextNode = walker.nextSibling();
          }
        } else {
          if (root.nodeType === ELEMENT_NODE &&
              root.classList.contains(leafName)) {
            arr.push(root);
          }
          const a = [...root.getElementsByClassName(leafName)];
          arr.push(...a);
        }
        if (arr.length) {
          if (len) {
            const iterator = arr.values();
            for (const node of iterator) {
              const bool = this._matchLeaves(items, node);
              if (bool) {
                nodes.add(node);
              }
            }
          } else {
            nodes = new Set(arr);
          }
        }
        break;
      }
      case TYPE_SELECTOR: {
        if (document.contentType !== 'text/html' || /[*|]/.test(leafName)) {
          pending = true;
        } else {
          const tagName = leafName.toLowerCase();
          const arr = [];
          if (range === 'self') {
            const bool = this.#node.nodeType === ELEMENT_NODE &&
                         this._matchLeaves([leaf], this.#node);
            if (bool) {
              arr.push(this.#node);
            }
          } else if (range === 'lineal') {
            let refNode = this.#node;
            while (refNode) {
              if (refNode.nodeType === ELEMENT_NODE) {
                const bool = this._matchLeaves([leaf], refNode);
                if (bool) {
                  arr.push(refNode);
                }
                refNode = refNode.parentNode;
              } else {
                break;
              }
            }
          } else if (root.nodeType === DOCUMENT_NODE) {
            const a = xpath.select(`//*[local-name()='${tagName}']`, root);
            arr.push(...a);
          } else if (root.nodeType === DOCUMENT_FRAGMENT_NODE) {
            const walker = document.createTreeWalker(root, FILTER_SHOW_ELEMENT);
            let nextNode = walker.firstChild();
            while (nextNode) {
              if (nextNode.localName === tagName) {
                arr.push(nextNode);
              }
              const a = [...nextNode.getElementsByTagName(leafName)];
              arr.push(...a);
              nextNode = walker.nextSibling();
            }
          } else {
            if (root.nodeType === ELEMENT_NODE &&
                root.localName === tagName) {
              arr.push(root);
            }
            const a = [...root.getElementsByTagName(leafName)];
            arr.push(...a);
          }
          if (arr.length) {
            if (len) {
              const iterator = arr.values();
              for (const node of iterator) {
                const bool = this._matchLeaves(items, node);
                if (bool) {
                  nodes.add(node);
                }
              }
            } else {
              nodes = new Set(arr);
            }
          }
        }
        break;
      }
      case PSEUDO_ELEMENT_SELECTOR: {
        break;
      }
      default: {
        const arr = [];
        if (range === 'self') {
          const bool = this._matchLeaves([leaf], this.#node);
          if (bool) {
            arr.push(this.#node);
          }
        } else if (range === 'lineal') {
          let refNode = this.#node;
          while (refNode) {
            const bool = this._matchLeaves([leaf], refNode); ;
            if (bool) {
              arr.push(refNode);
            }
            refNode = refNode.parentNode;
          }
        } else {
          pending = true;
        }
        if (arr.length) {
          if (len) {
            const iterator = arr.values();
            for (const node of iterator) {
              const bool = this._matchLeaves(items, node);
              if (bool) {
                nodes.add(node);
              }
            }
          } else {
            nodes = new Set(arr);
          }
        }
      }
    }
    return {
      nodes,
      pending
    };
  }

  /**
   * collect nodes
   * @param {string} range - target range
   * @returns {Array} - matrix
   */
  _collectNodes(range) {
    const pendingItems = new Set();
    const listIterator = this.#list.values();
    let i = 0;
    for (const list of listIterator) {
      const { branch } = list;
      const branchLen = branch.length;
      const lastIndex = branchLen - 1;
      if (range === 'all') {
        for (let j = 0; j < branchLen; j++) {
          const twig = branch[j];
          const { nodes, pending } =
            this._findNodes(twig, j === lastIndex ? range : null);
          if (nodes.size) {
            this.#matrix[i][j] = nodes;
          } else if (pending) {
            pendingItems.add(new Map([
              ['i', i],
              ['j', j],
              ['twig', twig]
            ]));
          } else {
            this.#list[i].skip = true;
          }
        }
      } else {
        const twig = branch[lastIndex];
        const { nodes, pending } = this._findNodes(twig, range);
        if (nodes.size) {
          this.#matrix[i][lastIndex] = nodes;
        } else if (pending) {
          pendingItems.add(new Map([
            ['i', i],
            ['j', lastIndex],
            ['twig', twig]
          ]));
        } else {
          this.#list[i].skip = true;
        }
      }
      i++;
    }
    if (pendingItems.size) {
      const { document, root } = this.#root;
      const iterator = document.createNodeIterator(root, FILTER_SHOW_ELEMENT);
      let nextNode = iterator.nextNode();
      while (nextNode) {
        let bool;
        if (range === 'self') {
          bool = nextNode === this.#node;
        } else if (range === 'lineal') {
          let refNode = this.#node;
          while (refNode) {
            bool = nextNode === refNode;
            if (bool) {
              break;
            }
            refNode = refNode.parentNode;
          }
        } else if (/^(?:all|first)$/.test(range)) {
          if (this.#node.nodeType === ELEMENT_NODE) {
            bool = isDescendant(nextNode, this.#node);
          } else {
            bool = true;
          }
        }
        if (bool) {
          for (const pendingItem of pendingItems) {
            const { leaves } = pendingItem.get('twig');
            const matched = this._matchLeaves(leaves, nextNode);
            if (matched) {
              const indexI = pendingItem.get('i');
              const indexJ = pendingItem.get('j');
              this.#matrix[indexI][indexJ].add(nextNode);
            }
          }
        }
        nextNode = iterator.nextNode();
      }
    }
    return [
      this.#list,
      this.#matrix
    ];
  }

  /**
   * match nodes
   * @param {string} range - target range
   * @returns {object} - collection of matched nodes
   */
  _matchNodes(range) {
    const [...branches] = this.#list;
    const l = branches.length;
    let nodes = new Set();
    for (let i = 0; i < l; i++) {
      const { branch, skip } = branches[i];
      const branchLen = branch.length;
      if (skip) {
        continue;
      } else if (branchLen) {
        const lastIndex = branchLen - 1;
        if (lastIndex === 0) {
          const matched = this.#matrix[i][0];
          if (/^(?:all|first)$/.test(range) &&
              this.#node.nodeType === ELEMENT_NODE) {
            for (const node of matched) {
              if (isDescendant(node, this.#node)) {
                nodes.add(node);
              }
            }
          } else {
            nodes = matched;
          }
        } else if (range === 'all') {
          let { combo } = branch[0];
          let prevNodes = this.#matrix[i][0];
          for (let j = 1; j < branchLen; j++) {
            const nextNodes = this.#matrix[i][j];
            const matched = this._matchCombo(combo, prevNodes, nextNodes);
            if (matched.size) {
              if (j === lastIndex) {
                if (this.#node.nodeType === ELEMENT_NODE) {
                  for (const node of matched) {
                    if (isDescendant(node, this.#node)) {
                      nodes.add(node);
                    }
                  }
                } else if (nodes.size) {
                  const arr = [...nodes].concat([...matched]);
                  nodes = new Set(arr);
                } else {
                  nodes = matched;
                }
              } else {
                const { combo: nextCombo } = branch[j];
                combo = nextCombo;
                prevNodes = matched;
              }
            } else {
              break;
            }
          }
        } else {
          const startNodes = this.#matrix[i][lastIndex];
          for (const node of startNodes) {
            let matched = new Set();
            let nextNodes = new Set([node]);
            for (let j = lastIndex - 1; j >= 0; j--) {
              const twig = branch[j];
              for (const nextNode of nextNodes) {
                matched = this._matchTwig(twig, nextNode, {
                  find: 'prev'
                });
              }
              if (matched.size) {
                if (j === 0) {
                  if (range === 'first' &&
                      this.#node.nodeType === ELEMENT_NODE) {
                    if (isDescendant(node, this.#node)) {
                      nodes.add(node);
                      break;
                    }
                  } else {
                    nodes.add(node);
                    break;
                  }
                } else {
                  nextNodes = matched;
                }
              } else {
                break;
              }
            }
            if (matched.size) {
              break;
            }
          }
        }
      }
    }
    return nodes;
  }

  /**
   * find matched nodes
   * @param {string} range - target range
   * @returns {object} - collection of matched nodes
   */
  _find(range) {
    this._collectNodes(range);
    const nodes = this._matchNodes(range);
    return nodes;
  }

  /**
   * sort nodes
   * @param {object} nodes - collection of nodes
   * @returns {Array} - collection of sorted nodes
   */
  _sortNodes(nodes) {
    const arr = [...nodes];
    if (arr.length > 1) {
      arr.sort((a, b) => {
        let res;
        const posBit = a.compareDocumentPosition(b);
        if (posBit & DOCUMENT_POSITION_PRECEDING ||
            posBit & DOCUMENT_POSITION_CONTAINS) {
          res = 1;
        } else {
          res = -1;
        }
        return res;
      });
    }
    return arr;
  }

  /**
   * matches
   * @returns {boolean} - `true` if matched `false` otherwise
   */
  matches() {
    let res;
    try {
      const nodes = this._find('self');
      res = nodes.has(this.#node);
    } catch (e) {
      this._onError(e);
    }
    return !!res;
  }

  /**
   * closest
   * @returns {?object} - matched node
   */
  closest() {
    let res;
    try {
      const nodes = this._find('lineal');
      let node = this.#node;
      while (node) {
        if (nodes.has(node)) {
          res = node;
          break;
        }
        node = node.parentNode;
      }
    } catch (e) {
      this._onError(e);
    }
    return res ?? null;
  }

  /**
   * query selector
   * @returns {?object} - matched node
   */
  querySelector() {
    let res;
    try {
      const nodes = this._find('first');
      nodes.delete(this.#node);
      if (nodes.size) {
        [res] = this._sortNodes(nodes);
      }
    } catch (e) {
      this._onError(e);
    }
    return res ?? null;
  }

  /**
   * query selector all
   * NOTE: returns Array, not NodeList
   * @returns {Array.<object|undefined>} - collection of matched nodes
   */
  querySelectorAll() {
    const res = [];
    try {
      const nodes = this._find('all');
      nodes.delete(this.#node);
      if (nodes.size > 1 && this.#sort) {
        res.push(...this._sortNodes(nodes));
      } else if (nodes.size) {
        res.push(...nodes);
      }
    } catch (e) {
      this._onError(e);
    }
    return res;
  }
};
