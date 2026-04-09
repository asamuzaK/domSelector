/**
 * bench-test-cases.js
 *
 * Focused benchmarks for selectors and utility cases covered by
 * test: add selector regression coverage.
 */

import { performance } from 'node:perf_hooks';
import { JSDOM } from 'jsdom';
import { DOMSelector } from '../src/index.js';
import { resolveContent } from '../src/js/utility.js';

const RUNS = Number.parseInt(process.env.BENCH_RUNS ?? '5', 10);
const ITERATIONS = Number.parseInt(process.env.BENCH_ITERATIONS ?? '5000', 10);
const COMPLEX_ITERATIONS = Number.parseInt(
  process.env.BENCH_COMPLEX_ITERATIONS ?? '20000',
  10
);
const WARMUP = Number.parseInt(process.env.BENCH_WARMUP ?? '500', 10);
const COMPLEX_WARMUP = Number.parseInt(process.env.BENCH_COMPLEX_WARMUP ?? '2000', 10);

const benchmarkResolveContent = setup => {
  const samples = [];
  for (let i = 0; i < RUNS; i++) {
    const { window } = new JSDOM('<!doctype html><html><body></body></html>', {
      runScripts: 'dangerously',
      url: 'http://localhost'
    });
    const { document } = window;
    const { node } = setup(document);
    const fn = () => resolveContent(node);
    warmup(fn, WARMUP);
    samples.push(time(fn, ITERATIONS));
    window.close();
  }
  return summarize(samples);
};

const warmup = (fn, iterations) => {
  for (let i = 0; i < iterations; i++) {
    fn();
  }
};

const time = (fn, iterations) => {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  return Number((performance.now() - start).toFixed(2));
};

const summarize = samples => {
  const sorted = [...samples].sort((a, b) => a - b);
  return {
    samples,
    median: sorted[Math.floor(sorted.length / 2)]
  };
};

const formatSummary = summary =>
  `median ${summary.median.toFixed(2)} ms  samples [${summary.samples
    .map(sample => sample.toFixed(2))
    .join(', ')}]`;

const benchmarkSelectorCase = (html, item) => {
  const samples = {
    native: [],
    patched: []
  };
  const iterations = item.complex ? COMPLEX_ITERATIONS : ITERATIONS;
  const warmupIterations = item.complex ? COMPLEX_WARMUP : WARMUP;

  for (let i = 0; i < RUNS; i++) {
    const { window } = new JSDOM(html, {
      runScripts: 'dangerously',
      url: 'http://localhost'
    });
    const { document } = window;
    const refs = item.setup(document);
    const root = item.rootKey === 'document' ? document : refs[item.rootKey];
    const domSelector = new DOMSelector(window);
    const nativeFn = () => root.querySelectorAll(item.selector);
    const patchedFn = () => domSelector.querySelectorAll(item.selector, root);

    warmup(nativeFn, warmupIterations);
    warmup(patchedFn, warmupIterations);

    samples.native.push(time(nativeFn, iterations));
    samples.patched.push(time(patchedFn, iterations));

    window.close();
  }

  return {
    native: summarize(samples.native),
    patched: summarize(samples.patched)
  };
};

const html = '<!doctype html><html><body></body></html>';

const cases = [
  {
    name: 'nth-child ignores text/comment nodes',
    selector: '.foo:nth-child(odd)',
    rootKey: 'root',
    setup(document) {
      const root = document.createElement('div');
      const foo1 = document.createElement('div');
      const foo2 = document.createElement('div');
      const foo3 = document.createElement('div');
      foo1.className = 'foo';
      foo2.className = 'foo';
      foo3.className = 'foo';
      root.append(
        document.createTextNode('before'),
        foo1,
        document.createComment('gap'),
        foo2,
        document.createTextNode('middle'),
        foo3,
        document.createComment('after')
      );
      document.body.append(root);
      return { root };
    }
  },
  {
    name: 'nth-of-type ignores text/comment nodes',
    selector: 'span:nth-of-type(odd)',
    rootKey: 'root',
    setup(document) {
      const root = document.createElement('div');
      root.append(
        document.createTextNode('before'),
        document.createElement('span'),
        document.createComment('gap'),
        document.createElement('div'),
        document.createTextNode('middle'),
        document.createElement('span'),
        document.createComment('after'),
        document.createElement('span')
      );
      document.body.append(root);
      return { root };
    }
  },
  {
    name: 'is(first/last-of-type) over dl terms',
    selector: 'dt:is(:first-of-type, :last-of-type)',
    rootKey: 'root',
    setup(document) {
      const root = document.createElement('div');
      const dl = document.createElement('dl');
      dl.innerHTML = `
        <dt id="dt1"></dt>
        <dd></dd>
        <dt id="dt2"></dt>
        <dd></dd>
        <dt id="dt3"></dt>
      `;
      root.append(dl);
      document.body.append(root);
      return { root };
    }
  },
  {
    name: 'complex sibling + structural selector',
    selector: '.box:first-child ~ .box:nth-of-type(4n) + .box .block.inner > .content',
    rootKey: 'document',
    complex: true,
    setup(document) {
      const x = 5;
      const y = 5;
      const z = 5;
      const frag = document.createDocumentFragment();
      for (let i = 0; i < x; i++) {
        const box = document.createElement('div');
        box.className = 'box container';
        for (let j = 0; j < y; j++) {
          const outer = document.createElement('div');
          outer.className = 'block outer';
          for (let k = 0; k < z; k++) {
            const inner = document.createElement('div');
            inner.className = 'block inner';
            const p = document.createElement('p');
            p.className = 'content';
            inner.append(p);
            outer.append(inner);
          }
          box.append(outer);
        }
        frag.append(box);
      }
      document.body.append(frag);
      return {};
    }
  }
];

const utilityCases = [
  {
    name: 'resolveContent detached template descendant',
    setup(document) {
      const template = document.createElement('template');
      template.innerHTML = '<div id="inner"><span id="leaf"></span></div>';
      return { node: template.content.getElementById('leaf') };
    }
  }
];

console.log(`bench:test-cases  runs=${RUNS}  iterations=${ITERATIONS}`);
console.log(`complex iterations=${COMPLEX_ITERATIONS}`);
console.log('');

for (const item of cases) {
  const { native, patched } = benchmarkSelectorCase(html, item);
  const delta = (((native.median - patched.median) / native.median) * 100).toFixed(1);

  console.log(item.name);
  console.log(`selector: ${item.selector}`);
  console.log(`native : ${formatSummary(native)}`);
  console.log(`patched: ${formatSummary(patched)}`);
  console.log(`delta  : ${delta}% vs native`);
  console.log('');
}

for (const item of utilityCases) {
  const current = benchmarkResolveContent(item.setup);
  console.log(item.name);
  console.log(`current: ${formatSummary(current)}`);
  console.log('');
}
