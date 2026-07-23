/**
 * parser.test.js
 */

/* api */
import { strict as assert } from 'node:assert';
import { describe, it } from 'mocha';
import * as cssTree from 'css-tree';

/* test */
import * as parser from '../src/js/parser.js';

/* constants */
import {
  ATTR_SELECTOR,
  CLASS_SELECTOR,
  COMBINATOR,
  IDENT,
  ID_SELECTOR,
  NEST_SELECTOR,
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

  it('should return empty string when selector is undefined', () => {
    const res = func();
    assert.strictEqual(res, '', 'result');
  });

  it('should return empty string when selector is empty', () => {
    const res = func('');
    assert.strictEqual(res, '', 'result');
  });

  it('should replace trailing backslash with replacement char', () => {
    const res = func('\\');
    assert.strictEqual(res, '\uFFFD', 'result');
  });

  it('should unescape character sequence \\global to global', () => {
    const res = func('\\global');
    assert.strictEqual(res, 'global', 'result');
  });

  it('should unescape escaped letter n to literal n', () => {
    const res = func('\\n');
    assert.strictEqual(res, 'n', 'result');
  });

  it('should preserve literal backslash followed by newline', () => {
    const res = func('\\\n');
    assert.strictEqual(res, '\\\n', 'result');
  });

  it('should replace null code point \\0 with replacement char', () => {
    const res = func('\\0');
    assert.strictEqual(res, '\uFFFD', 'result');
  });

  it('should replace zero code point \\000000 with replacement', () => {
    const res = func('\\000000');
    assert.strictEqual(res, '\uFFFD', 'result');
  });

  it('should convert hex code point \\30 to digit zero', () => {
    const res = func('\\30');
    assert.strictEqual(res, '0', 'result');
  });

  it('should convert multiple hex code points \\30 \\30', () => {
    const res = func('\\30 \\30 ');
    assert.strictEqual(res, '00', 'result');
  });

  it('should convert hex code point \\41 to uppercase A', () => {
    const res = func('\\41');
    assert.strictEqual(res, 'A', 'result');
  });

  it('should unescape hex character code within string hel\\6Co', () => {
    const res = func('hel\\6Co');
    assert.strictEqual(res, 'hello', 'result');
  });

  it('should strip trailing space after hex escape hel\\6C o', () => {
    const res = func('hel\\6C o');
    assert.strictEqual(res, 'hello', 'result');
  });

  it('should unescape hex code \\26 B to ampersand and B', () => {
    const res = func('\\26 B');
    assert.strictEqual(res, '&B', 'result');
  });

  it('should replace surrogate code points with replacement', () => {
    const res = func('\\D83D \\DE00 ');
    assert.strictEqual(res, '\u{FFFD}\u{FFFD}', 'result');
  });

  it('should unescape Unicode key emoji code point \\1f511', () => {
    const res = func('\\1f511 ');
    assert.strictEqual(res, '\u{1F511}', 'result');
  });

  it('should unescape CJK compatibility code point \\2F804', () => {
    const res = func('\\2F804 ');
    assert.strictEqual(res, '\u{2F804}', 'result');
  });

  it('should unescape maximum valid Unicode code point \\10FFFF', () => {
    const res = func('\\10FFFF ');
    assert.strictEqual(res, '\u{10FFFF}', 'result');
  });

  it('should unescape max code point and retain trailing digit', () => {
    const res = func('\\10FFFF0');
    assert.strictEqual(res, '\u{10FFFF}0', 'result');
  });

  it('should replace out of bounds code point \\110000', () => {
    const res = func('\\110000 ');
    assert.strictEqual(res, '\uFFFD', 'result');
  });

  it('should replace out of range hex code point \\ffffff', () => {
    const res = func('\\ffffff ');
    assert.strictEqual(res, '\uFFFD', 'result');
  });
});

