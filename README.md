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
|&amp;|✓|Only supports outermost `&`, i.e. equivalent to `:scope`|

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

|Selector|jsdom v26.0.0 (nwsapi)|happy-dom|linkeDom|patched-jsdom (dom-selector)|Result|
|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|
|simple selector:<br>`matches('.content')`|112,297 ops/sec ±4.41%|403,800 ops/sec ±2.26%|9,352 ops/sec ±1.18%|109,587 ops/sec ±0.36%|happydom is the fastest and 3.7 times faster than patched-jsdom. jsdom is 1.0 times faster than patched-jsdom.|
|compound selector:<br>`matches('p.content[id]:is(:last-child, :only-child)')`|102,156 ops/sec ±0.83%|403,804 ops/sec ±0.91%|9,051 ops/sec ±0.78%|77,568 ops/sec ±4.06%|happydom is the fastest and 5.2 times faster than patched-jsdom. jsdom is 1.3 times faster than patched-jsdom.|
|compound selector:<br>`matches('p.content[id]:is(:invalid-nth-child, :only-child)')`|F|387,515 ops/sec ±4.34%|F|41,904 ops/sec ±1.57%|happydom is the fastest and 9.2 times faster than patched-jsdom.|
|compound selector:<br>`matches('p.content[id]:not(:is(.foo, .bar))')`|97,333 ops/sec ±0.62%|394,134 ops/sec ±2.82%|8,821 ops/sec ±0.86%|79,436 ops/sec ±0.69%|happydom is the fastest and 5.0 times faster than patched-jsdom. jsdom is 1.2 times faster than patched-jsdom.|
|complex selector:<br>`matches('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner > .content')`|63,065 ops/sec ±0.95%|F|5,751 ops/sec ±0.73%|57,917 ops/sec ±1.27%|jsdom is the fastest and 1.1 times faster than patched-jsdom.|
|complex selector:<br>`matches('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner:has(> .content)')`|29,609 ops/sec ±1.68%|F|5,741 ops/sec ±1.12%|39,522 ops/sec ±3.55%|patched-jsdom is the fastest. patched-jsdom is 1.3 times faster than jsdom.|
|complex selector within logical pseudo-class:<br>`matches(':is(.box > .content, .block > .content)')`|89,634 ops/sec ±0.66%|F|6,049 ops/sec ±0.33%|83,881 ops/sec ±0.70%|jsdom is the fastest and 1.1 times faster than patched-jsdom.|
|nested and chained :not() selector:<br>`matches('p:not(:is(:not(.content))):not(.foo)')`|F|377,155 ops/sec ±1.07%|6,087 ops/sec ±0.70%|60,032 ops/sec ±26.27%|happydom is the fastest and 6.3 times faster than patched-jsdom.|

### closest()

|Selector|jsdom v26.0.0 (nwsapi)|happy-dom|linkeDom|patched-jsdom (dom-selector)|Result|
|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|
|simple selector:<br>`closest('.container')`|68,204 ops/sec ±1.82%|266,567 ops/sec ±40.99%|9,268 ops/sec ±0.81%|82,517 ops/sec ±0.79%|happydom is the fastest and 3.2 times faster than patched-jsdom. patched-jsdom is 1.2 times faster than jsdom.|
|compound selector:<br>`closest('div.container[id]:not(.foo, .box)')`|60,091 ops/sec ±0.56%|F|8,418 ops/sec ±1.06%|51,243 ops/sec ±0.74%|jsdom is the fastest and 1.2 times faster than patched-jsdom.|
|complex selector:<br>`closest('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner > .content')`|59,694 ops/sec ±0.61%|F|5,801 ops/sec ±0.69%|53,569 ops/sec ±0.65%|jsdom is the fastest and 1.1 times faster than patched-jsdom.|
|complex selector:<br>`closest('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner:has(> .content)')`|22,696 ops/sec ±0.97%|F|5,800 ops/sec ±0.52%|34,907 ops/sec ±1.00%|patched-jsdom is the fastest. patched-jsdom is 1.5 times faster than jsdom.|
|complex selector within logical pseudo-class:<br>`closest(':is(.container > .content, .container > .box)')`|68,572 ops/sec ±0.55%|338,382 ops/sec ±1.46%|5,985 ops/sec ±1.24%|64,454 ops/sec ±0.49%|happydom is the fastest and 5.2 times faster than patched-jsdom. jsdom is 1.1 times faster than patched-jsdom.|
|nested and chained :not() selector:<br>`closest('div:not(:is(:not(.container))):not(.box)')`|F|F|8,638 ops/sec ±0.52%|55,838 ops/sec ±34.28%|patched-jsdom is the fastest.|

