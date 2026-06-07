/**
 * benchmark/bench-lang.js
 * Benchmark to measure the O(D^2) ascendant traversal bottleneck 
 * in the Finder engine's :lang() implementation.
 */

import { run, bench, group } from 'mitata';
import { JSDOM } from 'jsdom';
import { Finder } from '../src/js/finder.js';
import { TARGET_ALL } from '../src/js/constant.js';

// 1. Setup JSDOM and construct a deeply nested DOM tree
const DEPTH = 10000;
const { window } = new JSDOM(`<!DOCTYPE html><html><body><div id="root" lang="en"></div></body></html>`);
const { document } = window;

let current = document.getElementById('root');

// Create a deeply nested structure to trigger O(D^2) ascendant lookups
for (let i = 0; i < DEPTH; i++) {
  const child = document.createElement('div');
  // 意図的に lang を空にして、#root まで遡上させる
  current.appendChild(child);
  current = child;
}

const finder = new Finder(window);

console.log(`=======================================`);
console.log(`Finder :lang() Benchmark`);
console.log(`Tree Depth: ${DEPTH} nested div elements`);
console.log(`=======================================`);

// 2. Execute the benchmark
group(`Finder :lang() Bottleneck Test`, () => {
  bench(`Full traversal for :lang(en) on deep tree`, () => {
    // 遡上キャッシュが効いていれば、100回分のO(1)アクセスで瞬殺されるはず
    finder.setup(':lang(en)', document).find(TARGET_ALL);
  });
});

await run({ colors: true, json: false });
