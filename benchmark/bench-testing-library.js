/**
 * benchmark/bench-testing-library.js
 */
import { run, bench, group } from 'mitata';
import { JSDOM } from 'jsdom';
import { DOMSelector } from '../src/index.js';

const DEPTH = 4;
const CHILDREN_PER_NODE = 8; // Total ~4680 nodes

const { window } = new JSDOM(`<!DOCTYPE html><html><body><div id="root"></div></body></html>`);
const { document } = window;
const root = document.getElementById('root');

let idCounter = 0;

function buildTree(parent, currentDepth) {
  if (currentDepth >= DEPTH) return;
  for (let i = 0; i < CHILDREN_PER_NODE; i++) {
    const el = document.createElement(i % 5 === 0 ? 'svg' : i % 3 === 0 ? 'input' : 'div');
    el.className = `level-${currentDepth}`;
    if (i % 2 === 0) {
      el.setAttribute('data-testid', `test-id-${idCounter}`);
    }
    if (i % 3 === 0) {
      el.setAttribute('title', `title-${idCounter}`);
    }
    if (el.localName === 'input' && i % 2 !== 0) {
      el.setAttribute('placeholder', `placeholder-${idCounter}`);
    }

    if (el.localName === 'svg') {
      const title = document.createElement('title');
      title.textContent = `svg-title-${idCounter}`;
      el.appendChild(title);
    }

    buildTree(el, currentDepth + 1);
    parent.appendChild(el);
    idCounter++;
  }
}
buildTree(root, 0);

const targetTestId = document.createElement('div');
targetTestId.setAttribute('data-testid', 'target-test-id');
root.appendChild(targetTestId);

const targetTitle = document.createElement('div');
targetTitle.setAttribute('title', 'target-title');
root.appendChild(targetTitle);

const targetPlaceholder = document.createElement('input');
targetPlaceholder.setAttribute('placeholder', 'target-placeholder');
root.appendChild(targetPlaceholder);

const totalElements = document.querySelectorAll('*').length;

const domSelector = new DOMSelector(window);

console.log(`=======================================`);
console.log(`DOMSelector Testing Library Queries Benchmark`);
console.log(`Tree Depth: ${DEPTH}, Children per Node: ${CHILDREN_PER_NODE}`);
console.log(`Total Elements in Document: ${totalElements}`);
console.log(`=======================================`);

group(`Testing Library Typical Queries (document)`, () => {
  bench(`[data-testid="target-test-id"]`, () => {
    domSelector.querySelectorAll('[data-testid="target-test-id"]', document);
  });

  bench(`[title="target-title"]`, () => {
    domSelector.querySelectorAll('[title="target-title"]', document);
  });

  bench(`[placeholder="target-placeholder"]`, () => {
    domSelector.querySelectorAll('[placeholder="target-placeholder"]', document);
  });

  bench(`[title="target-title"], svg title`, () => {
    domSelector.querySelectorAll('[title="target-title"], svg title', document);
  });
});

group(`Testing Library Typical Queries (Element)`, () => {
  bench(`[data-testid="target-test-id"]`, () => {
    domSelector.querySelectorAll('[data-testid="target-test-id"]', root);
  });

  bench(`[title="target-title"]`, () => {
    domSelector.querySelectorAll('[title="target-title"]', root);
  });

  bench(`[placeholder="target-placeholder"]`, () => {
    domSelector.querySelectorAll('[placeholder="target-placeholder"]', root);
  });

  bench(`[title="target-title"], svg title`, () => {
    domSelector.querySelectorAll('[title="target-title"], svg title', root);
  });
});

await run({ colors: true });
