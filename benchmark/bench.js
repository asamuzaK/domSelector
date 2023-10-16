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

const doctype = '<!doctype html>';
const html = '<html lang="en"><head></head><body></body></html>';
const { window } = new JSDOM(`${doctype}${html}`, {
  runScripts: 'dangerously',
  url: 'http://localhost'
});
const { XMLSerializer, document } = window;

/* create dom */
const x = 10;
const y = 10;
const z = 10;
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
    for (let k = 0; k < z; k++) {
      const zNode = document.createElement('div');
      zNode.id = `div${i}-${j}-${k}`;
      zNode.classList.add('div');
      zNode.classList.add('inner');
      zNode.textContent = `${i}-${j}-${k}`;
      yNode.append(zNode);
    }
    yFrag.append(yNode);
  }
  xNode.append(yFrag);
  xyFrag.append(xNode);
}

const container = document.createElement('div');
container.setAttribute('id', 'container');
container.classList.add('container');
container.append(xyFrag);
document.body.append(container);

const docDiv = document.getElementById(`div${x - 1}-${y - 1}-${z - 1}`);

const fragment = document.createDocumentFragment();
fragment.append(container.cloneNode(true));
const fragDiv = fragment.getElementById(`div${x - 1}-${y - 1}-${z - 1}`);

