/**
 * benchmark/bench-valid-invalid.js
 */
import { run, bench, group } from 'mitata';
import { JSDOM } from 'jsdom';
import { Finder } from '../src/js/finder.js';
import { TARGET_ALL } from '../src/js/constant.js';

const FIELDSET_COUNT = 100;
const INPUT_PER_FIELDSET = 200;

const { window } = new JSDOM(`<!DOCTYPE html><html><body><form id="form"></form></body></html>`);
const { document } = window;
const form = document.getElementById('form');

for (let i = 0; i < FIELDSET_COUNT; i++) {
  const fs = document.createElement('fieldset');
  for (let j = 0; j < INPUT_PER_FIELDSET; j++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.required = true;
    input.value = `val`;
    fs.appendChild(input);
  }
  form.appendChild(fs);
}

const finder = new Finder(window);

console.log(`=======================================`);
console.log(`Finder :valid / :invalid Benchmark`);
console.log(`Fieldsets: ${FIELDSET_COUNT}, Inputs per fieldset: ${INPUT_PER_FIELDSET}`);
console.log(`=======================================`);

group(`Finder :valid Bottleneck Test`, () => {
  bench(`Full traversal for fieldset:valid`, () => {
    finder.setup('fieldset:valid, fieldset:invalid', form).find(TARGET_ALL);
  });
});

await run({ colors: true, json: false });
