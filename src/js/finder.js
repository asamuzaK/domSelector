/**
 * finder.js
 */

/* import */
import { EventTracker } from './event-tracker.js';
import {
  matchAttributeSelector,
  matchPseudoElementSelector,
  matchTypeSelector
} from './matcher.js';
import {
  generateCSS,
  parseSelector,
  sortAST,
  unescapeSelector,
  walkAST
} from './parser.js';
import { PseudoClassEvaluator } from './pseudo-evaluator.js';
import {
  generateException,
  isVisible,
  resolveContent,
  sortNodes,
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
  ID_SELECTOR,
  KEYS_LOGICAL,
  NOT_SUPPORTED_ERR,
  PS_CLASS_SELECTOR,
  PS_ELEMENT_SELECTOR,
  SHOW_CONTAINER,
  SYNTAX_ERR,
  TARGET_ALL,
  TARGET_FIRST,
  TARGET_LINEAL,
  TARGET_SELF,
  TYPE_SELECTOR
} from './constant.js';
const DIR_NEXT = 'next';
const DIR_PREV = 'prev';
const KEYS_FORM = new Set([...FORM_PARTS, 'fieldset', 'form']);
const KEYS_PS_UNCACHE = new Set([
  'any-link',
  'defined',
  'dir',
  'link',
  'scope'
]);

/**
 * Finder
 * NOTE: #ast[i] corresponds to #nodes[i]
 */
export class Finder {
  #ast;
  #astCache = new WeakMap();
  #check = false;
  #descendant = false;
  #document;
  #documentCache = new WeakMap();
  #documentURL = null;
  #filterLeavesCache = new WeakMap();
  #invalidate = false;
  #invalidateResults = new WeakMap();
  #node;
  #nodeWalker = null;
  #nodes = [];
  #noexcept = false;
  #pseudoElement = [];
  #pseudoEvaluator;
  #results = new WeakMap();
  #root;
  #rootWalker = null;
  #scoped = false;
  #selector;
  #selectorAST = null;
  #shadow = false;
  #tracker;
  #verifyShadowHost = null;
  #walkers = new WeakMap();
  #warn = false;
  #window;

  /**
   * constructor
   * @param {object} window - The window object.
   */
  constructor(window) {
    this.#window = window;
    this.#tracker = new EventTracker(window);
    this.#pseudoEvaluator = new PseudoClassEvaluator(this);
  }

  get window() {
    return this.#window;
  }

  get document() {
    return this.#document;
  }

  get root() {
    return this.#root;
  }

  get shadow() {
    return this.#shadow;
  }

  get tracker() {
    return this.#tracker;
  }

  get warn() {
    return this.#warn;
  }

  get astCache() {
    return this.#astCache;
  }

  get node() {
    return this.#node;
  }

