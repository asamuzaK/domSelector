/**
 * dom-util.js
 */

/* import */
import bidiFactory from 'bidi-js';
import isCustomElementName from 'is-potential-custom-element-name';

/* constants */
import {
  DOCUMENT_FRAGMENT_NODE, DOCUMENT_NODE, DOCUMENT_POSITION_CONTAINS,
  DOCUMENT_POSITION_PRECEDING, ELEMENT_NODE, REG_DIR, REG_SHADOW_MODE,
  TEXT_NODE, TYPE_FROM, TYPE_TO, WALKER_FILTER
} from './constant.js';

/**
 * verify node
 * @param {*} node - node
 * @throws
 * @returns {object} - Document, DocumentFragment, Element node
 */
export const verifyNode = node => {
  if (!node || !node.nodeType || !node.nodeName) {
    const type = Object.prototype.toString.call(node).slice(TYPE_FROM, TYPE_TO);
    const msg = `Unexpected type ${type}`;
    throw new TypeError(msg);
  } else if (!(node.nodeType === DOCUMENT_NODE ||
               node.nodeType === DOCUMENT_FRAGMENT_NODE ||
               node.nodeType === ELEMENT_NODE)) {
    const msg = `Unexpected node ${node.nodeName}`;
    throw new TypeError(msg);
  }
  return node;
};

/**
 * resolve content document, root node and tree walker
 * @param {object} node - Document, DocumentFragment, Element node
 * @returns {Array.<object>} - array of document, root node, tree walker
 */
export const resolveContent = node => {
  node = verifyNode(node);
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
    case ELEMENT_NODE:
    default: {
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
  let current;
  if (!node || !node.nodeType) {
    // throws
    verifyNode(node);
  } else if (walker?.currentNode) {
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
  let bool;
  if (!node || !node.nodeType) {
    // throws
    verifyNode(node);
  } else if (node.nodeType === ELEMENT_NODE) {
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
  let bool;
  if (!node || !node.nodeType) {
    // throws
    verifyNode(node);
  } else if (node.nodeType === ELEMENT_NODE ||
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
  let res;
  if (!node || !node.nodeType) {
    // throws
    verifyNode(node);
  } else if (node.localName === 'slot' && isInShadowTree(node)) {
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
  let res;
  if (!node || !node.nodeType) {
    // throws
    verifyNode(node);
  } else if (node.nodeType === ELEMENT_NODE) {
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
  let res;
  if (!node || !node.nodeType) {
    // throws
    verifyNode(node);
  } else if (node.nodeType === ELEMENT_NODE) {
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
  let res;
  if (typeof ns !== 'string' || !node || !node.nodeType) {
    if (typeof ns !== 'string') {
      const type = Object.prototype.toString.call(ns).slice(TYPE_FROM, TYPE_TO);
      const msg = `Unexpected type ${type}`;
      throw new TypeError(msg);
    } else {
      // throws
      verifyNode(node);
    }
  } else if (ns && node.nodeType === ELEMENT_NODE) {
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
  let res;
  if (!nodeA || !nodeA.nodeType) {
    // throws
    verifyNode(nodeA);
  } else if (!nodeB || !nodeB.nodeType) {
    // throws
    verifyNode(nodeB);
  } else if (nodeA.nodeType === ELEMENT_NODE &&
             nodeB.nodeType === ELEMENT_NODE) {
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
