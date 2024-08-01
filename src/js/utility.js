/**
 * utility.js
 */

/* import */
import nwsapi from '@asamuzakjp/nwsapi';
import bidiFactory from 'bidi-js';
import isCustomElementName from 'is-potential-custom-element-name';

/* constants */
import {
  DOCUMENT_FRAGMENT_NODE, DOCUMENT_NODE, DOCUMENT_POSITION_CONTAINS,
  DOCUMENT_POSITION_PRECEDING, ELEMENT_NODE, REG_DIR, REG_FILTER_COMPLEX,
  REG_FILTER_COMPOUND, REG_FILTER_SIMPLE, REG_LOGICAL_EMPTY, REG_SHADOW_MODE,
  TEXT_NODE, TYPE_FROM, TYPE_TO, WALKER_FILTER
} from './constant.js';

/**
 * get type
 * @param {*} o - object to check
 * @returns {string} - type of object
 */
export const getType = o =>
  Object.prototype.toString.call(o).slice(TYPE_FROM, TYPE_TO);

/**
 * resolve content document, root node and tree walker
 * @param {object} node - Document, DocumentFragment, Element node
 * @returns {Array.<object>} - array of document, root node, tree walker
 */
export const resolveContent = node => {
  if (!node?.nodeType) {
    throw new TypeError(`Unexpected type ${getType(node)}`);
  }
  let document;
  let root;
  switch (node.nodeType) {
    case DOCUMENT_NODE: {
      document = node;
      root = node;
      break;
    }
    case DOCUMENT_FRAGMENT_NODE: {
      document = node.ownerDocument;
      root = node;
      break;
    }
    case ELEMENT_NODE: {
      document = node.ownerDocument;
      let parent = node;
      while (parent) {
        if (parent.parentNode) {
          parent = parent.parentNode;
        } else {
          break;
        }
      }
      root = parent;
      break;
    }
    default : {
      throw new TypeError(`Unexpected node ${node.nodeName}`);
    }
  }
  const walker = document.createTreeWalker(root, WALKER_FILTER);
  return [
    document,
    root,
    walker
  ];
};

/**
 * traverse node tree
 * @private
 * @param {object} node - node
 * @param {object} walker - tree walker
 * @returns {?object} - current node
 */
export const traverseNode = (node, walker) => {
  if (!node?.nodeType) {
    throw new TypeError(`Unexpected type ${getType(node)}`);
  }
  let current;
  if (walker?.currentNode) {
    let refNode = walker.currentNode;
    if (refNode === node) {
      current = refNode;
    } else if (refNode.contains(node)) {
      refNode = walker.nextNode();
      while (refNode) {
        if (refNode === node) {
          current = refNode;
          break;
        }
        refNode = walker.nextNode();
      }
    } else {
      if (refNode !== walker.root) {
        while (refNode) {
          if (refNode === walker.root || refNode === node) {
            break;
          }
          refNode = walker.parentNode();
        }
      }
      if (node.nodeType === ELEMENT_NODE) {
        while (refNode) {
          if (refNode === node) {
            current = refNode;
            break;
          }
          refNode = walker.nextNode();
        }
      } else {
        current = refNode;
      }
    }
  }
  return current ?? null;
};

/**
 * is custom element
 * @param {object} node - Element node
 * @param {object} opt - options
 * @returns {boolean} - result;
 */
export const isCustomElement = (node, opt = {}) => {
  if (!node?.nodeType) {
    throw new TypeError(`Unexpected type ${getType(node)}`);
  }
  let bool;
  if (node.nodeType === ELEMENT_NODE) {
    const { localName, ownerDocument } = node;
    const { formAssociated } = opt;
    const window = ownerDocument.defaultView;
    let elmConstructor;
    const attr = node.getAttribute('is');
    if (attr) {
      elmConstructor =
        isCustomElementName(attr) && window.customElements.get(attr);
    } else {
      elmConstructor =
        isCustomElementName(localName) && window.customElements.get(localName);
    }
    if (elmConstructor) {
      if (formAssociated) {
        bool = elmConstructor.formAssociated;
      } else {
        bool = true;
      }
    }
  }
  return !!bool;
};

/**
 * is in shadow tree
 * @param {object} node - node
 * @returns {boolean} - result;
 */
export const isInShadowTree = node => {
  if (!node?.nodeType) {
    throw new TypeError(`Unexpected type ${getType(node)}`);
  }
  let bool;
  if (node.nodeType === ELEMENT_NODE ||
      node.nodeType === DOCUMENT_FRAGMENT_NODE) {
    let refNode = node;
    while (refNode) {
      const { host, mode, nodeType, parentNode } = refNode;
      if (host && mode && nodeType === DOCUMENT_FRAGMENT_NODE &&
          REG_SHADOW_MODE.test(mode)) {
        bool = true;
        break;
      }
      refNode = parentNode;
    }
  }
  return !!bool;
};

