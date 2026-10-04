/**
 * finder.js
 */

/* import */
import { Evaluator } from './evaluator.js';
import { Mapper } from './mapper.js';
import { matchPseudoElementSelector } from './matcher.js';
import { generateCSS } from './parser.js';
import {
  canUseFastClassSearch,
  canUseFastTagSearch,
  getTraversalStrategy,
  sortNodes,
  traverseNode
} from './utility.js';

/* constants */
import {
  ATTR_SELECTOR,
  CLASS_SELECTOR,
  DIR_NEXT,
  DIR_PREV,
  DOCUMENT_FRAGMENT_NODE,
  ELEMENT_NODE,
  ID_SELECTOR,
  MIME_HTML,
  PS_ELEMENT_SELECTOR,
  TARGET_ALL,
  TARGET_FIRST,
  TARGET_LINEAL,
  TARGET_SELF,
  TYPE_SELECTOR
} from './constant.js';

/* types */
/**
 * @typedef {object} StrategyOptions
 * @property {boolean} [complex] - Indicates if the selector branch is complex.
 * @property {boolean} [precede] - Indicates whether to search preceding nodes.
 * @property {string} [dir] - The traversal direction.
 * @property {Array<import('css-tree').CssNode>} [filterLeaves] - An array of AST leaves used for filtering.
 */

/**
 * Finder
 * Evaluates CSS selectors to find and collect matched nodes.
 * NOTE: #ast[i] corresponds to #nodes[i]
 */
export class Finder extends Evaluator {
  /* private fields */
  #ast;
  #mapper;
  #nodeWalker;
  #nodes;
  #scoped;
  #selector;
  #selectorAST = null;

  /**
   * Gets the selector AST.
   * @returns {import('css-tree').CssNode|null} The selector AST.
   */
  get selectorAST() {
    return this.#selectorAST;
  }

  /**
   * Sets up the finder.
   * @param {string} selector - The CSS selector.
   * @param {Document|DocumentFragment|Element} node - Document, DocumentFragment, or Element.
   * @param {import('../index.js').FindOptions} opt - Options.
   * @returns {Finder} The Finder instance.
   */
  setup(selector, node, opt) {
    super.setup(selector, node, opt);
    this.#ast = null;
    this.#mapper = new Mapper(this);
    this.#nodeWalker = null;
    this.#nodes = null;
    this.#scoped =
      this.node !== this.root && this.node.nodeType === ELEMENT_NODE;
    this.#selector = selector;
    this.#selectorAST = null;
    return this;
  }

