/**
 * finder.js
 */

/* import */
import { Evaluator } from './evaluator.js';
import { matchPseudoElementSelector } from './matcher.js';
import {
  generateCSS,
  parseSelector,
  sortAST,
  unescapeSelector,
  walkAST
} from './parser.js';
import { createHasValidator, isInvalidCombinator } from './selector.js';
import { generateException, sortNodes, traverseNode } from './utility.js';

/* constants */
import {
  ATTR_SELECTOR,
  CLASS_SELECTOR,
  COMBINATOR,
  DOCUMENT_FRAGMENT_NODE,
  ELEMENT_NODE,
  FORM_PARTS,
  ID_SELECTOR,
  PS_CLASS_SELECTOR,
  PS_ELEMENT_SELECTOR,
  SYNTAX_ERR,
  TARGET_ALL,
  TARGET_FIRST,
  TARGET_LINEAL,
  TARGET_SELF,
  TYPE_SELECTOR
} from './constant.js';

const DIR_NEXT = 'next';
const DIR_PREV = 'prev';
const KEYS_FORM = new Set([...FORM_PARTS, 'fieldset', 'form']);
const KEYS_PS_UNCACHE = new Set([
  'any-link',
  'defined',
  'dir',
  'link',
  'scope'
]);

/**
 * Finder
 * NOTE: _ast[i] corresponds to _nodes[i]
 */
export class Finder extends Evaluator {
  /* private fields */
  _invalidate;
  _invalidateResults;
  _nodeWalker;
  _rootWalker;
  _scoped;
  _selector;

  /**
   * Sets up the finder.
   * @param {string} selector - The CSS selector.
   * @param {object} node - Document, DocumentFragment, or Element.
   * @param {object} [opt] - Options.
   * @param {boolean} [opt.check] - True if running in internal check.
   * @param {boolean} [opt.noexcept] - True to suppress exceptions.
   * @param {boolean} [opt.warn] - True to enable console warnings.
   * @returns {object} The finder instance.
   */
  setup(selector, node, opt = {}) {
    super.setup(selector, node, opt);
    this._check = !!opt.check;
    this._scoped =
      this._node !== this._root && this._node.nodeType === ELEMENT_NODE;
    this._selector = selector;
    this._nodeWalker = null;
    this._rootWalker = null;
    this._invalidate = false;
    return this;
  }

  /**
   * Clear cached results.
   * @param {boolean} all - Clear all results.
   * @returns {void}
   */
  clearResults(all = false) {
    super.clearResults(all);
    this._invalidateResults = null;
  }

  /**
   * Processes selector branches into the internal AST structure.
   * @private
   * @param {Array.<object>} branches - The selector branches to process.
   * @param {string} selector - The CSS selector string.
   * @returns {object} Object containing ast and descendant flags.
   */
  _processSelectorBranches = (branches, selector) => {
    let descendant = false;
    const ast = [];
    for (const items of branches) {
      const branch = [];
      let prevType = null;
      const itemsLen = items.length;
      if (itemsLen) {
        const leaves = new Set();
        for (let j = 0; j < itemsLen; j++) {
          const item = items[j];
          const isLast = j === itemsLen - 1;
          if (isInvalidCombinator(item.type, prevType, isLast)) {
            const msg = `Invalid selector ${selector}`;
            this.onError(generateException(msg, SYNTAX_ERR, this._window));
            return { ast: [], descendant: false, invalidate: false };
          }
          if (item.type === COMBINATOR) {
            if (item.name === ' ' || item.name === '>') {
              descendant = true;
            }
            branch.push({ combo: item, leaves: sortAST(leaves) });
            leaves.clear();
          } else {
            if (item.name && typeof item.name === 'string') {
              const unescapedName = unescapeSelector(item.name);
              if (unescapedName !== item.name) {
                item.name = unescapedName;
              }
              if (/[|:]/.test(unescapedName)) {
                item.namespace = true;
              }
            }
            leaves.add(item);
          }
          prevType = item.type;
          if (isLast) {
            branch.push({ combo: null, leaves: sortAST(leaves) });
            leaves.clear();
          }
        }
      }
      ast.push({ branch, dir: null, filtered: false, find: false });
    }
    return { ast, descendant };
  };

