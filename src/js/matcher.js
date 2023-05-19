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
const DOCUMENT_POSITION_CONTAINS = 8;
const ELEMENT_NODE = 1;
const FILTER_ACCEPT = 1;
const FILTER_REJECT = 2;
const FILTER_SHOW_ELEMENT = 1;
const TEXT_NODE = 3;

/* regexp */
const HEX_CAPTURE = /^([\da-f]{1,6}\s?)/i;
const HTML_FORM_INPUT = /^(?:(?:inpu|selec)t|textarea)$/;
const HTML_FORM_PARTS = /^(?:button|fieldset|opt(?:group|ion))$/;
const HTML_INTERACT = /^d(?:etails|ialog)$/;
const PSEUDO_FUNC = /^(?:(?:ha|i)s|not|where)$/;
const PSEUDO_NTH = /^nth-(?:last-)?(?:child|of-type)$/;
const REPLACE_CHAR = /[\0\uD800-\uDFFF]/g;
const WHITESPACE = /^[\n\r\f]/;

/**
 * is content editable
 * NOTE: not implemented in jsdom https://github.com/jsdom/jsdom/issues/1670
 * @param {object} node - Element
 * @returns {boolean} - result
 */
const isContentEditable = (node = {}) => {
  let bool;
  if (node.nodeType === ELEMENT_NODE) {
    if (node.ownerDocument.designMode === 'on') {
      bool = true;
    } else if (node.hasAttribute('contenteditable')) {
      const attr = node.getAttribute('contenteditable');
      if (/^(?:plaintext-only|true)$/.test(attr) || attr === '') {
        bool = true;
      } else if (attr === 'inherit') {
        let parent = node.parentNode;
        while (parent) {
          if (isContentEditable(parent)) {
            bool = true;
            break;
          }
          parent = parent.parentNode;
        }
      }
    }
  }
  return !!bool;
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
    while (node) {
      if (node.hasAttribute(attr)) {
        res = true;
        break;
      } else if (node === root) {
        break;
      }
      node = node.parentNode;
    }
  }
  return !!res;
};

/**
 * unescape selector
 * @param {string} selector - CSS selector
 * @returns {?string} - unescaped selector
 */
