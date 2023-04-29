/**
 * matcher.js
 */

import { isString } from './common.js';
import { parseSelector, walkAst } from './parser.js';
import {
  AN_PLUS_B, ATTRIBUTE_SELECTOR, CLASS_SELECTOR, COMBINATOR, IDENTIFIER,
  ID_SELECTOR, N_TH, PSEUDO_CLASS_SELECTOR, RAW, SELECTOR, SELECTOR_LIST,
  STRING, TYPE_SELECTOR
} from './constant.js';

/**
 * collect nth child
 * @param {object} node - element node
 * @param {object} opt - options
 * @param {number} opt.a - a
 * @param {number} opt.b - b
 * @param {boolean} [opt.reverse] - reverse order
 * @returns {Array.<object>} - collection of matched nodes
 */
export const collectNthChild = (node = {}, opt = {}) => {
  const { nodeType, parentNode } = node;
  const { a, b, reverse } = opt;
  const res = [];
  if (nodeType === Node.ELEMENT_NODE &&
      Number.isInteger(a) && Number.isInteger(b)) {
    const arr = Array.from(parentNode.children);
    if (reverse) {
      arr.reverse();
    }
    const l = arr.length;
    // :first-child, :last-child
    if (a === 0) {
      if (b >= 0 && b < l) {
        const item = arr[b];
        res.push(item);
      }
    // :nth-child()
    } else {
      let n = 0;
      let nth = b;
      while (nth < 0) {
        nth += (++n * a);
      }
      let i = 0;
      while (i < l && nth < l) {
        if (i === nth) {
          const item = arr[i];
          res.push(item);
          nth += a;
        }
        i++;
      }
    }
  }
  return res;
};

/**
 * collect nth of type
 * @param {object} node - element node
 * @param {object} opt - options
 * @param {number} opt.a - a
 * @param {number} opt.b - b
 * @param {boolean} [opt.reverse] - reverse order
 * @returns {Array.<object>} - collection of matched nodes
 */
export const collectNthOfType = (node = {}, opt = {}) => {
  const { localName, nodeType, parentNode, prefix } = node;
  const { a, b, reverse } = opt;
  const res = [];
  if (nodeType === Node.ELEMENT_NODE &&
      Number.isInteger(a) && Number.isInteger(b)) {
    const arr = Array.from(parentNode.children);
    if (reverse) {
      arr.reverse();
    }
    const l = arr.length;
    // :first-of-type, :last-of-type
    if (a === 0) {
      if (b >= 0 && b < l) {
        let i = 0;
        let j = 0;
        while (i < l) {
          const item = arr[i];
          const { localName: itemLocalName, prefix: itemPrefix } = item;
          if (itemLocalName === localName && itemPrefix === prefix) {
            if (j === b) {
              res.push(item);
              break;
            }
            j++;
          }
          i++;
        }
      }
    // :nth-of-type()
    } else {
      let nth = b;
      while (nth < 0) {
        nth += a;
      }
      let i = 0;
      let j = 0;
      while (i < l && nth < l) {
        const item = arr[i];
        const { localName: itemLocalName, prefix: itemPrefix } = item;
        if (itemLocalName === localName && itemPrefix === prefix) {
          if (j === nth) {
            res.push(item);
            nth += a;
          }
          j++;
        }
        i++;
      }
    }
  }
  return res;
};

/**
 * match type selector
 * @param {object} leaf - ast leaf
 * @param {object} node - element node
 * @returns {?object} - node if matched
 */
export const matchTypeSelector = (leaf = {}, node = {}) => {
  const { name: leafName, type: leafType } = leaf;
  const { localName, nodeType, prefix } = node;
  let res;
  if (leafType === TYPE_SELECTOR && nodeType === Node.ELEMENT_NODE) {
    // namespaced
    if (/\|/.test(leafName)) {
      const [leafPrefix, leafLocalName] = leafName.split('|');
      if (((leafPrefix === '' && !prefix) || // |E
           (leafPrefix === '*') || // *|E
           (leafPrefix === prefix)) && // ns|E
          (leafLocalName === '*' || leafLocalName === localName)) {
        res = node;
      }
    } else if (leafName === '*' || leafName === localName) {
      res = node;
    }
  }
  return res || null;
};

