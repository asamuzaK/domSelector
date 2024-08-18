/*!
 * DOM Selector - A CSS selector engine.
 * @license MIT
 * @copyright asamuzaK (Kazz)
 * @see {@link https://github.com/asamuzaK/domSelector/blob/main/LICENSE}
 */

/* import */
import { Finder } from './js/finder.js';
import { filterSelector, getType, initNwsapi } from './js/utility.js';

/* constants */
import {
  DOCUMENT_NODE, ELEMENT_NODE, REG_COMPLEX, TARGET_ALL, TARGET_FIRST,
  TARGET_LINEAL, TARGET_SELF
} from './js/constant.js';

/* DOMSelector */
export class DOMSelector {
  /* private fields */
  #window;
  #document;
  #finder;
  #nwsapi;

  /**
   * construct
   * @param {object} window - window
   * @param {object} document - document
   */
  constructor(window, document) {
    this.#window = window;
    this.#document = document ?? window.document;
    this.#finder = new Finder(window);
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
    if (!node?.nodeType) {
      const e = new this.#window.TypeError(`Unexpected type ${getType(node)}`);
      this.#finder.onError(e, opt);
    } else if (node.nodeType !== ELEMENT_NODE) {
      const e = new this.#window.TypeError(`Unexpected node ${node.nodeName}`);
      this.#finder.onError(e, opt);
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
      this.#finder.setup(selector, node, opt);
      const nodes = this.#finder.find(TARGET_SELF);
      res = nodes.size;
    } catch (e) {
      this.#finder.onError(e, opt);
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
    if (!node?.nodeType) {
      const e = new this.#window.TypeError(`Unexpected type ${getType(node)}`);
      this.#finder.onError(e, opt);
    } else if (node.nodeType !== ELEMENT_NODE) {
      const e = new this.#window.TypeError(`Unexpected node ${node.nodeName}`);
      this.#finder.onError(e, opt);
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
  }

  /**
   * query selector
   * @param {string} selector - CSS selector
   * @param {object} node - Document, DocumentFragment, Element node
   * @param {object} opt - options
   * @returns {?object} - matched node
   */
  querySelector(selector, node, opt) {
    if (!node?.nodeType) {
      const e = new this.#window.TypeError(`Unexpected type ${getType(node)}`);
      this.#finder.onError(e, opt);
    }
    let document;
    if (node.nodeType === DOCUMENT_NODE) {
      document = node;
    } else {
      document = node.ownerDocument;
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
      this.#finder.setup(selector, node, opt);
      const nodes = this.#finder.find(TARGET_FIRST);
      if (nodes.size) {
        [res] = nodes;
      }
    } catch (e) {
      this.#finder.onError(e, opt);
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
    if (!node?.nodeType) {
      const e = new this.#window.TypeError(`Unexpected type ${getType(node)}`);
      this.#finder.onError(e, opt);
    }
    let document;
    if (node.nodeType === DOCUMENT_NODE) {
      document = node;
    } else {
      document = node.ownerDocument;
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
      this.#finder.setup(selector, node, opt);
      const nodes = this.#finder.find(TARGET_ALL);
      if (nodes.size) {
        res = [...nodes];
      }
    } catch (e) {
      this.#finder.onError(e, opt);
    }
    return res ?? [];
  }
}
