/**
 * bench.js
 */

/* import */
import { promises as fsPromise } from 'node:fs';
import path from 'node:path';
import Benchmark from 'benchmark';
import { JSDOM } from 'jsdom';
import {
  closest, matches, querySelector, querySelectorAll
} from '../src/index.js';

const { window } = new JSDOM('', {
  runScripts: 'dangerously',
  url: 'http://localhost'
});
const { XMLSerializer, document } = window;

/* create dom */
const x = 16;
const y = 16;
const xyFrag = document.createDocumentFragment();
for (let i = 0; i < x; i++) {
  const xNode = document.createElement('div');
  xNode.id = `box${i}`;
  xNode.classList.add('box');
  const yFrag = document.createDocumentFragment();
  for (let j = 0; j < y; j++) {
    const yNode = document.createElement('div');
    yNode.id = `div${i}-${j}`;
    yNode.classList.add('div');
    yNode.textContent = `${i}-${j}`;
    yFrag.append(yNode);
  }
  xNode.append(yFrag);
  xyFrag.append(xNode);
}

const container = document.createElement('div');
container.setAttribute('id', 'container');
container.classList.add('box-container');
container.append(xyFrag);
document.body.append(container);

const docBox = document.getElementById(`box${x - 1}`);
const docDiv = document.getElementById(`div${x - 1}-${y - 1}`);

const fragment = document.createDocumentFragment();
fragment.append(container.cloneNode(true));
const fragBox = fragment.getElementById(`box${x - 1}`);
const fragDiv = fragment.getElementById(`div${x - 1}-${y - 1}`);

const element = document.createElement('div');
element.append(container.cloneNode(true));
const elmIterator = document.createNodeIterator(element, 1);
let elmNode = elmIterator.nextNode();
let elmBox, elmDiv;
while (elmNode) {
  if (elmNode.id === `box${x - 1}`) {
    elmBox = elmNode;
  } else if (elmNode.id === `div${x - 1}-${y - 1}`) {
    elmDiv = elmNode;
  }
  if (elmBox && elmDiv) {
    break;
  }
  elmNode = elmIterator.nextNode();
}

/* create patched dom */
const domstr = new XMLSerializer().serializeToString(document);
const { window: domWin } = new JSDOM(domstr, {
  runScripts: 'dangerously',
  url: 'http://localhost',
  beforeParse: window => {
    window.Element.prototype.matches = function (selector) {
      return matches(selector, this);
    };
    window.Element.prototype.closest = function (selector) {
      return closest(selector, this);
    };
    window.Document.prototype.querySelector = function (selector) {
      return querySelector(selector, this);
    };
    window.DocumentFragment.prototype.querySelector = function (selector) {
      return querySelector(selector, this);
    };
    window.Element.prototype.querySelector = function (selector) {
      return querySelector(selector, this);
    };
    window.Document.prototype.querySelectorAll = function (selector) {
      return querySelectorAll(selector, this);
    };
    window.DocumentFragment.prototype.querySelectorAll = function (selector) {
      return querySelectorAll(selector, this);
    };
    window.Element.prototype.querySelectorAll = function (selector) {
      return querySelectorAll(selector, this);
    };
  }
});
const { document: domDoc } = domWin;

const domBox = domDoc.getElementById(`box${x - 1}`);
const domDiv = domDoc.getElementById(`div${x - 1}-${y - 1}`);
const domContainer = domDoc.getElementById('container');

const domFrag = domDoc.createDocumentFragment();
domFrag.append(domContainer.cloneNode(true));
const domFragBox = domFrag.getElementById(`box${x - 1}`);
const domFragDiv = domFrag.getElementById(`div${x - 1}-${y - 1}`);

const domElm = domDoc.createElement('div');
domElm.append(domContainer.cloneNode(true));
const domElmIterator = domDoc.createNodeIterator(domElm, 1);
let domElmNode = domElmIterator.nextNode();
let domElmBox, domElmDiv;
while (domElmNode) {
  if (domElmNode.id === `box${x - 1}`) {
    domElmBox = domElmNode;
  } else if (domElmNode.id === `div${x - 1}-${y - 1}`) {
    domElmDiv = domElmNode;
  }
  if (domElmBox && domElmDiv) {
    break;
  }
  domElmNode = domElmIterator.nextNode();
}

