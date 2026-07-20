/**
 * utility.test.js
 */

/* api */
import { strict as assert } from 'node:assert';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, it } from 'mocha';

/* test */
import * as util from '../src/js/utility.js';
import {
  CLASS_SELECTOR,
  DIR_NEXT,
  DIR_PREV,
  ID_SELECTOR,
  PS_ELEMENT_SELECTOR,
  SHOW_CONTAINER,
  TARGET_FIRST,
  TYPE_SELECTOR
} from '../src/js/constant.js';

describe('utility functions', () => {
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
        </div>
      </body>
    </html>`;
  const domOpt = {
    runScripts: 'dangerously',
    url: 'http://localhost/'
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

  describe('getType', () => {
    const func = util.getType;

    it('should get Undefined', () => {
      assert.strictEqual(func(), 'Undefined');
    });

    it('should get Null', () => {
      assert.strictEqual(func(null), 'Null');
    });

    it('should get Object', () => {
      assert.strictEqual(func({}), 'Object');
    });

    it('should get Array', () => {
      assert.strictEqual(func([]), 'Array');
    });

    it('should get Boolean', () => {
      assert.strictEqual(func(true), 'Boolean');
    });

    it('should get Number', () => {
      assert.strictEqual(func(1), 'Number');
    });

    it('should get String', () => {
      assert.strictEqual(func('a'), 'String');
    });
  });

  describe('verify array contents', () => {
    const func = util.verifyArray;

    it('should throw TypeError when argument is undefined', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should throw TypeError when type parameter is missing', () => {
      assert.throws(() => func([]), TypeError, 'Unexpected type Undefined');
    });

    it('should throw TypeError when array contains invalid types', () => {
      assert.throws(
        () => func([1], 'String'),
        TypeError,
        'Unexpected type Number'
      );
    });

    it('should return array when all elements match required type', () => {
      const res = func(['foo', 'bar'], 'String');
      assert.deepEqual(res, ['foo', 'bar'], 'result');
    });
  });

  describe('generate DOMException', () => {
    const func = util.generateException;

    it('should create a DOMException instance with given properties', () => {
      const res = func('foo', 'SyntaxError', globalThis);
      assert.strictEqual(
        res instanceof globalThis.DOMException,
        true,
        'instance'
      );
      assert.strictEqual(res.message, 'foo', 'message');
      assert.strictEqual(res.name, 'SyntaxError', 'name');
    });
  });

  describe('resolve content document, root node and tree walker', () => {
    const func = util.resolveContent;

    it('should throw TypeError when argument is undefined', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should throw TypeError when argument is an array', () => {
      assert.throws(() => func([]), TypeError, 'Unexpected type Array');
    });

    it('should throw TypeError when argument is a Text node', () => {
      const text = document.createTextNode('foo');
      assert.throws(() => func(text), TypeError, 'Unexpected node #text');
    });

    it('should throw TypeError when argument is a Window object', () => {
      assert.throws(() => func(window), TypeError, 'Unexpected type Window');
    });

    it('should throw TypeError when argument is a Comment node', () => {
      const comment = new window.Comment('foo');
      assert.throws(() => func(comment), TypeError, 'Unexpected node #comment');
    });

    it('should resolve document and root for Document node', () => {
      const res = func(document);
      assert.deepEqual(res, [document, document, false]);
    });

    it('should resolve document and root for DocumentFragment', () => {
      const node = document.createDocumentFragment();
      const res = func(node);
      assert.deepEqual(res, [document, node, false]);
    });

    it('should resolve document and root for element in DOM', () => {
      const node = document.getElementById('div0');
      const res = func(node);
      assert.deepEqual(res, [document, document, false]);
    });

    it('should resolve document and root for element in fragment', () => {
      const frag = document.createDocumentFragment();
      const node = document.createElement('div');
      frag.appendChild(node);
      const res = func(node);
      assert.deepEqual(res, [document, frag, false]);
    });

    it('should resolve context for detached template content', () => {
      const template = document.createElement('template');
      template.innerHTML = '<div id="inner"><span id="leaf"></span></div>';
      const node = template.content.getElementById('leaf');
      const res = func(node);
      assert.strictEqual(res[0], node.ownerDocument, 'document');
      assert.strictEqual(res[1], template.content, 'root');
      assert.strictEqual(res[2], false, 'shadow');
    });

    it('should resolve context for detached element sub-tree', () => {
      const parent = document.createElement('div');
      const node = document.createElement('div');
      parent.appendChild(node);
      const res = func(node);
      assert.deepEqual(res, [document, parent, false]);
    });

    it('should resolve document and root for XML DOM nodes', () => {
      const domstr = '<foo id="foo"><bar id="bar" /></foo>';
      const doc = new window.DOMParser().parseFromString(domstr, 'text/xml');
      const node = doc.getElementById('bar');
      const res = func(node);
      assert.deepEqual(res, [doc, doc, false]);
    });

    it('should resolve context when input node is ShadowRoot', () => {
      const html = `
      <template id="template">
        <div>
          <slot id="foo" name="bar">Foo</slot>
        </div>
      </template>
      <my-element id="baz">
        <span id="qux" slot="quux">Qux</span>
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
      const res = func(node);
      assert.deepEqual(res, [document, node, true], 'result');
    });

    it('should resolve context for node inside Shadow DOM tree', () => {
      const html = `
      <template id="template">
        <div>
          <slot id="foo" name="bar">Foo</slot>
        </div>
      </template>
      <my-element id="baz">
        <span id="qux" slot="quux">Qux</span>
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
      const node = host.shadowRoot.getElementById('foo');
      const res = func(node);
      assert.deepEqual(res, [document, host.shadowRoot, true], 'result');
    });
  });

  describe('traverse node tree', () => {
    const func = util.traverseNode;
    let treeWalker;
    beforeEach(() => {
      treeWalker = document.createTreeWalker(document, SHOW_CONTAINER);
    });
    afterEach(() => {
      treeWalker = null;
    });

    it('should throw TypeError when node argument is undefined', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should throw TypeError when node argument is a string', () => {
      assert.throws(() => func('foo'), TypeError, 'Unexpected type String');
    });

    it('should return null when treeWalker argument is omitted', () => {
      const res = func(document);
      assert.deepEqual(res, null, 'result');
    });

    it('should match document node using treeWalker traversal', () => {
      const res = func(document, treeWalker);
      assert.deepEqual(res, document, 'result');
    });

    it('should return null for node outside treeWalker root', () => {
      const frag = document.createDocumentFragment();
      const res = func(frag, treeWalker);
      assert.deepEqual(res, null, 'result');
    });

    it('should find target element using global treeWalker', () => {
      const node = document.getElementById('ul1');
      const res = func(node, treeWalker);
      assert.deepEqual(res, node, 'result');
    });

    it('should reset treeWalker and find target element', () => {
      const node = document.getElementById('ul1');
      func(document.getElementById('li1'), treeWalker);
      const res = func(node, treeWalker);
      assert.deepEqual(res, node, 'result');
    });

    it('should return null for node detached from treeWalker', () => {
      const node = document.createElement('ol');
      const res = func(node, treeWalker);
      assert.deepEqual(res, null, 'result');
    });

    it('should find child node using container treeWalker', () => {
      const parent = document.createElement('ol');
      const node = document.createElement('li');
      parent.appendChild(node);
      const walker = document.createTreeWalker(parent, SHOW_CONTAINER);
      const res = func(node, walker);
      assert.deepEqual(res, node, 'result');
    });

    it('should traverse upwards to match root fragment node', () => {
      const frag = document.createDocumentFragment();
      const parent = document.createElement('ol');
      const node = document.createElement('li');
      parent.appendChild(node);
      frag.appendChild(parent);
      const walker = document.createTreeWalker(frag, SHOW_CONTAINER);
      func(node, walker);
      const res = func(frag, walker);
      assert.deepEqual(res, frag, 'result');
    });

    it('should find second sibling node during tree traversal', () => {
      const frag = document.createDocumentFragment();
      const parent = document.createElement('ol');
      const node = document.createElement('li');
      const node2 = document.createElement('li');
      parent.appendChild(node);
      parent.appendChild(node2);
      frag.appendChild(parent);
      const walker = document.createTreeWalker(frag, SHOW_CONTAINER);
      func(node, walker);
      const res = func(node2, walker);
      assert.deepEqual(res, node2, 'result');
    });

    it('should find second sibling with reverse traversal flag', () => {
      const frag = document.createDocumentFragment();
      const parent = document.createElement('ol');
      const node = document.createElement('li');
      const node2 = document.createElement('li');
      parent.appendChild(node);
      parent.appendChild(node2);
      frag.appendChild(parent);
      const walker = document.createTreeWalker(frag, SHOW_CONTAINER);
      func(node, walker);
      const res = func(node2, walker, true);
      assert.deepEqual(res, node2, 'result');
    });

    it('should return null when reverse traversal fails match', () => {
      const frag = document.createDocumentFragment();
      const parent = document.createElement('ol');
      const node = document.createElement('li');
      const node2 = document.createElement('li');
      parent.appendChild(node);
      parent.appendChild(node2);
      frag.appendChild(parent);
      const walker = document.createTreeWalker(frag, SHOW_CONTAINER);
      func(node2, walker);
      const res = func(node, walker, true);
      assert.deepEqual(res, null, 'result');
    });
  });

  describe('is custom element', () => {
    const func = util.isCustomElement;

    it('should throw TypeError when node argument is undefined', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should throw TypeError when node argument is a string', () => {
      assert.throws(() => func('foo'), TypeError, 'Unexpected type String');
    });

    it('should return false for DocumentFragment node type', () => {
      const frag = document.createDocumentFragment();
      const res = func(frag);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for standard HTML div element', () => {
      const node = document.createElement('div');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for unregistered x-div element', () => {
      const node = document.createElement('x-div');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for defined autonomous custom element', () => {
      window.customElements.define(
        'sw-rey',
        class extends window.HTMLElement {}
      );
      const node = document.createElement('sw-rey');
      document.getElementById('div0').appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for element with invalid is attribute', () => {
      window.customElements.define(
        'sw-rey',
        class extends window.HTMLElement {}
      );
      const node = document.createElement('p');
      node.setAttribute('is', 'sw-finn');
      document.getElementById('div0').appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for customized built-in element', () => {
      window.customElements.define(
        'sw-rey',
        class extends window.HTMLElement {}
      );
      const node = document.createElement('p');
      node.setAttribute('is', 'sw-rey');
      document.getElementById('div0').appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false when formAssociated option mismatches', () => {
      window.customElements.define(
        'sw-rey',
        class extends window.HTMLElement {}
      );
      const node = document.createElement('sw-rey');
      document.getElementById('div0').appendChild(node);
      const res = func(node, {
        formAssociated: true
      });
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for form-associated custom element', () => {
      window.customElements.define(
        'sw-poe',
        class extends window.HTMLElement {
          static formAssociated = true;
        }
      );
      const node = document.createElement('sw-poe');
      document.getElementById('div0').appendChild(node);
      const res = func(node, {
        formAssociated: true
      });
      assert.strictEqual(res, true, 'result');
    });
  });

  describe('get slotted text content', () => {
    const func = util.getSlottedTextContent;

    it('should throw TypeError when node argument is undefined', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should throw TypeError when node argument is a string', () => {
      assert.throws(() => func('foo'), TypeError, 'Unexpected type String');
    });

    it('should return null for standard div without slot', () => {
      const html = '<div id="foo" name="bar">Foo</div>';
      const container = document.getElementById('div0');
      container.innerHTML = html;
      const node = document.getElementById('foo');
      const res = func(node);
      assert.deepEqual(res, null, 'result');
    });

    it('should return default slot text in light DOM element', () => {
      const html = `
      <div>
        <slot id="foo" name="bar">Foo</slot>
      </div>
      `;
      const container = document.getElementById('div0');
      container.innerHTML = html;
      const node = document.getElementById('foo');
      const res = func(node);
      assert.strictEqual(res, 'Foo', 'result');
    });

    it('should return empty string when slot content is empty', () => {
      const html = `
      <template id="template">
        <div>
          <slot id="foo" name="bar"></slot>
        </div>
      </template>
      <my-element id="baz">
        <span id="qux" slot="quux">Qux</span>
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
      const node = host.shadowRoot.getElementById('foo');
      const res = func(node);
      assert.strictEqual(res, '', 'result');
    });

    it('should return fallback text when slot is unassigned', () => {
      const html = `
      <template id="template">
        <div>
          <slot id="foo" name="bar">Foo</slot>
        </div>
      </template>
      <my-element id="baz">
        <span id="qux" slot="quux">Qux</span>
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
      const node = host.shadowRoot.getElementById('foo');
      const res = func(node);
      assert.strictEqual(res, 'Foo', 'result');
    });

    it('should return assigned element text in shadow slot', () => {
      const html = `
      <template id="template">
        <div>
          <slot id="foo" name="bar">Foo</slot>
        </div>
      </template>
      <my-element id="baz">
        <span id="qux" slot="bar">
          Qux
        </span>
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
      const node = host.shadowRoot.getElementById('foo');
      const res = func(node);
      assert.strictEqual(res, 'Qux', 'result');
    });
  });

  describe('get directionality of node', () => {
    const func = util.getDirectionality;

    it('should throw TypeError when node argument is undefined', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should throw TypeError when node argument is a string', () => {
      assert.throws(() => func('foo'), TypeError, 'Unexpected type String');
    });

    it('should return null when evaluating Document node', () => {
      const res = func(document);
      assert.deepEqual(res, null, 'result');
    });

    it('should resolve directionality for dir=ltr attribute', () => {
      const node = document.createElement('div');
      node.dir = 'ltr';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should normalize uppercase DIR=LTR attribute to ltr', () => {
      const node = document.createElement('div');
      node.dir = 'LTR';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should resolve directionality for dir=rtl attribute', () => {
      const node = document.createElement('div');
      node.dir = 'rtl';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'rtl', 'result');
    });

    it('should normalize uppercase DIR=RTL attribute to rtl', () => {
      const node = document.createElement('div');
      node.dir = 'RTL';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'rtl', 'result');
    });

    it('should evaluate dir=auto on textarea with LTR value', () => {
      const node = document.createElement('textarea');
      node.dir = 'auto';
      node.value = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should normalize uppercase DIR=AUTO on textarea', () => {
      const node = document.createElement('textarea');
      node.dir = 'AUTO';
      node.value = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should evaluate dir=auto on textarea with RTL value', () => {
      const node = document.createElement('textarea');
      node.dir = 'auto';
      node.value = '\u05EA';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'rtl', 'result');
    });

    it('should default empty dir=auto textarea element to ltr', () => {
      const node = document.createElement('textarea');
      node.dir = 'auto';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should evaluate dir=auto on text input with LTR value', () => {
      const node = document.createElement('input');
      node.type = 'text';
      node.dir = 'auto';
      node.value = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should evaluate dir=auto on text input with RTL value', () => {
      const node = document.createElement('input');
      node.type = 'text';
      node.dir = 'auto';
      node.value = '\u05EA';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'rtl', 'result');
    });

    it('should default empty dir=auto text input element to ltr', () => {
      const node = document.createElement('input');
      node.type = 'text';
      node.dir = 'auto';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should evaluate dir=auto on general input with text', () => {
      const node = document.createElement('input');
      node.dir = 'auto';
      node.value = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should resolve slot dir=auto directionality in shadow', () => {
      const html = `
      <template id="template">
        <div>
          <slot id="foo" name="bar" dir="auto">Foo</slot>
        </div>
      </template>
      <my-element id="baz">
        <span id="qux" slot="bar">Qux</span>
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
      const node = host.shadowRoot.getElementById('foo');
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should resolve container dir=auto directionality', () => {
      const html = `
      <template id="template">
        <div id="foobar" dir="auto">
          <slot id="foo" name="bar">Foo</slot>
        </div>
      </template>
      <my-element id="baz">
        <span id="qux" slot="bar">Qux</span>
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
      const node = host.shadowRoot.getElementById('foobar');
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should ignore style and paragraph tags in dir=auto', () => {
      const html = `
      <template id="template">
        <div id="foobar" dir="auto">
          <style></style>
          <p id="quux" dir="auto">Quux</p>
          <slot id="foo" name="bar">Foo</slot>
        </div>
      </template>
      <my-element id="baz">
        <span id="qux" slot="bar">Qux</span>
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
      const node = host.shadowRoot.getElementById('foobar');
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should detect RTL assigned slot content in dir=auto', () => {
      const html = `
      <template id="template">
        <div>
          <slot id="foo" name="bar" dir="auto">Foo</slot>
        </div>
      </template>
      <my-element id="baz">
        <span id="qux" slot="bar">${String.fromCodePoint(0x05ea)}</span>
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
      const node = host.shadowRoot.getElementById('foo');
      const res = func(node);
      assert.strictEqual(res, 'rtl', 'result');
    });

    it('should fallback unassigned slot dir=auto to ltr', () => {
      const html = `
      <template id="template">
        <div>
          <slot id="foo" name="bar" dir="auto">Foo</slot>
        </div>
      </template>
      <my-element id="baz">
        <span id="qux" slot="quux">Qux</span>
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
      const node = host.shadowRoot.getElementById('foo');
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should evaluate dir=auto on div with LTR content', () => {
      const node = document.createElement('div');
      node.dir = 'auto';
      node.textContent = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should evaluate dir=auto on div with RTL content', () => {
      const node = document.createElement('div');
      node.dir = 'auto';
      node.textContent = '\u05EA';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'rtl', 'result');
    });

    it('should default empty dir=auto div element to ltr', () => {
      const node = document.createElement('div');
      node.dir = 'auto';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should evaluate dir=auto on div inside fragment', () => {
      const node = document.createElement('div');
      node.dir = 'auto';
      const frag = document.createDocumentFragment();
      frag.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should evaluate dir=auto on detached div element', () => {
      const node = document.createElement('div');
      node.dir = 'auto';
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should auto-detect directionality for bdi with LTR', () => {
      const node = document.createElement('bdi');
      node.textContent = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should auto-detect directionality for bdi with RTL', () => {
      const node = document.createElement('bdi');
      node.textContent = '\u05EA';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'rtl', 'result');
    });

    it('should force ltr directionality for tel input type', () => {
      const node = document.createElement('input');
      node.type = 'tel';
      node.value = '\u05EA';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should resolve default ltr directionality for slot', () => {
      const html = `
      <template id="template">
        <div>
          <slot id="foo" name="bar">Foo</slot>
        </div>
      </template>
      <my-element id="baz">
        <span id="qux" slot="bar">Qux</span>
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
      const node = host.shadowRoot.getElementById('foo');
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should detect RTL directionality from slot text', () => {
      const html = `
      <template id="template">
        <div>
          <slot id="foo" name="bar">Foo</slot>
        </div>
      </template>
      <my-element id="baz">
        <span id="qux" slot="bar">${String.fromCodePoint(0x05ea)}</span>
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
      const node = host.shadowRoot.getElementById('foo');
      const res = func(node);
      assert.strictEqual(res, 'rtl', 'result');
    });

    it('should resolve default ltr for unassigned slot', () => {
      const html = `
      <template id="template">
        <div>
          <slot id="foo" name="bar">Foo</slot>
        </div>
      </template>
      <my-element id="baz">
        <span id="qux" slot="quux">Qux</span>
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
      const node = host.shadowRoot.getElementById('foo');
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should inherit document ltr directionality for div', () => {
      const node = document.createElement('div');
      node.textContent = '\u05EA';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should inherit ltr directionality for div in fragment', () => {
      const node = document.createElement('div');
      node.textContent = '\u05EA';
      const frag = document.createDocumentFragment();
      frag.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should default detached div element to ltr direction', () => {
      const node = document.createElement('div');
      node.textContent = '\u05EA';
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });
  });

  describe('getDirectionality (ascendant and slot)', () => {
    const func = util.getDirectionality;

    it('should inherit directionality from parent element', () => {
      const parent = document.createElement('div');
      parent.dir = 'rtl';
      const child = document.createElement('span');
      parent.appendChild(child);
      document.body.appendChild(parent);
      const res = func(child);
      assert.strictEqual(res, 'rtl', 'inherited from parent');
      document.body.removeChild(parent);
    });

    it('should resolve LTR directionality from assigned slot text', () => {
      const host = document.createElement('div');
      const shadow = host.attachShadow({ mode: 'open' });
      const slot = document.createElement('slot');
      shadow.appendChild(slot);
      const child = document.createElement('span');
      child.textContent = 'hello';
      host.appendChild(child);
      document.body.appendChild(host);
      const res = func(slot);
      assert.strictEqual(res, 'ltr', 'resolved LTR from slot text');
      document.body.removeChild(host);
    });

    it('should resolve RTL directionality from assigned slot text', () => {
      const host = document.createElement('div');
      const shadow = host.attachShadow({ mode: 'open' });
      const slot = document.createElement('slot');
      shadow.appendChild(slot);
      const child = document.createElement('span');
      child.textContent = 'مرحبا';
      host.appendChild(child);
      document.body.appendChild(host);
      const res = func(slot);
      assert.strictEqual(res, 'rtl', 'resolved RTL from slot text');
      document.body.removeChild(host);
    });

    it('should fallback to parent directionality if slot has no text', () => {
      const parent = document.createElement('div');
      parent.dir = 'rtl';
      const slot = document.createElement('slot');
      parent.appendChild(slot);
      document.body.appendChild(parent);
      const res = func(slot);
      assert.strictEqual(res, 'rtl', 'slot fallback to parent');
      document.body.removeChild(parent);
    });
  });

  describe('get language attribute', () => {
    const func = util.getLanguageAttribute;

    it('should throw TypeError when node argument is undefined', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should return null when evaluating Document node', () => {
      const res = func(document);
      assert.strictEqual(res, null, 'result');
    });

    it('should return null for element without lang attribute', () => {
      const node = document.createElement('div');
      const res = func(node);
      assert.strictEqual(res, null, 'result');
    });

    it('should return empty string when lang attribute is empty', () => {
      const node = document.createElement('div');
      node.setAttribute('lang', '');
      const res = func(node);
      assert.strictEqual(res, '', 'result');
    });

    it('should return null for child of element without lang', () => {
      const parent = document.createElement('div');
      const node = document.createElement('div');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, null, 'result');
    });

    it('should inherit lang attribute value from parent element', () => {
      const parent = document.createElement('div');
      parent.setAttribute('lang', 'en');
      const node = document.createElement('div');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'en', 'result');
    });

    it('should resolve xml:lang attribute value in XML document', () => {
      const src = '<foo id="foo" xml:lang="en"><bar id="bar"/></foo>';
      const doc = new window.DOMParser().parseFromString(src, 'text/xml');
      const node = doc.getElementById('bar');
      const res = func(node);
      assert.strictEqual(res, 'en', 'result');
    });

    it('should return null for element in fragment without lang', () => {
      const frag = document.createDocumentFragment();
      const node = document.createElement('div');
      frag.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, null, 'result');
    });

    it('should resolve inherited lang attribute through Shadow DOM', () => {
      const html = `
      <div lang='en-US'>
        <template id="template">
          <div>
            <slot id="foo" name="bar">Foo</slot>
          </div>
        </template>
        <my-element id="baz">
          <span id="qux" slot="foo">Qux</span>
        </my-element>
      </div>
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
      const res = func(node);
      assert.strictEqual(res, 'en-US', 'result');
    });

    it('should return null for XML element lacking xml:lang attr', () => {
      const xmlDom = `
      <foo id="foo">
        <bar id="bar">
          <baz id="baz"/>
        </bar>
      </foo>
      `;
      const doc = new window.DOMParser().parseFromString(xmlDom, 'text/xml');
      const node = doc.createElement('div');
      const parent = doc.getElementById('baz');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, null, 'result');
    });

    it('should resolve inherited xml:lang value in XML tree', () => {
      const xmlDom = `
      <foo id="foo" xml:lang="en">
        <bar id="bar">
          <baz id="baz"/>
        </bar>
      </foo>
      `;
      const doc = new window.DOMParser().parseFromString(xmlDom, 'text/xml');
      const node = doc.createElement('div');
      const parent = doc.getElementById('baz');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'en', 'result');
    });

    it('should use provided cache when traversing ancestor lang', () => {
      const parent = document.createElement('div');
      parent.setAttribute('lang', 'fr');
      const child = document.createElement('span');
      parent.appendChild(child);
      document.body.appendChild(parent);
      const langCache = new WeakMap();
      const res1 = func(parent, langCache);
      assert.strictEqual(res1, 'fr', 'parent resolves to fr');
      assert.strictEqual(langCache.has(parent), true, 'parent is cached');
      const res2 = func(child, langCache);
      assert.strictEqual(
        res2,
        'fr',
        'child hits parent cache and resolves to fr'
      );
      document.body.removeChild(parent);
    });
  });

  describe('is content editable', () => {
    const func = util.isContentEditable;

    it('should throw TypeError when node argument is undefined', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should throw TypeError when node argument is a string', () => {
      assert.throws(() => func('foo'), TypeError, 'Unexpected type String');
    });

    it('should return false for Document node type', () => {
      const res = func(document);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for detached standard div element', () => {
      const node = document.createElement('div');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for standard div attached to DOM', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true when isContentEditable prop is true', () => {
      const node = document.createElement('div');
      Object.defineProperty(node, 'isContentEditable', {
        value: true,
        writable: false
      });
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return true when document designMode is on', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      document.designMode = 'on';
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return true for contenteditable="true" element', () => {
      const node = document.createElement('div');
      node.setAttribute('contenteditable', 'true');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return true for contenteditable="plaintext-only"', () => {
      const node = document.createElement('div');
      node.setAttribute('contenteditable', 'plaintext-only');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return true for empty contenteditable attribute', () => {
      const node = document.createElement('div');
      node.setAttribute('contenteditable', '');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for invalid contenteditable value', () => {
      const node = document.createElement('div');
      node.setAttribute('contenteditable', 'foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for contenteditable="inherit" at root', () => {
      const node = document.createElement('div');
      node.setAttribute('contenteditable', 'inherit');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should inherit editability from editable parent element', () => {
      const node1 = document.createElement('div');
      node1.setAttribute('contenteditable', 'inherit');
      const node2 = document.createElement('div');
      node2.setAttribute('contenteditable', 'true');
      node2.appendChild(node1);
      const parent = document.getElementById('div0');
      parent.appendChild(node2);
      const res = func(node1);
      assert.strictEqual(res, true, 'result');
    });

    it('should inherit editability when no attribute is set', () => {
      const node1 = document.createElement('div');
      const node2 = document.createElement('div');
      node2.setAttribute('contenteditable', 'true');
      node2.appendChild(node1);
      const parent = document.getElementById('div0');
      parent.appendChild(node2);
      const res = func(node1);
      assert.strictEqual(res, true, 'result');
    });
  });

  describe('is node visible', () => {
    const func = util.isVisible;

    it('should return false when node argument is undefined', () => {
      const res = func();
      assert.strictEqual(res, false, 'result');
    });

    it('should return false when evaluating Document node', () => {
      const res = func(document);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for standard visible div element', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false when element display style is none', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      node.style.display = 'none';
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false when element visibility is hidden', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      node.style.visibility = 'hidden';
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false when element visibility is collapse', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      node.style.visibility = 'collapse';
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false when element hidden property is true', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      node.hidden = true;
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true when display style overrides hidden', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      node.style.display = 'block';
      node.hidden = true;
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });
  });

  describe('is focus visible', () => {
    const func = util.isFocusVisible;

    it('should return false when node argument is undefined', () => {
      const res = func();
      assert.strictEqual(res, false, 'result');
    });

    it('should return false when evaluating Document node', () => {
      const res = func(document);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for standard non-input div element', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for standard text input element', () => {
      const node = document.createElement('input');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for radio button input element', () => {
      const node = document.createElement('input');
      node.type = 'radio';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for standard textarea element', () => {
      const node = document.createElement('textarea');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return true for contenteditable div element', () => {
      const node = document.createElement('div');
      node.setAttribute('contenteditable', 'true');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });
  });

  describe('is focusable area', () => {
    const func = util.isFocusableArea;

    it('should return false when node argument is undefined', () => {
      const res = func();
      assert.strictEqual(res, false, 'result');
    });

    it('should return false when evaluating Document node', () => {
      const res = func(document);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false when evaluating document body', () => {
      const res = func(document.body);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for detached standard div element', () => {
      const node = document.createElement('div');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for attached standard div element', () => {
      const node = document.createElement('div');
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for element with tabindex=-1', () => {
      const node = document.createElement('div');
      node.tabIndex = -1;
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return true for empty contenteditable attribute', () => {
      const node = document.createElement('div');
      node.setAttribute('contenteditable', '');
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for contenteditable="false" element', () => {
      const node = document.createElement('div');
      node.setAttribute('contenteditable', 'false');
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for anchor tag lacking href attr', () => {
      const node = document.createElement('a');
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for anchor element with href attr', () => {
      const node = document.createElement('a');
      node.href = 'about:blank';
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return true for iframe element in document', () => {
      const node = document.createElement('iframe');
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return true for standard active input element', () => {
      const node = document.createElement('input');
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for disabled input property', () => {
      const node = document.createElement('input');
      node.disabled = true;
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for disabled input attribute', () => {
      const node = document.createElement('input');
      node.setAttribute('disabled', '');
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for hidden input property', () => {
      const node = document.createElement('input');
      node.hidden = true;
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for hidden input attribute', () => {
      const node = document.createElement('input');
      node.setAttribute('hidden', '');
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for summary outside details tag', () => {
      const node = document.createElement('summary');
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for first summary in details tag', () => {
      const parent = document.createElement('details');
      const node = document.createElement('summary');
      parent.appendChild(node);
      document.body.appendChild(parent);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for second summary in details', () => {
      const parent = document.createElement('details');
      const nodeBefore = document.createElement('summary');
      const node = document.createElement('summary');
      parent.appendChild(nodeBefore);
      parent.appendChild(node);
      document.body.appendChild(parent);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for first summary after div sibling', () => {
      const parent = document.createElement('details');
      const nodeBefore = document.createElement('div');
      const node = document.createElement('summary');
      parent.appendChild(nodeBefore);
      parent.appendChild(node);
      document.body.appendChild(parent);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return true for standard button element', () => {
      const node = document.createElement('button');
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for disabled button element', () => {
      const node = document.createElement('button');
      node.disabled = true;
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for standard SVG element', () => {
      const node = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      );
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for SVG element with tabindex=-1', () => {
      const node = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      );
      node.tabIndex = -1;
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return true for SVG text element with tabindex', () => {
      const parent = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      );
      const node = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text'
      );
      node.tabIndex = -1;
      parent.appendChild(node);
      document.body.appendChild(parent);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for non-focusable SVG mask element', () => {
      const parent = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      );
      const node = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'mask'
      );
      node.tabIndex = -1;
      parent.appendChild(node);
      document.body.appendChild(parent);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for SVG anchor element with href', () => {
      const parent = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      );
      const node = document.createElementNS('http://www.w3.org/2000/svg', 'a');
      node.setAttribute('href', 'about:blank');
      parent.appendChild(node);
      document.body.appendChild(parent);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for MathML element in document', () => {
      const node = document.createElementNS(
        'http://www.w3.org/1998/Math/MathML',
        'math'
      );
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('is focusable', () => {
    const func = util.isFocusable;

    it('should return false when node argument is omitted', () => {
      const res = func();
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for Document node type', () => {
      const res = func(document);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for input inside enabled fieldset', () => {
      const form = document.createElement('form');
      const field = document.createElement('fieldset');
      const node = document.createElement('input');
      field.appendChild(node);
      form.appendChild(field);
      const parent = document.getElementById('div0');
      parent.appendChild(form);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for input inside disabled fieldset', () => {
      const form = document.createElement('form');
      const field = document.createElement('fieldset');
      const node = document.createElement('input');
      field.appendChild(node);
      field.disabled = true;
      form.appendChild(field);
      const parent = document.getElementById('div0');
      parent.appendChild(form);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for input with disabled attribute', () => {
      const form = document.createElement('form');
      const field = document.createElement('fieldset');
      const node = document.createElement('input');
      field.appendChild(node);
      field.setAttribute('disabled', '');
      form.appendChild(field);
      const parent = document.getElementById('div0');
      parent.appendChild(form);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false when parent form is display:none', () => {
      const form = document.createElement('form');
      const field = document.createElement('fieldset');
      const node = document.createElement('input');
      field.appendChild(node);
      form.appendChild(field);
      form.setAttribute('style', 'display: none');
      const parent = document.getElementById('div0');
      parent.appendChild(form);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false when parent form is visibility:hidden', () => {
      const form = document.createElement('form');
      const field = document.createElement('fieldset');
      const node = document.createElement('input');
      field.appendChild(node);
      form.appendChild(field);
      form.style.visibility = 'hidden';
      const parent = document.getElementById('div0');
      parent.appendChild(form);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false when parent form is visibility:collapse', () => {
      const form = document.createElement('form');
      const field = document.createElement('fieldset');
      const node = document.createElement('input');
      field.appendChild(node);
      form.appendChild(field);
      form.style.visibility = 'collapse';
      const parent = document.getElementById('div0');
      parent.appendChild(form);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for content-visibility:hidden parent', () => {
      const form = document.createElement('form');
      const field = document.createElement('fieldset');
      const node = document.createElement('input');
      field.appendChild(node);
      form.appendChild(field);
      form.style.contentVisibility = 'hidden';
      const parent = document.getElementById('div0');
      parent.appendChild(form);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true when display style overrides hidden', () => {
      const form = document.createElement('form');
      const field = document.createElement('fieldset');
      const node = document.createElement('input');
      field.appendChild(node);
      form.appendChild(field);
      form.hidden = true;
      form.style.display = 'block';
      const parent = document.getElementById('div0');
      parent.appendChild(form);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });
  });

  describe('get namespace URI', () => {
    const func = util.getNamespaceURI;

    it('should throw TypeError when arguments are undefined', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should throw TypeError when second argument is an array', () => {
      assert.throws(() => func([]), TypeError, 'Unexpected type Array');
    });

    it('should throw TypeError when node argument is missing', () => {
      assert.throws(() => func('foo'), TypeError, 'Unexpected type Undefined');
    });

    it('should throw TypeError when node is invalid string type', () => {
      assert.throws(
        () => func('foo', 'bar'),
        TypeError,
        'Unexpected type String'
      );
    });

    it('should return null when prefix is not defined on document', () => {
      const res = func('foo', document);
      assert.deepEqual(res, null, 'result');
    });

    it('should return null when element lacks xmlns attribute', () => {
      const node = document.createElementNS(
        'https://example.com/foo',
        'foo:div'
      );
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func('foo', node);
      assert.deepEqual(res, null, 'result');
    });

    it('should resolve namespace URI from local xmlns attribute', () => {
      const node = document.createElementNS(
        'https://example.com/foo',
        'foo:div'
      );
      node.setAttribute('xmlns:foo', 'https://example.com/foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func('foo', node);
      assert.strictEqual(res, 'https://example.com/foo', 'result');
    });

    it('should return null if parent xmlns namespace is separate', () => {
      const node = document.createElementNS(
        'https://example.com/foo',
        'foo:div'
      );
      const parent = document.getElementById('div0');
      parent.setAttributeNS(
        'http://www.w3.org/2000/xmlns/',
        'xmlns:foo',
        'https://example.com/foo'
      );
      parent.appendChild(node);
      const res = func('foo', node);
      assert.deepEqual(res, null, 'result');
    });

    it('should resolve namespace URI set with setAttributeNS', () => {
      const node = document.createElementNS(
        'https://example.com/foo',
        'foo:div'
      );
      node.setAttributeNS(
        'http://www.w3.org/2000/xmlns/',
        'xmlns:foo',
        'https://example.com/foo'
      );
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func('foo', node);
      assert.strictEqual(res, 'https://example.com/foo', 'result');
    });
  });

  describe('is namespace declared', () => {
    const func = util.isNamespaceDeclared;

    it('should return false when arguments are undefined', () => {
      const res = func();
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for element without declared namespace', () => {
      const node = document.createElement('foo:div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func('foo', node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for element with declared namespace URI', () => {
      const node = document.createElementNS(
        'https://example.com/foo',
        'foo:div'
      );
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func('foo', node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return true for element inside document fragment', () => {
      const frag = document.createDocumentFragment();
      const node = document.createElementNS(
        'https://example.com/foo',
        'foo:div'
      );
      frag.appendChild(node);
      const res = func('foo', node);
      assert.strictEqual(res, true, 'result');
    });

    it('should return true for element with explicit xmlns attr', () => {
      const frag = document.createDocumentFragment();
      const node = document.createElementNS(
        'https://example.com/foo',
        'foo:div'
      );
      node.setAttributeNS(
        'http://www.w3.org/2000/xmlns/',
        'xmlns:foo',
        'https://example.com/foo'
      );
      frag.appendChild(node);
      const res = func('foo', node);
      assert.strictEqual(res, true, 'result');
    });
  });

  describe('is preceding', () => {
    const func = util.isPreceding;

    it('should throw TypeError when both arguments are missing', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should throw TypeError when first argument is string', () => {
      assert.throws(() => func('foo'), TypeError, 'Unexpected type String');
    });

    it('should throw TypeError when second argument is missing', () => {
      const node = document.documentElement;
      assert.throws(() => func(node), TypeError, 'Unexpected type Undefined');
    });

    it('should throw TypeError when second argument is string', () => {
      const node = document.documentElement;
      assert.throws(
        () => func(node, 'foo'),
        TypeError,
        'Unexpected type String'
      );
    });

    it('should return true when first node is parent of second', () => {
      const nodeA = document.createElement('ul');
      const nodeB = document.createElement('li');
      const parent = document.getElementById('div0');
      nodeA.appendChild(nodeB);
      parent.appendChild(nodeA);
      const res = func(nodeA, nodeB);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false when first node is child of second', () => {
      const nodeA = document.createElement('li');
      const nodeB = document.createElement('ul');
      const parent = document.getElementById('div0');
      nodeB.appendChild(nodeA);
      parent.appendChild(nodeB);
      const res = func(nodeA, nodeB);
      assert.strictEqual(res, false, 'result');
    });

    it('should return true for preceding sibling element', () => {
      const nodeA = document.createElement('li');
      const nodeB = document.createElement('li');
      const base = document.createElement('ul');
      const parent = document.getElementById('div0');
      base.appendChild(nodeA);
      base.appendChild(nodeB);
      parent.appendChild(base);
      const res = func(nodeA, nodeB);
      assert.strictEqual(res, true, 'result');
    });

    it('should return false for succeeding sibling element', () => {
      const nodeA = document.createElement('li');
      const nodeB = document.createElement('li');
      const base = document.createElement('ul');
      const parent = document.getElementById('div0');
      base.appendChild(nodeA);
      base.appendChild(nodeB);
      parent.appendChild(base);
      const res = func(nodeB, nodeA);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false when comparing with document root', () => {
      const node = document.createElement('div');
      const base = document.documentElement;
      const res = func(node, base);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false when comparing node with itself', () => {
      const node = document.createElement('div');
      const res = func(node, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should return false for detached template content node', () => {
      const tmpl = document.createElement('template');
      const node = document.createElement('div');
      tmpl.appendChild(node);
      document.body.appendChild(tmpl);
      const base = document.documentElement;
      const res = func(tmpl.content, base);
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('compare nodes', () => {
    const func = util.compareNodes;

    it('should return -1 when first node precedes second node', () => {
      const ul = document.createElement('ul');
      const node1 = document.createElement('li');
      const node2 = document.createElement('li');
      const node3 = document.createElement('li');
      ul.append(node1, node2, node3);
      const parent = document.getElementById('div0');
      parent.appendChild(ul);
      const res = func(node1, node3);
      assert.strictEqual(res, -1, 'result');
    });

    it('should return 1 when second node precedes first node', () => {
      const ul = document.createElement('ul');
      const node1 = document.createElement('li');
      const node2 = document.createElement('li');
      const node3 = document.createElement('li');
      ul.append(node1, node2, node3);
      const parent = document.getElementById('div0');
      parent.appendChild(ul);
      const res = func(node3, node1);
      assert.strictEqual(res, 1, 'result');
    });
  });

  describe('sort nodes', () => {
    const func = util.sortNodes;

    it('should sort list item nodes in document tree order', () => {
      const ul = document.createElement('ul');
      const node1 = document.createElement('li');
      const node2 = document.createElement('li');
      const node3 = document.createElement('li');
      ul.append(node1, node2, node3);
      const parent = document.getElementById('div0');
      parent.appendChild(ul);
      const nodes = new Set([node3, node2, node1]);
      const res = func(nodes);
      assert.deepEqual([...res], [node1, node2, node3], 'result');
    });

    it('should include parent element in sorted node order', () => {
      const ul = document.createElement('ul');
      const node1 = document.createElement('li');
      const node2 = document.createElement('li');
      const node3 = document.createElement('li');
      ul.append(node1, node2, node3);
      const parent = document.getElementById('div0');
      parent.appendChild(ul);
      const nodes = new Set([node3, node2, ul, node1]);
      const res = func(nodes);
      assert.deepEqual([...res], [ul, node1, node2, node3], 'result');
    });

    it('should sort nodes within a DocumentFragment tree', () => {
      const frag = document.createDocumentFragment();
      const node1 = document.createElement('div');
      const node2 = document.createElement('div');
      const node3 = document.createElement('div');
      frag.append(node1, node2, node3);
      const nodes = new Set([node2, node3, node1]);
      const res = func(nodes);
      assert.deepEqual([...res], [node1, node2, node3], 'result');
    });

    it('should deduplicate and sort nodes in document order', () => {
      const frag = document.createDocumentFragment();
      const node1 = document.createElement('div');
      const node2 = document.createElement('div');
      const node3 = document.createElement('div');
      frag.append(node1, node2, node3);
      const nodes = new Set([node2, node1, node3, node1]);
      const res = func(nodes);
      assert.deepEqual([...res], [node1, node2, node3], 'result');
    });
  });

  describe('findBestSeed', () => {
    const func = util.findBestSeed;

    it('should return initial state when no nodes match', () => {
      const nodes = [{ type: 999, name: 'dummy' }];
      const res = func(nodes);
      assert.deepEqual(res, { seed: null, priority: 0 });
    });

    it('should select TYPE_SELECTOR while ignoring universal selector', () => {
      const nodes = [
        { type: TYPE_SELECTOR, name: '*' }, // ignored
        { type: TYPE_SELECTOR, name: 'div' }
      ];
      const res = func(nodes);
      assert.deepEqual(res.seed, { type: 'tag', value: 'div' });
      assert.strictEqual(res.priority, 1);
    });

    it('should select CLASS_SELECTOR and override TYPE_SELECTOR', () => {
      const nodes = [
        { type: TYPE_SELECTOR, name: 'div' },
        { type: CLASS_SELECTOR, name: 'active' } // overwrites priority
      ];
      const res = func(nodes);
      assert.deepEqual(res.seed, { type: 'class', value: 'active' });
      assert.strictEqual(res.priority, 2);
    });

    it('should select ID_SELECTOR and override CLASS_SELECTOR', () => {
      const nodes = [
        { type: CLASS_SELECTOR, name: 'active' },
        { type: ID_SELECTOR, name: 'target' }, // overwrites priority
        { type: TYPE_SELECTOR, name: 'div' } // ignored
      ];
      const res = func(nodes);
      assert.deepEqual(res.seed, { type: 'id', value: 'target' });
      assert.strictEqual(res.priority, 3);
    });

    it('should stop traversal immediately when ID_SELECTOR is found', () => {
      const nodes = [
        { type: ID_SELECTOR, name: 'first-id' },
        { type: ID_SELECTOR, name: 'second-id' }
      ];
      const res = func(nodes);
      assert.deepEqual(res.seed, { type: 'id', value: 'first-id' });
    });

    it('should traverse nested arrays to find best selector seed', () => {
      const nodes = [
        [{ type: TYPE_SELECTOR, name: 'span' }],
        [{ type: CLASS_SELECTOR, name: 'inner' }]
      ];
      const res = func(nodes);
      assert.deepEqual(res.seed, { type: 'class', value: 'inner' });
      assert.strictEqual(res.priority, 2);
    });

    it('should traverse node children recursively for best seed', () => {
      const nodes = [
        {
          type: 999,
          children: [
            { type: TYPE_SELECTOR, name: 'p' },
            {
              type: 999,
              children: [{ type: CLASS_SELECTOR, name: 'deep' }]
            }
          ]
        }
      ];
      const res = func(nodes);
      assert.deepEqual(res.seed, { type: 'class', value: 'deep' });
      assert.strictEqual(res.priority, 2);
    });

    it('should return immediately if initial state priority is 3', () => {
      const nodes = [
        { type: CLASS_SELECTOR, name: 'new-class' },
        { type: ID_SELECTOR, name: 'new-id' }
      ];
      const initialState = {
        seed: { type: 'id', value: 'existing-id' },
        priority: 3
      };
      const res = func(nodes, initialState);
      assert.deepEqual(res.seed, { type: 'id', value: 'existing-id' });
      assert.strictEqual(res.priority, 3);
    });

    it('should break loop and skip remaining nodes once ID is found', () => {
      const nodes = [
        { type: TYPE_SELECTOR, name: 'div' },
        { type: ID_SELECTOR, name: 'first-id' },
        { type: ID_SELECTOR, name: 'second-id' },
        null,
        [{ type: ID_SELECTOR, name: 'third-id' }]
      ];
      const res = func(nodes);
      assert.deepEqual(res.seed, { type: 'id', value: 'first-id' });
      assert.strictEqual(res.priority, 3);
    });
  });

  describe('populateHasAllowlist', () => {
    const func = util.populateHasAllowlist;

    it('should populate allowlist with the element, siblings, and parent', () => {
      const parent = document.createElement('div');
      const prevSibling = document.createElement('div');
      const target = document.createElement('div');
      const nextSibling = document.createElement('div');
      parent.append(prevSibling, target, nextSibling);
      const allowlistSet = new WeakSet();
      const visitedAncestors = new Set();
      func(target, allowlistSet, visitedAncestors);
      assert.strictEqual(allowlistSet.has(target), true);
      assert.strictEqual(allowlistSet.has(prevSibling), true);
      assert.strictEqual(allowlistSet.has(nextSibling), true);
      assert.strictEqual(allowlistSet.has(parent), true);
      assert.strictEqual(visitedAncestors.has(target), true);
      assert.strictEqual(visitedAncestors.has(parent), true);
    });

    it('should traverse upwards through multiple ancestors', () => {
      const grandParent = document.createElement('div');
      const parent = document.createElement('div');
      const target = document.createElement('div');
      grandParent.append(parent);
      parent.append(target);
      const allowlistSet = new WeakSet();
      const visitedAncestors = new Set();
      func(target, allowlistSet, visitedAncestors);
      assert.strictEqual(allowlistSet.has(target), true);
      assert.strictEqual(allowlistSet.has(parent), true);
      assert.strictEqual(allowlistSet.has(grandParent), true);
    });

    it('should short-circuit and break loop if an ancestor is already visited', () => {
      const grandParent = document.createElement('div');
      const parent = document.createElement('div');
      const parentSibling = document.createElement('div');
      const target = document.createElement('div');
      grandParent.append(parent, parentSibling);
      parent.append(target);
      const allowlistSet = new WeakSet();
      const visitedAncestors = new Set();
      visitedAncestors.add(parent);
      func(target, allowlistSet, visitedAncestors);
      assert.strictEqual(allowlistSet.has(target), true);
      assert.strictEqual(allowlistSet.has(parent), true);
      assert.strictEqual(allowlistSet.has(parentSibling), false);
      assert.strictEqual(allowlistSet.has(grandParent), false);
    });

    it('should handle DOCUMENT_FRAGMENT_NODE correctly', () => {
      const frag = document.createDocumentFragment(); // nodeType === 11
      const target = document.createElement('div');
      frag.append(target);
      const allowlistSet = new WeakSet();
      const visitedAncestors = new Set();
      func(target, allowlistSet, visitedAncestors);
      assert.strictEqual(allowlistSet.has(target), true);
      assert.strictEqual(allowlistSet.has(frag), true);
      assert.strictEqual(visitedAncestors.has(frag), true);
    });

    it('should safely ignore non-element nodes in the while loop', () => {
      const parent = document.createElement('div');
      const textNode = document.createTextNode('text');
      parent.append(textNode);
      const allowlistSet = new WeakSet();
      const visitedAncestors = new Set();
      func(textNode, allowlistSet, visitedAncestors);
      assert.strictEqual(allowlistSet.has(textNode), true);
      assert.strictEqual(visitedAncestors.has(textNode), false);
      assert.strictEqual(allowlistSet.has(parent), false);
    });
  });

  describe('collectAllDescendants', () => {
    const func = util.collectAllDescendants;

    it('should throw TypeError if node is undefined or null', () => {
      assert.throws(
        () => func(undefined, document),
        TypeError,
        'Unexpected type Undefined'
      );
      assert.throws(
        () => func(null, document),
        TypeError,
        'Unexpected type Undefined'
      );
    });

    it('should throw TypeError if document is missing', () => {
      const node = document.createElement('div');
      assert.throws(() => func(node), TypeError, 'Unexpected type Undefined');
      assert.throws(() => func(node, null), TypeError, 'Unexpected type Null');
    });

    it('should collect all descendant elements from Document', () => {
      const html = `
      <div id="parent">
        <span class="child"></span>
        <p class="child">
          <strong class="grandchild"></strong>
        </p>
      </div>
      `;
      const doc = new window.DOMParser().parseFromString(html, 'text/html');
      const res = func(doc, doc);
      // html, head, body, div, span, p, strong = 7 elements
      assert.strictEqual(res.length, 7, 'number of descendants');
      assert.strictEqual(res[0].localName, 'html');
      assert.strictEqual(res[res.length - 1].localName, 'strong');
    });

    it('should collect all descendant elements from an Element', () => {
      const parent = document.createElement('div');
      parent.innerHTML = `
      <span class="child1"></span>
      <p class="child2">
        <strong class="grandchild"></strong>
      </p>
      `;
      document.body.appendChild(parent);
      const res = func(parent, document);
      assert.strictEqual(res.length, 3, 'number of descendants');
      assert.strictEqual(res[0].localName, 'span');
      assert.strictEqual(res[1].localName, 'p');
      assert.strictEqual(res[2].localName, 'strong');
      document.body.removeChild(parent);
    });

    it('should collect all descendant elements from a DocumentFragment', () => {
      const frag = document.createDocumentFragment();
      const parent = document.createElement('div');
      parent.innerHTML = `
      <span class="child1"></span>
      <p class="child2">
        <strong class="grandchild"></strong>
      </p>
      `;
      frag.appendChild(parent);
      const res = func(frag, document);
      assert.strictEqual(
        res.length,
        4,
        'number of descendants including the root div'
      );
      assert.strictEqual(res[0].localName, 'div');
      assert.strictEqual(res[1].localName, 'span');
      assert.strictEqual(res[2].localName, 'p');
      assert.strictEqual(res[3].localName, 'strong');
    });

    it('should return an empty array if the element has no descendants', () => {
      const parent = document.createElement('div');
      const res = func(parent, document);
      assert.deepEqual(res, [], 'result should be an empty array');
    });

    it('should ignore text nodes and comments', () => {
      const parent = document.createElement('div');
      parent.appendChild(document.createTextNode('Hello'));
      parent.appendChild(document.createElement('span'));
      parent.appendChild(document.createComment('This is a comment'));
      parent.appendChild(document.createElement('p'));
      const res = func(parent, document);
      assert.strictEqual(res.length, 2, 'number of element descendants');
      assert.strictEqual(res[0].localName, 'span');
      assert.strictEqual(res[1].localName, 'p');
    });
  });

  describe('get traversal strategy', () => {
    const func = util.getTraversalStrategy;

    it('should return DIR_PREV and first twig for single-twig branch', () => {
      const twig = { leaves: [{ name: 'div', type: TYPE_SELECTOR }] };
      const branch = [twig];
      const res = func(branch, 'all');
      assert.strictEqual(res.dir, DIR_PREV, 'direction');
      assert.deepEqual(res.twig, twig, 'twig');
    });

    it('should return DIR_PREV and last twig when hasScope is true', () => {
      const firstTwig = { leaves: [{ name: 'div', type: TYPE_SELECTOR }] };
      const lastTwig = { leaves: [{ name: 'span', type: TYPE_SELECTOR }] };
      const branch = [firstTwig, lastTwig];
      const res = func(branch, 'all', true);
      assert.strictEqual(res.dir, DIR_PREV, 'direction');
      assert.deepEqual(res.twig, lastTwig, 'twig');
    });

    it('should use DIR_PREV and last twig for pseudo-element end', () => {
      const firstTwig = { leaves: [{ name: 'div', type: TYPE_SELECTOR }] };
      const lastTwig = {
        leaves: [{ name: 'before', type: PS_ELEMENT_SELECTOR }]
      };
      const branch = [firstTwig, lastTwig];
      const res = func(branch, 'all');
      assert.strictEqual(res.dir, DIR_PREV, 'direction');
      assert.deepEqual(res.twig, lastTwig, 'twig');
    });

    it('should return DIR_PREV and last twig when last leaf is ID', () => {
      const firstTwig = { leaves: [{ name: 'div', type: TYPE_SELECTOR }] };
      const lastTwig = { leaves: [{ name: 'foo', type: ID_SELECTOR }] };
      const branch = [firstTwig, lastTwig];
      const res = func(branch, 'all');
      assert.strictEqual(res.dir, DIR_PREV, 'direction');
      assert.deepEqual(res.twig, lastTwig, 'twig');
    });

    it('should return DIR_NEXT and first twig when first leaf is ID', () => {
      const firstTwig = { leaves: [{ name: 'foo', type: ID_SELECTOR }] };
      const lastTwig = { leaves: [{ name: 'span', type: TYPE_SELECTOR }] };
      const branch = [firstTwig, lastTwig];
      const res = func(branch, 'all');
      assert.strictEqual(res.dir, DIR_NEXT, 'direction');
      assert.deepEqual(res.twig, firstTwig, 'twig');
    });

    it('should select DIR_PREV when first twig is universal selector', () => {
      const firstTwig = { leaves: [{ name: '*', type: TYPE_SELECTOR }] };
      const lastTwig = { leaves: [{ name: 'span', type: TYPE_SELECTOR }] };
      const branch = [firstTwig, lastTwig];
      const res = func(branch, 'all');
      assert.strictEqual(res.dir, DIR_PREV, 'direction');
      assert.deepEqual(res.twig, lastTwig, 'twig');
    });

    it('should select DIR_NEXT when last twig is universal selector', () => {
      const firstTwig = { leaves: [{ name: 'div', type: TYPE_SELECTOR }] };
      const lastTwig = { leaves: [{ name: '*', type: TYPE_SELECTOR }] };
      const branch = [firstTwig, lastTwig];
      const res = func(branch, 'all');
      assert.strictEqual(res.dir, DIR_NEXT, 'direction');
      assert.deepEqual(res.twig, firstTwig, 'twig');
    });

    it('should return DIR_PREV and last twig when branch length is 2', () => {
      const firstTwig = { leaves: [{ name: 'div', type: TYPE_SELECTOR }] };
      const lastTwig = { leaves: [{ name: 'foo', type: CLASS_SELECTOR }] };
      const branch = [firstTwig, lastTwig];
      const res = func(branch, 'all');
      assert.strictEqual(res.dir, DIR_PREV, 'direction');
      assert.deepEqual(res.twig, lastTwig, 'twig');
    });

    it('should return DIR_PREV and last twig for TARGET_FIRST mode', () => {
      const firstTwig = { leaves: [{ name: 'div', type: TYPE_SELECTOR }] };
      const midTwig = {
        combo: { name: '>' },
        leaves: [{ name: 'span', type: TYPE_SELECTOR }]
      };
      const lastTwig = { leaves: [{ name: 'foo', type: CLASS_SELECTOR }] };
      const branch = [firstTwig, midTwig, lastTwig];
      const res = func(branch, TARGET_FIRST, true);
      assert.strictEqual(res.dir, DIR_PREV, 'direction');
      assert.deepEqual(res.twig, lastTwig, 'twig');
    });

    it('should default to DIR_NEXT and first twig for long branches', () => {
      const firstTwig = { leaves: [{ name: 'div', type: TYPE_SELECTOR }] };
      const midTwig = {
        combo: { name: '>' },
        leaves: [{ name: 'span', type: TYPE_SELECTOR }]
      };
      const lastTwig = { leaves: [{ name: 'foo', type: CLASS_SELECTOR }] };
      const branch = [firstTwig, midTwig, lastTwig];
      const res = func(branch, 'all');
      assert.strictEqual(res.dir, DIR_NEXT, 'direction');
      assert.deepEqual(res.twig, firstTwig, 'twig');
    });

    it('should choose DIR_PREV when last leaf is type selector', () => {
      const firstTwig = { leaves: [{ name: 'div', type: TYPE_SELECTOR }] };
      const midTwig = {
        combo: { name: '+' },
        leaves: [{ name: 'span', type: CLASS_SELECTOR }]
      };
      const lastTwig = {
        combo: { name: '~' },
        leaves: [{ name: 'p', type: TYPE_SELECTOR }]
      };
      const branch = [firstTwig, midTwig, lastTwig];
      const res = func(branch, TARGET_FIRST, true);
      assert.strictEqual(res.dir, DIR_PREV, 'direction');
      assert.deepEqual(res.twig, lastTwig, 'twig');
    });

    it('should choose DIR_PREV when combinators are hierarchy-only', () => {
      const firstTwig = { leaves: [{ name: 'div', type: TYPE_SELECTOR }] };
      const midTwig = {
        combo: { name: '>' },
        leaves: [{ name: 'span', type: TYPE_SELECTOR }]
      };
      const lastTwig = {
        combo: { name: ' ' },
        leaves: [{ name: 'foo', type: CLASS_SELECTOR }]
      };
      const branch = [firstTwig, midTwig, lastTwig];
      const res = func(branch, TARGET_FIRST, true);
      assert.strictEqual(res.dir, DIR_PREV, 'direction');
      assert.deepEqual(res.twig, lastTwig, 'twig');
    });

    it('should select DIR_PREV with 4th flag and last type selector', () => {
      const firstTwig = { leaves: [{ name: 'div', type: TYPE_SELECTOR }] };
      const midTwig = {
        combo: { name: '+' },
        leaves: [{ name: 'span', type: CLASS_SELECTOR }]
      };
      const lastTwig = {
        combo: { name: '~' },
        leaves: [{ name: 'p', type: TYPE_SELECTOR }]
      };
      const branch = [firstTwig, midTwig, lastTwig];
      const res = func(branch, TARGET_FIRST, false, true);
      assert.strictEqual(res.dir, DIR_PREV, 'direction');
      assert.deepEqual(res.twig, lastTwig, 'twig');
    });

    it('should select DIR_PREV with 4th flag and descendant combo', () => {
      const firstTwig = { leaves: [{ name: 'div', type: TYPE_SELECTOR }] };
      const midTwig = {
        combo: { name: '>' },
        leaves: [{ name: 'span', type: TYPE_SELECTOR }]
      };
      const lastTwig = {
        combo: { name: ' ' },
        leaves: [{ name: 'foo', type: CLASS_SELECTOR }]
      };
      const branch = [firstTwig, midTwig, lastTwig];
      const res = func(branch, TARGET_FIRST, false, true);
      assert.strictEqual(res.dir, DIR_PREV, 'direction');
      assert.deepEqual(res.twig, lastTwig, 'twig');
    });

    it('should select DIR_PREV with 4th flag and sibling combo', () => {
      const firstTwig = { leaves: [{ name: 'div', type: TYPE_SELECTOR }] };
      const midTwig = {
        combo: { name: '>' },
        leaves: [{ name: 'span', type: TYPE_SELECTOR }]
      };
      const lastTwig = {
        combo: { name: '+' },
        leaves: [{ name: 'foo', type: CLASS_SELECTOR }]
      };
      const branch = [firstTwig, midTwig, lastTwig];
      const res = func(branch, TARGET_FIRST, false, true);
      assert.strictEqual(res.dir, DIR_PREV, 'direction');
      assert.deepEqual(res.twig, lastTwig, 'twig');
    });
  });
});
