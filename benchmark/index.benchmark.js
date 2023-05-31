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

const matcherClosest = () => {
  const DEPTH = 10;
  const JUNK_CHILDREN = 10;
  const sel = 'evenodd'.repeat(100);
  const selector =
    `:first-child + div.even :not(.${sel}) > :nth-child(2n+1) ~ .odd`;
  const { window: { document } } = new JSDOM('', {
    runScripts: 'dangerously',
    url: 'https://localhost/'
  });
  const parent = document.createDocumentFragment();
  let deepest = parent;

  for (let i = 0; i < DEPTH; ++i) {
    const newNode = document.createElement('div');
    newNode.classList.add(i % 2 === 1 ? 'even' : 'odd');
    for (let j = 0; j < JUNK_CHILDREN; ++j) {
      const childNode = document.createElement('div');
      childNode.classList.add(j % 2 === 1 ? 'even' : 'odd');
      newNode.appendChild(childNode);
    }
    deepest.appendChild(newNode);
    deepest = newNode;
  }

  closest(selector.trim(), deepest);
};

const matcherMatches = () => {
  const DEPTH = 10;
  const JUNK_CHILDREN = 10;
  const sel = 'evenodd'.repeat(100);
  const selector =
    `:first-child + div.even :not(.${sel}) > :nth-child(2n+1) ~ .odd`;
  const { window: { document } } = new JSDOM('', {
    runScripts: 'dangerously',
    url: 'https://localhost/'
  });
  const parent = document.createDocumentFragment();
  let deepest = parent;

  for (let i = 0; i < DEPTH; ++i) {
    const newNode = document.createElement('div');
    newNode.classList.add(i % 2 === 1 ? 'even' : 'odd');
    for (let j = 0; j < JUNK_CHILDREN; ++j) {
      const childNode = document.createElement('div');
      childNode.classList.add(j % 2 === 1 ? 'even' : 'odd');
      newNode.appendChild(childNode);
    }
    deepest.appendChild(newNode);
    deepest = newNode;
  }

  matches(selector.trim(), deepest);
};

const matcherQuerySelector = () => {
  const DEPTH = 10;
  const JUNK_CHILDREN = 10;
  const sel = 'evenodd'.repeat(100);
  const selector =
    `:first-child + div.even :not(.${sel}) > :nth-child(2n+1) ~ .odd`;
  const { window: { document } } = new JSDOM('', {
    runScripts: 'dangerously',
    url: 'https://localhost/'
  });
  const parent = document.createDocumentFragment();
  let deepest = parent;

  for (let i = 0; i < DEPTH; ++i) {
    const newNode = document.createElement('div');
    newNode.classList.add(i % 2 === 1 ? 'even' : 'odd');
    for (let j = 0; j < JUNK_CHILDREN; ++j) {
      const childNode = document.createElement('div');
      childNode.classList.add(j % 2 === 1 ? 'even' : 'odd');
      newNode.appendChild(childNode);
    }
    deepest.appendChild(newNode);
    deepest = newNode;
  }

  querySelector(selector.trim(), deepest);
};

const matcherQuerySelectorAll = () => {
  const DEPTH = 10;
  const JUNK_CHILDREN = 10;
  const sel = 'evenodd'.repeat(100);
  const selector =
    `:first-child + div.even :not(.${sel}) > :nth-child(2n+1) ~ .odd`;
  const { window: { document } } = new JSDOM('', {
    runScripts: 'dangerously',
    url: 'https://localhost/'
  });
  const parent = document.createDocumentFragment();
  let deepest = parent;

  for (let i = 0; i < DEPTH; ++i) {
    const newNode = document.createElement('div');
    newNode.classList.add(i % 2 === 1 ? 'even' : 'odd');
    for (let j = 0; j < JUNK_CHILDREN; ++j) {
      const childNode = document.createElement('div');
      childNode.classList.add(j % 2 === 1 ? 'even' : 'odd');
      newNode.appendChild(childNode);
    }
    deepest.appendChild(newNode);
    deepest = newNode;
  }

  querySelectorAll(selector.trim(), deepest);
};

const suite = new Suite();

suite.on('start', () => {
  console.log(`benchmark ${packageName} v${version}`);
}).add('parserParseSelector', () => {
  parserParseSelector();
}).add('parserWalkAST', () => {
  parserWalkAST();
}).add('matcherClosest', () => {
  matcherClosest();
}).add('matcherMatches', () => {
  matcherMatches();
}).add('matcherQuerySelector', () => {
  matcherQuerySelector();
}).add('matcherQuerySelectorAll', () => {
  matcherQuerySelectorAll();
}).on('cycle', (evt) => {
  const { target } = evt;
  const { name: targetName } = target;
  switch (targetName) {
    case 'matcherClosest':
      console.log(`* closest\n  ${String(target)}`);
      break;
    case 'matcherMatches':
      console.log(`* matches\n  ${String(target)}`);
      break;
    case 'matcherQuerySelector':
      console.log(`* querySelector\n  ${String(target)}`);
      break;
    case 'matcherQuerySelectorAll':
      console.log(`* querySelectorAll\n  ${String(target)}`);
      break;
    case 'parserParseSelector':
      console.log(`* parseSelector\n  ${String(target)}`);
      break;
    case 'parserWalkAST':
      console.log(`* walkAST\n  ${String(target)}`);
      break;
    default:
      console.warn(`no benchmark for ${name}`);
  }
}).run({
  async: true
});
