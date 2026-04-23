/**
 * bench-nwsapi.js
 */

/* import */
import process from 'node:process';
import { run, bench, group } from 'mitata';
import { JSDOM } from 'jsdom';
import { nwsapi } from '../src/js/nwsapi.js';

let cacheSize = 2048;
let nodeCount = 5;
let totalSelectors = 8000;

process.argv.forEach(arg => {
  if (arg.startsWith('--size=')) {
    cacheSize = parseInt(arg.split('=')[1], 10);
  } else if (arg.startsWith('--nodes=')) {
    nodeCount = parseInt(arg.split('=')[1], 10);
  } else if (arg.startsWith('--selectors=')) {
    totalSelectors = parseInt(arg.split('=')[1], 10);
  }
});

const { window } = new JSDOM('<!DOCTYPE html><html><body><div id="container"></div></body></html>');
const { document } = window;
const container = document.getElementById('container');

const targetNodes = [];
for (let i = 0; i < nodeCount; i++) {
  const div = document.createElement('div');
  div.classList.add('benchmark-target');
  div.id = `node-${i}`;
  const span = document.createElement('span');
  const p = document.createElement('p');
  div.appendChild(span);
  div.appendChild(p);
  
  container.appendChild(div);
  targetNodes.push(div);
}

const nw = nwsapi({
  document: document,
  DOMException: window.document.defaultView.DOMException // JSDOMの型に合わせる
});

nw.configure({ 
  CACHE_SIZE: cacheSize,
}, true);

const selectors = [];
for (let i = 0; i < totalSelectors; i++) {
  const mod = i % 4;
  if (mod === 0) {
    selectors.push(`.benchmark-target:not(.dummy-${i})`);
  } else if (mod === 1) {
    selectors.push(`.benchmark-target:nth-child(${ (i % nodeCount) + 1 })`);
  } else if (mod === 2) {
    selectors.push(`div:nth-of-type(${ (i % nodeCount) + 1 })`);
  } else {
    selectors.push(`.dummy-class-${i} > div + p`);
  }
}

console.log(`=======================================`);
console.log(`nwsapi Engine Benchmark (with Cache Config)`);
console.log(`Cache Size: ${cacheSize}`);
console.log(`Selectors : ${totalSelectors} (Includes nth-child/of-type)`);
console.log(`Nodes     : ${nodeCount}`);
console.log(`=======================================`);

group(`nwsapi Performance (Cache: ${cacheSize})`, () => {
  
  bench(`match() sequence - ${totalSelectors} selectors`, () => {
    for (let n = 0; n < targetNodes.length; n++) {
      const node = targetNodes[n];
      for (let s = 0; s < selectors.length; s++) {
        try {
          nw.match(selectors[s], node);
        } catch (e) {
          // fall through
        }
      }
    }
  });

  bench(`match() cached - ${totalSelectors} selectors (2nd run)`, () => {
    for (let n = 0; n < targetNodes.length; n++) {
      const node = targetNodes[n];
      for (let s = 0; s < selectors.length; s++) {
        nw.match(selectors[s], node);
      }
    }
  });
});

await run({
  colors: true,
  json: false,
});
