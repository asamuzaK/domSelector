/**
 * bench-cache-monster.js
 */

/* import */
import process from 'node:process';
import { run, bench, group } from 'mitata';
import { JSDOM } from 'jsdom';
import { DOMSelector } from '../src/index.js';

// 1. Get cache size from command line arguments
let cacheSize = 4096;
const sizeArg = process.argv.find(arg => arg.startsWith('--size='));
if (sizeArg) {
  cacheSize = parseInt(sizeArg.split('=')[1], 10);
}

// 2. Setup JSDOM
const { window } = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const document = window.document;

const targetNodes = [
  document.createElement('div'),
  document.createElement('span'),
  document.createElement('a'),
  document.createElement('p'),
  document.createElement('button')
];
targetNodes.forEach(n => n.classList.add('benchmark-target'));

// 3. Instantiate DOMSelector
const selectorEngine = new DOMSelector(window, document, { cacheSize });

// 4. Generate "Monster" selectors
const TOTAL_SELECTORS = 30000;
const selectors = [];
for (let i = 0; i < TOTAL_SELECTORS; i++) {
  if (i % 2 === 0) {
    selectors.push(`.benchmark-target:not(.dummy-monster-${i})`);
  } else {
    selectors.push(`.dummy-class-${i} > div + p:nth-child(odd)`);
  }
}

console.log(`=======================================`);
console.log(`DOM Selector Cache Benchmark: MONSTER CSS`);
console.log(`Cache Size: ${cacheSize}`);
console.log(`Selectors : ${TOTAL_SELECTORS} (Per Node, 50% matching)`);
console.log(`Nodes     : ${targetNodes.length}`);
console.log(`=======================================`);

// 5. Setup mitata benchmark
group(`Monster CSS Check (Cache: ${cacheSize})`, () => {
  bench(`Check ${TOTAL_SELECTORS} selectors against ${targetNodes.length} nodes`, () => {
    for (let n = 0; n < targetNodes.length; n++) {
      const node = targetNodes[n];
      for (let s = 0; s < TOTAL_SELECTORS; s++) {
        selectorEngine.check(selectors[s], node);
      }
    }
  });
});

// Run the benchmark
await run({
  colors: true,
  json: false,
});
