/**
 * wpt.test.js
 */

/* api */
import { assert } from 'chai';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, it, xit } from 'mocha';

/* test */
import {
  closest, matches, querySelector, querySelectorAll
} from '../src/index.js';

const globalKeys = ['DOMParser'];

describe('local wpt test cases', () => {
  const domStr =
    '<!doctype html><html lang="en"><head></head><body></body></html>';
  const domOpt = {
    runScripts: 'dangerously',
    url: 'http://localhost/',
    beforeParse: window => {
      window.Element.prototype.matches = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        const res = matches(selector, this);
        return res;
      };
      window.Element.prototype.closest = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        const res = closest(selector, this);
        return res ?? null;
      };
      window.Document.prototype.querySelector = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        const res = querySelector(selector, this);
        return res ?? null;
      };
      window.DocumentFragment.prototype.querySelector = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        const res = querySelector(selector, this);
        return res ?? null;
      };
      window.Element.prototype.querySelector = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        const res = querySelector(selector, this);
        return res ?? null;
      };
      window.Document.prototype.querySelectorAll = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        const res = querySelectorAll(selector, this);
        return res;
      };
      window.DocumentFragment.prototype.querySelectorAll = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        const res = querySelectorAll(selector, this);
        return res;
      };
      window.Element.prototype.querySelectorAll = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        const res = querySelectorAll(selector, this);
        return res;
      };
    }
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

  describe('css/selectors/not-complex.html', () => {
    const html = `
      <main id=main>
        <div id=a><div id=d></div></div>
        <div id=b><div id=e></div></div>
        <div id=c><div id=f></div></div>
      </main>
    `;
    const sortNodes = arr => arr.map(elm => elm.id).sort();

    it('should get matched node(s)', () => {
      document.body.innerHTML = html;
      const main = document.getElementById('main');
      const res =
        main.querySelectorAll(':not(div + div + div, div + div > div)');
      assert.deepEqual(sortNodes(res), sortNodes([
        document.getElementById('a'),
        document.getElementById('b'),
        document.getElementById('d')
      ]), 'result');
    });

    it('should get matched node(s)', () => {
      document.body.innerHTML = html;
      const main = document.getElementById('main');
      const res = main.querySelectorAll(':not(:not(div))');
      assert.deepEqual(sortNodes(res), sortNodes([
        document.getElementById('a'),
        document.getElementById('b'),
        document.getElementById('c'),
        document.getElementById('d'),
        document.getElementById('e'),
        document.getElementById('f')
      ]), 'result');
    });

    it('should get matched node(s)', () => {
      document.body.innerHTML = html;
      const main = document.getElementById('main');
      const res = main.querySelectorAll(':not(:hover div)');
      assert.deepEqual(sortNodes(res), sortNodes([
        document.getElementById('a'),
        document.getElementById('b'),
        document.getElementById('c'),
        document.getElementById('d'),
        document.getElementById('e'),
        document.getElementById('f')
      ]), 'result');
    });
  });

  describe('css/selectors/not-complex.html', () => {
    const html = `
      <main id=main>
        <div id=a><div id=d></div></div>
        <div id=b><div id=e></div></div>
        <div id=c><div id=f></div></div>
      </main>
    `;
    const sortNodes = arr => arr.map(elm => elm.id).sort();

    it('should get matched node(s)', () => {
      document.body.innerHTML = html;
      const main = document.getElementById('main');
      const res = main.querySelectorAll(':not(:is(svg|div))');
      assert.deepEqual(sortNodes(res), sortNodes([
        document.getElementById('a'),
        document.getElementById('b'),
        document.getElementById('c'),
        document.getElementById('d'),
        document.getElementById('e'),
        document.getElementById('f')
      ]), 'result');
    });
  });

  describe('css/selectors/missing-right-token.html', () => {
    const html = `
      <div id="container">
        <span></span>
        <span class="cls"></span>
      </div>
    `;

    it('should get matched node', () => {
      const node = document.createElement('meta');
      const head = document.body.previousElementSibling;
      node.setAttribute('charset', 'utf-8');
      head.append(node);
      const res = document.querySelector('meta[charset="utf-8"]');
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const node = document.createElement('meta');
      const head = document.body.previousElementSibling;
      node.setAttribute('charset', 'utf-8');
      head.append(node);
      const res = document.querySelector('meta[charset="utf-8"');
      assert.deepEqual(res, node, 'result');
    });

    // fails, upstream issue
    xit('should get matched node', () => {
      const node = document.createElement('meta');
      const head = document.body.previousElementSibling;
      node.setAttribute('charset', 'utf-8');
      head.append(node);
      const res = document.querySelector('meta[charset="utf-8');
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const container = document.getElementById('container');
      const res = container.querySelectorAll('span:not([class])');
      assert.strictEqual(res.length, 1, 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const container = document.getElementById('container');
      const res = container.querySelectorAll('span:not([class]');
      assert.strictEqual(res.length, 1, 'result');
    });

    // fails, upstream issue
    xit('should get matched node', () => {
      document.body.innerHTML = html;
      const container = document.getElementById('container');
      const res = container.querySelectorAll('span:not([class');
      assert.strictEqual(res.length, 1, 'result');
    });
  });
});