/**
 * match class selector
 * @param {object} leaf - ast leaf
 * @param {object} node - element node
 * @returns {?object} - node if matched
 */
export const matchClassSelector = (leaf = {}, node = {}) => {
  const { name: leafName, type: leafType } = leaf;
  const { classList, nodeType } = node;
  let res;
  if (leafType === CLASS_SELECTOR && nodeType === Node.ELEMENT_NODE &&
      classList.contains(leafName)) {
    res = node;
  }
  return res || null;
};

/**
 * match ID selector
 * @param {object} leaf - ast leaf
 * @param {object} node - element node
 * @returns {?object} - node if matched
 */
export const matchIdSelector = (leaf = {}, node = {}) => {
  const { name: leafName, type: leafType } = leaf;
  const { id, nodeType } = node;
  let res;
  if (leafType === ID_SELECTOR && nodeType === Node.ELEMENT_NODE &&
      leafName === id) {
    res = node;
  }
  return res || null;
};

/**
 * match attribute selector
 * @param {object} leaf - ast leaf
 * @param {object} node - element node
 * @returns {?object} - node if matched
 */
export const matchAttributeSelector = (leaf = {}, node = {}) => {
  const {
    flags: leafFlags, matcher: leafMatcher, name: leafName, type: leafType,
    value: leafValue
  } = leaf;
  const { attributes, nodeType } = node;
  let res;
  if (leafType === ATTRIBUTE_SELECTOR && nodeType === Node.ELEMENT_NODE &&
      attributes?.length) {
    const { name: leafAttrName } = leafName;
    const caseInsensitive = !(leafFlags && /^s$/i.test(leafFlags));
    const attrValues = [];
    const l = attributes.length;
    // namespaced
    if (/\|/.test(leafAttrName)) {
      const [leafAttrPrefix, leafAttrLocalName] = leafAttrName.split('|');
      let i = 0;
      while (i < l) {
        const { name: itemName, value: itemValue } = attributes.item(i);
        switch (leafAttrPrefix) {
          case '':
            if (leafAttrLocalName === itemName) {
              if (caseInsensitive) {
                attrValues.push(itemValue.toLowerCase());
              } else {
                attrValues.push(itemValue);
              }
            }
            break;
          case '*':
            if (/:/.test(itemName)) {
              if (itemName.endsWith(`:${leafAttrLocalName}`)) {
                if (caseInsensitive) {
                  attrValues.push(itemValue.toLowerCase());
                } else {
                  attrValues.push(itemValue);
                }
              }
            } else if (leafAttrLocalName === itemName) {
              if (caseInsensitive) {
                attrValues.push(itemValue.toLowerCase());
              } else {
                attrValues.push(itemValue);
              }
            }
            break;
          default:
            if (/:/.test(itemName)) {
              const [itemNamePrefix, itemNameLocalName] = itemName.split(':');
              if (leafAttrPrefix === itemNamePrefix &&
                  leafAttrLocalName === itemNameLocalName) {
                if (caseInsensitive) {
                  attrValues.push(itemValue.toLowerCase());
                } else {
                  attrValues.push(itemValue);
                }
              }
            }
        }
        i++;
      }
    } else {
      let i = 0;
      while (i < l) {
        const { name: itemName, value: itemValue } = attributes.item(i);
        if (/:/.test(itemName)) {
          const [, itemNameLocalName] = itemName.split(':');
          if (leafAttrName === itemNameLocalName) {
            if (caseInsensitive) {
              attrValues.push(itemValue.toLowerCase());
            } else {
              attrValues.push(itemValue);
            }
          }
        } else if (leafAttrName === itemName) {
          if (caseInsensitive) {
            attrValues.push(itemValue.toLowerCase());
          } else {
            attrValues.push(itemValue);
          }
        }
        i++;
      }
    }
    if (attrValues.length) {
      const {
        name: leafAttrIdentValue, value: leafAttrStringValue
      } = leafValue || {};
      let attrValue;
      if (leafAttrIdentValue) {
        if (caseInsensitive) {
          attrValue = leafAttrIdentValue.toLowerCase();
        } else {
          attrValue = leafAttrIdentValue;
        }
      } else if (leafAttrStringValue) {
        if (caseInsensitive) {
          attrValue = leafAttrStringValue.toLowerCase();
        } else {
          attrValue = leafAttrStringValue;
        }
      }
      switch (leafMatcher) {
        case null:
          res = node;
          break;
        case '=':
          if (attrValue && attrValues.includes(attrValue)) {
            res = node;
          }
          break;
        case '~=':
          if (attrValue) {
            for (const item of attrValues) {
              const arr = item.split(/\s+/);
              if (arr.includes(attrValue)) {
                res = node;
                break;
              }
            }
          }
          break;
        case '|=':
          if (attrValue) {
            for (const item of attrValues) {
              if (item === attrValue || item.startsWith(`${attrValue}-`)) {
                res = node;
                break;
              }
            }
          }
          break;
        case '^=':
          if (attrValue) {
            for (const item of attrValues) {
              if (item.startsWith(`${attrValue}`)) {
                res = node;
                break;
              }
            }
          }
          break;
        case '$=':
          if (attrValue) {
            for (const item of attrValues) {
              if (item.endsWith(`${attrValue}`)) {
                res = node;
                break;
              }
            }
          }
          break;
        case '*=':
          if (attrValue) {
            for (const item of attrValues) {
              if (item.includes(`${attrValue}`)) {
                res = node;
                break;
              }
            }
          }
          break;
        default:
          console.warn(`Unknown matcher ${leafMatcher}`);
      }
    }
  }
  return res || null;
};

