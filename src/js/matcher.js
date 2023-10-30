/**
 * matcher.js
 */

/* import */
import isCustomElementName from 'is-potential-custom-element-name';
import {
  getDirectionality, isContentEditable, isNamespaceDeclared, isSameOrDescendant,
  selectorToNodeProps
} from './dom-util.js';
import {
  generateCSS, parseSelector, unescapeSelector, walkAST
} from './parser.js';

/* constants */
import {
  ATTRIBUTE_SELECTOR, BIT_1, BIT_10, BIT_100, BIT_1000, BIT_10000, BIT_100000,
  CLASS_SELECTOR, COMBINATOR, DOCUMENT_FRAGMENT_NODE, DOCUMENT_NODE,
  DOCUMENT_POSITION_CONTAINS, DOCUMENT_POSITION_PRECEDING, ELEMENT_NODE,
  ID_SELECTOR, NOT_SUPPORTED_ERR, PSEUDO_CLASS_SELECTOR,
  PSEUDO_ELEMENT_SELECTOR, SHOW_ELEMENT, SYNTAX_ERR, TEXT_NODE, TYPE_SELECTOR
} from './constant.js';
const TARGET_ALL = 'all';
const TARGET_FIRST = 'first';
const TARGET_LINEAL = 'lineal';
const TARGET_SELF = 'self';

/* regexp */
const FORM_INPUT = /^(?:input|textarea)$/;
const FORM_PARTS =
  /^(?:(?:fieldse|inpu|selec)t|button|opt(?:group|ion)|textarea)$/;
const FORM_VALIDITY = /^(?:(?:(?:in|out)pu|selec)t|button|form|textarea)$/;
const HTML_ANCHOR = /^a(?:rea)?$/;
const HTML_INTERACT = /^d(?:etails|ialog)$/;
const INPUT_CHECK = /^(?:checkbox|radio)$/;
const INPUT_RANGE = /(?:(?:rang|tim)e|date(?:time-local)?|month|number|week)$/;
const INPUT_RESET = /^(?:button|reset)$/;
const INPUT_SUBMIT = /^(?:image|submit)$/;
const INPUT_TEXT = /^(?:(?:emai|te|ur)l|password|search|text)$/;
const PSEUDO_FUNC = /^(?:(?:ha|i)s|not|where)$/;
const PSEUDO_NTH = /^nth-(?:last-)?(?:child|of-type)$/;

/**
 * Matcher
 * NOTE: #ast[i] corresponds to #nodes[i]
 * #ast: [
 *   {
 *     branch: branch[],
 *     skip: boolean
 *   },
 *   {
 *     branch: branch[],
 *     skip: boolean
 *   }
 * ]
 * #nodes: [
 *   Set([node{}, node{}]),
 *   Set([node{}, node, node{}])
 * ]
 * branch[]: [twig{}, twig{}]
 * twig{}: {
 *   combo: leaf{}|null,
 *   leaves: leaves[]
 * }
 * leaves[]: [leaf{}, leaf{}, leaf{}]
 * leaf{}: AST leaf
 * node{}: Element node
 */
export class Matcher {
  /* private fields */
  #ast;
  #cache;
  #node;
  #nodes;
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
    this.#selector = selector;
    this.#node = node;
    [this.#ast, this.#nodes] = this._prepare(selector);
    this.#root = this._getRoot(node);
    this.#cache = new WeakMap();
    this.#sort = !!sort;
    this.#warn = !!warn;
  }

