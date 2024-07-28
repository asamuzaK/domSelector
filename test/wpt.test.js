/**
 * wpt.test.js
 */
/* eslint-disable camelcase */

/* api */
import { assert } from 'chai';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, it, xit } from 'mocha';
import { sleep } from '../scripts/common.js';

/* test */
import { DOMSelector } from '../src/index.js';

const globalKeys = ['DOMParser'];

describe('local wpt test cases', () => {
  const domStr =
    '<!doctype html><html lang="en"><head></head><body></body></html>';
  const domOpt = {
    runScripts: 'dangerously',
    url: 'http://localhost/',
    beforeParse: window => {
      const domSelector = new DOMSelector(window);
      window.Element.prototype.matches = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        const res = domSelector.matches(selector, this);
        return res;
      };
      window.Element.prototype.closest = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        const res = domSelector.closest(selector, this);
        return res ?? null;
      };
      window.Document.prototype.querySelector = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        const res = domSelector.querySelector(selector, this);
        return res ?? null;
      };
      window.DocumentFragment.prototype.querySelector = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        const res = domSelector.querySelector(selector, this);
        return res ?? null;
      };
      window.Element.prototype.querySelector = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        const res = domSelector.querySelector(selector, this);
        return res ?? null;
      };
      window.Document.prototype.querySelectorAll = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        const res = domSelector.querySelectorAll(selector, this);
        return res;
      };
      window.DocumentFragment.prototype.querySelectorAll = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        const res = domSelector.querySelectorAll(selector, this);
        return res;
      };
      window.Element.prototype.querySelectorAll = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        const res = domSelector.querySelectorAll(selector, this);
        return res;
      };
    }
  };
  let window, document;
  beforeEach(() => {
    const dom = new JSDOM(domStr, domOpt);
    window = dom.window;
    document = dom.window.document;
    for (const key of globalKeys) {
      global[key] = dom.window[key];
    }
  });
  afterEach(() => {
    window = null;
    document = null;
    for (const key of globalKeys) {
      delete global[key];
    }
  });

  describe('css/css-scoping/host-defined.html', () => {
    it('should match', () => {
      const node = document.createElement('div');
      node.id = 'host';
      document.body.appendChild(node);
      const root = node.attachShadow({ mode: 'open' });
      root.innerHTML = '<div></div>';
      const res = root.firstElementChild.matches(':host > div');
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const node = document.createElement('div');
      node.id = 'host';
      document.body.appendChild(node);
      const root = node.attachShadow({ mode: 'open' });
      root.innerHTML = '<div></div>';
      const res = root.firstElementChild.matches(':not(:defined) > div');
      assert.isTrue(res, 'result');
    });

    it('should not match', () => {
      const node = document.createElement('div');
      node.id = 'host';
      document.body.appendChild(node);
      const root = node.attachShadow({ mode: 'open' });
      root.innerHTML = '<div></div>';
      const res = root.firstElementChild.matches(':defined > div');
      assert.isFalse(res, 'result');
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
      const input = document.createElement('input');
      input.type = 'tel';
      assert.isTrue(input.matches(':dir(ltr)'));
      assert.isFalse(input.matches(':dir(rtl)'));

      input.setAttribute('dir', 'foo');
      assert.isTrue(input.matches(':dir(ltr)'));
      assert.isFalse(input.matches(':dir(rtl)'));

      input.setAttribute('dir', 'rtl');
      assert.isFalse(input.matches(':dir(ltr)'));
      assert.isTrue(input.matches(':dir(rtl)'));

      input.setAttribute('dir', 'RTL');
      assert.isFalse(input.matches(':dir(ltr)'));
      assert.isTrue(input.matches(':dir(rtl)'));

      input.setAttribute('dir', 'ltr');
      assert.isTrue(input.matches(':dir(ltr)'));
      assert.isFalse(input.matches(':dir(rtl)'));

      input.setAttribute('dir', 'LTR');
      assert.isTrue(input.matches(':dir(ltr)'));
      assert.isFalse(input.matches(':dir(rtl)'));

      input.setAttribute('dir', 'auto');
      assert.isTrue(input.matches(':dir(ltr)'));
      assert.isFalse(input.matches(':dir(rtl)'));

      input.value = '\u05EA';
      assert.isFalse(input.matches(':dir(ltr)'));
      assert.isTrue(input.matches(':dir(rtl)'));

      input.setAttribute('dir', 'AUTO');
      assert.isFalse(input.matches(':dir(ltr)'));
      assert.isTrue(input.matches(':dir(rtl)'));

      input.removeAttribute('dir');
      assert.isTrue(input.matches(':dir(ltr)'));
      assert.isFalse(input.matches(':dir(rtl)'));
    });

    it('should get matched node', () => {
      const input = document.createElement('input');
      input.type = 'tel';

      const container = document.createElement('div');
      container.setAttribute('dir', 'rtl');
      container.appendChild(input);

      // Insert the element into the document so that we can also check for
      // 'direction' in computed style.
      document.body.appendChild(container);

      assert.isTrue(input.matches(':dir(ltr)'));
      assert.isFalse(input.matches(':dir(rtl)'));
      // Per https://html.spec.whatwg.org/multipage/rendering.html#bidi-rendering:
      // jsdom fails
      // assert.strictEqual(window.getComputedStyle(input).direction, 'ltr');

      // Changing to a different type causes the special type=tel rule to
      // no longer apply.
      input.type = 'text';
      assert.isFalse(input.matches(':dir(ltr)'));
      assert.isTrue(input.matches(':dir(rtl)'));
      // jsdom fails
      // assert.strictEqual(window.getComputedStyle(input).direction, 'rtl');

      // And restoring type=tel brings back that behavior.
      input.type = 'tel';
      assert.isTrue(input.matches(':dir(ltr)'));
      assert.isFalse(input.matches(':dir(rtl)'));
      // jsdom fails
      // assert.strictEqual(window.getComputedStyle(input).direction, 'ltr');

      document.body.removeChild(container);
    });

    const dirValue = [
      'password', 'text', 'search', 'url', 'email', 'submit', 'reset',
      'button'
    ];

    it('should get matched node', () => {
      for (const type of dirValue) {
        const input = document.createElement('input');
        input.type = type;
        assert.isTrue(input.matches(':dir(ltr)'), `${type} ltr`);
        assert.isFalse(input.matches(':dir(rtl)'), `${type} rtr`);
      }
    });

    it('should get matched node', () => {
      for (const type of dirValue) {
        const input = document.createElement('input');
        input.type = type;
        input.setAttribute('dir', 'ltr');
        assert.isTrue(input.matches(':dir(ltr)'), `${type} ltr`);
        assert.isFalse(input.matches(':dir(rtl)'), `${type} rtr`);
      }
    });

    it('should get matched node', () => {
      for (const type of dirValue) {
        const input = document.createElement('input');
        input.type = type;
        input.setAttribute('dir', 'foo');
        assert.isTrue(input.matches(':dir(ltr)'), `${type} ltr`);
        assert.isFalse(input.matches(':dir(rtl)'), `${type} rtl`);
      }
    });

    it('should get matched node', () => {
      for (const type of dirValue) {
        const input = document.createElement('input');
        input.type = type;
        input.setAttribute('dir', 'rtl');
        assert.isFalse(input.matches(':dir(ltr)'), `${type} ltr`);
        assert.isTrue(input.matches(':dir(rtl)'), `${type} rtl`);
      }
    });

    it('should get matched node', () => {
      for (const type of dirValue) {
        const input = document.createElement('input');
        input.type = type;
        input.setAttribute('dir', 'auto');
        assert.isTrue(input.matches(':dir(ltr)'), `${type} ltr`);
        assert.isFalse(input.matches(':dir(rtl)'), `${type} rtl`);
      }
    });

    it('should get matched node', () => {
      for (const type of dirValue) {
        const input = document.createElement('input');
        input.type = type;
        input.setAttribute('dir', 'auto');
        input.value = '\u05EA';
        assert.isFalse(input.matches(':dir(ltr)'), `${type} ltr`);
        assert.isTrue(input.matches(':dir(rtl)'), `${type} rtl`);
      }
    });

    const dirDefault = [
      'date', 'time', 'number', 'range', 'color', 'checkbox', 'radio', 'image'
    ];

    it('should get matched node', () => {
      for (const type of dirDefault) {
        const input = document.createElement('input');
        input.type = type;
        assert.isTrue(input.matches(':dir(ltr)'), `${type} ltr`);
        assert.isFalse(input.matches(':dir(rtl)'), `${type} rtr`);
      }
    });

    it('should get matched node', () => {
      for (const type of dirDefault) {
        const input = document.createElement('input');
        input.type = type;
        input.setAttribute('dir', 'ltr');
        assert.isTrue(input.matches(':dir(ltr)'), `${type} ltr`);
        assert.isFalse(input.matches(':dir(rtl)'), `${type} rtr`);
      }
    });

    it('should get matched node', () => {
      for (const type of dirDefault) {
        const input = document.createElement('input');
        input.type = type;
        input.setAttribute('dir', 'foo');
        assert.isTrue(input.matches(':dir(ltr)'), `${type} ltr`);
        assert.isFalse(input.matches(':dir(rtl)'), `${type} rtl`);
      }
    });

    it('should get matched node', () => {
      for (const type of dirDefault) {
        const input = document.createElement('input');
        input.type = type;
        input.setAttribute('dir', 'rtl');
        assert.isFalse(input.matches(':dir(ltr)'), `${type} ltr`);
        assert.isTrue(input.matches(':dir(rtl)'), `${type} rtl`);
      }
    });

    it('should get matched node', () => {
      for (const type of dirDefault) {
        const input = document.createElement('input');
        input.type = type;
        input.setAttribute('dir', 'auto');
        assert.isTrue(input.matches(':dir(ltr)'), `${type} ltr`);
        assert.isFalse(input.matches(':dir(rtl)'), `${type} rtl`);
      }
    });

    it('should get matched node', () => {
      for (const type of dirDefault) {
        const input = document.createElement('input');
        input.type = type;
        input.setAttribute('dir', 'auto');
        input.value = '\u05EA';
        assert.isTrue(input.matches(':dir(ltr)'), `${type} ltr`);
        assert.isFalse(input.matches(':dir(rtl)'), `${type} rtl`);
      }
    });

    it('should get matched node', () => {
      for (const type of dirDefault) {
        const rtlParent = document.createElement('div');
        rtlParent.dir = 'rtl';
        const input = document.createElement('input');
        input.type = type;
        input.setAttribute('dir', 'auto');
        rtlParent.appendChild(input);
        assert.isTrue(input.matches(':dir(ltr)'), `${type} ltr`);
        assert.isFalse(input.matches(':dir(rtl)'), `${type} rtl`);
      }
    });
  });

  describe('css/selectors/dir-selector-auto.html', () => {
    const html = `
      <div id=testDivs>
        <div id=div1 dir=auto>
          <div id=div1_1>a</div>
        </div>
        <div id=div2 dir=auto>
          <div id=div2_1>&#1514;</div>
        </div>
        <div id=div3 dir=auto>
          <div id=div3_1 dir=rtl>&#1514;</div>
          <div id=div3_2>a</div>
        </div>
        <div id=div4 dir=auto>
          <div id=div4_1>
            <div id=div4_1_1>a</div>
          </div>
        </div>
      </div>
    `;

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector('#div1:dir(ltr)');
      assert.deepEqual(res, document.getElementById('div1'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector('#div1_1:dir(ltr)');
      assert.deepEqual(res, document.getElementById('div1_1'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector('#div2:dir(rtl)');
      assert.deepEqual(res, document.getElementById('div2'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector('#div2_1:dir(rtl)');
      assert.deepEqual(res, document.getElementById('div2_1'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector('#div3:dir(ltr)');
      assert.deepEqual(res, document.getElementById('div3'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector('#div3_1:dir(rtl)');
      assert.deepEqual(res, document.getElementById('div3_1'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector('#div3_2:dir(ltr)');
      assert.deepEqual(res, document.getElementById('div3_2'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector('#div4:dir(ltr)');
      assert.deepEqual(res, document.getElementById('div4'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector('#div4_1:dir(ltr)');
      assert.deepEqual(res, document.getElementById('div4_1'), 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const res = document.querySelector('#div4_2:dir(ltr)');
      assert.deepEqual(res, document.getElementById('div4_2'), 'result');
    });

    // NOTE: jsdom does not implement `innerText`, so using `textContent`.
    // https://github.com/jsdom/jsdom/issues/1245
    it('should get matched node', () => {
      document.body.innerHTML = html;
      const div1 = document.getElementById('div1');
      const div1_1 = document.getElementById('div1_1');
      const div2 = document.getElementById('div2');
      const div2_1 = document.getElementById('div2_1');
      const div3 = document.getElementById('div3');
      const div3_1 = document.getElementById('div3_1');
      const div3_2 = document.getElementById('div3_2');
      const div4 = document.getElementById('div4');
      const div4_1 = document.getElementById('div4_1');
      const div4_1_1 = document.getElementById('div4_1_1');
      /* Initial */
      assert.isTrue(div1.matches(':dir(ltr)'));
      assert.isTrue(div1_1.matches(':dir(ltr)'));
      assert.isTrue(div2.matches(':dir(rtl)'));
      assert.isTrue(div2_1.matches(':dir(rtl)'));
      assert.isTrue(div3.matches(':dir(ltr)'));
      assert.isTrue(div3_1.matches(':dir(rtl)'));
      assert.isTrue(div3_2.matches(':dir(ltr)'));
      assert.isTrue(div4.matches(':dir(ltr)'));
      assert.isTrue(div4_1.matches(':dir(ltr)'));
      assert.isTrue(div4_1_1.matches(':dir(ltr)'));
      /* Update text */
      div1_1.textContent = '\u05EA';
      assert.isTrue(div1.matches(':dir(rtl)'));
      assert.isTrue(div1_1.matches(':dir(rtl)'));
      /* Update dir attr */
      div1_1.dir = 'ltr';
      assert.isTrue(div1.matches(':dir(ltr)'));
      assert.isTrue(div1_1.matches(':dir(ltr)'));
      /* Reupdate text */
      div1_1.textContent = 'a';
      assert.isTrue(div1.matches(':dir(ltr)'));
      assert.isTrue(div1_1.matches(':dir(ltr)'));
      /* Remove child */
      div2_1.remove();
      assert.isTrue(div2.matches(':dir(ltr)'));
      /* Update child dir attr */
      div3_1.dir = '';
      assert.isTrue(div3.matches(':dir(rtl)'));
      /* Update child order */
      div3.appendChild(div3_1);
      assert.isTrue(div3.matches(':dir(ltr)'));
      /* Update child text */
      div4_1_1.textContent = '\u05EA';
      assert.isTrue(div4.matches(':dir(rtl)'));
      assert.isTrue(div4_1.matches(':dir(rtl)'));
      assert.isTrue(div4_1_1.matches(':dir(rtl)'));
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

  describe('css/selectors/focus-display-none-001.html', () => {
    it('should match', async () => {
      const html = `<div id="wrapper">
        <input id="input">
      </div>
      `;
      document.body.innerHTML = html;
      assert.isTrue(document.body === document.activeElement, 'active');
      assert.isFalse(document.body.matches(':focus'), 'body');
      const node = document.getElementById('input');
      node.focus();
      await sleep();
      assert.isTrue(node.matches(':focus'), 'before');
      node.style.display = 'none';
      node.focus();
      await sleep();
      assert.isFalse(node.matches(':focus'), 'after');
      assert.isFalse(document.body.matches(':focus'), 'body');
      // jsdom fails
      // assert.isTrue(document.body === document.activeElement, 'active');
    });

    it('should match', async () => {
      const html = `<div id="wrapper">
        <input id="input">
      </div>
      `;
      document.body.innerHTML = html;
      assert.isTrue(document.body === document.activeElement, 'active');
      assert.isFalse(document.body.matches(':focus'), 'body');
      const node = document.getElementById('input');
      node.focus();
      await sleep();
      assert.isTrue(node.matches(':focus'), 'before');
      node.parentNode.style.display = 'none';
      node.focus();
      await sleep();
      assert.isFalse(node.matches(':focus'), 'after');
      assert.isFalse(document.body.matches(':focus'), 'body');
      // jsdom fails
      // assert.isTrue(document.body === document.activeElement, 'active');
    });
  });

  describe('css/selectors/has-basic.html', () => {
    it('should get matched node(s)', () => {
      const html = `
        <main id=main>
          <div id=a class="ancestor">
            <div id=b class="parent ancestor">
              <div id=c class="sibling descendant">
                <div id=d class="descendant"></div>
              </div>
              <div id=e class="target descendant"></div>
            </div>
            <div id=f class="parent ancestor">
              <div id=g class="target descendant"></div>
            </div>
            <div id=h class="parent ancestor">
              <div id=i class="target descendant"></div>
              <div id=j class="sibling descendant">
                <div id=k class="descendant"></div>
              </div>
            </div>
          </div>
        </main>
      `;
      document.body.innerHTML = html;
      const main = document.getElementById('main');
      assert.deepEqual(main.querySelectorAll(':has(#a)'), []);
      assert.deepEqual(main.querySelectorAll(':has(.ancestor)'), [
        document.getElementById('a')
      ]);
      assert.deepEqual(main.querySelectorAll(':has(.target)'), [
        document.getElementById('a'),
        document.getElementById('b'),
        document.getElementById('f'),
        document.getElementById('h')
      ]);
      assert.deepEqual(main.querySelectorAll(':has(.descendant)'), [
        document.getElementById('a'),
        document.getElementById('b'),
        document.getElementById('c'),
        document.getElementById('f'),
        document.getElementById('h'),
        document.getElementById('j')
      ]);
      assert.deepEqual(main.querySelectorAll('.parent:has(.target)'), [
        document.getElementById('b'),
        document.getElementById('f'),
        document.getElementById('h')
      ]);
      assert.deepEqual(main.querySelectorAll(':has(.sibling ~ .target)'), [
        document.getElementById('a'),
        document.getElementById('b')
      ]);
      assert.deepEqual(main.querySelectorAll('.parent:has(.sibling ~ .target)'), [
        document.getElementById('b')
      ]);
      assert.deepEqual(main.querySelectorAll(':has(:is(.target ~ .sibling .descendant))'), [
        document.getElementById('a'),
        document.getElementById('h'),
        document.getElementById('j')
      ]);
      assert.deepEqual(main.querySelectorAll('.parent:has(:is(.target ~ .sibling .descendant))'), [
        document.getElementById('h')
      ]);
      assert.deepEqual(main.querySelectorAll('.sibling:has(.descendant) ~ .target'), [
        document.getElementById('e')
      ]);
      assert.deepEqual(main.querySelectorAll(':has(> .parent)'), [
        document.getElementById('a')
      ]);
      assert.deepEqual(main.querySelectorAll(':has(> .target)'), [
        document.getElementById('b'),
        document.getElementById('f'),
        document.getElementById('h')
      ]);
      assert.deepEqual(main.querySelectorAll(':has(> .parent, > .target)'), [
        document.getElementById('a'),
        document.getElementById('b'),
        document.getElementById('f'),
        document.getElementById('h')
      ]);
      assert.deepEqual(main.querySelectorAll(':has(+ #h)'), [
        document.getElementById('f')
      ]);
      assert.deepEqual(main.querySelectorAll('.parent:has(~ #h)'), [
        document.getElementById('b'),
        document.getElementById('f')
      ]);
      assert.deepEqual(main.querySelector('.sibling:has(.descendant)'),
        document.getElementById('c'));
      assert.deepEqual(document.getElementById('k').closest('.ancestor:has(.descendant)'),
        document.getElementById('h'));
      assert.isTrue(document.getElementById('h').matches(':has(.target ~ .sibling .descendant)'));
    });
  });

  describe('css/selectors/has-argument-with-explicit-scope.html', () => {
    const html = `
    <main>
      <div id=d01 class="a">
        <div id=scope1 class="b">
          <div id=d02 class="c">
            <div id=d03 class="c">
              <div id=d04 class="d"></div>
            </div>
          </div>
          <div id=d05 class="e"></div>
        </div>
      </div>
      <div id=d06>
        <div id=scope2 class="b">
          <div id=d07 class="c">
            <div id=d08 class="c">
              <div id=d09></div>
            </div>
          </div>
        </div>
       </div>
      </div>
    </main>
    `;
    const sortNodes = arr => arr.map(elm => elm.id).sort();

    it('should not match', () => {
      document.body.innerHTML = html;
      const scope = document.getElementById('scope1');
      const res = scope.querySelectorAll(':has(:scope)');
      assert.deepEqual(sortNodes(res), sortNodes([]), 'result');
    });

    it('should not match', () => {
      document.body.innerHTML = html;
      const scope = document.getElementById('scope1');
      const res = scope.querySelectorAll(':has(:scope .c)');
      assert.deepEqual(sortNodes(res), sortNodes([]), 'result');
    });

    it('should not match', () => {
      document.body.innerHTML = html;
      const scope = document.getElementById('scope1');
      const res = scope.querySelectorAll(':has(.a :scope)');
      assert.deepEqual(sortNodes(res), sortNodes([]), 'result');
    });

    it('should get matched node(s)', () => {
      document.body.innerHTML = html;
      const scope = document.getElementById('scope1');
      const res = scope.querySelectorAll('.a:has(:scope) .c');
      assert.deepEqual(sortNodes(res), sortNodes([
        document.getElementById('d02'),
        document.getElementById('d03')
      ]), 'result');
    });

    it('should not match', () => {
      document.body.innerHTML = html;
      const scope = document.getElementById('scope2');
      const res = scope.querySelectorAll('.a:has(:scope) .c');
      assert.deepEqual(sortNodes(res), sortNodes([]), 'result');
    });

    it('should get matched node(s)', () => {
      document.body.innerHTML = html;
      const scope = document.getElementById('scope1');
      const res = scope.querySelectorAll('.c:has(:is(:scope .d))');
      assert.deepEqual(sortNodes(res), sortNodes([
        document.getElementById('d02'),
        document.getElementById('d03')
      ]), 'result');
    });

    it('should not match', () => {
      document.body.innerHTML = html;
      const scope = document.getElementById('scope2');
      const res = scope.querySelectorAll('.c:has(:is(:scope .d))');
      assert.deepEqual(sortNodes(res), sortNodes([]), 'result');
    });
  });

  describe('css/selectors/has-matches-to-uninserted-elements.html', () => {
    it('should not match', () => {
      const subject = document.createElement('subject');
      subject.innerHTML = '<child></child><direct_sibling></direct_sibling><indirect_sibling></indirect_sibling>';
      const res = subject.matches(':has(~ *)');
      assert.isFalse(res, 'result');
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

  describe('css/selectors/invalidation/attribute.html', () => {
    it('should get matched node', () => {
      const html = `
        <div id="a1">
          <div id="b1">
            <div id="c1">
            </div>
          </div>
        </div>
        <div id="d1">
        </div>
        <div>
          <div id="b2">
            <div id="c2">
            </div>
          </div>
        </div>
        <div id="d2">
        </div>
        <div id="a3">
          <div id="b3">
            <div id="c3">
            </div>
          </div>
        </div>
        <div id="d3">
        </div>
        <div id="a4">
          <div id="b4">
            <div id="c4">
            </div>
          </div>
        </div>
        <div id="d4">
        </div>
        <div>
          <div id="b5">
            <div id="c5">
            </div>
          </div>
        </div>
        <div id="d5">
        </div>
        <div id="a6">
          <div id="b6">
            <div id="c6">
            </div>
          </div>
        </div>
        <div id="d6">
        </div>
      `;
      document.body.innerHTML = html;
      const a1 = document.getElementById('a1');
      const b1 = document.getElementById('b1');
      const c1 = document.getElementById('c1');
      const d1 = document.getElementById('d1');
      const b2 = document.getElementById('b2');
      const c2 = document.getElementById('c2');
      const d2 = document.getElementById('d2');
      const a3 = document.getElementById('a3');
      const b3 = document.getElementById('b3');
      const c3 = document.getElementById('c3');
      const d3 = document.getElementById('d3');
      const a4 = document.getElementById('a4');
      const b4 = document.getElementById('b4');
      const c4 = document.getElementById('c4');
      const d4 = document.getElementById('d4');
      const b5 = document.getElementById('b5');
      const c5 = document.getElementById('c5');
      const d5 = document.getElementById('d5');
      const a6 = document.getElementById('a6');
      const b6 = document.getElementById('b6');
      const c6 = document.getElementById('c6');
      const d6 = document.getElementById('d6');
      /* [att] selector is effective */
      assert.isFalse(a1.matches('#a1[style]'));
      assert.isFalse(b1.matches('#a1[style] > #b1'));
      assert.isFalse(c1.matches('#a1[style] #c1'));
      assert.isFalse(d1.matches('#a1[style] + #d1'));
      a1.style.visibility = 'visible';
      assert.isTrue(a1.matches('#a1[style]'));
      assert.isTrue(b1.matches('#a1[style] > #b1'));
      assert.isTrue(c1.matches('#a1[style] #c1'));
      assert.isTrue(d1.matches('#a1[style] + #d1'));
      a1.removeAttribute('style');
      assert.isFalse(a1.matches('#a1[style]'));
      assert.isFalse(b1.matches('#a1[style] > #b1'));
      assert.isFalse(c1.matches('#a1[style] #c1'));
      assert.isFalse(d1.matches('#a1[style] + #d1'));
      /* [att=val] selector is effective */
      const a2 = b2.parentElement;
      assert.isFalse(a2.matches('[id=a2]'));
      assert.isFalse(b2.matches('[id=a2] > #b2'));
      assert.isFalse(c2.matches('[id=a2] #c2'));
      assert.isFalse(d2.matches('[id=a2] + #d2'));
      a2.id = 'x-a2';
      assert.isFalse(a2.matches('[id=a2]'));
      assert.isFalse(b2.matches('[id=a2] > #b2'));
      assert.isFalse(c2.matches('[id=a2] #c2'));
      assert.isFalse(d2.matches('[id=a2] + #d2'));
      a2.id = 'a2';
      assert.isTrue(a2.matches('[id=a2]'));
      assert.isTrue(b2.matches('[id=a2] > #b2'));
      assert.isTrue(c2.matches('[id=a2] #c2'));
      assert.isTrue(d2.matches('[id=a2] + #d2'));
      a2.id = 'a2-y';
      assert.isFalse(a2.matches('[id=a2]'));
      assert.isFalse(b2.matches('[id=a2] > #b2'));
      assert.isFalse(c2.matches('[id=a2] #c2'));
      assert.isFalse(d2.matches('[id=a2] + #d2'));
      a2.removeAttribute('id');
      /* [att~=val] selector is effective */
      assert.isFalse(a3.matches('#a3[class~=q]'));
      assert.isFalse(b3.matches('#a3[class~=q] > #b3'));
      assert.isFalse(c3.matches('#a3[class~=q] #c3'));
      assert.isFalse(d3.matches('#a3[class~=q] + #d3'));
      a3.setAttribute('class', 'p q r');
      assert.isTrue(a3.matches('#a3[class~=q]'));
      assert.isTrue(b3.matches('#a3[class~=q] > #b3'));
      assert.isTrue(c3.matches('#a3[class~=q] #c3'));
      assert.isTrue(d3.matches('#a3[class~=q] + #d3'));
      a3.setAttribute('class', 'q-r');
      assert.isFalse(a3.matches('#a3[class~=q]'));
      assert.isFalse(b3.matches('#a3[class~=q] > #b3'));
      assert.isFalse(c3.matches('#a3[class~=q] #c3'));
      assert.isFalse(d3.matches('#a3[class~=q] + #d3'));
      a3.removeAttribute('class');
      /* [att|=val] selector is effective */
      assert.isFalse(a4.matches('#a4[run|=one]'));
      assert.isFalse(b4.matches('#a4[run|=one] > #b4'));
      assert.isFalse(c4.matches('#a4[run|=one] #c4'));
      assert.isFalse(d4.matches('#a4[run|=one] + #d4'));
      a4.setAttribute('run', 'one');
      assert.isTrue(a4.matches('#a4[run|=one]'));
      assert.isTrue(b4.matches('#a4[run|=one] > #b4'));
      assert.isTrue(c4.matches('#a4[run|=one] #c4'));
      assert.isTrue(d4.matches('#a4[run|=one] + #d4'));
      a4.setAttribute('run', 'one two three');
      assert.isFalse(a4.matches('#a4[run|=one]'));
      assert.isFalse(b4.matches('#a4[run|=one] > #b4'));
      assert.isFalse(c4.matches('#a4[run|=one] #c4'));
      assert.isFalse(d4.matches('#a4[run|=one] + #d4'));
      a4.setAttribute('run', 'one-two-three');
      assert.isTrue(a4.matches('#a4[run|=one]'));
      assert.isTrue(b4.matches('#a4[run|=one] > #b4'));
      assert.isTrue(c4.matches('#a4[run|=one] #c4'));
      assert.isTrue(d4.matches('#a4[run|=one] + #d4'));
      a4.setAttribute('run', 'zero-one');
      assert.isFalse(a4.matches('#a4[run|=one]'));
      assert.isFalse(b4.matches('#a4[run|=one] > #b4'));
      assert.isFalse(c4.matches('#a4[run|=one] #c4'));
      assert.isFalse(d4.matches('#a4[run|=one] + #d4'));
      a4.removeAttribute('run');
      /* #id selector is effective */
      const a5 = b5.parentElement;
      assert.isFalse(a5.matches('#a5'));
      assert.isFalse(b5.matches('#a5 > #b5'));
      assert.isFalse(c5.matches('#a5 #c5'));
      assert.isFalse(d5.matches('#a5 + #d5'));
      a5.setAttribute('id', 'x-a5');
      assert.isFalse(a5.matches('#a5'));
      assert.isFalse(b5.matches('#a5 > #b5'));
      assert.isFalse(c5.matches('#a5 #c5'));
      assert.isFalse(d5.matches('#a5 + #d5'));
      a5.setAttribute('id', 'a5');
      assert.isTrue(a5.matches('#a5'));
      assert.isTrue(b5.matches('#a5 > #b5'));
      assert.isTrue(c5.matches('#a5 #c5'));
      assert.isTrue(d5.matches('#a5 + #d5'));
      a5.setAttribute('id', 'a5-y');
      assert.isFalse(a5.matches('#a5'));
      assert.isFalse(b5.matches('#a5 > #b5'));
      assert.isFalse(c5.matches('#a5 #c5'));
      assert.isFalse(d5.matches('#a5 + #d5'));
      a5.removeAttribute('id');
      /* .class selector is effective */
      assert.isFalse(a6.matches('#a6.q'));
      assert.isFalse(b6.matches('#a6.q > #b6'));
      assert.isFalse(c6.matches('#a6.q #c6'));
      assert.isFalse(d6.matches('#a6.q + #d6'));
      a6.classList.add('p');
      a6.classList.add('q');
      a6.classList.add('r');
      assert.isTrue(a6.matches('#a6.q'));
      assert.isTrue(b6.matches('#a6.q > #b6'));
      assert.isTrue(c6.matches('#a6.q #c6'));
      assert.isTrue(d6.matches('#a6.q + #d6'));
      a6.classList.remove('q');
      a6.classList.add('q-r');
      assert.isFalse(a6.matches('#a6.q'));
      assert.isFalse(b6.matches('#a6.q > #b6'));
      assert.isFalse(c6.matches('#a6.q #c6'));
      assert.isFalse(d6.matches('#a6.q + #d6'));
      a6.removeAttribute('class');
    });
  });

  describe('css/selectors/invalidation/defined-in-has.html', () => {
    it('should get matched node', () => {
      const html = `
        <div id="subject">
          <my-element></my-element>
        </div>
      `;
      document.body.innerHTML = html;
      const subject = document.getElementById('subject');
      assert.isFalse(subject.matches('#subject:has(:defined)'));
      window.customElements.define('my-element',
        class MyElement extends window.HTMLElement {});
      assert.isTrue(subject.matches('#subject:has(:defined)'));
    });
  });

  describe('css/selectors/invalidation/defined.html', () => {
    it('should get matched node', () => {
      const html = `
        <section id="container">
          <elucidate-late id="a1"></elucidate-late>
          <div id="b1"></div>
          <elucidate-late>
            <div id="c1"></div>
          </elucidate-late>
          <div>
            <div id="d1"></div>
          </div>
        </section>
      `;
      document.body.innerHTML = html;
      const a1 = document.getElementById('a1');
      const b1 = document.getElementById('b1');
      const c1 = document.getElementById('c1');
      const d1 = document.getElementById('d1');
      assert.isFalse(a1.matches('#a1:defined'));
      assert.isFalse(b1.matches(':defined + #b1'));
      assert.isFalse(c1.matches(':defined > #c1'));
      assert.isFalse(d1.matches('div + :defined + * #d1'));
      class ElucidateLate extends window.HTMLElement {};
      window.customElements.define('elucidate-late', ElucidateLate);
      assert.isTrue(a1.matches('#a1:defined'));
      assert.isTrue(b1.matches(':defined + #b1'));
      assert.isTrue(c1.matches(':defined > #c1'));
      assert.isTrue(d1.matches('div + :defined + * #d1'));
    });
  });

  describe('css/selectors/invalidation/dir-pseudo-class-in-has.html', () => {
    it('should get matched node(s)', async () => {
      const html = `
        <section><div id="ltr1" class="ltr"></div></section>
        <section id="ltr2" dir="rtl"><div class="ltr"><span></span></div></section>
        <section dir="ltr"><div class="ltr"><span></span></div></section>
        <section><div id="rtl1" class="rtl"><span></span></div></section>
        <section id="rtl2"><div class="rtl"><span></span></div></section>
      `;
      document.body.innerHTML = html;
      await sleep();
      const ltr1 = document.getElementById('ltr1');
      const ltr2 = document.getElementById('ltr2');
      const rtl1 = document.getElementById('rtl1');
      const rtl2 = document.getElementById('rtl2');
      ltr1.appendChild(document.createElement('span'));
      ltr2.dir = 'ltr';
      rtl1.dir = 'rtl';
      rtl2.dir = 'rtl';
      assert.isTrue(ltr1.matches('.ltr:has(*:dir(ltr))'));
      assert.isTrue(ltr2.firstElementChild.matches('.ltr:has(*:dir(ltr))'));
      assert.isTrue(rtl1.matches('.rtl:has(*:dir(rtl))'));
      assert.isTrue(rtl2.firstElementChild.matches('.rtl:has(*:dir(rtl))'));
    });
  });

  describe('css/selectors/invalidation/empty-pseudo-in-has.html', () => {
    it('should get matched node(s)', () => {
      const html = '<div id="subject"></div>';
      document.body.innerHTML = html;
      const subject = document.getElementById('subject');
      assert.isTrue(subject.matches('#subject'));
      assert.isFalse(subject.matches('#subject:has(:empty)'));
      assert.isFalse(subject.matches('#subject:has(:not(:empty))'));
      const child = document.createElement('div');
      child.id = 'child';
      subject.appendChild(child);
      assert.isTrue(subject.matches('#subject:has(:empty)'));
      child.appendChild(document.createElement('div'));
      assert.isTrue(subject.matches('#subject:has(:not(:empty))'));
      child.replaceChildren();
      assert.isTrue(subject.matches('#subject:has(:empty)'));
      assert.isFalse(subject.matches('#subject:has(:not(:empty))'));
      child.textContent = 'Test';
      assert.isTrue(subject.matches('#subject:has(:not(:empty))'));
      child.textContent = '';
      assert.isTrue(subject.matches('#subject:has(:empty)'));
      assert.isFalse(subject.matches('#subject:has(:not(:empty))'));
    });
  });

  describe('css/selectors/invalidation/has-complexity.html', () => {
    it('should get matched node(s)', () => {
      const html = `
        <main>
          <div id=container>
            <span></span>
          </div>
          <div id=subject class=subject></div>
        </main>
      `;
      document.body.innerHTML = html;
      const container = document.getElementById('container');
      const subject = document.getElementById('subject');
      const count = 25000;
      /* Before appending ${count} elements */
      assert.isTrue(subject.matches('main:has(span) .subject'));
      /* After appending ${count} elements */
      for (let i = 0; i < count; ++i) {
        const span = document.createElement('span');
        container.appendChild(span);
      }
      assert.isTrue(subject.matches('main:has(span + span) .subject'));
      /* After appending another ${count} elements */
      for (let i = 0; i < count - 1; ++i) {
        const span = document.createElement('span');
        container.appendChild(span);
      }
      const final = document.createElement('final');
      container.appendChild(final);
      assert.isTrue(subject.matches('main:has(span + final) .subject'));
      /* After appending div with ${count} elements */
      const div = document.createElement('div');
      for (let i = 0; i < count; ++i) {
        const span = document.createElement('span');
        div.appendChild(span);
      }
      container.appendChild(div);
      assert.isTrue(subject.matches('main:has(div div span) .subject'));
      /* After removing div with ${count} elements */
      div.remove();
      assert.isFalse(subject.matches('main:has(div div span) .subject'));
      assert.isTrue(subject.matches('main:has(span + final) .subject'));
      /* After removing ${count} elements one-by-one */
      /* jsdom hangs. recursive call to ChildNode.remove() costs very high
      for (let i = 0; i < count; ++i) {
        container.lastChild.remove();
      }
      */
      container.lastChild.remove();
      assert.isFalse(subject.matches('main:has(span + final) .subject'));
      assert.isTrue(subject.matches('main:has(span + span) .subject'));
      /* After removing the remaining elements */
      container.replaceChildren();
      assert.isFalse(subject.matches('main:has(span) .subject'));
      assert.isTrue(subject.matches('main .subject'));
    }).timeout(10 * 1000);
  });

  describe('css/selectors/invalidation/has-unstyled.html', () => {
    it('should get matched node(s)', () => {
      const html = `
        <main id=main>
          <div id=subject>
            <div id=subject_child class="none">
              <div id=subject_descendant></div>
            </div>
          </div>
          <div id=sibling class="none">
            <div id=sibling_child>
              <div id=sibling_descendant></div>
            </div>
          </div>
        </main>
      `;
      document.body.innerHTML = html;
      const subject = document.getElementById('subject');
      const subject_descendant = document.getElementById('subject_descendant');
      const sibling_descendant = document.getElementById('sibling_descendant');
      const subject_child = document.getElementById('subject_child');
      const sibling_child = document.getElementById('sibling_child');
      subject_descendant.classList.add('test');
      assert.isTrue(subject.matches('#subject:has(.test)'));
      subject_descendant.classList.remove('test');
      assert.isFalse(subject.matches('#subject:has(.test)'));
      sibling_descendant.classList.add('test');
      assert.isTrue(subject.matches('#subject:has(~ #sibling .test)'));
      sibling_descendant.classList.remove('test');
      assert.isFalse(subject.matches('#subject:has(~ #sibling .test)'));
      subject_child.classList.add('test_inner');
      assert.isTrue(subject.matches('#subject:has(:is(.test_inner #subject_descendant))'));
      subject_child.classList.remove('test_inner');
      assert.isFalse(subject.matches('#subject:has(:is(.test_inner #subject_descendant))'));
      sibling_child.classList.add('test_inner');
      assert.isTrue(subject.matches('#subject:has(~ #sibling :is(.test_inner #sibling_descendant))'));
      sibling_child.classList.remove('test_inner');
      assert.isFalse(subject.matches('#subject:has(~ #sibling :is(.test_inner #sibling_descendant))'));
    });
  });

  describe('css/selectors/invalidation/has-with-pseudo-class.html', () => {
    it('should get matched node(s)', () => {
      const html = `
        <main id=main>
          <form id=form>
            <input type=checkbox id=checkbox>
            <select id=select>
              <optgroup id=optgroup>
                <option>a</option>
                <option id=option>b</option>
              </optgroup>
            </select>
            <input id=text_input type=text required>
          </form>
          <div id=subject></div>
          <div id=subject2></div>
          <div id=subject3></div>
          <div id=subject4></div>
        </main>
      `;
      document.body.innerHTML = html;
      const checkbox = document.getElementById('checkbox');
      const select = document.getElementById('select');
      const optgroup = document.getElementById('optgroup');
      const option = document.getElementById('option');
      const text_input = document.getElementById('text_input');
      const subject = document.getElementById('subject');
      const subject2 = document.getElementById('subject2');
      const subject3 = document.getElementById('subject3');
      const subject4 = document.getElementById('subject4');
      assert.isTrue(subject.matches('main:has(input) div'));
      checkbox.checked = true;
      assert.isTrue(subject.matches('main:has(#checkbox:checked) > #subject'));
      checkbox.checked = false;
      assert.isFalse(subject.matches('main:has(#checkbox:checked) > #subject'));
      assert.isTrue(subject.matches('main:has(input) div'));
      const oldOption = select.selectedOptions[0];
      option.selected = true;
      assert.isTrue(subject.matches('main:has(#option:checked) > #subject'));
      oldOption.selected = true;
      assert.isFalse(subject.matches('main:has(#option:checked) > #subject'));
      assert.isTrue(subject.matches('main:has(input) div'));
      checkbox.disabled = true;
      assert.isTrue(subject.matches('main:has(#checkbox:disabled) > #subject'));
      assert.isTrue(subject3.matches('main:not(:has(#checkbox:enabled)) > #subject3'));
      checkbox.disabled = false;
      assert.isFalse(subject.matches('main:has(#checkbox:disabled) > #subject'));
      assert.isTrue(subject.matches('main:has(input) div'));
      assert.isFalse(subject3.matches('main:not(:has(#checkbox:enabled)) > #subject3'));
      assert.isTrue(subject3.matches('main:has(input) div'));
      option.disabled = true;
      assert.isTrue(subject.matches('main:has(#option:disabled) > :is(#subject, #subject2)'));
      assert.isTrue(subject3.matches('main:not(:has(#option:enabled)) :is(#subject3, #subject4)'));
      option.disabled = false;
      assert.isFalse(subject.matches('main:has(#option:disabled) > :is(#subject, #subject2)'));
      assert.isTrue(subject.matches('main:has(input) div'));
      assert.isFalse(subject3.matches('main:not(:has(#option:enabled)) :is(#subject3, #subject4)'));
      assert.isTrue(subject3.matches('main:has(input) div'));
      optgroup.disabled = true;
      assert.isTrue(subject.matches('main:has(#optgroup:disabled) > #subject'));
      assert.isTrue(subject2.matches('main:has(#option:disabled) > :is(#subject, #subject2)'));
      assert.isTrue(subject3.matches('main:not(:has(#optgroup:enabled)) > #subject3'));
      assert.isTrue(subject4.matches('main:not(:has(#option:enabled)) :is(#subject3, #subject4)'));
      text_input.value = 'value';
      assert.isTrue(subject.matches('main:has(#text_input:valid) > #subject'));
      assert.isTrue(subject2.matches('main:not(:has(#text_input:invalid)) > #subject2'));
      assert.isTrue(subject3.matches('main:has(#form:valid) > #subject3'));
      assert.isTrue(subject4.matches('main:not(:has(#form:invalid)) > #subject4'));
      text_input.value = '';
      assert.isFalse(subject.matches('main:has(#text_input:valid) > #subject'));
      assert.isTrue(subject.matches('main:has(input) div'));
      assert.isFalse(subject2.matches('main:not(:has(#text_input:invalid)) > #subject2'));
      assert.isTrue(subject2.matches('main:has(input) div'));
      assert.isFalse(subject3.matches('main:has(#form:valid) > #subject3'));
      assert.isTrue(subject3.matches('main:has(input) div'));
      assert.isFalse(subject4.matches('main:not(:has(#form:invalid)) > #subject4'));
      assert.isTrue(subject4.matches('main:has(input) div'));
    });
  });

  describe('css/selectors/invalidation/host-context-pseudo-class-in-has.html', () => {
    it('should get matched node(s)', () => {
      const html = `
        <div id="host_parent"><div id="host"></div></div>
      `;
      document.body.innerHTML = html;
      const host = document.getElementById('host');
      const shadow = host.attachShadow({ mode: 'open' });
      shadow.innerHTML = `
        <style>
          .subject {
            color: red;
          }
          .subject:has(:is(:host-context(.a) > .foo .bar)) { color: green }
          .subject:has(:is(:host-context(.a) .bar)) { color: blue }
        </style>
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
      const subject1 = shadow.querySelector('#subject1');
      const subject2 = shadow.querySelector('#subject2');
      /* Before adding 'a' to #host_parent */
      assert.isTrue(subject1.matches('.subject'));
      assert.isTrue(subject2.matches('.subject'));
      /* After adding 'a' to #host_parent */
      const host_parent = document.getElementById('host_parent');
      host_parent.classList.add('a');
      assert.isTrue(subject1.matches('.subject:has(:is(:host-context(.a) > .foo .bar))'));
      assert.isTrue(subject2.matches('.subject:has(:is(:host-context(.a) .bar))'));
      /* After removing 'a' from #host_parent */
      host_parent.classList.remove('a');
      assert.isFalse(subject1.matches('.subject:has(:is(:host-context(.a) > .foo .bar))'));
      assert.isFalse(subject2.matches('.subject:has(:is(:host-context(.a) .bar))'));
    });
  });

  describe('css/selectors/invalidation/host-pseudo-class-in-has.html', () => {
    it('should get matched node(s)', () => {
      const html = `
        <div id="host_parent"><div id="host"></div></div>
      `;
      document.body.innerHTML = html;
      const host = document.getElementById('host');
      const shadow = host.attachShadow({ mode: 'open' });
      shadow.innerHTML = `
        <style>
          .subject {
            color: red;
          }
          .subject:has(:is(:host(.a) > .foo .bar)) { color: green }
          .subject:has(:is(:host(.a) .bar)) { color: blue }
        </style>
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
      const subject1 = shadow.querySelector('#subject1');
      const subject2 = shadow.querySelector('#subject2');
      /* Before adding 'a' to #host */
      assert.isTrue(subject1.matches('.subject'));
      assert.isTrue(subject2.matches('.subject'));
      /* After adding 'a' to #host */
      host.classList.add('a');
      assert.isTrue(subject1.matches('.subject:has(:is(:host(.a) > .foo .bar))'));
      assert.isTrue(subject2.matches('.subject:has(:is(:host(.a) .bar))'));
      /* After removing 'a' from #host */
      host.classList.remove('a');
      assert.isFalse(subject1.matches('.subject:has(:is(:host(.a) > .foo .bar))'));
      assert.isFalse(subject2.matches('.subject:has(:is(:host(.a) .bar))'));
    });
  });

  describe('css/selectors/invalidation/input-pseudo-classes-in-has.html', () => {
    it('should get matched node(s)', () => {
      const html = `
        <div id=subject class=ancestor>
          <input type="checkbox" name="my-checkbox" id="checkme">
          <label for="checkme">Check me!</label>
          <input type="text" id="textinput" required>
          <input id="radioinput" checked>
          <input id="numberinput" type="number" min="1" max="10" value="5">
          <progress id="progress" value="50" max="100"></progress>
          <input id="checkboxinput" type="checkbox">
        </div>
      `;
      document.body.innerHTML = html;
      const subject = document.getElementById('subject');
      const checkme = document.getElementById('checkme');
      assert.isFalse(subject.matches('.ancestor:has(#checkme:checked)'));
      assert.isFalse(subject.matches('.ancestor:has(#checkme:indeterminate)'));
      assert.isFalse(subject.matches('.ancestor:has(#checkme:disabled)'));
      checkme.checked = true;
      assert.isTrue(subject.matches('.ancestor:has(#checkme:checked)'));
      checkme.checked = false;
      checkme.indeterminate = true;
      assert.isTrue(subject.matches('.ancestor:has(#checkme:indeterminate)'));
      checkme.indeterminate = false;
      checkme.disabled = true;
      assert.isTrue(subject.matches('.ancestor:has(#checkme:disabled)'));
      checkme.disabled = false;
      let input = null;
      input = checkme;
      checkme.remove();
      assert.isFalse(subject.matches('.ancestor:has(#checkme:checked)'));
      assert.isFalse(subject.matches('.ancestor:has(#checkme:indeterminate)'));
      assert.isFalse(subject.matches('.ancestor:has(#checkme:disabled)'));
      subject.prepend(input);
      input = null;
      checkme.checked = true;
      assert.isTrue(subject.matches('.ancestor:has(#checkme:checked)'));
      checkme.checked = false;
      const progress = document.getElementById('progress');
      assert.isFalse(subject.matches('.ancestor:has(#progress:indeterminate)'));
      progress.removeAttribute('value');
      assert.isTrue(subject.matches('.ancestor:has(#progress:indeterminate)'));
      progress.setAttribute('value', '50');
      const textinput = document.getElementById('textinput');
      assert.isFalse(subject.matches('.ancestor:has(#textinput:read-only)'));
      assert.isFalse(subject.matches('.ancestor:has(#textinput:valid)'));
      assert.isFalse(subject.matches('.ancestor:has(#textinput:placeholder-shown)'));
      textinput.readOnly = true;
      assert.isTrue(subject.matches('.ancestor:has(#textinput:read-only)'));
      textinput.readOnly = false;
      textinput.value = 'text input';
      assert.isTrue(subject.matches('.ancestor:has(#textinput:valid)'));
      textinput.value = '';
      textinput.placeholder = 'placeholder text';
      assert.isTrue(subject.matches('.ancestor:has(#textinput:placeholder-shown)'));
      textinput.removeAttribute('placeholder');
      const radioinput = document.getElementById('radioinput');
      assert.isFalse(subject.matches('.ancestor:has(#radioinput:default)'));
      radioinput.type = 'radio';
      assert.isTrue(subject.matches('.ancestor:has(#radioinput:default)'));
      radioinput.removeAttribute('type');
      const numberinput = document.getElementById('numberinput');
      assert.isFalse(subject.matches('.ancestor:has(#numberinput:required)'));
      assert.isFalse(subject.matches('.ancestor:has(#numberinput:out-of-range)'));
      numberinput.required = true;
      assert.isTrue(subject.matches('.ancestor:has(#numberinput:required)'));
      numberinput.required = false;
      numberinput.value = 12;
      assert.isTrue(subject.matches('.ancestor:has(#numberinput:out-of-range)'));
      numberinput.value = 5;
      const checkboxinput = document.getElementById('checkboxinput');
      assert.isFalse(subject.matches('.ancestor:has(#checkboxinput:default)'));
      checkboxinput.checked = true;
      assert.isFalse(subject.matches('.ancestor:has(#checkboxinput:default)'));
      checkboxinput.setAttribute('checked', '');
      assert.isTrue(subject.matches('.ancestor:has(#checkboxinput:default)'));
      checkboxinput.checked = false;
      assert.isTrue(subject.matches('.ancestor:has(#checkboxinput:default)'));
      checkboxinput.removeAttribute('checked');
      assert.isFalse(subject.matches('.ancestor:has(#checkboxinput:default)'));
    });
  });

  describe('css/selectors/invalidation/is.html', () => {
    it('should get matched node(s)', () => {
      const html = `
        <div id="a1">
          <div class="b" id="b1">
            Red
          </div>
          <div class="c" id="c1">
            Red
          </div>
          <div class="c" id="d">
            Green
          </div>
          <div class="e" id="e1">
            Green
          </div>
          <div class="f" id="f1">
            Blue
          </div>
          <div class="g">
            <div class="b" id="b2">
              Blue
              <div class="b" id="b3">
                Red
              </div>
            </div>
          </div>
          <div class="h" id="h1">
            Blue
          </div>
        </div>
        <div class="c" id="c2">
          <div id="a2"></div>
          <div class="e" id="e2">
            Red
          </div>
        </div>
      `;
      document.body.innerHTML = html;
      const a1 = document.getElementById('a1');
      const a2 = document.getElementById('a2');
      const b1 = document.getElementById('b1');
      const b2 = document.getElementById('b2');
      const b3 = document.getElementById('b3');
      const c1 = document.getElementById('c1');
      const d = document.getElementById('d');
      const e2 = document.getElementById('e2');
      const f1 = document.getElementById('f1');
      const h1 = document.getElementById('h1');
      assert.isTrue(b1.matches('.b'), 'result initial');
      assert.isTrue(b3.matches('.b'), 'result initial');
      a1.className = 'a';
      assert.isTrue(b1.matches('.a :is(.b, .c)'), 'result simple');
      assert.isTrue(b3.matches('.a :is(.b, .c)'), 'result simple');
      assert.isTrue(c1.matches('.a :is(.b, .c)'), 'result simple');
      assert.isTrue(d.matches('.a :is(.c#d, .e)'), 'result compound');
      assert.isTrue(b2.matches('.a :is(.e+.f, .g>.b, .h)'), 'result complex');
      assert.isFalse(b3.matches('.a :is(.e+.f, .g>.b, .h)'), 'result complex');
      assert.isTrue(b3.matches('.a :is(.b, .c)'), 'result complex');
      assert.isTrue(f1.matches('.a :is(.e+.f, .g>.b, .h)'), 'result complex');
      assert.isTrue(e2.matches('.a+.c>.e'), 'result nested');
      a2.className = 'a';
      assert.isTrue(e2.matches('.a+:is(.b+.f, :is(.c>.e, .g))'),
        'result nested');
      assert.isTrue(h1.matches('.a :is(.e+.f, .g>.b, .h)'), 'result complex');
    });
  });

  describe('css/selectors/invalidation/is-pseudo-containing-sibling-relationship-in-has.html', () => {
    it('should get matched node(s)', () => {
      const html = `
        <div id="test-container">
          <div id="target1">
            <div class="item" id="item1">FAIL if you see this text</div>
            <div class="item"></div>
            <div class="item">This text should have a green background</div>
          </div>
          <div id="target2">
            <div class="item" id="item2">FAIL if you see this text</div>
            <div class="item"></div>
            <div class="item">This text should have a green background</div>
          </div>
          <div id="target3">
            <div class="item"></div>
            <div class="item"></div>
            <div class="item">
              <span class="child" id="item3">(FAIL if you see this text)</span>
              <span class="child"></span>
              <span class="child">This text should have a green background</span>
            </div>
          </div>
          <div id="target4">
            <div class="item"></div>
            <div class="item"></div>
            <div class="item">
              <span class="child" id="item4">(FAIL if you see this text)</span>
              <span class="child"></span>
              <span class="child">This text should have a green background</span>
            </div>
          </div>
          <div id="target5">
            <div class="item" id="item5">FAIL if you see this text</div>
            <div class="item"></div>
            <div class="item">
              <span class="child">This text should have a green background</span>
            </div>
          </div>
          <div id="target6">
            <div class="item" id="item6">FAIL if you see this text</div>
            <div class="item"></div>
            <div class="item">
              <span class="child">This text should have a green background</span>
            </div>
          </div>
          <div id="target7">
            <div class="item"></div>
            <div class="item" id="item7">FAIL if you see this text</div>
            <div class="item">
              <span class="child"></span>
              <span class="child"></span>
              <span class="child">This text should have a green background</span>
            </div>
          </div>
          <div id="target8">
            <div class="item"></div>
            <div class="item" id="item8">FAIL if you see this text</div>
            <div class="item">
              <span class="child"></span>
              <span class="child"></span>
              <span class="child">This text should have a green background</span>
            </div>
          </div>
          <div id="target9">
            <div class="item"></div>
            <div class="item" id="item9">FAIL if you see this text</div>
            <div class="item">
              <span class="child"></span>
              <span class="child"></span>
              <span class="child">This text should have a green background</span>
            </div>
          </div>
          <div id="target10">
            <div class="item" id="item10">FAIL if you see this text</div>
            <div class="item"></div>
            <div class="item">This text should have a green background</div>
          </div>
          <div id="target11">
            <div class="item"></div>
            <div class="item"></div>
            <div class="item">
              <span class="child" id="item11">(FAIL if you see this text)</span>
              <span class="child"></span>
              <span class="child">This text should have a green background</span>
            </div>
          </div>
          <div id="target12">
            <div class="item">This text should have a green background</div>
            <div class="item"></div>
            <div class="item" id="item12">FAIL if you see this text</div>
          </div>
          <div id="target13">
            <div class="item">
              <span class="child">This text should have a green background</span>
              <span class="child"></span>
              <span class="child" id="item13">(FAIL if you see this text)</span>
            </div>
            <div class="item"></div>
            <div class="item"></div>
          </div>
          <div id="target14">
            <div class="item" id="item14">FAIL if you see this text</div>
            <div class="item"></div>
            <div class="item">
              <span class="child">This text should have a green background</span>
            </div>
          </div>
          <div id="target15">
            <div class="item" id="item15">FAIL if you see this text</div>
            <div class="item"></div>
            <div class="item">
              <span class="child"></span>
              <span class="child"></span>
              <span class="child">This text should have a green background</span>
            </div>
          </div>
          <div id="target16">
            <div class="item">
              <span class="child">This text should have a green background</span>
            </div>
            <div class="item"></div>
            <div class="item" id="item16">FAIL if you see this text</div>
          </div>
          <div id="target17">
            <div class="item">
              <span class="child">This text should have a green background</span>
              <span class="child"></span>
              <span class="child"></span>
            </div>
            <div class="item"></div>
            <div class="item" id="item17">FAIL if you see this text</div>
          </div>
          <div id="target18">
            <div class="item" id="item18">FAIL if you see this text</div>
            <div class="item"></div>
            <div class="item">This text should have a green background</div>
          </div>
          <div id="target19">
            <div class="item"></div>
            <div class="item" id="item19">FAIL if you see this text</div>
            <div class="item">
              <span class="child"></span>
              <span class="child"></span>
              <span class="child">This text should have a green background</span>
            </div>
          </div>
          <div id="target20">
            <div class="item"></div>
            <div class="item" id="item20">FAIL if you see this text</div>
            <div class="item">
              <span class="child"></span>
              <span class="child"></span>
              <span class="child">This text should have a green background</span>
            </div>
          </div>
        </div>
      `;
      document.body.innerHTML = html;
      const target1 = document.getElementById('target1');
      const target2 = document.getElementById('target2');
      const target3 = document.getElementById('target3');
      const target4 = document.getElementById('target4');
      const target5 = document.getElementById('target5');
      const target6 = document.getElementById('target6');
      const target7 = document.getElementById('target7');
      const target8 = document.getElementById('target8');
      const target9 = document.getElementById('target9');
      const target10 = document.getElementById('target10');
      const target11 = document.getElementById('target11');
      const target12 = document.getElementById('target12');
      const target13 = document.getElementById('target13');
      const target14 = document.getElementById('target14');
      const target15 = document.getElementById('target15');
      const target16 = document.getElementById('target16');
      const target17 = document.getElementById('target17');
      const target18 = document.getElementById('target18');
      const target19 = document.getElementById('target19');
      const target20 = document.getElementById('target20');

      const item1 = document.getElementById('item1');
      const item2 = document.getElementById('item2');
      const item3 = document.getElementById('item3');
      const item4 = document.getElementById('item4');
      const item5 = document.getElementById('item5');
      const item6 = document.getElementById('item6');
      const item7 = document.getElementById('item7');
      const item8 = document.getElementById('item8');
      const item9 = document.getElementById('item9');
      const item10 = document.getElementById('item10');
      const item11 = document.getElementById('item11');
      const item12 = document.getElementById('item12');
      const item13 = document.getElementById('item13');
      const item14 = document.getElementById('item14');
      const item15 = document.getElementById('item15');
      const item16 = document.getElementById('item16');
      const item17 = document.getElementById('item17');
      const item18 = document.getElementById('item18');
      const item19 = document.getElementById('item19');
      const item20 = document.getElementById('item20');

      assert.isTrue(target1.matches('#target1:has(:is(.item + .item + .item))'));
      item1.remove();
      assert.isFalse(target1.matches('#target1:has(:is(.item + .item + .item))'));
      assert.isTrue(target2.matches('#target2:has(:is(.invalid .item, .item + .item + .item))'));
      item2.remove();
      assert.isFalse(target2.matches('#target2:has(:is(.invalid .item, .item + .item + .item))'));

      assert.isTrue(target3.matches('#target3:has(:is(.item + .item + .item > .child + .child + .child))'));
      item3.remove();
      assert.isFalse(target3.matches('#target3:has(:is(.item + .item + .item > .child + .child + .child))'));

      assert.isTrue(target4.matches('#target4:has(:is(.item + .item + .item > .child):is(.child + .child + .child))'));
      item4.remove();
      assert.isFalse(target4.matches('#target4:has(:is(.item + .item + .item > .child):is(.child + .child + .child))'));

      assert.isTrue(target5.matches('#target5:has(:is(.item + .item + .item > .child))'));
      item5.remove();
      assert.isFalse(target5.matches('#target5:has(:is(.item + .item + .item > .child))'));

      assert.isTrue(target6.matches('#target6:has(:is(.invalid .item, .item + .item + .item > .child))'));
      item6.remove();
      assert.isFalse(target6.matches('#target6:has(:is(.invalid .item, .item + .item + .item > .child))'));

      assert.isTrue(target7.matches('#target7:has(:is(.item + .item + .item > .child + .child + .child))'));
      item7.remove();
      assert.isFalse(target7.matches('#target7:has(:is(.item + .item + .item > .child + .child + .child))'));

      assert.isTrue(target8.matches('#target8:has(:is(.child + .child + .child):is(.item + .item + .item > .child))'));
      item8.remove();
      assert.isFalse(target8.matches('#target8:has(:is(.child + .child + .child):is(.item + .item + .item > .child))'));

      assert.isTrue(target9.matches('#target9:has(:is(:where(:is(.item + .item + .item) > .child) + .child + .child))'));
      item9.remove();
      assert.isFalse(target9.matches('#target9:has(:is(:where(:is(.item + .item + .item) > .child) + .child + .child))'));

      assert.isTrue(target10.matches('#target10:has(:is(.item:nth-child(3)))'));
      item10.remove();
      assert.isFalse(target10.matches('#target10:has(:is(.item:nth-child(3)))'));

      assert.isTrue(target11.matches('#target11:has(:is(.item:nth-child(3) > .child:nth-child(3)))'));
      item11.remove();
      assert.isFalse(target11.matches('#target11:has(:is(.item:nth-child(3) > .child:nth-child(3)))'));

      assert.isTrue(target12.matches('#target12:has(:is(.item:nth-last-child(3)))'));
      item12.remove();
      assert.isFalse(target12.matches('#target12:has(:is(.item:nth-last-child(3)))'));

      assert.isTrue(target13.matches('#target13:has(:is(.item:nth-last-child(3) > .child:nth-last-child(3)))'));
      item13.remove();
      assert.isFalse(target13.matches('#target13:has(:is(.item:nth-last-child(3) > .child:nth-last-child(3)))'));

      assert.isTrue(target14.matches('#target14:has(:is(.item:nth-child(3) > .child))'));
      item14.remove();
      assert.isFalse(target14.matches('#target14:has(:is(.item:nth-child(3) > .child))'));

      assert.isTrue(target15.matches('#target15:has(:is(.item:nth-child(3) > .child:nth-child(3)))'));
      item15.remove();
      assert.isFalse(target15.matches('#target15:has(:is(.item:nth-child(3) > .child:nth-child(3)))'));

      assert.isTrue(target16.matches('#target16:has(:is(.item:nth-last-child(3) > .child))'));
      item16.remove();
      assert.isFalse(target16.matches('#target16:has(:is(.item:nth-last-child(3) > .child))'));

      assert.isTrue(target17.matches('#target17:has(:is(.item:nth-last-child(3) > .child:nth-last-child(3)))'));
      item17.remove();
      assert.isFalse(target17.matches('#target17:has(:is(.item:nth-last-child(3) > .child:nth-last-child(3)))'));

      /* parsed CSS nesting */
      assert.isTrue(target18.matches('#target18:has(.item + .item + .item)'));
      item18.remove();
      assert.isFalse(target18.matches('#target18:has(.item + .item + .item)'));

      assert.isTrue(target19.matches('#target19:has(:is(.item + .item + .item > .child + .child + .child))'));
      item19.remove();
      assert.isFalse(target19.matches('#target19:has(:is(.item + .item + .item > .child + .child + .child))'));

      assert.isTrue(target20.matches('#target20:has(:is(.item + .item + .item > .child + .child + .child))'));
      item20.remove();
      assert.isFalse(target20.matches('#target20:has(:is(.item + .item + .item > .child + .child + .child))'));
    });
  });

  describe('css/selectors/invalidation/not-002.html', () => {
    it('should get matched node(s)', () => {
      const html = `
        <div id="a1">
          <div class="b" id="b1">
            Red
          </div>
          <div class="c" id="c1">
            Red
          </div>
          <div class="c" id="d">
            Green
          </div>
          <div class="e" id="e1">
            Green
          </div>
          <div class="f" id="f1">
            Blue
          </div>
          <div class="g">
            <div class="b" id="b2">
              Blue
              <div class="b" id="b3">
                Red
              </div>
            </div>
          </div>
          <div class="h" id="h1">
            Blue
          </div>
        </div>
        <div class="c" id="c2">
          <div id="a2"></div>
          <div class="e" id="e2">
            Red
          </div>
        </div>
      `;
      document.body.innerHTML = html;
      const a1 = document.getElementById('a1');
      const a2 = document.getElementById('a2');
      const b1 = document.getElementById('b1');
      const b2 = document.getElementById('b2');
      const b3 = document.getElementById('b3');
      const c1 = document.getElementById('c1');
      const d = document.getElementById('d');
      const e2 = document.getElementById('e2');
      const f1 = document.getElementById('f1');
      const h1 = document.getElementById('h1');
      assert.isTrue(b1.matches('.b'), 'result initial');
      assert.isTrue(b2.matches('.g>.b'), 'result initial');
      assert.isTrue(b3.matches('.b'), 'result initial');
      a1.className = 'a';
      assert.isTrue(b1.matches('.a :not(:not(.b, .c))'), 'result simple');
      assert.isTrue(b3.matches('.a :not(:not(.b, .c))'), 'result simple');
      assert.isTrue(c1.matches('.a :not(:not(.b, .c))'), 'result simple');
      assert.isTrue(d.matches('.a :not(:not(.c#d, .e))'), 'result compound');
      assert.isTrue(b2.matches('.a :not(:not(.e+.f, .g>.b, .h))'),
        'result complex');
      assert.isTrue(b3.matches('.a :not(:not(.b, .c))'), 'result complex');
      assert.isTrue(f1.matches('.a :not(:not(.e+.f, .g>.b, .h))'),
        'result complex');
      assert.isTrue(e2.matches('.a+.c>.e'), 'result nested');
      a2.className = 'a';
      assert.isTrue(e2.matches('.a+:not(:not(.b+.f, :is(.c>.e, .g)))'),
        'result nested');
      assert.isTrue(h1.matches('.a :not(:not(.e+.f, .g>.b, .h))'),
        'result complex');
    });
  });

  describe('css/selectors/invalidation/nth-child-whole-subtree.html', () => {
    it('should get matched node', () => {
      const html = `
        <style>
          div:nth-child(odd of :not(.c)) {
            background-color: silver;
          }
          .c * {}
        </style>
        <div id="d1">Silver</div>
        <div id="d2" class="c">White</div>
        <div id="d3">Silver</div>
      `;
      document.body.innerHTML = html;
      const selector = 'div:nth-child(odd of :not(.c))';
      const resBefore = document.querySelectorAll(selector);
      assert.deepEqual(resBefore, [
        document.getElementById('d1')
      ], 'result before');
      document.getElementById('d2').classList.value = '';
      const resAfter = document.querySelectorAll(selector);
      assert.deepEqual(resAfter, [
        document.getElementById('d1'),
        document.getElementById('d3')
      ], 'result after');
    });
  });

  describe('css/selectors/invalidation/placeholder-shown.html', () => {
    it('should get matched node', () => {
      const html = `
        <input id="input" type="text">
        <span id="target"></span>
      `;
      document.body.innerHTML = html;
      const input = document.getElementById('input');
      const target = document.getElementById('target');
      const selector = 'input:placeholder-shown + #target';
      assert.isFalse(target.matches(selector), 'result initial');
      input.setAttribute('placeholder', 'PLACEHOLDER');
      assert.isTrue(target.matches(selector), 'result placeholder text');
      input.setAttribute('placeholder', '');
      assert.isTrue(target.matches(selector), 'result empty placeholder text');
      input.removeAttribute('placeholder');
      assert.isFalse(target.matches(selector), 'result remove placeholder');
    });
  });

  describe('css/selectors/invalidation/sibling.html', () => {
    it('should get matched node', () => {
      const html = `
        <div>
          <div id="t1">
            <div class="sibling"></div>
            <div id="r1"></div>
            <div id="u1"></div>
          </div>
        </div>
        <div>
          <div id="t2">
            <div class="sibling"></div>
            <div></div>
            <div id="r2"></div>
          </div>
        </div>
        <div>
          <div id="t3"></div>
          <div class="sibling"></div>
          <div id="r3"></div>
        </div>
        <div>
          <div id="t4"></div>
          <div id="r4" class="sibling"></div>
          <div id="u4" class="sibling"></div>
        </div>
        <div>
          <div id="t5"></div>
          <div id="r5"></div>
          <div id="u5"></div>
        </div>
        <div>
          <div id="t6"></div>
          <div></div>
          <div id="r6" class="sibling">
            <div id="r6b"></div>
          </div>
          <div id="u6"></div>
        </div>
        <div>
          <div id="t7">
            <div class="child"></div>
          </div>
          <div></div>
          <div>
            <div id="r7" class="child"></div>
          </div>
          <div>
            <div id="u7" class="child"></div>
          </div>
        </div>
      `;
      document.body.innerHTML = html;
      const t1 = document.getElementById('t1');
      const t2 = document.getElementById('t2');
      const t3 = document.getElementById('t3');
      const t4 = document.getElementById('t4');
      const t5 = document.getElementById('t5');
      const t6 = document.getElementById('t6');
      const t7 = document.getElementById('t7');

      const r1 = document.getElementById('r1');
      const r2 = document.getElementById('r2');
      const r3 = document.getElementById('r3');
      const r4 = document.getElementById('r4');
      const r5 = document.getElementById('r5');
      const r6 = document.getElementById('r6');
      const r7 = document.getElementById('r7');

      const u1 = document.getElementById('u1');
      const u4 = document.getElementById('u4');
      const u5 = document.getElementById('u5');
      const u6 = document.getElementById('u6');
      const u7 = document.getElementById('u7');

      assert.isFalse(r1.matches('.t1 .sibling + *'));
      t1.className = 't1';
      assert.isTrue(r1.matches('.t1 .sibling + *'));
      assert.isFalse(u1.matches('.t1 .sibling + *'));

      assert.isFalse(r2.matches('.t2 .sibling ~ *'));
      t2.className = 't2';
      assert.isTrue(r2.matches('.t2 .sibling ~ *'));

      assert.isFalse(r3.matches('.t3 + .sibling + *'));
      t3.className = 't3';
      assert.isTrue(r3.matches('.t3 + .sibling + *'));

      assert.isFalse(r4.matches('.t4 + .sibling'));
      t4.className = 't4';
      assert.isTrue(r4.matches('.t4 + .sibling'));
      assert.isFalse(u4.matches('.t4 + .sibling'));

      assert.isFalse(r5.matches('.t5 + *'));
      t5.className = 't5';
      assert.isTrue(r5.matches('.t5 + *'));
      assert.isFalse(u5.matches('.t5 + *'));

      assert.isFalse(r6.matches('.t6 ~ .sibling'));
      t6.className = 't6';
      assert.isTrue(r6.matches('.t6 ~ .sibling'));
      assert.isFalse(u6.matches('.t6 ~ .sibling'));

      assert.isFalse(r7.matches('.t7 + * + * .child'));
      t7.className = 't7';
      assert.isTrue(r7.matches('.t7 + * + * .child'));
      assert.isFalse(u7.matches('.t7 + * + * .child'));
    });
  });

  describe('css/selectors/invalidation/state-in-has.html', () => {
    it('should get matched node', () => {
      const html = `
        <div id="subject">
          <my-element id="child"></my-element>
        </div>
      `;
      document.body.innerHTML = html;
      window.customElements.define('my-element', class MyElement extends window.HTMLElement {
        connectedCallback() {
          this.elementInternals = this.attachInternals();
          // patch CustomStateSet
          if (!this.elementInternals.states) {
            this.elementInternals.states = new Set();
          }
        }
      });
      const subject = document.getElementById('subject');
      const child = document.getElementById('child');
      child.elementInternals.states.add('--green');
      assert.isTrue(subject.matches('#subject:has(:state(--green))'));
      child.elementInternals.states.clear();
      assert.isFalse(subject.matches('#subject:has(:state(--green))'));

      child.elementInternals.states.add('--blue');
      assert.isTrue(subject.matches('#subject:has(:state(--blue))'));
      child.elementInternals.states.clear();
      assert.isFalse(subject.matches('#subject:has(:state(--blue))'));

      child.elementInternals.states.add('--green');
      child.elementInternals.states.add('--blue');
      assert.isTrue(subject.matches('#subject:has(:state(--blue))'));
      child.elementInternals.states.delete('--blue');
      assert.isFalse(subject.matches('#subject:has(:state(--blue))'));
      assert.isTrue(subject.matches('#subject:has(:state(--green))'));
      child.elementInternals.states.delete('--green');
      assert.isFalse(subject.matches('#subject:has(:state(--green))'));
    });
  });

  describe('css/selectors/invalidation/subject-has-invalidation-with-display-none-anchor-element.html', () => {
    it('should get matched node', () => {
      const html = `
        <p>Click checkbox</p>
        <div id="target">PASS</div>
        <input type="checkbox" id="checkme">
        <label for="checkme">Check me!</label>
      `;
      document.body.innerHTML = html;
      const checkme = document.getElementById('checkme');
      const target = document.getElementById('target');
      const selector = '#target:has(~ input:checked)';
      checkme.checked = false;
      assert.isFalse(target.matches(selector), 'result initial');
      checkme.checked = true;
      assert.isTrue(target.matches(selector), 'result checked');
      checkme.checked = false;
      assert.isFalse(target.matches(selector), 'result unchecked');
    });
  });

  describe('css/selectors/invalidation/where.html', () => {
    it('should get matched node', () => {
      const html = `
        <div id="a1">
          <div class="g">
          </div>
          <div class="h">
          </div>
          <div class="i" id="i1">
            Blue
          </div>
        </div>
        <div class="b" id="b1">
          Yellow
        </div>
        <div class="c" id="c1">
          Red
        </div>
        <div class="c" id="d">
          Green
        </div>
        <div class="h" id="h1">
          Red
        </div>
        <div class="f" id="f1">
          Yellow
        </div>
      `;
      document.body.innerHTML = html;
      const a1 = document.getElementById('a1');
      const b1 = document.getElementById('b1');
      const c1 = document.getElementById('c1');
      const d = document.getElementById('d');
      const f1 = document.getElementById('f1');
      const h1 = document.getElementById('h1');
      const i1 = document.getElementById('i1');
      assert.isTrue(b1.matches('.b'), 'result initial');
      assert.isTrue(b1.matches(':where(.b, .c)'), 'result initial');
      assert.isTrue(c1.matches(':where(.b, .c)'), 'result initial');
      assert.isTrue(d.matches(':where(.b, .c)'), 'result initial');
      assert.isTrue(h1.matches('.h'), 'result initial');
      a1.className = 'a';
      assert.isTrue(d.matches('.a~:where(.c#d, .e)'), 'result compound');
      assert.isTrue(h1.matches('.h'), 'result complex');
      assert.isTrue(h1.matches(':where(.a~.h, .a~.h+.f)'), 'result complex');
      assert.isTrue(f1.matches(':where(.a~.h, .a~.h+.f)'), 'result complex');
      assert.isTrue(i1.matches(':where(.a>:where(.g+.h, .b)~.i)'),
        'result nested');
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

    it('should get empty array', () => {
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

  describe('css/selectors/is-where-pseudo-classes.html', () => {
    it('should get matched node(s)', () => {
      const html = `
        <main>
          <button id=a>A</button>
          <button id=b>B</button>
          <button id=c>C</button>
          <button id=d disabled>D</button>
          <button id=e disabled>E</button>
          <button id=f disabled>F</button>
        </main>
      `;
      document.body.innerHTML = html;
      /* Selects #a, #c */
      const selectorA =
        ':is(main :where(main #a), #c:nth-child(odd), #d):is(:enabled)';
      /* Selects #b, #d, #f */
      const selectorB =
        'button:is(:nth-child(even), span #e):is(:enabled, :where(:disabled))';
      assert.isTrue(document.getElementById('a').matches(selectorA), 'a');
      assert.isTrue(document.getElementById('b').matches(selectorB), 'b');
      assert.isTrue(document.getElementById('c').matches(selectorA), 'c');
      assert.isTrue(document.getElementById('d').matches(selectorB), 'd');
      assert.isFalse(document.getElementById('e').matches(selectorA), 'e-1');
      assert.isFalse(document.getElementById('e').matches(selectorB), 'e-2');
      assert.isTrue(document.getElementById('f').matches(selectorB), 'f');
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

    it('should get matched node', () => {
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

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const container = document.getElementById('container');
      const res = container.querySelectorAll('span:not([class');
      assert.strictEqual(res.length, 1, 'result');
    });

    it('should get matched node', () => {
      document.body.innerHTML = html;
      const container = document.getElementById('container');
      const res = container.querySelectorAll(':is(span, p):not([class]');
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

  describe('css/selectors/nth-of-type-namespace.html', () => {
    it('should get matched node(s)', () => {
      const html = '<div id="container"></div>';
      document.body.innerHTML = html;
      const container = document.getElementById('container');
      for (let i = 0; i < 99; i++) {
        container.appendChild(document.createElement('span'));
      }
      const test_span = document.createElement('span');
      test_span.setAttribute('test-span', '');
      container.appendChild(test_span);
      for (let i = 0; i < 99; i++) {
        container.appendChild(document.createElementNS('http://dummy1/', 'span'));
      }
      const test_span_ns1 = document.createElementNS('http://dummy1/', 'span');
      test_span_ns1.setAttribute('test-span', '');
      container.appendChild(test_span_ns1);
      for (let i = 0; i < 99; i++) {
        container.appendChild(document.createElementNS('http://dummy2/', 'span'));
      }
      const test_span_ns2 = document.createElementNS('http://dummy2/', 'span');
      test_span_ns2.setAttribute('test-span', '');
      container.appendChild(test_span_ns2);
      const qsa = container.querySelectorAll('[test-span]');
      assert.deepEqual(qsa, [
        test_span,
        test_span_ns1,
        test_span_ns2
      ]);
      for (const node of qsa) {
        assert.isTrue(node.matches('[test-span]:nth-of-type(100)'),
          `${node.localName} with ${node.namespaceURI} matches`);
      }
    });
  });

  describe('css/selectors/scope-selector.html', () => {
    it('querySelector() with ":scope" should return the document element, if present in the subtree', () => {
      const html = '<div id=\'shadowHost\'></div>';
      document.body.innerHTML = html;
      const shadowHost = document.getElementById('shadowHost');
      const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
      shadowRoot.appendChild(document.createElement('div'));

      const res1 = shadowRoot.querySelectorAll(':scope > div');
      assert.deepEqual(res1, [], 'should not match in shadow root');

      const documentFragment = document.createDocumentFragment();
      documentFragment.appendChild(document.createElement('div'));
      const res2 = documentFragment.querySelectorAll(':scope > div');
      assert.deepEqual(res2, [], 'should not match in document fragment');

      const res3 = shadowRoot.firstChild.querySelector(':scope');
      assert.isNull(res3, 'should not match');
      const res4 = shadowRoot.firstChild.querySelectorAll(':scope');
      assert.deepEqual(res4, [], 'should not match');

      const res5 = shadowRoot.querySelector(':scope');
      assert.isNull(res5, 'should not match');
      const res6 = shadowRoot.querySelectorAll(':scope');
      assert.deepEqual(res6, [], 'should not match');

      const res7 = documentFragment.querySelector(':scope');
      assert.isNull(res7, 'should not match');
      const res8 = documentFragment.querySelectorAll(':scope');
      assert.deepEqual(res8, [], 'should not match');

      const res9 = document.querySelector(':scope');
      assert.deepEqual(res9, document.documentElement,
        'should match the document element');
      const res10 = document.querySelectorAll(':scope');
      assert.deepEqual(res10, [
        document.documentElement
      ], 'should match the document element');
    });
  });

  describe('css/selectors/selectors-case-sensitive-001.html', () => {
    it('should get matched node(s)', () => {
      const html = '<div id="container"></div>';
      document.body.innerHTML = html;
      const container = document.getElementById('container');
      const test_element = document.createElement('\u212A');
      container.appendChild(test_element);
      const test_element_with_ns =
        document.createElementNS('https://dummy.ns', '\u212A');
      container.appendChild(test_element_with_ns);
      assert.isTrue(test_element.matches('\u212A'));
      assert.isTrue(test_element_with_ns.matches('\u212A'));
      assert.isNull(container.querySelector('k'));
      assert.isNull(container.querySelector('\u212A'.toLowerCase()));
    });
  });

  describe('dom/nodes/Element-matches.html', () => {
    it('should match', () => {
      const html = `<div id="universal">
        <p id="universal-p1">Universal selector tests inside element with <code id="universal-code1">id="universal"</code>.</p>
        <hr id="universal-hr1">
        <pre id="universal-pre1">Some preformatted text with some <span id="universal-span1">embedded code</span></pre>
        <p id="universal-p2">This is a normal link: <a id="universal-a1" href="http://www.w3.org/">W3C</a></p>
        <address id="universal-address1">Some more nested elements <code id="universal-code2"><a href="#" id="universal-a2">code hyperlink</a></code></address>
      </div>
      `;
      document.body.innerHTML = html;
      const node = document.getElementById('universal-a1');
      const res = node.matches('*');
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const html = `<div id="universal">
        <p id="universal-p1">Universal selector tests inside element with <code id="universal-code1">id="universal"</code>.</p>
        <hr id="universal-hr1">
        <pre id="universal-pre1">Some preformatted text with some <span id="universal-span1">embedded code</span></pre>
        <p id="universal-p2">This is a normal link: <a id="universal-a1" href="http://www.w3.org/">W3C</a></p>
        <address id="universal-address1">Some more nested elements <code id="universal-code2"><a href="#" id="universal-a2">code hyperlink</a></code></address>
      </div>
      `;
      document.body.innerHTML = html;
      const node = document.getElementById('universal-a1');
      const res = node.matches('#universal>*>*');
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const html = `<div id="universal">
        <p id="universal-p1">Universal selector tests inside element with <code id="universal-code1">id="universal"</code>.</p>
        <hr id="universal-hr1">
        <pre id="universal-pre1">Some preformatted text with some <span id="universal-span1">embedded code</span></pre>
        <p id="universal-p2">This is a normal link: <a id="universal-a1" href="http://www.w3.org/">W3C</a></p>
        <address id="universal-address1">Some more nested elements <code id="universal-code2"><a href="#" id="universal-a2">code hyperlink</a></code></address>
      </div>
      `;
      document.body.innerHTML = html;
      const node = document.getElementById('universal-a1');
      const res = node.matches('#universal *');
      assert.isTrue(res, 'result');
    });
  });

  describe('dom/nodes/ParentNode-querySelector-All.html', () => {
    it('should throw', () => {
      const node = document.createElement('div');
      assert.throws(() => node.querySelector('[class= space unquoted ]'),
        'Invalid selector [class=space unquoted]', 'message');
    });

    it('should throw', () => {
      const node = document.createElement('div');
      assert.throws(() => node.querySelector('div:example'),
        'Unknown pseudo-class :example');
    });

    it('should throw', () => {
      const node = document.createElement('div');
      assert.throws(() => node.querySelectorAll('div:example'),
        'Unknown pseudo-class :example');
    });

    it('should throw', () => {
      const node = document.createElement('div');
      assert.throws(() => node.querySelector('ns|div'),
        'Undeclared namespace ns');
    });

    it('should throw', () => {
      const node = document.createElement('div');
      assert.throws(() => node.querySelector(':not(ns|div)'),
        'Undeclared namespace ns');
    });

    it('should get matched node(s)', () => {
      const html = `
        <div id="root">
          <div id="descendant">
            <div id="descendant-div1" class="descendant-div1">
              <div id="descendant-div2" class="descendant-div2">
                <div id="descendant-div3" class="descendant-div3">
                </div>
              </div>
            </div>
            <div id="descendant-div4" class="descendant-div4"></div>
          </div>
        </div>
      `;
      document.body.innerHTML = html;
      const root = document.getElementById('root');
      const node = document.getElementById('descendant-div3');
      const clone = root.cloneNode(true);
      document.body.appendChild(clone);
      const res = root.querySelectorAll('.descendant-div1 .descendant-div3');
      assert.deepEqual(res, [
        node
      ], 'result');
    });

    it('should not match', () => {
      const html = `
        <div id="root">
          <div id="attr-whitespace">
            <div id="attr-whitespace-div1" class="foo div1 bar"></div>
              <div id="attr-whitespace-div2" class=""></div>
              <div id="attr-whitespace-div3" class="foo div3 bar"></div>
              <div id="attr-whitespace-div4" data-attr-whitespace="foo &#xE9; bar"></div>
              <div id="attr-whitespace-div5" data-attr-whitespace_foo="&#xE9; foo"></div>
            <a id="attr-whitespace-a1" rel="next bookmark"></a>
            <a id="attr-whitespace-a2" rel="tag nofollow"></a>
            <a id="attr-whitespace-a3" rel="tag bookmark"></a>
            <a id="attr-whitespace-a4" rel="book mark"></a> <!-- Intentional space in "book mark" -->
            <a id="attr-whitespace-a5" rel="nofollow"></a>
            <a id="attr-whitespace-a6" rev="bookmark nofollow"></a>
            <a id="attr-whitespace-a7" rel="prev next tag alternate nofollow author help icon noreferrer prefetch search stylesheet tag"></a>
            <p id="attr-whitespace-p1" title="Chinese 中文 characters"></p>
          </div>
        </div>
      `;
      document.body.innerHTML = html;
      const root = document.getElementById('root');
      const res = root.querySelectorAll('#attr-whitespace a[rel~="book mark"]');
      assert.deepEqual(res, [], 'result');
    });

    it('should not match', () => {
      const html = `
        <div id="root">
          <div id="attr-whitespace">
            <div id="attr-whitespace-div1" class="foo div1 bar"></div>
              <div id="attr-whitespace-div2" class=""></div>
              <div id="attr-whitespace-div3" class="foo div3 bar"></div>
              <div id="attr-whitespace-div4" data-attr-whitespace="foo &#xE9; bar"></div>
              <div id="attr-whitespace-div5" data-attr-whitespace_foo="&#xE9; foo"></div>
            <a id="attr-whitespace-a1" rel="next bookmark"></a>
            <a id="attr-whitespace-a2" rel="tag nofollow"></a>
            <a id="attr-whitespace-a3" rel="tag bookmark"></a>
            <a id="attr-whitespace-a4" rel="book mark"></a> <!-- Intentional space in "book mark" -->
            <a id="attr-whitespace-a5" rel="nofollow"></a>
            <a id="attr-whitespace-a6" rev="bookmark nofollow"></a>
            <a id="attr-whitespace-a7" rel="prev next tag alternate nofollow author help icon noreferrer prefetch search stylesheet tag"></a>
            <p id="attr-whitespace-p1" title="Chinese 中文 characters"></p>
          </div>
        </div>
      `;
      document.body.innerHTML = html;
      const root = document.getElementById('root');
      const res = root.querySelector('#attr-whitespace a[rel~="book mark"]');
      assert.isNull(res, 'result');
    });

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

  describe('html/semantics/selectors/pseudo-classes/checked-type-change.html', () => {
    it('should get matched node', () => {
      const html = `
        <input id="input" type="text" checked>
        <span id="sibling">This text should be green.</span>
      `;
      document.body.innerHTML = html;
      const input = document.getElementById('input');
      const node = document.getElementById('sibling');
      assert.isFalse(node.matches(':checked + span'), 'result');
      input.type = 'radio';
      assert.isTrue(node.matches(':checked + span'), 'result');
    });
  });

  describe('html/semantics/selectors/pseudo-classes/checked.html', () => {
    it('should get matched node(s)', async () => {
      const html = `
        <select id=select1>
          <optgroup label="options" id=optgroup1>
          <option value="option1" id=option1 selected>option1
          <option value="option2" id=option2>option2
          <option value="option2" id=option3 checked>option3
        </select>
        <input type=checkbox id=checkbox1 checked>
        <input type=checkbox id=checkbox2>
        <input type=checkbox id=checkbox3 selected>
        <input type=radio id=radio1 checked>
        <input type=radio id=radio2>
        <form>
          <p><input type=submit contextmenu=formmenu id="submitbutton"></p>
          <menu type=context id=formmenu>
            <!-- historical; these should *not* match -->
            <menuitem type=checkbox checked default id=menuitem1>
            <menuitem type=checkbox default id=menuitem2>
            <menuitem type=checkbox id=menuitem3>
            <menuitem type=radio checked id=menuitem4>
            <menuitem type=radio id=menuitem5>
          </menu>
        </form>
      `;
      document.body.innerHTML = html;
      document.getElementById('checkbox1').removeAttribute('type');
      document.getElementById('radio1').removeAttribute('type');
      document.getElementById('option2').selected = 'selected';
      document.getElementById('checkbox2').click();
      document.getElementById('radio2').click();
      await sleep();
      const res = document.querySelectorAll(':checked');
      assert.deepEqual(res, [
        document.getElementById('option2'),
        document.getElementById('checkbox2'),
        document.getElementById('radio2')
      ], 'result');
    });
  });

  describe('html/semantics/selectors/pseudo-classes/disabled.html', () => {
    it('should get matched node(s)', () => {
      const html = `
        <fieldset disabled id=fieldset>
          <legend><input type=checkbox id=club></legend>
          <p><label>Name on card: <input id=clubname required></label></p>
          <p><label>Card number: <input id=clubnum required pattern="[-0-9]+"></label></p>
        </fieldset>
        <label disabled></label>
        <object disabled></object>
        <output disabled></output>
        <img disabled/>
        <meter disabled></meter>
        <progress disabled></progress>
      `;
      document.body.innerHTML = html;
      const fieldset = document.createElement('fieldset');
      fieldset.id = 'fieldset_nested';
      fieldset.innerHTML = `
        <input id=input_nested>
        <button id=button_nested>button nested</button>
        <select id=select_nested>
          <optgroup label="options" id=optgroup_nested>
            <option value="options" id=option_nested>option nested</option>
          </optgroup>
        </select>
        <textarea id=textarea_nested>textarea nested</textarea>
        <object id=object_nested></object>
        <output id=output_nested></output>
        <fieldset id=fieldset_nested2>
          <input id=input_nested2>
        </fieldset>
      `;
      document.getElementById('fieldset').appendChild(fieldset);
      const res = document.querySelectorAll(':disabled');
      assert.deepEqual(res, [
        document.getElementById('fieldset'),
        document.getElementById('clubname'),
        document.getElementById('clubnum'),
        document.getElementById('fieldset_nested'),
        document.getElementById('input_nested'),
        document.getElementById('button_nested'),
        document.getElementById('select_nested'),
        document.getElementById('textarea_nested'),
        document.getElementById('fieldset_nested2'),
        document.getElementById('input_nested2')
      ], 'result');
    });
  });

  describe('html/semantics/selectors/pseudo-classes/enabled.html', () => {
    it('should get matched node(s)', () => {
      const html = `
        <a id=link3></a>
        <area id=link4></area>
        <link id=link5></link>
        <a href="http://www.w3.org" id=link6></a>
        <area href="http://www.w3.org" id=link7></area>
        <link href="http://www.w3.org" id=link8></link>
        <button id=button1>button1</button>
        <button id=button2 disabled>button2</button>
        <input id=input1>
        <input id=input2 disabled>
        <select id=select1>
          <optgroup label="options" id=optgroup1>
            <option value="option1" id=option1 selected>option1
        </select>
        <select disabled id=select2>
          <optgroup label="options" disabled id=optgroup2>
            <option value="option2" disabled id=option2>option2
        </select>
        <textarea id=textarea1>textarea1</textarea>
        <textarea disabled id=textarea2>textarea2</textarea>
        <form>
          <p><input type=submit contextmenu=formmenu id=submitbutton></p>
          <menu type=context id=formmenu>
            <!-- historical; these should *not* match -->
            <menuitem command="submitbutton" default id=menuitem1>
            <menuitem command="resetbutton" disabled id=menuitem2>
          </menu>
        </form>
        <fieldset id=fieldset1></fieldset>
        <fieldset disabled id=fieldset2></fieldset>
      `;
      document.body.innerHTML = html;
      assert.deepEqual(document.querySelectorAll(':enabled'), [
        document.getElementById('button1'),
        document.getElementById('input1'),
        document.getElementById('select1'),
        document.getElementById('optgroup1'),
        document.getElementById('option1'),
        document.getElementById('textarea1'),
        document.getElementById('submitbutton'),
        document.getElementById('fieldset1')
      ]);
    });
  });

  describe('html/semantics/selectors/pseudo-classes/indeterminate-radio.html', () => {
    it('should get matched node', () => {
      const html = `
        <input type="radio" name="radios">
        <div id="test"></div>
        <input type="radio" name="radios" checked>
      `;
      document.body.innerHTML = html;
      document.getElementsByTagName('input')[0].indeterminate = true;
      const node = document.getElementById('test');
      assert.isFalse(node.matches('input:indeterminate + #test'), 'result');
    });
  });

  describe('html/semantics/selectors/pseudo-classes/indeterminate-type-change.html', () => {
    it('should get matched node', () => {
      const html = `
        <input id="input" type="text">
        <span id="sibling">This text should be green.</span>
      `;
      document.body.innerHTML = html;
      const input = document.getElementById('input');
      const node = document.getElementById('sibling');
      assert.isFalse(node.matches(':indeterminate + span'), 'result');
      input.type = 'radio';
      assert.isTrue(node.matches(':indeterminate + span'), 'result');
    });
  });

  describe('html/semantics/selectors/pseudo-classes/inrange-outofrange-type-change.html', () => {
    it('should get matched node', () => {
      const html = `
        <input id="input" type="text" min="0" max="10" value="5">
        <span id="sibling">This text should be green.</span>
      `;
      document.body.innerHTML = html;
      const input = document.getElementById('input');
      const node = document.getElementById('sibling');
      assert.isFalse(node.matches(':in-range + span'), 'result');
      input.type = 'number';
      assert.isTrue(node.matches(':in-range + span'), 'result');
    });

    it('should get matched node', () => {
      const html = `
        <input id="input" type="text" min="0" max="10" value="50">
        <span id="sibling">This text should be green.</span>
      `;
      document.body.innerHTML = html;
      const input = document.getElementById('input');
      const node = document.getElementById('sibling');
      assert.isFalse(node.matches(':out-of-range + span'), 'result');
      input.type = 'number';
      assert.isTrue(node.matches(':out-of-range + span'), 'result');
    });
  });

  describe('html/semantics/selectors/pseudo-classes/invalid-after-clone.html', () => {
    it('should get matched node', () => {
      const html = '<input id="input">';
      document.body.innerHTML = html;
      const input = document.getElementById('input');
      input.value = 'foo';
      assert.isTrue(input.matches(':valid'), 'match :valid');
      assert.isTrue(input.validity.valid, 'valid');
      input.maxLength = 0;
      assert.isTrue(input.matches(':invalid'), 'match :invalid');
      // jsdom fails
      // assert.isFalse(input.validity.valid, 'invalid');
      const clone = input.cloneNode(true);
      assert.isTrue(clone.matches(':invalid'), 'match :invalid');
      // jsdom fails
      // assert.isFalse(clone.validity.valid, 'invalid');
    });

    it('should get matched node', () => {
      const html = '<textarea id="textarea"></textarea>';
      document.body.innerHTML = html;
      const input = document.getElementById('textarea');
      input.value = 'foo';
      assert.isTrue(input.matches(':valid'), 'match :valid');
      assert.isTrue(input.validity.valid, 'valid');
      input.maxLength = 0;
      assert.isTrue(input.matches(':invalid'), 'match :invalid');
      // jsdom fails
      // assert.isFalse(input.validity.valid, 'invalid');
      const clone = input.cloneNode(true);
      assert.isTrue(clone.matches(':invalid'), 'match :invalid');
      // jsdom fails
      // assert.isFalse(clone.validity.valid, 'invalid');
    });
  });

  describe('html/semantics/selectors/pseudo-classes/placeholder-shown-type-change.html', () => {
    it('should get matched node', () => {
      const html = `
        <input id="input" type="submit" placeholder="placeholder">
        <span id="sibling">This text should be green.</span>
      `;
      document.body.innerHTML = html;
      const input = document.getElementById('input');
      const node = document.getElementById('sibling');
      assert.isFalse(node.matches(':placeholder-shown + span'), 'result');
      input.type = 'text';
      assert.isTrue(node.matches(':placeholder-shown + span'), 'result');
    });
  });

  describe('html/semantics/selectors/pseudo-classes/required-optional-hidden.html', () => {
    it('should get matched node', () => {
      const html = `
        <input id="input" type="hidden" required>
        <span id="sibling">This text should be green.</span>
      `;
      document.body.innerHTML = html;
      const input = document.getElementById('input');
      const node = document.getElementById('sibling');
      assert.isFalse(node.matches(':required + span'), 'result');
      input.type = 'text';
      assert.isTrue(node.matches(':required + span'), 'result');
    });

    it('should get matched node', () => {
      const html = `
        <input id="input" type="hidden" required>
        <span id="sibling">This text should be green.</span>
      `;
      document.body.innerHTML = html;
      const input = document.getElementById('input');
      const node = document.getElementById('sibling');
      assert.isTrue(node.matches(':not(:optional) + span'), 'result');
      input.type = 'text';
      assert.isTrue(node.matches(':not(:optional) + span'), 'result');
    });
  });

  describe('html/semantics/selectors/pseudo-classes/valid-invalid.html', () => {
    it('should get matched node', () => {
      const html = `
        <div id="styleTests">
          <fieldset id="empty">
          </fieldset>
        </div>
      `;
      document.body.innerHTML = html;
      const node = document.getElementById('empty');
      assert.isTrue(node.matches('#styleTests > :valid'), 'result');
    });

    it('should get matched node', () => {
      const html = `
        <div id="styleTests">
          <fieldset id="empty">
          </fieldset>
        </div>
      `;
      document.body.innerHTML = html;
      const node = document.getElementById('empty');
      assert.isFalse(node.matches('#styleTests > :invalid'), 'result');
    });
  });

  describe('to-upstream/cssom/getComputedStyle-mutations.html', () => {
    it('should get matched node', () => {
      const html = `
        <a class="my-link">Hello world</a>
      `;
      document.body.innerHTML = html;
      const node = document.querySelector('.my-link');
      assert.isTrue(node.matches('.my-link'), 'result');
      node.href = '#x';
      assert.isTrue(node.matches('.my-link[href]'), 'result append attr');
      node.setAttribute('href', '#a');
      assert.isTrue(node.matches('.my-link[href="#a"]'), 'result change attr');
      const attr = document.createAttribute('href');
      attr.value = '#b';
      node.attributes.setNamedItem(attr);
      assert.isTrue(node.matches('.my-link[href="#b"]'), 'result replace attr');
      node.removeAttribute('href');
      assert.isTrue(node.matches('.my-link'), 'result remove attr');
      assert.isFalse(node.matches('.my-link[href]'), 'result remove attr');
      node.textContent = '';
      assert.isTrue(node.matches('.my-link'), 'result :empty');
      assert.isTrue(node.matches('.my-link:empty'), 'result :empty');
    });
  });

  describe('jsdom: to-port-to-wpts/query-selector-all.js', () => {
    it('should get matched node(s)', () => {
      const html = `
        <span>Hello!<strong>Goodbye!</strong><strong>Hello Again</strong></span>
        <p>This is an <em>Important</em> paragraph</p>
      `;
      document.body.innerHTML = html;
      const res = document.querySelectorAll(['strong', 'em']);
      assert.strictEqual(res.length, 3, 'length');
      assert.strictEqual(res[0].localName, 'strong', 'node');
      assert.strictEqual(res[1].localName, 'strong', 'node');
      assert.strictEqual(res[2].localName, 'em', 'node');
    });

    it('should get matched node(s)', () => {
      const html = `
        <span>Hello!<strong>Goodbye!</strong><strong>Hello Again</strong></span>
        <p>This is an <em>Important</em> paragraph</p>
      `;
      document.body.innerHTML = html;
      const stringifiableObj = {
        toString() {
          return 'p';
        }
      };
      const res = document.querySelectorAll(stringifiableObj);
      assert.strictEqual(res.length, 1, 'length');
      assert.strictEqual(res[0].localName, 'p', 'node');
    });
  });
});
