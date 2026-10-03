/**
 * mapper.js
 */
import { SelectorProcessor } from './processor.js';
import { parseSelector, walkAST } from './parser.js';
import { createHasValidator } from './selector.js';

/**
 * @typedef {object} MapperResult
 * @property {Array<import('./processor.js').ProcessedASTNode>} ast - Fresh AST nodes.
 * @property {boolean} invalidate - Invalidation flag for dynamic evaluation.
 * @property {Array<Array<Element>>} nodes - Array of matched element arrays per branch.
 * @property {import('css-tree').CssNode} selectorAST - The selector AST.
 */

/**
 * Mapper
 * Maps CSS selectors to parsed ASTs and sets up node arrays.
 */
export class Mapper {
  #context;
  #processor;

  /**
   * @param {import('./finder.js').Finder} context - The Finder instance.
   */
  constructor(context) {
    this.#context = context;
    this.#processor = new SelectorProcessor(context);
  }

  /**
   * Gets the corresponding AST, nodes array, invalidate flag, and selector AST.
   * @param {string} selector - The CSS selector string.
   * @returns {MapperResult} The MapperResult object.
   */
  correspond(selector) {
    const ctx = this.#context;
    let ast = null;
    let invalidate = false;
    let selectorAST = null;
    // Check cache.
    if (ctx.documentCache.has(ctx.document)) {
      const cachedItem = ctx.documentCache.get(ctx.document);
      if (cachedItem && cachedItem.has(selector)) {
        const item = cachedItem.get(selector);
        ast = item.ast;
        invalidate = item.invalidate;
        selectorAST = item.selectorAST;
      }
    }
    if (ast) {
      return this.#prepareResult(ast, invalidate, selectorAST);
    }
    // Parse selector and build metadata.
    selectorAST = parseSelector(selector);
    const { branches, info } = walkAST(
      selectorAST,
      true,
      createHasValidator(ctx.window)
    );
    const {
      hasHasPseudoFunc,
      hasNestingSelector,
      hasNthChildOfSelector,
      hasSiblingCombinator,
      hasStatePseudoClass,
      hasUnsupportedPseudoClass
    } = info;
    // Determine invalidation flags.
    invalidate =
      hasHasPseudoFunc ||
      hasNestingSelector ||
      hasNthChildOfSelector ||
      hasSiblingCombinator ||
      hasStatePseudoClass ||
      hasUnsupportedPseudoClass;
    // Process branches.
    const processed = this.#processor.process(branches, selector);
    ast = processed.ast;
    const descendant = processed.descendant;
    // Store in cache.
    let cachedItem;
    if (ctx.documentCache.has(ctx.document)) {
      cachedItem = ctx.documentCache.get(ctx.document);
    } else {
      cachedItem = new Map();
      ctx.documentCache.set(ctx.document, cachedItem);
    }
    cachedItem.set(selector, {
      ast,
      descendant,
      invalidate,
      selectorAST
    });
    return this.#prepareResult(ast, invalidate, selectorAST);
  }

  /**
   * Prepares fresh AST nodes and initialized matching nodes array.
   * @private
   * @param {Array<import('./processor.js').ProcessedASTNode>} ast - The cached or parsed AST.
   * @param {boolean} invalidate - Invalidation flag for dynamic evaluation.
   * @param {import('css-tree').CssNode} selectorAST - The parsed CSS selector AST.
   * @returns {MapperResult} The MapperResult object.
   */
  #prepareResult(ast, invalidate, selectorAST) {
    const l = ast.length;
    const freshAst = new Array(l);
    const nodes = new Array(l);
    for (let i = 0; i < l; i++) {
      freshAst[i] = {
        branch: ast[i].branch,
        dir: null,
        filtered: false,
        find: false
      };
      nodes[i] = [];
    }
    return { ast: freshAst, invalidate, nodes, selectorAST };
  }
}
