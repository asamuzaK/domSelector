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
|simple selector:<br>`matches('.content')`|110,797 ops/sec ±5.64%|329,358 ops/sec ±2.10%|7,935 ops/sec ±1.20%|110,737 ops/sec ±0.63%|happydom is the fastest and 3.0 times faster than patched-jsdom. jsdom is 1.0 times faster than patched-jsdom.|
|compound selector:<br>`matches('p.content[id]:is(:last-child, :only-child)')`|103,640 ops/sec ±0.82%|308,071 ops/sec ±9.17%|7,870 ops/sec ±1.24%|85,818 ops/sec ±1.09%|happydom is the fastest and 3.6 times faster than patched-jsdom. jsdom is 1.2 times faster than patched-jsdom.|
|compound selector:<br>`matches('p.content[id]:is(:invalid-nth-child, :only-child)')`|F|326,541 ops/sec ±2.45%|F|43,809 ops/sec ±1.80%|happydom is the fastest and 7.5 times faster than patched-jsdom.|
|compound selector:<br>`matches('p.content[id]:not(:is(.foo, .bar))')`|100,293 ops/sec ±1.46%|325,859 ops/sec ±0.41%|7,569 ops/sec ±0.67%|81,531 ops/sec ±0.69%|happydom is the fastest and 4.0 times faster than patched-jsdom. jsdom is 1.2 times faster than patched-jsdom.|
|complex selector:<br>`matches('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner > .content')`|62,731 ops/sec ±0.48%|F|4,958 ops/sec ±0.73%|62,409 ops/sec ±0.57%|jsdom is the fastest and 1.0 times faster than patched-jsdom.|
|complex selector:<br>`matches('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner:has(> .content)')`|F|F|4,906 ops/sec ±0.57%|16,493 ops/sec ±2.42%|patched-jsdom is the fastest.|
|complex selector within logical pseudo-class:<br>`matches(':is(.box > .content, .block > .content)')`|92,972 ops/sec ±3.74%|F|5,232 ops/sec ±0.66%|88,407 ops/sec ±0.38%|jsdom is the fastest and 1.1 times faster than patched-jsdom.|

### closest()

|Selector|jsdom v25.0.1 (nwsapi)|happy-dom|linkeDom|patched-jsdom (dom-selector)|Result|
|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|
|simple selector:<br>`closest('.container')`|78,125 ops/sec ±27.74%|227,938 ops/sec ±40.37%|8,125 ops/sec ±0.86%|85,112 ops/sec ±1.27%|happydom is the fastest and 2.7 times faster than patched-jsdom. patched-jsdom is 1.1 times faster than jsdom.|
|compound selector:<br>`closest('div.container[id]:not(.foo, .box)')`|61,059 ops/sec ±0.39%|F|7,482 ops/sec ±0.69%|55,022 ops/sec ±0.68%|jsdom is the fastest and 1.1 times faster than patched-jsdom.|
|complex selector:<br>`closest('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner > .content')`|61,366 ops/sec ±0.41%|F|4,987 ops/sec ±0.74%|54,180 ops/sec ±0.95%|jsdom is the fastest and 1.1 times faster than patched-jsdom.|
|complex selector:<br>`closest('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner:has(> .content)')`|F|F|4,765 ops/sec ±0.71%|13,341 ops/sec ±0.54%|patched-jsdom is the fastest.|
|complex selector within logical pseudo-class:<br>`closest(':is(.container > .content, .container > .box)')`|69,522 ops/sec ±0.55%|282,851 ops/sec ±0.53%|5,049 ops/sec ±0.50%|65,207 ops/sec ±0.63%|happydom is the fastest and 4.3 times faster than patched-jsdom. jsdom is 1.1 times faster than patched-jsdom.|

### querySelector()

|Selector|jsdom v25.0.1 (nwsapi)|happy-dom|linkeDom|patched-jsdom (dom-selector)|Result|
|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|
|simple selector:<br>`querySelector('.content')`|20,648 ops/sec ±0.93%|317,893 ops/sec ±0.41%|8,839 ops/sec ±7.72%|70,886 ops/sec ±0.73%|happydom is the fastest and 4.5 times faster than patched-jsdom. patched-jsdom is 3.4 times faster than jsdom.|
|compound selector:<br>`querySelector('p.content[id]:is(:last-child, :only-child)')`|7,213 ops/sec ±1.27%|231,430 ops/sec ±49.27%|9,196 ops/sec ±0.74%|36,772 ops/sec ±0.93%|happydom is the fastest and 6.3 times faster than patched-jsdom. patched-jsdom is 5.1 times faster than jsdom.|
|complex selector:<br>`querySelector('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner > .content')`|193 ops/sec ±1.11%|F|1,253 ops/sec ±1.10%|612 ops/sec ±1.27%|linkedom is the fastest and 2.0 times faster than patched-jsdom. patched-jsdom is 3.2 times faster than jsdom.|
|complex selector:<br>`querySelector('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner:has(> .content)')`|F|F|1,442 ops/sec ±1.65%|447 ops/sec ±0.69%|linkedom is the fastest and 3.2 times faster than patched-jsdom.|
|complex selector within logical pseudo-class:<br>`querySelector(':is(.box > .content, .block > .content)')`|2,851 ops/sec ±1.72%|F|8,840 ops/sec ±0.94%|68,007 ops/sec ±0.52%|patched-jsdom is the fastest. patched-jsdom is 23.9 times faster than jsdom.|

### querySelectorAll()

|Selector|jsdom v25.0.1 (nwsapi)|happy-dom|linkeDom|patched-jsdom (dom-selector)|Result|
|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|
|simple selector:<br>`querySelectorAll('.content')`|1,208 ops/sec ±1.02%|561 ops/sec ±4.11%|1,102 ops/sec ±0.76%|1,242 ops/sec ±0.65%|patched-jsdom is the fastest. patched-jsdom is 1.0 times faster than jsdom.|
|compound selector:<br>`querySelectorAll('p.content[id]:is(:last-child, :only-child)')`|610 ops/sec ±1.08%|451 ops/sec ±29.09%|1,117 ops/sec ±0.89%|618 ops/sec ±0.47%|linkedom is the fastest and 1.8 times faster than patched-jsdom. patched-jsdom is 1.0 times faster than jsdom.|
|complex selector:<br>`querySelectorAll('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner > .content')`|191 ops/sec ±1.23%|F|386 ops/sec ±0.79%|206 ops/sec ±0.71%|linkedom is the fastest and 1.9 times faster than patched-jsdom. patched-jsdom is 1.1 times faster than jsdom.|
|complex selector:<br>`querySelectorAll('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner:has(> .content)')`|F|F|423 ops/sec ±0.87%|184 ops/sec ±0.82%|linkedom is the fastest and 2.3 times faster than patched-jsdom.|
|complex selector within logical pseudo-class:<br>`querySelectorAll(':is(.box > .content, .block > .content)')`|276 ops/sec ±0.79%|F|471 ops/sec ±0.78%|801 ops/sec ±1.03%|patched-jsdom is the fastest. patched-jsdom is 2.9 times faster than jsdom.|


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
