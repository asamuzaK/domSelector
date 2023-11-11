/**
 * bench.js
 */

/* import */
import { promises as fsPromise } from 'node:fs';
import path from 'node:path';
import Benchmark from 'benchmark';
import { JSDOM } from 'jsdom';
import {
  closest, matches, querySelector, querySelectorAll
} from '../src/index.js';

let document, targetNode, patchedDoc, patchedTargetNode;

const prepareDom = () => {
  const doctype = '<!doctype html>';
  const html = '<html lang="en"><head></head><body></body></html>';
  const { window } = new JSDOM(`${doctype}${html}`, {
    runScripts: 'dangerously',
    url: 'http://localhost'
  });
  document = window.document;

  /* create dom */
  const x = 10;
  const y = 10;
  const z = 10;
  const xFrag = document.createDocumentFragment();
  for (let i = 0; i < x; i++) {
    const xNode = document.createElement('div');
    xNode.id = `box${i}`;
    xNode.classList.add('box', 'container');
    const yFrag = document.createDocumentFragment();
    for (let j = 0; j < y; j++) {
      const yNode = document.createElement('div');
      yNode.id = `div${i}-${j}`;
      yNode.classList.add('block', 'outer');
      for (let k = 0; k < z; k++) {
        const zNode = document.createElement('div');
        zNode.id = `div${i}-${j}-${k}`;
        zNode.classList.add('block', 'inner');
        const p = document.createElement('p');
        p.id = `p${i}-${j}-${k}`;
        p.classList.add('content');
        p.textContent = `${i}-${j}-${k}`;
        zNode.append(p);
        yNode.append(zNode);
      }
      yFrag.append(yNode);
    }
    xNode.append(yFrag);
    xFrag.append(xNode);
  }
  const container = document.createElement('div');
  container.setAttribute('id', 'container');
  container.classList.add('container');
  container.append(xFrag);
  document.body.append(container);

  targetNode = document.getElementById(`p${x - 1}-${y - 1}-${z - 1}`);

  /* create patched dom */
  const domstr = new window.XMLSerializer().serializeToString(document);
  const { window: patchedWin } = new JSDOM(domstr, {
    runScripts: 'dangerously',
    url: 'http://localhost',
    beforeParse: window => {
      window.Element.prototype.matches = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return matches(selector, this);
      };
      window.Element.prototype.closest = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return closest(selector, this);
      };
      window.Document.prototype.querySelector = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return querySelector(selector, this);
      };
      window.DocumentFragment.prototype.querySelector = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return querySelector(selector, this);
      };
      window.Element.prototype.querySelector = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return querySelector(selector, this);
      };
      window.Document.prototype.querySelectorAll = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return querySelectorAll(selector, this);
      };
      window.DocumentFragment.prototype.querySelectorAll = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return querySelectorAll(selector, this);
      };
      window.Element.prototype.querySelectorAll = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return querySelectorAll(selector, this);
      };
    }
  });

  patchedDoc = patchedWin.document;
  patchedTargetNode = patchedDoc.getElementById(`p${x - 1}-${y - 1}-${z - 1}`);
};

/* selectors */
const selectors = [
  '.container.box',
  '.container:not(.box)',
  '.box + .box',
  '.box ~ .box',
  '.box > .block',
  '.box .content',
  '.box:first-child ~ .box:nth-of-type(4n+1) + .box .block.inner > .content',
  '.box:first-child ~ .box:nth-of-type(4n+1) + .box .block.inner:has(>.content)'
];

/* matcher tests */
const elementMatches = (api, selector) => {
  let node;
  if (api === 'patched-jsdom') {
    node = patchedTargetNode;
  } else {
    node = targetNode;
  }
  node.matches(selector);
};

const elementClosest = (api, selector) => {
  let node;
  if (api === 'patched-jsdom') {
    node = patchedTargetNode;
  } else {
    node = targetNode;
  }
  node.closest(selector);
};

const parentNodeQuerySelector = (api, selector) => {
  let node;
  if (api === 'patched-jsdom') {
    node = patchedDoc;
  } else {
    node = document;
  }
  node.querySelector(selector);
};

const parentNodeQuerySelectorAll = (api, selector) => {
  let node;
  if (api === 'patched-jsdom') {
    node = patchedDoc;
  } else {
    node = document;
  }
  node.querySelectorAll(selector);
};

/* benchmark */
const hz = new Map();
const suite = new Benchmark.Suite();

