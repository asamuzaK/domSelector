/**
 * parser.test.js
 */

/* api */
import { strict as assert } from 'node:assert';
import { describe, it } from 'mocha';

/* test */
import * as parser from '../src/js/parser.js';

/* constants */
import {
  ATTR_SELECTOR,
  CLASS_SELECTOR,
  COMBINATOR,
  IDENT,
  ID_SELECTOR,
  NTH,
  OPERATOR,
  PS_CLASS_SELECTOR,
  PS_ELEMENT_SELECTOR,
  SELECTOR,
  STRING,
  SYNTAX_ERR,
  TYPE_SELECTOR
} from '../src/js/constant.js';
const AN_PLUS_B = 'AnPlusB';
const RAW = 'Raw';
const SELECTOR_LIST = 'SelectorList';

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
    assert.throws(
      () => func(1),
      e => {
        assert.strictEqual(e instanceof DOMException, true, 'instance');
        assert.strictEqual(e.name, SYNTAX_ERR, 'name');
        assert.strictEqual(e.message, 'Invalid selector 1', 'message');
        return true;
      }
    );
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
      assert.throws(
        () => func(''),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector ', 'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      assert.throws(
        () => func('>*'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector >*', 'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      assert.throws(
        () => func('*,'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector *,', 'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      assert.throws(
        () => func('[foo=bar baz qux]'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector [foo=bar baz qux]',
            'message'
          );
          return true;
        }
      );
    });

    it('should throw', () => {
      assert.throws(
        () => func('*|'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector *|', 'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      assert.throws(
        () => func('foo < bar'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector foo < bar',
            'message'
          );
          return true;
        }
      );
    });

    it('should throw', () => {
      assert.throws(
        () => func('foo<bar'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector foo<bar', 'message');
          return true;
        }
      );
    });
  });

  describe('valid selectors', () => {
    it('should get selector list', () => {
      const res = func();
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: 'undefined',
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
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(undefined);
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: 'undefined',
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
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(null);
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: 'null',
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
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('eof\\');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: 'eof\u{FFFD}',
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
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('[align=center');
      assert.deepEqual(
        res,
        {
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
                    type: IDENT
                  },
                  type: ATTR_SELECTOR,
                  value: {
                    loc: null,
                    name: 'center',
                    type: IDENT
                  }
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('::slotted(foo');
      assert.deepEqual(
        res,
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
                  name: 'slotted',
                  type: PS_ELEMENT_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('#123');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: '123',
                  type: ID_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('#-123');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: '-123',
                  type: ID_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('#foo\u{2003}bar');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: 'foo bar',
                  type: ID_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('#\\1\u{2003}2');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: '\\1 2',
                  type: ID_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('#\u{2003}');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: '\u{2003}',
                  type: ID_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('#\u{A0}');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: '\u{A0}',
                  type: ID_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('#\u{12345}');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: '\\12345 ',
                  type: ID_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('#\u{12345}foo');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: '\\12345 foo',
                  type: ID_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('div:not(.foo)');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: 'div',
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
                    }
                  ],
                  loc: null,
                  name: 'not',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });
  });

  describe('universal selector', () => {
    it('should get selector list', () => {
      const res = func('*');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });

    it('should get namespaced selector list', () => {
      const res = func('|*');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });

    it('should get namespaced selector list', () => {
      const res = func('*|*');
      assert.deepEqual(
        res,
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
        },
        'result'
      );
    });

    it('should get namespaced selector list', () => {
      const res = func('foo|*');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('foo *');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('* foo');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('*.foo');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('*#foo');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('*[foo]');
      assert.deepEqual(
        res,
        {
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
                    type: IDENT
                  },
                  type: ATTR_SELECTOR,
                  value: null
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });
  });

  describe('type selector', () => {
    it('should get selector list', () => {
      const res = func('foo');
      assert.deepEqual(
        res,
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('foo, bar');
      assert.deepEqual(
        res,
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
        },
        'result'
      );
    });

    it('should get namespaced selector list', () => {
      const res = func('|foo');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });

    it('should get namespaced selector list', () => {
      const res = func('foo|bar');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });
  });

  describe('class selector', () => {
    it('should throw', () => {
      assert.throws(
        () => func('.'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector .', 'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      assert.throws(
        () => func('.123'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector .123', 'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      assert.throws(
        () => func('.-123'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector .-123', 'message');
          return true;
        }
      );
    });

    it('should get selector list', () => {
      const res = func('.foo');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('.-foo');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: '-foo',
                  type: CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('.\\123');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: '\\123',
                  type: CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('.-\\123');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: '-\\123',
                  type: CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('foo.bar');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });

    it('should throw', () => {
      assert.throws(
        () => func('|.foo'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector |.foo', 'message');
          return true;
        }
      );
    });

    it('should get namespaced selector list', () => {
      const res = func('|foo.bar');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('foo.bar.baz');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });
  });

  describe('id selector', () => {
    it('should throw', () => {
      assert.throws(
        () => func('#'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector #', 'message');
          return true;
        }
      );
    });

    it('should get selector list', () => {
      const res = func('#foo');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('#-foo');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: '-foo',
                  type: ID_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('#\\123');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: '\\123',
                  type: ID_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('#-\\123');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: '-\\123',
                  type: ID_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('foo#bar');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });

    it('should throw', () => {
      assert.throws(
        () => func('|#foo'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector |#foo', 'message');
          return true;
        }
      );
    });

    it('should get namespaced selector list', () => {
      const res = func('|foo#bar');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('#\\30 nextIsWhiteSpace');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: '\\30 nextIsWhiteSpace',
                  type: ID_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('#foo\\ bar');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: 'foo\\ bar',
                  type: ID_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });
  });

  describe('attribute selector', () => {
    it('should throw', () => {
      assert.throws(
        () => func('[]'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector []', 'message');
          return true;
        }
      );
    });

    it('should throw', () => {
      assert.throws(
        () => func('[*]'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector [*]', 'message');
          return true;
        }
      );
    });

    it('should get selector list', () => {
      const res = func('[foo]');
      assert.deepEqual(
        res,
        {
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
                    type: IDENT
                  },
                  type: ATTR_SELECTOR,
                  value: null
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('foo[bar]');
      assert.deepEqual(
        res,
        {
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
                    type: IDENT
                  },
                  type: ATTR_SELECTOR,
                  value: null
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get namespaced selector list', () => {
      const res = func('[|foo]');
      assert.deepEqual(
        res,
        {
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
                    type: IDENT
                  },
                  type: ATTR_SELECTOR,
                  value: null
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get namespaced selector list', () => {
      const res = func('[*|foo]');
      assert.deepEqual(
        res,
        {
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
                    type: IDENT
                  },
                  type: ATTR_SELECTOR,
                  value: null
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get namespaced selector list', () => {
      const res = func('[foo|bar]');
      assert.deepEqual(
        res,
        {
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
                    type: IDENT
                  },
                  type: ATTR_SELECTOR,
                  value: null
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('[foo=bar]');
      assert.deepEqual(
        res,
        {
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
                    type: IDENT
                  },
                  type: ATTR_SELECTOR,
                  value: {
                    loc: null,
                    name: 'bar',
                    type: IDENT
                  }
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('[foo="bar"]');
      assert.deepEqual(
        res,
        {
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
                    type: IDENT
                  },
                  type: ATTR_SELECTOR,
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('[foo="bar"] /* sanity check (valid) */');
      assert.deepEqual(
        res,
        {
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
                    type: IDENT
                  },
                  type: ATTR_SELECTOR,
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('[foo="bar baz"]');
      assert.deepEqual(
        res,
        {
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
                    type: IDENT
                  },
                  type: ATTR_SELECTOR,
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('[foo|bar="baz"]');
      assert.deepEqual(
        res,
        {
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
                    type: IDENT
                  },
                  type: ATTR_SELECTOR,
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('[foo~=bar]');
      assert.deepEqual(
        res,
        {
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
                    type: IDENT
                  },
                  type: ATTR_SELECTOR,
                  value: {
                    loc: null,
                    name: 'bar',
                    type: IDENT
                  }
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('[foo|=bar]');
      assert.deepEqual(
        res,
        {
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
                    type: IDENT
                  },
                  type: ATTR_SELECTOR,
                  value: {
                    loc: null,
                    name: 'bar',
                    type: IDENT
                  }
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('[foo^=bar]');
      assert.deepEqual(
        res,
        {
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
                    type: IDENT
                  },
                  type: ATTR_SELECTOR,
                  value: {
                    loc: null,
                    name: 'bar',
                    type: IDENT
                  }
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('[foo$=bar]');
      assert.deepEqual(
        res,
        {
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
                    type: IDENT
                  },
                  type: ATTR_SELECTOR,
                  value: {
                    loc: null,
                    name: 'bar',
                    type: IDENT
                  }
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('[foo*=bar]');
      assert.deepEqual(
        res,
        {
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
                    type: IDENT
                  },
                  type: ATTR_SELECTOR,
                  value: {
                    loc: null,
                    name: 'bar',
                    type: IDENT
                  }
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('[foo=bar i]');
      assert.deepEqual(
        res,
        {
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
                    type: IDENT
                  },
                  type: ATTR_SELECTOR,
                  value: {
                    loc: null,
                    name: 'bar',
                    type: IDENT
                  }
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('[foo=bar I]');
      assert.deepEqual(
        res,
        {
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
                    type: IDENT
                  },
                  type: ATTR_SELECTOR,
                  value: {
                    loc: null,
                    name: 'bar',
                    type: IDENT
                  }
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('[foo="bar" i]');
      assert.deepEqual(
        res,
        {
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
                    type: IDENT
                  },
                  type: ATTR_SELECTOR,
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('[foo="bar"i]');
      assert.deepEqual(
        res,
        {
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
                    type: IDENT
                  },
                  type: ATTR_SELECTOR,
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('[foo="bar" /**/ i]');
      assert.deepEqual(
        res,
        {
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
                    type: IDENT
                  },
                  type: ATTR_SELECTOR,
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('[foo=bar s]');
      assert.deepEqual(
        res,
        {
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
                    type: IDENT
                  },
                  type: ATTR_SELECTOR,
                  value: {
                    loc: null,
                    name: 'bar',
                    type: IDENT
                  }
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('[foo=bar S]');
      assert.deepEqual(
        res,
        {
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
                    type: IDENT
                  },
                  type: ATTR_SELECTOR,
                  value: {
                    loc: null,
                    name: 'bar',
                    type: IDENT
                  }
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    // NOTE: should be thrown afterwards
    it('should get selector list', () => {
      const res = func('[foo=bar baz]');
      assert.deepEqual(
        res,
        {
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
                    type: IDENT
                  },
                  type: ATTR_SELECTOR,
                  value: {
                    loc: null,
                    name: 'bar',
                    type: IDENT
                  }
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });
  });

  describe('pseudo-class', () => {
    it('should throw', () => {
      assert.throws(
        () => func(':'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector :', 'message');
          return true;
        }
      );
    });

    it('should get selector list', () => {
      const res = func(':foo');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'foo',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('foo:bar');
      assert.deepEqual(
        res,
        {
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':foo-bar:baz');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'foo-bar',
                  type: PS_CLASS_SELECTOR
                },
                {
                  children: null,
                  loc: null,
                  name: 'baz',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':foo(bar)');
      assert.deepEqual(
        res,
        {
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':foo(:bar(baz), qux)');
      assert.deepEqual(
        res,
        {
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':any-link');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'any-link',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':link');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'link',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':visited');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'visited',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':local-link');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'local-link',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':target');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'target',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':target-within');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'target-within',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':scope');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'scope',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':current');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'current',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    // NOTE: :current() is not yet supported
    it('should get selector list', () => {
      const res = func(':current(foo)');
      assert.deepEqual(
        res,
        {
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':past');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'past',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':future');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'future',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':active');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'active',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':hover');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'hover',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':focus');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'focus',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':focus-within');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'focus-within',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':focus-visible');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'focus-visible',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':enabled');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'enabled',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':disabled');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'disabled',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':read-write');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'read-write',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':read-only');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'read-only',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':placeholder-shown');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'placeholder-shown',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':default');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'default',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':checked');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'checked',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':indeterminate');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'indeterminate',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':valid');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'valid',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':invalid');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'invalid',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':in-range');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'in-range',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':out-of-range');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'out-of-range',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':required');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'required',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':optional');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'optional',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':blank');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'blank',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':user-invalid');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'user-invalid',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':root');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'root',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':empty');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'empty',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':first-child');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'first-child',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':last-child');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'last-child',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':only-child');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'only-child',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':first-of-type');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'first-of-type',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':last-of-type');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'last-of-type',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':only-of-type');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'only-of-type',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });
  });

  describe('negation pseudo-class', () => {
    it('should get selector list', () => {
      const res = func(':not()');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [],
                  loc: null,
                  name: 'not',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':not( )');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [],
                  loc: null,
                  name: 'not',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':not(foo)');
      assert.deepEqual(
        res,
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':not(:is(foo), bar)');
      assert.deepEqual(
        res,
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
                              type: PS_CLASS_SELECTOR
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':not(:not(foo), bar)');
      assert.deepEqual(
        res,
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
                              type: PS_CLASS_SELECTOR
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':not(*|*)');
      assert.deepEqual(
        res,
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });
  });

  describe('matches-any pseudo-class', () => {
    it('should get selector list', () => {
      const res = func(':is()');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [],
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':is( )');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [],
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':is(:is())');
      assert.deepEqual(
        res,
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
                              children: [],
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
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':is(foo)');
      assert.deepEqual(
        res,
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':is(:not(foo), bar)');
      assert.deepEqual(
        res,
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
                              type: PS_CLASS_SELECTOR
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':is(*|*)');
      assert.deepEqual(
        res,
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });
  });

  describe('specificity-adjustment pseudo-class', () => {
    it('should get selector list', () => {
      const res = func(':where()');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [],
                  loc: null,
                  name: 'where',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':where( )');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [],
                  loc: null,
                  name: 'where',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':where(:where())');
      assert.deepEqual(
        res,
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
                              children: [],
                              loc: null,
                              name: 'where',
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
                  name: 'where',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':where(foo)');
      assert.deepEqual(
        res,
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
                  name: 'where',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':where(:not(foo), bar)');
      assert.deepEqual(
        res,
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
                              type: PS_CLASS_SELECTOR
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':where(*|*)');
      assert.deepEqual(
        res,
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });
  });

  describe('relational pseudo-class', () => {
    it('should get selector list', () => {
      const res = func(':has()');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [],
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':has( )');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [],
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('foo:has(> bar) baz');
      assert.deepEqual(
        res,
        {
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
                  type: PS_CLASS_SELECTOR
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('foo:has(> bar > baz) qux');
      assert.deepEqual(
        res,
        {
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
                            },
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
                  type: PS_CLASS_SELECTOR
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('foo:has(bar) baz');
      assert.deepEqual(
        res,
        {
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
                  type: PS_CLASS_SELECTOR
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('foo:has(bar, baz) qux');
      assert.deepEqual(
        res,
        {
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
                  type: PS_CLASS_SELECTOR
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('foo:has(> bar, > baz) qux');
      assert.deepEqual(
        res,
        {
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
                  type: PS_CLASS_SELECTOR
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('foo:has(:is(bar, baz) qux)');
      assert.deepEqual(
        res,
        {
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
                              type: PS_CLASS_SELECTOR
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('foo:has(> :is(bar, baz) qux)');
      assert.deepEqual(
        res,
        {
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
                              type: PS_CLASS_SELECTOR
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':has(:is(:has(foo, bar)))');
      assert.deepEqual(
        res,
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('foo:has(*|*)');
      assert.deepEqual(
        res,
        {
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('foo:has(bar)');
      assert.deepEqual(
        res,
        {
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('foo:has(> bar)');
      assert.deepEqual(
        res,
        {
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':has(> :scope)');
      assert.deepEqual(
        res,
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
                              name: '>',
                              type: COMBINATOR
                            },
                            {
                              children: null,
                              loc: null,
                              name: 'scope',
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
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });
  });

  describe('An+B notation pseudo-class', () => {
    it('should throw', () => {
      assert.throws(
        () => func(':nth-child(foo)'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector :nth-child(foo)',
            'message'
          );
          return true;
        }
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-child()');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [],
                  loc: null,
                  name: 'nth-child',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-child( )');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [],
                  loc: null,
                  name: 'nth-child',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-child(even)');
      assert.deepEqual(
        res,
        {
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
                        type: IDENT
                      },
                      selector: null,
                      type: NTH
                    }
                  ],
                  loc: null,
                  name: 'nth-child',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-child(odd)');
      assert.deepEqual(
        res,
        {
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
                        type: IDENT
                      },
                      selector: null,
                      type: NTH
                    }
                  ],
                  loc: null,
                  name: 'nth-child',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-child(2n + 1)');
      assert.deepEqual(
        res,
        {
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-child(-2n - 1)');
      assert.deepEqual(
        res,
        {
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should throw', () => {
      assert.throws(
        () => func(':nth-child(2n + - 1)'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector :nth-child(2n + - 1)',
            'message'
          );
          return true;
        }
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-child(2n + 1 of foo)');
      assert.deepEqual(
        res,
        {
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-child(odd of :not([hidden]))');
      assert.deepEqual(
        res,
        {
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
                        type: IDENT
                      },
                      selector: {
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
                                            flags: null,
                                            loc: null,
                                            matcher: null,
                                            name: {
                                              loc: null,
                                              name: 'hidden',
                                              type: IDENT
                                            },
                                            type: ATTR_SELECTOR,
                                            value: null
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
                                type: PS_CLASS_SELECTOR
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-child(odd of :not(.foo))');
      assert.deepEqual(
        res,
        {
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
                        type: IDENT
                      },
                      selector: {
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
                                            type: CLASS_SELECTOR
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
                                type: PS_CLASS_SELECTOR
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should throw', () => {
      assert.throws(
        () => func(':nth-last-child(foo)'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector :nth-last-child(foo)',
            'message'
          );
          return true;
        }
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-last-child()');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [],
                  loc: null,
                  name: 'nth-last-child',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-last-child( )');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [],
                  loc: null,
                  name: 'nth-last-child',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-last-child(even)');
      assert.deepEqual(
        res,
        {
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
                        type: IDENT
                      },
                      selector: null,
                      type: NTH
                    }
                  ],
                  loc: null,
                  name: 'nth-last-child',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-last-child(odd)');
      assert.deepEqual(
        res,
        {
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
                        type: IDENT
                      },
                      selector: null,
                      type: NTH
                    }
                  ],
                  loc: null,
                  name: 'nth-last-child',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-last-child(2n + 1)');
      assert.deepEqual(
        res,
        {
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-last-child(-2n - 1)');
      assert.deepEqual(
        res,
        {
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should throw', () => {
      assert.throws(
        () => func(':nth-last-child(2n + - 1)'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector :nth-last-child(2n + - 1)',
            'message'
          );
          return true;
        }
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-last-child(2n + 1 of foo)');
      assert.deepEqual(
        res,
        {
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should throw', () => {
      assert.throws(
        () => func(':nth-of-type(foo)'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector :nth-of-type(foo)',
            'message'
          );
          return true;
        }
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-of-type()');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [],
                  loc: null,
                  name: 'nth-of-type',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-of-type( )');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [],
                  loc: null,
                  name: 'nth-of-type',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-of-type(even)');
      assert.deepEqual(
        res,
        {
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
                        type: IDENT
                      },
                      selector: null,
                      type: NTH
                    }
                  ],
                  loc: null,
                  name: 'nth-of-type',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-of-type(odd)');
      assert.deepEqual(
        res,
        {
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
                        type: IDENT
                      },
                      selector: null,
                      type: NTH
                    }
                  ],
                  loc: null,
                  name: 'nth-of-type',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-of-type(2n + 1)');
      assert.deepEqual(
        res,
        {
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-of-type(-2n - 1)');
      assert.deepEqual(
        res,
        {
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should throw', () => {
      assert.throws(
        () => func(':nth-of-type(2n + - 1)'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector :nth-of-type(2n + - 1)',
            'message'
          );
          return true;
        }
      );
    });

    it('should throw', () => {
      assert.throws(
        () => func(':nth-last-of-type(foo)'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector :nth-last-of-type(foo)',
            'message'
          );
          return true;
        }
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-last-of-type()');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [],
                  loc: null,
                  name: 'nth-last-of-type',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-last-of-type( )');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [],
                  loc: null,
                  name: 'nth-last-of-type',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-last-of-type(even)');
      assert.deepEqual(
        res,
        {
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
                        type: IDENT
                      },
                      selector: null,
                      type: NTH
                    }
                  ],
                  loc: null,
                  name: 'nth-last-of-type',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-last-of-type(odd)');
      assert.deepEqual(
        res,
        {
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
                        type: IDENT
                      },
                      selector: null,
                      type: NTH
                    }
                  ],
                  loc: null,
                  name: 'nth-last-of-type',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-last-of-type(2n + 1)');
      assert.deepEqual(
        res,
        {
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':nth-last-of-type(-2n - 1)');
      assert.deepEqual(
        res,
        {
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should throw', () => {
      assert.throws(
        () => func(':nth-last-of-type(2n + - 1)'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector :nth-last-of-type(2n + - 1)',
            'message'
          );
          return true;
        }
      );
    });

    // NOTE: :nth-col() not yet supported
    it('should get selector list', () => {
      const res = func(':nth-col(even)');
      assert.deepEqual(
        res,
        {
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    // NOTE: :nth-last-col() not yet supported
    it('should get selector list', () => {
      const res = func(':nth-last-col(even)');
      assert.deepEqual(
        res,
        {
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
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });
  });

  describe('directionality pseudo-class', () => {
    it('should get selector list', () => {
      const res = func(':dir()');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [],
                  loc: null,
                  name: 'dir',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':dir( )');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [],
                  loc: null,
                  name: 'dir',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':dir(foo)');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      loc: null,
                      name: 'foo',
                      type: IDENT
                    }
                  ],
                  loc: null,
                  name: 'dir',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':dir(ltr)');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      loc: null,
                      name: 'ltr',
                      type: IDENT
                    }
                  ],
                  loc: null,
                  name: 'dir',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':dir(rtl)');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      loc: null,
                      name: 'rtl',
                      type: IDENT
                    }
                  ],
                  loc: null,
                  name: 'dir',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':dir(auto)');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      loc: null,
                      name: 'auto',
                      type: IDENT
                    }
                  ],
                  loc: null,
                  name: 'dir',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should throw', () => {
      assert.throws(
        () => func(':dir(ltr,rtl)'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector :dir(ltr,rtl)',
            'message'
          );
          return true;
        }
      );
    });
  });

  describe('linguistic pseudo-class', () => {
    it('should get selector list', () => {
      const res = func(':lang()');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [],
                  loc: null,
                  name: 'lang',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':lang( )');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [],
                  loc: null,
                  name: 'lang',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':lang(de)');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      loc: null,
                      name: 'de',
                      type: IDENT
                    }
                  ],
                  loc: null,
                  name: 'lang',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':lang(de-DE)');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      loc: null,
                      name: 'de-DE',
                      type: IDENT
                    }
                  ],
                  loc: null,
                  name: 'lang',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':lang(de, fr)');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      loc: null,
                      name: 'de',
                      type: IDENT
                    },
                    {
                      loc: null,
                      type: OPERATOR,
                      value: ','
                    },
                    {
                      loc: null,
                      name: 'fr',
                      type: IDENT
                    }
                  ],
                  loc: null,
                  name: 'lang',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':lang(\\*-Latn)');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      loc: null,
                      name: '\\*-Latn',
                      type: IDENT
                    }
                  ],
                  loc: null,
                  name: 'lang',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':lang("*")');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      loc: null,
                      type: STRING,
                      value: '*'
                    }
                  ],
                  loc: null,
                  name: 'lang',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':lang("en-US")');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      loc: null,
                      type: STRING,
                      value: 'en-US'
                    }
                  ],
                  loc: null,
                  name: 'lang',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':lang("de", "fr")');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      loc: null,
                      type: STRING,
                      value: 'de'
                    },
                    {
                      loc: null,
                      type: OPERATOR,
                      value: ','
                    },
                    {
                      loc: null,
                      type: STRING,
                      value: 'fr'
                    }
                  ],
                  loc: null,
                  name: 'lang',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':lang("*-Latn")');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      loc: null,
                      type: STRING,
                      value: '*-Latn'
                    }
                  ],
                  loc: null,
                  name: 'lang',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':lang("")');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      loc: null,
                      type: STRING,
                      value: ''
                    }
                  ],
                  loc: null,
                  name: 'lang',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should throw', () => {
      assert.throws(
        () => func(':lang(0)'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(e.message, 'Invalid selector :lang(0)', 'message');
          return true;
        }
      );
    });

    it('should get selector list', () => {
      const res = func(':lang("0")');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      loc: null,
                      type: STRING,
                      value: '0'
                    }
                  ],
                  loc: null,
                  name: 'lang',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':lang(日本語)');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      loc: null,
                      name: '日本語',
                      type: IDENT
                    }
                  ],
                  loc: null,
                  name: 'lang',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':lang("日本語")');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      loc: null,
                      type: STRING,
                      value: '日本語'
                    }
                  ],
                  loc: null,
                  name: 'lang',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });
  });

  describe('custom state pseudo-class', () => {
    it('should get selector list', () => {
      const res = func(':state(foo)');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      loc: null,
                      type: 'Raw',
                      value: 'foo'
                    }
                  ],
                  loc: null,
                  name: 'state',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':host(:state(foo))');
      assert.deepEqual(
        res,
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
                              type: 'Raw',
                              value: 'foo'
                            }
                          ],
                          loc: null,
                          name: 'state',
                          type: PS_CLASS_SELECTOR
                        }
                      ],
                      loc: null,
                      type: SELECTOR
                    }
                  ],
                  loc: null,
                  name: 'host',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });
  });

  describe('shadow host', () => {
    it('should get selector list', () => {
      const res = func(':host');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'host',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':host()');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [],
                  loc: null,
                  name: 'host',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':host( )');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [],
                  loc: null,
                  name: 'host',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':host-context()');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [],
                  loc: null,
                  name: 'host-context',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':host-context( )');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: [],
                  loc: null,
                  name: 'host-context',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should throw', () => {
      assert.throws(
        () => func(':host(.foo, .bar)'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector :host(.foo, .bar)',
            'message'
          );
          return true;
        }
      );
    });

    it('should get selector list', () => {
      const res = func(':host(.foo)');
      assert.deepEqual(
        res,
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
                          type: CLASS_SELECTOR
                        }
                      ],
                      loc: null,
                      type: SELECTOR
                    }
                  ],
                  loc: null,
                  name: 'host',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func(':host-context(.foo)');
      assert.deepEqual(
        res,
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
                          type: CLASS_SELECTOR
                        }
                      ],
                      loc: null,
                      type: SELECTOR
                    }
                  ],
                  loc: null,
                  name: 'host-context',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });
  });

  describe('pseudo-element', () => {
    it('should throw', () => {
      assert.throws(
        () => func(':::before'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector :::before',
            'message'
          );
          return true;
        }
      );
    });

    it('should get selector list', () => {
      const res = func('::before');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'before',
                  type: PS_ELEMENT_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    // NOTE: parsed as pseudo-class
    it('should get selector list', () => {
      const res = func(':before');
      assert.deepEqual(
        res,
        {
          children: [
            {
              children: [
                {
                  children: null,
                  loc: null,
                  name: 'before',
                  type: PS_CLASS_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('::slotted(foo)');
      assert.deepEqual(
        res,
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
                  name: 'slotted',
                  type: PS_ELEMENT_SELECTOR
                }
              ],
              loc: null,
              type: SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR_LIST
        },
        'result'
      );
    });
  });

  describe('combinators', () => {
    it('should get selector list', () => {
      const res = func('foo bar');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('foo bar.baz qux');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('foo > bar');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('foo >');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('foo + bar');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('foo +');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('+ bar');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('foo ~ bar');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('foo ~');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });

    it('should get selector list', () => {
      const res = func('~ bar');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });

    // unsupported combinators
    it('should throw', () => {
      assert.throws(
        () => func('col.selected || td'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector col.selected || td',
            'message'
          );
          return true;
        }
      );
    });

    // unknown combinators
    it('should throw', () => {
      assert.throws(
        () => func('foo % bar'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector foo % bar',
            'message'
          );
          return true;
        }
      );
    });

    it('should throw', () => {
      assert.throws(
        () => func('foo - bar'),
        e => {
          assert.strictEqual(e instanceof DOMException, true, 'instance');
          assert.strictEqual(e.name, SYNTAX_ERR, 'name');
          assert.strictEqual(
            e.message,
            'Invalid selector foo - bar',
            'message'
          );
          return true;
        }
      );
    });

    // NOTE : thrown afterwards
    it('should get selector list', () => {
      const res = func('foo ++ bar');
      assert.deepEqual(
        res,
        {
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
        },
        'result'
      );
    });
  });
});

