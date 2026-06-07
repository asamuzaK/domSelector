/**
 * bench-has.js
 * Benchmark to measure the performance of :has() pre-filtering and bailout behaviors.
 */

/* import */
import { run, bench, group } from 'mitata';
import { JSDOM } from 'jsdom';
import { Finder } from '../src/js/finder.js';
import { TARGET_ALL } from '../src/js/constant.js';

// 1. Setup JSDOM and construct a massive DOM tree (計 3,001 要素)
const { window } = new JSDOM(`<!doctype html><html><body><main id="root"></main></body></html>`);
const { document } = window;
const main = document.getElementById('root');
const items = 300;
const childItems = 10;

for (let i = 0; i < items; i++) {
  const parent = document.createElement('div');
  parent.className = 'block';
  for (let j = 0; j < childItems; j++) {
    const child = document.createElement('p');
    child.className = 'item';
    parent.appendChild(child);
  }
  main.appendChild(parent);
}

const deepParent = main.children[items - 1].children[childItems - 1];
const rareTarget = document.createElement('span');
rareTarget.className = 'needle';
deepParent.appendChild(rareTarget);

const finder = new Finder(window);

console.log(`=======================================`);
console.log(`Finder :has() Full Tree Search Benchmark`);
console.log(`Total elements inside root : ~${items * childItems} elements`);
console.log(`=======================================`);

// 2. Execute the benchmark using find(TARGET_ALL)
group(`1. Sparse Seed Optimization (Full Tree Search)`, () => {
  const sparseSelector = 'div.block:has(.needle)';

  bench(`find(TARGET_ALL) for ${sparseSelector}`, () => {
    finder.setup(sparseSelector, main).find(TARGET_ALL);
  });
});

group(`2. Dense Seed Protection (Bailout Mode)`, () => {
  const denseSelector = 'div.block:has(.item)';

  bench(`find(TARGET_ALL) with Bailout for ${denseSelector}`, () => {
    finder.setup(denseSelector, main).find(TARGET_ALL);
  });
});

// Run the benchmark using mitata engine
await run({
  colors: true,
  json: false,
});
