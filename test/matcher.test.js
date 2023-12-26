/**
 * matcher.test.js
 */

/* api */
import { assert } from 'chai';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, it, xit } from 'mocha';
import sinon from 'sinon';

/* test */
import * as matcherJs from '../src/js/matcher.js';

/* constants */
import {
  AN_PLUS_B, COMBINATOR, IDENTIFIER, NOT_SUPPORTED_ERR, NTH, RAW, SELECTOR,
  SELECTOR_ATTR, SELECTOR_CLASS, SELECTOR_ID, SELECTOR_LIST,
  SELECTOR_PSEUDO_CLASS, SELECTOR_PSEUDO_ELEMENT, SELECTOR_TYPE, STRING
} from '../src/js/constant.js';

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
    for (const key of globalKeys) {
      global[key] = dom.window[key];
    }
  });
  afterEach(() => {
    window = null;
    document = null;
    for (const key of globalKeys) {
      delete global[key];
    }
  });

  describe('Matcher', () => {
    const { Matcher } = matcherJs;

    it('should throw', () => {
      assert.throws(() => new Matcher(), TypeError);
    });

    it('should throw', () => {
      assert.throws(() => new Matcher('*'), TypeError);
    });

    it('should throw', () => {
      assert.throws(() => new Matcher('*', 'foo'), TypeError,
        'Unexpected node undefined');
    });

    it('should throw', () => {
      const text = document.createTextNode('foo');
      assert.throws(() => new Matcher('*', text), TypeError,
        'Unexpected node #text');
    });

    it('should throw', () => {
      assert.throws(() => new Matcher('#ul1 ++ #li1', document),
        DOMException, 'Invalid combinator ++');
    });

    it('should throw', () => {
      assert.throws(() => new Matcher('[foo==bar]', document), DOMException,
        'Identifier is expected');
    });

    // FIXME: CSSTree throws
    it('should throw', () => {
      assert.throws(() => new Matcher(':lang("")', document), DOMException);
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

    describe('handle error', () => {
      it('should throw', () => {
        const e = new Error('error');
        const matcher = new Matcher('*', document);
        assert.throws(() => matcher._onError(e), Error);
      });

      it('should not throw', () => {
        const e = new DOMException('error', NOT_SUPPORTED_ERR);
        const matcher = new Matcher('*', document);
        const res = matcher._onError(e);
        assert.isUndefined(res, 'result');
      });

      it('should warn', () => {
        const stubWarn = sinon.stub(console, 'warn');
        const e = new DOMException('error', NOT_SUPPORTED_ERR);
        const matcher = new Matcher('*', document, {
          warn: true
        });
        const res = matcher._onError(e);
        const { called } = stubWarn;
        stubWarn.restore();
        assert.isTrue(called, 'called');
        assert.isUndefined(res, 'result');
      });
    });

    describe('get root node', () => {
      it('should get matched node', () => {
        const matcher = new Matcher('*', document);
        const res = matcher._getRoot(document);
        assert.deepEqual(res, {
          document,
          root: document,
          shadow: false
        }, 'result');
      });

      it('should get matched node', () => {
        const parent = document.createElement('div');
        const node = document.createElement('div');
        parent.appendChild(node);
        document.body.appendChild(parent);
        const matcher = new Matcher('*', parent);
        const res = matcher._getRoot(parent);
        assert.deepEqual(res, {
          document,
          root: document,
          shadow: false
        }, 'result');
      });

      it('should get matched node', () => {
        const parent = document.createElement('div');
        const node = document.createElement('div');
        parent.appendChild(node);
        document.body.appendChild(parent);
        const matcher = new Matcher('*', node);
        const res = matcher._getRoot(node);
        assert.deepEqual(res, {
          document,
          root: document,
          shadow: false
        }, 'result');
      });

      it('should get matched node', () => {
        const domStr = '<foo></foo>';
        const doc = new DOMParser().parseFromString(domStr, 'text/xml');
        const parent = document.createElement('div');
        const node = document.createElement('div');
        parent.appendChild(node);
        doc.documentElement.appendChild(parent);
        const matcher = new Matcher('*', doc);
        const res = matcher._getRoot(doc);
        assert.deepEqual(res, {
          document: doc,
          root: doc,
          shadow: false
        }, 'result');
      });

      it('should get matched node', () => {
        const domStr = '<foo></foo>';
        const doc = new DOMParser().parseFromString(domStr, 'text/xml');
        const parent = document.createElement('div');
        const node = document.createElement('div');
        parent.appendChild(node);
        doc.documentElement.appendChild(parent);
        const matcher = new Matcher('*', parent);
        const res = matcher._getRoot(parent);
        assert.deepEqual(res, {
          document: doc,
          root: doc,
          shadow: false
        }, 'result');
      });

      it('should get matched node', () => {
        const domStr = '<foo></foo>';
        const doc = new DOMParser().parseFromString(domStr, 'text/xml');
        const parent = document.createElement('div');
        const node = document.createElement('div');
        parent.appendChild(node);
        doc.documentElement.appendChild(parent);
        const matcher = new Matcher('*', node);
        const res = matcher._getRoot(node);
        assert.deepEqual(res, {
          document: doc,
          root: doc,
          shadow: false
        }, 'result');
      });

      it('should get matched node', () => {
        const frag = document.createDocumentFragment();
        const parent = document.createElement('div');
        const node = document.createElement('div');
        parent.appendChild(node);
        frag.appendChild(parent);
        const matcher = new Matcher('*', frag);
        const res = matcher._getRoot(frag);
        assert.deepEqual(res, {
          document,
          root: frag,
          shadow: false
        }, 'result');
      });

      it('should get matched node', () => {
        const frag = document.createDocumentFragment();
        const parent = document.createElement('div');
        const node = document.createElement('div');
        parent.appendChild(node);
        frag.appendChild(parent);
        const matcher = new Matcher('*', parent);
        const res = matcher._getRoot(parent);
        assert.deepEqual(res, {
          document,
          root: frag,
          shadow: false
        }, 'result');
      });

      it('should get matched node', () => {
        const frag = document.createDocumentFragment();
        const parent = document.createElement('div');
        const node = document.createElement('div');
        parent.appendChild(node);
        frag.appendChild(parent);
        const matcher = new Matcher('*', node);
        const res = matcher._getRoot(node);
        assert.deepEqual(res, {
          document,
          root: frag,
          shadow: false
        }, 'result');
      });

      it('should get matched node', () => {
        const parent = document.createElement('div');
        const node = document.createElement('div');
        parent.appendChild(node);
        const matcher = new Matcher('*', parent);
        const res = matcher._getRoot(parent);
        assert.deepEqual(res, {
          document,
          root: parent,
          shadow: false
        }, 'result');
      });

      it('should get matched node', () => {
        const parent = document.createElement('div');
        const node = document.createElement('div');
        parent.appendChild(node);
        const matcher = new Matcher('*', node);
        const res = matcher._getRoot(node);
        assert.deepEqual(res, {
          document,
          root: parent,
          shadow: false
        }, 'result');
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
        };
        window.customElements.define('my-element', MyElement);
        const host = document.getElementById('baz');
        const node = host.shadowRoot;
        const matcher = new Matcher(':host div', node);
        const res = matcher._getRoot(node);
        assert.deepEqual(res, {
          document,
          root: node,
          shadow: true
        }, 'result');
      });
    });

    describe('sort AST leaves', () => {
      it('should get sorted leaves', () => {
        const leaves = [
          { type: SELECTOR_ATTR },
          { type: SELECTOR_CLASS, name: 'bar' },
          { type: SELECTOR_ID },
          { type: SELECTOR_PSEUDO_CLASS },
          { type: SELECTOR_CLASS, name: 'foo' },
          { type: SELECTOR_PSEUDO_ELEMENT },
          { type: SELECTOR_TYPE }
        ];
        const matcher = new Matcher('*', document);
        const res = matcher._sortLeaves(leaves);
        assert.deepEqual(res, [
          { type: SELECTOR_PSEUDO_ELEMENT },
          { type: SELECTOR_ID },
          { type: SELECTOR_CLASS, name: 'bar' },
          { type: SELECTOR_CLASS, name: 'foo' },
          { type: SELECTOR_TYPE },
          { type: SELECTOR_ATTR },
          { type: SELECTOR_PSEUDO_CLASS }
        ], 'result');
      });
    });

    describe('prepare list and matrix', () => {
      it('should get list and matrix', () => {
        const matcher =
          new Matcher('li:last-child, li:first-child + li', document);
        const res = matcher._prepare('li:last-child, li:first-child + li');
        assert.deepEqual(res, [
          [
            {
              branch: [
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'li',
                      type: SELECTOR_TYPE
                    },
                    {
                      children: null,
                      loc: null,
                      name: 'last-child',
                      type: SELECTOR_PSEUDO_CLASS
                    }
                  ]
                }
              ],
              filtered: false,
              find: null,
              skip: false
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
                      type: SELECTOR_TYPE
                    },
                    {
                      children: null,
                      loc: null,
                      name: 'first-child',
                      type: SELECTOR_PSEUDO_CLASS
                    }
                  ]
                },
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'li',
                      type: SELECTOR_TYPE
                    }
                  ]
                }
              ],
              filtered: false,
              find: null,
              skip: false
            }
          ],
          [
            new Set(),
            new Set()
          ]
        ], 'result');
      });
    });

    describe('collect nth child', () => {
      it('should not match', () => {
        const anb = {
          a: 0,
          b: -1
        };
        const node = document.getElementById('dt1');
        const matcher = new Matcher(':nth-child(-1)', node);
        const res = matcher._collectNthChild(anb, node);
        assert.strictEqual(res.size, 0, 'size');
      });

      it('should get matched node(s)', () => {
        const anb = {
          a: 0,
          b: 6,
          reverse: true
        };
        const node = document.getElementById('dt1');
        const matcher = new Matcher(':nth-last-child(6)', node);
        const res = matcher._collectNthChild(anb, node);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const anb = {
          a: -1,
          b: 0,
          reverse: true
        };
        const node = document.getElementById('dt1');
        const matcher = new Matcher(':nth-last-child(-1n)', node);
        const res = matcher._collectNthChild(anb, node);
        assert.strictEqual(res.size, 0, 'size');
      });

      it('should not match', () => {
        const anb = {
          a: 0,
          b: 0
        };
        const node = document.getElementById('dt1');
        const matcher = new Matcher(':nth-child(0)', node);
        const res = matcher._collectNthChild(anb, node);
        assert.strictEqual(res.size, 0, 'size');
      });

      it('should not match', () => {
        const anb = {
          a: 0,
          b: 0,
          reverse: true
        };
        const node = document.getElementById('dt1');
        const matcher = new Matcher(':nth-last-child(0)', node);
        const res = matcher._collectNthChild(anb, node);
        assert.strictEqual(res.size, 0, 'size');
      });

      it('should get matched node(s)', () => {
        const anb = {
          a: 0,
          b: 1
        };
        const node = document.getElementById('dt1');
        const matcher = new Matcher(':nth-child(1)', node);
        const res = matcher._collectNthChild(anb, node);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
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
        const matcher = new Matcher(':nth-last-child(1)', node);
        const res = matcher._collectNthChild(anb, node);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
          document.getElementById('dd3')
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const anb = {
          a: 1,
          b: 0
        };
        const node = document.getElementById('dt1');
        const matcher = new Matcher(':nth-child(1n)', node);
        const res = matcher._collectNthChild(anb, node);
        assert.strictEqual(res.size, 6, 'size');
        assert.deepEqual([...res], [
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
        const matcher = new Matcher(':nth-child(1n+1)', node);
        const res = matcher._collectNthChild(anb, node);
        assert.strictEqual(res.size, 6, 'size');
        assert.deepEqual([...res], [
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
        const matcher = new Matcher(':nth-child(2n)', node);
        const res = matcher._collectNthChild(anb, node);
        assert.strictEqual(res.size, 3, 'size');
        assert.deepEqual([...res], [
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
        const matcher = new Matcher(':nth-child(2n+1)', node);
        const res = matcher._collectNthChild(anb, node);
        assert.strictEqual(res.size, 3, 'size');
        assert.deepEqual([...res], [
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
        const matcher = new Matcher(':nth-last-child(2n-1)', node);
        const res = matcher._collectNthChild(anb, node);
        assert.strictEqual(res.size, 3, 'size');
        assert.deepEqual([...res], [
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
          selector: {
            children: [
              {
                children: [
                  {
                    loc: null,
                    name: 'noted',
                    type: SELECTOR_CLASS
                  }
                ],
                loc: null,
                type: SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR_LIST
          }
        };
        const matcher = new Matcher(':nth-child(1 of .noted)', l1);
        const res = matcher._collectNthChild(anb, l1);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
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
          selector: {
            children: [
              {
                children: [
                  {
                    loc: null,
                    name: 'noted',
                    type: SELECTOR_CLASS
                  }
                ],
                loc: null,
                type: SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR_LIST
          }
        };
        const matcher = new Matcher(':nth-child(2n of .noted)', l1);
        const res = matcher._collectNthChild(anb, l1);
        assert.strictEqual(res.size, 2, 'size');
        assert.deepEqual([...res], [
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
          selector: {
            children: [
              {
                children: [
                  {
                    loc: null,
                    name: 'noted',
                    type: SELECTOR_CLASS
                  }
                ],
                loc: null,
                type: SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR_LIST
          }
        };
        const matcher = new Matcher(':nth-child(2n+1 of .noted)', l1);
        const res = matcher._collectNthChild(anb, l1);
        assert.strictEqual(res.size, 2, 'size');
        assert.deepEqual([...res], [
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
          selector: {
            children: [
              {
                children: [
                  {
                    loc: null,
                    name: 'noted',
                    type: SELECTOR_CLASS
                  }
                ],
                loc: null,
                type: SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR_LIST
          }
        };
        const matcher = new Matcher(':nth-child(-n+3 of .noted)', l1);
        const res = matcher._collectNthChild(anb, l1);
        assert.strictEqual(res.size, 3, 'size');
        assert.deepEqual([...res], [
          l2,
          l4,
          l7
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const node = document.createElement('div');
        const anb = {
          a: 0,
          b: 1,
          selector: null
        };
        const matcher = new Matcher(':nth-child(1)', node);
        const res = matcher._collectNthChild(anb, node);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const node = document.createElement('div');
        const anb = {
          a: 1,
          b: 0,
          selector: null
        };
        const matcher = new Matcher(':nth-child(n)', node);
        const res = matcher._collectNthChild(anb, node);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const node = document.createElement('div');
        const anb = {
          a: 2,
          b: 1,
          selector: null
        };
        const matcher = new Matcher(':nth-child(2n+1)', node);
        const res = matcher._collectNthChild(anb, node);
        assert.strictEqual(res.size, 0, 'size');
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const node = document.createElement('div');
        node.classList.add('noted');
        const anb = {
          a: 0,
          b: 1,
          selector: {
            children: [
              {
                children: [
                  {
                    loc: null,
                    name: 'noted',
                    type: SELECTOR_CLASS
                  }
                ],
                loc: null,
                type: SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR_LIST
          }
        };
        const matcher = new Matcher(':nth-child(1 of .noted)', node);
        const res = matcher._collectNthChild(anb, node);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const node = document.createElement('div');
        node.classList.add('noted');
        const anb = {
          a: 0,
          b: 1,
          selector: {
            children: [
              {
                children: [
                  {
                    loc: null,
                    name: 'noted',
                    type: SELECTOR_CLASS
                  }
                ],
                loc: null,
                type: SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR_LIST
          }
        };
        const matcher = new Matcher(':nth-child(1 of .noted)', node);
        const res = matcher._collectNthChild(anb, node);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
          node
        ], 'result');
      });
      it('should get matched node(s)', () => {
        const node = document.createElement('div');
        node.classList.add('noted');
        const anb = {
          a: 0,
          b: 1,
          selector: {
            children: [
              {
                children: [
                  {
                    loc: null,
                    name: 'noted',
                    type: SELECTOR_CLASS
                  }
                ],
                loc: null,
                type: SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR_LIST
          }
        };
        const matcher =
          new Matcher(':nth-child(1 of .noted), :nth-last-child(n of .noted',
            node);
        const res = matcher._collectNthChild(anb, node);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
          node
        ], 'result');
      });
    });

    describe('collect nth of type', () => {
      it('should not match', () => {
        const anb = {
          a: 0,
          b: -1
        };
        const node = document.getElementById('dt1');
        const matcher = new Matcher(':nth-of-type(-1)', node);
        const res = matcher._collectNthOfType(anb, node);
        assert.strictEqual(res.size, 0, 'size');
      });

      it('should not match', () => {
        const anb = {
          a: 0,
          b: 6
        };
        const node = document.getElementById('dt1');
        const matcher = new Matcher(':nth-last-of-type(6)', node);
        const res = matcher._collectNthOfType(anb, node);
        assert.strictEqual(res.size, 0, 'size');
      });

      it('should not match', () => {
        const anb = {
          a: -1,
          b: 0
        };
        const node = document.getElementById('dt1');
        const matcher = new Matcher(':nth-of-type(-1n)', node);
        const res = matcher._collectNthOfType(anb, node);
        assert.strictEqual(res.size, 0, 'size');
      });

      it('should not match', () => {
        const anb = {
          a: 0,
          b: 0
        };
        const node = document.getElementById('dt1');
        const matcher = new Matcher(':nth-of-type(0)', node);
        const res = matcher._collectNthOfType(anb, node);
        assert.strictEqual(res.size, 0, 'size');
      });

      it('should get matched node(s)', () => {
        const anb = {
          a: 0,
          b: 1
        };
        const node = document.getElementById('dt1');
        const matcher = new Matcher(':nth-of-type(1)', node);
        const res = matcher._collectNthOfType(anb, node);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
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
        const matcher = new Matcher(':nth-last-of-type(1)', node);
        const res = matcher._collectNthOfType(anb, node);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
          document.getElementById('dt3')
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const anb = {
          a: 0,
          b: 2
        };
        const node = document.getElementById('dt1');
        const matcher = new Matcher(':nth-of-type(2)', node);
        const res = matcher._collectNthOfType(anb, node);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
          document.getElementById('dt2')
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const anb = {
          a: 0,
          b: 3
        };
        const node = document.getElementById('dt3');
        const matcher = new Matcher(':nth-of-type(3)', node);
        const res = matcher._collectNthOfType(anb, node);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const anb = {
          a: 1,
          b: 0
        };
        const node = document.getElementById('dt1');
        const matcher = new Matcher(':nth-of-type(n)', node);
        const res = matcher._collectNthOfType(anb, node);
        assert.strictEqual(res.size, 3, 'size');
        assert.deepEqual([...res], [
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
        const matcher = new Matcher(':nth-of-type(n+1)', node);
        const res = matcher._collectNthOfType(anb, node);
        assert.strictEqual(res.size, 3, 'size');
        assert.deepEqual([...res], [
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
        const matcher = new Matcher(':nth-of-type(n-1)', node);
        const res = matcher._collectNthOfType(anb, node);
        assert.strictEqual(res.size, 3, 'size');
        assert.deepEqual([...res], [
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
        const matcher = new Matcher(':nth-of-type(2n)', node);
        const res = matcher._collectNthOfType(anb, node);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
          document.getElementById('dt2')
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const anb = {
          a: 2,
          b: 1
        };
        const node = document.getElementById('dt1');
        const matcher = new Matcher(':nth-of-type(2n+1)', node);
        const res = matcher._collectNthOfType(anb, node);
        assert.strictEqual(res.size, 2, 'size');
        assert.deepEqual([...res], [
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
        const matcher = new Matcher(':nth-of-type(-n+2)', node);
        const res = matcher._collectNthOfType(anb, node);
        assert.strictEqual(res.size, 2, 'size');
        assert.deepEqual([...res], [
          node,
          document.getElementById('dt2')
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const anb = {
          a: 1,
          b: 0
        };
        const node = document.createElement('div');
        const matcher = new Matcher(':nth-of-type(n)', node);
        const res = matcher._collectNthOfType(anb, node);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const anb = {
          a: 0,
          b: 1
        };
        const node = document.createElement('div');
        const matcher = new Matcher(':nth-of-type(1)', node);
        const res = matcher._collectNthOfType(anb, node);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const anb = {
          a: 2,
          b: 1
        };
        const node = document.createElement('div');
        const matcher = new Matcher(':nth-of-type(2n+1)', node);
        const res = matcher._collectNthOfType(anb, node);
        assert.strictEqual(res.size, 0, 'size');
        assert.deepEqual([...res], [], 'result');
      });
    });

    describe('match An+B', () => {
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
        const matcher = new Matcher(':nth-child(even)', node);
        const res = matcher._matchAnPlusB(leaf, node, leafName);
        assert.strictEqual(res.size, 3, 'size');
        assert.deepEqual([...res], [
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
        const matcher = new Matcher(':nth-child(odd)', node);
        const res = matcher._matchAnPlusB(leaf, node, leafName);
        assert.strictEqual(res.size, 3, 'size');
        assert.deepEqual([...res], [
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
                    type: SELECTOR_TYPE
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
        const matcher = new Matcher('dt:nth-child(odd)', node);
        const res = matcher._matchAnPlusB(leaf, node, leafName);
        assert.strictEqual(res.size, 2, 'size');
        assert.deepEqual([...res], [
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
        const matcher = new Matcher(':nth-last-child(even)', node);
        const res = matcher._matchAnPlusB(leaf, node, leafName);
        assert.strictEqual(res.size, 3, 'size');
        assert.deepEqual([...res], [
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
        const matcher = new Matcher(':nth-child(3n+1)', node);
        const res = matcher._matchAnPlusB(leaf, node, leafName);
        assert.strictEqual(res.size, 2, 'size');
        assert.deepEqual([...res], [
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
        const matcher = new Matcher(':nth-child(2n)', node);
        const res = matcher._matchAnPlusB(leaf, node, leafName);
        assert.strictEqual(res.size, 3, 'size');
        assert.deepEqual([...res], [
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
        const matcher = new Matcher(':nth-child(3)', node);
        const res = matcher._matchAnPlusB(leaf, node, leafName);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
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
        const matcher = new Matcher(':nth-child(1)', node);
        const res = matcher._matchAnPlusB(leaf, node, leafName);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
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
        const matcher = new Matcher(':nth-last-child(3n+1)', node);
        const res = matcher._matchAnPlusB(leaf, node, leafName);
        assert.strictEqual(res.size, 2, 'size');
        assert.deepEqual([...res], [
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
        const matcher = new Matcher(':nth-of-type(even)', node);
        const res = matcher._matchAnPlusB(leaf, node, leafName);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
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
        const matcher = new Matcher(':nth-of-type(odd)', node);
        const res = matcher._matchAnPlusB(leaf, node, leafName);
        assert.strictEqual(res.size, 2, 'size');
        assert.deepEqual([...res], [
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
        const matcher = new Matcher(':nth-last-of-type(even)', node);
        const res = matcher._matchAnPlusB(leaf, node, leafName);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
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
        const matcher = new Matcher(':nth-of-type(3n+1)', node);
        const res = matcher._matchAnPlusB(leaf, node, leafName);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
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
        const matcher = new Matcher(':nth-of-type(2n)', node);
        const res = matcher._matchAnPlusB(leaf, node, leafName);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
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
        const matcher = new Matcher(':nth-of-type(3)', node);
        const res = matcher._matchAnPlusB(leaf, node, leafName);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
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
        const matcher = new Matcher(':nth-last-of-type(3n+1)', node);
        const res = matcher._matchAnPlusB(leaf, node, leafName);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
          document.getElementById('dt3')
        ], 'result');
      });
    });

    describe('match pseudo-element selector', () => {
      it('should not match', () => {
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher('::after', node);
        const res = matcher._matchPseudoElementSelector('after');
        assert.isUndefined(res, 'result');
      });

      it('should throw', () => {
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher('::after', node, {
          warn: true
        });
        assert.throws(() => matcher._matchPseudoElementSelector('after'),
          DOMException, 'Unsupported pseudo-element ::after');
      });

      it('should not match', () => {
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher('::part(div)', node);
        const res = matcher._matchPseudoElementSelector('part');
        assert.isUndefined(res, 'result');
      });

      it('should throw', () => {
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher('::part(div)', node, {
          warn: true
        });
        assert.throws(() => matcher._matchPseudoElementSelector('part'),
          DOMException, 'Unsupported pseudo-element ::part()');
      });

      it('should not match', () => {
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher('::slotted(div)', node);
        const res = matcher._matchPseudoElementSelector('slotted');
        assert.isUndefined(res, 'result');
      });

      it('should throw', () => {
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher('::slotted(div)', node, {
          warn: true
        });
        assert.throws(() => matcher._matchPseudoElementSelector('slotted'),
          DOMException, 'Unsupported pseudo-element ::slotted()');
      });

      it('should throw', () => {
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher('::foo', node);
        assert.throws(() => matcher._matchPseudoElementSelector('foo'),
          DOMException, 'Unknown pseudo-element ::foo');
      });

      it('should not match', () => {
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher('::foo', node);
        const res = matcher._matchPseudoElementSelector('foo', {
          forgive: true
        });
        assert.isUndefined(res, 'result');
      });

      it('should not match', () => {
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher('::-webkit-foo', node);
        const res = matcher._matchPseudoElementSelector('-webkit-foo');
        assert.isUndefined(res, 'result');
      });

      it('should throw', () => {
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher('::-webkit-foo', node, {
          warn: true
        });
        assert.throws(
          () => matcher._matchPseudoElementSelector('-webkit-foo'),
          DOMException, 'Unsupported pseudo-element ::-webkit-foo'
        );
      });

      it('should throw', () => {
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher('::webkit-foo', node);
        assert.throws(
          () => matcher._matchPseudoElementSelector('webkit-foo'),
          DOMException, 'Unknown pseudo-element ::webkit-foo'
        );
      });

      it('should not match', () => {
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher('::webkit-foo', node);
        const res = matcher._matchPseudoElementSelector('webkit-foo', {
          forgive: true
        });
        assert.isUndefined(res, 'result');
      });

      it('should throw', () => {
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher('::-webkitfoo', node);
        assert.throws(
          () => matcher._matchPseudoElementSelector('-webkitfoo'),
          DOMException, 'Unknown pseudo-element ::-webkitfoo'
        );
      });

      it('should not match', () => {
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher('::-webkitfoo', node);
        const res = matcher._matchPseudoElementSelector('-webkitfoo', {
          forgive: true
        });
        assert.isUndefined(res, 'result');
      });
    });

    describe('match directionality pseudo-class', () => {
      it('should get matched node', () => {
        const leaf = {
          name: 'ltr',
          type: IDENTIFIER
        };
        const node = document.createElement('bdo');
        node.setAttribute('dir', 'ltr');
        const matcher = new Matcher(':dir(ltr)', node);
        const res = matcher._matchDirectionPseudoClass(leaf, node);
        assert.deepEqual(res, node, 'result');
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
        const matcher = new Matcher(':dir(ltr)', node);
        const res = matcher._matchDirectionPseudoClass(leaf, node);
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
        const matcher = new Matcher(':dir(rtl)', node);
        const res = matcher._matchDirectionPseudoClass(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: 'ltr',
          type: IDENTIFIER
        };
        const root = document.documentElement;
        const matcher = new Matcher(':dir(ltr)', root);
        const res = matcher._matchDirectionPseudoClass(leaf, root);
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
        const matcher = new Matcher(':dir(ltr)', node);
        const res = matcher._matchDirectionPseudoClass(leaf, node);
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
        const matcher = new Matcher(':dir(ltr)', node);
        const res = matcher._matchDirectionPseudoClass(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should not match', () => {
        const leaf = {
          name: 'ltr',
          type: IDENTIFIER
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'tel');
        node.setAttribute('dir', 'auto');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':dir(ltr)', node);
        const res = matcher._matchDirectionPseudoClass(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: 'ltr',
          type: IDENTIFIER
        };
        const node = document.createElement('textarea');
        node.setAttribute('dir', 'auto');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':dir(ltr)', node);
        const res = matcher._matchDirectionPseudoClass(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: 'ltr',
          type: IDENTIFIER
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'text');
        node.setAttribute('dir', 'auto');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':dir(ltr)', node);
        const res = matcher._matchDirectionPseudoClass(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: 'ltr',
          type: IDENTIFIER
        };
        const node = document.createElement('div');
        node.setAttribute('dir', 'auto');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':dir(ltr)', node);
        const res = matcher._matchDirectionPseudoClass(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: 'ltr',
          type: IDENTIFIER
        };
        const node = document.createElement('bdi');
        node.textContent = 'foo';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':dir(ltr)', node);
        const res = matcher._matchDirectionPseudoClass(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: 'rtl',
          type: IDENTIFIER
        };
        const node = document.createElement('bdi');
        node.textContent = '\u05EA';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':dir(rtl)', node);
        const res = matcher._matchDirectionPseudoClass(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should not match', () => {
        const leaf = {
          name: 'ltr',
          type: IDENTIFIER
        };
        const node = document.createElement('bdi');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':dir(ltr)', node);
        const res = matcher._matchDirectionPseudoClass(leaf, node);
        assert.isNull(res, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: 'ltr',
          type: IDENTIFIER
        };
        const html = `
          <template id="template">
            <div>
              <slot id="foo" name="bar" dir="auto">Foo</slot>
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
        };
        window.customElements.define('my-element', MyElement);
        const shadow = document.getElementById('baz');
        const node = shadow.shadowRoot.getElementById('foo');
        const matcher = new Matcher(':dir(ltr)', node);
        const res = matcher._matchDirectionPseudoClass(leaf, node);
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
        const matcher = new Matcher(':dir(ltr)', node);
        const res = matcher._matchDirectionPseudoClass(leaf, node);
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
        const matcher = new Matcher(':dir(rtl)', node);
        const res = matcher._matchDirectionPseudoClass(leaf, node);
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
        const matcher = new Matcher(':dir(ltr)', node);
        const res = matcher._matchDirectionPseudoClass(leaf, node);
        assert.deepEqual(res, node, 'result');
      });
    });

    describe('match language pseudo-class', () => {
      it('should not match', () => {
        const leaf = {
          name: '',
          type: IDENTIFIER
        };
        const node = document.createElement('div');
        node.setAttribute('lang', '');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        // new Matcher(':lang("")', node) throws
        const matcher = new Matcher(':lang(en)', node);
        const res = matcher._matchLanguagePseudoClass(leaf, node);
        assert.isNull(res, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: '*',
          type: IDENTIFIER
        };
        const node = document.createElement('div');
        node.lang = 'en';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':lang("*")', node);
        const res = matcher._matchLanguagePseudoClass(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: '*',
          type: IDENTIFIER
        };
        const node = document.createElement('div');
        node.setAttribute('lang', 'en');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':lang("*")', node);
        const res = matcher._matchLanguagePseudoClass(leaf, node);
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
        const matcher = new Matcher(':lang("*")', node);
        const res = matcher._matchLanguagePseudoClass(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: '\\*',
          type: IDENTIFIER
        };
        const node = document.createElement('div');
        node.lang = 'en';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':lang(\\*)', node);
        const res = matcher._matchLanguagePseudoClass(leaf, node);
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
        const matcher = new Matcher(':lang("*")', node);
        const res = matcher._matchLanguagePseudoClass(leaf, node);
        assert.isNull(res, 'result');
      });

      it('should not match', () => {
        const leaf = {
          name: '*',
          type: IDENTIFIER
        };
        const frag = document.createDocumentFragment();
        const node = document.createElement('div');
        frag.appendChild(node);
        const matcher = new Matcher(':lang("*")', node);
        const res = matcher._matchLanguagePseudoClass(leaf, node);
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
        const matcher = new Matcher(':lang(en)', node);
        const res = matcher._matchLanguagePseudoClass(leaf, node);
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
        const matcher = new Matcher(':lang(en)', node);
        const res = matcher._matchLanguagePseudoClass(leaf, node);
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
        const matcher = new Matcher(':lang(en)', node);
        const res = matcher._matchLanguagePseudoClass(leaf, node);
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
        const matcher = new Matcher(':lang(en)', node);
        const res = matcher._matchLanguagePseudoClass(leaf, node);
        assert.isNull(res, 'result');
      });

      it('should not match', () => {
        const leaf = {
          name: 'en',
          type: IDENTIFIER
        };
        const frag = document.createDocumentFragment();
        const node = document.createElement('div');
        frag.appendChild(node);
        const matcher = new Matcher(':lang(en)', node);
        const res = matcher._matchLanguagePseudoClass(leaf, node);
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
        const matcher = new Matcher(':lang(de-DE)', node);
        const res = matcher._matchLanguagePseudoClass(leaf, node);
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
        const matcher = new Matcher(':lang(de-Latn-DE)', node);
        const res = matcher._matchLanguagePseudoClass(leaf, node);
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
        const matcher = new Matcher(':lang(de-de)', node);
        const res = matcher._matchLanguagePseudoClass(leaf, node);
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
        const matcher = new Matcher(':lang(de-de)', node);
        const res = matcher._matchLanguagePseudoClass(leaf, node);
        assert.isNull(res, node, 'result');
      });
    });

    describe('match :has() pseudo-class function', () => {
      it('should not match', () => {
        const node = document.getElementById('dl1');
        const matcher = new Matcher(':has(li)', node);
        const leaves = [{
          name: 'li',
          type: SELECTOR_TYPE
        }];
        const res = matcher._matchHasPseudoFunc(leaves, node);
        assert.isFalse(res, 'result');
      });

      it('should match', () => {
        const node = document.getElementById('dl1');
        const matcher = new Matcher(':has(dd)', node);
        const leaves = [{
          name: 'dd',
          type: SELECTOR_TYPE
        }];
        const res = matcher._matchHasPseudoFunc(leaves, node);
        assert.isTrue(res, 'result');
      });

      it('should not match', () => {
        const node = document.getElementById('dl1');
        const matcher = new Matcher(':has(dd p)', node);
        const leaves = [
          {
            name: 'dd',
            type: SELECTOR_TYPE
          },
          {
            name: ' ',
            type: COMBINATOR
          },
          {
            name: 'p',
            type: SELECTOR_TYPE
          }
        ];
        const res = matcher._matchHasPseudoFunc(leaves, node);
        assert.isFalse(res, 'result');
      });

      it('should match', () => {
        const node = document.getElementById('dl1');
        const matcher = new Matcher(':has(dd span)', node);
        const leaves = [
          {
            name: 'dd',
            type: SELECTOR_TYPE
          },
          {
            name: ' ',
            type: COMBINATOR
          },
          {
            name: 'span',
            type: SELECTOR_TYPE
          }
        ];
        const res = matcher._matchHasPseudoFunc(leaves, node);
        assert.isTrue(res, 'result');
      });
    });

    describe('match logical pseudo-class function', () => {
      it('should get matched node', () => {
        const branches = [
          [
            {
              loc: null,
              name: '>',
              type: COMBINATOR
            },
            {
              loc: null,
              name: 'li',
              type: SELECTOR_TYPE
            }
          ]
        ];
        const node = document.getElementById('ul1');
        const matcher = new Matcher(':has(> li)', node);
        const res = matcher._matchLogicalPseudoFunc({
          astName: 'has',
          branches,
          selector: '> li'
        }, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const branches = [
          [
            {
              loc: null,
              name: '>',
              type: COMBINATOR
            },
            {
              loc: null,
              name: 'li',
              type: SELECTOR_TYPE
            },
            {
              loc: null,
              name: 'li',
              type: SELECTOR_CLASS
            }
          ]
        ];
        const node = document.getElementById('ul1');
        const matcher = new Matcher(':has(> li.li)', node);
        const res = matcher._matchLogicalPseudoFunc({
          astName: 'has',
          branches,
          selector: '> li.li'
        }, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should not match', () => {
        const branches = [
          [
            {
              loc: null,
              name: '>',
              type: COMBINATOR
            },
            {
              loc: null,
              name: 'li',
              type: SELECTOR_TYPE
            }
          ]
        ];
        const node = document.getElementById('dl1');
        const matcher = new Matcher(':has(> li)', node);
        const res = matcher._matchLogicalPseudoFunc({
          astName: 'has',
          branches,
          selector: '> li'
        }, node);
        assert.isNull(res, 'result');
      });

      it('should get matched node', () => {
        const branches = [
          [
            {
              loc: null,
              name: 'li',
              type: SELECTOR_TYPE
            }
          ]
        ];
        const node = document.getElementById('ul1');
        const matcher = new Matcher(':has(li)', node);
        const res = matcher._matchLogicalPseudoFunc({
          astName: 'has',
          branches,
          selector: 'li'
        }, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const branches = [
          [
            {
              loc: null,
              name: 'dd',
              type: SELECTOR_TYPE
            },
            {
              loc: null,
              name: '>',
              type: COMBINATOR
            },
            {
              loc: null,
              name: 'span',
              type: SELECTOR_TYPE
            }
          ]
        ];
        const node = document.getElementById('dl1');
        const matcher = new Matcher(':has(dd > span)', node);
        const res = matcher._matchLogicalPseudoFunc({
          astName: 'has',
          branches,
          selector: 'dd > span'
        }, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should not match', () => {
        const branches = [
          [
            {
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          loc: null,
                          name: 'li',
                          type: SELECTOR_TYPE
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
              type: SELECTOR_PSEUDO_CLASS
            }
          ]
        ];
        const node = document.getElementById('ul1');
        const matcher = new Matcher(':has(:has(li))', node);
        const res = matcher._matchLogicalPseudoFunc({
          astName: 'has',
          branches,
          selector: ':has(li)'
        }, node);
        assert.isNull(res, 'result');
      });

      it('should get matched node', () => {
        const branches = [
          [
            {
              loc: null,
              name: 'ol',
              type: SELECTOR_TYPE
            }
          ],
          [
            {
              loc: null,
              name: 'dl',
              type: SELECTOR_TYPE
            }
          ]
        ];
        const node = document.getElementById('ul1');
        const matcher = new Matcher(':not(ol, dl)', node);
        const res = matcher._matchLogicalPseudoFunc({
          astName: 'not',
          branches,
          selector: 'ol,dl'
        }, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should not match', () => {
        const branches = [
          [
            {
              loc: null,
              name: 'ul',
              type: SELECTOR_TYPE
            }
          ],
          [
            {
              loc: null,
              name: 'dl',
              type: SELECTOR_TYPE
            }
          ]
        ];
        const node = document.getElementById('dl1');
        const matcher = new Matcher(':not(ul, dl)', node);
        const res = matcher._matchLogicalPseudoFunc({
          astName: 'not',
          branches,
          selector: 'ul,dl',
          twigBranches: [
            [
              {
                combo: null,
                leaves: [
                  {
                    loc: null,
                    name: 'ul',
                    type: SELECTOR_TYPE
                  }
                ]
              }
            ],
            [
              {
                combo: null,
                leaves: [
                  {
                    loc: null,
                    name: 'dl',
                    type: SELECTOR_TYPE
                  }
                ]
              }
            ]
          ]
        }, node);
        assert.isNull(res, 'result');
      });

      it('should not match', () => {
        const branches = [
          [
            {
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          loc: null,
                          name: 'ol',
                          type: SELECTOR_TYPE
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
              type: SELECTOR_PSEUDO_CLASS
            }
          ],
          [
            {
              loc: null,
              name: 'ul',
              type: SELECTOR_TYPE
            }
          ]
        ];
        const node = document.getElementById('dl1');
        const matcher = new Matcher(':not(:not(ol), ul)', node);
        const res = matcher._matchLogicalPseudoFunc({
          astName: 'not',
          branches,
          selector: ':not(ol),ul',
          twigBranches: [
            [
              {
                combo: null,
                leaves: [
                  {
                    children: [
                      {
                        children: [
                          {
                            children: [
                              {
                                loc: null,
                                name: 'ol',
                                type: SELECTOR_TYPE
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
                    type: SELECTOR_PSEUDO_CLASS
                  }
                ]
              }
            ],
            [
              {
                combo: null,
                leaves: [
                  {
                    loc: null,
                    name: 'ul',
                    type: SELECTOR_TYPE
                  }
                ]
              }
            ]
          ]
        }, node);
        assert.isNull(res, 'result');
      });

      it('should get matched node', () => {
        const branches = [
          [
            {
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          loc: null,
                          name: 'dl',
                          type: SELECTOR_TYPE
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
              type: SELECTOR_PSEUDO_CLASS
            }
          ],
          [
            {
              loc: null,
              name: 'ul',
              type: SELECTOR_TYPE
            }
          ]
        ];
        const node = document.getElementById('dl1');
        const matcher = new Matcher(':not(:not(dl), ul)', node);
        const res = matcher._matchLogicalPseudoFunc({
          astName: 'not',
          branches,
          selector: ':not(dl),ul',
          twigBranches: [
            [
              {
                combo: null,
                leaves: [
                  {
                    children: [
                      {
                        children: [
                          {
                            children: [
                              {
                                loc: null,
                                name: 'dl',
                                type: SELECTOR_TYPE
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
                    type: SELECTOR_PSEUDO_CLASS
                  }
                ]
              }
            ],
            [
              {
                combo: null,
                leaves: [
                  {
                    loc: null,
                    name: 'ul',
                    type: SELECTOR_TYPE
                  }
                ]
              }
            ]
          ]
        }, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const branches = [
          [
            {
              loc: null,
              name: 'ul',
              type: SELECTOR_TYPE
            }
          ],
          [
            {
              loc: null,
              name: 'dl',
              type: SELECTOR_TYPE
            }
          ]
        ];
        const node = document.getElementById('ul1');
        const matcher = new Matcher(':is(ul, dl)', node);
        const res = matcher._matchLogicalPseudoFunc({
          astName: 'is',
          branches,
          selector: 'ul,dl',
          twigBranches: [
            [
              {
                combo: null,
                leaves: [
                  {
                    loc: null,
                    name: 'ul',
                    type: SELECTOR_TYPE
                  }
                ]
              }
            ],
            [
              {
                combo: null,
                leaves: [
                  {
                    loc: null,
                    name: 'dl',
                    type: SELECTOR_TYPE
                  }
                ]
              }
            ]
          ]
        }, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const branches = [
          [
            {
              loc: null,
              name: 'ul',
              type: SELECTOR_TYPE
            }
          ],
          [
            {
              loc: null,
              name: 'dl',
              type: SELECTOR_TYPE
            }
          ]
        ];
        const node = document.getElementById('ul1');
        const matcher = new Matcher(':is(ul#ul1, dl#dl1)', node);
        const res = matcher._matchLogicalPseudoFunc({
          astName: 'is',
          branches,
          selector: 'ul#ul1,dl#dl1',
          twigBranches: [
            [
              {
                combo: null,
                leaves: [
                  {
                    loc: null,
                    name: 'ul',
                    type: SELECTOR_TYPE
                  },
                  {
                    loc: null,
                    name: 'ul1',
                    type: SELECTOR_ID
                  }
                ]
              }
            ],
            [
              {
                combo: null,
                leaves: [
                  {
                    loc: null,
                    name: 'dl',
                    type: SELECTOR_TYPE
                  },
                  {
                    loc: null,
                    name: 'dl1',
                    type: SELECTOR_ID
                  }
                ]
              }
            ]
          ]
        }, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const branches = [
          [
            {
              loc: null,
              name: 'ul',
              type: SELECTOR_TYPE
            },
            {
              loc: null,
              name: ' ',
              type: COMBINATOR
            },
            {
              loc: null,
              name: 'li',
              type: SELECTOR_TYPE
            },
            {
              loc: null,
              name: '~',
              type: COMBINATOR
            },
            {
              loc: null,
              name: 'li',
              type: SELECTOR_TYPE
            }
          ],
          [
            {
              loc: null,
              name: 'dd',
              type: SELECTOR_TYPE
            }
          ]
        ];
        const node = document.getElementById('li3');
        const matcher = new Matcher(':is(ul li ~ li)', node);
        const res = matcher._matchLogicalPseudoFunc({
          astName: 'is',
          branches,
          selector: 'li~li',
          twigBranches: [
            [
              {
                combo: {
                  loc: null,
                  name: ' ',
                  type: COMBINATOR
                },
                leaves: [
                  {
                    loc: null,
                    name: 'ul',
                    type: SELECTOR_TYPE
                  }
                ]
              },
              {
                combo: {
                  loc: null,
                  name: '~',
                  type: COMBINATOR
                },
                leaves: [
                  {
                    loc: null,
                    name: 'li',
                    type: SELECTOR_TYPE
                  }
                ]
              },
              {
                combo: null,
                leaves: [
                  {
                    loc: null,
                    name: 'li',
                    type: SELECTOR_TYPE
                  }
                ]
              }
            ]
          ]
        }, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should not match', () => {
        const branches = [
          [
            {
              loc: null,
              name: 'ol',
              type: SELECTOR_TYPE
            }
          ],
          [
            {
              loc: null,
              name: 'dl',
              type: SELECTOR_TYPE
            }
          ]
        ];
        const node = document.getElementById('ul1');
        const matcher = new Matcher(':is(ol, dl)', node);
        const res = matcher._matchLogicalPseudoFunc({
          astName: 'is',
          branches,
          selector: 'ol,dl',
          twigBranches: [
            [
              {
                combo: null,
                leaves: [
                  {
                    loc: null,
                    name: 'ol',
                    type: SELECTOR_TYPE
                  }
                ]
              }
            ],
            [
              {
                combo: null,
                leaves: [
                  {
                    loc: null,
                    name: 'dl',
                    type: SELECTOR_TYPE
                  }
                ]
              }
            ]
          ]
        }, node);
        assert.isNull(res, 'result');
      });

      it('should get matched node', () => {
        const branches = [
          [
            {
              loc: null,
              name: 'ul',
              type: SELECTOR_TYPE
            }
          ],
          [
            {
              loc: null,
              name: 'dl',
              type: SELECTOR_TYPE
            }
          ]
        ];
        const node = document.getElementById('ul1');
        const matcher = new Matcher(':where(ul, dl)', node);
        const res = matcher._matchLogicalPseudoFunc({
          astName: 'where',
          branches,
          selector: 'ul,dl',
          twigBranches: [
            [
              {
                combo: null,
                leaves: [
                  {
                    loc: null,
                    name: 'ul',
                    type: SELECTOR_TYPE
                  }
                ]
              }
            ],
            [
              {
                combo: null,
                leaves: [
                  {
                    loc: null,
                    name: 'dl',
                    type: SELECTOR_TYPE
                  }
                ]
              }
            ]
          ]
        }, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should not match', () => {
        const branches = [
          [
            {
              loc: null,
              name: 'ol',
              type: SELECTOR_TYPE
            }
          ],
          [
            {
              loc: null,
              name: 'dl',
              type: SELECTOR_TYPE
            }
          ]
        ];
        const node = document.getElementById('ul1');
        const matcher = new Matcher(':where(ol, dl)', node);
        const res = matcher._matchLogicalPseudoFunc({
          astName: 'where',
          branches,
          selector: 'ol,dl',
          twigBranches: [
            [
              {
                combo: null,
                leaves: [
                  {
                    loc: null,
                    name: 'ol',
                    type: SELECTOR_TYPE
                  }
                ]
              }
            ],
            [
              {
                combo: null,
                leaves: [
                  {
                    loc: null,
                    name: 'dl',
                    type: SELECTOR_TYPE
                  }
                ]
              }
            ]
          ]
        }, node);
        assert.isNull(res, 'result');
      });

      it('should get matched node', () => {
        const branches = [
          [
            {
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          loc: null,
                          name: 'li',
                          type: SELECTOR_TYPE
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
                          type: SELECTOR_TYPE
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
              type: SELECTOR_PSEUDO_CLASS
            }
          ]
        ];
        const node = document.getElementById('dt2');
        const matcher = new Matcher(':not(:is(li, dd))', node);
        const res = matcher._matchLogicalPseudoFunc({
          astName: 'not',
          branches,
          selector: ':is(li, dd)',
          twigBranches: [
            [
              {
                combo: null,
                leaves: [
                  {
                    children: [
                      {
                        children: [
                          {
                            children: [
                              {
                                loc: null,
                                name: 'li',
                                type: SELECTOR_TYPE
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
                                type: SELECTOR_TYPE
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
                    type: SELECTOR_PSEUDO_CLASS
                  }
                ]
              }
            ]
          ]
        }, node);
        assert.deepEqual(res, node, 'result');
      });
    });

    describe('match pseudo class selector', () => {
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
                      type: SELECTOR_TYPE
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
                      type: SELECTOR_TYPE
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
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.getElementById('ul1');
        const matcher = new Matcher(':is(ul, dl)', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
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
          name: 'nth-child',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.getElementById('dt1');
        const matcher = new Matcher(':nth-child(even)', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          document.getElementById('dd1'),
          document.getElementById('dd2'),
          document.getElementById('dd3')
        ], 'result');
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
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        node.setAttribute('dir', 'ltr');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':dir(ltr)', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
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
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        node.setAttribute('lang', 'en');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':lang(en)', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: [
            {
              type: RAW,
              value: 'foo'
            }
          ],
          loc: null,
          name: 'current',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':current(foo)', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
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
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':current(foo)', node, {
          warn: true
        });
        assert.throws(() => matcher._matchPseudoClassSelector(leaf, node),
          DOMException, 'Unsupported pseudo-class :current()');
      });

      it('should not match', () => {
        const leaf = {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: 'foo',
                  type: SELECTOR_CLASS
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          name: 'host',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':host(.foo)', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: 'foo',
                  type: SELECTOR_CLASS
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          name: 'host-context',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':host-context(.foo)', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
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
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':foobar(foo)', node);
        assert.throws(() => matcher._matchPseudoClassSelector(leaf, node),
          DOMException, 'Unknown pseudo-class :foobar()');
      });

      it('should not match', () => {
        const leaf = {
          children: [
            {
              type: RAW,
              value: 'foo'
            }
          ],
          loc: null,
          name: 'foobar',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':foobar(foo)', node);
        const res = matcher._matchPseudoClassSelector(leaf, node, {
          forgive: true
        });
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'any-link',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('a');
        node.setAttribute('href', 'https://example.com/');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':any-link', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      // FIXME:
      xit('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'any-link',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('a');
        node.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
          'https://example.com/');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':any-link', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'any-link',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('a');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':any-link', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'link',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('a');
        node.setAttribute('href', 'https://example.com/');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':link', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'local-link',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('a');
        node.setAttribute('href', './#foo');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':local-link', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'local-link',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('a');
        node.setAttribute('href', 'https://example.com');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':local-link', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'visited',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('a');
        node.href = 'https://example.com';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':visited', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'target',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        node.id = 'foo';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':target', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'target',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        node.id = 'bar';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':target', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'target',
          type: SELECTOR_PSEUDO_CLASS
        };
        const frag = document.createDocumentFragment();
        const node = document.createElement('div');
        node.id = 'foo';
        frag.appendChild(node);
        const matcher = new Matcher(':target', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'target-within',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        node.id = 'foo';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':target-within', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'target-within',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        node.id = 'foo';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':target-within', parent);
        const res = matcher._matchPseudoClassSelector(leaf, parent);
        assert.deepEqual([...res], [
          parent
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'target-within',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        node.id = 'bar';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':target-within', parent);
        const res = matcher._matchPseudoClassSelector(leaf, parent);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'scope',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        node.id = 'foo';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':scope', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'scope',
          type: SELECTOR_PSEUDO_CLASS
        };
        const refPoint = document.createElement('div');
        const node = document.createElement('div');
        node.id = 'foo';
        refPoint.appendChild(node);
        const parent = document.getElementById('div0');
        parent.appendChild(refPoint);
        const matcher = new Matcher(':scope', refPoint);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'scope',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.documentElement;
        const matcher = new Matcher(':scope', document);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'scope',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        node.id = 'foo';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':scope', document);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'focus',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('button');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        node.focus();
        const matcher = new Matcher(':focus', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'focus',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('button');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':focus', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'focus-within',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('button');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        node.focus();
        const matcher = new Matcher(':focus-within', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'focus-within',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('button');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':focus-within', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'focus-within',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('button');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        node.focus();
        const matcher = new Matcher(':focus-within', parent);
        const res = matcher._matchPseudoClassSelector(leaf, parent);
        assert.deepEqual([...res], [
          parent
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'focus-within',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('button');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':focus-within', parent);
        const res = matcher._matchPseudoClassSelector(leaf, parent);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'open',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('details');
        node.setAttribute('open', 'open');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':open', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'open',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('details');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':open', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'closed',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('details');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':closed', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'closed',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('details');
        node.setAttribute('open', 'open');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':closed', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'disabled',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('disabled', 'disabled');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':disabled', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'disabled',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':disabled', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'disabled',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('x-input');
        node.setAttribute('disabled', 'disabled');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':disabled', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'disabled',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node1 = document.createElement('input');
        const node2 = document.createElement('fieldset');
        node2.setAttribute('disabled', 'disabled');
        node2.appendChild(node1);
        const parent = document.getElementById('div0');
        parent.appendChild(node2);
        const matcher = new Matcher(':disabled', node1);
        const res = matcher._matchPseudoClassSelector(leaf, node1);
        assert.deepEqual([...res], [
          node1
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'disabled',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node1 = document.createElement('input');
        const node2 = document.createElement('legend');
        node2.appendChild(node1);
        const node3 = document.createElement('fieldset');
        node3.setAttribute('disabled', 'disabled');
        node3.appendChild(node2);
        const parent = document.getElementById('div0');
        parent.appendChild(node2);
        const matcher = new Matcher(':disabled', node1);
        const res = matcher._matchPseudoClassSelector(leaf, node1);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'enabled',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':enabled', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'enabled',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('x-input');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':enabled', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'enabled',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('disabled', 'disabled');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':enabled', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'read-only',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('readonly', 'readonly');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':read-only', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'read-only',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'text');
        node.setAttribute('readonly', 'readonly');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':read-only', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'read-only',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'number');
        node.setAttribute('readonly', 'readonly');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':read-only', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'read-only',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'range');
        node.setAttribute('readonly', 'readonly');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':read-only', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'read-only',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('disabled', 'disabled');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':read-only', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'read-only',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':read-only', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'read-only',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('textarea');
        node.setAttribute('readonly', 'readonly');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':read-only', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'read-only',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('textarea');
        node.setAttribute('disabled', 'disabled');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':read-only', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'read-only',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('textarea');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':read-only', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'read-only',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':read-only', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'read-only',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        node.setAttribute('contenteditable', 'true');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':read-only', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'read-write',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':read-write', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'read-write',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'text');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':read-write', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'read-write',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'number');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':read-write', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'read-write',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'range');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':read-write', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'read-write',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('readonly', 'readonly');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':read-write', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'read-write',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('disabled', 'disabled');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':read-write', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'read-write',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('textarea');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':read-write', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'read-write',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('textarea');
        node.setAttribute('readonly', 'readonly');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':read-write', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'read-write',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('textarea');
        node.setAttribute('disabled', 'disabled');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':read-write', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'read-write',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        node.setAttribute('contenteditable', 'true');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':read-write', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'read-write',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':read-write', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'placeholder-shown',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('placeholder', 'foo');
        node.value = '';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':placeholder-shown', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'placeholder-shown',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'text');
        node.setAttribute('placeholder', 'foo');
        node.value = '';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':placeholder-shown', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'placeholder-shown',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'hidden');
        node.setAttribute('placeholder', 'foo');
        node.value = '';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':placeholder-shown', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'placeholder-shown',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('placeholder', 'foo');
        node.value = 'bar';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':placeholder-shown', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'placeholder-shown',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('placeholder', ' ');
        node.value = '';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':placeholder-shown', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'placeholder-shown',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('textarea');
        node.setAttribute('placeholder', 'foo');
        node.value = '';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':placeholder-shown', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'checked',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'checkbox');
        node.setAttribute('checked', 'checked');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':checked', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'checked',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'radio');
        node.setAttribute('checked', 'checked');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':checked', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'checked',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'text');
        node.setAttribute('checked', 'checked');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':checked', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'checked',
          type: SELECTOR_PSEUDO_CLASS
        };
        const container = document.createElement('select');
        const node = document.createElement('option');
        node.setAttribute('selected', 'selected');
        container.appendChild(node);
        const parent = document.getElementById('div0');
        parent.appendChild(container);
        const matcher = new Matcher(':checked', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'indeterminate',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'checkbox');
        node.indeterminate = true;
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':indeterminate', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'indeterminate',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'checkbox');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':indeterminate', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'indeterminate',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('progress');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':indeterminate', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'indeterminate',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('progress');
        node.setAttribute('value', '0');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':indeterminate', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'indeterminate',
          type: SELECTOR_PSEUDO_CLASS
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
        const matcher = new Matcher(':indeterminate', node1);
        const res = matcher._matchPseudoClassSelector(leaf, node1);
        assert.deepEqual([...res], [
          node1
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'indeterminate',
          type: SELECTOR_PSEUDO_CLASS
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
        const matcher = new Matcher(':indeterminate', node1);
        const res = matcher._matchPseudoClassSelector(leaf, node1);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'indeterminate',
          type: SELECTOR_PSEUDO_CLASS
        };
        const form = document.createElement('form');
        const node1 = document.createElement('input');
        node1.setAttribute('type', 'radio');
        const node2 = document.createElement('input');
        node2.setAttribute('type', 'radio');
        const node3 = document.createElement('input');
        node3.setAttribute('type', 'radio');
        form.appendChild(node1);
        form.appendChild(node2);
        form.appendChild(node3);
        const parent = document.getElementById('div0');
        parent.appendChild(form);
        const matcher = new Matcher(':indeterminate', node1);
        const res = matcher._matchPseudoClassSelector(leaf, node1);
        assert.deepEqual([...res], [
          node1
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'indeterminate',
          type: SELECTOR_PSEUDO_CLASS
        };
        const form = document.createElement('form');
        form.id = 'form1';
        const node1 = document.createElement('input');
        node1.setAttribute('type', 'radio');
        node1.setAttribute('form', 'form1');
        node1.setAttribute('name', 'foo');
        const node2 = document.createElement('input');
        node2.setAttribute('type', 'radio');
        node2.setAttribute('form', 'form1');
        node2.setAttribute('name', 'foo');
        const node3 = document.createElement('input');
        node3.setAttribute('type', 'radio');
        node3.setAttribute('form', 'form1');
        node3.setAttribute('name', 'foo');
        const div = document.createElement('div');
        div.appendChild(node1);
        div.appendChild(node2);
        div.appendChild(node3);
        const parent = document.getElementById('div0');
        parent.appendChild(form);
        parent.appendChild(div);
        const matcher = new Matcher(':indeterminate', node1);
        const res = matcher._matchPseudoClassSelector(leaf, node1);
        assert.deepEqual([...res], [
          node1
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'default',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'checkbox');
        node.setAttribute('checked', 'checked');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':default', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'default',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'checkbox');
        node.checked = true;
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':default', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'default',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'checkbox');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':default', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'default',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'radio');
        node.checked = true;
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':default', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'default',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'radio');
        node.setAttribute('checked', 'checked');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':default', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'default',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'radio');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':default', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'default',
          type: SELECTOR_PSEUDO_CLASS
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
        const matcher = new Matcher(':default', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'default',
          type: SELECTOR_PSEUDO_CLASS
        };
        const container = document.createElement('select');
        const group = document.createElement('optgroup');
        const prev = document.createElement('option');
        const node = document.createElement('option');
        node.selected = true;
        group.appendChild(prev);
        group.appendChild(node);
        container.appendChild(group);
        const parent = document.getElementById('div0');
        parent.appendChild(container);
        const matcher = new Matcher(':default', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'default',
          type: SELECTOR_PSEUDO_CLASS
        };
        const container = document.createElement('select');
        const group = document.createElement('optgroup');
        const prev = document.createElement('option');
        const node = document.createElement('option');
        prev.setAttribute('selected', 'selected');
        node.setAttribute('selected', 'selected');
        group.appendChild(prev);
        group.appendChild(node);
        container.appendChild(group);
        const parent = document.getElementById('div0');
        parent.appendChild(container);
        const matcher = new Matcher(':default', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'default',
          type: SELECTOR_PSEUDO_CLASS
        };
        const container = document.createElement('select');
        const group = document.createElement('optgroup');
        const prev = document.createElement('option');
        const node = document.createElement('option');
        group.appendChild(prev);
        group.appendChild(node);
        container.appendChild(group);
        const parent = document.getElementById('div0');
        parent.appendChild(container);
        const matcher = new Matcher(':default', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'default',
          type: SELECTOR_PSEUDO_CLASS
        };
        const container = document.createElement('select');
        const node = document.createElement('option');
        const next = document.createElement('option');
        container.appendChild(node);
        container.appendChild(next);
        const parent = document.getElementById('div0');
        parent.appendChild(container);
        const matcher = new Matcher(':default', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'default',
          type: SELECTOR_PSEUDO_CLASS
        };
        const container = document.createElement('select');
        const node = document.createElement('option');
        const next = document.createElement('option');
        next.setAttribute('selected', 'selected');
        container.appendChild(node);
        container.appendChild(next);
        const parent = document.getElementById('div0');
        parent.appendChild(container);
        const matcher = new Matcher(':default', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'default',
          type: SELECTOR_PSEUDO_CLASS
        };
        const container = document.createElement('select');
        container.setAttribute('multiple', 'multiple');
        const prev = document.createElement('option');
        const node = document.createElement('option');
        container.appendChild(prev);
        container.appendChild(node);
        const parent = document.getElementById('div0');
        parent.appendChild(container);
        const matcher = new Matcher(':default', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'default',
          type: SELECTOR_PSEUDO_CLASS
        };
        const container = document.createElement('select');
        container.setAttribute('multiple', 'multiple');
        const prev = document.createElement('option');
        const node = document.createElement('option');
        prev.setAttribute('selected', 'selected');
        node.setAttribute('selected', 'selected');
        container.appendChild(prev);
        container.appendChild(node);
        const parent = document.getElementById('div0');
        parent.appendChild(container);
        const matcher = new Matcher(':default', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'default',
          type: SELECTOR_PSEUDO_CLASS
        };
        const container = document.createElement('datalist');
        const prev = document.createElement('option');
        const node = document.createElement('option');
        node.setAttribute('selected', 'selected');
        container.appendChild(prev);
        container.appendChild(node);
        const parent = document.getElementById('div0');
        parent.appendChild(container);
        const matcher = new Matcher(':default', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'default',
          type: SELECTOR_PSEUDO_CLASS
        };
        const container = document.createElement('datalist');
        const prev = document.createElement('option');
        const node = document.createElement('option');
        container.appendChild(prev);
        container.appendChild(node);
        const parent = document.getElementById('div0');
        parent.appendChild(container);
        const matcher = new Matcher(':default', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'default',
          type: SELECTOR_PSEUDO_CLASS
        };
        const form = document.createElement('form');
        const node = document.createElement('button');
        form.appendChild(node);
        const parent = document.getElementById('div0');
        parent.appendChild(form);
        const matcher = new Matcher(':default', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'default',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('button');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':default', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'default',
          type: SELECTOR_PSEUDO_CLASS
        };
        const form = document.createElement('form');
        const node = document.createElement('button');
        node.setAttribute('type', 'submit');
        form.appendChild(node);
        const parent = document.getElementById('div0');
        parent.appendChild(form);
        const matcher = new Matcher(':default', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'default',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('button');
        node.setAttribute('type', 'submit');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':default', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'default',
          type: SELECTOR_PSEUDO_CLASS
        };
        const form = document.createElement('form');
        const node = document.createElement('input');
        node.setAttribute('type', 'submit');
        form.appendChild(node);
        const parent = document.getElementById('div0');
        parent.appendChild(form);
        const matcher = new Matcher(':default', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'default',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'submit');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':default', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'default',
          type: SELECTOR_PSEUDO_CLASS
        };
        const form = document.createElement('form');
        const node = document.createElement('input');
        node.setAttribute('type', 'image');
        form.appendChild(node);
        const parent = document.getElementById('div0');
        parent.appendChild(form);
        const matcher = new Matcher(':default', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'default',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'image');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':default', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'valid',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'text');
        node.setAttribute('required', 'required');
        node.value = 'foo';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':valid', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'valid',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'text');
        node.setAttribute('required', 'required');
        node.value = '';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':valid', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'valid',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('fieldset');
        const input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('required', 'required');
        input.value = 'foo';
        node.appendChild(input);
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':valid', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'valid',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('fieldset');
        const input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('required', 'required');
        input.value = '';
        node.appendChild(input);
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':valid', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'valid',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('form');
        const input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('required', 'required');
        input.value = 'foo';
        node.appendChild(input);
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':valid', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'valid',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('form');
        const input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('required', 'required');
        input.value = '';
        node.appendChild(input);
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':valid', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'invalid',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'text');
        node.setAttribute('required', 'required');
        node.value = '';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':invalid', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'invalid',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'text');
        node.setAttribute('required', 'required');
        node.value = 'foo';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':invalid', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'invalid',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('fieldset');
        const input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('required', 'required');
        input.value = '';
        node.appendChild(input);
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':invalid', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'invalid',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('fieldset');
        const input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('required', 'required');
        input.value = 'foo';
        node.appendChild(input);
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':invalid', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'invalid',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('form');
        const input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('required', 'required');
        input.value = '';
        node.appendChild(input);
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':invalid', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'invalid',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('form');
        const input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('required', 'required');
        input.value = 'foo';
        node.appendChild(input);
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':invalid', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'in-range',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.readonly = true;
        node.setAttribute('type', 'number');
        node.setAttribute('min', '1');
        node.setAttribute('max', '10');
        node.value = '1';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':in-range', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'in-range',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.disabled = true;
        node.setAttribute('type', 'number');
        node.setAttribute('min', '1');
        node.setAttribute('max', '10');
        node.value = '1';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':in-range', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'in-range',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('hidden', 'hidden');
        node.setAttribute('min', '1');
        node.setAttribute('max', '10');
        node.value = '1';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':in-range', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'in-range',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'text');
        node.setAttribute('min', '1');
        node.setAttribute('max', '10');
        node.value = '1';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':in-range', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'in-range',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('min', '1');
        node.setAttribute('max', '10');
        node.value = '1';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':in-range', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'in-range',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'number');
        node.setAttribute('min', '1');
        node.setAttribute('max', '10');
        node.value = '1';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':in-range', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'in-range',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'number');
        node.setAttribute('min', '1');
        node.setAttribute('max', '10');
        node.value = '0';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':in-range', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'in-range',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'number');
        node.setAttribute('min', '1');
        node.setAttribute('max', '10');
        node.value = '11';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':in-range', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'out-of-range',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.readonly = true;
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':out-of-range', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'out-of-range',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('hidden', 'hidden');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':out-of-range', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'out-of-range',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'number');
        node.setAttribute('min', '1');
        node.setAttribute('max', '10');
        node.value = '0';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':out-of-range', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'out-of-range',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'number');
        node.setAttribute('min', '1');
        node.setAttribute('max', '10');
        node.value = '11';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':out-of-range', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'out-of-range',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'number');
        node.setAttribute('min', '1');
        node.setAttribute('max', '10');
        node.value = '1';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':out-of-range', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'required',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('required', 'required');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':required', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'required',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'text');
        node.setAttribute('required', 'required');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':required', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'required',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'number');
        node.setAttribute('required', 'required');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':required', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'required',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'range');
        node.setAttribute('required', 'required');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':required', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'required',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'checkbox');
        node.setAttribute('required', 'required');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':required', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'required',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'radio');
        node.setAttribute('required', 'required');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':required', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'required',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'file');
        node.setAttribute('required', 'required');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':required', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'required',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('textarea');
        node.setAttribute('required', 'required');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':required', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'required',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('select');
        node.setAttribute('required', 'required');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':required', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'required',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':required', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'optional',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':optional', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'optional',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'text');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':optional', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'optional',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'number');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':optional', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'optional',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'range');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':optional', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'optional',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'checkbox');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':optional', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'optional',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'radio');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':optional', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'optional',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('select');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':optional', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'optional',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('textarea');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':optional', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'optional',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('input');
        node.setAttribute('required', 'required');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':optional', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'root',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.documentElement;
        const matcher = new Matcher(':root', document);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'root',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':root', document);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'empty',
          type: SELECTOR_PSEUDO_CLASS
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
        const matcher = new Matcher(':empty', document);
        const res1 = matcher._matchPseudoClassSelector(leaf, p1);
        const res2 = matcher._matchPseudoClassSelector(leaf, p2);
        const res3 = matcher._matchPseudoClassSelector(leaf, p3);
        const res4 = matcher._matchPseudoClassSelector(leaf, p4);
        const res5 = matcher._matchPseudoClassSelector(leaf, p5);
        const res6 = matcher._matchPseudoClassSelector(leaf, s1);
        assert.deepEqual([...res1], [
          p1
        ], 'result');
        assert.deepEqual([...res2], [
          p2
        ], 'result');
        assert.deepEqual([...res3], [], 'result');
        assert.deepEqual([...res4], [], 'result');
        assert.deepEqual([...res5], [], 'result');
        assert.deepEqual([...res6], [
          s1
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'first-child',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        const next = document.createElement('div');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        parent.appendChild(next);
        const matcher = new Matcher(':first-child', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'first-child',
          type: SELECTOR_PSEUDO_CLASS
        };
        const prev = document.createElement('div');
        const node = document.createElement('div');
        const parent = document.getElementById('div0');
        parent.appendChild(prev);
        parent.appendChild(node);
        const matcher = new Matcher(':first-child', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'first-child',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        const matcher = new Matcher(':first-child', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'last-child',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        const next = document.createElement('div');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        parent.appendChild(next);
        const matcher = new Matcher(':last-child', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'last-child',
          type: SELECTOR_PSEUDO_CLASS
        };
        const prev = document.createElement('div');
        const node = document.createElement('div');
        const parent = document.getElementById('div0');
        parent.appendChild(prev);
        parent.appendChild(node);
        const matcher = new Matcher(':last-child', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'last-child',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        const matcher = new Matcher(':last-child', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'only-child',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':only-child', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'only-child',
          type: SELECTOR_PSEUDO_CLASS
        };
        const prev = document.createElement('div');
        const node = document.createElement('div');
        const next = document.createElement('div');
        const parent = document.getElementById('div0');
        parent.appendChild(prev);
        parent.appendChild(node);
        parent.appendChild(next);
        const matcher = new Matcher(':only-child', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'only-child',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        const matcher = new Matcher(':only-child', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'first-of-type',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.getElementById('dt2');
        const matcher = new Matcher(':first-of-type', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          document.getElementById('dt1')
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'first-of-type',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        const matcher = new Matcher(':first-of-type', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'last-of-type',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.getElementById('dt2');
        const matcher = new Matcher(':last-of-type', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          document.getElementById('dt3')
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'last-of-type',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        const matcher = new Matcher(':last-of-type', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'only-of-type',
          type: SELECTOR_PSEUDO_CLASS
        };
        const parent = document.createElement('dl');
        const node1 = document.createElement('dt');
        const node2 = document.createElement('dd');
        parent.appendChild(node1);
        parent.appendChild(node2);
        document.getElementById('div0').appendChild(parent);
        const matcher = new Matcher(':only-of-type', node1);
        const res = matcher._matchPseudoClassSelector(leaf, node1);
        assert.deepEqual([...res], [
          node1
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          children: null,
          name: 'only-of-type',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        const matcher = new Matcher(':only-of-type', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'host',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher(':host', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'host-context',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher(':host-context', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      // legacy pseudo-element
      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'after',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher(':after', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should throw', () => {
        const leaf = {
          children: null,
          name: 'after',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher(':after', node, {
          warn: true
        });
        assert.throws(() => matcher._matchPseudoClassSelector(leaf, node),
          DOMException, 'Unsupported pseudo-element ::after');
      });

      // not supported
      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'active',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher(':active', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should throw', () => {
        const leaf = {
          children: null,
          name: 'active',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher(':active', node, {
          warn: true
        });
        assert.throws(() => matcher._matchPseudoClassSelector(leaf, node),
          DOMException, 'Unsupported pseudo-class :active');
      });

      // unknown
      it('should throw', () => {
        const leaf = {
          children: null,
          name: 'foo',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher(':foo', node);
        assert.throws(() => matcher._matchPseudoClassSelector(leaf, node),
          DOMException, 'Unknown pseudo-class :foo');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'foo',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher(':foo', node);
        const res = matcher._matchPseudoClassSelector(leaf, node, {
          forgive: true
        });
        assert.deepEqual([...res], [], 'result');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: '-webkit-foo',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher(':-webkit-foo', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should throw', () => {
        const leaf = {
          children: null,
          name: '-webkit-foo',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher(':-webkit-foo', node, {
          warn: true
        });
        assert.throws(() => matcher._matchPseudoClassSelector(leaf, node),
          DOMException, 'Unsupported pseudo-class :-webkit-foo');
      });

      it('should throw', () => {
        const leaf = {
          children: null,
          name: 'webkit-foo',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher(':webkit-foo', node);
        assert.throws(() => matcher._matchPseudoClassSelector(leaf, node),
          DOMException, 'Unknown pseudo-class :webkit-foo');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: 'webkit-foo',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher(':webkit-foo', node);
        const res = matcher._matchPseudoClassSelector(leaf, node, {
          forgive: true
        });
        assert.deepEqual([...res], [], 'result');
      });

      it('should throw', () => {
        const leaf = {
          children: null,
          name: '-webkitfoo',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher(':-webkitfoo', node);
        assert.throws(() => matcher._matchPseudoClassSelector(leaf, node),
          DOMException, 'Unknown pseudo-class :-webkitfoo');
      });

      it('should not match', () => {
        const leaf = {
          children: null,
          name: '-webkitfoo',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher(':-webkitfoo', node);
        const res = matcher._matchPseudoClassSelector(leaf, node, {
          forgive: true
        });
        assert.deepEqual([...res], [], 'result');
      });
    });

    describe('match attribute selector', () => {
      it('should throw', () => {
        const leaf = {
          flags: 'baz',
          matcher: '=',
          name: {
            name: 'foo',
            type: IDENTIFIER
          },
          type: SELECTOR_ATTR,
          value: {
            name: 'bar',
            type: IDENTIFIER
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'bar baz');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo=bar baz]', node);
        assert.throws(() => matcher._matchAttributeSelector(leaf, node),
          DOMException, 'Invalid selector [foo=bar baz]');
      });

      it('should get matched node', () => {
        const leaf = {
          flags: null,
          matcher: null,
          name: {
            name: '|foo',
            type: IDENTIFIER
          },
          type: SELECTOR_ATTR,
          value: null
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[|foo]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: null
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'Bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[|foo s]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: null
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'Bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[|Foo i]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: null
        };
        const node = document.createElement('div');
        node.setAttributeNS('https://example.com/baz', 'baz:foo', 'qux');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[|foo]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: null
        };
        const node = document.createElement('div');
        node.setAttributeNS('https://example.com/baz', 'baz:foo', 'qux');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[*|foo]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: null
        };
        const node = document.createElement('div');
        node.setAttributeNS('https://example.com/baz', 'baz:foo', 'Qux');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[*|foo s]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: null
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[*|foo]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: null
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'Bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[*|foo s]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: null
        };
        document.documentElement.setAttribute('xmlns:baz',
          'https://example.com/baz');
        const node = document.createElement('div');
        node.setAttributeNS('https://example.com/baz', 'baz:foo', 'qux');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[baz|foo]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: null
        };
        const node = document.createElement('div');
        node.setAttributeNS('https://example.com/baz', 'baz:foo', 'qux');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[baz|foo]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
        assert.isNull(res, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          flags: 's',
          matcher: null,
          name: {
            name: 'Baz|Foo',
            type: IDENTIFIER
          },
          type: SELECTOR_ATTR,
          value: null
        };
        document.documentElement.setAttribute('xmlns:Baz',
          'https://example.com/baz');
        const node = document.createElement('div');
        node.setAttributeNS('https://example.com/baz', 'Baz:Foo', 'Qux');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[Baz|Foo s]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should not match', () => {
        const leaf = {
          flags: 's',
          matcher: null,
          name: {
            name: 'Baz|Foo',
            type: IDENTIFIER
          },
          type: SELECTOR_ATTR,
          value: null
        };
        const node = document.createElement('div');
        node.setAttributeNS('https://example.com/baz', 'Baz:Foo', 'Qux');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[Baz|Foo s]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
        assert.isNull(res, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          flags: 'i',
          matcher: null,
          name: {
            name: 'Baz|Foo',
            type: IDENTIFIER
          },
          type: SELECTOR_ATTR,
          value: null
        };
        document.documentElement.setAttribute('xmlns:baz',
          'https://example.com/baz');
        const node = document.createElement('div');
        node.setAttributeNS('https://example.com/baz', 'baz:foo', 'Qux');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[Baz|Foo i]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: null
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[baz|foo]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: null
        };
        const node = document.createElement('div');
        node.setAttributeNS('https://example.com/baz', 'baz:foo', 'qux');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: null
        };
        const node = document.createElement('div');
        node.setAttributeNS('https://example.com/baz', 'baz:foo', 'Qux');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo s]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: null
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: null
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'Bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo s]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: null
        };
        const node = document.createElement('div');
        node.setAttributeNS('https://example.com/baz', 'baz:bar', 'qux');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: null
        };
        const node = document.createElement('div');
        node.setAttribute('baz', 'bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            name: 'bar',
            type: IDENTIFIER
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo=bar]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            name: 'Bar',
            type: IDENTIFIER
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'Bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo=Bar]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            name: 'bar',
            type: IDENTIFIER
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'Bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo=bar s]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            name: 'bar',
            type: IDENTIFIER
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'baz');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo=bar]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo=bar]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'Bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'Bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo=Bar]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'Bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo=bar s]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar baz'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'bar baz');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo="bar baz"]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'qux'
          }
        };
        document.documentElement.setAttribute('xmlns:baz',
          'https://example.com/baz');
        const node = document.createElement('div');
        node.setAttribute('foo', 'bar');
        node.setAttributeNS('https://example.com/baz', 'baz:foo', 'qux');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[baz|foo=qux]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          flags: null,
          matcher: '=',
          name: {
            name: 'xml|lang',
            type: IDENTIFIER
          },
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'en'
          }
        };
        const node = document.createElement('div');
        node.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:lang', 'en');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[lang=en]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'bar baz');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo~=bar]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'Bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'Bar baz');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo~=Bar s]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'Bar baz');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo~=bar s]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'baz bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo~=bar]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'baz qux');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo~=bar]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: ''
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'baz qux');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo~=""]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo|=bar]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'Bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'Bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo|=Bar s]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'Bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo|=bar s]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'bar-baz');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo|=bar]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'Bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'Bar-baz');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo|=Bar s]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'Bar-baz');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo|=bar s]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'baz-bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo|=bar]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: ''
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'baz-bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo|=""]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo^=bar]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'barbaz');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo^=bar]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'bar baz');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo^=bar]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'baz bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo^=bar]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'Bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'Bar baz');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo^=Bar s]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'Bar baz');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo^=bar s]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: ''
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'Bar baz');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo^="" s]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo$=bar]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'bazbar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo$=bar]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'baz bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo$=bar]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'bar baz');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo$=bar]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'Bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'baz Bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo$=Bar s]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'baz Bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo$=bar s]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: ''
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'baz Bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo$="" s]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo*=bar]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'bazbarqux');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo*=bar]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'baz bar qux');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo*=bar]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'baz qux quux');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo*=bar]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'Bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'baz Bar qux');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo*=Bar s]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'bar'
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'baz Bar qux');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo*=bar s]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: ''
          }
        };
        const node = document.createElement('div');
        node.setAttribute('foo', 'baz Bar qux');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[foo*="" s]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
        assert.isNull(res, 'result');
      });

      it('should get matched node(s)', () => {
        const leaf = {
          flags: 'i',
          matcher: '=',
          name: {
            name: 'baz',
            type: IDENTIFIER
          },
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'qux'
          }
        };
        const domStr = '<foo></foo>';
        const doc = new DOMParser().parseFromString(domStr, 'text/xml');
        const node = doc.createElement('bar');
        node.setAttribute('baz', 'QUX');
        doc.documentElement.appendChild(node);
        const matcher = new Matcher('[baz=qux i]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should not match', () => {
        const leaf = {
          flags: 's',
          matcher: '=',
          name: {
            name: 'baz',
            type: IDENTIFIER
          },
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'qux'
          }
        };
        const domStr = '<foo></foo>';
        const doc = new DOMParser().parseFromString(domStr, 'text/xml');
        const node = doc.createElement('bar');
        node.setAttribute('baz', 'QUX');
        doc.documentElement.appendChild(node);
        const matcher = new Matcher('[baz=qux s]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
        assert.isNull(res, 'result');
      });

      it('should not match', () => {
        const leaf = {
          flags: null,
          matcher: '=',
          name: {
            name: 'baz',
            type: IDENTIFIER
          },
          type: SELECTOR_ATTR,
          value: {
            type: STRING,
            value: 'qux'
          }
        };
        const domStr = '<foo></foo>';
        const doc = new DOMParser().parseFromString(domStr, 'text/xml');
        const node = doc.createElement('bar');
        node.setAttribute('baz', 'QUX');
        doc.documentElement.appendChild(node);
        const matcher = new Matcher('[baz=qux]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
        assert.isNull(res, 'result');
      });
    });

    describe('match class selector', () => {
      it('should get matched node', () => {
        const leaf = {
          name: 'foo',
          type: SELECTOR_CLASS
        };
        const node = document.createElement('div');
        node.classList.add('foo');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('.foo', node);
        const res = matcher._matchClassSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should not match', () => {
        const leaf = {
          name: 'bar',
          type: SELECTOR_CLASS
        };
        const node = document.createElement('div');
        node.classList.add('foo');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('.bar', node);
        const res = matcher._matchClassSelector(leaf, node);
        assert.isNull(res, 'result');
      });
    });

    describe('match id selector', () => {
      it('should get matched node', () => {
        const leaf = {
          name: 'div0',
          type: SELECTOR_ID
        };
        const node = document.getElementById('div0');
        const matcher = new Matcher('#div0', node);
        const res = matcher._matchIDSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should not match', () => {
        const leaf = {
          name: 'foo',
          type: SELECTOR_ID
        };
        const node = document.getElementById('div0');
        const matcher = new Matcher('#foo', node);
        const res = matcher._matchIDSelector(leaf, node);
        assert.isNull(res, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: 'foo\\ bar',
          type: SELECTOR_ID
        };
        const node = document.createElement('div');
        node.setAttribute('id', 'foo bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('#foo\\ bar', node);
        const res = matcher._matchIDSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });
    });

    describe('match type selector', () => {
      it('should get matched node(s)', () => {
        const leaf = {
          name: '|*',
          type: SELECTOR_TYPE
        };
        const node = document.createElementNS('', 'div');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('|*', node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should not match', () => {
        const leaf = {
          name: '|*',
          type: SELECTOR_TYPE
        };
        const node = document.getElementById('div0');
        const matcher = new Matcher('|*', node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.isNull(res, 'result');
      });

      it('should not match', () => {
        const leaf = {
          name: '|*',
          type: SELECTOR_TYPE
        };
        const node = document.createElementNS('https://example.com/foo', 'div');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('|*', node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.isNull(res, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: '*|*',
          type: SELECTOR_TYPE
        };
        const node = document.getElementById('div0');
        const matcher = new Matcher('*|*', node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: '*|*',
          type: SELECTOR_TYPE
        };
        const node =
          document.createElementNS('https://example.com/foo', 'foo:bar');
        node.setAttribute('xmlns:foo', 'https://example.com/foo');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('*|*', node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: 'foo|*',
          type: SELECTOR_TYPE
        };
        const node =
          document.createElementNS('https://example.com/foo', 'foo:bar');
        node.setAttribute('xmlns:foo', 'https://example.com/foo');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('foo|*', node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should throw', () => {
        const leaf = {
          name: 'foo|*',
          type: SELECTOR_TYPE
        };
        const node =
          document.createElementNS('https://example.com/foo', 'foo:bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('foo|*', node);
        assert.throws(() => matcher._matchTypeSelector(leaf, node),
          DOMException, 'Undeclared namespace foo');
      });

      it('should not match', () => {
        const leaf = {
          name: 'foo|*',
          type: SELECTOR_TYPE
        };
        const node = document.getElementById('div0');
        node.setAttribute('xmlns:foo', 'https://example.com/foo');
        const matcher = new Matcher('foo|*', node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.isNull(res, 'result');
      });

      it('should throw', () => {
        const leaf = {
          name: 'foo|*',
          type: SELECTOR_TYPE
        };
        const node = document.getElementById('div0');
        const matcher = new Matcher('foo|*', node);
        assert.throws(() => matcher._matchTypeSelector(leaf, node),
          DOMException, 'Undeclared namespace foo');
      });

      it('should get matched node', () => {
        const leaf = {
          name: 'foo|bar',
          type: SELECTOR_TYPE
        };
        const nsroot = document.createElement('div');
        nsroot.setAttribute('xmlns', 'http://www.w3.org/2000/xmlns/');
        nsroot.setAttribute('xmlns:foo', 'https://example.com/foo');
        const node =
          document.createElementNS('https://example.com/foo', 'foo:bar');
        nsroot.appendChild(node);
        const parent = document.getElementById('div0');
        parent.appendChild(nsroot);
        const matcher = new Matcher('foo|bar', node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should not match', () => {
        const leaf = {
          name: 'foo|bar',
          type: SELECTOR_TYPE
        };
        const node =
          document.createElementNS('https://example.com/foo', 'foo:baz');
        node.setAttribute('xmlns:foo', 'https://example.com/foo');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('foo|bar', node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.isNull(res, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: '|div',
          type: SELECTOR_TYPE
        };
        const node = document.createElementNS('', 'div');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('|div', node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should not match', () => {
        const leaf = {
          name: '|div',
          type: SELECTOR_TYPE
        };
        const node = document.getElementById('div0');
        const matcher = new Matcher('|div', node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.isNull(res, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: 'foo',
          type: SELECTOR_TYPE
        };
        const node = document.createElementNS('', 'foo');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('foo', node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: 'h',
          type: SELECTOR_TYPE
        };
        const node = document.createElementNS('urn:ns', 'h');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('h', node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: '*|h',
          type: SELECTOR_TYPE
        };
        const node = document.createElementNS('urn:ns', 'h');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('*|h', node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: '*',
          type: SELECTOR_TYPE
        };
        const node = document.getElementById('div0');
        const matcher = new Matcher('*', node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: '*',
          type: SELECTOR_TYPE
        };
        const node =
          document.createElementNS('https://example.com/foo', 'foo:bar');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('*', node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: 'div',
          type: SELECTOR_TYPE
        };
        const node = document.getElementById('div0');
        const matcher = new Matcher('div', node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: 'div',
          type: SELECTOR_TYPE
        };
        const node =
          document.createElementNS('https://example.com/foo', 'foo:div');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('div', node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: '*|div',
          type: SELECTOR_TYPE
        };
        const node =
          document.createElementNS('https://example.com/foo', 'foo:div');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('*|div', node);
        const res = matcher._matchTypeSelector(leaf, node);
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
          type: SELECTOR_TYPE
        };
        const node = doc.getElementById('foobar');
        const matcher = new Matcher('foo|bar', node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: 'null',
          type: SELECTOR_TYPE
        };
        const node = document.createElement('null');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(null, node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: 'undefined',
          type: SELECTOR_TYPE
        };
        const node = document.createElement('undefined');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(undefined, node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });
    });

    describe('match shadow host pseudo class', () => {
      it('should throw', () => {
        const ast = {
          children: null,
          name: 'foobar',
          type: SELECTOR_PSEUDO_CLASS
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
        };
        window.customElements.define('my-element', MyElement);
        const host = document.getElementById('baz');
        const node = host.shadowRoot;
        const matcher = new Matcher(':foobar div', node);
        assert.throws(() => matcher._matchShadowHostPseudoClass(ast, node),
          DOMException, 'Invalid selector :foobar');
      });

      it('should throw', () => {
        const ast = {
          children: null,
          name: 'host-context',
          type: SELECTOR_PSEUDO_CLASS
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
        };
        window.customElements.define('my-element', MyElement);
        const host = document.getElementById('baz');
        const node = host.shadowRoot;
        const matcher = new Matcher(':host-context div', node);
        assert.throws(() => matcher._matchShadowHostPseudoClass(ast, node),
          DOMException, 'Invalid selector :host-context');
      });

      it('should get matched node', () => {
        const ast = {
          children: null,
          name: 'host',
          type: SELECTOR_PSEUDO_CLASS
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
        };
        window.customElements.define('my-element', MyElement);
        const host = document.getElementById('baz');
        const node = host.shadowRoot;
        const matcher = new Matcher(':host div', node);
        const res = matcher._matchShadowHostPseudoClass(ast, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should throw', () => {
        const ast = {
          children: [
            {
              children: [
                {
                  name: 'baz',
                  type: SELECTOR_ID
                },
                {
                  name: ' ',
                  type: COMBINATOR
                },
                {
                  name: 'foobar',
                  type: SELECTOR_ID
                }
              ],
              type: SELECTOR
            }
          ],
          name: 'host',
          type: SELECTOR_PSEUDO_CLASS
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
        };
        window.customElements.define('my-element', MyElement);
        const host = document.getElementById('baz');
        const node = host.shadowRoot;
        const matcher = new Matcher(':host(#baz #foobar) div', node);
        assert.throws(() => matcher._matchShadowHostPseudoClass(ast, node),
          DOMException, 'Invalid selector :host(#baz #foobar)');
      });

      it('should get matched node', () => {
        const ast = {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: 'baz',
                  type: SELECTOR_ID
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          name: 'host',
          type: SELECTOR_PSEUDO_CLASS
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
        };
        window.customElements.define('my-element', MyElement);
        const host = document.getElementById('baz');
        const node = host.shadowRoot;
        const matcher = new Matcher(':host(#baz) div', node);
        const res = matcher._matchShadowHostPseudoClass(ast, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should not match', () => {
        const ast = {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: 'foobar',
                  type: SELECTOR_ID
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          name: 'host',
          type: SELECTOR_PSEUDO_CLASS
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
        };
        window.customElements.define('my-element', MyElement);
        const host = document.getElementById('baz');
        const node = host.shadowRoot;
        const matcher = new Matcher(':host(#foobar) div', node);
        const res = matcher._matchShadowHostPseudoClass(ast, node);
        assert.isNull(res, 'result');
      });

      it('should throw', () => {
        const ast = {
          children: [
            {
              children: [
                {
                  name: 'baz',
                  type: SELECTOR_ID
                },
                {
                  name: ' ',
                  type: COMBINATOR
                },
                {
                  name: 'foobar',
                  type: SELECTOR_ID
                }
              ],
              type: SELECTOR
            }
          ],
          name: 'host-context',
          type: SELECTOR_PSEUDO_CLASS
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
        };
        window.customElements.define('my-element', MyElement);
        const host = document.getElementById('baz');
        const node = host.shadowRoot;
        const matcher = new Matcher(':host-context(#baz #foobar) div', node);
        assert.throws(() => matcher._matchShadowHostPseudoClass(ast, node),
          DOMException, 'Invalid selector :host-context(#baz #foobar)');
      });

      it('should get matched node', () => {
        const ast = {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: 'baz',
                  type: SELECTOR_ID
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          name: 'host-context',
          type: SELECTOR_PSEUDO_CLASS
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
        };
        window.customElements.define('my-element', MyElement);
        const host = document.getElementById('baz');
        const node = host.shadowRoot;
        const matcher = new Matcher(':host-context(#baz) div', node);
        const res = matcher._matchShadowHostPseudoClass(ast, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const ast = {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: 'baz',
                  type: SELECTOR_ID
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          name: 'host-context',
          type: SELECTOR_PSEUDO_CLASS
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
        };
        window.customElements.define('my-element', MyElement);
        const host = document.getElementById('baz');
        const node = host.shadowRoot;
        const matcher = new Matcher(':host-context(#div0) div', node);
        const res = matcher._matchShadowHostPseudoClass(ast, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should not match', () => {
        const ast = {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: 'foobar',
                  type: SELECTOR_ID
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          name: 'host-context',
          type: SELECTOR_PSEUDO_CLASS
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
        };
        window.customElements.define('my-element', MyElement);
        const host = document.getElementById('baz');
        const node = host.shadowRoot;
        const matcher = new Matcher(':host-context(#foobar) div', node);
        const res = matcher._matchShadowHostPseudoClass(ast, node);
        assert.isNull(res, 'result');
      });
    });

    describe('match selector', () => {
      it('should get matched node(s)', () => {
        const ast = {
          name: 'dt',
          type: SELECTOR_TYPE
        };
        const node = document.getElementById('dt1');
        const matcher = new Matcher('dt', document);
        const res = matcher._matchSelector(ast, node);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const ast = {
          name: 'foo',
          type: SELECTOR_CLASS
        };
        const node = document.getElementById('div5');
        const matcher = new Matcher('.foo', document);
        const res = matcher._matchSelector(ast, node);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
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
          type: SELECTOR_ATTR,
          value: null
        };
        const node = document.getElementById('span3');
        const matcher = new Matcher('[hidden]', document);
        const res = matcher._matchSelector(ast, node);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
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
                      type: SELECTOR_TYPE
                    }
                  ],
                  type: SELECTOR
                }
              ],
              type: SELECTOR_LIST
            }
          ],
          name: 'is',
          type: SELECTOR_PSEUDO_CLASS
        };
        const node = document.getElementById('ul1');
        const matcher = new Matcher(':is(ul)', document);
        const res = matcher._matchSelector(ast, node);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const ast = {
          children: null,
          name: 'before',
          type: SELECTOR_PSEUDO_ELEMENT
        };
        const node = document.documentElement;
        const matcher = new Matcher('::before', document);
        const res = matcher._matchSelector(ast, node);
        assert.strictEqual(res.size, 0, 'size');
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node', () => {
        const ast = {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: 'baz',
                  type: SELECTOR_ID
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          name: 'host',
          type: SELECTOR_PSEUDO_CLASS
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
        };
        window.customElements.define('my-element', MyElement);
        const host = document.getElementById('baz');
        const node = host.shadowRoot;
        const matcher = new Matcher(':host(#baz) div', node);
        const res = matcher._matchSelector(ast, node);
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should not match', () => {
        const ast = {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: 'foobar',
                  type: SELECTOR_ID
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          name: 'host',
          type: SELECTOR_PSEUDO_CLASS
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
        };
        window.customElements.define('my-element', MyElement);
        const host = document.getElementById('baz');
        const node = host.shadowRoot;
        const matcher = new Matcher(':host(#foobar) div', node);
        const res = matcher._matchSelector(ast, node);
        assert.deepEqual([...res], [], 'result');
      });
    });

    describe('match leaves', () => {
      it('should match', () => {
        const leaves = [
          {
            name: 'li1',
            type: SELECTOR_ID
          },
          {
            name: 'li',
            type: SELECTOR_CLASS
          }
        ];
        const node = document.getElementById('li1');
        const matcher = new Matcher('li#li1.li', document);
        const res = matcher._matchLeaves(leaves, node);
        assert.isTrue(res, 'nodes');
      });

      it('should not match', () => {
        const leaves = [
          {
            name: 'li1',
            type: SELECTOR_ID
          },
          {
            name: 'foobar',
            type: SELECTOR_CLASS
          }
        ];
        const node = document.getElementById('li1');
        const matcher = new Matcher('li#li1.foobar', document);
        const res = matcher._matchLeaves(leaves, node);
        assert.isFalse(res, 'nodes');
      });
    });

    describe('find descendant nodes', () => {
      it('should be pended', () => {
        const leaves = [
          {
            name: 'foobar',
            type: SELECTOR_ID
          }
        ];
        const parent = document.createElement('div');
        const node = document.createElement('div');
        node.id = 'foobar';
        parent.appendChild(node);
        const matcher = new Matcher('div #foobar', parent);
        const res = matcher._findDescendantNodes(leaves, parent);
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isTrue(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const leaves = [
          {
            name: 'li3',
            type: SELECTOR_ID
          }
        ];
        const refNode = document.getElementById('ul1');
        const node = document.getElementById('li3');
        const matcher = new Matcher('ul #li3', document);
        const res = matcher._findDescendantNodes(leaves, refNode);
        assert.deepEqual([...res.nodes], [
          node
        ], 'nodes');
        assert.isFalse(res.pending, 'pending');
      });

      it('should not match', () => {
        const leaves = [
          {
            name: 'foobar',
            type: SELECTOR_ID
          }
        ];
        const refNode = document.getElementById('ul1');
        const matcher = new Matcher('ul #foobar', document);
        const res = matcher._findDescendantNodes(leaves, refNode);
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isFalse(res.pending, 'pending');
      });

      it('should not match', () => {
        const leaves = [
          {
            name: 'ul1',
            type: SELECTOR_ID
          }
        ];
        const refNode = document.getElementById('ul1');
        const matcher = new Matcher('div #ul1', document);
        const res = matcher._findDescendantNodes(leaves, refNode);
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const leaves = [
          {
            name: 'li3',
            type: SELECTOR_ID
          },
          {
            name: 'li',
            type: SELECTOR_TYPE
          }
        ];
        const refNode = document.getElementById('ul1');
        const node = document.getElementById('li3');
        const matcher = new Matcher('ul li#li3', document);
        const res = matcher._findDescendantNodes(leaves, refNode);
        assert.deepEqual([...res.nodes], [
          node
        ], 'nodes');
        assert.isFalse(res.pending, 'pending');
      });

      it('should not match', () => {
        const leaves = [
          {
            name: 'li3',
            type: SELECTOR_ID
          },
          {
            name: 'foobar',
            type: SELECTOR_CLASS
          }
        ];
        const refNode = document.getElementById('ul1');
        const matcher = new Matcher('ul #li3.foobar', document);
        const res = matcher._findDescendantNodes(leaves, refNode);
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const leaves = [
          {
            name: 'li',
            type: SELECTOR_CLASS
          }
        ];
        const refNode = document.getElementById('ul1');
        const matcher = new Matcher('ul .li', document);
        const res = matcher._findDescendantNodes(leaves, refNode);
        assert.deepEqual([...res.nodes], [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ], 'nodes');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const leaves = [
          {
            name: 'li',
            type: SELECTOR_CLASS
          },
          {
            children: null,
            name: 'first-child',
            type: SELECTOR_PSEUDO_CLASS
          }
        ];
        const refNode = document.getElementById('ul1');
        const matcher = new Matcher('ul .li:first-child', document);
        const res = matcher._findDescendantNodes(leaves, refNode);
        assert.deepEqual([...res.nodes], [
          document.getElementById('li1')
        ], 'nodes');
        assert.isFalse(res.pending, 'pending');
      });

      it('should not match', () => {
        const leaves = [
          {
            name: 'foobar',
            type: SELECTOR_CLASS
          }
        ];
        const refNode = document.getElementById('ul1');
        const matcher = new Matcher('ul .foobar', document);
        const res = matcher._findDescendantNodes(leaves, refNode);
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isFalse(res.pending, 'pending');
      });

      it('should be pended', () => {
        const leaves = [
          {
            name: 'div',
            type: SELECTOR_TYPE
          }
        ];
        const doc = new DOMParser().parseFromString('<foo></foo>', 'text/xml');
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
        const matcher = new Matcher('root div', root);
        const res = matcher._findDescendantNodes(leaves, root);
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isTrue(res.pending, 'pending');
      });

      it('should be pended', () => {
        const leaves = [
          {
            name: '*|li',
            type: SELECTOR_TYPE
          }
        ];
        const refNode = document.getElementById('ul1');
        const matcher = new Matcher('ul *|li', document);
        const res = matcher._findDescendantNodes(leaves, refNode);
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isTrue(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const leaves = [
          {
            name: 'li',
            type: SELECTOR_TYPE
          }
        ];
        const refNode = document.getElementById('ul1');
        const matcher = new Matcher('ul li', document);
        const res = matcher._findDescendantNodes(leaves, refNode);
        assert.deepEqual([...res.nodes], [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ], 'nodes');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const leaves = [
          {
            name: 'li',
            type: SELECTOR_TYPE
          },
          {
            children: null,
            name: 'first-child',
            type: SELECTOR_PSEUDO_CLASS
          }
        ];
        const refNode = document.getElementById('ul1');
        const matcher = new Matcher('ul li:first-child', document);
        const res = matcher._findDescendantNodes(leaves, refNode);
        assert.deepEqual([...res.nodes], [
          document.getElementById('li1')
        ], 'nodes');
        assert.isFalse(res.pending, 'pending');
      });

      it('should not match', () => {
        const leaves = [
          {
            name: 'ol',
            type: SELECTOR_TYPE
          }
        ];
        const refNode = document.getElementById('div1');
        const matcher = new Matcher('div ol', document);
        const res = matcher._findDescendantNodes(leaves, refNode);
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isFalse(res.pending, 'pending');
      });

      it('should not match', () => {
        const leaves = [
          {
            name: 'before',
            type: SELECTOR_PSEUDO_ELEMENT
          }
        ];
        const refNode = document.getElementById('ul1');
        const matcher = new Matcher('ul ::before', document);
        const res = matcher._findDescendantNodes(leaves, refNode);
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isFalse(res.pending, 'pending');
      });

      it('should be pended', () => {
        const leaves = [
          {
            flags: null,
            matcher: null,
            name: {
              name: 'hidden',
              type: IDENTIFIER
            },
            type: SELECTOR_ATTR,
            value: null
          }
        ];
        const refNode = document.getElementById('dl1');
        const matcher = new Matcher('dl [hidden]', document);
        const res = matcher._findDescendantNodes(leaves, refNode);
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isTrue(res.pending, 'pending');
      });

      it('should be pended', () => {
        const leaves = [
          {
            children: null,
            name: 'first-child',
            type: SELECTOR_PSEUDO_CLASS
          }
        ];
        const refNode = document.getElementById('ul1');
        const matcher = new Matcher('ul :first-child', document);
        const res = matcher._findDescendantNodes(leaves, refNode);
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isTrue(res.pending, 'pending');
      });
    });

    describe('match combinator', () => {
      it('should get matched node(s)', () => {
        const twig = {
          combo: {
            name: '+',
            type: COMBINATOR
          },
          leaves: [
            {
              name: 'li',
              type: SELECTOR_TYPE
            }
          ]
        };
        const node = document.getElementById('li3');
        const matcher = new Matcher('li + li', node);
        const res = matcher._matchCombinator(twig, node);
        assert.deepEqual([...res], [
          document.getElementById('li2')
        ], 'result');
      });

      it('should not match', () => {
        const twig = {
          combo: {
            name: '+',
            type: COMBINATOR
          },
          leaves: [
            {
              name: 'li',
              type: SELECTOR_TYPE
            }
          ]
        };
        const node = document.getElementById('li1');
        const matcher = new Matcher('li + li', node);
        const res = matcher._matchCombinator(twig, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const twig = {
          combo: {
            name: '+',
            type: COMBINATOR
          },
          leaves: [
            {
              name: 'li',
              type: SELECTOR_TYPE
            }
          ]
        };
        const node = document.getElementById('li1');
        const matcher = new Matcher('li + li', node);
        const res = matcher._matchCombinator(twig, node, {
          find: 'next'
        });
        assert.deepEqual([...res], [
          document.getElementById('li2')
        ], 'result');
      });

      it('should not match', () => {
        const twig = {
          combo: {
            name: '+',
            type: COMBINATOR
          },
          leaves: [
            {
              name: 'li',
              type: SELECTOR_TYPE
            }
          ]
        };
        const node = document.getElementById('li3');
        const matcher = new Matcher('li + li', node);
        const res = matcher._matchCombinator(twig, node, {
          find: 'next'
        });
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const twig = {
          combo: {
            name: '~',
            type: COMBINATOR
          },
          leaves: [
            {
              name: 'li',
              type: SELECTOR_TYPE
            }
          ]
        };
        const node = document.getElementById('li3');
        const matcher = new Matcher('li ~ li', node);
        const res = matcher._matchCombinator(twig, node);
        assert.deepEqual([...res], [
          document.getElementById('li1'),
          document.getElementById('li2')
        ], 'result');
      });

      it('should not match', () => {
        const twig = {
          combo: {
            name: '~',
            type: COMBINATOR
          },
          leaves: [
            {
              name: 'li',
              type: SELECTOR_TYPE
            }
          ]
        };
        const node = document.getElementById('li1');
        const matcher = new Matcher('li ~ li', node);
        const res = matcher._matchCombinator(twig, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const twig = {
          combo: {
            name: '~',
            type: COMBINATOR
          },
          leaves: [
            {
              name: 'li',
              type: SELECTOR_TYPE
            }
          ]
        };
        const node = document.getElementById('li1');
        const matcher = new Matcher('li ~ li', node);
        const res = matcher._matchCombinator(twig, node, {
          find: 'next'
        });
        assert.deepEqual([...res], [
          document.getElementById('li2'),
          document.getElementById('li3')
        ], 'result');
      });

      it('should not match', () => {
        const twig = {
          combo: {
            name: '~',
            type: COMBINATOR
          },
          leaves: [
            {
              name: 'li',
              type: SELECTOR_TYPE
            }
          ]
        };
        const node = document.getElementById('li3');
        const matcher = new Matcher('li ~ li', node);
        const res = matcher._matchCombinator(twig, node, {
          find: 'next'
        });
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const twig = {
          combo: {
            name: '>',
            type: COMBINATOR
          },
          leaves: [
            {
              name: 'ul',
              type: SELECTOR_TYPE
            }
          ]
        };
        const node = document.getElementById('li3');
        const matcher = new Matcher('ul > li', node);
        const res = matcher._matchCombinator(twig, node);
        assert.deepEqual([...res], [
          document.getElementById('ul1')
        ], 'result');
      });

      it('should not match', () => {
        const twig = {
          combo: {
            name: '>',
            type: COMBINATOR
          },
          leaves: [
            {
              name: 'ol',
              type: SELECTOR_TYPE
            }
          ]
        };
        const node = document.getElementById('li1');
        const matcher = new Matcher('ol > li', node);
        const res = matcher._matchCombinator(twig, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const twig = {
          combo: {
            name: '>',
            type: COMBINATOR
          },
          leaves: [
            {
              name: 'li',
              type: SELECTOR_CLASS
            }
          ]
        };
        const node = document.getElementById('ul1');
        const matcher = new Matcher('ul > .li', node);
        const res = matcher._matchCombinator(twig, node, {
          find: 'next'
        });
        assert.deepEqual([...res], [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ], 'result');
      });

      it('should not match', () => {
        const twig = {
          combo: {
            name: '>',
            type: COMBINATOR
          },
          leaves: [
            {
              name: 'foobar',
              type: SELECTOR_CLASS
            }
          ]
        };
        const node = document.getElementById('ul1');
        const matcher = new Matcher('ul > .foobar', node);
        const res = matcher._matchCombinator(twig, node, {
          find: 'next'
        });
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const twig = {
          combo: {
            name: ' ',
            type: COMBINATOR
          },
          leaves: [
            {
              name: 'ul',
              type: SELECTOR_TYPE
            }
          ]
        };
        const node = document.getElementById('li3');
        const matcher = new Matcher('ul li', node);
        const res = matcher._matchCombinator(twig, node);
        assert.deepEqual([...res], [
          document.getElementById('ul1')
        ], 'result');
      });

      it('should not match', () => {
        const twig = {
          combo: {
            name: ' ',
            type: COMBINATOR
          },
          leaves: [
            {
              name: 'ol',
              type: SELECTOR_TYPE
            }
          ]
        };
        const node = document.getElementById('li1');
        const matcher = new Matcher('ol li', node);
        const res = matcher._matchCombinator(twig, node);
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const twig = {
          combo: {
            name: ' ',
            type: COMBINATOR
          },
          leaves: [
            {
              name: 'li',
              type: SELECTOR_CLASS
            }
          ]
        };
        const node = document.getElementById('ul1');
        const matcher = new Matcher('ul .li', node);
        const res = matcher._matchCombinator(twig, node, {
          find: 'next'
        });
        assert.deepEqual([...res], [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ], 'result');
      });

      it('should not match', () => {
        const twig = {
          combo: {
            name: ' ',
            type: COMBINATOR
          },
          leaves: [
            {
              name: 'foobar',
              type: SELECTOR_CLASS
            }
          ]
        };
        const node = document.getElementById('li1');
        const matcher = new Matcher('ol .foobar', node);
        const res = matcher._matchCombinator(twig, node, {
          find: 'next'
        });
        assert.deepEqual([...res], [], 'result');
      });

      it('should get matched node(s)', () => {
        const twig = {
          combo: {
            name: ' ',
            type: COMBINATOR
          },
          leaves: [
            {
              name: 'dd2',
              type: SELECTOR_ID
            }
          ]
        };
        const node = document.getElementById('dl1');
        const matcher = new Matcher('dl #dd2 span ', node);
        const res = matcher._matchCombinator(twig, node, {
          find: 'next'
        });
        assert.deepEqual([...res], [
          document.getElementById('dd2')
        ], 'result');
      });

      it('should not match', () => {
        const twig = {
          combo: {
            name: ' ',
            type: COMBINATOR
          },
          leaves: [
            {
              name: 'foobar',
              type: SELECTOR_ID
            }
          ]
        };
        const node = document.getElementById('dl1');
        const matcher = new Matcher('dl #foobar span', node);
        const res = matcher._matchCombinator(twig, node, {
          find: 'next'
        });
        assert.deepEqual([...res], [], 'result');
      });
    });

    describe('find nodes', () => {
      it('should not match', () => {
        const matcher = new Matcher('::before', document);
        const [[{ branch: [twig] }]] = matcher._prepare('::before');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const matcher = new Matcher('#ul1', document);
        const [[{ branch: [twig] }]] = matcher._prepare('#ul1');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [
          document.getElementById('ul1')
        ], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const node = document.getElementById('ul1');
        const matcher = new Matcher('#ul1', node);
        const [[{ branch: [twig] }]] = matcher._prepare('#ul1');
        const res = matcher._findNodes(twig, 'self');
        assert.deepEqual([...res.nodes], [
          node
        ], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should not match', () => {
        const node = document.getElementById('li1');
        const matcher = new Matcher('#ul1', node);
        const [[{ branch: [twig] }]] = matcher._prepare('#ul1');
        const res = matcher._findNodes(twig, 'self');
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node', () => {
        const node = document.getElementById('li1');
        const matcher = new Matcher('#ul1', node);
        const [[{ branch: [twig] }]] = matcher._prepare('#ul1');
        const res = matcher._findNodes(twig, 'lineal');
        assert.deepEqual([...res.nodes], [
          document.getElementById('ul1')
        ], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const matcher = new Matcher('#li1.li', document);
        const [[{ branch: [twig] }]] = matcher._prepare('#li1.li');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [
          document.getElementById('li1')
        ], 'nodes');
        assert.isTrue(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should not match', () => {
        const matcher = new Matcher('#li1.foobar', document);
        const [[{ branch: [twig] }]] = matcher._prepare('#li1.foobar');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [
          document.getElementById('li1')
        ], 'nodes');
        assert.isTrue(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const matcher = new Matcher('ul#ul1', document);
        const [[{ branch: [twig] }]] = matcher._prepare('ul#ul1');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [
          document.getElementById('ul1')
        ], 'nodes');
        assert.isTrue(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should not match', () => {
        const matcher = new Matcher('#foobar', document);
        const [[{ branch: [twig] }]] = matcher._prepare('#foobar');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const frag = document.createDocumentFragment();
        const node = document.createElement('div');
        node.id = 'foobar';
        frag.appendChild(node);
        const matcher = new Matcher('#foobar', frag);
        const [[{ branch: [twig] }]] = matcher._prepare('#foobar');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [
          node
        ], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should be pended', () => {
        const node = document.createElement('div');
        node.id = 'foobar';
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('#foobar', node);
        const [[{ branch: [twig] }]] = matcher._prepare('#foobar');
        const res = matcher._findNodes(twig, 'all');
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isTrue(res.pending, 'pending');
      });

      it('should be pended', () => {
        const parent = document.createElement('div');
        const node = document.createElement('div');
        node.id = 'foobar';
        parent.appendChild(node);
        const matcher = new Matcher('#foobar', node);
        const [[{ branch: [twig] }]] = matcher._prepare('#foobar');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isTrue(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const matcher = new Matcher('#li1:first-child', document);
        const [[{ branch: [twig] }]] = matcher._prepare('#li1:first-child');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [
          document.getElementById('li1')
        ], 'nodes');
        assert.isTrue(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const node = document.getElementById('ul1');
        const matcher = new Matcher('.li', node);
        const [[{ branch: [twig] }]] = matcher._prepare('.li');
        const res = matcher._findNodes(twig, 'first');
        assert.deepEqual([...res.nodes], [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const node = document.getElementById('ul1');
        const matcher = new Matcher('.li', node);
        const [[{ branch: [twig] }]] = matcher._prepare('.li');
        const res = matcher._findNodes(twig, 'all');
        assert.deepEqual([...res.nodes], [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const matcher = new Matcher('.li', document);
        const [[{ branch: [twig] }]] = matcher._prepare('.li');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const frag = document.createDocumentFragment();
        const parent = document.createElement('div');
        parent.classList.add('foo');
        const node = document.createElement('div');
        node.classList.add('foo');
        parent.appendChild(node);
        frag.appendChild(parent);
        const matcher = new Matcher('.foo', frag);
        const [[{ branch: [twig] }]] = matcher._prepare('.foo');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [
          parent, node
        ], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const matcher = new Matcher('li.li', document);
        const [[{ branch: [twig] }]] = matcher._prepare('li.li');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ], 'nodes');
        assert.isTrue(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const node = document.getElementById('dd2');
        const matcher = new Matcher('.dd', node);
        const [[{ branch: [twig] }]] = matcher._prepare('.dd');
        const res = matcher._findNodes(twig, 'self');
        assert.deepEqual([...res.nodes], [
          node
        ], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should not match', () => {
        const node = document.getElementById('span2');
        const matcher = new Matcher('.dd', node);
        const [[{ branch: [twig] }]] = matcher._prepare('.dd');
        const res = matcher._findNodes(twig, 'self');
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const node = document.getElementById('span2');
        const matcher = new Matcher('.dd', node);
        const [[{ branch: [twig] }]] = matcher._prepare('.dd');
        const res = matcher._findNodes(twig, 'lineal');
        assert.deepEqual([...res.nodes], [
          document.getElementById('dd2')
        ], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should not match', () => {
        const node = document.getElementById('span2');
        const matcher = new Matcher('.li', node);
        const [[{ branch: [twig] }]] = matcher._prepare('.li');
        const res = matcher._findNodes(twig, 'lineal');
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const node = document.getElementById('ul1');
        const matcher = new Matcher('ul', node);
        const [[{ branch: [twig] }]] = matcher._prepare('ul');
        const res = matcher._findNodes(twig, 'self');
        assert.deepEqual([...res.nodes], [
          node
        ], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should not match', () => {
        const node = document.getElementById('li1');
        const matcher = new Matcher('ul', node);
        const [[{ branch: [twig] }]] = matcher._prepare('ul');
        const res = matcher._findNodes(twig, 'self');
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const node = document.getElementById('li1');
        const matcher = new Matcher('ul', node);
        const [[{ branch: [twig] }]] = matcher._prepare('ul');
        const res = matcher._findNodes(twig, 'lineal');
        assert.deepEqual([...res.nodes], [
          document.getElementById('ul1')
        ], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should not match', () => {
        const node = document.getElementById('li1');
        const matcher = new Matcher('ol', node);
        const [[{ branch: [twig] }]] = matcher._prepare('ol');
        const res = matcher._findNodes(twig, 'lineal');
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const node = document.getElementById('li1');
        const matcher = new Matcher('li:first-child', node);
        const [[{ branch: [twig] }]] = matcher._prepare('li:first-child');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [
          node
        ], 'nodes');
        assert.isTrue(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const node = document.getElementById('ul1');
        const matcher = new Matcher('li:first-child', node);
        const [[{ branch: [twig] }]] = matcher._prepare('li:first-child');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ], 'nodes');
        assert.isTrue(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should not match', () => {
        const node = document.getElementById('li1');
        const matcher = new Matcher('dd:first-child', node);
        const [[{ branch: [twig] }]] = matcher._prepare('dd:first-child');
        const res = matcher._findNodes(twig, 'self');
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isTrue(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const matcher = new Matcher('li.li:last-child', document);
        const [[{ branch: [twig] }]] = matcher._prepare('li.li:last-child');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ], 'nodes');
        assert.isTrue(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
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
        const matcher = new Matcher('.foo.bar', frag);
        const [[{ branch: [twig] }]] = matcher._prepare('.foo.bar');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [
          parent,
          node
        ], 'nodes');
        assert.isTrue(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should not match', () => {
        const matcher = new Matcher('.foobar', document);
        const [[{ branch: [twig] }]] = matcher._prepare('.foobar');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const frag = document.createDocumentFragment();
        const node = document.createElement('div');
        frag.appendChild(node);
        const matcher = new Matcher('div', frag);
        const [[{ branch: [twig] }]] = matcher._prepare('div');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [
          node
        ], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const parent = document.createElement('div');
        const node = document.createElement('div');
        parent.appendChild(node);
        const matcher = new Matcher('div', parent);
        const [[{ branch: [twig] }]] = matcher._prepare('div');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [
          node
        ], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const parent = document.createElement('div');
        parent.classList.add('foo');
        const node = document.createElement('div');
        node.classList.add('foo');
        parent.appendChild(node);
        const matcher = new Matcher('.foo', node);
        const [[{ branch: [twig] }]] = matcher._prepare('.foo');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [
          node
        ], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should not match', () => {
        const frag = document.createDocumentFragment();
        const node = document.createElement('div');
        frag.appendChild(node);
        const matcher = new Matcher('p', frag);
        const [[{ branch: [twig] }]] = matcher._prepare('p');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const node = document.getElementById('li1');
        const matcher = new Matcher(':first-child', node);
        const [[{ branch: [twig] }]] = matcher._prepare(':first-child');
        const res = matcher._findNodes(twig, 'self');
        assert.deepEqual([...res.nodes], [
          node
        ], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const node = document.getElementById('li1');
        const matcher = new Matcher('[class]:first-child', node);
        const [[{ branch: [twig] }]] = matcher._prepare('[class]:first-child');
        const res = matcher._findNodes(twig, 'self');
        assert.deepEqual([...res.nodes], [
          node
        ], 'nodes');
        assert.isTrue(res.compound, 'compound');
        assert.isFalse(res.pending, 'pending');
      });

      it('should be pended', () => {
        const matcher = new Matcher(':first-child', document);
        const [[{ branch: [twig] }]] = matcher._prepare(':first-child');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isFalse(res.compound, 'compound');
        assert.isTrue(res.pending, 'pending');
      });
    });

    describe('get entry twig', () => {
      it('should get value', () => {
        const branch = [
          {
            leaves: [
              {
                name: 'li',
                type: SELECTOR_TYPE
              }
            ]
          }
        ];
        const matcher = new Matcher('li', document);
        const res = matcher._getEntryTwig(branch);
        assert.deepEqual(res, {
          find: 'prev',
          twig: {
            leaves: [
              {
                name: 'li',
                type: SELECTOR_TYPE
              }
            ]
          }
        }, 'result');
      });

      it('should get value', () => {
        const branch = [
          {
            leaves: [
              {
                name: 'ul',
                type: SELECTOR_TYPE
              }
            ]
          },
          {
            leaves: [
              {
                name: '>',
                type: COMBINATOR
              }
            ]
          },
          {
            leaves: [
              {
                name: 'li',
                type: SELECTOR_TYPE
              }
            ]
          }
        ];
        const matcher = new Matcher('ul > li', document);
        const res = matcher._getEntryTwig(branch);
        assert.deepEqual(res, {
          find: 'next',
          twig: {
            leaves: [
              {
                name: 'ul',
                type: SELECTOR_TYPE
              }
            ]
          }
        }, 'result');
      });

      it('should get value', () => {
        const branch = [
          {
            leaves: [
              {
                name: 'ul',
                type: SELECTOR_TYPE
              }
            ]
          },
          {
            leaves: [
              {
                name: '>',
                type: COMBINATOR
              }
            ]
          },
          {
            leaves: [
              {
                name: 'li',
                type: SELECTOR_TYPE
              }
            ]
          }
        ];
        const matcher = new Matcher('ul > li', document);
        const res = matcher._getEntryTwig(branch, 'first');
        assert.deepEqual(res, {
          find: 'prev',
          twig: {
            leaves: [
              {
                name: 'li',
                type: SELECTOR_TYPE
              }
            ]
          }
        }, 'result');
      });

      it('should get value', () => {
        const branch = [
          {
            leaves: [
              {
                name: 'ul',
                type: SELECTOR_TYPE
              }
            ]
          },
          {
            leaves: [
              {
                name: '>',
                type: COMBINATOR
              }
            ]
          },
          {
            leaves: [
              {
                name: 'li',
                type: SELECTOR_TYPE
              }
            ]
          },
          {
            leaves: [
              {
                name: '+',
                type: COMBINATOR
              }
            ]
          },
          {
            leaves: [
              {
                name: 'li',
                type: SELECTOR_TYPE
              }
            ]
          }
        ];
        const matcher = new Matcher('ul > li + li', document);
        const res = matcher._getEntryTwig(branch, 'first');
        assert.deepEqual(res, {
          find: 'next',
          twig: {
            leaves: [
              {
                name: 'ul',
                type: SELECTOR_TYPE
              }
            ]
          }
        }, 'result');
      });

      it('should get value', () => {
        const branch = [
          {
            leaves: [
              {
                name: 'ul1',
                type: SELECTOR_ID
              }
            ]
          },
          {
            leaves: [
              {
                name: '>',
                type: COMBINATOR
              }
            ]
          },
          {
            leaves: [
              {
                name: 'li1',
                type: SELECTOR_ID
              }
            ]
          }
        ];
        const matcher = new Matcher('#ul1 > #li1', document);
        const res = matcher._getEntryTwig(branch);
        assert.deepEqual(res, {
          find: 'prev',
          twig: {
            leaves: [
              {
                name: 'li1',
                type: SELECTOR_ID
              }
            ]
          }
        }, 'result');
      });

      it('should get value', () => {
        const branch = [
          {
            leaves: [
              {
                name: 'ul1',
                type: SELECTOR_ID
              }
            ]
          },
          {
            leaves: [
              {
                name: '>',
                type: COMBINATOR
              }
            ]
          },
          {
            leaves: [
              {
                name: 'li',
                type: SELECTOR_TYPE
              }
            ]
          }
        ];
        const matcher = new Matcher('#ul1 > li', document);
        const res = matcher._getEntryTwig(branch);
        assert.deepEqual(res, {
          find: 'next',
          twig: {
            leaves: [
              {
                name: 'ul1',
                type: SELECTOR_ID
              }
            ]
          }
        }, 'result');
      });

      it('should get value', () => {
        const branch = [
          {
            leaves: [
              {
                name: 'ul',
                type: SELECTOR_TYPE
              }
            ]
          },
          {
            leaves: [
              {
                name: '>',
                type: COMBINATOR
              }
            ]
          },
          {
            leaves: [
              {
                name: 'li1',
                type: SELECTOR_ID
              }
            ]
          }
        ];
        const matcher = new Matcher('ul > #li1', document);
        const res = matcher._getEntryTwig(branch);
        assert.deepEqual(res, {
          find: 'prev',
          twig: {
            leaves: [
              {
                name: 'li1',
                type: SELECTOR_ID
              }
            ]
          }
        }, 'result');
      });

      it('should get value', () => {
        const branch = [
          {
            leaves: [
              {
                name: 'ul',
                type: SELECTOR_TYPE
              }
            ]
          },
          {
            leaves: [
              {
                name: '>',
                type: COMBINATOR
              }
            ]
          },
          {
            leaves: [
              {
                name: 'after',
                type: SELECTOR_PSEUDO_ELEMENT
              },
              {
                name: 'li',
                type: SELECTOR_CLASS
              }
            ]
          }
        ];
        const matcher = new Matcher('ul > .li::after', document);
        const res = matcher._getEntryTwig(branch);
        assert.deepEqual(res, {
          find: 'prev',
          twig: {
            leaves: [
              {
                name: 'after',
                type: SELECTOR_PSEUDO_ELEMENT
              },
              {
                name: 'li',
                type: SELECTOR_CLASS
              }
            ]
          }
        }, 'result');
      });

      it('should get value', () => {
        const branch = [
          {
            leaves: [
              {
                name: 'after',
                type: SELECTOR_PSEUDO_ELEMENT
              },
              {
                name: 'ul',
                type: SELECTOR_TYPE
              }
            ]
          },
          {
            leaves: [
              {
                name: '>',
                type: COMBINATOR
              }
            ]
          },
          {
            leaves: [
              {
                name: 'li',
                type: SELECTOR_CLASS
              }
            ]
          }
        ];
        const matcher = new Matcher('ul::after > .li', document);
        const res = matcher._getEntryTwig(branch);
        assert.deepEqual(res, {
          find: 'next',
          twig: {
            leaves: [
              {
                name: 'after',
                type: SELECTOR_PSEUDO_ELEMENT
              },
              {
                name: 'ul',
                type: SELECTOR_TYPE
              }
            ]
          }
        }, 'result');
      });
    });

    describe('collect nodes', () => {
      it('should get list and matrix', () => {
        const node = document.getElementById('li1');
        const matcher =
          new Matcher('li:last-child, li:first-child + li', node);
        const res = matcher._collectNodes('self');
        assert.deepEqual(res, [
          [
            {
              branch: [
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'li',
                      type: SELECTOR_TYPE
                    },
                    {
                      children: null,
                      loc: null,
                      name: 'last-child',
                      type: SELECTOR_PSEUDO_CLASS
                    }
                  ]
                }
              ],
              filtered: false,
              find: 'prev',
              skip: false
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
                      type: SELECTOR_TYPE
                    },
                    {
                      children: null,
                      loc: null,
                      name: 'first-child',
                      type: SELECTOR_PSEUDO_CLASS
                    }
                  ]
                },
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'li',
                      type: SELECTOR_TYPE
                    }
                  ]
                }
              ],
              filtered: true,
              find: 'prev',
              skip: false
            }
          ],
          [
            new Set([node]),
            new Set([node])
          ]
        ], 'result');
      });

      it('should get list and matrix', () => {
        const node = document.getElementById('li1');
        const matcher =
          new Matcher('li:last-child, li:first-child + li', node);
        const res = matcher._collectNodes('lineal');
        assert.deepEqual(res, [
          [
            {
              branch: [
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'li',
                      type: SELECTOR_TYPE
                    },
                    {
                      children: null,
                      loc: null,
                      name: 'last-child',
                      type: SELECTOR_PSEUDO_CLASS
                    }
                  ]
                }
              ],
              filtered: false,
              find: 'prev',
              skip: false
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
                      type: SELECTOR_TYPE
                    },
                    {
                      children: null,
                      loc: null,
                      name: 'first-child',
                      type: SELECTOR_PSEUDO_CLASS
                    }
                  ]
                },
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'li',
                      type: SELECTOR_TYPE
                    }
                  ]
                }
              ],
              filtered: true,
              find: 'prev',
              skip: false
            }
          ],
          [
            new Set([node]),
            new Set([node])
          ]
        ], 'result');
      });

      it('should get list and matrix', () => {
        const matcher =
          new Matcher('li:last-child, li:first-child + li', document);
        const res = matcher._collectNodes('first');
        assert.deepEqual(res, [
          [
            {
              branch: [
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'li',
                      type: SELECTOR_TYPE
                    },
                    {
                      children: null,
                      loc: null,
                      name: 'last-child',
                      type: SELECTOR_PSEUDO_CLASS
                    }
                  ]
                }
              ],
              filtered: false,
              find: 'prev',
              skip: false
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
                      type: SELECTOR_TYPE
                    },
                    {
                      children: null,
                      loc: null,
                      name: 'first-child',
                      type: SELECTOR_PSEUDO_CLASS
                    }
                  ]
                },
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'li',
                      type: SELECTOR_TYPE
                    }
                  ]
                }
              ],
              filtered: true,
              find: 'prev',
              skip: false
            }
          ],
          [
            new Set([
              document.getElementById('li1'),
              document.getElementById('li2'),
              document.getElementById('li3')
            ]),
            new Set([
              document.getElementById('li1'),
              document.getElementById('li2'),
              document.getElementById('li3')
            ])
          ]
        ], 'result');
      });

      it('should get list and matrix', () => {
        const matcher =
          new Matcher('li:last-child, li:first-child + li', document);
        const res = matcher._collectNodes('all');
        assert.deepEqual(res, [
          [
            {
              branch: [
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'li',
                      type: SELECTOR_TYPE
                    },
                    {
                      children: null,
                      loc: null,
                      name: 'last-child',
                      type: SELECTOR_PSEUDO_CLASS
                    }
                  ]
                }
              ],
              filtered: false,
              find: 'prev',
              skip: false
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
                      type: SELECTOR_TYPE
                    },
                    {
                      children: null,
                      loc: null,
                      name: 'first-child',
                      type: SELECTOR_PSEUDO_CLASS
                    }
                  ]
                },
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'li',
                      type: SELECTOR_TYPE
                    }
                  ]
                }
              ],
              filtered: false,
              find: 'next',
              skip: false
            }
          ],
          [
            new Set([
              document.getElementById('li1'),
              document.getElementById('li2'),
              document.getElementById('li3')
            ]),
            new Set([
              document.getElementById('li1'),
              document.getElementById('li2'),
              document.getElementById('li3')
            ])
          ]
        ], 'result');
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
        const matcher = new Matcher(':nth-child(2n), :nth-of-type(2n+3)', root);
        const res = matcher._collectNodes('all');
        assert.deepEqual(res, [
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
                      type: SELECTOR_PSEUDO_CLASS
                    }
                  ]
                }
              ],
              filtered: true,
              find: 'prev',
              skip: false
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
                      type: SELECTOR_PSEUDO_CLASS
                    }
                  ]
                }
              ],
              filtered: true,
              find: 'prev',
              skip: false
            }
          ],
          [
            new Set([div2, div4]),
            new Set([div3])
          ]
        ], 'result');
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
        const matcher =
          new Matcher(':nth-child(2n), :nth-of-type(2n+3)', frag);
        const res = matcher._collectNodes('all');
        assert.deepEqual(res, [
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
                      type: SELECTOR_PSEUDO_CLASS
                    }
                  ]
                }
              ],
              filtered: true,
              find: 'prev',
              skip: false
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
                      type: SELECTOR_PSEUDO_CLASS
                    }
                  ]
                }
              ],
              filtered: true,
              find: 'prev',
              skip: false
            }
          ],
          [
            new Set([div2, div4]),
            new Set([div3])
          ]
        ], 'result');
      });

      it('should get list and matrix', () => {
        const doc = new DOMParser().parseFromString('<foo></foo>', 'text/xml');
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
        const matcher = new Matcher('div', div2);
        const res = matcher._collectNodes('self');
        assert.deepEqual(res, [
          [
            {
              branch: [
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'div',
                      type: SELECTOR_TYPE
                    }
                  ]
                }
              ],
              filtered: true,
              find: 'prev',
              skip: false
            }
          ],
          [
            new Set([div2])
          ]
        ], 'result');
      });

      it('should get list and matrix', () => {
        const doc = new DOMParser().parseFromString('<foo></foo>', 'text/xml');
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
        const matcher = new Matcher('root', div2);
        const res = matcher._collectNodes('lineal');
        assert.deepEqual(res, [
          [
            {
              branch: [
                {
                  combo: null,
                  leaves: [
                    {
                      loc: null,
                      name: 'root',
                      type: SELECTOR_TYPE
                    }
                  ]
                }
              ],
              filtered: true,
              find: 'prev',
              skip: false
            }
          ],
          [
            new Set([root])
          ]
        ], 'result');
      });
    });

    describe('sort nodes', () => {
      it('should get matched node(s)', () => {
        const node1 = document.getElementById('li1');
        const node2 = document.getElementById('li2');
        const node3 = document.getElementById('li3');
        const nodes = new Set([node3, node2, node1]);
        const matcher =
          new Matcher('li:last-child, li:first-child + li', document);
        const res = matcher._sortNodes(nodes);
        assert.deepEqual([...res], [
          node1, node2, node3
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const frag = document.createDocumentFragment();
        const node1 = document.createElement('div');
        const node2 = document.createElement('div');
        const node3 = document.createElement('div');
        frag.appendChild(node1);
        frag.appendChild(node2);
        frag.appendChild(node3);
        const nodes = new Set([node2, node3, node1]);
        const matcher = new Matcher('div', frag);
        const res = matcher._sortNodes(nodes);
        assert.deepEqual([...res], [
          node1, node2, node3
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const frag = document.createDocumentFragment();
        const node1 = document.createElement('div');
        const node2 = document.createElement('div');
        const node3 = document.createElement('div');
        frag.appendChild(node1);
        frag.appendChild(node2);
        frag.appendChild(node3);
        const nodes = new Set([node2, node1, node3, node1]);
        const matcher = new Matcher('div', frag);
        const res = matcher._sortNodes(nodes);
        assert.deepEqual([...res], [
          node1, node2, node3
        ], 'result');
      });
    });

    describe('match nodes', () => {
      it('should get matched node(s)', () => {
        const matcher =
          new Matcher('li:last-child, li:first-child + li', document);
        matcher._collectNodes('first');
        const res = matcher._matchNodes('first');
        assert.deepEqual([...res], [
          document.getElementById('li3'),
          document.getElementById('li2')
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const matcher = new Matcher('ol > .li ~ li, ul > .li ~ li', document);
        matcher._collectNodes('first');
        const res = matcher._matchNodes('first');
        assert.deepEqual([...res], [
          document.getElementById('li2')
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const matcher = new Matcher('ol > .li ~ li, ul > .li ~ li', document);
        matcher._collectNodes('all');
        const res = matcher._matchNodes('all');
        assert.deepEqual([...res], [
          document.getElementById('li2'),
          document.getElementById('li3')
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const node = document.getElementById('li2');
        const matcher = new Matcher('li:last-child, li:first-child + li', node);
        matcher._collectNodes('self');
        const res = matcher._matchNodes('self');
        assert.deepEqual([...res], [
          node
        ], 'result');
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
        const matcher = new Matcher('div > p > span', root);
        matcher._collectNodes('all');
        const res = matcher._matchNodes('all');
        assert.deepEqual([...res], [
          span,
          span2
        ], 'result');
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
        const matcher = new Matcher('div > p > span', root);
        matcher._collectNodes('first');
        const res = matcher._matchNodes('first');
        assert.deepEqual([...res], [
          span
        ], 'result');
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
        const matcher = new Matcher('span', root);
        matcher._collectNodes('first');
        const res = matcher._matchNodes('first');
        assert.deepEqual([...res], [
          span
        ], 'result');
      });
    });

    describe('find matched nodes', () => {
      it('should get matched node(s)', () => {
        const matcher =
          new Matcher('li:last-child, li:first-child + li', document);
        const res = matcher._find();
        assert.deepEqual([...res], [
          document.getElementById('li3'),
          document.getElementById('li2')
        ], 'result');
      });

      it('should not match', () => {
        const node = document.getElementById('li1');
        const matcher = new Matcher('li:last-child, li:first-child + li', node);
        const res = matcher._find('self');
        assert.deepEqual([...res], [], 'result');
      });
    });

    describe('matches', () => {
      it('should throw', () => {
        assert.throws(() => new Matcher().matches(), TypeError);
      });

      it('should get true', () => {
        const node = document.createElement(null);
        const res = new Matcher(null, node).matches();
        assert.isTrue(res, 'result');
      });

      it('should get false', () => {
        const node = document.createElement('div');
        const res = new Matcher(null, node).matches();
        assert.isFalse(res, 'result');
      });

      it('should get true', () => {
        const node = document.createElement(undefined);
        const res = new Matcher(undefined, node).matches();
        assert.isTrue(res, 'result');
      });

      it('should get false', () => {
        const node = document.createElement('div');
        const res = new Matcher(undefined, node).matches();
        assert.isFalse(res, 'result');
      });

      it('should throw', () => {
        assert.throws(() => new Matcher('body', document).matches(), TypeError,
          'Unexpected node #document');
      });

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
        assert.throws(() => new Matcher('body', document).closest(), TypeError,
          'Unexpected node #document');
      });

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
        const matcher = new Matcher(':has(:scope)', node);
        const res = matcher.closest();
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
        const res = new Matcher(':nth-child(2n+1 of .noted)', p7).closest();
        assert.deepEqual(res, l7, 'result');
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

      it('should get matched node', () => {
        const refPoint = document.getElementById('dl1');
        const target = document.getElementById('dt1');
        const matcher = new Matcher('body #dt1', refPoint);
        const res = matcher.querySelector();
        assert.deepEqual(res, target, 'result');
      });

      it('should get matched node', () => {
        const target = document.getElementById('li1');
        const matcher = new Matcher('.li', document);
        const res = matcher.querySelector();
        assert.deepEqual(res, target, 'result');
      });

      it('should get matched node', () => {
        const node = document.createElement('div');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const root = node.attachShadow({ mode: 'open' });
        root.innerHTML = '<div></div><div></div>';
        const matcher = new Matcher(':host div', root);
        const res = matcher.querySelector();
        assert.deepEqual(res, root.firstElementChild, 'result');
      });

      it('should get matched node', () => {
        const node = document.createElement('div');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const root = node.attachShadow({ mode: 'open' });
        root.innerHTML = '<div></div><div></div>';
        const matcher = new Matcher(':host div + div', root);
        const res = matcher.querySelector();
        assert.deepEqual(res, root.lastElementChild, 'result');
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

      it('should get matched node(s)', () => {
        const refPoint = document.getElementById('dl1');
        const target = document.getElementById('dt1');
        const matcher = new Matcher('body #dt1', refPoint);
        const res = matcher.querySelectorAll();
        assert.deepEqual(res, [target], 'result');
      });

      it('should get matched node(s)', () => {
        const matcher = new Matcher('.li', document);
        const res = matcher.querySelectorAll();
        assert.deepEqual(res, [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ], 'result');
      });

      it('should not match', () => {
        const matcher = new Matcher('ul.li + .li', document);
        const res = matcher.querySelectorAll();
        assert.deepEqual(res, [], 'result');
      });

      it('should not match', () => {
        const matcher = new Matcher('::slotted(foo)', document);
        const res = matcher.querySelectorAll();
        assert.deepEqual(res, [], 'result');
      });

      it('should not match', () => {
        const matcher = new Matcher('::slotted(foo', document);
        const res = matcher.querySelectorAll();
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
        const matcher = new Matcher(':nth-child(n of .div)', root);
        const res = matcher.querySelectorAll();
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
        const matcher = new Matcher(':host div', root);
        const res = matcher.querySelectorAll();
        assert.deepEqual(res, [
          root.firstElementChild,
          root.lastElementChild
        ], 'result');
      });
    });
  });
});