/**
 * match An+B selector
 * @param {string} leafName - leaf name
 * @param {object} leaf - ast leaf
 * @param {object} node - element node
 * @returns {?Array} - collection of nodes if matched
 */
export const matchAnPlusBSelector = (leafName, leaf = {}, node = {}) => {
  let res;
  if (isString(leafName)) {
    leafName = leafName.trim();
    if (/^nth-(?:last-)?(?:child|of-type)$/.test(leafName)) {
      const {
        nth: {
          a,
          b,
          name: identName
        },
        selector: leafSelector,
        type: leafType
      } = leaf;
      const { nodeType } = node;
      if (leafType === N_TH && nodeType === Node.ELEMENT_NODE) {
        /*
        // TODO:
        // :nth-child(An+B of S)
        if (leafSelector) {
        } else {
        */
        if (!leafSelector) {
          const optMap = new Map();
          if (identName) {
            if (identName === 'even') {
              optMap.set('a', 2);
              optMap.set('b', 0);
            } else if (identName === 'odd') {
              optMap.set('a', 2);
              optMap.set('b', 1);
            }
            if (/last/.test(leafName)) {
              optMap.set('reverse', true);
            }
          } else if (/-?\d+/.test(a) && /-?\d+/.test(b)) {
            optMap.set('a', a * 1);
            optMap.set('b', b * 1);
            if (/last/.test(leafName)) {
              optMap.set('reverse', true);
            }
          }
          if (optMap.size > 1) {
            const opt = Object.fromEntries(optMap);
            if (/^nth-(?:last-)?child$/.test(leafName)) {
              res = collectNthChild(node, opt);
            } else if (/^nth-(?:last-)?of-type$/.test(leafName)) {
              res = collectNthOfType(node, opt);
            }
          }
        }
      }
    }
  }
  return res || null;
};

/**
 * match pseudo class selector
 * @param {object} leaf - ast leaf
 * @param {object} node - element node
 * @param {object} [refPoint] - reference point
 * @returns {?object} - node if matched
 */
