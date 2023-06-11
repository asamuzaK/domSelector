/**
 * matcher.js
 */
'use strict';

/* import */
const isCustomElementName = require('is-potential-custom-element-name');
const DOMException = require('./domexception.js');
const { generateCSS, parseSelector, walkAST } = require('./parser.js');

/* constants */
const {
  ATTRIBUTE_SELECTOR, CLASS_SELECTOR, COMBINATOR, IDENTIFIER, ID_SELECTOR,
  NTH, PSEUDO_CLASS_SELECTOR, PSEUDO_ELEMENT_SELECTOR, TYPE_SELECTOR
} = require('./constant.js');
const DOCUMENT_NODE = 9;
const DOCUMENT_FRAGMENT_NODE = 11;
const DOCUMENT_POSITION_CONTAINS = 8;
const DOCUMENT_POSITION_PRECEDING = 2;
const ELEMENT_NODE = 1;
const FILTER_ACCEPT = 1;
const FILTER_REJECT = 2;
const FILTER_SHOW_ELEMENT = 1;
const TEXT_NODE = 3;

/* regexp */
const DIR_VALUE = /^(?:auto|ltr|rtl)$/;
const HEX_CAPTURE = /^([\da-f]{1,6}\s?)/i;
const HTML_FORM_INPUT = /^(?:(?:inpu|selec)t|textarea)$/;
const HTML_FORM_PARTS = /^(?:button|fieldset|opt(?:group|ion))$/;
const HTML_INTERACT = /^d(?:etails|ialog)$/;
const INPUT_RANGE = /(?:(?:rang|tim)e|date(?:time-local)?|month|number|week)$/;
const INPUT_TEXT = /^(?:(?:emai|te|ur)l|password|search|text)$/;
const PSEUDO_FUNC = /^(?:(?:ha|i)s|not|where)$/;
const PSEUDO_NTH = /^nth-(?:last-)?(?:child|of-type)$/;
const WHITESPACE = /^[\n\r\f]/;

/**
 * is content editable
 * NOTE: not implemented in jsdom https://github.com/jsdom/jsdom/issues/1670
 * @param {object} node - Element
 * @returns {boolean} - result
 */
