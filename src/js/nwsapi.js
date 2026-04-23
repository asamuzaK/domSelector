/**
 * Forked and modified from nwsapi@2.2.2
 * @see https://github.com/dperini/nwsapi
 */

/* import */
import { GenerationalCache } from '@asamuzakjp/generational-cache';
import { getType, isContentEditable } from './utility.js';

// ==========================================
// 1. Module-level Constants & Pure Functions
// ==========================================

const qsNotArgs = 'Not enough arguments';
const qsInvalid = ' is not a valid selector';

const reNthElem = /(:nth(?:-last)?-child)/i;
const reNthType = /(:nth(?:-last)?-of-type)/i;

const none = [];

const F_INIT = '"use strict";return function Resolver(c,f,x,r)';
const S_HEAD = 'var e,n,o,j=r.length-1,k=-1';
const M_HEAD = 'var e,n,o';
const S_LOOP = 'main:while((e=c[++k]))';
const M_LOOP = 'e=c;';
const S_BODY = 'r[++j]=c[k];';
const M_BODY = '';
const S_TAIL = 'continue main;';
const M_TAIL = 'r=true;';

const CFG = {
  operators: '[~*^$|]=|=',
  combinators: '[\\s>+~](?=[^>+~])'
};

const NOT = {
  doubleEnc: '(?=(?:[^"]*"[^"]*")*[^"]*$)',
  singleEnc: "(?=(?:[^']*'[^']*')*[^']*$)",
  parensEnc: '(?![^\\x28]*\\x29)',
  squareEnc: '(?![^\\x5b]*\\x5d)'
};

const REX = {
  regExpChar: /(?:(?!\\)[\\^$.*+?()[\]{}|/])/g,
  trimSpaces: /[\r\n\f]|^\s+|\s+$/g,
  commaGroup: RegExp(
    '(\\s{0,255},\\s{0,255})' + NOT.squareEnc + NOT.parensEnc,
    'g'
  ),
  splitGroup: /((?:\x28[^\x29]{0,255}\x29|\[[^\]]{0,255}\]|\\.|[^,])+)/g,
  combineWSP: RegExp('\\s{1,255}' + NOT.singleEnc + NOT.doubleEnc, 'g'),
  tabCharWSP: RegExp(
    '(\\s?\\t{1,255}\\s?)' + NOT.singleEnc + NOT.doubleEnc,
    'g'
  ),
  pseudosWSP: RegExp('\\s{1,255}([-+])\\s{1,255}' + NOT.squareEnc, 'g')
};

const STD = {
  combinator: /\s?([>+~])\s?/g
};

const ATTR_STD_OPS = Object.assign(Object.create(null), {
  '=': 1,
  '^=': 1,
  '$=': 1,
  '|=': 1,
  '*=': 1,
  '~=': 1
});

const HTML_TABLE = Object.assign(Object.create(null), {
  accept: 1,
  'accept-charset': 1,
  align: 1,
  alink: 1,
  axis: 1,
  bgcolor: 1,
  charset: 1,
  checked: 1,
  clear: 1,
  codetype: 1,
  color: 1,
  compact: 1,
  declare: 1,
  defer: 1,
  dir: 1,
  direction: 1,
  disabled: 1,
  enctype: 1,
  face: 1,
  frame: 1,
  hreflang: 1,
  'http-equiv': 1,
  lang: 1,
  language: 1,
  link: 1,
  media: 1,
  method: 1,
  multiple: 1,
  nohref: 1,
  noresize: 1,
  noshade: 1,
  nowrap: 1,
  readonly: 1,
  rel: 1,
  rev: 1,
  rules: 1,
  scope: 1,
  scrolling: 1,
  selected: 1,
  shape: 1,
  target: 1,
  text: 1,
  type: 1,
  valign: 1,
  valuetype: 1,
  vlink: 1
});

const Operators = Object.assign(Object.create(null), {
  '=': { p1: '^', p2: '$', p3: 'true' },
  '^=': { p1: '^', p2: '', p3: 'true' },
  '$=': { p1: '', p2: '$', p3: 'true' },
  '*=': { p1: '', p2: '', p3: 'true' },
  '|=': { p1: '^', p2: '(-|$)', p3: 'true' },
  '~=': { p1: '(^|\\s)', p2: '(\\s|$)', p3: 'true' }
});

const method = Object.assign(Object.create(null), {
  '#': 'getElementById',
  '*': 'getElementsByTagName',
  '.': 'getElementsByClassName'
});

/**
 * Generates a regular expression that matches a balanced set of parentheses.
 * Outermost parentheses are excluded so any amount of children can be handled.
 * @param {number} [depth] - The max depth of nested parentheses to support.
 * @returns {string} The generated regular expression string.
 */
function createMatchingParensRegex(depth = 1) {
  const out =
    '\\([^)(]*?(?:'.repeat(depth) +
    '\\([^)(]*?\\)' +
    '[^)(]*?)*?\\)'.repeat(depth);
  return out.slice(2, out.length - 2);
}

// Stripped down GROUPS based strictly on what utility.js allows through filterSelector
const GROUPS = {
  logicalsel:
    '(is|not|has)(?:\\x28\\s?(' + createMatchingParensRegex(3) + ')\\s?\\x29)',
  treestruct:
    '(nth(?:-last)?(?:-child|-of-type))(?:\\x28\\s?(even|odd|(?:[-+]?\\d*)(?:n\\s?[-+]?\\s?\\d*)?)\\s?(?:\\x29|$))',
  locationpc: '(any-link|link|target)\\b',
  structural: '(empty|(?:(?:first|last|only)(?:-child|-of-type)))\\b',
  inputstate: '(read-(?:only|write))\\b',
  inputvalue: '(checked|indeterminate)\\b'
};

/**
 * Iterates through nodes and calls a callback function, concatenating elements.
 * @param {Array<Element>|NodeList} nodes - The nodes to process.
 * @param {((element: Element) => boolean | void)=} callback - Optional callback.
 * @returns {Array<Element>} A new array of the processed nodes.
 */
