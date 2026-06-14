/**
 * bench-nth-child.js
 * Benchmark to measure the performance of :nth-child(anb) and :nth-child(anb of S).
 */

/* import */
import { run, bench, group } from 'mitata';
import { JSDOM } from 'jsdom';
import { Finder } from '../src/js/finder.js';
import { TARGET_ALL } from '../src/js/constant.js';

// 1. Setup JSDOM and construct a massive DOM tree
const ITEM_COUNT = 3000;
const { window } = new JSDOM(`<!DOCTYPE html><html><body><ul id="list"></ul></body></html>`);
const { document } = window;
const list = document.getElementById('list');

// Add a massive amount of sibling elements (<li>)
for (let i = 0; i < ITEM_COUNT; i++) {
  const li = document.createElement('li');
  li.className = i % 2 === 0 ? 'item foo' : 'item bar';
  if (i % 2 !== 0) {
    li.textContent = 'text';
  }
  list.appendChild(li);
}

// Instantiate the Finder engine directly (to bypass NWSAPI)
const finder = new Finder(window);

console.log(`=======================================`);
console.log(`Finder :nth-child() Benchmark`);
console.log(`List Items : ${ITEM_COUNT} sibling elements`);
console.log(`=======================================`);

// 2. Execute the benchmark
group(`1. Finder :nth-child(anb)`, () => {
  bench(`Full traversal for li:nth-child(even)`, () => {
    finder.setup('li:nth-child(even)', list).find(TARGET_ALL);
  });

  bench(`Pinpoint traversal for li:nth-child(2999)`, () => {
    finder.setup('li:nth-child(2999)', list).find(TARGET_ALL);
  });
});

group(`2. Finder :nth-child(anb of S) [Complex + Pseudo-class]`, () => {
  // S = ul > .item:empty
  // This selector contains a combinator (>) and a pseudo-class (:empty),
  // but evaluation is fast enough to avoid O(N^3) freezing.
  const complexSelector = 'li:nth-child(even of ul > .item:empty)';
  const pinpointSelector = 'li:nth-child(1499 of ul > .item:empty)';

  bench(`Full traversal for ${complexSelector}`, () => {
    finder.setup(complexSelector, list).find(TARGET_ALL);
  });

  bench(`Pinpoint traversal for ${pinpointSelector}`, () => {
    finder.setup(pinpointSelector, list).find(TARGET_ALL);
  });
});

// Run the benchmark
await run({
  colors: true,
  json: false,
});
