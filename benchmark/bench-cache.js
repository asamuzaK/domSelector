/**
 * bench-cache.js
 */

/* import */
import process from 'node:process';
import { run, bench, group } from 'mitata';
import { JSDOM } from 'jsdom';
import { DOMSelector } from '../src/index.js';

// 1. Get arguments from command line
let cacheSize = 4096;      // Default
let nodeCount = 5;         // Default
let totalSelectors = 8000; // Default

process.argv.forEach(arg => {
  if (arg.startsWith('--size=')) {
    cacheSize = parseInt(arg.split('=')[1], 10);
  } else if (arg.startsWith('--nodes=')) {
    nodeCount = parseInt(arg.split('=')[1], 10);
  } else if (arg.startsWith('--selectors=')) {
    totalSelectors = parseInt(arg.split('=')[1], 10);
  }
});

// 2. Setup JSDOM
const { window } = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const document = window.document;

// Create target nodes
const targetNodes = [];
for (let i = 0; i < nodeCount; i++) {
  const div = document.createElement('div');
  div.classList.add('benchmark-target');
  div.id = `node-${i}`;
  targetNodes.push(div);
}

// 3. Instantiate DOMSelector
const selectorEngine = new DOMSelector(window, document, { cacheSize });

// 4. Generate selectors (using totalSelectors)
const selectors = [];
for (let i = 0; i < totalSelectors; i++) {
  if (i % 2 === 0) {
    // MATCHING selectors
    selectors.push(`.benchmark-target:not(.dummy-${i})`);
  } else {
    // NON-MATCHING selectors
    selectors.push(`.dummy-class-${i} > div + p`);
  }
}

console.log(`=======================================`);
console.log(`DOM Selector Cache Benchmark (mitata)`);
console.log(`Cache Size: ${cacheSize}`);
console.log(`Selectors : ${totalSelectors} (Per Node, 50% matching)`);
console.log(`Nodes     : ${nodeCount}`);
console.log(`=======================================`);

// 5. Setup mitata benchmark
group(`DOMSelector Check (Cache: ${cacheSize})`, () => {
  bench(`Check ${totalSelectors} selectors against ${nodeCount} nodes`, () => {
    // Evaluate all selectors sequentially for all nodes.
    for (let n = 0; n < targetNodes.length; n++) {
      const node = targetNodes[n];
      for (let s = 0; s < selectors.length; s++) {
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