function concatCall(nodes, callback) {
  const l = nodes.length;
  const list = new Array(l);
  for (let i = 0; i < l; i++) {
    if (callback((list[i] = nodes[i])) === false) {
      break;
    }
  }
  return list;
}

/**
 * Pushes nodes from a source array-like object into a target list.
 * @param {Array<Element>} list - The target list.
 * @param {Array<Element>|NodeList} nodes - The nodes to add.
 * @returns {Array<Element>} The mutated target list.
 */
function concatList(list, nodes) {
  for (let i = 0, l = nodes.length; i < l; i++) {
    list.push(nodes[i]);
  }
  return list;
}

/**
 * Checks if a given node belongs to an HTML document.
 * @param {Element|Document} node - The node to evaluate.
 * @returns {boolean} True if it is an HTML document.
 */
function isHTML(node) {
  const d = node.ownerDocument || node;
  return d.nodeType === 9 && d.contentType === 'text/html';
}

/**
 * Checks if the given node is the target fragment in the document's URL.
 * @param {Element} node - The element to check.
 * @returns {boolean} True if the node is the current URL target.
 */
function isTarget(node) {
  const d = node.ownerDocument || node;
  const { hash } = new URL(d.URL);
  if (node.id && hash === `#${node.id}` && d.contains(node)) {
    return true;
  }
  return false;
}

/**
 * Checks if an input element or progress bar is in an indeterminate state.
 * @param {Element} node - The element to evaluate.
 * @returns {boolean} True if the element's state is indeterminate.
 */
function isIndeterminate(node) {
  if (
    (node.indeterminate &&
      node.localName === 'input' &&
      node.type === 'checkbox') ||
    (node.localName === 'progress' && !node.hasAttribute('value'))
  ) {
    return true;
  }
  if (
    node.localName === 'input' &&
    node.type === 'radio' &&
    !node.hasAttribute('checked')
  ) {
    const nodeName = node.name;
    let parent = node.parentNode;
    while (parent) {
      if (parent.localName === 'form') {
        break;
      }
      parent = parent.parentNode;
    }
    if (!parent) {
      parent = node.ownerDocument.documentElement;
    }
    const items = parent.getElementsByTagName('input');
    let checked;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.getAttribute('type') === 'radio') {
        if (nodeName) {
          if (item.getAttribute('name') === nodeName) {
            checked = !!item.checked;
          }
        } else if (!item.hasAttribute('name')) {
          checked = !!item.checked;
        }
        if (checked) {
          break;
        }
      }
    }
    if (!checked) {
      return true;
    }
  }
  return false;
}

/**
 * Performs preliminary string manipulation to optimize deep query lookups.
 * @param {string} selector - The raw selector string.
 * @param {Array<string>} token - Derived RegExp result tokens matching selector end segments.
 * @returns {string} The optimized target selector slice.
 */
function optimize(selector, token) {
  const index = token.index;
  const length = token[1].length + token[2].length;
  let middle = '';
  if (' >+~'.indexOf(selector.charAt(index - 1)) > -1) {
    if (':['.indexOf(selector.charAt(index + length + 1)) > -1) {
      middle = '*';
    }
  }
  let offset = 0;
  if (token[1] === '*') {
    offset = 1;
  }
  return (
    selector.slice(0, index) + middle + selector.slice(index + length - offset)
  );
}

/**
 * Substitutes `:scope` references inside an isolated selector string using local contextual identifiers.
 * @param {string} selectors - The incoming CSS selector array string containing `:scope`.
 * @param {Element|Document} element - The scope base.
 * @returns {string} The scoped and explicitly translated selector string.
 */
function makeref(selectors, element) {
  if (element.nodeType === 9) {
    element = element.documentElement;
  }
  let idPart = '';
  if (element.id) {
    idPart = '#' + element.id;
  }
  let classPart = '';
  if (element.className) {
    classPart = '.' + element.classList[0];
  }
  return selectors.replace(/:scope/gi, element.localName + idPart + classPart);
}

/**
 * Validates the matched resolvers sequentially upon a defined Element.
 * @param {Array<(c: Element, f?: ((element: Element) => boolean|void), x?: null, r?: boolean) => boolean>} f - Collection of factory lambda checking functions.
 * @param {Element} element - The referenced node resolving.
 * @param {((element: Element) => boolean | void)=} callback - Callback operation.
 * @returns {boolean} Whether all condition factories asserted positively.
 */
function matchAssert(f, element, callback) {
  let r = false;
  for (let i = 0, l = f.length; l > i; ++i) {
    if (f[i](element, null, null, false)) {
      r = true;
      break;
    }
  }
  if (r && typeof callback === 'function') {
    callback(element);
  }
  return r;
}

/**
 * Core logic for nth-index calculations for nwsapi.
 * This function is stateless; it relies on the provided 'state' object
 * to persist cache across calls within a specific instance.
 * @param {Element} element - The element to check.
 * @param {boolean|number} dir - Direction/Mode (true: last, false: normal, 2: reset).
 * @param {object} state - The instance-specific cache state.
 * @param {boolean} isOfType - Whether to filter by element type (localName/namespaceURI).
 * @returns {number} The calculated index or -1 if reset.
 */
