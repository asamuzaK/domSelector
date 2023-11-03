/**
 * dom-util.js
 */

/* import */
import bidiFactory from 'bidi-js';

/* constants */
import {
  DOCUMENT_NODE, DOCUMENT_FRAGMENT_NODE, DOCUMENT_POSITION_CONTAINED_BY,
  ELEMENT_NODE, SYNTAX_ERR
} from './constant.js';
const LTR = 'ltr';
const RTL = 'rtl';

/* regexp */
const INPUT_TYPE =
  /^(?:(?:butto|hidde)n|(?:emai|te|ur)l|(?:rese|submi|tex)t|password|search)$/;
const SHADOW_MODE = /^(?:close|open)$/;

/* bidi */
const bidi = bidiFactory();

/**
 * get slotted text content
 * @param {object} node - Element node
 * @returns {?string} - text content
 */
export const getSlottedTextContent = (node = {}) => {
  let res;
  if (node.nodeType === ELEMENT_NODE && node.localName === 'slot') {
    let parent = node.parentNode;
    let bool;
    while (parent) {
      if (parent) {
        const { host, mode, nodeType, parentNode } = parent;
        if (nodeType === DOCUMENT_FRAGMENT_NODE && host &&
            mode && SHADOW_MODE.test(mode)) {
          bool = true;
          break;
        }
        parent = parentNode;
      }
    }
    if (bool) {
      const nodes = node.assignedNodes();
      if (nodes.length) {
        for (const item of nodes) {
          res = item.textContent.trim();
          if (res) {
            break;
          }
        }
      } else {
        res = node.textContent.trim();
      }
    }
  }
  return res ?? null;
};

/**
 * get directionality of node
 * @see https://html.spec.whatwg.org/multipage/dom.html#the-dir-attribute
 * @param {object} node - Element node
 * @returns {?string} - result
 */
export const getDirectionality = (node = {}) => {
  let res;
  if (node.nodeType === ELEMENT_NODE) {
    const { dir: nodeDir, localName, parentNode } = node;
    if (/^(?:ltr|rtl)$/.test(nodeDir)) {
      res = nodeDir;
    } else if (nodeDir === 'auto') {
      let text;
      if (localName === 'textarea') {
        text = node.value;
      } else if (localName === 'input' &&
                 (!node.type || INPUT_TYPE.test(node.type))) {
        text = node.value;
      } else if (localName === 'slot') {
        text = getSlottedTextContent(node);
      } else {
        text = node.textContent.trim();
      }
      if (text) {
        const { paragraphs: [{ level }] } = bidi.getEmbeddingLevels(text);
        if (level % 2 === 1) {
          res = RTL;
        } else {
          res = LTR;
        }
      }
      if (!res) {
        if (parentNode) {
          if (parentNode.nodeType === ELEMENT_NODE) {
            res = getDirectionality(parentNode);
          } else if (parentNode.nodeType === DOCUMENT_NODE ||
                     parentNode.nodeType === DOCUMENT_FRAGMENT_NODE) {
            res = LTR;
          }
        } else {
          res = LTR;
        }
      }
    } else if (localName === 'bdi') {
      const text = node.textContent.trim();
      if (text) {
        const { paragraphs: [{ level }] } = bidi.getEmbeddingLevels(text);
        if (level % 2 === 1) {
          res = RTL;
        } else {
          res = LTR;
        }
      }
      if (!(res || parentNode)) {
        res = LTR;
      }
    } else if (localName === 'input' && node.type === 'tel') {
      res = LTR;
    } else if (parentNode) {
      if (localName === 'slot') {
        const text = getSlottedTextContent(node);
        if (text) {
          const { paragraphs: [{ level }] } = bidi.getEmbeddingLevels(text);
          if (level % 2 === 1) {
            res = RTL;
          } else {
            res = LTR;
          }
        }
      }
      if (!res) {
        if (parentNode.nodeType === ELEMENT_NODE) {
          res = getDirectionality(parentNode);
        } else if (parentNode.nodeType === DOCUMENT_NODE ||
                   parentNode.nodeType === DOCUMENT_FRAGMENT_NODE) {
          res = LTR;
        }
      }
    } else {
      res = LTR;
    }
  }
  return res ?? null;
};

/**
 * is content editable
 * NOTE: not implemented in jsdom https://github.com/jsdom/jsdom/issues/1670
 * @param {object} node - Element node
 * @returns {boolean} - result
 */
export const isContentEditable = (node = {}) => {
  let res;
  if (node.nodeType === ELEMENT_NODE) {
    if (typeof node.isContentEditable === 'boolean') {
      res = node.isContentEditable;
    } else if (node.ownerDocument.designMode === 'on') {
      res = true;
    } else if (node.hasAttribute('contenteditable')) {
      const attr = node.getAttribute('contenteditable');
      if (/^(?:plaintext-only|true)$/.test(attr) || attr === '') {
        res = true;
      } else if (attr === 'inherit') {
        let parent = node.parentNode;
        while (parent) {
          if (isContentEditable(parent)) {
            res = true;
            break;
          }
          parent = parent.parentNode;
        }
      }
    }
  }
  return !!res;
};

/**
 * is namespace declared
 * @param {string} ns - namespace
 * @param {object} node - Element node
 * @returns {boolean} - result
 */
export const isNamespaceDeclared = (ns = '', node = {}) => {
  let res;
  if (ns && typeof ns === 'string' && node.nodeType === ELEMENT_NODE) {
    const attr = `xmlns:${ns}`;
    const root = node.ownerDocument.documentElement;
    let parent = node;
    while (parent) {
      if (typeof parent.hasAttribute === 'function' &&
          parent.hasAttribute(attr)) {
        res = true;
        break;
      } else if (parent === root) {
        break;
      }
      parent = parent.parentNode;
    }
  }
  return !!res;
};

/**
 * is node same or descendant of the root node
 * @param {object} node - Element node
 * @param {object} root - Document, DocumentFragment, Element node
 * @returns {boolean} - result
 */
export const isSameOrDescendant = (node = {}, root = {}) => {
  const { nodeType, ownerDocument } = node;
  let res;
  if (nodeType === ELEMENT_NODE && ownerDocument) {
    if (!root || root.nodeType !== ELEMENT_NODE) {
      root = ownerDocument;
    }
    if (node === root) {
      res = true;
    } else if (root) {
      res = root.compareDocumentPosition(node) & DOCUMENT_POSITION_CONTAINED_BY;
    }
  }
  return !!res;
};

/**
 * selector to node properties - e.g. ns|E -> { prefix: ns, tagName: E }
 * @param {string} selector - type selector
 * @param {object} [node] - Element node
 * @returns {object} - node properties
 */
export const selectorToNodeProps = (selector, node) => {
  let prefix, tagName;
  if (selector && typeof selector === 'string') {
    if (/\|/.test(selector)) {
      [prefix, tagName] = selector.split('|');
    } else {
      prefix = '*';
      tagName = selector;
    }
  } else {
    throw new DOMException(`invalid selector ${selector}`, SYNTAX_ERR);
  }
  return {
    prefix,
    tagName
  };
};
