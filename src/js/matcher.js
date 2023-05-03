/**
 * matcher.js
 */

const { parseSelector, walkAst } = require('./parser.js');
const {
  ATTRIBUTE_SELECTOR, CLASS_SELECTOR, COMBINATOR, IDENTIFIER, ID_SELECTOR,
  N_TH, PSEUDO_CLASS_SELECTOR, SELECTOR, TYPE_SELECTOR
} = require('./constant.js');

/**
 * collect nth child
 * @param {object} node - element node
 * @param {object} opt - options
 * @param {number} opt.a - a
 * @param {number} opt.b - b
 * @param {boolean} [opt.reverse] - reverse order
 * @returns {Array.<object>} - collection of matched nodes
 */
const collectNthChild = (node = {}, opt = {}) => {
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
      let nth = b - 1;
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
const collectNthOfType = (node = {}, opt = {}) => {
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
      let nth = b - 1;
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
const matchTypeSelector = (leaf = {}, node = {}) => {
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
const matchClassSelector = (leaf = {}, node = {}) => {
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
const matchIdSelector = (leaf = {}, node = {}) => {
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
const matchAttributeSelector = (leaf = {}, node = {}) => {
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
 * match An+B
 * @param {string} leafName - leaf name
 * @param {object} leaf - ast leaf
 * @param {object} node - element node
 * @returns {?Array.<object|undefined>} - collection of nodes if matched
 */
const matchAnPlusB = (leafName, leaf = {}, node = {}) => {
  let res;
  if (typeof leafName === 'string') {
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
        // FIXME:
        // :nth-child(An+B of S)
        if (leafSelector) {
        }
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
 * match language pseudo class
 * @see https://datatracker.ietf.org/doc/html/rfc4647#section-3.3.1
 * @param {object} leaf - ast leaf
 * @param {object} node - element node
 * @returns {?object} - node if matched
 */
const matchLanguagePseudoClass = (leaf = {}, node = {}) => {
  const { name: leafName, type: leafType } = leaf;
  const { lang, nodeType } = node;
  let res;
  if (leafType === IDENTIFIER && nodeType === Node.ELEMENT_NODE) {
    // FIXME:
    /*
    if (leafName === '') {
      if (!lang) {
        res = node;
      }
    } else if (leafName === '*') {
    }
    */
    if (/[A-Za-z\d-]+/.test(leafName)) {
      const codePart = '(?:-[A-Za-z\\d]+)?';
      let reg;
      if (/-/.test(leafName)) {
        const [langMain, langSub, ...langRest] = leafName.split('-');
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
        reg = new RegExp(`^${leafName}${codePart}$`, 'i');
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
 * match pseudo class selector
 * @param {object} leaf - ast leaf
 * @param {object} node - element node
 * @param {object} [refPoint] - reference point
 * @returns {object|Array.<object|undefined>|null} - node or array of nodes
 */
const matchPseudoClassSelector = (
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
        res = matchAnPlusB(leafName, leafChildAst, node);
      } else {
        switch (leafName) {
          case 'dir':
            if (leafChildAst.name === node.dir) {
              res = node;
            }
            break;
          case 'lang':
            res = matchLanguagePseudoClass(leafChildAst, node);
            break;
          case 'current':
          case 'nth-col':
          case 'nth-last-col':
            console.warn(`Unsupported pseudo class ${leafName}`);
            break;
          default:
            console.warn(`Unknown pseudo class ${leafName}`);
        }
      }
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
          // FIXME: what about namespaced href? e.g. xlink:href
          if (node.hasAttribute('href')) {
            const attrURL = new URL(node.getAttribute('href'), docURL.href);
            if (attrURL.origin === docURL.origin &&
                attrURL.pathname === docURL.pathname) {
              res = node;
            }
          }
          break;
        case 'visited':
          // prevent fingerprinting
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
          console.warn(`Unsupported pseudo class ${leafName}`);
          break;
        default:
          console.warn(`Unknown pseudo class ${leafName}`);
      }
    }
  }
  return res || null;
};

/**
 * Matcher
 */
class Matcher {
  /**
   * construct
   * @param {string} sel - CSS selector
   * @param {object} refPoint - reference point
   */
  constructor(sel, refPoint) {
    this.selector = sel;
    this.node = refPoint;
    this.ownerDocument = refPoint?.ownerDocument ?? refPoint;
  }

  /**
   * create ast
   * @returns {object} - ast
   */
  _createAst() {
    const ast = parseSelector(this.selector);
    return ast;
  }

  /**
   * walk ast
   * @param {object} ast - ast
   * @returns {Array.<object>} - array of selectors
   */
  _walkAst(ast) {
    const selectors = [];
    const opt = {
      enter: leaf => {
        if (leaf.type === SELECTOR) {
          selectors.push(leaf.children);
        }
      },
      leave: leaf => {
        let skip;
        if (leaf.type === SELECTOR) {
          skip = walkAst.skip;
        }
        return skip;
      }
    };
    walkAst(ast, opt);
    return selectors;
  }

  /**
   * parse ast and run
   * @param {object} ast - ast tree
   * @param {object} node - target node
   * @returns {?object} - node if matched
   */
  _parseAst(ast, node) {
    const arr = this._walkAst(ast);
    let res;
    if (arr.length) {
      let hasPseudo;
      for (const i of arr) {
        for (const item of i) {
          const { name, type } = item;
          if (type === PSEUDO_CLASS_SELECTOR && name === 'has') {
            hasPseudo = true;
            break;
          }
        }
        if (hasPseudo) {
          break;
        }
      }
      if (hasPseudo) {
        const [sel] = arr;
        res = this._matchRelationalPseudoClass(sel, node);
      } else if (arr.some(child => this._matchSelectorChild(child, node))) {
        res = node;
      }
    }
    return res || null;
  }

  /**
   * create iterator
   * @param {object} root - root node
   * @returns {object} - iterator
   */
  _createIterator(root) {
    const ast = this._createAst();
    if (!root) {
      root = this.node;
    }
    const iterator = this.ownerDocument.createNodeIterator(
      root,
      NodeFilter.SHOW_ELEMENT,
      node => this._match(ast, node)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT
    );
    return iterator;
  }

  /**
   * match combinator
   * @param {Array.<object>} leaves - array of ast leaves
   * @param {object} node - referrer node
   * @returns {?object} - referenced node if ",\ned
   */
  _matchCombinator(leaves, node) {
    let res;
    if (Array.isArray(leaves) && leaves.length > 1) {
      const [combo, ...items] = leaves;
      const { name: comboName, type: comboType } = combo;
      if (comboType === COMBINATOR) {
        if (!node) {
          node = this.node;
        }
        switch (comboName) {
          case ' ': {
            node = node.parentNode;
            while (node) {
              if (items.every(leaf => this._match(leaf, node))) {
                res = node;
                break;
              }
              node = node.parentNode;
            }
            break;
          }
          case '>': {
            node = node.parentNode;
            if (items.every(leaf => this._match(leaf, node))) {
              res = node;
            }
            break;
          }
          case '+': {
            node = node.previousElementSibling;
            if (items.every(leaf => this._match(leaf, node))) {
              res = node;
            }
            break;
          }
          case '~': {
            node = node.previousElementSibling;
            while (node) {
              if (items.every(leaf => this._match(leaf, node))) {
                res = node;
                break;
              }
              node = node.previousElementSibling;
            }
            break;
          }
          default:
            console.warn(`Unknown combinator ${comboName}`);
        }
      }
    }
    return res || null;
  }

  /**
   * match selector child
   * @param {Array.<object>} child - selector child
   * @param {object} node - target node
   * @returns {?object} - node if matched
   */
  _matchSelectorChild(child, node) {
    let res;
    if (Array.isArray(child) && child.length) {
      const [...items] = child;
      if (!node) {
        node = this.node;
      }
      let refNode = node;
      do {
        const item = items.pop();
        if (item.type === COMBINATOR) {
          const leaves = [];
          leaves.push(item);
          while (items.length) {
            if (items[items.length - 1].type === COMBINATOR) {
              break;
            } else {
              leaves.push(items.pop());
            }
          }
          refNode = this._matchCombinator(leaves, refNode);
        } else {
          const resNode = this._match(item, refNode);
          if (Array.isArray(resNode)) {
            if (!resNode.includes(refNode)) {
              refNode = null;
            }
          } else {
            refNode = resNode;
          }
        }
        if (!refNode) {
          break;
        }
      } while (items.length);
      if (refNode) {
        res = node;
      }
    }
    return res || null;
  }

  /**
   * match logical combination pseudo class - :is(), :not(), :where()
   * @param {object} leaf - ast leaf
   * @param {object} node - target node
   * @returns {?object} - node if matched
   */
  _matchLogicalCombinationPseudoClass(leaf, node) {
    const { name: leafName, type: leafType } = leaf;
    if (!node) {
      node = this.node;
    }
    let res;
    if (leafType === PSEUDO_CLASS_SELECTOR &&
        /^(?:is|not|where)$/.test(leafName) &&
        node.nodeType === Node.ELEMENT_NODE) {
      const arr = this._walkAst(leaf);
      if (arr.length) {
        // :not()
        if (leafName === 'not') {
          if (arr.every(child => !this._matchSelectorChild(child, node))) {
            res = node;
          }
        // :is(), :where()
        } else {
          if (arr.some(child => this._matchSelectorChild(child, node))) {
            res = node;
          }
        }
      }
    }
    return res || null;
  }

  /**
   * match relational pseudo class - :has()
   * @param {object} selectors - array of selectors
   * @param {object} node - target node
   * @returns {?object} - node if matched
   */
  _matchRelationalPseudoClass(selectors, node) {
    // FIXME: later
    console.warn('Unsupported pseudo class :has()');
    return null;
  }

  /**
   * match ast and node
   * @param {object} [ast] - ast tree
   * @param {object} [node] - target node
   * @returns {?object} - matched node
   */
  _match(ast, node) {
    if (!ast) {
      ast = this._createAst();
    }
    if (!node) {
      node = this.node;
    }
    const { name, type } = ast;
    let res;
    switch (type) {
      case TYPE_SELECTOR:
        res = matchTypeSelector(ast, node);
        break;
      case CLASS_SELECTOR:
        res = matchClassSelector(ast, node);
        break;
      case ID_SELECTOR:
        res = matchIdSelector(ast, node);
        break;
      case ATTRIBUTE_SELECTOR:
        res = matchAttributeSelector(ast, node);
        break;
      case PSEUDO_CLASS_SELECTOR:
        // :is(), :not(), :where()
        if (/^(?:is|not|where)$/.test(name)) {
          res = this._matchLogicalCombinationPseudoClass(ast, node);
        } else {
          res = matchPseudoClassSelector(ast, node, this.node);
        }
        break;
      default:
        res = this._parseAst(ast, node);
    }
    return res || null;
  }

  /**
   * matches
   * @returns {boolean} - matched node
   */
  matches() {
    const res = this._match();
    return !!res;
  }

  /**
   * closest
   * @returns {?object} - matched node
   */
  closest() {
    const ast = this._createAst();
    let node = this.node;
    while (node.parentNode) {
      if (this._match(ast, node)) {
        break;
      }
      node = node.parentNode;
    }
    let res;
    if (node.nodeType === Node.ELEMENT_NODE) {
      res = node;
    }
    return res || null;
  }

  /**
   * query selector
   * @returns {?object} - node if matched
   */
  querySelector() {
    const iterator = this._createIterator(this.node);
    const res = iterator.nextNode();
    return res || null;
  }

  /**
   * query selector all
   * NOTE: returns Array, not NodeList
   * @returns {Array.<object|undefined>} - array of nodes if matched
   */
  querySelectorAll() {
    const iterator = this._createIterator(this.node);
    const res = [];
    let currentNode = iterator.nextNode();
    while (currentNode) {
      res.push(currentNode);
      currentNode = iterator.nextNode();
    }
    return res;
  }
};

module.exports = {
  Matcher,
  collectNthChild,
  collectNthOfType,
  matchAnPlusB,
  matchAttributeSelector,
  matchClassSelector,
  matchIdSelector,
  matchLanguagePseudoClass,
  matchPseudoClassSelector,
  matchTypeSelector
};
