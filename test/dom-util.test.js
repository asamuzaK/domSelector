/**
 * dom-util.test.js
 */

/* api */
import { assert } from 'chai';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, it } from 'mocha';

/* test */
import * as domUtil from '../src/js/dom-util.js';

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
  let document;
  beforeEach(() => {
    const dom = new JSDOM(domStr, domOpt);
    document = dom.window.document;
  });
  afterEach(() => {
    document = null;
  });

  describe('is content editable', () => {
    const func = domUtil.isContentEditable;

    it('should get result', () => {
      const res = func();
      assert.isFalse(res, 'result');
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

  describe('is namespace declared', () => {
    const func = domUtil.isNamespaceDeclared;

    it('should get result', () => {
      const res = func();
      assert.isFalse(res, 'result');
    });

    it('should get result', () => {
      const node =
        document.createElementNS('https://example.com/foo', 'foo:div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func('foo', node);
      assert.isFalse(res, 'result');
    });

    it('should get result', () => {
      const node =
        document.createElementNS('https://example.com/foo', 'foo:div');
      node.setAttribute('xmlns:foo', 'https://example.com/foo');
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
      assert.isFalse(res, 'result');
    });
  });

  describe('is node same or descendant of the root node', () => {
    const func = domUtil.isSameOrDescendant;

    it('should get result', () => {
      const node = document.documentElement;
      const res = func(node);
      assert.isTrue(res, 'result');
    });

    it('should get result', () => {
      const node = document.documentElement;
      const res = func(node, document);
      assert.isTrue(res, 'result');
    });

    it('should get result', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.isTrue(res, 'result');
    });

    it('should get result', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node, document.body);
      assert.isTrue(res, 'result');
    });

    it('should get result', () => {
      const node = document.createElement('div');
      const res = func(node);
      assert.isFalse(res, 'result');
    });

    it('should get result', () => {
      const node = document.createElement('div');
      const res = func(node, node);
      assert.isTrue(res, 'result');
    });

    it('should get result', () => {
      const frag = document.createDocumentFragment();
      const node = document.createElement('div');
      frag.appendChild(node);
      const res = func(node);
      assert.isFalse(res, 'result');
    });

    it('should get result', () => {
      const tmpl = document.createElement('template');
      const node = document.createElement('div');
      tmpl.appendChild(node);
      document.body.appendChild(tmpl);
      const res = func(tmpl.content);
      assert.isFalse(res, 'result');
    });
  });

  describe('selector to node props', () => {
    const func = domUtil.selectorToNodeProps;

    it('should throw', () => {
      assert.throws(() => func(), DOMException);
    });

    it('should get value', () => {
      const res = func('foo');
      assert.deepEqual(res, {
        prefix: '*',
        tagName: 'foo'
      });
    });

    it('should get value', () => {
      const res = func('|Foo');
      assert.deepEqual(res, {
        prefix: '',
        tagName: 'Foo'
      });
    });

    it('should get value', () => {
      const res = func('ns|Foo');
      assert.deepEqual(res, {
        prefix: 'ns',
        tagName: 'Foo'
      });
    });

    it('should throw', () => {
      const node =
        document.createElementNS('https://example.com/foo', 'foo:div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      assert.throws(() => func('foo|div', node), DOMException);
    });

    it('should get value', () => {
      const node =
        document.createElementNS('https://example.com/foo', 'foo:div');
      node.setAttribute('xmlns:foo', 'https:/example.com/foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func('foo|div', node);
      assert.deepEqual(res, {
        prefix: 'foo',
        tagName: 'div'
      }, 'result');
    });
  });
});
