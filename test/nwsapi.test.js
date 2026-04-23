/**
 * nwsapi.test.js
 */

/* api */
import { strict as assert } from 'node:assert';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, it } from 'mocha';

/* test */
import { initNwsapi, nwsapi, solveNth } from '../src/js/nwsapi.js';

/* constants */
import { SYNTAX_ERR } from '../src/js/constant.js';

describe('nwsapi (Fast-Path Edition)', () => {
  const domStr = `<!doctype html>
    <html lang="en">
      <head>
      </head>
      <body>
        <div id="div0">
        </div>
        <div id="div1">
          <div id="div2">
            <ul id="ul1">
              <li id="li1" class="li item">foo</li>
              <li id="li2" class="li item checked">bar</li>
              <li id="li3" class="li item empty-node"></li>
            </ul>
          </div>
          <div id="div3">
            <dl id="dl1">
              <dt id="dt1"></dt>
              <dd id="dd1" class="dd">
                <span id="span1" hidden></span>
              </dd>
              <dt id="dt2"></dt>
              <dd id="dd2" class="dd">
                <span id="span2"></span>
              </dd>
            </dl>
          </div>
          <div id="div4">
            <form id="form1">
              <input type="text" id="input1" value="foo" readonly>
              <input type="checkbox" id="check1" checked>
              <input type="radio" id="radio1" class="radio-btn">
            </form>
          </div>
        </div>
      </body>
    </html>`;

  const domOpt = {
    runScripts: 'dangerously',
    url: 'http://localhost/#foo'
  };

  let window, document, nw;

  beforeEach(() => {
    const dom = new JSDOM(domStr, domOpt);
    window = dom.window;
    document = dom.window.document;

    // Create an isolated instance of the fast-path nwsapi for each test
    nw = nwsapi(window);
  });

  afterEach(() => {
    window.close();
    window = null;
    document = null;
    nw = null;
  });

  describe('Initialization and Configuration', () => {
    it('should create an isolated instance', () => {
      assert.strictEqual(typeof nw.match, 'function', 'match is a function');
      assert.strictEqual(
        typeof nw.closest,
        'function',
        'closest is a function'
      );
      assert.strictEqual(typeof nw.first, 'function', 'first is a function');
      assert.strictEqual(typeof nw.select, 'function', 'select is a function');
      assert.strictEqual(
        typeof nw.configure,
        'function',
        'configure is a function'
      );
    });

    it('should clear caches when configure is called with true', () => {
      // Warm up cache
      nw.select('.li', document);
      // Reconfigure and clear
      const res = nw.configure({ VERBOSITY: true }, true);
      assert.strictEqual(res, true, 'configure returns true');
    });
  });

  describe('isIndeterminate coverage for checkbox and progress', () => {
    let window, document, nw;

    beforeEach(() => {
      const dom = new JSDOM(
        '<!doctype html><html><body><div id="container"></div></body></html>'
      );
      window = dom.window;
      document = dom.window.document;
      nw = nwsapi(window);
    });

    it('should return true for checkbox with indeterminate property set to true', () => {
      const container = document.getElementById('container');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.id = 'cb1';
      container.appendChild(cb);

      cb.indeterminate = true;

      assert.strictEqual(
        nw.match(':indeterminate', cb),
        true,
        'Checkbox with property indeterminate=true matches'
      );

      cb.indeterminate = false;
      assert.strictEqual(
        nw.match(':indeterminate', cb),
        false,
        'Checkbox with property indeterminate=false does not match'
      );
    });

    it('should return true for progress element without value attribute', () => {
      const container = document.getElementById('container');
      const progress = document.createElement('progress');
      progress.id = 'prog1';
      container.appendChild(progress);

      assert.strictEqual(
        nw.match(':indeterminate', progress),
        true,
        'Progress without value matches'
      );

      progress.setAttribute('value', '50');
      assert.strictEqual(
        nw.match(':indeterminate', progress),
        false,
        'Progress with value does not match'
      );
    });
  });

  describe('isIndeterminate coverage for form traversal', () => {
    let window, document, nw;

    beforeEach(() => {
      const domStr = `
      <!doctype html>
      <html>
        <body>
          <form id="testForm">
            <div>
              <input type="radio" name="group1" id="radio1">
              <input type="radio" name="group1" id="radio2">
            </div>
          </form>
        </body>
      </html>`;
      const dom = new JSDOM(domStr);
      window = dom.window;
      document = dom.window.document;
      nw = nwsapi(window);
    });

    it('should break the parent loop when a form element is encountered', () => {
      const radio1 = document.getElementById('radio1');
      const radio2 = document.getElementById('radio2');

      assert.strictEqual(
        nw.match(':indeterminate', radio1),
        true,
        'Should be indeterminate initially'
      );

      radio2.checked = true;

      assert.strictEqual(
        nw.match(':indeterminate', radio1),
        false,
        'Should not be indeterminate when a sibling is checked'
      );
    });
  });

  describe('makeref coverage for Document node', () => {
    let window, document, nw;

    beforeEach(() => {
      const dom = new JSDOM(
        '<!doctype html><html id="rootId" class="rootClass" lang="en"><body></body></html>'
      );
      window = dom.window;
      document = dom.window.document;
      nw = nwsapi(window);
    });

    it('should handle Document node (nodeType 9) by using documentElement', () => {
      const res = nw.select(':scope > body', document);

      assert.strictEqual(
        res.length,
        1,
        'Should find body via scoped selection from document'
      );
      assert.strictEqual(res[0], document.body);
    });

    it('should correctly transform :scope when context is document', () => {
      const isMatched = nw.match(':scope', document.documentElement);

      assert.strictEqual(
        isMatched,
        true,
        'Should match documentElement when scope is document'
      );
    });
  });

  describe('solveNth() logic', () => {
    let document, state;

    beforeEach(() => {
      const dom = new JSDOM(
        '<!doctype html><html><body><div id="parent1"><span id="s1"></span><span id="s2"></span></div><div id="parent2"><p id="p1"></p><span id="s3"></span></div></body></html>'
      );
      document = dom.window.document;

      state = {
        idx: 0,
        len: 0,
        set: 0,
        nodes: [],
        parents: [],
        parent: undefined
      };
    });

    it('should reset state when dir is 2', () => {
      state.idx = 5;
      state.nodes = [{}];

      const result = solveNth(null, 2, state, false);

      assert.strictEqual(result, -1);
      assert.strictEqual(state.idx, 0);
      assert.strictEqual(state.nodes.length, 0);
      assert.strictEqual(state.parent, undefined);
    });

    it('should handle parent cache miss and populate nodes (isOfType: false)', () => {
      const s1 = document.getElementById('s1');
      const s2 = document.getElementById('s2');

      const index = solveNth(s2, false, state, false);

      assert.strictEqual(index, 2, 's2 should be index 2');
      assert.strictEqual(state.parents[0], s1.parentElement);
      assert.strictEqual(state.nodes[0].length, 2);
      assert.strictEqual(state.nodes[0][1], s2);
    });

    it('should filter by type and namespace when isOfType is true', () => {
      const s3 = document.getElementById('s3');
      const index = solveNth(s3, false, state, true);

      assert.strictEqual(index, 1, 's3 is the 1st of its type (span)');
      assert.ok(state.nodes[0]['span'], 'Cache should contain span array');
      assert.strictEqual(state.nodes[0]['span'][0], s3);
    });

    it('should hit parent cache when switching back to a known parent', () => {
      const s1 = document.getElementById('s1');
      const s3 = document.getElementById('s3');

      solveNth(s1, false, state, false);
      solveNth(s3, false, state, false);

      const index = solveNth(s1, false, state, false);

      assert.strictEqual(index, 1);
      assert.strictEqual(state.set, 0, 'Should return to the first cached set');
    });

    it('should use bidirectional search to find element index in currentNodes', () => {
      const parent = document.getElementById('parent1');
      for (let i = 0; i < 10; i++) {
        const b = document.createElement('b');
        b.id = 'b' + i;
        parent.appendChild(b);
      }
      const lastB = document.getElementById('b9');

      solveNth(document.getElementById('s1'), false, state, false);

      const index = solveNth(lastB, false, state, false);

      assert.strictEqual(index, 12, '2 spans + 10 b tags = 12');
      assert.strictEqual(state.idx, 12);
    });

    it('should return length if l < 2 (optimization path)', () => {
      const loneParent = document.createElement('div');
      const child = document.createElement('div');
      loneParent.appendChild(child);

      const index = solveNth(child, false, state, false);
      assert.strictEqual(index, 1, 'Directly return l when only one child');
    });

    it('should handle non-HTML namespace reset in solveNth', () => {
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      const rect = document.createElementNS(svgNS, 'rect');
      svg.appendChild(rect);

      state.idx = 10;

      const index = solveNth(rect, false, state, true);

      assert.strictEqual(index, 1);
      assert.strictEqual(state.parents.length, 1);
    });

    it('should hit the reverse parent cache search (k-index match)', () => {
      const containerA = document.createElement('div');
      const containerB = document.createElement('div');
      const containerC = document.createElement('div');

      [containerA, containerB, containerC].forEach((el, i) => {
        el.id = 'parent-' + i;
        el.innerHTML = `<span>child-${i}</span>`;
        document.body.appendChild(el);
      });

      const childA = containerA.firstChild;
      const childB = containerB.firstChild;
      const childC = containerC.firstChild;

      solveNth(childA, false, state, false);
      solveNth(childB, false, state, false);
      solveNth(childC, false, state, false);

      solveNth(childA, false, state, false);

      const index = solveNth(childC, false, state, false);

      assert.strictEqual(index, 1, 'Should find childC index');
      assert.strictEqual(
        state.set,
        2,
        'Should have matched the 3rd parent in the cache via k-index'
      );

      [containerA, containerB, containerC].forEach(el => el.remove());
    });
    describe('byTag() fallback for DocumentFragment', () => {
      it('should handle empty DocumentFragment', () => {
        const frag = document.createDocumentFragment();

        const res = nw.select('div', frag);
        assert.strictEqual(
          res.length,
          0,
          'Should return empty array for empty fragment'
        );
      });

      it('should optimize single child that does not directly match the tag', () => {
        const frag = document.createDocumentFragment();
        const child = document.createElement('section');
        const grandchild = document.createElement('div');
        child.appendChild(grandchild);
        frag.appendChild(child);

        const res = nw.select('div', frag);
        assert.strictEqual(
          res.length,
          1,
          'Should optimize single-child traversal'
        );
        assert.strictEqual(res[0], grandchild);
      });

      it('should iterate over multiple children using do-while loop', () => {
        const frag = document.createDocumentFragment();
        const child1 = document.createElement('div');
        const child2 = document.createElement('section');
        const grandchild = document.createElement('div');
        child2.appendChild(grandchild);
        frag.appendChild(child1);
        frag.appendChild(child2);

        const res = nw.select('div', frag);
        assert.strictEqual(
          res.length,
          2,
          'Should collect elements across multiple children'
        );
        assert.strictEqual(res[0], child1);
        assert.strictEqual(res[1], grandchild);
      });

      it('should use loop for universal selector (*) even on single child', () => {
        const frag = document.createDocumentFragment();
        const child = document.createElement('span');
        frag.appendChild(child);

        const res = nw.select('*', frag);
        assert.strictEqual(
          res.length,
          1,
          'Should correctly collect single child for universal selector'
        );
        assert.strictEqual(res[0], child);
      });
    });
  });

  describe('nthOfType caching and edge cases', () => {
    it('should handle non-HTML namespaces (e.g., SVG)', () => {
      const container = document.getElementById('div0');
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      container.appendChild(svg);

      const res = nw.select('svg:nth-of-type(1)', container);
      assert.strictEqual(res.length, 1, 'Should match SVG element');
      assert.strictEqual(res[0], svg);
    });

    it('should handle optimization for single element of its type', () => {
      const container = document.getElementById('div0');
      const h1 = document.createElement('h1');
      container.appendChild(h1);

      const res = nw.select('h1:nth-of-type(1)', container);
      assert.strictEqual(res.length, 1, 'Should match the only h1 element');
      assert.strictEqual(res[0], h1);
    });

    it('should bidirectionally search parent and element caches', () => {
      const root = document.createElement('div');
      document.body.appendChild(root);

      const list1 = document.createElement('div');
      list1.innerHTML = '<span>1</span><span>2</span><span>3</span>';
      const list2 = document.createElement('div');
      list2.innerHTML = '<span>1</span><span>2</span><span>3</span>';
      const list3 = document.createElement('div');
      list3.innerHTML = '<span>1</span><span>2</span><span>3</span>';

      root.appendChild(list1);
      root.appendChild(list2);
      root.appendChild(list3);

      nw.select('span:nth-of-type(1)', list1);
      nw.select('span:nth-of-type(1)', list2);
      nw.select('span:nth-of-type(1)', list3);

      const res1 = nw.select('span:nth-of-type(3)', list1);
      assert.strictEqual(res1.length, 1);
      assert.strictEqual(res1[0].textContent, '3');

      const res2 = nw.select('span:nth-of-type(2)', list2);
      assert.strictEqual(res2.length, 1);
      assert.strictEqual(res2[0].textContent, '2');

      const res3 = nw.select('span:nth-last-of-type(1)', list2);
      assert.strictEqual(res3.length, 1);
      assert.strictEqual(res3[0].textContent, '3');

      root.remove();
    });

    it('should hit the reverse element cache loop (k-index match)', () => {
      const root = document.createElement('div');
      document.body.appendChild(root);

      root.innerHTML =
        '<span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>';
      const spans = root.querySelectorAll('span');

      nw.select('span:nth-of-type(1)', root);

      const resEnd = nw.match(':nth-of-type(5)', spans[4]);
      assert.strictEqual(
        resEnd,
        true,
        'Should correctly identify the 5th element from cache'
      );

      const resNearEnd = nw.match(':nth-of-type(4)', spans[3]);
      assert.strictEqual(
        resNearEnd,
        true,
        'Should correctly identify the 4th element from cache'
      );

      root.remove();
    });
  });

  describe('select() (querySelectorAll equivalent)', () => {
    it('should throw a TypeError when selectors argument is undefined', () => {
      assert.throws(
        () => nw.select(undefined, document.body),
        e => {
          assert.strictEqual(
            e.name,
            'TypeError',
            'Should throw TypeError for undefined selectors'
          );
          return true;
        }
      );
    });

    it('should throw an error for empty selector', () => {
      assert.throws(
        () => nw.select('', document),
        e => {
          assert.strictEqual(e.name, 'SyntaxError', 'Should throw SyntaxError');
          return true;
        }
      );
    });

    it('should fast-path ID selectors', () => {
      const res = nw.select('#ul1', document);
      assert.deepEqual(res, [document.getElementById('ul1')], 'matches #ul1');
    });

    it('should fast-path Class selectors', () => {
      const res = nw.select('.li', document);
      assert.deepEqual(
        res,
        [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ],
        'matches .li elements'
      );
    });

    it('should fast-path Tag selectors', () => {
      const res = nw.select('li', document);
      assert.deepEqual(
        res,
        [
          document.getElementById('li1'),
          document.getElementById('li2'),
          document.getElementById('li3')
        ],
        'matches li elements'
      );
    });

    it('should handle complex compound selectors', () => {
      const res = nw.select('ul#ul1 > li.checked', document);
      assert.deepEqual(
        res,
        [document.getElementById('li2')],
        'matches ul#ul1 > li.checked'
      );
    });

    it('should handle pseudo-classes (nth-child)', () => {
      const res = nw.select(
        'li:nth-child(odd)',
        document.getElementById('ul1')
      );
      assert.deepEqual(
        res,
        [document.getElementById('li1'), document.getElementById('li3')],
        'matches odd li elements'
      );
    });

    it('should handle logical pseudo-classes (:not, :is)', () => {
      const res = nw.select('li:not(.checked)', document.getElementById('ul1'));
      assert.deepEqual(
        res,
        [document.getElementById('li1'), document.getElementById('li3')],
        'matches li without .checked'
      );

      const resIs = nw.select(
        ':is(#li1, #li2)',
        document.getElementById('ul1')
      );
      assert.deepEqual(
        resIs,
        [document.getElementById('li1'), document.getElementById('li2')],
        'matches :is(#li1, #li2)'
      );
    });

    it('should handle relational pseudo-class (:has)', () => {
      const res = nw.select('div:has(> ul)', document);
      assert.deepEqual(
        res,
        [document.getElementById('div2')],
        'matches div containing ul'
      );
    });

    it('should handle state pseudo-classes', () => {
      const resChecked = nw.select(
        ':checked',
        document.getElementById('form1')
      );
      assert.deepEqual(
        resChecked,
        [document.getElementById('check1')],
        'matches :checked'
      );

      // Spec Note: Checkboxes and radio buttons are non-editable, thus inherently :read-only
      const resReadOnly = nw.select(
        ':read-only',
        document.getElementById('form1')
      );
      assert.deepEqual(
        resReadOnly,
        [
          document.getElementById('input1'),
          document.getElementById('check1'),
          document.getElementById('radio1')
        ],
        'matches :read-only (inputs without read-write capabilities)'
      );
    });

    it('should handle :only-of-type pseudo-class', () => {
      const container = document.getElementById('div0');

      const onlySpan = document.createElement('span');
      onlySpan.id = 'only-span';
      container.appendChild(onlySpan);

      const res = nw.select('span:only-of-type', container);
      assert.strictEqual(res.length, 1, 'should find the only span');
      assert.strictEqual(res[0].id, 'only-span');

      const ul = document.getElementById('ul1');
      const liRes = nw.select('li:only-of-type', ul);
      assert.strictEqual(liRes.length, 0, 'li is not only-of-type');

      assert.strictEqual(
        nw.match(':only-of-type', onlySpan),
        true,
        'span is only-of-type'
      );
      assert.strictEqual(
        nw.match(':only-of-type', document.getElementById('li1')),
        false,
        'li1 is NOT only-of-type'
      );
    });

    it('should handle comma-separated lists', () => {
      const res = nw.select('#li1, #dt1', document);
      assert.deepEqual(
        res,
        [document.getElementById('li1'), document.getElementById('dt1')],
        'matches #li1 and #dt1 in document order'
      );
    });

    it('should default to document if context is omitted or falsy', () => {
      const expected = document.getElementById('li1');
      assert.deepEqual(
        nw.select('.li')[0],
        expected,
        'matches with omitted context'
      );
      assert.deepEqual(
        nw.select('.li', null)[0],
        expected,
        'matches with null context'
      );
    });

    it('should correctly handle context switching to avoid dirty cache', () => {
      const parent1 = document.getElementById('ul1');
      const parent2 = document.createElement('ul');
      parent2.innerHTML = '<li class="li" id="new-li">new</li>';

      nw.select('.li', parent1); // Set lastContext = parent1
      const res = nw.select('.li', parent2); // Context switch occurs here!

      assert.strictEqual(res.length, 1, 'resolves correctly under new context');
      assert.strictEqual(
        res[0].id,
        'new-li',
        'matches correct node in new context'
      );
    });

    it('should handle cache hit with and without callback for grouped selectors', () => {
      // Miss (Compilation phase)
      nw.select('ul, .li', document);

      // Hit: without callback
      const resHit = nw.select('ul, .li', document);
      assert.strictEqual(
        resHit.length,
        4,
        'cache hit grouped without callback'
      );

      // Hit: with callback
      let cbCount = 0;
      const resCb = nw.select('ul, .li', document, () => {
        cbCount++;
      });
      assert.strictEqual(
        cbCount,
        4,
        'callback executed exactly 4 times on cache hit'
      );
      assert.strictEqual(
        resCb.length,
        4,
        'cache hit grouped with callback returns array'
      );
    });

    it('should eliminate duplicates in grouped selectors across cache hits', () => {
      // 'div' and '.foo' overlap because div5, div6, div7 are both <div> and have class 'foo'/'baz'
      // nw.select will set `hasDupes = true` internally during documentOrder sorting
      const resMiss = nw.select('div, .foo', document); // Compile
      const resHit = nw.select('div, .foo', document); // Cache Hit -> hits n.length > 1 branch
      const uniqueCount = new Set(resHit).size;
      assert.strictEqual(
        resHit.length,
        uniqueCount,
        'no duplicates exist in the cached grouped selector result'
      );
      assert.deepEqual(
        resMiss,
        resHit,
        'cache hit perfectly matches cache miss result'
      );
    });
    it('should cast non-string selectors to string and evaluate safely', () => {
      // Passing a number. '123' is an invalid CSS selector natively,
      // but testing ensures it hits `selectors = '' + selectors` and throws SyntaxError, not TypeError.
      assert.throws(
        () => nw.select(123, document),
        e => {
          assert.strictEqual(e.name, SYNTAX_ERR, 'name is SyntaxError');
          return true;
        }
      );
    });

    it('should throw SyntaxError for trailing commas in selector list', () => {
      assert.throws(
        () => nw.select('div, ', document),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'is DOMException'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name is SyntaxError');
          assert.ok(
            e.message.includes('is not a valid selector'),
            'message points to invalid selector'
          );
          return true;
        }
      );
    });

    it('should handle :scope pseudo-class by converting it via makeref', () => {
      const parentWithId = document.getElementById('ul1');
      const res1 = nw.select(':scope > li.checked', parentWithId);
      assert.deepEqual(
        res1,
        [document.getElementById('li2')],
        'matches :scope > li.checked'
      );

      const parentWithClass = document.getElementById('dd1');
      const res2 = nw.select(':scope span', parentWithClass);
      assert.deepEqual(
        res2,
        [document.getElementById('span1')],
        'matches :scope span'
      );

      const res3 = nw.select(':ScOpE span', parentWithClass);
      assert.deepEqual(
        res3,
        [document.getElementById('span1')],
        'case-insensitive :scope replace'
      );
    });

    it('should hit the cache and return correct nodes both with and without callback', () => {
      nw.select('.item', document);
      const resNoCb = nw.select('.item', document);
      assert.strictEqual(
        resNoCb.length,
        3,
        'cache hit without callback returns correctly'
      );
      let cbCount = 0;
      const myCb = el => {
        cbCount++;
        return true;
      };
      nw.select('.dd', document, myCb);
      cbCount = 0;
      const resCb = nw.select('.dd', document, myCb);
      assert.strictEqual(
        cbCount,
        2,
        'cache hit with callback executes callback perfectly'
      );
      assert.strictEqual(
        resCb.length,
        2,
        'cache hit with callback returns array correctly'
      );
    });

    it('should handle :link pseudo-class for elements with href attribute', () => {
      const container = document.getElementById('div0');

      const linkA = document.createElement('a');
      linkA.href = 'https://example.com';
      linkA.id = 'valid-link';

      const anchorA = document.createElement('a');
      anchorA.id = 'anchor-only';

      const linkArea = document.createElement('area');
      linkArea.href = '#top';
      linkArea.id = 'valid-area';

      container.append(linkA, anchorA, linkArea);

      const res = nw.select(':link', container);

      assert.strictEqual(res.length, 2, 'should find two links');
      assert.ok(res.includes(linkA), 'includes <a> with href');
      assert.ok(res.includes(linkArea), 'includes <area> with href');
      assert.ok(!res.includes(anchorA), 'does not include <a> without href');

      assert.strictEqual(
        nw.match(':link', linkA),
        true,
        '<a> with href is :link'
      );
      assert.strictEqual(
        nw.match(':link', anchorA),
        false,
        '<a> without href is not :link'
      );
    });

    it('should handle :target pseudo-class based on document URL hash', () => {
      const targetNode = document.createElement('div');
      targetNode.id = 'foo';
      document.getElementById('div0').appendChild(targetNode);

      const res = nw.select(':target', document);
      assert.deepEqual(
        res,
        [targetNode],
        'matches the element with id matching the URL hash'
      );

      assert.strictEqual(
        nw.match(':target', targetNode),
        true,
        'evaluates to true for the target element'
      );
      assert.strictEqual(
        nw.match(':target', document.getElementById('li1')),
        false,
        'evaluates to false for non-target elements'
      );
    });

    describe('Attribute Selector Coverage ([attr])', () => {
      it('should handle namespace-like attributes and basic hasAttribute', () => {
        const container = document.getElementById('div0');
        const target = document.createElement('div');
        target.setAttribute('test:attr', 'val');
        container.appendChild(target);

        const res = nw.select('[test:attr]', container);
        assert.strictEqual(res.length, 1, 'matches attribute with colon');
        assert.strictEqual(res[0], target);
      });

      it('should handle invalid operators', () => {
        assert.throws(
          () => nw.select('[title!!"error"]', document),
          e => e.name === SYNTAX_ERR
        );
      });

      it('should handle empty value attributes', () => {
        const container = document.getElementById('div0');
        const input = document.createElement('input');
        input.setAttribute('value', '');
        container.appendChild(input);

        assert.strictEqual(
          nw.select('[value~=""]', container).length,
          0,
          '~="" never matches'
        );

        const res = nw.select('[value=""]', container);
        assert.strictEqual(
          res.includes(input),
          true,
          'matches empty value attribute'
        );
      });

      it('should handle space in ~= operator (fails early)', () => {
        const res = nw.select('[class~="foo bar"]', document);
        assert.strictEqual(
          res.length,
          0,
          '~= with space never matches anything'
        );
      });

      it('should handle automatic case-insensitivity for standard HTML attributes', () => {
        const container = document.getElementById('div0');

        const input1 = document.createElement('input');
        input1.setAttribute('type', 'TEXT');
        container.appendChild(input1);

        const res1 = nw.select('[type="text"]', container);
        assert.strictEqual(
          res1.length,
          1,
          'Standard HTML attributes like "type" should be case-insensitive automatically'
        );
        assert.strictEqual(res1[0], input1);
      });

      it('should handle explicit "i" flag for case-insensitive attribute matching', () => {
        const container = document.getElementById('div0');

        const div2 = document.createElement('div');
        div2.setAttribute('data-test', 'MIXED');
        container.appendChild(div2);

        const res2 = nw.select('[data-test="mixed" i]', container);
        assert.strictEqual(
          res2.length,
          1,
          'Custom attributes should match case-insensitively with "i" flag'
        );
        assert.strictEqual(res2[0], div2);
      });

      it('should escape special characters in attribute values', () => {
        const container = document.getElementById('div0');
        const div = document.createElement('div');
        div.setAttribute('data-spec', 'foo.bar');
        container.appendChild(div);

        const res = nw.select('[data-spec="foo.bar"]', container);
        assert.strictEqual(res[0], div, 'escapes dots in attribute values');
      });
    });

    describe('Cache Hit Path Coverage for Grouped Selectors', () => {
      it('should bypass sorting when grouped selectors yield 0 or 1 total nodes', () => {
        nw.select('.non-existent1, .non-existent2', document); // Miss
        const res0 = nw.select('.non-existent1, .non-existent2', document);
        assert.deepEqual(res0, [], 'bypasses sort and returns empty');
        nw.select('#li1, .non-existent3', document); // Miss
        const res1 = nw.select('#li1, .non-existent3', document); // Hit
        assert.deepEqual(
          res1,
          [document.getElementById('li1')],
          'bypasses sort and returns 1 node'
        );
      });

      it('should sort but skip unique() if there are multiple nodes with NO duplicates', () => {
        nw.select('#li1, #li2', document); // Miss
        const res = nw.select('#li1, #li2', document); // Hit
        assert.deepEqual(
          res,
          [document.getElementById('li1'), document.getElementById('li2')],
          'sorts normally without duplicate removal'
        );
      });

      it('should trigger hasDupes=true and remove duplicates when exact same nodes exist', () => {
        nw.select('#li1, #li1', document);
        const res = nw.select('#li1, #li1', document);
        assert.deepEqual(
          res,
          [document.getElementById('li1')],
          'triggers a === b in documentOrder and removes duplicates'
        );
      });
    });

    it('should handle pseudo-classes (nth-of-type) and clear cache via compiled loop', () => {
      const res = nw.select(
        'dt:nth-of-type(2)',
        document.getElementById('dl1')
      );

      assert.deepEqual(
        res,
        [document.getElementById('dt2')],
        'matches the second <dt> element uniquely'
      );
    });

    describe('Complex nth-pseudo coverage (An+B logic)', () => {
      it('should handle match[2] === "n" (shortcut for :nth-child(n))', () => {
        const res = nw.select(
          'li:nth-child(n)',
          document.getElementById('ul1')
        );
        assert.strictEqual(res.length, 3, 'matches all li elements');
      });

      it('should handle match[2] === "1" (shortcut for :first-child / :last-child)', () => {
        const res1 = nw.select(
          'li:nth-child(1)',
          document.getElementById('ul1')
        );
        assert.strictEqual(res1[0].id, 'li1', 'matches first-child');

        const res2 = nw.select(
          'dt:nth-last-of-type(1)',
          document.getElementById('dl1')
        );
        assert.strictEqual(
          res2[0].id,
          'dt2',
          'matches last-of-type via nth-last-of-type(1)'
        );
      });

      it('should handle "even" and "odd" keywords', () => {
        const ul = document.getElementById('ul1');
        // even -> n%2===0
        assert.strictEqual(
          nw.select('li:nth-child(even)', ul).length,
          1,
          'even'
        );
        // odd -> n%2===1
        assert.strictEqual(nw.select('li:nth-child(odd)', ul).length, 2, 'odd');
      });

      it('should handle positive a (e.g., 2n+1)', () => {
        const ul = document.getElementById('ul1');
        // a=2, b=1 -> (n-1)%2===0 && n>0
        const res = nw.select('li:nth-child(2n+1)', ul);
        assert.strictEqual(res.length, 2, 'matches li1 and li3');
      });

      it('should handle negative a (e.g., -n+2)', () => {
        const ul = document.getElementById('ul1');
        // a=-1, b=2 -> n<3
        const res = nw.select('li:nth-child(-n+2)', ul);
        assert.strictEqual(res.length, 2, 'matches li1 and li2');
      });

      it('should handle a === 0 (e.g., 0n+2 or just 2)', () => {
        const ul = document.getElementById('ul1');
        // a=0, b=2 -> n===2
        const res = nw.select('li:nth-child(2)', ul);
        assert.strictEqual(
          res[0].id,
          'li2',
          'matches exactly the second element'
        );
      });

      it('should handle only a (e.g., 3n)', () => {
        const ul = document.getElementById('ul1');
        // b=0, a=3 -> n%3===0
        const res = nw.select('li:nth-child(3n)', ul);
        assert.strictEqual(res[0].id, 'li3', 'matches the third element');
      });

      it('should handle a with sign only (e.g., +n, -n)', () => {
        const ul = document.getElementById('ul1');
        assert.strictEqual(nw.select('li:nth-child(+n)', ul).length, 3, '+n');
        assert.strictEqual(
          nw.select('li:nth-child(-n+1)', ul).length,
          1,
          '-n+1'
        );
      });

      it('should throw for empty arguments in nth-pseudo', () => {
        assert.throws(
          () => nw.select('li:nth-child()', document),
          e => e.name === SYNTAX_ERR
        );
      });
    });

    it('should handle "last" variants of nth-pseudo to cover typeBool = true branch', () => {
      const ul = document.getElementById('ul1'); // li1, li2, li3

      const res1 = nw.select('li:nth-last-child(even)', ul);
      assert.strictEqual(res1.length, 1, 'finds one even element from last');
      assert.strictEqual(res1[0].id, 'li2', 'matches li2 as the 2nd from last');

      const dl = document.getElementById('dl1');
      const res2 = nw.select('dt:nth-last-of-type(2n+1)', dl);
      assert.strictEqual(res2.length, 1, 'finds 1st from last dt');
      assert.strictEqual(res2[0].id, 'dt2', 'matches dt2');
    });

    describe('Edge cases for nth-pseudo constants (a === 0)', () => {
      it('should handle a === 0 with explicit 0n prefix', () => {
        const ul = document.getElementById('ul1');
        const res = nw.select('li:nth-child(0n+2)', ul);
        assert.strictEqual(res.length, 1, 'matches exactly one element');
        assert.strictEqual(res[0].id, 'li2', 'matches li2');
      });

      it('should handle a === 0 with only constant b', () => {
        const ul = document.getElementById('ul1');
        const res = nw.select('li:nth-child(3)', ul);
        assert.strictEqual(res.length, 1, 'matches the third element');
        assert.strictEqual(res[0].id, 'li3', 'matches li3');
      });

      it('should handle trailing symbols in nth-pseudo by lenient parsing', () => {
        const ul = document.getElementById('ul1');
        const res = nw.select('li:nth-child(+n-)', ul);
        assert.strictEqual(res.length, 3, 'leniently parses +n- as n');
      });
    });

    it('should handle negative coefficients other than -1 (a < -1)', () => {
      const ul = document.getElementById('ul1'); // li1, li2, li3
      const res = nw.select('li:nth-child(-2n+3)', ul);

      assert.strictEqual(res.length, 2, 'matches li1 and li3');
      assert.strictEqual(res[0].id, 'li1');
      assert.strictEqual(res[1].id, 'li3');
    });
  });

  describe('first() (querySelector equivalent)', () => {
    it('should throw a TypeError when selectors argument is undefined', () => {
      assert.throws(
        () => nw.first(undefined, document.body),
        e => {
          assert.strictEqual(
            e.name,
            'TypeError',
            'Should throw TypeError for undefined selectors'
          );
          return true;
        }
      );
    });
    it('should throw an error for empty selector', () => {
      assert.throws(
        () => nw.first('', document),
        e => {
          assert.strictEqual(e.name, 'SyntaxError', 'Should throw SyntaxError');
          return true;
        }
      );
    });

    it('should fast-path single id selector', () => {
      assert.deepEqual(
        nw.first('#div2', document),
        document.getElementById('div2'),
        'matches #div2'
      );
    });

    it('should fast-path single class selector', () => {
      assert.deepEqual(
        nw.first('.li', document),
        document.getElementById('li1'),
        'matches first .li'
      );
    });

    it('should return first matching node for complex selector', () => {
      assert.deepEqual(
        nw.first('ul > li.checked', document),
        document.getElementById('li2'),
        'matches li2'
      );
    });

    it('should return null if no node matches', () => {
      assert.strictEqual(
        nw.first('.non-existent', document),
        null,
        'returns null'
      );
    });

    it('should default to document if context is omitted or falsy', () => {
      assert.deepEqual(
        nw.first('.li'),
        document.getElementById('li1'),
        'matches with omitted context'
      );
      assert.deepEqual(
        nw.first('.li', null),
        document.getElementById('li1'),
        'matches with null context'
      );
    });

    it('should execute callback with the first matched element and immediately stop', () => {
      let callCount = 0;
      let matchedElement = null;
      const cb = element => {
        callCount++;
        matchedElement = element;
      };
      const res = nw.first('.li', document, cb);
      assert.strictEqual(
        callCount,
        1,
        'callback should be called exactly once'
      );
      assert.deepEqual(
        matchedElement,
        document.getElementById('li1'),
        'callback receives the first matched element'
      );
      assert.deepEqual(
        res,
        document.getElementById('li1'),
        'returns the matched element'
      );
    });

    it('should not call callback if no node matches', () => {
      let callCount = 0;
      const cb = () => {
        callCount++;
      };
      const res = nw.first('.non-existent', document, cb);
      assert.strictEqual(callCount, 0, 'callback should not be called');
      assert.strictEqual(res, null, 'returns null');
    });
  });

  describe('match() (matches equivalent)', () => {
    it('should throw a TypeError when selectors argument is undefined', () => {
      assert.throws(
        () => nw.match(undefined, document.body),
        e => {
          assert.strictEqual(
            e.name,
            'TypeError',
            'Should throw TypeError for undefined selectors'
          );
          return true;
        }
      );
    });

    it('should throw an error for empty selector', () => {
      assert.throws(
        () => nw.match('', document.body),
        e => {
          assert.strictEqual(e.name, 'SyntaxError', 'Should throw SyntaxError');
          return true;
        }
      );
    });

    it('should fast-path single selectors', () => {
      const node = document.getElementById('li1');
      assert.strictEqual(nw.match('li', node), true, 'tag match');
      assert.strictEqual(nw.match('#li1', node), true, 'id match');
      assert.strictEqual(nw.match('.li', node), true, 'class match');
      assert.strictEqual(nw.match('.foo', node), false, 'class mismatch');
    });

    it('should handle complex selectors', () => {
      const node = document.getElementById('li2');
      assert.strictEqual(
        nw.match('ul > li:nth-child(even)', node),
        true,
        'complex match true'
      );
      assert.strictEqual(
        nw.match('ol > li', node),
        false,
        'complex match false'
      );
    });

    it('should evaluate attributes', () => {
      const node = document.getElementById('input1');
      assert.strictEqual(
        nw.match('[type="text"]', node),
        true,
        'attribute match'
      );
      assert.strictEqual(
        nw.match('[value="foo"]', node),
        true,
        'attribute value match'
      );
      assert.strictEqual(
        nw.match('[readonly]', node),
        true,
        'boolean attribute match'
      );
    });

    it('should hit the cache for previously compiled selectors and execute callback', () => {
      const node = document.getElementById('li1');
      let cbCount = 0;
      const cb = () => {
        cbCount++;
        return true;
      };

      nw.match('.item', node, cb);
      assert.strictEqual(cbCount, 1, 'callback executed on cache miss');

      const resHit = nw.match('.item', node, cb);
      assert.strictEqual(resHit, true, 'returns true on cache hit');
      assert.strictEqual(cbCount, 2, 'callback executed on cache hit');
    });

    it('should skip cache retrieval if the selector contains :has(', () => {
      const node = document.getElementById('div2'); // 内部にulを持つ
      nw.match(':has(ul)', node);
      const res = nw.match(':has(ul)', node);
      assert.strictEqual(
        res,
        true,
        'evaluates :has(ul) correctly bypassing cache'
      );
    });

    it('should gracefully bypass cache if element is null or falsy', () => {
      nw.match('*', null);
      const res = nw.match('*', null);
      assert.strictEqual(
        res,
        true,
        'safely bypassed cache when element is null'
      );
    });

    it('should cast non-string selectors to string and evaluate safely', () => {
      assert.throws(
        () => nw.match(123, document.body),
        e => {
          assert.strictEqual(e.name, SYNTAX_ERR, 'name is SyntaxError');
          return true;
        }
      );
    });

    it('should handle :scope pseudo-class by converting it via makeref', () => {
      const node = document.getElementById('li2');
      assert.strictEqual(
        nw.match(':scope', node),
        true,
        'matches itself using :scope'
      );
      assert.strictEqual(
        nw.match(':sCoPe', node),
        true,
        'case-insensitive :scope replace'
      );
    });

    it('should throw SyntaxError for trailing commas in selector list', () => {
      assert.throws(
        () => nw.match('div, ', document.body),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'is DOMException'
          );
          assert.ok(
            e.message.includes('is not a valid selector'),
            'message points to invalid selector'
          );
          return true;
        }
      );
    });

    it('should throw SyntaxError for invalid selector syntax hitting the else block', () => {
      assert.throws(
        () => nw.match('[foo=bar baz]', document.body),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'is DOMException'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name is SyntaxError');
          return true;
        }
      );

      assert.throws(
        () => nw.match('*|', document.body),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'is DOMException'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name is SyntaxError');
          return true;
        }
      );
    });
  });

  describe('closest() (closest equivalent)', () => {
    it('should return element itself if it matches', () => {
      const node = document.getElementById('li1');
      assert.deepEqual(nw.closest('.item', node), node, 'returns self');
    });

    it('should traverse up the tree to find match', () => {
      const node = document.getElementById('span1');
      const target = document.getElementById('div3');
      assert.deepEqual(nw.closest('#div3', node), target, 'returns ancestor');
    });

    it('should return null if no ancestor matches', () => {
      const node = document.getElementById('li1');
      assert.strictEqual(nw.closest('table', node), null, 'returns null');
    });

    it('should handle :scope pseudo-class by converting it via makeref', () => {
      const node = document.getElementById('li2');
      const res = nw.closest(':scope', node);
      assert.deepEqual(res, node, 'matches itself using :scope');

      const resCase = nw.closest(':sCoPe', node);
      assert.deepEqual(
        resCase,
        node,
        'matches case-insensitively using :sCoPe'
      );
    });

    it('should pass callback to match() and execute it upon successful ancestor match', () => {
      const node = document.getElementById('span1');
      const target = document.getElementById('dd1');

      let cbCount = 0;
      let matchedNode = null;
      const cb = el => {
        cbCount++;
        matchedNode = el;
      };

      const res = nw.closest('.dd', node, cb);

      assert.deepEqual(res, target, 'finds the correct ancestor');
      assert.strictEqual(cbCount, 1, 'callback is executed once upon match');
      assert.deepEqual(
        matchedNode,
        target,
        'callback receives the matched ancestor element'
      );
    });
  });

  describe('Error Handling', () => {
    it('should throw DOMException (SyntaxError) for unknown pseudo-classes', () => {
      assert.throws(
        () => nw.select(':unknown-pseudo', document),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'is DOMException'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name is SyntaxError');
          assert.ok(
            e.message.includes(':unknown-pseudo'),
            'message contains pseudo'
          );
          return true;
        }
      );
    });

    it('should throw DOMException (SyntaxError) for invalid selector syntax', () => {
      assert.throws(
        () => nw.select('[foo=bar baz]', document),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'is DOMException'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name is SyntaxError');
          return true;
        }
      );
    });

    it('should hit the default switch case in compileSelector for tags starting with a hyphen', () => {
      assert.throws(
        () => nw.select('-invalid-tag > p', document),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'is DOMException'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name is SyntaxError');
          assert.ok(
            e.message.includes("'-invalid-tag > p'"),
            'message contains the invalid selector'
          );
          return true;
        }
      );

      assert.throws(
        () => nw.select('--custom > div', document),
        e => {
          assert.strictEqual(
            e instanceof window.DOMException,
            true,
            'is DOMException'
          );
          assert.strictEqual(e.name, SYNTAX_ERR, 'name is SyntaxError');
          return true;
        }
      );
    });

    describe('emit() error generation coverage', () => {
      it('should fallback to standard Error if DOMException is not available', () => {
        const originalDOMException = window.DOMException;
        delete window.DOMException;

        try {
          assert.throws(
            () => nw.select(':invalid-pseudo-for-fallback', document),
            e => {
              assert.strictEqual(
                e.constructor.name,
                'Error',
                'Should fallback to standard Error'
              );
              assert.strictEqual(
                e.name,
                'SyntaxError',
                'Error name should default to SyntaxError'
              );
              return true;
            }
          );
        } finally {
          window.DOMException = originalDOMException;
        }
      });
    });
  });
});

