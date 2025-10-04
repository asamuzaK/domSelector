/**
 * matcher.js
 */

/* import */
import { generateCSS, parseAstName, unescapeSelector } from './parser.js';
import {
  findAttributeValues,
  findLangAttribute,
  getCaseSensitivity,
  getDirectionality,
  getType,
  isContentEditable,
  isCustomElement
} from './utility.js';

/* constants */
import {
  ALPHA_NUM,
  ELEMENT_NODE,
  FORM_PARTS,
  IDENT,
  KEY_INPUT_EDIT,
  KEY_PS_ELEMENT,
  KEY_PS_ELEMENT_FUNC,
  LANG_PART,
  NOT_SUPPORTED_ERR,
  PS_ELEMENT_SELECTOR,
  STRING,
  SYNTAX_ERR
} from './constant.js';
const KEY_FORM_PS_DISABLED = new Set([
  ...FORM_PARTS,
  'fieldset',
  'optgroup',
  'option'
]);
const REG_VALID_LANG = new RegExp(`^(?:\\*-)?${ALPHA_NUM}${LANG_PART}$`, 'i');

/**
 * Matches a pseudo-element selector against supported and known types.
 * @param {string} astName - The name of the pseudo-element from the AST.
 * @param {string} astType - The type of the node from the AST.
 * @param {object} [opt] - Options.
 * @param {boolean} [opt.forgive] - If true, ignores unknown pseudo-element.
 * @param {boolean} [opt.warn] - If true, throws for unsupported pseudo-element.
 * @throws {DOMException} If the pseudo-element is invalid or unsupported.
 * @returns {void}
 */
export const matchPseudoElementSelector = (astName, astType, opt = {}) => {
  if (astType !== PS_ELEMENT_SELECTOR) {
    throw new TypeError(`Unexpected ast type ${getType(astType)}`);
  }
  const { forgive, warn } = opt;
  const isKnown =
    KEY_PS_ELEMENT.has(astName) ||
    KEY_PS_ELEMENT_FUNC.has(astName) ||
    astName.startsWith('-webkit-');
  if (!isKnown && !forgive && !warn) {
    throw new DOMException(`Unknown pseudo-element ::${astName}`, SYNTAX_ERR);
  } else if (warn) {
    let msg = '';
    if (KEY_PS_ELEMENT_FUNC.has(astName)) {
      msg = `Unsupported pseudo-element ::${astName}()`;
    } else if (astName.startsWith('-webkit-')) {
      msg = `Unsupported pseudo-element ::${astName}`;
    } else {
      msg = `Unsupported pseudo-element ::${astName}`;
    }
    throw new DOMException(msg, NOT_SUPPORTED_ERR);
  }
};

/**
 * Matches the :dir() pseudo-class against an element's directionality.
 * @param {object} ast - The :dir() pseudo-class AST node.
 * @param {object} node - The element node to check.
 * @returns {boolean} True if the element's directionality matches the selector.
 * @throws {TypeError} If the AST node does not contain a valid direction name.
 */
export const matchDirectionPseudoClass = (ast, node) => {
  const { name } = ast;
  // The AST must provide a non-empty string for the direction.
  if (typeof name !== 'string' || name === '') {
    const type = name === '' ? '(empty String)' : getType(name);
    throw new TypeError(`Unexpected ast type ${type}`);
  }
  const dir = getDirectionality(node);
  return name === dir;
};

/**
 * Matches the :lang() pseudo-class against an element's language.
 * @see https://datatracker.ietf.org/doc/html/rfc4647#section-3.3.1
 * @param {object} ast - The :lang() pseudo-class AST node.
 * @param {object} node - The element node to check.
 * @returns {boolean} True if the element's language matches the selector.
 */
export const matchLanguagePseudoClass = (ast, node) => {
  const { name, type, value } = ast;
  let astName;
  if (type === STRING && value) {
    astName = value;
  } else if (type === IDENT && name) {
    astName = unescapeSelector(name);
  } else {
    // No valid language identifier provided in the selector.
    return false;
  }
  const effectiveLang = findLangAttribute(node);
  // If no language is defined on the element or its ancestors, it cannot match.
  if (typeof effectiveLang !== 'string') {
    return false;
  }
  // Handle the wildcard selector :lang(*)
  if (astName === '*') {
    return effectiveLang !== '';
  }
  // Validate the provided language.
  if (!REG_VALID_LANG.test(astName)) {
    return false;
  }
  // Build the extended language range regex for matching.
  let regExtendedLang;
  if (astName.includes('-')) {
    const [langMain, langSub, ...langRest] = astName.split('-');
    let extendedMain = `${ALPHA_NUM}${LANG_PART}`;
    if (langMain !== '*') {
      extendedMain = `${langMain}${LANG_PART}`;
    }
    const extendedSub = `-${langSub}${LANG_PART}`;
    const extendedRest = langRest.map(part => `-${part}${LANG_PART}`).join('');
    regExtendedLang = new RegExp(
      `^${extendedMain}${extendedSub}${extendedRest}$`,
      'i'
    );
  } else {
    regExtendedLang = new RegExp(`^${astName}${LANG_PART}$`, 'i');
  }
  return regExtendedLang.test(effectiveLang);
};