/* matcher tests */
const elementMatches = (type, api, selector) => {
  let box;
  let div;
  let patchedBox;
  let patchedDiv;
  switch (type) {
    case 'document': {
      box = docBox;
      div = docDiv;
      patchedBox = domBox;
      patchedDiv = domDiv;
      break;
    }
    case 'fragment': {
      box = fragBox;
      div = fragDiv;
      patchedBox = domFragBox;
      patchedDiv = domFragDiv;
      break;
    }
    case 'element':
    default: {
      box = elmBox;
      div = elmDiv;
      patchedBox = domElmBox;
      patchedDiv = domElmDiv;
    }
  }
  const [key, value] = selector;
  if (api === 'jsdom') {
    if (value === 'box') {
      box.matches(key);
    } else if (value === 'div') {
      div.matches(key);
    }
  } else if (api === 'patched-jsdom') {
    if (value === 'box') {
      patchedBox.matches(key);
    } else if (value === 'div') {
      patchedDiv.matches(key);
    }
  }
};

const elementClosest = (type, api, selector) => {
  let box;
  let div;
  let patchedBox;
  let patchedDiv;
  switch (type) {
    case 'document': {
      box = docBox;
      div = docDiv;
      patchedBox = domBox;
      patchedDiv = domDiv;
      break;
    }
    case 'fragment': {
      box = fragBox;
      div = fragDiv;
      patchedBox = domFragBox;
      patchedDiv = domFragDiv;
      break;
    }
    case 'element':
    default: {
      box = elmBox;
      div = elmDiv;
      patchedBox = domElmBox;
      patchedDiv = domElmDiv;
    }
  }
  const [key, value] = selector;
  if (api === 'jsdom') {
    if (value === 'box') {
      box.closest(key);
    } else if (value === 'div') {
      div.closest(key);
    }
  } else if (api === 'patched-jsdom') {
    if (value === 'box') {
      patchedBox.closest(key);
    } else if (value === 'div') {
      patchedDiv.closest(key);
    }
  }
};

const refPointQuerySelector = (type, api, selector) => {
  let refPoint;
  let patchedRefPoint;
  switch (type) {
    case 'document': {
      refPoint = document;
      patchedRefPoint = domDoc;
      break;
    }
    case 'fragment': {
      refPoint = fragment;
      patchedRefPoint = domFrag;
      break;
    }
    case 'element':
    default: {
      refPoint = element;
      patchedRefPoint = domElm;
    }
  }
  const [key] = selector;
  if (api === 'jsdom') {
    refPoint.querySelector(key);
  } else if (api === 'patched-jsdom') {
    patchedRefPoint.querySelector(key);
  }
};

const refPointQuerySelectorAll = (type, api, selector) => {
  let refPoint;
  let patchedRefPoint;
  switch (type) {
    case 'document': {
      refPoint = document;
      patchedRefPoint = domDoc;
      break;
    }
    case 'fragment': {
      refPoint = fragment;
      patchedRefPoint = domFrag;
      break;
    }
    case 'element':
    default: {
      refPoint = element;
      patchedRefPoint = domElm;
    }
  }
  const [key] = selector;
  if (api === 'jsdom') {
    refPoint.querySelectorAll(key);
  } else if (api === 'patched-jsdom') {
    patchedRefPoint.querySelectorAll(key);
  }
};

/* selector items */
const selectorItems = [
  ['.div', 'div'],
  ['.box:nth-child(2n+1)', 'box'],
  ['.box .div', 'div'],
  ['.box ~ .box', 'box'],
  ['.box:first-child ~ .box .div', 'div']
];

/* benchmark */
const suite = new Benchmark.Suite();

