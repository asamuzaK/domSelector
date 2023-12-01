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

  describe('dom/nodes/ParentNode-querySelector-All.html', () => {
    it('should not match', () => {
      const res = document.querySelectorAll('::slotted(foo)');
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const res = document.querySelectorAll('::slotted(foo');
      assert.deepEqual(res, [], 'result');
    });
  });

  describe('dom/nodes/ParentNode-querySelector-All-content.xht', () => {
    it('should get matched node(s)', () => {
      const html = `
        <ul id="id-ul1">
          <li id="id-li-duplicate"></li>
          <li id="id-li-duplicate"></li>
          <li id="id-li-duplicate"></li>
          <li id="id-li-duplicate"></li>
        </ul>
      `;
      document.body.innerHTML = html;
      const node = document.getElementById('id-ul1');
      const res = document.querySelectorAll('#id-li-duplicate');
      assert.deepEqual(res, [
        node.firstElementChild,
        node.firstElementChild.nextElementSibling,
        node.firstElementChild.nextElementSibling.nextElementSibling,
        node.lastElementChild
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const html = `
        <div id="descendant">
          <div id="descendant-div1" class="descendant-div1">
            <div id="descendant-div2" class="descendant-div2">
              <div id="descendant-div3" class="descendant-div3">
              </div>
            </div>
          </div>
          <div id="descendant-div4" class="descendant-div4"></div>
        </div>
      `;
      document.body.innerHTML = html;
      const node = document.getElementById('descendant-div3');
      const root = document.documentElement;
      const res = root.querySelectorAll('.descendant-div1 .descendant-div3');
      assert.deepEqual(res, [
        node
      ], 'result');
    });
  });

  describe('dom/nodes/ParentNode-querySelector-All.html', () => {
    it('should throw', () => {
      const node = document.createElement('div');
      assert.throws(() => node.querySelector('div:example'), DOMException,
        'Unknown pseudo-class :example');
    });
  });

  describe('css/selectors/any-link-dynamic-001.html', () => {
    it('should get results', () => {
      const elm = document.createElement('a');
      const node = document.createElement('span');
      elm.href = '';
      document.body.appendChild(elm);
      document.body.appendChild(node);
      const res1 = node.matches(':any-link + span');
      assert.isTrue(res1, 'result 1');
      elm.removeAttribute('href');
      const res2 = node.matches(':any-link + span');
      assert.isFalse(res2, 'result 2');
    });
  });

  describe('css/selectors/child-indexed-no-parent.html', () => {
    it('should match', () => {
      const node = document.createElement('p');
      node.id = 'a';
      document.body.appendChild(node);
      const res = node.matches(':root:first-child #a');
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const node = document.createElement('p');
      node.id = 'a';
      document.body.appendChild(node);
      const res = node.matches(':root:nth-child(n) #a');
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const node = document.createElement('p');
      node.id = 'a';
      document.body.appendChild(node);
      const res = node.matches(':root:nth-child(1) #a');
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const node = document.createElement('p');
      node.id = 'a';
      document.body.appendChild(node);
      const res = node.matches(':root:first-of-type #a');
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const node = document.createElement('p');
      node.id = 'a';
      document.body.appendChild(node);
      const res = node.matches(':root:nth-of-type(n) #a');
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const node = document.createElement('p');
      node.id = 'a';
      document.body.appendChild(node);
      const res = node.matches(':root:nth-of-type(1) #a');
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const node = document.createElement('p');
      node.id = 'a';
      document.body.appendChild(node);
      const res = node.matches(':root:last-child #a');
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const node = document.createElement('p');
      node.id = 'a';
      document.body.appendChild(node);
      const res = node.matches(':root:nth-last-child(1) #a');
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const node = document.createElement('p');
      node.id = 'a';
      document.body.appendChild(node);
      const res = node.matches(':root:nth-last-child(n) #a');
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const node = document.createElement('p');
      node.id = 'a';
      document.body.appendChild(node);
      const res = node.matches(':root:last-of-type #a');
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const node = document.createElement('p');
      node.id = 'a';
      document.body.appendChild(node);
      const res = node.matches(':root:nth-last-of-type(n) #a');
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const node = document.createElement('p');
      node.id = 'a';
      document.body.appendChild(node);
      const res = node.matches(':root:nth-last-of-type(1) #a');
      assert.isTrue(res, 'result');
    });

    it('should not match', () => {
      const node = document.createElement('p');
      node.id = 'a';
      document.body.appendChild(node);
      const res = node.matches(':root:nth-last-child(2) #a');
      assert.isFalse(res, 'result');
    });
  });

  describe('css/selectors/dir-pseudo-in-has.html', () => {
    it('should match', () => {
      const html =
        '<section><div id="test" class="ltr"><span></span></div></section>';
      document.body.innerHTML = html;
      const node = document.getElementById('test');
      const res = node.matches('.ltr:has(*:dir(ltr))');
      assert.isTrue(res, 'result');
    });

    it('should not match', () => {
      const html =
        '<section><div id="test" class="ltr"><span></span></div></section>';
      document.body.innerHTML = html;
      const node = document.getElementById('test');
      const res = node.matches('.ltr:has(*:dir(rtl))');
      assert.isFalse(res, 'result');
    });

    it('should match', () => {
      const html =
        '<section><div id="test" dir="ltr" class="ltr"><span></span></div></section>';
      document.body.innerHTML = html;
      const node = document.getElementById('test');
      const res = node.matches('.ltr:has(*:dir(ltr))');
      assert.isTrue(res, 'result');
    });

    it('should not match', () => {
      const html =
        '<section><div id="test" dir="ltr" class="ltr"><span></span></div></section>';
      document.body.innerHTML = html;
      const node = document.getElementById('test');
      const res = node.matches('.ltr:has(*:dir(rtl))');
      assert.isFalse(res, 'result');
    });

    it('should match', () => {
      const html =
        '<section dir="ltr"><div id="test" class="ltr"><span></span></div></section>';
      document.body.innerHTML = html;
      const node = document.getElementById('test');
      const res = node.matches('.ltr:has(*:dir(ltr))');
      assert.isTrue(res, 'result');
    });

    it('should not match', () => {
      const html =
        '<section dir="ltr"><div id="test" class="ltr"><span></span></div></section>';
      document.body.innerHTML = html;
      const node = document.getElementById('test');
      const res = node.matches('.ltr:has(*:dir(rtl))');
      assert.isFalse(res, 'result');
    });

    it('should match', () => {
      const html =
        '<section><div id="test" dir="rtl" class="rtl"><span></span></div></section>';
      document.body.innerHTML = html;
      const node = document.getElementById('test');
      const res = node.matches('.rtl:has(*:dir(rtl))');
      assert.isTrue(res, 'result');
    });

    it('should not match', () => {
      const html =
        '<section><div id="test" dir="rtl" class="rtl"><span></span></div></section>';
      document.body.innerHTML = html;
      const node = document.getElementById('test');
      const res = node.matches('.rtl:has(*:dir(ltr))');
      assert.isFalse(res, 'result');
    });

    it('should match', () => {
      const html =
        '<section dir="rtl"><div id="test" class="rtl"><span></span></div></section>';
      document.body.innerHTML = html;
      const node = document.getElementById('test');
      const res = node.matches('.rtl:has(*:dir(rtl))');
      assert.isTrue(res, 'result');
    });

    it('should not match', () => {
      const html =
        '<section dir="rtl"><div id="test" class="rtl"><span></span></div></section>';
      document.body.innerHTML = html;
      const node = document.getElementById('test');
      const res = node.matches('.rtl:has(*:dir(ltr))');
      assert.isFalse(res, 'result');
    });
  });

  describe('css/selectors/dir-pseudo-on-bdi-element.html', () => {
    it('should get matched node', () => {
      const bdi = document.createElement('bdi');
      assert.isTrue(bdi.matches(':dir(ltr)'), 'ltr');
      assert.isFalse(bdi.matches(':dir(rtl)'), 'rtl');
    });
  });

  describe('css/selectors/dir-pseudo-on-input-element.html', () => {
    const inputText = ['text', 'search', 'url', 'email'];

    it('should get matched node', () => {
      const input = document.createElement('input');
      input.type = 'tel';
      assert.isTrue(input.matches(':dir(ltr)'), 'ltr');
      assert.isFalse(input.matches(':dir(rtl)'), 'rtl');
    });

    it('should get matched node', () => {
      const input = document.createElement('input');
      input.type = 'tel';
      input.setAttribute('dir', 'foo');
      assert.isTrue(input.matches(':dir(ltr)'), 'ltr');
      assert.isFalse(input.matches(':dir(rtl)'), 'rtl');
    });

    it('should get matched node', () => {
      const input = document.createElement('input');
      input.type = 'tel';
      input.setAttribute('dir', 'rtl');
      assert.isFalse(input.matches(':dir(ltr)'), 'ltr');
      assert.isTrue(input.matches(':dir(rtl)'), 'rtl');
    });

    it('should get matched node', () => {
      const input = document.createElement('input');
      input.type = 'tel';
      input.setAttribute('dir', 'RTL');
      assert.isFalse(input.matches(':dir(ltr)'), 'ltr');
      assert.isTrue(input.matches(':dir(rtl)'), 'rtl');
    });

    it('should get matched node', () => {
      const input = document.createElement('input');
      input.type = 'tel';
      input.setAttribute('dir', 'rtl');
      assert.isFalse(input.matches(':dir(ltr)'), 'ltr');
      assert.isTrue(input.matches(':dir(rtl)'), 'rtl');

      input.setAttribute('dir', 'ltr');
      assert.isTrue(input.matches(':dir(ltr)'), 'ltr');
      assert.isFalse(input.matches(':dir(rtl)'), 'rtl');
    });

    it('should get matched node', () => {
      const input = document.createElement('input');
      input.type = 'tel';
      input.setAttribute('dir', 'LTR');
      assert.isTrue(input.matches(':dir(ltr)'), 'ltr');
      assert.isFalse(input.matches(':dir(rtl)'), 'rtl');
    });

    it('should get matched node', () => {
      const input = document.createElement('input');
      input.type = 'tel';
      input.setAttribute('dir', 'auto');
      assert.isTrue(input.matches(':dir(ltr)'), 'ltr');
      assert.isFalse(input.matches(':dir(rtl)'), 'rtl');
    });

    it('should get matched node', () => {
      const input = document.createElement('input');
      input.type = 'tel';
      input.setAttribute('dir', 'auto');
      input.value = '\u05EA';
      assert.isFalse(input.matches(':dir(ltr)'), 'ltr');
      assert.isTrue(input.matches(':dir(rtl)'), 'rtl');
    });

    it('should get matched node', () => {
      const input = document.createElement('input');
      input.type = 'tel';
      input.setAttribute('dir', 'AUTO');
      input.value = '\u05EA';
      assert.isFalse(input.matches(':dir(ltr)'), 'ltr');
      assert.isTrue(input.matches(':dir(rtl)'), 'rtl');
    });

    it('should get matched node', () => {
      const input = document.createElement('input');
      input.type = 'tel';
      input.setAttribute('dir', 'rtl');
      assert.isFalse(input.matches(':dir(ltr)'), 'ltr');
      assert.isTrue(input.matches(':dir(rtl)'), 'rtl');

      input.removeAttribute('dir');
      assert.isTrue(input.matches(':dir(ltr)'), 'ltr');
      assert.isFalse(input.matches(':dir(rtl)'), 'rtl');
    });

    it('should get matched node', () => {
      const input = document.createElement('input');
      input.type = 'tel';
      const container = document.createElement('div');
      container.setAttribute('dir', 'rtl');
      container.appendChild(input);
      document.body.appendChild(container);
      assert.isTrue(input.matches(':dir(ltr)'), 'ltr');
      assert.isFalse(input.matches(':dir(rtl)'), 'rtl');

      input.type = 'text';
      assert.isFalse(input.matches(':dir(ltr)'), 'ltr');
      assert.isTrue(input.matches(':dir(rtl)'), 'rtl');

      input.type = 'tel';
      assert.isTrue(input.matches(':dir(ltr)'), 'ltr');
      assert.isFalse(input.matches(':dir(rtl)'), 'rtl');
    });

    it('should get matched node', () => {
      for (const type of inputText) {
        const input = document.createElement('input');
        input.type = type;
        assert.isTrue(input.matches(':dir(ltr)'), `${type} ltr`);
        assert.isFalse(input.matches(':dir(rtl)'), `${type} rtr`);
      }
    });

    it('should get matched node', () => {
      for (const type of inputText) {
        const input = document.createElement('input');
        input.type = type;
        input.setAttribute('dir', 'ltr');
        assert.isTrue(input.matches(':dir(ltr)'), `${type} ltr`);
        assert.isFalse(input.matches(':dir(rtl)'), `${type} rtr`);
      }
    });

    it('should get matched node', () => {
      for (const type of inputText) {
        const input = document.createElement('input');
        input.type = type;
        input.setAttribute('dir', 'foo');
        assert.isTrue(input.matches(':dir(ltr)'), `${type} ltr`);
        assert.isFalse(input.matches(':dir(rtl)'), `${type} rtl`);
      }
    });

    it('should get matched node', () => {
      for (const type of inputText) {
        const input = document.createElement('input');
        input.type = type;
        input.setAttribute('dir', 'rtl');
        assert.isFalse(input.matches(':dir(ltr)'), `${type} ltr`);
        assert.isTrue(input.matches(':dir(rtl)'), `${type} rtl`);
      }
    });

    it('should get matched node', () => {
      for (const type of inputText) {
        const input = document.createElement('input');
        input.type = type;
        input.setAttribute('dir', 'auto');
        assert.isTrue(input.matches(':dir(ltr)'), `${type} ltr`);
        assert.isFalse(input.matches(':dir(rtl)'), `${type} rtl`);
      }
    });

    it('should get matched node', () => {
      for (const type of inputText) {
        const input = document.createElement('input');
        input.type = type;
        input.setAttribute('dir', 'auto');
        input.value = '\u05EA';
        assert.isFalse(input.matches(':dir(ltr)'), `${type} ltr`);
        assert.isTrue(input.matches(':dir(rtl)'), `${type} rtl`);
      }
    });
  });

  describe('css/selectors/dir-selector-querySelector.html', () => {
    const html = `
      <div id=outer>
        <div id=div1></div>
        <div id=div2 dir=ltr>
          <div id=div2_1></div>
          <div id=div2_2 dir=ltr></div>
          <div id=div2_3 dir=rtl></div>
        </div>
        <div id=div3 dir=rtl>
          <div id=div3_1>
            <div id=div3_1_1></div>
          </div>
          <div id=div3_2 dir=ltr></div>
          <div id=div3_3 dir=rtl></div>
        </div>
        <div id=div4 dir=lol></div>
        <div id=div5 dir=auto></div>
      </div>
    `;

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector(':dir(rtl)');
      assert.deepEqual(res, document.getElementById('div2_3'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector('*:dir(rtl)');
      assert.deepEqual(res, document.getElementById('div2_3'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector('div:dir(ltr)');
      assert.deepEqual(res, document.getElementById('outer'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector('div:dir(ltr):dir(ltr)');
      assert.deepEqual(res, document.getElementById('outer'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector(':dir(rtl)#div3_3');
      assert.deepEqual(res, document.getElementById('div3_3'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector(':nth-child(2):dir(rtl)');
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector(':nth-child(3):dir(rtl)');
      assert.deepEqual(res, document.getElementById('div2_3'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector(':nth-child(4):dir(ltr)');
      assert.deepEqual(res, document.getElementById('div4'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector(':nth-last-child(3):dir(rtl)');
      assert.deepEqual(res, document.getElementById('div3'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector('#div2 :dir(ltr)');
      assert.deepEqual(res, document.getElementById('div2_1'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector(':dir(rtl) div');
      assert.deepEqual(res, document.getElementById('div3_1'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector('div + :dir(ltr)');
      assert.deepEqual(res, document.getElementById('div2'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector(':dir(ltr) + :dir(rtl)');
      assert.deepEqual(res, document.getElementById('div2_3'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector(':dir(rtl) :dir(rtl)');
      assert.deepEqual(res, document.getElementById('div3_1'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector(':dir(rtl) + :dir(ltr)');
      assert.deepEqual(res, document.getElementById('div3_2'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector(':dir(rtl) ~ :dir(rtl)');
      assert.deepEqual(res, document.getElementById('div3_3'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector(':dir(rtl) :dir(ltr)');
      assert.deepEqual(res, document.getElementById('div3_2'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector('* :dir(rtl) *');
      assert.deepEqual(res, document.getElementById('div3_1'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector('div :dir(rtl) div');
      assert.deepEqual(res, document.getElementById('div3_1'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector(':dir(ltr) :dir(rtl) + :dir(ltr)');
      assert.deepEqual(res, document.getElementById('div3_2'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector(':dir(ltr) + :dir(rtl) + * + *');
      assert.deepEqual(res, document.getElementById('div5'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector(':dir(rtl) > * > :dir(rtl)');
      assert.deepEqual(res, document.getElementById('div3_1_1'), 'result');
    });
  });

  describe('css/selectors/has-relative-argument.html', () => {
    const html = `
      <main id=main>
        <div id=d01>
          <div id=d02 class="x">
            <div id=d03 class="a"></div>
            <div id=d04></div>
            <div id=d05 class="b"></div>
          </div>
          <div id=d06 class="x">
            <div id=d07 class="x">
              <div id=d08 class="a"></div>
            </div>
          </div>
          <div id=d09 class="x">
            <div id=d10 class="a">
              <div id=d11 class="b"></div>
            </div>
          </div>
          <div id=d12 class="x">
            <div id=d13 class="a">
              <div id=d14>
                <div id=d15 class="b"></div>
              </div>
            </div>
            <div id=d16 class="b"></div>
          </div>
        </div>
        <div id=d17>
          <div id=d18 class="x"></div>
          <div id=d19 class="x"></div>
          <div id=d20 class="a"></div>
          <div id=d21 class="x"></div>
          <div id=d22 class="a">
            <div id=d23 class="b"></div>
          </div>
          <div id=d24 class="x"></div>
          <div id=d25 class="a">
            <div id=d26>
              <div id=d27 class="b"></div>
            </div>
          </div>
          <div id=d28 class="x"></div>
          <div id=d29 class="a"></div>
          <div id=d30 class="b">
            <div id=d31 class="c"></div>
          </div>
          <div id=d32 class="x"></div>
          <div id=d33 class="a"></div>
          <div id=d34 class="b">
            <div id=d35>
              <div id=d36 class="c"></div>
            </div>
          </div>
          <div id=d37 class="x"></div>
          <div id=d38 class="a"></div>
          <div id=d39 class="b"></div>
          <div id=d40 class="x"></div>
          <div id=d41 class="a"></div>
          <div id=d42></div>
          <div id=d43 class="b">
            <div id=d44 class="x">
              <div id=d45 class="c"></div>
            </div>
          </div>
          <div id=d46 class="x"></div>
          <div id=d47 class="a">
          </div>
        </div>
        <div>
          <div id=d48 class="x">
            <div id=d49 class="x">
              <div id=d50 class="x d">
                <div id=d51 class="x d">
                  <div id=d52 class="x">
                    <div id=d53 class="x e">
                      <div id=d54 class="f"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div id=d55 class="x"></div>
          <div id=d56 class="x d"></div>
          <div id=d57 class="x d"></div>
          <div id=d58 class="x"></div>
          <div id=d59 class="x e"></div>
          <div id=d60 class="f"></div>
        </div>
        <div>
          <div id=d61 class="x"></div>
          <div id=d62 class="x y"></div>
          <div id=d63 class="x y">
            <div id=d64 class="y g">
              <div id=d65 class="y">
                <div id=d66 class="y h">
                  <div id=d67 class="i"></div>
                </div>
              </div>
            </div>
          </div>
          <div id=d68 class="x y">
            <div id=d69 class="x"></div>
            <div id=d70 class="x"></div>
            <div id=d71 class="x y">
              <div id=d72 class="y g">
                <div id=d73 class="y">
                  <div id=d74 class="y h">
                    <div id=d75 class="i"></div>
                  </div>
                </div>
              </div>
            </div>
            <div id=d76 class="x"></div>
            <div id=d77 class="j"><div id=d78><div id=d79></div></div></div>
          </div>
          <div id=d80 class="j"></div>
        </div>
      </main>
    `;
    const sortNodes = arr => arr.map(elm => elm.id).sort();

    it('should get matched node(s)', () => {
      document.body.innerHTML = html;
      const main = document.getElementById('main');
      const res = main.querySelectorAll('.x:has(~ .a > .b)');
      assert.deepEqual(sortNodes(res), sortNodes([
        document.getElementById('d18'),
        document.getElementById('d19'),
        document.getElementById('d21')
      ]), 'result');
    });

    it('should get matched node(s)', () => {
      document.body.innerHTML = html;
      const main = document.getElementById('main');
      const res = main.querySelectorAll('.x:has(~ .a .b)');
      assert.deepEqual(sortNodes(res), sortNodes([
        document.getElementById('d18'),
        document.getElementById('d19'),
        document.getElementById('d21'),
        document.getElementById('d24')
      ]), 'result');
    });

    it('should get matched node(s)', () => {
      document.body.innerHTML = html;
      const main = document.getElementById('main');
      const res = main.querySelectorAll('.x:has(~ .a + .b)');
      assert.deepEqual(sortNodes(res), sortNodes([
        document.getElementById('d18'),
        document.getElementById('d19'),
        document.getElementById('d21'),
        document.getElementById('d24'),
        document.getElementById('d28'),
        document.getElementById('d32'),
        document.getElementById('d37')
      ]), 'result');
    });

    it('should get matched node(s)', () => {
      document.body.innerHTML = html;
      const main = document.getElementById('main');
      const res = main.querySelectorAll('.x:has(~ .a + .b > .c)');
      assert.deepEqual(sortNodes(res), sortNodes([
        document.getElementById('d18'),
        document.getElementById('d19'),
        document.getElementById('d21'),
        document.getElementById('d24'),
        document.getElementById('d28')
      ]), 'result');
    });

    it('should get matched node(s)', () => {
      document.body.innerHTML = html;
      const main = document.getElementById('main');
      const res = main.querySelectorAll('.x:has(~ .a + .b .c)');
      assert.deepEqual(sortNodes(res), sortNodes([
        document.getElementById('d18'),
        document.getElementById('d19'),
        document.getElementById('d21'),
        document.getElementById('d24'),
        document.getElementById('d28'),
        document.getElementById('d32')
      ]), 'result');
    });
  });

  describe('css/selectors/is-where-basic.html', () => {
    const html = `
      <main id=main>
        <div id=a><div id=d></div></div>
        <div id=b><div id=e></div></div>
        <div id=c><div id=f></div></div>
      </main>
    `;
    const sortNodes = arr => arr.map(elm => elm.id).sort();

    // css-tree throws
    xit('should get empty array', () => {
      document.body.innerHTML = html;
      const main = document.getElementById('main');
      const res = main.querySelectorAll(':is()');
      assert.deepEqual(sortNodes(res), sortNodes([]), 'result');
    });

    it('should get matched node(s)', () => {
      document.body.innerHTML = html;
      const main = document.getElementById('main');
      const res = main.querySelectorAll(':is(#a)');
      assert.deepEqual(sortNodes(res), sortNodes([
        document.getElementById('a')
      ]), 'result');
    });

    it('should get matched node(s)', () => {
      document.body.innerHTML = html;
      const main = document.getElementById('main');
      const res = main.querySelectorAll(':is(#a, #f)');
      assert.deepEqual(sortNodes(res), sortNodes([
        document.getElementById('a'),
        document.getElementById('f')
      ]), 'result');
    });

    it('should get matched node(s)', () => {
      document.body.innerHTML = html;
      const main = document.getElementById('main');
      const res = main.querySelectorAll(':is(#a, #c) :where(#a #d, #c #f)');
      assert.deepEqual(sortNodes(res), sortNodes([
        document.getElementById('d'),
        document.getElementById('f')
      ]), 'result');
    });

    it('should get matched node(s)', () => {
      document.body.innerHTML = html;
      const main = document.getElementById('main');
      const res = main.querySelectorAll('#c > :is(#c > #f)');
      assert.deepEqual(sortNodes(res), sortNodes([
        document.getElementById('f')
      ]), 'result');
    });

    it('should get matched node(s)', () => {
      document.body.innerHTML = html;
      const main = document.getElementById('main');
      const res = main.querySelectorAll('#c > :is(#b > #f)');
      assert.deepEqual(sortNodes(res), sortNodes([]), 'result');
    });

    it('should get matched node(s)', () => {
      document.body.innerHTML = html;
      const main = document.getElementById('main');
      const res = main.querySelectorAll('#a div:is(#d)');
      assert.deepEqual(sortNodes(res), sortNodes([
        document.getElementById('d')
      ]), 'result');
    });

    it('should get matched node(s)', () => {
      document.body.innerHTML = html;
      const main = document.getElementById('main');
      const res = main.querySelectorAll(':is(div) > div');
      assert.deepEqual(sortNodes(res), sortNodes([
        document.getElementById('d'),
        document.getElementById('e'),
        document.getElementById('f')
      ]), 'result');
    });

    it('should get matched node(s)', () => {
      document.body.innerHTML = html;
      const main = document.getElementById('main');
      const res = main.querySelectorAll(':is(*) > div');
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
      const res = main.querySelectorAll('div > :where(#e, #f)');
      assert.deepEqual(sortNodes(res), sortNodes([
        document.getElementById('e'),
        document.getElementById('f')
      ]), 'result');
    });

    it('should get matched node(s)', () => {
      document.body.innerHTML = html;
      const main = document.getElementById('main');
      const res = main.querySelectorAll('div > :where(*)');
      assert.deepEqual(sortNodes(res), sortNodes([
        document.getElementById('d'),
        document.getElementById('e'),
        document.getElementById('f')
      ]), 'result');
    });

    it('should get matched node(s)', () => {
      document.body.innerHTML = html;
      const main = document.getElementById('main');
      const res = main.querySelectorAll(':is(*) > :where(*)');
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
      const res = main.querySelectorAll(':is(#a + #b) + :is(#c)');
      assert.deepEqual(sortNodes(res), sortNodes([
        document.getElementById('c')
      ]), 'result');
    });

    it('should get matched node(s)', () => {
      document.body.innerHTML = html;
      const main = document.getElementById('main');
      const res = main.querySelectorAll(':is(#a, #b) + div');
      assert.deepEqual(sortNodes(res), sortNodes([
        document.getElementById('b'),
        document.getElementById('c')
      ]), 'result');
    });
  });

  describe('css/selectors/is-where-not.html', () => {
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

    // css-tree throws
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

    // css-tree throws
    xit('should get matched node', () => {
      document.body.innerHTML = html;
      const container = document.getElementById('container');
      const res = container.querySelectorAll('span:not([class');
      assert.strictEqual(res.length, 1, 'result');
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

  describe('css/selectors/i18n/', () => {
    it('css3-selectors-lang-001.html, should match', () => {
      const html =
        '<div class="test"><div id="box" lang="es">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches('#box:lang(es)');
      assert.isTrue(res, 'result');
    });

    it('css3-selectors-lang-002.html, should match', () => {
      const html =
        '<div class="test" lang="es"><div id="box">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches('#box:lang(es)');
      assert.isTrue(res, 'result');
    });

    it('css3-selectors-lang-004.html, should match', () => {
      const html =
        '<div class="test"><div id="box" lang="ES">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches('#box:lang(es)');
      assert.isTrue(res, 'result');
    });

    it('css3-selectors-lang-005.html, should match', () => {
      const html =
        '<div class="test"><div id="box" lang="es-MX">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches('#box:lang(es)');
      assert.isTrue(res, 'result');
    });

    it('css3-selectors-lang-006.html, should not match', () => {
      const html =
        '<div class="test"><div id="box" lang="es">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches('#box:lang(es-MX)');
      assert.isFalse(res, 'result');
    });

    it('css3-selectors-lang-007.html, should not match', () => {
      const html =
        '<div class="test"><div id="box" lang="mx-es">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches('#box:lang(es-MX)');
      assert.isFalse(res, 'result');
    });

    it('css3-selectors-lang-008.html, should match', () => {
      const html =
        '<div class="test"><div id="box" lang="en-GB">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches('#box:lang(en-GB)');
      assert.isTrue(res, 'result');
    });

    it('css3-selectors-lang-009.html, should match', () => {
      const html =
        '<div class="test"><div id="box" lang="en-GB-scouse">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches('#box:lang(en-GB)');
      assert.isTrue(res, 'result');
    });

    it('css3-selectors-lang-010.html, should not match', () => {
      const html =
        '<div class="test"><div id="box" lang="en-US">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches('#box:lang(en-GB)');
      assert.isFalse(res, 'result');
    });

    it('css3-selectors-lang-011.html, should match', () => {
      const html =
        '<div class="test"><div id="box" lang="az-Arab-IR">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches('#box:lang(az-Arab-IR)');
      assert.isTrue(res, 'result');
    });

    it('css3-selectors-lang-012.html, should not match', () => {
      const html =
        '<div class="test"><div id="box" lang="az-IR">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches('#box:lang(az-Arab-IR)');
      assert.isFalse(res, 'result');
    });

    it('css3-selectors-lang-014.html, should match', () => {
      const html =
        '<div class="test"><div id="box" lang="cs-Latn-CZ">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches('#box:lang(cs-CZ)');
      assert.isTrue(res, 'result');
    });

    it('css3-selectors-lang-015.html, should match', () => {
      const html =
        '<div class="test"><div id="box" lang="az-arab-IR">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches('#box:lang(az-Arab-IR)');
      assert.isTrue(res, 'result');
    });

    it('css3-selectors-lang-016.html, should not match', () => {
      const html =
        '<div class="test"><div id="box" xml:lang="es">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches('#box:lang(es)');
      assert.isFalse(res, 'result');
    });

    it('css3-selectors-lang-021.html, should match', () => {
      const html =
        '<div class="test"><div id="box" lang="es">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang|='es']");
      assert.isTrue(res, 'result');
    });

    it('css3-selectors-lang-022.html, should not match', () => {
      const html =
        '<div class="test" lang="es"><div id="box">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang|='es']");
      assert.isFalse(res, 'result');
    });

    it('css3-selectors-lang-024.html, should match', () => {
      const html =
        '<div class="test"><div id="box" lang="ES">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang|='es']");
      assert.isTrue(res, 'result');
    });

    it('css3-selectors-lang-025.html, should match', () => {
      const html =
        '<div class="test"><div id="box" lang="es-MX">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang|='es']");
      assert.isTrue(res, 'result');
    });

    it('css3-selectors-lang-026.html, should not match', () => {
      const html =
        '<div class="test"><div id="box" lang="es">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang|='es-MX']");
      assert.isFalse(res, 'result');
    });

    it('css3-selectors-lang-027.html, should not match', () => {
      const html =
        '<div class="test"><div id="box" lang="mx-es">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang|='es']");
      assert.isFalse(res, 'result');
    });

    it('css3-selectors-lang-028.html, should match', () => {
      const html =
        '<div class="test"><div id="box" lang="en-GB">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang|='en-GB']");
      assert.isTrue(res, 'result');
    });

    it('css3-selectors-lang-029.html, should match', () => {
      const html =
        '<div class="test"><div id="box" lang="en-GB-scouse">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang|='en-GB']");
      assert.isTrue(res, 'result');
    });

    it('css3-selectors-lang-030.html, should not match', () => {
      const html =
        '<div class="test"><div id="box" lang="en-US">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang|='en-GB']");
      assert.isFalse(res, 'result');
    });

    it('css3-selectors-lang-031.html, should match', () => {
      const html =
        '<div class="test"><div id="box" lang="az-Arab-IR">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang|='az-Arab-IR']");
      assert.isTrue(res, 'result');
    });

    it('css3-selectors-lang-032.html, should not match', () => {
      const html =
        '<div class="test"><div id="box" lang="az-IR">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang|='az-Arab-IR']");
      assert.isFalse(res, 'result');
    });

    it('css3-selectors-lang-034.html, should not match', () => {
      const html =
        '<div class="test"><div id="box" lang="cs-Latn-CZ">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang|='cs-CZ']");
      assert.isFalse(res, 'result');
    });

    it('css3-selectors-lang-035.html, should match', () => {
      const html =
        '<div class="test"><div id="box" lang="az-arab-IR">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang|='az-Arab-IR']");
      assert.isTrue(res, 'result');
    });

    it('css3-selectors-lang-036.html, should not match', () => {
      const html =
        '<div class="test"><div id="box" xml:lang="es">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang|='es']");
      assert.isFalse(res, 'result');
    });

    it('css3-selectors-lang-041.html, should match', () => {
      const html =
        '<div class="test"><div id="box" lang="es">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang='es']");
      assert.isTrue(res, 'result');
    });

    it('css3-selectors-lang-042.html, should not match', () => {
      const html =
        '<div class="test" lang="es"><div id="box">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang='es']");
      assert.isFalse(res, 'result');
    });

    it('css3-selectors-lang-044.html, should match', () => {
      const html =
        '<div class="test"><div id="box" lang="ES">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang='es']");
      assert.isTrue(res, 'result');
    });

    it('css3-selectors-lang-045.html, should not match', () => {
      const html =
        '<div class="test"><div id="box" lang="es-MX">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang='es']");
      assert.isFalse(res, 'result');
    });

    it('css3-selectors-lang-046.html, should not match', () => {
      const html =
        '<div class="test"><div id="box" lang="es">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang='es-MX']");
      assert.isFalse(res, 'result');
    });

    it('css3-selectors-lang-047.html, should not match', () => {
      const html =
        '<div class="test"><div id="box" lang="mx-es">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang='es']");
      assert.isFalse(res, 'result');
    });

    it('css3-selectors-lang-048.html, should match', () => {
      const html =
        '<div class="test"><div id="box" lang="en-GB">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang='en-GB']");
      assert.isTrue(res, 'result');
    });

    it('css3-selectors-lang-049.html, should not match', () => {
      const html =
        '<div class="test"><div id="box" lang="en-GB-scouse">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang='en-GB']");
      assert.isFalse(res, 'result');
    });

    it('css3-selectors-lang-050.html, should not match', () => {
      const html =
        '<div class="test"><div id="box" lang="en-US">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang='en-GB']");
      assert.isFalse(res, 'result');
    });

    it('css3-selectors-lang-051.html, should match', () => {
      const html =
        '<div class="test"><div id="box" lang="az-Arab-IR">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang='az-Arab-IR']");
      assert.isTrue(res, 'result');
    });

    it('css3-selectors-lang-052.html, should not match', () => {
      const html =
        '<div class="test"><div id="box" lang="az-IR">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang='az-Arab-IR']");
      assert.isFalse(res, 'result');
    });

    it('css3-selectors-lang-054.html, should not match', () => {
      const html =
        '<div class="test"><div id="box" lang="cs-Latn-CZ">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang='cs-CZ']");
      assert.isFalse(res, 'result');
    });

    it('css3-selectors-lang-055.html, should match', () => {
      const html =
        '<div class="test"><div id="box" lang="az-arab-IR">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang='az-Arab-IR']");
      assert.isTrue(res, 'result');
    });

    it('css3-selectors-lang-056.html, should not match', () => {
      const html =
        '<div class="test"><div id="box" xml:lang="es">&#xA0;</div></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('box');
      const res = node.matches("#box[lang='es']");
      assert.isFalse(res, 'result');
    });
  });

  describe('css/selectors/invalidation/', () => {
    it('host-pseudo-class-in-has.html, should match', () => {
      const parent = document.createElement('div');
      const host = document.createElement('div');
      host.id = 'host';
      host.classList.add('a');
      parent.id = 'host_parent';
      parent.appendChild(host);
      document.body.appendChild(parent);
      const shadow = host.attachShadow({ mode: 'open' });
      shadow.innerHTML = `
        <div class="foo">
          <div id="subject1" class="subject">
            <div class="bar"></div>
          </div>
        </div>
        <div>
          <div class="foo">
            <div id="subject2" class="subject">
              <div class="bar"></div>
            </div>
          </div>
        </div>
      `;
      const node1 = shadow.getElementById('subject1');
      const node2 = shadow.getElementById('subject2');
      assert.isTrue(node1.matches('.subject:has(:is(:host(.a) > .foo .bar))'),
        'result1');
      assert.isTrue(node2.matches('.subject:has(:is(:host(.a) .bar))'),
        'result2');
    });
  });

  describe('css/selectors/selectors-4/', () => {
    it('lang-007.html, should match', () => {
      const html =
        '<div class="test"><span id="target" lang="fr-CH">This should be green</span></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('target');
      const res = node.matches(':lang("*-CH")');
      assert.isTrue(res, 'result');
    });

    it('lang-008.html, should match', () => {
      const html =
        '<div class="test"><span id="target" lang="fr-Latn-FR">This should be green</span></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('target');
      const res = node.matches(':lang("*-Latn")');
      assert.isTrue(res, 'result');
    });

    it('lang-009.html, should match', () => {
      const html =
        '<div class="test"><span id="target" lang="fr-Latn-FR">This should be green</span></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('target');
      const res = node.matches(':lang("fr-FR")');
      assert.isTrue(res, 'result');
    });

    it('lang-010.html, should match', () => {
      const html =
        '<div class="test"><span id="target" lang="fr-Latn-FR">This should be green</span></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('target');
      const res = node.matches(':lang("*-FR")');
      assert.isTrue(res, 'result');
    });

    // FIXME: not yet supported
    xit('lang-011.html, should match', () => {
      const html =
        '<div class="test"><span id="target" lang="fr-Latn-FR">This should be green</span></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('target');
      const res = node.matches(':lang("fr", "nl", "de")');
      assert.isTrue(res, 'result');
    });

    // FIXME: not yet supported
    xit('lang-012.html, should match', () => {
      const html =
        '<div class="test"><span id="target" lang="fr-Latn-FR">This should be green</span></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('target');
      const res = node.matches(':lang(fr, nl, de)');
      assert.isTrue(res, 'result');
    });

    // FIXME: not yet supported
    xit('lang-013.html, should not match', () => {
      const html =
        '<div class="test"><span id="target" lang="fr-Latn-FR">This should be green</span></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('target');
      const res = node.matches(':lang(fr, nl, 0, de)');
      assert.isFalse(res, 'result');
    });

    // FIXME: CSSTree throws
    xit('lang-014.html, should not match', () => {
      const html =
        '<div class="test"><span id="target" lang="0">This should be green</span></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('target');
      const res = node.matches(':lang(0)');
      assert.isFalse(res, 'result');
    });

    it('lang-015.html, should match', () => {
      const html =
        '<div class="test"><span id="target" lang="fr-Latn-FR">This should be green</span></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('target');
      const res = node.matches(':lang(\\*-FR)');
      assert.isTrue(res, 'result');
    });

    it('lang-016.html, should match', () => {
      const html =
        '<div class="test"><span id="target" lang="fr-FR-x-foobar">This should be green</span></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('target');
      const res = node.matches(':lang(fr)');
      assert.isTrue(res, 'result');
    });

    it('lang-017.html, should match', () => {
      const html =
        '<div class="test"><span id="target" lang="fr-Latn-FR-x-foobar">This should be green</span></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('target');
      const res = node.matches(':lang(fr-x-foobar)');
      assert.isTrue(res, 'result');
    });

    it('lang-018.html, should match', () => {
      const html =
        '<div class="test"><span id="target" lang="fr-Latn-FR-x-foobar">This should be green</span></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('target');
      const res = node.matches(':lang("*-x-foobar")');
      assert.isTrue(res, 'result');
    });

    it('lang-019.html, should not match', () => {
      const html =
        '<div class="test"><span id="target" lang="fr">This should be green</span></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('target');
      const res = node.matches(':lang("fr-x-foobar")');
      assert.isFalse(res, 'result');
    });

    it('lang-020.html, should match', () => {
      const html =
        '<div class="test"><span id="target" lang="iw-ase-jpan-basiceng">This should be green</span></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('target');
      const res = node.matches(':lang("iw")');
      assert.isTrue(res, 'result');
    });

    it('lang-021.html, should match', () => {
      const html =
        '<div class="test" lang="en-GB-oed"><span><span id="target">This should be green</span></span></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('target');
      const res = node.matches('span span:lang("*-gb")');
      assert.isTrue(res, 'result');
    });

    it('lang-022.html, should match', () => {
      const html =
        '<div class="test"><span id="target" lang="i-navajo">This should be green</span></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('target');
      const res = node.matches(':lang("i-navajo")');
      assert.isTrue(res, 'result');
    });

    it('lang-023.html, should match', () => {
      const html =
        '<div class="test"><span id="target" lang="x-lojban">This should be green</span></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('target');
      const res = node.matches(':lang("x")');
      assert.isTrue(res, 'result');
    });

    it('lang-024.html, should match', () => {
      const html =
        '<div class="test"><span id="target" lang="art-lojban">This should be green</span></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('target');
      const res = node.matches(':lang("art")');
      assert.isTrue(res, 'result');
    });

    it('lang-025.html, should match', () => {
      const html =
        '<div class="test"><span id="target" lang="art-x-lojban">This should be green</span></div>';
      document.body.innerHTML = html;
      const node = document.getElementById('target');
      const res = node.matches(':lang("art")');
      assert.isTrue(res, 'result');
    });
  });

  describe('css/css-scoping/host-dom-001.html', () => {
    it('should not match', () => {
      const node = document.createElement('div');
      node.id = 'host';
      document.body.appendChild(node);
      const root = node.attachShadow({ mode: 'open' });
      root.innerHTML = '<div></div>';
      const res = node.matches(':host');
      assert.isFalse(res, 'result');
    });

    it('should match', () => {
      const node = document.createElement('div');
      node.id = 'host';
      document.body.appendChild(node);
      const root = node.attachShadow({ mode: 'open' });
      root.innerHTML = '<div></div>';
      const res = root.firstElementChild.matches(':host div');
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const node = document.createElement('div');
      node.id = 'host';
      document.body.appendChild(node);
      const root = node.attachShadow({ mode: 'open' });
      root.innerHTML = '<div></div>';
      const res = root.querySelector(':host div');
      assert.deepEqual(res, root.firstElementChild, 'result');
    });
  });

  describe('css/css-scoping/host-is-001.html', () => {
    it('should match', () => {
      const host = document.createElement('div');
      host.attachShadow({ mode: 'open' }).innerHTML = `
        <div class="nested"></div>
      `;
      const node = host.shadowRoot.firstElementChild;
      const res = node.matches(':is(:host) .nested');
      assert.isTrue(res, 'result');
    });
  });

  describe('css/css-scoping/host-is-003.html', () => {
    it('should not match', () => {
      const host = document.createElement('div');
      host.id = 'host';
      host.attachShadow({ mode: 'open' }).innerHTML = `
        <div class="nested"></div>
      `;
      const node = host.shadowRoot.firstElementChild;
      const res = node.matches(':is(:host(#not-host), #host) .nested');
      assert.isFalse(res, 'result');
    });

    it('should match', () => {
      const host = document.createElement('div');
      host.id = 'host';
      host.attachShadow({ mode: 'open' }).innerHTML = `
        <div class="nested"></div>
      `;
      const node = host.shadowRoot.firstElementChild;
      const res = node.matches(':is(:host(#host)) .nested');
      assert.isTrue(res, 'result');
    });
  });

  describe('css/css-scoping/host-multiple-001.html', () => {
    it('should match', () => {
      const host = document.createElement('div');
      host.id = 'host';
      host.attachShadow({ mode: 'open' }).innerHTML = `
        <div class="nested"></div>
      `;
      const node = host.shadowRoot.firstElementChild;
      const res = node.closest(':host:host');
      assert.deepEqual(res, host.shadowRoot, 'result');
    });
  });

  describe('css/css-scoping/slotted-matches.html', () => {
    it('should not match', () => {
      const host = document.createElement('div');
      const node = document.createElement('div');
      node.id = 'slotted';
      host.id = 'host';
      host.appendChild(node);
      document.body.appendChild(host);
      host.attachShadow({ mode: 'open' }).innerHTML = '<slot></slot>';
      const res = node.matches('::slotted(div)');
      assert.isFalse(res, 'result');
    });
  });

  describe('html/semantics/forms/the-output-element/output-validity.html', () => {
    it('should not match', () => {
      const html = "<output id='output_test'></output>";
      document.body.innerHTML = html;
      const node = document.getElementById('output_test');
      const res = node.matches(':valid');
      assert.isFalse(res, 'result');
    });

    it('should not match', () => {
      const html = "<output id='output_test'></output>";
      document.body.innerHTML = html;
      const node = document.getElementById('output_test');
      const res = node.matches(':invalid');
      assert.isFalse(res, 'result');
    });
  });
});