  get verifyShadowHost() {
    return this.#verifyShadowHost;
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
  setup = (selector, node, { check, noexcept, warn } = {}) => {
    this.#check = !!check;
    this.#noexcept = !!noexcept;
    this.#warn = !!warn;
    [this.#document, this.#root, this.#shadow] = resolveContent(node);
    this.#documentURL = null;
    this.#node = node;
    this.#scoped =
      this.#node !== this.#root && this.#node.nodeType === ELEMENT_NODE;
    this.#selector = selector;
    this.#pseudoElement = [];
    this.#walkers = new WeakMap();
    this.#nodeWalker = null;
    this.#rootWalker = null;
    this.#verifyShadowHost = null;
    this.clearResults();
    return this;
  };

  /**
   * Clear cached results.
   * @param {boolean} all - clear all results
   * @returns {void}
   */
  clearResults = (all = false) => {
    this.#invalidateResults = new WeakMap();
    if (all) {
      this.#results = new WeakMap();
      this.#filterLeavesCache = new WeakMap();
    }
  };

  /**
   * Processes selector branches into the internal AST structure.
   * @private
   * @param {Array.<Array.<object>>} branches - The branches from walkAST.
   * @param {string} selector - The original selector for error reporting.
   * @returns {{ast: Array, descendant: boolean}}
   * An object with the AST, descendant flag.
   */
  _processSelectorBranches = (branches, selector) => {
    let descendant = false;
    const ast = [];
    for (const items of branches) {
      const branch = [];
      const itemsLength = items.length;
      if (itemsLength > 0 && items[0].type !== COMBINATOR) {
        const leaves = new Set();
        for (let i = 0; i < itemsLength; i++) {
          const item = items[i];
          if (item.type === COMBINATOR) {
            const nextItem = items[i + 1];
            if (!nextItem || nextItem.type === COMBINATOR) {
              const msg = `Invalid selector ${selector}`;
              this.onError(generateException(msg, SYNTAX_ERR, this.#window));
              return { ast: [], descendant: false, invalidate: false };
            }
            if (item.name === ' ' || item.name === '>') {
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
          if (i === itemsLength - 1) {
            branch.push({ combo: null, leaves: sortAST(leaves) });
            leaves.clear();
          }
        }
      }
      ast.push({ branch, dir: null, filtered: false, find: false });
    }
    return { ast, descendant };
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
      if (cachedItem && cachedItem.has(selector)) {
        const item = cachedItem.get(selector);
        ast = item.ast;
        this.#descendant = item.descendant;
        this.#invalidate = item.invalidate;
        this.#selectorAST = item.selectorAST;
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
      this.#selectorAST = parseSelector(selector);
      const { branches, info } = walkAST(this.#selectorAST, true);
      const {
        hasHasPseudoFunc,
        hasLogicalPseudoFunc,
        hasNthChildOfSelector,
        hasStatePseudoClass
      } = info;
      this.#invalidate =
        hasHasPseudoFunc ||
        hasStatePseudoClass ||
        !!(hasLogicalPseudoFunc && hasNthChildOfSelector);
      const processed = this._processSelectorBranches(branches, selector);
      ast = processed.ast;
      this.#descendant = processed.descendant;
      let cachedItem;
      if (this.#documentCache.has(this.#document)) {
        cachedItem = this.#documentCache.get(this.#document);
      } else {
        cachedItem = new Map();
      }
      cachedItem.set(`${selector}`, {
        ast,
        descendant: this.#descendant,
        invalidate: this.#invalidate,
        selectorAST: this.#selectorAST
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
  _createTreeWalker = (
    node,
    { force = false, whatToShow = SHOW_CONTAINER } = {}
  ) => {
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
   * @param {object|string} selector - The AST or selector string.
   * @returns {Array.<Array.<object>>} The selector branches.
   */
  _getSelectorBranches = selector => {
    const isObject = typeof selector === 'object' && selector !== null;
    if (isObject && this.#astCache.has(selector)) {
      return this.#astCache.get(selector);
    }
    const ast =
      typeof selector === 'string' ? parseSelector(selector) : selector;
    const { branches } = walkAST(ast);
    if (isObject) {
      this.#astCache.set(selector, branches);
    }
    return branches;
  };

  /**
   * Gets the children of a node, optionally filtered by a selector.
   * @private
   * @param {object} parentNode - The parent element.
   * @param {Array.<Array.<object>>} selectorBranches - The selector branches.
   * @param {object} opt - Options.
   * @returns {Array.<object>} An array of child nodes.
   */
  _getFilteredChildren = (parentNode, selectorBranches, opt) => {
    const children = [];
    let childNode = parentNode.firstElementChild;
    while (childNode) {
      if (selectorBranches) {
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
          if (this.#node === childNode) {
            children.push(childNode);
          } else if (isVisible(childNode)) {
            children.push(childNode);
          }
        }
      } else {
        children.push(childNode);
      }
      childNode = childNode.nextElementSibling;
    }
    return children;
  };

  /**
   * Matches pseudo-class selector by delegating to PseudoClassEvaluator.
   * @private
   * @see https://html.spec.whatwg.org/#pseudo-classes
   * @param {object} ast - The AST.
   * @param {object} node - The Element node.
   * @param {object} opt - Options.
   * @returns {Set.<object>} A collection of matched nodes.
   */
  _matchPseudoClassSelector = (ast, node, opt) =>
    this.#pseudoEvaluator.evaluate(ast, node, opt);

  /**
   * Evaluates the :host() pseudo-class.
   * @private
   * @param {Array.<object>} leaves - The AST leaves.
   * @param {object} host - The host element.
   * @param {object} ast - The original AST for error reporting.
   * @returns {boolean} True if matched.
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
      if (!this._matchSelector(leaf, host).has(host)) {
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
  };

  /**
   * Matches shadow host pseudo-classes.
   * @private
   * @param {object} ast - The AST.
   * @param {object} node - The DocumentFragment node.
   * @returns {?object} The matched node.
   */
  _matchShadowHostPseudoClass = (ast, node) => {
    const { children: astChildren, name: astName } = ast;
    // Handle simple pseudo-class (no arguments).
    if (!Array.isArray(astChildren)) {
      if (astName === 'host') {
        return node;
      }
      const msg = `Invalid selector :${astName}`;
      return this.onError(generateException(msg, SYNTAX_ERR, this.#window));
    }
    // Handle functional pseudo-class like :host(...).
    if (astName !== 'host' && astName !== 'host-context') {
      const msg = `Invalid selector :${astName}()`;
      return this.onError(generateException(msg, SYNTAX_ERR, this.#window));
    }
    if (astChildren.length !== 1) {
      const css = generateCSS(ast);
      const msg = `Invalid selector ${css}`;
      return this.onError(generateException(msg, SYNTAX_ERR, this.#window));
    }
    const { host } = node;
    const { branches } = walkAST(astChildren[0]);
    const [branch] = branches;
    let isMatch = false;
    if (astName === 'host') {
      isMatch = this._evaluateHostPseudo(branch, host, ast);
    } else {
      // astName === 'host-context'
      isMatch = this._evaluateHostContextPseudo(branch, host, ast);
    }
    return isMatch ? node : null;
  };

  /**
   * Matches a selector for element nodes.
   * @private
   * @param {object} ast - The AST.
   * @param {object} node - The Element node.
   * @param {object} opt - Options.
   * @returns {Set.<object>} A collection of matched nodes.
   */
  _matchSelectorForElement = (ast, node, opt) => {
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
      // PS_ELEMENT_SELECTOR is handled by default.
      default: {
        try {
          if (this.#check) {
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
  };

  /**
   * Matches a selector for a shadow root.
   * @private
   * @param {object} ast - The AST.
   * @param {object} node - The DocumentFragment node.
   * @param {object} [opt] - Options.
   * @returns {Set.<object>} A collection of matched nodes.
   */
  _matchSelectorForShadowRoot = (ast, node, opt = {}) => {
    const { name: astName } = ast;
    if (KEYS_LOGICAL.has(astName)) {
      opt.isShadowRoot = true;
      return this._matchPseudoClassSelector(ast, node, opt);
    }
    const matched = new Set();
    if (astName === 'host' || astName === 'host-context') {
      const res = this._matchShadowHostPseudoClass(ast, node, opt);
      if (res) {
        this.#verifyShadowHost = true;
        matched.add(res);
      }
    }
    return matched;
  };

  /**
   * Matches a selector.
   * @private
   * @param {object} ast - The AST.
   * @param {object} node - The Document, DocumentFragment, or Element node.
   * @param {object} opt - Options.
   * @returns {Set.<object>} A collection of matched nodes.
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
    return new Set();
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
    const results = this.#invalidate ? this.#invalidateResults : this.#results;
    let result = results.get(leaves);
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
  };

  /**
   * Returns a cached slice of the leaves array (excluding the first item).
   * @private
   * @param {Array.<object>} leaves - The original AST leaves array.
   * @returns {Array.<object>} The filtered leaves.
   */
  _getFilterLeaves = leaves => {
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
   * @returns {Array.<object>} The collector array.
   */
  _collectCombinatorMatches = (twig, node, opt = {}) => {
    const {
      combo: { name: comboName },
      leaves
    } = twig;
    const isNext = opt.dir === DIR_NEXT;
    switch (comboName) {
      case '+': {
        const refNode = isNext
          ? node.nextElementSibling
          : node.previousElementSibling;
        return refNode && this._matchLeaves(leaves, refNode, opt)
          ? [refNode]
          : [];
      }
      case '~': {
        const matched = [];
        let refNode = isNext
          ? node.nextElementSibling
          : node.previousElementSibling;
        while (refNode) {
          if (this._matchLeaves(leaves, refNode, opt)) {
            matched.push(refNode);
          }
          refNode = isNext
            ? refNode.nextElementSibling
            : refNode.previousElementSibling;
        }
        return matched;
      }
      case '>': {
        const matched = [];
        if (isNext) {
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
        return matched;
      }
      case ' ':
      default: {
        if (isNext) {
          return [...this._findDescendantNodes(leaves, node, opt)];
        } else {
          const ancestors = [];
          let refNode = node.parentNode;
          while (refNode) {
            if (this._matchLeaves(leaves, refNode, opt)) {
              ancestors.push(refNode);
            }
            refNode = refNode.parentNode;
          }
          return ancestors;
        }
      }
    }
  };

  /**
   * Matches a combinator.
   * @private
   * @param {object} twig - The twig object.
   * @param {object} node - The Element node.
   * @param {object} opt - Options.
   * @returns {Set.<object>} A collection of matched nodes.
   */
  _matchCombinator = (twig, node, opt) =>
    new Set(this._collectCombinatorMatches(twig, node, opt));

  /**
   * Traverses with a TreeWalker and collects nodes matching the leaves.
   * @private
   * @param {TreeWalker} walker - The TreeWalker instance to use.
   * @param {Array} leaves - The AST leaves to match against.
   * @param {object} [opt] - Traversal options.
   * @param {Node} [opt.boundaryNode] - The node to stop traversal at.
   * @param {boolean} [opt.force] - Force traversal to the next node.
   * @param {Node} [opt.startNode] - The node to start traversal from.
   * @param {string} [opt.targetType] - The type of target ('all' or 'first').
   * @returns {Array.<Node>} An array of matched nodes.
   */
  _traverseAndCollectNodes = (
    walker,
    leaves,
    { boundaryNode, force, startNode, targetType } = {}
  ) => {
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
    const matchOpt = {
      warn: this.#warn
    };
    while (currentNode) {
      // Stop when we reach the boundary.
      if (boundaryNode) {
        if (currentNode === boundaryNode) {
          break;
        } else if (
          targetType === TARGET_ALL &&
          !boundaryNode.contains(currentNode)
        ) {
          break;
        }
      }
      if (
        this._matchLeaves(leaves, currentNode, matchOpt) &&
        currentNode !== this.#node
      ) {
        collectedNodes.push(currentNode);
        // Stop after the first match if not collecting all.
        if (targetType !== TARGET_ALL) {
          break;
        }
      }
      currentNode = walker.nextNode();
    }
    return collectedNodes;
  };

  /**
   * Finds matched node(s) preceding this.#node.
   * @private
   * @param {Array.<object>} leaves - The AST leaves.
   * @param {object} node - The node to start from.
   * @param {object} [opt] - Options.
   * @param {boolean} [opt.force] - If true, traverses only to the next node.
   * @param {string} [opt.targetType] - The target type.
   * @returns {Array.<object>} A collection of matched nodes.
   */
  _findPrecede = (leaves, node, { force, targetType } = {}) => {
    if (!this.#rootWalker) {
      this.#rootWalker = this._createTreeWalker(this.#root);
    }
    return this._traverseAndCollectNodes(this.#rootWalker, leaves, {
      force,
      targetType,
      boundaryNode: this.#node,
      startNode: node
    });
  };

  /**
   * Finds matched node(s) in #nodeWalker.
   * @private
   * @param {Array.<object>} leaves - The AST leaves.
   * @param {object} node - The node to start from.
   * @param {object} [opt] - Options.
   * @param {boolean} [opt.precede] - If true, finds preceding nodes.
   * @returns {Array.<object>} A collection of matched nodes.
   */
  _findNodeWalker = (leaves, node, opt = {}) => {
    const { precede, ...traversalOpts } = opt;
    if (precede) {
      const precedeNodes = this._findPrecede(leaves, this.#root, opt);
      if (precedeNodes.length) {
        return precedeNodes;
      }
    }
    if (!this.#nodeWalker) {
      this.#nodeWalker = this._createTreeWalker(this.#node);
    }
    return this._traverseAndCollectNodes(this.#nodeWalker, leaves, {
      startNode: node,
      ...traversalOpts
    });
  };

  /**
   * Matches the node itself.
   * @private
   * @param {Array} leaves - The AST leaves.
   * @returns {Array} An array containing [nodes, filtered, pseudoElement].
   */
  _matchSelf = leaves => {
    const matched = this._matchLeaves(leaves, this.#node, {
      check: this.#check,
      warn: this.#warn
    });
    const nodes = matched ? [this.#node] : [];
    return [nodes, matched, this.#pseudoElement];
  };

  /**
   * Finds lineal nodes (self and ancestors).
   * @private
   * @param {Array} leaves - The AST leaves.
   * @param {object} [opt] - Options.
   * @param {boolean} [opt.complex] - If true, the selector is complex.
   * @returns {Array} An array containing [nodes, filtered].
   */
  _findLineal = (leaves, { complex } = {}) => {
    const nodes = [];
    const matchOpts = { warn: this.#warn };
    const selfMatched = this._matchLeaves(leaves, this.#node, matchOpts);
    if (selfMatched) {
      nodes.push(this.#node);
    }
    if (!selfMatched || complex) {
      let currentNode = this.#node.parentNode;
      while (currentNode) {
        if (this._matchLeaves(leaves, currentNode, matchOpts)) {
          nodes.push(currentNode);
        }
        currentNode = currentNode.parentNode;
      }
    }
    const filtered = nodes.length > 0;
    return [nodes, filtered];
  };

  /**
   * Finds entry nodes for pseudo-element selectors.
   * @private
   * @param {object} leaf - The pseudo-element leaf from the AST.
   * @param {Array.<object>} filterLeaves - Leaves for compound selectors.
   * @param {string} targetType - The type of target to find.
   * @returns {object} The result { nodes, filtered, pending }.
   */
  _findEntryNodesForPseudoElement = (leaf, filterLeaves, targetType) => {
    let nodes = [];
    let filtered = false;
    if (targetType === TARGET_SELF && this.#check) {
      const css = generateCSS(leaf);
      this.#pseudoElement.push(css);
      if (filterLeaves.length) {
        [nodes, filtered] = this._matchSelf(filterLeaves);
      } else {
        nodes.push(this.#node);
        filtered = true;
      }
    } else {
      matchPseudoElementSelector(leaf.name, leaf.type, { warn: this.#warn });
    }
    return { nodes, filtered, pending: false };
  };

  /**
   * Finds entry nodes for ID selectors.
   * @private
   * @param {object} twig - The current twig from the AST branch.
   * @param {string} targetType - The type of target to find.
   * @param {object} [opt] - Options.
   * @param {boolean} [opt.complex] - If true, the selector is complex.
   * @param {boolean} [opt.precede] - If true, finds preceding nodes.
   * @returns {object} The result { nodes, filtered, pending }.
   */
  _findEntryNodesForId = (twig, targetType, { complex, precede } = {}) => {
    const { leaves } = twig;
    const [leaf] = leaves;
    const filterLeaves = this._getFilterLeaves(leaves);
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
        if (filterLeaves.length) {
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
      filtered = nodes.length > 0;
    }
    return { nodes, filtered, pending: false };
  };

  /**
   * Finds entry nodes for class selectors.
   * @private
   * @param {Array.<object>} leaves - The AST leaves for the selector.
   * @param {string} targetType - The type of target to find.
   * @param {object} [opt] - Options.
   * @param {boolean} [opt.complex] - If true, the selector is complex.
   * @param {boolean} [opt.precede] - If true, finds preceding nodes.
   * @returns {object} The result { nodes, filtered, pending }.
   */
  _findEntryNodesForClass = (leaves, targetType, { complex, precede } = {}) => {
    let nodes = [];
    let filtered = false;
    if (targetType === TARGET_SELF) {
      [nodes, filtered] = this._matchSelf(leaves);
    } else if (targetType === TARGET_LINEAL) {
      [nodes, filtered] = this._findLineal(leaves, { complex });
    } else {
      nodes = this._findNodeWalker(leaves, this.#node, { precede, targetType });
      filtered = nodes.length > 0;
    }
    return { nodes, filtered, pending: false };
  };

  /**
   * Finds entry nodes for type selectors.
   * @private
   * @param {Array.<object>} leaves - The AST leaves for the selector.
   * @param {string} targetType - The type of target to find.
   * @param {object} [opt] - Options.
   * @param {boolean} [opt.complex] - If true, the selector is complex.
   * @param {boolean} [opt.precede] - If true, finds preceding nodes.
   * @returns {object} The result { nodes, filtered, pending }.
   */
  _findEntryNodesForType = (leaves, targetType, { complex, precede } = {}) => {
    let nodes = [];
    let filtered = false;
    if (targetType === TARGET_SELF) {
      [nodes, filtered] = this._matchSelf(leaves);
    } else if (targetType === TARGET_LINEAL) {
      [nodes, filtered] = this._findLineal(leaves, { complex });
    } else {
      nodes = this._findNodeWalker(leaves, this.#node, { precede, targetType });
      filtered = nodes.length > 0;
    }
    return { nodes, filtered, pending: false };
  };

  /**
   * Finds entry nodes for other selector types (default case).
   * @private
   * @param {object} twig - The current twig from the AST branch.
   * @param {string} targetType - The type of target to find.
   * @param {object} [opt] - Options.
   * @param {boolean} [opt.complex] - If true, the selector is complex.
   * @param {boolean} [opt.precede] - If true, finds preceding nodes.
   * @returns {object} The result { nodes, filtered, pending }.
   */
  _findEntryNodesForOther = (twig, targetType, { complex, precede } = {}) => {
    const { leaves } = twig;
    const [leaf] = leaves;
    const filterLeaves = this._getFilterLeaves(leaves);
    let nodes = [];
    let filtered = false;
    let pending = false;
    if (targetType !== TARGET_LINEAL && /host(?:-context)?/.test(leaf.name)) {
      let shadowRoot = null;
      if (this.#shadow && this.#node.nodeType === DOCUMENT_FRAGMENT_NODE) {
        shadowRoot = this._matchShadowHostPseudoClass(leaf, this.#node);
      } else if (filterLeaves.length && this.#node.nodeType === ELEMENT_NODE) {
        shadowRoot = this._matchShadowHostPseudoClass(
          leaf,
          this.#node.shadowRoot
        );
      }
      if (shadowRoot) {
        let bool = true;
        const l = filterLeaves.length;
        for (let i = 0; i < l; i++) {
          const filterLeaf = filterLeaves[i];
          switch (filterLeaf.name) {
            case 'host':
            case 'host-context': {
              const matchedNode = this._matchShadowHostPseudoClass(
                filterLeaf,
                shadowRoot
              );
              bool = matchedNode === shadowRoot;
              break;
            }
            case 'has': {
              bool = this._matchPseudoClassSelector(
                filterLeaf,
                shadowRoot,
                {}
              ).has(shadowRoot);
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
      filtered = nodes.length > 0;
    } else {
      pending = true;
    }
    return { nodes, filtered, pending };
  };

  /**
   * Finds entry nodes.
   * @private
   * @param {object} twig - The twig object.
   * @param {string} targetType - The target type.
   * @param {object} [opt] - Options.
   * @param {boolean} [opt.complex] - If true, the selector is complex.
   * @param {string} [opt.dir] - The find direction.
   * @returns {object} An object with nodes and their state.
   */
  _findEntryNodes = (
    twig,
    targetType,
    { complex = false, dir = DIR_PREV } = {}
  ) => {
    const { leaves } = twig;
    const [leaf] = leaves;
    const filterLeaves = this._getFilterLeaves(leaves);
    const precede =
      dir === DIR_NEXT &&
      this.#node.nodeType === ELEMENT_NODE &&
      this.#node !== this.#root;
    let result;
    switch (leaf.type) {
      case PS_ELEMENT_SELECTOR: {
        result = this._findEntryNodesForPseudoElement(
          leaf,
          filterLeaves,
          targetType
        );
        break;
      }
      case ID_SELECTOR: {
        result = this._findEntryNodesForId(twig, targetType, {
          complex,
          precede
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
  };

  /**
   * Determines the direction and starting twig for a selector branch.
   * @private
   * @param {Array.<object>} branch - The AST branch.
   * @param {string} targetType - The type of target to find.
   * @returns {object} An object with the direction and starting twig.
   */
  _determineTraversalStrategy = (branch, targetType) => {
    const branchLen = branch.length;
    const firstTwig = branch[0];
    const lastTwig = branch[branchLen - 1];
    if (branchLen === 1) {
      return { dir: DIR_PREV, twig: firstTwig };
    }
    // Complex selector (branchLen > 1).
    const {
      leaves: [{ name: firstName, type: firstType }]
    } = firstTwig;
    const {
      leaves: [{ name: lastName, type: lastType }]
    } = lastTwig;
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
    } else if (branchLen > 2 && this.#scoped && targetType === TARGET_FIRST) {
      if (lastType === TYPE_SELECTOR) {
        return { dir: DIR_PREV, twig: lastTwig };
      }
      let isChildOrDescendant = false;
      for (const { combo } of branch) {
        if (combo) {
          const { name: comboName } = combo;
          isChildOrDescendant = comboName === '>' || comboName === ' ';
          if (!isChildOrDescendant) {
            break;
          }
        }
      }
      if (isChildOrDescendant) {
        return { dir: DIR_PREV, twig: lastTwig };
      }
    }
    // Default strategy for complex selectors.
    return { dir: DIR_NEXT, twig: firstTwig };
  };

  /**
   * Processes pending items not resolved with a direct strategy.
   * @private
   * @param {Set.<Map>} pendingItems - The set of pending items.
   */
  _processPendingItems = pendingItems => {
    if (!pendingItems.size) {
      return;
    }
    if (!this.#rootWalker) {
      this.#rootWalker = this._createTreeWalker(this.#root);
    }
    const walker = this.#rootWalker;
    let node = this.#root;
    if (this.#scoped) {
      node = this.#node;
    }
    let nextNode = traverseNode(node, walker);
    while (nextNode) {
      const isWithinScope =
        this.#node.nodeType !== ELEMENT_NODE ||
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
      } else if (this.#scoped) {
        break;
      }
      nextNode = walker.nextNode();
    }
  };

  /**
   * Collects nodes.
   * @private
   * @param {string} targetType - The target type.
   * @returns {Array.<Array.<object>>} An array containing the AST and nodes.
   */
  _collectNodes = targetType => {
    [this.#ast, this.#nodes] = this._correspond(this.#selector);
    const ast = this.#ast.values();
    if (targetType === TARGET_ALL || targetType === TARGET_FIRST) {
      const pendingItems = new Set();
      let i = 0;
      for (const { branch } of ast) {
        const complex = branch.length > 1;
        const { dir, twig } = this._determineTraversalStrategy(
          branch,
          targetType
        );
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
      this._processPendingItems(pendingItems);
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
  };

  /**
   * Gets combined nodes.
   * @private
   * @param {object} twig - The twig object.
   * @param {object} nodes - A collection of nodes (Array or Set).
   * @param {string} dir - The direction.
   * @returns {Array.<object>} A collection of matched nodes.
   */
  _getCombinedNodes = (twig, nodes, dir) => {
    const result = [];
    const opt = { dir, warn: this.#warn };
    for (const node of nodes) {
      const items = this._collectCombinatorMatches(twig, node, opt);
      for (const item of items) {
        result.push(item);
      }
    }
    return result;
  };

  /**
   * Matches a node in the 'next' direction.
   * @private
   * @param {Array} branch - The branch.
   * @param {Set.<object>} nodes - A collection of Element nodes.
   * @param {object} [opt] - Options.
   * @param {object} [opt.combo] - The combo object.
   * @param {number} [opt.index] - The index.
   * @returns {?object} The matched node.
   */
  _matchNodeNext = (branch, nodes, { combo, index } = {}) => {
    const { combo: nextCombo, leaves } = branch[index];
    const twig = {
      combo,
      leaves
    };
    const nextNodes = this._getCombinedNodes(twig, nodes, DIR_NEXT);
    if (nextNodes.length) {
      if (index === branch.length - 1) {
        if (nextNodes.length === 1) {
          return nextNodes[0];
        }
        const [nextNode] = sortNodes(nextNodes);
        return nextNode;
      }
      return this._matchNodeNext(branch, nextNodes, {
        combo: nextCombo,
        index: index + 1
      });
    }
    return null;
  };

  /**
   * Matches a node in the 'previous' direction.
   * @private
   * @param {Array} branch - The branch.
   * @param {object} node - The Element node.
   * @param {object} [opt] - Options.
   * @param {number} [opt.index] - The index.
   * @returns {?object} The node.
   */
  _matchNodePrev = (branch, node, { index } = {}) => {
    const twig = branch[index];
    const nextNodes = this._getCombinedNodes(twig, [node], DIR_PREV);
    if (nextNodes.length) {
      if (index === 0) {
        return node;
      }
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
    return null;
  };

  /**
   * Processes a complex selector branch to find all matching nodes.
   * @private
   * @param {Array} branch - The selector branch from the AST.
   * @param {Array} entryNodes - The initial set of nodes to start from.
   * @param {string} dir - The direction of traversal ('next' or 'prev').
   * @returns {Set.<object>} A set of all matched nodes.
   */
  _processComplexBranchAll = (branch, entryNodes, dir) => {
    const matchedNodes = new Set();
    const branchLen = branch.length;
    const lastIndex = branchLen - 1;
    if (dir === DIR_NEXT) {
      const { combo: firstCombo } = branch[0];
      for (const node of entryNodes) {
        let combo = firstCombo;
        let nextNodes = [node];
        for (let j = 1; j < branchLen; j++) {
          const { combo: nextCombo, leaves } = branch[j];
          const twig = { combo, leaves };
          nextNodes = this._getCombinedNodes(twig, nextNodes, dir);
          if (!nextNodes.length) {
            break;
          }
          if (j === lastIndex) {
            for (const nextNode of nextNodes) {
              matchedNodes.add(nextNode);
            }
          }
          combo = nextCombo;
        }
      }
    } else {
      // DIR_PREV
      for (const node of entryNodes) {
        let nextNodes = [node];
        for (let j = lastIndex - 1; j >= 0; j--) {
          const twig = branch[j];
          nextNodes = this._getCombinedNodes(twig, nextNodes, dir);
          if (!nextNodes.length) {
            break;
          }
          // The entry node is the final match
          if (j === 0) {
            matchedNodes.add(node);
          }
        }
      }
    }
    return matchedNodes;
  };

  /**
   * Processes a complex selector branch to find the first matching node.
   * @private
   * @param {Array} branch - The selector branch from the AST.
   * @param {Array} entryNodes - The initial set of nodes to start from.
   * @param {string} dir - The direction of traversal ('next' or 'prev').
   * @param {string} targetType - The type of search (e.g., 'first').
   * @returns {?object} The first matched node, or null.
   */
  _processComplexBranchFirst = (branch, entryNodes, dir, targetType) => {
    const branchLen = branch.length;
    const lastIndex = branchLen - 1;
    // DIR_NEXT logic for finding the first match.
    if (dir === DIR_NEXT) {
      const { combo: entryCombo } = branch[0];
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
              return matchedNode;
            }
          } else {
            return matchedNode;
          }
        }
      }
      // Fallback logic if no direct match found.
      const { leaves: entryLeaves } = branch[0];
      const [entryNode] = entryNodes;
      if (this.#node.contains(entryNode)) {
        let [refNode] = this._findNodeWalker(entryLeaves, entryNode, {
          targetType
        });
        while (refNode) {
          const matchedNode = this._matchNodeNext(branch, new Set([refNode]), {
            combo: entryCombo,
            index: 1
          });
          if (matchedNode) {
            if (this.#node.nodeType === ELEMENT_NODE) {
              if (
                matchedNode !== this.#node &&
                this.#node.contains(matchedNode)
              ) {
                return matchedNode;
              }
            } else {
              return matchedNode;
            }
          }
          [refNode] = this._findNodeWalker(entryLeaves, refNode, {
            targetType,
            force: true
          });
        }
      }
    } else {
      // DIR_PREV logic for finding the first match.
      for (const node of entryNodes) {
        const matchedNode = this._matchNodePrev(branch, node, {
          index: lastIndex - 1
        });
        if (matchedNode) {
          return matchedNode;
        }
      }
      // Fallback for TARGET_FIRST.
      if (targetType === TARGET_FIRST) {
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
            return refNode;
          }
          [refNode] = this._findNodeWalker(entryLeaves, refNode, {
            targetType,
            force: true
          });
        }
      }
    }
    return null;
  };

  /**
   * Finds matched nodes.
   * @param {string} targetType - The target type.
   * @returns {Set.<object>} A collection of matched nodes.
   */
  find = targetType => {
    let collection;
    try {
      collection = this._collectNodes(targetType);
    } catch (e) {
      if (this.#check) {
        let pseudoElement;
        if (this.#pseudoElement.length) {
          pseudoElement = this.#pseudoElement.join('');
        } else {
          pseudoElement = null;
        }
        return {
          pseudoElement,
          match: false,
          ast: this.#selectorAST ?? null
        };
      } else {
        throw e;
      }
    }
    const [[...branches], collectedNodes] = collection;
    const l = branches.length;
    let sort =
      l > 1 && targetType === TARGET_ALL && this.#selector.includes(':scope');
    let nodes = new Set();
    for (let i = 0; i < l; i++) {
      const { branch, dir, find } = branches[i];
      if (!branch.length || !find) {
        continue;
      }
      const entryNodes = collectedNodes[i];
      const lastIndex = branch.length - 1;
      // Handle simple selectors (no combinators).
      if (lastIndex === 0) {
        if (
          (targetType === TARGET_ALL || targetType === TARGET_FIRST) &&
          this.#node.nodeType === ELEMENT_NODE
        ) {
          for (const node of entryNodes) {
            if (node !== this.#node && this.#node.contains(node)) {
              nodes.add(node);
              if (targetType === TARGET_FIRST) {
                break;
              }
            }
          }
        } else if (targetType === TARGET_ALL) {
          if (nodes.size) {
            for (const node of entryNodes) {
              nodes.add(node);
            }
            sort = true;
          } else {
            nodes = new Set(entryNodes);
          }
        } else {
          if (entryNodes.length) {
            nodes.add(entryNodes[0]);
          }
        }
      } else {
        // Handle complex selectors.
        if (targetType === TARGET_ALL) {
          const newNodes = this._processComplexBranchAll(
            branch,
            entryNodes,
            dir
          );
          if (nodes.size) {
            for (const newNode of newNodes) {
              nodes.add(newNode);
            }
            sort = true;
          } else {
            nodes = newNodes;
          }
        } else {
          const matchedNode = this._processComplexBranchFirst(
            branch,
            entryNodes,
            dir,
            targetType
          );
          if (matchedNode) {
            nodes.add(matchedNode);
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
        pseudoElement,
        ast: this.#selectorAST
      };
    }
    if (targetType === TARGET_FIRST || targetType === TARGET_ALL) {
      nodes.delete(this.#node);
    }
    if ((sort || targetType === TARGET_FIRST) && nodes.size > 1) {
      return new Set(sortNodes(nodes));
    }
    return nodes;
  };

  /**
   * Gets AST for selector.
   * @param {string} selector - The selector text.
   * @returns {object} The AST for the selector.
   */
  getAST = selector => {
    return parseSelector(selector);
  };

  /**
   * Get document URL.
   * @returns {string} document.URL
   */
  getDocumentURL() {
    if (!this.#documentURL) {
      this.#documentURL = new URL(this.#document.URL);
    }
    return this.#documentURL;
  }
}