  /**
   * Corresponds AST and DOM nodes for the given selector.
   * @private
   * @param {string} selector - The CSS selector string.
   * @returns {Array} An array containing the AST and empty nodes array.
   */
  _correspond = selector => {
    const nodes = [];
    this._descendant = false;
    this._invalidate = false;
    let ast;
    if (this._documentCache.has(this._document)) {
      const cachedItem = this._documentCache.get(this._document);
      if (cachedItem && cachedItem.has(`${selector}`)) {
        const item = cachedItem.get(`${selector}`);
        ast = item.ast;
        this._descendant = item.descendant;
        this._invalidate = item.invalidate;
        this._selectorAST = item.selectorAST;
      }
    }
    if (ast) {
      const l = ast.length;
      for (let i = 0; i < l; i++) {
        ast[i].dir = null;
        ast[i].filtered = false;
        ast[i].find = false;
        nodes[i] = [];
      }
    } else {
      this._selectorAST = parseSelector(selector);
      const { branches, info } = walkAST(
        this._selectorAST,
        true,
        createHasValidator(this._window)
      );
      const {
        hasHasPseudoFunc,
        hasLogicalPseudoFunc,
        hasNthChildOfSelector,
        hasStatePseudoClass,
        hasUnsupportedPseudoClass
      } = info;
      this._invalidate =
        hasHasPseudoFunc ||
        hasStatePseudoClass ||
        hasUnsupportedPseudoClass ||
        !!(hasLogicalPseudoFunc && hasNthChildOfSelector);
      const processed = this._processSelectorBranches(branches, selector);
      ast = processed.ast;
      this._descendant = processed.descendant;
      let cachedItem;
      if (this._documentCache.has(this._document)) {
        cachedItem = this._documentCache.get(this._document);
      } else {
        cachedItem = new Map();
      }
      cachedItem.set(`${selector}`, {
        ast,
        descendant: this._descendant,
        invalidate: this._invalidate,
        selectorAST: this._selectorAST
      });
      this._documentCache.set(this._document, cachedItem);
      for (let i = 0; i < ast.length; i++) {
        nodes[i] = [];
      }
    }
    return [ast, nodes];
  };

  /**
   * Matches leaves against a node with cache check.
   * @private
   * @param {Array.<object>} leaves - The AST leaves to match.
   * @param {object} node - The DOM node.
   * @param {object} opt - The match options.
   * @returns {boolean} True if matched, otherwise false.
   */
  _matchLeaves = (leaves, node, opt) => {
    if (!this._invalidateResults) {
      this._invalidateResults = new WeakMap();
    }
    const results = this._invalidate ? this._invalidateResults : this._results;
    let result = results.get(leaves);
    if (result && result.has(node)) {
      const { matched } = result.get(node);
      return matched;
    }
    let cacheable = true;
    if (node.nodeType === ELEMENT_NODE && KEYS_FORM.has(node.localName)) {
      cacheable = false;
    }
    let bool;
    const l = leaves.length;
    for (let i = 0; i < l; i++) {
      const leaf = leaves[i];
      switch (leaf.type) {
        case ATTR_SELECTOR:
        case ID_SELECTOR: {
          cacheable = false;
          break;
        }
        case PS_CLASS_SELECTOR: {
          if (KEYS_PS_UNCACHE.has(leaf.name)) {
            cacheable = false;
          }
          break;
        }
        default: {
          // No action needed for other types.
        }
      }
      bool = this.matchSelector(leaf, node, opt);
      if (!bool) {
        break;
      }
    }
    if (cacheable) {
      if (!result) {
        result = new WeakMap();
      }
      result.set(node, {
        matched: bool
      });
      results.set(leaves, result);
    }
    return bool;
  };

  /**
   * Traverses and collects nodes matching leaves.
   * @private
   * @param {object} walker - The TreeWalker instance.
   * @param {Array.<object>} leaves - The AST leaves to match.
   * @param {object} [opt] - Options for traversal.
   * @returns {Array.<object>} An array of collected nodes.
   */
  _traverseAndCollectNodes = (walker, leaves, opt = {}) => {
    const { boundaryNode, force, startNode, targetType } = opt;
    const collectedNodes = [];
    let currentNode = traverseNode(startNode, walker, !!force);
    if (!currentNode) {
      return [];
    }
    // Adjust starting node.
    if (currentNode.nodeType !== ELEMENT_NODE) {
      currentNode = walker.nextNode();
    } else if (currentNode === startNode && currentNode !== this._root) {
      currentNode = walker.nextNode();
    }
    const matchOpt = {
      warn: this._warn
    };
    while (currentNode) {
      if (boundaryNode) {
        if (currentNode === boundaryNode) {
          break;
        } else if (
          targetType === TARGET_ALL &&
          !boundaryNode.contains(currentNode)
        ) {
          break;
        }
      }
      if (
        this._matchLeaves(leaves, currentNode, matchOpt) &&
        currentNode !== this._node
      ) {
        collectedNodes.push(currentNode);
        if (targetType !== TARGET_ALL) {
          break;
        }
      }
      currentNode = walker.nextNode();
    }
    return collectedNodes;
  };

