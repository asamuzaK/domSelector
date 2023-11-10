# DOM Selector

[![build](https://github.com/asamuzaK/domSelector/actions/workflows/node.js.yml/badge.svg)](https://github.com/asamuzaK/domSelector/actions/workflows/node.js.yml)
[![CodeQL](https://github.com/asamuzaK/domSelector/actions/workflows/codeql.yml/badge.svg)](https://github.com/asamuzaK/domSelector/actions/workflows/codeql.yml)
[![npm (scoped)](https://img.shields.io/npm/v/@asamuzakjp/dom-selector)](https://www.npmjs.com/package/@asamuzakjp/dom-selector)

<!--
[![release](https://img.shields.io/github/v/release/asamuzaK/domSelector)](https://github.com/asamuzaK/domSelector/releases)
-->

Retrieve DOM node from the given CSS selector.

## Install

```console
npm i @asamuzakjp/dom-selector
```

## Usage

```javascript
import {
  matches, closest, querySelector, querySelectorAll
} from '@asamuzakjp/dom-selector';
```

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### matches(selector, node, opt)

matches - same functionality as [Element.matches()][64]

#### Parameters

- `selector` **[string][59]** CSS selector
- `node` **[object][60]** Element node
- `opt` **[object][60]?** options
  - `opt.warn` **[boolean][61]?** console warn e.g. unsupported pseudo-class

Returns **[boolean][61]** `true` if matched, `false` otherwise


### closest(selector, node, opt)

closest - same functionality as [Element.closest()][65]

#### Parameters

- `selector` **[string][59]** CSS selector
- `node` **[object][60]** Element node
- `opt` **[object][60]?** options
  - `opt.warn` **[boolean][61]?** console warn e.g. unsupported pseudo-class

Returns **[object][60]?** matched node


### querySelector(selector, node, opt)

querySelector - same functionality as [Document.querySelector()][66], [DocumentFragment.querySelector()][67], [Element.querySelector()][68]

#### Parameters

- `selector` **[string][59]** CSS selector
- `node` **[object][60]** Document, DocumentFragment or Element node
- `opt` **[object][60]?** options
  - `opt.warn` **[boolean][61]?** console warn e.g. unsupported pseudo-class

Returns **[object][60]?** matched node


### querySelectorAll(selector, node, opt)

querySelectorAll - same functionality as [Document.querySelectorAll()][69], [DocumentFragment.querySelectorAll()][70], [Element.querySelectorAll()][71]  
**NOTE**: returns Array, not NodeList

#### Parameters

- `selector` **[string][59]** CSS selector
- `node` **[object][60]** Document, DocumentFragment or Element node
- `opt` **[object][60]?** options
  - `opt.sort` **[boolean][61]?** sort matched nodes
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


## Monkey patch jsdom

``` javascript
import { JSDOM } from 'jsdom';
import {
  closest, matches, querySelector, querySelectorAll
} from '@asamuzakjp/dom-selector';

const dom = new JSDOM('', {
  runScripts: 'dangerously',
  url: 'http://localhost/',
  beforeParse: window => {
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

### Performance

|Method and CSS selector|Jsdom|Patched-jsdom|Result|
|:------------|:------------|:------------|:------------|
|matches('.container.box')|1,642,216 ops/sec ±3.43%|64,823 ops/sec ±8.74%|jsdom is 25.3 times faster. patched-jsdom took 0.015msec.|
|matches('.container:not(.box)')|829,464 ops/sec ±3.61%|39,531 ops/sec ±4.15%|jsdom is 21.0 times faster. patched-jsdom took 0.025msec.|
|matches('.box + .box')|1,598,580 ops/sec ±1.44%|66,518 ops/sec ±2.04%|jsdom is 24.0 times faster. patched-jsdom took 0.015msec.|
|matches('.box ~ .box')|1,623,837 ops/sec ±1.21%|65,891 ops/sec ±0.94%|jsdom is 24.6 times faster. patched-jsdom took 0.015msec.|
|matches('.box > .block')|1,621,883 ops/sec ±0.31%|63,556 ops/sec ±2.48%|jsdom is 25.5 times faster. patched-jsdom took 0.016msec.|
|matches('.box .content')|244,534 ops/sec ±0.48%|36,005 ops/sec ±2.06%|jsdom is 6.8 times faster. patched-jsdom took 0.028msec.|
|matches('.box:first-child ~ .box:nth-of-type(4n+1) + .box .block.inner > .content')|105,311 ops/sec ±3.69%|7,098 ops/sec ±2.10%|jsdom is 14.8 times faster. patched-jsdom took 0.141msec.|
|matches('.box:first-child ~ .box:nth-of-type(4n+1) + .box .block.inner:has(> .content)')|N/A|22,913 ops/sec ±1.68%|jsdom throws. patched-jsdom took 0.044msec.|
|closest('.container.box')|319,262 ops/sec ±0.89%|30,493 ops/sec ±3.23%|jsdom is 10.5 times faster. patched-jsdom took 0.033msec.|
|closest('.container:not(.box)')|179,788 ops/sec ±0.61%|20,566 ops/sec ±2.22%|jsdom is 8.7 times faster. patched-jsdom took 0.049msec.|
|closest('.box + .box')|294,027 ops/sec ±0.79%|32,386 ops/sec ±1.67%|jsdom is 9.1 times faster. patched-jsdom took 0.031msec.|
|closest('.box ~ .box')|101,510 ops/sec ±3.61%|20,699 ops/sec ±2.35%|jsdom is 4.9 times faster. patched-jsdom took 0.048msec.|
|closest('.box > .block')|314,456 ops/sec ±1.27%|30,538 ops/sec ±1.37%|jsdom is 10.3 times faster. patched-jsdom took 0.033msec.|
|closest('.box .content')|228,070 ops/sec ±0.68%|24,453 ops/sec ±1.96%|jsdom is 9.3 times faster. patched-jsdom took 0.041msec.|
|closest('.box:first-child ~ .box:nth-of-type(4n+1) + .box .block.inner > .content')|99,675 ops/sec ±1.33%|6,632 ops/sec ±2.70%|jsdom is 15.0 times faster. patched-jsdom took 0.151msec.|
|closest('.box:first-child ~ .box:nth-of-type(4n+1) + .box .block.inner:has(> .content)')|N/A|5,411 ops/sec ±1.75%|jsdom throws. patched-jsdom took 0.185msec.|
|querySelector('.container.box')|43,668 ops/sec ±2.03%|15,026 ops/sec ±3.43%|jsdom is 2.9 times faster. patched-jsdom took 0.067msec.|
|querySelector('.container:not(.box)')|31,873 ops/sec ±2.43%|10,341 ops/sec ±1.99%|jsdom is 3.1 times faster. patched-jsdom took 0.097msec.|
|querySelector('.box + .box')|29,090 ops/sec ±5.25%|10,685 ops/sec ±7.23%|jsdom is 2.7 times faster. patched-jsdom took 0.094msec.|
|jsdom querySelector('.box ~ .box')|34,395 ops/sec ±2.16%|6,492 ops/sec ±1.80%|jsdom is 5.3 times faster. patched-jsdom took 0.154msec.|
|querySelector('.box > .block')|707 ops/sec ±2.04%|2,037 ops/sec ±2.42%|patched-jsdom is 2.9 times faster. patched-jsdom took 0.491msec.|
|querySelector('.box .content')|307 ops/sec ±3.40%|63.44 ops/sec ±2.42%|jsdom is 4.8 times faster. patched-jsdom took 15.763msec.|
|querySelector('.box:first-child ~ .box:nth-of-type(4n+1) + .box .block.inner > .content')|141 ops/sec ±2.52%|177 ops/sec ±2.21%|patched-jsdom is 1.3 times faster. patched-jsdom took 5.650msec.|
|querySelector('.box:first-child ~ .box:nth-of-type(4n+1) + .box .block.inner:has(> .content)')|N/A|154 ops/sec ±0.93%|jsdom throws. patched-jsdom took 6.476msec.|
|querySelectorAll('.container.box')|62,222 ops/sec ±2.29%|15,138 ops/sec ±1.13%|jsdom is 4.1 times faster. patched-jsdom took 0.066msec.|
|querySelectorAll('.container:not(.box)')|52,862 ops/sec ±1.82%|11,352 ops/sec ±1.30%|jsdom is 4.7 times faster. patched-jsdom took 0.088msec.|
|querySelectorAll('.box + .box')|50,474 ops/sec ±2.32%|13,338 ops/sec ±1.24%|jsdom is 3.8 times faster. patched-jsdom took 0.075msec.|
|querySelectorAll('.box ~ .box')|51,083 ops/sec ±0.69%|6,620 ops/sec ±0.92%|jsdom is 7.7 times faster. patched-jsdom took 0.151msec.|
|jsdom querySelectorAll('.box > .block')|691 ops/sec ±1.53%|1,729 ops/sec ±2.07%|patched-jsdom is 2.5 times faster. patched-jsdom took 0.578msec.|
|querySelectorAll('.box .content')|305 ops/sec ±2.17%|67.15 ops/sec ±1.29%|jsdom is 4.5 times faster. patched-jsdom took 14.893msec.|
|querySelectorAll('.box:first-child ~ .box:nth-of-type(4n+1) + .box .block.inner > .content')|143 ops/sec ±2.35%|180 ops/sec ±1.79%|patched-jsdom is 1.3 times faster. patched-jsdom took 5.565msec.|
|querySelectorAll('.box:first-child ~ .box:nth-of-type(4n+1) + .box .block.inner:has(> .content)')|N/A|153 ops/sec ±1.06%|jsdom throws. patched-jsdom took 6.515msec.|


## Acknowledgments

The following resources have been of great help in the development of the DOM Selector.

- [CSSTree](https://github.com/csstree/csstree)
- [selery](https://github.com/danburzo/selery)


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