describe('preprocess', () => {
  const func = parser.preprocess;

  it('should throw DOMException when argument is a number', () => {
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

  it('should convert undefined argument to string "undefined"', () => {
    const res = func(undefined);
    assert.strictEqual(res, 'undefined', 'result');
  });

  it('should convert null argument to string "null"', () => {
    const res = func(null);
    assert.strictEqual(res, 'null', 'result');
  });

  it('should replace form feed character with newline', () => {
    const res = func('foo\fbar');
    assert.strictEqual(res, 'foo\nbar', 'result');
  });

  it('should replace null character with replacement character', () => {
    const res = func('\u0000');
    assert.strictEqual(res, '\uFFFD', 'result');
  });

  it('should replace standalone nesting selector & with empty', () => {
    const res = func('&');
    assert.strictEqual(res, '', 'result');
  });

  it('should not replace nesting selector & with :scope selector', () => {
    const res = func('& .foo');
    assert.strictEqual(res, '& .foo', 'result');
  });
});

describe('create AST from CSS selector', () => {
  const func = sel => cssTree.toPlainObject(parser.parseSelector(sel));

  describe('invalid selectors', () => {
    it('should throw DOMException for empty string selector', () => {
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

    it('should throw DOMException for leading combinator >*', () => {
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

    it('should throw DOMException for trailing comma in selector', () => {
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

    it('should throw DOMException for unquoted space in attr', () => {
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

    it('should throw DOMException for incomplete namespace selector', () => {
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

    it('should throw DOMException for invalid combinator <', () => {
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

    it('should throw DOMException for invalid operator < in tag', () => {
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
    it('should parse undefined argument into TYPE_SELECTOR AST', () => {
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

    it('should parse explicit undefined value as type selector', () => {
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

    it('should parse null input value into TYPE_SELECTOR AST', () => {
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

    it('should parse selector with trailing backslash escape', () => {
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

    it('should parse unclosed attribute selector [align=center', () => {
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

    it('should parse unclosed pseudo-element ::slotted(foo', () => {
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

    it('should parse numeric ID selector #123 into ID_SELECTOR', () => {
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

    it('should parse negative numeric ID selector #-123 as ID', () => {
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

    it('should parse ID selector containing em space unicode', () => {
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

    it('should parse ID selector with escaped digit and em space', () => {
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

    it('should parse ID selector consisting of em space unicode', () => {
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

    it('should parse ID selector with non-breaking space character', () => {
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

    it('should parse non-BMP Unicode character in ID selector', () => {
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

    it('should parse non-BMP Unicode character with text in ID', () => {
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

    it('should parse negation pseudo-class selector div:not(.foo)', () => {
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
    it('should parse universal selector * into TYPE_SELECTOR', () => {
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

    it('should parse no-namespace universal selector |* into AST', () => {
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

    it('should parse wildcard namespace universal selector *|*', () => {
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

    it('should parse named namespace universal selector foo|*', () => {
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

    it('should parse descendant selector with universal target', () => {
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

    it('should parse universal selector with descendant tag selector', () => {
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

    it('should parse universal selector qualified with class name', () => {
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

    it('should parse universal selector qualified with ID selector', () => {
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

    it('should parse universal selector qualified with attribute', () => {
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

    it('should parse element attribute with escaped colon identifier', () => {
      const res = func('img[\\:src]');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'img',
                type: TYPE_SELECTOR
              },
              {
                flags: null,
                loc: null,
                matcher: null,
                name: {
                  loc: null,
                  name: '\\:src',
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
      });
    });

    it('should parse namespaced attribute with escaped colon', () => {
      const res = func('img[foo|\\:src]');
      assert.deepEqual(res, {
        children: [
          {
            children: [
              {
                loc: null,
                name: 'img',
                type: TYPE_SELECTOR
              },
              {
                flags: null,
                loc: null,
                matcher: null,
                name: {
                  loc: null,
                  name: 'foo|\\:src',
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
      });
    });
  });

  describe('type selector', () => {
    it('should parse simple type selector into TYPE_SELECTOR AST', () => {
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

    it('should parse comma-separated type selectors into AST list', () => {
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

    it('should parse element type selector with no-namespace prefix', () => {
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

    it('should parse element type selector with explicit namespace', () => {
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
    it('should throw DOMException for incomplete class selector .', () => {
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

    it('should throw DOMException for class starting with a digit', () => {
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

    it('should throw DOMException for class with hyphen and digit', () => {
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

    it('should parse standard class selector into CLASS_SELECTOR', () => {
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

    it('should parse valid class selector with leading hyphen', () => {
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

    it('should parse class selector containing escaped numbers', () => {
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

    it('should parse class selector with hyphen and escaped digit', () => {
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

    it('should parse compound selector with type and class name', () => {
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

    it('should throw DOMException for invalid namespaced class', () => {
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

    it('should parse namespaced type selector combined with class', () => {
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

    it('should parse type selector combined with multiple classes', () => {
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
    it('should throw DOMException for incomplete ID selector #', () => {
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

    it('should parse standard ID selector into ID_SELECTOR', () => {
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

    it('should parse valid ID selector with leading hyphen', () => {
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

    it('should parse ID selector containing escaped digits', () => {
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

    it('should parse ID selector with hyphen and escaped digit', () => {
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

    it('should parse compound selector with type and ID name', () => {
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

    it('should throw DOMException for invalid namespaced ID', () => {
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

    it('should parse namespaced type combined with ID selector', () => {
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

    it('should parse ID selector with hex escape and space', () => {
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

    it('should parse ID selector with escaped space character', () => {
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
    it('should throw DOMException for empty attribute selector []', () => {
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

    it('should throw DOMException for attribute selector [*]', () => {
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

    it('should parse basic attribute presence selector [foo]', () => {
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

    it('should parse type selector with attribute foo[bar]', () => {
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

    it('should parse attribute selector with no-namespace prefix', () => {
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

    it('should parse attribute selector with wildcard namespace', () => {
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

    it('should parse attribute selector with explicit namespace', () => {
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

    it('should parse exact attribute value selector [foo=bar]', () => {
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

    it('should parse quoted attribute value selector [foo="bar"]', () => {
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

    it('should parse attribute selector followed by CSS comment', () => {
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

    it('should parse quoted attribute value containing spaces', () => {
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

    it('should parse namespaced attribute selector with value', () => {
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

    it('should parse whitespace-separated attribute matcher ~=', () => {
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

    it('should parse hyphen-separated attribute matcher |=', () => {
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

    it('should parse prefix attribute value matching operator ^=', () => {
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

    it('should parse suffix attribute value matching operator $=', () => {
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

    it('should parse substring attribute value matching operator *=', () => {
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

    it('should parse attribute selector with case-insensitive flag i', () => {
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

    it('should parse attribute selector with uppercase flag I', () => {
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

    it('should parse quoted attribute selector with case flag i', () => {
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

    it('should parse attribute selector with unspaced flag i', () => {
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

    it('should parse attribute selector with comment before flag i', () => {
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

    it('should parse attribute selector with case-sensitive flag s', () => {
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

    it('should parse attribute selector with uppercase flag S', () => {
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
    it('should parse custom or unhandled attribute flag identifier', () => {
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
    it('should throw DOMException for empty pseudo-class colon :', () => {
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

    it('should parse simple pseudo-class selector :foo into AST', () => {
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

    it('should parse element type combined with pseudo-class :bar', () => {
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

    it('should parse multiple chained pseudo-classes in selector', () => {
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

    it('should parse functional pseudo-class with string argument', () => {
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

    it('should parse nested functional pseudo-class with selector', () => {
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

    it('should parse link state pseudo-class :any-link into AST', () => {
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

    it('should parse unvisited link pseudo-class :link into AST', () => {
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

    it('should parse visited link pseudo-class :visited into AST', () => {
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

    it('should parse document local link pseudo-class :local-link', () => {
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

    it('should parse target anchor pseudo-class :target into AST', () => {
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

    it('should parse container target pseudo-class :target-within', () => {
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

    it('should parse scoping root pseudo-class :scope into AST', () => {
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

    it('should parse chronological pseudo-class :current into AST', () => {
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
    it('should parse functional chronological pseudo-class :current', () => {
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

    it('should parse chronological pseudo-class :past into AST', () => {
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

    it('should parse chronological pseudo-class :future into AST', () => {
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

    it('should parse user action pseudo-class :active into AST', () => {
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

    it('should parse user interaction pseudo-class :hover into AST', () => {
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

    it('should parse element focus state pseudo-class :focus AST', () => {
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

    it('should parse descendant focus pseudo-class :focus-within', () => {
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

    it('should parse visible focus ring pseudo-class :focus-visible', () => {
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

    it('should parse element state pseudo-class :enabled into AST', () => {
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

    it('should parse element state pseudo-class :disabled into AST', () => {
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

    it('should parse input state pseudo-class :read-write into AST', () => {
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

    it('should parse input state pseudo-class :read-only into AST', () => {
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

    it('should parse element pseudo-class :placeholder-shown AST', () => {
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

    it('should parse form default button pseudo-class :default AST', () => {
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

    it('should parse option state pseudo-class :checked into AST', () => {
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

    it('should parse state pseudo-class :indeterminate into AST', () => {
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

    it('should parse validation state pseudo-class :valid into AST', () => {
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

    it('should parse validation state pseudo-class :invalid AST', () => {
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

    it('should parse range validity pseudo-class :in-range into AST', () => {
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

    it('should parse range validity pseudo-class :out-of-range AST', () => {
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

    it('should parse form constraint pseudo-class :required AST', () => {
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

    it('should parse form constraint pseudo-class :optional AST', () => {
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

    it('should parse empty input pseudo-class :blank into AST', () => {
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

    it('should parse user input pseudo-class :user-invalid AST', () => {
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

    it('should parse document root pseudo-class :root into AST', () => {
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

    it('should parse element child pseudo-class :empty into AST', () => {
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

    it('should parse structural pseudo-class :first-child AST', () => {
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

    it('should parse structural pseudo-class :last-child into AST', () => {
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

    it('should parse structural pseudo-class :only-child into AST', () => {
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

    it('should parse type-based pseudo-class :first-of-type AST', () => {
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

    it('should parse type-based pseudo-class :last-of-type AST', () => {
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

    it('should parse type-based pseudo-class :only-of-type AST', () => {
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
    it('should parse empty negation pseudo-class :not() into AST', () => {
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

    it('should parse negation pseudo-class with whitespace :not( )', () => {
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

    it('should parse negation pseudo-class with type argument', () => {
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

    it('should parse negation pseudo-class with nested :is() selector', () => {
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

    it('should parse nested negation selector :not(:not(foo), bar)', () => {
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

    it('should parse negation pseudo-class with wildcard namespace', () => {
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
    it('should parse empty matches-any pseudo-class :is() into AST', () => {
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

    it('should parse matches-any selector with whitespace :is( )', () => {
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

    it('should parse nested empty matches-any selector :is(:is())', () => {
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

    it('should parse matches-any pseudo-class with type selector', () => {
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

    it('should parse matches-any pseudo-class containing :not()', () => {
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

    it('should parse matches-any selector with wildcard namespace', () => {
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
    it('should parse empty specificity-adjustment :where() AST', () => {
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

    it('should parse specificity-adjustment :where( ) with space', () => {
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

    it('should parse nested specificity-adjustment selector :where()', () => {
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

    it('should parse :where() selector containing type argument', () => {
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

    it('should parse :where() containing negation and type list', () => {
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

    it('should parse :where() containing wildcard namespace type', () => {
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
    it('should parse empty relational pseudo-class :has() into AST', () => {
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

    it('should parse relational selector with whitespace :has( )', () => {
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

    it('should parse type selector with child combinator in :has()', () => {
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

    it('should parse :has() with chained child combinators in selector', () => {
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

    it('should parse type selector with relative argument in :has()', () => {
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

    it('should parse :has() containing comma-separated type list', () => {
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

    it('should parse :has() with multiple relative child selectors', () => {
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

    it('should parse :has() containing nested :is() selector list', () => {
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

    it('should parse :has() with relative combinator and nested :is()', () => {
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

    it('should parse deeply nested :has() and :is() pseudo-classes', () => {
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

    it('should parse :has() selector with wildcard namespace type', () => {
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

    it('should parse simple type selector with relative :has(bar)', () => {
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

    it('should parse type selector with direct relative :has(> bar)', () => {
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

    it('should parse relational selector with :scope and combinator', () => {
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
    it('should throw DOMException for invalid argument in :nth-child', () => {
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

    it('should parse empty :nth-child() pseudo-class into AST', () => {
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

    it('should parse :nth-child( ) containing whitespace into AST', () => {
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

    it('should parse :nth-child(even) with keyword argument', () => {
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

    it('should parse :nth-child(odd) with keyword argument', () => {
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

    it('should parse :nth-child(2n + 1) with positive An+B notation', () => {
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

    it('should parse :nth-child(-2n - 1) with negative An+B terms', () => {
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

    it('should throw DOMException for malformed An+B sign spacing', () => {
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

    it('should parse :nth-child(2n + 1 of foo) with of selector', () => {
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

    it('should parse :nth-child(odd of :not([hidden])) with attribute', () => {
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

    it('should parse :nth-child(odd of :not(.foo)) with class selector', () => {
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

    it('should throw DOMException for invalid :nth-last-child arg', () => {
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

    it('should parse empty :nth-last-child() pseudo-class into AST', () => {
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

    it('should parse :nth-last-child( ) with whitespace into AST', () => {
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

    it('should parse :nth-last-child(even) with keyword argument', () => {
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

    it('should parse :nth-last-child(odd) with keyword argument', () => {
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

    it('should parse :nth-last-child(2n + 1) positive An+B terms', () => {
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

    it('should parse :nth-last-child(-2n - 1) negative An+B terms', () => {
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

    it('should throw DOMException for invalid :nth-last-child An+B', () => {
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

    it('should parse :nth-last-child(2n + 1 of foo) with of clause', () => {
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

    it('should throw DOMException for invalid argument :nth-of-type', () => {
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

    it('should parse empty :nth-of-type() pseudo-class into AST', () => {
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

    it('should parse :nth-of-type( ) with whitespace into AST', () => {
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

    it('should parse :nth-of-type(even) with keyword argument', () => {
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

    it('should parse :nth-of-type(odd) with keyword argument', () => {
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

    it('should parse :nth-of-type(2n + 1) with positive An+B terms', () => {
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

    it('should parse :nth-of-type(-2n - 1) with negative An+B terms', () => {
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

    it('should throw DOMException for malformed :nth-of-type An+B', () => {
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

    it('should throw DOMException for invalid :nth-last-of-type arg', () => {
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

    it('should parse empty :nth-last-of-type() pseudo-class into AST', () => {
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

    it('should parse :nth-last-of-type( ) with whitespace into AST', () => {
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

    it('should parse :nth-last-of-type(even) with keyword argument', () => {
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

    it('should parse :nth-last-of-type(odd) with keyword argument', () => {
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

    it('should parse :nth-last-of-type(2n + 1) positive An+B terms', () => {
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

    it('should parse :nth-last-of-type(-2n - 1) negative An+B terms', () => {
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

    it('should throw DOMException for invalid :nth-last-of-type An+B', () => {
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
    it('should parse unsupported :nth-col(even) as raw argument AST', () => {
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
    it('should parse unsupported :nth-last-col(even) as raw arg AST', () => {
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
    it('should parse empty directionality selector :dir() into AST', () => {
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

    it('should parse :dir( ) containing whitespace into AST', () => {
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

    it('should parse :dir(foo) with generic identifier argument', () => {
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

    it('should parse :dir(ltr) with left-to-right identifier', () => {
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

    it('should parse :dir(rtl) with right-to-left identifier', () => {
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

    it('should parse :dir(auto) with automatic identifier argument', () => {
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

    it('should throw DOMException for multiple :dir() arguments', () => {
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
    it('should parse empty linguistic selector :lang() into AST', () => {
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

    it('should parse :lang( ) containing whitespace into AST', () => {
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

    it('should parse :lang(de) with language tag identifier', () => {
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

    it('should parse :lang(de-DE) with language region subtag', () => {
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

    it('should parse :lang(de, fr) with comma-separated tags', () => {
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

    it('should parse :lang() with escaped wildcard and script', () => {
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

    it('should parse :lang("*") containing quoted string wildcard', () => {
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

    it('should parse :lang("en-US") with quoted string tag', () => {
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

    it('should parse :lang() with comma-separated string tags', () => {
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

    it('should parse :lang("*-Latn") with quoted wildcard script', () => {
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

    it('should parse :lang("") containing empty string argument', () => {
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

    it('should throw DOMException for unquoted numeric :lang(0)', () => {
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

    it('should parse :lang("0") with quoted numeric string tag', () => {
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

    it('should parse :lang(日本語) with non-ASCII identifier', () => {
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

    it('should parse :lang("日本語") with quoted non-ASCII tag', () => {
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
    it('should parse custom state pseudo-class :state(foo) AST', () => {
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

    it('should parse :host() with nested :state(foo) selector', () => {
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
    it('should parse parameterless shadow host selector :host', () => {
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

    it('should parse empty functional host selector :host() AST', () => {
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

    it('should parse :host( ) containing whitespace into AST', () => {
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

    it('should parse empty :host-context() pseudo-class AST', () => {
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

    it('should parse :host-context( ) with whitespace into AST', () => {
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

    it('should throw DOMException for list in :host(.foo, .bar)', () => {
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

    it('should parse :host(.foo) with class selector argument', () => {
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

    it('should parse :host-context(.foo) with class argument', () => {
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
    it('should throw DOMException for invalid pseudo-element :::before', () => {
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

    it('should parse ::before pseudo-element into PS_ELEMENT_SELECTOR', () => {
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
    it('should parse single-colon :before as PS_CLASS_SELECTOR AST', () => {
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

    it('should parse functional pseudo-element ::slotted(foo) AST', () => {
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
    it('should parse space descendant combinator into COMBINATOR AST', () => {
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

    it('should parse multiple space combinators with compound selector', () => {
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

    it('should parse child combinator > between two type selectors', () => {
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

    it('should parse trailing child combinator > without right operand', () => {
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

    it('should parse next-sibling combinator + into COMBINATOR AST', () => {
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

    it('should parse trailing next-sibling combinator + in selector', () => {
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

    it('should parse leading next-sibling combinator + in selector', () => {
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

    it('should parse subsequent-sibling combinator ~ into COMBINATOR', () => {
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

    it('should parse trailing subsequent-sibling combinator ~ in AST', () => {
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

    it('should parse leading subsequent-sibling combinator ~ in AST', () => {
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
    it('should throw DOMException for unsupported column combinator ||', () => {
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
    it('should throw DOMException for unknown percentage combinator %', () => {
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

    it('should throw DOMException for invalid hyphen combinator -', () => {
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
    it('should parse consecutive duplicate next-sibling combinators ++', () => {
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

  it('should return empty branches and default info for undefined AST', () => {
    const res = func();
    assert.deepEqual(
      res,
      {
        branches: [],
        info: {
          hasForgivenPseudoFunc: false,
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: false,
          hasNestedSelector: false,
          hasNestingSelector: false,
          hasNotPseudoFunc: false,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false,
          hasUnsupportedPseudoClass: false
        }
      },
      'result'
    );
  });

  it('should throw DOMException for ID selector starting with a number', () => {
    const ast = cssTree.fromPlainObject({
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
    });
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

  it('should throw DOMException for ID starting with hyphen-digit', () => {
    const ast = cssTree.fromPlainObject({
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
    });
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

  it('should throw DOMException for class starting with a digit', () => {
    const ast = cssTree.fromPlainObject({
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
    });
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

  it('should throw DOMException for class starting with hyphen-digit', () => {
    const ast = cssTree.fromPlainObject({
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
    });
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

  it('should parse selector list AST into branches and metadata', () => {
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
          hasForgivenPseudoFunc: false,
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: false,
          hasNestedSelector: false,
          hasNestingSelector: false,
          hasNotPseudoFunc: false,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false,
          hasUnsupportedPseudoClass: false
        }
      },
      'result'
    );
  });

  it('should parse cssTree selector AST with detailed info flag', () => {
    const ast = cssTree.fromPlainObject({
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
    });
    const res = func(ast, true);
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
          hasForgivenPseudoFunc: false,
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: false,
          hasNestedSelector: false,
          hasNestingSelector: false,
          hasNotPseudoFunc: false,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false,
          hasUnsupportedPseudoClass: false
        }
      },
      'result'
    );
  });

  it('should parse multiple selector branches from cssTree AST', () => {
    const ast = cssTree.fromPlainObject({
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
    });
    const res = func(ast, true);
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
          hasForgivenPseudoFunc: false,
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: false,
          hasNestedSelector: false,
          hasNestingSelector: false,
          hasNotPseudoFunc: false,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false,
          hasUnsupportedPseudoClass: false
        }
      },
      'result'
    );
  });

  it('should parse pseudo-class selector branch without spec flags', () => {
    const ast = cssTree.fromPlainObject({
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
    });
    const res = func(ast, true);
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
          hasForgivenPseudoFunc: false,
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: false,
          hasNestedSelector: false,
          hasNestingSelector: false,
          hasNotPseudoFunc: false,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: true,
          hasUnsupportedPseudoClass: false
        }
      },
      'result'
    );
  });

  it('should parse standard pseudo-class selector branch correctly', () => {
    const ast = cssTree.fromPlainObject({
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
    });
    const res = func(ast, true);
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
          hasForgivenPseudoFunc: false,
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: false,
          hasNestedSelector: false,
          hasNestingSelector: false,
          hasNotPseudoFunc: false,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false,
          hasUnsupportedPseudoClass: false
        }
      },
      'result'
    );
  });

  it('should detect state pseudo-class and set hasStatePseudoClass', () => {
    const ast = cssTree.fromPlainObject({
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
    });
    const res = func(ast, true);
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
          hasForgivenPseudoFunc: false,
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: false,
          hasNestedSelector: false,
          hasNestingSelector: false,
          hasNotPseudoFunc: false,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: true,
          hasUnsupportedPseudoClass: false
        }
      },
      'result'
    );
  });

  it('should parse directionality pseudo-class selector branch', () => {
    const ast = cssTree.fromPlainObject({
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
    });
    const res = func(ast, true);
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
          hasForgivenPseudoFunc: false,
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: false,
          hasNestedSelector: false,
          hasNestingSelector: false,
          hasNotPseudoFunc: false,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false,
          hasUnsupportedPseudoClass: false
        }
      },
      'result'
    );
  });

  it('should set logical, nested, and not flags for :not() pseudo', () => {
    const ast = cssTree.fromPlainObject({
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
    });
    const res = func(ast, true);
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
          hasForgivenPseudoFunc: false,
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: true,
          hasNestedSelector: true,
          hasNestingSelector: false,
          hasNotPseudoFunc: true,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false,
          hasUnsupportedPseudoClass: false
        }
      },
      'result'
    );
  });

  it('should set metadata flags for negation pseudo with wildcard', () => {
    const ast = cssTree.fromPlainObject({
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
    });
    const res = func(ast, true);
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
          hasForgivenPseudoFunc: false,
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: true,
          hasNestedSelector: true,
          hasNestingSelector: false,
          hasNotPseudoFunc: true,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false,
          hasUnsupportedPseudoClass: false
        }
      },
      'result'
    );
  });

  it('should parse negation pseudo-class with namespace wildcard', () => {
    const ast = cssTree.fromPlainObject({
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
    });
    const res = func(ast, true);
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
          hasForgivenPseudoFunc: false,
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: true,
          hasNestedSelector: true,
          hasNestingSelector: false,
          hasNotPseudoFunc: true,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false,
          hasUnsupportedPseudoClass: false
        }
      },
      'result'
    );
  });

  it('should set hasNestedSelector flag for functional :host() pseudo', () => {
    const ast = cssTree.fromPlainObject({
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
    });
    const res = func(ast, true);
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
          hasForgivenPseudoFunc: false,
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: false,
          hasNestedSelector: true,
          hasNestingSelector: false,
          hasNotPseudoFunc: false,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false,
          hasUnsupportedPseudoClass: false
        }
      },
      'result'
    );
  });

  it('should set hasNestedSelector flag for :host-context() pseudo', () => {
    const ast = cssTree.fromPlainObject({
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
    });
    const res = func(ast, true);
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
          hasForgivenPseudoFunc: false,
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: false,
          hasNestedSelector: true,
          hasNestingSelector: false,
          hasNotPseudoFunc: false,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false,
          hasUnsupportedPseudoClass: false
        }
      },
      'result'
    );
  });

  it('should set hasNestedSelector flag for ::slotted() pseudo', () => {
    const ast = cssTree.fromPlainObject({
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
    });
    const res = func(ast, true);
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
          hasForgivenPseudoFunc: false,
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: false,
          hasNestedSelector: true,
          hasNestingSelector: false,
          hasNotPseudoFunc: false,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false,
          hasUnsupportedPseudoClass: false
        }
      },
      'result'
    );
  });

  it('should set metadata flags for :not() containing combinator', () => {
    const ast = cssTree.fromPlainObject({
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
    });
    const res = func(ast, true);
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
          hasForgivenPseudoFunc: false,
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: true,
          hasNestedSelector: true,
          hasNestingSelector: false,
          hasNotPseudoFunc: true,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false,
          hasUnsupportedPseudoClass: false
        }
      },
      'result'
    );
  });

  it('should set hasHasPseudoFunc flag for :has() pseudo-class', () => {
    const ast = cssTree.fromPlainObject({
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
    });
    const res = func(ast, true);
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
          hasForgivenPseudoFunc: false,
          hasHasPseudoFunc: true,
          hasLogicalPseudoFunc: true,
          hasNestedSelector: true,
          hasNestingSelector: false,
          hasNotPseudoFunc: false,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false,
          hasUnsupportedPseudoClass: false
        }
      },
      'result'
    );
  });

  it('should set nth-child-of and negation flags for :nth-child(of)', () => {
    const ast = cssTree.fromPlainObject({
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
    });
    const res = func(ast, true);
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
          hasForgivenPseudoFunc: false,
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: true,
          hasNestedSelector: true,
          hasNestingSelector: false,
          hasNotPseudoFunc: true,
          hasNthChildOfSelector: true,
          hasStatePseudoClass: false,
          hasUnsupportedPseudoClass: false
        }
      },
      'result'
    );
  });

  it('should set nth-child-of flag for :nth-child() with of clause', () => {
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
    const res = func(ast, true);
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
          hasForgivenPseudoFunc: false,
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: false,
          hasNestedSelector: true,
          hasNestingSelector: false,
          hasNotPseudoFunc: false,
          hasNthChildOfSelector: true,
          hasStatePseudoClass: false,
          hasUnsupportedPseudoClass: false
        }
      },
      'result'
    );
  });

  it('should set nth-child-of and negation flags for class selector', () => {
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
    const res = func(ast, true);
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
          hasForgivenPseudoFunc: false,
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: true,
          hasNestedSelector: true,
          hasNestingSelector: false,
          hasNotPseudoFunc: true,
          hasNthChildOfSelector: true,
          hasStatePseudoClass: false,
          hasUnsupportedPseudoClass: false
        }
      },
      'result'
    );
  });

  it('should set hasUnsupportedPseudoClass flag for unknown pseudo', () => {
    const ast = cssTree.fromPlainObject({
      children: [
        {
          children: [
            {
              loc: null,
              name: 'unknown',
              type: PS_CLASS_SELECTOR
            }
          ],
          loc: null,
          type: SELECTOR
        }
      ],
      loc: null,
      type: SELECTOR_LIST
    });
    const res = func(ast, true);
    assert.deepEqual(
      res,
      {
        branches: [
          [
            {
              loc: null,
              name: 'unknown',
              type: PS_CLASS_SELECTOR
            }
          ]
        ],
        info: {
          hasForgivenPseudoFunc: false,
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: false,
          hasNestedSelector: false,
          hasNestingSelector: false,
          hasNotPseudoFunc: false,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false,
          hasUnsupportedPseudoClass: true
        }
      },
      'result'
    );
  });

  it('should set hasNestingSelector flag for &', () => {
    const ast = {
      children: [
        {
          children: [
            {
              loc: null,
              type: NEST_SELECTOR
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
              type: NEST_SELECTOR
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
          hasForgivenPseudoFunc: false,
          hasHasPseudoFunc: false,
          hasLogicalPseudoFunc: false,
          hasNestedSelector: false,
          hasNestingSelector: true,
          hasNotPseudoFunc: false,
          hasNthChildOfSelector: false,
          hasStatePseudoClass: false,
          hasUnsupportedPseudoClass: false
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

  it('should return single leaf selector node without modification', () => {
    const leaves = [{ type: ATTR_SELECTOR }];
    const res = func(leaves);
    assert.deepEqual(res, [{ type: ATTR_SELECTOR }], 'result');
  });

  it('should sort class selector prior to attribute selector node', () => {
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

  it('should sort array of selector leaves by node type priority', () => {
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

  it('should throw DOMException for undefined selector AST name input', () => {
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

  it('should parse universal selector into wildcard prefix and name', () => {
    const res = func('*');
    assert.deepEqual(res, {
      prefix: '*',
      localName: '*'
    });
  });

  it('should parse plain selector name into default wildcard prefix', () => {
    const res = func('foo');
    assert.deepEqual(res, {
      prefix: '*',
      localName: 'foo'
    });
  });

  it('should parse selector with empty namespace into empty prefix', () => {
    const res = func('|Foo');
    assert.deepEqual(res, {
      prefix: '',
      localName: 'Foo'
    });
  });

  it('should parse selector with wildcard namespace into star prefix', () => {
    const res = func('*|Foo');
    assert.deepEqual(res, {
      prefix: '*',
      localName: 'Foo'
    });
  });

  it('should parse namespaced selector into namespace prefix and name', () => {
    const res = func('ns|Foo');
    assert.deepEqual(res, {
      prefix: 'ns',
      localName: 'Foo'
    });
  });

  it('should parse namespaced type selector into prefix and local name', () => {
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

describe('extract subjects via AST', () => {
  const func = parser.extractSubjectsAst;
  const parse = sel => cssTree.parse(sel, { context: 'selectorList' });

  it('should handle empty or invalid AST gracefully', () => {
    assert.deepEqual(func(null), [], 'null');
    assert.deepEqual(func(undefined), [], 'undefined');
    assert.deepEqual(func({}), [], 'empty object');
    assert.deepEqual(func({ type: 'Selector' }), [], 'not a SelectorList');
  });

  it('should extract single type selector', () => {
    assert.deepEqual(func(parse('div')), [
      { id: null, className: null, tag: 'div' }
    ]);
    assert.deepEqual(func(parse('*')), [
      { id: null, className: null, tag: null }
    ]);
  });

  it('should extract single id selector', () => {
    assert.deepEqual(func(parse('#foo')), [
      { id: 'foo', className: null, tag: null }
    ]);
  });

  it('should extract single class selector', () => {
    assert.deepEqual(func(parse('.bar')), [
      { id: null, className: 'bar', tag: null }
    ]);
  });

  it('should extract compound selector', () => {
    assert.deepEqual(func(parse('div#foo.bar')), [
      { id: 'foo', className: 'bar', tag: 'div' }
    ]);
  });

  it('should extract rightmost subject of complex selector', () => {
    assert.deepEqual(func(parse('ul > li.item')), [
      { id: null, className: 'item', tag: 'li' }
    ]);
    assert.deepEqual(func(parse('div .foo + p#bar')), [
      { id: 'bar', className: null, tag: 'p' }
    ]);
    assert.deepEqual(func(parse('main ~ section.content > h1')), [
      { id: null, className: null, tag: 'h1' }
    ]);
  });

  it('should extract selector list', () => {
    assert.deepEqual(func(parse('.foo, div#bar')), [
      { id: null, className: 'foo', tag: null },
      { id: 'bar', className: null, tag: 'div' }
    ]);
  });

  it('should extract the last class/id in the rightmost compound', () => {
    assert.deepEqual(func(parse('div.foo.bar')), [
      { id: null, className: 'bar', tag: 'div' }
    ]);
    assert.deepEqual(func(parse('div#first#second')), [
      { id: 'second', className: null, tag: 'div' }
    ]);
  });

  it('should handle escaped characters properly', () => {
    assert.deepEqual(func(parse('.foo\\!bar')), [
      { id: null, className: 'foo!bar', tag: null }
    ]);
    assert.deepEqual(func(parse('#\\31 23')), [
      { id: '123', className: null, tag: null }
    ]);
  });

  it('should ignore attributes, pseudo-classes, and pseudo-elements', () => {
    assert.deepEqual(func(parse('a[href]:hover::before')), [
      { id: null, className: null, tag: 'a' }
    ]);
    assert.deepEqual(func(parse('input[type="text"].input-box:focus')), [
      { id: null, className: 'input-box', tag: 'input' }
    ]);
  });

  it('should lowercase tag names', () => {
    assert.deepEqual(func(parse('SECTION')), [
      { id: null, className: null, tag: 'section' }
    ]);
  });

  it('should strip namespaces from tags', () => {
    assert.deepEqual(func(parse('svg|a')), [
      { id: null, className: null, tag: 'a' }
    ]);
    assert.deepEqual(func(parse('*|div')), [
      { id: null, className: null, tag: 'div' }
    ]);
  });
});
