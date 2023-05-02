/*!
 * DOM Selector - retrieve DOM node from the given CSS selector
 *
 * @license MIT
 * @copyright asamuzaK (Kazz)
 * @see {@link https://github.com/asamuzaK/domSelector/blob/main/LICENSE}
 */

import { Matcher } from './mjs/matcher.js';

/**
 * matches - Element.matches()
 * @param {string} selector - CSS selector
 * @param {object} refPoint - Element
 * @returns {?object} - matched node
 */
export const matches = (selector, refPoint) => {
  const matcher = new Matcher(selector, refPoint);
  return matcher.matches();
};

/**
 * closest - Element.closest()
 * @param {string} selector - CSS selector
 * @param {object} refPoint - Element
 * @returns {?object} - matched node
 */
export const closest = (selector, refPoint) => {
  const matcher = new Matcher(selector, refPoint);
  return matcher.closest();
};

/**
 * querySelector - Document.querySelector(), Element.querySelector()
 * @param {string} selector - CSS selector
 * @param {object} refPoint - Document or Element
 * @returns {?object} - matched node
 */
export const querySelector = (selector, refPoint) => {
  const matcher = new Matcher(selector, refPoint);
  return matcher.querySelector();
};

/**
 * querySelectorAll - Document.querySelectorAll(), Element.querySelectorAll()
 * NOTE: returns Array, not NodeList
 * @param {string} selector - CSS selector
 * @param {object} refPoint - Document or Element
 * @returns {Array.<object|undefined>} - array of matched nodes
 */
export const querySelectorAll = (selector, refPoint) => {
  const matcher = new Matcher(selector, refPoint);
  return matcher.querySelectorAll();
};
