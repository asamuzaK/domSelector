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
import { JSDOM } from 'jsdom';
import { DOMSelector } from '@asamuzakjp/dom-selector';
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
|:host|✓| |
|:host(s)|✓| |
|:host&#8209;context(s)|✓| |


## Monkey patch jsdom

``` javascript
import { JSDOM } from 'jsdom';
import { DOMSelector } from '@asamuzakjp/dom-selector';

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
|simple selector:<br>`matches('.content')`|2,573,273 ops/sec ±1.01%|1,673,318 ops/sec ±0.30%|665,946 ops/sec ±0.26%|288,434 ops/sec ±0.25%|jsdom is the fastest and 8.9 times faster than patched-jsdom.|
|compound selector:<br>`matches('p.content[id]:only-child')`|1,176,008 ops/sec ±0.67%|442,284 ops/sec ±1.85%|303,185 ops/sec ±1.27%|243,190 ops/sec ±0.22%|jsdom is the fastest and 4.8 times faster than patched-jsdom.|
|complex selector:<br>`matches('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner > .content')`|155,130 ops/sec ±0.19%|N/A|72,721 ops/sec ±0.23%|96,817 ops/sec ±1.52%|jsdom is the fastest and 1.6 times faster than patched-jsdom.|

### closest()

|Selector|jsdom v24.0.0 (nwsapi)|happy-dom|linkeDom|patched-jsdom (dom-selector)|Result|
|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|
|simple selector:<br>`closest('.container')`|562,510 ops/sec ±1.59%|355,759 ops/sec ±1.74%|390,352 ops/sec ±2.16%|194,428 ops/sec ±0.78%|jsdom is the fastest and 2.9 times faster than patched-jsdom.|
|compound selector:<br>`closest('div.container[id]:not(.box)')`|200,674 ops/sec ±1.52%|77,134 ops/sec ±1.84%|163,407 ops/sec ±1.69%|117,207 ops/sec ±1.12%|jsdom is the fastest and 1.7 times faster than patched-jsdom.|
|complex selector:<br>`closest('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner > .content')`|151,390 ops/sec ±0.60%|N/A|72,140 ops/sec ±1.33%|96,834 ops/sec ±0.95%|jsdom is the fastest and 1.6 times faster than patched-jsdom.|

### querySelector()

|Selector|jsdom v24.0.0 (nwsapi)|happy-dom|linkeDom|patched-jsdom (dom-selector)|Result|
|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|
|simple selector:<br>`querySelector('.content')`|3,020 ops/sec ±0.84%|374,668 ops/sec ±1.32%|326,366 ops/sec ±1.67%|74,776 ops/sec ±0.85%|happydom is the fastest and 5.0 times faster than patched-jsdom.<br>patched-jsdom is 24.8 times faster than jsdom.|
|compound selector:<br>`querySelector('p.content[id]:only-child')`|1,183 ops/sec ±1.24%|375,791 ops/sec ±1.66%|253,707 ops/sec ±1.68%|76,218 ops/sec ±0.84%|happydom is the fastest and 4.9 times faster than patched-jsdom.<br>patched-jsdom is 64.4 times faster than jsdom.|
|complex selector:<br>`querySelector('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner > .content')`|227 ops/sec ±1.27%|N/A|1,338 ops/sec ±0.35%|766 ops/sec ±2.66%| linkedom is the fastest and 1.7 times faster than patched-jsdom.<br>patched-jsdom is 3.4 times faster than jsdom.|

### querySelectorAll()

|Selector|jsdom v24.0.0 (nwsapi)|happy-dom|linkeDom|patched-jsdom (dom-selector)|Result|
|:-----------|:-----------|:-----------|:-----------|:-----------|:-----------|
|simple selector:<br>`querySelectorAll('.content')`|2,805 ops/sec ±0.63%|768 ops/sec ±1.68%|1,189 ops/sec ±0.22%|3,565 ops/sec ±0.24%|patched-jsdom is the fastest.<br>patched-jsdom is 1.3 times faster than jsdom.|
|compound selector:<br>`querySelectorAll('p.content[id]:only-child')`|1,151 ops/sec ±0.37%|917 ops/sec ±2.18%|1,067 ops/sec ±0.27%|1,262 ops/sec ±0.25%|patched-jsdom is the fastest.<br>patched-jsdom is 1.1 times faster than jsdom.|
|complex selector:<br>`querySelectorAll('.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner > .content')`|225 ops/sec ±0.46%|N/A|433 ops/sec ±0.23%|760 ops/sec ±0.53%|patched-jsdom is the fastest.<br>patched-jsdom is 3.4 times faster than jsdom.|


## Acknowledgments

The following resources have been of great help in the development of the DOM Selector.

- [CSSTree](https://github.com/csstree/csstree)
- [selery](https://github.com/danburzo/selery)
- [jsdom](https://github.com/jsdom/jsdom)


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
