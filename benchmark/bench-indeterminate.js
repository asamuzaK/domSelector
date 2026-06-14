/**
 * bench-indeterminate.js
 * Benchmark to measure the O(N^2) performance degradation in the Finder engine's :indeterminate implementation.
 */

/* import */
import { run, bench, group } from 'mitata';
import { JSDOM } from 'jsdom';
import { Finder } from '../src/js/finder.js';
import { TARGET_ALL } from '../src/js/constant.js';

// 1. Setup JSDOM and construct a form with many un-checked radio buttons
const ITEM_COUNT = 1000;
const { window } = new JSDOM(`<!DOCTYPE html><html><body><form id="form"></form></body></html>`);
const { document } = window;
const form = document.getElementById('form');

// Add a large number of radio buttons belonging to the exact same name group
for (let i = 0; i < ITEM_COUNT; i++) {
  const input = document.createElement('input');
  input.type = 'radio';
  input.name = 'radiogroup';
  input.className = 'radio-item';
  // Leave them all unchecked to trigger the full indeterminate evaluation path
  form.appendChild(input);
}

// Instantiate the Finder engine directly
const finder = new Finder(window);

console.log(`=======================================`);
console.log(`Finder :indeterminate Benchmark`);
console.log(`Radio Items : ${ITEM_COUNT} elements in a single group`);
console.log(`=======================================`);

// 2. Execute the benchmark
group(`Finder :indeterminate Bottleneck Test`, () => {
  bench(`Full traversal for input:indeterminate`, () => {
    finder.setup('input:indeterminate', form).find(TARGET_ALL);
  });
});

// Run the benchmark
await run({
  colors: true,
  json: false,
});
