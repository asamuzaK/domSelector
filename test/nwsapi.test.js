/**
 * nwsapi.test.js
 */

/* api */
import { strict as assert } from 'node:assert';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, it } from 'mocha';

/* test */
import * as nw from '../src/js/nwsapi.js';

describe('nwsapi', () => {
  const domStr = `<!doctype html>
    <html lang="en">
      <head>
      </head>
      <body>
        <div id="div0"></div>
        <div id="div1">
          <div id="div2">
            <ul id="ul1">
              <li id="li1" class="li item">foo</li>
              <li id="li2" class="li item">bar</li>
              <li id="li3" class="li empty"></li>
            </ul>
          </div>
          <div id="div3">
            <dl id="dl1">
              <dt id="dt1"></dt>
              <dd id="dd1" class="dd">
                <span id="span1" hidden></span>
              </dd>
            </dl>
          </div>
        </div>
        <form id="form1">
            <input type="checkbox" id="chk1" />
            <input type="checkbox" id="chk2" />
            <input type="radio" id="rad1" name="group1" />
            <input type="radio" id="rad2" name="group1" checked />
            <input type="radio" id="rad3" name="group2" />
            <progress id="prog1"></progress>
            <progress id="prog2" value="50" max="100"></progress>
        </form>
      </body>
    </html>`;

  const domOpt = {
    runScripts: 'dangerously',
    url: 'http://localhost/#div0'
  };

  let window, document;

  beforeEach(() => {
    const dom = new JSDOM(domStr, domOpt);
    window = dom.window;
    document = dom.window.document;
  });

  afterEach(() => {
    window.close();
    window = null;
    document = null;
  });

  describe('Utility Functions', () => {
    it('isHTML() should return true for HTML documents and nodes', () => {
      assert.strictEqual(nw.isHTML(document), true);
      assert.strictEqual(nw.isHTML(document.getElementById('div1')), true);
    });

    it('isTarget() should check if element matches the URL hash', () => {
      assert.strictEqual(nw.isTarget(document.getElementById('div0')), true);
      assert.strictEqual(nw.isTarget(document.getElementById('div1')), false);
    });

    it('isIndeterminate() should correctly identify indeterminate states', () => {
      const chk1 = document.getElementById('chk1');
      chk1.indeterminate = true;
      assert.strictEqual(
        nw.isIndeterminate(chk1),
        true,
        'checkbox indeterminate'
      );

      const chk2 = document.getElementById('chk2');
      assert.strictEqual(nw.isIndeterminate(chk2), false, 'checkbox standard');

      const rad1 = document.getElementById('rad1'); // group1 には checked がある
      assert.strictEqual(
        nw.isIndeterminate(rad1),
        false,
        'radio with checked sibling'
      );

      const rad3 = document.getElementById('rad3'); // group2 には checked がない
      assert.strictEqual(
        nw.isIndeterminate(rad3),
        true,
        'radio without checked sibling'
      );

      const prog1 = document.getElementById('prog1'); // value 属性なし
      assert.strictEqual(
        nw.isIndeterminate(prog1),
        true,
        'progress without value'
      );

      const prog2 = document.getElementById('prog2'); // value 属性あり
      assert.strictEqual(
        nw.isIndeterminate(prog2),
        false,
        'progress with value'
      );
    });

    it('concatCall() should execute callback and return node array', () => {
      const nodes = [
        document.getElementById('li1'),
        document.getElementById('li2')
      ];
      let count = 0;
      const res = nw.concatCall(nodes, el => {
        count++;
        if (el.id === 'li1') {
          return true;
        }
      });
      assert.strictEqual(count, 2);
      assert.deepEqual(res, nodes);
    });

    it('optimize() should perform fast string adjustments', () => {
      const token = { index: 5, 1: '*', 2: '' };
      const selector = 'div > *';
      const res = nw.optimize(selector, token);
      assert.strictEqual(typeof res, 'string');
    });
  });

  describe('isTarget() node reference logic', () => {
    it('should use node.ownerDocument when an Element is passed', () => {
      const div = document.getElementById('div0');
      assert.strictEqual(
        nw.isTarget(div),
        true,
        'Should resolve ownerDocument from Element'
      );
    });

    it('should use node itself when the Document object is passed', () => {
      const result = nw.isTarget(document);
      assert.strictEqual(
        result,
        false,
        'Document object itself should not be a target but should not throw'
      );
    });
  });

  describe('solveNth() Core Logic', () => {
    let state;
    let container;

    beforeEach(() => {
      state = {
        idx: 0,
        len: 0,
        set: 0,
        parent: undefined,
        parents: [],
        nodes: []
      };
      container = document.createElement('div');
      container.innerHTML = `
      <p id="p1"></p>
      <span id="s1"></span>
      <p id="p2"></p>
      <span id="s2"></span>
    `;
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    it('should reset the state and return -1 when dir is 2', () => {
      state.idx = 5;
      const result = nw.solveNth(null, 2, state, false);
      assert.strictEqual(result, -1);
      assert.strictEqual(state.idx, 0);
      assert.strictEqual(state.nodes.length, 0);
    });

    it('should return the correct index in :nth-child mode (isOfType=false)', () => {
      const p1 = document.getElementById('p1');
      const s1 = document.getElementById('s1');
      const p2 = document.getElementById('p2');
      assert.strictEqual(nw.solveNth(p1, false, state, false), 1); // 1st child
      assert.strictEqual(nw.solveNth(s1, false, state, false), 2); // 2nd child
      assert.strictEqual(nw.solveNth(p2, false, state, false), 3); // 3rd child
      assert.strictEqual(nw.solveNth(p2, true, state, false), 2);
    });

    it('should return the correct index by tag name in :nth-of-type mode (isOfType=true)', () => {
      const p1 = document.getElementById('p1');
      const p2 = document.getElementById('p2');
      const s1 = document.getElementById('s1');
      const s2 = document.getElementById('s2');
      assert.strictEqual(nw.solveNth(p1, false, state, true), 1);
      assert.strictEqual(nw.solveNth(p2, false, state, true), 2);
      assert.strictEqual(nw.solveNth(s1, false, state, true), 1);
      assert.strictEqual(nw.solveNth(s2, false, state, true), 2);
      assert.strictEqual(nw.solveNth(s1, true, state, true), 2);
    });

    it('should reuse the cache for consecutive calls within the same parent element', () => {
      const p1 = document.getElementById('p1');
      const p2 = document.getElementById('p2');
      nw.solveNth(p1, false, state, false);
      const initialParentsLength = state.parents.length;
      nw.solveNth(p2, false, state, false);
      assert.strictEqual(
        state.parents.length,
        initialParentsLength,
        'Should not re-register parent due to caching'
      );
      assert.strictEqual(state.idx, 3, 'Should correctly update the index');
    });

    it('should create a new context when moving to a different parent element', () => {
      const p1 = document.getElementById('p1');
      const subDiv = document.createElement('div');
      subDiv.innerHTML = '<b id="b1"></b>';
      container.appendChild(subDiv);
      const b1 = document.getElementById('b1');
      nw.solveNth(p1, false, state, false); // context of 'container'
      assert.strictEqual(state.parents.length, 1);
      nw.solveNth(b1, false, state, false); // context of 'subDiv'
      assert.strictEqual(
        state.parents.length,
        2,
        'Should register a new parent element'
      );
    });

    it('should find the element using the middle-loop search when it is not at the cached boundaries', () => {
      container.innerHTML = `
      <p id="p1"></p>
      <p id="p2"></p>
      <p id="p3"></p>
      <p id="p4"></p>
      <p id="p5"></p>
    `;
      const p1 = document.getElementById('p1');
      const p3 = document.getElementById('p3');
      const p5 = document.getElementById('p5');
      nw.solveNth(p1, false, state, false);
      nw.solveNth(p5, false, state, false);
      const result = nw.solveNth(p3, false, state, false);
      assert.strictEqual(
        result,
        3,
        'Should correctly identify the 3rd element via loop search'
      );
      assert.strictEqual(state.idx, 3, 'Should update state.idx to 3');
    });

    it('should hit the length cache when returning to a previously visited parent', () => {
      const container1 = document.createElement('div');
      container1.innerHTML = '<p id="c1-p1"></p><p id="c1-p2"></p>';
      const container2 = document.createElement('div');
      container2.innerHTML = '<span id="c2-s1"></span>';
      document.body.appendChild(container1);
      document.body.appendChild(container2);
      const c1p1 = container1.firstElementChild;
      const c1p2 = container1.lastElementChild;
      const c2s1 = container2.firstElementChild;
      nw.solveNth(c1p1, false, state, false);
      assert.strictEqual(state.len, 2);
      nw.solveNth(c2s1, false, state, false);
      assert.strictEqual(state.len, 1);
      const result = nw.solveNth(c1p2, false, state, false);
      assert.strictEqual(
        result,
        2,
        'Should correctly identify the 2nd element'
      );
      assert.strictEqual(
        state.len,
        2,
        'Should retrieve the length (2) from the cache'
      );
      assert.strictEqual(
        state.set,
        0,
        'Should restore the correct set index (0)'
      );
      document.body.removeChild(container1);
      document.body.removeChild(container2);
    });

    it('should hit the length cache in isOfType mode when the tag is already cached for that parent', () => {
      container.innerHTML = '<p id="type-p1"></p><p id="type-p2"></p>';
      const p1 = document.getElementById('type-p1');
      const p2 = document.getElementById('type-p2');
      nw.solveNth(p1, false, state, true);
      const other = document.createElement('div');
      other.innerHTML = '<b></b>';
      nw.solveNth(other.firstChild, false, state, true);
      const result = nw.solveNth(p2, false, state, true);
      assert.strictEqual(result, 2);
      assert.strictEqual(
        state.len,
        2,
        'Should hit the type-specific length cache'
      );
    });

    it('should find the parent from the end of the cache (k-index search)', () => {
      const c1 = document.createElement('div');
      const c2 = document.createElement('div');
      const c3 = document.createElement('div');
      c1.innerHTML = '<p id="p1"></p>';
      c2.innerHTML = '<p id="p2"></p>';
      c3.innerHTML = '<p id="p3"></p>';
      [c1, c2, c3].forEach(c => document.body.appendChild(c));
      const p1 = c1.firstChild;
      const p2 = c2.firstChild;
      const p3 = c3.firstChild;
      nw.solveNth(p1, false, state, false);
      nw.solveNth(p2, false, state, false);
      nw.solveNth(p3, false, state, false);
      nw.solveNth(p1, false, state, false);
      const result = nw.solveNth(p3, false, state, false);
      assert.strictEqual(result, 1, 'Should correctly find the index of p3');
      assert.strictEqual(state.set, 2, 'Should have used the cache at index 2');
      [c1, c2, c3].forEach(c => document.body.removeChild(c));
    });
  });

  describe('solveNth() start element selection coverage', () => {
    let state;

    beforeEach(() => {
      state = {
        idx: 0,
        len: 0,
        set: 0,
        parent: undefined,
        parents: [],
        nodes: []
      };
    });

    it('should start traversal from firstElementChild when state.parent is defined', () => {
      const parent = document.createElement('div');
      parent.innerHTML = '<p id="p1"></p><p id="p2"></p>';
      const p2 = parent.lastElementChild;
      const result = nw.solveNth(p2, false, state, false);
      assert.strictEqual(result, 2, 'Should correctly find the second child');
      assert.strictEqual(
        state.parent,
        parent,
        'State parent should be set to the container'
      );
    });

    it('should fallback to "element" when state.parent is null/undefined', () => {
      const orphan = document.createElement('div');
      const result = nw.solveNth(orphan, false, state, false);
      assert.strictEqual(result, 1, 'Should return 1 for an orphan element');
      assert.strictEqual(state.len, 1, 'Cache length should be 1');
    });
  });

  describe('Nwsapi Class instance', () => {
    let api;

    beforeEach(() => {
      api = new nw.Nwsapi(window, document);
    });

    describe('Fast-path finders', () => {
      it('_byId() should retrieve nodes by ID', () => {
        const res = api._byId('ul1', document);
        assert.strictEqual(res.length, 1);
        assert.strictEqual(res[0].id, 'ul1');
      });

      it('_byTag() should retrieve nodes by tag name', () => {
        const res = api._byTag('li', document);
        assert.strictEqual(res.length, 3);
        assert.strictEqual(res[0].id, 'li1');
      });

      it('_byClass() should retrieve nodes by class name', () => {
        const res = api._byClass('item', document);
        assert.strictEqual(res.length, 2);
        assert.strictEqual(res[0].id, 'li1');
        assert.strictEqual(res[1].id, 'li2');
      });

      it('_byClass() fallback should return empty array if context lacks getElementsByClassName', () => {
        const mockContext = {
          localName: 'div',
          id: 'dummy'
        };
        const res = api._byClass('item', mockContext);
        assert.ok(Array.isArray(res), 'Result should be an array');
        assert.strictEqual(res.length, 0, 'Should return an empty array');
      });
    });

    describe('DOM Matchers & Selectors', () => {
      it('_collect() should sort results in document order and remove duplicates on first run', () => {
        const ul = document.getElementById('ul1');
        const res = api.select('.empty, .li', ul);
        assert.strictEqual(res.length, 3);
        assert.strictEqual(res[0].id, 'li1');
        assert.strictEqual(res[1].id, 'li2');
        assert.strictEqual(res[2].id, 'li3');
      });

      it('match() should return boolean evaluating selector against element', () => {
        const li1 = document.getElementById('li1');
        assert.strictEqual(api.match('.li', li1), true);
        assert.strictEqual(api.match('.empty', li1), false);
        assert.strictEqual(api.match('#ul1 > li.item', li1), true);
      });

      it('match() should execute callback if matched', () => {
        const li1 = document.getElementById('li1');
        let called = false;
        api.match('.li', li1, () => {
          called = true;
        });
        assert.strictEqual(called, true);
      });

      it('match() should correctly evaluate the :target pseudo-class', () => {
        const div0 = document.getElementById('div0');
        const div1 = document.getElementById('div1');
        assert.strictEqual(
          api.match(':target', div0),
          true,
          'div0 should match :target'
        );
        assert.strictEqual(
          api.match(':target', div1),
          false,
          'div1 should not match :target'
        );
        const targetNodes = api.select(':target', document);
        assert.strictEqual(targetNodes.length, 1);
        assert.strictEqual(targetNodes[0].id, 'div0');
      });

      it('closest() should find the nearest matching ancestor', () => {
        const span1 = document.getElementById('span1');
        const dl1 = document.getElementById('dl1');
        assert.deepEqual(api.closest('dl', span1), dl1);
        assert.deepEqual(api.closest('#div0', span1), null);
      });

      it('select() should collect all matching descendant elements', () => {
        const ul = document.getElementById('ul1');
        const res = api.select('.li', ul);
        assert.strictEqual(res.length, 3);
        assert.strictEqual(res[0].id, 'li1');
        assert.strictEqual(res[2].id, 'li3');
      });

      it('select() should support pseudo-classes', () => {
        const div1 = document.getElementById('div1');
        const res = api.select('li:last-child', div1);
        assert.strictEqual(res.length, 1);
        assert.strictEqual(res[0].id, 'li3');
      });

      it('select() should use cache for single selector (no callback)', () => {
        const ul = document.getElementById('ul1');
        const res1 = api.select('.li', ul);
        const res2 = api.select('.li', ul);
        assert.strictEqual(res2.length, 3);
        assert.deepEqual(res1, res2);
      });

      it('select() should use cache for single selector (with callback)', () => {
        const ul = document.getElementById('ul1');
        const cb = () => {};
        api.select('.empty', ul, cb);
        const res2 = api.select('.empty', ul, cb);
        assert.strictEqual(res2.length, 1);
        assert.strictEqual(res2[0].id, 'li3');
      });

      it('select() should use cache for multiple selectors and handle duplicates', () => {
        const ul = document.getElementById('ul1');
        const res1 = api.select('.li, .item', ul);
        const res2 = api.select('.li, .item', ul);
        assert.strictEqual(res2.length, 3);
        assert.strictEqual(res2[0].id, 'li1');
        assert.strictEqual(res2[1].id, 'li2');
        assert.strictEqual(res2[2].id, 'li3');
        assert.deepEqual(res1, res2);
      });

      it('select() should use cache for multiple selectors (with callback)', () => {
        const ul = document.getElementById('ul1');
        const cb = () => {};
        api.select('.li, .item', ul, cb);
        const res2 = api.select('.li, .item', ul, cb);
        assert.strictEqual(res2.length, 3);
      });

      it('first() should return the first matching descendant element', () => {
        const ul = document.getElementById('ul1');
        const res = api.first('.li', ul);
        assert.notStrictEqual(res, null);
        assert.strictEqual(res.id, 'li1');
      });

      it('first() should default to this.doc if context is not provided', () => {
        const res = api.first('#li2');
        assert.notStrictEqual(res, null);
        assert.strictEqual(res.id, 'li2');
      });

      it('first() should return null if no match found', () => {
        const res = api.first('.not-exist', document);
        assert.strictEqual(res, null);
      });

      it('first() should execute the provided callback and stop after the first match', () => {
        const ul = document.getElementById('ul1');
        const foundElements = [];
        const res = api.first('.li', ul, el => {
          foundElements.push(el);
        });
        assert.notStrictEqual(res, null);
        assert.strictEqual(res.id, 'li1');
        assert.strictEqual(foundElements.length, 1);
        assert.strictEqual(foundElements[0].id, 'li1');
      });

      it('first() should throw on empty string selector', () => {
        assert.throws(
          () => api.first('', document),
          err =>
            err.name === 'SyntaxError' || err instanceof window.DOMException
        );
      });

      it('select() should correctly evaluate tree-structural pseudo-classes with formula "n"', () => {
        const ul = document.getElementById('ul1');
        const res = api.select('li:nth-child(n)', ul);
        assert.strictEqual(res.length, 3);
        assert.strictEqual(res[0].id, 'li1');
        assert.strictEqual(res[1].id, 'li2');
        assert.strictEqual(res[2].id, 'li3');
      });

      it('select() should correctly evaluate tree-structural pseudo-classes with formula "1"', () => {
        const ul = document.getElementById('ul1');
        const res1 = api.select('li:nth-child(1)', ul);
        assert.strictEqual(res1.length, 1);
        assert.strictEqual(res1[0].id, 'li1');
        const res2 = api.select('li:nth-last-child(1)', ul);
        assert.strictEqual(res2.length, 1);
        assert.strictEqual(res2[0].id, 'li3');
        const res3 = api.select('li:nth-of-type(1)', ul);
        assert.strictEqual(res3.length, 1);
        assert.strictEqual(res3[0].id, 'li1');
        const res4 = api.select('li:nth-last-of-type(1)', ul);
        assert.strictEqual(res4.length, 1);
        assert.strictEqual(res4[0].id, 'li3');
      });

      it('select() should correctly evaluate nth-child with a=0 formula (0n+b or 0)', () => {
        const ul = document.getElementById('ul1');
        const res1 = api.select('li:nth-child(0n+2)', ul);
        assert.strictEqual(res1.length, 1);
        assert.strictEqual(res1[0].id, 'li2');
        const res2 = api.select('li:nth-child(0)', ul);
        assert.strictEqual(res2.length, 0);
      });

      it('select() should correctly evaluate the :only-of-type pseudo-class', () => {
        const div3 = document.getElementById('div3');
        const dl = document.getElementById('dl1');
        const newDt = document.createElement('dt');
        dl.appendChild(newDt);
        const res1 = api.select('dd:only-of-type', div3);
        assert.strictEqual(
          res1.length,
          1,
          'dd should match as it is the only one'
        );
        const res2 = api.select('dt:only-of-type', div3);
        assert.strictEqual(
          res2.length,
          0,
          'dt should not match as there are multiple dt elements'
        );
      });

      it('select() and match() should correctly evaluate the :has pseudo-class', () => {
        const ul = document.getElementById('ul1');
        const res1 = api.select('ul:has(.empty)', document);
        assert.strictEqual(res1.length, 1);
        assert.strictEqual(res1[0].id, 'ul1');
        const res2 = api.select('li:has(span)', document);
        assert.strictEqual(res2.length, 0);
        assert.strictEqual(api.match('ul:has(.item)', ul), true);
        const res3 = api.select('ul:has([class="li item"])', document);
        assert.strictEqual(res3.length, 1);
        assert.strictEqual(res3[0].id, 'ul1');
      });

      it('select() should correctly evaluate the :last-of-type pseudo-class', () => {
        const ul = document.getElementById('ul1');
        const span1 = document.createElement('span');
        span1.id = 'span-extra';
        const span2 = document.createElement('span');
        span2.id = 'span-last';
        ul.appendChild(span1);
        ul.appendChild(span2);
        const resLi = api.select('li:last-of-type', ul);
        assert.strictEqual(
          resLi.length,
          1,
          'Should match the last li element even if it is not the last child'
        );
        assert.strictEqual(resLi[0].id, 'li3');
        const resSpan = api.select('span:last-of-type', ul);
        assert.strictEqual(
          resSpan.length,
          1,
          'Should match the last span element'
        );
        assert.strictEqual(resSpan[0].id, 'span-last');
        ul.removeChild(span1);
        ul.removeChild(span2);
      });

      it('select() should correctly evaluate the :first-of-type pseudo-class', () => {
        const ul = document.getElementById('ul1');
        const span1 = document.createElement('span');
        span1.id = 'span-first';
        ul.insertBefore(span1, ul.firstElementChild);
        const resLi = api.select('li:first-of-type', ul);
        assert.strictEqual(
          resLi.length,
          1,
          'Should match the first li element even if it is not the first child'
        );
        assert.strictEqual(resLi[0].id, 'li1');
        const resSpan = api.select('span:first-of-type', ul);
        assert.strictEqual(
          resSpan.length,
          1,
          'Should match the first span element'
        );
        assert.strictEqual(resSpan[0].id, 'span-first');
        ul.removeChild(span1);
      });

      it('select() and match() should correctly evaluate the :first-child pseudo-class', () => {
        const ul = document.getElementById('ul1');
        const res1 = api.select('li:first-child', ul);
        assert.strictEqual(
          res1.length,
          1,
          'Should return only the first child element'
        );
        assert.strictEqual(res1[0].id, 'li1', 'The first li should be li1');
        const dl = document.getElementById('dl1');
        const res2 = api.select(':first-child', dl);
        assert.strictEqual(
          res2.length,
          2,
          'Should return all first-child descendants within dl'
        );
        assert.strictEqual(
          res2[0].id,
          'dt1',
          'The first match should be dt1 (first child of dl)'
        );
        assert.strictEqual(
          res2[1].id,
          'span1',
          'The second match should be span1 (first child of dd1)'
        );
        const li1 = document.getElementById('li1');
        const li2 = document.getElementById('li2');
        assert.strictEqual(
          api.match(':first-child', li1),
          true,
          'li1 is the first child'
        );
        assert.strictEqual(
          api.match(':first-child', li2),
          false,
          'li2 is not the first child'
        );
      });
    });

    describe('Error Handling', () => {
      it('_compileSelector() should throw on invalid start characters', () => {
        assert.throws(
          () => api.select('!invalid', document),
          err =>
            err.name === 'SyntaxError' || err instanceof window.DOMException,
          'Selector starting with invalid character "!" should throw'
        );
        assert.throws(
          () => api.select('div % span', document),
          err =>
            err.name === 'SyntaxError' || err instanceof window.DOMException,
          'Selector containing invalid character "%" should throw'
        );
      });

      it('select() should throw when tree-structural pseudo-class formula is missing', () => {
        assert.throws(
          () => api.select('li:nth-child()', document),
          err =>
            err.name === 'SyntaxError' || err instanceof window.DOMException,
          'Empty formula in nth-child should throw a SyntaxError'
        );
        assert.throws(
          () => api.select('li:nth-of-type()', document),
          err =>
            err.name === 'SyntaxError' || err instanceof window.DOMException,
          'Empty formula in nth-of-type should throw a SyntaxError'
        );
      });

      it('match() should throw TypeError when selectors argument is undefined', () => {
        assert.throws(
          () => api.match(),
          err =>
            err instanceof window.TypeError &&
            err.message === 'Not enough arguments',
          'Undefined selectors should throw a TypeError'
        );
      });

      it('match() should throw on empty string selector', () => {
        const li1 = document.getElementById('li1');
        assert.throws(
          () => api.match('', li1),
          err =>
            err.name === 'SyntaxError' || err instanceof window.DOMException,
          'Empty string should throw a SyntaxError'
        );
      });

      it('select() should throw TypeError when selectors argument is undefined', () => {
        assert.throws(
          () => api.select(),
          err =>
            err instanceof window.TypeError &&
            err.message === 'Not enough arguments',
          'Undefined selectors should throw a TypeError'
        );

        assert.throws(
          () => api.select(undefined, document),
          err =>
            err instanceof window.TypeError &&
            err.message === 'Not enough arguments',
          'Explicit undefined should also throw a TypeError'
        );
      });

      it('select() should throw on empty string selector', () => {
        assert.throws(
          () => api.select('', document),
          err =>
            err.name === 'SyntaxError' || err instanceof window.DOMException,
          'Empty string should throw a SyntaxError'
        );
      });

      it('select() should throw on invalid selectors', () => {
        assert.throws(
          () => api.select(':invalid-pseudo'),
          err =>
            err.name === 'SyntaxError' || err instanceof window.DOMException
        );
      });

      it('select() should throw when selector ends with a trailing comma', () => {
        assert.throws(
          () => api.select('div, span,'),
          err =>
            err.name === 'SyntaxError' || err instanceof window.DOMException,
          'trailing comma without space'
        );
        assert.throws(
          () => api.select('.foo, '),
          err =>
            err.name === 'SyntaxError' || err instanceof window.DOMException,
          'trailing comma with space'
        );
      });
    });

    describe('Internal Compilers', () => {
      it('_compileAttribute() should handle empty value with ~= operator', () => {
        const div = document.createElement('div');
        div.setAttribute('data-test', ' ');
        const res = api.match('[data-test~=""]', div);
        assert.strictEqual(typeof res, 'boolean');
      });

      it('should handle non-string selectors by converting them to strings', () => {
        const customSelector = {
          toString: () => 'div'
        };
        const res = api.select(customSelector, document);
        assert.ok(
          Array.isArray(res),
          'Should convert object to string "div" and return an array'
        );
        assert.throws(
          () => api.select({}, document),
          err => {
            return (
              err.name === 'SyntaxError' || err instanceof window.DOMException
            );
          },
          'Should convert {} to "[object Object]" and throw a SyntaxError'
        );
        const nullRes = api.select(null, document);
        assert.ok(
          Array.isArray(nullRes),
          'Should treat null as "null" tag and return empty array if not found'
        );
      });

      it('should compile "extra" check when |a| is not 1 (e.g., 3n+1 or -2n+3)', () => {
        const ul = document.getElementById('ul1');
        ul.innerHTML = `
      <li id="li-1">1</li>
      <li id="li-2">2</li>
      <li id="li-3">3</li>
      <li id="li-4">4</li>
      <li id="li-5">5</li>
    `;
        const resPositive = api.select('li:nth-child(3n+1)', ul);
        assert.strictEqual(resPositive.length, 2, 'Should match 1st and 4th');
        assert.strictEqual(resPositive[0].id, 'li-1');
        assert.strictEqual(resPositive[1].id, 'li-4');
        const resNegative = api.select('li:nth-child(-2n+5)', ul);
        assert.strictEqual(
          resNegative.length,
          3,
          'Should match 5th, 3rd, and 1st'
        );
        assert.strictEqual(resNegative[0].id, 'li-1');
        assert.strictEqual(resNegative[1].id, 'li-3');
        assert.strictEqual(resNegative[2].id, 'li-5');
      });

      it('should set typeStr to "false" when using :nth-child (forward direction)', () => {
        const ul = document.getElementById('ul1');
        const res = api.select('li:nth-child(1)', ul);
        assert.strictEqual(res.length, 1);
        assert.strictEqual(
          res[0].id,
          'li1',
          'Should match the first element from the start'
        );
      });

      it('should set typeStr to "true" when using :nth-last-child (backward direction)', () => {
        const ul = document.getElementById('ul1');
        const res = api.select('li:nth-last-child(1)', ul);
        assert.strictEqual(res.length, 1);
        assert.strictEqual(
          res[0].id,
          'li3',
          'Should match the first element from the end'
        );
      });

      it('should set typeStr to "false" when using :nth-of-type (forward direction)', () => {
        const ul = document.getElementById('ul1');
        const res = api.select('li:nth-of-type(2)', ul);
        assert.strictEqual(res.length, 1);
        assert.strictEqual(
          res[0].id,
          'li2',
          'Should match the second LI element'
        );
      });

      it('should set typeStr to "true" when using :nth-last-of-type (backward direction)', () => {
        const ul = document.getElementById('ul1');
        const res = api.select('li:nth-last-of-type(2)', ul);
        assert.strictEqual(res.length, 1);
        assert.strictEqual(
          res[0].id,
          'li2',
          'Should match the second LI element from the end'
        );
      });

      it('should use "-" sign when b is positive (e.g., 3n+1)', () => {
        const ul = document.getElementById('ul1');
        ul.innerHTML = `
        <li id="li-1">1</li>
        <li id="li-2">2</li>
        <li id="li-3">3</li>
        <li id="li-4">4</li>
      `;
        const res = api.select('li:nth-child(3n+1)', ul);
        assert.strictEqual(res.length, 2);
        assert.strictEqual(res[0].id, 'li-1');
        assert.strictEqual(res[1].id, 'li-4');
      });

      it('should use "+" sign when b is negative (e.g., 3n-1)', () => {
        const ul = document.getElementById('ul1');
        ul.innerHTML = `
        <li id="li-1">1</li>
        <li id="li-2">2</li>
        <li id="li-3">3</li>
        <li id="li-4">4</li>
      `;
        const res = api.select('li:nth-child(3n-1)', ul);
        assert.strictEqual(res.length, 1);
        assert.strictEqual(res[0].id, 'li-2');
      });

      it('should set pseudoName to a lowercased string when match[1] exists', () => {
        const ul = document.getElementById('ul1');
        const res = api.select('li:NTH-CHILD(1)', ul);
        assert.strictEqual(res.length, 1);
        assert.strictEqual(res[0].id, 'li1');
      });

      it('should return the unmodified source when pseudoName is an empty string (match[1] is missing)', () => {
        const invalidSelector = ':nth-child()';
        assert.throws(
          () => api.select(invalidSelector, document),
          err => {
            return (
              err.name === 'SyntaxError' || err instanceof window.DOMException
            );
          },
          'Should throw SyntaxError when pseudo-class name or formula is missing'
        );
      });

      it('_compileAttribute() should use expr[0] when no namespace prefix is present', () => {
        const div = document.createElement('div');
        div.setAttribute('testattr', 'value');
        assert.ok(
          api.match('[testattr="value"]', div),
          'Should match attribute without namespace'
        );
      });

      it('_compileAttribute() should use expr[1] when a namespace prefix is present', () => {
        const div = document.createElement('div');
        div.setAttribute('xlink:href', 'https://example.com');
        assert.ok(
          api.match('[xlink:href]', div),
          'Should match attribute with namespace prefix'
        );
      });

      it('_compileAttribute() should compile to if(false) when ~= value contains a space', () => {
        const div = document.createElement('div');
        div.setAttribute('data-test', 'foo bar');
        const res = api.match('[data-test~="foo bar"]', div);
        assert.strictEqual(
          res,
          false,
          'Should return false when ~= search value contains spaces'
        );
      });

      it('_compile() should return the cached lambda function on subsequent calls with the same selector', () => {
        const selector = '.test-cache-selector';
        const selectLambda1 = api._compile(selector, true);
        const selectLambda2 = api._compile(selector, true);
        assert.strictEqual(
          selectLambda1,
          selectLambda2,
          'Should return the exact same cached lambda object for select mode (mode: true)'
        );
        const matchLambda1 = api._compile(selector, false);
        const matchLambda2 = api._compile(selector, false);
        assert.strictEqual(
          matchLambda1,
          matchLambda2,
          'Should return the exact same cached lambda object for match mode (mode: false)'
        );
        assert.notStrictEqual(
          selectLambda1,
          matchLambda1,
          'Select mode and match mode should maintain separate caches'
        );
      });

      it('_compilePseudoLogical() should fallback to [expr] when splitGroup match returns null', () => {
        try {
          api.select('div:is(,)', document);
          assert.fail(
            'Should throw an error for invalid selector inside :is()'
          );
        } catch (err) {
          assert.notStrictEqual(
            err.name,
            'TypeError',
            'Should NOT crash with TypeError (Cannot read properties of null)'
          );
          assert.ok(
            err.name === 'SyntaxError' || err instanceof window.DOMException,
            'Should safely fallback and throw a proper SyntaxError'
          );
        }
        try {
          api.select('div:not()', document);
          assert.ok(
            true,
            'Processed empty pseudo-class without throwing TypeError'
          );
        } catch (err) {
          assert.notStrictEqual(
            err.name,
            'TypeError',
            'Should NOT crash with TypeError for empty :not()'
          );
        }
      });
    });

    describe('Internal Compiler Fallbacks', () => {
      it('_byTag() fallback should handle wildcard and specific tags', () => {
        const mockContext = {
          firstElementChild: {
            localName: 'div',
            nextElementSibling: {
              localName: 'span',
              nextElementSibling: null,
              getElementsByTagName: () => []
            },
            getElementsByTagName: () => []
          }
        };
        const resWildcard = api._byTag('*', mockContext);
        assert.strictEqual(resWildcard.length, 2, 'Wildcard matches all tags');
        const resDiv = api._byTag('DIV', mockContext);
        assert.strictEqual(resDiv.length, 1, 'Specific tag matches div');
        assert.strictEqual(resDiv[0].localName, 'div');
      });

      it('_byTag() fallback should iterate and collect children elements', () => {
        const mockChild1 = { localName: 'span' };
        const mockChild2 = { localName: 'span' };
        const mockContext = {
          firstElementChild: {
            localName: 'div',
            nextElementSibling: null,
            getElementsByTagName: tag => {
              if (tag === 'span' || tag === '*') {
                return [mockChild1, mockChild2];
              }
              return [];
            }
          }
        };
        const resSpan = api._byTag('span', mockContext);
        assert.strictEqual(
          resSpan.length,
          2,
          'Should collect elements from children'
        );
        assert.strictEqual(resSpan[0].localName, 'span');
        assert.strictEqual(resSpan[1].localName, 'span');
        const resWildcard = api._byTag('*', mockContext);
        assert.strictEqual(
          resWildcard.length,
          3,
          'Should collect context element and its children'
        );
        assert.strictEqual(resWildcard[0].localName, 'div');
        assert.strictEqual(resWildcard[1].localName, 'span');
        assert.strictEqual(resWildcard[2].localName, 'span');
      });

      it('_compileSelector() should throw on unexpected characters via direct call', () => {
        const mockSource = 'r=true;';
        assert.throws(
          () => api._compileSelector('!invalid', mockSource, false),
          err => {
            return (
              (err.name === 'SyntaxError' ||
                err instanceof window.DOMException) &&
              err.message.includes('is not a valid selector')
            );
          }
        );
      });

      it('_compilePseudoStructural() should return unmodified source for unknown pseudo-classes', () => {
        const mockMatch = [':unknown', 'unknown'];
        const mockSource = 'console.log("test5");';
        const result = api._compilePseudoStructural(mockMatch, mockSource);
        assert.strictEqual(result, mockSource);
      });

      it('_compilePseudoLogical() should return unmodified source for unknown pseudo-classes', () => {
        const mockMatch = [':unknown(.foo)', 'unknown', '.foo'];
        const mockSource = 'console.log("test4");';
        const result = api._compilePseudoLogical(mockMatch, mockSource);
        assert.strictEqual(result, mockSource);
      });

      it('_compilePseudoLocation() should return unmodified source for unknown pseudo-classes', () => {
        const mockMatch = [':unknown', 'unknown'];
        const mockSource = 'console.log("test3");';
        const result = api._compilePseudoLocation(mockMatch, mockSource);
        assert.strictEqual(result, mockSource);
      });

      it('_compilePseudoInputState() should return unmodified source for unknown pseudo-classes', () => {
        const mockMatch = [':unknown', 'unknown'];
        const mockSource = 'console.log("test2");';
        const result = api._compilePseudoInputState(mockMatch, mockSource);
        assert.strictEqual(result, mockSource);
      });

      it('_compilePseudoInputValue() should return unmodified source for unknown pseudo-classes', () => {
        const mockMatch = [':unknown', 'unknown'];
        const mockSource = 'console.log("test");';
        const result = api._compilePseudoInputValue(mockMatch, mockSource);
        assert.strictEqual(result, mockSource);
      });

      it('_compilePseudoTreeStruct() should set pseudoName to a lowercased string when match[1] exists', () => {
        const ul = document.getElementById('ul1');
        const res = api.select('li:NTH-CHILD(1)', ul);
        assert.strictEqual(res.length, 1);
        assert.strictEqual(res[0].id, 'li1');
      });

      it('_compilePseudoTreeStruct() should set pseudoName to empty string and throw when match[1] is missing', () => {
        assert.throws(
          () => api.select('li:(1)', document),
          err =>
            err.name === 'SyntaxError' || err instanceof window.DOMException,
          'Should throw SyntaxError when the pseudo-class name is missing'
        );
      });
    });

    describe('_compilePseudoTreeStruct() internal direct calls', () => {
      it('should return source and emit error when match[1] is undefined (else branch of pseudoName)', () => {
        const api = new nw.Nwsapi(window, document);
        const mockMatch = [':(even)', undefined, 'even'];
        const mockSource = 'r=true;';
        const selectorString = ':(even)';
        assert.throws(
          () =>
            api._compilePseudoTreeStruct(mockMatch, mockSource, selectorString),
          err => {
            return (
              (err.name === 'SyntaxError' ||
                err instanceof window.DOMException) &&
              err.message.includes(selectorString)
            );
          },
          'Should handle undefined pseudoName by falling back to empty string and throwing'
        );
      });

      it('should return source and emit error when formula is missing', () => {
        const api = new nw.Nwsapi(window, document);
        const mockMatch = [':nth-child()', 'nth-child', undefined];
        const mockSource = 'r=true;';
        assert.throws(
          () =>
            api._compilePseudoTreeStruct(mockMatch, mockSource, ':nth-child()'),
          err =>
            err.name === 'SyntaxError' || err instanceof window.DOMException
        );
      });
    });
  });
});
