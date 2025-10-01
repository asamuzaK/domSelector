/**
 * finder.js
 */

/* import */
import {
  matchAttributeSelector, matchDirectionPseudoClass, matchDisabledEnabledPseudo,
  matchLanguagePseudoClass, matchPseudoElementSelector,
  matchReadOnlyWritePseudo, matchTypeSelector
} from './matcher.js';
import {
  findAST, generateCSS, parseSelector, sortAST, unescapeSelector, walkAST
} from './parser.js';
import {
  filterNodesByAnB, isCustomElement, isFocusVisible, isFocusableArea,
  isValidShadowHostSelector, isVisible, resolveContent, sortNodes, traverseNode
} from './utility.js';

/* constants */
import {
  ATTR_SELECTOR, BIT_01, CLASS_SELECTOR, COMBINATOR, DOCUMENT_FRAGMENT_NODE,
  ELEMENT_NODE, FORM_PARTS, ID_SELECTOR, INPUT_CHECK, INPUT_DATE, INPUT_EDIT,
  INPUT_TEXT, KEY_LOGICAL, KEY_MODIFIER, NOT_SUPPORTED_ERR, PS_CLASS_SELECTOR,
  PS_ELEMENT_SELECTOR, SHOW_ALL, SHOW_CONTAINER, SYNTAX_ERR, TARGET_ALL,
  TARGET_FIRST, TARGET_LINEAL, TARGET_SELF, TEXT_NODE, TYPE_SELECTOR
} from './constant.js';
const DIR_NEXT = 'next';
const DIR_PREV = 'prev';
const KEY_FORM = new Set([...FORM_PARTS, 'fieldset', 'form']);
const KEY_FORM_PS_VALID = new Set([...FORM_PARTS, 'form']);
const KEY_INPUT_CHECK = new Set(INPUT_CHECK);
const KEY_INPUT_PLACEHOLDER = new Set([...INPUT_TEXT, 'number']);
const KEY_INPUT_RANGE = new Set([...INPUT_DATE, 'number', 'range']);
const KEY_INPUT_REQUIRED = new Set([...INPUT_CHECK, ...INPUT_EDIT, 'file']);
const KEY_INPUT_RESET = new Set(['button', 'reset']);
const KEY_INPUT_SUBMIT = new Set(['image', 'submit']);
const KEY_PS_UNCACHE = new Set(['any-link', 'defined', 'dir', 'link', 'scope']);

