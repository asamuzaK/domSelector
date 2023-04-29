/**
 * constant.test.js
 */

/* api */
import { assert } from 'chai';
import { describe, it } from 'mocha';

/* test */
import * as mjs from '../src/mjs/constant.js';

describe('constants', () => {
  const items = Object.entries(mjs);
  for (const [key, value] of items) {
    it('should get string', () => {
      assert.isTrue(/^[A-Z][A-Z_]+$/.test(key));
      assert.isString(value);
    });
  }
});
