/**
 * bench-cache.js
 */

/* import */
import process from 'node:process';
import { run, bench, group } from 'mitata';
import { JSDOM } from 'jsdom';
import { DOMSelector } from '../src/index.js';

// 1. Get cache size from command line arguments
let cacheSize = 4096; // Default value
const sizeArg = process.argv.find(arg => arg.startsWith('--size='));
if (sizeArg) {
  cacheSize = parseInt(sizeArg.split('=')[1], 10);
}

// 2. Setup JSDOM
const { window } = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const document = window.document;

// Create target nodes and add a common class to them
const targetNodes = [
  document.createElement('div'),
  document.createElement('span'),
  document.createElement('a'),
  document.createElement('p'),
  document.createElement('button')
];
// Add a class so we can easily target them with matching selectors
targetNodes.forEach(n => n.classList.add('benchmark-target'));

// 3. Instantiate DOMSelector
const selectorEngine = new DOMSelector(window, document, { cacheSize });

// 4. Generate selectors
const TOTAL_SELECTORS = 8000;
const selectors = [];
for (let i = 0; i < TOTAL_SELECTORS; i++) {
  if (i % 2 === 0) {
    // MATCHING selectors: 
    // These will return `true` for nwsapi.match and FORCE the heavy getAST() parsing.
    selectors.push(`.benchmark-target:not(.dummy-${i})`);
  } else {
    // NON-MATCHING selectors
    selectors.push(`.dummy-class-${i} > div + p`);
  }
}

console.log(`=======================================`);
console.log(`DOM Selector Cache Benchmark (mitata)`);
console.log(`Cache Size: ${cacheSize}`);
console.log(`Selectors : ${TOTAL_SELECTORS} (Per Node, 50% matching)`);
console.log(`Nodes     : ${targetNodes.length}`);
console.log(`=======================================`);

// 5. Setup mitata benchmark
group(`DOMSelector Check (Cache: ${cacheSize})`, () => {
  bench(`Check ${TOTAL_SELECTORS} selectors against ${targetNodes.length} nodes`, () => {
    // Evaluate all selectors sequentially for all nodes.
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
  // options to enable garbage collection if exposed
  colors: true,
  json: false,
});
