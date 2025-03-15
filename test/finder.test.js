/**
 * finder.test.js
 */

/* api */
import { strict as assert } from 'node:assert';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, it, xit } from 'mocha';
import sinon from 'sinon';

/* test */
import { Finder } from '../src/js/finder.js';

/* constants */
import {
  ATTR_SELECTOR, CLASS_SELECTOR, COMBINATOR, IDENT, ID_SELECTOR,
  NOT_SUPPORTED_ERR, NTH, OPERATOR, PS_CLASS_SELECTOR, PS_ELEMENT_SELECTOR,
  SELECTOR, SYNTAX_ERR, TYPE_SELECTOR
} from '../src/js/constant.js';
const AN_PLUS_B = 'AnPlusB';
const RAW = 'Raw';
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
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
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
        invalidate: true
      });
      assert.deepEqual(res, finder, 'result');
    });
  });

  describe('register event listeners', () => {
    it('should register listeners', () => {
      const finder = new Finder(window);
      const res = finder._registerEventListeners();
      assert.deepEqual(res, [
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      ], 'result');
    });
  });

  describe('correspond ast and nodes', () => {
    it('should throw', () => {
      const finder = new Finder(window);
      finder.setup('*', document);
      assert.throws(
        () => finder._correspond('[foo==bar]'),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Identifier is expected', 'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      const finder = new Finder(window);
      finder.setup('*', document);
      assert.throws(
        () => finder._correspond('li ++ li'),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector li ++ li', 'message');
          return true;
        }
      );
    });

    it('should get result', () => {
      const finder = new Finder(window);
      finder.setup('*', document);
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
      finder.setup('li:last-child, li:first-child + li', document);
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
      finder.setup('*', document);
      const res = finder._createTreeWalker(document);
      assert.deepEqual(res.root, document, 'root');
    });

    it('should get tree walker', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('*', node);
      const res = finder._createTreeWalker(node);
      assert.deepEqual(res.root, node, 'root');
    });

    it('should get tree walker', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('*', node);
      const res = finder._createTreeWalker(node, {
        whatToShow: 0xFFFFFFFF
      });
      assert.deepEqual(res.root, node, 'root');
    });
  });

  describe('prepare querySelector walker', () => {
    it('should get tree walker', () => {
      const finder = new Finder(window);
      finder.setup('*', document);
      const res = finder._prepareQuerySelectorWalker(document);
      assert.deepEqual(res.root, document, 'walker');
    });

    it('should get tree walker', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('*', node);
      const res = finder._prepareQuerySelectorWalker(document);
      assert.deepEqual(res.root, node, 'walker');
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
      finder.setup(':nth-child(-1)', node);
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
      finder.setup(':nth-last-child(6)', node);
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
      finder.setup(':nth-last-child(-1n)', node);
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
      finder.setup(':nth-child(0)', node);
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
      finder.setup(':nth-last-child(0)', node);
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
      finder.setup(':nth-child(1)', node);
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
      finder.setup(':nth-last-child(1)', node);
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
      finder.setup(':nth-child(1n)', node);
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
      finder.setup(':nth-child(1n+1)', node);
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
      finder.setup(':nth-child(2n)', node);
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
      finder.setup(':nth-child(2n+1)', node);
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
      finder.setup(':nth-last-child(2n+1)', node);
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
      finder.setup(':nth-last-child(2n-1)', node);
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
      const finder = new Finder(window);
      finder.setup(':nth-child(2 of .noted)', l1);
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
      const finder = new Finder(window);
      finder.setup(':nth-child(2 of .noted)', l1);
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
      const finder = new Finder(window);
      finder.setup(':nth-last-child(2 of .noted)', l1);
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
      const finder = new Finder(window);
      finder.setup(':nth-child(2n of .noted)', l1);
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
      const finder = new Finder(window);
      finder.setup(':nth-child(2n+1 of .noted)', l1);
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
      const finder = new Finder(window);
      finder.setup(':nth-child(-n+3 of .noted)', l1);
      const res = finder._collectNthChild(anb, l1);
      assert.strictEqual(res.size, 3, 'size');
      assert.deepEqual([...res], [
        l2,
        l4,
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
      l1.id = 'l1'; // odd
      l2.id = 'l2'; // hidden
      l3.id = 'l3'; // even
      l4.id = 'l4'; // hidden
      l5.id = 'l5'; // odd
      l6.id = 'l6'; // even
      l7.id = 'l7'; // hidden
      l8.id = 'l8'; // odd
      l9.id = 'l9'; // even
      l10.id = 'l10'; // hidden
      l2.hidden = true;
      l4.hidden = true;
      l7.hidden = true;
      l10.hidden = true;
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
                  children: [
                    {
                      children: [
                        {
                          children: [
                            {
                              flags: null,
                              loc: null,
                              matcher: null,
                              name: {
                                loc: null,
                                name: 'hidden',
                                type: IDENT
                              },
                              type: ATTR_SELECTOR,
                              value: null
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
                  type: PS_CLASS_SELECTOR
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
      finder.setup(':nth-child(odd of :not([hidden]))', l1);
      const res = finder._collectNthChild(anb, l1);
      assert.strictEqual(res.size, 3, 'size');
      assert.deepEqual([...res], [
        l1,
        l5,
        l8
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
      l1.id = 'l1'; // odd
      l2.id = 'l2'; // hidden
      l3.id = 'l3'; // even
      l4.id = 'l4'; // hidden
      l5.id = 'l5'; // odd
      l6.id = 'l6'; // even
      l7.id = 'l7'; // hidden
      l8.id = 'l8'; // odd
      l9.id = 'l9'; // even
      l10.id = 'l10'; // hidden
      l2.hidden = true;
      l4.hidden = true;
      l7.hidden = true;
      l10.hidden = true;
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
                  children: [
                    {
                      children: [
                        {
                          children: [
                            {
                              flags: null,
                              loc: null,
                              matcher: null,
                              name: {
                                loc: null,
                                name: 'hidden',
                                type: IDENT
                              },
                              type: ATTR_SELECTOR,
                              value: null
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
                  type: PS_CLASS_SELECTOR
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
      finder.setup(':nth-child(even of :not([hidden]))', l1);
      const res = finder._collectNthChild(anb, l1);
      assert.strictEqual(res.size, 3, 'size');
      assert.deepEqual([...res], [
        l3,
        l6,
        l9
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
      l1.id = 'l1'; // odd
      l2.id = 'l2'; // none
      l3.id = 'l3'; // even
      l4.id = 'l4'; // none
      l5.id = 'l5'; // odd
      l6.id = 'l6'; // even
      l7.id = 'l7'; // none
      l8.id = 'l8'; // odd
      l9.id = 'l9'; // even
      l10.id = 'l10'; // none
      l2.style.display = 'none';
      l4.style.display = 'none';
      l7.style.display = 'none';
      l10.style.display = 'none';
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
                  children: [
                    {
                      children: [
                        {
                          children: [
                            {
                              flags: null,
                              loc: null,
                              matcher: null,
                              name: {
                                loc: null,
                                name: 'hidden',
                                type: IDENT
                              },
                              type: ATTR_SELECTOR,
                              value: null
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
                  type: PS_CLASS_SELECTOR
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
      finder.setup(':nth-child(odd of :not([hidden]))', l1);
      const res = finder._collectNthChild(anb, l1);
      assert.strictEqual(res.size, 3, 'size');
      assert.deepEqual([...res], [
        l1,
        l5,
        l8
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
      l1.id = 'l1'; // odd
      l2.id = 'l2'; // none
      l3.id = 'l3'; // even
      l4.id = 'l4'; // none
      l5.id = 'l5'; // odd
      l6.id = 'l6'; // even
      l7.id = 'l7'; // none
      l8.id = 'l8'; // odd
      l9.id = 'l9'; // even
      l10.id = 'l10'; // none
      l2.style.display = 'none';
      l4.style.display = 'none';
      l7.style.display = 'none';
      l10.style.display = 'none';
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
                  children: [
                    {
                      children: [
                        {
                          children: [
                            {
                              flags: null,
                              loc: null,
                              matcher: null,
                              name: {
                                loc: null,
                                name: 'hidden',
                                type: IDENT
                              },
                              type: ATTR_SELECTOR,
                              value: null
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
                  type: PS_CLASS_SELECTOR
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
      finder.setup(':nth-child(even of :not([hidden]))', l1);
      const res = finder._collectNthChild(anb, l1);
      assert.strictEqual(res.size, 3, 'size');
      assert.deepEqual([...res], [
        l3,
        l6,
        l9
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
      l1.id = 'l1'; // odd
      l2.id = 'l2'; // hidden
      l3.id = 'l3'; // even
      l4.id = 'l4'; // hidden
      l5.id = 'l5'; // odd
      l6.id = 'l6'; // even
      l7.id = 'l7'; // hidden
      l8.id = 'l8'; // odd
      l9.id = 'l9'; // even
      l10.id = 'l10'; // hidden
      l2.style.visibility = 'hidden';
      l4.style.visibility = 'hidden';
      l7.style.visibility = 'hidden';
      l10.style.visibility = 'hidden';
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
                  children: [
                    {
                      children: [
                        {
                          children: [
                            {
                              flags: null,
                              loc: null,
                              matcher: null,
                              name: {
                                loc: null,
                                name: 'hidden',
                                type: IDENT
                              },
                              type: ATTR_SELECTOR,
                              value: null
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
                  type: PS_CLASS_SELECTOR
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
      finder.setup(':nth-child(odd of :not([hidden]))', l1);
      const res = finder._collectNthChild(anb, l1);
      assert.strictEqual(res.size, 3, 'size');
      assert.deepEqual([...res], [
        l1,
        l5,
        l8
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
      l1.id = 'l1'; // odd
      l2.id = 'l2'; // hidden
      l3.id = 'l3'; // even
      l4.id = 'l4'; // hidden
      l5.id = 'l5'; // odd
      l6.id = 'l6'; // even
      l7.id = 'l7'; // hidden
      l8.id = 'l8'; // odd
      l9.id = 'l9'; // even
      l10.id = 'l10'; // hidden
      l2.style.visibility = 'hidden';
      l4.style.visibility = 'hidden';
      l7.style.visibility = 'hidden';
      l10.style.visibility = 'hidden';
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
                  children: [
                    {
                      children: [
                        {
                          children: [
                            {
                              flags: null,
                              loc: null,
                              matcher: null,
                              name: {
                                loc: null,
                                name: 'hidden',
                                type: IDENT
                              },
                              type: ATTR_SELECTOR,
                              value: null
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
                  type: PS_CLASS_SELECTOR
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
      finder.setup(':nth-child(even of :not([hidden]))', l1);
      const res = finder._collectNthChild(anb, l1);
      assert.strictEqual(res.size, 3, 'size');
      assert.deepEqual([...res], [
        l3,
        l6,
        l9
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
      finder.setup(':nth-child(1)', node);
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
      finder.setup(':nth-child(n)', node);
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
      finder.setup(':nth-child(2n+1)', node);
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
      const finder = new Finder(window);
      finder.setup(':nth-child(1 of .noted)', node);
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
      const finder = new Finder(window);
      finder.setup(':nth-child(1 of .noted)', node);
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
      const finder = new Finder(window);
      finder.setup(':nth-child(1 of .noted), :nth-last-child(n of .noted',
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
      finder.setup(':nth-of-type(-1)', node);
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
      finder.setup(':nth-last-of-type(6)', node);
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
      finder.setup(':nth-of-type(-1n)', node);
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
      finder.setup(':nth-of-type(0)', node);
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
      finder.setup(':nth-of-type(1)', node);
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
      finder.setup(':nth-last-of-type(1)', node);
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
      finder.setup(':nth-of-type(2)', node);
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
      finder.setup(':nth-of-type(3)', node);
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
      finder.setup(':nth-of-type(n)', node);
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
      finder.setup(':nth-of-type(n+1)', node);
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
      finder.setup(':nth-of-type(n-1)', node);
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
      finder.setup(':nth-of-type(2n)', node);
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
      finder.setup(':nth-of-type(2n+1)', node);
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
      finder.setup(':nth-last-of-type(2n+1)', node);
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
      finder.setup(':nth-of-type(-n+2)', node);
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
      finder.setup(':nth-of-type(n)', node);
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
      finder.setup(':nth-of-type(1)', node);
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
      finder.setup(':nth-of-type(2n+1)', node);
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
          type: IDENT
        },
        selector: null,
        type: NTH
      };
      const node = document.getElementById('dt1');
      const finder = new Finder(window);
      finder.setup(':nth-child(even)', node);
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
          type: IDENT
        },
        selector: null,
        type: NTH
      };
      const node = document.getElementById('dt1');
      const finder = new Finder(window);
      finder.setup(':nth-child(odd)', node);
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
          type: IDENT
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
      const finder = new Finder(window);
      finder.setup('dt:nth-child(odd)', node);
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
          type: IDENT
        },
        selector: null,
        type: NTH
      };
      const node = document.getElementById('dt1');
      const finder = new Finder(window);
      finder.setup(':nth-last-child(even)', node);
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
      finder.setup(':nth-child(3n+1)', node);
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
      finder.setup(':nth-child(2n)', node);
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
      finder.setup(':nth-child(3)', node);
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
      finder.setup(':nth-child(1)', node);
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
      finder.setup(':nth-last-child(3n+1)', node);
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
          type: IDENT
        },
        selector: null,
        type: NTH
      };
      const node = document.getElementById('dt1');
      const finder = new Finder(window);
      finder.setup(':nth-of-type(even)', node);
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
          type: IDENT
        },
        selector: null,
        type: NTH
      };
      const node = document.getElementById('dt1');
      const finder = new Finder(window);
      finder.setup(':nth-of-type(odd)', node);
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
          type: IDENT
        },
        selector: null,
        type: NTH
      };
      const node = document.getElementById('dt1');
      const finder = new Finder(window);
      finder.setup(':nth-last-of-type(even)', node);
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
      finder.setup(':nth-of-type(3n+1)', node);
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
      finder.setup(':nth-of-type(2n)', node);
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
      finder.setup(':nth-of-type(3)', node);
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
      finder.setup(':nth-last-of-type(3n+1)', node);
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
      finder.setup(':nth-foo(3n+1)', node);
      const res = finder._matchAnPlusB(leaf, node, leafName);
      assert.strictEqual(res.size, 0, 'size');
      assert.deepEqual([...res], [], 'result');
    });
  });

  describe('match :has() pseudo-class function', () => {
    it('should not match', () => {
      const node = document.getElementById('ul1');
      const leaves = [];
      const finder = new Finder(window);
      finder.setup(':has()', node);
      const res = finder._matchHasPseudoFunc(leaves, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const node = document.getElementById('dl1');
      const leaves = [{
        name: 'li',
        type: TYPE_SELECTOR
      }];
      const finder = new Finder(window);
      finder.setup(':has(li)', node);
      const res = finder._matchHasPseudoFunc(leaves, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const node = document.getElementById('dl1');
      const leaves = [{
        name: 'dd',
        type: TYPE_SELECTOR
      }];
      const finder = new Finder(window);
      finder.setup(':has(dd)', node);
      const res = finder._matchHasPseudoFunc(leaves, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const node = document.getElementById('dl1');
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
      const finder = new Finder(window);
      finder.setup(':has(dd p)', node);
      const res = finder._matchHasPseudoFunc(leaves, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const node = document.getElementById('dl1');
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
      const finder = new Finder(window);
      finder.setup(':has(dd span)', node);
      const res = finder._matchHasPseudoFunc(leaves, node, {});
      assert.strictEqual(res, true, 'result');
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
            type: TYPE_SELECTOR
          }
        ]
      ];
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup(':has(> li)', node);
      const res = finder._matchLogicalPseudoFunc({
        astName: 'has',
        branches
      }, node, {});
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
            type: TYPE_SELECTOR
          },
          {
            loc: null,
            name: 'li',
            type: CLASS_SELECTOR
          }
        ]
      ];
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup(':has(> li.li)', node);
      const res = finder._matchLogicalPseudoFunc({
        astName: 'has',
        branches
      }, node, {});
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
            type: TYPE_SELECTOR
          }
        ]
      ];
      const node = document.getElementById('dl1');
      const finder = new Finder(window);
      finder.setup(':has(> li)', node);
      const res = finder._matchLogicalPseudoFunc({
        astName: 'has',
        branches
      }, node, {});
      assert.deepEqual(res, null, 'result');
    });

    it('should get matched node', () => {
      const branches = [
        [
          {
            loc: null,
            name: 'li',
            type: TYPE_SELECTOR
          }
        ]
      ];
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup(':has(li)', node);
      const res = finder._matchLogicalPseudoFunc({
        astName: 'has',
        branches
      }, node, {});
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const branches = [
        [
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
        ]
      ];
      const node = document.getElementById('dl1');
      const finder = new Finder(window);
      finder.setup(':has(dd > span)', node);
      const res = finder._matchLogicalPseudoFunc({
        astName: 'has',
        branches
      }, node, {});
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
            type: PS_CLASS_SELECTOR
          }
        ]
      ];
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup(':has(:has(li))', node);
      const res = finder._matchLogicalPseudoFunc({
        astName: 'has',
        branches
      }, node, {});
      assert.deepEqual(res, null, 'result');
    });

    it('should get matched node', () => {
      const branches = [
        [
          {
            loc: null,
            name: 'ol',
            type: TYPE_SELECTOR
          }
        ],
        [
          {
            loc: null,
            name: 'dl',
            type: TYPE_SELECTOR
          }
        ]
      ];
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup(':not(ol, dl)', node);
      const res = finder._matchLogicalPseudoFunc({
        astName: 'not',
        branches,
        twigBranches: [
          [
            {
              combo: null,
              leaves: [
                {
                  loc: null,
                  name: 'ol',
                  type: TYPE_SELECTOR
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
                  type: TYPE_SELECTOR
                }
              ]
            }
          ]
        ]
      }, node, {});
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const branches = [
        [
          {
            loc: null,
            name: 'ul',
            type: TYPE_SELECTOR
          }
        ],
        [
          {
            loc: null,
            name: 'dl',
            type: TYPE_SELECTOR
          }
        ]
      ];
      const node = document.getElementById('dl1');
      const finder = new Finder(window);
      finder.setup(':not(ul, dl)', node);
      const res = finder._matchLogicalPseudoFunc({
        astName: 'not',
        branches,
        twigBranches: [
          [
            {
              combo: null,
              leaves: [
                {
                  loc: null,
                  name: 'ul',
                  type: TYPE_SELECTOR
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
                  type: TYPE_SELECTOR
                }
              ]
            }
          ]
        ]
      }, node, {});
      assert.deepEqual(res, null, 'result');
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
            type: PS_CLASS_SELECTOR
          }
        ],
        [
          {
            loc: null,
            name: 'ul',
            type: TYPE_SELECTOR
          }
        ]
      ];
      const node = document.getElementById('dl1');
      const finder = new Finder(window);
      finder.setup(':not(:not(ol), ul)', node);
      const res = finder._matchLogicalPseudoFunc({
        astName: 'not',
        branches,
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
                  type: PS_CLASS_SELECTOR
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
                  type: TYPE_SELECTOR
                }
              ]
            }
          ]
        ]
      }, node, {});
      assert.deepEqual(res, null, 'result');
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
            type: PS_CLASS_SELECTOR
          }
        ],
        [
          {
            loc: null,
            name: 'ul',
            type: TYPE_SELECTOR
          }
        ]
      ];
      const node = document.getElementById('dl1');
      const finder = new Finder(window);
      finder.setup(':not(:not(dl), ul)', node);
      const res = finder._matchLogicalPseudoFunc({
        astName: 'not',
        branches,
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
                  type: PS_CLASS_SELECTOR
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
                  type: TYPE_SELECTOR
                }
              ]
            }
          ]
        ]
      }, node, {});
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const branches = [
        [
          {
            loc: null,
            name: 'ul',
            type: TYPE_SELECTOR
          }
        ],
        [
          {
            loc: null,
            name: 'dl',
            type: TYPE_SELECTOR
          }
        ]
      ];
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup(':is(ul, dl)', node);
      const res = finder._matchLogicalPseudoFunc({
        astName: 'is',
        branches,
        twigBranches: [
          [
            {
              combo: null,
              leaves: [
                {
                  loc: null,
                  name: 'ul',
                  type: TYPE_SELECTOR
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
                  type: TYPE_SELECTOR
                }
              ]
            }
          ]
        ]
      }, node, {});
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const branches = [
        [
          {
            loc: null,
            name: 'ul',
            type: TYPE_SELECTOR
          }
        ],
        [
          {
            loc: null,
            name: 'dl',
            type: TYPE_SELECTOR
          }
        ]
      ];
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup(':is(ul#ul1, dl#dl1)', node);
      const res = finder._matchLogicalPseudoFunc({
        astName: 'is',
        branches,
        twigBranches: [
          [
            {
              combo: null,
              leaves: [
                {
                  loc: null,
                  name: 'ul',
                  type: TYPE_SELECTOR
                },
                {
                  loc: null,
                  name: 'ul1',
                  type: ID_SELECTOR
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
                  type: TYPE_SELECTOR
                },
                {
                  loc: null,
                  name: 'dl1',
                  type: ID_SELECTOR
                }
              ]
            }
          ]
        ]
      }, node, {});
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const branches = [
        [
          {
            loc: null,
            name: 'ul',
            type: TYPE_SELECTOR
          },
          {
            loc: null,
            name: ' ',
            type: COMBINATOR
          },
          {
            loc: null,
            name: 'li',
            type: TYPE_SELECTOR
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
          }
        ],
        [
          {
            loc: null,
            name: 'dd',
            type: TYPE_SELECTOR
          }
        ]
      ];
      const node = document.getElementById('li3');
      const finder = new Finder(window);
      finder.setup(':is(ul li ~ li)', node);
      const res = finder._matchLogicalPseudoFunc({
        astName: 'is',
        branches,
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
                  type: TYPE_SELECTOR
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
          ]
        ]
      }, node, {});
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const branches = [
        [
          {
            loc: null,
            name: 'ol',
            type: TYPE_SELECTOR
          }
        ],
        [
          {
            loc: null,
            name: 'dl',
            type: TYPE_SELECTOR
          }
        ]
      ];
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup(':is(ol, dl)', node);
      const res = finder._matchLogicalPseudoFunc({
        astName: 'is',
        branches,
        twigBranches: [
          [
            {
              combo: null,
              leaves: [
                {
                  loc: null,
                  name: 'ol',
                  type: TYPE_SELECTOR
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
                  type: TYPE_SELECTOR
                }
              ]
            }
          ]
        ]
      }, node, {});
      assert.deepEqual(res, null, 'result');
    });

    it('should get matched node', () => {
      const branches = [
        [
          {
            loc: null,
            name: 'ul',
            type: TYPE_SELECTOR
          }
        ],
        [
          {
            loc: null,
            name: 'dl',
            type: TYPE_SELECTOR
          }
        ]
      ];
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup(':where(ul, dl)', node);
      const res = finder._matchLogicalPseudoFunc({
        astName: 'where',
        branches,
        twigBranches: [
          [
            {
              combo: null,
              leaves: [
                {
                  loc: null,
                  name: 'ul',
                  type: TYPE_SELECTOR
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
                  type: TYPE_SELECTOR
                }
              ]
            }
          ]
        ]
      }, node, {});
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const branches = [
        [
          {
            loc: null,
            name: 'ol',
            type: TYPE_SELECTOR
          }
        ],
        [
          {
            loc: null,
            name: 'dl',
            type: TYPE_SELECTOR
          }
        ]
      ];
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup(':where(ol, dl)', node);
      const res = finder._matchLogicalPseudoFunc({
        astName: 'where',
        branches,
        twigBranches: [
          [
            {
              combo: null,
              leaves: [
                {
                  loc: null,
                  name: 'ol',
                  type: TYPE_SELECTOR
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
                  type: TYPE_SELECTOR
                }
              ]
            }
          ]
        ]
      }, node, {});
      assert.deepEqual(res, null, 'result');
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
            type: PS_CLASS_SELECTOR
          }
        ]
      ];
      const node = document.getElementById('dt2');
      const finder = new Finder(window);
      finder.setup(':not(:is(li, dd))', node);
      const res = finder._matchLogicalPseudoFunc({
        astName: 'not',
        branches,
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
                  type: PS_CLASS_SELECTOR
                }
              ]
            }
          ]
        ]
      }, node, {});
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const branches = [
        [
          {
            loc: null,
            name: 'host',
            type: PS_CLASS_SELECTOR
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
        ]
      ];
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
      finder.setup(':not(:host > span)', node);
      const res = finder._matchLogicalPseudoFunc({
        astName: 'not',
        branches
      }, node, {});
      assert.deepEqual(res, null, 'result');
    });

    it('should not match', () => {
      const branches = [
        [
          {
            loc: null,
            name: 'div',
            type: TYPE_SELECTOR
          }
        ]
      ];
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
      finder.setup(':not(div)', node);
      const res = finder._matchLogicalPseudoFunc({
        astName: 'not',
        branches
      }, node, {});
      assert.deepEqual(res, null, 'result');
    });
  });

  describe('match pseudo class selector', () => {
    it('should throw', () => {
      const leaf = {
        children: [],
        loc: null,
        name: 'has',
        type: PS_CLASS_SELECTOR
      };
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup(':has()', node);
      assert.throws(
        () => finder._matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector :has()', 'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      const leaf = {
        children: [],
        loc: null,
        name: 'not',
        type: PS_CLASS_SELECTOR
      };
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup(':not()', node);
      assert.throws(
        () => finder._matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector :not()', 'message');
          return true;
        }
      );
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
        type: PS_CLASS_SELECTOR
      };
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup(':is(ul, dl)', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should throw', () => {
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
                    type: PS_CLASS_SELECTOR
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
        type: PS_CLASS_SELECTOR
      };
      const node = document.getElementById('ul1').parentNode;
      const finder = new Finder(window);
      finder.setup(':has(> :has(li))', node);
      assert.throws(
        () => finder._matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector :has(>:has(li))',
            'message');
          return true;
        }
      );
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
                                name: 'has',
                                type: PS_CLASS_SELECTOR
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
                    type: PS_CLASS_SELECTOR
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
        type: PS_CLASS_SELECTOR
      };
      const node = document.getElementById('ul1').parentNode;
      const finder = new Finder(window);
      finder.setup(':has(:is(:has(li, dd)))', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should throw', () => {
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
                                name: 'has',
                                type: PS_CLASS_SELECTOR
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
                    type: PS_CLASS_SELECTOR
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
        type: PS_CLASS_SELECTOR
      };
      const node = document.getElementById('ul1').parentNode;
      const finder = new Finder(window);
      finder.setup(':has(:is(:has(li, dd)))', node);
      assert.throws(
        () => finder._matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message,
            'Invalid selector :has(:not(:has(li,dd)))', 'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      const leaf = {
        children: [],
        name: 'nth-child',
        type: PS_CLASS_SELECTOR
      };
      const node = document.getElementById('dt1');
      const finder = new Finder(window);
      finder.setup(':nth-child()', node);
      assert.throws(
        () => finder._matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector :nth-child()',
            'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      const leaf = {
        children: [],
        name: 'nth-last-child',
        type: PS_CLASS_SELECTOR
      };
      const node = document.getElementById('dt1');
      const finder = new Finder(window);
      finder.setup(':nth-last-child()', node);
      assert.throws(
        () => finder._matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector :nth-last-child()',
            'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      const leaf = {
        children: [],
        name: 'nth-of-type',
        type: PS_CLASS_SELECTOR
      };
      const node = document.getElementById('dt1');
      const finder = new Finder(window);
      finder.setup(':nth-of-type()', node);
      assert.throws(
        () => finder._matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector :nth-of-type()',
            'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      const leaf = {
        children: [],
        name: 'nth-last-of-type',
        type: PS_CLASS_SELECTOR
      };
      const node = document.getElementById('dt1');
      const finder = new Finder(window);
      finder.setup(':nth-last-of-type()', node);
      assert.throws(
        () => finder._matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector :nth-last-of-type()',
            'message');
          return true;
        }
      );
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: [
          {
            nth: {
              name: 'even',
              type: IDENT
            },
            selector: null,
            type: NTH
          }
        ],
        name: 'nth-child',
        type: PS_CLASS_SELECTOR
      };
      const node = document.getElementById('dt1');
      const finder = new Finder(window);
      finder.setup(':nth-child(even)', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        document.getElementById('dd1'),
        document.getElementById('dd2'),
        document.getElementById('dd3')
      ], 'result');
    });

    it('should throw', () => {
      const leaf = {
        children: [],
        name: 'dir',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':dir()', node);
      assert.throws(
        () => finder._matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector :dir()',
            'message');
          return true;
        }
      );
    });

    it('should get matched node', () => {
      const leaf = {
        children: [
          {
            name: 'ltr',
            type: IDENT
          }
        ],
        name: 'dir',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.setAttribute('dir', 'ltr');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':dir(ltr)', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should throw', () => {
      const leaf = {
        children: [],
        name: 'lang',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':lang()', node);
      assert.throws(
        () => finder._matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector :lang()',
            'message');
          return true;
        }
      );
    });

    it('should get matched node', () => {
      const leaf = {
        children: [
          {
            name: 'en',
            type: IDENT
          }
        ],
        name: 'lang',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'en');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':lang(en)', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: [
          {
            name: 'en',
            type: IDENT
          },
          {
            type: OPERATOR,
            value: ','
          },
          {
            name: 'fr',
            type: IDENT
          }
        ],
        name: 'lang',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'fr');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':lang(en, fr)', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: [
          {
            type: RAW,
            value: 'checked'
          }
        ],
        loc: null,
        name: 'state',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('x-div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      node.click();
      const finder = new Finder(window);
      finder.setup(':state(checked)', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: [
          {
            type: RAW,
            value: 'checked'
          }
        ],
        loc: null,
        name: 'state',
        type: PS_CLASS_SELECTOR
      };
      class LabeledCheckbox extends window.HTMLElement {
        constructor() {
          super();
          this._internals = this.attachInternals();
          // ElementInternals.states is not implemented in jsdom
          if (!this._internals.states) {
            this._internals.states = new Set();
          }
          this.addEventListener('click', this._onClick.bind(this));
          const shadowRoot = this.attachShadow({ mode: 'closed' });
          shadowRoot.innerHTML = `
            <style>
              :host::before {
                content: '[ ]';
                white-space: pre;
                font-family: monospace;
              }
              :host(:state(checked))::before {
                content: '[x]'
              }
            </style>
            <slot>Label</slot>
          `;
        }

        get checked() {
          return this._internals.states.has('checked');
        }

        set checked(flag) {
          if (flag) {
            this._internals.states.add('checked');
          } else {
            this._internals.states.delete('checked');
          }
        }

        _onClick(event) {
          this.checked = !this.checked;
        }
      }
      window.customElements.define('labeled-checkbox', LabeledCheckbox);
      const node = document.createElement('labeled-checkbox');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':state(checked)', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: [
          {
            type: RAW,
            value: 'checked'
          }
        ],
        loc: null,
        name: 'state',
        type: PS_CLASS_SELECTOR
      };
      class LabeledCheckbox extends window.HTMLElement {
        constructor() {
          super();
          this._internals = this.attachInternals();
          // ElementInternals.states is not implemented in jsdom
          if (!this._internals.states) {
            this._internals.states = new Set();
          }
          this.addEventListener('click', this._onClick.bind(this));
          const shadowRoot = this.attachShadow({ mode: 'closed' });
          shadowRoot.innerHTML = `
            <style>
              :host::before {
                content: '[ ]';
                white-space: pre;
                font-family: monospace;
              }
              :host(:state(checked))::before {
                content: '[x]'
              }
            </style>
            <slot>Label</slot>
          `;
        }

        get checked() {
          return this._internals.states.has('checked');
        }

        set checked(flag) {
          if (flag) {
            this._internals.states.add('checked');
          } else {
            this._internals.states.delete('checked');
          }
        }

        _onClick(event) {
          this.checked = !this.checked;
        }
      }
      window.customElements.define('labeled-checkbox', LabeledCheckbox);
      const node = document.createElement('labeled-checkbox');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      node.click();
      const finder = new Finder(window);
      finder.setup(':state(checked)', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
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
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':current(foo)', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should warn', () => {
      const leaf = {
        children: [
          {
            type: RAW,
            value: 'foo'
          }
        ],
        loc: null,
        name: 'current',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const stubWarn = sinon.stub(console, 'warn');
      const finder = new Finder(window);
      finder.setup(':current(foo)', node, {
        warn: true
      });
      const res = finder._matchPseudoClassSelector(leaf, node, {
        warn: true
      });
      const { called } = stubWarn;
      stubWarn.restore();
      assert.strictEqual(called, true, 'called');
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
                type: CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        name: 'host',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':host(.foo)', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
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
                type: CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        name: 'host-context',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':host-context(.foo)', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
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
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':foobar(foo)', node);
      assert.throws(
        () => finder._matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Unknown pseudo-class :foobar()',
            'message');
          return true;
        }
      );
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
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':contains(foo)', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should warn', () => {
      const leaf = {
        children: [
          {
            type: RAW,
            value: 'foo'
          }
        ],
        loc: null,
        name: 'contains',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const stubWarn = sinon.stub(console, 'warn');
      const finder = new Finder(window);
      finder.setup(':contains(foo)', node, {
        warn: true
      });
      const res = finder._matchPseudoClassSelector(leaf, node, {
        warn: true
      });
      const { called } = stubWarn;
      stubWarn.restore();
      assert.strictEqual(called, true, 'called');
      assert.deepEqual([...res], [], 'result');
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
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':foobar(foo)', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {
        forgive: true
      });
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'any-link',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttribute('href', 'https://example.com/');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':any-link', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'any-link',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href',
        'https://example.com/');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':any-link', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'any-link',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':any-link', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'any-link',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('area');
      node.setAttribute('href', 'https://example.com/');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':any-link', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'any-link',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('area');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':any-link', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'link',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttribute('href', 'https://example.com/');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':link', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'local-link',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttribute('href', './#foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':local-link', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'local-link',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttribute('href', 'https://example.com');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':local-link', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'local-link',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('area');
      node.setAttribute('href', './#foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':local-link', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'local-link',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('area');
      node.setAttribute('href', 'https://example.com');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':local-link', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'visited',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.href = 'https://example.com';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':visited', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'hover',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':hover', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'hover',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':hover', node);
      node.dispatchEvent(new window.MouseEvent('mouseover'));
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'hover',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':hover', node);
      node.dispatchEvent(new window.MouseEvent('mouseover'));
      node.dispatchEvent(new window.MouseEvent('mousedown'));
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'hover',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':hover', node);
      node.dispatchEvent(new window.MouseEvent('mouseover'));
      node.dispatchEvent(new window.MouseEvent('mouseout'));
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'active',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':active', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'active',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':active', node);
      node.dispatchEvent(new window.MouseEvent('mousedown', {
        buttons: 1
      }));
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'active',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':active', node);
      node.dispatchEvent(new window.MouseEvent('mousedown', {
        buttons: 1
      }));
      node.dispatchEvent(new window.MouseEvent('mouseup', {
        buttons: 1
      }));
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'active',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':active', node, {
        event
      });
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'target',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':target', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'target',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'bar';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':target', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'target',
        type: PS_CLASS_SELECTOR
      };
      const frag = document.createDocumentFragment();
      const node = document.createElement('div');
      node.id = 'foo';
      frag.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':target', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'target-within',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':target-within', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'target-within',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':target-within', parent);
      const res = finder._matchPseudoClassSelector(leaf, parent, {});
      assert.deepEqual([...res], [
        parent
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'target-within',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'bar';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':target-within', parent);
      const res = finder._matchPseudoClassSelector(leaf, parent, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'scope',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':scope', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'scope',
        type: PS_CLASS_SELECTOR
      };
      const refPoint = document.createElement('div');
      const node = document.createElement('div');
      node.id = 'foo';
      refPoint.appendChild(node);
      const parent = document.getElementById('div0');
      parent.appendChild(refPoint);
      const finder = new Finder(window);
      finder.setup(':scope', refPoint);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'scope',
        type: PS_CLASS_SELECTOR
      };
      const node = document.documentElement;
      const finder = new Finder(window);
      finder.setup(':scope', document);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'scope',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':scope', document);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      const finder = new Finder(window);
      finder.setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      const finder = new Finder(window);
      finder.setup(':focus', node);
      node.focus();
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: PS_CLASS_SELECTOR
      };
      const finder = new Finder(window);
      finder.setup(':focus', document.body);
      const res = finder._matchPseudoClassSelector(leaf, document.body, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      const finder = new Finder(window);
      finder.setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      node.disabled = true;
      const finder = new Finder(window);
      finder.setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      node.setAttribute('disabled', 'disabled');
      const finder = new Finder(window);
      finder.setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    xit('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      node.hidden = true;
      const finder = new Finder(window);
      finder.setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    xit('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      node.setAttribute('hidden', 'hidden');
      const finder = new Finder(window);
      finder.setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    xit('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      node.style.display = 'none';
      const finder = new Finder(window);
      finder.setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    xit('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      node.style.visibility = 'hidden';
      const finder = new Finder(window);
      finder.setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    xit('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      parent.disabled = true;
      const finder = new Finder(window);
      finder.setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    xit('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      parent.setAttribute('disabled', 'disabled');
      const finder = new Finder(window);
      finder.setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    xit('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      parent.hidden = true;
      const finder = new Finder(window);
      finder.setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    xit('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      parent.setAttribute('hidden', 'hidden');
      const finder = new Finder(window);
      finder.setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    xit('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      parent.style.display = 'none';
      const finder = new Finder(window);
      finder.setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    xit('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      parent.style.visibility = 'hidden';
      const finder = new Finder(window);
      finder.setup(':focus', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'focus-visible',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      const finder = new Finder(window);
      node.focus();
      finder.setup(':focus-visible', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'focus-visible',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      const finder = new Finder(window);
      document.body.dispatchEvent(new window.KeyboardEvent('keydown', {
        key: 'Tab'
      }));
      node.focus();
      finder.setup(':focus-visible', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'focus-visible',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      const finder = new Finder(window);
      document.body.dispatchEvent(new window.KeyboardEvent('keydown', {
        key: 'Tab'
      }));
      node.focus();
      node.dispatchEvent(new window.KeyboardEvent('keyup', {
        key: 'Tab'
      }));
      finder.setup(':focus-visible', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-visible',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      const finder = new Finder(window);
      finder.setup(':focus-visible', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'focus-visible',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      const finder = new Finder(window);
      document.body.dispatchEvent(new window.KeyboardEvent('keydown', {
        key: 'Tab'
      }));
      node.focus();
      node.dispatchEvent(new window.KeyboardEvent('keyup', {
        key: 'Tab'
      }));
      node.dispatchEvent(new window.KeyboardEvent('keydown', {
        key: 'Shift'
      }));
      node.dispatchEvent(new window.KeyboardEvent('keyup', {
        key: 'Shift'
      }));
      finder.setup(':focus-visible', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'focus-visible',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      const finder = new Finder(window);
      document.body.dispatchEvent(new window.KeyboardEvent('keydown', {
        key: 'Tab'
      }));
      node.focus();
      node.dispatchEvent(new window.KeyboardEvent('keyup', {
        key: 'Tab'
      }));
      node.dispatchEvent(new window.KeyboardEvent('keydown', {
        key: 'ArrowRight'
      }));
      node.dispatchEvent(new window.KeyboardEvent('keyup', {
        key: 'ArrowRight'
      }));
      finder.setup(':focus-visible', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-visible',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      const finder = new Finder(window);
      node.focus();
      finder.setup(':focus-visible', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
      node.dispatchEvent(new window.KeyboardEvent('keydown', {
        key: 'Tab'
      }));
      finder.setup(':focus-visible', node);
      const res2 = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res2], [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'focus-visible',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const node2 = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      parent.appendChild(node2);
      document.getElementById('div0').appendChild(parent);
      const finder = new Finder(window);
      document.body.dispatchEvent(new window.KeyboardEvent('keydown', {
        key: 'Tab'
      }));
      node.focus();
      node.dispatchEvent(new window.KeyboardEvent('keyup', {
        key: 'Tab'
      }));
      node.dispatchEvent(new window.KeyboardEvent('keydown', {
        key: 'Tab'
      }));
      node.blur();
      node2.focus();
      node2.dispatchEvent(new window.KeyboardEvent('keyup', {
        key: 'Tab'
      }));
      finder.setup(':focus-visible', node2);
      const res = finder._matchPseudoClassSelector(leaf, node2, {});
      assert.deepEqual([...res], [
        node2
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-visible',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const node2 = document.createElement('button');
      const parent = document.createElement('form');
      node.type = 'button';
      node2.type = 'button';
      parent.appendChild(node);
      parent.appendChild(node2);
      document.getElementById('div0').appendChild(parent);
      const finder = new Finder(window);
      document.body.dispatchEvent(new window.KeyboardEvent('keydown', {
        key: 'Tab'
      }));
      node.focus();
      node.dispatchEvent(new window.KeyboardEvent('keyup', {
        key: 'Tab'
      }));
      finder.setup(':focus-visible', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
      node2.dispatchEvent(new window.MouseEvent('mousedown', {
        buttons: 1
      }));
      node2.focus();
      node2.dispatchEvent(new window.MouseEvent('mouseup', {
        buttons: 0
      }));
      node2.click();
      finder.setup(':focus-visible', node2);
      const res2 = finder._matchPseudoClassSelector(leaf, node2, {});
      assert.deepEqual([...res2], [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'focus-visible',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const node2 = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      parent.appendChild(node2);
      document.getElementById('div0').appendChild(parent);
      const finder = new Finder(window);
      document.body.dispatchEvent(new window.KeyboardEvent('keydown', {
        key: 'Tab'
      }));
      node.focus();
      node.dispatchEvent(new window.KeyboardEvent('keyup', {
        key: 'Tab'
      }));
      node2.focus();
      finder.setup(':focus-visible', node2);
      const res = finder._matchPseudoClassSelector(leaf, node2, {});
      assert.deepEqual([...res], [
        node2
      ], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'focus-visible',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const node2 = document.createElement('button');
      const parent = document.createElement('form');
      node.setAttribute('tabindex', '-1');
      parent.appendChild(node);
      parent.appendChild(node2);
      document.getElementById('div0').appendChild(parent);
      const finder = new Finder(window);
      node.focus();
      finder.setup(':focus-visible', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
      node2.focus();
      finder.setup(':focus-visible', node2);
      const res2 = finder._matchPseudoClassSelector(leaf, node2, {});
      assert.deepEqual([...res2], [
        node2
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      const finder = new Finder(window);
      finder.setup(':focus-within', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      const finder = new Finder(window);
      finder.setup(':focus-within', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PS_CLASS_SELECTOR
      };
      const finder = new Finder(window);
      finder.setup(':focus-within', document.body);
      const res = finder._matchPseudoClassSelector(leaf, document.body, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      node.disabled = true;
      const finder = new Finder(window);
      finder.setup(':focus-within', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      node.setAttribute('disabled', 'disabled');
      const finder = new Finder(window);
      finder.setup(':focus-within', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    xit('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      node.hidden = true;
      const finder = new Finder(window);
      finder.setup(':focus-within', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    xit('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      node.setAttribute('hidden', 'hidden');
      const finder = new Finder(window);
      finder.setup(':focus-within', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    xit('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      node.style.display = 'none';
      const finder = new Finder(window);
      finder.setup(':focus-within', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    xit('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      node.style.visibility = 'hidden';
      const finder = new Finder(window);
      finder.setup(':focus-within', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      const finder = new Finder(window);
      finder.setup(':focus-within', parent);
      const res = finder._matchPseudoClassSelector(leaf, parent, {});
      assert.deepEqual([...res], [
        parent
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      const finder = new Finder(window);
      finder.setup(':focus-within', parent);
      const res = finder._matchPseudoClassSelector(leaf, parent, {});
      assert.deepEqual([...res], [], 'result');
    });

    xit('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      parent.disabled = true;
      const finder = new Finder(window);
      finder.setup(':focus-within', parent);
      const res = finder._matchPseudoClassSelector(leaf, parent, {});
      assert.deepEqual([...res], [], 'result');
    });

    xit('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      parent.setAttribute('disabled', 'disabled');
      const finder = new Finder(window);
      finder.setup(':focus-within', parent);
      const res = finder._matchPseudoClassSelector(leaf, parent, {});
      assert.deepEqual([...res], [], 'result');
    });

    xit('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      parent.hidden = true;
      const finder = new Finder(window);
      finder.setup(':focus-within', parent);
      const res = finder._matchPseudoClassSelector(leaf, parent, {});
      assert.deepEqual([...res], [], 'result');
    });

    xit('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      parent.setAttribute('hidden', 'hidden');
      const finder = new Finder(window);
      finder.setup(':focus-within', parent);
      const res = finder._matchPseudoClassSelector(leaf, parent, {});
      assert.deepEqual([...res], [], 'result');
    });

    xit('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      parent.style.display = 'none';
      const finder = new Finder(window);
      finder.setup(':focus-within', parent);
      const res = finder._matchPseudoClassSelector(leaf, parent, {});
      assert.deepEqual([...res], [], 'result');
    });

    xit('should not match', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      node.focus();
      parent.style.visibility = 'hidden';
      const finder = new Finder(window);
      finder.setup(':focus-within', parent);
      const res = finder._matchPseudoClassSelector(leaf, parent, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'open',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('details');
      node.setAttribute('open', 'open');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':open', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'open',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('details');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':open', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'closed',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('details');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':closed', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'closed',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('details');
      node.setAttribute('open', 'open');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':closed', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'open',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('dialog');
      node.setAttribute('open', 'open');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':open', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'open',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('dialog');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':open', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'closed',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('dialog');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':closed', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'closed',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('dialog');
      node.setAttribute('open', 'open');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':closed', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'disabled',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('disabled', 'disabled');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':disabled', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'disabled',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':disabled', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'disabled',
        type: PS_CLASS_SELECTOR
      };
      const form = document.createElement('form');
      const div = document.createElement('div');
      const node = document.createElement('input');
      const parent = document.getElementById('div0');
      div.appendChild(node);
      form.appendChild(div);
      parent.appendChild(form);
      const finder = new Finder(window);
      finder.setup(':disabled', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'disabled',
        type: PS_CLASS_SELECTOR
      };
      window.customElements.define('x-input', class extends window.HTMLElement {
        static formAssociated = true;
      });
      const node = document.createElement('x-input');
      node.setAttribute('disabled', 'disabled');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':disabled', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'disabled',
        type: PS_CLASS_SELECTOR
      };
      window.customElements.define('x-input',
        class extends window.HTMLElement {});
      const node = document.createElement('x-input');
      node.setAttribute('disabled', 'disabled');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':disabled', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'disabled',
        type: PS_CLASS_SELECTOR
      };
      const node1 = document.createElement('input');
      const node2 = document.createElement('fieldset');
      node2.setAttribute('disabled', 'disabled');
      node2.appendChild(node1);
      const parent = document.getElementById('div0');
      parent.appendChild(node2);
      const finder = new Finder(window);
      finder.setup(':disabled', node1);
      const res = finder._matchPseudoClassSelector(leaf, node1, {});
      assert.deepEqual([...res], [
        node1
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'disabled',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':disabled', node1);
      const res = finder._matchPseudoClassSelector(leaf, node1, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'disabled',
        type: PS_CLASS_SELECTOR
      };
      const field = document.createElement('fieldset');
      const legend = document.createElement('legend');
      const node = document.createElement('input');
      const parent = document.getElementById('div0');
      legend.appendChild(node);
      field.appendChild(legend);
      field.setAttribute('disabled', 'disabled');
      parent.appendChild(field);
      const finder = new Finder(window);
      finder.setup(':disabled', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'enabled',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':enabled', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'enabled',
        type: PS_CLASS_SELECTOR
      };
      const form = document.createElement('form');
      const node = document.createElement('input');
      const parent = document.getElementById('div0');
      form.appendChild(node);
      parent.appendChild(form);
      const finder = new Finder(window);
      finder.setup(':enabled', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'enabled',
        type: PS_CLASS_SELECTOR
      };
      window.customElements.define('x-input', class extends window.HTMLElement {
        static formAssociated = true;
      });
      const node = document.createElement('x-input');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':enabled', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'enabled',
        type: PS_CLASS_SELECTOR
      };
      window.customElements.define('x-input',
        class extends window.HTMLElement {});
      const node = document.createElement('x-input');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':enabled', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'enabled',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('disabled', 'disabled');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':enabled', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'enabled',
        type: PS_CLASS_SELECTOR
      };
      const field = document.createElement('fieldset');
      const legend = document.createElement('legend');
      const node = document.createElement('input');
      const parent = document.getElementById('div0');
      legend.appendChild(node);
      field.appendChild(legend);
      field.setAttribute('disabled', 'disabled');
      parent.appendChild(field);
      const finder = new Finder(window);
      finder.setup(':enabled', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'enabled',
        type: PS_CLASS_SELECTOR
      };
      const field = document.createElement('fieldset');
      const div = document.createElement('div');
      const legend = document.createElement('legend');
      const node = document.createElement('input');
      const parent = document.getElementById('div0');
      field.appendChild(div);
      field.appendChild(legend);
      field.appendChild(node);
      field.setAttribute('disabled', 'disabled');
      parent.appendChild(field);
      const finder = new Finder(window);
      finder.setup(':enabled', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'enabled',
        type: PS_CLASS_SELECTOR
      };
      const form = document.createElement('form');
      const field = document.createElement('fieldset');
      const node = document.createElement('input');
      const parent = document.getElementById('div0');
      field.appendChild(node);
      form.appendChild(field);
      parent.appendChild(form);
      const finder = new Finder(window);
      finder.setup(':enabled', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'enabled',
        type: PS_CLASS_SELECTOR
      };
      const field = document.createElement('fieldset');
      const node = document.createElement('input');
      const parent = document.getElementById('div0');
      field.appendChild(node);
      field.disabled = true;
      parent.appendChild(field);
      const finder = new Finder(window);
      finder.setup(':enabled', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('readonly', 'readonly');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':read-only', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.setAttribute('readonly', 'readonly');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':read-only', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('readonly', 'readonly');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':read-only', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'range');
      node.setAttribute('readonly', 'readonly');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':read-only', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('disabled', 'disabled');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':read-only', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':read-only', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.readOnly = true;
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':read-only', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      node.setAttribute('readonly', 'readonly');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':read-only', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      node.setAttribute('disabled', 'disabled');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':read-only', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':read-only', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      node.readOnly = true;
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':read-only', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':read-only', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.setAttribute('contenteditable', 'true');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':read-only', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':read-write', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':read-write', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':read-write', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'range');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':read-write', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('readonly', 'readonly');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':read-write', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('disabled', 'disabled');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':read-write', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':read-write', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      node.setAttribute('readonly', 'readonly');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':read-write', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      node.setAttribute('disabled', 'disabled');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':read-write', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.setAttribute('contenteditable', 'true');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':read-write', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':read-write', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'placeholder-shown',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('placeholder', 'foo');
      node.value = '';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':placeholder-shown', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'placeholder-shown',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.setAttribute('placeholder', 'foo');
      node.value = '';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':placeholder-shown', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'placeholder-shown',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'hidden');
      node.setAttribute('placeholder', 'foo');
      node.value = '';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':placeholder-shown', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'placeholder-shown',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('placeholder', 'foo');
      node.value = 'bar';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':placeholder-shown', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'placeholder-shown',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('placeholder', ' ');
      node.value = '';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':placeholder-shown', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'placeholder-shown',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('placeholder', '');
      node.value = '';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':placeholder-shown', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'placeholder-shown',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.placeholder = 'foo';
      node.value = '';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':placeholder-shown', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'placeholder-shown',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.placeholder = '';
      node.value = '';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':placeholder-shown', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'placeholder-shown',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.placeholder = 'foo\r\nbar';
      node.value = '';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':placeholder-shown', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'placeholder-shown',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      node.setAttribute('placeholder', 'foo');
      node.value = '';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':placeholder-shown', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'checked',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'checkbox');
      node.setAttribute('checked', 'checked');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':checked', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'checked',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'radio');
      node.setAttribute('checked', 'checked');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':checked', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'checked',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.setAttribute('checked', 'checked');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':checked', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'checked',
        type: PS_CLASS_SELECTOR
      };
      const container = document.createElement('select');
      const node = document.createElement('option');
      node.setAttribute('selected', 'selected');
      container.appendChild(node);
      const parent = document.getElementById('div0');
      parent.appendChild(container);
      const finder = new Finder(window);
      finder.setup(':checked', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'indeterminate',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'checkbox');
      node.indeterminate = true;
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':indeterminate', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'indeterminate',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'checkbox');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':indeterminate', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'indeterminate',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('progress');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':indeterminate', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'indeterminate',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('progress');
      node.setAttribute('value', '0');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':indeterminate', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'indeterminate',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':indeterminate', node1);
      const res = finder._matchPseudoClassSelector(leaf, node1, {});
      assert.deepEqual([...res], [
        node1
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'indeterminate',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':indeterminate', node1);
      const res = finder._matchPseudoClassSelector(leaf, node1, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'indeterminate',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':indeterminate', node1);
      const res = finder._matchPseudoClassSelector(leaf, node1, {});
      assert.deepEqual([...res], [
        node1
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'indeterminate',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':indeterminate', node1);
      const res = finder._matchPseudoClassSelector(leaf, node1, {});
      assert.deepEqual([...res], [
        node1
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'checkbox');
      node.setAttribute('checked', 'checked');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'checkbox');
      node.checked = true;
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'checkbox');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'radio');
      node.checked = true;
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'radio');
      node.setAttribute('checked', 'checked');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'radio');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
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
      container.multiple = true;
      const parent = document.getElementById('div0');
      parent.appendChild(container);
      const finder = new Finder(window);
      finder.setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
      };
      const container = document.createElement('select');
      const node = document.createElement('option');
      const next = document.createElement('option');
      container.appendChild(node);
      container.appendChild(next);
      const parent = document.getElementById('div0');
      parent.appendChild(container);
      const finder = new Finder(window);
      finder.setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
      };
      const container = document.createElement('datalist');
      const prev = document.createElement('option');
      const node = document.createElement('option');
      container.appendChild(prev);
      container.appendChild(node);
      const parent = document.getElementById('div0');
      parent.appendChild(container);
      const finder = new Finder(window);
      finder.setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
      };
      const form = document.createElement('form');
      const p = document.createElement('p');
      const node = document.createElement('button');
      form.appendChild(p);
      form.appendChild(node);
      const parent = document.getElementById('div0');
      parent.appendChild(form);
      const finder = new Finder(window);
      finder.setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
      };
      const form = document.createElement('form');
      const node = document.createElement('button');
      node.setAttribute('type', 'submit');
      form.appendChild(node);
      const parent = document.getElementById('div0');
      parent.appendChild(form);
      const finder = new Finder(window);
      finder.setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      node.setAttribute('type', 'submit');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
      };
      const form = document.createElement('form');
      const node = document.createElement('input');
      node.setAttribute('type', 'submit');
      form.appendChild(node);
      const parent = document.getElementById('div0');
      parent.appendChild(form);
      const finder = new Finder(window);
      finder.setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'submit');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
      };
      const form = document.createElement('form');
      const node = document.createElement('input');
      node.setAttribute('type', 'image');
      form.appendChild(node);
      const parent = document.getElementById('div0');
      parent.appendChild(form);
      const finder = new Finder(window);
      finder.setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'image');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':default', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'valid',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.setAttribute('required', 'required');
      node.value = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':valid', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'valid',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.setAttribute('required', 'required');
      node.value = '';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':valid', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'valid',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':valid', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'valid',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':valid', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'valid',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':valid', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'valid',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':valid', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'valid',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':valid', input);
      const res = finder._matchPseudoClassSelector(leaf, input, {});
      assert.deepEqual([...res], [
        input
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'valid',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':valid', input);
      const res = finder._matchPseudoClassSelector(leaf, input, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'valid',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':valid', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'valid',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':valid', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'invalid',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.setAttribute('required', 'required');
      node.value = '';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':invalid', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'invalid',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.setAttribute('required', 'required');
      node.value = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':invalid', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'invalid',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':invalid', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'invalid',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':invalid', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'invalid',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':invalid', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'invalid',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':invalid', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'invalid',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':invalid', input);
      const res = finder._matchPseudoClassSelector(leaf, input, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'invalid',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':invalid', input);
      const res = finder._matchPseudoClassSelector(leaf, input, {});
      assert.deepEqual([...res], [
        input
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'invalid',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':invalid', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'invalid',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':invalid', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'in-range',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.readOnly = true;
      node.setAttribute('type', 'number');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '1';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':in-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'in-range',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':in-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'in-range',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('hidden', 'hidden');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '1';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':in-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'in-range',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '1';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':in-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'in-range',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '1';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':in-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'in-range',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '1';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':in-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'in-range',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'range');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '1';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':in-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'in-range',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'range');
      node.setAttribute('max', '10');
      node.value = '1';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':in-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'in-range',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'range');
      node.value = '1';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':in-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'in-range',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '0';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':in-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'in-range',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '11';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':in-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'out-of-range',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.readOnly = true;
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':out-of-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'out-of-range',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('hidden', 'hidden');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':out-of-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'out-of-range',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '0';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':out-of-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'out-of-range',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '11';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':out-of-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'out-of-range',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '1';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':out-of-range', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('required', 'required');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':required', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.setAttribute('required', 'required');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':required', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('required', 'required');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':required', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'range');
      node.setAttribute('required', 'required');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':required', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'checkbox');
      node.setAttribute('required', 'required');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':required', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'radio');
      node.setAttribute('required', 'required');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':required', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'file');
      node.setAttribute('required', 'required');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':required', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      node.setAttribute('required', 'required');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':required', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('select');
      node.setAttribute('required', 'required');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':required', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':required', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':optional', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':optional', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':optional', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'range');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':optional', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'checkbox');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':optional', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'radio');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':optional', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('select');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':optional', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':optional', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('required', 'required');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':optional', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'root',
        type: PS_CLASS_SELECTOR
      };
      const node = document.documentElement;
      const finder = new Finder(window);
      finder.setup(':root', document);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'root',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':root', document);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'empty',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':empty', document);
      const res1 = finder._matchPseudoClassSelector(leaf, p1, {});
      const res2 = finder._matchPseudoClassSelector(leaf, p2, {});
      const res3 = finder._matchPseudoClassSelector(leaf, p3, {});
      const res4 = finder._matchPseudoClassSelector(leaf, p4, {});
      const res5 = finder._matchPseudoClassSelector(leaf, p5, {});
      const res6 = finder._matchPseudoClassSelector(leaf, s1, {});
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
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const next = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      parent.appendChild(next);
      const finder = new Finder(window);
      finder.setup(':first-child', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'first-child',
        type: PS_CLASS_SELECTOR
      };
      const prev = document.createElement('div');
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(prev);
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':first-child', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'first-child',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const finder = new Finder(window);
      finder.setup(':first-child', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'last-child',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const next = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      parent.appendChild(next);
      const finder = new Finder(window);
      finder.setup(':last-child', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'last-child',
        type: PS_CLASS_SELECTOR
      };
      const prev = document.createElement('div');
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(prev);
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':last-child', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'last-child',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const finder = new Finder(window);
      finder.setup(':last-child', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'only-child',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup(':only-child', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'only-child',
        type: PS_CLASS_SELECTOR
      };
      const prev = document.createElement('div');
      const node = document.createElement('div');
      const next = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(prev);
      parent.appendChild(node);
      parent.appendChild(next);
      const finder = new Finder(window);
      finder.setup(':only-child', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'only-child',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const finder = new Finder(window);
      finder.setup(':only-child', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'first-of-type',
        type: PS_CLASS_SELECTOR
      };
      const node = document.getElementById('dt2');
      const finder = new Finder(window);
      finder.setup(':first-of-type', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        document.getElementById('dt1')
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'first-of-type',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const finder = new Finder(window);
      finder.setup(':first-of-type', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'last-of-type',
        type: PS_CLASS_SELECTOR
      };
      const node = document.getElementById('dt2');
      const finder = new Finder(window);
      finder.setup(':last-of-type', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        document.getElementById('dt3')
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'last-of-type',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const finder = new Finder(window);
      finder.setup(':last-of-type', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'only-of-type',
        type: PS_CLASS_SELECTOR
      };
      const parent = document.createElement('dl');
      const node1 = document.createElement('dt');
      const node2 = document.createElement('dd');
      parent.appendChild(node1);
      parent.appendChild(node2);
      document.getElementById('div0').appendChild(parent);
      const finder = new Finder(window);
      finder.setup(':only-of-type', node1);
      const res = finder._matchPseudoClassSelector(leaf, node1, {});
      assert.deepEqual([...res], [
        node1
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const leaf = {
        children: null,
        name: 'only-of-type',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const finder = new Finder(window);
      finder.setup(':only-of-type', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('p');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder.setup(':defined', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('asdf');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder.setup(':defined', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(node instanceof window.HTMLUnknownElement, true,
        'instance');
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: PS_CLASS_SELECTOR
      };
      window.customElements.define('sw-rey',
        class extends window.HTMLElement {});
      const node = document.createElement('sw-rey');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder.setup(':defined', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: PS_CLASS_SELECTOR
      };
      window.customElements.define('sw-finn',
        class extends window.HTMLElement {}, { extends: 'p' });
      const node = document.createElement('p');
      node.setAttribute('is', 'sw-finn');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder.setup(':defined', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('sw-han');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder.setup(':defined', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('p');
      node.setAttribute('is', 'sw-luke');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder.setup(':defined', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('p');
      node.setAttribute('is', 'asdf');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder.setup(':defined', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: PS_CLASS_SELECTOR
      };
      window.customElements.define('foo-', class extends window.HTMLElement {});
      const node = document.createElement('foo-');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder.setup(':defined', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: PS_CLASS_SELECTOR
      };
      const node =
        document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder.setup(':defined', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: PS_CLASS_SELECTOR
      };
      const node =
        document.createElementNS('http://www.w3.org/2000/svg', 'foo');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder.setup(':defined', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    // NOTE: not implemented in jsdom
    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: PS_CLASS_SELECTOR
      };
      const node =
        document.createElementNS('http://www.w3.org/1998/Math/MathML', 'math');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder.setup(':defined', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElementNS('http://www.example.com', 'foo');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder.setup(':defined', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    // NOTE: popover api is not supported in jsdom
    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'popover-open',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('p');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder.setup(':popover-open', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'popover-open',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('p');
      node.showPopover = () => {
        node.style.display = 'block';
      };
      node.popover = 'auto';
      node.style.display = 'none';
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder.setup(':popover-open', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node', () => {
      const leaf = {
        children: null,
        name: 'popover-open',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':popover-open', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'popover-open',
        type: PS_CLASS_SELECTOR
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
      finder.setup(':popover-open', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'host',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder.setup(':host', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'host-context',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder.setup(':host-context', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    // legacy pseudo-element
    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'after',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder.setup(':after', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should warn', () => {
      const leaf = {
        children: null,
        name: 'after',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const stubWarn = sinon.stub(console, 'warn');
      const finder = new Finder(window);
      finder.setup(':after', node, {
        warn: true
      });
      const res = finder._matchPseudoClassSelector(leaf, node, {
        warn: true
      });
      const { called } = stubWarn;
      stubWarn.restore();
      assert.strictEqual(called, true, 'called');
      assert.deepEqual([...res], [], 'result');
    });

    // not supported
    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'autofill',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder.setup(':autofill', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should warn', () => {
      const leaf = {
        children: null,
        name: 'autofill',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const stubWarn = sinon.stub(console, 'warn');
      const finder = new Finder(window);
      finder.setup(':autofill', node, {
        warn: true
      });
      const res = finder._matchPseudoClassSelector(leaf, node, {
        warn: true
      });
      const { called } = stubWarn;
      stubWarn.restore();
      assert.strictEqual(called, true, 'called');
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'has-slotted',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder.setup(':has-slotted', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should warn', () => {
      const leaf = {
        children: null,
        name: 'has-slotted',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const stubWarn = sinon.stub(console, 'warn');
      const finder = new Finder(window);
      finder.setup(':has-slotted', node, {
        warn: true
      });
      const res = finder._matchPseudoClassSelector(leaf, node, {
        warn: true
      });
      const { called } = stubWarn;
      stubWarn.restore();
      assert.strictEqual(called, true, 'called');
      assert.deepEqual([...res], [], 'result');
    });

    // unknown
    it('should throw', () => {
      const leaf = {
        children: null,
        name: 'foo',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder.setup(':foo', node);
      assert.throws(
        () => finder._matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Unknown pseudo-class :foo',
            'message');
          return true;
        }
      );
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'foo',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder.setup(':foo', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {
        forgive: true
      });
      assert.deepEqual([...res], [], 'result');
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: '-webkit-foo',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder.setup(':-webkit-foo', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual([...res], [], 'result');
    });

    it('should warn', () => {
      const leaf = {
        children: null,
        name: '-webkit-foo',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const stubWarn = sinon.stub(console, 'warn');
      const finder = new Finder(window);
      finder.setup(':-webkit-foo', node, {
        warn: true
      });
      const res = finder._matchPseudoClassSelector(leaf, node, {
        warn: true
      });
      const { called } = stubWarn;
      stubWarn.restore();
      assert.strictEqual(called, true, 'called');
      assert.deepEqual([...res], [], 'result');
    });

    it('should throw', () => {
      const leaf = {
        children: null,
        name: 'webkit-foo',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder.setup(':webkit-foo', node);
      assert.throws(
        () => finder._matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Unknown pseudo-class :webkit-foo',
            'message');
          return true;
        }
      );
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: 'webkit-foo',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder.setup(':webkit-foo', node);
      const res = finder._matchPseudoClassSelector(leaf, node, {
        forgive: true
      });
      assert.deepEqual([...res], [], 'result');
    });

    it('should throw', () => {
      const leaf = {
        children: null,
        name: '-webkitfoo',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder.setup(':-webkitfoo', node);
      assert.throws(
        () => finder._matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Unknown pseudo-class :-webkitfoo',
            'message');
          return true;
        }
      );
    });

    it('should not match', () => {
      const leaf = {
        children: null,
        name: '-webkitfoo',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const finder = new Finder(window);
      finder.setup(':-webkitfoo', node);
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
      finder.setup(':foobar div', node);
      assert.throws(
        () => finder._matchShadowHostPseudoClass(ast, node),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector :foobar',
            'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      const ast = {
        children: [
          {
            children: [
              {
                name: 'baz',
                type: ID_SELECTOR
              }
            ],
            type: SELECTOR
          }
        ],
        name: 'foobar',
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
      finder.setup(':foobar(#baz) div', node);
      assert.throws(
        () => finder._matchShadowHostPseudoClass(ast, node),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector :foobar',
            'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      const ast = {
        children: null,
        name: 'host-context',
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
      finder.setup(':host-context div', node);
      assert.throws(
        () => finder._matchShadowHostPseudoClass(ast, node),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector :host-context',
            'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      const ast = {
        children: [],
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
      finder.setup(':host() div', node);
      assert.throws(
        () => finder._matchShadowHostPseudoClass(ast, node),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector :host()',
            'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      const ast = {
        children: [],
        name: 'host-context',
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
      finder.setup(':host-context() div', node);
      assert.throws(
        () => finder._matchShadowHostPseudoClass(ast, node),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector :host-context()',
            'message');
          return true;
        }
      );
    });

    it('should get matched node', () => {
      const ast = {
        children: null,
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
      finder.setup(':host div', node);
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
                type: ID_SELECTOR
              },
              {
                name: ' ',
                type: COMBINATOR
              },
              {
                name: 'foobar',
                type: ID_SELECTOR
              }
            ],
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
      finder.setup(':host(#baz #foobar) div', node);
      assert.throws(
        () => finder._matchShadowHostPseudoClass(ast, node),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector :host(#baz #foobar)',
            'message');
          return true;
        }
      );
    });

    it('should get matched node', () => {
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
      const res = finder._matchShadowHostPseudoClass(ast, node);
      assert.deepEqual(res, null, 'result');
    });

    it('should throw', () => {
      const ast = {
        children: [
          {
            children: [
              {
                name: 'baz',
                type: ID_SELECTOR
              },
              {
                name: ' ',
                type: COMBINATOR
              },
              {
                name: 'foobar',
                type: ID_SELECTOR
              }
            ],
            type: SELECTOR
          }
        ],
        name: 'host-context',
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
      finder.setup(':host-context(#baz #foobar) div', node);
      assert.throws(
        () => finder._matchShadowHostPseudoClass(ast, node),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message,
            'Invalid selector :host-context(#baz #foobar)', 'message');
          return true;
        }
      );
    });

    it('should get matched node', () => {
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
        name: 'host-context',
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
      finder.setup(':host-context(#baz) div', node);
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
                type: ID_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        name: 'host-context',
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
      finder.setup(':host-context(#div0) div', node);
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
                type: ID_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        name: 'host-context',
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
      finder.setup(':host-context(#foobar) div', node);
      const res = finder._matchShadowHostPseudoClass(ast, node);
      assert.deepEqual(res, null, 'result');
    });

    it('should not match', () => {
      const ast = {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    type: 'Raw',
                    value: 'checked'
                  }
                ],
                loc: null,
                name: 'state',
                type: PS_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        name: 'host',
        type: PS_CLASS_SELECTOR
      };
      class LabeledCheckbox extends window.HTMLElement {
        constructor() {
          super();
          this._internals = this.attachInternals();
          // ElementInternals.states is not implemented in jsdom
          if (!this._internals.states) {
            this._internals.states = new Set();
          }
          this.addEventListener('click', this._onClick.bind(this));
          const shadowRoot = this.attachShadow({ mode: 'open' });
          shadowRoot.innerHTML = `
            <style>
              :host::before {
                content: '[ ]';
                white-space: pre;
                font-family: monospace;
              }
              :host(:state(checked))::before {
                content: '[x]'
              }
            </style>
            <div>
              <slot>Label</slot>
            </div>
          `;
        }

        get checked() {
          return this._internals.states.has('checked');
        }

        set checked(flag) {
          if (flag) {
            this._internals.states.add('checked');
          } else {
            this._internals.states.delete('checked');
          }
        }

        _onClick(event) {
          this.checked = !this.checked;
        }
      }
      window.customElements.define('labeled-checkbox', LabeledCheckbox);
      const host = document.createElement('labeled-checkbox');
      const parent = document.getElementById('div0');
      parent.appendChild(host);
      const node = host.shadowRoot;
      const finder = new Finder(window);
      finder.setup(':host(:state(checked)) div', node);
      const res = finder._matchShadowHostPseudoClass(ast, node);
      assert.deepEqual(res, null, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    type: 'Raw',
                    value: 'checked'
                  }
                ],
                loc: null,
                name: 'state',
                type: PS_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        name: 'host',
        type: PS_CLASS_SELECTOR
      };
      class LabeledCheckbox extends window.HTMLElement {
        constructor() {
          super();
          this._internals = this.attachInternals();
          // ElementInternals.states is not implemented in jsdom
          if (!this._internals.states) {
            this._internals.states = new Set();
          }
          this.addEventListener('click', this._onClick.bind(this));
          const shadowRoot = this.attachShadow({ mode: 'open' });
          shadowRoot.innerHTML = `
            <style>
              :host::before {
                content: '[ ]';
                white-space: pre;
                font-family: monospace;
              }
              :host(:state(checked))::before {
                content: '[x]'
              }
            </style>
            <div>
              <slot>Label</slot>
            </div>
          `;
        }

        _onClick(event) {
          if (this._internals.states.has('checked')) {
            this._internals.states.delete('checked');
          } else {
            this._internals.states.add('checked');
          }
        }
      }
      window.customElements.define('labeled-checkbox', LabeledCheckbox);
      const host = document.createElement('labeled-checkbox');
      const parent = document.getElementById('div0');
      parent.appendChild(host);
      const node = host.shadowRoot;
      host.click();
      const finder = new Finder(window);
      finder.setup(':host(:state(checked)) div', node);
      const res = finder._matchShadowHostPseudoClass(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    type: 'Raw',
                    value: 'checked'
                  }
                ],
                loc: null,
                name: 'state',
                type: PS_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        name: 'host',
        type: PS_CLASS_SELECTOR
      };
      class LabeledCheckbox extends window.HTMLElement {
        constructor() {
          super();
          this._internals = this.attachInternals();
          // ElementInternals.states is not implemented in jsdom
          if (!this._internals.states) {
            this._internals.states = new Set();
          }
          this.addEventListener('click', this._onClick.bind(this));
          const shadowRoot = this.attachShadow({ mode: 'open' });
          shadowRoot.innerHTML = `
            <style>
              :host::before {
                content: '[ ]';
                white-space: pre;
                font-family: monospace;
              }
              :host(:state(checked))::before {
                content: '[x]'
              }
            </style>
            <div>
              <slot>Label</slot>
            </div>
          `;
        }

        _onClick(event) {
          if (this._internals.states.has('checked')) {
            this._internals.states.delete('checked');
          } else {
            this._internals.states.add('checked');
          }
        }
      }
      window.customElements.define('labeled-checkbox', LabeledCheckbox);
      const host = document.createElement('labeled-checkbox');
      const parent = document.getElementById('div0');
      parent.appendChild(host);
      const node = host.shadowRoot;
      const finder = new Finder(window);
      finder.setup(':host(:state(checked)) div', node);
      const res = finder._matchShadowHostPseudoClass(ast, node);
      assert.deepEqual(res, null, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    type: 'Raw',
                    value: 'checked'
                  }
                ],
                loc: null,
                name: 'state',
                type: PS_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        name: 'host',
        type: PS_CLASS_SELECTOR
      };
      class LabeledCheckbox extends window.HTMLElement {
        constructor() {
          super();
          this._internals = this.attachInternals();
          // ElementInternals.states is not implemented in jsdom
          if (!this._internals.states) {
            this._internals.states = new Set();
          }
          this.addEventListener('click', this._onClick.bind(this));
          const shadowRoot = this.attachShadow({ mode: 'open' });
          shadowRoot.innerHTML = `
            <style>
              :host::before {
                content: '[ ]';
                white-space: pre;
                font-family: monospace;
              }
              :host(:state(checked))::before {
                content: '[x]'
              }
            </style>
            <div>
              <slot>Label</slot>
            </div>
          `;
        }

        get checked() {
          return this._internals.states.has('checked');
        }

        set checked(flag) {
          if (flag) {
            this._internals.states.add('checked');
          } else {
            this._internals.states.delete('checked');
          }
        }

        _onClick(event) {
          this.checked = !this.checked;
        }
      }
      window.customElements.define('labeled-checkbox', LabeledCheckbox);
      const host = document.createElement('labeled-checkbox');
      const parent = document.getElementById('div0');
      parent.appendChild(host);
      const node = host.shadowRoot;
      host.click();
      const finder = new Finder(window);
      finder.setup(':host(:state(checked)) div', node);
      const res = finder._matchShadowHostPseudoClass(ast, node);
      assert.deepEqual(res, node, 'result');
    });
  });

  describe('match selector', () => {
    it('should get matched node(s)', () => {
      const ast = {
        name: 'foo',
        type: CLASS_SELECTOR
      };
      const node = document.getElementById('div5');
      const finder = new Finder(window);
      finder.setup('.foo', document);
      const res = finder._matchSelector(ast, node);
      assert.strictEqual(res.size, 1, 'size');
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should get matched node', () => {
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
      const res = finder._matchSelector(ast, node);
      assert.strictEqual(res.size, 1, 'size');
      assert.deepEqual([...res], [
        node
      ], 'result');
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
      const res = finder._matchSelector(ast, node);
      assert.strictEqual(res.size, 0, 'size');
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'div0',
        type: ID_SELECTOR
      };
      const node = document.getElementById('div0');
      const finder = new Finder(window);
      finder.setup('.foo', document);
      const res = finder._matchSelector(ast, node);
      assert.strictEqual(res.size, 1, 'size');
      assert.deepEqual([...res], [
        node
      ], 'result');
    });

    it('should not match', () => {
      const ast = {
        name: 'foo',
        type: ID_SELECTOR
      };
      const node = document.getElementById('div0');
      const finder = new Finder(window);
      finder.setup('.foo', document);
      const res = finder._matchSelector(ast, node);
      assert.strictEqual(res.size, 0, 'size');
      assert.deepEqual([...res], [], 'result');
    });

    it('should get matched node', () => {
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
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      const node = document.getElementById('span3');
      const finder = new Finder(window);
      finder.setup('[hidden]', document);
      const res = finder._matchSelector(ast, node);
      assert.strictEqual(res.size, 1, 'size');
      assert.deepEqual([...res], [
        document.getElementById('span3')
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const ast = {
        name: 'dt',
        type: TYPE_SELECTOR
      };
      const node = document.getElementById('dt1');
      const finder = new Finder(window);
      finder.setup('dt', document);
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
      const res = finder._matchSelector(ast, node);
      assert.strictEqual(res.size, 1, 'size');
      assert.deepEqual([...res], [
        node
      ], 'result');
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
        () => finder._matchSelector(ast, node),
        e => {
          assert.strictEqual(e instanceof window.DOMException, true,
            'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Unknown pseudo-element ::foo',
            'message');
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
      const res = finder._matchSelector(ast, node);
      assert.strictEqual(res.size, 0, 'size');
      assert.deepEqual([...res], [], 'result');
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
      const res = finder._matchSelector(ast, node, {
        warn: true
      });
      const { called } = stubWarn;
      stubWarn.restore();
      assert.strictEqual(called, true, 'called');
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
      const res = finder._matchSelector(ast, node);
      assert.deepEqual([...res], [], 'result');
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
      const finder = new Finder(window);
      finder.setup('li#li1.li', document);
      const res = finder._matchLeaves(leaves, node);
      assert.strictEqual(res, true, 'result');
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
      const finder = new Finder(window);
      finder.setup('li#li1.foobar', document);
      const res = finder._matchLeaves(leaves, node);
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('find descendant nodes', () => {
    it('should get matched node(s)', () => {
      const leaves = [
        {
          name: 'foobar',
          type: ID_SELECTOR
        }
      ];
      const parent = document.createElement('div');
      const node = document.createElement('div');
      node.id = 'foobar';
      parent.appendChild(node);
      const finder = new Finder(window);
      finder.setup('div #foobar', parent);
      const res = finder._findDescendantNodes(leaves, parent);
      assert.deepEqual([...res], [
        node
      ], 'nodes');
    });

    it('should get matched node(s)', () => {
      const leaves = [
        {
          name: '\\*',
          type: TYPE_SELECTOR
        }
      ];
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('ul *', document);
      const res = finder._findDescendantNodes(leaves, node);
      assert.deepEqual([...res], [
        document.getElementById('li1'),
        document.getElementById('li2'),
        document.getElementById('li3')
      ], 'nodes');
    });

    it('should get matched node(s)', () => {
      const leaves = [
        {
          name: 'li3',
          type: ID_SELECTOR
        }
      ];
      const refNode = document.getElementById('ul1');
      const node = document.getElementById('li3');
      const finder = new Finder(window);
      finder.setup('ul #li3', document);
      const res = finder._findDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [
        node
      ], 'nodes');
    });

    it('should not match', () => {
      const leaves = [
        {
          name: 'foobar',
          type: ID_SELECTOR
        }
      ];
      const refNode = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('ul #foobar', document);
      const res = finder._findDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should not match', () => {
      const leaves = [
        {
          name: 'ul1',
          type: ID_SELECTOR
        }
      ];
      const refNode = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('div #ul1', document);
      const res = finder._findDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should get matched node(s)', () => {
      const leaves = [
        {
          name: 'li3',
          type: ID_SELECTOR
        },
        {
          name: 'li',
          type: TYPE_SELECTOR
        }
      ];
      const refNode = document.getElementById('ul1');
      const node = document.getElementById('li3');
      const finder = new Finder(window);
      finder.setup('ul li#li3', document);
      const res = finder._findDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [
        node
      ], 'nodes');
    });

    it('should not match', () => {
      const leaves = [
        {
          name: 'li3',
          type: ID_SELECTOR
        },
        {
          name: 'foobar',
          type: CLASS_SELECTOR
        }
      ];
      const refNode = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('ul #li3.foobar', document);
      const res = finder._findDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should get matched node(s)', () => {
      const leaves = [
        {
          name: 'li',
          type: CLASS_SELECTOR
        }
      ];
      const refNode = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('ul .li', document);
      const res = finder._findDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [
        document.getElementById('li1'),
        document.getElementById('li2'),
        document.getElementById('li3')
      ], 'nodes');
    });

    it('should get matched node(s)', () => {
      const leaves = [
        {
          name: 'li',
          type: CLASS_SELECTOR
        },
        {
          children: null,
          name: 'first-child',
          type: PS_CLASS_SELECTOR
        }
      ];
      const refNode = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('ul .li:first-child', document);
      const res = finder._findDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [
        document.getElementById('li1')
      ], 'nodes');
    });

    it('should not match', () => {
      const leaves = [
        {
          name: 'foobar',
          type: CLASS_SELECTOR
        }
      ];
      const refNode = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('ul .foobar', document);
      const res = finder._findDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should get matched node(s)', () => {
      const leaves = [
        {
          name: 'div',
          type: TYPE_SELECTOR
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
      finder.setup('root div', root);
      const res = finder._findDescendantNodes(leaves, root);
      assert.deepEqual([...res], [
        div1,
        div2,
        div3,
        div4
      ], 'nodes');
    });

    it('should get matched node(s)', () => {
      const leaves = [
        {
          name: '*|li',
          type: TYPE_SELECTOR
        }
      ];
      const refNode = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('ul *|li', document);
      const res = finder._findDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [
        document.getElementById('li1'),
        document.getElementById('li2'),
        document.getElementById('li3')
      ], 'nodes');
    });

    it('should get matched node(s)', () => {
      const leaves = [
        {
          name: 'li',
          type: TYPE_SELECTOR
        }
      ];
      const refNode = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('ul li', document);
      const res = finder._findDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [
        document.getElementById('li1'),
        document.getElementById('li2'),
        document.getElementById('li3')
      ], 'nodes');
    });

    it('should get matched node(s)', () => {
      const leaves = [
        {
          name: 'li',
          type: TYPE_SELECTOR
        },
        {
          children: null,
          name: 'first-child',
          type: PS_CLASS_SELECTOR
        }
      ];
      const refNode = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('ul li:first-child', document);
      const res = finder._findDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [
        document.getElementById('li1')
      ], 'nodes');
    });

    it('should not match', () => {
      const leaves = [
        {
          name: 'ol',
          type: TYPE_SELECTOR
        }
      ];
      const refNode = document.getElementById('div1');
      const finder = new Finder(window);
      finder.setup('div ol', document);
      const res = finder._findDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should not match', () => {
      const leaves = [
        {
          name: 'before',
          type: PS_ELEMENT_SELECTOR
        }
      ];
      const refNode = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('ul ::before', document);
      const res = finder._findDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should get matched node(s)', () => {
      const leaves = [
        {
          flags: null,
          finder: null,
          name: {
            name: 'hidden',
            type: IDENT
          },
          type: ATTR_SELECTOR,
          value: null
        }
      ];
      const refNode = document.getElementById('dl1');
      const span1 = document.getElementById('span1');
      const span3 = document.getElementById('span3');
      const finder = new Finder(window);
      finder.setup('dl [hidden]', document);
      const res = finder._findDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [
        span1,
        span3
      ], 'nodes');
    });

    it('should get matched node(s)', () => {
      const leaves = [
        {
          children: null,
          name: 'first-child',
          type: PS_CLASS_SELECTOR
        }
      ];
      const refNode = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('ul :first-child', document);
      const res = finder._findDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [
        refNode.firstElementChild
      ], 'nodes');
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
      const finder = new Finder(window);
      finder.setup('li + li', node);
      const res = finder._matchCombinator(twig, node, {});
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
      const finder = new Finder(window);
      finder.setup('li + li', node);
      const res = finder._matchCombinator(twig, node, {});
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
      const finder = new Finder(window);
      finder.setup('li + li', node);
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
            type: TYPE_SELECTOR
          }
        ]
      };
      const node = document.getElementById('li3');
      const finder = new Finder(window);
      finder.setup('li + li', node);
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
            type: TYPE_SELECTOR
          }
        ]
      };
      const node = document.getElementById('li3');
      const finder = new Finder(window);
      finder.setup('li ~ li', node);
      const res = finder._matchCombinator(twig, node, {});
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
      const finder = new Finder(window);
      finder.setup('li ~ li', node);
      const res = finder._matchCombinator(twig, node, {});
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
      const finder = new Finder(window);
      finder.setup('li ~ li', node);
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
            type: TYPE_SELECTOR
          }
        ]
      };
      const node = document.getElementById('li3');
      const finder = new Finder(window);
      finder.setup('li ~ li', node);
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
            type: TYPE_SELECTOR
          }
        ]
      };
      const node = document.getElementById('li3');
      const finder = new Finder(window);
      finder.setup('ul > li', node);
      const res = finder._matchCombinator(twig, node, {});
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
      const finder = new Finder(window);
      finder.setup('ol > li', node);
      const res = finder._matchCombinator(twig, node, {});
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
      const finder = new Finder(window);
      finder.setup('ul > .li', node);
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
            type: CLASS_SELECTOR
          }
        ]
      };
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('ul > .foobar', node);
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
            type: TYPE_SELECTOR
          }
        ]
      };
      const node = document.getElementById('li3');
      const finder = new Finder(window);
      finder.setup('ul li', node);
      const res = finder._matchCombinator(twig, node, {});
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
      const finder = new Finder(window);
      finder.setup('ol li', node);
      const res = finder._matchCombinator(twig, node, {});
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
      const finder = new Finder(window);
      finder.setup('ul .li', node);
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
            type: CLASS_SELECTOR
          }
        ]
      };
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('ol .foobar', node);
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
            type: ID_SELECTOR
          }
        ]
      };
      const node = document.getElementById('dl1');
      const finder = new Finder(window);
      finder.setup('dl #dd2 span ', node);
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
            type: ID_SELECTOR
          }
        ]
      };
      const node = document.getElementById('dl1');
      const finder = new Finder(window);
      finder.setup('dl #foobar span', node);
      const res = finder._matchCombinator(twig, node, {
        dir: 'next'
      });
      assert.deepEqual([...res], [], 'result');
    });
  });

  describe('find matched node(s) from sub walker', () => {
    it('should get matched node', () => {
      const finder = new Finder(window);
      finder.setup('ul', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [{ leaves }] }]] = finder._correspond('ul');
      const res = finder._findQswalker(leaves, document);
      assert.deepEqual(res, [
        document.getElementById('ul1')
      ], 'result');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      finder.setup('ol', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [{ leaves }] }]] = finder._correspond('ol');
      const res = finder._findQswalker(leaves, document);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node', () => {
      const node = document.createElement('ul');
      const child = document.createElement('li');
      node.appendChild(child);
      const finder = new Finder(window);
      finder.setup('ul', node);
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [{ leaves }] }]] = finder._correspond('ul');
      const res = finder._findQswalker(leaves, node);
      assert.deepEqual(res, [
        node
      ], 'result');
    });

    it('should get matched node', () => {
      const node = document.createElement('ul');
      const child = document.createElement('li');
      node.appendChild(child);
      const finder = new Finder(window);
      finder.setup('li', node);
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [{ leaves }] }]] = finder._correspond('li');
      const res = finder._findQswalker(leaves, node);
      assert.deepEqual(res, [
        child
      ], 'result');
    });

    it('should get matched node', () => {
      const node = document.createElement('ul');
      const child = document.createElement('li');
      const child2 = document.createElement('li');
      node.append(child, child2);
      const finder = new Finder(window);
      finder.setup('li', node);
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [{ leaves }] }]] = finder._correspond('li');
      const res = finder._findQswalker(leaves, node);
      assert.deepEqual(res, [
        child
      ], 'result');
    });

    it('should get matched nodes', () => {
      const node = document.createElement('ul');
      const child = document.createElement('li');
      const child2 = document.createElement('li');
      node.append(child, child2);
      const finder = new Finder(window);
      finder.setup('li', node);
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [{ leaves }] }]] = finder._correspond('li');
      const res = finder._findQswalker(leaves, node, {
        targetType: 'all'
      });
      assert.deepEqual(res, [
        child,
        child2
      ], 'result');
    });

    it('should get matched node', () => {
      const node = document.createElement('ul');
      const child = document.createElement('li');
      node.appendChild(child);
      const finder = new Finder(window);
      finder.setup('ul', node);
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [{ leaves }] }]] = finder._correspond('ul');
      const res = finder._findQswalker(leaves, node);
      assert.deepEqual(res, [
        node
      ], 'result');
    });

    it('should get matched node', () => {
      const finder = new Finder(window);
      finder.setup('li', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [{ leaves }] }]] = finder._correspond('li');
      const res = finder._findQswalker(leaves, document.getElementById('li1'));
      assert.deepEqual(res, [
        document.getElementById('li2')
      ], 'result');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      finder.setup('li', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [{ leaves }] }]] = finder._correspond('li');
      const res = finder._findQswalker(leaves, document.getElementById('li3'));
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      finder.setup('li', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [{ leaves }] }]] = finder._correspond('li');
      finder._findQswalker(leaves, document.getElementById('li2'));
      const res = finder._findQswalker(leaves, document.getElementById('li1'), {
        force: true
      });
      assert.deepEqual(res, [], 'result');
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
        type: TYPE_SELECTOR
      };
      const finder = new Finder(window);
      finder.setup('li', node);
      const res = finder._findLineal([leaf], {
        complex: false
      });
      assert.deepEqual(res, [
        [document.getElementById('li1')],
        true
      ], 'result');
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
      assert.deepEqual(res, [
        [document.getElementById('li1')],
        true
      ], 'result');
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
      assert.deepEqual(res, [
        [document.getElementById('ul1')],
        true
      ], 'result');
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
      assert.deepEqual(res, [
        [],
        false
      ], 'result');
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
      assert.deepEqual(res, [
        [document.getElementById('li2')],
        true
      ], 'result');
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
      assert.deepEqual(res, [
        [document.getElementById('li2')],
        true
      ], 'result');
    });
  });

  describe('find entry nodes', () => {
    it('should not match', () => {
      const finder = new Finder(window);
      finder.setup('::before', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [twig] }]] = finder._correspond('::before');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(res.nodes, [], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, false, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder.setup('#ul1', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [twig] }]] = finder._correspond('#ul1');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual(res.nodes, [
        document.getElementById('ul1')
      ], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('#ul1', node);
      const [[{ branch: [twig] }]] = finder._correspond('#ul1');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual(res.nodes, [
        node
      ], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should not match', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('#ul1', node);
      const [[{ branch: [twig] }]] = finder._correspond('#ul1');
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
      const [[{ branch: [twig] }]] = finder._correspond('#ul1');
      const res = finder._findEntryNodes(twig, 'lineal');
      assert.deepEqual(res.nodes, [
        document.getElementById('ul1')
      ], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder.setup('#li1.li', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [twig] }]] = finder._correspond('#li1.li');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual(res.nodes, [
        document.getElementById('li1')
      ], 'nodes');
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
      finder._prepareQuerySelectorWalker(parent);
      const [[{ branch: [twig] }]] = finder._correspond('#li1.li');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual(res.nodes, [
        node
      ], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      finder.setup('#li1.foobar', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [twig] }]] = finder._correspond('#li1.foobar');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual(res.nodes, [], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, false, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder.setup('ul#ul1', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [twig] }]] = finder._correspond('ul#ul1');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual(res.nodes, [
        document.getElementById('ul1')
      ], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      finder.setup('#foobar', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [twig] }]] = finder._correspond('#foobar');
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
      finder._prepareQuerySelectorWalker(frag);
      const [[{ branch: [twig] }]] = finder._correspond('#foobar');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual(res.nodes, [
        node
      ], 'nodes');
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
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [twig] }]] = finder._correspond('#foobar');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(res.nodes, [], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, false, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder.setup('#li1:first-child', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [twig] }]] = finder._correspond('#li1:first-child');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual(res.nodes, [
        document.getElementById('li1')
      ], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('.li', node);
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [twig] }]] = finder._correspond('.li');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual(res.nodes, [
        document.getElementById('li1')
      ], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('.li', node);
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [twig] }]] = finder._correspond('.li');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(res.nodes, [
        document.getElementById('li1'),
        document.getElementById('li2'),
        document.getElementById('li3')
      ], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder.setup('.li', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [twig] }]] = finder._correspond('.li');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(res.nodes, [
        document.getElementById('li1'),
        document.getElementById('li2'),
        document.getElementById('li3')
      ], 'nodes');
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
      finder._prepareQuerySelectorWalker(frag);
      const [[{ branch: [twig] }]] = finder._correspond('.foo');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(res.nodes, [
        parent,
        node
      ], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder.setup('li.li', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [twig] }]] = finder._correspond('li.li');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(res.nodes, [
        document.getElementById('li1'),
        document.getElementById('li2'),
        document.getElementById('li3')
      ], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('dd2');
      const finder = new Finder(window);
      finder.setup('.dd', node);
      const [[{ branch: [twig] }]] = finder._correspond('.dd');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual(res.nodes, [
        node
      ], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should not match', () => {
      const node = document.getElementById('span2');
      const finder = new Finder(window);
      finder.setup('.dd', node);
      const [[{ branch: [twig] }]] = finder._correspond('.dd');
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
      const [[{ branch: [twig] }]] = finder._correspond('.dd');
      const res = finder._findEntryNodes(twig, 'lineal');
      assert.deepEqual(res.nodes, [
        document.getElementById('dd2')
      ], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should not match', () => {
      const node = document.getElementById('span2');
      const finder = new Finder(window);
      finder.setup('.li', node);
      const [[{ branch: [twig] }]] = finder._correspond('.li');
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
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [twig] }]] = finder._correspond('.dd');
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
      const [[{ branch: [twig] }]] = finder._correspond('ul');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual(res.nodes, [
        node
      ], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should not match', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('ul', node);
      const [[{ branch: [twig] }]] = finder._correspond('ul');
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
      const [[{ branch: [twig] }]] = finder._correspond('ul');
      const res = finder._findEntryNodes(twig, 'lineal');
      assert.deepEqual(res.nodes, [
        document.getElementById('ul1')
      ], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should not match', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('ol', node);
      const [[{ branch: [twig] }]] = finder._correspond('ol');
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
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [twig] }]] = finder._correspond('li');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual(res.nodes, [
        document.getElementById('li1')
      ], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('li:last-child', node);
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [twig] }]] = finder._correspond('li:last-child');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(res.nodes, [
        document.getElementById('li3')
      ], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('li:first-child', node);
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [twig] }]] = finder._correspond('li:first-child');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(res.nodes, [
        document.getElementById('li1')
      ], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should not match', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('li:first-child', node);
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [twig] }]] = finder._correspond('li:first-child');
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
      const [[{ branch: [twig] }]] = finder._correspond('dd:first-child');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual(res.nodes, [], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, false, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder.setup('li.li:last-child', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [twig] }]] = finder._correspond('li.li:last-child');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(res.nodes, [
        document.getElementById('li3')
      ], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const finder = new Finder(window);
      finder.setup('li.li:first-child + li.li', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [twig] }]] =
        finder._correspond('li.li:first-child + li.li');
      const res = finder._findEntryNodes(twig, 'all', true);
      assert.deepEqual(res.nodes, [
        document.getElementById('li1')
      ], 'nodes');
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
      finder._prepareQuerySelectorWalker(frag);
      const [[{ branch: [twig] }]] = finder._correspond('.foo.bar');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(res.nodes, [
        parent
      ], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should not match', () => {
      const finder = new Finder(window);
      finder.setup('.foobar', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [twig] }]] = finder._correspond('.foobar');
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
      finder._prepareQuerySelectorWalker(frag);
      const [[{ branch: [twig] }]] = finder._correspond('div');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(res.nodes, [
        node
      ], 'nodes');
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
      finder._prepareQuerySelectorWalker(parent);
      const [[{ branch: [twig] }]] = finder._correspond('div');
      const res = finder._findEntryNodes(twig, 'all');
      assert.deepEqual(res.nodes, [
        parent,
        node
      ], 'nodes');
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
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [twig] }]] = finder._correspond('.foo');
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
      finder._prepareQuerySelectorWalker(frag);
      const [[{ branch: [twig] }]] = finder._correspond('p');
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
      const [[{ branch: [twig] }]] = finder._correspond(':first-child');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual(res.nodes, [
        node
      ], 'nodes');
      assert.strictEqual(res.compound, false, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('[class]:first-child', node);
      const [[{ branch: [twig] }]] =
          finder._correspond('[class]:first-child');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual(res.nodes, [
        node
      ], 'nodes');
      assert.strictEqual(res.compound, true, 'compound');
      assert.strictEqual(res.filtered, true, 'filtered');
      assert.strictEqual(res.pending, false, 'pending');
    });

    it('should be pended', () => {
      const finder = new Finder(window);
      finder.setup(':first-child', document);
      finder._prepareQuerySelectorWalker(document);
      const [[{ branch: [twig] }]] = finder._correspond(':first-child');
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
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [twig] }]] = finder._correspond(':host div');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual(res.nodes, [
        node
      ], 'nodes');
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
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [twig] }]] = finder._correspond(':host(#baz) div');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual(res.nodes, [
        node
      ], 'nodes');
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
      finder._prepareQuerySelectorWalker(node);
      const [[{ branch: [twig] }]] = finder._correspond(':host(#baz)');
      const res = finder._findEntryNodes(twig, 'first');
      assert.deepEqual(res.nodes, [
        node
      ], 'nodes');
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
      const [[{ branch: [twig] }]] = finder._correspond(':host:is(#baz)');
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
      const [[{ branch: [twig] }]] = finder._correspond(':host:has(#foobar)');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual(res.nodes, [
        node
      ], 'nodes');
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
      const [[{ branch: [twig] }]] =
        finder._correspond(':host:has(#foobar):host-context(#div0)');
      const res = finder._findEntryNodes(twig, 'self');
      assert.deepEqual(res.nodes, [
        node
      ], 'nodes');
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
        [
          [],
          [node]
        ]
      ], 'result');
    });

    it('should get list and matrix', () => {
      const node = document.getElementById('li1');
      const finder = new Finder(window);
      finder.setup('li:last-child, li:first-child + li', node);
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
        [
          [],
          [node]
        ]
      ], 'result');
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder.setup('li:last-child, li:first-child + li', document);
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
      finder.setup('li:last-child, li:first-child + li', document);
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
      finder.setup(':nth-child(2n), :nth-of-type(2n+3)', root);
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
      finder.setup(':nth-child(2n), :nth-of-type(2n+3)', frag);
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
      finder.setup('div', div2);
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
      finder.setup('root', div2);
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
          [root]
        ]
      ], 'result');
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder.setup('* > li', document);
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
      ], 'result');
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder.setup('* > li', document);
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
            document.getElementById('li1')
          ]
        ]
      ], 'result');
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder.setup('ul > *', document);
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
        [
          [
            document.getElementById('ul1')
          ]
        ]
      ], 'result');
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder.setup('ul > *', document);
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
        [
          [
            document.getElementById('ul1')
          ]
        ]
      ], 'result');
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
      finder._prepareQuerySelectorWalker(container);
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
        [
          [
            ancestor,
            parent,
            child
          ]
        ]
      ], 'result');
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
      finder._prepareQuerySelectorWalker(container);
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
        [
          [
            ancestor
          ]
        ]
      ], 'result');
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder.setup('#ul1 > #li1', document);
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
        [
          [
            document.getElementById('li1')
          ]
        ]
      ], 'result');
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder.setup('ul > #li1', document);
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
        [
          [
            document.getElementById('li1')
          ]
        ]
      ], 'result');
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder.setup('#ul1 > li', document);
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
        [
          [
            document.getElementById('ul1')
          ]
        ]
      ], 'result');
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder.setup('ul > li::after', document);
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
        [
          []
        ]
      ], 'result');
    });

    it('should get list and matrix', () => {
      const finder = new Finder(window);
      finder.setup('ul::before > li', document);
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
      finder.setup('ul > li', document);
      const twig = {
        combo: {
          name: '>'
        },
        leaves: [
          {
            name: 'ul',
            type: TYPE_SELECTOR
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
      finder.setup('ul > li', document);
      const twig = {
        combo: {
          name: '>'
        },
        leaves: [
          {
            name: 'li',
            type: TYPE_SELECTOR
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
      finder.setup('ol > li', document);
      const twig = {
        combo: {
          name: '>'
        },
        leaves: [
          {
            name: 'ol',
            type: TYPE_SELECTOR
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

  describe('match node to previous direction', () => {
    it('should get matched node(s)', () => {
      const node = document.getElementById('li2');
      const finder = new Finder(window);
      finder.setup('ul > .li ~ li', document);
      const [[{ branch }]] = finder._correspond('ul > .li ~ li');
      const res = finder._matchNodePrev(branch, node, {
        index: 1
      });
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const node = document.getElementById('li2');
      const finder = new Finder(window);
      finder.setup('ol > .li ~ li', document);
      const [[{ branch }]] = finder._correspond('ol > .li ~ li');
      const res = finder._matchNodePrev(branch, node, {
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
      assert.deepEqual([...res], [
        document.getElementById('li2'),
        document.getElementById('li3')
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const node = document.getElementById('li2');
      const finder = new Finder(window);
      finder.setup('li:last-child, li:first-child + li', node);
      const res = finder.find('self');
      assert.deepEqual([...res], [
        node
      ], 'result');
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
      finder.setup('span', root);
      const res = finder.find('first');
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
      finder.setup('div > p > span', root);
      const res = finder.find('all');
      assert.deepEqual([...res], [
        span,
        span2
      ], 'result');
    });

    it('should not match', () => {
      const node = document.getElementById('ul1');
      const finder = new Finder(window);
      finder.setup('li:active', node);
      finder._prepareQuerySelectorWalker(node);
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
      assert.deepEqual([...res], [
        span2,
        span3,
        span4,
        span6,
        span7,
        span8
      ], 'result');
    });
  });
});
