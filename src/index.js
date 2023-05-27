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
 * matches - Element.matches()
 * @param {string} selector - CSS selector
 * @param {object} node - Element node
 * @param {object} [opt] - options
 * @param {object} [opt.warn] - console warn e.g. unsupported pseudo-class
 * @returns {boolean} - result
 */
const matches = (selector, node, opt) => {
  const matcher = new Matcher(selector, node, opt);
  return matcher.matches();
};

/**
 * closest - Element.closest()
 * @param {string} selector - CSS selector
 * @param {object} node - Element node
 * @param {object} [opt] - options
 * @param {object} [opt.warn] - console warn e.g. unsupported pseudo-class
 * @returns {?object} - matched node
 */
const closest = (selector, node, opt) => {
  const matcher = new Matcher(selector, node, opt);
  return matcher.closest();
};

/**
 * querySelector - Document.querySelector(), Element.querySelector()
 * @param {string} selector - CSS selector
 * @param {object} refPoint - Document or Element node
 * @param {object} [opt] - options
 * @param {object} [opt.warn] - console warn e.g. unsupported pseudo-class
 * @returns {?object} - matched node
 */
const querySelector = (selector, refPoint, opt) => {
  const matcher = new Matcher(selector, refPoint, opt);
  return matcher.querySelector();
};

/**
 * querySelectorAll - Document.querySelectorAll(), Element.querySelectorAll()
 * NOTE: returns Array, not NodeList
 * @param {string} selector - CSS selector
 * @param {object} refPoint - Document or Element node
 * @param {object} [opt] - options
 * @param {object} [opt.warn] - console warn e.g. unsupported pseudo-class
 * @returns {Array.<object|undefined>} - array of matched nodes
 */
const querySelectorAll = (selector, refPoint, opt) => {
  const matcher = new Matcher(selector, refPoint, opt);
  return matcher.querySelectorAll();
};

module.exports = {
  closest,
  matches,
  querySelector,
  querySelectorAll
};