  /**
   * Finds matching nodes preceding the current node.
   * @private
   * @param {Array.<object>} leaves - The AST leaves to match.
   * @param {object} node - The starting node.
   * @param {object} [opt] - Options for finding.
   * @returns {Array.<object>} An array of matched nodes.
   */
  _findPrecede = (leaves, node, opt = {}) => {
    const { force, targetType } = opt;
    if (!this._rootWalker) {
      this._rootWalker = this.createTreeWalker(this._root);
    }
    return this._traverseAndCollectNodes(this._rootWalker, leaves, {
      force,
      targetType,
      boundaryNode: this._node,
      startNode: node
    });
  };

  /**
   * Finds matching nodes using TreeWalker.
   * @private
   * @param {Array.<object>} leaves - The AST leaves.
   * @param {object} node - The starting node.
   * @param {object} [opt] - Traversal options.
   * @returns {Array.<object>} An array of matched nodes.
   */
  _findNodeWalker = (leaves, node, opt = {}) => {
    const { precede, ...traversalOpts } = opt;
    if (precede) {
      const precedeNodes = this._findPrecede(leaves, this._root, opt);
      if (precedeNodes.length) {
        return precedeNodes;
      }
    }
    if (!this._nodeWalker) {
      this._nodeWalker = this.createTreeWalker(this._node);
    }
    return this._traverseAndCollectNodes(this._nodeWalker, leaves, {
      ...traversalOpts,
      startNode: node
    });
  };

  /**
   * Matches the current node itself against leaves.
   * @private
   * @param {Array.<object>} leaves - The AST leaves.
   * @returns {Array} Array with nodes, match boolean, and pseudo-elements.
   */
  _matchSelf = leaves => {
    const matched = this._matchLeaves(leaves, this._node, {
      check: this._check,
      warn: this._warn
    });
    const nodes = matched ? [this._node] : [];
    return [nodes, matched, this._pseudoElement];
  };

  /**
   * Finds lineal matching nodes (self and ancestors).
   * @private
   * @param {Array.<object>} leaves - The AST leaves.
   * @param {object} [opt] - Options like complex flag.
   * @returns {Array} Array containing nodes and filtered boolean.
   */
  _findLineal = (leaves, opt = {}) => {
    const { complex } = opt;
    const nodes = [];
    const matchOpts = { warn: this._warn };
    const selfMatched = this._matchLeaves(leaves, this._node, matchOpts);
    if (selfMatched) {
      nodes.push(this._node);
    }
    if (!selfMatched || complex) {
      let currentNode = this._node.parentNode;
      while (currentNode) {
        if (this._matchLeaves(leaves, currentNode, matchOpts)) {
          nodes.push(currentNode);
        }
        currentNode = currentNode.parentNode;
      }
    }
    const filtered = nodes.length > 0;
    return [nodes, filtered];
  };

  /**
   * Finds entry nodes for pseudo-elements.
   * @private
   * @param {object} leaf - The AST leaf.
   * @param {Array.<object>} filterLeaves - Leaves for filtering.
   * @param {string} targetType - The target type.
   * @returns {object} Object with nodes, filtered, and pending flags.
   */
  _findEntryNodesForPseudoElement = (leaf, filterLeaves, targetType) => {
    if (targetType === TARGET_SELF && this._check) {
      const css = generateCSS(leaf);
      this._pseudoElement.push(css);
      if (filterLeaves.length) {
        const [nodes, filtered] = this._matchSelf(filterLeaves);
        return { nodes, filtered, pending: false };
      }
      return { nodes: [this._node], filtered: true, pending: false };
    }
    matchPseudoElementSelector(leaf.name, leaf.type, { warn: this._warn });
    return { nodes: [], filtered: false, pending: false };
  };

  /**
   * Finds entry nodes using ID selector strategy.
   * @private
   * @param {object} twig - The twig object containing leaves.
   * @param {string} targetType - The target type.
   * @param {object} [opt] - Strategy options.
   * @returns {object} Result object with nodes and flags.
   */
  _findEntryNodesForId = (twig, targetType, opt = {}) => {
    const { leaves } = twig;
    const filterLeaves = this.getFilterLeaves(leaves);
    const { complex, precede } = opt;
    if (targetType === TARGET_SELF) {
      const [nodes, filtered] = this._matchSelf(leaves);
      return { nodes, filtered, pending: false };
    } else if (targetType === TARGET_LINEAL) {
      const [nodes, filtered] = this._findLineal(leaves, { complex });
      return { nodes, filtered, pending: false };
    } else if (
      targetType === TARGET_FIRST &&
      this._root.nodeType !== ELEMENT_NODE
    ) {
      const [leaf] = leaves;
      const node = this._root.getElementById(leaf.name);
      const nodes = [];
      if (node) {
        if (filterLeaves.length) {
          if (this._matchLeaves(filterLeaves, node, { warn: this._warn })) {
            nodes.push(node);
          }
        } else {
          nodes.push(node);
        }
      }
      return { nodes, filtered: nodes.length > 0, pending: false };
    }
    const nodes = this._findNodeWalker(leaves, this._node, {
      precede,
      targetType
    });
    return { nodes, filtered: nodes.length > 0, pending: false };
  };

