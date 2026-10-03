/**
 * mapper.test.js
 */

/* api */
import { strict as assert } from 'node:assert';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';

/* test */
import { Mapper } from '../src/js/mapper.js';
import { SelectorProcessor } from '../src/js/processor.js';

describe('Mapper', () => {
  let window;
  let document;
  let mockContext;
  let processorStub;

  beforeEach(() => {
    const dom = new JSDOM(
      '<!doctype html><html><body><div id="test"></div></body></html>'
    );
    window = dom.window;
    document = window.document;
    // Mock Finder context
    mockContext = {
      window,
      document,
      documentCache: new Map()
    };
    // Stub processor
    processorStub = sinon
      .stub(SelectorProcessor.prototype, 'process')
      .callsFake((branches, selector) => {
        return {
          ast: [{ id: 1, dir: null, filtered: false, find: false }],
          descendant: false
        };
      });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('correspond()', () => {
    it('should process and cache selector data on cache miss', () => {
      const mapper = new Mapper(mockContext);
      const selector = 'div';
      const { ast, invalidate, nodes, selectorAST } =
        mapper.correspond(selector);
      assert.strictEqual(Array.isArray(ast), true, 'ast should be an array');
      assert.strictEqual(
        typeof invalidate,
        'boolean',
        'invalidate should be a boolean'
      );
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
        Object.isFrozen(selectorAST),
        true,
        'selectorAST should be frozen (Readonly)'
      );
      assert.strictEqual(
        nodes.length,
        ast.length,
        'nodes length should match ast length'
      );
      assert.strictEqual(
        processorStub.calledOnce,
        true,
        'SelectorProcessor.process should be called on cache miss'
      );
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

    it('should return cached AST and frozen selectorAST upon cache hit', () => {
      const mapper = new Mapper(mockContext);
      const selector = '.test-class';
      const { ast: ast1, nodes: nodes1, selectorAST: selAST1 } = mapper.correspond(selector);
      ast1[0].dir = 'next';
      ast1[0].filtered = true;
      ast1[0].find = true;
      nodes1[0].push(document.getElementById('test'));
      processorStub.resetHistory();
      const { ast: ast2, nodes: nodes2, selectorAST: selAST2 } = mapper.correspond(selector);
      assert.strictEqual(
        processorStub.notCalled,
        true,
        'SelectorProcessor.process should not be called on cache hit'
      );
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
      assert.strictEqual(
        Object.isFrozen(selAST2),
        true,
        'cached selectorAST should remain frozen'
      );
      assert.strictEqual(
        selAST1,
        selAST2,
        'should return the exact same frozen selectorAST reference'
      );
    });

    it('should set invalidate flag to true for :has() pseudo-class', () => {
      const mapper = new Mapper(mockContext);
      const selector = 'div:has(p)';
      const { invalidate } = mapper.correspond(selector);
      assert.strictEqual(
        invalidate,
        true,
        'invalidate should be true for :has() pseudo-class'
      );
    });

    it('should keep invalidate flag as false for simple ID selector', () => {
      const mapper = new Mapper(mockContext);
      const selector = '#test';
      const { invalidate } = mapper.correspond(selector);
      assert.strictEqual(
        invalidate,
        false,
        'invalidate should remain false for simple ID selectors'
      );
    });

    it('should initialize new Map entry in documentCache when missing', () => {
      const mapper = new Mapper(mockContext);
      const selector = '.new-selector';
      mockContext.documentCache.clear();
      assert.strictEqual(mockContext.documentCache.has(document), false);
      mapper.correspond(selector);
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

    it('should reuse documentCache Map instance for new selectors', () => {
      const mapper = new Mapper(mockContext);
      const selector1 = '.first-selector';
      const selector2 = '.second-selector';
      mapper.correspond(selector1);
      const initialMap = mockContext.documentCache.get(document);
      mapper.correspond(selector2);
      const reusedMap = mockContext.documentCache.get(document);
      assert.strictEqual(
        initialMap,
        reusedMap,
        'Should reuse the exact same Map reference'
      );
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

    it('should set invalidate to true for complex nth-child in :is()', () => {
      const mapper = new Mapper(mockContext);
      const selector = ':is(p):nth-child(2 of .foo)';
      const { invalidate } = mapper.correspond(selector);
      assert.strictEqual(
        invalidate,
        true,
        'invalidate should be true when both conditions are met'
      );
    });

    it('should set invalidate to false when selector only has :is()', () => {
      const mapper = new Mapper(mockContext);
      const selector = ':is(p)';
      const { invalidate } = mapper.correspond(selector);
      assert.strictEqual(
        invalidate,
        false,
        'invalidate should be false if only logical pseudo exists'
      );
    });

    it('should set invalidate to true for nth-child of selector', () => {
      const mapper = new Mapper(mockContext);
      const selector = ':nth-child(2 of .foo)';
      const { invalidate } = mapper.correspond(selector);
      assert.strictEqual(
        invalidate,
        true,
        'invalidate should be true if only nth-child of selector exists'
      );
    });

    it('should set invalidate to false for simple class selector', () => {
      const mapper = new Mapper(mockContext);
      const selector = '.simple-class';
      const { invalidate } = mapper.correspond(selector);
      assert.strictEqual(
        invalidate,
        false,
        'invalidate should be false when neither condition is met'
      );
    });

    it('should return fresh AST objects to prevent cache mutation', () => {
      const mapper = new Mapper(mockContext);
      const selector = '.pure-cache-test';
      const { ast: ast1 } = mapper.correspond(selector);
      // Simulate finder.js mutating the execution state wrapper
      ast1[0].find = true;
      ast1[0].dir = 'prev';
      // Fetch again to ensure cache hit
      processorStub.resetHistory();
      const { ast: ast2 } = mapper.correspond(selector);
      assert.strictEqual(processorStub.notCalled, true, 'Should hit the cache');
      assert.notStrictEqual(
        ast1[0],
        ast2[0],
        'Should return entirely different wrapper instances'
      );
      assert.strictEqual(
        ast2[0].find,
        false,
        'Fresh wrapper should not be affected by previous state mutations'
      );
    });
  });
});
