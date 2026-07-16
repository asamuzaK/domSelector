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
  COMBINATOR,
  IDENT,
  ID_SELECTOR,
  NOT_SUPPORTED_ERR,
  NTH,
  PS_CLASS_SELECTOR,
  PS_ELEMENT_SELECTOR,
  SELECTOR,
  SYNTAX_ERR,
  TYPE_SELECTOR
} from '../src/js/constant.js';
const AN_PLUS_B = 'AnPlusB';
const SELECTOR_LIST = 'SelectorList';

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

  describe('correspond ast and nodes', () => {
    it('should throw', () => {
      const finder = new Finder(window);
      finder.setup('[foo==bar]', document);
      assert.throws(
        () => finder._correspond('[foo==bar]'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector [foo==bar]',
            'message'
          );
          return true;
        }
      );
    });

    it('should throw', () => {
      const finder = new Finder(window);
      finder.setup('li ++ li', document);
      assert.throws(
        () => finder._correspond('li ++ li'),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector li ++ li', 'message');
          return true;
        }
      );
    });

    it('should validate :has() nesting and throw SyntaxError for disallowed nesting', () => {
      const finder = new Finder(window);
      finder.setup('*', document);
      assert.throws(
        () => finder._correspond(':has(:has(li))'),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.match(
            e.message,
            /^Disallowed nested :has\(\) pseudo-class: :has\(.*\)$/,
            'message'
          );
          return true;
        }
      );
      assert.throws(
        () => finder._correspond('div:has(:not(:has(span)))'),
        e => {
          assert.strictEqual(e.name, SYNTAX_ERR);
          return true;
        }
      );
    });

    it('should pass validation for allowed nested :has() (forgiven nesting)', () => {
      const finder = new Finder(window);
      finder.setup('*', document);
      const res = finder._correspond(':has(:is(:has(li)))');
      assert.strictEqual(
        Array.isArray(res),
        true,
        'should return [ast, nodes]'
      );
      assert.strictEqual(res[0].length, 1, 'should have one branch');
    });
  });

  describe(':focus-within branch coverage (Set caching)', () => {
    afterEach(() => {
      delete document.activeElement;
    });

    it('should traverse Light DOM', () => {
      const parent = document.createElement('div');
      const child = document.createElement('input');
      parent.appendChild(child);
      document.body.appendChild(parent);
      Object.defineProperty(document, 'activeElement', {
        value: child,
        configurable: true
      });
      const finder = new Finder(window);
      finder.setup(':focus-within', parent, { check: true });
      assert.strictEqual(finder.find('self').match, true, 'parent matches');
      document.body.removeChild(parent);
    });

    it('should traverse Shadow DOM boundary in Block 1', () => {
      const host = document.createElement('div');
      const shadow = host.attachShadow({ mode: 'open' });
      const child = document.createElement('input');
      shadow.appendChild(child);
      document.body.appendChild(host);
      Object.defineProperty(document, 'activeElement', {
        value: child,
        configurable: true
      });
      const finder = new Finder(window);
      finder.setup(':focus-within', host, { check: true });
      assert.strictEqual(
        finder.find('self').match,
        true,
        'host matches via shadow root traversal'
      );
      document.body.removeChild(host);
    });

    it('should traverse Shadow DOM boundary in Block 2', () => {
      const host = document.createElement('div');
      const shadow = host.attachShadow({ mode: 'open' });
      const innerDiv = document.createElement('div');
      const child = document.createElement('input'); // focusable
      innerDiv.appendChild(child);
      shadow.appendChild(innerDiv);
      document.body.appendChild(host);
      Object.defineProperty(document, 'activeElement', {
        value: host,
        configurable: true
      });
      Object.defineProperty(shadow, 'activeElement', {
        value: child,
        configurable: true
      });
      const finder = new Finder(window);
      finder.setup(':focus-within', host, { check: true });
      assert.strictEqual(finder.find('self').match, true, 'host matches');
      finder.setup(':focus-within', innerDiv, { check: true });
      assert.strictEqual(
        finder.find('self').match,
        true,
        'innerDiv inside shadow matches'
      );
      document.body.removeChild(host);
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

  describe('find matched node(s) preceding this.#node', () => {
    it('should get matched node', () => {
      const finder = new Finder(window);
      const node = document.getElementById('p5');
      finder.setup('div.foo p', node);
      const [
        [
          {
            branch: [{ leaves }]
          }
        ]
      ] = finder._correspond('div.foo p');
      const res = finder._findPrecede(leaves, document);
      assert.deepEqual(res, [document.getElementById('div5')], 'result');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      const node = document.getElementById('p5');
      finder.setup('div.foo p', node);
      const [
        [
          {
            branch: [{ leaves }]
          }
        ]
      ] = finder._correspond('div.foo p');
      const res = finder._findPrecede(leaves, document, {
        targetType: 'all'
      });
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const finder = new Finder(window);
      const node = document.getElementById('p5');
      const current = document.getElementById('div5');
      finder.setup('div.foo p', node);
      const [
        [
          {
            branch: [{ leaves }]
          }
        ]
      ] = finder._correspond('div.foo p');
      const res = finder._findPrecede(leaves, current, {
        force: true
      });
      assert.deepEqual(res, [document.getElementById('div6')], 'result');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      const node = document.getElementById('p5');
      const current = document.getElementById('div6');
      finder.setup('div.foo p', node);
      const [
        [
          {
            branch: [{ leaves }]
          }
        ]
      ] = finder._correspond('div.foo p');
      const res = finder._findPrecede(leaves, current, {
        force: true
      });
      assert.deepEqual(res, [], 'result');
    });
  });

  describe('find matched node(s) in #nodeWalker', () => {
    it('should get matched node', () => {
      const finder = new Finder(window);
      finder.setup('ul', document);
      const [
        [
          {
            branch: [{ leaves }]
          }
        ]
      ] = finder._correspond('ul');
      const res = finder._findNodeWalker(leaves, document);
      assert.deepEqual(res, [document.getElementById('ul1')], 'result');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      finder.setup('ol', document);
      const [
        [
          {
            branch: [{ leaves }]
          }
        ]
      ] = finder._correspond('ol');
      const res = finder._findNodeWalker(leaves, document);
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const node = document.createElement('ul');
      const child = document.createElement('li');
      node.appendChild(child);
      const finder = new Finder(window);
      finder.setup('ul', node);
      const [
        [
          {
            branch: [{ leaves }]
          }
        ]
      ] = finder._correspond('ul');
      const res = finder._findNodeWalker(leaves, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const node = document.createElement('ul');
      const child = document.createElement('li');
      node.appendChild(child);
      const finder = new Finder(window);
      finder.setup('li', node);
      const [
        [
          {
            branch: [{ leaves }]
          }
        ]
      ] = finder._correspond('li');
      const res = finder._findNodeWalker(leaves, node);
      assert.deepEqual(res, [child], 'result');
    });

    it('should get matched node', () => {
      const node = document.createElement('ul');
      const child = document.createElement('li');
      const child2 = document.createElement('li');
      node.append(child, child2);
      const finder = new Finder(window);
      finder.setup('li', node);
      const [
        [
          {
            branch: [{ leaves }]
          }
        ]
      ] = finder._correspond('li');
      const res = finder._findNodeWalker(leaves, node);
      assert.deepEqual(res, [child], 'result');
    });

    it('should get matched nodes', () => {
      const node = document.createElement('ul');
      const child = document.createElement('li');
      const child2 = document.createElement('li');
      node.append(child, child2);
      const finder = new Finder(window);
      finder.setup('li', node);
      const [
        [
          {
            branch: [{ leaves }]
          }
        ]
      ] = finder._correspond('li');
      const res = finder._findNodeWalker(leaves, node, {
        targetType: 'all'
      });
      assert.deepEqual(res, [child, child2], 'result');
    });

    it('should not match', () => {
      const node = document.createElement('ul');
      const child = document.createElement('li');
      node.appendChild(child);
      const finder = new Finder(window);
      finder.setup('ul', node);
      const [
        [
          {
            branch: [{ leaves }]
          }
        ]
      ] = finder._correspond('ul');
      const res = finder._findNodeWalker(leaves, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const finder = new Finder(window);
      finder.setup('li', document);
      const [
        [
          {
            branch: [{ leaves }]
          }
        ]
      ] = finder._correspond('li');
      const res = finder._findNodeWalker(
        leaves,
        document.getElementById('li1')
      );
      assert.deepEqual(res, [document.getElementById('li2')], 'result');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      finder.setup('li', document);
      const [
        [
          {
            branch: [{ leaves }]
          }
        ]
      ] = finder._correspond('li');
      const res = finder._findNodeWalker(
        leaves,
        document.getElementById('li3')
      );
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      finder.setup('li', document);
      const [
        [
          {
            branch: [{ leaves }]
          }
        ]
      ] = finder._correspond('li');
      finder._findNodeWalker(leaves, document.getElementById('li2'));
      const res = finder._findNodeWalker(
        leaves,
        document.getElementById('li1'),
        {
          force: true
        }
      );
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      const node = document.getElementById('li1');
      finder.setup('ul li', node);
      const [
        [
          {
            branch: [{ leaves }]
          }
        ]
      ] = finder._correspond('ul li');
      const res = finder._findNodeWalker(leaves, node);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      const node = document.getElementById('li1');
      finder.setup('ul li', node);
      const [
        [
          {
            branch: [{ leaves }]
          }
        ]
      ] = finder._correspond('ul li');
      const res = finder._findNodeWalker(leaves, node, {
        precede: true
      });
      assert.deepEqual(res, [document.getElementById('ul1')], 'result');
    });
  });

  describe('match self', () => {
    it('should match', () => {
      const node = document.getElementById('li1');
      const leaves = [
        {
          name: 'li',
          type: CLASS_SELECTOR
        },
        {
          name: 'li',
          type: TYPE_SELECTOR
        }
      ];
      const finder = new Finder(window);
      finder.setup('li.li', node);
      const res = finder._matchSelf(leaves);
      assert.deepEqual(res, [[node], true, []], 'result');
    });

    it('should not match', () => {
      const node = document.getElementById('li1');
      const leaves = [
        {
          name: 'foo',
          type: CLASS_SELECTOR
        },
        {
          name: 'li',
          type: TYPE_SELECTOR
        }
      ];
      const finder = new Finder(window);
      finder.setup('li.foo', node);
      const res = finder._matchSelf(leaves);
      assert.deepEqual(res, [[], false, []], 'result');
    });

    it('should match', () => {
      const node = document.getElementById('li1');
      const leaves = [
        {
          children: null,
          name: 'before',
          type: PS_ELEMENT_SELECTOR
        },
        {
          children: null,
          name: 'marker',
          type: PS_ELEMENT_SELECTOR
        },
        {
          name: 'li',
          type: CLASS_SELECTOR
        },
        {
          name: 'li',
          type: TYPE_SELECTOR
        }
      ];
      const finder = new Finder(window);
      finder.setup('li.li::before::marker', node, {
        check: true
      });
      const res = finder._matchSelf(leaves, true);
      assert.deepEqual(res, [[node], true, ['::before', '::marker']], 'result');
    });
  });

  describe('find lineal', () => {
    it('should match', () => {
      const node = document.getElementById('li1');
      const leaf = {
        name: 'li',
        type: TYPE_SELECTOR
      };
      const finder = new Finder(window);
      finder.setup('li', node);
      const res = finder._findLineal([leaf], {
        complex: false
      });
      assert.deepEqual(res, [[document.getElementById('li1')], true], 'result');
    });

    it('should match', () => {
      const node = document.getElementById('li1');
      const leaf = {
        name: 'li',
        type: TYPE_SELECTOR
      };
      const finder = new Finder(window);
      finder.setup('ul > li', node);
      const res = finder._findLineal([leaf], {
        complex: true
      });
      assert.deepEqual(res, [[document.getElementById('li1')], true], 'result');
    });

    it('should match', () => {
      const node = document.getElementById('li1');
      const leaf = {
        name: 'ul',
        type: TYPE_SELECTOR
      };
      const finder = new Finder(window);
      finder.setup('ul', node);
      const res = finder._findLineal([leaf], {
        complex: false
      });
      assert.deepEqual(res, [[document.getElementById('ul1')], true], 'result');
    });

    it('should not match', () => {
      const node = document.getElementById('li1');
      const leaf = {
        name: 'ol',
        type: TYPE_SELECTOR
      };
      const finder = new Finder(window);
      finder.setup('ol', node);
      const res = finder._findLineal([leaf], {
        complex: false
      });
      assert.deepEqual(res, [[], false], 'result');
    });

    it('should match', () => {
      const node = document.getElementById('li2');
      const leaf = {
        name: 'li',
        type: CLASS_SELECTOR
      };
      const finder = new Finder(window);
      finder.setup('li.li', node);
      const res = finder._findLineal([leaf], {
        complex: false
      });
      assert.deepEqual(res, [[document.getElementById('li2')], true], 'result');
    });

    it('should match', () => {
      const node = document.getElementById('li2');
      const leaf = {
        name: 'li',
        type: CLASS_SELECTOR
      };
      const finder = new Finder(window);
      finder.setup('li + li.li', node);
      const res = finder._findLineal([leaf], {
        complex: true
      });
      assert.deepEqual(res, [[document.getElementById('li2')], true], 'result');
    });
  });

  describe('find entry nodes', () => {
    it('should get matched node(s)', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('#ul1::before', node, {
        check: true
      });
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('#ul1::before');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual(res.nodes, [node], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should not match', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('#ul1::before', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('#ul1::before');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual(res.nodes, [], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, false, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('::before', node, {
        check: true
      });
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('::before');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual(res.nodes, [node], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should not match', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('::before', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('::before');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual(res.nodes, [], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, false, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder.setup('#ul1', document);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('#ul1');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual(res.nodes, [document.getElementById('ul1')], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('#ul1', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('#ul1');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual(res.nodes, [node], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should not match', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('#ul1', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('#ul1');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual(res.nodes, [], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, false, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('#ul1', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('#ul1');
      const res = finder._findEntryNodes(twig, 'lineal');
      assert.deepEqual(res.nodes, [document.getElementById('ul1')], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder.setup('#li1.li', document);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('#li1.li');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual(res.nodes, [document.getElementById('li1')], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const parent = document.createElement('ul');
      const node = document.createElement('li');
      node.id = 'li1';
      node.classList.add('li');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup('#li1.li', parent);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('#li1.li');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual(res.nodes, [node], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      finder.setup('#li1.foobar', document);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('#li1.foobar');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual(res.nodes, [], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, false, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder.setup('ul#ul1', document);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('ul#ul1');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual(res.nodes, [document.getElementById('ul1')], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      finder.setup('#foobar', document);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('#foobar');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual(res.nodes, [], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, false, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const frag = document.createDocumentFragment();
      const node = document.createElement('div');
      node.id = 'foobar';
      frag.appendChild(node);
      const finder = new Finder(window);
      finder.setup('#foobar', frag);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('#foobar');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual(res.nodes, [node], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should not match', () => {
      const node = document.createElement('div');
      node.id = 'foobar';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup('#foobar', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('#foobar');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(res.nodes, [], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, false, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder.setup('#li1:first-child', document);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('#li1:first-child');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual(res.nodes, [document.getElementById('li1')], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('.li', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('.li');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual(res.nodes, [document.getElementById('li1')], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('.li', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('.li');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(
        res.nodes,
        [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ],
        'nodes'
      );
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder.setup('.li', document);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('.li');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(
        res.nodes,
        [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ],
        'nodes'
      );
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const frag = document.createDocumentFragment();
      const parent = document.createElement('div');
      parent.classList.add('foo');
      const node = document.createElement('div');
      node.classList.add('foo');
      parent.appendChild(node);
      frag.appendChild(parent);
      const finder = new Finder(window);
      finder.setup('.foo', frag);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('.foo');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(res.nodes, [parent, node], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder.setup('li.li', document);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('li.li');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(
        res.nodes,
        [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ],
        'nodes'
      );
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('dd2');
      const finder = new Finder(window);
      finder.setup('.dd', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('.dd');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual(res.nodes, [node], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should not match', () => {
      const node = document.getElementById('span2');
      const finder = new Finder(window);
      finder.setup('.dd', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('.dd');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual(res.nodes, [], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, false, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('span2');
      const finder = new Finder(window);
      finder.setup('.dd', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('.dd');
      const res = finder._findEntryNodes(twig, 'lineal');
      assert.deepEqual(res.nodes, [document.getElementById('dd2')], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should not match', () => {
      const node = document.getElementById('span2');
      const finder = new Finder(window);
      finder.setup('.li', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('.li');
      const res = finder._findEntryNodes(twig, 'lineal');
      assert.deepEqual(res.nodes, [], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, false, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should not match', () => {
      const node = document.getElementById('dd1');
      const finder = new Finder(window);
      finder.setup('.dd', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('.dd');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual(res.nodes, [], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, false, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('ul', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('ul');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual(res.nodes, [node], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should not match', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('ul', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('ul');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual(res.nodes, [], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, false, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('ul', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('ul');
      const res = finder._findEntryNodes(twig, 'lineal');
      assert.deepEqual(res.nodes, [document.getElementById('ul1')], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('ul li', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('ul li');
      const res = finder._findEntryNodes(twig, 'first', {
        complex: true,
        dir: 'next'
      });
      assert.deepEqual(res.nodes, [document.getElementById('ul1')], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should not match', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('ol', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('ol');
      const res = finder._findEntryNodes(twig, 'lineal');
      assert.deepEqual(res.nodes, [], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, false, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('li', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('li');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual(res.nodes, [document.getElementById('li1')], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('li:last-child', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('li:last-child');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(res.nodes, [document.getElementById('li3')], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('li:first-child', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('li:first-child');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(res.nodes, [document.getElementById('li1')], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should not match', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('li:first-child', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('li:first-child');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual(res.nodes, [], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, false, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should not match', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('dd:first-child', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('dd:first-child');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual(res.nodes, [], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, false, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder.setup('li.li:last-child', document);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('li.li:last-child');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(res.nodes, [document.getElementById('li3')], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder.setup('li.li:first-child + li.li', document);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('li.li:first-child + li.li');
      const res = finder._findEntryNodes(twig, 'all', {
        complex: true
      });
      assert.deepEqual(res.nodes, [document.getElementById('li1')], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const frag = document.createDocumentFragment();
      const parent = document.createElement('div');
      parent.classList.add('foo');
      parent.classList.add('bar');
      const node = document.createElement('div');
      node.classList.add('foo');
      parent.appendChild(node);
      frag.appendChild(parent);
      const finder = new Finder(window);
      finder.setup('.foo.bar', frag);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('.foo.bar');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(res.nodes, [parent], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      finder.setup('.foobar', document);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('.foobar');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(res.nodes, [], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, false, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const frag = document.createDocumentFragment();
      const node = document.createElement('div');
      frag.appendChild(node);
      const finder = new Finder(window);
      finder.setup('div', frag);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('div');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(res.nodes, [node], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const parent = document.createElement('div');
      const node = document.createElement('div');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup('div', parent);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('div');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(res.nodes, [node], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should not match', () => {
      const parent = document.createElement('div');
      parent.classList.add('foo');
      const node = document.createElement('div');
      node.classList.add('foo');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup('.foo', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('.foo');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(res.nodes, [], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, false, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should not match', () => {
      const frag = document.createDocumentFragment();
      const node = document.createElement('div');
      frag.appendChild(node);
      const finder = new Finder(window);
      finder.setup('p', frag);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('p');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(res.nodes, [], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, false, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup(':first-child', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond(':first-child');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual(res.nodes, [node], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('[class]:first-child', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond('[class]:first-child');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual(res.nodes, [node], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should be pended', () => {
      const finder = new Finder(window);
      finder.setup(':first-child', document);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond(':first-child');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(res.nodes, [], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, false, 'filtered');
      assert.strictEqual(res.pending, true, 'pending');
    });

    it('should get matched node', () => {
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
      finder.setup(':host div', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond(':host div');
      const res = finder._findEntryNodes(twig, 'first', {
        complex: true,
        dir: 'next'
      });
      assert.deepEqual(res.nodes, [node], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node', () => {
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
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond(':host(#baz) div');
      const res = finder._findEntryNodes(twig, 'first', {
        complex: true
      });
      assert.deepEqual(res.nodes, [node], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node', () => {
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
      finder.setup(':host(#baz)', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond(':host(#baz)');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual(res.nodes, [node], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should not match', () => {
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
      window.customElements.define('my-element', MyElement);
      const host = document.getElementById('baz');
      const node = host.shadowRoot;
      const finder = new Finder(window);
      finder.setup(':host:is(#baz)', node);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond(':host:is(#baz)');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual(res.nodes, [], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, false, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node', () => {
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
      window.customElements.define('my-element', MyElement);
      const host = document.getElementById('baz');
      const node = host.shadowRoot;
      const finder = new Finder(window);
      finder.setup(':host:has(#foobar)', host);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond(':host:has(#foobar)');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual(res.nodes, [node], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node', () => {
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
      window.customElements.define('my-element', MyElement);
      const host = document.getElementById('baz');
      const node = host.shadowRoot;
      const finder = new Finder(window);
      finder.setup(':host:has(#foobar):host-context(#div0)', host);
      const [
        [
          {
            branch: [twig]
          }
        ]
      ] = finder._correspond(':host:has(#foobar):host-context(#div0)');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual(res.nodes, [node], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });
  });

  describe('collect nodes', () => {
    it('should get list and matrix', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('li:last-child, li:first-child + li', node);
      const res = finder._collectNodes('self');
      assert.deepEqual(
        res,
        [
          [
            {
              branch: [
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'li',
                      type: TYPE_SELECTOR
                    },
                    {
                      children: null,
                      loc: null,
                      name: 'last-child',
                      type: PS_CLASS_SELECTOR
                    }
                  ]
                }
              ],
              dir: 'prev',
              filtered: false,
              find: false
            },
            {
              branch: [
                {
                  combo: {
                    loc: null,
                    name: '+',
                    type: COMBINATOR
                  },
                  leaves: [
                    {
                      loc: null,
                      name: 'li',
                      type: TYPE_SELECTOR
                    },
                    {
                      children: null,
                      loc: null,
                      name: 'first-child',
                      type: PS_CLASS_SELECTOR
                    }
                  ]
                },
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'li',
                      type: TYPE_SELECTOR
                    }
                  ]
                }
              ],
              dir: 'prev',
              filtered: true,
              find: true
            }
          ],
          [[], [node]]
        ],
        'result'
      );
    });

    it('should get list and matrix', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('li:last-child, li:first-child + li', node);
      const res = finder._collectNodes('lineal');
      assert.deepEqual(
        res,
        [
          [
            {
              branch: [
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'li',
                      type: TYPE_SELECTOR
                    },
                    {
                      children: null,
                      loc: null,
                      name: 'last-child',
                      type: PS_CLASS_SELECTOR
                    }
                  ]
                }
              ],
              dir: 'prev',
              filtered: false,
              find: false
            },
            {
              branch: [
                {
                  combo: {
                    loc: null,
                    name: '+',
                    type: COMBINATOR
                  },
                  leaves: [
                    {
                      loc: null,
                      name: 'li',
                      type: TYPE_SELECTOR
                    },
                    {
                      children: null,
                      loc: null,
                      name: 'first-child',
                      type: PS_CLASS_SELECTOR
                    }
                  ]
                },
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'li',
                      type: TYPE_SELECTOR
                    }
                  ]
                }
              ],
              dir: 'prev',
              filtered: true,
              find: true
            }
          ],
          [[], [node]]
        ],
        'result'
      );
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder.setup('li:last-child, li:first-child + li', document);
      const res = finder._collectNodes('first');
      assert.deepEqual(
        res,
        [
          [
            {
              branch: [
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'li',
                      type: TYPE_SELECTOR
                    },
                    {
                      children: null,
                      loc: null,
                      name: 'last-child',
                      type: PS_CLASS_SELECTOR
                    }
                  ]
                }
              ],
              dir: 'prev',
              filtered: true,
              find: true
            },
            {
              branch: [
                {
                  combo: {
                    loc: null,
                    name: '+',
                    type: COMBINATOR
                  },
                  leaves: [
                    {
                      loc: null,
                      name: 'li',
                      type: TYPE_SELECTOR
                    },
                    {
                      children: null,
                      loc: null,
                      name: 'first-child',
                      type: PS_CLASS_SELECTOR
                    }
                  ]
                },
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'li',
                      type: TYPE_SELECTOR
                    }
                  ]
                }
              ],
              dir: 'prev',
              filtered: true,
              find: true
            }
          ],
          [[document.getElementById('li3')], [document.getElementById('li1')]]
        ],
        'result'
      );
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder.setup('li:last-child, li:first-child + li', document);
      const res = finder._collectNodes('all');
      assert.deepEqual(
        res,
        [
          [
            {
              branch: [
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'li',
                      type: TYPE_SELECTOR
                    },
                    {
                      children: null,
                      loc: null,
                      name: 'last-child',
                      type: PS_CLASS_SELECTOR
                    }
                  ]
                }
              ],
              dir: 'prev',
              filtered: true,
              find: true
            },
            {
              branch: [
                {
                  combo: {
                    loc: null,
                    name: '+',
                    type: COMBINATOR
                  },
                  leaves: [
                    {
                      loc: null,
                      name: 'li',
                      type: TYPE_SELECTOR
                    },
                    {
                      children: null,
                      loc: null,
                      name: 'first-child',
                      type: PS_CLASS_SELECTOR
                    }
                  ]
                },
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'li',
                      type: TYPE_SELECTOR
                    }
                  ]
                }
              ],
              dir: 'prev',
              filtered: true,
              find: true
            }
          ],
          [
            [document.getElementById('li3')],
            [
              document.getElementById('li1'),
              document.getElementById('li2'),
              document.getElementById('li3')
            ]
          ]
        ],
        'result'
      );
    });

    it('should get list and matrix', () => {
      const root = document.createElement('div');
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const div3 = document.createElement('div');
      const div4 = document.createElement('div');
      root.appendChild(div1);
      root.appendChild(div2);
      root.appendChild(div3);
      root.appendChild(div4);
      const finder = new Finder(window);
      finder.setup(':nth-child(2n), :nth-of-type(2n+3)', root);
      const res = finder._collectNodes('all');
      assert.deepEqual(
        res,
        [
          [
            {
              branch: [
                {
                  combo: null,
                  leaves: [
                    {
                      children: [
                        {
                          loc: null,
                          nth: {
                            a: '2',
                            b: null,
                            loc: null,
                            type: AN_PLUS_B
                          },
                          selector: null,
                          type: NTH
                        }
                      ],
                      loc: null,
                      name: 'nth-child',
                      type: PS_CLASS_SELECTOR
                    }
                  ]
                }
              ],
              dir: 'prev',
              filtered: true,
              find: true
            },
            {
              branch: [
                {
                  combo: null,
                  leaves: [
                    {
                      children: [
                        {
                          loc: null,
                          nth: {
                            a: '2',
                            b: '3',
                            loc: null,
                            type: AN_PLUS_B
                          },
                          selector: null,
                          type: NTH
                        }
                      ],
                      loc: null,
                      name: 'nth-of-type',
                      type: PS_CLASS_SELECTOR
                    }
                  ]
                }
              ],
              dir: 'prev',
              filtered: true,
              find: true
            }
          ],
          [[div2, div4], [div3]]
        ],
        'result'
      );
    });

    it('should get list and matrix', () => {
      const frag = document.createDocumentFragment();
      const root = document.createElement('div');
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const div3 = document.createElement('div');
      const div4 = document.createElement('div');
      root.appendChild(div1);
      root.appendChild(div2);
      root.appendChild(div3);
      root.appendChild(div4);
      frag.appendChild(root);
      const finder = new Finder(window);
      finder.setup(':nth-child(2n), :nth-of-type(2n+3)', frag);
      const res = finder._collectNodes('all');
      assert.deepEqual(
        res,
        [
          [
            {
              branch: [
                {
                  combo: null,
                  leaves: [
                    {
                      children: [
                        {
                          loc: null,
                          nth: {
                            a: '2',
                            b: null,
                            loc: null,
                            type: AN_PLUS_B
                          },
                          selector: null,
                          type: NTH
                        }
                      ],
                      loc: null,
                      name: 'nth-child',
                      type: PS_CLASS_SELECTOR
                    }
                  ]
                }
              ],
              dir: 'prev',
              filtered: true,
              find: true
            },
            {
              branch: [
                {
                  combo: null,
                  leaves: [
                    {
                      children: [
                        {
                          loc: null,
                          nth: {
                            a: '2',
                            b: '3',
                            loc: null,
                            type: AN_PLUS_B
                          },
                          selector: null,
                          type: NTH
                        }
                      ],
                      loc: null,
                      name: 'nth-of-type',
                      type: PS_CLASS_SELECTOR
                    }
                  ]
                }
              ],
              dir: 'prev',
              filtered: true,
              find: true
            }
          ],
          [[div2, div4], [div3]]
        ],
        'result'
      );
    });

    it('should get list and matrix', () => {
      const doc = new window.DOMParser().parseFromString(
        '<foo></foo>',
        'text/xml'
      );
      const root = document.createElement('root');
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const div3 = document.createElement('div');
      const div4 = document.createElement('div');
      root.appendChild(div1);
      root.appendChild(div2);
      root.appendChild(div3);
      root.appendChild(div4);
      doc.documentElement.appendChild(root);
      const finder = new Finder(window);
      finder.setup('div', div2);
      const res = finder._collectNodes('self');
      assert.deepEqual(
        res,
        [
          [
            {
              branch: [
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'div',
                      type: TYPE_SELECTOR
                    }
                  ]
                }
              ],
              dir: 'prev',
              filtered: true,
              find: true
            }
          ],
          [[div2]]
        ],
        'result'
      );
    });

    it('should get list and matrix', () => {
      const doc = new window.DOMParser().parseFromString(
        '<foo></foo>',
        'text/xml'
      );
      const root = document.createElement('root');
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const div3 = document.createElement('div');
      const div4 = document.createElement('div');
      root.appendChild(div1);
      root.appendChild(div2);
      root.appendChild(div3);
      root.appendChild(div4);
      doc.documentElement.appendChild(root);
      const finder = new Finder(window);
      finder.setup('root', div2);
      const res = finder._collectNodes('lineal');
      assert.deepEqual(
        res,
        [
          [
            {
              branch: [
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'root',
                      type: TYPE_SELECTOR
                    }
                  ]
                }
              ],
              dir: 'prev',
              filtered: true,
              find: true
            }
          ],
          [[root]]
        ],
        'result'
      );
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder.setup('* > li', document);
      const res = finder._collectNodes('all');
      assert.deepEqual(
        res,
        [
          [
            {
              branch: [
                {
                  combo: {
                    loc: null,
                    name: '>',
                    type: COMBINATOR
                  },
                  leaves: [
                    {
                      loc: null,
                      name: '*',
                      type: TYPE_SELECTOR
                    }
                  ]
                },
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'li',
                      type: TYPE_SELECTOR
                    }
                  ]
                }
              ],
              dir: 'prev',
              filtered: true,
              find: true
            }
          ],
          [
            [
              document.getElementById('li1'),
              document.getElementById('li2'),
              document.getElementById('li3')
            ]
          ]
        ],
        'result'
      );
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder.setup('* > li', document);
      const res = finder._collectNodes('first');
      assert.deepEqual(
        res,
        [
          [
            {
              branch: [
                {
                  combo: {
                    loc: null,
                    name: '>',
                    type: COMBINATOR
                  },
                  leaves: [
                    {
                      loc: null,
                      name: '*',
                      type: TYPE_SELECTOR
                    }
                  ]
                },
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'li',
                      type: TYPE_SELECTOR
                    }
                  ]
                }
              ],
              dir: 'prev',
              filtered: true,
              find: true
            }
          ],
          [[document.getElementById('li1')]]
        ],
        'result'
      );
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder.setup('ul > *', document);
      const res = finder._collectNodes('all');
      assert.deepEqual(
        res,
        [
          [
            {
              branch: [
                {
                  combo: {
                    loc: null,
                    name: '>',
                    type: COMBINATOR
                  },
                  leaves: [
                    {
                      loc: null,
                      name: 'ul',
                      type: TYPE_SELECTOR
                    }
                  ]
                },
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: '*',
                      type: TYPE_SELECTOR
                    }
                  ]
                }
              ],
              dir: 'next',
              filtered: true,
              find: true
            }
          ],
          [[document.getElementById('ul1')]]
        ],
        'result'
      );
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder.setup('ul > *', document);
      const res = finder._collectNodes('first');
      assert.deepEqual(
        res,
        [
          [
            {
              branch: [
                {
                  combo: {
                    loc: null,
                    name: '>',
                    type: COMBINATOR
                  },
                  leaves: [
                    {
                      loc: null,
                      name: 'ul',
                      type: TYPE_SELECTOR
                    }
                  ]
                },
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: '*',
                      type: TYPE_SELECTOR
                    }
                  ]
                }
              ],
              dir: 'next',
              filtered: true,
              find: true
            }
          ],
          [[document.getElementById('ul1')]]
        ],
        'result'
      );
    });

    it('should get list and matrix', () => {
      const container = document.getElementById('div0');
      const ancestor = document.createElement('div');
      const parent = document.createElement('p');
      const child = document.createElement('span');
      parent.appendChild(child);
      ancestor.appendChild(parent);
      container.appendChild(ancestor);
      const finder = new Finder(window);
      finder.setup('* > ul > *', container);
      const res = finder._collectNodes('all');
      assert.deepEqual(
        res,
        [
          [
            {
              branch: [
                {
                  combo: {
                    loc: null,
                    name: '>',
                    type: COMBINATOR
                  },
                  leaves: [
                    {
                      loc: null,
                      name: '*',
                      type: TYPE_SELECTOR
                    }
                  ]
                },
                {
                  combo: {
                    loc: null,
                    name: '>',
                    type: COMBINATOR
                  },
                  leaves: [
                    {
                      loc: null,
                      name: 'ul',
                      type: TYPE_SELECTOR
                    }
                  ]
                },
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: '*',
                      type: TYPE_SELECTOR
                    }
                  ]
                }
              ],
              dir: 'prev',
              filtered: true,
              find: true
            }
          ],
          [[ancestor, parent, child]]
        ],
        'result'
      );
    });

    it('should get list and matrix', () => {
      const container = document.getElementById('div0');
      const ancestor = document.createElement('div');
      const parent = document.createElement('p');
      const child = document.createElement('span');
      parent.appendChild(child);
      ancestor.appendChild(parent);
      container.appendChild(ancestor);
      const finder = new Finder(window);
      finder.setup('* > ul > *', container);
      const res = finder._collectNodes('first');
      assert.deepEqual(
        res,
        [
          [
            {
              branch: [
                {
                  combo: {
                    loc: null,
                    name: '>',
                    type: COMBINATOR
                  },
                  leaves: [
                    {
                      loc: null,
                      name: '*',
                      type: TYPE_SELECTOR
                    }
                  ]
                },
                {
                  combo: {
                    loc: null,
                    name: '>',
                    type: COMBINATOR
                  },
                  leaves: [
                    {
                      loc: null,
                      name: 'ul',
                      type: TYPE_SELECTOR
                    }
                  ]
                },
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: '*',
                      type: TYPE_SELECTOR
                    }
                  ]
                }
              ],
              dir: 'prev',
              filtered: true,
              find: true
            }
          ],
          [[ancestor]]
        ],
        'result'
      );
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder.setup('#ul1 > #li1', document);
      const res = finder._collectNodes('all');
      assert.deepEqual(
        res,
        [
          [
            {
              branch: [
                {
                  combo: {
                    loc: null,
                    name: '>',
                    type: COMBINATOR
                  },
                  leaves: [
                    {
                      loc: null,
                      name: 'ul1',
                      type: ID_SELECTOR
                    }
                  ]
                },
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'li1',
                      type: ID_SELECTOR
                    }
                  ]
                }
              ],
              dir: 'prev',
              filtered: true,
              find: true
            }
          ],
          [[document.getElementById('li1')]]
        ],
        'result'
      );
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder.setup('ul > #li1', document);
      const res = finder._collectNodes('all');
      assert.deepEqual(
        res,
        [
          [
            {
              branch: [
                {
                  combo: {
                    loc: null,
                    name: '>',
                    type: COMBINATOR
                  },
                  leaves: [
                    {
                      loc: null,
                      name: 'ul',
                      type: TYPE_SELECTOR
                    }
                  ]
                },
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'li1',
                      type: ID_SELECTOR
                    }
                  ]
                }
              ],
              dir: 'prev',
              filtered: true,
              find: true
            }
          ],
          [[document.getElementById('li1')]]
        ],
        'result'
      );
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder.setup('#ul1 > li', document);
      const res = finder._collectNodes('all');
      assert.deepEqual(
        res,
        [
          [
            {
              branch: [
                {
                  combo: {
                    loc: null,
                    name: '>',
                    type: COMBINATOR
                  },
                  leaves: [
                    {
                      loc: null,
                      name: 'ul1',
                      type: ID_SELECTOR
                    }
                  ]
                },
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'li',
                      type: TYPE_SELECTOR
                    }
                  ]
                }
              ],
              dir: 'next',
              filtered: true,
              find: true
            }
          ],
          [[document.getElementById('ul1')]]
        ],
        'result'
      );
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder.setup('ul > li::after', document);
      const res = finder._collectNodes('all');
      assert.deepEqual(
        res,
        [
          [
            {
              branch: [
                {
                  combo: {
                    loc: null,
                    name: '>',
                    type: COMBINATOR
                  },
                  leaves: [
                    {
                      loc: null,
                      name: 'ul',
                      type: TYPE_SELECTOR
                    }
                  ]
                },
                {
                  combo: null,
                  leaves: [
                    {
                      children: null,
                      loc: null,
                      name: 'after',
                      type: PS_ELEMENT_SELECTOR
                    },
                    {
                      loc: null,
                      name: 'li',
                      type: TYPE_SELECTOR
                    }
                  ]
                }
              ],
              dir: 'prev',
              filtered: false,
              find: false
            }
          ],
          [[]]
        ],
        'result'
      );
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder.setup('ul::before > li', document);
      const res = finder._collectNodes('all');
      assert.deepEqual(
        res,
        [
          [
            {
              branch: [
                {
                  combo: {
                    loc: null,
                    name: '>',
                    type: COMBINATOR
                  },
                  leaves: [
                    {
                      children: null,
                      loc: null,
                      name: 'before',
                      type: PS_ELEMENT_SELECTOR
                    },
                    {
                      loc: null,
                      name: 'ul',
                      type: TYPE_SELECTOR
                    }
                  ]
                },
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'li',
                      type: TYPE_SELECTOR
                    }
                  ]
                }
              ],
              dir: 'prev',
              filtered: true,
              find: true
            }
          ],
          [
            [
              document.getElementById('li1'),
              document.getElementById('li2'),
              document.getElementById('li3')
            ]
          ]
        ],
        'result'
      );
    });
  });

  describe('match node to next direction', () => {
    it('should get matched node(s)', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('ul > .li ~ li', document);
      const [[{ branch }]] = finder._correspond('ul > .li ~ li');
      const res = finder._matchNodeNext(branch, new Set([node]), {
        combo: {
          name: '>'
        },
        index: 1
      });
      assert.deepEqual(res, document.getElementById('li2'), 'result');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('ul > .li ~ li:last-child', document);
      const [[{ branch }]] = finder._correspond('ul > .li ~ li:last-child');
      const res = finder._matchNodeNext(branch, new Set([node]), {
        combo: {
          name: '>'
        },
        index: 1
      });
      assert.deepEqual(res, document.getElementById('li3'), 'result');
    });

    it('should not match', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('ul > .li ~ li.foo', document);
      const [[{ branch }]] = finder._correspond('ul > .li ~ li.foo');
      const res = finder._matchNodeNext(branch, new Set([node]), {
        combo: {
          name: '>'
        },
        index: 1
      });
      assert.deepEqual(res, null, 'result');
    });

    it('should not match', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('ul > li.foo ~ li', document);
      const [[{ branch }]] = finder._correspond('ul > li.foo ~ li');
      const res = finder._matchNodeNext(branch, new Set([node]), {
        combo: {
          name: '>'
        },
        index: 1
      });
      assert.deepEqual(res, null, 'result');
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
      finder._collectNodes('all');
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
      assert.deepEqual([...res], [container.querySelector('.target')], 'result');
      document.body.removeChild(container);
    });
  });
});
