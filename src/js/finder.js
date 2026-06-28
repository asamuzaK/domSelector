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
  CLASS_SELECTOR,
  COMBINATOR,
  DOCUMENT_FRAGMENT_NODE,
  ELEMENT_NODE,
  ID_SELECTOR,
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

/**
 * Finder
 * NOTE: #ast[i] corresponds to #nodes[i]
 */
export class Finder extends Evaluator {
  /* private fields */
  #ast;
  #nodeWalker;
  #nodes;
  #rootWalker;
  #scoped;
  #selector;
  #selectorAST;

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
    this.#ast = null;
    this.#nodes = null;
    this.#scoped =
      this.node !== this.root && this.node.nodeType === ELEMENT_NODE;
    this.#selector = selector;
    this.#selectorAST = null;
    this.#nodeWalker = null;
    this.#rootWalker = null;
    return this;
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
            this.onError(generateException(msg, SYNTAX_ERR, this.window));
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
    let descendant = false;
    this.invalidate = false;
    let ast;
    if (this.documentCache.has(this.document)) {
      const cachedItem = this.documentCache.get(this.document);
      if (cachedItem && cachedItem.has(`${selector}`)) {
        const item = cachedItem.get(`${selector}`);
        ast = item.ast;
        descendant = item.descendant;
        this.invalidate = item.invalidate;
        this.#selectorAST = item.selectorAST;
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
      this.#selectorAST = parseSelector(selector);
      const { branches, info } = walkAST(
        this.#selectorAST,
        true,
        createHasValidator(this.window)
      );
      const {
        hasHasPseudoFunc,
        hasLogicalPseudoFunc,
        hasNthChildOfSelector,
        hasStatePseudoClass,
        hasUnsupportedPseudoClass
      } = info;
      this.invalidate =
        hasHasPseudoFunc ||
        hasStatePseudoClass ||
        hasUnsupportedPseudoClass ||
        !!(hasLogicalPseudoFunc && hasNthChildOfSelector);
      const processed = this._processSelectorBranches(branches, selector);
      ast = processed.ast;
      descendant = processed.descendant;
      let cachedItem;
      if (this.documentCache.has(this.document)) {
        cachedItem = this.documentCache.get(this.document);
      } else {
        cachedItem = new Map();
      }
      cachedItem.set(`${selector}`, {
        ast,
        descendant,
        invalidate: this.invalidate,
        selectorAST: this.#selectorAST
      });
      this.documentCache.set(this.document, cachedItem);
      for (let i = 0; i < ast.length; i++) {
        nodes[i] = [];
      }
    }
    return [ast, nodes];
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
    } else if (currentNode === startNode && currentNode !== this.root) {
      currentNode = walker.nextNode();
    }
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
        this.matchLeaves(leaves, currentNode, this.matchOpts) &&
        currentNode !== this.node
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
    if (!this.#rootWalker) {
      this.#rootWalker = this.createTreeWalker(this.root);
    }
    return this._traverseAndCollectNodes(this.#rootWalker, leaves, {
      force,
      targetType,
      boundaryNode: this.node,
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
      const precedeNodes = this._findPrecede(leaves, this.root, opt);
      if (precedeNodes.length) {
        return precedeNodes;
      }
    }
    if (!this.#nodeWalker) {
      this.#nodeWalker = this.createTreeWalker(this.node);
    }
    return this._traverseAndCollectNodes(this.#nodeWalker, leaves, {
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
    const matched = this.matchLeaves(leaves, this.node, {
      check: this.check,
      warn: this.warn
    });
    const nodes = matched ? [this.node] : [];
    return [nodes, matched, this.pseudoElements];
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
    const selfMatched = this.matchLeaves(leaves, this.node, this.matchOpts);
    if (selfMatched) {
      nodes.push(this.node);
    }
    if (!selfMatched || complex) {
      let currentNode = this.node.parentNode;
      while (currentNode) {
        if (this.matchLeaves(leaves, currentNode, this.matchOpts)) {
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
    if (targetType === TARGET_SELF && this.check) {
      const css = generateCSS(leaf);
      this.pseudoElements.push(css);
      if (filterLeaves.length) {
        const [nodes, filtered] = this._matchSelf(filterLeaves);
        return { nodes, filtered, pending: false };
      }
      return { nodes: [this.node], filtered: true, pending: false };
    }
    matchPseudoElementSelector(leaf.name, leaf.type, this.matchOpts);
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
      this.root.nodeType !== ELEMENT_NODE
    ) {
      const [leaf] = leaves;
      const node = this.root.getElementById(leaf.name);
      const nodes = [];
      if (node) {
        if (filterLeaves.length) {
          if (this.matchLeaves(filterLeaves, node, this.matchOpts)) {
            nodes.push(node);
          }
        } else {
          nodes.push(node);
        }
      }
      return { nodes, filtered: nodes.length > 0, pending: false };
    }
    const nodes = this._findNodeWalker(leaves, this.node, {
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
      typeof this.node.getElementsByClassName === 'function'
    ) {
      this.matchLeaves(leaves, this.node, this.matchOpts);
      const [leaf] = leaves;
      const className = unescapeSelector(leaf.name);
      const collection = this.node.getElementsByClassName(className);
      const len = collection.length;
      const filterLeaves = this.getFilterLeaves(leaves);
      const hasFilter = filterLeaves.length > 0;
      const nodeArray = [];
      for (let i = 0; i < len; i++) {
        const currentNode = collection[i];
        if (
          !hasFilter ||
          this.matchLeaves(filterLeaves, currentNode, this.matchOpts)
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
    const nodes = this._findNodeWalker(leaves, this.node, {
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
      this.document.contentType === 'text/html' &&
      typeof this.node.getElementsByTagName === 'function' &&
      tagName.indexOf('|') === -1
    ) {
      this.matchLeaves(leaves, this.node, this.matchOpts);
      const collection = this.node.getElementsByTagName(tagName);
      const len = collection.length;
      const filterLeaves = this.getFilterLeaves(leaves);
      const hasFilter = filterLeaves.length > 0;
      const nodeArray = [];
      for (let i = 0; i < len; i++) {
        const currentNode = collection[i];
        if (
          !hasFilter ||
          this.matchLeaves(filterLeaves, currentNode, this.matchOpts)
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
    const nodes = this._findNodeWalker(leaves, this.node, {
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
        this.shadow &&
        this.node.nodeType === DOCUMENT_FRAGMENT_NODE &&
        this.evaluateShadowHost(leaf, this.node)
      ) {
        shadowRoot = this.node;
      } else if (
        filterLeaves.length &&
        this.node.nodeType === ELEMENT_NODE &&
        this.evaluateShadowHost(leaf, this.node.shadowRoot)
      ) {
        shadowRoot = this.node.shadowRoot;
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
      const nodes = this._findNodeWalker(leaves, this.node, {
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
      this.node.nodeType === ELEMENT_NODE &&
      this.node !== this.root;
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
      this.#selector.includes(':scope') ||
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
    } else if (branchLen > 2 && this.#scoped && targetType === TARGET_FIRST) {
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
    if (!this.#rootWalker) {
      this.#rootWalker = this.createTreeWalker(this.root);
    }
    const node = this.#scoped ? this.node : this.root;
    const walker = this.#rootWalker;
    let nextNode = traverseNode(node, walker);
    while (nextNode) {
      const isWithinScope =
        this.node.nodeType !== ELEMENT_NODE ||
        nextNode === this.node ||
        this.node.contains(nextNode);
      if (isWithinScope) {
        for (const pendingItem of pendingItems) {
          const { leaves } = pendingItem.get('twig');
          if (this.matchLeaves(leaves, nextNode, this.matchOpts)) {
            const index = pendingItem.get('index');
            this.#ast[index].filtered = true;
            this.#ast[index].find = true;
            this.#nodes[index].push(nextNode);
          }
        }
      } else if (this.#scoped) {
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
    [this.#ast, this.#nodes] = this._correspond(this.#selector);
    const ast = this.#ast.values();
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
          this.#ast[i].find = true;
          this.#nodes[i] = nodes;
        } else if (pending) {
          pendingItems.add(
            new Map([
              ['index', i],
              ['twig', twig]
            ])
          );
        }
        this.#ast[i].dir = dir;
        this.#ast[i].filtered = filtered || !compound;
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
          this.#ast[i].find = true;
          this.#nodes[i] = nodes;
        }
        this.#ast[i].dir = dir;
        this.#ast[i].filtered = filtered || !compound;
        i++;
      }
    }
    return [this.#ast, this.#nodes];
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
    for (const node of nodes) {
      for (const nextNode of this.yieldCombinatorMatches(twig, node, {
        dir: DIR_NEXT
      })) {
        if (index === branch.length - 1) {
          return nextNode;
        }
        const result = this._matchNodeNext(branch, new Set([nextNode]), {
          combo: nextCombo,
          index: index + 1
        });
        if (result) {
          return result;
        }
      }
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
      if (refNode && this.matchLeaves(leaves, refNode, opt)) {
        if (this._hasValidPathPrev(refNode, branch, index - 1, opt)) {
          return true;
        }
      }
    } else if (comboName === '~') {
      let refNode = node.previousElementSibling;
      while (refNode) {
        if (this.matchLeaves(leaves, refNode, opt)) {
          if (this._hasValidPathPrev(refNode, branch, index - 1, opt)) {
            return true;
          }
        }
        refNode = refNode.previousElementSibling;
      }
    } else if (comboName === '>') {
      const parentNode = node.parentNode;
      if (parentNode && this.matchLeaves(leaves, parentNode, opt)) {
        if (this._hasValidPathPrev(parentNode, branch, index - 1, opt)) {
          return true;
        }
      }
    } else {
      let refNode = node.parentNode;
      while (refNode) {
        if (this.matchLeaves(leaves, refNode, opt)) {
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
      const dfs = (node, index, currentCombo) => {
        const { combo: nextCombo, leaves } = branch[index];
        const twig = { combo: currentCombo, leaves };
        for (const nextNode of this.yieldCombinatorMatches(twig, node, {
          dir
        })) {
          if (index === lastIndex) {
            matchedNodes.add(nextNode);
          } else {
            dfs(nextNode, index + 1, nextCombo);
          }
        }
      };
      for (const node of entryNodes) {
        dfs(node, 1, firstCombo);
      }
    } else {
      for (let i = 0, len = entryNodes.length; i < len; i++) {
        const node = entryNodes[i];
        if (
          this._hasValidPathPrev(node, branch, lastIndex - 1, this.matchOpts)
        ) {
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
          if (this.node.nodeType === ELEMENT_NODE) {
            if (matchedNode !== this.node && this.node.contains(matchedNode)) {
              return matchedNode;
            }
          } else {
            return matchedNode;
          }
        }
      }
      const { leaves: entryLeaves } = branch[0];
      const [entryNode] = entryNodes;
      if (this.node.contains(entryNode)) {
        let [refNode] = this._findNodeWalker(entryLeaves, entryNode, {
          targetType
        });
        while (refNode) {
          const matchedNode = this._matchNodeNext(branch, new Set([refNode]), {
            combo: entryCombo,
            index: 1
          });
          if (matchedNode) {
            if (this.node.nodeType === ELEMENT_NODE) {
              if (
                matchedNode !== this.node &&
                this.node.contains(matchedNode)
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
      for (let i = 0, len = entryNodes.length; i < len; i++) {
        const node = entryNodes[i];
        if (
          this._hasValidPathPrev(node, branch, lastIndex - 1, this.matchOpts)
        ) {
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
            this._hasValidPathPrev(
              refNode,
              branch,
              lastIndex - 1,
              this.matchOpts
            )
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
      if (this.check) {
        return {
          ast: this.#selectorAST,
          match: false,
          pseudoElement: this.pseudoElements.length
            ? this.pseudoElements.join('')
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
          this.node.nodeType === ELEMENT_NODE
        ) {
          for (const node of entryNodes) {
            if (node !== this.node) {
              if (targetType === TARGET_ALL || this.node.contains(node)) {
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
    if (this.check) {
      return {
        ast: this.#selectorAST,
        match: nodes.size > 0,
        pseudoElement: this.pseudoElements.length
          ? this.pseudoElements.join('')
          : null
      };
    }
    if (targetType === TARGET_FIRST || targetType === TARGET_ALL) {
      nodes.delete(this.node);
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
