/**
 * dom-util.test.js
 */

/* api */
import { assert } from 'chai';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, it } from 'mocha';

/* test */
import * as domUtil from '../src/js/dom-util.js';
import { WALKER_FILTER } from '../src/js/constant.js';

describe('DOM utility functions', () => {
  const domStr = `<!doctype html>
    <html lang="en">
      <head>
      </head>
      <body>
        <div id="div0">
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
    window = null;
    document = null;
  });

  describe('verify node', () => {
    const func = domUtil.verifyNode;

    it('should throw', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should throw', () => {
      assert.throws(() => func([]), TypeError, 'Unexpected type Array');
    });

    it('should throw', () => {
      const text = document.createTextNode('foo');
      assert.throws(() => func(text), TypeError, 'Unexpected node #text');
    });

    it('should throw', () => {
      assert.throws(() => func(window), TypeError, 'Unexpected type Window');
    });

    it('should throw', () => {
      const comment = new window.Comment('foo');
      assert.throws(() => func(comment), TypeError, 'Unexpected node #comment');
    });

    it('should get result', () => {
      const res = func(document);
      assert.deepEqual(res, document, 'result');
    });

    it('should get result', () => {
      const frag = document.createDocumentFragment();
      const res = func(frag);
      assert.deepEqual(res, frag, 'result');
    });

    it('should get result', () => {
      const node = document.createElement('div');
      const res = func(node);
      assert.deepEqual(res, node, 'result');
    });
  });

  describe('resolve content document, root node and tree walker', () => {
    const func = domUtil.resolveContent;

    it('should get result', () => {
      const res = func(document);
      const tree = document.createTreeWalker(document, WALKER_FILTER);
      assert.deepEqual(res, [
        document,
        document,
        tree
      ]);
    });

    it('should get result', () => {
      const node = document.createDocumentFragment();
      const tree = document.createTreeWalker(node, WALKER_FILTER);
      const res = func(node);
      assert.deepEqual(res, [
        document,
        node,
        tree
      ]);
    });

    it('should get result', () => {
      const node = document.getElementById('div0');
      const tree = document.createTreeWalker(document, WALKER_FILTER);
      const res = func(node);
      assert.deepEqual(res, [
        document,
        document,
        tree
      ]);
    });

    it('should get result', () => {
      const frag = document.createDocumentFragment();
      const node = document.createElement('div');
      frag.appendChild(node);
      const tree = document.createTreeWalker(frag, WALKER_FILTER);
      const res = func(node);
      assert.deepEqual(res, [
        document,
        frag,
        tree
      ]);
    });

    it('should get result', () => {
      const parent = document.createElement('div');
      const node = document.createElement('div');
      parent.appendChild(node);
      const tree = document.createTreeWalker(parent, WALKER_FILTER);
      const res = func(node);
      assert.deepEqual(res, [
        document,
        parent,
        tree
      ]);
    });

    it('should get result', () => {
      const domstr = '<foo id="foo"><bar id="bar" /></foo>';
      const doc = new window.DOMParser().parseFromString(domstr, 'text/xml');
      const node = doc.getElementById('bar');
      const tree = doc.createTreeWalker(doc, WALKER_FILTER);
      const res = func(node);
      assert.deepEqual(res, [
        doc,
        doc,
        tree
      ]);
    });
  });

  describe('is in shadow tree', () => {
    const func = domUtil.isInShadowTree;

    it('should throw', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should not match', () => {
      const html = `
        <div>
          <slot id="foo" name="bar">Foo</slot>
        </div>
      `;
      const container = document.getElementById('div0');
      container.innerHTML = html;
      const node = document.getElementById('foo');
      const res = func(node);
      assert.isFalse(res, 'result');
    });

    it('should match', () => {
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
      };
      window.customElements.define('my-element', MyElement);
      const host = document.getElementById('baz');
      const node = host.shadowRoot;
      const res = func(node);
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
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
      };
      window.customElements.define('my-element', MyElement);
      const host = document.getElementById('baz');
      const node = host.shadowRoot.getElementById('foo');
      const res = func(node);
      assert.isTrue(res, 'result');
    });
  });

  describe('get slotted text content', () => {
    const func = domUtil.getSlottedTextContent;

    it('should throw', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should get null', () => {
      const html = `
        <div>
          <slot id="foo" name="bar">Foo</slot>
        </div>
      `;
      const container = document.getElementById('div0');
      container.innerHTML = html;
      const node = document.getElementById('foo');
      const res = func(node);
      assert.isNull(res, 'result');
    });

    it('should get value', () => {
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
      };
      window.customElements.define('my-element', MyElement);
      const host = document.getElementById('baz');
      const node = host.shadowRoot.getElementById('foo');
      const res = func(node);
      assert.strictEqual(res, 'Foo', 'result');
    });

    it('should get value', () => {
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
      };
      window.customElements.define('my-element', MyElement);
      const host = document.getElementById('baz');
      const node = host.shadowRoot.getElementById('foo');
      const res = func(node);
      assert.strictEqual(res, 'Qux', 'result');
    });
  });

  describe('get directionality of node', () => {
    const func = domUtil.getDirectionality;

    it('should throw', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should get value', () => {
      const node = document.createElement('div');
      node.dir = 'ltr';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should get value', () => {
      const node = document.createElement('div');
      node.dir = 'LTR';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should get value', () => {
      const node = document.createElement('div');
      node.dir = 'rtl';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'rtl', 'result');
    });

    it('should get value', () => {
      const node = document.createElement('div');
      node.dir = 'RTL';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'rtl', 'result');
    });

    it('should get value', () => {
      const node = document.createElement('textarea');
      node.dir = 'auto';
      node.value = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should get value', () => {
      const node = document.createElement('textarea');
      node.dir = 'AUTO';
      node.value = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should get value', () => {
      const node = document.createElement('textarea');
      node.dir = 'auto';
      node.value = '\u05EA';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'rtl', 'result');
    });

    it('should get value', () => {
      const node = document.createElement('textarea');
      node.dir = 'auto';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should get value', () => {
      const node = document.createElement('input');
      node.type = 'text';
      node.dir = 'auto';
      node.value = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should get value', () => {
      const node = document.createElement('input');
      node.type = 'text';
      node.dir = 'auto';
      node.value = '\u05EA';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'rtl', 'result');
    });

    it('should get value', () => {
      const node = document.createElement('input');
      node.type = 'text';
      node.dir = 'auto';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should get value', () => {
      const node = document.createElement('input');
      node.dir = 'auto';
      node.value = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should get value', () => {
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
      };
      window.customElements.define('my-element', MyElement);
      const host = document.getElementById('baz');
      const node = host.shadowRoot.getElementById('foo');
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should get value', () => {
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
      };
      window.customElements.define('my-element', MyElement);
      const host = document.getElementById('baz');
      const node = host.shadowRoot.getElementById('foobar');
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should get value', () => {
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
      };
      window.customElements.define('my-element', MyElement);
      const host = document.getElementById('baz');
      const node = host.shadowRoot.getElementById('foobar');
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should get value', () => {
      const html = `
        <template id="template">
          <div>
            <slot id="foo" name="bar" dir="auto">Foo</slot>
          </div>
        </template>
        <my-element id="baz">
          <span id="qux" slot="bar">${String.fromCodePoint(0x05EA)}</span>
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
      const node = host.shadowRoot.getElementById('foo');
      const res = func(node);
      assert.strictEqual(res, 'rtl', 'result');
    });

    it('should get value', () => {
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
      };
      window.customElements.define('my-element', MyElement);
      const host = document.getElementById('baz');
      const node = host.shadowRoot.getElementById('foo');
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should get value', () => {
      const node = document.createElement('div');
      node.dir = 'auto';
      node.textContent = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should get value', () => {
      const node = document.createElement('div');
      node.dir = 'auto';
      node.textContent = '\u05EA';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'rtl', 'result');
    });

    it('should get value', () => {
      const node = document.createElement('div');
      node.dir = 'auto';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should get value', () => {
      const node = document.createElement('div');
      node.dir = 'auto';
      const frag = document.createDocumentFragment();
      frag.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should get value', () => {
      const node = document.createElement('div');
      node.dir = 'auto';
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should get value', () => {
      const node = document.createElement('bdi');
      node.textContent = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should get value', () => {
      const node = document.createElement('bdi');
      node.textContent = '\u05EA';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'rtl', 'result');
    });

    it('should get value', () => {
      const node = document.createElement('input');
      node.type = 'tel';
      node.value = '\u05EA';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should get value', () => {
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
      };
      window.customElements.define('my-element', MyElement);
      const host = document.getElementById('baz');
      const node = host.shadowRoot.getElementById('foo');
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should get value', () => {
      const html = `
        <template id="template">
          <div>
            <slot id="foo" name="bar">Foo</slot>
          </div>
        </template>
        <my-element id="baz">
          <span id="qux" slot="bar">${String.fromCodePoint(0x05EA)}</span>
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
      const node = host.shadowRoot.getElementById('foo');
      const res = func(node);
      assert.strictEqual(res, 'rtl', 'result');
    });

    it('should get value', () => {
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
      };
      window.customElements.define('my-element', MyElement);
      const host = document.getElementById('baz');
      const node = host.shadowRoot.getElementById('foo');
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should get value', () => {
      const node = document.createElement('div');
      node.textContent = '\u05EA';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should get value', () => {
      const node = document.createElement('div');
      node.textContent = '\u05EA';
      const frag = document.createDocumentFragment();
      frag.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });

    it('should get value', () => {
      const node = document.createElement('div');
      node.textContent = '\u05EA';
      const res = func(node);
      assert.strictEqual(res, 'ltr', 'result');
    });
  });

  describe('is content editable', () => {
    const func = domUtil.isContentEditable;

    it('should throw', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should get result', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.isFalse(res, 'result');
    });

    it('should get result', () => {
      const node = document.createElement('div');
      Object.defineProperty(node, 'isContentEditable', {
        value: true,
        writable: false
      });
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.isTrue(res, 'result');
    });

    it('should get result', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      document.designMode = 'on';
      const res = func(node);
      assert.isTrue(res, 'result');
    });

    it('should get result', () => {
      const node = document.createElement('div');
      node.setAttribute('contenteditable', 'true');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.isTrue(res, 'result');
    });

    it('should get result', () => {
      const node = document.createElement('div');
      node.setAttribute('contenteditable', 'plaintext-only');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.isTrue(res, 'result');
    });

    it('should get result', () => {
      const node = document.createElement('div');
      node.setAttribute('contenteditable', '');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.isTrue(res, 'result');
    });

    it('should get result', () => {
      const node = document.createElement('div');
      node.setAttribute('contenteditable', 'inherit');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.isFalse(res, 'result');
    });

    it('should get result', () => {
      const node1 = document.createElement('div');
      node1.setAttribute('contenteditable', 'inherit');
      const node2 = document.createElement('div');
      node2.setAttribute('contenteditable', 'true');
      node2.appendChild(node1);
      const parent = document.getElementById('div0');
      parent.appendChild(node2);
      const res = func(node1);
      assert.isTrue(res, 'result');
    });
  });

  describe('get namespace URI', () => {
    const func = domUtil.getNamespaceURI;

    it('should throw', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should get null', () => {
      const node =
        document.createElementNS('https://example.com/foo', 'foo:div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func('foo', node);
      assert.isNull(res, 'result');
    });

    it('should get result', () => {
      const node =
        document.createElementNS('https://example.com/foo', 'foo:div');
      node.setAttribute('xmlns:foo', 'https://example.com/foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func('foo', node);
      assert.strictEqual(res, 'https://example.com/foo', 'result');
    });

    it('should get null', () => {
      const node =
        document.createElementNS('https://example.com/foo', 'foo:div');
      const parent = document.getElementById('div0');
      parent.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:foo',
        'https://example.com/foo');
      parent.appendChild(node);
      const res = func('foo', node);
      assert.isNull(res, 'result');
    });

    it('should get result', () => {
      const node =
        document.createElementNS('https://example.com/foo', 'foo:div');
      node.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:foo',
        'https://example.com/foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func('foo', node);
      assert.strictEqual(res, 'https://example.com/foo', 'result');
    });
  });

  describe('is namespace declared', () => {
    const func = domUtil.isNamespaceDeclared;

    it('should get result', () => {
      const res = func();
      assert.isFalse(res, 'result');
    });

    it('should get result', () => {
      const node = document.createElement('foo:div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func('foo', node);
      assert.isFalse(res, 'result');
    });

    it('should get result', () => {
      const node =
        document.createElementNS('https://example.com/foo', 'foo:div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func('foo', node);
      assert.isTrue(res, 'result');
    });

    it('should get result', () => {
      const frag = document.createDocumentFragment();
      const node =
        document.createElementNS('https://example.com/foo', 'foo:div');
      frag.appendChild(node);
      const res = func('foo', node);
      assert.isTrue(res, 'result');
    });

    it('should get result', () => {
      const frag = document.createDocumentFragment();
      const node =
        document.createElementNS('https://example.com/foo', 'foo:div');
      node.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:foo',
        'https://example.com/foo');
      frag.appendChild(node);
      const res = func('foo', node);
      assert.isTrue(res, 'result');
    });
  });

  describe('is preceding', () => {
    const func = domUtil.isPreceding;

    it('should throw', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should throw', () => {
      const node = document.documentElement;
      assert.throws(() => func(node), TypeError, 'Unexpected type Undefined');
    });

    it('should throw', () => {
      const node = document.documentElement;
      assert.throws(() => func(null, node), TypeError, 'Unexpected type Null');
    });

    it('should get result', () => {
      const nodeA = document.createElement('ul');
      const nodeB = document.createElement('li');
      const parent = document.getElementById('div0');
      nodeA.appendChild(nodeB);
      parent.appendChild(nodeA);
      const res = func(nodeA, nodeB);
      assert.isTrue(res, 'result');
    });

    it('should get result', () => {
      const nodeA = document.createElement('li');
      const nodeB = document.createElement('ul');
      const parent = document.getElementById('div0');
      nodeB.appendChild(nodeA);
      parent.appendChild(nodeB);
      const res = func(nodeA, nodeB);
      assert.isFalse(res, 'result');
    });

    it('should get result', () => {
      const nodeA = document.createElement('li');
      const nodeB = document.createElement('li');
      const base = document.createElement('ul');
      const parent = document.getElementById('div0');
      base.appendChild(nodeA);
      base.appendChild(nodeB);
      parent.appendChild(base);
      const res = func(nodeA, nodeB);
      assert.isTrue(res, 'result');
    });

    it('should get result', () => {
      const nodeA = document.createElement('li');
      const nodeB = document.createElement('li');
      const base = document.createElement('ul');
      const parent = document.getElementById('div0');
      base.appendChild(nodeA);
      base.appendChild(nodeB);
      parent.appendChild(base);
      const res = func(nodeB, nodeA);
      assert.isFalse(res, 'result');
    });

    it('should get result', () => {
      const node = document.createElement('div');
      const base = document.documentElement;
      const res = func(node, base);
      assert.isFalse(res, 'result');
    });

    it('should get result', () => {
      const node = document.createElement('div');
      const res = func(node, node);
      assert.isFalse(res, 'result');
    });

    it('should get result', () => {
      const tmpl = document.createElement('template');
      const node = document.createElement('div');
      tmpl.appendChild(node);
      document.body.appendChild(tmpl);
      const base = document.documentElement;
      const res = func(tmpl.content, base);
      assert.isFalse(res, 'result');
    });
  });

  describe('sort nodes', () => {
    const func = domUtil.sortNodes;

    it('should get matched node(s)', () => {
      const ul = document.createElement('ul');
      const node1 = document.createElement('li');
      const node2 = document.createElement('li');
      const node3 = document.createElement('li');
      ul.append(node1, node2, node3);
      const parent = document.getElementById('div0');
      parent.appendChild(ul);
      const nodes = new Set([node3, node2, node1]);
      const res = func(nodes);
      assert.deepEqual([...res], [
        node1, node2, node3
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const ul = document.createElement('ul');
      const node1 = document.createElement('li');
      const node2 = document.createElement('li');
      const node3 = document.createElement('li');
      ul.append(node1, node2, node3);
      const parent = document.getElementById('div0');
      parent.appendChild(ul);
      const nodes = new Set([node3, node2, ul, node1]);
      const res = func(nodes);
      assert.deepEqual([...res], [
        ul, node1, node2, node3
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const frag = document.createDocumentFragment();
      const node1 = document.createElement('div');
      const node2 = document.createElement('div');
      const node3 = document.createElement('div');
      frag.append(node1, node2, node3);
      const nodes = new Set([node2, node3, node1]);
      const res = func(nodes);
      assert.deepEqual([...res], [
        node1, node2, node3
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const frag = document.createDocumentFragment();
      const node1 = document.createElement('div');
      const node2 = document.createElement('div');
      const node3 = document.createElement('div');
      frag.append(node1, node2, node3);
      const nodes = new Set([node2, node1, node3, node1]);
      const res = func(nodes);
      assert.deepEqual([...res], [
        node1, node2, node3
      ], 'result');
    });
  });
});
