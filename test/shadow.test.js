/**
 * shadow.test.js
 */

/* api */
import { strict as assert } from 'node:assert';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';

/* test */
import { ShadowDOMEvaluator } from '../src/js/shadow.js';

/* constants */
import {
  CLASS_SELECTOR,
  COMBINATOR,
  ID_SELECTOR,
  PS_CLASS_SELECTOR,
  SELECTOR,
  SYNTAX_ERR
} from '../src/js/constant.js';

describe('ShadowDOMEvaluator', () => {
  let window, document, host, shadowRoot, mockEvaluator, shadowEvaluator;

  beforeEach(() => {
    const dom = new JSDOM(
      `<!doctype html><html><body><div id="host"></div></body></html>`
    );
    window = dom.window;
    document = dom.window.document;
    host = document.getElementById('host');
    shadowRoot = host.attachShadow({ mode: 'open' });
    mockEvaluator = {
      window,
      onError: sinon.spy(),
      matchPseudoClassSelector: sinon.stub().returns(false),
      matchSelector: sinon.stub().returns(false)
    };
    shadowEvaluator = new ShadowDOMEvaluator(mockEvaluator);
  });

  afterEach(() => {
    window.close();
    window = null;
    document = null;
  });

  describe('constructor & state management', () => {
    it('should initialize with verifyShadowHost as false', () => {
      assert.strictEqual(
        shadowEvaluator.verifyShadowHost,
        false,
        'initial state is false'
      );
    });

    it('should reset verifyShadowHost to false via reset()', () => {
      shadowEvaluator.matchSelectorForShadowRoot(
        { name: 'host', type: PS_CLASS_SELECTOR, children: null },
        shadowRoot
      );
      assert.strictEqual(
        shadowEvaluator.verifyShadowHost,
        true,
        'state changed to true'
      );
      shadowEvaluator.reset();
      assert.strictEqual(
        shadowEvaluator.verifyShadowHost,
        false,
        'state reset to false'
      );
    });
  });

  describe('matchSelectorForShadowRoot', () => {
    it('should delegate logical pseudo-classes to matchPseudoClassSelector', () => {
      const ast = { name: 'is', type: PS_CLASS_SELECTOR };
      const opt = {};
      mockEvaluator.matchPseudoClassSelector.returns(true);
      const res = shadowEvaluator.matchSelectorForShadowRoot(
        ast,
        shadowRoot,
        opt
      );
      assert.strictEqual(res, true, 'result');
      assert.strictEqual(opt.isShadowRoot, true, 'isShadowRoot flag is set');
      assert.strictEqual(
        mockEvaluator.matchPseudoClassSelector.calledOnce,
        true,
        'delegated to evaluator'
      );
    });

    it('should evaluate :host and set verifyShadowHost on match', () => {
      const ast = { name: 'host', type: PS_CLASS_SELECTOR, children: null };
      const res = shadowEvaluator.matchSelectorForShadowRoot(ast, shadowRoot);
      assert.strictEqual(res, true, 'result');
      assert.strictEqual(
        shadowEvaluator.verifyShadowHost,
        true,
        'verifyShadowHost is set'
      );
    });

    it('should return false for non-shadow-root pseudo-classes', () => {
      const ast = { name: 'hover', type: PS_CLASS_SELECTOR };
      const res = shadowEvaluator.matchSelectorForShadowRoot(ast, shadowRoot);
      assert.strictEqual(res, false, 'result');
      assert.strictEqual(
        shadowEvaluator.verifyShadowHost,
        false,
        'verifyShadowHost remains false'
      );
    });

    it('should support comma-separated list like :host(.a, .b)', () => {
      const ast = {
        name: 'host',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR,
            children: [{ name: 'a', type: CLASS_SELECTOR }]
          },
          {
            type: SELECTOR,
            children: [{ name: 'b', type: CLASS_SELECTOR }]
          }
        ]
      };
      mockEvaluator.matchSelector.returns(true);
      const res = shadowEvaluator.evaluateShadowHost(ast, shadowRoot);
      assert.strictEqual(
        mockEvaluator.onError.called,
        false,
        'should not call onError for valid comma-separated selectors'
      );
      assert.strictEqual(res, true, 'result should be true if any selector matches');
    });

    it('should traverse across multiple shadow boundaries', () => {
      const outerHost = document.createElement('div');
      document.body.appendChild(outerHost);
      const outerShadow = outerHost.attachShadow({ mode: 'open' });
      const innerHost = document.createElement('div');
      outerShadow.appendChild(innerHost);
      const innerShadow = innerHost.attachShadow({ mode: 'open' });
      const ast = {
        name: 'host-context',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR,
            children: [{ name: 'foo', type: CLASS_SELECTOR }]
          }
        ]
      };
      mockEvaluator.matchSelector.withArgs(sinon.match.any, innerHost).returns(false);
      mockEvaluator.matchSelector.withArgs(sinon.match.any, outerShadow).returns(false);
      mockEvaluator.matchSelector.withArgs(sinon.match.any, outerHost).returns(true);
      const res = shadowEvaluator.evaluateShadowHost(ast, innerShadow);
      assert.strictEqual(
        res,
        true,
        'should traverse through shadow boundaries to find matching ancestor'
      );
    });
  });

  describe('evaluateShadowHost - Error Handling', () => {
    it('should call onError with SYNTAX_ERR for unknown parameterless pseudo-class', () => {
      const ast = { name: 'foobar', type: PS_CLASS_SELECTOR, children: null };
      const res = shadowEvaluator.evaluateShadowHost(ast, shadowRoot);
      assert.strictEqual(res, false, 'result');
      assert.strictEqual(
        mockEvaluator.onError.calledOnce,
        true,
        'onError called'
      );
      assert.strictEqual(
        mockEvaluator.onError.args[0][0].name,
        SYNTAX_ERR,
        'error is SYNTAX_ERR'
      );
    });

    it('should call onError with SYNTAX_ERR for unknown function pseudo-class', () => {
      const ast = { name: 'foobar', type: PS_CLASS_SELECTOR, children: [] };
      const res = shadowEvaluator.evaluateShadowHost(ast, shadowRoot);
      assert.strictEqual(res, false, 'result');
      assert.strictEqual(
        mockEvaluator.onError.calledOnce,
        true,
        'onError called'
      );
    });

    it('should call onError with SYNTAX_ERR when arguments length !== 1', () => {
      const ast = { name: 'host', type: PS_CLASS_SELECTOR, children: [] };
      const res = shadowEvaluator.evaluateShadowHost(ast, shadowRoot);
      assert.strictEqual(res, false, 'result');
      assert.strictEqual(
        mockEvaluator.onError.calledOnce,
        true,
        'onError called'
      );
    });
  });

  describe('evaluateShadowHost - :host() matching', () => {
    it('should return true for parameterless :host', () => {
      const ast = { name: 'host', type: PS_CLASS_SELECTOR, children: null };
      const res = shadowEvaluator.evaluateShadowHost(ast, shadowRoot);
      assert.strictEqual(res, true, 'result');
    });

    it('should return true if internal evaluator matches host element', () => {
      const ast = {
        name: 'host',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR,
            children: [{ name: 'foo', type: ID_SELECTOR }]
          }
        ]
      };
      mockEvaluator.matchSelector.withArgs(sinon.match.any, host).returns(true);
      const res = shadowEvaluator.evaluateShadowHost(ast, shadowRoot);
      assert.strictEqual(res, true, 'result');
      assert.strictEqual(
        mockEvaluator.matchSelector.calledOnce,
        true,
        'evaluator matched host'
      );
    });

    it('should return false if internal evaluator fails to match host element', () => {
      const ast = {
        name: 'host',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR,
            children: [{ name: 'foo', type: ID_SELECTOR }]
          }
        ]
      };
      mockEvaluator.matchSelector
        .withArgs(sinon.match.any, host)
        .returns(false);
      const res = shadowEvaluator.evaluateShadowHost(ast, shadowRoot);
      assert.strictEqual(res, false, 'result');
    });

    it('should call onError for :host() containing combinators', () => {
      const ast = {
        name: 'host',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR,
            children: [
              { name: 'foo', type: ID_SELECTOR },
              { name: ' ', type: COMBINATOR },
              { name: 'bar', type: ID_SELECTOR }
            ]
          }
        ]
      };
      mockEvaluator.matchSelector.returns(true);
      const res = shadowEvaluator.evaluateShadowHost(ast, shadowRoot);
      assert.strictEqual(res, false, 'result');
      assert.strictEqual(
        mockEvaluator.onError.calledOnce,
        true,
        'onError called due to combinator'
      );
    });
  });

  describe('evaluateShadowHost - :host-context() matching', () => {
    it('should call onError for parameterless :host-context', () => {
      const ast = {
        name: 'host-context',
        type: PS_CLASS_SELECTOR,
        children: null
      };
      const res = shadowEvaluator.evaluateShadowHost(ast, shadowRoot);
      assert.strictEqual(res, false, 'result');
      assert.strictEqual(
        mockEvaluator.onError.calledOnce,
        true,
        'onError called'
      );
    });

    it('should traverse up and return true if an ancestor matches', () => {
      const ast = {
        name: 'host-context',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR,
            children: [{ name: 'foo', type: ID_SELECTOR }]
          }
        ]
      };
      mockEvaluator.matchSelector
        .withArgs(sinon.match.any, host)
        .returns(false);
      mockEvaluator.matchSelector
        .withArgs(sinon.match.any, document.body)
        .returns(true);
      const res = shadowEvaluator.evaluateShadowHost(ast, shadowRoot);
      assert.strictEqual(res, true, 'result');
      assert.strictEqual(
        mockEvaluator.matchSelector.calledTwice,
        true,
        'traversed upwards'
      );
    });

    it('should return false if no ancestor matches', () => {
      const ast = {
        name: 'host-context',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR,
            children: [{ name: 'foo', type: ID_SELECTOR }]
          }
        ]
      };
      mockEvaluator.matchSelector.returns(false);
      const res = shadowEvaluator.evaluateShadowHost(ast, shadowRoot);
      assert.strictEqual(res, false, 'result');
    });

    it('should call onError for :host-context() containing combinators', () => {
      const ast = {
        name: 'host-context',
        type: PS_CLASS_SELECTOR,
        children: [
          {
            type: SELECTOR,
            children: [
              { name: 'foo', type: ID_SELECTOR },
              { name: '>', type: COMBINATOR },
              { name: 'bar', type: ID_SELECTOR }
            ]
          }
        ]
      };
      mockEvaluator.matchSelector.returns(true);
      const res = shadowEvaluator.evaluateShadowHost(ast, shadowRoot);
      assert.strictEqual(res, false, 'result');
      assert.strictEqual(
        mockEvaluator.onError.calledOnce,
        true,
        'onError called due to combinator'
      );
    });
  });
});