const element = document.createElement('div');
element.append(container.cloneNode(true));
const elmIterator = document.createNodeIterator(element, 1);
let elmNode = elmIterator.nextNode();
let elmDiv;
while (elmNode) {
  if (elmNode.id === `div${x - 1}-${y - 1}-${z - 1}`) {
    elmDiv = elmNode;
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

const domDiv = domDoc.getElementById(`div${x - 1}-${y - 1}-${z - 1}`);
const domContainer = domDoc.getElementById('container');

const domFrag = domDoc.createDocumentFragment();
domFrag.append(domContainer.cloneNode(true));
const domFragDiv = domFrag.getElementById(`div${x - 1}-${y - 1}-${z - 1}`);

const domElm = domDoc.createElement('div');
domElm.append(domContainer.cloneNode(true));
const domElmIterator = domDoc.createNodeIterator(domElm, 1);
let domElmNode = domElmIterator.nextNode();
let domElmDiv;
while (domElmNode) {
  if (domElmNode.id === `div${x - 1}-${y - 1}-${z - 1}`) {
    domElmDiv = domElmNode;
    break;
  }
  domElmNode = domElmIterator.nextNode();
}

/* selectors */
const selectors = [
  '.div.inner',
  '.div:not(.inner)',
  '.box > .div',
  '.box .div.inner',
  '.div.inner + .div',
  '.div.inner ~ .div',
  '.box + .box .div.inner'
];

/* matcher tests */
const elementMatches = (type, api, selector) => {
  let refPoint;
  switch (type) {
    case 'element': {
      if (api === 'jsdom') {
        refPoint = elmDiv;
      } else if (api === 'patched-jsdom') {
        refPoint = domElmDiv;
      }
      break;
    }
    case 'fragment': {
      if (api === 'jsdom') {
        refPoint = fragDiv;
      } else if (api === 'patched-jsdom') {
        refPoint = domFragDiv;
      }
      break;
    }
    case 'document':
    default: {
      if (api === 'jsdom') {
        refPoint = docDiv;
      } else if (api === 'patched-jsdom') {
        refPoint = domDiv;
      }
    }
  }
  refPoint.matches(selector);
};

const elementClosest = (type, api, selector) => {
  let refPoint;
  switch (type) {
    case 'element': {
      if (api === 'jsdom') {
        refPoint = elmDiv;
      } else if (api === 'patched-jsdom') {
        refPoint = domElmDiv;
      }
      break;
    }
    case 'fragment': {
      if (api === 'jsdom') {
        refPoint = fragDiv;
      } else if (api === 'patched-jsdom') {
        refPoint = domFragDiv;
      }
      break;
    }
    case 'document':
    default: {
      if (api === 'jsdom') {
        refPoint = docDiv;
      } else if (api === 'patched-jsdom') {
        refPoint = domDiv;
      }
    }
  }
  refPoint.closest(selector);
};

const refPointQuerySelector = (type, api, selector) => {
  let refPoint;
  switch (type) {
    case 'element': {
      if (api === 'jsdom') {
        refPoint = element;
      } else if (api === 'patched-jsdom') {
        refPoint = domElm;
      }
      break;
    }
    case 'fragment': {
      if (api === 'jsdom') {
        refPoint = fragment;
      } else if (api === 'patched-jsdom') {
        refPoint = domFrag;
      }
      break;
    }
    case 'document':
    default: {
      if (api === 'jsdom') {
        refPoint = document;
      } else if (api === 'patched-jsdom') {
        refPoint = domDoc;
      }
    }
  }
  refPoint.querySelector(selector);
};

const refPointQuerySelectorAll = (type, api, selector) => {
  let refPoint;
  switch (type) {
    case 'element': {
      if (api === 'jsdom') {
        refPoint = element;
      } else if (api === 'patched-jsdom') {
        refPoint = domElm;
      }
      break;
    }
    case 'fragment': {
      if (api === 'jsdom') {
        refPoint = fragment;
      } else if (api === 'patched-jsdom') {
        refPoint = domFrag;
      }
      break;
    }
    case 'document':
    default: {
      if (api === 'jsdom') {
        refPoint = document;
      } else if (api === 'patched-jsdom') {
        refPoint = domDoc;
      }
    }
  }
  refPoint.querySelectorAll(selector);
};

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
}).add(`jsdom matches - document - ${selectors[0]}`, () => {
  elementMatches('document', 'jsdom', selectors[0]);
}).add(`patched-jsdom matches - document - ${selectors[0]}`, () => {
  elementMatches('document', 'patched-jsdom', selectors[0]);
}).add(`jsdom matches - document - ${selectors[1]}`, () => {
  elementMatches('document', 'jsdom', selectors[1]);
}).add(`patched-jsdom matches - document - ${selectors[1]}`, () => {
  elementMatches('document', 'patched-jsdom', selectors[1]);
}).add(`jsdom matches - document - ${selectors[2]}`, () => {
  elementMatches('document', 'jsdom', selectors[2]);
}).add(`patched-jsdom matches - document - ${selectors[2]}`, () => {
  elementMatches('document', 'patched-jsdom', selectors[2]);
}).add(`jsdom matches - document - ${selectors[3]}`, () => {
  elementMatches('document', 'jsdom', selectors[3]);
}).add(`patched-jsdom matches - document - ${selectors[3]}`, () => {
  elementMatches('document', 'patched-jsdom', selectors[3]);
}).add(`jsdom matches - document - ${selectors[4]}`, () => {
  elementMatches('document', 'jsdom', selectors[4]);
}).add(`patched-jsdom matches - document - ${selectors[4]}`, () => {
  elementMatches('document', 'patched-jsdom', selectors[4]);
}).add(`jsdom matches - document - ${selectors[5]}`, () => {
  elementMatches('document', 'jsdom', selectors[5]);
}).add(`patched-jsdom matches - document - ${selectors[5]}`, () => {
  elementMatches('document', 'patched-jsdom', selectors[5]);
}).add(`jsdom matches - document - ${selectors[6]}`, () => {
  elementMatches('document', 'jsdom', selectors[6]);
}).add(`patched-jsdom matches - document - ${selectors[6]}`, () => {
  elementMatches('document', 'patched-jsdom', selectors[6]);
}).add(`jsdom matches - fragment - ${selectors[6]}`, () => {
  elementMatches('fragment', 'jsdom', selectors[6]);
}).add(`patched-jsdom matches - fragment - ${selectors[6]}`, () => {
  elementMatches('fragment', 'patched-jsdom', selectors[6]);
}).add(`jsdom matches - element - ${selectors[6]}`, () => {
  elementMatches('element', 'jsdom', selectors[6]);
}).add(`patched-jsdom matches - element - ${selectors[6]}`, () => {
  elementMatches('element', 'patched-jsdom', selectors[6]);
}).add(`jsdom closest - document - ${selectors[0]}`, () => {
  elementClosest('document', 'jsdom', selectors[0]);
}).add(`patched-jsdom closest - document - ${selectors[0]}`, () => {
  elementClosest('document', 'patched-jsdom', selectors[0]);
}).add(`jsdom closest - document - ${selectors[1]}`, () => {
  elementClosest('document', 'jsdom', selectors[1]);
}).add(`patched-jsdom closest - document - ${selectors[1]}`, () => {
  elementClosest('document', 'patched-jsdom', selectors[1]);
}).add(`jsdom closest - document - ${selectors[2]}`, () => {
  elementClosest('document', 'jsdom', selectors[2]);
}).add(`patched-jsdom closest - document - ${selectors[2]}`, () => {
  elementClosest('document', 'patched-jsdom', selectors[2]);
}).add(`jsdom closest - document - ${selectors[3]}`, () => {
  elementClosest('document', 'jsdom', selectors[3]);
}).add(`patched-jsdom closest - document - ${selectors[3]}`, () => {
  elementClosest('document', 'patched-jsdom', selectors[3]);
}).add(`jsdom closest - document - ${selectors[4]}`, () => {
  elementClosest('document', 'jsdom', selectors[4]);
}).add(`patched-jsdom closest - document - ${selectors[4]}`, () => {
  elementClosest('document', 'patched-jsdom', selectors[4]);
}).add(`jsdom closest - document - ${selectors[5]}`, () => {
  elementClosest('document', 'jsdom', selectors[5]);
}).add(`patched-jsdom closest - document - ${selectors[5]}`, () => {
  elementClosest('document', 'patched-jsdom', selectors[5]);
}).add(`jsdom closest - document - ${selectors[6]}`, () => {
  elementClosest('document', 'jsdom', selectors[6]);
}).add(`patched-jsdom closest - document - ${selectors[6]}`, () => {
  elementClosest('document', 'patched-jsdom', selectors[6]);
}).add(`jsdom closest - fragment - ${selectors[6]}`, () => {
  elementClosest('fragment', 'jsdom', selectors[6]);
}).add(`patched-jsdom closest - fragment - ${selectors[6]}`, () => {
  elementClosest('fragment', 'patched-jsdom', selectors[6]);
}).add(`jsdom closest - element - ${selectors[6]}`, () => {
  elementClosest('element', 'jsdom', selectors[6]);
}).add(`patched-jsdom closest - element - ${selectors[6]}`, () => {
  elementClosest('element', 'patched-jsdom', selectors[6]);
}).add(`jsdom querySelector - document - ${selectors[0]}`, () => {
  refPointQuerySelector('document', 'jsdom', selectors[0]);
}).add(`patched-jsdom querySelector - document - ${selectors[0]}`, () => {
  refPointQuerySelector('document', 'patched-jsdom', selectors[0]);
}).add(`jsdom querySelector - document - ${selectors[1]}`, () => {
  refPointQuerySelector('document', 'jsdom', selectors[1]);
}).add(`patched-jsdom querySelector - document - ${selectors[1]}`, () => {
  refPointQuerySelector('document', 'patched-jsdom', selectors[1]);
}).add(`jsdom querySelector - document - ${selectors[2]}`, () => {
  refPointQuerySelector('document', 'jsdom', selectors[2]);
}).add(`patched-jsdom querySelector - document - ${selectors[2]}`, () => {
  refPointQuerySelector('document', 'patched-jsdom', selectors[2]);
}).add(`jsdom querySelector - document - ${selectors[3]}`, () => {
  refPointQuerySelector('document', 'jsdom', selectors[3]);
}).add(`patched-jsdom querySelector - document - ${selectors[3]}`, () => {
  refPointQuerySelector('document', 'patched-jsdom', selectors[3]);
}).add(`jsdom querySelector - document - ${selectors[4]}`, () => {
  refPointQuerySelector('document', 'jsdom', selectors[4]);
}).add(`patched-jsdom querySelector - document - ${selectors[4]}`, () => {
  refPointQuerySelector('document', 'patched-jsdom', selectors[4]);
}).add(`jsdom querySelector - document - ${selectors[5]}`, () => {
  refPointQuerySelector('document', 'jsdom', selectors[5]);
}).add(`patched-jsdom querySelector - document - ${selectors[5]}`, () => {
  refPointQuerySelector('document', 'patched-jsdom', selectors[5]);
}).add(`jsdom querySelector - document - ${selectors[6]}`, () => {
  refPointQuerySelector('document', 'jsdom', selectors[6]);
}).add(`patched-jsdom querySelector - document - ${selectors[6]}`, () => {
  refPointQuerySelector('document', 'patched-jsdom', selectors[6]);
}).add(`jsdom querySelector - fragment - ${selectors[6]}`, () => {
  refPointQuerySelector('fragment', 'jsdom', selectors[6]);
}).add(`patched-jsdom querySelector - fragment - ${selectors[6]}`, () => {
  refPointQuerySelector('fragment', 'patched-jsdom', selectors[6]);
}).add(`jsdom querySelector - element - ${selectors[6]}`, () => {
  refPointQuerySelector('element', 'jsdom', selectors[6]);
}).add(`patched-jsdom querySelector - element - ${selectors[6]}`, () => {
  refPointQuerySelector('element', 'patched-jsdom', selectors[6]);
}).add(`jsdom querySelectorAll - document - ${selectors[0]}`, () => {
  refPointQuerySelectorAll('document', 'jsdom', selectors[0]);
}).add(`patched-jsdom querySelectorAll - document - ${selectors[0]}`, () => {
  refPointQuerySelectorAll('document', 'patched-jsdom', selectors[0]);
}).add(`jsdom querySelectorAll - document - ${selectors[1]}`, () => {
  refPointQuerySelectorAll('document', 'jsdom', selectors[1]);
}).add(`patched-jsdom querySelectorAll - document - ${selectors[1]}`, () => {
  refPointQuerySelectorAll('document', 'patched-jsdom', selectors[1]);
}).add(`jsdom querySelectorAll - document - ${selectors[2]}`, () => {
  refPointQuerySelectorAll('document', 'jsdom', selectors[2]);
}).add(`patched-jsdom querySelectorAll - document - ${selectors[2]}`, () => {
  refPointQuerySelectorAll('document', 'patched-jsdom', selectors[2]);
}).add(`jsdom querySelectorAll - document - ${selectors[3]}`, () => {
  refPointQuerySelectorAll('document', 'jsdom', selectors[3]);
}).add(`patched-jsdom querySelectorAll - document - ${selectors[3]}`, () => {
  refPointQuerySelectorAll('document', 'patched-jsdom', selectors[3]);
}).add(`jsdom querySelectorAll - document - ${selectors[4]}`, () => {
  refPointQuerySelectorAll('document', 'jsdom', selectors[4]);
}).add(`patched-jsdom querySelectorAll - document - ${selectors[4]}`, () => {
  refPointQuerySelectorAll('document', 'patched-jsdom', selectors[4]);
}).add(`jsdom querySelectorAll - document - ${selectors[5]}`, () => {
  refPointQuerySelectorAll('document', 'jsdom', selectors[5]);
}).add(`patched-jsdom querySelectorAll - document - ${selectors[5]}`, () => {
  refPointQuerySelectorAll('document', 'patched-jsdom', selectors[5]);
}).add(`jsdom querySelectorAll - document - ${selectors[6]}`, () => {
  refPointQuerySelectorAll('document', 'jsdom', selectors[6]);
}).add(`patched-jsdom querySelectorAll - document - ${selectors[6]}`, () => {
  refPointQuerySelectorAll('document', 'patched-jsdom', selectors[6]);
}).add(`jsdom querySelectorAll - fragment - ${selectors[6]}`, () => {
  refPointQuerySelectorAll('fragment', 'jsdom', selectors[6]);
}).add(`patched-jsdom querySelectorAll - fragment - ${selectors[6]}`, () => {
  refPointQuerySelectorAll('fragment', 'patched-jsdom', selectors[6]);
}).add(`jsdom querySelectorAll - element - ${selectors[6]}`, () => {
  refPointQuerySelectorAll('element', 'jsdom', selectors[6]);
}).add(`patched-jsdom querySelectorAll - element - ${selectors[6]}`, () => {
  refPointQuerySelectorAll('element', 'patched-jsdom', selectors[6]);
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
