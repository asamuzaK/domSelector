/* api */
import { assert } from 'chai';
import { describe, it } from 'mocha';

/* test */
import * as mjs from '../src/mjs/common.js';

describe('getType', () => {
  const func = mjs.getType;

  it('should get Undefined', () => {
    assert.strictEqual(func(), 'Undefined');
  });

  it('should get Null', () => {
    assert.strictEqual(func(null), 'Null');
  });

  it('should get Object', () => {
    assert.strictEqual(func({}), 'Object');
  });

  it('should get Array', () => {
    assert.strictEqual(func([]), 'Array');
  });

  it('should get Boolean', () => {
    assert.strictEqual(func(true), 'Boolean');
  });

  it('should get Number', () => {
    assert.strictEqual(func(1), 'Number');
  });

  it('should get String', () => {
    assert.strictEqual(func('a'), 'String');
  });
});

describe('isString', () => {
  const func = mjs.isString;

  it('should get true if string is given', () => {
    assert.strictEqual(func('a'), true);
  });

  it('should get false if given argument is not string', () => {
    assert.strictEqual(func(1), false);
  });
});

describe('is object, and not an empty object', () => {
  const func = mjs.isObjectNotEmpty;

  it('should get false', () => {
    const items = [{}, [], ['foo'], '', 'foo', undefined, null, 1, true];
    for (const item of items) {
      assert.isFalse(func(item));
    }
  });

  it('should get true', () => {
    const item = {
      foo: 'bar'
    };
    assert.isTrue(func(item));
  });
});
