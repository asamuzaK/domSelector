/**
 * pseudo-evaluator.test.js
 */

/* api */
import { strict as assert } from 'node:assert';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, it } from 'mocha';

/* test */
import { Finder } from '../src/js/finder.js';
import { PseudoClassEvaluator } from '../src/js/pseudo-evaluator.js';

/* constants */
import { PS_CLASS_SELECTOR } from '../src/js/constant.js';

describe('PseudoClassEvaluator Coverage Suite', () => {
  let window, document, finder, evaluator, container;

  beforeEach(() => {
    const dom = new JSDOM(
      `<!doctype html><html lang="en"><head></head><body><div id="container"></div></body></html>`,
      {
        runScripts: 'dangerously',
        url: 'http://localhost/test/path#test-target'
      }
    );
    window = dom.window;
    document = dom.window.document;
    container = document.getElementById('container');

    finder = new Finder(window);
    // Mock: Document URL resolution
    finder.getDocumentURL = () => new URL('http://localhost/#test-target');
    evaluator = new PseudoClassEvaluator(finder);
  });

  afterEach(() => {
    window.close();
  });

  const getPseudoAST = selector => {
    const [ast] = finder._correspond(selector);
    for (const item of ast) {
      for (const twig of item.branch) {
        for (const leaf of twig.leaves) {
          if (leaf.type === PS_CLASS_SELECTOR) {
            return leaf;
          }
        }
      }
    }
    return ast[0].branch[0].leaves[0];
  };

  const evaluate = (selector, node, opt = {}) => {
    return evaluator.evaluate(getPseudoAST(selector), node, opt);
  };

  describe('_collectNthChild - Standard Child Collection', () => {
    let parent, child1, child2, child3;

    beforeEach(() => {
      parent = document.createElement('div');
      child1 = document.createElement('p'); // Index 1
      child2 = document.createElement('span'); // Filter target
      child3 = document.createElement('p'); // Index 2 (target)

      parent.append(child1, child2, child3);
      document.body.appendChild(parent);
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should match a child node using An+B formula without selector', () => {
      finder.setup('*', child3);

      const anb = { a: 0, b: 3, selector: null };
      const res = evaluator._collectNthChild(anb, child3, {});

      assert.strictEqual(
        res.has(child3),
        true,
        'Should match child3 as the 3rd child overall'
      );
    });

    it('should match a child node using An+B formula WITH selector', () => {
      finder.setup('*', child3);

      const pSelectorAst = {
        type: 'Selector',
        children: [{ type: 'TypeSelector', name: 'p' }]
      };

      const anb = { a: 0, b: 2, selector: pSelectorAst };
      const res = evaluator._collectNthChild(anb, child3, {});

      assert.strictEqual(
        res.has(child3),
        true,
        'Should match child3 as the 2nd p element'
      );
    });

    it('should return empty set if the formula does not match the child', () => {
      finder.setup('*', child1);

      const anb = { a: 0, b: 99, selector: null };
      const res = evaluator._collectNthChild(anb, child1, {});

      assert.strictEqual(
        res.size,
        0,
        'Should return empty set when b is out of range'
      );
    });
  });

  describe('_collectNthChild - Root Node (no parentNode)', () => {
    it('should match the root node when no selector is provided and b=1', () => {
      const rootNode = document.createElement('div');
      finder.setup('div', rootNode);

      const anb = { a: 0, b: 1, selector: null };
      const res = evaluator._collectNthChild(anb, rootNode, {});

      assert.strictEqual(res.has(rootNode), true, 'Should match the root node');
    });

    it('should match the root node when selector is provided and matches', () => {
      const rootNode = document.createElement('div');
      rootNode.classList.add('target');
      finder.setup('div', rootNode);

      const mockSelector = {
        type: 'Selector',
        children: [{ type: 'ClassSelector', name: 'target' }]
      };

      const anb = { a: 0, b: 1, selector: mockSelector };
      const res = evaluator._collectNthChild(anb, rootNode, {});

      assert.strictEqual(
        res.has(rootNode),
        true,
        'Should match root node with matching selector'
      );
    });

    it('should return empty set when root node does not match selector', () => {
      const rootNode = document.createElement('div');
      finder.setup('div', rootNode);

      const mockSelector = {
        type: 'Selector',
        children: [{ type: 'ClassSelector', name: 'wrong-class' }]
      };

      const anb = { a: 0, b: 1, selector: mockSelector };
      const res = evaluator._collectNthChild(anb, rootNode, {});

      assert.strictEqual(
        res.size,
        0,
        'Should not match root node with mismatched selector'
      );
    });

    it('should return empty set when a + b !== 1', () => {
      const rootNode = document.createElement('div');
      finder.setup('div', rootNode);

      const anb = { a: 0, b: 2, selector: null };
      const res = evaluator._collectNthChild(anb, rootNode, {});

      assert.strictEqual(
        res.size,
        0,
        'Should return empty set when formula != 1'
      );
    });
  });

  describe('_collectNthOfType - Comprehensive Coverage', () => {
    it('should cover the root node case when parentNode is missing', () => {
      const root = document.createElement('html');
      finder.setup('html', root);

      const res1 = evaluator._collectNthOfType({ a: 0, b: 1 }, root);
      assert.strictEqual(
        res1.has(root),
        true,
        'Should match root node when formula results in 1'
      );

      const res2 = evaluator._collectNthOfType({ a: 0, b: 2 }, root);
      assert.strictEqual(
        res2.size,
        0,
        'Should not match root node when formula results in other than 1'
      );
    });

    it('should cover sibling traversal with namespace and prefix matching', () => {
      const parent = document.createElement('div');

      const p1 = document.createElement('p');
      const span = document.createElement('span'); // Different type
      const p2 = document.createElement('p');

      const svgNamespace = 'http://www.w3.org/2000/svg';
      const svg1 = document.createElementNS(svgNamespace, 'svg:circle');
      const svg2 = document.createElementNS(svgNamespace, 'svg:circle');

      parent.append(p1, span, p2, svg1, svg2);
      container.appendChild(parent);

      finder.setup('*', p2);
      const res3 = evaluator._collectNthOfType({ a: 0, b: 2 }, p2);
      assert.strictEqual(
        res3.has(p2),
        true,
        'Should match the second p element'
      );

      finder.setup('*', svg2);
      const res4 = evaluator._collectNthOfType({ a: 0, b: 2 }, svg2);
      assert.strictEqual(
        res4.has(svg2),
        true,
        'Should match the second SVG circle including namespace/prefix'
      );
    });
  });

  describe(':nth-child & :nth-of-type (An+B)', () => {
    it('should evaluate nth formulas comprehensively', () => {
      const ul = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      ul.append(li1, li2, li3);
      container.appendChild(ul);
      finder.setup('li', li2);

      assert.deepEqual([...evaluate(':nth-child(even)', li2)], [li2]);
      assert.deepEqual([...evaluate(':nth-child(odd)', li1)], [li1, li3]);
      assert.deepEqual([...evaluate(':nth-child(2n+1)', li1)], [li1, li3]);
      assert.deepEqual([...evaluate(':nth-last-child(1)', li3)], [li3]);
      assert.deepEqual([...evaluate(':nth-of-type(even)', li2)], [li2]);
      assert.deepEqual([...evaluate(':nth-last-of-type(1)', li3)], [li3]);
      assert.deepEqual([...evaluate(':nth-child(n)', li2)], [li1, li2, li3]);
    });

    it('should handle root nodes without parentNode', () => {
      const root = document.documentElement;
      finder.setup('*', root);
      assert.strictEqual(evaluate(':nth-child(1)', root).size, 1);
      assert.strictEqual(evaluate(':nth-child(2)', root).size, 0);
      assert.strictEqual(evaluate(':nth-of-type(1)', root).size, 1);
      assert.strictEqual(evaluate(':nth-of-type(2)', root).size, 0);
    });

    it('should directly match finder.root for nth-of-type family pseudos', () => {
      const standaloneNode = document.createElement('div');
      finder.setup('*', standaloneNode);

      assert.strictEqual(
        evaluate(':nth-of-type(1)', standaloneNode).has(standaloneNode),
        true,
        ':nth-of-type on root node should match'
      );

      assert.strictEqual(
        evaluate(':nth-last-of-type(1)', standaloneNode).has(standaloneNode),
        true,
        ':nth-last-of-type on root node should match'
      );
    });

    it('should match the exact root node for nth-of-type family pseudos', () => {
      const rootNode = document.createElement('div');
      finder.setup('div', rootNode);

      const result = evaluate(':first-of-type', rootNode);

      assert.strictEqual(
        result.has(rootNode),
        true,
        'Should match when node is exactly the finder root'
      );
    });
  });

  describe('nth-family error handling', () => {
    it('should throw error when nth-family pseudo has invalid number of children', () => {
      const div = document.createElement('div');
      finder.setup('div', div);

      const emptyNth = {
        type: 'PseudoClassSelector',
        name: 'nth-child',
        children: []
      };

      assert.throws(
        () => evaluator.evaluate(emptyNth, div),
        /Invalid selector/,
        'Should throw for nth-child with 0 children'
      );

      const multiNth = {
        type: 'PseudoClassSelector',
        name: 'nth-of-type',
        children: [
          { type: 'Raw', value: '1' },
          { type: 'Raw', value: '2' }
        ]
      };

      assert.throws(
        () => evaluator.evaluate(multiNth, div),
        /Invalid selector/,
        'Should throw for nth-of-type with multiple children'
      );
    });
  });

  describe('_matchAnPlusB - Comprehensive Coverage', () => {
    it('should cover all branches of An+B logic', () => {
      const parent = document.createElement('div');
      for (let i = 0; i < 5; i++) {
        parent.appendChild(document.createElement('p'));
      }
      const children = parent.querySelectorAll('p');
      const target = children[2];

      finder.setup('*', target);

      const res1 = evaluate(':nth-last-child(even)', target);
      assert.ok(res1 instanceof Set);

      const res2 = evaluate(':nth-child(odd)', target);
      assert.ok(res2 instanceof Set);

      const res3 = evaluate(':nth-last-of-type(2n+1)', target);
      assert.ok(res3 instanceof Set);

      const res4 = evaluate(':nth-of-type(1)', target);
      assert.ok(res4 instanceof Set);

      const mockAst = {
        nth: { a: null, b: null, name: null },
        selector: null
      };
      evaluator._matchAnPlusB(mockAst, target, 'nth-child', {});

      const res5 = evaluate(':nth-child(2n of p)', target);
      assert.ok(res5 instanceof Set);

      const res6 = evaluator._matchAnPlusB(
        { nth: {} },
        target,
        'unknown-nth',
        {}
      );
      assert.strictEqual(
        res6.size,
        0,
        'Should return empty Set for unknown nth name'
      );
    });
  });

  describe('_matchHasPseudoFunc - Logic coverage', () => {
    it('should cover all paths including leading combinators and recursion', () => {
      const parent = document.createElement('div');
      const p = document.createElement('p');
      const span = document.createElement('span');
      parent.appendChild(p);
      parent.appendChild(span);
      container.appendChild(parent);

      finder.setup('*', parent);

      const res1 = evaluate(':has(> p)', parent);
      assert.strictEqual(
        res1.has(parent),
        true,
        'Should match with leading combinator'
      );

      const res2 = evaluate(':has(p + span)', parent);
      assert.strictEqual(
        res2.has(parent),
        true,
        'Should match with multiple combinators (recursion)'
      );

      const res3 = evaluate(':has(section)', parent);
      assert.strictEqual(
        res3.size,
        0,
        'Should return false when no nodes match'
      );

      const emptyRes = evaluator._matchHasPseudoFunc([], parent);
      assert.strictEqual(
        emptyRes,
        false,
        'Should return false for empty astLeaves'
      );
    });
  });

  describe('_evaluateHasPseudo - Shadow Root coverage', () => {
    it('should cover shadow host verification branches', () => {
      const fragment = document.createDocumentFragment();
      fragment.host = document.createElement('div');
      const p = document.createElement('p');
      fragment.appendChild(p);

      finder.setup('*', fragment);

      try {
        Object.defineProperty(finder, 'verifyShadowHost', {
          get: () => true,
          configurable: true
        });

        const resTrue = evaluate(':has(p)', fragment, { isShadowRoot: true });
        assert.strictEqual(
          resTrue.has(fragment),
          true,
          'Should return node when verifyShadowHost is true'
        );

        Object.defineProperty(finder, 'verifyShadowHost', {
          get: () => false,
          configurable: true
        });

        const resFalse = evaluate(':has(p)', fragment, { isShadowRoot: true });
        assert.strictEqual(
          resFalse.size,
          0,
          'Should return null when verifyShadowHost is false'
        );
      } finally {
        delete finder.verifyShadowHost;
      }
    });

    it('should return null when bool is false', () => {
      const div = document.createElement('div');
      finder.setup('div', div);

      const res = evaluate(':has(span)', div);
      assert.strictEqual(
        res.size,
        0,
        'Should return null if no branches match'
      );
    });
  });

  describe('_matchLogicalPseudoFunc - Shadow Root constraints', () => {
    it('should return empty Set if logic pseudo in shadow root has complex selectors', () => {
      const fragment = document.createDocumentFragment();
      fragment.host = document.createElement('div');
      const child = document.createElement('p');
      fragment.appendChild(child);

      finder.setup('*', child);

      const res = evaluate(':is(div > p)', child, { isShadowRoot: true });
      assert.strictEqual(
        res.size,
        0,
        'Should return empty Set (invalid in shadow root)'
      );
    });

    it('should return empty Set if :not() in shadow root contains non-class selectors', () => {
      const fragment = document.createDocumentFragment();
      fragment.host = document.createElement('div');
      const child = document.createElement('p');
      child.id = 'test';
      fragment.appendChild(child);

      finder.setup('*', child);

      const res = evaluate(':not(#test)', child, { isShadowRoot: true });
      assert.strictEqual(
        res.size,
        0,
        'Should return empty Set for :not() with ID selector in shadow root'
      );
    });

    it('should cover branch.length > 1 in Shadow Root by passing fragment as node', () => {
      const fragment = document.createDocumentFragment();
      fragment.host = document.createElement('div');

      finder.setup('*', fragment);

      const res = evaluate(':is(div p)', fragment, { isShadowRoot: true });

      assert.strictEqual(
        res.size,
        0,
        'Should cover invalid block when node is fragment'
      );
    });
  });

  describe('_matchLogicalPseudoFunc - Multi-level backtracking', () => {
    it('should cover all branches of the backtracking loop with a 3-level selector', () => {
      const section = document.createElement('section');
      const div = document.createElement('div');
      const p = document.createElement('p');
      div.appendChild(p);
      section.appendChild(div);
      container.appendChild(section);

      finder.setup('*', p);

      const res = evaluate(':is(section > div > p)', p);
      assert.strictEqual(
        res.has(p),
        true,
        'Should backtrack through multiple levels'
      );
    });

    it('should break the loop when a middle level does not match', () => {
      const article = document.createElement('article');
      const span = document.createElement('span');
      const p = document.createElement('p');
      span.appendChild(p);
      article.appendChild(span);
      container.appendChild(article);

      finder.setup('*', p);

      const res = evaluate(':is(article > div > p)', p);
      assert.strictEqual(
        res.size,
        0,
        'Should stop backtracking if a middle level fails'
      );
    });
  });

  describe('Logical Pseudo-classes (:is, :where, :not, :has)', () => {
    it('should evaluate :has() deeply', () => {
      const parent = document.createElement('div');
      const child = document.createElement('span');
      parent.appendChild(child);
      container.appendChild(parent);
      finder.setup('div', parent);

      assert.strictEqual(evaluate(':has(span)', parent).has(parent), true);
      assert.strictEqual(evaluate(':has(p)', parent).has(parent), false);
      assert.strictEqual(evaluate(':has(+ span)', parent).has(parent), false);
      assert.strictEqual(evaluate(':has(~ span)', parent).has(parent), false);
    });

    it('should throw on invalid :has syntax', () => {
      const node = document.createElement('div');
      finder.setup('div', node);

      assert.throws(() => evaluate(':has()', node), /Invalid selector/);
      assert.throws(() => evaluate(':has(:has(p))', node), /Invalid selector/);
    });

    it('should evaluate :is, :where, :not', () => {
      const node = document.createElement('div');
      node.classList.add('foo');
      container.appendChild(node);
      finder.setup('div', node);

      assert.strictEqual(evaluate(':is(.foo)', node).has(node), true);
      assert.strictEqual(evaluate(':where(.foo)', node).has(node), true);
      assert.strictEqual(evaluate(':not(.bar)', node).has(node), true);
      assert.strictEqual(evaluate(':not(.foo)', node).has(node), false);
    });

    it('should handle Shadow DOM invalidations for logical pseudos', () => {
      const frag = document.createDocumentFragment();
      finder.setup(':not(.foo)', frag);

      assert.strictEqual(
        evaluate(':not(.foo)', frag, { isShadowRoot: true }).size,
        0
      );
      assert.strictEqual(
        evaluate(':not(.foo, .bar)', frag, { isShadowRoot: true }).size,
        0
      );
    });

    it('should cover branch.push with combinators in logical pseudos (twigBranches logic)', () => {
      const parent = document.createElement('div');
      const child = document.createElement('p');
      parent.appendChild(child);
      container.appendChild(parent);

      finder.setup('*', child);

      const res = evaluate(':is(div > p)', child);

      assert.strictEqual(
        res.has(child),
        true,
        'Should match with combinator inside :is()'
      );
    });
  });

  describe(':has() nesting validation logic', () => {
    it('should throw SYNTAX_ERR when :has() contains :not(:has())', () => {
      const div = document.createElement('div');
      finder.setup('div', div);

      assert.throws(
        () => evaluate(':has(:not(:has(p)))', div),
        /Invalid selector/,
        'Should throw for nested :has inside :not'
      );
    });

    it('should return empty matched set when :has() is "forgiven" via :is() or :where()', () => {
      const div = document.createElement('div');
      finder.setup('div', div);

      const resIs = evaluate(':has(:is(:has(p)))', div);
      assert.strictEqual(resIs.size, 0, 'Should be forgiven via :is()');

      const resWhere = evaluate(':has(:where(:has(p)))', div);
      assert.strictEqual(resWhere.size, 0, 'Should be forgiven via :where()');
    });

    it('should set astData correctly when :has() is valid (no nested :has)', () => {
      const div = document.createElement('div');
      const p = document.createElement('p');
      div.appendChild(p);
      finder.setup('div', div);

      const res = evaluate(':has(p)', div);
      assert.strictEqual(
        res.has(div),
        true,
        'Normal :has should work and set astData'
      );
    });
  });

  describe('AST Caching', () => {
    it('should hit the astCache on subsequent evaluations of the same AST node', () => {
      const div = document.createElement('div');
      finder.setup('div', div);

      const selector = ':is(div)';

      const res1 = evaluate(selector, div);
      assert.strictEqual(res1.has(div), true);

      const ast = getPseudoAST(selector);

      const res2 = evaluator.evaluate(ast, div);
      const res3 = evaluator.evaluate(ast, div);

      assert.strictEqual(res2.has(div), true);
      assert.strictEqual(
        res3.has(div),
        true,
        'Should successfully evaluate using cache'
      );
    });
  });

  describe('UI, Form, and State Pseudo-classes', () => {
    it('should evaluate :dir() and :lang()', () => {
      const div = document.createElement('div');
      div.setAttribute('dir', 'rtl');
      div.setAttribute('lang', 'fr-CA');
      container.appendChild(div);
      finder.setup('div', div);

      assert.strictEqual(evaluate(':dir(rtl)', div).has(div), true);
      assert.strictEqual(evaluate(':dir(ltr)', div).has(div), false);
      assert.strictEqual(evaluate(':lang(fr)', div).has(div), true);
      assert.strictEqual(evaluate(':lang(en)', div).has(div), false);

      assert.throws(() => evaluate(':dir()', div), /Invalid selector/);
      assert.throws(() => evaluate(':lang()', div), /Invalid selector/);
    });

    it('should evaluate custom :state()', () => {
      window.customElements.define(
        'my-state-el',
        class extends window.HTMLElement {
          constructor() {
            super();
            this.internals = this.attachInternals();
            if (!this.internals.states) this.internals.states = new Set();
          }
        }
      );
      const el = document.createElement('my-state-el');
      el.internals.states.add('checked');
      container.appendChild(el);
      finder.setup('my-state-el', el);

      assert.strictEqual(evaluate(':state(checked)', el).has(el), true);
      assert.strictEqual(evaluate(':state(foo)', el).has(el), false);
    });

    it('should evaluate tree structural pseudos', () => {
      const ul = document.createElement('ul');
      const li = document.createElement('li');
      ul.appendChild(li);
      container.appendChild(ul);
      finder.setup('li', li);

      assert.strictEqual(evaluate(':first-child', li).has(li), true);
      assert.strictEqual(evaluate(':last-child', li).has(li), true);
      assert.strictEqual(evaluate(':only-child', li).has(li), true);
      assert.strictEqual(evaluate(':first-of-type', li).has(li), true);
      assert.strictEqual(evaluate(':last-of-type', li).has(li), true);
      assert.strictEqual(evaluate(':only-of-type', li).has(li), true);
      assert.strictEqual(
        evaluate(':root', document.documentElement).has(
          document.documentElement
        ),
        true
      );
    });

    it('should evaluate :empty correctly', () => {
      const div = document.createElement('div');
      container.appendChild(div);
      finder.setup('div', div);

      assert.strictEqual(evaluate(':empty', div).has(div), true);
      div.appendChild(document.createComment('test'));
      assert.strictEqual(evaluate(':empty', div).has(div), true);
      div.appendChild(document.createTextNode('hi'));
      assert.strictEqual(evaluate(':empty', div).has(div), false);
    });

    it('should match :empty when child nodes are only comments or processing instructions', () => {
      const div = document.createElement('div');
      div.appendChild(document.createComment('This is a comment'));
      div.appendChild(
        document.createProcessingInstruction(
          'xml-stylesheet',
          'href="style.css"'
        )
      );

      container.appendChild(div);
      finder.setup('div', div);

      const res = evaluate(':empty', div);
      assert.strictEqual(
        res.has(div),
        true,
        'Node with only comments/PIs should be considered :empty'
      );
    });

    it('should evaluate :disabled, :enabled, :read-only, :read-write', () => {
      const input = document.createElement('input');
      input.type = 'text';
      container.appendChild(input);
      finder.setup('input', input);

      assert.strictEqual(evaluate(':enabled', input).has(input), true);
      assert.strictEqual(evaluate(':read-write', input).has(input), true);

      input.disabled = true;
      input.readOnly = true;
      assert.strictEqual(evaluate(':disabled', input).has(input), true);
      assert.strictEqual(evaluate(':read-only', input).has(input), true);
    });

    it('should evaluate :any-link, :local-link, :target, :target-within', () => {
      const a = document.createElement('a');
      a.href = '#test-target';
      a.id = 'test-target';
      container.appendChild(a);
      finder.setup('a', a);

      assert.strictEqual(evaluate(':any-link', a).has(a), true);
      assert.strictEqual(evaluate(':link', a).has(a), true);
      assert.strictEqual(evaluate(':local-link', a).has(a), true);
      assert.strictEqual(evaluate(':target', a).has(a), true);
      assert.strictEqual(
        evaluate(':target-within', container).has(container),
        true
      );
    });

    it('should evaluate :any-link, :local-link, :target, :target-within', () => {
      const a = document.createElement('area');
      a.href = '#test-target';
      a.id = 'test-target';
      container.appendChild(a);
      finder.setup('area', a);

      assert.strictEqual(evaluate(':any-link', a).has(a), true);
      assert.strictEqual(evaluate(':link', a).has(a), true);
      assert.strictEqual(evaluate(':local-link', a).has(a), true);
      assert.strictEqual(evaluate(':target', a).has(a), true);
      assert.strictEqual(
        evaluate(':target-within', container).has(container),
        true
      );
    });

    it('should evaluate :visited as a no-op (always false for privacy reasons)', () => {
      const a = document.createElement('a');
      a.href = 'https://example.com';
      container.appendChild(a);

      finder.setup('*', a);

      assert.strictEqual(
        evaluate(':visited', a).has(a),
        false,
        ':visited should never match in JS'
      );
    });

    it('should evaluate :open and :closed', () => {
      const details = document.createElement('details');
      container.appendChild(details);
      finder.setup('details', details);

      assert.strictEqual(evaluate(':closed', details).has(details), true);
      details.setAttribute('open', '');
      assert.strictEqual(evaluate(':open', details).has(details), true);
    });

    it('should evaluate :open and :closed', () => {
      const dialog = document.createElement('dialog');
      container.appendChild(dialog);
      finder.setup('dialog', dialog);

      assert.strictEqual(evaluate(':closed', dialog).has(dialog), true);
      dialog.setAttribute('open', '');
      assert.strictEqual(evaluate(':open', dialog).has(dialog), true);
    });

    it('should evaluate :popover-open and match when node.matches returns true', () => {
      const div = document.createElement('div');
      container.appendChild(div);
      finder.setup('div', div);

      // node.matches をモックして強制的に true を返すようにする
      const originalMatches = div.matches;
      div.matches = function (sel) {
        if (sel === ':popover-open') return true;
        return originalMatches.call(this, sel);
      };

      const res = evaluate(':popover-open', div);
      assert.strictEqual(
        res.has(div),
        true,
        'Should match when node.matches(":popover-open") is true'
      );
    });

    it('should evaluate :popover-open and NOT match when node.matches returns false', () => {
      const div = document.createElement('div');
      container.appendChild(div);
      finder.setup('div', div);

      // node.matches をモックして強制的に false を返すようにする
      const originalMatches = div.matches;
      div.matches = function (sel) {
        if (sel === ':popover-open') return false;
        return originalMatches.call(this, sel);
      };

      const res = evaluate(':popover-open', div);
      assert.strictEqual(
        res.size,
        0,
        'Should not match when node.matches(":popover-open") is false'
      );
    });

    it('should handle exceptions gracefully in :popover-open (catch block coverage)', () => {
      const div = document.createElement('div');
      container.appendChild(div);
      finder.setup('div', div);

      const originalMatches = div.matches;
      div.matches = function (sel) {
        if (sel === ':popover-open') {
          throw new Error('SyntaxError: Unknown pseudo-class');
        }
        return originalMatches.call(this, sel);
      };

      const res = evaluate(':popover-open', div);
      assert.strictEqual(
        res.size,
        0,
        'Should catch exception and return empty set'
      );
    });

    it('should evaluate :placeholder-shown', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'hi';
      container.appendChild(input);
      finder.setup('input', input);

      assert.strictEqual(
        evaluate(':placeholder-shown', input).has(input),
        true
      );
      input.value = 'typed';
      assert.strictEqual(
        evaluate(':placeholder-shown', input).has(input),
        false
      );
      input.value = '';
      input.placeholder = 'hi\nbreak';
      assert.strictEqual(
        evaluate(':placeholder-shown', input).has(input),
        false
      );
    });

    it('should evaluate :checked, :indeterminate, :default', () => {
      const radio1 = document.createElement('input');
      radio1.type = 'radio';
      radio1.name = 'grp';
      radio1.checked = true;
      radio1.setAttribute('checked', '');

      const radio2 = document.createElement('input');
      radio2.type = 'radio';
      radio2.name = 'grp';

      const form = document.createElement('form');
      form.append(radio1, radio2);
      container.appendChild(form);
      finder.setup('input', radio1);

      assert.strictEqual(evaluate(':checked', radio1).has(radio1), true);
      assert.strictEqual(evaluate(':default', radio1).has(radio1), true);

      radio1.checked = false;
      radio1.removeAttribute('checked');
      assert.strictEqual(evaluate(':indeterminate', radio2).has(radio2), true);
    });

    it('should evaluate form validation (:valid, :invalid, :in-range, :out-of-range, :required, :optional)', () => {
      const fieldset = document.createElement('fieldset');
      const num = document.createElement('input');
      num.type = 'number';
      num.min = '5';
      num.max = '10';
      num.value = '15';
      num.required = true;
      fieldset.appendChild(num);
      container.appendChild(fieldset);
      finder.setup('input', num);

      assert.strictEqual(evaluate(':out-of-range', num).has(num), true);
      assert.strictEqual(evaluate(':invalid', num).has(num), true);
      assert.strictEqual(evaluate(':invalid', fieldset).has(fieldset), true);
      assert.strictEqual(evaluate(':required', num).has(num), true);

      num.value = '7';
      num.required = false;
      assert.strictEqual(evaluate(':in-range', num).has(num), true);
      assert.strictEqual(evaluate(':valid', num).has(num), true);
      assert.strictEqual(evaluate(':valid', fieldset).has(fieldset), true);
      assert.strictEqual(evaluate(':optional', num).has(num), true);
    });

    it('should evaluate :defined for custom and standard elements', () => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      container.appendChild(svg);
      finder.setup('svg', svg);
      assert.strictEqual(evaluate(':defined', svg).has(svg), true);

      const custom = document.createElement('custom-el');
      container.appendChild(custom);
      assert.strictEqual(evaluate(':defined', custom).has(custom), false);
      window.customElements.define(
        'custom-el',
        class extends window.HTMLElement {}
      );
      assert.strictEqual(evaluate(':defined', custom).has(custom), true);
    });

    it('should evaluate :required and :optional covering all element types and branches', () => {
      finder.setup('*', document);

      const selectReq = document.createElement('select');
      selectReq.required = true;
      assert.strictEqual(
        evaluate(':required', selectReq).has(selectReq),
        true,
        'select required'
      );
      assert.strictEqual(
        evaluate(':optional', selectReq).has(selectReq),
        false,
        'select required (not optional)'
      );

      const selectOpt = document.createElement('select');
      assert.strictEqual(
        evaluate(':required', selectOpt).has(selectOpt),
        false,
        'select optional (not required)'
      );
      assert.strictEqual(
        evaluate(':optional', selectOpt).has(selectOpt),
        true,
        'select optional'
      );

      const textareaReq = document.createElement('textarea');
      textareaReq.setAttribute('required', 'required');
      assert.strictEqual(
        evaluate(':required', textareaReq).has(textareaReq),
        true,
        'textarea required'
      );
      assert.strictEqual(
        evaluate(':optional', textareaReq).has(textareaReq),
        false,
        'textarea required (not optional)'
      );

      const textareaOpt = document.createElement('textarea');
      assert.strictEqual(
        evaluate(':required', textareaOpt).has(textareaOpt),
        false,
        'textarea optional (not required)'
      );
      assert.strictEqual(
        evaluate(':optional', textareaOpt).has(textareaOpt),
        true,
        'textarea optional'
      );

      const inputTextReq = document.createElement('input');
      inputTextReq.setAttribute('type', 'text');
      inputTextReq.required = true;
      assert.strictEqual(
        evaluate(':required', inputTextReq).has(inputTextReq),
        true,
        'input[type=text] required'
      );
      assert.strictEqual(
        evaluate(':optional', inputTextReq).has(inputTextReq),
        false,
        'input[type=text] required (not optional)'
      );

      const inputTextOpt = document.createElement('input');
      inputTextOpt.setAttribute('type', 'text');
      assert.strictEqual(
        evaluate(':required', inputTextOpt).has(inputTextOpt),
        false,
        'input[type=text] optional (not required)'
      );
      assert.strictEqual(
        evaluate(':optional', inputTextOpt).has(inputTextOpt),
        true,
        'input[type=text] optional'
      );

      const inputHidden = document.createElement('input');
      inputHidden.setAttribute('type', 'hidden');
      inputHidden.required = true;
      assert.strictEqual(
        evaluate(':required', inputHidden).has(inputHidden),
        false,
        'input[type=hidden] cannot be required'
      );
      assert.strictEqual(
        evaluate(':optional', inputHidden).has(inputHidden),
        true,
        'input[type=hidden] is always optional'
      );

      const inputNoTypeReq = document.createElement('input');
      inputNoTypeReq.required = true;
      assert.strictEqual(
        evaluate(':required', inputNoTypeReq).has(inputNoTypeReq),
        true,
        'input without type can be required'
      );
      assert.strictEqual(
        evaluate(':optional', inputNoTypeReq).has(inputNoTypeReq),
        false,
        'input without type required (not optional)'
      );

      const inputNoTypeOpt = document.createElement('input');
      assert.strictEqual(
        evaluate(':required', inputNoTypeOpt).has(inputNoTypeOpt),
        false,
        'input without type optional (not required)'
      );
      assert.strictEqual(
        evaluate(':optional', inputNoTypeOpt).has(inputNoTypeOpt),
        true,
        'input without type is optional'
      );
    });

    it('should evaluate :default covering all branches (forms, buttons, inputs, options)', () => {
      const form = document.createElement('form');
      const div = document.createElement('div');
      const resetBtn = document.createElement('button');
      resetBtn.type = 'reset';

      const textInputInForm = document.createElement('input');
      textInputInForm.type = 'text';

      const submitInput = document.createElement('input');
      submitInput.type = 'submit';

      const normalBtn = document.createElement('button');

      div.append(resetBtn, textInputInForm, submitInput);
      form.append(div, normalBtn);
      container.appendChild(form);

      finder.setup('*', submitInput);
      assert.strictEqual(
        evaluate(':default', submitInput).has(submitInput),
        true,
        'First submit input in form'
      );

      finder.setup('*', normalBtn);
      assert.strictEqual(
        evaluate(':default', normalBtn).has(normalBtn),
        false,
        'Second button in form'
      );

      finder.setup('*', resetBtn);
      assert.strictEqual(
        evaluate(':default', resetBtn).has(resetBtn),
        false,
        'Reset button'
      );

      const orphanBtn = document.createElement('button');
      container.appendChild(orphanBtn);
      finder.setup('*', orphanBtn);
      assert.strictEqual(
        evaluate(':default', orphanBtn).has(orphanBtn),
        false,
        'Button outside form'
      );

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.setAttribute('checked', 'checked');
      container.appendChild(checkbox);
      finder.setup('*', checkbox);
      assert.strictEqual(
        evaluate(':default', checkbox).has(checkbox),
        true,
        'Checkbox with checked attribute'
      );

      const radio = document.createElement('input');
      radio.type = 'radio';
      container.appendChild(radio);
      finder.setup('*', radio);
      assert.strictEqual(
        evaluate(':default', radio).has(radio),
        false,
        'Radio without checked attribute'
      );

      const textChecked = document.createElement('input');
      textChecked.type = 'text';
      textChecked.setAttribute('checked', 'checked');
      container.appendChild(textChecked);
      finder.setup('*', textChecked);
      assert.strictEqual(
        evaluate(':default', textChecked).has(textChecked),
        false,
        'Text input with checked attribute (invalid combo)'
      );

      const optionSelected = document.createElement('option');
      optionSelected.setAttribute('selected', 'selected');
      container.appendChild(optionSelected);
      finder.setup('*', optionSelected);
      assert.strictEqual(
        evaluate(':default', optionSelected).has(optionSelected),
        true,
        'Option with selected attribute'
      );

      const optionNormal = document.createElement('option');
      container.appendChild(optionNormal);
      finder.setup('*', optionNormal);
      assert.strictEqual(
        evaluate(':default', optionNormal).has(optionNormal),
        false,
        'Option without selected attribute'
      );
    });

    it('should evaluate :indeterminate covering all element types and branches', () => {
      finder.setup('*', document);

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.indeterminate = true;
      container.appendChild(checkbox);
      assert.strictEqual(
        evaluate(':indeterminate', checkbox).has(checkbox),
        true,
        'checkbox indeterminate true'
      );

      checkbox.indeterminate = false;
      assert.strictEqual(
        evaluate(':indeterminate', checkbox).has(checkbox),
        false,
        'checkbox indeterminate false'
      );

      const progress = document.createElement('progress');
      container.appendChild(progress);
      assert.strictEqual(
        evaluate(':indeterminate', progress).has(progress),
        true,
        'progress without value'
      );

      progress.setAttribute('value', '50');
      assert.strictEqual(
        evaluate(':indeterminate', progress).has(progress),
        false,
        'progress with value'
      );

      const form = document.createElement('form');
      const radioForm1 = document.createElement('input');
      radioForm1.type = 'radio';
      radioForm1.name = 'group1';
      const radioForm2 = document.createElement('input');
      radioForm2.type = 'radio';
      radioForm2.name = 'group1';

      form.append(radioForm1, radioForm2);
      container.appendChild(form);

      assert.strictEqual(
        evaluate(':indeterminate', radioForm1).has(radioForm1),
        true,
        'radio in form, none checked'
      );

      radioForm2.checked = true;
      assert.strictEqual(
        evaluate(':indeterminate', radioForm1).has(radioForm1),
        false,
        'radio in form, another checked'
      );

      const radioDoc1 = document.createElement('input');
      radioDoc1.type = 'radio';
      radioDoc1.name = 'group2';
      const radioDoc2 = document.createElement('input');
      radioDoc2.type = 'radio';
      radioDoc2.name = 'group2';

      container.appendChild(radioDoc1);
      container.appendChild(radioDoc2);

      assert.strictEqual(
        evaluate(':indeterminate', radioDoc1).has(radioDoc1),
        true,
        'radio in doc, none checked'
      );

      radioDoc2.checked = true;
      assert.strictEqual(
        evaluate(':indeterminate', radioDoc1).has(radioDoc1),
        false,
        'radio in doc, another checked'
      );

      const radioNoName1 = document.createElement('input');
      radioNoName1.type = 'radio';
      const radioNoName2 = document.createElement('input');
      radioNoName2.type = 'radio';
      radioNoName2.checked = true;

      container.appendChild(radioNoName1);
      container.appendChild(radioNoName2);

      assert.strictEqual(
        evaluate(':indeterminate', radioNoName1).has(radioNoName1),
        false,
        'radio no name, another checked'
      );
    });

    it('should evaluate :checked covering all input types and options', () => {
      finder.setup('*', document);

      const checkbox = document.createElement('input');
      checkbox.setAttribute('type', 'checkbox');
      container.appendChild(checkbox);

      checkbox.checked = true;
      assert.strictEqual(
        evaluate(':checked', checkbox).has(checkbox),
        true,
        'checkbox is checked'
      );

      checkbox.checked = false;
      assert.strictEqual(
        evaluate(':checked', checkbox).has(checkbox),
        false,
        'checkbox is unchecked'
      );

      const radio = document.createElement('input');
      radio.setAttribute('type', 'radio');
      container.appendChild(radio);

      radio.checked = true;
      assert.strictEqual(
        evaluate(':checked', radio).has(radio),
        true,
        'radio is checked'
      );

      radio.checked = false;
      assert.strictEqual(
        evaluate(':checked', radio).has(radio),
        false,
        'radio is unchecked'
      );

      const textInput = document.createElement('input');
      textInput.setAttribute('type', 'text');
      textInput.checked = true;
      container.appendChild(textInput);

      assert.strictEqual(
        evaluate(':checked', textInput).has(textInput),
        false,
        'text input with checked=true should not match'
      );

      const select = document.createElement('select');
      const option1 = document.createElement('option');
      const option2 = document.createElement('option');
      select.append(option1, option2);
      container.appendChild(select);

      option2.selected = true;

      assert.strictEqual(
        evaluate(':checked', option2).has(option2),
        true,
        'option2 is selected'
      );

      assert.strictEqual(
        evaluate(':checked', option1).has(option1),
        false,
        'option1 is unselected'
      );
    });

    it('should evaluate :placeholder-shown covering all conditions and branches', () => {
      finder.setup('*', document);

      const textarea = document.createElement('textarea');
      textarea.placeholder = 'Type here';
      container.appendChild(textarea);
      assert.strictEqual(
        evaluate(':placeholder-shown', textarea).has(textarea),
        true,
        'textarea with placeholder and empty value'
      );

      textarea.value = 'Hello';
      assert.strictEqual(
        evaluate(':placeholder-shown', textarea).has(textarea),
        false,
        'textarea with value'
      );

      const inputNoType = document.createElement('input');
      inputNoType.placeholder = 'Placeholder';
      container.appendChild(inputNoType);
      assert.strictEqual(
        evaluate(':placeholder-shown', inputNoType).has(inputNoType),
        true,
        'input without type'
      );

      const inputText = document.createElement('input');
      inputText.setAttribute('type', 'text');
      inputText.placeholder = 'Placeholder';
      container.appendChild(inputText);
      assert.strictEqual(
        evaluate(':placeholder-shown', inputText).has(inputText),
        true,
        'input type=text'
      );

      const inputCheckbox = document.createElement('input');
      inputCheckbox.setAttribute('type', 'checkbox');
      inputCheckbox.placeholder = 'Placeholder';
      container.appendChild(inputCheckbox);
      assert.strictEqual(
        evaluate(':placeholder-shown', inputCheckbox).has(inputCheckbox),
        false,
        'input type=checkbox'
      );

      const inputNewline = document.createElement('input');
      inputNewline.placeholder = 'Line 1\nLine 2';
      container.appendChild(inputNewline);
      assert.strictEqual(
        evaluate(':placeholder-shown', inputNewline).has(inputNewline),
        false,
        'placeholder with newline'
      );

      const inputCR = document.createElement('input');
      inputCR.placeholder = 'Line 1\rLine 2';
      container.appendChild(inputCR);
      assert.strictEqual(
        evaluate(':placeholder-shown', inputCR).has(inputCR),
        false,
        'placeholder with CR'
      );

      const divPlaceholder = document.createElement('div');
      divPlaceholder.setAttribute('placeholder', 'I am a div');
      container.appendChild(divPlaceholder);
      assert.strictEqual(
        evaluate(':placeholder-shown', divPlaceholder).has(divPlaceholder),
        false,
        'div with placeholder attr'
      );

      const inputEmpty = document.createElement('input');
      container.appendChild(inputEmpty);
      assert.strictEqual(
        evaluate(':placeholder-shown', inputEmpty).has(inputEmpty),
        false,
        'input without placeholder'
      );
    });

    it('should evaluate :scope covering all element, document, and shadow branches', () => {
      const scopeTarget = document.createElement('div');
      const scopeChild = document.createElement('span');
      scopeTarget.appendChild(scopeChild);
      container.appendChild(scopeTarget);

      finder.setup('*', scopeTarget);

      assert.strictEqual(
        evaluate(':scope', scopeTarget).has(scopeTarget),
        true,
        'Matches exactly the scoped element'
      );

      assert.strictEqual(
        evaluate(':scope', scopeChild).has(scopeChild),
        false,
        'Does not match child of scoped element'
      );

      Object.defineProperty(finder, 'shadow', {
        get: () => true,
        configurable: true
      });
      assert.strictEqual(
        evaluate(':scope', scopeTarget).has(scopeTarget),
        false,
        'Does not match if it is inside shadow DOM'
      );

      Object.defineProperty(finder, 'shadow', {
        get: () => false,
        configurable: true
      });

      finder.setup('*', document);

      assert.strictEqual(
        evaluate(':scope', document.documentElement).has(
          document.documentElement
        ),
        true,
        'Matches documentElement when scoped to document'
      );

      assert.strictEqual(
        evaluate(':scope', document.body).has(document.body),
        false,
        'Does not match body when scoped to document'
      );
    });
  });

  describe('Event Tracker interactions (:hover, :active, :focus, :focus-visible, :focus-within)', () => {
    it('should evaluate :hover and :active', () => {
      const btn = document.createElement('button');
      container.appendChild(btn);
      finder.setup('button', btn);

      finder.tracker._handleMouseEvent({ target: btn, type: 'mouseover' });
      assert.strictEqual(evaluate(':hover', btn).has(btn), true);

      finder.tracker._handleMouseEvent({
        target: btn,
        type: 'mousedown',
        buttons: 1
      });
      assert.strictEqual(evaluate(':active', btn).has(btn), true);
    });

    it('should NOT match :hover or :active when no event has occurred', () => {
      const btn = document.createElement('button');
      container.appendChild(btn);
      finder.setup('button', btn);

      const resHover = evaluate(':hover', btn);
      assert.strictEqual(
        resHover.size,
        0,
        'Should not match :hover when no event has occured'
      );

      const resActive = evaluate(':active', btn);
      assert.strictEqual(
        resActive.size,
        0,
        'Should not match :active when no event has occered'
      );
    });

    it('should NOT match :hover or :active with irrelevant event types', () => {
      const btn = document.createElement('button');
      container.appendChild(btn);
      finder.setup('button', btn);

      finder.tracker._handleMouseEvent({ target: btn, type: 'mousemove' });

      assert.strictEqual(
        evaluate(':hover', btn).size,
        0,
        'Should not match :hover on mousemove'
      );

      assert.strictEqual(
        evaluate(':active', btn).size,
        0,
        'Should not match :active on mousemove'
      );
    });

    it('should evaluate :focus and :focus-within including deeply nested Shadow DOM branches', () => {
      finder.setup('*', document);

      const normalInput = document.createElement('input');
      container.appendChild(normalInput);
      normalInput.focus();

      assert.strictEqual(
        evaluate(':focus', normalInput).has(normalInput),
        true,
        'Standard focus'
      );

      const host = document.createElement('div');
      container.appendChild(host);

      const shadowRoot = host.attachShadow({ mode: 'open' });

      const wrapper = document.createElement('div');
      const shadowInput = document.createElement('input');

      wrapper.appendChild(shadowInput);
      shadowRoot.appendChild(wrapper);

      shadowInput.focus();

      finder.setup('*', shadowInput);
      assert.strictEqual(
        evaluate(':focus', shadowInput).has(shadowInput),
        true,
        'Focus on focusable element inside Shadow DOM'
      );

      finder.setup('*', host);
      assert.strictEqual(
        evaluate(':focus', host).has(host),
        true,
        'Focus evaluated on unfocusable host adds current.host to matched'
      );

      assert.strictEqual(
        evaluate(':focus-within', container).has(container),
        true,
        'Focus-within on ancestor'
      );
    });

    it('should evaluate :focus-visible across complex interactions', () => {
      const input = document.createElement('input');
      container.appendChild(input);
      finder.setup('input', input);

      input.focus();
      finder.tracker._handleKeyboardEvent({
        target: document.body,
        type: 'keydown',
        key: 'Tab'
      });
      finder.tracker._handleFocusEvent({ target: input, relatedTarget: null });

      assert.strictEqual(evaluate(':focus-visible', input).has(input), true);
    });

    it('should evaluate :focus-visible across complex interactions', () => {
      const input = document.createElement('input');
      container.appendChild(input);
      finder.setup('input', input);

      input.focus();
      finder.tracker._handleKeyboardEvent({
        target: document.body,
        type: 'keyup',
        key: 'Tab'
      });
      finder.tracker._handleFocusEvent({ target: input, relatedTarget: null });

      assert.strictEqual(evaluate(':focus-visible', input).has(input), true);
    });

    it('should evaluate :focus-within covering all branches including Shadow DOM traversal', () => {
      finder.setup('*', document);

      const parentDiv = document.createElement('div');
      const input = document.createElement('input');
      parentDiv.appendChild(input);
      container.appendChild(parentDiv);

      input.focus();
      assert.strictEqual(
        evaluate(':focus-within', parentDiv).has(parentDiv),
        true,
        'Standard focus-within'
      );

      const ancestorDiv = document.createElement('div');
      const hostDiv = document.createElement('div');
      ancestorDiv.appendChild(hostDiv);
      container.appendChild(ancestorDiv);

      const shadowRoot = hostDiv.attachShadow({ mode: 'open' });
      const shadowWrapper = document.createElement('div');
      const shadowInput = document.createElement('input');
      shadowWrapper.appendChild(shadowInput);
      shadowRoot.appendChild(shadowWrapper);

      shadowInput.focus();

      assert.strictEqual(
        evaluate(':focus-within', shadowWrapper).has(shadowWrapper),
        true,
        'Shadow DOM internal focus-within'
      );

      assert.strictEqual(
        evaluate(':focus-within', ancestorDiv).has(ancestorDiv),
        true,
        'Shadow DOM traversal up to host'
      );

      const unrelatedDiv = document.createElement('div');
      container.appendChild(unrelatedDiv);
      assert.strictEqual(
        evaluate(':focus-within', unrelatedDiv).has(unrelatedDiv),
        false,
        'Unrelated div focus-within is false'
      );
    });
  });

  describe(':focus-visible detailed branches', () => {
    it('should match natively focusable elements (isFocusVisible true)', () => {
      const input = document.createElement('input');
      container.appendChild(input);
      input.focus();
      finder.setup('*', input);
      assert.strictEqual(evaluate(':focus-visible', input).has(input), true);
    });

    it('should handle tracker.focus without tracker.event (script focus or window blur/focus)', () => {
      const div = document.createElement('div');
      div.tabIndex = -1;
      container.appendChild(div);
      div.focus();
      finder.setup('*', div);

      Object.defineProperty(finder.tracker, 'event', {
        get: () => null,
        configurable: true
      });

      finder.tracker._handleFocusEvent({ target: div, relatedTarget: null });
      assert.strictEqual(
        evaluate(':focus-visible', div).has(div),
        true,
        'fallback to relatedTarget === null'
      );

      const prevDiv = document.createElement('div');
      finder.tracker.lastFocusVisible = prevDiv;
      finder.tracker._handleFocusEvent({ target: div, relatedTarget: prevDiv });
      assert.strictEqual(
        evaluate(':focus-visible', div).has(div),
        true,
        'fallback to relatedTarget === lastFocusVisible'
      );

      const unrelatedDiv = document.createElement('div');
      finder.tracker.lastFocusVisible = div;
      finder.tracker._handleFocusEvent({
        target: div,
        relatedTarget: unrelatedDiv
      });
      assert.strictEqual(
        evaluate(':focus-visible', div).has(div),
        false,
        'should not be focus visible'
      );
      assert.strictEqual(
        finder.tracker.lastFocusVisible,
        null,
        'lastFocusVisible should be reset to null'
      );
    });

    it('should handle eventTarget === relatedTarget branch (click on already focused element)', () => {
      const div = document.createElement('div');
      div.tabIndex = 0;
      container.appendChild(div);
      div.focus();
      finder.setup('*', div);

      finder.tracker._handleMouseEvent({ target: div, type: 'mousedown' });
      finder.tracker._handleFocusEvent({ target: div, relatedTarget: div });

      finder.tracker.lastFocusVisible = null;
      assert.strictEqual(
        evaluate(':focus-visible', div).has(div),
        true,
        'lastFocusVisible is null'
      );

      finder.tracker.lastFocusVisible = div;
      assert.strictEqual(
        evaluate(':focus-visible', div).has(div),
        true,
        'focusTarget === lastFocusVisible'
      );
    });

    it('should thoroughly cover Tab key branches for :focus-visible', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      div1.tabIndex = 0;
      div2.tabIndex = 0;
      container.append(div1, div2);

      finder.setup('*', div2);
      div2.focus();

      Object.defineProperty(finder.tracker, 'event', {
        get: () => ({ target: div1, type: 'keydown', key: 'Tab' }),
        configurable: true
      });
      finder.tracker._handleFocusEvent({ target: div2, relatedTarget: div1 });
      assert.strictEqual(
        evaluate(':focus-visible', div2).has(div2),
        true,
        'Tab keydown from another element (else route)'
      );

      Object.defineProperty(finder.tracker, 'event', {
        get: () => ({ target: div2, type: 'keyup', key: 'Tab' }),
        configurable: true
      });
      finder.tracker._handleFocusEvent({ target: div2, relatedTarget: div1 });
      finder.tracker.lastFocusVisible = null;
      assert.strictEqual(
        evaluate(':focus-visible', div2).has(div2),
        true,
        'Tab keyup with lastFocusVisible === null'
      );

      finder.tracker._handleFocusEvent({ target: div2, relatedTarget: null });
      finder.tracker.lastFocusVisible = div2;
      assert.strictEqual(
        evaluate(':focus-visible', div2).has(div2),
        true,
        'Tab keyup with eventTarget === lastFocusVisible and relatedTarget === null'
      );

      finder.tracker._handleFocusEvent({ target: div2, relatedTarget: div1 });
      finder.tracker.lastFocusVisible = div2;
      assert.strictEqual(
        evaluate(':focus-visible', div2).has(div2),
        false,
        'Tab keyup with relatedTarget !== null should be false'
      );

      finder.tracker._handleFocusEvent({ target: div2, relatedTarget: null });
      finder.tracker.lastFocusVisible = div1;
      assert.strictEqual(
        evaluate(':focus-visible', div2).has(div2),
        false,
        'Tab keyup with eventTarget !== lastFocusVisible should be false'
      );
    });

    it('should cover the else branch for Tab key when eventTarget !== focusTarget', () => {
      const node = document.createElement('div');
      const prevNode = document.createElement('div');
      const otherNode = document.createElement('div');

      node.tabIndex = 0;
      prevNode.tabIndex = 0;
      otherNode.tabIndex = 0;
      container.append(node, prevNode, otherNode);

      node.focus();
      finder.setup('*', node);

      Object.defineProperty(finder.tracker, 'focus', {
        get: () => ({ target: node, relatedTarget: prevNode }),
        configurable: true
      });

      Object.defineProperty(finder.tracker, 'event', {
        get: () => ({ target: otherNode, type: 'keydown', key: 'Tab' }),
        configurable: true
      });

      assert.strictEqual(
        evaluate(':focus-visible', node).has(node),
        true,
        'Reaches the exact else branch where eventTarget !== focusTarget'
      );
    });

    it('should handle other keyboard events (typing inside an element)', () => {
      const div = document.createElement('div');
      div.tabIndex = 0;
      container.appendChild(div);
      div.focus();
      finder.setup('*', div);

      finder.tracker._handleKeyboardEvent({
        target: div,
        type: 'keydown',
        key: 'a',
        altKey: false,
        ctrlKey: false,
        metaKey: false
      });
      finder.tracker._handleFocusEvent({ target: div, relatedTarget: null });
      assert.strictEqual(
        evaluate(':focus-visible', div).has(div),
        true,
        'Normal keypress triggers focus-visible'
      );

      finder.tracker._handleKeyboardEvent({
        target: div,
        type: 'keydown',
        key: 'a',
        altKey: true,
        ctrlKey: false,
        metaKey: false
      });
      assert.strictEqual(
        evaluate(':focus-visible', div).has(div),
        false,
        'Modifier key prevents focus-visible'
      );
    });

    it('should cover focus-visible via normal key input (keydown/keyup branches)', () => {
      const input = document.createElement('input');
      container.appendChild(input);
      finder.setup('input', input);
      input.focus();

      Object.defineProperty(finder.tracker, 'event', {
        get: () => ({
          target: input,
          type: 'keydown',
          key: 'a',
          altKey: false,
          ctrlKey: false,
          metaKey: false
        }),
        configurable: true
      });
      finder.tracker._handleFocusEvent({ target: input, relatedTarget: null });

      assert.strictEqual(
        evaluate(':focus-visible', input).has(input),
        true,
        'Should match :focus-visible on keydown'
      );

      Object.defineProperty(finder.tracker, 'event', {
        get: () => ({
          target: input,
          type: 'keyup',
          key: 'b',
          altKey: false,
          ctrlKey: false,
          metaKey: false
        }),
        configurable: true
      });

      assert.strictEqual(
        evaluate(':focus-visible', input).has(input),
        true,
        'Should match :focus-visible on keyup'
      );
    });

    it('should handle isFocusVisible(relatedTarget) -> true branch', () => {
      const div1 = document.createElement('div');
      const input = document.createElement('input');
      div1.tabIndex = -1;
      container.append(input, div1);

      input.focus();
      finder.setup('*', div1);
      div1.focus();

      finder.tracker._handleFocusEvent({ target: div1, relatedTarget: input });
      assert.strictEqual(
        evaluate(':focus-visible', div1).has(div1),
        true,
        'Inherits focus-visible from relatedTarget'
      );
    });
  });

  describe('Tree Structural Pseudo-classes (Detailed)', () => {
    it('should evaluate :first-child and :last-child covering all branches', () => {
      const parent = document.createElement('div');
      const child1 = document.createElement('span');
      const child2 = document.createElement('p');
      const child3 = document.createElement('a');
      parent.append(child1, child2, child3);
      container.appendChild(parent);

      finder.setup('*', parent);

      assert.strictEqual(
        evaluate(':first-child', child1).has(child1),
        true,
        'child1 is the first child'
      );
      assert.strictEqual(
        evaluate(':first-child', child2).has(child2),
        false,
        'child2 is not the first child'
      );

      assert.strictEqual(
        evaluate(':last-child', child3).has(child3),
        true,
        'child3 is the last child'
      );
      assert.strictEqual(
        evaluate(':last-child', child2).has(child2),
        false,
        'child2 is not the last child'
      );

      const rootNode = document.createElement('div');
      finder.setup('*', rootNode);
      assert.strictEqual(
        evaluate(':first-child', rootNode).has(rootNode),
        true,
        'Matches :first-child when node is finder root'
      );
      assert.strictEqual(
        evaluate(':last-child', rootNode).has(rootNode),
        true,
        'Matches :last-child when node is finder root'
      );
    });

    it('should evaluate :only-child covering all branches', () => {
      const parent = document.createElement('div');
      const child1 = document.createElement('span');
      parent.appendChild(child1);
      container.appendChild(parent);

      finder.setup('*', child1);
      assert.strictEqual(
        evaluate(':only-child', child1).has(child1),
        true,
        'Matches when it is the only child'
      );

      const child2 = document.createElement('p');
      parent.appendChild(child2);
      assert.strictEqual(
        evaluate(':only-child', child1).has(child1),
        false,
        'Does not match when it has siblings'
      );

      const rootNode = document.createElement('div');
      finder.setup('*', rootNode);
      assert.strictEqual(
        evaluate(':only-child', rootNode).has(rootNode),
        true,
        'Matches when node is finder root'
      );
    });
  });

  describe(':state pseudo-class (Custom Elements)', () => {
    it('should match when the state is a direct property of the node', () => {
      const win = finder.window;
      const tagName = 'my-state-element';

      class MyStateElement extends win.HTMLElement {}
      if (!win.customElements.get(tagName)) {
        win.customElements.define(tagName, MyStateElement);
      }

      const customEl = document.createElement(tagName);
      container.appendChild(customEl);
      finder.setup('*', customEl);

      customEl.active = true;

      const res = evaluate(':state(active)', customEl);
      assert.strictEqual(
        res.has(customEl),
        true,
        'Should match when state is a direct property'
      );
    });

    it('should match via ElementInternals.states fallback', () => {
      const win = finder.window;
      const tagName = 'my-internals-element';

      class MyInternalsElement extends win.HTMLElement {
        static formAssociated = true;
      }
      if (!win.customElements.get(tagName)) {
        win.customElements.define(tagName, MyInternalsElement);
      }

      const customEl = document.createElement(tagName);
      container.appendChild(customEl);
      finder.setup('*', customEl);

      if (typeof win.ElementInternals === 'undefined') {
        win.ElementInternals = class {};
      }

      const stateValue = 'busy';
      const mockInternals = Object.create(win.ElementInternals.prototype);
      mockInternals.states = new Set([stateValue]);

      customEl._internals = mockInternals;

      const res = evaluate(`:state(${stateValue})`, customEl);
      assert.strictEqual(
        res.has(customEl),
        true,
        'Should match via internals.states.has()'
      );
    });
  });

  describe('Warnings and Exceptions', () => {
    it('should warn/throw on unsupported and unknown pseudo-classes', () => {
      const div = document.createElement('div');
      finder.setup('div', div, { warn: true });

      const origWarn = console.warn;
      let warned = false;
      console.warn = () => {
        warned = true;
      };

      evaluate('::-webkit-scrollbar', div, { warn: true });
      assert.strictEqual(warned, true);

      warned = false;
      evaluate(':current', div, { warn: true });
      assert.strictEqual(warned, true);

      console.warn = origWarn;

      assert.throws(
        () => evaluate(':unknown', div, { forgive: false }),
        /Unknown pseudo-class/
      );
      assert.strictEqual(evaluate(':unknown', div, { forgive: true }).size, 0);
    });

    it('should quietly ignore :host and :host-context on standard elements', () => {
      const div = document.createElement('div');
      finder.setup('div', div);
      assert.strictEqual(evaluate(':host', div).size, 0);
      assert.strictEqual(evaluate(':host-context', div).size, 0);
    });

    it('should warn on legacy pseudo-elements (:before, :after, etc) when warn is true', () => {
      const div = document.createElement('div');
      finder.setup('div', div, { warn: true });

      const origWarn = console.warn;
      let warnedMessages = [];
      console.warn = msg => {
        warnedMessages.push(msg);
      };

      const legacyPseudos = [
        ':after',
        ':before',
        ':first-letter',
        ':first-line'
      ];

      for (const pseudo of legacyPseudos) {
        evaluate(pseudo, div, { warn: true });
      }

      assert.strictEqual(warnedMessages.length, 4, 'should log 4 warnings');
      assert.strictEqual(
        warnedMessages[0],
        'Unsupported pseudo-element ::after'
      );
      assert.strictEqual(
        warnedMessages[1],
        'Unsupported pseudo-element ::before'
      );
      assert.strictEqual(
        warnedMessages[2],
        'Unsupported pseudo-element ::first-letter'
      );
      assert.strictEqual(
        warnedMessages[3],
        'Unsupported pseudo-element ::first-line'
      );

      warnedMessages = [];
      for (const pseudo of legacyPseudos) {
        evaluate(pseudo, div, { warn: false });
      }
      assert.strictEqual(
        warnedMessages.length,
        0,
        'should not log warnings when warn is false'
      );

      console.warn = origWarn;
    });

    it('should reach unsupported cases and break silently when warn is false', () => {
      const div = document.createElement('div');
      finder.setup('div', div);

      const pseudos = [
        ':current(1)',
        ':heading(1)',
        ':nth-col(1)',
        ':nth-last-col(1)'
      ];

      for (const pseudo of pseudos) {
        const res = evaluate(pseudo, div, { warn: false });
        assert.strictEqual(res.size, 0, `${pseudo} should just break silently`);
      }
    });

    it('should reach unsupported cases and enter the warn block', () => {
      const div = document.createElement('div');
      finder.setup('div', div);

      const pseudos = [
        ':current(1)',
        ':heading(1)',
        ':nth-col(1)',
        ':nth-last-col(1)'
      ];

      for (const pseudo of pseudos) {
        try {
          evaluate(pseudo, div, { warn: true });
        } catch (e) {}
      }
    });

    it('should reach host and host-context cases and break', () => {
      const div = document.createElement('div');
      finder.setup('div', div);

      const resHost = evaluate(':host(div)', div);
      assert.strictEqual(
        resHost.size,
        0,
        ':host() should match nothing and break'
      );

      const resHostContext = evaluate(':host-context(div)', div);
      assert.strictEqual(
        resHostContext.size,
        0,
        ':host-context() should match nothing and break'
      );
    });

    it('should reach contains case and break without error', () => {
      const div = document.createElement('div');
      finder.setup('div', div);

      const res = evaluate(':contains(text)', div, { warn: false });

      assert.strictEqual(
        res.size,
        0,
        ':contains should be reached and return empty set'
      );
    });

    it('should reach contains case and attempt to warn', () => {
      const div = document.createElement('div');
      finder.setup('div', div);

      try {
        evaluate(':contains(text)', div, { warn: true });
      } catch (e) {}
    });

    it('should handle unknown pseudo-class with arguments in default case', () => {
      const div = document.createElement('div');
      finder.setup('div', div);

      assert.throws(
        () => evaluate(':something-unknown(arg)', div, { forgive: false }),
        /Unknown pseudo-class :something-unknown/,
        'Should throw SYNTAX_ERR when unknown pseudo is not forgiven'
      );

      const res = evaluate(':something-unknown(arg)', div, { forgive: true });
      assert.strictEqual(
        res.size,
        0,
        'Should match nothing when unknown pseudo is forgiven'
      );
    });
  });
});