export const matchPseudoClassSelector = (
  leaf = {},
  node = {},
  refPoint = {}
) => {
  const { children: leafChildren, name: leafName, type: leafType } = leaf;
  const { nodeType, ownerDocument } = node;
  let res;
  if (leafType === PSEUDO_CLASS_SELECTOR && nodeType === Node.ELEMENT_NODE) {
    if (Array.isArray(leafChildren)) {
      const [leafChildAst] = leafChildren;
      // :nth-child(), :nth-last-child(), nth-of-type(), :nth-last-of-type()
      if (/^nth-(?:last-)?(?:child|of-type)$/.test(leafName)) {
        res = matchAnPlusBSelector(leafName, leafChildAst, node);
      }
      // TODO: :not(), is(), :where(), :has(), etc.
    } else {
      const root = ownerDocument.documentElement;
      const docURL = new URL(ownerDocument.URL);
      switch (leafName) {
        case 'any-link':
        case 'link':
          // FIXME: what about namespaced href? e.g. xlink:href
          if (node.hasAttribute('href')) {
            res = node;
          }
          break;
        case 'local-link':
          if (node.hasAttribute('href')) {
            const attrURL = new URL(node.getAttribute('href'), docURL.href);
            if (attrURL.origin === docURL.origin &&
                attrURL.pathname === docURL.pathname) {
              res = node;
            }
          }
          break;
        case 'visited': // prevent fingerprinting
          break;
        case 'target':
          if (docURL.hash && node.id && docURL.hash === `#${node.id}`) {
            res = node;
          }
          break;
        case 'scope':
          if (refPoint?.nodeType === Node.ELEMENT_NODE) {
            res = refPoint;
          } else {
            res = root;
          }
          break;
        case 'focus':
          if (node === ownerDocument.activeElement) {
            res = node;
          }
          break;
        case 'open':
          if (node.hasAttribute('open')) {
            res = node;
          }
          break;
        case 'closed':
          // FIXME: is this really okay?
          if (!node.hasAttribute('open')) {
            res = node;
          }
          break;
        case 'disabled':
          if (node.hasAttribute('disabled')) {
            res = node;
          }
          break;
        case 'enabled':
          // FIXME: is this really okay?
          if (!node.hasAttribute('disabled')) {
            res = node;
          }
          break;
        case 'checked':
          if (node.checked) {
            res = node;
          }
          break;
        case 'required':
          if (node.required) {
            res = node;
          }
          break;
        case 'optional':
          // FIXME: is this really okay?
          if (!node.required) {
            res = node;
          }
          break;
        case 'root':
          res = root;
          break;
        case 'first-child':
          if (node === node.parentNode.firstElementChild) {
            res = node;
          }
          break;
        case 'last-child':
          if (node === node.parentNode.lastElementChild) {
            res = node;
          }
          break;
        case 'only-child':
          if (node === node.parentNode.firstElementChild &&
              node === node.parentNode.lastElementChild) {
            res = node;
          }
          break;
        case 'first-of-type': {
          const [node1] = collectNthOfType(node, {
            a: 0,
            b: 0
          });
          if (node1) {
            res = node1;
          }
          break;
        }
        case 'last-of-type': {
          const [node1] = collectNthOfType(node, {
            a: 0,
            b: 0,
            reverse: true
          });
          if (node1) {
            res = node1;
          }
          break;
        }
        case 'only-of-type': {
          const [node1] = collectNthOfType(node, {
            a: 0,
            b: 0
          });
          const [node2] = collectNthOfType(node, {
            a: 0,
            b: 0,
            reverse: true
          });
          if (node1 === node && node2 === node) {
            res = node;
          }
          break;
        }
        case 'active':
        case 'autofill':
        case 'blank':
        case 'buffering':
        case 'current':
        case 'default':
        case 'empty':
        case 'focus-visible':
        case 'focus-within':
        case 'fullscreen':
        case 'future':
        case 'hover':
        case 'indeterminate':
        case 'invalid':
        case 'in-range':
        case 'modal':
        case 'muted':
        case 'out-of-range':
        case 'past':
        case 'paused':
        case 'picture-in-picture':
        case 'placeholder-shown':
        case 'playing':
        case 'read-only':
        case 'read-write':
        case 'seeking':
        case 'stalled':
        case 'target-within':
        case 'user-invalid':
        case 'user-valid':
        case 'valid':
        case 'volume-locked':
          console.warn(`${leafName} pseudo class not supported`);
          break;
        default:
          console.warn(`Unknown pseudo class ${leafName}`);
      }
    }
  }
  return res || null;
};
