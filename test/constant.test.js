/**
 * constant.test.js
 */

/* api */
const { assert } = require('chai');
const { describe, it } = require('mocha');

/* test */
const constant = require('../src/js/constant.js');

describe('constants', () => {
  const items = Object.entries(constant);
  for (const [key, value] of items) {
    it('should get string', () => {
      assert.isTrue(/^[A-Z][A-Z_]+$/.test(key));
      assert.isString(value);
    });
  }
});
