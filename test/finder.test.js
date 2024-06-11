/**
 * finder.test.js
 */

/* api */
import { assert } from 'chai';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, it, xit } from 'mocha';
import sinon from 'sinon';

/* test */
import { Finder } from '../src/js/finder.js';

/* constants */
import {
  AN_PLUS_B, COMBINATOR, EMPTY, IDENTIFIER, NOT_SUPPORTED_ERR, NTH, RAW,
  SELECTOR, SELECTOR_ATTR, SELECTOR_CLASS, SELECTOR_ID, SELECTOR_LIST,
  SELECTOR_PSEUDO_CLASS, SELECTOR_PSEUDO_ELEMENT, SELECTOR_TYPE, SYNTAX_ERR
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
    window = null;
    document = null;
  });

  describe('Finder', () => {
    it('should be instance of Finder', () => {
      const finder = new Finder(window);
      assert.instanceOf(finder, Finder, 'result');
    });

    it('should be instance of Finder', () => {
      const finder = new Finder(window, document);
      assert.instanceOf(finder, Finder, 'result');
    });
  });

  describe('handle error', () => {
    it('should not throw', () => {
      const err = new DOMException('error', SYNTAX_ERR);
      const finder = new Finder(window);
      finder._setup('*', document, {
        noexcept: true
      });
      assert.doesNotThrow(() => finder._onError(err));
    });

    it('should throw', () => {
      const err = new TypeError('error');
      const finder = new Finder(window);
      assert.throws(() => finder._onError(err), TypeError, 'error');
    });

    it('should throw', () => {
      try {
        const err = new DOMException('error', SYNTAX_ERR);
        const finder = new Finder(window);
        finder._setup('*', document);
        finder._onError(err);
      } catch (e) {
        assert.instanceOf(e, window.DOMException, 'error');
        assert.strictEqual(e.message, 'error', 'message');
      }
    });

    it('should not throw', () => {
      const err = new window.DOMException('error', NOT_SUPPORTED_ERR);
      const finder = new Finder(window);
      finder._setup('*', document);
      const res = finder._onError(err);
      assert.isUndefined(res, 'result');
    });

    it('should warn', () => {
      const stubWarn = sinon.stub(console, 'warn');
      const err = new window.DOMException('error', NOT_SUPPORTED_ERR);
      const finder = new Finder(window);
      finder._setup('*', document, {
        warn: true
      });
      const res = finder._onError(err);
      const { called } = stubWarn;
      stubWarn.restore();
      assert.isTrue(called, 'called');
      assert.isUndefined(res, 'result');
    });
  });

  describe('setup finder', () => {
    it('should get value', () => {
      const finder = new Finder(window);
      const res = finder._setup('*', document, {
        warn: true
      });
      assert.deepEqual(res, document, 'result');
    });

    it('should get value', () => {
      const frag = document.createDocumentFragment();
      const finder = new Finder(window);
      const res = finder._setup('*', frag, {
        warn: true
      });
      assert.deepEqual(res, frag, 'result');
    });

    it('should get value', () => {
      const node = document.createElement('div');
      const finder = new Finder(window);
      const res = finder._setup('*', node, {
        warn: true
      });
      assert.deepEqual(res, node, 'result');
    });

    it('should get value', () => {
      const node = document.createElement('div');
      const finder = new Finder(window);
      const res = finder._setup('*', node, {
        invalidate: true
      });
      assert.deepEqual(res, node, 'result');
    });
  });

  describe('init nwsapi', () => {
    it('should get nwsapi', () => {
      const finder = new Finder(window);
      const res = finder._initNwsapi();
      assert.isFunction(res?.match, 'match');
      assert.isFunction(res?.closest, 'closest');
      assert.isFunction(res?.first, 'find');
      assert.isFunction(res?.select, 'select');
    });
  });

  describe('set event', () => {
    it('should get null', () => {
      const finder = new Finder(window);
      const res = finder._setEvent();
      assert.isNull(res, 'result');
    });

    it('should get value', () => {
      const evt = new window.MouseEvent('mousedown');
      const finder = new Finder(window);
      const res = finder._setEvent(evt);
      assert.deepEqual(res, evt, 'result');
    });

    // not implemented in jsdom
    xit('should get value', () => {
      const evt = new window.PointerEvent('pointerdown');
      const finder = new Finder(window);
      const res = finder._setEvent(evt);
      assert.deepEqual(res, evt, 'result');
    });

    it('should get value', () => {
      const evt = new window.KeyboardEvent('keydown');
      const finder = new Finder(window);
      const res = finder._setEvent(evt);
      assert.deepEqual(res, evt, 'result');
    });

    it('should get null', () => {
      const evt = new window.FocusEvent('focus');
      const finder = new Finder(window);
      const res = finder._setEvent(evt);
      assert.isNull(res, 'result');
    });
  });

  describe('correspond ast and nodes', () => {
    it('should throw', () => {
      const finder = new Finder(window);
      finder._setup('*', document);
      assert.throws(() => finder._correspond('[foo==bar]'),
        'Identifier is expected');
    });

    it('should throw', () => {
      const finder = new Finder(window);
      finder._setup('*', document);
      assert.throws(() => finder._correspond('li ++ li'),
        'Invalid selector li ++ li');
    });

    it('should get result', () => {
      const finder = new Finder(window);
      finder._setup('*', document);
      const res = finder._correspond('li:last-child, li:first-child + li');
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
            collected: false,
            dir: null,
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
            collected: false,
            dir: null,
            filtered: false,
            find: false
          }
        ],
        [
          [],
          []
        ]
      ], 'result');
    });

    it('should get result', () => {
      const finder = new Finder(window);
      finder._setup('li:last-child, li:first-child + li', document);
      const res = finder._correspond('li:last-child, li:first-child + li');
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
            collected: false,
            dir: null,
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
            collected: false,
            dir: null,
            filtered: false,
            find: false
          }
        ],
        [
          [],
          []
        ]
      ], 'result');
    });
  });

  describe('create tree walker', () => {
    it('should get tree walker', () => {
      const finder = new Finder(window);
      finder._setup('*', document);
      const res = finder._createTreeWalker(document);
      assert.deepEqual(res.root, document, 'walker');
    });

    it('should get tree walker', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder._setup('*', node);
      const res = finder._createTreeWalker(node);
      assert.deepEqual(res.root, node, 'walker');
    });

    it('should get tree walker', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder._setup('*', node);
      finder._createTreeWalker(node);
      const res = finder._createTreeWalker(node);
      assert.deepEqual(res.root, node, 'walker');
    });
  });

  describe('prepare querySelector walker', () => {
    it('should get tree walker', () => {
      const finder = new Finder(window);
      finder._setup('*', document);
      const res = finder._prepareQuerySelectorWalker(document);
      assert.deepEqual(res.root, document, 'walker');
    });

    it('should get tree walker', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder._setup('*', node);
      const res = finder._prepareQuerySelectorWalker(document);
      assert.deepEqual(res.root, node, 'walker');
    });
  });

  describe('traverse tree walker', () => {
    it('should get matched node', () => {
      const finder = new Finder(window);
      finder._setup('*', document);
      const res = finder._traverse(document);
      assert.deepEqual(res, document, 'result');
    });

    it('should get matched node', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder._setup('*', document);
      const res = finder._traverse(node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder._setup('*', document);
      const walker = finder._createTreeWalker(document);
      finder._traverse(document, walker);
      const res = finder._traverse(node, walker);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder._setup('*', document);
      const walker = finder._createTreeWalker(document);
      finder._traverse(document.getElementById('li1'), walker);
      const res = finder._traverse(node, walker);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const node = document.createElement('ol');
      const finder = new Finder(window);
      finder._setup('*', document);
      finder._createTreeWalker(document);
      const res = finder._traverse(node);
      assert.isNull(res, null, 'result');
    });

    it('should get matched node', () => {
      const node = document.createElement('ol');
      const finder = new Finder(window);
      finder._setup('*', node);
      finder._createTreeWalker(node);
      const res = finder._traverse(node);
      assert.deepEqual(res, node, 'result');
    });
  });

  describe('collect nth child', () => {
    it('should not match', () => {
      const anb = {
        a: 0,
        b: -1
      };
      const node = document.getElementById('dt1');
      const finder = new Finder(window);
      finder._setup(':nth-child(-1)', node);
      const res = finder._collectNthChild(anb, node);
      assert.strictEqual(res.size, 0, 'size');
    });

    it('should get matched node(s)', () => {
      const anb = {
        a: 0,
        b: 6,
        reverse: true
      };
      const node = document.getElementById('dt1');
      const finder = new Finder(window);
      finder._setup(':nth-last-child(6)', node);
      const res = finder._collectNthChild(anb, node);
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
      const finder = new Finder(window);
      finder._setup(':nth-last-child(-1n)', node);
      const res = finder._collectNthChild(anb, node);
      assert.strictEqual(res.size, 0, 'size');
    });

    it('should not match', () => {
      const anb = {
        a: 0,
        b: 0
      };
      const node = document.getElementById('dt1');
      const finder = new Finder(window);
      finder._setup(':nth-child(0)', node);
      const res = finder._collectNthChild(anb, node);
      assert.strictEqual(res.size, 0, 'size');
    });

    it('should not match', () => {
      const anb = {
        a: 0,
        b: 0,
        reverse: true
      };
      const node = document.getElementById('dt1');
      const finder = new Finder(window);
      finder._setup(':nth-last-child(0)', node);
      const res = finder._collectNthChild(anb, node);
      assert.strictEqual(res.size, 0, 'size');
    });

    it('should get matched node(s)', () => {
      const anb = {
        a: 0,
        b: 1
      };
      const node = document.getElementById('dt1');
      const finder = new Finder(window);
      finder._setup(':nth-child(1)', node);
      const res = finder._collectNthChild(anb, node);
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
      const finder = new Finder(window);
      finder._setup(':nth-last-child(1)', node);
      const res = finder._collectNthChild(anb, node);
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
      const finder = new Finder(window);
      finder._setup(':nth-child(1n)', node);
      const res = finder._collectNthChild(anb, node);
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
      const finder = new Finder(window);
      finder._setup(':nth-child(1n+1)', node);
      const res = finder._collectNthChild(anb, node);
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
      const finder = new Finder(window);
      finder._setup(':nth-child(2n)', node);
      const res = finder._collectNthChild(anb, node);
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
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder._setup(':nth-child(2n+1)', node);
      const res = finder._collectNthChild(anb, node);
      assert.strictEqual(res.size, 2, 'size');
      assert.deepEqual([...res], [
        node,
        document.getElementById('li3')
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const anb = {
        a: 2,
        b: 1,
        reverse: true
      };
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder._setup(':nth-last-child(2n+1)', node);
      const res = finder._collectNthChild(anb, node);
      assert.strictEqual(res.size, 2, 'size');
      assert.deepEqual([...res], [
        node,
        document.getElementById('li3')
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const anb = {
        a: 2,
        b: -1
      };
      const node = document.getElementById('dt1');
      const finder = new Finder(window);
      finder._setup(':nth-last-child(2n-1)', node);
      const res = finder._collectNthChild(anb, node);
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
        b: 2,
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
      const finder = new Finder(window);
      finder._setup(':nth-child(2 of .noted)', l1);
      const res = finder._collectNthChild(anb, l1);
      assert.strictEqual(res.size, 1, 'size');
      assert.deepEqual([...res], [
        l4
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
        b: 2,
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
      const finder = new Finder(window);
      finder._setup(':nth-child(2 of .noted)', l1);
      finder._collectNthChild(anb, l1);
      const res = finder._collectNthChild(anb, l1);
      assert.strictEqual(res.size, 1, 'size');
      assert.deepEqual([...res], [
        l4
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
        b: 2,
        reverse: true,
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
      const finder = new Finder(window);
      finder._setup(':nth-last-child(2 of .noted)', l1);
      const res = finder._collectNthChild(anb, l1);
      assert.strictEqual(res.size, 1, 'size');
      assert.deepEqual([...res], [
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
      const finder = new Finder(window);
      finder._setup(':nth-child(2n of .noted)', l1);
      const res = finder._collectNthChild(anb, l1);
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
      const finder = new Finder(window);
      finder._setup(':nth-child(2n+1 of .noted)', l1);
      const res = finder._collectNthChild(anb, l1);
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
      const finder = new Finder(window);
      finder._setup(':nth-child(-n+3 of .noted)', l1);
      const res = finder._collectNthChild(anb, l1);
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
      const finder = new Finder(window);
      finder._setup(':nth-child(1)', node);
      const res = finder._collectNthChild(anb, node);
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
      const finder = new Finder(window);
      finder._setup(':nth-child(n)', node);
      const res = finder._collectNthChild(anb, node);
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
      const finder = new Finder(window);
      finder._setup(':nth-child(2n+1)', node);
      const res = finder._collectNthChild(anb, node);
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
      const finder = new Finder(window);
      finder._setup(':nth-child(1 of .noted)', node);
      const res = finder._collectNthChild(anb, node);
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
      const finder = new Finder(window);
      finder._setup(':nth-child(1 of .noted)', node);
      const res = finder._collectNthChild(anb, node);
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
      const finder = new Finder(window);
      finder._setup(':nth-child(1 of .noted), :nth-last-child(n of .noted',
        node);
      const res = finder._collectNthChild(anb, node);
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
      const finder = new Finder(window);
      finder._setup(':nth-of-type(-1)', node);
      const res = finder._collectNthOfType(anb, node);
      assert.strictEqual(res.size, 0, 'size');
    });

    it('should not match', () => {
      const anb = {
        a: 0,
        b: 6
      };
      const node = document.getElementById('dt1');
      const finder = new Finder(window);
      finder._setup(':nth-last-of-type(6)', node);
      const res = finder._collectNthOfType(anb, node);
      assert.strictEqual(res.size, 0, 'size');
    });

    it('should not match', () => {
      const anb = {
        a: -1,
        b: 0
      };
      const node = document.getElementById('dt1');
      const finder = new Finder(window);
      finder._setup(':nth-of-type(-1n)', node);
      const res = finder._collectNthOfType(anb, node);
      assert.strictEqual(res.size, 0, 'size');
    });

    it('should not match', () => {
      const anb = {
        a: 0,
        b: 0
      };
      const node = document.getElementById('dt1');
      const finder = new Finder(window);
      finder._setup(':nth-of-type(0)', node);
      const res = finder._collectNthOfType(anb, node);
      assert.strictEqual(res.size, 0, 'size');
    });

    it('should get matched node(s)', () => {
      const anb = {
        a: 0,
        b: 1
      };
      const node = document.getElementById('dt1');
      const finder = new Finder(window);
      finder._setup(':nth-of-type(1)', node);
      const res = finder._collectNthOfType(anb, node);
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
      const finder = new Finder(window);
      finder._setup(':nth-last-of-type(1)', node);
      const res = finder._collectNthOfType(anb, node);
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
      const finder = new Finder(window);
      finder._setup(':nth-of-type(2)', node);
      const res = finder._collectNthOfType(anb, node);
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
      const finder = new Finder(window);
      finder._setup(':nth-of-type(3)', node);
      const res = finder._collectNthOfType(anb, node);
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
      const finder = new Finder(window);
      finder._setup(':nth-of-type(n)', node);
      const res = finder._collectNthOfType(anb, node);
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
      const finder = new Finder(window);
      finder._setup(':nth-of-type(n+1)', node);
      const res = finder._collectNthOfType(anb, node);
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
      const finder = new Finder(window);
      finder._setup(':nth-of-type(n-1)', node);
      const res = finder._collectNthOfType(anb, node);
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
      const finder = new Finder(window);
      finder._setup(':nth-of-type(2n)', node);
      const res = finder._collectNthOfType(anb, node);
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
      const finder = new Finder(window);
      finder._setup(':nth-of-type(2n+1)', node);
      const res = finder._collectNthOfType(anb, node);
      assert.strictEqual(res.size, 2, 'size');
      assert.deepEqual([...res], [
        node,
        document.getElementById('dt3')
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const anb = {
        a: 2,
        b: 1,
        reverse: true
      };
      const node = document.getElementById('dt1');
      const finder = new Finder(window);
      finder._setup(':nth-last-of-type(2n+1)', node);
      const res = finder._collectNthOfType(anb, node);
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
      const finder = new Finder(window);
      finder._setup(':nth-of-type(-n+2)', node);
      const res = finder._collectNthOfType(anb, node);
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
      const finder = new Finder(window);
      finder._setup(':nth-of-type(n)', node);
      const res = finder._collectNthOfType(anb, node);
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
      const finder = new Finder(window);
      finder._setup(':nth-of-type(1)', node);
      const res = finder._collectNthOfType(anb, node);
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
      const finder = new Finder(window);
      finder._setup(':nth-of-type(2n+1)', node);
      const res = finder._collectNthOfType(anb, node);
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
      const finder = new Finder(window);
      finder._setup(':nth-child(even)', node);
      const res = finder._matchAnPlusB(leaf, node, leafName);
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
      const finder = new Finder(window);
      finder._setup(':nth-child(odd)', node);
      const res = finder._matchAnPlusB(leaf, node, leafName);
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
      const finder = new Finder(window);
      finder._setup('dt:nth-child(odd)', node);
      const res = finder._matchAnPlusB(leaf, node, leafName);
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
      const finder = new Finder(window);
      finder._setup(':nth-last-child(even)', node);
      const res = finder._matchAnPlusB(leaf, node, leafName);
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
          a: '3',
          b: '1',
          type: AN_PLUS_B
        },
        selector: null,
        type: NTH
      };
      const node = document.getElementById('dt1');
      const finder = new Finder(window);
      finder._setup(':nth-child(3n+1)', node);
      const res = finder._matchAnPlusB(leaf, node, leafName);
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
      const finder = new Finder(window);
      finder._setup(':nth-child(2n)', node);
      const res = finder._matchAnPlusB(leaf, node, leafName);
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
      const finder = new Finder(window);
      finder._setup(':nth-child(3)', node);
      const res = finder._matchAnPlusB(leaf, node, leafName);
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
      const finder = new Finder(window);
      finder._setup(':nth-child(1)', node);
      const res = finder._matchAnPlusB(leaf, node, leafName);
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
      const finder = new Finder(window);
      finder._setup(':nth-last-child(3n+1)', node);
      const res = finder._matchAnPlusB(leaf, node, leafName);
      assert.strictEqual(res.size, 2, 'size');
      assert.deepEqual([...res], [
        document.getElementById('dt2'),
        document.getElementById('dd3')
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
      const finder = new Finder(window);
      finder._setup(':nth-of-type(even)', node);
      const res = finder._matchAnPlusB(leaf, node, leafName);
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
      const finder = new Finder(window);
      finder._setup(':nth-of-type(odd)', node);
      const res = finder._matchAnPlusB(leaf, node, leafName);
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
      const finder = new Finder(window);
      finder._setup(':nth-last-of-type(even)', node);
      const res = finder._matchAnPlusB(leaf, node, leafName);
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
      const finder = new Finder(window);
      finder._setup(':nth-of-type(3n+1)', node);
      const res = finder._matchAnPlusB(leaf, node, leafName);
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
      const finder = new Finder(window);
      finder._setup(':nth-of-type(2n)', node);
      const res = finder._matchAnPlusB(leaf, node, leafName);
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
      const finder = new Finder(window);
      finder._setup(':nth-of-type(3)', node);
      const res = finder._matchAnPlusB(leaf, node, leafName);
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
      const finder = new Finder(window);
      finder._setup(':nth-last-of-type(3n+1)', node);
      const res = finder._matchAnPlusB(leaf, node, leafName);
      assert.strictEqual(res.size, 1, 'size');
      assert.deepEqual([...res], [
        document.getElementById('dt3')
      ], 'result');
    });

    it('should not match', () => {
      const leafName = 'nth-foo';
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
      const finder = new Finder(window);
      finder._setup(':nth-foo(3n+1)', node);
      const res = finder._matchAnPlusB(leaf, node, leafName);
      assert.strictEqual(res.size, 0, 'size');
      assert.deepEqual([...res], [], 'result');
    });
  });

  describe('match :has() pseudo-class function', () => {
    it('should not match', () => {
      const node = document.getElementById('dl1');
      const leaves = [{
        name: 'li',
        type: SELECTOR_TYPE
      }];
      const finder = new Finder(window);
      finder._setup(':has(li)', node);
      const res = finder._matchHasPseudoFunc(leaves, node);
      assert.isFalse(res, 'result');
    });

    it('should match', () => {
      const node = document.getElementById('dl1');
      const leaves = [{
        name: 'dd',
        type: SELECTOR_TYPE
      }];
      const finder = new Finder(window);
      finder._setup(':has(dd)', node);
      const res = finder._matchHasPseudoFunc(leaves, node);
      assert.isTrue(res, 'result');
    });

    it('should not match', () => {
      const node = document.getElementById('dl1');
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
      const finder = new Finder(window);
      finder._setup(':has(dd p)', node);
      const res = finder._matchHasPseudoFunc(leaves, node);
      assert.isFalse(res, 'result');
    });

    it('should match', () => {
      const node = document.getElementById('dl1');
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
      const finder = new Finder(window);
      finder._setup(':has(dd span)', node);
      const res = finder._matchHasPseudoFunc(leaves, node);
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
      const finder = new Finder(window);
      finder._setup(':has(> li)', node);
      const res = finder._matchLogicalPseudoFunc({
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
      const finder = new Finder(window);
      finder._setup(':has(> li.li)', node);
      const res = finder._matchLogicalPseudoFunc({
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
      const finder = new Finder(window);
      finder._setup(':has(> li)', node);
      const res = finder._matchLogicalPseudoFunc({
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
      const finder = new Finder(window);
      finder._setup(':has(li)', node);
      const res = finder._matchLogicalPseudoFunc({
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
      const finder = new Finder(window);
      finder._setup(':has(dd > span)', node);
      const res = finder._matchLogicalPseudoFunc({
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
      const finder = new Finder(window);
      finder._setup(':has(:has(li))', node);
      const res = finder._matchLogicalPseudoFunc({
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
      const finder = new Finder(window);
      finder._setup(':not(ol, dl)', node);
      const res = finder._matchLogicalPseudoFunc({
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
      const finder = new Finder(window);
      finder._setup(':not(ul, dl)', node);
      const res = finder._matchLogicalPseudoFunc({
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
      const finder = new Finder(window);
      finder._setup(':not(:not(ol), ul)', node);
      const res = finder._matchLogicalPseudoFunc({
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
      const finder = new Finder(window);
      finder._setup(':not(:not(dl), ul)', node);
      const res = finder._matchLogicalPseudoFunc({
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
      const finder = new Finder(window);
      finder._setup(':is(ul, dl)', node);
      const res = finder._matchLogicalPseudoFunc({
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
      const finder = new Finder(window);
      finder._setup(':is(ul#ul1, dl#dl1)', node);
      const res = finder._matchLogicalPseudoFunc({
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
      const finder = new Finder(window);
      finder._setup(':is(ul li ~ li)', node);
      const res = finder._matchLogicalPseudoFunc({
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
      const finder = new Finder(window);
      finder._setup(':is(ol, dl)', node);
      const res = finder._matchLogicalPseudoFunc({
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
      const finder = new Finder(window);
      finder._setup(':where(ul, dl)', node);
      const res = finder._matchLogicalPseudoFunc({
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
      const finder = new Finder(window);
      finder._setup(':where(ol, dl)', node);
      const res = finder._matchLogicalPseudoFunc({
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
      const finder = new Finder(window);
      finder._setup(':not(:is(li, dd))', node);
      const res = finder._matchLogicalPseudoFunc({
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
      const finder = new Finder(window);
      finder._setup(':is(ul, dl)', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':nth-child(even)', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':dir(ltr)', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':lang(en)', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':current(foo)', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':current(foo)', node, {
        warn: true
      });
      assert.throws(() => finder._matchPseudoClassSelector(leaf, node),
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
      const finder = new Finder(window);
      finder._setup(':host(.foo)', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':host-context(.foo)', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':foobar(foo)', node);
      assert.throws(() => finder._matchPseudoClassSelector(leaf, node),
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
        name: 'contains',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup(':contains(foo)', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
        name: 'contains',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup(':contains(foo)', node, {
        warn: true
      });
      assert.throws(() => finder._matchPseudoClassSelector(leaf, node),
        DOMException, 'Unknown pseudo-class :contains()');
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
      const finder = new Finder(window);
      finder._setup(':foobar(foo)', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {
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
      const finder = new Finder(window);
      finder._setup(':any-link', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      node.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
        'https://example.com/');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup(':any-link', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
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
      const finder = new Finder(window);
      finder._setup(':any-link', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':link', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':local-link', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':local-link', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':visited', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'hover',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup(':hover', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'hover',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      let event;
      node.addEventListener('mouseover', evt => {
        event = evt;
      });
      node.dispatchEvent(new window.MouseEvent('mouseover'));
      const finder = new Finder(window);
      finder._setup(':hover', node, {
        event
      });
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'hover',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const child = document.createElement('div');
      node.appendChild(child);
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      let event;
      child.addEventListener('mouseover', evt => {
        event = evt;
      });
      child.dispatchEvent(new window.MouseEvent('mouseover'));
      const finder = new Finder(window);
      finder._setup(':hover', node, {
        event
      });
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'active',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup(':active', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'active',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      let event;
      node.addEventListener('mousedown', evt => {
        event = evt;
      });
      node.dispatchEvent(new window.MouseEvent('mousedown', {
        buttons: 1
      }));
      const finder = new Finder(window);
      finder._setup(':active', node, {
        event
      });
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'active',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const child = document.createElement('div');
      node.appendChild(child);
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      let event;
      child.addEventListener('mousedown', evt => {
        event = evt;
      });
      child.dispatchEvent(new window.MouseEvent('mousedown', {
        buttons: 1
      }));
      const finder = new Finder(window);
      finder._setup(':active', node, {
        event
      });
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'active',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      let event;
      node.addEventListener('mousedown', evt => {
        event = evt;
      });
      node.dispatchEvent(new window.MouseEvent('mousedown', {
        buttons: 6
      }));
      const finder = new Finder(window);
      finder._setup(':active', node, {
        event
      });
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':target', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':target', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':target', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':target-within', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':target-within', parent);
      const res = finder._matchPseudoClassSelector(leaf, parent);
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
      const finder = new Finder(window);
      finder._setup(':target-within', parent);
      const res = finder._matchPseudoClassSelector(leaf, parent);
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
      const finder = new Finder(window);
      finder._setup(':scope', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':scope', refPoint);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'scope',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.documentElement;
      const finder = new Finder(window);
      finder._setup(':scope', document);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':scope', document);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      const finder = new Finder(window);
      finder._setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':focus', document.body);
      const res = finder._matchPseudoClassSelector(leaf, document.body);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      const finder = new Finder(window);
      finder._setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      node.disabled = true;
      const finder = new Finder(window);
      finder._setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      node.setAttribute('disabled', 'disabled');
      const finder = new Finder(window);
      finder._setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      node.hidden = true;
      const finder = new Finder(window);
      finder._setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      node.setAttribute('hidden', 'hidden');
      const finder = new Finder(window);
      finder._setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      node.style.display = 'none';
      const finder = new Finder(window);
      finder._setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      node.style.visibility = 'hidden';
      const finder = new Finder(window);
      finder._setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      parent.disabled = true;
      const finder = new Finder(window);
      finder._setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      parent.setAttribute('disabled', 'disabled');
      const finder = new Finder(window);
      finder._setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      parent.hidden = true;
      const finder = new Finder(window);
      finder._setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      parent.setAttribute('hidden', 'hidden');
      const finder = new Finder(window);
      finder._setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      parent.style.display = 'none';
      const finder = new Finder(window);
      finder._setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      parent.style.visibility = 'hidden';
      const finder = new Finder(window);
      finder._setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-visible',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      const finder = new Finder(window);
      finder._setup(':focus-visible', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'focus-visible',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      let event;
      node.addEventListener('keydown', evt => {
        event = evt;
      });
      node.dispatchEvent(new window.KeyboardEvent('keydown'));
      node.focus();
      const finder = new Finder(window);
      finder._setup(':focus-visible', node, {
        event
      });
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      const finder = new Finder(window);
      finder._setup(':focus-within', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      const finder = new Finder(window);
      finder._setup(':focus-within', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: SELECTOR_PSEUDO_CLASS
      };
      const finder = new Finder(window);
      finder._setup(':focus-within', document.body);
      const res = finder._matchPseudoClassSelector(leaf, document.body);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      node.disabled = true;
      const finder = new Finder(window);
      finder._setup(':focus-within', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      node.setAttribute('disabled', 'disabled');
      const finder = new Finder(window);
      finder._setup(':focus-within', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      node.hidden = true;
      const finder = new Finder(window);
      finder._setup(':focus-within', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      node.setAttribute('hidden', 'hidden');
      const finder = new Finder(window);
      finder._setup(':focus-within', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      node.style.display = 'none';
      const finder = new Finder(window);
      finder._setup(':focus-within', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      node.style.visibility = 'hidden';
      const finder = new Finder(window);
      finder._setup(':focus-within', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      const finder = new Finder(window);
      finder._setup(':focus-within', parent);
      const res = finder._matchPseudoClassSelector(leaf, parent);
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
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      const finder = new Finder(window);
      finder._setup(':focus-within', parent);
      const res = finder._matchPseudoClassSelector(leaf, parent);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      parent.disabled = true;
      const finder = new Finder(window);
      finder._setup(':focus-within', parent);
      const res = finder._matchPseudoClassSelector(leaf, parent);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      parent.setAttribute('disabled', 'disabled');
      const finder = new Finder(window);
      finder._setup(':focus-within', parent);
      const res = finder._matchPseudoClassSelector(leaf, parent);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      parent.hidden = true;
      const finder = new Finder(window);
      finder._setup(':focus-within', parent);
      const res = finder._matchPseudoClassSelector(leaf, parent);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      parent.setAttribute('hidden', 'hidden');
      const finder = new Finder(window);
      finder._setup(':focus-within', parent);
      const res = finder._matchPseudoClassSelector(leaf, parent);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      parent.style.display = 'none';
      const finder = new Finder(window);
      finder._setup(':focus-within', parent);
      const res = finder._matchPseudoClassSelector(leaf, parent);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      parent.style.visibility = 'hidden';
      const finder = new Finder(window);
      finder._setup(':focus-within', parent);
      const res = finder._matchPseudoClassSelector(leaf, parent);
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
      const finder = new Finder(window);
      finder._setup(':open', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':open', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':closed', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':closed', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':disabled', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':disabled', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':disabled', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':disabled', node1);
      const res = finder._matchPseudoClassSelector(leaf, node1);
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
      const finder = new Finder(window);
      finder._setup(':disabled', node1);
      const res = finder._matchPseudoClassSelector(leaf, node1);
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
      const finder = new Finder(window);
      finder._setup(':enabled', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':enabled', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':enabled', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':read-only', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':read-only', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':read-only', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':read-only', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':read-only', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':read-only', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':read-only', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':read-only', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':read-only', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':read-only', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':read-only', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':read-write', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':read-write', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':read-write', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':read-write', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':read-write', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':read-write', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':read-write', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':read-write', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':read-write', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':read-write', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':read-write', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':placeholder-shown', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':placeholder-shown', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':placeholder-shown', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':placeholder-shown', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
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
      const finder = new Finder(window);
      finder._setup(':placeholder-shown', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      node.setAttribute('placeholder', '');
      node.value = '';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup(':placeholder-shown', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      node.placeholder = 'foo';
      node.value = '';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup(':placeholder-shown', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      node.placeholder = '';
      node.value = '';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup(':placeholder-shown', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      node.placeholder = 'foo\r\nbar';
      node.value = '';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup(':placeholder-shown', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':placeholder-shown', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':checked', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':checked', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':checked', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':checked', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':indeterminate', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':indeterminate', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':indeterminate', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':indeterminate', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':indeterminate', node1);
      const res = finder._matchPseudoClassSelector(leaf, node1);
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
      const finder = new Finder(window);
      finder._setup(':indeterminate', node1);
      const res = finder._matchPseudoClassSelector(leaf, node1);
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
      const finder = new Finder(window);
      finder._setup(':indeterminate', node1);
      const res = finder._matchPseudoClassSelector(leaf, node1);
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
      const finder = new Finder(window);
      finder._setup(':indeterminate', node1);
      const res = finder._matchPseudoClassSelector(leaf, node1);
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
      const finder = new Finder(window);
      finder._setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: SELECTOR_PSEUDO_CLASS
      };
      const form = document.createElement('form');
      const p = document.createElement('p');
      const node = document.createElement('button');
      form.appendChild(p);
      form.appendChild(node);
      const parent = document.getElementById('div0');
      parent.appendChild(form);
      const finder = new Finder(window);
      finder._setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':valid', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':valid', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':valid', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':valid', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':valid', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':valid', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      input.maxLength = 3;
      input.value = 'foo';
      node.appendChild(input);
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup(':valid', input);
      const res = finder._matchPseudoClassSelector(leaf, input);
      assert.deepEqual([...res], [
        input
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
      input.maxLength = 2;
      input.value = 'foo';
      node.appendChild(input);
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup(':valid', input);
      const res = finder._matchPseudoClassSelector(leaf, input);
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
      input.maxLength = 3;
      input.value = 'foo';
      node.appendChild(input);
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup(':valid', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      input.maxLength = 2;
      input.value = 'foo';
      node.appendChild(input);
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup(':valid', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':invalid', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':invalid', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':invalid', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':invalid', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const p = document.createElement('p');
      parent.appendChild(p);
      const finder = new Finder(window);
      finder._setup(':invalid', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const p = document.createElement('p');
      parent.appendChild(p);
      const finder = new Finder(window);
      finder._setup(':invalid', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
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
      input.maxLength = 3;
      input.value = 'foo';
      node.appendChild(input);
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup(':invalid', input);
      const res = finder._matchPseudoClassSelector(leaf, input);
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
      input.maxLength = 2;
      input.value = 'foo';
      node.appendChild(input);
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup(':invalid', input);
      const res = finder._matchPseudoClassSelector(leaf, input);
      assert.deepEqual([...res], [
        input
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
      input.maxLength = 3;
      input.value = 'foo';
      node.appendChild(input);
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup(':invalid', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      input.maxLength = 2;
      input.value = 'foo';
      node.appendChild(input);
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup(':invalid', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      node.readonly = true;
      node.setAttribute('type', 'number');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '1';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup(':in-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':in-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':in-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':in-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':in-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':in-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'in-range',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'range');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '1';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup(':in-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'in-range',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'range');
      node.setAttribute('max', '10');
      node.value = '1';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup(':in-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'in-range',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'range');
      node.value = '1';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup(':in-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':in-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':in-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':out-of-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':out-of-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':out-of-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':out-of-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':out-of-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':required', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':required', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':required', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':required', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':required', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':required', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':required', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':required', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':required', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':required', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':optional', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':optional', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':optional', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':optional', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':optional', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':optional', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':optional', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':optional', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':optional', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'root',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.documentElement;
      const finder = new Finder(window);
      finder._setup(':root', document);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':root', document);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':empty', document);
      const res1 = finder._matchPseudoClassSelector(leaf, p1);
      const res2 = finder._matchPseudoClassSelector(leaf, p2);
      const res3 = finder._matchPseudoClassSelector(leaf, p3);
      const res4 = finder._matchPseudoClassSelector(leaf, p4);
      const res5 = finder._matchPseudoClassSelector(leaf, p5);
      const res6 = finder._matchPseudoClassSelector(leaf, s1);
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
      const finder = new Finder(window);
      finder._setup(':first-child', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':first-child', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'first-child',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('div');
      const finder = new Finder(window);
      finder._setup(':first-child', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':last-child', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':last-child', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':last-child', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':only-child', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':only-child', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'only-child',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('div');
      const finder = new Finder(window);
      finder._setup(':only-child', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':first-of-type', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':first-of-type', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':last-of-type', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':last-of-type', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':only-of-type', node1);
      const res = finder._matchPseudoClassSelector(leaf, node1);
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
      const finder = new Finder(window);
      finder._setup(':only-of-type', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('p');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder._setup(':defined', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('asdf');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder._setup(':defined', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: SELECTOR_PSEUDO_CLASS
      };
      window.customElements.define('sw-rey',
        class extends window.HTMLElement {});
      const node = document.createElement('sw-rey');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder._setup(':defined', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: SELECTOR_PSEUDO_CLASS
      };
      window.customElements.define('sw-finn',
        class extends window.HTMLElement {}, { extends: 'p' });
      const node = document.createElement('p');
      node.setAttribute('is', 'sw-finn');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder._setup(':defined', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('sw-han');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder._setup(':defined', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('p');
      node.setAttribute('is', 'sw-luke');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder._setup(':defined', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('p');
      node.setAttribute('is', 'asdf');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder._setup(':defined', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: SELECTOR_PSEUDO_CLASS
      };
      window.customElements.define('foo-', class extends window.HTMLElement {});
      const node = document.createElement('foo-');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder._setup(':defined', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node =
        document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder._setup(':defined', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node =
        document.createElementNS('http://www.w3.org/2000/svg', 'foo');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder._setup(':defined', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    // NOTE: not implemented in jsdom
    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node =
        document.createElementNS('http://www.w3.org/1998/Math/MathML', 'math');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder._setup(':defined', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElementNS('http://www.example.com', 'foo');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder._setup(':defined', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    // NOTE: popover api is not supported in jsdom
    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'popover-open',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('p');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder._setup(':popover-open', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'popover-open',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('p');
      node.showPopover = () => {
        node.style.display = 'block';
      };
      node.popover = 'auto';
      node.style.display = 'none';
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder._setup(':popover-open', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'popover-open',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('p');
      node.showPopover = () => {
        node.style.display = 'block';
      };
      node.popover = 'auto';
      node.style.display = 'none';
      document.getElementById('div0').appendChild(node);
      node.showPopover();
      const finder = new Finder(window);
      finder._setup(':popover-open', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'popover-open',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('p');
      node.hidePopover = () => {
        node.style.display = 'none';
      };
      node.popover = 'auto';
      node.style.display = 'block';
      document.getElementById('div0').appendChild(node);
      node.hidePopover();
      const finder = new Finder(window);
      finder._setup(':popover-open', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'host',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder._setup(':host', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':host-context', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':after', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':after', node, {
        warn: true
      });
      assert.throws(() => finder._matchPseudoClassSelector(leaf, node),
        DOMException, 'Unsupported pseudo-element ::after');
    });

    // not supported
    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'autofill',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder._setup(':autofill', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
      assert.deepEqual([...res], [], 'result');
    });

    it('should throw', () => {
      const leaf = {
        children: null,
        name: 'autofill',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder._setup(':autofill', node, {
        warn: true
      });
      assert.throws(() => finder._matchPseudoClassSelector(leaf, node),
        DOMException, 'Unsupported pseudo-class :autofill');
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
      const finder = new Finder(window);
      finder._setup(':foo', node);
      assert.throws(() => finder._matchPseudoClassSelector(leaf, node),
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
      const finder = new Finder(window);
      finder._setup(':foo', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {
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
      const finder = new Finder(window);
      finder._setup(':-webkit-foo', node);
      const res = finder._matchPseudoClassSelector(leaf, node);
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
      const finder = new Finder(window);
      finder._setup(':-webkit-foo', node, {
        warn: true
      });
      assert.throws(() => finder._matchPseudoClassSelector(leaf, node),
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
      const finder = new Finder(window);
      finder._setup(':webkit-foo', node);
      assert.throws(() => finder._matchPseudoClassSelector(leaf, node),
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
      const finder = new Finder(window);
      finder._setup(':webkit-foo', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {
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
      const finder = new Finder(window);
      finder._setup(':-webkitfoo', node);
      assert.throws(() => finder._matchPseudoClassSelector(leaf, node),
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
      const finder = new Finder(window);
      finder._setup(':-webkitfoo', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {
        forgive: true
      });
      assert.deepEqual([...res], [], 'result');
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
      const finder = new Finder(window);
      finder._setup(':foobar div', node);
      assert.throws(() => finder._matchShadowHostPseudoClass(ast, node),
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
      const finder = new Finder(window);
      finder._setup(':host-context div', node);
      assert.throws(() => finder._matchShadowHostPseudoClass(ast, node),
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
      const finder = new Finder(window);
      finder._setup(':host div', node);
      const res = finder._matchShadowHostPseudoClass(ast, node);
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
      const finder = new Finder(window);
      finder._setup(':host(#baz #foobar) div', node);
      assert.throws(() => finder._matchShadowHostPseudoClass(ast, node),
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
      const finder = new Finder(window);
      finder._setup(':host(#baz) div', node);
      const res = finder._matchShadowHostPseudoClass(ast, node);
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
      const finder = new Finder(window);
      finder._setup(':host(#foobar) div', node);
      const res = finder._matchShadowHostPseudoClass(ast, node);
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
      const finder = new Finder(window);
      finder._setup(':host-context(#baz #foobar) div', node);
      assert.throws(() => finder._matchShadowHostPseudoClass(ast, node),
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
      const finder = new Finder(window);
      finder._setup(':host-context(#baz) div', node);
      const res = finder._matchShadowHostPseudoClass(ast, node);
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
      const finder = new Finder(window);
      finder._setup(':host-context(#div0) div', node);
      const res = finder._matchShadowHostPseudoClass(ast, node);
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
      const finder = new Finder(window);
      finder._setup(':host-context(#foobar) div', node);
      const res = finder._matchShadowHostPseudoClass(ast, node);
      assert.isNull(res, 'result');
    });
  });

  describe('match selector', () => {
    it('should not match', () => {
      const ast = {
        name: EMPTY,
        type: SELECTOR_TYPE
      };
      const finder = new Finder(window);
      finder._setup(':is()', document);
      const res = finder._matchSelector(ast, document.body);
      assert.strictEqual(res.size, 0, 'size');
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const ast = {
        name: 'foo',
        type: SELECTOR_CLASS
      };
      const node = document.getElementById('div5');
      const finder = new Finder(window);
      finder._setup('.foo', document);
      const res = finder._matchSelector(ast, node);
      assert.strictEqual(res.size, 1, 'size');
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'foo',
        type: SELECTOR_CLASS
      };
      const node = document.createElement('div');
      node.classList.add('foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup('.foo', document);
      const res = finder._matchSelector(ast, node);
      assert.strictEqual(res.size, 1, 'size');
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const ast = {
        name: 'bar',
        type: SELECTOR_CLASS
      };
      const node = document.createElement('div');
      node.classList.add('foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup('.foo', document);
      const res = finder._matchSelector(ast, node);
      assert.strictEqual(res.size, 0, 'size');
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'div0',
        type: SELECTOR_ID
      };
      const node = document.getElementById('div0');
      const finder = new Finder(window);
      finder._setup('.foo', document);
      const res = finder._matchSelector(ast, node);
      assert.strictEqual(res.size, 1, 'size');
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const ast = {
        name: 'foo',
        type: SELECTOR_ID
      };
      const node = document.getElementById('div0');
      const finder = new Finder(window);
      finder._setup('.foo', document);
      const res = finder._matchSelector(ast, node);
      assert.strictEqual(res.size, 0, 'size');
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'foo\\ bar',
        type: SELECTOR_ID
      };
      const node = document.createElement('div');
      node.setAttribute('id', 'foo bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup('.foo', document);
      const res = finder._matchSelector(ast, node);
      assert.strictEqual(res.size, 1, 'size');
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const ast = {
        flags: null,
        finder: null,
        name: {
          name: 'hidden',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: null
      };
      const node = document.getElementById('span3');
      const finder = new Finder(window);
      finder._setup('[hidden]', document);
      const res = finder._matchSelector(ast, node);
      assert.strictEqual(res.size, 1, 'size');
      assert.deepEqual([...res], [
        document.getElementById('span3')
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const ast = {
        name: 'dt',
        type: SELECTOR_TYPE
      };
      const node = document.getElementById('dt1');
      const finder = new Finder(window);
      finder._setup('dt', document);
      const res = finder._matchSelector(ast, node);
      assert.strictEqual(res.size, 1, 'size');
      assert.deepEqual([...res], [
        node
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
      const finder = new Finder(window);
      finder._setup(':is(ul)', document);
      const res = finder._matchSelector(ast, node);
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
      const finder = new Finder(window);
      finder._setup('::before', document);
      const res = finder._matchSelector(ast, node);
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
      const finder = new Finder(window);
      finder._setup(':host(#baz) div', node);
      const res = finder._matchSelector(ast, node);
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
      const finder = new Finder(window);
      finder._setup(':host(#foobar) div', node);
      const res = finder._matchSelector(ast, node);
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
      const finder = new Finder(window);
      finder._setup('li#li1.li', document);
      const res = finder._matchLeaves(leaves, node);
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
      const finder = new Finder(window);
      finder._setup('li#li1.foobar', document);
      const res = finder._matchLeaves(leaves, node);
      assert.isFalse(res, 'nodes');
    });
  });

  describe('match HTML collection', () => {
    it('should get matched nodes', () => {
      const items = document.getElementsByTagName('li');
      const finder = new Finder(window);
      finder._setup('li', document);
      const res = finder._matchHTMLCollection(items);
      assert.deepEqual([...res], [
        document.getElementById('li1'),
        document.getElementById('li2'),
        document.getElementById('li3')
      ], 'result');
    });

    it('should get matched nodes', () => {
      const leaves = [
        {
          name: 'li',
          type: SELECTOR_TYPE
        },
        {
          children: null,
          name: 'last-child',
          type: SELECTOR_PSEUDO_CLASS
        }
      ];
      const items = document.getElementsByTagName('li');
      const finder = new Finder(window);
      finder._setup('li', document);
      const res = finder._matchHTMLCollection(items, {
        compound: true,
        filterLeaves: leaves
      });
      assert.deepEqual([...res], [
        document.getElementById('li3')
      ], 'result');
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
      const finder = new Finder(window);
      finder._setup('div #foobar', parent);
      const res = finder._findDescendantNodes(leaves, parent);
      assert.deepEqual([...res.nodes], [], 'nodes');
      assert.isTrue(res.pending, 'pending');
    });

    it('should be pended', () => {
      const leaves = [
        {
          name: '\\*',
          type: SELECTOR_TYPE
        }
      ];
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder._setup('ul *', document);
      const res = finder._findDescendantNodes(leaves, node);
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
      const finder = new Finder(window);
      finder._setup('ul #li3', document);
      const res = finder._findDescendantNodes(leaves, refNode);
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
      const finder = new Finder(window);
      finder._setup('ul #foobar', document);
      const res = finder._findDescendantNodes(leaves, refNode);
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
      const finder = new Finder(window);
      finder._setup('div #ul1', document);
      const res = finder._findDescendantNodes(leaves, refNode);
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
      const finder = new Finder(window);
      finder._setup('ul li#li3', document);
      const res = finder._findDescendantNodes(leaves, refNode);
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
      const finder = new Finder(window);
      finder._setup('ul #li3.foobar', document);
      const res = finder._findDescendantNodes(leaves, refNode);
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
      const finder = new Finder(window);
      finder._setup('ul .li', document);
      const res = finder._findDescendantNodes(leaves, refNode);
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
      const finder = new Finder(window);
      finder._setup('ul .li:first-child', document);
      const res = finder._findDescendantNodes(leaves, refNode);
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
      const finder = new Finder(window);
      finder._setup('ul .foobar', document);
      const res = finder._findDescendantNodes(leaves, refNode);
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
      const doc =
          new window.DOMParser().parseFromString('<foo></foo>', 'text/xml');
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
      finder._setup('root div', root);
      const res = finder._findDescendantNodes(leaves, root);
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
      const finder = new Finder(window);
      finder._setup('ul *|li', document);
      const res = finder._findDescendantNodes(leaves, refNode);
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
      const finder = new Finder(window);
      finder._setup('ul li', document);
      const res = finder._findDescendantNodes(leaves, refNode);
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
      const finder = new Finder(window);
      finder._setup('ul li:first-child', document);
      const res = finder._findDescendantNodes(leaves, refNode);
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
      const finder = new Finder(window);
      finder._setup('div ol', document);
      const res = finder._findDescendantNodes(leaves, refNode);
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
      const finder = new Finder(window);
      finder._setup('ul ::before', document);
      const res = finder._findDescendantNodes(leaves, refNode);
      assert.deepEqual([...res.nodes], [], 'nodes');
      assert.isFalse(res.pending, 'pending');
    });

    it('should be pended', () => {
      const leaves = [
        {
          flags: null,
          finder: null,
          name: {
            name: 'hidden',
            type: IDENTIFIER
          },
          type: SELECTOR_ATTR,
          value: null
        }
      ];
      const refNode = document.getElementById('dl1');
      const finder = new Finder(window);
      finder._setup('dl [hidden]', document);
      const res = finder._findDescendantNodes(leaves, refNode);
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
      const finder = new Finder(window);
      finder._setup('ul :first-child', document);
      const res = finder._findDescendantNodes(leaves, refNode);
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
      const finder = new Finder(window);
      finder._setup('li + li', node);
      const res = finder._matchCombinator(twig, node);
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
      const finder = new Finder(window);
      finder._setup('li + li', node);
      const res = finder._matchCombinator(twig, node);
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
      const finder = new Finder(window);
      finder._setup('li + li', node);
      const res = finder._matchCombinator(twig, node, {
        dir: 'next'
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
      const finder = new Finder(window);
      finder._setup('li + li', node);
      const res = finder._matchCombinator(twig, node, {
        dir: 'next'
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
      const finder = new Finder(window);
      finder._setup('li ~ li', node);
      const res = finder._matchCombinator(twig, node);
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
      const finder = new Finder(window);
      finder._setup('li ~ li', node);
      const res = finder._matchCombinator(twig, node);
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
      const finder = new Finder(window);
      finder._setup('li ~ li', node);
      const res = finder._matchCombinator(twig, node, {
        dir: 'next'
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
      const finder = new Finder(window);
      finder._setup('li ~ li', node);
      const res = finder._matchCombinator(twig, node, {
        dir: 'next'
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
      const finder = new Finder(window);
      finder._setup('ul > li', node);
      const res = finder._matchCombinator(twig, node);
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
      const finder = new Finder(window);
      finder._setup('ol > li', node);
      const res = finder._matchCombinator(twig, node);
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
      const finder = new Finder(window);
      finder._setup('ul > .li', node);
      const res = finder._matchCombinator(twig, node, {
        dir: 'next'
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
      const finder = new Finder(window);
      finder._setup('ul > .foobar', node);
      const res = finder._matchCombinator(twig, node, {
        dir: 'next'
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
      const finder = new Finder(window);
      finder._setup('ul li', node);
      const res = finder._matchCombinator(twig, node);
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
      const finder = new Finder(window);
      finder._setup('ol li', node);
      const res = finder._matchCombinator(twig, node);
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
      const finder = new Finder(window);
      finder._setup('ul .li', node);
      const res = finder._matchCombinator(twig, node, {
        dir: 'next'
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
      const finder = new Finder(window);
      finder._setup('ol .foobar', node);
      const res = finder._matchCombinator(twig, node, {
        dir: 'next'
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
      const finder = new Finder(window);
      finder._setup('dl #dd2 span ', node);
      const res = finder._matchCombinator(twig, node, {
        dir: 'next'
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
      const finder = new Finder(window);
      finder._setup('dl #foobar span', node);
      const res = finder._matchCombinator(twig, node, {
        dir: 'next'
      });
      assert.deepEqual([...res], [], 'result');
    });
  });

  describe('find matched node from sub walker', () => {
    it('should get matched node', () => {
      const finder = new Finder(window);
      finder._setup('ul', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [{ leaves }] }]] = finder._correspond('ul');
      const res = finder._findNode(leaves, {
        node: document
      });
      assert.deepEqual(res, document.getElementById('ul1'), 'result');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      finder._setup('ol', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [{ leaves }] }]] = finder._correspond('ol');
      const res = finder._findNode(leaves, {
        node: document
      });
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const node = document.createElement('ul');
      const child = document.createElement('li');
      node.appendChild(child);
      const finder = new Finder(window);
      finder._setup('ul', node);
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [{ leaves }] }]] = finder._correspond('ul');
      const res = finder._findNode(leaves, {
        node
      });
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const node = document.createElement('ul');
      const child = document.createElement('li');
      node.appendChild(child);
      const finder = new Finder(window);
      finder._setup('li', node);
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [{ leaves }] }]] = finder._correspond('li');
      const res = finder._findNode(leaves, {
        node
      });
      assert.deepEqual(res, child, 'result');
    });

    it('should get matched node', () => {
      const node = document.createElement('ul');
      const child = document.createElement('li');
      node.appendChild(child);
      const finder = new Finder(window);
      finder._setup('ul', node);
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [{ leaves }] }]] = finder._correspond('ul');
      const res = finder._findNode(leaves, {
        node
      });
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const finder = new Finder(window);
      finder._setup('li', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [{ leaves }] }]] = finder._correspond('li');
      const res = finder._findNode(leaves, {
        node: document.getElementById('li1')
      });
      assert.deepEqual(res, document.getElementById('li2'), 'result');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      finder._setup('li', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [{ leaves }] }]] = finder._correspond('li');
      const res = finder._findNode(leaves, {
        node: document.getElementById('li3')
      });
      assert.isNull(res, 'result');
    });
  });

  describe('match self', () => {
    it('should match', () => {
      const node = document.getElementById('li1');
      const leaves = [
        {
          name: 'li',
          type: SELECTOR_CLASS
        },
        {
          name: 'li',
          type: SELECTOR_TYPE
        }
      ];
      const finder = new Finder(window);
      finder._setup('li.li', node);
      const res = finder._matchSelf(leaves);
      assert.deepEqual(res, [
        [node],
        true
      ], 'result');
    });

    it('should match', () => {
      const node = document.getElementById('li1');
      const leaves = [
        {
          name: 'foo',
          type: SELECTOR_CLASS
        },
        {
          name: 'li',
          type: SELECTOR_TYPE
        }
      ];
      const finder = new Finder(window);
      finder._setup('li.foo', node);
      const res = finder._matchSelf(leaves);
      assert.deepEqual(res, [
        [],
        false
      ], 'result');
    });
  });

  describe('find lineal', () => {
    it('should match', () => {
      const node = document.getElementById('li1');
      const leaf = {
        name: 'li',
        type: SELECTOR_TYPE
      };
      const finder = new Finder(window);
      finder._setup('li', node);
      const res = finder._findLineal([leaf]);
      assert.deepEqual(res, [
        [document.getElementById('li1')],
        true
      ], 'result');
    });

    it('should match', () => {
      const node = document.getElementById('li1');
      const leaf = {
        name: 'li',
        type: SELECTOR_TYPE
      };
      const finder = new Finder(window);
      finder._setup('ul > li', node);
      const res = finder._findLineal([leaf], {
        complex: true
      });
      assert.deepEqual(res, [
        [document.getElementById('li1')],
        true
      ], 'result');
    });

    it('should match', () => {
      const node = document.getElementById('li1');
      const leaf = {
        name: 'ul',
        type: SELECTOR_TYPE
      };
      const finder = new Finder(window);
      finder._setup('ul', node);
      const res = finder._findLineal([leaf]);
      assert.deepEqual(res, [
        [document.getElementById('ul1')],
        true
      ], 'result');
    });

    it('should not match', () => {
      const node = document.getElementById('li1');
      const leaf = {
        name: 'ol',
        type: SELECTOR_TYPE
      };
      const finder = new Finder(window);
      finder._setup('ol', node);
      const res = finder._findLineal([leaf]);
      assert.deepEqual(res, [
        [],
        false
      ], 'result');
    });

    it('should match', () => {
      const node = document.getElementById('li2');
      const leaf = {
        name: 'li',
        type: SELECTOR_CLASS
      };
      const finder = new Finder(window);
      finder._setup('li.li', node);
      const res = finder._findLineal([leaf], {
        complex: false
      });
      assert.deepEqual(res, [
        [document.getElementById('li2')],
        true
      ], 'result');
    });

    it('should match', () => {
      const node = document.getElementById('li2');
      const leaf = {
        name: 'li',
        type: SELECTOR_CLASS
      };
      const finder = new Finder(window);
      finder._setup('li + li.li', node);
      const res = finder._findLineal([leaf], {
        complex: true
      });
      assert.deepEqual(res, [
        [document.getElementById('li2')],
        true
      ], 'result');
    });
  });

  describe('find first', () => {
    it('should match', () => {
      const leaves = [
        {
          name: 'li',
          type: SELECTOR_CLASS
        },
        {
          name: 'li',
          type: SELECTOR_TYPE
        }
      ];
      const finder = new Finder(window);
      finder._setup('li.li', document);
      finder._prepareQuerySelectorWalker(document);
      const res = finder._findFirst(leaves);
      assert.deepEqual(res, [
        [document.getElementById('li1')],
        true
      ], 'result');
    });

    it('should not match', () => {
      const leaves = [
        {
          name: 'ol',
          type: SELECTOR_TYPE
        }
      ];
      const finder = new Finder(window);
      finder._setup('ol', document);
      finder._prepareQuerySelectorWalker(document);
      const res = finder._findFirst(leaves);
      assert.deepEqual(res, [
        [],
        false
      ], 'result');
    });
  });

  describe('find from HTML collection', () => {
    it('should match', () => {
      const finder = new Finder(window);
      finder._setup('.li', document);
      finder._prepareQuerySelectorWalker(document);
      const items = document.getElementsByClassName('li');
      const res = finder._findFromHTMLCollection(items);
      assert.deepEqual(res, [
        [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ],
        true,
        true
      ], 'result');
    });

    it('should match', () => {
      const finder = new Finder(window);
      finder._setup('.li', document);
      finder._prepareQuerySelectorWalker(document);
      const items = document.getElementsByClassName('li');
      const res = finder._findFromHTMLCollection(items, {
        targetType: 'first'
      });
      assert.deepEqual(res, [
        [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ],
        true,
        true
      ], 'result');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      finder._setup('ol', document);
      finder._prepareQuerySelectorWalker(document);
      const items = document.getElementsByTagName('ol');
      const res = finder._findFromHTMLCollection(items);
      assert.deepEqual(res, [
        [],
        false,
        false
      ], 'result');
    });

    it('should match', () => {
      const leaves = [
        {
          name: 'li',
          type: SELECTOR_TYPE
        },
        {
          children: null,
          name: 'last-child',
          type: SELECTOR_PSEUDO_CLASS
        }
      ];
      const finder = new Finder(window);
      finder._setup('li.li:last-child', document);
      finder._prepareQuerySelectorWalker(document);
      const items = document.getElementsByClassName('li');
      const res = finder._findFromHTMLCollection(items, {
        compound: true,
        filterLeaves: leaves
      });
      assert.deepEqual(res, [
        [document.getElementById('li3')],
        true,
        false
      ], 'result');
    });

    it('should match', () => {
      const leaves = [
        {
          name: 'li',
          type: SELECTOR_TYPE
        },
        {
          children: null,
          name: 'last-child',
          type: SELECTOR_PSEUDO_CLASS
        }
      ];
      const finder = new Finder(window);
      finder._setup('li.li:last-child', document);
      finder._prepareQuerySelectorWalker(document);
      const items = document.getElementsByClassName('li');
      const res = finder._findFromHTMLCollection(items, {
        compound: true,
        filterLeaves: leaves,
        targetType: 'first'
      });
      assert.deepEqual(res, [
        [document.getElementById('li3')],
        true,
        false
      ], 'result');
    });

    it('should match', () => {
      const leaves = [
        {
          name: 'li',
          type: SELECTOR_TYPE
        }
      ];
      const finder = new Finder(window);
      finder._setup('li.li + li.li', document);
      finder._prepareQuerySelectorWalker(document);
      const items = document.getElementsByClassName('li');
      const res = finder._findFromHTMLCollection(items, {
        complex: true,
        compound: true,
        filterLeaves: leaves
      });
      assert.deepEqual(res, [
        [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ],
        true,
        false
      ], 'result');
    });

    it('should match', () => {
      const leaves = [
        {
          name: 'li',
          type: SELECTOR_TYPE
        }
      ];
      const finder = new Finder(window);
      finder._setup('li.li + li.li', document);
      finder._prepareQuerySelectorWalker(document);
      const items = document.getElementsByClassName('li');
      const res = finder._findFromHTMLCollection(items, {
        complex: true,
        compound: true,
        filterLeaves: leaves,
        targetType: 'first'
      });
      assert.deepEqual(res, [
        [
          document.getElementById('li1')
        ],
        true,
        false
      ], 'result');
    });

    it('should match', () => {
      const finder = new Finder(window);
      finder._setup('.li + .li', document);
      finder._prepareQuerySelectorWalker(document);
      const items = document.getElementsByClassName('li');
      const res = finder._findFromHTMLCollection(items, {
        complex: true
      });
      assert.deepEqual(res, [
        [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ],
        true,
        true
      ], 'result');
    });

    it('should match', () => {
      const finder = new Finder(window);
      finder._setup('li.li + li.li', document);
      finder._prepareQuerySelectorWalker(document);
      const items = document.getElementsByClassName('li');
      const res = finder._findFromHTMLCollection(items, {
        complex: true,
        targetType: 'first'
      });
      assert.deepEqual(res, [
        [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ],
        true,
        true
      ], 'result');
    });

    it('should match', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder._setup('.li + .li', node);
      finder._prepareQuerySelectorWalker(node);
      const items = document.getElementsByClassName('li');
      const res = finder._findFromHTMLCollection(items, {
        complex: true
      });
      assert.deepEqual(res, [
        [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ],
        true,
        false
      ], 'result');
    });

    it('should match', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder._setup('.li + .li', node);
      finder._prepareQuerySelectorWalker(node);
      const items = document.getElementsByClassName('li');
      const res = finder._findFromHTMLCollection(items, {
        complex: true,
        targetType: 'first'
      });
      assert.deepEqual(res, [
        [
          document.getElementById('li1')
        ],
        true,
        false
      ], 'result');
    });

    it('should match', () => {
      const leaves = [
        {
          name: 'li',
          type: SELECTOR_TYPE
        },
        {
          children: null,
          name: 'last-child',
          type: SELECTOR_PSEUDO_CLASS
        }
      ];
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder._setup('li.li:last-child', node);
      finder._prepareQuerySelectorWalker(node);
      const items = document.getElementsByClassName('li');
      const res = finder._findFromHTMLCollection(items, {
        compound: true,
        filterLeaves: leaves
      });
      assert.deepEqual(res, [
        [document.getElementById('li3')],
        true,
        false
      ], 'result');
    });

    it('should match', () => {
      const leaves = [
        {
          name: 'li',
          type: SELECTOR_TYPE
        },
        {
          children: null,
          name: 'last-child',
          type: SELECTOR_PSEUDO_CLASS
        }
      ];
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder._setup('li.li:last-child', node);
      finder._prepareQuerySelectorWalker(node);
      const items = document.getElementsByClassName('li');
      const res = finder._findFromHTMLCollection(items, {
        compound: true,
        filterLeaves: leaves,
        targetType: 'first'
      });
      assert.deepEqual(res, [
        [document.getElementById('li3')],
        true,
        false
      ], 'result');
    });
  });

  describe('find entry nodes', () => {
    it('should not match', () => {
      const finder = new Finder(window);
      finder._setup('::before', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [twig] }]] = finder._correspond('::before');
      const res = finder._findEntryNodes(twig);
      assert.deepEqual([...res.nodes], [], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isFalse(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder._setup('#ul1', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [twig] }]] = finder._correspond('#ul1');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual([...res.nodes], [
        document.getElementById('ul1')
      ], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isTrue(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder._setup('#ul1', node);
      const [[{ branch: [twig] }]] = finder._correspond('#ul1');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual([...res.nodes], [
        node
      ], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isTrue(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should not match', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder._setup('#ul1', node);
      const [[{ branch: [twig] }]] = finder._correspond('#ul1');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual([...res.nodes], [], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isFalse(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should get matched node', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder._setup('#ul1', node);
      const [[{ branch: [twig] }]] = finder._correspond('#ul1');
      const res = finder._findEntryNodes(twig, 'lineal');
      assert.deepEqual([...res.nodes], [
        document.getElementById('ul1')
      ], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isTrue(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder._setup('#li1.li', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [twig] }]] = finder._correspond('#li1.li');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual([...res.nodes], [
        document.getElementById('li1')
      ], 'nodes');
      assert.isTrue(res.compound, 'compound');
      assert.isTrue(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should get matched node(s)', () => {
      const parent = document.createElement('ul');
      const node = document.createElement('li');
      node.id = 'li1';
      node.classList.add('li');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup('#li1.li', parent);
      finder._prepareQuerySelectorWalker(parent);
      const [[{ branch: [twig] }]] = finder._correspond('#li1.li');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual([...res.nodes], [
        node
      ], 'nodes');
      assert.isTrue(res.compound, 'compound');
      assert.isTrue(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      finder._setup('#li1.foobar', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [twig] }]] = finder._correspond('#li1.foobar');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual([...res.nodes], [], 'nodes');
      assert.isTrue(res.compound, 'compound');
      assert.isFalse(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder._setup('ul#ul1', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [twig] }]] = finder._correspond('ul#ul1');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual([...res.nodes], [
        document.getElementById('ul1')
      ], 'nodes');
      assert.isTrue(res.compound, 'compound');
      assert.isTrue(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      finder._setup('#foobar', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [twig] }]] = finder._correspond('#foobar');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual([...res.nodes], [], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isFalse(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should get matched node(s)', () => {
      const frag = document.createDocumentFragment();
      const node = document.createElement('div');
      node.id = 'foobar';
      frag.appendChild(node);
      const finder = new Finder(window);
      finder._setup('#foobar', frag);
      finder._prepareQuerySelectorWalker(frag);
      const [[{ branch: [twig] }]] = finder._correspond('#foobar');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual([...res.nodes], [
        node
      ], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isTrue(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should be pended', () => {
      const node = document.createElement('div');
      node.id = 'foobar';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup('#foobar', node);
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [twig] }]] = finder._correspond('#foobar');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual([...res.nodes], [], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isFalse(res.filtered, 'filtered');
      assert.isTrue(res.pending, 'pending');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder._setup('#li1:first-child', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [twig] }]] = finder._correspond('#li1:first-child');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual([...res.nodes], [
        document.getElementById('li1')
      ], 'nodes');
      assert.isTrue(res.compound, 'compound');
      assert.isTrue(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder._setup('.li', node);
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [twig] }]] = finder._correspond('.li');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual([...res.nodes], [
        document.getElementById('li1')
      ], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isTrue(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder._setup('.li', node);
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [twig] }]] = finder._correspond('.li');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual([...res.nodes], [
        document.getElementById('li1'),
        document.getElementById('li2'),
        document.getElementById('li3')
      ], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isTrue(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder._setup('.li', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [twig] }]] = finder._correspond('.li');
      const res = finder._findEntryNodes(twig);
      assert.deepEqual([...res.nodes], [
        document.getElementById('li1'),
        document.getElementById('li2'),
        document.getElementById('li3')
      ], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isTrue(res.filtered, 'filtered');
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
      const finder = new Finder(window);
      finder._setup('.foo', frag);
      finder._prepareQuerySelectorWalker(frag);
      const [[{ branch: [twig] }]] = finder._correspond('.foo');
      const res = finder._findEntryNodes(twig);
      assert.deepEqual([...res.nodes], [], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isFalse(res.filtered, 'filtered');
      assert.isTrue(res.pending, 'pending');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder._setup('li.li', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [twig] }]] = finder._correspond('li.li');
      const res = finder._findEntryNodes(twig);
      assert.deepEqual([...res.nodes], [
        document.getElementById('li1'),
        document.getElementById('li2'),
        document.getElementById('li3')
      ], 'nodes');
      assert.isTrue(res.compound, 'compound');
      assert.isTrue(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('dd2');
      const finder = new Finder(window);
      finder._setup('.dd', node);
      const [[{ branch: [twig] }]] = finder._correspond('.dd');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual([...res.nodes], [
        node
      ], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isTrue(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should not match', () => {
      const node = document.getElementById('span2');
      const finder = new Finder(window);
      finder._setup('.dd', node);
      const [[{ branch: [twig] }]] = finder._correspond('.dd');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual([...res.nodes], [], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isFalse(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('span2');
      const finder = new Finder(window);
      finder._setup('.dd', node);
      const [[{ branch: [twig] }]] = finder._correspond('.dd');
      const res = finder._findEntryNodes(twig, 'lineal');
      assert.deepEqual([...res.nodes], [
        document.getElementById('dd2')
      ], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isTrue(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should not match', () => {
      const node = document.getElementById('span2');
      const finder = new Finder(window);
      finder._setup('.li', node);
      const [[{ branch: [twig] }]] = finder._correspond('.li');
      const res = finder._findEntryNodes(twig, 'lineal');
      assert.deepEqual([...res.nodes], [], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isFalse(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should not match', () => {
      const node = document.getElementById('dd1');
      const finder = new Finder(window);
      finder._setup('.dd', node);
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [twig] }]] = finder._correspond('.dd');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual([...res.nodes], [], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isFalse(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder._setup('ul', node);
      const [[{ branch: [twig] }]] = finder._correspond('ul');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual([...res.nodes], [
        node
      ], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isTrue(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should not match', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder._setup('ul', node);
      const [[{ branch: [twig] }]] = finder._correspond('ul');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual([...res.nodes], [], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isFalse(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder._setup('ul', node);
      const [[{ branch: [twig] }]] = finder._correspond('ul');
      const res = finder._findEntryNodes(twig, 'lineal');
      assert.deepEqual([...res.nodes], [
        document.getElementById('ul1')
      ], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isTrue(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should not match', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder._setup('ol', node);
      const [[{ branch: [twig] }]] = finder._correspond('ol');
      const res = finder._findEntryNodes(twig, 'lineal');
      assert.deepEqual([...res.nodes], [], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isFalse(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder._setup('li', node);
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [twig] }]] = finder._correspond('li');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual([...res.nodes], [
        document.getElementById('li1')
      ], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isTrue(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder._setup('li:last-child', node);
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [twig] }]] = finder._correspond('li:last-child');
      const res = finder._findEntryNodes(twig);
      assert.deepEqual([...res.nodes], [
        document.getElementById('li3')
      ], 'nodes');
      assert.isTrue(res.compound, 'compound');
      assert.isTrue(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder._setup('li:first-child', node);
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [twig] }]] = finder._correspond('li:first-child');
      const res = finder._findEntryNodes(twig);
      assert.deepEqual([...res.nodes], [
        document.getElementById('li1')
      ], 'nodes');
      assert.isTrue(res.compound, 'compound');
      assert.isTrue(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should not match', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder._setup('li:first-child', node);
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [twig] }]] = finder._correspond('li:first-child');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual([...res.nodes], [], 'nodes');
      assert.isTrue(res.compound, 'compound');
      assert.isFalse(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should not match', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder._setup('dd:first-child', node);
      const [[{ branch: [twig] }]] = finder._correspond('dd:first-child');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual([...res.nodes], [], 'nodes');
      assert.isTrue(res.compound, 'compound');
      assert.isFalse(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder._setup('li.li:last-child', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [twig] }]] = finder._correspond('li.li:last-child');
      const res = finder._findEntryNodes(twig);
      assert.deepEqual([...res.nodes], [
        document.getElementById('li3')
      ], 'nodes');
      assert.isTrue(res.compound, 'compound');
      assert.isTrue(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder._setup('li.li:first-child + li.li', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [twig] }]] =
        finder._correspond('li.li:first-child + li.li');
      const res = finder._findEntryNodes(twig, 'all', true);
      assert.deepEqual([...res.nodes], [
        document.getElementById('li1')
      ], 'nodes');
      assert.isTrue(res.compound, 'compound');
      assert.isTrue(res.filtered, 'filtered');
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
      const finder = new Finder(window);
      finder._setup('.foo.bar', frag);
      finder._prepareQuerySelectorWalker(frag);
      const [[{ branch: [twig] }]] = finder._correspond('.foo.bar');
      const res = finder._findEntryNodes(twig);
      assert.deepEqual([...res.nodes], [], 'nodes');
      assert.isTrue(res.compound, 'compound');
      assert.isFalse(res.filtered, 'filtered');
      assert.isTrue(res.pending, 'pending');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      finder._setup('.foobar', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [twig] }]] = finder._correspond('.foobar');
      const res = finder._findEntryNodes(twig);
      assert.deepEqual([...res.nodes], [], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isFalse(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should get matched node(s)', () => {
      const frag = document.createDocumentFragment();
      const node = document.createElement('div');
      frag.appendChild(node);
      const finder = new Finder(window);
      finder._setup('div', frag);
      finder._prepareQuerySelectorWalker(frag);
      const [[{ branch: [twig] }]] = finder._correspond('div');
      const res = finder._findEntryNodes(twig);
      assert.deepEqual([...res.nodes], [], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isFalse(res.filtered, 'filtered');
      assert.isTrue(res.pending, 'pending');
    });

    it('should get matched node(s)', () => {
      const parent = document.createElement('div');
      const node = document.createElement('div');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup('div', parent);
      finder._prepareQuerySelectorWalker(parent);
      const [[{ branch: [twig] }]] = finder._correspond('div');
      const res = finder._findEntryNodes(twig);
      assert.deepEqual([...res.nodes], [], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isFalse(res.filtered, 'filtered');
      assert.isTrue(res.pending, 'pending');
    });

    it('should get matched node(s)', () => {
      const parent = document.createElement('div');
      parent.classList.add('foo');
      const node = document.createElement('div');
      node.classList.add('foo');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder._setup('.foo', node);
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [twig] }]] = finder._correspond('.foo');
      const res = finder._findEntryNodes(twig);
      assert.deepEqual([...res.nodes], [], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isFalse(res.filtered, 'filtered');
      assert.isTrue(res.pending, 'pending');
    });

    it('should not match', () => {
      const frag = document.createDocumentFragment();
      const node = document.createElement('div');
      frag.appendChild(node);
      const finder = new Finder(window);
      finder._setup('p', frag);
      finder._prepareQuerySelectorWalker(frag);
      const [[{ branch: [twig] }]] = finder._correspond('p');
      const res = finder._findEntryNodes(twig);
      assert.deepEqual([...res.nodes], [], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isFalse(res.filtered, 'filtered');
      assert.isTrue(res.pending, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder._setup(':first-child', node);
      const [[{ branch: [twig] }]] = finder._correspond(':first-child');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual([...res.nodes], [
        node
      ], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isTrue(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder._setup('[class]:first-child', node);
      const [[{ branch: [twig] }]] =
          finder._correspond('[class]:first-child');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual([...res.nodes], [
        node
      ], 'nodes');
      assert.isTrue(res.compound, 'compound');
      assert.isTrue(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });

    it('should be pended', () => {
      const finder = new Finder(window);
      finder._setup(':first-child', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [twig] }]] = finder._correspond(':first-child');
      const res = finder._findEntryNodes(twig);
      assert.deepEqual([...res.nodes], [], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isFalse(res.filtered, 'filtered');
      assert.isTrue(res.pending, 'pending');
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
      const finder = new Finder(window);
      finder._setup(':host div', node);
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [twig] }]] = finder._correspond(':host div');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual([...res.nodes], [
        node
      ], 'nodes');
      assert.isFalse(res.compound, 'compound');
      assert.isTrue(res.filtered, 'filtered');
      assert.isFalse(res.pending, 'pending');
    });
  });

  describe('collect nodes', () => {
    it('should get list and matrix', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder._setup('li:last-child, li:first-child + li', node);
      const res = finder._collectNodes('self');
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
            collected: false,
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
            collected: false,
            dir: 'prev',
            filtered: true,
            find: true
          }
        ],
        [
          [],
          [node]
        ]
      ], 'result');
    });

    it('should get list and matrix', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder._setup('li:last-child, li:first-child + li', node);
      const res = finder._collectNodes('lineal');
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
            collected: false,
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
            collected: false,
            dir: 'prev',
            filtered: true,
            find: true
          }
        ],
        [
          [],
          [node]
        ]
      ], 'result');
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder._setup('li:last-child, li:first-child + li', document);
      finder._prepareQuerySelectorWalker(document);
      const res = finder._collectNodes('first');
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
            collected: false,
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
            collected: false,
            dir: 'next',
            filtered: true,
            find: true
          }
        ],
        [
          [
            document.getElementById('li3')
          ],
          [
            document.getElementById('li1')
          ]
        ]
      ], 'result');
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder._setup('li:last-child, li:first-child + li', document);
      finder._prepareQuerySelectorWalker(document);
      const res = finder._collectNodes('all');
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
            collected: false,
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
            collected: true,
            dir: 'prev',
            filtered: true,
            find: true
          }
        ],
        [
          [
            document.getElementById('li3')
          ],
          [
            document.getElementById('li1'),
            document.getElementById('li2'),
            document.getElementById('li3')
          ]
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
      const finder = new Finder(window);
      finder._setup(':nth-child(2n), :nth-of-type(2n+3)', root);
      finder._prepareQuerySelectorWalker(root);
      const res = finder._collectNodes('all');
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
            collected: false,
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
                    type: SELECTOR_PSEUDO_CLASS
                  }
                ]
              }
            ],
            collected: false,
            dir: 'prev',
            filtered: true,
            find: true
          }
        ],
        [
          [div2, div4],
          [div3]
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
      const finder = new Finder(window);
      finder._setup(':nth-child(2n), :nth-of-type(2n+3)', frag);
      finder._prepareQuerySelectorWalker(frag);
      const res = finder._collectNodes('all');
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
            collected: false,
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
                    type: SELECTOR_PSEUDO_CLASS
                  }
                ]
              }
            ],
            collected: false,
            dir: 'prev',
            filtered: true,
            find: true
          }
        ],
        [
          [div2, div4],
          [div3]
        ]
      ], 'result');
    });

    it('should get list and matrix', () => {
      const doc =
          new window.DOMParser().parseFromString('<foo></foo>', 'text/xml');
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
      finder._setup('div', div2);
      const res = finder._collectNodes('self');
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
            collected: false,
            dir: 'prev',
            filtered: true,
            find: true
          }
        ],
        [
          [div2]
        ]
      ], 'result');
    });

    it('should get list and matrix', () => {
      const doc =
          new window.DOMParser().parseFromString('<foo></foo>', 'text/xml');
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
      finder._setup('root', div2);
      const res = finder._collectNodes('lineal');
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
            collected: false,
            dir: 'prev',
            filtered: true,
            find: true
          }
        ],
        [
          [root]
        ]
      ], 'result');
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder._setup('* > li', document);
      finder._prepareQuerySelectorWalker(document);
      const res = finder._collectNodes('all');
      assert.deepEqual(res, [
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
            ],
            collected: true,
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
      ], 'result');
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder._setup('* > li', document);
      finder._prepareQuerySelectorWalker(document);
      const res = finder._collectNodes('first');
      assert.deepEqual(res, [
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
            ],
            collected: true,
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
      ], 'result');
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder._setup('ul > *', document);
      finder._prepareQuerySelectorWalker(document);
      const res = finder._collectNodes('all');
      assert.deepEqual(res, [
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
                    type: SELECTOR_TYPE
                  }
                ]
              },
              {
                combo: null,
                leaves: [
                  {
                    loc: null,
                    name: '*',
                    type: SELECTOR_TYPE
                  }
                ]
              }
            ],
            collected: true,
            dir: 'next',
            filtered: true,
            find: true
          }
        ],
        [
          [
            document.getElementById('ul1')
          ]
        ]
      ], 'result');
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder._setup('ul > *', document);
      finder._prepareQuerySelectorWalker(document);
      const res = finder._collectNodes('first');
      assert.deepEqual(res, [
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
                    type: SELECTOR_TYPE
                  }
                ]
              },
              {
                combo: null,
                leaves: [
                  {
                    loc: null,
                    name: '*',
                    type: SELECTOR_TYPE
                  }
                ]
              }
            ],
            collected: true,
            dir: 'next',
            filtered: true,
            find: true
          }
        ],
        [
          [
            document.getElementById('ul1')
          ]
        ]
      ], 'result');
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder._setup('#ul1 > #li1', document);
      finder._prepareQuerySelectorWalker(document);
      const res = finder._collectNodes('all');
      assert.deepEqual(res, [
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
                    type: SELECTOR_ID
                  }
                ]
              },
              {
                combo: null,
                leaves: [
                  {
                    loc: null,
                    name: 'li1',
                    type: SELECTOR_ID
                  }
                ]
              }
            ],
            collected: false,
            dir: 'prev',
            filtered: true,
            find: true
          }
        ],
        [
          [
            document.getElementById('li1')
          ]
        ]
      ], 'result');
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder._setup('ul > #li1', document);
      finder._prepareQuerySelectorWalker(document);
      const res = finder._collectNodes('all');
      assert.deepEqual(res, [
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
                    type: SELECTOR_TYPE
                  }
                ]
              },
              {
                combo: null,
                leaves: [
                  {
                    loc: null,
                    name: 'li1',
                    type: SELECTOR_ID
                  }
                ]
              }
            ],
            collected: false,
            dir: 'prev',
            filtered: true,
            find: true
          }
        ],
        [
          [
            document.getElementById('li1')
          ]
        ]
      ], 'result');
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder._setup('#ul1 > li', document);
      finder._prepareQuerySelectorWalker(document);
      const res = finder._collectNodes('all');
      assert.deepEqual(res, [
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
                    type: SELECTOR_ID
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
            collected: false,
            dir: 'next',
            filtered: true,
            find: true
          }
        ],
        [
          [
            document.getElementById('ul1')
          ]
        ]
      ], 'result');
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder._setup('ul > li::after', document);
      finder._prepareQuerySelectorWalker(document);
      const res = finder._collectNodes('all');
      assert.deepEqual(res, [
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
                    type: SELECTOR_TYPE
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
                    type: SELECTOR_PSEUDO_ELEMENT
                  },
                  {
                    loc: null,
                    name: 'li',
                    type: SELECTOR_TYPE
                  }
                ]
              }
            ],
            collected: false,
            dir: 'prev',
            filtered: false,
            find: false
          }
        ],
        [
          []
        ]
      ], 'result');
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder._setup('ul::before > li', document);
      finder._prepareQuerySelectorWalker(document);
      const res = finder._collectNodes('all');
      assert.deepEqual(res, [
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
                    type: SELECTOR_PSEUDO_ELEMENT
                  },
                  {
                    loc: null,
                    name: 'ul',
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
            ],
            collected: false,
            dir: 'next',
            filtered: false,
            find: false
          }
        ],
        [
          []
        ]
      ], 'result');
    });
  });

  describe('get combined nodes', () => {
    it('should get matched nodes', () => {
      const finder = new Finder(window);
      finder._setup('ul > li', document);
      const twig = {
        combo: {
          name: '>'
        },
        leaves: [
          {
            name: 'ul',
            type: SELECTOR_TYPE
          }
        ]
      };
      const nodes = new Set([
        document.getElementById('li1')
      ]);
      const res = finder._getCombinedNodes(twig, nodes, 'prev');
      assert.deepEqual([...res], [
        document.getElementById('ul1')
      ], 'result');
    });

    it('should get matched nodes', () => {
      const finder = new Finder(window);
      finder._setup('ul > li', document);
      const twig = {
        combo: {
          name: '>'
        },
        leaves: [
          {
            name: 'li',
            type: SELECTOR_TYPE
          }
        ]
      };
      const nodes = new Set([
        document.getElementById('ul1')
      ]);
      const res = finder._getCombinedNodes(twig, nodes, 'next');
      assert.deepEqual([...res], [
        document.getElementById('li1'),
        document.getElementById('li2'),
        document.getElementById('li3')
      ], 'result');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      finder._setup('ol > li', document);
      const twig = {
        combo: {
          name: '>'
        },
        leaves: [
          {
            name: 'ol',
            type: SELECTOR_TYPE
          }
        ]
      };
      const nodes = new Set([
        document.getElementById('li1')
      ]);
      const res = finder._getCombinedNodes(twig, nodes, 'prev');
      assert.deepEqual([...res], [], 'result');
    });
  });

  describe('match node to next direction', () => {
    it('should get matched node(s)', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder._setup('ul > .li ~ li', document);
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
      finder._setup('ul > .li ~ li:last-child', document);
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
      finder._setup('ul > .li ~ li.foo', document);
      const [[{ branch }]] = finder._correspond('ul > .li ~ li.foo');
      const res = finder._matchNodeNext(branch, new Set([node]), {
        combo: {
          name: '>'
        },
        index: 1
      });
      assert.isNull(res, 'result');
    });

    it('should not match', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder._setup('ul > li.foo ~ li', document);
      const [[{ branch }]] = finder._correspond('ul > li.foo ~ li');
      const res = finder._matchNodeNext(branch, new Set([node]), {
        combo: {
          name: '>'
        },
        index: 1
      });
      assert.isNull(res, 'result');
    });
  });

  describe('match node to previous direction', () => {
    it('should get matched node(s)', () => {
      const node = document.getElementById('li2');
      const finder = new Finder(window);
      finder._setup('ul > .li ~ li', document);
      const [[{ branch }]] = finder._correspond('ul > .li ~ li');
      const res = finder._matchNodePrev(branch, node, {
        index: 1
      });
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const node = document.getElementById('li2');
      const finder = new Finder(window);
      finder._setup('ol > .li ~ li', document);
      const [[{ branch }]] = finder._correspond('ol > .li ~ li');
      const res = finder._matchNodePrev(branch, node, {
        index: 1
      });
      assert.isNull(res, 'result');
    });
  });

  describe('find matched nodes', () => {
    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder._setup('li:last-child, li:first-child + li', document);
      const res = finder._find('all');
      assert.deepEqual([...res], [
        document.getElementById('li3'),
        document.getElementById('li2')
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('li2');
      const finder = new Finder(window);
      finder._setup('li:last-child, li:first-child + li', node);
      const res = finder._find('self');
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder._setup('li:last-child, li:first-child + li', node);
      const res = finder._find('self');
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      finder._setup('ul:nth-child(2) > li, li:nth-child(4) + li', document);
      const res = finder._find('all');
      assert.deepEqual([...res], [], 'all');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder._setup('ol > .li ~ li, ul > .li ~ li', document);
      const res = finder._find('first');
      assert.deepEqual([...res], [
        document.getElementById('li2')
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
      const finder = new Finder(window);
      finder._setup('span', root);
      const res = finder._find('first');
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
      const finder = new Finder(window);
      finder._setup('div > p > span', root);
      const res = finder._find('all');
      assert.deepEqual([...res], [
        span,
        span2
      ], 'result');
    });

    it('should not match', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder._setup('li:active', node);
      finder._prepareQuerySelectorWalker(node);
      finder._collectNodes('all');
      const res = finder._find('all');
      assert.deepEqual([...res], [], 'result');
    });
  });

  describe('matches', () => {
    it('should throw', () => {
      assert.throws(() => new Finder(window).matches());
    });

    it('should get true', () => {
      const node = document.createElement(null);
      const res = new Finder(window).matches(null, node);
      assert.isTrue(res, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('div');
      const res = new Finder(window).matches(null, node);
      assert.isFalse(res, 'result');
    });

    it('should get true', () => {
      const node = document.createElement(undefined);
      const res = new Finder(window).matches(undefined, node);
      assert.isTrue(res, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('div');
      const res = new Finder(window).matches(undefined, node);
      assert.isFalse(res, 'result');
    });

    it('should throw', () => {
      assert.throws(() => new Finder(window).matches('body', document),
        'Unexpected node #document');
    });

    it('should throw', () => {
      assert.throws(() => new Finder(window)
        .matches('[foo=bar baz]', document.body));
    });

    it('should warn', () => {
      const stubWarn = sinon.stub(console, 'warn');
      const node = document.getElementById('li2');
      const finder = new Finder(window);
      const res = finder.matches('li:blank', node, {
        warn: true
      });
      const { called } = stubWarn;
      stubWarn.restore();
      assert.isTrue(called, 'warn');
      assert.isFalse(res, 'result');
    });

    it('should get true', () => {
      const node = document.getElementById('li2');
      const finder = new Finder(window);
      const res = finder.matches('li', node);
      assert.isTrue(res, 'result');
    });

    it('should get true', () => {
      const node = document.getElementById('li2');
      const finder = new Finder(window);
      const res = finder.matches('ul > li', node);
      assert.isTrue(res, 'result');
    });

    it('should get true', () => {
      const node = document.getElementById('li2');
      const finder = new Finder(window);
      const res = finder.matches('#li2', node);
      assert.isTrue(res, 'result');
    });

    it('should get true', () => {
      const node = document.getElementById('li2');
      const finder = new Finder(window);
      const res = finder.matches('ul > li:nth-child(2n)', node);
      assert.isTrue(res, 'result');
    });

    it('should get false', () => {
      const node = document.getElementById('li2');
      const finder = new Finder(window);
      const res = finder.matches('ul > li:nth-child(2n+1)', node);
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
      const finder = new Finder(window);
      const res = finder.matches('#main p', p1);
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
      const finder = new Finder(window);
      const res = finder.matches('#main p:not(.foo)', p2);
      assert.isTrue(res, 'result');
    });
  });

  describe('closest', () => {
    it('should throw', () => {
      assert.throws(() => new Finder(window).closest('body', document),
        'Unexpected node #document');
    });

    it('should throw', () => {
      assert.throws(() => new Finder(window)
        .closest('[foo=bar baz]', document.getElementById('div0')));
    });

    it('should warn', () => {
      const stubWarn = sinon.stub(console, 'warn');
      const node = document.getElementById('li2');
      const finder = new Finder(window);
      const res = finder.closest('ul:blank', node, {
        warn: true
      });
      const { called } = stubWarn;
      stubWarn.restore();
      assert.isTrue(called, 'warn');
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const node = document.getElementById('li2');
      const target = document.getElementById('div2');
      const finder = new Finder(window);
      const res = finder.closest('div', node);
      assert.deepEqual(res, target, 'result');
    });

    it('should get matched node', () => {
      const node = document.getElementById('li2');
      const target = document.getElementById('div1');
      const finder = new Finder(window);
      const res = finder.closest('body > div', node);
      assert.deepEqual(res, target, 'result');
    });

    it('should not match', () => {
      const node = document.getElementById('li2');
      const finder = new Finder(window);
      const res = finder.closest('dl', node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const node = document.getElementById('li2');
      const finder = new Finder(window);
      const res = finder.closest(':has(:scope)', node);
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
      const res = new Finder(window).closest(':nth-child(2n+1 of .noted)', p7);
      assert.deepEqual(res, l7, 'result');
    });
  });

  describe('querySelector', () => {
    it('should throw', () => {
      assert.throws(() => new Finder(window)
        .querySelector('[foo=bar baz]', document));
    });

    it('should warn', () => {
      const stubWarn = sinon.stub(console, 'warn');
      const node = document.getElementById('div1');
      const finder = new Finder(window);
      const res = finder.querySelector('dt:blank', node, {
        warn: true
      });
      const { called } = stubWarn;
      stubWarn.restore();
      assert.isTrue(called, 'warn');
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const node = document.getElementById('div1');
      const target = document.getElementById('dt1');
      const finder = new Finder(window);
      const res = finder.querySelector('#dt1', node);
      assert.deepEqual(res, target, 'result');
    });

    it('should get matched node', () => {
      const node = document.getElementById('div1');
      const target = document.getElementById('dt1');
      const finder = new Finder(window);
      const res = finder.querySelector('dt', node);
      assert.deepEqual(res, target, 'result');
    });

    it('should get matched node', () => {
      const target = document.getElementById('dt1');
      const finder = new Finder(window);
      const res = finder.querySelector('dt', document);
      assert.deepEqual(res, target, 'result');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      const res = finder.querySelector('ol', document);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const refPoint = document.getElementById('dl1');
      const target = document.getElementById('dt1');
      const finder = new Finder(window);
      const res = finder.querySelector('*', refPoint);
      assert.deepEqual(res, target, 'result');
    });

    it('should get matched node', () => {
      const refPoint = document.getElementById('dl1');
      const target = document.getElementById('dt1');
      const finder = new Finder(window);
      const res = finder.querySelector('body #dt1', refPoint);
      assert.deepEqual(res, target, 'result');
    });

    it('should get matched node', () => {
      const target = document.getElementById('li1');
      const finder = new Finder(window);
      const res = finder.querySelector('.li', document);
      assert.deepEqual(res, target, 'result');
    });

    it('should get matched node', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const root = node.attachShadow({ mode: 'open' });
      root.innerHTML = '<div></div><div></div>';
      const finder = new Finder(window);
      const res = finder.querySelector(':host div', root);
      assert.deepEqual(res, root.firstElementChild, 'result');
    });

    it('should get matched node', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const root = node.attachShadow({ mode: 'open' });
      root.innerHTML = '<div></div><div></div>';
      const finder = new Finder(window);
      const res = finder.querySelector(':host div + div', root);
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
      const finder = new Finder(window);
      const res = finder.querySelector('.foo + .foo + .foo:last-child', parent);
      assert.deepEqual(res, node5, 'result');
    });

    it('should get matched node', () => {
      const node = document.getElementById('li2');
      const finder = new Finder(window);
      const res = finder.querySelector('li ~ li', document);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const node = document.createElement('div');
      const child = document.createElement('div');
      child.classList.add('foo');
      child.setAttribute('data-bar', 'Baz');
      node.appendChild(child);
      const finder = new Finder(window);
      const res = finder.querySelector('.foo[data-bar=baz i]', node);
      assert.deepEqual(res, child, 'result');
    });

    it('should get matched node', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      const res = finder.querySelector(':nth-child(even)', node);
      assert.deepEqual(res, document.getElementById('li2'), 'result');
    });
  });

  describe('querySelectorAll', () => {
    it('should throw', () => {
      assert.throws(() => new Finder(window)
        .querySelectorAll('[foo=bar baz]', document));
    });

    it('should warn', () => {
      const stubWarn = sinon.stub(console, 'warn');
      const node = document.getElementById('div1');
      const finder = new Finder(window);
      const res = finder.querySelectorAll('dt:blank', node, {
        warn: true
      });
      const { called } = stubWarn;
      stubWarn.restore();
      assert.isTrue(called, 'warn');
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('div1');
      const finder = new Finder(window);
      const res = finder.querySelectorAll('dt', node);
      assert.deepEqual(res, [
        document.getElementById('dt1'),
        document.getElementById('dt2'),
        document.getElementById('dt3')
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      const res = finder.querySelectorAll('dt', document);
      assert.deepEqual(res, [
        document.getElementById('dt1'),
        document.getElementById('dt2'),
        document.getElementById('dt3')
      ], 'result');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      const res = finder.querySelectorAll('ol', document);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const refPoint = document.getElementById('dl1');
      const finder = new Finder(window);
      const res = finder.querySelectorAll('*', refPoint);
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
      const finder = new Finder(window);
      const res = finder.querySelectorAll('body #dt1', refPoint);
      assert.deepEqual(res, [target], 'result');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      const res = finder.querySelectorAll('.li', document);
      assert.deepEqual(res, [
        document.getElementById('li1'),
        document.getElementById('li2'),
        document.getElementById('li3')
      ], 'result');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      const res = finder.querySelectorAll('ul.li + .li', document);
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      const res = finder.querySelectorAll('::slotted(foo)', document);
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      const res = finder.querySelectorAll('::slotted(foo', document);
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
      const finder = new Finder(window);
      const res = finder.querySelectorAll(':nth-child(n of .div)', root);
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
      const finder = new Finder(window);
      const res = finder.querySelectorAll(':host div', root);
      assert.deepEqual(res, [
        root.firstElementChild,
        root.lastElementChild
      ], 'result');
    });
  });
});
