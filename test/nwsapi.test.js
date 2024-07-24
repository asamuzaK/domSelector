/**
 * parser.test.js
 */

/* api */
import { assert } from 'chai';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, it } from 'mocha';

/* test */
import * as nwsapi from '../src/js/nwsapi.js';

describe('init nwsapi', () => {
  const func = nwsapi.initNwsapi;

  let window, document;
  beforeEach(() => {
    const dom = new JSDOM('', {
      runScripts: 'dangerously',
      url: 'http://localhost/'
    });
    window = dom.window;
    document = dom.window.document;
  });
  afterEach(() => {
    window = null;
    document = null;
  });

  it('should throw', () => {
    assert.throws(() => func(), TypeError, 'Unexpected type Undefined');
  });

  it('should throw', () => {
    assert.throws(() => func(window), TypeError, 'Unexpected type Window');
  });

  it('should throw', () => {
    const node = document.createElement('div');
    assert.throws(() => func(node), TypeError, 'Unexpected node DIV');
  });

  it('should get nwsapi', () => {
    const res = func(document);
    assert.isTrue(Object.prototype.hasOwnProperty.call(res, 'match'),
      'nwsapi.match');
    assert.isTrue(Object.prototype.hasOwnProperty.call(res, 'closest'),
      'nwsapi.closest');
    assert.isTrue(Object.prototype.hasOwnProperty.call(res, 'first'),
      'nwsapi.first');
    assert.isTrue(Object.prototype.hasOwnProperty.call(res, 'select'),
      'nwsapi.select');
  });
});

