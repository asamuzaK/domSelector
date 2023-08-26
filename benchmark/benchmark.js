/**
 * benchmark.js
 */
/* eslint-disable no-unused-vars */

/* import */
import { promises as fsPromise } from 'node:fs';
import path from 'node:path';
import Benchmark from 'benchmark';
import css2xpath from 'css2xpath';
import { JSDOM } from 'jsdom';
import { parseHTML } from 'linkedom';
import xpath from 'xpath';
import {
  closest, matches, querySelector, querySelectorAll
} from '../src/index.js';
import { parseSelector, walkAST } from '../src/js/parser.js';

const selector = '#foo * .bar > baz:not(:is(.qux, .quux)) + [corge] ~ .grault';

/* parser tests */
const parserParseSelector = () => {
  parseSelector(selector);
};

const parserWalkAST = () => {
  const ast = parseSelector(selector);
  walkAST(ast);
};

const {
  window
} = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
  runScripts: 'dangerously',
  url: 'http://localhost'
});

const document = window.document;
const x = 64;
const y = 64;
const xyFrag = document.createDocumentFragment();
for (let i = 0; i < x; i++) {
  const xNode = document.createElement('div');
  xNode.id = `box${i}`;
  xNode.classList.add('box');
  xyFrag.appendChild(xNode);
  const yFrag = document.createDocumentFragment();
  for (let j = 0; j < y; j++) {
    const yNode = document.createElement('div');
    yNode.id = `div${i}-${j}`;
    if (j === 0) {
      yFrag.appendChild(yNode);
    } else if (j === y - 1) {
      yNode.classList.add('div');
      yNode.textContent = `${i}-${j}`;
      yFrag.appendChild(yNode);
      xNode.appendChild(yFrag);
    } else {
      const parent = yFrag.getElementById(`div${i}-${j - 1}`);
      parent.appendChild(yNode);
    }
  }
}

const container = document.createElement('div');
container.classList.add('box-container');
container.appendChild(xyFrag);

const fragContainer = container.cloneNode(true);
const fragment = document.createDocumentFragment();
fragment.append(fragContainer);
const fragBox = fragment.getElementById(`box${x - 1}`);
const fragDiv = fragment.getElementById(`div${x - 1}-${y - 1}`);

const elmContainer = container.cloneNode(true);
document.body.append(elmContainer);
const elmBox = document.getElementById(`box${x - 1}`);
const elmDiv = document.getElementById(`div${x - 1}-${y - 1}`);
const elmRoot = document.createElement('div');
elmRoot.append(document.body.removeChild(elmContainer));

document.body.append(container);
const docBox = document.getElementById(`box${x - 1}`);
const docDiv = document.getElementById(`div${x - 1}-${y - 1}`);