/**
 * Matches the :disabled and :enabled pseudo-classes.
 * @param {string} astName - pseudo-class name
 * @param {object} node - Element node
 * @returns {boolean} - True if matched
 */
export const matchDisabledEnabledPseudo = (astName = '', node = {}) => {
  if (!/^(?:dis|en)abled$/.test(astName) || node?.nodeType !== ELEMENT_NODE) {
    return false;
  }
  const { localName, parentNode } = node;
  if (
    !KEY_FORM_PS_DISABLED.has(localName) &&
    !isCustomElement(node, { formAssociated: true })
  ) {
    return false;
  }
  let isDisabled = false;
  if (node.disabled || node.hasAttribute('disabled')) {
    isDisabled = true;
  } else if (localName === 'option') {
    if (
      parentNode &&
      parentNode.localName === 'optgroup' &&
      (parentNode.disabled || parentNode.hasAttribute('disabled'))
    ) {
      isDisabled = true;
    }
  } else if (localName !== 'optgroup') {
    let current = parentNode;
    while (current) {
      if (
        current.localName === 'fieldset' &&
        (current.disabled || current.hasAttribute('disabled'))
      ) {
        // The first <legend> in a disabled <fieldset> is not disabled.
        let legend;
        let element = current.firstElementChild;
        while (element) {
          if (element.localName === 'legend') {
            legend = element;
            break;
          }
          element = element.nextElementSibling;
        }
        if (!legend || !legend.contains(node)) {
          isDisabled = true;
        }
        // Found the containing fieldset, stop searching up.
        break;
      }
      current = current.parentNode;
    }
  }
  if (astName === 'disabled') {
    return isDisabled;
  }
  return !isDisabled;
};

/**
 * Match the :read-only and :read-write pseudo-classes
 * @param {string} astName - pseudo-class name
 * @param {object} node - Element node
 * @returns {boolean} - True if matched
 */
export const matchReadOnlyWritePseudo = (astName, node) => {
  if (
    !/^read-(?:only|write)$/.test(astName) ||
    node?.nodeType !== ELEMENT_NODE
  ) {
    return false;
  }
  const { localName } = node;
  let isReadOnly = false;
  switch (localName) {
    case 'textarea':
    case 'input': {
      const isEditableInput = !node.type || KEY_INPUT_EDIT.has(node.type);
      if (localName === 'textarea' || isEditableInput) {
        isReadOnly =
          node.readOnly ||
          node.hasAttribute('readonly') ||
          node.disabled ||
          node.hasAttribute('disabled');
      } else {
        // Non-editable input types are always read-only
        isReadOnly = true;
      }
      break;
    }
    default: {
      isReadOnly = !isContentEditable(node);
    }
  }
  if (astName === 'read-only') {
    return isReadOnly;
  }
  return !isReadOnly;
};

/**
 * Matches an attribute selector against an element.
 * @param {object} ast - The attribute selector AST node.
 * @param {object} node - The element node to check.
 * @param {object} [opt] - Options.
 * @param {boolean} [opt.check] - Internal flag for nwsapi compatibility.
 * @param {boolean} [opt.forgive] - If true, forgive invalid syntax.
 * @returns {boolean} True if the element matches the attribute selector.
 */
