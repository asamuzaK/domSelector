/**
 * benchmark.js
 */
'use strict';

/* import */
const Benchmark = require('benchmark');
const { JSDOM } = require('jsdom');
const { parseHTML } = require('linkedom');
const { name: packageName, version } = require('../package.json');
const {
  closest, matches, querySelector, querySelectorAll
} = require('../src/index.js');
const { matchCombinator } = require('../src/js/matcher.js');
const { parseSelector, walkAST } = require('../src/js/parser.js');

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
const x = 32;
const y = 32;
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

/* linkeDOM */
const {
  document: linkeDoc
} = parseHTML('<!doctype html><html><head></head><body></body></html>');

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
};

const htmlCollection = () => {
  const items = document.getElementsByTagName('*');
  const l = items.length;
  const nodes = new Set();
  for (let i = 0; i < l; i++) {
    const item = items.item(i);
    nodes.add(item);
  }
};

const htmlCollectionForOf = () => {
  const items = document.getElementsByTagName('*');
  const nodes = new Set();
  for (const item of items) {
    nodes.add(item);
  }
};

const symbolIterator = () => {
  const items = [...document.getElementsByTagName('*')].values();
  let item = items.next().value;
  const nodes = new Set();
  while (item) {
    nodes.add(item);
    item = items.next().value;
  }
};

const symbolIteratorForOf = () => {
  const items = [...document.getElementsByTagName('*')].values();
  const nodes = new Set();
  for (const item of items) {
    nodes.add(item);
  }
};

const forLoop = () => {
  const [...items] = document.getElementsByTagName('*');
  const l = items.length;
  const nodes = new Set();
  for (let i = 0; i < l; i++) {
    const item = items[i];
    nodes.add(item);
  }
};

const forOfLoop = () => {
  const [...items] = document.getElementsByTagName('*');
  const nodes = new Set();
  for (const item of items) {
    nodes.add(item);
  }
};

const forEachLoop = () => {
  const [...items] = document.getElementsByTagName('*');
  const nodes = new Set();
  items.forEach(item => {
    nodes.add(item);
  });
};

const setForEach = () => {
  const items = new Set([...document.getElementsByTagName('*')]);
  const nodes = new Set();
  items.forEach(item => {
    nodes.add(item);
  });
};

const setForOf = () => {
  const items = new Set([...document.getElementsByTagName('*')]);
  const nodes = new Set();
  for (const item of items) {
    nodes.add(item);
  }
};

/* match combinator test */
const matchCombo = filter => {
  const combo = {
    name: ' ',
    type: 'Combinator'
  };
  if (filter === 'prev') {
    const prevNodes = new Set([...document.getElementsByClassName('box')]);
    const nextNodes = new Set([docDiv]);
    matchCombinator(combo, prevNodes, nextNodes, {
      filter
    });
  } else {
    const prevNodes = new Set([docBox]);
    const nextNodes = new Set([...document.getElementsByClassName('div')]);
    matchCombinator(combo, prevNodes, nextNodes);
  }
};

/* matcher tests */
const elementMatches = (type, api) => {
  let box;
  let div;
  let linkeBox;
  let linkeDiv;
  switch (type) {
    case 'document': {
      box = docBox;
      div = docDiv;
      linkeBox = linkeDocBox;
      linkeDiv = linkeDocDiv;
      break;
    }
    case 'fragment': {
      box = fragBox;
      div = fragDiv;
      linkeBox = linkeFragBox;
      linkeDiv = linkeFragDiv;
      break;
    }
    case 'element':
    default: {
      box = elmBox;
      div = elmDiv;
      linkeBox = linkeElmBox;
      linkeDiv = linkeElmDiv;
    }
  }
  const selectors = new Map([
    /*
    ['.box .div', 'div'],
    ['.box ~ .box', 'box'],
    */
    ['.box:first-child ~ .box .div', 'div']
  ]);
  for (const [key, value] of selectors) {
    if (api === 'jsdom') {
      if (value === 'box') {
        box.matches(key);
      } else if (value === 'div') {
        div.matches(key);
      }
    } else if (api === 'linkedom') {
      if (value === 'box') {
        linkeBox.matches(key);
      } else if (value === 'div') {
        linkeDiv.matches(key);
      }
    } else {
      if (value === 'box') {
        matches(key, box);
      } else if (value === 'div') {
        matches(key, div);
      }
    }
  }
};

