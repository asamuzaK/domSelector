/**
 * constant.test.js
 */

/* api */
import { strict as assert } from 'node:assert';
import { describe, it } from 'mocha';

/* test */
import * as constant from '../src/js/constant.js';

describe('constants', () => {
  const items = Object.entries(constant);
  for (const [key, value] of items) {
    it('should get string, number or array', () => {
      assert.strictEqual(/^[A-Z][A-Z_\d]+$/.test(key), true, 'key');
      assert.strictEqual(
        typeof value === 'string' ||
          Number.isInteger(value) ||
          Array.isArray(value),
        true,
        'value'
      );
      if (Array.isArray(value)) {
        assert.throws(() => {
          value[0] = 'foo';
        });
        for (const i of value) {
          assert.strictEqual(typeof i, 'string');
        }
      }
    });
  }
});
