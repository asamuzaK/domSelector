/**
 * bench-default.js
 * Benchmark to measure the O(N^2) form traversal bottleneck in the Finder engine's :default implementation.
 */

/* import */
import { run, bench, group } from 'mitata';
import { JSDOM } from 'jsdom';
import { Finder } from '../src/js/finder.js';
import { TARGET_ALL } from '../src/js/constant.js';

// 1. Setup JSDOM and construct a form with a large number of submit buttons
const ITEM_COUNT = 5000;
const { window } = new JSDOM(`<!DOCTYPE html><html><body><form id="form"></form></body></html>`);
const { document } = window;
const form = document.getElementById('form');

// Populate the form with multiple button elements to trigger O(N^2) loops per evaluation
for (let i = 0; i < ITEM_COUNT; i++) {
  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = `Submit ${i}`;
  form.appendChild(button);
}

// Instantiate the Finder engine directly
const finder = new Finder(window);

console.log(`=======================================`);
console.log(`Finder :default Benchmark`);
console.log(`Button Items : ${ITEM_COUNT} elements in a single form`);
console.log(`=======================================`);

// 2. Execute the benchmark
group(`Finder :default Bottleneck Test`, () => {
  
  bench(`Full traversal for button:default`, () => {
    // Evaluate :default against all buttons in the form.
    // Without a cache, evaluating each button forces a re-scan of the form from the top.
    finder.setup('button:default', form).find(TARGET_ALL);
  });

});

// Run the benchmark
await run({
  colors: true,
  json: false,
});
