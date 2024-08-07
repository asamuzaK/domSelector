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
  - `opt.event` **[object][60]?** instance of MouseEvent, KeyboardEvent
  - `opt.noexcept` **[boolean][61]?** no exception
  - `opt.warn` **[boolean][61]?** console warn e.g. unsupported pseudo-class

Returns **[boolean][61]** `true` if matched, `false` otherwise


### closest(selector, node, opt)

closest - equivalent to [Element.closest()][65]

#### Parameters

- `selector` **[string][59]** CSS selector
- `node` **[object][60]** Element node
- `opt` **[object][60]?** options
  - `opt.event` **[object][60]?** instance of MouseEvent, KeyboardEvent
  - `opt.noexcept` **[boolean][61]?** no exception
  - `opt.warn` **[boolean][61]?** console warn e.g. unsupported pseudo-class

Returns **[object][60]?** matched node


### querySelector(selector, node, opt)

querySelector - equivalent to [Document.querySelector()][66], [DocumentFragment.querySelector()][67] and [Element.querySelector()][68]

#### Parameters

- `selector` **[string][59]** CSS selector
- `node` **[object][60]** Document, DocumentFragment or Element node
- `opt` **[object][60]?** options
  - `opt.event` **[object][60]?** instance of MouseEvent, KeyboardEvent
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
  - `opt.event` **[object][60]?** instance of MouseEvent, KeyboardEvent
  - `opt.noexcept` **[boolean][61]?** no exception
  - `opt.warn` **[boolean][61]?** console warn e.g. unsupported pseudo-class

Returns **[Array][62]&lt;([object][60] \| [undefined][63])>** array of matched nodes


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
|E:lang(en)|Partially supported|Comma-separated list of language codes, e.g. `:lang(en, fr)`, is not yet supported.|
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
|E:active|✓|Enabled if a `mousedown` / `pointerdown` event is passed as an option.|
|E:hover|✓|Enabled if a `mouseover` / `pointerover` event is passed as an option.|
|E:focus|✓| |
|E:focus&#8209;within|✓| |
|E:focus&#8209;visible|✓|Enabled if a `keydown` event is passed as an option.|
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
|E:host|✓| |
|E:host(s)|✓| |
|E:host&#8209;context(s)|✓| |
|E:popover-open|✓| |
|E:state(v)|✓|*1|
|E:host(:state(v))|✓|*1|

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


## Performance

