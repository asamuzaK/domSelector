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
  DIR_PREV,
  TARGET_ALL,
  TARGET_FIRST
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
      node: null,
      shadow: false,
      matchLeaves: sinon.stub().returns(true),
      getFilterLeaves: sinon.stub().returns([]),
      getUnescapedName: sinon.stub().callsFake(leaf => leaf.name)
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

  describe('findNodeWalker', () => {
    let leaves;

    beforeEach(() => {
      leaves = [{ name: 'span', type: TYPE_SELECTOR }];
    });

    it('should collect matching nodes using TreeWalker', () => {
      mockEvaluator.node = document.getElementById('root');
      mockEvaluator.matchLeaves.callsFake((_, node) => node.tagName === 'SPAN');
      const startNode = document.getElementById('root');
      const result = traverser.findNodeWalker(leaves, startNode);
      assert.ok(result.length > 0);
      assert.strictEqual(result[0].id, 'prev-sib');
    });

    it('should return preceding nodes when precede option is true', () => {
      const boundary = document.getElementById('next-sib1');
      mockEvaluator.node = boundary;
      mockEvaluator.matchLeaves.callsFake(
        (_, node) => node !== boundary && node.tagName === 'SPAN'
      );
      const startNode = document.getElementById('root');
      const precedeSpy = sinon.spy(traverser, 'findPrecede');
      const result = traverser.findNodeWalker(leaves, startNode, {
        precede: true
      });
      assert.strictEqual(precedeSpy.calledOnce, true);
      assert.strictEqual(precedeSpy.firstCall.args[0], leaves);
      assert.strictEqual(precedeSpy.firstCall.args[1], mockEvaluator.root);
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].id, 'prev-sib');
      precedeSpy.restore();
    });

    it('should fallback to forward traversal when no preceding nodes are found', () => {
      mockEvaluator.node = document.getElementById('root');
      mockEvaluator.matchLeaves.callsFake((_, node) => node.id === 'child1');
      const findPrecedeStub = sinon.stub(traverser, 'findPrecede').returns([]);
      const traverseSpy = sinon.spy(traverser, 'traverseAndCollectNodes');
      const startNode = document.getElementById('target');
      const result = traverser.findNodeWalker(leaves, startNode, {
        precede: true
      });
      assert.strictEqual(findPrecedeStub.calledOnce, true);
      assert.strictEqual(traverseSpy.calledOnce, true);
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].id, 'child1');
      findPrecedeStub.restore();
      traverseSpy.restore();
    });

    it('should pass options excluding precede', () => {
      mockEvaluator.node = document.getElementById('root');
      const traverseSpy = sinon.spy(traverser, 'traverseAndCollectNodes');
      const startNode = document.getElementById('root');
      traverser.findNodeWalker(leaves, startNode, {
        targetType: TARGET_ALL,
        force: true
      });
      assert.strictEqual(traverseSpy.calledOnce, true);
      const passedOpts = traverseSpy.firstCall.args[2];
      assert.strictEqual(passedOpts.startNode, startNode);
      assert.strictEqual(passedOpts.targetType, TARGET_ALL);
      assert.strictEqual(passedOpts.force, true);
      assert.strictEqual('precede' in passedOpts, false);
      traverseSpy.restore();
    });
  });

  describe('findPrecede', () => {
    let leaves;

    beforeEach(() => {
      leaves = [{ name: 'span', type: TYPE_SELECTOR }];
    });

    it('should find first matching preceding node and stop before evaluator.node', () => {
      const boundary = document.getElementById('next-sib1');
      mockEvaluator.node = boundary;
      mockEvaluator.matchLeaves.callsFake(
        (_, node) => node !== boundary && node.tagName === 'SPAN'
      );
      const startNode = document.getElementById('root');
      const result = traverser.findPrecede(leaves, startNode);
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].id, 'prev-sib');
    });

    it('should collect all matching preceding nodes when targetType is TARGET_ALL', () => {
      const boundary = document.getElementById('root');
      mockEvaluator.node = boundary;
      mockEvaluator.matchLeaves.callsFake(
        (_, node) =>
          node !== boundary &&
          node.parentElement === boundary &&
          node.classList.contains('target-class')
      );
      const startNode = document.getElementById('root');
      const result = traverser.findPrecede(leaves, startNode, {
        targetType: TARGET_ALL
      });
      assert.strictEqual(result.length, 3);
      assert.strictEqual(result[0].id, 'prev-sib');
      assert.strictEqual(result[1].id, 'target');
      assert.strictEqual(result[2].id, 'next-sib1');
    });

    it('should pass options correctly to traverseAndCollectNodes', () => {
      mockEvaluator.node = document.getElementById('root');
      mockEvaluator.matchLeaves.returns(true);
      const startNode = document.getElementById('root');
      const spy = sinon.spy(traverser, 'traverseAndCollectNodes');
      traverser.findPrecede(leaves, startNode, { force: true });
      assert.strictEqual(spy.calledOnce, true);
      assert.strictEqual(spy.firstCall.args[2].force, true);
      spy.restore();
    });

    it('should return empty array if no preceding node matches leaves', () => {
      mockEvaluator.node = document.getElementById('target');
      mockEvaluator.matchLeaves.returns(false);
      const startNode = document.getElementById('root');
      const result = traverser.findPrecede(leaves, startNode);
      assert.strictEqual(result.length, 0);
    });
  });

  describe('traverseAndCollectNodes', () => {
    let walker, leaves;

    beforeEach(() => {
      walker = traverser.createTreeWalker(document.body);
      leaves = [{ name: 'p', type: TYPE_SELECTOR }];
    });

    it('should return only the first matching node', () => {
      mockEvaluator.matchLeaves.returns(true);
      const result = traverser.traverseAndCollectNodes(walker, leaves, {
        startNode: document.getElementById('target')
      });
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].id, 'child1');
    });

    it('should collect all matching nodes', () => {
      mockEvaluator.matchLeaves.returns(true);
      const result = traverser.traverseAndCollectNodes(walker, leaves, {
        startNode: document.body,
        targetType: TARGET_ALL
      });
      assert.ok(result.length > 1);
      assert.strictEqual(result[0].id, 'root');
      assert.strictEqual(result[1].id, 'prev-sib');
    });

    it('should prepend boundaryNode', () => {
      const boundaryNode = document.getElementById('target');
      mockEvaluator.matchLeaves.callsFake(
        (_, node) => node === boundaryNode || node.id === 'child1'
      );
      const result = traverser.traverseAndCollectNodes(walker, leaves, {
        startNode: boundaryNode,
        boundaryNode,
        targetType: TARGET_ALL
      });
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0], boundaryNode);
      assert.strictEqual(result[1].id, 'child1');
    });

    it('should break traversal when reaching boundaryNode', () => {
      const boundaryNode = document.getElementById('next-sib1');
      mockEvaluator.matchLeaves.callsFake((_, node) => node !== boundaryNode);
      const result = traverser.traverseAndCollectNodes(walker, leaves, {
        startNode: document.getElementById('child2'),
        boundaryNode,
        targetType: TARGET_ALL
      });
      const hasBoundaryOrAfter = result.some(
        node => node.id === 'next-sib1' || node.id === 'next-sib2'
      );
      assert.strictEqual(hasBoundaryOrAfter, false);
    });

    it('should break traversal when currentNode is not contained', () => {
      const boundaryNode = document.getElementById('target');
      mockEvaluator.matchLeaves.returns(true);
      const result = traverser.traverseAndCollectNodes(walker, leaves, {
        startNode: document.getElementById('child1'),
        boundaryNode,
        targetType: TARGET_ALL
      });
      const containsOutsideNodes = result.some(
        node => node.id === 'next-sib1' || node.id === 'next-sib2'
      );
      assert.strictEqual(containsOutsideNodes, false);
    });

    it('should exclude evaluator.node from collected nodes', () => {
      const targetNode = document.getElementById('child1');
      mockEvaluator.node = targetNode;
      mockEvaluator.matchLeaves.returns(true);
      const result = traverser.traverseAndCollectNodes(walker, leaves, {
        startNode: document.getElementById('target'),
        targetType: TARGET_ALL
      });
      assert.strictEqual(result.includes(targetNode), false);
    });

    it('should advance to next node if initial currentNode is not an ELEMENT_NODE', () => {
      const textNode = document.createTextNode('sample text');
      document.getElementById('target').appendChild(textNode);
      const customWalker = traverser.createTreeWalker(document.body, {
        force: true,
        whatToShow: 0xffffffff // NodeFilter.SHOW_ALL
      });
      mockEvaluator.matchLeaves.callsFake((_, node) => node.nodeType === 1);
      const result = traverser.traverseAndCollectNodes(customWalker, leaves, {
        startNode: textNode,
        targetType: TARGET_ALL
      });
      assert.ok(result.length > 0);
      assert.strictEqual(result[0].nodeType, 1 /* ELEMENT_NODE */);
    });

    it('should skip startNode if currentNode equals startNode and is not root', () => {
      const startNode = document.getElementById('target');
      mockEvaluator.matchLeaves.returns(true);
      const result = traverser.traverseAndCollectNodes(walker, leaves, {
        startNode
      });
      assert.notStrictEqual(result[0], startNode);
      assert.strictEqual(result[0].id, 'child1');
    });
  });

  describe('processComplexBranchAll', () => {
    let node1, node2;

    beforeEach(() => {
      node1 = document.createElement('div');
      node2 = document.createElement('span');
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should call matchComplexBranchNext for each entry node when dir is DIR_NEXT', () => {
      const branch = [
        { combo: { name: ' ' }, leaves: [] },
        { combo: { name: '>' }, leaves: [] }
      ];
      const entryNodes = [node1, node2];
      const dir = DIR_NEXT;
      const expectedMatchedNode = document.createElement('p');
      const stubDfs = sinon
        .stub(traverser, 'matchComplexBranchNext')
        .callsFake(
          (
            node,
            index,
            currentCombo,
            branchArr,
            lastIndex,
            matchedNodes,
            direction
          ) => {
            matchedNodes.add(expectedMatchedNode);
          }
        );
      const result = traverser.processComplexBranchAll(branch, entryNodes, dir);
      assert.strictEqual(
        result instanceof Set,
        true,
        'should return a Set object'
      );
      assert.strictEqual(
        result.size,
        1,
        'should collect the simulated matched node'
      );
      assert.strictEqual(
        result.has(expectedMatchedNode),
        true,
        'should contain expectedMatchedNode'
      );
      assert.strictEqual(
        stubDfs.callCount,
        2,
        'should be called once for each entry node'
      );
      const firstCallArgs = stubDfs.getCall(0).args;
      assert.strictEqual(
        firstCallArgs[0],
        node1,
        'first argument is the entry node'
      );
      assert.strictEqual(firstCallArgs[1], 1, 'starts at index 1');
      assert.strictEqual(
        firstCallArgs[2],
        branch[0].combo,
        'passes the combo from the first branch item'
      );
      assert.strictEqual(
        firstCallArgs[6],
        dir,
        'passes the traversal direction'
      );
    });

    it('should use matchComplexBranchPrev to filter entry nodes when dir is not DIR_NEXT', () => {
      const branch = [
        { combo: { name: ' ' }, leaves: [] },
        { combo: { name: '>' }, leaves: [] }
      ];
      const entryNodes = [node1, node2];
      const dir = DIR_PREV;
      const stubMatchComplexBranchPrev = sinon.stub(
        traverser,
        'matchComplexBranchPrev'
      );
      stubMatchComplexBranchPrev.withArgs(node1, branch, 0).returns(true);
      stubMatchComplexBranchPrev.withArgs(node2, branch, 0).returns(false);
      const result = traverser.processComplexBranchAll(branch, entryNodes, dir);
      assert.strictEqual(
        result instanceof Set,
        true,
        'should return a Set object'
      );
      assert.strictEqual(
        result.size,
        1,
        'should contain only the node that passed matchComplexBranchPrev'
      );
      assert.strictEqual(result.has(node1), true, 'should contain node1');
      assert.strictEqual(result.has(node2), false, 'should not contain node2');
      assert.strictEqual(
        stubMatchComplexBranchPrev.callCount,
        2,
        'should test every entry node'
      );
    });
  });

  describe('matchComplexBranchNext', () => {
    let parent, child1, child2, grandChild1, grandChild2;

    beforeEach(() => {
      parent = document.createElement('div');
      parent.id = 'dfs-parent';
      child1 = document.createElement('div');
      child1.className = 'dfs-child';
      child2 = document.createElement('div');
      child2.className = 'dfs-child';
      grandChild1 = document.createElement('p');
      grandChild2 = document.createElement('span');
      child1.appendChild(grandChild1);
      child2.appendChild(grandChild2);
      parent.appendChild(child1);
      parent.appendChild(child2);
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should add matched node to the set when reaching the last index', () => {
      const branch = [
        { combo: { name: ' ' }, leaves: [] },
        { combo: { name: '>' }, leaves: [] }
      ];
      const matchedNodes = new Set();
      const currentCombo = branch[1].combo;
      const lastIndex = branch.length - 1;
      const dir = DIR_NEXT;
      sinon.stub(traverser, 'yieldCombinatorMatches').returns([grandChild1]);
      traverser.matchComplexBranchNext(
        child1,
        1,
        currentCombo,
        branch,
        lastIndex,
        matchedNodes,
        dir
      );
      assert.strictEqual(
        matchedNodes.size,
        1,
        'should add exactly 1 node to the set'
      );
      assert.strictEqual(
        matchedNodes.has(grandChild1),
        true,
        'the added node should be grandChild1'
      );
    });

    it('should recursively call matchComplexBranchNext for intermediate nodes', () => {
      const branch = [
        { combo: { name: ' ' }, leaves: [] },
        { combo: { name: '>' }, leaves: [] },
        { combo: { name: '>' }, leaves: [] }
      ];
      const matchedNodes = new Set();
      const currentCombo = branch[1].combo;
      const lastIndex = branch.length - 1;
      const dir = DIR_NEXT;
      const stubYield = sinon.stub(traverser, 'yieldCombinatorMatches');
      stubYield.onCall(0).returns([child1, child2]);
      stubYield.onCall(1).returns([grandChild1]);
      stubYield.onCall(2).returns([]);
      const spyDfs = sinon.spy(traverser, 'matchComplexBranchNext');
      traverser.matchComplexBranchNext(
        parent,
        1,
        currentCombo,
        branch,
        lastIndex,
        matchedNodes,
        dir
      );
      assert.strictEqual(
        matchedNodes.size,
        1,
        'should ultimately add 1 node to the set'
      );
      assert.strictEqual(
        matchedNodes.has(grandChild1),
        true,
        'the added node should be grandChild1'
      );
      assert.strictEqual(
        spyDfs.callCount,
        3,
        'should make recursive calls for intermediate nodes'
      );
    });
  });

  describe('processComplexBranchFirst', () => {
    let parent, child;

    beforeEach(() => {
      parent = document.createElement('div');
      parent.id = 'test-process-parent';
      child = document.createElement('p');
      child.id = 'test-process-child';
      parent.appendChild(child);
      document.body.appendChild(parent);
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should delegate to processComplexBranchFirstNext when dir is DIR_NEXT', () => {
      const branch = [
        { combo: { name: ' ' }, leaves: [] },
        { combo: { name: '>' }, leaves: [] }
      ];
      const entryNodes = [parent];
      const targetType = TARGET_FIRST;
      const expectedNode = document.createElement('span');
      const stubNext = sinon
        .stub(traverser, 'processComplexBranchFirstNext')
        .returns(expectedNode);
      const spyPrev = sinon.spy(traverser, 'processComplexBranchFirstPrev');
      const result = traverser.processComplexBranchFirst(
        branch,
        entryNodes,
        DIR_NEXT,
        targetType
      );
      assert.strictEqual(
        result,
        expectedNode,
        'should return the result from processComplexBranchFirstNext'
      );
      assert.strictEqual(
        stubNext.calledOnce,
        true,
        'processComplexBranchFirstNext should be called once'
      );
      assert.strictEqual(
        spyPrev.called,
        false,
        'processComplexBranchFirstPrev should not be called'
      );
      const callArgs = stubNext.getCall(0).args;
      assert.strictEqual(callArgs[0], branch, 'should pass the branch');
      assert.strictEqual(callArgs[1], entryNodes, 'should pass the entryNodes');
      assert.strictEqual(callArgs[2], targetType, 'should pass the targetType');
    });

    it('should delegate to processComplexBranchFirstPrev when dir is not DIR_NEXT', () => {
      const branch = [
        { combo: { name: ' ' }, leaves: [] },
        { combo: { name: '>' }, leaves: [] }
      ];
      const entryNodes = [child];
      const targetType = TARGET_FIRST;
      const lastIndex = branch.length - 1;
      const expectedNode = document.createElement('span');
      const stubPrev = sinon
        .stub(traverser, 'processComplexBranchFirstPrev')
        .returns(expectedNode);
      const spyNext = sinon.spy(traverser, 'processComplexBranchFirstNext');
      const result = traverser.processComplexBranchFirst(
        branch,
        entryNodes,
        DIR_PREV,
        targetType
      );
      assert.strictEqual(
        result,
        expectedNode,
        'should return the result from processComplexBranchFirstPrev'
      );
      assert.strictEqual(
        stubPrev.calledOnce,
        true,
        'processComplexBranchFirstPrev should be called once'
      );
      assert.strictEqual(
        spyNext.called,
        false,
        'processComplexBranchFirstNext should not be called'
      );
      const callArgs = stubPrev.getCall(0).args;
      assert.strictEqual(callArgs[0], branch, 'should pass the branch');
      assert.strictEqual(callArgs[1], entryNodes, 'should pass the entryNodes');
      assert.strictEqual(callArgs[2], targetType, 'should pass the targetType');
      assert.strictEqual(
        callArgs[3],
        lastIndex,
        'should pass the correct lastIndex[cite: 19]'
      );
    });
  });

  describe('processComplexBranchFirstPrev', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return node directly', () => {
      const parent = document.createElement('div');
      const child = document.createElement('p');
      parent.appendChild(child);
      const branch = [
        { combo: { name: ' ' }, leaves: [] },
        { combo: { name: '>' }, leaves: [] }
      ];
      const stubMatchComplexBranchPrev = sinon
        .stub(traverser, 'matchComplexBranchPrev')
        .returns(true);
      const result = traverser.processComplexBranchFirstPrev(
        branch,
        [child],
        TARGET_ALL,
        1
      );
      assert.strictEqual(result, child, 'returns matching entry node directly');
      assert.strictEqual(
        stubMatchComplexBranchPrev.calledOnceWith(child, branch, 0),
        true,
        'matchComplexBranchPrev should be called with correct arguments'
      );
    });

    it('should traverse descendants via findNodeWalker', () => {
      const parent = document.createElement('div');
      const child1 = document.createElement('p');
      const child2 = document.createElement('p');
      parent.appendChild(child1);
      parent.appendChild(child2);
      const branch = [
        { combo: { name: ' ' }, leaves: [] },
        { combo: { name: '>' }, leaves: [] }
      ];
      const stubMatchComplexBranchPrev = sinon.stub(
        traverser,
        'matchComplexBranchPrev'
      );
      stubMatchComplexBranchPrev.withArgs(parent).returns(false);
      stubMatchComplexBranchPrev.withArgs(child1).returns(true);
      const stubFindNodeWalker = sinon.stub(traverser, 'findNodeWalker');
      stubFindNodeWalker.onCall(0).returns([child1, child2]);
      const result = traverser.processComplexBranchFirstPrev(
        branch,
        [parent],
        TARGET_FIRST,
        1
      );
      assert.strictEqual(
        result,
        child1,
        'finds and returns first matching descendant node'
      );
    });

    it('should return null when targetType is not TARGET_FIRST and entryNode fails directly', () => {
      const parent = document.createElement('div');
      const child = document.createElement('p');
      parent.appendChild(child);
      const branch = [
        { combo: { name: ' ' }, leaves: [] },
        { combo: { name: '>' }, leaves: [] }
      ];
      sinon.stub(traverser, 'matchComplexBranchPrev').returns(false);
      const result = traverser.processComplexBranchFirstPrev(
        branch,
        [parent],
        TARGET_ALL,
        1
      );
      assert.strictEqual(
        result,
        null,
        'returns null when targetType is not TARGET_FIRST'
      );
    });

    it('should return null when no matching node is found', () => {
      const parent = document.createElement('span');
      const child = document.createElement('a');
      parent.appendChild(child);
      const branch = [
        { combo: { name: ' ' }, leaves: [] },
        { combo: { name: '>' }, leaves: [] }
      ];
      sinon.stub(traverser, 'matchComplexBranchPrev').returns(false);
      sinon.stub(traverser, 'findNodeWalker').returns([]);
      const result = traverser.processComplexBranchFirstPrev(
        branch,
        [parent],
        TARGET_FIRST,
        1
      );
      assert.strictEqual(
        result,
        null,
        'returns null when no matching node exists'
      );
    });

    it('should call findNodeWalker with force: true in the while loop', () => {
      const entryNode = document.createElement('div');
      const refNode1 = document.createElement('span');
      const refNode2 = document.createElement('p');
      const entryNodes = [entryNode];
      const targetType = TARGET_FIRST;
      const lastIndex = 1;
      const branch = [
        { combo: { name: ' ' }, leaves: [] },
        { combo: { name: '>' }, leaves: [] }
      ];
      const stubMatchComplexBranchPrev = sinon.stub(
        traverser,
        'matchComplexBranchPrev'
      );
      stubMatchComplexBranchPrev.onCall(0).returns(false);
      stubMatchComplexBranchPrev.onCall(1).returns(false);
      stubMatchComplexBranchPrev.onCall(2).returns(true);
      const stubFindNodeWalker = sinon.stub(traverser, 'findNodeWalker');
      stubFindNodeWalker.onCall(0).returns([refNode1]);
      stubFindNodeWalker.onCall(1).returns([refNode2]);
      const result = traverser.processComplexBranchFirstPrev(
        branch,
        entryNodes,
        targetType,
        lastIndex
      );
      assert.strictEqual(
        result,
        refNode2,
        'should return refNode2 which passed matchComplexBranchPrev'
      );
      assert.strictEqual(
        stubFindNodeWalker.callCount,
        2,
        'findNodeWalker should be called twice'
      );
      const secondCallArgs = stubFindNodeWalker.getCall(1).args;
      assert.strictEqual(
        secondCallArgs[0],
        branch[lastIndex].leaves,
        'first argument should be entryLeaves'
      );
      assert.strictEqual(
        secondCallArgs[1],
        refNode1,
        'second argument should be the previous refNode'
      );
      assert.deepEqual(
        secondCallArgs[2],
        { targetType, force: true },
        'third argument should include force: true[cite: 19]'
      );
    });
  });

  describe('matchComplexBranchPrev', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return true when index < 0 (base case)', () => {
      const node = document.createElement('div');
      const branch = [];
      assert.strictEqual(
        traverser.matchComplexBranchPrev(node, branch, -1),
        true,
        'base case index < 0 should return true'
      );
    });

    describe('combinator "+"', () => {
      it('should return true if previous sibling matches leaves and path is valid', () => {
        const parent = document.createElement('div');
        const prevSib = document.createElement('span');
        const node = document.createElement('p');
        parent.appendChild(prevSib);
        parent.appendChild(node);
        const branch = [{ combo: { name: '+' }, leaves: [] }];
        mockEvaluator.matchLeaves.returns(true);
        assert.strictEqual(
          traverser.matchComplexBranchPrev(node, branch, 0),
          true
        );
        assert.strictEqual(
          mockEvaluator.matchLeaves.calledWith(branch[0].leaves, prevSib),
          true
        );
      });

      it('should return false if there is no previous sibling', () => {
        const parent = document.createElement('div');
        const node = document.createElement('p');
        parent.appendChild(node);
        const branch = [{ combo: { name: '+' }, leaves: [] }];
        assert.strictEqual(
          traverser.matchComplexBranchPrev(node, branch, 0),
          false
        );
      });

      it('should return false if previous sibling does not match leaves', () => {
        const parent = document.createElement('div');
        const prevSib = document.createElement('span');
        const node = document.createElement('p');
        parent.appendChild(prevSib);
        parent.appendChild(node);
        const branch = [{ combo: { name: '+' }, leaves: [] }];
        mockEvaluator.matchLeaves.returns(false);
        assert.strictEqual(
          traverser.matchComplexBranchPrev(node, branch, 0),
          false
        );
      });
    });

    describe('combinator "~"', () => {
      it('should return true if any previous sibling matches leaves', () => {
        const parent = document.createElement('div');
        const prevSib1 = document.createElement('span');
        const prevSib2 = document.createElement('div');
        const node = document.createElement('p');
        parent.appendChild(prevSib1);
        parent.appendChild(prevSib2);
        parent.appendChild(node);
        const branch = [{ combo: { name: '~' }, leaves: [] }];
        mockEvaluator.matchLeaves.callsFake((leaves, n) => n === prevSib1);
        assert.strictEqual(
          traverser.matchComplexBranchPrev(node, branch, 0),
          true
        );
      });

      it('should return false if no previous sibling matches leaves', () => {
        const parent = document.createElement('div');
        const prevSib = document.createElement('span');
        const node = document.createElement('p');
        parent.appendChild(prevSib);
        parent.appendChild(node);
        const branch = [{ combo: { name: '~' }, leaves: [] }];
        mockEvaluator.matchLeaves.returns(false);
        assert.strictEqual(
          traverser.matchComplexBranchPrev(node, branch, 0),
          false
        );
      });

      it('should backtrack through siblings to find a valid full path', () => {
        const parent = document.createElement('div');
        const sib1 = document.createElement('div');
        sib1.className = 'step2 step1';
        const sib2 = document.createElement('div');
        sib2.className = 'step1';
        const target = document.createElement('span');
        parent.appendChild(sib1);
        parent.appendChild(sib2);
        parent.appendChild(target);
        const branch = [
          { combo: { name: '~' }, leaves: [{ name: 'step2' }] },
          { combo: { name: '~' }, leaves: [{ name: 'step1' }] }
        ];
        mockEvaluator.matchLeaves.callsFake((leaves, n) => {
          return n.classList.contains(leaves[0].name);
        });
        assert.strictEqual(
          traverser.matchComplexBranchPrev(target, branch, 1),
          true
        );
      });
    });

    describe('combinator ">"', () => {
      it('should return true if parent node matches leaves', () => {
        const parent = document.createElement('div');
        const node = document.createElement('p');
        parent.appendChild(node);
        const branch = [{ combo: { name: '>' }, leaves: [] }];
        mockEvaluator.matchLeaves.returns(true);
        assert.strictEqual(
          traverser.matchComplexBranchPrev(node, branch, 0),
          true
        );
      });

      it('should return false if parent node does not match leaves', () => {
        const parent = document.createElement('div');
        const node = document.createElement('p');
        parent.appendChild(node);
        const branch = [{ combo: { name: '>' }, leaves: [] }];
        mockEvaluator.matchLeaves.returns(false);
        assert.strictEqual(
          traverser.matchComplexBranchPrev(node, branch, 0),
          false
        );
      });

      it('should return false if parent node does not exist', () => {
        const node = document.createElement('div');
        const branch = [{ combo: { name: '>' }, leaves: [] }];
        assert.strictEqual(
          traverser.matchComplexBranchPrev(node, branch, 0),
          false
        );
      });
    });

    describe('combinator " " (descendant / ancestor search)', () => {
      it('should return true if any ancestor matches leaves', () => {
        const grandParent = document.createElement('div');
        const parent = document.createElement('div');
        const node = document.createElement('p');
        grandParent.appendChild(parent);
        parent.appendChild(node);
        const branch = [{ combo: { name: ' ' }, leaves: [] }];
        mockEvaluator.matchLeaves.callsFake((leaves, n) => n === grandParent);
        assert.strictEqual(
          traverser.matchComplexBranchPrev(node, branch, 0),
          true
        );
      });

      it('should return false if no ancestor matches leaves', () => {
        const parent = document.createElement('div');
        const node = document.createElement('p');
        parent.appendChild(node);
        const branch = [{ combo: { name: ' ' }, leaves: [] }];
        mockEvaluator.matchLeaves.returns(false);
        assert.strictEqual(
          traverser.matchComplexBranchPrev(node, branch, 0),
          false
        );
      });

      it('should handle multi-step combined paths correctly', () => {
        const grandParent = document.createElement('body');
        const parent = document.createElement('ul');
        const node = document.createElement('li');
        grandParent.appendChild(parent);
        parent.appendChild(node);
        const branch = [
          { combo: { name: ' ' }, leaves: [{ name: 'body' }] },
          { combo: { name: '>' }, leaves: [{ name: 'ul' }] }
        ];
        mockEvaluator.matchLeaves.callsFake((leaves, n) => {
          return n.tagName.toLowerCase() === leaves[0].name;
        });
        assert.strictEqual(
          traverser.matchComplexBranchPrev(node, branch, 1),
          true
        );
      });
    });
  });

  describe('processComplexBranchFirstNext', () => {
    let parent, child1, child2;

    beforeEach(() => {
      parent = document.createElement('div');
      parent.id = 'test-process-parent';
      child1 = document.createElement('div');
      child1.className = 'match-a';
      child2 = document.createElement('div');
      child2.className = 'match-b';
      parent.appendChild(child1);
      parent.appendChild(child2);
      document.body.appendChild(parent);
    });

    afterEach(() => {
      sinon.restore();
    });

    it('should return matched node directly from entryNodes when this.node is an Element', () => {
      mockEvaluator.node = parent;
      const branch = [
        { combo: { name: '>' }, leaves: [] },
        { combo: { name: '+' }, leaves: [] }
      ];
      const entryNodes = [parent];
      const targetType = TARGET_FIRST;
      const stubMatchNodeNext = sinon
        .stub(traverser, 'matchNodeNext')
        .returns(child2);
      const result = traverser.processComplexBranchFirstNext(
        branch,
        entryNodes,
        targetType
      );
      assert.strictEqual(result, child2, 'should match child2 directly');
      assert.strictEqual(
        stubMatchNodeNext.calledOnce,
        true,
        'matchNodeNext should be called once'
      );
    });

    it('should return matched node directly from entryNodes when this.node is a Document', () => {
      mockEvaluator.node = document;
      const branch = [
        { combo: { name: '>' }, leaves: [] },
        { combo: { name: '+' }, leaves: [] }
      ];
      const entryNodes = [parent];
      const targetType = TARGET_FIRST;
      const stubMatchNodeNext = sinon
        .stub(traverser, 'matchNodeNext')
        .returns(child2);
      const result = traverser.processComplexBranchFirstNext(
        branch,
        entryNodes,
        targetType
      );
      assert.strictEqual(
        result,
        child2,
        'should match child2 when context is document'
      );
      assert.strictEqual(
        stubMatchNodeNext.calledOnce,
        true,
        'matchNodeNext should be called once'
      );
    });

    it('should return matched node using findNodeWalker when entryNode does not match directly', () => {
      mockEvaluator.node = parent;
      const branch = [
        { combo: { name: ' ' }, leaves: [] },
        { combo: { name: '+' }, leaves: [] }
      ];
      const entryNodes = [parent];
      const targetType = TARGET_FIRST;
      const stubMatchNodeNext = sinon.stub(traverser, 'matchNodeNext');
      stubMatchNodeNext.onCall(0).returns(null);
      stubMatchNodeNext.onCall(1).returns(child2);
      const stubFindNodeWalker = sinon
        .stub(traverser, 'findNodeWalker')
        .returns([child1]);
      const result = traverser.processComplexBranchFirstNext(
        branch,
        entryNodes,
        targetType
      );
      assert.strictEqual(
        result,
        child2,
        'should match child2 via findNodeWalker fallback'
      );
      assert.strictEqual(
        stubMatchNodeNext.callCount,
        2,
        'matchNodeNext should be called twice'
      );
      assert.strictEqual(
        stubFindNodeWalker.calledOnce,
        true,
        'findNodeWalker should be called once'
      );
    });

    it('should return null when no match is found', () => {
      mockEvaluator.node = parent;
      const branch = [
        { combo: { name: ' ' }, leaves: [] },
        { combo: { name: '+' }, leaves: [] }
      ];
      const entryNodes = [parent];
      const targetType = TARGET_FIRST;
      const stubMatchNodeNext = sinon
        .stub(traverser, 'matchNodeNext')
        .returns(null);
      const stubFindNodeWalker = sinon
        .stub(traverser, 'findNodeWalker')
        .returns([]);
      const result = traverser.processComplexBranchFirstNext(
        branch,
        entryNodes,
        targetType
      );
      assert.strictEqual(
        result,
        null,
        'should return null when no element matches'
      );
      assert.strictEqual(
        stubMatchNodeNext.calledOnce,
        true,
        'matchNodeNext should be called once in the initial loop'
      );
      const matchArgs = stubMatchNodeNext.getCall(0).args;
      assert.strictEqual(matchArgs[0], parent, 'should pass the entry node');
      assert.strictEqual(matchArgs[1], branch, 'should pass the branch');
      assert.strictEqual(matchArgs[2], 1, 'should pass index 1');
      assert.strictEqual(
        matchArgs[3],
        branch[0].combo,
        'should pass the entry combo'
      );
      assert.strictEqual(
        stubFindNodeWalker.calledOnce,
        true,
        'findNodeWalker should be called once before the while loop'
      );
      const walkerArgs = stubFindNodeWalker.getCall(0).args;
      assert.strictEqual(
        walkerArgs[0],
        branch[0].leaves,
        'should pass entry leaves'
      );
      assert.strictEqual(walkerArgs[1], parent, 'should pass the entry node');
      assert.deepEqual(
        walkerArgs[2],
        { targetType },
        'should pass targetType option'
      );
    });

    it('should return matchedNode inside the while loop', () => {
      mockEvaluator.node = parent;
      const entryNode = document.createElement('div');
      parent.appendChild(entryNode);
      const branch = [
        { combo: { name: ' ' }, leaves: [] },
        { combo: { name: '+' }, leaves: [] }
      ];
      const entryNodes = [entryNode];
      const targetType = TARGET_FIRST;
      const refNode1 = document.createElement('span');
      const refNode2 = document.createElement('span');
      const expectedMatchedNode = document.createElement('p');
      const stubMatchNodeNext = sinon.stub(traverser, 'matchNodeNext');
      stubMatchNodeNext.onCall(0).returns(null);
      stubMatchNodeNext.onCall(1).returns(null);
      stubMatchNodeNext.onCall(2).returns(expectedMatchedNode);
      const stubFindNodeWalker = sinon.stub(traverser, 'findNodeWalker');
      stubFindNodeWalker.onCall(0).returns([refNode1]);
      stubFindNodeWalker.onCall(1).returns([refNode2]);
      const result = traverser.processComplexBranchFirstNext(
        branch,
        entryNodes,
        targetType
      );
      assert.strictEqual(
        result,
        expectedMatchedNode,
        'should return the matched node found inside the while loop'
      );
      assert.strictEqual(
        stubMatchNodeNext.callCount,
        3,
        'matchNodeNext should be called exactly 3 times'
      );
      assert.strictEqual(
        stubFindNodeWalker.callCount,
        2,
        'findNodeWalker should be called exactly 2 times'
      );
      const secondCallArgs = stubFindNodeWalker.getCall(1).args;
      assert.strictEqual(
        secondCallArgs[1],
        refNode1,
        'the second argument of the second call should be the previous refNode1'
      );
      assert.deepEqual(
        secondCallArgs[2],
        { targetType, force: true },
        'the options argument of the second call should include force: true[cite: 19]'
      );
    });
  });

  describe('matchNodeNext', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should return the next node when index is at the end of the branch', () => {
      const node = document.createElement('div');
      const nextNode = document.createElement('span');
      const branch = [{ combo: { name: '>' }, leaves: [] }];
      const combo = { name: ' ' };
      const stub = sinon
        .stub(traverser, 'yieldCombinatorMatches')
        .returns([nextNode]);
      const result = traverser.matchNodeNext(node, branch, 0, combo);
      assert.strictEqual(result, nextNode, 'returns the yielded node directly');
      assert.strictEqual(
        stub.calledOnce,
        true,
        'yieldCombinatorMatches is called once'
      );
    });

    it('should recursively call matchNodeNext and return the matched node', () => {
      const node1 = document.createElement('div');
      const node2 = document.createElement('span');
      const node3 = document.createElement('p');
      const branch = [
        { combo: { name: '>' }, leaves: [] },
        { combo: { name: '+' }, leaves: [] }
      ];
      const combo = { name: ' ' };
      const stub = sinon.stub(traverser, 'yieldCombinatorMatches');
      stub.onFirstCall().returns([node2]);
      stub.onSecondCall().returns([node3]);
      const result = traverser.matchNodeNext(node1, branch, 0, combo);
      assert.strictEqual(result, node3, 'returns the recursively matched node');
      assert.strictEqual(
        stub.callCount,
        2,
        'yieldCombinatorMatches is called twice'
      );
    });

    it('should backtrack and try the next yielded node if recursion returns null', () => {
      const node1 = document.createElement('div');
      const node2 = document.createElement('span');
      const node3 = document.createElement('p');
      const finalNode = document.createElement('a');
      const branch = [
        { combo: { name: '>' }, leaves: [] },
        { combo: { name: '+' }, leaves: [] }
      ];
      const combo = { name: ' ' };
      const stub = sinon.stub(traverser, 'yieldCombinatorMatches');
      stub
        .withArgs(sinon.match.any, node1, sinon.match.any)
        .returns([node2, node3]);
      stub.withArgs(sinon.match.any, node2, sinon.match.any).returns([]);
      stub
        .withArgs(sinon.match.any, node3, sinon.match.any)
        .returns([finalNode]);
      const result = traverser.matchNodeNext(node1, branch, 0, combo);
      assert.strictEqual(
        result,
        finalNode,
        'backtracks and finds the correct node'
      );
      assert.strictEqual(
        stub.callCount,
        3,
        'yieldCombinatorMatches is called three times in total'
      );
    });

    it('should return null if no combinator matches are yielded', () => {
      const node = document.createElement('div');
      const branch = [{ combo: { name: '>' }, leaves: [] }];
      const combo = { name: ' ' };
      const stub = sinon.stub(traverser, 'yieldCombinatorMatches').returns([]);
      const result = traverser.matchNodeNext(node, branch, 0, combo);
      assert.strictEqual(result, null, 'returns null when no match is found');
      assert.strictEqual(
        stub.calledOnce,
        true,
        'yieldCombinatorMatches is called once'
      );
      const callArgs = stub.getCall(0).args;
      assert.deepEqual(
        callArgs[0],
        { combo: { name: ' ' }, leaves: [] },
        'called with correct twig'
      );
      assert.strictEqual(callArgs[1], node, 'called with correct node');
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

  describe('yieldDescendantMatches', () => {
    let root;

    beforeEach(() => {
      root = document.getElementById('root');
    });

    it('should find descendant by ID_SELECTOR via fast path', () => {
      const leaves = [{ name: 'child2', type: ID_SELECTOR }];
      const result = [...traverser.yieldDescendantMatches(leaves, root, {})];
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].id, 'child2');
    });

    it('should not yield if ID is not a descendant of baseNode', () => {
      const leaves = [{ name: 'root', type: ID_SELECTOR }];
      const child = document.getElementById('target');
      mockEvaluator.matchLeaves.callsFake((leaves, node) => node.id === 'root');
      const result = [...traverser.yieldDescendantMatches(leaves, child, {})];
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
      const result = [...traverser.yieldDescendantMatches(leaves, root, {})];
      assert.strictEqual(result.length, 0);
      assert.strictEqual(mockEvaluator.matchLeaves.called, true);
    });

    it('should find descendants by CLASS_SELECTOR via fast path', () => {
      const leaves = [{ name: 'target-class', type: CLASS_SELECTOR }];
      const result = [...traverser.yieldDescendantMatches(leaves, root, {})];
      assert.strictEqual(result.length, 4);
      assert.strictEqual(result[0].id, 'prev-sib');
      assert.strictEqual(result[1].id, 'target');
    });

    it('should find descendants by TYPE_SELECTOR via fast path', () => {
      const leaves = [{ name: 'p', type: TYPE_SELECTOR }];
      const result = [...traverser.yieldDescendantMatches(leaves, root, {})];
      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].id, 'child1');
      assert.strictEqual(result[1].id, 'child2');
    });

    it('should fallback to TreeWalker for unsupported fast path selectors', () => {
      const leaves = [{ name: 'disabled', type: 'SOME_OTHER_SELECTOR' }];
      mockEvaluator.matchLeaves.returns(true);
      const result = [...traverser.yieldDescendantMatches(leaves, root, {})];
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
        ...traverser.yieldDescendantMatches(leaves, document, {})
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
      const result = [...traverser.yieldDescendantMatches(leaves, root, {})];
      assert.strictEqual(result.length, 4, 'yields filtered matched nodes');
      assert.strictEqual(result[0].id, 'prev-sib');
    });

    it('should evaluate filter leaves for CLASS_SELECTOR and skip if not matched', () => {
      const leaves = [{ name: 'target-class', type: CLASS_SELECTOR }];
      mockEvaluator.getFilterLeaves.returns([{}]);
      mockEvaluator.matchLeaves.returns(false);
      const result = [...traverser.yieldDescendantMatches(leaves, root, {})];
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
        ...traverser.yieldDescendantMatches(leaves, baseNode, {})
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
      const result = [...traverser.yieldDescendantMatches(leaves, root, {})];
      assert.strictEqual(result.length, 2, 'yields filtered matched nodes');
      assert.strictEqual(result[0].id, 'child1');
    });

    it('should evaluate filter leaves for CLASS_SELECTOR and skip if not matched', () => {
      const leaves = [{ name: 'p', type: TYPE_SELECTOR }];
      mockEvaluator.getFilterLeaves.returns([{}]);
      mockEvaluator.matchLeaves.returns(false);
      const result = [...traverser.yieldDescendantMatches(leaves, root, {})];
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
        ...traverser.yieldDescendantMatches(leaves, baseNode, {})
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
      const result = [...traverser.yieldDescendantMatches(leaves, root, {})];
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
      const result = [...traverser.yieldDescendantMatches(leaves, root, {})];
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
      const result = [...traverser.yieldDescendantMatches(leaves, root, {})];
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
      const result = [
        ...traverser.yieldDescendantMatches(leaves, baseNode, {})
      ];
      assert.strictEqual(
        result.length,
        1,
        'Should find the node via fast path in Shadow DOM'
      );
      assert.strictEqual(result[0].id, 'shadow-child');
      mockEvaluator.root = document;
      mockEvaluator.shadow = false;
      host.remove();
    });
  });
});
