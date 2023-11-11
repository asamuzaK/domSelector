# DOM Selector

[![build](https://github.com/asamuzaK/domSelector/actions/workflows/node.js.yml/badge.svg)](https://github.com/asamuzaK/domSelector/actions/workflows/node.js.yml)
[![CodeQL](https://github.com/asamuzaK/domSelector/actions/workflows/codeql.yml/badge.svg)](https://github.com/asamuzaK/domSelector/actions/workflows/codeql.yml)
[![npm (scoped)](https://img.shields.io/npm/v/@asamuzakjp/dom-selector)](https://www.npmjs.com/package/@asamuzakjp/dom-selector)

<!--
[![release](https://img.shields.io/github/v/release/asamuzaK/domSelector)](https://github.com/asamuzaK/domSelector/releases)
-->

Gets the DOM node that matches the CSS selector.

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

|Method / Selector|Jsdom|Patched-jsdom|Result|
|:----------------|:----------------|:----------------|:----------------|
|matches('.container.box')|2,103,531 ops/sec ±16.53%|113,370 ops/sec ±9.63%|jsdom is 18.6 times faster. patched-jsdom took 0.009msec.|
|matches('.container:not(.box)')|1,103,421 ops/sec ±0.13%|75,746 ops/sec ±0.14%|jsdom is 14.6 times faster. patched-jsdom took 0.013msec.|
|matches('.box + .box')|2,023,891 ops/sec ±0.36%|106,495 ops/sec ±1.39%|jsdom is 19.0 times faster. patched-jsdom took 0.009msec.|
|matches('.box ~ .box')|2,013,003 ops/sec ±0.21%|110,622 ops/sec ±0.14%|jsdom is 18.2 times faster. patched-jsdom took 0.009msec.|
|matches('.box > .block')|1,969,215 ops/sec ±0.28%|110,591 ops/sec ±0.13%|jsdom is 17.8 times faster. patched-jsdom took 0.009msec.|
|matches('.box .content')|300,820 ops/sec ±0.23%|53,400 ops/sec ±1.03%|jsdom is 5.6 times faster. patched-jsdom took 0.019msec.|
|matches('.box:first-child ~ .box:nth-of-type(4n+1) + .box .block.inner > .content')|132,861 ops/sec ±0.18%|10,889 ops/sec ±3.40%|jsdom is 12.2 times faster. patched-jsdom took 0.092msec.|
|matches('.box:first-child ~ .box:nth-of-type(4n+1) + .box .block.inner:has(> .content)')|N/A|35,323 ops/sec ±0.22%|jsdom throws. patched-jsdom took 0.028msec.|
|closest('.container.box')|393,527 ops/sec ±0.13%|51,058 ops/sec ±0.14%|jsdom is 7.7 times faster. patched-jsdom took 0.020msec.|
|closest('.container:not(.box)')|217,890 ops/sec ±4.31%|32,496 ops/sec ±6.77%|jsdom is 6.7 times faster. patched-jsdom took 0.031msec.|
|closest('.box + .box')|346,812 ops/sec ±2.50%|50,913 ops/sec ±0.13%|jsdom is 6.8 times faster. patched-jsdom took 0.020msec.|
|closest('.box ~ .box')|141,015 ops/sec ±0.14%|29,432 ops/sec ±0.14%|jsdom is 4.8 times faster. patched-jsdom took 0.034msec.|
|closest('.box > .block')|390,585 ops/sec ±0.12%|47,152 ops/sec ±1.52%|jsdom is 8.3 times faster. patched-jsdom took 0.021msec.|
|closest('.box .content')|292,276 ops/sec ±1.48%|37,460 ops/sec ±1.93%|jsdom is 7.8 times faster. patched-jsdom took 0.027msec.|
|closest('.box:first-child ~ .box:nth-of-type(4n+1) + .box .block.inner > .content')|121,479 ops/sec ±1.97%|9,877 ops/sec ±1.68%|jsdom is 12.3 times faster. patched-jsdom took 0.101msec.|
|closest('.box:first-child ~ .box:nth-of-type(4n+1) + .box .block.inner:has(> .content)')|N/A|8,379 ops/sec ±0.65%|jsdom throws. patched-jsdom took 0.119msec.|
|querySelector('.container.box')|80,132 ops/sec ±1.31%|23,699 ops/sec ±1.43%|jsdom is 3.4 times faster. patched-jsdom took 0.042msec.|
|querySelector('.container:not(.box)')|69,928 ops/sec ±1.42%|17,739 ops/sec ±1.21%|jsdom is 3.9 times faster. patched-jsdom took 0.056msec.|
|querySelector('.box + .box')|65,958 ops/sec ±1.35%|18,716 ops/sec ±1.41%|jsdom is 3.5 times faster. patched-jsdom took 0.053msec.|
|jsdom querySelector('.box ~ .box')|67,535 ops/sec ±1.53%|8,419 ops/sec ±1.24%|jsdom is 8.0 times faster. patched-jsdom took 0.119msec.|
|querySelector('.box > .block')|1,039 ops/sec ±1.61%|2,782 ops/sec ±0.84%|patched-jsdom is 2.7 times faster. patched-jsdom took 0.359msec.|
|querySelector('.box .content')|492 ops/sec ±1.52%|259 ops/sec ±1.19%|jsdom is 1.9 times faster. patched-jsdom took 3.867msec.|
|querySelector('.box:first-child ~ .box:nth-of-type(4n+1) + .box .block.inner > .content')|202 ops/sec ±1.21%|430 ops/sec ±0.86%|patched-jsdom is 2.1 times faster. patched-jsdom took 2.323msec.|
|querySelector('.box:first-child ~ .box:nth-of-type(4n+1) + .box .block.inner:has(> .content)')|N/A|366 ops/sec ±1.41%|jsdom throws. patched-jsdom took 2.730msec.|
|querySelectorAll('.container.box')|92,026 ops/sec ±0.12%|20,885 ops/sec ±0.15%|jsdom is 4.4 times faster. patched-jsdom took 0.048msec.|
|querySelectorAll('.container:not(.box)')|81,439 ops/sec ±1.22%|16,083 ops/sec ±1.86%|jsdom is 5.1 times faster. patched-jsdom took 0.062msec.|
|querySelectorAll('.box + .box')|80,091 ops/sec ±1.29%|18,897 ops/sec ±0.09%|jsdom is 4.2 times faster. patched-jsdom took 0.053msec.|
|querySelectorAll('.box ~ .box')|80,555 ops/sec ±0.11%|8,200 ops/sec ±1.90%|jsdom is 9.8 times faster. patched-jsdom took 0.122msec.|
|jsdom querySelectorAll('.box > .block')|937 ops/sec ±1.40%|2,378 ops/sec ±0.97%|patched-jsdom is 2.5 times faster. patched-jsdom took 0.421msec.|
|querySelectorAll('.box .content')|480 ops/sec ±1.08%|240 ops/sec ±1.03%|jsdom is 2.0 times faster. patched-jsdom took 4.160msec.|
|querySelectorAll('.box:first-child ~ .box:nth-of-type(4n+1) + .box .block.inner > .content')|202 ops/sec ±1.25%|427 ops/sec ±0.86%|patched-jsdom is 2.1 times faster. patched-jsdom took 2.342msec.|
|querySelectorAll('.box:first-child ~ .box:nth-of-type(4n+1) + .box .block.inner:has(> .content)')|N/A|365 ops/sec ±0.81%|jsdom throws. patched-jsdom took 2.737msec.|


## Acknowledgments

The following resources have been of great help in the development of the DOM Selector.

- [CSSTree](https://github.com/csstree/csstree)
- [selery](https://github.com/danburzo/selery)


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
