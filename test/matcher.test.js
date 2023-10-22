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
  AN_PLUS_B, ATTRIBUTE_SELECTOR, CLASS_SELECTOR, COMBINATOR, IDENTIFIER,
  ID_SELECTOR, NOT_SUPPORTED_ERR, NTH, PSEUDO_CLASS_SELECTOR,
  PSEUDO_ELEMENT_SELECTOR, RAW, SELECTOR, SELECTOR_LIST, STRING, TYPE_SELECTOR
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
        'Unexpected node type: undefined');
    });

    it('should throw', () => {
      const text = document.createTextNode('foo');
      assert.throws(() => new Matcher('*', text), TypeError,
        'Unexpected node type: #text');
    });

    it('should throw', () => {
      assert.throws(() => new Matcher('#ul1 ++ #li1', document),
        DOMException);
    });

    it('should throw', () => {
      assert.throws(() => new Matcher('[foo==bar]', document), DOMException);
    });

    // FIXME: CSSTree throws
    it('should throw', () => {
      assert.throws(() => new Matcher(':lang("")', document), DOMException);
    });

    // FIXME: CSSTree throws
    it('should throw', () => {
      assert.throws(() => new Matcher(':lang("*")', document), DOMException);
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
          root: document
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
          root: document
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
          root: document
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
          root: doc
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
          root: doc
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
          root: doc
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
          root: frag
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
          root: frag
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
          root: frag
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
          root: parent
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
          root: parent
        }, 'result');
      });
    });

    describe('sort AST leaves', () => {
      it('should get sorted leaves', () => {
        const leaves = [
          { type: ATTRIBUTE_SELECTOR },
          { type: CLASS_SELECTOR, name: 'bar' },
          { type: ID_SELECTOR },
          { type: PSEUDO_CLASS_SELECTOR },
          { type: CLASS_SELECTOR, name: 'foo' },
          { type: PSEUDO_ELEMENT_SELECTOR },
          { type: TYPE_SELECTOR }
        ];
        const matcher = new Matcher('*', document);
        const res = matcher._sortLeaves(leaves);
        assert.deepEqual(res, [
          { type: PSEUDO_ELEMENT_SELECTOR },
          { type: ID_SELECTOR },
          { type: CLASS_SELECTOR, name: 'bar' },
          { type: CLASS_SELECTOR, name: 'foo' },
          { type: TYPE_SELECTOR },
          { type: ATTRIBUTE_SELECTOR },
          { type: PSEUDO_CLASS_SELECTOR }
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
                      type: TYPE_SELECTOR
                    },
                    {
                      children: null,
                      loc: null,
                      name: 'last-child',
                      type: PSEUDO_CLASS_SELECTOR
                    }
                  ]
                }
              ],
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
                      type: TYPE_SELECTOR
                    },
                    {
                      children: null,
                      loc: null,
                      name: 'first-child',
                      type: PSEUDO_CLASS_SELECTOR
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

    describe('match directionality pseudo-class', () => {
      it('should not match', () => {
        const leaf = {
          name: 'ltr',
          type: IDENTIFIER
        };
        const node = document.createElement('bdo');
        node.setAttribute('dir', 'ltr');
        const matcher = new Matcher(':dir(ltr)', node);
        const res = matcher._matchDirectionPseudoClass(leaf, node);
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
        const matcher = new Matcher(':dir(ltr)', node);
        assert.throws(() => matcher._matchDirectionPseudoClass(leaf, node),
          DOMException);
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
        const matcher = new Matcher(':dir(ltr)', node);
        assert.throws(() => matcher._matchDirectionPseudoClass(leaf, node),
          DOMException);
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
        const matcher = new Matcher(':dir(ltr)', node);
        assert.throws(() => matcher._matchDirectionPseudoClass(leaf, node),
          DOMException);
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
        const matcher = new Matcher(':dir(ltr)', node);
        assert.throws(() => matcher._matchDirectionPseudoClass(leaf, node),
          DOMException);
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
        const matcher = new Matcher(':dir(ltr)', node);
        assert.throws(() => matcher._matchDirectionPseudoClass(leaf, node),
          DOMException);
      });

      it('should throw', () => {
        const leaf = {
          name: 'ltr',
          type: IDENTIFIER
        };
        const node = document.createElement('bdi');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher(':dir(ltr)', node);
        assert.throws(() => matcher._matchDirectionPseudoClass(leaf, node),
          DOMException);
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
        const matcher = new Matcher(':dir(ltr)', node);
        assert.throws(() => matcher._matchDirectionPseudoClass(leaf, node),
          DOMException);
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
      it('should get matched node', () => {
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
        // new Matcher(':lang("*")', node) throws
        const matcher = new Matcher(':lang(en)', node);
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
        // new Matcher(':lang("*")', node) throws
        const matcher = new Matcher(':lang(en)', node);
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
          type: TYPE_SELECTOR
        }];
        const res = matcher._matchHasPseudoFunc(leaves, node);
        assert.isFalse(res, 'result');
      });

      it('should match', () => {
        const node = document.getElementById('dl1');
        const matcher = new Matcher(':has(dd)', node);
        const leaves = [{
          name: 'dd',
          type: TYPE_SELECTOR
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
            type: TYPE_SELECTOR
          },
          {
            name: ' ',
            type: COMBINATOR
          },
          {
            name: 'p',
            type: TYPE_SELECTOR
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
            type: TYPE_SELECTOR
          },
          {
            name: ' ',
            type: COMBINATOR
          },
          {
            name: 'span',
            type: TYPE_SELECTOR
          }
        ];
        const res = matcher._matchHasPseudoFunc(leaves, node);
        assert.isTrue(res, 'result');
      });
    });

    describe('match logical pseudo-class function', () => {
      it('should get matched node', () => {
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
        };
        const node = document.getElementById('ul1');
        const matcher = new Matcher(':has(> li)', node);
        const res = matcher._matchLogicalPseudoFunc(leaf, node);
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
                      name: '>',
                      type: COMBINATOR
                    },
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
        };
        const node = document.getElementById('dl1');
        const matcher = new Matcher(':has(> li)', node);
        const res = matcher._matchLogicalPseudoFunc(leaf, node);
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
        };
        const node = document.getElementById('ul1');
        const matcher = new Matcher(':has(li)', node);
        const res = matcher._matchLogicalPseudoFunc(leaf, node);
        assert.deepEqual(res, node, 'result');
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
                      name: 'dd',
                      type: TYPE_SELECTOR
                    },
                    {
                      loc: null,
                      name: '>',
                      type: COMBINATOR
                    },
                    {
                      loc: null,
                      name: 'span',
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
        const node = document.getElementById('dl1');
        const matcher = new Matcher(':has(dd > span)', node);
        const res = matcher._matchLogicalPseudoFunc(leaf, node);
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
        const node = document.getElementById('ul1');
        const matcher = new Matcher(':has(:has(li))', node);
        const res = matcher._matchLogicalPseudoFunc(leaf, node);
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
        const matcher = new Matcher(':not(ol, dl)', node);
        const res = matcher._matchLogicalPseudoFunc(leaf, node);
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
        const matcher = new Matcher(':not(ul, dl)', node);
        const res = matcher._matchLogicalPseudoFunc(leaf, node);
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
                                  name: 'ol',
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
        const matcher = new Matcher(':not(ul, :not(ol))', node);
        const res = matcher._matchLogicalPseudoFunc(leaf, node);
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
        const matcher = new Matcher(':is(ul, dl)', node);
        const res = matcher._matchLogicalPseudoFunc(leaf, node);
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
        const matcher = new Matcher(':is(ol, dl)', node);
        const res = matcher._matchLogicalPseudoFunc(leaf, node);
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
        const matcher = new Matcher(':where(ul, dl)', node);
        const res = matcher._matchLogicalPseudoFunc(leaf, node);
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
        const matcher = new Matcher(':where(ol, dl)', node);
        const res = matcher._matchLogicalPseudoFunc(leaf, node);
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
        const matcher = new Matcher(':not(:is(li, dd))', node);
        const res = matcher._matchLogicalPseudoFunc(leaf, node);
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
        const matcher = new Matcher(':current(foo)', node);
        assert.throws(() => matcher._matchPseudoClassSelector(leaf, node),
          DOMException);
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
        const matcher = new Matcher(':foobar(foo)', node);
        assert.throws(() => matcher._matchPseudoClassSelector(leaf, node),
          DOMException);
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
        const matcher = new Matcher(':disabled', node1);
        const res = matcher._matchPseudoClassSelector(leaf, node1);
        assert.deepEqual([...res], [], 'result');
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
        const matcher = new Matcher(':indeterminate', node1);
        const res = matcher._matchPseudoClassSelector(leaf, node1);
        assert.deepEqual([...res], [], 'result');
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
        const matcher = new Matcher(':default', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
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
          type: PSEUDO_CLASS_SELECTOR
        };
        const node = document.createElement('input');
        node.setAttribute('type', 'redio');
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
          type: PSEUDO_CLASS_SELECTOR
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
        const matcher = new Matcher(':default', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
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
        const matcher = new Matcher(':default', node);
        assert.throws(() => matcher._matchPseudoClassSelector(leaf, node),
          DOMException);
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
        const matcher = new Matcher(':valid', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
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
          type: PSEUDO_CLASS_SELECTOR
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
        const matcher = new Matcher(':invalid', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.isFalse(node.checkValidity(), 'validity');
        assert.deepEqual([...res], [
          node
        ], 'result');
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
        const matcher = new Matcher(':invalid', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.isTrue(node.checkValidity(), 'validity');
        assert.deepEqual([...res], [], 'result');
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
        const matcher = new Matcher(':invalid', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
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
        const matcher = new Matcher(':in-range', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
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
        const matcher = new Matcher(':in-range', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
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
        const matcher = new Matcher(':in-range', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
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
        const matcher = new Matcher(':in-range', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
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
        const matcher = new Matcher(':in-range', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
        const matcher = new Matcher(':last-child', node);
        const res = matcher._matchPseudoClassSelector(leaf, node);
        assert.deepEqual([...res], [], 'result');
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
          type: PSEUDO_CLASS_SELECTOR
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
          type: PSEUDO_CLASS_SELECTOR
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
          name: 'first-of-type',
          type: PSEUDO_CLASS_SELECTOR
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
          name: 'last-of-type',
          type: PSEUDO_CLASS_SELECTOR
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
          name: 'only-of-type',
          type: PSEUDO_CLASS_SELECTOR
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

      // legacy pseudo-element
      it('should throw', () => {
        const leaf = {
          children: null,
          name: 'after',
          type: PSEUDO_CLASS_SELECTOR
        };
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher(':after', node);
        assert.throws(() => matcher._matchPseudoClassSelector(leaf, node),
          DOMException);
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
        const matcher = new Matcher(':active', node);
        assert.throws(() => matcher._matchPseudoClassSelector(leaf, node),
          DOMException);
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
        const matcher = new Matcher(':foo', node);
        assert.throws(() => matcher._matchPseudoClassSelector(leaf, node),
          DOMException);
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
        const matcher = new Matcher('[foo=bar baz]', node);
        assert.throws(() => matcher._matchAttributeSelector(leaf, node),
          DOMException);
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
          type: ATTRIBUTE_SELECTOR,
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
          type: ATTRIBUTE_SELECTOR,
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
          type: ATTRIBUTE_SELECTOR,
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
          type: ATTRIBUTE_SELECTOR,
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
          type: ATTRIBUTE_SELECTOR,
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
          type: ATTRIBUTE_SELECTOR,
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
          type: ATTRIBUTE_SELECTOR,
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
          type: ATTRIBUTE_SELECTOR,
          value: null
        };
        const node = document.createElement('div');
        node.setAttributeNS('https://example.com/baz', 'baz:foo', 'qux');
        const parent = document.getElementById('div0');
        parent.appendChild(node);
        const matcher = new Matcher('[baz|foo]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
        const matcher = new Matcher('[Baz|Foo s]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: ATTRIBUTE_SELECTOR,
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
          type: ATTRIBUTE_SELECTOR,
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
          type: ATTRIBUTE_SELECTOR,
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
          type: ATTRIBUTE_SELECTOR,
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
          type: ATTRIBUTE_SELECTOR,
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
          type: ATTRIBUTE_SELECTOR,
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
          type: ATTRIBUTE_SELECTOR,
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
        const matcher = new Matcher('[baz|foo=qux]', node);
        const res = matcher._matchAttributeSelector(leaf, node);
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
          type: ATTRIBUTE_SELECTOR,
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
          type: ATTRIBUTE_SELECTOR,
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
          type: ATTRIBUTE_SELECTOR,
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
          type: CLASS_SELECTOR
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
          type: CLASS_SELECTOR
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
          type: ID_SELECTOR
        };
        const node = document.getElementById('div0');
        const matcher = new Matcher('#div0', node);
        const res = matcher._matchIDSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should not match', () => {
        const leaf = {
          name: 'foo',
          type: ID_SELECTOR
        };
        const node = document.getElementById('div0');
        const matcher = new Matcher('#foo', node);
        const res = matcher._matchIDSelector(leaf, node);
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
        const matcher = new Matcher('#foo\\ bar', node);
        const res = matcher._matchIDSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });
    });

    describe('match pseudo-element selector', () => {
      it('should throw', () => {
        const leaf = {
          children: null,
          name: 'after',
          type: PSEUDO_ELEMENT_SELECTOR
        };
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher('::after', node);
        assert.throws(() => matcher._matchPseudoElementSelector(leaf, node),
          DOMException);
      });

      it('should throw', () => {
        const leaf = {
          children: null,
          name: 'foo',
          type: PSEUDO_ELEMENT_SELECTOR
        };
        const node = document.createElement('div');
        document.getElementById('div0').appendChild(node);
        const matcher = new Matcher('::foo', node);
        assert.throws(() => matcher._matchPseudoElementSelector(leaf, node),
          DOMException);
      });
    });

    describe('match type selector', () => {
      it('should get matched node(s)', () => {
        const leaf = {
          name: '|*',
          type: TYPE_SELECTOR
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
          type: TYPE_SELECTOR
        };
        const node = document.getElementById('div0');
        const matcher = new Matcher('|*', node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.isNull(res, 'result');
      });

      it('should not match', () => {
        const leaf = {
          name: '|*',
          type: TYPE_SELECTOR
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
          type: TYPE_SELECTOR
        };
        const node = document.getElementById('div0');
        const matcher = new Matcher('*|*', node);
        const res = matcher._matchTypeSelector(leaf, node);
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
        const matcher = new Matcher('*|*', node);
        const res = matcher._matchTypeSelector(leaf, node);
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
        const matcher = new Matcher('foo|*', node);
        assert.throws(() => matcher._matchTypeSelector(leaf, node),
          DOMException);
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
        const matcher = new Matcher('foo|*', node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should not match', () => {
        const leaf = {
          name: 'foo|*',
          type: TYPE_SELECTOR
        };
        const node = document.getElementById('div0');
        node.setAttribute('xmlns:foo', 'https://example.com/foo');
        const matcher = new Matcher('foo|*', node);
        const res = matcher._matchTypeSelector(leaf, node);
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
        const matcher = new Matcher('foo|bar', node);
        const res = matcher._matchTypeSelector(leaf, node);
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
        const matcher = new Matcher('foo|bar', node);
        const res = matcher._matchTypeSelector(leaf, node);
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
        const matcher = new Matcher('|div', node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should not match', () => {
        const leaf = {
          name: '|div',
          type: TYPE_SELECTOR
        };
        const node = document.getElementById('div0');
        const matcher = new Matcher('|div', node);
        const res = matcher._matchTypeSelector(leaf, node);
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
        const matcher = new Matcher('foo', node);
        const res = matcher._matchTypeSelector(leaf, node);
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
        const matcher = new Matcher('h', node);
        const res = matcher._matchTypeSelector(leaf, node);
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
        const matcher = new Matcher('*|h', node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: '*',
          type: TYPE_SELECTOR
        };
        const node = document.getElementById('div0');
        const matcher = new Matcher('*', node);
        const res = matcher._matchTypeSelector(leaf, node);
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
        const matcher = new Matcher('*', node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });

      it('should get matched node', () => {
        const leaf = {
          name: 'div',
          type: TYPE_SELECTOR
        };
        const node = document.getElementById('div0');
        const matcher = new Matcher('div', node);
        const res = matcher._matchTypeSelector(leaf, node);
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
        const matcher = new Matcher('div', node);
        const res = matcher._matchTypeSelector(leaf, node);
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
          type: TYPE_SELECTOR
        };
        const node = doc.getElementById('foobar');
        const matcher = new Matcher('foo|bar', node);
        const res = matcher._matchTypeSelector(leaf, node);
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
        const matcher = new Matcher(null, node);
        const res = matcher._matchTypeSelector(leaf, node);
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
        const matcher = new Matcher(undefined, node);
        const res = matcher._matchTypeSelector(leaf, node);
        assert.deepEqual(res, node, 'result');
      });
    });

    describe('match selector', () => {
      it('should get matched node(s)', () => {
        const ast = {
          name: 'dt',
          type: TYPE_SELECTOR
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
          type: CLASS_SELECTOR
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
          type: ATTRIBUTE_SELECTOR,
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
        const res = matcher._matchSelector(ast, node);
        assert.strictEqual(res.size, 1, 'size');
        assert.deepEqual([...res], [
          node
        ], 'result');
      });

      it('should throw', () => {
        const ast = {
          children: null,
          name: 'before',
          type: PSEUDO_ELEMENT_SELECTOR
        };
        const node = document.documentElement;
        const matcher = new Matcher('::before', document);
        assert.throws(() => matcher._matchSelector(ast, node),
          DOMException);
      });
    });

    describe('match leaves', () => {
      it('should match', () => {
        const leaves = [
          {
            name: 'li1',
            type: ID_SELECTOR
          },
          {
            name: 'li',
            type: CLASS_SELECTOR
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
            type: ID_SELECTOR
          },
          {
            name: 'foobar',
            type: CLASS_SELECTOR
          }
        ];
        const node = document.getElementById('li1');
        const matcher = new Matcher('li#li1.foobar', document);
        const res = matcher._matchLeaves(leaves, node);
        assert.isFalse(res, 'nodes');
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
              type: TYPE_SELECTOR
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
              type: TYPE_SELECTOR
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
              type: TYPE_SELECTOR
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
              type: TYPE_SELECTOR
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
              type: TYPE_SELECTOR
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
              type: TYPE_SELECTOR
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
              type: TYPE_SELECTOR
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
              type: TYPE_SELECTOR
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
              type: TYPE_SELECTOR
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
              type: TYPE_SELECTOR
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
              type: CLASS_SELECTOR
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
              type: CLASS_SELECTOR
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
              type: TYPE_SELECTOR
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
              type: TYPE_SELECTOR
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
              type: CLASS_SELECTOR
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
              type: CLASS_SELECTOR
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
    });

    describe('find nodes', () => {
      it('should not match', () => {
        const matcher = new Matcher('::before', document);
        const [[{ branch: [twig] }]] = matcher._prepare('::before');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const matcher = new Matcher('#ul1', document);
        const [[{ branch: [twig] }]] = matcher._prepare('#ul1');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [
          document.getElementById('ul1')
        ], 'nodes');
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
        assert.isFalse(res.pending, 'pending');
      });

      it('should not match', () => {
        const node = document.getElementById('li1');
        const matcher = new Matcher('#ul1', node);
        const [[{ branch: [twig] }]] = matcher._prepare('#ul1');
        const res = matcher._findNodes(twig, 'self');
        assert.deepEqual([...res.nodes], [], 'nodes');
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
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const matcher = new Matcher('#li1.li', document);
        const [[{ branch: [twig] }]] = matcher._prepare('#li1.li');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [
          document.getElementById('li1')
        ], 'nodes');
        assert.isFalse(res.pending, 'pending');
      });

      it('should not match', () => {
        const matcher = new Matcher('#li1.foobar', document);
        const [[{ branch: [twig] }]] = matcher._prepare('#li1.foobar');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const matcher = new Matcher('ul#ul1', document);
        const [[{ branch: [twig] }]] = matcher._prepare('ul#ul1');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [
          document.getElementById('ul1')
        ], 'nodes');
        assert.isFalse(res.pending, 'pending');
      });

      it('should not match', () => {
        const matcher = new Matcher('#foobar', document);
        const [[{ branch: [twig] }]] = matcher._prepare('#foobar');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [], 'nodes');
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
        assert.isFalse(res.pending, 'pending');
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
        assert.isTrue(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const matcher = new Matcher('#li1:first-child', document);
        const [[{ branch: [twig] }]] = matcher._prepare('#li1:first-child');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [
          document.getElementById('li1')
        ], 'nodes');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const node = document.getElementById('li1');
        const matcher = new Matcher('.li', node);
        const [[{ branch: [twig] }]] = matcher._prepare('.li');
        const res = matcher._findNodes(twig, 'first');
        assert.deepEqual([...res.nodes], [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ], 'nodes');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const node = document.getElementById('li1');
        const matcher = new Matcher('.li', node);
        const [[{ branch: [twig] }]] = matcher._prepare('.li');
        const res = matcher._findNodes(twig, 'all');
        assert.deepEqual([...res.nodes], [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ], 'nodes');
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
        assert.isFalse(res.pending, 'pending');
      });

      it('should not match', () => {
        const node = document.getElementById('span2');
        const matcher = new Matcher('.dd', node);
        const [[{ branch: [twig] }]] = matcher._prepare('.dd');
        const res = matcher._findNodes(twig, 'self');
        assert.deepEqual([...res.nodes], [], 'nodes');
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
        assert.isFalse(res.pending, 'pending');
      });

      it('should not match', () => {
        const node = document.getElementById('span2');
        const matcher = new Matcher('.li', node);
        const [[{ branch: [twig] }]] = matcher._prepare('.li');
        const res = matcher._findNodes(twig, 'lineal');
        assert.deepEqual([...res.nodes], [], 'nodes');
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
        assert.isFalse(res.pending, 'pending');
      });

      it('should not match', () => {
        const node = document.getElementById('li1');
        const matcher = new Matcher('ul', node);
        const [[{ branch: [twig] }]] = matcher._prepare('ul');
        const res = matcher._findNodes(twig, 'self');
        assert.deepEqual([...res.nodes], [], 'nodes');
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
        assert.isFalse(res.pending, 'pending');
      });

      it('should not match', () => {
        const node = document.getElementById('li1');
        const matcher = new Matcher('ol', node);
        const [[{ branch: [twig] }]] = matcher._prepare('ol');
        const res = matcher._findNodes(twig, 'lineal');
        assert.deepEqual([...res.nodes], [], 'nodes');
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
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const node = document.getElementById('ul1');
        const matcher = new Matcher('li:first-child', node);
        const [[{ branch: [twig] }]] = matcher._prepare('li:first-child');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [
          document.getElementById('li1')
        ], 'nodes');
        assert.isFalse(res.pending, 'pending');
      });

      it('should not match', () => {
        const node = document.getElementById('li1');
        const matcher = new Matcher('dd:first-child', node);
        const [[{ branch: [twig] }]] = matcher._prepare('dd:first-child');
        const res = matcher._findNodes(twig, 'self');
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isFalse(res.pending, 'pending');
      });

      it('should get matched node(s)', () => {
        const matcher = new Matcher('li.li:last-child', document);
        const [[{ branch: [twig] }]] = matcher._prepare('li.li:last-child');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [
          document.getElementById('li3')
        ], 'nodes');
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
          parent
        ], 'nodes');
        assert.isFalse(res.pending, 'pending');
      });

      it('should not match', () => {
        const matcher = new Matcher('.foobar', document);
        const [[{ branch: [twig] }]] = matcher._prepare('.foobar');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [], 'nodes');
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
          parent, node
        ], 'nodes');
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
          parent, node
        ], 'nodes');
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
        assert.isFalse(res.pending, 'pending');
      });

      it('should be pended', () => {
        const matcher = new Matcher(':first-child', document);
        const [[{ branch: [twig] }]] = matcher._prepare(':first-child');
        const res = matcher._findNodes(twig);
        assert.deepEqual([...res.nodes], [], 'nodes');
        assert.isTrue(res.pending, 'pending');
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
                      type: TYPE_SELECTOR
                    },
                    {
                      children: null,
                      loc: null,
                      name: 'last-child',
                      type: PSEUDO_CLASS_SELECTOR
                    }
                  ]
                }
              ],
              skip: true
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
                      type: PSEUDO_CLASS_SELECTOR
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
              skip: false
            }
          ],
          [
            new Set(),
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
                      type: TYPE_SELECTOR
                    },
                    {
                      children: null,
                      loc: null,
                      name: 'last-child',
                      type: PSEUDO_CLASS_SELECTOR
                    }
                  ]
                }
              ],
              skip: true
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
                      type: PSEUDO_CLASS_SELECTOR
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
              skip: false
            }
          ],
          [
            new Set(),
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
                      type: TYPE_SELECTOR
                    },
                    {
                      children: null,
                      loc: null,
                      name: 'last-child',
                      type: PSEUDO_CLASS_SELECTOR
                    }
                  ]
                }
              ],
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
                      type: TYPE_SELECTOR
                    },
                    {
                      children: null,
                      loc: null,
                      name: 'first-child',
                      type: PSEUDO_CLASS_SELECTOR
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
              skip: false
            }
          ],
          [
            new Set([document.getElementById('li3')]),
            new Set([document.getElementById('li1')])
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
                      type: TYPE_SELECTOR
                    },
                    {
                      children: null,
                      loc: null,
                      name: 'last-child',
                      type: PSEUDO_CLASS_SELECTOR
                    }
                  ]
                }
              ],
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
                      type: TYPE_SELECTOR
                    },
                    {
                      children: null,
                      loc: null,
                      name: 'first-child',
                      type: PSEUDO_CLASS_SELECTOR
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
              skip: false
            }
          ],
          [
            new Set([document.getElementById('li3')]),
            new Set([document.getElementById('li1')])
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
                      type: PSEUDO_CLASS_SELECTOR
                    }
                  ]
                }
              ],
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
                      type: PSEUDO_CLASS_SELECTOR
                    }
                  ]
                }
              ],
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
                      type: PSEUDO_CLASS_SELECTOR
                    }
                  ]
                }
              ],
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
                      type: PSEUDO_CLASS_SELECTOR
                    }
                  ]
                }
              ],
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
                      type: TYPE_SELECTOR
                    }
                  ]
                }
              ],
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
                      type: TYPE_SELECTOR
                    }
                  ]
                }
              ],
              skip: false
            }
          ],
          [
            new Set([root])
          ]
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
          'Unexpected node type: #document');
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
          'Unexpected node type: #document');
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

      it('should not match', () => {
        const node = document.getElementById('li2');
        const matcher = new Matcher(':has(:scope)', node);
        const res = matcher.closest();
        assert.isNull(res, 'result');
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
    });
  });
});