suite.on('start', async () => {
  const filePath = path.resolve('./package.json');
  const value = await fsPromise.readFile(filePath, {
    encoding: 'utf8',
    flag: 'r'
  });
  const { name: pkgName, version } = JSON.parse(value);
  console.log(`benchmark ${pkgName} v${version}`);
}).add('jsdom matches - document - 0', () => {
  elementMatches('document', 'jsdom', selectorItems[0]);
}).add('patched-jsdom matches - document - 0', () => {
  elementMatches('document', 'patched-jsdom', selectorItems[0]);
}).add('jsdom matches - document - 1', () => {
  elementMatches('document', 'jsdom', selectorItems[1]);
}).add('patched-jsdom matches - document - 1', () => {
  elementMatches('document', 'patched-jsdom', selectorItems[1]);
}).add('jsdom matches - document - 2', () => {
  elementMatches('document', 'jsdom', selectorItems[2]);
}).add('patched-jsdom matches - document - 2', () => {
  elementMatches('document', 'patched-jsdom', selectorItems[2]);
}).add('jsdom matches - document - 3', () => {
  elementMatches('document', 'jsdom', selectorItems[3]);
}).add('patched-jsdom matches - document - 3', () => {
  elementMatches('document', 'patched-jsdom', selectorItems[3]);
}).add('jsdom matches - document - 4', () => {
  elementMatches('document', 'jsdom', selectorItems[4]);
}).add('patched-jsdom matches - document - 4', () => {
  elementMatches('document', 'patched-jsdom', selectorItems[4]);
}).add('jsdom matches - fragment - 4', () => {
  elementMatches('fragment', 'jsdom', selectorItems[4]);
}).add('patched-jsdom matches - fragment - 4', () => {
  elementMatches('fragment', 'patched-jsdom', selectorItems[4]);
}).add('jsdom matches - element - 4', () => {
  elementMatches('element', 'jsdom', selectorItems[4]);
}).add('patched-jsdom matches - element - 4', () => {
  elementMatches('element', 'patched-jsdom', selectorItems[4]);
}).add('jsdom closest - document - 0', () => {
  elementClosest('document', 'jsdom', selectorItems[0]);
}).add('patched-jsdom closest - document - 0', () => {
  elementClosest('document', 'patched-jsdom', selectorItems[0]);
}).add('jsdom closest - document - 1', () => {
  elementClosest('document', 'jsdom', selectorItems[1]);
}).add('patched-jsdom closest - document - 1', () => {
  elementClosest('document', 'patched-jsdom', selectorItems[1]);
}).add('jsdom closest - document - 2', () => {
  elementClosest('document', 'jsdom', selectorItems[2]);
}).add('patched-jsdom closest - document - 2', () => {
  elementClosest('document', 'patched-jsdom', selectorItems[2]);
}).add('jsdom closest - document - 3', () => {
  elementClosest('document', 'jsdom', selectorItems[3]);
}).add('patched-jsdom closest - document - 3', () => {
  elementClosest('document', 'patched-jsdom', selectorItems[3]);
}).add('jsdom closest - document - 4', () => {
  elementClosest('document', 'jsdom', selectorItems[4]);
}).add('patched-jsdom closest - document - 4', () => {
  elementClosest('document', 'patched-jsdom', selectorItems[4]);
}).add('jsdom closest - fragment - 4', () => {
  elementClosest('fragment', 'jsdom', selectorItems[4]);
}).add('patched-jsdom closest - fragment - 4', () => {
  elementClosest('fragment', 'patched-jsdom', selectorItems[4]);
}).add('jsdom closest - element - 4', () => {
  elementClosest('element', 'jsdom', selectorItems[4]);
}).add('patched-jsdom closest - element - 4', () => {
  elementClosest('element', 'patched-jsdom', selectorItems[4]);
}).add('jsdom querySelector - document - 0', () => {
  refPointQuerySelector('document', 'jsdom', selectorItems[0]);
}).add('patched-jsdom querySelector - document - 0', () => {
  refPointQuerySelector('document', 'patched-jsdom', selectorItems[0]);
}).add('jsdom querySelector - document - 1', () => {
  refPointQuerySelector('document', 'jsdom', selectorItems[1]);
}).add('patched-jsdom querySelector - document - 1', () => {
  refPointQuerySelector('document', 'patched-jsdom', selectorItems[1]);
}).add('jsdom querySelector - document - 2', () => {
  refPointQuerySelector('document', 'jsdom', selectorItems[2]);
}).add('patched-jsdom querySelector - document - 2', () => {
  refPointQuerySelector('document', 'patched-jsdom', selectorItems[2]);
}).add('jsdom querySelector - document - 3', () => {
  refPointQuerySelector('document', 'jsdom', selectorItems[3]);
}).add('patched-jsdom querySelector - document - 3', () => {
  refPointQuerySelector('document', 'patched-jsdom', selectorItems[3]);
}).add('jsdom querySelector - document - 4', () => {
  refPointQuerySelector('document', 'jsdom', selectorItems[4]);
}).add('patched-jsdom querySelector - document - 4', () => {
  refPointQuerySelector('document', 'patched-jsdom', selectorItems[4]);
}).add('jsdom querySelector - fragment - 4', () => {
  refPointQuerySelector('fragment', 'jsdom', selectorItems[4]);
}).add('patched-jsdom querySelector - fragment - 4', () => {
  refPointQuerySelector('fragment', 'patched-jsdom', selectorItems[4]);
}).add('jsdom querySelector - element - 4', () => {
  refPointQuerySelector('element', 'jsdom', selectorItems[4]);
}).add('patched-jsdom querySelector - element - 4', () => {
  refPointQuerySelector('element', 'patched-jsdom', selectorItems[4]);
}).add('jsdom querySelectorAll - document - 0', () => {
  refPointQuerySelectorAll('document', 'jsdom', selectorItems[0]);
}).add('patched-jsdom querySelectorAll - document - 0', () => {
  refPointQuerySelectorAll('document', 'patched-jsdom', selectorItems[0]);
}).add('jsdom querySelectorAll - document - 1', () => {
  refPointQuerySelectorAll('document', 'jsdom', selectorItems[1]);
}).add('patched-jsdom querySelectorAll - document - 1', () => {
  refPointQuerySelectorAll('document', 'patched-jsdom', selectorItems[1]);
}).add('jsdom querySelectorAll - document - 2', () => {
  refPointQuerySelectorAll('document', 'jsdom', selectorItems[2]);
}).add('patched-jsdom querySelectorAll - document - 2', () => {
  refPointQuerySelectorAll('document', 'patched-jsdom', selectorItems[2]);
}).add('jsdom querySelectorAll - document - 3', () => {
  refPointQuerySelectorAll('document', 'jsdom', selectorItems[3]);
}).add('patched-jsdom querySelectorAll - document - 3', () => {
  refPointQuerySelectorAll('document', 'patched-jsdom', selectorItems[3]);
}).add('jsdom querySelectorAll - document - 4', () => {
  refPointQuerySelectorAll('document', 'jsdom', selectorItems[4]);
}).add('patched-jsdom querySelectorAll - document - 4', () => {
  refPointQuerySelectorAll('document', 'patched-jsdom', selectorItems[4]);
}).add('jsdom querySelectorAll - fragment - 4', () => {
  refPointQuerySelectorAll('fragment', 'jsdom', selectorItems[4]);
}).add('patched-jsdom querySelectorAll - fragment - 4', () => {
  refPointQuerySelectorAll('fragment', 'patched-jsdom', selectorItems[4]);
}).add('jsdom querySelectorAll - element - 4', () => {
  refPointQuerySelectorAll('element', 'jsdom', selectorItems[4]);
}).add('patched-jsdom querySelectorAll - element - 4', () => {
  refPointQuerySelectorAll('element', 'patched-jsdom', selectorItems[4]);
}).on('cycle', evt => {
  const str = String(evt.target);
  if (str.startsWith('jsdom')) {
    console.log(`\n* ${str}`);
  } else {
    console.log(`* ${str}`);
  }
}).run({
  async: true
});