### querySelector()

|Selector|jsdom v26.0.0 (nwsapi)|happy-dom|linkeDom|patched-jsdom (dom-selector)|Result|
|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|
|simple selector:<br>`querySelector('.content')`|15,912 ops/sec ±2.11%|307,120 ops/sec ±26.93%|10,595 ops/sec ±0.99%|71,245 ops/sec ±1.77%|happydom is the fastest and 4.3 times faster than patched-jsdom. patched-jsdom is 4.5 times faster than jsdom.|
|compound selector:<br>`querySelector('p.content[id]:is(:last-child, :only-child)')`|7,333 ops/sec ±0.86%|290,078 ops/sec ±42.38%|9,955 ops/sec ±1.82%|34,346 ops/sec ±1.15%|happydom is the fastest and 8.4 times faster than patched-jsdom. patched-jsdom is 4.7 times faster than jsdom.|
|complex selector:<br>`querySelector('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner > .content')`|123 ops/sec ±1.40%|F|1,021 ops/sec ±0.53%|553 ops/sec ±1.99%|linkedom is the fastest and 1.8 times faster than patched-jsdom. patched-jsdom is 4.5 times faster than jsdom.|
|complex selector:<br>`querySelector('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner:has(> .content)')`|40.29 ops/sec ±6.51%|F|1,304 ops/sec ±0.87%|382 ops/sec ±1.12%|linkedom is the fastest and 3.4 times faster than patched-jsdom. patched-jsdom is 9.5 times faster than jsdom.|
|complex selector within logical pseudo-class:<br>`querySelector(':is(.box > .content, .block > .content)')`|2,104 ops/sec ±0.69%|F|9,762 ops/sec ±0.68%|67,358 ops/sec ±0.69%|patched-jsdom is the fastest. patched-jsdom is 32.0 times faster than jsdom.|
|nested and chained :not() selector:<br>`querySelector('p:not(:is(:not(.content))):not(.foo)')`|F|354,191 ops/sec ±1.43%|9,950 ops/sec ±0.86%|65,426 ops/sec ±0.91%|happydom is the fastest and 5.4 times faster than patched-jsdom.|

### querySelectorAll()

|Selector|jsdom v26.0.0 (nwsapi)|happy-dom|linkeDom|patched-jsdom (dom-selector)|Result|
|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|
|simple selector:<br>`querySelectorAll('.content')`|938 ops/sec ±1.61%|285 ops/sec ±3.27%|993 ops/sec ±2.52%|794 ops/sec ±37.70%|linkedom is the fastest and 1.3 times faster than patched-jsdom. jsdom is 1.2 times faster than patched-jsdom.|
|compound selector:<br>`querySelectorAll('p.content[id]:is(:last-child, :only-child)')`|331 ops/sec ±2.79%|320 ops/sec ±4.68%|949 ops/sec ±0.89%|354 ops/sec ±26.10%|linkedom is the fastest and 2.7 times faster than patched-jsdom. patched-jsdom is 1.1 times faster than jsdom.|
|complex selector:<br>`querySelectorAll('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner > .content')`|125 ops/sec ±0.67%|F|298 ops/sec ±0.85%|140 ops/sec ±1.03%|linkedom is the fastest and 2.1 times faster than patched-jsdom. patched-jsdom is 1.1 times faster than jsdom.|
|complex selector:<br>`querySelectorAll('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner:has(> .content)')`|42.34 ops/sec ±0.89%|F|351 ops/sec ±0.89%|135 ops/sec ±1.36%|linkedom is the fastest and 2.6 times faster than patched-jsdom. patched-jsdom is 3.2 times faster than jsdom.|
|complex selector within logical pseudo-class:<br>`querySelectorAll(':is(.box > .content, .block > .content)')`|161 ops/sec ±1.07%|F|369 ops/sec ±1.11%|720 ops/sec ±1.43%|patched-jsdom is the fastest. patched-jsdom is 4.5 times faster than jsdom.|
|nested and chained :not() selector:<br>`querySelectorAll('p:not(:is(:not(.content))):not(.foo)')`|F|296 ops/sec ±46.31%|998 ops/sec ±0.79%|1,168 ops/sec ±1.12%|patched-jsdom is the fastest.|


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
