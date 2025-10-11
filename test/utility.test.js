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
  COMBINATOR,
  PS_CLASS_SELECTOR,
  SHOW_CONTAINER,
  SELECTOR,
  SELECTOR_LIST,
  TARGET_ALL,
  TARGET_FIRST,
  TARGET_SELF,
  TARGET_LINEAL,
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

    it('should throw', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should throw', () => {
      assert.throws(() => func([]), TypeError, 'Unexpected type Undefined');
    });

    it('should throw', () => {
      assert.throws(
        () => func([1], 'String'),
        TypeError,
        'Unexpected type Number'
      );
    });

    it('should get value', () => {
      const res = func(['foo', 'bar'], 'String');
      assert.deepEqual(res, ['foo', 'bar'], 'result');
    });
  });

  describe('generate DOMException', () => {
    const func = util.generateException;

    it('should generate DOMException', () => {
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

  describe('find nested :has()', () => {
    const func = util.findNestedHas;

    it('should get true', () => {
      const res = func({
        name: 'has'
      });
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const res = func({
        name: 'is'
      });
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('Find logical pseudo-class that contains nested :has()', () => {
    const func = util.findLogicalWithNestedHas;

    it('should match', () => {
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
      const res = func(leaf);
      assert.deepEqual(res, leaf, 'result');
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
        name: 'is',
        type: PS_CLASS_SELECTOR
      };
      const res = func(leaf);
      assert.deepEqual(res, leaf, 'result');
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
        name: 'is',
        type: PS_CLASS_SELECTOR
      };
      const res = func(leaf);
      assert.deepEqual(res, null, 'result');
    });
  });

  describe('filter nodes by anb', () => {
    const func = util.filterNodesByAnB;

    it('should get empty array', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 0,
        b: 0,
        reverse: false
      };
      const res = func(nodes, anb);
      assert.deepEqual(res, [], 'result');
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 0,
        b: 1,
        reverse: false
      };
      const res = func(nodes, anb);
      assert.deepEqual(res, [document.getElementById('li1')], 'result');
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 0,
        b: 1,
        reverse: true
      };
      const res = func(nodes, anb);
      assert.deepEqual(res, [document.getElementById('li3')], 'result');
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 0,
        b: 2,
        reverse: false
      };
      const res = func(nodes, anb);
      assert.deepEqual(res, [document.getElementById('li2')], 'result');
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 0,
        b: 2,
        reverse: true
      };
      const res = func(nodes, anb);
      assert.deepEqual(res, [document.getElementById('li2')], 'result');
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 0,
        b: 3,
        reverse: false
      };
      const res = func(nodes, anb);
      assert.deepEqual(res, [document.getElementById('li3')], 'result');
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 0,
        b: 3,
        reverse: false
      };
      const res = func(nodes, anb);
      assert.deepEqual(res, [document.getElementById('li3')], 'result');
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 1,
        b: 0,
        reverse: false
      };
      const res = func(nodes, anb);
      assert.deepEqual(
        res,
        [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ],
        'result'
      );
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 1,
        b: 0,
        reverse: true
      };
      const res = func(nodes, anb);
      assert.deepEqual(
        res,
        [
          document.getElementById('li3'),
          document.getElementById('li2'),
          document.getElementById('li1')
        ],
        'result'
      );
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 1,
        b: 1,
        reverse: false
      };
      const res = func(nodes, anb);
      assert.deepEqual(
        res,
        [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ],
        'result'
      );
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 1,
        b: 1,
        reverse: true
      };
      const res = func(nodes, anb);
      assert.deepEqual(
        res,
        [
          document.getElementById('li3'),
          document.getElementById('li2'),
          document.getElementById('li1')
        ],
        'result'
      );
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 1,
        b: 2,
        reverse: false
      };
      const res = func(nodes, anb);
      assert.deepEqual(
        res,
        [document.getElementById('li2'), document.getElementById('li3')],
        'result'
      );
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 1,
        b: 2,
        reverse: true
      };
      const res = func(nodes, anb);
      assert.deepEqual(
        res,
        [document.getElementById('li3'), document.getElementById('li2')],
        'result'
      );
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 1,
        b: 3,
        reverse: false
      };
      const res = func(nodes, anb);
      assert.deepEqual(res, [document.getElementById('li3')], 'result');
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 1,
        b: 3,
        reverse: true
      };
      const res = func(nodes, anb);
      assert.deepEqual(res, [document.getElementById('li1')], 'result');
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 2,
        b: 0,
        reverse: false
      };
      const res = func(nodes, anb);
      assert.deepEqual(res, [document.getElementById('li2')], 'result');
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 2,
        b: 0,
        reverse: true
      };
      const res = func(nodes, anb);
      assert.deepEqual(res, [document.getElementById('li2')], 'result');
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 2,
        b: 1,
        reverse: false
      };
      const res = func(nodes, anb);
      assert.deepEqual(
        res,
        [document.getElementById('li1'), document.getElementById('li3')],
        'result'
      );
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 2,
        b: 1,
        reverse: true
      };
      const res = func(nodes, anb);
      assert.deepEqual(
        res,
        [document.getElementById('li3'), document.getElementById('li1')],
        'result'
      );
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 2,
        b: 2,
        reverse: false
      };
      const res = func(nodes, anb);
      assert.deepEqual(res, [document.getElementById('li2')], 'result');
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 2,
        b: 2,
        reverse: true
      };
      const res = func(nodes, anb);
      assert.deepEqual(res, [document.getElementById('li2')], 'result');
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 3,
        b: 0,
        reverse: false
      };
      const res = func(nodes, anb);
      assert.deepEqual(res, [document.getElementById('li3')], 'result');
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 3,
        b: 0,
        reverse: true
      };
      const res = func(nodes, anb);
      assert.deepEqual(res, [document.getElementById('li1')], 'result');
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: -1,
        b: 1,
        reverse: false
      };
      const res = func(nodes, anb);
      assert.deepEqual(res, [document.getElementById('li1')], 'result');
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: -1,
        b: 1,
        reverse: true
      };
      const res = func(nodes, anb);
      assert.deepEqual(res, [document.getElementById('li3')], 'result');
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: -1,
        b: 2,
        reverse: false
      };
      const res = func(nodes, anb);
      assert.deepEqual(
        res,
        [document.getElementById('li2'), document.getElementById('li1')],
        'result'
      );
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: -1,
        b: 3,
        reverse: false
      };
      const res = func(nodes, anb);
      assert.deepEqual(
        res,
        [
          document.getElementById('li3'),
          document.getElementById('li2'),
          document.getElementById('li1')
        ],
        'result'
      );
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: -1,
        b: 3,
        reverse: true
      };
      const res = func(nodes, anb);
      assert.deepEqual(
        res,
        [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ],
        'result'
      );
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: -2,
        b: 1,
        reverse: false
      };
      const res = func(nodes, anb);
      assert.deepEqual(res, [document.getElementById('li1')], 'result');
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: -2,
        b: 1,
        reverse: true
      };
      const res = func(nodes, anb);
      assert.deepEqual(res, [document.getElementById('li3')], 'result');
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: -2,
        b: 2,
        reverse: false
      };
      const res = func(nodes, anb);
      assert.deepEqual(res, [document.getElementById('li2')], 'result');
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: -2,
        b: 2,
        reverse: true
      };
      const res = func(nodes, anb);
      assert.deepEqual(res, [document.getElementById('li2')], 'result');
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 2,
        b: -1,
        reverse: false
      };
      const res = func(nodes, anb);
      assert.deepEqual(
        res,
        [document.getElementById('li1'), document.getElementById('li3')],
        'result'
      );
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 2,
        b: -1,
        reverse: true
      };
      const res = func(nodes, anb);
      assert.deepEqual(
        res,
        [document.getElementById('li3'), document.getElementById('li1')],
        'result'
      );
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 2,
        b: -2,
        reverse: false
      };
      const res = func(nodes, anb);
      assert.deepEqual(res, [document.getElementById('li2')], 'result');
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 2,
        b: -2,
        reverse: true
      };
      const res = func(nodes, anb);
      assert.deepEqual(res, [document.getElementById('li2')], 'result');
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 2,
        b: -3,
        reverse: false
      };
      const res = func(nodes, anb);
      assert.deepEqual(
        res,
        [document.getElementById('li1'), document.getElementById('li3')],
        'result'
      );
    });

    it('should get node(s)', () => {
      const ul = document.getElementById('ul1');
      const nodes = [];
      for (const child of ul.children) {
        nodes.push(child);
      }
      const anb = {
        a: 2,
        b: -3,
        reverse: true
      };
      const res = func(nodes, anb);
      assert.deepEqual(
        res,
        [document.getElementById('li3'), document.getElementById('li1')],
        'result'
      );
    });
  });

  describe('resolve content document, root node and tree walker', () => {
    const func = util.resolveContent;

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
      assert.deepEqual(res, [document, document, false]);
    });

    it('should get result', () => {
      const node = document.createDocumentFragment();
      const res = func(node);
      assert.deepEqual(res, [document, node, false]);
    });

    it('should get result', () => {
      const node = document.getElementById('div0');
      const res = func(node);
      assert.deepEqual(res, [document, document, false]);
    });

    it('should get result', () => {
      const frag = document.createDocumentFragment();
      const node = document.createElement('div');
      frag.appendChild(node);
      const res = func(node);
      assert.deepEqual(res, [document, frag, false]);
    });

    it('should get result', () => {
      const parent = document.createElement('div');
      const node = document.createElement('div');
      parent.appendChild(node);
      const res = func(node);
      assert.deepEqual(res, [document, parent, false]);
    });

    it('should get result', () => {
      const domstr = '<foo id="foo"><bar id="bar" /></foo>';
      const doc = new window.DOMParser().parseFromString(domstr, 'text/xml');
      const node = doc.getElementById('bar');
      const res = func(node);
      assert.deepEqual(res, [doc, doc, false]);
    });

    it('should get result', () => {
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

    it('should get result', () => {
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

    it('should throw', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should throw', () => {
      assert.throws(() => func('foo'), TypeError, 'Unexpected type String');
    });

    it('should get null', () => {
      const res = func(document);
      assert.deepEqual(res, null, 'result');
    });

    it('should get matched node', () => {
      const res = func(document, treeWalker);
      assert.deepEqual(res, document, 'result');
    });

    it('should get null', () => {
      const frag = document.createDocumentFragment();
      const res = func(frag, treeWalker);
      assert.deepEqual(res, null, 'result');
    });

    it('should get matched node', () => {
      const node = document.getElementById('ul1');
      const res = func(node, treeWalker);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const node = document.getElementById('ul1');
      func(document.getElementById('li1'), treeWalker);
      const res = func(node, treeWalker);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const node = document.createElement('ol');
      const res = func(node, treeWalker);
      assert.deepEqual(res, null, 'result');
    });

    it('should get matched node', () => {
      const parent = document.createElement('ol');
      const node = document.createElement('li');
      parent.appendChild(node);
      const walker = document.createTreeWalker(parent, SHOW_CONTAINER);
      const res = func(node, walker);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
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

    it('should get matched node', () => {
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

    it('should get matched node', () => {
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

    it('should get null', () => {
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

    it('should throw', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should throw', () => {
      assert.throws(() => func('foo'), TypeError, 'Unexpected type String');
    });

    it('should not match', () => {
      const frag = document.createDocumentFragment();
      const res = func(frag);
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const node = document.createElement('div');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should not match', () => {
      const node = document.createElement('x-div');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should match', () => {
      window.customElements.define(
        'sw-rey',
        class extends window.HTMLElement {}
      );
      const node = document.createElement('sw-rey');
      document.getElementById('div0').appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should not match', () => {
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

    it('should match', () => {
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

    it('should not match', () => {
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

    it('should match', () => {
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

    it('should throw', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should throw', () => {
      assert.throws(() => func('foo'), TypeError, 'Unexpected type String');
    });

    it('should get null', () => {
      const html = '<div id="foo" name="bar">Foo</div>';
      const container = document.getElementById('div0');
      container.innerHTML = html;
      const node = document.getElementById('foo');
      const res = func(node);
      assert.deepEqual(res, null, 'result');
    });

    it('should get value', () => {
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

    it('should get value', () => {
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
      }
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

    it('should throw', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should throw', () => {
      assert.throws(() => func('foo'), TypeError, 'Unexpected type String');
    });

    it('should get null', () => {
      const res = func(document);
      assert.deepEqual(res, null, 'result');
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
      }
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
      }
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
      }
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
      }
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
      }
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
      }
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

  describe('get language attribute', () => {
    const func = util.getLanguageAttribute;

    it('should throw', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should get null', () => {
      const res = func(document);
      assert.strictEqual(res, null, 'result');
    });

    it('should get null', () => {
      const node = document.createElement('div');
      const res = func(node);
      assert.strictEqual(res, null, 'result');
    });

    it('should get empty string', () => {
      const node = document.createElement('div');
      node.setAttribute('lang', '');
      const res = func(node);
      assert.strictEqual(res, '', 'result');
    });

    it('should get null', () => {
      const parent = document.createElement('div');
      const node = document.createElement('div');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, null, 'result');
    });

    it('should get value', () => {
      const parent = document.createElement('div');
      parent.setAttribute('lang', 'en');
      const node = document.createElement('div');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, 'en', 'result');
    });

    it('should get value', () => {
      const src = '<foo id="foo" xml:lang="en"><bar id="bar"/></foo>';
      const doc = new window.DOMParser().parseFromString(src, 'text/xml');
      const node = doc.getElementById('bar');
      const res = func(node);
      assert.strictEqual(res, 'en', 'result');
    });

    it('should get null', () => {
      const frag = document.createDocumentFragment();
      const node = document.createElement('div');
      frag.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, null, 'result');
    });

    it('should get value', () => {
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

    it('should get null', () => {
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

    it('should get value', () => {
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
  });

  describe('is content editable', () => {
    const func = util.isContentEditable;

    it('should throw', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should throw', () => {
      assert.throws(() => func('foo'), TypeError, 'Unexpected type String');
    });

    it('should get false', () => {
      const res = func(document);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('div');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
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

    it('should get true', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      document.designMode = 'on';
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const node = document.createElement('div');
      node.setAttribute('contenteditable', 'true');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const node = document.createElement('div');
      node.setAttribute('contenteditable', 'plaintext-only');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const node = document.createElement('div');
      node.setAttribute('contenteditable', '');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('div');
      node.setAttribute('contenteditable', 'foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('div');
      node.setAttribute('contenteditable', 'inherit');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
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

    it('should get true', () => {
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

    it('should get false', () => {
      const res = func();
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func(document);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      node.style.display = 'none';
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      node.style.visibility = 'hidden';
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      node.style.visibility = 'collapse';
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      node.hidden = true;
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
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

    it('should get false', () => {
      const res = func();
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func(document);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const node = document.createElement('input');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('input');
      node.type = 'radio';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const node = document.createElement('textarea');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
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

    it('should get false', () => {
      const res = func();
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func(document);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func(document.body);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('div');
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('div');
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const node = document.createElement('div');
      node.tabIndex = -1;
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const node = document.createElement('div');
      node.setAttribute('contenteditable', '');
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('div');
      node.setAttribute('contenteditable', 'false');
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('a');
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const node = document.createElement('a');
      node.href = 'about:blank';
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const node = document.createElement('iframe');
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const node = document.createElement('input');
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('input');
      node.disabled = true;
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('input');
      node.setAttribute('disabled', '');
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('input');
      node.hidden = true;
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('input');
      node.setAttribute('hidden', '');
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('summary');
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const parent = document.createElement('details');
      const node = document.createElement('summary');
      parent.appendChild(node);
      document.body.appendChild(parent);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const parent = document.createElement('details');
      const nodeBefore = document.createElement('summary');
      const node = document.createElement('summary');
      parent.appendChild(nodeBefore);
      parent.appendChild(node);
      document.body.appendChild(parent);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const parent = document.createElement('details');
      const nodeBefore = document.createElement('div');
      const node = document.createElement('summary');
      parent.appendChild(nodeBefore);
      parent.appendChild(node);
      document.body.appendChild(parent);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const node = document.createElement('button');
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('button');
      node.disabled = true;
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const node = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      );
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const node = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg'
      );
      node.tabIndex = -1;
      document.body.appendChild(node);
      const res = func(node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
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

    it('should get false', () => {
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

    it('should get true', () => {
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

    it('should get false', () => {
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

    it('should get false', () => {
      const res = func();
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func(document);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
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

    it('should get false', () => {
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

    it('should get false', () => {
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

    it('should get false', () => {
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

    it('should get false', () => {
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

    it('should get false', () => {
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

    it('should get false', () => {
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

    it('should get true', () => {
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

    it('should throw', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should throw', () => {
      assert.throws(() => func([]), TypeError, 'Unexpected type Array');
    });

    it('should throw', () => {
      assert.throws(() => func('foo'), TypeError, 'Unexpected type Undefined');
    });

    it('should throw', () => {
      assert.throws(
        () => func('foo', 'bar'),
        TypeError,
        'Unexpected type String'
      );
    });

    it('should get null', () => {
      const res = func('foo', document);
      assert.deepEqual(res, null, 'result');
    });

    it('should get null', () => {
      const node = document.createElementNS(
        'https://example.com/foo',
        'foo:div'
      );
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func('foo', node);
      assert.deepEqual(res, null, 'result');
    });

    it('should get result', () => {
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

    it('should get null', () => {
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

    it('should get result', () => {
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

    it('should get false', () => {
      const res = func();
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('foo:div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func('foo', node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const node = document.createElementNS(
        'https://example.com/foo',
        'foo:div'
      );
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func('foo', node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const frag = document.createDocumentFragment();
      const node = document.createElementNS(
        'https://example.com/foo',
        'foo:div'
      );
      frag.appendChild(node);
      const res = func('foo', node);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
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

    it('should throw', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should throw', () => {
      assert.throws(() => func('foo'), TypeError, 'Unexpected type String');
    });

    it('should throw', () => {
      const node = document.documentElement;
      assert.throws(() => func(node), TypeError, 'Unexpected type Undefined');
    });

    it('should throw', () => {
      const node = document.documentElement;
      assert.throws(
        () => func(node, 'foo'),
        TypeError,
        'Unexpected type String'
      );
    });

    it('should get true', () => {
      const nodeA = document.createElement('ul');
      const nodeB = document.createElement('li');
      const parent = document.getElementById('div0');
      nodeA.appendChild(nodeB);
      parent.appendChild(nodeA);
      const res = func(nodeA, nodeB);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const nodeA = document.createElement('li');
      const nodeB = document.createElement('ul');
      const parent = document.getElementById('div0');
      nodeB.appendChild(nodeA);
      parent.appendChild(nodeB);
      const res = func(nodeA, nodeB);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
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

    it('should get false', () => {
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

    it('should get false', () => {
      const node = document.createElement('div');
      const base = document.documentElement;
      const res = func(node, base);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const node = document.createElement('div');
      const res = func(node, node);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
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

    it('should get -1', () => {
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

    it('should get 1', () => {
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
      assert.deepEqual([...res], [node1, node2, node3], 'result');
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
      assert.deepEqual([...res], [ul, node1, node2, node3], 'result');
    });

    it('should get matched node(s)', () => {
      const frag = document.createDocumentFragment();
      const node1 = document.createElement('div');
      const node2 = document.createElement('div');
      const node3 = document.createElement('div');
      frag.append(node1, node2, node3);
      const nodes = new Set([node2, node3, node1]);
      const res = func(nodes);
      assert.deepEqual([...res], [node1, node2, node3], 'result');
    });

    it('should get matched node(s)', () => {
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

  describe('concat array of nested selectors into equivalent selector', () => {
    const func = util.concatNestedSelectors;

    it('should throw', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should get empty string', () => {
      const res = func([]);
      assert.strictEqual(res, '', 'result');
    });

    it('should get value', () => {
      const sel = [['&'], ['.foo']];
      const res = func(sel);
      assert.strictEqual(res, ':scope .foo', 'result');
    });

    it('should get value', () => {
      const sel = [['.foo'], ['& > .bar']];
      const res = func(sel);
      assert.strictEqual(res, '.foo > .bar', 'result');
    });

    it('should get value', () => {
      const sel = [['.foo'], [], ['& > .bar']];
      const res = func(sel);
      assert.strictEqual(res, '.foo > .bar', 'result');
    });

    it('should get value', () => {
      const sel = [['.foo'], ['> .baz']];
      const res = func(sel);
      assert.strictEqual(res, '.foo > .baz', 'result');
    });

    it('should get value', () => {
      const sel = [
        ['.foo', '.bar'],
        ['+ .baz', '&.qux']
      ];
      const res = func(sel);
      assert.strictEqual(
        res,
        ':is(.foo, .bar) + .baz, :is(.foo, .bar).qux',
        'result'
      );
    });

    it('should get value', () => {
      const sel = [['.foo'], ['& .bar & .baz & .qux']];
      const res = func(sel);
      assert.strictEqual(res, '.foo .bar .foo .baz .foo .qux', 'result');
    });

    it('should get value', () => {
      const sel = [['.foo'], ['> .bar &', '.baz &']];
      const res = func(sel);
      assert.strictEqual(res, '.foo > .bar .foo, .baz .foo', 'result');
    });

    it('should get value', () => {
      const sel = [['.foo'], ['> .bar &'], ['.baz &'], ['.qux']];
      const res = func(sel);
      assert.strictEqual(res, '.foo > .bar .foo :is(.baz .foo) .qux', 'result');
    });

    it('should get value', () => {
      const sel = [['.foo'], ['> .bar &', '.baz &'], ['.qux']];
      const res = func(sel);
      assert.strictEqual(
        res,
        '.foo > .bar .foo .qux, .baz .foo .qux',
        'result'
      );
    });

    it('should get value', () => {
      const sel = [['.foo'], ['.parent &']];
      const res = func(sel);
      assert.strictEqual(res, '.parent .foo', 'result');
    });

    it('should get value', () => {
      const sel = [['.foo'], [':not(&)']];
      const res = func(sel);
      assert.strictEqual(res, ':not(.foo)', 'result');
    });

    it('should get value', () => {
      const sel = [['.foo'], ['+ .bar + &']];
      const res = func(sel);
      assert.strictEqual(res, '.foo + .bar + .foo', 'result');
    });

    it('should get value', () => {
      const sel = [['.foo'], ['&']];
      const res = func(sel);
      assert.strictEqual(res, '.foo', 'result');
    });

    it('should get value', () => {
      const sel = [['.foo'], ['&&']];
      const res = func(sel);
      assert.strictEqual(res, '.foo.foo', 'result');
    });

    it('should get value', () => {
      const sel = [['.error', '#404'], ['&:hover > .baz']];
      const res = func(sel);
      assert.strictEqual(res, ':is(.error, #404):hover > .baz', 'result');
    });

    it('should get value', () => {
      const sel = [['.ancestor .el'], ['.other-ancestor &']];
      const res = func(sel);
      assert.strictEqual(res, '.other-ancestor :is(.ancestor .el)', 'result');
    });

    it('should get value', () => {
      const sel = [['.foo'], ['& :is(.bar, &.baz)']];
      const res = func(sel);
      assert.strictEqual(res, '.foo :is(.bar, .foo.baz)', 'result');
    });

    it('should get value', () => {
      const sel = [['figure'], ['> figcaption'], ['> p']];
      const res = func(sel);
      assert.strictEqual(res, 'figure > figcaption > p', 'result');
    });
  });

  describe('extract nested selectors from cssText', () => {
    const func = util.extractNestedSelectors;

    it('should get value', () => {
      const css = `
        .foo {
          color: red;
          & .bar, .baz & {
            color: green;
            & .qux &, & > .quux > &, &.corge& {
              color: blue;
            }
          }
        }
      `.trim();
      const res = func(css);
      assert.deepEqual(
        res,
        [['.foo'], ['& .bar', '.baz &'], ['& .qux &', '&>.quux>&', '&.corge&']],
        'result'
      );
    });

    it('should get value', () => {
      const css = `
        html {
          block-size: 100%;

          @layer support {
            & body {
              min-block-size: 100%;
            }
          }
        }
      `.trim();
      const res = func(css);
      assert.deepEqual(res, [['html'], ['& body']], 'result');
    });

    it('should get value', () => {
      const css = `
        html {
          @layer base {
            block-size: 100%;

            @layer support {
              & body {
                min-block-size: 100%;
              }
            }
          }
        }
      `.trim();
      const res = func(css);
      assert.deepEqual(res, [['html'], ['& body']], 'result');
    });

    // upstream issue: https://github.com/csstree/csstree/issues/268
    it.skip('should get value', () => {
      const css = `
        .card {
          inline-size: 40ch;
          aspect-ratio: 3/4;

          @scope (&) {
            :scope {
              border: 1px solid white;
            }
          }
        }
      `.trim();
      const res = func(css);
      assert.deepEqual(res, [[':scope']], 'result');
    });

    it('should get value', () => {
      const css = `
        .parent {
          color: blue;

          @scope (& > .scope) to (& .limit) {
            & .content {
              color: red;
            }
          }
        }
      `.trim();
      const res = func(css);
      assert.deepEqual(
        res,
        [['.parent'], ['&>.scope'], ['& .content']],
        'result'
      );
    });
  });

  describe('init nwsapi', () => {
    const func = util.initNwsapi;

    it('should throw', () => {
      assert.throws(
        () => func(),
        TypeError,
        'Unexpected global object Undefined'
      );
    });

    it('should throw', () => {
      assert.throws(
        () => func(document),
        TypeError,
        'Unexpected global object Document'
      );
    });

    it('should get nwsapi', () => {
      const res = func(window);
      assert.strictEqual(typeof res.match, 'function', 'nwsapi.match');
      assert.strictEqual(typeof res.closest, 'function', 'nwsapi.closest');
      assert.strictEqual(typeof res.first, 'function', 'nwsapi.first');
      assert.strictEqual(typeof res.select, 'function', 'nwsapi.select');
    });

    it('should get nwsapi', () => {
      const res = func(window, document);
      assert.strictEqual(typeof res.match, 'function', 'nwsapi.match');
      assert.strictEqual(typeof res.closest, 'function', 'nwsapi.closest');
      assert.strictEqual(typeof res.first, 'function', 'nwsapi.first');
      assert.strictEqual(typeof res.select, 'function', 'nwsapi.select');
    });

    it('should get nwsapi', () => {
      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      const iframeDocument = iframe.contentDocument;
      const iframeWindow = iframeDocument.defaultView;
      assert.notDeepEqual(window, iframeWindow, 'window');
      const res = func(iframeWindow);
      assert.strictEqual(typeof res.match, 'function', 'nwsapi.match');
      assert.strictEqual(typeof res.closest, 'function', 'nwsapi.closest');
      assert.strictEqual(typeof res.first, 'function', 'nwsapi.first');
      assert.strictEqual(typeof res.select, 'function', 'nwsapi.select');
    });
  });

  describe('filter selector', () => {
    const func = util.filterSelector;

    it('should get false', () => {
      const res = func();
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const res = func('*');
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const res = func('*', TARGET_FIRST);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func('*|*');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func('|*');
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const res = func('p');
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const res = func('ns|p');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func(':not(*|*)');
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const res = func('p.foo', TARGET_ALL);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func('p.foo', TARGET_SELF);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const res = func('.foo', TARGET_ALL);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const res = func('.foo', TARGET_SELF);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const res = func('::slotted');
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const res = func('.foo');
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func('#foo');
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func('[id]');
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const res = func('[id');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func('[ns|id]');
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const res = func('[foo="bar baz"]');
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func('[foo="bar\tbaz"]');
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const res = func('[foo i]');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func('[foo="bar baz" i]');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func('[foo="bar baz" qux i]');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func("[foo='bar baz' qux i]");
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func('[foo="bar \'baz\'" i]');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func('[foo=\'bar "baz"\' i]');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func('[foo="bar baz\']');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func('[foo=\'bar baz"]');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func('[foo="bar baz\' i]');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func('[foo=\'bar baz" i]');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func('[foo bar baz i]');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func('[foo|=bar]');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func(':enabled');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func(':disabled');
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const res = func(':read-only');
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func(':read-write');
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func(':empty');
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func(':indeterminate');
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const res = func(':root');
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const res = func(':target');
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const res = func(':visited');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func(':after');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func(':host');
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const res = func('.foo + .bar');
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func(':first-child :last-child');
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const res = func(':first-child :last-child', TARGET_ALL);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const res = func(':is(.foo, .bar)');
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const res = func(':is(.foo .bar, .bar)', TARGET_ALL);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const res = func(':is(.foo .bar, .bar)', TARGET_SELF);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func(':is(.foo .bar, .bar)', TARGET_LINEAL);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func(':nth-child(even)');
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func(':nth-of-type( odd )');
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const res = func(':nth-child(foo)');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func(':nth-child(even of .foo)');
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const res = func(':nth-child(2)');
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func(':nth-child(-1)');
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func(':nth-child(n)');
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func(':nth-child(+n)');
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func(':nth-child(-n)');
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func(':nth-child(2n+1)');
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func(':nth-child(2n + 1)');
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func(':nth-child(-2n - 1)');
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const res = func(':nth-child(n of .foo)');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func(':nth-child(2n+1 of .foo)');
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const res = func(':not(p)');
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func(':is( p, div )');
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const res = func(':is(:nth-child(2n+1), :nth-child(3n+1))');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func(':is()');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func(':is( )');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func(':where()');
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const res = func(':not(p.foo, div.bar)');
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const res = func(':not(.foo .bar)', TARGET_ALL);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const res = func(':not(.foo .bar)', TARGET_SELF);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func(':not(.foo .bar)', TARGET_LINEAL);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func(':not(.foo > .bar)', TARGET_SELF);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func(':not(.foo > .bar)', TARGET_LINEAL);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func(':not(.foo > .bar)', TARGET_SELF);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func(':not(.foo > .bar)', TARGET_LINEAL);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func(':not(:is(.foo, .bar))');
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const res = func(':not(:not(.foo, .bar))');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func(':not(:is(.foo > .bar))', TARGET_ALL);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const res = func(':not(:is(.foo > .bar))', TARGET_SELF);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func(':not(:is(.foo > .bar))', TARGET_LINEAL);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const res = func(':not(:is(.foo .bar))', TARGET_ALL);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const res = func(':not(:is(.foo .bar))', TARGET_SELF);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func(':not(:is(.foo .bar))', TARGET_LINEAL);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const res = func(':is(:not(:is(.foo, .bar)), .baz)', TARGET_ALL);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func(':is(:not(:is(.foo, .bar)), .baz)', TARGET_SELF);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func(':is(:not(:is(.foo, .bar)), .baz)', TARGET_LINEAL);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func('\u212A');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func('div:nth-child(odd of :not(.c))');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func(':nth-child()');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func(':has(.foo)');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func('.bar :has(.foo)', TARGET_ALL);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func(':has(.foo)', TARGET_SELF);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const res = func('.bar :has(.foo)', TARGET_SELF);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const res = func('.bar :has(:checked)', TARGET_SELF);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const res = func('.bar :has(>.foo)', TARGET_SELF);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const res = func('.bar :has(+.foo)', TARGET_SELF);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func('.baz :has(.foo .bar)', TARGET_SELF);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func(':has(.foo)', TARGET_LINEAL);
      assert.strictEqual(res, false, 'result');
    });

    it('should get true', () => {
      const res = func('.bar :has(.foo)', TARGET_LINEAL);
      assert.strictEqual(res, true, 'result');
    });

    it('should get true', () => {
      const res = func('.bar :has(>.foo)', TARGET_LINEAL);
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const res = func('.baz :has(>.foo) .bar', TARGET_LINEAL);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func('.bar :has(+.foo)', TARGET_LINEAL);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func('.baz :has(.foo .bar)', TARGET_LINEAL);
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func('/* comment */.foo');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func('// invalid comment //.foo');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func('#null');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func('.null');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func('#undefined');
      assert.strictEqual(res, false, 'result');
    });

    it('should get false', () => {
      const res = func('.undefined');
      assert.strictEqual(res, false, 'result');
    });
  });
});
