/**
 * parser.test.js
 */

/* api */
import { assert } from 'chai';
import { describe, it, xit } from 'mocha';

/* test */
import * as parser from '../src/js/parser.js';

/* constants */
import {
  AN_PLUS_B, COMBINATOR, IDENTIFIER, NTH, RAW, SELECTOR, SELECTOR_ATTR,
  SELECTOR_CLASS, SELECTOR_ID, SELECTOR_LIST, SELECTOR_PSEUDO_CLASS,
  SELECTOR_PSEUDO_ELEMENT, SELECTOR_TYPE, STRING
} from '../src/js/constant.js';

describe('unescape selector', () => {
  const func = parser.unescapeSelector;

  it('should get value', () => {
    const res = func();
    assert.strictEqual(res, '', 'result');
  });

  it('should get value', () => {
    const res = func('');
    assert.strictEqual(res, '', 'result');
  });

  it('should get replaced value', () => {
    const res = func('\\');
    assert.strictEqual(res, '\uFFFD', 'result');
  });

  it('should get value', () => {
    const res = func('\\global');
    assert.strictEqual(res, 'global', 'result');
  });

  it('should get value', () => {
    const res = func('\\n');
    assert.strictEqual(res, 'n', 'result');
  });

  it('should get value', () => {
    const res = func('\\\n');
    assert.strictEqual(res, '\\\n', 'result');
  });

  it('should get replaced value', () => {
    const res = func('\\0');
    assert.strictEqual(res, '\uFFFD', 'result');
  });

  it('should get replaced value', () => {
    const res = func('\\000000');
    assert.strictEqual(res, '\uFFFD', 'result');
  });

  it('should get value', () => {
    const res = func('\\30');
    assert.strictEqual(res, '0', 'result');
  });

  it('should get value', () => {
    const res = func('\\30 \\30 ');
    assert.strictEqual(res, '00', 'result');
  });

  it('should get value', () => {
    const res = func('\\41');
    assert.strictEqual(res, 'A', 'result');
  });

  it('should get value', () => {
    const res = func('hel\\6Co');
    assert.strictEqual(res, 'hello', 'result');
  });

  it('should get value', () => {
    const res = func('hel\\6C o');
    assert.strictEqual(res, 'hello', 'result');
  });

  it('should get value', () => {
    const res = func('\\26 B');
    assert.strictEqual(res, '&B', 'result');
  });

  it('should get replaced value', () => {
    const res = func('\\D83D \\DE00 ');
    assert.strictEqual(res, '\u{FFFD}\u{FFFD}', 'result');
  });

  it('should get value', () => {
    const res = func('\\1f511 ');
    assert.strictEqual(res, '\u{1F511}', 'result');
  });

  it('should get replaced value', () => {
    const res = func('\\2F804 ');
    assert.strictEqual(res, '\u{2F804}', 'result');
  });

  it('should get replaced value', () => {
    const res = func('\\10FFFF ');
    assert.strictEqual(res, '\u{10FFFF}', 'result');
  });

  it('should get replaced value', () => {
    const res = func('\\10FFFF0');
    assert.strictEqual(res, '\u{10FFFF}0', 'result');
  });

  it('should get replaced value', () => {
    const res = func('\\110000 ');
    assert.strictEqual(res, '\uFFFD', 'result');
  });

  it('should get replaced value', () => {
    const res = func('\\ffffff ');
    assert.strictEqual(res, '\uFFFD', 'result');
  });
});

describe('preprocess', () => {
  const func = parser.preprocess;

  it('should throw', () => {
    assert.throws(() => func(), TypeError,
      '1 argument required, but only 0 present.');
  });

  it('should throw', () => {
    assert.throws(() => func(1), DOMException);
  });

  it('should get value', () => {
    const res = func(undefined);
    assert.strictEqual(res, 'undefined', 'result');
  });

  it('should get value', () => {
    const res = func(null);
    assert.strictEqual(res, 'null', 'result');
  });

  it('should get value', () => {
    const res = func('foo\fbar');
    assert.strictEqual(res, 'foo\nbar', 'result');
  });

  it('should get value', () => {
    const res = func('\u0000');
    assert.strictEqual(res, '\uFFFD', 'result');
  });
});

