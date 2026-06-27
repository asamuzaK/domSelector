/**
 * evaluator.js
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
import { generateCSS, unescapeSelector, walkAST } from './parser.js';
import {
  findBestSeed,
  generateException,
  isCustomElement,
  isFocusVisible,
  isFocusableArea,
  isVisible,
  populateHasAllowlist,
  resolveContent,
  traverseNode
} from './utility.js';

/* constants */
import {
  ATTR_SELECTOR,
  CLASS_SELECTOR,
  COMBINATOR,
  DOCUMENT_FRAGMENT_NODE,
  ELEMENT_NODE,
  FORM_PARTS,
  HEX,
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
const KEYS_PS_NTH_OF_TYPE = new Set([
  'first-of-type',
  'last-of-type',
  'only-of-type'
]);

/**
 * Evaluator
 */
export class Evaluator {
  /* private fields */
  #anbCache;
  #ast;
  #astCache = new WeakMap();
  #check;
  #descendant;
  #document;
  #documentCache = new WeakMap();
  #documentURL;
  #event;
  #eventHandlers;
  #filterLeavesCache;
  #focus;
  #focusWithinCache;
  #lastFocusVisible;
  #node;
  #nodes;
  #noexcept;
  #nthChildCache;
  #nthChildOfCache;
  #nthChildResultCache;
  #nthOfTypeCache;
  #nthOfTypeResultCache;
  #psDefaultCache;
  #psDirCache;
  #psHasFilterCache;
  #psIndeterminateCache;
  #psLangCache;
  #psValidCache;
  #pseudoElement;
  #results;
  #root;
  #selectorAST;
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
        keys: ['mouseover', 'mousedown', 'mouseup', 'click', 'mouseout'],
        handler: this._handleMouseEvent
      }
    ]);
    this._registerEventListeners();
    this.clearResults(true);
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
   * Sets up the evaluator.
   * @param {string} selector - The CSS selector.
   * @param {object} node - Document, DocumentFragment, or Element.
   * @param {object} [opt] - Options.
   * @param {boolean} [opt.check] - Indicates if running in internal check().
   * @param {boolean} [opt.noexcept] - If true, exceptions are not thrown.
   * @param {boolean} [opt.warn] - If true, console warnings are enabled.
   * @returns {object} The matcher instance.
   */
  setup = (selector, node, opt = {}) => {
    const { check, noexcept, warn } = opt;
    this.#check = !!check;
    this.#noexcept = !!noexcept;
    this.#warn = !!warn;
    [this.#document, this.#root, this.#shadow] = resolveContent(node);
    this.#documentURL = null;
    this.#node = node;
    this.#pseudoElement = [];
    this.#walkers = null;
    this.#verifyShadowHost = null;
    this.clearResults();
    return this;
  };

  /**
   * Clear cached results.
   * @param {boolean} all - Clear all results.
   * @returns {void}
   */
  clearResults = (all = false) => {
    this.#anbCache = null;
    this.#focusWithinCache = null;
    this.#nthChildCache = null;
    this.#nthChildOfCache = null;
    this.#nthOfTypeCache = null;
    this.#psDefaultCache = null;
    this.#psDirCache = null;
    this.#psHasFilterCache = null;
    this.#psIndeterminateCache = null;
    this.#psLangCache = null;
    this.#psValidCache = null;
    if (all) {
      this.#filterLeavesCache = null;
      this.#results = new WeakMap();
    }
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
   * Registers event listeners.
   * @private
   * @returns {Array.<void>} An array of return values from addEventListener.
   */
  _registerEventListeners = () => {
    const func = [];
    for (const eventHandler of this.#eventHandlers) {
      const { keys, handler } = eventHandler;
      const l = keys.length;
      for (let i = 0; i < l; i++) {
        const key = keys[i];
        func.push(
          this.#window.addEventListener(key, handler, {
            capture: true,
            passive: true
          })
        );
      }
    }
    return func;
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
    }
    if (!this.#walkers) {
      this.#walkers = new WeakMap();
    }
    if (this.#walkers.has(node)) {
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
   * Gets all element siblings of a node.
   * @private
   * @param {object} node - The element node.
   * @returns {Array.<object>} An array of sibling elements.
   */
  _getSiblings = node => {
    const { parentNode } = node;
    if (!parentNode) {
      return node === this.#root ? [node] : [];
    }
    if (!this.#nthChildCache) {
      this.#nthChildCache = new WeakMap();
    }
    let siblings = this.#nthChildCache.get(parentNode);
    if (siblings) {
      return siblings;
    }
    siblings = [];
    let child = parentNode.firstElementChild;
    while (child) {
      siblings.push(child);
      child = child.nextElementSibling;
    }
    this.#nthChildCache.set(parentNode, siblings);
    return siblings;
  };

  /**
   * Gets all typed element siblings of a node.
   * @private
   * @param {object} node - The element node.
   * @returns {Array.<object>} An array of typed sibling elements.
   */
  _getTypedSiblings = node => {
    const { localName, namespaceURI, parentNode, prefix } = node;
    if (!parentNode) {
      return node === this.#root ? [node] : [];
    }
    if (!this.#nthOfTypeCache) {
      this.#nthOfTypeCache = new WeakMap();
    }
    let typeMap = this.#nthOfTypeCache.get(parentNode);
    if (!typeMap) {
      typeMap = new Map();
      this.#nthOfTypeCache.set(parentNode, typeMap);
    }
    const typeKey = `${namespaceURI || ''}|${prefix || ''}|${localName}`;
    let siblings = typeMap.get(typeKey);
    if (siblings) {
      return siblings;
    }
    siblings = [];
    let child = parentNode.firstElementChild;
    while (child) {
      if (
        child.localName === localName &&
        child.namespaceURI === namespaceURI &&
        child.prefix === prefix
      ) {
        siblings.push(child);
      }
      child = child.nextElementSibling;
    }
    typeMap.set(typeKey, siblings);
    return siblings;
  };

  /**
   * Gets all filtered element siblings of a node.
   * @private
   * @param {object} node - The element node.
   * @param {object} selector - The selector AST.
   * @param {object} opt - Options.
   * @returns {Array.<object>} An array of filtered sibling elements.
   */
  _getFilteredSiblings = (node, selector, opt) => {
    const selectorBranches = this._getSelectorBranches(selector);
    const { parentNode } = node;
    if (!parentNode) {
      const l = selectorBranches.length;
      for (let i = 0; i < l; i++) {
        if (this._matchLeaves(selectorBranches[i], node, opt)) {
          return [node];
        }
      }
      return [];
    }
    if (!this.#nthChildOfCache) {
      this.#nthChildOfCache = new WeakMap();
    }
    let parentOfCacheMap = this.#nthChildOfCache.get(parentNode);
    if (!parentOfCacheMap) {
      parentOfCacheMap = new Map();
      this.#nthChildOfCache.set(parentNode, parentOfCacheMap);
    }
    let siblings = parentOfCacheMap.get(selector);
    if (siblings) {
      return siblings;
    }
    siblings = [];
    let child = parentNode.firstElementChild;
    while (child) {
      let isMatch = false;
      const l = selectorBranches.length;
      for (let i = 0; i < l; i++) {
        if (this._matchLeaves(selectorBranches[i], child, opt)) {
          isMatch = true;
          break;
        }
      }
      if (isMatch) {
        if (this.#node === child) {
          siblings.push(child);
        } else if (isVisible(child)) {
          siblings.push(child);
        }
      }
      child = child.nextElementSibling;
    }
    parentOfCacheMap.set(selector, siblings);
    return siblings;
  };

  /**
   * Evaluates An+B mathematically (O(1) without generating new arrays/sets).
   * @private
   * @param {object} ast - The AST.
   * @param {object} node - The Element node.
   * @param {string} nthName - The name of the nth pseudo-class.
   * @param {object} opt - Options.
   * @returns {boolean} True if matches, otherwise false.
   */
  _matchAnPlusB = (ast, node, nthName, opt) => {
    if (!this.#anbCache) {
      this.#anbCache = new WeakMap();
    }
    let anb = this.#anbCache.get(ast);
    if (!anb) {
      const {
        nth: { a, b, name: nthIdentName },
        selector
      } = ast;
      anb = { a: 0, b: 0, selector: null };
      if (nthIdentName) {
        if (nthIdentName === 'even') {
          anb.a = 2;
          anb.b = 0;
        } else if (nthIdentName === 'odd') {
          anb.a = 2;
          anb.b = 1;
        }
      } else {
        anb.a = typeof a === 'string' && /-?\d+/.test(a) ? a * 1 : 0;
        anb.b = typeof b === 'string' && /-?\d+/.test(b) ? b * 1 : 0;
      }
      if (
        selector &&
        (nthName === 'nth-child' || nthName === 'nth-last-child')
      ) {
        anb.selector = selector;
      }
      this.#anbCache.set(ast, anb);
    }
    let siblings;
    if (nthName === 'nth-child' || nthName === 'nth-last-child') {
      if (anb.selector) {
        siblings = this._getFilteredSiblings(node, anb.selector, opt);
      } else {
        siblings = this._getSiblings(node);
      }
    } else if (nthName === 'nth-of-type' || nthName === 'nth-last-of-type') {
      siblings = this._getTypedSiblings(node);
    } else {
      return false;
    }
    const index = siblings.indexOf(node);
    if (index === -1) {
      return false;
    }
    // 1-based index calculation
    const isLast = nthName.includes('last');
    const pos = isLast ? siblings.length - index : index + 1;
    const { a, b } = anb;
    if (a === 0) {
      return pos === b;
    }
    const diff = pos - b;
    if (diff % a !== 0) {
      return false;
    }
    // Equation: diff / a >= 0
    return a > 0 ? diff >= 0 : diff <= 0;
  };

  /**
   * Matches the :has() pseudo-class function.
   * @private
   * @param {Array.<object>} astLeaves - The AST leaves.
   * @param {object} node - The Element node.
   * @param {object} [opt] - Options.
   * @returns {boolean} The result.
   */
  _matchHasPseudoFunc = (astLeaves, node, opt = {}) => {
    const l = astLeaves.length;
    if (!l) {
      return false;
    }
    let combo;
    let startIndex = 0;
    if (astLeaves[0].type === COMBINATOR) {
      combo = astLeaves[0];
      startIndex = 1;
    } else {
      combo = {
        name: ' ',
        type: COMBINATOR
      };
      startIndex = 0;
    }
    const twigLeaves = [];
    let nextComboIndex = startIndex;
    for (; nextComboIndex < l; nextComboIndex++) {
      if (astLeaves[nextComboIndex].type === COMBINATOR) {
        break;
      }
      twigLeaves.push(astLeaves[nextComboIndex]);
    }
    const twig = {
      combo,
      leaves: twigLeaves
    };
    opt.dir = DIR_NEXT;
    const nodes = this._collectCombinatorMatches(twig, node, opt, []);
    if (nodes.length) {
      if (nextComboIndex < l) {
        let bool = false;
        const remainingLeaves = astLeaves.slice(nextComboIndex);
        for (const nextNode of nodes) {
          bool = this._matchHasPseudoFunc(remainingLeaves, nextNode, opt);
          if (bool) {
            break;
          }
        }
        return bool;
      }
      return true;
    }
    return false;
  };

  /**
   * Builds an Allowlist for the :has() branch using a sparse seed element.
   * @private
   * @param {Array} leaves - The AST leaves of the selector branch.
   * @returns {object|null} The wrapper object containing the WeakSet, or null.
   */
  _buildHasAllowlist = leaves => {
    const { seed } = findBestSeed(leaves);
    if (!seed) {
      return null;
    }
    if (this.#shadow || this.#node.nodeType === DOCUMENT_FRAGMENT_NODE) {
      return null;
    }
    let seedElements = null;
    let isSingleNode = false;
    if (seed.type === 'id') {
      if (typeof this.#root.getElementById === 'function') {
        const node = this.#root.getElementById(seed.value);
        if (node) {
          seedElements = node;
          isSingleNode = true;
        }
      }
    } else if (seed.type === 'class') {
      if (typeof this.#root.getElementsByClassName === 'function') {
        seedElements = this.#root.getElementsByClassName(seed.value);
      }
    } else if (seed.type === 'tag') {
      if (typeof this.#root.getElementsByTagName === 'function') {
        seedElements = this.#root.getElementsByTagName(seed.value);
      }
    }
    if (!seedElements) {
      return null;
    }
    const len = isSingleNode ? 1 : seedElements.length;
    if (len === 0 || len > HEX * HEX) {
      return null;
    }
    const filterResult = {
      seeded: true,
      set: new WeakSet()
    };
    const list = filterResult.set;
    const visitedAncestors = new Set();
    if (this.#node) {
      list.add(this.#node);
    }
    for (let i = 0; i < len; i++) {
      const current = isSingleNode ? seedElements : seedElements[i];
      if (current) {
        populateHasAllowlist(current, list, visitedAncestors);
      }
    }
    return filterResult;
  };

  /**
   * Evaluates :has() pseudo-class.
   * @private
   * @param {object} astData - The AST data.
   * @param {object} node - The Element node.
   * @param {object} [opt] - Options.
   * @returns {?object} The matched node.
   */
  _evaluateHasPseudo = (astData, node, opt = {}) => {
    const { branches } = astData;
    let bool = false;
    if (!this.#psHasFilterCache) {
      this.#psHasFilterCache = new WeakMap();
    }
    let rootCache = this.#psHasFilterCache.get(this.#root);
    if (!rootCache) {
      rootCache = new WeakMap();
      this.#psHasFilterCache.set(this.#root, rootCache);
    }
    for (const leaves of branches) {
      if (!rootCache.has(leaves)) {
        const filterResult = this._buildHasAllowlist(leaves);
        rootCache.set(leaves, filterResult);
      }
      const allowlist = rootCache.get(leaves);
      if (
        allowlist &&
        allowlist.seeded &&
        node.nodeType !== DOCUMENT_FRAGMENT_NODE &&
        !allowlist.set.has(node)
      ) {
        continue;
      }
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
  };

  /**
   * Matches logical pseudo-class functions.
   * @private
   * @param {object} astData - The AST data.
   * @param {object} node - The Element node.
   * @param {object} [opt] - Options.
   * @returns {boolean} Tru if matches, otherwise false.
   */
  _matchLogicalPseudoFunc = (astData, node, opt = {}) => {
    const { astName, branches, twigBranches } = astData;
    // Handle :has().
    if (astName === 'has') {
      return this._evaluateHasPseudo(astData, node, opt) === node;
    }
    // Handle :is(), :not(), :where().
    const isShadowRoot =
      (opt.isShadowRoot || this.#shadow) &&
      node.nodeType === DOCUMENT_FRAGMENT_NODE;
    // Check for invalid shadow root.
    if (isShadowRoot) {
      let invalid = false;
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
        return false;
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
            this._collectCombinatorMatches(twig, nextNode, opt, arr);
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
      return !bool;
    }
    return bool;
  };

  /**
   * Evaluates logical pseudo-class selector.
   * @private
   * @param {object} ast - The AST.
   * @param {object} node - The Element node.
   * @param {object} [opt] - Options.
   * @param {boolean} [opt.forgive] - Ignores unknown or invalid selectors.
   * @param {boolean} [opt.warn] - If true, console warnings are enabled.
   * @returns {boolean} True if matches, otherwise false.
   */
  _evaluateLogicalPseudo = (ast, node, opt = {}) => {
    const { children: astChildren, name: astName } = ast;
    if (!astChildren.length && astName !== 'is' && astName !== 'where') {
      const css = generateCSS(ast);
      const msg = `Invalid selector ${css}`;
      this.onError(generateException(msg, SYNTAX_ERR, this.#window));
      return false;
    }
    const cachedAstData = this.#astCache.get(ast);
    if (cachedAstData) {
      return this._matchLogicalPseudoFunc(cachedAstData, node, opt);
    }
    const { branches } = walkAST(ast);
    if (astName === 'has') {
      return this._matchLogicalPseudoFunc(
        {
          astName,
          branches
        },
        node,
        opt
      );
    }
    const twigBranches = [];
    const l = branches.length;
    for (let i = 0; i < l; i++) {
      const leaves = branches[i];
      const branch = [];
      const leavesSet = new Set();
      const leavesLen = leaves.length;
      for (let j = 0; j < leavesLen; j++) {
        const item = leaves[j];
        if (item.type === COMBINATOR) {
          branch.push({
            combo: item,
            leaves: [...leavesSet]
          });
          leavesSet.clear();
        } else {
          leavesSet.add(item);
        }
        if (j === leavesLen - 1) {
          branch.push({
            combo: null,
            leaves: [...leavesSet]
          });
          leavesSet.clear();
        }
      }
      twigBranches.push(branch);
    }
    const astData = {
      astName,
      branches,
      twigBranches
    };
    this.#astCache.set(ast, astData);
    return this._matchLogicalPseudoFunc(astData, node, opt);
  };

  /**
   * Evaluates pseudo-class function.
   * @private
   * @see https://html.spec.whatwg.org/#pseudo-classes
   * @param {object} ast - The AST.
   * @param {object} node - The Element node.
   * @param {object} [opt] - Options.
   * @param {boolean} [opt.forgive] - Ignores unknown or invalid selectors.
   * @param {boolean} [opt.warn] - If true, console warnings are enabled.
   * @returns {boolean} True if matches, otherwise false.
   */
  _evaluatePseudoClassFunc = (ast, node, opt = {}) => {
    const { children: astChildren, name: astName } = ast;
    const { forgive, warn = this.#warn } = opt;
    // :nth-child(), :nth-last-child(), nth-of-type(), :nth-last-of-type()
    if (/^nth-(?:last-)?(?:child|of-type)$/.test(astName)) {
      if (astChildren.length !== 1) {
        const css = generateCSS(ast);
        this.onError(
          generateException(`Invalid selector ${css}`, SYNTAX_ERR, this.#window)
        );
        return false;
      }
      const [branch] = astChildren;
      return this._matchAnPlusB(branch, node, astName, opt);
    }
    switch (astName) {
      // :dir()
      case 'dir': {
        if (astChildren.length !== 1) {
          const css = generateCSS(ast);
          this.onError(
            generateException(
              `Invalid selector ${css}`,
              SYNTAX_ERR,
              this.#window
            )
          );
          return false;
        }
        const [astChild] = astChildren;
        if (!this.#psDirCache) {
          this.#psDirCache = new WeakMap();
        }
        const res = matchDirectionPseudoClass(astChild, node, this.#psDirCache);
        if (res) {
          return true;
        }
        break;
      }
      // :lang()
      case 'lang': {
        if (!astChildren.length) {
          const css = generateCSS(ast);
          this.onError(
            generateException(
              `Invalid selector ${css}`,
              SYNTAX_ERR,
              this.#window
            )
          );
          return false;
        }
        if (!this.#psLangCache) {
          this.#psLangCache = new WeakMap();
        }
        let bool;
        for (const astChild of astChildren) {
          bool = matchLanguagePseudoClass(astChild, node, this.#psLangCache);
          if (bool) {
            break;
          }
        }
        if (bool) {
          return true;
        }
        break;
      }
      // :state()
      case 'state': {
        if (isCustomElement(node)) {
          const [{ value: stateValue }] = astChildren;
          if (stateValue) {
            if (node[stateValue]) {
              return true;
            }
            for (const i in node) {
              const prop = node[i];
              if (prop instanceof this.#window.ElementInternals) {
                if (prop?.states?.has(stateValue)) {
                  return true;
                }
                break;
              }
            }
          }
        }
        break;
      }
      case 'current':
      case 'heading':
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
      // Ignore :host() and :host-context().
      case 'host':
      case 'host-context': {
        break;
      }
      // Deprecated in CSS Selectors 3.
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
    return false;
  };

  /**
   * Matches pseudo-class selector.
   * @private
   * @see https://html.spec.whatwg.org/#pseudo-classes
   * @param {object} ast - The AST.
   * @param {object} node - The Element node.
   * @param {object} [opt] - Options.
   * @param {boolean} [opt.forgive] - Ignores unknown or invalid selectors.
   * @param {boolean} [opt.warn] - If true, console warnings are enabled.
   * @returns {Set.<object>|boolean} A collection of matched nodes.
   */
  _matchPseudoClassSelector = (ast, node, opt = {}) => {
    const { children: astChildren, name: astName } = ast;
    const { localName, parentNode } = node;
    const { forgive, warn = this.#warn } = opt;
    if (Array.isArray(astChildren)) {
      // :has(), :is(), :not(), :where()
      if (KEYS_LOGICAL.has(astName)) {
        return this._evaluateLogicalPseudo(ast, node, opt);
      }
      return this._evaluatePseudoClassFunc(ast, node, opt);
    }
    if (KEYS_PS_NTH_OF_TYPE.has(astName)) {
      if (!parentNode) {
        return node === this.#root;
      }
      const siblings = this._getTypedSiblings(node);
      switch (astName) {
        case 'first-of-type': {
          return siblings[0] === node;
        }
        case 'last-of-type': {
          return siblings[siblings.length - 1] === node;
        }
        case 'only-of-type':
        default: {
          return siblings.length === 1 && siblings[0] === node;
        }
      }
    }
    switch (astName) {
      /* Elemental pseudo-classes */
      case 'defined': {
        if (node.hasAttribute('is') || localName.includes('-')) {
          return isCustomElement(node);
        }
        return (
          node instanceof this.#window.HTMLElement ||
          node instanceof this.#window.SVGElement
        );
      }
      /* Element display state pseudo-classes */
      case 'open': {
        // <select> and <input type="color"> are not supported.
        return (
          (localName === 'details' || localName === 'dialog') &&
          node.hasAttribute('open')
        );
      }
      case 'popover-open': {
        // FIXME: Not implemented in jsdom
        // @see https://github.com/jsdom/jsdom/issues/3721
        // return node.popover && isVisible(node);
        break;
      }
      /* Input pseudo-classes */
      case 'disabled':
      case 'enabled': {
        return matchDisabledPseudoClass(astName, node);
      }
      case 'read-only':
      case 'read-write': {
        return matchReadOnlyPseudoClass(astName, node);
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
          if (targetNode) {
            return node.value === '';
          }
        }
        break;
      }
      case 'default': {
        // option
        if (localName === 'option') {
          return node.hasAttribute('selected');
        }
        const attrType = node.getAttribute('type');
        // input[type="checkbox"], input[type="radio"]
        if (
          localName === 'input' &&
          node.hasAttribute('type') &&
          node.hasAttribute('checked')
        ) {
          return KEYS_INPUT_CHECK.has(attrType);
        }
        // button[type="submit"], input[type="submit"], input[type="image"]
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
            if (!this.#psDefaultCache) {
              this.#psDefaultCache = new WeakMap();
            }
            let defaultSubmit = this.#psDefaultCache.get(form);
            if (!defaultSubmit) {
              const walker = this._createTreeWalker(form, { force: true });
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
                  defaultSubmit = refNode;
                  break;
                }
                refNode = walker.nextNode();
              }
              this.#psDefaultCache.set(form, defaultSubmit);
            }
            return defaultSubmit === node;
          }
        }
        break;
      }
      case 'checked': {
        if (localName === 'option') {
          return node.selected;
        }
        if (localName === 'input') {
          const attrType = node.getAttribute('type');
          return (
            node.checked && (attrType === 'checkbox' || attrType === 'radio')
          );
        }
        break;
      }
      case 'indeterminate': {
        if (localName === 'progress') {
          return !node.hasAttribute('value');
        }
        if (localName === 'input' && node.type === 'checkbox') {
          return node.indeterminate;
        }
        if (localName === 'input' && node.type === 'radio') {
          if (node.checked || node.hasAttribute('checked')) {
            return false;
          }
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
          if (!this.#psIndeterminateCache) {
            this.#psIndeterminateCache = new WeakMap();
          }
          let parentCache = this.#psIndeterminateCache.get(parent);
          if (!parentCache) {
            parentCache = new Map();
            this.#psIndeterminateCache.set(parent, parentCache);
          }
          let checked = parentCache.get(nodeName);
          if (checked === undefined) {
            const walker = this._createTreeWalker(parent, { force: true });
            let refNode = traverseNode(parent, walker);
            refNode = walker.firstChild();
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
            checked = !!checked;
            parentCache.set(nodeName, checked);
          }
          return !checked;
        }
        break;
      }
      case 'valid':
      case 'invalid': {
        if (KEYS_FORM_PS_VALID.has(localName)) {
          let valid = false;
          if (node.checkValidity()) {
            if (node.maxLength >= 0) {
              if (node.maxLength >= node.value.length) {
                valid = true;
              }
            } else {
              valid = true;
            }
          }
          if (astName === 'invalid') {
            return !valid;
          }
          return valid;
        }
        if (localName === 'fieldset') {
          if (!this.#psValidCache) {
            this.#psValidCache = new WeakMap();
          }
          let valid = this.#psValidCache.get(node);
          if (valid === undefined && !this.#psValidCache.has(node)) {
            const walker = this._createTreeWalker(node, { force: true });
            let refNode = traverseNode(node, walker);
            refNode = walker.firstChild();
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
            this.#psValidCache.set(node, valid);
          }
          if (astName === 'invalid') {
            return !valid;
          }
          return valid;
        }
        break;
      }
      case 'in-range':
      case 'out-of-range': {
        const attrType = node.getAttribute('type');
        if (
          localName === 'input' &&
          !(node.readOnly || node.hasAttribute('readonly')) &&
          !(node.disabled || node.hasAttribute('disabled')) &&
          KEYS_INPUT_RANGE.has(attrType)
        ) {
          const flowed =
            node.validity.rangeUnderflow || node.validity.rangeOverflow;
          if (astName === 'out-of-range') {
            return flowed;
          }
          return flowed
            ? false
            : node.hasAttribute('min') ||
                node.hasAttribute('max') ||
                attrType === 'range';
        }
        break;
      }
      case 'required':
      case 'optional': {
        let required = false;
        if (localName === 'select' || localName === 'textarea') {
          if (node.required || node.hasAttribute('required')) {
            required = true;
          }
        } else if (localName === 'input') {
          if (node.hasAttribute('type')) {
            const attrType = node.getAttribute('type');
            if (KEYS_INPUT_REQUIRED.has(attrType)) {
              if (node.required || node.hasAttribute('required')) {
                required = true;
              }
            }
          } else if (node.required || node.hasAttribute('required')) {
            required = true;
          }
        }
        if (astName === 'optional') {
          return !required;
        }
        return required;
      }
      /* Location pseudo-classes */
      case 'any-link':
      case 'link': {
        return (
          (localName === 'a' || localName === 'area') &&
          node.hasAttribute('href')
        );
      }
      case 'local-link': {
        if (
          (localName === 'a' || localName === 'area') &&
          node.hasAttribute('href')
        ) {
          if (!this.#documentURL) {
            this.#documentURL = new URL(this.#document.URL);
          }
          const { href, origin, pathname } = this.#documentURL;
          const attrURL = new URL(node.getAttribute('href'), href);
          return attrURL.origin === origin && attrURL.pathname === pathname;
        }
        break;
      }
      case 'visited': {
        // prevent fingerprinting
        break;
      }
      case 'target': {
        if (!this.#documentURL) {
          this.#documentURL = new URL(this.#document.URL);
        }
        const { hash } = this.#documentURL;
        return hash && hash === `#${node.id}` && this.#document.contains(node);
      }
      case 'scope': {
        if (this.#node.nodeType === ELEMENT_NODE) {
          return !this.#shadow && node === this.#node;
        }
        return node === this.#document.documentElement;
      }
      /* Tree-structural pseudo-classes */
      case 'root': {
        return node === this.#document.documentElement;
      }
      case 'empty': {
        if (!node.hasChildNodes()) {
          return true;
        }
        const walker = this._createTreeWalker(node, {
          force: true,
          whatToShow: SHOW_ALL
        });
        let refNode = walker.firstChild();
        let bool;
        while (refNode) {
          bool =
            refNode.nodeType !== ELEMENT_NODE && refNode.nodeType !== TEXT_NODE;
          if (!bool) {
            break;
          }
          refNode = walker.nextSibling();
        }
        return bool;
      }
      case 'first-child':
      case 'last-child':
      case 'only-child': {
        if (!parentNode) {
          return node === this.#root;
        }
        if (astName === 'first-child') {
          return node === parentNode.firstElementChild;
        }
        if (astName === 'last-child') {
          return node === parentNode.lastElementChild;
        }
        return (
          node === parentNode.firstElementChild &&
          node === parentNode.lastElementChild
        );
      }
      /* User action pseudo-classes */
      case 'hover': {
        const { target, type } = this.#event ?? {};
        return (
          /^(?:click|mouse(?:down|over|up))$/.test(type) &&
          target?.nodeType === ELEMENT_NODE &&
          node.contains(target)
        );
      }
      case 'active': {
        const { buttons, target, type } = this.#event ?? {};
        return (
          type === 'mousedown' &&
          buttons & 1 &&
          target?.nodeType === ELEMENT_NODE &&
          node.contains(target)
        );
      }
      case 'focus': {
        const activeElement = this.#document.activeElement;
        if (activeElement.shadowRoot) {
          const activeShadowElement = activeElement.shadowRoot.activeElement;
          let current = activeShadowElement;
          while (current) {
            if (current.nodeType === DOCUMENT_FRAGMENT_NODE) {
              const { host } = current;
              if (host === activeElement) {
                if (isFocusableArea(node)) {
                  return true;
                }
                return host === node;
              }
            }
            current = current.parentNode;
          }
        }
        return node === activeElement && isFocusableArea(node);
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
                  altKey: eventAltKey,
                  ctrlKey: eventCtrlKey,
                  key: eventKey,
                  metaKey: eventMetaKey,
                  target: eventTarget,
                  type: eventType
                } = this.#event;
                // this.#event is irrelevant if eventTarget === relatedTarget
                if (eventTarget === relatedTarget) {
                  if (!this.#lastFocusVisible) {
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
                      if (!this.#lastFocusVisible) {
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
                    !eventAltKey &&
                    !eventCtrlKey &&
                    !eventMetaKey &&
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
            return bool;
          }
          if (this.#lastFocusVisible === node) {
            this.#lastFocusVisible = null;
          }
        }
        break;
      }
      case 'focus-within': {
        if (!this.#focusWithinCache) {
          this.#focusWithinCache = new Set();
          let currentFocus = this.#document.activeElement;
          if (currentFocus && isFocusableArea(currentFocus)) {
            while (currentFocus) {
              this.#focusWithinCache.add(currentFocus);
              if (currentFocus.parentNode) {
                currentFocus = currentFocus.parentNode;
              } else if (
                currentFocus.nodeType === DOCUMENT_FRAGMENT_NODE &&
                currentFocus.host
              ) {
                currentFocus = currentFocus.host;
              } else {
                break;
              }
            }
          } else if (currentFocus && currentFocus.shadowRoot) {
            let shadowFocus = currentFocus.shadowRoot.activeElement;
            if (shadowFocus) {
              while (shadowFocus) {
                this.#focusWithinCache.add(shadowFocus);
                if (shadowFocus.parentNode) {
                  shadowFocus = shadowFocus.parentNode;
                } else if (
                  shadowFocus.nodeType === DOCUMENT_FRAGMENT_NODE &&
                  shadowFocus.host
                ) {
                  shadowFocus = shadowFocus.host;
                } else {
                  break;
                }
              }
            }
          }
        }
        return this.#focusWithinCache.has(node);
      }
      // Ignore :host.
      case 'host': {
        break;
      }
      // Legacy pseudo-elements.
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
      // Not supported.
      case 'autofill':
      case 'blank':
      case 'buffering':
      case 'current':
      case 'fullscreen':
      case 'future':
      case 'has-slotted':
      case 'heading':
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
    return false;
  };

  /**
   * Evaluates the :host() pseudo-class.
   * @private
   * @param {Array.<object>} leaves - The AST leaves.
   * @param {object} host - The host element.
   * @param {object} ast - The original AST for error reporting.
   * @returns {boolean} True if matches, otherwise false.
   */
  _evaluateHostPseudo = (leaves, host, ast) => {
    const l = leaves.length;
    for (let i = 0; i < l; i++) {
      const leaf = leaves[i];
      if (leaf.type === COMBINATOR) {
        const css = generateCSS(ast);
        const msg = `Invalid selector ${css}`;
        this.onError(generateException(msg, SYNTAX_ERR, this.#window));
        return false;
      }
      if (!this._matchSelector(leaf, host)) {
        return false;
      }
    }
    return true;
  };

  /**
   * Evaluates the :host-context() pseudo-class.
   * @private
   * @param {Array.<object>} leaves - The AST leaves.
   * @param {object} host - The host element.
   * @param {object} ast - The original AST for error reporting.
   * @returns {boolean} True if matched.
   */
  _evaluateHostContextPseudo = (leaves, host, ast) => {
    let parent = host;
    while (parent) {
      let bool;
      const l = leaves.length;
      for (let i = 0; i < l; i++) {
        const leaf = leaves[i];
        if (leaf.type === COMBINATOR) {
          const css = generateCSS(ast);
          const msg = `Invalid selector ${css}`;
          this.onError(generateException(msg, SYNTAX_ERR, this.#window));
          return false;
        }
        bool = this._matchSelector(leaf, parent);
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
  };

  /**
   * Evaluates shadow host pseudo-classes.
   * @private
   * @param {object} ast - The AST.
   * @param {object} node - The DocumentFragment node.
   * @returns {boolean} True if matches, otherwise false.
   */
  _evaluateShadowHost = (ast, node) => {
    const { children: astChildren, name: astName } = ast;
    // Handle simple pseudo-class (no arguments).
    if (!Array.isArray(astChildren)) {
      if (astName === 'host') {
        return true;
      }
      const msg = `Invalid selector :${astName}`;
      this.onError(generateException(msg, SYNTAX_ERR, this.#window));
      return false;
    }
    // Handle functional pseudo-class like :host(...).
    if (astName !== 'host' && astName !== 'host-context') {
      const msg = `Invalid selector :${astName}()`;
      this.onError(generateException(msg, SYNTAX_ERR, this.#window));
      return false;
    }
    if (astChildren.length !== 1) {
      const css = generateCSS(ast);
      const msg = `Invalid selector ${css}`;
      this.onError(generateException(msg, SYNTAX_ERR, this.#window));
      return false;
    }
    const { host } = node;
    const { branches } = walkAST(astChildren[0]);
    const [branch] = branches;
    const [...leaves] = branch;
    if (astName === 'host' && this._evaluateHostPseudo(leaves, host, ast)) {
      return true;
    } else if (
      astName === 'host-context' &&
      this._evaluateHostContextPseudo(leaves, host, ast)
    ) {
      return true;
    }
    return false;
  };

  /**
   * Matches a selector for element nodes.
   * @private
   * @param {object} ast - The AST.
   * @param {object} node - The Element node.
   * @param {object} opt - Options.
   * @returns {boolean} True if matches, otherwise false.
   */
  _matchSelectorForElement = (ast, node, opt) => {
    const { type: astType } = ast;
    const astName = unescapeSelector(ast.name);
    switch (astType) {
      case ATTR_SELECTOR: {
        return matchAttributeSelector(ast, node, opt);
      }
      case ID_SELECTOR: {
        return node.id === astName;
      }
      case CLASS_SELECTOR: {
        return node.classList.contains(astName);
      }
      case PS_CLASS_SELECTOR: {
        return this._matchPseudoClassSelector(ast, node, opt);
      }
      case TYPE_SELECTOR: {
        return matchTypeSelector(ast, node, opt);
      }
      // PS_ELEMENT_SELECTOR is handled by default.
      default: {
        try {
          if (this.#check) {
            const css = generateCSS(ast);
            this.#pseudoElement.push(css);
            return true;
          } else {
            matchPseudoElementSelector(astName, astType, opt);
          }
        } catch (e) {
          this.onError(e);
        }
      }
    }
    return false;
  };

  /**
   * Matches a selector for a shadow root.
   * @private
   * @param {object} ast - The AST.
   * @param {object} node - The DocumentFragment node.
   * @param {object} [opt] - Options.
   * @returns {boolean} True if matches, otherwise false.
   */
  _matchSelectorForShadowRoot = (ast, node, opt = {}) => {
    const { name: astName } = ast;
    if (KEYS_LOGICAL.has(astName)) {
      opt.isShadowRoot = true;
      return this._matchPseudoClassSelector(ast, node, opt);
    }
    if (astName === 'host' || astName === 'host-context') {
      const matches = this._evaluateShadowHost(ast, node, opt);
      if (matches) {
        this.#verifyShadowHost = true;
        return true;
      }
    }
    return false;
  };

  /**
   * Matches a selector.
   * @private
   * @param {object} ast - The AST.
   * @param {object} node - The Document, DocumentFragment, or Element node.
   * @param {object} opt - Options.
   * @returns {boolean} True if matches, otherwise false.
   */
  _matchSelector = (ast, node, opt) => {
    if (node.nodeType === ELEMENT_NODE) {
      return this._matchSelectorForElement(ast, node, opt);
    }
    if (
      this.#shadow &&
      node.nodeType === DOCUMENT_FRAGMENT_NODE &&
      ast.type === PS_CLASS_SELECTOR
    ) {
      return this._matchSelectorForShadowRoot(ast, node, opt);
    }
    return false;
  };

  /**
   * Matches leaves.
   * @private
   * @param {Array.<object>} leaves - The AST leaves.
   * @param {object} node - The node.
   * @param {object} opt - Options.
   * @returns {boolean} The result.
   */
  _matchLeaves = (leaves, node, opt) => {
    let result = this.#results.get(leaves);
    if (result && result.has(node)) {
      const { matched } = result.get(node);
      return matched;
    }
    let cacheable = true;
    if (node.nodeType === ELEMENT_NODE && KEYS_FORM.has(node.localName)) {
      cacheable = false;
    }
    let bool;
    const l = leaves.length;
    for (let i = 0; i < l; i++) {
      const leaf = leaves[i];
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
        default: {
          // No action needed for other types.
        }
      }
      bool = this._matchSelector(leaf, node, opt);
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
      this.#results.set(leaves, result);
    }
    return bool;
  };

  /**
   * Returns a cached slice of the leaves array (excluding the first item).
   * @private
   * @param {Array.<object>} leaves - The original AST leaves array.
   * @returns {Array.<object>} The filtered leaves.
   */
  _getFilterLeaves = leaves => {
    if (!this.#filterLeavesCache) {
      this.#filterLeavesCache = new WeakMap();
    }
    if (this.#filterLeavesCache.has(leaves)) {
      return this.#filterLeavesCache.get(leaves);
    }
    const filterLeaves = leaves.slice(1);
    this.#filterLeavesCache.set(leaves, filterLeaves);
    return filterLeaves;
  };

  /**
   * Traverses all descendant nodes and collects matches.
   * @private
   * @param {object} baseNode - The base Element node or Element.shadowRoot.
   * @param {Array.<object>} leaves - The AST leaves.
   * @param {object} opt - Options.
   * @returns {Set.<object>} A collection of matched nodes.
   */
  _traverseAllDescendants = (baseNode, leaves, opt) => {
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
  };

  /**
   * Finds descendant nodes.
   * @private
   * @param {Array.<object>} leaves - The AST leaves.
   * @param {object} baseNode - The base Element node or Element.shadowRoot.
   * @param {object} opt - Options.
   * @returns {Set.<object>} A collection of matched nodes.
   */
  _findDescendantNodes = (leaves, baseNode, opt) => {
    const [leaf] = leaves;
    const filterLeaves = this._getFilterLeaves(leaves);
    const { type: leafType } = leaf;
    switch (leafType) {
      case ID_SELECTOR: {
        const canUseGetElementById =
          !this.#shadow &&
          baseNode.nodeType === ELEMENT_NODE &&
          this.#root.nodeType !== ELEMENT_NODE;
        if (canUseGetElementById) {
          const leafName = unescapeSelector(leaf.name);
          const nodes = new Set();
          const foundNode = this.#root.getElementById(leafName);
          if (
            foundNode &&
            foundNode !== baseNode &&
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
        // Fallback to default traversal if fast path is not applicable.
        return this._traverseAllDescendants(baseNode, leaves, opt);
      }
      case PS_ELEMENT_SELECTOR: {
        const leafName = unescapeSelector(leaf.name);
        matchPseudoElementSelector(leafName, leafType, opt);
        return new Set();
      }
      default: {
        return this._traverseAllDescendants(baseNode, leaves, opt);
      }
    }
  };

  /**
   * Collects combinator matches into an array.
   * @private
   * @param {object} twig - The twig object.
   * @param {object} node - The Element node.
   * @param {object} [opt] - Options.
   * @param {string} [opt.dir] - The find direction.
   * @param {Array.<object>} matched - The collector array.
   * @returns {Array.<object>} The collector array.
   */
  _collectCombinatorMatches = (twig, node, opt = {}, matched = []) => {
    const {
      combo: { name: comboName },
      leaves
    } = twig;
    const { dir } = opt;
    switch (comboName) {
      case '+': {
        const refNode =
          dir === DIR_NEXT
            ? node.nextElementSibling
            : node.previousElementSibling;
        if (refNode && this._matchLeaves(leaves, refNode, opt)) {
          matched.push(refNode);
        }
        break;
      }
      case '~': {
        let refNode =
          dir === DIR_NEXT
            ? node.nextElementSibling
            : node.previousElementSibling;
        while (refNode) {
          if (this._matchLeaves(leaves, refNode, opt)) {
            matched.push(refNode);
          }
          refNode =
            dir === DIR_NEXT
              ? refNode.nextElementSibling
              : refNode.previousElementSibling;
        }
        break;
      }
      case '>': {
        if (dir === DIR_NEXT) {
          let refNode = node.firstElementChild;
          while (refNode) {
            if (this._matchLeaves(leaves, refNode, opt)) {
              matched.push(refNode);
            }
            refNode = refNode.nextElementSibling;
          }
        } else {
          const { parentNode } = node;
          if (parentNode && this._matchLeaves(leaves, parentNode, opt)) {
            matched.push(parentNode);
          }
        }
        break;
      }
      case ' ':
      default: {
        if (dir === DIR_NEXT) {
          for (const refNode of this._findDescendantNodes(leaves, node, opt)) {
            matched.push(refNode);
          }
        } else {
          const ancestors = [];
          let refNode = node.parentNode;
          while (refNode) {
            if (this._matchLeaves(leaves, refNode, opt)) {
              ancestors.push(refNode);
            }
            refNode = refNode.parentNode;
          }
          if (ancestors.length) {
            matched.push(...ancestors.reverse());
          }
        }
      }
    }
    return matched;
  };
}
