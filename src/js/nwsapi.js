/**
 * nwsapi.js
 */

/* import */
import nwsapi from '@asamuzakjp/nwsapi';

/* constants */
import {
  DOCUMENT_NODE, REG_LOGICAL_COMPLEX, REG_LOGICAL_COMPOUND, REG_LOGICAL_EMPTY,
  REG_LOGICAL_IS_NOT, REG_PSEUDO_FILTER, TYPE_FROM, TYPE_TO
} from './constant.js';

/**
 * init nwsapi
 * @param {object} window - Window
 * @param {object} document - Document
 * @returns {object} - nwsapi
 */
export const initNwsapi = (window, document) => {
  if (!window || !window.DOMException) {
    const type =
      Object.prototype.toString.call(window).slice(TYPE_FROM, TYPE_TO);
    const msg = `Unexpected global object ${type}`;
    throw new TypeError(msg);
  }
  if (document?.nodeType !== DOCUMENT_NODE) {
    document = window.document;
  }
  const nw = nwsapi({
    document,
    DOMException: window.DOMException
  });
  nw.configure({
    LOGERRORS: false
  });
  return nw;
};

/**
 * filter selector
 * @param {string} selector - selector
 * @param {object} opt - options
 * @returns {boolean} - result
 */
export const filterSelector = (selector, opt = {}) => {
  if (!selector || typeof selector !== 'string') {
    return false;
  }
  // filter missing close square bracket
  if (selector.includes('[')) {
    const index = selector.lastIndexOf('[');
    const sel = selector.substring(index);
    if (sel.lastIndexOf(']') < 0) {
      return false;
    }
  }
  // filter namespaced selectors, e.g. ns|E
  // filter pseudo-element selectors
  // filter attribute selectors with case flag, e.g. [attr i]
  // filter unclosed quotes
  if (/\||::|\[\s*[\w$*=^|~-]+(?:(?:"[\w$*=^|~\s'-]+"|'[\w$*=^|~\s"-]+')?(?:\s+[\w$*=^|~-]+)+|"[^"\]]{1,255}|'[^'\]]{1,255})\s*\]/.test(selector)) {
    return false;
  }
  // filter pseudo-classes
  if (selector.includes(':')) {
    let reg;
    if (REG_LOGICAL_IS_NOT.test(selector)) {
      // filter empty :is()
      if (REG_LOGICAL_EMPTY.test(selector)) {
        return false;
      }
      const { complex, descendant } = opt;
      if (complex && descendant) {
        reg = REG_LOGICAL_COMPLEX;
      } else {
        reg = REG_LOGICAL_COMPOUND;
      }
    } else {
      reg = REG_PSEUDO_FILTER;
    }
    if (reg.test(selector)) {
      return false;
    }
  }
  return true;
};
