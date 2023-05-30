/**
 * matcher.test.js
 */
'use strict';

/* api */
const { assert } = require('chai');
const { JSDOM } = require('jsdom');
const { afterEach, beforeEach, describe, it, xit } = require('mocha');
const sinon = require('sinon');

/* test */
const matcherJs = require('../src/js/matcher.js');
const DOMException = require('../src/js/domexception.js');
const { parseSelector } = require('../src/js/parser.js');
const {
  AN_PLUS_B, ATTRIBUTE_SELECTOR, CLASS_SELECTOR, COMBINATOR, IDENTIFIER,
  ID_SELECTOR, NTH, PSEUDO_CLASS_SELECTOR, PSEUDO_ELEMENT_SELECTOR, RAW,
  SELECTOR, SELECTOR_LIST, STRING, TYPE_SELECTOR
} = require('../src/js/constant.js');

const globalKeys = ['DOMParser', 'NodeIterator'];

describe('match AST leaf and DOM node', () => {
  const domStr = `<!doctype html>
    <html lang="en">
      <head>
      </head>
      <body>
        <div id="div0">
        </div>
        <div id="div1">
          <div id="div2">
            <ul id="ul1">
              <li id="li1">foo</li>
              <li id="li2">bar</li>
              <li id="li3"></li>
            </ul>
          </div>
          <div id="div3">
            <dl id="dl1">
              <dt id="dt1"></dt>
              <dd id="dd1">
                <span id="span1" hidden></span>
              </dd>
              <dt id="dt2"></dt>
              <dd id="dd2">
                <span id="span2"></span>
              </dd>
              <dt id="dt3"></dt>
              <dd id="dd3">
                <span id="span3" hidden></span>
              </dd>
            </dl>
          </div>
          <div id="div4">
            <div id="div5" class="foo">
              <p id="p1"></p>
              <p id="p2"></p>
              <p id="p3"></p>
            </div>
            <div id="div6" class="foo bar">
              <p id="p4"></p>
              <p id="p5"></p>
              <p id="p6"></p>
            </div>
            <div id="div7" class="baz">
              <p id="p7"></p>
              <p id="p8"></p>
              <p id="p9"></p>
            </div>
          </div>
        </div>
      </body>
    </html>`;
  const domOpt = {
    runScripts: 'dangerously',
    url: 'https://localhost/#foo'
  };
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

  describe('is content editable', () => {
    const func = matcherJs.isContentEditable;

    it('should get result', () => {
      const res = func();
      assert.isFalse(res, 'result');
    });

    it('should get result', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.isFalse(res, 'result');
    });

    it('should get result', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      document.designMode = 'on';
      const res = func(node);
      assert.isTrue(res, 'result');
    });

    it('should get result', () => {
      const node = document.createElement('div');
      node.setAttribute('contenteditable', 'true');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.isTrue(res, 'result');
    });

    it('should get result', () => {
      const node = document.createElement('div');
      node.setAttribute('contenteditable', 'plaintext-only');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.isTrue(res, 'result');
    });

    it('should get result', () => {
      const node = document.createElement('div');
      node.setAttribute('contenteditable', '');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.isTrue(res, 'result');
    });

    it('should get result', () => {
      const node = document.createElement('div');
      node.setAttribute('contenteditable', 'inherit');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.isFalse(res, 'result');
    });

    it('should get result', () => {
      const node1 = document.createElement('div');
      node1.setAttribute('contenteditable', 'inherit');
      const node2 = document.createElement('div');
      node2.setAttribute('contenteditable', 'true');
      node2.appendChild(node1);
      const parent = document.getElementById('div0');
      parent.appendChild(node2);
      const res = func(node1);
      assert.isTrue(res, 'result');
    });
  });

  describe('is namespace declared', () => {
    const func = matcherJs.isNamespaceDeclared;

    it('should get result', () => {
      const res = func();
      assert.isFalse(res, 'result');
    });

    it('should get result', () => {
      const node =
        document.createElementNS('https://example.com/foo', 'foo:div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func('foo', node);
      assert.isFalse(res, 'result');
    });

    it('should get result', () => {
      const node =
        document.createElementNS('https://example.com/foo', 'foo:div');
      node.setAttribute('xmlns:foo', 'https://example.com/foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func('foo', node);
      assert.isTrue(res, 'result');
    });

    it('should get result', () => {
      const frag = document.createDocumentFragment();
      const node =
        document.createElementNS('https://example.com/foo', 'foo:div');
      frag.appendChild(node);
      const res = func('foo', node);
      assert.isFalse(res, 'result');
    });
  });

  describe('is node attached to owner document', () => {
    const func = matcherJs.isAttached;

    it('should get result', () => {
      const node = document.documentElement;
      const res = func(node);
      assert.isTrue(res, 'result');
    });

    it('should get result', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.isTrue(res, 'result');
    });

    it('should get result', () => {
      const node = document.createElement('div');
      const res = func(node);
      assert.isFalse(res, 'result');
    });

    it('should get result', () => {
      const frag = document.createDocumentFragment();
      const node = document.createElement('div');
      frag.appendChild(node);
      const res = func(node);
      assert.isFalse(res, 'result');
    });
  });

  describe('create CSS selector for node', () => {
    const func = matcherJs.createSelectorForNode;

    it('should get null', () => {
      const res = func();
      assert.isNull(res, 'result');
    });

    it('should get value', () => {
      const node = document.createElement('div');
      const res = func(node);
      assert.strictEqual(res, 'div', 'result');
    });

    it('should get value', () => {
      const node = document.createElement('div');
      node.id = 'foo';
      const res = func(node);
      assert.strictEqual(res, 'div#foo', 'result');
    });

    it('should get value', () => {
      const node = document.createElement('div');
      node.classList.add('bar');
      node.classList.add('baz');
      const res = func(node);
      assert.strictEqual(res, 'div.bar.baz', 'result');
    });

    it('should get value', () => {
      const node = document.createElement('div');
      node.id = 'foo';
      node.classList.add('bar');
      node.classList.add('baz');
      const res = func(node);
      assert.strictEqual(res, 'div#foo.bar.baz', 'result');
    });
  });

  describe('unescape selector', () => {
    const func = matcherJs.unescapeSelector;

    it('should get value', () => {
      const res = func();
      assert.strictEqual(res, '', 'result');
    });

    it('should get value', () => {
      const res = func('');
      assert.strictEqual(res, '', 'result');
    });

    it('should get replaced value', () => {
      const res = func('\\');
      assert.strictEqual(res, '\uFFFD', 'result');
    });

    it('should get value', () => {
      const res = func('\\global');
      assert.strictEqual(res, 'global', 'result');
    });

    it('should get value', () => {
      const res = func('\\n');
      assert.strictEqual(res, 'n', 'result');
    });

    it('should get value', () => {
      const res = func('\\\n');
      assert.strictEqual(res, '\\\n', 'result');
    });

    it('should get replaced value', () => {
      const res = func('\\0');
      assert.strictEqual(res, '\uFFFD', 'result');
    });

    it('should get replaced value', () => {
      const res = func('\\000000');
      assert.strictEqual(res, '\uFFFD', 'result');
    });

    it('should get value', () => {
      const res = func('\\30');
      assert.strictEqual(res, '0', 'result');
    });

    it('should get value', () => {
      const res = func('\\30 \\30 ');
      assert.strictEqual(res, '00', 'result');
    });

    it('should get value', () => {
      const res = func('\\41');
      assert.strictEqual(res, 'A', 'result');
    });

    it('should get value', () => {
      const res = func('hel\\6Co');
      assert.strictEqual(res, 'hello', 'result');
    });

    it('should get value', () => {
      const res = func('hel\\6C o');
      assert.strictEqual(res, 'hello', 'result');
    });

    it('should get value', () => {
      const res = func('\\26 B');
      assert.strictEqual(res, '&B', 'result');
    });

    it('should get replaced value', () => {
      const res = func('\\D83D \\DE00 ');
      assert.strictEqual(res, '\u{FFFD}\u{FFFD}', 'result');
    });

    it('should get value', () => {
      const res = func('\\1f511 ');
      assert.strictEqual(res, '\u{1F511}', 'result');
    });

    it('should get replaced value', () => {
      const res = func('\\2F804 ');
      assert.strictEqual(res, '\u{2F804}', 'result');
    });

    it('should get replaced value', () => {
      const res = func('\\10FFFF ');
      assert.strictEqual(res, '\u{10FFFF}', 'result');
    });

    it('should get replaced value', () => {
      const res = func('\\10FFFF0');
      assert.strictEqual(res, '\u{10FFFF}0', 'result');
    });

    it('should get replaced value', () => {
      const res = func('\\110000 ');
      assert.strictEqual(res, '\uFFFD', 'result');
    });

    it('should get replaced value', () => {
      const res = func('\\ffffff ');
      assert.strictEqual(res, '\uFFFD', 'result');
    });
  });

  describe('group AST leaves', () => {
    const func = matcherJs.groupASTLeaves;

    it('should get empty array', () => {
      const res = func();
      assert.deepEqual(res, [], 'result');
    });

    it('should get value', () => {
      const res = func([{
        name: 'foo',
        type: TYPE_SELECTOR
      },
      {
        name: 'bar',
        type: CLASS_SELECTOR
      },
      {
        name: ' ',
        type: COMBINATOR
      },
      {
        name: 'baz',
        type: TYPE_SELECTOR
      }]);
      assert.deepEqual(res, [{
        combo: {
          name: ' ',
          type: COMBINATOR
        },
        leaves: [{
          name: 'foo',
          type: TYPE_SELECTOR
        },
        {
          name: 'bar',
          type: CLASS_SELECTOR
        }],
        nodes: new Set()
      },
      {
        combo: null,
        leaves: [{
          name: 'baz',
          type: TYPE_SELECTOR
        }],
        nodes: new Set()
      }], 'result');
    });
  });

  describe('collect nth child', () => {
    const func = matcherJs.collectNthChild;

    it('should get empty array', () => {
      const res = func();
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array', () => {
      const anb = {
        a: 0,
        b: -1
      };
      const node = document.getElementById('dt1');
      const res = func(anb, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array', () => {
      const anb = {
        a: 0,
        b: 6,
        reverse: true
      };
      const node = document.getElementById('dt1');
      const res = func(anb, node);
      assert.deepEqual(res, [
        node
      ], 'result');
    });

    it('should get empty array', () => {
      const anb = {
        a: -1,
        b: 0,
        reverse: true
      };
      const node = document.getElementById('dt1');
      const res = func(anb, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array', () => {
      const anb = {
        a: 0,
        b: 0
      };
      const node = document.getElementById('dt1');
      const res = func(anb, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array', () => {
      const anb = {
        a: 0,
        b: 0,
        reverse: true
      };
      const node = document.getElementById('dt1');
      const res = func(anb, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const anb = {
        a: 0,
        b: 1
      };
      const node = document.getElementById('dt1');
      const res = func(anb, node);
      assert.deepEqual(res, [
        document.getElementById('dt1')
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const anb = {
        a: 0,
        b: 1,
        reverse: true
      };
      const node = document.getElementById('dt1');
      const res = func(anb, node);
      assert.deepEqual(res, [
        document.getElementById('dd3')
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const anb = {
        a: 1,
        b: 0
      };
      const node = document.getElementById('dt1');
      const res = func(anb, node);
      assert.deepEqual(res, [
        node,
        document.getElementById('dd1'),
        document.getElementById('dt2'),
        document.getElementById('dd2'),
        document.getElementById('dt3'),
        document.getElementById('dd3')
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const anb = {
        a: 1,
        b: 1
      };
      const node = document.getElementById('dt1');
      const res = func(anb, node);
      assert.deepEqual(res, [
        node,
        document.getElementById('dd1'),
        document.getElementById('dt2'),
        document.getElementById('dd2'),
        document.getElementById('dt3'),
        document.getElementById('dd3')
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const anb = {
        a: 2,
        b: 0
      };
      const node = document.getElementById('dt1');
      const res = func(anb, node);
      assert.deepEqual(res, [
        document.getElementById('dd1'),
        document.getElementById('dd2'),
        document.getElementById('dd3')
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const anb = {
        a: 2,
        b: 1
      };
      const node = document.getElementById('dt1');
      const res = func(anb, node);
      assert.deepEqual(res, [
        node,
        document.getElementById('dt2'),
        document.getElementById('dt3')
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const anb = {
        a: 2,
        b: -1
      };
      const node = document.getElementById('dt1');
      const res = func(anb, node);
      assert.deepEqual(res, [
        node,
        document.getElementById('dt2'),
        document.getElementById('dt3')
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const ul = document.createElement('ul');
      const l1 = document.createElement('li');
      const l2 = document.createElement('li');
      const l3 = document.createElement('li');
      const l4 = document.createElement('li');
      const l5 = document.createElement('li');
      const l6 = document.createElement('li');
      const l7 = document.createElement('li');
      const l8 = document.createElement('li');
      const l9 = document.createElement('li');
      const l10 = document.createElement('li');
      l1.id = 'l1';
      l2.id = 'l2';
      l3.id = 'l3';
      l4.id = 'l4';
      l5.id = 'l5';
      l6.id = 'l6';
      l7.id = 'l7';
      l8.id = 'l8';
      l9.id = 'l9';
      l10.id = 'l10';
      l2.classList.add('noted');
      l4.classList.add('noted');
      l7.classList.add('noted');
      l10.classList.add('noted');
      ul.appendChild(l1);
      ul.appendChild(l2);
      ul.appendChild(l3);
      ul.appendChild(l4);
      ul.appendChild(l5);
      ul.appendChild(l6);
      ul.appendChild(l7);
      ul.appendChild(l8);
      ul.appendChild(l9);
      ul.appendChild(l10);
      const parent = document.getElementById('div0');
      parent.appendChild(ul);
      const anb = {
        a: 0,
        b: 1,
        selector: '.noted'
      };
      const res = func(anb, l1);
      assert.deepEqual(res, [
        l2
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const ul = document.createElement('ul');
      const l1 = document.createElement('li');
      const l2 = document.createElement('li');
      const l3 = document.createElement('li');
      const l4 = document.createElement('li');
      const l5 = document.createElement('li');
      const l6 = document.createElement('li');
      const l7 = document.createElement('li');
      const l8 = document.createElement('li');
      const l9 = document.createElement('li');
      const l10 = document.createElement('li');
      l1.id = 'l1';
      l2.id = 'l2';
      l3.id = 'l3';
      l4.id = 'l4';
      l5.id = 'l5';
      l6.id = 'l6';
      l7.id = 'l7';
      l8.id = 'l8';
      l9.id = 'l9';
      l10.id = 'l10';
      l2.classList.add('noted');
      l4.classList.add('noted');
      l7.classList.add('noted');
      l10.classList.add('noted');
      ul.appendChild(l1);
      ul.appendChild(l2);
      ul.appendChild(l3);
      ul.appendChild(l4);
      ul.appendChild(l5);
      ul.appendChild(l6);
      ul.appendChild(l7);
      ul.appendChild(l8);
      ul.appendChild(l9);
      ul.appendChild(l10);
      const parent = document.getElementById('div0');
      parent.appendChild(ul);
      const anb = {
        a: 2,
        b: 0,
        selector: '.noted'
      };
      const res = func(anb, l1);
      assert.deepEqual(res, [
        l4,
        l10
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const ul = document.createElement('ul');
      const l1 = document.createElement('li');
      const l2 = document.createElement('li');
      const l3 = document.createElement('li');
      const l4 = document.createElement('li');
      const l5 = document.createElement('li');
      const l6 = document.createElement('li');
      const l7 = document.createElement('li');
      const l8 = document.createElement('li');
      const l9 = document.createElement('li');
      const l10 = document.createElement('li');
      l1.id = 'l1';
      l2.id = 'l2';
      l3.id = 'l3';
      l4.id = 'l4';
      l5.id = 'l5';
      l6.id = 'l6';
      l7.id = 'l7';
      l8.id = 'l8';
      l9.id = 'l9';
      l10.id = 'l10';
      l2.classList.add('noted');
      l4.classList.add('noted');
      l7.classList.add('noted');
      l10.classList.add('noted');
      ul.appendChild(l1);
      ul.appendChild(l2);
      ul.appendChild(l3);
      ul.appendChild(l4);
      ul.appendChild(l5);
      ul.appendChild(l6);
      ul.appendChild(l7);
      ul.appendChild(l8);
      ul.appendChild(l9);
      ul.appendChild(l10);
      const parent = document.getElementById('div0');
      parent.appendChild(ul);
      const anb = {
        a: 2,
        b: 1,
        selector: '.noted'
      };
      const res = func(anb, l1);
      assert.deepEqual(res, [
        l2,
        l7
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const ul = document.createElement('ul');
      const l1 = document.createElement('li');
      const l2 = document.createElement('li');
      const l3 = document.createElement('li');
      const l4 = document.createElement('li');
      const l5 = document.createElement('li');
      const l6 = document.createElement('li');
      const l7 = document.createElement('li');
      const l8 = document.createElement('li');
      const l9 = document.createElement('li');
      const l10 = document.createElement('li');
      l1.id = 'l1';
      l2.id = 'l2';
      l3.id = 'l3';
      l4.id = 'l4';
      l5.id = 'l5';
      l6.id = 'l6';
      l7.id = 'l7';
      l8.id = 'l8';
      l9.id = 'l9';
      l10.id = 'l10';
      l2.classList.add('noted');
      l4.classList.add('noted');
      l7.classList.add('noted');
      l10.classList.add('noted');
      ul.appendChild(l1);
      ul.appendChild(l2);
      ul.appendChild(l3);
      ul.appendChild(l4);
      ul.appendChild(l5);
      ul.appendChild(l6);
      ul.appendChild(l7);
      ul.appendChild(l8);
      ul.appendChild(l9);
      ul.appendChild(l10);
      const parent = document.getElementById('div0');
      parent.appendChild(ul);
      const anb = {
        a: -1,
        b: 3,
        selector: '.noted'
      };
      const res = func(anb, l1);
      assert.deepEqual(res, [
        l2,
        l4,
        l7
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
      const anb = {
        a: 0,
        b: -1
      };
      const node = document.getElementById('dt1');
      const res = func(anb, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array', () => {
      const anb = {
        a: 0,
        b: 6
      };
      const node = document.getElementById('dt1');
      const res = func(anb, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array', () => {
      const anb = {
        a: -1,
        b: 0
      };
      const node = document.getElementById('dt1');
      const res = func(anb, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array', () => {
      const anb = {
        a: 0,
        b: 0
      };
      const node = document.getElementById('dt1');
      const res = func(anb, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const anb = {
        a: 0,
        b: 1
      };
      const node = document.getElementById('dt1');
      const res = func(anb, node);
      assert.deepEqual(res, [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const anb = {
        a: 0,
        b: 1,
        reverse: true
      };
      const node = document.getElementById('dt1');
      const res = func(anb, node);
      assert.deepEqual(res, [
        document.getElementById('dt3')
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const anb = {
        a: 0,
        b: 2
      };
      const node = document.getElementById('dt1');
      const res = func(anb, node);
      assert.deepEqual(res, [
        document.getElementById('dt2')
      ], 'result');
    });

    it('should not match', () => {
      const anb = {
        a: 0,
        b: 3
      };
      const node = document.getElementById('dt3');
      const res = func(anb, node);
      assert.deepEqual(res, [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const anb = {
        a: 1,
        b: 0
      };
      const node = document.getElementById('dt1');
      const res = func(anb, node);
      assert.deepEqual(res, [
        node,
        document.getElementById('dt2'),
        document.getElementById('dt3')
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const anb = {
        a: 1,
        b: 1
      };
      const node = document.getElementById('dt1');
      const res = func(anb, node);
      assert.deepEqual(res, [
        node,
        document.getElementById('dt2'),
        document.getElementById('dt3')
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const anb = {
        a: 1,
        b: -1
      };
      const node = document.getElementById('dt1');
      const res = func(anb, node);
      assert.deepEqual(res, [
        node,
        document.getElementById('dt2'),
        document.getElementById('dt3')
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const anb = {
        a: 2,
        b: 0
      };
      const node = document.getElementById('dt1');
      const res = func(anb, node);
      assert.deepEqual(res, [
        document.getElementById('dt2')
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const anb = {
        a: 2,
        b: 1
      };
      const node = document.getElementById('dt1');
      const res = func(anb, node);
      assert.deepEqual(res, [
        node,
        document.getElementById('dt3')
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const anb = {
        a: -1,
        b: 2
      };
      const node = document.getElementById('dt1');
      const res = func(anb, node);
      assert.deepEqual(res, [
        node,
        document.getElementById('dt2')
      ], 'result');
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

    it('should get matched node(s)', () => {
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

    it('should get matched node(s)', () => {
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

    it('should get matched node(s)', () => {
      const leafName = 'nth-child';
      const leaf = {
        nth: {
          name: 'odd',
          type: IDENTIFIER
        },
        selector: {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: 'dt',
                  type: TYPE_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        type: NTH
      };
      const node = document.getElementById('dt1');
      const res = func(leafName, leaf, node);
      assert.deepEqual(res, [
        node,
        document.getElementById('dt3')
      ], 'result');
    });

    it('should get matched node(s)', () => {
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

    it('should get matched node(s)', () => {
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

    it('should get matched node(s)', () => {
      const leafName = 'nth-child';
      const leaf = {
        nth: {
          a: '2',
          type: AN_PLUS_B
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

    it('should get matched node(s)', () => {
      const leafName = 'nth-child';
      const leaf = {
        nth: {
          b: '3',
          type: AN_PLUS_B
        },
        selector: null,
        type: NTH
      };
      const node = document.getElementById('dt2');
      const res = func(leafName, leaf, node);
      assert.deepEqual(res, [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leafName = 'nth-child';
      const leaf = {
        nth: {
          b: '1',
          type: AN_PLUS_B
        },
        selector: null,
        type: NTH
      };
      const node = document.getElementById('dt1');
      const res = func(leafName, leaf, node);
      assert.deepEqual(res, [
        document.getElementById('dt1')
      ], 'result');
    });

    it('should get matched node(s)', () => {
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

    it('should get matched node(s)', () => {
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

    it('should get matched node(s)', () => {
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

    it('should get matched node(s)', () => {
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

    it('should get matched node(s)', () => {
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

    it('should get matched node(s)', () => {
      const leafName = 'nth-of-type';
      const leaf = {
        nth: {
          a: '2',
          type: AN_PLUS_B
        },
        selector: null,
        type: NTH
      };
      const node = document.getElementById('dt2');
      const res = func(leafName, leaf, node);
      assert.deepEqual(res, [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leafName = 'nth-of-type';
      const leaf = {
        nth: {
          b: '3',
          type: AN_PLUS_B
        },
        selector: null,
        type: NTH
      };
      const node = document.getElementById('dt3');
      const res = func(leafName, leaf, node);
      assert.deepEqual(res, [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
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

  describe('match combinator', () => {
    const func = matcherJs.matchCombinator;

    it('should get empty array', () => {
      const res = func();
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array', () => {
      const res = func({
        name: '^',
        type: COMBINATOR
      });
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array', () => {
      const res = func({
        name: '>',
        type: COMBINATOR
      });
      assert.deepEqual(res, [], 'result');
    });

    it('should get empty array', () => {
      const res = func({
        name: '>',
        type: COMBINATOR
      },
      [
        document.getElementById('div1')
      ]);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const res = func({
        name: '+',
        type: COMBINATOR
      },
      [
        document.getElementById('dt1')
      ],
      [
        document.getElementById('dd1'),
        document.getElementById('dt2'),
        document.getElementById('dd2'),
        document.getElementById('dt3'),
        document.getElementById('dd3')
      ]);
      assert.deepEqual(res, [
        document.getElementById('dd1')
      ], 'result');
    });

    it('should not match', () => {
      const res = func({
        name: '+',
        type: COMBINATOR
      },
      [
        document.getElementById('dt2')
      ],
      [
        document.getElementById('dt1'),
        document.getElementById('dd1'),
        document.getElementById('dt2')
      ]);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const res = func({
        name: '~',
        type: COMBINATOR
      },
      [
        document.getElementById('dt2')
      ],
      [
        document.getElementById('dt1'),
        document.getElementById('dd1'),
        document.getElementById('dt2'),
        document.getElementById('dd2'),
        document.getElementById('dt3'),
        document.getElementById('dd3')
      ]);
      assert.deepEqual(res, [
        document.getElementById('dd2'),
        document.getElementById('dt3'),
        document.getElementById('dd3')
      ], 'result');
    });

    it('should not match', () => {
      const res = func({
        name: '~',
        type: COMBINATOR
      },
      [
        document.getElementById('dt2')
      ],
      [
        document.getElementById('dt1'),
        document.getElementById('dd1')
      ]);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const res = func({
        name: '>',
        type: COMBINATOR
      },
      [
        document.getElementById('dl1')
      ],
      [
        document.getElementById('dt1'),
        document.getElementById('dd1'),
        document.getElementById('dt2'),
        document.getElementById('dd2'),
        document.getElementById('dt3'),
        document.getElementById('dd3')
      ]);
      assert.deepEqual(res, [
        document.getElementById('dt1'),
        document.getElementById('dd1'),
        document.getElementById('dt2'),
        document.getElementById('dd2'),
        document.getElementById('dt3'),
        document.getElementById('dd3')
      ], 'result');
    });

    it('should not match', () => {
      const res = func({
        name: '>',
        type: COMBINATOR
      },
      [
        document.getElementById('ul1')
      ],
      [
        document.getElementById('dt1'),
        document.getElementById('dd1'),
        document.getElementById('dt2'),
        document.getElementById('dd2'),
        document.getElementById('dt3'),
        document.getElementById('dd3')
      ]);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const res = func({
        name: ' ',
        type: COMBINATOR
      },
      [
        document.getElementById('div3')
      ],
      [
        document.getElementById('dt1'),
        document.getElementById('dd1'),
        document.getElementById('dt2'),
        document.getElementById('dd2'),
        document.getElementById('dt3'),
        document.getElementById('dd3')
      ]);
      assert.deepEqual(res, [
        document.getElementById('dt1'),
        document.getElementById('dd1'),
        document.getElementById('dt2'),
        document.getElementById('dd2'),
        document.getElementById('dt3'),
        document.getElementById('dd3')
      ], 'result');
    });

    it('should not match', () => {
      const res = func({
        name: '>',
        type: COMBINATOR
      },
      [
        document.getElementById('div0')
      ],
      [
        document.getElementById('dt1'),
        document.getElementById('dd1'),
        document.getElementById('dt2'),
        document.getElementById('dd2'),
        document.getElementById('dt3'),
        document.getElementById('dd3')
      ]);
      assert.deepEqual(res, [], 'result');
    });
  });

  describe('match type selector', () => {
    const func = matcherJs.matchTypeSelector;

    it('should get null', () => {
      const res = func();
      assert.isNull(res, 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        name: '|*',
        type: TYPE_SELECTOR
      };
      const node = document.createElementNS('', 'div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        name: '|*',
        type: TYPE_SELECTOR
      };
      const node = document.getElementById('div0');
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should not match', () => {
      const leaf = {
        name: '|*',
        type: TYPE_SELECTOR
      };
      const node =
        document.createElementNS('https://example.com/foo', 'div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: '*|*',
        type: TYPE_SELECTOR
      };
      const node = document.getElementById('div0');
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
      node.setAttribute('xmlns:foo', 'https://example.com/foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should throw', () => {
      const leaf = {
        name: 'foo|*',
        type: TYPE_SELECTOR
      };
      const node =
        document.createElementNS('https://example.com/foo', 'foo:bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      assert.throws(() => func(leaf, node), DOMException);
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'foo|*',
        type: TYPE_SELECTOR
      };
      const node =
        document.createElementNS('https://example.com/foo', 'foo:bar');
      node.setAttribute('xmlns:foo', 'https://example.com/foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        name: 'foo|*',
        type: TYPE_SELECTOR
      };
      const node = document.getElementById('div0');
      node.setAttribute('xmlns:foo', 'https://example.com/foo');
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
      const parent = document.getElementById('div0');
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
      node.setAttribute('xmlns:foo', 'https://example.com/foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: '|div',
        type: TYPE_SELECTOR
      };
      const node = document.createElementNS('', 'div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        name: '|div',
        type: TYPE_SELECTOR
      };
      const node = document.getElementById('div0');
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'foo',
        type: TYPE_SELECTOR
      };
      const node = document.createElementNS('', 'foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'h',
        type: TYPE_SELECTOR
      };
      const node = document.createElementNS('urn:ns', 'h');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: '*|h',
        type: TYPE_SELECTOR
      };
      const node = document.createElementNS('urn:ns', 'h');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: '*',
        type: TYPE_SELECTOR
      };
      const node = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'div',
        type: TYPE_SELECTOR
      };
      const node = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: '*|div',
        type: TYPE_SELECTOR
      };
      const node =
        document.createElementNS('https://example.com/foo', 'foo:div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const domStr = `<!doctype html>
      <html>
        <body>
          <foo:bar xmlns:foo="https://example.com/foo" id="foobar">
            <foo:baz/>
            <foo:qux/>
          </foo:bar>
        </body>
      </html>`;
      const doc = new DOMParser().parseFromString(domStr, 'text/html');
      const leaf = {
        name: 'foo|bar',
        type: TYPE_SELECTOR
      };
      const node = doc.getElementById('foobar');
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'null',
        type: TYPE_SELECTOR
      };
      const node = document.createElement('null');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'undefined',
        type: TYPE_SELECTOR
      };
      const node = document.createElement('undefined');
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });
  });

  describe('match id selector', () => {
    const func = matcherJs.matchIDSelector;

    it('should get null', () => {
      const res = func();
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'div0',
        type: ID_SELECTOR
      };
      const node = document.getElementById('div0');
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        name: 'foo',
        type: ID_SELECTOR
      };
      const node = document.getElementById('div0');
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'foo\\ bar',
        type: ID_SELECTOR
      };
      const node = document.createElement('div');
      node.setAttribute('id', 'foo bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });
  });

  describe('match attribute selector', () => {
    const func = matcherJs.matchAttributeSelector;

    it('should get null', () => {
      const res = func();
      assert.isNull(res, 'result');
    });

    it('should throw', () => {
      const leaf = {
        flags: 'baz',
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
      node.setAttribute('foo', 'bar baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      assert.throws(() => func(leaf, node), DOMException);
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: 'i',
        matcher: null,
        name: {
          name: '|Foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: 's',
        matcher: null,
        name: {
          name: 'Baz|Foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'Baz:Foo', 'Qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        flags: 'i',
        matcher: null,
        name: {
          name: 'Baz|Foo',
          type: IDENTIFIER
        },
        type: ATTRIBUTE_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'Qux');
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
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
          value: ''
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz qux');
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
          value: ''
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz-bar');
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
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
          value: ''
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar baz');
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
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
          value: ''
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz Bar');
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
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
          value: ''
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz Bar qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should throw', () => {
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      assert.throws(() => func(leaf, node), DOMException);
    });
  });

  describe('match logical pseudo-class function', () => {
    const func = matcherJs.matchLogicalPseudoFunc;

    it('should get matched node', () => {
      const leaf = {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    name: 'ul',
                    type: TYPE_SELECTOR
                  }
                ],
                loc: null,
                type: SELECTOR
              },
              {
                children: [
                  {
                    loc: null,
                    name: '>',
                    type: COMBINATOR
                  },
                  {
                    loc: null,
                    name: 'dl',
                    type: TYPE_SELECTOR
                  }
                ],
                loc: null,
                type: SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR_LIST
          }
        ],
        loc: null,
        name: 'has',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.getElementById('div1');
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    name: 'ul',
                    type: TYPE_SELECTOR
                  }
                ],
                loc: null,
                type: SELECTOR
              },
              {
                children: [
                  {
                    loc: null,
                    name: '>',
                    type: COMBINATOR
                  },
                  {
                    loc: null,
                    name: 'dl',
                    type: TYPE_SELECTOR
                  }
                ],
                loc: null,
                type: SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR_LIST
          }
        ],
        loc: null,
        name: 'has',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.getElementById('div0');
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const domStr = `<div class="foo">
        <p class="bar">foo bar</p>
      </div>`;
      const leaf = {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    name: '>',
                    type: COMBINATOR
                  },
                  {
                    loc: null,
                    name: 'p',
                    type: TYPE_SELECTOR
                  },
                  {
                    loc: null,
                    name: 'bar',
                    type: CLASS_SELECTOR
                  }
                ],
                loc: null,
                type: SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR_LIST
          }
        ],
        loc: null,
        name: 'has',
        type: PSEUDO_CLASS_SELECTOR
      };
      const parent = document.getElementById('div0');
      parent.innerHTML = domStr;
      const node = parent.firstElementChild;
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        children: [
                          {
                            children: [
                              {
                                loc: null,
                                name: 'li',
                                type: TYPE_SELECTOR
                              }
                            ],
                            loc: null,
                            type: SELECTOR
                          }
                        ],
                        loc: null,
                        type: SELECTOR_LIST
                      }
                    ],
                    loc: null,
                    name: 'has',
                    type: PSEUDO_CLASS_SELECTOR
                  }
                ],
                loc: null,
                type: SELECTOR
              },
              {
                children: [
                  {
                    loc: null,
                    name: 'ul',
                    type: TYPE_SELECTOR
                  }
                ],
                loc: null,
                type: SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR_LIST
          }
        ],
        loc: null,
        name: 'has',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.getElementById('div1');
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    name: 'ol',
                    type: TYPE_SELECTOR
                  }
                ],
                loc: null,
                type: SELECTOR
              },
              {
                children: [
                  {
                    loc: null,
                    name: 'dl',
                    type: TYPE_SELECTOR
                  }
                ],
                loc: null,
                type: SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR_LIST
          }
        ],
        loc: null,
        name: 'not',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.getElementById('ul1');
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    name: 'ul',
                    type: TYPE_SELECTOR
                  }
                ],
                loc: null,
                type: SELECTOR
              },
              {
                children: [
                  {
                    loc: null,
                    name: 'dl',
                    type: TYPE_SELECTOR
                  }
                ],
                loc: null,
                type: SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR_LIST
          }
        ],
        loc: null,
        name: 'not',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.getElementById('dl1');
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        children: [
                          {
                            children: [
                              {
                                loc: null,
                                name: 'li',
                                type: TYPE_SELECTOR
                              }
                            ],
                            loc: null,
                            type: SELECTOR
                          }
                        ],
                        loc: null,
                        type: SELECTOR_LIST
                      }
                    ],
                    loc: null,
                    name: 'not',
                    type: PSEUDO_CLASS_SELECTOR
                  }
                ],
                loc: null,
                type: SELECTOR
              },
              {
                children: [
                  {
                    loc: null,
                    name: 'ul',
                    type: TYPE_SELECTOR
                  }
                ],
                loc: null,
                type: SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR_LIST
          }
        ],
        loc: null,
        name: 'not',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.getElementById('dl1');
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    name: 'ul',
                    type: TYPE_SELECTOR
                  }
                ],
                loc: null,
                type: SELECTOR
              },
              {
                children: [
                  {
                    loc: null,
                    name: 'dl',
                    type: TYPE_SELECTOR
                  }
                ],
                loc: null,
                type: SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR_LIST
          }
        ],
        loc: null,
        name: 'is',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.getElementById('ul1');
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    name: 'ol',
                    type: TYPE_SELECTOR
                  }
                ],
                loc: null,
                type: SELECTOR
              },
              {
                children: [
                  {
                    loc: null,
                    name: 'dl',
                    type: TYPE_SELECTOR
                  }
                ],
                loc: null,
                type: SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR_LIST
          }
        ],
        loc: null,
        name: 'is',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.getElementById('ul1');
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    name: 'ul',
                    type: TYPE_SELECTOR
                  }
                ],
                loc: null,
                type: SELECTOR
              },
              {
                children: [
                  {
                    loc: null,
                    name: 'dl',
                    type: TYPE_SELECTOR
                  }
                ],
                loc: null,
                type: SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR_LIST
          }
        ],
        loc: null,
        name: 'where',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.getElementById('ul1');
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    name: 'ol',
                    type: TYPE_SELECTOR
                  }
                ],
                loc: null,
                type: SELECTOR
              },
              {
                children: [
                  {
                    loc: null,
                    name: 'dl',
                    type: TYPE_SELECTOR
                  }
                ],
                loc: null,
                type: SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR_LIST
          }
        ],
        loc: null,
        name: 'where',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.getElementById('ul1');
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        children: [
                          {
                            children: [
                              {
                                loc: null,
                                name: 'li',
                                type: TYPE_SELECTOR
                              }
                            ],
                            loc: null,
                            type: SELECTOR
                          },
                          {
                            children: [
                              {
                                loc: null,
                                name: 'dd',
                                type: TYPE_SELECTOR
                              }
                            ],
                            loc: null,
                            type: SELECTOR
                          }
                        ],
                        loc: null,
                        type: SELECTOR_LIST
                      }
                    ],
                    loc: null,
                    name: 'is',
                    type: PSEUDO_CLASS_SELECTOR
                  }
                ],
                loc: null,
                type: SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR_LIST
          }
        ],
        loc: null,
        name: 'not',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.getElementById('dt2');
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });
  });

  describe('match directionality pseudo-class', () => {
    const func = matcherJs.matchDirectionPseudoClass;

    it('should get null', () => {
      const res = func();
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const node = document.createElement('bdo');
      node.setAttribute('dir', 'ltr');
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('dir', 'ltr');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'rtl',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('dir', 'rtl');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const root = document.documentElement;
      const res = func(leaf, root);
      assert.deepEqual(res, root, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'tel');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'tel');
      node.setAttribute('dir', 'foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should throw', () => {
      const leaf = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'tel');
      node.setAttribute('dir', 'auto');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      assert.throws(() => func(leaf, node), DOMException);
    });

    it('should throw', () => {
      const leaf = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const node = document.createElement('textarea');
      node.setAttribute('dir', 'auto');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      assert.throws(() => func(leaf, node), DOMException);
    });

    it('should throw', () => {
      const leaf = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const node = document.createElement('input');
      node.setAttribute('dir', 'auto');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      assert.throws(() => func(leaf, node), DOMException);
    });

    it('should throw', () => {
      const leaf = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.setAttribute('dir', 'auto');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      assert.throws(() => func(leaf, node), DOMException);
    });

    it('should throw', () => {
      const leaf = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('dir', 'auto');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      assert.throws(() => func(leaf, node), DOMException);
    });

    it('should throw', () => {
      const leaf = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const node = document.createElement('bdi');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      assert.throws(() => func(leaf, node), DOMException);
    });

    it('should throw', () => {
      const leaf = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const node = document.createElement('bdi');
      node.setAttribute('dir', 'foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      assert.throws(() => func(leaf, node), DOMException);
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'rtl',
        type: IDENTIFIER
      };
      const root = document.documentElement;
      root.setAttribute('dir', 'rtl');
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      parent.setAttribute('dir', 'ltr');
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });
  });

  describe('match language pseudo-class', () => {
    const func = matcherJs.matchLanguagePseudoClass;

    it('should get null', () => {
      const res = func();
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: '',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('lang', '');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: '*',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const leaf = {
        name: '*',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('lang', '');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        name: 'en',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'en');
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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

    it('should get matched node(s)', () => {
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

    it('should get matched node(s)', () => {
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

    it('should get matched node(s)', () => {
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

    it('should get matched node(s)', () => {
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

    it('should get matched node(s)', () => {
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should throw', () => {
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      assert.throws(() => func(leaf, node), DOMException);
    });

    it('should throw', () => {
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      assert.throws(() => func(leaf, node), DOMException);
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'any-link',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttribute('href', 'https://example.com/');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    // FIXME:
    xit('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'any-link',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
        'https://example.com/');
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'link',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttribute('href', 'https://example.com/');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    // FIXME:
    xit('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'link',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
        'https://example.com/');
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'local-link',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttribute('href', './#foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'local-link',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttribute('href', './#bar');
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'target',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    // FIXME:
    xit('should get matched node(s)', () => {
      const src = `data:text/html,
        <html>
          <body>
            <script>window.addEventListener('load', function() {
              const data = {
                foo_matches_target_selector: document.getElementById('foo').matches(':target'),
                body_html: document.body.innerHTML,
              };
              parent.postMessage(data, '*');
            });</script>
            <p id="foo">This should be the only visible text.</p>
          </body>
        </html>#foo`.replace('\n', '');
      const leaf = {
        children: null,
        name: 'target',
        type: PSEUDO_CLASS_SELECTOR
      };
      const iframe = document.createElement('iframe');
      iframe.src = src;
      const parent = document.getElementById('div0');
      parent.appendChild(iframe);
      const node = iframe.contentDocument.getElementById('foo');
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'target-within',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'target-within',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, parent);
      assert.deepEqual(res, [parent], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'target-within',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'bar';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, parent);
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'target-within',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const target = document.getElementById('div1');
      const res = func(leaf, target);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'scope',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node, document);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'scope',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, document.documentElement, document);
      assert.deepEqual(res, [document.documentElement], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      node.focus();
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      node.focus();
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      node.focus();
      const res = func(leaf, parent);
      assert.deepEqual(res, [parent], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      node.focus();
      const target = document.getElementById('div1');
      const res = func(leaf, target);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'open',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('details');
      node.setAttribute('open', 'open');
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'closed',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('details');
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'disabled',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('disabled', 'disabled');
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'disabled',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('x-input');
      node.setAttribute('disabled', 'disabled');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'disabled',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node1 = document.createElement('input');
      const node2 = document.createElement('fieldset');
      node2.setAttribute('disabled', 'disabled');
      node2.appendChild(node1);
      const parent = document.getElementById('div0');
      parent.appendChild(node2);
      const res = func(leaf, node1);
      assert.deepEqual(res, [node1], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'disabled',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node1 = document.createElement('input');
      const node2 = document.createElement('legend');
      node2.appendChild(node1);
      const node3 = document.createElement('fieldset');
      node3.setAttribute('disabled', 'disabled');
      node3.appendChild(node2);
      const parent = document.getElementById('div0');
      parent.appendChild(node2);
      const res = func(leaf, node1);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'enabled',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'enabled',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('x-input');
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('readonly', 'readonly');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.setAttribute('readonly', 'readonly');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('readonly', 'readonly');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'range');
      node.setAttribute('readonly', 'readonly');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('disabled', 'disabled');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      node.setAttribute('readonly', 'readonly');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      node.setAttribute('disabled', 'disabled');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.setAttribute('contenteditable', 'true');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'range');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('readonly', 'readonly');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('disabled', 'disabled');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      node.setAttribute('readonly', 'readonly');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      node.setAttribute('disabled', 'disabled');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.setAttribute('contenteditable', 'true');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'placeholder-shown',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('placeholder', 'foo');
      node.value = '';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'placeholder-shown',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.setAttribute('placeholder', 'foo');
      node.value = '';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'placeholder-shown',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'hidden');
      node.setAttribute('placeholder', 'foo');
      node.value = '';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'placeholder-shown',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('placeholder', 'foo');
      node.value = 'bar';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'placeholder-shown',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('placeholder', ' ');
      node.value = '';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'placeholder-shown',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      node.setAttribute('placeholder', 'foo');
      node.value = '';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'checked',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'checkbox');
      node.setAttribute('checked', 'checked');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'checked',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'radio');
      node.setAttribute('checked', 'checked');
      const parent = document.getElementById('div0');
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
      node.setAttribute('type', 'text');
      node.setAttribute('checked', 'checked');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'checked',
        type: PSEUDO_CLASS_SELECTOR
      };
      const container = document.createElement('select');
      const node = document.createElement('option');
      node.setAttribute('selected', 'selected');
      container.appendChild(node);
      const parent = document.getElementById('div0');
      parent.appendChild(container);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'indeterminate',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'checkbox');
      node.indeterminate = true;
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'indeterminate',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'checkbox');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'indeterminate',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('progress');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'indeterminate',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('progress');
      node.setAttribute('value', '0');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'indeterminate',
        type: PSEUDO_CLASS_SELECTOR
      };
      const form = document.createElement('form');
      const node1 = document.createElement('input');
      node1.setAttribute('type', 'radio');
      node1.setAttribute('name', 'foo');
      const node2 = document.createElement('input');
      node2.setAttribute('type', 'radio');
      node2.setAttribute('name', 'foo');
      const node3 = document.createElement('input');
      node3.setAttribute('type', 'radio');
      node3.setAttribute('name', 'foo');
      form.appendChild(node1);
      form.appendChild(node2);
      form.appendChild(node3);
      const parent = document.getElementById('div0');
      parent.appendChild(form);
      const res = func(leaf, node1);
      assert.deepEqual(res, [node1], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'indeterminate',
        type: PSEUDO_CLASS_SELECTOR
      };
      const form = document.createElement('form');
      const node1 = document.createElement('input');
      node1.setAttribute('type', 'radio');
      node1.setAttribute('name', 'foo');
      const node2 = document.createElement('input');
      node2.setAttribute('type', 'radio');
      node2.setAttribute('name', 'foo');
      node2.checked = true;
      const node3 = document.createElement('input');
      node3.setAttribute('type', 'radio');
      node3.setAttribute('name', 'foo');
      form.appendChild(node1);
      form.appendChild(node2);
      form.appendChild(node3);
      const parent = document.getElementById('div0');
      parent.appendChild(form);
      const res = func(leaf, node1);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'checkbox');
      node.setAttribute('checked', 'checked');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'checkbox');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'radio');
      node.setAttribute('checked', 'checked');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'redio');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PSEUDO_CLASS_SELECTOR
      };
      const container = document.createElement('select');
      const group = document.createElement('optgroup');
      const prev = document.createElement('option');
      const node = document.createElement('option');
      node.setAttribute('selected', 'selected');
      group.appendChild(prev);
      group.appendChild(node);
      container.appendChild(group);
      const parent = document.getElementById('div0');
      parent.appendChild(container);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PSEUDO_CLASS_SELECTOR
      };
      const container = document.createElement('datalist');
      const prev = document.createElement('option');
      const node = document.createElement('option');
      node.setAttribute('selected', 'selected');
      container.appendChild(prev);
      container.appendChild(node);
      const parent = document.getElementById('div0');
      parent.appendChild(container);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PSEUDO_CLASS_SELECTOR
      };
      const container = document.createElement('select');
      const node = document.createElement('option');
      const next = document.createElement('option');
      container.appendChild(node);
      container.appendChild(next);
      const parent = document.getElementById('div0');
      parent.appendChild(container);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PSEUDO_CLASS_SELECTOR
      };
      const container = document.createElement('select');
      const node = document.createElement('option');
      const next = document.createElement('option');
      next.setAttribute('selected', 'selected');
      container.appendChild(node);
      container.appendChild(next);
      const parent = document.getElementById('div0');
      parent.appendChild(container);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should throw', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PSEUDO_CLASS_SELECTOR
      };
      const container = document.createElement('select');
      container.setAttribute('multiple', 'multiple');
      const prev = document.createElement('option');
      const node = document.createElement('option');
      node.setAttribute('selected', 'selected');
      container.appendChild(prev);
      container.appendChild(node);
      const parent = document.getElementById('div0');
      parent.appendChild(container);
      assert.throws(() => func(leaf, node), DOMException);
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PSEUDO_CLASS_SELECTOR
      };
      const form = document.createElement('form');
      const node = document.createElement('button');
      form.appendChild(node);
      const parent = document.getElementById('div0');
      parent.appendChild(form);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PSEUDO_CLASS_SELECTOR
      };
      const form = document.createElement('form');
      const node = document.createElement('button');
      node.setAttribute('type', 'submit');
      form.appendChild(node);
      const parent = document.getElementById('div0');
      parent.appendChild(form);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      node.setAttribute('type', 'submit');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PSEUDO_CLASS_SELECTOR
      };
      const form = document.createElement('form');
      const node = document.createElement('input');
      node.setAttribute('type', 'submit');
      form.appendChild(node);
      const parent = document.getElementById('div0');
      parent.appendChild(form);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'submit');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PSEUDO_CLASS_SELECTOR
      };
      const form = document.createElement('form');
      const node = document.createElement('input');
      node.setAttribute('type', 'image');
      form.appendChild(node);
      const parent = document.getElementById('div0');
      parent.appendChild(form);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'image');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'valid',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.setAttribute('required', 'required');
      node.value = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'valid',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.setAttribute('required', 'required');
      node.value = '';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'valid',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('form');
      const input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('required', 'required');
      input.value = 'foo';
      node.appendChild(input);
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'valid',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('form');
      const input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('required', 'required');
      input.value = '';
      node.appendChild(input);
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'invalid',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.setAttribute('required', 'required');
      node.value = '';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'invalid',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.setAttribute('required', 'required');
      node.value = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    // FIXME: fieldset.checkValidity() returns true
    xit('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'invalid',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('fieldset');
      const input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('required', 'required');
      input.value = '';
      node.appendChild(input);
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.isFalse(node.checkValidity(), 'validity');
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'invalid',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('fieldset');
      const input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('required', 'required');
      input.value = 'foo';
      node.appendChild(input);
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.isTrue(node.checkValidity(), 'validity');
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'invalid',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('form');
      const input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('required', 'required');
      input.value = '';
      node.appendChild(input);
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'invalid',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('form');
      const input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('required', 'required');
      input.value = 'foo';
      node.appendChild(input);
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'in-range',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.readonly = true;
      node.setAttribute('type', 'number');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '1';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'in-range',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.disabled = true;
      node.setAttribute('type', 'number');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '1';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'in-range',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('hidden', 'hidden');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '1';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'in-range',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '1';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'in-range',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '1';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'in-range',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '1';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'in-range',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '0';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'in-range',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '11';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'out-of-range',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.readonly = true;
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'out-of-range',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('hidden', 'hidden');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'out-of-range',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '0';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'out-of-range',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '11';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'out-of-range',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '1';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('required', 'required');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.setAttribute('required', 'required');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('required', 'required');
      const parent = document.getElementById('div0');
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
      node.setAttribute('type', 'range');
      node.setAttribute('required', 'required');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'checkbox');
      node.setAttribute('required', 'required');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'radio');
      node.setAttribute('required', 'required');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'file');
      node.setAttribute('required', 'required');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      node.setAttribute('required', 'required');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('select');
      node.setAttribute('required', 'required');
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      const parent = document.getElementById('div0');
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
      node.setAttribute('type', 'range');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'checkbox');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'radio');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('select');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'empty',
        type: PSEUDO_CLASS_SELECTOR
      };
      const d1 = document.createElement('div');
      const p1 = document.createElement('p');
      const p2 = document.createElement('p');
      const p3 = document.createElement('p');
      const p4 = document.createElement('p');
      const p5 = document.createElement('p');
      const s1 = document.createElement('span');
      d1.id = 'ed1';
      p1.id = 'ep1';
      p2.id = 'ep2';
      p3.id = 'ep3';
      p4.id = 'ep4';
      p5.id = 'ep5';
      s1.id = 'es1';
      const cmt = document.createComment('comment node');
      p2.appendChild(cmt);
      p3.textContent = ' ';
      p4.textContent = 'text node';
      p5.appendChild(s1);
      d1.appendChild(p1);
      d1.appendChild(p2);
      d1.appendChild(p3);
      d1.appendChild(p4);
      d1.appendChild(p5);
      const parent = document.getElementById('div0');
      parent.appendChild(d1);
      const res1 = func(leaf, p1);
      const res2 = func(leaf, p2);
      const res3 = func(leaf, p3);
      const res4 = func(leaf, p4);
      const res5 = func(leaf, p5);
      const res6 = func(leaf, s1);
      assert.deepEqual(res1, [p1], 'result');
      assert.deepEqual(res2, [p2], 'result');
      assert.deepEqual(res3, [], 'result');
      assert.deepEqual(res4, [], 'result');
      assert.deepEqual(res5, [], 'result');
      assert.deepEqual(res6, [s1], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'first-child',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const next = document.createElement('div');
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      parent.appendChild(next);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'last-child',
        type: PSEUDO_CLASS_SELECTOR
      };
      const prev = document.createElement('div');
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(prev);
      parent.appendChild(node);
      const res = func(leaf, node);
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'only-child',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
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
      const parent = document.getElementById('div0');
      parent.appendChild(prev);
      parent.appendChild(node);
      parent.appendChild(next);
      const res = func(leaf, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'first-of-type',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.getElementById('dt2');
      const res = func(leaf, node);
      assert.deepEqual(res, [document.getElementById('dt1')], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'last-of-type',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.getElementById('dt2');
      const res = func(leaf, node);
      assert.deepEqual(res, [document.getElementById('dt3')], 'result');
    });

    it('should get matched node(s)', () => {
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
      document.getElementById('div0').appendChild(parent);
      const res = func(leaf, node1);
      assert.deepEqual(res, [node1], 'result');
    });

    // legacy pseudo-element
    it('should throw', () => {
      const leaf = {
        children: null,
        name: 'after',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      assert.throws(() => func(leaf, node), DOMException);
    });

    // not supported
    it('should throw', () => {
      const leaf = {
        children: null,
        name: 'active',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      assert.throws(() => func(leaf, node), DOMException);
    });

    // unknown
    it('should throw', () => {
      const leaf = {
        children: null,
        name: 'foo',
        type: PSEUDO_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      assert.throws(() => func(leaf, node), DOMException);
    });
  });

  describe('match pseudo-element selector', () => {
    const func = matcherJs.matchPseudoElementSelector;

    it('should get null', () => {
      const res = func();
      assert.isUndefined(res, 'result');
    });

    it('should throw', () => {
      const leaf = {
        children: null,
        name: 'after',
        type: PSEUDO_ELEMENT_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      assert.throws(() => func(leaf, node), DOMException);
    });

    it('should throw', () => {
      const leaf = {
        children: null,
        name: 'foo',
        type: PSEUDO_ELEMENT_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      assert.throws(() => func(leaf, node), DOMException);
    });
  });

  describe('Matcher', () => {
    const { Matcher } = matcherJs;

    it('should throw', () => {
      assert.throws(() => new Matcher(), TypeError);
    });

    it('should throw', () => {
      assert.throws(() => new Matcher('*'), TypeError);
    });

    it('should be instance of Matcher', () => {
      const matcher = new Matcher('*', document.body);
      assert.instanceOf(matcher, Matcher, 'instance');
    });

    it('should be instance of Matcher', () => {
      const matcher = new Matcher('*', document.body.ownerDocument);
      assert.instanceOf(matcher, Matcher, 'instance');
    });

    it('should be instance of Matcher', () => {
      const matcher = new Matcher('*', document.body.ownerDocument, {
        globalObject: globalThis,
        jsdom: true
      });
      assert.instanceOf(matcher, Matcher, 'instance');
    });

    describe('parse ast and find node(s)', () => {
      it('should throw', () => {
        const ast = parseSelector('#ul1 ++ #li1');
        const matcher = new Matcher('#ul1 ++ #li1', document);
        assert.throws(() => matcher._find(ast, document), DOMException);
      });

      it('should get matched node(s)', () => {
        const ast = parseSelector('#div1');
        const node = document.getElementById('div1');
        const matcher = new Matcher('#div1', document);
        const res = matcher._find(ast, document);
        assert.deepEqual(res, [node], 'result');
      });
    });

    describe('get matched nodes', () => {
      it('should get matched node(s)', () => {
        const ast = [
          {
            name: 'div2',
            type: ID_SELECTOR
          }
        ];
        const node = document.getElementById('div2');
        const matcher = new Matcher('#div2', document);
        const res = matcher._getMatchedNodes(ast, document);
        assert.deepEqual(res, [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
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
        const node = document.getElementById('div2');
        const matcher = new Matcher('div#div2', document);
        const res = matcher._getMatchedNodes(ast, document.documentElement);
        assert.deepEqual(res, [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
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
          }
        ];
        const matcher = new Matcher('ul > li', document);
        const res = matcher._getMatchedNodes(ast, document.documentElement);
        assert.deepEqual(res, [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ], 'result');
      });

      it('should get matched node(s)', () => {
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
          }
        ];
        const matcher = new Matcher('ul > li:nth-child(2n+1)', document);
        const res = matcher._getMatchedNodes(ast, document.documentElement);
        assert.deepEqual(res, [
          document.getElementById('li1'),
          document.getElementById('li3')
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const ast = [
          {
            name: 'div',
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
                      },
                      {
                        name: 'bar',
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
            name: 'p',
            type: TYPE_SELECTOR
          }
        ];
        const node = document.getElementById('div6');
        const matcher = new Matcher('div:is(.foo.bar) > p', document);
        const res = matcher._getMatchedNodes(ast, node);
        assert.deepEqual(res, [
          document.getElementById('p4'),
          document.getElementById('p5'),
          document.getElementById('p6')
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const ast = [
          {
            name: 'div',
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
                      },
                      {
                        name: 'bar',
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
          }
        ];
        const node = document.getElementById('div6');
        const matcher = new Matcher('div:is(.foo.bar)', document);
        const res = matcher._getMatchedNodes(ast, node);
        assert.deepEqual(res, [node], 'result');
      });

      it('should get matched node(s)', () => {
        const ast = [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        name: 'ul',
                        type: TYPE_SELECTOR
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
          }
        ];
        const node = document.getElementById('ul1');
        const matcher = new Matcher(':is(ul)', document);
        const res = matcher._getMatchedNodes(ast, node);
        assert.deepEqual(res, [node], 'result');
      });

      it('should get matched node(s)', () => {
        const ast = [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        name: 'ul',
                        type: TYPE_SELECTOR
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
          }
        ];
        const node = document.getElementById('ul1');
        const matcher = new Matcher(':is(dl, ul)', document);
        const res = matcher._getMatchedNodes(ast, node);
        assert.deepEqual(res, [node], 'result');
      });

      it('should not match', () => {
        const ast = [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        name: 'ul',
                        type: TYPE_SELECTOR
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
          }
        ];
        const node = document.getElementById('ul1');
        const matcher = new Matcher(':is(ol)', document);
        const res = matcher._getMatchedNodes(ast, node);
        assert.deepEqual(res, [node], 'result');
      });

      it('should get matched node(s)', () => {
        const ast = [
          {
            name: 'div',
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
            name: 'not',
            type: PSEUDO_CLASS_SELECTOR
          }
        ];
        const refPoint = document.getElementById('div4');
        const node = document.getElementById('div7');
        const matcher = new Matcher('div:not(.foo)', refPoint);
        const res = matcher._getMatchedNodes(ast, node);
        assert.deepEqual(res, [node], 'result');
      });

      it('should not match', () => {
        const ast = [
          {
            name: 'div',
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
                  },
                  {
                    children: [
                      {
                        name: 'baz',
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
          }
        ];
        const refPoint = document.getElementById('div4');
        const node = document.getElementById('div7');
        const matcher = new Matcher('div:not(.foo, .baz)', refPoint);
        const res = matcher._getMatchedNodes(ast, node);
        assert.deepEqual(res, [], 'result');
      });
    });

    describe('match ast and node', () => {
      it('should get matched node(s)', () => {
        const ast = {
          name: 'dt',
          type: TYPE_SELECTOR
        };
        const node = document.getElementById('dt1');
        const matcher = new Matcher('dt', document);
        const res = matcher._match(ast, node);
        assert.deepEqual(res, [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const ast = {
          name: 'foo',
          type: CLASS_SELECTOR
        };
        const node = document.getElementById('div5');
        const matcher = new Matcher('.foo', document);
        const res = matcher._match(ast, node);
        assert.deepEqual(res, [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const ast = {
          flags: null,
          matcher: null,
          name: {
            name: 'hidden',
            type: IDENTIFIER
          },
          type: ATTRIBUTE_SELECTOR,
          value: null
        };
        const node = document.getElementById('span3');
        const matcher = new Matcher('[hidden]', document);
        const res = matcher._match(ast, node);
        assert.deepEqual(res, [
          document.getElementById('span3')
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const ast = {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      name: 'ul',
                      type: TYPE_SELECTOR
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
        const node = document.getElementById('ul1');
        const matcher = new Matcher(':is(ul)', document);
        const res = matcher._match(ast, node);
        assert.deepEqual(res, [
          node
        ], 'result');
      });

      it('should throw', () => {
        const ast = {
          children: null,
          name: 'before',
          type: PSEUDO_ELEMENT_SELECTOR
        };
        const matcher = new Matcher('::before', document);
        assert.throws(() => matcher._match(ast, document.documentElement),
          DOMException);
      });
    });

    describe('matches', () => {
      it('should throw', () => {
        assert.throws(() =>
          new Matcher('[foo=bar baz]', document.body).matches(), DOMException);
      });

      it('should warn', () => {
        const stubWarn = sinon.stub(console, 'warn');
        const node = document.getElementById('li2');
        const matcher = new Matcher('li:hover', node, {
          warn: true
        });
        const res = matcher.matches();
        const { called } = stubWarn;
        stubWarn.restore();
        assert.isTrue(called, 'warn');
        assert.isFalse(res, 'result');
      });

      it('should get true', () => {
        const node = document.getElementById('li2');
        const matcher = new Matcher('li', node);
        const res = matcher.matches();
        assert.isTrue(res, 'result');
      });

      it('should get true', () => {
        const node = document.getElementById('li2');
        const matcher = new Matcher('ul > li', node);
        const res = matcher.matches();
        assert.isTrue(res, 'result');
      });

      it('should get true', () => {
        const node = document.getElementById('li2');
        const matcher = new Matcher('#li2', node);
        const res = matcher.matches();
        assert.isTrue(res, 'result');
      });

      it('should get true', () => {
        const node = document.getElementById('li2');
        const matcher = new Matcher('ul > li:nth-child(2n)', node);
        const res = matcher.matches();
        assert.isTrue(res, 'result');
      });

      it('should get false', () => {
        const node = document.getElementById('li2');
        const matcher = new Matcher('ul > li:nth-child(2n+1)', node);
        const res = matcher.matches();
        assert.isFalse(res, 'result');
      });

      it('should get true', () => {
        const div = document.createElement('div');
        div.id = 'main';
        const p1 = document.createElement('p');
        p1.id = 'p1-1';
        p1.classList.add('foo');
        p1.textContent = 'Foo';
        const p2 = document.createElement('p');
        p2.id = 'p1-2';
        p2.textContent = 'Bar';
        div.appendChild(p1);
        div.appendChild(p2);
        const parent = document.getElementById('div0');
        parent.appendChild(div);
        const matcher = new Matcher('#main p', p1);
        const res = matcher.matches();
        assert.isTrue(res, 'result');
      });

      it('should get true', () => {
        const div = document.createElement('div');
        div.id = 'main';
        const p1 = document.createElement('p');
        p1.id = 'p1-1';
        p1.classList.add('foo');
        p1.textContent = 'Foo';
        const p2 = document.createElement('p');
        p2.id = 'p1-2';
        p2.textContent = 'Bar';
        div.appendChild(p1);
        div.appendChild(p2);
        const parent = document.getElementById('div0');
        parent.appendChild(div);
        const matcher = new Matcher('#main p:not(.foo)', p2);
        const res = matcher.matches();
        assert.isTrue(res, 'result');
      });
    });

    describe('closest', () => {
      it('should throw', () => {
        assert.throws(() =>
          new Matcher('[foo=bar baz]', document.getElementById('div0'))
            .closest(), DOMException);
      });

      it('should warn', () => {
        const stubWarn = sinon.stub(console, 'warn');
        const node = document.getElementById('li2');
        const matcher = new Matcher('ul:hover', node, {
          warn: true
        });
        const res = matcher.closest();
        const { called } = stubWarn;
        stubWarn.restore();
        assert.isTrue(called, 'warn');
        assert.isNull(res, 'result');
      });

      it('should get matched node', () => {
        const node = document.getElementById('li2');
        const target = document.getElementById('div2');
        const matcher = new Matcher('div', node);
        const res = matcher.closest();
        assert.deepEqual(res, target, 'result');
      });

      it('should not match', () => {
        const node = document.getElementById('li2');
        const matcher = new Matcher('dl', node);
        const res = matcher.closest();
        assert.isNull(res, 'result');
      });

      it('should get matched node', () => {
        const node = document.getElementById('li2');
        const target = document.getElementById('ul1');
        const matcher = new Matcher(':has(> :scope)', node);
        const res = matcher.closest();
        assert.deepEqual(res, target, 'result');
      });
    });

    describe('querySelector', () => {
      it('should throw', () => {
        assert.throws(() =>
          new Matcher('[foo=bar baz]', document).querySelector(), DOMException);
      });

      it('should warn', () => {
        const stubWarn = sinon.stub(console, 'warn');
        const node = document.getElementById('div1');
        const matcher = new Matcher('dt:hover', node, {
          warn: true
        });
        const res = matcher.querySelector();
        const { called } = stubWarn;
        stubWarn.restore();
        assert.isTrue(called, 'warn');
        assert.isNull(res, 'result');
      });

      it('should get matched node', () => {
        const node = document.getElementById('div1');
        const target = document.getElementById('dt1');
        const matcher = new Matcher('#dt1', node);
        const res = matcher.querySelector();
        assert.deepEqual(res, target, 'result');
      });

      it('should get matched node', () => {
        const node = document.getElementById('div1');
        const target = document.getElementById('dt1');
        const matcher = new Matcher('dt', node);
        const res = matcher.querySelector();
        assert.deepEqual(res, target, 'result');
      });

      it('should get matched node', () => {
        const target = document.getElementById('dt1');
        const matcher = new Matcher('dt', document);
        const res = matcher.querySelector();
        assert.deepEqual(res, target, 'result');
      });

      it('should not match', () => {
        const matcher = new Matcher('ol', document);
        const res = matcher.querySelector();
        assert.isNull(res, 'result');
      });

      it('should get matched node', () => {
        const refPoint = document.getElementById('dl1');
        const target = document.getElementById('dt1');
        const matcher = new Matcher('*', refPoint);
        const res = matcher.querySelector();
        assert.deepEqual(res, target, 'result');
      });
    });

    describe('querySelectorAll', () => {
      it('should throw', () => {
        assert.throws(() => new Matcher('[foo=bar baz]', document)
          .querySelectorAll(), DOMException);
      });

      it('should warn', () => {
        const stubWarn = sinon.stub(console, 'warn');
        const node = document.getElementById('div1');
        const matcher = new Matcher('dt:hover', node, {
          warn: true
        });
        const res = matcher.querySelectorAll();
        const { called } = stubWarn;
        stubWarn.restore();
        assert.isTrue(called, 'warn');
        assert.deepEqual(res, [], 'result');
      });

      it('should get matched node(s)', () => {
        const node = document.getElementById('div1');
        const matcher = new Matcher('dt', node);
        const res = matcher.querySelectorAll();
        assert.deepEqual(res, [
          document.getElementById('dt1'),
          document.getElementById('dt2'),
          document.getElementById('dt3')
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const matcher = new Matcher('dt', document);
        const res = matcher.querySelectorAll();
        assert.deepEqual(res, [
          document.getElementById('dt1'),
          document.getElementById('dt2'),
          document.getElementById('dt3')
        ], 'result');
      });

      it('should not match', () => {
        const matcher = new Matcher('ol', document);
        const res = matcher.querySelectorAll();
        assert.deepEqual(res, [], 'result');
      });

      it('should get matched node(s)', () => {
        const refPoint = document.getElementById('dl1');
        const matcher = new Matcher('*', refPoint);
        const res = matcher.querySelectorAll();
        assert.deepEqual(res, [
          document.getElementById('dt1'),
          document.getElementById('dd1'),
          document.getElementById('span1'),
          document.getElementById('dt2'),
          document.getElementById('dd2'),
          document.getElementById('span2'),
          document.getElementById('dt3'),
          document.getElementById('dd3'),
          document.getElementById('span3')
        ], 'result');
      });
    });
  });
});