  /**
   * handle error
   * @param {Error} e - Error
   * @throws Error
   * @returns {void}
   */
  _onError(e) {
    if (e instanceof DOMException && e.name === NOT_SUPPORTED_ERR) {
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
      case ELEMENT_NODE: {
        if (isSameOrDescendant(node)) {
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
        break;
      }
      default: {
        throw new TypeError(`Unexpected node ${node.nodeName}`);
      }
    }
    return {
      document,
      root
    };
  }

  /**
   * sort AST leaves
   * @param {Array.<object>} leaves - AST leaves
   * @returns {Array.<object>} - sorted leaves
   */
  _sortLeaves(leaves) {
    const arr = [...leaves];
    if (arr.length > 1) {
      const bitMap = new Map([
        [ATTRIBUTE_SELECTOR, BIT_10000],
        [CLASS_SELECTOR, BIT_100],
        [ID_SELECTOR, BIT_10],
        [PSEUDO_CLASS_SELECTOR, BIT_100000],
        [PSEUDO_ELEMENT_SELECTOR, BIT_1],
        [TYPE_SELECTOR, BIT_1000]
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
   * prepare ast and nodes
   * @param {string} selector - CSS selector
   * @returns {Array.<Array.<object|undefined>>} - list and matrix
   */
  _prepare(selector = this.#selector) {
    const ast = parseSelector(selector);
    const branches = walkAST(ast);
    const tree = [];
    const nodes = [];
    let i = 0;
    for (const [...items] of branches) {
      const branch = [];
      let item = items.shift();
      if (item && item.type !== COMBINATOR) {
        const leaves = new Set();
        while (item) {
          if (item.type === COMBINATOR) {
            const [nextItem] = items;
            if (nextItem.type === COMBINATOR) {
              const msg = `Invalid combinator ${item.name}${nextItem.name}`;
              throw new DOMException(msg, SYNTAX_ERR);
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
      tree.push({
        branch,
        skip: false
      });
      nodes[i] = new Set();
      i++;
    }
    return [
      tree,
      nodes
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
    const matched = new Set();
    let selectorBranches;
    if (selector) {
      if (this.#cache.has(selector)) {
        selectorBranches = this.#cache.get(selector);
      } else {
        selectorBranches = walkAST(selector);
        this.#cache.set(selector, selectorBranches);
      }
    }
    if (parentNode) {
      const arr = [...parentNode.children];
      const l = arr.length;
      if (l) {
        const selectorNodes = new Set();
        if (selectorBranches) {
          const branchesLen = selectorBranches.length;
          for (const refNode of arr) {
            let bool;
            for (let i = 0; i < branchesLen; i++) {
              const leaves = selectorBranches[i];
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
        if (reverse) {
          arr.reverse();
        }
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
            } else if (!selector) {
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
                if (!selector) {
                  matched.add(current);
                }
                nth += a;
              }
            }
          }
        }
      }
    } else {
      const { root } = this.#root;
      if (root.nodeType === ELEMENT_NODE && node === root && (a + b) === 1) {
        if (selectorBranches) {
          const branchesLen = selectorBranches.length;
          let bool;
          for (let i = 0; i < branchesLen; i++) {
            const leaves = selectorBranches[i];
            bool = this._matchLeaves(leaves, node);
            if (bool) {
              break;
            }
          }
          if (bool) {
            matched.add(node);
          }
        } else {
          matched.add(node);
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
    const matched = new Set();
    if (parentNode) {
      const arr = [...parentNode.children];
      const l = arr.length;
      if (l) {
        if (reverse) {
          arr.reverse();
        }
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
      }
    } else {
      const { root } = this.#root;
      if (root.nodeType === ELEMENT_NODE && node === root && (a + b) === 1) {
        matched.add(node);
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
    if (anbMap.has('a') && anbMap.has('b')) {
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
   * match pseudo element selector
   * @param {string} astName - AST name
   * @param {object} opt - options
   * @throws {DOMException}
   * @returns {void}
   */
  _matchPseudoElementSelector(astName, opt = {}) {
    const { forgive } = opt;
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
        if (this.#warn) {
          throw new DOMException(`Unsupported pseudo-element ::${astName}`,
            NOT_SUPPORTED_ERR);
        }
        break;
      }
      default: {
        if (astName.startsWith('-webkit-')) {
          if (this.#warn) {
            throw new DOMException(`Unsupported pseudo-element ::${astName}`,
              NOT_SUPPORTED_ERR);
          }
        } else if (!forgive) {
          throw new DOMException(`Unknown pseudo-element ::${astName}`,
            SYNTAX_ERR);
        }
      }
    }
  }

  /**
   * match directionality pseudo-class - :dir()
   * @param {object} ast - AST
   * @param {object} node - Element node
   * @returns {?object} - matched node
   */
  _matchDirectionPseudoClass(ast, node) {
    const astName = unescapeSelector(ast.name);
    let dir;
    try {
      dir = getDirectionality(node);
    } catch (e) {
      if (this.#warn) {
        throw e;
      }
    }
    let res;
    if (dir === astName) {
      res = node;
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
    } else if (/[A-Z\d-]+/i.test(astName)) {
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
   * match :has() pseudo-class function
   * @param {Array.<object>} leaves - AST leaves
   * @param {object} node - Element node
   * @returns {boolean} - result
   */
  _matchHasPseudoFunc(leaves, node) {
    let bool;
    if (Array.isArray(leaves) && leaves.length) {
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
      const twigLeaves = [];
      while (leaves.length) {
        const [item] = leaves;
        const { type: itemType } = item;
        if (itemType === COMBINATOR) {
          break;
        } else {
          twigLeaves.push(leaves.shift());
        }
      }
      const twig = {
        combo,
        leaves: twigLeaves
      };
      const nodes = this._matchCombinator(twig, node, {
        find: 'next'
      });
      if (nodes.size) {
        if (leaves.length) {
          for (const nextNode of nodes) {
            bool =
              this._matchHasPseudoFunc(Object.assign([], leaves), nextNode);
            if (bool) {
              break;
            }
          }
        } else {
          bool = true;
        }
      }
    }
    return !!bool;
  }

  /**
   * match logical pseudo-class functions - :has(), :is(), :not(), :where()
   * @param {object} astData - AST data
   * @param {object} node - Element node
   * @returns {?object} - matched node
   */
  _matchLogicalPseudoFunc(astData, node) {
    const {
      astName = '', branches = [], selector = '', twigBranches = []
    } = astData;
    let res;
    if (astName === 'has') {
      if (selector.includes(':has(')) {
        res = null;
      } else {
        let bool;
        const l = branches.length;
        for (let i = 0; i < l; i++) {
          const leaves = branches[i];
          bool = this._matchHasPseudoFunc(Object.assign([], leaves), node);
          if (bool) {
            break;
          }
        }
        if (bool) {
          res = node;
        }
      }
    } else {
      const forgive = /^(?:is|where)$/.test(astName);
      let bool;
      const l = twigBranches.length;
      for (let i = 0; i < l; i++) {
        const branch = twigBranches[i];
        const lastIndex = branch.length - 1;
        const { leaves } = branch[lastIndex];
        bool = this._matchLeaves(leaves, node, {
          forgive
        });
        if (bool && lastIndex > 0) {
          let nextNodes = new Set([node]);
          for (let j = lastIndex - 1; j >= 0; j--) {
            const twig = branch[j];
            const arr = [];
            for (const nextNode of nextNodes) {
              const m = this._matchCombinator(twig, nextNode, {
                forgive,
                find: 'prev'
              });
              if (m.size) {
                arr.push(...m);
              }
            }
            const matchedNodes = new Set(arr);
            if (matchedNodes.size) {
              if (j === 0) {
                bool = true;
                break;
              } else {
                nextNodes = matchedNodes;
              }
            } else {
              bool = false;
              break;
            }
          }
        }
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
   * @param {object} opt - options
   * @returns {object} - collection of matched nodes
   */
  _matchPseudoClassSelector(ast, node, opt = {}) {
    const { children: astChildren } = ast;
    const { localName, parentNode } = node;
    const { forgive } = opt;
    const astName = unescapeSelector(ast.name);
    let matched = new Set();
    // :has(), :is(), :not(), :where()
    if (PSEUDO_FUNC.test(astName)) {
      let astData;
      if (this.#cache.has(ast)) {
        astData = this.#cache.get(ast);
      } else {
        const branches = walkAST(ast);
        const selectors = [];
        const twigBranches = [];
        for (const [...leaves] of branches) {
          for (const leaf of leaves) {
            const css = generateCSS(leaf);
            selectors.push(css);
          }
          const branch = [];
          const leavesSet = new Set();
          let item = leaves.shift();
          while (item) {
            if (item.type === COMBINATOR) {
              branch.push({
                combo: item,
                leaves: [...leavesSet]
              });
              leavesSet.clear();
            } else if (item) {
              leavesSet.add(item);
            }
            if (leaves.length) {
              item = leaves.shift();
            } else {
              branch.push({
                combo: null,
                leaves: [...leavesSet]
              });
              leavesSet.clear();
              break;
            }
          }
          twigBranches.push(branch);
        }
        astData = {
          astName,
          branches,
          twigBranches,
          selector: selectors.join(',')
        };
        this.#cache.set(ast, astData);
      }
      const res = this._matchLogicalPseudoFunc(astData, node);
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
          case 'nth-last-col': {
            if (this.#warn) {
              throw new DOMException(`Unsupported pseudo-class :${astName}()`,
                NOT_SUPPORTED_ERR);
            }
            break;
          }
          default: {
            if (!forgive) {
              throw new DOMException(`Unknown pseudo-class :${astName}()`,
                SYNTAX_ERR);
            }
          }
        }
      }
    } else {
      const { document, root } = this.#root;
      const { documentElement } = document;
      const docURL = new URL(document.URL);
      switch (astName) {
        case 'any-link':
        case 'link': {
          if (HTML_ANCHOR.test(localName) && node.hasAttribute('href')) {
            matched.add(node);
          }
          break;
        }
        case 'local-link': {
          if (HTML_ANCHOR.test(localName) && node.hasAttribute('href')) {
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
          if (isSameOrDescendant(node) && docURL.hash &&
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
          } else if (node === documentElement) {
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
          if (FORM_PARTS.test(localName) || isCustomElementName(localName)) {
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
          if ((FORM_PARTS.test(localName) || isCustomElementName(localName)) &&
              !(node.disabled && node.hasAttribute('disabled'))) {
            matched.add(node);
          }
          break;
        }
        case 'read-only': {
          if (FORM_INPUT.test(localName)) {
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
            } else {
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
          if (FORM_INPUT.test(localName)) {
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
            } else {
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
               INPUT_CHECK.test(node.getAttribute('type')) &&
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
              parent = documentElement;
            }
            const nodes = [...parent.getElementsByTagName('input')];
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
                 INPUT_RESET.test(node.getAttribute('type')))) ||
              (localName === 'input' && node.hasAttribute('type') &&
               INPUT_SUBMIT.test(node.getAttribute('type')))) {
            let form = node.parentNode;
            while (form) {
              if (form.localName === 'form') {
                break;
              }
              form = form.parentNode;
            }
            if (form) {
              const iterator = document.createNodeIterator(form, SHOW_ELEMENT);
              let nextNode = iterator.nextNode();
              while (nextNode) {
                const nodeName = nextNode.localName;
                let m;
                if (nodeName === 'button') {
                  m = !(nextNode.hasAttribute('type') &&
                    INPUT_RESET.test(nextNode.getAttribute('type')));
                } else if (nodeName === 'input') {
                  m = nextNode.hasAttribute('type') &&
                    INPUT_SUBMIT.test(nextNode.getAttribute('type'));
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
                     INPUT_CHECK.test(node.getAttribute('type')) &&
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
              if (this.#warn) {
                throw new DOMException(`Unsupported pseudo-class :${astName}`,
                  NOT_SUPPORTED_ERR);
              }
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
          if (FORM_VALIDITY.test(localName)) {
            if (node.checkValidity()) {
              matched.add(node);
            }
          } else if (/^fieldset$/.test(localName)) {
            const iterator = document.createNodeIterator(node, SHOW_ELEMENT);
            let refNode = iterator.nextNode();
            if (refNode === node) {
              refNode = iterator.nextNode();
            }
            let bool;
            while (refNode) {
              if (FORM_VALIDITY.test(refNode.localName)) {
                bool = refNode.checkValidity();
                if (!bool) {
                  break;
                }
              }
              refNode = iterator.nextNode();
            }
            if (bool) {
              matched.add(node);
            }
          }
          break;
        }
        case 'invalid': {
          if (FORM_VALIDITY.test(localName)) {
            if (!node.checkValidity()) {
              matched.add(node);
            }
          } else if (/^fieldset$/.test(localName)) {
            const iterator = document.createNodeIterator(node, SHOW_ELEMENT);
            let refNode = iterator.nextNode();
            if (refNode === node) {
              refNode = iterator.nextNode();
            }
            let bool;
            while (refNode) {
              if (FORM_VALIDITY.test(refNode.localName)) {
                bool = refNode.checkValidity();
                if (!bool) {
                  break;
                }
              }
              refNode = iterator.nextNode();
            }
            if (!bool) {
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
          if (node === documentElement) {
            matched.add(node);
          }
          break;
        }
        case 'empty': {
          if (node.hasChildNodes()) {
            const nodes = node.childNodes.values();
            let bool;
            for (const refNode of nodes) {
              bool = refNode.nodeType !== ELEMENT_NODE &&
                refNode.nodeType !== TEXT_NODE;
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
          if ((parentNode && node === parentNode.firstElementChild) ||
              (root.nodeType === ELEMENT_NODE && node === root)) {
            matched.add(node);
          }
          break;
        }
        case 'last-child': {
          if ((parentNode && node === parentNode.lastElementChild) ||
              (root.nodeType === ELEMENT_NODE && node === root)) {
            matched.add(node);
          }
          break;
        }
        case 'only-child': {
          if ((parentNode &&
               node === parentNode.firstElementChild &&
               node === parentNode.lastElementChild) ||
              (root.nodeType === ELEMENT_NODE && node === root)) {
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
          } else if (root.nodeType === ELEMENT_NODE && node === root) {
            matched.add(node);
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
          } else if (root.nodeType === ELEMENT_NODE && node === root) {
            matched.add(node);
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
          } else if (root.nodeType === ELEMENT_NODE && node === root) {
            matched.add(node);
          }
          break;
        }
        // legacy pseudo-elements
        case 'after':
        case 'before':
        case 'first-letter':
        case 'first-line': {
          if (this.#warn) {
            throw new DOMException(`Unsupported pseudo-element ::${astName}`,
              NOT_SUPPORTED_ERR);
          }
          break;
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
          if (this.#warn) {
            throw new DOMException(`Unsupported pseudo-class :${astName}`,
              NOT_SUPPORTED_ERR);
          }
          break;
        }
        default: {
          if (astName.startsWith('-webkit-')) {
            if (this.#warn) {
              throw new DOMException(`Unsupported pseudo-class :${astName}`,
                NOT_SUPPORTED_ERR);
            }
          } else if (!forgive) {
            throw new DOMException(`Unknown pseudo-class :${astName}`,
              SYNTAX_ERR);
          }
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
      throw new DOMException('Invalid attribute selector', SYNTAX_ERR);
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
          prefix: astAttrPrefix, tagName: astAttrLocalName
        } = selectorToNodeProps(astAttrName);
        for (let { name: itemName, value: itemValue } of attributes) {
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
                    astAttrLocalName === itemNameLocalName &&
                    isNamespaceDeclared(astAttrPrefix, node)) {
                  attrValues.add(itemValue);
                }
              }
            }
          }
        }
      } else {
        for (let { name: itemName, value: itemValue } of attributes) {
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
   * match type selector
   * @param {object} ast - AST
   * @param {object} node - Element node
   * @returns {?object} - matched node
   */
  _matchTypeSelector(ast, node) {
    const astName = unescapeSelector(ast.name);
    const { localName, prefix } = node;
    const { document } = this.#root;
    let {
      prefix: astPrefix, tagName: astNodeName
    } = selectorToNodeProps(astName, node);
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
    } else if (astPrefix === nodePrefix &&
               isNamespaceDeclared(astPrefix, node)) {
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
   * @param {object} opt - options
   * @returns {object} - collection of matched nodes
   */
  _matchSelector(ast, node, opt) {
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
          const nodes = this._matchPseudoClassSelector(ast, node, opt);
          if (nodes.size) {
            matched = nodes;
          }
          break;
        }
        case PSEUDO_ELEMENT_SELECTOR: {
          const astName = unescapeSelector(ast.name);
          this._matchPseudoElementSelector(astName, opt);
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
   * @param {Array.<object>} leaves - AST leaves
   * @param {object} node - node
   * @param {object} opt - options
   * @returns {boolean} - result
   */
  _matchLeaves(leaves, node, opt) {
    let bool;
    for (const leaf of leaves) {
      bool = this._matchSelector(leaf, node, opt).has(node);
      if (!bool) {
        break;
      }
    }
    return !!bool;
  }

  /**
   * find descendant nodes
   * @param {Array.<object>} leaves - AST leaves
   * @param {object} baseNode - base Element node
   * @returns {object} - result
   */
  _findDescendantNodes(leaves, baseNode) {
    const [leaf, ...items] = leaves;
    const { type: leafType } = leaf;
    const leafName = unescapeSelector(leaf.name);
    const matchItems = items.length > 0;
    const { document, root } = this.#root;
    let nodes = new Set();
    let pending = false;
    switch (leafType) {
      case ID_SELECTOR: {
        if (root.nodeType === ELEMENT_NODE) {
          pending = true;
        } else {
          const elm = root.getElementById(leafName);
          if (elm && elm !== baseNode) {
            const bool = isSameOrDescendant(elm, baseNode);
            let node;
            if (bool) {
              node = elm;
            }
            if (node) {
              if (matchItems) {
                const bool = this._matchLeaves(items, node);
                if (bool) {
                  nodes.add(node);
                }
              } else {
                nodes.add(node);
              }
            }
          }
        }
        break;
      }
      case CLASS_SELECTOR: {
        const arr = [...baseNode.getElementsByClassName(leafName)];
        if (arr.length) {
          if (matchItems) {
            for (const node of arr) {
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
          const arr = [...baseNode.getElementsByTagName(leafName)];
          if (arr.length) {
            if (matchItems) {
              for (const node of arr) {
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
        this._matchPseudoElementSelector(leafName);
        break;
      }
      default: {
        pending = true;
      }
    }
    return {
      nodes,
      pending
    };
  }

  /**
   * match combinator
   * @param {object} twig - twig
   * @param {object} node - Element node
   * @param {object} [opt] - option
   * @param {string} [opt.find] - 'prev'|'next', which nodes to find
   * @returns {object} - collection of matched nodes
   */
  _matchCombinator(twig, node, opt = {}) {
    const { combo, leaves } = twig;
    const { name: comboName } = combo;
    const { find, forgive } = opt;
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
          const childNodes = [...node.children];
          for (const refNode of childNodes) {
            const bool = this._matchLeaves(leaves, refNode);
            if (bool) {
              matched.add(refNode);
            }
          }
          break;
        }
        case ' ':
        default: {
          const { nodes, pending } = this._findDescendantNodes(leaves, node);
          if (nodes.size) {
            matched = nodes;
          } else if (pending) {
            const { document } = this.#root;
            const iterator = document.createNodeIterator(node, SHOW_ELEMENT);
            let refNode = iterator.nextNode();
            if (refNode === node) {
              refNode = iterator.nextNode();
            }
            while (refNode) {
              const bool = this._matchLeaves(leaves, refNode);
              if (bool) {
                matched.add(refNode);
              }
              refNode = iterator.nextNode();
            }
          }
        }
      }
    } else {
      switch (comboName) {
        case '+': {
          const refNode = node.previousElementSibling;
          if (refNode) {
            const bool = this._matchLeaves(leaves, refNode, {
              forgive
            });
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
            const bool = this._matchLeaves(leaves, refNode, {
              forgive
            });
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
            const bool = this._matchLeaves(leaves, refNode, {
              forgive
            });
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
            const bool = this._matchLeaves(leaves, refNode, {
              forgive
            });
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
   * find nodes
   * @param {object} twig - twig
   * @param {string} targetType - target type
   * @returns {object} - result
   */
  _findNodes(twig, targetType) {
    const { leaves: [leaf, ...items] } = twig;
    const { type: leafType } = leaf;
    const leafName = unescapeSelector(leaf.name);
    const matchItems = items.length > 0;
    const { document, root } = this.#root;
    let nodes = new Set();
    let pending = false;
    switch (leafType) {
      case ID_SELECTOR: {
        let node;
        if (targetType === TARGET_SELF) {
          const bool = this._matchLeaves([leaf], this.#node);
          if (bool) {
            node = this.#node;
          }
        } else if (targetType === TARGET_LINEAL) {
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
          if (matchItems) {
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
        if (targetType === TARGET_SELF) {
          if (this.#node.nodeType === ELEMENT_NODE &&
              this.#node.classList.contains(leafName)) {
            arr.push(this.#node);
          }
        } else if (targetType === TARGET_LINEAL) {
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
          const childNodes = [...root.children];
          for (const node of childNodes) {
            if (node.classList.contains(leafName)) {
              arr.push(node);
            }
            const a = [...node.getElementsByClassName(leafName)];
            arr.push(...a);
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
          if (matchItems) {
            for (const node of arr) {
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
        const arr = [];
        if (targetType === TARGET_SELF) {
          const bool = this.#node.nodeType === ELEMENT_NODE &&
                       this._matchLeaves([leaf], this.#node);
          if (bool) {
            arr.push(this.#node);
          }
        } else if (targetType === TARGET_LINEAL) {
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
        } else if (document.contentType !== 'text/html' ||
                   /[*|]/.test(leafName)) {
          pending = true;
        } else {
          const tagName = leafName.toLowerCase();
          if (root.nodeType === DOCUMENT_NODE) {
            const a = [...document.getElementsByTagName(leafName)];
            arr.push(...a);
          } else if (root.nodeType === DOCUMENT_FRAGMENT_NODE) {
            const childNodes = [...root.children];
            for (const node of childNodes) {
              if (node.localName === tagName) {
                arr.push(node);
              }
              const a = [...node.getElementsByTagName(leafName)];
              arr.push(...a);
            }
          } else if (root.nodeType === ELEMENT_NODE) {
            if (root.localName === tagName) {
              arr.push(root);
            }
            const a = [...root.getElementsByTagName(leafName)];
            arr.push(...a);
          }
        }
        if (arr.length) {
          if (matchItems) {
            for (const node of arr) {
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
      case PSEUDO_ELEMENT_SELECTOR: {
        this._matchPseudoElementSelector(leafName);
        break;
      }
      default: {
        const arr = [];
        if (targetType === TARGET_SELF) {
          const bool = this._matchLeaves([leaf], this.#node);
          if (bool) {
            arr.push(this.#node);
          }
        } else if (targetType === TARGET_LINEAL) {
          let refNode = this.#node;
          while (refNode) {
            const bool = this._matchLeaves([leaf], refNode);
            if (bool) {
              arr.push(refNode);
            }
            refNode = refNode.parentNode;
          }
        } else {
          pending = true;
        }
        if (arr.length) {
          if (matchItems) {
            for (const node of arr) {
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
   * @param {string} targetType - target type
   * @returns {Array.<Array.<object|undefined>>} - matrix
   */
  _collectNodes(targetType) {
    const ast = this.#ast.values();
    if (targetType === TARGET_ALL || targetType === TARGET_FIRST) {
      const pendingItems = new Set();
      let i = 0;
      for (const { branch } of ast) {
        const twig = branch[0];
        const { nodes, pending } = this._findNodes(twig, targetType);
        if (nodes.size) {
          this.#nodes[i] = nodes;
        } else if (pending) {
          pendingItems.add(new Map([
            ['index', i],
            ['twig', twig]
          ]));
        } else {
          this.#ast[i].skip = true;
        }
        i++;
      }
      if (pendingItems.size) {
        const { document, root } = this.#root;
        const iterator = document.createNodeIterator(root, SHOW_ELEMENT);
        let nextNode = iterator.nextNode();
        while (nextNode) {
          let bool = false;
          if (this.#node.nodeType === ELEMENT_NODE) {
            bool = isSameOrDescendant(nextNode, this.#node);
          } else {
            bool = true;
          }
          if (bool) {
            for (const pendingItem of pendingItems) {
              const { leaves } = pendingItem.get('twig');
              const matched = this._matchLeaves(leaves, nextNode);
              if (matched) {
                const index = pendingItem.get('index');
                this.#nodes[index].add(nextNode);
              }
            }
          }
          nextNode = iterator.nextNode();
        }
      }
    } else {
      let i = 0;
      for (const { branch } of ast) {
        const twig = branch[branch.length - 1];
        const { nodes } = this._findNodes(twig, targetType);
        if (nodes.size) {
          this.#nodes[i] = nodes;
        } else {
          this.#ast[i].skip = true;
        }
        i++;
      }
    }
    return [
      this.#ast,
      this.#nodes
    ];
  }

  /**
   * sort nodes
   * @param {object} nodes - collection of nodes
   * @returns {Array.<object|undefined>} - collection of sorted nodes
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
   * match nodes
   * @param {string} targetType - target type
   * @returns {object} - collection of matched nodes
   */
  _matchNodes(targetType) {
    const [...branches] = this.#ast;
    const l = branches.length;
    let nodes = new Set();
    for (let i = 0; i < l; i++) {
      const { branch, skip } = branches[i];
      const branchLen = branch.length;
      if (skip) {
        continue;
      } else if (branchLen) {
        const matched = this.#nodes[i];
        const lastIndex = branchLen - 1;
        if (lastIndex === 0) {
          if ((targetType === TARGET_ALL || targetType === TARGET_FIRST) &&
              this.#node.nodeType === ELEMENT_NODE) {
            for (const node of matched) {
              if (node !== this.#node) {
                if (isSameOrDescendant(node, this.#node)) {
                  nodes.add(node);
                  if (targetType === TARGET_FIRST) {
                    break;
                  }
                }
              }
            }
          } else if (targetType === TARGET_FIRST) {
            const [node] = [...matched];
            nodes.add(node);
          } else {
            const n = [...nodes];
            const m = [...matched];
            nodes = new Set([...n, ...m]);
          }
        } else if (targetType === TARGET_ALL || targetType === TARGET_FIRST) {
          let { combo } = branch[0];
          for (const node of matched) {
            let nextNodes = new Set([node]);
            for (let j = 1; j < branchLen; j++) {
              const { combo: nextCombo, leaves } = branch[j];
              const arr = [];
              for (const nextNode of nextNodes) {
                const twig = {
                  combo,
                  leaves
                };
                const m = this._matchCombinator(twig, nextNode, {
                  find: 'next'
                });
                if (m.size) {
                  arr.push(...m);
                }
              }
              const matchedNodes = new Set(arr);
              if (matchedNodes.size) {
                if (j === lastIndex) {
                  if (targetType === TARGET_FIRST) {
                    const [node] = [...matchedNodes];
                    nodes.add(node);
                  } else {
                    const n = [...nodes];
                    const m = [...matchedNodes];
                    nodes = new Set([...n, ...m]);
                  }
                  break;
                } else {
                  combo = nextCombo;
                  nextNodes = matchedNodes;
                }
              } else {
                break;
              }
            }
          }
        } else {
          for (const node of matched) {
            let nextNodes = new Set([node]);
            let bool;
            for (let j = lastIndex - 1; j >= 0; j--) {
              const twig = branch[j];
              const arr = [];
              for (const nextNode of nextNodes) {
                const m = this._matchCombinator(twig, nextNode, {
                  find: 'prev'
                });
                if (m.size) {
                  arr.push(...m);
                }
              }
              const matchedNodes = new Set(arr);
              if (matchedNodes.size) {
                bool = true;
                if (j === 0) {
                  nodes.add(node);
                  break;
                } else {
                  nextNodes = matchedNodes;
                }
              } else {
                bool = false;
                break;
              }
            }
            if (bool) {
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
   * @param {string} targetType - target type
   * @returns {object} - collection of matched nodes
   */
  _find(targetType) {
    this._collectNodes(targetType);
    const nodes = this._matchNodes(targetType);
    return nodes;
  }

  /**
   * matches
   * @returns {boolean} - `true` if matched `false` otherwise
   */
  matches() {
    if (this.#node.nodeType !== ELEMENT_NODE) {
      throw new TypeError(`Unexpected node ${this.#node.nodeName}`);
    }
    let res;
    try {
      const nodes = this._find(TARGET_SELF);
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
    if (this.#node.nodeType !== ELEMENT_NODE) {
      throw new TypeError(`Unexpected node ${this.#node.nodeName}`);
    }
    let res;
    try {
      const nodes = this._find(TARGET_LINEAL);
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
      const nodes = this._find(TARGET_FIRST);
      nodes.delete(this.#node);
      if (nodes.size > 1) {
        [res] = this._sortNodes(nodes);
      } else if (nodes.size) {
        [res] = [...nodes];
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
      const nodes = this._find(TARGET_ALL);
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
