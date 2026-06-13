/*!
 * DOM Selector - A CSS selector engine.
 * @license MIT
 * @copyright asamuzaK (Kazz)
 * @see {@link https://github.com/asamuzaK/domSelector/blob/main/LICENSE}
 */

/* import */
import { GenerationalCache } from '@asamuzakjp/generational-cache';
import { Finder } from './js/finder.js';
import { Nwsapi } from './js/nwsapi.js';
import { extractSubjectsAst } from './js/parser.js';
import {
  extractSubjectsRegExp,
  filterSelector,
  isSupportedAST
} from './js/selector.js';
import { collectAllDescendants, getType } from './js/utility.js';

/* constants */
import {
  ATTR_TYPE,
  COMBO,
  DOCUMENT_NODE,
  ELEMENT_NODE,
  TAG_TYPE_WO_UNIVERSAL,
  TARGET_ALL,
  TARGET_FIRST,
  TARGET_LINEAL,
  TARGET_SELF
} from './js/constant.js';
const CACHE_SIZE = 2048;

/* regexp */
const REG_SELECTOR = /[[\]():\\"'`]/;
const REG_TEST_LIB = new RegExp(
  `^(?:${TAG_TYPE_WO_UNIVERSAL}|[*]?${ATTR_TYPE}(?:\\s*,\\s*${TAG_TYPE_WO_UNIVERSAL}${COMBO}${TAG_TYPE_WO_UNIVERSAL})?)$`
);
const REG_UNIVERSAL = /^(?:\*\|)?\*$/;

/**
 * @typedef {object} CheckResult
 * @property {boolean} match - The match result.
 * @property {string?} pseudoElement - The pseudo-element, if any.
 * @property {object?} ast - The AST object.
 */

/* DOMSelector */
export class DOMSelector {
  /* private fields */
  #window;
  #document;
  #finder;
  #idlUtils;
  #nwsapi;
  #cache;

  /**
   * Creates an instance of DOMSelector.
   * @param {Window} window - The window object.
   * @param {Document} document - The document object.
   * @param {object} [opt] - Options.
   */
  constructor(window, document, opt = {}) {
    const { cacheSize, idlUtils } = opt;
    this.#window = window;
    this.#document = document ?? window.document;
    this.#idlUtils = idlUtils;
    this.#cache = new GenerationalCache(cacheSize ?? CACHE_SIZE);
    this.#finder = new Finder(this.#window);
    this.#nwsapi = new Nwsapi(this.#window, this.#document);
  }

  /**
   * Validates a node and returns an Error if invalid.
   * @private
   * @param {Document|DocumentFragment|Element} node - The node to check.
   * @param {boolean} [element] - `true` if the node must be an Element.
   * @returns {TypeError|null} Returns a TypeError if invalid, otherwise null.
   */
  #validateNodeType = (node, element = false) => {
    if (!node?.nodeType) {
      return new this.#window.TypeError(`Unexpected type ${getType(node)}`);
    }
    if (element && node.nodeType !== ELEMENT_NODE) {
      return new this.#window.TypeError(`Unexpected node ${node.nodeName}`);
    }
    return null;
  };

  /**
   * Determines whether Nwsapi can be used for the given document.
   * @private
   * @param {Document} doc - The document object to check.
   * @returns {boolean} `true` if Nwsapi can be used, otherwise `false`.
   */
  #canUseNwsapi = doc =>
    doc === this.#document &&
    doc.contentType === 'text/html' &&
    doc.documentElement;

  /**
   * Clears the internal caches.
   * @param {boolean} [clearAll] - Whether to clear all caches. If false,
   * only cached matching results are cleared.
   * @returns {void}
   */
  clear = (clearAll = false) => {
    if (clearAll) {
      this.#cache.clear();
    }
    this.#finder.clearResults(true);
  };

  /**
   * Parses a selector and extracts the rightmost subject keys (Id, Class, Tag).
   * @param {string} selector - The CSS selector to parse.
   * @param {boolean} caseSensitive - True if tag key should be case sensitive.
   * @returns {Array<{id: string|null, className: string|null, tag: string|null}>} The list of extracted keys for each selector group.
   */
  extractSubjects = (selector, caseSensitive = false) => {
    if (!selector || typeof selector !== 'string') {
      return [{ id: null, className: null, tag: null }];
    }
    const cacheKey = `extract_${selector}_${caseSensitive}`;
    let subjects = this.#cache.get(cacheKey);
    if (subjects !== undefined) {
      return subjects;
    }
    subjects = [];
    if (!REG_SELECTOR.test(selector)) {
      subjects = extractSubjectsRegExp(selector, caseSensitive);
    } else {
      try {
        const ast = this.#finder.getAST(selector);
        subjects = extractSubjectsAst(ast);
      } catch {
        // fall through
      }
    }
    if (!subjects.length) {
      subjects.push({ id: null, className: null, tag: null });
    }
    this.#cache.set(cacheKey, subjects);
    return subjects;
  };

  /**
   * Checks if the given CSS selector is supported by this engine.
   * @param {string} selector - The CSS selector to check.
   * @returns {boolean} `true` if the selector is supported, `false` otherwise.
   */
  supports = selector => {
    if (typeof selector !== 'string') {
      return false;
    }
    const cacheKey = `supports_${selector}`;
    let isSupported = this.#cache.get(cacheKey);
    if (isSupported !== undefined) {
      return isSupported;
    }
    if (filterSelector(selector, TARGET_SELF)) {
      isSupported = true;
    } else {
      try {
        const ast = this.#finder.getAST(selector);
        isSupported = isSupportedAST(ast);
      } catch {
        isSupported = false;
      }
    }
    this.#cache.set(cacheKey, isSupported);
    return isSupported;
  };

  /**
   * Checks if an element matches a CSS selector.
   * @param {string} selector - The CSS selector to check against.
   * @param {Element} node - The element node to check.
   * @param {object} [opt] - Optional parameters.
   * @returns {CheckResult} An object containing the check result.
   */
  check = (selector, node, opt = {}) => {
    const error = this.#validateNodeType(node, true);
    if (error) {
      return this.#finder.onError(error, opt);
    }
    if (REG_UNIVERSAL.test(selector)) {
      const ast = this.#finder.getAST(selector);
      return {
        ast,
        match: true,
        pseudoElement: null
      };
    }
    const document = node.ownerDocument;
    if (node.parentNode && this.#canUseNwsapi(document)) {
      const cacheKey = `check_${selector}`;
      let filterMatches = this.#cache.get(cacheKey);
      if (filterMatches === undefined) {
        filterMatches = filterSelector(selector, TARGET_SELF);
        this.#cache.set(cacheKey, filterMatches);
      }
      if (filterMatches) {
        try {
          const n = this.#idlUtils ? this.#idlUtils.wrapperForImpl(node) : node;
          const match = this.#nwsapi.match(selector, n);
          let ast = null;
          if (match) {
            const astCacheKey = `check_ast_${selector}`;
            ast = this.#cache.get(astCacheKey);
            if (ast === undefined) {
              ast = this.#finder.getAST(selector);
              this.#cache.set(astCacheKey, ast);
            }
          }
          return {
            match,
            ast,
            pseudoElement: null
          };
        } catch (e) {
          // fall through
        }
      }
    }
    if (this.#idlUtils) {
      node = this.#idlUtils.wrapperForImpl(node);
    }
    const options = {
      ...opt,
      check: true,
      noexcept: true,
      warn: false
    };
    return this.#finder.setup(selector, node, options).find(TARGET_SELF);
  };

  /**
   * Returns true if the element matches the selector.
   * @param {string} selector - The CSS selector to match against.
   * @param {Element} node - The element node to test.
   * @param {object} [opt] - Optional parameters.
   * @returns {boolean} `true` if the element matches, or `false` otherwise.
   */
  matches = (selector, node, opt = {}) => {
    const error = this.#validateNodeType(node, true);
    if (error) {
      return this.#finder.onError(error, opt);
    }
    if (REG_UNIVERSAL.test(selector)) {
      return true;
    }
    const document = node.ownerDocument;
    if (node.parentNode && this.#canUseNwsapi(document)) {
      const cacheKey = `matches_${selector}`;
      let filterMatches = this.#cache.get(cacheKey);
      if (filterMatches === undefined) {
        filterMatches = filterSelector(selector, TARGET_SELF);
        this.#cache.set(cacheKey, filterMatches);
      }
      if (filterMatches) {
        try {
          const n = this.#idlUtils ? this.#idlUtils.wrapperForImpl(node) : node;
          return this.#nwsapi.match(selector, n);
        } catch (e) {
          // fall through
        }
      }
    }
    try {
      if (this.#idlUtils) {
        node = this.#idlUtils.wrapperForImpl(node);
      }
      const nodes = this.#finder.setup(selector, node, opt).find(TARGET_SELF);
      return nodes.size > 0;
    } catch (e) {
      this.#finder.onError(e, opt);
    }
    return false;
  };

  /**
   * Traverses up the DOM tree to find the first node that matches the selector.
   * @param {string} selector - The CSS selector to match against.
   * @param {Element} node - The element from which to start traversing.
   * @param {object} [opt] - Optional parameters.
   * @returns {?Element} The first matching ancestor element, or `null`.
   */
  closest = (selector, node, opt = {}) => {
    const error = this.#validateNodeType(node, true);
    if (error) {
      return this.#finder.onError(error, opt);
    }
    if (REG_UNIVERSAL.test(selector)) {
      return node;
    }
    const document = node.ownerDocument;
    if (node.parentNode && this.#canUseNwsapi(document)) {
      const cacheKey = `closest_${selector}`;
      let filterMatches = this.#cache.get(cacheKey);
      if (filterMatches === undefined) {
        filterMatches = filterSelector(selector, TARGET_LINEAL);
        this.#cache.set(cacheKey, filterMatches);
      }
      if (filterMatches) {
        try {
          const n = this.#idlUtils ? this.#idlUtils.wrapperForImpl(node) : node;
          return this.#nwsapi.closest(selector, n);
        } catch (e) {
          // fall through
        }
      }
    }
    let res;
    try {
      if (this.#idlUtils) {
        node = this.#idlUtils.wrapperForImpl(node);
      }
      const nodes = this.#finder.setup(selector, node, opt).find(TARGET_LINEAL);
      if (nodes.size) {
        let refNode = node;
        while (refNode) {
          if (nodes.has(refNode)) {
            res = refNode;
            break;
          }
          refNode = refNode.parentNode;
        }
      }
    } catch (e) {
      this.#finder.onError(e, opt);
    }
    return res ?? null;
  };

  /**
   * Returns the first element within the subtree that matches the selector.
   * @param {string} selector - The CSS selector to match.
   * @param {Document|DocumentFragment|Element} node - The node to find within.
   * @param {object} [opt] - Optional parameters.
   * @returns {?Element} The first matching element, or `null`.
   */
  querySelector = (selector, node, opt = {}) => {
    const error = this.#validateNodeType(node);
    if (error) {
      return this.#finder.onError(error, opt);
    }
    if (REG_UNIVERSAL.test(selector)) {
      return node.firstElementChild;
    }
    const document =
      node.nodeType === DOCUMENT_NODE ? node : node.ownerDocument;
    if (
      (node === this.#document || REG_TEST_LIB.test(selector)) &&
      this.#canUseNwsapi(document)
    ) {
      const cacheKey = `querySelector_${selector}`;
      let filterMatches = this.#cache.get(cacheKey);
      if (filterMatches === undefined) {
        filterMatches = filterSelector(selector, TARGET_FIRST);
        this.#cache.set(cacheKey, filterMatches);
      }
      if (filterMatches) {
        try {
          const n = this.#idlUtils ? this.#idlUtils.wrapperForImpl(node) : node;
          return this.#nwsapi.first(selector, n);
        } catch (e) {
          // fall through
        }
      }
    }
    let res;
    try {
      if (this.#idlUtils) {
        node = this.#idlUtils.wrapperForImpl(node);
      }
      const nodes = this.#finder.setup(selector, node, opt).find(TARGET_FIRST);
      if (nodes.size) {
        res = nodes.values().next().value;
      }
    } catch (e) {
      this.#finder.onError(e, opt);
    }
    return res ?? null;
  };

  /**
   * Returns an array of elements within the subtree that match the selector.
   * Note: This method returns an Array, not a NodeList.
   * @param {string} selector - The CSS selector to match.
   * @param {Document|DocumentFragment|Element} node - The node to find within.
   * @param {object} [opt] - Optional parameters.
   * @returns {Array<Element>} An array of elements, or an empty array.
   */
  querySelectorAll = (selector, node, opt = {}) => {
    const error = this.#validateNodeType(node);
    if (error) {
      return this.#finder.onError(error, opt);
    }
    const document =
      node.nodeType === DOCUMENT_NODE ? node : node.ownerDocument;
    if (document && REG_UNIVERSAL.test(selector)) {
      return collectAllDescendants(node, document);
    }
    if (
      (node === this.#document || REG_TEST_LIB.test(selector)) &&
      this.#canUseNwsapi(document)
    ) {
      const cacheKey = `querySelectorAll_${selector}`;
      let filterMatches = this.#cache.get(cacheKey);
      if (filterMatches === undefined) {
        filterMatches = filterSelector(selector, TARGET_ALL);
        this.#cache.set(cacheKey, filterMatches);
      }
      if (filterMatches) {
        try {
          const n = this.#idlUtils ? this.#idlUtils.wrapperForImpl(node) : node;
          return this.#nwsapi.select(selector, n);
        } catch (e) {
          // fall through
        }
      }
    }
    let res;
    try {
      if (this.#idlUtils) {
        node = this.#idlUtils.wrapperForImpl(node);
      }
      const nodes = this.#finder.setup(selector, node, opt).find(TARGET_ALL);
      if (nodes.size) {
        res = [...nodes];
      }
    } catch (e) {
      this.#finder.onError(e, opt);
    }
    return res ?? [];
  };
}
