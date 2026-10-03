/**
 * traverser.js
 */

/* import */
import { matchPseudoElementSelector } from './matcher.js';
import {
  canUseFastClassSearch,
  canUseFastIdSearch,
  canUseFastTagSearch,
  traverseNode
} from './utility.js';

/* constants */
import {
  DIR_NEXT,
  ELEMENT_NODE,
  ID_SELECTOR,
  CLASS_SELECTOR,
  TYPE_SELECTOR,
  PS_ELEMENT_SELECTOR,
  SHOW_CONTAINER,
  TARGET_ALL
} from './constant.js';

/* types */
/**
 * @typedef {object} TraversalOptions
 * @property {boolean} [force] - Indicates whether to force traversal.
 * @property {boolean} [precede] - Indicates whether to search preceding nodes.
 * @property {Element} [boundaryNode] - The traversal boundary limit.
 * @property {Element} [startNode] - The starting node for the traversal.
 * @property {string} [targetType] - The target type.
 */

/**
 * DOMTraverser
 * Handles DOM tree traversal and combinator matches.
 */
export class DOMTraverser {
  #evaluator;
  #walkers;

  /**
   * @param {import('./evaluator.js').Evaluator} evaluator - The Evaluator instance.
   */
  constructor(evaluator) {
    this.#evaluator = evaluator;
  }

  /**
   * Resets the traversal state.
   * @returns {void}
   */
  reset() {
    this.#walkers = null;
  }

  /**
   * Creates a TreeWalker.
   * @param {Document|DocumentFragment|Element} node - The Document, DocumentFragment, or Element node.
   * @param {object} [opt] - Options.
   * @param {boolean} [opt.force] - Force creation of a new TreeWalker.
   * @param {number} [opt.whatToShow] - The NodeFilter whatToShow value.
   * @returns {TreeWalker} The TreeWalker object.
   */
  createTreeWalker(node, opt = {}) {
    const { force = false, whatToShow = SHOW_CONTAINER } = opt;
    if (force) {
      return this.#evaluator.document.createTreeWalker(node, whatToShow);
    }
    if (!this.#walkers) {
      this.#walkers = new WeakMap();
    }
    let walker = this.#walkers.get(node);
    if (walker) {
      return walker;
    }
    walker = this.#evaluator.document.createTreeWalker(node, whatToShow);
    this.#walkers.set(node, walker);
    return walker;
  }

