/**
 * index.test.js
 */

/* api */
const { assert } = require('chai');
const { afterEach, beforeEach, describe, it, xit } = require('mocha');
const { JSDOM } = require('jsdom');

/* test */
const {
  closest, matches, querySelector, querySelectorAll
} = require('../src/index.js');

const globalKeys = ['DOMParser', 'Node', 'NodeFilter', 'NodeIterator'];

describe('exported api', () => {
  const domStr =
    '<!doctype html><html lang="en"><head></head><body></body></html>';
  const domOpt = {
    runScripts: 'dangerously',
    url: 'https://localhost/'
  };
  let document;
  beforeEach(() => {
    const dom = new JSDOM(domStr, domOpt);
    document = dom.window.document;
    for (const key of globalKeys) {
      global[key] = dom.window[key];
    }
  });
  afterEach(() => {
    document = null;
    for (const key of globalKeys) {
      delete global[key];
    }
  });

  describe('matches', () => {
    it('should throw', () => {
      assert.throws(() => matches('*|', document.body), SyntaxError);
    });

    it('should match', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      document.body.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = matches('div.foo ul.bar > li.baz', li3);
      assert.isTrue(res, 'result');
    });

    it('should not match', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      document.body.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = matches('div.foo ul.bar > li.qux', li3);
      assert.isFalse(res, 'result');
    });
  });

  describe('closest', () => {
    it('should throw', () => {
      assert.throws(() => closest('*|', document), SyntaxError);
    });

    it('should get matched node', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      document.body.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = closest('div.foo', li3);
      assert.deepEqual(res, div1, 'result');
    });

    it('should not match', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      document.body.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = closest('div.foobar', li3);
      assert.isNull(res, 'result');
    });
  });

  describe('query selector', () => {
    it('should throw', () => {
      assert.throws(() => querySelector('*|', document), SyntaxError);
    });

    it('should get matched node', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      document.body.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = querySelector('.bar', document);
      assert.deepEqual(res, ul1, 'result');
    });

    it('should get matched node', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      document.body.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = querySelector('.baz', div1);
      assert.deepEqual(res, li3, 'result');
    });

    it('should not match', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      document.body.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = querySelector('.qux', div1);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const frag = document.createDocumentFragment();
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      frag.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = querySelector('.bar', frag);
      assert.deepEqual(res, ul1, 'result');
    });

    it('should get matched node', () => {
      const frag = document.createDocumentFragment();
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      frag.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = querySelector('.baz', div1);
      assert.deepEqual(res, li3, 'result');
    });

    it('should not match', () => {
      const frag = document.createDocumentFragment();
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      frag.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = querySelector('.qux', div1);
      assert.isNull(res, 'result');
    });
  });

  describe('query selector all', () => {
    it('should throw', () => {
      assert.throws(() => querySelectorAll('*|', document), SyntaxError);
    });

    it('should get matched node(s)', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      document.body.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = querySelectorAll('li:nth-child(odd)', document);
      assert.deepEqual(res, [
        li1,
        li3,
        li5
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      document.body.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = querySelectorAll('li:nth-child(odd)', div1);
      assert.deepEqual(res, [
        li1,
        li3,
        li5
      ], 'result');
    });

    it('should not match', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      document.body.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = querySelectorAll('.qux', div1);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const frag = document.createDocumentFragment();
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      frag.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = querySelectorAll('li:nth-child(odd)', frag);
      assert.deepEqual(res, [
        li1,
        li3,
        li5
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const frag = document.createDocumentFragment();
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      frag.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = querySelectorAll('li:nth-child(odd)', div1);
      assert.deepEqual(res, [
        li1,
        li3,
        li5
      ], 'result');
    });

    it('should not match', () => {
      const frag = document.createDocumentFragment();
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      frag.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = querySelectorAll('.qux', div1);
      assert.deepEqual(res, [], 'result');
    });
  });
});

/**
 * monkey patch jsdom
 * @param {string} [str] - dom string
 * @returns {object} - patched JSDOM instance
 */
