/**
 * matcher.test.js
 */

/* api */
import { assert } from 'chai';
import { afterEach, beforeEach, describe, it, xit } from 'mocha';
import { JSDOM } from 'jsdom';
import sinon from 'sinon';

/* test */
import * as mjs from '../src/mjs/matcher.js';
import {
  AN_PLUS_B, ATTRIBUTE_SELECTOR, CLASS_SELECTOR, COMBINATOR, IDENTIFIER,
  ID_SELECTOR, N_TH, PSEUDO_CLASS_SELECTOR, RAW, SELECTOR, SELECTOR_LIST,
  STRING, TYPE_SELECTOR
} from '../src/mjs/constant.js';

describe('match ast leaf against node', () => {
  const globalKeys = ['Node'];
  const domStr =
    '<!doctype html><html lang="en"><head></head><body></body></html>';
  const domOpt = {
    runScripts: 'dangerously',
    url: 'https://localhost/#foo'
  };
  let window, document;
  beforeEach(() => {
    const dom = new JSDOM(domStr, domOpt);
    window = dom.window;
    document = window.document;
    global.window = window;
    global.document = document;
    for (const key of globalKeys) {
      global[key] = window[key];
    }
  });
  afterEach(() => {
    window = null;
    document = null;
    delete global.window;
    delete global.document;
    for (const key of globalKeys) {
      delete global[key];
    }
  });

  describe('collect nth child', () => {
    const func = mjs.collectNthChild;

    it('should get empty array', () => {
      const res = func();
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array', () => {
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const opt = {
        a: 0,
        b: -1
      };
      const res = func(node1, opt);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const opt = {
        a: 0,
        b: 0
      };
      const res = func(node1, opt);
      assert.deepEqual(res, [
        node1
      ], 'result');
    });

    it('should get matched node', () => {
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const opt = {
        a: 0,
        b: 0,
        reverse: true
      };
      const res = func(node1, opt);
      assert.deepEqual(res, [
        node6
      ], 'result');
    });

    it('should get matched node', () => {
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const opt = {
        a: 0,
        b: 1
      };
      const res = func(node1, opt);
      assert.deepEqual(res, [
        node2
      ], 'result');
    });

    it('should get matched node', () => {
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const opt = {
        a: 0,
        b: 1,
        reverse: true
      };
      const res = func(node1, opt);
      assert.deepEqual(res, [
        node5
      ], 'result');
    });

    it('should get empty array', () => {
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const opt = {
        a: 0,
        b: 6,
        reverse: true
      };
      const res = func(node1, opt);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const opt = {
        a: 1,
        b: 0
      };
      const res = func(node1, opt);
      assert.deepEqual(res, [
        node1,
        node2,
        node3,
        node4,
        node5,
        node6
      ], 'result');
    });

    it('should get matched node', () => {
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const opt = {
        a: 1,
        b: 1
      };
      const res = func(node1, opt);
      assert.deepEqual(res, [
        node2,
        node3,
        node4,
        node5,
        node6
      ], 'result');
    });

    it('should get matched node', () => {
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const opt = {
        a: 2,
        b: 0
      };
      const res = func(node1, opt);
      assert.deepEqual(res, [
        node1,
        node3,
        node5
      ], 'result');
    });

    it('should get matched node', () => {
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const opt = {
        a: 2,
        b: 1
      };
      const res = func(node1, opt);
      assert.deepEqual(res, [
        node2,
        node4,
        node6
      ], 'result');
    });

    it('should get matched node', () => {
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const opt = {
        a: 2,
        b: -1
      };
      const res = func(node1, opt);
      assert.deepEqual(res, [
        node2,
        node4,
        node6
      ], 'result');
    });
  });

  describe('collect nth of type', () => {
    const func = mjs.collectNthOfType;

    it('should get empty array', () => {
      const res = func();
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array', () => {
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      node1.id = 'dt1';
      node2.id = 'dd1';
      node3.id = 'dt2';
      node4.id = 'dd2';
      node5.id = 'dt3';
      node6.id = 'dd3';
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const opt = {
        a: 0,
        b: -1
      };
      const res = func(node1, opt);
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array', () => {
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      node1.id = 'dt1';
      node2.id = 'dd1';
      node3.id = 'dt2';
      node4.id = 'dd2';
      node5.id = 'dt3';
      node6.id = 'dd3';
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const opt = {
        a: 0,
        b: 6
      };
      const res = func(node1, opt);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const opt = {
        a: 0,
        b: 0
      };
      const res = func(node1, opt);
      assert.deepEqual(res, [
        node1
      ], 'result');
    });

    it('should get matched node', () => {
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      node1.id = 'dt1';
      node2.id = 'dd1';
      node3.id = 'dt2';
      node4.id = 'dd2';
      node5.id = 'dt3';
      node6.id = 'dd3';
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const opt = {
        a: 0,
        b: 0,
        reverse: true
      };
      const res = func(node1, opt);
      assert.deepEqual(res, [
        node5
      ], 'result');
    });

    it('should get matched node', () => {
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const opt = {
        a: 0,
        b: 1
      };
      const res = func(node1, opt);
      assert.deepEqual(res, [
        node3
      ], 'result');
    });

    it('should get empty array', () => {
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      node1.id = 'dt1';
      node2.id = 'dd1';
      node3.id = 'dt2';
      node4.id = 'dd2';
      node5.id = 'dt3';
      node6.id = 'dd3';
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const opt = {
        a: 0,
        b: 3
      };
      const res = func(node1, opt);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const opt = {
        a: 1,
        b: 0
      };
      const res = func(node1, opt);
      assert.deepEqual(res, [
        node1,
        node3,
        node5
      ], 'result');
    });

    it('should get matched node', () => {
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const opt = {
        a: 1,
        b: 1
      };
      const res = func(node1, opt);
      assert.deepEqual(res, [
        node3,
        node5
      ], 'result');
    });

    it('should get matched node', () => {
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const opt = {
        a: 1,
        b: -1
      };
      const res = func(node1, opt);
      assert.deepEqual(res, [
        node1,
        node3,
        node5
      ], 'result');
    });

    it('should get matched node', () => {
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const opt = {
        a: 2,
        b: 0
      };
      const res = func(node1, opt);
      assert.deepEqual(res, [
        node1,
        node5
      ], 'result');
    });

    it('should get matched node', () => {
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const opt = {
        a: 2,
        b: 1
      };
      const res = func(node1, opt);
      assert.deepEqual(res, [
        node3
      ], 'result');
    });
  });

  describe('match type selector', () => {
    const func = mjs.matchTypeSelector;

    it('should get null', () => {
      const res = func();
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: '|*',
        type: TYPE_SELECTOR
      };
      const node = document.createElement('div');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        name: '|*',
        type: TYPE_SELECTOR
      };
      const node =
        document.createElementNS('https://example.com/foo', 'foo:bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: '*|*',
        type: TYPE_SELECTOR
      };
      const node =
        document.createElementNS('https://example.com/foo', 'foo:bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: '*|*',
        type: TYPE_SELECTOR
      };
      const node = document.createElement('div');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'foo|*',
        type: TYPE_SELECTOR
      };
      const node =
        document.createElementNS('https://example.com/foo', 'foo:bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        name: 'foo|*',
        type: TYPE_SELECTOR
      };
      const node = document.createElement('div');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'foo|bar',
        type: TYPE_SELECTOR
      };
      const root = document.createElement('div');
      root.setAttribute('xmlns', 'http://www.w3.org/2000/xmlns/');
      root.setAttribute('xmlns:foo', 'https://example.com/foo');
      const node =
        document.createElementNS('https://example.com/foo', 'foo:bar');
      root.appendChild(node);
      document.body.appendChild(root);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        name: 'foo|bar',
        type: TYPE_SELECTOR
      };
      const node =
        document.createElementNS('https://example.com/foo', 'foo:baz');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: '*',
        type: TYPE_SELECTOR
      };
      const node = document.createElement('div');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: '*',
        type: TYPE_SELECTOR
      };
      const node =
        document.createElementNS('https://example.com/foo', 'foo:bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'div',
        type: TYPE_SELECTOR
      };
      const node = document.createElement('div');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'div',
        type: TYPE_SELECTOR
      };
      const node =
        document.createElementNS('https://example.com/foo', 'foo:div');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });
  });

  describe('match class selector', () => {
    const func = mjs.matchClassSelector;

    it('should get null', () => {
      const res = func();
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'foo',
        type: CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.classList.add('foo');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        name: 'foo',
        type: CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.classList.add('bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });
  });

  describe('match id selector', () => {
    const func = mjs.matchIdSelector;

    it('should get null', () => {
      const res = func();
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'foo',
        type: ID_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        name: 'foo',
        type: CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'bar';
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });
  });

  describe('match attribute selector', () => {
    const func = mjs.matchAttributeSelector;

    it('should get null', () => {
      const res = func();
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: null,
        matcher: null,
        name: {
          name: '|foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: 's',
        matcher: null,
        name: {
          name: '|foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        flags: null,
        matcher: null,
        name: {
          name: '|foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'qux');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: null,
        matcher: null,
        name: {
          name: '*|foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'qux');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: 's',
        matcher: null,
        name: {
          name: '*|foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'Qux');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: null,
        matcher: null,
        name: {
          name: '*|foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: 's',
        matcher: null,
        name: {
          name: '*|foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: null,
        matcher: null,
        name: {
          name: 'baz|foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'qux');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: 's',
        matcher: null,
        name: {
          name: 'baz|foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'Qux');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        flags: null,
        matcher: null,
        name: {
          name: 'baz|foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: null,
        matcher: null,
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'qux');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: 's',
        matcher: null,
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'Qux');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: null,
        matcher: null,
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: 's',
        matcher: null,
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        flags: null,
        matcher: null,
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:bar', 'qux');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should not match', () => {
      const leaf = {
        flags: null,
        matcher: null,
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('baz', 'bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: null,
        matcher: '=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          name: 'bar',
          type: IDENTIFIER
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: 's',
        matcher: '=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          name: 'Bar',
          type: IDENTIFIER
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        flags: 's',
        matcher: '=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          name: 'bar',
          type: IDENTIFIER
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should not match', () => {
      const leaf = {
        flags: null,
        matcher: '=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          name: 'bar',
          type: IDENTIFIER
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: null,
        matcher: '=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: 's',
        matcher: '=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'Bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        flags: 's',
        matcher: '=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: null,
        matcher: '=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar baz'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar baz');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: null,
        matcher: '=',
        name: {
          name: 'baz|foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'qux'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'qux');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: null,
        matcher: '~=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar baz');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: 's',
        matcher: '~=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'Bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar baz');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        flags: 's',
        matcher: '~=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar baz');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: null,
        matcher: '~=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        flags: null,
        matcher: '~=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz qux');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: null,
        matcher: '|=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: 's',
        matcher: '|=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'Bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        flags: 's',
        matcher: '|=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: null,
        matcher: '|=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar-baz');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: 's',
        matcher: '|=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'Bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar-baz');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        flags: 's',
        matcher: '|=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar-baz');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should not match', () => {
      const leaf = {
        flags: null,
        matcher: '|=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz-bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: null,
        matcher: '^=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: null,
        matcher: '^=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'barbaz');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: null,
        matcher: '^=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar baz');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        flags: null,
        matcher: '^=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: 's',
        matcher: '^=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'Bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar baz');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        flags: 's',
        matcher: '^=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar baz');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: null,
        matcher: '$=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: null,
        matcher: '$=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bazbar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: null,
        matcher: '$=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        flags: null,
        matcher: '$=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar baz');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: 's',
        matcher: '$=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'Bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz Bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        flags: 's',
        matcher: '$=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz Bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: null,
        matcher: '*=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: null,
        matcher: '*=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bazbarqux');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: null,
        matcher: '*=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz bar qux');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        flags: null,
        matcher: '*=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz qux quux');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: 's',
        matcher: '*=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'Bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz Bar qux');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        flags: 's',
        matcher: '*=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz Bar qux');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should warn', () => {
      const stubWarn = sinon.stub(console, 'warn');
      const leaf = {
        flags: null,
        matcher: '==',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      const { called } = stubWarn;
      stubWarn.restore();
      assert.isTrue(called, 'console');
      assert.isNull(res, 'result');
    });
  });

  describe('match An+B selector', () => {
    const func = mjs.matchAnPlusBSelector;

    it('should get null', () => {
      const res = func();
      assert.isNull(res, 'result');
    });

    it('should get null', () => {
      const res = func('foo');
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leafName = 'nth-child';
      const leaf = {
        nth: {
          name: 'even',
          type: IDENTIFIER
        },
        selector: null,
        type: N_TH
      };
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const res = func(leafName, leaf, node1);
      assert.deepEqual(res, [
        node1,
        node3,
        node5
      ], 'result');
    });

    it('should get matched node', () => {
      const leafName = 'nth-child';
      const leaf = {
        nth: {
          name: 'odd',
          type: IDENTIFIER
        },
        selector: null,
        type: N_TH
      };
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const res = func(leafName, leaf, node1);
      assert.deepEqual(res, [
        node2,
        node4,
        node6
      ], 'result');
    });

    it('should get matched node', () => {
      const leafName = 'nth-last-child';
      const leaf = {
        nth: {
          name: 'even',
          type: IDENTIFIER
        },
        selector: null,
        type: N_TH
      };
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const res = func(leafName, leaf, node1);
      assert.deepEqual(res, [
        node6,
        node4,
        node2
      ], 'result');
    });

    it('should get matched node', () => {
      const leafName = 'nth-child';
      const leaf = {
        nth: {
          a: '3',
          b: '1',
          type: AN_PLUS_B
        },
        selector: null,
        type: N_TH
      };
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const res = func(leafName, leaf, node1);
      assert.deepEqual(res, [
        node2,
        node5
      ], 'result');
    });

    it('should get matched node', () => {
      const leafName = 'nth-last-child';
      const leaf = {
        nth: {
          a: '3',
          b: '1',
          type: AN_PLUS_B
        },
        selector: null,
        type: N_TH
      };
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const res = func(leafName, leaf, node1);
      assert.deepEqual(res, [
        node5,
        node2
      ], 'result');
    });

    it('should get matched node', () => {
      const leafName = 'nth-of-type';
      const leaf = {
        nth: {
          name: 'even',
          type: IDENTIFIER
        },
        selector: null,
        type: N_TH
      };
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const res = func(leafName, leaf, node1);
      assert.deepEqual(res, [
        node1,
        node5
      ], 'result');
    });

    it('should get matched node', () => {
      const leafName = 'nth-of-type';
      const leaf = {
        nth: {
          name: 'odd',
          type: IDENTIFIER
        },
        selector: null,
        type: N_TH
      };
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const res = func(leafName, leaf, node1);
      assert.deepEqual(res, [
        node3
      ], 'result');
    });

    it('should get matched node', () => {
      const leafName = 'nth-last-of-type';
      const leaf = {
        nth: {
          name: 'even',
          type: IDENTIFIER
        },
        selector: null,
        type: N_TH
      };
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const res = func(leafName, leaf, node1);
      assert.deepEqual(res, [
        node5,
        node1
      ], 'result');
    });

    it('should get matched node', () => {
      const leafName = 'nth-of-type';
      const leaf = {
        nth: {
          a: '3',
          b: '1',
          type: AN_PLUS_B
        },
        selector: null,
        type: N_TH
      };
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const res = func(leafName, leaf, node1);
      assert.deepEqual(res, [
        node3
      ], 'result');
    });

    it('should get matched node', () => {
      const leafName = 'nth-last-of-type';
      const leaf = {
        nth: {
          a: '3',
          b: '1',
          type: AN_PLUS_B
        },
        selector: null,
        type: N_TH
      };
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const res = func(leafName, leaf, node1);
      assert.deepEqual(res, [
        node3
      ], 'result');
    });
  });

  describe('match language pseudo class selector', () => {
    const func = mjs.matchLanguagePseudoClassSelector;

    it('should get matched node', () => {
      const leaf = {
        name: 'en',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'en');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'en',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'en-US');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'en',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        name: 'en',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'de');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'de-DE',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'de-Latn-DE-1996');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });
  });

  describe('match pseudo class selector', () => {
    const func = mjs.matchPseudoClassSelector;

    it('should get null', () => {
      const res = func();
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: [
          {
            nth: {
              name: 'even',
              type: IDENTIFIER
            },
            selector: null,
            type: N_TH
          }
        ],
        name: 'nth-child',
        type: PSEUDO_CLASS_SELECTOR
      };
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const res = func(leaf, node1);
      assert.deepEqual(res, [
        node1,
        node3,
        node5
      ], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: [
          {
            nth: {
              name: 'even',
              type: IDENTIFIER
            },
            selector: null,
            type: N_TH
          }
        ],
        name: 'nth-last-child',
        type: PSEUDO_CLASS_SELECTOR
      };
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const res = func(leaf, node1);
      assert.deepEqual(res, [
        node6,
        node4,
        node2
      ], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: [
          {
            nth: {
              name: 'even',
              type: IDENTIFIER
            },
            selector: null,
            type: N_TH
          }
        ],
        name: 'nth-of-type',
        type: PSEUDO_CLASS_SELECTOR
      };
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const res = func(leaf, node1);
      assert.deepEqual(res, [
        node1,
        node5
      ], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: [
          {
            nth: {
              name: 'even',
              type: IDENTIFIER
            },
            selector: null,
            type: N_TH
          }
        ],
        name: 'nth-last-of-type',
        type: PSEUDO_CLASS_SELECTOR
      };
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const res = func(leaf, node1);
      assert.deepEqual(res, [
        node5,
        node1
      ], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: [
          {
            name: 'auto',
            type: IDENTIFIER
          }
        ],
        name: 'dir',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('bdo');
      node.setAttribute('dir', 'auto');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: [
          {
            name: 'ltr',
            type: IDENTIFIER
          }
        ],
        name: 'dir',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('bdo');
      node.setAttribute('dir', 'ltr');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: [
          {
            name: 'rtl',
            type: IDENTIFIER
          }
        ],
        name: 'dir',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('bdo');
      node.setAttribute('dir', 'rtl');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: [
          {
            name: 'auto',
            type: IDENTIFIER
          }
        ],
        name: 'dir',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: [
          {
            name: 'en',
            type: IDENTIFIER
          }
        ],
        name: 'lang',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'en');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: [
          {
            name: 'en',
            type: IDENTIFIER
          }
        ],
        name: 'lang',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'en-US');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: [
          {
            name: 'de-DE',
            type: IDENTIFIER
          }
        ],
        name: 'lang',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'de-Latn-DE-1996');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should warn', () => {
      const stubWarn = sinon.stub(console, 'warn');
      const leaf = {
        children: [
          {
            type: RAW,
            value: 'foo'
          }
        ],
        loc: null,
        name: 'current',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.body.appendChild(node);
      const res = func(leaf, node);
      const { called } = stubWarn;
      stubWarn.restore();
      assert.isTrue(called, 'console');
      assert.isNull(res, 'result');
    });

    it('should warn', () => {
      const stubWarn = sinon.stub(console, 'warn');
      const leaf = {
        children: [
          {
            type: RAW,
            value: 'foo'
          }
        ],
        loc: null,
        name: 'foobar',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.body.appendChild(node);
      const res = func(leaf, node);
      const { called } = stubWarn;
      stubWarn.restore();
      assert.isTrue(called, 'console');
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'any-link',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttribute('href', 'https://example.com/');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    // FIXME:
    xit('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'any-link',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
        'https://example.com/');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'any-link',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'link',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttribute('href', 'https://example.com/');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    // FIXME:
    xit('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'link',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
        'https://example.com/');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'link',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'visited',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.href = 'https://example.com';
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'local-link',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttribute('href', './#foo');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'local-link',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttribute('href', './#bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'local-link',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttribute('href', './foo/#bar');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'target',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'target',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'bar';
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'scope',
        type: PSEUDO_CLASS_SELECTOR
      };
      const refPoint = document.createElement('div');
      const node = document.createElement('div');
      node.id = 'foo';
      refPoint.appendChild(node);
      document.body.appendChild(refPoint);
      const res = func(leaf, node, refPoint);
      assert.deepEqual(res, refPoint, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'scope',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, document.documentElement, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      document.body.appendChild(node);
      node.focus();
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'open',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('details');
      node.setAttribute('open', 'open');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'open',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('details');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'closed',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('details');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'closed',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('details');
      node.setAttribute('open', 'open');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'disabled',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('disabled', 'disabled');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'disabled',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'enabled',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'enabled',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('disabled', 'disabled');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'checked',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('checked', 'checked');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'checked',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('required', 'required');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('required', 'required');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'root',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, document.documentElement, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'first-child',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const next = document.createElement('div');
      document.body.appendChild(node);
      document.body.appendChild(next);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'first-child',
        type: PSEUDO_CLASS_SELECTOR
      };
      const prev = document.createElement('div');
      const node = document.createElement('div');
      document.body.appendChild(prev);
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'last-child',
        type: PSEUDO_CLASS_SELECTOR
      };
      const prev = document.createElement('div');
      const node = document.createElement('div');
      document.body.appendChild(prev);
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'last-child',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const next = document.createElement('div');
      document.body.appendChild(node);
      document.body.appendChild(next);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'only-child',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.body.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'only-child',
        type: PSEUDO_CLASS_SELECTOR
      };
      const prev = document.createElement('div');
      const node = document.createElement('div');
      const next = document.createElement('div');
      document.body.appendChild(prev);
      document.body.appendChild(node);
      document.body.appendChild(next);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'first-of-type',
        type: PSEUDO_CLASS_SELECTOR
      };
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const res = func(leaf, node3);
      assert.deepEqual(res, node1, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'last-of-type',
        type: PSEUDO_CLASS_SELECTOR
      };
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      const node3 = document.createElement('dt');
      const node4 = document.createElement('dd');
      const node5 = document.createElement('dt');
      const node6 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      parent.appendChild(node6);
      document.body.appendChild(parent);
      const res = func(leaf, node3);
      assert.deepEqual(res, node5, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'only-of-type',
        type: PSEUDO_CLASS_SELECTOR
      };
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      document.body.appendChild(parent);
      const res = func(leaf, node1);
      assert.deepEqual(res, node1, 'result');
    });

    // Not supported
    it('should warn', () => {
      const stubWarn = sinon.stub(console, 'warn');
      const leaf = {
        children: null,
        name: 'active',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.body.appendChild(node);
      const res = func(leaf, node);
      const { called } = stubWarn;
      stubWarn.restore();
      assert.isTrue(called, 'console');
      assert.isNull(res, 'result');
    });

    // Unknown
    it('should warn', () => {
      const stubWarn = sinon.stub(console, 'warn');
      const leaf = {
        children: null,
        name: 'foo',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.body.appendChild(node);
      const res = func(leaf, node);
      const { called } = stubWarn;
      stubWarn.restore();
      assert.isTrue(called, 'console');
      assert.isNull(res, 'result');
    });
  });

  describe('Matcher', () => {
    const { Matcher } = mjs;

    it('should be instance of Matcher', () => {
      const matcher = new Matcher();
      assert.instanceOf(matcher, Matcher, 'instance');
    });

    it('should be instance of Matcher', () => {
      const matcher = new Matcher('*', document.body);
      assert.instanceOf(matcher, Matcher, 'instance');
    });

    it('should be instance of Matcher', () => {
      const matcher = new Matcher('*', document.body.ownerDocument);
      assert.instanceOf(matcher, Matcher, 'instance');
    });

    describe('create ast', () => {
      it('should get null', () => {
        const matcher = new Matcher();
        const res = matcher._createAst();
        assert.isNull(res, 'result');
      });

      it('should get null', () => {
        const matcher = new Matcher('');
        const res = matcher._createAst();
        assert.isNull(res, 'result');
      });

      it('should warn', () => {
        const stubWarn = sinon.stub(console, 'warn');
        const matcher = new Matcher('*|');
        const res = matcher._createAst();
        const { called } = stubWarn;
        stubWarn.restore();
        assert.isTrue(called, 'console');
        assert.isNull(res, 'result');
      });

      it('should get ast', () => {
        const stubWarn = sinon.stub(console, 'warn');
        const matcher = new Matcher('div.bar[data-baz]#foo:first-child');
        const res = matcher._createAst();
        const { called } = stubWarn;
        stubWarn.restore();
        assert.isFalse(called, 'console');
        assert.deepEqual(res, {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: 'div',
                  type: TYPE_SELECTOR
                },
                {
                  loc: null,
                  name: 'bar',
                  type: CLASS_SELECTOR
                },
                {
                  flags: null,
                  loc: null,
                  matcher: null,
                  name: {
                    loc: null,
                    name: 'data-baz',
                    type: 'Identifier'
                  },
                  type: ATTRIBUTE_SELECTOR,
                  value: null
                },
                {
                  loc: null,
                  name: 'foo',
                  type: ID_SELECTOR
                },
                {
                  children: null,
                  loc: null,
                  name: 'first-child',
                  type: PSEUDO_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        }, 'result');
      });

      it('should get ast', () => {
        const stubWarn = sinon.stub(console, 'warn');
        const matcher = new Matcher('div.foo ul.bar > li.baz');
        const res = matcher._createAst();
        const { called } = stubWarn;
        stubWarn.restore();
        assert.isFalse(called, 'console');
        assert.deepEqual(res, {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: 'div',
                  type: TYPE_SELECTOR
                },
                {
                  loc: null,
                  name: 'foo',
                  type: CLASS_SELECTOR
                },
                {
                  loc: null,
                  name: ' ',
                  type: COMBINATOR
                },
                {
                  loc: null,
                  name: 'ul',
                  type: TYPE_SELECTOR
                },
                {
                  loc: null,
                  name: 'bar',
                  type: CLASS_SELECTOR
                },
                {
                  loc: null,
                  name: '>',
                  type: COMBINATOR
                },
                {
                  loc: null,
                  name: 'li',
                  type: TYPE_SELECTOR
                },
                {
                  loc: null,
                  name: 'baz',
                  type: CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        }, 'result');
      });

      it('should get selector list', () => {
        const stubWarn = sinon.stub(console, 'warn');
        const matcher = new Matcher('li.foo ~ li.bar + li.baz');
        const res = matcher._createAst();
        const { called } = stubWarn;
        stubWarn.restore();
        assert.isFalse(called, 'console');
        assert.deepEqual(res, {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: 'li',
                  type: TYPE_SELECTOR
                },
                {
                  loc: null,
                  name: 'foo',
                  type: CLASS_SELECTOR
                },
                {
                  loc: null,
                  name: '~',
                  type: COMBINATOR
                },
                {
                  loc: null,
                  name: 'li',
                  type: TYPE_SELECTOR
                },
                {
                  loc: null,
                  name: 'bar',
                  type: CLASS_SELECTOR
                },
                {
                  loc: null,
                  name: '+',
                  type: COMBINATOR
                },
                {
                  loc: null,
                  name: 'li',
                  type: TYPE_SELECTOR
                },
                {
                  loc: null,
                  name: 'baz',
                  type: CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        }, 'result');
      });
    });

    describe('handle combinator', () => {
      it('should get matched node', () => {
        const leaves = [
          { type: COMBINATOR, loc: null, name: '>' },
          { type: CLASS_SELECTOR, loc: null, name: 'bar' },
          { type: TYPE_SELECTOR, loc: null, name: 'ul' }
        ];
        const div1 = document.createElement('div');
        const div2 = document.createElement('div');
        const ul1 = document.createElement('ul');
        const li1 = document.createElement('li');
        const li2 = document.createElement('li');
        const li3 = document.createElement('li');
        const li4 = document.createElement('li');
        const li5 = document.createElement('li');
        div1.id = 'div1';
        div2.id = 'div2';
        ul1.id = 'ul1';
        li1.id = 'li1';
        li2.id = 'li2';
        li3.id = 'li3';
        li4.id = 'li4';
        li5.id = 'li5';
        ul1.append(li1, li2, li3, li4, li5);
        div2.appendChild(ul1);
        div1.appendChild(div2);
        document.body.appendChild(div1);
        div1.classList.add('foo');
        ul1.classList.add('bar');
        li3.classList.add('baz');
        const matcher = new Matcher('div.foo ul.bar > li.baz', li3);
        const res = matcher._handleCombinator(leaves);
        assert.deepEqual(res, ul1, 'result');
      });

      it('should not match', () => {
        const leaves = [
          { type: COMBINATOR, loc: null, name: '>' },
          { type: CLASS_SELECTOR, loc: null, name: 'bar' },
          { type: TYPE_SELECTOR, loc: null, name: 'ul' }
        ];
        const div1 = document.createElement('div');
        const div2 = document.createElement('div');
        const ul1 = document.createElement('ul');
        const li1 = document.createElement('li');
        const li2 = document.createElement('li');
        const li3 = document.createElement('li');
        const li4 = document.createElement('li');
        const li5 = document.createElement('li');
        div1.id = 'div1';
        div2.id = 'div2';
        ul1.id = 'ul1';
        li1.id = 'li1';
        li2.id = 'li2';
        li3.id = 'li3';
        li4.id = 'li4';
        li5.id = 'li5';
        ul1.append(li1, li2, li3, li4, li5);
        div2.appendChild(ul1);
        div1.appendChild(div2);
        document.body.appendChild(div1);
        div1.classList.add('foo');
        ul1.classList.add('qux');
        li3.classList.add('baz');
        const matcher = new Matcher('div.foo ul.bar > li.baz', li3);
        const res = matcher._handleCombinator(leaves);
        assert.isNull(res, 'result');
      });

      it('should get matched node', () => {
        const leaves = [
          { type: COMBINATOR, loc: null, name: ' ' },
          { type: CLASS_SELECTOR, loc: null, name: 'foo' },
          { type: TYPE_SELECTOR, loc: null, name: 'div' }
        ];
        const div1 = document.createElement('div');
        const div2 = document.createElement('div');
        const ul1 = document.createElement('ul');
        const li1 = document.createElement('li');
        const li2 = document.createElement('li');
        const li3 = document.createElement('li');
        const li4 = document.createElement('li');
        const li5 = document.createElement('li');
        div1.id = 'div1';
        div2.id = 'div2';
        ul1.id = 'ul1';
        li1.id = 'li1';
        li2.id = 'li2';
        li3.id = 'li3';
        li4.id = 'li4';
        li5.id = 'li5';
        ul1.append(li1, li2, li3, li4, li5);
        div2.appendChild(ul1);
        div1.appendChild(div2);
        document.body.appendChild(div1);
        div1.classList.add('foo');
        ul1.classList.add('bar');
        li3.classList.add('baz');
        const matcher = new Matcher('div.foo ul.bar > li.baz', li3);
        const res = matcher._handleCombinator(leaves, ul1);
        assert.deepEqual(res, div1, 'result');
      });

      it('should not matched node', () => {
        const leaves = [
          { type: COMBINATOR, loc: null, name: ' ' },
          { type: CLASS_SELECTOR, loc: null, name: 'foo' },
          { type: TYPE_SELECTOR, loc: null, name: 'div' }
        ];
        const div1 = document.createElement('div');
        const div2 = document.createElement('div');
        const ul1 = document.createElement('ul');
        const li1 = document.createElement('li');
        const li2 = document.createElement('li');
        const li3 = document.createElement('li');
        const li4 = document.createElement('li');
        const li5 = document.createElement('li');
        div1.id = 'div1';
        div2.id = 'div2';
        ul1.id = 'ul1';
        li1.id = 'li1';
        li2.id = 'li2';
        li3.id = 'li3';
        li4.id = 'li4';
        li5.id = 'li5';
        ul1.append(li1, li2, li3, li4, li5);
        div2.appendChild(ul1);
        div1.appendChild(div2);
        document.body.appendChild(div1);
        div1.classList.add('foobar');
        ul1.classList.add('bar');
        li3.classList.add('baz');
        const matcher = new Matcher('div.foo ul.bar > li.baz', li3);
        const res = matcher._handleCombinator(leaves, ul1);
        assert.isNull(res, 'result');
      });

      it('should get matched node', () => {
        const leaves = [
          { type: COMBINATOR, loc: null, name: '+' },
          { type: CLASS_SELECTOR, loc: null, name: 'bar' },
          { type: TYPE_SELECTOR, loc: null, name: 'li' }
        ];
        const div1 = document.createElement('div');
        const div2 = document.createElement('div');
        const ul1 = document.createElement('ul');
        const li1 = document.createElement('li');
        const li2 = document.createElement('li');
        const li3 = document.createElement('li');
        const li4 = document.createElement('li');
        const li5 = document.createElement('li');
        div1.id = 'div1';
        div2.id = 'div2';
        ul1.id = 'ul1';
        li1.id = 'li1';
        li2.id = 'li2';
        li3.id = 'li3';
        li4.id = 'li4';
        li5.id = 'li5';
        ul1.append(li1, li2, li3, li4, li5);
        div2.appendChild(ul1);
        div1.appendChild(div2);
        document.body.appendChild(div1);
        li1.classList.add('foo');
        li3.classList.add('bar');
        li4.classList.add('baz');
        const matcher = new Matcher('li.foo ~ li.bar + li.baz', li4);
        const res = matcher._handleCombinator(leaves);
        assert.deepEqual(res, li3, 'result');
      });

      it('should not match', () => {
        const leaves = [
          { type: COMBINATOR, loc: null, name: '+' },
          { type: CLASS_SELECTOR, loc: null, name: 'bar' },
          { type: TYPE_SELECTOR, loc: null, name: 'li' }
        ];
        const div1 = document.createElement('div');
        const div2 = document.createElement('div');
        const ul1 = document.createElement('ul');
        const li1 = document.createElement('li');
        const li2 = document.createElement('li');
        const li3 = document.createElement('li');
        const li4 = document.createElement('li');
        const li5 = document.createElement('li');
        div1.id = 'div1';
        div2.id = 'div2';
        ul1.id = 'ul1';
        li1.id = 'li1';
        li2.id = 'li2';
        li3.id = 'li3';
        li4.id = 'li4';
        li5.id = 'li5';
        ul1.append(li1, li2, li3, li4, li5);
        div2.appendChild(ul1);
        div1.appendChild(div2);
        document.body.appendChild(div1);
        li1.classList.add('foo');
        li3.classList.add('bar');
        li4.classList.add('baz');
        const matcher = new Matcher('li.foo ~ li.bar + li.baz', li5);
        const res = matcher._handleCombinator(leaves);
        assert.isNull(res, 'result');
      });

      it('should get matched node', () => {
        const leaves = [
          { type: COMBINATOR, loc: null, name: '~' },
          { type: CLASS_SELECTOR, loc: null, name: 'foo' },
          { type: TYPE_SELECTOR, loc: null, name: 'li' }
        ];
        const div1 = document.createElement('div');
        const div2 = document.createElement('div');
        const ul1 = document.createElement('ul');
        const li1 = document.createElement('li');
        const li2 = document.createElement('li');
        const li3 = document.createElement('li');
        const li4 = document.createElement('li');
        const li5 = document.createElement('li');
        div1.id = 'div1';
        div2.id = 'div2';
        ul1.id = 'ul1';
        li1.id = 'li1';
        li2.id = 'li2';
        li3.id = 'li3';
        li4.id = 'li4';
        li5.id = 'li5';
        ul1.append(li1, li2, li3, li4, li5);
        div2.appendChild(ul1);
        div1.appendChild(div2);
        document.body.appendChild(div1);
        li1.classList.add('foo');
        li3.classList.add('bar');
        li4.classList.add('baz');
        const matcher = new Matcher('li.foo ~ li.bar + li.baz', li4);
        const res = matcher._handleCombinator(leaves, li3);
        assert.deepEqual(res, li1, 'result');
      });

      it('should not match', () => {
        const leaves = [
          { type: COMBINATOR, loc: null, name: '~' },
          { type: CLASS_SELECTOR, loc: null, name: 'foo' },
          { type: TYPE_SELECTOR, loc: null, name: 'li' }
        ];
        const div1 = document.createElement('div');
        const div2 = document.createElement('div');
        const ul1 = document.createElement('ul');
        const li1 = document.createElement('li');
        const li2 = document.createElement('li');
        const li3 = document.createElement('li');
        const li4 = document.createElement('li');
        const li5 = document.createElement('li');
        div1.id = 'div1';
        div2.id = 'div2';
        ul1.id = 'ul1';
        li1.id = 'li1';
        li2.id = 'li2';
        li3.id = 'li3';
        li4.id = 'li4';
        li5.id = 'li5';
        ul1.append(li1, li2, li3, li4, li5);
        div2.appendChild(ul1);
        div1.appendChild(div2);
        document.body.appendChild(div1);
        li1.classList.add('foobar');
        li3.classList.add('bar');
        li4.classList.add('baz');
        const matcher = new Matcher('li.foo ~ li.bar + li.baz', li4);
        const res = matcher._handleCombinator(leaves, li3);
        assert.isNull(res, 'result');
      });

      it('should warn', () => {
        const stubWarn = sinon.stub(console, 'warn');
        const leaves = [
          { type: COMBINATOR, loc: null, name: '=' },
          { type: CLASS_SELECTOR, loc: null, name: 'bar' },
          { type: TYPE_SELECTOR, loc: null, name: 'li' }
        ];
        const div1 = document.createElement('div');
        const div2 = document.createElement('div');
        const ul1 = document.createElement('ul');
        const li1 = document.createElement('li');
        const li2 = document.createElement('li');
        const li3 = document.createElement('li');
        const li4 = document.createElement('li');
        const li5 = document.createElement('li');
        div1.id = 'div1';
        div2.id = 'div2';
        ul1.id = 'ul1';
        li1.id = 'li1';
        li2.id = 'li2';
        li3.id = 'li3';
        li4.id = 'li4';
        li5.id = 'li5';
        ul1.append(li1, li2, li3, li4, li5);
        div2.appendChild(ul1);
        div1.appendChild(div2);
        document.body.appendChild(div1);
        li1.classList.add('foo');
        li3.classList.add('bar');
        li4.classList.add('baz');
        const matcher = new Matcher('li.foo ~ li.bar + li.baz', li5);
        const res = matcher._handleCombinator(leaves);
        const { called } = stubWarn;
        stubWarn.restore();
        assert.isTrue(called, 'console');
        assert.isNull(res, 'result');
      });
    });

    describe('handle selector child', () => {
      it('should get matched node', () => {
        const child = [
          {
            loc: null,
            name: 'li',
            type: TYPE_SELECTOR
          },
          {
            loc: null,
            name: 'baz',
            type: CLASS_SELECTOR
          }
        ];
        const div1 = document.createElement('div');
        const div2 = document.createElement('div');
        const ul1 = document.createElement('ul');
        const li1 = document.createElement('li');
        const li2 = document.createElement('li');
        const li3 = document.createElement('li');
        const li4 = document.createElement('li');
        const li5 = document.createElement('li');
        div1.id = 'div1';
        div2.id = 'div2';
        ul1.id = 'ul1';
        li1.id = 'li1';
        li2.id = 'li2';
        li3.id = 'li3';
        li4.id = 'li4';
        li5.id = 'li5';
        ul1.append(li1, li2, li3, li4, li5);
        div2.appendChild(ul1);
        div1.appendChild(div2);
        document.body.appendChild(div1);
        div1.classList.add('foo');
        ul1.classList.add('bar');
        li3.classList.add('baz');
        const matcher = new Matcher('div.foo ul.bar > li.baz', li3);
        const res = matcher._handleSelectorChild(child);
        assert.deepEqual(res, li3, 'result');
      });

      it('should get matched node', () => {
        const child = [
          {
            loc: null,
            name: 'div',
            type: TYPE_SELECTOR
          },
          {
            loc: null,
            name: 'foo',
            type: CLASS_SELECTOR
          },
          {
            loc: null,
            name: ' ',
            type: COMBINATOR
          },
          {
            loc: null,
            name: 'ul',
            type: TYPE_SELECTOR
          },
          {
            loc: null,
            name: 'bar',
            type: CLASS_SELECTOR
          },
          {
            loc: null,
            name: '>',
            type: COMBINATOR
          },
          {
            loc: null,
            name: 'li',
            type: TYPE_SELECTOR
          },
          {
            loc: null,
            name: 'baz',
            type: CLASS_SELECTOR
          }
        ];
        const div1 = document.createElement('div');
        const div2 = document.createElement('div');
        const ul1 = document.createElement('ul');
        const li1 = document.createElement('li');
        const li2 = document.createElement('li');
        const li3 = document.createElement('li');
        const li4 = document.createElement('li');
        const li5 = document.createElement('li');
        div1.id = 'div1';
        div2.id = 'div2';
        ul1.id = 'ul1';
        li1.id = 'li1';
        li2.id = 'li2';
        li3.id = 'li3';
        li4.id = 'li4';
        li5.id = 'li5';
        ul1.append(li1, li2, li3, li4, li5);
        div2.appendChild(ul1);
        div1.appendChild(div2);
        document.body.appendChild(div1);
        div1.classList.add('foo');
        ul1.classList.add('bar');
        li3.classList.add('baz');
        const matcher = new Matcher('div.foo ul.bar > li.baz', li3);
        const res = matcher._handleSelectorChild(child);
        assert.deepEqual(res, li3, 'result');
      });

      it('should get matched node', () => {
        const child = [
          {
            loc: null,
            name: 'div',
            type: TYPE_SELECTOR
          },
          {
            loc: null,
            name: 'foo',
            type: CLASS_SELECTOR
          },
          {
            loc: null,
            name: ' ',
            type: COMBINATOR
          },
          {
            loc: null,
            name: 'ul',
            type: TYPE_SELECTOR
          },
          {
            loc: null,
            name: 'bar',
            type: CLASS_SELECTOR
          },
          {
            loc: null,
            name: '>',
            type: COMBINATOR
          },
          {
            loc: null,
            name: 'li',
            type: TYPE_SELECTOR
          },
          {
            loc: null,
            name: 'baz',
            type: CLASS_SELECTOR
          }
        ];
        const div1 = document.createElement('div');
        const div2 = document.createElement('div');
        const ul1 = document.createElement('ul');
        const li1 = document.createElement('li');
        const li2 = document.createElement('li');
        const li3 = document.createElement('li');
        const li4 = document.createElement('li');
        const li5 = document.createElement('li');
        div1.id = 'div1';
        div2.id = 'div2';
        ul1.id = 'ul1';
        li1.id = 'li1';
        li2.id = 'li2';
        li3.id = 'li3';
        li4.id = 'li4';
        li5.id = 'li5';
        ul1.append(li1, li2, li3, li4, li5);
        div2.appendChild(ul1);
        div1.appendChild(div2);
        document.body.appendChild(div1);
        div1.classList.add('foo');
        ul1.classList.add('bar');
        li3.classList.add('baz');
        const matcher = new Matcher('div.foo ul.bar > li.baz', li3);
        const res = matcher._handleSelectorChild(child, li3);
        assert.deepEqual(res, li3, 'result');
      });

      it('should not match', () => {
        const child = [
          {
            loc: null,
            name: 'div',
            type: TYPE_SELECTOR
          },
          {
            loc: null,
            name: 'foo',
            type: CLASS_SELECTOR
          },
          {
            loc: null,
            name: ' ',
            type: COMBINATOR
          },
          {
            loc: null,
            name: 'ul',
            type: TYPE_SELECTOR
          },
          {
            loc: null,
            name: 'bar',
            type: CLASS_SELECTOR
          },
          {
            loc: null,
            name: '>',
            type: COMBINATOR
          },
          {
            loc: null,
            name: 'li',
            type: TYPE_SELECTOR
          },
          {
            loc: null,
            name: 'baz',
            type: CLASS_SELECTOR
          }
        ];
        const div1 = document.createElement('div');
        const div2 = document.createElement('div');
        const ul1 = document.createElement('ul');
        const li1 = document.createElement('li');
        const li2 = document.createElement('li');
        const li3 = document.createElement('li');
        const li4 = document.createElement('li');
        const li5 = document.createElement('li');
        div1.id = 'div1';
        div2.id = 'div2';
        ul1.id = 'ul1';
        li1.id = 'li1';
        li2.id = 'li2';
        li3.id = 'li3';
        li4.id = 'li4';
        li5.id = 'li5';
        ul1.append(li1, li2, li3, li4, li5);
        div2.appendChild(ul1);
        div1.appendChild(div2);
        document.body.appendChild(div1);
        div1.classList.add('foobar');
        ul1.classList.add('bar');
        li3.classList.add('baz');
        const matcher = new Matcher('div.foo ul.bar > li.baz', li3);
        const res = matcher._handleSelectorChild(child, li3);
        assert.isNull(res, 'result');
      });
    });

    describe('walk ast', () => {
      it('should get matched node', () => {
        const div1 = document.createElement('div');
        const div2 = document.createElement('div');
        const ul1 = document.createElement('ul');
        const li1 = document.createElement('li');
        const li2 = document.createElement('li');
        const li3 = document.createElement('li');
        const li4 = document.createElement('li');
        const li5 = document.createElement('li');
        div1.id = 'div1';
        div2.id = 'div2';
        ul1.id = 'ul1';
        li1.id = 'li1';
        li2.id = 'li2';
        li3.id = 'li3';
        li4.id = 'li4';
        li5.id = 'li5';
        ul1.append(li1, li2, li3, li4, li5);
        div2.appendChild(ul1);
        div1.appendChild(div2);
        document.body.appendChild(div1);
        div1.classList.add('foo');
        ul1.classList.add('bar');
        li3.classList.add('baz');
        const matcher = new Matcher('div.foo ul.bar > li.baz', li3);
        const res = matcher._walkAst();
        assert.deepEqual(res, li3, 'result');
      });

      it('should get matched node', () => {
        const ast = {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: 'div',
                  type: TYPE_SELECTOR
                },
                {
                  loc: null,
                  name: 'foo',
                  type: CLASS_SELECTOR
                },
                {
                  loc: null,
                  name: ' ',
                  type: COMBINATOR
                },
                {
                  loc: null,
                  name: 'ul',
                  type: TYPE_SELECTOR
                },
                {
                  loc: null,
                  name: 'bar',
                  type: CLASS_SELECTOR
                },
                {
                  loc: null,
                  name: '>',
                  type: COMBINATOR
                },
                {
                  loc: null,
                  name: 'li',
                  type: TYPE_SELECTOR
                },
                {
                  loc: null,
                  name: 'baz',
                  type: CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        };
        const div1 = document.createElement('div');
        const div2 = document.createElement('div');
        const ul1 = document.createElement('ul');
        const li1 = document.createElement('li');
        const li2 = document.createElement('li');
        const li3 = document.createElement('li');
        const li4 = document.createElement('li');
        const li5 = document.createElement('li');
        div1.id = 'div1';
        div2.id = 'div2';
        ul1.id = 'ul1';
        li1.id = 'li1';
        li2.id = 'li2';
        li3.id = 'li3';
        li4.id = 'li4';
        li5.id = 'li5';
        ul1.append(li1, li2, li3, li4, li5);
        div2.appendChild(ul1);
        div1.appendChild(div2);
        document.body.appendChild(div1);
        div1.classList.add('foo');
        ul1.classList.add('bar');
        li3.classList.add('baz');
        const matcher = new Matcher('div.foo ul.bar > li.baz', li3);
        const res = matcher._walkAst(ast);
        assert.deepEqual(res, li3, 'result');
      });
    });

    describe('matches', () => {
      it('should get matched node', () => {
        const node = document.createElement('div');
        node.id = 'foo';
        node.classList.add('bar');
        node.dataset.baz = 'qux';
        document.body.appendChild(node);
        const matcher = new Matcher('div.bar[data-baz]#foo:first-child', node);
        const res = matcher.matches();
        assert.deepEqual(res, node, 'result');
      });

      it('should warn', () => {
        const stubWarn = sinon.stub(console, 'warn');
        const node = document.createElement('div');
        node.id = 'foo';
        node.classList.add('bar');
        node.dataset.baz = 'qux';
        document.body.appendChild(node);
        const matcher = new Matcher('div.bar[*|]#foo:first-child', node);
        const res = matcher.matches();
        const { called } = stubWarn;
        stubWarn.restore();
        assert.isTrue(called, 'console');
        assert.isNull(res, 'result');
      });

      it('should get matched node', () => {
        const div1 = document.createElement('div');
        const div2 = document.createElement('div');
        const ul1 = document.createElement('ul');
        const li1 = document.createElement('li');
        const li2 = document.createElement('li');
        const li3 = document.createElement('li');
        const li4 = document.createElement('li');
        const li5 = document.createElement('li');
        div1.id = 'div1';
        div2.id = 'div2';
        ul1.id = 'ul1';
        li1.id = 'li1';
        li2.id = 'li2';
        li3.id = 'li3';
        li4.id = 'li4';
        li5.id = 'li5';
        ul1.append(li1, li2, li3, li4, li5);
        div2.appendChild(ul1);
        div1.appendChild(div2);
        document.body.appendChild(div1);
        div1.classList.add('foo');
        ul1.classList.add('bar');
        li3.classList.add('baz');
        const matcher = new Matcher('div.foo ul.bar > li.baz', li3);
        const res = matcher.matches();
        assert.deepEqual(res, li3, 'result');
      });

      it('should get matched node', () => {
        const div1 = document.createElement('div');
        const div2 = document.createElement('div');
        const ul1 = document.createElement('ul');
        const li1 = document.createElement('li');
        const li2 = document.createElement('li');
        const li3 = document.createElement('li');
        const li4 = document.createElement('li');
        const li5 = document.createElement('li');
        div1.id = 'div1';
        div2.id = 'div2';
        ul1.id = 'ul1';
        li1.id = 'li1';
        li2.id = 'li2';
        li3.id = 'li3';
        li4.id = 'li4';
        li5.id = 'li5';
        ul1.append(li1, li2, li3, li4, li5);
        div2.appendChild(ul1);
        div1.appendChild(div2);
        document.body.appendChild(div1);
        li1.classList.add('foo');
        li3.classList.add('bar');
        li4.classList.add('baz');
        const matcher = new Matcher('li.foo ~ li.bar + li.baz', li4);
        const res = matcher.matches();
        assert.deepEqual(res, li4, 'result');
      });
    });
  });
});
