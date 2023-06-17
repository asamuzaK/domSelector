/**
 * index.benchmark.js
 */
'use strict';

/* import */
const Benchmark = require('benchmark');
const { JSDOM } = require('jsdom');
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

/* loop tests */
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
  switch (type) {
    case 'document': {
      box = docBox;
      div = docDiv;
      break;
    }
    case 'fragment': {
      box = fragBox;
      div = fragDiv;
      break;
    }
    case 'element':
    default: {
      box = elmBox;
      div = elmDiv;
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
  switch (type) {
    case 'document': {
      box = docBox;
      div = docDiv;
      break;
    }
    case 'fragment': {
      box = fragBox;
      div = fragDiv;
      break;
    }
    case 'element':
    default: {
      box = elmBox;
      div = elmDiv;
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
  switch (type) {
    case 'document': {
      refPoint = document;
      break;
    }
    case 'fragment': {
      refPoint = fragment;
      break;
    }
    case 'element':
    default: {
      refPoint = elmRoot;
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
    } else {
      querySelector(selector, refPoint);
    }
  }
};

const refPointQuerySelectorAll = (type, api) => {
  let refPoint;
  switch (type) {
    case 'document': {
      refPoint = document;
      break;
    }
    case 'fragment': {
      refPoint = fragment;
      break;
    }
    case 'element':
    default: {
      refPoint = elmRoot;
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
}).add('dom-selector matches - fragment', () => {
  elementMatches('fragment');
}).add('jsdom matches - fragment', () => {
  elementMatches('fragment', 'jsdom');
}).add('dom-selector matches - element', () => {
  elementMatches('element');
}).add('jsdom matches - element', () => {
  elementMatches('element', 'jsdom');
}).add('dom-selector closest - document', () => {
  elementClosest('document');
}).add('jsdom closest - document', () => {
  elementClosest('document', 'jsdom');
}).add('dom-selector closest - fragment', () => {
  elementClosest('fragment');
}).add('jsdom closest - fragment', () => {
  elementClosest('fragment', 'jsdom');
}).add('dom-selector closest - element', () => {
  elementClosest('element');
}).add('jsdom closest - element', () => {
  elementClosest('element', 'jsdom');
}).add('dom-selector querySelector - document', () => {
  refPointQuerySelector('document');
}).add('jsdom querySelector - document', () => {
  refPointQuerySelector('document', 'jsdom');
}).add('dom-selector querySelector - fragment', () => {
  refPointQuerySelector('fragment');
}).add('jsdom querySelector - fragment', () => {
  refPointQuerySelector('fragment', 'jsdom');
}).add('dom-selector querySelector - element', () => {
  refPointQuerySelector('element');
}).add('jsdom querySelector - element', () => {
  refPointQuerySelector('element', 'jsdom');
}).add('dom-selector querySelectorAll - document', () => {
  refPointQuerySelectorAll('document');
}).add('jsdom querySelectorAll - document', () => {
  refPointQuerySelectorAll('document', 'jsdom');
}).add('dom-selector querySelectorAll - fragment', () => {
  refPointQuerySelectorAll('fragment');
}).add('jsdom querySelectorAll - fragment', () => {
  refPointQuerySelectorAll('fragment', 'jsdom');
}).add('dom-selector querySelectorAll - element', () => {
  refPointQuerySelectorAll('element');
}).add('jsdom querySelectorAll - element', () => {
  refPointQuerySelectorAll('element', 'jsdom');
}).on('cycle', evt => {
  console.log(`* ${String(evt.target)}`);
}).run({
  async: true
});