export const matchAttributeSelector = (ast, node, opt = {}) => {
  const {
    flags: astFlags,
    matcher: astMatcher,
    name: astName,
    value: astValue
  } = ast;
  const { check, forgive } = opt;
  if (typeof astFlags === 'string' && !/^[is]$/i.test(astFlags) && !forgive) {
    const css = generateCSS(ast);
    throw new DOMException(`Invalid selector ${css}`, SYNTAX_ERR);
  }
  if (!node.attributes?.length) {
    return false;
  }
  const {
    ownerDocument: { contentType }
  } = node;
  const caseSensitive = getCaseSensitivity(astFlags, contentType);
  let astAttrName = unescapeSelector(astName.name);
  if (!caseSensitive) {
    astAttrName = astAttrName.toLowerCase();
  }
  const { prefix: astPrefix, localName: astLocalName } =
    parseAstName(astAttrName);
  if (astAttrName.includes('|')) {
    const { prefix: astPrefix } = parseAstName(astAttrName);
    if (astPrefix !== '' && astPrefix !== '*' && !check) {
      if (forgive) {
        return false;
      }
      const css = generateCSS(ast);
      throw new DOMException(`Invalid selector ${css}`, SYNTAX_ERR);
    }
  }
  const values = findAttributeValues(node, {
    astAttrName,
    astLocalName,
    astPrefix,
    caseSensitive
  });
  if (!values.length) {
    return false;
  }
  // If there's no matcher in the selector (e.g., [disabled]), a match is found.
  if (!astMatcher) {
    return true;
  }
  let selectorValue = '';
  if (astValue.type === IDENT) {
    selectorValue = caseSensitive ? astValue.name : astValue.name.toLowerCase();
  } else if (astValue.type === STRING) {
    selectorValue = caseSensitive
      ? astValue.value
      : astValue.value.toLowerCase();
  }
  switch (astMatcher) {
    case '~=': {
      return (
        !!selectorValue &&
        values.some(v => v.split(/\s+/).includes(selectorValue))
      );
    }
    case '|=': {
      return (
        !!selectorValue &&
        values.some(
          v => v === selectorValue || v.startsWith(`${selectorValue}-`)
        )
      );
    }
    case '^=': {
      return !!selectorValue && values.some(v => v.startsWith(selectorValue));
    }
    case '$=': {
      return !!selectorValue && values.some(v => v.endsWith(selectorValue));
    }
    case '*=': {
      return !!selectorValue && values.some(v => v.includes(selectorValue));
    }
    case '=':
    default: {
      return values.some(v => v === selectorValue);
    }
  }
};

/**
 * Matches a type selector (e.g., 'div', 'ns|E') against an element.
 * @param {object} ast - The type selector AST node.
 * @param {object} node - The element node to check.
 * @param {object} [opt] - Options.
 * @param {boolean} [opt.check] - Internal flag for nwsapi compatibility.
 * @param {boolean} [opt.forgive] - If true, forgive undeclared namespaces.
 * @returns {boolean} True if the element matches the type selector.
 */
export const matchTypeSelector = (ast, node, opt = {}) => {
  const astName = unescapeSelector(ast.name);
  const { localName, namespaceURI, prefix } = node;
  const { check, forgive } = opt;
  let { prefix: astPrefix, localName: astLocalName } = parseAstName(
    astName,
    node
  );
  if (
    node.ownerDocument.contentType === 'text/html' &&
    (!namespaceURI || namespaceURI === 'http://www.w3.org/1999/xhtml') &&
    /[A-Z][\w-]*/i.test(localName)
  ) {
    astPrefix = astPrefix.toLowerCase();
    astLocalName = astLocalName.toLowerCase();
  }
  let nodePrefix = '';
  let nodeLocalName = '';
  // just in case that the namespaced content is parsed as text/html
  if (localName.includes(':')) {
    [nodePrefix, nodeLocalName] = localName.split(':');
  } else {
    nodePrefix = prefix || '';
    nodeLocalName = localName;
  }
  switch (astPrefix) {
    case '': {
      if (
        !nodePrefix &&
        !namespaceURI &&
        (astLocalName === '*' || astLocalName === nodeLocalName)
      ) {
        return true;
      }
      return false;
    }
    case '*': {
      if (astLocalName === '*' || astLocalName === nodeLocalName) {
        return true;
      }
      return false;
    }
    default: {
      if (!check) {
        if (forgive) {
          return false;
        }
        const css = generateCSS(ast);
        throw new DOMException(`Invalid selector ${css}`, SYNTAX_ERR);
      }
      const astNS = node.lookupNamespaceURI(astPrefix);
      const nodeNS = node.lookupNamespaceURI(nodePrefix);
      if (astNS === nodeNS && astPrefix === nodePrefix) {
        if (astLocalName === '*' || astLocalName === nodeLocalName) {
          return true;
        }
        return false;
      } else if (!forgive && !astNS) {
        throw new DOMException(`Undeclared namespace ${astPrefix}`, SYNTAX_ERR);
      }
      return false;
    }
  }
};
