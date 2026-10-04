/**
 * evaluator.js
 */

/* import */
import { EventHandler } from './event.js';
import {
  matchAttributeSelector,
  matchPseudoElementSelector,
  matchTypeSelector
} from './matcher.js';
import { generateCSS, parseSelector, unescapeSelector } from './parser.js';
import { PseudoClassEvaluator } from './pseudo-class.js';
import { ShadowDOMEvaluator } from './shadow.js';
import { DOMTraverser } from './traverser.js';
import { resolveContent } from './utility.js';

/* constants */
import {
  ATTR_SELECTOR,
  CLASS_SELECTOR,
  DOCUMENT_FRAGMENT_NODE,
  ELEMENT_NODE,
  FORM_PARTS,
  ID_SELECTOR,
  NEST_SELECTOR,
  NOT_SUPPORTED_ERR,
  PS_CLASS_SELECTOR,
  TARGET_LINEAL,
  TARGET_SELF,
  TYPE_SELECTOR
} from './constant.js';
const KEYS_FORM = new Set([...FORM_PARTS, 'fieldset', 'form']);
const KEYS_UNCACHE = new Set(['any-link', 'defined', 'dir', 'link', 'scope']);

/**
 * Evaluator
 * Determines if DOM elements match provided CSS selectors.
 */
export class Evaluator {
  /* private fields */
  #domTraverser;
  #eventHandler;
  #filterLeavesCache;
  #invalidate;
  #invalidateResults;
  #nestingAST;
  #pseudoClassEvaluator;
  #results;
  #shadowEvaluator;
  #unescapedCache;

  /**
   * @param {Window} window - The window object.
   */
  constructor(window) {
    this.window = window;
    this.documentCache = new WeakMap();
    this.#domTraverser = new DOMTraverser(this);
    this.#eventHandler = new EventHandler(window);
    this.#pseudoClassEvaluator = new PseudoClassEvaluator(this);
    this.#shadowEvaluator = new ShadowDOMEvaluator(this);
    this.#unescapedCache = new WeakMap();
    this.clearResults(true);
  }

  /**
   * Gets the event handler.
   * @returns {EventHandler} The EventHandler instance.
   */
  get eventHandler() {
    return this.#eventHandler;
  }

  /**
   * Gets the invalidate flag.
   * @returns {boolean} True if the selector should be invalidated, false otherwise.
   */
  get invalidate() {
    return this.#invalidate;
  }

  /**
   * Sets the invalidate flag.
   * @param {boolean} value - A flag to set.
   */
  set invalidate(value) {
    this.#invalidate = !!value;
  }

  /**
   * Gets the verifyShadowHost flag from ShadowDOMEvaluator.
   * @returns {boolean} True if shadow host is verified, false otherwise.
   */
  get verifyShadowHost() {
    return this.#shadowEvaluator.verifyShadowHost;
  }

  /**
   * Sets up the evaluator.
   * @param {string} selector - The CSS selector.
   * @param {Document|DocumentFragment|Element} node - Document, DocumentFragment, or Element.
   * @param {import('../index.js').FindOptions} [opt] - Options.
   * @returns {Evaluator} The Evaluator instance.
   */
  setup(selector, node, opt = {}) {
    const { check, noexcept, warn } = opt;
    this.check = !!check;
    this.noexcept = !!noexcept;
    this.warn = !!warn;
    [this.document, this.root, this.shadow] = resolveContent(node);
    this.node = node;
    this.pseudoElements = [];
    this.#invalidate = false;
    this.#domTraverser.reset();
    this.#shadowEvaluator.reset();
    this.#pseudoClassEvaluator.reset();
    this.clearResults();
    return this;
  }

