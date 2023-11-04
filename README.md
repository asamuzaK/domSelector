# DOM Selector

[![build](https://github.com/asamuzaK/domSelector/actions/workflows/node.js.yml/badge.svg)](https://github.com/asamuzaK/domSelector/actions/workflows/node.js.yml)
[![CodeQL](https://github.com/asamuzaK/domSelector/actions/workflows/codeql.yml/badge.svg)](https://github.com/asamuzaK/domSelector/actions/workflows/codeql.yml)
[![npm (scoped)](https://img.shields.io/npm/v/@asamuzakjp/dom-selector)](https://www.npmjs.com/package/@asamuzakjp/dom-selector)

<!--
[![release](https://img.shields.io/github/v/release/asamuzaK/domSelector)](https://github.com/asamuzaK/domSelector/releases)
-->

Retrieve DOM node from the given CSS selector.  
**Experimental**

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


## Supported selectors

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
|E:lang(zh, "\*&#8209;hant")|✓|Quoted keys e.g. `:lang("*-Latn")` fails. It succeeds if escaped e.g. `:lang(\*-Latn)`.|
|E:any&#8209;link|✓| |
|E:link|✓| |
|E:visited|✓|Do not match to prevent fingerprinting.|
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
|E:default|Partially supported|&lt;option&gt; within &lt;select multiple&gt; is not supported.|
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

|Selector|Jsdom|Patched-jsdom|Result|
|:------------|:------------|:------------|:------------|
|matches('.container.box')|1,704,793 ops/sec ±2.10%|95,691 ops/sec ±2.40%|jsdom is 17.8 times faster. patched-jsdom took 0.010msec.|
|matches('.container:not(.box)')|906,712 ops/sec ±2.02%|57,603 ops/sec ±4.57%|jsdom is 15.7 times faster. patched-jsdom took 0.017msec.|
|matches('.box + .box')|1,566,175 ops/sec ±2.17%|90,759 ops/sec ±5.32%|jsdom is 17.3 times faster. patched-jsdom took 0.011msec.|
|matches('.box ~ .box')|1,585,314 ops/sec ±2.06%|90,257 ops/sec ±3.06%|jsdom is 17.6 times faster. patched-jsdom took 0.011msec.|
|matches('.box > .block')|830,259 ops/sec ±2.29%|79,630 ops/sec ±2.76%|jsdom is 10.4 times faster. patched-jsdom took 0.013msec.|
|matches('.box .content')|1,465,248 ops/sec ±2.74%|95,500 ops/sec ±2.36%|jsdom is 15.3 times faster. patched-jsdom took 0.010msec.|
|matches('.box:first-child ~ .box:nth-of-type(4n+1) + .box .block.inner > .content')|1,531,871 ops/sec ±2.68%|30,324 ops/sec ±3.09%|* jsdom is 50.5 times faster. patched-jsdom took 0.033msec.|
|closest('.container.box')|398,561 ops/sec ±2.74%|46,478 ops/sec ±2.31%|jsdom is 8.6 times faster. patched-jsdom took 0.022msec.|
|closest('.container:not(.box)')|220,109 ops/sec ±2.58%|28,449 ops/sec ±4.44%|jsdom is 7.7 times faster. patched-jsdom took 0.035msec.|
|closest('.box + .box')|355,897 ops/sec ±1.53%|43,752 ops/sec ±1.70%|jsdom is 8.1 times faster. patched-jsdom took 0.023msec.|
|closest('.box ~ .box')|124,255 ops/sec ±1.87%|25,663 ops/sec ±2.76%|jsdom is 4.8 times faster. patched-jsdom took 0.039msec.|
|closest('.box > .block')|387,622 ops/sec ±1.59%|40,747 ops/sec ±3.41%|jsdom is 9.5 times faster. patched-jsdom took 0.025msec.|
|closest('.box .content')|235,499 ops/sec ±2.42%|50,113 ops/sec ±2.81%|jsdom is 4.7 times faster. patched-jsdom took 0.020msec.|
|closest('.box:first-child ~ .box:nth-of-type(4n+1) + .box .block.inner > .content')|235,201 ops/sec ±2.80%|24,940 ops/sec ±2.26%|jsdom is 9.4 times faster. patched-jsdom took 0.040msec.|
|querySelector('.container.box')|59,348 ops/sec ±3.98%|20,617 ops/sec ±2.05%|jsdom is 2.9 times faster. patched-jsdom took 0.049msec.|
|querySelector('.container:not(.box)')|51,310 ops/sec ±2.61%|15,210 ops/sec ±1.42%|jsdom is 3.4 times faster. patched-jsdom took 0.066msec.|
|querySelector('.box + .box')|52,099 ops/sec ±1.32%|16,644 ops/sec ±1.21%|jsdom is 3.1 times faster. patched-jsdom took 0.060msec.|
|jsdom querySelector('.box ~ .box')|53,329 ops/sec ±2.51%|7,801 ops/sec ±2.10%|jsdom is 6.8 times faster. patched-jsdom took 0.128msec.|
|querySelector('.box > .block')|755 ops/sec ±2.34%|2,492 ops/sec ±1.13%|patched-jsdom is 3.3 times faster. patched-jsdom took 0.401msec.|
|querySelector('.box .content')|386 ops/sec ±2.96%|187 ops/sec ±1.12%|jsdom is 2.1 times faster. patched-jsdom took 5.359msec.|
| querySelector('.box:first-child ~ .box:nth-of-type(4n+1) + .box .block.inner > .content')|158 ops/sec ±2.40%|287 ops/sec ±2.03%|patched-jsdom is 1.8 times faster. patched-jsdom took 3.486msec.|
|querySelectorAll('.container.box')|73,206 ops/sec ±3.78%|19,290 ops/sec ±1.55%|jsdom is 3.8 times faster. patched-jsdom took 0.052msec.|
|querySelectorAll('.container:not(.box)')|65,761 ops/sec ±3.31%|14,269 ops/sec ±2.86%|jsdom is 4.6 times faster. patched-jsdom took 0.070msec.|
|querySelectorAll('.box + .box')|69,019 ops/sec ±1.54%|17,941 ops/sec ±1.48%|jsdom is 3.8 times faster. patched-jsdom took 0.056msec.|
|querySelectorAll('.box ~ .box')|64,329 ops/sec ±1.25%|7,748 ops/sec ±3.19%|jsdom is 8.3 times faster. patched-jsdom took 0.129msec.|
|jsdom querySelectorAll('.box > .block')|764 ops/sec ±1.90%|2,086 ops/sec ±1.49%|patched-jsdom is 2.7 times faster. patched-jsdom took 0.479msec.|
|querySelectorAll('.box .content')|370 ops/sec ±1.67%|165 ops/sec ±2.22%|jsdom is 2.3 times faster. patched-jsdom took 6.076msec.|
|querySelectorAll('.box:first-child ~ .box:nth-of-type(4n+1) + .box .block.inner > .content')|165 ops/sec ±1.13%|292 ops/sec ±1.79%|patched-jsdom is 1.8 times faster. patched-jsdom took 3.425msec.|


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