  /**
   * Traverses and collects nodes matching leaves.
   * @param {TreeWalker} walker - The TreeWalker instance.
   * @param {Array<import('css-tree').CssNode>} leaves - The AST leaves to match.
   * @param {TraversalOptions} [opt] - The traversal options.
   * @returns {Array<Element>} An array of collected nodes.
   */
  traverseAndCollectNodes(walker, leaves, opt = {}) {
    const { boundaryNode, force, startNode, targetType } = opt;
    const collectedNodes = [];
    if (
      targetType === TARGET_ALL &&
      boundaryNode &&
      this.#evaluator.matchLeaves(leaves, boundaryNode)
    ) {
      collectedNodes.push(boundaryNode);
    }
    let currentNode = traverseNode(startNode, walker, !!force);
    if (currentNode.nodeType !== ELEMENT_NODE) {
      currentNode = walker.nextNode();
    } else if (
      currentNode === startNode &&
      currentNode !== this.#evaluator.root
    ) {
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
        this.#evaluator.matchLeaves(leaves, currentNode) &&
        currentNode !== this.#evaluator.node
      ) {
        collectedNodes.push(currentNode);
        if (targetType !== TARGET_ALL) {
          break;
        }
      }
      currentNode = walker.nextNode();
    }
    return collectedNodes;
  }

  /**
   * Yields combinator matches.
   * @param {import('./processor.js').ProcessedBranch} twig - The twig object.
   * @param {Element} node - The Element node.
   * @param {import('../index.js').FindOptions} [opt] - Options.
   * @yields {Element} The matched node.
   */
  *yieldCombinatorMatches(twig, node, opt = {}) {
    const {
      combo: { name: comboName },
      leaves
    } = twig;
    const { dir } = opt;
    switch (comboName) {
      case '+': {
        const refNode =
          dir === DIR_NEXT
            ? node.nextElementSibling
            : node.previousElementSibling;
        if (refNode && this.#evaluator.matchLeaves(leaves, refNode, opt)) {
          yield refNode;
        }
        break;
      }
      case '~': {
        let refNode =
          dir === DIR_NEXT
            ? node.nextElementSibling
            : node.previousElementSibling;
        while (refNode) {
          if (this.#evaluator.matchLeaves(leaves, refNode, opt)) {
            yield refNode;
          }
          refNode =
            dir === DIR_NEXT
              ? refNode.nextElementSibling
              : refNode.previousElementSibling;
        }
        break;
      }
      case '>': {
        if (dir === DIR_NEXT) {
          let refNode = node.firstElementChild;
          while (refNode) {
            if (this.#evaluator.matchLeaves(leaves, refNode, opt)) {
              yield refNode;
            }
            refNode = refNode.nextElementSibling;
          }
        } else {
          const { parentNode } = node;
          if (
            parentNode &&
            this.#evaluator.matchLeaves(leaves, parentNode, opt)
          ) {
            yield parentNode;
          }
        }
        break;
      }
      case ' ':
      default: {
        if (dir === DIR_NEXT) {
          for (const refNode of this.yieldFindDescendantNodes(
            leaves,
            node,
            opt
          )) {
            yield refNode;
          }
        } else {
          const ancestors = [];
          let refNode = node.parentNode;
          while (refNode) {
            if (this.#evaluator.matchLeaves(leaves, refNode, opt)) {
              ancestors.push(refNode);
            }
            refNode = refNode.parentNode;
          }
          if (ancestors.length) {
            for (let i = ancestors.length - 1; i >= 0; i--) {
              yield ancestors[i];
            }
          }
        }
      }
    }
  }

  /**
   * Finds descendant nodes and yields matches.
   * @param {Array<object>} leaves - The AST leaves.
   * @param {DocumentFragment|Element} baseNode - The base Element node or Element.shadowRoot.
   * @param {import('../index.js').FindOptions} opt - Options.
   * @yields {Element} The matched node.
   */
  *yieldFindDescendantNodes(leaves, baseNode, opt) {
    const [leaf] = leaves;
    const { type: leafType } = leaf;
    const leafName = this.#evaluator.getUnescapedName(leaf);
    const filterLeaves = this.#evaluator.getFilterLeaves(leaves);
    const isSimple = filterLeaves.length === 0;
    switch (leafType) {
      case ID_SELECTOR: {
        if (canUseFastIdSearch(baseNode, this.#evaluator.root)) {
          const foundNode = this.#evaluator.root.getElementById(leafName);
          if (
            foundNode &&
            foundNode !== baseNode &&
            baseNode.contains(foundNode)
          ) {
            if (
              isSimple ||
              this.#evaluator.matchLeaves(filterLeaves, foundNode, opt)
            ) {
              yield foundNode;
              return;
            }
          }
          break;
        }
        break;
      }
      case CLASS_SELECTOR: {
        if (canUseFastClassSearch(baseNode)) {
          const collection = baseNode.getElementsByClassName(leafName);
          for (let i = 0, len = collection.length; i < len; i++) {
            const item = collection[i];
            if (
              isSimple ||
              this.#evaluator.matchLeaves(filterLeaves, item, opt)
            ) {
              yield item;
            }
          }
          return;
        }
        break;
      }
      case TYPE_SELECTOR: {
        if (canUseFastTagSearch(baseNode, leafName)) {
          const collection = baseNode.getElementsByTagName(leafName);
          for (let i = 0, len = collection.length; i < len; i++) {
            const item = collection[i];
            if (
              isSimple ||
              this.#evaluator.matchLeaves(filterLeaves, item, opt)
            ) {
              yield item;
            }
          }
          return;
        }
        break;
      }
      case PS_ELEMENT_SELECTOR: {
        matchPseudoElementSelector(leafName, leafType, opt);
        return;
      }
      default: {
        // no-op
      }
    }
    yield* this.yieldTraverseAllDescendants(baseNode, leaves, opt);
  }

  /**
   * Traverses all descendant nodes and yields matches.
   * @param {DocumentFragment|Element} baseNode - The base Element node or Element.shadowRoot.
   * @param {Array<object>} leaves - The AST leaves.
   * @param {import('../index.js').FindOptions} opt - Options.
   * @yields {Element} The matched node.
   */
  *yieldTraverseAllDescendants(baseNode, leaves, opt) {
    const walker = this.createTreeWalker(baseNode);
    traverseNode(baseNode, walker);
    let currentNode = walker.firstChild();
    while (currentNode) {
      if (this.#evaluator.matchLeaves(leaves, currentNode, opt)) {
        yield currentNode;
      }
      currentNode = walker.nextNode();
    }
  }
}
