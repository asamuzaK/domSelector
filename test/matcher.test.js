/**
 * matcher.test.js
 */

/* api */
import { strict as assert } from 'node:assert';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, it } from 'mocha';

/* test */
import * as matcher from '../src/js/matcher.js';
import {
  ATTR_SELECTOR,
  IDENT,
  NOT_SUPPORTED_ERR,
  PS_ELEMENT_SELECTOR,
  SYNTAX_ERR,
  TYPE_SELECTOR
} from '../src/js/constant.js';
const STRING = 'String';

describe('matcher', () => {
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
    </html>
  `;
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

  describe('match pseudo-element selector', () => {
    const func = matcher.matchPseudoElementSelector;

    it('should throw', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      assert.throws(
        () => func('foo'),
        TypeError,
        'Unexpected ast type Undefined'
      );
    });

    it('should not match', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const res = func('after', PS_ELEMENT_SELECTOR);
      assert.strictEqual(res, undefined, 'result');
    });

    it('should throw', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      assert.throws(
        () => func('after', PS_ELEMENT_SELECTOR, { warn: true }),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, NOT_SUPPORTED_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Unsupported pseudo-element ::after',
            'message'
          );
          return true;
        }
      );
    });

    it('should not match', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const res = func('part', PS_ELEMENT_SELECTOR);
      assert.strictEqual(res, undefined, 'result');
    });

    it('should throw', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      assert.throws(
        () => func('part', PS_ELEMENT_SELECTOR, { warn: true }),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, NOT_SUPPORTED_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Unsupported pseudo-element ::part()',
            'message'
          );
          return true;
        }
      );
    });

    it('should not match', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const res = func('slotted', PS_ELEMENT_SELECTOR);
      assert.strictEqual(res, undefined, 'result');
    });

    it('should throw', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      assert.throws(
        () => func('slotted', PS_ELEMENT_SELECTOR, { warn: true }),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, NOT_SUPPORTED_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Unsupported pseudo-element ::slotted()',
            'message'
          );
          return true;
        }
      );
    });

    it('should throw', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      assert.throws(
        () => func('foo', PS_ELEMENT_SELECTOR),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
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
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const res = func('foo', PS_ELEMENT_SELECTOR, {
        forgive: true
      });
      assert.strictEqual(res, undefined, 'result');
    });

    it('should not match', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const res = func('-webkit-foo', PS_ELEMENT_SELECTOR);
      assert.strictEqual(res, undefined, 'result');
    });

    it('should throw', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      assert.throws(
        () => func('-webkit-foo', PS_ELEMENT_SELECTOR, { warn: true }),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, NOT_SUPPORTED_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Unsupported pseudo-element ::-webkit-foo',
            'message'
          );
          return true;
        }
      );
    });

    it('should throw', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      assert.throws(
        () => func('webkit-foo', PS_ELEMENT_SELECTOR),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Unknown pseudo-element ::webkit-foo',
            'message'
          );
          return true;
        }
      );
    });

    it('should not match', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const res = func('webkit-foo', PS_ELEMENT_SELECTOR, {
        forgive: true
      });
      assert.strictEqual(res, undefined, 'result');
    });

    it('should throw', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      assert.throws(
        () => func('-webkitfoo', PS_ELEMENT_SELECTOR),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Unknown pseudo-element ::-webkitfoo',
            'message'
          );
          return true;
        }
      );
    });

    it('should not match', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const res = func('-webkitfoo', PS_ELEMENT_SELECTOR, {
        forgive: true
      });
      assert.strictEqual(res, undefined, 'result');
    });
  });

  describe('match directionality pseudo-class', () => {
    const func = matcher.matchDirectionPseudoClass;

    it('should throw', () => {
      const ast = {};
      const node = document.createElement('bdo');
      assert.throws(
        () => func(ast, node),
        TypeError,
        'Unexpected ast type Undefined'
      );
    });

    it('should throw', () => {
      const ast = {
        name: '',
        type: IDENT
      };
      const node = document.createElement('bdo');
      assert.throws(
        () => func(ast, node),
        TypeError,
        'Unexpected ast type (empty String)'
      );
    });

    it('should match', () => {
      const ast = {
        name: 'ltr',
        type: IDENT
      };
      const node = document.createElement('bdo');
      node.setAttribute('dir', 'ltr');
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'ltr',
        type: IDENT
      };
      const node = document.createElement('div');
      node.setAttribute('dir', 'ltr');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'rtl',
        type: IDENT
      };
      const node = document.createElement('div');
      node.setAttribute('dir', 'rtl');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'ltr',
        type: IDENT
      };
      const root = document.documentElement;
      const res = func(ast, root);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'ltr',
        type: IDENT
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'tel');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'ltr',
        type: IDENT
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'tel');
      node.setAttribute('dir', 'foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'ltr',
        type: IDENT
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'tel');
      node.setAttribute('dir', 'auto');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'ltr',
        type: IDENT
      };
      const node = document.createElement('textarea');
      node.setAttribute('dir', 'auto');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'ltr',
        type: IDENT
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.setAttribute('dir', 'auto');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'ltr',
        type: IDENT
      };
      const node = document.createElement('div');
      node.setAttribute('dir', 'auto');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'ltr',
        type: IDENT
      };
      const node = document.createElement('bdi');
      node.textContent = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'rtl',
        type: IDENT
      };
      const node = document.createElement('bdi');
      node.textContent = '\u05EA';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'ltr',
        type: IDENT
      };
      const node = document.createElement('bdi');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'ltr',
        type: IDENT
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
      }
      window.customElements.define('my-element', MyElement);
      const shadow = document.getElementById('baz');
      const node = shadow.shadowRoot.getElementById('foo');
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'ltr',
        type: IDENT
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'rtl',
        type: IDENT
      };
      const root = document.documentElement;
      root.setAttribute('dir', 'rtl');
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'ltr',
        type: IDENT
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      parent.setAttribute('dir', 'ltr');
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });
  });

  describe('match language pseudo-class', () => {
    const func = matcher.matchLanguagePseudoClass;

    it('should not match', () => {
      const ast = {
        name: '',
        type: IDENT
      };
      const node = document.createElement('div');
      node.setAttribute('lang', '');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
      const res2 = func(ast, node);
      assert.strictEqual(res2, false, 'result');
    });

    it('should not match', () => {
      const ast = {
        type: STRING,
        value: ''
      };
      const node = document.createElement('div');
      node.setAttribute('lang', '');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
      const res2 = func(ast, node);
      assert.strictEqual(res2, false, 'result');
    });

    it('should not match when langPattern is not a string (e.g. null)', () => {
      const ast = {
        type: STRING,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'en');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
      assert.strictEqual(ast._langRegex, null, 'cached regex should be null');
      const res2 = func(ast, node);
      assert.strictEqual(res2, false, 'result (cached)');
    });

    it('should match', () => {
      const ast = {
        name: '*',
        type: IDENT
      };
      const node = document.createElement('div');
      node.lang = 'en';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
      const res2 = func(ast, node);
      assert.strictEqual(res2, true, 'result');
    });

    it('should match', () => {
      const ast = {
        type: STRING,
        value: '*'
      };
      const node = document.createElement('div');
      node.lang = 'en';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
      const res2 = func(ast, node);
      assert.strictEqual(res2, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: '*',
        type: IDENT
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'en');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: '*',
        type: IDENT
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: '\\*',
        type: IDENT
      };
      const node = document.createElement('div');
      node.lang = 'en';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: '\\*-FR',
        type: IDENT
      };
      const node = document.createElement('div');
      node.lang = 'fr-FR';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: '*',
        type: IDENT
      };
      const node = document.createElement('div');
      node.setAttribute('lang', '');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: '*',
        type: IDENT
      };
      const frag = document.createDocumentFragment();
      const node = document.createElement('div');
      frag.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'en',
        type: IDENT
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'en');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
      const res2 = func(ast, node);
      assert.strictEqual(res2, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'en',
        type: IDENT
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'en-US');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'en',
        type: IDENT
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: 'en',
        type: IDENT
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'de');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: 'en',
        type: IDENT
      };
      const frag = document.createDocumentFragment();
      const node = document.createElement('div');
      frag.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'de-DE',
        type: IDENT
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'de-Latn-DE-1996');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'de-Latn-DE',
        type: IDENT
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'de-Latn-DE-1996');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'de-de',
        type: IDENT
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'de-DE');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: 'de-de',
        type: IDENT
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'de-Deva');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: '日本語',
        type: IDENT
      };
      const node = document.createElement('div');
      node.setAttribute('lang', '日本語');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const ast = {
        type: STRING,
        value: '日本語'
      };
      const node = document.createElement('div');
      node.setAttribute('lang', '日本語');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('match language pseudo-class - xml', () => {
    const xmlDom = `
      <foo id="foo" xml:lang="en">
        <bar id="bar">
          <baz id="baz"/>
        </bar>
      </foo>
    `;
    const func = matcher.matchLanguagePseudoClass;

    it('should not match', () => {
      const ast = {
        name: '',
        type: IDENT
      };
      const doc = new window.DOMParser().parseFromString(xmlDom, 'text/xml');
      const node = doc.createElement('div');
      node.setAttribute('xml:lang', '');
      const parent = doc.getElementById('baz');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const ast = {
        type: STRING,
        value: ''
      };
      const doc = new window.DOMParser().parseFromString(xmlDom, 'text/xml');
      const node = doc.createElement('div');
      node.setAttribute('xml:lang', '');
      const parent = doc.getElementById('baz');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        name: '*',
        type: IDENT
      };
      const doc = new window.DOMParser().parseFromString(xmlDom, 'text/xml');
      const node = doc.createElement('div');
      node.setAttribute('xml:lang', 'en');
      const parent = doc.getElementById('baz');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: '*',
        type: IDENT
      };
      const doc = new window.DOMParser().parseFromString(xmlDom, 'text/xml');
      const node = doc.createElement('div');
      const parent = doc.getElementById('baz');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: '*',
        type: IDENT
      };
      const doc = new window.DOMParser().parseFromString(xmlDom, 'text/xml');
      const node = doc.createElement('div');
      node.setAttribute('xml:lang', '');
      const parent = doc.getElementById('baz');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: '*',
        type: IDENT
      };
      const doc = new window.DOMParser().parseFromString(xmlDom, 'text/xml');
      const frag = doc.createDocumentFragment();
      const node = doc.createElement('div');
      frag.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: 'en',
        type: IDENT
      };
      const doc = new window.DOMParser().parseFromString(xmlDom, 'text/xml');
      const node = doc.createElement('div');
      node.setAttribute('xml:lang', '');
      const parent = doc.getElementById('baz');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'en',
        type: IDENT
      };
      const doc = new window.DOMParser().parseFromString(xmlDom, 'text/xml');
      const node = doc.createElement('div');
      node.setAttribute('xml:lang', 'en');
      const parent = doc.getElementById('baz');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'en',
        type: IDENT
      };
      const doc = new window.DOMParser().parseFromString(xmlDom, 'text/xml');
      const node = doc.createElement('div');
      node.setAttribute('xml:lang', 'en-US');
      const parent = doc.getElementById('baz');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'en',
        type: IDENT
      };
      const doc = new window.DOMParser().parseFromString(xmlDom, 'text/xml');
      const node = doc.createElement('div');
      const parent = doc.getElementById('baz');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: 'en',
        type: IDENT
      };
      const doc = new window.DOMParser().parseFromString(xmlDom, 'text/xml');
      const node = doc.createElement('div');
      const parent = doc.getElementById('baz');
      parent.setAttribute('xml:lang', '');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: 'en',
        type: IDENT
      };
      const doc = new window.DOMParser().parseFromString(xmlDom, 'text/xml');
      const node = doc.createElement('div');
      node.setAttribute('xml:lang', 'de');
      const parent = doc.getElementById('baz');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: 'en',
        type: IDENT
      };
      const doc = new window.DOMParser().parseFromString(xmlDom, 'text/xml');
      const frag = doc.createDocumentFragment();
      const node = doc.createElement('div');
      frag.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'de-DE',
        type: IDENT
      };
      const doc = new window.DOMParser().parseFromString(xmlDom, 'text/xml');
      const node = doc.createElement('div');
      node.setAttribute('xml:lang', 'de-Latn-DE-1996');
      const parent = doc.getElementById('baz');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'de-Latn-DE',
        type: IDENT
      };
      const doc = new window.DOMParser().parseFromString(xmlDom, 'text/xml');
      const node = doc.createElement('div');
      node.setAttribute('xml:lang', 'de-Latn-DE-1996');
      const parent = doc.getElementById('baz');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'de-de',
        type: IDENT
      };
      const doc = new window.DOMParser().parseFromString(xmlDom, 'text/xml');
      const node = doc.createElement('div');
      node.setAttribute('xml:lang', 'de-DE');
      const parent = doc.getElementById('baz');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: 'de-de',
        type: IDENT
      };
      const doc = new window.DOMParser().parseFromString(xmlDom, 'text/xml');
      const node = doc.createElement('div');
      node.setAttribute('xml:lang', 'de-Deva');
      const parent = doc.getElementById('baz');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: '日本語',
        type: IDENT
      };
      const doc = new window.DOMParser().parseFromString(xmlDom, 'text/xml');
      const node = doc.createElement('div');
      node.setAttribute('xml:lang', '日本語');
      const parent = doc.getElementById('baz');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const ast = {
        type: STRING,
        value: '日本語'
      };
      const doc = new window.DOMParser().parseFromString(xmlDom, 'text/xml');
      const node = doc.createElement('div');
      node.setAttribute('xml:lang', '日本語');
      const parent = doc.getElementById('baz');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('match checked pseudo-class', () => {
    const func = matcher.matchCheckedPseudoClass;

    it('should get true for selected option', () => {
      const node = document.createElement('option');
      node.selected = true;
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false for unselected option', () => {
      const node = document.createElement('option');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true for checked checkbox input', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'checkbox');
      node.checked = true;
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false for unchecked checkbox input', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'checkbox');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true for checked radio input', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'radio');
      node.checked = true;
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false for unchecked radio input', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'radio');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false for checked text input', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.checked = true;
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false for div element', () => {
      const node = document.createElement('div');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('match link pseudo-class', () => {
    const func = matcher.matchLinkPseudoClass;

    it('should get true for a element with href', () => {
      const node = document.createElement('a');
      node.setAttribute('href', 'https://example.com');
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false for a element without href', () => {
      const node = document.createElement('a');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true for area element with href', () => {
      const node = document.createElement('area');
      node.setAttribute('href', '#foo');
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false for area element without href', () => {
      const node = document.createElement('area');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false for div element with href', () => {
      const node = document.createElement('div');
      node.setAttribute('href', 'https://example.com');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('match open pseudo-class', () => {
    const func = matcher.matchOpenPseudoClass;

    it('should get true for details element with open attribute', () => {
      const node = document.createElement('details');
      node.setAttribute('open', '');
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false for details element without open attribute', () => {
      const node = document.createElement('details');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true for dialog element with open attribute', () => {
      const node = document.createElement('dialog');
      node.setAttribute('open', '');
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false for dialog element without open attribute', () => {
      const node = document.createElement('dialog');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false for div element with open attribute', () => {
      const node = document.createElement('div');
      node.setAttribute('open', '');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('match placeholder-shown pseudo-class', () => {
    const func = matcher.matchPlaceholderShownPseudoClass;
    const keys = new Set(['text', 'number']);

    it('should get true for textarea with placeholder and empty value', () => {
      const node = document.createElement('textarea');
      node.setAttribute('placeholder', 'foo');
      node.value = '';
      const res = func(node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false for textarea with placeholder and non-empty value', () => {
      const node = document.createElement('textarea');
      node.setAttribute('placeholder', 'foo');
      node.value = 'bar';
      const res = func(node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false for textarea with multiline placeholder', () => {
      const node = document.createElement('textarea');
      node.setAttribute('placeholder', 'foo\nbar');
      node.value = '';
      const res = func(node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false for textarea without placeholder', () => {
      const node = document.createElement('textarea');
      node.value = '';
      const res = func(node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true for input without type attribute (defaults to text)', () => {
      const node = document.createElement('input');
      node.setAttribute('placeholder', 'foo');
      node.value = '';
      const res = func(node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true for input with allowed type, placeholder and empty value', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.setAttribute('placeholder', 'foo');
      node.value = '';
      const res = func(node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false for input with allowed type, placeholder and non-empty value', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.setAttribute('placeholder', 'foo');
      node.value = 'bar';
      const res = func(node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false for input with disallowed type, even with placeholder and empty value', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'button');
      node.setAttribute('placeholder', 'foo');
      node.value = '';
      const res = func(node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false for div element with placeholder attribute', () => {
      const node = document.createElement('div');
      node.setAttribute('placeholder', 'foo');
      const res = func(node, keys);
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('match in-range / out-of-range pseudo-class', () => {
    const func = matcher.matchRangePseudoClass;
    const keys = new Set(['number', 'range', 'date']);

    it('should get true for out-of-range (underflow)', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('min', '5');
      node.value = '1';
      const res = func('out-of-range', node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true for out-of-range (overflow)', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('max', '5');
      node.value = '10';
      const res = func('out-of-range', node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false for out-of-range when within range', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '5';
      const res = func('out-of-range', node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true for in-range when within range', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '5';
      const res = func('in-range', node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false for in-range (underflow)', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('min', '5');
      node.value = '1';
      const res = func('in-range', node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true for in-range when type is range even without min/max', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'range');
      node.value = '50';
      const res = func('in-range', node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false for in-range when type is number without min/max', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.value = '50';
      const res = func('in-range', node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false when input is readonly', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '5';
      node.readOnly = true;
      const res = func('in-range', node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false when input is disabled', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '5';
      node.disabled = true;
      const res = func('in-range', node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false when type is not in keys', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '5';
      const res = func('in-range', node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false for non-input element', () => {
      const node = document.createElement('div');
      const res = func('in-range', node, keys);
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('match read-only / read-write pseudo-class', () => {
    const func = matcher.matchReadOnlyPseudoClass;

    it('should get true', () => {
      const node = document.createElement('div');
      const res = func('read-only', node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('div');
      const res = func('read-write', node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('textarea');
      const res = func('read-only', node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const node = document.createElement('textarea');
      const res = func('read-write', node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const node = document.createElement('textarea');
      node.readOnly = true;
      const res = func('read-only', node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('textarea');
      node.readOnly = true;
      const res = func('read-write', node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const node = document.createElement('textarea');
      node.setAttribute('readonly', 'readonly');
      const res = func('read-only', node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('textarea');
      node.setAttribute('readonly', 'readonly');
      const res = func('read-write', node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('input');
      const res = func('read-only', node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const node = document.createElement('input');
      const res = func('read-write', node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const node = document.createElement('input');
      node.readOnly = true;
      const res = func('read-only', node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('input');
      node.readOnly = true;
      const res = func('read-write', node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const node = document.createElement('input');
      node.setAttribute('readonly', 'readonly');
      const res = func('read-only', node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('input');
      node.setAttribute('readonly', 'readonly');
      const res = func('read-write', node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const node = document.createElement('input');
      node.type = 'button';
      const res = func('read-only', node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('input');
      node.type = 'button';
      const res = func('read-write', node);
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('match required / optional pseudo-class', () => {
    const func = matcher.matchRequiredPseudoClass;
    const keys = new Set(['text', 'checkbox', 'radio', 'file']);

    it('should get true for required select', () => {
      const node = document.createElement('select');
      node.required = true;
      const res = func('required', node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false for optional select when it is required', () => {
      const node = document.createElement('select');
      node.required = true;
      const res = func('optional', node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false for required select without required attribute', () => {
      const node = document.createElement('select');
      const res = func('required', node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true for optional select without required attribute', () => {
      const node = document.createElement('select');
      const res = func('optional', node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true for required textarea', () => {
      const node = document.createElement('textarea');
      node.setAttribute('required', '');
      const res = func('required', node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true for required input with allowed type', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.required = true;
      const res = func('required', node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false for required input with allowed type but no required attribute', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      const res = func('required', node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true for optional input with allowed type and no required attribute', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      const res = func('optional', node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false for required input with disallowed type', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'button');
      node.required = true;
      const res = func('required', node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true for optional input with disallowed type even if it has required attribute', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'button');
      node.required = true;
      const res = func('optional', node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true for required input without type attribute (defaults to text)', () => {
      const node = document.createElement('input');
      node.required = true;
      const res = func('required', node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false for required div element', () => {
      const node = document.createElement('div');
      node.setAttribute('required', '');
      const res = func('required', node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false for optional div element', () => {
      const node = document.createElement('div');
      const res = func('optional', node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true for input without type attribute but with required property', () => {
      const node = document.createElement('input');
      node.required = true;
      const res = func('required', node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true for input without type attribute but with required attribute', () => {
      const node = document.createElement('input');
      node.setAttribute('required', 'required');
      const res = func('required', node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false for input without type attribute and without required state', () => {
      const node = document.createElement('input');
      const res = func('required', node, keys);
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('match attribute selector', () => {
    const func = matcher.matchAttributeSelector;

    it('should throw', () => {
      const ast = {
        flags: 'baz',
        matcher: '=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          name: 'bar',
          type: IDENT
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      assert.throws(
        () => func(ast, node),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector [foo=bar baz]',
            'message'
          );
          return true;
        }
      );
    });

    it('should match', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: '|foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: 's',
        matcher: null,
        name: {
          name: '|foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: 'i',
        matcher: null,
        name: {
          name: '|Foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: '|foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: '*|foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: 's',
        matcher: null,
        name: {
          name: '*|foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'Qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: '*|foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: 's',
        matcher: null,
        name: {
          name: '*|foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should throw', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: 'baz|foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      document.documentElement.setAttribute(
        'xmlns:baz',
        'https://example.com/baz'
      );
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      assert.throws(
        () => func(ast, node),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector [baz|foo]',
            'message'
          );
          return true;
        }
      );
    });

    it('should match', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: 'baz|foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      document.documentElement.setAttribute(
        'xmlns:baz',
        'https://example.com/baz'
      );
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node, {
        check: true
      });
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: 'baz|foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      document.documentElement.setAttribute(
        'xmlns:baz',
        'https://example.com/baz'
      );
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node, {
        forgive: true
      });
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: 'baz|foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'Baz:foo', 'qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node, {
        check: true
      });
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: 's',
        matcher: null,
        name: {
          name: 'Baz|Foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      document.documentElement.setAttribute(
        'xmlns:Baz',
        'https://example.com/baz'
      );
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'Baz:Foo', 'Qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node, {
        check: true
      });
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: 's',
        matcher: null,
        name: {
          name: 'Baz|Foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:Foo', 'Qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node, {
        check: true
      });
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: 'i',
        matcher: null,
        name: {
          name: 'Baz|Foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      document.documentElement.setAttribute(
        'xmlns:baz',
        'https://example.com/baz'
      );
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'Qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node, {
        check: true
      });
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: 'i',
        matcher: null,
        name: {
          name: 'Baz|Foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      document.documentElement.setAttribute(
        'xmlns:baz',
        'https://example.com/baz'
      );
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'Qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node, {
        check: true
      });
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: 'i',
        matcher: null,
        name: {
          name: 'baz|foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      document.documentElement.setAttribute(
        'xmlns:Baz',
        'https://example.com/baz'
      );
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'Baz:Foo', 'Qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node, {
        check: true
      });
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: 'baz|foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node, {
        check: true
      });
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: 's',
        matcher: null,
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'Qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: 's',
        matcher: null,
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:bar', 'qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('baz', 'bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: null,
        matcher: '=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          name: 'bar',
          type: IDENT
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: 's',
        matcher: '=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          name: 'Bar',
          type: IDENT
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: 's',
        matcher: '=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          name: 'bar',
          type: IDENT
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: '=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          name: 'bar',
          type: IDENT
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: null,
        matcher: '=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: 's',
        matcher: '=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'Bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: 's',
        matcher: '=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: null,
        matcher: '=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar baz'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: null,
        matcher: '=',
        name: {
          name: 'baz|foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'qux'
        }
      };
      document.documentElement.setAttribute(
        'xmlns:baz',
        'https://example.com/baz'
      );
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node, {
        check: true
      });
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: '=',
        name: {
          name: 'xml|lang',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'en'
        }
      };
      const node = document.createElement('div');
      node.setAttributeNS(
        'http://www.w3.org/XML/1998/namespace',
        'xml:lang',
        'en'
      );
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node, {
        check: true
      });
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: '=',
        name: {
          name: 'xml:lang',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'en'
        }
      };
      const node = document.createElement('div');
      node.setAttributeNS(
        'http://www.w3.org/XML/1998/namespace',
        'xml:lang',
        'en'
      );
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node, {
        check: true
      });
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: null,
        matcher: '~=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: 's',
        matcher: '~=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'Bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: 's',
        matcher: '~=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: null,
        matcher: '~=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: '~=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: '~=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: ''
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: null,
        matcher: '|=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: 's',
        matcher: '|=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'Bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: 's',
        matcher: '|=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: null,
        matcher: '|=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar-baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: 's',
        matcher: '|=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'Bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar-baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: 's',
        matcher: '|=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar-baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: '|=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz-bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: '|=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: ''
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz-bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: null,
        matcher: '^=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: null,
        matcher: '^=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'barbaz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: null,
        matcher: '^=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: '^=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: 's',
        matcher: '^=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'Bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: 's',
        matcher: '^=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: 's',
        matcher: '^=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: ''
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: null,
        matcher: '$=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: null,
        matcher: '$=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bazbar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: null,
        matcher: '$=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: '$=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: 's',
        matcher: '$=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'Bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz Bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: 's',
        matcher: '$=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz Bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: 's',
        matcher: '$=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: ''
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz Bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: null,
        matcher: '*=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: null,
        matcher: '*=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bazbarqux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: null,
        matcher: '*=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz bar qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: '*=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz qux quux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: 's',
        matcher: '*=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'Bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz Bar qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: 's',
        matcher: '*=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz Bar qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: 's',
        matcher: '*=',
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: ''
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz Bar qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match(s)', () => {
      const ast = {
        flags: 'i',
        matcher: '=',
        name: {
          name: 'baz',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'qux'
        }
      };
      const domStr = '<foo></foo>';
      const doc = new window.DOMParser().parseFromString(domStr, 'text/xml');
      const node = doc.createElement('bar');
      node.setAttribute('baz', 'QUX');
      doc.documentElement.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: 's',
        matcher: '=',
        name: {
          name: 'baz',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'qux'
        }
      };
      const domStr = '<foo></foo>';
      const doc = new window.DOMParser().parseFromString(domStr, 'text/xml');
      const node = doc.createElement('bar');
      node.setAttribute('baz', 'QUX');
      doc.documentElement.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: '=',
        name: {
          name: 'baz',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'qux'
        }
      };
      const domStr = '<foo></foo>';
      const doc = new window.DOMParser().parseFromString(domStr, 'text/xml');
      const node = doc.createElement('bar');
      node.setAttribute('baz', 'QUX');
      doc.documentElement.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        flags: null,
        loc: null,
        matcher: null,
        name: {
          loc: null,
          name: '\\:src',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      const node = document.createElement('img');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      node.setAttribute(':src', './foo');
      const res = func(ast, node);
      assert.deepEqual(res, true, 'result');
    });

    it('should throw', () => {
      const ast = {
        flags: null,
        loc: null,
        matcher: null,
        name: {
          loc: null,
          name: 'bar|\\:src',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      const node = document.createElement('img');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      node.setAttribute('bar::src', './foo');
      assert.throws(
        () => func(ast, node),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector [bar|\\:src]',
            'message'
          );
          return true;
        },
        'result'
      );
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        loc: null,
        matcher: null,
        name: {
          loc: null,
          name: '*|\\:src',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      const node = document.createElement('img');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      node.setAttribute('bar::src', './foo');
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should ignore xml:lang attribute in namespace-less [lang]', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: 'lang',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS(
        'http://www.w3.org/XML/1998/namespace',
        'xml:lang',
        'en'
      );
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match attribute with exact case in fallback loop', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: 'foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS(null, 'Foo', 'bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match attribute starting with colon using value matcher in fallback loop', () => {
      const ast = {
        flags: null,
        matcher: '=',
        name: {
          name: '\\:foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute(':foo', 'bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should assign rawName to checkName in XML document', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: 'Foo',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: null
      };
      const doc = new window.DOMParser().parseFromString('<root/>', 'text/xml');
      const node = doc.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:Foo', 'bar');
      doc.documentElement.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match case-insensitively in XML document using the "i" flag', () => {
      const ast = {
        flags: 'i',
        matcher: '=',
        name: {
          name: 'baz',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'qux'
        }
      };
      const domStr = '<root></root>';
      const doc = new window.DOMParser().parseFromString(domStr, 'text/xml');
      const node = doc.createElement('item');
      node.setAttribute('BaZ', 'QUX');
      doc.documentElement.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match itemLocalName case-insensitively in XML document using the "i" flag for colon-separated attributes', () => {
      const ast = {
        flags: 'i',
        matcher: '=',
        name: {
          name: 'bar',
          type: IDENT
        },
        type: ATTR_SELECTOR,
        value: {
          type: STRING,
          value: 'qux'
        }
      };
      const domStr = '<root/>';
      const doc = new window.DOMParser().parseFromString(domStr, 'text/xml');
      const node = doc.createElement('item');
      node.setAttributeNS('https://example.com/foo', 'foo:BaR', 'qux');
      doc.documentElement.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });
  });

  describe('match type selector', () => {
    const func = matcher.matchTypeSelector;

    it('should match(s)', () => {
      const ast = {
        name: '|*',
        type: TYPE_SELECTOR
      };
      const node = document.createElementNS('', 'div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: '|*',
        type: TYPE_SELECTOR
      };
      const node = document.getElementById('div0');
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: '|*',
        type: TYPE_SELECTOR
      };
      const node = document.createElementNS('https://example.com/foo', 'div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        name: '*|*',
        type: TYPE_SELECTOR
      };
      const node = document.getElementById('div0');
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: '*|*',
        type: TYPE_SELECTOR
      };
      const node = document.createElementNS(
        'https://example.com/foo',
        'foo:bar'
      );
      node.setAttribute('xmlns:foo', 'https://example.com/foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should throw', () => {
      const ast = {
        name: 'foo|*',
        type: TYPE_SELECTOR
      };
      const node = document.createElementNS(
        'https://example.com/foo',
        'foo:bar'
      );
      node.setAttribute('xmlns:foo', 'https://example.com/foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      assert.throws(
        () => func(ast, node),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector foo|*', 'message');
          return true;
        }
      );
    });

    it('should match', () => {
      const ast = {
        name: 'foo|*',
        type: TYPE_SELECTOR
      };
      const node = document.createElementNS(
        'https://example.com/foo',
        'foo:bar'
      );
      node.setAttribute('xmlns:foo', 'https://example.com/foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node, {
        check: true
      });
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'foo|*',
        type: TYPE_SELECTOR
      };
      const node = document.createElementNS(
        'https://example.com/foo',
        'foo:bar'
      );
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node, {
        check: true
      });
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: 'foo|*',
        type: TYPE_SELECTOR
      };
      const node = document.getElementById('div0');
      node.setAttribute('xmlns:foo', 'https://example.com/foo');
      const res = func(ast, node, {
        check: true,
        forgive: true
      });
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'foo|bar',
        type: TYPE_SELECTOR
      };
      const nsroot = document.createElement('div');
      nsroot.setAttribute('xmlns', 'http://www.w3.org/2000/xmlns/');
      nsroot.setAttributeNS(
        'http://www.w3.org/2000/xmlns/',
        'xmlns:foo',
        'https://example.com/foo'
      );
      const node = document.createElementNS(
        'https://example.com/foo',
        'foo:bar'
      );
      nsroot.appendChild(node);
      const parent = document.getElementById('div0');
      parent.appendChild(nsroot);
      const res = func(ast, node, {
        check: true
      });
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: 'foo|bar',
        type: TYPE_SELECTOR
      };
      const node = document.createElementNS(
        'https://example.com/foo',
        'foo:baz'
      );
      node.setAttribute('xmlns:foo', 'https://example.com/foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node, {
        check: true
      });
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: 'foo|bar',
        type: TYPE_SELECTOR
      };
      const node = document.createElement('foo:qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node, {
        check: true,
        forgive: true
      });
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        name: '|div',
        type: TYPE_SELECTOR
      };
      const node = document.createElementNS('', 'div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: '|div',
        type: TYPE_SELECTOR
      };
      const node = document.getElementById('div0');
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'foo',
        type: TYPE_SELECTOR
      };
      const node = document.createElementNS('', 'foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'h',
        type: TYPE_SELECTOR
      };
      const node = document.createElementNS('urn:ns', 'h');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'H',
        type: TYPE_SELECTOR
      };
      const node = document.createElementNS('urn:ns', 'H');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: '*|h',
        type: TYPE_SELECTOR
      };
      const node = document.createElementNS('urn:ns', 'h');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: '*',
        type: TYPE_SELECTOR
      };
      const node = document.getElementById('div0');
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: '*',
        type: TYPE_SELECTOR
      };
      const node = document.createElementNS(
        'https://example.com/foo',
        'foo:bar'
      );
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'div',
        type: TYPE_SELECTOR
      };
      const node = document.getElementById('div0');
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'div',
        type: TYPE_SELECTOR
      };
      const node = document.createElementNS(
        'https://example.com/foo',
        'foo:div'
      );
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: '*|div',
        type: TYPE_SELECTOR
      };
      const node = document.createElementNS(
        'https://example.com/foo',
        'foo:div'
      );
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const domStr = `<!doctype html>
        <html>
          <body>
            <foo:bar xmlns:foo="https://example.com/foo" id="foobar">
              <foo:baz/>
              <foo:qux/>
            </foo:bar>
          </body>
        </html>`;
      const doc = new window.DOMParser().parseFromString(domStr, 'text/html');
      const ast = {
        name: 'foo|bar',
        type: TYPE_SELECTOR
      };
      const node = doc.getElementById('foobar');
      const res = func(ast, node, {
        check: true
      });
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'null',
        type: TYPE_SELECTOR
      };
      const node = document.createElement('null');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match', () => {
      const ast = {
        name: 'undefined',
        type: TYPE_SELECTOR
      };
      const node = document.createElement('undefined');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should throw', () => {
      const ast = {
        name: 'foo|div',
        type: TYPE_SELECTOR
      };
      const node = document.createElementNS(
        'https://example.com/bar',
        'bar:div'
      );
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      assert.throws(
        () =>
          func(ast, node, {
            check: true
          }),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Undeclared namespace foo', 'message');
          return true;
        }
      );
    });
  });
});
