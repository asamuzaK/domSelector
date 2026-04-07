/**
 * cache.js
 */

/* Generational Cache */
export class GenerationalCache {
  constructor(max) {
    this.max = Math.ceil(max / 2);
    this.current = new Map();
    this.old = new Map();
  }

  get(key) {
    let value = this.current.get(key);
    if (value !== undefined) {
      return value;
    }
    value = this.old.get(key);
    if (value !== undefined) {
      this.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key, value) {
    this.current.set(key, value);
    if (this.current.size >= this.max) {
      this.old = this.current;
      this.current = new Map();
    }
  }

  has(key) {
    return this.current.has(key) || this.old.has(key);
  }

  delete(key) {
    this.current.delete(key);
    this.old.delete(key);
  }

  clear() {
    this.current.clear();
    this.old.clear();
  }
}