  /**
   * Finds entry nodes using class selector strategy.
   * @private
   * @param {Array.<object>} leaves - The AST leaves.
   * @param {string} targetType - The target type.
   * @param {object} [opt] - Strategy options.
   * @returns {object} Result object with nodes and flags.
   */
  _findEntryNodesForClass = (leaves, targetType, opt = {}) => {
    const { complex, precede } = opt;
    if (targetType === TARGET_SELF) {
      const [nodes, filtered] = this._matchSelf(leaves);
      return { nodes, filtered, pending: false };
    } else if (targetType === TARGET_LINEAL) {
      const [nodes, filtered] = this._findLineal(leaves, { complex });
      return { nodes, filtered, pending: false };
    } else if (
      targetType !== TARGET_FIRST &&
      !precede &&
      typeof this._node.getElementsByClassName === 'function'
    ) {
      const matchOpt = { warn: this._warn };
      this._matchLeaves(leaves, this._node, matchOpt);
      const [leaf] = leaves;
      const className = unescapeSelector(leaf.name);
      const collection = this._node.getElementsByClassName(className);
      const len = collection.length;
      const filterLeaves = this.getFilterLeaves(leaves);
      const hasFilter = filterLeaves.length > 0;
      const nodeArray = [];
      for (let i = 0; i < len; i++) {
        const currentNode = collection[i];
        if (
          !hasFilter ||
          this._matchLeaves(filterLeaves, currentNode, matchOpt)
        ) {
          nodeArray.push(currentNode);
        }
      }
      return {
        nodes: nodeArray,
        filtered: nodeArray.length > 0,
        pending: false
      };
    }
    const nodes = this._findNodeWalker(leaves, this._node, {
      precede,
      targetType
    });
    return { nodes, filtered: nodes.length > 0, pending: false };
  };

  /**
   * Finds entry nodes using type selector strategy.
   * @private
   * @param {Array.<object>} leaves - The AST leaves.
   * @param {string} targetType - The target type.
   * @param {object} [opt] - Strategy options.
   * @returns {object} Result object with nodes and flags.
   */
  _findEntryNodesForType = (leaves, targetType, opt = {}) => {
    const { complex, precede } = opt;
    if (targetType === TARGET_SELF) {
      const [nodes, filtered] = this._matchSelf(leaves);
      return { nodes, filtered, pending: false };
    } else if (targetType === TARGET_LINEAL) {
      const [nodes, filtered] = this._findLineal(leaves, { complex });
      return { nodes, filtered, pending: false };
    }
    const [leaf] = leaves;
    const tagName = unescapeSelector(leaf.name);
    if (
      targetType !== TARGET_FIRST &&
      !precede &&
      this._document.contentType === 'text/html' &&
      typeof this._node.getElementsByTagName === 'function' &&
      tagName.indexOf('|') === -1
    ) {
      const matchOpt = { warn: this._warn };
      this._matchLeaves(leaves, this._node, matchOpt);
      const collection = this._node.getElementsByTagName(tagName);
      const len = collection.length;
      const filterLeaves = this.getFilterLeaves(leaves);
      const hasFilter = filterLeaves.length > 0;
      const nodeArray = [];
      for (let i = 0; i < len; i++) {
        const currentNode = collection[i];
        if (
          !hasFilter ||
          this._matchLeaves(filterLeaves, currentNode, matchOpt)
        ) {
          nodeArray.push(currentNode);
        }
      }
      return {
        nodes: nodeArray,
        filtered: nodeArray.length > 0,
        pending: false
      };
    }
    const nodes = this._findNodeWalker(leaves, this._node, {
      precede,
      targetType
    });
    return { nodes, filtered: nodes.length > 0, pending: false };
  };

