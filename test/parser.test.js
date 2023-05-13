/**
 * parser.test.js
 */

/* api */
const { assert } = require('chai');
const DOMException = require('domexception');
const { describe, it } = require('mocha');

/* test */
const parser = require('../src/js/parser.js');
const {
  AN_PLUS_B, ATTRIBUTE_SELECTOR, CLASS_SELECTOR, COMBINATOR, IDENTIFIER,
  ID_SELECTOR, NTH, PSEUDO_CLASS_SELECTOR, RAW, SELECTOR, SELECTOR_LIST,
  STRING, TYPE_SELECTOR
} = require('../src/js/constant.js');

describe('create AST from CSS selector', () => {
  const func = parser.parseSelector;

  describe('invalid selectors', () => {
    it('should throw', () => {
      assert.throws(() => func(), DOMException);
    });

    it('should throw', () => {
      assert.throws(() => func(''), DOMException);
    });

    it('should throw', () => {
      assert.throws(() => func('>*'), DOMException);
    });

    it('should throw', () => {
      assert.throws(() => func('*,'), DOMException);
    });

    it('should throw', () => {
      assert.throws(() => func('[foo= bar baz]'), DOMException);
    });
  });

  describe('universal selector', () => {
    it('should get selector list', () => {
      const res = func('*');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: '*',
                type: TYPE_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should throw', () => {
      assert.throws(() => func('*|'), DOMException);
    });

    it('should get namespaced selector list', () => {
      const res = func('|*');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: '|*',
                type: TYPE_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get namespaced selector list', () => {
      const res = func('*|*');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: '*|*',
                type: TYPE_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get namespaced selector list', () => {
      const res = func('foo|*');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo|*',
                type: TYPE_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('foo *');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: TYPE_SELECTOR
              },
              {
                loc: null,
                name: ' ',
                type: COMBINATOR
              },
              {
                loc: null,
                name: '*',
                type: TYPE_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('* foo');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: '*',
                type: TYPE_SELECTOR
              },
              {
                loc: null,
                name: ' ',
                type: COMBINATOR
              },
              {
                loc: null,
                name: 'foo',
                type: TYPE_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('*.foo');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: '*',
                type: TYPE_SELECTOR
              },
              {
                loc: null,
                name: 'foo',
                type: CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('*#foo');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: '*',
                type: TYPE_SELECTOR
              },
              {
                loc: null,
                name: 'foo',
                type: ID_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('*[foo]');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: '*',
                type: TYPE_SELECTOR
              },
              {
                flags: null,
                loc: null,
                matcher: null,
                name: {
                  loc: null,
                  name: 'foo',
                  type: IDENTIFIER
                },
                type: ATTRIBUTE_SELECTOR,
                value: null
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });
  });

  describe('type selector', () => {
    it('should get selector list', () => {
      const res = func('foo');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: TYPE_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('foo, bar');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: TYPE_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          },
          {
            children: [
              {
                loc: null,
                name: 'bar',
                type: TYPE_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get namespaced selector list', () => {
      const res = func('|foo');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: '|foo',
                type: TYPE_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get namespaced selector list', () => {
      const res = func('foo|bar');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo|bar',
                type: TYPE_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });
  });

  describe('class selector', () => {
    it('should throw', () => {
      assert.throws(() => func('.'), DOMException);
    });

    it('should get selector list', () => {
      const res = func('.foo');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('foo.bar');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: TYPE_SELECTOR
              },
              {
                loc: null,
                name: 'bar',
                type: CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should throw', () => {
      assert.throws(() => func('|.foo'), DOMException);
    });

    it('should get namespaced selector list', () => {
      const res = func('|foo.bar');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: '|foo',
                type: TYPE_SELECTOR
              },
              {
                loc: null,
                name: 'bar',
                type: CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('foo.bar.baz');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: TYPE_SELECTOR
              },
              {
                loc: null,
                name: 'bar',
                type: CLASS_SELECTOR
              },
              {
                loc: null,
                name: 'baz',
                type: CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });
  });

  describe('id selector', () => {
    it('should throw', () => {
      assert.throws(() => func('#'), DOMException);
    });

    it('should get selector list', () => {
      const res = func('#foo');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: ID_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('foo#bar');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: TYPE_SELECTOR
              },
              {
                loc: null,
                name: 'bar',
                type: ID_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should throw', () => {
      assert.throws(() => func('|#foo'), DOMException);
    });

    it('should get namespaced selector list', () => {
      const res = func('|foo#bar');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: '|foo',
                type: TYPE_SELECTOR
              },
              {
                loc: null,
                name: 'bar',
                type: ID_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });
  });

  describe('attribute selector', () => {
    it('should throw', () => {
      assert.throws(() => func('[]'), DOMException);
    });

    it('should throw', () => {
      assert.throws(() => func('[*]'), DOMException);
    });

    it('should get selector list', () => {
      const res = func('[foo]');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                flags: null,
                loc: null,
                matcher: null,
                name: {
                  loc: null,
                  name: 'foo',
                  type: IDENTIFIER
                },
                type: ATTRIBUTE_SELECTOR,
                value: null
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('foo[bar]');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: TYPE_SELECTOR
              },
              {
                flags: null,
                loc: null,
                matcher: null,
                name: {
                  loc: null,
                  name: 'bar',
                  type: IDENTIFIER
                },
                type: ATTRIBUTE_SELECTOR,
                value: null
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get namespaced selector list', () => {
      const res = func('[|foo]');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                flags: null,
                loc: null,
                matcher: null,
                name: {
                  loc: null,
                  name: '|foo',
                  type: IDENTIFIER
                },
                type: ATTRIBUTE_SELECTOR,
                value: null
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get namespaced selector list', () => {
      const res = func('[*|foo]');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                flags: null,
                loc: null,
                matcher: null,
                name: {
                  loc: null,
                  name: '*|foo',
                  type: IDENTIFIER
                },
                type: ATTRIBUTE_SELECTOR,
                value: null
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get namespaced selector list', () => {
      const res = func('[foo|bar]');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                flags: null,
                loc: null,
                matcher: null,
                name: {
                  loc: null,
                  name: 'foo|bar',
                  type: IDENTIFIER
                },
                type: ATTRIBUTE_SELECTOR,
                value: null
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('[foo=bar]');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                flags: null,
                loc: null,
                matcher: '=',
                name: {
                  loc: null,
                  name: 'foo',
                  type: IDENTIFIER
                },
                type: ATTRIBUTE_SELECTOR,
                value: {
                  loc: null,
                  name: 'bar',
                  type: IDENTIFIER
                }
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('[foo="bar"]');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                flags: null,
                loc: null,
                matcher: '=',
                name: {
                  loc: null,
                  name: 'foo',
                  type: IDENTIFIER
                },
                type: ATTRIBUTE_SELECTOR,
                value: {
                  loc: null,
                  type: STRING,
                  value: 'bar'
                }
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('[foo="bar baz"]');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                flags: null,
                loc: null,
                matcher: '=',
                name: {
                  loc: null,
                  name: 'foo',
                  type: IDENTIFIER
                },
                type: ATTRIBUTE_SELECTOR,
                value: {
                  loc: null,
                  type: STRING,
                  value: 'bar baz'
                }
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('[foo|bar="baz"]');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                flags: null,
                loc: null,
                matcher: '=',
                name: {
                  loc: null,
                  name: 'foo|bar',
                  type: IDENTIFIER
                },
                type: ATTRIBUTE_SELECTOR,
                value: {
                  loc: null,
                  type: STRING,
                  value: 'baz'
                }
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('[foo~=bar]');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                flags: null,
                loc: null,
                matcher: '~=',
                name: {
                  loc: null,
                  name: 'foo',
                  type: IDENTIFIER
                },
                type: ATTRIBUTE_SELECTOR,
                value: {
                  loc: null,
                  name: 'bar',
                  type: IDENTIFIER
                }
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('[foo|=bar]');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                flags: null,
                loc: null,
                matcher: '|=',
                name: {
                  loc: null,
                  name: 'foo',
                  type: IDENTIFIER
                },
                type: ATTRIBUTE_SELECTOR,
                value: {
                  loc: null,
                  name: 'bar',
                  type: IDENTIFIER
                }
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('[foo^=bar]');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                flags: null,
                loc: null,
                matcher: '^=',
                name: {
                  loc: null,
                  name: 'foo',
                  type: IDENTIFIER
                },
                type: ATTRIBUTE_SELECTOR,
                value: {
                  loc: null,
                  name: 'bar',
                  type: IDENTIFIER
                }
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('[foo$=bar]');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                flags: null,
                loc: null,
                matcher: '$=',
                name: {
                  loc: null,
                  name: 'foo',
                  type: IDENTIFIER
                },
                type: ATTRIBUTE_SELECTOR,
                value: {
                  loc: null,
                  name: 'bar',
                  type: IDENTIFIER
                }
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('[foo*=bar]');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                flags: null,
                loc: null,
                matcher: '*=',
                name: {
                  loc: null,
                  name: 'foo',
                  type: IDENTIFIER
                },
                type: ATTRIBUTE_SELECTOR,
                value: {
                  loc: null,
                  name: 'bar',
                  type: IDENTIFIER
                }
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('[foo=bar i]');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                flags: 'i',
                loc: null,
                matcher: '=',
                name: {
                  loc: null,
                  name: 'foo',
                  type: IDENTIFIER
                },
                type: ATTRIBUTE_SELECTOR,
                value: {
                  loc: null,
                  name: 'bar',
                  type: IDENTIFIER
                }
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('[foo=bar I]');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                flags: 'I',
                loc: null,
                matcher: '=',
                name: {
                  loc: null,
                  name: 'foo',
                  type: IDENTIFIER
                },
                type: ATTRIBUTE_SELECTOR,
                value: {
                  loc: null,
                  name: 'bar',
                  type: IDENTIFIER
                }
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('[foo=bar s]');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                flags: 's',
                loc: null,
                matcher: '=',
                name: {
                  loc: null,
                  name: 'foo',
                  type: IDENTIFIER
                },
                type: ATTRIBUTE_SELECTOR,
                value: {
                  loc: null,
                  name: 'bar',
                  type: IDENTIFIER
                }
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('[foo=bar S]');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                flags: 'S',
                loc: null,
                matcher: '=',
                name: {
                  loc: null,
                  name: 'foo',
                  type: IDENTIFIER
                },
                type: ATTRIBUTE_SELECTOR,
                value: {
                  loc: null,
                  name: 'bar',
                  type: IDENTIFIER
                }
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });
  });

  describe('pseudo-class', () => {
    it('should throw', () => {
      assert.throws(() => func(':'), DOMException);
    });

    it('should get selector list', () => {
      const res = func(':foo');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'foo',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('foo:bar');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: TYPE_SELECTOR
              },
              {
                children: null,
                loc: null,
                name: 'bar',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':foo-bar:baz');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'foo-bar',
                type: PSEUDO_CLASS_SELECTOR
              },
              {
                children: null,
                loc: null,
                name: 'baz',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':foo(bar)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    type: RAW,
                    value: 'bar'
                  }
                ],
                loc: null,
                name: 'foo',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':foo(:bar(baz), qux)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    type: RAW,
                    value: ':bar(baz), qux'
                  }
                ],
                loc: null,
                name: 'foo',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':any-link');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'any-link',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':link');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'link',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':visited');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'visited',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':local-link');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'local-link',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':target');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'target',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':target-within');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'target-within',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':scope');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'scope',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':current');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'current',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    // NOTE: :current() is not yet supported
    it('should get selector list', () => {
      const res = func(':current(foo)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    type: RAW,
                    value: 'foo'
                  }
                ],
                loc: null,
                name: 'current',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':past');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'past',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':future');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'future',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':active');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'active',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':hover');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'hover',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':focus');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'focus',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':focus-within');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'focus-within',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':focus-visible');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'focus-visible',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':enabled');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'enabled',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':disabled');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'disabled',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':read-write');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'read-write',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':read-only');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'read-only',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':placeholder-shown');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'placeholder-shown',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':default');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'default',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':checked');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'checked',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':indeterminate');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'indeterminate',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':valid');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'valid',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':invalid');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'invalid',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':in-range');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'in-range',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':out-of-range');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'out-of-range',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':required');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'required',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':optional');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'optional',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':blank');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'blank',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':user-invalid');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'user-invalid',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':root');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'root',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':empty');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'empty',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':first-child');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'first-child',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':last-child');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'last-child',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':only-child');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'only-child',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':first-of-type');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'first-of-type',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':last-of-type');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'last-of-type',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':only-of-type');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'only-of-type',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });
  });

  describe('negation pseudo-class', () => {
    it('should throw', () => {
      assert.throws(() => func(':not()'), DOMException);
    });

    it('should get selector list', () => {
      const res = func(':not(foo)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        children: [
                          {
                            loc: null,
                            name: 'foo',
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
                name: 'not',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':not(:is(foo), bar)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        children: [
                          {
                            children: [
                              {
                                children: [
                                  {
                                    children: [
                                      {
                                        loc: null,
                                        name: 'foo',
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
                            type: PSEUDO_CLASS_SELECTOR
                          }
                        ],
                        loc: null,
                        type: SELECTOR
                      },
                      {
                        children: [
                          {
                            loc: null,
                            name: 'bar',
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
                name: 'not',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':not(:not(foo), bar)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        children: [
                          {
                            children: [
                              {
                                children: [
                                  {
                                    children: [
                                      {
                                        loc: null,
                                        name: 'foo',
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
                            name: 'not',
                            type: PSEUDO_CLASS_SELECTOR
                          }
                        ],
                        loc: null,
                        type: SELECTOR
                      },
                      {
                        children: [
                          {
                            loc: null,
                            name: 'bar',
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
                name: 'not',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':not(*|*)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        children: [
                          {
                            loc: null,
                            name: '*|*',
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
                name: 'not',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });
  });

  describe('matches-any pseudo-class', () => {
    it('should throw', () => {
      assert.throws(() => func(':is()'), DOMException);
    });

    it('should get selector list', () => {
      const res = func(':is(foo)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        children: [
                          {
                            loc: null,
                            name: 'foo',
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
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':is(:not(foo), bar)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        children: [
                          {
                            children: [
                              {
                                children: [
                                  {
                                    children: [
                                      {
                                        loc: null,
                                        name: 'foo',
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
                            name: 'not',
                            type: PSEUDO_CLASS_SELECTOR
                          }
                        ],
                        loc: null,
                        type: SELECTOR
                      },
                      {
                        children: [
                          {
                            loc: null,
                            name: 'bar',
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
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':is(*|*)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        children: [
                          {
                            loc: null,
                            name: '*|*',
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
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });
  });

  describe('specificity-adjustment pseudo-class', () => {
    it('should throw', () => {
      assert.throws(() => func(':where()'), DOMException);
    });

    it('should get selector list', () => {
      const res = func(':where(foo)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        children: [
                          {
                            loc: null,
                            name: 'foo',
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
                name: 'where',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':where(:not(foo), bar)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        children: [
                          {
                            children: [
                              {
                                children: [
                                  {
                                    children: [
                                      {
                                        loc: null,
                                        name: 'foo',
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
                            name: 'not',
                            type: PSEUDO_CLASS_SELECTOR
                          }
                        ],
                        loc: null,
                        type: SELECTOR
                      },
                      {
                        children: [
                          {
                            loc: null,
                            name: 'bar',
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
                name: 'where',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':where(*|*)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      {
                        children: [
                          {
                            loc: null,
                            name: '*|*',
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
                name: 'where',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });
  });

  describe('relational pseudo-class', () => {
    it('should throw', () => {
      assert.throws(() => func(':has()'), DOMException);
    });

    it('should get selector list', () => {
      const res = func('foo:has(> bar) baz');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: TYPE_SELECTOR
              },
              {
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
                            loc: null,
                            name: 'bar',
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
                type: PSEUDO_CLASS_SELECTOR
              },
              {
                loc: null,
                name: ' ',
                type: COMBINATOR
              },
              {
                loc: null,
                name: 'baz',
                type: TYPE_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('foo:has(bar) baz');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: TYPE_SELECTOR
              },
              {
                children: [
                  {
                    children: [
                      {
                        children: [
                          {
                            loc: null,
                            name: 'bar',
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
                type: PSEUDO_CLASS_SELECTOR
              },
              {
                loc: null,
                name: ' ',
                type: COMBINATOR
              },
              {
                loc: null,
                name: 'baz',
                type: TYPE_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('foo:has(bar, baz) qux');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: TYPE_SELECTOR
              },
              {
                children: [
                  {
                    children: [
                      {
                        children: [
                          {
                            loc: null,
                            name: 'bar',
                            type: TYPE_SELECTOR
                          }
                        ],
                        loc: null,
                        type: SELECTOR
                      },
                      {
                        children: [
                          {
                            loc: null,
                            name: 'baz',
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
                type: PSEUDO_CLASS_SELECTOR
              },
              {
                loc: null,
                name: ' ',
                type: COMBINATOR
              },
              {
                loc: null,
                name: 'qux',
                type: TYPE_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('foo:has(> bar, > baz) qux');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: TYPE_SELECTOR
              },
              {
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
                            loc: null,
                            name: 'bar',
                            type: TYPE_SELECTOR
                          }
                        ],
                        loc: null,
                        type: SELECTOR
                      },
                      {
                        children: [
                          {
                            loc: null,
                            name: '>',
                            type: COMBINATOR
                          },
                          {
                            loc: null,
                            name: 'baz',
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
                type: PSEUDO_CLASS_SELECTOR
              },
              {
                loc: null,
                name: ' ',
                type: COMBINATOR
              },
              {
                loc: null,
                name: 'qux',
                type: TYPE_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('foo:has(:is(bar, baz) qux)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: TYPE_SELECTOR
              },
              {
                children: [
                  {
                    children: [
                      {
                        children: [
                          {
                            children: [
                              {
                                children: [
                                  {
                                    children: [
                                      {
                                        loc: null,
                                        name: 'bar',
                                        type: TYPE_SELECTOR
                                      }
                                    ],
                                    loc: null,
                                    type: SELECTOR
                                  },
                                  {
                                    children: [
                                      {
                                        loc: null,
                                        name: 'baz',
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
                            type: PSEUDO_CLASS_SELECTOR
                          },
                          {
                            loc: null,
                            name: ' ',
                            type: COMBINATOR
                          },
                          {
                            loc: null,
                            name: 'qux',
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
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('foo:has(> :is(bar, baz) qux)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: TYPE_SELECTOR
              },
              {
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
                                        name: 'bar',
                                        type: TYPE_SELECTOR
                                      }
                                    ],
                                    loc: null,
                                    type: SELECTOR
                                  },
                                  {
                                    children: [
                                      {
                                        loc: null,
                                        name: 'baz',
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
                            type: PSEUDO_CLASS_SELECTOR
                          },
                          {
                            loc: null,
                            name: ' ',
                            type: COMBINATOR
                          },
                          {
                            loc: null,
                            name: 'qux',
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
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('foo:has(*|*)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: TYPE_SELECTOR
              },
              {
                children: [
                  {
                    children: [
                      {
                        children: [
                          {
                            loc: null,
                            name: '*|*',
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
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('foo:has(bar)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: TYPE_SELECTOR
              },
              {
                children: [
                  {
                    children: [
                      {
                        children: [
                          {
                            loc: null,
                            name: 'bar',
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
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('foo:has(> bar)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: TYPE_SELECTOR
              },
              {
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
                            loc: null,
                            name: 'bar',
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
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });
  });

  describe('An+B notation pseudo-class', () => {
    it('should throw', () => {
      assert.throws(() => func(':nth-child()'), DOMException);
    });

    it('should throw', () => {
      assert.throws(() => func(':nth-child(foo)'), DOMException);
    });

    it('should get selector list', () => {
      const res = func(':nth-child(even)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    nth: {
                      loc: null,
                      name: 'even',
                      type: IDENTIFIER
                    },
                    selector: null,
                    type: NTH
                  }
                ],
                loc: null,
                name: 'nth-child',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':nth-child(odd)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    nth: {
                      loc: null,
                      name: 'odd',
                      type: IDENTIFIER
                    },
                    selector: null,
                    type: NTH
                  }
                ],
                loc: null,
                name: 'nth-child',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':nth-child(2n + 1)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    nth: {
                      a: '2',
                      b: '1',
                      loc: null,
                      type: AN_PLUS_B
                    },
                    selector: null,
                    type: NTH
                  }
                ],
                loc: null,
                name: 'nth-child',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':nth-child(-2n - 1)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    nth: {
                      a: '-2',
                      b: '-1',
                      loc: null,
                      type: AN_PLUS_B
                    },
                    selector: null,
                    type: NTH
                  }
                ],
                loc: null,
                name: 'nth-child',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should throw', () => {
      assert.throws(() => func(':nth-child(2n + - 1)'), DOMException);
    });

    it('should get selector list', () => {
      const res = func(':nth-child(2n + 1 of foo)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    nth: {
                      a: '2',
                      b: '1',
                      loc: null,
                      type: AN_PLUS_B
                    },
                    selector: {
                      children: [
                        {
                          children: [
                            {
                              loc: null,
                              name: 'foo',
                              type: TYPE_SELECTOR
                            }
                          ],
                          loc: null,
                          type: SELECTOR
                        }
                      ],
                      loc: null,
                      type: SELECTOR_LIST
                    },
                    type: NTH
                  }
                ],
                loc: null,
                name: 'nth-child',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should throw', () => {
      assert.throws(() => func(':nth-last-child()'), DOMException);
    });

    it('should throw', () => {
      assert.throws(() => func(':nth-last-child(foo)'), DOMException);
    });

    it('should get selector list', () => {
      const res = func(':nth-last-child(even)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    nth: {
                      loc: null,
                      name: 'even',
                      type: IDENTIFIER
                    },
                    selector: null,
                    type: NTH
                  }
                ],
                loc: null,
                name: 'nth-last-child',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':nth-last-child(odd)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    nth: {
                      loc: null,
                      name: 'odd',
                      type: IDENTIFIER
                    },
                    selector: null,
                    type: NTH
                  }
                ],
                loc: null,
                name: 'nth-last-child',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':nth-last-child(2n + 1)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    nth: {
                      a: '2',
                      b: '1',
                      loc: null,
                      type: AN_PLUS_B
                    },
                    selector: null,
                    type: NTH
                  }
                ],
                loc: null,
                name: 'nth-last-child',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':nth-last-child(-2n - 1)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    nth: {
                      a: '-2',
                      b: '-1',
                      loc: null,
                      type: AN_PLUS_B
                    },
                    selector: null,
                    type: NTH
                  }
                ],
                loc: null,
                name: 'nth-last-child',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should throw', () => {
      assert.throws(() => func(':nth-last-child(2n + - 1)'), DOMException);
    });

    it('should get selector list', () => {
      const res = func(':nth-last-child(2n + 1 of foo)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    nth: {
                      a: '2',
                      b: '1',
                      loc: null,
                      type: AN_PLUS_B
                    },
                    selector: {
                      children: [
                        {
                          children: [
                            {
                              loc: null,
                              name: 'foo',
                              type: TYPE_SELECTOR
                            }
                          ],
                          loc: null,
                          type: SELECTOR
                        }
                      ],
                      loc: null,
                      type: SELECTOR_LIST
                    },
                    type: NTH
                  }
                ],
                loc: null,
                name: 'nth-last-child',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should throw', () => {
      assert.throws(() => func(':nth-of-type()'), DOMException);
    });

    it('should throw', () => {
      assert.throws(() => func(':nth-of-type(foo)'), DOMException);
    });

    it('should get selector list', () => {
      const res = func(':nth-of-type(even)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    nth: {
                      loc: null,
                      name: 'even',
                      type: IDENTIFIER
                    },
                    selector: null,
                    type: NTH
                  }
                ],
                loc: null,
                name: 'nth-of-type',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':nth-of-type(odd)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    nth: {
                      loc: null,
                      name: 'odd',
                      type: IDENTIFIER
                    },
                    selector: null,
                    type: NTH
                  }
                ],
                loc: null,
                name: 'nth-of-type',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':nth-of-type(2n + 1)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    nth: {
                      a: '2',
                      b: '1',
                      loc: null,
                      type: AN_PLUS_B
                    },
                    selector: null,
                    type: NTH
                  }
                ],
                loc: null,
                name: 'nth-of-type',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':nth-of-type(-2n - 1)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    nth: {
                      a: '-2',
                      b: '-1',
                      loc: null,
                      type: AN_PLUS_B
                    },
                    selector: null,
                    type: NTH
                  }
                ],
                loc: null,
                name: 'nth-of-type',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should throw', () => {
      assert.throws(() => func(':nth-of-type(2n + - 1)'), DOMException);
    });

    it('should throw', () => {
      assert.throws(() => func(':nth-last-of-type()'), DOMException);
    });

    it('should throw', () => {
      assert.throws(() => func(':nth-last-of-type(foo)'), DOMException);
    });

    it('should get selector list', () => {
      const res = func(':nth-last-of-type(even)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    nth: {
                      loc: null,
                      name: 'even',
                      type: IDENTIFIER
                    },
                    selector: null,
                    type: NTH
                  }
                ],
                loc: null,
                name: 'nth-last-of-type',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':nth-last-of-type(odd)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    nth: {
                      loc: null,
                      name: 'odd',
                      type: IDENTIFIER
                    },
                    selector: null,
                    type: NTH
                  }
                ],
                loc: null,
                name: 'nth-last-of-type',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':nth-last-of-type(2n + 1)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    nth: {
                      a: '2',
                      b: '1',
                      loc: null,
                      type: AN_PLUS_B
                    },
                    selector: null,
                    type: NTH
                  }
                ],
                loc: null,
                name: 'nth-last-of-type',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':nth-last-of-type(-2n - 1)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    nth: {
                      a: '-2',
                      b: '-1',
                      loc: null,
                      type: AN_PLUS_B
                    },
                    selector: null,
                    type: NTH
                  }
                ],
                loc: null,
                name: 'nth-last-of-type',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should throw', () => {
      assert.throws(() => func(':nth-last-of-type(2n + - 1)'), DOMException);
    });

    // NOTE: :nth-col() not yet supported
    it('should get selector list', () => {
      const res = func(':nth-col(even)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    type: RAW,
                    value: 'even'
                  }
                ],
                loc: null,
                name: 'nth-col',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    // NOTE: :nth-last-col() not yet supported
    it('should get selector list', () => {
      const res = func(':nth-last-col(even)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    type: RAW,
                    value: 'even'
                  }
                ],
                loc: null,
                name: 'nth-last-col',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':dir(foo)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    name: 'foo',
                    type: IDENTIFIER
                  }
                ],
                loc: null,
                name: 'dir',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':dir(ltr)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    name: 'ltr',
                    type: IDENTIFIER
                  }
                ],
                loc: null,
                name: 'dir',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':dir(rtr)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    name: 'rtr',
                    type: IDENTIFIER
                  }
                ],
                loc: null,
                name: 'dir',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':dir(auto)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    name: 'auto',
                    type: IDENTIFIER
                  }
                ],
                loc: null,
                name: 'dir',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':lang(de)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    name: 'de',
                    type: IDENTIFIER
                  }
                ],
                loc: null,
                name: 'lang',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    // FIXME: expect to parse
    it('should throw', () => {
      assert.throws(() => func(':lang("en-US")'), DOMException);
    });

    it('should get selector list', () => {
      const res = func(':lang(de-DE)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    name: 'de-DE',
                    type: IDENTIFIER
                  }
                ],
                loc: null,
                name: 'lang',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func(':lang(\\*-Latn)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    name: '\\*-Latn',
                    type: IDENTIFIER
                  }
                ],
                loc: null,
                name: 'lang',
                type: PSEUDO_CLASS_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    // FIXME: expect to parse
    it('should throw', () => {
      assert.throws(() => func(':lang("*-Latn")'), DOMException);
    });

    // FIXME: expect to parse
    it('should throw', () => {
      assert.throws(() => func(':lang("")'), DOMException);
    });
  });

  describe('combinators', () => {
    it('should get selector list', () => {
      const res = func('foo bar');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: TYPE_SELECTOR
              },
              {
                loc: null,
                name: ' ',
                type: COMBINATOR
              },
              {
                loc: null,
                name: 'bar',
                type: TYPE_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('foo bar.baz qux');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: TYPE_SELECTOR
              },
              {
                loc: null,
                name: ' ',
                type: COMBINATOR
              },
              {
                loc: null,
                name: 'bar',
                type: TYPE_SELECTOR
              },
              {
                loc: null,
                name: 'baz',
                type: CLASS_SELECTOR
              },
              {
                loc: null,
                name: ' ',
                type: COMBINATOR
              },
              {
                loc: null,
                name: 'qux',
                type: TYPE_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('foo > bar');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: TYPE_SELECTOR
              },
              {
                loc: null,
                name: '>',
                type: COMBINATOR
              },
              {
                loc: null,
                name: 'bar',
                type: TYPE_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('foo >');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: TYPE_SELECTOR
              },
              {
                loc: null,
                name: '>',
                type: COMBINATOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('foo + bar');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: TYPE_SELECTOR
              },
              {
                loc: null,
                name: '+',
                type: COMBINATOR
              },
              {
                loc: null,
                name: 'bar',
                type: TYPE_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('foo +');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: TYPE_SELECTOR
              },
              {
                loc: null,
                name: '+',
                type: COMBINATOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('+ bar');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: '+',
                type: COMBINATOR
              },
              {
                loc: null,
                name: 'bar',
                type: TYPE_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('foo ~ bar');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: TYPE_SELECTOR
              },
              {
                loc: null,
                name: '~',
                type: COMBINATOR
              },
              {
                loc: null,
                name: 'bar',
                type: TYPE_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('foo ~');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: TYPE_SELECTOR
              },
              {
                loc: null,
                name: '~',
                type: COMBINATOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });

    it('should get selector list', () => {
      const res = func('~ bar');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: '~',
                type: COMBINATOR
              },
              {
                loc: null,
                name: 'bar',
                type: TYPE_SELECTOR
              }
            ],
            loc: null,
            type: SELECTOR
          }
        ],
        loc: null,
        type: SELECTOR_LIST
      }, 'result');
    });
  });
});

describe('walk AST', () => {
  const func = parser.walkAST;

  it('should get empty array', () => {
    const res = func();
    assert.deepEqual(res, [], 'result');
  });

  it('should get selectors', () => {
    const ast = {
      children: [
        {
          children: [
            {
              loc: null,
              name: 'ul',
              type: TYPE_SELECTOR
            },
            {
              loc: null,
              name: '>',
              type: COMBINATOR
            },
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
    };
    const res = func(ast);
    assert.deepEqual(res, [
      [
        {
          loc: null,
          name: 'ul',
          type: TYPE_SELECTOR
        },
        {
          loc: null,
          name: '>',
          type: COMBINATOR
        },
        {
          loc: null,
          name: 'li',
          type: TYPE_SELECTOR
        }
      ]
    ], 'result');
  });

  it('should get selectors', () => {
    const ast = {
      children: [
        {
          children: [
            {
              loc: null,
              name: 'ul',
              type: TYPE_SELECTOR
            },
            {
              loc: null,
              name: '>',
              type: COMBINATOR
            },
            {
              loc: null,
              name: 'li',
              type: TYPE_SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR
        },
        {
          children: [
            {
              loc: null,
              name: 'ol',
              type: TYPE_SELECTOR
            },
            {
              loc: null,
              name: '>',
              type: COMBINATOR
            },
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
    };
    const res = func(ast);
    assert.deepEqual(res, [
      [
        {
          loc: null,
          name: 'ul',
          type: TYPE_SELECTOR
        },
        {
          loc: null,
          name: '>',
          type: COMBINATOR
        },
        {
          loc: null,
          name: 'li',
          type: TYPE_SELECTOR
        }
      ],
      [
        {
          loc: null,
          name: 'ol',
          type: TYPE_SELECTOR
        },
        {
          loc: null,
          name: '>',
          type: COMBINATOR
        },
        {
          loc: null,
          name: 'li',
          type: TYPE_SELECTOR
        }
      ]
    ], 'result');
  });
});
