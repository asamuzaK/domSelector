/**
 * pseudo-class.test.js
 */

/* api */
import { strict as assert } from 'node:assert';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';

/* test */
import { PseudoClassEvaluator } from '../src/js/pseudo-class.js';

/* constants */
import {
  ATTR_SELECTOR,
  CLASS_SELECTOR,
  COMBINATOR,
  IDENT,
  ID_SELECTOR,
  NOT_SUPPORTED_ERR,
  NTH,
  PS_CLASS_SELECTOR,
  SELECTOR,
  SYNTAX_ERR,
  TYPE_SELECTOR
} from '../src/js/constant.js';
const AN_PLUS_B = 'AnPlusB';
const SELECTOR_LIST = 'SelectorList';

describe('PseudoClassEvaluator', () => {
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

  let window, document, mockEvaluator, pseudoEvaluator;

  beforeEach(() => {
    const dom = new JSDOM(domStr, domOpt);
    window = dom.window;
    document = dom.window.document;
    mockEvaluator = {
      window,
      document,
      root: document,
      node: document,
      shadow: false,
      warn: false,
      onError: sinon.spy(e => {
        const isDOMException =
          e instanceof DOMException || e instanceof window.DOMException;
        if (isDOMException) {
          throw new window.DOMException(e.message, e.name);
        }
        if (e.name in window) {
          throw new window[e.name](e.message, { cause: e });
        }
        throw e;
      }),
      matchLeaves: sinon.stub().callsFake((leaves, node) => {
        if (!leaves || !leaves.length) {
          return true;
        }
        const [leaf] = leaves;
        if (leaf.type === TYPE_SELECTOR) {
          return leaf.name === '*' || node.localName === leaf.name;
        }
        if (leaf.type === ID_SELECTOR) {
          return node.id === leaf.name;
        }
        if (leaf.type === CLASS_SELECTOR) {
          return node.classList.contains(leaf.name);
        }
        return true;
      }),
      getFilterLeaves: sinon.stub().callsFake(leaves => leaves.slice(1)),
      createTreeWalker: (node, opt) =>
        document.createTreeWalker(node, opt?.whatToShow ?? 1),
      yieldCombinatorMatches: function* (twig, node, opt) {
        const { combo, leaves } = twig;
        if (combo.name === '>') {
          if (opt?.dir === 'prev') {
            if (
              node.parentNode &&
              mockEvaluator.matchLeaves(leaves, node.parentNode)
            ) {
              yield node.parentNode;
            }
          } else {
            let child = node.firstElementChild;
            while (child) {
              if (mockEvaluator.matchLeaves(leaves, child)) {
                yield child;
              }
              child = child.nextElementSibling;
            }
          }
        } else if (combo.name === ' ') {
          if (opt?.dir === 'prev') {
            let parent = node.parentNode;
            while (parent) {
              if (mockEvaluator.matchLeaves(leaves, parent)) {
                yield parent;
              }
              parent = parent.parentNode;
            }
          }
        }
      }
    };
    pseudoEvaluator = new PseudoClassEvaluator(mockEvaluator);
  });

  afterEach(() => {
    window.close();
    window = null;
    document = null;
  });

  describe('reset & clearResults', () => {
    it('should clear cached results without throwing', () => {
      assert.doesNotThrow(() => {
        pseudoEvaluator.clearResults(true);
        pseudoEvaluator.reset();
      });
    });
  });

  describe('AST Cache', () => {
    it('should return cached branches', () => {
      const parent1 = document.createElement('div');
      const child1 = document.createElement('div');
      child1.className = 'cache-target';
      parent1.appendChild(child1);
      document.getElementById('div0').appendChild(parent1);
      const parent2 = document.createElement('div');
      const child2 = document.createElement('div');
      child2.className = 'cache-target';
      parent2.appendChild(child2);
      document.getElementById('div0').appendChild(parent2);
      const ast = {
        name: 'nth-child',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            nth: { a: '1', b: '0', type: 'AnPlusB' },
            selector: {
              type: 'SelectorList',
              children: [
                {
                  type: 'Selector',
                  children: [{ name: 'cache-target', type: CLASS_SELECTOR }]
                }
              ]
            },
            type: 'Nth'
          }
        ]
      };
      const res1 = pseudoEvaluator.matchPseudoClassSelector(ast, child1, {});
      assert.strictEqual(res1, true, 'first child matches and populates cache');
      const res2 = pseudoEvaluator.matchPseudoClassSelector(ast, child2, {});
      assert.strictEqual(
        res2,
        true,
        'second child matches using cached branches'
      );
    });
  });

  describe('#evaluatePseudoClassFunc', () => {
    let node;

    beforeEach(() => {
      node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
    });

    afterEach(() => {
      node.remove();
      if (mockEvaluator.onError.resetHistory) {
        mockEvaluator.onError.resetHistory();
      }
    });

    it('throws SyntaxError for invalid nth-* pseudo-class', () => {
      const ast = { name: 'nth-child', type: PS_CLASS_SELECTOR, children: [] };
      assert.throws(
        () => pseudoEvaluator.matchPseudoClassSelector(ast, node, {}),
        e => {
          assert.strictEqual(e.name, SYNTAX_ERR);
          return true;
        }
      );
    });

    it('throws SyntaxError for invalid :dir() pseudo-class', () => {
      const ast = { name: 'dir', type: PS_CLASS_SELECTOR, children: [] };
      assert.throws(
        () => pseudoEvaluator.matchPseudoClassSelector(ast, node, {}),
        e => {
          assert.strictEqual(e.name, SYNTAX_ERR);
          return true;
        }
      );
    });

    it('should throw SyntaxError for empty :lang() pseudo-class', () => {
      const ast = { name: 'lang', type: PS_CLASS_SELECTOR, children: [] };
      assert.throws(
        () => pseudoEvaluator.matchPseudoClassSelector(ast, node, {}),
        e => {
          assert.strictEqual(e.name, SYNTAX_ERR);
          return true;
        }
      );
    });

    it('evaluates :dir() correctly using matcher', () => {
      node.setAttribute('dir', 'ltr');
      const ast = {
        name: 'dir',
        type: PS_CLASS_SELECTOR,
        children: [{ value: 'ltr', name: 'ltr', type: IDENT }]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, node, {}),
        true
      );
    });

    it('evaluates :lang() correctly using matcher', () => {
      node.setAttribute('lang', 'ja');
      const ast = {
        name: 'lang',
        type: PS_CLASS_SELECTOR,
        children: [{ value: 'ja', name: 'ja', type: IDENT }]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, node, {}),
        true
      );
    });

    it('matches :state() via ElementInternals', () => {
      if (!window.customElements.get('state-internals-element')) {
        window.customElements.define(
          'state-internals-element',
          class extends window.HTMLElement {}
        );
      }
      const customEl = document.createElement('state-internals-element');
      document.getElementById('div0').appendChild(customEl);
      class MockElementInternals {
        constructor() {
          this.states = new Set(['my-state']);
        }
      }
      window.ElementInternals = MockElementInternals;
      customEl._internals = new MockElementInternals();
      const ast = {
        name: 'state',
        type: PS_CLASS_SELECTOR,
        children: [{ value: 'my-state', name: 'my-state', type: IDENT }]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, customEl, {}),
        true,
        'matches when state exists in ElementInternals'
      );
      customEl.remove();
    });

    it('fails for :state() when ElementInternals lacks the state', () => {
      if (!window.customElements.get('state-internals-fail-element')) {
        window.customElements.define(
          'state-internals-fail-element',
          class extends window.HTMLElement {}
        );
      }
      const customEl = document.createElement('state-internals-fail-element');
      document.getElementById('div0').appendChild(customEl);
      class MockElementInternals {
        constructor() {
          this.states = new Set(['other-state']);
        }
      }
      window.ElementInternals = MockElementInternals;
      customEl._internals = new MockElementInternals();
      const ast = {
        name: 'state',
        type: PS_CLASS_SELECTOR,
        children: [{ value: 'my-state', name: 'my-state', type: IDENT }]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, customEl, {}),
        false,
        'fails and breaks loop when state is missing in ElementInternals'
      );
      customEl.remove();
    });

    it('matches :state() via direct element property', () => {
      if (!window.customElements.get('state-direct-element')) {
        window.customElements.define(
          'state-direct-element',
          class extends window.HTMLElement {}
        );
      }
      const customEl = document.createElement('state-direct-element');
      document.getElementById('div0').appendChild(customEl);
      customEl.activeState = true;
      const ast = {
        name: 'state',
        type: PS_CLASS_SELECTOR,
        children: [{ value: 'activeState', name: 'activeState', type: IDENT }]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, customEl, {}),
        true,
        'matches when the custom element has the state property directly'
      );
      customEl.remove();
    });

    it('fails for :state() when stateValue is missing', () => {
      if (!window.customElements.get('state-no-val-element')) {
        window.customElements.define(
          'state-no-val-element',
          class extends window.HTMLElement {}
        );
      }
      const customEl = document.createElement('state-no-val-element');
      document.getElementById('div0').appendChild(customEl);
      const ast = {
        name: 'state',
        type: PS_CLASS_SELECTOR,
        children: [{}]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, customEl, {}),
        false,
        'fails when AST stateValue is empty'
      );
      customEl.remove();
    });

    it('fails for :state() on non-custom elements', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const ast = {
        name: 'state',
        type: PS_CLASS_SELECTOR,
        children: [{ value: 'someState', name: 'someState', type: IDENT }]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, node, {}),
        false,
        'returns false for non-custom elements'
      );
      node.remove();
    });

    it('fails for :state() on custom element missing state', () => {
      if (!window.customElements.get('missing-state-element')) {
        window.customElements.define(
          'missing-state-element',
          class extends window.HTMLElement {}
        );
      }
      const customEl = document.createElement('missing-state-element');
      document.getElementById('div0').appendChild(customEl);
      const ast = {
        name: 'state',
        type: PS_CLASS_SELECTOR,
        children: [
          { value: 'nonExistentState', name: 'nonExistentState', type: IDENT }
        ]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, customEl, {}),
        false,
        'returns false when custom element lacks the specified state'
      );
      customEl.remove();
    });

    it('fails for ignored pseudo-class functions like :host', () => {
      const ast = {
        name: 'host',
        type: PS_CLASS_SELECTOR,
        children: [{ value: 'div' }]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, node, {}),
        false
      );
    });

    it('warns for unsupported pseudo-class functions', () => {
      const ast = {
        name: 'nth-col',
        type: PS_CLASS_SELECTOR,
        children: [{ value: '1', name: '1', type: IDENT }]
      };
      assert.throws(
        () =>
          pseudoEvaluator.matchPseudoClassSelector(ast, node, { warn: true }),
        e => {
          assert.strictEqual(e.name, NOT_SUPPORTED_ERR);
          return true;
        }
      );
      assert.strictEqual(
        mockEvaluator.onError.calledOnce,
        true,
        'onError was called'
      );
    });

    it('throws SyntaxError for unknown pseudo-class', () => {
      const ast = {
        name: 'unknown-func',
        type: PS_CLASS_SELECTOR,
        children: [{ value: 'abc', name: 'abc', type: IDENT }]
      };
      assert.throws(
        () => pseudoEvaluator.matchPseudoClassSelector(ast, node, {}),
        e => {
          assert.strictEqual(e.name, SYNTAX_ERR);
          return true;
        }
      );
    });

    it('fails for unknown pseudo-class with forgive option', () => {
      const ast = {
        name: 'unknown-func',
        type: PS_CLASS_SELECTOR,
        children: [{ value: 'abc', name: 'abc', type: IDENT }]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, node, { forgive: true }),
        false
      );
    });
  });

  describe('match *-child pseudo-classes', () => {
    let parentMulti, child1, child2, child3;
    let parentSingle, singleChild;
    let astFirst, astLast, astOnly;

    beforeEach(() => {
      parentMulti = document.createElement('div');
      child1 = document.createElement('div');
      child2 = document.createElement('div');
      child3 = document.createElement('div');
      parentMulti.appendChild(child1);
      parentMulti.appendChild(child2);
      parentMulti.appendChild(child3);
      parentSingle = document.createElement('div');
      singleChild = document.createElement('div');
      parentSingle.appendChild(singleChild);
      document.getElementById('div0').appendChild(parentMulti);
      document.getElementById('div0').appendChild(parentSingle);
      astFirst = { name: 'first-child', type: PS_CLASS_SELECTOR };
      astLast = { name: 'last-child', type: PS_CLASS_SELECTOR };
      astOnly = { name: 'only-child', type: PS_CLASS_SELECTOR };
    });

    afterEach(() => {
      parentMulti.remove();
      parentSingle.remove();
    });

    it('matches detached node if it is root', () => {
      const rootNode = document.createElement('div');
      const originalRoot = mockEvaluator.root;
      mockEvaluator.root = rootNode;
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astFirst, rootNode, {}),
        true,
        'matches detached root node'
      );
      const detachedNode = document.createElement('div');
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astFirst, detachedNode, {}),
        false,
        'fails for detached non-root node'
      );
      mockEvaluator.root = originalRoot;
    });

    it('matches :first-child correctly', () => {
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astFirst, child1, {}),
        true,
        'matches first element child'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astFirst, child2, {}),
        false,
        'fails for middle element child'
      );
    });

    it('matches :last-child correctly', () => {
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astLast, child3, {}),
        true,
        'matches last element child'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astLast, child2, {}),
        false,
        'fails for middle element child'
      );
    });

    it('matches :only-child correctly', () => {
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astOnly, singleChild, {}),
        true,
        'matches element that is the only child'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astOnly, child1, {}),
        false,
        'fails for first element with siblings'
      );
    });
  });

  describe('match *-of-type pseudo-classes', () => {
    let parent, span1, span2, p1, p2, divOnly;
    let astFirst, astLast, astOnly;

    beforeEach(() => {
      parent = document.createElement('div');
      span1 = document.createElement('span');
      p1 = document.createElement('p');
      span2 = document.createElement('span');
      p2 = document.createElement('p');
      divOnly = document.createElement('div');
      parent.appendChild(span1);
      parent.appendChild(p1);
      parent.appendChild(span2);
      parent.appendChild(p2);
      parent.appendChild(divOnly);
      document.getElementById('div0').appendChild(parent);
      astFirst = { name: 'first-of-type', type: PS_CLASS_SELECTOR };
      astLast = { name: 'last-of-type', type: PS_CLASS_SELECTOR };
      astOnly = { name: 'only-of-type', type: PS_CLASS_SELECTOR };
    });

    afterEach(() => {
      parent.remove();
    });

    it('matches node without parent if it is root', () => {
      const rootNode = document.createElement('div');
      const originalRoot = mockEvaluator.root;
      mockEvaluator.root = rootNode;
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astFirst, rootNode, {}),
        true,
        'returns true when node is root'
      );
      const detachedNode = document.createElement('div');
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astFirst, detachedNode, {}),
        false,
        'returns false when node is not root'
      );
      mockEvaluator.root = originalRoot;
    });

    it('matches :first-of-type correctly', () => {
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astFirst, span1, {}),
        true,
        'matches the first span'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astFirst, span2, {}),
        false,
        'fails for the second span'
      );
    });

    it('matches :last-of-type correctly', () => {
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astLast, span2, {}),
        true,
        'matches the last span'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astLast, span1, {}),
        false,
        'fails for the first span'
      );
    });

    it('matches :only-of-type correctly', () => {
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astOnly, divOnly, {}),
        true,
        'matches the only div'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astOnly, span1, {}),
        false,
        'fails when next sibling of same type exists'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astOnly, span2, {}),
        false,
        'fails when previous sibling of same type exists'
      );
    });

    it('ignores siblings of different types', () => {
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astFirst, p1, {}),
        true,
        'ignores preceding siblings of different types'
      );
    });
  });

  describe('match :active pseudo-class', () => {
    let parent, child, outside;

    beforeEach(() => {
      parent = document.createElement('div');
      child = document.createElement('span');
      outside = document.createElement('div');

      parent.appendChild(child);
      const container = document.getElementById('div0') || document.body;
      container.appendChild(parent);
      container.appendChild(outside);
    });

    afterEach(() => {
      parent.remove();
      outside.remove();
    });

    it('matches mousedown with primary button on target', () => {
      mockEvaluator.eventHandler = {
        currentEvent: {
          type: 'mousedown',
          buttons: 1,
          target: child
        }
      };
      const ast = { name: 'active', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, child, {}),
        true,
        'returns true for the target node itself'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
        true,
        'returns true for ancestor of target'
      );
    });

    it('should return false when event type is not mousedown', () => {
      mockEvaluator.eventHandler = {
        currentEvent: {
          type: 'mouseup',
          buttons: 1,
          target: child
        }
      };
      const ast = { name: 'active', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, child, {}),
        false,
        'returns false for non-mousedown event'
      );
    });

    it('fails when primary button is not pressed', () => {
      mockEvaluator.eventHandler = {
        currentEvent: {
          type: 'mousedown',
          buttons: 2,
          target: child
        }
      };
      const ast = { name: 'active', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, child, {}),
        false,
        'returns false when primary button is not pressed'
      );
    });

    it('should return false when node does not contain target', () => {
      mockEvaluator.eventHandler = {
        currentEvent: {
          type: 'mousedown',
          buttons: 1,
          target: child
        }
      };
      const ast = { name: 'active', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, outside, {}),
        false,
        'returns false for element outside the target tree'
      );
    });

    it('fails if currentEvent is null or target is not element', () => {
      mockEvaluator.eventHandler = { currentEvent: null };
      const ast = { name: 'active', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, child, {}),
        false,
        'returns false when currentEvent is null'
      );
      const textNode = document.createTextNode('text');
      child.appendChild(textNode);
      mockEvaluator.eventHandler = {
        currentEvent: {
          type: 'mousedown',
          buttons: 1,
          target: textNode
        }
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, child, {}),
        false,
        'returns false when target is not an ELEMENT_NODE'
      );
    });
  });

  describe('match :any-link and :link pseudo-class', () => {
    it('should match <a> element with href attribute against :any-link', () => {
      const leaf = {
        children: null,
        name: 'any-link',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('a');
      node.setAttribute('href', 'https://example.com/');
      document.getElementById('div0').appendChild(node);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(leaf, node, {}),
        true,
        'result'
      );
    });
  });

  describe('match :checked pseudo-class', () => {
    it('should match :checked for checkbox with checked attribute', () => {
      const leaf = {
        children: null,
        name: 'checked',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'checkbox');
      node.setAttribute('checked', 'checked');
      node.checked = true;
      document.getElementById('div0').appendChild(node);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(leaf, node, {}),
        true,
        'result'
      );
    });
  });

  describe('match :default pseudo-class', () => {
    let form,
      button1,
      button2,
      resetButton,
      inputSubmit,
      inputCheck,
      option1,
      option2;

    beforeEach(() => {
      form = document.createElement('form');
      const select = document.createElement('select');
      option1 = document.createElement('option');
      option1.setAttribute('selected', 'selected');
      option2 = document.createElement('option');
      select.appendChild(option1);
      select.appendChild(option2);
      inputCheck = document.createElement('input');
      inputCheck.setAttribute('type', 'checkbox');
      inputCheck.setAttribute('checked', 'checked');
      button1 = document.createElement('button');
      button2 = document.createElement('button');
      resetButton = document.createElement('button');
      resetButton.setAttribute('type', 'reset');
      inputSubmit = document.createElement('input');
      inputSubmit.setAttribute('type', 'submit');
      form.appendChild(select);
      form.appendChild(inputCheck);
      form.appendChild(button1);
      form.appendChild(button2);
      form.appendChild(resetButton);
      form.appendChild(inputSubmit);
      const container = document.getElementById('div0') || document.body;
      container.appendChild(form);
    });

    afterEach(() => {
      form.remove();
    });

    it('matches <option> with selected attribute', () => {
      const ast = { name: 'default', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, option1, {}),
        true,
        'returns true for <option selected>'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, option2, {}),
        false,
        'returns false for <option> without selected attribute'
      );
    });

    it('should return true for <input type="checkbox" checked>', () => {
      const ast = { name: 'default', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, inputCheck, {}),
        true,
        'returns true for checkbox with checked attribute'
      );
    });

    it('matches only the first submit button in form', () => {
      const ast = { name: 'default', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, button1, {}),
        true,
        'returns true for the first button in form'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, button2, {}),
        false,
        'returns false for subsequent buttons in form'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, resetButton, {}),
        false,
        'returns false for reset button'
      );
    });

    it('fails for submit button outside of form', () => {
      const standaloneButton = document.createElement('button');
      document.body.appendChild(standaloneButton);
      const ast = { name: 'default', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, standaloneButton, {}),
        false,
        'returns false for button outside of a form'
      );
      standaloneButton.remove();
    });

    it('should return false for unhandled element types', () => {
      const div = document.createElement('div');
      const ast = { name: 'default', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, div, {}),
        false,
        'returns false for div element'
      );
    });

    it('skips reset/button types when finding default submit', () => {
      const form2 = document.createElement('form');
      const btnReset = document.createElement('button');
      btnReset.setAttribute('type', 'reset');
      const btnButton = document.createElement('button');
      btnButton.setAttribute('type', 'button');
      const btnSubmit = document.createElement('button');
      form2.appendChild(btnReset);
      form2.appendChild(btnButton);
      form2.appendChild(btnSubmit);
      document.getElementById('div0').appendChild(form2);
      const ast = { name: 'default', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, btnReset, {}),
        false,
        'fails for button with type=reset'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, btnButton, {}),
        false,
        'fails for button with type=button'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, btnSubmit, {}),
        true,
        'matches valid submit button'
      );
      form2.remove();
    });

    it('matches :default for <input type="submit">', () => {
      const ast = { name: 'default', type: PS_CLASS_SELECTOR };
      const form = document.createElement('form');
      const inputText = document.createElement('input');
      inputText.setAttribute('type', 'text');
      const inputSubmit = document.createElement('input');
      inputSubmit.setAttribute('type', 'submit');
      const inputImage = document.createElement('input');
      inputImage.setAttribute('type', 'image');
      form.appendChild(inputText);
      form.appendChild(inputSubmit);
      form.appendChild(inputImage);
      document.getElementById('div0').appendChild(form);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, inputText, {}),
        false,
        'fails for non-submit <input>'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, inputSubmit, {}),
        true,
        'matches first <input type="submit">'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, inputImage, {}),
        false,
        'fails for subsequent <input type="image">'
      );
      form.remove();
    });
  });

  describe('match :defined pseudo-class', () => {
    let ast;

    beforeEach(() => {
      ast = { name: 'defined', type: PS_CLASS_SELECTOR };
    });

    it('matches standard HTML elements', () => {
      const div = document.createElement('div');
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, div, {}),
        true,
        'matches HTMLElement'
      );
    });

    it('matches standard SVG elements', () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, svg, {}),
        true,
        'matches SVGElement'
      );
    });

    it('fails for elements that are neither HTML nor SVG', () => {
      const math = document.createElementNS(
        'http://www.w3.org/1998/Math/MathML',
        'math'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, math, {}),
        false,
        'fails for MathMLElement'
      );
    });

    it('matches defined autonomous custom elements', () => {
      const tagName = 'defined-auto-el';
      if (!window.customElements.get(tagName)) {
        window.customElements.define(
          tagName,
          class extends window.HTMLElement {}
        );
      }
      const el = document.createElement(tagName);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, el, {}),
        true,
        'matches defined custom element'
      );
    });

    it('fails for undefined autonomous custom elements', () => {
      const el = document.createElement('undefined-auto-el');
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, el, {}),
        false,
        'fails for undefined custom element'
      );
    });

    it('matches defined customized built-in elements', () => {
      const isName = 'defined-builtin-el';
      if (!window.customElements.get(isName)) {
        window.customElements.define(
          isName,
          class extends window.HTMLDivElement {},
          { extends: 'div' }
        );
      }
      const el = document.createElement('div', { is: isName });
      el.setAttribute('is', isName);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, el, {}),
        true,
        'matches defined customized built-in element'
      );
    });

    it('fails for undefined customized built-in elements', () => {
      const el = document.createElement('div');
      el.setAttribute('is', 'undefined-builtin-el');
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, el, {}),
        false,
        'fails for undefined customized built-in element'
      );
    });
  });

  describe('match :disabled and :enabled pseudo-classes', () => {
    let astDisabled, astEnabled;

    beforeEach(() => {
      astDisabled = { name: 'disabled', type: PS_CLASS_SELECTOR };
      astEnabled = { name: 'enabled', type: PS_CLASS_SELECTOR };
    });

    it('should return false for elements that cannot be disabled', () => {
      const div = document.createElement('div');
      div.setAttribute('disabled', 'disabled');
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astDisabled, div, {}),
        false,
        'returns false for div even with disabled attribute'
      );
    });

    it('matches :disabled on disabled property or attribute', () => {
      const input = document.createElement('input');
      input.disabled = true;
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astDisabled, input, {}),
        true,
        'matches :disabled for disabled input'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astEnabled, input, {}),
        false,
        'fails :enabled for disabled input'
      );
    });

    it('should inherit disabled state from parent <optgroup>', () => {
      const optgroup = document.createElement('optgroup');
      optgroup.disabled = true;
      const option = document.createElement('option');
      optgroup.appendChild(option);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astDisabled, option, {}),
        true,
        'option inherits disabled state from optgroup'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astEnabled, option, {}),
        false,
        'option inherits disabled state from optgroup'
      );
    });

    it('should inherit disabled state from ancestor <fieldset>', () => {
      const fieldset = document.createElement('fieldset');
      fieldset.disabled = true;
      const input = document.createElement('input');
      fieldset.appendChild(input);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astDisabled, input, {}),
        true,
        'input inherits disabled state from disabled fieldset'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astEnabled, input, {}),
        false,
        'input inherits disabled state from disabled fieldset'
      );
    });

    it('ignores disabled state inside first <legend>', () => {
      const fieldset = document.createElement('fieldset');
      fieldset.disabled = true;
      const legend = document.createElement('legend');
      const inputInLegend = document.createElement('input');
      legend.appendChild(inputInLegend);
      fieldset.appendChild(legend);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(
          astDisabled,
          inputInLegend,
          {}
        ),
        false,
        'element in first legend is not disabled by fieldset'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astEnabled, inputInLegend, {}),
        true,
        'element in first legend remains enabled'
      );
    });

    it('inherits disabled state inside second <legend>', () => {
      const fieldset = document.createElement('fieldset');
      fieldset.disabled = true;
      const legend1 = document.createElement('legend');
      const legend2 = document.createElement('legend');
      const inputInSecondLegend = document.createElement('input');
      legend2.appendChild(inputInSecondLegend);
      fieldset.appendChild(legend1);
      fieldset.appendChild(legend2);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(
          astDisabled,
          inputInSecondLegend,
          {}
        ),
        true,
        'element in second legend is disabled by fieldset'
      );
    });

    it('inherits disabled state from parent <optgroup>', () => {
      const ast = { name: 'disabled', type: PS_CLASS_SELECTOR };
      const select = document.createElement('select');
      const optgroup = document.createElement('optgroup');
      const option = document.createElement('option');
      optgroup.appendChild(option);
      select.appendChild(optgroup);
      document.getElementById('div0').appendChild(select);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, option, {}),
        false,
        'fails when parent optgroup is not disabled'
      );
      optgroup.setAttribute('disabled', '');
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, option, {}),
        true,
        'matches when parent optgroup has disabled attribute'
      );
      optgroup.removeAttribute('disabled');
      optgroup.disabled = true;
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, option, {}),
        true,
        'matches when parent optgroup disabled property is true'
      );
      select.remove();
    });

    it('inherits disabled state from ancestor <fieldset>', () => {
      const ast = { name: 'disabled', type: PS_CLASS_SELECTOR };
      const fieldset = document.createElement('fieldset');
      const div = document.createElement('div');
      const input = document.createElement('input');
      div.appendChild(input);
      fieldset.appendChild(div);
      document.getElementById('div0').appendChild(fieldset);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, input, {}),
        false,
        'fails when ancestor fieldset is not disabled'
      );
      fieldset.setAttribute('disabled', '');
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, input, {}),
        true,
        'matches when ancestor fieldset has disabled attribute'
      );
      fieldset.removeAttribute('disabled');
      fieldset.disabled = true;
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, input, {}),
        true,
        'matches when ancestor fieldset disabled property is true'
      );
      fieldset.remove();
    });
  });

  describe('match :empty pseudo-class', () => {
    let ast;

    beforeEach(() => {
      ast = { name: 'empty', type: PS_CLASS_SELECTOR };
    });

    it('should return true when node has no child nodes at all', () => {
      const div = document.createElement('div');
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, div, {}),
        true,
        'returns true for completely empty element'
      );
    });

    it('should return false when node contains an element node', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      parent.appendChild(child);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
        false,
        'returns false when element node exists inside'
      );
    });

    it('should return false when node contains a text node', () => {
      const div = document.createElement('div');
      div.textContent = ' ';
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, div, {}),
        false,
        'returns false when text node exists inside'
      );
    });

    it('should return true when node contains ONLY comment nodes', () => {
      const div = document.createElement('div');
      const comment = document.createComment('this is a comment');
      div.appendChild(comment);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, div, {}),
        true,
        'returns true when element contains only comment nodes'
      );
    });
  });

  describe('match :focus pseudo-class', () => {
    let focusableInput, nonFocusableDiv;

    beforeEach(() => {
      focusableInput = document.createElement('input');
      nonFocusableDiv = document.createElement('div');
      const container = document.getElementById('div0') || document.body;
      container.appendChild(focusableInput);
      container.appendChild(nonFocusableDiv);
    });

    afterEach(() => {
      focusableInput.remove();
      nonFocusableDiv.remove();
    });

    it('matches focusable activeElement', () => {
      focusableInput.focus();
      const ast = { name: 'focus', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, focusableInput, {}),
        true,
        'returns true when node is activeElement and isFocusableArea'
      );
    });

    it('should return false when node is not activeElement', () => {
      focusableInput.focus();
      const ast = { name: 'focus', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, nonFocusableDiv, {}),
        false,
        'returns false when node is not the activeElement'
      );
    });

    it('should return false when document.activeElement is null', () => {
      const originalDocument = mockEvaluator.document;
      mockEvaluator.document = { activeElement: null };
      focusableInput.focus();
      const ast = { name: 'focus', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, focusableInput, {}),
        false,
        'returns false when document.activeElement is null'
      );
      mockEvaluator.document = originalDocument;
    });

    describe('Shadow DOM activeElement traversal', () => {
      it('should return true for focusable node inside Shadow DOM', () => {
        const host = document.createElement('div');
        document.body.appendChild(host);
        if (typeof host.attachShadow !== 'function') {
          host.remove();
          this.skip();
        }
        const shadowRoot = host.attachShadow({ mode: 'open' });
        const shadowInput = document.createElement('input');
        shadowRoot.appendChild(shadowInput);
        shadowInput.focus();
        const ast = { name: 'focus', type: PS_CLASS_SELECTOR };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, shadowInput, {}),
          true,
          'returns true for focusable element inside active ShadowRoot'
        );
        host.remove();
      });

      it('should return true for shadow host when host === node', () => {
        const host = document.createElement('div');
        document.body.appendChild(host);
        if (typeof host.attachShadow !== 'function') {
          host.remove();
          this.skip();
        }
        const shadowRoot = host.attachShadow({ mode: 'open' });
        const shadowInput = document.createElement('input');
        shadowRoot.appendChild(shadowInput);
        shadowInput.focus();
        const ast = { name: 'focus', type: PS_CLASS_SELECTOR };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, host, {}),
          true,
          'returns true for shadow host element matching active inner element'
        );
        host.remove();
      });
    });

    describe('Shadow DOM activeElement nested and edge cases', () => {
      it('should not match unrelated focusable elements when shadow DOM has focus', () => {
        const host = document.createElement('div');
        document.body.appendChild(host);
        if (typeof host.attachShadow !== 'function') {
          host.remove();
          this.skip();
        }
        const shadowRoot = host.attachShadow({ mode: 'open' });
        const shadowInput = document.createElement('input');
        shadowRoot.appendChild(shadowInput);
        const otherInput = document.createElement('input');
        document.body.appendChild(otherInput);
        shadowInput.focus();
        const ast = { name: 'focus', type: PS_CLASS_SELECTOR };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, otherInput, {}),
          false,
          'other focusable elements should not match :focus just because shadow DOM is focused'
        );
        host.remove();
        otherInput.remove();
      });

      it('should traverse nested Shadow DOMs and match the active element', () => {
        const hostA = document.createElement('div');
        document.body.appendChild(hostA);
        if (typeof hostA.attachShadow !== 'function') {
          hostA.remove();
          this.skip();
        }
        const shadowA = hostA.attachShadow({ mode: 'open' });
        const hostB = document.createElement('div');
        shadowA.appendChild(hostB);
        const shadowB = hostB.attachShadow({ mode: 'open' });
        const input = document.createElement('input');
        shadowB.appendChild(input);
        input.focus();
        const ast = { name: 'focus', type: PS_CLASS_SELECTOR };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, input, {}),
          true,
          'deeply nested input matches :focus'
        );
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, hostB, {}),
          true,
          'inner shadow host matches :focus'
        );
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, hostA, {}),
          true,
          'outer shadow host matches :focus'
        );
        hostA.remove();
      });
    });
  });

  describe('match :focus-visible pseudo-class', () => {
    let buttonTarget, inputTarget;

    beforeEach(() => {
      buttonTarget = document.createElement('button');
      inputTarget = document.createElement('input');

      const container = document.getElementById('div0') || document.body;
      container.appendChild(buttonTarget);
      container.appendChild(inputTarget);
    });

    afterEach(() => {
      buttonTarget.remove();
      inputTarget.remove();
    });

    it('should return true when isFocusVisible(node) is true', () => {
      inputTarget.focus();
      const ast = { name: 'focus-visible', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, inputTarget, {}),
        true,
        'returns true because isFocusVisible(inputTarget) is true'
      );
    });

    it('fails for activeElement without focus-visible', () => {
      buttonTarget.focus();
      if (mockEvaluator.eventHandler) {
        mockEvaluator.eventHandler.currentFocus = null;
        mockEvaluator.eventHandler.currentEvent = null;
      } else {
        mockEvaluator.eventHandler = {
          currentFocus: null,
          currentEvent: null
        };
      }
      const ast = { name: 'focus-visible', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, buttonTarget, {}),
        false,
        'returns false because mouse focus on button is not focus-visible'
      );
    });

    it('matches if relatedTarget was focus-visible', () => {
      buttonTarget.focus();
      mockEvaluator.eventHandler = {
        currentFocus: {
          target: buttonTarget,
          relatedTarget: inputTarget
        }
      };
      const ast = { name: 'focus-visible', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, buttonTarget, {}),
        true,
        'returns true because relatedTarget was focus-visible'
      );
    });

    it('should return true on Tab key navigation', () => {
      buttonTarget.focus();
      mockEvaluator.eventHandler = {
        currentFocus: {
          target: buttonTarget,
          relatedTarget: null
        },
        currentEvent: {
          type: 'keydown',
          key: 'Tab',
          target: document.body, // target !== node
          altKey: false,
          ctrlKey: false,
          metaKey: false
        }
      };
      const ast = { name: 'focus-visible', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, buttonTarget, {}),
        true,
        'returns true during Tab key navigation'
      );
    });

    it('should return true on keypress on the target node', () => {
      buttonTarget.focus();
      mockEvaluator.eventHandler = {
        currentFocus: {
          target: buttonTarget,
          relatedTarget: null
        },
        currentEvent: {
          type: 'keydown',
          key: 'Enter',
          target: buttonTarget,
          altKey: false,
          ctrlKey: false,
          metaKey: false
        }
      };
      const ast = { name: 'focus-visible', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, buttonTarget, {}),
        true,
        'returns true when typing key on the node'
      );
    });

    it('fails immediately if node is not activeElement', () => {
      if (document.activeElement) {
        document.activeElement.blur();
      }
      const ast = { name: 'focus-visible', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, buttonTarget, {}),
        false,
        'returns false immediately when node is not activeElement'
      );
    });

    it('should reset #lastFocusVisible to null', () => {
      buttonTarget.focus();
      const ast = { name: 'focus-visible', type: PS_CLASS_SELECTOR };
      mockEvaluator.eventHandler = {
        currentFocus: {
          target: buttonTarget,
          relatedTarget: null
        },
        currentEvent: {
          type: 'keydown',
          key: 'Tab',
          target: document.body,
          altKey: false,
          ctrlKey: false,
          metaKey: false
        }
      };
      const firstResult = pseudoEvaluator.matchPseudoClassSelector(
        ast,
        buttonTarget,
        {}
      );
      assert.strictEqual(
        firstResult,
        true,
        'first evaluation sets #lastFocusVisible to buttonTarget'
      );
      mockEvaluator.eventHandler = {
        currentFocus: null,
        currentEvent: null
      };
      const secondResult = pseudoEvaluator.matchPseudoClassSelector(
        ast,
        buttonTarget,
        {}
      );
      assert.strictEqual(
        secondResult,
        false,
        'second evaluation returns false'
      );
      mockEvaluator.eventHandler = {
        currentFocus: {
          target: buttonTarget,
          relatedTarget: buttonTarget
        },
        currentEvent: null
      };
      const thirdResult = pseudoEvaluator.matchPseudoClassSelector(
        ast,
        buttonTarget,
        {}
      );
      assert.strictEqual(
        thirdResult,
        false,
        '#lastFocusVisible was successfully reset to null'
      );
    });

    it('matches if relatedTarget is null on focusTarget', () => {
      buttonTarget.focus();
      mockEvaluator.eventHandler = {
        currentFocus: {
          target: buttonTarget,
          relatedTarget: null
        },
        currentEvent: null
      };
      const ast = { name: 'focus-visible', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, buttonTarget, {}),
        true,
        'returns true because relatedTarget is null'
      );
    });

    it('matches if relatedTarget is lastFocusVisible', () => {
      inputTarget.focus();
      const ast = { name: 'focus-visible', type: PS_CLASS_SELECTOR };
      pseudoEvaluator.matchPseudoClassSelector(ast, inputTarget, {});
      buttonTarget.focus();
      mockEvaluator.eventHandler = {
        currentFocus: {
          target: buttonTarget,
          relatedTarget: inputTarget // inputTarget === #lastFocusVisible
        },
        currentEvent: null
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, buttonTarget, {}),
        true,
        'returns true because relatedTarget === #lastFocusVisible'
      );
    });

    it('matches target === relatedTarget with no lastFocus', () => {
      const ast = { name: 'focus-visible', type: PS_CLASS_SELECTOR };
      const divTarget = document.createElement('div');
      divTarget.tabIndex = -1;
      document.body.appendChild(divTarget);
      divTarget.focus();
      mockEvaluator.eventHandler = {
        currentFocus: {
          target: divTarget,
          relatedTarget: buttonTarget
        },
        currentEvent: {
          type: 'click',
          target: buttonTarget, // target === relatedTarget
          altKey: false,
          ctrlKey: false,
          metaKey: false
        }
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, divTarget, {}),
        true,
        'target === relatedTarget and #lastFocusVisible is null'
      );
      divTarget.remove();
    });

    it('matches target === relatedTarget and lastFocusVisible', () => {
      const ast = { name: 'focus-visible', type: PS_CLASS_SELECTOR };
      const divTarget = document.createElement('div');
      divTarget.tabIndex = -1;
      document.body.appendChild(divTarget);
      divTarget.focus();
      mockEvaluator.eventHandler = {
        currentFocus: { target: divTarget, relatedTarget: null },
        currentEvent: { type: 'keyup', key: 'Tab', target: divTarget }
      };
      pseudoEvaluator.matchPseudoClassSelector(ast, divTarget, {});
      mockEvaluator.eventHandler = {
        currentFocus: {
          target: divTarget, // focusTarget === #lastFocusVisible
          relatedTarget: buttonTarget
        },
        currentEvent: {
          type: 'click',
          target: buttonTarget, // target === relatedTarget
          altKey: false,
          ctrlKey: false,
          metaKey: false
        }
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, divTarget, {}),
        true,
        'target === relatedTarget and focusTarget === #lastFocusVisible'
      );
      divTarget.remove();
    });

    it('matches Tab navigation with no lastFocusVisible', () => {
      buttonTarget.focus();
      mockEvaluator.eventHandler = {
        currentFocus: {
          target: buttonTarget,
          relatedTarget: inputTarget
        },
        currentEvent: {
          type: 'keydown',
          key: 'Tab',
          target: buttonTarget, // target === focusTarget
          altKey: false,
          ctrlKey: false,
          metaKey: false
        }
      };
      const ast = { name: 'focus-visible', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, buttonTarget, {}),
        true,
        'Tab key navigating with no #lastFocusVisible set'
      );
    });

    it('matches Tab keyup on lastFocusVisible', () => {
      const ast = { name: 'focus-visible', type: PS_CLASS_SELECTOR };
      const divTarget = document.createElement('div');
      divTarget.tabIndex = -1;
      document.body.appendChild(divTarget);
      divTarget.focus();
      mockEvaluator.eventHandler = {
        currentFocus: { target: divTarget, relatedTarget: null },
        currentEvent: { type: 'keyup', key: 'Tab', target: divTarget }
      };
      pseudoEvaluator.matchPseudoClassSelector(ast, divTarget, {});
      mockEvaluator.eventHandler = {
        currentFocus: {
          target: divTarget,
          relatedTarget: null
        },
        currentEvent: {
          type: 'keyup',
          key: 'Tab',
          target: divTarget,
          altKey: false,
          ctrlKey: false,
          metaKey: false
        }
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, divTarget, {}),
        true,
        'keyup event target is #lastFocusVisible and relatedTarget is null'
      );
      divTarget.remove();
    });

    it('matches modifier-free keydown and keyup events', () => {
      const ast = { name: 'focus-visible', type: PS_CLASS_SELECTOR };
      const node = document.createElement('button');
      document.getElementById('div0').appendChild(node);
      node.focus();
      const setMockEvent = (type, target, modifiers = {}) => {
        mockEvaluator.eventHandler = {
          currentFocus: {
            target: node,
            relatedTarget: null
          },
          currentEvent: {
            type,
            target,
            altKey: modifiers.altKey || false,
            ctrlKey: modifiers.ctrlKey || false,
            metaKey: modifiers.metaKey || false,
            key: 'Enter'
          }
        };
      };
      setMockEvent('keydown', node);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, node, {}),
        true,
        'matches condition for keydown'
      );
      setMockEvent('keyup', node);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, node, {}),
        true,
        'matches condition for keyup'
      );
      setMockEvent('mousedown', node);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, node, {}),
        false,
        'fails condition for mousedown'
      );
      setMockEvent('keydown', node, { altKey: true });
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, node, {}),
        false,
        'fails condition when altKey is pressed'
      );
      const otherNode = document.createElement('div');
      setMockEvent('keydown', otherNode);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, node, {}),
        false,
        'fails condition when event target does not match the node'
      );
      node.remove();
      mockEvaluator.eventHandler = null;
    });

    it('should not clear #lastFocusVisible when reset() is called', () => {
      inputTarget.focus();
      const ast = { name: 'focus-visible', type: PS_CLASS_SELECTOR };
      mockEvaluator.eventHandler = {
        currentFocus: { target: inputTarget, relatedTarget: null },
        currentEvent: {
          type: 'keydown',
          key: 'Tab',
          target: document.body,
          altKey: false,
          ctrlKey: false,
          metaKey: false
        }
      };
      pseudoEvaluator.matchPseudoClassSelector(ast, inputTarget, {});
      pseudoEvaluator.reset();
      buttonTarget.focus();
      mockEvaluator.eventHandler = {
        currentFocus: {
          target: buttonTarget,
          relatedTarget: inputTarget
        },
        currentEvent: null
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, buttonTarget, {}),
        true,
        'returns true because reset() does not clear #lastFocusVisible'
      );
    });
  });

  describe('match :focus-within pseudo-class', () => {
    let parent, child, other;

    beforeEach(() => {
      parent = document.createElement('div');
      parent.tabIndex = -1;
      child = document.createElement('input');
      other = document.createElement('input');
      parent.appendChild(child);
      const container = document.getElementById('div0') || document.body;
      container.appendChild(parent);
      container.appendChild(other);
    });

    afterEach(() => {
      parent.remove();
      other.remove();
    });

    it('should return true when the node itself is focused', () => {
      parent.focus();
      const ast = { name: 'focus-within', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
        true,
        'returns true because the node itself is the activeElement'
      );
    });

    it('matches when a descendant is focused', () => {
      child.focus();
      const ast = { name: 'focus-within', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
        true,
        'returns true because a descendant (child) is the activeElement'
      );
    });

    it('fails when focused element is outside the node', () => {
      other.focus();
      const ast = { name: 'focus-within', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
        false,
        'returns false because the activeElement is outside the node'
      );
    });

    it('should return false when no relevant element is focused', () => {
      if (document.activeElement) {
        document.activeElement.blur();
      }
      const ast = { name: 'focus-within', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
        false,
        'returns false because neither the node nor its descendants are focused'
      );
    });

    describe('focus-within cache traversal paths', () => {
      it('traverses parentNode chain to root document', () => {
        const parent = document.createElement('div');
        const child = document.createElement('input');
        parent.appendChild(child);
        document.body.appendChild(parent);
        child.focus();
        const ast = { name: 'focus-within', type: PS_CLASS_SELECTOR };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
          true,
          'returns true after successfully traversing parentNodes'
        );
        parent.remove();
      });

      it('crosses shadow boundary for DocumentFragment', () => {
        const host = document.createElement('div');
        document.body.appendChild(host);
        if (typeof host.attachShadow !== 'function') {
          host.remove();
          this.skip();
        }
        const shadowRoot = host.attachShadow({ mode: 'open' });
        const input = document.createElement('input');
        shadowRoot.appendChild(input);
        input.focus();
        const ast = { name: 'focus-within', type: PS_CLASS_SELECTOR };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, host, {}),
          true,
          'returns true after correctly crossing the shadow DOM boundary'
        );
        host.remove();
      });
    });
  });

  describe('match :hover pseudo-class', () => {
    let parent, child, outside;

    beforeEach(() => {
      parent = document.createElement('div');
      child = document.createElement('span');
      outside = document.createElement('div');

      parent.appendChild(child);
      const container = document.getElementById('div0') || document.body;
      container.appendChild(parent);
      container.appendChild(outside);
    });

    afterEach(() => {
      parent.remove();
      outside.remove();
    });

    it('matches valid event type on target or ancestor', () => {
      mockEvaluator.eventHandler = {
        currentEvent: {
          type: 'mouseover',
          target: child
        }
      };
      const ast = { name: 'hover', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
        true,
        'returns true for ancestor element'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, child, {}),
        true,
        'returns true for the target element itself'
      );
    });

    it('should return true for all valid mouse event types', () => {
      const ast = { name: 'hover', type: PS_CLASS_SELECTOR };
      const validTypes = ['click', 'mousedown', 'mouseover', 'mouseup'];
      for (const type of validTypes) {
        mockEvaluator.eventHandler = {
          currentEvent: { type, target: parent }
        };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
          true,
          `returns true for ${type}`
        );
      }
    });

    it('should return false for invalid event types', () => {
      const ast = { name: 'hover', type: PS_CLASS_SELECTOR };
      const invalidTypes = ['mousemove', 'mouseout', 'mouseenter', 'keydown'];
      for (const type of invalidTypes) {
        mockEvaluator.eventHandler = {
          currentEvent: { type, target: parent }
        };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
          false,
          `returns false for ${type}`
        );
      }
    });

    it('should return false when target is not an ELEMENT_NODE', () => {
      const textNode = document.createTextNode('text');
      child.appendChild(textNode);
      mockEvaluator.eventHandler = {
        currentEvent: {
          type: 'mouseover',
          target: textNode
        }
      };
      const ast = { name: 'hover', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
        false,
        'returns false when target nodeType is not ELEMENT_NODE'
      );
    });

    it('should return false when node does not contain target', () => {
      mockEvaluator.eventHandler = {
        currentEvent: {
          type: 'mouseover',
          target: child
        }
      };
      const ast = { name: 'hover', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, outside, {}),
        false,
        'returns false when node does not contain the event target'
      );
    });

    it('should return false gracefully when currentEvent is null', () => {
      mockEvaluator.eventHandler = { currentEvent: null };
      const ast = { name: 'hover', type: PS_CLASS_SELECTOR };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
        false,
        'returns false when currentEvent is null'
      );
    });
  });

  describe('match :in-range and :out-of-range pseudo class', () => {
    it('matches :in-range and :out-of-range for number input', () => {
      const leafIn = {
        children: null,
        name: 'in-range',
        type: PS_CLASS_SELECTOR
      };
      const leafOut = {
        children: null,
        name: 'out-of-range',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.type = 'number';
      node.min = '10';
      node.max = '20';
      node.value = '15';
      document.getElementById('div0').appendChild(node);
      Object.defineProperty(node, 'validity', {
        value: { rangeOverflow: false, rangeUnderflow: false },
        writable: true
      });
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(leafIn, node, {}),
        true,
        'matches :in-range for value within limits'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(leafOut, node, {}),
        false,
        'fails :out-of-range for value within limits'
      );
      node.value = '25';
      node.validity = { rangeOverflow: true, rangeUnderflow: false };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(leafIn, node, {}),
        false,
        'fails :in-range for value exceeding max'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(leafOut, node, {}),
        true,
        'matches :out-of-range for value exceeding max'
      );
      node.remove();
    });
  });

  describe('match :indeterminate pseudo-class', () => {
    let ast;

    beforeEach(() => {
      ast = { name: 'indeterminate', type: PS_CLASS_SELECTOR };
    });

    it('fails if other radio is checked and uses cache', () => {
      const progress = document.createElement('progress');

      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, progress, {}),
        true,
        'returns true for <progress> without value attribute'
      );

      progress.setAttribute('value', '0.5');
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, progress, {}),
        false,
        'returns false for <progress> with value attribute'
      );
    });

    it('evaluates <input type="checkbox"> element', () => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';

      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, checkbox, {}),
        false,
        'returns false by default'
      );

      checkbox.indeterminate = true;
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, checkbox, {}),
        true,
        'returns true when indeterminate property is set'
      );
    });

    it('evaluates radio buttons outside of a form', () => {
      const container = document.createElement('div');
      const radio1 = document.createElement('input');
      radio1.type = 'radio';
      radio1.name = 'groupOutside';
      container.appendChild(radio1);
      document.body.appendChild(container);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, radio1, {}),
        true,
        'returns true for un-checked radio outside form'
      );
      container.remove();
    });

    it('should return false for unhandled element types', () => {
      const div = document.createElement('div');
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, div, {}),
        false,
        'returns false for div element'
      );
    });

    describe('radio button groups in a form', () => {
      let form, radio1, radio2;

      beforeEach(() => {
        form = document.createElement('form');
        radio1 = document.createElement('input');
        radio1.type = 'radio';
        radio1.name = 'group1';
        radio2 = document.createElement('input');
        radio2.type = 'radio';
        radio2.name = 'group1';
        form.appendChild(radio1);
        form.appendChild(radio2);
        document.getElementById('div0').appendChild(form);
      });

      afterEach(() => {
        form.remove();
      });

      it('should return false if the radio itself is checked', () => {
        radio1.checked = true;
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, radio1, {}),
          false,
          'returns false if radio itself is checked'
        );
      });

      it('matches if no radio in the group is checked', () => {
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, radio1, {}),
          true,
          'returns true when no radio in the group is checked'
        );
      });

      it('fails if any other radio is checked, and use cache', () => {
        radio2.checked = true;
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, radio1, {}),
          false,
          'returns false when another radio in the group is checked'
        );
        const radio3 = document.createElement('input');
        radio3.type = 'radio';
        radio3.name = 'group1';
        form.appendChild(radio3);
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, radio3, {}),
          false,
          'returns false efficiently using populated cache'
        );
      });
    });
  });

  describe('match :invalid and :valid pseudo-classes', () => {
    let astValid, astInvalid;

    beforeEach(() => {
      astValid = { name: 'valid', type: PS_CLASS_SELECTOR };
      astInvalid = { name: 'invalid', type: PS_CLASS_SELECTOR };
    });

    it('evaluates form parts using validity.valid', () => {
      const input = document.createElement('input');
      Object.defineProperty(input, 'validity', {
        value: { valid: true },
        writable: true
      });
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astValid, input, {}),
        true,
        'returns true for :valid when validity.valid is true'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astInvalid, input, {}),
        false,
        'returns false for :invalid when validity.valid is true'
      );
      input.validity = { valid: false };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astValid, input, {}),
        false,
        'returns false for :valid when validity.valid is false'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astInvalid, input, {}),
        true,
        'returns true for :invalid when validity.valid is false'
      );
    });

    it('should override validity based on maxLength', () => {
      const input = document.createElement('input');
      Object.defineProperty(input, 'validity', { value: { valid: true } });
      input.maxLength = 5;
      input.value = '123456';
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astValid, input, {}),
        false,
        'returns false for :valid when value length exceeds maxLength'
      );
      input.value = '12345';
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astValid, input, {}),
        true,
        'returns true for :valid when value length is within maxLength'
      );
    });

    it('should override validity based on minLength', () => {
      const input = document.createElement('input');
      Object.defineProperty(input, 'validity', { value: { valid: true } });
      input.minLength = 3;
      input.value = '12';
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astValid, input, {}),
        false,
        'returns false for :valid when value length is less than minLength'
      );
      input.value = '123';
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astValid, input, {}),
        true,
        'returns true for :valid when value length meets minLength'
      );
    });

    it('fails for non-form elements', () => {
      const div = document.createElement('div');
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astValid, div, {}),
        false,
        'returns false for non-form elements'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astInvalid, div, {}),
        false,
        'returns false for non-form elements (invalid)'
      );
    });

    it('evaluates descendant maxLength in TreeWalker', () => {
      const form = document.createElement('form');
      document.getElementById('div0').appendChild(form);
      const input = document.createElement('input');
      input.type = 'text';
      input.value = '12345';
      input.setAttribute('maxlength', '3');
      Object.defineProperty(input, 'validity', {
        value: { valid: true },
        writable: true
      });
      form.appendChild(input);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astValid, form, {}),
        false,
        'form evaluates to false because descendant input exceeds maxLength'
      );
      form.remove();
    });

    describe('form and fieldset evaluation', () => {
      let form;

      beforeEach(() => {
        form = document.createElement('form');
        document.getElementById('div0').appendChild(form);
      });

      afterEach(() => {
        form.remove();
      });

      it('should return true for empty form or fieldset', () => {
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(astValid, form, {}),
          true,
          'empty form is considered valid'
        );
      });

      it('evaluates valid if all descendant form parts are', () => {
        const input1 = document.createElement('input');
        const input2 = document.createElement('input');
        Object.defineProperty(input1, 'validity', { value: { valid: true } });
        Object.defineProperty(input2, 'validity', { value: { valid: true } });
        form.appendChild(input1);
        form.appendChild(input2);
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(astValid, form, {}),
          true,
          'form is valid when all children are valid'
        );
      });

      it('evaluates invalid for bad descendant (cached)', () => {
        const input1 = document.createElement('input');
        const input2 = document.createElement('input');
        Object.defineProperty(input1, 'validity', { value: { valid: true } });
        Object.defineProperty(input2, 'validity', { value: { valid: false } });
        form.appendChild(input1);
        form.appendChild(input2);
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(astValid, form, {}),
          false,
          'form is invalid if at least one child is invalid'
        );
        const input3 = document.createElement('input');
        Object.defineProperty(input3, 'validity', { value: { valid: true } });
        form.appendChild(input3);
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(astValid, form, {}),
          false,
          'uses cache effectively on subsequent calls'
        );
      });

      it('evaluates descendant minLength in TreeWalker', () => {
        const input = document.createElement('input');
        Object.defineProperty(input, 'validity', { value: { valid: true } });
        input.minLength = 5;
        input.value = '123';
        form.appendChild(input);
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(astValid, form, {}),
          false,
          'form reflects minLength validation of descendants'
        );
      });
    });

    describe('match validity for <form> and <fieldset>', () => {
      let astValid, astInvalid;

      beforeEach(() => {
        astValid = { name: 'valid', type: PS_CLASS_SELECTOR };
        astInvalid = { name: 'invalid', type: PS_CLASS_SELECTOR };
      });

      it('evaluates :valid and :invalid for <form>', () => {
        const form = document.createElement('form');
        const input = document.createElement('input');
        form.appendChild(input);
        document.getElementById('div0').appendChild(form);
        Object.defineProperty(input, 'validity', {
          value: { valid: true },
          writable: true
        });
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(astValid, form, {}),
          true,
          '<form> matches :valid when its inputs are valid'
        );
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(astInvalid, form, {}),
          false,
          '<form> fails :invalid when its inputs are valid (uses cache)'
        );
        form.remove();
      });

      it('evaluates :valid and :invalid for <fieldset>', () => {
        const fieldset = document.createElement('fieldset');
        const invalidInput = document.createElement('input');
        fieldset.appendChild(invalidInput);
        document.getElementById('div0').appendChild(fieldset);
        Object.defineProperty(invalidInput, 'validity', {
          value: { valid: false },
          writable: true
        });
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(astValid, fieldset, {}),
          false,
          '<fieldset> fails :valid when a child is invalid'
        );
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(astInvalid, fieldset, {}),
          true,
          '<fieldset> matches :invalid when a child is invalid'
        );
        fieldset.remove();
      });

      it('evaluates to true for <form> without any input children', () => {
        const emptyForm = document.createElement('form');
        document.getElementById('div0').appendChild(emptyForm);
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(astValid, emptyForm, {}),
          true,
          'empty <form> defaults to valid'
        );
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(astInvalid, emptyForm, {}),
          false,
          'empty <form> defaults to not invalid'
        );
        emptyForm.remove();
      });
    });
  });

  describe('match :local-link pseudo-class', () => {
    let ast;

    beforeEach(() => {
      ast = { name: 'local-link', type: PS_CLASS_SELECTOR };
    });

    it('matches <a> with matching origin and pathname', () => {
      const a = document.createElement('a');
      a.setAttribute('href', 'http://localhost/#bar');
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, a, {}),
        true,
        'returns true for matching local link'
      );
    });

    it('matches <area> with matching origin and pathname', () => {
      const area = document.createElement('area');
      area.setAttribute('href', '/?query=123');
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, area, {}),
        true,
        'returns true for <area> element with matching local link'
      );
    });

    it('fails for <a> with different origin', () => {
      const a = document.createElement('a');
      a.setAttribute('href', 'https://example.com/');
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, a, {}),
        false,
        'returns false for different origin'
      );
    });

    it('fails for <a> with different pathname', () => {
      const a = document.createElement('a');
      a.setAttribute('href', 'http://localhost/other-page');
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, a, {}),
        false,
        'returns false for different pathname'
      );
    });

    it('fails for <a> without href attribute', () => {
      const a = document.createElement('a');
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, a, {}),
        false,
        'returns false for <a> without href'
      );
    });

    it('fails for non-link elements with href attr', () => {
      const div = document.createElement('div');
      div.setAttribute('href', 'http://localhost/');
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, div, {}),
        false,
        'returns false for non-link element like div'
      );
    });

    it('should use cached #documentURL on subsequent calls', () => {
      const a1 = document.createElement('a');
      a1.setAttribute('href', 'http://localhost/#first');
      const a2 = document.createElement('a');
      a2.setAttribute('href', 'http://localhost/#second');
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, a1, {}),
        true,
        'returns true on first call'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, a2, {}),
        true,
        'returns true on subsequent call using cache'
      );
    });
  });

  describe('match :open pseudo-class', () => {
    it('matches :open for <details> with open attribute', () => {
      const ast = { children: null, name: 'open', type: PS_CLASS_SELECTOR };
      const node = document.createElement('details');
      document.getElementById('div0').appendChild(node);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, node, {}),
        false,
        'fails :open for <details> without open attribute'
      );
      node.setAttribute('open', '');
      node.open = true;
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, node, {}),
        true,
        'matches :open for <details> with open attribute'
      );
      node.remove();
    });
  });

  describe('match :optional and :required pseudo-class', () => {
    it('should match :required for standard input with required attr', () => {
      const leaf = {
        children: null,
        name: 'required',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('required', 'required');
      document.getElementById('div0').appendChild(node);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(leaf, node, {}),
        true,
        'result'
      );
    });

    it('should match :optional for input without required attribute', () => {
      const leaf = {
        children: null,
        name: 'optional',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      document.getElementById('div0').appendChild(node);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(leaf, node, {}),
        true,
        'result'
      );
    });
  });

  describe('match :placeholder-shown pseudo class', () => {
    it('should match :placeholder-shown when input value is empty', () => {
      const leaf = {
        children: null,
        name: 'placeholder-shown',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('placeholder', 'foo');
      node.value = '';
      document.getElementById('div0').appendChild(node);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(leaf, node, {}),
        true,
        'result'
      );
    });
  });

  describe('match :read-only and :read-write pseudo-class', () => {
    it('should match :read-only for <input> with readonly attribute', () => {
      const leaf = {
        children: null,
        name: 'read-only',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('input');
      node.setAttribute('readonly', 'readonly');
      document.getElementById('div0').appendChild(node);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(leaf, node, {}),
        true,
        'result'
      );
    });
  });

  describe('match :root pseudo-class', () => {
    it('matches documentElement for :root', () => {
      const leaf = {
        children: null,
        name: 'root',
        type: PS_CLASS_SELECTOR
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(
          leaf,
          document.documentElement,
          {}
        ),
        true,
        'matches the document root element'
      );
    });

    it('fails for non-documentElement against :root', () => {
      const leaf = {
        children: null,
        name: 'root',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.body.appendChild(node);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(leaf, node, {}),
        false,
        'fails for normal elements'
      );
      node.remove();
    });
  });

  describe('match :scope pseudo-class', () => {
    let leaf, node;

    beforeEach(() => {
      leaf = { name: 'scope', type: PS_CLASS_SELECTOR };
      node = document.createElement('div');
      document.body.appendChild(node);
    });

    afterEach(() => {
      node.remove();
      mockEvaluator.node = document;
      mockEvaluator.shadow = false;
    });

    it('fails for :scope on element when shadow is true', () => {
      mockEvaluator.node = node; // nodeType === ELEMENT_NODE
      mockEvaluator.shadow = true;
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(leaf, node, {}),
        false,
        'fails when shadow is true'
      );
    });

    it('fails for :scope when node is not evaluator node', () => {
      const otherNode = document.createElement('span');
      mockEvaluator.node = otherNode; // nodeType === ELEMENT_NODE
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(leaf, node, {}),
        false,
        'fails when node does not match evaluator.node'
      );
    });

    it('matches documentElement if evaluator is document', () => {
      mockEvaluator.node = document; // nodeType !== ELEMENT_NODE (Document)
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(
          leaf,
          document.documentElement,
          {}
        ),
        true,
        'matches documentElement when evaluator.node is not an element'
      );
    });

    it('fails for non-documentElement if evaluator is document', () => {
      mockEvaluator.node = document; // nodeType !== ELEMENT_NODE (Document)
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(leaf, node, {}),
        false,
        'fails for normal node when evaluator.node is not an element'
      );
    });
  });

  describe('match :target pseudo-class', () => {
    let ast, targetNode;

    beforeEach(() => {
      ast = { name: 'target', type: PS_CLASS_SELECTOR };
      targetNode = document.createElement('div');
    });

    afterEach(() => {
      targetNode.remove();
    });

    it('matches connected node matching URL hash', () => {
      targetNode.id = 'foo';
      document.body.appendChild(targetNode);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, targetNode, {}),
        true,
        'returns true when ID matches hash and node is connected'
      );
    });

    it('fails if node ID mis-matches the URL hash', () => {
      targetNode.id = 'bar';
      document.body.appendChild(targetNode);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, targetNode, {}),
        false,
        'returns false for mismatched ID'
      );
    });

    it('fails for matching ID if node is disconnected', () => {
      targetNode.id = 'foo';
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, targetNode, {}),
        false,
        'returns false when node is detached from the document'
      );
    });

    it('should return false when document URL has no hash', () => {
      targetNode.id = 'foo';
      document.body.appendChild(targetNode);
      const originalDoc = mockEvaluator.document;
      mockEvaluator.document = {
        URL: 'http://localhost/',
        contains: originalDoc.contains.bind(originalDoc)
      };
      pseudoEvaluator.reset();
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, targetNode, {}),
        false,
        'returns false when there is no hash in the document URL'
      );
      mockEvaluator.document = originalDoc;
      pseudoEvaluator.reset();
    });
  });

  describe('match An+B', () => {
    const runNthTest = (ast, node) => {
      return pseudoEvaluator.matchPseudoClassSelector(ast, node, {});
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
      const isolatedRoot = document.createElement('div');
      mockEvaluator.root = isolatedRoot;
      const resTrue = pseudoEvaluator.matchPseudoClassSelector(
        ast,
        isolatedRoot,
        {}
      );
      assert.strictEqual(
        resTrue,
        true,
        'passes early return and matches because node is root'
      );
      const notRoot = document.createElement('span');
      const resFalse = pseudoEvaluator.matchPseudoClassSelector(
        ast,
        notRoot,
        {}
      );
      assert.strictEqual(
        resFalse,
        false,
        'returns false because node is not root and has no parentNode'
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
      assert.strictEqual(runNthTest(ast, node), false, 'result');
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
      assert.strictEqual(runNthTest(ast, node), true, 'result');
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
      assert.strictEqual(runNthTest(ast, node), true, 'result');
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
      assert.strictEqual(runNthTest(ast, node), true, 'result');
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
      assert.strictEqual(runNthTest(ast, node), true, 'result');
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
      assert.strictEqual(runNthTest(ast, node), false, 'result');
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
      assert.strictEqual(runNthTest(ast, node), true, 'result');
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
      assert.strictEqual(runNthTest(ast, node), true, 'result');
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
      assert.strictEqual(runNthTest(ast, node), false, 'result');
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
      assert.strictEqual(runNthTest(ast, node), false, 'result');
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
      assert.strictEqual(runNthTest(ast, node), true, 'result');
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
      assert.strictEqual(runNthTest(ast, node), false, 'result');
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
      assert.strictEqual(runNthTest(ast, node), true, 'result');
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
      assert.strictEqual(runNthTest(ast, node), true, 'result');
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
      assert.strictEqual(runNthTest(ast, node), true, 'result');
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
      assert.strictEqual(runNthTest(ast, node), false, 'result');
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
        runNthTest(ast, parent.children[7]),
        true,
        'pos=8 matches 3n+5'
      );
      assert.strictEqual(
        runNthTest(ast, parent.children[1]),
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
        runNthTest(ast, parent.children[1]),
        true,
        'pos=2 matches -3n+5'
      );
      assert.strictEqual(
        runNthTest(ast, parent.children[7]),
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
        runNthTest(ast, node),
        true,
        'matches nth-child with of selector'
      );
    });

    it('should return false when root node fails "of selector" filter', () => {
      const rootNode = document.createElement('div');
      rootNode.className = 'no-match';
      const originalRoot = mockEvaluator.root;
      mockEvaluator.root = rootNode;
      const ast = {
        name: 'nth-child',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            nth: { a: '1', b: '1', type: 'AnPlusB' },
            selector: {
              type: 'SelectorList',
              children: [
                {
                  type: 'Selector',
                  children: [{ name: 'match-me', type: CLASS_SELECTOR }]
                }
              ]
            },
            type: 'Nth'
          }
        ]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, rootNode, {}),
        false,
        'returns false because root node fails the "of selector" filter'
      );
      mockEvaluator.root = originalRoot;
    });

    it('evaluates previous sibling for :nth-last-child of selector', () => {
      const parent = document.createElement('div');
      const child1 = document.createElement('span');
      child1.className = 'test-match';
      const child2 = document.createElement('span');
      child2.className = 'test-no-match';
      const child3 = document.createElement('span');
      child3.className = 'test-match';
      parent.appendChild(child1);
      parent.appendChild(child2);
      parent.appendChild(child3);
      document.getElementById('div0').appendChild(parent);
      const ast = {
        name: 'nth-last-child',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: NTH,
            nth: { a: '0', b: '1', type: AN_PLUS_B },
            selector: {
              type: SELECTOR_LIST,
              children: [
                {
                  type: SELECTOR,
                  children: [{ name: 'test-match', type: CLASS_SELECTOR }]
                }
              ]
            }
          }
        ]
      };
      assert.strictEqual(
        runNthTest(ast, child3),
        true,
        'matches the 1st element from the end that satisfies the selector'
      );
      assert.strictEqual(
        runNthTest(ast, child1),
        false,
        'fails for the 2nd element from the end'
      );
      parent.remove();
    });

    describe('An+B undefined pos catch', () => {
      it('should return false when node is not in indexMap', () => {
        const parent = document.createElement('div');
        const child1 = document.createElement('div');
        child1.className = 'match';
        const child2 = document.createElement('div');
        child2.className = 'no-match';
        parent.appendChild(child1);
        parent.appendChild(child2);
        document.getElementById('div0').appendChild(parent);
        const ast = {
          name: 'nth-child',
          type: PS_CLASS_SELECTOR,
          children: [
            {
              nth: { b: '1', type: 'AnPlusB' },
              selector: {
                type: 'SelectorList',
                children: [
                  {
                    type: 'Selector',
                    children: [{ name: 'match', type: CLASS_SELECTOR }]
                  }
                ]
              },
              type: 'Nth'
            }
          ]
        };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, child2, {}),
          false,
          'returns false because child2 fails the filter and pos is undefined'
        );
      });
    });
  });

  describe('match logical pseudo function', () => {
    it('should evaluate :has() logic', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      child.className = 'target-span';
      parent.appendChild(child);
      document.getElementById('div0').appendChild(parent);
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [{ name: 'target-span', type: CLASS_SELECTOR }]
              }
            ]
          }
        ]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
        true,
        'parent matches :has(.target-span)'
      );
    });

    it('evaluates multi-step combinators in :is()', () => {
      const grandParent = document.createElement('div');
      grandParent.id = 'gp';
      const parent = document.createElement('div');
      parent.id = 'p';
      const child = document.createElement('span');
      child.id = 'c';
      parent.appendChild(child);
      grandParent.appendChild(parent);
      document.getElementById('div0').appendChild(grandParent);
      const ast = {
        name: 'is',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [
                  { name: 'gp', type: ID_SELECTOR },
                  { name: '>', type: COMBINATOR },
                  { name: 'p', type: ID_SELECTOR },
                  { name: '>', type: COMBINATOR },
                  { name: 'c', type: ID_SELECTOR }
                ]
              }
            ]
          }
        ]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, child, {}),
        true,
        'child matches multi-step combinator in :is()'
      );
    });

    it('fails when intermediate combinator step fails', () => {
      const parent = document.createElement('div');
      parent.id = 'p';
      const child = document.createElement('span');
      child.id = 'c';
      parent.appendChild(child);
      document.getElementById('div0').appendChild(parent);
      const ast = {
        name: 'is',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [
                  { name: 'non-existent', type: ID_SELECTOR },
                  { name: '>', type: COMBINATOR },
                  { name: 'p', type: ID_SELECTOR },
                  { name: '>', type: COMBINATOR },
                  { name: 'c', type: ID_SELECTOR }
                ]
              }
            ]
          }
        ]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, child, {}),
        false,
        'returns false when ancestor chain fails to match'
      );
    });

    it('should invert match result for :not() pseudo-class', () => {
      const div = document.createElement('div');
      div.id = 'not-target';
      document.getElementById('div0').appendChild(div);
      const astMatches = {
        name: 'not',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [{ name: 'span', type: TYPE_SELECTOR }]
              }
            ]
          }
        ]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(astMatches, div, {}),
        true,
        'div matches :not(span)'
      );
    });

    it('fails for :not() with non-pseudo on ShadowRoot', () => {
      const shadowRoot = document.createDocumentFragment();
      mockEvaluator.shadow = true;
      const ast = {
        name: 'not',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [{ name: 'div', type: TYPE_SELECTOR }]
              }
            ]
          }
        ]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, shadowRoot, {}),
        false,
        'returns false immediately due to isShadowRoot && isInvalidShadow'
      );
    });

    it('fails for :is() with multiple leaves on shadow', () => {
      const shadowRoot = document.createDocumentFragment();
      mockEvaluator.shadow = true;
      const ast = {
        name: 'is',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [
                  { name: 'foo', type: CLASS_SELECTOR },
                  { name: 'bar', type: CLASS_SELECTOR }
                ]
              }
            ]
          }
        ]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, shadowRoot, {}),
        false,
        'returns false immediately due to isShadowRoot && isInvalidShadow'
      );
    });

    it('uses cached AST data for logical pseudo-classes', () => {
      const parent = document.createElement('div');
      const child1 = document.createElement('span');
      child1.className = 'cache-logical-test';
      const child2 = document.createElement('span');
      child2.className = 'cache-logical-test';
      parent.appendChild(child1);
      parent.appendChild(child2);
      document.getElementById('div0').appendChild(parent);
      const ast = {
        name: 'is',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [{ name: 'cache-logical-test', type: CLASS_SELECTOR }]
              }
            ]
          }
        ]
      };
      const result1 = pseudoEvaluator.matchPseudoClassSelector(ast, child1, {});
      assert.strictEqual(
        result1,
        true,
        'first evaluation returns true and populates cache'
      );
      const result2 = pseudoEvaluator.matchPseudoClassSelector(ast, child2, {});
      assert.strictEqual(
        result2,
        true,
        'second evaluation returns true using cached AST data'
      );
      parent.remove();
    });

    it('should correctly restore #setPoolIndex', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      parent.appendChild(child);
      document.getElementById('div0').appendChild(parent);
      const ast = {
        name: 'is',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [
                  { name: 'unknown', type: CLASS_SELECTOR },
                  { name: '>', type: COMBINATOR },
                  { name: 'span', type: TYPE_SELECTOR }
                ]
              }
            ]
          }
        ]
      };
      const result1 = pseudoEvaluator.matchPseudoClassSelector(ast, child, {});
      assert.strictEqual(result1, false, 'should fail gracefully');
      const result2 = pseudoEvaluator.matchPseudoClassSelector(ast, child, {});
      assert.strictEqual(
        result2,
        false,
        'should fail safely on repeated calls'
      );
      parent.remove();
    });

    it('should not throw error and should not skip evaluate', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      parent.appendChild(child);
      document.getElementById('div0').appendChild(parent);
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [
                  { name: '*', type: TYPE_SELECTOR },
                  {
                    name: { name: 'data-test', type: IDENT },
                    type: ATTR_SELECTOR
                  }
                ]
              }
            ]
          }
        ]
      };
      child.setAttribute('data-test', 'true');
      const originalMatchLeaves = mockEvaluator.matchLeaves;
      mockEvaluator.matchLeaves = sinon.stub().callsFake((leaves, node) => {
        if (
          leaves.some(
            l => l.type === ATTR_SELECTOR && l.name.name === 'data-test'
          )
        ) {
          return node.hasAttribute('data-test');
        }
        return true;
      });
      const result = pseudoEvaluator.matchPseudoClassSelector(ast, parent, {});
      assert.strictEqual(
        result,
        true,
        ':has(*:...) should successfully fall back to TreeWalker'
      );
      mockEvaluator.matchLeaves = originalMatchLeaves;
      parent.remove();
    });
  });

  describe('match :has() pseudo-class function', () => {
    const runHasTest = (ast, node) => {
      return pseudoEvaluator.matchPseudoClassSelector(ast, node, {});
    };

    it('should throw a SyntaxError for empty :has()', () => {
      const node = document.getElementById('ul1');
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: []
      };
      assert.throws(
        () => runHasTest(ast, node),
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
      mockEvaluator.matchLeaves.returns(false);
      assert.strictEqual(runHasTest(ast, node), false, 'result');
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
      mockEvaluator.matchLeaves.returns(true);
      assert.strictEqual(runHasTest(ast, node), true, 'result');
    });

    it('matches :has() on shadow if verifyShadowHost', () => {
      const shadowRoot = document.createDocumentFragment();
      const child = document.createElement('div');
      child.className = 'target';
      shadowRoot.appendChild(child);
      mockEvaluator.shadow = true;
      mockEvaluator.verifyShadowHost = true;
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [{ name: 'target', type: CLASS_SELECTOR }]
              }
            ]
          }
        ]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, shadowRoot, {}),
        true,
        'matches :has() because verifyShadowHost is true'
      );
    });

    it('fails :has() on shadow if !verifyShadowHost', () => {
      const shadowRoot = document.createDocumentFragment();
      const child = document.createElement('div');
      child.className = 'target';
      shadowRoot.appendChild(child);
      mockEvaluator.shadow = true;
      mockEvaluator.verifyShadowHost = false;
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [{ name: 'target', type: CLASS_SELECTOR }]
              }
            ]
          }
        ]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, shadowRoot, {}),
        false,
        'returns false because verifyShadowHost is false'
      );
    });

    it('should return null when no seed is found', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      child.setAttribute('data-no-seed', 'true');
      parent.appendChild(child);
      document.getElementById('div0').appendChild(parent);
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [
                  {
                    name: { name: 'data-no-seed', type: IDENT },
                    type: ATTR_SELECTOR,
                    value: null,
                    flags: null,
                    evaluator: null
                  }
                ]
              }
            ]
          }
        ]
      };
      mockEvaluator.matchLeaves.returns(true);
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
        true,
        'matches successfully without a sparse seed allowlist'
      );
    });

    it('should build allowlist using ID seed when element is found', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      child.id = 'has-id-seed';
      parent.appendChild(child);
      document.getElementById('div0').appendChild(parent);
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [{ name: 'has-id-seed', type: ID_SELECTOR }]
              }
            ]
          }
        ]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
        true,
        'matches successfully using ID seed allowlist'
      );
    });

    it('should return null when ID seed element is not found', () => {
      const parent = document.createElement('div');
      document.getElementById('div0').appendChild(parent);
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [{ name: 'non-existent-seed', type: ID_SELECTOR }]
              }
            ]
          }
        ]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
        false,
        'returns false because ID seed does not exist in document'
      );
    });

    it('should fallback when root lacks getElementById method', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      child.id = 'fallback-id-seed';
      parent.appendChild(child);
      const originalRoot = mockEvaluator.root;
      mockEvaluator.root = {
        nodeType: 1,
        getElementsByClassName:
          originalRoot.getElementsByClassName.bind(originalRoot),
        getElementsByTagName:
          originalRoot.getElementsByTagName.bind(originalRoot)
      };
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [{ name: 'fallback-id-seed', type: ID_SELECTOR }]
              }
            ]
          }
        ]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
        true,
        'matches successfully by falling back from ID allowlist'
      );
      mockEvaluator.root = originalRoot;
    });

    it('should return null when seed elements length is 0', () => {
      const parent = document.createElement('div');
      document.getElementById('div0').appendChild(parent);
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [{ name: 'empty-class-seed', type: CLASS_SELECTOR }]
              }
            ]
          }
        ]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
        false,
        'returns false and handles len === 0 fallback gracefully'
      );
    });

    it('should return null when seed elements length exceeds threshold', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      parent.appendChild(child);
      const originalRoot = mockEvaluator.root;
      mockEvaluator.root = {
        nodeType: 1,
        getElementsByTagName: tag => {
          if (tag === 'span') {
            return new Array(300).fill(child);
          }
          return originalRoot.getElementsByTagName.bind(originalRoot)(tag);
        },
        getElementById: originalRoot.getElementById.bind(originalRoot),
        getElementsByClassName:
          originalRoot.getElementsByClassName.bind(originalRoot)
      };
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [{ name: 'span', type: TYPE_SELECTOR }]
              }
            ]
          }
        ]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
        true,
        'falls back to regular traversal when seed elements exceed HEX * HEX'
      );
      mockEvaluator.root = originalRoot;
    });

    it('should break twig extraction at subsequent combinator', () => {
      const parent = document.createElement('div');
      const child1 = document.createElement('span');
      child1.className = 'first';
      const child2 = document.createElement('span');
      child2.className = 'second';
      parent.appendChild(child1);
      parent.appendChild(child2);
      document.getElementById('div0').appendChild(parent);
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [
                  { name: 'first', type: CLASS_SELECTOR },
                  { name: '+', type: COMBINATOR },
                  { name: 'second', type: CLASS_SELECTOR }
                ]
              }
            ]
          }
        ]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
        true,
        'successfully processes internal combinators'
      );
    });

    it('should return false if combinator chain fails', () => {
      const parent = document.createElement('div');
      const child1 = document.createElement('span');
      child1.className = 'first';
      const child2 = document.createElement('span');
      child2.className = 'unmatch';
      parent.appendChild(child1);
      parent.appendChild(child2);
      document.getElementById('div0').appendChild(parent);
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [
                  { name: 'first', type: CLASS_SELECTOR },
                  { name: '+', type: COMBINATOR },
                  { name: 'second', type: CLASS_SELECTOR }
                ]
              }
            ]
          }
        ]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
        false,
        'returns false when subsequent combinator chain does not match'
      );
    });

    it('should evaluate remainingLeaves and return true', () => {
      const parent = document.createElement('div');
      const child1 = document.createElement('div');
      child1.className = 'step1';
      const child2 = document.createElement('span');
      child2.className = 'step2';
      child1.appendChild(child2);
      parent.appendChild(child1);
      document.getElementById('div0').appendChild(parent);
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [
                  { name: '>', type: COMBINATOR },
                  { name: 'step1', type: CLASS_SELECTOR },
                  { name: ' ', type: COMBINATOR },
                  { name: 'step2', type: CLASS_SELECTOR }
                ]
              }
            ]
          }
        ]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
        true,
        'returns true after recursively matching remainingLeaves in #checkNode'
      );
    });

    it('should evaluate remainingLeaves and return false', () => {
      const parent = document.createElement('div');
      const child1 = document.createElement('div');
      child1.className = 'step1';
      const child2 = document.createElement('span');
      child2.className = 'wrong-step';
      child1.appendChild(child2);
      parent.appendChild(child1);
      document.getElementById('div0').appendChild(parent);
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [
                  { name: '>', type: COMBINATOR },
                  { name: 'step1', type: CLASS_SELECTOR },
                  { name: ' ', type: COMBINATOR },
                  { name: 'step2', type: CLASS_SELECTOR }
                ]
              }
            ]
          }
        ]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
        false,
        'returns false because remainingLeaves check fails in #checkNode'
      );
    });

    it('should match descendants using TreeWalker fallback', () => {
      const parent = document.createElement('div');
      const child1 = document.createElement('div');
      const child2 = document.createElement('span');
      child2.setAttribute('data-target', 'true');
      child1.appendChild(child2);
      parent.appendChild(child1);
      document.getElementById('div0').appendChild(parent);
      const originalMatchLeaves = mockEvaluator.matchLeaves;
      mockEvaluator.matchLeaves = sinon.stub().callsFake((leaves, node) => {
        return node.hasAttribute && node.hasAttribute('data-target');
      });
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [
                  {
                    type: ATTR_SELECTOR,
                    name: { name: 'data-target', type: IDENT }
                  }
                ]
              }
            ]
          }
        ]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
        true,
        'TreeWalker loop finds the descendant and returns true'
      );
      mockEvaluator.matchLeaves = originalMatchLeaves;
    });

    it('should return false when TreeWalker exhausts without match', () => {
      const parent = document.createElement('div');
      const child1 = document.createElement('div');
      const child2 = document.createElement('span');
      child1.appendChild(child2);
      parent.appendChild(child1);
      document.getElementById('div0').appendChild(parent);
      const originalMatchLeaves = mockEvaluator.matchLeaves;
      mockEvaluator.matchLeaves = sinon.stub().callsFake((leaves, node) => {
        return node.hasAttribute && node.hasAttribute('data-target');
      });
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [
                  {
                    type: ATTR_SELECTOR,
                    name: { name: 'data-target', type: IDENT }
                  }
                ]
              }
            ]
          }
        ]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
        false,
        'TreeWalker loop finishes and returns false'
      );
      mockEvaluator.matchLeaves = originalMatchLeaves;
    });

    it('should return true when a subsequent sibling matches', () => {
      const parent = document.createElement('div');
      const target = document.createElement('div');
      const sibling1 = document.createElement('div');
      const sibling2 = document.createElement('div');
      sibling2.className = 'match';
      const sibling3 = document.createElement('div');
      parent.appendChild(target);
      parent.appendChild(sibling1);
      parent.appendChild(sibling2);
      parent.appendChild(sibling3);
      document.getElementById('div0').appendChild(parent);
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [
                  { name: '~', type: COMBINATOR },
                  { name: 'match', type: CLASS_SELECTOR }
                ]
              }
            ]
          }
        ]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, target, {}),
        true,
        'returns true when a subsequent sibling matches'
      );
    });

    it('should return false when no subsequent siblings match', () => {
      const parent = document.createElement('div');
      const target = document.createElement('div');
      const sibling1 = document.createElement('div');
      const sibling2 = document.createElement('div');
      parent.appendChild(target);
      parent.appendChild(sibling1);
      parent.appendChild(sibling2);
      document.getElementById('div0').appendChild(parent);
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [
                  { name: '~', type: COMBINATOR },
                  { name: 'match', type: CLASS_SELECTOR }
                ]
              }
            ]
          }
        ]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, target, {}),
        false,
        'returns false when siblings exist but none match'
      );
    });

    it('fails quickly if no subsequent siblings exist', () => {
      const parent = document.createElement('div');
      const sibling1 = document.createElement('div');
      const target = document.createElement('div');
      parent.appendChild(sibling1);
      parent.appendChild(target);
      document.getElementById('div0').appendChild(parent);
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [
                  { name: '~', type: COMBINATOR },
                  { name: 'match', type: CLASS_SELECTOR }
                ]
              }
            ]
          }
        ]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, target, {}),
        false,
        'returns false immediately if no next siblings exist'
      );
    });

    it('evaluates nextElementSibling for "+" combinator in :has()', () => {
      const parent = document.createElement('div');
      const targetMatch = document.createElement('div');
      const targetFail = document.createElement('div');
      const targetLast = document.createElement('div');
      const siblingMatch = document.createElement('div');
      siblingMatch.className = 'match';
      const siblingFail = document.createElement('div');
      siblingFail.className = 'no-match';
      parent.appendChild(targetMatch);
      parent.appendChild(siblingMatch);
      parent.appendChild(targetFail);
      parent.appendChild(siblingFail);
      parent.appendChild(targetLast);
      document.getElementById('div0').appendChild(parent);
      const ast = {
        name: 'has',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR_LIST,
            children: [
              {
                type: SELECTOR,
                children: [
                  { name: '+', type: COMBINATOR },
                  { name: 'match', type: CLASS_SELECTOR }
                ]
              }
            ]
          }
        ]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, targetMatch, {}),
        true,
        'returns true when nextElementSibling matches the condition'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, targetFail, {}),
        false,
        'returns false when nextElementSibling does not match'
      );
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, targetLast, {}),
        false,
        'returns false immediately when nextElementSibling is null'
      );
      parent.remove();
    });

    describe('ID_SELECTOR fast path in #hasCombinatorMatch', () => {
      it('should return true when element matches ID and is last leaf', () => {
        const parent = document.createElement('div');
        const child = document.createElement('div');
        child.id = 'fast-id';
        parent.appendChild(child);
        document.getElementById('div0').appendChild(parent);
        const ast = {
          name: 'has',
          type: PS_CLASS_SELECTOR,
          children: [
            {
              type: SELECTOR_LIST,
              children: [
                {
                  type: SELECTOR,
                  children: [{ name: 'fast-id', type: ID_SELECTOR }]
                }
              ]
            }
          ]
        };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
          true,
          'returns true using getElementById fast path'
        );
      });

      it('should evaluate filterLeaves in fast path and return true', () => {
        const parent = document.createElement('div');
        const child = document.createElement('div');
        child.id = 'fast-id-filter';
        child.className = 'match';
        parent.appendChild(child);
        document.getElementById('div0').appendChild(parent);
        const ast = {
          name: 'has',
          type: PS_CLASS_SELECTOR,
          children: [
            {
              type: SELECTOR_LIST,
              children: [
                {
                  type: SELECTOR,
                  children: [
                    { name: 'fast-id-filter', type: ID_SELECTOR },
                    { name: 'match', type: CLASS_SELECTOR }
                  ]
                }
              ]
            }
          ]
        };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
          true,
          'returns true when filterLeaves match in ID fast path'
        );
      });

      it('fails if filterLeaves do not match in fast path', () => {
        const parent = document.createElement('div');
        const child = document.createElement('div');
        child.id = 'fast-id-filter-fail';
        child.className = 'no-match';
        parent.appendChild(child);
        document.getElementById('div0').appendChild(parent);
        const ast = {
          name: 'has',
          type: PS_CLASS_SELECTOR,
          children: [
            {
              type: SELECTOR_LIST,
              children: [
                {
                  type: SELECTOR,
                  children: [
                    { name: 'fast-id-filter-fail', type: ID_SELECTOR },
                    { name: 'match', type: CLASS_SELECTOR }
                  ]
                }
              ]
            }
          ]
        };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
          false,
          'returns false when filterLeaves fail'
        );
      });

      it('recurses into remainingLeaves from fast path', () => {
        const parent = document.createElement('div');
        const child = document.createElement('div');
        child.id = 'fast-id-recurse';
        const grandChild = document.createElement('span');
        grandChild.className = 'inner-target';
        child.appendChild(grandChild);
        parent.appendChild(child);
        document.getElementById('div0').appendChild(parent);
        const ast = {
          name: 'has',
          type: PS_CLASS_SELECTOR,
          children: [
            {
              type: SELECTOR_LIST,
              children: [
                {
                  type: SELECTOR,
                  children: [
                    { name: 'fast-id-recurse', type: ID_SELECTOR },
                    { name: '>', type: COMBINATOR },
                    { name: 'inner-target', type: CLASS_SELECTOR }
                  ]
                }
              ]
            }
          ]
        };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
          true,
          'recursively checks remainingLeaves and returns true'
        );
      });

      it('fails recursing into remainingLeaves fast path', () => {
        const parent = document.createElement('div');
        const child = document.createElement('div');
        child.id = 'fast-id-recurse-fail';
        parent.appendChild(child);
        document.getElementById('div0').appendChild(parent);
        const ast = {
          name: 'has',
          type: PS_CLASS_SELECTOR,
          children: [
            {
              type: SELECTOR_LIST,
              children: [
                {
                  type: SELECTOR,
                  children: [
                    { name: 'fast-id-recurse-fail', type: ID_SELECTOR },
                    { name: '>', type: COMBINATOR },
                    { name: 'inner-target', type: CLASS_SELECTOR }
                  ]
                }
              ]
            }
          ]
        };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
          false,
          'recursively checks remainingLeaves and returns false'
        );
      });

      it('should return false when ID element does not exist', () => {
        const parent = document.createElement('div');
        document.getElementById('div0').appendChild(parent);
        const ast = {
          name: 'has',
          type: PS_CLASS_SELECTOR,
          children: [
            {
              type: SELECTOR_LIST,
              children: [
                {
                  type: SELECTOR,
                  children: [{ name: 'non-existent-id', type: ID_SELECTOR }]
                }
              ]
            }
          ]
        };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
          false,
          'returns false when getElementById returns null'
        );
      });

      it('fails if found ID element is the node itself', () => {
        const parent = document.createElement('div');
        parent.id = 'self-id';
        document.getElementById('div0').appendChild(parent);
        const ast = {
          name: 'has',
          type: PS_CLASS_SELECTOR,
          children: [
            {
              type: SELECTOR_LIST,
              children: [
                {
                  type: SELECTOR,
                  children: [{ name: 'self-id', type: ID_SELECTOR }]
                }
              ]
            }
          ]
        };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
          false,
          'returns false because node cannot match its own descendant condition'
        );
      });

      it('fails if found ID element is not in the node', () => {
        const parent = document.createElement('div');
        const sibling = document.createElement('div');
        sibling.id = 'sibling-id';
        document.getElementById('div0').appendChild(parent);
        document.getElementById('div0').appendChild(sibling);
        const ast = {
          name: 'has',
          type: PS_CLASS_SELECTOR,
          children: [
            {
              type: SELECTOR_LIST,
              children: [
                {
                  type: SELECTOR,
                  children: [{ name: 'sibling-id', type: ID_SELECTOR }]
                }
              ]
            }
          ]
        };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
          false,
          'returns false because foundNode is outside the scope of node'
        );
      });
    });

    describe('CLASS_SELECTOR fast path in #hasCombinatorMatch', () => {
      it('matches if element matches class as last leaf', () => {
        const parent = document.createElement('div');
        const child = document.createElement('div');
        child.className = 'fast-class';
        parent.appendChild(child);
        document.getElementById('div0').appendChild(parent);
        const ast = {
          name: 'has',
          type: PS_CLASS_SELECTOR,
          children: [
            {
              type: SELECTOR_LIST,
              children: [
                {
                  type: SELECTOR,
                  children: [{ name: 'fast-class', type: CLASS_SELECTOR }]
                }
              ]
            }
          ]
        };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
          true,
          'returns true using getElementsByClassName fast path'
        );
      });

      it('should evaluate filterLeaves fast path and return true', () => {
        const parent = document.createElement('div');
        const child1 = document.createElement('div');
        child1.className = 'fast-class no-match';
        const child2 = document.createElement('div');
        child2.className = 'fast-class match';
        parent.appendChild(child1);
        parent.appendChild(child2);
        document.getElementById('div0').appendChild(parent);
        const ast = {
          name: 'has',
          type: PS_CLASS_SELECTOR,
          children: [
            {
              type: SELECTOR_LIST,
              children: [
                {
                  type: SELECTOR,
                  children: [
                    { name: 'fast-class', type: CLASS_SELECTOR },
                    { name: 'match', type: CLASS_SELECTOR }
                  ]
                }
              ]
            }
          ]
        };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
          true,
          'returns true when filterLeaves match in class fast path'
        );
      });

      it('fails when filterLeaves do not match in fast path', () => {
        const parent = document.createElement('div');
        const child = document.createElement('div');
        child.className = 'fast-class no-match';
        parent.appendChild(child);
        document.getElementById('div0').appendChild(parent);
        const ast = {
          name: 'has',
          type: PS_CLASS_SELECTOR,
          children: [
            {
              type: SELECTOR_LIST,
              children: [
                {
                  type: SELECTOR,
                  children: [
                    { name: 'fast-class', type: CLASS_SELECTOR },
                    { name: 'match', type: CLASS_SELECTOR }
                  ]
                }
              ]
            }
          ]
        };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
          false,
          'returns false when filterLeaves fail'
        );
      });

      it('recurses into remainingLeaves from fast path', () => {
        const parent = document.createElement('div');
        const child = document.createElement('div');
        child.className = 'fast-class';
        const grandChild = document.createElement('span');
        grandChild.className = 'inner-target';
        child.appendChild(grandChild);
        parent.appendChild(child);
        document.getElementById('div0').appendChild(parent);
        const ast = {
          name: 'has',
          type: PS_CLASS_SELECTOR,
          children: [
            {
              type: SELECTOR_LIST,
              children: [
                {
                  type: SELECTOR,
                  children: [
                    { name: 'fast-class', type: CLASS_SELECTOR },
                    { name: '>', type: COMBINATOR },
                    { name: 'inner-target', type: CLASS_SELECTOR }
                  ]
                }
              ]
            }
          ]
        };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
          true,
          'recursively checks remainingLeaves and returns true'
        );
      });

      it('fails recursing into remainingLeaves fast path', () => {
        const parent = document.createElement('div');
        const child = document.createElement('div');
        child.className = 'fast-class';
        parent.appendChild(child);
        document.getElementById('div0').appendChild(parent);
        const ast = {
          name: 'has',
          type: PS_CLASS_SELECTOR,
          children: [
            {
              type: SELECTOR_LIST,
              children: [
                {
                  type: SELECTOR,
                  children: [
                    { name: 'fast-class', type: CLASS_SELECTOR },
                    { name: '>', type: COMBINATOR },
                    { name: 'inner-target', type: CLASS_SELECTOR }
                  ]
                }
              ]
            }
          ]
        };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
          false,
          'recursively checks remainingLeaves and returns false'
        );
      });
    });

    describe('TYPE_SELECTOR fast path', () => {
      it('matches if element matches type as last leaf', () => {
        const parent = document.createElement('div');
        const child = document.createElement('span');
        parent.appendChild(child);
        document.getElementById('div0').appendChild(parent);
        const ast = {
          name: 'has',
          type: PS_CLASS_SELECTOR,
          children: [
            {
              type: SELECTOR_LIST,
              children: [
                {
                  type: SELECTOR,
                  children: [{ name: 'span', type: TYPE_SELECTOR }]
                }
              ]
            }
          ]
        };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
          true,
          'returns true using getElementsByTagName fast path'
        );
      });

      it('should evaluate filterLeaves fast path and return true', () => {
        const parent = document.createElement('div');
        const child1 = document.createElement('span');
        child1.className = 'no-match';
        const child2 = document.createElement('span');
        child2.className = 'match';
        parent.appendChild(child1);
        parent.appendChild(child2);
        document.getElementById('div0').appendChild(parent);
        const ast = {
          name: 'has',
          type: PS_CLASS_SELECTOR,
          children: [
            {
              type: SELECTOR_LIST,
              children: [
                {
                  type: SELECTOR,
                  children: [
                    { name: 'span', type: TYPE_SELECTOR },
                    { name: 'match', type: CLASS_SELECTOR }
                  ]
                }
              ]
            }
          ]
        };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
          true,
          'returns true when filterLeaves match in type fast path'
        );
      });

      it('fails when filterLeaves do not match in fast path', () => {
        const parent = document.createElement('div');
        const child = document.createElement('span');
        child.className = 'no-match';
        parent.appendChild(child);
        document.getElementById('div0').appendChild(parent);
        const ast = {
          name: 'has',
          type: PS_CLASS_SELECTOR,
          children: [
            {
              type: SELECTOR_LIST,
              children: [
                {
                  type: SELECTOR,
                  children: [
                    { name: 'span', type: TYPE_SELECTOR },
                    { name: 'match', type: CLASS_SELECTOR }
                  ]
                }
              ]
            }
          ]
        };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
          false,
          'returns false when filterLeaves fail'
        );
      });

      it('recurses into remainingLeaves from fast path', () => {
        const parent = document.createElement('div');
        const child = document.createElement('span');
        const grandChild = document.createElement('p');
        child.appendChild(grandChild);
        parent.appendChild(child);
        document.getElementById('div0').appendChild(parent);
        const ast = {
          name: 'has',
          type: PS_CLASS_SELECTOR,
          children: [
            {
              type: SELECTOR_LIST,
              children: [
                {
                  type: SELECTOR,
                  children: [
                    { name: 'span', type: TYPE_SELECTOR },
                    { name: '>', type: COMBINATOR },
                    { name: 'p', type: TYPE_SELECTOR }
                  ]
                }
              ]
            }
          ]
        };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
          true,
          'recursively checks remainingLeaves and returns true'
        );
      });

      it('fails recursing into remainingLeaves from fast path', () => {
        const parent = document.createElement('div');
        const child = document.createElement('span');
        parent.appendChild(child);
        document.getElementById('div0').appendChild(parent);
        const ast = {
          name: 'has',
          type: PS_CLASS_SELECTOR,
          children: [
            {
              type: SELECTOR_LIST,
              children: [
                {
                  type: SELECTOR,
                  children: [
                    { name: 'span', type: TYPE_SELECTOR },
                    { name: '>', type: COMBINATOR },
                    { name: 'p', type: TYPE_SELECTOR }
                  ]
                }
              ]
            }
          ]
        };
        assert.strictEqual(
          pseudoEvaluator.matchPseudoClassSelector(ast, parent, {}),
          false,
          'recursively checks remainingLeaves and returns false'
        );
      });
    });
  });

  describe('match pseudo class selector - Unknown & Errors', () => {
    it('should throw DOMException for unknown pseudo-class :foo', () => {
      const leaf = {
        children: null,
        name: 'foo',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      assert.throws(
        () => pseudoEvaluator.matchPseudoClassSelector(leaf, node, {}),
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
      const res = pseudoEvaluator.matchPseudoClassSelector(leaf, node, {
        forgive: true
      });
      assert.strictEqual(res, false, 'result');
    });

    it('should ignore :host', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const ast = {
        name: 'host',
        type: PS_CLASS_SELECTOR
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, node, {}),
        false,
        'returns false'
      );
    });

    it('should return false for :popover-open', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const ast = {
        name: 'popover-open',
        type: PS_CLASS_SELECTOR
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, node, {}),
        false,
        'returns false'
      );
    });

    it('should return false for :visited', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const ast = {
        name: 'visited',
        type: PS_CLASS_SELECTOR
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, node, {}),
        false,
        'returns false'
      );
    });

    it('fails silently for legacy pseudo-element', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const ast = {
        name: 'after',
        type: PS_CLASS_SELECTOR
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, node, {}),
        false,
        'returns false without throwing'
      );
    });

    it('warns for legacy pseudo-element', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const leaf = {
        children: null,
        name: 'after',
        type: PS_CLASS_SELECTOR
      };
      assert.throws(
        () =>
          pseudoEvaluator.matchPseudoClassSelector(leaf, node, { warn: true }),
        e => {
          assert.strictEqual(e.name, NOT_SUPPORTED_ERR);
          assert.strictEqual(e.message, 'Unsupported pseudo-element ::after');
          return true;
        }
      );
      assert.strictEqual(
        mockEvaluator.onError.called,
        true,
        'onError was called for unsupported pseudo-class'
      );
      node.remove();
    });

    it('fails silently for unsupported pseudo-class', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const ast = {
        name: 'autofill',
        type: PS_CLASS_SELECTOR
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, node, {}),
        false,
        'returns false without throwing'
      );
    });

    it('warns for unsupported pseudo-class', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const leaf = {
        children: null,
        name: 'autofill',
        type: PS_CLASS_SELECTOR
      };
      assert.throws(
        () =>
          pseudoEvaluator.matchPseudoClassSelector(leaf, node, { warn: true }),
        e => {
          assert.strictEqual(e.name, NOT_SUPPORTED_ERR);
          assert.strictEqual(e.message, 'Unsupported pseudo-class :autofill');
          return true;
        }
      );
      assert.strictEqual(
        mockEvaluator.onError.called,
        true,
        'onError was called for unsupported pseudo-class'
      );
      node.remove();
    });

    it('fails silently for unsupported pseudo-class function', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const ast = {
        name: 'current',
        type: PS_CLASS_SELECTOR,
        children: [{ value: '1', name: '1', type: IDENT }]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, node, {}),
        false,
        'returns false without throwing'
      );
    });

    it('warns for unsupported pseudo-class function', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const leaf = {
        name: 'current',
        type: PS_CLASS_SELECTOR,
        children: [{ value: '1', name: '1', type: IDENT }]
      };
      assert.throws(
        () =>
          pseudoEvaluator.matchPseudoClassSelector(leaf, node, { warn: true }),
        e => {
          assert.strictEqual(e.name, NOT_SUPPORTED_ERR);
          assert.strictEqual(e.message, 'Unsupported pseudo-class :current()');
          return true;
        }
      );
      assert.strictEqual(
        mockEvaluator.onError.called,
        true,
        'onError was called for unsupported pseudo-class function'
      );
      node.remove();
    });

    it('fails silently for vendor-prefixed :-webkit-foo selector', () => {
      const leaf = {
        children: null,
        name: '-webkit-foo',
        type: PS_CLASS_SELECTOR
      };
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const res = pseudoEvaluator.matchPseudoClassSelector(leaf, node, {});
      assert.strictEqual(res, false, 'result');
    });

    it('warns for -webkit- pseudo-class when warn is true', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const leaf = {
        children: null,
        name: '-webkit-scrollbar',
        type: PS_CLASS_SELECTOR
      };
      assert.throws(
        () =>
          pseudoEvaluator.matchPseudoClassSelector(leaf, node, { warn: true }),
        e => {
          assert.strictEqual(e.name, NOT_SUPPORTED_ERR);
          assert.strictEqual(
            e.message,
            'Unsupported pseudo-class :-webkit-scrollbar'
          );
          return true;
        }
      );
      assert.strictEqual(
        mockEvaluator.onError.called,
        true,
        'onError was called for -webkit- pseudo-class'
      );
      node.remove();
    });

    it('warns for deprecated :contains() pseudo-class', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const ast = {
        name: 'contains',
        type: PS_CLASS_SELECTOR,
        children: [{ value: 'text', name: 'text', type: IDENT }]
      };
      assert.throws(
        () =>
          pseudoEvaluator.matchPseudoClassSelector(ast, node, { warn: true }),
        e => {
          assert.strictEqual(e.name, NOT_SUPPORTED_ERR);
          assert.strictEqual(e.message, 'Unknown pseudo-class :contains()');
          return true;
        }
      );
      assert.strictEqual(
        mockEvaluator.onError.calledOnce,
        true,
        'onError was called for :contains()'
      );
      node.remove();
    });

    it('fails silently for :contains() when warn is false', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const ast = {
        name: 'contains',
        type: PS_CLASS_SELECTOR,
        children: [{ value: 'text', name: 'text', type: IDENT }]
      };
      assert.strictEqual(
        pseudoEvaluator.matchPseudoClassSelector(ast, node, {}),
        false,
        'returns false without throwing'
      );
      node.remove();
    });
  });
});