  /**
   * Finds entry nodes for other selector types.
   * @private
   * @param {object} twig - The twig object containing leaves.
   * @param {string} targetType - The target type.
   * @param {object} [opt] - Strategy options.
   * @returns {object} Result object with nodes and flags.
   */
  _findEntryNodesForOther = (twig, targetType, opt = {}) => {
    const { leaves } = twig;
    const [leaf] = leaves;
    const filterLeaves = this.getFilterLeaves(leaves);
    const { complex, precede } = opt;
    if (targetType !== TARGET_LINEAL && /host(?:-context)?/.test(leaf.name)) {
      let shadowRoot = null;
      if (
        this._shadow &&
        this._node.nodeType === DOCUMENT_FRAGMENT_NODE &&
        this.evaluateShadowHost(leaf, this._node)
      ) {
        shadowRoot = this._node;
      } else if (
        filterLeaves.length &&
        this._node.nodeType === ELEMENT_NODE &&
        this.evaluateShadowHost(leaf, this._node.shadowRoot)
      ) {
        shadowRoot = this._node.shadowRoot;
      }
      if (shadowRoot) {
        let bool = true;
        const l = filterLeaves.length;
        for (let i = 0; i < l; i++) {
          const filterLeaf = filterLeaves[i];
          switch (filterLeaf.name) {
            case 'host':
            case 'host-context': {
              bool = this.evaluateShadowHost(filterLeaf, shadowRoot);
              break;
            }
            case 'has': {
              bool = this.matchPseudoClassSelector(filterLeaf, shadowRoot, {});
              break;
            }
            default: {
              bool = false;
            }
          }
          if (!bool) {
            break;
          }
        }
        const nodes = [];
        if (bool) {
          nodes.push(shadowRoot);
        }
        return { nodes, filtered: nodes.length > 0, pending: false };
      }
    } else if (targetType === TARGET_SELF) {
      const [nodes, filtered] = this._matchSelf(leaves);
      return { nodes, filtered, pending: false };
    } else if (targetType === TARGET_LINEAL) {
      const [nodes, filtered] = this._findLineal(leaves, { complex });
      return { nodes, filtered, pending: false };
    } else if (targetType === TARGET_FIRST) {
      const nodes = this._findNodeWalker(leaves, this._node, {
        precede,
        targetType
      });
      return { nodes, filtered: nodes.length > 0, pending: false };
    }
    return { nodes: [], filtered: false, pending: true };
  };

  /**
   * Finds entry nodes based on the selector type.
   * @private
   * @param {object} twig - The twig object containing leaves.
   * @param {string} targetType - The target type.
   * @param {object} [opt] - Strategy options.
   * @returns {object} Result object with nodes and flags.
   */
  _findEntryNodes = (twig, targetType, opt = {}) => {
    const { leaves } = twig;
    const [leaf] = leaves;
    const filterLeaves = this.getFilterLeaves(leaves);
    const { complex = false, dir = DIR_PREV } = opt;
    const precede =
      dir === DIR_NEXT &&
      this._node.nodeType === ELEMENT_NODE &&
      this._node !== this._root;
    let result;
    switch (leaf.type) {
      case PS_ELEMENT_SELECTOR: {
        result = this._findEntryNodesForPseudoElement(
          leaf,
          filterLeaves,
          targetType
        );
        break;
      }
      case ID_SELECTOR: {
        result = this._findEntryNodesForId(twig, targetType, {
          complex,
          precede
        });
        break;
      }
      case CLASS_SELECTOR: {
        result = this._findEntryNodesForClass(leaves, targetType, {
          complex,
          precede
        });
        break;
      }
      case TYPE_SELECTOR: {
        result = this._findEntryNodesForType(leaves, targetType, {
          complex,
          precede
        });
        break;
      }
      default: {
        result = this._findEntryNodesForOther(twig, targetType, {
          complex,
          precede
        });
      }
    }
    return {
      compound: filterLeaves.length > 0,
      filtered: result.filtered,
      nodes: result.nodes,
      pending: result.pending
    };
  };

  /**
   * Determines the traversal direction and starting twig.
   * @private
   * @param {Array.<object>} branch - The selector branch.
   * @param {string} targetType - The target type.
   * @returns {object} Object containing dir and twig properties.
   */
  _determineTraversalStrategy = (branch, targetType) => {
    const branchLen = branch.length;
    const firstTwig = branch[0];
    const lastTwig = branch[branchLen - 1];
    if (branchLen === 1) {
      return { dir: DIR_PREV, twig: firstTwig };
    }
    const {
      leaves: [{ name: firstName, type: firstType }]
    } = firstTwig;
    const {
      leaves: [{ name: lastName, type: lastType }]
    } = lastTwig;
    if (
      this._selector.includes(':scope') ||
      lastType === PS_ELEMENT_SELECTOR ||
      lastType === ID_SELECTOR
    ) {
      return { dir: DIR_PREV, twig: lastTwig };
    } else if (firstType === ID_SELECTOR) {
      return { dir: DIR_NEXT, twig: firstTwig };
    } else if (firstName === '*' && firstType === TYPE_SELECTOR) {
      return { dir: DIR_PREV, twig: lastTwig };
    } else if (lastName === '*' && lastType === TYPE_SELECTOR) {
      return { dir: DIR_NEXT, twig: firstTwig };
    } else if (branchLen === 1 || branchLen === 2) {
      return { dir: DIR_PREV, twig: lastTwig };
    } else if (branchLen > 2 && this._scoped && targetType === TARGET_FIRST) {
      if (lastType === TYPE_SELECTOR) {
        return { dir: DIR_PREV, twig: lastTwig };
      }
      let isChildOrDescendant = false;
      for (const { combo } of branch) {
        if (combo) {
          const { name: comboName } = combo;
          isChildOrDescendant = comboName === '>' || comboName === ' ';
          if (!isChildOrDescendant) {
            break;
          }
        }
      }
      if (isChildOrDescendant) {
        return { dir: DIR_PREV, twig: lastTwig };
      }
    }
    return { dir: DIR_NEXT, twig: firstTwig };
  };

