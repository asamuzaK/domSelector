/**
 * bench-nth-of-type.js
 * Benchmark to measure the O(N^2) performance degradation in the Finder
 * engine's :nth-of-type implementation.
 */

/* import */
import { run, bench, group } from 'mitata';
import { JSDOM } from 'jsdom';
import { Finder } from '../src/js/finder.js';
import { TARGET_ALL } from '../src/js/constant.js';

// 1. Setup JSDOM and construct a massive DOM tree
const ITEM_COUNT = 3000; // Sufficient number to observe the O(N^2) explosion (too many will freeze the process)
const { window } = new JSDOM(`<!DOCTYPE html><html><body><ul id="list"></ul></body></html>`);
const { document } = window;
const list = document.getElementById('list');

// Add a massive amount of sibling elements (<li>)
for (let i = 0; i < ITEM_COUNT; i++) {
  const li = document.createElement('li');
  li.className = 'item';
  li.textContent = `Item ${i}`;
  list.appendChild(li);
}

// Instantiate the Finder engine directly (to bypass NWSAPI)
const finder = new Finder(window);

console.log(`=======================================`);
console.log(`Finder :nth-of-type() Benchmark`);
console.log(`List Items : ${ITEM_COUNT} sibling elements`);
console.log(`=======================================`);

// 2. Execute the benchmark
group(`Finder O(N^2) Bottleneck Test`, () => {
  bench(`Full traversal for li:nth-of-type(even)`, () => {
    // Evaluate nth-of-type against all <li> elements in the list.
    // Without a cache, this should result in 3000 * 3000 = approx 9 million loop iterations.
    finder.setup('li:nth-of-type(even)', list).find(TARGET_ALL);
  });

  bench(`Pinpoint traversal for li:nth-of-type(2999)`, () => {
    // Pinpoint search for an element located towards the end.
    finder.setup('li:nth-of-type(2999)', list).find(TARGET_ALL);
  });
});

// Run the benchmark
await run({
  colors: true,
  json: false,
});