describe('walk AST', () => {
  const func = parser.walkAST;

  it('should get empty array for branches', () => {
    const res = func();
    assert.deepEqual(
      res,
      {
        branches: [],
        info: {
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: false,
          hasNthChildOfSelector: false,
          hasNestedSelector: false,
          hasStatePseudoClass: false
        }
      },
      'result'
    );
  });

  it('should throw', () => {
    const ast = {
      children: [
        {
          children: [
            {
              loc: null,
              name: '123',
              type: ID_SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR
        }
      ],
      loc: null,
      type: SELECTOR_LIST
    };
    assert.throws(
      () => func(ast),
      e => {
        assert.strictEqual(e instanceof DOMException, true, 'instance');
        assert.strictEqual(e.name, SYNTAX_ERR, 'name');
        assert.strictEqual(e.message, 'Invalid selector #123', 'message');
        return true;
      }
    );
  });

  it('should throw', () => {
    const ast = {
      children: [
        {
          children: [
            {
              loc: null,
              name: '-123',
              type: ID_SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR
        }
      ],
      loc: null,
      type: SELECTOR_LIST
    };
    assert.throws(
      () => func(ast),
      e => {
        assert.strictEqual(e instanceof DOMException, true, 'instance');
        assert.strictEqual(e.name, SYNTAX_ERR, 'name');
        assert.strictEqual(e.message, 'Invalid selector #-123', 'message');
        return true;
      }
    );
  });

  it('should throw', () => {
    const ast = {
      children: [
        {
          children: [
            {
              loc: null,
              name: '123',
              type: CLASS_SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR
        }
      ],
      loc: null,
      type: SELECTOR_LIST
    };
    assert.throws(
      () => func(ast),
      e => {
        assert.strictEqual(e instanceof DOMException, true, 'instance');
        assert.strictEqual(e.name, SYNTAX_ERR, 'name');
        assert.strictEqual(e.message, 'Invalid selector .123', 'message');
        return true;
      }
    );
  });

  it('should throw', () => {
    const ast = {
      children: [
        {
          children: [
            {
              loc: null,
              name: '-123',
              type: CLASS_SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR
        }
      ],
      loc: null,
      type: SELECTOR_LIST
    };
    assert.throws(
      () => func(ast),
      e => {
        assert.strictEqual(e instanceof DOMException, true, 'instance');
        assert.strictEqual(e.name, SYNTAX_ERR, 'name');
        assert.strictEqual(e.message, 'Invalid selector .-123', 'message');
        return true;
      }
    );
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
    assert.deepEqual(
      res,
      {
        branches: [
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
        ],
        info: {
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: false,
          hasNestedSelector: false,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false
        }
      },
      'result'
    );
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
    assert.deepEqual(
      res,
      {
        branches: [
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
        ],
        info: {
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: false,
          hasNestedSelector: false,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false
        }
      },
      'result'
    );
  });

  it('should get selectors and info', () => {
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
              name: 'only-child',
              type: PS_CLASS_SELECTOR
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
    assert.deepEqual(
      res,
      {
        branches: [
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
              name: 'only-child',
              type: PS_CLASS_SELECTOR
            }
          ]
        ],
        info: {
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: false,
          hasNestedSelector: false,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false
        }
      },
      'result'
    );
  });

  it('should get selectors and info', () => {
    const ast = {
      children: [
        {
          children: [
            {
              loc: null,
              name: 'defined',
              type: PS_CLASS_SELECTOR
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
    assert.deepEqual(
      res,
      {
        branches: [
          [
            {
              loc: null,
              name: 'defined',
              type: PS_CLASS_SELECTOR
            }
          ]
        ],
        info: {
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: false,
          hasNestedSelector: false,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false
        }
      },
      'result'
    );
  });

  it('should get selectors and info', () => {
    const ast = {
      children: [
        {
          children: [
            {
              loc: null,
              name: 'checked',
              type: PS_CLASS_SELECTOR
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
    assert.deepEqual(
      res,
      {
        branches: [
          [
            {
              loc: null,
              name: 'checked',
              type: PS_CLASS_SELECTOR
            }
          ]
        ],
        info: {
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: false,
          hasNestedSelector: false,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: true
        }
      },
      'result'
    );
  });

  it('should get selectors and info', () => {
    const ast = {
      children: [
        {
          children: [
            {
              children: [
                {
                  loc: null,
                  name: 'auto',
                  type: IDENT
                }
              ],
              loc: null,
              name: 'dir',
              type: PS_CLASS_SELECTOR
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
    assert.deepEqual(
      res,
      {
        branches: [
          [
            {
              children: [
                {
                  loc: null,
                  name: 'auto',
                  type: IDENT
                }
              ],
              loc: null,
              name: 'dir',
              type: PS_CLASS_SELECTOR
            }
          ]
        ],
        info: {
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: false,
          hasNestedSelector: false,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false
        }
      },
      'result'
    );
  });

  it('should get selectors and info', () => {
    const ast = {
      children: [
        {
          children: [
            {
              loc: null,
              name: 'div',
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
                }
              ],
              loc: null,
              name: 'not',
              type: PS_CLASS_SELECTOR
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
    assert.deepEqual(
      res,
      {
        branches: [
          [
            {
              loc: null,
              name: 'div',
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
                }
              ],
              loc: null,
              name: 'not',
              type: PS_CLASS_SELECTOR
            }
          ]
        ],
        info: {
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: true,
          hasNestedSelector: true,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false
        }
      },
      'result'
    );
  });

  it('should get selectors and info', () => {
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
              type: PS_CLASS_SELECTOR
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
    assert.deepEqual(
      res,
      {
        branches: [
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
              type: PS_CLASS_SELECTOR
            }
          ]
        ],
        info: {
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: true,
          hasNestedSelector: true,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false
        }
      },
      'result'
    );
  });

  it('should get selectors and info', () => {
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
              type: PS_CLASS_SELECTOR
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
    assert.deepEqual(
      res,
      {
        branches: [
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
              type: PS_CLASS_SELECTOR
            }
          ]
        ],
        info: {
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: true,
          hasNestedSelector: true,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false
        }
      },
      'result'
    );
  });

  it('should get selectors and info', () => {
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
                      type: CLASS_SELECTOR
                    }
                  ],
                  loc: null,
                  type: SELECTOR
                }
              ],
              loc: null,
              name: 'host',
              type: PS_CLASS_SELECTOR
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
    assert.deepEqual(
      res,
      {
        branches: [
          [
            {
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
              name: 'host',
              type: PS_CLASS_SELECTOR
            }
          ]
        ],
        info: {
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: false,
          hasNestedSelector: true,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false
        }
      },
      'result'
    );
  });

  it('should get selectors and info', () => {
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
                      type: CLASS_SELECTOR
                    }
                  ],
                  loc: null,
                  type: SELECTOR
                }
              ],
              loc: null,
              name: 'host-context',
              type: PS_CLASS_SELECTOR
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
    assert.deepEqual(
      res,
      {
        branches: [
          [
            {
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
              name: 'host-context',
              type: PS_CLASS_SELECTOR
            }
          ]
        ],
        info: {
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: false,
          hasNestedSelector: true,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false
        }
      },
      'result'
    );
  });

  it('should get selectors and info', () => {
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
                      type: TYPE_SELECTOR
                    }
                  ],
                  loc: null,
                  type: SELECTOR
                }
              ],
              loc: null,
              name: 'slotted',
              type: PS_ELEMENT_SELECTOR
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
    assert.deepEqual(
      res,
      {
        branches: [
          [
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
              name: 'slotted',
              type: PS_ELEMENT_SELECTOR
            }
          ]
        ],
        info: {
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: false,
          hasNestedSelector: true,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false
        }
      },
      'result'
    );
  });

  it('should get selectors and info', () => {
    const ast = {
      children: [
        {
          children: [
            {
              loc: null,
              name: 'div',
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
                }
              ],
              loc: null,
              name: 'not',
              type: PS_CLASS_SELECTOR
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
    assert.deepEqual(
      res,
      {
        branches: [
          [
            {
              loc: null,
              name: 'div',
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
                }
              ],
              loc: null,
              name: 'not',
              type: PS_CLASS_SELECTOR
            }
          ]
        ],
        info: {
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: true,
          hasNestedSelector: true,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false
        }
      },
      'result'
    );
  });

  it('should get selectors and info', () => {
    const ast = {
      children: [
        {
          children: [
            {
              loc: null,
              name: 'div',
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
    };
    const res = func(ast);
    assert.deepEqual(
      res,
      {
        branches: [
          [
            {
              loc: null,
              name: 'div',
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
                }
              ],
              loc: null,
              name: 'has',
              type: PS_CLASS_SELECTOR
            }
          ]
        ],
        info: {
          hasHasPseudoFunc: true,
          hasLogicalPseudoFunc: true,
          hasNestedSelector: true,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false
        }
      },
      'result'
    );
  });

  it('should get selectors and info', () => {
    const ast = {
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
                type: IDENT
              },
              type: ATTR_SELECTOR,
              value: {
                loc: null,
                name: 'bar',
                type: IDENT
              }
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
    assert.deepEqual(
      res,
      {
        branches: [
          [
            {
              flags: null,
              loc: null,
              matcher: '|=',
              name: {
                loc: null,
                name: 'foo',
                type: IDENT
              },
              type: ATTR_SELECTOR,
              value: {
                loc: null,
                name: 'bar',
                type: IDENT
              }
            }
          ]
        ],
        info: {
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: false,
          hasNestedSelector: false,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false
        }
      },
      'result'
    );
  });

  it('should get selectors and info', () => {
    const ast = {
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
                    type: IDENT
                  },
                  selector: {
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
                                        flags: null,
                                        loc: null,
                                        matcher: null,
                                        name: {
                                          loc: null,
                                          name: 'hidden',
                                          type: IDENT
                                        },
                                        type: ATTR_SELECTOR,
                                        value: null
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
                            type: PS_CLASS_SELECTOR
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
              type: PS_CLASS_SELECTOR
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
    assert.deepEqual(
      res,
      {
        branches: [
          [
            {
              children: [
                {
                  loc: null,
                  nth: {
                    loc: null,
                    name: 'odd',
                    type: IDENT
                  },
                  selector: {
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
                                        flags: null,
                                        loc: null,
                                        matcher: null,
                                        name: {
                                          loc: null,
                                          name: 'hidden',
                                          type: IDENT
                                        },
                                        type: ATTR_SELECTOR,
                                        value: null
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
                            type: PS_CLASS_SELECTOR
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
              type: PS_CLASS_SELECTOR
            }
          ]
        ],
        info: {
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: true,
          hasNestedSelector: true,
          hasNthChildOfSelector: true,
          hasStatePseudoClass: false
        }
      },
      'result'
    );
  });

  it('should get selectors and info', () => {
    const ast = {
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
                    type: IDENT
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
              type: PS_CLASS_SELECTOR
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
    assert.deepEqual(
      res,
      {
        branches: [
          [
            {
              children: [
                {
                  loc: null,
                  nth: {
                    loc: null,
                    name: 'odd',
                    type: IDENT
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
              type: PS_CLASS_SELECTOR
            }
          ]
        ],
        info: {
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: false,
          hasNestedSelector: true,
          hasNthChildOfSelector: true,
          hasStatePseudoClass: false
        }
      },
      'result'
    );
  });

  it('should get selectors and info', () => {
    const ast = {
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
                    type: IDENT
                  },
                  selector: {
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
                                        type: CLASS_SELECTOR
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
                            type: PS_CLASS_SELECTOR
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
              type: PS_CLASS_SELECTOR
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
    assert.deepEqual(
      res,
      {
        branches: [
          [
            {
              children: [
                {
                  loc: null,
                  nth: {
                    loc: null,
                    name: 'odd',
                    type: IDENT
                  },
                  selector: {
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
                                        type: CLASS_SELECTOR
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
                            type: PS_CLASS_SELECTOR
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
              type: PS_CLASS_SELECTOR
            }
          ]
        ],
        info: {
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: true,
          hasNestedSelector: true,
          hasNthChildOfSelector: true,
          hasStatePseudoClass: false
        }
      },
      'result'
    );
  });
});

describe('compare AST nodes', () => {
  const func = parser.compareASTNodes;

  it('should get 0', () => {
    const res = func(
      { type: CLASS_SELECTOR, name: 'bar' },
      { type: CLASS_SELECTOR, name: 'foo' }
    );
    assert.strictEqual(res, 0, 'result');
  });

  it('should get 1', () => {
    const res = func(
      { type: ATTR_SELECTOR },
      { type: CLASS_SELECTOR, name: 'foo' }
    );
    assert.strictEqual(res, 1, 'result');
  });

  it('should get -1', () => {
    const res = func(
      { type: CLASS_SELECTOR, name: 'foo' },
      { type: ATTR_SELECTOR }
    );
    assert.strictEqual(res, -1, 'result');
  });
});

describe('sort AST', () => {
  const func = parser.sortAST;

  it('should get leaves', () => {
    const leaves = [{ type: ATTR_SELECTOR }];
    const res = func(leaves);
    assert.deepEqual(res, [{ type: ATTR_SELECTOR }], 'result');
  });

  it('should get sorted leaves', () => {
    const leaves = [
      { type: ATTR_SELECTOR },
      { type: CLASS_SELECTOR, name: 'foo' }
    ];
    const res = func(leaves);
    assert.deepEqual(
      res,
      [{ type: CLASS_SELECTOR, name: 'foo' }, { type: ATTR_SELECTOR }],
      'result'
    );
  });

  it('should get sorted leaves', () => {
    const leaves = [
      { type: ATTR_SELECTOR },
      { type: CLASS_SELECTOR, name: 'bar' },
      { type: ID_SELECTOR },
      { type: PS_CLASS_SELECTOR },
      { type: CLASS_SELECTOR, name: 'foo' },
      { type: PS_ELEMENT_SELECTOR },
      { type: TYPE_SELECTOR }
    ];
    const res = func(leaves);
    assert.deepEqual(
      res,
      [
        { type: PS_ELEMENT_SELECTOR },
        { type: ID_SELECTOR },
        { type: CLASS_SELECTOR, name: 'bar' },
        { type: CLASS_SELECTOR, name: 'foo' },
        { type: TYPE_SELECTOR },
        { type: ATTR_SELECTOR },
        { type: PS_CLASS_SELECTOR }
      ],
      'result'
    );
  });
});

describe('parse AST name', () => {
  const func = parser.parseAstName;

  it('should throw', () => {
    assert.throws(
      () => func(),
      e => {
        assert.strictEqual(e instanceof DOMException, true, 'instance');
        assert.strictEqual(e.name, SYNTAX_ERR, 'name');
        assert.strictEqual(e.message, 'Invalid selector undefined', 'message');
        return true;
      }
    );
  });

  it('should get value', () => {
    const res = func('*');
    assert.deepEqual(res, {
      prefix: '*',
      localName: '*'
    });
  });

  it('should get value', () => {
    const res = func('foo');
    assert.deepEqual(res, {
      prefix: '*',
      localName: 'foo'
    });
  });

  it('should get value', () => {
    const res = func('|Foo');
    assert.deepEqual(res, {
      prefix: '',
      localName: 'Foo'
    });
  });

  it('should get value', () => {
    const res = func('*|Foo');
    assert.deepEqual(res, {
      prefix: '*',
      localName: 'Foo'
    });
  });

  it('should get value', () => {
    const res = func('ns|Foo');
    assert.deepEqual(res, {
      prefix: 'ns',
      localName: 'Foo'
    });
  });

  it('should get value', () => {
    const res = func('foo|div');
    assert.deepEqual(
      res,
      {
        prefix: 'foo',
        localName: 'div'
      },
      'result'
    );
  });
});
