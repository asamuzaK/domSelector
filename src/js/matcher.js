/**
 * matcher.js
 */

/* import */
import { generateCSS, parseAstName, unescapeSelector } from './parser.js';
import { getDirectionality, getType, isNamespaceDeclared } from './utility.js';

/* constants */
import {
  ALPHA_NUM, ELEMENT_NODE, EMPTY, LANG_PART, NOT_SUPPORTED_ERR, SELECTOR_ATTR,
  SELECTOR_TYPE, SYNTAX_ERR
} from './constant.js';

/* Matcher */
export class Matcher {
  /**
   * match pseudo-element selector
   * @param {string} astName - AST name
   * @param {object} opt - options
   * @param {boolean} [opt.forgive] - forgive unknown pseudo-element
   * @param {boolean} [opt.warn] - warn unsupported pseudo-element
   * @throws {DOMException}
   * @returns {void}
   */
  matchPseudoElementSelector(astName, opt = {}) {
    if (!astName || typeof astName !== 'string') {
      throw new TypeError(`Unexpected type ${getType(astName)}`);
    }
    const { forgive, warn } = opt;
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
      case 'placeholder':
      case 'selection':
      case 'target-text': {
        if (warn) {
          throw new DOMException(`Unsupported pseudo-element ::${astName}`,
            NOT_SUPPORTED_ERR);
        }
        break;
      }
      case 'part':
      case 'slotted': {
        if (warn) {
          throw new DOMException(`Unsupported pseudo-element ::${astName}()`,
            NOT_SUPPORTED_ERR);
        }
        break;
      }
      default: {
        if (astName.startsWith('-webkit-')) {
          if (warn) {
            throw new DOMException(`Unsupported pseudo-element ::${astName}`,
              NOT_SUPPORTED_ERR);
          }
        } else if (!forgive) {
          throw new DOMException(`Unknown pseudo-element ::${astName}`,
            SYNTAX_ERR);
        }
      }
    }
  }

  /**
   * match attribute selector
   * @private
   * @param {object} ast - AST
   * @param {object} node - Element node
   * @returns {?object} - matched node
   */
  _matchAttributeSelector(ast, node) {
    const {
      flags: astFlags, matcher: astMatcher, name: astName, value: astValue
    } = ast;
    if (typeof astFlags === 'string' && !/^[is]$/i.test(astFlags)) {
      const css = generateCSS(ast);
      throw new DOMException(`Invalid selector ${css}`, SYNTAX_ERR);
    }
    const { attributes } = node;
    let res;
    if (attributes && attributes.length) {
      const contentType = node.ownerDocument.contentType;
      let caseInsensitive;
      if (contentType === 'text/html') {
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
      let astAttrName = unescapeSelector(astName.name);
      if (caseInsensitive) {
        astAttrName = astAttrName.toLowerCase();
      }
      const attrValues = new Set();
      // namespaced
      if (astAttrName.indexOf('|') > -1) {
        const {
          prefix: astPrefix, localName: astLocalName
        } = parseAstName(astAttrName);
        for (const item of attributes) {
          let { name: itemName, value: itemValue } = item;
          if (caseInsensitive) {
            itemName = itemName.toLowerCase();
            itemValue = itemValue.toLowerCase();
          }
          switch (astPrefix) {
            case '': {
              if (astLocalName === itemName) {
                attrValues.add(itemValue);
              }
              break;
            }
            case '*': {
              if (itemName.indexOf(':') > -1) {
                if (itemName.endsWith(`:${astLocalName}`)) {
                  attrValues.add(itemValue);
                }
              } else if (astLocalName === itemName) {
                attrValues.add(itemValue);
              }
              break;
            }
            default: {
              if (itemName.indexOf(':') > -1) {
                const [itemPrefix, itemLocalName] = itemName.split(':');
                // ignore xml:lang
                if (itemPrefix === 'xml' && itemLocalName === 'lang') {
                  continue;
                } else if (astPrefix === itemPrefix &&
                           astLocalName === itemLocalName) {
                  const namespaceDeclared =
                    isNamespaceDeclared(astPrefix, node);
                  if (namespaceDeclared) {
                    attrValues.add(itemValue);
                  }
                }
              }
            }
          }
        }
      } else {
        for (let { name: itemName, value: itemValue } of attributes) {
          if (caseInsensitive) {
            itemName = itemName.toLowerCase();
            itemValue = itemValue.toLowerCase();
          }
          if (itemName.indexOf(':') > -1) {
            const [itemPrefix, itemLocalName] = itemName.split(':');
            // ignore xml:lang
            if (itemPrefix === 'xml' && itemLocalName === 'lang') {
              continue;
            } else if (astAttrName === itemLocalName) {
              attrValues.add(itemValue);
            }
          } else if (astAttrName === itemName) {
            attrValues.add(itemValue);
          }
        }
      }
      if (attrValues.size) {
        const { name: astIdentValue, value: astStringValue } = astValue ?? {};
        let attrValue;
        if (astIdentValue) {
          if (caseInsensitive) {
            attrValue = astIdentValue.toLowerCase();
          } else {
            attrValue = astIdentValue;
          }
        } else if (astStringValue) {
          if (caseInsensitive) {
            attrValue = astStringValue.toLowerCase();
          } else {
            attrValue = astStringValue;
          }
        } else if (astStringValue === '') {
          attrValue = astStringValue;
        }
        switch (astMatcher) {
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
          case null:
          default: {
            res = node;
          }
        }
      }
    }
    return res ?? null;
  }

  /**
   * match type selector
   * @private
   * @param {object} ast - AST
   * @param {object} node - Element node
   * @param {object} opt - options
   * @param {boolean} [opt.forgive] - forgive undeclared namespace
   * @returns {?object} - matched node
   */
  _matchTypeSelector(ast, node, opt = {}) {
    const astName = unescapeSelector(ast.name);
    const { localName, namespaceURI, prefix } = node;
    const { forgive } = opt;
    let {
      prefix: astPrefix, localName: astLocalName
    } = parseAstName(astName, node);
    if (node.ownerDocument.contentType === 'text/html' &&
        /[A-Z][\\w-]*/i.test(localName)) {
      astPrefix = astPrefix.toLowerCase();
      astLocalName = astLocalName.toLowerCase();
    }
    let nodePrefix;
    let nodeLocalName;
    // just in case that the namespaced content is parsed as text/html
    if (localName.indexOf(':') > -1) {
      [nodePrefix, nodeLocalName] = localName.split(':');
    } else {
      nodePrefix = prefix || '';
      nodeLocalName = localName;
    }
    let res;
    switch (astPrefix) {
      case '': {
        if (!nodePrefix && !namespaceURI &&
            (astLocalName === '*' || astLocalName === nodeLocalName)) {
          res = node;
        }
        break;
      }
      case '*': {
        if (astLocalName === '*' || astLocalName === nodeLocalName) {
          res = node;
        }
        break;
      }
      default: {
        const astNS = node.lookupNamespaceURI(astPrefix);
        const nodeNS = node.lookupNamespaceURI(nodePrefix);
        if (astNS === nodeNS && astPrefix === nodePrefix) {
          if (astLocalName === '*' || astLocalName === nodeLocalName) {
            res = node;
          }
        } else if (!forgive && !astNS) {
          throw new DOMException(`Undeclared namespace ${astPrefix}`,
            SYNTAX_ERR);
        }
      }
    }
    return res ?? null;
  };

  /**
   * match directionality pseudo-class - :dir()
   * @private
   * @param {object} ast - AST
   * @param {object} node - Element node
   * @returns {?object} - matched node
   */
  _matchDirectionPseudoClass(ast, node) {
    const dir = getDirectionality(node);
    let res;
    if (ast.name === dir) {
      res = node;
    }
    return res ?? null;
  }

  /**
   * match language pseudo-class - :lang()
   * @see https://datatracker.ietf.org/doc/html/rfc4647#section-3.3.1
   * @private
   * @param {object} ast - AST
   * @param {object} node - Element node
   * @returns {?object} - matched node
   */
  _matchLanguagePseudoClass(ast, node) {
    if (ast.name === EMPTY) {
      return null;
    }
    const astName = unescapeSelector(ast.name);
    if (typeof astName === 'string' && astName !== ast.name) {
      ast.name = astName;
    }
    let res;
    if (astName === '*') {
      if (node.hasAttribute('lang')) {
        if (node.getAttribute('lang')) {
          res = node;
        }
      } else {
        let parent = node.parentNode;
        while (parent) {
          if (parent.nodeType === ELEMENT_NODE) {
            if (parent.hasAttribute('lang')) {
              if (parent.getAttribute('lang')) {
                res = node;
              }
              break;
            }
            parent = parent.parentNode;
          } else {
            break;
          }
        }
      }
    } else if (astName) {
      const reg = new RegExp(`^(?:\\*-)?${ALPHA_NUM}${LANG_PART}$`, 'i');
      if (reg.test(astName)) {
        let regExtendedLang;
        if (astName.indexOf('-') > -1) {
          const [langMain, langSub, ...langRest] = astName.split('-');
          let extendedMain;
          if (langMain === '*') {
            extendedMain = `${ALPHA_NUM}${LANG_PART}`;
          } else {
            extendedMain = `${langMain}${LANG_PART}`;
          }
          const extendedSub = `-${langSub}${LANG_PART}`;
          const len = langRest.length;
          let extendedRest = '';
          if (len) {
            for (let i = 0; i < len; i++) {
              extendedRest += `-${langRest[i]}${LANG_PART}`;
            }
          }
          regExtendedLang =
            new RegExp(`^${extendedMain}${extendedSub}${extendedRest}$`, 'i');
        } else {
          regExtendedLang = new RegExp(`^${astName}${LANG_PART}$`, 'i');
        }
        if (node.hasAttribute('lang')) {
          if (regExtendedLang.test(node.getAttribute('lang'))) {
            res = node;
          }
        } else {
          let parent = node.parentNode;
          while (parent) {
            if (parent.nodeType === ELEMENT_NODE) {
              if (parent.hasAttribute('lang')) {
                const value = parent.getAttribute('lang');
                if (regExtendedLang.test(value)) {
                  res = node;
                }
                break;
              }
              parent = parent.parentNode;
            } else {
              break;
            }
          }
        }
      }
    }
    return res ?? null;
  }

  /**
   * match selector
   * @param {object} ast - AST
   * @param {object} node - Element node
   * @param {object} opt - options
   * @param {boolean} validated - args are validated
   * @returns {?object} - matched node
   */
  matchSelector(ast, node, opt = {}, validated = false) {
    if (!validated) {
      if (!ast || !ast.type) {
        throw new TypeError(`Unexpected ast type ${getType(ast)}`);
      } else if (!node || !node.nodeType) {
        throw new TypeError(`Unexpected node type ${getType(node)}`);
      } else if (node.nodeType !== ELEMENT_NODE) {
        throw new TypeError(`Unexpected node ${node.nodeName}`);
      }
    }
    let matched;
    switch (ast.type) {
      case SELECTOR_ATTR: {
        matched = this._matchAttributeSelector(ast, node);
        break;
      }
      case SELECTOR_TYPE: {
        matched = this._matchTypeSelector(ast, node, opt ?? {});
        break;
      }
      default: {
        const { children: [child], name: astName } = ast;
        if (astName === 'dir') {
          matched = this._matchDirectionPseudoClass(child, node);
        } else if (astName === 'lang') {
          matched = this._matchLanguagePseudoClass(child, node);
        }
      }
    }
    return matched;
  }
}
