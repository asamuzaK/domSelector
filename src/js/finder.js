/**
 * finder.js
 */

/* import */
import {
  matchAttributeSelector, matchDirectionPseudoClass, matchLanguagePseudoClass,
  matchPseudoElementSelector, matchTypeSelector
} from './matcher.js';
import {
  findAST, generateCSS, parseSelector, sortAST, unescapeSelector, walkAST
} from './parser.js';
import {
  isContentEditable, isCustomElement, isFocusVisible, isFocusableArea,
  isVisible, resolveContent, sortNodes, traverseNode
} from './utility.js';

/* constants */
import {
  ATTR_SELECTOR, BIT_01, CLASS_SELECTOR, COMBINATOR, DOCUMENT_FRAGMENT_NODE,
  DOCUMENT_NODE, ELEMENT_NODE, ID_SELECTOR, KEY_FORM_FOCUS, KEY_INPUT_DATE,
  KEY_INPUT_EDIT, KEY_INPUT_TEXT, KEY_LOGICAL, KEY_MODIFIER, NOT_SUPPORTED_ERR,
  PS_CLASS_SELECTOR, PS_ELEMENT_SELECTOR, SHOW_ALL, SYNTAX_ERR, TARGET_ALL,
  TARGET_FIRST, TARGET_LINEAL, TARGET_SELF, TEXT_NODE, TYPE_SELECTOR,
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
  #focus;
  #invalidate;
  #invalidateResults;
  #lastFocusVisible;
  #node;
  #nodes;
  #noexcept;
  #qswalker;
  #results;
  #root;
  #shadow;
  #verifyShadowHost;
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
    this.#astCache = new WeakMap();
    this.#documentCache = new WeakMap();
    this.#invalidateResults = new WeakMap();
    this.#results = new WeakMap();
    this.#event = null;
    this.#focus = null;
    this.#lastFocusVisible = null;
    this._registerEventListeners();
  }

  /**
   * handle error
   * @param {Error} e - Error
   * @param {object} opt - options
   * @throws Error
   * @returns {void}
   */
  onError(e, opt) {
    const noexcept = opt?.noexcept ?? this.#noexcept;
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
      } else if (e.name in this.#window) {
        throw new this.#window[e.name](e.message);
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
   * @returns {object} - finder
   */
  setup(selector, node, opt = {}) {
    const { noexcept, warn } = opt;
    this.#noexcept = !!noexcept;
    this.#warn = !!warn;
    this.#node = node;
    [
      this.#document,
      this.#root,
      this.#walker,
      this.#shadow
    ] = resolveContent(node);
    [
      this.#ast,
      this.#nodes
    ] = this._correspond(selector);
    this.#invalidateResults = new WeakMap();
    this.#walkers = new WeakMap();
    this.#verifyShadowHost = null;
    return this;
  }

  /**
   * register event listeners
   * @private
   * @returns {Array.<void>} - results
   */
  _registerEventListeners() {
    const opt = {
      capture: true,
      passive: true
    };
    const func = [];
    const focusKeys = ['focus', 'focusin'];
    for (const key of focusKeys) {
      func.push(this.#window.addEventListener(key, evt => {
        this.#focus = evt;
      }, opt));
    }
    const keyboardKeys = ['keydown', 'keyup'];
    for (const key of keyboardKeys) {
      func.push(this.#window.addEventListener(key, evt => {
        const { key } = evt;
        if (!KEY_MODIFIER.includes(key)) {
          this.#event = evt;
        }
      }, opt));
    }
    const mouseKeys = [
      'mouseover', 'mousedown', 'mouseup', 'click', 'mouseout'
    ];
    for (const key of mouseKeys) {
      func.push(this.#window.addEventListener(key, evt => {
        this.#event = evt;
      }, opt));
    }
    return func;
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
      const { branches, info } = walkAST(cssAst);
      const {
        hasHasPseudoFunc, hasLogicalPseudoFunc, hasNthChildOfSelector
      } = info;
      let invalidate =
        hasHasPseudoFunc || !!(hasLogicalPseudoFunc && hasNthChildOfSelector);
      let descendant = false;
      let i = 0;
      ast = [];
      for (const [...items] of branches) {
        const branch = [];
        let item = items.shift();
        if (item && item.type !== COMBINATOR) {
          const leaves = new Set();
          while (item) {
            let itemName = item.name;
            if (item.type === COMBINATOR) {
              const [nextItem] = items;
              if (nextItem.type === COMBINATOR) {
                throw new DOMException(`Invalid selector ${selector}`,
                  SYNTAX_ERR);
              }
              if (itemName === '+' || itemName === '~') {
                invalidate = true;
              } else {
                descendant = true;
              }
              branch.push({
                combo: item,
                leaves: sortAST(leaves)
              });
              leaves.clear();
            } else if (item) {
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
        const { branches } = walkAST(selector);
        selectorBranches = branches;
        if (!this.#invalidate) {
          this.#astCache.set(selector, selectorBranches);
        }
      }
      const { branches } = walkAST(selector);
      selectorBranches = branches;
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
          if (isVisible(refNode)) {
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
    if (nthName === 'nth-child' || nthName === 'nth-last-child') {
      if (selector) {
        anbMap.set('selector', selector);
      }
      const anb = Object.fromEntries(anbMap);
      const nodes = this._collectNthChild(anb, node, opt);
      return nodes;
    } else if (nthName === 'nth-of-type' || nthName === 'nth-last-of-type') {
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
  _matchHasPseudoFunc(astLeaves, node, opt) {
    if (Array.isArray(astLeaves) && astLeaves.length) {
      const leaves = [...astLeaves];
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
          let bool = false;
          for (const nextNode of nodes) {
            bool = this._matchHasPseudoFunc(leaves, nextNode, opt);
            if (bool) {
              break;
            }
          }
          return bool;
        }
        return true;
      }
    }
    return false;
  }

  /**
   * match logical pseudo-class functions - :has(), :is(), :not(), :where()
   * @private
   * @param {object} astData - AST data
   * @param {object} node - Element node
   * @param {object} opt - options
   * @returns {?object} - matched node
   */
  _matchLogicalPseudoFunc(astData, node, opt) {
    const { astName, branches, twigBranches } = astData;
    const isShadowRoot = (opt.isShadowRoot || this.#shadow) &&
      node.nodeType === DOCUMENT_FRAGMENT_NODE;
    if (astName === 'has') {
      let bool;
      for (const leaves of branches) {
        bool = this._matchHasPseudoFunc(leaves, node, opt);
        if (bool) {
          break;
        }
      }
      if (bool) {
        if (isShadowRoot) {
          if (this.#verifyShadowHost) {
            return node;
          }
        } else {
          return node;
        }
      }
    } else {
      // check for invalid shadow root
      if (isShadowRoot) {
        let invalid;
        for (const branch of branches) {
          if (branch.length > 1) {
            invalid = true;
            break;
          } else if (astName === 'not') {
            const [{ type: childAstType }] = branch;
            if (childAstType !== PS_CLASS_SELECTOR) {
              invalid = true;
              break;
            }
          }
        }
        if (invalid) {
          return null;
        }
      }
      opt.forgive = astName === 'is' || astName === 'where';
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
        if (bool) {
          return null;
        }
        return node;
      } else if (bool) {
        return node;
      }
    }
    return null;
  }

  /**
   * match pseudo-class selector
   * @private
   * @see https://html.spec.whatwg.org/#pseudo-classes
   * @param {object} ast - AST
   * @param {object} node - Element node
   * @param {object} opt - options
   * @returns {Set.<object>} - collection of matched nodes
   */
  _matchPseudoClassSelector(ast, node, opt) {
    const { children: astChildren, name: astName } = ast;
    const { localName, parentNode } = node;
    const {
      forgive,
      warn = this.#warn
    } = opt;
    const matched = new Set();
    // :has(), :is(), :not(), :where()
    if (Array.isArray(astChildren) && KEY_LOGICAL.includes(astName)) {
      if (!astChildren.length && astName !== 'is' && astName !== 'where') {
        const css = generateCSS(ast);
        throw new DOMException(`Invalid selector ${css}`, SYNTAX_ERR);
      }
      let astData;
      if (this.#astCache.has(ast)) {
        astData = this.#astCache.get(ast);
      } else {
        const { branches } = walkAST(ast);
        if (astName === 'has') {
          // check for nested :has()
          let forgiven;
          for (const child of astChildren) {
            const item = findAST(child, leaf => {
              if (KEY_LOGICAL.includes(leaf.name) &&
                  findAST(leaf, nestedLeaf => nestedLeaf.name === 'has')) {
                return leaf;
              }
              return null;
            });
            if (item) {
              const itemName = item.name;
              if (itemName === 'is' || itemName === 'where') {
                forgiven = true;
                break;
              } else {
                const css = generateCSS(ast);
                throw new DOMException(`Invalid selector ${css}`, SYNTAX_ERR);
              }
            }
          }
          if (forgiven) {
            return matched;
          }
          astData = {
            astName,
            branches
          };
        } else {
          const twigBranches = [];
          for (const [...leaves] of branches) {
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
            twigBranches
          };
          if (!this.#invalidate) {
            this.#astCache.set(ast, astData);
          }
        }
      }
      const res = this._matchLogicalPseudoFunc(astData, node, opt);
      if (res) {
        matched.add(res);
      }
    } else if (Array.isArray(astChildren)) {
      // :nth-child(), :nth-last-child(), nth-of-type(), :nth-last-of-type()
      if (/^nth-(?:last-)?(?:child|of-type)$/.test(astName)) {
        if (astChildren.length !== 1) {
          const css = generateCSS(ast);
          throw new DOMException(`Invalid selector ${css}`, SYNTAX_ERR);
        }
        const [branch] = astChildren;
        const nodes = this._matchAnPlusB(branch, node, astName, opt);
        return nodes;
      } else {
        switch (astName) {
          // :dir()
          case 'dir': {
            if (astChildren.length !== 1) {
              const css = generateCSS(ast);
              throw new DOMException(`Invalid selector ${css}`, SYNTAX_ERR);
            }
            const [astChild] = astChildren;
            const res = matchDirectionPseudoClass(astChild, node);
            if (res) {
              matched.add(node);
            }
            break;
          }
          // :lang()
          case 'lang': {
            if (!astChildren.length) {
              const css = generateCSS(ast);
              throw new DOMException(`Invalid selector ${css}`, SYNTAX_ERR);
            }
            let bool;
            for (const astChild of astChildren) {
              bool = matchLanguagePseudoClass(astChild, node);
              if (bool) {
                break;
              }
            }
            if (bool) {
              matched.add(node);
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
          if ((localName === 'a' || localName === 'area') &&
              node.hasAttribute('href')) {
            matched.add(node);
          }
          break;
        }
        case 'local-link': {
          if ((localName === 'a' || localName === 'area') &&
              node.hasAttribute('href')) {
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
          if (/^(?:click|mouse(?:down|over|up))$/.test(type) &&
              node.contains(target)) {
            matched.add(node);
          }
          break;
        }
        case 'active': {
          const { buttons, target, type } = this.#event ?? {};
          if (type === 'mousedown' && buttons & BIT_01 &&
              node.contains(target)) {
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
        case 'focus': {
          if (node === this.#document.activeElement && isFocusableArea(node)) {
            matched.add(node);
          }
          break;
        }
        case 'focus-visible': {
          if (node === this.#document.activeElement && isFocusableArea(node)) {
            let bool;
            if (isFocusVisible(node)) {
              bool = true;
            } else if (this.#focus) {
              const { relatedTarget, target: focusTarget } = this.#focus;
              if (focusTarget === node) {
                if (isFocusVisible(relatedTarget)) {
                  bool = true;
                } else if (this.#event) {
                  const {
                    key: eventKey, target: eventTarget, type: eventType
                  } = this.#event;
                  // this.#event is irrelevant if eventTarget === relatedTarget
                  if (eventTarget === relatedTarget) {
                    if (this.#lastFocusVisible === null) {
                      bool = true;
                    } else if (focusTarget === this.#lastFocusVisible) {
                      bool = true;
                    }
                  } else if (eventKey === 'Tab') {
                    if ((eventType === 'keydown' && eventTarget !== node) ||
                        (eventType === 'keyup' && eventTarget === node)) {
                      if (eventTarget === focusTarget) {
                        if (this.#lastFocusVisible === null) {
                          bool = true;
                        } else if (eventTarget === this.#lastFocusVisible &&
                                   relatedTarget === null) {
                          bool = true;
                        }
                      } else {
                        bool = true;
                      }
                    }
                  } else if (eventKey) {
                    if ((eventType === 'keydown' || eventType === 'keyup') &&
                        eventTarget === node) {
                      bool = true;
                    }
                  }
                } else if (relatedTarget === null ||
                           relatedTarget === this.#lastFocusVisible) {
                  bool = true;
                }
              }
            }
            if (bool) {
              this.#lastFocusVisible = node;
              matched.add(node);
            } else if (this.#lastFocusVisible === node) {
              this.#lastFocusVisible = null;
            }
          }
          break;
        }
        case 'focus-within': {
          let bool;
          let current = this.#document.activeElement;
          if (isFocusableArea(current)) {
            while (current) {
              if (current === node) {
                bool = true;
                break;
              }
              current = current.parentNode;
            }
          }
          if (bool) {
            matched.add(node);
          }
          break;
        }
        case 'open':
        case 'closed': {
          if (localName === 'details' || localName === 'dialog') {
            if (node.hasAttribute('open')) {
              if (astName === 'open') {
                matched.add(node);
              }
            } else if (astName === 'closed') {
              matched.add(node);
            }
          }
          break;
        }
        case 'disabled':
        case 'enabled': {
          const keys = [...KEY_FORM_FOCUS, 'fieldset', 'optgroup', 'option'];
          if (keys.includes(localName) ||
              isCustomElement(node, { formAssociated: true })) {
            let disabled;
            if (node.disabled || node.hasAttribute('disabled')) {
              disabled = true;
            } else if (node.localName === 'option') {
              if (parentNode.localName === 'optgroup' &&
                  (parentNode.disabled ||
                   parentNode.hasAttribute('disabled'))) {
                disabled = true;
              }
            } else if (node.localName !== 'optgroup') {
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
                      disabled = true;
                    }
                  } else {
                    disabled = true;
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
            }
            if (disabled) {
              if (astName === 'disabled') {
                matched.add(node);
              }
            } else if (astName === 'enabled') {
              matched.add(node);
            }
          }
          break;
        }
        case 'read-only':
        case 'read-write': {
          let readonly;
          let writable;
          switch (localName) {
            case 'textarea': {
              if (node.readonly || node.hasAttribute('readonly') ||
                  node.disabled || node.hasAttribute('disabled')) {
                readonly = true;
              } else {
                writable = true;
              }
              break;
            }
            case 'input': {
              if (!node.type || KEY_INPUT_EDIT.includes(node.type)) {
                if (node.readonly || node.hasAttribute('readonly') ||
                    node.disabled || node.hasAttribute('disabled')) {
                  readonly = true;
                } else {
                  writable = true;
                }
              }
              break;
            }
            default: {
              if (isContentEditable(node)) {
                writable = true;
              } else {
                readonly = true;
              }
            }
          }
          if (readonly) {
            if (astName === 'read-only') {
              matched.add(node);
            }
          } else if (astName === 'read-write' && writable) {
            matched.add(node);
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
                const keys = [...KEY_INPUT_TEXT, 'number'];
                if (keys.includes(node.getAttribute('type'))) {
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
          const attrType = node.getAttribute('type');
          if ((node.checked && localName === 'input' &&
               (attrType === 'checkbox' || attrType === 'radio')) ||
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
          const chekcKeys = ['checkbox', 'radio'];
          const resetKeys = ['button', 'reset'];
          const submitKeys = ['image', 'submit'];
          const attrType = node.getAttribute('type');
          if ((localName === 'button' &&
               !(node.hasAttribute('type') && resetKeys.includes(attrType))) ||
              (localName === 'input' && node.hasAttribute('type') &&
               submitKeys.includes(attrType))) {
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
                const nodeAttrType = nextNode.getAttribute('type');
                let m;
                if (nodeName === 'button') {
                  m = !(nextNode.hasAttribute('type') &&
                    resetKeys.includes(nodeAttrType));
                } else if (nodeName === 'input') {
                  m = nextNode.hasAttribute('type') &&
                    submitKeys.includes(nodeAttrType);
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
                     chekcKeys.includes(attrType) &&
                     node.hasAttribute('checked')) {
            matched.add(node);
          // option
          } else if (localName === 'option' && node.hasAttribute('selected')) {
            matched.add(node);
          }
          break;
        }
        case 'valid':
        case 'invalid': {
          const keys = [...KEY_FORM_FOCUS, 'form'];
          if (keys.includes(localName)) {
            let valid;
            if (node.checkValidity()) {
              if (node.maxLength >= 0) {
                if (node.maxLength >= node.value.length) {
                  valid = true;
                }
              } else {
                valid = true;
              }
            }
            if (valid) {
              if (astName === 'valid') {
                matched.add(node);
              }
            } else if (astName === 'invalid') {
              matched.add(node);
            }
          } else if (localName === 'fieldset') {
            const walker = this.#walker;
            let refNode = traverseNode(node, walker);
            refNode = walker.firstChild();
            let valid;
            if (!refNode) {
              valid = true;
            } else {
              while (refNode && node.contains(refNode)) {
                if (keys.includes(refNode.localName)) {
                  if (refNode.checkValidity()) {
                    if (refNode.maxLength >= 0) {
                      valid = refNode.maxLength >= refNode.value.length;
                    } else {
                      valid = true;
                    }
                  } else {
                    valid = false;
                  }
                  if (!valid) {
                    break;
                  }
                }
                refNode = walker.nextNode();
              }
            }
            if (valid) {
              if (astName === 'valid') {
                matched.add(node);
              }
            } else if (astName === 'invalid') {
              matched.add(node);
            }
          }
          break;
        }
        case 'in-range':
        case 'out-of-range': {
          const keys = [...KEY_INPUT_DATE, 'number', 'range'];
          const attrType = node.getAttribute('type');
          if (localName === 'input' &&
              !(node.readonly || node.hasAttribute('readonly')) &&
              !(node.disabled || node.hasAttribute('disabled')) &&
              keys.includes(attrType)) {
            const flowed =
              node.validity.rangeUnderflow || node.validity.rangeOverflow;
            if (astName === 'out-of-range' && flowed) {
              matched.add(node);
            } else if (astName === 'in-range' && !flowed &&
                       (node.hasAttribute('min') || node.hasAttribute('max') ||
                       attrType === 'range')) {
              matched.add(node);
            }
          }
          break;
        }
        case 'required':
        case 'optional': {
          let targetNode;
          if (localName === 'select' || localName === 'textarea') {
            targetNode = node;
          } else if (localName === 'input') {
            if (node.hasAttribute('type')) {
              const keys = [...KEY_INPUT_EDIT, 'checkbox', 'file', 'radio'];
              const attrType = node.getAttribute('type');
              if (keys.includes(attrType)) {
                targetNode = node;
              }
            } else {
              targetNode = node;
            }
          }
          if (targetNode) {
            if (node.required || node.hasAttribute('required')) {
              if (astName === 'required') {
                matched.add(node);
              }
            } else if (astName === 'optional') {
              matched.add(node);
            }
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
          if (node.popover && isVisible(node)) {
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
    if (Array.isArray(astChildren)) {
      if (astChildren.length !== 1) {
        const css = generateCSS(ast);
        throw new DOMException(`Invalid selector ${css}`, SYNTAX_ERR);
      }
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
          return node;
        }
        return null;
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
          return node;
        }
        return null;
      }
      throw new DOMException(`Invalid selector :${astName}`, SYNTAX_ERR);
    } else if (astName === 'host') {
      return node;
    } else {
      throw new DOMException(`Invalid selector :${astName}`, SYNTAX_ERR);
    }
  }

  /**
   * match selector
   * @private
   * @param {object} ast - AST
   * @param {object} node - Document, DocumentFragment, Element node
   * @param {object} [opt] - options
   * @returns {Set.<object>} - collection of matched nodes
   */
  _matchSelector(ast, node, opt = {}) {
    const { type: astType } = ast;
    const astName = unescapeSelector(ast.name);
    const matched = new Set();
    if (node.nodeType === ELEMENT_NODE) {
      switch (astType) {
        case ATTR_SELECTOR: {
          const res = matchAttributeSelector(ast, node);
          if (res) {
            matched.add(node);
          }
          break;
        }
        case ID_SELECTOR: {
          if (node.id === astName) {
            matched.add(node);
          }
          break;
        }
        case CLASS_SELECTOR: {
          if (node.classList.contains(astName)) {
            matched.add(node);
          }
          break;
        }
        case PS_CLASS_SELECTOR: {
          const nodes = this._matchPseudoClassSelector(ast, node, opt);
          return nodes;
        }
        case TYPE_SELECTOR: {
          const res = matchTypeSelector(ast, node, opt);
          if (res) {
            matched.add(node);
          }
          break;
        }
        case PS_ELEMENT_SELECTOR:
        default: {
          matchPseudoElementSelector(astName, astType, opt);
        }
      }
    } else if (this.#shadow && astType === PS_CLASS_SELECTOR &&
               node.nodeType === DOCUMENT_FRAGMENT_NODE) {
      if (KEY_LOGICAL.includes(astName)) {
        opt.isShadowRoot = true;
        const nodes = this._matchPseudoClassSelector(ast, node, opt);
        return nodes;
      } else if (astName === 'host' || astName === 'host-context') {
        const res = this._matchShadowHostPseudoClass(ast, node, opt);
        if (res) {
          this.#verifyShadowHost = true;
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
    let result;
    if (this.#invalidate) {
      result = this.#invalidateResults.get(leaves);
    } else {
      result = this.#results.get(leaves);
    }
    if (result && result.has(node)) {
      const { matched } = result.get(node);
      return matched;
    } else {
      let cacheable = true;
      const formKeys = [...KEY_FORM_FOCUS, 'fieldset', 'form'];
      const pseudoKeys = ['any-link', 'defined', 'dir', 'link'];
      if (node.nodeType === ELEMENT_NODE && formKeys.includes(node.localName)) {
        cacheable = false;
      }
      let bool;
      for (const leaf of leaves) {
        switch (leaf.type) {
          case ATTR_SELECTOR:
          case ID_SELECTOR: {
            cacheable = false;
            break;
          }
          case PS_CLASS_SELECTOR: {
            if (pseudoKeys.includes(leaf.name)) {
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
      return bool;
    }
  }

  /**
   * match HTML collection
   * @private
   * @param {object} items - HTML collection
   * @param {object} opt - options
   * @returns {Set.<object>} - matched nodes
   */
  _matchHTMLCollection(items, opt) {
    if (items.length) {
      const { compound, filterLeaves } = opt;
      if (compound) {
        const nodes = new Set();
        for (const item of items) {
          const bool = this._matchLeaves(filterLeaves, item, opt);
          if (bool) {
            nodes.add(item);
          }
        }
        return nodes;
      } else {
        const arr = [].slice.call(items);
        return new Set(arr);
      }
    }
    return new Set();
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
    let nodes = new Set();
    let pending = false;
    if (this.#shadow || baseNode.nodeType !== ELEMENT_NODE) {
      pending = true;
    } else {
      switch (leafType) {
        case PS_ELEMENT_SELECTOR: {
          matchPseudoElementSelector(leafName, leafType, opt);
          break;
        }
        case ID_SELECTOR: {
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
        case CLASS_SELECTOR: {
          const items = baseNode.getElementsByClassName(leafName);
          nodes = this._matchHTMLCollection(items, {
            compound,
            filterLeaves
          });
          break;
        }
        case TYPE_SELECTOR: {
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
  _matchCombinator(twig, node, opt) {
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
   * @param {object} node - node to start from
   * @returns {?object} - matched node
   */
  _findNode(leaves, node) {
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
    let filtered = false;
    const bool = this._matchLeaves(leaves, this.#node, {
      warn: this.#warn
    });
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
  _findLineal(leaves, opt) {
    const { complex } = opt;
    const nodes = [];
    let filtered = false;
    let bool = this._matchLeaves(leaves, this.#node, {
      warn: this.#warn
    });
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
    let filtered = false;
    const node = this._findNode(leaves, this.#node);
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
   * @returns {Array} - [nodes, filtered]
   */
  _findFromHTMLCollection(items, opt) {
    const { complex, compound, filterLeaves, targetType } = opt;
    let nodes = [];
    let filtered = false;
    let collected = false;
    if (items.length) {
      if (this.#node.nodeType === ELEMENT_NODE) {
        for (const node of items) {
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
          for (const node of items) {
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
        for (const node of items) {
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
      case PS_ELEMENT_SELECTOR: {
        matchPseudoElementSelector(leafName, leafType, {
          warn: this.#warn
        });
        break;
      }
      case ID_SELECTOR: {
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
      case CLASS_SELECTOR: {
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
      case TYPE_SELECTOR: {
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
        if (targetType !== TARGET_LINEAL &&
            (leafName === 'host' || leafName === 'host-context')) {
          let shadowRoot;
          if (this.#shadow &&
              this.#node.nodeType === DOCUMENT_FRAGMENT_NODE) {
            shadowRoot = this._matchShadowHostPseudoClass(leaf, this.#node);
          } else if (compound && this.#node.nodeType === ELEMENT_NODE) {
            shadowRoot =
              this._matchShadowHostPseudoClass(leaf, this.#node.shadowRoot);
          }
          if (shadowRoot) {
            let bool;
            if (compound) {
              for (const item of filterLeaves) {
                if (/^host(?:-context)?$/.test(item.name)) {
                  const node =
                    this._matchShadowHostPseudoClass(item, shadowRoot);
                  bool = node === shadowRoot;
                } else if (item.name === 'has') {
                  bool = this._matchPseudoClassSelector(item, shadowRoot, {})
                    .has(shadowRoot);
                } else {
                  bool = false;
                }
                if (!bool) {
                  break;
                }
              }
            } else {
              bool = true;
            }
            if (bool) {
              nodes.push(shadowRoot);
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
          if (lastType === PS_ELEMENT_SELECTOR ||
              lastType === ID_SELECTOR) {
            dir = DIR_PREV;
            twig = lastTwig;
          } else if (firstType === PS_ELEMENT_SELECTOR ||
                     firstType === ID_SELECTOR) {
            dir = DIR_NEXT;
            twig = firstTwig;
          } else if (targetType === TARGET_ALL) {
            if (firstName === '*' && firstType === TYPE_SELECTOR) {
              dir = DIR_PREV;
              twig = lastTwig;
            } else if (lastName === '*' && lastType === TYPE_SELECTOR) {
              dir = DIR_NEXT;
              twig = firstTwig;
            } else if (branchLen === 2) {
              const { name: comboName } = firstCombo;
              if (comboName === '+' || comboName === '~') {
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
          } else if (firstName === '*' && firstType === TYPE_SELECTOR) {
            dir = DIR_PREV;
            twig = lastTwig;
          } else if (lastName === '*' && lastType === TYPE_SELECTOR) {
            dir = DIR_NEXT;
            twig = firstTwig;
          } else {
            let bool;
            for (const { combo, leaves: [leaf] } of branch) {
              const { name: leafName, type: leafType } = leaf;
              if (leafType === PS_CLASS_SELECTOR && leafName === 'dir') {
                bool = false;
                break;
              }
              if (!bool && combo) {
                const { name: comboName } = combo;
                if (comboName === '+' || comboName === '~') {
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
    if (nextNodes.size) {
      if (index === branch.length - 1) {
        const [nextNode] = sortNodes(nextNodes);
        return nextNode;
      } else {
        return this._matchNodeNext(branch, nextNodes, {
          combo: nextCombo,
          index: index + 1
        });
      }
    }
    return null;
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
    if (nextNodes.size) {
      if (index === 0) {
        return node;
      } else {
        let matched;
        for (const nextNode of nextNodes) {
          matched = this._matchNodePrev(branch, nextNode, {
            index: index - 1
          });
          if (matched) {
            break;
          }
        }
        if (matched) {
          return node;
        }
      }
    }
    return null;
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
                if (targetType === TARGET_FIRST) {
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
            let refNode = this._findNode(entryLeaves, entryNode);
            while (refNode) {
              matched = this._matchNodeNext(branch, new Set([refNode]), {
                combo: entryCombo,
                index: 1
              });
              if (matched) {
                nodes.add(matched);
                break;
              }
              refNode = this._findNode(entryLeaves, refNode);
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
            let refNode = this._findNode(entryLeaves, entryNode);
            while (refNode) {
              matched = this._matchNodePrev(branch, refNode, {
                index: lastIndex - 1
              });
              if (matched) {
                nodes.add(refNode);
                break;
              }
              refNode = this._findNode(entryLeaves, refNode);
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
}