  /**
   * Processes pending items to find matches.
   * @private
   * @param {Set.<Map>} pendingItems - Set of pending items to process.
   * @returns {void}
   */
  _processPendingItems = pendingItems => {
    if (!pendingItems.size) {
      return;
    }
    if (!this._rootWalker) {
      this._rootWalker = this.createTreeWalker(this._root);
    }
    const node = this._scoped ? this._node : this._root;
    const walker = this._rootWalker;
    let nextNode = traverseNode(node, walker);
    while (nextNode) {
      const isWithinScope =
        this._node.nodeType !== ELEMENT_NODE ||
        nextNode === this._node ||
        this._node.contains(nextNode);
      if (isWithinScope) {
        for (const pendingItem of pendingItems) {
          const { leaves } = pendingItem.get('twig');
          if (this._matchLeaves(leaves, nextNode, { warn: this._warn })) {
            const index = pendingItem.get('index');
            this._ast[index].filtered = true;
            this._ast[index].find = true;
            this._nodes[index].push(nextNode);
          }
        }
      } else if (this._scoped) {
        break;
      }
      nextNode = walker.nextNode();
    }
  };

  /**
   * Collects all matching nodes into AST nodes array.
   * @private
   * @param {string} targetType - The target type.
   * @returns {Array} Array containing the AST and nodes arrays.
   */
  _collectNodes = targetType => {
    [this._ast, this._nodes] = this._correspond(this._selector);
    const ast = this._ast.values();
    if (targetType === TARGET_ALL || targetType === TARGET_FIRST) {
      const pendingItems = new Set();
      let i = 0;
      for (const { branch } of ast) {
        const complex = branch.length > 1;
        const { dir, twig } = this._determineTraversalStrategy(
          branch,
          targetType
        );
        const { compound, filtered, nodes, pending } = this._findEntryNodes(
          twig,
          targetType,
          { complex, dir }
        );
        if (nodes.length) {
          this._ast[i].find = true;
          this._nodes[i] = nodes;
        } else if (pending) {
          pendingItems.add(
            new Map([
              ['index', i],
              ['twig', twig]
            ])
          );
        }
        this._ast[i].dir = dir;
        this._ast[i].filtered = filtered || !compound;
        i++;
      }
      this._processPendingItems(pendingItems);
    } else {
      let i = 0;
      for (const { branch } of ast) {
        const twig = branch[branch.length - 1];
        const complex = branch.length > 1;
        const dir = DIR_PREV;
        const { compound, filtered, nodes } = this._findEntryNodes(
          twig,
          targetType,
          { complex, dir }
        );
        if (nodes.length) {
          this._ast[i].find = true;
          this._nodes[i] = nodes;
        }
        this._ast[i].dir = dir;
        this._ast[i].filtered = filtered || !compound;
        i++;
      }
    }
    return [this._ast, this._nodes];
  };

  /**
   * Gets nodes matching the combinator and twig.
   * @private
   * @param {object} twig - The twig object.
   * @param {Array.<object>|Set.<object>} nodes - The nodes to check.
   * @param {string} dir - The traversal direction.
   * @returns {Array.<object>} An array of combined nodes.
   */
  _getCombinedNodes = (twig, nodes, dir) => {
    const arr = [];
    for (const node of nodes) {
      this._collectCombinatorMatches(
        twig,
        node,
        { dir, warn: this._warn },
        arr
      );
    }
    return arr;
  };

