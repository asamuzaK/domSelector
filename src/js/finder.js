/**
 * finder.js
 */

/* import */
import { Matcher } from './matcher.js';
import {
  generateCSS, parseSelector, sortAST, unescapeSelector, walkAST
} from './parser.js';
import {
  isContentEditable, isCustomElement, isInShadowTree, resolveContent,
  sortNodes, traverseNode
} from './utility.js';

/* constants */
import {
  BIT_01, COMBINATOR, DOCUMENT_FRAGMENT_NODE, DOCUMENT_NODE, ELEMENT_NODE,
  EMPTY, NOT_SUPPORTED_ERR, REG_ANCHOR, REG_FORM, REG_FORM_CTRL,
  REG_FORM_VALID, REG_INTERACT, REG_LOGICAL_PSEUDO, REG_SHADOW_HOST,
  REG_TYPE_CHECK, REG_TYPE_DATE, REG_TYPE_RANGE, REG_TYPE_RESET,
  REG_TYPE_SUBMIT, REG_TYPE_TEXT, SELECTOR_ATTR, SELECTOR_CLASS, SELECTOR_ID,
  SELECTOR_PSEUDO_CLASS, SELECTOR_PSEUDO_ELEMENT, SELECTOR_TYPE, SHOW_ALL,
  SYNTAX_ERR, TARGET_ALL, TARGET_FIRST, TARGET_LINEAL, TARGET_SELF, TEXT_NODE,
  WALKER_FILTER
} from './constant.js';
const DIR_NEXT = 'next';
const DIR_PREV = 'prev';

/**
 * Finder
 * NOTE: #ast[i] corresponds to #nodes[i]
 * #ast: Array<Ast | undefined>
 * #nodes: Array<Nodes>
 * Ast: {
 *   branch: Array<Branch | undefined>,
 *   collected: boolean,
 *   dir: string | null,
 *   filtered: boolean,
 *   find: boolean
 * }
 * Branch: Array<Twig>
 * Twig: {
 *   combo: Leaf | null,
 *   leaves: Array<Leaf>
 * }
 * Leaf: {
 *   children: Array<Leaf | undefined> | null,
 *   loc: null,
 *   type: string
 * }
 * Nodes: Array<HTMLElement | undefined>
 */
export class Finder {
  /* private fields */
  #ast;
  #astCache;
  #descendant;
  #document;
  #documentCache;
  #event;
  #invalidate;
  #invalidateResults;
  #matcher;
  #node;
  #nodes;
  #noexcept;
  #qswalker;
  #results;
  #root;
  #shadow;
  #walker;
  #walkers;
  #warn;
  #window;

  /**
   * construct
   * @param {object} window - window
   */
  constructor(window) {
    this.#window = window;
    this.#matcher = new Matcher();
    this.#astCache = new WeakMap();
    this.#documentCache = new WeakMap();
    this.#invalidateResults = new WeakMap();
    this.#results = new WeakMap();
  }

  /**
   * handle error
   * @param {Error} e - Error
   * @param {object} opt - options
   * @throws Error
   * @returns {void}
   */
  onError(e, opt = {}) {
    const noexcept = opt.noexcept ?? this.#noexcept;
    if (!noexcept) {
      if (e instanceof DOMException ||
          e instanceof this.#window.DOMException) {
        if (e.name === NOT_SUPPORTED_ERR) {
          if (this.#warn) {
            console.warn(e.message);
          }
        } else {
          throw new this.#window.DOMException(e.message, e.name);
        }
      } else {
        throw e;
      }
    }
  }