  /**
   * Handles errors.
   * @param {Error} e - The error object.
   * @param {import('../index.js').FindOptions} [opt] - Options.
   * @throws {Error} Throws an error.
   * @returns {void}
   */
  onError(e, opt = {}) {
    const noexcept = opt.noexcept ?? this.noexcept;
    if (noexcept) {
      return;
    }
    const isDOMException =
      e instanceof DOMException || e instanceof this.window.DOMException;
    if (isDOMException) {
      if (e.name === NOT_SUPPORTED_ERR) {
        if (this.warn) {
          console.warn(e.message);
        }
        return;
      }
      throw new this.window.DOMException(e.message, e.name);
    }
    const ErrorCtor = this.window[e.name];
    if (typeof ErrorCtor === 'function') {
      throw new ErrorCtor(e.message, { cause: e });
    }
    throw e;
  }

  /**
   * Destroys the evaluator instance and removes external event listeners.
   */
  destroy() {
    this.clearResults(true);
    if (this.#eventHandler) {
      this.#eventHandler.destroy();
    }
  }

  /**
   * Clear cached results.
   * @param {boolean} all - Clear all results.
   * @returns {void}
   */
  clearResults(all = false) {
    this.#invalidate = false;
    this.#invalidateResults = null;
    this.#pseudoClassEvaluator.clearResults(all);
    if (all) {
      this.#filterLeavesCache = null;
      this.#nestingAST = null;
      this.#results = new WeakMap();
    }
  }

  /**
   * Matches a selector.
   * @param {import('css-tree').CssNode} ast - The AST.
   * @param {Document|DocumentFragment|Element} node - The Document, DocumentFragment, or Element node.
   * @param {import('../index.js').FindOptions} opt - Options.
   * @returns {boolean} True if matches, otherwise false.
   */
  matchSelector(ast, node, opt) {
    if (node.nodeType === ELEMENT_NODE) {
      return this.#matchSelectorForElement(ast, node, opt);
    }
    if (
      this.shadow &&
      node.nodeType === DOCUMENT_FRAGMENT_NODE &&
      ast.type === PS_CLASS_SELECTOR
    ) {
      return this.#shadowEvaluator.matchSelectorForShadowRoot(ast, node, opt);
    }
    return false;
  }

