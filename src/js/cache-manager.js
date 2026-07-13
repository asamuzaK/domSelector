/**
 * cache-manager.js
 */
import { parseSelector, walkAST } from './parser.js';
import { createHasValidator } from './selector.js';

export class CacheManager {
  #context;

  /**
   * @param {import('./evaluator.js').Evaluator} evaluatorContext - The Finder (Evaluator) instance.
   */
  constructor(evaluatorContext) {
    this.#context = evaluatorContext;
  }

  /**
   * Gets the corresponding AST and empty nodes array for the given selector,
   * or creates and caches them if not already cached.
   * @param {string} selector - The CSS selector string.
   * @param {function(Array, string): {ast: Array, descendant: boolean}} processBranches - The callback function to process selector branches.
   * @returns {Array} An array containing the AST, empty nodes array, and selector AST.
   */
  getOrCreate(selector, processBranches) {
    const ctx = this.#context;
    const nodes = [];
    let ast = null;

    // 1. Check cache
    if (ctx.documentCache.has(ctx.document)) {
      const cachedItem = ctx.documentCache.get(ctx.document);
      if (cachedItem && cachedItem.has(selector)) {
        const item = cachedItem.get(selector);
        ast = item.ast;
        ctx.invalidate = item.invalidate;
        ctx.selectorAST = item.selectorAST;
      }
    }

    // 2. Clear flags for reuse if cache hit
    if (ast) {
      const l = ast.length;
      for (let i = 0; i < l; i++) {
        ast[i].dir = null;
        ast[i].filtered = false;
        ast[i].find = false;
        nodes[i] = [];
      }
      return [ast, nodes, ctx.selectorAST];
    }

    // 3. Cache miss: Parse selector and build metadata
    const selectorAST = parseSelector(selector);
    const { branches, info } = walkAST(
      selectorAST,
      true,
      createHasValidator(ctx.window)
    );

    const {
      hasHasPseudoFunc,
      hasLogicalPseudoFunc,
      hasNthChildOfSelector,
      hasStatePseudoClass,
      hasUnsupportedPseudoClass
    } = info;

    // Determine invalidation flags
    ctx.invalidate =
      hasHasPseudoFunc ||
      hasStatePseudoClass ||
      hasUnsupportedPseudoClass ||
      !!(hasLogicalPseudoFunc && hasNthChildOfSelector);

    // Process branches via callback
    const processed = processBranches(branches, selector);
    ast = processed.ast;
    const descendant = processed.descendant;

    // 4. Store in cache
    let cachedItem;
    if (ctx.documentCache.has(ctx.document)) {
      cachedItem = ctx.documentCache.get(ctx.document);
    } else {
      cachedItem = new Map();
    }

    cachedItem.set(selector, {
      ast,
      descendant,
      invalidate: ctx.invalidate,
      selectorAST
    });
    ctx.documentCache.set(ctx.document, cachedItem);

    // Initialize empty node arrays for each branch
    for (let i = 0; i < ast.length; i++) {
      nodes[i] = [];
    }

    return [ast, nodes, selectorAST];
  }
}