  /**
   * Matches a node in the next direction.
   * @private
   * @param {Array.<object>} branch - The selector branch.
   * @param {Array.<object>|Set.<object>} nodes - The starting nodes.
   * @param {object} [opt] - Options containing combo and index.
   * @returns {object|null} The matched node or null.
   */
  _matchNodeNext = (branch, nodes, opt = {}) => {
    const { combo, index } = opt;
    const { combo: nextCombo, leaves } = branch[index];
    const twig = {
      combo,
      leaves
    };
    const nextNodes = this._getCombinedNodes(twig, nodes, DIR_NEXT);
    if (nextNodes.length) {
      if (index === branch.length - 1) {
        if (nextNodes.length === 1) {
          return nextNodes[0];
        }
        const [nextNode] = sortNodes(nextNodes);
        return nextNode;
      }
      return this._matchNodeNext(branch, nextNodes, {
        combo: nextCombo,
        index: index + 1
      });
    }
    return null;
  };

  /**
   * Recursively checks for a valid backward path.
   * @private
   * @param {object} node - The starting node.
   * @param {Array.<object>} branch - The selector branch.
   * @param {number} index - The current branch index.
   * @param {object} opt - The match options.
   * @returns {boolean} True if a valid path exists, otherwise false.
   */
  _hasValidPathPrev = (node, branch, index, opt) => {
    if (index < 0) {
      return true;
    }
    const twig = branch[index];
    const { combo, leaves } = twig;
    const comboName = combo.name;
    if (comboName === '+') {
      const refNode = node.previousElementSibling;
      if (refNode && this._matchLeaves(leaves, refNode, opt)) {
        if (this._hasValidPathPrev(refNode, branch, index - 1, opt)) {
          return true;
        }
      }
    } else if (comboName === '~') {
      let refNode = node.previousElementSibling;
      while (refNode) {
        if (this._matchLeaves(leaves, refNode, opt)) {
          if (this._hasValidPathPrev(refNode, branch, index - 1, opt)) {
            return true;
          }
        }
        refNode = refNode.previousElementSibling;
      }
    } else if (comboName === '>') {
      const parentNode = node.parentNode;
      if (parentNode && this._matchLeaves(leaves, parentNode, opt)) {
        if (this._hasValidPathPrev(parentNode, branch, index - 1, opt)) {
          return true;
        }
      }
    } else {
      let refNode = node.parentNode;
      while (refNode) {
        if (this._matchLeaves(leaves, refNode, opt)) {
          if (this._hasValidPathPrev(refNode, branch, index - 1, opt)) {
            return true;
          }
        }
        refNode = refNode.parentNode;
      }
    }
    return false;
  };

  /**
   * Processes complex branch for all matches.
   * @private
   * @param {Array.<object>} branch - The selector branch.
   * @param {Array.<object>} entryNodes - The entry nodes.
   * @param {string} dir - The traversal direction.
   * @returns {Set.<object>} Set of matched nodes.
   */
  _processComplexBranchAll = (branch, entryNodes, dir) => {
    const matchedNodes = new Set();
    const branchLen = branch.length;
    const lastIndex = branchLen - 1;
    if (dir === DIR_NEXT) {
      const { combo: firstCombo } = branch[0];
      for (const node of entryNodes) {
        let combo = firstCombo;
        let nextNodes = [node];
        for (let i = 1; i < branchLen; i++) {
          const { combo: nextCombo, leaves } = branch[i];
          const twig = { combo, leaves };
          const nodesArr = this._getCombinedNodes(twig, nextNodes, dir);
          if (nodesArr.length) {
            if (i === lastIndex) {
              for (const nextNode of nodesArr) {
                matchedNodes.add(nextNode);
              }
            }
            combo = nextCombo;
            nextNodes = nodesArr;
          } else {
            break;
          }
        }
      }
    } else {
      const matchOpt = { warn: this._warn };
      for (let i = 0, len = entryNodes.length; i < len; i++) {
        const node = entryNodes[i];
        if (this._hasValidPathPrev(node, branch, lastIndex - 1, matchOpt)) {
          matchedNodes.add(node);
        }
      }
    }
    return matchedNodes;
  };

