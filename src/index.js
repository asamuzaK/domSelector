/*!
 * DOM Selector - retrieve DOM node from the given CSS selector
 * @license MIT
 * @copyright asamuzaK (Kazz)
 * @see {@link https://github.com/asamuzaK/domSelector/blob/main/LICENSE}
 */
'use strict';

/* import */
const { Matcher } = require('./js/matcher.js');

/**
 * matches
 * @param {string} selector - CSS selector
 * @param {object} node - Element node
 * @param {object} [opt] - options
 * @param {boolean} [opt.warn] - console warn e.g. unsupported pseudo-class
 * @returns {boolean} - result
 */
const matches = (selector, node, opt) =>
  new Matcher(selector, node, opt).matches();

/**
 * closest
 * @param {string} selector - CSS selector
 * @param {object} node - Element node
 * @param {object} [opt] - options
 * @param {boolean} [opt.warn] - console warn e.g. unsupported pseudo-class
 * @returns {?object} - matched node
 */
const closest = (selector, node, opt) =>
  new Matcher(selector, node, opt).closest();

/**
 * querySelector
 * @param {string} selector - CSS selector
 * @param {object} refPoint - Document, DocumentFragment or Element node
 * @param {object} [opt] - options
 * @param {boolean} [opt.warn] - console warn e.g. unsupported pseudo-class
 * @returns {?object} - matched node
 */
const querySelector = (selector, refPoint, opt) =>
  new Matcher(selector, refPoint, opt).querySelector();

/**
 * querySelectorAll
 * NOTE: returns Array, not NodeList
 * @param {string} selector - CSS selector
 * @param {object} refPoint - Document, DocumentFragment or Element node
 * @param {object} [opt] - options
 * @param {boolean} [opt.sort] - sort matched nodes
 * @param {boolean} [opt.warn] - console warn e.g. unsupported pseudo-class
 * @returns {Array.<object|undefined>} - array of matched nodes
 */
const querySelectorAll = (selector, refPoint, opt) =>
  new Matcher(selector, refPoint, opt).querySelectorAll();

module.exports = {
  closest,
  matches,
  querySelector,
  querySelectorAll
};