/* patched jsdom */
const patchedDom =
  new JSDOM('<!doctype html><html><head></head><body></body></html>', {
    runScripts: 'dangerously',
    url: 'https://localhost/',
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

const patchedDoc = patchedDom.window.document;
const patchedXyFrag = patchedDoc.createDocumentFragment();
for (let i = 0; i < x; i++) {
  const xNode = patchedDoc.createElement('div');
  xNode.id = `box${i}`;
  xNode.classList.add('box');
  xyFrag.appendChild(xNode);
  const yFrag = patchedDoc.createDocumentFragment();
  for (let j = 0; j < y; j++) {
    const yNode = patchedDoc.createElement('div');
    yNode.id = `div${i}-${j}`;
    if (j === 0) {
      yFrag.appendChild(yNode);
    } else if (j === y - 1) {
      yNode.classList.add('div');
      yNode.textContent = `${i}-${j}`;
      yFrag.appendChild(yNode);
      xNode.appendChild(yFrag);
    } else {
      const parent = yFrag.getElementById(`div${i}-${j - 1}`);
      parent.appendChild(yNode);
    }
  }
}

const patchedContainer = patchedDoc.createElement('div');
patchedContainer.classList.add('box-container');
patchedContainer.appendChild(xyFrag);

const patchedFragContainer = patchedContainer.cloneNode(true);
const patchedFragment = patchedDoc.createDocumentFragment();
patchedFragment.append(patchedFragContainer);
const patchedFragBox = patchedFragment.getElementById(`box${x - 1}`);
const patchedFragDiv = patchedFragment.getElementById(`div${x - 1}-${y - 1}`);

const patchedElmContainer = patchedContainer.cloneNode(true);
patchedDoc.body.append(patchedElmContainer);
const patchedElmBox = patchedDoc.getElementById(`box${x - 1}`);
const patchedElmDiv = patchedDoc.getElementById(`div${x - 1}-${y - 1}`);
const patchedElmRoot = patchedDoc.createElement('div');
patchedElmRoot.append(patchedDoc.body.removeChild(patchedElmContainer));

patchedDoc.body.append(container);
const patchedDocBox = patchedDoc.getElementById(`box${x - 1}`);
const patchedDocDiv = patchedDoc.getElementById(`div${x - 1}-${y - 1}`);

/* linkeDOM */
const {
  document: linkeDoc
} = parseHTML('<!doctype html><html><head></head><body></body></html>');
Object.defineProperty(linkeDoc, 'documentURI', {
  value: 'http://localhost',
  writable: false
});
Object.defineProperty(linkeDoc, 'URL', {
  value: 'http://localhost',
  writable: false
});

const linkeXyFrag = linkeDoc.createDocumentFragment();
for (let i = 0; i < x; i++) {
  const xNode = linkeDoc.createElement('div');
  xNode.id = `box${i}`;
  xNode.classList.add('box');
  linkeXyFrag.appendChild(xNode);
  const yFrag = linkeDoc.createDocumentFragment();
  for (let j = 0; j < y; j++) {
    const yNode = linkeDoc.createElement('div');
    yNode.id = `div${i}-${j}`;
    if (j === 0) {
      yFrag.appendChild(yNode);
    } else if (j === y - 1) {
      yNode.classList.add('div');
      yNode.textContent = `${i}-${j}`;
      yFrag.appendChild(yNode);
      xNode.appendChild(yFrag);
    } else {
      const parent = yFrag.getElementById(`div${i}-${j - 1}`);
      parent.appendChild(yNode);
    }
  }
}

const linkeContainer = linkeDoc.createElement('div');
linkeContainer.classList.add('box-container');
linkeContainer.appendChild(linkeXyFrag);

const linkeFragContainer = linkeContainer.cloneNode(true);
const linkeFragment = linkeDoc.createDocumentFragment();
linkeFragment.append(linkeFragContainer);
const linkeFragBox = linkeFragment.getElementById(`box${x - 1}`);
const linkeFragDiv = linkeFragment.getElementById(`div${x - 1}-${y - 1}`);

const linkElmContainer = linkeContainer.cloneNode(true);
linkeDoc.body.append(linkElmContainer);
const linkeElmBox = linkeDoc.getElementById(`box${x - 1}`);
const linkeElmDiv = linkeDoc.getElementById(`div${x - 1}-${y - 1}`);
const linkeElmRoot = linkeDoc.createElement('div');
linkeElmRoot.append(linkeDoc.body.removeChild(linkElmContainer));

linkeDoc.body.append(linkeContainer);
const linkeDocBox = linkeDoc.getElementById(`box${x - 1}`);
const linkeDocDiv = linkeDoc.getElementById(`div${x - 1}-${y - 1}`);

const randomId = `box${Math.floor(Math.random() * x)}`;

/* loop tests */
const nodeIterator = () => {
  const iterator = document.createNodeIterator(document, 1);
  let nextNode = iterator.nextNode();
  const nodes = new Set();
  while (nextNode) {
    if (nextNode.nodeType === 1) {
      nodes.add(nextNode);
    }
    nextNode = iterator.nextNode();
  }
  return nodes;
};

const nodeIteratorWithFn = () => {
  const iterator = document.createNodeIterator(document, 1, n => {
    const m = n.nodeType === 1;
    let res;
    if (m) {
      res = 1;
    } else {
      res = 2;
    }
    return res;
  });
  let nextNode = iterator.nextNode();
  const nodes = new Set();
  while (nextNode) {
    nodes.add(nextNode);
    nextNode = iterator.nextNode();
  }
  return nodes;
};

const treeWalker = () => {
  const walker = document.createTreeWalker(document, 1);
  let nextNode = walker.nextNode();
  const nodes = new Set();
  while (nextNode) {
    if (nextNode.nodeType === 1) {
      nodes.add(nextNode);
    }
    nextNode = walker.nextNode();
  }
  return nodes;
};

const treeWalkerWithFn = () => {
  const walker = document.createTreeWalker(document, 1, n => {
    const m = n.nodeType === 1;
    let res;
    if (m) {
      res = 1;
    } else {
      res = 2;
    }
    return res;
  });
  let nextNode = walker.nextNode();
  const nodes = new Set();
  while (nextNode) {
    nodes.add(nextNode);
    nextNode = walker.nextNode();
  }
  return nodes;
};

const getElementById = (id) => {
  const nodes = new Set([document.getElementById(id)]);
  return nodes;
};

const getElementsByClassName = (name) => {
  const nodes = new Set([...document.getElementsByClassName(name)]);
  return nodes;
};

const getElementsByTagName = (name) => {
  const nodes = new Set([...document.getElementsByTagName(name)]);
  return nodes;
};

const xpathSelectId = (id) => {
  const nodes = new Set(xpath.select1(`//*[@id=${id}]`, document));
  return nodes;
};

const xpathSelectClass = (name) => {
  const nodes =
    new Set(xpath.select(`//*[contains(@class, '${name}')]`, document));
  return nodes;
};

const xpathSelectTag = (name) => {
  const nodes = new Set(xpath.select(`//${name}`, document));
  return nodes;
};

const xpathSelectLocalName = (name) => {
  const nodes = new Set(xpath.select(`//*[local-name()='${name}']`, document));
  return nodes;
};

const htmlCollection = () => {
  const items = document.getElementsByTagName('*');
  const l = items.length;
  const nodes = new Set();
  for (let i = 0; i < l; i++) {
    const item = items.item(i);
    nodes.add(item);
  }
  return nodes;
};

const htmlCollectionForOf = () => {
  const items = document.getElementsByTagName('*');
  const nodes = new Set();
  for (const item of items) {
    nodes.add(item);
  }
  return nodes;
};

const symbolIterator = () => {
  const items = [...document.getElementsByTagName('*')].values();
  let item = items.next().value;
  const nodes = new Set();
  while (item) {
    nodes.add(item);
    item = items.next().value;
  }
  return nodes;
};

const symbolIteratorForOf = () => {
  const items = [...document.getElementsByTagName('*')].values();
  const nodes = new Set();
  for (const item of items) {
    nodes.add(item);
  }
  return nodes;
};

const forLoop = () => {
  const [...items] = document.getElementsByTagName('*');
  const l = items.length;
  const nodes = new Set();
  for (let i = 0; i < l; i++) {
    const item = items[i];
    nodes.add(item);
  }
  return nodes;
};

const forOfLoop = () => {
  const [...items] = document.getElementsByTagName('*');
  const nodes = new Set();
  for (const item of items) {
    nodes.add(item);
  }
  return nodes;
};

const forEachLoop = () => {
  const [...items] = document.getElementsByTagName('*');
  const nodes = new Set();
  items.forEach(item => {
    nodes.add(item);
  });
  return nodes;
};

const setForEach = () => {
  const items = new Set([...document.getElementsByTagName('*')]);
  const nodes = new Set();
  items.forEach(item => {
    nodes.add(item);
  });
  return nodes;
};

const setForOf = () => {
  const items = new Set([...document.getElementsByTagName('*')]);
  const nodes = new Set();
  for (const item of items) {
    nodes.add(item);
  }
  return nodes;
};

/* matcher tests */
const elementMatches = (type, api, selector) => {
  let box;
  let div;
  let patchedBox;
  let patchedDiv;
  let linkeBox;
  let linkeDiv;
  switch (type) {
    case 'document': {
      box = docBox;
      div = docDiv;
      patchedBox = patchedDocBox;
      patchedDiv = patchedDocDiv;
      linkeBox = linkeDocBox;
      linkeDiv = linkeDocDiv;
      break;
    }
    case 'fragment': {
      box = fragBox;
      div = fragDiv;
      patchedBox = patchedFragBox;
      patchedDiv = patchedFragDiv;
      linkeBox = linkeFragBox;
      linkeDiv = linkeFragDiv;
      break;
    }
    case 'element':
    default: {
      box = elmBox;
      div = elmDiv;
      patchedBox = patchedElmBox;
      patchedDiv = patchedElmDiv;
      linkeBox = linkeElmBox;
      linkeDiv = linkeElmDiv;
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
  } else if (api === 'linkedom') {
    if (value === 'box') {
      linkeBox.matches(key);
    } else if (value === 'div') {
      linkeDiv.matches(key);
    }
  } else if (api === 'altdom') {
    if (value === 'box') {
      matches(key, linkeBox);
    } else if (value === 'div') {
      matches(key, linkeDiv);
    }
  } else {
    if (value === 'box') {
      matches(key, box);
    } else if (value === 'div') {
      matches(key, div);
    }
  }
};

const elementClosest = (type, api, selector) => {
  let box;
  let div;
  let patchedBox;
  let patchedDiv;
  let linkeBox;
  let linkeDiv;
  switch (type) {
    case 'document': {
      box = docBox;
      div = docDiv;
      patchedBox = patchedDocBox;
      patchedDiv = patchedDocDiv;
      linkeBox = linkeDocBox;
      linkeDiv = linkeDocDiv;
      break;
    }
    case 'fragment': {
      box = fragBox;
      div = fragDiv;
      patchedBox = patchedFragBox;
      patchedDiv = patchedFragDiv;
      linkeBox = linkeFragBox;
      linkeDiv = linkeFragDiv;
      break;
    }
    case 'element':
    default: {
      box = elmBox;
      div = elmDiv;
      patchedBox = patchedElmBox;
      patchedDiv = patchedElmDiv;
      linkeBox = linkeElmBox;
      linkeDiv = linkeElmDiv;
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
  } else if (api === 'linkedom') {
    if (value === 'box') {
      linkeBox.closest(key);
    } else if (value === 'div') {
      linkeDiv.closest(key);
    }
  } else if (api === 'altdom') {
    if (value === 'box') {
      closest(key, linkeBox);
    } else if (value === 'div') {
      closest(key, linkeDiv);
    }
  } else {
    if (value === 'box') {
      closest(key, box);
    } else if (value === 'div') {
      closest(key, div);
    }
  }
};

const refPointQuerySelector = (type, api, selector) => {
  let refPoint;
  let patchedRefPoint;
  let linkeRefPoint;
  switch (type) {
    case 'document': {
      refPoint = document;
      patchedRefPoint = patchedDoc;
      linkeRefPoint = linkeDoc;
      break;
    }
    case 'fragment': {
      refPoint = fragment;
      patchedRefPoint = patchedFragment;
      linkeRefPoint = linkeFragment;
      break;
    }
    case 'element':
    default: {
      refPoint = elmRoot;
      patchedRefPoint = patchedElmRoot;
      linkeRefPoint = linkeElmRoot;
    }
  }
  const [key] = selector;
  if (api === 'jsdom') {
    refPoint.querySelector(key);
  } else if (api === 'patched-jsdom') {
    patchedRefPoint.querySelector(key);
  } else if (api === 'linkedom') {
    linkeRefPoint.querySelector(key);
  } else if (api === 'xpath') {
    const exp = css2xpath(key);
    xpath.select1(exp, refPoint);
  } else if (api === 'altdom') {
    querySelector(key, linkeRefPoint);
  } else {
    querySelector(key, refPoint);
  }
};

const refPointQuerySelectorAll = (type, api, selector) => {
  let refPoint;
  let patchedRefPoint;
  let linkeRefPoint;
  switch (type) {
    case 'document': {
      refPoint = document;
      patchedRefPoint = patchedDoc;
      linkeRefPoint = linkeDoc;
      break;
    }
    case 'fragment': {
      refPoint = fragment;
      patchedRefPoint = patchedFragment;
      linkeRefPoint = linkeFragment;
      break;
    }
    case 'element':
    default: {
      refPoint = elmRoot;
      patchedRefPoint = patchedElmRoot;
      linkeRefPoint = linkeElmRoot;
    }
  }
  const [key] = selector;
  if (api === 'jsdom') {
    refPoint.querySelectorAll(key);
  } else if (api === 'patched-jsdom') {
    patchedRefPoint.querySelectorAll(key);
  } else if (api === 'linkedom') {
    linkeRefPoint.querySelectorAll(key);
  } else if (api === 'xpath') {
    const exp = css2xpath(key);
    xpath.select(exp, refPoint);
  } else if (api === 'altdom') {
    querySelectorAll(key, linkeRefPoint);
  } else {
    querySelectorAll(key, refPoint);
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
/*
}).add('parser parseSelector', () => {
  parserParseSelector();
}).add('parser walkAST', () => {
  parserWalkAST();
}).add('node iterator', () => {
  nodeIterator();
}).add('node iterator with filter function', () => {
  nodeIteratorWithFn();
}).add('tree walker', () => {
  treeWalker();
}).add('tree walker with filter function', () => {
  treeWalkerWithFn();
}).add('getElementById', () => {
  getElementById(randomId);
}).add('getElementsByClassName', () => {
  getElementsByClassName('div');
}).add('getElementsByTagName - div', () => {
  getElementsByTagName('div');
}).add('getElementsByTagName - *', () => {
  getElementsByTagName('*');
}).add('xpathSelectId', () => {
  xpathSelectId(randomId);
}).add('xpathSelectClass', () => {
  xpathSelectClass('div');
}).add('xpathSelectTag - div', () => {
  xpathSelectTag('div');
}).add('xpathSelectTag - *', () => {
  xpathSelectTag('*');
}).add('xpathSelectLocalName', () => {
  xpathSelectLocalName('div');
}).add('html collection', () => {
  htmlCollection();
}).add('html collection for of', () => {
  htmlCollectionForOf();
}).add('symbol iterator', () => {
  symbolIterator();
}).add('symbol iterator for of', () => {
  symbolIteratorForOf();
}).add('for loop', () => {
  forLoop();
}).add('for of loop', () => {
  forOfLoop();
}).add('forEach loop', () => {
  forEachLoop();
}).add('set for of', () => {
  setForOf();
}).add('set forEach', () => {
  setForEach();
}).add('dom-selector matches - document - 0', () => {
  elementMatches('document', null, selectorItems[0]);
*/
}).add('jsdom matches - document - 0', () => {
  elementMatches('document', 'jsdom', selectorItems[0]);
}).add('patched-jsdom matches - document - 0', () => {
  elementMatches('document', 'patched-jsdom', selectorItems[0]);
/*
}).add('altdom matches - document - 0', () => {
  elementMatches('document', 'altdom', selectorItems[0]);
}).add('dom-selector matches - document - 1', () => {
  elementMatches('document', null, selectorItems[1]);
*/
}).add('jsdom matches - document - 1', () => {
  elementMatches('document', 'jsdom', selectorItems[1]);
}).add('patched-jsdom matches - document - 1', () => {
  elementMatches('document', 'patched-jsdom', selectorItems[1]);
/*
}).add('altdom matches - document - 1', () => {
  elementMatches('document', 'altdom', selectorItems[1]);
}).add('dom-selector matches - document - 2', () => {
  elementMatches('document', null, selectorItems[2]);
*/
}).add('jsdom matches - document - 2', () => {
  elementMatches('document', 'jsdom', selectorItems[2]);
}).add('patched-jsdom matches - document - 2', () => {
  elementMatches('document', 'patched-jsdom', selectorItems[2]);
/*
}).add('altdom matches - document - 2', () => {
  elementMatches('document', 'altdom', selectorItems[2]);
}).add('dom-selector matches - document - 3', () => {
  elementMatches('document', null, selectorItems[3]);
*/
}).add('jsdom matches - document - 3', () => {
  elementMatches('document', 'jsdom', selectorItems[3]);
}).add('patched-jsdom matches - document - 3', () => {
  elementMatches('document', 'patched-jsdom', selectorItems[3]);
/*
}).add('altdom matches - document - 3', () => {
  elementMatches('document', 'altdom', selectorItems[3]);
}).add('dom-selector matches - document - 4', () => {
  elementMatches('document', null, selectorItems[4]);
*/
}).add('jsdom matches - document - 4', () => {
  elementMatches('document', 'jsdom', selectorItems[4]);
}).add('patched-jsdom matches - document - 4', () => {
  elementMatches('document', 'patched-jsdom', selectorItems[4]);
/*
}).add('altdom matches - document - 4', () => {
  elementMatches('document', 'altdom', selectorItems[4]);
}).add('linkedom matches - document - 4', () => {
  elementMatches('document', 'linkedom', selectorItems[4]);
}).add('dom-selector matches - fragment - 4', () => {
  elementMatches('fragment', null, selectorItems[4]);
*/
}).add('jsdom matches - fragment - 4', () => {
  elementMatches('fragment', 'jsdom', selectorItems[4]);
}).add('patched-jsdom matches - fragment - 4', () => {
  elementMatches('fragment', 'patched-jsdom', selectorItems[4]);
/*
}).add('altdom matches - fragment - 4', () => {
  elementMatches('fragment', 'altdom', selectorItems[4]);
}).add('linkedom matches - fragment - 4', () => {
  elementMatches('fragment', 'linkedom', selectorItems[4]);
}).add('dom-selector matches - element - 4', () => {
  elementMatches('element', null, selectorItems[4]);
*/
}).add('jsdom matches - element - 4', () => {
  elementMatches('element', 'jsdom', selectorItems[4]);
}).add('patched-jsdom matches - element - 4', () => {
  elementMatches('element', 'patched-jsdom', selectorItems[4]);
/*
}).add('altdom matches - element - 4', () => {
  elementMatches('element', 'altdom', selectorItems[4]);
}).add('linkedom matches - element - 4', () => {
  elementMatches('element', 'linkedom', selectorItems[4]);
}).add('dom-selector closest - document - 0', () => {
  elementClosest('document', null, selectorItems[0]);
*/
}).add('jsdom closest - document - 0', () => {
  elementClosest('document', 'jsdom', selectorItems[0]);
}).add('patched-jsdom closest - document - 0', () => {
  elementClosest('document', 'patched-jsdom', selectorItems[0]);
/*
}).add('altdom closest - document - 0', () => {
  elementClosest('document', 'altdom', selectorItems[0]);
}).add('dom-selector closest - document - 1', () => {
  elementClosest('document', null, selectorItems[1]);
*/
}).add('jsdom closest - document - 1', () => {
  elementClosest('document', 'jsdom', selectorItems[1]);
}).add('patched-jsdom closest - document - 1', () => {
  elementClosest('document', 'patched-jsdom', selectorItems[1]);
/*
}).add('altdom closest - document - 1', () => {
  elementClosest('document', 'altdom', selectorItems[1]);
}).add('dom-selector closest - document - 2', () => {
  elementClosest('document', null, selectorItems[2]);
*/
}).add('jsdom closest - document - 2', () => {
  elementClosest('document', 'jsdom', selectorItems[2]);
}).add('patched-jsdom closest - document - 2', () => {
  elementClosest('document', 'patched-jsdom', selectorItems[2]);
/*
}).add('altdom closest - document - 2', () => {
  elementClosest('document', 'altdom', selectorItems[2]);
}).add('dom-selector closest - document - 3', () => {
  elementClosest('document', null, selectorItems[3]);
*/
}).add('jsdom closest - document - 3', () => {
  elementClosest('document', 'jsdom', selectorItems[3]);
}).add('patched-jsdom closest - document - 3', () => {
  elementClosest('document', 'patched-jsdom', selectorItems[3]);
/*
}).add('altdom closest - document - 3', () => {
  elementClosest('document', 'altdom', selectorItems[3]);
}).add('dom-selector closest - document - 4', () => {
  elementClosest('document', null, selectorItems[4]);
*/
}).add('jsdom closest - document - 4', () => {
  elementClosest('document', 'jsdom', selectorItems[4]);
}).add('patched-jsdom closest - document - 4', () => {
  elementClosest('document', 'patched-jsdom', selectorItems[4]);
/*
}).add('altdom closest - document - 4', () => {
  elementClosest('document', 'altdom', selectorItems[4]);
}).add('linkedom closest - document - 4', () => {
  elementClosest('document', 'linkedom', selectorItems[4]);
}).add('dom-selector closest - fragment - 4', () => {
  elementClosest('fragment', null, selectorItems[4]);
*/
}).add('jsdom closest - fragment - 4', () => {
  elementClosest('fragment', 'jsdom', selectorItems[4]);
}).add('patched-jsdom closest - fragment - 4', () => {
  elementClosest('fragment', 'patched-jsdom', selectorItems[4]);
/*
}).add('altdom closest - fragment - 4', () => {
  elementClosest('fragment', 'altdom', selectorItems[4]);
}).add('linkedom closest - fragment - 4', () => {
  elementClosest('fragment', 'linkedom', selectorItems[4]);
}).add('dom-selector closest - element - 4', () => {
  elementClosest('element', null, selectorItems[4]);
*/
}).add('jsdom closest - element - 4', () => {
  elementClosest('element', 'jsdom', selectorItems[4]);
}).add('patched-jsdom closest - element - 4', () => {
  elementClosest('element', 'patched-jsdom', selectorItems[4]);
/*
}).add('altdom closest - element - 4', () => {
  elementClosest('element', 'altdom', selectorItems[4]);
}).add('linkedom closest - element - 4', () => {
  elementClosest('element', 'linkedom', selectorItems[4]);
}).add('dom-selector querySelector - document - 0', () => {
  refPointQuerySelector('document', null, selectorItems[0]);
*/
}).add('jsdom querySelector - document - 0', () => {
  refPointQuerySelector('document', 'jsdom', selectorItems[0]);
}).add('patched-jsdom querySelector - document - 0', () => {
  refPointQuerySelector('document', 'patched-jsdom', selectorItems[0]);
/*
}).add('altdom querySelector - document - 0', () => {
  refPointQuerySelector('document', 'altdom', selectorItems[0]);
}).add('dom-selector querySelector - document - 1', () => {
  refPointQuerySelector('document', null, selectorItems[1]);
*/
}).add('jsdom querySelector - document - 1', () => {
  refPointQuerySelector('document', 'jsdom', selectorItems[1]);
}).add('patched-jsdom querySelector - document - 1', () => {
  refPointQuerySelector('document', 'patched-jsdom', selectorItems[1]);
/*
}).add('altdom querySelector - document - 1', () => {
  refPointQuerySelector('document', 'altdom', selectorItems[1]);
}).add('dom-selector querySelector - document - 2', () => {
  refPointQuerySelector('document', null, selectorItems[2]);
*/
}).add('jsdom querySelector - document - 2', () => {
  refPointQuerySelector('document', 'jsdom', selectorItems[2]);
}).add('patched-jsdom querySelector - document - 2', () => {
  refPointQuerySelector('document', 'patched-jsdom', selectorItems[2]);
/*
}).add('altdom querySelector - document - 2', () => {
  refPointQuerySelector('document', 'altdom', selectorItems[2]);
}).add('dom-selector querySelector - document - 3', () => {
  refPointQuerySelector('document', null, selectorItems[3]);
*/
}).add('jsdom querySelector - document - 3', () => {
  refPointQuerySelector('document', 'jsdom', selectorItems[3]);
}).add('patched-jsdom querySelector - document - 3', () => {
  refPointQuerySelector('document', 'patched-jsdom', selectorItems[3]);
/*
}).add('altdom querySelector - document - 3', () => {
  refPointQuerySelector('document', 'altdom', selectorItems[3]);
}).add('dom-selector querySelector - document - 4', () => {
  refPointQuerySelector('document', null, selectorItems[4]);
*/
}).add('jsdom querySelector - document - 4', () => {
  refPointQuerySelector('document', 'jsdom', selectorItems[4]);
}).add('patched-jsdom querySelector - document - 4', () => {
  refPointQuerySelector('document', 'patched-jsdom', selectorItems[4]);
/*
}).add('altdom querySelector - document - 4', () => {
  refPointQuerySelector('document', 'altdom', selectorItems[4]);
}).add('linkedom querySelector - document - 4', () => {
  refPointQuerySelector('document', 'linkedom', selectorItems[4]);
}).add('xpath querySelector - document - 4', () => {
  refPointQuerySelector('document', 'xpath', selectorItems[4]);
}).add('dom-selector querySelector - fragment - 4', () => {
  refPointQuerySelector('fragment', null, selectorItems[4]);
*/
}).add('jsdom querySelector - fragment - 4', () => {
  refPointQuerySelector('fragment', 'jsdom', selectorItems[4]);
}).add('patched-jsdom querySelector - fragment - 4', () => {
  refPointQuerySelector('fragment', 'patched-jsdom', selectorItems[4]);
/*
}).add('altdom querySelector - fragment - 4', () => {
  refPointQuerySelector('fragment', 'altdom', selectorItems[4]);
}).add('linkedom querySelector - fragment - 4', () => {
  refPointQuerySelector('fragment', 'linkedom', selectorItems[4]);
}).add('dom-selector querySelector - element - 4', () => {
  refPointQuerySelector('element', null, selectorItems[4]);
*/
}).add('jsdom querySelector - element - 4', () => {
  refPointQuerySelector('element', 'jsdom', selectorItems[4]);
}).add('patched-jsdom querySelector - element - 4', () => {
  refPointQuerySelector('element', 'patched-jsdom', selectorItems[4]);
/*
}).add('altdom querySelector - element - 4', () => {
  refPointQuerySelector('element', 'altdom', selectorItems[4]);
}).add('linkedom querySelector - element - 4', () => {
  refPointQuerySelector('element', 'linkedom', selectorItems[4]);
}).add('xpath querySelector - element - 4', () => {
  refPointQuerySelector('element', 'xpath', selectorItems[4]);
}).add('dom-selector querySelectorAll - document - 0', () => {
  refPointQuerySelectorAll('document', null, selectorItems[0]);
*/
}).add('jsdom querySelectorAll - document - 0', () => {
  refPointQuerySelectorAll('document', 'jsdom', selectorItems[0]);
}).add('patched-jsdom querySelectorAll - document - 0', () => {
  refPointQuerySelectorAll('document', 'patched-jsdom', selectorItems[0]);
/*
}).add('altdom querySelectorAll - document - 0', () => {
  refPointQuerySelectorAll('document', 'altdom', selectorItems[0]);
}).add('dom-selector querySelectorAll - document - 1', () => {
  refPointQuerySelectorAll('document', null, selectorItems[1]);
*/
}).add('jsdom querySelectorAll - document - 1', () => {
  refPointQuerySelectorAll('document', 'jsdom', selectorItems[1]);
}).add('patched-jsdom querySelectorAll - document - 1', () => {
  refPointQuerySelectorAll('document', 'patched-jsdom', selectorItems[1]);
/*
}).add('altdom querySelectorAll - document - 1', () => {
  refPointQuerySelectorAll('document', 'altdom', selectorItems[1]);
}).add('dom-selector querySelectorAll - document - 2', () => {
  refPointQuerySelectorAll('document', null, selectorItems[2]);
*/
}).add('jsdom querySelectorAll - document - 2', () => {
  refPointQuerySelectorAll('document', 'jsdom', selectorItems[2]);
}).add('patched-jsdom querySelectorAll - document - 2', () => {
  refPointQuerySelectorAll('document', 'patched-jsdom', selectorItems[2]);
/*
}).add('altdom querySelectorAll - document - 2', () => {
  refPointQuerySelectorAll('document', 'altdom', selectorItems[2]);
}).add('dom-selector querySelectorAll - document - 3', () => {
  refPointQuerySelectorAll('document', null, selectorItems[3]);
*/
}).add('jsdom querySelectorAll - document - 3', () => {
  refPointQuerySelectorAll('document', 'jsdom', selectorItems[3]);
}).add('patched-jsdom querySelectorAll - document - 3', () => {
  refPointQuerySelectorAll('document', 'patched-jsdom', selectorItems[3]);
/*
}).add('altdom querySelectorAll - document - 3', () => {
  refPointQuerySelectorAll('document', 'altdom', selectorItems[3]);
}).add('dom-selector querySelectorAll - document - 4', () => {
  refPointQuerySelectorAll('document', null, selectorItems[4]);
*/
}).add('jsdom querySelectorAll - document - 4', () => {
  refPointQuerySelectorAll('document', 'jsdom', selectorItems[4]);
}).add('patched-jsdom querySelectorAll - document - 4', () => {
  refPointQuerySelectorAll('document', 'patched-jsdom', selectorItems[4]);
/*
}).add('altdom querySelectorAll - document - 4', () => {
  refPointQuerySelectorAll('document', 'altdom', selectorItems[4]);
}).add('linkedom querySelectorAll - document - 4', () => {
  refPointQuerySelectorAll('document', 'linkedom', selectorItems[4]);
}).add('xpath querySelectorAll - document - 4', () => {
  refPointQuerySelectorAll('document', 'xpath', selectorItems[4]);
}).add('dom-selector querySelectorAll - fragment - 4', () => {
  refPointQuerySelectorAll('fragment', null, selectorItems[4]);
*/
}).add('jsdom querySelectorAll - fragment - 4', () => {
  refPointQuerySelectorAll('fragment', 'jsdom', selectorItems[4]);
}).add('patched-jsdom querySelectorAll - fragment - 4', () => {
  refPointQuerySelectorAll('fragment', 'patched-jsdom', selectorItems[4]);
/*
}).add('altdom querySelectorAll - fragment - 4', () => {
  refPointQuerySelectorAll('fragment', 'altdom', selectorItems[4]);
}).add('linkedom querySelectorAll - fragment - 4', () => {
  refPointQuerySelectorAll('fragment', 'linkedom', selectorItems[4]);
}).add('dom-selector querySelectorAll - element - 4', () => {
  refPointQuerySelectorAll('element', null, selectorItems[4]);
*/
}).add('jsdom querySelectorAll - element - 4', () => {
  refPointQuerySelectorAll('element', 'jsdom', selectorItems[4]);
}).add('patched-jsdom querySelectorAll - element - 4', () => {
  refPointQuerySelectorAll('element', 'patched-jsdom', selectorItems[4]);
/*
}).add('altdom querySelectorAll - element - 4', () => {
  refPointQuerySelectorAll('element', 'altdom', selectorItems[4]);
}).add('linkedom querySelectorAll - element - 4', () => {
  refPointQuerySelectorAll('element', 'linkedom', selectorItems[4]);
}).add('xpath querySelectorAll - element - 4', () => {
  refPointQuerySelectorAll('element', 'xpath', selectorItems[4]);
*/
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
