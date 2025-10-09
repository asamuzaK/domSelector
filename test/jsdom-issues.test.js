/**
 * jsdom-issues.test.js
 */

/* api */
import { strict as assert } from 'node:assert';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, it } from 'mocha';

/* test */
import { DOMSelector } from '../src/index.js';

/**
 * monkey patch jsdom
 * @param {string} str - dom string
 * @returns {object} - patched JSDOM instance
 */
const jsdom = (str = '') => {
  const dom = new JSDOM(str, {
    runScripts: 'dangerously',
    url: 'http://localhost/',
    beforeParse: window => {
      const domSelector = new DOMSelector(window);

      const matches = domSelector.matches.bind(domSelector);
      window.Element.prototype.matches = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return matches(selector, this);
      };

      const closest = domSelector.closest.bind(domSelector);
      window.Element.prototype.closest = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return closest(selector, this);
      };

      const querySelector = domSelector.querySelector.bind(domSelector);
      window.Document.prototype.querySelector = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return querySelector(selector, this);
      };
      window.DocumentFragment.prototype.querySelector = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return querySelector(selector, this);
      };
      window.Element.prototype.querySelector = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return querySelector(selector, this);
      };

      const querySelectorAll = domSelector.querySelectorAll.bind(domSelector);
      window.Document.prototype.querySelectorAll = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return querySelectorAll(selector, this);
      };
      window.DocumentFragment.prototype.querySelectorAll = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return querySelectorAll(selector, this);
      };
      window.Element.prototype.querySelectorAll = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return querySelectorAll(selector, this);
      };
    }
  });
  return dom;
};

