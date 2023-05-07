/*!
 * DOM Selector - retrieve DOM node from the given CSS selector
 * @license MIT
 * @copyright asamuzaK (Kazz)
 * @see {@link https://github.com/asamuzaK/domSelector/blob/main/LICENSE}
 */

/* import */
const { Matcher } = require('./js/matcher.js');

/**
 * matches - Element.matches()
 * @param {string} selector - CSS selector
 * @param {object} node - Element node
 * @returns {?object} - matched node
 */
const matches = (selector, node) => {
  const matcher = new Matcher(selector, node);
  return matcher.matches();
};

/**
 * closest - Element.closest()
 * @param {string} selector - CSS selector
 * @param {object} node - Element node
 * @returns {?object} - matched node
 */
const closest = (selector, node) => {
  const matcher = new Matcher(selector, node);
  return matcher.closest();
};

/**
 * querySelector - Document.querySelector(), Element.querySelector()
 * @param {string} selector - CSS selector
 * @param {object} refPoint - Document interface or Element node
 * @returns {?object} - matched node
 */
const querySelector = (selector, refPoint) => {
  const matcher = new Matcher(selector, refPoint);
  return matcher.querySelector();
};

/**
 * querySelectorAll - Document.querySelectorAll(), Element.querySelectorAll()
 * NOTE: returns Array, not NodeList
 * @param {string} selector - CSS selector
 * @param {object} refPoint - Document interface or Element node
 * @returns {Array.<object|undefined>} - array of matched nodes
 */
const querySelectorAll = (selector, refPoint) => {
  const matcher = new Matcher(selector, refPoint);
  return matcher.querySelectorAll();
};

module.exports = {
  closest,
  matches,
  querySelector,
  querySelectorAll
};
