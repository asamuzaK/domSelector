/**
 * index.test.js
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

describe('exported api', () => {
  const domStr =
    '<!doctype html><html lang="en"><head></head><body></body></html>';
  const domOpt = {
    runScripts: 'dangerously',
    url: 'http://localhost/'
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
      assert.throws(() => matches('*|', document.body), DOMException);
    });

    it('should match', () => {
      const node = document.createElementNS('', 'element');
      const res = node.matches('element');
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const node = document.createElementNS('urn:ns', 'h');
      const res = node.matches('h');
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const node = document.createElementNS('urn:ns', 'h');
      const res = node.matches('*|h');
      assert.isTrue(res, 'result');
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

    it('should match', () => {
      const domStr = `<table id="pseudo-nth-table1">
        <tr id="pseudo-nth-tr1">
          <td id="pseudo-nth-td1"></td>
          <td id="pseudo-nth-td2"></td>
          <td id="pseudo-nth-td3"></td>
          <td id="pseudo-nth-td4"></td>
          <td id="pseudo-nth-td5"></td>
          <td id="pseudo-nth-td6"></td>
        </tr>
        <tr id="pseudo-nth-tr2">
          <td id="pseudo-nth-td7"></td>
          <td id="pseudo-nth-td8"></td>
          <td id="pseudo-nth-td9"></td>
          <td id="pseudo-nth-td10"></td>
          <td id="pseudo-nth-td11"></td>
          <td id="pseudo-nth-td12"></td>
        </tr>
        <tr id="pseudo-nth-tr3">
          <td id="pseudo-nth-td13"></td>
          <td id="pseudo-nth-td14"></td>
          <td id="pseudo-nth-td15"></td>
          <td id="pseudo-nth-td16"></td>
          <td id="pseudo-nth-td17"></td>
          <td id="pseudo-nth-td18"></td>
        </tr>
      </table>`;
      document.body.innerHTML = domStr;
      const node = document.getElementById('pseudo-nth-tr1');
      const res = matches('#pseudo-nth-table1 :nth-last-child(3)', node);
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const domStr = `<p id="pseudo-nth-p1">
        <span id="pseudo-nth-span1">span1</span>
        <em id="pseudo-nth-em1">em1</em>
        <!-- comment node-->
        <em id="pseudo-nth-em2">em2</em>
        <span id="pseudo-nth-span2">span2</span>
        <strong id="pseudo-nth-strong1">strong1</strong>
        <em id="pseudo-nth-em3">em3</em>
        <span id="pseudo-nth-span3">span3</span>
        <span id="pseudo-nth-span4">span4</span>
        <strong id="pseudo-nth-strong2">strong2</strong>
        <em id="pseudo-nth-em4">em4</em>
      </p>`;
      document.body.innerHTML = domStr;
      const node = document.getElementById('pseudo-nth-em2');
      const res = matches('#pseudo-nth-p1 :nth-child(4n-1)', node);
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const domStr = `<p id="pseudo-nth-p1">
        <span id="pseudo-nth-span1">span1</span>
        <em id="pseudo-nth-em1">em1</em>
        <!-- comment node-->
        <em id="pseudo-nth-em2">em2</em>
        <span id="pseudo-nth-span2">span2</span>
        <strong id="pseudo-nth-strong1">strong1</strong>
        <em id="pseudo-nth-em3">em3</em>
        <span id="pseudo-nth-span3">span3</span>
        <span id="pseudo-nth-span4">span4</span>
        <strong id="pseudo-nth-strong2">strong2</strong>
        <em id="pseudo-nth-em4">em4</em>
      </p>`;
      document.body.innerHTML = domStr;
      const node = document.getElementById('pseudo-nth-span2');
      const res = matches('#pseudo-nth-p1 :nth-last-child(4n-1)', node);
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const domStr = `<p id="pseudo-nth-p1">
        <span id="pseudo-nth-span1">span1</span>
        <em id="pseudo-nth-em1">em1</em>
        <!-- comment node-->
        <em id="pseudo-nth-em2">em2</em>
        <span id="pseudo-nth-span2">span2</span>
        <strong id="pseudo-nth-strong1">strong1</strong>
        <em id="pseudo-nth-em3">em3</em>
        <span id="pseudo-nth-span3">span3</span>
        <span id="pseudo-nth-span4">span4</span>
        <strong id="pseudo-nth-strong2">strong2</strong>
        <em id="pseudo-nth-em4">em4</em>
      </p>`;
      document.body.innerHTML = domStr;
      const node = document.getElementById('pseudo-nth-em2');
      const res = matches('#pseudo-nth-p1 :nth-of-type(2n)', node);
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const domStr = `<p id="pseudo-nth-p1">
        <span id="pseudo-nth-span1">span1</span>
        <em id="pseudo-nth-em1">em1</em>
        <!-- comment node-->
        <em id="pseudo-nth-em2">em2</em>
        <span id="pseudo-nth-span2">span2</span>
        <strong id="pseudo-nth-strong1">strong1</strong>
        <em id="pseudo-nth-em3">em3</em>
        <span id="pseudo-nth-span3">span3</span>
        <span id="pseudo-nth-span4">span4</span>
        <strong id="pseudo-nth-strong2">strong2</strong>
        <em id="pseudo-nth-em4">em4</em>
      </p>`;
      document.body.innerHTML = domStr;
      const node = document.getElementById('pseudo-nth-span1');
      const res = matches('#pseudo-nth-p1 :nth-last-of-type(2n)', node);
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const domStr = `<div id="not">
        <div id="not-div1"></div>
        <div id="not-div2"></div>
        <div id="not-div3"></div>
        <p id="not-p1"><span id="not-span1"></span><em id="not-em1"></em></p>
        <p id="not-p2"><span id="not-span2"></span><em id="not-em2"></em></p>
        <p id="not-p3"><span id="not-span3"></span><em id="not-em3"></em></p>
      </div>`;
      document.body.innerHTML = domStr;
      const node = document.getElementById('not-em1');
      const res = matches('#not * :not(:first-child)', node);
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const domStr = `<div id="not">
        <div id="not-div1"></div>
        <div id="not-div2"></div>
        <div id="not-div3"></div>
        <p id="not-p1"><span id="not-span1"></span><em id="not-em1"></em></p>
        <p id="not-p2"><span id="not-span2"></span><em id="not-em2"></em></p>
        <p id="not-p3"><span id="not-span3"></span><em id="not-em3"></em></p>
      </div>`;
      document.body.innerHTML = domStr;
      const node = document.getElementById('not-p1');
      const res = matches('#not>:not( div )', node);
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const domStr = `<div id="universal">
        <p id="universal-p1">Universal selector tests inside element with <code id="universal-code1">id="universal"</code>.</p>
        <hr id="universal-hr1">
        <pre id="universal-pre1">Some preformatted text with some <span id="universal-span1">embedded code</span></pre>
        <p id="universal-p2">This is a normal link: <a id="universal-a1" href="http://www.w3.org/">W3C</a></p>
        <address id="universal-address1">Some more nested elements <code id="universal-code2"><a href="#" id="universal-a2">code hyperlink</a></code></address>
      </div>`;
      document.body.innerHTML = domStr;
      const node = document.getElementById('universal-p1');
      const res = matches('#universal>*', node);
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const domStr = `<div id="attr-presence">
        <div class="attr-presence-div1" id="attr-presence-div1" align="center"></div>
        <div class="attr-presence-div2" id="attr-presence-div2" align=""></div>
        <div class="attr-presence-div3" id="attr-presence-div3" valign="center"></div>
        <div class="attr-presence-div4" id="attr-presence-div4" alignv="center"></div>
        <p id="attr-presence-p1">
          <a  id="attr-presence-a1" tItLe=""></a>
          <span id="attr-presence-span1" TITLE="attr-presence-span1"></span>
          <i id="attr-presence-i1"></i>
        </p>
        <pre id="attr-presence-pre1" data-attr-presence="pre1"></pre>
        <blockquote id="attr-presence-blockquote1" data-attr-presence="blockquote1"></blockquote>
        <ul id="attr-presence-ul1" data-中文=""></ul>
        <select id="attr-presence-select1">
          <option id="attr-presence-select1-option1">A</option>
          <option id="attr-presence-select1-option2">B</option>
          <option id="attr-presence-select1-option3">C</option>
          <option id="attr-presence-select1-option4">D</option>
        </select>
        <select id="attr-presence-select2">
          <option id="attr-presence-select2-option1">A</option>
          <option id="attr-presence-select2-option2">B</option>
          <option id="attr-presence-select2-option3">C</option>
          <option id="attr-presence-select2-option4" selected="selected">D</option>
        </select>
        <select id="attr-presence-select3" multiple="multiple">
          <option id="attr-presence-select3-option1">A</option>
          <option id="attr-presence-select3-option2" selected="">B</option>
          <option id="attr-presence-select3-option3" selected="selected">C</option>
          <option id="attr-presence-select3-option4">D</option>
        </select>
      </div>`;
      document.body.innerHTML = domStr;
      const node = document.getElementById('attr-presence-a1');
      const res = matches('#attr-presence [*|TiTlE]', node);
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const domStr = `<div id="attr-presence">
        <div class="attr-presence-div1" id="attr-presence-div1" align="center"></div>
        <div class="attr-presence-div2" id="attr-presence-div2" align=""></div>
        <div class="attr-presence-div3" id="attr-presence-div3" valign="center"></div>
        <div class="attr-presence-div4" id="attr-presence-div4" alignv="center"></div>
        <p id="attr-presence-p1">
          <a  id="attr-presence-a1" tItLe=""></a>
          <span id="attr-presence-span1" TITLE="attr-presence-span1"></span>
          <i id="attr-presence-i1"></i>
        </p>
        <pre id="attr-presence-pre1" data-attr-presence="pre1"></pre>
        <blockquote id="attr-presence-blockquote1" data-attr-presence="blockquote1"></blockquote>
        <ul id="attr-presence-ul1" data-中文=""></ul>
        <select id="attr-presence-select1">
          <option id="attr-presence-select1-option1">A</option>
          <option id="attr-presence-select1-option2">B</option>
          <option id="attr-presence-select1-option3">C</option>
          <option id="attr-presence-select1-option4">D</option>
        </select>
        <select id="attr-presence-select2">
          <option id="attr-presence-select2-option1">A</option>
          <option id="attr-presence-select2-option2">B</option>
          <option id="attr-presence-select2-option3">C</option>
          <option id="attr-presence-select2-option4" selected="selected">D</option>
        </select>
        <select id="attr-presence-select3" multiple="multiple">
          <option id="attr-presence-select3-option1">A</option>
          <option id="attr-presence-select3-option2" selected="">B</option>
          <option id="attr-presence-select3-option3" selected="selected">C</option>
          <option id="attr-presence-select3-option4">D</option>
        </select>
      </div>`;
      document.body.innerHTML = domStr;
      const node = document.getElementById('attr-presence-select2-option4');
      const res = matches('#attr-presence-select2 option[selected]', node);
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const domStr = `<div id="attr-value">
        <div id="attr-value-div1" align="center"></div>
        <div id="attr-value-div2" align=""></div>
        <div id="attr-value-div3" data-attr-value="&#xE9;"></div>
        <div id="attr-value-div4" data-attr-value_foo="&#xE9;"></div>
        <form id="attr-value-form1">
          <input id="attr-value-input1" type="text">
          <input id="attr-value-input2" type="password">
          <input id="attr-value-input3" type="hidden">
          <input id="attr-value-input4" type="radio">
          <input id="attr-value-input5" type="checkbox">
          <input id="attr-value-input6" type="radio">
          <input id="attr-value-input7" type="text">
          <input id="attr-value-input8" type="hidden">
          <input id="attr-value-input9" type="radio">
        </form>
        <div id="attr-value-div5" data-attr-value="中文"></div>
      </div>`;
      document.body.innerHTML = domStr;
      const node = document.getElementById('attr-value-div2');
      const res = matches('#attr-value [align=""]', node);
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const domStr = `<div id="root">
        <div id="universal">
          <p id="universal-p1">Universal selector tests inside element with <code id="universal-code1">id="universal"</code>.</p>
          <hr id="universal-hr1">
          <pre id="universal-pre1">Some preformatted text with some <span id="universal-span1">embedded code</span></pre>
          <p id="universal-p2">This is a normal link: <a id="universal-a1" href="http://www.w3.org/">W3C</a></p>
          <address id="universal-address1">Some more nested elements <code id="universal-code2"><a href="#" id="universal-a2">code hyperlink</a></code></address>
        </div>
      </div>`;
      document.body.innerHTML = domStr;
      const root = document.getElementById('root');
      const clone = root.cloneNode(true);
      const node = clone.querySelector('#universal-p1');
      const res = matches('#universal>*', node);
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const domStr = `<div id="root">
        <div id="universal">
          <p id="universal-p1">Universal selector tests inside element with <code id="universal-code1">id="universal"</code>.</p>
          <hr id="universal-hr1">
          <pre id="universal-pre1">Some preformatted text with some <span id="universal-span1">embedded code</span></pre>
          <p id="universal-p2">This is a normal link: <a id="universal-a1" href="http://www.w3.org/">W3C</a></p>
          <address id="universal-address1">Some more nested elements <code id="universal-code2"><a href="#" id="universal-a2">code hyperlink</a></code></address>
        </div>
      </div>`;
      document.body.innerHTML = domStr;
      const root = document.getElementById('root');
      const clone = root.cloneNode(true);
      const node = clone.querySelector('#universal-code1');
      const res = matches('#universal>*>*', node);
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const domStr = `<div id="root">
        <div id="universal">
          <p id="universal-p1">Universal selector tests inside element with <code id="universal-code1">id="universal"</code>.</p>
          <hr id="universal-hr1">
          <pre id="universal-pre1">Some preformatted text with some <span id="universal-span1">embedded code</span></pre>
          <p id="universal-p2">This is a normal link: <a id="universal-a1" href="http://www.w3.org/">W3C</a></p>
          <address id="universal-address1">Some more nested elements <code id="universal-code2"><a href="#" id="universal-a2">code hyperlink</a></code></address>
        </div>
      </div>`;
      document.body.innerHTML = domStr;
      const root = document.getElementById('root');
      const clone = root.cloneNode(true);
      const node = clone.querySelector('#universal-p1');
      const res = matches('#universal *', node);
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const domStr = `<div id="root">
        <div id="not">
          <div id="not-div1"></div>
          <div id="not-div2"></div>
          <div id="not-div3"></div>
          <p id="not-p1"><span id="not-span1"></span><em id="not-em1"></em></p>
          <p id="not-p2"><span id="not-span2"></span><em id="not-em2"></em></p>
          <p id="not-p3"><span id="not-span3"></span><em id="not-em3"></em></p>
        </div>
      </div>`;
      document.body.innerHTML = domStr;
      const root = document.getElementById('root');
      const clone = root.cloneNode(true);
      const node = clone.querySelector('#not-em1');
      const res = matches('#not * :not(:first-child)', node);
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const domStr = `<div id="root">
        <div id="adjacent">
          <div id="adjacent-div1" class="adjacent-div1"></div>
          <div id="adjacent-div2" class="adjacent-div2">
            <div id="adjacent-div3" class="adjacent-div3"></div>
          </div>
          <div id="adjacent-div4" class="adjacent-div4">
            <p id="adjacent-p1" class="adjacent-p1"></p>
            <div id="adjacent-div5" class="adjacent-div5"></div>
          </div>
          <div id="adjacent-div6" class="adjacent-div6"></div>
          <p id="adjacent-p2" class="adjacent-p2"></p>
          <p id="adjacent-p3" class="adjacent-p3"></p>
        </div>
      </div>`;
      document.body.innerHTML = domStr;
      const root = document.getElementById('root');
      const clone = root.cloneNode(true);
      const node = clone.querySelector('#adjacent-div4');
      const res = matches('div+#adjacent-div4', node);
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const domStr = `<div id="root">
        <div id="sibling">
          <div id="sibling-div1" class="sibling-div"></div>
          <div id="sibling-div2" class="sibling-div">
            <div id="sibling-div3" class="sibling-div"></div>
          </div>
          <div id="sibling-div4" class="sibling-div">
            <p id="sibling-p1" class="sibling-p"></p>
            <div id="sibling-div5" class="sibling-div"></div>
          </div>
          <div id="sibling-div6" class="sibling-div"></div>
          <p id="sibling-p2" class="sibling-p"></p>
          <p id="sibling-p3" class="sibling-p"></p>
        </div>
      </div>`;
      document.body.innerHTML = domStr;
      const root = document.getElementById('root');
      const clone = root.cloneNode(true);
      const node = clone.querySelector('#sibling-div4');
      const res = matches('div~#sibling-div4', node);
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const domStr = `<div id="root">
        <table id="pseudo-nth-table1">
          <tr id="pseudo-nth-tr1">
            <td id="pseudo-nth-td1"></td>
            <td id="pseudo-nth-td2"></td>
            <td id="pseudo-nth-td3"></td>
            <td id="pseudo-nth-td4"></td>
            <td id="pseudo-nth-td5"></td>
            <td id="pseudo-nth-td6"></td>
          </tr>
          <tr id="pseudo-nth-tr2">
            <td id="pseudo-nth-td7"></td>
            <td id="pseudo-nth-td8"></td>
            <td id="pseudo-nth-td9"></td>
            <td id="pseudo-nth-td10"></td>
            <td id="pseudo-nth-td11"></td>
            <td id="pseudo-nth-td12"></td>
          </tr>
          <tr id="pseudo-nth-tr3">
            <td id="pseudo-nth-td13"></td>
            <td id="pseudo-nth-td14"></td>
            <td id="pseudo-nth-td15"></td>
            <td id="pseudo-nth-td16"></td>
            <td id="pseudo-nth-td17"></td>
            <td id="pseudo-nth-td18"></td>
          </tr>
        </table>
      </div>`;
      document.body.innerHTML = domStr;
      const root = document.getElementById('root');
      const clone = root.cloneNode(true);
      const node = clone.querySelector('#pseudo-nth-tr3');
      const res = matches('#pseudo-nth-table1 :nth-child(3)', node);
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const domStr = `<div id="root">
        <table id="pseudo-nth-table1">
          <tr id="pseudo-nth-tr1">
            <td id="pseudo-nth-td1"></td>
            <td id="pseudo-nth-td2"></td>
            <td id="pseudo-nth-td3"></td>
            <td id="pseudo-nth-td4"></td>
            <td id="pseudo-nth-td5"></td>
            <td id="pseudo-nth-td6"></td>
          </tr>
          <tr id="pseudo-nth-tr2">
            <td id="pseudo-nth-td7"></td>
            <td id="pseudo-nth-td8"></td>
            <td id="pseudo-nth-td9"></td>
            <td id="pseudo-nth-td10"></td>
            <td id="pseudo-nth-td11"></td>
            <td id="pseudo-nth-td12"></td>
          </tr>
          <tr id="pseudo-nth-tr3">
            <td id="pseudo-nth-td13"></td>
            <td id="pseudo-nth-td14"></td>
            <td id="pseudo-nth-td15"></td>
            <td id="pseudo-nth-td16"></td>
            <td id="pseudo-nth-td17"></td>
            <td id="pseudo-nth-td18"></td>
          </tr>
        </table>
      </div>`;
      document.body.innerHTML = domStr;
      const root = document.getElementById('root');
      const clone = root.cloneNode(true);
      const node = clone.querySelector('#pseudo-nth-tr3');
      const res = matches('#pseudo-nth-table1 :nth-child(3 of tr)', node);
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const domStr = `<div id="root">
        <table id="pseudo-nth-table1">
          <tr id="pseudo-nth-tr1">
            <td id="pseudo-nth-td1"></td>
            <td id="pseudo-nth-td2"></td>
            <td id="pseudo-nth-td3"></td>
            <td id="pseudo-nth-td4"></td>
            <td id="pseudo-nth-td5"></td>
            <td id="pseudo-nth-td6"></td>
          </tr>
          <tr id="pseudo-nth-tr2">
            <td id="pseudo-nth-td7"></td>
            <td id="pseudo-nth-td8"></td>
            <td id="pseudo-nth-td9"></td>
            <td id="pseudo-nth-td10"></td>
            <td id="pseudo-nth-td11"></td>
            <td id="pseudo-nth-td12"></td>
          </tr>
          <tr id="pseudo-nth-tr3">
            <td id="pseudo-nth-td13"></td>
            <td id="pseudo-nth-td14"></td>
            <td id="pseudo-nth-td15"></td>
            <td id="pseudo-nth-td16"></td>
            <td id="pseudo-nth-td17"></td>
            <td id="pseudo-nth-td18"></td>
          </tr>
        </table>
      </div>`;
      document.body.innerHTML = domStr;
      const root = document.getElementById('root');
      const clone = root.cloneNode(true);
      const node = clone.querySelector('#pseudo-nth-td1');
      const res = matches('#pseudo-nth-table1 tr :first-of-type', node);
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const domStr = `<div id="root">
        <div id="universal">
          <p id="universal-p1">Universal selector tests inside element with <code id="universal-code1">id="universal"</code>.</p>
          <hr id="universal-hr1">
          <pre id="universal-pre1">Some preformatted text with some <span id="universal-span1">embedded code</span></pre>
          <p id="universal-p2">This is a normal link: <a id="universal-a1" href="http://www.w3.org/">W3C</a></p>
          <address id="universal-address1">Some more nested elements <code id="universal-code2"><a href="#" id="universal-a2">code hyperlink</a></code></address>
        </div>
      </div>`;
      document.body.innerHTML = domStr;
      const root = document.getElementById('root');
      const clone = root.cloneNode(true);
      const frag = document.createDocumentFragment();
      frag.appendChild(clone);
      const node = frag.getElementById('universal-p1');
      const res = matches('#universal>*', node);
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const domStr = `<div id="root">
        <div id="universal">
          <p id="universal-p1">Universal selector tests inside element with <code id="universal-code1">id="universal"</code>.</p>
          <hr id="universal-hr1">
          <pre id="universal-pre1">Some preformatted text with some <span id="universal-span1">embedded code</span></pre>
          <p id="universal-p2">This is a normal link: <a id="universal-a1" href="http://www.w3.org/">W3C</a></p>
          <address id="universal-address1">Some more nested elements <code id="universal-code2"><a href="#" id="universal-a2">code hyperlink</a></code></address>
        </div>
      </div>`;
      document.body.innerHTML = domStr;
      const root = document.getElementById('root');
      const clone = root.cloneNode(true);
      const frag = document.createDocumentFragment();
      frag.appendChild(clone);
      const node = frag.getElementById('universal-code1');
      const res = matches('#universal>*>*', node);
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const domStr = `<div id="root">
        <div id="universal">
          <p id="universal-p1">Universal selector tests inside element with <code id="universal-code1">id="universal"</code>.</p>
          <hr id="universal-hr1">
          <pre id="universal-pre1">Some preformatted text with some <span id="universal-span1">embedded code</span></pre>
          <p id="universal-p2">This is a normal link: <a id="universal-a1" href="http://www.w3.org/">W3C</a></p>
          <address id="universal-address1">Some more nested elements <code id="universal-code2"><a href="#" id="universal-a2">code hyperlink</a></code></address>
        </div>
      </div>`;
      document.body.innerHTML = domStr;
      const root = document.getElementById('root');
      const clone = root.cloneNode(true);
      const frag = document.createDocumentFragment();
      frag.appendChild(clone);
      const node = frag.getElementById('universal-p1');
      const res = matches('#universal *', node);
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const node = document.createElement('input');
      node.setAttribute('type', 'hidden');
      node.required = true;
      document.body.appendChild(node);
      const res = matches(':not(:optional)', node);
      assert.isTrue(res, 'result');
    });

    it('should match', () => {
      const domStr = `<div>
        <fieldset id=fieldset1>
          <input id=input1>
        </fieldset>
      </div>`;
      document.body.innerHTML = domStr;
      const fieldset = document.querySelector('#fieldset1');
      const input = document.querySelector('#input1');
      assert.isTrue(matches(':valid', fieldset), 'before');
      assert.isFalse(matches(':invalid', fieldset), 'before');
      assert.isTrue(matches(':valid', input), 'before');
      assert.isFalse(matches(':invalid', input), 'before');
      fieldset.remove();
      input.setCustomValidity('foo');
      assert.isFalse(matches(':valid', fieldset), 'inter');
      assert.isTrue(matches(':invalid', fieldset), 'inter');
      assert.isFalse(matches(':valid', input), 'inter');
      assert.isTrue(matches(':invalid', input), 'inter');
      input.setCustomValidity('');
      assert.isTrue(matches(':valid', fieldset), 'after');
      assert.isFalse(matches(':invalid', fieldset), 'after');
      assert.isTrue(matches(':valid', input), 'after');
      assert.isFalse(matches(':invalid', input), 'after');
    });

    it('should match', () => {
      const domStr = `<div>
        <fieldset id=fieldset2>
          <select id=select1 required multiple>
            <option>foo
          </select>
        </fieldset>
      </div>`;
      document.body.innerHTML = domStr;
      const fieldset = document.querySelector('#fieldset2');
      const select = document.querySelector('#select1');
      assert.isFalse(fieldset.matches(':valid'), 'before');
      assert.isTrue(fieldset.matches(':invalid'), 'before');
      assert.isFalse(select.matches(':valid'), 'before');
      assert.isTrue(select.matches(':invalid'), 'before');
      fieldset.remove();
      select.required = false;
      assert.isTrue(fieldset.matches(':valid'), 'inter');
      assert.isFalse(fieldset.matches(':invalid'), 'inter');
      assert.isTrue(select.matches(':valid'), 'inter');
      assert.isFalse(select.matches(':invalid'), 'inter');
      select.required = true;
      select.firstElementChild.selected = true;
      assert.isTrue(fieldset.matches(':valid'), 'after');
      assert.isFalse(fieldset.matches(':invalid'), 'after');
      assert.isTrue(select.matches(':valid'), 'after');
      assert.isFalse(select.matches(':invalid'), 'after');
    });

    // FIXME: later
    xit('should match', () => {
      const domStr = '<input value="ltr" dir="auto">';
      document.body.innerHTML = domStr;
      const input = document.querySelector('input');
      assert.isTrue(input.matches(':dir(ltr)'),
        'Input with ltr value should match dir(ltr)');
      input.textContent = 'ﷺ';
      assert.isTrue(input.matches(':dir(ltr)'),
        'Should still match dir(ltr) after text change');
      input.value = 'ltr2';
      assert.isTrue(input.matches(':dir(ltr)'),
        'Should still match dir(ltr) after value change');
      input.value = 'ﷺ';
      assert.isTrue(input.matches(':dir(rtl)'),
        'Should match dir(rtl) after value change');
      input.textContent = 'ltr';
      assert.isTrue(input.matches(':dir(rtl)'),
        'Should match dir(rtl) after text change');
    });

    it('should match', () => {
      const domStr = `<div id="root">
        <bdo dir="rtl" id=bdo1>WERBEH</bdo>
        <bdo dir="ltr" id=bdo2>HEBREW</bdo>
        <bdi id=bdi1>HEBREW</bdi>
        <bdi dir="rtl" id=bdi2>WERBEH</bdi>
        <bdi dir="ltr" id=bdi3>HEBREW</bdi>
        <bdi id=bdi4>إيان</bdi>
        <span id=span1>WERBEH</span>
        <span dir="rtl" id=span2>WERBEH</span>
        <span dir="ltr" id=span3>HEBREW</span>
        &#x202E;<span id=span4>WERBEH</span>&#x202C;
        <span dir="rtl" id=span5>WERBEH</span>
        <span dir="ltr" id=span6>HEBREW</span>
        <span dir="rtl" id=span7>
          <input type=tel id=input-tel1>
          <input type=tel id=input-tel2 dir="invalid">
        </span>
        <input type=tel id=input-tel3 dir="rtl">
        <bdo dir="auto" id=bdo3>HEBREW</bdo>
        <bdo dir="auto" id=bdo4>إيان</bdo>
        <bdo dir="ltr" id=bdo5>עברית</bdo>
      </div>`;
      document.body.innerHTML = domStr;
      const rtlElements = [
        'bdo1',
        'bdi2',
        'bdi4',
        'span2',
        'span5',
        'span7',
        'input-tel3',
        'bdo4'
      ];
      const ltrElements = [
        'bdo2',
        'bdi1',
        'bdi3',
        'span1',
        'span3',
        'span4',
        'span6',
        'input-tel1',
        'input-tel2',
        'bdo3',
        'bdo5'
      ];
      for (const i of rtlElements) {
        const node = document.getElementById(i);
        const res = node.matches(':dir(rtl)');
        assert.isTrue(res, `${node.id}`);
      }
      for (const i of ltrElements) {
        const node = document.getElementById(i);
        const res = node.matches(':dir(ltr)');
        assert.isTrue(res, `${node.id}`);
      }
    });
  });

  describe('closest', () => {
    it('should throw', () => {
      assert.throws(() => closest('*|', document), DOMException);
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

    it('should get matched node', () => {
      const domStr = `<div id="test8" class="div3" style="display:none">
        <div id="test7" class="div2">
          <div id="test6" class="div1">
            <form id="test10" class="form2"></form>
            <form id="test5" class="form1" name="form-a">
              <input id="test1" class="input1" required>
              <fieldset class="fieldset2" id="test2">
                <select id="test3" class="select1" required>
                  <option default id="test4" value="">Test4</option>
                  <option selected id="test11">Test11</option>
                  <option id="test12">Test12</option>
                  <option id="test13">Test13</option>
                </select>
                <input id="test9" type="text" required>
              </fieldset>
            </form>
          </div>
        </div>
      </div>`;
      document.body.innerHTML = domStr;
      const node = document.getElementById('test12');
      const target = document.getElementById('test3');
      const res = closest('select', node);
      assert.deepEqual(res, target, 'result');
    });

    it('should get matched node', () => {
      const domStr = `<div id="test8" class="div3" style="display:none">
        <div id="test7" class="div2">
          <div id="test6" class="div1">
            <form id="test10" class="form2"></form>
            <form id="test5" class="form1" name="form-a">
              <input id="test1" class="input1" required>
              <fieldset class="fieldset2" id="test2">
                <select id="test3" class="select1" required>
                  <option default id="test4" value="">Test4</option>
                  <option selected id="test11">Test11</option>
                  <option id="test12">Test12</option>
                  <option id="test13">Test13</option>
                </select>
                <input id="test9" type="text" required>
              </fieldset>
            </form>
          </div>
        </div>
      </div>`;
      document.body.innerHTML = domStr;
      const node = document.getElementById('test13');
      const target = document.getElementById('test2');
      const res = closest('fieldset', node);
      assert.deepEqual(res, target, 'result');
    });

    it('should get matched node', () => {
      const domStr = `<div id="test8" class="div3" style="display:none">
        <div id="test7" class="div2">
          <div id="test6" class="div1">
            <form id="test10" class="form2"></form>
            <form id="test5" class="form1" name="form-a">
              <input id="test1" class="input1" required>
              <fieldset class="fieldset2" id="test2">
                <select id="test3" class="select1" required>
                  <option default id="test4" value="">Test4</option>
                  <option selected id="test11">Test11</option>
                  <option id="test12">Test12</option>
                  <option id="test13">Test13</option>
                </select>
                <input id="test9" type="text" required>
              </fieldset>
            </form>
          </div>
        </div>
      </div>`;
      document.body.innerHTML = domStr;
      const node = document.getElementById('test13');
      const target = document.getElementById('test6');
      const res = closest('div', node);
      assert.deepEqual(res, target, 'result');
    });

    it('should get matched node', () => {
      const domStr = `<div id="test8" class="div3" style="display:none">
        <div id="test7" class="div2">
          <div id="test6" class="div1">
            <form id="test10" class="form2"></form>
            <form id="test5" class="form1" name="form-a">
              <input id="test1" class="input1" required>
              <fieldset class="fieldset2" id="test2">
                <select id="test3" class="select1" required>
                  <option default id="test4" value="">Test4</option>
                  <option selected id="test11">Test11</option>
                  <option id="test12">Test12</option>
                  <option id="test13">Test13</option>
                </select>
                <input id="test9" type="text" required>
              </fieldset>
            </form>
          </div>
        </div>
      </div>`;
      document.body.innerHTML = domStr;
      const node = document.getElementById('test3');
      const res = closest('body', node);
      assert.deepEqual(res, document.body, 'result');
    });

    it('should get matched node', () => {
      const domStr = `<div id="test8" class="div3" style="display:none">
        <div id="test7" class="div2">
          <div id="test6" class="div1">
            <form id="test10" class="form2"></form>
            <form id="test5" class="form1" name="form-a">
              <input id="test1" class="input1" required>
              <fieldset class="fieldset2" id="test2">
                <select id="test3" class="select1" required>
                  <option default id="test4" value="">Test4</option>
                  <option selected id="test11">Test11</option>
                  <option id="test12">Test12</option>
                  <option id="test13">Test13</option>
                </select>
                <input id="test9" type="text" required>
              </fieldset>
            </form>
          </div>
        </div>
      </div>`;
      document.body.innerHTML = domStr;
      const node = document.getElementById('test4');
      const res = closest('[default]', node);
      assert.deepEqual(res, node, 'result');
    });

    it('should not match', () => {
      const domStr = `<div id="test8" class="div3" style="display:none">
        <div id="test7" class="div2">
          <div id="test6" class="div1">
            <form id="test10" class="form2"></form>
            <form id="test5" class="form1" name="form-a">
              <input id="test1" class="input1" required>
              <fieldset class="fieldset2" id="test2">
                <select id="test3" class="select1" required>
                  <option default id="test4" value="">Test4</option>
                  <option selected id="test11">Test11</option>
                  <option id="test12">Test12</option>
                  <option id="test13">Test13</option>
                </select>
                <input id="test9" type="text" required>
              </fieldset>
            </form>
          </div>
        </div>
      </div>`;
      document.body.innerHTML = domStr;
      const node = document.getElementById('test4');
      const res = closest('[selected]', node);
      assert.isNull(res, 'result');
    });

    it('should get matched node', () => {
      const domStr = `<div id="test8" class="div3" style="display:none">
        <div id="test7" class="div2">
          <div id="test6" class="div1">
            <form id="test10" class="form2"></form>
            <form id="test5" class="form1" name="form-a">
              <input id="test1" class="input1" required>
              <fieldset class="fieldset2" id="test2">
                <select id="test3" class="select1" required>
                  <option default id="test4" value="">Test4</option>
                  <option selected id="test11">Test11</option>
                  <option id="test12">Test12</option>
                  <option id="test13">Test13</option>
                </select>
                <input id="test9" type="text" required>
              </fieldset>
            </form>
          </div>
        </div>
      </div>`;
      document.body.innerHTML = domStr;
      const node = document.getElementById('test11');
      const res = closest('[selected]', node);
      assert.deepEqual(res, node, 'result');
    });

    it('should get matched node', () => {
      const domStr = `<div id="test8" class="div3" style="display:none">
        <div id="test7" class="div2">
          <div id="test6" class="div1">
            <form id="test10" class="form2"></form>
            <form id="test5" class="form1" name="form-a">
              <input id="test1" class="input1" required>
              <fieldset class="fieldset2" id="test2">
                <select id="test3" class="select1" required>
                  <option default id="test4" value="">Test4</option>
                  <option selected id="test11">Test11</option>
                  <option id="test12">Test12</option>
                  <option id="test13">Test13</option>
                </select>
                <input id="test9" type="text" required>
              </fieldset>
            </form>
          </div>
        </div>
      </div>`;
      document.body.innerHTML = domStr;
      const node = document.getElementById('test11');
      const target = document.getElementById('test2');
      const res = closest(':invalid', node);
      assert.deepEqual(res, target, 'result');
    });

    it('should get matched node', () => {
      const domStr = `<div id="test8" class="div3" style="display:none">
        <div id="test7" class="div2">
          <div id="test6" class="div1">
            <form id="test10" class="form2"></form>
            <form id="test5" class="form1" name="form-a">
              <input id="test1" class="input1" required>
              <fieldset class="fieldset2" id="test2">
                <select id="test3" class="select1" required>
                  <option default id="test4" value="">Test4</option>
                  <option selected id="test11">Test11</option>
                  <option id="test12">Test12</option>
                  <option id="test13">Test13</option>
                </select>
                <input id="test9" type="text" required>
              </fieldset>
            </form>
          </div>
        </div>
      </div>`;
      document.body.innerHTML = domStr;
      const node = document.getElementById('test13');
      const target = document.getElementById('test7');
      const res = closest('div:not(.div1)', node);
      assert.deepEqual(res, target, 'result');
    });

    it('should get matched node', () => {
      const domStr = `<div id="test8" class="div3" style="display:none">
        <div id="test7" class="div2">
          <div id="test6" class="div1">
            <form id="test10" class="form2"></form>
            <form id="test5" class="form1" name="form-a">
              <input id="test1" class="input1" required>
              <fieldset class="fieldset2" id="test2">
                <select id="test3" class="select1" required>
                  <option default id="test4" value="">Test4</option>
                  <option selected id="test11">Test11</option>
                  <option id="test12">Test12</option>
                  <option id="test13">Test13</option>
                </select>
                <input id="test9" type="text" required>
              </fieldset>
            </form>
          </div>
        </div>
      </div>`;
      document.body.innerHTML = domStr;
      const node = document.getElementById('test4');
      const res = closest(':has(> :scope)', node);
      assert.deepEqual(res, document.getElementById('test3'), 'result');
    });
  });

  describe('query selector', () => {
    it('should throw', () => {
      assert.throws(() => querySelector('*|', document), DOMException);
    });

    it('should throw', () => {
      const node = document.createElement('div');
      assert.throws(() => querySelector('[foo= bar baz ]', node),
        DOMException);
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

    it('should get matched node(s)', () => {
      const domStr = `<div id="root">
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
      </div>`;
      document.body.innerHTML = domStr;
      const query = [
        "#attr-whitespace a[rel~='bookmark']",
        "#attr-whitespace a[rel~='nofollow']"
      ].join(',');
      const res = querySelector(query, document);
      assert.deepEqual(res, document.getElementById('attr-whitespace-a1'),
        'result');
    });

    it('should get matched node(s)', () => {
      const domStr = `<div id="root">
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
      </div>`;
      document.body.innerHTML = domStr;
      const query = [
        "#attr-whitespace a[rel~='nofollow']",
        "#attr-whitespace a[rel~='bookmark']"
      ].join(',');
      const res = querySelector(query, document);
      assert.deepEqual(res, document.getElementById('attr-whitespace-a1'),
        'result');
    });

    it('should get matched node', () => {
      const domStr = '<div><svg></svg></div>';
      const tmpl = document.createElement('template');
      tmpl.innerHTML = domStr;
      document.body.appendChild(tmpl);
      const frag = tmpl.content;
      const res = querySelector('svg', frag.firstChild);
      assert.isNotNull(res, 'result');
      assert.strictEqual(res.localName, 'svg', 'localName');
    });
  });

  describe('query selector all', () => {
    it('should throw', () => {
      assert.throws(() => querySelectorAll('*|', document), DOMException);
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

    it('should get matched node(s)', () => {
      const domStr = `<div>
        <form>
          <button id=button1 type=button>button1</button>
          <button id=button2 type=submit>button2</button>
        </form>
        <form>
          <button id=button3 type=reset>button3</button>
          <button id=button4>button4</button>
        </form>
        <button id=button5 type=submit>button5</button>
        <form id=form1>
          <input type=text id=input1>
        </form>
        <input type=text id=input2 form=form1>
        <form>
          <input type=submit id=input3>
          <input type=submit id=input4>
        </form>
        <form>
          <input type=image id=input5>
          <input type=image id=input6>
        </form>
        <form>
          <input type=submit id=input7>
        </form>
        <input type=checkbox id=checkbox1 checked>
        <input type=checkbox id=checkbox2>
        <input type=checkbox id=checkbox3 default>
        <input type=radio name=radios id=radio1 checked>
        <input type=radio name=radios id=radio2>
        <input type=radio name=radios id=radio3 default>
        <select id=select1>
          <optgroup label="options" id=optgroup1>
            <option value="option1" id=option1>option1
            <option value="option2" id=option2 selected>option2
        </select>
        <dialog id="dialog">
          <input type=submit id=input8>
        </dialog>
        <form>
          <button id=button6 type='invalid'>button6</button>
          <button id=button7>button7</button>
        </form>
        <form>
          <button id=button8>button8</button>
          <button id=button9>button9</button>
        </form>
      </div>`;
      document.body.innerHTML = domStr;
      const res = querySelectorAll(':default', document);
      assert.deepEqual(res, [
        document.getElementById('button2'),
        document.getElementById('button4'),
        document.getElementById('input3'),
        document.getElementById('input5'),
        document.getElementById('input7'),
        document.getElementById('checkbox1'),
        document.getElementById('radio1'),
        document.getElementById('option2'),
        document.getElementById('button6'),
        document.getElementById('button8')
      ]);
    });

    it('should get matched node(s)', () => {
      const domStr = `<div>
        <input type=checkbox id=checkbox1>
        <input type=checkbox id=checkbox2>
        <input type=radio id=radio1 checked>
        <input type=radio id=radio1_2>
        <input type=radio name=radiogroup id=radio2 checked>
        <input type=radio name=radiogroup id=radio3>
        <input type=radio name=group2 id=radio4>
        <input type=radio name=group2 id=radio5>
        <progress id="progress1"></progress>
        <progress id="progress2" value=10></progress>
      </div>`;
      document.body.innerHTML = domStr;
      const checkbox1 = document.getElementById('checkbox1');
      checkbox1.indeterminate = true;
      const res = querySelectorAll(':indeterminate', document);
      assert.deepEqual(res, [
        checkbox1,
        document.getElementById('radio4'),
        document.getElementById('radio5'),
        document.getElementById('progress1')
      ]);
    });

    it('should get matched node(s)', () => {
      const domStr = `<div>
        <input type=number value=0 min=0 max=10 id=number1>
        <input type=number value=0 min=0 max=10 id=number2 disabled>
        <input type=number value=0 min=1 max=10 id=number3>
        <input type=number value=11 min=0 max=10 id=number4>
        <input type=number value=0 min=0 max=10 id=number5 readonly>

        <input type="date" min="2005-10-10" max="2020-10-10" value="2010-10-10" id="datein">
        <input type="date" min="2010-10-10" max="2020-10-10" value="2005-10-10" id="dateunder">
        <input type="date" min="2010-10-10" max="2020-10-10" value="2030-10-10" id="dateover">

        <input type="time" min="01:00:00" max="05:00:00" value="02:00:00" id="timein">
        <input type="time" min="02:00:00" max="05:00:00" value="01:00:00" id="timeunder">
        <input type="time" min="02:00:00" max="05:00:00" value="07:00:00" id="timeover">

        <input type="week" min="2016-W05" max="2016-W10" value="2016-W07" id="weekin">
        <input type="week" min="2016-W05" max="2016-W10" value="2016-W02" id="weekunder">
        <input type="week" min="2016-W05" max="2016-W10" value="2016-W26" id="weekover">

        <input type="month" min="2000-04" max="2000-09" value="2000-06" id="monthin">
        <input type="month" min="2000-04" max="2000-09" value="2000-02" id="monthunder">
        <input type="month" min="2000-04" max="2000-09" value="2000-11" id="monthover">

        <input type="datetime-local" min="2008-03-12T23:59:59" max="2015-02-13T23:59:59" value="2012-11-28T23:59:59" id="datetimelocalin">
        <input type="datetime-local" min="2008-03-12T23:59:59" max="2015-02-13T23:59:59" value="2008-03-01T23:59:59" id="datetimelocalunder">
        <input type="datetime-local" min="2008-03-12T23:59:59" max="2015-02-13T23:59:59" value="2016-01-01T23:59:59" id="datetimelocalover">

        <!-- None of the following have range limitations since they have neither min nor max attributes -->
        <input type="number" value="0" id="numbernolimit">
        <input type="date" value="2010-10-10" id="datenolimit">
        <input type="time" value="02:00:00" id="timenolimit">
        <input type="week" value="2016-W07" id="weeknolimit">
        <input type="month" value="2000-06" id="monthnolimit">
        <input type="datetime-local" value="2012-11-28T23:59:59" id="datetimelocalnolimit">

        <!-- range inputs have default minimum of 0 and default maximum of 100 -->
        <input type="range" value="50" id="range0">
        <input type="range" value="-1" id="range0_2">
        <input type="range" value="101" id="range0_3">

        <!-- range input's value gets immediately clamped to the nearest boundary point -->
        <input type="range" min="2" max="7" value="5" id="range1">
        <input type="range" min="2" max="7" value="1" id="range2">
        <input type="range" min="2" max="7" value="9" id="range3">

        <!-- None of the following input types can have range limitations -->
        <input min="1" value="0" type="text">
        <input min="1" value="0" type="search">
        <input min="1" value="0" type="url">
        <input min="1" value="0" type="tel">
        <input min="1" value="0" type="email">
        <input min="1" value="0" type="password">
        <input min="1" value="#000000" type="color">
        <input min="1" value="0" type="checkbox">
        <input min="1" value="0" type="radio">
        <input min="1" value="0" type="file">
        <input min="1" value="0" type="submit">
        <input min="1" value="0" type="image">
        <!-- The following types are also barred from constraint validation -->
        <input min="1" value="0" type="hidden">
        <input min="1" value="0" type="button">
        <input min="1" value="0" type="reset">
      </div>`;
      document.body.innerHTML = domStr;
      const res = querySelectorAll(':in-range', document);
      assert.deepEqual(res, [
        document.getElementById('number1'),
        document.getElementById('datein'),
        document.getElementById('timein'),
        document.getElementById('weekin'),
        document.getElementById('monthin'),
        document.getElementById('datetimelocalin'),
        document.getElementById('range0'),
        document.getElementById('range0_2'),
        document.getElementById('range0_3'),
        document.getElementById('range1'),
        document.getElementById('range2'),
        document.getElementById('range3')
      ]);
    });

    it('should get matched node(s)', () => {
      const domStr = `<div>
        <input type=number value=0 min=0 max=10 id=number1>
        <input type=number value=0 min=0 max=10 id=number2 disabled>
        <input type=number value=0 min=1 max=10 id=number3>
        <input type=number value=11 min=0 max=10 id=number4>
        <input type=number value=0 min=0 max=10 id=number5 readonly>

        <input type="date" min="2005-10-10" max="2020-10-10" value="2010-10-10" id="datein">
        <input type="date" min="2010-10-10" max="2020-10-10" value="2005-10-10" id="dateunder">
        <input type="date" min="2010-10-10" max="2020-10-10" value="2030-10-10" id="dateover">

        <input type="time" min="01:00:00" max="05:00:00" value="02:00:00" id="timein">
        <input type="time" min="02:00:00" max="05:00:00" value="01:00:00" id="timeunder">
        <input type="time" min="02:00:00" max="05:00:00" value="07:00:00" id="timeover">

        <input type="week" min="2016-W05" max="2016-W10" value="2016-W07" id="weekin">
        <input type="week" min="2016-W05" max="2016-W10" value="2016-W02" id="weekunder">
        <input type="week" min="2016-W05" max="2016-W10" value="2016-W26" id="weekover">

        <input type="month" min="2000-04" max="2000-09" value="2000-06" id="monthin">
        <input type="month" min="2000-04" max="2000-09" value="2000-02" id="monthunder">
        <input type="month" min="2000-04" max="2000-09" value="2000-11" id="monthover">

        <input type="datetime-local" min="2008-03-12T23:59:59" max="2015-02-13T23:59:59" value="2012-11-28T23:59:59" id="datetimelocalin">
        <input type="datetime-local" min="2008-03-12T23:59:59" max="2015-02-13T23:59:59" value="2008-03-01T23:59:59" id="datetimelocalunder">
        <input type="datetime-local" min="2008-03-12T23:59:59" max="2015-02-13T23:59:59" value="2016-01-01T23:59:59" id="datetimelocalover">

        <!-- None of the following have range limitations since they have neither min nor max attributes -->
        <input type="number" value="0" id="numbernolimit">
        <input type="date" value="2010-10-10" id="datenolimit">
        <input type="time" value="02:00:00" id="timenolimit">
        <input type="week" value="2016-W07" id="weeknolimit">
        <input type="month" value="2000-06" id="monthnolimit">
        <input type="datetime-local" value="2012-11-28T23:59:59" id="datetimelocalnolimit">

        <!-- range inputs have default minimum of 0 and default maximum of 100 -->
        <input type="range" value="50" id="range0">
        <input type="range" value="-1" id="range0_2">
        <input type="range" value="101" id="range0_3">

        <!-- range input's value gets immediately clamped to the nearest boundary point -->
        <input type="range" min="2" max="7" value="5" id="range1">
        <input type="range" min="2" max="7" value="1" id="range2">
        <input type="range" min="2" max="7" value="9" id="range3">

        <!-- None of the following input types can have range limitations -->
        <input min="1" value="0" type="text">
        <input min="1" value="0" type="search">
        <input min="1" value="0" type="url">
        <input min="1" value="0" type="tel">
        <input min="1" value="0" type="email">
        <input min="1" value="0" type="password">
        <input min="1" value="#000000" type="color">
        <input min="1" value="0" type="checkbox">
        <input min="1" value="0" type="radio">
        <input min="1" value="0" type="file">
        <input min="1" value="0" type="submit">
        <input min="1" value="0" type="image">
        <!-- The following types are also barred from constraint validation -->
        <input min="1" value="0" type="hidden">
        <input min="1" value="0" type="button">
        <input min="1" value="0" type="reset">
      </div>`;
      document.body.innerHTML = domStr;
      const res = querySelectorAll(':out-of-range', document);
      assert.deepEqual(res, [
        document.getElementById('number3'),
        document.getElementById('number4'),
        document.getElementById('dateunder'),
        document.getElementById('dateover'),
        document.getElementById('timeunder'),
        document.getElementById('timeover'),
        document.getElementById('weekunder'),
        document.getElementById('weekover'),
        document.getElementById('monthunder'),
        document.getElementById('monthover'),
        document.getElementById('datetimelocalunder'),
        document.getElementById('datetimelocalover')
      ]);

      it('should not match', () => {
        const domStr = `<div id="root">
          <div id=set0>
            <!-- The readonly attribute does not apply to the following input types -->
            <input id=checkbox1 type=checkbox>
            <input id=hidden1 type=hidden value=abc>
            <input id=range1 type=range>
            <input id=color1 type=color>
            <input id=radio1 type=radio>
            <input id=file1 type=file>
            <input id=submit1 type=submit>
            <input id=image1 type=image>
            <input id=button1 type=button value="Button">
            <input id=reset1 type=reset>
          </div>

          <div id=set1>
            <input id=input1>
            <input id=input2 readonly>
            <input id=input3 disabled>
            <input id=input4 type=checkbox>
            <input id=input5 type=checkbox readonly>
          </div>

          <div id=set2>
            <textarea id=textarea1>textarea1</textarea>
            <textarea readonly id=textarea2>textarea2</textarea>
          </div>

          <div id=set3>
            <textarea id=textarea3>textarea3</textarea>
            <textarea disabled id=textarea4>textarea4</textarea>
          </div>

          <div id=set4>
            <p id=p1>paragraph1.</p>
            <p id=p2 contenteditable>paragraph2.</p>
          </div>
        </div>`;
        document.body.innerHTML = domStr;
        const res = querySelectorAll('#set0 :read-write', document);
        assert.deepEqual(res, [], 'result');
      });

      it('should get matched node(s)', () => {
        const domStr = `<div id="root">
          <div id=set0>
            <!-- The readonly attribute does not apply to the following input types -->
            <input id=checkbox1 type=checkbox>
            <input id=hidden1 type=hidden value=abc>
            <input id=range1 type=range>
            <input id=color1 type=color>
            <input id=radio1 type=radio>
            <input id=file1 type=file>
            <input id=submit1 type=submit>
            <input id=image1 type=image>
            <input id=button1 type=button value="Button">
            <input id=reset1 type=reset>
          </div>

          <div id=set1>
            <input id=input1>
            <input id=input2 readonly>
            <input id=input3 disabled>
            <input id=input4 type=checkbox>
            <input id=input5 type=checkbox readonly>
          </div>

          <div id=set2>
            <textarea id=textarea1>textarea1</textarea>
            <textarea readonly id=textarea2>textarea2</textarea>
          </div>

          <div id=set3>
            <textarea id=textarea3>textarea3</textarea>
            <textarea disabled id=textarea4>textarea4</textarea>
          </div>

          <div id=set4>
            <p id=p1>paragraph1.</p>
            <p id=p2 contenteditable>paragraph2.</p>
          </div>
        </div>`;
        document.body.innerHTML = domStr;
        const res = querySelectorAll('#set0 :read-only', document);
        assert.deepEqual(res, [
          document.getElementById('checkbox1'),
          document.getElementById('hidden1'),
          document.getElementById('range1'),
          document.getElementById('color1'),
          document.getElementById('radio1'),
          document.getElementById('file1'),
          document.getElementById('submit1'),
          document.getElementById('image1'),
          document.getElementById('button1'),
          document.getElementById('reset1')
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const domStr = `<div id="root">
          <div id=set0>
            <!-- The readonly attribute does not apply to the following input types -->
            <input id=checkbox1 type=checkbox>
            <input id=hidden1 type=hidden value=abc>
            <input id=range1 type=range>
            <input id=color1 type=color>
            <input id=radio1 type=radio>
            <input id=file1 type=file>
            <input id=submit1 type=submit>
            <input id=image1 type=image>
            <input id=button1 type=button value="Button">
            <input id=reset1 type=reset>
          </div>

          <div id=set1>
            <input id=input1>
            <input id=input2 readonly>
            <input id=input3 disabled>
            <input id=input4 type=checkbox>
            <input id=input5 type=checkbox readonly>
          </div>

          <div id=set2>
            <textarea id=textarea1>textarea1</textarea>
            <textarea readonly id=textarea2>textarea2</textarea>
          </div>

          <div id=set3>
            <textarea id=textarea3>textarea3</textarea>
            <textarea disabled id=textarea4>textarea4</textarea>
          </div>

          <div id=set4>
            <p id=p1>paragraph1.</p>
            <p id=p2 contenteditable>paragraph2.</p>
          </div>
        </div>`;
        document.body.innerHTML = domStr;
        const res = querySelectorAll('#set1 :read-write', document);
        assert.deepEqual(res, [
          document.getElementById('input1')
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const domStr = `<div id="root">
          <div id=set0>
            <!-- The readonly attribute does not apply to the following input types -->
            <input id=checkbox1 type=checkbox>
            <input id=hidden1 type=hidden value=abc>
            <input id=range1 type=range>
            <input id=color1 type=color>
            <input id=radio1 type=radio>
            <input id=file1 type=file>
            <input id=submit1 type=submit>
            <input id=image1 type=image>
            <input id=button1 type=button value="Button">
            <input id=reset1 type=reset>
          </div>

          <div id=set1>
            <input id=input1>
            <input id=input2 readonly>
            <input id=input3 disabled>
            <input id=input4 type=checkbox>
            <input id=input5 type=checkbox readonly>
          </div>

          <div id=set2>
            <textarea id=textarea1>textarea1</textarea>
            <textarea readonly id=textarea2>textarea2</textarea>
          </div>

          <div id=set3>
            <textarea id=textarea3>textarea3</textarea>
            <textarea disabled id=textarea4>textarea4</textarea>
          </div>

          <div id=set4>
            <p id=p1>paragraph1.</p>
            <p id=p2 contenteditable>paragraph2.</p>
          </div>
        </div>`;
        document.body.innerHTML = domStr;
        const res = querySelectorAll('#set1 :read-only', document);
        assert.deepEqual(res, [
          document.getElementById('input2'),
          document.getElementById('input3'),
          document.getElementById('input4'),
          document.getElementById('input5')
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const domStr = `<div id="root">
          <div id=set0>
            <!-- The readonly attribute does not apply to the following input types -->
            <input id=checkbox1 type=checkbox>
            <input id=hidden1 type=hidden value=abc>
            <input id=range1 type=range>
            <input id=color1 type=color>
            <input id=radio1 type=radio>
            <input id=file1 type=file>
            <input id=submit1 type=submit>
            <input id=image1 type=image>
            <input id=button1 type=button value="Button">
            <input id=reset1 type=reset>
          </div>

          <div id=set1>
            <input id=input1>
            <input id=input2 readonly>
            <input id=input3 disabled>
            <input id=input4 type=checkbox>
            <input id=input5 type=checkbox readonly>
          </div>

          <div id=set2>
            <textarea id=textarea1>textarea1</textarea>
            <textarea readonly id=textarea2>textarea2</textarea>
            <textarea id=textarea3>textarea3</textarea>
            <textarea disabled id=textarea4>textarea4</textarea>
          </div>

          <div id=set4>
            <p id=p1>paragraph1.</p>
            <p id=p2 contenteditable>paragraph2.</p>
          </div>
        </div>`;
        document.body.innerHTML = domStr;
        const res = querySelectorAll('#set2 :read-write', document);
        assert.deepEqual(res, [
          document.getElementById('textarea1'),
          document.getElementById('textarea3')
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const domStr = `<div id="root">
          <div id=set0>
            <!-- The readonly attribute does not apply to the following input types -->
            <input id=checkbox1 type=checkbox>
            <input id=hidden1 type=hidden value=abc>
            <input id=range1 type=range>
            <input id=color1 type=color>
            <input id=radio1 type=radio>
            <input id=file1 type=file>
            <input id=submit1 type=submit>
            <input id=image1 type=image>
            <input id=button1 type=button value="Button">
            <input id=reset1 type=reset>
          </div>

          <div id=set1>
            <input id=input1>
            <input id=input2 readonly>
            <input id=input3 disabled>
            <input id=input4 type=checkbox>
            <input id=input5 type=checkbox readonly>
          </div>

          <div id=set2>
            <textarea id=textarea1>textarea1</textarea>
            <textarea readonly id=textarea2>textarea2</textarea>
            <textarea id=textarea3>textarea3</textarea>
            <textarea disabled id=textarea4>textarea4</textarea>
          </div>

          <div id=set4>
            <p id=p1>paragraph1.</p>
            <p id=p2 contenteditable>paragraph2.</p>
          </div>
        </div>`;
        document.body.innerHTML = domStr;
        const res = querySelectorAll('#set2 :read-only', document);
        assert.deepEqual(res, [
          document.getElementById('textarea2'),
          document.getElementById('textarea4')
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const domStr = `<div id="root">
          <div id=set0>
            <!-- The readonly attribute does not apply to the following input types -->
            <input id=checkbox1 type=checkbox>
            <input id=hidden1 type=hidden value=abc>
            <input id=range1 type=range>
            <input id=color1 type=color>
            <input id=radio1 type=radio>
            <input id=file1 type=file>
            <input id=submit1 type=submit>
            <input id=image1 type=image>
            <input id=button1 type=button value="Button">
            <input id=reset1 type=reset>
          </div>

          <div id=set1>
            <input id=input1>
            <input id=input2 readonly>
            <input id=input3 disabled>
            <input id=input4 type=checkbox>
            <input id=input5 type=checkbox readonly>
          </div>

          <div id=set2>
            <textarea id=textarea1>textarea1</textarea>
            <textarea readonly id=textarea2>textarea2</textarea>
            <textarea id=textarea3>textarea3</textarea>
            <textarea disabled id=textarea4>textarea4</textarea>
          </div>

          <div id=set4>
            <p id=p1>paragraph1.</p>
            <p id=p2 contenteditable>paragraph2.</p>
          </div>
        </div>`;
        document.body.innerHTML = domStr;
        const res = querySelectorAll('#set4 :read-write', document);
        assert.deepEqual(res, [
          document.getElementById('p2')
        ], 'result');
      });

      it('should get matched node(s)', () => {
        const domStr = `<div id="root">
          <div id=set0>
            <!-- The readonly attribute does not apply to the following input types -->
            <input id=checkbox1 type=checkbox>
            <input id=hidden1 type=hidden value=abc>
            <input id=range1 type=range>
            <input id=color1 type=color>
            <input id=radio1 type=radio>
            <input id=file1 type=file>
            <input id=submit1 type=submit>
            <input id=image1 type=image>
            <input id=button1 type=button value="Button">
            <input id=reset1 type=reset>
          </div>

          <div id=set1>
            <input id=input1>
            <input id=input2 readonly>
            <input id=input3 disabled>
            <input id=input4 type=checkbox>
            <input id=input5 type=checkbox readonly>
          </div>

          <div id=set2>
            <textarea id=textarea1>textarea1</textarea>
            <textarea readonly id=textarea2>textarea2</textarea>
            <textarea id=textarea3>textarea3</textarea>
            <textarea disabled id=textarea4>textarea4</textarea>
          </div>

          <div id=set4>
            <p id=p1>paragraph1.</p>
            <p id=p2 contenteditable>paragraph2.</p>
          </div>
        </div>`;
        document.body.innerHTML = domStr;
        const res = querySelectorAll('#set4 :read-only', document);
        assert.deepEqual(res, [
          document.getElementById('p1')
        ], 'result');
      });
    });

    it('should not match', () => {
      const res = querySelectorAll(':not(*)', document);
      assert.deepEqual(res, [], 'result');
    });

    it('should get matched node(s)', () => {
      const domStr = `<div id="root">
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
      </div>`;
      document.body.innerHTML = domStr;
      const query = [
        "#attr-whitespace a[rel~='bookmark']",
        "#attr-whitespace a[rel~='nofollow']"
      ].join(',');
      const res = querySelectorAll(query, document);
      assert.deepEqual(res, [
        document.getElementById('attr-whitespace-a1'),
        document.getElementById('attr-whitespace-a3'),
        document.getElementById('attr-whitespace-a2'),
        document.getElementById('attr-whitespace-a5'),
        document.getElementById('attr-whitespace-a7')
      ], 'result');
    });

    it('should get matched node(s)', () => {
      const domStr = `<div id="root">
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
      </div>`;
      document.body.innerHTML = domStr;
      const query = [
        "#attr-whitespace a[rel~='bookmark']",
        "#attr-whitespace a[rel~='nofollow']"
      ].join(',');
      const res = querySelectorAll(query, document, {
        sort: true
      });
      assert.deepEqual(res, [
        document.getElementById('attr-whitespace-a1'),
        document.getElementById('attr-whitespace-a2'),
        document.getElementById('attr-whitespace-a3'),
        document.getElementById('attr-whitespace-a5'),
        document.getElementById('attr-whitespace-a7')
      ], 'result');
    });
  });
});

describe('xml', () => {
  it('should get matched node(s)', () => {
    const { window } = new JSDOM('', {
      runScripts: 'dangerously',
      url: 'http://localhost/'
    });
    const domStr = `<html>
      <body>
        <div id="target" Title="foo"></div>
      </body>
    </html>`;
    const doc =
      new window.DOMParser().parseFromString(domStr, 'application/xml');
    const node = doc.getElementById('target');
    const res = querySelector('[Title]', doc);
    assert.deepEqual(res, node, 'result');
  });

  it('should not match', () => {
    const { window } = new JSDOM('', {
      runScripts: 'dangerously',
      url: 'http://localhost/'
    });
    const domStr = `<html>
      <body>
        <div id="target" Title="foo"></div>
      </body>
    </html>`;
    const doc =
      new window.DOMParser().parseFromString(domStr, 'application/xml');
    const res = querySelector('[TITLE]', doc);
    assert.isNull(res, 'result');
  });

  it('should get matched node(s)', () => {
    const { window } = new JSDOM('', {
      runScripts: 'dangerously',
      url: 'http://localhost/'
    });
    const domStr = `<html>
      <body>
        <div id="target" Title="foo"></div>
      </body>
    </html>`;
    const doc =
      new window.DOMParser().parseFromString(domStr, 'application/xml');
    const node = doc.getElementById('target');
    const res = querySelector('[TITLE i]', doc);
    assert.deepEqual(res, node, 'result');
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
    url: 'http://localhost/',
    beforeParse: window => {
      window.Element.prototype.matches = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return matches(selector, this);
      };
      window.Element.prototype.closest = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return closest(selector, this);
      };
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
      assert.throws(() => document.body.matches('*|'), DOMException);
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
      assert.throws(() => document.body.closest('*|'), DOMException);
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
      assert.throws(() => document.querySelector('*|'), DOMException);
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
      assert.throws(() => document.body.querySelector('*|'), DOMException);
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
      assert.throws(() => frag.querySelector('*|'), DOMException);
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
      assert.throws(() => document.querySelectorAll('*|'), DOMException);
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
      assert.throws(() => document.body.querySelectorAll('*|'), DOMException);
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
      assert.throws(() => frag.querySelectorAll('*|'), DOMException);
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

    it('should get matched node(s)', () => {
      const span = document.createElement('span');
      const span2 = document.createElement('span');
      const elm = document.createElement('p');
      const elm2 = document.createElement('p');
      const body = document.body;
      span.classList.add('bar');
      elm.classList.add('foo');
      elm.appendChild(span);
      span2.classList.add('bar');
      elm2.classList.add('foo');
      elm2.appendChild(span2);
      body.appendChild(elm);
      body.appendChild(elm2);
      const items = document.querySelectorAll('.foo');
      const arr = [];
      for (const item of items) {
        const i = item.querySelector('.bar');
        if (i) {
          arr.push(i);
        }
      }
      assert.deepEqual(arr, [
        span, span2
      ], 'result');
    });
  });
});

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

  describe('#1846 - https://github.com/jsdom/jsdom/issues/1846', () => {
    const domStr = '<!DOCTYPE html><html><body></body></html>';
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
      const node = document.createElementNS('urn:ns', 'h');
      const res = node.matches('h');
      assert.isTrue(res, 'result');
    });

    it('should get matched node', () => {
      const node = document.createElementNS('urn:ns', 'h');
      const res = node.matches('*|h');
      assert.isTrue(res, 'result');
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

  describe('#2247 - https://github.com/jsdom/jsdom/issues/2247', () => {
    const domStr = '<!DOCTYPE html><html><body></body></html>';
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
      const node = document.createElementNS('', 'element');
      const res = node.matches('element');
      assert.isTrue(res, 'result');
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
      const div = document.getElementById('d1');
      const p = document.getElementById('p1');
      assert.deepEqual(div.querySelector(':scope > p'), p, 'result');
      assert.isNull(div.querySelector(':scope > span'), 'result');
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
      assert.deepEqual(div.querySelector(':scope > p, :scope > div'), p,
        'result');
    });

    it('should get matched node', () => {
      const div = document.getElementById('d1');
      const div2 = document.getElementById('d2');
      const p = document.getElementById('p1');
      const p2 = document.getElementById('p2');
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
      // NOTE: sample in #3067 seems invalid, should include Gamma, Delta
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
      // NOTE: namespace should be separated with `|`
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