  /**
   * Finds matched nodes.
   * @param {string} targetType - The target type.
   * @returns {Set<Element>|import('../index.js').CheckResult} A collection of matched nodes or a CheckResult object.
   */
  find(targetType) {
    let collection;
    try {
      collection = this.#prepareCollection(targetType);
    } catch (e) {
      if (this.check) {
        return {
          ast: this.#selectorAST,
          error: e,
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
        const newNodes = this.processComplexBranchAll(branch, entryNodes, dir);
        if (nodes.size) {
          for (const newNode of newNodes) {
            nodes.add(newNode);
          }
          sort = true;
        } else {
          nodes = newNodes;
        }
      } else {
        const matchedNode = this.processComplexBranchFirst(
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
        error: null,
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
  }

  /**
   * Collects all matching nodes into AST nodes array.
   * @private
   * @param {string} targetType - The target type.
   * @returns {Array} Array containing the AST and nodes arrays.
   */
  #prepareCollection(targetType) {
    const { ast, invalidate, nodes, selectorAST } = this.#mapper.correspond(
      this.#selector
    );
    this.#ast = ast;
    this.#nodes = nodes;
    this.invalidate = invalidate;
    this.#selectorAST = selectorAST;
    const astValues = this.#ast.values();
    if (targetType === TARGET_ALL || targetType === TARGET_FIRST) {
      const pendingItems = new Set();
      const hasScope =
        typeof this.#selector === 'string' && this.#selector.includes(':scope');
      const scoped = this.#scoped;
      let i = 0;
      for (const { branch } of astValues) {
        const complex = branch.length > 1;
        const { dir, twig } = getTraversalStrategy(
          branch,
          targetType,
          hasScope,
          scoped
        );
        const { compound, filtered, nodes, pending } = this.#findEntryNodes(
          twig,
          targetType,
          { complex, dir }
        );
        if (nodes.length) {
          this.#ast[i].find = true;
          this.#nodes[i] = nodes;
        } else if (pending) {
          pendingItems.add({
            index: i,
            twig
          });
        }
        this.#ast[i].dir = dir;
        this.#ast[i].filtered = filtered || !compound;
        i++;
      }
      this.#processPendingItems(pendingItems);
    } else {
      let i = 0;
      for (const { branch } of astValues) {
        const twig = branch[branch.length - 1];
        const complex = branch.length > 1;
        const dir = DIR_PREV;
        const { compound, filtered, nodes } = this.#findEntryNodes(
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
  }

  /**
   * Finds entry nodes based on the selector type.
   * @private
   * @param {import('./processor.js').ProcessedBranch} twig - The twig object containing leaves.
   * @param {string} targetType - The target type.
   * @param {StrategyOptions} [opt] - The strategy options.
   * @returns {object} Result object with nodes and flags.
   */
  #findEntryNodes(twig, targetType, opt = {}) {
    const { leaves } = twig;
    const [leaf] = leaves;
    const filterLeaves = this.getFilterLeaves(leaves);
    const { complex = false, dir = DIR_PREV } = opt;
    const precede =
      dir === DIR_NEXT &&
      this.node.nodeType === ELEMENT_NODE &&
      this.node !== this.root;
    switch (leaf.type) {
      case PS_ELEMENT_SELECTOR: {
        return this.#findEntryNodesForPseudoElement(
          leaf,
          filterLeaves,
          targetType,
          opt
        );
      }
      case ID_SELECTOR: {
        return this.#findEntryNodesForId(twig, targetType, {
          complex,
          precede,
          filterLeaves
        });
      }
      case CLASS_SELECTOR: {
        return this.#findEntryNodesForClass(leaves, targetType, {
          complex,
          precede,
          filterLeaves
        });
      }
      case TYPE_SELECTOR: {
        return this.#findEntryNodesForType(leaves, targetType, {
          complex,
          precede,
          filterLeaves
        });
      }
      default: {
        return this.#findEntryNodesForOther(twig, targetType, {
          complex,
          precede,
          filterLeaves
        });
      }
    }
  }

  /**
   * Finds entry nodes for pseudo-elements.
   * @private
   * @param {import('css-tree').CssNode} leaf - The AST leaf.
   * @param {Array<object>} filterLeaves - Leaves for filtering.
   * @param {string} targetType - The target type.
   * @param {StrategyOptions} opt - The strategy options.
   * @returns {object} Object with nodes, filtered, and pending flags.
   */
  #findEntryNodesForPseudoElement(leaf, filterLeaves, targetType, opt) {
    const compound = filterLeaves.length > 0;
    if (targetType === TARGET_SELF && this.check) {
      const css = generateCSS(leaf);
      this.pseudoElements.push(css);
      if (filterLeaves.length) {
        const [nodes, filtered] = this.matchSelf(filterLeaves);
        return { compound, filtered, nodes, pending: false };
      }
      return { compound, filtered: true, nodes: [this.node], pending: false };
    }
    matchPseudoElementSelector(leaf.name, leaf.type, opt);
    return { compound, filtered: false, nodes: [], pending: false };
  }

  /**
   * Finds entry nodes using ID selector strategy.
   * @private
   * @param {import('./processor.js').ProcessedBranch} twig - The twig object containing leaves.
   * @param {string} targetType - The target type.
   * @param {StrategyOptions} [opt] - The strategy options.
   * @returns {object} Result object with nodes and flags.
   */
  #findEntryNodesForId(twig, targetType, opt = {}) {
    const { leaves } = twig;
    const { complex, precede, filterLeaves = [] } = opt;
    const compound = filterLeaves.length > 0;
    const earlyResult = this.findSelfOrLinealTarget(
      leaves,
      targetType,
      complex,
      compound
    );
    if (earlyResult) {
      return earlyResult;
    }
    if (
      targetType === TARGET_FIRST &&
      this.root.nodeType !== ELEMENT_NODE &&
      this.node.nodeType !== ELEMENT_NODE
    ) {
      const [leaf] = leaves;
      const node = this.root.getElementById(leaf.name);
      /*
       * getElementById() answers with the first element carrying the id.
       * For a compound selector that element may fail the remaining leaves
       * while a later element sharing the id still matches, so the shortcut
       * can only conclude the search when it succeeds.
       */
      if (!filterLeaves.length) {
        const nodes = node ? [node] : [];
        return { compound, filtered: nodes.length > 0, nodes, pending: false };
      }
      if (node && this.matchLeaves(filterLeaves, node)) {
        return { compound, filtered: true, nodes: [node], pending: false };
      }
    }
    return this.#findNodesWithWalker(leaves, targetType, precede, compound);
  }

  /**
   * Finds entry nodes using class selector strategy.
   * @private
   * @param {Array<import('css-tree').CssNode>} leaves - The AST leaves.
   * @param {string} targetType - The target type.
   * @param {StrategyOptions} [opt] - The strategy options.
   * @returns {object} Result object with nodes and flags.
   */
  #findEntryNodesForClass(leaves, targetType, opt = {}) {
    const { complex, precede, filterLeaves = [] } = opt;
    const compound = filterLeaves.length > 0;
    const earlyResult = this.findSelfOrLinealTarget(
      leaves,
      targetType,
      complex,
      compound
    );
    if (earlyResult) {
      return earlyResult;
    }
    if (
      targetType !== TARGET_FIRST &&
      !precede &&
      canUseFastClassSearch(this.node)
    ) {
      this.matchLeaves(leaves, this.node);
      const [leaf] = leaves;
      const className = this.getUnescapedName(leaf);
      const collection = this.node.getElementsByClassName(className);
      return this.#filterCollection(collection, filterLeaves, compound);
    }
    return this.#findNodesWithWalker(leaves, targetType, precede, compound);
  }

  /**
   * Finds entry nodes using type selector strategy.
   * @private
   * @param {Array<import('css-tree').CssNode>} leaves - The AST leaves.
   * @param {string} targetType - The target type.
   * @param {StrategyOptions} [opt] - The strategy options.
   * @returns {object} Result object with nodes and flags.
   */
  #findEntryNodesForType(leaves, targetType, opt = {}) {
    const { complex, precede, filterLeaves = [] } = opt;
    const compound = filterLeaves.length > 0;
    const earlyResult = this.findSelfOrLinealTarget(
      leaves,
      targetType,
      complex,
      compound
    );
    if (earlyResult) {
      return earlyResult;
    }
    const [leaf] = leaves;
    const tagName = this.getUnescapedName(leaf);
    if (
      targetType !== TARGET_FIRST &&
      !precede &&
      this.document.contentType === MIME_HTML &&
      canUseFastTagSearch(this.node, tagName)
    ) {
      this.matchLeaves(leaves, this.node);
      const collection = this.node.getElementsByTagName(tagName);
      return this.#filterCollection(collection, filterLeaves, compound);
    }
    return this.#findNodesWithWalker(leaves, targetType, precede, compound);
  }

  /**
   * Finds entry nodes for other selector types.
   * @private
   * @param {import('./processor.js').ProcessedBranch} twig - The twig object containing leaves.
   * @param {string} targetType - The target type.
   * @param {StrategyOptions} [opt] - The strategy options.
   * @returns {object} Result object with nodes and flags.
   */
  #findEntryNodesForOther(twig, targetType, opt = {}) {
    const { leaves } = twig;
    const [leaf] = leaves;
    const { complex, precede, filterLeaves = [] } = opt;
    const compound = filterLeaves.length > 0;
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
        return { compound, filtered: nodes.length > 0, nodes, pending: false };
      }
    }
    const earlyResult = this.findSelfOrLinealTarget(
      leaves,
      targetType,
      complex,
      compound
    );
    if (earlyResult) {
      return earlyResult;
    }
    if (
      targetType === TARGET_FIRST ||
      (leaf.type === ATTR_SELECTOR && !compound)
    ) {
      return this.#findNodesWithWalker(leaves, targetType, precede, compound);
    }
    return { compound, filtered: false, nodes: [], pending: true };
  }

  /**
   * Processes pending items to find matches.
   * @private
   * @param {Set<{index: number, twig: import('./processor.js').ProcessedBranch}>} pendingItems - Set of pending items to process.
   * @returns {void}
   */
  #processPendingItems(pendingItems) {
    if (!pendingItems.size) {
      return;
    }
    const node = this.#scoped ? this.node : this.root;
    const walker = this.createTreeWalker(this.root);
    let nextNode = traverseNode(node, walker);
    while (nextNode) {
      const isWithinScope =
        this.node.nodeType !== ELEMENT_NODE ||
        nextNode === this.node ||
        this.node.contains(nextNode);
      if (isWithinScope) {
        for (const pendingItem of pendingItems) {
          const { leaves } = pendingItem.twig;
          if (this.matchLeaves(leaves, nextNode)) {
            const { index } = pendingItem;
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
  }

  /**
   * Standardizes the loop processing and filtering of a collection.
   * @private
   * @param {object} collection - The HTMLCollection or NodeList to process.
   * @param {Array<object>} filterLeaves - Leaves for filtering.
   * @param {boolean} compound - Indicates if there are filter leaves.
   * @returns {object} Result object with nodes and flags.
   */
  #filterCollection(collection, filterLeaves, compound) {
    const len = collection.length;
    const hasFilter = filterLeaves.length > 0;
    const nodeArray = [];
    for (let i = 0; i < len; i++) {
      const currentNode = collection[i];
      if (!hasFilter || this.matchLeaves(filterLeaves, currentNode)) {
        nodeArray.push(currentNode);
      }
    }
    return {
      compound,
      filtered: nodeArray.length > 0,
      nodes: nodeArray,
      pending: false
    };
  }

  /**
   * Returns the fallback search result using NodeWalker.
   * @private
   * @param {Array<import('css-tree').CssNode>} leaves - The AST leaves.
   * @param {string} targetType - The target type.
   * @param {boolean} precede - Indicates if searching preceding nodes.
   * @param {boolean} compound - Indicates if there are filter leaves.
   * @returns {object} Result object with nodes and flags.
   */
  #findNodesWithWalker(leaves, targetType, precede, compound) {
    const nodes = this.findNodeWalker(leaves, this.node, {
      precede,
      targetType
    });
    return { compound, filtered: nodes.length > 0, nodes, pending: false };
  }
}
