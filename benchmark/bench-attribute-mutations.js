import { Bench } from 'tinybench';
import { JSDOM } from 'jsdom';
import { DOMSelector } from '../src/index.js';
const { window } = new JSDOM();
const { document } = window;
const root = document.createElement('main');
for (let i = 0; i < 5000; i++) {
  const el = document.createElement('div');
  el.className = 'row';
  el.setAttribute('data-testid', `row-${i}`);
  el.setAttribute('title', `Row ${i}`);
  root.append(el);
}
document.body.append(root);
let target = root.lastElementChild;
const engine = new DOMSelector(window);
const bench = new Bench({ time: 350, warmupTime: 150 });
const query = () => engine.querySelectorAll('[data-testid="row-4999"]', root);
bench.add('presence, unchanged', () => engine.querySelectorAll('[data-testid]', root));
bench.add('equality, unchanged', query);
bench.add('equality, unrelated attribute mutation', () => {
  root.toggleAttribute('data-dirty');
  // Mirrors jsdom's invalidation of its selector instance after mutations.
  engine.clear();
  return query();
});
bench.add('equality, matching attribute mutation', () => {
  target.setAttribute('data-testid', target.getAttribute('data-testid') === 'row-4999' ? 'changed' : 'row-4999');
  engine.clear();
  return query();
});
bench.add('equality, subtree replacement', () => {
  const next = target.cloneNode();
  target.replaceWith(next);
  target = next;
  engine.clear();
  return query();
});
await bench.run();
console.table(bench.table());
window.close();
