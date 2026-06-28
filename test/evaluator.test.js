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
  ELEMENT_NODE,
  IDENT,
  ID_SELECTOR,
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
    it('should not throw', () => {
      const err = new DOMException('error', SYNTAX_ERR);
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document, {
        noexcept: true
      });
      assert.doesNotThrow(() => evaluator.onError(err));
    });

    it('should throw', () => {
      const err = new TypeError('error');
      const evaluator = new Evaluator(window);
      assert.throws(() => evaluator.onError(err), window.TypeError, 'error');
    });

    it('should throw', () => {
      const err = new Error('error');
      err.name = 'UnknownError';
      const evaluator = new Evaluator(window);
      assert.throws(() => evaluator.onError(err), Error, 'error');
    });

    it('should throw', () => {
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

    it('should not throw', () => {
      const err = new window.DOMException('error', NOT_SUPPORTED_ERR);
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const res = evaluator.onError(err);
      assert.strictEqual(res, undefined, 'result');
    });

    it('should not throw', () => {
      const err = new TypeError('Unexpected type');
      const evaluator = new Evaluator(window);
      const res = evaluator.onError(err, {
        noexcept: true
      });
      assert.strictEqual(res, undefined, 'result');
    });

    it('should warn', () => {
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
    it('should get value', () => {
      const evaluator = new Evaluator(window);
      const res = evaluator.setup('*', document, {
        warn: true
      });
      assert.deepEqual(res, evaluator, 'result');
    });

    it('should get value', () => {
      const frag = document.createDocumentFragment();
      const evaluator = new Evaluator(window);
      const res = evaluator.setup('*', frag, {
        warn: true
      });
      assert.deepEqual(res, evaluator, 'result');
    });

    it('should get value', () => {
      const node = document.createElement('div');
      const evaluator = new Evaluator(window);
      const res = evaluator.setup('*', node, {
        warn: true
      });
      assert.deepEqual(res, evaluator, 'result');
    });

    it('should get value', () => {
      const node = document.createElement('div');
      const evaluator = new Evaluator(window);
      const res = evaluator.setup('*', node, {
        check: true,
        noexcept: true,
        warn: false
      });
      assert.deepEqual(res, evaluator, 'result');
    });

    it('should get value', () => {
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

  describe('register event listeners', () => {
    it('should register listeners', () => {
      const evaluator = new Evaluator(window);
      const res = evaluator._registerEventListeners();
      assert.deepEqual(
        res,
        [
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined
        ],
        'result'
      );
    });
  });

  describe('create tree walker', () => {
    it('should get tree walker', () => {
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const res = evaluator.createTreeWalker(document);
      assert.deepEqual(res.root, document, 'root');
    });

    it('should get tree walker', () => {
      const node = document.getElementById('ul1');
      const evaluator = new Evaluator(window);
      evaluator.setup('*', node);
      const res = evaluator.createTreeWalker(node);
      assert.deepEqual(res.root, node, 'root');
    });

    it('should get tree walker', () => {
      const node = document.getElementById('ul1');
      const evaluator = new Evaluator(window);
      evaluator.setup('*', node);
      const res = evaluator.createTreeWalker(node, {
        whatToShow: 0xffffffff
      });
      assert.deepEqual(res.root, node, 'root');
    });

    it('should utilize cache and return the same TreeWalker instance', () => {
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
    it('should not match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':nth-child(even)', node);
      const res = evaluator._matchAnPlusB(leaf, node, leafName);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':nth-child(odd)', node);
      const res = evaluator._matchAnPlusB(leaf, node, leafName);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup('dt:nth-child(odd)', node);
      const res = evaluator._matchAnPlusB(leaf, node, leafName);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':nth-last-child(even)', node);
      const res = evaluator._matchAnPlusB(leaf, node, leafName);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':nth-child(3n+1)', node);
      const res = evaluator._matchAnPlusB(leaf, node, leafName);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':nth-child(2n)', node);
      const res = evaluator._matchAnPlusB(leaf, node, leafName);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':nth-child(3)', node);
      const res = evaluator._matchAnPlusB(leaf, node, leafName);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':nth-child(1)', node);
      const res = evaluator._matchAnPlusB(leaf, node, leafName);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':nth-last-child(3n+1)', node);
      const res = evaluator._matchAnPlusB(leaf, node, leafName);
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':nth-of-type(even)', node);
      const res = evaluator._matchAnPlusB(leaf, node, leafName);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':nth-of-type(odd)', node);
      const res = evaluator._matchAnPlusB(leaf, node, leafName);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':nth-last-of-type(even)', node);
      const res = evaluator._matchAnPlusB(leaf, node, leafName);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':nth-of-type(3n+1)', node);
      const res = evaluator._matchAnPlusB(leaf, node, leafName);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':nth-of-type(2n)', node);
      const res = evaluator._matchAnPlusB(leaf, node, leafName);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':nth-of-type(3)', node);
      const res = evaluator._matchAnPlusB(leaf, node, leafName);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':nth-last-of-type(3n+1)', node);
      const res = evaluator._matchAnPlusB(leaf, node, leafName);
      assert.strictEqual(res, false, 'result');
    });

    it('should test a > 0 with valid and invalid diff boundaries', () => {
      const leafName = 'nth-child';
      // 3n + 5 (n=0: 5, n=1: 8, n=2: 11...)
      const leaf = {
        nth: { a: '3', b: '5', type: AN_PLUS_B },
        selector: null,
        type: NTH
      };
      const evaluator = new Evaluator(window);
      const parent = document.createElement('div');
      for (let i = 0; i < 10; i++) {
        parent.appendChild(document.createElement('p'));
      }
      document.getElementById('div0').appendChild(parent);
      const nodeMatch = parent.children[7];
      evaluator.setup(':nth-child(3n+5)', nodeMatch);
      assert.strictEqual(
        evaluator._matchAnPlusB(leaf, nodeMatch, leafName),
        true,
        'pos=8 matches 3n+5'
      );
      const nodeMinusDiff = parent.children[1];
      evaluator.setup(':nth-child(3n+5)', nodeMinusDiff);
      assert.strictEqual(
        evaluator._matchAnPlusB(leaf, nodeMinusDiff, leafName),
        false,
        'pos=2 fails 3n+5 because diff < 0'
      );
    });

    it('should test a < 0 with valid and invalid diff boundaries', () => {
      const leafName = 'nth-child';
      // -3n + 5 (n=0: 5, n=1: 2)
      const leaf = {
        nth: { a: '-3', b: '5', type: AN_PLUS_B },
        selector: null,
        type: NTH
      };
      const evaluator = new Evaluator(window);
      const parent = document.createElement('div');
      for (let i = 0; i < 10; i++) {
        parent.appendChild(document.createElement('p'));
      }
      document.getElementById('div0').appendChild(parent);
      const nodeMatch = parent.children[1];
      evaluator.setup(':nth-child(-3n+5)', nodeMatch);
      assert.strictEqual(
        evaluator._matchAnPlusB(leaf, nodeMatch, leafName),
        true,
        'pos=2 matches -3n+5'
      );
      const nodePlusDiff = parent.children[7];
      evaluator.setup(':nth-child(-3n+5)', nodePlusDiff);
      assert.strictEqual(
        evaluator._matchAnPlusB(leaf, nodePlusDiff, leafName),
        false,
        'pos=8 fails -3n+5 because diff > 0'
      );
    });

    it('should branch on anb.selector caching for nth-child of sel', () => {
      const leafName = 'nth-child';
      const leaf = {
        nth: { a: '2', b: '1', type: AN_PLUS_B },
        selector: {
          children: [
            {
              children: [{ loc: null, name: 'li', type: CLASS_SELECTOR }],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        type: NTH
      };
      const node = document.getElementById('li3');
      const evaluator = new Evaluator(window);
      evaluator.setup('li:nth-child(2n+1 of .li)', node);
      const res = evaluator._matchAnPlusB(leaf, node, leafName);
      assert.strictEqual(res, true, 'matches nth-child with of selector');
    });

    it('should branch on anb.selector caching for nth-last-child of sel', () => {
      const leafName = 'nth-last-child';
      // :nth-last-child(2n+1 of .li)
      const leaf = {
        nth: { a: '2', b: '1', type: AN_PLUS_B },
        selector: {
          children: [
            {
              children: [{ loc: null, name: 'li', type: CLASS_SELECTOR }],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        type: NTH
      };
      const node = document.getElementById('li3');
      const evaluator = new Evaluator(window);
      evaluator.setup('li:nth-last-child(2n+1 of .li)', node);
      const res = evaluator._matchAnPlusB(leaf, node, leafName);
      assert.strictEqual(res, true, 'matches nth-last-child with of selector');
    });

    it('should not cache selector when nthName is nth-of-type even', () => {
      const leafName = 'nth-of-type';
      const leaf = {
        nth: { a: '2', b: '1', type: AN_PLUS_B },
        selector: {
          children: [
            {
              children: [{ loc: null, name: 'li', type: CLASS_SELECTOR }],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        type: NTH
      };
      const node = document.getElementById('li1');
      const evaluator = new Evaluator(window);
      evaluator.setup('li:nth-of-type(2n+1)', node);
      const res = evaluator._matchAnPlusB(leaf, node, leafName);
      assert.strictEqual(
        res,
        true,
        'processes nth-of-type smoothly by bypassing selector cache'
      );
    });

    it('should test empty array return', () => {
      const leafName = 'nth-child';
      // :nth-child(1n of .match-me)
      const leaf = {
        nth: { a: '1', b: '1', type: AN_PLUS_B },
        selector: {
          children: [
            {
              children: [{ loc: null, name: 'match-me', type: CLASS_SELECTOR }],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        type: NTH
      };
      const isolatedNode = document.createElement('div');
      const evaluator = new Evaluator(window);
      evaluator.setup(':nth-child(1n of .match-me)', isolatedNode);
      const res = evaluator._matchAnPlusB(leaf, isolatedNode, leafName);
      assert.strictEqual(
        res,
        false,
        'returns false because siblings array is empty'
      );
    });

    it('should cover all 4 logical branches of typeKey', () => {
      const leafName = 'nth-of-type';
      const leaf = {
        nth: { a: '1', b: '1', type: AN_PLUS_B },
        selector: null,
        type: NTH
      };
      const evaluator = new Evaluator(window);
      const xmlDoc = new window.DOMParser().parseFromString(
        '<root xmlns:svg="http://www.w3.org/2000/svg"><svg:svg/></root>',
        'text/xml'
      );
      const svgChild = xmlDoc.documentElement.firstChild;
      evaluator.setup('svg|svg:nth-of-type(1)', svgChild);
      assert.strictEqual(
        evaluator._matchAnPlusB(leaf, svgChild, leafName),
        true,
        'Branch 1 passed'
      );
      const svgParent = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      );
      const svgNoPrefixChild = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'rect'
      );
      svgParent.appendChild(svgNoPrefixChild);
      document.getElementById('div0').appendChild(svgParent);
      evaluator.setup('rect:nth-of-type(1)', svgNoPrefixChild);
      assert.strictEqual(
        evaluator._matchAnPlusB(leaf, svgNoPrefixChild, leafName),
        true,
        'Branch 2 passed'
      );
      const mockParent = document.createElement('div');
      const mockChild = document.createElement('p');
      mockParent.appendChild(mockChild);
      document.getElementById('div0').appendChild(mockParent);
      Object.defineProperty(mockChild, 'namespaceURI', {
        value: null,
        configurable: true
      });
      Object.defineProperty(mockChild, 'prefix', {
        value: 'foo',
        configurable: true
      });
      evaluator.setup('p:nth-of-type(1)', mockChild);
      assert.strictEqual(
        evaluator._matchAnPlusB(leaf, mockChild, leafName),
        true,
        'Branch 3 passed'
      );
      const htmlParent = document.createElement('div');
      const htmlChild = document.createElement('p');
      htmlParent.appendChild(htmlChild);
      document.getElementById('div0').appendChild(htmlParent);
      evaluator.setup('p:nth-of-type(1)', htmlChild);
      assert.strictEqual(
        evaluator._matchAnPlusB(leaf, htmlChild, leafName),
        true,
        'Branch 4 passed'
      );
    });

    it('should test true and false routes when parentNode is null', () => {
      const leafName = 'nth-of-type';
      const leaf = {
        nth: { a: '1', b: '1', type: AN_PLUS_B },
        selector: null,
        type: NTH
      };
      const evaluator = new Evaluator(window);
      const isolatedRoot = document.createElement('div');
      evaluator.setup('div:nth-of-type(1n)', isolatedRoot);
      const resTrue = evaluator._matchAnPlusB(leaf, isolatedRoot, leafName);
      assert.strictEqual(
        resTrue,
        true,
        'returns [node] and passes because node is this.#root'
      );
      const notRoot = document.createElement('p');
      const resFalse = evaluator._matchAnPlusB(leaf, notRoot, leafName);
      assert.strictEqual(
        resFalse,
        false,
        'returns [] and fails because node is not this.#root'
      );
    });

    it('should test true and false branches when parentNode is null', () => {
      const leafName = 'nth-child';
      const leaf = {
        nth: { a: '1', b: '1', type: AN_PLUS_B },
        selector: null,
        type: NTH
      };
      const evaluator = new Evaluator(window);
      const isolatedRoot = document.createElement('div');
      evaluator.setup('div:nth-child(1n)', isolatedRoot);
      const resTrue = evaluator._matchAnPlusB(leaf, isolatedRoot, leafName);
      assert.strictEqual(
        resTrue,
        true,
        'returns [node] and passes because node is this.#root'
      );
      const notRoot = document.createElement('span');
      const resFalse = evaluator._matchAnPlusB(leaf, notRoot, leafName);
      assert.strictEqual(
        resFalse,
        false,
        'returns [] and fails because node is not this.#root'
      );
    });
  });

  describe('build :has() allowlist', () => {
    it('should return null if findBestSeed returns no seed', () => {
      const leaves = [
        {
          flags: null,
          evaluator: null,
          name: {
            name: 'data-foo',
            type: IDENT
          },
          type: ATTR_SELECTOR,
          value: null
        }
      ];
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const res = evaluator._buildHasAllowlist(leaves);
      assert.strictEqual(
        res,
        null,
        'returns null when no valid seed is found in leaves'
      );
    });

    it('should return null if leaves contain only a universal selector', () => {
      const leaves = [
        {
          loc: null,
          name: '*',
          type: TYPE_SELECTOR
        }
      ];
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const res = evaluator._buildHasAllowlist(leaves);
      assert.strictEqual(
        res,
        null,
        'returns null when seed is a universal selector'
      );
    });

    it('should successfully build allowlist when seed is a valid ID', () => {
      const leaves = [
        {
          loc: null,
          name: 'unique-target-id',
          type: ID_SELECTOR
        }
      ];
      const node = document.createElement('div');
      node.id = 'unique-target-id';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const res = evaluator._buildHasAllowlist(leaves);
      assert.notStrictEqual(res, null, 'returns a filter object');
      assert.strictEqual(res.seeded, true, 'is seeded correctly');
      assert.strictEqual(
        res.set.has(node),
        true,
        'WeakSet contains the targeted element by ID'
      );
    });

    it('should return null if root lacks getElementById method', () => {
      const leaves = [
        {
          loc: null,
          name: 'some-id',
          type: ID_SELECTOR
        }
      ];
      const mockRoot = {
        nodeType: ELEMENT_NODE
      };
      const evaluator = new Evaluator(window);
      evaluator.setup('*', mockRoot);
      const res = evaluator._buildHasAllowlist(leaves);
      assert.strictEqual(
        res,
        null,
        'returns null when getElementById is missing on root'
      );
    });

    it('should return null if seedElements remains null', () => {
      const leaves = [
        {
          loc: null,
          name: 'non-existent-id',
          type: ID_SELECTOR
        }
      ];
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const res = evaluator._buildHasAllowlist(leaves);
      assert.strictEqual(
        res,
        null,
        'returns null when seedElements is falsy (ID not found)'
      );
    });

    it('should return null if root lacks the required DOM methods', () => {
      const leaves = [
        {
          loc: null,
          name: 'some-class',
          type: CLASS_SELECTOR
        }
      ];
      const mockRoot = {
        nodeType: ELEMENT_NODE
      };
      const evaluator = new Evaluator(window);
      evaluator.setup('*', mockRoot);
      const res = evaluator._buildHasAllowlist(leaves);
      assert.strictEqual(
        res,
        null,
        'returns null when root does not have DOM methods'
      );
    });

    it('should return null if the number of seed elements is 0', () => {
      const leaves = [
        {
          loc: null,
          name: 'non-existent-class',
          type: CLASS_SELECTOR
        }
      ];
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const res = evaluator._buildHasAllowlist(leaves);
      assert.strictEqual(res, null, 'returns null for 0 seed elements');
    });

    it('should return null if the number of seeds exceeds max length', () => {
      const leaves = [
        {
          loc: null,
          name: 'too-many-elements',
          type: CLASS_SELECTOR
        }
      ];
      const parent = document.getElementById('div0');
      const fragment = document.createDocumentFragment();
      for (let i = 0; i < 300; i++) {
        const node = document.createElement('div');
        node.classList.add('too-many-elements');
        fragment.appendChild(node);
      }
      parent.appendChild(fragment);
      const evaluator = new Evaluator(window);
      evaluator.setup('*', document);
      const res = evaluator._buildHasAllowlist(leaves);
      assert.strictEqual(
        res,
        null,
        'returns null when seed elements exceed threshold'
      );
      parent.innerHTML = '';
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
    it('should not match', () => {
      const node = document.getElementById('ul1');
      const leaves = [];
      const evaluator = new Evaluator(window);
      evaluator.setup(':has()', node);
      const res = evaluator._matchHasPseudoFunc(leaves, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const node = document.getElementById('dl1');
      const leaves = [
        {
          name: 'li',
          type: TYPE_SELECTOR
        }
      ];
      const evaluator = new Evaluator(window);
      evaluator.setup(':has(li)', node);
      const res = evaluator._matchHasPseudoFunc(leaves, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const node = document.getElementById('dl1');
      const leaves = [
        {
          name: 'dd',
          type: TYPE_SELECTOR
        }
      ];
      const evaluator = new Evaluator(window);
      evaluator.setup(':has(dd)', node);
      const res = evaluator._matchHasPseudoFunc(leaves, node, {});
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':has(dd p)', node);
      const res = evaluator._matchHasPseudoFunc(leaves, node, {});
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':has(dd span)', node);
      const res = evaluator._matchHasPseudoFunc(leaves, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match remaining leaves in Fast path 1 (ID)', () => {
      const parent = document.createElement('div');
      const child = document.createElement('div');
      child.id = 'fp1-id';
      const grandChild = document.createElement('span');
      child.appendChild(grandChild);
      parent.appendChild(child);
      document.getElementById('div0').appendChild(parent);

      const leaves = [
        {
          name: 'fp1-id',
          type: ID_SELECTOR
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':has(#fp1-id span)', parent);
      const res = evaluator._matchHasPseudoFunc(leaves, parent, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match remaining leaves in Fast path 2 (Class)', () => {
      const parent = document.createElement('div');
      const child = document.createElement('div');
      child.classList.add('fp2-class');
      const grandChild = document.createElement('span');
      child.appendChild(grandChild);
      parent.appendChild(child);
      document.getElementById('div0').appendChild(parent);

      const leaves = [
        {
          name: 'fp2-class',
          type: CLASS_SELECTOR
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':has(.fp2-class span)', parent);
      const res = evaluator._matchHasPseudoFunc(leaves, parent, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match remaining leaves in Fast path 3 (Type)', () => {
      const parent = document.createElement('div');
      const child = document.createElement('section');
      const grandChild = document.createElement('span');
      child.appendChild(grandChild);
      parent.appendChild(child);
      document.getElementById('div0').appendChild(parent);

      const leaves = [
        {
          name: 'section',
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':has(section span)', parent);
      const res = evaluator._matchHasPseudoFunc(leaves, parent, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match remaining leaves in Fallback (TreeWalker)', () => {
      const parent = document.createElement('div');
      const child = document.createElement('div');
      child.setAttribute('data-fp4', 'true');
      const grandChild = document.createElement('span');
      child.appendChild(grandChild);
      parent.appendChild(child);
      document.getElementById('div0').appendChild(parent);
      const leaves = [
        {
          name: {
            name: 'data-fp4',
            type: IDENT
          },
          type: ATTR_SELECTOR,
          value: null,
          flags: null,
          evaluator: null
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':has([data-fp4] span)', parent);
      const res = evaluator._matchHasPseudoFunc(leaves, parent, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should match compound selector and return true when isLast is true', () => {
      // 構成: div.parent > (div.fp-class.no-match, div.fp-class.match)
      const parent = document.createElement('div');
      const child1 = document.createElement('div');
      child1.className = 'fp-class no-match';
      const child2 = document.createElement('div');
      child2.className = 'fp-class match';
      parent.appendChild(child1);
      parent.appendChild(child2);
      document.getElementById('div0').appendChild(parent);

      // :has(.fp-class.match)
      const leaves = [
        {
          name: 'fp-class',
          type: CLASS_SELECTOR
        },
        {
          name: 'match',
          type: CLASS_SELECTOR
        }
      ];
      const evaluator = new Evaluator(window);
      evaluator.setup(':has(.fp-class.match)', parent);
      const res = evaluator._matchHasPseudoFunc(leaves, parent, {});
      assert.strictEqual(
        res,
        true,
        'matches second child and returns true via isLast'
      );
    });

    it('should match compound selector and proceed to _matchHasPseudoFunc when isLast is false', () => {
      // 構成: div.parent > (div.fp-class.no-match, div.fp-class.match > span)
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

      // :has(.fp-class.match span)
      const leaves = [
        {
          name: 'fp-class',
          type: CLASS_SELECTOR
        },
        {
          name: 'match',
          type: CLASS_SELECTOR
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':has(.fp-class.match span)', parent);
      const res = evaluator._matchHasPseudoFunc(leaves, parent, {});
      assert.strictEqual(
        res,
        true,
        'passes filter and correctly evaluates remaining leaves'
      );
    });

    it('should return false when filterLeaves do not match any candidate', () => {
      // 構成: div.parent > div.fp-class.no-match
      const parent = document.createElement('div');
      const child = document.createElement('div');
      child.className = 'fp-class no-match';
      parent.appendChild(child);
      document.getElementById('div0').appendChild(parent);

      // :has(.fp-class.match span)
      const leaves = [
        {
          name: 'fp-class',
          type: CLASS_SELECTOR
        },
        {
          name: 'match', // このクラスがないため filterLeaves で弾かれる
          type: CLASS_SELECTOR
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':has(.fp-class.match span)', parent);
      const res = evaluator._matchHasPseudoFunc(leaves, parent, {});
      assert.strictEqual(res, false, 'fails cleanly at filterLeaves check');
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
      // :has(section.match p)
      const leaves = [
        {
          name: 'section',
          type: TYPE_SELECTOR
        },
        {
          name: 'match',
          type: CLASS_SELECTOR
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':has(section.match p)', parent);
      const res = evaluator._matchHasPseudoFunc(leaves, parent, {});
      assert.strictEqual(
        res,
        true,
        'evaluates filterLeaves properly in TYPE_SELECTOR fast path'
      );
    });
  });

  describe('match logical pseudo-class function', () => {
    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':has(> li)', node);
      const res = evaluator._matchLogicalPseudoFunc(
        {
          astName: 'has',
          branches
        },
        node,
        {}
      );
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':has(> li.li)', node);
      const res = evaluator._matchLogicalPseudoFunc(
        {
          astName: 'has',
          branches
        },
        node,
        {}
      );
      assert.strictEqual(res, true, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':has(> li)', node);
      const res = evaluator._matchLogicalPseudoFunc(
        {
          astName: 'has',
          branches
        },
        node,
        {}
      );
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':has(li)', node);
      const res = evaluator._matchLogicalPseudoFunc(
        {
          astName: 'has',
          branches
        },
        node,
        {}
      );
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':has(dd > span)', node);
      const res = evaluator._matchLogicalPseudoFunc(
        {
          astName: 'has',
          branches
        },
        node,
        {}
      );
      assert.strictEqual(res, true, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':has(:has(li))', node);
      const res = evaluator._matchLogicalPseudoFunc(
        {
          astName: 'has',
          branches
        },
        node,
        {}
      );
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':not(ol, dl)', node);
      const res = evaluator._matchLogicalPseudoFunc(
        {
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
        },
        node,
        {}
      );
      assert.strictEqual(res, true, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':not(ul, dl)', node);
      const res = evaluator._matchLogicalPseudoFunc(
        {
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
        },
        node,
        {}
      );
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':not(:not(ol), ul)', node);
      const res = evaluator._matchLogicalPseudoFunc(
        {
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
        },
        node,
        {}
      );
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':not(:not(dl), ul)', node);
      const res = evaluator._matchLogicalPseudoFunc(
        {
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
        },
        node,
        {}
      );
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':is(ul, dl)', node);
      const res = evaluator._matchLogicalPseudoFunc(
        {
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
        },
        node,
        {}
      );
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':is(ul#ul1, dl#dl1)', node);
      const res = evaluator._matchLogicalPseudoFunc(
        {
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
        },
        node,
        {}
      );
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':is(ul li ~ li)', node);
      const res = evaluator._matchLogicalPseudoFunc(
        {
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
        },
        node,
        {}
      );
      assert.strictEqual(res, true, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':is(ol, dl)', node);
      const res = evaluator._matchLogicalPseudoFunc(
        {
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
        },
        node,
        {}
      );
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':where(ul, dl)', node);
      const res = evaluator._matchLogicalPseudoFunc(
        {
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
        },
        node,
        {}
      );
      assert.strictEqual(res, true, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':where(ol, dl)', node);
      const res = evaluator._matchLogicalPseudoFunc(
        {
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
        },
        node,
        {}
      );
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':not(:is(li, dd))', node);
      const res = evaluator._matchLogicalPseudoFunc(
        {
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
        },
        node,
        {}
      );
      assert.strictEqual(res, true, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':not(:host > span)', node);
      const res = evaluator._matchLogicalPseudoFunc(
        {
          astName: 'not',
          branches
        },
        node,
        {}
      );
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':not(div)', node);
      const res = evaluator._matchLogicalPseudoFunc(
        {
          astName: 'not',
          branches
        },
        node,
        {}
      );
      assert.strictEqual(res, false, 'result');
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
    it('should throw', () => {
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

    it('should throw', () => {
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

    it('should match', () => {
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

    it('should properly group leaves and combinators into branches', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':has(:is(:has(li, dd)))', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
    });

    it('should throw', () => {
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

    it('should throw', () => {
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

    it('should throw', () => {
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

    it('should throw', () => {
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

    it('should not match', () => {
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

    it('should throw', () => {
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

    it('should match', () => {
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

    it('should not match and hit the final break', () => {
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

    it('should throw', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should not match and hit the final break', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':state(checked)', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':state(checked)', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':state(checked)', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':current(foo)', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host(.foo)', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host-context(.foo)', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':contains(foo)', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':foobar(foo)', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {
        forgive: true
      });
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should not match', () => {
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

    it('should not match', () => {
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

    it('should match', () => {
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

    it('should not match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':local-link', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':local-link', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':visited', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':hover', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':hover', node);
      node.dispatchEvent(new window.MouseEvent('mouseover'));
      node.dispatchEvent(new window.MouseEvent('mouseout'));
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':hover', node);
      window.dispatchEvent(new window.MouseEvent('mouseover'));
      window.dispatchEvent(new window.MouseEvent('mousedown'));
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':active', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':target', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':target', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':scope', refPoint);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':scope', document);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should match', () => {
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

    it('should not match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-visible', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match when eventTarget equals lastFocusVisible', () => {
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

    it('should match when eventTarget equals relatedTarget', () => {
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

    it('should match if the relatedTarget is also focus-visible', () => {
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

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', parent);
      const res = evaluator.matchPseudoClassSelector(leaf, parent, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', parent);
      const res = evaluator.matchPseudoClassSelector(leaf, parent, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', parent);
      const res = evaluator.matchPseudoClassSelector(leaf, parent, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', parent);
      const res = evaluator.matchPseudoClassSelector(leaf, parent, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', parent);
      const res = evaluator.matchPseudoClassSelector(leaf, parent, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', parent);
      const res = evaluator.matchPseudoClassSelector(leaf, parent, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':focus-within', parent);
      const res = evaluator.matchPseudoClassSelector(leaf, parent, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should traverse from a shadow root to its host', () => {
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

    it('should match', () => {
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

    it('should not match', () => {
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

    it('should match', () => {
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

    it('should not match', () => {
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

    it('should match', () => {
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

    it('should not match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':disabled', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should not match', () => {
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

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':disabled', node1);
      const res = evaluator.matchPseudoClassSelector(leaf, node1, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':disabled', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should not match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':enabled', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':enabled', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':enabled', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should not match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should not match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-only', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-write', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-write', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-write', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-write', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':read-write', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should not match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':placeholder-shown', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':placeholder-shown', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':placeholder-shown', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':checked', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':indeterminate', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':indeterminate', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':indeterminate', node1);
      const res = evaluator.matchPseudoClassSelector(leaf, node1, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should match', () => {
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

    it('should not match', () => {
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

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should not match', () => {
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

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':default', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':valid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':valid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':valid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':valid', input);
      const res = evaluator.matchPseudoClassSelector(leaf, input, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':valid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':invalid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':invalid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':invalid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':invalid', input);
      const res = evaluator.matchPseudoClassSelector(leaf, input, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':invalid', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should not match :valid on non-form elements (hits the final break)', () => {
      const leaf = {
        children: null,
        name: 'valid',
        type: PS_CLASS_SELECTOR
      };
      // フォーム関連ではない一般的な要素
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);

      const evaluator = new Evaluator(window);
      evaluator.setup(':valid', node);

      // KEYS_FORM_PS_VALID にも fieldset にも該当せず break され、false が返る
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result is false for div');
    });

    it('should not match on non-form elements', () => {
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

    it('should match :valid on an empty fieldset (!refNode branch)', () => {
      const leaf = {
        children: null,
        name: 'valid',
        type: PS_CLASS_SELECTOR
      };
      // 子要素を持たない空の fieldset を作成
      const node = document.createElement('fieldset');
      const parent = document.getElementById('div0');
      parent.appendChild(node);

      const evaluator = new Evaluator(window);
      evaluator.setup(':valid', node);

      // walker.firstChild() が null となるため、!refNode の分岐に入り valid = true となる
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, true, 'result is true for empty fieldset');
    });

    it('should not match on an empty fieldset', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':in-range', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':in-range', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':in-range', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':in-range', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':in-range', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':in-range', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':in-range', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':out-of-range', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':out-of-range', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':out-of-range', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':required', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should not match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':optional', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should not match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':first-child', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':last-child', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':only-child', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should not match', () => {
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

    it('should match', () => {
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

    it('should not match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should not match', () => {
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

    it('should not match', () => {
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

    it('should not match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should not match', () => {
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

    it('should not match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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
    it('should not match', () => {
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

    it('should not match', () => {
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
    it('should not match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':popover-open', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      node.showPopover();
      const evaluator = new Evaluator(window);
      evaluator.setup(':popover-open', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':popover-open', node);
      const res = evaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
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
    it('should not match', () => {
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

    it('should warn', () => {
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
    it('should not match', () => {
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

    it('should warn', () => {
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

    it('should not match', () => {
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

    it('should warn', () => {
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
    it('should throw', () => {
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

    it('should not match', () => {
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

    it('should not match', () => {
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

    it('should warn', () => {
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

    it('should throw', () => {
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

    it('should not match', () => {
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

    it('should throw', () => {
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

    it('should not match', () => {
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

    it('should throw', () => {
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

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host(#baz) div', node);
      const res = evaluator.evaluateShadowHost(ast, node);
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host(#foobar) div', node);
      const res = evaluator.evaluateShadowHost(ast, node);
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host-context(#foobar) div', node);
      const res = evaluator.evaluateShadowHost(ast, node);
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host(:state(checked)) div', node);
      const res = evaluator.evaluateShadowHost(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host(:state(checked)) div', node);
      const res = evaluator.evaluateShadowHost(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
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

    it('should match logical pseudo-class and set opt.isShadowRoot', () => {
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
      evaluator.setup(':is(:host)', shadowRoot);
      evaluator._shadow = true;
      const opt = {};
      const res = evaluator._matchSelectorForShadowRoot(ast, shadowRoot, opt);
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

    it('should match :host pseudo-class', () => {
      const ast = {
        children: null,
        name: 'host',
        type: PS_CLASS_SELECTOR
      };
      const evaluator = new Evaluator(window);
      evaluator.setup(':host', shadowRoot);
      const res = evaluator._matchSelectorForShadowRoot(ast, shadowRoot, {});
      assert.strictEqual(res, true, 'matches :host');
    });

    it('should match :host-context pseudo-class', () => {
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
      evaluator.setup(':host-context(#div0)', shadowRoot);
      const res = evaluator._matchSelectorForShadowRoot(ast, shadowRoot, {});
      assert.strictEqual(res, true, 'matches :host-context');
    });

    it('should return false for unmatched :host pseudo-class', () => {
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
      evaluator.setup(':host(#nomatch)', shadowRoot);
      const res = evaluator._matchSelectorForShadowRoot(ast, shadowRoot, {});
      assert.strictEqual(res, false, 'does not match :host with invalid id');
    });

    it('should return false for unsupported or unrelated pseudo', () => {
      const ast = {
        children: null,
        name: 'hover',
        type: PS_CLASS_SELECTOR
      };
      const evaluator = new Evaluator(window);
      evaluator.setup(':hover', shadowRoot);
      const res = evaluator._matchSelectorForShadowRoot(ast, shadowRoot, {});
      assert.strictEqual(
        res,
        false,
        'returns false for non-shadow-root pseudo-classes'
      );
    });
  });

  describe('match selector', () => {
    it('should match', () => {
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

    it('should match', () => {
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

    it('should not match', () => {
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

    it('should match', () => {
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

    it('should not match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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

    it('should match', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':is(ul)', document);
      const res = evaluator.matchSelector(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should throw', () => {
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

    it('should not match', () => {
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

    it('should match', () => {
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

    it('should warn', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host(#baz) div', node);
      const res = evaluator.matchSelector(ast, node);
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
      const evaluator = new Evaluator(window);
      evaluator.setup(':host(#foobar) div', node);
      const res = evaluator.matchSelector(ast, node);
      assert.strictEqual(res, false, 'result');
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
      const evaluator = new Evaluator(window);
      evaluator.setup('li#li1.li', document);
      const res = evaluator.matchLeaves(leaves, node);
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
      const evaluator = new Evaluator(window);
      evaluator.setup('li#li1.foobar', document);
      const res = evaluator.matchLeaves(leaves, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should cache results for non-form elements', () => {
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

    it('should not cache results for form elements', () => {
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

    it('should not cache results for input elements', () => {
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

    it('should cache results for standard pseudo-classes', () => {
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

    it('should not cache results for KEYS_PS_UNCACHE pseudo-classes', () => {
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

    it('should not cache results for KEYS_PS_UNCACHE pseudo-classes', () => {
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

    it('should use results cache', () => {
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

    it('should re-evaluate leaves when caches are cleared', () => {
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
      const evaluator = new Evaluator(window);
      evaluator.setup('div #foobar', parent);
      const res = evaluator._findDescendantNodes(leaves, parent);
      assert.deepEqual([...res], [node], 'nodes');
    });

    it('should get matched node(s)', () => {
      const leaves = [
        {
          name: '\\*',
          type: TYPE_SELECTOR
        }
      ];
      const node = document.getElementById('ul1');
      const evaluator = new Evaluator(window);
      evaluator.setup('ul *', document);
      const res = evaluator._findDescendantNodes(leaves, node);
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

    it('should get matched node(s)', () => {
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
      const res = evaluator._findDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [node], 'nodes');
    });

    it('should not match', () => {
      const leaves = [
        {
          name: 'foobar',
          type: ID_SELECTOR
        }
      ];
      const refNode = document.getElementById('ul1');
      const evaluator = new Evaluator(window);
      evaluator.setup('ul #foobar', document);
      const res = evaluator._findDescendantNodes(leaves, refNode);
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
      const evaluator = new Evaluator(window);
      evaluator.setup('div #ul1', document);
      const res = evaluator._findDescendantNodes(leaves, refNode);
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
      const evaluator = new Evaluator(window);
      evaluator.setup('ul li#li3', document);
      const res = evaluator._findDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [node], 'nodes');
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
      const evaluator = new Evaluator(window);
      evaluator.setup('ul #li3.foobar', document);
      const res = evaluator._findDescendantNodes(leaves, refNode);
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
      const evaluator = new Evaluator(window);
      evaluator.setup('ul .li', document);
      const res = evaluator._findDescendantNodes(leaves, refNode);
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
      const evaluator = new Evaluator(window);
      evaluator.setup('ul .li:first-child', document);
      const res = evaluator._findDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [document.getElementById('li1')], 'nodes');
    });

    it('should not match', () => {
      const leaves = [
        {
          name: 'foobar',
          type: CLASS_SELECTOR
        }
      ];
      const refNode = document.getElementById('ul1');
      const evaluator = new Evaluator(window);
      evaluator.setup('ul .foobar', document);
      const res = evaluator._findDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should fallback if getElementsByClassName is missing', () => {
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
      const res = evaluator._findDescendantNodes(leaves, baseNode, {});
      assert.deepEqual([...res], [child, grandChild], 'nodes');
    });

    it('should get matched node(s)', () => {
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
      const res = evaluator._findDescendantNodes(leaves, root);
      assert.deepEqual([...res], [div1, div2, div3, div4], 'nodes');
    });

    it('should get matched node(s)', () => {
      const leaves = [
        {
          name: '*|li',
          type: TYPE_SELECTOR
        }
      ];
      const refNode = document.getElementById('ul1');
      const evaluator = new Evaluator(window);
      evaluator.setup('ul *|li', document);
      const res = evaluator._findDescendantNodes(leaves, refNode);
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

    it('should get matched node(s)', () => {
      const leaves = [
        {
          name: 'li',
          type: TYPE_SELECTOR
        }
      ];
      const refNode = document.getElementById('ul1');
      const evaluator = new Evaluator(window);
      evaluator.setup('ul li', document);
      const res = evaluator._findDescendantNodes(leaves, refNode);
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
      const evaluator = new Evaluator(window);
      evaluator.setup('ul li:first-child', document);
      const res = evaluator._findDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [document.getElementById('li1')], 'nodes');
    });

    it('should not match', () => {
      const leaves = [
        {
          name: 'ol',
          type: TYPE_SELECTOR
        }
      ];
      const refNode = document.getElementById('div1');
      const evaluator = new Evaluator(window);
      evaluator.setup('div ol', document);
      const res = evaluator._findDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should not match', () => {
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
      const res = evaluator._findDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [], 'nodes');
    });

    it('should get matched node(s)', () => {
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
      const res = evaluator._findDescendantNodes(leaves, refNode);
      assert.deepEqual([...res], [span1, span3], 'nodes');
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
      const evaluator = new Evaluator(window);
      evaluator.setup('ul :first-child', document);
      const res = evaluator._findDescendantNodes(leaves, refNode);
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