See [benchmark](https://github.com/asamuzaK/domSelector/actions/workflows/benchmark.yml) for the latest results.

`F`: Failed because the selector is not supported or the result was incorrect.

### matches()

|Selector|jsdom v24.1.1 (nwsapi)|happy-dom|linkeDom|patched-jsdom (dom-selector)|Result|
|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|
|simple selector:<br>`matches('.content')`|1,031,169 ops/sec ±0.30%|7,650 ops/sec ±0.75%|9,438 ops/sec ±0.58%|828,526 ops/sec ±0.28%|jsdom is the fastest and 1.2 times faster than patched-jsdom.|
|compound selector:<br>`matches('p.content[id]:is(:last-child, :only-child)')`|603,664 ops/sec ±1.24%|7,430 ops/sec ±0.65%|8,923 ops/sec ±0.98%|400,799 ops/sec ±0.31%|jsdom is the fastest and 1.5 times faster than patched-jsdom.|
|compound selector:<br>`matches('p.content[id]:is(:invalid-nth-child, :only-child)')`|F|7,358 ops/sec ±1.45%|F|73,167 ops/sec ±0.99%|patched-jsdom is the fastest.|
|compound selector:<br>`matches('p.content[id]:not(:is(.foo, .bar))')`|478,859 ops/sec ±1.56%|7,312 ops/sec ±1.24%|8,786 ops/sec ±0.75%|338,833 ops/sec ±1.37%|jsdom is the fastest and 1.4 times faster than patched-jsdom.|
|complex selector:<br>`matches('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner > .content')`|154,200 ops/sec ±1.15%|F|5,852 ops/sec ±0.74%|127,543 ops/sec ±1.23%|jsdom is the fastest and 1.2 times faster than patched-jsdom.|
|complex selector:<br>`matches('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner:has(> .content)')`|F|F|5,792 ops/sec ±0.81%|18,981 ops/sec ±1.80%|patched-jsdom is the fastest.|
|complex selector within logical pseudo-class:<br>`matches(':is(.box > .content, .block > .content)')`|414,939 ops/sec ±1.14%|F|6,158 ops/sec ±0.44%|332,506 ops/sec ±0.26%|jsdom is the fastest and 1.2 times faster than patched-jsdom.|

### closest()

|Selector|jsdom v24.1.1 (nwsapi)|happy-dom|linkeDom|patched-jsdom (dom-selector)|Result|
|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|
|simple selector:<br>`closest('.container')`|376,552 ops/sec ±1.42%|7,476 ops/sec ±0.84%|9,281 ops/sec ±0.63%|340,692 ops/sec ±1.37%|jsdom is the fastest and 1.1 times faster than patched-jsdom.|
|compound selector:<br>`closest('div.container[id]:not(.foo, .box)')`|138,076 ops/sec ±1.49%|F|8,643 ops/sec ±0.96%|121,489 ops/sec ±1.12%|jsdom is the fastest and 1.1 times faster than patched-jsdom.|
|complex selector:<br>`closest('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner > .content')`|141,376 ops/sec ±1.33%|F|5,795 ops/sec ±0.80%|120,433 ops/sec ±1.28%|jsdom is the fastest and 1.2 times faster than patched-jsdom.|
|complex selector:<br>`closest('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner:has(> .content)')`|F|F|5,723 ops/sec ±0.73%|15,392 ops/sec ±1.58%|patched-jsdom is the fastest.|
|complex selector within logical pseudo-class:<br>`closest(':is(.container > .content, .container > .box)')`|194,922 ops/sec ±1.40%|4,752 ops/sec ±1.20%|6,139 ops/sec ±0.35%|176,281 ops/sec ±0.32%|jsdom is the fastest and 1.1 times faster than patched-jsdom.|

### querySelector()

|Selector|jsdom v24.1.1 (nwsapi)|happy-dom|linkeDom|patched-jsdom (dom-selector)|Result|
|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|
|simple selector:<br>`querySelector('.content')`|27,103 ops/sec ±0.78%|9,293 ops/sec ±0.55%|11,341 ops/sec ±0.46%|30,262 ops/sec ±0.23%|patched-jsdom is the fastest. patched-jsdom is 1.1 times faster than jsdom.|
|compound selector:<br>`querySelector('p.content[id]:is(:last-child, :only-child)')`|10,072 ops/sec ±1.46%|9,055 ops/sec ±0.95%|10,058 ops/sec ±0.84%|9,716 ops/sec ±1.34%|jsdom is the fastest and 1.0 times faster than patched-jsdom.|
|complex selector:<br>`querySelector('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner > .content')`|225 ops/sec ±0.61%|F|1,267 ops/sec ±1.48%|271 ops/sec ±1.37%|linkedom is the fastest and 4.7 times faster than patched-jsdom. patched-jsdom is 1.2 times faster than jsdom.|
|complex selector:<br>`querySelector('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner:has(> .content)')`|F|F|1,611 ops/sec ±1.52%|730 ops/sec ±1.58%|linkedom is the fastest and 2.2 times faster than patched-jsdom.|
|complex selector within logical pseudo-class:<br>`querySelector(':is(.box > .content, .block > .content)')`|3,152 ops/sec ±2.67%|F|9,906 ops/sec ±0.94%|159,199 ops/sec ±1.91%|patched-jsdom is the fastest. patched-jsdom is 50.5 times faster than jsdom.|

### querySelectorAll()

|Selector|jsdom v24.1.1 (nwsapi)|happy-dom|linkeDom|patched-jsdom (dom-selector)|Result|
|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|
|simple selector:<br>`querySelectorAll('.content')`|2,684 ops/sec ±1.00%|758 ops/sec ±1.65%|1,231 ops/sec ±1.45%|3,131 ops/sec ±0.90%|patched-jsdom is the fastest. patched-jsdom is 1.2 times faster than jsdom.|
|compound selector:<br>`querySelectorAll('p.content[id]:is(:last-child, :only-child)')`|958 ops/sec ±0.29%|686 ops/sec ±1.79%|1,171 ops/sec ±1.23%|996 ops/sec ±1.17%|linkedom is the fastest and 1.2 times faster than patched-jsdom. patched-jsdom is 1.0 times faster than jsdom.|
|complex selector:<br>`querySelectorAll('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner > .content')`|210 ops/sec ±1.78%|F|421 ops/sec ±1.53%|240 ops/sec ±1.51%|linkedom is the fastest and 1.8 times faster than patched-jsdom. patched-jsdom is 1.1 times faster than jsdom.|
|complex selector:<br>`querySelectorAll('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner:has(> .content)')`|F|F|442 ops/sec ±1.84%|823 ops/sec ±1.64%|patched-jsdom is the fastest.|
|complex selector within logical pseudo-class:<br>`querySelectorAll(':is(.box > .content, .block > .content)')`|302 ops/sec ±1.43%|F|518 ops/sec ±1.47%|785 ops/sec ±0.98%|patched-jsdom is the fastest. patched-jsdom is 2.6 times faster than jsdom.|


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
