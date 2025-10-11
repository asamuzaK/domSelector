/**
 * finder.js
 */

/* import */
import {
  matchAttributeSelector,
  matchDirectionPseudoClass,
  matchDisabledPseudoClass,
  matchLanguagePseudoClass,
  matchPseudoElementSelector,
  matchReadOnlyPseudoClass,
  matchTypeSelector
} from './matcher.js';
import {
  findAST,
  generateCSS,
  parseSelector,
  sortAST,
  unescapeSelector,
  walkAST
} from './parser.js';
import {
  filterNodesByAnB,
  //findLogicalWithNestedHas,
  generateException,
  //isContentEditable,
  isCustomElement,
  isFocusVisible,
  isFocusableArea,
  //isValidShadowHostSelector,
  isVisible,
  resolveContent,
  sortNodes,
  traverseNode
} from './utility.js';

/* constants */
import {
  ATTR_SELECTOR,
  //ATTR_STATE_CHANGE,
  CLASS_SELECTOR,
  COMBINATOR,
  DOCUMENT_FRAGMENT_NODE,
  ELEMENT_NODE,
  FORM_PARTS,
  ID_SELECTOR,
  INPUT_CHECK,
  INPUT_DATE,
  INPUT_EDIT,
  INPUT_TEXT,
  KEYS_LOGICAL,
  NOT_SUPPORTED_ERR,
  PS_CLASS_SELECTOR,
  PS_ELEMENT_SELECTOR,
  SHOW_ALL,
  SHOW_CONTAINER,
  SYNTAX_ERR,
  TARGET_ALL,
  TARGET_FIRST,
  TARGET_LINEAL,
  TARGET_SELF,
  TEXT_NODE,
  TYPE_SELECTOR
} from './constant.js';
const DIR_NEXT = 'next';
const DIR_PREV = 'prev';
const KEYS_FORM = new Set([...FORM_PARTS, 'fieldset', 'form']);
const KEYS_FORM_PS_VALID = new Set([...FORM_PARTS, 'form']);
const KEYS_INPUT_CHECK = new Set(INPUT_CHECK);
const KEYS_INPUT_PLACEHOLDER = new Set([...INPUT_TEXT, 'number']);
const KEYS_INPUT_RANGE = new Set([...INPUT_DATE, 'number', 'range']);
const KEYS_INPUT_REQUIRED = new Set([...INPUT_CHECK, ...INPUT_EDIT, 'file']);
const KEYS_INPUT_RESET = new Set(['button', 'reset']);
const KEYS_INPUT_SUBMIT = new Set(['image', 'submit']);
const KEYS_MODIFIER = new Set([
  'Alt',
  'AltGraph',
  'CapsLock',
  'Control',
  'Fn',
  'FnLock',
  'Hyper',
  'Meta',
  'NumLock',
  'ScrollLock',
  'Shift',
  'Super',
  'Symbol',
  'SymbolLock'
]);
const KEYS_PS_UNCACHE = new Set([
  'any-link',
  'defined',
  'dir',
  'link',
  'scope'
]);
/*
const KEYS_PS_FORM = new Set([
  'checked',
  'default',
  'disabled',
  'enabled',
  'in-range',
  'indeterminate',
  'invalid',
  'optional',
  'out-of-range',
  'placeholder-shown',
  'read-only',
  'read-write',
  'required',
  'user-invalid',
  'user-valid',
  'valid'
]);
const KEYS_PS_UI = new Set(['closed', 'open', 'popover-open']);
*/

/**
 * Finder
 * NOTE: #ast[i] corresponds to #nodes[i]
 */
export class Finder {
  /* private fields */
  #ast;
  #astCache;
  #check;
  #descendant;
  #document;
  #documentCache;
  #documentURL;
  #event;
  #eventHandlers;
  #focus;
  #invalidate;
  #invalidateResults;
  #lastFocusVisible;
  #node;
  #nodeWalker;
  #nodes;
  #noexcept;
  #pseudoElement;
  #results;
  #root;
  #rootWalker;
  #selector;
  #shadow;
  #verifyShadowHost;
  #walkers;
  #warn;
  #window;

  /**
   * constructor
   * @param {object} window - The window object.
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
    this.#eventHandlers = new Set([
      {
        keys: ['focus', 'focusin'],
        handler: this._handleFocusEvent
      },
      {
        keys: ['keydown', 'keyup'],
        handler: this._handleKeyboardEvent
      },
      {
        keys: ['mouseover', 'mousedown', 'mouseup', 'mouseout'],
        handler: this._handleMouseEvent
      },
      {
        keys: ['click'],
        handler: this._handleClickEvent
      }
    ]);
    this._registerEventListeners();
  }

  /**
   * Handles errors.
   * @param {Error} e - The error object.
   * @param {object} [opt] - Options.
   * @param {boolean} [opt.noexcept] - If true, exceptions are not thrown.
   * @throws {Error} Throws an error.
   * @returns {void}
   */
  onError = (e, opt = {}) => {
    const noexcept = opt.noexcept ?? this.#noexcept;
    if (noexcept) {
      return;
    }
    const isDOMException =
      e instanceof DOMException || e instanceof this.#window.DOMException;
    if (isDOMException) {
      if (e.name === NOT_SUPPORTED_ERR) {
        if (this.#warn) {
          console.warn(e.message);
        }
        return;
      }
      throw new this.#window.DOMException(e.message, e.name);
    }
    if (e.name in this.#window) {
      throw new this.#window[e.name](e.message, { cause: e });
    }
    throw e;
  };

