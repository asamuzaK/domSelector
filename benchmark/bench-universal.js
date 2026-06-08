/**
 * benchmark/bench-universal.js
 */
import { run, bench, group } from 'mitata';
import { JSDOM } from 'jsdom';
import { DOMSelector } from '../src/index.js';

const DEPTH = 5;
const CHILDREN_PER_NODE = 10;

const { window } = new JSDOM(`<!DOCTYPE html><html><body><div id="root"></div></body></html>`);
const { document } = window;
const root = document.getElementById('root');

function buildTree(parent, currentDepth) {
  if (currentDepth >= DEPTH) return;
  for (let i = 0; i < CHILDREN_PER_NODE; i++) {
    const el = document.createElement('div');
    el.className = `level-${currentDepth}`;
    buildTree(el, currentDepth + 1);
    parent.appendChild(el);
  }
}
buildTree(root, 0);

const totalElements = document.querySelectorAll('*').length;

const domSelector = new DOMSelector(window);

console.log(`=======================================`);
console.log(`DOMSelector Universal Selector Benchmark`);
console.log(`Tree Depth: ${DEPTH}, Children per Node: ${CHILDREN_PER_NODE}`);
console.log(`Total Elements in Document: ${totalElements}`);
console.log(`=======================================`);

group(`document.querySelectorAll()`, () => {
  bench(`document.querySelectorAll('*')`, () => {
    domSelector.querySelectorAll('*', document);
  });

  bench(`document.querySelectorAll('*|*')`, () => {
    domSelector.querySelectorAll('*|*', document);
  });
});

group(`Element.querySelectorAll()`, () => {
  bench(`element.querySelectorAll('*')`, () => {
    domSelector.querySelectorAll('*', root);
  });

  bench(`element.querySelectorAll('*|*')`, () => {
    domSelector.querySelectorAll('*|*', root);
  });
});

await run({ colors: true });