  /**
   * setup finder
   * @param {string} selector - CSS selector
   * @param {object} node - Document, DocumentFragment, Element node
   * @param {object} opt - options
   * @param {object} [opt.event] - MouseEvent, KeyboardEvent
   * @param {boolean} [opt.noexcept] - no exception
   * @param {boolean} [opt.warn] - console warn
   * @returns {object} - node
   */
  setup(selector, node, opt = {}) {
    const { event, noexcept, warn } = opt;
    this.#noexcept = !!noexcept;
    this.#warn = !!warn;
    this.#event = this._setEvent(event);
    this.#node = node;
    [this.#document, this.#root, this.#walker] = resolveContent(node);
    this.#shadow = isInShadowTree(node);
    [this.#ast, this.#nodes] = this._correspond(selector);
    this.#invalidateResults = new WeakMap();
    this.#walkers = new WeakMap();
    return node;
  }

  /**
   * set event
   * @private
   * @param {object} event - instance of KeyboardEvent, MouseEvent
   * @returns {object} - result
   */
  _setEvent(event) {
    // NOTE: PointerEvent not implemented in jsdom
    return (event instanceof this.#window.KeyboardEvent ||
            event instanceof this.#window.MouseEvent)
      ? event
      : null;
  }

  /**
   * correspond ast and nodes
   * @private
   * @param {string} selector - CSS selector
   * @returns {Array.<Array.<object|undefined>>} - array of ast and nodes
   */
  _correspond(selector) {
    const nodes = [];
    this.#descendant = false;
    this.#invalidate = false;
    let ast;
    if (this.#documentCache.has(this.#document)) {
      const cachedItem = this.#documentCache.get(this.#document);
      if (cachedItem && cachedItem.has(`${selector}`)) {
        const item = cachedItem.get(`${selector}`);
        ast = item.ast;
        this.#descendant = item.descendant;
        this.#invalidate = item.invalidate;
      }
    }
    if (ast) {
      const l = ast.length;
      for (let i = 0; i < l; i++) {
        ast[i].collected = false;
        ast[i].dir = null;
        ast[i].filtered = false;
        ast[i].find = false;
        nodes[i] = [];
      }
    } else {
      let cssAst;
      try {
        cssAst = parseSelector(selector);
      } catch (e) {
        this.onError(e);
      }
      const { branches, info: { hasHasPseudoFunc } } = walkAST(cssAst);
      let invalidate = !!hasHasPseudoFunc;
      let descendant = false;
      let i = 0;
      ast = [];
      for (const [...items] of branches) {
        const branch = [];
        let item = items.shift();
        if (item && item.type !== COMBINATOR) {
          const leaves = new Set();
          while (item) {
            if (item.type === COMBINATOR) {
              const [nextItem] = items;
              if (nextItem.type === COMBINATOR) {
                throw new DOMException(`Invalid selector ${selector}`,
                  SYNTAX_ERR);
              }
              const itemName = item.name;
              if (/^[\s>]$/.test(itemName)) {
                descendant = true;
              } else {
                invalidate = true;
              }
              branch.push({
                combo: item,
                leaves: sortAST(leaves)
              });
              leaves.clear();
            } else if (item) {
              let { name: itemName } = item;
              if (itemName && typeof itemName === 'string') {
                itemName = unescapeSelector(itemName);
                if (typeof itemName === 'string' && itemName !== item.name) {
                  item.name = itemName;
                }
                if (/[|:]/.test(itemName)) {
                  item.namespace = true;
                }
              }
              leaves.add(item);
            }
            if (items.length) {
              item = items.shift();
            } else {
              branch.push({
                combo: null,
                leaves: sortAST(leaves)
              });
              leaves.clear();
              break;
            }
          }
        }
        ast.push({
          branch,
          collected: false,
          dir: null,
          filtered: false,
          find: false
        });
        nodes[i] = [];
        i++;
      }
      let cachedItem;
      if (this.#documentCache.has(this.#document)) {
        cachedItem = this.#documentCache.get(this.#document);
      } else {
        cachedItem = new Map();
      }
      cachedItem.set(`${selector}`, {
        ast,
        descendant,
        invalidate
      });
      this.#documentCache.set(this.#document, cachedItem);
      this.#descendant = descendant;
      this.#invalidate = invalidate;
    }
    return [
      ast,
      nodes
    ];
  }

  /**
   * create tree walker
   * @private
   * @param {object} node - Document, DocumentFragment, Element node
   * @returns {object} - tree walker
   */
  _createTreeWalker(node) {
    let walker;
    if (this.#walkers.has(node)) {
      walker = this.#walkers.get(node);
    } else {
      walker = this.#document.createTreeWalker(node, WALKER_FILTER);
      this.#walkers.set(node, walker);
    }
    return walker;
  }

  /**
   * prepare querySelector walker
   * @private
   * @returns {object} - tree walker
   */
  _prepareQuerySelectorWalker() {
    this.#qswalker = this._createTreeWalker(this.#node);
    return this.#qswalker;
  }

  /**
   * collect nth child
   * @private
   * @param {object} anb - An+B options
   * @param {number} anb.a - a
   * @param {number} anb.b - b
   * @param {boolean} [anb.reverse] - reverse order
   * @param {object} [anb.selector] - AST
   * @param {object} node - Element node
   * @param {object} opt - options
   * @returns {Set.<object>} - collection of matched nodes
   */
  _collectNthChild(anb, node, opt) {
    const { a, b, reverse, selector } = anb;
    const { parentNode } = node;
    const matched = new Set();
    let selectorBranches;
    if (selector) {
      if (this.#astCache.has(selector)) {
        selectorBranches = this.#astCache.get(selector);
      } else {
        const { branches, info } = walkAST(selector);
        selectorBranches = branches;
        this.#astCache.set(selector, selectorBranches);
        if (info.hasLogicalPseudoFunc) {
          this.#invalidate = true;
        }
      }
    }
    if (parentNode) {
      const walker = this.#walker;
      let refNode = traverseNode(parentNode, walker);
      refNode = walker.firstChild();
      let l = 0;
      while (refNode) {
        l++;
        refNode = walker.nextSibling();
      }
      const selectorNodes = new Set();
      if (selectorBranches) {
        refNode = traverseNode(parentNode, walker);
        refNode = walker.firstChild();
        while (refNode) {
          const { display, visibility } =
            this.#window.getComputedStyle(refNode);
          if (display !== 'none' && visibility !== 'hidden') {
            let bool;
            for (const leaves of selectorBranches) {
              bool = this._matchLeaves(leaves, refNode, opt);
              if (!bool) {
                break;
              }
            }
            if (bool) {
              selectorNodes.add(refNode);
            }
          }
          refNode = walker.nextSibling();
        }
      }
      // :first-child, :last-child, :nth-child(b of S), :nth-last-child(b of S)
      if (a === 0) {
        if (b > 0 && b <= l) {
          if (selectorNodes.size) {
            refNode = traverseNode(parentNode, walker);
            if (reverse) {
              refNode = walker.lastChild();
            } else {
              refNode = walker.firstChild();
            }
            let i = 0;
            while (refNode) {
              if (selectorNodes.has(refNode)) {
                if (i === b - 1) {
                  matched.add(refNode);
                  break;
                }
                i++;
              }
              if (reverse) {
                refNode = walker.previousSibling();
              } else {
                refNode = walker.nextSibling();
              }
            }
          } else if (!selector) {
            refNode = traverseNode(parentNode, walker);
            if (reverse) {
              refNode = walker.lastChild();
            } else {
              refNode = walker.firstChild();
            }
            let i = 0;
            while (refNode) {
              if (i === b - 1) {
                matched.add(refNode);
                break;
              }
              if (reverse) {
                refNode = walker.previousSibling();
              } else {
                refNode = walker.nextSibling();
              }
              i++;
            }
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
          refNode = traverseNode(parentNode, walker);
          if (reverse) {
            refNode = walker.lastChild();
          } else {
            refNode = walker.firstChild();
          }
          let i = 0;
          let j = a > 0 ? 0 : b - 1;
          while (refNode) {
            if (refNode && nth >= 0 && nth < l) {
              if (selectorNodes.size) {
                if (selectorNodes.has(refNode)) {
                  if (j === nth) {
                    matched.add(refNode);
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
                  matched.add(refNode);
                }
                nth += a;
              }
              if (reverse) {
                refNode = walker.previousSibling();
              } else {
                refNode = walker.nextSibling();
              }
              i++;
            } else {
              break;
            }
          }
        }
      }
      if (reverse && matched.size > 1) {
        const m = [...matched];
        return new Set(m.reverse());
      }
    } else if (node === this.#root && (a + b) === 1) {
      if (selectorBranches) {
        let bool;
        for (const leaves of selectorBranches) {
          bool = this._matchLeaves(leaves, node, opt);
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
    return matched;
  }

  /**
   * collect nth of type
   * @private
   * @param {object} anb - An+B options
   * @param {number} anb.a - a
   * @param {number} anb.b - b
   * @param {boolean} [anb.reverse] - reverse order
   * @param {object} node - Element node
   * @returns {Set.<object>} - collection of matched nodes
   */
  _collectNthOfType(anb, node) {
    const { a, b, reverse } = anb;
    const { localName, namespaceURI, parentNode, prefix } = node;
    const matched = new Set();
    if (parentNode) {
      const walker = this.#walker;
      let refNode = traverseNode(parentNode, walker);
      refNode = walker.firstChild();
      let l = 0;
      while (refNode) {
        l++;
        refNode = walker.nextSibling();
      }
      // :first-of-type, :last-of-type
      if (a === 0) {
        if (b > 0 && b <= l) {
          refNode = traverseNode(parentNode, walker);
          if (reverse) {
            refNode = walker.lastChild();
          } else {
            refNode = walker.firstChild();
          }
          let j = 0;
          while (refNode) {
            const {
              localName: itemLocalName, namespaceURI: itemNamespaceURI,
              prefix: itemPrefix
            } = refNode;
            if (itemLocalName === localName && itemPrefix === prefix &&
                itemNamespaceURI === namespaceURI) {
              if (j === b - 1) {
                matched.add(refNode);
                break;
              }
              j++;
            }
            if (reverse) {
              refNode = walker.previousSibling();
            } else {
              refNode = walker.nextSibling();
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
          refNode = traverseNode(parentNode, walker);
          if (reverse) {
            refNode = walker.lastChild();
          } else {
            refNode = walker.firstChild();
          }
          let j = a > 0 ? 0 : b - 1;
          while (refNode) {
            const {
              localName: itemLocalName, namespaceURI: itemNamespaceURI,
              prefix: itemPrefix
            } = refNode;
            if (itemLocalName === localName && itemPrefix === prefix &&
                itemNamespaceURI === namespaceURI) {
              if (j === nth) {
                matched.add(refNode);
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
            if (reverse) {
              refNode = walker.previousSibling();
            } else {
              refNode = walker.nextSibling();
            }
          }
        }
      }
      if (reverse && matched.size > 1) {
        const m = [...matched];
        return new Set(m.reverse());
      }
    } else if (node === this.#root && (a + b) === 1) {
      matched.add(node);
    }
    return matched;
  }

  /**
   * match An+B
   * @private
   * @param {object} ast - AST
   * @param {object} node - Element node
   * @param {string} nthName - nth pseudo-class name
   * @param {object} opt - options
   * @returns {Set.<object>} - collection of matched nodes
   */
  _matchAnPlusB(ast, node, nthName, opt) {
    const {
      nth: {
        a,
        b,
        name: nthIdentName
      },
      selector
    } = ast;
    const anbMap = new Map();
    if (nthIdentName) {
      if (nthIdentName === 'even') {
        anbMap.set('a', 2);
        anbMap.set('b', 0);
      } else if (nthIdentName === 'odd') {
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
    if (/^nth-(?:last-)?child$/.test(nthName)) {
      if (selector) {
        anbMap.set('selector', selector);
      }
      const anb = Object.fromEntries(anbMap);
      const nodes = this._collectNthChild(anb, node, opt);
      return nodes;
    } else if (/^nth-(?:last-)?of-type$/.test(nthName)) {
      const anb = Object.fromEntries(anbMap);
      const nodes = this._collectNthOfType(anb, node);
      return nodes;
    }
    return new Set();
  }

  /**
   * match :has() pseudo-class function
   * @private
   * @param {Array.<object>} astLeaves - AST leaves
   * @param {object} node - Element node
   * @param {object} opt - options
   * @returns {boolean} - result
   */
  _matchHasPseudoFunc(astLeaves, node, opt = {}) {
    let bool;
    if (Array.isArray(astLeaves) && astLeaves.length) {
      const leaves = astLeaves.map(i => i);
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
      opt.dir = DIR_NEXT;
      const nodes = this._matchCombinator(twig, node, opt);
      if (nodes.size) {
        if (leaves.length) {
          for (const nextNode of nodes) {
            bool = this._matchHasPseudoFunc(leaves, nextNode, opt);
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
   * @private
   * @param {object} astData - AST data
   * @param {object} node - Element node
   * @param {object} opt - options
   * @returns {?object} - matched node
   */
  _matchLogicalPseudoFunc(astData, node, opt = {}) {
    const {
      astName = '', branches = [], selector = '', twigBranches = []
    } = astData;
    let res;
    if (astName === 'has') {
      if (selector.includes(':has(')) {
        res = null;
      } else {
        let bool;
        for (const leaves of branches) {
          bool = this._matchHasPseudoFunc(leaves, node, opt);
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
      opt.forgive = forgive;
      const l = twigBranches.length;
      let bool;
      for (let i = 0; i < l; i++) {
        const branch = twigBranches[i];
        const lastIndex = branch.length - 1;
        const { leaves } = branch[lastIndex];
        bool = this._matchLeaves(leaves, node, opt);
        if (bool && lastIndex > 0) {
          let nextNodes = new Set([node]);
          for (let j = lastIndex - 1; j >= 0; j--) {
            const twig = branch[j];
            const arr = [];
            opt.dir = DIR_PREV;
            for (const nextNode of nextNodes) {
              const m = this._matchCombinator(twig, nextNode, opt);
              if (m.size) {
                arr.push(...m);
              }
            }
            if (arr.length) {
              if (j === 0) {
                bool = true;
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
   * @private
   * @see https://html.spec.whatwg.org/#pseudo-classes
   * @param {object} ast - AST
   * @param {object} node - Element node
   * @param {object} opt - options
   * @param {boolean} [opt.forgive] - forgive unknown pseudo-class
   * @param {boolean} [opt.warn] - warn unsupported pseudo-class
   * @returns {Set.<object>} - collection of matched nodes
   */
  _matchPseudoClassSelector(ast, node, opt = {}) {
    const { children: astChildren, name: astName } = ast;
    const { localName, parentNode } = node;
    const {
      forgive,
      warn = this.#warn
    } = opt;
    const matched = new Set();
    // :has(), :is(), :not(), :where()
    if (REG_LOGICAL_PSEUDO.test(astName)) {
      let astData;
      if (this.#astCache.has(ast)) {
        astData = this.#astCache.get(ast);
      } else {
        const { branches } = walkAST(ast);
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
        this.#astCache.set(ast, astData);
      }
      const res = this._matchLogicalPseudoFunc(astData, node, opt);
      if (res) {
        matched.add(res);
      }
    } else if (Array.isArray(astChildren)) {
      // :nth-child(), :nth-last-child(), nth-of-type(), :nth-last-of-type()
      if (/^nth-(?:last-)?(?:child|of-type)$/.test(astName)) {
        const [branch] = astChildren;
        const nodes = this._matchAnPlusB(branch, node, astName, opt);
        return nodes;
      } else {
        switch (astName) {
          // :dir(), :lang()
          case 'dir':
          case 'lang': {
            const res = this.#matcher.matchSelector(ast, node, opt, true);
            if (res) {
              matched.add(res);
            }
            break;
          }
          // :state()
          case 'state': {
            if (isCustomElement(node)) {
              const [{ value: stateValue }] = astChildren;
              if (stateValue) {
                if (node[stateValue]) {
                  matched.add(node);
                } else {
                  for (const i in node) {
                    const prop = node[i];
                    if (prop instanceof this.#window.ElementInternals) {
                      if (prop?.states?.has(stateValue)) {
                        matched.add(node);
                      }
                      break;
                    }
                  }
                }
              }
            }
            break;
          }
          case 'current':
          case 'nth-col':
          case 'nth-last-col': {
            if (warn) {
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
          // dropped from CSS Selectors 3
          case 'contains': {
            if (warn) {
              throw new DOMException(`Unknown pseudo-class :${astName}()`,
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
      switch (astName) {
        case 'any-link':
        case 'link': {
          if (REG_ANCHOR.test(localName) && node.hasAttribute('href')) {
            matched.add(node);
          }
          break;
        }
        case 'local-link': {
          if (REG_ANCHOR.test(localName) && node.hasAttribute('href')) {
            const { href, origin, pathname } = new URL(this.#document.URL);
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
        case 'hover': {
          const { target, type } = this.#event ?? {};
          if ((type === 'mouseover' || type === 'pointerover') &&
              node.contains(target)) {
            matched.add(node);
          }
          break;
        }
        case 'active': {
          const { buttons, target, type } = this.#event ?? {};
          if ((type === 'mousedown' || type === 'pointerdown') &&
              buttons & BIT_01 && node.contains(target)) {
            matched.add(node);
          }
          break;
        }
        case 'target': {
          const { hash } = new URL(this.#document.URL);
          if (node.id && hash === `#${node.id}` &&
              this.#document.contains(node)) {
            matched.add(node);
          }
          break;
        }
        case 'target-within': {
          const { hash } = new URL(this.#document.URL);
          if (hash) {
            const id = hash.replace(/^#/, '');
            let current = this.#document.getElementById(id);
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
            if (!this.#shadow && node === this.#node) {
              matched.add(node);
            }
          } else if (node === this.#document.documentElement) {
            matched.add(node);
          }
          break;
        }
        case 'focus':
        case 'focus-visible': {
          const { target, type } = this.#event ?? {};
          if (node === this.#document.activeElement && node.tabIndex >= 0 &&
              (astName === 'focus' ||
               (type === 'keydown' && node.contains(target)))) {
            let refNode = node;
            let focus = true;
            while (refNode) {
              if (refNode.disabled || refNode.hasAttribute('disabled') ||
                  refNode.hidden || refNode.hasAttribute('hidden')) {
                focus = false;
                break;
              } else {
                const { display, visibility } =
                  this.#window.getComputedStyle(refNode);
                focus = !(display === 'none' || visibility === 'hidden');
                if (!focus) {
                  break;
                }
              }
              if (refNode.parentNode &&
                  refNode.parentNode.nodeType === ELEMENT_NODE) {
                refNode = refNode.parentNode;
              } else {
                break;
              }
            }
            if (focus) {
              matched.add(node);
            }
          }
          break;
        }
        case 'focus-within': {
          let active;
          let current = this.#document.activeElement;
          if (current.tabIndex >= 0) {
            while (current) {
              if (current === node) {
                active = true;
                break;
              }
              current = current.parentNode;
            }
          }
          if (active) {
            let refNode = node;
            let focus = true;
            while (refNode) {
              if (refNode.disabled || refNode.hasAttribute('disabled') ||
                  refNode.hidden || refNode.hasAttribute('hidden')) {
                focus = false;
                break;
              } else {
                const { display, visibility } =
                  this.#window.getComputedStyle(refNode);
                focus = !(display === 'none' || visibility === 'hidden');
                if (!focus) {
                  break;
                }
              }
              if (refNode.parentNode &&
                  refNode.parentNode.nodeType === ELEMENT_NODE) {
                refNode = refNode.parentNode;
              } else {
                break;
              }
            }
            if (focus) {
              matched.add(node);
            }
          }
          break;
        }
        case 'open': {
          if (REG_INTERACT.test(localName) && node.hasAttribute('open')) {
            matched.add(node);
          }
          break;
        }
        case 'closed': {
          if (REG_INTERACT.test(localName) && !node.hasAttribute('open')) {
            matched.add(node);
          }
          break;
        }
        case 'disabled': {
          if (REG_FORM_CTRL.test(localName) ||
              isCustomElement(node, { formAssociated: true })) {
            if (node.disabled || node.hasAttribute('disabled')) {
              matched.add(node);
            } else if (node.localName === 'option') {
              if (parentNode.localName === 'optgroup' &&
                  (parentNode.disabled ||
                   parentNode.hasAttribute('disabled'))) {
                matched.add(node);
              }
            } else if (node.localName !== 'optgroup') {
              let bool;
              let parent = parentNode;
              while (parent) {
                if (parent.localName === 'fieldset' &&
                    (parent.disabled || parent.hasAttribute('disabled'))) {
                  const walker = this.#walker;
                  let refNode = traverseNode(parent, walker);
                  refNode = walker.firstChild();
                  while (refNode) {
                    if (refNode.localName === 'legend') {
                      break;
                    }
                    refNode = walker.nextSibling();
                  }
                  if (refNode) {
                    if (!refNode.contains(node)) {
                      bool = true;
                    }
                  } else {
                    bool = true;
                  }
                  break;
                } else if (parent.localName === 'form') {
                  break;
                } else if (parent.parentNode?.nodeType === ELEMENT_NODE) {
                  if (parent.parentNode.localName === 'form') {
                    break;
                  } else {
                    parent = parent.parentNode;
                  }
                } else {
                  break;
                }
              }
              if (bool) {
                matched.add(node);
              }
            }
          }
          break;
        }
        case 'enabled': {
          if ((REG_FORM_CTRL.test(localName) ||
               isCustomElement(node, { formAssociated: true })) &&
              !(node.disabled && node.hasAttribute('disabled'))) {
            if (node.localName === 'optgroup') {
              matched.add(node);
            } else if (node.localName === 'option') {
              if (parentNode.localName !== 'optgroup' ||
                  !(parentNode.disabled ||
                    parentNode.hasAttribute('disabled'))) {
                matched.add(node);
              }
            } else {
              let bool;
              let parent = parentNode;
              while (parent) {
                if (parent.localName === 'fieldset' &&
                    (parent.disabled || parent.hasAttribute('disabled'))) {
                  const walker = this.#walker;
                  let refNode = traverseNode(parent, walker);
                  refNode = walker.firstChild();
                  while (refNode) {
                    if (refNode.localName === 'legend') {
                      break;
                    }
                    refNode = walker.nextSibling();
                  }
                  if (refNode) {
                    if (!refNode.contains(node)) {
                      bool = true;
                    }
                  } else {
                    bool = true;
                  }
                  break;
                } else if (parent.localName === 'form') {
                  break;
                } else if (parent.parentNode?.nodeType === ELEMENT_NODE) {
                  if (parent.parentNode.localName === 'form') {
                    break;
                  } else {
                    parent = parent.parentNode;
                  }
                } else {
                  break;
                }
              }
              if (!bool) {
                matched.add(node);
              }
            }
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
              if ((!node.type || REG_TYPE_DATE.test(node.type) ||
                   REG_TYPE_TEXT.test(node.type)) &&
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
              if ((!node.type || REG_TYPE_DATE.test(node.type) ||
                   REG_TYPE_TEXT.test(node.type)) &&
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
          let placeholder;
          if (node.placeholder) {
            placeholder = node.placeholder;
          } else if (node.hasAttribute('placeholder')) {
            placeholder = node.getAttribute('placeholder');
          }
          if (typeof placeholder === 'string' && !/[\r\n]/.test(placeholder)) {
            let targetNode;
            if (localName === 'textarea') {
              targetNode = node;
            } else if (localName === 'input') {
              if (node.hasAttribute('type')) {
                if (REG_TYPE_TEXT.test(node.getAttribute('type'))) {
                  targetNode = node;
                }
              } else {
                targetNode = node;
              }
            }
            if (targetNode && node.value === '') {
              matched.add(node);
            }
          }
          break;
        }
        case 'checked': {
          if ((node.checked && localName === 'input' &&
               node.hasAttribute('type') &&
               REG_TYPE_CHECK.test(node.getAttribute('type'))) ||
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
              parent = this.#document.documentElement;
            }
            const items = parent.getElementsByTagName('input');
            const l = items.length;
            let checked;
            for (let i = 0; i < l; i++) {
              const item = items[i];
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
                 REG_TYPE_RESET.test(node.getAttribute('type')))) ||
              (localName === 'input' && node.hasAttribute('type') &&
               REG_TYPE_SUBMIT.test(node.getAttribute('type')))) {
            let form = node.parentNode;
            while (form) {
              if (form.localName === 'form') {
                break;
              }
              form = form.parentNode;
            }
            if (form) {
              const walker = this.#walker;
              let nextNode = traverseNode(form, walker);
              nextNode = walker.firstChild();
              while (nextNode && form.contains(nextNode)) {
                const nodeName = nextNode.localName;
                let m;
                if (nodeName === 'button') {
                  m = !(nextNode.hasAttribute('type') &&
                    REG_TYPE_RESET.test(nextNode.getAttribute('type')));
                } else if (nodeName === 'input') {
                  m = nextNode.hasAttribute('type') &&
                    REG_TYPE_SUBMIT.test(nextNode.getAttribute('type'));
                }
                if (m) {
                  if (nextNode === node) {
                    matched.add(node);
                  }
                  break;
                }
                nextNode = walker.nextNode();
              }
            }
          // input[type="checkbox"], input[type="radio"]
          } else if (localName === 'input' && node.hasAttribute('type') &&
                     REG_TYPE_CHECK.test(node.getAttribute('type')) &&
                     node.hasAttribute('checked')) {
            matched.add(node);
          // option
          } else if (localName === 'option' && node.hasAttribute('selected')) {
            matched.add(node);
          }
          break;
        }
        case 'valid': {
          if (REG_FORM_VALID.test(localName)) {
            if (node.checkValidity()) {
              if (node.maxLength >= 0) {
                if (node.maxLength >= node.value.length) {
                  matched.add(node);
                }
              } else {
                matched.add(node);
              }
            }
          } else if (localName === 'fieldset') {
            const walker = this.#walker;
            let refNode = traverseNode(node, walker);
            refNode = walker.firstChild();
            let bool;
            if (!refNode) {
              bool = true;
            } else {
              while (refNode && node.contains(refNode)) {
                if (REG_FORM_VALID.test(refNode.localName)) {
                  if (refNode.checkValidity()) {
                    if (refNode.maxLength >= 0) {
                      bool = refNode.maxLength >= refNode.value.length;
                    } else {
                      bool = true;
                    }
                  } else {
                    bool = false;
                  }
                  if (!bool) {
                    break;
                  }
                }
                refNode = walker.nextNode();
              }
            }
            if (bool) {
              matched.add(node);
            }
          }
          break;
        }
        case 'invalid': {
          if (REG_FORM_VALID.test(localName)) {
            if (node.checkValidity()) {
              if (node.maxLength >= 0 && node.maxLength < node.value.length) {
                matched.add(node);
              }
            } else {
              matched.add(node);
            }
          } else if (localName === 'fieldset') {
            const walker = this.#walker;
            let refNode = traverseNode(node, walker);
            refNode = walker.firstChild();
            let bool;
            if (!refNode) {
              bool = true;
            } else {
              while (refNode && node.contains(refNode)) {
                if (REG_FORM_VALID.test(refNode.localName)) {
                  if (refNode.checkValidity()) {
                    if (refNode.maxLength >= 0) {
                      bool = refNode.maxLength >= refNode.value.length;
                    } else {
                      bool = true;
                    }
                  } else {
                    bool = false;
                  }
                  if (!bool) {
                    break;
                  }
                }
                refNode = walker.nextNode();
              }
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
              REG_TYPE_RANGE.test(node.getAttribute('type')) &&
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
              REG_TYPE_RANGE.test(node.getAttribute('type')) &&
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
              if (inputType === 'file' || REG_TYPE_CHECK.test(inputType) ||
                  REG_TYPE_DATE.test(inputType) ||
                  REG_TYPE_TEXT.test(inputType)) {
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
              if (inputType === 'file' || REG_TYPE_CHECK.test(inputType) ||
                  REG_TYPE_DATE.test(inputType) ||
                  REG_TYPE_TEXT.test(inputType)) {
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
          if (node === this.#document.documentElement) {
            matched.add(node);
          }
          break;
        }
        case 'empty': {
          if (node.hasChildNodes()) {
            const walker = this.#document.createTreeWalker(node, SHOW_ALL);
            let refNode = walker.firstChild();
            let bool;
            while (refNode) {
              bool = refNode.nodeType !== ELEMENT_NODE &&
                refNode.nodeType !== TEXT_NODE;
              if (!bool) {
                break;
              }
              refNode = walker.nextSibling();
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
              node === this.#root) {
            matched.add(node);
          }
          break;
        }
        case 'last-child': {
          if ((parentNode && node === parentNode.lastElementChild) ||
              node === this.#root) {
            matched.add(node);
          }
          break;
        }
        case 'only-child': {
          if ((parentNode && node === parentNode.firstElementChild &&
               node === parentNode.lastElementChild) || node === this.#root) {
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
          } else if (node === this.#root) {
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
          } else if (node === this.#root) {
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
          } else if (node === this.#root) {
            matched.add(node);
          }
          break;
        }
        case 'defined': {
          if (node.hasAttribute('is') || localName.includes('-')) {
            if (isCustomElement(node)) {
              matched.add(node);
            }
          // NOTE: MathMLElement not implemented in jsdom
          } else if (node instanceof this.#window.HTMLElement ||
                     node instanceof this.#window.SVGElement) {
            matched.add(node);
          }
          break;
        }
        case 'popover-open': {
          if (node.popover) {
            const { display } = this.#window.getComputedStyle(node);
            if (display !== 'none') {
              matched.add(node);
            }
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
          if (warn) {
            throw new DOMException(`Unsupported pseudo-element ::${astName}`,
              NOT_SUPPORTED_ERR);
          }
          break;
        }
        // not supported
        case 'autofill':
        case 'blank':
        case 'buffering':
        case 'current':
        case 'fullscreen':
        case 'future':
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
          if (warn) {
            throw new DOMException(`Unsupported pseudo-class :${astName}`,
              NOT_SUPPORTED_ERR);
          }
          break;
        }
        default: {
          if (astName.startsWith('-webkit-')) {
            if (warn) {
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
   * match shadow host pseudo class
   * @private
   * @param {object} ast - AST
   * @param {object} node - DocumentFragment node
   * @returns {?object} - matched node
   */
  _matchShadowHostPseudoClass(ast, node) {
    const { children: astChildren, name: astName } = ast;
    let res;
    if (Array.isArray(astChildren)) {
      const { branches } = walkAST(astChildren[0]);
      const [branch] = branches;
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
   * @private
   * @param {object} ast - AST
   * @param {object} node - Document, DocumentFragment, Element node
   * @param {object} [opt] - options
   * @returns {Set.<object>} - collection of matched nodes
   */
  _matchSelector(ast, node, opt) {
    const { type: astType } = ast;
    const matched = new Set();
    if (ast.name === EMPTY) {
      return matched;
    }
    const astName = unescapeSelector(ast.name);
    if (typeof astName === 'string' && astName !== ast.name) {
      ast.name = astName;
    }
    if (node.nodeType === ELEMENT_NODE) {
      switch (astType) {
        case SELECTOR_PSEUDO_ELEMENT: {
          this.#matcher.matchPseudoElementSelector(astName, opt);
          break;
        }
        case SELECTOR_ID: {
          if (node.id === astName) {
            matched.add(node);
          }
          break;
        }
        case SELECTOR_CLASS: {
          if (node.classList.contains(astName)) {
            matched.add(node);
          }
          break;
        }
        case SELECTOR_PSEUDO_CLASS: {
          const nodes = this._matchPseudoClassSelector(ast, node, opt);
          return nodes;
        }
        default: {
          const res = this.#matcher.matchSelector(ast, node, opt, true);
          if (res) {
            matched.add(res);
          }
        }
      }
    } else if (this.#shadow && astType === SELECTOR_PSEUDO_CLASS &&
               node.nodeType === DOCUMENT_FRAGMENT_NODE) {
      if (astName !== 'has' && REG_LOGICAL_PSEUDO.test(astName)) {
        const nodes = this._matchPseudoClassSelector(ast, node, opt);
        return nodes;
      } else if (REG_SHADOW_HOST.test(astName)) {
        const res = this._matchShadowHostPseudoClass(ast, node, opt);
        if (res) {
          matched.add(res);
        }
      }
    }
    return matched;
  }

  /**
   * match leaves
   * @private
   * @param {Array.<object>} leaves - AST leaves
   * @param {object} node - node
   * @param {object} opt - options
   * @returns {boolean} - result
   */
  _matchLeaves(leaves, node, opt) {
    let bool;
    let result;
    if (this.#invalidate) {
      result = this.#invalidateResults.get(leaves);
    } else {
      result = this.#results.get(leaves);
    }
    if (result && result.has(node)) {
      const { matched } = result.get(node);
      bool = matched;
    }
    if (typeof bool !== 'boolean') {
      let cacheable = true;
      if (node.nodeType === ELEMENT_NODE && REG_FORM.test(node.localName)) {
        cacheable = false;
      }
      for (const leaf of leaves) {
        switch (leaf.type) {
          case SELECTOR_ATTR:
          case SELECTOR_ID: {
            cacheable = false;
            break;
          }
          case SELECTOR_PSEUDO_CLASS: {
            if (/^(?:(?:any-)?link|defined|dir)$/.test(leaf.name)) {
              cacheable = false;
            }
            break;
          }
          default:
        }
        bool = this._matchSelector(leaf, node, opt).has(node);
        if (!bool) {
          break;
        }
      }
      if (cacheable) {
        if (!result) {
          result = new WeakMap();
        }
        result.set(node, {
          matched: bool
        });
        if (this.#invalidate) {
          this.#invalidateResults.set(leaves, result);
        } else {
          this.#results.set(leaves, result);
        }
      }
    }
    return !!bool;
  }

  /**
   * match HTML collection
   * @private
   * @param {object} items - HTML collection
   * @param {object} opt - options
   * @returns {Set.<object>} - matched nodes
   */
  _matchHTMLCollection(items, opt = {}) {
    const { compound, filterLeaves } = opt;
    const nodes = new Set();
    const l = items.length;
    if (l) {
      if (compound) {
        for (let i = 0; i < l; i++) {
          const item = items[i];
          const bool = this._matchLeaves(filterLeaves, item, opt);
          if (bool) {
            nodes.add(item);
          }
        }
      } else {
        const arr = [].slice.call(items);
        return new Set(arr);
      }
    }
    return nodes;
  }

  /**
   * find descendant nodes
   * @private
   * @param {Array.<object>} leaves - AST leaves
   * @param {object} baseNode - base Element node
   * @param {object} opt - options
   * @returns {object} - collection of nodes and pending state
   */
  _findDescendantNodes(leaves, baseNode, opt) {
    const [leaf, ...filterLeaves] = leaves;
    const compound = filterLeaves.length > 0;
    const { type: leafType } = leaf;
    const leafName = unescapeSelector(leaf.name);
    if (typeof leafName === 'string' && leafName !== leaf.name) {
      leaf.name = leafName;
    }
    let nodes = new Set();
    let pending = false;
    if (this.#shadow) {
      pending = true;
    } else {
      switch (leafType) {
        case SELECTOR_PSEUDO_ELEMENT: {
          this.#matcher.matchPseudoElementSelector(leafName, opt);
          break;
        }
        case SELECTOR_ID: {
          if (this.#root.nodeType === ELEMENT_NODE) {
            pending = true;
          } else {
            const node = this.#root.getElementById(leafName);
            if (node && node !== baseNode && baseNode.contains(node)) {
              if (compound) {
                const bool = this._matchLeaves(filterLeaves, node, opt);
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
          const items = baseNode.getElementsByClassName(leafName);
          nodes = this._matchHTMLCollection(items, {
            compound,
            filterLeaves
          });
          break;
        }
        case SELECTOR_TYPE: {
          if (this.#document.contentType === 'text/html' &&
              !/[*|]/.test(leafName)) {
            const items = baseNode.getElementsByTagName(leafName);
            nodes = this._matchHTMLCollection(items, {
              compound,
              filterLeaves
            });
          } else {
            pending = true;
          }
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
   * @private
   * @param {object} twig - twig
   * @param {object} node - Element node
   * @param {object} opt - option
   * @returns {Set.<object>} - collection of matched nodes
   */
  _matchCombinator(twig, node, opt = {}) {
    const { combo, leaves } = twig;
    const { name: comboName } = combo;
    const { parentNode } = node;
    const { dir } = opt;
    const matched = new Set();
    if (dir === DIR_NEXT) {
      switch (comboName) {
        case '+': {
          const refNode = node.nextElementSibling;
          if (refNode) {
            const bool = this._matchLeaves(leaves, refNode, opt);
            if (bool) {
              matched.add(refNode);
            }
          }
          break;
        }
        case '~': {
          if (parentNode) {
            const walker = this._createTreeWalker(parentNode);
            let refNode = traverseNode(node, walker);
            refNode = walker.nextSibling();
            while (refNode) {
              const bool = this._matchLeaves(leaves, refNode, opt);
              if (bool) {
                matched.add(refNode);
              }
              refNode = walker.nextSibling();
            }
          }
          break;
        }
        case '>': {
          const walker = this._createTreeWalker(node);
          let refNode = traverseNode(node, walker);
          refNode = walker.firstChild();
          while (refNode) {
            const bool = this._matchLeaves(leaves, refNode, opt);
            if (bool) {
              matched.add(refNode);
            }
            refNode = walker.nextSibling();
          }
          break;
        }
        case ' ':
        default: {
          const { nodes, pending } = this._findDescendantNodes(leaves, node);
          if (nodes.size) {
            return nodes;
          }
          if (pending) {
            const walker = this._createTreeWalker(node);
            let refNode = traverseNode(node, walker);
            refNode = walker.nextNode();
            while (refNode && node.contains(refNode)) {
              const bool = this._matchLeaves(leaves, refNode, opt);
              if (bool) {
                matched.add(refNode);
              }
              refNode = walker.nextNode();
            }
          }
        }
      }
    } else {
      switch (comboName) {
        case '+': {
          const refNode = node.previousElementSibling;
          if (refNode) {
            const bool = this._matchLeaves(leaves, refNode, opt);
            if (bool) {
              matched.add(refNode);
            }
          }
          break;
        }
        case '~': {
          if (parentNode) {
            const walker = this._createTreeWalker(parentNode);
            let refNode = traverseNode(parentNode, walker);
            refNode = walker.firstChild();
            while (refNode) {
              if (refNode === node) {
                break;
              } else {
                const bool = this._matchLeaves(leaves, refNode, opt);
                if (bool) {
                  matched.add(refNode);
                }
              }
              refNode = walker.nextSibling();
            }
          }
          break;
        }
        case '>': {
          if (parentNode) {
            const bool = this._matchLeaves(leaves, parentNode, opt);
            if (bool) {
              matched.add(parentNode);
            }
          }
          break;
        }
        case ' ':
        default: {
          const arr = [];
          let refNode = parentNode;
          while (refNode) {
            const bool = this._matchLeaves(leaves, refNode, opt);
            if (bool) {
              arr.push(refNode);
            }
            refNode = refNode.parentNode;
          }
          if (arr.length) {
            return new Set(arr.reverse());
          }
        }
      }
    }
    return matched;
  }

  /**
   * find matched node from #qswalker
   * @private
   * @param {Array.<object>} leaves - AST leaves
   * @param {object} [opt] - options
   * @param {object} [opt.node] - node to start from
   * @returns {?object} - matched node
   */
  _findNode(leaves, opt) {
    const { node } = opt;
    const walker = this.#qswalker;
    let refNode = traverseNode(node, walker);
    let matchedNode;
    if (refNode) {
      if (refNode.nodeType !== ELEMENT_NODE) {
        refNode = walker.nextNode();
      } else if (refNode === node) {
        if (refNode !== this.#root) {
          refNode = walker.nextNode();
        }
      }
      while (refNode) {
        const matched = this._matchLeaves(leaves, refNode, {
          warn: this.#warn
        });
        if (matched) {
          matchedNode = refNode;
          break;
        }
        refNode = walker.nextNode();
      }
    }
    return matchedNode ?? null;
  }

  /**
   * match self
   * @private
   * @param {Array} leaves - AST leaves
   * @returns {Array} - [nodes, filtered]
   */
  _matchSelf(leaves) {
    const nodes = [];
    const bool = this._matchLeaves(leaves, this.#node, {
      warn: this.#warn
    });
    let filtered = false;
    if (bool) {
      nodes.push(this.#node);
      filtered = true;
    }
    return [nodes, filtered];
  }

  /**
   * find lineal
   * @private
   * @param {Array} leaves - AST leaves
   * @param {object} opt - options
   * @returns {Array} - [nodes, filtered]
   */
  _findLineal(leaves, opt = {}) {
    const { complex } = opt;
    const nodes = [];
    let bool = this._matchLeaves(leaves, this.#node, {
      warn: this.#warn
    });
    let filtered = false;
    if (bool) {
      nodes.push(this.#node);
      filtered = true;
    }
    if (!bool || complex) {
      let refNode = this.#node.parentNode;
      while (refNode) {
        bool = this._matchLeaves(leaves, refNode, {
          warn: this.#warn
        });
        if (bool) {
          nodes.push(refNode);
          filtered = true;
        }
        if (refNode.parentNode) {
          refNode = refNode.parentNode;
        } else {
          break;
        }
      }
    }
    return [nodes, filtered];
  }

  /**
   * find first
   * @private
   * @param {Array} leaves - AST leaves
   * @returns {Array} - [nodes, filtered]
   */
  _findFirst(leaves) {
    const nodes = [];
    const node = this._findNode(leaves, {
      node: this.#node
    });
    let filtered = false;
    if (node) {
      nodes.push(node);
      filtered = true;
    }
    return [nodes, filtered];
  }

  /**
   * find from HTML collection
   * @private
   * @param {object} items - HTML collection
   * @param {object} opt - options
   * @param {boolean} [opt.compound] - compound selector
   * @param {Array} [opt.filterLeaves] - filter leaves
   * @returns {Array} - [nodes, filtered]
   */
  _findFromHTMLCollection(items, opt = {}) {
    const { complex, compound, filterLeaves, targetType } = opt;
    let nodes = [];
    let filtered = false;
    let collected = false;
    const l = items.length;
    if (l) {
      if (this.#node.nodeType === ELEMENT_NODE) {
        for (let i = 0; i < l; i++) {
          const node = items[i];
          if (node !== this.#node &&
              (this.#node.contains(node) || node.contains(this.#node))) {
            if (compound) {
              const bool = this._matchLeaves(filterLeaves, node, {
                warn: this.#warn
              });
              if (bool) {
                nodes.push(node);
                filtered = true;
                if (targetType === TARGET_FIRST) {
                  break;
                }
              }
            } else {
              nodes.push(node);
              filtered = true;
              if (targetType === TARGET_FIRST) {
                break;
              }
            }
          }
        }
      } else if (complex) {
        if (compound) {
          for (let i = 0; i < l; i++) {
            const node = items[i];
            const bool = this._matchLeaves(filterLeaves, node, {
              warn: this.#warn
            });
            if (bool) {
              nodes.push(node);
              filtered = true;
              if (targetType === TARGET_FIRST) {
                break;
              }
            }
          }
        } else {
          nodes = [].slice.call(items);
          filtered = true;
          collected = true;
        }
      } else if (compound) {
        for (let i = 0; i < l; i++) {
          const node = items[i];
          const bool = this._matchLeaves(filterLeaves, node, {
            warn: this.#warn
          });
          if (bool) {
            nodes.push(node);
            filtered = true;
            if (targetType === TARGET_FIRST) {
              break;
            }
          }
        }
      } else {
        nodes = [].slice.call(items);
        filtered = true;
        collected = true;
      }
    }
    return [nodes, filtered, collected];
  }

  /**
   * find entry nodes
   * @private
   * @param {object} twig - twig
   * @param {string} targetType - target type
   * @param {boolean} complex - complex selector
   * @returns {object} - collection of nodes etc.
   */
  _findEntryNodes(twig, targetType, complex) {
    const { leaves } = twig;
    const [leaf, ...filterLeaves] = leaves;
    const compound = filterLeaves.length > 0;
    const { name: leafName, type: leafType } = leaf;
    let nodes = [];
    let collected = false;
    let filtered = false;
    let pending = false;
    switch (leafType) {
      case SELECTOR_PSEUDO_ELEMENT: {
        this.#matcher.matchPseudoElementSelector(leafName, {
          warn: this.#warn
        });
        break;
      }
      case SELECTOR_ID: {
        if (targetType === TARGET_SELF) {
          [nodes, filtered] = this._matchSelf(leaves);
        } else if (targetType === TARGET_LINEAL) {
          [nodes, filtered] = this._findLineal(leaves, {
            complex
          });
        } else if (targetType === TARGET_FIRST &&
                   this.#root.nodeType !== ELEMENT_NODE) {
          const node = this.#root.getElementById(leafName);
          if (node) {
            if (compound) {
              const bool = this._matchLeaves(filterLeaves, node, {
                warn: this.#warn
              });
              if (bool) {
                nodes.push(node);
                filtered = true;
              }
            } else {
              nodes.push(node);
              filtered = true;
            }
          }
        } else if (targetType === TARGET_FIRST) {
          [nodes, filtered] = this._findFirst(leaves);
        } else {
          pending = true;
        }
        break;
      }
      case SELECTOR_CLASS: {
        if (targetType === TARGET_SELF) {
          [nodes, filtered] = this._matchSelf(leaves);
        } else if (targetType === TARGET_LINEAL) {
          [nodes, filtered] = this._findLineal(leaves, {
            complex
          });
        } else if (this.#root.nodeType === DOCUMENT_NODE) {
          const items = this.#root.getElementsByClassName(leafName);
          if (items.length) {
            [nodes, filtered, collected] = this._findFromHTMLCollection(items, {
              complex,
              compound,
              filterLeaves,
              targetType
            });
          }
        } else if (targetType === TARGET_FIRST) {
          [nodes, filtered] = this._findFirst(leaves);
        } else {
          pending = true;
        }
        break;
      }
      case SELECTOR_TYPE: {
        if (targetType === TARGET_SELF) {
          [nodes, filtered] = this._matchSelf(leaves);
        } else if (targetType === TARGET_LINEAL) {
          [nodes, filtered] = this._findLineal(leaves, {
            complex
          });
        } else if (this.#document.contentType === 'text/html' &&
                   this.#root.nodeType === DOCUMENT_NODE &&
                   !/[*|]/.test(leafName)) {
          const items = this.#root.getElementsByTagName(leafName);
          if (items.length) {
            [nodes, filtered, collected] = this._findFromHTMLCollection(items, {
              complex,
              compound,
              filterLeaves,
              targetType
            });
          }
        } else if (targetType === TARGET_FIRST) {
          [nodes, filtered] = this._findFirst(leaves);
        } else {
          pending = true;
        }
        break;
      }
      default: {
        if (targetType !== TARGET_LINEAL && REG_SHADOW_HOST.test(leafName)) {
          if (this.#shadow &&
              this.#node.nodeType === DOCUMENT_FRAGMENT_NODE) {
            const node = this._matchShadowHostPseudoClass(leaf, this.#node);
            if (node) {
              nodes.push(node);
              filtered = true;
            }
          }
        } else if (targetType === TARGET_SELF) {
          [nodes, filtered] = this._matchSelf(leaves);
        } else if (targetType === TARGET_LINEAL) {
          [nodes, filtered] = this._findLineal(leaves, {
            complex
          });
        } else if (targetType === TARGET_FIRST) {
          [nodes, filtered] = this._findFirst(leaves);
        } else {
          pending = true;
        }
      }
    }
    return {
      collected,
      compound,
      filtered,
      nodes,
      pending
    };
  }

  /**
   * collect nodes
   * @private
   * @param {string} targetType - target type
   * @returns {Array.<Array.<object|undefined>>} - #ast and #nodes
   */
  _collectNodes(targetType) {
    const ast = this.#ast.values();
    if (targetType === TARGET_ALL || targetType === TARGET_FIRST) {
      const pendingItems = new Set();
      let i = 0;
      for (const { branch } of ast) {
        const branchLen = branch.length;
        const complex = branchLen > 1;
        const firstTwig = branch[0];
        let dir;
        let twig;
        if (complex) {
          const {
            combo: firstCombo,
            leaves: [{
              name: firstName,
              type: firstType
            }]
          } = firstTwig;
          const lastTwig = branch[branchLen - 1];
          const {
            leaves: [{
              name: lastName,
              type: lastType
            }]
          } = lastTwig;
          if (lastType === SELECTOR_PSEUDO_ELEMENT ||
              lastType === SELECTOR_ID) {
            dir = DIR_PREV;
            twig = lastTwig;
          } else if (firstType === SELECTOR_PSEUDO_ELEMENT ||
                     firstType === SELECTOR_ID) {
            dir = DIR_NEXT;
            twig = firstTwig;
          } else if (targetType === TARGET_ALL) {
            if (firstName === '*' && firstType === SELECTOR_TYPE) {
              dir = DIR_PREV;
              twig = lastTwig;
            } else if (lastName === '*' && lastType === SELECTOR_TYPE) {
              dir = DIR_NEXT;
              twig = firstTwig;
            } else if (branchLen === 2) {
              const { name: comboName } = firstCombo;
              if (/^[+~]$/.test(comboName)) {
                dir = DIR_PREV;
                twig = lastTwig;
              } else {
                dir = DIR_NEXT;
                twig = firstTwig;
              }
            } else {
              dir = DIR_NEXT;
              twig = firstTwig;
            }
          } else if (lastName === '*' && lastType === SELECTOR_TYPE) {
            dir = DIR_NEXT;
            twig = firstTwig;
          } else if (firstName === '*' && firstType === SELECTOR_TYPE) {
            dir = DIR_PREV;
            twig = lastTwig;
          } else {
            let bool;
            for (const { combo, leaves: [leaf] } of branch) {
              const { name: leafName, type: leafType } = leaf;
              if (leafType === SELECTOR_PSEUDO_CLASS && leafName === 'dir') {
                bool = false;
                break;
              }
              if (!bool && combo) {
                const { name: comboName } = combo;
                if (/^[+~]$/.test(comboName)) {
                  bool = true;
                }
              }
            }
            if (bool) {
              dir = DIR_NEXT;
              twig = firstTwig;
            } else {
              dir = DIR_PREV;
              twig = lastTwig;
            }
          }
        } else {
          dir = DIR_PREV;
          twig = firstTwig;
        }
        const {
          collected, compound, filtered, nodes, pending
        } = this._findEntryNodes(twig, targetType, complex);
        if (nodes.length) {
          this.#ast[i].find = true;
          this.#nodes[i] = nodes;
        } else if (pending) {
          pendingItems.add(new Map([
            ['index', i],
            ['twig', twig]
          ]));
        }
        this.#ast[i].collected = collected;
        this.#ast[i].dir = dir;
        this.#ast[i].filtered = filtered || !compound;
        i++;
      }
      if (pendingItems.size) {
        let node;
        let walker;
        if (this.#node !== this.#root && this.#node.nodeType === ELEMENT_NODE) {
          node = this.#node;
          walker = this.#qswalker;
        } else {
          node = this.#root;
          walker = this.#walker;
        }
        let nextNode = traverseNode(node, walker);
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
              const matched = this._matchLeaves(leaves, nextNode, {
                warn: this.#warn
              });
              if (matched) {
                const index = pendingItem.get('index');
                this.#ast[index].filtered = true;
                this.#ast[index].find = true;
                this.#nodes[index].push(nextNode);
              }
            }
          }
          if (nextNode !== walker.currentNode) {
            nextNode = traverseNode(nextNode, walker);
          }
          nextNode = walker.nextNode();
        }
      }
    } else {
      let i = 0;
      for (const { branch } of ast) {
        const twig = branch[branch.length - 1];
        const complex = branch.length > 1;
        const {
          compound, filtered, nodes
        } = this._findEntryNodes(twig, targetType, complex);
        if (nodes.length) {
          this.#ast[i].find = true;
          this.#nodes[i] = nodes;
        }
        this.#ast[i].dir = DIR_PREV;
        this.#ast[i].filtered = filtered || !compound;
        i++;
      }
    }
    return [
      this.#ast,
      this.#nodes
    ];
  }

  /**
   * get combined nodes
   * @private
   * @param {object} twig - twig
   * @param {object} nodes - collection of nodes
   * @param {string} dir - direction
   * @returns {Array.<object>} - collection of matched nodes
   */
  _getCombinedNodes(twig, nodes, dir) {
    const arr = [];
    for (const node of nodes) {
      const matched = this._matchCombinator(twig, node, {
        dir,
        warn: this.#warn
      });
      if (matched.size) {
        arr.push(...matched);
      }
    }
    if (arr.length) {
      return new Set(arr);
    }
    return new Set();
  }

  /**
   * match node to next direction
   * @private
   * @param {Array} branch - branch
   * @param {Set.<object>} nodes - collection of Element node
   * @param {object} opt - option
   * @param {object} opt.combo - combo
   * @returns {?object} - matched node
   */
  _matchNodeNext(branch, nodes, opt) {
    const { combo, index } = opt;
    const { combo: nextCombo, leaves } = branch[index];
    const twig = {
      combo,
      leaves
    };
    const nextNodes = this._getCombinedNodes(twig, nodes, DIR_NEXT);
    let res;
    if (nextNodes.size) {
      if (index === branch.length - 1) {
        const [nextNode] = sortNodes(nextNodes);
        res = nextNode;
      } else {
        res = this._matchNodeNext(branch, nextNodes, {
          combo: nextCombo,
          index: index + 1
        });
      }
    }
    return res ?? null;
  }

  /**
   * match node to previous direction
   * @private
   * @param {Array} branch - branch
   * @param {object} node - Element node
   * @param {object} opt - option
   * @param {number} opt.index - index
   * @returns {?object} - node
   */
  _matchNodePrev(branch, node, opt) {
    const { index } = opt;
    const twig = branch[index];
    const nodes = new Set([node]);
    const nextNodes = this._getCombinedNodes(twig, nodes, DIR_PREV);
    let res;
    if (nextNodes.size) {
      if (index === 0) {
        res = node;
      } else {
        for (const nextNode of nextNodes) {
          const matched = this._matchNodePrev(branch, nextNode, {
            index: index - 1
          });
          if (matched) {
            return node;
          }
        }
      }
    }
    return res ?? null;
  }

  /**
   * find matched nodes
   * @param {string} targetType - target type
   * @returns {Set.<object>} - collection of matched nodes
   */
  find(targetType) {
    if (targetType === TARGET_ALL || targetType === TARGET_FIRST) {
      this._prepareQuerySelectorWalker();
    }
    const [[...branches], collectedNodes] = this._collectNodes(targetType);
    const l = branches.length;
    let sort;
    let nodes = new Set();
    for (let i = 0; i < l; i++) {
      const { branch, collected, dir, find } = branches[i];
      const branchLen = branch.length;
      if (branchLen && find) {
        const entryNodes = collectedNodes[i];
        const entryNodesLen = entryNodes.length;
        const lastIndex = branchLen - 1;
        if (lastIndex === 0) {
          if ((targetType === TARGET_ALL || targetType === TARGET_FIRST) &&
              this.#node.nodeType === ELEMENT_NODE) {
            for (let j = 0; j < entryNodesLen; j++) {
              const node = entryNodes[j];
              if (node !== this.#node && this.#node.contains(node)) {
                nodes.add(node);
                if (targetType !== TARGET_ALL) {
                  break;
                }
              }
            }
          } else if (targetType === TARGET_ALL) {
            if (nodes.size) {
              const n = [...nodes];
              nodes = new Set([...n, ...entryNodes]);
              sort = true;
            } else {
              nodes = new Set(entryNodes);
            }
          } else {
            const [node] = entryNodes;
            nodes.add(node);
          }
        } else if (targetType === TARGET_ALL) {
          if (dir === DIR_NEXT) {
            let { combo } = branch[0];
            for (const node of entryNodes) {
              let nextNodes = new Set([node]);
              for (let j = 1; j < branchLen; j++) {
                const { combo: nextCombo, leaves } = branch[j];
                const twig = {
                  combo,
                  leaves
                };
                nextNodes = this._getCombinedNodes(twig, nextNodes, dir);
                if (nextNodes.size) {
                  if (j === lastIndex) {
                    if (nodes.size) {
                      const n = [...nodes];
                      nodes = new Set([...n, ...nextNodes]);
                      sort = true;
                    } else {
                      nodes = nextNodes;
                    }
                  } else {
                    combo = nextCombo;
                  }
                } else {
                  break;
                }
              }
            }
          } else {
            for (const node of entryNodes) {
              let nextNodes = new Set([node]);
              for (let j = lastIndex - 1; j >= 0; j--) {
                const twig = branch[j];
                nextNodes = this._getCombinedNodes(twig, nextNodes, dir);
                if (nextNodes.size) {
                  if (j === 0) {
                    nodes.add(node);
                    if (branchLen > 1 && nodes.size > 1) {
                      sort = true;
                    }
                  }
                } else {
                  break;
                }
              }
            }
          }
        } else if (targetType === TARGET_FIRST && dir === DIR_NEXT) {
          const { combo: entryCombo } = branch[0];
          let matched;
          for (const node of entryNodes) {
            matched = this._matchNodeNext(branch, new Set([node]), {
              combo: entryCombo,
              index: 1
            });
            if (matched) {
              nodes.add(matched);
              break;
            }
          }
          if (!matched && !collected) {
            const { leaves: entryLeaves } = branch[0];
            const [entryNode] = entryNodes;
            let refNode = this._findNode(entryLeaves, {
              node: entryNode
            });
            while (refNode) {
              matched = this._matchNodeNext(branch, new Set([refNode]), {
                combo: entryCombo,
                index: 1
              });
              if (matched) {
                nodes.add(matched);
                break;
              }
              refNode = this._findNode(entryLeaves, {
                node: refNode
              });
            }
          }
        } else {
          let matched;
          for (const node of entryNodes) {
            matched = this._matchNodePrev(branch, node, {
              index: lastIndex - 1
            });
            if (matched) {
              nodes.add(node);
              break;
            }
          }
          if (!matched && !collected && targetType === TARGET_FIRST) {
            const { leaves: entryLeaves } = branch[lastIndex];
            const [entryNode] = entryNodes;
            let refNode = this._findNode(entryLeaves, {
              node: entryNode
            });
            while (refNode) {
              matched = this._matchNodePrev(branch, refNode, {
                index: lastIndex - 1
              });
              if (matched) {
                nodes.add(refNode);
                break;
              }
              refNode = this._findNode(entryLeaves, {
                node: refNode
              });
            }
          }
        }
      }
    }
    if (targetType === TARGET_FIRST) {
      nodes.delete(this.#node);
      if (nodes.size > 1) {
        nodes = new Set(sortNodes(nodes));
      }
    } else if (targetType === TARGET_ALL) {
      nodes.delete(this.#node);
      if (sort && nodes.size > 1) {
        nodes = new Set(sortNodes(nodes));
      }
    }
    return nodes;
  }
};