const jsdom = (str = '') => {
  const dom = new JSDOM(str, {
    runScripts: 'dangerously',
    url: 'https://localhost/'
  });
  dom.window.Element.prototype.matches = function (selector) {
    return matches(selector, this);
  };
  dom.window.Element.prototype.closest = function (selector) {
    return closest(selector, this);
  };
  dom.window.Document.prototype.querySelector = function (selector) {
    return querySelector(selector, this);
  };
  dom.window.DocumentFragment.prototype.querySelector = function (selector) {
    return querySelector(selector, this);
  };
  dom.window.Element.prototype.querySelector = function (selector) {
    return querySelector(selector, this);
  };
  dom.window.Document.prototype.querySelectorAll = function (selector) {
    return querySelectorAll(selector, this);
  };
  dom.window.DocumentFragment.prototype.querySelectorAll = function (selector) {
    return querySelectorAll(selector, this);
  };
  dom.window.Element.prototype.querySelectorAll = function (selector) {
    return querySelectorAll(selector, this);
  };
  return dom;
};

describe('patched JSDOM', () => {
  const domStr =
    '<!doctype html><html lang="en"><head></head><body></body></html>';
  let document;
  beforeEach(() => {
    const dom = jsdom(domStr);
    document = dom.window.document;
    for (const key of globalKeys) {
      global[key] = dom.window[key];
    }
  });
  afterEach(() => {
    document = null;
    for (const key of globalKeys) {
      delete global[key];
    }
  });

  describe('Element.matches()', () => {
    it('should throw', () => {
      assert.throws(() => document.body.matches('*|'), SyntaxError);
    });

    it('should match', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      document.body.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = li3.matches('div.foo ul.bar > li.baz');
      assert.isTrue(res, 'result');
    });

    it('should not match', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      document.body.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = li3.matches('div.foo ul.bar > li.qux');
      assert.isFalse(res, 'result');
    });
  });

  describe('Element.closest()', () => {
    it('should throw', () => {
      assert.throws(() => document.body.closest('*|'), SyntaxError);
    });

    it('should get matched node', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      document.body.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = li3.closest('div.foo');
      assert.deepEqual(res, div1, 'result');
    });

    it('should not match', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      document.body.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = li3.closest('div.foobar');
      assert.isNull(res, 'result');
    });
  });

  describe('Document.querySelector(), Element.querySelector()', () => {
    it('should throw', () => {
      assert.throws(() => document.querySelector('*|'), SyntaxError);
    });

    it('should get matched node', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      document.body.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = document.querySelector('.bar');
      assert.deepEqual(res, ul1, 'result');
    });

    it('should not match', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      document.body.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = document.querySelector('.qux');
      assert.isNull(res, 'result');
    });

    it('should throw', () => {
      assert.throws(() => document.body.querySelector('*|'), SyntaxError);
    });

    it('should get matched node', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      document.body.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = div1.querySelector('.baz');
      assert.deepEqual(res, li3, 'result');
    });

    it('should not match', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      document.body.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = div1.querySelector('.qux');
      assert.isNull(res, 'result');
    });

    it('should throw', () => {
      const frag = document.createDocumentFragment();
      assert.throws(() => frag.querySelector('*|'), SyntaxError);
    });

    it('should get matched node', () => {
      const frag = document.createDocumentFragment();
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      frag.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = frag.querySelector('.baz');
      assert.deepEqual(res, li3, 'result');
    });

    it('should not match', () => {
      const frag = document.createDocumentFragment();
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      frag.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = frag.querySelector('.qux');
      assert.isNull(res, 'result');
    });
  });

  describe('Document.querySelectorAll(), Element.querySelectorAll()', () => {
    it('should throw', () => {
      assert.throws(() => document.querySelectorAll('*|'), SyntaxError);
    });

    it('should get matched node', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      document.body.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = document.querySelectorAll('li:nth-child(odd)');
      assert.deepEqual(res, [
        li1,
        li3,
        li5
      ], 'result');
    });

    it('should not match', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      document.body.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = document.querySelectorAll('.qux');
      assert.deepEqual(res, [], 'result');
    });

    it('should throw', () => {
      assert.throws(() => document.body.querySelectorAll('*|'), SyntaxError);
    });

    it('should get matched node', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      document.body.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = div1.querySelectorAll('li:nth-child(odd)');
      assert.deepEqual(res, [
        li1,
        li3,
        li5
      ], 'result');
    });

    it('should not match', () => {
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      document.body.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = div1.querySelectorAll('.qux');
      assert.deepEqual(res, [], 'result');
    });

    it('should throw', () => {
      const frag = document.createDocumentFragment();
      assert.throws(() => frag.querySelectorAll('*|'), SyntaxError);
    });

    it('should get matched node', () => {
      const frag = document.createDocumentFragment();
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      frag.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = frag.querySelectorAll('li:nth-child(odd)');
      assert.deepEqual(res, [
        li1,
        li3,
        li5
      ], 'result');
    });

    it('should not match', () => {
      const frag = document.createDocumentFragment();
      const div1 = document.createElement('div');
      const div2 = document.createElement('div');
      const ul1 = document.createElement('ul');
      const li1 = document.createElement('li');
      const li2 = document.createElement('li');
      const li3 = document.createElement('li');
      const li4 = document.createElement('li');
      const li5 = document.createElement('li');
      div1.id = 'div1';
      div2.id = 'div2';
      ul1.id = 'ul1';
      li1.id = 'li1';
      li2.id = 'li2';
      li3.id = 'li3';
      li4.id = 'li4';
      li5.id = 'li5';
      ul1.append(li1, li2, li3, li4, li5);
      div2.appendChild(ul1);
      div1.appendChild(div2);
      frag.appendChild(div1);
      div1.classList.add('foo');
      ul1.classList.add('bar');
      li3.classList.add('baz');
      const res = frag.querySelectorAll('.qux');
      assert.deepEqual(res, [], 'result');
    });
  });
});

