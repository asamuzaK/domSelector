/**
 * traverser.test.js
 */

/* api */
import { strict as assert } from 'node:assert';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';

/* test */
import { DOMTraverser } from '../src/js/traverser.js';

/* constants */
import {
  ID_SELECTOR,
  CLASS_SELECTOR,
  TYPE_SELECTOR,
  PS_ELEMENT_SELECTOR,
  DIR_NEXT,
  DIR_PREV
} from '../src/js/constant.js';

describe('DOMTraverser', () => {
  let window, document, mockEvaluator, traverser;

  beforeEach(() => {
    const dom = new JSDOM(`
      <!doctype html>
      <html>
        <body>
          <div id="root">
            <span id="prev-sib" class="target-class"></span>
            <div id="target" class="target-class">
              <p id="child1"></p>
              <p id="child2" class="target-class"></p>
            </div>
            <span id="next-sib1" class="target-class"></span>
            <span id="next-sib2"></span>
          </div>
        </body>
      </html>
    `);
    window = dom.window;
    document = dom.window.document;
    mockEvaluator = {
      window,
      document,
      root: document,
      shadow: false,
      matchLeaves: sinon.stub().returns(true),
      getFilterLeaves: sinon.stub().returns([]) // デフォルトは isSimple = true
    };
    traverser = new DOMTraverser(mockEvaluator);
  });

  afterEach(() => {
    window.close();
    window = null;
    document = null;
  });

  describe('constructor & state management', () => {
    it('should initialize and reset walkers properly', () => {
      const walker1 = traverser.createTreeWalker(document.body);
      const walker2 = traverser.createTreeWalker(document.body);
      assert.strictEqual(walker1, walker2, 'returns cached TreeWalker');
      traverser.reset();
      const walker3 = traverser.createTreeWalker(document.body);
      assert.notStrictEqual(
        walker1,
        walker3,
        'returns new TreeWalker after reset'
      );
    });
  });

  describe('createTreeWalker', () => {
    it('should create a new TreeWalker when force option is true', () => {
      const walker1 = traverser.createTreeWalker(document.body);
      const walker2 = traverser.createTreeWalker(document.body, {
        force: true
      });
      assert.notStrictEqual(walker1, walker2, 'force creates a new instance');
    });

    it('should respect custom whatToShow option', () => {
      const customFilter = 0xffffffff;
      const walker = traverser.createTreeWalker(document.body, {
        whatToShow: customFilter
      });
      assert.strictEqual(
        walker.whatToShow,
        customFilter,
        'applied custom whatToShow'
      );
    });
  });

  describe('yieldCombinatorMatches', () => {
    let target;

    beforeEach(() => {
      target = document.getElementById('target');
    });

    it('should yield next sibling for "+" combinator (DIR_NEXT)', () => {
      const twig = { combo: { name: '+' }, leaves: [] };
      const result = [
        ...traverser.yieldCombinatorMatches(twig, target, { dir: DIR_NEXT })
      ];
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].id, 'next-sib1');
    });

    it('should yield previous sibling for "+" combinator (DIR_PREV)', () => {
      const twig = { combo: { name: '+' }, leaves: [] };
      const result = [
        ...traverser.yieldCombinatorMatches(twig, target, { dir: DIR_PREV })
      ];
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].id, 'prev-sib');
    });

    it('should yield all next siblings for "~" combinator (DIR_NEXT)', () => {
      const twig = { combo: { name: '~' }, leaves: [] };
      const result = [
        ...traverser.yieldCombinatorMatches(twig, target, { dir: DIR_NEXT })
      ];
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].id, 'next-sib1');
      assert.strictEqual(result[1].id, 'next-sib2');
    });

    it('should yield direct children for ">" combinator (DIR_NEXT)', () => {
      const twig = { combo: { name: '>' }, leaves: [] };
      const result = [
        ...traverser.yieldCombinatorMatches(twig, target, { dir: DIR_NEXT })
      ];
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].id, 'child1');
      assert.strictEqual(result[1].id, 'child2');
    });

    it('should yield parent node for ">" combinator (DIR_PREV)', () => {
      const twig = { combo: { name: '>' }, leaves: [] };
      const child = document.getElementById('child1');
      const result = [
        ...traverser.yieldCombinatorMatches(twig, child, { dir: DIR_PREV })
      ];
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].id, 'target');
    });

    it('should yield ancestors for " " combinator (DIR_PREV)', () => {
      const twig = { combo: { name: ' ' }, leaves: [] };
      const child = document.getElementById('child1');
      const result = [
        ...traverser.yieldCombinatorMatches(twig, child, { dir: DIR_PREV })
      ];
      // ancestors: pushed as (target -> root -> body -> html -> document)
      // yielded in reverse: (document -> html -> body -> root -> target)
      assert.strictEqual(result.length, 5, 'includes document node');
      assert.strictEqual(result[0].nodeType, 9, 'yields document first');
      assert.strictEqual(result[1].nodeName, 'HTML');
      assert.strictEqual(result[2].nodeName, 'BODY');
      assert.strictEqual(result[3].id, 'root');
      assert.strictEqual(result[4].id, 'target', 'yields direct parent last');
    });

    it('should yield descendants for " " combinator (DIR_NEXT)', () => {
      const twig = {
        combo: { name: ' ' },
        leaves: [{ name: 'p', type: TYPE_SELECTOR }]
      };
      const result = [
        ...traverser.yieldCombinatorMatches(twig, target, { dir: DIR_NEXT })
      ];
      assert.strictEqual(result.length, 2, 'yields all matching descendants');
      assert.strictEqual(result[0].id, 'child1');
      assert.strictEqual(result[1].id, 'child2');
    });

    it('should yield matching previous siblings for "~" combinator (DIR_PREV)', () => {
      const twig = { combo: { name: '~' }, leaves: [] };

      // DIR_PREV を指定して前の兄弟要素を探索
      const result = [
        ...traverser.yieldCombinatorMatches(twig, target, { dir: DIR_PREV })
      ];

      assert.strictEqual(
        result.length,
        1,
        'yields preceding matching siblings'
      );
      assert.strictEqual(result[0].id, 'prev-sib');
    });

    it('should skip non-matching next siblings for "~" combinator (DIR_NEXT)', () => {
      const twig = { combo: { name: '~' }, leaves: [] };
      mockEvaluator.matchLeaves.callsFake(
        (leaves, node) => node.id === 'next-sib2'
      );
      const result = [
        ...traverser.yieldCombinatorMatches(twig, target, { dir: DIR_NEXT })
      ];
      assert.strictEqual(
        result.length,
        1,
        'skips next-sib1 and yields only next-sib2'
      );
      assert.strictEqual(result[0].id, 'next-sib2');
    });

    it('should skip non-matching previous siblings for "~" combinator (DIR_PREV)', () => {
      const twig = { combo: { name: '~' }, leaves: [] };
      mockEvaluator.matchLeaves.returns(false);
      const result = [
        ...traverser.yieldCombinatorMatches(twig, target, { dir: DIR_PREV })
      ];
      assert.strictEqual(
        result.length,
        0,
        'yields empty if no previous sibling matches'
      );
    });
  });

  describe('yieldFindDescendantNodes', () => {
    let root;

    beforeEach(() => {
      root = document.getElementById('root');
    });

    it('should find descendant by ID_SELECTOR via fast path', () => {
      const leaves = [{ name: 'child2', type: ID_SELECTOR }];
      const result = [...traverser.yieldFindDescendantNodes(leaves, root, {})];
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].id, 'child2');
    });

    it('should not yield if ID is not a descendant of baseNode', () => {
      const leaves = [{ name: 'root', type: ID_SELECTOR }];
      const child = document.getElementById('target');
      mockEvaluator.matchLeaves.callsFake((leaves, node) => node.id === 'root');
      const result = [...traverser.yieldFindDescendantNodes(leaves, child, {})];
      assert.strictEqual(
        result.length,
        0,
        'Should not yield ancestors/outside nodes'
      );
    });

    it('should evaluate filter leaves for ID_SELECTOR if not simple', () => {
      const leaves = [{ name: 'child2', type: ID_SELECTOR }];
      mockEvaluator.getFilterLeaves.returns([{}]);
      mockEvaluator.matchLeaves.returns(false);
      const result = [...traverser.yieldFindDescendantNodes(leaves, root, {})];
      assert.strictEqual(result.length, 0);
      assert.strictEqual(mockEvaluator.matchLeaves.called, true);
    });

    it('should find descendants by CLASS_SELECTOR via fast path', () => {
      const leaves = [{ name: 'target-class', type: CLASS_SELECTOR }];
      const result = [...traverser.yieldFindDescendantNodes(leaves, root, {})];
      assert.strictEqual(result.length, 4);
      assert.strictEqual(result[0].id, 'prev-sib');
      assert.strictEqual(result[1].id, 'target');
    });

    it('should find descendants by TYPE_SELECTOR via fast path', () => {
      const leaves = [{ name: 'p', type: TYPE_SELECTOR }];
      const result = [...traverser.yieldFindDescendantNodes(leaves, root, {})];
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].id, 'child1');
      assert.strictEqual(result[1].id, 'child2');
    });

    it('should fallback to TreeWalker for unsupported fast path selectors', () => {
      const leaves = [{ name: 'disabled', type: 'SOME_OTHER_SELECTOR' }];
      mockEvaluator.matchLeaves.returns(true);
      const result = [...traverser.yieldFindDescendantNodes(leaves, root, {})];
      assert.ok(
        result.length > 0,
        'Yields nodes using fallback traverseAllDescendants'
      );
      assert.strictEqual(
        result[0].id,
        'prev-sib',
        'Starts yielding correctly from TreeWalker'
      );
    });

    it('should fallback to TreeWalker for ID_SELECTOR when baseNode is not an ELEMENT_NODE', () => {
      const leaves = [{ name: 'target', type: ID_SELECTOR }];
      mockEvaluator.matchLeaves.returns(true);
      const result = [
        ...traverser.yieldFindDescendantNodes(leaves, document, {})
      ];
      assert.ok(result.length > 1, 'Falls back to TreeWalker');
      assert.strictEqual(
        result[0].nodeName,
        'HTML',
        'Yields from document root'
      );
    });

    it('should evaluate filter leaves for CLASS_SELECTOR and yield if matched', () => {
      const leaves = [{ name: 'target-class', type: CLASS_SELECTOR }];
      mockEvaluator.getFilterLeaves.returns([{}]);
      mockEvaluator.matchLeaves.returns(true);
      const result = [...traverser.yieldFindDescendantNodes(leaves, root, {})];
      assert.strictEqual(result.length, 4, 'yields filtered matched nodes');
      assert.strictEqual(result[0].id, 'prev-sib');
    });

    it('should evaluate filter leaves for CLASS_SELECTOR and skip if not matched', () => {
      const leaves = [{ name: 'target-class', type: CLASS_SELECTOR }];
      mockEvaluator.getFilterLeaves.returns([{}]);
      mockEvaluator.matchLeaves.returns(false);
      const result = [...traverser.yieldFindDescendantNodes(leaves, root, {})];
      assert.strictEqual(result.length, 0, 'skips unmatched nodes');
    });

    it('should fallback to TreeWalker for CLASS_SELECTOR when getElementsByClassName is not available', () => {
      const leaves = [{ name: 'target-class', type: CLASS_SELECTOR }];
      const baseNode = document.createElement('div');
      const child = document.createElement('span');
      baseNode.appendChild(child);
      Object.defineProperty(baseNode, 'getElementsByClassName', {
        value: undefined
      });
      mockEvaluator.matchLeaves.returns(true);
      const result = [
        ...traverser.yieldFindDescendantNodes(leaves, baseNode, {})
      ];
      assert.strictEqual(result.length, 1, 'Falls back to TreeWalker');
      assert.strictEqual(
        result[0],
        child,
        'Yields child from fallback traversal'
      );
    });

    it('should evaluate filter leaves for TYPE_SELECTOR and yield if matched', () => {
      const leaves = [{ name: 'p', type: TYPE_SELECTOR }];
      mockEvaluator.getFilterLeaves.returns([{}]);
      mockEvaluator.matchLeaves.returns(true);
      const result = [...traverser.yieldFindDescendantNodes(leaves, root, {})];
      assert.strictEqual(result.length, 2, 'yields filtered matched nodes');
      assert.strictEqual(result[0].id, 'child1');
    });

    it('should evaluate filter leaves for CLASS_SELECTOR and skip if not matched', () => {
      const leaves = [{ name: 'p', type: TYPE_SELECTOR }];
      mockEvaluator.getFilterLeaves.returns([{}]);
      mockEvaluator.matchLeaves.returns(false);
      const result = [...traverser.yieldFindDescendantNodes(leaves, root, {})];
      assert.strictEqual(result.length, 0, 'skips unmatched nodes');
    });

    it('should fallback to TreeWalker for TYPE_SELECTOR when getElementsByTagName is not available', () => {
      const leaves = [{ name: 'p', type: TYPE_SELECTOR }];
      const baseNode = document.createElement('div');
      const child = document.createElement('span');
      baseNode.appendChild(child);
      Object.defineProperty(baseNode, 'getElementsByTagName', {
        value: undefined
      });
      mockEvaluator.matchLeaves.returns(true);
      const result = [
        ...traverser.yieldFindDescendantNodes(leaves, baseNode, {})
      ];
      assert.strictEqual(result.length, 1, 'Falls back to TreeWalker');
      assert.strictEqual(
        result[0],
        child,
        'Yields child from fallback traversal'
      );
    });

    it('should return without yielding any nodes for PS_ELEMENT_SELECTOR', () => {
      const leaves = [{ name: 'before', type: PS_ELEMENT_SELECTOR }];
      const result = [...traverser.yieldFindDescendantNodes(leaves, root, {})];
      assert.strictEqual(
        result.length,
        0,
        'Yields no nodes for pseudo-elements'
      );
      assert.strictEqual(
        mockEvaluator.matchLeaves.called,
        false,
        'Does not fallback to TreeWalker'
      );
    });

    it('should fallback to TreeWalker if the element found by ID is outside the baseNode (duplicate ID issue)', () => {
      const outerDup = document.createElement('div');
      outerDup.id = 'duplicate-id';
      document.body.insertBefore(outerDup, root);
      const innerDup = document.createElement('div');
      innerDup.id = 'duplicate-id';
      root.appendChild(innerDup);
      const leaves = [{ name: 'duplicate-id', type: ID_SELECTOR }];
      mockEvaluator.matchLeaves.callsFake(
        (leaves, node) => node.id === 'duplicate-id'
      );
      const result = [...traverser.yieldFindDescendantNodes(leaves, root, {})];
      assert.strictEqual(
        result.length,
        1,
        'Should not stop searching if the first found ID is outside the baseNode'
      );
      assert.strictEqual(
        result[0],
        innerDup,
        'Should yield the inner duplicate ID by falling back to TreeWalker'
      );
    });

    it('should fallback to TreeWalker if the first found ID element fails filter conditions', () => {
      const innerDup1 = document.createElement('div');
      innerDup1.id = 'duplicate-id-filter';
      root.appendChild(innerDup1);
      const innerDup2 = document.createElement('div');
      innerDup2.id = 'duplicate-id-filter';
      root.appendChild(innerDup2);
      const leaves = [{ name: 'duplicate-id-filter', type: ID_SELECTOR }];
      mockEvaluator.getFilterLeaves.returns([{}]);
      mockEvaluator.matchLeaves.callsFake((filterLeaves, node) => {
        return node === innerDup2;
      });
      const result = [...traverser.yieldFindDescendantNodes(leaves, root, {})];
      assert.strictEqual(
        result.length,
        1,
        'Should not stop searching if the first found ID fails the filter'
      );
      assert.strictEqual(
        result[0],
        innerDup2,
        'Should yield the second element that passed the filter by falling back to TreeWalker'
      );
    });

    it('should find descendant by ID_SELECTOR via fast path', () => {
      const host = document.createElement('div');
      document.body.appendChild(host);
      const shadowRoot = host.attachShadow({ mode: 'open' });
      const baseNode = document.createElement('div');
      const targetNode = document.createElement('span');
      targetNode.id = 'shadow-child';
      baseNode.appendChild(targetNode);
      shadowRoot.appendChild(baseNode);
      mockEvaluator.root = shadowRoot;
      mockEvaluator.shadow = true;
      mockEvaluator.getFilterLeaves.returns([]); // isSimple = true
      const leaves = [{ name: 'shadow-child', type: ID_SELECTOR }];
      const result = [...traverser.yieldFindDescendantNodes(leaves, baseNode, {})];
      assert.strictEqual(result.length, 1, 'Should find the node via fast path in Shadow DOM');
      assert.strictEqual(result[0].id, 'shadow-child');
      mockEvaluator.root = document;
      mockEvaluator.shadow = false;
      host.remove();
    });
  });
});