export function solveNth(element, dir, state, isOfType) {
  if (dir === 2) {
    state.idx = 0;
    state.len = 0;
    state.set = 0;
    state.nodes = [];
    state.parents = [];
    state.parent = undefined;
    return -1;
  }

  const name = isOfType ? element.localName : null;
  const nsURI = isOfType ? element.namespaceURI : null;

  // Reset logic for non-HTML namespaces (specific to nth-of-type)
  if (isOfType && nsURI !== 'http://www.w3.org/1999/xhtml') {
    state.idx = 0;
    state.len = 0;
    state.set = 0;
    state.nodes = [];
    state.parents = [];
    state.parent = undefined;
  }

  let e, i, j, k, l;
  const parentMatch = state.parent === element.parentElement;
  const hasTypeNode = isOfType
    ? state.nodes[state.set] && state.nodes[state.set][name]
    : true;

  if (parentMatch && hasTypeNode) {
    i = state.set;
    j = state.idx;
    l = state.len;
  } else {
    l = state.parents.length;
    state.parent = element.parentElement;
    for (i = -1, j = 0, k = l - 1; l > j; ++j, --k) {
      if (state.parents[j] === state.parent) {
        i = j;
        break;
      }
      if (state.parents[k] === state.parent) {
        i = k;
        break;
      }
    }

    if (i < 0 || (isOfType && !state.nodes[i][name])) {
      state.parents[(i = l)] = state.parent;
      if (isOfType && !state.nodes[i]) state.nodes[i] = Object.create(null);
      l = 0;
      const targetArr = isOfType
        ? (state.nodes[i][name] = [])
        : (state.nodes[i] = []);

      e = (state.parent && state.parent.firstElementChild) || element;
      while (e) {
        if (e === element) j = l;
        if (!isOfType || (e.localName === name && e.namespaceURI === nsURI)) {
          targetArr[l] = e;
          ++l;
        }
        e = e.nextElementSibling;
      }
      state.set = i;
      state.idx = j;
      state.len = l;
      if (l < 2) return l;
    } else {
      l = isOfType ? state.nodes[i][name].length : state.nodes[i].length;
      state.set = i;
    }
  }

  const currentNodes = isOfType ? state.nodes[i][name] : state.nodes[i];
  if (element !== currentNodes[j] && element !== currentNodes[(j = 0)]) {
    for (j = 0, e = currentNodes, k = l - 1; l > j; ++j, --k) {
      if (e[j] === element) break;
      if (e[k] === element) {
        j = k;
        break;
      }
    }
  }
  state.idx = j + 1;
  state.len = l;
  return dir ? l - j : state.idx;
}

// ==========================================
// 2. Instance Factory (Module Isolation)
// ==========================================

/**
 * Entry point binding fast-path module routing configurations.
 * Generates an isolated instance to ensure thread-safety across multiple documents.
 * @param {object} globalRef - Execution environment base reference.
 * @returns {object} Instantiated Object containing publicly exposed utility bindings.
 */
