/**
 * mapper.test.js
 */

/* api */
import { strict as assert } from 'node:assert';
import { JSDOM } from 'jsdom';
import { beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';

/* test */
import { Mapper } from '../src/js/mapper.js';

describe('Mapper', () => {
  let window;
  let document;
  let mockContext;
  let dummyProcessBranches;

  beforeEach(() => {
    const dom = new JSDOM(
      '<!doctype html><html><body><div id="test"></div></body></html>'
    );
    window = dom.window;
    document = window.document;

    // Mock the Finder/Evaluator context that Mapper expects
    mockContext = {
      window,
      document,
      documentCache: new Map(),
      invalidate: false,
      selectorAST: null
    };

    // Dummy callback representing Finder's _processSelectorBranches
    dummyProcessBranches = sinon.stub().callsFake((branches, selector) => {
      return {
        ast: [{ id: 1, dir: null, filtered: false, find: false }],
        descendant: false
      };
    });
  });

  describe('correspond()', () => {
    it('should create and cache new AST on cache miss', () => {
      const mapper = new Mapper(mockContext);
      const selector = 'div';

      const [ast, nodes, selectorAST] = mapper.correspond(
        selector,
        dummyProcessBranches
      );

      // Verify structure of the return values
      assert.strictEqual(Array.isArray(ast), true, 'ast should be an array');
      assert.strictEqual(
        Array.isArray(nodes),
        true,
        'nodes should be an array'
      );
      assert.strictEqual(
        typeof selectorAST,
        'object',
        'selectorAST should be an object'
      );
      assert.strictEqual(
        nodes.length,
        ast.length,
        'nodes length should match ast length'
      );

      // Verify processBranches was called
      assert.strictEqual(
        dummyProcessBranches.calledOnce,
        true,
        'processBranches should be called on cache miss'
      );

      // Verify internal cache state
      assert.strictEqual(
        mockContext.documentCache.has(document),
        true,
        'should store document in cache'
      );
      const cachedItem = mockContext.documentCache.get(document);
      assert.strictEqual(
        cachedItem.has(selector),
        true,
        'should store selector in document cache'
      );
    });

    it('should return cached data on cache hit and reset flags for reuse', () => {
      const mapper = new Mapper(mockContext);
      const selector = '.test-class';

      // First call (Cache Miss)
      const [ast1, nodes1] = mapper.correspond(selector, dummyProcessBranches);

      // Simulate modifying flags during traversal
      ast1[0].dir = 'next';
      ast1[0].filtered = true;
      ast1[0].find = true;
      nodes1[0].push(document.getElementById('test'));

      // Second call (Cache Hit)
      dummyProcessBranches.resetHistory();
      const [ast2, nodes2] = mapper.correspond(selector, dummyProcessBranches);

      // Verify processBranches was not called again
      assert.strictEqual(
        dummyProcessBranches.notCalled,
        true,
        'processBranches should not be called on cache hit'
      );

      // Verify flags are reset to original state for reuse
      assert.strictEqual(ast2[0].dir, null, 'dir flag should be reset to null');
      assert.strictEqual(
        ast2[0].filtered,
        false,
        'filtered flag should be reset to false'
      );
      assert.strictEqual(
        ast2[0].find,
        false,
        'find flag should be reset to false'
      );
      assert.strictEqual(nodes2[0].length, 0, 'nodes array should be cleared');
    });

    it('should set invalidate flag to true for state-dependent pseudo-classes like :has()', () => {
      const mapper = new Mapper(mockContext);
      const selector = 'div:has(p)';

      mapper.correspond(selector, dummyProcessBranches);

      // Verify that the context's invalidate state becomes true
      assert.strictEqual(
        mockContext.invalidate,
        true,
        'invalidate should be true for :has() pseudo-class'
      );
    });

    it('should maintain invalidate flag as false for simple selectors', () => {
      const mapper = new Mapper(mockContext);
      const selector = '#test';

      mapper.correspond(selector, dummyProcessBranches);

      assert.strictEqual(
        mockContext.invalidate,
        false,
        'invalidate should remain false for simple ID selectors'
      );
    });

    it('should create a new Map for documentCache if the document is not already present', () => {
      const mapper = new Mapper(mockContext);
      const selector = '.new-selector';

      // Ensure documentCache is entirely empty initially
      mockContext.documentCache.clear();
      assert.strictEqual(mockContext.documentCache.has(document), false);

      mapper.correspond(selector, dummyProcessBranches);

      // Verify that a new Map was created and stored for the document
      assert.strictEqual(
        mockContext.documentCache.has(document),
        true,
        'Should create a entry for the document'
      );
      const cachedItem = mockContext.documentCache.get(document);
      assert.strictEqual(
        cachedItem instanceof Map,
        true,
        'Cached item should be a Map instance'
      );
      assert.strictEqual(
        cachedItem.has(selector),
        true,
        'Should successfully store the selector in the new Map'
      );
    });

    it('should reuse the existing Map in documentCache if the document is already present', () => {
      const mapper = new Mapper(mockContext);
      const selector1 = '.first-selector';
      const selector2 = '.second-selector';

      // 1. First call to initialize the Map for the document
      mapper.correspond(selector1, dummyProcessBranches);
      const initialMap = mockContext.documentCache.get(document);

      // 2. Second call with a different selector for the same document
      mapper.correspond(selector2, dummyProcessBranches);
      const reusedMap = mockContext.documentCache.get(document);

      // Verify it is the exact same Map instance object reference
      assert.strictEqual(
        initialMap,
        reusedMap,
        'Should reuse the exact same Map reference'
      );

      // Verify both selectors now coexist in the same Map
      assert.strictEqual(
        reusedMap.has(selector1),
        true,
        'First selector should still exist'
      );
      assert.strictEqual(
        reusedMap.has(selector2),
        true,
        'Second selector should be appended to the same Map'
      );
    });

    it('should set invalidate to true when both hasLogicalPseudoFunc and hasNthChildOfSelector are true', () => {
      const mapper = new Mapper(mockContext);
      // e.g., :is(p):nth-child(2 of .foo)
      // This triggers both hasLogicalPseudoFunc (:is) and
      // hasNthChildOfSelector (:nth-child with 'of' syntax)
      const selector = ':is(p):nth-child(2 of .foo)';

      mapper.correspond(selector, dummyProcessBranches);

      assert.strictEqual(
        mockContext.invalidate,
        true,
        'invalidate should be true when both conditions are met'
      );
    });

    it('should set invalidate to false when hasLogicalPseudoFunc is true but hasNthChildOfSelector is false', () => {
      const mapper = new Mapper(mockContext);
      // e.g., :is(p)
      // This triggers hasLogicalPseudoFunc but NOT hasNthChildOfSelector
      const selector = ':is(p)';

      mapper.correspond(selector, dummyProcessBranches);

      assert.strictEqual(
        mockContext.invalidate,
        false,
        'invalidate should be false if only logical pseudo exists'
      );
    });

    it('should set invalidate to false when hasLogicalPseudoFunc is false but hasNthChildOfSelector is true', () => {
      const mapper = new Mapper(mockContext);
      // e.g., :nth-child(2 of .foo)
      // This triggers hasNthChildOfSelector but NOT hasLogicalPseudoFunc
      // Note: We avoid using selectors that trigger hasStatePseudoClass etc.
      // to isolate the test.
      const selector = ':nth-child(2 of .foo)';

      mapper.correspond(selector, dummyProcessBranches);

      assert.strictEqual(
        mockContext.invalidate,
        false,
        'invalidate should be false if only nth-child of selector exists'
      );
    });

    it('should set invalidate to false when both hasLogicalPseudoFunc and hasNthChildOfSelector are false', () => {
      const mapper = new Mapper(mockContext);
      // A simple class selector that triggers neither flag
      const selector = '.simple-class';

      mapper.correspond(selector, dummyProcessBranches);

      assert.strictEqual(
        mockContext.invalidate,
        false,
        'invalidate should be false when neither condition is met'
      );
    });
  });
});