suite.on('start', async () => {
  const filePath = path.resolve('./package.json');
  const value = await fsPromise.readFile(filePath, {
    encoding: 'utf8',
    flag: 'r'
  });
  const { name: pkgName, version } = JSON.parse(value);
  console.log(`benchmark ${pkgName} v${version}`);
  prepareDom();
}).add(`jsdom matches('${selectors[0]}')`, () => {
  elementMatches('jsdom', selectors[0]);
}).add(`patched-jsdom matches('${selectors[0]}')`, () => {
  elementMatches('patched-jsdom', selectors[0]);
}).add(`jsdom matches('${selectors[1]}')`, () => {
  elementMatches('jsdom', selectors[1]);
}).add(`patched-jsdom matches('${selectors[1]}')`, () => {
  elementMatches('patched-jsdom', selectors[1]);
}).add(`jsdom matches('${selectors[2]}')`, () => {
  elementMatches('jsdom', selectors[2]);
}).add(`patched-jsdom matches('${selectors[2]}')`, () => {
  elementMatches('patched-jsdom', selectors[2]);
}).add(`jsdom matches('${selectors[3]}')`, () => {
  elementMatches('jsdom', selectors[3]);
}).add(`patched-jsdom matches('${selectors[3]}')`, () => {
  elementMatches('patched-jsdom', selectors[3]);
}).add(`jsdom matches('${selectors[4]}')`, () => {
  elementMatches('jsdom', selectors[4]);
}).add(`patched-jsdom matches('${selectors[4]}')`, () => {
  elementMatches('patched-jsdom', selectors[4]);
}).add(`jsdom matches('${selectors[5]}')`, () => {
  elementMatches('jsdom', selectors[5]);
}).add(`patched-jsdom matches('${selectors[5]}')`, () => {
  elementMatches('patched-jsdom', selectors[5]);
}).add(`jsdom matches('${selectors[6]}')`, () => {
  elementMatches('jsdom', selectors[6]);
}).add(`patched-jsdom matches('${selectors[6]}')`, () => {
  elementMatches('patched-jsdom', selectors[6]);
}).add(`jsdom matches('${selectors[7]}')`, () => {
  elementMatches('jsdom', selectors[7]);
}).add(`patched-jsdom matches('${selectors[7]}')`, () => {
  elementMatches('patched-jsdom', selectors[7]);
}).add(`jsdom closest('${selectors[0]}')`, () => {
  elementClosest('jsdom', selectors[0]);
}).add(`patched-jsdom closest('${selectors[0]}')`, () => {
  elementClosest('patched-jsdom', selectors[0]);
}).add(`jsdom closest('${selectors[1]}')`, () => {
  elementClosest('jsdom', selectors[1]);
}).add(`patched-jsdom closest('${selectors[1]}')`, () => {
  elementClosest('patched-jsdom', selectors[1]);
}).add(`jsdom closest('${selectors[2]}')`, () => {
  elementClosest('jsdom', selectors[2]);
}).add(`patched-jsdom closest('${selectors[2]}')`, () => {
  elementClosest('patched-jsdom', selectors[2]);
}).add(`jsdom closest('${selectors[3]}')`, () => {
  elementClosest('jsdom', selectors[3]);
}).add(`patched-jsdom closest('${selectors[3]}')`, () => {
  elementClosest('patched-jsdom', selectors[3]);
}).add(`jsdom closest('${selectors[4]}')`, () => {
  elementClosest('jsdom', selectors[4]);
}).add(`patched-jsdom closest('${selectors[4]}')`, () => {
  elementClosest('patched-jsdom', selectors[4]);
}).add(`jsdom closest('${selectors[5]}')`, () => {
  elementClosest('jsdom', selectors[5]);
}).add(`patched-jsdom closest('${selectors[5]}')`, () => {
  elementClosest('patched-jsdom', selectors[5]);
}).add(`jsdom closest('${selectors[6]}')`, () => {
  elementClosest('jsdom', selectors[6]);
}).add(`patched-jsdom closest('${selectors[6]}')`, () => {
  elementClosest('patched-jsdom', selectors[6]);
}).add(`jsdom closest('${selectors[7]}')`, () => {
  elementClosest('jsdom', selectors[7]);
}).add(`patched-jsdom closest('${selectors[7]}')`, () => {
  elementClosest('patched-jsdom', selectors[7]);
}).add(`jsdom querySelector('${selectors[0]}')`, () => {
  parentNodeQuerySelector('jsdom', selectors[0]);
}).add(`patched-jsdom querySelector('${selectors[0]}')`, () => {
  parentNodeQuerySelector('patched-jsdom', selectors[0]);
}).add(`jsdom querySelector('${selectors[1]}')`, () => {
  parentNodeQuerySelector('jsdom', selectors[1]);
}).add(`patched-jsdom querySelector('${selectors[1]}')`, () => {
  parentNodeQuerySelector('patched-jsdom', selectors[1]);
}).add(`jsdom querySelector('${selectors[2]}')`, () => {
  parentNodeQuerySelector('jsdom', selectors[2]);
}).add(`patched-jsdom querySelector('${selectors[2]}')`, () => {
  parentNodeQuerySelector('patched-jsdom', selectors[2]);
}).add(`jsdom querySelector('${selectors[3]}')`, () => {
  parentNodeQuerySelector('jsdom', selectors[3]);
}).add(`patched-jsdom querySelector('${selectors[3]}')`, () => {
  parentNodeQuerySelector('patched-jsdom', selectors[3]);
}).add(`jsdom querySelector('${selectors[4]}')`, () => {
  parentNodeQuerySelector('jsdom', selectors[4]);
}).add(`patched-jsdom querySelector('${selectors[4]}')`, () => {
  parentNodeQuerySelector('patched-jsdom', selectors[4]);
}).add(`jsdom querySelector('${selectors[5]}')`, () => {
  parentNodeQuerySelector('jsdom', selectors[5]);
}).add(`patched-jsdom querySelector('${selectors[5]}')`, () => {
  parentNodeQuerySelector('patched-jsdom', selectors[5]);
}).add(`jsdom querySelector('${selectors[6]}')`, () => {
  parentNodeQuerySelector('jsdom', selectors[6]);
}).add(`patched-jsdom querySelector('${selectors[6]}')`, () => {
  parentNodeQuerySelector('patched-jsdom', selectors[6]);
}).add(`jsdom querySelector('${selectors[7]}')`, () => {
  parentNodeQuerySelector('jsdom', selectors[7]);
}).add(`patched-jsdom querySelector('${selectors[7]}')`, () => {
  parentNodeQuerySelector('patched-jsdom', selectors[7]);
}).add(`jsdom querySelectorAll('${selectors[0]}')`, () => {
  parentNodeQuerySelectorAll('jsdom', selectors[0]);
}).add(`patched-jsdom querySelectorAll('${selectors[0]}')`, () => {
  parentNodeQuerySelectorAll('patched-jsdom', selectors[0]);
}).add(`jsdom querySelectorAll('${selectors[1]}')`, () => {
  parentNodeQuerySelectorAll('jsdom', selectors[1]);
}).add(`patched-jsdom querySelectorAll('${selectors[1]}')`, () => {
  parentNodeQuerySelectorAll('patched-jsdom', selectors[1]);
}).add(`jsdom querySelectorAll('${selectors[2]}')`, () => {
  parentNodeQuerySelectorAll('jsdom', selectors[2]);
}).add(`patched-jsdom querySelectorAll('${selectors[2]}')`, () => {
  parentNodeQuerySelectorAll('patched-jsdom', selectors[2]);
}).add(`jsdom querySelectorAll('${selectors[3]}')`, () => {
  parentNodeQuerySelectorAll('jsdom', selectors[3]);
}).add(`patched-jsdom querySelectorAll('${selectors[3]}')`, () => {
  parentNodeQuerySelectorAll('patched-jsdom', selectors[3]);
}).add(`jsdom querySelectorAll('${selectors[4]}')`, () => {
  parentNodeQuerySelectorAll('jsdom', selectors[4]);
}).add(`patched-jsdom querySelectorAll('${selectors[4]}')`, () => {
  parentNodeQuerySelectorAll('patched-jsdom', selectors[4]);
}).add(`jsdom querySelectorAll('${selectors[5]}')`, () => {
  parentNodeQuerySelectorAll('jsdom', selectors[5]);
}).add(`patched-jsdom querySelectorAll('${selectors[5]}')`, () => {
  parentNodeQuerySelectorAll('patched-jsdom', selectors[5]);
}).add(`jsdom querySelectorAll('${selectors[6]}')`, () => {
  parentNodeQuerySelectorAll('jsdom', selectors[6]);
}).add(`patched-jsdom querySelectorAll('${selectors[6]}')`, () => {
  parentNodeQuerySelectorAll('patched-jsdom', selectors[6]);
}).add(`jsdom querySelectorAll('${selectors[7]}')`, () => {
  parentNodeQuerySelectorAll('jsdom', selectors[7]);
}).add(`patched-jsdom querySelectorAll('${selectors[7]}')`, () => {
  parentNodeQuerySelectorAll('patched-jsdom', selectors[7]);
}).on('cycle', evt => {
  const { target } = evt;
  const str = String(target);
  if (str.startsWith('jsdom')) {
    hz.set('jsdom', target.hz);
    console.log(`\n* ${str}`);
  } else {
    const jsdomHz = hz.get('jsdom');
    const patchedHz = evt.target.hz;
    const elapsed = `patched-jsdom took ${(1000 / patchedHz).toFixed(3)}msec.`;
    let msg;
    if (jsdomHz > patchedHz) {
      msg = `jsdom is ${(jsdomHz / patchedHz).toFixed(1)} times faster.`;
    } else {
      msg =
        `patched-jsdom is ${(patchedHz / jsdomHz).toFixed(1)} times faster.`;
    }
    hz.clear();
    console.log(`* ${str}`);
    console.log(`* ${msg} ${elapsed}`);
  }
}).run({
  async: true
});
