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

    it('should throw TypeError when AST type is undefined', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      assert.throws(
        () => func('foo'),
        TypeError,
        'Unexpected ast type Undefined'
      );
    });

    it('should return undefined for ::after pseudo-element', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const res = func('after', PS_ELEMENT_SELECTOR);
      assert.strictEqual(res, undefined, 'result');
    });

    it('should throw NOT_SUPPORTED_ERR for ::after with warn', () => {
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

    it('should return undefined for ::part() pseudo-element', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const res = func('part', PS_ELEMENT_SELECTOR);
      assert.strictEqual(res, undefined, 'result');
    });

    it('should throw NOT_SUPPORTED_ERR for ::part() with warn', () => {
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

    it('should return undefined for ::slotted() pseudo-element', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const res = func('slotted', PS_ELEMENT_SELECTOR);
      assert.strictEqual(res, undefined, 'result');
    });

    it('should throw NOT_SUPPORTED_ERR for ::slotted with warn', () => {
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

    it('should throw SYNTAX_ERR for unknown pseudo-element ::foo', () => {
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

    it('should return undefined for unknown pseudo with forgive', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const res = func('foo', PS_ELEMENT_SELECTOR, {
        forgive: true
      });
      assert.strictEqual(res, undefined, 'result');
    });

    it('should return undefined for vendor-prefixed pseudo', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const res = func('-webkit-foo', PS_ELEMENT_SELECTOR);
      assert.strictEqual(res, undefined, 'result');
    });

    it('should throw NOT_SUPPORTED_ERR for vendor pseudo with warn', () => {
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

    it('should throw SYNTAX_ERR for unprefixed vendor pseudo', () => {
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

    it('should return undefined for unprefixed vendor forgive', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const res = func('webkit-foo', PS_ELEMENT_SELECTOR, {
        forgive: true
      });
      assert.strictEqual(res, undefined, 'result');
    });

    it('should throw SYNTAX_ERR for malformed vendor pseudo', () => {
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

    it('should return undefined for malformed vendor forgive', () => {
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

    it('should throw TypeError when AST argument is invalid', () => {
      const ast = {};
      const node = document.createElement('bdo');
      assert.throws(
        () => func(ast, node),
        TypeError,
        'Unexpected ast type Undefined'
      );
    });

    it('should throw TypeError when AST name is empty string', () => {
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

    it('should match :dir(ltr) against bdo with dir=ltr', () => {
      const ast = {
        name: 'ltr',
        type: IDENT
      };
      const node = document.createElement('bdo');
      node.setAttribute('dir', 'ltr');
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match :dir(ltr) against div with dir=ltr', () => {
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

    it('should match :dir(rtl) against div with dir=rtl', () => {
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

    it('should match :dir(ltr) against document root element', () => {
      const ast = {
        name: 'ltr',
        type: IDENT
      };
      const root = document.documentElement;
      const res = func(ast, root);
      assert.strictEqual(res, true, 'result');
    });

    it('should match :dir(ltr) against tel input element', () => {
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

    it('should match :dir(ltr) against tel input with dir=foo', () => {
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

    it('should match :dir(ltr) against tel input with dir=auto', () => {
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

    it('should match :dir(ltr) against textarea with dir=auto', () => {
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

    it('should match :dir(ltr) against text input with dir=auto', () => {
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

    it('should match :dir(ltr) against empty div with dir=auto', () => {
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

    it('should match :dir(ltr) against bdi element with LTR text', () => {
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

    it('should match :dir(rtl) against bdi element with RTL text', () => {
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

    it('should match :dir(ltr) against empty bdi element', () => {
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

    it('should match :dir(ltr) against assigned shadow slot node', () => {
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

    it('should match :dir(ltr) when inheriting document direction', () => {
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

    it('should match :dir(rtl) when inheriting root dir=rtl', () => {
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

    it('should match :dir(ltr) when inheriting parent dir=ltr', () => {
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

    it('should return false when language pattern name is empty', () => {
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

    it('should return false when language string value is empty', () => {
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

    it('should return false when language pattern value is null', () => {
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
      const res2 = func(ast, node);
      assert.strictEqual(res2, false, 'result (cached)');
    });

    it('should match wildcard language selector on node.lang', () => {
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

    it('should match wildcard string language selector on node.lang', () => {
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

    it('should match wildcard language selector on lang attribute', () => {
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

    it('should match wildcard language selector on inherited lang', () => {
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

    it('should match escaped wildcard lang selector on node.lang', () => {
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

    it('should match escaped wildcard subtag pattern \\*-FR', () => {
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

    it('should return false for wildcard match on empty lang', () => {
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

    it('should return false for wildcard match in fragment', () => {
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

    it('should match exact language tag en on lang attribute', () => {
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

    it('should match language subtag en-US with en pattern', () => {
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

    it('should match inherited language tag en from ancestor', () => {
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

    it('should return false when language tag de mismatches en', () => {
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

    it('should return false for language tag match in fragment', () => {
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

    it('should match extended language subtag pattern de-DE', () => {
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

    it('should match complex language subtag de-Latn-DE', () => {
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

    it('should match language tag case-insensitively de-de', () => {
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

    it('should return false when language script subtag differs', () => {
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

    it('should return false for non-ASCII language identifier', () => {
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

    it('should return false for non-ASCII language string', () => {
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

    it('should return false for empty name in XML document', () => {
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

    it('should return false for empty string in XML document', () => {
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

    it('should match wildcard language selector in XML document', () => {
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

    it('should match inherited wildcard language in XML document', () => {
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

    it('should return false for wildcard match on empty xml:lang', () => {
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

    it('should return false for wildcard match in XML fragment', () => {
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

    it('should return false for language match on empty xml:lang', () => {
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

    it('should match language tag en on xml:lang attribute', () => {
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

    it('should match language subtag en-US in XML document', () => {
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

    it('should match inherited language tag en in XML document', () => {
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

    it('should return false when parent xml:lang is empty', () => {
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

    it('should return false when xml:lang de mismatches en', () => {
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

    it('should return false for language tag in XML fragment', () => {
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

    it('should match language pattern de-DE in XML document', () => {
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

    it('should match complex language tag in XML document', () => {
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

    it('should match language tag case-insensitively in XML', () => {
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

    it('should return false when script subtag differs in XML', () => {
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

    it('should return false for non-ASCII tag in XML document', () => {
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

    it('should return false for non-ASCII string in XML doc', () => {
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

    it('should return true for option element with selected prop', () => {
      const node = document.createElement('option');
      node.selected = true;
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for option element without selected', () => {
      const node = document.createElement('option');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for checked checkbox input element', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'checkbox');
      node.checked = true;
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for unchecked checkbox input element', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'checkbox');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for checked radio input element', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'radio');
      node.checked = true;
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for unchecked radio input element', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'radio');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for text input even if checked set', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.checked = true;
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for non-checkable div element', () => {
      const node = document.createElement('div');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('match link pseudo-class', () => {
    const func = matcher.matchLinkPseudoClass;

    it('should return true for anchor element with href attr', () => {
      const node = document.createElement('a');
      node.setAttribute('href', 'https://example.com');
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for anchor element lacking href attr', () => {
      const node = document.createElement('a');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for area element with href attribute', () => {
      const node = document.createElement('area');
      node.setAttribute('href', '#foo');
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for area element lacking href attribute', () => {
      const node = document.createElement('area');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for non-link div element with href', () => {
      const node = document.createElement('div');
      node.setAttribute('href', 'https://example.com');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('match open pseudo-class', () => {
    const func = matcher.matchOpenPseudoClass;

    it('should return true for details element with open attribute', () => {
      const node = document.createElement('details');
      node.setAttribute('open', '');
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for details element lacking open attr', () => {
      const node = document.createElement('details');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for dialog element with open attribute', () => {
      const node = document.createElement('dialog');
      node.setAttribute('open', '');
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for dialog element lacking open attr', () => {
      const node = document.createElement('dialog');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for non-dialog div with open attr', () => {
      const node = document.createElement('div');
      node.setAttribute('open', '');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('match placeholder-shown pseudo-class', () => {
    const func = matcher.matchPlaceholderShownPseudoClass;
    const keys = new Set(['text', 'number']);

    it('should return true for empty textarea with placeholder', () => {
      const node = document.createElement('textarea');
      node.setAttribute('placeholder', 'foo');
      node.value = '';
      const res = func(node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for textarea with value and placeholder', () => {
      const node = document.createElement('textarea');
      node.setAttribute('placeholder', 'foo');
      node.value = 'bar';
      const res = func(node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for textarea with multiline placeholder', () => {
      const node = document.createElement('textarea');
      node.setAttribute('placeholder', 'foo\nbar');
      node.value = '';
      const res = func(node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for empty textarea lacking placeholder', () => {
      const node = document.createElement('textarea');
      node.value = '';
      const res = func(node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for default input with empty placeholder', () => {
      const node = document.createElement('input');
      node.setAttribute('placeholder', 'foo');
      node.value = '';
      const res = func(node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should return true for text input with empty placeholder', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.setAttribute('placeholder', 'foo');
      node.value = '';
      const res = func(node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for text input with filled placeholder', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.setAttribute('placeholder', 'foo');
      node.value = 'bar';
      const res = func(node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for button input type with placeholder', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'button');
      node.setAttribute('placeholder', 'foo');
      node.value = '';
      const res = func(node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for non-input div with placeholder', () => {
      const node = document.createElement('div');
      node.setAttribute('placeholder', 'foo');
      const res = func(node, keys);
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('match in-range / out-of-range pseudo-class', () => {
    const func = matcher.matchRangePseudoClass;
    const keys = new Set(['number', 'range', 'date']);

    it('should return true for out-of-range value underflow', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('min', '5');
      node.value = '1';
      const res = func('out-of-range', node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should return true for out-of-range value overflow', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('max', '5');
      node.value = '10';
      const res = func('out-of-range', node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for out-of-range when value in range', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '5';
      const res = func('out-of-range', node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for in-range when value is within range', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '5';
      const res = func('in-range', node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for in-range on value underflow', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('min', '5');
      node.value = '1';
      const res = func('in-range', node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for in-range on range type without min/max', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'range');
      node.value = '50';
      const res = func('in-range', node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for in-range on number type without min/max', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.value = '50';
      const res = func('in-range', node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for in-range when input is readonly', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '5';
      node.readOnly = true;
      const res = func('in-range', node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for in-range when input is disabled', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'number');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '5';
      node.disabled = true;
      const res = func('in-range', node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for in-range on unsupported text type', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.setAttribute('min', '1');
      node.setAttribute('max', '10');
      node.value = '5';
      const res = func('in-range', node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for in-range on non-input element', () => {
      const node = document.createElement('div');
      const res = func('in-range', node, keys);
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('match read-only / read-write pseudo-class', () => {
    const func = matcher.matchReadOnlyPseudoClass;

    it('should return true for read-only on standard div element', () => {
      const node = document.createElement('div');
      const res = func('read-only', node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for read-write on standard div element', () => {
      const node = document.createElement('div');
      const res = func('read-write', node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for read-only on editable textarea', () => {
      const node = document.createElement('textarea');
      const res = func('read-only', node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for read-write on editable textarea', () => {
      const node = document.createElement('textarea');
      const res = func('read-write', node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return true for read-only on readonly prop textarea', () => {
      const node = document.createElement('textarea');
      node.readOnly = true;
      const res = func('read-only', node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for read-write on readonly prop textarea', () => {
      const node = document.createElement('textarea');
      node.readOnly = true;
      const res = func('read-write', node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for read-only on readonly attr textarea', () => {
      const node = document.createElement('textarea');
      node.setAttribute('readonly', 'readonly');
      const res = func('read-only', node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for read-write on readonly attr textarea', () => {
      const node = document.createElement('textarea');
      node.setAttribute('readonly', 'readonly');
      const res = func('read-write', node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for read-only on standard text input', () => {
      const node = document.createElement('input');
      const res = func('read-only', node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for read-write on standard text input', () => {
      const node = document.createElement('input');
      const res = func('read-write', node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return true for read-only on readonly prop input', () => {
      const node = document.createElement('input');
      node.readOnly = true;
      const res = func('read-only', node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for read-write on readonly prop input', () => {
      const node = document.createElement('input');
      node.readOnly = true;
      const res = func('read-write', node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for read-only on readonly attr input', () => {
      const node = document.createElement('input');
      node.setAttribute('readonly', 'readonly');
      const res = func('read-only', node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for read-write on readonly attr input', () => {
      const node = document.createElement('input');
      node.setAttribute('readonly', 'readonly');
      const res = func('read-write', node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for read-only on button input type', () => {
      const node = document.createElement('input');
      node.type = 'button';
      const res = func('read-only', node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for read-write on button input type', () => {
      const node = document.createElement('input');
      node.type = 'button';
      const res = func('read-write', node);
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('match required / optional pseudo-class', () => {
    const func = matcher.matchRequiredPseudoClass;
    const keys = new Set(['text', 'checkbox', 'radio', 'file']);

    it('should return true for required on select element with prop', () => {
      const node = document.createElement('select');
      node.required = true;
      const res = func('required', node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for optional on required select element', () => {
      const node = document.createElement('select');
      node.required = true;
      const res = func('optional', node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for required on select lacking attribute', () => {
      const node = document.createElement('select');
      const res = func('required', node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for optional on select lacking attribute', () => {
      const node = document.createElement('select');
      const res = func('optional', node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should return true for required on textarea with attribute', () => {
      const node = document.createElement('textarea');
      node.setAttribute('required', '');
      const res = func('required', node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should return true for required on allowed text input type', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.required = true;
      const res = func('required', node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for required on text input without req', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      const res = func('required', node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for optional on text input without req', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      const res = func('optional', node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for required on button input type', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'button');
      node.required = true;
      const res = func('required', node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for optional on button input type', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'button');
      node.required = true;
      const res = func('optional', node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should return true for required on default input with prop', () => {
      const node = document.createElement('input');
      node.required = true;
      const res = func('required', node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for required on div with attribute', () => {
      const node = document.createElement('div');
      node.setAttribute('required', '');
      const res = func('required', node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for optional on standard div element', () => {
      const node = document.createElement('div');
      const res = func('optional', node, keys);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for required input lacking type attr', () => {
      const node = document.createElement('input');
      node.required = true;
      const res = func('required', node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should return true for required input with required attr', () => {
      const node = document.createElement('input');
      node.setAttribute('required', 'required');
      const res = func('required', node, keys);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for required input lacking required state', () => {
      const node = document.createElement('input');
      const res = func('required', node, keys);
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('match attribute selector', () => {
    const func = matcher.matchAttributeSelector;

    it('should throw SYNTAX_ERR for invalid attribute selector flag', () => {
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

    it('should match no-namespace attribute presence selector', () => {
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

    it('should match no-namespace attribute with case flag s', () => {
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

    it('should match no-namespace attribute with case flag i', () => {
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

    it('should return false for no-namespace match on NS attr', () => {
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

    it('should match wildcard namespace attribute selector', () => {
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

    it('should match wildcard namespace attribute with flag s', () => {
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

    it('should match wildcard namespace on plain attribute', () => {
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

    it('should match wildcard namespace with flag s on plain attr', () => {
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

    it('should throw SYNTAX_ERR for undeclared NS in attr', () => {
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

    it('should match declared namespace attribute with check', () => {
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

    it('should return false for undeclared NS with forgive', () => {
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

    it('should return false for case-sensitive namespace mismatch', () => {
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

    it('should match case-sensitive namespaced attribute', () => {
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

    it('should return false when NS attribute case mismatches', () => {
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

    it('should match case-insensitive namespaced attribute', () => {
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

    it('should match case-insensitive NS attribute with flag i', () => {
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

    it('should match case-insensitive NS prefix with flag i', () => {
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

    it('should return false for namespaced selector on plain attr', () => {
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

    it('should match un-namespaced selector on NS attribute', () => {
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

    it('should match un-namespaced selector with flag s on NS', () => {
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

    it('should match un-namespaced selector on plain attribute', () => {
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

    it('should match un-namespaced selector with flag s on plain', () => {
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

    it('should return false for attribute local name mismatch', () => {
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

    it('should return false when attribute name does not match', () => {
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

    it('should match exact attribute value with IDENT type', () => {
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

    it('should match exact attribute value using flag s', () => {
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

    it('should return false for exact value case mismatch', () => {
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

    it('should return false for exact attribute value mismatch', () => {
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

    it('should match exact attribute value with STRING type', () => {
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

    it('should match exact string attribute value with flag s', () => {
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

    it('should return false for exact string case mismatch', () => {
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

    it('should match exact attribute value containing space', () => {
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

    it('should match exact value on namespaced attribute', () => {
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

    it('should return false for xml|lang namespace selector', () => {
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

    it('should return false for xml:lang literal attribute', () => {
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

    it('should match whitespace-separated word in attribute', () => {
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

    it('should match whitespace-separated word using flag s', () => {
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

    it('should return false for whitespace word case mismatch', () => {
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

    it('should match whitespace-separated word at string end', () => {
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

    it('should return false when whitespace word is missing', () => {
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

    it('should return false for empty word matcher value', () => {
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

    it('should match exact hyphen-separated prefix attribute', () => {
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

    it('should match hyphen-separated prefix with flag s', () => {
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

    it('should return false for hyphen prefix case mismatch', () => {
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

    it('should match hyphen-separated prefix before hyphen', () => {
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

    it('should match hyphenated prefix using case flag s', () => {
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

    it('should return false for hyphenated prefix mismatch', () => {
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

    it('should return false when hyphen prefix mismatches', () => {
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

    it('should return false for empty hyphen matcher value', () => {
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

    it('should match prefix attribute value using ^=', () => {
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

    it('should match prefix attribute substring with ^=', () => {
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

    it('should match prefix attribute value with space', () => {
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

    it('should return false for prefix attribute mismatch', () => {
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

    it('should match prefix attribute value with flag s', () => {
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

    it('should return false for prefix attribute case mismatch', () => {
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

    it('should return false for empty prefix matcher value', () => {
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

    it('should match suffix attribute value using $=', () => {
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

    it('should match suffix attribute substring with $=', () => {
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

    it('should match suffix attribute value with space', () => {
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

    it('should return false for suffix attribute mismatch', () => {
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

    it('should match suffix attribute value with flag s', () => {
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

    it('should return false for suffix attribute case mismatch', () => {
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

    it('should return false for empty suffix matcher value', () => {
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

    it('should match substring attribute value with *=', () => {
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

    it('should match substring attribute within string', () => {
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

    it('should match substring attribute surrounded by space', () => {
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

    it('should return false for substring attribute mismatch', () => {
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

    it('should match substring attribute value with flag s', () => {
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

    it('should return false for substring case mismatch', () => {
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

    it('should return false for empty substring value', () => {
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

    it('should match attribute value in XML with flag i', () => {
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

    it('should return false for attribute value in XML flag s', () => {
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

    it('should return false for attribute case mismatch in XML', () => {
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

    it('should match attribute name with escaped colon', () => {
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

    it('should throw SYNTAX_ERR for invalid escaped colon in NS', () => {
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

    it('should return false for wildcard NS with escaped colon', () => {
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

    it('should ignore xml:lang attribute for plain lang selector', () => {
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

    it('should match exact case attribute in fallback loop', () => {
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

    it('should match colon attribute with value in fallback loop', () => {
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

    it('should match exact case attribute in XML document', () => {
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

    it('should match attribute name case-insensitively in XML', () => {
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

    it('should match local attribute name case-insensitively in XML', () => {
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

    it('should match no-namespace universal selector on div', () => {
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

    it('should return false for no-namespace universal on HTML', () => {
      const ast = {
        name: '|*',
        type: TYPE_SELECTOR
      };
      const node = document.getElementById('div0');
      const res = func(ast, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for no-namespace universal on NS div', () => {
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

    it('should match wildcard namespace universal on HTML div', () => {
      const ast = {
        name: '*|*',
        type: TYPE_SELECTOR
      };
      const node = document.getElementById('div0');
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match wildcard namespace universal on NS element', () => {
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

    it('should throw SYNTAX_ERR for undeclared namespace foo|*', () => {
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

    it('should match declared namespace universal selector foo|*', () => {
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

    it('should match namespace universal selector with check option', () => {
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

    it('should return false for undeclared NS with forgive', () => {
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

    it('should match declared namespace type selector foo|bar', () => {
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

    it('should return false for local name mismatch in foo|bar', () => {
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

    it('should return false for undeclared NS in type selector', () => {
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

    it('should match no-namespace type selector on plain div', () => {
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

    it('should return false for no-namespace selector on HTML div', () => {
      const ast = {
        name: '|div',
        type: TYPE_SELECTOR
      };
      const node = document.getElementById('div0');
      assert.strictEqual(func(ast, node), false, 'result');
    });

    it('should match simple type selector foo on plain element', () => {
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

    it('should match type selector h on namespaced element', () => {
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

    it('should match uppercase type selector H on NS element', () => {
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

    it('should match wildcard namespace type selector *|h on NS', () => {
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

    it('should match universal type selector * on HTML element', () => {
      const ast = {
        name: '*',
        type: TYPE_SELECTOR
      };
      const node = document.getElementById('div0');
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match universal type selector * on NS element', () => {
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

    it('should match type selector div on HTML div element', () => {
      const ast = {
        name: 'div',
        type: TYPE_SELECTOR
      };
      const node = document.getElementById('div0');
      const res = func(ast, node);
      assert.strictEqual(res, true, 'result');
    });

    it('should match type selector div on namespaced div element', () => {
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

    it('should match wildcard namespace type selector *|div', () => {
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

    it('should match namespaced type selector in HTML document', () => {
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

    it('should match type selector for literal tag name null', () => {
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

    it('should match type selector for literal tag undefined', () => {
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

    it('should throw SYNTAX_ERR for undeclared namespace foo', () => {
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