describe('init nwsapi', () => {
  let window, document;

  beforeEach(() => {
    const dom = new JSDOM('', {
      runScripts: 'dangerously',
      url: 'http://localhost/'
    });
    window = dom.window;
    document = dom.window.document;
  });

  afterEach(() => {
    window.close();
    window = null;
    document = null;
  });

  const func = initNwsapi;

  it('should throw', () => {
    assert.throws(
      () => func(),
      TypeError,
      'Unexpected global object Undefined'
    );
  });

  it('should throw', () => {
    assert.throws(
      () => func(document),
      TypeError,
      'Unexpected global object Document'
    );
  });

  it('should get nwsapi', () => {
    const res = func(window);
    assert.strictEqual(typeof res.match, 'function', 'nwsapi.match');
    assert.strictEqual(typeof res.closest, 'function', 'nwsapi.closest');
    assert.strictEqual(typeof res.first, 'function', 'nwsapi.first');
    assert.strictEqual(typeof res.select, 'function', 'nwsapi.select');
  });

  it('should get nwsapi', () => {
    const res = func(window, document);
    assert.strictEqual(typeof res.match, 'function', 'nwsapi.match');
    assert.strictEqual(typeof res.closest, 'function', 'nwsapi.closest');
    assert.strictEqual(typeof res.first, 'function', 'nwsapi.first');
    assert.strictEqual(typeof res.select, 'function', 'nwsapi.select');
  });

  it('should get nwsapi', () => {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    const iframeDocument = iframe.contentDocument;
    const iframeWindow = iframeDocument.defaultView;
    assert.notDeepEqual(window, iframeWindow, 'window');
    const res = func(iframeWindow);
    assert.strictEqual(typeof res.match, 'function', 'nwsapi.match');
    assert.strictEqual(typeof res.closest, 'function', 'nwsapi.closest');
    assert.strictEqual(typeof res.first, 'function', 'nwsapi.first');
    assert.strictEqual(typeof res.select, 'function', 'nwsapi.select');
  });
});
