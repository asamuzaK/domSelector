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
    it('should identify HTML document and element instances correctly', () => {
      assert.strictEqual(nw.isHTML(document), true, 'document is HTML');
      assert.strictEqual(
        nw.isHTML(document.getElementById('div1')),
        true,
        'element is HTML'
      );
    });

    it('should return true when element ID matches document URL hash', () => {
      assert.strictEqual(
        nw.isTarget(document.getElementById('div0')),
        true,
        'target element matches hash'
      );
      assert.strictEqual(
        nw.isTarget(document.getElementById('div1')),
        false,
        'non-target element does not match hash'
      );
    });

    it('should evaluate indeterminate state on form control elements', () => {
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

    it('should execute callback on node list and return array input', () => {
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
      assert.strictEqual(count, 2, 'callback executed for each node');
      assert.deepEqual(res, nodes, 'returns original node array');
    });

    it('should optimize selector string using token replacement AST', () => {
      const token = { index: 5, 1: '*', 2: '' };
      const selector = 'div > *';
      const res = nw.optimize(selector, token);
      assert.strictEqual(typeof res, 'string', 'returns string result');
    });
  });

  describe('isTarget() node reference logic', () => {
    it('should resolve ownerDocument reference for target element node', () => {
      const div = document.getElementById('div0');
      assert.strictEqual(
        nw.isTarget(div),
        true,
        'Should resolve ownerDocument from Element'
      );
    });

    it('should return false when target check is called on Document', () => {
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

    it('should reset state object and return -1 for direction code 2', () => {
      state.idx = 5;
      const result = nw.solveNth(null, 2, state, false);
      assert.strictEqual(result, -1, 'returns -1 for reset direction');
      assert.strictEqual(state.idx, 0, 'resets state index');
      assert.strictEqual(state.nodes.length, 0, 'clears nodes array');
    });

    it('should calculate 1-based child index in nth-child mode', () => {
      const p1 = document.getElementById('p1');
      const s1 = document.getElementById('s1');
      const p2 = document.getElementById('p2');
      assert.strictEqual(
        nw.solveNth(p1, false, state, false),
        1,
        '1st child index'
      );
      assert.strictEqual(
        nw.solveNth(s1, false, state, false),
        2,
        '2nd child index'
      );
      assert.strictEqual(
        nw.solveNth(p2, false, state, false),
        3,
        '3rd child index'
      );
      assert.strictEqual(
        nw.solveNth(p2, true, state, false),
        2,
        '2nd child index from end'
      );
    });

    it('should calculate 1-based type index in nth-of-type mode', () => {
      const p1 = document.getElementById('p1');
      const p2 = document.getElementById('p2');
      const s1 = document.getElementById('s1');
      const s2 = document.getElementById('s2');
      assert.strictEqual(
        nw.solveNth(p1, false, state, true),
        1,
        '1st p element index'
      );
      assert.strictEqual(
        nw.solveNth(p2, false, state, true),
        2,
        '2nd p element index'
      );
      assert.strictEqual(
        nw.solveNth(s1, false, state, true),
        1,
        '1st span element index'
      );
      assert.strictEqual(
        nw.solveNth(s2, false, state, true),
        2,
        '2nd span element index'
      );
      assert.strictEqual(
        nw.solveNth(s1, true, state, true),
        2,
        '2nd span element index from end'
      );
    });

    it('should reuse parent cache for sequential sibling evaluation', () => {
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

    it('should create new cache entry when parent container changes', () => {
      const p1 = document.getElementById('p1');
      const subDiv = document.createElement('div');
      subDiv.innerHTML = '<b id="b1"></b>';
      container.appendChild(subDiv);
      const b1 = document.getElementById('b1');
      nw.solveNth(p1, false, state, false); // context of 'container'
      assert.strictEqual(
        state.parents.length,
        1,
        'initial parent count registered'
      );
      nw.solveNth(b1, false, state, false); // context of 'subDiv'
      assert.strictEqual(
        state.parents.length,
        2,
        'Should register a new parent element'
      );
    });

    it('should calculate index via loop search for non-boundary node', () => {
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

    it('should retrieve cached length when re-visiting parent node', () => {
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
      assert.strictEqual(state.len, 2, 'first container length cached');
      nw.solveNth(c2s1, false, state, false);
      assert.strictEqual(state.len, 1, 'second container length cached');
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

    it('should retrieve cached type length for known parent element', () => {
      container.innerHTML = '<p id="type-p1"></p><p id="type-p2"></p>';
      const p1 = document.getElementById('type-p1');
      const p2 = document.getElementById('type-p2');
      nw.solveNth(p1, false, state, true);
      const other = document.createElement('div');
      other.innerHTML = '<b></b>';
      nw.solveNth(other.firstChild, false, state, true);
      const result = nw.solveNth(p2, false, state, true);
      assert.strictEqual(result, 2, 'cached type index result');
      assert.strictEqual(
        state.len,
        2,
        'Should hit the type-specific length cache'
      );
    });

    it('should locate parent via reverse cache search for multi-parent', () => {
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

    it('should traverse from firstElementChild when parent is defined', () => {
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

    it('should fallback to single element when parent is null or unset', () => {
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
      it('should retrieve element nodes by id using byId fast path', () => {
        const res = api.byId('ul1', document);
        assert.strictEqual(res.length, 1, 'found single node by id');
        assert.strictEqual(res[0].id, 'ul1', 'element id matches');
      });

      it('should retrieve element nodes by tag using byTag fast path', () => {
        const res = api.byTag('li', document);
        assert.strictEqual(res.length, 3, 'found three nodes by tag');
        assert.strictEqual(res[0].id, 'li1', 'first element id matches');
      });

      it('should retrieve elements by class name via byClass fast path', () => {
        const res = api.byClass('item', document);
        assert.strictEqual(res.length, 2, 'found two nodes by class');
        assert.strictEqual(res[0].id, 'li1', 'first element id matches');
        assert.strictEqual(res[1].id, 'li2', 'second element id matches');
      });

      it('should return empty array when context lacks class lookup', () => {
        const mockContext = {
          localName: 'div',
          id: 'dummy'
        };
        const res = api.byClass('item', mockContext);
        assert.ok(Array.isArray(res), 'Result should be an array');
        assert.strictEqual(res.length, 0, 'Should return an empty array');
      });
    });

    describe('DOM Matchers & Selectors', () => {
      it('should sort results in document order and remove duplicates', () => {
        const ul = document.getElementById('ul1');
        const res = api.select('.empty, .li', ul);
        assert.strictEqual(res.length, 3, 'sorted nodes count');
        assert.strictEqual(res[0].id, 'li1', 'first element in order');
        assert.strictEqual(res[1].id, 'li2', 'second element in order');
        assert.strictEqual(res[2].id, 'li3', 'third element in order');
      });

      it('should evaluate selector against element and return boolean', () => {
        const li1 = document.getElementById('li1');
        assert.strictEqual(api.match('.li', li1), true, 'matches class');
        assert.strictEqual(
          api.match('.empty', li1),
          false,
          'does not match absent class'
        );
        assert.strictEqual(
          api.match('#ul1 > li.item', li1),
          true,
          'matches child combinator'
        );
      });

      it('should execute callback when match succeeds on target node', () => {
        const li1 = document.getElementById('li1');
        let called = false;
        api.match('.li', li1, () => {
          called = true;
        });
        assert.strictEqual(called, true, 'callback executed on match');
      });

      it('should evaluate :target pseudo-class against document URL', () => {
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
        assert.strictEqual(targetNodes.length, 1, 'target nodes count');
        assert.strictEqual(targetNodes[0].id, 'div0', 'matched target node id');
      });

      it('should find nearest matching ancestor element via closest()', () => {
        const span1 = document.getElementById('span1');
        const dl1 = document.getElementById('dl1');
        assert.deepEqual(api.closest('dl', span1), dl1, 'closest dl element');
        assert.deepEqual(
          api.closest('#div0', span1),
          null,
          'returns null when no ancestor matches'
        );
      });

      it('should collect all matching descendant elements via select()', () => {
        const ul = document.getElementById('ul1');
        const res = api.select('.li', ul);
        assert.strictEqual(res.length, 3, 'selected nodes count');
        assert.strictEqual(res[0].id, 'li1', 'first selected node id');
        assert.strictEqual(res[2].id, 'li3', 'last selected node id');
      });

      it('should collect elements matching structural pseudo-class', () => {
        const div1 = document.getElementById('div1');
        const res = api.select('li:last-child', div1);
        assert.strictEqual(res.length, 1, 'selected last-child count');
        assert.strictEqual(res[0].id, 'li3', 'matched last-child id');
      });

      it('should return cached results for identical single selector', () => {
        const ul = document.getElementById('ul1');
        const res1 = api.select('.li', ul);
        const res2 = api.select('.li', ul);
        assert.strictEqual(res2.length, 3, 'cached result count');
        assert.deepEqual(res1, res2, 'returns identical cached array');
      });

      it('should execute callback using cached single selector query', () => {
        const ul = document.getElementById('ul1');
        const cb = () => {};
        api.select('.empty', ul, cb);
        const res2 = api.select('.empty', ul, cb);
        assert.strictEqual(res2.length, 1, 'cached result count with callback');
        assert.strictEqual(res2[0].id, 'li3', 'matched element id');
      });

      it('should deduplicate cached node list for multiple selectors', () => {
        const ul = document.getElementById('ul1');
        const res1 = api.select('.li, .item', ul);
        const res2 = api.select('.li, .item', ul);
        assert.strictEqual(res2.length, 3, 'cached multi-selector count');
        assert.strictEqual(res2[0].id, 'li1', 'first node id');
        assert.strictEqual(res2[1].id, 'li2', 'second node id');
        assert.strictEqual(res2[2].id, 'li3', 'third node id');
        assert.deepEqual(
          res1,
          res2,
          'returns identical cached multi-selector array'
        );
      });

      it('should execute callback using cached multi-selector query', () => {
        const ul = document.getElementById('ul1');
        const cb = () => {};
        api.select('.li, .item', ul, cb);
        const res2 = api.select('.li, .item', ul, cb);
        assert.strictEqual(
          res2.length,
          3,
          'cached multi-selector count with callback'
        );
      });

      it('should return first matching descendant element via first()', () => {
        const ul = document.getElementById('ul1');
        const res = api.first('.li', ul);
        assert.notStrictEqual(res, null, 'returns non-null node');
        assert.strictEqual(res.id, 'li1', 'first matching element id');
      });

      it('should default search context to document when omitted', () => {
        const res = api.first('#li2');
        assert.notStrictEqual(res, null, 'returns non-null node from document');
        assert.strictEqual(res.id, 'li2', 'matched element id from document');
      });

      it('should return null when first() fails to find matching node', () => {
        const res = api.first('.not-exist', document);
        assert.strictEqual(res, null, 'returns null for unmatched query');
      });

      it('should execute callback and halt traversal on first match', () => {
        const ul = document.getElementById('ul1');
        const foundElements = [];
        const res = api.first('.li', ul, el => {
          foundElements.push(el);
        });
        assert.notStrictEqual(res, null, 'returns non-null first match');
        assert.strictEqual(res.id, 'li1', 'matched node id');
        assert.strictEqual(foundElements.length, 1, 'callback execution count');
        assert.strictEqual(foundElements[0].id, 'li1', 'callback element id');
      });

      it('should throw DOMException when calling first() with empty', () => {
        assert.throws(
          () => api.first('', document),
          err =>
            err.name === 'SyntaxError' || err instanceof window.DOMException,
          'Empty selector should throw a SyntaxError'
        );
      });

      it('should evaluate :nth-child(n) to select all child nodes', () => {
        const ul = document.getElementById('ul1');
        const res = api.select('li:nth-child(n)', ul);
        assert.strictEqual(res.length, 3, 'all nth-child match count');
        assert.strictEqual(res[0].id, 'li1', '1st child id');
        assert.strictEqual(res[1].id, 'li2', '2nd child id');
        assert.strictEqual(res[2].id, 'li3', '3rd child id');
      });

      it('should evaluate :nth-child(1) to select first child node', () => {
        const ul = document.getElementById('ul1');
        const res1 = api.select('li:nth-child(1)', ul);
        assert.strictEqual(res1.length, 1, '1st nth-child count');
        assert.strictEqual(res1[0].id, 'li1', '1st nth-child id');
        const res2 = api.select('li:nth-last-child(1)', ul);
        assert.strictEqual(res2.length, 1, '1st nth-last-child count');
        assert.strictEqual(res2[0].id, 'li3', '1st nth-last-child id');
        const res3 = api.select('li:nth-of-type(1)', ul);
        assert.strictEqual(res3.length, 1, '1st nth-of-type count');
        assert.strictEqual(res3[0].id, 'li1', '1st nth-of-type id');
        const res4 = api.select('li:nth-last-of-type(1)', ul);
        assert.strictEqual(res4.length, 1, '1st nth-last-of-type count');
        assert.strictEqual(res4[0].id, 'li3', '1st nth-last-of-type id');
      });

      it('should evaluate :nth-child with zero step formula 0n+b', () => {
        const ul = document.getElementById('ul1');
        const res1 = api.select('li:nth-child(0n+2)', ul);
        assert.strictEqual(res1.length, 1, '0n+2 match count');
        assert.strictEqual(res1[0].id, 'li2', '0n+2 matched id');
        const res2 = api.select('li:nth-child(0)', ul);
        assert.strictEqual(res2.length, 0, 'nth-child(0) match count');
      });

      it('should match elements satisfying :only-of-type selector', () => {
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

      it('should match and select elements using :has() pseudo-class', () => {
        const ul = document.getElementById('ul1');
        const res1 = api.select('ul:has(.empty)', document);
        assert.strictEqual(res1.length, 1, 'ul:has(.empty) count');
        assert.strictEqual(res1[0].id, 'ul1', 'ul:has(.empty) id');
        const res2 = api.select('li:has(span)', document);
        assert.strictEqual(res2.length, 0, 'li:has(span) count');
        assert.strictEqual(
          api.match('ul:has(.item)', ul),
          true,
          'ul:has(.item) match boolean'
        );
        const res3 = api.select('ul:has([class="li item"])', document);
        assert.strictEqual(res3.length, 1, 'ul:has([class=...]) count');
        assert.strictEqual(res3[0].id, 'ul1', 'ul:has([class=...]) id');
      });

      it('should match last element of type using :last-of-type', () => {
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
        assert.strictEqual(resLi[0].id, 'li3', 'matched last-of-type li id');
        const resSpan = api.select('span:last-of-type', ul);
        assert.strictEqual(
          resSpan.length,
          1,
          'Should match the last span element'
        );
        assert.strictEqual(
          resSpan[0].id,
          'span-last',
          'matched last-of-type span id'
        );
        ul.removeChild(span1);
        ul.removeChild(span2);
      });

      it('should match first element of type using :first-of-type', () => {
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
        assert.strictEqual(resLi[0].id, 'li1', 'matched first-of-type li id');
        const resSpan = api.select('span:first-of-type', ul);
        assert.strictEqual(
          resSpan.length,
          1,
          'Should match the first span element'
        );
        assert.strictEqual(
          resSpan[0].id,
          'span-first',
          'matched first-of-type span id'
        );
        ul.removeChild(span1);
      });

      it('should match and select elements using :first-child pseudo', () => {
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

      it('should evaluate :read-only and :read-write on form elements', () => {
        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        assert.strictEqual(
          api.match(':read-write', textarea),
          true,
          'Normal textarea is read-write'
        );
        assert.strictEqual(
          api.match(':read-only', textarea),
          false,
          'Normal textarea is not read-only'
        );
        textarea.readOnly = true;
        assert.strictEqual(
          api.match(':read-only', textarea),
          true,
          'Readonly textarea is read-only'
        );
        assert.strictEqual(
          api.match(':read-write', textarea),
          false,
          'Readonly textarea is not read-write'
        );
        textarea.readOnly = false;
        textarea.disabled = true;
        assert.strictEqual(
          api.match(':read-only', textarea),
          true,
          'Disabled textarea is read-only'
        );
        const inputText = document.createElement('input');
        inputText.type = 'text';
        document.body.appendChild(inputText);
        assert.strictEqual(
          api.match(':read-write', inputText),
          true,
          'Normal text input is read-write'
        );
        inputText.readOnly = true;
        assert.strictEqual(
          api.match(':read-only', inputText),
          true,
          'Readonly text input is read-only'
        );
        const inputCheckbox = document.createElement('input');
        inputCheckbox.type = 'checkbox';
        document.body.appendChild(inputCheckbox);
        assert.strictEqual(
          api.match(':read-only', inputCheckbox),
          true,
          'Checkbox is always read-only'
        );
        assert.strictEqual(
          api.match(':read-write', inputCheckbox),
          false,
          'Checkbox is never read-write'
        );
        const div = document.createElement('div');
        document.body.appendChild(div);
        assert.strictEqual(
          api.match(':read-only', div),
          true,
          'Normal div is read-only'
        );
        assert.strictEqual(
          api.match(':read-write', div),
          false,
          'Normal div is not read-write'
        );
        div.setAttribute('contenteditable', 'true');
        assert.strictEqual(
          api.match(':read-write', div),
          true,
          'Contenteditable div is read-write'
        );
        assert.strictEqual(
          api.match(':read-only', div),
          false,
          'Contenteditable div is not read-only'
        );
        document.body.removeChild(textarea);
        document.body.removeChild(inputText);
        document.body.removeChild(inputCheckbox);
        document.body.removeChild(div);
      });
    });

    describe('Error Handling', () => {
      it('should throw DOMException for invalid selector start char', () => {
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

      it('should throw DOMException for empty nth pseudo formula', () => {
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

      it('should throw TypeError when match() argument is undefined', () => {
        assert.throws(
          () => api.match(),
          err =>
            err instanceof window.TypeError &&
            err.message === 'Not enough arguments',
          'Undefined selectors should throw a TypeError'
        );
      });

      it('should throw DOMException for empty string in match()', () => {
        const li1 = document.getElementById('li1');
        assert.throws(
          () => api.match('', li1),
          err =>
            err.name === 'SyntaxError' || err instanceof window.DOMException,
          'Empty string should throw a SyntaxError'
        );
      });

      it('should throw TypeError when select() argument is undefined', () => {
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

      it('should throw DOMException for empty string in select()', () => {
        assert.throws(
          () => api.select('', document),
          err =>
            err.name === 'SyntaxError' || err instanceof window.DOMException,
          'Empty string should throw a SyntaxError'
        );
      });

      it('should throw DOMException for unknown pseudo-class query', () => {
        assert.throws(
          () => api.select(':invalid-pseudo'),
          err =>
            err.name === 'SyntaxError' || err instanceof window.DOMException,
          'Unknown pseudo-class should throw a SyntaxError'
        );
      });

      it('should throw DOMException for selector with trailing comma', () => {
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
      it('should handle empty string value with word matcher ~=', () => {
        const div = document.createElement('div');
        div.setAttribute('data-test', ' ');
        const res = api.match('[data-test~=""]', div);
        assert.strictEqual(typeof res, 'boolean', 'returns boolean result');
      });

      it('should convert non-string selector inputs via toString()', () => {
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

      it('should compile step comparison when multiplier |a| > 1', () => {
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
        assert.strictEqual(resPositive[0].id, 'li-1', '1st match id');
        assert.strictEqual(resPositive[1].id, 'li-4', '2nd match id');
        const resNegative = api.select('li:nth-child(-2n+5)', ul);
        assert.strictEqual(
          resNegative.length,
          3,
          'Should match 5th, 3rd, and 1st'
        );
        assert.strictEqual(resNegative[0].id, 'li-1', '1st negative match id');
        assert.strictEqual(resNegative[1].id, 'li-3', '2nd negative match id');
        assert.strictEqual(resNegative[2].id, 'li-5', '3rd negative match id');
      });

      it('should configure forward traversal for :nth-child selector', () => {
        const ul = document.getElementById('ul1');
        const res = api.select('li:nth-child(1)', ul);
        assert.strictEqual(res.length, 1, 'match count');
        assert.strictEqual(
          res[0].id,
          'li1',
          'Should match the first element from the start'
        );
      });

      it('should configure reverse traversal for :nth-last-child', () => {
        const ul = document.getElementById('ul1');
        const res = api.select('li:nth-last-child(1)', ul);
        assert.strictEqual(res.length, 1, 'match count');
        assert.strictEqual(
          res[0].id,
          'li3',
          'Should match the first element from the end'
        );
      });

      it('should configure forward traversal for :nth-of-type', () => {
        const ul = document.getElementById('ul1');
        const res = api.select('li:nth-of-type(2)', ul);
        assert.strictEqual(res.length, 1, 'match count');
        assert.strictEqual(
          res[0].id,
          'li2',
          'Should match the second LI element'
        );
      });

      it('should configure reverse traversal for :nth-last-of-type', () => {
        const ul = document.getElementById('ul1');
        const res = api.select('li:nth-last-of-type(2)', ul);
        assert.strictEqual(res.length, 1, 'match count');
        assert.strictEqual(
          res[0].id,
          'li2',
          'Should match the second LI element from the end'
        );
      });

      it('should apply negative offset check for positive b term', () => {
        const ul = document.getElementById('ul1');
        ul.innerHTML = `
        <li id="li-1">1</li>
        <li id="li-2">2</li>
        <li id="li-3">3</li>
        <li id="li-4">4</li>
      `;
        const res = api.select('li:nth-child(3n+1)', ul);
        assert.strictEqual(res.length, 2, 'match count');
        assert.strictEqual(res[0].id, 'li-1', '1st match id');
        assert.strictEqual(res[1].id, 'li-4', '2nd match id');
      });

      it('should apply positive offset check for negative b term', () => {
        const ul = document.getElementById('ul1');
        ul.innerHTML = `
        <li id="li-1">1</li>
        <li id="li-2">2</li>
        <li id="li-3">3</li>
        <li id="li-4">4</li>
      `;
        const res = api.select('li:nth-child(3n-1)', ul);
        assert.strictEqual(res.length, 1, 'match count');
        assert.strictEqual(res[0].id, 'li-2', 'matched id');
      });

      it('should normalize uppercase pseudo-class name to lowercase', () => {
        const ul = document.getElementById('ul1');
        const res = api.select('li:NTH-CHILD(1)', ul);
        assert.strictEqual(res.length, 1, 'match count');
        assert.strictEqual(res[0].id, 'li1', 'matched id');
      });

      it('should throw DOMException when pseudo-class name is missing', () => {
        const invalidSelector = ':nth-child()';
        assert.throws(
          () => api.select(invalidSelector, document),
          err => {
            return (
              err.name === 'SyntaxError' || err instanceof window.DOMException
            );
          },
          'Should throw SyntaxError when pseudo-class name is missing'
        );
      });

      it('should match attribute without explicit namespace prefix', () => {
        const div = document.createElement('div');
        div.setAttribute('testattr', 'value');
        assert.ok(
          api.match('[testattr="value"]', div),
          'Should match attribute without namespace'
        );
      });

      it('should match attribute containing namespace prefix name', () => {
        const div = document.createElement('div');
        div.setAttribute('xlink:href', 'https://example.com');
        assert.ok(
          api.match('[xlink:href]', div),
          'Should match attribute with namespace prefix'
        );
      });

      it('should evaluate word matcher ~= to false for spaced values', () => {
        const div = document.createElement('div');
        div.setAttribute('data-test', 'foo bar');
        const res = api.match('[data-test~="foo bar"]', div);
        assert.strictEqual(
          res,
          false,
          'Should return false when ~= search value contains spaces'
        );
      });

      it('should cache and reuse compiled selector lambda functions', () => {
        const selector = '.test-cache-selector';
        const selectLambda1 = api.compile(selector, true);
        const selectLambda2 = api.compile(selector, true);
        assert.strictEqual(
          selectLambda1,
          selectLambda2,
          'Should return the exact same cached lambda object for select mode'
        );
        const matchLambda1 = api.compile(selector, false);
        const matchLambda2 = api.compile(selector, false);
        assert.strictEqual(
          matchLambda1,
          matchLambda2,
          'Should return the exact same cached lambda object for match mode'
        );
        assert.notStrictEqual(
          selectLambda1,
          matchLambda1,
          'Select mode and match mode should maintain separate caches'
        );
      });

      it('should safely fallback on invalid logical pseudo arguments', () => {
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

      it('should evaluate all attribute presence and value matchers', () => {
        const div = document.createElement('div');
        document.body.appendChild(div);
        div.setAttribute('data-present', 'any-value');
        assert.strictEqual(
          api.match('[data-present]', div),
          true,
          'Route 1: hasAttribute match'
        );
        assert.strictEqual(
          api.match('[data-absent]', div),
          false,
          'Route 1: hasAttribute unmatch'
        );
        div.setAttribute('data-empty', '');
        assert.strictEqual(
          api.match('[data-empty=""]', div),
          true,
          'Route 2: exact empty string match'
        );
        assert.strictEqual(
          api.match('[data-present=""]', div),
          false,
          'Route 2: should fail if attribute is not empty'
        );
        div.setAttribute('data-match', 'hello-world');
        assert.strictEqual(
          api.match('[data-match="hello-world"]', div),
          true,
          'Route 3: standard exact match'
        );
        assert.strictEqual(
          api.match('[data-match^="hello"]', div),
          true,
          'Route 3: standard prefix match'
        );
        assert.strictEqual(
          api.match('[data-match$="world"]', div),
          true,
          'Route 3: standard suffix match'
        );
        document.body.removeChild(div);
      });
    });

    describe('Internal Compiler Fallbacks', () => {
      it('should fallback byTag() to handle wildcard and specific tags', () => {
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
        const resWildcard = api.byTag('*', mockContext);
        assert.strictEqual(resWildcard.length, 2, 'Wildcard matches all tags');
        const resDiv = api.byTag('DIV', mockContext);
        assert.strictEqual(resDiv.length, 1, 'Specific tag matches div');
        assert.strictEqual(resDiv[0].localName, 'div', 'matched tag name');
      });

      it('should iterate child nodes during byTag() fallback lookup', () => {
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
        const resSpan = api.byTag('span', mockContext);
        assert.strictEqual(
          resSpan.length,
          2,
          'Should collect elements from children'
        );
        assert.strictEqual(resSpan[0].localName, 'span', 'first span tag');
        assert.strictEqual(resSpan[1].localName, 'span', 'second span tag');
        const resWildcard = api.byTag('*', mockContext);
        assert.strictEqual(
          resWildcard.length,
          3,
          'Should collect context element and its children'
        );
        assert.strictEqual(
          resWildcard[0].localName,
          'div',
          'first element tag'
        );
        assert.strictEqual(
          resWildcard[1].localName,
          'span',
          'second element tag'
        );
        assert.strictEqual(
          resWildcard[2].localName,
          'span',
          'third element tag'
        );
      });

      it('should throw DOMException for unexpected selector syntax', () => {
        const mockSource = 'r=true;';
        assert.throws(
          () => api.compileSelector('!invalid', mockSource, false),
          err => {
            return (
              (err.name === 'SyntaxError' ||
                err instanceof window.DOMException) &&
              err.message.includes('is not a valid selector')
            );
          },
          'Invalid selector should throw SyntaxError'
        );
      });

      it('should return source untouched for unknown structural pseudo', () => {
        const mockMatch = [':unknown', 'unknown'];
        const mockSource = 'console.log("test5");';
        const result = api.compilePseudoStructural(mockMatch, mockSource);
        assert.strictEqual(result, mockSource, 'returns unmodified source');
      });

      it('should return source untouched for unknown logical pseudo', () => {
        const mockMatch = [':unknown(.foo)', 'unknown', '.foo'];
        const mockSource = 'console.log("test4");';
        const result = api.compilePseudoLogical(mockMatch, mockSource);
        assert.strictEqual(result, mockSource, 'returns unmodified source');
      });

      it('should return source untouched for unknown location pseudo', () => {
        const mockMatch = [':unknown', 'unknown'];
        const mockSource = 'console.log("test3");';
        const result = api.compilePseudoLocation(mockMatch, mockSource);
        assert.strictEqual(result, mockSource, 'returns unmodified source');
      });

      it('should return source untouched for unknown state pseudo', () => {
        const mockMatch = [':unknown', 'unknown'];
        const mockSource = 'console.log("test2");';
        const result = api.compilePseudoInputState(mockMatch, mockSource);
        assert.strictEqual(result, mockSource, 'returns unmodified source');
      });

      it('should return source untouched for unknown value pseudo', () => {
        const mockMatch = [':unknown', 'unknown'];
        const mockSource = 'console.log("test");';
        const result = api.compilePseudoInputValue(mockMatch, mockSource);
        assert.strictEqual(result, mockSource, 'returns unmodified source');
      });

      it('should parse uppercase tree structural pseudo to lowercase', () => {
        const ul = document.getElementById('ul1');
        const res = api.select('li:NTH-CHILD(1)', ul);
        assert.strictEqual(res.length, 1, 'match count');
        assert.strictEqual(res[0].id, 'li1', 'matched element id');
      });

      it('should throw DOMException when tree pseudo name is missing', () => {
        assert.throws(
          () => api.select('li:(1)', document),
          err =>
            err.name === 'SyntaxError' || err instanceof window.DOMException,
          'Missing pseudo name should throw SyntaxError'
        );
      });
    });

    describe('compilePseudoTreeStruct() internal direct calls', () => {
      it('should throw DOMException for undefined tree pseudo name', () => {
        const api = new nw.Nwsapi(window, document);
        const mockMatch = [':(even)', undefined, 'even'];
        const mockSource = 'r=true;';
        const selectorString = ':(even)';
        assert.throws(
          () =>
            api.compilePseudoTreeStruct(mockMatch, mockSource, selectorString),
          err => {
            return (
              (err.name === 'SyntaxError' ||
                err instanceof window.DOMException) &&
              err.message.includes(selectorString)
            );
          },
          'Undefined formula should throw SyntaxError'
        );
      });

      it('should throw DOMException for missing tree pseudo formula', () => {
        const api = new nw.Nwsapi(window, document);
        const mockMatch = [':nth-child()', 'nth-child', undefined];
        const mockSource = 'r=true;';
        assert.throws(
          () =>
            api.compilePseudoTreeStruct(mockMatch, mockSource, ':nth-child()'),
          err =>
            err.name === 'SyntaxError' || err instanceof window.DOMException,
          'Missing formula should throw SyntaxError'
        );
      });
    });
  });
});
