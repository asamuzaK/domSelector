/**
 * matcher.js
 */

/* api */
const { parseSelector, walkAst } = require('./parser.js');

/* constants */
const {
  ATTRIBUTE_SELECTOR, CLASS_SELECTOR, COMBINATOR, IDENTIFIER, ID_SELECTOR,
  NTH, PSEUDO_CLASS_SELECTOR, TYPE_SELECTOR
} = require('./constant.js');
const ELEMENT_NODE = 1;
const REG_PSEUDO_NTH = /^nth-(?:last-)?(?:child|of-type)$/;
const REG_PSEUDO_FUNC = /^(?:(?:ha|i)s|not|where)$/;

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
  if (nodeType === ELEMENT_NODE &&
      Number.isInteger(a) && Number.isInteger(b)) {
    const arr = [...parentNode.children];
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
  if (nodeType === ELEMENT_NODE &&
      Number.isInteger(a) && Number.isInteger(b)) {
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
 * @returns {?object} - matched node
 */
const matchTypeSelector = (leaf = {}, node = {}) => {
  const { name: leafName, type: leafType } = leaf;
  const { localName, nodeType, prefix } = node;
  let res;
  if (leafType === TYPE_SELECTOR && nodeType === ELEMENT_NODE) {
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
 * @returns {?object} - matched node
 */
const matchClassSelector = (leaf = {}, node = {}) => {
  const { name: leafName, type: leafType } = leaf;
  const { classList, nodeType } = node;
  let res;
  if (leafType === CLASS_SELECTOR && nodeType === ELEMENT_NODE &&
      classList.contains(leafName)) {
    res = node;
  }
  return res || null;
};

/**
 * match ID selector
 * @param {object} leaf - ast leaf
 * @param {object} node - element node
 * @returns {?object} - matched node
 */
const matchIdSelector = (leaf = {}, node = {}) => {
  const { name: leafName, type: leafType } = leaf;
  const { id, nodeType } = node;
  let res;
  if (leafType === ID_SELECTOR && nodeType === ELEMENT_NODE &&
      leafName === id) {
    res = node;
  }
  return res || null;
};

/**
 * match attribute selector
 * @param {object} leaf - ast leaf
 * @param {object} node - element node
 * @returns {?object} - matched node
 */
const matchAttributeSelector = (leaf = {}, node = {}) => {
  const {
    flags: leafFlags, matcher: leafMatcher, name: leafName, type: leafType,
    value: leafValue
  } = leaf;
  const { attributes, nodeType } = node;
  let res;
  if (leafType === ATTRIBUTE_SELECTOR && nodeType === ELEMENT_NODE &&
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
 * @returns {Array.<object|undefined>} - collection of matched nodes
 */
const matchAnPlusB = (leafName, leaf = {}, node = {}) => {
  const res = [];
  if (typeof leafName === 'string') {
    leafName = leafName.trim();
    if (REG_PSEUDO_NTH.test(leafName)) {
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
      if (leafType === NTH && nodeType === ELEMENT_NODE) {
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
              const arr = collectNthChild(node, opt);
              if (arr.length) {
                res.push(...arr);
              }
            } else if (/^nth-(?:last-)?of-type$/.test(leafName)) {
              const arr = collectNthOfType(node, opt);
              if (arr.length) {
                res.push(...arr);
              }
            }
          }
        }
      }
    }
  }
  return res;
};

/**
 * match language pseudo class
 * @see https://datatracker.ietf.org/doc/html/rfc4647#section-3.3.1
 * @param {object} leaf - ast leaf
 * @param {object} node - element node
 * @returns {?object} - matched node
 */
const matchLanguagePseudoClass = (leaf = {}, node = {}) => {
  const { name: leafName, type: leafType } = leaf;
  const { lang, nodeType } = node;
  let res;
  if (leafType === IDENTIFIER && nodeType === ELEMENT_NODE) {
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
 * @returns {Array.<object|undefined>} - collection of matched nodes
 */
const matchPseudoClassSelector = (
  leaf = {},
  node = {},
  refPoint = {}
) => {
  const { children: leafChildren, name: leafName, type: leafType } = leaf;
  const { nodeType, ownerDocument } = node;
  const res = [];
  if (leafType === PSEUDO_CLASS_SELECTOR && nodeType === ELEMENT_NODE) {
    if (Array.isArray(leafChildren)) {
      const [leafChildAst] = leafChildren;
      // :nth-child(), :nth-last-child(), nth-of-type(), :nth-last-of-type()
      if (REG_PSEUDO_NTH.test(leafName)) {
        const arr = matchAnPlusB(leafName, leafChildAst, node);
        if (arr.length) {
          res.push(...arr);
        }
      } else {
        switch (leafName) {
          case 'dir':
            if (leafChildAst.name === node.dir) {
              res.push(node);
            }
            break;
          case 'lang':
            if (matchLanguagePseudoClass(leafChildAst, node)) {
              res.push(node);
            }
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
            res.push(node);
          }
          break;
        case 'local-link':
          // FIXME: what about namespaced href? e.g. xlink:href
          if (node.hasAttribute('href')) {
            const attrURL = new URL(node.getAttribute('href'), docURL.href);
            if (attrURL.origin === docURL.origin &&
                attrURL.pathname === docURL.pathname) {
              res.push(node);
            }
          }
          break;
        case 'visited':
          // prevent fingerprinting
          break;
        case 'target':
          if (docURL.hash && node.id && docURL.hash === `#${node.id}`) {
            res.push(node);
          }
          break;
        case 'scope':
          if (refPoint?.nodeType === ELEMENT_NODE) {
            if (node === refPoint) {
              res.push(node);
            }
          } else if (node === root) {
            res.push(node);
          }
          break;
        case 'focus':
          if (node === ownerDocument.activeElement) {
            res.push(node);
          }
          break;
        case 'open':
          if (node.hasAttribute('open')) {
            res.push(node);
          }
          break;
        case 'closed':
          // FIXME: is this really okay?
          if (!node.hasAttribute('open')) {
            res.push(node);
          }
          break;
        case 'disabled':
          if (node.hasAttribute('disabled')) {
            res.push(node);
          }
          break;
        case 'enabled':
          // FIXME: is this really okay?
          if (!node.hasAttribute('disabled')) {
            res.push(node);
          }
          break;
        case 'checked':
          if (node.checked) {
            res.push(node);
          }
          break;
        case 'required':
          if (node.required) {
            res.push(node);
          }
          break;
        case 'optional':
          // FIXME: is this really okay?
          if (!node.required) {
            res.push(node);
          }
          break;
        case 'root':
          if (node === root) {
            res.push(node);
          }
          break;
        case 'first-child':
          if (node === node.parentNode.firstElementChild) {
            res.push(node);
          }
          break;
        case 'last-child':
          if (node === node.parentNode.lastElementChild) {
            res.push(node);
          }
          break;
        case 'only-child':
          if (node === node.parentNode.firstElementChild &&
              node === node.parentNode.lastElementChild) {
            res.push(node);
          }
          break;
        case 'first-of-type': {
          const [node1] = collectNthOfType(node, {
            a: 0,
            b: 0
          });
          if (node1) {
            res.push(node1);
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
            res.push(node1);
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
            res.push(node);
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
  return res;
};

/**
 * Matcher
 */
class Matcher {
  /**
   * construct
   * @param {string} selector - CSS selector
   * @param {object} refPoint - reference point
   */
  constructor(selector, refPoint) {
    this.ast = parseSelector(selector);
    this.selector = selector;
    this.node = refPoint;
    this.ownerDocument = refPoint?.ownerDocument ?? refPoint;
  }

  /**
   * create iterator
   * @param {object} ast - ast
   * @param {object} root - root node
   * @returns {object} - iterator
   */
  _createIterator(ast = this.ast, root = this.node) {
    const iterator = this.ownerDocument.createNodeIterator(
      root,
      NodeFilter.SHOW_ELEMENT,
      node => {
        const arr = this._match(ast, node);
        return arr.length ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    );
    return iterator;
  }

  /**
   * parse ast and run
   * @param {object} ast - ast tree
   * @param {object} node - element node
   * @returns {Array.<object|undefined>} - collection of matched nodes
   */
  _parseAst(ast, node) {
    const res = new Set();
    const items = walkAst(ast);
    if (items.length) {
      for (const item of items) {
        const arr = this._matchSelector(item, node);
        if (arr.length) {
          for (const i of arr) {
            res.add(i);
          }
        }
      }
    }
    return [...res];
  }

  /**
   * match adjacent leaves
   * @param {Array.<object>} leaves - array of ast leaves
   * @param {object} node - element node
   * @returns {?object} - matched node
   */
  _matchAdjacentLeaves(leaves, node) {
    const [prevLeaf, nextLeaf] = leaves;
    const nodes = new Set();
    const iterator = this._createIterator(prevLeaf, node);
    let prevNode = iterator.nextNode();
    while (prevNode) {
      const arr = this._match(prevLeaf, prevNode);
      if (arr.length) {
        for (const item of arr) {
          const a = this._match(nextLeaf, item);
          if (a.length) {
            for (const i of a) {
              nodes.add(i);
            }
          }
        }
      }
      prevNode = iterator.nextNode();
    }
    let res;
    const items = [...nodes];
    for (const item of items) {
      if (item === node) {
        res = item;
        break;
      }
    }
    return res || null;
  }

  /**
   * match combinator
   * @param {Array.<object>} leaves - array of ast leaves
   * @param {object} prevNode - element node
   * @returns {Array} - matched nodes
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
          for (const i of arr) {
            nodes.add(i);
          }
        }
        nextNode = iterator.nextNode();
      }
      while (items.length) {
        const leaf = items.shift();
        if (nodes.size) {
          nodes.forEach(node => {
            const arr = this._match(leaf, node);
            if (!arr.length) {
              nodes.delete(node);
            }
          });
        }
      }
    }
    const res = new Set();
    if (nodes.size && /^[ >+~]$/.test(comboName)) {
      const items = [...nodes];
      for (const item of items) {
        let refNode = item;
        switch (comboName) {
          case '>':
            if (refNode.parentNode === prevNode) {
              res.add(item);
            }
            break;
          case '~':
            refNode = refNode.previousElementSibling;
            while (refNode) {
              if (refNode === prevNode) {
                res.add(item);
                break;
              }
              refNode = refNode.previousElementSibling;
            }
            break;
          case '+':
            if (refNode.previousElementSibling === prevNode) {
              res.add(item);
            }
            break;
          default:
            refNode = refNode.parentNode;
            while (refNode) {
              if (refNode === prevNode) {
                res.add(item);
                break;
              }
              refNode = refNode.parentNode;
            }
        }
      }
    }
    return [...res];
  }

  /**
   * match argument leaf
   * @param {object} leaf - argument ast leaf
   * @param {object} node - element node
   * @returns {Array} - matched nodes
   */
  _matchArgumentLeaf(leaf, node) {
    const res = new Set();
    const iterator = this._createIterator(leaf, node);
    let nextNode = iterator.nextNode();
    while (nextNode) {
      const arr = this._match(leaf, nextNode);
      if (arr.length) {
        for (const i of arr) {
          res.add(i);
        }
      }
      nextNode = iterator.nextNode();
    }
    return [...res];
  }

  /**
   * match logical pseudo class functions - :is(), :has(), :not(), :where()
   * @param {object} leaf - ast leaf
   * @param {Array} leaves - following ast leaves
   * @param {object} node - element node
   * @returns {?object} - matched node
   */
  _matchLogicalPseudoClassFunc(leaf, leaves, node) {
    const nextNodes = new Set();
    const ast = walkAst(leaf);
    if (ast.length) {
      const { name: leafName } = leaf;
      switch (leafName) {
        // :has()
        case 'has': {
          let matched;
          for (const items of ast) {
            const item = items.shift();
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
            nextNodes.add(node);
          }
          break;
        }
        // :not()
        case 'not': {
          let matched;
          for (const items of ast) {
            const item = items.shift();
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
            nextNodes.add(node);
          }
          break;
        }
        // :is(), :where()
        default: {
          let matched;
          for (const items of ast) {
            const item = items.shift();
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
            nextNodes.add(node);
          }
        }
      }
    }
    const res = new Set();
    if (nextNodes.size) {
      if (leaves.length) {
        nextNodes.forEach(nextNode => {
          const arr = this._matchSelector(leaves, nextNode);
          if (arr.length) {
            for (const i of arr) {
              res.add(i);
            }
          }
        });
      } else {
        const items = nextNodes.values();
        for (const item of items) {
          res.add(item);
        }
      }
    }
    return [...res];
  }

  /**
   * match selector
   * @param {Array.<object>} children - selector children
   * @param {object} node - element node
   * @returns {Array<object|undefined>} - array of nodes if matched
   */
  _matchSelector(children, node) {
    const res = new Set();
    const [{ name: firstChildName, type: firstChildType }] = children;
    let iteratorLeaf;
    if (firstChildType === COMBINATOR ||
        (firstChildType === PSEUDO_CLASS_SELECTOR &&
         REG_PSEUDO_NTH.test(firstChildName))) {
      iteratorLeaf = {
        name: '*',
        type: TYPE_SELECTOR
      };
    } else {
      iteratorLeaf = children.shift();
    }
    const iterator = this._createIterator(iteratorLeaf, node);
    let nextNode = iterator.nextNode();
    while (nextNode) {
      const [...items] = children;
      if (items.length) {
        if (items.length === 1) {
          const item = items.shift();
          const arr = this._match(item, nextNode);
          if (arr.length) {
            for (const i of arr) {
              res.add(i);
            }
          }
        } else {
          do {
            const item = items.shift();
            const { type: itemType } = item;
            if (itemType === COMBINATOR) {
              const leaves = [];
              leaves.push(item);
              while (items.length) {
                const [nextItem] = items;
                if (nextItem.type === COMBINATOR ||
                    (nextItem.type === PSEUDO_CLASS_SELECTOR &&
                     REG_PSEUDO_NTH.test(nextItem.name)) ||
                    (nextItem.type === PSEUDO_CLASS_SELECTOR &&
                     REG_PSEUDO_FUNC.test(nextItem.name))) {
                  break;
                } else {
                  leaves.push(items.shift());
                }
              }
              const arr = this._matchCombinator(leaves, nextNode);
              if (!arr.length || arr.length === 1) {
                [nextNode] = arr;
              } else if (items.length) {
                for (const i of arr) {
                  const a = this._matchSelector(items, i);
                  if (a.length) {
                    for (const j of a) {
                      res.add(j);
                    }
                  }
                }
              }
            } else if (item.type === PSEUDO_CLASS_SELECTOR &&
                       REG_PSEUDO_NTH.test(item.name)) {
              const arr = this._match(item, nextNode);
              if (!arr.length || arr.length === 1) {
                [nextNode] = arr;
              } else {
                for (const i of arr) {
                  const a = this._matchSelector(items, i);
                  if (a.length) {
                    for (const j of a) {
                      res.add(j);
                    }
                  }
                }
              }
            } else if (item.type === PSEUDO_CLASS_SELECTOR &&
                       REG_PSEUDO_FUNC.test(item.name)) {
              const leaves = [];
              while (items.length) {
                leaves.push(items.shift());
              }
              const arr =
                this._matchLogicalPseudoClassFunc(item, leaves, nextNode);
              if (arr.length) {
                for (const i of arr) {
                  res.add(i);
                }
              }
            } else {
              [nextNode] = this._match(item, nextNode);
            }
          } while (items.length && nextNode);
          if (nextNode) {
            res.add(nextNode);
          }
        }
      } else if (nextNode) {
        res.add(nextNode);
      }
      nextNode = iterator.nextNode();
    }
    return [...res];
  }

  /**
   * match ast and node
   * @param {object} [ast] - ast tree
   * @param {object} [node] - element node
   * @returns {Array.<object|undefined>} - collection of matched nodes
   */
  _match(ast = this.ast, node = this.node) {
    const res = new Set();
    const { name, type } = ast;
    switch (type) {
      case TYPE_SELECTOR:
        if (matchTypeSelector(ast, node)) {
          res.add(node);
        }
        break;
      case CLASS_SELECTOR:
        if (matchClassSelector(ast, node)) {
          res.add(node);
        }
        break;
      case ID_SELECTOR:
        if (matchIdSelector(ast, node)) {
          res.add(node);
        }
        break;
      case ATTRIBUTE_SELECTOR:
        if (matchAttributeSelector(ast, node)) {
          res.add(node);
        }
        break;
      case PSEUDO_CLASS_SELECTOR:
        if (!REG_PSEUDO_FUNC.test(name)) {
          const arr = matchPseudoClassSelector(ast, node, this.node);
          if (arr.length) {
            for (const i of arr) {
              res.add(i);
            }
          }
        }
        break;
      default: {
        const arr = this._parseAst(ast, node);
        if (arr.length) {
          for (const i of arr) {
            res.add(i);
          }
        }
      }
    }
    return [...res];
  }

  /**
   * matches
   * @returns {boolean} - matched node
   */
  matches() {
    const arr = this._match();
    return !!arr.length;
  }

  /**
   * closest
   * @returns {?object} - matched node
   */
  closest() {
    let res;
    let node = this.node;
    while (node.parentNode) {
      const arr = this._match(this.ast, node);
      const [target] = arr;
      if (target.nodeType === ELEMENT_NODE) {
        res = node;
        break;
      }
      node = node.parentNode;
    }
    return res || null;
  }

  /**
   * query selector
   * @returns {?object} - matched node
   */
  querySelector() {
    const iterator = this._createIterator(this.ast, this.node);
    const res = iterator.nextNode();
    return res || null;
  }

  /**
   * query selector all
   * NOTE: returns Array, not NodeList
   * @returns {Array.<object|undefined>} - collection of matched nodes
   */
  querySelectorAll() {
    const iterator = this._createIterator(this.ast, this.node);
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
