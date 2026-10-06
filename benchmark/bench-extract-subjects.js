/**
 * benchmark/bench-extract-subjects.js
 */
import { run, bench, group } from 'mitata';
import { JSDOM } from 'jsdom';
import { DOMSelector } from '../src/index.js';

const { window } = new JSDOM('<!DOCTYPE html><html><body></body></html>');
const domSelector = new DOMSelector(window);

const selectors = [
  'div',
  '.my-class',
  '#my-id',
  'div.my-class#my-id',
  'ul > li.item',
  '.foo, div#bar',
  
  'a[href]:hover::before',
  'input[type="text"].input-box:focus',
  'main:not(.hidden) section ~ article.content',
  'div[data-foo="bar"] > p.baz'
];

console.log(`=======================================`);
console.log(`extractSubjects Fast-Path Benchmark`);
console.log(`=======================================`);

group('extractSubjects performance comparison', () => {
  for (const selector of selectors) {
    bench(`selector: "${selector}"`, () => {
      domSelector.extractSubjects(selector);
    });
  }
});

await run({ colors: true });
window.close();
