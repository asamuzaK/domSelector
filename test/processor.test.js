/**
 * processor.test.js
 */

/* api */
import { strict as assert } from 'node:assert';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';

/* test */
import { SelectorProcessor } from '../src/js/processor.js';

/* constants */
import { COMBINATOR } from '../src/js/constant.js';

describe('SelectorProcessor', () => {
  let window;
  let mockContext;
  let processor;

  beforeEach(() => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>');
    window = dom.window;
    // Mock Finder context
    mockContext = {
      window,
      onError: sinon.spy()
    };
    processor = new SelectorProcessor(mockContext);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('process', () => {
    it('should process simple non-combinator branches correctly', () => {
      const rawBranches = [[{ type: 'TypeSelector', name: 'div' }]];
      const { ast, descendant } = processor.process(rawBranches, 'div');
      assert.strictEqual(descendant, false, 'descendant flag is false');
      assert.deepEqual(
        ast,
        [
          {
            branch: [
              { combo: null, leaves: [{ type: 'TypeSelector', name: 'div' }] }
            ],
            dir: null,
            filtered: false,
            find: false
          }
        ],
        'matches internal AST representation'
      );
    });

    it('should toggle descendant flag to true when handling " " or ">"', () => {
      const rawBranches = [
        [
          { type: 'TypeSelector', name: 'div' },
          { type: COMBINATOR, name: '>' },
          { type: 'ClassSelector', name: 'active' }
        ]
      ];
      const { ast, descendant } = processor.process(
        rawBranches,
        'div > .active'
      );
      assert.strictEqual(
        descendant,
        true,
        'descendant flag turns true for child combinator'
      );
      assert.strictEqual(
        ast[0].branch.length,
        2,
        'contains exactly two branches separated by combinator'
      );
      assert.deepEqual(ast[0].branch[0].combo, { type: COMBINATOR, name: '>' });
      assert.strictEqual(ast[0].branch[1].combo, null);
    });

    it('should handle unescaping and namespace detection', () => {
      const rawBranches = [
        [{ type: 'TypeSelector', name: 'ns|div\\:escaped' }]
      ];
      const { ast } = processor.process(rawBranches, 'ns|div\\:escaped');
      const leaf = ast[0].branch[0].leaves[0];
      assert.strictEqual(
        leaf.name,
        'ns|div:escaped',
        'string name is unescaped properly'
      );
      assert.strictEqual(leaf.namespace, true, 'namespace flag set to true');
    });

    it('should trigger finder.onError hook', () => {
      const rawBranches = [[{ type: COMBINATOR, name: '+' }]];
      const result = processor.process(rawBranches, '+');
      assert.strictEqual(
        mockContext.onError.calledOnce,
        true,
        'finder.onError was fired'
      );
      assert.deepEqual(
        result,
        { ast: [], descendant: false, invalidate: false },
        'returns fallback values upon syntax exception'
      );
    });
  });
});