const elementClosest = (type, api) => {
  let box;
  let div;
  let linkeBox;
  let linkeDiv;
  switch (type) {
    case 'document': {
      box = docBox;
      div = docDiv;
      linkeBox = linkeDocBox;
      linkeDiv = linkeDocDiv;
      break;
    }
    case 'fragment': {
      box = fragBox;
      div = fragDiv;
      linkeBox = linkeFragBox;
      linkeDiv = linkeFragDiv;
      break;
    }
    case 'element':
    default: {
      box = elmBox;
      div = elmDiv;
      linkeBox = linkeElmBox;
      linkeDiv = linkeElmDiv;
    }
  }
  const selectors = new Map([
    /*
    ['.box .div', 'div'],
    ['.box ~ .box', 'box'],
    */
    ['.box:first-child ~ .box .div', 'div']
  ]);
  for (const [key, value] of selectors) {
    if (api === 'jsdom') {
      if (value === 'box') {
        box.closest(key);
      } else if (value === 'div') {
        div.closest(key);
      }
    } else if (api === 'linkedom') {
      if (value === 'box') {
        linkeBox.closest(key);
      } else if (value === 'div') {
        linkeDiv.closest(key);
      }
    } else {
      if (value === 'box') {
        closest(key, box);
      } else if (value === 'div') {
        closest(key, div);
      }
    }
  }
};

const refPointQuerySelector = (type, api) => {
  let refPoint;
  let linkeRefPoint;
  switch (type) {
    case 'document': {
      refPoint = document;
      linkeRefPoint = linkeDoc;
      break;
    }
    case 'fragment': {
      refPoint = fragment;
      linkeRefPoint = linkeFragment;
      break;
    }
    case 'element':
    default: {
      refPoint = elmRoot;
      linkeRefPoint = linkeElmRoot;
    }
  }
  const selectors = [
    /*
    '.box .div',
    '.box ~ .box',
    */
    '.box:first-child ~ .box .div'
  ];
  for (const selector of selectors) {
    if (api === 'jsdom') {
      refPoint.querySelector(selector);
    } else if (api === 'linkedom') {
      linkeRefPoint.querySelector(selector);
    } else {
      querySelector(selector, refPoint);
    }
  }
};

const refPointQuerySelectorAll = (type, api) => {
  let refPoint;
  let linkeRefPoint;
  switch (type) {
    case 'document': {
      refPoint = document;
      linkeRefPoint = linkeDoc;
      break;
    }
    case 'fragment': {
      refPoint = fragment;
      linkeRefPoint = linkeFragment;
      break;
    }
    case 'element':
    default: {
      refPoint = elmRoot;
      linkeRefPoint = linkeElmRoot;
    }
  }
  const selectors = [
    /*
    '.box .div',
    '.box ~ .box',
    */
    '.box:first-child ~ .box .div'
  ];
  for (const selector of selectors) {
    if (api === 'jsdom') {
      refPoint.querySelectorAll(selector);
    } else if (api === 'linkedom') {
      linkeRefPoint.querySelectorAll(selector);
    } else {
      querySelectorAll(selector, refPoint);
    }
  }
};

const suite = new Benchmark.Suite();