/**
 * get slotted text content
 * @param {object} node - Element node
 * @returns {?string} - text content
 */
export const getSlottedTextContent = node => {
  if (!node?.nodeType) {
    throw new TypeError(`Unexpected type ${getType(node)}`);
  }
  let res;
  if (node.localName === 'slot' && isInShadowTree(node)) {
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
  return res ?? null;
};

/**
 * get directionality of node
 * @see https://html.spec.whatwg.org/multipage/dom.html#the-dir-attribute
 * @param {object} node - Element node
 * @returns {?string} - 'ltr' / 'rtl'
 */
export const getDirectionality = node => {
  if (!node?.nodeType) {
    throw new TypeError(`Unexpected type ${getType(node)}`);
  }
  let res;
  if (node.nodeType === ELEMENT_NODE) {
    const { dir: nodeDir, localName, parentNode } = node;
    const { getEmbeddingLevels } = bidiFactory();
    if (REG_DIR.test(nodeDir)) {
      res = nodeDir;
    } else if (nodeDir === 'auto') {
      let text;
      switch (localName) {
        case 'input': {
          if (!node.type || /^(?:button|email|hidden|password|reset|search|submit|tel|text|url)$/.test(node.type)) {
            text = node.value;
          } else if (/^(?:checkbox|color|date|image|number|radio|range|time)$/.test(node.type)) {
            res = 'ltr';
          }
          break;
        }
        case 'slot': {
          text = getSlottedTextContent(node);
          break;
        }
        case 'textarea': {
          text = node.value;
          break;
        }
        default: {
          const items = [].slice.call(node.childNodes);
          for (const item of items) {
            const {
              dir: itemDir, localName: itemLocalName, nodeType: itemNodeType,
              textContent: itemTextContent
            } = item;
            if (itemNodeType === TEXT_NODE) {
              text = itemTextContent.trim();
            } else if (itemNodeType === ELEMENT_NODE) {
              if (!/^(?:bdi|script|style|textarea)$/.test(itemLocalName) &&
                  (!itemDir || !REG_DIR.test(itemDir))) {
                if (itemLocalName === 'slot') {
                  text = getSlottedTextContent(item);
                } else {
                  text = itemTextContent.trim();
                }
              }
            }
            if (text) {
              break;
            }
          }
        }
      }
      if (text) {
        const { paragraphs: [{ level }] } = getEmbeddingLevels(text);
        if (level % 2 === 1) {
          res = 'rtl';
        } else {
          res = 'ltr';
        }
      }
      if (!res) {
        if (parentNode) {
          const { nodeType: parentNodeType } = parentNode;
          if (parentNodeType === ELEMENT_NODE) {
            res = getDirectionality(parentNode);
          } else if (parentNodeType === DOCUMENT_NODE ||
                     parentNodeType === DOCUMENT_FRAGMENT_NODE) {
            res = 'ltr';
          }
        } else {
          res = 'ltr';
        }
      }
    } else if (localName === 'bdi') {
      const text = node.textContent.trim();
      if (text) {
        const { paragraphs: [{ level }] } = getEmbeddingLevels(text);
        if (level % 2 === 1) {
          res = 'rtl';
        } else {
          res = 'ltr';
        }
      }
      if (!(res || parentNode)) {
        res = 'ltr';
      }
    } else if (localName === 'input' && node.type === 'tel') {
      res = 'ltr';
    } else if (parentNode) {
      if (localName === 'slot') {
        const text = getSlottedTextContent(node);
        if (text) {
          const { paragraphs: [{ level }] } = getEmbeddingLevels(text);
          if (level % 2 === 1) {
            res = 'rtl';
          } else {
            res = 'ltr';
          }
        }
      }
      if (!res) {
        const { nodeType: parentNodeType } = parentNode;
        if (parentNodeType === ELEMENT_NODE) {
          res = getDirectionality(parentNode);
        } else if (parentNodeType === DOCUMENT_NODE ||
                   parentNodeType === DOCUMENT_FRAGMENT_NODE) {
          res = 'ltr';
        }
      }
    } else {
      res = 'ltr';
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
export const isContentEditable = node => {
  if (!node?.nodeType) {
    throw new TypeError(`Unexpected type ${getType(node)}`);
  }
  let res;
  if (node.nodeType === ELEMENT_NODE) {
    if (typeof node.isContentEditable === 'boolean') {
      res = node.isContentEditable;
    } else if (node.ownerDocument.designMode === 'on') {
      res = true;
    } else if (node.hasAttribute('contenteditable')) {
      const attr = node.getAttribute('contenteditable');
      if (attr === '' || /^(?:plaintext-only|true)$/.test(attr)) {
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
 * get namespace URI
 * @param {string} ns - namespace prefix
 * @param {Array} node - Element node
 * @returns {?string} - namespace URI
 */
export const getNamespaceURI = (ns, node) => {
  if (typeof ns !== 'string') {
    throw new TypeError(`Unexpected type ${getType(ns)}`);
  } else if (!node?.nodeType) {
    throw new TypeError(`Unexpected type ${getType(node)}`);
  }
  let res;
  if (ns && node.nodeType === ELEMENT_NODE) {
    const { attributes } = node;
    for (const attr of attributes) {
      const { name, namespaceURI, prefix, value } = attr;
      if (name === `xmlns:${ns}`) {
        res = value;
        break;
      } else if (prefix === ns) {
        res = namespaceURI;
        break;
      }
    }
  }
  return res ?? null;
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
    res = node.lookupNamespaceURI(ns);
    if (!res) {
      const root = node.ownerDocument.documentElement;
      let parent = node;
      while (parent) {
        res = getNamespaceURI(ns, parent);
        if (res || parent === root) {
          break;
        }
        parent = parent.parentNode;
      }
    }
  }
  return !!res;
};

/**
 * is preceding - nodeA precedes and/or contains nodeB
 * @param {object} nodeA - Element node
 * @param {object} nodeB - Element node
 * @returns {boolean} - result
 */
export const isPreceding = (nodeA, nodeB) => {
  if (!nodeA?.nodeType) {
    throw new TypeError(`Unexpected type ${getType(nodeA)}`);
  } else if (!nodeB?.nodeType) {
    throw new TypeError(`Unexpected type ${getType(nodeB)}`);
  }
  let res;
  if (nodeA.nodeType === ELEMENT_NODE && nodeB.nodeType === ELEMENT_NODE) {
    const posBit = nodeB.compareDocumentPosition(nodeA);
    res = posBit & DOCUMENT_POSITION_PRECEDING ||
          posBit & DOCUMENT_POSITION_CONTAINS;
  }
  return !!res;
};

/**
 * sort nodes
 * @param {Array.<object>|Set.<object>} nodes - collection of nodes
 * @returns {Array.<object|undefined>} - collection of sorted nodes
 */
export const sortNodes = (nodes = []) => {
  const arr = [...nodes];
  if (arr.length > 1) {
    arr.sort((a, b) => {
      let res;
      if (isPreceding(b, a)) {
        res = 1;
      } else {
        res = -1;
      }
      return res;
    });
  }
  return arr;
};

/**
 * init nwsapi
 * @param {object} window - Window
 * @param {object} document - Document
 * @returns {object} - nwsapi
 */
export const initNwsapi = (window, document) => {
  if (!window?.DOMException) {
    throw new TypeError(`Unexpected global object ${getType(window)}`);
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
 * filter selector (for nwsapi)
 * @param {string} selector - selector
 * @param {object} opt - options
 * @returns {boolean} - result
 */
export const filterSelector = (selector, opt = {}) => {
  if (!selector || typeof selector !== 'string') {
    return false;
  }
  // filter non-ASCII, control characters other than whitespace,
  // namespace selectors, e.g. ns|E, pseudo-element selectors, and
  // attribute selectors with case flag, e.g. [attr i], or with unclosed quotes
  if (/[^\u0021-\u007F\s]|\||::|\[\s*[\w$*=^|~-]+(?:(?:"[\w$*=^|~\s'-]+"|'[\w$*=^|~\s"-]+')?(?:\s+[\w$*=^|~-]+)+|"[^"\]]{1,255}|'[^'\]]{1,255})\s*\]/.test(selector)) {
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
  // filter pseudo-classes
  if (selector.includes(':')) {
    let reg;
    if (/:(?:is|not)\(/.test(selector)) {
      // filter empty :is()
      if (REG_LOGICAL_EMPTY.test(selector)) {
        return false;
      }
      const { complex } = opt;
      if (complex) {
        reg = REG_FILTER_COMPLEX;
      } else {
        reg = REG_FILTER_COMPOUND;
      }
    } else {
      reg = REG_FILTER_SIMPLE;
    }
    if (reg.test(selector)) {
      return false;
    }
  }
  return true;
};