const isContentEditable = (node = {}) => {
  let res;
  if (node.nodeType === ELEMENT_NODE) {
    if (node.ownerDocument.designMode === 'on') {
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
const isNamespaceDeclared = (ns = '', node = {}) => {
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
 * is node descendant of root node
 * @param {object} node - Element node
 * @param {object} root - Element node
 * @returns {boolean} - result
 */
const isDescendant = (node = {}, root = {}) => {
  const { nodeType, ownerDocument } = node;
  let res;
  if (nodeType === ELEMENT_NODE && ownerDocument) {
    if (!root || root.nodeType !== ELEMENT_NODE) {
      root = ownerDocument.documentElement;
    }
    if (node === root) {
      res = true;
    } else if (root) {
      const posBit =
        node.compareDocumentPosition(root) & DOCUMENT_POSITION_CONTAINS;
      res = posBit;
    }
  }
  return !!res;
};

/**
 * factorial
 * @param {number} n - number
 * @returns {number} - n!
 */
const factorial = n => {
  let f;
  if (Number.isInteger(n) && n >= 0) {
    f = 1;
    for (let i = n; i > 0; i--) {
      f *= i;
    }
  }
  return f ?? null;
};

/**
 * unescape selector
 * @param {string} selector - CSS selector
 * @returns {?string} - unescaped selector
 */
const unescapeSelector = (selector = '') => {
  if (typeof selector === 'string' && selector.indexOf('\\', 0) >= 0) {
    const arr = selector.split('\\');
    const l = arr.length;
    for (let i = 1; i < l; i++) {
      let item = arr[i];
      if (i === l - 1 && item === '') {
        item = '\uFFFD';
      } else {
        const hexExists = HEX_CAPTURE.exec(item);
        if (hexExists) {
          const [, hex] = hexExists;
          let str;
          try {
            const low = parseInt('D800', 16);
            const high = parseInt('DFFF', 16);
            const deci = parseInt(hex, 16);
            if (deci === 0 || (deci >= low && deci <= high)) {
              str = '\uFFFD';
            } else {
              str = String.fromCodePoint(deci);
            }
          } catch (e) {
            str = '\uFFFD';
          }
          let postStr = '';
          if (item.length > hex.length) {
            postStr = item.substring(hex.length);
          }
          item = `${str}${postStr}`;
        } else if (WHITESPACE.test(item)) {
          item = '\\' + item;
        }
      }
      arr[i] = item;
    }
    selector = arr.join('');
  }
  return selector;
};

/**
 * create CSS selector for node
 * @param {object} node - Element node;
 * @returns {?string} - CSS selector
 */
const createSelectorForNode = (node = {}) => {
  let res;
  if (node.nodeType === ELEMENT_NODE) {
    res = node.localName;
    if (node.hasAttribute('id')) {
      res += `#${node.getAttribute('id')}`;
    }
    if (node.hasAttribute('class')) {
      const values = node.classList.values();
      for (const value of values) {
        res += `.${value}`;
      }
    }
  }
  return res ?? null;
};

/**
 * parse AST name
 * @param {string} name - AST name
 * @param {object} [node] - Element node
 * @returns {object} - parsed AST name
 */
const parseASTName = (name, node) => {
  let astPrefix, astNodeName;
  if (name && typeof name === 'string') {
    if (/\|/.test(name)) {
      [astPrefix, astNodeName] = name.split('|');
      if (astPrefix && astPrefix !== '*' &&
          node && !isNamespaceDeclared(astPrefix, node)) {
        throw new DOMException(`invalid selector ${name}`, 'SyntaxError');
      }
    } else {
      astPrefix = '*';
      astNodeName = name;
    }
  } else {
    throw new DOMException(`invalid selector ${name}`, 'SyntaxError');
  }
  return {
    astNodeName,
    astPrefix
  };
};

/**
 * collect nth child
 * @param {object} anb - An+B options
 * @param {number} anb.a - a
 * @param {number} anb.b - b
 * @param {boolean} [anb.reverse] - reverse order
 * @param {string} [anb.selector] - CSS selector
 * @param {object} node - Element node
 * @returns {object} - collection of matched nodes
 */
const collectNthChild = (anb = {}, node = {}) => {
  const { a, b, reverse, selector } = anb;
  const { nodeType, parentNode } = node;
  const matched = new Set();
  if (Number.isInteger(a) && Number.isInteger(b) &&
      nodeType === ELEMENT_NODE && parentNode) {
    const arr = [...parentNode.children];
    if (reverse) {
      arr.reverse();
    }
    const l = arr.length;
    let items;
    if (selector) {
      const ar = new Matcher(selector, parentNode).querySelectorAll();
      if (ar.length) {
        items = new Set(ar);
      }
    }
    // :first-child, :last-child, :nth-child(0 of S)
    if (a === 0) {
      if (b > 0 && b <= l) {
        if (items && items.size) {
          const nodes = new Set(arr);
          for (const current of nodes) {
            if (items.has(current)) {
              matched.add(current);
              break;
            }
          }
        } else {
          const current = arr[b - 1];
          matched.add(current);
        }
      }
    // :nth-child()
    } else {
      let n = 0;
      let nth = b - 1;
      if (a > 0) {
        while (nth < 0) {
          nth += (++n * a);
        }
      }
      if (nth >= 0 && nth < l) {
        let j = a > 0 ? 0 : b - 1;
        for (let i = 0; i < l && nth >= 0 && nth < l; i++) {
          const current = arr[i];
          if (items && items.size) {
            if (items.has(current)) {
              if (j === nth) {
                matched.add(current);
                nth += a;
              }
              if (a > 0) {
                j++;
              } else {
                j--;
              }
            }
          } else if (i === nth) {
            matched.add(current);
            nth += a;
          }
        }
      }
    }
  }
  return matched;
};

/**
 * collect nth of type
 * @param {object} anb - An+B options
 * @param {number} anb.a - a
 * @param {number} anb.b - b
 * @param {boolean} [anb.reverse] - reverse order
 * @param {object} node - Element node
 * @returns {object} - collection of matched nodes
 */
const collectNthOfType = (anb = {}, node = {}) => {
  const { a, b, reverse } = anb;
  const { localName, nodeType, parentNode, prefix } = node;
  const matched = new Set();
  if (Number.isInteger(a) && Number.isInteger(b) &&
      nodeType === ELEMENT_NODE && parentNode) {
    const arr = [...parentNode.children];
    if (reverse) {
      arr.reverse();
    }
    const l = arr.length;
    // :first-of-type, :last-of-type
    if (a === 0) {
      if (b > 0 && b <= l) {
        let j = 0;
        const nodes = new Set(arr);
        for (const current of nodes) {
          const { localName: itemLocalName, prefix: itemPrefix } = current;
          if (itemLocalName === localName && itemPrefix === prefix) {
            if (j === b - 1) {
              matched.add(current);
              break;
            }
            j++;
          }
        }
      }
    // :nth-of-type()
    } else {
      let nth = b - 1;
      if (a > 0) {
        while (nth < 0) {
          nth += a;
        }
      }
      if (nth >= 0 && nth < l) {
        let j = a > 0 ? 0 : b - 1;
        const nodes = new Set(arr);
        for (const current of nodes) {
          const { localName: itemLocalName, prefix: itemPrefix } = current;
          if (itemLocalName === localName && itemPrefix === prefix) {
            if (j === nth) {
              matched.add(current);
              nth += a;
            }
            if (nth < 0 || nth >= l) {
              break;
            } else if (a > 0) {
              j++;
            } else {
              j--;
            }
          }
        }
      }
    }
  }
  return matched;
};

/**
 * match An+B
 * @param {string} nthName - nth pseudo-class name
 * @param {object} ast - AST
 * @param {object} node - Element node
 * @returns {object} - collection of matched nodes
 */
const matchAnPlusB = (nthName, ast = { nth: {} }, node = {}) => {
  const {
    nth: {
      a,
      b,
      name: nthIdentName
    },
    selector: astSelector,
    type: astType
  } = ast;
  const identName = unescapeSelector(nthIdentName);
  const { nodeType, parentNode } = node;
  const matched = new Set();
  if (typeof nthName === 'string' && astType === NTH &&
      nodeType === ELEMENT_NODE && parentNode) {
    nthName = nthName.trim();
    if (PSEUDO_NTH.test(nthName)) {
      const anbMap = new Map();
      if (identName) {
        if (identName === 'even') {
          anbMap.set('a', 2);
          anbMap.set('b', 0);
        } else if (identName === 'odd') {
          anbMap.set('a', 2);
          anbMap.set('b', 1);
        }
        if (/last/.test(nthName)) {
          anbMap.set('reverse', true);
        }
      } else {
        if (typeof a === 'string' && /-?\d+/.test(a)) {
          anbMap.set('a', a * 1);
        } else {
          anbMap.set('a', 0);
        }
        if (typeof b === 'string' && /-?\d+/.test(b)) {
          anbMap.set('b', b * 1);
        } else {
          anbMap.set('b', 0);
        }
        if (/last/.test(nthName)) {
          anbMap.set('reverse', true);
        }
      }
      if (anbMap.has('a') && anbMap.has('b')) {
        if (/^nth-(?:last-)?child$/.test(nthName)) {
          if (astSelector) {
            const css = generateCSS(astSelector);
            anbMap.set('selector', css);
          }
          const anb = Object.fromEntries(anbMap);
          const nodes = collectNthChild(anb, node);
          if (nodes.size) {
            nodes.forEach(item => matched.add(item));
          }
        } else if (/^nth-(?:last-)?of-type$/.test(nthName)) {
          const anb = Object.fromEntries(anbMap);
          const nodes = collectNthOfType(anb, node);
          if (nodes.size) {
            nodes.forEach(item => matched.add(item));
          }
        }
      }
    }
  }
  return matched;
};

/**
 * match combinator
 * @param {object} combo - combinator
 * @param {object} prevNodes - collection of Element nodes
 * @param {object} nextNodes - collection of Element nodes
 * @returns {object} - collection of matched nodes
 */
const matchCombinator = (combo = {}, prevNodes = {}, nextNodes = {}) => {
  const { name: comboName, type: comboType } = combo;
  const matched = new Set();
  if (comboType === COMBINATOR && /^[ >+~]$/.test(comboName) &&
      prevNodes instanceof Set && nextNodes instanceof Set) {
    for (const node of nextNodes) {
      if (node.nodeType === ELEMENT_NODE) {
        switch (comboName) {
          case '+': {
            const refNode = node.previousElementSibling;
            if (refNode && prevNodes.has(refNode)) {
              matched.add(node);
            }
            break;
          }
          case '~': {
            let refNode = node.previousElementSibling;
            while (refNode) {
              if (refNode && prevNodes.has(refNode)) {
                matched.add(node);
                break;
              }
              refNode = refNode.previousElementSibling;
            }
            break;
          }
          case '>': {
            const refNode = node.parentNode;
            if (refNode && prevNodes.has(refNode)) {
              matched.add(node);
            }
            break;
          }
          case ' ':
          default: {
            let refNode = node.parentNode;
            while (refNode) {
              if (refNode && prevNodes.has(refNode)) {
                matched.add(node);
                break;
              }
              refNode = refNode.parentNode;
            }
          }
        }
      }
    }
  }
  return matched;
};

/**
 * match type selector
 * @param {object} ast - AST
 * @param {object} node - Element node
 * @returns {?object} - matched node
 */
const matchTypeSelector = (ast = {}, node = {}) => {
  const { type: astType } = ast;
  const { localName, nodeType, ownerDocument, prefix } = node;
  let res;
  if (astType === TYPE_SELECTOR && nodeType === ELEMENT_NODE) {
    const astName = unescapeSelector(ast.name);
    let { astPrefix, astNodeName } = parseASTName(astName, node);
    if (ownerDocument?.contentType === 'text/html') {
      astPrefix = astPrefix.toLowerCase();
      astNodeName = astNodeName.toLowerCase();
    }
    let nodePrefix, nodeName;
    // just in case that the namespaced content is parsed as text/html
    if (/:/.test(localName)) {
      [nodePrefix, nodeName] = localName.split(':');
    } else {
      nodePrefix = prefix || '';
      nodeName = localName;
    }
    if (astPrefix === '' && nodePrefix === '') {
      if (node.namespaceURI === null &&
          (astNodeName === '*' || astNodeName === nodeName)) {
        res = node;
      }
    } else if (astPrefix === '*') {
      if (astNodeName === '*' || astNodeName === nodeName) {
        res = node;
      }
    } else if (astPrefix === nodePrefix) {
      if (astNodeName === '*' || astNodeName === nodeName) {
        res = node;
      }
    }
  }
  return res ?? null;
};

/**
 * match class selector
 * @param {object} ast - AST
 * @param {object} node - Element node
 * @returns {?object} - matched node
 */
const matchClassSelector = (ast = {}, node = {}) => {
  const { type: astType } = ast;
  const { classList, nodeType } = node;
  let res;
  if (astType === CLASS_SELECTOR && nodeType === ELEMENT_NODE) {
    const astName = unescapeSelector(ast.name);
    if (classList.contains(astName)) {
      res = node;
    }
  }
  return res ?? null;
};

/**
 * match ID selector
 * @param {object} ast - AST
 * @param {object} node - Element node
 * @returns {?object} - matched node
 */
const matchIDSelector = (ast = {}, node = {}) => {
  const { type: astType } = ast;
  const { id, nodeType } = node;
  let res;
  if (astType === ID_SELECTOR && nodeType === ELEMENT_NODE) {
    const astName = unescapeSelector(ast.name);
    if (astName === id) {
      res = node;
    }
  }
  return res ?? null;
};

/**
 * match attribute selector
 * @param {object} ast - AST
 * @param {object} node - Element node
 * @returns {?object} - matched node
 */
const matchAttributeSelector = (ast = {}, node = {}) => {
  const {
    flags: astFlags, matcher: astMatcher, name: astName, type: astType,
    value: astValue
  } = ast;
  if (typeof astFlags === 'string' && !/^[is]$/i.test(astFlags)) {
    throw new DOMException('invalid attribute selector', 'SyntaxError');
  }
  const { attributes, nodeType, ownerDocument } = node;
  let res;
  if (astType === ATTRIBUTE_SELECTOR && nodeType === ELEMENT_NODE &&
      attributes.length) {
    let { name: astAttrName } = astName;
    astAttrName = unescapeSelector(astAttrName);
    let caseInsensitive;
    if (ownerDocument?.contentType === 'text/html') {
      if (typeof astFlags === 'string' && /^s$/i.test(astFlags)) {
        caseInsensitive = false;
      } else {
        caseInsensitive = true;
      }
    } else if (typeof astFlags === 'string' && /^i$/i.test(astFlags)) {
      caseInsensitive = true;
    } else {
      caseInsensitive = false;
    }
    if (caseInsensitive) {
      astAttrName = astAttrName.toLowerCase();
    }
    const attrs = [...attributes];
    const attrValues = new Set();
    // namespaced
    if (/\|/.test(astAttrName)) {
      const {
        astPrefix: astAttrPrefix, astNodeName: astAttrLocalName
      } = parseASTName(astAttrName);
      for (const attr of attrs) {
        let { name: itemName, value: itemValue } = attr;
        if (caseInsensitive) {
          itemName = itemName.toLowerCase();
          itemValue = itemValue.toLowerCase();
        }
        switch (astAttrPrefix) {
          case '': {
            if (astAttrLocalName === itemName) {
              attrValues.add(itemValue);
            }
            break;
          }
          case '*': {
            if (/:/.test(itemName)) {
              if (itemName.endsWith(`:${astAttrLocalName}`)) {
                attrValues.add(itemValue);
              }
            } else if (astAttrLocalName === itemName) {
              attrValues.add(itemValue);
            }
            break;
          }
          default: {
            if (/:/.test(itemName)) {
              const [itemNamePrefix, itemNameLocalName] = itemName.split(':');
              if (astAttrPrefix === itemNamePrefix &&
                  astAttrLocalName === itemNameLocalName) {
                attrValues.add(itemValue);
              }
            }
          }
        }
      }
    } else {
      for (const attr of attrs) {
        let { name: itemName, value: itemValue } = attr;
        if (caseInsensitive) {
          itemName = itemName.toLowerCase();
          itemValue = itemValue.toLowerCase();
        }
        if (/:/.test(itemName)) {
          const [, itemNameLocalName] = itemName.split(':');
          if (astAttrName === itemNameLocalName) {
            attrValues.add(itemValue);
          }
        } else if (astAttrName === itemName) {
          attrValues.add(itemValue);
        }
      }
    }
    if (attrValues.size) {
      const {
        name: astAttrIdentValue, value: astAttrStringValue
      } = astValue || {};
      let attrValue;
      if (astAttrIdentValue) {
        if (caseInsensitive) {
          attrValue = astAttrIdentValue.toLowerCase();
        } else {
          attrValue = astAttrIdentValue;
        }
      } else if (astAttrStringValue) {
        if (caseInsensitive) {
          attrValue = astAttrStringValue.toLowerCase();
        } else {
          attrValue = astAttrStringValue;
        }
      } else if (astAttrStringValue === '') {
        attrValue = astAttrStringValue;
      }
      switch (astMatcher) {
        case null: {
          res = node;
          break;
        }
        case '=': {
          if (typeof attrValue === 'string' && attrValues.has(attrValue)) {
            res = node;
          }
          break;
        }
        case '~=': {
          if (attrValue && typeof attrValue === 'string') {
            for (const value of attrValues) {
              const item = new Set(value.split(/\s+/));
              if (item.has(attrValue)) {
                res = node;
                break;
              }
            }
          }
          break;
        }
        case '|=': {
          if (attrValue && typeof attrValue === 'string') {
            let item;
            for (const value of attrValues) {
              if (value === attrValue || value.startsWith(`${attrValue}-`)) {
                item = value;
                break;
              }
            }
            if (item) {
              res = node;
            }
          }
          break;
        }
        case '^=': {
          if (attrValue && typeof attrValue === 'string') {
            let item;
            for (const value of attrValues) {
              if (value.startsWith(`${attrValue}`)) {
                item = value;
                break;
              }
            }
            if (item) {
              res = node;
            }
          }
          break;
        }
        case '$=': {
          if (attrValue && typeof attrValue === 'string') {
            let item;
            for (const value of attrValues) {
              if (value.endsWith(`${attrValue}`)) {
                item = value;
                break;
              }
            }
            if (item) {
              res = node;
            }
          }
          break;
        }
        case '*=': {
          if (attrValue && typeof attrValue === 'string') {
            let item;
            for (const value of attrValues) {
              if (value.includes(`${attrValue}`)) {
                item = value;
                break;
              }
            }
            if (item) {
              res = node;
            }
          }
          break;
        }
        default: {
          throw new DOMException(`Unknown matcher ${astMatcher}`,
            'SyntaxError');
        }
      }
    }
  }
  return res ?? null;
};

/**
 * match logical pseudo-class functions - :is(), :has(), :not(), :where()
 * @param {object} ast - AST
 * @param {object} node - Element node
 * @param {object} refPoint - reference point
 * @returns {?object} - matched node
 */
const matchLogicalPseudoFunc = (ast = {}, node = {}, refPoint = {}) => {
  const { type: astType } = ast;
  const astName = unescapeSelector(ast.name);
  let res;
  if (astType === PSEUDO_CLASS_SELECTOR && PSEUDO_FUNC.test(astName) &&
      node.nodeType === ELEMENT_NODE) {
    let refPointSelector = '';
    if (refPoint.nodeType === ELEMENT_NODE) {
      refPointSelector = createSelectorForNode(refPoint);
    }
    const branchSelectors = new Set();
    const branches = new Set(walkAST(ast));
    for (const branch of branches) {
      const [leaf, ...leaves] = branch;
      let css = generateCSS(leaf);
      if (css) {
        if (astName === 'has' && /^[>+~]$/.test(css)) {
          css = '';
        }
        const items = new Set(leaves);
        items.forEach(item => {
          let itemCss = generateCSS(item);
          if (itemCss) {
            if (/:scope/.test(itemCss) && refPointSelector) {
              itemCss = itemCss.replace(/:scope/g, refPointSelector);
            }
            css += itemCss;
          }
        });
        branchSelectors.add(css);
      }
    }
    const branchSelector = [...branchSelectors].join(',');
    let refNode;
    if (node.parentNode) {
      refNode = node.parentNode;
    } else {
      refNode = node;
    }
    const nodes =
      new Set(new Matcher(branchSelector, refNode).querySelectorAll());
    switch (astName) {
      // :has()
      case 'has': {
        let matched;
        if (/:has\(/.test(branchSelector)) {
          matched = false;
        } else if (nodes.size) {
          for (const branch of branches) {
            const [leaf] = branch;
            let combo;
            if (leaf.type === COMBINATOR) {
              combo = leaf;
            } else {
              combo = {
                name: ' ',
                type: COMBINATOR
              };
            }
            const n = matchCombinator(combo, new Set([node]), new Set(nodes));
            if (n.size) {
              matched = true;
              break;
            }
          }
        }
        if (matched) {
          res = node;
        }
        break;
      }
      // :not()
      case 'not': {
        let matched;
        // NOTE: according to MDN, :not() can not contain :not()
        // but spec says nothing about that?
        if (/:not\(/.test(branchSelector)) {
          matched = true;
        } else if (nodes.size) {
          for (const n of nodes) {
            if (n === node) {
              matched = true;
              break;
            }
          }
        }
        if (!matched) {
          res = node;
        }
        break;
      }
      // :is(), :where()
      case 'is':
      case 'where':
      default: {
        let matched;
        if (nodes.size) {
          for (const n of nodes) {
            if (n === node) {
              matched = true;
              break;
            }
          }
        }
        if (matched) {
          res = node;
        }
      }
    }
  }
  return res ?? null;
};

/**
 * match directionality pseudo-class - :dir()
 * @see https://html.spec.whatwg.org/multipage/dom.html#the-dir-attribute
 * @param {object} ast - AST
 * @param {object} node - Element node
 * @returns {?object} - matched node
 */
const matchDirectionPseudoClass = (ast = {}, node = {}) => {
  const { type: astType } = ast;
  const { dir: nodeDir, localName, nodeType, type: inputType } = node;
  let res;
  if (astType === IDENTIFIER && nodeType === ELEMENT_NODE &&
      isDescendant(node)) {
    const astName = unescapeSelector(ast.name);
    let dir;
    if (/^(?:ltr|rtl)$/.test(nodeDir)) {
      dir = nodeDir;
    } else if ((node === node.ownerDocument.documentElement ||
                (localName === 'input' && inputType === 'tel')) &&
               !(nodeDir && DIR_VALUE.test(nodeDir))) {
      dir = 'ltr';
    // FIXME:
    } else if (nodeDir === 'auto' &&
               (localName === 'textarea' ||
                (localName === 'input' &&
                 (!inputType ||
                  /^(?:(?:emai|te|ur)l|search|text)$/.test(inputType))))) {
      throw new DOMException('Unsupported pseudo-class :dir()',
        'NotSupportedError');
    // FIXME:
    } else if (nodeDir === 'auto' || (localName === 'bdi' && !nodeDir)) {
      throw new DOMException('Unsupported pseudo-class :dir()',
        'NotSupportedError');
    } else if (!nodeDir) {
      let parent = node.parentNode;
      while (parent) {
        const { dir: parentDir } = parent;
        if (parent === node.ownerDocument.documentElement) {
          if (parentDir) {
            dir = parentDir;
          } else {
            dir = 'ltr';
          }
          break;
        } else if (parentDir && /^(?:ltr|rtl)$/.test(parentDir)) {
          dir = parentDir;
          break;
        }
        parent = parent.parentNode;
      }
    }
    if (dir === astName) {
      res = node;
    }
  }
  return res ?? null;
};

/**
 * match language pseudo-class - :lang()
 * @see https://datatracker.ietf.org/doc/html/rfc4647#section-3.3.1
 * @param {object} ast - AST
 * @param {object} node - Element node
 * @returns {?object} - matched node
 */
const matchLanguagePseudoClass = (ast = {}, node = {}) => {
  const { type: astType } = ast;
  const { lang, nodeType } = node;
  let res;
  if (astType === IDENTIFIER && nodeType === ELEMENT_NODE) {
    const astName = unescapeSelector(ast.name);
    // TBD: what about xml:lang?
    if (astName === '') {
      if (node.getAttribute('lang') === '') {
        res = node;
      }
    } else if (astName === '*') {
      if (!node.hasAttribute('lang')) {
        res = node;
      }
    } else if (/[A-Za-z\d-]+/.test(astName)) {
      const codePart = '(?:-[A-Za-z\\d]+)?';
      let reg;
      if (/-/.test(astName)) {
        const [langMain, langSub, ...langRest] = astName.split('-');
        const extendedMain = `${langMain}${codePart}`;
        const extendedSub = `-${langSub}${codePart}`;
        const l = langRest.length;
        let extendedRest = '';
        if (l) {
          for (let i = 0; i < l; i++) {
            extendedRest += `-${langRest[i]}${codePart}`;
          }
        }
        reg = new RegExp(`^${extendedMain}${extendedSub}${extendedRest}$`, 'i');
      } else {
        reg = new RegExp(`^${astName}${codePart}$`, 'i');
      }
      if (lang) {
        if (reg.test(lang)) {
          res = node;
        }
      } else {
        let target = node;
        while (target.parentNode) {
          if (reg.test(target.lang)) {
            res = node;
            break;
          }
          target = target.parentNode;
        }
      }
    }
  }
  return res ?? null;
};

/**
 * match pseudo-class selector
 * @see https://html.spec.whatwg.org/#pseudo-classes
 * @param {object} ast - AST
 * @param {object} node - Element node
 * @param {object} refPoint - reference point
 * @returns {object} - collection of matched nodes
 */
const matchPseudoClassSelector = (
  ast = {},
  node = {},
  refPoint = {}
) => {
  const { children: astChildren, type: astType } = ast;
  const { localName, nodeType, ownerDocument, parentNode } = node;
  const matched = new Set();
  if (astType === PSEUDO_CLASS_SELECTOR && nodeType === ELEMENT_NODE) {
    const astName = unescapeSelector(ast.name);
    if (Array.isArray(astChildren)) {
      const [branch] = astChildren;
      // :has(), :is(), :not(), :where()
      if (PSEUDO_FUNC.test(astName)) {
        const res = matchLogicalPseudoFunc(ast, node, refPoint);
        if (res) {
          matched.add(res);
        }
      // :nth-child(), :nth-last-child(), nth-of-type(), :nth-last-of-type()
      } else if (PSEUDO_NTH.test(astName)) {
        const nodes = matchAnPlusB(astName, branch, node);
        if (nodes.size) {
          nodes.forEach(item => matched.add(item));
        }
      // :dir()
      } else if (astName === 'dir') {
        const res = matchDirectionPseudoClass(branch, node);
        if (res) {
          matched.add(res);
        }
      // :lang()
      } else if (astName === 'lang') {
        const res = matchLanguagePseudoClass(branch, node);
        if (res) {
          matched.add(res);
        }
      } else {
        switch (astName) {
          case 'current':
          case 'nth-col':
          case 'nth-last-col':
            throw new DOMException(`Unsupported pseudo-class :${astName}()`,
              'NotSupportedError');
          default:
            throw new DOMException(`Unknown pseudo-class :${astName}()`,
              'SyntaxError');
        }
      }
    } else {
      const root = ownerDocument.documentElement;
      const docURL = new URL(ownerDocument.URL);
      switch (astName) {
        case 'any-link':
        case 'link': {
          if (/^a(?:rea)?$/.test(localName) && node.hasAttribute('href')) {
            matched.add(node);
          }
          break;
        }
        case 'local-link': {
          if (/^a(?:rea)?$/.test(localName) && node.hasAttribute('href')) {
            const attrURL = new URL(node.getAttribute('href'), docURL.href);
            if (attrURL.origin === docURL.origin &&
                attrURL.pathname === docURL.pathname) {
              matched.add(node);
            }
          }
          break;
        }
        case 'visited': {
          // prevent fingerprinting
          break;
        }
        case 'target': {
          if (isDescendant(node) && docURL.hash &&
              node.id && docURL.hash === `#${node.id}`) {
            matched.add(node);
          }
          break;
        }
        case 'target-within': {
          if (docURL.hash) {
            const hash = docURL.hash.replace(/^#/, '');
            let current = ownerDocument.getElementById(hash);
            while (current) {
              if (current === node) {
                matched.add(node);
                break;
              }
              current = current.parentNode;
            }
          }
          break;
        }
        case 'scope': {
          if (refPoint.nodeType === ELEMENT_NODE) {
            if (node === refPoint) {
              matched.add(node);
            }
          } else if (node === root) {
            matched.add(node);
          }
          break;
        }
        case 'focus': {
          if (node === ownerDocument.activeElement) {
            matched.add(node);
          }
          break;
        }
        case 'focus-within': {
          let current = ownerDocument.activeElement;
          while (current) {
            if (current === node) {
              matched.add(node);
              break;
            }
            current = current.parentNode;
          }
          break;
        }
        case 'open': {
          if (HTML_INTERACT.test(localName) && node.hasAttribute('open')) {
            matched.add(node);
          }
          break;
        }
        case 'closed': {
          if (HTML_INTERACT.test(localName) && !node.hasAttribute('open')) {
            matched.add(node);
          }
          break;
        }
        case 'disabled': {
          if (HTML_FORM_INPUT.test(localName) ||
              HTML_FORM_PARTS.test(localName) ||
              isCustomElementName(localName)) {
            if (node.disabled || node.hasAttribute('disabled')) {
              matched.add(node);
            } else {
              let parent = parentNode;
              while (parent) {
                if (parent.localName === 'fieldset') {
                  break;
                }
                parent = parent.parentNode;
              }
              if (parent && parent.hasAttribute('disabled') &&
                  parentNode.localName !== 'legend') {
                matched.add(node);
              }
            }
          }
          break;
        }
        case 'enabled': {
          if ((HTML_FORM_INPUT.test(localName) ||
               HTML_FORM_PARTS.test(localName) ||
               isCustomElementName(localName)) &&
              !(node.disabled && node.hasAttribute('disabled'))) {
            matched.add(node);
          }
          break;
        }
        case 'read-only': {
          if (/^(?:input|textarea)$/.test(localName)) {
            let targetNode;
            if (localName === 'input') {
              if (node.hasAttribute('type')) {
                const inputType = node.getAttribute('type');
                if (INPUT_TEXT.test(inputType)) {
                  targetNode = node;
                } else if (INPUT_RANGE.test(inputType) &&
                           inputType !== 'range') {
                  targetNode = node;
                }
              } else {
                targetNode = node;
              }
            } else if (localName === 'textarea') {
              targetNode = node;
            }
            if (targetNode) {
              if (node.readonly || node.hasAttribute('readonly') ||
                  node.disabled || node.hasAttribute('disabled')) {
                matched.add(node);
              }
            }
          } else if (!isContentEditable(node)) {
            matched.add(node);
          }
          break;
        }
        case 'read-write': {
          if (/^(?:input|textarea)$/.test(localName)) {
            let targetNode;
            if (localName === 'input') {
              if (node.hasAttribute('type')) {
                const inputType = node.getAttribute('type');
                if (INPUT_TEXT.test(inputType)) {
                  targetNode = node;
                } else if (INPUT_RANGE.test(inputType) &&
                           inputType !== 'range') {
                  targetNode = node;
                }
              } else {
                targetNode = node;
              }
            } else if (localName === 'textarea') {
              targetNode = node;
            }
            if (targetNode) {
              if (!(node.readonly || node.hasAttribute('readonly') ||
                    node.disabled || node.hasAttribute('disabled'))) {
                matched.add(node);
              }
            }
          } else if (isContentEditable(node)) {
            matched.add(node);
          }
          break;
        }
        case 'placeholder-shown': {
          let targetNode;
          if (localName === 'input') {
            if (node.hasAttribute('type')) {
              if (INPUT_TEXT.test(node.getAttribute('type')) ||
                  node.getAttribute('type') === 'number') {
                targetNode = node;
              }
            } else {
              targetNode = node;
            }
          } else if (localName === 'textarea') {
            targetNode = node;
          }
          if (targetNode && node.hasAttribute('placeholder') &&
              node.getAttribute('placeholder').trim().length &&
              node.value === '') {
            matched.add(node);
          }
          break;
        }
        case 'checked': {
          if ((localName === 'input' && node.hasAttribute('type') &&
               /^(?:checkbox|radio)$/.test(node.getAttribute('type')) &&
               node.checked) ||
              (localName === 'option' && node.selected)) {
            matched.add(node);
          }
          break;
        }
        case 'indeterminate': {
          if ((localName === 'input' && node.type === 'checkbox' &&
               node.indeterminate) ||
              (localName === 'progress' && !node.hasAttribute('value'))) {
            matched.add(node);
          } else if (localName === 'input' && node.type === 'radio' &&
                     !node.hasAttribute('checked')) {
            const nodeName = node.name;
            let sel;
            if (nodeName) {
              sel = `input[type="radio"][name="${nodeName}"]`;
            } else {
              sel = 'input[type="radio"]';
            }
            let parent = node.parentNode;
            while (parent) {
              if (parent.localName === 'form') {
                break;
              }
              parent = parent.parentNode;
            }
            if (!parent) {
              parent = root;
            }
            const nodes = new Set(new Matcher(sel, parent).querySelectorAll());
            let checked;
            for (const item of nodes) {
              if (nodeName) {
                checked = !!item.checked;
              } else if (!item.hasAttribute('name')) {
                checked = !!item.checked;
              }
              if (checked) {
                break;
              }
            }
            if (!checked) {
              matched.add(node);
            }
          }
          break;
        }
        case 'default': {
          // button[type="submit"], input[type="submit"], input[type="image"]
          if ((localName === 'button' &&
               !(node.hasAttribute('type') &&
                 /^(?:button|reset)$/.test(node.getAttribute('type')))) ||
              (localName === 'input' && node.hasAttribute('type') &&
               /^(?:image|submit)$/.test(node.getAttribute('type')))) {
            let form = node.parentNode;
            while (form) {
              if (form.localName === 'form') {
                break;
              }
              form = form.parentNode;
            }
            if (form) {
              const iterator = node.ownerDocument.createNodeIterator(
                form,
                FILTER_SHOW_ELEMENT,
                n => {
                  const nodeName = n.localName;
                  let m;
                  if (nodeName === 'button') {
                    m = !(n.hasAttribute('type') &&
                          /^(?:button|reset)$/.test(n.getAttribute('type')));
                  } else if (nodeName === 'input') {
                    m = n.hasAttribute('type') &&
                      /^(?:image|submit)$/.test(n.getAttribute('type'));
                  }
                  return m ? FILTER_ACCEPT : FILTER_REJECT;
                }
              );
              const nextNode = iterator.nextNode();
              if (nextNode === node) {
                matched.add(node);
              }
            }
          // input[type="checkbox"], input[type="radio"]
          } else if (localName === 'input' && node.hasAttribute('type') &&
                     /^(?:checkbox|radio)$/.test(node.getAttribute('type')) &&
                     node.hasAttribute('checked')) {
            matched.add(node);
          // option
          } else if (localName === 'option') {
            let isMultiple = false;
            let parent = parentNode;
            while (parent) {
              if (parent.localName === 'datalist') {
                break;
              } else if (parent.localName === 'select') {
                isMultiple = !!parent.multiple;
                break;
              }
              parent = parent.parentNode;
            }
            // FIXME:
            if (isMultiple) {
              throw new DOMException(`Unsupported pseudo-class :${astName}`,
                'NotSupportedError');
            } else {
              const firstOpt = parentNode.firstElementChild;
              const defaultOpt = new Set();
              let opt = firstOpt;
              while (opt) {
                if (opt.hasAttribute('selected')) {
                  defaultOpt.add(opt);
                  break;
                }
                opt = opt.nextElementSibling;
              }
              if (!defaultOpt.size) {
                defaultOpt.add(firstOpt);
              }
              if (defaultOpt.has(node)) {
                matched.add(node);
              }
            }
          }
          break;
        }
        case 'valid': {
          if (HTML_FORM_INPUT.test(localName) ||
              /^(?:f(?:ieldset|orm)|button)$/.test(localName)) {
            if (node.checkValidity()) {
              matched.add(node);
            }
          }
          break;
        }
        case 'invalid': {
          if (HTML_FORM_INPUT.test(localName) ||
              /^(?:f(?:ieldset|orm)|button)$/.test(localName)) {
            if (!node.checkValidity()) {
              matched.add(node);
            }
          }
          break;
        }
        case 'in-range': {
          if (localName === 'input' &&
              !(node.readonly || node.hasAttribute('readonly')) &&
              !(node.disabled || node.hasAttribute('disabled')) &&
              node.hasAttribute('type') &&
              INPUT_RANGE.test(node.getAttribute('type')) &&
              !(node.validity.rangeUnderflow || node.validity.rangeOverflow) &&
              (node.hasAttribute('min') || node.hasAttribute('max') ||
               node.getAttribute('type') === 'range')) {
            matched.add(node);
          }
          break;
        }
        case 'out-of-range': {
          if (localName === 'input' &&
              !(node.readonly || node.hasAttribute('readonly')) &&
              !(node.disabled || node.hasAttribute('disabled')) &&
              node.hasAttribute('type') &&
              INPUT_RANGE.test(node.getAttribute('type')) &&
              (node.validity.rangeUnderflow || node.validity.rangeOverflow)) {
            matched.add(node);
          }
          break;
        }
        case 'required': {
          let targetNode;
          if (localName === 'input') {
            if (node.hasAttribute('type')) {
              const inputType = node.getAttribute('type');
              if (INPUT_TEXT.test(inputType)) {
                targetNode = node;
              } else if (INPUT_RANGE.test(inputType) && inputType !== 'range') {
                targetNode = node;
              } else if (inputType === 'checkbox' || inputType === 'radio' ||
                         inputType === 'file') {
                targetNode = node;
              }
            } else {
              targetNode = node;
            }
          } else if (/^(?:select|textarea)$/.test(localName)) {
            targetNode = node;
          }
          if (targetNode && (node.required || node.hasAttribute('required'))) {
            matched.add(node);
          }
          break;
        }
        case 'optional': {
          let targetNode;
          if (localName === 'input') {
            if (node.hasAttribute('type')) {
              const inputType = node.getAttribute('type');
              if (INPUT_TEXT.test(inputType)) {
                targetNode = node;
              } else if (INPUT_RANGE.test(inputType) && inputType !== 'range') {
                targetNode = node;
              } else if (inputType === 'checkbox' || inputType === 'radio' ||
                         inputType === 'file') {
                targetNode = node;
              }
            } else {
              targetNode = node;
            }
          } else if (/^(?:select|textarea)$/.test(localName)) {
            targetNode = node;
          }
          if (targetNode && !(node.required || node.hasAttribute('required'))) {
            matched.add(node);
          }
          break;
        }
        case 'root': {
          if (node === root) {
            matched.add(node);
          }
          break;
        }
        case 'empty': {
          if (node.hasChildNodes()) {
            const nodes = node.childNodes.values();
            let bool;
            for (const n of nodes) {
              bool = n.nodeType !== ELEMENT_NODE && n.nodeType !== TEXT_NODE;
              if (!bool) {
                break;
              }
            }
            if (bool) {
              matched.add(node);
            }
          } else {
            matched.add(node);
          }
          break;
        }
        case 'first-child': {
          if (parentNode && node === parentNode.firstElementChild) {
            matched.add(node);
          }
          break;
        }
        case 'last-child': {
          if (parentNode && node === parentNode.lastElementChild) {
            matched.add(node);
          }
          break;
        }
        case 'only-child': {
          if (parentNode && node === parentNode.firstElementChild &&
              node === parentNode.lastElementChild) {
            matched.add(node);
          }
          break;
        }
        case 'first-of-type': {
          if (parentNode) {
            const [node1] = collectNthOfType({
              a: 0,
              b: 1
            }, node);
            if (node1) {
              matched.add(node1);
            }
          }
          break;
        }
        case 'last-of-type': {
          if (parentNode) {
            const [node1] = collectNthOfType({
              a: 0,
              b: 1,
              reverse: true
            }, node);
            if (node1) {
              matched.add(node1);
            }
          }
          break;
        }
        case 'only-of-type': {
          if (parentNode) {
            const [node1] = collectNthOfType({
              a: 0,
              b: 1
            }, node);
            const [node2] = collectNthOfType({
              a: 0,
              b: 1,
              reverse: true
            }, node);
            if (node1 === node && node2 === node) {
              matched.add(node);
            }
          }
          break;
        }
        // legacy pseudo-elements
        case 'after':
        case 'before':
        case 'first-letter':
        case 'first-line': {
          throw new DOMException(`Unsupported pseudo-element ::${astName}`,
            'NotSupportedError');
        }
        case 'active':
        case 'autofill':
        case 'blank':
        case 'buffering':
        case 'current':
        case 'focus-visible':
        case 'fullscreen':
        case 'future':
        case 'hover':
        case 'modal':
        case 'muted':
        case 'past':
        case 'paused':
        case 'picture-in-picture':
        case 'playing':
        case 'seeking':
        case 'stalled':
        case 'user-invalid':
        case 'user-valid':
        case 'volume-locked':
        case '-webkit-autofill': {
          throw new DOMException(`Unsupported pseudo-class :${astName}`,
            'NotSupportedError');
        }
        default: {
          throw new DOMException(`Unknown pseudo-class :${astName}`,
            'SyntaxError');
        }
      }
    }
  }
  return matched;
};

/**
 * match pseudo-element selector
 * NOTE: throws DOMException
 * @param {object} ast - AST
 * @param {object} node - Element node
 * @returns {void}
 */
const matchPseudoElementSelector = (ast = {}, node = {}) => {
  const { type: astType } = ast;
  const { nodeType } = node;
  if (astType === PSEUDO_ELEMENT_SELECTOR && nodeType === ELEMENT_NODE) {
    const astName = unescapeSelector(ast.name);
    switch (astName) {
      case 'after':
      case 'backdrop':
      case 'before':
      case 'cue':
      case 'cue-region':
      case 'first-letter':
      case 'first-line':
      case 'file-selector-button':
      case 'marker':
      case 'part':
      case 'placeholder':
      case 'selection':
      case 'slotted':
      case 'target-text': {
        throw new DOMException(`Unsupported pseudo-element ::${astName}`,
          'NotSupportedError');
      }
      default: {
        throw new DOMException(`Unknown pseudo-element ::${astName}`,
          'SyntaxError');
      }
    }
  }
};

/**
 * Matcher
 */
class Matcher {
  /* private fields */
  #ast;
  #list;
  #matrix;
  #node;
  #root;
  #warn;

  /**
   * #list[{ branch[], skip }, { branch[], skip }]
   * branch[twig{}, twig{}]
   * twig{combo{}, leaves[]}
   * leaves[leaf{}, leaf{}, leaf{}]
   * #matrix[
   *   [
   *     Set([node, node]),
   *     Set([node, node, node, node]),
   *     Set([node, node, node])
   *   ],
   *   [
   *     Set([node, node, node]),
   *     Set([node, node])
   *   ]
   * ]
   * matrix[i] maps to list[i]
   */

  /**
   * construct
   * @param {string} selector - CSS selector
   * @param {object} node - Document, DocumentFragment, Element node
   * @param {object} [opt] - options
   * @param {boolean} [opt.warn] - console warn
   */
  constructor(selector, node, opt = {}) {
    const { warn } = opt;
    this.#ast = parseSelector(selector);
    this.#list = [];
    this.#matrix = [];
    this.#node = node;
    this.#root = this._getRoot(node);
    this.#warn = !!warn;
  }

  /**
   * handle error
   * @param {Error} e - Error
   * @throws Error
   * @returns {void}
   */
  _onError(e) {
    if (e instanceof DOMException && e.name === 'NotSupportedError') {
      if (this.#warn) {
        console.warn(e.message);
      }
    } else {
      throw e;
    }
  }

  /**
   * get root
   * @param {object} node - Document, DocumentFragment, Element node
   * @returns {object} - root object
   */
  _getRoot(node) {
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
      default: {
        if (isDescendant(node)) {
          document = node.ownerDocument;
          root = node.ownerDocument;
        } else {
          let parent = node;
          while (parent) {
            if (parent.parentNode) {
              parent = parent.parentNode;
            } else {
              break;
            }
          }
          document = parent.ownerDocument;
          root = parent;
        }
      }
    }
    return {
      document,
      root
    };
  }

  /**
   * prepare list and matrix
   * @returns {Array} - list and matrix
   */
  _prepare() {
    const branches = walkAST(this.#ast);
    const l = branches.length;
    for (let i = 0; i < l; i++) {
      const [...items] = branches[i];
      const branch = [];
      let item = items.shift();
      if (item && item.type !== COMBINATOR) {
        const leaves = new Set();
        while (item) {
          if (item.type === COMBINATOR) {
            const [nextItem] = items;
            if (nextItem.type === COMBINATOR) {
              const msg = `invalid combinator, ${item.name}${nextItem.name}`;
              throw new DOMException(msg, 'SyntaxError');
            }
            branch.push({
              combo: item,
              leaves: [...leaves]
            });
            leaves.clear();
          } else if (item) {
            leaves.add(item);
          }
          if (items.length) {
            item = items.shift();
          } else {
            branch.push({
              combo: null,
              leaves: [...leaves]
            });
            leaves.clear();
            break;
          }
        }
      }
      const branchLen = branch.length;
      this.#matrix[i] = [];
      for (let j = 0; j < branchLen; j++) {
        this.#matrix[i][j] = new Set();
      }
      this.#list.push({
        branch,
        skip: false
      });
    }
    return [
      this.#list,
      this.#matrix
    ];
  }

  /**
   * match selector
   * @param {object} ast - AST
   * @param {object} node - Document, DocumentFragment, Element node
   * @returns {object} - collection of matched nodes
   */
  _matchSelector(ast, node) {
    const { type } = ast;
    const matched = new Set();
    switch (type) {
      case ID_SELECTOR: {
        const res = matchIDSelector(ast, node);
        if (res) {
          matched.add(res);
        }
        break;
      }
      case CLASS_SELECTOR: {
        const res = matchClassSelector(ast, node);
        if (res) {
          matched.add(res);
        }
        break;
      }
      case ATTRIBUTE_SELECTOR: {
        const res = matchAttributeSelector(ast, node);
        if (res) {
          matched.add(res);
        }
        break;
      }
      case PSEUDO_CLASS_SELECTOR: {
        const nodes = matchPseudoClassSelector(ast, node, this.#node);
        if (nodes.size) {
          nodes.forEach(item => matched.add(item));
        }
        break;
      }
      case PSEUDO_ELEMENT_SELECTOR: {
        matchPseudoElementSelector(ast, node);
        break;
      }
      case TYPE_SELECTOR:
      default: {
        const res = matchTypeSelector(ast, node);
        if (res) {
          matched.add(res);
        }
      }
    }
    return matched;
  }

  /**
   * find nodes
   * @param {object} twig - twig
   * @returns {object} - result
   */
  _findNodes(twig) {
    const { leaves } = twig;
    const l = leaves.length;
    const { root } = this.#root;
    let nodes = new Set();
    let pending = false;
    for (let i = 0; i < l; i++) {
      const leaf = leaves[i];
      const { type: leafType } = leaf;
      const leafName = unescapeSelector(leaf.name);
      switch (leafType) {
        case ID_SELECTOR: {
          if (root.nodeType === ELEMENT_NODE) {
            pending = true;
          } else {
            const matched = root.getElementById(leafName);
            if (matched) {
              if (nodes.size) {
                if (nodes.has(matched)) {
                  nodes.clear();
                  nodes.add(matched);
                } else {
                  nodes.clear();
                }
              } else {
                nodes.add(matched);
              }
            } else {
              nodes.clear();
            }
          }
          break;
        }
        case CLASS_SELECTOR: {
          const arr = [];
          if (root.nodeType === DOCUMENT_FRAGMENT_NODE) {
            const { children } = root;
            const childItems = new Set([...children]);
            childItems.forEach(child => {
              const a = [...child.getElementsByClassName(leafName)];
              if (this._matchSelector(leaf, child).has(child)) {
                a.unshift(child);
              }
              arr.push(...a);
            });
          } else {
            const a = [...root.getElementsByClassName(leafName)];
            if (root.nodeType === ELEMENT_NODE &&
                this._matchSelector(leaf, root).has(root)) {
              a.unshift(root);
            }
            arr.push(...a);
          }
          const matched = new Set(arr);
          if (matched.size) {
            if (nodes.size) {
              nodes.forEach(node => {
                if (!matched.has(node)) {
                  nodes.delete(node);
                }
              });
            } else {
              nodes = matched;
            }
          } else {
            nodes.clear();
          }
          break;
        }
        case TYPE_SELECTOR: {
          const allNodes = [];
          if (root.nodeType === DOCUMENT_FRAGMENT_NODE) {
            const { children } = root;
            const childItems = new Set([...children]);
            childItems.forEach(child => {
              const a = [...child.getElementsByTagName('*')];
              if (this._matchSelector(leaf, child).has(child)) {
                a.unshift(child);
              }
              allNodes.push(...a);
            });
          } else {
            const a = [...root.getElementsByTagName('*')];
            if (root.nodeType === ELEMENT_NODE &&
                this._matchSelector(leaf, root).has(root)) {
              a.unshift(root);
            }
            allNodes.push(...a);
          }
          const allNodesLen = allNodes.length;
          const matched = new Set();
          for (let j = 0; j < allNodesLen; j++) {
            const node = allNodes[j];
            const bool = this._matchSelector(leaf, node).has(node);
            if (bool) {
              matched.add(node);
            }
          }
          if (matched.size) {
            nodes = matched;
          } else {
            nodes.clear();
          }
          break;
        }
        default: {
          if (nodes.size) {
            nodes.forEach(node => {
              const bool = this._matchSelector(leaf, node).has(node);
              if (!bool) {
                nodes.delete(node);
              }
            });
          } else {
            pending = true;
          }
        }
      }
      if (!nodes.size) {
        break;
      }
    }
    return {
      nodes,
      pending
    };
  }

  /**
   * collect nodes
   * @param {string} range - target range
   * @returns {Array} - list and matrix
   */
  _collectNodes(range) {
    const l = this.#list.length;
    const pendingItems = new Set();
    for (let i = 0; i < l; i++) {
      const { branch } = this.#list[i];
      const branchLen = branch.length;
      const lastIndex = branchLen - 1;
      for (let j = 0; j < branchLen; j++) {
        const twig = branch[j];
        const { nodes, pending } = this._findNodes(twig);
        if (nodes.size) {
          if (j === lastIndex) {
            if (range === 'self') {
              if (nodes.has(this.#node)) {
                nodes.clear();
                nodes.add(this.#node);
              } else {
                nodes.clear();
              }
            } else if (range === 'parent') {
              nodes.forEach(node => {
                const bool = isDescendant(this.#node, node);
                if (!bool) {
                  nodes.delete(node);
                }
              });
            }
          }
          if (nodes.size) {
            this.#matrix[i][j] = nodes;
          } else {
            this.#list[i].skip = true;
          }
        } else if (pending) {
          pendingItems.add(new Map([
            ['i', i],
            ['j', j],
            ['twig', twig]
          ]));
        } else {
          this.#list[i].skip = true;
          break;
        }
      }
    }
    if (pendingItems.size) {
      const { document, root } = this.#root;
      const iterator = document.createNodeIterator(root, FILTER_SHOW_ELEMENT);
      let nextNode = iterator.nextNode();
      while (nextNode) {
        pendingItems.forEach(pendingItem => {
          const { leaves } = pendingItem.get('twig');
          const items = new Set(leaves);
          let bool;
          for (const leaf of items) {
            bool = this._matchSelector(leaf, nextNode).has(nextNode);
            if (!bool) {
              break;
            }
          }
          if (bool) {
            const indexI = pendingItem.get('i');
            const indexJ = pendingItem.get('j');
            this.#matrix[indexI][indexJ].add(nextNode);
          }
        });
        nextNode = iterator.nextNode();
      }
    }
    return [
      this.#list,
      this.#matrix
    ];
  }

  /**
   * match nodes
   * @returns {object} - collection of matched nodes
   */
  _matchNodes() {
    const [...branches] = this.#list;
    const l = branches.length;
    const nodes = [];
    for (let i = 0; i < l; i++) {
      const { branch, skip } = this.#list[i];
      if (skip) {
        continue;
      } else {
        const branchLen = branch.length;
        const lastIndex = branchLen - 1;
        let prevNodes = this.#matrix[i][0];
        if (lastIndex === 0) {
          nodes.push(...prevNodes);
        } else if (lastIndex) {
          let { combo: prevCombo } = branch[0];
          for (let j = 1; j < branchLen; j++) {
            const nextNodes = this.#matrix[i][j];
            const matched = matchCombinator(prevCombo, prevNodes, nextNodes);
            if (j === lastIndex) {
              nodes.push(...matched);
            } else if (matched.size) {
              const { combo: nextCombo } = branch[j];
              prevCombo = nextCombo;
              prevNodes = nextNodes;
            } else {
              break;
            }
          }
        }
      }
    }
    return new Set(nodes);
  }

  /**
   * find matched nodes
   * @param {string} range - target range
   * @returns {object} - collection of matched nodes
   */
  _find(range) {
    this._prepare();
    this._collectNodes(range);
    const nodes = this._matchNodes();
    return nodes;
  }

  /**
   * sort nodes
   * @param {object} nodes - collection of nodes
   * @param {string} range - target range
   * @returns {object} - collection of sorted nodes
   */
  _sortNodes(nodes, range) {
    const { document, root } = this.#root;
    let n = 0;
    if (root.nodeType === DOCUMENT_FRAGMENT_NODE) {
      const { children } = root;
      const items = [...children];
      n += items.length;
      for (const child of items) {
        n += child.getElementsByTagName('*').length;
      }
    } else {
      n += document.getElementsByTagName('*').length;
    }
    const f = factorial(nodes.size);
    const sorted = new Set();
    if (f < n) {
      const items = [...nodes];
      let [node] = items;
      let l = items.length;
      let pos = 0;
      while (node) {
        if (node) {
          if (l === 1) {
            sorted.add(node);
            break;
          } else if (l > 1) {
            for (let i = 1; i < l; i++) {
              const nextNode = items[i];
              const posBit = node.compareDocumentPosition(nextNode);
              if (posBit & DOCUMENT_POSITION_PRECEDING ||
                  posBit & DOCUMENT_POSITION_CONTAINS) {
                node = nextNode;
                pos = i;
              }
            }
            sorted.add(node);
            if (range === 'all') {
              items.splice(pos, 1);
              [node] = items;
              l = items.length;
              pos = 0;
            } else {
              break;
            }
          }
        }
      }
    } else {
      const iterator =
        document.createNodeIterator(this.#node, FILTER_SHOW_ELEMENT);
      let nextNode = iterator.nextNode();
      while (nextNode) {
        if (nodes.has(nextNode)) {
          sorted.add(nextNode);
          if (range === 'all') {
            nodes.delete(nextNode);
          } else {
            break;
          }
        }
        if (!nodes.size) {
          break;
        }
        nextNode = iterator.nextNode();
      }
    }
    return sorted;
  }

  /**
   * matches
   * @returns {boolean} - matched node
   */
  matches() {
    let res;
    try {
      const nodes = this._find('self');
      res = nodes.has(this.#node);
    } catch (e) {
      this._onError(e);
    }
    return !!res;
  }

  /**
   * closest
   * @returns {?object} - matched node
   */
  closest() {
    let res;
    try {
      const nodes = this._find('parent');
      let node = this.#node;
      while (node) {
        if (nodes.has(node)) {
          res = node;
          break;
        }
        node = node.parentNode;
      }
    } catch (e) {
      this._onError(e);
    }
    return res ?? null;
  }

  /**
   * query selector
   * @returns {?object} - matched node
   */
  querySelector() {
    let res;
    try {
      const nodes = this._find();
      nodes.delete(this.#node);
      if (this.#node.nodeType === ELEMENT_NODE) {
        nodes.forEach(node => {
          if (!isDescendant(node, this.#node)) {
            nodes.delete(node);
          }
        });
      }
      if (nodes.size > 1) {
        [res] = [...this._sortNodes(nodes)];
      } else if (nodes.size) {
        [res] = [...nodes];
      }
    } catch (e) {
      this._onError(e);
    }
    return res ?? null;
  }

  /**
   * query selector all
   * NOTE: returns Array, not NodeList
   * @returns {Array.<object|undefined>} - collection of matched nodes
   */
  querySelectorAll() {
    const res = [];
    try {
      const nodes = this._find();
      nodes.delete(this.#node);
      if (this.#node.nodeType === ELEMENT_NODE) {
        nodes.forEach(node => {
          if (!isDescendant(node, this.#node)) {
            nodes.delete(node);
          }
        });
      }
      if (nodes.size > 1) {
        const sorted = this._sortNodes(nodes, 'all');
        res.push(...sorted);
      } else if (nodes.size) {
        res.push(...nodes);
      }
    } catch (e) {
      this._onError(e);
    }
    return res;
  }
};

module.exports = {
  Matcher,
  collectNthChild,
  collectNthOfType,
  createSelectorForNode,
  factorial,
  isContentEditable,
  isDescendant,
  isNamespaceDeclared,
  matchAnPlusB,
  matchAttributeSelector,
  matchClassSelector,
  matchCombinator,
  matchDirectionPseudoClass,
  matchIDSelector,
  matchLanguagePseudoClass,
  matchLogicalPseudoFunc,
  matchPseudoClassSelector,
  matchPseudoElementSelector,
  matchTypeSelector,
  parseASTName,
  unescapeSelector
};
