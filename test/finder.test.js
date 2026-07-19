/**
 * finder.test.js
 */

/* api */
import { strict as assert } from 'node:assert';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';
import * as cssTree from 'css-tree';

/* test */
import { Finder } from '../src/js/finder.js';

/* constants */
import {
  ATTR_SELECTOR,
  CLASS_SELECTOR,
  IDENT,
  ID_SELECTOR,
  NOT_SUPPORTED_ERR,
  PS_CLASS_SELECTOR,
  PS_ELEMENT_SELECTOR,
  SELECTOR,
  SELECTOR_LIST,
  SYNTAX_ERR,
  TYPE_SELECTOR
} from '../src/js/constant.js';

describe('Finder', () => {
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
    window.close();
    window = null;
    document = null;
  });

  describe('Finder', () => {
    it('should be instance of Finder', () => {
      const finder = new Finder(window);
      assert.strictEqual(finder instanceof Finder, true, 'result');
    });

    it('should be instance of Finder', () => {
      const finder = new Finder(window, document);
      assert.strictEqual(finder instanceof Finder, true, 'result');
    });
  });

  describe('handle error', () => {
    it('should not throw', () => {
      const err = new DOMException('error', SYNTAX_ERR);
      const finder = new Finder(window);
      finder.setup('*', document, {
        noexcept: true
      });
      assert.doesNotThrow(() => finder.onError(err));
    });

    it('should throw', () => {
      const err = new TypeError('error');
      const finder = new Finder(window);
      assert.throws(() => finder.onError(err), window.TypeError, 'error');
    });

    it('should throw', () => {
      const err = new Error('error');
      err.name = 'UnknownError';
      const finder = new Finder(window);
      assert.throws(() => finder.onError(err), Error, 'error');
    });

    it('should throw', () => {
      const err = new DOMException('error', SYNTAX_ERR);
      const finder = new Finder(window);
      finder.setup('*', document);
      assert.throws(
        () => finder.onError(err),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'error', 'message');
          return true;
        }
      );
    });

    it('should not throw', () => {
      const err = new window.DOMException('error', NOT_SUPPORTED_ERR);
      const finder = new Finder(window);
      finder.setup('*', document);
      const res = finder.onError(err);
      assert.strictEqual(res, undefined, 'result');
    });

    it('should not throw', () => {
      const err = new TypeError('Unexpected type');
      const finder = new Finder(window);
      const res = finder.onError(err, {
        noexcept: true
      });
      assert.strictEqual(res, undefined, 'result');
    });

    it('should warn', () => {
      const stubWarn = sinon.stub(console, 'warn');
      const err = new window.DOMException('error', NOT_SUPPORTED_ERR);
      const finder = new Finder(window);
      finder.setup('*', document, {
        warn: true
      });
      const res = finder.onError(err);
      const { called } = stubWarn;
      stubWarn.restore();
      assert.strictEqual(called, true, 'called');
      assert.strictEqual(res, undefined, 'result');
    });
  });

  describe('setup finder', () => {
    it('should get value', () => {
      const finder = new Finder(window);
      const res = finder.setup('*', document, {
        warn: true
      });
      assert.deepEqual(res, finder, 'result');
    });

    it('should get value', () => {
      const frag = document.createDocumentFragment();
      const finder = new Finder(window);
      const res = finder.setup('*', frag, {
        warn: true
      });
      assert.deepEqual(res, finder, 'result');
    });

    it('should get value', () => {
      const node = document.createElement('div');
      const finder = new Finder(window);
      const res = finder.setup('*', node, {
        warn: true
      });
      assert.deepEqual(res, finder, 'result');
    });

    it('should get value', () => {
      const node = document.createElement('div');
      const finder = new Finder(window);
      const res = finder.setup('*', node, {
        check: true,
        noexcept: true,
        warn: false
      });
      assert.deepEqual(res, finder, 'result');
    });

    it('should get value', () => {
      const node = document.createElement('div');
      const finder = new Finder(window, {
        domSymbolTree: {},
        idlUtils: {}
      });
      const res = finder.setup('*', node, {
        domSymbolTree: {}
      });
      assert.deepEqual(res, finder, 'result');
    });
  });

  describe('match selector', () => {
    it('should match', () => {
      const ast = {
        name: 'foo',
        type: CLASS_SELECTOR
      };
      const node = document.getElementById('div5');
      const finder = new Finder(window);
      finder.setup('.foo', document);
      const res = finder.matchSelector(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'foo',
        type: CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.classList.add('foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup('.foo', document);
      const res = finder.matchSelector(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: 'bar',
        type: CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.classList.add('foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup('.foo', document);
      const res = finder.matchSelector(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'div0',
        type: ID_SELECTOR
      };
      const node = document.getElementById('div0');
      const finder = new Finder(window);
      finder.setup('.foo', document);
      const res = finder.matchSelector(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: 'foo',
        type: ID_SELECTOR
      };
      const node = document.getElementById('div0');
      const finder = new Finder(window);
      finder.setup('.foo', document);
      const res = finder.matchSelector(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'foo\\ bar',
        type: ID_SELECTOR
      };
      const node = document.createElement('div');
      node.setAttribute('id', 'foo bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup('.foo', document);
      const res = finder.matchSelector(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: null,
        finder: null,
        name: {
          name: 'hidden',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      const node = document.getElementById('span3');
      const finder = new Finder(window);
      finder.setup('[hidden]', document);
      const res = finder.matchSelector(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'dt',
        type: TYPE_SELECTOR
      };
      const node = document.getElementById('dt1');
      const finder = new Finder(window);
      finder.setup('dt', document);
      const res = finder.matchSelector(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
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
        type: PS_CLASS_SELECTOR
      };
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup(':is(ul)', document);
      const res = finder.matchSelector(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should throw', () => {
      const ast = {
        children: null,
        name: 'foo',
        type: PS_ELEMENT_SELECTOR
      };
      const node = document.documentElement;
      const finder = new Finder(window);
      finder.setup('::foo', node);
      assert.throws(
        () => finder.matchSelector(ast, node),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Unknown pseudo-element ::foo',
            'message'
          );
          return true;
        }
      );
    });

    it('should not match', () => {
      const ast = {
        children: null,
        name: 'before',
        type: PS_ELEMENT_SELECTOR
      };
      const node = document.documentElement;
      const finder = new Finder(window);
      finder.setup('::before', node);
      const res = finder.matchSelector(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        children: null,
        name: 'before',
        type: PS_ELEMENT_SELECTOR
      };
      const node = document.documentElement;
      const finder = new Finder(window);
      finder.setup('::before', node, {
        check: true
      });
      const res = finder.matchSelector(ast, node, {
        check: true
      });
      assert.strictEqual(res, true, 'result');
    });

    it('should warn', () => {
      const ast = {
        children: null,
        name: 'before',
        type: PS_ELEMENT_SELECTOR
      };
      const node = document.documentElement;
      const stubWarn = sinon.stub(console, 'warn');
      const finder = new Finder(window);
      finder.setup('::before', node, {
        warn: true
      });
      const res = finder.matchSelector(ast, node, {
        warn: true
      });
      const { called } = stubWarn;
      stubWarn.restore();
      assert.strictEqual(called, true, 'called');
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'baz',
                type: ID_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        name: 'host',
        type: PS_CLASS_SELECTOR
      };
      const html = `
          <template id="template">
            <div>
              <slot id="foo" name="bar">Foo</slot>
            </div>
          </template>
          <my-element id="baz">
            <span id="qux" slot="foo">Qux</span>
          </my-element>
        `;
      const container = document.getElementById('div0');
      container.innerHTML = html;
      class MyElement extends window.HTMLElement {
        constructor() {
          super();
          const shadowRoot = this.attachShadow({ mode: 'open' });
          const template = document.getElementById('template');
          shadowRoot.appendChild(template.content.cloneNode(true));
        }
      }
      window.customElements.define('my-element', MyElement);
      const host = document.getElementById('baz');
      const node = host.shadowRoot;
      const finder = new Finder(window);
      finder.setup(':host(#baz) div', node);
      const res = finder.matchSelector(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foobar',
                type: ID_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        name: 'host',
        type: PS_CLASS_SELECTOR
      };
      const html = `
          <template id="template">
            <div>
              <slot id="foo" name="bar">Foo</slot>
            </div>
          </template>
          <my-element id="baz">
            <span id="qux" slot="foo">Qux</span>
          </my-element>
        `;
      const container = document.getElementById('div0');
      container.innerHTML = html;
      class MyElement extends window.HTMLElement {
        constructor() {
          super();
          const shadowRoot = this.attachShadow({ mode: 'open' });
          const template = document.getElementById('template');
          shadowRoot.appendChild(template.content.cloneNode(true));
        }
      }
      window.customElements.define('my-element', MyElement);
      const host = document.getElementById('baz');
      const node = host.shadowRoot;
      const finder = new Finder(window);
      finder.setup(':host(#foobar) div', node);
      const res = finder.matchSelector(ast, node);
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('find entry nodes (via public API)', () => {
    it('should get matched node(s) for pseudo-element with check', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('#ul1::before', node, { check: true });
      const res = finder.find('self');
      assert.strictEqual(res.match, true, 'match');
      assert.strictEqual(res.pseudoElement, '::before', 'pseudoElement');
    });

    it('should not match pseudo-element with check', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('#ul1::before', node, { check: true });
      const res = finder.find('self');
      assert.strictEqual(res.match, false, 'match');
    });

    it('should get matched node(s) for pure pseudo-element', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('::before', node, { check: true });
      const res = finder.find('self');
      assert.strictEqual(res.match, true, 'match');
      assert.strictEqual(res.pseudoElement, '::before', 'pseudoElement');
    });

    it('should not match pure pseudo-element for element mismatch', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('::before', node);
      const res = finder.find('self');
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should get matched node(s) by ID from document', () => {
      const finder = new Finder(window);
      finder.setup('#ul1', document);
      const res = finder.find('first');
      assert.deepEqual([...res], [document.getElementById('ul1')], 'nodes');
    });

    it('should get matched node(s) by ID from self', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('#ul1', node);
      const res = finder.find('self');
      assert.deepEqual([...res], [node], 'nodes');
    });

    it('should not match by ID from self', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('#ul1', node);
      const res = finder.find('self');
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should get matched node by ID from lineal', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('#ul1', node);
      const res = finder.find('lineal');
      assert.deepEqual([...res], [document.getElementById('ul1')], 'nodes');
    });

    it('should get matched node(s) by complex ID', () => {
      const finder = new Finder(window);
      finder.setup('#li1.li', document);
      const res = finder.find('first');
      assert.deepEqual([...res], [document.getElementById('li1')], 'nodes');
    });

    it('should get matched node(s) by complex ID on fragment', () => {
      const parent = document.createElement('ul');
      const node = document.createElement('li');
      node.id = 'li1';
      node.classList.add('li');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup('#li1.li', parent);
      const res = finder.find('first');
      assert.deepEqual([...res], [node], 'nodes');
    });

    it('should not match by complex ID', () => {
      const finder = new Finder(window);
      finder.setup('#li1.foobar', document);
      const res = finder.find('first');
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should get matched node(s) by type and ID', () => {
      const finder = new Finder(window);
      finder.setup('ul#ul1', document);
      const res = finder.find('first');
      assert.deepEqual([...res], [document.getElementById('ul1')], 'nodes');
    });

    it('should not match non-existent ID', () => {
      const finder = new Finder(window);
      finder.setup('#foobar', document);
      const res = finder.find('first');
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should get matched node(s) by ID in DocumentFragment', () => {
      const frag = document.createDocumentFragment();
      const node = document.createElement('div');
      node.id = 'foobar';
      frag.appendChild(node);
      const finder = new Finder(window);
      finder.setup('#foobar', frag);
      const res = finder.find('first');
      assert.deepEqual([...res], [node], 'nodes');
    });

    it('should not match child ID from self context', () => {
      const node = document.createElement('div');
      node.id = 'foobar';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup('#foobar', node);
      const res = finder.find('all'); // Evaluates children, so context node is excluded
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should get matched node(s) by ID and pseudo-class', () => {
      const finder = new Finder(window);
      finder.setup('#li1:first-child', document);
      const res = finder.find('first');
      assert.deepEqual([...res], [document.getElementById('li1')], 'nodes');
    });

    it('should get matched node(s) by class first', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('.li', node);
      const res = finder.find('first');
      assert.deepEqual([...res], [document.getElementById('li1')], 'nodes');
    });

    it('should get matched node(s) by class all', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('.li', node);
      const res = finder.find('all');
      assert.deepEqual(
        [...res],
        [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ],
        'nodes'
      );
    });

    it('should get matched node(s) by class all from document', () => {
      const finder = new Finder(window);
      finder.setup('.li', document);
      const res = finder.find('all');
      assert.deepEqual(
        [...res],
        [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ],
        'nodes'
      );
    });

    it('should get matched node(s) by class in DocumentFragment', () => {
      const frag = document.createDocumentFragment();
      const parent = document.createElement('div');
      parent.classList.add('foo');
      const node = document.createElement('div');
      node.classList.add('foo');
      parent.appendChild(node);
      frag.appendChild(parent);
      const finder = new Finder(window);
      finder.setup('.foo', frag);
      const res = finder.find('all');
      assert.deepEqual([...res], [parent, node], 'nodes');
    });

    it('should get matched node(s) by type and class', () => {
      const finder = new Finder(window);
      finder.setup('li.li', document);
      const res = finder.find('all');
      assert.deepEqual(
        [...res],
        [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ],
        'nodes'
      );
    });

    it('should get matched node(s) by class from self', () => {
      const node = document.getElementById('dd2');
      const finder = new Finder(window);
      finder.setup('.dd', node);
      const res = finder.find('self');
      assert.deepEqual([...res], [node], 'nodes');
    });

    it('should not match class from self', () => {
      const node = document.getElementById('span2');
      const finder = new Finder(window);
      finder.setup('.dd', node);
      const res = finder.find('self');
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should get matched node(s) by class from lineal', () => {
      const node = document.getElementById('span2');
      const finder = new Finder(window);
      finder.setup('.dd', node);
      const res = finder.find('lineal');
      assert.deepEqual([...res], [document.getElementById('dd2')], 'nodes');
    });

    it('should not match class from lineal', () => {
      const node = document.getElementById('span2');
      const finder = new Finder(window);
      finder.setup('.li', node);
      const res = finder.find('lineal');
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should not match class from first', () => {
      const node = document.getElementById('dd1');
      const finder = new Finder(window);
      finder.setup('.dd', node);
      const res = finder.find('first'); // Expects descendant, none exist
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should get matched node(s) by type from self', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('ul', node);
      const res = finder.find('self');
      assert.deepEqual([...res], [node], 'nodes');
    });

    it('should not match type from self', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('ul', node);
      const res = finder.find('self');
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should get matched node(s) by type from lineal', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('ul', node);
      const res = finder.find('lineal');
      assert.deepEqual([...res], [document.getElementById('ul1')], 'nodes');
    });

    it('should get matched node(s) by complex selector', () => {
      const finder = new Finder(window);
      finder.setup('ul li', document);
      const res = finder.find('first');
      assert.deepEqual([...res], [document.getElementById('li1')], 'nodes');
    });

    it('should not match type from lineal', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('ol', node);
      const res = finder.find('lineal');
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should get matched node(s) by type first', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('li', node);
      const res = finder.find('first');
      assert.deepEqual([...res], [document.getElementById('li1')], 'nodes');
    });

    it('should get matched node(s) by pseudo-class', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('li:last-child', node);
      const res = finder.find('all');
      assert.deepEqual([...res], [document.getElementById('li3')], 'nodes');
    });

    it('should get matched node(s) by pseudo-class first-child', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('li:first-child', node);
      const res = finder.find('all');
      assert.deepEqual([...res], [document.getElementById('li1')], 'nodes');
    });

    it('should not match pseudo-class first-child first', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('li:first-child', node);
      const res = finder.find('first'); // Evaluates children
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should not match pseudo-class first-child self', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('dd:first-child', node);
      const res = finder.find('self');
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should get matched node(s) by complex class and pseudo-class', () => {
      const finder = new Finder(window);
      finder.setup('li.li:last-child', document);
      const res = finder.find('all');
      assert.deepEqual([...res], [document.getElementById('li3')], 'nodes');
    });

    it('should get matched node(s) resolving complex combinator path', () => {
      const finder = new Finder(window);
      finder.setup('li.li:first-child + li.li', document);
      const res = finder.find('all');
      assert.deepEqual([...res], [document.getElementById('li2')], 'nodes');
    });

    it('should get matched node(s) by multiple classes', () => {
      const frag = document.createDocumentFragment();
      const parent = document.createElement('div');
      parent.classList.add('foo', 'bar');
      const node = document.createElement('div');
      node.classList.add('foo');
      parent.appendChild(node);
      frag.appendChild(parent);
      const finder = new Finder(window);
      finder.setup('.foo.bar', frag);
      const res = finder.find('all');
      assert.deepEqual([...res], [parent], 'nodes');
    });

    it('should not match non-existent class', () => {
      const finder = new Finder(window);
      finder.setup('.foobar', document);
      const res = finder.find('all');
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should get matched node(s) by type on fragment', () => {
      const frag = document.createDocumentFragment();
      const node = document.createElement('div');
      frag.appendChild(node);
      const finder = new Finder(window);
      finder.setup('div', frag);
      const res = finder.find('all');
      assert.deepEqual([...res], [node], 'nodes');
    });

    it('should get matched node(s) by type on element', () => {
      const parent = document.createElement('div');
      const node = document.createElement('div');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup('div', parent);
      const res = finder.find('all');
      assert.deepEqual([...res], [node], 'nodes');
    });

    it('should not match type with no descendants', () => {
      const parent = document.createElement('div');
      parent.classList.add('foo');
      const node = document.createElement('div');
      node.classList.add('foo');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup('.foo', node);
      const res = finder.find('all');
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should not match type on fragment with no descendants', () => {
      const frag = document.createDocumentFragment();
      const node = document.createElement('div');
      frag.appendChild(node);
      const finder = new Finder(window);
      finder.setup('p', frag);
      const res = finder.find('all');
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should get matched node(s) by pseudo-class from self', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup(':first-child', node);
      const res = finder.find('self');
      assert.deepEqual([...res], [node], 'nodes');
    });

    it('should get matched node(s) by attribute and pseudo-class from self', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('[class]:first-child', node);
      const res = finder.find('self');
      assert.deepEqual([...res], [node], 'nodes');
    });

    it('should be resolved correctly from pending items', () => {
      const finder = new Finder(window);
      finder.setup(':first-child', document);
      const res = finder.find('first');
      assert.deepEqual([...res], [document.documentElement], 'nodes');
    });

    it('should get matched node for :host with child', () => {
      const html = `
          <template id="template">
            <div>
              <slot id="foo" name="bar">Foo</slot>
            </div>
          </template>
          <my-element id="baz">
            <span id="qux" slot="foo">Qux</span>
          </my-element>
        `;
      const container = document.getElementById('div0');
      container.innerHTML = html;
      class MyElement extends window.HTMLElement {
        constructor() {
          super();
          const shadowRoot = this.attachShadow({ mode: 'open' });
          const template = document.getElementById('template');
          shadowRoot.appendChild(template.content.cloneNode(true));
        }
      }
      if (!window.customElements.get('my-element')) {
        window.customElements.define('my-element', MyElement);
      }
      const host = document.getElementById('baz');
      const node = host.shadowRoot;
      const finder = new Finder(window);
      finder.setup(':host div', node);
      const res = finder.find('first');
      assert.deepEqual([...res], [node.querySelector('div')], 'nodes');
    });

    it('should get matched node for :host(#id) with child', () => {
      const html = `
          <template id="template">
            <div>
              <slot id="foo" name="bar">Foo</slot>
            </div>
          </template>
          <my-element id="baz">
            <span id="qux" slot="foo">Qux</span>
          </my-element>
        `;
      const container = document.getElementById('div0');
      container.innerHTML = html;
      class MyElement extends window.HTMLElement {
        constructor() {
          super();
          const shadowRoot = this.attachShadow({ mode: 'open' });
          const template = document.getElementById('template');
          shadowRoot.appendChild(template.content.cloneNode(true));
        }
      }
      if (!window.customElements.get('my-element')) {
        window.customElements.define('my-element', MyElement);
      }
      const host = document.getElementById('baz');
      const node = host.shadowRoot;
      const finder = new Finder(window);
      finder.setup(':host(#baz) div', node);
      const res = finder.find('first');
      assert.deepEqual([...res], [node.querySelector('div')], 'nodes');
    });

    it('should get matched node for :host', () => {
      const html = `
          <template id="template">
            <div>
              <slot id="foo" name="bar">Foo</slot>
            </div>
          </template>
          <my-element id="baz">
            <span id="qux" slot="foo">Qux</span>
          </my-element>
        `;
      const container = document.getElementById('div0');
      container.innerHTML = html;
      class MyElement extends window.HTMLElement {
        constructor() {
          super();
          const shadowRoot = this.attachShadow({ mode: 'open' });
          const template = document.getElementById('template');
          shadowRoot.appendChild(template.content.cloneNode(true));
        }
      }
      if (!window.customElements.get('my-element')) {
        window.customElements.define('my-element', MyElement);
      }
      const host = document.getElementById('baz');
      const node = host.shadowRoot;
      const finder = new Finder(window);
      finder.setup(':host(#baz)', node);
      const res = finder.find('self');
      assert.deepEqual([...res], [node], 'nodes');
    });

    it('should not match for :host with invalid is()', () => {
      const html = `
          <template id="template">
            <div id="foobar">
              <slot id="foo" name="bar">Foo</slot>
            </div>
          </template>
          <my-element id="baz">
            <span id="qux" slot="foo">Qux</span>
          </my-element>
        `;
      const container = document.getElementById('div0');
      container.innerHTML = html;
      class MyElement extends window.HTMLElement {
        constructor() {
          super();
          const shadowRoot = this.attachShadow({ mode: 'open' });
          const template = document.getElementById('template');
          shadowRoot.appendChild(template.content.cloneNode(true));
        }
      }
      if (!window.customElements.get('my-element')) {
        window.customElements.define('my-element', MyElement);
      }
      const host = document.getElementById('baz');
      const node = host.shadowRoot;
      const finder = new Finder(window);
      // Targeting non-existent host ID
      finder.setup(':host:is(#foobar)', node);
      const res = finder.find('self');
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should get matched node for :host:has()', () => {
      const html = `
          <template id="template">
            <div id="foobar">
              <slot id="foo" name="bar">Foo</slot>
            </div>
          </template>
          <my-element id="baz">
            <span id="qux" slot="foo">Qux</span>
          </my-element>
        `;
      const container = document.getElementById('div0');
      container.innerHTML = html;
      class MyElement extends window.HTMLElement {
        constructor() {
          super();
          const shadowRoot = this.attachShadow({ mode: 'open' });
          const template = document.getElementById('template');
          shadowRoot.appendChild(template.content.cloneNode(true));
        }
      }
      if (!window.customElements.get('my-element')) {
        window.customElements.define('my-element', MyElement);
      }
      const host = document.getElementById('baz');
      const node = host.shadowRoot;
      const finder = new Finder(window);
      finder.setup(':host:has(#foobar)', host);
      const res = finder.find('self');
      assert.deepEqual([...res], [node], 'nodes');
    });

    it('should get matched node for :host:has():host-context()', () => {
      const html = `
          <template id="template">
            <div id="foobar">
              <slot id="foo" name="bar">Foo</slot>
            </div>
          </template>
          <my-element id="baz">
            <span id="qux" slot="foo">Qux</span>
          </my-element>
        `;
      const container = document.getElementById('div0');
      container.innerHTML = html;
      class MyElement extends window.HTMLElement {
        constructor() {
          super();
          const shadowRoot = this.attachShadow({ mode: 'open' });
          const template = document.getElementById('template');
          shadowRoot.appendChild(template.content.cloneNode(true));
        }
      }
      if (!window.customElements.get('my-element')) {
        window.customElements.define('my-element', MyElement);
      }
      const host = document.getElementById('baz');
      const node = host.shadowRoot;
      const finder = new Finder(window);
      finder.setup(':host:has(#foobar):host-context(#div0)', host);
      const res = finder.find('self');
      assert.deepEqual([...res], [node], 'nodes');
    });

    it('should return precedeNodes when precede is true and nodes are found before boundary', () => {
      const node = document.getElementById('div6');
      const finder = new Finder(window);
      finder.setup('p *', node);
      const res = finder.find('first');
      assert.deepEqual([...res], [], 'result');
    });
  });

  describe('find matched nodes', () => {
    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder.setup('li:last-child, li:first-child + li', document);
      const res = finder.find('all');
      assert.deepEqual(
        [...res],
        [document.getElementById('li2'), document.getElementById('li3')],
        'result'
      );
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('li2');
      const finder = new Finder(window);
      finder.setup('li:last-child, li:first-child + li', node);
      const res = finder.find('self');
      assert.deepEqual([...res], [node], 'result');
    });

    it('should not match', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('li:last-child, li:first-child + li', node);
      const res = finder.find('self');
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      finder.setup('ul:nth-child(2) > li, li:nth-child(4) + li', document);
      const res = finder.find('all');
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder.setup('ol > .li ~ li, ul > .li ~ li', document);
      const res = finder.find('first');
      assert.deepEqual([...res], [document.getElementById('li2')], 'result');
    });

    it('should get matched node(s)', () => {
      const root = document.createElement('div');
      const div = document.createElement('div');
      const p = document.createElement('p');
      const span = document.createElement('span');
      const span2 = document.createElement('span');
      p.appendChild(span);
      p.appendChild(span2);
      div.appendChild(p);
      root.appendChild(div);
      const finder = new Finder(window);
      finder.setup('span', root);
      const res = finder.find('first');
      assert.deepEqual([...res], [span], 'result');
    });

    it('should get matched node(s)', () => {
      const root = document.createElement('div');
      const div = document.createElement('div');
      const p = document.createElement('p');
      const span = document.createElement('span');
      const span2 = document.createElement('span');
      p.appendChild(span);
      p.appendChild(span2);
      div.appendChild(p);
      root.appendChild(div);
      const finder = new Finder(window);
      finder.setup('div > p > span', root);
      const res = finder.find('all');
      assert.deepEqual([...res], [span, span2], 'result');
    });

    it('should not match', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('li:active', node);
      const res = finder.find('all');
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const parent = document.getElementById('div0');
      const div = document.createElement('div');
      const div2 = document.createElement('div');
      const span = document.createElement('span');
      const span2 = document.createElement('span');
      const span3 = document.createElement('span');
      const span4 = document.createElement('span');
      const span5 = document.createElement('span');
      const span6 = document.createElement('span');
      const span7 = document.createElement('span');
      const span8 = document.createElement('span');
      div.id = 'div01';
      div.classList.add('foobar');
      div.appendChild(span);
      div.appendChild(span2);
      div.appendChild(span3);
      div.appendChild(span4);
      div2.id = 'div02';
      div2.classList.add('foobar');
      div2.appendChild(span5);
      div2.appendChild(span6);
      div2.appendChild(span7);
      div2.appendChild(span8);
      parent.append(div, div2);
      const finder = new Finder(window);
      finder.setup('.foobar > :not([hidden]) ~ :not([hidden])', parent);
      const res = finder.find('all');
      assert.deepEqual(
        [...res],
        [span2, span3, span4, span6, span7, span8],
        'result'
      );
    });

    it('should get matched node', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('li::before', node, {
        check: true
      });
      const res = finder.find('self');
      assert.deepEqual(
        res,
        {
          match: true,
          pseudoElement: '::before',
          ast: cssTree.parse('li::before', {
            context: 'selectorList'
          })
        },
        'result'
      );
    });

    it('should get matched node', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('li.li::before::marker', node, {
        check: true
      });
      const res = finder.find('self');
      assert.deepEqual(
        res,
        {
          match: true,
          pseudoElement: '::before::marker',
          ast: cssTree.parse('li.li::before::marker', {
            context: 'selectorList'
          })
        },
        'result'
      );
    });

    it('should get matched node', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('li', node, {
        check: true
      });
      const res = finder.find('self');
      assert.deepEqual(
        res,
        {
          match: true,
          pseudoElement: null,
          ast: cssTree.parse('li', {
            context: 'selectorList'
          })
        },
        'result'
      );
    });

    it('should merge multiple branches and require sorting', () => {
      const finder = new Finder(window);
      finder.setup('p, span', document);
      const res = finder.find('all');
      assert.strictEqual(
        res.size,
        12,
        'should merge and collect all nodes from multiple branches'
      );
    });

    it('should use fast path for single sorted branch', () => {
      const node = document.getElementById('div1');
      const finder = new Finder(window);
      finder.setup('div', node);
      const res = finder.find('all');
      assert.strictEqual(res.has(node), false, 'excludes context node');
      assert.strictEqual(
        res.has(document.getElementById('div2')),
        true,
        'includes descendant node'
      );
      assert.strictEqual(res.size, 6, 'div2, div3, div4, div5, div6, div7');
    });

    it('should use basic set conversion for single sorted branch', () => {
      const finder = new Finder(window);
      finder.setup('div', document);
      const res = finder.find('all');
      assert.strictEqual(
        res.has(document.getElementById('div0')),
        true,
        'includes div0 from document root'
      );
      assert.strictEqual(
        res.has(document.getElementById('div1')),
        true,
        'includes div1'
      );
    });

    it('should handle single unsorted branch', () => {
      const node = document.getElementById('dl1');
      const finder = new Finder(window);
      finder.setup('[hidden]', node);
      const res = finder.find('all');
      assert.strictEqual(
        res.size,
        2,
        'matches elements using TreeWalker fallback'
      );
      assert.strictEqual(
        res.has(document.getElementById('span1')),
        true,
        'includes span1'
      );
      assert.strictEqual(
        res.has(document.getElementById('span3')),
        true,
        'includes span3'
      );
    });

    it('should handle multiple branches', () => {
      const finder = new Finder(window);
      finder.setup('ol, ul', document);
      const res = finder.find('all');
      assert.strictEqual(res.size, 1, 'matches only the second branch');
      assert.strictEqual(
        res.has(document.getElementById('ul1')),
        true,
        'includes ul1'
      );
    });

    it('should advance refNode using force:true when multiple nodes fail the complex branch condition without duplicate IDs', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div class="parent">
          <div>
            <div class="parent">
              <div>
                <div class="parent">
                  <div class="child">
                    <span class="target"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(container);
      const finder = new Finder(window);
      finder.setup('.parent > .child > .target', document);
      const res = finder.find('first');
      assert.deepEqual(
        [...res],
        [container.querySelector('.target')],
        'result'
      );
      document.body.removeChild(container);
    });

    it('should break traversal when currentNode equals boundaryNode', () => {
      const node = document.getElementById('p5');
      const finder = new Finder(window);
      finder.setup('h1 *', node);
      const res = finder.find('first');
      assert.deepEqual([...res], [], 'result');
    });
  });
});