/**
 * Finder
 * NOTE: #ast[i] corresponds to #nodes[i]
 * #ast: Array.<Ast>
 * #nodes: Array.<Nodes>
 * Ast: {
 *   branch: Array.<Branch | undefined>,
 *   dir: string | null,
 *   filtered: boolean,
 *   find: boolean
 * }
 * Branch: Array.<Twig>
 * Twig: {
 *   combo: Leaf | null,
 *   leaves: Array<Leaf>
 * }
 * Leaf: {
 *   children: Array.<Leaf> | null,
 *   loc: null,
 *   type: string
 * }
 * Nodes: Array.<HTMLElement>
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
  #domSymbolTree;
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
    this.#eventHandlers = new Set([
      {
        keys: ['focus', 'focusin'],
        handler: this._handleFocusEvent.bind(this)
      },
      {
        keys: ['keydown', 'keyup'],
        handler: this._handleKeyboardEvent.bind(this)
      },
      {
        keys: ['mouseover', 'mousedown', 'mouseup', 'mouseout'],
        handler: this._handleMouseEvent.bind(this)
      },
      {
        keys: ['click'],
        handler: this._handleClickEvent.bind(this)
      }
    ]);
    this._registerEventListeners();
  }

  /**
   * handle error
   * @param {Error} e - Error
   * @param {object} [opt] - options
   * @param {boolean} [opt.noexcept] - no exception
   * @throws {Error} - Error
   * @returns {void}
   */
  onError(e, opt = {}) {
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
  }

  /**
   * setup finder
   * @param {string} selector - CSS selector
   * @param {object} node - Document, DocumentFragment, Element node
   * @param {object} [opt] - options
   * @param {boolean} [opt.check] - running in internal check()
   * @param {object} [opt.domSymbolTree] - domSymbolTree
   * @param {boolean} [opt.noexcept] - no exception
   * @param {boolean} [opt.warn] - console warn
   * @returns {object} - finder
   */
  setup(selector, node, opt = {}) {
    const { check, domSymbolTree, noexcept, warn } = opt;
    this.#check = !!check;
    this.#domSymbolTree = domSymbolTree;
    this.#noexcept = !!noexcept;
    this.#warn = !!warn;
    [
      this.#document,
      this.#root,
      this.#shadow
    ] = resolveContent(node);
    this.#documentURL = new URL(this.#document.URL);
    this.#node = node;
    this.#selector = selector;
    [
      this.#ast,
      this.#nodes
    ] = this._correspond(selector);
    this.#invalidateResults = new WeakMap();
    this.#pseudoElement = [];
    this.#walkers = new WeakMap();
    this.#verifyShadowHost = null;
    return this;
  }

  /**
   * handle focus events
   * @private
   * @param {Event} evt - event
   * @returns {void}
   */
  _handleFocusEvent(evt) {
    this.#focus = evt;
  }

  /**
   * handle keyboard events
   * @private
   * @param {Event} evt - event
   * @returns {void}
   */
  _handleKeyboardEvent(evt) {
    const { key } = evt;
    if (!KEY_MODIFIER.has(key)) {
      this.#event = evt;
    }
  }

  /**
   * handle mouse events
   * @private
   * @param {Event} evt - event
   * @returns {void}
   */
  _handleMouseEvent(evt) {
    this.#event = evt;
  }

  /**
   * handle click events
   * @private
   * @param {Event} evt - event
   * @returns {void}
   */
  _handleClickEvent(evt) {
    this.#event = evt;
    this.#invalidateResults = new WeakMap();
    this.#results = new WeakMap();
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
    for (const eventHandler of this.#eventHandlers) {
      const { keys, handler } = eventHandler;
      for (const key of keys) {
        func.push(this.#window.addEventListener(key, handler, opt));
      }
    }
    return func;
  }

  /**
   * generate DOMException
   * @private
   * @param {string} msg - error message
   * @param {string} name - error name
   * @returns {DOMException} - The generated DOMException object.
   */
  _generateDOMException(msg, name) {
    return new this.#window.DOMException(msg, name);
  }

  /**
   * process selector branches into the internal AST structure
   * @private
   * @param {Array.<Array.<object>>} branches - from walkAST
   * @param {string} selector - original selector for error reporting
   * @returns {object} - { ast, descendant, invalidate }
   */
  _processSelectorBranches(branches, selector) {
    let invalidate = false;
    let descendant = false;
    const ast = [];
    for (const [...items] of branches) {
      const branch = [];
      let item = items.shift();
      if (item && item.type !== COMBINATOR) {
        const leaves = new Set();
        while (item) {
          if (item.type === COMBINATOR) {
            const [nextItem] = items;
            if (!nextItem || nextItem.type === COMBINATOR) {
              const msg = `Invalid selector ${selector}`;
              this.onError(this._generateDOMException(msg, SYNTAX_ERR));
              // Stop processing
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
  }

  /**
   * correspond ast and nodes
   * @private
   * @param {string} selector - CSS selector
   * @returns {Array.<Array.<object>>} - array of ast and nodes
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
        hasHasPseudoFunc, hasLogicalPseudoFunc, hasNthChildOfSelector,
        hasStatePseudoClass
      } = info;
      const baseInvalidate = hasHasPseudoFunc || hasStatePseudoClass ||
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
      // Initialize nodes array
      for (let i = 0; i < ast.length; i++) {
        nodes[i] = [];
      }
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
   * @param {object} [opt] - options
   * @param {boolean} [opt.force] - force new tree walker
   * @param {number} [opt.whatToShow] - NodeFilter whatToShow
   * @returns {object} - tree walker
   */
  _createTreeWalker(node, opt = {}) {
    const { force = false, whatToShow = SHOW_CONTAINER } = opt;
    if (force) {
      return this.#document.createTreeWalker(node, whatToShow);
    }
    if (this.#walkers.has(node)) {
      return this.#walkers.get(node);
    }
    const walker = this.#document.createTreeWalker(node, whatToShow);
    this.#walkers.set(node, walker);
    return walker;
  }

  /**
   * prepare querySelector walker
   * @private
   * @returns {object} - tree walker
   */
  _prepareQuerySelectorWalker() {
    this.#nodeWalker = this._createTreeWalker(this.#node);
    this.#rootWalker = null;
    return this.#nodeWalker;
  }

  /**
   * get selector branches from cache or parse
   * @private
   * @param {object} selector - AST
   * @returns {Array.<Array.<object>>} - selector branches
   */
  _getSelectorBranches(selector) {
    if (this.#astCache.has(selector)) {
      return this.#astCache.get(selector);
    }
    const { branches } = walkAST(selector);
    this.#astCache.set(selector, branches);
    return branches;
  }

  /**
   * get children of a node, optionally filtered by a selector
   * @private
   * @param {object} parentNode - parent element
   * @param {Array.<Array.<object>>} selectorBranches - selector branches
   * @param {object} [opt] - options
   * @returns {Array.<object>} - array of child nodes
   */
  _getFilteredChildren(parentNode, selectorBranches, opt = {}) {
    const children = [];
    const walker = this._createTreeWalker(parentNode, { force: true });
    let childNode = walker.firstChild();
    while (childNode) {
      if (selectorBranches) {
        if (isVisible(childNode)) {
          let isMatch = false;
          for (const leaves of selectorBranches) {
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
   * @param {object} [opt] - options
   * @returns {Set.<object>} - collection of matched nodes
   */
  _collectNthChild(anb, node, opt = {}) {
    const { a, b, selector } = anb;
    const { parentNode } = node;
    if (!parentNode) {
      const matchedNode = new Set();
      if (node === this.#root && (a * 1 + b * 1) === 1) {
        if (selector) {
          const selectorBranches = this._getSelectorBranches(selector);
          for (const leaves of selectorBranches) {
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
    const children =
      this._getFilteredChildren(parentNode, selectorBranches, opt);
    const matchedNodes = filterNodesByAnB(children, anb);
    return new Set(matchedNodes);
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
    const { parentNode } = node;
    if (!parentNode) {
      if (node === this.#root && (anb.a * 1 + anb.b * 1) === 1) {
        return new Set([node]);
      }
      return new Set();
    }
    const typedSiblings = [];
    const walker = this._createTreeWalker(parentNode, { force: true });
    let sibling = walker.firstChild();
    while (sibling) {
      if (sibling.localName === node.localName &&
          sibling.namespaceURI === node.namespaceURI &&
          sibling.prefix === node.prefix) {
        typedSiblings.push(sibling);
      }
      sibling = walker.nextSibling();
    }
    const matchedNodes = filterNodesByAnB(typedSiblings, anb);
    return new Set(matchedNodes);
  }

  /**
   * match An+B
   * @private
   * @param {object} ast - AST
   * @param {object} node - Element node
   * @param {string} nthName - nth pseudo-class name
   * @param {object} [opt] - options
   * @returns {Set.<object>} - collection of matched nodes
   */
  _matchAnPlusB(ast, node, nthName, opt = {}) {
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
   * get nth-of-type related pseudo-class (:first-of-type, etc.)
   * @private
   * @param {string} astName - pseudo-class name
   * @param {object} node - Element node
   * @returns {?object} - matched node or null
   */
  _getNthOfTypePseudo(astName, node) {
    switch (astName) {
      case 'first-of-type': {
        const [first] = this._collectNthOfType({ a: 0, b: 1 }, node);
        return first;
      }
      case 'last-of-type': {
        const [last] =
          this._collectNthOfType({ a: 0, b: 1, reverse: true }, node);
        return last;
      }
      // case 'only-of-type' is handled by default
      default: {
        const [first] = this._collectNthOfType({ a: 0, b: 1 }, node);
        if (first === node) {
          const [last] =
            this._collectNthOfType({ a: 0, b: 1, reverse: true }, node);
          if (last === node) {
            return node;
          }
        }
        return null;
      }
    }
  }

  /**
   * match child-position pseudo-classes (:first-child, :last-child, :only-child)
   * @private
   * @param {string} astName - pseudo-class name
   * @param {object} node - Element node
   * @returns {boolean} - true if matched
   */
  _matchChildPositionPseudo(astName, node) {
    if (node === this.#root) {
      return true;
    }
    const { parentNode } = node;
    switch (astName) {
      case 'first-child': {
        return node === parentNode.firstElementChild;
      }
      case 'last-child': {
        return node === parentNode.lastElementChild;
      }
      // case 'only-child' is handled by default
      default: {
        return node === parentNode.firstElementChild &&
               node === parentNode.lastElementChild;
      }
    }
  }

  /**
   * match link-related pseudo-classes
   * @private
   * @param {string} astName - pseudo-class name
   * @param {object} node - Element node
   * @returns {boolean} - true if matched
   */
  _matchLinkPseudo(astName, node) {
    const { localName } = node;
    const isLinkElement =
      (localName === 'a' || localName === 'area') && node.hasAttribute('href');
    if (!isLinkElement) {
      return false;
    }
    switch (astName) {
      case 'local-link': {
        const { href, origin, pathname } = this.#documentURL;
        const attrURL = new URL(node.getAttribute('href'), href);
        return attrURL.origin === origin && attrURL.pathname === pathname;
      }
      case 'visited': {
        // prevent fingerprinting, so never match
        return false;
      }
      // cases 'any-link' and 'link' are handled by default
      default: {
        return true;
      }
    }
  }

  /**
   * match focus-related pseudo-classes
   * @private
   * @param {string} astName - pseudo-class name
   * @param {object} node - Element node
   * @returns {boolean} - true if matched
   */
  _matchFocusPseudo(astName, node) {
    switch (astName) {
      case 'focus-visible': {
        if (node === this.#document.activeElement && isFocusableArea(node)) {
          let bool = false;
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
            return true;
          } else if (this.#lastFocusVisible === node) {
            this.#lastFocusVisible = null;
          }
        }
        return false;
      }
      case 'focus-within': {
        let current = this.#document.activeElement;
        if (isFocusableArea(current)) {
          while (current) {
            if (current === node) {
              return true;
            }
            current = current.parentNode;
          }
        }
        return false;
      }
      // case 'focus' is handled by default
      default: {
        return node === this.#document.activeElement && isFocusableArea(node);
      }
    }
  }

  /**
   * match :hover and :active pseudo-classes
   * @private
   * @param {string} astName - pseudo-class name
   * @param {object} node - Element node
   * @returns {boolean} - true if matched
   */
  _matchHoverActivePseudo(astName, node) {
    const { target, type, buttons } = this.#event ?? {};
    if (!target) {
      return false;
    }
    if (astName === 'hover') {
      return /^(?:click|mouse(?:down|over|up))$/.test(type) &&
        node.contains(target);
    }
    return type === 'mousedown' && buttons & BIT_01 && node.contains(target);
  }

  /**
   * match selector branch backwards from a given node
   * @private
   * @param {Array.<object>} branch - AST branch
   * @param {object} node - node to start matching from
   * @param {object} opt - options
   * @returns {boolean} - true if the entire branch matches
   */
  _matchBranchBackwards(branch, node, opt) {
    let currentNodes = new Set([node]);
    // Iterate from the second to last twig to the first
    for (let i = branch.length - 2; i >= 0; i--) {
      const twig = branch[i];
      const matchedNodes = new Set();
      opt.dir = DIR_PREV;
      for (const currentNode of currentNodes) {
        const result = this._matchCombinator(twig, currentNode, opt);
        if (result.size) {
          const resultArr = [...result];
          matchedNodes.add(...resultArr);
        }
      }
      if (matchedNodes.size === 0) {
        return false;
      }
      currentNodes = matchedNodes;
    }
    // The entire chain matched
    return true;
  }

  /**
   * evaluate :has() pseudo-class
   * @private
   * @param {object} astData - AST data
   * @param {object} node - Element node
   * @param {object} [opt] - options
   * @returns {?object} - matched node
   */
  _evaluateHasPseudo(astData, node, opt) {
    const { branches } = astData;
    let bool = false;
    for (const leaves of branches) {
      bool = this._matchHasPseudoFunc(leaves, node, opt);
      if (bool) {
        break;
      }
    }
    if (!bool) {
      return null;
    }
    if (
      (opt.isShadowRoot || this.#shadow) &&
      node.nodeType === DOCUMENT_FRAGMENT_NODE
    ) {
      return this.#verifyShadowHost ? node : null;
    }
    return node;
  }

  /**
   * evaluate :is(), :not(), :where() pseudo-classes
   * @private
   * @param {object} astData - AST data
   * @param {object} node - Element node
   * @param {object} [opt] - options
   * @returns {?object} - matched node
   */
  _evaluateIsWhereNotPseudo(astData, node, opt) {
    const { astName, branches, twigBranches } = astData;
    const isShadowRoot = (opt.isShadowRoot || this.#shadow) &&
      node.nodeType === DOCUMENT_FRAGMENT_NODE;
    if (isShadowRoot && !isValidShadowHostSelector(astName, branches)) {
      return null;
    }
    opt.forgive = astName === 'is' || astName === 'where';
    let branchMatched = false;
    for (const branch of twigBranches) {
      const lastTwig = branch[branch.length - 1];
      const initialMatch = this._matchLeaves(lastTwig.leaves, node, opt);
      if (!initialMatch) {
        branchMatched = false;
      } else if (branch.length === 1) {
        branchMatched = true;
        break;
      } else {
        // If there are combinators, match backwards
        branchMatched = this._matchBranchBackwards(branch, node, opt);
        if (branchMatched) {
          break;
        }
      }
    }
    if (astName === 'not') {
      return branchMatched ? null : node;
    }
    return branchMatched ? node : null;
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
    const { astName } = astData;
    if (astName === 'has') {
      return this._evaluateHasPseudo(astData, node, opt);
    }
    // :is(), :not(), :where()
    return this._evaluateIsWhereNotPseudo(astData, node, opt);
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
    const { localName } = node;
    const { forgive, warn = this.#warn } = opt;
    const matched = new Set();
    /* :has(), :is(), :not(), :where() */
    if (Array.isArray(astChildren) && KEY_LOGICAL.has(astName)) {
      if (!astChildren.length && astName !== 'is' && astName !== 'where') {
        const css = generateCSS(ast);
        const msg = `Invalid selector ${css}`;
        return this.onError(this._generateDOMException(msg, SYNTAX_ERR));
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
              if (KEY_LOGICAL.has(leaf.name) &&
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
                const msg = `Invalid selector ${css}`;
                return this.onError(this._generateDOMException(msg, SYNTAX_ERR));
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
          const msg = `Invalid selector ${css}`;
          return this.onError(this._generateDOMException(msg, SYNTAX_ERR));
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
              const msg = `Invalid selector ${css}`;
              return this.onError(this._generateDOMException(msg, SYNTAX_ERR));
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
              const msg = `Invalid selector ${css}`;
              return this.onError(this._generateDOMException(msg, SYNTAX_ERR));
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
              const msg = `Unsupported pseudo-class :${astName}()`;
              this.onError(this._generateDOMException(msg, NOT_SUPPORTED_ERR));
            }
            break;
          }
          // ignore
          case 'host':
          case 'host-context': {
            break;
          }
          // dropped from CSS Selectors 3
          case 'contains': {
            if (warn) {
              const msg = `Unknown pseudo-class :${astName}()`;
              this.onError(this._generateDOMException(msg, NOT_SUPPORTED_ERR));
            }
            break;
          }
          default: {
            if (!forgive) {
              const msg = `Unknown pseudo-class :${astName}()`;
              this.onError(this._generateDOMException(msg, SYNTAX_ERR));
            }
          }
        }
      }
    } else {
      switch (astName) {
        case 'any-link':
        case 'link':
        case 'local-link':
        case 'visited': {
          if (this._matchLinkPseudo(astName, node)) {
            matched.add(node);
          }
          break;
        }
        case 'hover':
        case 'active': {
          if (this._matchHoverActivePseudo(astName, node)) {
            matched.add(node);
          }
          break;
        }
        case 'target': {
          const { hash } = this.#documentURL;
          if (node.id && hash === `#${node.id}` &&
              this.#document.contains(node)) {
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
        case 'focus':
        case 'focus-visible':
        case 'focus-within': {
          if (this._matchFocusPseudo(astName, node)) {
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
          if (matchDisabledEnabledPseudo(astName, node)) {
            matched.add(node);
          }
          break;
        }
        case 'read-only':
        case 'read-write': {
          if (matchReadOnlyWritePseudo(astName, node)) {
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
                if (KEY_INPUT_PLACEHOLDER.has(node.getAttribute('type'))) {
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
            const walker = this._createTreeWalker(parent);
            let refNode = traverseNode(parent, walker);
            refNode = walker.firstChild();
            let checked;
            while (refNode) {
              if (refNode.localName === 'input' &&
                  refNode.getAttribute('type') === 'radio') {
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
          if ((localName === 'button' &&
               !(node.hasAttribute('type') && KEY_INPUT_RESET.has(attrType))) ||
              (localName === 'input' && node.hasAttribute('type') &&
               KEY_INPUT_SUBMIT.has(attrType))) {
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
                  m = !(refNode.hasAttribute('type') &&
                      KEY_INPUT_RESET.has(nodeAttrType));
                } else if (nodeName === 'input') {
                  m = refNode.hasAttribute('type') &&
                      KEY_INPUT_SUBMIT.has(nodeAttrType);
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
          } else if (localName === 'input' && node.hasAttribute('type') &&
                     KEY_INPUT_CHECK.has(attrType) &&
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
          if (KEY_FORM_PS_VALID.has(localName)) {
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
                if (KEY_FORM_PS_VALID.has(refNode.localName)) {
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
          if (localName === 'input' &&
              !(node.readonly || node.hasAttribute('readonly')) &&
              !(node.disabled || node.hasAttribute('disabled')) &&
              KEY_INPUT_RANGE.has(attrType)) {
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
              if (KEY_INPUT_REQUIRED.has(attrType)) {
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
        case 'first-child':
        case 'last-child':
        case 'only-child': {
          if (this._matchChildPositionPseudo(astName, node)) {
            matched.add(node);
          }
          break;
        }
        case 'first-of-type':
        case 'last-of-type':
        case 'only-of-type': {
          if (node === this.#root) {
            matched.add(node);
          } else {
            const matchedNode = this._getNthOfTypePseudo(astName, node);
            if (matchedNode) {
              matched.add(matchedNode);
            }
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
            const msg = `Unsupported pseudo-element ::${astName}`;
            this.onError(this._generateDOMException(msg, NOT_SUPPORTED_ERR));
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
            const msg = `Unsupported pseudo-class :${astName}`;
            this.onError(this._generateDOMException(msg, NOT_SUPPORTED_ERR));
          }
          break;
        }
        default: {
          if (astName.startsWith('-webkit-')) {
            if (warn) {
              const msg = `Unsupported pseudo-class :${astName}`;
              this.onError(this._generateDOMException(msg, NOT_SUPPORTED_ERR));
            }
          } else if (!forgive) {
            const msg = `Unknown pseudo-class :${astName}`;
            this.onError(this._generateDOMException(msg, SYNTAX_ERR));
          }
        }
      }
    }
    return matched;
  }

  /**
   * evaluate :host() pseudo-class
   * @private
   * @param {Array.<object>} leaves - AST leaves
   * @param {object} host - host element
   * @param {object} ast - original AST for error reporting
   * @returns {boolean} - true if matched
   */
  _evaluateHostPseudo(leaves, host, ast) {
    for (const leaf of leaves) {
      if (leaf.type === COMBINATOR) {
        const css = generateCSS(ast);
        const msg = `Invalid selector ${css}`;
        this.onError(this._generateDOMException(msg, SYNTAX_ERR));
        return false;
      }
      if (!this._matchSelector(leaf, host).has(host)) {
        return false;
      }
    }
    return true;
  }

  /**
   * evaluate :host-context() pseudo-class
   * @private
   * @param {Array.<object>} leaves - AST leaves
   * @param {object} host - host element
   * @param {object} ast - original AST for error reporting
   * @returns {boolean} - true if matched
   */
  _evaluateHostContextPseudo(leaves, host, ast) {
    let parent = host;
    while (parent) {
      let bool;
      for (const leaf of leaves) {
        if (leaf.type === COMBINATOR) {
          const css = generateCSS(ast);
          const msg = `Invalid selector ${css}`;
          this.onError(this._generateDOMException(msg, SYNTAX_ERR));
          return false;
        }
        bool = this._matchSelector(leaf, parent).has(parent);
        if (!bool) {
          break;
        }
      }
      if (bool) {
        return true;
      }
      parent = parent.parentNode;
    }
    return false;
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
    // Guard clause for simple pseudo-class (no arguments)
    if (!Array.isArray(astChildren)) {
      if (astName === 'host') {
        return node;
      }
      const msg = `Invalid selector :${astName}`;
      return this.onError(this._generateDOMException(msg, SYNTAX_ERR));
    }
    // From here, we are dealing with a functional pseudo-class like :host(...)
    // Guard clause for unsupported functional pseudo-classes
    if (astName !== 'host' && astName !== 'host-context') {
      const msg = `Invalid selector :${astName}()`;
      return this.onError(this._generateDOMException(msg, SYNTAX_ERR));
    }
    // Guard clause for invalid number of arguments
    if (astChildren.length !== 1) {
      const css = generateCSS(ast);
      const msg = `Invalid selector ${css}`;
      return this.onError(this._generateDOMException(msg, SYNTAX_ERR));
    }
    const { host } = node;
    const { branches } = walkAST(astChildren[0]);
    const [branch] = branches;
    const [...leaves] = branch;
    if (astName === 'host') {
      const isMatch = this._evaluateHostPseudo(leaves, host, ast);
      return isMatch ? node : null;
    } else { // astName === 'host-context'
      const isMatch = this._evaluateHostContextPseudo(leaves, host, ast);
      return isMatch ? node : null;
    }
  }

  /**
   * match selector for element nodes
   * @private
   * @param {object} ast - AST
   * @param {object} node - Element node
   * @param {object} [opt] - options
   * @returns {Set.<object>} - collection of matched nodes
   */
  _matchSelectorForElement(ast, node, opt = {}) {
    const { type: astType } = ast;
    const astName = unescapeSelector(ast.name);
    const matched = new Set();
    switch (astType) {
      case ATTR_SELECTOR: {
        if (matchAttributeSelector(ast, node, opt)) {
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
        return this._matchPseudoClassSelector(ast, node, opt);
      }
      case TYPE_SELECTOR: {
        if (matchTypeSelector(ast, node, opt)) {
          matched.add(node);
        }
        break;
      }
      case PS_ELEMENT_SELECTOR:
      default: {
        try {
          if (opt.check) {
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
    return matched;
  }

  /**
   * match selector for shadow root
   * @private
   * @param {object} ast - AST
   * @param {object} node - DocumentFragment node
   * @param {object} [opt] - options
   * @returns {Set.<object>} - collection of matched nodes
   */
  _matchSelectorForShadowRoot(ast, node, opt = {}) {
    const { name: astName } = ast;
    const matched = new Set();
    if (KEY_LOGICAL.has(astName)) {
      opt.isShadowRoot = true;
      return this._matchPseudoClassSelector(ast, node, opt);
    } else if (astName === 'host' || astName === 'host-context') {
      const res = this._matchShadowHostPseudoClass(ast, node, opt);
      if (res) {
        this.#verifyShadowHost = true;
        matched.add(res);
      }
    }
    return matched;
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
    if (node.nodeType === ELEMENT_NODE) {
      return this._matchSelectorForElement(ast, node, opt);
    }
    if (this.#shadow && node.nodeType === DOCUMENT_FRAGMENT_NODE &&
        ast.type === PS_CLASS_SELECTOR) {
      return this._matchSelectorForShadowRoot(ast, node, opt);
    }
    return new Set();
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
    const results = this.#invalidate ? this.#invalidateResults : this.#results;
    let result = results.get(leaves);
    if (result && result.has(node)) {
      const { matched } = result.get(node);
      return matched;
    } else {
      let cacheable = true;
      if (node.nodeType === ELEMENT_NODE && KEY_FORM.has(node.localName)) {
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
            if (KEY_PS_UNCACHE.has(leaf.name)) {
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
        results.set(leaves, result);
      }
      return bool;
    }
  }

  /**
   * traverse all descendant nodes and collect matches
   * @private
   * @param {object} baseNode - base Element node or Element.shadowRoot
   * @param {Array.<object>} leaves - AST leaves
   * @param {object} [opt] - options
   * @returns {Set.<object>} - collection of matched nodes
   */
  _traverseAllDescendants(baseNode, leaves, opt = {}) {
    const walker = this._createTreeWalker(baseNode);
    traverseNode(baseNode, walker);
    let currentNode = walker.firstChild();
    const nodes = new Set();
    while (currentNode) {
      if (this._matchLeaves(leaves, currentNode, opt)) {
        nodes.add(currentNode);
      }
      currentNode = walker.nextNode();
    }
    return nodes;
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
    const { type: leafType } = leaf;
    switch (leafType) {
      case ID_SELECTOR: {
        const canUseGetElementById = !this.#shadow &&
                                     baseNode.nodeType === ELEMENT_NODE &&
                                     this.#root.nodeType !== ELEMENT_NODE;
        if (canUseGetElementById) {
          const leafName = unescapeSelector(leaf.name);
          const nodes = new Set();
          const foundNode = this.#root.getElementById(leafName);
          if (
            foundNode && foundNode !== baseNode &&
            baseNode.contains(foundNode)
          ) {
            const isCompoundSelector = filterLeaves.length > 0;
            if (
              !isCompoundSelector ||
              this._matchLeaves(filterLeaves, foundNode, opt)
            ) {
              nodes.add(foundNode);
            }
          }
          return nodes;
        }
        // Fall through to default traversal if fast path isn't applicable.
        return this._traverseAllDescendants(baseNode, leaves, opt);
      }
      case PS_ELEMENT_SELECTOR: {
        const leafName = unescapeSelector(leaf.name);
        matchPseudoElementSelector(leafName, leafType, opt);
        return new Set();
      }
      default:
        return this._traverseAllDescendants(baseNode, leaves, opt);
    }
  }

  /**
   * match descendant combinator ' '
   * @private
   * @param {object} twig - twig
   * @param {object} node - Element node
   * @param {object} [opt] - options
   * @returns {Set.<object>} - collection of matched nodes
   */
  _matchDescendantCombinator(twig, node, opt = {}) {
    const { leaves } = twig;
    const { parentNode } = node;
    const { dir } = opt;
    if (dir === DIR_NEXT) {
      return this._findDescendantNodes(leaves, node, opt);
    }
    // DIR_PREV
    const ancestors = [];
    let refNode = parentNode;
    while (refNode) {
      if (this._matchLeaves(leaves, refNode, opt)) {
        ancestors.push(refNode);
      }
      refNode = refNode.parentNode;
    }
    if (ancestors.length) {
      // reverse to maintain document order
      return new Set(ancestors.reverse());
    }
    return new Set();
  }

  /**
   * match child combinator '>'
   * @private
   * @param {object} twig - twig
   * @param {object} node - Element node
   * @param {object} [opt] - options
   * @returns {Set.<object>} - collection of matched nodes
   */
  _matchChildCombinator(twig, node, opt = {}) {
    const { leaves } = twig;
    const { dir } = opt;
    const { parentNode } = node;
    const matched = new Set();
    if (dir === DIR_NEXT) {
      let refNode = node.firstElementChild;
      while (refNode) {
        if (this._matchLeaves(leaves, refNode, opt)) {
          matched.add(refNode);
        }
        refNode = refNode.nextElementSibling;
      }
    } else {
      // DIR_PREV
      if (parentNode && this._matchLeaves(leaves, parentNode, opt)) {
        matched.add(parentNode);
      }
    }
    return matched;
  }

  /**
   * match adjacent sibling combinator '+'
   * @private
   * @param {object} twig - twig
   * @param {object} node - Element node
   * @param {object} [opt] - options
   * @returns {Set.<object>} - collection of matched nodes
   */
  _matchAdjacentSiblingCombinator(twig, node, opt = {}) {
    const { leaves } = twig;
    const { dir } = opt;
    const matched = new Set();
    const refNode = (dir === DIR_NEXT)
      ? node.nextElementSibling
      : node.previousElementSibling;
    if (refNode && this._matchLeaves(leaves, refNode, opt)) {
      matched.add(refNode);
    }
    return matched;
  }

  /**
   * match general sibling combinator '~'
   * @private
   * @param {object} twig - twig
   * @param {object} node - Element node
   * @param {object} [opt] - options
   * @returns {Set.<object>} - collection of matched nodes
   */
  _matchGeneralSiblingCombinator(twig, node, opt = {}) {
    const { leaves } = twig;
    const { dir } = opt;
    const matched = new Set();
    let refNode = (dir === DIR_NEXT)
      ? node.nextElementSibling
      : node.previousElementSibling;
    while (refNode) {
      if (this._matchLeaves(leaves, refNode, opt)) {
        matched.add(refNode);
      }
      refNode = (dir === DIR_NEXT)
        ? refNode.nextElementSibling
        : refNode.previousElementSibling;
    }
    return matched;
  }

  /**
   * match combinator
   * @private
   * @param {object} twig - twig
   * @param {object} node - Element node
   * @param {object} [opt] - options
   * @returns {Set.<object>} - collection of matched nodes
   */
  _matchCombinator(twig, node, opt = {}) {
    const { combo: { name: comboName } } = twig;
    switch (comboName) {
      case '+':
        return this._matchAdjacentSiblingCombinator(twig, node, opt);
      case '~':
        return this._matchGeneralSiblingCombinator(twig, node, opt);
      case '>':
        return this._matchChildCombinator(twig, node, opt);
      case ' ':
      default:
        return this._matchDescendantCombinator(twig, node, opt);
    }
  }

  /**
   * Traverse using a TreeWalker and collect nodes that match the leaves.
   * @private
   * @param {TreeWalker} walker - The TreeWalker instance to use.
   * @param {Array} leaves - AST leaves to match against.
   * @param {object} options - Traversal options.
   * @param {Node} options.startNode - The node to start traversal from.
   * @param {string} options.targetType - Type of target ('all' or 'first').
   * @param {Node} [options.boundaryNode] - Node at which to stop traversal.
   * @param {boolean} [options.force] - Force traversal to the next node.
   * @returns {Array.<Node>} - Array of matched nodes.
   */
  _traverseAndCollectNodes(walker, leaves, options) {
    const { boundaryNode, force, startNode, targetType } = options;
    const collectedNodes = [];
    let currentNode = traverseNode(startNode, walker, !!force);
    if (!currentNode) {
      return [];
    }
    // Adjust starting node.
    if (currentNode.nodeType !== ELEMENT_NODE) {
      currentNode = walker.nextNode();
    } else if (currentNode === startNode && currentNode !== this.#root) {
      currentNode = walker.nextNode();
    }
    while (currentNode) {
      // Stop when we reach the boundary node.
      if (boundaryNode && currentNode === boundaryNode) {
        break;
      }
      if (this._matchLeaves(leaves, currentNode, { warn: this.#warn })) {
        collectedNodes.push(currentNode);
        // Stop after the first match if not collecting all.
        if (targetType !== TARGET_ALL) {
          break;
        }
      }
      currentNode = walker.nextNode();
    }
    return collectedNodes;
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
    return this._traverseAndCollectNodes(this.#rootWalker, leaves, {
      force,
      targetType,
      boundaryNode: this.#node,
      startNode: node,
    });
  }

  /**
   * find matched node(s) in #nodeWalker
   * @private
   * @param {Array.<object>} leaves - AST leaves
   * @param {object} node - node to start from
   * @param {object} opt - options
   * @param {boolean} [opt.precede] - find precede
   * @returns {Array.<object>} - collection of matched nodes
   */
  _findNodeWalker(leaves, node, opt = {}) {
    const { precede, ...traversalOpts } = opt;
    if (precede) {
      const precedeNodes = this._findPrecede(leaves, this.#root, opt);
      if (precedeNodes.length) {
        return precedeNodes;
      }
    }
    return this._traverseAndCollectNodes(this.#nodeWalker, leaves, {
      startNode: node,
      ...traversalOpts
    });
  }

  /**
   * match self
   * @private
   * @param {Array} leaves - AST leaves
   * @param {boolean} check - running in internal check()
   * @returns {Array} - [nodes, filtered]
   */
  _matchSelf(leaves, check = false) {
    const options = { check, warn: this.#warn };
    const matched = this._matchLeaves(leaves, this.#node, options);
    const nodes = matched ? [this.#node] : [];
    return [nodes, matched, this.#pseudoElement];
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
    const options = { warn: this.#warn };
    const selfMatched = this._matchLeaves(leaves, this.#node, options);
    if (selfMatched) {
      nodes.push(this.#node);
    }
    if (!selfMatched || complex) {
      let currentNode = this.#node.parentNode;
      while (currentNode) {
        if (this._matchLeaves(leaves, currentNode, options)) {
          nodes.push(currentNode);
        }
        currentNode = currentNode.parentNode;
      }
    }
    const filtered = nodes.length > 0;
    return [nodes, filtered];
  }

  /**
   * find entry nodes for pseudo-element selectors
   * @private
   * @param {object} leaf - The pseudo-element leaf from the AST.
   * @param {Array.<object>} filterLeaves - Leaves for compound selectors.
   * @param {string} targetType - The type of target to find.
   * @returns {object} - The result object { nodes, filtered }.
   */
  _findEntryNodesForPseudoElement(leaf, filterLeaves, targetType) {
    let nodes = [];
    let filtered = false;
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
      matchPseudoElementSelector(leaf.name, leaf.type, { warn: this.#warn });
    }
    return { nodes, filtered, pending: false };
  }

  /**
   * find entry nodes for ID selectors
   * @private
   * @param {object} twig - The current twig from the AST branch.
   * @param {string} targetType - The type of target to find.
   * @param {object} opt - Additional options for finding nodes.
   * @returns {object} - The result object { nodes, filtered }.
   */
  _findEntryNodesForId(twig, targetType, opt) {
    const { leaves } = twig;
    const [leaf, ...filterLeaves] = leaves;
    const { complex, precede } = opt;
    let nodes = [];
    let filtered = false;
    if (targetType === TARGET_SELF) {
      [nodes, filtered] = this._matchSelf(leaves);
    } else if (targetType === TARGET_LINEAL) {
      [nodes, filtered] = this._findLineal(leaves, { complex });
    } else if (
      targetType === TARGET_FIRST &&
      this.#root.nodeType !== ELEMENT_NODE
    ) {
      const node = this.#root.getElementById(leaf.name);
      if (node) {
        if (filterLeaves.length > 0) {
          if (this._matchLeaves(filterLeaves, node, { warn: this.#warn })) {
            nodes.push(node);
            filtered = true;
          }
        } else {
          nodes.push(node);
          filtered = true;
        }
      }
    } else {
      nodes = this._findNodeWalker(leaves, this.#node, { precede, targetType });
      if (nodes.length) {
        filtered = true;
      }
    }
    return { nodes, filtered, pending: false };
  }

  /**
   * find entry nodes for class selectors
   * @private
   * @param {Array.<object>} leaves - The AST leaves for the selector.
   * @param {string} targetType - The type of target to find.
   * @param {object} opt - Additional options for finding nodes.
   * @returns {object} - The result object { nodes, filtered }.
   */
  _findEntryNodesForClass(leaves, targetType, opt) {
    const { complex, precede } = opt;
    let nodes = [];
    let filtered = false;
    if (targetType === TARGET_SELF) {
      [nodes, filtered] = this._matchSelf(leaves);
    } else if (targetType === TARGET_LINEAL) {
      [nodes, filtered] = this._findLineal(leaves, { complex });
    } else {
      nodes = this._findNodeWalker(leaves, this.#node, { precede, targetType });
      if (nodes.length) {
        filtered = true;
      }
    }
    return { nodes, filtered, pending: false };
  }

  /**
   * find entry nodes for type selectors
   * @private
   * @param {Array.<object>} leaves - The AST leaves for the selector.
   * @param {string} targetType - The type of target to find.
   * @param {object} opt - Additional options for finding nodes.
   * @returns {object} - The result object { nodes, filtered }.
   */
  _findEntryNodesForType(leaves, targetType, opt) {
    const { complex, precede } = opt;
    let nodes = [];
    let filtered = false;
    if (targetType === TARGET_SELF) {
      [nodes, filtered] = this._matchSelf(leaves);
    } else if (targetType === TARGET_LINEAL) {
      [nodes, filtered] = this._findLineal(leaves, { complex });
    } else {
      nodes = this._findNodeWalker(leaves, this.#node, { precede, targetType });
      if (nodes.length) {
        filtered = true;
      }
    }
    return { nodes, filtered, pending: false };
  }

  /**
   * find entry nodes for other selector types (default case)
   * @private
   * @param {object} twig - The current twig from the AST branch.
   * @param {string} targetType - The type of target to find.
   * @param {object} opt - Additional options for finding nodes.
   * @returns {object} - The result object { nodes, filtered, pending }.
   */
  _findEntryNodesForOther(twig, targetType, opt) {
    const { leaves } = twig;
    const [leaf, ...filterLeaves] = leaves;
    const { complex, precede } = opt;
    let nodes = [];
    let filtered = false;
    let pending = false;
    if (targetType !== TARGET_LINEAL && /host(?:-context)?/.test(leaf.name)) {
      let shadowRoot = null;
      if (this.#shadow && this.#node.nodeType === DOCUMENT_FRAGMENT_NODE) {
        shadowRoot = this._matchShadowHostPseudoClass(leaf, this.#node);
      } else if (filterLeaves.length && this.#node.nodeType === ELEMENT_NODE) {
        shadowRoot =
          this._matchShadowHostPseudoClass(leaf, this.#node.shadowRoot);
      }
      if (shadowRoot) {
        let bool = true;
        for (const leaf of filterLeaves) {
          switch (leaf.name) {
            case 'host':
            case 'host-context': {
              const matchedNode =
                this._matchShadowHostPseudoClass(leaf, shadowRoot);
              bool = matchedNode === shadowRoot;
              break;
            }
            case 'has': {
              bool = this._matchPseudoClassSelector(leaf, shadowRoot, {})
                .has(shadowRoot);
              break;
            }
            default: {
              bool = false;
            }
          }
          if (!bool) {
            break;
          }
        }
        if (bool) {
          nodes.push(shadowRoot);
          filtered = true;
        }
      }
    } else if (targetType === TARGET_SELF) {
      [nodes, filtered] = this._matchSelf(leaves);
    } else if (targetType === TARGET_LINEAL) {
      [nodes, filtered] = this._findLineal(leaves, { complex });
    } else if (targetType === TARGET_FIRST) {
      nodes = this._findNodeWalker(leaves, this.#node, { precede, targetType });
      if (nodes.length) {
        filtered = true;
      }
    } else {
      pending = true;
    }
    return { nodes, filtered, pending };
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
    const { complex = false, dir = DIR_PREV } = opt;
    const precede = dir === DIR_NEXT && this.#node.nodeType === ELEMENT_NODE &&
      this.#node !== this.#root;
    let result;
    switch (leaf.type) {
      case PS_ELEMENT_SELECTOR: {
        result =
          this._findEntryNodesForPseudoElement(leaf, filterLeaves, targetType);
        break;
      }
      case ID_SELECTOR: {
        result = this._findEntryNodesForId(twig, targetType, {
          complex, precede
        });
        break;
      }
      case CLASS_SELECTOR: {
        result = this._findEntryNodesForClass(leaves, targetType, {
          complex,
          precede
        });
        break;
      }
      case TYPE_SELECTOR: {
        result = this._findEntryNodesForType(leaves, targetType, {
          complex,
          precede
        });
        break;
      }
      default: {
        result = this._findEntryNodesForOther(twig, targetType, {
          complex,
          precede
        });
      }
    }
    return {
      compound: filterLeaves.length > 0,
      filtered: result.filtered,
      nodes: result.nodes,
      pending: result.pending
    };
  }

  /**
   * determine the direction and starting twig for a selector branch
   * @private
   * @param {Array.<object>} branch - The AST branch.
   * @param {string} targetType - The type of target to find.
   * @returns {object} - An object containing the direction and the starting twig.
   */
  _determineTraversalStrategy(branch, targetType) {
    const branchLen = branch.length;
    const firstTwig = branch[0];
    const lastTwig = branch[branchLen - 1];
    if (branchLen === 1) {
      return { dir: DIR_PREV, twig: firstTwig };
    }
    // Complex selector (branchLen > 1)
    const { leaves: [{ name: firstName, type: firstType }] } = firstTwig;
    const { leaves: [{ name: lastName, type: lastType }] } = lastTwig;
    const { combo: firstCombo } = firstTwig;
    if (
      this.#selector.includes(':scope') ||
      lastType === PS_ELEMENT_SELECTOR ||
      lastType === ID_SELECTOR
    ) {
      return { dir: DIR_PREV, twig: lastTwig };
    }
    if (firstType === ID_SELECTOR) {
      return { dir: DIR_NEXT, twig: firstTwig };
    }
    if (firstName === '*' && firstType === TYPE_SELECTOR) {
      return { dir: DIR_PREV, twig: lastTwig };
    }
    if (lastName === '*' && lastType === TYPE_SELECTOR) {
      return { dir: DIR_NEXT, twig: firstTwig };
    }
    if (branchLen === 2) {
      if (targetType === TARGET_FIRST) {
        return { dir: DIR_PREV, twig: lastTwig };
      }
      const { name: comboName } = firstCombo;
      if (comboName === '+' || comboName === '~') {
        return { dir: DIR_PREV, twig: lastTwig };
      }
    }
    // Default strategy for complex selectors
    return { dir: DIR_NEXT, twig: firstTwig };
  }

  /**
   * process pending items that could not be resolved with a direct strategy
   * @private
   * @param {Set.<Map>} pendingItems - The set of pending items.
   */
  _processPendingItems(pendingItems) {
    if (!pendingItems.size) {
      return;
    }
    let node;
    let walker;
    if (this.#node !== this.#root && this.#node.nodeType === ELEMENT_NODE) {
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
      const isWithinScope = this.#node.nodeType !== ELEMENT_NODE ||
                            nextNode === this.#node ||
                            this.#node.contains(nextNode);
      if (isWithinScope) {
        for (const pendingItem of pendingItems) {
          const { leaves } = pendingItem.get('twig');
          if (this._matchLeaves(leaves, nextNode, { warn: this.#warn })) {
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
        const complex = branch.length > 1;
        const { dir, twig } =
          this._determineTraversalStrategy(branch, targetType);
        const {
          compound, filtered, nodes, pending
        } = this._findEntryNodes(twig, targetType, { complex, dir });
        if (nodes.length) {
          this.#ast[i].find = true;
          this.#nodes[i] = nodes;
        } else if (pending) {
          pendingItems.add(new Map([
            ['index', i],
            ['twig', twig]
          ]));
        }
        this.#ast[i].dir = dir;
        this.#ast[i].filtered = filtered || !compound;
        i++;
      }
      this._processPendingItems(pendingItems);
    } else {
      let i = 0;
      for (const { branch } of ast) {
        const twig = branch[branch.length - 1];
        const complex = branch.length > 1;
        const dir = DIR_PREV;
        const {
          compound, filtered, nodes
        } = this._findEntryNodes(twig, targetType, { complex, dir });
        if (nodes.length) {
          this.#ast[i].find = true;
          this.#nodes[i] = nodes;
        }
        this.#ast[i].dir = dir;
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
    const options = {
      dir,
      warn: this.#warn
    };
    for (const node of nodes) {
      const matched = this._matchCombinator(twig, node, options);
      if (matched.size) {
        arr.push(...matched);
      }
    }
    return arr;
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
    const nextNodes = new Set(this._getCombinedNodes(twig, nodes, DIR_NEXT));
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
    const nextNodes = new Set(this._getCombinedNodes(twig, nodes, DIR_PREV));
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
      const { branch, dir, find } = branches[i];
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
                const nodesArr = this._getCombinedNodes(twig, nextNodes, dir);
                if (nodesArr.length) {
                  if (j === lastIndex) {
                    if (nodes.size) {
                      for (const nextNode of nodesArr) {
                        nodes.add(nextNode);
                      }
                      sort = true;
                      combo = firstCombo;
                    } else {
                      nodes = new Set(nodesArr);
                      combo = firstCombo;
                    }
                  } else {
                    combo = nextCombo;
                    nextNodes = new Set(nodesArr);
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
                const nodesArr = this._getCombinedNodes(twig, nextNodes, dir);
                if (nodesArr.length) {
                  if (j === 0) {
                    nodes.add(node);
                    if (branchLen > 1 && nodes.size > 1) {
                      sort = true;
                    }
                  }
                  nextNodes = new Set(nodesArr);
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
                if (matchedNode !== this.#node &&
                    this.#node.contains(matchedNode)) {
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
                const matchedNode =
                  this._matchNodeNext(branch, new Set([refNode]), {
                    combo: entryCombo,
                    index: 1
                  });
                if (matchedNode) {
                  if (this.#node.nodeType === ELEMENT_NODE) {
                    if (matchedNode !== this.#node &&
                        this.#node.contains(matchedNode)) {
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
                const nodesArr = this._getCombinedNodes(twig, nextNodes, dir);
                if (nodesArr.length) {
                  if (j === lastIndex) {
                    for (const nextNode of nodesArr) {
                      if (this.#node.contains(nextNode)) {
                        nodes.add(nextNode);
                        break;
                      }
                    }
                  } else {
                    combo = nextCombo;
                    nextNodes = new Set(nodesArr);
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