describe('jsdom issues tagged with `selectors` label', () => {
  describe('#1750 - https://github.com/jsdom/jsdom/issues/1750', () => {
    const domStr = `<!DOCTYPE html>
    <html>
      <body>
        <svg xmlns="http://www.w3.org/2000/svg" width="150" height="100" viewBox="0 0 3 2" id="target">
          <rect width="1" height="2" x="0" fill="#008d46" />
          <rect width="1" height="2" x="1" fill="#ffffff" />
          <rect width="1" height="2" x="2" fill="#d2232c" />
        </svg>
      </body>
    </html>`;
    let document;
    beforeEach(() => {
      const dom = jsdom(domStr);
      document = dom.window.document;
      for (const key of globalKeys) {
        global[key] = dom.window[key];
      }
    });
    afterEach(() => {
      document = null;
      for (const key of globalKeys) {
        delete global[key];
      }
    });

    it('should get matched node', () => {
      const node = document.getElementById('target');
      const res = document.querySelector('svg:not(:root)');
      assert.deepEqual(res, node, 'result');
    });
  });

  describe('#2114 - https://github.com/jsdom/jsdom/issues/2114', () => {
    const domStr = `<!DOCTYPE html>
    <html>
      <body>
        <div class="test">
        </div>
        <svg class="test" id="target">
        </svg>
      </body>
    </html>`;
    let document;
    beforeEach(() => {
      const dom = jsdom(domStr);
      document = dom.window.document;
      for (const key of globalKeys) {
        global[key] = dom.window[key];
      }
    });
    afterEach(() => {
      document = null;
      for (const key of globalKeys) {
        delete global[key];
      }
    });

    it('should get matched node', () => {
      const node = document.getElementById('target');
      const res = document.querySelectorAll('svg.test');
      assert.deepEqual(res, [node], 'result');
    });
  });

  describe('#2359 - https://github.com/jsdom/jsdom/issues/2359', () => {
    const domStr = `<!DOCTYPE html>
    <html>
      <body>
        <div>
          <p><span>hello</span></p>
          <p id="p2">hey</p>
          <div id="d2">div</div>
        </div>
      </body>
    </html>`;
    let document;
    beforeEach(() => {
      const dom = jsdom(domStr);
      document = dom.window.document;
      for (const key of globalKeys) {
        global[key] = dom.window[key];
      }
    });
    afterEach(() => {
      document = null;
      for (const key of globalKeys) {
        delete global[key];
      }
    });

    it('should not match', () => {
      const div = document.querySelector('div');
      const p = document.querySelector('p');
      assert.deepEqual(div.querySelector(':scope > p'), p, 'result');
      assert.isNull(div.querySelector(':scope > span'), 'result');
    });

    it('should get matched node(s)', () => {
      const div = document.querySelector('div');
      const p = document.querySelector('p');
      const p2 = document.querySelector('#p2');
      assert.deepEqual(div.querySelectorAll(':scope > p'), [p, p2], 'result');
      assert.deepEqual(div.querySelectorAll(':scope > span'), [], 'result');
    });

    it('should get matched node', () => {
      const div = document.querySelector('div');
      const p = document.querySelector('p');
      assert.deepEqual(div.querySelector(':scope > p, :scope > div'), p,
        'result');
    });

    it('should get matched node', () => {
      const div = document.querySelector('div');
      const div2 = document.querySelector('#d2');
      const p = document.querySelector('p');
      const p2 = document.querySelector('#p2');
      assert.deepEqual(div.querySelectorAll(':scope > p, :scope > div'),
        [p, p2, div2], 'result');
    });
  });

  describe('#2998 - https://github.com/jsdom/jsdom/issues/2998', () => {
    const domStr = `<!DOCTYPE html>
    <html>
      <body>
        <div id="refPoint">
          <div>
            <span id="target"></span>
          </div>
        </div>
      </body>
    </html>`;
    let document;
    beforeEach(() => {
      const dom = jsdom(domStr);
      document = dom.window.document;
      for (const key of globalKeys) {
        global[key] = dom.window[key];
      }
    });
    afterEach(() => {
      document = null;
      for (const key of globalKeys) {
        delete global[key];
      }
    });

    it('should not match', () => {
      const refPoint = document.getElementById('refPoint');
      const res = refPoint.querySelector(':scope > span');
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const refPoint = document.getElementById('refPoint');
      const node = document.getElementById('target');
      const res = refPoint.querySelector(':scope span');
      assert.deepEqual(res, node, 'result');
    });
  });

  describe('#3055 - https://github.com/jsdom/jsdom/issues/3055', () => {
    const domStr = `<!DOCTYPE html>
    <html>
      <body>
        <div class="container" id="target">
          Focus here:
          <button id="item">focus me</button>
        </div>
      </body>
    </html>`;
    let document;
    beforeEach(() => {
      const dom = jsdom(domStr);
      document = dom.window.document;
      for (const key of globalKeys) {
        global[key] = dom.window[key];
      }
    });
    afterEach(() => {
      document = null;
      for (const key of globalKeys) {
        delete global[key];
      }
    });

    it('should get result', () => {
      const node = document.getElementById('target');
      const item = document.getElementById('item');
      item.focus();
      const res = node.matches(':focus-within');
      assert.isTrue(res, 'result');
    });

    // FIXME: throws AssertionError for some reason
    xit('should get matched node', () => {
      const node = document.getElementById('target');
      const item = document.getElementById('item');
      item.focus();
      const res = node.querySelector(':focus-within');
      // these pass
      assert.strictEqual(res.id, 'target', 'id');
      assert.isTrue(res.classList.contains('container'), 'classList');
      assert.strictEqual(res.localName, 'div', 'localName');
      // but this fails, reports res !== node, why?
      assert.deepEqual(res, [node], 'result');
    });
  });

  describe('#3067 - https://github.com/jsdom/jsdom/issues/3067', () => {
    const domStr = `<!DOCTYPE html>
    <html>
      <body>
        <ul id="refPoint">
          <li id="li1">Alpha</li>
          <li id="li2">
            Beta
            <ul>
              <li>Gamma</li>
              <li>Delta</li>
            </ul>
          </li>
        </ul>
      </body>
    </html>`;
    let document;
    beforeEach(() => {
      const dom = jsdom(domStr);
      document = dom.window.document;
      for (const key of globalKeys) {
        global[key] = dom.window[key];
      }
    });
    afterEach(() => {
      document = null;
      for (const key of globalKeys) {
        delete global[key];
      }
    });

    it('should get result', () => {
      const refPoint = document.getElementById('refPoint');
      const li1 = document.getElementById('li1');
      const li2 = document.getElementById('li2');
      const res = refPoint.querySelectorAll(':scope > li');
      assert.deepEqual(res, [
        li1, li2
      ], 'result');
      assert.strictEqual(li1.textContent.trim(), 'Alpha', 'content');
      // NOTE: sample in #3067 is invalid, should include Gamma, Delta
      assert.notEqual(li2.textContent.trim(), 'Beta', 'content');
      assert.isTrue(/^Beta\n\s+Gamma\n\s+Delta$/.test(li2.textContent.trim()),
        'content');
    });
  });

  describe('#3297 - https://github.com/jsdom/jsdom/issues/3297', () => {
    const domStr = `<!DOCTYPE html>
    <html>
      <body>
        <div id="container">
          <div id="container-inner-1"></div>
          <div id="container-inner-2">
            <p id="p">Foo</p>
            <button id="button">Bar</button>
          </div>
        </div>
      </body>
    </html>`;
    let document;
    beforeEach(() => {
      const dom = jsdom(domStr);
      document = dom.window.document;
      for (const key of globalKeys) {
        global[key] = dom.window[key];
      }
    });
    afterEach(() => {
      document = null;
      for (const key of globalKeys) {
        delete global[key];
      }
    });

    it('should get result', () => {
      const container = document.getElementById('container');
      const res = container.querySelectorAll(':not(svg, svg *)');
      assert.deepEqual(res, [
        document.getElementById('container-inner-1'),
        document.getElementById('container-inner-2'),
        document.getElementById('p'),
        document.getElementById('button')
      ], 'result');
    });
  });

  describe('#3370 - https://github.com/jsdom/jsdom/issues/3370', () => {
    const domStr = `<!DOCTYPE html>
    <html>
      <body>
        <div class="case" id="target"></div>
      </body>
    </html>`;
    let document;
    beforeEach(() => {
      const dom = jsdom(domStr);
      document = dom.window.document;
      for (const key of globalKeys) {
        global[key] = dom.window[key];
      }
    });
    afterEach(() => {
      document = null;
      for (const key of globalKeys) {
        delete global[key];
      }
    });

    it('should get matched node', () => {
      const node = document.getElementById('target');
      const res = document.querySelector('div[class=CasE i]');
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const node = document.getElementById('target');
      const res = document.querySelector('div[class=CasE I]');
      assert.deepEqual(res, node, 'result');
    });
  });

  describe('#3432 - https://github.com/jsdom/jsdom/issues/3432', () => {
    const domStr = `<!DOCTYPE html>
    <html>
      <body>
        <button>hi</button>
        <input type="submit" value="weee" id="target" />
      </body>
    </html>`;
    let document;
    beforeEach(() => {
      const dom = jsdom(domStr);
      document = dom.window.document;
      for (const key of globalKeys) {
        global[key] = dom.window[key];
      }
    });
    afterEach(() => {
      document = null;
      for (const key of globalKeys) {
        delete global[key];
      }
    });

    it('should get matched node', () => {
      const node = document.getElementById('target');
      const res = document.querySelector(':is(:is(input), button)');
      assert.deepEqual(res, node, 'result');
    });
  });

  describe('#3506 - https://github.com/jsdom/jsdom/issues/3506', () => {
    const domStr = `<!DOCTYPE html>
    <html>
      <body>
        <p id="target">
          <span>123</span>
        </p>
      </body>
    </html>`;
    let document;
    beforeEach(() => {
      const dom = jsdom(domStr);
      document = dom.window.document;
      for (const key of globalKeys) {
        global[key] = dom.window[key];
      }
    });
    afterEach(() => {
      document = null;
      for (const key of globalKeys) {
        delete global[key];
      }
    });

    it('should get matched node', () => {
      const node = document.getElementById('target');
      const res = document.querySelector('p:has(span)');
      assert.deepEqual(res, node, 'result');
    });
  });

  /* xml related issues */
  describe('#2159 - https://github.com/jsdom/jsdom/issues/2159', () => {
    beforeEach(() => {
      const dom = jsdom('');
      for (const key of globalKeys) {
        global[key] = dom.window[key];
      }
    });
    afterEach(() => {
      for (const key of globalKeys) {
        delete global[key];
      }
    });

    it('should get matched node', () => {
      const domStr = `<?xml version="1.0"?>
        <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" id="target">
          <dc:title></dc:title>
        </cp:coreProperties>`;
      const doc = new DOMParser().parseFromString(domStr, 'application/xml');
      const node = doc.getElementById('target');
      const res = doc.querySelector('coreProperties');
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const domStr = `<?xml version="1.0"?>
        <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" id="target">
          <dc:title></dc:title>
        </cp:coreProperties>`;
      const doc = new DOMParser().parseFromString(domStr, 'application/xml');
      const node = doc.getElementById('target');
      const res = doc.querySelector('*|coreProperties');
      assert.deepEqual(res, node, 'result');
    });
  });

  describe('#2544 - https://github.com/jsdom/jsdom/issues/2544', () => {
    beforeEach(() => {
      const dom = jsdom('');
      for (const key of globalKeys) {
        global[key] = dom.window[key];
      }
    });
    afterEach(() => {
      for (const key of globalKeys) {
        delete global[key];
      }
    });

    it('should get matched node', () => {
      const domStr = `<?xml version="1.0" encoding="UTF-8"?>
      <!DOCTYPE mlt SYSTEM "https://raw.githubusercontent.com/mltframework/mlt/master/src/modules/xml/mlt-xml.dtd">
      <mlt>
        <producer id="producerqduAlody2X0FCLy2exeOG">
          <property name="resource">/mnt/c/xampp/htdocs/videoeditor/WORKER/1234/qduAlody2X0FCLy2exeOG.JPG</property>
          <property name="musecut:mime_type">image/jpeg</property>
        </producer>
        <playlist id="playlist0">
          <entry producer="producerqduAlody2X0FCLy2exeOG" in="0" out="99"/>
        </playlist>
        <tractor id="tractor0">
          <multitrack>
            <track producer="playlist0"/>
          </multitrack>
          <filter mlt_service="greyscale" track="0" id="target"/>
          <filter mlt_service="grayscale" track="0"/>
        </tractor>
        <playlist id="videotrack0">
          <entry producer="tractor0"/>
          <entry producer="producerqduAlody2X0FCLy2exeOG" in="0" out="99"/>
        </playlist>
        <tractor id="main">
          <multitrack>
            <track producer="videotrack0"/>
          </multitrack>
        </tractor>
      </mlt>`;
      const doc = new DOMParser().parseFromString(domStr, 'application/xml');
      const node = doc.getElementById('target');
      const res = doc.querySelector('mlt>tractor[id="tractor0"]>filter[mlt_service="greyscale"][track="0"]');
      assert.deepEqual(res, node, 'result');
    });
  });

  describe('#3015 - https://github.com/jsdom/jsdom/issues/3015', () => {
    beforeEach(() => {
      const dom = jsdom('');
      for (const key of globalKeys) {
        global[key] = dom.window[key];
      }
    });
    afterEach(() => {
      for (const key of globalKeys) {
        delete global[key];
      }
    });

    it('should get matched node', () => {
      const domStr = `<data>
        <_g>
          <b id="target">hey</b>
        </_g>
      </data>`;
      const doc = new DOMParser().parseFromString(domStr, 'text/xml');
      const node = doc.getElementById('target');
      const res = doc.querySelector('data > _g > b');
      assert.deepEqual(res, node, 'result');
      assert.strictEqual(res.textContent, 'hey', 'content');
    });
  });

  describe('#3321 - https://github.com/jsdom/jsdom/issues/3321', () => {
    beforeEach(() => {
      const dom = jsdom('');
      for (const key of globalKeys) {
        global[key] = dom.window[key];
      }
    });
    afterEach(() => {
      for (const key of globalKeys) {
        delete global[key];
      }
    });

    it('should get matched node', () => {
      const domStr = '<a id="9a"><b id="target"/></a>';
      const doc = new DOMParser().parseFromString(domStr, 'application/xml');
      const node = doc.getElementById('target');
      const res = doc.documentElement.querySelector(':scope > b');
      assert.deepEqual(res, node, 'result');
    });
  });

  describe('#3416 - https://github.com/jsdom/jsdom/issues/3416', () => {
    beforeEach(() => {
      const dom = jsdom('');
      for (const key of globalKeys) {
        global[key] = dom.window[key];
      }
    });
    afterEach(() => {
      for (const key of globalKeys) {
        delete global[key];
      }
    });

    it('should get result', () => {
      const domStr = '<Foo><bar>baz</bar></Foo>';
      const doc = new DOMParser().parseFromString(domStr, 'application/xml');
      assert.deepEqual(doc.querySelector('Foo'), doc.documentElement, 'Foo');
      assert.isNull(doc.querySelector('foo'), 'foo');
      assert.deepEqual(doc.querySelector('bar'),
        doc.documentElement.firstChild, 'bar');
      assert.deepEqual(doc.querySelector('Foo bar'),
        doc.documentElement.firstChild, 'Foo bar');
    });
  });

  describe('#3427 - https://github.com/jsdom/jsdom/issues/3427', () => {
    beforeEach(() => {
      const dom = jsdom('');
      for (const key of globalKeys) {
        global[key] = dom.window[key];
      }
    });
    afterEach(() => {
      for (const key of globalKeys) {
        delete global[key];
      }
    });

    it('should get matched node', () => {
      const domStr = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
      <a xmlns:ns="http://schemas.openxmlformats.org/drawingml/2006/main" id="a">
        <ns:b id="nsb">
          <ns:c id="nsc"></ns:c>
        </ns:b>
        <b id="b">
          <c id="c"></c>
        </b>
      </a>`;
      const doc = new DOMParser().parseFromString(domStr, 'application/xml');
      const a = doc.getElementById('a');
      const b = doc.getElementById('b');
      const c = doc.getElementById('c');
      const nsb = doc.getElementById('nsb');
      const nsc = doc.getElementById('nsc');
      assert.isNull(doc.querySelector('ns\\:b'), 'result');
      assert.deepEqual(a.querySelector('ns|b'), nsb, 'result');
      assert.deepEqual(a.querySelector('ns|b ns|c'), nsc, 'result');
      assert.deepEqual([...doc.querySelectorAll('b')], [nsb, b], 'result');
      assert.deepEqual([...doc.querySelectorAll('c')], [nsc, c], 'result');
    });
  });

  describe('#3428 - https://github.com/jsdom/jsdom/issues/3428', () => {
    beforeEach(() => {
      const dom = jsdom('');
      for (const key of globalKeys) {
        global[key] = dom.window[key];
      }
    });
    afterEach(() => {
      for (const key of globalKeys) {
        delete global[key];
      }
    });

    it('should get matched node', () => {
      const domStr = `<root>
        <aB>
          <c id="c"></c>
        </aB>
        <cd>
          <e id="e"></e>
        </cd>
      </root>`;
      const doc = new DOMParser().parseFromString(domStr, 'application/xml');
      assert.isNull(doc.querySelector('ab'), 'lowercased');
      assert.deepEqual(doc.querySelector('aB *'),
        doc.getElementById('c'), 'aB *');
      assert.deepEqual(doc.querySelector('cd *'),
        doc.getElementById('e'), 'cd *');
    });

    it('should get matched node', () => {
      const domStr = `<elem>
        <Test id="target">
          content
          <my-tag id="tag">abc</my-tag>
        </Test>
      </elem>`;
      const doc = new DOMParser().parseFromString(domStr, 'text/xml');
      assert.isNull(doc.querySelector('test'), 'lowercased');
      assert.deepEqual(doc.querySelector('Test'),
        doc.getElementById('target'), 'target');
      assert.deepEqual(doc.querySelector('my-tag'),
        doc.getElementById('tag'), 'tag');
      assert.deepEqual(doc.querySelector('Test > my-tag'),
        doc.getElementById('tag'), 'tag');
      assert.isNull(doc.querySelector('test > my-tag'),
        doc.getElementById('tag'), 'tag');
    });
  });
});
