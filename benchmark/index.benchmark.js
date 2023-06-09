/**
 * index.benchmark.js
 */
'use strict';

/* import */
const { Suite } = require('benchmark');
const { JSDOM } = require('jsdom');
const { name: packageName, version } = require('../package.json');
const {
  closest, matches, querySelector, querySelectorAll
} = require('../src/index.js');
const { parseSelector, walkAST } = require('../src/js/parser.js');

/* parser tests */
const parserParseSelector = () => {
  const selector = 'foo * .bar > baz:not(:is(.qux, .quux)) + [corge] ~ #grault';
  let i = 0;
  while (i < 1000) {
    parseSelector(selector);
    i++;
  }
};

const parserWalkAST = () => {
  const selector = 'foo * .bar > baz:not(:is(.qux, .quux)) + [corge] ~ #grault';
  const ast = parseSelector(selector);
  let i = 0;
  while (i < 1000) {
    walkAST(ast);
    i++;
  }
};

/*
 * matcher tests
 */
const {
  window: { document }
} = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
  runScripts: 'dangerously',
  url: 'http://localhost'
});

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

const forLoop = () => {
  document.body.append(container);
  const [...items] = document.getElementsByTagName('*');
  const l = items.length;
  const nodes = new Set();
  for (let i = 0; i < l; i++) {
    const item = items[i];
    nodes.add(item);
  }
};

const nodeIterator = () => {
  document.body.append(container);
  const iterator = document.createNodeIterator(document, 1);
  let nextNode = iterator.nextNode();
  const nodes = new Set();
  while (nextNode) {
    nodes.add(nextNode);
    nextNode = iterator.nextNode();
  }
};

const setForEach = () => {
  document.body.append(container);
  const items = new Set([...document.getElementsByTagName('*')]);
  const nodes = new Set();
  items.forEach(item => {
    nodes.add(item);
  });
};

const setForOf = () => {
  document.body.append(container);
  const items = new Set([...document.getElementsByTagName('*')]);
  const nodes = new Set();
  for (const item of items) {
    nodes.add(item);
  }
};

const elementMatches = (type, api) => {
  let box;
  let div;
  switch (type) {
    case 'document': {
      document.body.append(container);
      box = document.getElementById(`box${x - 1}`);
      div = document.getElementById(`div${x - 1}-${y - 1}`);
      break;
    }
    case 'fragment': {
      const fragment = document.createDocumentFragment();
      fragment.append(container);
      box = fragment.getElementById(`box${x - 1}`);
      div = fragment.getElementById(`div${x - 1}-${y - 1}`);
      break;
    }
    case 'element':
    default: {
      document.body.append(container);
      box = document.getElementById(`box${x - 1}`);
      div = document.getElementById(`div${x - 1}-${y - 1}`);
      const root = document.createElement('div');
      root.append(document.body.removeChild(container));
    }
  }
  const selectors = new Map([
    ['.box .div', 'div'],
    ['.box ~ .box', 'box']
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
      document.body.append(container);
      box = document.getElementById(`box${x - 1}`);
      div = document.getElementById(`div${x - 1}-${y - 1}`);
      break;
    }
    case 'fragment': {
      const fragment = document.createDocumentFragment();
      fragment.append(container);
      box = fragment.getElementById(`box${x - 1}`);
      div = fragment.getElementById(`div${x - 1}-${y - 1}`);
      break;
    }
    case 'element':
    default: {
      document.body.append(container);
      box = document.getElementById(`box${x - 1}`);
      div = document.getElementById(`div${x - 1}-${y - 1}`);
      const root = document.createElement('div');
      root.append(document.body.removeChild(container));
    }
  }
  const selectors = new Map([
    ['.box .div', 'div'],
    ['.box ~ .box', 'box']
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
      document.body.append(container);
      refPoint = document;
      break;
    }
    case 'fragment': {
      const fragment = document.createDocumentFragment();
      fragment.append(container);
      refPoint = fragment;
      break;
    }
    case 'element':
    default: {
      const root = document.createElement('div');
      root.appendChild(container);
      refPoint = root;
    }
  }
  const selectors = [
    '.box .div',
    '.box ~ .box'
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
      document.body.append(container);
      refPoint = document;
      break;
    }
    case 'fragment': {
      const fragment = document.createDocumentFragment();
      fragment.append(container);
      refPoint = fragment;
      break;
    }
    case 'element':
    default: {
      document.body.append(container);
      const root = document.createElement('div');
      root.append(document.body.removeChild(container));
      refPoint = root;
    }
  }
  const selectors = [
    '.box .div',
    '.box ~ .box'
  ];
  for (const selector of selectors) {
    if (api === 'jsdom') {
      refPoint.querySelectorAll(selector);
    } else {
      querySelectorAll(selector, refPoint);
    }
  }
};

const suite = new Suite();

suite.on('start', () => {
  console.log(`benchmark ${packageName} v${version}`);
}).add('for loop', () => {
  forLoop();
}).add('node iterator', () => {
  nodeIterator();
}).add('set forEach', () => {
  setForEach();
}).add('set for of', () => {
  setForOf();
}).add('parser parseSelector', () => {
  parserParseSelector();
}).add('parser walkAST', () => {
  parserWalkAST();
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
}).on('cycle', (evt) => {
  console.log(`* ${String(evt.target)}`);
}).run({
  async: true
});