  /**
   * Sets up the finder.
   * @param {string} selector - The CSS selector.
   * @param {object} node - Document, DocumentFragment, or Element.
   * @param {object} [opt] - Options.
   * @param {boolean} [opt.check] - Indicates if running in internal check().
   * @param {boolean} [opt.noexcept] - If true, exceptions are not thrown.
   * @param {boolean} [opt.warn] - If true, console warnings are enabled.
   * @returns {object} The finder instance.
   */
  setup = (selector, node, opt = {}) => {
    const { check, noexcept, warn } = opt;
    this.#check = !!check;
    this.#noexcept = !!noexcept;
    this.#warn = !!warn;
    [this.#document, this.#root, this.#shadow] = resolveContent(node);
    this.#documentURL = new URL(this.#document.URL);
    this.#node = node;
    this.#selector = selector;
    [this.#ast, this.#nodes] = this._correspond(selector);
    this.#invalidateResults = new WeakMap();
    this.#pseudoElement = [];
    this.#walkers = new WeakMap();
    this.#nodeWalker = null;
    this.#rootWalker = null;
    this.#verifyShadowHost = null;
    return this;
  };

  /**
   * Handles focus events.
   * @private
   * @param {Event} evt - The event object.
   * @returns {void}
   */
  _handleFocusEvent = evt => {
    this.#focus = evt;
  };

  /**
   * Handles keyboard events.
   * @private
   * @param {Event} evt - The event object.
   * @returns {void}
   */
  _handleKeyboardEvent = evt => {
    const { key } = evt;
    if (!KEYS_MODIFIER.has(key)) {
      this.#event = evt;
    }
  };

  /**
   * Handles mouse events.
   * @private
   * @param {Event} evt - The event object.
   * @returns {void}
   */
  _handleMouseEvent = evt => {
    this.#event = evt;
  };

  /**
   * Handles click events.
   * @private
   * @param {Event} evt - The event object.
   * @returns {void}
   */
  _handleClickEvent = evt => {
    this.#event = evt;
    this.#invalidateResults = new WeakMap();
    this.#results = new WeakMap();
  };

  /**
   * Registers event listeners.
   * @private
   * @returns {Array.<void>} An array of return values from addEventListener.
   */
  _registerEventListeners = () => {
    const opt = {
      capture: true,
      passive: true
    };
    const func = [];
    for (const eventHandler of this.#eventHandlers) {
      const { keys, handler } = eventHandler;
      const l = keys.length;
      for (let i = 0; i < l; i++) {
        const key = keys[i];
        func.push(this.#window.addEventListener(key, handler, opt));
      }
    }
    return func;
  };

  /**
   * Processes selector branches into the internal AST structure.
   * @private
   * @param {Array.<Array.<object>>} branches - The branches from walkAST.
   * @param {string} selector - The original selector for error reporting.
   * @returns {{ast: Array, descendant: boolean, invalidate: boolean}}
   * An object with the AST, descendant flag, and invalidate flag.
   */
  _processSelectorBranches = (branches, selector) => {
    let invalidate = false;
    let descendant = false;
    const ast = [];
    const l = branches.length;
    for (let i = 0; i < l; i++) {
      const items = [...branches[i]];
      const branch = [];
      let item = items.shift();
      if (item && item.type !== COMBINATOR) {
        const leaves = new Set();
        while (item) {
          if (item.type === COMBINATOR) {
            const [nextItem] = items;
            if (!nextItem || nextItem.type === COMBINATOR) {
              const msg = `Invalid selector ${selector}`;
              this.onError(generateException(msg, SYNTAX_ERR, this.#window));
              // Stop processing on invalid selector.
              return { ast: [], descendant: false, invalidate: false };
            }
            if (item.name === '+' || item.name === '~') {
              invalidate = true;
            } else {
              descendant = true;
            }
            branch.push({ combo: item, leaves: sortAST(leaves) });
            leaves.clear();
          } else {
            if (item.name && typeof item.name === 'string') {
              const unescapedName = unescapeSelector(item.name);
              if (unescapedName !== item.name) {
                item.name = unescapedName;
              }
              if (/[|:]/.test(unescapedName)) {
                item.namespace = true;
              }
            }
            leaves.add(item);
          }
          if (items.length) {
            item = items.shift();
          } else {
            branch.push({ combo: null, leaves: sortAST(leaves) });
            leaves.clear();
            break;
          }
        }
      }
      ast.push({ branch, dir: null, filtered: false, find: false });
    }
    return { ast, descendant, invalidate };
  };

  /**
   * Corresponds AST and nodes.
   * @private
   * @param {string} selector - The CSS selector.
   * @returns {Array.<Array.<object>>} An array with the AST and nodes.
   */
  _correspond = selector => {
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
        return this.onError(e);
      }
      const { branches, info } = walkAST(cssAst);
      const {
        hasHasPseudoFunc,
        hasLogicalPseudoFunc,
        hasNthChildOfSelector,
        hasStatePseudoClass
      } = info;
      const baseInvalidate =
        hasHasPseudoFunc ||
        hasStatePseudoClass ||
        !!(hasLogicalPseudoFunc && hasNthChildOfSelector);
      const processed = this._processSelectorBranches(branches, selector);
      ast = processed.ast;
      this.#descendant = processed.descendant;
      this.#invalidate = baseInvalidate || processed.invalidate;
      let cachedItem;
      if (this.#documentCache.has(this.#document)) {
        cachedItem = this.#documentCache.get(this.#document);
      } else {
        cachedItem = new Map();
      }
      cachedItem.set(`${selector}`, {
        ast,
        descendant: this.#descendant,
        invalidate: this.#invalidate
      });
      this.#documentCache.set(this.#document, cachedItem);
      // Initialize nodes array for each branch.
      for (let i = 0; i < ast.length; i++) {
        nodes[i] = [];
      }
    }
    return [ast, nodes];
  };

  /**
   * Creates a TreeWalker.
   * @private
   * @param {object} node - The Document, DocumentFragment, or Element node.
   * @param {object} [opt] - Options.
   * @param {boolean} [opt.force] - Force creation of a new TreeWalker.
   * @param {number} [opt.whatToShow] - The NodeFilter whatToShow value.
   * @returns {object} The TreeWalker object.
   */
  _createTreeWalker = (node, opt = {}) => {
    const { force = false, whatToShow = SHOW_CONTAINER } = opt;
    if (force) {
      return this.#document.createTreeWalker(node, whatToShow);
    } else if (this.#walkers.has(node)) {
      return this.#walkers.get(node);
    }
    const walker = this.#document.createTreeWalker(node, whatToShow);
    this.#walkers.set(node, walker);
    return walker;
  };

  /**
   * Gets selector branches from cache or parses them.
   * @private
   * @param {object} selector - The AST.
   * @returns {Array.<Array.<object>>} The selector branches.
   */
  _getSelectorBranches = selector => {
    if (this.#astCache.has(selector)) {
      return this.#astCache.get(selector);
    }
    const { branches } = walkAST(selector);
    this.#astCache.set(selector, branches);
    return branches;
  };

  /**
   * Gets the children of a node, optionally filtered by a selector.
   * @private
   * @param {object} parentNode - The parent element.
   * @param {Array.<Array.<object>>} selectorBranches - The selector branches.
   * @param {object} [opt] - Options.
   * @returns {Array.<object>} An array of child nodes.
   */
  _getFilteredChildren = (parentNode, selectorBranches, opt = {}) => {
    const children = [];
    const walker = this._createTreeWalker(parentNode, { force: true });
    let childNode = walker.firstChild();
    while (childNode) {
      if (selectorBranches) {
        if (isVisible(childNode)) {
          let isMatch = false;
          const l = selectorBranches.length;
          for (let i = 0; i < l; i++) {
            const leaves = selectorBranches[i];
            if (this._matchLeaves(leaves, childNode, opt)) {
              isMatch = true;
              break;
            }
          }
          if (isMatch) {
            children.push(childNode);
          }
        }
      } else {
        children.push(childNode);
      }
      childNode = walker.nextSibling();
    }
    return children;
  };

  /**
   * Collects nth-child nodes.
   * @private
   * @param {object} anb - An+B options.
   * @param {number} anb.a - The 'a' value.
   * @param {number} anb.b - The 'b' value.
   * @param {boolean} [anb.reverse] - If true, reverses the order.
   * @param {object} [anb.selector] - The AST.
   * @param {object} node - The Element node.
   * @param {object} [opt] - Options.
   * @returns {Set.<object>} A collection of matched nodes.
   */
  _collectNthChild = (anb, node, opt = {}) => {
    const { a, b, selector } = anb;
    const { parentNode } = node;
    if (!parentNode) {
      const matchedNode = new Set();
      if (node === this.#root && a * 1 + b * 1 === 1) {
        if (selector) {
          const selectorBranches = this._getSelectorBranches(selector);
          const l = selectorBranches.length;
          for (let i = 0; i < l; i++) {
            const leaves = selectorBranches[i];
            if (this._matchLeaves(leaves, node, opt)) {
              matchedNode.add(node);
              break;
            }
          }
        } else {
          matchedNode.add(node);
        }
      }
      return matchedNode;
    }
    const selectorBranches = selector
      ? this._getSelectorBranches(selector)
      : null;
    const children = this._getFilteredChildren(
      parentNode,
      selectorBranches,
      opt
    );
    const matchedNodes = filterNodesByAnB(children, anb);
    return new Set(matchedNodes);
  };

  /**
   * Collects nth-of-type nodes.
   * @private
   * @param {object} anb - An+B options.
   * @param {number} anb.a - The 'a' value.
   * @param {number} anb.b - The 'b' value.
   * @param {boolean} [anb.reverse] - If true, reverses the order.
   * @param {object} node - The Element node.
   * @returns {Set.<object>} A collection of matched nodes.
   */
  _collectNthOfType = (anb, node) => {
    const { parentNode } = node;
    if (!parentNode) {
      if (node === this.#root && anb.a * 1 + anb.b * 1 === 1) {
        return new Set([node]);
      }
      return new Set();
    }
    const typedSiblings = [];
    const walker = this._createTreeWalker(parentNode, { force: true });
    let sibling = walker.firstChild();
    while (sibling) {
      if (
        sibling.localName === node.localName &&
        sibling.namespaceURI === node.namespaceURI &&
        sibling.prefix === node.prefix
      ) {
        typedSiblings.push(sibling);
      }
      sibling = walker.nextSibling();
    }
    const matchedNodes = filterNodesByAnB(typedSiblings, anb);
    return new Set(matchedNodes);
  };

  /**
   * Matches An+B.
   * @private
   * @param {object} ast - The AST.
   * @param {object} node - The Element node.
   * @param {string} nthName - The name of the nth pseudo-class.
   * @param {object} [opt] - Options.
   * @returns {Set.<object>} A collection of matched nodes.
   */
  _matchAnPlusB = (ast, node, nthName, opt = {}) => {
    const {
      nth: { a, b, name: nthIdentName },
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
  };

  /**
   * match :has() pseudo-class function
   * @private
   * @param {Array.<object>} astLeaves - AST leaves
   * @param {object} node - Element node
   * @param {object} [opt] - options
   * @returns {boolean} - result
   */
  _matchHasPseudoFunc(astLeaves, node, opt = {}) {
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
   * @param {object} [opt] - options
   * @returns {?object} - matched node
   */
  _matchLogicalPseudoFunc(astData, node, opt = {}) {
    const { astName, branches, twigBranches } = astData;
    const isShadowRoot =
      (opt.isShadowRoot || this.#shadow) &&
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
   * @param {object} [opt] - options
   * @returns {Set.<object>} - collection of matched nodes
   */
  _matchPseudoClassSelector(ast, node, opt = {}) {
    const { children: astChildren, name: astName } = ast;
    const { localName, parentNode } = node;
    const { forgive, warn = this.#warn } = opt;
    const matched = new Set();
    // :has(), :is(), :not(), :where()
    if (Array.isArray(astChildren) && KEYS_LOGICAL.has(astName)) {
      if (!astChildren.length && astName !== 'is' && astName !== 'where') {
        const css = generateCSS(ast);
        return this.onError(
          generateException(`Invalid selector ${css}`, SYNTAX_ERR, this.#window)
        );
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
              if (
                KEYS_LOGICAL.has(leaf.name) &&
                findAST(leaf, nestedLeaf => nestedLeaf.name === 'has')
              ) {
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
                return this.onError(
                  generateException(
                    `Invalid selector ${css}`,
                    SYNTAX_ERR,
                    this.#window
                  )
                );
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
          this.#astCache.set(ast, astData);
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
          return this.onError(
            generateException(
              `Invalid selector ${css}`,
              SYNTAX_ERR,
              this.#window
            )
          );
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
              return this.onError(
                generateException(
                  `Invalid selector ${css}`,
                  SYNTAX_ERR,
                  this.#window
                )
              );
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
              return this.onError(
                generateException(
                  `Invalid selector ${css}`,
                  SYNTAX_ERR,
                  this.#window
                )
              );
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
              this.onError(
                generateException(
                  `Unsupported pseudo-class :${astName}()`,
                  NOT_SUPPORTED_ERR,
                  this.#window
                )
              );
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
              this.onError(
                generateException(
                  `Unknown pseudo-class :${astName}()`,
                  NOT_SUPPORTED_ERR,
                  this.#window
                )
              );
            }
            break;
          }
          default: {
            if (!forgive) {
              this.onError(
                generateException(
                  `Unknown pseudo-class :${astName}()`,
                  SYNTAX_ERR,
                  this.#window
                )
              );
            }
          }
        }
      }
    } else {
      switch (astName) {
        case 'disabled':
        case 'enabled': {
          const isMatch = matchDisabledPseudoClass(astName, node);
          if (isMatch) {
            matched.add(node);
          }
          break;
        }
        case 'read-only':
        case 'read-write': {
          const isMatch = matchReadOnlyPseudoClass(astName, node);
          if (isMatch) {
            matched.add(node);
          }
          break;
        }
        case 'any-link':
        case 'link': {
          if (
            (localName === 'a' || localName === 'area') &&
            node.hasAttribute('href')
          ) {
            matched.add(node);
          }
          break;
        }
        case 'local-link': {
          if (
            (localName === 'a' || localName === 'area') &&
            node.hasAttribute('href')
          ) {
            const { href, origin, pathname } = this.#documentURL;
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
          if (
            /^(?:click|mouse(?:down|over|up))$/.test(type) &&
            node.contains(target)
          ) {
            matched.add(node);
          }
          break;
        }
        case 'active': {
          const { buttons, target, type } = this.#event ?? {};
          if (type === 'mousedown' && buttons & 1 && node.contains(target)) {
            matched.add(node);
          }
          break;
        }
        case 'target': {
          const { hash } = this.#documentURL;
          if (
            node.id &&
            hash === `#${node.id}` &&
            this.#document.contains(node)
          ) {
            matched.add(node);
          }
          break;
        }
        case 'target-within': {
          const { hash } = this.#documentURL;
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
                    key: eventKey,
                    target: eventTarget,
                    type: eventType
                  } = this.#event;
                  // this.#event is irrelevant if eventTarget === relatedTarget
                  if (eventTarget === relatedTarget) {
                    if (this.#lastFocusVisible === null) {
                      bool = true;
                    } else if (focusTarget === this.#lastFocusVisible) {
                      bool = true;
                    }
                  } else if (eventKey === 'Tab') {
                    if (
                      (eventType === 'keydown' && eventTarget !== node) ||
                      (eventType === 'keyup' && eventTarget === node)
                    ) {
                      if (eventTarget === focusTarget) {
                        if (this.#lastFocusVisible === null) {
                          bool = true;
                        } else if (
                          eventTarget === this.#lastFocusVisible &&
                          relatedTarget === null
                        ) {
                          bool = true;
                        }
                      } else {
                        bool = true;
                      }
                    }
                  } else if (eventKey) {
                    if (
                      (eventType === 'keydown' || eventType === 'keyup') &&
                      eventTarget === node
                    ) {
                      bool = true;
                    }
                  }
                } else if (
                  relatedTarget === null ||
                  relatedTarget === this.#lastFocusVisible
                ) {
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
                if (KEYS_INPUT_PLACEHOLDER.has(node.getAttribute('type'))) {
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
          if (
            (node.checked &&
              localName === 'input' &&
              (attrType === 'checkbox' || attrType === 'radio')) ||
            (node.selected && localName === 'option')
          ) {
            matched.add(node);
          }
          break;
        }
        case 'indeterminate': {
          if (
            (node.indeterminate &&
              localName === 'input' &&
              node.type === 'checkbox') ||
            (localName === 'progress' && !node.hasAttribute('value'))
          ) {
            matched.add(node);
          } else if (
            localName === 'input' &&
            node.type === 'radio' &&
            !node.hasAttribute('checked')
          ) {
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
            const walker = this._createTreeWalker(parent);
            let refNode = traverseNode(parent, walker);
            refNode = walker.firstChild();
            let checked;
            while (refNode) {
              if (
                refNode.localName === 'input' &&
                refNode.getAttribute('type') === 'radio'
              ) {
                if (refNode.hasAttribute('name')) {
                  if (refNode.getAttribute('name') === nodeName) {
                    checked = !!refNode.checked;
                  }
                } else {
                  checked = !!refNode.checked;
                }
                if (checked) {
                  break;
                }
              }
              refNode = walker.nextNode();
            }
            if (!checked) {
              matched.add(node);
            }
          }
          break;
        }
        case 'default': {
          // button[type="submit"], input[type="submit"], input[type="image"]
          const attrType = node.getAttribute('type');
          if (
            (localName === 'button' &&
              !(node.hasAttribute('type') && KEYS_INPUT_RESET.has(attrType))) ||
            (localName === 'input' &&
              node.hasAttribute('type') &&
              KEYS_INPUT_SUBMIT.has(attrType))
          ) {
            let form = node.parentNode;
            while (form) {
              if (form.localName === 'form') {
                break;
              }
              form = form.parentNode;
            }
            if (form) {
              const walker = this._createTreeWalker(form);
              let refNode = traverseNode(form, walker);
              refNode = walker.firstChild();
              while (refNode) {
                const nodeName = refNode.localName;
                const nodeAttrType = refNode.getAttribute('type');
                let m;
                if (nodeName === 'button') {
                  m = !(
                    refNode.hasAttribute('type') &&
                    KEYS_INPUT_RESET.has(nodeAttrType)
                  );
                } else if (nodeName === 'input') {
                  m =
                    refNode.hasAttribute('type') &&
                    KEYS_INPUT_SUBMIT.has(nodeAttrType);
                }
                if (m) {
                  if (refNode === node) {
                    matched.add(node);
                  }
                  break;
                }
                refNode = walker.nextNode();
              }
            }
            // input[type="checkbox"], input[type="radio"]
          } else if (
            localName === 'input' &&
            node.hasAttribute('type') &&
            node.hasAttribute('checked') &&
            KEYS_INPUT_CHECK.has(attrType)
          ) {
            matched.add(node);
            // option
          } else if (localName === 'option' && node.hasAttribute('selected')) {
            matched.add(node);
          }
          break;
        }
        case 'valid':
        case 'invalid': {
          if (KEYS_FORM_PS_VALID.has(localName)) {
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
            const walker = this._createTreeWalker(node);
            let refNode = traverseNode(node, walker);
            refNode = walker.firstChild();
            let valid;
            if (!refNode) {
              valid = true;
            } else {
              while (refNode) {
                if (KEYS_FORM_PS_VALID.has(refNode.localName)) {
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
          const attrType = node.getAttribute('type');
          if (
            localName === 'input' &&
            !(node.readonly || node.hasAttribute('readonly')) &&
            !(node.disabled || node.hasAttribute('disabled')) &&
            KEYS_INPUT_RANGE.has(attrType)
          ) {
            const flowed =
              node.validity.rangeUnderflow || node.validity.rangeOverflow;
            if (astName === 'out-of-range' && flowed) {
              matched.add(node);
            } else if (
              astName === 'in-range' &&
              !flowed &&
              (node.hasAttribute('min') ||
                node.hasAttribute('max') ||
                attrType === 'range')
            ) {
              matched.add(node);
            }
          }
          break;
        }
        case 'required':
        case 'optional': {
          let required;
          let optional;
          if (localName === 'select' || localName === 'textarea') {
            if (node.required || node.hasAttribute('required')) {
              required = true;
            } else {
              optional = true;
            }
          } else if (localName === 'input') {
            if (node.hasAttribute('type')) {
              const attrType = node.getAttribute('type');
              if (KEYS_INPUT_REQUIRED.has(attrType)) {
                if (node.required || node.hasAttribute('required')) {
                  required = true;
                } else {
                  optional = true;
                }
              } else {
                optional = true;
              }
            } else if (node.required || node.hasAttribute('required')) {
              required = true;
            } else {
              optional = true;
            }
          }
          if (astName === 'required' && required) {
            matched.add(node);
          } else if (astName === 'optional' && optional) {
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
            const walker = this._createTreeWalker(node, {
              force: true,
              whatToShow: SHOW_ALL
            });
            let refNode = walker.firstChild();
            let bool;
            while (refNode) {
              bool =
                refNode.nodeType !== ELEMENT_NODE &&
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
          if (
            (parentNode && node === parentNode.firstElementChild) ||
            node === this.#root
          ) {
            matched.add(node);
          }
          break;
        }
        case 'last-child': {
          if (
            (parentNode && node === parentNode.lastElementChild) ||
            node === this.#root
          ) {
            matched.add(node);
          }
          break;
        }
        case 'only-child': {
          if (
            (parentNode &&
              node === parentNode.firstElementChild &&
              node === parentNode.lastElementChild) ||
            node === this.#root
          ) {
            matched.add(node);
          }
          break;
        }
        case 'first-of-type': {
          if (parentNode) {
            const [node1] = this._collectNthOfType(
              {
                a: 0,
                b: 1
              },
              node
            );
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
            const [node1] = this._collectNthOfType(
              {
                a: 0,
                b: 1,
                reverse: true
              },
              node
            );
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
            const [node1] = this._collectNthOfType(
              {
                a: 0,
                b: 1
              },
              node
            );
            if (node1 === node) {
              const [node2] = this._collectNthOfType(
                {
                  a: 0,
                  b: 1,
                  reverse: true
                },
                node
              );
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
            // NOTE: MathMLElement is not implemented in jsdom.
          } else if (
            node instanceof this.#window.HTMLElement ||
            node instanceof this.#window.SVGElement
          ) {
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
            this.onError(
              generateException(
                `Unsupported pseudo-element ::${astName}`,
                NOT_SUPPORTED_ERR,
                this.#window
              )
            );
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
        case 'has-slotted':
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
            this.onError(
              generateException(
                `Unsupported pseudo-class :${astName}`,
                NOT_SUPPORTED_ERR,
                this.#window
              )
            );
          }
          break;
        }
        default: {
          if (astName.startsWith('-webkit-')) {
            if (warn) {
              this.onError(
                generateException(
                  `Unsupported pseudo-class :${astName}`,
                  NOT_SUPPORTED_ERR,
                  this.#window
                )
              );
            }
          } else if (!forgive) {
            this.onError(
              generateException(
                `Unknown pseudo-class :${astName}`,
                SYNTAX_ERR,
                this.#window
              )
            );
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
        return this.onError(
          generateException(`Invalid selector ${css}`, SYNTAX_ERR, this.#window)
        );
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
            return this.onError(
              generateException(
                `Invalid selector ${css}`,
                SYNTAX_ERR,
                this.#window
              )
            );
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
              return this.onError(
                generateException(
                  `Invalid selector ${css}`,
                  SYNTAX_ERR,
                  this.#window
                )
              );
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
    } else if (astName === 'host') {
      return node;
    }
    return this.onError(
      generateException(
        `Invalid selector :${astName}`,
        SYNTAX_ERR,
        this.#window
      )
    );
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
          const res = matchAttributeSelector(ast, node, opt);
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
          try {
            const { check } = opt;
            if (check) {
              const css = generateCSS(ast);
              this.#pseudoElement.push(css);
              matched.add(node);
            } else {
              matchPseudoElementSelector(astName, astType, opt);
            }
          } catch (e) {
            this.onError(e);
          }
        }
      }
    } else if (
      this.#shadow &&
      astType === PS_CLASS_SELECTOR &&
      node.nodeType === DOCUMENT_FRAGMENT_NODE
    ) {
      if (KEYS_LOGICAL.has(astName)) {
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
   * @param {object} [opt] - options
   * @returns {boolean} - result
   */
  _matchLeaves(leaves, node, opt = {}) {
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
      if (node.nodeType === ELEMENT_NODE && KEYS_FORM.has(node.localName)) {
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
            if (KEYS_PS_UNCACHE.has(leaf.name)) {
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
   * find descendant nodes
   * @private
   * @param {Array.<object>} leaves - AST leaves
   * @param {object} baseNode - base Element node or Element.shadowRoot
   * @param {object} [opt] - options
   * @returns {Set.<object>} - collection of matched nodes
   */
  _findDescendantNodes(leaves, baseNode, opt = {}) {
    const [leaf, ...filterLeaves] = leaves;
    const compound = filterLeaves.length > 0;
    const { type: leafType } = leaf;
    const leafName = unescapeSelector(leaf.name);
    const nodes = new Set();
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
        default: {
          pending = true;
        }
      }
    }
    if (pending) {
      const walker = this._createTreeWalker(baseNode);
      let refNode = traverseNode(baseNode, walker);
      refNode = walker.firstChild();
      while (refNode) {
        const bool = this._matchLeaves(leaves, refNode, opt);
        if (bool) {
          nodes.add(refNode);
        }
        refNode = walker.nextNode();
      }
    }
    return nodes;
  }

  /**
   * match combinator
   * @private
   * @param {object} twig - twig
   * @param {object} node - Element node
   * @param {object} [opt] - option
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
            let refNode = node.nextElementSibling;
            while (refNode) {
              const bool = this._matchLeaves(leaves, refNode, opt);
              if (bool) {
                matched.add(refNode);
              }
              refNode = refNode.nextElementSibling;
            }
          }
          break;
        }
        case '>': {
          let refNode = node.firstElementChild;
          while (refNode) {
            const bool = this._matchLeaves(leaves, refNode, opt);
            if (bool) {
              matched.add(refNode);
            }
            refNode = refNode.nextElementSibling;
          }
          break;
        }
        case ' ':
        default: {
          const nodes = this._findDescendantNodes(leaves, node, opt);
          if (nodes.size) {
            return nodes;
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
            let refNode = parentNode.firstElementChild;
            while (refNode) {
              if (refNode === node) {
                break;
              } else {
                const bool = this._matchLeaves(leaves, refNode, opt);
                if (bool) {
                  matched.add(refNode);
                }
              }
              refNode = refNode.nextElementSibling;
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
            return new Set(arr.toReversed());
          }
        }
      }
    }
    return matched;
  }

  /**
   * find matched node(s) preceding this.#node
   * @private
   * @param {Array.<object>} leaves - AST leaves
   * @param {object} node - node to start from
   * @param {object} opt - options
   * @param {boolean} [opt.force] - traverse only to next node
   * @param {string} [opt.targetType] - target type
   * @returns {Array.<object>} - collection of matched nodes
   */
  _findPrecede(leaves, node, opt = {}) {
    const { force, targetType } = opt;
    if (!this.#rootWalker) {
      this.#rootWalker = this._createTreeWalker(this.#root);
    }
    const walker = this.#rootWalker;
    const nodes = [];
    let refNode = traverseNode(node, walker, !!force);
    if (refNode && refNode !== this.#node) {
      if (refNode.nodeType !== ELEMENT_NODE) {
        refNode = walker.nextNode();
      } else if (refNode === node) {
        if (refNode !== this.#root) {
          refNode = walker.nextNode();
        }
      }
      while (refNode) {
        if (refNode === this.#node) {
          break;
        }
        const matched = this._matchLeaves(leaves, refNode, {
          warn: this.#warn
        });
        if (matched) {
          nodes.push(refNode);
          if (targetType !== TARGET_ALL) {
            break;
          }
        }
        refNode = walker.nextNode();
      }
    }
    return nodes;
  }

  /**
   * find matched node(s) in #nodeWalker
   * @private
   * @param {Array.<object>} leaves - AST leaves
   * @param {object} node - node to start from
   * @param {object} opt - options
   * @param {boolean} [opt.precede] - find precede
   * @param {boolean} [opt.force] - traverse only to next node
   * @param {string} [opt.targetType] - target type
   * @returns {Array.<object>} - collection of matched nodes
   */
  _findNodeWalker(leaves, node, opt = {}) {
    const { force, precede, targetType } = opt;
    if (precede) {
      const precedeNodes = this._findPrecede(leaves, this.#root, opt);
      if (precedeNodes.length) {
        return precedeNodes;
      }
    }
    if (!this.#nodeWalker) {
      this.#nodeWalker = this._createTreeWalker(this.#node);
    }
    const walker = this.#nodeWalker;
    const nodes = [];
    let refNode = traverseNode(node, walker, !!force);
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
          nodes.push(refNode);
          if (targetType !== TARGET_ALL) {
            break;
          }
        }
        refNode = walker.nextNode();
      }
    }
    return nodes;
  }

  /**
   * match self
   * @private
   * @param {Array} leaves - AST leaves
   * @param {boolean} check - running in internal check()
   * @returns {Array} - [nodes, filtered]
   */
  _matchSelf(leaves, check = false) {
    const nodes = [];
    let filtered = false;
    const bool = this._matchLeaves(leaves, this.#node, {
      check,
      warn: this.#warn
    });
    if (bool) {
      nodes.push(this.#node);
      filtered = true;
    }
    return [nodes, filtered, this.#pseudoElement];
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
   * find entry nodes
   * @private
   * @param {object} twig - twig
   * @param {string} targetType - target type
   * @param {object} [opt] - options
   * @param {boolean} [opt.complex] - complex selector
   * @param {string} [opt.dir] - find direction
   * @returns {object} - nodes and info about it's state.
   */
  _findEntryNodes(twig, targetType, opt = {}) {
    const { leaves } = twig;
    const [leaf, ...filterLeaves] = leaves;
    const compound = filterLeaves.length > 0;
    const { name: leafName, type: leafType } = leaf;
    const { complex = false, dir = DIR_PREV } = opt;
    const precede =
      dir === DIR_NEXT &&
      this.#node.nodeType === ELEMENT_NODE &&
      this.#node !== this.#root;
    let nodes = [];
    let filtered = false;
    let pending = false;
    switch (leafType) {
      case PS_ELEMENT_SELECTOR: {
        if (targetType === TARGET_SELF && this.#check) {
          const css = generateCSS(leaf);
          this.#pseudoElement.push(css);
          if (filterLeaves.length) {
            [nodes, filtered] = this._matchSelf(filterLeaves, this.#check);
          } else {
            nodes.push(this.#node);
            filtered = true;
          }
        } else {
          matchPseudoElementSelector(leafName, leafType, {
            warn: this.#warn
          });
        }
        break;
      }
      case ID_SELECTOR: {
        if (targetType === TARGET_SELF) {
          [nodes, filtered] = this._matchSelf(leaves);
        } else if (targetType === TARGET_LINEAL) {
          [nodes, filtered] = this._findLineal(leaves, {
            complex
          });
        } else if (
          targetType === TARGET_FIRST &&
          this.#root.nodeType !== ELEMENT_NODE
        ) {
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
        } else {
          nodes = this._findNodeWalker(leaves, this.#node, {
            precede,
            targetType
          });
          if (nodes.length) {
            filtered = true;
          }
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
        } else {
          nodes = this._findNodeWalker(leaves, this.#node, {
            precede,
            targetType
          });
          if (nodes.length) {
            filtered = true;
          }
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
        } else {
          nodes = this._findNodeWalker(leaves, this.#node, {
            precede,
            targetType
          });
          if (nodes.length) {
            filtered = true;
          }
        }
        break;
      }
      default: {
        if (
          targetType !== TARGET_LINEAL &&
          (leafName === 'host' || leafName === 'host-context')
        ) {
          let shadowRoot;
          if (this.#shadow && this.#node.nodeType === DOCUMENT_FRAGMENT_NODE) {
            shadowRoot = this._matchShadowHostPseudoClass(leaf, this.#node);
          } else if (compound && this.#node.nodeType === ELEMENT_NODE) {
            shadowRoot = this._matchShadowHostPseudoClass(
              leaf,
              this.#node.shadowRoot
            );
          }
          if (shadowRoot) {
            let bool;
            if (compound) {
              for (const item of filterLeaves) {
                if (/^host(?:-context)?$/.test(item.name)) {
                  const node = this._matchShadowHostPseudoClass(
                    item,
                    shadowRoot
                  );
                  bool = node === shadowRoot;
                } else if (item.name === 'has') {
                  bool = this._matchPseudoClassSelector(
                    item,
                    shadowRoot,
                    {}
                  ).has(shadowRoot);
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
          nodes = this._findNodeWalker(leaves, this.#node, {
            precede,
            targetType
          });
          if (nodes.length) {
            filtered = true;
          }
        } else {
          pending = true;
        }
      }
    }
    return {
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
   * @returns {Array.<Array.<object>>} - #ast and #nodes
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
            leaves: [{ name: firstName, type: firstType }]
          } = firstTwig;
          const lastTwig = branch[branchLen - 1];
          const {
            leaves: [{ name: lastName, type: lastType }]
          } = lastTwig;
          dir = DIR_NEXT;
          twig = firstTwig;
          if (
            this.#selector.includes(':scope') ||
            lastType === PS_ELEMENT_SELECTOR ||
            lastType === ID_SELECTOR
          ) {
            dir = DIR_PREV;
            twig = lastTwig;
          } else if (firstType === ID_SELECTOR) {
            dir = DIR_NEXT;
            twig = firstTwig;
          } else if (firstName === '*' && firstType === TYPE_SELECTOR) {
            dir = DIR_PREV;
            twig = lastTwig;
          } else if (lastName === '*' && lastType === TYPE_SELECTOR) {
            dir = DIR_NEXT;
            twig = firstTwig;
          } else if (branchLen === 2) {
            if (targetType === TARGET_FIRST) {
              dir = DIR_PREV;
              twig = lastTwig;
            } else {
              const { name: comboName } = firstCombo;
              if (comboName === '+' || comboName === '~') {
                dir = DIR_PREV;
                twig = lastTwig;
              }
            }
          }
        } else {
          dir = DIR_PREV;
          twig = firstTwig;
        }
        const { compound, filtered, nodes, pending } = this._findEntryNodes(
          twig,
          targetType,
          { complex, dir }
        );
        if (nodes.length) {
          this.#ast[i].find = true;
          this.#nodes[i] = nodes;
        } else if (pending) {
          pendingItems.add(
            new Map([
              ['index', i],
              ['twig', twig]
            ])
          );
        }
        this.#ast[i].dir = dir;
        this.#ast[i].filtered = filtered || !compound;
        i++;
      }
      if (pendingItems.size) {
        let node;
        let walker;
        if (this.#node !== this.#root && this.#node.nodeType === ELEMENT_NODE) {
          if (!this.#nodeWalker) {
            this.#nodeWalker = this._createTreeWalker(this.#node);
          }
          node = this.#node;
          walker = this.#nodeWalker;
        } else {
          if (!this.#rootWalker) {
            this.#rootWalker = this._createTreeWalker(this.#root);
          }
          node = this.#root;
          walker = this.#rootWalker;
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
        const dir = DIR_PREV;
        const { compound, filtered, nodes } = this._findEntryNodes(
          twig,
          targetType,
          { complex, dir }
        );
        if (nodes.length) {
          this.#ast[i].find = true;
          this.#nodes[i] = nodes;
        }
        this.#ast[i].dir = dir;
        this.#ast[i].filtered = filtered || !compound;
        i++;
      }
    }
    return [this.#ast, this.#nodes];
  }

  /**
   * get combined nodes
   * @private
   * @param {object} twig - twig
   * @param {object} nodes - collection of nodes
   * @param {string} dir - direction
   * @returns {Set.<object>} - collection of matched nodes
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
   * @param {number} opt.index - index
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
    const [[...branches], collectedNodes] = this._collectNodes(targetType);
    const l = branches.length;
    let sort;
    let nodes = new Set();
    for (let i = 0; i < l; i++) {
      const { branch, dir, find } = branches[i];
      const branchLen = branch.length;
      if (branchLen && find) {
        const entryNodes = collectedNodes[i];
        const entryNodesLen = entryNodes.length;
        const lastIndex = branchLen - 1;
        if (lastIndex === 0) {
          if (
            (targetType === TARGET_ALL || targetType === TARGET_FIRST) &&
            this.#node.nodeType === ELEMENT_NODE
          ) {
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
              nodes.add(...entryNodes);
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
            const { combo: firstCombo } = branch[0];
            let combo = firstCombo;
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
                      for (const nextNode of nextNodes) {
                        nodes.add(nextNode);
                      }
                      sort = true;
                      combo = firstCombo;
                    } else {
                      nodes = nextNodes;
                      combo = firstCombo;
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
            const matchedNode = this._matchNodeNext(branch, new Set([node]), {
              combo: entryCombo,
              index: 1
            });
            if (matchedNode) {
              if (this.#node.nodeType === ELEMENT_NODE) {
                if (
                  matchedNode !== this.#node &&
                  this.#node.contains(matchedNode)
                ) {
                  nodes.add(matchedNode);
                  matched = true;
                  break;
                }
              } else {
                nodes.add(matchedNode);
                matched = true;
                break;
              }
            }
          }
          if (!matched) {
            const { leaves: entryLeaves } = branch[0];
            const [entryNode] = entryNodes;
            if (this.#node.contains(entryNode)) {
              let [refNode] = this._findNodeWalker(entryLeaves, entryNode, {
                targetType
              });
              while (refNode) {
                const matchedNode = this._matchNodeNext(
                  branch,
                  new Set([refNode]),
                  {
                    combo: entryCombo,
                    index: 1
                  }
                );
                if (matchedNode) {
                  if (this.#node.nodeType === ELEMENT_NODE) {
                    if (
                      matchedNode !== this.#node &&
                      this.#node.contains(matchedNode)
                    ) {
                      nodes.add(matchedNode);
                      break;
                    }
                  } else {
                    nodes.add(matchedNode);
                    break;
                  }
                }
                [refNode] = this._findNodeWalker(entryLeaves, refNode, {
                  targetType,
                  force: true
                });
              }
            } else {
              const { combo: firstCombo } = branch[0];
              let combo = firstCombo;
              let nextNodes = new Set([entryNode]);
              for (let j = 1; j < branchLen; j++) {
                const { combo: nextCombo, leaves } = branch[j];
                const twig = {
                  combo,
                  leaves
                };
                nextNodes = this._getCombinedNodes(twig, nextNodes, dir);
                if (nextNodes.size) {
                  if (j === lastIndex) {
                    for (const nextNode of nextNodes) {
                      if (this.#node.contains(nextNode)) {
                        nodes.add(nextNode);
                        break;
                      }
                    }
                  } else {
                    combo = nextCombo;
                  }
                } else {
                  break;
                }
              }
            }
          }
        } else {
          let matched;
          for (const node of entryNodes) {
            const matchedNode = this._matchNodePrev(branch, node, {
              index: lastIndex - 1
            });
            if (matchedNode) {
              nodes.add(node);
              matched = true;
              break;
            }
          }
          if (!matched && targetType === TARGET_FIRST) {
            const { leaves: entryLeaves } = branch[lastIndex];
            const [entryNode] = entryNodes;
            let [refNode] = this._findNodeWalker(entryLeaves, entryNode, {
              targetType
            });
            while (refNode) {
              const matchedNode = this._matchNodePrev(branch, refNode, {
                index: lastIndex - 1
              });
              if (matchedNode) {
                nodes.add(refNode);
                break;
              }
              [refNode] = this._findNodeWalker(entryLeaves, refNode, {
                targetType,
                force: true
              });
            }
          }
        }
      }
    }
    if (this.#check) {
      const match = !!nodes.size;
      let pseudoElement;
      if (this.#pseudoElement.length) {
        pseudoElement = this.#pseudoElement.join('');
      } else {
        pseudoElement = null;
      }
      return {
        match,
        pseudoElement
      };
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
