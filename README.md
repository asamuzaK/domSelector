# DOM Selector

[![build](https://github.com/asamuzaK/domSelector/actions/workflows/node.js.yml/badge.svg)](https://github.com/asamuzaK/domSelector/actions/workflows/node.js.yml)
[![CodeQL](https://github.com/asamuzaK/domSelector/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/asamuzaK/domSelector/actions/workflows/github-code-scanning/codeql)
[![npm (scoped)](https://img.shields.io/npm/v/@asamuzakjp/dom-selector)](https://www.npmjs.com/package/@asamuzakjp/dom-selector)

A CSS selector engine.

## Install

```console
npm i @asamuzakjp/dom-selector
```

## Usage

```javascript
import { DOMSelector } from '@asamuzakjp/dom-selector';
import { JSDOM } from 'jsdom';

const { window } = new JSDOM();
const {
  closest, matches, querySelector, querySelectorAll
} = new DOMSelector(window);
```

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### matches(selector, node, opt)

matches - equivalent to [Element.matches()][64]

#### Parameters

- `selector` **[string][59]** CSS selector
- `node` **[object][60]** Element node
- `opt` **[object][60]?** options
  - `opt.noexcept` **[boolean][61]?** no exception
  - `opt.warn` **[boolean][61]?** console warn e.g. unsupported pseudo-class

Returns **[boolean][61]** `true` if matched, `false` otherwise


### closest(selector, node, opt)

closest - equivalent to [Element.closest()][65]

#### Parameters

- `selector` **[string][59]** CSS selector
- `node` **[object][60]** Element node
- `opt` **[object][60]?** options
  - `opt.noexcept` **[boolean][61]?** no exception
  - `opt.warn` **[boolean][61]?** console warn e.g. unsupported pseudo-class

Returns **[object][60]?** matched node


### querySelector(selector, node, opt)

querySelector - equivalent to [Document.querySelector()][66], [DocumentFragment.querySelector()][67] and [Element.querySelector()][68]

#### Parameters

- `selector` **[string][59]** CSS selector
- `node` **[object][60]** Document, DocumentFragment or Element node
- `opt` **[object][60]?** options
  - `opt.noexcept` **[boolean][61]?** no exception
  - `opt.warn` **[boolean][61]?** console warn e.g. unsupported pseudo-class

Returns **[object][60]?** matched node


### querySelectorAll(selector, node, opt)

querySelectorAll - equivalent to [Document.querySelectorAll()][69], [DocumentFragment.querySelectorAll()][70] and [Element.querySelectorAll()][71]  
**NOTE**: returns Array, not NodeList

#### Parameters

- `selector` **[string][59]** CSS selector
- `node` **[object][60]** Document, DocumentFragment or Element node
- `opt` **[object][60]?** options
  - `opt.noexcept` **[boolean][61]?** no exception
  - `opt.warn` **[boolean][61]?** console warn e.g. unsupported pseudo-class

Returns **[Array][62]&lt;([object][60] \| [undefined][63])>** array of matched nodes


## Monkey patch jsdom

``` javascript
import { DOMSelector } from '@asamuzakjp/dom-selector';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('', {
  runScripts: 'dangerously',
  url: 'http://localhost/',
  beforeParse: window => {
    const domSelector = new DOMSelector(window);

    const matches = domSelector.matches.bind(domSelector);
    window.Element.prototype.matches = function (...args) {
      if (!args.length) {
        throw new window.TypeError('1 argument required, but only 0 present.');
      }
      const [selector] = args;
      return matches(selector, this);
    };

    const closest = domSelector.closest.bind(domSelector);
    window.Element.prototype.closest = function (...args) {
      if (!args.length) {
        throw new window.TypeError('1 argument required, but only 0 present.');
      }
      const [selector] = args;
      return closest(selector, this);
    };

    const querySelector = domSelector.querySelector.bind(domSelector);
    window.Document.prototype.querySelector = function (...args) {
      if (!args.length) {
        throw new window.TypeError('1 argument required, but only 0 present.');
      }
      const [selector] = args;
      return querySelector(selector, this);
    };
    window.DocumentFragment.prototype.querySelector = function (...args) {
      if (!args.length) {
        throw new window.TypeError('1 argument required, but only 0 present.');
      }
      const [selector] = args;
      return querySelector(selector, this);
    };
    window.Element.prototype.querySelector = function (...args) {
      if (!args.length) {
        throw new window.TypeError('1 argument required, but only 0 present.');
      }
      const [selector] = args;
      return querySelector(selector, this);
    };

    const querySelectorAll = domSelector.querySelectorAll.bind(domSelector);
    window.Document.prototype.querySelectorAll = function (...args) {
      if (!args.length) {
        throw new window.TypeError('1 argument required, but only 0 present.');
      }
      const [selector] = args;
      return querySelectorAll(selector, this);
    };
    window.DocumentFragment.prototype.querySelectorAll = function (...args) {
      if (!args.length) {
        throw new window.TypeError('1 argument required, but only 0 present.');
      }
      const [selector] = args;
      return querySelectorAll(selector, this);
    };
    window.Element.prototype.querySelectorAll = function (...args) {
      if (!args.length) {
        throw new window.TypeError('1 argument required, but only 0 present.');
      }
      const [selector] = args;
      return querySelectorAll(selector, this);
    };
  }
});
```


## Supported CSS selectors

|Pattern|Supported|Note|
|:--------|:-------:|:--------|
|\*|✓| |
|ns\|E|✓| |
|\*\|E|✓| |
|\|E|✓| |
|E|✓| |
|E:not(s1, s2, …)|✓| |
|E:is(s1, s2, …)|✓| |
|E:where(s1, s2, …)|✓| |
|E:has(rs1, rs2, …)|✓| |
|E.warning|✓| |
|E#myid|✓| |
|E\[foo\]|✓| |
|E\[foo="bar"\]|✓| |
|E\[foo="bar"&nbsp;i\]|✓| |
|E\[foo="bar"&nbsp;s\]|✓| |
|E\[foo~="bar"\]|✓| |
|E\[foo^="bar"\]|✓| |
|E\[foo$="bar"\]|✓| |
|E\[foo*="bar"\]|✓| |
|E\[foo\|="en"\]|✓| |
|E:defined|Partially supported|Matching with MathML is not yet supported.|
|E:dir(ltr)|✓| |
|E:lang(en)|✓| |
|E:any&#8209;link|✓| |
|E:link|✓| |
|E:visited|✓|Returns `false` or `null` to prevent fingerprinting.|
|E:local&#8209;link|✓| |
|E:target|✓| |
|E:target&#8209;within|✓| |
|E:scope|✓| |
|E:current|Unsupported| |
|E:current(s)|Unsupported| |
|E:past|Unsupported| |
|E:future|Unsupported| |
|E:active|✓| |
|E:hover|✓| |
|E:focus|✓| |
|E:focus&#8209;within|✓| |
|E:focus&#8209;visible|✓| |
|E:open<br>E:closed|Partially supported|Matching with &lt;select&gt;, e.g. `select:open`, is not supported.|
|E:enabled<br>E:disabled|✓| |
|E:read&#8209;write<br>E:read&#8209;only|✓| |
|E:placeholder&#8209;shown|✓| |
|E:default|✓| |
|E:checked|✓| |
|E:indeterminate|✓| |
|E:valid<br>E:invalid|✓| |
|E:required<br>E:optional|✓| |
|E:blank|Unsupported| |
|E:user&#8209;valid<br>E:user&#8209;invalid|Unsupported| |
|E:root|✓| |
|E:empty|✓| |
|E:nth&#8209;child(n&nbsp;[of&nbsp;S]?)|✓| |
|E:nth&#8209;last&#8209;child(n&nbsp;[of&nbsp;S]?)|✓| |
|E:first&#8209;child|✓| |
|E:last&#8209;child|✓| |
|E:only&#8209;child|✓| |
|E:nth&#8209;of&#8209;type(n)|✓| |
|E:nth&#8209;last&#8209;of&#8209;type(n)|✓| |
|E:first&#8209;of&#8209;type|✓| |
|E:last&#8209;of&#8209;type|✓| |
|E:only&#8209;of&#8209;type|✓| |
|E&nbsp;F|✓| |
|E > F|✓| |
|E + F|✓| |
|E ~ F|✓| |
|F \|\| E|Unsupported| |
|E:nth&#8209;col(n)|Unsupported| |
|E:nth&#8209;last&#8209;col(n)|Unsupported| |
|E:popover-open|✓| |
|E:state(v)|✓|*1|
|:host|✓| |
|:host(s)|✓| |
|:host&#8209;context(s)|✓| |
|:host(:state(v))|✓|*1|
|:host:has(rs1, rs2, ...)|✓| |
|:host(s):has(rs1, rs2, ...)|✓| |
|:host&#8209;context(s):has(rs1, rs2, ...)|✓| |

*1: `ElementInternals.states`, i.e. `CustomStateSet`, is not implemented in jsdom, so you need to apply a patch in the custom element constructor.

``` javascript
class LabeledCheckbox extends window.HTMLElement {
  #internals;
  constructor() {
    super();
    this.#internals = this.attachInternals();
    // patch CustomStateSet
    if (!this.#internals.states) {
      this.#internals.states = new Set();
    }
    this.addEventListener('click', this._onClick.bind(this));
  }
  get checked() {
    return this.#internals.states.has('checked');
  }
  set checked(flag) {
    if (flag) {
      this.#internals.states.add('checked');
    } else {
      this.#internals.states.delete('checked');
    }
  }
  _onClick(event) {
    this.checked = !this.checked;
  }
}
```


## Performance

See [benchmark](https://github.com/asamuzaK/domSelector/actions/workflows/benchmark.yml) for the latest results.

`F`: Failed because the selector is not supported or the result was incorrect.

### matches()

|Selector|jsdom v25.0.1 (nwsapi)|happy-dom|linkeDom|patched-jsdom (dom-selector)|Result|
|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|
|simple selector:<br>`matches('.content')`|116,668 ops/sec ±4.10%|340,095 ops/sec ±2.49%|7,648 ops/sec ±0.60%|116,213 ops/sec ±0.35%|happydom is the fastest and 2.9 times faster than patched-jsdom. jsdom is 1.0 times faster than patched-jsdom.|
|compound selector:<br>`matches('p.content[id]:is(:last-child, :only-child)')`|108,583 ops/sec ±0.34%|320,303 ops/sec ±9.69%|7,341 ops/sec ±1.03%|86,837 ops/sec ±1.04%|happydom is the fastest and 3.7 times faster than patched-jsdom. jsdom is 1.3 times faster than patched-jsdom.|
|compound selector:<br>`matches('p.content[id]:is(:invalid-nth-child, :only-child)')`|F|338,482 ops/sec ±2.22%|F|44,358 ops/sec ±0.52%|happydom is the fastest and 7.6 times faster than patched-jsdom.|
|compound selector:<br>`matches('p.content[id]:not(:is(.foo, .bar))')`|102,690 ops/sec ±0.59%|339,350 ops/sec ±0.54%|7,141 ops/sec ±0.68%|84,337 ops/sec ±0.52%|happydom is the fastest and 4.0 times faster than patched-jsdom. jsdom is 1.2 times faster than patched-jsdom.|
|complex selector:<br>`matches('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner > .content')`|69,897 ops/sec ±0.38%|F|4,718 ops/sec ±0.87%|62,685 ops/sec ±0.67%|jsdom is the fastest and 1.1 times faster than patched-jsdom.|
|complex selector:<br>`matches('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner:has(> .content)')`|F|F|4,660 ops/sec ±0.78%|14,994 ops/sec ±2.06%|patched-jsdom is the fastest.|
|complex selector within logical pseudo-class:<br>`matches(':is(.box > .content, .block > .content)')`|95,876 ops/sec ±0.54%|F|4,885 ops/sec ±0.40%|93,044 ops/sec ±0.63%|jsdom is the fastest and 1.0 times faster than patched-jsdom.|
|nested and chained :not() selector:<br>`matches('p:not(:is(:not(.content))):not(.foo)')`|F|F|4,350 ops/sec ±20.42%|81,318 ops/sec ±0.72%|patched-jsdom is the fastest.|

### closest()

|Selector|jsdom v25.0.1 (nwsapi)|happy-dom|linkeDom|patched-jsdom (dom-selector)|Result|
|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|
|simple selector:<br>`closest('.container')`|92,111 ops/sec ±0.96%|249,153 ops/sec ±40.73%|7,500 ops/sec ±0.55%|90,885 ops/sec ±0.40%|happydom is the fastest and 2.7 times faster than patched-jsdom. jsdom is 1.0 times faster than patched-jsdom.|
|compound selector:<br>`closest('div.container[id]:not(.foo, .box)')`|64,202 ops/sec ±0.68%|F|7,040 ops/sec ±0.58%|55,421 ops/sec ±0.89%|jsdom is the fastest and 1.2 times faster than patched-jsdom.|
|complex selector:<br>`closest('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner > .content')`|63,845 ops/sec ±0.58%|F|4,734 ops/sec ±0.50%|58,730 ops/sec ±0.62%|jsdom is the fastest and 1.1 times faster than patched-jsdom.|
|complex selector:<br>`closest('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner:has(> .content)')`|F|F|4,559 ops/sec ±0.79%|12,747 ops/sec ±0.44%|patched-jsdom is the fastest.|
|complex selector within logical pseudo-class:<br>`closest(':is(.container > .content, .container > .box)')`|75,117 ops/sec ±0.43%|295,154 ops/sec ±0.38%|4,902 ops/sec ±0.50%|70,354 ops/sec ±0.72%|happydom is the fastest and 4.2 times faster than patched-jsdom. jsdom is 1.1 times faster than patched-jsdom.|

### querySelector()

|Selector|jsdom v25.0.1 (nwsapi)|happy-dom|linkeDom|patched-jsdom (dom-selector)|Result|
|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|
|simple selector:<br>`querySelector('.content')`|21,778 ops/sec ±1.09%|317,148 ops/sec ±5.41%|9,044 ops/sec ±0.63%|58,022 ops/sec ±37.29%|happydom is the fastest and 5.5 times faster than patched-jsdom. patched-jsdom is 2.7 times faster than jsdom.|
|compound selector:<br>`querySelector('p.content[id]:is(:last-child, :only-child)')`|8,249 ops/sec ±0.76%|315,336 ops/sec ±0.77%|6,667 ops/sec ±42.96%|36,653 ops/sec ±0.77%|happydom is the fastest and 8.6 times faster than patched-jsdom. patched-jsdom is 4.4 times faster than jsdom.|
|complex selector:<br>`querySelector('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner > .content')`|201 ops/sec ±0.62%|F|1,178 ops/sec ±0.86%|605 ops/sec ±0.85%|linkedom is the fastest and 1.9 times faster than patched-jsdom. patched-jsdom is 3.0 times faster than jsdom.|
|complex selector:<br>`querySelector('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner:has(> .content)')`|F|F|1,461 ops/sec ±0.54%|450 ops/sec ±0.54%|linkedom is the fastest and 3.2 times faster than patched-jsdom.|
|complex selector within logical pseudo-class:<br>`querySelector(':is(.box > .content, .block > .content)')`|3,054 ops/sec ±0.78%|F|8,394 ops/sec ±0.88%|74,605 ops/sec ±0.72%|patched-jsdom is the fastest. patched-jsdom is 24.4 times faster than jsdom.|
|nested and chained :not() selector:<br>`querySelector('p:not(:is(:not(.content))):not(.foo)')`|F|F|8,463 ops/sec ±0.65%|69,622 ops/sec ±0.77%|patched-jsdom is the fastest.|

### querySelectorAll()

|Selector|jsdom v25.0.1 (nwsapi)|happy-dom|linkeDom|patched-jsdom (dom-selector)|Result|
|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|
|simple selector:<br>`querySelectorAll('.content')`|1,300 ops/sec ±0.61%|511 ops/sec ±38.06%|1,090 ops/sec ±0.50%|1,293 ops/sec ±0.48%|jsdom is the fastest and 1.0 times faster than patched-jsdom.|
|compound selector:<br>`querySelectorAll('p.content[id]:is(:last-child, :only-child)')`|686 ops/sec ±0.24%|581 ops/sec ±4.84%|1,065 ops/sec ±0.62%|629 ops/sec ±0.54%|linkedom is the fastest and 1.7 times faster than patched-jsdom. jsdom is 1.1 times faster than patched-jsdom.|
|complex selector:<br>`querySelectorAll('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner > .content')`|199 ops/sec ±0.76%|F|388 ops/sec ±0.75%|202 ops/sec ±0.42%|linkedom is the fastest and 1.9 times faster than patched-jsdom. patched-jsdom is 1.0 times faster than jsdom.|
|complex selector:<br>`querySelectorAll('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner:has(> .content)')`|F|F|419 ops/sec ±0.56%|177 ops/sec ±1.02%|linkedom is the fastest and 2.4 times faster than patched-jsdom.|
|complex selector within logical pseudo-class:<br>`querySelectorAll(':is(.box > .content, .block > .content)')`|271 ops/sec ±1.06%|F|465 ops/sec ±0.39%|794 ops/sec ±1.19%|patched-jsdom is the fastest. patched-jsdom is 2.9 times faster than jsdom.|
|nested and chained :not() selector:<br>`querySelectorAll('p:not(:is(:not(.content))):not(.foo)')`|F|F|1,111 ops/sec ±0.45%|1,274 ops/sec ±0.88%|patched-jsdom is the fastest.|


## Acknowledgments

The following resources have been of great help in the development of the DOM Selector.

- [CSSTree](https://github.com/csstree/csstree)
- [selery](https://github.com/danburzo/selery)
- [jsdom](https://github.com/jsdom/jsdom)
- [nwsapi](https://github.com/dperini/nwsapi)

---
Copyright (c) 2023 [asamuzaK (Kazz)](https://github.com/asamuzaK/)


[1]: #matches
[2]: #parameters
[3]: #closest
[4]: #parameters-1
[5]: #queryselector
[6]: #parameters-2
[7]: #queryselectorall
[8]: #parameters-3
[59]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String
[60]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object
[61]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean
[62]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array
[63]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/undefined
[64]: https://developer.mozilla.org/docs/Web/API/Element/matches
[65]: https://developer.mozilla.org/docs/Web/API/Element/closest
[66]: https://developer.mozilla.org/docs/Web/API/Document/querySelector
[67]: https://developer.mozilla.org/docs/Web/API/DocumentFragment/querySelector
[68]: https://developer.mozilla.org/docs/Web/API/Element/querySelector
[69]: https://developer.mozilla.org/docs/Web/API/Document/querySelectorAll
[70]: https://developer.mozilla.org/docs/Web/API/DocumentFragment/querySelectorAll
[71]: https://developer.mozilla.org/docs/Web/API/Element/querySelectorAll
