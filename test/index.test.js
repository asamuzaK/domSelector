/**
 * index.test.js
 */

/* api */
import { strict as assert } from 'node:assert';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';

/* test */
import { DOMSelector } from '../src/index.js';
/* constants */
import { SYNTAX_ERR } from '../src/js/constant.js';

describe('DOMSelector', () => {
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
              <li id="li1" class="li">foo</li>
              <li id="li2" class="li">bar</li>
              <li id="li3" class="li"></li>
            </ul>
          </div>
          <div id="div3">
            <dl id="dl1">
              <dt id="dt1"></dt>
              <dd id="dd1" class="dd">
                <span id="span1" hidden></span>
              </dd>
              <dt id="dt2"></dt>
              <dd id="dd2" class="dd">
                <span id="span2"></span>
              </dd>
              <dt id="dt3"></dt>
              <dd id="dd3" class="dd">
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
    url: 'http://localhost/#foo'
  };

  let window, document;
  beforeEach(() => {
    const dom = new JSDOM(domStr, domOpt);
    window = dom.window;
    document = dom.window.document;
  });
  afterEach(() => {
    window = null;
    document = null;
  });

  describe('DOMSelector', () => {
    it('should throw', () => {
      assert.throws(() => new DOMSelector());
    });

    it('should create instance', () => {
      const res = new DOMSelector(window);
      assert.strictEqual(res.onError, undefined, 'onError is undefined');
      assert.strictEqual(res.setup, undefined, 'setup is undefined');
      assert.strictEqual(res.find, undefined, 'find is undefined');
      assert.strictEqual(typeof res.check, 'function', 'check');
      assert.strictEqual(typeof res.matches, 'function', 'matches');
      assert.strictEqual(typeof res.closest, 'function', 'closest');
      assert.strictEqual(typeof res.querySelector, 'function', 'querySelector');
      assert.strictEqual(typeof res.querySelectorAll, 'function',
        'querySelectorAll');
    });

    it('should create instance', () => {
      const res = new DOMSelector(window, null, {
        domSymbolTree: {},
        idlUtils: {}
      });
      assert.strictEqual(res.onError, undefined, 'onError is undefined');
      assert.strictEqual(res.setup, undefined, 'setup is undefined');
      assert.strictEqual(res.find, undefined, 'find is undefined');
      assert.strictEqual(typeof res.check, 'function', 'check');
      assert.strictEqual(typeof res.matches, 'function', 'matches');
      assert.strictEqual(typeof res.closest, 'function', 'closest');
      assert.strictEqual(typeof res.querySelector, 'function', 'querySelector');
      assert.strictEqual(typeof res.querySelectorAll, 'function',
        'querySelectorAll');
    });
  });

  describe('check', () => {
    it('should throw', () => {
      assert.throws(() => new DOMSelector(window).check(), window.TypeError,
        'Unexpected type Undefined');
    });

    it('should throw', () => {
      assert.throws(() => new DOMSelector(window).check(null, document),
        window.TypeError, 'Unexpected node #document');
    });

    it('should get result', () => {
      const node = document.getElementById('li2');
      const domSelector = new DOMSelector(window);
      const res = domSelector.check('li', node);
      assert.deepEqual(res, {
        match: true,
        pseudoElement: null
      }, 'result');
    });

    it('should get result', () => {
      const node = document.getElementById('li2');
      const domSelector = new DOMSelector(window);
      const res = domSelector.check('li::before', node);
      assert.deepEqual(res, {
        match: true,
        pseudoElement: '::before'
      }, 'result');
    });

    it('should get result', () => {
      const node = document.createElement(null);
      const res = new DOMSelector(window).check(null, node);
      assert.deepEqual(res, {
        match: true,
        pseudoElement: null
      }, 'result');
    });

    it('should throw', () => {
      assert.throws(
        () => new DOMSelector(window).check('[foo=bar baz]', document.body),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector [foo=bar baz]',
            'message');
          return true;
        }
      );
    });

    it('should get result', () => {
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
      const domSelector = new DOMSelector(window);
      const res = domSelector.check('#main p:not(.foo)', p2);
      assert.deepEqual(res, {
        match: true,
        pseudoElement: null
      }, 'result');
    });

    it('should get result', () => {
      const domSelector = new DOMSelector(window);
      const node = document.getElementById('li3');
      const res = domSelector.check(':is(ol > li:is(:only-child, :last-child), ul > li:is(:only-child, :last-child))', node);
      assert.deepEqual(res, {
        match: true,
        pseudoElement: null
      }, 'result');
    });

    it('should get result', () => {
      const wrapperForImpl = sinon.stub().callsFake(node => node);
      const i = wrapperForImpl.callCount;
      const idlUtils = {
        wrapperForImpl
      };
      const node = document.getElementById('li2');
      node._ownerDocument = document;
      const domSelector = new DOMSelector(window, null, {
        domSymbolTree: {},
        idlUtils
      });
      const res = domSelector.check('li', node);
      delete node._ownerDocument;
      assert.strictEqual(wrapperForImpl.callCount, i + 1, 'called');
      assert.deepEqual(res, {
        match: true,
        pseudoElement: null
      }, 'result');
    });

    it('should get result', () => {
      const wrapperForImpl = sinon.stub().callsFake(node => node);
      const i = wrapperForImpl.callCount;
      const idlUtils = {
        wrapperForImpl
      };
      const node = document.getElementById('li2');
      node._ownerDocument = document;
      const domSelector = new DOMSelector(window, null, {
        domSymbolTree: {},
        idlUtils
      });
      const res = domSelector.check('li::before', node);
      delete node._ownerDocument;
      assert.strictEqual(wrapperForImpl.callCount, i + 1, 'called');
      assert.deepEqual(res, {
        match: true,
        pseudoElement: '::before'
      }, 'result');
    });
  });

  describe('matches', () => {
    it('should throw', () => {
      assert.throws(() => new DOMSelector(window).matches(), window.TypeError,
        'Unexpected type Undefined');
    });

    it('should throw', () => {
      assert.throws(() => new DOMSelector(window).matches(null, document),
        window.TypeError, 'Unexpected node #document');
    });

    it('should get true', () => {
      const node = document.createElement(null);
      const res = new DOMSelector(window).matches(null, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('div');
      const res = new DOMSelector(window).matches(null, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const node = document.createElement(undefined);
      const res = new DOMSelector(window).matches(undefined, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('div');
      const res = new DOMSelector(window).matches(undefined, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should throw', () => {
      assert.throws(() => new DOMSelector(window).matches('body', document),
        window.TypeError, 'Unexpected node #document');
    });

    it('should throw', () => {
      assert.throws(
        () => new DOMSelector(window).matches('', document.body),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector ', 'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      assert.throws(
        () => new DOMSelector(window).matches('[foo=bar baz]', document.body),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector [foo=bar baz]',
            'message');
          return true;
        }
      );
    });

    it('should warn', () => {
      const stubWarn = sinon.stub(console, 'warn');
      const node = document.getElementById('li2');
      const domSelector = new DOMSelector(window);
      const res = domSelector.matches('li:blank', node, {
        warn: true
      });
      const { called } = stubWarn;
      stubWarn.restore();
      assert.strictEqual(called, true, 'warn');
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const node = document.getElementById('li2');
      const domSelector = new DOMSelector(window);
      const res = domSelector.matches('li', node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const node = document.getElementById('li2');
      const domSelector = new DOMSelector(window);
      const res = domSelector.matches('ul > li', node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const node = document.getElementById('li2');
      const domSelector = new DOMSelector(window);
      const res = domSelector.matches('#li2', node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const node = document.getElementById('li2');
      const domSelector = new DOMSelector(window);
      const res = domSelector.matches('ul > li:nth-child(2n)', node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const node = document.getElementById('li2');
      const domSelector = new DOMSelector(window);
      const res = domSelector.matches('ul > li:nth-child(2n+1)', node);
      assert.strictEqual(res, false, 'result');
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
      const domSelector = new DOMSelector(window);
      const res = domSelector.matches('#main p', p1);
      assert.strictEqual(res, true, 'result');
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
      const domSelector = new DOMSelector(window);
      const res = domSelector.matches('#main p:not(.foo)', p2);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const domSelector = new DOMSelector(window);
      const node = document.getElementById('li3');
      const res = domSelector.matches(':is(ol > li:is(:only-child, :last-child), ul > li:is(:only-child, :last-child))', node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const wrapperForImpl = sinon.stub().callsFake(node => node);
      const i = wrapperForImpl.callCount;
      const idlUtils = {
        wrapperForImpl
      };
      const node = document.getElementById('li2');
      node._ownerDocument = document;
      const domSelector = new DOMSelector(window, null, {
        domSymbolTree: {},
        idlUtils
      });
      const res = domSelector.matches('li', node);
      delete node._ownerDocument;
      assert.strictEqual(wrapperForImpl.callCount, i + 1, 'called');
      assert.deepEqual(res, true, 'result');
    });

    it('should get false', () => {
      const wrapperForImpl = sinon.stub().callsFake(node => node);
      const i = wrapperForImpl.callCount;
      const idlUtils = {
        wrapperForImpl
      };
      const node = document.getElementById('li2');
      node._ownerDocument = document;
      const domSelector = new DOMSelector(window, null, {
        domSymbolTree: {},
        idlUtils
      });
      const res = domSelector.matches('li::before', node);
      delete node._ownerDocument;
      assert.strictEqual(wrapperForImpl.callCount, i + 1, 'called');
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('closest', () => {
    it('should throw', () => {
      assert.throws(() => new DOMSelector(window).closest(null),
        window.TypeError, 'Unexpected type Undefined');
    });

    it('should throw', () => {
      assert.throws(() => new DOMSelector(window).closest('body', document),
        window.TypeError, 'Unexpected node #document');
    });

    it('should throw', () => {
      assert.throws(
        () => new DOMSelector(window)
          .closest('[foo=bar baz]', document.getElementById('div0')),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector [foo=bar baz]',
            'message');
          return true;
        }
      );
    });

    it('should warn', () => {
      const stubWarn = sinon.stub(console, 'warn');
      const node = document.getElementById('li2');
      const domSelector = new DOMSelector(window);
      const res = domSelector.closest('ul:blank', node, {
        warn: true
      });
      const { called } = stubWarn;
      stubWarn.restore();
      assert.strictEqual(called, true, 'warn');
      assert.deepEqual(res, null, 'result');
    });

    it('should get matched node', () => {
      const node = document.getElementById('li2');
      const target = document.getElementById('div2');
      const domSelector = new DOMSelector(window);
      const res = domSelector.closest('div', node);
      assert.deepEqual(res, target, 'result');
    });

    it('should get matched node', () => {
      const node = document.getElementById('li2');
      const target = document.getElementById('div1');
      const domSelector = new DOMSelector(window);
      const res = domSelector.closest('body > div', node);
      assert.deepEqual(res, target, 'result');
    });

    it('should not match', () => {
      const node = document.getElementById('li2');
      const domSelector = new DOMSelector(window);
      const res = domSelector.closest('dl', node);
      assert.deepEqual(res, null, 'result');
    });

    it('should get matched node', () => {
      const node = document.getElementById('li2');
      const domSelector = new DOMSelector(window);
      const res = domSelector.closest(':has(:scope)', node);
      assert.deepEqual(res, document.getElementById('ul1'), 'result');
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
      const p1 = document.createElement('p');
      const p2 = document.createElement('p');
      const p3 = document.createElement('p');
      const p4 = document.createElement('p');
      const p5 = document.createElement('p');
      const p6 = document.createElement('p');
      const p7 = document.createElement('p');
      const p8 = document.createElement('p');
      const p9 = document.createElement('p');
      const p10 = document.createElement('p');
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
      l1.appendChild(p1);
      ul.appendChild(l1);
      l2.appendChild(p2);
      ul.appendChild(l2);
      l3.appendChild(p3);
      ul.appendChild(l3);
      l4.appendChild(p4);
      ul.appendChild(l4);
      l5.appendChild(p5);
      ul.appendChild(l5);
      l6.appendChild(p6);
      ul.appendChild(l6);
      l7.appendChild(p7);
      ul.appendChild(l7);
      l8.appendChild(p8);
      ul.appendChild(l8);
      l9.appendChild(p9);
      ul.appendChild(l9);
      l10.appendChild(p10);
      ul.appendChild(l10);
      const parent = document.getElementById('div0');
      parent.appendChild(ul);
      const res = new DOMSelector(window).closest(':nth-child(2n+1 of .noted)', p7);
      assert.deepEqual(res, l7, 'result');
    });

    it('should get matched node', () => {
      const domSelector = new DOMSelector(window);
      const node = document.getElementById('li3');
      const res = domSelector.closest(':is(ol > li:is(:only-child, :last-child), ul > li:is(:only-child, :last-child))', node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node(s)', () => {
      const wrapperForImpl = sinon.stub().callsFake(node => node);
      const i = wrapperForImpl.callCount;
      const idlUtils = {
        wrapperForImpl
      };
      const node = document.getElementById('li2');
      node._ownerDocument = document;
      const domSelector = new DOMSelector(window, null, {
        domSymbolTree: {},
        idlUtils
      });
      const res = domSelector.closest('li', node);
      delete node._ownerDocument;
      assert.strictEqual(wrapperForImpl.callCount, i + 1, 'called');
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const wrapperForImpl = sinon.stub().callsFake(node => node);
      const i = wrapperForImpl.callCount;
      const idlUtils = {
        wrapperForImpl
      };
      const node = document.getElementById('li2');
      node._ownerDocument = document;
      const domSelector = new DOMSelector(window, null, {
        domSymbolTree: {},
        idlUtils
      });
      const res = domSelector.closest('li::before', node);
      delete node._ownerDocument;
      assert.strictEqual(wrapperForImpl.callCount, i + 1, 'called');
      assert.deepEqual(res, null, 'result');
    });
  });

  describe('querySelector', () => {
    it('should throw', () => {
      assert.throws(() => new DOMSelector(window).querySelector(),
        window.TypeError, 'Unexpected type Undefined');
    });

    it('should throw', () => {
      assert.throws(
        () => new DOMSelector(window).querySelector('[foo=bar baz]', document),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector [foo=bar baz]',
            'message');
          return true;
        }
      );
    });

    it('should warn', () => {
      const stubWarn = sinon.stub(console, 'warn');
      const node = document.getElementById('div1');
      const domSelector = new DOMSelector(window);
      const res = domSelector.querySelector('dt:blank', node, {
        warn: true
      });
      const { called } = stubWarn;
      stubWarn.restore();
      assert.strictEqual(called, true, 'warn');
      assert.deepEqual(res, null, 'result');
    });

    it('should get matched node', () => {
      const node = document.getElementById('div1');
      const target = document.getElementById('dt1');
      const domSelector = new DOMSelector(window);
      const res = domSelector.querySelector('#dt1', node);
      assert.deepEqual(res, target, 'result');
    });

    it('should get matched node', () => {
      const node = document.getElementById('div1');
      const target = document.getElementById('dt1');
      const domSelector = new DOMSelector(window);
      const res = domSelector.querySelector('dt', node);
      assert.deepEqual(res, target, 'result');
    });

    it('should get matched node', () => {
      const target = document.getElementById('dt1');
      const domSelector = new DOMSelector(window);
      const res = domSelector.querySelector('dt', document);
      assert.deepEqual(res, target, 'result');
    });

    it('should not match', () => {
      const domSelector = new DOMSelector(window);
      const res = domSelector.querySelector('ol', document);
      assert.deepEqual(res, null, 'result');
    });

    it('should get matched node', () => {
      const refPoint = document.getElementById('dl1');
      const target = document.getElementById('dt1');
      const domSelector = new DOMSelector(window);
      const res = domSelector.querySelector('*', refPoint);
      assert.deepEqual(res, target, 'result');
    });

    it('should get matched node', () => {
      const refPoint = document.getElementById('dl1');
      const target = document.getElementById('dt1');
      const domSelector = new DOMSelector(window);
      const res = domSelector.querySelector('body #dt1', refPoint);
      assert.deepEqual(res, target, 'result');
    });

    it('should get matched node', () => {
      const target = document.getElementById('li1');
      const domSelector = new DOMSelector(window);
      const res = domSelector.querySelector('.li', document);
      assert.deepEqual(res, target, 'result');
    });

    it('should get matched node', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const root = node.attachShadow({ mode: 'open' });
      root.innerHTML = '<div></div><div></div>';
      const domSelector = new DOMSelector(window);
      const res = domSelector.querySelector(':host div', root);
      assert.deepEqual(res, root.firstElementChild, 'result');
    });

    it('should get matched node', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const root = node.attachShadow({ mode: 'open' });
      root.innerHTML = '<div></div><div></div>';
      const domSelector = new DOMSelector(window);
      const res = domSelector.querySelector(':host div + div', root);
      assert.deepEqual(res, root.lastElementChild, 'result');
    });

    it('should get matched node', () => {
      const node1 = document.createElement('div');
      const node2 = document.createElement('div');
      const node3 = document.createElement('div');
      const node4 = document.createElement('div');
      const node5 = document.createElement('div');
      const parent = document.getElementById('div0');
      node1.id = 'node1';
      node1.classList.add('foo');
      node2.id = 'node2';
      node2.classList.add('foo');
      node3.id = 'node3';
      node3.classList.add('foo');
      node4.id = 'node4';
      node4.classList.add('foo');
      node5.id = 'node5';
      node5.classList.add('foo');
      parent.appendChild(node1);
      parent.appendChild(node2);
      parent.appendChild(node3);
      parent.appendChild(node4);
      parent.appendChild(node5);
      const domSelector = new DOMSelector(window);
      const res =
        domSelector.querySelector('.foo + .foo + .foo:last-child', parent);
      assert.deepEqual(res, node5, 'result');
    });

    it('should get matched node', () => {
      const node = document.getElementById('li2');
      const domSelector = new DOMSelector(window);
      const res = domSelector.querySelector('li ~ li', document);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const node = document.createElement('div');
      const child = document.createElement('div');
      child.classList.add('foo');
      child.setAttribute('data-bar', 'Baz');
      node.appendChild(child);
      const domSelector = new DOMSelector(window);
      const res = domSelector.querySelector('.foo[data-bar=baz i]', node);
      assert.deepEqual(res, child, 'result');
    });

    it('should get matched node', () => {
      const node = document.getElementById('ul1');
      const domSelector = new DOMSelector(window);
      const res = domSelector.querySelector(':nth-child(even)', node);
      assert.deepEqual(res, document.getElementById('li2'), 'result');
    });

    it('should get matched node', () => {
      const domSelector = new DOMSelector(window);
      const parent = document.getElementById('div1');
      const node = document.getElementById('ul1');
      const res = domSelector.querySelector(':is(ol:is(:only-child, :last-child), ul:is(:only-child, :last-child))', parent);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node(s)', () => {
      const wrapperForImpl = sinon.stub().callsFake(node => node);
      const i = wrapperForImpl.callCount;
      const idlUtils = {
        wrapperForImpl
      };
      const node = document.getElementById('li2');
      const parent = node.parentNode;
      parent._ownerDocument = document;
      const domSelector = new DOMSelector(window, null, {
        domSymbolTree: {},
        idlUtils
      });
      const res = domSelector.querySelector('li + #li2', parent);
      delete parent._ownerDocument;
      assert.strictEqual(wrapperForImpl.callCount, i + 1, 'called');
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const wrapperForImpl = sinon.stub().callsFake(node => node);
      const i = wrapperForImpl.callCount;
      const idlUtils = {
        wrapperForImpl
      };
      const node = document.getElementById('li2');
      const parent = node.parentNode;
      parent._ownerDocument = document;
      const domSelector = new DOMSelector(window, null, {
        domSymbolTree: {},
        idlUtils
      });
      const res = domSelector.querySelector('#li2::before', parent);
      delete parent._ownerDocument;
      assert.strictEqual(wrapperForImpl.callCount, i + 1, 'called');
      assert.deepEqual(res, null, 'result');
    });
  });

  describe('querySelectorAll', () => {
    it('should throw', () => {
      assert.throws(() => new DOMSelector(window).querySelectorAll(),
        window.TypeError, 'Unexpected type Undefined');
    });

    it('should throw', () => {
      assert.throws(
        () => new DOMSelector(window)
          .querySelectorAll('[foo=bar baz]', document),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector [foo=bar baz]',
            'message');
          return true;
        });
    });

    it('should warn', () => {
      const stubWarn = sinon.stub(console, 'warn');
      const node = document.getElementById('div1');
      const domSelector = new DOMSelector(window);
      const res = domSelector.querySelectorAll('dt:blank', node, {
        warn: true
      });
      const { called } = stubWarn;
      stubWarn.restore();
      assert.strictEqual(called, true, 'warn');
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('div1');
      const domSelector = new DOMSelector(window);
      const res = domSelector.querySelectorAll('dt', node);
      assert.deepEqual(res, [
        document.getElementById('dt1'),
        document.getElementById('dt2'),
        document.getElementById('dt3')
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const domSelector = new DOMSelector(window);
      const res = domSelector.querySelectorAll('dt', document);
      assert.deepEqual(res, [
        document.getElementById('dt1'),
        document.getElementById('dt2'),
        document.getElementById('dt3')
      ], 'result');
    });

    it('should not match', () => {
      const domSelector = new DOMSelector(window);
      const res = domSelector.querySelectorAll('ol', document);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const refPoint = document.getElementById('dl1');
      const domSelector = new DOMSelector(window);
      const res = domSelector.querySelectorAll('*', refPoint);
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

    it('should get matched node(s)', () => {
      const refPoint = document.getElementById('dl1');
      const target = document.getElementById('dt1');
      const domSelector = new DOMSelector(window);
      const res = domSelector.querySelectorAll('body #dt1', refPoint);
      assert.deepEqual(res, [target], 'result');
    });

    it('should get matched node(s)', () => {
      const domSelector = new DOMSelector(window);
      const res = domSelector.querySelectorAll('.li', document);
      assert.deepEqual(res, [
        document.getElementById('li1'),
        document.getElementById('li2'),
        document.getElementById('li3')
      ], 'result');
    });

    it('should not match', () => {
      const domSelector = new DOMSelector(window);
      const res = domSelector.querySelectorAll('ul.li + .li', document);
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const domSelector = new DOMSelector(window);
      const res = domSelector.querySelectorAll('::slotted(foo)', document);
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const domSelector = new DOMSelector(window);
      const res = domSelector.querySelectorAll('::slotted(foo', document);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const root = document.createElement('div');
      const node = document.createElement('div');
      root.id = 'root';
      root.classList.add('div');
      node.id = 'div';
      node.classList.add('div');
      root.append(node);
      const domSelector = new DOMSelector(window);
      const res = domSelector.querySelectorAll(':nth-child(n of .div)', root);
      assert.deepEqual(res, [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const root = node.attachShadow({ mode: 'open' });
      root.innerHTML = '<div></div><div></div>';
      const domSelector = new DOMSelector(window);
      const res = domSelector.querySelectorAll(':host div', root);
      assert.deepEqual(res, [
        root.firstElementChild,
        root.lastElementChild
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const domSelector = new DOMSelector(window);
      const parent = document.getElementById('div1');
      const node = document.getElementById('ul1');
      const res = domSelector.querySelectorAll(':is(ol:is(:only-child, :last-child), ul:is(:only-child, :last-child))', parent);
      assert.deepEqual(res, [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const wrapperForImpl = sinon.stub().callsFake(node => node);
      const i = wrapperForImpl.callCount;
      const idlUtils = {
        wrapperForImpl
      };
      const node = document.getElementById('li2');
      const parent = node.parentNode;
      parent._ownerDocument = document;
      const domSelector = new DOMSelector(window, null, {
        domSymbolTree: {},
        idlUtils
      });
      const res = domSelector.querySelectorAll('#li2', parent);
      delete parent._ownerDocument;
      assert.strictEqual(wrapperForImpl.callCount, i + 1, 'called');
      assert.deepEqual(res, [node], 'result');
    });

    it('should not match', () => {
      const wrapperForImpl = sinon.stub().callsFake(node => node);
      const i = wrapperForImpl.callCount;
      const idlUtils = {
        wrapperForImpl
      };
      const node = document.getElementById('li2');
      const parent = node.parentNode;
      parent._ownerDocument = document;
      const domSelector = new DOMSelector(window, null, {
        domSymbolTree: {},
        idlUtils
      });
      const res = domSelector.querySelectorAll('#li2::before', parent);
      delete parent._ownerDocument;
      assert.strictEqual(wrapperForImpl.callCount, i + 1, 'called');
      assert.deepEqual(res, [], 'result');
    });
  });
});

/**
 * monkey patch jsdom
 * @param {string} str - dom string
 * @returns {object} - patched JSDOM instance
 */
const jsdom = (str = '') => {
  const dom = new JSDOM(str, {
    runScripts: 'dangerously',
    url: 'http://localhost/',
    beforeParse: window => {
      const domSelector = new DOMSelector(window);
      window.Element.prototype.matches = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return domSelector.matches(selector, this);
      };
      window.Element.prototype.closest = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return domSelector.closest(selector, this);
      };
      window.Document.prototype.querySelector = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return domSelector.querySelector(selector, this);
      };
      window.DocumentFragment.prototype.querySelector = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return domSelector.querySelector(selector, this);
      };
      window.Element.prototype.querySelector = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return domSelector.querySelector(selector, this);
      };
      window.Document.prototype.querySelectorAll = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return domSelector.querySelectorAll(selector, this);
      };
      window.DocumentFragment.prototype.querySelectorAll = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return domSelector.querySelectorAll(selector, this);
      };
      window.Element.prototype.querySelectorAll = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return domSelector.querySelectorAll(selector, this);
      };
    }
  });
  return dom;
};

describe('patched JSDOM', () => {
  const globalKeys = ['DOMParser'];
  const domStr =
    '<!doctype html><html lang="en"><head></head><body></body></html>';
  let window, document;
  beforeEach(() => {
    const dom = jsdom(domStr);
    window = dom.window;
    document = dom.window.document;
    for (const key of globalKeys) {
      global[key] = dom.window[key];
    }
  });
  afterEach(() => {
    document = null;
    window = null;
    for (const key of globalKeys) {
      delete global[key];
    }
  });

  describe('Element.matches()', () => {
    it('should throw', () => {
      assert.throws(
        () => document.body.matches('*|'),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector *|', 'message');
          return true;
        }
      );
    });

    it('should match', () => {
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
      const res = li3.matches('div.foo ul.bar > li.baz');
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
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
      const res = li3.matches('div.foo ul.bar > li.qux');
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const res = li3.matches(':nth-child(+n)');
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
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
      const res = li1.matches(':nth-child(-n)');
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const node = document.createElement('div');
      node.classList.add('qux');
      const res = node.matches(':is(:not(:is(.foo, .bar)), .baz)');
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const node = document.createElement('div');
      node.classList.add('baz');
      const res = node.matches(':is(:not(:is(.foo, .bar)), .baz)');
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const node = document.createElement('div');
      node.classList.add('bar');
      const res = node.matches(':is(:not(:is(.foo, .bar)), .baz)');
      assert.strictEqual(res, false, 'result');
    });

    it('should get results', () => {
      const div = document.createElement('div');
      div.setAttribute('contenteditable', 'true');
      const p = document.createElement('p');
      const span = document.createElement('span');
      p.appendChild(span);
      div.appendChild(p);
      assert.strictEqual(div.matches(':read-only'), false,
        'not match :read-only');
      assert.strictEqual(div.matches(':read-write'), true,
        'matches :read-write');
      assert.strictEqual(span.matches(':read-only'), false,
        'not match :read-only');
      assert.strictEqual(span.matches(':read-write'), true,
        'matches :read-write');
    });
  });

  describe('Element.closest()', () => {
    it('should throw', () => {
      assert.throws(
        () => document.body.closest('*|'),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector *|', 'message');
          return true;
        }
      );
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
      const res = li3.closest('div.foo');
      assert.deepEqual(res, div1, 'result');
    });

    it('should not match', () => {
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
      const res = li3.closest('div.foobar');
      assert.deepEqual(res, null, 'result');
    });

    it('should not match, should not throw', () => {
      const domstr = '<div><button id="test"></button></div>';
      document.body.innerHTML = domstr;
      const node = document.getElementById('test');
      const res = node.closest('.foo');
      assert.deepEqual(res, null, 'result');
      assert.deepEqual(node.ownerDocument, document, 'ownerDocument');
      assert.strictEqual(typeof document.createTreeWalker, 'function',
        'TreeWalker');
      assert.deepEqual(document.defaultView, window, 'window');
    });

    it('should not match, should not throw', () => {
      const domstr =
        '<html><body><div><button id="test"></button></div></body></html>';
      const doc = new window.DOMParser().parseFromString(domstr, 'text/html');
      const node = doc.getElementById('test');
      const res = node.closest('.foo');
      assert.deepEqual(res, null, 'result');
      assert.deepEqual(node.ownerDocument, doc, 'ownerDocument');
      assert.strictEqual(typeof doc.createTreeWalker, 'function', 'TreeWalker');
      assert.deepEqual(doc.defaultView, null, 'defaultView');
      assert.deepEqual(document.defaultView, window, 'window');
    });

    it('should not match, should not throw', () => {
      const html = document.createElement('html');
      const body = document.createElement('body');
      const div = document.createElement('div');
      const node = document.createElement('button');
      div.appendChild(node);
      body.appendChild(div);
      html.appendChild(body);
      const res = node.closest('.foo');
      assert.deepEqual(res, null, 'result');
      assert.deepEqual(node.ownerDocument, document, 'ownerDocument');
      assert.deepEqual(html.ownerDocument, document, 'ownerDocument');
      assert.strictEqual(typeof document.createTreeWalker, 'function',
        'TreeWalker');
      assert.deepEqual(document.defaultView, window, 'window');
    });
  });

  describe('Document.querySelector(), Element.querySelector()', () => {
    it('should throw', () => {
      assert.throws(
        () => document.querySelector('*|'),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector *|', 'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      assert.throws(
        () => document.body.querySelector('*|'),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector *|', 'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      const frag = document.createDocumentFragment();
      assert.throws(
        () => frag.querySelector('*|'),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector *|', 'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      assert.throws(
        () => document.querySelector('.foo + .123'),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector .foo + .123',
            'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      const frag = document.createDocumentFragment();
      assert.throws(
        () => frag.querySelector('.foo + .123'),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector .foo + .123',
            'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      assert.throws(
        () => document.body.querySelector('.foo + .123'),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector .foo + .123',
            'message');
          return true;
        }
      );
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
      const res = document.querySelector('.bar');
      assert.deepEqual(res, ul1, 'result');
    });

    it('should not match', () => {
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
      const res = document.querySelector('.qux');
      assert.deepEqual(res, null, 'result');
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
      const res = div1.querySelector('.baz');
      assert.deepEqual(res, li3, 'result');
    });

    it('should not match', () => {
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
      const res = div1.querySelector('.qux');
      assert.deepEqual(res, null, 'result');
    });

    it('should get matched node', () => {
      const frag = document.createDocumentFragment();
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
      frag.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = frag.querySelector('.baz');
      assert.deepEqual(res, li3, 'result');
    });

    it('should not match', () => {
      const frag = document.createDocumentFragment();
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
      frag.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = frag.querySelector('.qux');
      assert.deepEqual(res, null, 'result');
    });
  });

  describe('Document.querySelectorAll(), Element.querySelectorAll()', () => {
    it('should throw', () => {
      assert.throws(
        () => document.querySelectorAll('*|'),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector *|', 'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      assert.throws(
        () => document.body.querySelectorAll('*|'),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector *|', 'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      const frag = document.createDocumentFragment();
      assert.throws(
        () => frag.querySelectorAll('*|'),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector *|', 'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      assert.throws(
        () => document.querySelectorAll('.foo + .123'),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector .foo + .123',
            'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      const frag = document.createDocumentFragment();
      assert.throws(
        () => frag.querySelectorAll('.foo + .123'),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector .foo + .123',
            'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      assert.throws(
        () => document.body.querySelectorAll('.foo + .123'),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector .foo + .123',
            'message');
          return true;
        });
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
      const res = document.querySelectorAll('li:nth-child(odd)');
      assert.deepEqual(res, [
        li1,
        li3,
        li5
      ], 'result');
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
      const res =
        document.querySelectorAll('li:is(:nth-child(2n+1), :nth-child(3n+2))');
      assert.deepEqual(res, [
        li1,
        li2,
        li3,
        li5
      ], 'result');
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
      const res =
        document.querySelectorAll('li:not(:is(:nth-child(2n), :nth-child(3n+1)))');
      assert.deepEqual(res, [
        li3,
        li5
      ], 'result');
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
      const res =
        document.querySelectorAll('li:last-child, li:first-child + li');
      assert.deepEqual(res, [
        li2,
        li5
      ], 'result');
    });

    it('should not match', () => {
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
      const res = document.querySelectorAll('.qux');
      assert.deepEqual(res, [], 'result');
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
      const res = div1.querySelectorAll('li:nth-child(odd)');
      assert.deepEqual(res, [
        li1,
        li3,
        li5
      ], 'result');
    });

    it('should not match', () => {
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
      const res = div1.querySelectorAll('.qux');
      assert.deepEqual(res, [], 'result');
    });

    it('should throw', () => {
      const frag = document.createDocumentFragment();
      assert.throws(
        () => frag.querySelectorAll('*|'),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector *|', 'message');
          return true;
        }
      );
    });

    it('should get matched node', () => {
      const frag = document.createDocumentFragment();
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
      frag.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = frag.querySelectorAll('li:nth-child(odd)');
      assert.deepEqual(res, [
        li1,
        li3,
        li5
      ], 'result');
    });

    it('should not match', () => {
      const frag = document.createDocumentFragment();
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
      frag.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = frag.querySelectorAll('.qux');
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const span = document.createElement('span');
      const span2 = document.createElement('span');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.body;
      span.classList.add('bar');
      elm.classList.add('foo');
      elm.appendChild(span);
      span2.classList.add('bar');
      elm2.classList.add('foo');
      elm2.appendChild(span2);
      body.appendChild(elm);
      body.appendChild(elm2);
      const items = document.querySelectorAll('.foo');
      const arr = [];
      for (const item of items) {
        const i = item.querySelector('.bar');
        if (i) {
          arr.push(i);
        }
      }
      assert.deepEqual(arr, [
        span, span2
      ], 'result');
    });
  });
});
