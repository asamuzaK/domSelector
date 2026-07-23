/**
 * evaluator.test.js
 */

/* api */
import { strict as assert } from 'node:assert';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, it, xit } from 'mocha';
import sinon from 'sinon';

/* test */
import { Evaluator } from '../src/js/evaluator.js';

/* constants */
import {
  ATTR_SELECTOR,
  CLASS_SELECTOR,
  COMBINATOR,
  IDENT,
  ID_SELECTOR,
  NEST_SELECTOR,
  NOT_SUPPORTED_ERR,
  NTH,
  OPERATOR,
  PS_CLASS_SELECTOR,
  PS_ELEMENT_SELECTOR,
  SELECTOR,
  SYNTAX_ERR,
  TYPE_SELECTOR
} from '../src/js/constant.js';
const AN_PLUS_B = 'AnPlusB';
const RAW = 'Raw';
const SELECTOR_LIST = 'SelectorList';

describe('Evaluator', () => {
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

  describe('Evaluator', () => {
    it('should be instance of Evaluator', () => {
      const evaluator = new Evaluator(window);
      assert.strictEqual(evaluator instanceof Evaluator, true, 'result');
    });

    it('should be instance of Evaluator', () => {
      const evaluator = new Evaluator(window, document);
      assert.strictEqual(evaluator instanceof Evaluator, true, 'result');
    });
  });

  describe('handle error', () => {
    it('should suppress DOMException errors when noexcept is set', () => {
      const err = new DOMException('error', SYNTAX_ERR);
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document, {
        noexcept: true
      });
      assert.doesNotThrow(() => evaluator.onError(err));
    });

    it('should rethrow TypeError when handling errors', () => {
      const err = new TypeError('error');
      const evaluator = new Evaluator(window);
      assert.throws(() => evaluator.onError(err), window.TypeError, 'error');
    });

    it('should rethrow generic or unknown errors', () => {
      const err = new Error('error');
      err.name = 'UnknownError';
      const evaluator = new Evaluator(window);
      assert.throws(() => evaluator.onError(err), Error, 'error');
    });

    it('should throw DOMException with correct properties by default', () => {
      const err = new DOMException('error', SYNTAX_ERR);
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      assert.throws(
        () => evaluator.onError(err),
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

    it('should ignore NOT_SUPPORTED_ERR and return undefined', () => {
      const err = new window.DOMException('error', NOT_SUPPORTED_ERR);
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const res = evaluator.onError(err);
      assert.strictEqual(res, undefined, 'result');
    });

    it('should suppress TypeError when noexcept is passed to onError', () => {
      const err = new TypeError('Unexpected type');
      const evaluator = new Evaluator(window);
      const res = evaluator.onError(err, {
        noexcept: true
      });
      assert.strictEqual(res, undefined, 'result');
    });

    it('should log a warning via console.warn when warn option is true', () => {
      const stubWarn = sinon.stub(console, 'warn');
      const err = new window.DOMException('error', NOT_SUPPORTED_ERR);
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document, {
        warn: true
      });
      const res = evaluator.onError(err);
      const { called } = stubWarn;
      stubWarn.restore();
      assert.strictEqual(called, true, 'called');
      assert.strictEqual(res, undefined, 'result');
    });
  });

  describe('setup evaluator', () => {
    it('should return self when setting up with a Document node', () => {
      const evaluator = new Evaluator(window);
      const res = evaluator.setup('*', document, {
        warn: true
      });
      assert.deepEqual(res, evaluator, 'result');
    });

    it('should return self when setting up with a DocumentFragment', () => {
      const frag = document.createDocumentFragment();
      const evaluator = new Evaluator(window);
      const res = evaluator.setup('*', frag, {
        warn: true
      });
      assert.deepEqual(res, evaluator, 'result');
    });

    it('should return self when setting up with an Element node', () => {
      const node = document.createElement('div');
      const evaluator = new Evaluator(window);
      const res = evaluator.setup('*', node, {
        warn: true
      });
      assert.deepEqual(res, evaluator, 'result');
    });

    it('should return self when setting up with custom options', () => {
      const node = document.createElement('div');
      const evaluator = new Evaluator(window);
      const res = evaluator.setup('*', node, {
        check: true,
        noexcept: true,
        warn: false
      });
      assert.deepEqual(res, evaluator, 'result');
    });

    it('should return self when setting up with domSymbolTree option', () => {
      const node = document.createElement('div');
      const evaluator = new Evaluator(window, {
        domSymbolTree: {},
        idlUtils: {}
      });
      const res = evaluator.setup('*', node, {
        domSymbolTree: {}
      });
      assert.deepEqual(res, evaluator, 'result');
    });
  });

  describe('create tree walker', () => {
    it('should create a TreeWalker with document as root', () => {
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const res = evaluator.createTreeWalker(document);
      assert.deepEqual(res.root, document, 'root');
    });

    it('should create a TreeWalker with an Element node as root', () => {
      const node = document.getElementById('ul1');
      const evaluator = new Evaluator(window);
      evaluator.setup('*', node);
      const res = evaluator.createTreeWalker(node);
      assert.deepEqual(res.root, node, 'root');
    });

    it('should create a TreeWalker with custom filter options', () => {
      const node = document.getElementById('ul1');
      const evaluator = new Evaluator(window);
      evaluator.setup('*', node);
      const res = evaluator.createTreeWalker(node, {
        whatToShow: 0xffffffff
      });
      assert.deepEqual(res.root, node, 'root');
    });

    it('should return cached TreeWalker instance on repeated calls', () => {
      const node = document.getElementById('ul1');
      const evaluator = new Evaluator(window);
      evaluator.setup('*', node);
      const walker1 = evaluator.createTreeWalker(node);
      assert.strictEqual(walker1.root, node, 'walker1 root is correct');
      const walker2 = evaluator.createTreeWalker(node);
      assert.strictEqual(
        walker1,
        walker2,
        'returns the exact same cached TreeWalker instance'
      );
    });
  });

  describe('match An+B', () => {
    const runNthTest = (selector, ast, node) => {
      const evaluator = new Evaluator(window);
      return evaluator
        .setup(selector, node)
        .matchPseudoClassSelector(ast, node);
    };

    it('should test true and false routes when parentNode is null', () => {
      const ast = {
        name: 'nth-child',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            nth: { a: '1', b: '1', type: AN_PLUS_B },
            selector: null,
            type: NTH
          }
        ]
      };
      const evaluator = new Evaluator(window);
      const isolatedRoot = document.createElement('div');
      evaluator.setup(':nth-child(1n)', isolatedRoot);
      const resTrue = evaluator.matchPseudoClassSelector(ast, isolatedRoot);
      assert.strictEqual(
        resTrue,
        true,
        'passes early return and matches because node is this.root'
      );
      const notRoot = document.createElement('span');
      const resFalse = evaluator.matchPseudoClassSelector(ast, notRoot);
      assert.strictEqual(
        resFalse,
        false,
        'returns false because node is not this.root and has no parentNode'
      );
    });

    it('should not match :nth-child(even)', () => {
      const ast = {
        name: 'nth-child',
        type: PS_CLASS_SELECTOR,
        children: [
          { nth: { name: 'even', type: IDENT }, selector: null, type: NTH }
        ]
      };
      const node = document.getElementById('dt1');
      assert.strictEqual(
        runNthTest(':nth-child(even)', ast, node),
        false,
        'result'
      );
    });

    it('should match :nth-child(odd)', () => {
      const ast = {
        name: 'nth-child',
        type: PS_CLASS_SELECTOR,
        children: [
          { nth: { name: 'odd', type: IDENT }, selector: null, type: NTH }
        ]
      };
      const node = document.getElementById('dt1');
      assert.strictEqual(
        runNthTest(':nth-child(odd)', ast, node),
        true,
        'result'
      );
    });

    it('should match :nth-child(odd) with selector', () => {
      const ast = {
        name: 'nth-child',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            nth: { name: 'odd', type: IDENT },
            selector: {
              children: [
                {
                  children: [{ name: 'dt', type: TYPE_SELECTOR }],
                  type: SELECTOR
                }
              ],
              type: SELECTOR_LIST
            },
            type: NTH
          }
        ]
      };
      const node = document.getElementById('dt1');
      assert.strictEqual(
        runNthTest('dt:nth-child(odd)', ast, node),
        true,
        'result'
      );
    });

    it('should match :nth-last-child(even)', () => {
      const ast = {
        name: 'nth-last-child',
        type: PS_CLASS_SELECTOR,
        children: [
          { nth: { name: 'even', type: IDENT }, selector: null, type: NTH }
        ]
      };
      const node = document.getElementById('dt1');
      assert.strictEqual(
        runNthTest(':nth-last-child(even)', ast, node),
        true,
        'result'
      );
    });

    it('should match :nth-child(3n+1)', () => {
      const ast = {
        name: 'nth-child',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            nth: { a: '3', b: '1', type: AN_PLUS_B },
            selector: null,
            type: NTH
          }
        ]
      };
      const node = document.getElementById('dt1');
      assert.strictEqual(
        runNthTest(':nth-child(3n+1)', ast, node),
        true,
        'result'
      );
    });

    it('should not match :nth-child(2n)', () => {
      const ast = {
        name: 'nth-child',
        type: PS_CLASS_SELECTOR,
        children: [
          { nth: { a: '2', type: AN_PLUS_B }, selector: null, type: NTH }
        ]
      };
      const node = document.getElementById('dt1');
      assert.strictEqual(
        runNthTest(':nth-child(2n)', ast, node),
        false,
        'result'
      );
    });

    it('should match :nth-child(3)', () => {
      const ast = {
        name: 'nth-child',
        type: PS_CLASS_SELECTOR,
        children: [
          { nth: { b: '3', type: AN_PLUS_B }, selector: null, type: NTH }
        ]
      };
      const node = document.getElementById('dt2');
      assert.strictEqual(
        runNthTest(':nth-child(3)', ast, node),
        true,
        'result'
      );
    });

    it('should match :nth-child(1)', () => {
      const ast = {
        name: 'nth-child',
        type: PS_CLASS_SELECTOR,
        children: [
          { nth: { b: '1', type: AN_PLUS_B }, selector: null, type: NTH }
        ]
      };
      const node = document.getElementById('dt1');
      assert.strictEqual(
        runNthTest(':nth-child(1)', ast, node),
        true,
        'result'
      );
    });

    it('should not match :nth-last-child(3n+1)', () => {
      const ast = {
        name: 'nth-last-child',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            nth: { a: '3', b: '1', type: AN_PLUS_B },
            selector: null,
            type: NTH
          }
        ]
      };
      const node = document.getElementById('dt1');
      assert.strictEqual(
        runNthTest(':nth-last-child(3n+1)', ast, node),
        false,
        'result'
      );
    });

    it('should not match :nth-of-type(even)', () => {
      const ast = {
        name: 'nth-of-type',
        type: PS_CLASS_SELECTOR,
        children: [
          { nth: { name: 'even', type: IDENT }, selector: null, type: NTH }
        ]
      };
      const node = document.getElementById('dt1');
      assert.strictEqual(
        runNthTest(':nth-of-type(even)', ast, node),
        false,
        'result'
      );
    });

    it('should match :nth-of-type(odd)', () => {
      const ast = {
        name: 'nth-of-type',
        type: PS_CLASS_SELECTOR,
        children: [
          { nth: { name: 'odd', type: IDENT }, selector: null, type: NTH }
        ]
      };
      const node = document.getElementById('dt1');
      assert.strictEqual(
        runNthTest(':nth-of-type(odd)', ast, node),
        true,
        'result'
      );
    });

    it('should not match :nth-last-of-type(even)', () => {
      const ast = {
        name: 'nth-last-of-type',
        type: PS_CLASS_SELECTOR,
        children: [
          { nth: { name: 'even', type: IDENT }, selector: null, type: NTH }
        ]
      };
      const node = document.getElementById('dt1');
      assert.strictEqual(
        runNthTest(':nth-last-of-type(even)', ast, node),
        false,
        'result'
      );
    });

    it('should match :nth-of-type(3n+1)', () => {
      const ast = {
        name: 'nth-of-type',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            nth: { a: '3', b: '1', type: AN_PLUS_B },
            selector: null,
            type: NTH
          }
        ]
      };
      const node = document.getElementById('dt1');
      assert.strictEqual(
        runNthTest(':nth-of-type(3n+1)', ast, node),
        true,
        'result'
      );
    });

    it('should match :nth-of-type(2n)', () => {
      const ast = {
        name: 'nth-of-type',
        type: PS_CLASS_SELECTOR,
        children: [
          { nth: { a: '2', type: AN_PLUS_B }, selector: null, type: NTH }
        ]
      };
      const node = document.getElementById('dt2');
      assert.strictEqual(
        runNthTest(':nth-of-type(2n)', ast, node),
        true,
        'result'
      );
    });

    it('should match :nth-of-type(3)', () => {
      const ast = {
        name: 'nth-of-type',
        type: PS_CLASS_SELECTOR,
        children: [
          { nth: { b: '3', type: AN_PLUS_B }, selector: null, type: NTH }
        ]
      };
      const node = document.getElementById('dt3');
      assert.strictEqual(
        runNthTest(':nth-of-type(3)', ast, node),
        true,
        'result'
      );
    });

    it('should not match :nth-last-of-type(3n+1)', () => {
      const ast = {
        name: 'nth-last-of-type',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            nth: { a: '3', b: '1', type: AN_PLUS_B },
            selector: null,
            type: NTH
          }
        ]
      };
      const node = document.getElementById('dt1');
      assert.strictEqual(
        runNthTest(':nth-last-of-type(3n+1)', ast, node),
        false,
        'result'
      );
    });

    it('should test a > 0 with valid and invalid diff boundaries', () => {
      const leaf = {
        nth: { a: '3', b: '5', type: AN_PLUS_B },
        selector: null,
        type: NTH
      };
      const ast = {
        name: 'nth-child',
        type: PS_CLASS_SELECTOR,
        children: [leaf]
      };
      const parent = document.createElement('div');
      for (let i = 0; i < 10; i++) {
        parent.appendChild(document.createElement('p'));
      }
      document.getElementById('div0').appendChild(parent);
      assert.strictEqual(
        runNthTest(':nth-child(3n+5)', ast, parent.children[7]),
        true,
        'pos=8 matches 3n+5'
      );
      assert.strictEqual(
        runNthTest(':nth-child(3n+5)', ast, parent.children[1]),
        false,
        'pos=2 fails 3n+5'
      );
    });

    it('should test a < 0 with valid and invalid diff boundaries', () => {
      const leaf = {
        nth: { a: '-3', b: '5', type: AN_PLUS_B },
        selector: null,
        type: NTH
      };
      const ast = {
        name: 'nth-child',
        type: PS_CLASS_SELECTOR,
        children: [leaf]
      };
      const parent = document.createElement('div');
      for (let i = 0; i < 10; i++) {
        parent.appendChild(document.createElement('p'));
      }
      document.getElementById('div0').appendChild(parent);
      assert.strictEqual(
        runNthTest(':nth-child(-3n+5)', ast, parent.children[1]),
        true,
        'pos=2 matches -3n+5'
      );
      assert.strictEqual(
        runNthTest(':nth-child(-3n+5)', ast, parent.children[7]),
        false,
        'pos=8 fails -3n+5'
      );
    });

    it('should branch on anb.selector caching for nth-child of sel', () => {
      const ast = {
        name: 'nth-child',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            nth: { a: '2', b: '1', type: AN_PLUS_B },
            selector: {
              children: [
                {
                  children: [{ name: 'li', type: CLASS_SELECTOR }],
                  type: SELECTOR
                }
              ],
              type: SELECTOR_LIST
            },
            type: NTH
          }
        ]
      };
      const node = document.getElementById('li3');
      assert.strictEqual(
        runNthTest('li:nth-child(2n+1 of .li)', ast, node),
        true,
        'matches nth-child with of selector'
      );
    });

    it('should test anb.selector without parentNode', () => {
      const ast = {
        name: 'nth-child',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            nth: { a: '1', b: '1', type: AN_PLUS_B },
            selector: {
              children: [
                {
                  children: [
                    { loc: null, name: 'match-me', type: CLASS_SELECTOR }
                  ],
                  loc: null,
                  type: SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR_LIST
            },
            type: NTH
          }
        ]
      };
      const evaluator = new Evaluator(window);
      const isolatedRootMatch = document.createElement('div');
      isolatedRootMatch.classList.add('match-me');
      const resTrue = evaluator
        .setup(':nth-child(1n of .match-me)', isolatedRootMatch)
        .matchPseudoClassSelector(ast, isolatedRootMatch, {});
      assert.strictEqual(
        resTrue,
        true,
        'matches because the isolated root satisfies the selector branch'
      );
      const isolatedRootNoMatch = document.createElement('div');
      const resFalse = evaluator
        .setup(':nth-child(1n of .match-me)', isolatedRootNoMatch)
        .matchPseudoClassSelector(ast, isolatedRootNoMatch, {});
      assert.strictEqual(
        resFalse,
        false,
        'returns false because the isolated root does not have the class'
      );
    });
  });

  describe('evaluate :has() pseudo-class on shadow root boundary', () => {
    let host, shadowRoot, child;

    beforeEach(() => {
      host = document.createElement('div');
      document.getElementById('div0').appendChild(host);
      shadowRoot = host.attachShadow({ mode: 'open' });
      child = document.createElement('div');
      child.classList.add('child');
      shadowRoot.appendChild(child);
    });

    it('should return node if #verifyShadowHost is true', () => {
      const leafHost = {
        children: null,
        name: 'host',
        type: PS_CLASS_SELECTOR
      };
      const leafHas = {
        children: [
          {
            children: [
              {
                children: [{ loc: null, name: 'child', type: CLASS_SELECTOR }],
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host:has(.child)', shadowRoot);
      const resHost = evaluator.matchSelector(leafHost, shadowRoot, {});
      assert.strictEqual(
        resHost,
        true,
        'matches :host and sets #verifyShadowHost to true'
      );
      const resHas = evaluator.matchSelector(leafHas, shadowRoot, {});
      assert.strictEqual(
        resHas,
        true,
        'matches :has(.child) because #verifyShadowHost is true'
      );
    });

    it('should return null if #verifyShadowHost is falsy', () => {
      const leafHas = {
        children: [
          {
            children: [
              {
                children: [{ loc: null, name: 'child', type: CLASS_SELECTOR }],
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':has(.child)', shadowRoot);
      const res = evaluator.matchSelector(leafHas, shadowRoot, {});
      assert.strictEqual(
        res,
        false,
        'returns false because #verifyShadowHost is not set'
      );
    });
  });

  describe('match :has() pseudo-class function', () => {
    const runHasTest = (selector, ast, node) => {
      const evaluator = new Evaluator(window);
      return evaluator
        .setup(selector, node)
        .matchPseudoClassSelector(ast, node, {});
    };

    it('should throw a SyntaxError for empty :has()', () => {
      const node = document.getElementById('ul1');
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: []
      };
      assert.throws(
        () => runHasTest(':has()', ast, node),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, 'SyntaxError', 'name');
          assert.strictEqual(e.message, 'Invalid selector :has()', 'message');
          return true;
        }
      );
    });

    it('should not match when element is missing', () => {
      const node = document.getElementById('dl1');
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            children: [
              {
                children: [{ name: 'li', type: TYPE_SELECTOR }],
                type: SELECTOR
              }
            ],
            type: SELECTOR_LIST
          }
        ]
      };
      assert.strictEqual(runHasTest(':has(li)', ast, node), false, 'result');
    });

    it('should match when element exists', () => {
      const node = document.getElementById('dl1');
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            children: [
              {
                children: [{ name: 'dd', type: TYPE_SELECTOR }],
                type: SELECTOR
              }
            ],
            type: SELECTOR_LIST
          }
        ]
      };
      assert.strictEqual(runHasTest(':has(dd)', ast, node), true, 'result');
    });

    it('should not match deep unmatching descendant path', () => {
      const node = document.getElementById('dl1');
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            children: [
              {
                children: [
                  { name: 'dd', type: TYPE_SELECTOR },
                  { name: ' ', type: COMBINATOR },
                  { name: 'p', type: TYPE_SELECTOR }
                ],
                type: SELECTOR
              }
            ],
            type: SELECTOR_LIST
          }
        ]
      };
      assert.strictEqual(runHasTest(':has(dd p)', ast, node), false, 'result');
    });

    it('should match deep matching descendant path', () => {
      const node = document.getElementById('dl1');
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            children: [
              {
                children: [
                  { name: 'dd', type: TYPE_SELECTOR },
                  { name: ' ', type: COMBINATOR },
                  { name: 'span', type: TYPE_SELECTOR }
                ],
                type: SELECTOR
              }
            ],
            type: SELECTOR_LIST
          }
        ]
      };
      assert.strictEqual(
        runHasTest(':has(dd span)', ast, node),
        true,
        'result'
      );
    });

    it('should match remaining leaves in fast path (ID)', () => {
      const parent = document.createElement('div');
      const child = document.createElement('div');
      child.id = 'fp1-id';
      const grandChild = document.createElement('span');
      child.appendChild(grandChild);
      parent.appendChild(child);
      document.getElementById('div0').appendChild(parent);
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            children: [
              {
                children: [
                  { name: 'fp1-id', type: ID_SELECTOR },
                  { name: ' ', type: COMBINATOR },
                  { name: 'span', type: TYPE_SELECTOR }
                ],
                type: SELECTOR
              }
            ],
            type: SELECTOR_LIST
          }
        ]
      };
      assert.strictEqual(
        runHasTest(':has(#fp1-id span)', ast, parent),
        true,
        'result'
      );
    });

    it('should match remaining leaves in fast path (Class)', () => {
      const parent = document.createElement('div');
      const child = document.createElement('div');
      child.classList.add('fp2-class');
      const grandChild = document.createElement('span');
      child.appendChild(grandChild);
      parent.appendChild(child);
      document.getElementById('div0').appendChild(parent);
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            children: [
              {
                children: [
                  { name: 'fp2-class', type: CLASS_SELECTOR },
                  { name: ' ', type: COMBINATOR },
                  { name: 'span', type: TYPE_SELECTOR }
                ],
                type: SELECTOR
              }
            ],
            type: SELECTOR_LIST
          }
        ]
      };
      assert.strictEqual(
        runHasTest(':has(.fp2-class span)', ast, parent),
        true,
        'result'
      );
    });

    it('should match remaining leaves in fast path (Type)', () => {
      const parent = document.createElement('div');
      const child = document.createElement('section');
      const grandChild = document.createElement('span');
      child.appendChild(grandChild);
      parent.appendChild(child);
      document.getElementById('div0').appendChild(parent);
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            children: [
              {
                children: [
                  { name: 'section', type: TYPE_SELECTOR },
                  { name: ' ', type: COMBINATOR },
                  { name: 'span', type: TYPE_SELECTOR }
                ],
                type: SELECTOR
              }
            ],
            type: SELECTOR_LIST
          }
        ]
      };
      assert.strictEqual(
        runHasTest(':has(section span)', ast, parent),
        true,
        'result'
      );
    });

    it('should match remaining leaves in Fallback (TreeWalker)', () => {
      const parent = document.createElement('div');
      const child = document.createElement('div');
      child.setAttribute('data-fp4', 'true');
      const grandChild = document.createElement('span');
      child.appendChild(grandChild);
      parent.appendChild(child);
      document.getElementById('div0').appendChild(parent);
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            children: [
              {
                children: [
                  {
                    name: { name: 'data-fp4', type: IDENT },
                    type: ATTR_SELECTOR,
                    value: null,
                    flags: null,
                    evaluator: null
                  },
                  { name: ' ', type: COMBINATOR },
                  { name: 'span', type: TYPE_SELECTOR }
                ],
                type: SELECTOR
              }
            ],
            type: SELECTOR_LIST
          }
        ]
      };
      assert.strictEqual(
        runHasTest(':has([data-fp4] span)', ast, parent),
        true,
        'result'
      );
    });

    it('should match selector and return true when isLast is true', () => {
      const parent = document.createElement('div');
      const child1 = document.createElement('div');
      child1.className = 'fp-class no-match';
      const child2 = document.createElement('div');
      child2.className = 'fp-class match';
      parent.appendChild(child1);
      parent.appendChild(child2);
      document.getElementById('div0').appendChild(parent);
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            children: [
              {
                children: [
                  { name: 'fp-class', type: CLASS_SELECTOR },
                  { name: 'match', type: CLASS_SELECTOR }
                ],
                type: SELECTOR
              }
            ],
            type: SELECTOR_LIST
          }
        ]
      };
      assert.strictEqual(
        runHasTest(':has(.fp-class.match)', ast, parent),
        true,
        'result'
      );
    });

    it('should match selector and proceed when isLast is false', () => {
      const parent = document.createElement('div');
      const child1 = document.createElement('div');
      child1.className = 'fp-class no-match';
      const child2 = document.createElement('div');
      child2.className = 'fp-class match';
      const grandChild = document.createElement('span');
      child2.appendChild(grandChild);
      parent.appendChild(child1);
      parent.appendChild(child2);
      document.getElementById('div0').appendChild(parent);
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            children: [
              {
                children: [
                  { name: 'fp-class', type: CLASS_SELECTOR },
                  { name: 'match', type: CLASS_SELECTOR },
                  { name: ' ', type: COMBINATOR },
                  { name: 'span', type: TYPE_SELECTOR }
                ],
                type: SELECTOR
              }
            ],
            type: SELECTOR_LIST
          }
        ]
      };
      assert.strictEqual(
        runHasTest(':has(.fp-class.match span)', ast, parent),
        true,
        'result'
      );
    });

    it('should return false when filterLeaves do not match', () => {
      const parent = document.createElement('div');
      const child = document.createElement('div');
      child.className = 'fp-class no-match';
      parent.appendChild(child);
      document.getElementById('div0').appendChild(parent);
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            children: [
              {
                children: [
                  { name: 'fp-class', type: CLASS_SELECTOR },
                  { name: 'match', type: CLASS_SELECTOR },
                  { name: ' ', type: COMBINATOR },
                  { name: 'span', type: TYPE_SELECTOR }
                ],
                type: SELECTOR
              }
            ],
            type: SELECTOR_LIST
          }
        ]
      };
      assert.strictEqual(
        runHasTest(':has(.fp-class.match span)', ast, parent),
        false,
        'result'
      );
    });

    it('should apply filterLeaves correctly in Type selector fast path', () => {
      const parent = document.createElement('div');
      const child1 = document.createElement('section');
      child1.className = 'no-match';
      const child2 = document.createElement('section');
      child2.className = 'match';
      const grandChild = document.createElement('p');
      child2.appendChild(grandChild);
      parent.appendChild(child1);
      parent.appendChild(child2);
      document.getElementById('div0').appendChild(parent);
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            children: [
              {
                children: [
                  { name: 'section', type: TYPE_SELECTOR },
                  { name: 'match', type: CLASS_SELECTOR },
                  { name: ' ', type: COMBINATOR },
                  { name: 'p', type: TYPE_SELECTOR }
                ],
                type: SELECTOR
              }
            ],
            type: SELECTOR_LIST
          }
        ]
      };
      assert.strictEqual(
        runHasTest(':has(section.match p)', ast, parent),
        true,
        'result'
      );
    });
  });

  describe('match logical pseudo function combinator traversal', () => {
    let gpNode, pNode, cNode;

    beforeEach(() => {
      gpNode = document.createElement('div');
      gpNode.id = 'gp';
      pNode = document.createElement('div');
      pNode.id = 'p';
      cNode = document.createElement('span');
      cNode.id = 'c';
      pNode.appendChild(cNode);
      gpNode.appendChild(pNode);
      document.getElementById('div0').appendChild(gpNode);
    });

    it('should update nextNodes and eventually set bool = true', () => {
      // :is(#gp > #p > #c)
      const leaf = {
        children: [
          {
            children: [
              {
                children: [
                  { loc: null, name: 'gp', type: ID_SELECTOR },
                  { loc: null, name: '>', type: COMBINATOR },
                  { loc: null, name: 'p', type: ID_SELECTOR },
                  { loc: null, name: '>', type: COMBINATOR },
                  { loc: null, name: 'c', type: ID_SELECTOR }
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
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const res = evaluator.matchPseudoClassSelector(leaf, cNode, {});
      assert.strictEqual(res, true, 'matches full chain successfully');
    });

    it('should set bool = false and break when traversal fails', () => {
      const leaf = {
        children: [
          {
            children: [
              {
                children: [
                  { loc: null, name: 'gp', type: ID_SELECTOR },
                  { loc: null, name: '>', type: COMBINATOR },
                  { loc: null, name: 'span', type: TYPE_SELECTOR }, // 不一致を誘発
                  { loc: null, name: '>', type: COMBINATOR },
                  { loc: null, name: 'c', type: ID_SELECTOR }
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
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const res = evaluator.matchPseudoClassSelector(leaf, cNode, {});
      assert.strictEqual(
        res,
        false,
        'breaks and returns false when intermediate node does not match'
      );
    });
  });

  describe('match pseudo class selector', () => {
    it('should throw DOMException when :has() pseudo-class is empty', () => {
      const leaf = {
        children: [],
        loc: null,
        name: 'has',
        type: PS_CLASS_SELECTOR
      };
      const node = document.getElementById('ul1');
      const evaluator = new Evaluator(window);
      evaluator.setup(':has()', node);
      assert.throws(
        () => evaluator.matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector :has()', 'message');
          return true;
        }
      );
    });

    it('should throw DOMException when :not() pseudo-class is empty', () => {
      const leaf = {
        children: [],
        loc: null,
        name: 'not',
        type: PS_CLASS_SELECTOR
      };
      const node = document.getElementById('ul1');
      const evaluator = new Evaluator(window);
      evaluator.setup(':not()', node);
      assert.throws(
        () => evaluator.matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector :not()', 'message');
          return true;
        }
      );
    });

    it('should match element against :is() pseudo-class selector', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':is(ul, dl)', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :is() selector with child combinator branch', () => {
      const leaf = {
        children: [
          {
            children: [
              {
                children: [
                  { loc: null, name: 'div', type: TYPE_SELECTOR },
                  { loc: null, name: 'parent', type: CLASS_SELECTOR },
                  { loc: null, name: '>', type: COMBINATOR },
                  { loc: null, name: 'span', type: TYPE_SELECTOR },
                  { loc: null, name: 'child', type: CLASS_SELECTOR }
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
      const parentNode = document.createElement('div');
      parentNode.classList.add('parent');
      const childNode = document.createElement('span');
      childNode.classList.add('child');
      parentNode.appendChild(childNode);
      document.getElementById('div0').appendChild(parentNode);
      const evaluator = new Evaluator(window);
      evaluator.setup(':is(div.parent > span.child)', document);
      const res = evaluator.matchPseudoClassSelector(leaf, childNode, {});
      assert.strictEqual(
        res,
        true,
        'correctly parsed and matched combinators and multiple leaves'
      );
    });

    it('should match deeply nested :has() and :is() pseudo-classes', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':has(:is(:has(li, dd)))', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should throw DOMException when :nth-child() is empty', () => {
      const leaf = {
        children: [],
        name: 'nth-child',
        type: PS_CLASS_SELECTOR
      };
      const node = document.getElementById('dt1');
      const evaluator = new Evaluator(window);
      evaluator.setup(':nth-child()', node);
      assert.throws(
        () => evaluator.matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector :nth-child()',
            'message'
          );
          return true;
        }
      );
    });

    it('should throw DOMException when :nth-last-child() is empty', () => {
      const leaf = {
        children: [],
        name: 'nth-last-child',
        type: PS_CLASS_SELECTOR
      };
      const node = document.getElementById('dt1');
      const evaluator = new Evaluator(window);
      evaluator.setup(':nth-last-child()', node);
      assert.throws(
        () => evaluator.matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector :nth-last-child()',
            'message'
          );
          return true;
        }
      );
    });

    it('should throw DOMException when :nth-of-type() is empty', () => {
      const leaf = {
        children: [],
        name: 'nth-of-type',
        type: PS_CLASS_SELECTOR
      };
      const node = document.getElementById('dt1');
      const evaluator = new Evaluator(window);
      evaluator.setup(':nth-of-type()', node);
      assert.throws(
        () => evaluator.matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector :nth-of-type()',
            'message'
          );
          return true;
        }
      );
    });

    it('should throw DOMException when :nth-last-of-type() is empty', () => {
      const leaf = {
        children: [],
        name: 'nth-last-of-type',
        type: PS_CLASS_SELECTOR
      };
      const node = document.getElementById('dt1');
      const evaluator = new Evaluator(window);
      evaluator.setup(':nth-last-of-type()', node);
      assert.throws(
        () => evaluator.matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector :nth-last-of-type()',
            'message'
          );
          return true;
        }
      );
    });

    it('should return false when :nth-child(even) fails to match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':nth-child(even)', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should throw DOMException when :dir() pseudo-class is empty', () => {
      const leaf = {
        children: [],
        name: 'dir',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':dir()', node);
      assert.throws(
        () => evaluator.matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector :dir()', 'message');
          return true;
        }
      );
    });

    it('should match element when text direction matches :dir()', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':dir(ltr)', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false when text direction differs from :dir()', () => {
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
      node.setAttribute('dir', 'rtl');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':dir(ltr)', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(
        res,
        false,
        'result is false because directions do not match'
      );
    });

    it('should throw DOMException when :lang() pseudo-class is empty', () => {
      const leaf = {
        children: [],
        name: 'lang',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':lang()', node);
      assert.throws(
        () => evaluator.matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector :lang()', 'message');
          return true;
        }
      );
    });

    it('should match element when language attribute matches :lang()', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':lang(en)', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match element when language matches any in :lang(...)', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':lang(en, fr)', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false when element language is not in :lang()', () => {
      const leaf = {
        children: [
          {
            name: 'fr',
            type: IDENT
          },
          {
            type: OPERATOR,
            value: ','
          },
          {
            name: 'de',
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':lang(fr, de)', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(
        res,
        false,
        'result is false because no languages matched'
      );
    });

    it('should return false for :state() on standard custom element', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':state(checked)', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false when custom element state is not active', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':state(checked)', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match custom element when custom state is active', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':state(checked)', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false when evaluating unsupported :current()', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':current(foo)', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should log warning for unsupported :current() when warn is true', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':current(foo)', node, {
        warn: true
      });
      const res = evaluator.matchPseudoClassSelector(leaf, node, {
        warn: true
      });
      const { called } = stubWarn;
      stubWarn.restore();
      assert.strictEqual(called, true, 'called');
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :host() on regular element', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host(.foo)', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :host-context() on regular element', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host-context(.foo)', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should throw DOMException for unknown pseudo-class selector', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':foobar(foo)', node);
      assert.throws(
        () => evaluator.matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Unknown pseudo-class :foobar()',
            'message'
          );
          return true;
        }
      );
    });

    it('should return false when evaluating unsupported :contains()', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':contains(foo)', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should log warning for unsupported :contains() when warn is true', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':contains(foo)', node, {
        warn: true
      });
      const res = evaluator.matchPseudoClassSelector(leaf, node, {
        warn: true
      });
      const { called } = stubWarn;
      stubWarn.restore();
      assert.strictEqual(called, true, 'called');
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for unknown pseudo-class with forgive option', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':foobar(foo)', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {
        forgive: true
      });
      assert.strictEqual(res, false, 'result');
    });

    it('should match <a> element with href attribute against :any-link', () => {
      const leaf = {
        children: null,
        name: 'any-link',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttribute('href', 'https://example.com/');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':any-link', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :any-link when <a> uses xlink:href', () => {
      const leaf = {
        children: null,
        name: 'any-link',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttributeNS(
        'http://www.w3.org/1999/xlink',
        'xlink:href',
        'https://example.com/'
      );
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':any-link', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :any-link when <a> lacks href attribute', () => {
      const leaf = {
        children: null,
        name: 'any-link',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':any-link', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match <area> element with href attribute against :any-link', () => {
      const leaf = {
        children: null,
        name: 'any-link',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('area');
      node.setAttribute('href', 'https://example.com/');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':any-link', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :any-link when <area> lacks href', () => {
      const leaf = {
        children: null,
        name: 'any-link',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('area');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':any-link', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match unvisited <a> element with href against :link', () => {
      const leaf = {
        children: null,
        name: 'link',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttribute('href', 'https://example.com/');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':link', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match <a> element with relative URL against :local-link', () => {
      const leaf = {
        children: null,
        name: 'local-link',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttribute('href', './#foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':local-link', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :local-link when <a> has external URL', () => {
      const leaf = {
        children: null,
        name: 'local-link',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttribute('href', 'https://example.com');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':local-link', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match <area> with relative URL against :local-link', () => {
      const leaf = {
        children: null,
        name: 'local-link',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('area');
      node.setAttribute('href', './#foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':local-link', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :local-link when <area> has external URL', () => {
      const leaf = {
        children: null,
        name: 'local-link',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('area');
      node.setAttribute('href', 'https://example.com');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':local-link', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :local-link on non-link element', () => {
      const leaf = {
        children: null,
        name: 'local-link',
        type: PS_CLASS_SELECTOR
      };
      const node = document.getElementById('div0');
      const evaluator = new Evaluator(window);
      evaluator.setup(':local-link', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :visited on unvisited link element', () => {
      const leaf = {
        children: null,
        name: 'visited',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.href = 'https://example.com';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':visited', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :hover when element is not hovered', () => {
      const leaf = {
        children: null,
        name: 'hover',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':hover', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :hover when mouseover event is dispatched', () => {
      const leaf = {
        children: null,
        name: 'hover',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':hover', node);
      node.dispatchEvent(new window.MouseEvent('mouseover'));
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should maintain :hover state after mousedown event', () => {
      const leaf = {
        children: null,
        name: 'hover',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':hover', node);
      node.dispatchEvent(new window.MouseEvent('mouseover'));
      node.dispatchEvent(new window.MouseEvent('mousedown'));
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :hover after mouseout event', () => {
      const leaf = {
        children: null,
        name: 'hover',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':hover', node);
      node.dispatchEvent(new window.MouseEvent('mouseover'));
      node.dispatchEvent(new window.MouseEvent('mouseout'));
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :hover when event occurs elsewhere', () => {
      const leaf = {
        children: null,
        name: 'hover',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':hover', node);
      window.dispatchEvent(new window.MouseEvent('mouseover'));
      window.dispatchEvent(new window.MouseEvent('mousedown'));
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :active when element is not pressed', () => {
      const leaf = {
        children: null,
        name: 'active',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':active', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :active when primary mouse button is pressed', () => {
      const leaf = {
        children: null,
        name: 'active',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':active', node);
      node.dispatchEvent(
        new window.MouseEvent('mousedown', {
          buttons: 1
        })
      );
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :active after mouseup event', () => {
      const leaf = {
        children: null,
        name: 'active',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':active', node);
      node.dispatchEvent(
        new window.MouseEvent('mousedown', {
          buttons: 1
        })
      );
      node.dispatchEvent(
        new window.MouseEvent('mouseup', {
          buttons: 1
        })
      );
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :active with non-primary mouse buttons', () => {
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
      node.dispatchEvent(
        new window.MouseEvent('mousedown', {
          buttons: 6
        })
      );
      const evaluator = new Evaluator(window);
      evaluator.setup(':active', node, {
        event
      });
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :active when press occurs elsewhere', () => {
      const leaf = {
        children: null,
        name: 'active',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':active', node);
      window.dispatchEvent(
        new window.MouseEvent('mousedown', {
          buttons: 1
        })
      );
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match element whose ID matches the target fragment', () => {
      const leaf = {
        children: null,
        name: 'target',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':target', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :target when element ID differs', () => {
      const leaf = {
        children: null,
        name: 'target',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'bar';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':target', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :target on DocumentFragment node', () => {
      const leaf = {
        children: null,
        name: 'target',
        type: PS_CLASS_SELECTOR
      };
      const frag = document.createDocumentFragment();
      const node = document.createElement('div');
      node.id = 'foo';
      frag.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':target', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match element when evaluating :scope on itself', () => {
      const leaf = {
        children: null,
        name: 'scope',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':scope', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :scope on descendant elements', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':scope', refPoint);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match documentElement when scoping root is document', () => {
      const leaf = {
        children: null,
        name: 'scope',
        type: PS_CLASS_SELECTOR
      };
      const node = document.documentElement;
      const evaluator = new Evaluator(window);
      evaluator.setup(':scope', document);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :scope on non-root document nodes', () => {
      const leaf = {
        children: null,
        name: 'scope',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.id = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':scope', document);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match element that currently has document focus', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match element focused after setup initialization', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      node.focus();
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :focus on unfocused document body', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: PS_CLASS_SELECTOR
      };
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', document.body);
      const res = evaluator.matchPseudoClassSelector(leaf, document.body, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :focus when element lacks focus', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :focus when element is disabled', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :focus when disabled attribute is set', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    xit('should return false for :focus when element is hidden', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    xit('should return false for :focus when hidden attribute is set', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    xit('should return false for :focus when display is set to none', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    xit('should return false for :focus when visibility is hidden', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    xit('should return false for :focus when parent container disabled', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    xit('should return false for :focus when parent attribute disabled', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    xit('should return false for :focus when parent element is hidden', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    xit('should return false for :focus when parent hidden attr set', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    xit('should return false for :focus when parent display is none', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    xit('should return false for :focus when parent visibility hidden', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match focused element located within a Shadow DOM', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: PS_CLASS_SELECTOR
      };
      const html = `
      <template id="template">
        <button id="button">Click Me</button>
      </template>
      <div id="container">
        <div id="host"></div>
      </div>
      `;
      const div = document.getElementById('div0');
      div.innerHTML = html;
      const template = document.getElementById('template');
      const host = document.getElementById('host');
      const shadowRoot = host.attachShadow({ mode: 'open' });
      shadowRoot.appendChild(template.content.cloneNode(true));
      const node = shadowRoot.getElementById('button');
      node.focus();
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match shadow host when inner shadow element focused', () => {
      const leaf = {
        children: null,
        name: 'focus',
        type: PS_CLASS_SELECTOR
      };
      const html = `
      <template id="template">
        <button id="button">Click Me</button>
      </template>
      <div id="container">
        <div id="host"></div>
      </div>
      `;
      const div = document.getElementById('div0');
      div.innerHTML = html;
      const template = document.getElementById('template');
      const host = document.getElementById('host');
      const shadowRoot = host.attachShadow({ mode: 'open' });
      shadowRoot.appendChild(template.content.cloneNode(true));
      const node = shadowRoot.getElementById('button');
      node.focus();
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', host);
      const res = evaluator.matchPseudoClassSelector(leaf, host, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match focused <input> element against :focus-visible', () => {
      const leaf = {
        children: null,
        name: 'focus-visible',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      const evaluator = new Evaluator(window);
      node.focus();
      evaluator.setup(':focus-visible', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match button focused via Tab key for :focus-visible', () => {
      const leaf = {
        children: null,
        name: 'focus-visible',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      const evaluator = new Evaluator(window);
      document.body.dispatchEvent(
        new window.KeyboardEvent('keydown', {
          key: 'Tab'
        })
      );
      node.focus();
      evaluator.setup(':focus-visible', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match button after completing Tab keypress sequence', () => {
      const leaf = {
        children: null,
        name: 'focus-visible',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      const evaluator = new Evaluator(window);
      document.body.dispatchEvent(
        new window.KeyboardEvent('keydown', {
          key: 'Tab'
        })
      );
      node.focus();
      node.dispatchEvent(
        new window.KeyboardEvent('keyup', {
          key: 'Tab'
        })
      );
      evaluator.setup(':focus-visible', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :focus-visible on programmatic focus', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-visible', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should maintain :focus-visible when pressing modifier keys', () => {
      const leaf = {
        children: null,
        name: 'focus-visible',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      const evaluator = new Evaluator(window);
      document.body.dispatchEvent(
        new window.KeyboardEvent('keydown', {
          key: 'Tab'
        })
      );
      node.focus();
      node.dispatchEvent(
        new window.KeyboardEvent('keyup', {
          key: 'Tab'
        })
      );
      node.dispatchEvent(
        new window.KeyboardEvent('keydown', {
          key: 'Shift'
        })
      );
      node.dispatchEvent(
        new window.KeyboardEvent('keyup', {
          key: 'Shift'
        })
      );
      evaluator.setup(':focus-visible', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should maintain :focus-visible when pressing navigation keys', () => {
      const leaf = {
        children: null,
        name: 'focus-visible',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      const evaluator = new Evaluator(window);
      document.body.dispatchEvent(
        new window.KeyboardEvent('keydown', {
          key: 'Tab'
        })
      );
      node.focus();
      node.dispatchEvent(
        new window.KeyboardEvent('keyup', {
          key: 'Tab'
        })
      );
      node.dispatchEvent(
        new window.KeyboardEvent('keydown', {
          key: 'ArrowRight'
        })
      );
      node.dispatchEvent(
        new window.KeyboardEvent('keyup', {
          key: 'ArrowRight'
        })
      );
      evaluator.setup(':focus-visible', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :focus-visible after Tab keydown', () => {
      const leaf = {
        children: null,
        name: 'focus-visible',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      const evaluator = new Evaluator(window);
      node.focus();
      evaluator.setup(':focus-visible', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
      node.dispatchEvent(
        new window.KeyboardEvent('keydown', {
          key: 'Tab'
        })
      );
      evaluator.setup(':focus-visible', node);
      const res2 = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res2, false, 'result');
    });

    it('should match :focus-visible when tabbing between buttons', () => {
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
      const evaluator = new Evaluator(window);
      document.body.dispatchEvent(
        new window.KeyboardEvent('keydown', {
          key: 'Tab'
        })
      );
      node.focus();
      node.dispatchEvent(
        new window.KeyboardEvent('keyup', {
          key: 'Tab'
        })
      );
      node.dispatchEvent(
        new window.KeyboardEvent('keydown', {
          key: 'Tab'
        })
      );
      node.blur();
      node2.focus();
      node2.dispatchEvent(
        new window.KeyboardEvent('keyup', {
          key: 'Tab'
        })
      );
      evaluator.setup(':focus-visible', node2);
      const res = evaluator.matchPseudoClassSelector(leaf, node2, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should lose :focus-visible when focus switches via mouse click', () => {
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
      const evaluator = new Evaluator(window);
      document.body.dispatchEvent(
        new window.KeyboardEvent('keydown', {
          key: 'Tab'
        })
      );
      node.focus();
      node.dispatchEvent(
        new window.KeyboardEvent('keyup', {
          key: 'Tab'
        })
      );
      evaluator.setup(':focus-visible', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
      node2.dispatchEvent(
        new window.MouseEvent('mousedown', {
          buttons: 1
        })
      );
      node2.focus();
      node2.dispatchEvent(
        new window.MouseEvent('mouseup', {
          buttons: 0
        })
      );
      node2.click();
      evaluator.setup(':focus-visible', node2);
      const res2 = evaluator.matchPseudoClassSelector(leaf, node2, {});
      assert.strictEqual(res2, false, 'result');
    });

    it('should match :focus-visible when focus moves in key mode', () => {
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
      const evaluator = new Evaluator(window);
      document.body.dispatchEvent(
        new window.KeyboardEvent('keydown', {
          key: 'Tab'
        })
      );
      node.focus();
      node.dispatchEvent(
        new window.KeyboardEvent('keyup', {
          key: 'Tab'
        })
      );
      node2.focus();
      evaluator.setup(':focus-visible', node2);
      const res = evaluator.matchPseudoClassSelector(leaf, node2, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :focus-visible for element with tabindex=-1', () => {
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
      const evaluator = new Evaluator(window);
      node.focus();
      evaluator.setup(':focus-visible', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
      node2.focus();
      evaluator.setup(':focus-visible', node2);
      const res2 = evaluator.matchPseudoClassSelector(leaf, node2, {});
      assert.strictEqual(res2, true, 'result');
    });

    it('should match :focus-visible when target is lastFocusVisible', () => {
      const leaf = {
        children: null,
        name: 'focus-visible',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      const evaluator = new Evaluator(window);
      document.body.dispatchEvent(
        new window.KeyboardEvent('keydown', { key: 'Tab' })
      );
      node.focus();
      evaluator.setup(':focus-visible', node);
      const initialRes = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(
        initialRes,
        true,
        'initially matches and sets lastFocusVisible'
      );
      node.dispatchEvent(new window.KeyboardEvent('keyup', { key: 'Tab' }));
      evaluator.setup(':focus-visible', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(
        res,
        true,
        'matches exactly via the specific else if branch'
      );
    });

    it('should match :focus-visible when focus relates to target', () => {
      const leaf = {
        children: null,
        name: 'focus-visible',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const relatedNode = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      parent.appendChild(relatedNode);
      document.getElementById('div0').appendChild(parent);
      const evaluator = new Evaluator(window);
      document.body.dispatchEvent(
        new window.KeyboardEvent('keydown', { key: 'Tab' })
      );
      node.focus();
      evaluator.setup(':focus-visible', node);
      const initialRes = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(
        initialRes,
        true,
        'initially matches and sets lastFocusVisible to node'
      );
      relatedNode.dispatchEvent(
        new window.MouseEvent('mousedown', { bubbles: true })
      );
      node.focus();
      node.dispatchEvent(
        new window.FocusEvent('focus', { relatedTarget: relatedNode })
      );
      evaluator.setup(':focus-visible', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(
        res,
        true,
        'matches via the focusTarget === lastFocusVisible branch'
      );
    });

    it('should match :focus-visible if relatedTarget was visible', () => {
      const leaf = {
        children: null,
        name: 'focus-visible',
        type: PS_CLASS_SELECTOR
      };
      const input = document.createElement('input');
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(input);
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      const evaluator = new Evaluator(window);
      input.focus();
      node.focus();
      node.dispatchEvent(
        new window.FocusEvent('focus', { relatedTarget: input })
      );
      evaluator.setup(':focus-visible', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(
        res,
        true,
        'matches because relatedTarget (input) is focus-visible'
      );
    });

    it('should match :focus-within on the currently focused element', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :focus-within when element unfocused', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :focus-within on unfocused body', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PS_CLASS_SELECTOR
      };
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', document.body);
      const res = evaluator.matchPseudoClassSelector(leaf, document.body, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :focus-within when element disabled', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :focus-within when disabled attr set', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    xit('should return false for :focus-within when element hidden', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    xit('should return false for :focus-within when hidden attr set', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    xit('should return false for :focus-within when display is none', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    xit('should return false for :focus-within when visibility hidden', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :focus-within on parent of focused element', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', parent);
      const res = evaluator.matchPseudoClassSelector(leaf, parent, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :focus-within when no child focused', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.createElement('form');
      parent.appendChild(node);
      document.getElementById('div0').appendChild(parent);
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', parent);
      const res = evaluator.matchPseudoClassSelector(leaf, parent, {});
      assert.strictEqual(res, false, 'result');
    });

    xit('should return false when parent disabled', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', parent);
      const res = evaluator.matchPseudoClassSelector(leaf, parent, {});
      assert.strictEqual(res, false, 'result');
    });

    xit('should return false when parent disabled attr', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', parent);
      const res = evaluator.matchPseudoClassSelector(leaf, parent, {});
      assert.strictEqual(res, false, 'result');
    });

    xit('should return false when parent is hidden', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', parent);
      const res = evaluator.matchPseudoClassSelector(leaf, parent, {});
      assert.strictEqual(res, false, 'result');
    });

    xit('should return false when parent hidden attr', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', parent);
      const res = evaluator.matchPseudoClassSelector(leaf, parent, {});
      assert.strictEqual(res, false, 'result');
    });

    xit('should return false when parent display is none', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', parent);
      const res = evaluator.matchPseudoClassSelector(leaf, parent, {});
      assert.strictEqual(res, false, 'result');
    });

    xit('should return false when parent visibility hidden', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', parent);
      const res = evaluator.matchPseudoClassSelector(leaf, parent, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :focus-within on focused element in shadow root', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PS_CLASS_SELECTOR
      };
      const html = `
      <template id="template">
        <button id="button">Click Me</button>
      </template>
      <div id="container">
        <div id="host"></div>
      </div>
      `;
      const div = document.getElementById('div0');
      div.innerHTML = html;
      const template = document.getElementById('template');
      const host = document.getElementById('host');
      const shadowRoot = host.attachShadow({ mode: 'open' });
      shadowRoot.appendChild(template.content.cloneNode(true));
      const node = shadowRoot.getElementById('button');
      node.focus();
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :focus-within on shadow host when child focused', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PS_CLASS_SELECTOR
      };
      const html = `
      <template id="template">
        <button id="button">Click Me</button>
      </template>
      <div id="container">
        <div id="host"></div>
      </div>
      `;
      const div = document.getElementById('div0');
      div.innerHTML = html;
      const template = document.getElementById('template');
      const host = document.getElementById('host');
      const shadowRoot = host.attachShadow({ mode: 'open' });
      shadowRoot.appendChild(template.content.cloneNode(true));
      const node = shadowRoot.getElementById('button');
      node.focus();
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', host);
      const res = evaluator.matchPseudoClassSelector(leaf, host, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :focus-within on container ancestor of host', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PS_CLASS_SELECTOR
      };
      const html = `
      <template id="template">
        <button id="button">Click Me</button>
      </template>
      <div id="container">
        <div id="host"></div>
      </div>
      `;
      const div = document.getElementById('div0');
      div.innerHTML = html;
      const template = document.getElementById('template');
      const container = document.getElementById('container');
      const host = document.getElementById('host');
      const shadowRoot = host.attachShadow({ mode: 'open' });
      shadowRoot.appendChild(template.content.cloneNode(true));
      const node = shadowRoot.getElementById('button');
      node.focus();
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', container);
      const res = evaluator.matchPseudoClassSelector(leaf, container, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should traverse shadow boundary to host for :focus-within', () => {
      const leaf = {
        children: null,
        name: 'focus-within',
        type: PS_CLASS_SELECTOR
      };
      const host = document.createElement('div');
      host.id = 'host-element';
      document.getElementById('div0').appendChild(host);
      const shadowRoot = host.attachShadow({ mode: 'open' });
      const button = document.createElement('button');
      shadowRoot.appendChild(button);
      const originalActiveElement = Object.getOwnPropertyDescriptor(
        window.Document.prototype,
        'activeElement'
      );
      Object.defineProperty(document, 'activeElement', {
        get: () => button,
        configurable: true
      });
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', host);
      const res = evaluator.matchPseudoClassSelector(leaf, host, {});
      if (originalActiveElement) {
        Object.defineProperty(document, 'activeElement', originalActiveElement);
      } else {
        delete document.activeElement;
      }
      assert.strictEqual(
        res,
        true,
        'correctly traverses shadow boundary to host'
      );
    });

    it('should match :open for <details> with open attribute', () => {
      const leaf = {
        children: null,
        name: 'open',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('details');
      node.setAttribute('open', 'open');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':open', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :open on closed <details> element', () => {
      const leaf = {
        children: null,
        name: 'open',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('details');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':open', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :open for <dialog> with open attribute', () => {
      const leaf = {
        children: null,
        name: 'open',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('dialog');
      node.setAttribute('open', 'open');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':open', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :open on closed <dialog> element', () => {
      const leaf = {
        children: null,
        name: 'open',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('dialog');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':open', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :disabled for <input> with disabled attribute', () => {
      const leaf = {
        children: null,
        name: 'disabled',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('disabled', 'disabled');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':disabled', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :disabled on enabled <input>', () => {
      const leaf = {
        children: null,
        name: 'disabled',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':disabled', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :disabled on input in standard form', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':disabled', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :disabled on form-associated custom element', () => {
      const leaf = {
        children: null,
        name: 'disabled',
        type: PS_CLASS_SELECTOR
      };
      window.customElements.define(
        'x-input',
        class extends window.HTMLElement {
          static formAssociated = true;
        }
      );
      const node = document.createElement('x-input');
      node.setAttribute('disabled', 'disabled');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':disabled', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :disabled on non-form custom element', () => {
      const leaf = {
        children: null,
        name: 'disabled',
        type: PS_CLASS_SELECTOR
      };
      window.customElements.define(
        'x-input',
        class extends window.HTMLElement {}
      );
      const node = document.createElement('x-input');
      node.setAttribute('disabled', 'disabled');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':disabled', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :disabled for <input> inside disabled fieldset', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':disabled', node1);
      const res = evaluator.matchPseudoClassSelector(leaf, node1, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :disabled on input inside legend', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':disabled', node1);
      const res = evaluator.matchPseudoClassSelector(leaf, node1, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :disabled on input in first legend', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':disabled', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :enabled for standard active <input> element', () => {
      const leaf = {
        children: null,
        name: 'enabled',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':enabled', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :enabled for input inside standard form', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':enabled', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :enabled on form-associated custom element', () => {
      const leaf = {
        children: null,
        name: 'enabled',
        type: PS_CLASS_SELECTOR
      };
      window.customElements.define(
        'x-input',
        class extends window.HTMLElement {
          static formAssociated = true;
        }
      );
      const node = document.createElement('x-input');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':enabled', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :enabled on non-form custom element', () => {
      const leaf = {
        children: null,
        name: 'enabled',
        type: PS_CLASS_SELECTOR
      };
      window.customElements.define(
        'x-input',
        class extends window.HTMLElement {}
      );
      const node = document.createElement('x-input');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':enabled', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :enabled on disabled <input>', () => {
      const leaf = {
        children: null,
        name: 'enabled',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('disabled', 'disabled');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':enabled', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :enabled for input inside first fieldset legend', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':enabled', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :enabled on non-first legend input', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':enabled', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :enabled for input inside enabled fieldset', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':enabled', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :enabled in disabled fieldset', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':enabled', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :read-only for <input> with readonly attribute', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('readonly', 'readonly');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-only', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :read-only for text input with readonly attribute', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-only', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :read-only for number input with readonly attr', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-only', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :read-only for non-editable range input', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'range');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-only', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :read-only for disabled <input> element', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('disabled', 'disabled');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-only', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :read-only on normal editable input', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-only', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :read-only when input readOnly property is true', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.readOnly = true;
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-only', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :read-only for textarea with readonly attribute', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      node.setAttribute('readonly', 'readonly');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-only', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :read-only for disabled <textarea> element', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      node.setAttribute('disabled', 'disabled');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-only', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :read-only on standard textarea', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-only', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :read-only when textarea readOnly prop is true', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      node.readOnly = true;
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-only', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :read-only for standard non-editable <div>', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-only', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :read-only on contenteditable <div>', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.setAttribute('contenteditable', 'true');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-only', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :read-write for standard editable <input>', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-write', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :read-write for text input element', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-write', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :read-write for number input element', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-write', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :read-write on range input', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'range');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-write', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :read-write on readonly input', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('readonly', 'readonly');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-write', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :read-write on disabled input', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('disabled', 'disabled');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-write', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :read-write for standard <textarea> element', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-write', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :read-write on readonly textarea', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      node.setAttribute('readonly', 'readonly');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-write', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :read-write on disabled textarea', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      node.setAttribute('disabled', 'disabled');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-write', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :read-write for contenteditable <div> element', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.setAttribute('contenteditable', 'true');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-write', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :read-write on non-editable <div>', () => {
      const leaf = {
        children: null,
        name: 'read-write',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-write', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :placeholder-shown when input value is empty', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':placeholder-shown', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :placeholder-shown for empty text input', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':placeholder-shown', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :placeholder-shown on hidden input', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':placeholder-shown', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :placeholder-shown when value set', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':placeholder-shown', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :placeholder-shown with single space placeholder', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':placeholder-shown', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :placeholder-shown with empty string placeholder', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':placeholder-shown', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :placeholder-shown set via DOM property', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':placeholder-shown', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :placeholder-shown with empty DOM placeholder', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':placeholder-shown', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :placeholder-shown with newlines', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':placeholder-shown', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :placeholder-shown for empty <textarea>', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':placeholder-shown', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :checked for checkbox with checked attribute', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':checked', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :checked for radio with checked attribute', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':checked', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :checked on text input elements', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':checked', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :checked for option with selected attribute', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':checked', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :checked on non-checkable elements', () => {
      const leaf = {
        children: null,
        name: 'checked',
        type: PS_CLASS_SELECTOR
      };
      const node = document.getElementById('div0');
      const evaluator = new Evaluator(window);
      evaluator.setup(':checked', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :indeterminate for checkbox when indeterminate', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':indeterminate', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :indeterminate on normal checkbox', () => {
      const leaf = {
        children: null,
        name: 'indeterminate',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'checkbox');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':indeterminate', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :indeterminate for progress without value', () => {
      const leaf = {
        children: null,
        name: 'indeterminate',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('progress');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':indeterminate', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :indeterminate on valued progress', () => {
      const leaf = {
        children: null,
        name: 'indeterminate',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('progress');
      node.setAttribute('value', '0');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':indeterminate', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :indeterminate for unselected radio group', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':indeterminate', node1);
      const res = evaluator.matchPseudoClassSelector(leaf, node1, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :indeterminate if radio is selected', () => {
      const leaf = {
        children: null,
        name: 'indeterminate',
        type: PS_CLASS_SELECTOR
      };
      const form = document.createElement('form');
      const node1 = document.createElement('input');
      node1.setAttribute('type', 'radio');
      node1.setAttribute('name', 'foo');
      node1.checked = true;
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':indeterminate', node1);
      const res = evaluator.matchPseudoClassSelector(leaf, node1, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :indeterminate if sibling radio checked', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':indeterminate', node1);
      const res = evaluator.matchPseudoClassSelector(leaf, node1, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :indeterminate for unnamed radio without selection', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':indeterminate', node1);
      const res = evaluator.matchPseudoClassSelector(leaf, node1, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :indeterminate for radio associated via form attr', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':indeterminate', node1);
      const res = evaluator.matchPseudoClassSelector(leaf, node1, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should utilize cached results for radio button groups', () => {
      const form = document.createElement('form');
      const r1 = document.createElement('input');
      r1.type = 'radio';
      r1.name = 'test-group';
      const r2 = document.createElement('input');
      r2.type = 'radio';
      r2.name = 'test-group';
      form.appendChild(r1);
      form.appendChild(r2);
      document.body.appendChild(form);
      const evaluator = new Evaluator(window);
      evaluator.setup('input:indeterminate', form);
      const ast = { name: 'indeterminate' };
      const res1 = evaluator.matchPseudoClassSelector(ast, r1);
      assert.strictEqual(res1, true, 'first radio is indeterminate');
      const res2 = evaluator.matchPseudoClassSelector(ast, r2);
      assert.strictEqual(
        res2,
        true,
        'second radio is indeterminate from cache'
      );
      document.body.removeChild(form);
    });

    it('should return false for :indeterminate on non-form element', () => {
      const leaf = {
        children: null,
        name: 'indeterminate',
        type: PS_CLASS_SELECTOR
      };
      const evaluator = new Evaluator(window);
      evaluator.setup(':indeterminate', document.body);
      const res = evaluator.matchPseudoClassSelector(leaf, document.body, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :default for checkbox with checked attribute', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :default when checked programmatically', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :default on standard unchecked checkbox', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'checkbox');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :default on dynamically checked radio', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :default for radio button with checked attribute', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :default on unchecked radio button', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'radio');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :default for option with selected attribute', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :default on dynamically chosen option', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :default for option in multiple select element', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :default on unselected option element', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :default on first unselected option', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :default when sibling option selected', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :default on unselected option in multi-select', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :default for selected options in multiple select', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :default for selected option inside a datalist', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :default on unselected datalist option', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :default for default button inside a form', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :default on button outside a form', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :default for submit button inside a form', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :default on submit button without form', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('button');
      node.setAttribute('type', 'submit');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :default for submit input inside a form', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :default on submit input without form', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'submit');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :default for image input inside a form', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :default on image input without form', () => {
      const leaf = {
        children: null,
        name: 'default',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'image');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :valid for required input with non-empty value', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':valid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :valid on required input with empty value', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':valid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :valid on fieldset containing valid inputs', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':valid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :valid on fieldset with invalid input', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':valid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :valid on form containing valid input elements', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':valid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :valid on form containing invalid input', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':valid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :valid when input value length equals maxLength', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':valid', input);
      const res = evaluator.matchPseudoClassSelector(leaf, input, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :valid when value exceeds maxLength', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':valid', input);
      const res = evaluator.matchPseudoClassSelector(leaf, input, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :valid when input value satisfies minLength', () => {
      const leaf = {
        children: null,
        name: 'valid',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('form');
      const input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('required', 'required');
      input.minLength = 3;
      input.value = 'foo';
      node.appendChild(input);
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':valid', input);
      const res = evaluator.matchPseudoClassSelector(leaf, input, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :valid when value fails minLength', () => {
      const leaf = {
        children: null,
        name: 'valid',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('form');
      const input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('required', 'required');
      input.minLength = 4;
      input.value = 'foo';
      node.appendChild(input);
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':valid', input);
      const res = evaluator.matchPseudoClassSelector(leaf, input, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :valid on form when child input meets maxLength', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':valid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :valid on form with invalid maxLength', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':valid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :valid on form when child input meets minLength', () => {
      const leaf = {
        children: null,
        name: 'valid',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('form');
      const input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('required', 'required');
      input.minLength = 3;
      input.value = 'foo';
      node.appendChild(input);
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':valid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :valid on form when input fails minLength', () => {
      const leaf = {
        children: null,
        name: 'valid',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('form');
      const input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('required', 'required');
      input.minLength = 4;
      input.value = 'foo';
      node.appendChild(input);
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':valid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :valid on fieldset when input satisfies maxLength', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':valid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :valid on fieldset with invalid input', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':valid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :invalid for required input with empty value', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':invalid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :invalid on valid required input', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':invalid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :invalid on fieldset containing invalid input', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':invalid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :invalid on fieldset with valid inputs', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':invalid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :invalid on form containing invalid input element', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':invalid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :invalid on form with valid inputs', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':invalid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :invalid when input meets maxLength', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':invalid', input);
      const res = evaluator.matchPseudoClassSelector(leaf, input, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :invalid when input value exceeds maxLength', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':invalid', input);
      const res = evaluator.matchPseudoClassSelector(leaf, input, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :invalid on fieldset with valid input', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':invalid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :invalid on fieldset containing invalid child', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':invalid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :valid when applied to <div> element', () => {
      const leaf = {
        children: null,
        name: 'valid',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':valid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result is false for div');
    });

    it('should return false for :invalid on <div> non-form element', () => {
      const leaf = {
        children: null,
        name: 'invalid',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':invalid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result is false for div');
    });

    it('should match :valid for empty fieldset containing no inputs', () => {
      const leaf = {
        children: null,
        name: 'valid',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('fieldset');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':valid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result is true for empty fieldset');
    });

    it('should return false for :invalid on empty fieldset element', () => {
      const leaf = {
        children: null,
        name: 'invalid',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('fieldset');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':invalid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result is false for empty fieldset');
    });

    it('should return false for :in-range on readonly input element', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':in-range', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :in-range on disabled input element', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':in-range', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :in-range on hidden input element', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':in-range', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :in-range on text input element', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':in-range', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :in-range on input without range type', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':in-range', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :in-range for number input with value in range', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':in-range', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :in-range for range input with value in range', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':in-range', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :in-range for range input with max attribute', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':in-range', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :in-range for standard range input with value', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':in-range', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :in-range when value is below min', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':in-range', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :in-range when value exceeds max', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':in-range', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :out-of-range on readonly input', () => {
      const leaf = {
        children: null,
        name: 'out-of-range',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.readOnly = true;
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':out-of-range', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :out-of-range on hidden input', () => {
      const leaf = {
        children: null,
        name: 'out-of-range',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('hidden', 'hidden');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':out-of-range', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :out-of-range when input value is below min', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':out-of-range', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :out-of-range when input value exceeds max', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':out-of-range', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :out-of-range when value is in range', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':out-of-range', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :required for standard input with required attr', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('required', 'required');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':required', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :required for text input with required attribute', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':required', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :required for number input with required attr', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':required', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :required on range input element', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':required', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :required for checkbox with required attribute', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':required', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :required for radio button with required attribute', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':required', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :required for file input with required attribute', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':required', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :required for textarea with required attribute', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      node.setAttribute('required', 'required');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':required', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :required for select element with required attr', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('select');
      node.setAttribute('required', 'required');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':required', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :required on optional input', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':required', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :optional for input without required attribute', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':optional', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :optional for standard text input element', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':optional', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :optional for number input element', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':optional', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :optional for range input element', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'range');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':optional', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :optional for checkbox input element', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'checkbox');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':optional', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :optional for radio button input element', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'radio');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':optional', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :optional for standard select element', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('select');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':optional', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :optional for standard textarea element', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('textarea');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':optional', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :optional on required input', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('required', 'required');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':optional', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :root when evaluating documentElement', () => {
      const leaf = {
        children: null,
        name: 'root',
        type: PS_CLASS_SELECTOR
      };
      const node = document.documentElement;
      const evaluator = new Evaluator(window);
      evaluator.setup(':root', document);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :root on non-root element', () => {
      const leaf = {
        children: null,
        name: 'root',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':root', document);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should evaluate :empty based on text and element children', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':empty', document);
      const res1 = evaluator.matchPseudoClassSelector(leaf, p1, {});
      const res2 = evaluator.matchPseudoClassSelector(leaf, p2, {});
      const res3 = evaluator.matchPseudoClassSelector(leaf, p3, {});
      const res4 = evaluator.matchPseudoClassSelector(leaf, p4, {});
      const res5 = evaluator.matchPseudoClassSelector(leaf, p5, {});
      const res6 = evaluator.matchPseudoClassSelector(leaf, s1, {});
      assert.strictEqual(res1, true, 'result');
      assert.strictEqual(res2, true, 'result');
      assert.strictEqual(res3, false, 'result');
      assert.strictEqual(res4, false, 'result');
      assert.strictEqual(res5, false, 'result');
      assert.strictEqual(res6, true, 'result');
    });

    it('should match :first-child for the first sibling element', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':first-child', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :first-child on subsequent sibling', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':first-child', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :first-child for element without parent', () => {
      const leaf = {
        children: null,
        name: 'first-child',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const evaluator = new Evaluator(window);
      evaluator.setup(':first-child', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :last-child on non-final sibling', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':last-child', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :last-child for the final sibling element', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':last-child', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :last-child for element without parent', () => {
      const leaf = {
        children: null,
        name: 'last-child',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const evaluator = new Evaluator(window);
      evaluator.setup(':last-child', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :only-child for element with no siblings', () => {
      const leaf = {
        children: null,
        name: 'only-child',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':only-child', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :only-child when siblings exist', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':only-child', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :only-child for element without parent', () => {
      const leaf = {
        children: null,
        name: 'only-child',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const evaluator = new Evaluator(window);
      evaluator.setup(':only-child', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :first-of-type on non-first type', () => {
      const leaf = {
        children: null,
        name: 'first-of-type',
        type: PS_CLASS_SELECTOR
      };
      const node = document.getElementById('dt2');
      const evaluator = new Evaluator(window);
      evaluator.setup(':first-of-type', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :first-of-type for orphan element', () => {
      const leaf = {
        children: null,
        name: 'first-of-type',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const evaluator = new Evaluator(window);
      evaluator.setup(':first-of-type', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :last-of-type on non-last type', () => {
      const leaf = {
        children: null,
        name: 'last-of-type',
        type: PS_CLASS_SELECTOR
      };
      const node = document.getElementById('dt2');
      const evaluator = new Evaluator(window);
      evaluator.setup(':last-of-type', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :last-of-type for orphan element', () => {
      const leaf = {
        children: null,
        name: 'last-of-type',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const evaluator = new Evaluator(window);
      evaluator.setup(':last-of-type', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :only-of-type when no same-type siblings exist', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':only-of-type', node1);
      const res = evaluator.matchPseudoClassSelector(leaf, node1, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :only-of-type for orphan element', () => {
      const leaf = {
        children: null,
        name: 'only-of-type',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      const evaluator = new Evaluator(window);
      evaluator.setup(':only-of-type', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :first-of-type inside a DocumentFragment', () => {
      const leaf = {
        children: null,
        name: 'first-of-type',
        type: PS_CLASS_SELECTOR
      };
      const frag = document.createDocumentFragment();
      const node1 = document.createElement('div');
      const node2 = document.createElement('div');
      frag.append(node1, node2);
      const evaluator = new Evaluator(window);
      evaluator.setup(':first-of-type', frag);
      const res = evaluator.matchPseudoClassSelector(leaf, node1, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :last-of-type on non-last in fragment', () => {
      const leaf = {
        children: null,
        name: 'last-of-type',
        type: PS_CLASS_SELECTOR
      };
      const frag = document.createDocumentFragment();
      const node1 = document.createElement('div');
      const node2 = document.createElement('div');
      frag.append(node1, node2);
      const evaluator = new Evaluator(window);
      evaluator.setup(':last-of-type', frag);
      const res = evaluator.matchPseudoClassSelector(leaf, node1, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :only-of-type on multi-node fragment', () => {
      const leaf = {
        children: null,
        name: 'only-of-type',
        type: PS_CLASS_SELECTOR
      };
      const frag = document.createDocumentFragment();
      const node1 = document.createElement('div');
      const node2 = document.createElement('div');
      frag.append(node1, node2);
      const evaluator = new Evaluator(window);
      evaluator.setup(':only-of-type', frag);
      const res = evaluator.matchPseudoClassSelector(leaf, node1, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :only-of-type on second node in fragment', () => {
      const leaf = {
        children: null,
        name: 'only-of-type',
        type: PS_CLASS_SELECTOR
      };
      const frag = document.createDocumentFragment();
      const node1 = document.createElement('div');
      const node2 = document.createElement('div');
      frag.append(node1, node2);
      const evaluator = new Evaluator(window);
      evaluator.setup(':only-of-type', frag);
      const res = evaluator.matchPseudoClassSelector(leaf, node2, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :defined for standard HTML element', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('p');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':defined', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :defined for HTMLUnknownElement tags', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('asdf');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':defined', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(
        node instanceof window.HTMLUnknownElement,
        true,
        'instance'
      );
      assert.strictEqual(res, true, 'result');
    });

    it('should match :defined for registered custom element', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: PS_CLASS_SELECTOR
      };
      window.customElements.define(
        'sw-rey',
        class extends window.HTMLElement {}
      );
      const node = document.createElement('sw-rey');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':defined', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :defined for defined customized built-in element', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: PS_CLASS_SELECTOR
      };
      window.customElements.define(
        'sw-finn',
        class extends window.HTMLElement {},
        { extends: 'p' }
      );
      const node = document.createElement('p');
      node.setAttribute('is', 'sw-finn');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':defined', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :defined on undefined custom element', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('sw-han');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':defined', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :defined on undefined built-in element', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('p');
      node.setAttribute('is', 'sw-luke');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':defined', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :defined on element with unknown is attr', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('p');
      node.setAttribute('is', 'asdf');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':defined', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match :defined for valid registered custom element', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: PS_CLASS_SELECTOR
      };
      window.customElements.define('foo-', class extends window.HTMLElement {});
      const node = document.createElement('foo-');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':defined', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :defined for SVG element in SVG namespace', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      );
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':defined', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match :defined for arbitrary tag in SVG namespace', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'foo'
      );
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':defined', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    // NOTE: not implemented in jsdom
    it('should return false for :defined on MathML element in jsdom', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElementNS(
        'http://www.w3.org/1998/Math/MathML',
        'math'
      );
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':defined', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :defined on custom namespace element', () => {
      const leaf = {
        children: null,
        name: 'defined',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElementNS('http://www.example.com', 'foo');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':defined', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    // NOTE: popover api is not supported in jsdom
    it('should return false for :popover-open on plain element', () => {
      const leaf = {
        children: null,
        name: 'popover-open',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('p');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':popover-open', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :popover-open on closed popover', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':popover-open', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :popover-open after calling showPopover', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':popover-open', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :popover-open after calling hidePopover', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':popover-open', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :host on non-shadow host element', () => {
      const leaf = {
        children: null,
        name: 'host',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':host', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.deepEqual(res, false, 'result');
    });

    // legacy pseudo-element
    it('should return false for legacy pseudo-element :after', () => {
      const leaf = {
        children: null,
        name: 'after',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':after', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should log warning for legacy :after selector when warn is true', () => {
      const leaf = {
        children: null,
        name: 'after',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const stubWarn = sinon.stub(console, 'warn');
      const evaluator = new Evaluator(window);
      evaluator.setup(':after', node, {
        warn: true
      });
      const res = evaluator.matchPseudoClassSelector(leaf, node, {
        warn: true
      });
      const { called } = stubWarn;
      stubWarn.restore();
      assert.strictEqual(called, true, 'called');
      assert.strictEqual(res, false, 'result');
    });

    // not supported
    it('should return false for unsupported :autofill pseudo-class', () => {
      const leaf = {
        children: null,
        name: 'autofill',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':autofill', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should log warning for unsupported :autofill when warn is true', () => {
      const leaf = {
        children: null,
        name: 'autofill',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const stubWarn = sinon.stub(console, 'warn');
      const evaluator = new Evaluator(window);
      evaluator.setup(':autofill', node, {
        warn: true
      });
      const res = evaluator.matchPseudoClassSelector(leaf, node, {
        warn: true
      });
      const { called } = stubWarn;
      stubWarn.restore();
      assert.strictEqual(called, true, 'called');
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for unsupported :has-slotted pseudo-class', () => {
      const leaf = {
        children: null,
        name: 'has-slotted',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':has-slotted', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should log warning for :has-slotted selector when warn is true', () => {
      const leaf = {
        children: null,
        name: 'has-slotted',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const stubWarn = sinon.stub(console, 'warn');
      const evaluator = new Evaluator(window);
      evaluator.setup(':has-slotted', node, {
        warn: true
      });
      const res = evaluator.matchPseudoClassSelector(leaf, node, {
        warn: true
      });
      const { called } = stubWarn;
      stubWarn.restore();
      assert.strictEqual(called, true, 'called');
      assert.strictEqual(res, false, 'result');
    });

    // unknown
    it('should throw DOMException for unknown pseudo-class :foo', () => {
      const leaf = {
        children: null,
        name: 'foo',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':foo', node);
      assert.throws(
        () => evaluator.matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Unknown pseudo-class :foo', 'message');
          return true;
        }
      );
    });

    it('should return false for unknown :foo with forgive option', () => {
      const leaf = {
        children: null,
        name: 'foo',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':foo', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {
        forgive: true
      });
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for vendor-prefixed :-webkit-foo selector', () => {
      const leaf = {
        children: null,
        name: '-webkit-foo',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':-webkit-foo', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should log warning for :-webkit-foo selector when warn is true', () => {
      const leaf = {
        children: null,
        name: '-webkit-foo',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const stubWarn = sinon.stub(console, 'warn');
      const evaluator = new Evaluator(window);
      evaluator.setup(':-webkit-foo', node, {
        warn: true
      });
      const res = evaluator.matchPseudoClassSelector(leaf, node, {
        warn: true
      });
      const { called } = stubWarn;
      stubWarn.restore();
      assert.strictEqual(called, true, 'called');
      assert.strictEqual(res, false, 'result');
    });

    it('should throw DOMException for unknown :webkit-foo selector', () => {
      const leaf = {
        children: null,
        name: 'webkit-foo',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':webkit-foo', node);
      assert.throws(
        () => evaluator.matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Unknown pseudo-class :webkit-foo',
            'message'
          );
          return true;
        }
      );
    });

    it('should return false for :webkit-foo with forgive option', () => {
      const leaf = {
        children: null,
        name: 'webkit-foo',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':webkit-foo', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {
        forgive: true
      });
      assert.strictEqual(res, false, 'result');
    });

    it('should throw DOMException for unknown :-webkitfoo selector', () => {
      const leaf = {
        children: null,
        name: '-webkitfoo',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':-webkitfoo', node);
      assert.throws(
        () => evaluator.matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Unknown pseudo-class :-webkitfoo',
            'message'
          );
          return true;
        }
      );
    });

    it('should return false for :-webkitfoo with forgive option', () => {
      const leaf = {
        children: null,
        name: '-webkitfoo',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup(':-webkitfoo', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {
        forgive: true
      });
      assert.strictEqual(res, false, 'result');
    });

    it('should throw DOMException for unknown :nth-foo pseudo-class', () => {
      const leaf = {
        name: 'nth-foo',
        nth: {
          a: '3',
          b: '1',
          type: AN_PLUS_B
        },
        selector: null,
        type: NTH
      };
      const node = document.getElementById('dt1');
      const evaluator = new Evaluator(window);
      evaluator.setup(':nth-foo(3n+1)', node);
      assert.throws(
        () => evaluator.matchPseudoClassSelector(leaf, node, {}),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Unknown pseudo-class :nth-foo',
            'message'
          );
          return true;
        }
      );
    });
  });

  describe('evaluates shadow host pseudo class', () => {
    it('should throw DOMException for invalid pseudo-class :foobar', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':foobar div', node);
      assert.throws(
        () => evaluator.evaluateShadowHost(ast, node),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector :foobar', 'message');
          return true;
        }
      );
    });

    it('should throw DOMException for unknown pseudo-class function', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':foobar(#baz) div', node);
      assert.throws(
        () => evaluator.evaluateShadowHost(ast, node),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector :foobar()',
            'message'
          );
          return true;
        }
      );
    });

    it('should throw DOMException when :host-context lacks arguments', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host-context div', node);
      assert.throws(
        () => evaluator.evaluateShadowHost(ast, node),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector :host-context',
            'message'
          );
          return true;
        }
      );
    });

    it('should throw DOMException when :host() selector is empty', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host() div', node);
      assert.throws(
        () => evaluator.evaluateShadowHost(ast, node),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector :host()', 'message');
          return true;
        }
      );
    });

    it('should throw DOMException when :host-context() is empty', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host-context() div', node);
      assert.throws(
        () => evaluator.evaluateShadowHost(ast, node),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector :host-context()',
            'message'
          );
          return true;
        }
      );
    });

    it('should match shadow host when evaluating parameterless :host', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host div', node);
      const res = evaluator.evaluateShadowHost(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should throw DOMException for :host() containing combinators', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host(#baz #foobar) div', node);
      assert.throws(
        () => evaluator.evaluateShadowHost(ast, node),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector :host(#baz #foobar)',
            'message'
          );
          return true;
        }
      );
    });

    it('should match shadow host when :host() selector matches ID', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host(#baz) div', node);
      const res = evaluator.evaluateShadowHost(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :host() when host ID does not match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host(#foobar) div', node);
      const res = evaluator.evaluateShadowHost(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should throw DOMException for :host-context() with combinator', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host-context(#baz #foobar) div', node);
      assert.throws(
        () => evaluator.evaluateShadowHost(ast, node),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector :host-context(#baz #foobar)',
            'message'
          );
          return true;
        }
      );
    });

    it('should match :host-context() when matching shadow host ID', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host-context(#baz) div', node);
      const res = evaluator.evaluateShadowHost(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match :host-context() when matching ancestor element', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host-context(#div0) div', node);
      const res = evaluator.evaluateShadowHost(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :host-context() when ID mismatches', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host-context(#foobar) div', node);
      const res = evaluator.evaluateShadowHost(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for :host(:state) on unclicked element', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host(:state(checked)) div', node);
      const res = evaluator.evaluateShadowHost(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match :host(:state) when custom state is active', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host(:state(checked)) div', node);
      const res = evaluator.evaluateShadowHost(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for :host(:state) when state inactive', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host(:state(checked)) div', node);
      const res = evaluator.evaluateShadowHost(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match :host(:state) updated via element property', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host(:state(checked)) div', node);
      const res = evaluator.evaluateShadowHost(ast, node);
      assert.strictEqual(res, true, 'result');
    });
  });

  describe('match selector for shadow root', () => {
    let host, shadowRoot;
    beforeEach(() => {
      const html = `
      <template id="template">
        <div><slot id="foo" name="bar">Foo</slot></div>
      </template>
      <my-element id="baz">
        <span id="qux" slot="foo">Qux</span>
      </my-element>
      `;
      const container = document.getElementById('div0');
      container.innerHTML = html;
      if (!window.customElements.get('my-element')) {
        class MyElement extends window.HTMLElement {
          constructor() {
            super();
            const sRoot = this.attachShadow({ mode: 'open' });
            const template = document.getElementById('template');
            sRoot.appendChild(template.content.cloneNode(true));
          }
        }
        window.customElements.define('my-element', MyElement);
      }
      host = document.getElementById('baz');
      shadowRoot = host.shadowRoot;
    });

    it('should set opt.isShadowRoot when matching :is(:host) selector', () => {
      const ast = {
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: null,
                    loc: null,
                    name: 'host',
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
        name: 'is',
        type: PS_CLASS_SELECTOR
      };
      const evaluator = new Evaluator(window);
      const opt = {};
      const res = evaluator
        .setup(':is(:host)', shadowRoot)
        .matchSelector(ast, shadowRoot, opt);
      assert.strictEqual(
        opt.isShadowRoot,
        true,
        'sets opt.isShadowRoot to true'
      );
      assert.strictEqual(
        res,
        true,
        'matches logical pseudo class inside shadow root'
      );
    });

    it('should match :host pseudo-class selector against ShadowRoot', () => {
      const ast = {
        children: null,
        name: 'host',
        type: PS_CLASS_SELECTOR
      };
      const evaluator = new Evaluator(window);
      const res = evaluator
        .setup(':host', shadowRoot)
        .matchSelector(ast, shadowRoot, {});
      assert.strictEqual(res, true, 'matches :host');
    });

    it('should match :host-context selector against ShadowRoot', () => {
      const ast = {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'div0',
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
      const evaluator = new Evaluator(window);
      const res = evaluator
        .setup(':host-context(#div0)', shadowRoot)
        .matchSelector(ast, shadowRoot, {});
      assert.strictEqual(res, true, 'matches :host-context');
    });

    it('should return false when :host pseudo-class fails to match', () => {
      const ast = {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'nomatch',
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
      const evaluator = new Evaluator(window);
      const res = evaluator
        .setup(':host(#nomatch)', shadowRoot)
        .matchSelector(ast, shadowRoot, {});
      assert.strictEqual(res, false, 'does not match :host with invalid id');
    });

    it('should return false for unrelated pseudo-class on ShadowRoot', () => {
      const ast = {
        children: null,
        name: 'hover',
        type: PS_CLASS_SELECTOR
      };
      const evaluator = new Evaluator(window);
      const res = evaluator
        .setup(':hover', shadowRoot)
        .matchSelector(ast, shadowRoot, {});
      assert.strictEqual(
        res,
        false,
        'returns false for non-shadow-root pseudo-classes'
      );
    });
  });

  describe('match selector', () => {
    it('should match element by class selector AST', () => {
      const ast = {
        name: 'foo',
        type: CLASS_SELECTOR
      };
      const node = document.getElementById('div5');
      const evaluator = new Evaluator(window);
      evaluator.setup('.foo', document);
      const res = evaluator.matchSelector(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match newly created element with class selector', () => {
      const ast = {
        name: 'foo',
        type: CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.classList.add('foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup('.foo', document);
      const res = evaluator.matchSelector(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false when class selector does not match', () => {
      const ast = {
        name: 'bar',
        type: CLASS_SELECTOR
      };
      const node = document.createElement('div');
      node.classList.add('foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup('.foo', document);
      const res = evaluator.matchSelector(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match element by ID selector AST', () => {
      const ast = {
        name: 'div0',
        type: ID_SELECTOR
      };
      const node = document.getElementById('div0');
      const evaluator = new Evaluator(window);
      evaluator.setup('.foo', document);
      const res = evaluator.matchSelector(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false when ID selector does not match', () => {
      const ast = {
        name: 'foo',
        type: ID_SELECTOR
      };
      const node = document.getElementById('div0');
      const evaluator = new Evaluator(window);
      evaluator.setup('.foo', document);
      const res = evaluator.matchSelector(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match ID selector containing escaped spaces', () => {
      const ast = {
        name: 'foo\\ bar',
        type: ID_SELECTOR
      };
      const node = document.createElement('div');
      node.setAttribute('id', 'foo bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup('.foo', document);
      const res = evaluator.matchSelector(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match element by attribute presence selector', () => {
      const ast = {
        flags: null,
        evaluator: null,
        name: {
          name: 'hidden',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      const node = document.getElementById('span3');
      const evaluator = new Evaluator(window);
      evaluator.setup('[hidden]', document);
      const res = evaluator.matchSelector(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match element by type selector AST', () => {
      const ast = {
        name: 'dt',
        type: TYPE_SELECTOR
      };
      const node = document.getElementById('dt1');
      const evaluator = new Evaluator(window);
      evaluator.setup('dt', document);
      const res = evaluator.matchSelector(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match element via logical :is() selector AST', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':is(ul)', document);
      const res = evaluator.matchSelector(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should throw DOMException for unknown pseudo-element ::foo', () => {
      const ast = {
        children: null,
        name: 'foo',
        type: PS_ELEMENT_SELECTOR
      };
      const node = document.documentElement;
      const evaluator = new Evaluator(window);
      evaluator.setup('::foo', node);
      assert.throws(
        () => evaluator.matchSelector(ast, node),
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

    it('should return false for ::before pseudo-element by default', () => {
      const ast = {
        children: null,
        name: 'before',
        type: PS_ELEMENT_SELECTOR
      };
      const node = document.documentElement;
      const evaluator = new Evaluator(window);
      evaluator.setup('::before', node);
      const res = evaluator.matchSelector(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match ::before pseudo-element when check is enabled', () => {
      const ast = {
        children: null,
        name: 'before',
        type: PS_ELEMENT_SELECTOR
      };
      const node = document.documentElement;
      const evaluator = new Evaluator(window);
      evaluator.setup('::before', node, {
        check: true
      });
      const res = evaluator.matchSelector(ast, node, {
        check: true
      });
      assert.strictEqual(res, true, 'result');
    });

    it('should log warning for ::before selector when warn is true', () => {
      const ast = {
        children: null,
        name: 'before',
        type: PS_ELEMENT_SELECTOR
      };
      const node = document.documentElement;
      const stubWarn = sinon.stub(console, 'warn');
      const evaluator = new Evaluator(window);
      evaluator.setup('::before', node, {
        warn: true
      });
      const res = evaluator.matchSelector(ast, node, {
        warn: true
      });
      const { called } = stubWarn;
      stubWarn.restore();
      assert.strictEqual(called, true, 'called');
      assert.strictEqual(res, false, 'result');
    });

    it('should match :host(#baz) selector AST against ShadowRoot', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host(#baz) div', node);
      const res = evaluator.matchSelector(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false when :host(#foobar) ID fails to match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host(#foobar) div', node);
      const res = evaluator.matchSelector(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match element by nesting selector AST', () => {
      const ast = {
        name: '&',
        type: NEST_SELECTOR
      };
      const node = document.getElementById('div5');
      const evaluator = new Evaluator(window);
      evaluator.setup('&', node);
      const res = evaluator.matchSelector(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false when nest selector does not match the node', () => {
      const ast = {
        name: '&',
        type: NEST_SELECTOR
      };
      const scopeNode = document.getElementById('div0');
      const targetNode = document.getElementById('div5'); // scopeNodeの小要素
      const evaluator = new Evaluator(window);
      evaluator.setup('&', scopeNode);
      const res = evaluator.matchSelector(ast, targetNode);
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('match leaves', () => {
    it('should return true when element matches all leaf selectors', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup('li#li1.li', document);
      const res = evaluator.matchLeaves(leaves, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false when element fails any leaf selector', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup('li#li1.foobar', document);
      const res = evaluator.matchLeaves(leaves, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should cache evaluation results for non-form elements', () => {
      const leaves = [
        {
          loc: null,
          name: 'test-cache',
          type: CLASS_SELECTOR
        }
      ];
      const node = document.createElement('div');
      node.classList.add('test-cache');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const res1 = evaluator.matchLeaves(leaves, node, {});
      assert.strictEqual(res1, true, 'initially matches');
      node.classList.remove('test-cache');
      const res2 = evaluator.matchLeaves(leaves, node, {});
      assert.strictEqual(
        res2,
        true,
        'returns cached true even after state change'
      );
    });

    it('should bypass result cache when evaluating form elements', () => {
      const leaves = [
        {
          loc: null,
          name: 'test-cache',
          type: CLASS_SELECTOR
        }
      ];
      const node = document.createElement('form');
      node.classList.add('test-cache');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const res1 = evaluator.matchLeaves(leaves, node, {});
      assert.strictEqual(res1, true, 'initially matches form');
      node.classList.remove('test-cache');
      const res2 = evaluator.matchLeaves(leaves, node, {});
      assert.strictEqual(
        res2,
        false,
        're-evaluates and returns false (no cache)'
      );
    });

    it('should bypass result cache when evaluating input elements', () => {
      const leaves = [
        {
          loc: null,
          name: 'test-cache',
          type: CLASS_SELECTOR
        }
      ];
      const node = document.createElement('input');
      node.classList.add('test-cache');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const res1 = evaluator.matchLeaves(leaves, node, {});
      assert.strictEqual(res1, true, 'initially matches input');
      node.classList.remove('test-cache');
      const res2 = evaluator.matchLeaves(leaves, node, {});
      assert.strictEqual(
        res2,
        false,
        're-evaluates and returns false (no cache)'
      );
    });

    it('should cache results when matching standard pseudo-classes', () => {
      const leaves = [
        {
          loc: null,
          name: 'test-cache',
          type: CLASS_SELECTOR
        },
        {
          children: null,
          name: 'empty',
          type: PS_CLASS_SELECTOR
        }
      ];
      const node = document.createElement('div');
      node.classList.add('test-cache');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const res1 = evaluator.matchLeaves(leaves, node, {});
      assert.strictEqual(res1, true, 'initially matches');
      node.classList.remove('test-cache');
      const res2 = evaluator.matchLeaves(leaves, node, {});
      assert.strictEqual(
        res2,
        true,
        'returns cached true even after state change'
      );
    });

    it('should bypass cache for uncacheable pseudo-class selectors', () => {
      const leaves = [
        {
          loc: null,
          name: 'test-cache',
          type: CLASS_SELECTOR
        },
        {
          children: null,
          name: 'any-link',
          type: PS_CLASS_SELECTOR
        }
      ];
      const node = document.createElement('a');
      node.setAttribute('href', 'https://example.com/');
      node.classList.add('test-cache');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const res1 = evaluator.matchLeaves(leaves, node, {});
      assert.strictEqual(res1, true, 'initially matches');
      node.classList.remove('test-cache');
      const res2 = evaluator.matchLeaves(leaves, node, {});
      assert.strictEqual(
        res2,
        false,
        're-evaluates and returns false (no cache)'
      );
    });

    it('should bypass cache for directional pseudo-class selectors', () => {
      const leaves = [
        {
          loc: null,
          name: 'test-cache',
          type: CLASS_SELECTOR
        },
        {
          children: [
            {
              name: 'ltr',
              type: IDENT
            }
          ],
          name: 'dir',
          type: PS_CLASS_SELECTOR
        }
      ];
      const node = document.createElement('div');
      node.setAttribute('dir', 'ltr');
      node.classList.add('test-cache');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const res1 = evaluator.matchLeaves(leaves, node, {});
      assert.strictEqual(res1, true, 'initially matches');
      node.classList.remove('test-cache');
      const res2 = evaluator.matchLeaves(leaves, node, {});
      assert.strictEqual(
        res2,
        false,
        're-evaluates and returns false (no cache)'
      );
    });

    it('should return cached match result on subsequent evaluations', () => {
      const leaves = [
        {
          loc: null,
          name: 'test-invalidate-false',
          type: CLASS_SELECTOR
        }
      ];
      const node = document.createElement('div');
      node.classList.add('test-invalidate-false');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const res1 = evaluator.matchLeaves(leaves, node, {});
      assert.strictEqual(res1, true, 'initially matches');
      node.classList.remove('test-invalidate-false');
      const res2 = evaluator.matchLeaves(leaves, node, {});
      assert.strictEqual(res2, true, 'returns cached true from #results');
    });

    it('should re-evaluate leaves after results cache is cleared', () => {
      const leaves = [
        {
          loc: null,
          name: 'test-invalidate-true',
          type: CLASS_SELECTOR
        }
      ];
      const node = document.createElement('div');
      node.classList.add('test-invalidate-true');
      document.getElementById('div0').appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const res1 = evaluator.matchLeaves(leaves, node, {});
      assert.strictEqual(res1, true, 'initially matches');
      node.classList.remove('test-invalidate-true');
      evaluator.clearResults(true);
      const res2 = evaluator.matchLeaves(leaves, node, {});
      assert.strictEqual(
        res2,
        false,
        're-evaluates and returns false after explicit cache clear'
      );
    });
  });

  describe('get filter leaves', () => {
    it('should return a new array omitting the first element', () => {
      const leaves = [
        { name: 'div', type: TYPE_SELECTOR },
        { name: 'foo', type: CLASS_SELECTOR },
        { name: 'bar', type: CLASS_SELECTOR }
      ];
      const evaluator = new Evaluator(window);
      const res = evaluator.getFilterLeaves(leaves);
      assert.deepEqual(
        res,
        [
          { name: 'foo', type: CLASS_SELECTOR },
          { name: 'bar', type: CLASS_SELECTOR }
        ],
        'returns array sliced from index 1'
      );
    });

    it('should utilize cache and return the exact same array reference', () => {
      const leaves = [
        { name: 'div', type: TYPE_SELECTOR },
        { name: 'foo', type: CLASS_SELECTOR }
      ];
      const evaluator = new Evaluator(window);
      const res1 = evaluator.getFilterLeaves(leaves);
      const res2 = evaluator.getFilterLeaves(leaves);
      assert.deepEqual(
        res1,
        [{ name: 'foo', type: CLASS_SELECTOR }],
        'correct sliced array'
      );
      assert.strictEqual(res1, res2, 'returns the exact same cached reference');
    });

    it('should not share cache for different array references', () => {
      const leaves1 = [
        { name: 'div', type: TYPE_SELECTOR },
        { name: 'foo', type: CLASS_SELECTOR }
      ];
      const leaves2 = [
        { name: 'div', type: TYPE_SELECTOR },
        { name: 'foo', type: CLASS_SELECTOR }
      ];
      const evaluator = new Evaluator(window);
      const res1 = evaluator.getFilterLeaves(leaves1);
      const res2 = evaluator.getFilterLeaves(leaves2);
      assert.notStrictEqual(
        res1,
        res2,
        'returns different references for different input arrays'
      );
      assert.deepEqual(res1, res2, 'contents are identical');
    });

    it('should return an empty array if leaves has 1 or 0 elements', () => {
      const singleElementLeaves = [{ name: 'div', type: TYPE_SELECTOR }];
      const emptyLeaves = [];
      const evaluator = new Evaluator(window);
      const resSingle = evaluator.getFilterLeaves(singleElementLeaves);
      const resEmpty = evaluator.getFilterLeaves(emptyLeaves);
      assert.deepEqual(resSingle, [], 'returns empty array for 1 element');
      assert.deepEqual(resEmpty, [], 'returns empty array for 0 elements');
    });
  });

  describe('find descendant nodes', () => {
    it('should yield descendant element matching ID selector', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup('div #foobar', parent);
      const res = evaluator.yieldFindDescendantNodes(leaves, parent);
      assert.deepEqual([...res], [node], 'nodes');
    });

    it('should yield all descendant elements for universal selector', () => {
      const leaves = [
        {
          name: '\\*',
          type: TYPE_SELECTOR
        }
      ];
      const node = document.getElementById('ul1');
      const evaluator = new Evaluator(window);
      evaluator.setup('ul *', document);
      const res = evaluator.yieldFindDescendantNodes(leaves, node);
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

    it('should yield descendant matching ID selector under refNode', () => {
      const leaves = [
        {
          name: 'li3',
          type: ID_SELECTOR
        }
      ];
      const refNode = document.getElementById('ul1');
      const node = document.getElementById('li3');
      const evaluator = new Evaluator(window);
      evaluator.setup('ul #li3', document);
      const res = evaluator.yieldFindDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [node], 'nodes');
    });

    it('should yield empty array when descendant ID is not found', () => {
      const leaves = [
        {
          name: 'foobar',
          type: ID_SELECTOR
        }
      ];
      const refNode = document.getElementById('ul1');
      const evaluator = new Evaluator(window);
      evaluator.setup('ul #foobar', document);
      const res = evaluator.yieldFindDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should yield empty array when target ID is refNode itself', () => {
      const leaves = [
        {
          name: 'ul1',
          type: ID_SELECTOR
        }
      ];
      const refNode = document.getElementById('ul1');
      const evaluator = new Evaluator(window);
      evaluator.setup('div #ul1', document);
      const res = evaluator.yieldFindDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should yield descendant matching combined type and ID', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup('ul li#li3', document);
      const res = evaluator.yieldFindDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [node], 'nodes');
    });

    it('should yield empty array when class fails on ID selector', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup('ul #li3.foobar', document);
      const res = evaluator.yieldFindDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should yield all descendant elements matching class selector', () => {
      const leaves = [
        {
          name: 'li',
          type: CLASS_SELECTOR
        }
      ];
      const refNode = document.getElementById('ul1');
      const evaluator = new Evaluator(window);
      evaluator.setup('ul .li', document);
      const res = evaluator.yieldFindDescendantNodes(leaves, refNode);
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

    it('should yield descendant matching class and pseudo-class', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup('ul .li:first-child', document);
      const res = evaluator.yieldFindDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [document.getElementById('li1')], 'nodes');
    });

    it('should yield empty array when class selector is not found', () => {
      const leaves = [
        {
          name: 'foobar',
          type: CLASS_SELECTOR
        }
      ];
      const refNode = document.getElementById('ul1');
      const evaluator = new Evaluator(window);
      evaluator.setup('ul .foobar', document);
      const res = evaluator.yieldFindDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should fallback search when getElementsByClassName missing', () => {
      const leaves = [
        {
          name: 'fallback-class',
          type: CLASS_SELECTOR
        }
      ];
      const baseNode = document.createDocumentFragment();
      const child = document.createElement('div');
      child.className = 'fallback-class';
      const grandChild = document.createElement('span');
      grandChild.className = 'fallback-class';
      child.appendChild(grandChild);
      baseNode.appendChild(child);
      const evaluator = new Evaluator(window);
      evaluator.setup('.fallback-class', baseNode);
      const res = evaluator.yieldFindDescendantNodes(leaves, baseNode, {});
      assert.deepEqual([...res], [child, grandChild], 'nodes');
    });

    it('should yield matching descendant elements in XML document', () => {
      const leaves = [
        {
          name: 'div',
          type: TYPE_SELECTOR
        }
      ];
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
      const evaluator = new Evaluator(window);
      evaluator.setup('root div', root);
      const res = evaluator.yieldFindDescendantNodes(leaves, root);
      assert.deepEqual([...res], [div1, div2, div3, div4], 'nodes');
    });

    it('should yield descendants matching wildcard namespace type', () => {
      const leaves = [
        {
          name: '*|li',
          type: TYPE_SELECTOR
        }
      ];
      const refNode = document.getElementById('ul1');
      const evaluator = new Evaluator(window);
      evaluator.setup('ul *|li', document);
      const res = evaluator.yieldFindDescendantNodes(leaves, refNode);
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

    it('should yield all descendant elements matching type selector', () => {
      const leaves = [
        {
          name: 'li',
          type: TYPE_SELECTOR
        }
      ];
      const refNode = document.getElementById('ul1');
      const evaluator = new Evaluator(window);
      evaluator.setup('ul li', document);
      const res = evaluator.yieldFindDescendantNodes(leaves, refNode);
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

    it('should yield descendant matching type and pseudo-class', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup('ul li:first-child', document);
      const res = evaluator.yieldFindDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [document.getElementById('li1')], 'nodes');
    });

    it('should yield empty array when type selector is not found', () => {
      const leaves = [
        {
          name: 'ol',
          type: TYPE_SELECTOR
        }
      ];
      const refNode = document.getElementById('div1');
      const evaluator = new Evaluator(window);
      evaluator.setup('div ol', document);
      const res = evaluator.yieldFindDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should yield empty array for pseudo-element selectors', () => {
      const leaves = [
        {
          children: null,
          name: 'before',
          type: PS_ELEMENT_SELECTOR
        }
      ];
      const refNode = document.getElementById('ul1');
      const evaluator = new Evaluator(window);
      evaluator.setup('ul ::before', document);
      const res = evaluator.yieldFindDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should yield descendant elements matching attribute selector', () => {
      const leaves = [
        {
          flags: null,
          evaluator: null,
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
      const evaluator = new Evaluator(window);
      evaluator.setup('dl [hidden]', document);
      const res = evaluator.yieldFindDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [span1, span3], 'nodes');
    });

    it('should yield descendant elements matching pseudo-class', () => {
      const leaves = [
        {
          children: null,
          name: 'first-child',
          type: PS_CLASS_SELECTOR
        }
      ];
      const refNode = document.getElementById('ul1');
      const evaluator = new Evaluator(window);
      evaluator.setup('ul :first-child', document);
      const res = evaluator.yieldFindDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [refNode.firstElementChild], 'nodes');
    });
  });

  describe('yield combinator matches (generator)', () => {
    let parent, prevSpan2, prevSpan1, targetP, nextDiv1, nextDiv2;

    beforeEach(() => {
      parent = document.createElement('div');
      parent.id = 'test-parent';
      prevSpan2 = document.createElement('span');
      prevSpan1 = document.createElement('span');
      targetP = document.createElement('p');
      nextDiv1 = document.createElement('div');
      nextDiv2 = document.createElement('div');
      parent.appendChild(prevSpan2);
      parent.appendChild(prevSpan1);
      parent.appendChild(targetP);
      parent.appendChild(nextDiv1);
      parent.appendChild(nextDiv2);
      document.getElementById('div0').appendChild(parent);
    });

    it('should yield all next siblings for ~ combinator', () => {
      const twig = {
        combo: { loc: null, name: '~', type: COMBINATOR },
        leaves: [{ loc: null, name: 'div', type: TYPE_SELECTOR }]
      };
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const matched = [
        ...evaluator.yieldCombinatorMatches(twig, targetP, { dir: 'next' })
      ];
      assert.deepEqual(
        matched,
        [nextDiv1, nextDiv2],
        'yields all subsequent matching siblings'
      );
    });

    it('should yield all previous siblings for ~ combinator', () => {
      const twig = {
        combo: { loc: null, name: '~', type: COMBINATOR },
        leaves: [{ loc: null, name: 'span', type: TYPE_SELECTOR }]
      };
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const matched = [
        ...evaluator.yieldCombinatorMatches(twig, targetP, { dir: 'prev' })
      ];
      assert.deepEqual(
        matched,
        [prevSpan1, prevSpan2],
        'yields all preceding matching siblings'
      );
    });

    it('should yield nextElementSibling for + combinator', () => {
      const twig = {
        combo: { loc: null, name: '+', type: COMBINATOR },
        leaves: [{ loc: null, name: 'div', type: TYPE_SELECTOR }]
      };
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const matched = [
        ...evaluator.yieldCombinatorMatches(twig, targetP, { dir: 'next' })
      ];
      assert.deepEqual(matched, [nextDiv1], 'yields next sibling');
    });

    it('should yield previousElementSibling for + combinator', () => {
      const twig = {
        combo: { loc: null, name: '+', type: COMBINATOR },
        leaves: [{ loc: null, name: 'span', type: TYPE_SELECTOR }]
      };
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const matched = [
        ...evaluator.yieldCombinatorMatches(twig, targetP, { dir: 'prev' })
      ];
      assert.deepEqual(matched, [prevSpan1], 'yields previous sibling');
    });

    it('should yield children for > combinator', () => {
      const twig = {
        combo: { loc: null, name: '>', type: COMBINATOR },
        leaves: [{ loc: null, name: 'span', type: TYPE_SELECTOR }]
      };
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const matched = [
        ...evaluator.yieldCombinatorMatches(twig, parent, { dir: 'next' })
      ];
      assert.deepEqual(
        matched,
        [prevSpan2, prevSpan1],
        'yields direct children matching the selector'
      );
    });

    it('should yield parent node for > combinator', () => {
      const twig = {
        combo: { loc: null, name: '>', type: COMBINATOR },
        leaves: [{ loc: null, name: 'div', type: TYPE_SELECTOR }]
      };
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const matched = [
        ...evaluator.yieldCombinatorMatches(twig, targetP, { dir: 'prev' })
      ];
      assert.deepEqual(matched, [parent], 'yields parent node');
    });

    it('should yield descendants for descendant combinator', () => {
      const twig = {
        combo: { loc: null, name: ' ', type: COMBINATOR },
        leaves: [{ loc: null, name: 'p', type: TYPE_SELECTOR }]
      };
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const matched = [
        ...evaluator.yieldCombinatorMatches(twig, parent, { dir: 'next' })
      ];
      assert.deepEqual(
        matched,
        [targetP],
        'yields descendants matching the selector'
      );
    });

    it('should yield ancestors for descendant combinator', () => {
      const twig = {
        combo: { loc: null, name: ' ', type: COMBINATOR },
        leaves: [{ loc: null, name: 'div', type: TYPE_SELECTOR }]
      };
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const matched = [
        ...evaluator.yieldCombinatorMatches(twig, targetP, { dir: 'prev' })
      ];
      const div0 = document.getElementById('div0');
      assert.deepEqual(
        matched,
        [parent, div0],
        'yields ancestors matching the selector from closest to furthest'
      );
    });

    it('should safely return empty generator without throwing', () => {
      const twig = {
        combo: { loc: null, name: '+', type: COMBINATOR },
        leaves: [{ loc: null, name: 'section', type: TYPE_SELECTOR }]
      };
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const matchedNext = [
        ...evaluator.yieldCombinatorMatches(twig, targetP, { dir: 'next' })
      ];
      assert.deepEqual(
        matchedNext,
        [],
        'empty when next sibling does not match'
      );
      const matchedPrev = [
        ...evaluator.yieldCombinatorMatches(twig, targetP, { dir: 'prev' })
      ];
      assert.deepEqual(
        matchedPrev,
        [],
        'empty when previous sibling does not match'
      );
    });
  });
});