  /**
   * Matches leaves against a node with cache check.
   * @param {Array<import('css-tree').CssNode>} leaves - The AST leaves to match.
   * @param {Element} node - The Element node.
   * @param {import('../index.js').FindOptions} [opt] - Options.
   * @returns {boolean} True if matched, otherwise false.
   */
  matchLeaves(leaves, node, opt) {
    let isFormParts;
    if (leaves.length === 1) {
      const [leaf] = leaves;
      const isUncacheable =
        leaf.type === ATTR_SELECTOR ||
        leaf.type === ID_SELECTOR ||
        (leaf.type === PS_CLASS_SELECTOR && KEYS_UNCACHE.has(leaf.name));
      if (!isUncacheable) {
        isFormParts =
          node.nodeType === ELEMENT_NODE && KEYS_FORM.has(node.localName);
      }
      if (isUncacheable || isFormParts) {
        return this.matchSelector(
          leaf,
          node,
          opt ?? {
            warn: this.warn,
            globalObject: this.window
          }
        );
      }
    }
    let results;
    if (this.invalidate) {
      if (!this.#invalidateResults) {
        this.#invalidateResults = new WeakMap();
      }
      results = this.#invalidateResults;
    } else {
      results = this.#results;
    }
    let result = results.get(leaves);
    if (result) {
      const nodeResult = result.get(node);
      if (nodeResult !== undefined) {
        return nodeResult;
      }
    }
    isFormParts ??=
      node.nodeType === ELEMENT_NODE && KEYS_FORM.has(node.localName);
    let cacheable = !isFormParts;
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
          if (KEYS_UNCACHE.has(leaf.name)) {
            cacheable = false;
          }
          break;
        }
        default: {
          // No action needed for other types.
        }
      }
      bool = this.matchSelector(
        leaf,
        node,
        opt ?? {
          warn: this.warn,
          globalObject: this.window
        }
      );
      if (!bool) {
        break;
      }
    }
    if (cacheable) {
      if (!result) {
        result = new WeakMap();
      }
      result.set(node, bool);
      results.set(leaves, result);
    }
    return bool;
  }

  /**
   * Returns a cached slice of the leaves array (excluding the first item).
   * @param {Array<import('css-tree').CssNode>} leaves - The original AST leaves array.
   * @returns {Array<object>} The filtered leaves.
   */
  getFilterLeaves(leaves) {
    if (!this.#filterLeavesCache) {
      this.#filterLeavesCache = new WeakMap();
    }
    let filterLeaves = this.#filterLeavesCache.get(leaves);
    if (filterLeaves) {
      return filterLeaves;
    }
    filterLeaves = leaves.slice(1);
    this.#filterLeavesCache.set(leaves, filterLeaves);
    return filterLeaves;
  }

  /**
   * Gets the unescaped name of an AST node from the cache.
   * @param {import('css-tree').CssNode} ast - The AST node.
   * @returns {string} The unescaped name.
   */
  getUnescapedName(ast) {
    let name = this.#unescapedCache.get(ast);
    if (name === undefined) {
      name = unescapeSelector(ast.name);
      this.#unescapedCache.set(ast, name);
    }
    return name;
  }

  /**
   * Evaluates shadow host pseudo-classes.
   * @param {import('css-tree').CssNode} ast - The AST.
   * @param {DocumentFragment} node - The DocumentFragment node.
   * @returns {boolean} True if matches, otherwise false.
   */
  evaluateShadowHost(ast, node) {
    return this.#shadowEvaluator.evaluateShadowHost(ast, node);
  }

  /**
   * Performs early evaluation for TARGET_SELF and TARGET_LINEAL.
   * @param {Array<import('css-tree').CssNode>} leaves - The AST leaves.
   * @param {string} targetType - The target type.
   * @param {boolean} complex - Indicates if the branch is complex.
   * @param {boolean} compound - Indicates if there are filter leaves.
   * @returns {object|null} The result object if matched, or null otherwise.
   */
  checkSelfOrLinealTarget(leaves, targetType, complex, compound) {
    if (targetType === TARGET_SELF) {
      const [nodes, filtered] = this.matchSelf(leaves);
      return { compound, filtered, nodes, pending: false };
    } else if (targetType === TARGET_LINEAL) {
      const [nodes, filtered] = this.findLineal(leaves, { complex });
      return { compound, filtered, nodes, pending: false };
    }
    return null;
  }

  /**
   * Matches the current node itself against leaves.
   * @param {Array<import('css-tree').CssNode>} leaves - The AST leaves.
   * @returns {Array} Array with nodes, match boolean, and pseudo-elements.
   */
  matchSelf(leaves) {
    const matched = this.matchLeaves(leaves, this.node, {
      check: this.check,
      warn: this.warn
    });
    const nodes = matched ? [this.node] : [];
    return [nodes, matched, this.pseudoElements];
  }

  /**
   * Finds lineal matching nodes (self and ancestors).
   * @param {Array<import('css-tree').CssNode>} leaves - The AST leaves.
   * @param {object} [opt] - The strategy options.
   * @param {boolean} [opt.complex] - Indicates if the branch is complex.
   * @returns {Array} Array containing nodes and filtered boolean.
   */
  findLineal(leaves, opt = {}) {
    const { complex } = opt;
    const nodes = [];
    const selfMatched = this.matchLeaves(leaves, this.node);
    if (selfMatched) {
      nodes.push(this.node);
    }
    if (!selfMatched || complex) {
      let currentNode = this.node.parentNode;
      while (currentNode) {
        if (this.matchLeaves(leaves, currentNode)) {
          nodes.push(currentNode);
          if (!complex) {
            break;
          }
        }
        currentNode = currentNode.parentNode;
      }
    }
    const filtered = nodes.length > 0;
    return [nodes, filtered];
  }

  /**
   * Matches pseudo-class selector.
   * @see https://html.spec.whatwg.org/_pseudo-classes
   * @param {import('css-tree').CssNode} ast - The AST.
   * @param {Element} node - The Element node.
   * @param {import('../index.js').FindOptions} opt - Options.
   * @returns {boolean} True if matches, otherwise false.
   */
  matchPseudoClassSelector(ast, node, opt) {
    return this.#pseudoClassEvaluator.matchPseudoClassSelector(ast, node, opt);
  }

  /**
   * Creates a TreeWalker.
   * @param {Document|DocumentFragment|Element} node - The Document, DocumentFragment, or Element node.
   * @param {object} opt - Options.
   * @returns {TreeWalker} The TreeWalker object.
   */
  createTreeWalker(node, opt) {
    return this.#domTraverser.createTreeWalker(node, opt);
  }

  /**
   * Finds matching nodes using TreeWalker.
   * @param {Array<import('css-tree').CssNode>} leaves - The AST leaves.
   * @param {Element} node - The starting node.
   * @param {import('./traverser.js').TraversalOptions} opt - The traversal options.
   * @returns {Array<Element>} An array of matched nodes.
   */
  findNodeWalker(leaves, node, opt) {
    return this.#domTraverser.findNodeWalker(leaves, node, opt);
  }

  /**
   * Processes complex branch for all matches.
   * @param {Array<import('./processor.js').ProcessedBranch>} branch - The selector branch.
   * @param {Array<Element>} entryNodes - The entry nodes.
   * @param {string} dir - The traversal direction.
   * @returns {Set<Element>} Set of matched nodes.
   */
  processComplexBranchAll(branch, entryNodes, dir) {
    return this.#domTraverser.processComplexBranchAll(branch, entryNodes, dir);
  }

  /**
   * Processes complex branch for the first match.
   * @param {Array<import('./processor.js').ProcessedBranch>} branch - The selector branch.
   * @param {Array<Element>} entryNodes - The entry nodes.
   * @param {string} dir - The traversal direction.
   * @param {string} targetType - The target type.
   * @returns {Element|null} The matched node or null.
   */
  processComplexBranchFirst(branch, entryNodes, dir, targetType) {
    return this.#domTraverser.processComplexBranchFirst(
      branch,
      entryNodes,
      dir,
      targetType
    );
  }

  /**
   * Yields combinator matches (Lazy evaluation, O(1) memory).
   * @param {import('./processor.js').ProcessedBranch} twig - The twig object.
   * @param {Element} node - The Element node.
   * @param {import('../index.js').FindOptions} opt - Options.
   * @yields {Element} The matched node.
   */
  *yieldCombinatorMatches(twig, node, opt) {
    yield* this.#domTraverser.yieldCombinatorMatches(twig, node, opt);
  }

  /**
   * Matches a selector for element nodes.
   * @private
   * @param {import('css-tree').CssNode} ast - The AST.
   * @param {Element} node - The Element node.
   * @param {import('../index.js').FindOptions} opt - Options.
   * @returns {boolean} True if matches, otherwise false.
   */
  #matchSelectorForElement(ast, node, opt) {
    const { type: astType } = ast;
    switch (astType) {
      case ATTR_SELECTOR: {
        return matchAttributeSelector(ast, node, opt);
      }
      case ID_SELECTOR: {
        return node.id === this.getUnescapedName(ast);
      }
      case CLASS_SELECTOR: {
        const astName = this.getUnescapedName(ast);
        return node.classList.contains(astName);
      }
      case NEST_SELECTOR: {
        if (!this.#nestingAST) {
          this.#nestingAST = parseSelector(':scope', 'selector');
        }
        return this.matchPseudoClassSelector(
          this.#nestingAST.children.head.data,
          node,
          opt
        );
      }
      case PS_CLASS_SELECTOR: {
        return this.matchPseudoClassSelector(ast, node, opt);
      }
      case TYPE_SELECTOR: {
        return matchTypeSelector(ast, node, opt);
      }
      // PS_ELEMENT_SELECTOR is handled by default.
      default: {
        try {
          if (this.check) {
            const css = generateCSS(ast);
            this.pseudoElements.push(css);
            return true;
          } else {
            const astName = this.getUnescapedName(ast);
            matchPseudoElementSelector(astName, astType, opt);
          }
        } catch (e) {
          this.onError(e);
        }
      }
    }
    return false;
  }
}
