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
 * @see CSS selector performance https://codepen.io/ivancuric/pen/ZaWxqV
 */

const box = count => `
<div class="box" id="box${count}">
  <div id="div${count}" class="title">${count}</div>
</div>`;

const count = 100;
let domStr = '';
for (let i = 0; i < count; i++) {
  domStr += box(i + 1);
}

const selectors = [
  'div',
  '.box',
  '.box > .title',
  '.box .title',
  '.box ~ .box',
  '.box + .box',
  '.box:last-of-type',
  '.box:nth-of-type(2n - 1)',
  '.box:not(:last-of-type)',
  '.box:not(:empty):last-of-type .title',
  '.box:nth-last-child(n+6) ~ div'
];

const elementClosest = (type, api) => {
  const {
    window: { document }
  } = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
    runScripts: 'dangerously',
    url: 'http://localhost'
  });
  const container = document.createElement('div');
  container.classList.add('box-container');
  container.append(document.createRange().createContextualFragment(domStr));
  let target;
  switch (type) {
    case 'document': {
      document.body.appendChild(container);
      target = document.getElementById(`box${Math.round(count / 2)}`);
      break;
    }
    case 'fragment': {
      document.body.appendChild(container);
      target = document.getElementById(`box${Math.round(count / 2)}`);
      const fragment = document.createDocumentFragment();
      fragment.appendChild(document.body.removeChild(container));
      break;
    }
    case 'element':
    default: {
      document.body.appendChild(container);
      target = document.getElementById(`box${Math.round(count / 2)}`);
      const root = document.createElement('div');
      root.appendChild(document.body.removeChild(container));
    }
  }
  for (const selector of selectors) {
    if (api === 'jsdom') {
      target.closest(selector);
    } else {
      closest(selector, target);
    }
  }
};

const elementMatches = (type, api) => {
  const {
    window: { document }
  } = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
    runScripts: 'dangerously',
    url: 'http://localhost'
  });
  const container = document.createElement('div');
  container.classList.add('box-container');
  container.append(document.createRange().createContextualFragment(domStr));
  let target;
  switch (type) {
    case 'document': {
      document.body.appendChild(container);
      target = document.getElementById(`div${Math.round(count / 2)}`);
      break;
    }
    case 'fragment': {
      document.body.appendChild(container);
      target = document.getElementById(`div${Math.round(count / 2)}`);
      const fragment = document.createDocumentFragment();
      fragment.appendChild(document.body.removeChild(container));
      break;
    }
    case 'element':
    default: {
      document.body.appendChild(container);
      target = document.getElementById(`div${Math.round(count / 2)}`);
      const root = document.createElement('div');
      root.appendChild(document.body.removeChild(container));
    }
  }
  for (const selector of selectors) {
    if (api === 'jsdom') {
      target.matches(selector);
    } else {
      matches(selector, target);
    }
  }
};

const refPointQuerySelector = (type, api) => {
  const {
    window: { document }
  } = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
    runScripts: 'dangerously',
    url: 'http://localhost'
  });
  const container = document.createElement('div');
  container.classList.add('box-container');
  container.append(document.createRange().createContextualFragment(domStr));
  let refPoint;
  switch (type) {
    case 'document': {
      document.body.appendChild(container);
      refPoint = document;
      break;
    }
    case 'fragment': {
      const fragment = document.createDocumentFragment();
      fragment.appendChild(container);
      refPoint = fragment;
      break;
    }
    case 'element':
    default: {
      document.body.appendChild(container);
      const target = document.getElementById(`div${Math.round(count / 2)}`);
      const root = document.createElement('div');
      root.appendChild(document.body.removeChild(container));
      refPoint = target;
    }
  }
  for (const selector of selectors) {
    if (api === 'jsdom') {
      refPoint.querySelector(selector);
    } else {
      querySelector(selector, refPoint);
    }
  }
};

const refPointQuerySelectorAll = (type, api) => {
  const {
    window: { document }
  } = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
    runScripts: 'dangerously',
    url: 'http://localhost'
  });
  const container = document.createElement('div');
  container.classList.add('box-container');
  container.append(document.createRange().createContextualFragment(domStr));
  let refPoint;
  switch (type) {
    case 'document': {
      document.body.appendChild(container);
      refPoint = document;
      break;
    }
    case 'fragment': {
      const fragment = document.createDocumentFragment();
      fragment.appendChild(container);
      refPoint = fragment;
      break;
    }
    case 'element':
    default: {
      document.body.appendChild(container);
      const target = document.getElementById(`div${Math.round(count / 2)}`);
      const root = document.createElement('div');
      root.appendChild(document.body.removeChild(container));
      refPoint = target;
    }
  }
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
}).add('parser parseSelector', () => {
  parserParseSelector();
}).add('parser walkAST', () => {
  parserWalkAST();
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
}).on('cycle', (evt) => {
  console.log(`* ${String(evt.target)}`);
}).run({
  async: true
});
