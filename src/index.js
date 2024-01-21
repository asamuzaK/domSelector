/*!
 * DOM Selector - A CSS selector engine.
 * @license MIT
 * @copyright asamuzaK (Kazz)
 * @see {@link https://github.com/asamuzaK/domSelector/blob/main/LICENSE}
 */

/* import */
import { Finder } from './js/finder.js';

/* export for test */
export { Finder };

/* instance, export for test */
export let finder = new Finder();

/**
 * matches
 * @param {string} selector - CSS selector
 * @param {object} node - Element node
 * @param {object} [opt] - options
 * @param {boolean} [opt.noexcept] - no exception
 * @param {boolean} [opt.warn] - console warn e.g. unsupported pseudo-class
 * @returns {boolean} - `true` if matched, `false` otherwise
 */
export const matches = (selector, node, opt) => {
  let res;
  try {
    if (!finder) {
      finder = new Finder();
    }
    res = finder.matches(selector, node, opt);
  } catch (e) {
    if (e instanceof globalThis[e.name]) {
      finder = null;
    }
    throw e;
  }
  return res;
};

/**
 * closest
 * @param {string} selector - CSS selector
 * @param {object} node - Element node
 * @param {object} [opt] - options
 * @param {boolean} [opt.noexcept] - no exception
 * @param {boolean} [opt.warn] - console warn e.g. unsupported pseudo-class
 * @returns {?object} - matched node
 */
export const closest = (selector, node, opt) => {
  let res;
  try {
    if (!finder) {
      finder = new Finder();
    }
    res = finder.closest(selector, node, opt);
  } catch (e) {
    if (e instanceof globalThis[e.name]) {
      finder = null;
    }
    throw e;
  }
  return res;
};

/**
 * querySelector
 * @param {string} selector - CSS selector
 * @param {object} node - Document, DocumentFragment or Element node
 * @param {object} [opt] - options
 * @param {boolean} [opt.noexcept] - no exception
 * @param {boolean} [opt.warn] - console warn e.g. unsupported pseudo-class
 * @returns {?object} - matched node
 */
export const querySelector = (selector, node, opt) => {
  let res;
  try {
    if (!finder) {
      finder = new Finder();
    }
    res = finder.querySelector(selector, node, opt);
  } catch (e) {
    if (e instanceof globalThis[e.name]) {
      finder = null;
    }
    throw e;
  }
  return res;
};

/**
 * querySelectorAll
 * NOTE: returns Array, not NodeList
 * @param {string} selector - CSS selector
 * @param {object} node - Document, DocumentFragment or Element node
 * @param {object} [opt] - options
 * @param {boolean} [opt.noexcept] - no exception
 * @param {boolean} [opt.warn] - console warn e.g. unsupported pseudo-class
 * @returns {Array.<object|undefined>} - array of matched nodes
 */
export const querySelectorAll = (selector, node, opt) => {
  let res;
  try {
    if (!finder) {
      finder = new Finder();
    }
    res = finder.querySelectorAll(selector, node, opt);
  } catch (e) {
    if (e instanceof globalThis[e.name]) {
      finder = null;
    }
    throw e;
  }
  return res;
};
