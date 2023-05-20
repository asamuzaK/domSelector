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
const {
  matches, closest, querySelector, querySelectorAll
} = require('@asamuzakjp/dom-selector');
```

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### matches(selector, node, opt)

matches - [Element.matches()][64]

#### Parameters

- `selector` **[string][59]** CSS selector
- `node` **[object][60]** Element node
- `opt` **[object][60]?** options
  - `opt.globalObject` **[object][60]?** global object, e.g. `window`, `globalThis`
  - `opt.jsdom` **[boolean][61]?** is jsdom

Returns **[boolean][61]** result


### closest(selector, node, opt)

closest - [Element.closest()][65]

#### Parameters

- `selector` **[string][59]** CSS selector
- `node` **[object][60]** Element node
- `opt` **[object][60]?** options
  - `opt.globalObject` **[object][60]?** global object, e.g. `window`, `globalThis`
  - `opt.jsdom` **[boolean][61]?** is jsdom

Returns **[object][60]?** matched node


### querySelector(selector, refPoint, opt)

querySelector - [Document.querySelector()][66], [DocumentFragment.querySelector()][67], [Element.querySelector()][68]

#### Parameters

- `selector` **[string][59]** CSS selector
- `refPoint` **[object][60]** Document, DocumentFragment or Element node
- `opt` **[object][60]?** options
  - `opt.globalObject` **[object][60]?** global object, e.g. `window`, `globalThis`
  - `opt.jsdom` **[boolean][61]?** is jsdom

Returns **[object][60]?** matched node


### querySelectorAll(selector, refPoint, opt)

querySelectorAll - [Document.querySelectorAll()][69], [Document.querySelectorAll()][70], [Element.querySelectorAll()][71]
**NOTE**: returns Array, not NodeList

#### Parameters

- `selector` **[string][59]** CSS selector
- `refPoint` **[object][60]** Document, DocumentFragment or Element node
- `opt` **[object][60]?** options
  - `opt.globalObject` **[object][60]?** global object, e.g. `window`, `globalThis`
  - `opt.jsdom` **[boolean][61]?** is jsdom

Returns **[Array][62]&lt;([object][60] \| [undefined][63])>** array of matched nodes


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