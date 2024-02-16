# DOM Selector

[![build](https://github.com/asamuzaK/domSelector/actions/workflows/node.js.yml/badge.svg)](https://github.com/asamuzaK/domSelector/actions/workflows/node.js.yml)
[![CodeQL](https://github.com/asamuzaK/domSelector/actions/workflows/codeql.yml/badge.svg)](https://github.com/asamuzaK/domSelector/actions/workflows/codeql.yml)
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

matches - same functionality as [Element.matches()][64]

#### Parameters

- `selector` **[string][59]** CSS selector
- `node` **[object][60]** Element node
- `opt` **[object][60]?** options
  - `opt.noexcept` **[boolean][61]?** no exception
  - `opt.warn` **[boolean][61]?** console warn e.g. unsupported pseudo-class

Returns **[boolean][61]** `true` if matched, `false` otherwise


### closest(selector, node, opt)

closest - same functionality as [Element.closest()][65]

#### Parameters

- `selector` **[string][59]** CSS selector
- `node` **[object][60]** Element node
- `opt` **[object][60]?** options
  - `opt.noexcept` **[boolean][61]?** no exception
  - `opt.warn` **[boolean][61]?** console warn e.g. unsupported pseudo-class

Returns **[object][60]?** matched node


### querySelector(selector, node, opt)

querySelector - same functionality as [Document.querySelector()][66], [DocumentFragment.querySelector()][67], [Element.querySelector()][68]

#### Parameters

- `selector` **[string][59]** CSS selector
- `node` **[object][60]** Document, DocumentFragment or Element node
- `opt` **[object][60]?** options
  - `opt.noexcept` **[boolean][61]?** no exception
  - `opt.warn` **[boolean][61]?** console warn e.g. unsupported pseudo-class

Returns **[object][60]?** matched node


### querySelectorAll(selector, node, opt)

querySelectorAll - same functionality as [Document.querySelectorAll()][69], [DocumentFragment.querySelectorAll()][70], [Element.querySelectorAll()][71]  
**NOTE**: returns Array, not NodeList

#### Parameters

- `selector` **[string][59]** CSS selector
- `node` **[object][60]** Document, DocumentFragment or Element node
- `opt` **[object][60]?** options
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
|E:defined|Unsupported| |
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
|E:active|Unsupported| |
|E:hover|Unsupported| |
|E:focus|✓| |
|E:focus&#8209;within|✓| |
|E:focus&#8209;visible|Unsupported| |
|E:enabled<br>E:disabled|✓| |
|E:read&#8209;write<br>E:read&#8209;only|✓| |
|E:placeholder&#8209;shown|✓| |
|E:default|✓| |
|E:checked|✓| |
|E:indeterminate|✓| |
|E:valid<br>E:invalid|✓| |
|E:required<br>E:optional|✓| |
|E:blank|Unsupported| |
|E:user&#8209;invalid|Unsupported| |
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


## Monkey patch jsdom

``` javascript
import { DOMSelector } from '@asamuzakjp/dom-selector';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('', {
  runScripts: 'dangerously',
  url: 'http://localhost/',
  beforeParse: window => {
    const {
      closest, matches, querySelector, querySelectorAll
    } = new DOMSelector(window);
    window.Element.prototype.matches = function (...args) {
      if (!args.length) {
        throw new window.TypeError('1 argument required, but only 0 present.');
      }
      const [selector] = args;
      return matches(selector, this);
    };
    window.Element.prototype.closest = function (...args) {
      if (!args.length) {
        throw new window.TypeError('1 argument required, but only 0 present.');
      }
      const [selector] = args;
      return closest(selector, this);
    };
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

### matches()

|Selector|jsdom v24.0.0 (nwsapi)|happy-dom|linkeDom|patched-jsdom (dom-selector)|Result|
|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|
|simple selector:<br>`matches('.content')`|1,000,095 ops/sec ±0.29%|6,105 ops/sec ±0.45%|8,636 ops/sec ±0.36%|949,741 ops/sec ±0.21%|jsdom is the fastest and 1.1 times faster than patched-jsdom.|
|compound selector:<br>`matches('p.content[id]:is(:last-child, :only-child)')`|592,559 ops/sec ±1.72%|5,932 ops/sec ±0.48%|8,724 ops/sec ±0.67%|517,958 ops/sec ±0.28%|jsdom is the fastest and 1.1 times faster than patched-jsdom.|
|compound selector:<br>`matches('p.content[id]:is(:invalid-nth-child, :only-child)')`|N/A|5,893 ops/sec ±0.35%|N/A|157,436 ops/sec ±0.22%|patched-jsdom is the fastest.|
|compound selector:<br>`matches('p.content[id]:not(:is(.foo, .bar))')`|481,007 ops/sec ±0.24%|N/A|8,232 ops/sec ±0.26%|405,841 ops/sec ±1.50%|jsdom is the fastest and 1.2 times faster than patched-jsdom.|
|complex selector:<br>`matches('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner > .content')`|162,394 ops/sec ±1.46%|N/A|7,686 ops/sec ±0.76%|143,901 ops/sec ±1.34%|jsdom is the fastest and 1.1 times faster than patched-jsdom.|
|complex selector:<br>`matches('.box:first-child ~ .box:nth-of-type(4n+1) + .box .block.inner:has(> .content)')`|N/A|N/A|7,645 ops/sec ±0.91%|46,398 ops/sec ±1.03%|patched-jsdom is the fastest.|

### closest()

|Selector|jsdom v24.0.0 (nwsapi)|happy-dom|linkeDom|patched-jsdom (dom-selector)|Result|
|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|
|simple selector:<br>`closest('.container')`|384,943 ops/sec ±0.17%|6,050 ops/sec ±0.26%|8,544 ops/sec ±0.49%|373,062 ops/sec ±2.06%|jsdom is the fastest and 1.0 times faster than patched-jsdom.|
|compound selector:<br>`closest('div.container[id]:not(.foo, .box)')`|136,836 ops/sec ±1.49%|N/A|8,201 ops/sec ±0.65%|133,472 ops/sec ±1.39%|jsdom is the fastest and 1.0 times faster than patched-jsdom.|
|complex selector:<br>`closest('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner > .content')`|151,300 ops/sec ±1.42%|N/A|7,769 ops/sec ±0.48%|136,348 ops/sec ±1.36%|jsdom is the fastest and 1.1 times faster than patched-jsdom.|
|complex selector:<br>`closest('.box:first-child ~ .box:nth-of-type(4n+1) + .box .block.inner:has(> .content)')`|N/A|N/A|7,648 ops/sec ±0.60%|32,514 ops/sec ±0.85%|patched-jsdom is the fastest.|

### querySelector()

|Selector|jsdom v24.0.0 (nwsapi)|happy-dom|linkeDom|patched-jsdom (dom-selector)|Result|
|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|
|simple selector:<br>`querySelector('.content')`|36,453 ops/sec ±1.64%|7,377 ops/sec ±0.82%|9,762 ops/sec ±0.43%|30,278 ops/sec ±1.31%|jsdom is the fastest and 1.2 times faster than patched-jsdom.|
|compound selector:<br>`querySelector('p.content[id]:is(:last-child, :only-child)')`|10,518 ops/sec ±1.26%|7,286 ops/sec ±0.67%|9,400 ops/sec ±0.54%| 9,657 ops/sec ±1.35%|jsdom is the fastest and 1.1 times faster than patched-jsdom.|
|complex selector:<br>`querySelector('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner > .content')`|230 ops/sec ±1.38%|N/A|1,309 ops/sec ±1.39%|732 ops/sec ±2.31%|linkedom is the fastest and 1.8 times faster than patched-jsdom. patched-jsdom is 3.2 times faster than jsdom.|
|complex selector:<br>`querySelector('.box:first-child ~ .box:nth-of-type(4n+1) + .box .block.inner:has(> .content)')`|N/A|N/A|1,626 ops/sec ±0.28%|493 ops/sec ±2.35%|linkedom is the fastest and 3.3 times faster than patched-jsdom.|

### querySelectorAll()

|Selector|jsdom v24.0.0 (nwsapi)|happy-dom|linkeDom|patched-jsdom (dom-selector)|Result|
|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|
|simple selector:<br>`querySelectorAll('.content')`|3,194 ops/sec ±1.32%|794 ops/sec ±1.69%|1,213 ops/sec ±0.20%|3,526 ops/sec ±0.24%|patched-jsdom is the fastest. patched-jsdom is 1.1 times faster than jsdom.|
|compound selector:<br>`querySelectorAll('p.content[id]:is(:last-child, :only-child)')`|1,056 ops/sec ±0.21%|946 ops/sec ±1.32%|1,166 ops/sec ±1.19%|1,063 ops/sec ±1.09%|linkedom is the fastest and 1.1 times faster than patched-jsdom. patched-jsdom is 1.0 times faster than jsdom.|
|complex selector:<br>`querySelectorAll('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner > .content')`|233 ops/sec ±1.24%|N/A|428 ops/sec ±1.25%|819 ops/sec ±1.43%|patched-jsdom is the fastest. patched-jsdom is 3.5 times faster than jsdom.|
|complex selector:<br>`querySelectorAll('.box:first-child ~ .box:nth-of-type(4n+1) + .box .block.inner:has(> .content)')`|N/A|N/A|460 ops/sec ±0.20%|534 ops/sec ±1.83%|patched-jsdom is the fastest.|


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