describe('filter selector', () => {
  const func = nwsapi.filterSelector;

  it('should get false', () => {
    const res = func();
    assert.isFalse(res, 'result');
  });

  it('should get true', () => {
    const res = func('*');
    assert.isTrue(res, 'result');
  });

  it('should get false', () => {
    const res = func('*|*');
    assert.isFalse(res, 'result');
  });

  it('should get false', () => {
    const res = func('|*');
    assert.isFalse(res, 'result');
  });

  it('should get true', () => {
    const res = func('p');
    assert.isTrue(res, 'result');
  });

  it('should get false', () => {
    const res = func('ns|p');
    assert.isFalse(res, 'result');
  });

  it('should get false', () => {
    const res = func('::slotted');
    assert.isFalse(res, 'result');
  });

  it('should get true', () => {
    const res = func('.foo');
    assert.isTrue(res, 'result');
  });

  it('should get true', () => {
    const res = func('#foo');
    assert.isTrue(res, 'result');
  });

  it('should get true', () => {
    const res = func('[id]');
    assert.isTrue(res, 'result');
  });

  it('should get false', () => {
    const res = func('[id');
    assert.isFalse(res, 'result');
  });

  it('should get false', () => {
    const res = func('[ns|id]');
    assert.isFalse(res, 'result');
  });

  it('should get true', () => {
    const res = func('[foo="bar baz"]');
    assert.isTrue(res, 'result');
  });

  it('should get false', () => {
    const res = func('[foo i]');
    assert.isFalse(res, 'result');
  });

  it('should get false', () => {
    const res = func('[foo="bar baz" i]');
    assert.isFalse(res, 'result');
  });

  it('should get false', () => {
    const res = func('[foo="bar baz" qux i]');
    assert.isFalse(res, 'result');
  });

  it('should get false', () => {
    const res = func("[foo='bar baz' qux i]");
    assert.isFalse(res, 'result');
  });

  it('should get false', () => {
    const res = func('[foo="bar \'baz\'" i]');
    assert.isFalse(res, 'result');
  });

  it('should get false', () => {
    const res = func('[foo=\'bar "baz"\' i]');
    assert.isFalse(res, 'result');
  });

  it('should get false', () => {
    const res = func('[foo="bar baz\']');
    assert.isFalse(res, 'result');
  });

  it('should get false', () => {
    const res = func('[foo=\'bar baz"]');
    assert.isFalse(res, 'result');
  });

  it('should get false', () => {
    const res = func('[foo="bar baz\' i]');
    assert.isFalse(res, 'result');
  });

  it('should get false', () => {
    const res = func('[foo=\'bar baz" i]');
    assert.isFalse(res, 'result');
  });

  it('should get false', () => {
    const res = func('[foo bar baz i]');
    assert.isFalse(res, 'result');
  });

  it('should get false', () => {
    const res = func('[foo|=bar]');
    assert.isFalse(res, 'result');
  });

  it('should get false', () => {
    const res = func(':enabled');
    assert.isFalse(res, 'result');
  });

  it('should get false', () => {
    const res = func(':disabled');
    assert.isFalse(res, 'result');
  });

  it('should get false', () => {
    const res = func(':empty');
    assert.isTrue(res, 'result');
  });

  it('should get true', () => {
    const res = func(':indeterminate');
    assert.isTrue(res, 'result');
  });

  it('should get true', () => {
    const res = func(':root');
    assert.isTrue(res, 'result');
  });

  it('should get true', () => {
    const res = func(':target');
    assert.isTrue(res, 'result');
  });

  it('should get false', () => {
    const res = func(':after');
    assert.isFalse(res, 'result');
  });

  it('should get false', () => {
    const res = func(':host');
    assert.isFalse(res, 'result');
  });

  it('should get true', () => {
    const res = func(':nth-child(even)');
    assert.isTrue(res, 'result');
  });

  it('should get true', () => {
    const res = func(':nth-of-type( odd )');
    assert.isTrue(res, 'result');
  });

  it('should get false', () => {
    const res = func(':nth-child(foo)');
    assert.isFalse(res, 'result');
  });

  it('should get false', () => {
    const res = func(':nth-child(even of .foo)');
    assert.isFalse(res, 'result');
  });

  it('should get true', () => {
    const res = func(':nth-child(2)');
    assert.isTrue(res, 'result');
  });

  it('should get true', () => {
    const res = func(':nth-child(-1)');
    assert.isTrue(res, 'result');
  });

  it('should get true', () => {
    const res = func(':nth-child(n)');
    assert.isTrue(res, 'result');
  });

  it('should get true', () => {
    const res = func(':nth-child(+n)');
    assert.isTrue(res, 'result');
  });

  it('should get true', () => {
    const res = func(':nth-child(-n)');
    assert.isTrue(res, 'result');
  });

  it('should get true', () => {
    const res = func(':nth-child(2n+1)');
    assert.isTrue(res, 'result');
  });

  it('should get true', () => {
    const res = func(':nth-child(2n + 1)');
    assert.isTrue(res, 'result');
  });

  it('should get true', () => {
    const res = func(':nth-child(-2n - 1)');
    assert.isTrue(res, 'result');
  });

  it('should get false', () => {
    const res = func(':nth-child(n of .foo)');
    assert.isFalse(res, 'result');
  });

  it('should get false', () => {
    const res = func(':nth-child(2n+1 of .foo)');
    assert.isFalse(res, 'result');
  });

  it('should get true', () => {
    const res = func(':not(p)');
    assert.isTrue(res, 'result');
  });

  it('should get true', () => {
    const res = func(':is( p, div )');
    assert.isTrue(res, 'result');
  });

  it('should get false', () => {
    const res = func(':is(:nth-child(2n+1), :nth-child(3n+1))');
    assert.isFalse(res, 'result');
  });

  it('should get false', () => {
    const res = func(':is()');
    assert.isFalse(res, 'result');
  });

  it('should get false', () => {
    const res = func(':where()');
    assert.isFalse(res, 'result');
  });

  it('should get true', () => {
    const res = func(':not(p.foo, div.bar)');
    assert.isTrue(res, 'result');
  });

  it('should get false', () => {
    const res = func(':not(.foo .bar)');
    assert.isFalse(res, 'result');
  });

  it('should get true', () => {
    const res = func(':not(.foo .bar)', {
      complex: true,
      descendant: true
    });
    assert.isTrue(res, 'result');
  });

  it('should get true', () => {
    const res = func(':not(.foo > .bar)', {
      complex: true,
      descendant: true
    });
    assert.isTrue(res, 'result');
  });

  it('should get false', () => {
    const res = func(':not(.foo > .bar)', {
      complex: true,
      descendant: false
    });
    assert.isFalse(res, 'result');
  });

  it('should get true', () => {
    const res = func(':not(:is(.foo, .bar))');
    assert.isTrue(res, 'result');
  });

  it('should get false', () => {
    const res = func(':not(:not(.foo, .bar))');
    assert.isFalse(res, 'result');
  });

  it('should get false', () => {
    const res = func(':not(:is(.foo > .bar))');
    assert.isFalse(res, 'result');
  });

  it('should get true', () => {
    const res = func(':not(:is(.foo .bar))', {
      complex: true,
      descendant: true
    });
    assert.isTrue(res, 'result');
  });

  it('should get true', () => {
    const res = func(':not(:is(.foo > .bar))', {
      complex: true,
      descendant: true
    });
    assert.isTrue(res, 'result');
  });

  it('should get false', () => {
    const res = func(':not(:is(.foo > .bar))', {
      complex: true,
      descendant: false
    });
    assert.isFalse(res, 'result');
  });

  it('should get false', () => {
    const res = func(':is(:not(:is(.foo, .bar)), .baz)');
    assert.isFalse(res, 'result');
  });
});