suite.on('start', () => {
  console.log(`benchmark ${packageName} v${version}`);
}).add('parser parseSelector', () => {
  parserParseSelector();
}).add('parser walkAST', () => {
  parserWalkAST();
}).add('match combinator - prev', () => {
  matchCombo('prev');
}).add('match combinator - next', () => {
  matchCombo('next');
}).add('node iterator', () => {
  nodeIterator();
}).add('node iterator with filter function', () => {
  nodeIteratorWithFn();
}).add('tree walker', () => {
  treeWalker();
}).add('tree walker with filter function', () => {
  treeWalkerWithFn();
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
}).add('dom-selector matches - document', () => {
  elementMatches('document');
}).add('jsdom matches - document', () => {
  elementMatches('document', 'jsdom');
}).add('linkedom matches - document', () => {
  elementMatches('document', 'linkedom');
}).add('dom-selector matches - fragment', () => {
  elementMatches('fragment');
}).add('jsdom matches - fragment', () => {
  elementMatches('fragment', 'jsdom');
}).add('linkedom matches - fragment', () => {
  elementMatches('fragment', 'linkedom');
}).add('dom-selector matches - element', () => {
  elementMatches('element');
}).add('jsdom matches - element', () => {
  elementMatches('element', 'jsdom');
}).add('linkedom matches - element', () => {
  elementMatches('element', 'linkedom');
}).add('dom-selector closest - document', () => {
  elementClosest('document');
}).add('jsdom closest - document', () => {
  elementClosest('document', 'jsdom');
}).add('linkedom closest - document', () => {
  elementClosest('document', 'linkedom');
}).add('dom-selector closest - fragment', () => {
  elementClosest('fragment');
}).add('jsdom closest - fragment', () => {
  elementClosest('fragment', 'jsdom');
}).add('linkedom closest - fragment', () => {
  elementClosest('fragment', 'linkedom');
}).add('dom-selector closest - element', () => {
  elementClosest('element');
}).add('jsdom closest - element', () => {
  elementClosest('element', 'jsdom');
}).add('linkedom closest - element', () => {
  elementClosest('element', 'linkedom');
}).add('dom-selector querySelector - document', () => {
  refPointQuerySelector('document');
}).add('jsdom querySelector - document', () => {
  refPointQuerySelector('document', 'jsdom');
}).add('linkedom querySelector - document', () => {
  refPointQuerySelector('document', 'linkedom');
}).add('dom-selector querySelector - fragment', () => {
  refPointQuerySelector('fragment');
}).add('jsdom querySelector - fragment', () => {
  refPointQuerySelector('fragment', 'jsdom');
}).add('linkedom querySelector - fragment', () => {
  refPointQuerySelector('fragment', 'linkedom');
}).add('dom-selector querySelector - element', () => {
  refPointQuerySelector('element');
}).add('jsdom querySelector - element', () => {
  refPointQuerySelector('element', 'jsdom');
}).add('linkedom querySelector - element', () => {
  refPointQuerySelector('element', 'linkedom');
}).add('dom-selector querySelectorAll - document', () => {
  refPointQuerySelectorAll('document');
}).add('jsdom querySelectorAll - document', () => {
  refPointQuerySelectorAll('document', 'jsdom');
}).add('linkedom querySelectorAll - document', () => {
  refPointQuerySelectorAll('document', 'linkedom');
}).add('dom-selector querySelectorAll - fragment', () => {
  refPointQuerySelectorAll('fragment');
}).add('jsdom querySelectorAll - fragment', () => {
  refPointQuerySelectorAll('fragment', 'jsdom');
}).add('linkedom querySelectorAll - fragment', () => {
  refPointQuerySelectorAll('fragment', 'linkedom');
}).add('dom-selector querySelectorAll - element', () => {
  refPointQuerySelectorAll('element');
}).add('jsdom querySelectorAll - element', () => {
  refPointQuerySelectorAll('element', 'jsdom');
}).add('linkedom querySelectorAll - element', () => {
  refPointQuerySelectorAll('element', 'linkedom');
}).on('cycle', evt => {
  console.log(`* ${String(evt.target)}`);
}).run({
  async: true
});
