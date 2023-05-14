/**
 * domexception.test.js
 */
'use strict';

/* api */
const { assert } = require('chai');
const { describe, it } = require('mocha');

/* test */
const DOMException = require('../src/js/domexception.js');

describe('domexception', () => {
  it('should be exposed', () => {
    const err = new DOMException('foo', 'SyntaxError');
    assert.strictEqual(err.name, 'SyntaxError', 'name');
    assert.strictEqual(err.message, 'foo', 'message');
    assert.strictEqual(err.code, 12, 'code');
  });
});
