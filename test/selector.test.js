/**
 * selector.test.js
 */

/* api */
import { strict as assert } from 'node:assert';
import { describe, it } from 'mocha';
import * as cssTree from 'css-tree';

/* test */
import * as selector from '../src/js/selector.js';
import {
  COMBINATOR,
  PS_CLASS_SELECTOR,
  SELECTOR,
  SELECTOR_LIST,
  TARGET_ALL,
  TARGET_SELF,
  TARGET_LINEAL,
  TYPE_SELECTOR
} from '../src/js/constant.js';

describe('selector static analysis and validation', () => {
  describe('find nested :has()', () => {
    const func = selector.findNestedHas;

    it('should get true', () => {
      const res = func({ name: 'has' });
      assert.strictEqual(res, true, 'result');
    });

    it('should get false', () => {
      const res = func({ name: 'is' });
      assert.strictEqual(res, false, 'result');
    });
  });

  describe('Find logical pseudo-class that contains nested :has()', () => {
    const func = selector.findLogicalWithNestedHas;

    it('should match', () => {
      const leaf = {
        children: [
          {
            children: [
              {
                children: [
                  { loc: null, name: '>', type: COMBINATOR },
                  {
                    children: [
                      {
                        children: [
                          {
                            children: [
                              { loc: null, name: 'li', type: TYPE_SELECTOR }
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
                  { loc: null, name: '>', type: COMBINATOR },
                  {
                    children: [
                      {
                        children: [
                          {
                            children: [
                              { loc: null, name: 'li', type: TYPE_SELECTOR }
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
                  { loc: null, name: '>', type: COMBINATOR },
                  {
                    children: [
                      {
                        children: [
                          {
                            children: [
                              { loc: null, name: 'li', type: TYPE_SELECTOR }
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

  describe('validateHasNesting', () => {
    const func = selector.validateHasNesting;

    const getHasChildren = sel => {
      const ast = cssTree.parse(sel, { context: 'selectorList' });
      let hasNode = null;
      cssTree.walk(ast, {
        enter(node) {
          if (
            !hasNode &&
            node.type === 'PseudoClassSelector' &&
            node.name === 'has'
          ) {
            hasNode = node;
          }
        }
      });
      return cssTree.toPlainObject(hasNode).children;
    };

    it('should return true for valid nesting (no nested :has)', () => {
      assert.strictEqual(
        func(getHasChildren(':has(.foo, .bar)')),
        true,
        'no nested :has'
      );
    });

    it('should return true for nested :has inside :is() or :where()', () => {
      assert.strictEqual(
        func(getHasChildren(':has(:is(:has(.foo)))')),
        true,
        'nested in :is'
      );
      assert.strictEqual(
        func(getHasChildren(':has(:where(:has(.foo)))')),
        true,
        'nested in :where'
      );
    });

    it('should return false for invalid nested :has()', () => {
      assert.strictEqual(
        func(getHasChildren(':has(:has(.foo))')),
        false,
        'direct nested :has'
      );
      assert.strictEqual(
        func(getHasChildren(':has(:not(:has(.foo)))')),
        false,
        'nested in :not'
      );
    });
  });

  describe('createHasValidator', () => {
    const { createHasValidator } = selector;
    const mockWindow = {
      DOMException: class extends Error {
        constructor(message, name) {
          super(message);
          this.name = name;
        }
      }
    };
    const getHasNode = sel => {
      const ast = cssTree.parse(sel, { context: 'selectorList' });
      let hasNode = null;
      cssTree.walk(ast, {
        enter(node) {
          if (
            !hasNode &&
            node.type === PS_CLASS_SELECTOR &&
            node.name === 'has'
          ) {
            hasNode = node;
          }
        }
      });
      return hasNode;
    };

    it('should throw SYNTAX_ERR for disallowed nested :has()', () => {
      const validator = createHasValidator(mockWindow);
      const invalidNode = getHasNode(':has(:has(.foo))');
      assert.throws(
        () => validator(invalidNode),
        err => {
          assert.strictEqual(
            err.name,
            'SyntaxError',
            'Error name should be SyntaxError'
          );
          assert.match(
            err.message,
            /^Disallowed nested :has\(\) pseudo-class: :has\(:has\(\.foo\)\)$/,
            'Error message should include the invalid CSS'
          );
          return true;
        }
      );
    });

    it('should not throw for allowed nested :has() (e.g., wrapped in :is)', () => {
      const validator = createHasValidator(mockWindow);
      const validNode = getHasNode(':has(:is(:has(.foo)))');
      assert.doesNotThrow(
        () => validator(validNode),
        'Should not throw for forgiven nesting'
      );
    });

    it('should not throw for normal valid :has()', () => {
      const validator = createHasValidator(mockWindow);
      const validNode = getHasNode(':has(.foo > bar)');
      assert.doesNotThrow(
        () => validator(validNode),
        'Should not throw for normal :has()'
      );
    });

    it('should not throw for empty :has() (handles null children safely)', () => {
      const validator = createHasValidator(mockWindow);
      const emptyNode = {
        type: PS_CLASS_SELECTOR,
        name: 'has',
        children: null
      };
      assert.doesNotThrow(
        () => validator(emptyNode),
        'Should handle null children without crashing'
      );
    });

    it('should not throw for other pseudo-classes', () => {
      const validator = createHasValidator(mockWindow);
      const otherPseudoNode = {
        type: PS_CLASS_SELECTOR,
        name: 'not',
        children: []
      };
      assert.doesNotThrow(
        () => validator(otherPseudoNode),
        'Should ignore non-has pseudo-classes'
      );
    });

    it('should not throw for non-pseudo-class nodes', () => {
      const validator = createHasValidator(mockWindow);
      const typeNode = {
        type: TYPE_SELECTOR,
        name: 'div'
      };
      assert.doesNotThrow(
        () => validator(typeNode),
        'Should ignore non-pseudo-class nodes'
      );
    });
  });

  describe('isInvalidCombinator', () => {
    const func = selector.isInvalidCombinator;

    it('should return true for leading combinator', () => {
      assert.strictEqual(func(COMBINATOR, null, false), true);
    });

    it('should return true for consecutive combinators', () => {
      assert.strictEqual(func(COMBINATOR, COMBINATOR, false), true);
    });

    it('should return true for trailing combinator', () => {
      assert.strictEqual(func(COMBINATOR, TYPE_SELECTOR, true), true);
    });

    it('should return false for valid combinator placement', () => {
      assert.strictEqual(func(COMBINATOR, TYPE_SELECTOR, false), false);
    });

    it('should return false for non-combinator types', () => {
      assert.strictEqual(func(TYPE_SELECTOR, null, false), false);
      assert.strictEqual(func(PS_CLASS_SELECTOR, COMBINATOR, false), false);
    });
  });

  describe('isSupportedAST - Combinator Syntax', () => {
    const func = selector.isSupportedAST;
    const getAST = sel => cssTree.parse(sel, { context: 'selectorList' });

    it('should NOT support leading combinators (top-level)', () => {
      assert.strictEqual(func(getAST('> div')), false);
      assert.strictEqual(func(getAST('+ .foo')), false);
    });

    it('should NOT support consecutive combinators', () => {
      assert.strictEqual(func(getAST('div > > p')), false);
      assert.strictEqual(func(getAST('.foo + ~ .bar')), false);
    });

    it('should NOT support trailing combinators', () => {
      assert.strictEqual(func(getAST('div >')), false);
      assert.strictEqual(func(getAST('.foo +')), false);
    });

    it('should support relative selectors inside :has()', () => {
      assert.strictEqual(func(getAST('div:has(> p)')), true);
      assert.strictEqual(func(getAST('section:has(+ article)')), true);
    });

    it('should still reject consecutive combinators inside :has()', () => {
      assert.strictEqual(func(getAST('div:has(> > p)')), false);
    });

    it('should support valid basic selectors', () => {
      assert.strictEqual(func(getAST('div.foo#bar[attr="val"]')), true);
      assert.strictEqual(func(getAST('*')), true);
    });

    it('should support whitelisted pseudo-classes', () => {
      assert.strictEqual(func(getAST(':hover')), true);
      assert.strictEqual(func(getAST(':nth-child(2n+1)')), true);
      assert.strictEqual(func(getAST(':not(.foo)')), true);
      assert.strictEqual(func(getAST(':is(.a, .b)')), true);
    });

    it('should NOT support unsupported pseudo-classes', () => {
      assert.strictEqual(func(getAST(':current')), false);
      assert.strictEqual(func(getAST(':fullscreen')), false);
      assert.strictEqual(func(getAST(':popover-open')), false);
      assert.strictEqual(func(getAST(':nth-col(1)')), false);
      assert.strictEqual(func(getAST(':contains("foo")')), false);
      assert.strictEqual(func(getAST(':-webkit-autofill')), false);
      assert.strictEqual(func(getAST(':unknown-pseudo')), false);
    });

    it('should NOT support pseudo-elements', () => {
      assert.strictEqual(func(getAST('::before')), false);
      assert.strictEqual(func(getAST('::after')), false);
      assert.strictEqual(func(getAST('::part(foo)')), false);
      assert.strictEqual(func(getAST('::slotted(.foo)')), false);
    });

    it('should strictly validate :has() nesting constraints', () => {
      assert.strictEqual(func(getAST(':has(.foo)')), true);
      assert.strictEqual(func(getAST(':has(:not(.foo))')), true);
      assert.strictEqual(func(getAST(':has(:has(.foo))')), false);
      assert.strictEqual(func(getAST(':has(:not(:has(.foo)))')), false);
      assert.strictEqual(func(getAST(':has(:is(:has(.foo)))')), true);
      assert.strictEqual(func(getAST(':has(:where(:has(.foo)))')), true);
    });

    it('should evaluate nested selectors inside Nth nodes', () => {
      assert.strictEqual(
        func(getAST(':nth-child(2n+1 of .foo)')),
        true,
        'valid inner selector in Nth'
      );
      assert.strictEqual(
        func(getAST(':nth-last-child(even of :hover)')),
        true,
        'valid inner pseudo-class in Nth'
      );
      assert.strictEqual(
        func(getAST(':nth-child(2n+1 of ::before)')),
        false,
        'invalid pseudo-element in Nth'
      );
      assert.strictEqual(
        func(getAST(':nth-child(2n+1 of :unknown-pseudo)')),
        false,
        'invalid pseudo-class in Nth'
      );
    });

    it('should evaluate plain array children', () => {
      const validAst = getAST(':has(.foo)');
      const validPlainAst = cssTree.toPlainObject(validAst);
      assert.strictEqual(func(validPlainAst), true, 'valid plain AST');

      const invalidAst = getAST(':has(::before)');
      const invalidPlainAst = cssTree.toPlainObject(invalidAst);
      assert.strictEqual(func(invalidPlainAst), false, 'invalid plain AST');
    });

    it('should short-circuit recursion when isSupported is already false', () => {
      const ast = getAST('::before .foo');
      assert.strictEqual(
        func(ast),
        false,
        'short-circuit after finding pseudo-element'
      );
      const plainAst = cssTree.toPlainObject(getAST('::after, div'));
      assert.strictEqual(func(plainAst), false, 'short-circuit in plain array');
    });

    it('should return immediately if node is null (hits !node branch)', () => {
      assert.strictEqual(selector.isSupportedAST(null), true, 'null AST');

      const mockAstWithNull = {
        type: 'SelectorList',
        children: [
          { type: 'TypeSelector', name: 'div' },
          null,
          { type: 'ClassSelector', name: 'foo' }
        ]
      };
      assert.strictEqual(
        selector.isSupportedAST(mockAstWithNull),
        true,
        'AST with null child'
      );
    });

    it('should validate combinator syntax correctly for plain array ASTs', () => {
      const getPlainAST = sel =>
        cssTree.toPlainObject(cssTree.parse(sel, { context: 'selectorList' }));
      assert.strictEqual(
        func(getPlainAST('> div')),
        false,
        'leading combinator'
      );
      assert.strictEqual(
        func(getPlainAST('div >')),
        false,
        'trailing combinator'
      );
      assert.strictEqual(
        func(getPlainAST('div > > p')),
        false,
        'consecutive combinators'
      );
      assert.strictEqual(
        func(getPlainAST(':has(> > p)')),
        false,
        'consecutive combinators inside :has()'
      );
      assert.strictEqual(
        func(getPlainAST(':has(> p)')),
        true,
        'relative selector inside :has()'
      );
    });

    it('should skip null data in linked list AST children', () => {
      const mockAstWithNullData = {
        type: 'Selector',
        children: {
          head: {
            data: { type: 'TypeSelector', name: 'div' },
            next: {
              data: null,
              next: {
                data: { type: 'ClassSelector', name: 'foo' },
                next: null
              }
            }
          }
        }
      };
      assert.strictEqual(
        selector.isSupportedAST(mockAstWithNullData),
        true,
        'AST with null data in linked list'
      );
    });
  });

  describe('extract subjects via RegExp', () => {
    const func = selector.extractSubjectsRegExp;

    it('should extract single type selector', () => {
      assert.deepEqual(func('div'), [
        { id: null, className: null, tag: 'div' }
      ]);
      assert.deepEqual(func('*'), [{ id: null, className: null, tag: null }]);
    });

    it('should extract single id selector', () => {
      assert.deepEqual(func('#foo'), [
        { id: 'foo', className: null, tag: null }
      ]);
    });

    it('should extract compound selector', () => {
      assert.deepEqual(func('div#foo.bar'), [
        { id: 'foo', className: 'bar', tag: 'div' }
      ]);
    });

    it('should extract rightmost subject of complex selector', () => {
      assert.deepEqual(func('ul > li.item'), [
        { id: null, className: 'item', tag: 'li' }
      ]);
      assert.deepEqual(func('div .foo + p#bar'), [
        { id: 'bar', className: null, tag: 'p' }
      ]);
    });

    it('should handle escaped characters properly', () => {
      assert.deepEqual(func('.foo\\!bar'), [
        { id: null, className: 'foo\\!bar', tag: null }
      ]);
    });

    it('should ignore empty groups in selector lists', () => {
      assert.deepEqual(func('div, , span'), [
        { id: null, className: null, tag: 'div' },
        { id: null, className: null, tag: 'span' }
      ]);
      assert.deepEqual(func(',.foo,,,'), [
        { id: null, className: 'foo', tag: null }
      ]);
      assert.deepEqual(func(','), []);
    });

    it('should respect caseSensitive parameter for tag names', () => {
      assert.deepEqual(selector.extractSubjectsRegExp('SECTION', true), [
        { id: null, className: null, tag: 'SECTION' }
      ]);
      assert.deepEqual(selector.extractSubjectsRegExp('SECTION', false), [
        { id: null, className: null, tag: 'section' }
      ]);
      assert.deepEqual(selector.extractSubjectsRegExp('SECTION'), [
        { id: null, className: null, tag: 'section' }
      ]);
    });
  });

  describe('filter selector', () => {
    const func = selector.filterSelector;

    it('should get false for invalid inputs', () => {
      assert.strictEqual(func(), false, 'result');
      assert.strictEqual(func('null'), false, 'result');
    });

    it('should get true for basic selectors', () => {
      assert.strictEqual(func('*'), true, 'result');
      assert.strictEqual(func('p'), true, 'result');
      assert.strictEqual(func('.foo'), true, 'result');
      assert.strictEqual(func('#foo'), true, 'result');
    });

    it('should get false for namespaces and pseudo-elements', () => {
      assert.strictEqual(func('*|*'), false, 'result');
      assert.strictEqual(func('ns|p'), false, 'result');
      assert.strictEqual(func('::slotted'), false, 'result');
    });

    it('should handle target-specific filters', () => {
      assert.strictEqual(func('p', TARGET_ALL), false, 'result');
      assert.strictEqual(func('.foo', TARGET_ALL), false, 'result');
      assert.strictEqual(func('p.foo', TARGET_ALL), true, 'result');
      assert.strictEqual(
        func('p.content[id]:is(:last-child, :only-child)', TARGET_ALL),
        true,
        'result'
      );
      assert.strictEqual(func('.box + .box', TARGET_ALL), false, 'result');
      assert.strictEqual(func('.box ~ .box', TARGET_ALL), false, 'result');
      assert.strictEqual(func('.box:first-child', TARGET_ALL), true, 'result');
      assert.strictEqual(
        func('.box:nth-child(2n+1)', TARGET_ALL),
        true,
        'result'
      );
      assert.strictEqual(
        func('.box:first-of-type', TARGET_ALL),
        true,
        'result'
      );
      assert.strictEqual(
        func('.box:nth-of-type(2n+1)', TARGET_ALL),
        true,
        'result'
      );
      assert.strictEqual(func('[id="foo"]', TARGET_ALL), true, 'result');
      assert.strictEqual(func('*[role~="button"]', TARGET_ALL), true, 'result');
      assert.strictEqual(func('[title],svg>title', TARGET_ALL), true, 'result');
    });

    it('should evaluate complex logical pseudo-classes', () => {
      assert.strictEqual(func(':is(.foo, .bar)'), true, 'result');
      assert.strictEqual(func(':is()'), false, 'result');
      assert.strictEqual(func(':has(.foo)'), false, 'result');
      assert.strictEqual(func('.bar :has(.foo)', TARGET_SELF), true, 'result');
      assert.strictEqual(func(':has(.foo)', TARGET_LINEAL), false, 'result');
    });

    it('should evaluate attribute selector integrity', () => {
      assert.strictEqual(func('[foo]'), true, 'valid attribute selector');
      assert.strictEqual(
        func('div[foo="bar"]'),
        true,
        'valid attribute selector'
      );
      assert.strictEqual(
        func('[foo][bar]'),
        true,
        'multiple valid attribute selectors'
      );
      assert.strictEqual(func('[foo'), false, 'missing closing bracket');
      assert.strictEqual(
        func('div[foo="bar"'),
        false,
        'missing closing bracket'
      );
      assert.strictEqual(
        func('[foo][bar'),
        false,
        'missing last closing bracket'
      );
      assert.strictEqual(
        func('[data-foo="bar"]'),
        true,
        'valid dataset attribute selector'
      );
      assert.strictEqual(
        func('[title="foo"], svg title'),
        true,
        'valid testing library attribute selector with decendent combinator'
      );
      assert.strictEqual(
        func('[title="foo"], svg > title'),
        true,
        'valid testing library attribute selector with child combinator'
      );
    });

    it('should evaluate :has() specific branches', () => {
      assert.strictEqual(
        func(':has(.foo)', TARGET_ALL),
        false,
        'TARGET_ALL with :has()'
      );
      assert.strictEqual(
        func('div:has(.foo)', TARGET_ALL),
        false,
        'TARGET_ALL with :has()'
      );
      assert.strictEqual(
        func(':has(.foo)', TARGET_SELF),
        false,
        '!isComplex with :has()'
      );
      assert.strictEqual(
        func(':has(.foo)', TARGET_LINEAL),
        false,
        '!isComplex with :has()'
      );
      assert.strictEqual(
        func('.bar :has(.foo)', TARGET_SELF),
        true,
        'ends with :has()'
      );
      assert.strictEqual(
        func('.bar :has(> .foo)', TARGET_LINEAL),
        true,
        'ends with :has()'
      );
      assert.strictEqual(
        func('.baz :has(> .foo) .bar', TARGET_SELF),
        false,
        'does not end with :has()'
      );
      assert.strictEqual(
        func('.baz :has(.foo .bar) .qux', TARGET_LINEAL),
        false,
        'does not end with :has()'
      );
    });

    it('should evaluate isComplex branch for :is() and :not()', () => {
      assert.strictEqual(
        func(':not(.foo .bar)', TARGET_ALL),
        false,
        'isComplex false, invalid'
      );
      assert.strictEqual(
        func(':not(:is(.foo > .bar))', TARGET_ALL),
        false,
        'isComplex false, invalid nested'
      );
      assert.strictEqual(
        func(':not(.foo .bar)', TARGET_SELF),
        true,
        'isComplex true, valid'
      );
      assert.strictEqual(
        func(':not(.foo > .bar)', TARGET_LINEAL),
        true,
        'isComplex true, valid'
      );
      assert.strictEqual(
        func(':not(p.foo, div.bar)'),
        true,
        'isComplex false, valid compound'
      );
      assert.strictEqual(
        func(':is(.foo, .bar)'),
        true,
        'isComplex false, valid compound'
      );
      assert.strictEqual(
        func(':is(:not(:is(.foo, .bar)), .baz)', TARGET_ALL),
        false,
        'invalid deeply nested logic'
      );
      assert.strictEqual(
        func(':is(:not(:is(.foo, .bar)), .baz)', TARGET_SELF),
        false,
        'invalid deeply nested logic'
      );
    });

    it('should get false for unsupported pseudo-classes in fast-path', () => {
      assert.strictEqual(func(':enabled'), false, 'result');
      assert.strictEqual(func(':disabled'), false, 'result');
      assert.strictEqual(func(':hover'), false, 'result');
      assert.strictEqual(func(':focus'), false, 'result');
      assert.strictEqual(func(':root'), false, 'result');
      assert.strictEqual(func(':visited'), false, 'result');
    });

    it('should get true for supported pseudo-classes in fast-path', () => {
      assert.strictEqual(func(':read-only'), true, 'result');
      assert.strictEqual(func(':read-write'), true, 'result');
      assert.strictEqual(func(':empty'), true, 'result');
      assert.strictEqual(func(':indeterminate'), true, 'result');
      assert.strictEqual(func(':target'), true, 'result');
      assert.strictEqual(func(':nth-child(even)'), true, 'result');
    });

    it('should get false for invalid syntax (REG_INVALID_SYNTAX)', () => {
      assert.strictEqual(func('div > > p'), false, 'consecutive combinators');
      assert.strictEqual(
        func('.foo + ~ .bar'),
        false,
        'consecutive combinators'
      );
      assert.strictEqual(
        func('a >  + b'),
        false,
        'consecutive combinators with space'
      );
      assert.strictEqual(func('> .foo'), false, 'starting with combinator');
      assert.strictEqual(func(' + .bar'), false, 'starting with combinator');
      assert.strictEqual(func('.foo >'), false, 'ending with combinator');
      assert.strictEqual(func('.bar ~ '), false, 'ending with combinator');
      assert.strictEqual(func(', .foo'), false, 'starting with comma');
      assert.strictEqual(func('  ,div'), false, 'starting with comma');
      assert.strictEqual(func('.foo,,.bar'), false, 'consecutive commas');
      assert.strictEqual(func('div, ,p'), false, 'consecutive commas');
      assert.strictEqual(func('.foo,'), false, 'ending with comma');
      assert.strictEqual(func('div, '), false, 'ending with comma');
    });

    it('should return false for descendant/child combinators in logical pseudo-classes when target is TARGET_ALL', () => {
      assert.strictEqual(
        func(':is(.foo > .bar)', TARGET_ALL),
        false,
        'TARGET_ALL with child combinator in :is()'
      );
      assert.strictEqual(
        func(':is(.foo .bar)', TARGET_ALL),
        false,
        'TARGET_ALL with descendant combinator in :is()'
      );
      assert.strictEqual(
        func(':is(div > p .content)', TARGET_ALL),
        false,
        'TARGET_ALL with multiple combinators in :is()'
      );
    });
  });
});
