/**
 * matcher.js
 */

/* import */
import isCustomElementName from 'is-potential-custom-element-name';
import {
  getDirectionality, isContentEditable, isInclusive, isInShadowTree,
  isNamespaceDeclared, isPreceding, selectorToNodeProps
} from './dom-util.js';
import {
  generateCSS, parseSelector, unescapeSelector, walkAST
} from './parser.js';

/* constants */
import {
  ALPHA_NUM, BIT_01, BIT_02, BIT_04, BIT_08, BIT_16, BIT_32, COMBINATOR,
  DOCUMENT_FRAGMENT_NODE, DOCUMENT_NODE, ELEMENT_NODE, NOT_SUPPORTED_ERR,
  REG_LOGICAL_PSEUDO, REG_SHADOW_HOST, SELECTOR_ATTR, SELECTOR_CLASS,
  SELECTOR_ID, SELECTOR_PSEUDO_CLASS, SELECTOR_PSEUDO_ELEMENT, SELECTOR_TYPE,
  SHOW_ELEMENT, SYNTAX_ERR, TEXT_NODE
} from './constant.js';
const FIND_NEXT = 'next';
const FIND_PREV = 'prev';
const TARGET_ALL = 'all';
const TARGET_FIRST = 'first';
const TARGET_LINEAL = 'lineal';
const TARGET_SELF = 'self';

