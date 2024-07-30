/*!
 * DOM Selector - A CSS selector engine.
 * @license MIT
 * @copyright asamuzaK (Kazz)
 * @see {@link https://github.com/asamuzaK/domSelector/blob/main/LICENSE}
 */

/* import */
import { Finder } from './js/finder.js';
import { filterSelector, initNwsapi } from './js/nwsapi.js';

/* constants */
import {
  DOCUMENT_NODE, ELEMENT_NODE, REG_COMPLEX, TARGET_ALL, TARGET_FIRST,
  TARGET_LINEAL, TARGET_SELF
} from './js/constant.js';

export class DOMSelector extends Finder {
  /* private fields */
  #document;
  #nwsapi;

  /**
   * construct
   * @param {object} window - window
   * @param {object} document - document
   */
  constructor(window, document) {
    super(window);
    this.#document = document ?? window.document;
    this.#nwsapi = initNwsapi(window, document);
  }

  /**
   * matches
   * @param {string} selector - CSS selector
   * @param {object} node - Element node
   * @param {object} opt - options
   * @returns {boolean} - `true` if matched `false` otherwise
   */
  matches(selector, node, opt) {
    if (node?.nodeType !== ELEMENT_NODE) {
      const e = new TypeError(`Unexpected node ${node?.nodeName}`);
      this._onError(e);
    }
    const document = node.ownerDocument;
    if (document === this.#document && document.contentType === 'text/html') {
      const filterOpt = {
        complex: REG_COMPLEX.test(selector),
        target: TARGET_SELF
      };
      if (filterSelector(selector, filterOpt)) {
        try {
          const res = this.#nwsapi.match(selector, node);
          return res;
        } catch (e) {
          // fall through
        }
      }
    }
    let res;
    try {
      this._setup(selector, node, opt);
      const nodes = this._find(TARGET_SELF);
      res = nodes.size;
    } catch (e) {
      this._onError(e);
    }
    return !!res;
  }

  /**
   * closest
   * @param {string} selector - CSS selector
   * @param {object} node - Element node
   * @param {object} opt - options
   * @returns {?object} - matched node
   */
  closest(selector, node, opt) {
    if (node?.nodeType !== ELEMENT_NODE) {
      const e = new TypeError(`Unexpected node ${node?.nodeName}`);
      this._onError(e);
    }
    const document = node.ownerDocument;
    if (document === this.#document && document.contentType === 'text/html') {
      const filterOpt = {
        complex: REG_COMPLEX.test(selector),
        target: TARGET_LINEAL
      };
      if (filterSelector(selector, filterOpt)) {
        try {
          const res = this.#nwsapi.closest(selector, node);
          return res;
        } catch (e) {
          // fall through
        }
      }
    }
    let res;
    try {
      this._setup(selector, node, opt);
      const nodes = this._find(TARGET_LINEAL);
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
      this._onError(e);
    }
    return res ?? null;
  }

  /**
   * query selector
   * @param {string} selector - CSS selector
   * @param {object} node - Document, DocumentFragment, Element node
   * @param {object} opt - options
   * @returns {?object} - matched node
   */
  querySelector(selector, node, opt) {
    let document;
    if (node?.nodeType === DOCUMENT_NODE) {
      document = node;
    } else {
      document = node?.ownerDocument;
    }
    if (document === this.#document && document.contentType === 'text/html') {
      const filterOpt = {
        complex: false,
        target: TARGET_FIRST
      };
      if (filterSelector(selector, filterOpt)) {
        try {
          const res = this.#nwsapi.first(selector, node);
          return res;
        } catch (e) {
          // fall through
        }
      }
    }
    let res;
    try {
      this._setup(selector, node, opt);
      const nodes = this._find(TARGET_FIRST);
      if (nodes.size) {
        [res] = nodes;
      }
    } catch (e) {
      this._onError(e);
    }
    return res ?? null;
  }

  /**
   * query selector all
   * NOTE: returns Array, not NodeList
   * @param {string} selector - CSS selector
   * @param {object} node - Document, DocumentFragment, Element node
   * @param {object} opt - options
   * @returns {Array.<object|undefined>} - collection of matched nodes
   */
  querySelectorAll(selector, node, opt) {
    let document;
    if (node?.nodeType === DOCUMENT_NODE) {
      document = node;
    } else {
      document = node?.ownerDocument;
    }
    if (document === this.#document && document.contentType === 'text/html') {
      const filterOpt = {
        complex: false,
        target: TARGET_ALL
      };
      if (filterSelector(selector, filterOpt)) {
        try {
          const res = this.#nwsapi.select(selector, node);
          return res;
        } catch (e) {
          // fall through
        }
      }
    }
    let res;
    try {
      this._setup(selector, node, opt);
      const nodes = this._find(TARGET_ALL);
      if (nodes.size) {
        res = [...nodes];
      }
    } catch (e) {
      this._onError(e);
    }
    return res ?? [];
  }
}
