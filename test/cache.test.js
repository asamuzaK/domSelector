/**
 * utility.test.js
 */

/* api */
import { strict as assert } from 'node:assert';
import { describe, it } from 'mocha';

/* test */
import { GenerationalCache } from '../src/js/cache.js';

describe('GenerationalCache', () => {
  it('should initialize with correct max generation size', () => {
    const cache = new GenerationalCache(5);
    assert.strictEqual(
      cache.max,
      3,
      'max generation size should be Math.ceil(max / 2)'
    );
  });

  it('should set and get values', () => {
    const cache = new GenerationalCache(10);
    cache.set('key1', 'value1');
    cache.set('key2', { foo: 'bar' });

    assert.strictEqual(
      cache.get('key1'),
      'value1',
      'should get primitive value'
    );
    assert.deepEqual(
      cache.get('key2'),
      { foo: 'bar' },
      'should get object value'
    );
    assert.strictEqual(
      cache.get('unknown'),
      undefined,
      'should return undefined for missing keys'
    );
  });

  it('should check existence with has()', () => {
    const cache = new GenerationalCache(10);
    cache.set('key1', 'value1');

    assert.strictEqual(cache.has('key1'), true, 'should have key1');
    assert.strictEqual(cache.has('key2'), false, 'should not have key2');
  });

  it('should delete values', () => {
    const cache = new GenerationalCache(10);
    cache.set('key1', 'value1');
    cache.delete('key1');

    assert.strictEqual(cache.has('key1'), false, 'key1 should be deleted');
    assert.strictEqual(
      cache.get('key1'),
      undefined,
      'deleted key should return undefined'
    );
  });

  it('should clear all values', () => {
    const cache = new GenerationalCache(10);
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.clear();

    assert.strictEqual(cache.has('key1'), false, 'key1 should be cleared');
    assert.strictEqual(cache.has('key2'), false, 'key2 should be cleared');
  });

  it('should shift generations and evict old items', () => {
    const cache = new GenerationalCache(4);
    cache.set('k1', 'v1');
    cache.set('k2', 'v2');
    assert.strictEqual(
      cache.has('k1'),
      true,
      'k1 should exist in old generation'
    );
    assert.strictEqual(
      cache.has('k2'),
      true,
      'k2 should exist in old generation'
    );

    cache.set('k3', 'v3');
    cache.set('k4', 'v4');
    assert.strictEqual(cache.has('k1'), false, 'k1 should be evicted');
    assert.strictEqual(cache.has('k2'), false, 'k2 should be evicted');
    assert.strictEqual(
      cache.has('k3'),
      true,
      'k3 should survive in old generation'
    );
    assert.strictEqual(
      cache.has('k4'),
      true,
      'k4 should survive in old generation'
    );
  });

  it('should promote accessed old items to current generation', () => {
    const cache = new GenerationalCache(4);
    cache.set('k1', 'v1');
    cache.set('k2', 'v2');
    const val = cache.get('k1');
    assert.strictEqual(val, 'v1', 'should get promoted value');
    cache.set('k3', 'v3');
    assert.strictEqual(
      cache.has('k1'),
      true,
      'k1 should survive because it was promoted'
    );
    assert.strictEqual(cache.has('k2'), false, 'k2 should be evicted');
    assert.strictEqual(
      cache.has('k3'),
      true,
      'k3 should survive in old generation'
    );
  });
});