const unescapeSelector = (selector = '') => {
  if (typeof selector === 'string' &&
      selector.indexOf(String.fromCharCode(0x5c), 0) >= 0) {
    const arr = selector.split('\\');
    const l = arr.length;
    for (let i = 0; i < l; i++) {
      let item = arr[i];
      if (i === l - 1 && item === '') {
        item = '\uFFFD';
      } else {
        const hexExists = HEX_CAPTURE.exec(item);
        if (hexExists) {
          const [, hex] = hexExists;
          let str;
          try {
            str = String.fromCodePoint(`0x${hex.trim()}`)
              .replace(REPLACE_CHAR, '\uFFFD');
          } catch (e) {
            str = '\uFFFD';
          }
          item = item.replace(`${hex}`, str);
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
 * collect nth child
 * @param {object} anb - An+B options
 * @param {number} anb.a - a
 * @param {number} anb.b - b
 * @param {boolean} [anb.reverse] - reverse order
 * @param {string} [anb.selector] - CSS selector
 * @param {object} node - Element node
 * @returns {Array.<object|undefined>} - collection of matched nodes
 */
const collectNthChild = (anb = {}, node = {}) => {
  const { a, b, reverse, selector } = anb;
  const { nodeType, ownerDocument, parentNode } = node;
  const matched = [];
  if (Number.isInteger(a) && Number.isInteger(b) && nodeType === ELEMENT_NODE) {
    const arr = [...parentNode.children];
    if (reverse) {
      arr.reverse();
    }
    const l = arr.length;
    const items = [];
    if (selector) {
      const ar = new Matcher(selector, ownerDocument).querySelectorAll();
      if (ar.length) {
        items.push(...ar);
      }
    }
    // :first-child, :last-child, :nth-child(0 of S)
    if (a === 0) {
      if (b >= 0 && b < l) {
        if (items.length) {
          let i = 0;
          while (i < l) {
            const current = arr[i];
            if (items.includes(current)) {
              matched.push(current);
              break;
            }
            i++;
          }
        } else {
          const current = arr[b];
          matched.push(current);
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
        let i = 0;
        let j = a > 0 ? 0 : b - 1;
        while (i < l && nth >= 0 && nth < l) {
          const current = arr[i];
          if (items.length) {
            if (items.includes(current)) {
              if (j === nth) {
                matched.push(current);
                nth += a;
              }
              if (a > 0) {
                j++;
              } else {
                j--;
              }
            }
          } else if (i === nth) {
            matched.push(current);
            nth += a;
          }
          i++;
        }
      }
    }
  }
  return [...new Set(matched)];
};

/**
 * collect nth of type
 * @param {object} anb - An+B options
 * @param {number} anb.a - a
 * @param {number} anb.b - b
 * @param {boolean} [anb.reverse] - reverse order
 * @param {object} node - Element node
 * @returns {Array.<object|undefined>} - collection of matched nodes
 */
const collectNthOfType = (anb = {}, node = {}) => {
  const { a, b, reverse } = anb;
  const { localName, nodeType, parentNode, prefix } = node;
  const matched = [];
  if (Number.isInteger(a) && Number.isInteger(b) && nodeType === ELEMENT_NODE) {
    const arr = [...parentNode.children];
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
          const current = arr[i];
          const { localName: itemLocalName, prefix: itemPrefix } = current;
          if (itemLocalName === localName && itemPrefix === prefix) {
            if (j === b) {
              matched.push(current);
              break;
            }
            j++;
          }
          i++;
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
        let i = 0;
        let j = a > 0 ? 0 : b - 1;
        while (i < l && nth >= 0 && nth < l) {
          const current = arr[i];
          const { localName: itemLocalName, prefix: itemPrefix } = current;
          if (itemLocalName === localName && itemPrefix === prefix) {
            if (j === nth) {
              matched.push(current);
              nth += a;
            }
            if (a > 0) {
              j++;
            } else {
              j--;
            }
          }
          i++;
        }
      }
    }
  }
  return [...new Set(matched)];
};

/**
 * match An+B
 * @param {string} nthName - nth pseudo-class name
 * @param {object} ast - AST
 * @param {object} node - Element node
 * @returns {Array.<object|undefined>} - collection of matched nodes
 */
const matchAnPlusB = (nthName, ast = {}, node = {}) => {
  const matched = [];
  if (typeof nthName === 'string') {
    nthName = nthName.trim();
    if (PSEUDO_NTH.test(nthName)) {
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
      const { nodeType } = node;
      if (astType === NTH && nodeType === ELEMENT_NODE) {
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
            const arr = collectNthChild(anb, node);
            if (arr.length) {
              matched.push(...arr);
            }
          } else if (/^nth-(?:last-)?of-type$/.test(nthName)) {
            const anb = Object.fromEntries(anbMap);
            const arr = collectNthOfType(anb, node);
            if (arr.length) {
              matched.push(...arr);
            }
          }
        }
      }
    }
  }
  return [...new Set(matched)];
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
    let astName = unescapeSelector(ast.name);
    let astPrefix, astNodeName, nodePrefix, nodeName;
    if (/\|/.test(astName)) {
      [astPrefix, astNodeName] = astName.split('|');
      if (astPrefix && astPrefix !== '*' &&
          !isNamespaceDeclared(astPrefix, node)) {
        throw new DOMException(`invalid selector ${astName}`, 'SyntaxError');
      }
    } else {
      astPrefix = '';
      astNodeName = astName;
    }
    if (ownerDocument?.contentType === 'text/html') {
      astNodeName = astNodeName.toLowerCase();
      astName = astName.toLowerCase();
    }
    // just in case that the namespaced content is parsed as text/html
    if (/:/.test(localName)) {
      [nodePrefix, nodeName] = localName.split(':');
    } else {
      nodePrefix = prefix || '';
      nodeName = localName;
    }
    if (astName === '*' || astName === '*|*' || astName === nodeName ||
        (astName === '|*' && !nodePrefix) ||
        (astPrefix === '*' && astNodeName === nodeName) ||
        ((astPrefix === nodePrefix || (astPrefix === '' && !nodePrefix)) &&
         (astNodeName === '*' || astNodeName === nodeName))) {
      res = node;
    }
  }
  return res || null;
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
  return res || null;
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
  return res || null;
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
  const { attributes, nodeType } = node;
  let res;
  if (astType === ATTRIBUTE_SELECTOR && nodeType === ELEMENT_NODE &&
      attributes?.length) {
    if (typeof astFlags === 'string' && !/^[is]$/i.test(astFlags)) {
      throw new DOMException('invalid attribute selector', 'SyntaxError');
    }
    const caseInsensitive =
      !(typeof astFlags === 'string' && /^s$/i.test(astFlags));
    const attrValues = [];
    const l = attributes.length;
    let { name: astAttrName } = astName;
    astAttrName = unescapeSelector(astAttrName);
    // namespaced
    if (/\|/.test(astAttrName)) {
      const [astAttrPrefix, astAttrLocalName] = astAttrName.split('|');
      let i = 0;
      while (i < l) {
        const { name: itemName, value: itemValue } = attributes.item(i);
        switch (astAttrPrefix) {
          case '':
            if (astAttrLocalName === itemName) {
              if (caseInsensitive) {
                attrValues.push(itemValue.toLowerCase());
              } else {
                attrValues.push(itemValue);
              }
            }
            break;
          case '*':
            if (/:/.test(itemName)) {
              if (itemName.endsWith(`:${astAttrLocalName}`)) {
                if (caseInsensitive) {
                  attrValues.push(itemValue.toLowerCase());
                } else {
                  attrValues.push(itemValue);
                }
              }
            } else if (astAttrLocalName === itemName) {
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
              if (astAttrPrefix === itemNamePrefix &&
                  astAttrLocalName === itemNameLocalName) {
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
          if (astAttrName === itemNameLocalName) {
            if (caseInsensitive) {
              attrValues.push(itemValue.toLowerCase());
            } else {
              attrValues.push(itemValue);
            }
          }
        } else if (astAttrName === itemName) {
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
        case null:
          res = node;
          break;
        case '=':
          if (typeof attrValue === 'string' && attrValues.includes(attrValue)) {
            res = node;
          }
          break;
        case '~=':
          if (typeof attrValue === 'string') {
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
          if (typeof attrValue === 'string') {
            const item = attrValues.find(v =>
              (v === attrValue || v.startsWith(`${attrValue}-`))
            );
            if (item) {
              res = node;
            }
          }
          break;
        case '^=':
          if (typeof attrValue === 'string') {
            const item = attrValues.find(v => v.startsWith(`${attrValue}`));
            if (item) {
              res = node;
            }
          }
          break;
        case '$=':
          if (typeof attrValue === 'string') {
            const item = attrValues.find(v => v.endsWith(`${attrValue}`));
            if (item) {
              res = node;
            }
          }
          break;
        case '*=':
          if (typeof attrValue === 'string') {
            const item = attrValues.find(v => v.includes(`${attrValue}`));
            if (item) {
              res = node;
            }
          }
          break;
        default:
          throw new DOMException(`Unknown matcher ${astMatcher}`,
            'SyntaxError');
      }
    }
  }
  return res || null;
};

/**
 * match language pseudo-class
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
        let extendedRest = '';
        if (langRest.length) {
          for (const i of langRest) {
            extendedRest += `-${i}${codePart}`;
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
  return res || null;
};

/**
 * match pseudo-class selector
 * @see https://html.spec.whatwg.org/#pseudo-classes
 * @param {object} ast - AST
 * @param {object} node - Element node
 * @param {object} [refPoint] - reference point
 * @returns {Array.<object|undefined>} - collection of matched nodes
 */
const matchPseudoClassSelector = (
  ast = {},
  node = {},
  refPoint = {}
) => {
  const { children: astChildren, type: astType } = ast;
  const { localName, nodeType, ownerDocument, parentNode } = node;
  const matched = [];
  if (astType === PSEUDO_CLASS_SELECTOR && nodeType === ELEMENT_NODE) {
    const astName = unescapeSelector(ast.name);
    if (Array.isArray(astChildren)) {
      const [astChildAst] = astChildren;
      // :nth-child(), :nth-last-child(), nth-of-type(), :nth-last-of-type()
      if (PSEUDO_NTH.test(astName)) {
        const arr = matchAnPlusB(astName, astChildAst, node);
        if (arr.length) {
          matched.push(...arr);
        }
      } else {
        switch (astName) {
          case 'dir':
            if (astChildAst.name === node.dir) {
              matched.push(node);
            }
            break;
          case 'lang':
            if (matchLanguagePseudoClass(astChildAst, node)) {
              matched.push(node);
            }
            break;
          case 'current':
          case 'nth-col':
          case 'nth-last-col':
            throw new DOMException(`Unsupported pseudo-class ${astName}`,
              'NotSupportedError');
          default:
            throw new DOMException(`Unknown pseudo-class ${astName}`,
              'SyntaxError');
        }
      }
    } else {
      const root = ownerDocument.documentElement;
      const docURL = new URL(ownerDocument.URL);
      switch (astName) {
        case 'any-link':
        case 'link':
          if (/^a(?:rea)?$/.test(localName) && node.hasAttribute('href')) {
            matched.push(node);
          }
          break;
        case 'local-link':
          if (/^a(?:rea)?$/.test(localName) && node.hasAttribute('href')) {
            const attrURL = new URL(node.getAttribute('href'), docURL.href);
            if (attrURL.origin === docURL.origin &&
                attrURL.pathname === docURL.pathname) {
              matched.push(node);
            }
          }
          break;
        case 'visited':
          // prevent fingerprinting
          break;
        case 'target':
          if (docURL.hash && node.id && docURL.hash === `#${node.id}`) {
            matched.push(node);
          }
          break;
        case 'target-within':
          if (docURL.hash) {
            const hash = docURL.hash.replace(/^#/, '');
            let current = ownerDocument.getElementById(hash);
            while (current) {
              if (current === node) {
                matched.push(node);
                break;
              }
              current = current.parentNode;
            }
          }
          break;
        case 'scope':
          if (refPoint?.nodeType === ELEMENT_NODE) {
            if (node === refPoint) {
              matched.push(node);
            }
          } else if (node === root) {
            matched.push(node);
          }
          break;
        case 'focus':
          if (node === ownerDocument.activeElement) {
            matched.push(node);
          }
          break;
        case 'focus-within': {
          let current = ownerDocument.activeElement;
          while (current) {
            if (current === node) {
              matched.push(node);
              break;
            }
            current = current.parentNode;
          }
          break;
        }
        case 'open':
          if (HTML_INTERACT.test(localName) && node.hasAttribute('open')) {
            matched.push(node);
          }
          break;
        case 'closed':
          if (HTML_INTERACT.test(localName) && !node.hasAttribute('open')) {
            matched.push(node);
          }
          break;
        case 'disabled':
          if (HTML_FORM_INPUT.test(localName) ||
              HTML_FORM_PARTS.test(localName) ||
              isCustomElementName(localName)) {
            if (node.hasAttribute('disabled')) {
              matched.push(node);
            } else {
              let parent = node.parentNode;
              while (parent) {
                if (parent.localName === 'fieldset') {
                  break;
                }
                parent = parent.parentNode;
              }
              if (parent && parent.hasAttribute('disabled') &&
                  node.parentNode.localName !== 'legend') {
                matched.push(node);
              }
            }
          }
          break;
        case 'enabled':
          if ((HTML_FORM_INPUT.test(localName) ||
               HTML_FORM_PARTS.test(localName) ||
               isCustomElementName(localName)) &&
              !node.hasAttribute('disabled')) {
            matched.push(node);
          }
          break;
        case 'read-only':
          if (/^(?:input|textarea)$/.test(localName)) {
            if (node.hasAttribute('readonly') ||
                node.hasAttribute('disabled')) {
              matched.push(node);
            }
          } else if (!isContentEditable(node)) {
            matched.push(node);
          }
          break;
        case 'read-write':
          if (/^(?:input|textarea)$/.test(localName)) {
            if (!(node.hasAttribute('readonly') ||
                  node.hasAttribute('disabled'))) {
              matched.push(node);
            }
          } else if (isContentEditable(node)) {
            matched.push(node);
          }
          break;
        case 'placeholder-shown':
          if (/^(?:input|textarea)$/.test(localName) &&
              node.hasAttribute('placeholder') &&
              node.getAttribute('placeholder').trim().length &&
              node.value === '') {
            matched.push(node);
          }
          break;
        case 'checked':
          if ((localName === 'input' && node.hasAttribute('type') &&
               /^(?:checkbox|radio)$/.test(node.getAttribute('type')) &&
               node.checked) ||
              (localName === 'option' && node.selected)) {
            matched.push(node);
          }
          break;
        case 'indeterminate':
          if ((localName === 'input' && node.type === 'checkbox' &&
               node.indeterminate) ||
              (localName === 'progress' && !node.hasAttribute('value'))) {
            matched.push(node);
          } else if (localName === 'input' && node.type === 'radio') {
            const radioName = node.name;
            let form = node;
            while (form) {
              if (form.localName === 'form') {
                break;
              }
              form = form.parentNode;
            }
            if (form && radioName) {
              const sel = `input[type="radio"][name="${radioName}"]`;
              const arr = new Matcher(sel, form).querySelectorAll();
              let checked;
              for (const i of arr) {
                checked = !!i.checked;
                if (checked) {
                  break;
                }
              }
              if (!checked) {
                matched.push(node);
              }
            }
          }
          break;
        case 'default':
          // input[type="checkbox"], input[type="radio"]
          if (localName === 'input' && node.hasAttribute('type') &&
              /^(?:checkbox|radio)$/.test(node.getAttribute('type'))) {
            if (node.hasAttribute('checked')) {
              matched.push(node);
            }
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
              throw new DOMException(`Unsupported pseudo-class ${astName}`,
                'NotSupportedError');
            } else {
              const firstOpt = parentNode.firstElementChild;
              const defaultOpt = [];
              let opt = firstOpt;
              while (opt) {
                if (opt.hasAttribute('selected')) {
                  defaultOpt.push(opt);
                  break;
                }
                opt = opt.nextElementSibling;
              }
              if (!defaultOpt.length) {
                defaultOpt.push(firstOpt);
              }
              if (defaultOpt.includes(node)) {
                matched.push(node);
              }
            }
          // FIXME:
          // button[type="submit"], input[type="submit"], input[type="image"]
          } else if ((localName === 'button' &&
                      (!node.hasAttribute('type') ||
                       node.getAttribute('type') === 'submit')) ||
                     (localName === 'input' && node.hasAttribute('type') &&
                      /^(?:image|submit)$/.test(node.getAttribute('type')))) {
            throw new DOMException(`Unsupported pseudo-class ${astName}`,
              'NotSupportedError');
          }
          break;
        case 'valid':
          if (HTML_FORM_INPUT.test(localName) ||
              /^(?:f(?:ieldset|orm)|button|output)$/.test(localName)) {
            if (node.checkValidity()) {
              matched.push(node);
            }
          }
          break;
        case 'invalid':
          if (HTML_FORM_INPUT.test(localName) ||
              /^(?:f(?:ieldset|orm)|button|output)$/.test(localName)) {
            if (!node.checkValidity()) {
              matched.push(node);
            }
          }
          break;
        case 'in-range':
          if (localName === 'input' &&
              node.hasAttribute('min') && node.hasAttribute('max')) {
            if (!(node.validity.rangeUnderflow ||
                  node.validity.rangeOverflow)) {
              matched.push(node);
            }
          }
          break;
        case 'out-of-range':
          if (localName === 'input' &&
              node.hasAttribute('min') && node.hasAttribute('max')) {
            if (node.validity.rangeUnderflow || node.validity.rangeOverflow) {
              matched.push(node);
            }
          }
          break;
        case 'required':
          if (HTML_FORM_INPUT.test(localName) && node.required) {
            matched.push(node);
          }
          break;
        case 'optional':
          if (HTML_FORM_INPUT.test(localName) && !node.required) {
            matched.push(node);
          }
          break;
        case 'root':
          if (node === root) {
            matched.push(node);
          }
          break;
        case 'empty':
          if (!node.hasChildNodes()) {
            matched.push(node);
          } else {
            const nodes = [...node.childNodes];
            if (nodes.every(n =>
              n.nodeType !== ELEMENT_NODE && n.nodeType !== TEXT_NODE)) {
              matched.push(node);
            }
          }
          break;
        case 'first-child':
          if (node === node.parentNode.firstElementChild) {
            matched.push(node);
          }
          break;
        case 'last-child':
          if (node === node.parentNode.lastElementChild) {
            matched.push(node);
          }
          break;
        case 'only-child':
          if (node === node.parentNode.firstElementChild &&
              node === node.parentNode.lastElementChild) {
            matched.push(node);
          }
          break;
        case 'first-of-type': {
          const [node1] = collectNthOfType({
            a: 0,
            b: 0
          }, node);
          if (node1) {
            matched.push(node1);
          }
          break;
        }
        case 'last-of-type': {
          const [node1] = collectNthOfType({
            a: 0,
            b: 0,
            reverse: true
          }, node);
          if (node1) {
            matched.push(node1);
          }
          break;
        }
        case 'only-of-type': {
          const [node1] = collectNthOfType({
            a: 0,
            b: 0
          }, node);
          const [node2] = collectNthOfType({
            a: 0,
            b: 0,
            reverse: true
          }, node);
          if (node1 === node && node2 === node) {
            matched.push(node);
          }
          break;
        }
        // legacy pseudo-elements
        case 'after':
        case 'before':
        case 'first-letter':
        case 'first-line':
          break;
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
        case '-webkit-autofill':
          throw new DOMException(`Unsupported pseudo-class ${astName}`,
            'NotSupportedError');
        default:
          throw new DOMException(`Unknown pseudo-class ${astName}`,
            'SyntaxError');
      }
    }
  }
  return [...new Set(matched)];
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
      case 'target-text':
        throw new DOMException(`Unsupported pseudo-element ${astName}`,
          'NotSupportedError');
      default:
        throw new DOMException(`Unknown pseudo-element ${astName}`,
          'SyntaxError');
    }
  }
};

/**
 * Matcher
 */
class Matcher {
  /* private fields */
  #ast;
  #document;
  #node;
  #selector;
  #warn;

  /**
   * construct
   * @param {string} selector - CSS selector
   * @param {object} refPoint - reference point
   * @param {object} [opt] - options
   * @param {object} [opt.warn] - console warn
   */
  constructor(selector, refPoint, opt = {}) {
    const { warn } = opt;
    this.#ast = parseSelector(selector);
    this.#document = refPoint?.ownerDocument ?? refPoint;
    this.#node = refPoint;
    this.#selector = selector;
    this.#warn = !!warn;
  }

  /**
   * is attached
   * @returns {boolean} - result
   */
  _isAttached() {
    const root = this.#document.documentElement;
    const posBit =
      this.#node.compareDocumentPosition(root) & DOCUMENT_POSITION_CONTAINS;
    return !!posBit;
  };

  /**
   * create iterator
   * @param {object} ast - AST
   * @param {object} root - root node
   * @returns {object} - iterator
   */
  _createIterator(ast = this.#ast, root = this.#node) {
    const iterator = this.#document.createNodeIterator(
      root,
      FILTER_SHOW_ELEMENT,
      node => {
        const arr = this._match(ast, node);
        return arr.length ? FILTER_ACCEPT : FILTER_REJECT;
      }
    );
    return iterator;
  }

  /**
   * parse ast and run
   * @param {object} ast - AST
   * @param {object} node - Element node
   * @returns {Array.<object|undefined>} - collection of matched nodes
   */
  _parseAST(ast, node) {
    const items = walkAST(ast);
    const matched = [];
    if (items.length) {
      for (const item of items) {
        const arr = this._matchSelector(item, node);
        if (arr.length) {
          matched.push(...arr);
        }
      }
    }
    return [...new Set(matched)];
  }

  /**
   * match adjacent leaves
   * @param {Array.<object>} leaves - array of AST leaves
   * @param {object} node - Element node
   * @returns {?object} - matched node
   */
  _matchAdjacentLeaves(leaves, node) {
    const [prevLeaf, nextLeaf] = leaves;
    const iterator = this._createIterator(prevLeaf, node);
    let prevNode = iterator.nextNode();
    const items = [];
    while (prevNode) {
      const arr = this._match(prevLeaf, prevNode);
      if (arr.length) {
        for (const item of arr) {
          const a = this._match(nextLeaf, item);
          if (a.length) {
            items.push(...a);
          }
        }
      }
      prevNode = iterator.nextNode();
    }
    let res;
    if (items.includes(node)) {
      res = node;
    }
    return res || null;
  }

  /**
   * match combinator
   * @param {Array.<object>} leaves - array of AST leaves
   * @param {object} prevNode - Element node
   * @returns {Array.<object|undefined>} - matched nodes
   */
  _matchCombinator(leaves, prevNode) {
    const [{ name: comboName }, ...items] = leaves;
    const nodes = new Set();
    if (items.length) {
      const [firstItem] = items;
      let rootNode = prevNode;
      if (comboName === '+' || comboName === '~') {
        rootNode = rootNode.parentNode;
      }
      const iterator = this._createIterator(firstItem, rootNode);
      let nextNode = iterator.nextNode();
      const item = items.shift();
      while (nextNode) {
        const arr = this._match(item, nextNode);
        if (arr.length) {
          nodes.add(...arr);
        }
        nextNode = iterator.nextNode();
      }
      while (items.length) {
        const ast = items.shift();
        if (nodes.size) {
          nodes.forEach(node => {
            const arr = this._match(ast, node);
            if (!arr.length) {
              nodes.delete(node);
            }
          });
        }
      }
    }
    const matched = [];
    if (nodes.size && /^[ >+~]$/.test(comboName)) {
      const arr = [...nodes];
      for (const item of arr) {
        let refNode = item;
        switch (comboName) {
          case '>':
            if (refNode.parentNode === prevNode) {
              matched.push(item);
            }
            break;
          case '~':
            refNode = refNode.previousElementSibling;
            while (refNode) {
              if (refNode === prevNode) {
                matched.push(item);
                break;
              }
              refNode = refNode.previousElementSibling;
            }
            break;
          case '+':
            if (refNode.previousElementSibling === prevNode) {
              matched.push(item);
            }
            break;
          default:
            refNode = refNode.parentNode;
            while (refNode) {
              if (refNode === prevNode) {
                matched.push(item);
                break;
              }
              refNode = refNode.parentNode;
            }
        }
      }
    }
    return [...new Set(matched)];
  }

  /**
   * match argument leaf
   * @param {object} leaf - AST leaf
   * @param {object} node - Element node
   * @returns {Array.<object|undefined>} - matched nodes
   */
  _matchArgumentLeaf(leaf, node) {
    const iterator = this._createIterator(leaf, node);
    let nextNode = iterator.nextNode();
    const matched = [];
    while (nextNode) {
      const arr = this._match(leaf, nextNode);
      if (arr.length) {
        matched.push(...arr);
      }
      nextNode = iterator.nextNode();
    }
    return [...new Set(matched)];
  }

  /**
   * match logical pseudo-class functions - :is(), :has(), :not(), :where()
   * @param {object} branch - AST branch
   * @param {object} node - Element node
   * @returns {?object} - matched node
   */
  _matchLogicalPseudoFunc(branch, node) {
    const ast = walkAST(branch);
    let res;
    if (ast.length) {
      const branchName = unescapeSelector(branch.name);
      switch (branchName) {
        // :has()
        case 'has': {
          let matched;
          for (const astItem of ast) {
            const [item, ...items] = astItem;
            const { type: itemType } = item;
            const itemLeaves = [];
            let firstItem = item;
            if (itemType !== COMBINATOR) {
              const comboLeaf = {
                name: ' ',
                type: COMBINATOR
              };
              itemLeaves.push(comboLeaf, firstItem);
            } else {
              firstItem = items.shift();
              itemLeaves.push(item, firstItem);
            }
            if (firstItem.type === PSEUDO_CLASS_SELECTOR &&
                unescapeSelector(firstItem.name) === 'has') {
              matched = false;
              break;
            }
            const arr = this._matchCombinator(itemLeaves, node);
            if (arr.length) {
              matched = true;
              while (items.length && matched) {
                const adjacentLeaves = [firstItem, items.shift()];
                matched = this._matchAdjacentLeaves(adjacentLeaves, node);
              }
              break;
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
          for (const astItem of ast) {
            const [item, ...items] = astItem;
            // NOTE: according to MDN, :not() can not contain :not()
            // but spec says nothing about that?
            if (item.type === PSEUDO_CLASS_SELECTOR &&
                unescapeSelector(item.name) === 'not') {
              matched = true;
              break;
            }
            const arr = this._matchArgumentLeaf(item, node);
            if (arr.length) {
              matched = true;
              while (items.length && matched) {
                const adjacentLeaves = [item, items.shift()];
                matched = this._matchAdjacentLeaves(adjacentLeaves, node);
              }
              break;
            }
          }
          if (!matched) {
            res = node;
          }
          break;
        }
        // :is(), :where()
        default: {
          let matched;
          for (const astItem of ast) {
            const [item, ...items] = astItem;
            const arr = this._matchArgumentLeaf(item, node);
            if (arr.length) {
              matched = true;
              while (items.length && matched) {
                const adjacentLeaves = [item, items.shift()];
                matched = this._matchAdjacentLeaves(adjacentLeaves, node);
              }
              break;
            }
          }
          if (matched) {
            res = node;
          }
        }
      }
    }
    return res || null;
  }

  /**
   * match selector
   * @param {Array.<object>} children - selector children
   * @param {object} node - Element node
   * @returns {Array.<object|undefined>} - collection of matched nodes
   */
  _matchSelector(children, node) {
    const matched = [];
    if (Array.isArray(children) && children.length) {
      const [firstChild] = children;
      if (firstChild.type === PSEUDO_CLASS_SELECTOR &&
          PSEUDO_FUNC.test(unescapeSelector(firstChild.name)) &&
          node.nodeType === ELEMENT_NODE) {
        const iteratorLeaf = {
          name: '*',
          type: TYPE_SELECTOR
        };
        const iterator = this._createIterator(iteratorLeaf, node);
        let nextNode = iterator.nextNode();
        while (nextNode) {
          nextNode = this._matchLogicalPseudoFunc(firstChild, nextNode);
          if (nextNode) {
            matched.push(nextNode);
          }
          nextNode = iterator.nextNode();
        }
      } else {
        let iteratorLeaf;
        if (firstChild.type === COMBINATOR ||
            (firstChild.type === PSEUDO_CLASS_SELECTOR &&
             PSEUDO_NTH.test(unescapeSelector(firstChild.name)))) {
          iteratorLeaf = {
            name: '*',
            type: TYPE_SELECTOR
          };
        } else {
          iteratorLeaf = children.shift();
        }
        const iterator = this._createIterator(iteratorLeaf, node);
        let nextNode = iterator.nextNode();
        if (nextNode) {
          while (nextNode) {
            const [...items] = children;
            if (items.length) {
              if (items.length === 1) {
                const item = items.shift();
                const { type: itemType } = item;
                const itemName = unescapeSelector(item.name);
                if (itemType === PSEUDO_CLASS_SELECTOR &&
                    PSEUDO_FUNC.test(itemName)) {
                  nextNode = this._matchLogicalPseudoFunc(item, nextNode);
                  if (nextNode) {
                    matched.push(nextNode);
                    nextNode = null;
                  }
                } else {
                  const arr = this._match(item, nextNode);
                  if (arr.length) {
                    matched.push(...arr);
                  }
                }
              } else {
                do {
                  const item = items.shift();
                  const { type: itemType } = item;
                  const itemName = unescapeSelector(item.name);
                  if (itemType === PSEUDO_CLASS_SELECTOR &&
                      PSEUDO_FUNC.test(itemName)) {
                    nextNode = this._matchLogicalPseudoFunc(item, nextNode);
                  } else if (itemType === COMBINATOR) {
                    let [nextItem] = items;
                    let nextItemName = unescapeSelector(nextItem.name);
                    if (nextItem.type === COMBINATOR) {
                      const comboName = `${itemName}${nextItemName}`;
                      throw new DOMException(`Unknown combinator ${comboName}`,
                        'SyntaxError');
                    }
                    const leaves = [];
                    leaves.push(item);
                    while (items.length) {
                      [nextItem] = items;
                      nextItemName = unescapeSelector(nextItem.name);
                      if (nextItem.type === COMBINATOR ||
                          (nextItem.type === PSEUDO_CLASS_SELECTOR &&
                           PSEUDO_NTH.test(nextItemName)) ||
                          (nextItem.type === PSEUDO_CLASS_SELECTOR &&
                           PSEUDO_FUNC.test(nextItemName))) {
                        break;
                      } else {
                        leaves.push(items.shift());
                      }
                    }
                    const arr = this._matchCombinator(leaves, nextNode);
                    if (!arr.length || arr.length === 1) {
                      [nextNode] = arr;
                    } else {
                      if (items.length) {
                        const [i] = items;
                        for (const j of arr) {
                          if (i.type === PSEUDO_CLASS_SELECTOR &&
                              PSEUDO_FUNC.test(unescapeSelector(i.name))) {
                            if (this._matchLogicalPseudoFunc(i, j)) {
                              matched.push(j);
                            }
                          } else {
                            const a = this._matchSelector(items, j);
                            if (a.length) {
                              matched.push(...a);
                            }
                          }
                        }
                      } else {
                        matched.push(...arr);
                      }
                      nextNode = null;
                    }
                  } else {
                    [nextNode] = this._match(item, nextNode);
                  }
                } while (items.length && nextNode);
                if (nextNode) {
                  matched.push(nextNode);
                }
              }
            } else if (nextNode) {
              matched.push(nextNode);
            }
            nextNode = iterator.nextNode();
          }
        }
      }
    }
    return [...new Set(matched)];
  }

  /**
   * match AST and node
   * @param {object} ast - AST
   * @param {object} node - Element node
   * @returns {Array.<object|undefined>} - collection of matched nodes
   */
  _match(ast = this.#ast, node = this.#node) {
    const matched = [];
    const { name, type } = ast;
    switch (type) {
      case TYPE_SELECTOR:
        if (matchTypeSelector(ast, node)) {
          matched.push(node);
        }
        break;
      case CLASS_SELECTOR:
        if (matchClassSelector(ast, node)) {
          matched.push(node);
        }
        break;
      case ID_SELECTOR:
        if (matchIDSelector(ast, node)) {
          matched.push(node);
        }
        break;
      case ATTRIBUTE_SELECTOR:
        if (matchAttributeSelector(ast, node)) {
          matched.push(node);
        }
        break;
      case PSEUDO_CLASS_SELECTOR:
        if (!PSEUDO_FUNC.test(unescapeSelector(name))) {
          const arr = matchPseudoClassSelector(ast, node, this.#node);
          if (arr.length) {
            matched.push(...arr);
          }
        }
        break;
      case PSEUDO_ELEMENT_SELECTOR:
        matchPseudoElementSelector(ast, node);
        break;
      default: {
        const arr = this._parseAST(ast, node);
        if (arr.length) {
          matched.push(...arr);
        }
      }
    }
    return [...new Set(matched)];
  }

  /**
   * matches
   * @returns {boolean} - matched node
   */
  matches() {
    let res;
    try {
      let node;
      if (this._isAttached()) {
        node = this.#document;
      } else {
        node = this.#node;
      }
      const arr = this._match(this.#ast, node);
      res = arr.length && arr.includes(this.#node);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'NotSupportedError') {
        if (this.#warn) {
          console.warn(e.message);
        }
      } else {
        throw e;
      }
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
      const arr = this._match(this.#ast, this.#document);
      let node = this.#node;
      while (node) {
        if (arr.includes(node)) {
          res = node;
          break;
        }
        node = node.parentNode;
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'NotSupportedError') {
        if (this.#warn) {
          console.warn(e.message);
        }
      } else {
        throw e;
      }
    }
    return res || null;
  }

  /**
   * query selector
   * @returns {?object} - matched node
   */
  querySelector() {
    let res;
    try {
      const arr = this._match(this.#ast, this.#node);
      if (arr.length) {
        const i = arr.findIndex(node => node === this.#node);
        if (i >= 0) {
          arr.splice(i, 1);
        }
      }
      [res] = arr;
    } catch (e) {
      if (e instanceof DOMException && e.name === 'NotSupportedError') {
        if (this.#warn) {
          console.warn(e.message);
        }
      } else {
        throw e;
      }
    }
    return res || null;
  }

  /**
   * query selector all
   * NOTE: returns Array, not NodeList
   * @returns {Array.<object|undefined>} - collection of matched nodes
   */
  querySelectorAll() {
    const res = [];
    try {
      const arr = this._match(this.#ast, this.#node);
      if (arr.length) {
        const i = arr.findIndex(node => node === this.#node);
        if (i >= 0) {
          arr.splice(i, 1);
        }
      }
      const a = new Set(arr);
      res.push(...a);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'NotSupportedError') {
        if (this.#warn) {
          console.warn(e.message);
        }
      } else {
        throw e;
      }
    }
    return res;
  }
};

module.exports = {
  Matcher,
  collectNthChild,
  collectNthOfType,
  isContentEditable,
  isNamespaceDeclared,
  matchAnPlusB,
  matchAttributeSelector,
  matchClassSelector,
  matchIDSelector,
  matchLanguagePseudoClass,
  matchPseudoClassSelector,
  matchPseudoElementSelector,
  matchTypeSelector,
  unescapeSelector
};
