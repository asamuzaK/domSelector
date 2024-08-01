/**
 * matcher.test.js
 */

/* api */
import { assert } from 'chai';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, it } from 'mocha';

/* test */
import { Matcher } from '../src/js/matcher.js';
import {
  EMPTY, IDENTIFIER, SELECTOR_ATTR, SELECTOR_PSEUDO_CLASS, SELECTOR_TYPE, STRING
} from '../src/js/constant.js';

describe('Matcher', () => {
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

  describe('match pseudo-element selector', () => {
    const func = (new Matcher()).matchPseudoElementSelector;

    it('should throw', () => {
      assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
    });

    it('should not match', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const res = func('after');
      assert.isUndefined(res, 'result');
    });

    it('should throw', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      assert.throws(() => func('after', { warn: true }),
        DOMException, 'Unsupported pseudo-element ::after');
    });

    it('should not match', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const res = func('part');
      assert.isUndefined(res, 'result');
    });

    it('should throw', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      assert.throws(() => func('part', { warn: true }),
        DOMException, 'Unsupported pseudo-element ::part()');
    });

    it('should not match', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const res = func('slotted');
      assert.isUndefined(res, 'result');
    });

    it('should throw', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      assert.throws(() => func('slotted', { warn: true }),
        DOMException, 'Unsupported pseudo-element ::slotted()');
    });

    it('should throw', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      assert.throws(() => func('foo'),
        DOMException, 'Unknown pseudo-element ::foo');
    });

    it('should not match', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const res = func('foo', {
        forgive: true
      });
      assert.isUndefined(res, 'result');
    });

    it('should not match', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const res = func('-webkit-foo');
      assert.isUndefined(res, 'result');
    });

    it('should throw', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      assert.throws(
        () => func('-webkit-foo', { warn: true }),
        DOMException, 'Unsupported pseudo-element ::-webkit-foo'
      );
    });

    it('should throw', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      assert.throws(
        () => func('webkit-foo'),
        DOMException, 'Unknown pseudo-element ::webkit-foo'
      );
    });

    it('should not match', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const res = func('webkit-foo', {
        forgive: true
      });
      assert.isUndefined(res, 'result');
    });

    it('should throw', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      assert.throws(
        () => func('-webkitfoo'),
        DOMException, 'Unknown pseudo-element ::-webkitfoo'
      );
    });

    it('should not match', () => {
      const node = document.createElement('div');
      document.getElementById('div0').appendChild(node);
      const res = func('-webkitfoo', {
        forgive: true
      });
      assert.isUndefined(res, 'result');
    });
  });

  describe('match attribute selector', () => {
    const func = (new Matcher())._matchAttributeSelector;

    it('should throw', () => {
      const ast = {
        flags: 'baz',
        matcher: '=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          name: 'bar',
          type: IDENTIFIER
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      assert.throws(() => func(ast, node), DOMException,
        'Invalid selector [foo=bar baz]');
    });

    it('should get matched node', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: '|foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: 's',
        matcher: null,
        name: {
          name: '|foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: 'i',
        matcher: null,
        name: {
          name: '|Foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: '|foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: '*|foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: 's',
        matcher: null,
        name: {
          name: '*|foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'Qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: '*|foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: 's',
        matcher: null,
        name: {
          name: '*|foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: 'baz|foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: null
      };
      document.documentElement.setAttribute('xmlns:baz',
        'https://example.com/baz');
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: 'baz|foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'Baz:foo', 'qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: 's',
        matcher: null,
        name: {
          name: 'Baz|Foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: null
      };
      document.documentElement.setAttribute('xmlns:Baz',
        'https://example.com/baz');
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'Baz:Foo', 'Qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: 's',
        matcher: null,
        name: {
          name: 'Baz|Foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:Foo', 'Qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: 'i',
        matcher: null,
        name: {
          name: 'Baz|Foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: null
      };
      document.documentElement.setAttribute('xmlns:baz',
        'https://example.com/baz');
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'Qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: 'i',
        matcher: null,
        name: {
          name: 'Baz|Foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: null
      };
      document.documentElement.setAttribute('xmlns:baz',
        'https://example.com/baz');
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'Qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: 'i',
        matcher: null,
        name: {
          name: 'baz|foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: null
      };
      document.documentElement.setAttribute('xmlns:Baz',
        'https://example.com/baz');
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'Baz:Foo', 'Qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: 'baz|foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: 's',
        matcher: null,
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'Qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: 's',
        matcher: null,
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttributeNS('https://example.com/baz', 'baz:bar', 'qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: null
      };
      const node = document.createElement('div');
      node.setAttribute('baz', 'bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: null,
        matcher: '=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          name: 'bar',
          type: IDENTIFIER
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: 's',
        matcher: '=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          name: 'Bar',
          type: IDENTIFIER
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: 's',
        matcher: '=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          name: 'bar',
          type: IDENTIFIER
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: '=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          name: 'bar',
          type: IDENTIFIER
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: null,
        matcher: '=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: 's',
        matcher: '=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'Bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: 's',
        matcher: '=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: null,
        matcher: '=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar baz'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: null,
        matcher: '=',
        name: {
          name: 'baz|foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'qux'
        }
      };
      document.documentElement.setAttribute('xmlns:baz',
        'https://example.com/baz');
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      node.setAttributeNS('https://example.com/baz', 'baz:foo', 'qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: '=',
        name: {
          name: 'xml|lang',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'en'
        }
      };
      const node = document.createElement('div');
      node.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:lang',
        'en');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: '=',
        name: {
          name: 'xml:lang',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'en'
        }
      };
      const node = document.createElement('div');
      node.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:lang',
        'en');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: null,
        matcher: '~=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: 's',
        matcher: '~=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'Bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: 's',
        matcher: '~=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: null,
        matcher: '~=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: '~=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: '~=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: ''
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: null,
        matcher: '|=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: 's',
        matcher: '|=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'Bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: 's',
        matcher: '|=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: null,
        matcher: '|=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar-baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: 's',
        matcher: '|=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'Bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar-baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: 's',
        matcher: '|=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar-baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: '|=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz-bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: '|=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: ''
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz-bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: null,
        matcher: '^=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: null,
        matcher: '^=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'barbaz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: null,
        matcher: '^=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: '^=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: 's',
        matcher: '^=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'Bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: 's',
        matcher: '^=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: 's',
        matcher: '^=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: ''
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'Bar baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: null,
        matcher: '$=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: null,
        matcher: '$=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bazbar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: null,
        matcher: '$=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: '$=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar baz');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: 's',
        matcher: '$=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'Bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz Bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: 's',
        matcher: '$=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz Bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: 's',
        matcher: '$=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: ''
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz Bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: null,
        matcher: '*=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: null,
        matcher: '*=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'bazbarqux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: null,
        matcher: '*=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz bar qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: '*=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz qux quux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        flags: 's',
        matcher: '*=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'Bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz Bar qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: 's',
        matcher: '*=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'bar'
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz Bar qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: 's',
        matcher: '*=',
        name: {
          name: 'foo',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: ''
        }
      };
      const node = document.createElement('div');
      node.setAttribute('foo', 'baz Bar qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node(s)', () => {
      const ast = {
        flags: 'i',
        matcher: '=',
        name: {
          name: 'baz',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'qux'
        }
      };
      const domStr = '<foo></foo>';
      const doc = new window.DOMParser().parseFromString(domStr, 'text/xml');
      const node = doc.createElement('bar');
      node.setAttribute('baz', 'QUX');
      doc.documentElement.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: 's',
        matcher: '=',
        name: {
          name: 'baz',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'qux'
        }
      };
      const domStr = '<foo></foo>';
      const doc = new window.DOMParser().parseFromString(domStr, 'text/xml');
      const node = doc.createElement('bar');
      node.setAttribute('baz', 'QUX');
      doc.documentElement.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should not match', () => {
      const ast = {
        flags: null,
        matcher: '=',
        name: {
          name: 'baz',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: {
          type: STRING,
          value: 'qux'
        }
      };
      const domStr = '<foo></foo>';
      const doc = new window.DOMParser().parseFromString(domStr, 'text/xml');
      const node = doc.createElement('bar');
      node.setAttribute('baz', 'QUX');
      doc.documentElement.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });
  });

  describe('match type selector', () => {
    const func = (new Matcher())._matchTypeSelector;

    it('should get matched node(s)', () => {
      const ast = {
        name: '|*',
        type: SELECTOR_TYPE
      };
      const node = document.createElementNS('', 'div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: '|*',
        type: SELECTOR_TYPE
      };
      const node = document.getElementById('div0');
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: '|*',
        type: SELECTOR_TYPE
      };
      const node = document.createElementNS('https://example.com/foo', 'div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: '*|*',
        type: SELECTOR_TYPE
      };
      const node = document.getElementById('div0');
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: '*|*',
        type: SELECTOR_TYPE
      };
      const node =
          document.createElementNS('https://example.com/foo', 'foo:bar');
      node.setAttribute('xmlns:foo', 'https://example.com/foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'foo|*',
        type: SELECTOR_TYPE
      };
      const node =
          document.createElementNS('https://example.com/foo', 'foo:bar');
      node.setAttribute('xmlns:foo', 'https://example.com/foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'foo|*',
        type: SELECTOR_TYPE
      };
      const node =
        document.createElementNS('https://example.com/foo', 'foo:bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: 'foo|*',
        type: SELECTOR_TYPE
      };
      const node = document.getElementById('div0');
      node.setAttribute('xmlns:foo', 'https://example.com/foo');
      const res = func(ast, node, {
        forgive: true
      });
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'foo|bar',
        type: SELECTOR_TYPE
      };
      const nsroot = document.createElement('div');
      nsroot.setAttribute('xmlns', 'http://www.w3.org/2000/xmlns/');
      nsroot.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:foo',
        'https://example.com/foo');
      const node =
          document.createElementNS('https://example.com/foo', 'foo:bar');
      nsroot.appendChild(node);
      const parent = document.getElementById('div0');
      parent.appendChild(nsroot);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: 'foo|bar',
        type: SELECTOR_TYPE
      };
      const node =
          document.createElementNS('https://example.com/foo', 'foo:baz');
      node.setAttribute('xmlns:foo', 'https://example.com/foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: 'foo|bar',
        type: SELECTOR_TYPE
      };
      const node = document.createElement('foo:qux');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node, {
        forgive: true
      });
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: '|div',
        type: SELECTOR_TYPE
      };
      const node = document.createElementNS('', 'div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: '|div',
        type: SELECTOR_TYPE
      };
      const node = document.getElementById('div0');
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'foo',
        type: SELECTOR_TYPE
      };
      const node = document.createElementNS('', 'foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'h',
        type: SELECTOR_TYPE
      };
      const node = document.createElementNS('urn:ns', 'h');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: '*|h',
        type: SELECTOR_TYPE
      };
      const node = document.createElementNS('urn:ns', 'h');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: '*',
        type: SELECTOR_TYPE
      };
      const node = document.getElementById('div0');
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: '*',
        type: SELECTOR_TYPE
      };
      const node =
          document.createElementNS('https://example.com/foo', 'foo:bar');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'div',
        type: SELECTOR_TYPE
      };
      const node = document.getElementById('div0');
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'div',
        type: SELECTOR_TYPE
      };
      const node =
          document.createElementNS('https://example.com/foo', 'foo:div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: '*|div',
        type: SELECTOR_TYPE
      };
      const node =
          document.createElementNS('https://example.com/foo', 'foo:div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const domStr = `<!doctype html>
        <html>
          <body>
            <foo:bar xmlns:foo="https://example.com/foo" id="foobar">
              <foo:baz/>
              <foo:qux/>
            </foo:bar>
          </body>
        </html>`;
      const doc = new window.DOMParser().parseFromString(domStr, 'text/html');
      const ast = {
        name: 'foo|bar',
        type: SELECTOR_TYPE
      };
      const node = doc.getElementById('foobar');
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'null',
        type: SELECTOR_TYPE
      };
      const node = document.createElement('null');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'undefined',
        type: SELECTOR_TYPE
      };
      const node = document.createElement('undefined');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });
  });

  describe('match directionality pseudo-class', () => {
    const func = (new Matcher())._matchDirectionPseudoClass;

    it('should get matched node', () => {
      const ast = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const node = document.createElement('bdo');
      node.setAttribute('dir', 'ltr');
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('dir', 'ltr');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'rtl',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('dir', 'rtl');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const root = document.documentElement;
      const res = func(ast, root);
      assert.deepEqual(res, root, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'tel');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'tel');
      node.setAttribute('dir', 'foo');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'tel');
      node.setAttribute('dir', 'auto');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const node = document.createElement('textarea');
      node.setAttribute('dir', 'auto');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const node = document.createElement('input');
      node.setAttribute('type', 'text');
      node.setAttribute('dir', 'auto');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('dir', 'auto');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const node = document.createElement('bdi');
      node.textContent = 'foo';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'rtl',
        type: IDENTIFIER
      };
      const node = document.createElement('bdi');
      node.textContent = '\u05EA';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const node = document.createElement('bdi');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const html = `
          <template id="template">
            <div>
              <slot id="foo" name="bar" dir="auto">Foo</slot>
            </div>
          </template>
          <my-element id="baz">
            <span id="qux" slot="foo">Qux</span>
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
      };
      window.customElements.define('my-element', MyElement);
      const shadow = document.getElementById('baz');
      const node = shadow.shadowRoot.getElementById('foo');
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'rtl',
        type: IDENTIFIER
      };
      const root = document.documentElement;
      root.setAttribute('dir', 'rtl');
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'ltr',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      parent.setAttribute('dir', 'ltr');
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });
  });

  describe('match language pseudo-class', () => {
    const func = (new Matcher())._matchLanguagePseudoClass;

    it('should not match', () => {
      const ast = {
        name: EMPTY,
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('lang', '');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: '',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('lang', '');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: '*',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.lang = 'en';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: '*',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'en');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: '*',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: '\\*',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.lang = 'en';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: '\\*-FR',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.lang = 'fr-FR';
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: '*',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('lang', '');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: '*',
        type: IDENTIFIER
      };
      const frag = document.createDocumentFragment();
      const node = document.createElement('div');
      frag.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'en',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'en');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'en',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'en-US');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'en',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: 'en',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'de');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: 'en',
        type: IDENTIFIER
      };
      const frag = document.createDocumentFragment();
      const node = document.createElement('div');
      frag.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'de-DE',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'de-Latn-DE-1996');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'de-Latn-DE',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'de-Latn-DE-1996');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        name: 'de-de',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'de-DE');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const ast = {
        name: 'de-de',
        type: IDENTIFIER
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'de-Deva');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.isNull(res, node, 'result');
    });
  });

  describe('match selector', () => {
    const matcher = new Matcher();
    const func = matcher.matchSelector.bind(matcher);

    it('should throw', () => {
      assert.throws(() => func(), TypeError, 'Unexpected ast type Undefined');
    });

    it('should throw', () => {
      const ast = {
        name: 'li',
        type: SELECTOR_TYPE
      };
      assert.throws(() => func(ast), TypeError,
        'Unexpected node type Undefined');
    });

    it('should throw', () => {
      const ast = {
        name: 'li',
        type: SELECTOR_TYPE
      };
      assert.throws(() => func(ast, document), TypeError,
        'Unexpected node #document');
    });

    it('should get matched node(s)', () => {
      const ast = {
        name: 'li',
        type: SELECTOR_TYPE
      };
      const node = document.getElementById('li1');
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node(s)', () => {
      const ast = {
        name: 'li',
        type: SELECTOR_TYPE
      };
      const node = document.getElementById('li1');
      const res = func(ast, node, null, true);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node(s)', () => {
      const ast = {
        flags: null,
        matcher: null,
        name: {
          name: 'id',
          type: IDENTIFIER
        },
        type: SELECTOR_ATTR,
        value: null
      };
      const node = document.getElementById('li1');
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        children: [
          {
            name: 'ltr',
            type: IDENTIFIER
          }
        ],
        name: 'dir',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('div');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      parent.setAttribute('dir', 'ltr');
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const ast = {
        children: [
          {
            name: 'en',
            type: IDENTIFIER
          }
        ],
        name: 'lang',
        type: SELECTOR_PSEUDO_CLASS
      };
      const node = document.createElement('div');
      node.setAttribute('lang', 'en');
      const parent = document.getElementById('div0');
      parent.appendChild(node);
      const res = func(ast, node);
      assert.deepEqual(res, node, 'result');
    });
  });
});
