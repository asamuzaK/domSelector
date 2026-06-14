/**
 * benchmark/bench-dir.js
 * Benchmark to measure the O(D^2) ascendant traversal bottleneck 
 * in the Finder engine's :dir() implementation.
 */

import { run, bench, group } from 'mitata';
import { JSDOM } from 'jsdom';
import { Finder } from '../src/js/finder.js';
import { TARGET_ALL } from '../src/js/constant.js';

// 1. Setup JSDOM and construct a deeply nested DOM tree
const DEPTH = 100;
const { window } = new JSDOM(`<!DOCTYPE html><html><body><div id="root" dir="ltr"></div></body></html>`);
const { document } = window;

let current = document.getElementById('root');

// Create a deeply nested structure to trigger O(D^2) ascendant lookups
for (let i = 0; i < DEPTH; i++) {
  const child = document.createElement('div');
  // Intentionally leaving 'dir' empty so it has to traverse up to #root
  current.appendChild(child);
  current = child;
}

const finder = new Finder(window);

console.log(`=======================================`);
console.log(`Finder :dir() Benchmark`);
console.log(`Tree Depth: ${DEPTH} nested div elements`);
console.log(`=======================================`);

// 2. Execute the benchmark
group(`Finder :dir() Bottleneck Test`, () => {
  bench(`Full traversal for :dir(ltr) on deep tree`, () => {
    finder.setup(':dir(ltr)', document).find(TARGET_ALL);
  });
});

await run({ colors: true, json: false });
