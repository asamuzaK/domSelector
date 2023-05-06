/**
 * matcher.test.js
 */

/* api */
const { assert } = require('chai');
const { afterEach, beforeEach, describe, it, xit } = require('mocha');
const { JSDOM } = require('jsdom');
const sinon = require('sinon');

/* test */
const matcherJs = require('../src/js/matcher.js');
const {
  AN_PLUS_B, ATTRIBUTE_SELECTOR, CLASS_SELECTOR, COMBINATOR, IDENTIFIER,
  ID_SELECTOR, NTH, PSEUDO_CLASS_SELECTOR, RAW, SELECTOR, SELECTOR_LIST,
  STRING, TYPE_SELECTOR
} = require('../src/js/constant.js');

describe('match AST leaf and DOM node', () => {
  const domStr = `<!doctype html>
    <html lang="en">
      <head>
      </head>
      <body>
        <div id="div1">
          <div id="div2">
            <ul id="ul1">
              <li id="li1"></li>
              <li id="li2"></li>
              <li id="li3"></li>
            </ul>
          </div>
          <div id="div3">
            <dl id="dl1">
              <dt id="dt1"></dt>
              <dd id="dd1">
                <span id="span1"></span>
              </dd>
              <dt id="dt2"></dt>
              <dd id="dd2">
                <span id="span2"></span>
              </dd>
              <dt id="dt3"></dt>
              <dd id="dd3">
                <span id="span3"></span>
              </dd>
            </dl>
          </div>
          <div id="div4">
            <div id="div6" class="foo">
              <p id="p1"></p>
            </div>
            <div id="div7" class="foo bar">
              <p id="p2"></p>
            </div>
            <div id="div8" class="baz">
              <p id="p3"></p>
            </div>
          </div>
          <div id="div5">
          </div>
        </div>
      </body>
    </html>`;
  const domOpt = {
    runScripts: 'dangerously',
    url: 'https://localhost/#foo'
  };
  const globalKeys = ['Node', 'NodeFilter', 'NodeIterator'];
  let document;
  beforeEach(() => {
    const dom = new JSDOM(domStr, domOpt);
    document = dom.window.document;
    for (const key of globalKeys) {
      global[key] = dom.window[key];
    }
  });
  afterEach(() => {
    document = null;
    for (const key of globalKeys) {
      delete global[key];
    }
  });

  describe('collect nth child', () => {
    const func = matcherJs.collectNthChild;

    it('should get empty array', () => {
      const res = func();
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array', () => {
      const opt = {
        a: 0,
        b: -1
      };
      const node = document.getElementById('dt1');
      const res = func(node, opt);
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array', () => {
      const opt = {
        a: 0,
        b: 6,
        reverse: true
      };
      const node = document.getElementById('dt1');
      const res = func(node, opt);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const opt = {
        a: 0,
        b: 0
      };
      const node = document.getElementById('dt1');
      const res = func(node, opt);
      assert.deepEqual(res, [
        node
      ], 'result');
    });

    it('should get matched node', () => {
      const opt = {
        a: 0,
        b: 0,
        reverse: true
      };
      const node = document.getElementById('dt1');
      const res = func(node, opt);
      assert.deepEqual(res, [
        document.getElementById('dd3')
      ], 'result');
    });

    it('should get matched node', () => {
      const opt = {
        a: 0,
        b: 1
      };
      const node = document.getElementById('dt1');
      const res = func(node, opt);
      assert.deepEqual(res, [
        document.getElementById('dd1')
      ], 'result');
    });

    it('should get matched node', () => {
      const opt = {
        a: 0,
        b: 1,
        reverse: true
      };
      const node = document.getElementById('dt1');
      const res = func(node, opt);
      assert.deepEqual(res, [
        document.getElementById('dt3')
      ], 'result');
    });

    it('should get matched node', () => {
      const opt = {
        a: 1,
        b: 0
      };
      const node = document.getElementById('dt1');
      const res = func(node, opt);
      assert.deepEqual(res, [
        node,
        document.getElementById('dd1'),
        document.getElementById('dt2'),
        document.getElementById('dd2'),
        document.getElementById('dt3'),
        document.getElementById('dd3')
      ], 'result');
    });

    it('should get matched node', () => {
      const opt = {
        a: 1,
        b: 1
      };
      const node = document.getElementById('dt1');
      const res = func(node, opt);
      assert.deepEqual(res, [
        node,
        document.getElementById('dd1'),
        document.getElementById('dt2'),
        document.getElementById('dd2'),
        document.getElementById('dt3'),
        document.getElementById('dd3')
      ], 'result');
    });

    it('should get matched node', () => {
      const opt = {
        a: 2,
        b: 0
      };
      const node = document.getElementById('dt1');
      const res = func(node, opt);
      assert.deepEqual(res, [
        document.getElementById('dd1'),
        document.getElementById('dd2'),
        document.getElementById('dd3')
      ], 'result');
    });

    it('should get matched node', () => {
      const opt = {
        a: 2,
        b: 1
      };
      const node = document.getElementById('dt1');
      const res = func(node, opt);
      assert.deepEqual(res, [
        node,
        document.getElementById('dt2'),
        document.getElementById('dt3')
      ], 'result');
    });

    it('should get matched node', () => {
      const opt = {
        a: 2,
        b: -1
      };
      const node = document.getElementById('dt1');
      const res = func(node, opt);
      assert.deepEqual(res, [
        node,
        document.getElementById('dt2'),
        document.getElementById('dt3')
      ], 'result');
    });
  });

  describe('collect nth of type', () => {
    const func = matcherJs.collectNthOfType;

    it('should get empty array', () => {
      const res = func();
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array', () => {
      const opt = {
        a: 0,
        b: -1
      };
      const node = document.getElementById('dt1');
      const res = func(node, opt);
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array', () => {
      const opt = {
        a: 0,
        b: 6
      };
      const node = document.getElementById('dt1');
      const res = func(node, opt);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const opt = {
        a: 0,
        b: 0
      };
      const node = document.getElementById('dt1');
      const res = func(node, opt);
      assert.deepEqual(res, [
        node
      ], 'result');
    });

    it('should get matched node', () => {
      const opt = {
        a: 0,
        b: 0,
        reverse: true
      };
      const node = document.getElementById('dt1');
      const res = func(node, opt);
      assert.deepEqual(res, [
        document.getElementById('dt3')
      ], 'result');
    });

    it('should get matched node', () => {
      const opt = {
        a: 0,
        b: 1
      };
      const node = document.getElementById('dt1');
      const res = func(node, opt);
      assert.deepEqual(res, [
        document.getElementById('dt2')
      ], 'result');
    });

    it('should get empty array', () => {
      const opt = {
        a: 0,
        b: 3
      };
      const node = document.getElementById('dt1');
      const res = func(node, opt);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const opt = {
        a: 1,
        b: 0
      };
      const node = document.getElementById('dt1');
      const res = func(node, opt);
      assert.deepEqual(res, [
        node,
        document.getElementById('dt2'),
        document.getElementById('dt3')
      ], 'result');
    });

    it('should get matched node', () => {
      const opt = {
        a: 1,
        b: 1
      };
      const node = document.getElementById('dt1');
      const res = func(node, opt);
      assert.deepEqual(res, [
        node,
        document.getElementById('dt2'),
        document.getElementById('dt3')
      ], 'result');
    });

    it('should get matched node', () => {
      const opt = {
        a: 1,
        b: -1
      };
      const node = document.getElementById('dt1');
      const res = func(node, opt);
      assert.deepEqual(res, [
        node,
        document.getElementById('dt2'),
        document.getElementById('dt3')
      ], 'result');
    });

    it('should get matched node', () => {
      const opt = {
        a: 2,
        b: 0
      };
      const node = document.getElementById('dt1');
      const res = func(node, opt);
      assert.deepEqual(res, [
        document.getElementById('dt2')
      ], 'result');
    });

    it('should get matched node', () => {
      const opt = {
        a: 2,
        b: 1
      };
      const node = document.getElementById('dt1');
      const res = func(node, opt);
      assert.deepEqual(res, [
        node,
        document.getElementById('dt3')
      ], 'result');
    });
  });

  describe('match type selector', () => {
    const func = matcherJs.matchTypeSelector;

    it('should get null', () => {
      const res = func();
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: '|*',
        type: TYPE_SELECTOR
      };
      const node = document.getElementById('div5');
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: '*|*',
        type: TYPE_SELECTOR
      };
      const node = document.getElementById('div5');
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: '*|*',
        type: TYPE_SELECTOR
      };
      const node =
        document.createElementNS('https://example.com/foo', 'foo:bar');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        name: 'foo|*',
        type: TYPE_SELECTOR
      };
      const node = document.getElementById('div5');
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'foo|bar',
        type: TYPE_SELECTOR
      };
      const nsroot = document.createElement('div');
      nsroot.setAttribute('xmlns', 'http://www.w3.org/2000/xmlns/');
      nsroot.setAttribute('xmlns:foo', 'https://example.com/foo');
      const node =
        document.createElementNS('https://example.com/foo', 'foo:bar');
      nsroot.appendChild(node);
      const parent = document.getElementById('div5');
      parent.appendChild(nsroot);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: '*',
        type: TYPE_SELECTOR
      };
      const node = document.getElementById('div5');
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'div',
        type: TYPE_SELECTOR
      };
      const node = document.getElementById('div5');
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });
  });

  describe('match class selector', () => {
    const func = matcherJs.matchClassSelector;

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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        name: 'bar',
        type: CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.classList.add('foo');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });
  });

  describe('match id selector', () => {
    const func = matcherJs.matchIdSelector;

    it('should get null', () => {
      const res = func();
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'div5',
        type: ID_SELECTOR
      };
      const node = document.getElementById('div5');
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        name: 'foo',
        type: ID_SELECTOR
      };
      const node = document.getElementById('div5');
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });
  });

  describe('match attribute selector', () => {
    const func = matcherJs.matchAttributeSelector;

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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      const { called } = stubWarn;
      stubWarn.restore();
      assert.isTrue(called, 'console');
      assert.isNull(res, 'result');
    });
  });

  describe('match An+B', () => {
    const func = matcherJs.matchAnPlusB;

    it('should get empty array', () => {
      const res = func();
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array', () => {
      const res = func('foo');
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const leafName = 'nth-child';
      const leaf = {
        nth: {
          name: 'even',
          type: IDENTIFIER
        },
        selector: null,
        type: NTH
      };
      const node = document.getElementById('dt1');
      const res = func(leafName, leaf, node);
      assert.deepEqual(res, [
        document.getElementById('dd1'),
        document.getElementById('dd2'),
        document.getElementById('dd3')
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
        type: NTH
      };
      const node = document.getElementById('dt1');
      const res = func(leafName, leaf, node);
      assert.deepEqual(res, [
        node,
        document.getElementById('dt2'),
        document.getElementById('dt3')
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
        type: NTH
      };
      const node = document.getElementById('dt1');
      const res = func(leafName, leaf, node);
      assert.deepEqual(res, [
        document.getElementById('dt3'),
        document.getElementById('dt2'),
        node
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
        type: NTH
      };
      const node = document.getElementById('dt1');
      const res = func(leafName, leaf, node);
      assert.deepEqual(res, [
        node,
        document.getElementById('dd2')
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
        type: NTH
      };
      const node = document.getElementById('dt1');
      const res = func(leafName, leaf, node);
      assert.deepEqual(res, [
        document.getElementById('dd3'),
        document.getElementById('dt2')
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
        type: NTH
      };
      const node = document.getElementById('dt1');
      const res = func(leafName, leaf, node);
      assert.deepEqual(res, [
        document.getElementById('dt2')
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
        type: NTH
      };
      const node = document.getElementById('dt1');
      const res = func(leafName, leaf, node);
      assert.deepEqual(res, [
        node,
        document.getElementById('dt3')
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
        type: NTH
      };
      const node = document.getElementById('dt1');
      const res = func(leafName, leaf, node);
      assert.deepEqual(res, [
        document.getElementById('dt2')
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
        type: NTH
      };
      const node = document.getElementById('dt1');
      const res = func(leafName, leaf, node);
      assert.deepEqual(res, [
        node
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
        type: NTH
      };
      const node = document.getElementById('dt1');
      const res = func(leafName, leaf, node);
      assert.deepEqual(res, [
        document.getElementById('dt3')
      ], 'result');
    });
  });

  describe('match language pseudo class', () => {
    const func = matcherJs.matchLanguagePseudoClass;

    it('should get matched node', () => {
      const leaf = {
        name: 'en',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'en');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'en',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'de-Latn-DE',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'de-Latn-DE-1996');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'de-de',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'de-DE');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        name: 'de-de',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'de-Deva');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, node, 'result');
    });
  });

  describe('match pseudo class selector', () => {
    const func = matcherJs.matchPseudoClassSelector;

    it('should get empty array', () => {
      const res = func();
      assert.deepEqual(res, [], 'result');
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
            type: NTH
          }
        ],
        name: 'nth-child',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.getElementById('dt1');
      const res = func(leaf, node);
      assert.deepEqual(res, [
        document.getElementById('dd1'),
        document.getElementById('dd2'),
        document.getElementById('dd3')
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
            type: NTH
          }
        ],
        name: 'nth-last-child',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.getElementById('dt1');
      const res = func(leaf, node);
      assert.deepEqual(res, [
        document.getElementById('dt3'),
        document.getElementById('dt2'),
        node
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
            type: NTH
          }
        ],
        name: 'nth-of-type',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.getElementById('dt1');
      const res = func(leaf, node);
      assert.deepEqual(res, [
        document.getElementById('dt2')
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
            type: NTH
          }
        ],
        name: 'nth-last-of-type',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.getElementById('dt1');
      const res = func(leaf, node);
      assert.deepEqual(res, [
        document.getElementById('dt2')
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      const { called } = stubWarn;
      stubWarn.restore();
      assert.isTrue(called, 'console');
      assert.deepEqual(res, [], 'result');
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      const { called } = stubWarn;
      stubWarn.restore();
      assert.isTrue(called, 'console');
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'any-link',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttribute('href', 'https://example.com/');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'any-link',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'link',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttribute('href', 'https://example.com/');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
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
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'link',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'visited',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.href = 'https://example.com';
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'local-link',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttribute('href', './#foo');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'local-link',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttribute('href', './#bar');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'local-link',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttribute('href', './foo/#bar');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'target',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'target',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'bar';
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'scope',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'scope',
        type: PSEUDO_CLASS_SELECTOR
      };
      const refPoint = document.createElement('div');
      const node = document.createElement('div');
      node.id = 'foo';
      refPoint.appendChild(node);
      const parent = document.getElementById('div5');
      parent.appendChild(refPoint);
      const res = func(leaf, node, refPoint);
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'scope',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node, document);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'scope',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, document.documentElement, document);
      assert.deepEqual(res, [document.documentElement], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      node.focus();
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'open',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('details');
      node.setAttribute('open', 'open');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'open',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('details');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'closed',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('details');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'closed',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('details');
      node.setAttribute('open', 'open');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'disabled',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('disabled', 'disabled');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'disabled',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'enabled',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'enabled',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('disabled', 'disabled');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'checked',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('checked', 'checked');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'checked',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('required', 'required');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('required', 'required');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'root',
        type: PSEUDO_CLASS_SELECTOR
      };
      const res = func(leaf, document.documentElement);
      assert.deepEqual(res, [document.documentElement], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'root',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'first-child',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const next = document.createElement('div');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      parent.appendChild(next);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'first-child',
        type: PSEUDO_CLASS_SELECTOR
      };
      const prev = document.createElement('div');
      const node = document.createElement('div');
      const parent = document.getElementById('div5');
      parent.appendChild(prev);
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'last-child',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const next = document.createElement('div');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      parent.appendChild(next);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'last-child',
        type: PSEUDO_CLASS_SELECTOR
      };
      const prev = document.createElement('div');
      const node = document.createElement('div');
      const parent = document.getElementById('div5');
      parent.appendChild(prev);
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'only-child',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div5');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
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
      const parent = document.getElementById('div5');
      parent.appendChild(prev);
      parent.appendChild(node);
      parent.appendChild(next);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'first-of-type',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.getElementById('dt2');
      const res = func(leaf, node);
      assert.deepEqual(res, [document.getElementById('dt1')], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'last-of-type',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.getElementById('dt2');
      const res = func(leaf, node);
      assert.deepEqual(res, [document.getElementById('dt3')], 'result');
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
      document.getElementById('div5').appendChild(parent);
      const res = func(leaf, node1);
      assert.deepEqual(res, [node1], 'result');
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
      document.getElementById('div5').appendChild(node);
      const res = func(leaf, node);
      const { called } = stubWarn;
      stubWarn.restore();
      assert.isTrue(called, 'console');
      assert.deepEqual(res, [], 'result');
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
      document.getElementById('div5').appendChild(node);
      const res = func(leaf, node);
      const { called } = stubWarn;
      stubWarn.restore();
      assert.isTrue(called, 'console');
      assert.deepEqual(res, [], 'result');
    });
  });

  describe('Matcher', () => {
    const { Matcher } = matcherJs;

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

    describe('create node iterator', () => {
      it('should be instance of NodeIterator', () => {
        const matcher = new Matcher('div ul li', document);
        const res = matcher._createIterator();
        assert.instanceOf(res, NodeIterator, 'result');
      });

      it('should be instance of NodeIterator', () => {
        const ast = {
          name: 'div',
          type: TYPE_SELECTOR
        };
        const matcher = new Matcher('div ul li', document);
        const res = matcher._createIterator(ast, document);
        assert.instanceOf(res, NodeIterator, 'result');
      });
    });

    describe('parse ast and run', () => {
      it('should get empty array', () => {
        const matcher = new Matcher('#div1');
        const res = matcher._parseAst();
        assert.deepEqual(res, [], 'result');
      });

      it('should get matched node', () => {
        const ast = {
          children: [
            {
              children: [
                {
                  name: 'div1',
                  type: ID_SELECTOR
                }
              ],
              type: SELECTOR
            }
          ],
          type: SELECTOR_LIST
        };
        const node = document.getElementById('div1');
        const matcher = new Matcher('#div1', document);
        const res = matcher._parseAst(ast, document);
        assert.deepEqual(res, [node], 'result');
      });
    });

    describe('match adjacent leaves', () => {
      it('should throw', () => {
        const matcher = new Matcher('div ul li', document);
        assert.throws(() => matcher._matchAdjacentLeaves(), TypeError);
      });

      it('should get matched node', () => {
        const leaves = [
          {
            name: 'div',
            type: TYPE_SELECTOR
          },
          {
            name: 'div1',
            type: ID_SELECTOR
          }
        ];
        const node = document.getElementById('div1');
        const matcher = new Matcher('div#div1', node);
        const res = matcher._matchAdjacentLeaves(leaves, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should not match', () => {
        const leaves = [
          {
            name: 'div',
            type: TYPE_SELECTOR
          },
          {
            name: 'qux',
            type: CLASS_SELECTOR
          }
        ];
        const node = document.getElementById('div1');
        const matcher = new Matcher('div.qux', node);
        const res = matcher._matchAdjacentLeaves(leaves, node);
        assert.isNull(res, 'result');
      });

      it('should get matched node', () => {
        const leaves = [
          {
            name: 'foo',
            type: CLASS_SELECTOR
          },
          {
            name: 'bar',
            type: CLASS_SELECTOR
          }
        ];
        const node = document.getElementById('div7');
        const matcher = new Matcher('.foo.bar', node);
        const res = matcher._matchAdjacentLeaves(leaves, node);
        assert.deepEqual(res, node, 'result');
      });
    });

    describe('match combinator', () => {
      it('should throw', () => {
        const matcher = new Matcher('#div1 ul', document);
        assert.throws(() => matcher._matchCombinator(), TypeError);
      });

      it('should not match', () => {
        const ast = [
          {
            name: ' ',
            type: COMBINATOR
          }
        ];
        const node = document.getElementById('div1');
        const matcher = new Matcher('#div1 ul', document);
        const res = matcher._matchCombinator(ast, node);
        assert.deepEqual(res, [], 'result');
      });

      it('should get matched node', () => {
        const ast = [
          {
            name: ' ',
            type: COMBINATOR
          },
          {
            name: 'ul1',
            type: ID_SELECTOR
          }
        ];
        const prev = document.getElementById('div1');
        const next = document.getElementById('ul1');
        const matcher = new Matcher('#div1 ul', document);
        const res = matcher._matchCombinator(ast, prev);
        assert.deepEqual(res, [next], 'result');
      });

      it('should not match', () => {
        const ast = [
          {
            name: ' ',
            type: COMBINATOR
          },
          {
            name: 'foo',
            type: ID_SELECTOR
          }
        ];
        const prev = document.getElementById('div1');
        const matcher = new Matcher('#div1 ul', document);
        const res = matcher._matchCombinator(ast, prev);
        assert.deepEqual(res, [], 'result');
      });

      it('should get matched node', () => {
        const ast = [
          {
            name: '>',
            type: COMBINATOR
          },
          {
            name: 'ul1',
            type: ID_SELECTOR
          }
        ];
        const prev = document.getElementById('div2');
        const next = document.getElementById('ul1');
        const matcher = new Matcher('#div1 ul', document);
        const res = matcher._matchCombinator(ast, prev);
        assert.deepEqual(res, [next], 'result');
      });

      it('should not match', () => {
        const ast = [
          {
            name: '>',
            type: COMBINATOR
          },
          {
            name: 'foo',
            type: ID_SELECTOR
          }
        ];
        const prev = document.getElementById('div2');
        const matcher = new Matcher('#div1 ul', document);
        const res = matcher._matchCombinator(ast, prev);
        assert.deepEqual(res, [], 'result');
      });

      it('should get matched node', () => {
        const ast = [
          {
            name: '~',
            type: COMBINATOR
          },
          {
            name: 'li3',
            type: ID_SELECTOR
          }
        ];
        const prev = document.getElementById('li1');
        const next = document.getElementById('li3');
        const matcher = new Matcher('#li1 ~ #li3', document);
        const res = matcher._matchCombinator(ast, prev);
        assert.deepEqual(res, [next], 'result');
      });

      it('should not match', () => {
        const ast = [
          {
            name: '~',
            type: COMBINATOR
          },
          {
            name: 'foo',
            type: ID_SELECTOR
          }
        ];
        const prev = document.getElementById('li1');
        const matcher = new Matcher('#li1 ~ #li3', document);
        const res = matcher._matchCombinator(ast, prev);
        assert.deepEqual(res, [], 'result');
      });

      it('should get matched node', () => {
        const ast = [
          {
            name: '+',
            type: COMBINATOR
          },
          {
            name: 'li2',
            type: ID_SELECTOR
          }
        ];
        const prev = document.getElementById('li1');
        const next = document.getElementById('li2');
        const matcher = new Matcher('#li1 + #li2', document);
        const res = matcher._matchCombinator(ast, prev);
        assert.deepEqual(res, [next], 'result');
      });

      it('should not match', () => {
        const ast = [
          {
            name: '+',
            type: COMBINATOR
          },
          {
            name: 'foo',
            type: ID_SELECTOR
          }
        ];
        const prev = document.getElementById('li1');
        const matcher = new Matcher('#li1 + #li2', document);
        const res = matcher._matchCombinator(ast, prev);
        assert.deepEqual(res, [], 'result');
      });

      it('should get matched node', () => {
        const ast = [
          {
            name: '+',
            type: COMBINATOR
          },
          {
            name: 'baz',
            type: CLASS_SELECTOR
          }
        ];
        const prev = document.getElementById('div7');
        const next = document.getElementById('div8');
        const matcher = new Matcher('.foo.bar + .baz', document);
        const res = matcher._matchCombinator(ast, prev);
        assert.deepEqual(res, [next], 'result');
      });

      it('should get matched node', () => {
        const ast = [
          {
            name: '+',
            type: COMBINATOR
          },
          {
            name: 'foo',
            type: CLASS_SELECTOR
          },
          {
            name: 'bar',
            type: CLASS_SELECTOR
          }
        ];
        const prev = document.getElementById('div6');
        const next = document.getElementById('div7');
        const matcher = new Matcher('.foo + .foo.bar', document);
        const res = matcher._matchCombinator(ast, prev);
        assert.deepEqual(res, [next], 'result');
      });
    });

    describe('match argument leaf', () => {
      it('should throw', () => {
        const matcher = new Matcher('div#div1 :is(ol, ul)', document);
        assert.throws(() => matcher._matchArgumentLeaf(), TypeError);
      });

      it('should get matched node', () => {
        const ast = {
          name: 'ul',
          type: TYPE_SELECTOR
        };
        const root = document.getElementById('div1');
        const node = document.getElementById('ul1');
        const matcher = new Matcher('div#div1 :is(ol, ul)', document);
        const res = matcher._matchArgumentLeaf(ast, root);
        assert.deepEqual(res, [node], 'result');
      });

      it('should get matched node', () => {
        const ast = {
          name: 'ul',
          type: TYPE_SELECTOR
        };
        const node = document.getElementById('ul1');
        const matcher = new Matcher('div#div1 :is(ol, ul)', document);
        const res = matcher._matchArgumentLeaf(ast, node);
        assert.deepEqual(res, [node], 'result');
      });

      it('should not match', () => {
        const ast = {
          name: 'ol',
          type: TYPE_SELECTOR
        };
        const root = document.getElementById('div1');
        const matcher = new Matcher('div#div1 :is(ol, ul)', document);
        const res = matcher._matchArgumentLeaf(ast, root);
        assert.deepEqual(res, [], 'result');
      });

      it('should get matched node', () => {
        const ast = {
          name: 'li',
          type: TYPE_SELECTOR
        };
        const root = document.getElementById('div1');
        const matcher = new Matcher('div#div1 :is(li)', document);
        const res = matcher._matchArgumentLeaf(ast, root);
        assert.deepEqual(res, [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ], 'result');
      });
    });

    describe('match pseudo class function', () => {
      it('should get empty array', () => {
        const matcher = new Matcher('div:not(.bar)', document);
        const res = matcher._matchLogicalPseudoClassFunc();
        assert.deepEqual(res, [], 'result');
      });

      it('should get matched node', () => {
        const ast = {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      name: 'foo',
                      type: CLASS_SELECTOR
                    },
                    {
                      name: 'bar',
                      type: CLASS_SELECTOR
                    }
                  ],
                  type: SELECTOR
                },
                {
                  children: [
                    {
                      name: 'qux',
                      type: CLASS_SELECTOR
                    }
                  ],
                  type: SELECTOR
                }
              ],
              type: SELECTOR_LIST
            }
          ],
          name: 'is',
          type: PSEUDO_CLASS_SELECTOR
        };
        const leaves = [];
        const node = document.getElementById('div7');
        const matcher = new Matcher('div:is(.foo.bar, .qux) > p', document);
        const res = matcher._matchLogicalPseudoClassFunc(ast, leaves, node);
        assert.deepEqual(res, [node], 'result');
      });

      it('should not match', () => {
        const ast = {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      name: 'foo',
                      type: CLASS_SELECTOR
                    },
                    {
                      name: 'bar',
                      type: CLASS_SELECTOR
                    }
                  ],
                  type: SELECTOR
                },
                {
                  children: [
                    {
                      name: 'qux',
                      type: CLASS_SELECTOR
                    }
                  ],
                  type: SELECTOR
                }
              ],
              type: SELECTOR_LIST
            }
          ],
          name: 'is',
          type: PSEUDO_CLASS_SELECTOR
        };
        const leaves = [];
        const node = document.getElementById('div6');
        const matcher = new Matcher('div:is(.foo.bar, .qux) > p', document);
        const res = matcher._matchLogicalPseudoClassFunc(ast, leaves, node);
        assert.deepEqual(res, [], 'result');
      });

      it('should get matched node', () => {
        const ast = {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      name: 'foo',
                      type: CLASS_SELECTOR
                    },
                    {
                      name: 'bar',
                      type: CLASS_SELECTOR
                    }
                  ],
                  type: SELECTOR
                },
                {
                  children: [
                    {
                      name: 'qux',
                      type: CLASS_SELECTOR
                    }
                  ],
                  type: SELECTOR
                }
              ],
              type: SELECTOR_LIST
            }
          ],
          name: 'is',
          type: PSEUDO_CLASS_SELECTOR
        };
        const leaves = [
          {
            name: '>',
            type: COMBINATOR
          },
          {
            name: 'p',
            type: TYPE_SELECTOR
          }
        ];
        const node = document.getElementById('div7');
        const matcher = new Matcher('div:is(.foo.bar, .qux) > p', document);
        const res = matcher._matchLogicalPseudoClassFunc(ast, leaves, node);
        assert.deepEqual(res, [
          document.getElementById('p2')
        ], 'result');
      });

      it('should get matched node', () => {
        const ast = {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      name: 'bar',
                      type: CLASS_SELECTOR
                    }
                  ],
                  type: SELECTOR
                },
                {
                  children: [
                    {
                      name: 'qux',
                      type: CLASS_SELECTOR
                    }
                  ],
                  type: SELECTOR
                }
              ],
              type: SELECTOR_LIST
            }
          ],
          name: 'where',
          type: PSEUDO_CLASS_SELECTOR
        };
        const leaves = [];
        const node = document.getElementById('div7');
        const matcher = new Matcher('div:where(.foo.bar, .qux) > p', document);
        const res = matcher._matchLogicalPseudoClassFunc(ast, leaves, node);
        assert.deepEqual(res, [
          document.getElementById('div7')
        ], 'result');
      });

      it('should not match', () => {
        const ast = {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      name: 'bar',
                      type: CLASS_SELECTOR
                    }
                  ],
                  type: SELECTOR
                },
                {
                  children: [
                    {
                      name: 'qux',
                      type: CLASS_SELECTOR
                    }
                  ],
                  type: SELECTOR
                }
              ],
              type: SELECTOR_LIST
            }
          ],
          name: 'not',
          type: PSEUDO_CLASS_SELECTOR
        };
        const leaves = [];
        const node = document.getElementById('div7');
        const matcher = new Matcher('div.foo:not(.bar, .qux) > p', document);
        const res = matcher._matchLogicalPseudoClassFunc(ast, leaves, node);
        assert.deepEqual(res, [], 'result');
      });

      it('should get matched node', () => {
        const ast = {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      name: 'bar',
                      type: CLASS_SELECTOR
                    }
                  ],
                  type: SELECTOR
                },
                {
                  children: [
                    {
                      name: 'qux',
                      type: CLASS_SELECTOR
                    }
                  ],
                  type: SELECTOR
                }
              ],
              type: SELECTOR_LIST
            }
          ],
          name: 'not',
          type: PSEUDO_CLASS_SELECTOR
        };
        const leaves = [];
        const node = document.getElementById('div6');
        const matcher = new Matcher('div.foo:not(.bar, .qux) > p', document);
        const res = matcher._matchLogicalPseudoClassFunc(ast, leaves, node);
        assert.deepEqual(res, [node], 'result');
      });

      it('should get matched node', () => {
        const ast = {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      name: 'bar',
                      type: CLASS_SELECTOR
                    }
                  ],
                  type: SELECTOR
                },
                {
                  children: [
                    {
                      name: 'qux',
                      type: CLASS_SELECTOR
                    }
                  ],
                  type: SELECTOR
                }
              ],
              type: SELECTOR_LIST
            }
          ],
          name: 'not',
          type: PSEUDO_CLASS_SELECTOR
        };
        const leaves = [
          {
            name: '>',
            type: COMBINATOR
          },
          {
            name: 'p',
            type: TYPE_SELECTOR
          }
        ];
        const root = document.getElementById('div6');
        const matcher = new Matcher('div.foo:not(.bar, .qux) > p', document);
        const res = matcher._matchLogicalPseudoClassFunc(ast, leaves, root);
        assert.deepEqual(res, [
          document.getElementById('p1')
        ], 'result');
      });

      it('should not match', () => {
        const ast = {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      name: 'foo',
                      type: CLASS_SELECTOR
                    },
                    {
                      name: 'bar',
                      type: CLASS_SELECTOR
                    }
                  ],
                  type: SELECTOR
                },
                {
                  children: [
                    {
                      name: 'qux',
                      type: CLASS_SELECTOR
                    }
                  ],
                  type: SELECTOR
                }
              ],
              type: SELECTOR_LIST
            }
          ],
          name: 'not',
          type: PSEUDO_CLASS_SELECTOR
        };
        const leaves = [
          {
            name: '>',
            type: COMBINATOR
          },
          {
            name: 'p',
            type: TYPE_SELECTOR
          }
        ];
        const root = document.getElementById('div7');
        const matcher = new Matcher('div:not(.foo.bar, .qux) > p', document);
        const res = matcher._matchLogicalPseudoClassFunc(ast, leaves, root);
        assert.deepEqual(res, [], 'result');
      });

      it('should get matched node', () => {
        const ast = {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      name: 'bar',
                      type: CLASS_SELECTOR
                    }
                  ],
                  type: SELECTOR
                },
                {
                  children: [
                    {
                      name: 'qux',
                      type: CLASS_SELECTOR
                    }
                  ],
                  type: SELECTOR
                }
              ],
              type: SELECTOR_LIST
            }
          ],
          name: 'has',
          type: PSEUDO_CLASS_SELECTOR
        };
        const leaves = [];
        const root = document.getElementById('div4');
        const matcher = new Matcher('div:has(.bar, .qux) p', document);
        const res = matcher._matchLogicalPseudoClassFunc(ast, leaves, root);
        assert.deepEqual(res, [root], 'result');
      });

      it('should get matched node', () => {
        const ast = {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      name: '>',
                      type: COMBINATOR
                    },
                    {
                      name: 'bar',
                      type: CLASS_SELECTOR
                    }
                  ],
                  type: SELECTOR
                },
                {
                  children: [
                    {
                      name: '>',
                      type: COMBINATOR
                    },
                    {
                      name: 'qux',
                      type: CLASS_SELECTOR
                    }
                  ],
                  type: SELECTOR
                }
              ],
              type: SELECTOR_LIST
            }
          ],
          name: 'has',
          type: PSEUDO_CLASS_SELECTOR
        };
        const leaves = [];
        const root = document.getElementById('div4');
        const matcher = new Matcher('div:has(> .bar, > .qux) p', document);
        const res = matcher._matchLogicalPseudoClassFunc(ast, leaves, root);
        assert.deepEqual(res, [root], 'result');
      });

      it('should not match', () => {
        const ast = {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      name: '>',
                      type: COMBINATOR
                    },
                    {
                      name: 'foo',
                      type: CLASS_SELECTOR
                    },
                    {
                      name: 'bar',
                      type: CLASS_SELECTOR
                    }
                  ],
                  type: SELECTOR
                },
                {
                  children: [
                    {
                      name: '>',
                      type: COMBINATOR
                    },
                    {
                      name: 'qux',
                      type: CLASS_SELECTOR
                    }
                  ],
                  type: SELECTOR
                }
              ],
              type: SELECTOR_LIST
            }
          ],
          name: 'has',
          type: PSEUDO_CLASS_SELECTOR
        };
        const leaves = [];
        const root = document.getElementById('div4');
        const matcher = new Matcher('div:has(> .foo.baz, > .qux) p', document);
        const res = matcher._matchLogicalPseudoClassFunc(ast, leaves, root);
        assert.deepEqual(res, [], 'result');
      });
    });

    describe('match selector', () => {
/*
      it('should throw', () => {
        const matcher = new Matcher('#div1');
        assert.throws(() => matcher._matchSelector(), TypeError);
      });

      it('should get matched nodes', () => {
        const ast = [
          {
            children: [
              {
                nth: {
                  a: '2',
                  b: '1',
                  type: AN_PLUS_B
                },
                selector: null,
                type: NTH
              }
            ],
            name: 'nth-child',
            type: PSEUDO_CLASS_SELECTOR
          },
          {
            flags: null,
            loc: null,
            matcher: null,
            name: {
              name: 'hidden',
              type: IDENTIFIER
            },
            type: ATTRIBUTE_SELECTOR,
            value: null
          }
        ];
        const node = document.createElement('div');
        node.setAttribute('hidden', 'hidden');
        document.getElementById('div5').appendChild(node);
        const matcher = new Matcher(':nth-child(2n+1)[hidden]', document);
        const res = matcher._matchSelector(ast, document.documentElement);
        assert.deepEqual(res, [node], 'result');
      });

      it('should get matched nodes', () => {
        const ast = [
          {
            name: 'div',
            type: TYPE_SELECTOR
          }
        ];
        const matcher = new Matcher('div', document);
        const res = matcher._matchSelector(ast, document.documentElement);
        assert.deepEqual(res, [
          document.getElementById('div1'),
          document.getElementById('div2'),
          document.getElementById('div3'),
          document.getElementById('div4'),
          document.getElementById('div6'),
          document.getElementById('div7'),
          document.getElementById('div8'),
          document.getElementById('div5')
        ], 'result');
      });

      it('should get matched nodes', () => {
        const ast = [
          {
            name: 'div',
            type: TYPE_SELECTOR
          },
          {
            name: 'div2',
            type: ID_SELECTOR
          }
        ];
        const matcher = new Matcher('div', document);
        const res = matcher._matchSelector(ast, document.documentElement);
        assert.deepEqual(res, [
          document.getElementById('div2')
        ], 'result');
      });

      it('should get matched nodes', () => {
        const ast = [
          {
            name: 'li',
            type: TYPE_SELECTOR
          },
          {
            children: [
              {
                nth: {
                  name: 'even',
                  type: IDENTIFIER
                },
                selector: null,
                type: NTH
              }
            ],
            name: 'nth-child',
            type: PSEUDO_CLASS_SELECTOR
          }
        ];
        const matcher = new Matcher('li:nth-child(even)', document);
        const res = matcher._matchSelector(ast, document.documentElement);
        assert.deepEqual(res, [
          document.getElementById('li2')
        ], 'result');
      });

      it('should get matched node', () => {
        const ast = [
          {
            name: 'div',
            type: TYPE_SELECTOR
          },
          {
            name: 'div1',
            type: ID_SELECTOR
          },
          {
            name: ' ',
            type: COMBINATOR
          },
          {
            name: 'ul',
            type: TYPE_SELECTOR
          },
          {
            name: '>',
            type: COMBINATOR
          },
          {
            name: 'li',
            type: TYPE_SELECTOR
          },
          {
            children: [
              {
                nth: {
                  name: 'even',
                  type: IDENTIFIER
                },
                selector: null,
                type: NTH
              }
            ],
            name: 'nth-child',
            type: PSEUDO_CLASS_SELECTOR
          }
        ];
        const node = document.getElementById('li2');
        const matcher =
          new Matcher('div#div1 ul > li:nth-child(even)', document);
        const res = matcher._matchSelector(ast, document.documentElement);
        assert.deepEqual(res, [node], 'result');
      });

      it('should get matched node', () => {
        const ast = [
          {
            name: 'div',
            type: TYPE_SELECTOR
          },
          {
            name: 'div1',
            type: ID_SELECTOR
          },
          {
            name: ' ',
            type: COMBINATOR
          },
          {
            name: 'ul',
            type: TYPE_SELECTOR
          },
          {
            name: '>',
            type: COMBINATOR
          },
          {
            name: 'li',
            type: TYPE_SELECTOR
          },
          {
            children: [
              {
                nth: {
                  name: 'odd',
                  type: IDENTIFIER
                },
                selector: null,
                type: NTH
              }
            ],
            name: 'nth-child',
            type: PSEUDO_CLASS_SELECTOR
          }
        ];
        const node1 = document.getElementById('li1');
        const node2 = document.getElementById('li3');
        const matcher =
          new Matcher('div#div1 ul > li:nth-child(odd)', document);
        const res = matcher._matchSelector(ast, document.documentElement);
        assert.deepEqual(res, [node1, node2], 'result');
      });

      it('should get matched node', () => {
        const ast = [
          {
            name: 'div',
            type: TYPE_SELECTOR
          },
          {
            name: 'div1',
            type: ID_SELECTOR
          },
          {
            name: ' ',
            type: COMBINATOR
          },
          {
            name: 'dd',
            type: TYPE_SELECTOR
          },
          {
            children: [
              {
                nth: {
                  name: 'even',
                  type: IDENTIFIER
                },
                selector: null,
                type: NTH
              }
            ],
            name: 'nth-of-type',
            type: PSEUDO_CLASS_SELECTOR
          },
          {
            name: '>',
            type: COMBINATOR
          },
          {
            name: 'span',
            type: TYPE_SELECTOR
          }
        ];
        const node = document.getElementById('span2');
        const matcher =
          new Matcher('div#div1 dd:nth-of-type(even) > span', document);
        const res = matcher._matchSelector(ast, document.documentElement);
        assert.deepEqual(res, [node], 'result');
      });

      it('should get matched node', () => {
        const ast = [
          {
            name: 'div',
            type: TYPE_SELECTOR
          },
          {
            name: 'div1',
            type: ID_SELECTOR
          },
          {
            name: ' ',
            type: COMBINATOR
          },
          {
            name: 'dd',
            type: TYPE_SELECTOR
          },
          {
            children: [
              {
                nth: {
                  name: 'odd',
                  type: IDENTIFIER
                },
                selector: null,
                type: NTH
              }
            ],
            name: 'nth-of-type',
            type: PSEUDO_CLASS_SELECTOR
          },
          {
            name: '>',
            type: COMBINATOR
          },
          {
            name: 'span',
            type: TYPE_SELECTOR
          }
        ];
        const node1 = document.getElementById('span1');
        const node2 = document.getElementById('span3');
        const matcher =
          new Matcher('div#div1 dd:nth-of-type(odd) > span', document);
        const res = matcher._matchSelector(ast, document.documentElement);
        assert.deepEqual(res, [node1, node2], 'result');
      });

      it('should get matched node', () => {
        const ast = [
          {
            name: 'ul',
            type: TYPE_SELECTOR
          },
          {
            name: '>',
            type: COMBINATOR
          },
          {
            name: 'li',
            type: TYPE_SELECTOR
          },
          {
            name: 'first-child',
            type: PSEUDO_CLASS_SELECTOR
          },
          {
            name: '+',
            type: COMBINATOR
          },
          {
            name: 'li',
            type: TYPE_SELECTOR
          }
        ];
        const matcher =
          new Matcher('ul > li:first-child + li', document);
        const res = matcher._matchSelector(ast, document.documentElement);
        assert.deepEqual(res, [
          document.getElementById('li2')
        ], 'result');
      });

      it('should get matched node', () => {
        const ast = [
          {
            name: 'dl',
            type: TYPE_SELECTOR
          },
          {
            name: '>',
            type: COMBINATOR
          },
          {
            name: 'dd',
            type: TYPE_SELECTOR
          },
          {
            children: [
              {
                nth: {
                  name: 'even',
                  type: IDENTIFIER
                },
                selector: null,
                type: NTH
              }
            ],
            name: 'nth-of-type',
            type: PSEUDO_CLASS_SELECTOR
          },
          {
            name: '>',
            type: COMBINATOR
          },
          {
            name: 'span',
            type: TYPE_SELECTOR
          }
        ];
        const node = document.getElementById('dd2').firstElementChild;
        const matcher =
          new Matcher('dl > dd:nth-of-type(even) > span', document);
        const res = matcher._matchSelector(ast, document.documentElement);
        assert.strictEqual(node.localName, 'span', 'local name');
        assert.deepEqual(res, [node], 'result');
      });

      it('should get matched node', () => {
        const ast = [
          {
            name: 'div5',
            type: ID_SELECTOR
          },
          {
            name: '>',
            type: COMBINATOR
          },
          {
            name: 'p',
            type: TYPE_SELECTOR
          },
          {
            children: [
              {
                nth: {
                  name: 'even',
                  type: IDENTIFIER
                },
                selector: null,
                type: NTH
              }
            ],
            name: 'nth-of-type',
            type: PSEUDO_CLASS_SELECTOR
          },
          {
            name: '>',
            type: COMBINATOR
          },
          {
            name: 'span',
            type: TYPE_SELECTOR
          }
        ];
        const node1 = document.createElement('p');
        const node2 = document.createElement('p');
        const node3 = document.createElement('p');
        const node4 = document.createElement('span');
        node4.id = 'span1';
        node2.appendChild(node4);
        const parent = document.getElementById('div5');
        parent.appendChild(node1);
        parent.appendChild(node2);
        parent.appendChild(node3);
        const matcher =
          new Matcher('#div5 > p:nth-of-type(even) > span', document);
        const res = matcher._matchSelector(ast, document.documentElement);
        assert.deepEqual(res, [node4], 'result');
      });

      it('should get matched node', () => {
        const ast = [
          {
            name: 'div5',
            type: ID_SELECTOR
          },
          {
            name: ' ',
            type: COMBINATOR
          },
          {
            name: 'p',
            type: TYPE_SELECTOR
          },
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        name: 'foo',
                        type: CLASS_SELECTOR
                      }
                    ],
                    type: SELECTOR
                  }
                ],
                type: SELECTOR_LIST
              }
            ],
            name: 'is',
            type: PSEUDO_CLASS_SELECTOR
          },
          {
            name: '>',
            type: COMBINATOR
          },
          {
            name: 'span',
            type: TYPE_SELECTOR
          },
          {
            name: 'first-child',
            type: CLASS_SELECTOR
          }
        ];
        const node1 = document.createElement('p');
        const node2 = document.createElement('p');
        const node3 = document.createElement('p');
        const node4 = document.createElement('span');
        node4.id = 'span1';
        node2.appendChild(node4);
        node2.classList.add('foo');
        const parent = document.getElementById('div5');
        parent.appendChild(node1);
        parent.appendChild(node2);
        parent.appendChild(node3);
        const matcher =
          new Matcher('#div5 p:is(.foo) > span:firstChild', document);
        const res = matcher._matchSelector(ast, document.documentElement);
        assert.deepEqual(res, [
          document.getElementById('span1')
        ], 'result');
      });
      */
    });

  });
});