  /**
   * Processes complex branch for the first match.
   * @private
   * @param {Array.<object>} branch - The selector branch.
   * @param {Array.<object>} entryNodes - The entry nodes.
   * @param {string} dir - The traversal direction.
   * @param {string} targetType - The target type.
   * @returns {object|null} The matched node or null.
   */
  _processComplexBranchFirst = (branch, entryNodes, dir, targetType) => {
    const branchLen = branch.length;
    const lastIndex = branchLen - 1;
    if (dir === DIR_NEXT) {
      const { combo: entryCombo } = branch[0];
      for (const node of entryNodes) {
        const matchedNode = this._matchNodeNext(branch, new Set([node]), {
          combo: entryCombo,
          index: 1
        });
        if (matchedNode) {
          if (this._node.nodeType === ELEMENT_NODE) {
            if (
              matchedNode !== this._node &&
              this._node.contains(matchedNode)
            ) {
              return matchedNode;
            }
          } else {
            return matchedNode;
          }
        }
      }
      const { leaves: entryLeaves } = branch[0];
      const [entryNode] = entryNodes;
      if (this._node.contains(entryNode)) {
        let [refNode] = this._findNodeWalker(entryLeaves, entryNode, {
          targetType
        });
        while (refNode) {
          const matchedNode = this._matchNodeNext(branch, new Set([refNode]), {
            combo: entryCombo,
            index: 1
          });
          if (matchedNode) {
            if (this._node.nodeType === ELEMENT_NODE) {
              if (
                matchedNode !== this._node &&
                this._node.contains(matchedNode)
              ) {
                return matchedNode;
              }
            } else {
              return matchedNode;
            }
          }
          [refNode] = this._findNodeWalker(entryLeaves, refNode, {
            targetType,
            force: true
          });
        }
      }
    } else {
      const matchOpt = { warn: this._warn };
      for (let i = 0, len = entryNodes.length; i < len; i++) {
        const node = entryNodes[i];
        if (this._hasValidPathPrev(node, branch, lastIndex - 1, matchOpt)) {
          return node;
        }
      }
      if (targetType === TARGET_FIRST) {
        const { leaves: entryLeaves } = branch[lastIndex];
        const entryNode = entryNodes[0];
        let [refNode] = this._findNodeWalker(entryLeaves, entryNode, {
          targetType
        });
        while (refNode) {
          if (
            this._hasValidPathPrev(refNode, branch, lastIndex - 1, matchOpt)
          ) {
            return refNode;
          }
          [refNode] = this._findNodeWalker(entryLeaves, refNode, {
            targetType,
            force: true
          });
        }
      }
    }
    return null;
  };

  /**
   * Finds matched nodes.
   * @param {string} targetType - The target type.
   * @returns {Set.<object>|object} A collection of matched nodes.
   */
  find = targetType => {
    let collection;
    try {
      collection = this._collectNodes(targetType);
    } catch (e) {
      if (this._check) {
        return {
          ast: this._selectorAST ?? null,
          match: false,
          pseudoElement: this._pseudoElement.length
            ? this._pseudoElement.join('')
            : null
        };
      } else {
        throw e;
      }
    }
    const [[...branches], collectedNodes] = collection;
    const l = branches.length;
    let sort = l > 1 && targetType === TARGET_ALL;
    let nodes = new Set();
    for (let i = 0; i < l; i++) {
      const { branch, dir, find } = branches[i];
      if (!branch.length || !find) {
        continue;
      }
      const entryNodes = collectedNodes[i];
      const lastIndex = branch.length - 1;
      if (lastIndex === 0) {
        if (
          (targetType === TARGET_ALL || targetType === TARGET_FIRST) &&
          this._node.nodeType === ELEMENT_NODE
        ) {
          for (const node of entryNodes) {
            if (node !== this._node) {
              if (targetType === TARGET_ALL || this._node.contains(node)) {
                nodes.add(node);
                if (targetType === TARGET_FIRST) {
                  break;
                }
              }
            }
          }
        } else if (targetType === TARGET_ALL) {
          if (nodes.size) {
            for (const node of entryNodes) {
              nodes.add(node);
            }
            sort = true;
          } else {
            nodes = new Set(entryNodes);
          }
        } else {
          if (entryNodes.length) {
            nodes.add(entryNodes[0]);
          }
        }
      } else if (targetType === TARGET_ALL) {
        const newNodes = this._processComplexBranchAll(branch, entryNodes, dir);
        if (nodes.size) {
          for (const newNode of newNodes) {
            nodes.add(newNode);
          }
          sort = true;
        } else {
          nodes = newNodes;
        }
      } else {
        const matchedNode = this._processComplexBranchFirst(
          branch,
          entryNodes,
          dir,
          targetType
        );
        if (matchedNode) {
          nodes.add(matchedNode);
        }
      }
    }
    if (this._check) {
      return {
        ast: this._selectorAST,
        match: nodes.size > 0,
        pseudoElement: this._pseudoElement.length
          ? this._pseudoElement.join('')
          : null
      };
    }
    if (targetType === TARGET_FIRST || targetType === TARGET_ALL) {
      nodes.delete(this._node);
    }
    if ((sort || targetType === TARGET_FIRST) && nodes.size > 1) {
      return new Set(sortNodes(nodes));
    }
    return nodes;
  };

  /**
   * Gets AST for selector.
   * @param {string} selector - The selector text.
   * @returns {object} The AST for the selector.
   */
  getAST = selector => {
    return parseSelector(selector);
  };
}