describe('create AST from CSS selector', () => {
  const func = parser.parseSelector;

  describe('invalid selectors', () => {
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
      assert.throws(() => func('[foo=bar baz qux]'), DOMException);
    });

    it('should throw', () => {
      assert.throws(() => func('*|'), DOMException);
    });
  });

  describe('should parse', () => {
    it('should get selector list', () => {
      const res = func();
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'undefined',
                type: SELECTOR_TYPE
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
      const res = func(undefined);
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'undefined',
                type: SELECTOR_TYPE
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
      const res = func(null);
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'null',
                type: SELECTOR_TYPE
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
      const res = func('eof\\');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'eof\u{FFFD}',
                type: SELECTOR_TYPE
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
      const res = func('[align=center');
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
                  name: 'align',
                  type: IDENTIFIER
                },
                type: SELECTOR_ATTR,
                value: {
                  loc: null,
                  name: 'center',
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
      const res = func('::slotted(foo');
      assert.deepEqual(res, {
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
                        type: SELECTOR_TYPE
                      }
                    ],
                    loc: null,
                    type: SELECTOR
                  }
                ],
                loc: null,
                name: 'slotted',
                type: SELECTOR_PSEUDO_ELEMENT
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
      const res = func('#foo\u{2003}bar');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo bar',
                type: SELECTOR_ID
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
      const res = func('#1\u{2003}2');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: '1 2',
                type: SELECTOR_ID
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
      const res = func('#\u{2003}');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: '\u{2003}',
                type: SELECTOR_ID
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
      const res = func('#\u{A0}');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: '\u{A0}',
                type: SELECTOR_ID
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
      const res = func('#\u{12345}');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: '\\12345 ',
                type: SELECTOR_ID
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
      const res = func('#\u{12345}foo');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: '\\12345 foo',
                type: SELECTOR_ID
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
      const res = func('div:not(.foo)');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'div',
                type: SELECTOR_TYPE
              },
              {
                children: [
                  {
                    children: [
                      {
                        children: [
                          {
                            loc: null,
                            name: 'foo',
                            type: SELECTOR_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_TYPE
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
      const res = func('|*');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: '|*',
                type: SELECTOR_TYPE
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
                type: SELECTOR_TYPE
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
                type: SELECTOR_TYPE
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
                type: SELECTOR_TYPE
              },
              {
                loc: null,
                name: ' ',
                type: COMBINATOR
              },
              {
                loc: null,
                name: '*',
                type: SELECTOR_TYPE
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
                type: SELECTOR_TYPE
              },
              {
                loc: null,
                name: ' ',
                type: COMBINATOR
              },
              {
                loc: null,
                name: 'foo',
                type: SELECTOR_TYPE
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
                type: SELECTOR_TYPE
              },
              {
                loc: null,
                name: 'foo',
                type: SELECTOR_CLASS
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
                type: SELECTOR_TYPE
              },
              {
                loc: null,
                name: 'foo',
                type: SELECTOR_ID
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
                type: SELECTOR_TYPE
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
                type: SELECTOR_ATTR,
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
                type: SELECTOR_TYPE
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
                type: SELECTOR_TYPE
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
                type: SELECTOR_TYPE
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
                type: SELECTOR_TYPE
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
                type: SELECTOR_TYPE
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

    it('should throw', () => {
      assert.throws(() => func('.-123'), DOMException);
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
                type: SELECTOR_CLASS
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
                type: SELECTOR_TYPE
              },
              {
                loc: null,
                name: 'bar',
                type: SELECTOR_CLASS
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
                type: SELECTOR_TYPE
              },
              {
                loc: null,
                name: 'bar',
                type: SELECTOR_CLASS
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
                type: SELECTOR_TYPE
              },
              {
                loc: null,
                name: 'bar',
                type: SELECTOR_CLASS
              },
              {
                loc: null,
                name: 'baz',
                type: SELECTOR_CLASS
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

    it('should throw', () => {
      assert.throws(() => func('#-123'), DOMException);
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
                type: SELECTOR_ID
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
                type: SELECTOR_TYPE
              },
              {
                loc: null,
                name: 'bar',
                type: SELECTOR_ID
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
                type: SELECTOR_TYPE
              },
              {
                loc: null,
                name: 'bar',
                type: SELECTOR_ID
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
      const res = func('#\\30 nextIsWhiteSpace');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: '\\30 nextIsWhiteSpace',
                type: SELECTOR_ID
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
      const res = func('#foo\\ bar');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo\\ bar',
                type: SELECTOR_ID
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
                type: SELECTOR_ATTR,
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
                type: SELECTOR_TYPE
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
                type: SELECTOR_ATTR,
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
                type: SELECTOR_ATTR,
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
                type: SELECTOR_ATTR,
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
                type: SELECTOR_ATTR,
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
                type: SELECTOR_ATTR,
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
                type: SELECTOR_ATTR,
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
                type: SELECTOR_ATTR,
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
                type: SELECTOR_ATTR,
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
                type: SELECTOR_ATTR,
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
                type: SELECTOR_ATTR,
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
                type: SELECTOR_ATTR,
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
                type: SELECTOR_ATTR,
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
                type: SELECTOR_ATTR,
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
                type: SELECTOR_ATTR,
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
                type: SELECTOR_ATTR,
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
                type: SELECTOR_ATTR,
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
                type: SELECTOR_ATTR,
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

    // NOTE: should be thrown afterwards
    it('should get selector list', () => {
      const res = func('[foo=bar baz]');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                flags: 'baz',
                loc: null,
                matcher: '=',
                name: {
                  loc: null,
                  name: 'foo',
                  type: IDENTIFIER
                },
                type: SELECTOR_ATTR,
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_TYPE
              },
              {
                children: null,
                loc: null,
                name: 'bar',
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
              },
              {
                children: null,
                loc: null,
                name: 'baz',
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                            type: SELECTOR_TYPE
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
                type: SELECTOR_PSEUDO_CLASS
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
                                        type: SELECTOR_TYPE
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
                            type: SELECTOR_PSEUDO_CLASS
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
                            type: SELECTOR_TYPE
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
                type: SELECTOR_PSEUDO_CLASS
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
                                        type: SELECTOR_TYPE
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
                            type: SELECTOR_PSEUDO_CLASS
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
                            type: SELECTOR_TYPE
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
                type: SELECTOR_PSEUDO_CLASS
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
                            type: SELECTOR_TYPE
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
                type: SELECTOR_PSEUDO_CLASS
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
                            type: SELECTOR_TYPE
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
                type: SELECTOR_PSEUDO_CLASS
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
                                        type: SELECTOR_TYPE
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
                            type: SELECTOR_PSEUDO_CLASS
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
                            type: SELECTOR_TYPE
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
                type: SELECTOR_PSEUDO_CLASS
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
                            type: SELECTOR_TYPE
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
                type: SELECTOR_PSEUDO_CLASS
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
                            type: SELECTOR_TYPE
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
                type: SELECTOR_PSEUDO_CLASS
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
                                        type: SELECTOR_TYPE
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
                            type: SELECTOR_PSEUDO_CLASS
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
                            type: SELECTOR_TYPE
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
                type: SELECTOR_PSEUDO_CLASS
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
                            type: SELECTOR_TYPE
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_TYPE
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
                            type: SELECTOR_TYPE
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
                type: SELECTOR_PSEUDO_CLASS
              },
              {
                loc: null,
                name: ' ',
                type: COMBINATOR
              },
              {
                loc: null,
                name: 'baz',
                type: SELECTOR_TYPE
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
      const res = func('foo:has(> bar > baz) qux');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: SELECTOR_TYPE
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
                            type: SELECTOR_TYPE
                          },
                          {
                            loc: null,
                            name: '>',
                            type: COMBINATOR
                          },
                          {
                            loc: null,
                            name: 'baz',
                            type: SELECTOR_TYPE
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
                type: SELECTOR_PSEUDO_CLASS
              },
              {
                loc: null,
                name: ' ',
                type: COMBINATOR
              },
              {
                loc: null,
                name: 'qux',
                type: SELECTOR_TYPE
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
                type: SELECTOR_TYPE
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
                            type: SELECTOR_TYPE
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
                type: SELECTOR_PSEUDO_CLASS
              },
              {
                loc: null,
                name: ' ',
                type: COMBINATOR
              },
              {
                loc: null,
                name: 'baz',
                type: SELECTOR_TYPE
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
                type: SELECTOR_TYPE
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
                            type: SELECTOR_TYPE
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
                            type: SELECTOR_TYPE
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
                type: SELECTOR_PSEUDO_CLASS
              },
              {
                loc: null,
                name: ' ',
                type: COMBINATOR
              },
              {
                loc: null,
                name: 'qux',
                type: SELECTOR_TYPE
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
                type: SELECTOR_TYPE
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
                            type: SELECTOR_TYPE
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
                            type: SELECTOR_TYPE
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
                type: SELECTOR_PSEUDO_CLASS
              },
              {
                loc: null,
                name: ' ',
                type: COMBINATOR
              },
              {
                loc: null,
                name: 'qux',
                type: SELECTOR_TYPE
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
                type: SELECTOR_TYPE
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
                                        type: SELECTOR_TYPE
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
                                        type: SELECTOR_TYPE
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
                            type: SELECTOR_PSEUDO_CLASS
                          },
                          {
                            loc: null,
                            name: ' ',
                            type: COMBINATOR
                          },
                          {
                            loc: null,
                            name: 'qux',
                            type: SELECTOR_TYPE
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_TYPE
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
                                        type: SELECTOR_TYPE
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
                                        type: SELECTOR_TYPE
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
                            type: SELECTOR_PSEUDO_CLASS
                          },
                          {
                            loc: null,
                            name: ' ',
                            type: COMBINATOR
                          },
                          {
                            loc: null,
                            name: 'qux',
                            type: SELECTOR_TYPE
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_TYPE
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
                            type: SELECTOR_TYPE
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_TYPE
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
                            type: SELECTOR_TYPE
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_TYPE
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
                            type: SELECTOR_TYPE
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
                type: SELECTOR_PSEUDO_CLASS
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
      const res = func(':has(> :scope)');
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
                            name: '>',
                            type: COMBINATOR
                          },
                          {
                            children: null,
                            loc: null,
                            name: 'scope',
                            type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                              type: SELECTOR_TYPE
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                              type: SELECTOR_TYPE
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
    xit('should get selector list', () => {
      const res = func(':lang(de, fr)');
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
                  },
                  {
                    loc: null,
                    name: 'fr',
                    type: IDENTIFIER
                  }
                ],
                loc: null,
                name: 'lang',
                type: SELECTOR_PSEUDO_CLASS
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
                type: SELECTOR_PSEUDO_CLASS
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
      const res = func(':lang("*")');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    name: '\\*',
                    type: IDENTIFIER
                  }
                ],
                loc: null,
                name: 'lang',
                type: SELECTOR_PSEUDO_CLASS
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
      const res = func(':lang("en-US")');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: [
                  {
                    loc: null,
                    name: 'en-US',
                    type: IDENTIFIER
                  }
                ],
                loc: null,
                name: 'lang',
                type: SELECTOR_PSEUDO_CLASS
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
      const res = func(':lang("*-Latn")');
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
                type: SELECTOR_PSEUDO_CLASS
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
      assert.throws(() => func(':lang("")'), DOMException);
    });

    it('should get selector list', () => {
      const res = func(':host');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'host',
                type: SELECTOR_PSEUDO_CLASS
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
      assert.throws(() => func(':host()'), DOMException);
    });

    it('should throw', () => {
      assert.throws(() => func(':host(.foo, .bar)'), DOMException);
    });

    it('should get selector list', () => {
      const res = func(':host(.foo)');
      assert.deepEqual(res, {
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
                        type: SELECTOR_CLASS
                      }
                    ],
                    loc: null,
                    type: SELECTOR
                  }
                ],
                loc: null,
                name: 'host',
                type: SELECTOR_PSEUDO_CLASS
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
      const res = func(':host-context(.foo)');
      assert.deepEqual(res, {
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
                        type: SELECTOR_CLASS
                      }
                    ],
                    loc: null,
                    type: SELECTOR
                  }
                ],
                loc: null,
                name: 'host-context',
                type: SELECTOR_PSEUDO_CLASS
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

  describe('pseudo-element', () => {
    it('should throw', () => {
      assert.throws(() => func(':::before'), DOMException);
    });

    it('should get selector list', () => {
      const res = func('::before');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'before',
                type: SELECTOR_PSEUDO_ELEMENT
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

    // NOTE: parsed as pseudo-class
    it('should get selector list', () => {
      const res = func(':before');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                children: null,
                loc: null,
                name: 'before',
                type: 'PseudoClassSelector'
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
      const res = func('::slotted(foo)');
      assert.deepEqual(res, {
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
                        type: SELECTOR_TYPE
                      }
                    ],
                    loc: null,
                    type: SELECTOR
                  }
                ],
                loc: null,
                name: 'slotted',
                type: SELECTOR_PSEUDO_ELEMENT
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
                type: SELECTOR_TYPE
              },
              {
                loc: null,
                name: ' ',
                type: COMBINATOR
              },
              {
                loc: null,
                name: 'bar',
                type: SELECTOR_TYPE
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
                type: SELECTOR_TYPE
              },
              {
                loc: null,
                name: ' ',
                type: COMBINATOR
              },
              {
                loc: null,
                name: 'bar',
                type: SELECTOR_TYPE
              },
              {
                loc: null,
                name: 'baz',
                type: SELECTOR_CLASS
              },
              {
                loc: null,
                name: ' ',
                type: COMBINATOR
              },
              {
                loc: null,
                name: 'qux',
                type: SELECTOR_TYPE
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
                type: SELECTOR_TYPE
              },
              {
                loc: null,
                name: '>',
                type: COMBINATOR
              },
              {
                loc: null,
                name: 'bar',
                type: SELECTOR_TYPE
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
                type: SELECTOR_TYPE
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
                type: SELECTOR_TYPE
              },
              {
                loc: null,
                name: '+',
                type: COMBINATOR
              },
              {
                loc: null,
                name: 'bar',
                type: SELECTOR_TYPE
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
                type: SELECTOR_TYPE
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
                type: SELECTOR_TYPE
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
                type: SELECTOR_TYPE
              },
              {
                loc: null,
                name: '~',
                type: COMBINATOR
              },
              {
                loc: null,
                name: 'bar',
                type: SELECTOR_TYPE
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
                type: SELECTOR_TYPE
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
                type: SELECTOR_TYPE
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

    // unknown combinators
    it('should throw', () => {
      assert.throws(() => func('foo % bar'), DOMException);
    });

    it('should throw', () => {
      assert.throws(() => func('foo - bar'), DOMException);
    });

    // NOTE : thrown afterwards
    it('should get selector list', () => {
      const res = func('foo ++ bar');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'foo',
                type: SELECTOR_TYPE
              },
              {
                loc: null,
                name: '+',
                type: COMBINATOR
              },
              {
                loc: null,
                name: '+',
                type: COMBINATOR
              },
              {
                loc: null,
                name: 'bar',
                type: SELECTOR_TYPE
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
              type: SELECTOR_TYPE
            },
            {
              loc: null,
              name: '>',
              type: COMBINATOR
            },
            {
              loc: null,
              name: 'li',
              type: SELECTOR_TYPE
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
          type: SELECTOR_TYPE
        },
        {
          loc: null,
          name: '>',
          type: COMBINATOR
        },
        {
          loc: null,
          name: 'li',
          type: SELECTOR_TYPE
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
              type: SELECTOR_TYPE
            },
            {
              loc: null,
              name: '>',
              type: COMBINATOR
            },
            {
              loc: null,
              name: 'li',
              type: SELECTOR_TYPE
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
              type: SELECTOR_TYPE
            },
            {
              loc: null,
              name: '>',
              type: COMBINATOR
            },
            {
              loc: null,
              name: 'li',
              type: SELECTOR_TYPE
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
          type: SELECTOR_TYPE
        },
        {
          loc: null,
          name: '>',
          type: COMBINATOR
        },
        {
          loc: null,
          name: 'li',
          type: SELECTOR_TYPE
        }
      ],
      [
        {
          loc: null,
          name: 'ol',
          type: SELECTOR_TYPE
        },
        {
          loc: null,
          name: '>',
          type: COMBINATOR
        },
        {
          loc: null,
          name: 'li',
          type: SELECTOR_TYPE
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
              name: 'div',
              type: SELECTOR_TYPE
            },
            {
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          loc: null,
                          name: 'foo',
                          type: SELECTOR_CLASS
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
              type: SELECTOR_PSEUDO_CLASS
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
          name: 'div',
          type: SELECTOR_TYPE
        },
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      loc: null,
                      name: 'foo',
                      type: SELECTOR_CLASS
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
          type: SELECTOR_PSEUDO_CLASS
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
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          loc: null,
                          name: '*',
                          type: SELECTOR_TYPE
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
              type: SELECTOR_PSEUDO_CLASS
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
          children: [
            {
              children: [
                {
                  children: [
                    {
                      loc: null,
                      name: '*',
                      type: SELECTOR_TYPE
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
          type: SELECTOR_PSEUDO_CLASS
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
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          loc: null,
                          name: '*|*',
                          type: SELECTOR_TYPE
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
              type: SELECTOR_PSEUDO_CLASS
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
          children: [
            {
              children: [
                {
                  children: [
                    {
                      loc: null,
                      name: '*|*',
                      type: SELECTOR_TYPE
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
          type: SELECTOR_PSEUDO_CLASS
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
              children: [
                {
                  children: [
                    {
                      loc: null,
                      name: 'foo',
                      type: SELECTOR_TYPE
                    }
                  ],
                  loc: null,
                  type: SELECTOR
                }
              ],
              loc: null,
              name: 'slotted',
              type: SELECTOR_PSEUDO_ELEMENT
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
          children: [
            {
              children: [
                {
                  loc: null,
                  name: 'foo',
                  type: SELECTOR_TYPE
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          name: 'slotted',
          type: SELECTOR_PSEUDO_ELEMENT
        }
      ]
    ], 'result');
  });
});