describe('jsdom issues tagged with `selectors` label', () => {
  describe('#1163 - https://github.com/jsdom/jsdom/issues/1163', () => {
    const domStr = `<!DOCTYPE html>
    <html>
      <body>
        <div></div>
        <div title="" id="target"></div>
        <div title="foo"></div>
      </body>
    </html>`;
    let document;
    beforeEach(() => {
      const dom = jsdom(domStr);
      document = dom.window.document;
    });
    afterEach(() => {
      document = null;
    });

    it('should get matched node', () => {
      const node = document.getElementById('target');
      const res = document.querySelectorAll('div[title=""]');
      assert.deepEqual(res, [node], 'result');
    });

    it('should get matched node', () => {
      const node = document.getElementById('target');
      const res = document.querySelectorAll('div[title][title=""]');
      assert.deepEqual(res, [node], 'result');
    });
  });

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
    });
    afterEach(() => {
      document = null;
    });

    it('should get matched node', () => {
      const node = document.getElementById('target');
      const res = document.querySelector('svg:not(:root)');
      assert.deepEqual(res, node, 'result');
    });
  });

  describe('#1846 - https://github.com/jsdom/jsdom/issues/1846', () => {
    const domStr = '<!DOCTYPE html><html><body></body></html>';
    let document;
    beforeEach(() => {
      const dom = jsdom(domStr);
      document = dom.window.document;
    });
    afterEach(() => {
      document = null;
    });

    it('should get matched node', () => {
      const node = document.createElementNS('urn:ns', 'h');
      const res = node.matches('h');
      assert.strictEqual(res, true, 'result');
    });

    it('should get matched node', () => {
      const node = document.createElementNS('urn:ns', 'h');
      const res = node.matches('*|h');
      assert.strictEqual(res, true, 'result');
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
    });
    afterEach(() => {
      document = null;
    });

    it('should get matched node', () => {
      const node = document.getElementById('target');
      const res = document.querySelectorAll('svg.test');
      assert.deepEqual(res, [node], 'result');
    });
  });

  describe('#2247 - https://github.com/jsdom/jsdom/issues/2247', () => {
    const domStr = '<!DOCTYPE html><html><body></body></html>';
    let document;
    beforeEach(() => {
      const dom = jsdom(domStr);
      document = dom.window.document;
    });
    afterEach(() => {
      document = null;
    });

    it('should get matched node', () => {
      const node = document.createElementNS('', 'element');
      const res = node.matches('element');
      assert.strictEqual(res, true, 'result');
    });
  });

  describe('#2359 - https://github.com/jsdom/jsdom/issues/2359', () => {
    const domStr = `<!DOCTYPE html>
    <html>
      <body>
        <div id="d1">
          <p id="p1"><span id="s1">hello</span></p>
          <p id="p2">hey</p>
          <div id="d2">div</div>
        </div>
      </body>
    </html>`;
    let document;
    beforeEach(() => {
      const dom = jsdom(domStr);
      document = dom.window.document;
    });
    afterEach(() => {
      document = null;
    });

    it('should get matched node(s)', () => {
      const div = document.getElementById('d1');
      const p = document.getElementById('p1');
      assert.deepEqual(div.querySelector(':scope > p'), p, 'result');
      assert.deepEqual(div.querySelector(':scope > span'), null, 'result');
    });

    it('should get matched node(s)', () => {
      const div = document.getElementById('d1');
      const p = document.getElementById('p1');
      const p2 = document.getElementById('p2');
      assert.deepEqual(div.querySelectorAll(':scope > p'), [p, p2], 'result');
      assert.deepEqual(div.querySelectorAll(':scope > span'), [], 'result');
    });

    it('should get matched node', () => {
      const div = document.getElementById('d1');
      const p = document.getElementById('p1');
      assert.deepEqual(
        div.querySelector(':scope > p, :scope > div'),
        p,
        'result'
      );
    });

    it('should get matched node', () => {
      const div = document.getElementById('d1');
      const div2 = document.getElementById('d2');
      const p = document.getElementById('p1');
      const p2 = document.getElementById('p2');
      assert.deepEqual(
        div.querySelectorAll(':scope > p, :scope > div'),
        [p, p2, div2],
        'result'
      );
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
    });
    afterEach(() => {
      document = null;
    });

    it('should not match', () => {
      const refPoint = document.getElementById('refPoint');
      const res = refPoint.querySelector(':scope > span');
      assert.deepEqual(res, null, 'result');
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
    });
    afterEach(() => {
      document = null;
    });

    it('should get result', () => {
      const node = document.getElementById('target');
      const item = document.getElementById('item');
      item.focus();
      const res = node.matches(':focus-within');
      assert.strictEqual(res, true, 'result');
    });

    it('should get matched node', () => {
      const node = document.getElementById('target');
      const item = document.getElementById('item');
      item.focus();
      const res = node.parentNode.querySelector(':focus-within');
      assert.deepEqual(res, node, 'result');
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
    });
    afterEach(() => {
      document = null;
    });

    it('should get result', () => {
      const refPoint = document.getElementById('refPoint');
      const li1 = document.getElementById('li1');
      const li2 = document.getElementById('li2');
      const res = refPoint.querySelectorAll(':scope > li');
      const li1content = li1.textContent.trim();
      const li2content = li2.textContent.trim();
      assert.deepEqual(res, [li1, li2], 'result');
      assert.strictEqual(li1content, 'Alpha', 'content');
      // NOTE: sample in #3067 seems invalid, should include Gamma, Delta
      assert.notEqual(li2content, 'Beta', 'content');
      assert.strictEqual(
        /^Beta\n\s+Gamma\n\s+Delta$/.test(li2content),
        true,
        'content'
      );
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
    });
    afterEach(() => {
      document = null;
    });

    it('should get result', () => {
      const container = document.getElementById('container');
      const res = container.querySelectorAll(':not(svg, svg *)');
      assert.deepEqual(
        res,
        [
          document.getElementById('container-inner-1'),
          document.getElementById('container-inner-2'),
          document.getElementById('p'),
          document.getElementById('button')
        ],
        'result'
      );
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
    });
    afterEach(() => {
      document = null;
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
    });
    afterEach(() => {
      document = null;
    });

    it('should get matched node', () => {
      const node = document.getElementById('target');
      const res = document.querySelector(':is(:is(input))');
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
    });
    afterEach(() => {
      document = null;
    });

    it('should get matched node', () => {
      const node = document.getElementById('target');
      const res = document.querySelector('p:has(span)');
      assert.deepEqual(res, node, 'result');
    });
  });

  describe('#3544 - https://github.com/jsdom/jsdom/issues/3544', () => {
    let document;
    beforeEach(() => {
      const dom = jsdom();
      document = dom.window.document;
    });
    afterEach(() => {
      document = null;
    });

    it('should get matched node(s)', () => {
      const body = document.body;
      const div = document.createElement('div');
      const ul = document.createElement('ul');
      const li = document.createElement('li');
      ul.appendChild(li);
      div.appendChild(ul);
      body.appendChild(div);
      const res1 = div.querySelectorAll('UL');
      const res2 = div.querySelectorAll('ul');
      const res3 = div.querySelectorAll('ul > li');
      const res4 = div.querySelectorAll('UL > LI');
      assert.deepEqual(res1, [ul], 'result1');
      assert.deepEqual(res2, [ul], 'result2');
      assert.deepEqual(res3, [li], 'result3');
      assert.deepEqual(res4, [li], 'result4');
    });

    it('should get matched node(s)', () => {
      const body = document.body;
      const div = document.createElement('div');
      const ul = document.createElement('ul');
      const li = document.createElement('li');
      ul.appendChild(li);
      div.appendChild(ul);
      body.appendChild(div);
      const res1 = ul.matches('UL');
      const res2 = ul.matches('ul');
      const res3 = li.matches('ul > li');
      const res4 = li.matches('UL > LI');
      assert.strictEqual(res1, true, 'result1');
      assert.strictEqual(res2, true, 'result2');
      assert.strictEqual(res3, true, 'result3');
      assert.strictEqual(res4, true, 'result4');
    });
  });

  describe('#3666 - https://github.com/jsdom/jsdom/issues/3666', () => {
    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Document</title>
        </head>
        <body>
          <p id="p">One</p>
          <span id="span">Two</span>
        </body>
      </html>
    `;
    let document;
    beforeEach(() => {
      const dom = jsdom(html);
      document = dom.window.document;
    });
    afterEach(() => {
      document = null;
    });

    it('should get matched node', () => {
      const node = document.getElementById('p');
      const res = document.querySelector('p, span');
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const node = document.getElementById('span');
      const res = document.querySelector('div, span');
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const node = document.getElementById('span');
      const res = document.querySelector('span, div');
      assert.deepEqual(res, node, 'result');
    });
  });

  describe('#3686 - https://github.com/jsdom/jsdom/issues/3686', () => {
    let document;
    beforeEach(() => {
      const dom = jsdom('');
      document = dom.window.document;
    });
    afterEach(() => {
      document = null;
    });

    it('should not throw', () => {
      assert.doesNotThrow(() => document.querySelector(':is([a],b):not(.c)'));
    });

    it('should not throw', () => {
      assert.doesNotThrow(() => document.querySelector(':is(a,[b]):not(.c)'));
    });

    it('should not throw', () => {
      assert.doesNotThrow(() => document.querySelector(':is(a,b):not(.c)'));
    });

    it('should not throw', () => {
      assert.doesNotThrow(() => document.querySelector(':is(a,b):not([c])'));
    });

    it('should not throw', () => {
      assert.doesNotThrow(() => document.querySelector(':is(a):not([b],.c)'));
    });

    it('should not throw', () => {
      assert.doesNotThrow(() => document.querySelector(':is(a,[b])'));
    });

    it('should not throw', () => {
      assert.doesNotThrow(() =>
        document.querySelector(':is(a,[b]):first-child')
      );
    });

    it('should not throw', () => {
      assert.doesNotThrow(() => document.querySelector(':is([b]):not(.c)'));
    });
  });

  describe('#3692 - https://github.com/jsdom/jsdom/issues/3692', () => {
    let document;
    beforeEach(() => {
      const dom = jsdom(
        '<div class="sm:block"><span id="target"></span></div>'
      );
      document = dom.window.document;
    });
    afterEach(() => {
      document = null;
    });

    it('should get matched node', () => {
      const div = document.querySelector('div');
      const span = document.getElementById('target');
      const res = div.querySelector(':scope > span');
      assert.deepEqual(res, span, 'result');
    });

    it('should get matched node(s)', () => {
      const div = document.querySelector('div');
      const span = document.getElementById('target');
      const res = div.querySelectorAll(':scope > span');
      assert.deepEqual(res, [span], 'result');
    });
  });

  describe('https://github.com/jsdom/jsdom/issues/3941', () => {
    let window, document;
    beforeEach(() => {
      const dom = jsdom(`<!DOCTYPE html>
        <html lang="en">
          <head>
          </head>
          <body>
            <div id="shadow-root" style="visibility:hidden;"></div>
          </body>
        </html>
      `);
      window = dom.window;
      document = dom.window.document;
    });
    afterEach(() => {
      window = null;
      document = null;
    });

    it('should get matched node', () => {
      const shadowRoot = document
        .querySelector('#shadow-root')
        .attachShadow({ mode: 'open' });
      shadowRoot.innerHTML = `<div class="container">
            <span class="shadow-element-with-inline-style" style="visibility:inherit;"></span>
        </div>`;
      const innerEl = document
        .querySelector('#shadow-root')
        .shadowRoot.querySelector('.shadow-element-with-inline-style');
      assert.strictEqual(
        window.getComputedStyle(innerEl).visibility,
        'visible',
        'initial result'
      );
      shadowRoot.innerHTML = `<div class="container" style="visibility:hidden;">
            <span class="shadow-element-with-inline-style" style="visibility:inherit;"></span>
        </div>`;
      const innerEl2 = document
        .querySelector('#shadow-root')
        .shadowRoot.querySelector('.shadow-element-with-inline-style');
      assert.strictEqual(
        window.getComputedStyle(innerEl2).visibility,
        'hidden',
        'result'
      );
    });
  });

  /* xml related issues */
  describe('#2159 - https://github.com/jsdom/jsdom/issues/2159', () => {
    let window;
    beforeEach(() => {
      const dom = jsdom('');
      window = dom.window;
    });
    afterEach(() => {
      window = null;
    });

    it('should get matched node', () => {
      const domStr = `<?xml version="1.0"?>
      <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" id="target">
        <dc:title></dc:title>
      </cp:coreProperties>`;
      const doc = new window.DOMParser().parseFromString(
        domStr,
        'application/xml'
      );
      const node = doc.getElementById('target');
      const res = doc.querySelector('coreProperties');
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const domStr = `<?xml version="1.0"?>
      <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" id="target">
        <dc:title></dc:title>
      </cp:coreProperties>`;
      const doc = new window.DOMParser().parseFromString(
        domStr,
        'application/xml'
      );
      const node = doc.getElementById('target');
      const res = doc.querySelector('*|coreProperties');
      assert.deepEqual(res, node, 'result');
      assert.strictEqual(node.matches('*|coreProperties'), true, 'match');
    });
  });

  describe('#2544 - https://github.com/jsdom/jsdom/issues/2544', () => {
    let window;
    beforeEach(() => {
      const dom = jsdom('');
      window = dom.window;
    });
    afterEach(() => {
      window = null;
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
      const doc = new window.DOMParser().parseFromString(
        domStr,
        'application/xml'
      );
      const node = doc.getElementById('target');
      const res = doc.querySelector(
        'mlt>tractor[id="tractor0"]>filter[mlt_service="greyscale"][track="0"]'
      );
      assert.deepEqual(res, node, 'result');
    });
  });

  describe('#3015 - https://github.com/jsdom/jsdom/issues/3015', () => {
    let window;
    beforeEach(() => {
      const dom = jsdom('');
      window = dom.window;
    });
    afterEach(() => {
      window = null;
    });

    it('should get matched node', () => {
      const domStr = `<data>
        <_g>
          <b id="target">hey</b>
        </_g>
      </data>`;
      const doc = new window.DOMParser().parseFromString(domStr, 'text/xml');
      const node = doc.getElementById('target');
      const res = doc.querySelector('data > _g > b');
      assert.deepEqual(res, node, 'result');
      assert.strictEqual(res.textContent, 'hey', 'content');
    });
  });

  describe('#3321 - https://github.com/jsdom/jsdom/issues/3321', () => {
    let window;
    beforeEach(() => {
      const dom = jsdom('');
      window = dom.window;
    });
    afterEach(() => {
      window = null;
    });

    it('should get matched node', () => {
      const domStr = '<a id="9a"><b id="target"/></a>';
      const doc = new window.DOMParser().parseFromString(
        domStr,
        'application/xml'
      );
      const node = doc.getElementById('target');
      const res = doc.documentElement.querySelector(':scope > b');
      assert.deepEqual(res, node, 'result');
    });
  });

  describe('#3416 - https://github.com/jsdom/jsdom/issues/3416', () => {
    let window;
    beforeEach(() => {
      const dom = jsdom('');
      window = dom.window;
    });
    afterEach(() => {
      window = null;
    });

    it('should get result', () => {
      const domStr = '<Foo><bar>baz</bar></Foo>';
      const doc = new window.DOMParser().parseFromString(
        domStr,
        'application/xml'
      );
      assert.deepEqual(doc.querySelector('Foo'), doc.documentElement, 'Foo');
      assert.deepEqual(doc.querySelector('foo'), null, 'foo');
      assert.deepEqual(
        doc.querySelector('bar'),
        doc.documentElement.firstChild,
        'bar'
      );
      assert.deepEqual(
        doc.querySelector('Foo bar'),
        doc.documentElement.firstChild,
        'Foo bar'
      );
    });
  });

  describe('#3427 - https://github.com/jsdom/jsdom/issues/3427', () => {
    let window;
    beforeEach(() => {
      const dom = jsdom('');
      window = dom.window;
    });
    afterEach(() => {
      window = null;
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
      const doc = new window.DOMParser().parseFromString(
        domStr,
        'application/xml'
      );
      const a = doc.getElementById('a');
      const b = doc.getElementById('b');
      const c = doc.getElementById('c');
      const nsb = doc.getElementById('nsb');
      const nsc = doc.getElementById('nsc');
      // NOTE: namespace should be separated with `|`
      assert.deepEqual(doc.querySelector('ns\\:b'), null, 'result');
      assert.throws(
        () => a.querySelector('ns|b'),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, 'SyntaxError', 'name');
          assert.strictEqual(e.message, 'Invalid selector ns|b');
          return true;
        }
      );
      assert.throws(
        () => a.querySelector('ns|b ns|c'),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'instance'
          );
          assert.strictEqual(e.name, 'SyntaxError', 'name');
          assert.strictEqual(e.message, 'Invalid selector ns|c');
          return true;
        }
      );
      assert.deepEqual([...doc.querySelectorAll('b')], [nsb, b], 'result');
      assert.deepEqual([...doc.querySelectorAll('c')], [nsc, c], 'result');
    });
  });

  describe('#3428 - https://github.com/jsdom/jsdom/issues/3428', () => {
    let window;
    beforeEach(() => {
      const dom = jsdom('');
      window = dom.window;
    });
    afterEach(() => {
      window = null;
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
      const doc = new window.DOMParser().parseFromString(
        domStr,
        'application/xml'
      );
      assert.deepEqual(doc.querySelector('ab'), null, 'lowercased');
      assert.deepEqual(
        doc.querySelector('aB *'),
        doc.getElementById('c'),
        'aB *'
      );
      assert.deepEqual(
        doc.querySelector('cd *'),
        doc.getElementById('e'),
        'cd *'
      );
    });

    it('should get matched node', () => {
      const domStr = `<elem>
        <Test id="target">
          content
          <my-tag id="tag">abc</my-tag>
        </Test>
      </elem>`;
      const doc = new window.DOMParser().parseFromString(domStr, 'text/xml');
      assert.deepEqual(doc.querySelector('test'), null, 'lowercased');
      assert.deepEqual(
        doc.querySelector('Test'),
        doc.getElementById('target'),
        'target'
      );
      assert.deepEqual(
        doc.querySelector('my-tag'),
        doc.getElementById('tag'),
        'tag'
      );
      assert.deepEqual(
        doc.querySelector('Test > my-tag'),
        doc.getElementById('tag'),
        'tag'
      );
      assert.deepEqual(doc.querySelector('test > my-tag'), null, 'tag');
    });
  });
});
