/*!
 * DOM Selector - A CSS selector engine.
 * @license MIT
 * @copyright asamuzaK (Kazz)
 * @see {@link https://github.com/asamuzaK/domSelector/blob/main/LICENSE}
 */

/* import */
import { LRUCache } from 'lru-cache';
import { Finder } from './js/finder.js';
import { filterSelector, getType, initNwsapi } from './js/utility.js';

/* constants */
import {
  DOCUMENT_NODE,
  ELEMENT_NODE,
  TARGET_ALL,
  TARGET_FIRST,
  TARGET_LINEAL,
  TARGET_SELF
} from './js/constant.js';
const MAX_CACHE = 1024;

/**
 * @typedef {object} CheckResult
 * @property {boolean} match - The match result.
 * @property {string?} pseudoElement - The pseudo-element, if any.
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
    const { idlUtils } = opt;
    this.#window = window;
    this.#document = document ?? window.document;
    this.#finder = new Finder(window);
    this.#idlUtils = idlUtils;
    this.#nwsapi = initNwsapi(window, document);
    this.#cache = new LRUCache({
      max: MAX_CACHE
    });
  }

  /**
   * Clears the internal cache of finder results.
   * @returns {void}
   */
  clear = () => {
    this.#finder.clearResults(true);
  };

  /**
   * Checks if an element matches a CSS selector.
   * @param {string} selector - The CSS selector to check against.
   * @param {Element} node - The element node to check.
   * @param {object} [opt] - Optional parameters.
   * @returns {CheckResult} An object containing the check result.
   */
  check = (selector, node, opt = {}) => {
    if (!node?.nodeType) {
      const e = new this.#window.TypeError(`Unexpected type ${getType(node)}`);
      return this.#finder.onError(e, opt);
    } else if (node.nodeType !== ELEMENT_NODE) {
      const e = new this.#window.TypeError(`Unexpected node ${node.nodeName}`);
      return this.#finder.onError(e, opt);
    }
    const document = node.ownerDocument;
    if (
      document === this.#document &&
      document.contentType === 'text/html' &&
      document.documentElement &&
      node.parentNode
    ) {
      const cacheKey = `check_${selector}`;
      let filterMatches = false;
      if (this.#cache.has(cacheKey)) {
        filterMatches = this.#cache.get(cacheKey);
      } else {
        filterMatches = filterSelector(selector, TARGET_SELF);
        this.#cache.set(cacheKey, filterMatches);
      }
      if (filterMatches) {
        try {
          const n = this.#idlUtils ? this.#idlUtils.wrapperForImpl(node) : node;
          const match = this.#nwsapi.match(selector, n);
          return {
            match,
            pseudoElement: null
          };
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
      opt.check = true;
      opt.noexept = true;
      opt.warn = false;
      this.#finder.setup(selector, node, opt);
      res = this.#finder.find(TARGET_SELF);
    } catch (e) {
      this.#finder.onError(e, opt);
    }
    return res;
  };

  /**
   * Returns true if the element matches the selector.
   * @param {string} selector - The CSS selector to match against.
   * @param {Element} node - The element node to test.
   * @param {object} [opt] - Optional parameters.
   * @returns {boolean} `true` if the element matches, or `false` otherwise.
   */
  matches = (selector, node, opt = {}) => {
    if (!node?.nodeType) {
      const e = new this.#window.TypeError(`Unexpected type ${getType(node)}`);
      return this.#finder.onError(e, opt);
    } else if (node.nodeType !== ELEMENT_NODE) {
      const e = new this.#window.TypeError(`Unexpected node ${node.nodeName}`);
      return this.#finder.onError(e, opt);
    }
    const document = node.ownerDocument;
    if (
      document === this.#document &&
      document.contentType === 'text/html' &&
      document.documentElement &&
      node.parentNode
    ) {
      const cacheKey = `matches_${selector}`;
      let filterMatches = false;
      if (this.#cache.has(cacheKey)) {
        filterMatches = this.#cache.get(cacheKey);
      } else {
        filterMatches = filterSelector(selector, TARGET_SELF);
        this.#cache.set(cacheKey, filterMatches);
      }
      if (filterMatches) {
        try {
          const n = this.#idlUtils ? this.#idlUtils.wrapperForImpl(node) : node;
          const res = this.#nwsapi.match(selector, n);
          return res;
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
      this.#finder.setup(selector, node, opt);
      const nodes = this.#finder.find(TARGET_SELF);
      res = nodes.size;
    } catch (e) {
      this.#finder.onError(e, opt);
    }
    return !!res;
  };

  /**
   * Traverses up the DOM tree to find the first node that matches the selector.
   * @param {string} selector - The CSS selector to match against.
   * @param {Element} node - The element from which to start traversing.
   * @param {object} [opt] - Optional parameters.
   * @returns {?Element} The first matching ancestor element, or `null`.
   */
  closest = (selector, node, opt = {}) => {
    if (!node?.nodeType) {
      const e = new this.#window.TypeError(`Unexpected type ${getType(node)}`);
      return this.#finder.onError(e, opt);
    } else if (node.nodeType !== ELEMENT_NODE) {
      const e = new this.#window.TypeError(`Unexpected node ${node.nodeName}`);
      return this.#finder.onError(e, opt);
    }
    const document = node.ownerDocument;
    if (
      document === this.#document &&
      document.contentType === 'text/html' &&
      document.documentElement &&
      node.parentNode
    ) {
      const cacheKey = `closest_${selector}`;
      let filterMatches = false;
      if (this.#cache.has(cacheKey)) {
        filterMatches = this.#cache.get(cacheKey);
      } else {
        filterMatches = filterSelector(selector, TARGET_LINEAL);
        this.#cache.set(cacheKey, filterMatches);
      }
      if (filterMatches) {
        try {
          const n = this.#idlUtils ? this.#idlUtils.wrapperForImpl(node) : node;
          const res = this.#nwsapi.closest(selector, n);
          return res;
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
      this.#finder.setup(selector, node, opt);
      const nodes = this.#finder.find(TARGET_LINEAL);
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
    if (!node?.nodeType) {
      const e = new this.#window.TypeError(`Unexpected type ${getType(node)}`);
      return this.#finder.onError(e, opt);
    }
    let res;
    try {
      if (this.#idlUtils) {
        node = this.#idlUtils.wrapperForImpl(node);
      }
      this.#finder.setup(selector, node, opt);
      const nodes = this.#finder.find(TARGET_FIRST);
      if (nodes.size) {
        [res] = [...nodes];
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
    if (!node?.nodeType) {
      const e = new this.#window.TypeError(`Unexpected type ${getType(node)}`);
      return this.#finder.onError(e, opt);
    }
    const document =
      node.nodeType === DOCUMENT_NODE ? node : node.ownerDocument;
    if (
      document === this.#document &&
      document.contentType === 'text/html' &&
      document.documentElement
    ) {
      const cacheKey = `querySelectorAll_${selector}`;
      let filterMatches = false;
      if (this.#cache.has(cacheKey)) {
        filterMatches = this.#cache.get(cacheKey);
      } else {
        filterMatches = filterSelector(selector, TARGET_ALL);
        this.#cache.set(cacheKey, filterMatches);
      }
      if (filterMatches) {
        try {
          const n = this.#idlUtils ? this.#idlUtils.wrapperForImpl(node) : node;
          const res = this.#nwsapi.select(selector, n);
          return res;
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
      this.#finder.setup(selector, node, opt);
      const nodes = this.#finder.find(TARGET_ALL);
      if (nodes.size) {
        res = [...nodes];
      }
    } catch (e) {
      this.#finder.onError(e, opt);
    }
    return res ?? [];
  };
}