/**
 * Matcher
 * NOTE: #ast[i] corresponds to #nodes[i]
 * #ast: [
 *   {
 *     branch: branch[],
 *     filtered: boolean,
 *     find: string,
 *     skip: boolean
 *   },
 *   {
 *     branch: branch[],
 *     filtered: boolean,
 *     find: string,
 *     skip: boolean
 *   }
 * ]
 * #nodes: [
 *   Set([node{}, node{}]),
 *   Set([node{}, node{}, node{}])
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
  #bit;
  #cache;
  #node;
  #nodes;
  #root;
  #selector;
  #warn;

  /**
   * construct
   * @param {string} selector - CSS selector
   * @param {object} node - Document, DocumentFragment, Element node
   * @param {object} [opt] - options
   * @param {boolean} [opt.warn] - console warn
   */
  constructor(selector, node, opt = {}) {
    const { warn } = opt;
    this.#bit = new Map([
      [SELECTOR_PSEUDO_ELEMENT, BIT_01],
      [SELECTOR_ID, BIT_02],
      [SELECTOR_CLASS, BIT_04],
      [SELECTOR_TYPE, BIT_08],
      [SELECTOR_ATTR, BIT_16],
      [SELECTOR_PSEUDO_CLASS, BIT_32]
    ]);
    this.#cache = new WeakMap();
    this.#selector = selector;
    this.#node = node;
    this.#warn = !!warn;
    [this.#ast, this.#nodes] = this._prepare(selector);
    this.#root = this._getRoot(node);
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
        if (node.ownerDocument.contains(node)) {
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
    const shadow = isInShadowTree(node);
    return {
      document,
      root,
      shadow
    };
  }

  /**
   * sort AST leaves
   * @param {Array.<object>} leaves - collection of AST leaves
   * @returns {Array.<object>} - sorted leaves
   */
  _sortLeaves(leaves) {
    const arr = [...leaves];
    if (arr.length > 1) {
      arr.sort((a, b) => {
        const { type: typeA } = a;
        const { type: typeB } = b;
        const bitA = this.#bit.get(typeA);
        const bitB = this.#bit.get(typeB);
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
   * @returns {Array.<Array.<object|undefined>>} - array of ast and nodes
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
        filtered: false,
        find: null,
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
   * @returns {Set.<object>} - collection of matched nodes
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
      const arr = [].slice.call(parentNode.children);
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
          let nth = b - 1;
          if (a > 0) {
            while (nth < 0) {
              nth += a;
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
      if (node === root && root.nodeType === ELEMENT_NODE && (a + b) === 1) {
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
   * @returns {Set.<object>} - collection of matched nodes
   */
  _collectNthOfType(anb, node) {
    const { a, b, reverse } = anb;
    const { localName, parentNode, prefix } = node;
    const matched = new Set();
    if (parentNode) {
      const arr = [].slice.call(parentNode.children);
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
      if (node === root && root.nodeType === ELEMENT_NODE && (a + b) === 1) {
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
   * @returns {Set.<object>} - collection of matched nodes
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
      if (nthName.indexOf('last') > -1) {
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
      if (nthName.indexOf('last') > -1) {
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
   * @param {object} [opt] - options
   * @param {boolean} [opt.forgive] - is forgiving selector list
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
      case 'placeholder':
      case 'selection':
      case 'target-text': {
        if (this.#warn) {
          throw new DOMException(`Unsupported pseudo-element ::${astName}`,
            NOT_SUPPORTED_ERR);
        }
        break;
      }
      case 'part':
      case 'slotted': {
        if (this.#warn) {
          throw new DOMException(`Unsupported pseudo-element ::${astName}()`,
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
    const dir = getDirectionality(node);
    let res;
    if (astName === dir) {
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
    const astName = unescapeSelector(ast.name);
    let res;
    if (astName === '*') {
      if (node.hasAttribute('lang')) {
        if (node.getAttribute('lang')) {
          res = node;
        }
      } else {
        let parent = node.parentNode;
        while (parent) {
          if (parent.nodeType === ELEMENT_NODE) {
            if (parent.hasAttribute('lang')) {
              if (parent.getAttribute('lang')) {
                res = node;
              }
              break;
            }
            parent = parent.parentNode;
          } else {
            break;
          }
        }
      }
    } else if (astName) {
      const langPart = `(?:-${ALPHA_NUM})*`;
      const regLang = new RegExp(`^(?:\\*-)?${ALPHA_NUM}${langPart}$`, 'i');
      if (regLang.test(astName)) {
        let regExtendedLang;
        if (astName.indexOf('-') > -1) {
          const [langMain, langSub, ...langRest] = astName.split('-');
          let extendedMain;
          if (langMain === '*') {
            extendedMain = `${ALPHA_NUM}${langPart}`;
          } else {
            extendedMain = `${langMain}${langPart}`;
          }
          const extendedSub = `-${langSub}${langPart}`;
          const len = langRest.length;
          let extendedRest = '';
          if (len) {
            for (let i = 0; i < len; i++) {
              extendedRest += `-${langRest[i]}${langPart}`;
            }
          }
          regExtendedLang =
            new RegExp(`^${extendedMain}${extendedSub}${extendedRest}$`, 'i');
        } else {
          regExtendedLang = new RegExp(`^${astName}${langPart}$`, 'i');
        }
        if (node.hasAttribute('lang')) {
          if (regExtendedLang.test(node.getAttribute('lang'))) {
            res = node;
          }
        } else {
          let parent = node.parentNode;
          while (parent) {
            if (parent.nodeType === ELEMENT_NODE) {
              if (parent.hasAttribute('lang')) {
                const value = parent.getAttribute('lang');
                if (regExtendedLang.test(value)) {
                  res = node;
                }
                break;
              }
              parent = parent.parentNode;
            } else {
              break;
            }
          }
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
        find: FIND_NEXT
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
        const l = branches.length;
        let bool;
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
      const l = twigBranches.length;
      let bool;
      for (let i = 0; i < l; i++) {
        const branch = twigBranches[i];
        const lastIndex = branch.length - 1;
        const { leaves } = branch[lastIndex];
        bool = this._matchLeaves(leaves, node, { forgive });
        if (bool && lastIndex > 0) {
          let nextNodes = new Set([node]);
          for (let j = lastIndex - 1; j >= 0; j--) {
            const twig = branch[j];
            const arr = [];
            for (const nextNode of nextNodes) {
              const m = this._matchCombinator(twig, nextNode, {
                forgive,
                find: FIND_PREV
              });
              if (m.size) {
                arr.push(...m);
              }
            }
            if (arr.length) {
              if (j === 0) {
                bool = true;
                break;
              } else {
                nextNodes = new Set(arr);
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
   * @param {object} [opt] - options
   * @param {boolean} [opt.forgive] - is forgiving selector list
   * @returns {Set.<object>} - collection of matched nodes
   */
  _matchPseudoClassSelector(ast, node, opt = {}) {
    const { children: astChildren } = ast;
    const { localName, parentNode } = node;
    const { forgive } = opt;
    const astName = unescapeSelector(ast.name);
    let matched = new Set();
    // :has(), :is(), :not(), :where()
    if (REG_LOGICAL_PSEUDO.test(astName)) {
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
      if (/^nth-(?:last-)?(?:child|of-type)$/.test(astName)) {
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
          case 'host':
          case 'host-context': {
            // ignore
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
      const regAnchor = /^a(?:rea)?$/;
      const regFormCtrl =
        /^(?:(?:fieldse|inpu|selec)t|button|opt(?:group|ion)|textarea)$/;
      const regFormValidity = /^(?:(?:inpu|selec)t|button|form|textarea)$/;
      const regInteract = /^d(?:etails|ialog)$/;
      const regTypeCheck = /^(?:checkbox|radio)$/;
      const regTypeDate = /^(?:date(?:time-local)?|month|time|week)$/;
      const regTypeRange =
        /(?:(?:rang|tim)e|date(?:time-local)?|month|number|week)$/;
      const regTypeText = /^(?:(?:emai|te|ur)l|number|password|search|text)$/;
      switch (astName) {
        case 'any-link':
        case 'link': {
          if (regAnchor.test(localName) && node.hasAttribute('href')) {
            matched.add(node);
          }
          break;
        }
        case 'local-link': {
          if (regAnchor.test(localName) && node.hasAttribute('href')) {
            const { href, origin, pathname } = new URL(document.URL);
            const attrURL = new URL(node.getAttribute('href'), href);
            if (attrURL.origin === origin && attrURL.pathname === pathname) {
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
          const { hash } = new URL(document.URL);
          if (node.id && hash === `#${node.id}` && document.contains(node)) {
            matched.add(node);
          }
          break;
        }
        case 'target-within': {
          const { hash } = new URL(document.URL);
          if (hash) {
            const id = hash.replace(/^#/, '');
            let current = document.getElementById(id);
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
          } else if (node === document.documentElement) {
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
          if (regInteract.test(localName) && node.hasAttribute('open')) {
            matched.add(node);
          }
          break;
        }
        case 'closed': {
          if (regInteract.test(localName) && !node.hasAttribute('open')) {
            matched.add(node);
          }
          break;
        }
        case 'disabled': {
          if (regFormCtrl.test(localName) || isCustomElementName(localName)) {
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
              if (parent && parentNode.localName !== 'legend' &&
                  parent.hasAttribute('disabled')) {
                matched.add(node);
              }
            }
          }
          break;
        }
        case 'enabled': {
          if ((regFormCtrl.test(localName) || isCustomElementName(localName)) &&
              !(node.disabled && node.hasAttribute('disabled'))) {
            matched.add(node);
          }
          break;
        }
        case 'read-only': {
          switch (localName) {
            case 'textarea': {
              if (node.readonly || node.hasAttribute('readonly') ||
                  node.disabled || node.hasAttribute('disabled')) {
                matched.add(node);
              }
              break;
            }
            case 'input': {
              if ((!node.type || regTypeDate.test(node.type) ||
                   regTypeText.test(node.type)) &&
                  (node.readonly || node.hasAttribute('readonly') ||
                   node.disabled || node.hasAttribute('disabled'))) {
                matched.add(node);
              }
              break;
            }
            default: {
              if (!isContentEditable(node)) {
                matched.add(node);
              }
            }
          }
          break;
        }
        case 'read-write': {
          switch (localName) {
            case 'textarea': {
              if (!(node.readonly || node.hasAttribute('readonly') ||
                    node.disabled || node.hasAttribute('disabled'))) {
                matched.add(node);
              }
              break;
            }
            case 'input': {
              if ((!node.type || regTypeDate.test(node.type) ||
                   regTypeText.test(node.type)) &&
                  !(node.readonly || node.hasAttribute('readonly') ||
                    node.disabled || node.hasAttribute('disabled'))) {
                matched.add(node);
              }
              break;
            }
            default: {
              if (isContentEditable(node)) {
                matched.add(node);
              }
            }
          }
          break;
        }
        case 'placeholder-shown': {
          let targetNode;
          if (localName === 'textarea') {
            targetNode = node;
          } else if (localName === 'input') {
            if (node.hasAttribute('type')) {
              if (regTypeText.test(node.getAttribute('type'))) {
                targetNode = node;
              }
            } else {
              targetNode = node;
            }
          }
          if (targetNode && node.value === '' &&
              node.hasAttribute('placeholder') &&
              node.getAttribute('placeholder').trim().length) {
            matched.add(node);
          }
          break;
        }
        case 'checked': {
          if ((node.checked && localName === 'input' &&
               node.hasAttribute('type') &&
               regTypeCheck.test(node.getAttribute('type'))) ||
              (node.selected && localName === 'option')) {
            matched.add(node);
          }
          break;
        }
        case 'indeterminate': {
          if ((node.indeterminate && localName === 'input' &&
               node.type === 'checkbox') ||
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
              parent = document.documentElement;
            }
            const nodes = [].slice.call(parent.getElementsByTagName('input'));
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
          const regTypeReset = /^(?:button|reset)$/;
          const regTypeSubmit = /^(?:image|submit)$/;
          // button[type="submit"], input[type="submit"], input[type="image"]
          if ((localName === 'button' &&
               !(node.hasAttribute('type') &&
                 regTypeReset.test(node.getAttribute('type')))) ||
              (localName === 'input' && node.hasAttribute('type') &&
               regTypeSubmit.test(node.getAttribute('type')))) {
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
                    regTypeReset.test(nextNode.getAttribute('type')));
                } else if (nodeName === 'input') {
                  m = nextNode.hasAttribute('type') &&
                    regTypeSubmit.test(nextNode.getAttribute('type'));
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
                     regTypeCheck.test(node.getAttribute('type')) &&
                     (node.checked || node.hasAttribute('checked'))) {
            matched.add(node);
          // option
          } else if (localName === 'option') {
            let isMultiple = false;
            let parent = parentNode;
            while (parent) {
              if (parent.localName === 'datalist') {
                break;
              } else if (parent.localName === 'select') {
                if (parent.multiple || parent.hasAttribute('multiple')) {
                  isMultiple = true;
                }
                break;
              }
              parent = parent.parentNode;
            }
            if (isMultiple) {
              if (node.selected || node.hasAttribute('selected')) {
                matched.add(node);
              }
            } else {
              const firstOpt = parentNode.firstElementChild;
              const defaultOpt = new Set();
              let opt = firstOpt;
              while (opt) {
                if (opt.selected || opt.hasAttribute('selected')) {
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
          if (regFormValidity.test(localName)) {
            if (node.checkValidity()) {
              matched.add(node);
            }
          } else if (localName === 'fieldset') {
            const iterator = document.createNodeIterator(node, SHOW_ELEMENT);
            let refNode = iterator.nextNode();
            if (refNode === node) {
              refNode = iterator.nextNode();
            }
            let bool;
            while (refNode) {
              if (regFormValidity.test(refNode.localName)) {
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
          if (regFormValidity.test(localName)) {
            if (!node.checkValidity()) {
              matched.add(node);
            }
          } else if (localName === 'fieldset') {
            const iterator = document.createNodeIterator(node, SHOW_ELEMENT);
            let refNode = iterator.nextNode();
            if (refNode === node) {
              refNode = iterator.nextNode();
            }
            let bool;
            while (refNode) {
              if (regFormValidity.test(refNode.localName)) {
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
              regTypeRange.test(node.getAttribute('type')) &&
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
              regTypeRange.test(node.getAttribute('type')) &&
              (node.validity.rangeUnderflow || node.validity.rangeOverflow)) {
            matched.add(node);
          }
          break;
        }
        case 'required': {
          let targetNode;
          if (/^(?:select|textarea)$/.test(localName)) {
            targetNode = node;
          } else if (localName === 'input') {
            if (node.hasAttribute('type')) {
              const inputType = node.getAttribute('type');
              if (inputType === 'file' || regTypeCheck.test(inputType) ||
                  regTypeDate.test(inputType) || regTypeText.test(inputType)) {
                targetNode = node;
              }
            } else {
              targetNode = node;
            }
          }
          if (targetNode &&
              (node.required || node.hasAttribute('required'))) {
            matched.add(node);
          }
          break;
        }
        case 'optional': {
          let targetNode;
          if (/^(?:select|textarea)$/.test(localName)) {
            targetNode = node;
          } else if (localName === 'input') {
            if (node.hasAttribute('type')) {
              const inputType = node.getAttribute('type');
              if (inputType === 'file' || regTypeCheck.test(inputType) ||
                  regTypeDate.test(inputType) || regTypeText.test(inputType)) {
                targetNode = node;
              }
            } else {
              targetNode = node;
            }
          }
          if (targetNode &&
              !(node.required || node.hasAttribute('required'))) {
            matched.add(node);
          }
          break;
        }
        case 'root': {
          if (node === document.documentElement) {
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
              (node === root && root.nodeType === ELEMENT_NODE)) {
            matched.add(node);
          }
          break;
        }
        case 'last-child': {
          if ((parentNode && node === parentNode.lastElementChild) ||
              (node === root && root.nodeType === ELEMENT_NODE)) {
            matched.add(node);
          }
          break;
        }
        case 'only-child': {
          if ((parentNode &&
               node === parentNode.firstElementChild &&
               node === parentNode.lastElementChild) ||
              (node === root && root.nodeType === ELEMENT_NODE)) {
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
          } else if (node === root && root.nodeType === ELEMENT_NODE) {
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
          } else if (node === root && root.nodeType === ELEMENT_NODE) {
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
          } else if (node === root && root.nodeType === ELEMENT_NODE) {
            matched.add(node);
          }
          break;
        }
        case 'host':
        case 'host-context': {
          // ignore
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
      const css = generateCSS(ast);
      throw new DOMException(`Invalid selector ${css}`, SYNTAX_ERR);
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
      let astAttrName = unescapeSelector(astName.name);
      if (caseInsensitive) {
        astAttrName = astAttrName.toLowerCase();
      }
      const attrValues = new Set();
      // namespaced
      if (astAttrName.indexOf('|') > -1) {
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
              if (itemName.indexOf(':') > -1) {
                if (itemName.endsWith(`:${astAttrLocalName}`)) {
                  attrValues.add(itemValue);
                }
              } else if (astAttrLocalName === itemName) {
                attrValues.add(itemValue);
              }
              break;
            }
            default: {
              if (itemName.indexOf(':') > -1) {
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
          if (itemName.indexOf(':') > -1) {
            const [itemNamePrefix, itemNameLocalName] = itemName.split(':');
            // ignore xml:lang
            if (itemNamePrefix === 'xml' && itemNameLocalName === 'lang') {
              continue;
            } else if (astAttrName === itemNameLocalName) {
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
    const astName = unescapeSelector(ast.name);
    const { id } = node;
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
   * @param {object} [opt] - options
   * @param {boolean} [opt.forgive] - is forgiving selector list
   * @returns {?object} - matched node
   */
  _matchTypeSelector(ast, node, opt = {}) {
    const astName = unescapeSelector(ast.name);
    const { localName, prefix } = node;
    const { forgive } = opt;
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
    if (localName.indexOf(':') > -1) {
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
      if (isNamespaceDeclared(astPrefix, node)) {
        if (astNodeName === '*' || astNodeName === nodeName) {
          res = node;
        }
      } else if (!forgive) {
        throw new DOMException(`Undeclared namespace ${astPrefix}`, SYNTAX_ERR);
      }
    } else if (astPrefix && !forgive && !isNamespaceDeclared(astPrefix, node)) {
      throw new DOMException(`Undeclared namespace ${astPrefix}`, SYNTAX_ERR);
    }
    return res ?? null;
  };

  /**
   * match shadow host pseudo class
   * @param {object} ast - AST
   * @param {object} node - DocumentFragment node
   * @returns {?object} - matched node
   */
  _matchShadowHostPseudoClass(ast, node) {
    const { children: astChildren } = ast;
    const astName = unescapeSelector(ast.name);
    let res;
    if (Array.isArray(astChildren)) {
      const [branch] = walkAST(astChildren[0]);
      const [...leaves] = branch;
      const { host } = node;
      if (astName === 'host') {
        let bool;
        for (const leaf of leaves) {
          const { type: leafType } = leaf;
          if (leafType === COMBINATOR) {
            const css = generateCSS(ast);
            throw new DOMException(`Invalid selector ${css}`, SYNTAX_ERR);
          }
          bool = this._matchSelector(leaf, host).has(host);
          if (!bool) {
            break;
          }
        }
        if (bool) {
          res = node;
        }
      } else if (astName === 'host-context') {
        let parent = host;
        let bool;
        while (parent) {
          for (const leaf of leaves) {
            const { type: leafType } = leaf;
            if (leafType === COMBINATOR) {
              const css = generateCSS(ast);
              throw new DOMException(`Invalid selector ${css}`, SYNTAX_ERR);
            }
            bool = this._matchSelector(leaf, parent).has(parent);
            if (!bool) {
              break;
            }
          }
          if (bool) {
            break;
          } else {
            parent = parent.parentNode;
          }
        }
        if (bool) {
          res = node;
        }
      }
    } else if (astName === 'host') {
      res = node;
    } else {
      throw new DOMException(`Invalid selector :${astName}`, SYNTAX_ERR);
    }
    return res ?? null;
  }

  /**
   * match selector
   * @param {object} ast - AST
   * @param {object} node - Document, DocumentFragment, Element node
   * @param {object} [opt] - options
   * @returns {Set.<object>} - collection of matched nodes
   */
  _matchSelector(ast, node, opt) {
    const { type: astType } = ast;
    const astName = unescapeSelector(ast.name);
    const { shadow } = this.#root;
    let matched = new Set();
    if (node.nodeType === ELEMENT_NODE) {
      switch (astType) {
        case SELECTOR_ATTR: {
          const res = this._matchAttributeSelector(ast, node);
          if (res) {
            matched.add(res);
          }
          break;
        }
        case SELECTOR_CLASS: {
          const res = this._matchClassSelector(ast, node);
          if (res) {
            matched.add(res);
          }
          break;
        }
        case SELECTOR_ID: {
          const res = this._matchIDSelector(ast, node);
          if (res) {
            matched.add(res);
          }
          break;
        }
        case SELECTOR_PSEUDO_CLASS: {
          const nodes = this._matchPseudoClassSelector(ast, node, opt);
          if (nodes.size) {
            matched = nodes;
          }
          break;
        }
        case SELECTOR_PSEUDO_ELEMENT: {
          this._matchPseudoElementSelector(astName, opt);
          break;
        }
        case SELECTOR_TYPE:
        default: {
          const res = this._matchTypeSelector(ast, node, opt);
          if (res) {
            matched.add(res);
          }
        }
      }
    } else if (shadow && astType === SELECTOR_PSEUDO_CLASS &&
               node.nodeType === DOCUMENT_FRAGMENT_NODE) {
      if (astName !== 'has' && REG_LOGICAL_PSEUDO.test(astName)) {
        const nodes = this._matchPseudoClassSelector(ast, node, opt);
        if (nodes.size) {
          matched = nodes;
        }
      } else if (REG_SHADOW_HOST.test(astName)) {
        const res = this._matchShadowHostPseudoClass(ast, node);
        if (res) {
          matched.add(res);
        }
      }
    }
    return matched;
  }

  /**
   * match leaves
   * @param {Array.<object>} leaves - AST leaves
   * @param {object} node - node
   * @param {object} [opt] - options
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
   * @returns {object} - collection of nodes and pending state
   */
  _findDescendantNodes(leaves, baseNode) {
    const [leaf, ...items] = leaves;
    const { type: leafType } = leaf;
    const leafName = unescapeSelector(leaf.name);
    const matchItems = items.length > 0;
    const { document, root, shadow } = this.#root;
    let nodes = new Set();
    let pending = false;
    if (shadow) {
      pending = true;
    } else {
      switch (leafType) {
        case SELECTOR_ID: {
          if (root.nodeType === ELEMENT_NODE) {
            pending = true;
          } else {
            const node = root.getElementById(leafName);
            if (node && node !== baseNode && baseNode.contains(node)) {
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
          break;
        }
        case SELECTOR_CLASS: {
          const arr = [].slice.call(baseNode.getElementsByClassName(leafName));
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
        case SELECTOR_TYPE: {
          if (document.contentType === 'text/html' && !/[*|]/.test(leafName)) {
            const arr = [].slice.call(baseNode.getElementsByTagName(leafName));
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
          } else {
            pending = true;
          }
          break;
        }
        case SELECTOR_PSEUDO_ELEMENT: {
          this._matchPseudoElementSelector(leafName);
          break;
        }
        default: {
          pending = true;
        }
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
   * @param {boolean} [opt.forgive] - is forgiving selector list
   * @returns {Set.<object>} - collection of matched nodes
   */
  _matchCombinator(twig, node, opt = {}) {
    const { combo, leaves } = twig;
    const { name: comboName } = combo;
    const { find, forgive } = opt;
    let matched = new Set();
    if (find === FIND_NEXT) {
      switch (comboName) {
        case '+': {
          const refNode = node.nextElementSibling;
          if (refNode) {
            const bool = this._matchLeaves(leaves, refNode, { forgive });
            if (bool) {
              matched.add(refNode);
            }
          }
          break;
        }
        case '~': {
          let refNode = node.nextElementSibling;
          while (refNode) {
            const bool = this._matchLeaves(leaves, refNode, { forgive });
            if (bool) {
              matched.add(refNode);
            }
            refNode = refNode.nextElementSibling;
          }
          break;
        }
        case '>': {
          const childNodes = [].slice.call(node.children);
          for (const refNode of childNodes) {
            const bool = this._matchLeaves(leaves, refNode, { forgive });
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
              const bool = this._matchLeaves(leaves, refNode, { forgive });
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
            const bool = this._matchLeaves(leaves, refNode, { forgive });
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
            const bool = this._matchLeaves(leaves, refNode, { forgive });
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
            const bool = this._matchLeaves(leaves, refNode, { forgive });
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
            const bool = this._matchLeaves(leaves, refNode, { forgive });
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
   * @returns {object} - collection of nodes etc.
   */
  _findNodes(twig, targetType) {
    const { leaves: [leaf, ...items] } = twig;
    const { type: leafType } = leaf;
    const leafName = unescapeSelector(leaf.name);
    const { document, root, shadow } = this.#root;
    let nodes = new Set();
    let pending = false;
    switch (leafType) {
      case SELECTOR_ID: {
        if (targetType === TARGET_SELF) {
          const bool = this._matchLeaves([leaf], this.#node);
          if (bool) {
            nodes.add(this.#node);
          }
        } else if (targetType === TARGET_LINEAL) {
          let refNode = this.#node;
          while (refNode) {
            const bool = this._matchLeaves([leaf], refNode);
            if (bool) {
              nodes.add(refNode);
              break;
            }
            refNode = refNode.parentNode;
          }
        } else if (targetType === TARGET_ALL ||
                   root.nodeType === ELEMENT_NODE) {
          pending = true;
        } else {
          const node = root.getElementById(leafName);
          if (node) {
            nodes.add(node);
          }
        }
        break;
      }
      case SELECTOR_CLASS: {
        if (targetType === TARGET_SELF) {
          if (this.#node.nodeType === ELEMENT_NODE &&
              this.#node.classList.contains(leafName)) {
            nodes.add(this.#node);
          }
        } else if (targetType === TARGET_LINEAL) {
          let refNode = this.#node;
          while (refNode) {
            if (refNode.nodeType === ELEMENT_NODE) {
              if (refNode.classList.contains(leafName)) {
                nodes.add(refNode);
              }
              refNode = refNode.parentNode;
            } else {
              break;
            }
          }
        } else if (root.nodeType === DOCUMENT_FRAGMENT_NODE) {
          const childNodes = [].slice.call(root.children);
          const arr = [];
          for (const node of childNodes) {
            if (node.classList.contains(leafName)) {
              arr.push(node);
            }
            const a = [].slice.call(node.getElementsByClassName(leafName));
            arr.push(...a);
          }
          if (arr.length) {
            nodes = new Set(arr);
          }
        } else {
          const arr = [].slice.call(root.getElementsByClassName(leafName));
          if (this.#node.nodeType === ELEMENT_NODE) {
            for (const node of arr) {
              if (node === this.#node || isInclusive(node, this.#node)) {
                nodes.add(node);
              }
            }
          } else if (arr.length) {
            nodes = new Set(arr);
          }
        }
        break;
      }
      case SELECTOR_TYPE: {
        if (targetType === TARGET_SELF) {
          if (this.#node.nodeType === ELEMENT_NODE) {
            const bool = this._matchLeaves([leaf], this.#node);
            if (bool) {
              nodes.add(this.#node);
            }
          }
        } else if (targetType === TARGET_LINEAL) {
          let refNode = this.#node;
          while (refNode) {
            if (refNode.nodeType === ELEMENT_NODE) {
              const bool = this._matchLeaves([leaf], refNode);
              if (bool) {
                nodes.add(refNode);
              }
              refNode = refNode.parentNode;
            } else {
              break;
            }
          }
        } else if (document.contentType !== 'text/html' ||
                   /[*|]/.test(leafName)) {
          pending = true;
        } else if (root.nodeType === DOCUMENT_FRAGMENT_NODE) {
          const tagName = leafName.toLowerCase();
          const childNodes = [].slice.call(root.children);
          const arr = [];
          for (const node of childNodes) {
            if (node.localName === tagName) {
              arr.push(node);
            }
            const a = [].slice.call(node.getElementsByTagName(leafName));
            arr.push(...a);
          }
          if (arr.length) {
            nodes = new Set(arr);
          }
        } else {
          const arr = [].slice.call(root.getElementsByTagName(leafName));
          if (this.#node.nodeType === ELEMENT_NODE) {
            for (const node of arr) {
              if (node === this.#node || isInclusive(node, this.#node)) {
                nodes.add(node);
              }
            }
          } else if (arr.length) {
            nodes = new Set(arr);
          }
        }
        break;
      }
      case SELECTOR_PSEUDO_ELEMENT: {
        // throws
        this._matchPseudoElementSelector(leafName);
        break;
      }
      default: {
        if (targetType !== TARGET_LINEAL && REG_SHADOW_HOST.test(leafName)) {
          if (shadow && this.#node.nodeType === DOCUMENT_FRAGMENT_NODE) {
            const node = this._matchShadowHostPseudoClass(leaf, this.#node);
            if (node) {
              nodes.add(node);
            }
          }
        } else if (targetType === TARGET_SELF) {
          const bool = this._matchLeaves([leaf], this.#node);
          if (bool) {
            nodes.add(this.#node);
          }
        } else if (targetType === TARGET_LINEAL) {
          let refNode = this.#node;
          while (refNode) {
            const bool = this._matchLeaves([leaf], refNode);
            if (bool) {
              nodes.add(refNode);
            }
            refNode = refNode.parentNode;
          }
        } else {
          pending = true;
        }
      }
    }
    if (items.length && !pending && !nodes.size) {
      const lastLeaf = items[items.length - 1];
      const { type: lastLeafType } = lastLeaf;
      if (lastLeafType === SELECTOR_PSEUDO_CLASS) {
        let node;
        if (root.nodeType === ELEMENT_NODE) {
          node = root;
        } else {
          node = root.firstElementChild;
        }
        // throws if unknown pseudo-class
        this._matchPseudoClassSelector(lastLeaf, node);
      }
    }
    return {
      compound: !!items.length,
      nodes,
      pending
    };
  }

  /**
   * get entry twig
   * @param {Array.<object>} branch - AST branch
   * @param {string} targetType - target type
   * @returns {object} - find direction and twig
   */
  _getEntryTwig(branch, targetType) {
    const branchLen = branch.length;
    const firstTwig = branch[0];
    let find;
    let twig;
    if (branchLen > 1) {
      const { leaves: [{ type: firstType }] } = firstTwig;
      const lastTwig = branch[branchLen - 1];
      const { leaves: [{ type: lastType }] } = lastTwig;
      if (lastType === SELECTOR_PSEUDO_ELEMENT || lastType === SELECTOR_ID) {
        find = FIND_PREV;
        twig = lastTwig;
      } else if (firstType === SELECTOR_PSEUDO_ELEMENT ||
                 firstType === SELECTOR_ID) {
        find = FIND_NEXT;
        twig = firstTwig;
      } else if (targetType === TARGET_FIRST && branchLen < BIT_04) {
        find = FIND_PREV;
        twig = lastTwig;
      } else {
        find = FIND_NEXT;
        twig = firstTwig;
      }
    } else {
      find = FIND_PREV;
      twig = firstTwig;
    }
    return {
      find,
      twig
    };
  }

  /**
   * collect nodes
   * @param {string} targetType - target type
   * @returns {Array.<Array.<object|undefined>>} - #ast and #nodes
   */
  _collectNodes(targetType) {
    const ast = this.#ast.values();
    if (targetType === TARGET_ALL || targetType === TARGET_FIRST) {
      const pendingItems = new Set();
      let i = 0;
      for (const { branch } of ast) {
        const { find, twig } = this._getEntryTwig(branch, targetType);
        const { compound, nodes, pending } = this._findNodes(twig, targetType);
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
        this.#ast[i].filtered = !compound;
        this.#ast[i].find = find;
        i++;
      }
      if (pendingItems.size) {
        const { document, root } = this.#root;
        const iterator = document.createNodeIterator(root, SHOW_ELEMENT);
        let nextNode = iterator.nextNode();
        while (nextNode) {
          let bool = false;
          if (this.#node.nodeType === ELEMENT_NODE) {
            if (nextNode === this.#node) {
              bool = true;
            } else {
              bool = this.#node.contains(nextNode);
            }
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
                if (!this.#ast[index].filtered) {
                  this.#ast[index].filtered = true;
                }
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
        const { compound, nodes } = this._findNodes(twig, targetType);
        if (nodes.size) {
          this.#nodes[i] = nodes;
        } else {
          this.#ast[i].skip = true;
        }
        this.#ast[i].filtered = !compound;
        this.#ast[i].find = FIND_PREV;
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
   * @param {Array.<object>|Set.<object>} nodes - collection of nodes
   * @returns {Array.<object|undefined>} - collection of sorted nodes
   */
  _sortNodes(nodes) {
    const arr = [...nodes];
    if (arr.length > 1) {
      arr.sort((a, b) => {
        let res;
        if (isPreceding(b, a)) {
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
   * @returns {Set.<object>} - collection of matched nodes
   */
  _matchNodes(targetType) {
    const [...branches] = this.#ast;
    const l = branches.length;
    let nodes = new Set();
    for (let i = 0; i < l; i++) {
      const { branch, filtered, find, skip } = branches[i];
      const branchLen = branch.length;
      if (skip) {
        continue;
      } else if (branchLen) {
        const collectedNodes = this.#nodes[i];
        const lastIndex = branchLen - 1;
        if (lastIndex === 0) {
          const { leaves: filterLeaves } = branch[0];
          if ((targetType === TARGET_ALL || targetType === TARGET_FIRST) &&
              this.#node.nodeType === ELEMENT_NODE) {
            for (const node of collectedNodes) {
              const bool = filtered || this._matchLeaves(filterLeaves, node);
              if (bool && node !== this.#node && this.#node.contains(node)) {
                nodes.add(node);
                if (targetType !== TARGET_ALL) {
                  break;
                }
              }
            }
          } else {
            for (const node of collectedNodes) {
              const bool = filtered || this._matchLeaves(filterLeaves, node);
              if (bool) {
                nodes.add(node);
                if (targetType !== TARGET_ALL) {
                  break;
                }
              }
            }
          }
        } else if (find === FIND_NEXT) {
          let { combo, leaves: filterLeaves } = branch[0];
          for (const node of collectedNodes) {
            const bool = filtered || this._matchLeaves(filterLeaves, node);
            let matched;
            if (bool) {
              let nextNodes = new Set([node]);
              for (let j = 1; j < branchLen; j++) {
                const { combo: nextCombo, leaves } = branch[j];
                const arr = [];
                for (const nextNode of nextNodes) {
                  const twig = {
                    combo,
                    leaves
                  };
                  const m = this._matchCombinator(twig, nextNode, { find });
                  if (m.size) {
                    arr.push(...m);
                  }
                }
                if (arr.length) {
                  if (j === lastIndex) {
                    if (targetType === TARGET_FIRST) {
                      const [node] = this._sortNodes(arr);
                      nodes.add(node);
                    } else {
                      const n = [...nodes];
                      nodes = new Set([...n, ...arr]);
                    }
                    matched = true;
                    break;
                  } else {
                    matched = false;
                    combo = nextCombo;
                    nextNodes = new Set(arr);
                  }
                } else {
                  matched = false;
                  break;
                }
              }
            } else {
              matched = false;
            }
            if (matched && targetType !== TARGET_ALL) {
              break;
            }
          }
        } else {
          const { leaves: filterLeaves } = branch[lastIndex];
          for (const node of collectedNodes) {
            const bool = filtered || this._matchLeaves(filterLeaves, node);
            let matched;
            if (bool) {
              let nextNodes = new Set([node]);
              for (let j = lastIndex - 1; j >= 0; j--) {
                const twig = branch[j];
                const arr = [];
                for (const nextNode of nextNodes) {
                  const m = this._matchCombinator(twig, nextNode, { find });
                  if (m.size) {
                    arr.push(...m);
                  }
                }
                if (arr.length) {
                  if (j === 0) {
                    nodes.add(node);
                    matched = true;
                    break;
                  } else {
                    matched = false;
                    nextNodes = new Set(arr);
                  }
                } else {
                  matched = false;
                  break;
                }
              }
            } else {
              matched = false;
            }
            if (matched && targetType !== TARGET_ALL) {
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
   * @returns {Set.<object>} - collection of matched nodes
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
      if (nodes.size) {
        res = nodes.has(this.#node);
      }
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
    let res;
    try {
      const nodes = this._find(TARGET_ALL);
      nodes.delete(this.#node);
      if (nodes.size) {
        res = this._sortNodes(nodes);
      }
    } catch (e) {
      this._onError(e);
    }
    return res ?? [];
  }
};