export function nwsapi(globalRef) {
  // Instance-level state
  let doc;
  let QUIRKS_MODE;
  let HTML_DOCUMENT;
  let lastContext;
  let lastMatched;
  let lastSelected;
  let hasDupes = false;

  let reOptimizer;
  let reValidator;

  const Config = {
    CACHE_SIZE: 2048
  };

  const matchLambdas = new GenerationalCache(Config.CACHE_SIZE);
  const selectLambdas = new GenerationalCache(Config.CACHE_SIZE);
  const matchResolvers = new GenerationalCache(Config.CACHE_SIZE);
  const selectResolvers = new GenerationalCache(Config.CACHE_SIZE);

  const Patterns = Object.create(null);

  const nthChildState = {
    idx: 0,
    len: 0,
    set: 0,
    parent: undefined,
    parents: [],
    nodes: []
  };

  const nthTypeState = {
    idx: 0,
    len: 0,
    set: 0,
    parent: undefined,
    parents: [],
    nodes: []
  };

  /**
   * A fast resolver for `:nth-child()` and `:nth-last-child()` pseudo-classes.
   * @param {Element} element - The element to resolve.
   * @param {boolean|number} dir - Direction (false for normal, true for last) or 2 to reset.
   * @returns {number} The element's index.
   */
  function nthElement(element, dir) {
    return solveNth(element, dir, nthChildState, false);
  }

  /**
   * A fast resolver for `:nth-of-type()` and `:nth-last-of-type()` pseudo-classes.
   * @param {Element} element - The element to resolve.
   * @param {boolean|number} dir - Direction (false for normal, true for last) or 2 to reset.
   * @returns {number} The element's index among siblings of the same type.
   */
  function nthOfType(element, dir) {
    return solveNth(element, dir, nthTypeState, true);
  }

  const Snapshot = Object.assign(Object.create(null), {
    isContentEditable,
    isIndeterminate,
    isTarget,
    match: null,
    nthElement,
    nthOfType
  });

  /**
   * Comparison function to sort DOM nodes by document order.
   * @param {Element} a - The first node.
   * @param {Element} b - The second node.
   * @returns {number} Sort indication (-1, 0, or 1).
   */
  function documentOrder(a, b) {
    if (a === b) {
      hasDupes = true;
      return 0;
    }
    if (a.compareDocumentPosition(b) & 4) {
      return -1;
    }
    return 1;
  }

  /**
   * Filters an array of nodes to remove duplicates.
   * @param {Array<Element>} nodes - The sorted array of nodes.
   * @returns {Array<Element>} A new array containing unique nodes.
   */
  function unique(nodes) {
    let i = 0;
    let j = -1;
    let l = nodes.length + 1;
    const list = [];
    while (--l) {
      if (nodes[i++] === nodes[i]) {
        continue;
      }
      list[++j] = nodes[i - 1];
    }
    hasDupes = false;
    return list;
  }

  /**
   * Retrieve elements by ID through an iterative tree walk.
   * Ensures all elements with duplicate IDs are found.
   * @param {string} id - The ID to search for.
   * @param {Element|Document} context - The base element or document.
   * @returns {Array<Element>} The list of matching elements.
   */
  function byId(id, context) {
    let node = context;
    const nodes = [];
    let next = node.firstElementChild;
    while ((node = next)) {
      if (node.id === id) {
        nodes.push(node);
      }
      if ((next = node.firstElementChild || node.nextElementSibling)) {
        continue;
      }
      while (!next && (node = node.parentElement) && node !== context) {
        next = node.nextElementSibling;
      }
    }

    return nodes;
  }

  /**
   * Context-agnostic implementation of `getElementsByTagName`.
   * @param {string} tag - The tag name to search for.
   * @param {Element|Document|DocumentFragment} context - The scope.
   * @returns {Array<Element>} An array of matched elements.
   */
  function byTag(tag, context) {
    let e, nodes;
    const api = method['*'];
    if (api in context) {
      return Array.prototype.slice.call(context[api](tag));
    } else {
      tag = tag.toLowerCase();
      if ((e = context.firstElementChild)) {
        if (!(e.nextElementSibling || tag === '*' || e.localName === tag)) {
          return Array.prototype.slice.call(e[api](tag));
        } else {
          nodes = [];
          do {
            if (tag === '*' || e.localName === tag) {
              nodes.push(e);
            }
            concatList(nodes, e[api](tag));
          } while ((e = e.nextElementSibling));
        }
      } else {
        nodes = none;
      }
    }
    return nodes;
  }

  /**
   * Context-agnostic implementation of `getElementsByClassName`.
   * @param {string} cls - The class name to search for.
   * @param {Element|Document|DocumentFragment} context - The scope.
   * @returns {Array<Element>} An array of matched elements.
   */
  function byClass(cls, context) {
    const api = method['.'];
    return api in context ? Array.prototype.slice.call(context[api](cls)) : [];
  }

  const compat = Object.assign(Object.create(null), {
    '#': function (c, n) {
      return function () {
        return byId(n, c);
      };
    },
    '*': function (c, n) {
      return function () {
        return byTag(n, c);
      };
    },
    '.': function (c, n) {
      return function () {
        return byClass(n, c);
      };
    }
  });

  /**
   * Compiles the necessary Regular Expressions for CSS parsing syntax.
   * @returns {void}
   */
  function setIdentifierSyntax() {
    const identifier = '(?:--|-?[a-z_])[\\w-]*';
    const pseudonames = '[-\\w]+';
    const pseudoparms = '(?:[-+]?\\d*)(?:n\\s?[-+]?\\s?\\d*)';
    const doublequote = '"[^"\\\\]*(?:\\\\.[^"\\\\]*)*(?:"|$)';
    const singlequote = "'[^'\\\\]*(?:\\\\.[^'\\\\]*)*(?:'|$)";

    const attrparser = identifier + '|' + doublequote + '|' + singlequote;
    const attrvalues = '([\\x22\\x27]?)((?!\\3)*|(?:\\\\?.)*?)(?:\\3|$)';

    const attributes =
      '\\[' +
      '\\s?(' +
      identifier +
      '(?::' +
      identifier +
      ')?)\\s?' +
      '(?:(' +
      CFG.operators +
      ')\\s?(?:' +
      attrparser +
      '))?' +
      '(?:\\s?\\b(i))?\\s?' +
      '(?:\\]|$)';

    const attrmatcher = attributes.replace(attrparser, attrvalues);

    const pseudoclass =
      '(?:\\x28\\s*' +
      '(?:' +
      pseudoparms +
      '?)?|' +
      '\\*|' +
      '(?:' +
      '(?::' +
      pseudonames +
      '(?:\\x28' +
      pseudoparms +
      '?(?:\\x29|$))?)|' +
      '(?:[.#]?' +
      identifier +
      ')|' +
      '(?:' +
      attributes +
      ')' +
      ')+|' +
      '\\s?[>+~]\\s?|' +
      '\\s?,\\s?|' +
      '\\s|' +
      '\\x29|$' +
      ')*';

    const standardValidator =
      '(?=\\s?[^>+~(){}<])' +
      '(?:' +
      '\\*|' +
      '(?:[.#]?' +
      identifier +
      ')+|' +
      '(?:' +
      attributes +
      ')+|' +
      '(?:::?' +
      pseudonames +
      pseudoclass +
      ')|' +
      '(?:\\s?' +
      CFG.combinators +
      '\\s?)|' +
      '\\s?,\\s?|' +
      '\\s?' +
      ')+';

    reOptimizer = RegExp(
      '(?:([.:#*]?)(' +
        identifier +
        ')' +
        '(?::[-\\w]+|\\[[^\\]]+(?:\\]|$)|\\x28[^\\x29]+(?:\\x29|$))*' +
        ')$',
      'i'
    );
    reValidator = RegExp(standardValidator, 'gi');

    Patterns.treestruct = RegExp('^:(?:' + GROUPS.treestruct + ')(.*)', 'i');
    Patterns.structural = RegExp('^:(?:' + GROUPS.structural + ')(.*)', 'i');
    Patterns.inputstate = RegExp('^:(?:' + GROUPS.inputstate + ')(.*)', 'i');
    Patterns.inputvalue = RegExp('^:(?:' + GROUPS.inputvalue + ')(.*)', 'i');
    Patterns.locationpc = RegExp('^:(?:' + GROUPS.locationpc + ')(.*)', 'i');
    Patterns.logicalsel = RegExp('^:(?:' + GROUPS.logicalsel + ')(.*)', 'i');
    Patterns.children = /^\s?>\s?(.*)/;
    Patterns.adjacent = /^\s?\+\s?(.*)/;
    Patterns.relative = /^\s?~\s?(.*)/;
    Patterns.ancestor = /^\s+(.*)/;
    Patterns.universal = /^\*(.*)/;
    Patterns.id = RegExp('^#(' + identifier + ')(.*)', 'i');
    Patterns.tagName = RegExp('^(' + identifier + ')(.*)', 'i');
    Patterns.className = RegExp('^\\.(' + identifier + ')(.*)', 'i');
    Patterns.attribute = RegExp('^(?:' + attrmatcher + ')(.*)');
  }

  /**
   * Applies new engine configuration options and conditionally clears internal caches.
   * @param {object|undefined} option - Configuration key/value mapping.
   * @param {boolean} [clear] - Flag dictating whether to purge all lambdas.
   * @returns {boolean|object} The applied configuration state.
   */
  function configure(option, clear) {
    for (const i in option) {
      Config[i] = option[i];
    }
    if (clear) {
      matchLambdas.clear();
      selectLambdas.clear();
      matchResolvers.clear();
      selectResolvers.clear();
    }
    setIdentifierSyntax();
    return true;
  }

  /**
   * Centralized error handler. Securely triggers external fallback mechanisms.
   * @param {string} message - The error message to emit.
   * @param {string} proto - The exception prototype type name.
   * @throws {Error|DOMException} Will always throw to guarantee fallback routing.
   */
  function emit(message, proto) {
    let err;
    const errorName = proto || 'SyntaxError';

    if (globalRef && globalRef.DOMException) {
      err = new globalRef.DOMException(message, errorName);
    } else {
      err = new Error(message);
      err.name = errorName;
    }
    throw err;
  }

  /**
   * Handles swapping the underlying document context for parsing and resolving nodes.
   * @param {Element|Document} context - The new context element or document.
   * @param {boolean} [force] - Forces re-initialization of contextual flags.
   * @returns {Element|Document} The applied context object.
   */
  function switchContext(context, force) {
    const oldDoc = doc;
    doc = context.ownerDocument || context;
    if (force || oldDoc !== doc) {
      HTML_DOCUMENT = isHTML(doc);
      QUIRKS_MODE = HTML_DOCUMENT && doc.compatMode.indexOf('CSS') < 0;
    }
    return context;
  }

  /**
   * Transforms an isolated selector string sequence into an executable javascript logic string.
   * @param {string} expression - The atomic CSS selector expression string.
   * @param {string} source - The ongoing logic code block.
   * @param {boolean|null} mode - Selector compilation mode (`true` for select, `false` for match).
   * @returns {string} The fully compiled JavaScript logic conditional block.
   */
  function compileSelector(expression, source, mode) {
    let a, b, n, f, name, expr, match, symbol, test, type;
    let selector = expression;
    const N = '';
    const D = '!';

    const selectorString = mode ? lastSelected : lastMatched;
    selector = selector.replace(STD.combinator, '$1');

    while (selector) {
      symbol = selector[0];

      switch (symbol) {
        case '*': {
          match = selector.match(Patterns.universal);
          break;
        }
        case '#': {
          match = selector.match(Patterns.id);
          source =
            'if(' +
            N +
            '(/^' +
            match[1] +
            '$/.test(e.getAttribute("id")))){' +
            source +
            '}';
          break;
        }
        case '.': {
          match = selector.match(Patterns.className);
          let compatLocal = '';
          if (QUIRKS_MODE) {
            compatLocal = 'i';
          }
          compatLocal += '.test(e.getAttribute("class"))';
          source =
            'if(' +
            N +
            '(/(^|\\s)' +
            match[1] +
            '(\\s|$)/' +
            compatLocal +
            ')){' +
            source +
            '}';
          break;
        }
        case /[_a-z]/i.test(symbol) ? symbol : undefined: {
          match = selector.match(Patterns.tagName);
          const tagCompare = match[1].toLowerCase();
          source =
            'if(' + N + '(e.localName==="' + tagCompare + '")){' + source + '}';
          break;
        }
        case '[': {
          match = selector.match(Patterns.attribute);
          name = match[1];
          expr = name.split(':');
          if (expr.length === 2) {
            expr = expr[1];
          } else {
            expr = expr[0];
          }
          if (match[2]) {
            test = Operators[match[2]];
          }
          if (match[4] === '') {
            if (match[2] === '~=') {
              test = { p1: '^\\s', p2: '+$', p3: 'true' };
            } else if (match[2] in ATTR_STD_OPS && match[2] !== '~=') {
              test = { p1: '^', p2: '$', p3: 'true' };
            }
          } else if (match[2] === '~=' && match[4].includes(' ')) {
            source = 'if(' + N + 'false){' + source + '}';
            break;
          } else if (match[4]) {
            match[4] = match[4].replace(REX.regExpChar, '\\$&');
          }

          type = '';
          if (
            match[5] === 'i' ||
            (HTML_DOCUMENT && HTML_TABLE[expr.toLowerCase()])
          ) {
            type = 'i';
          }

          let attrCheck = '';
          if (!match[2]) {
            attrCheck = 'e.hasAttribute&&e.hasAttribute("' + name + '")';
          } else if (!match[4] && ATTR_STD_OPS[match[2]] && match[2] !== '~=') {
            attrCheck = 'e.getAttribute&&e.getAttribute("' + name + '")===""';
          } else {
            attrCheck =
              '(/' +
              test.p1 +
              match[4] +
              test.p2 +
              '/' +
              type +
              ').test(e.getAttribute&&e.getAttribute("' +
              name +
              '"))===' +
              test.p3;
          }

          source = 'if(' + N + '(' + attrCheck + ')){' + source + '}';
          break;
        }
        case '~': {
          match = selector.match(Patterns.relative);
          source =
            'n=e;while((e=e.previousElementSibling)){' + source + '}e=n;';
          break;
        }
        case '+': {
          match = selector.match(Patterns.adjacent);
          source = 'n=e;if((e=e.previousElementSibling)){' + source + '}e=n;';
          break;
        }
        case '\x09':
        case '\x20': {
          match = selector.match(Patterns.ancestor);
          source = 'n=e;while((e=e.parentElement)){' + source + '}e=n;';
          break;
        }
        case '>': {
          match = selector.match(Patterns.children);
          source = 'n=e;if((e=e.parentElement)){' + source + '}e=n;';
          break;
        }
        case ':': {
          if ((match = selector.match(Patterns.structural))) {
            match[1] = match[1].toLowerCase();
            switch (match[1]) {
              case 'empty': {
                source =
                  'n=e.firstChild;while(n&&!(/1|3/).test(n.nodeType)){n=n.nextSibling}if(' +
                  D +
                  'n){' +
                  source +
                  '}';
                break;
              }
              case 'only-child': {
                source =
                  'if(' +
                  N +
                  '(!e.nextElementSibling&&!e.previousElementSibling)){' +
                  source +
                  '}';
                break;
              }
              case 'last-child': {
                source = 'if(' + N + '(!e.nextElementSibling)){' + source + '}';
                break;
              }
              case 'first-child': {
                source =
                  'if(' + N + '(!e.previousElementSibling)){' + source + '}';
                break;
              }
              case 'only-of-type': {
                source =
                  'o=e.localName;n=e;while((n=n.nextElementSibling)&&n.localName!==o);if(!n){n=e;while((n=n.previousElementSibling)&&n.localName!==o);}if(' +
                  D +
                  'n){' +
                  source +
                  '}';
                break;
              }
              case 'last-of-type': {
                source =
                  'n=e;o=e.localName;while((n=n.nextElementSibling)&&n.localName!==o);if(' +
                  D +
                  'n){' +
                  source +
                  '}';
                break;
              }
              case 'first-of-type': {
                source =
                  'n=e;o=e.localName;while((n=n.previousElementSibling)&&n.localName!==o);if(' +
                  D +
                  'n){' +
                  source +
                  '}';
                break;
              }
              default:
            }
          } else if ((match = selector.match(Patterns.treestruct))) {
            match[1] = match[1].toLowerCase();
            switch (match[1]) {
              case 'nth-child':
              case 'nth-of-type':
              case 'nth-last-child':
              case 'nth-last-of-type': {
                let exprBool = false;
                if (/-of-type/i.test(match[1])) {
                  exprBool = true;
                }
                if (match[1] && match[2]) {
                  let typeBool = false;
                  if (/last/i.test(match[1])) {
                    typeBool = true;
                  }
                  if (match[2] === 'n') {
                    source = 'if(' + N + 'true){' + source + '}';
                    break;
                  } else if (match[2] === '1') {
                    let testDir = 'previous';
                    if (typeBool) {
                      testDir = 'next';
                    }
                    if (exprBool) {
                      source =
                        'n=e;o=e.localName;while((n=n.' +
                        testDir +
                        'ElementSibling)&&n.localName!==o);if(' +
                        D +
                        'n){' +
                        source +
                        '}';
                    } else {
                      source =
                        'if(' +
                        N +
                        '!e.' +
                        testDir +
                        'ElementSibling){' +
                        source +
                        '}';
                    }
                    break;
                  } else if (
                    match[2] === 'even' ||
                    match[2] === '2n0' ||
                    match[2] === '2n+0' ||
                    match[2] === '2n'
                  ) {
                    test = 'n%2===0';
                  } else if (
                    match[2] === 'odd' ||
                    match[2] === '2n1' ||
                    match[2] === '2n+1'
                  ) {
                    test = 'n%2===1';
                  } else {
                    f = /n/i.test(match[2]);
                    n = match[2].split('n');
                    a = parseInt(n[0], 10) || 0;
                    b = parseInt(n[1], 10) || 0;
                    if (n[0] === '-') {
                      a = -1;
                    }
                    if (n[0] === '+') {
                      a = +1;
                    }

                    let nTerm = 'n';
                    if (b) {
                      let sign = '+';
                      if (b > 0) {
                        sign = '-';
                      }
                      nTerm = '(n' + sign + Math.abs(b) + ')';
                    }
                    test = nTerm + '%' + a + '===0';

                    if (a >= +1) {
                      if (f) {
                        let extra = '';
                        if (Math.abs(a) !== 1) {
                          extra = '&&' + test;
                        }
                        test = 'n>' + (b - 1) + extra;
                      } else {
                        test = 'n===' + a;
                      }
                    } else if (a <= -1) {
                      let extra = '';
                      if (Math.abs(a) !== 1) {
                        extra = '&&' + test;
                      }
                      test = 'n<' + (b + 1) + extra;
                    } else if (a === 0) {
                      test = 'n===' + b;
                    }
                  }

                  let exprStr = 'Element';
                  if (exprBool) {
                    exprStr = 'OfType';
                  }
                  let typeStr = 'false';
                  if (typeBool) {
                    typeStr = 'true';
                  }
                  source =
                    'n=s.nth' +
                    exprStr +
                    '(e,' +
                    typeStr +
                    ');if(' +
                    N +
                    '(' +
                    test +
                    ')){' +
                    source +
                    '}';
                } else {
                  emit("'" + selectorString + "'" + qsInvalid);
                }
                break;
              }
              default:
            }
          } else if ((match = selector.match(Patterns.logicalsel))) {
            match[1] = match[1].toLowerCase();
            expr = match[2]
              .replace(REX.CommaGroup, ',')
              .replace(REX.TrimSpaces, '');
            switch (match[1]) {
              case 'is': {
                source =
                  'if(s.match("' +
                  expr.replace(/\x22/g, '\\"') +
                  '",e)){' +
                  source +
                  '}';
                break;
              }
              case 'not': {
                source =
                  'if(!s.match("' +
                  expr.replace(/\x22/g, '\\"') +
                  '",e)){' +
                  source +
                  '}';
                break;
              }
              case 'has': {
                matchResolvers.clear();
                source =
                  'if(e.querySelector(":scope ' +
                  expr.replace(/\x22/g, '\\"') +
                  '")){' +
                  source +
                  '}';
                break;
              }
              default:
            }
          } else if ((match = selector.match(Patterns.locationpc))) {
            match[1] = match[1].toLowerCase();
            switch (match[1]) {
              case 'any-link': {
                source =
                  'if(' +
                  N +
                  '(/^a|area$/i.test(e.localName)&&e.hasAttribute("href"))){' +
                  source +
                  '}';
                break;
              }
              case 'link': {
                source =
                  'if(' +
                  N +
                  '(/^a|area$/i.test(e.localName)&&e.hasAttribute("href"))){' +
                  source +
                  '}';
                break;
              }
              case 'target': {
                source = 'if(s.isTarget(e)){' + source + '}';
                break;
              }
              default:
            }
          } else if ((match = selector.match(Patterns.inputstate))) {
            match[1] = match[1].toLowerCase();
            switch (match[1]) {
              case 'read-only': {
                source =
                  'if((/^textarea$/i.test(e.localName)&&(e.readOnly||e.disabled))||(/^input$/i.test(e.localName)&&("|date|datetime-local|email|month|number|password|search|tel|text|time|url|week|".includes("|"+e.type+"|")?(e.readOnly||e.disabled):true))||(!/^(?:input|textarea)$/i.test(e.localName) && !s.isContentEditable(e))){' +
                  source +
                  '}';
                break;
              }
              case 'read-write': {
                source =
                  'if((/^textarea$/i.test(e.localName)&&!e.readOnly&&!e.disabled)||(/^input$/i.test(e.localName)&&"|date|datetime-local|email|month|number|password|search|tel|text|time|url|week|".includes("|"+e.type+"|")&&!e.readOnly&&!e.disabled)||(!/^(?:input|textarea)$/i.test(e.localName) && s.isContentEditable(e))){' +
                  source +
                  '}';
                break;
              }
              default:
            }
          } else if ((match = selector.match(Patterns.inputvalue))) {
            match[1] = match[1].toLowerCase();
            switch (match[1]) {
              case 'checked': {
                source =
                  'if(' +
                  N +
                  '(/^input$/i.test(e.localName)&&("|radio|checkbox|".includes("|"+e.type+"|")&&e.checked)||(/^option$/i.test(e.localName)&&(e.selected||e.checked)))){' +
                  source +
                  '}';
                break;
              }
              case 'indeterminate': {
                source = 'if(s.isIndeterminate(e)){' + source + '}';
                break;
              }
              default:
            }
          } else {
            emit("unknown pseudo-class selector '" + selector + "'");
          }
          break;
        }
        default: {
          emit("'" + selectorString + "'" + qsInvalid);
        }
      }
      selector = match.pop();
    }
    return source;
  }

  /**
   * Checks and fetches lambdas from GenerationalCache, compiling returning closures.
   * @param {string} selector - The CSS selector string.
   * @param {boolean} mode - Mode specifying lambda output behavior (true: select, false: match).
   * @returns {(c: Element|Element[]|NodeList, f?: ((element: Element) => boolean|void), x?: Element|Document|null, r?: boolean|Element[]) => boolean|Element[]} The generated executable selector processing function.
   */
  function compile(selector, mode) {
    let head = '';
    let loop = '';
    let macro = '';
    let source = '';
    let cached;

    if (mode) {
      cached = selectLambdas.get(selector);
      if (cached !== undefined) {
        return cached;
      }
      head = S_HEAD;
      macro = S_BODY + S_TAIL;
      loop = S_LOOP;
    } else {
      cached = matchLambdas.get(selector);
      if (cached !== undefined) {
        return cached;
      }
      head = M_HEAD;
      macro = M_BODY + M_TAIL;
      loop = M_LOOP;
    }

    source = compileSelector(selector, macro, mode);

    if (mode) {
      loop += '{' + source + '}';
    } else {
      loop += source;
    }

    if (mode && selector.includes(':nth')) {
      if (reNthElem.test(selector)) {
        loop += 's.nthElement(null, 2);';
      }
      if (reNthType.test(selector)) {
        loop += 's.nthOfType(null, 2);';
      }
    }

    const factory = Function(
      's',
      F_INIT + '{' + head + ';' + loop + 'return r;}'
    )(Snapshot);

    if (mode) {
      selectLambdas.set(selector, factory);
    } else {
      matchLambdas.set(selector, factory);
    }

    return factory;
  }

  /**
   * Centralized collector pipeline constructing combined resolvers.
   * @param {Array<string>} selectors - The comma-split groups of selector patterns.
   * @param {Element|Document} context - The context object to query from.
   * @param {((element: Element) => boolean | void)=} callback - Function to be applied over returned nodes.
   * @returns {object} An object containing the mapped arrays of resolvers and results.
   */
  function collect(selectors, context, callback) {
    let i, l, type;
    const seen = Object.create(null);
    let token = ['', '*', '*'];
    const optimized = selectors;
    const factory = [];
    const htmlset = [];
    const nodeset = [];
    let results = [];
    for (i = 0, l = selectors.length; l > i; ++i) {
      if (!seen[selectors[i]]) {
        seen[selectors[i]] = true;
        type = selectors[i].match(reOptimizer);
        if (type && type[1] !== ':') {
          token = type;
          if (!token[1]) {
            token[1] = '*';
          }
          optimized[i] = optimize(optimized[i], token);
        } else {
          token = ['', '*', '*'];
        }
      }
      nodeset[i] = token[1] + token[2];
      htmlset[i] = compat[token[1]](context, token[2]);
      factory[i] = compile(optimized[i], true);
      factory[i](htmlset[i](), callback, context, results);
    }
    if (l > 1) {
      results.sort(documentOrder);
      if (hasDupes) {
        results = unique(results);
      }
    }
    return { callback, context, factory, htmlset, nodeset, results };
  }

  /**
   * Creates mapping pipelines directly collecting matching lambdas based on expression nodes.
   * @param {Array<string>} selectors - The comma-split groups of selector patterns.
   * @returns {object} Object encapsulating generated lambda constraints.
   */
  function matchCollect(selectors) {
    const f = [];
    for (let i = 0, l = selectors.length; l > i; ++i) {
      f[i] = compile(selectors[i], false);
    }
    return { factory: f };
  }

  /**
   * Validates whether an isolated element complies strictly with the given selector condition.
   * @param {string} selectors - The CSS selector condition input.
   * @param {Element} element - The single element attempting matching.
   * @param {((element: Element) => boolean | void)=} callback - A callback evaluated on success.
   * @returns {boolean} Return true if matched else false.
   */
  function match(selectors, element, callback) {
    if (selectors === undefined) {
      emit(qsNotArgs, 'TypeError');
    }
    if (selectors === '') {
      emit("''" + qsInvalid);
    }

    let expressions;
    const cachedResolver = matchResolvers.get(selectors);
    if (element && !/:has\(/.test(selectors) && cachedResolver !== undefined) {
      return matchAssert(cachedResolver.factory, element, callback);
    }
    lastMatched = selectors;

    if (typeof selectors !== 'string') {
      selectors = '' + selectors;
    }
    if (/:scope/i.test(selectors)) {
      selectors = makeref(selectors, element);
    }

    const parsed = selectors
      .replace(/\0|\\$/g, '\ufffd')
      .replace(REX.combineWSP, '\x20')
      .replace(REX.pseudosWSP, '$1')
      .replace(REX.tabCharWSP, '\t')
      .replace(REX.commaGroup, ',')
      .replace(REX.trimSpaces, '');

    if (
      (expressions = parsed.match(reValidator)) &&
      expressions.join('') === parsed
    ) {
      expressions = parsed.match(REX.splitGroup);
      if (parsed[parsed.length - 1] === ',') {
        emit(qsInvalid);
      }
    } else {
      emit("'" + selectors + "'" + qsInvalid);
    }

    const newResolver = matchCollect(expressions);
    matchResolvers.set(selectors, newResolver);
    return matchAssert(newResolver.factory, element, callback);
  }

  /**
   * Searches proximally upwards finding the nearest element evaluating to the targeted selector.
   * @param {string} selectors - The CSS target rule lookup.
   * @param {Element} element - The start baseline tracking backwards.
   * @param {((element: Element) => boolean | void)=} callback - An optional callback evaluated securely upon a hit.
   * @returns {Element|null} The nearest matched element instance or `null` if terminating unfulfilled.
   */
  function ancestor(selectors, element, callback) {
    if (/:scope/i.test(selectors)) {
      selectors = makeref(selectors, element);
    }
    while (element) {
      if (match(selectors, element, callback)) {
        break;
      }
      element = element.parentElement;
    }
    return element;
  }

  /**
   * Collects a structural list of every single matching child element based on standard CSS combinators.
   * @param {string} selectors - Extensible compound selector queries targeting DOM layouts.
   * @param {Element|Document} context - Root tree execution base.
   * @param {((element: Element) => boolean | void)=} callback - Iterative injection applied conditionally.
   * @returns {Array<Element>} Collection representing matching elements inside the root boundary.
   */
  function select(selectors, context, callback) {
    if (selectors === undefined) {
      emit(qsNotArgs, 'TypeError');
    }
    if (selectors === '') {
      emit("''" + qsInvalid);
    }

    if (!context) {
      context = doc;
    }

    let expressions;
    let nodes = [];

    if (lastContext !== context) {
      lastContext = switchContext(context);
    }

    const resolver = selectResolvers.get(selectors);
    if (resolver !== undefined) {
      if (resolver.context === context && resolver.callback === callback) {
        const f = resolver.factory;
        const h = resolver.htmlset;
        const n = resolver.nodeset;
        if (n.length > 1) {
          const l = n.length;
          for (let i = 0; i < l; ++i) {
            const list = compat[n[i][0]](context, n[i].slice(1))();
            f[i](list, callback, context, nodes);
          }
          if (l > 1 && nodes.length > 1) {
            nodes.sort(documentOrder);
            if (hasDupes) {
              nodes = unique(nodes);
            }
          }
        } else {
          nodes = f[0](h[0](), callback, context, nodes);
        }
        if (typeof callback === 'function') {
          return concatCall(nodes, callback);
        }
        return nodes;
      }
    }

    lastSelected = selectors;

    if (typeof selectors !== 'string') {
      selectors = '' + selectors;
    }
    if (/:scope/i.test(selectors)) {
      selectors = makeref(selectors, context);
    }

    const parsed = selectors
      .replace(/\0|\\$/g, '\ufffd')
      .replace(REX.combineWSP, '\x20')
      .replace(REX.pseudosWSP, '$1')
      .replace(REX.tabCharWSP, '\t')
      .replace(REX.commaGroup, ',')
      .replace(REX.trimSpaces, '');

    if (
      (expressions = parsed.match(reValidator)) &&
      expressions.join('') === parsed
    ) {
      expressions = parsed.match(REX.splitGroup);
      if (parsed[parsed.length - 1] === ',') {
        emit(qsInvalid);
      }
    } else {
      emit("'" + selectors + "'" + qsInvalid);
    }

    const newResolver = collect(expressions, context, callback);
    selectResolvers.set(selectors, newResolver);
    nodes = newResolver.results;
    if (typeof callback === 'function') {
      return concatCall(nodes, callback);
    }
    return nodes;
  }

  /**
   * Retains identical matching sequences internally to `select()` but halts immediately resolving the initial target element.
   * @param {string} selectors - Standard string format selector queries targeting the document tree.
   * @param {Element|Document} context - Element evaluation starting scope block.
   * @param {((element: Element) => boolean | void)=} callback - Conditionally executes mapping on retrieval.
   * @returns {Element|null} Single element mapping success or `null`.
   */
  function first(selectors, context, callback) {
    if (selectors === '') {
      emit("''" + qsInvalid);
    }
    if (!context) {
      context = doc;
    }

    let localCallback;
    if (typeof callback === 'function') {
      localCallback = function (element) {
        callback(element);
        return false;
      };
    } else {
      localCallback = function () {
        return false;
      };
    }

    const result = select(selectors, context, localCallback);
    if (result[0]) {
      return result[0];
    }
    return null;
  }

  Snapshot.match = match;
  Snapshot.nthElement = nthElement;
  Snapshot.nthOfType = nthOfType;

  setIdentifierSyntax();
  lastContext = switchContext(globalRef.document, true);

  return {
    configure,
    match,
    closest: ancestor,
    first,
    select
  };
}

/**
 * Initialize nwsapi.
 * @param {object} window - The Window object.
 * @param {object} document - The Document object.
 * @returns {object} - The nwsapi instance.
 */
export function initNwsapi(window, document) {
  if (!window?.DOMException) {
    throw new TypeError(`Unexpected global object ${getType(window)}`);
  }
  if (document?.nodeType !== 9) {
    document = window.document;
  }
  const nw = nwsapi({
    document,
    DOMException: window.DOMException
  });
  nw.configure({
    CACHE_SIZE: 2048
  });
  return nw;
}
