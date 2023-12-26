/**
 * bench.js
 */

/* import */
import fs from 'node:fs';
import path from 'node:path';
import Benchmark from 'benchmark';
import { JSDOM } from 'jsdom';
import * as happyDom from 'happy-dom';
import * as linkedom from 'linkedom';
import {
  closest, matches, querySelector, querySelectorAll
} from '../src/index.js';

let document, targetNode, patchedDoc, patchedTarget;
let happyDoc, happyTarget, linkedDoc, linkedTarget;

const prepareDom = () => {
  const doctype = '<!doctype html>';
  const html = '<html lang="en"><head></head><body></body></html>';

  /* prepare jsdom */
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

  /* dom string */
  const domstr = new window.XMLSerializer().serializeToString(document);

  /* prepare happy-dom */
  const { window: happyWin } = new happyDom.Window({
    url: 'http://localhost',
    width: 1024,
    height: 768
  });

  happyDoc = new happyWin.DOMParser().parseFromString(domstr, 'text/html');
  happyTarget = happyDoc.getElementById(`p${x - 1}-${y - 1}-${z - 1}`);

  /* prepare linkedom */
  linkedDoc = linkedom.parseHTML(domstr).document;
  linkedTarget = linkedDoc.getElementById(`p${x - 1}-${y - 1}-${z - 1}`);

  /* prepare patched jsdom */
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
  patchedTarget = patchedDoc.getElementById(`p${x - 1}-${y - 1}-${z - 1}`);
};

/* selectors */
const selectors = [
  'p.content',
  'div.container:not(.box)',
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
  if (api === 'jsdom') {
    node = targetNode;
  } else if (api === 'happydom') {
    node = happyTarget;
  } else if (api === 'linkedom') {
    node = linkedTarget;
  } else {
    node = patchedTarget;
  }
  node.matches(selector);
};

const elementClosest = (api, selector) => {
  let node;
  if (api === 'jsdom') {
    node = targetNode;
  } else if (api === 'happydom') {
    node = happyTarget;
  } else if (api === 'linkedom') {
    node = linkedTarget;
  } else {
    node = patchedTarget;
  }
  node.closest(selector);
};

const parentNodeQuerySelector = (api, selector) => {
  let node;
  if (api === 'jsdom') {
    node = document;
  } else if (api === 'happydom') {
    node = happyDoc;
  } else if (api === 'linkedom') {
    node = linkedDoc;
  } else {
    node = patchedDoc;
  }
  node.querySelector(selector);
};

const parentNodeQuerySelectorAll = (api, selector) => {
  let node;
  if (api === 'jsdom') {
    node = document;
  } else if (api === 'happydom') {
    node = happyDoc;
  } else if (api === 'linkedom') {
    node = linkedDoc;
  } else {
    node = patchedDoc;
  }
  node.querySelectorAll(selector);
};

/* benchmark */
const hz = new Map();
const suite = new Benchmark.Suite();

suite.on('start', () => {
  const filePath = path.resolve('./package.json');
  const value = fs.readFileSync(filePath, {
    encoding: 'utf8',
    flag: 'r'
  });
  const { name: pkgName, version } = JSON.parse(value);
  console.log(`benchmark ${pkgName} v${version}`);
  prepareDom();
}).add(`jsdom matches('${selectors[0]}')`, () => {
  elementMatches('jsdom', selectors[0]);
}).add(`happydom matches('${selectors[0]}')`, () => {
  elementMatches('happydom', selectors[0]);
}).add(`linkedom matches('${selectors[0]}')`, () => {
  elementMatches('linkedom', selectors[0]);
}).add(`patched-jsdom matches('${selectors[0]}')`, () => {
  elementMatches('patched-jsdom', selectors[0]);
}).add(`jsdom matches('${selectors[1]}')`, () => {
  elementMatches('jsdom', selectors[1]);
}).add(`happydom matches('${selectors[1]}')`, () => {
  elementMatches('happydom', selectors[1]);
}).add(`linkedom matches('${selectors[1]}')`, () => {
  elementMatches('linkedom', selectors[1]);
}).add(`patched-jsdom matches('${selectors[1]}')`, () => {
  elementMatches('patched-jsdom', selectors[1]);
}).add(`jsdom matches('${selectors[2]}')`, () => {
  elementMatches('jsdom', selectors[2]);
}).add(`happydom matches('${selectors[2]}')`, () => {
  elementMatches('happydom', selectors[2]);
}).add(`linkedom matches('${selectors[2]}')`, () => {
  elementMatches('linkedom', selectors[2]);
}).add(`patched-jsdom matches('${selectors[2]}')`, () => {
  elementMatches('patched-jsdom', selectors[2]);
}).add(`jsdom matches('${selectors[3]}')`, () => {
  elementMatches('jsdom', selectors[3]);
}).add(`happydom matches('${selectors[3]}')`, () => {
  elementMatches('happydom', selectors[3]);
}).add(`linkedom matches('${selectors[3]}')`, () => {
  elementMatches('linkedom', selectors[3]);
}).add(`patched-jsdom matches('${selectors[3]}')`, () => {
  elementMatches('patched-jsdom', selectors[3]);
}).add(`jsdom matches('${selectors[4]}')`, () => {
  elementMatches('jsdom', selectors[4]);
}).add(`happydom matches('${selectors[4]}')`, () => {
  elementMatches('happydom', selectors[4]);
}).add(`linkedom matches('${selectors[4]}')`, () => {
  elementMatches('linkedom', selectors[4]);
}).add(`patched-jsdom matches('${selectors[4]}')`, () => {
  elementMatches('patched-jsdom', selectors[4]);
}).add(`jsdom matches('${selectors[5]}')`, () => {
  elementMatches('jsdom', selectors[5]);
}).add(`happydom matches('${selectors[5]}')`, () => {
  elementMatches('happydom', selectors[5]);
}).add(`linkedom matches('${selectors[5]}')`, () => {
  elementMatches('linkedom', selectors[5]);
}).add(`patched-jsdom matches('${selectors[5]}')`, () => {
  elementMatches('patched-jsdom', selectors[5]);
}).add(`jsdom matches('${selectors[6]}')`, () => {
  elementMatches('jsdom', selectors[6]);
}).add(`happydom matches('${selectors[6]}')`, () => {
  elementMatches('happydom', selectors[6]);
}).add(`linkedom matches('${selectors[6]}')`, () => {
  elementMatches('linkedom', selectors[6]);
}).add(`patched-jsdom matches('${selectors[6]}')`, () => {
  elementMatches('patched-jsdom', selectors[6]);
}).add(`jsdom matches('${selectors[7]}')`, () => {
  elementMatches('jsdom', selectors[7]);
}).add(`happydom matches('${selectors[7]}')`, () => {
  elementMatches('happydom', selectors[7]);
}).add(`linkedom matches('${selectors[7]}')`, () => {
  elementMatches('linkedom', selectors[7]);
}).add(`patched-jsdom matches('${selectors[7]}')`, () => {
  elementMatches('patched-jsdom', selectors[7]);
}).add(`jsdom closest('${selectors[0]}')`, () => {
  elementClosest('jsdom', selectors[0]);
}).add(`happydom closest('${selectors[0]}')`, () => {
  elementClosest('happydom', selectors[0]);
}).add(`linkedom closest('${selectors[0]}')`, () => {
  elementClosest('linkedom', selectors[0]);
}).add(`patched-jsdom closest('${selectors[0]}')`, () => {
  elementClosest('patched-jsdom', selectors[0]);
}).add(`jsdom closest('${selectors[1]}')`, () => {
  elementClosest('jsdom', selectors[1]);
}).add(`happydom closest('${selectors[1]}')`, () => {
  elementClosest('happydom', selectors[1]);
}).add(`linkedom closest('${selectors[1]}')`, () => {
  elementClosest('linkedom', selectors[1]);
}).add(`patched-jsdom closest('${selectors[1]}')`, () => {
  elementClosest('patched-jsdom', selectors[1]);
}).add(`jsdom closest('${selectors[2]}')`, () => {
  elementClosest('jsdom', selectors[2]);
}).add(`happydom closest('${selectors[2]}')`, () => {
  elementClosest('happydom', selectors[2]);
}).add(`linkedom closest('${selectors[2]}')`, () => {
  elementClosest('linkedom', selectors[2]);
}).add(`patched-jsdom closest('${selectors[2]}')`, () => {
  elementClosest('patched-jsdom', selectors[2]);
}).add(`jsdom closest('${selectors[3]}')`, () => {
  elementClosest('jsdom', selectors[3]);
}).add(`happydom closest('${selectors[3]}')`, () => {
  elementClosest('happydom', selectors[3]);
}).add(`linkedom closest('${selectors[3]}')`, () => {
  elementClosest('linkedom', selectors[3]);
}).add(`patched-jsdom closest('${selectors[3]}')`, () => {
  elementClosest('patched-jsdom', selectors[3]);
}).add(`jsdom closest('${selectors[4]}')`, () => {
  elementClosest('jsdom', selectors[4]);
}).add(`happydom closest('${selectors[4]}')`, () => {
  elementClosest('happydom', selectors[4]);
}).add(`linkedom closest('${selectors[4]}')`, () => {
  elementClosest('linkedom', selectors[4]);
}).add(`patched-jsdom closest('${selectors[4]}')`, () => {
  elementClosest('patched-jsdom', selectors[4]);
}).add(`jsdom closest('${selectors[5]}')`, () => {
  elementClosest('jsdom', selectors[5]);
}).add(`happydom closest('${selectors[5]}')`, () => {
  elementClosest('happydom', selectors[5]);
}).add(`linkedom closest('${selectors[5]}')`, () => {
  elementClosest('linkedom', selectors[5]);
}).add(`patched-jsdom closest('${selectors[5]}')`, () => {
  elementClosest('patched-jsdom', selectors[5]);
}).add(`jsdom closest('${selectors[6]}')`, () => {
  elementClosest('jsdom', selectors[6]);
}).add(`happydom closest('${selectors[6]}')`, () => {
  elementClosest('happydom', selectors[6]);
}).add(`linkedom closest('${selectors[6]}')`, () => {
  elementClosest('linkedom', selectors[6]);
}).add(`patched-jsdom closest('${selectors[6]}')`, () => {
  elementClosest('patched-jsdom', selectors[6]);
}).add(`jsdom closest('${selectors[7]}')`, () => {
  elementClosest('jsdom', selectors[7]);
}).add(`happydom closest('${selectors[7]}')`, () => {
  elementClosest('happydom', selectors[7]);
}).add(`linkedom closest('${selectors[7]}')`, () => {
  elementClosest('linkedom', selectors[7]);
}).add(`patched-jsdom closest('${selectors[7]}')`, () => {
  elementClosest('patched-jsdom', selectors[7]);
}).add(`jsdom querySelector('${selectors[0]}')`, () => {
  parentNodeQuerySelector('jsdom', selectors[0]);
}).add(`happydom querySelector('${selectors[0]}')`, () => {
  parentNodeQuerySelector('happydom', selectors[0]);
}).add(`linkedom querySelector('${selectors[0]}')`, () => {
  parentNodeQuerySelector('linkedom', selectors[0]);
}).add(`patched-jsdom querySelector('${selectors[0]}')`, () => {
  parentNodeQuerySelector('patched-jsdom', selectors[0]);
}).add(`jsdom querySelector('${selectors[1]}')`, () => {
  parentNodeQuerySelector('jsdom', selectors[1]);
}).add(`happydom querySelector('${selectors[1]}')`, () => {
  parentNodeQuerySelector('happydom', selectors[1]);
}).add(`linkedom querySelector('${selectors[1]}')`, () => {
  parentNodeQuerySelector('linkedom', selectors[1]);
}).add(`patched-jsdom querySelector('${selectors[1]}')`, () => {
  parentNodeQuerySelector('patched-jsdom', selectors[1]);
}).add(`jsdom querySelector('${selectors[2]}')`, () => {
  parentNodeQuerySelector('jsdom', selectors[2]);
}).add(`happydom querySelector('${selectors[2]}')`, () => {
  parentNodeQuerySelector('happydom', selectors[2]);
}).add(`linkedom querySelector('${selectors[2]}')`, () => {
  parentNodeQuerySelector('linkedom', selectors[2]);
}).add(`patched-jsdom querySelector('${selectors[2]}')`, () => {
  parentNodeQuerySelector('patched-jsdom', selectors[2]);
}).add(`jsdom querySelector('${selectors[3]}')`, () => {
  parentNodeQuerySelector('jsdom', selectors[3]);
}).add(`happydom querySelector('${selectors[3]}')`, () => {
  parentNodeQuerySelector('happydom', selectors[3]);
}).add(`linkedom querySelector('${selectors[3]}')`, () => {
  parentNodeQuerySelector('linkedom', selectors[3]);
}).add(`patched-jsdom querySelector('${selectors[3]}')`, () => {
  parentNodeQuerySelector('patched-jsdom', selectors[3]);
}).add(`jsdom querySelector('${selectors[4]}')`, () => {
  parentNodeQuerySelector('jsdom', selectors[4]);
}).add(`happydom querySelector('${selectors[4]}')`, () => {
  parentNodeQuerySelector('happydom', selectors[4]);
}).add(`linkedom querySelector('${selectors[4]}')`, () => {
  parentNodeQuerySelector('linkedom', selectors[4]);
}).add(`patched-jsdom querySelector('${selectors[4]}')`, () => {
  parentNodeQuerySelector('patched-jsdom', selectors[4]);
}).add(`jsdom querySelector('${selectors[5]}')`, () => {
  parentNodeQuerySelector('jsdom', selectors[5]);
}).add(`happydom querySelector('${selectors[5]}')`, () => {
  parentNodeQuerySelector('happydom', selectors[5]);
}).add(`linkedom querySelector('${selectors[5]}')`, () => {
  parentNodeQuerySelector('linkedom', selectors[5]);
}).add(`patched-jsdom querySelector('${selectors[5]}')`, () => {
  parentNodeQuerySelector('patched-jsdom', selectors[5]);
}).add(`jsdom querySelector('${selectors[6]}')`, () => {
  parentNodeQuerySelector('jsdom', selectors[6]);
}).add(`happydom querySelector('${selectors[6]}')`, () => {
  parentNodeQuerySelector('happydom', selectors[6]);
}).add(`linkedom querySelector('${selectors[6]}')`, () => {
  parentNodeQuerySelector('linkedom', selectors[6]);
}).add(`patched-jsdom querySelector('${selectors[6]}')`, () => {
  parentNodeQuerySelector('patched-jsdom', selectors[6]);
}).add(`jsdom querySelector('${selectors[7]}')`, () => {
  parentNodeQuerySelector('jsdom', selectors[7]);
}).add(`happydom querySelector('${selectors[7]}')`, () => {
  parentNodeQuerySelector('happydom', selectors[7]);
}).add(`linkedom querySelector('${selectors[7]}')`, () => {
  parentNodeQuerySelector('linkedom', selectors[7]);
}).add(`patched-jsdom querySelector('${selectors[7]}')`, () => {
  parentNodeQuerySelector('patched-jsdom', selectors[7]);
}).add(`jsdom querySelectorAll('${selectors[0]}')`, () => {
  parentNodeQuerySelectorAll('jsdom', selectors[0]);
}).add(`happydom querySelectorAll('${selectors[0]}')`, () => {
  parentNodeQuerySelectorAll('happydom', selectors[0]);
}).add(`linkedom querySelectorAll('${selectors[0]}')`, () => {
  parentNodeQuerySelectorAll('linkedom', selectors[0]);
}).add(`patched-jsdom querySelectorAll('${selectors[0]}')`, () => {
  parentNodeQuerySelectorAll('patched-jsdom', selectors[0]);
}).add(`jsdom querySelectorAll('${selectors[1]}')`, () => {
  parentNodeQuerySelectorAll('jsdom', selectors[1]);
}).add(`happydom querySelectorAll('${selectors[1]}')`, () => {
  parentNodeQuerySelectorAll('happydom', selectors[1]);
}).add(`linkedom querySelectorAll('${selectors[1]}')`, () => {
  parentNodeQuerySelectorAll('linkedom', selectors[1]);
}).add(`patched-jsdom querySelectorAll('${selectors[1]}')`, () => {
  parentNodeQuerySelectorAll('patched-jsdom', selectors[1]);
}).add(`jsdom querySelectorAll('${selectors[2]}')`, () => {
  parentNodeQuerySelectorAll('jsdom', selectors[2]);
}).add(`happydom querySelectorAll('${selectors[2]}')`, () => {
  parentNodeQuerySelectorAll('happydom', selectors[2]);
}).add(`linkedom querySelectorAll('${selectors[2]}')`, () => {
  parentNodeQuerySelectorAll('linkedom', selectors[2]);
}).add(`patched-jsdom querySelectorAll('${selectors[2]}')`, () => {
  parentNodeQuerySelectorAll('patched-jsdom', selectors[2]);
}).add(`jsdom querySelectorAll('${selectors[3]}')`, () => {
  parentNodeQuerySelectorAll('jsdom', selectors[3]);
}).add(`happydom querySelectorAll('${selectors[3]}')`, () => {
  parentNodeQuerySelectorAll('happydom', selectors[3]);
}).add(`linkedom querySelectorAll('${selectors[3]}')`, () => {
  parentNodeQuerySelectorAll('linkedom', selectors[3]);
}).add(`patched-jsdom querySelectorAll('${selectors[3]}')`, () => {
  parentNodeQuerySelectorAll('patched-jsdom', selectors[3]);
}).add(`jsdom querySelectorAll('${selectors[4]}')`, () => {
  parentNodeQuerySelectorAll('jsdom', selectors[4]);
}).add(`happydom querySelectorAll('${selectors[4]}')`, () => {
  parentNodeQuerySelectorAll('happydom', selectors[4]);
}).add(`linkedom querySelectorAll('${selectors[4]}')`, () => {
  parentNodeQuerySelectorAll('linkedom', selectors[4]);
}).add(`patched-jsdom querySelectorAll('${selectors[4]}')`, () => {
  parentNodeQuerySelectorAll('patched-jsdom', selectors[4]);
}).add(`jsdom querySelectorAll('${selectors[5]}')`, () => {
  parentNodeQuerySelectorAll('jsdom', selectors[5]);
}).add(`happydom querySelectorAll('${selectors[5]}')`, () => {
  parentNodeQuerySelectorAll('happydom', selectors[5]);
}).add(`linkedom querySelectorAll('${selectors[5]}')`, () => {
  parentNodeQuerySelectorAll('linkedom', selectors[5]);
}).add(`patched-jsdom querySelectorAll('${selectors[5]}')`, () => {
  parentNodeQuerySelectorAll('patched-jsdom', selectors[5]);
}).add(`jsdom querySelectorAll('${selectors[6]}')`, () => {
  parentNodeQuerySelectorAll('jsdom', selectors[6]);
}).add(`happydom querySelectorAll('${selectors[6]}')`, () => {
  parentNodeQuerySelectorAll('happydom', selectors[6]);
}).add(`linkedom querySelectorAll('${selectors[6]}')`, () => {
  parentNodeQuerySelectorAll('linkedom', selectors[6]);
}).add(`patched-jsdom querySelectorAll('${selectors[6]}')`, () => {
  parentNodeQuerySelectorAll('patched-jsdom', selectors[6]);
}).add(`jsdom querySelectorAll('${selectors[7]}')`, () => {
  parentNodeQuerySelectorAll('jsdom', selectors[7]);
}).add(`happydom querySelectorAll('${selectors[7]}')`, () => {
  parentNodeQuerySelectorAll('happydom', selectors[7]);
}).add(`linkedom querySelectorAll('${selectors[7]}')`, () => {
  parentNodeQuerySelectorAll('linkedom', selectors[7]);
}).add(`patched-jsdom querySelectorAll('${selectors[7]}')`, () => {
  parentNodeQuerySelectorAll('patched-jsdom', selectors[7]);
}).on('cycle', evt => {
  const { target } = evt;
  const str = String(target);
  if (str.startsWith('patched-jsdom')) {
    const patchedHz = evt.target.hz;
    const fastest = {
      key: 'patched-jsdom',
      hz: patchedHz
    };
    const items = hz.entries();
    for (const [key, value] of items) {
      const { hz: provFastestHz } = fastest;
      if (value > provFastestHz) {
        fastest.key = key;
        fastest.hz = value;
      }
    }
    const { key: fastestKey, hz: fastestHz } = fastest;
    const elapsed = `patched-jsdom took ${(1000 / patchedHz).toFixed(3)}msec.`;
    let msg;
    if (fastestKey === 'patched-jsdom') {
      msg = 'patched-jsdom is the fastest.';
    } else {
      msg = `${fastestKey} is the fastest and ${(fastestHz / patchedHz).toFixed(1)} times faster than patched-jsdom.`;
    }
    hz.clear();
    console.log(`* ${str}`);
    console.log(`* ${msg} ${elapsed}\n`);
  } else {
    const [, key] = /^([a-z-]+)\s/.exec(str);
    hz.set(key, target.hz);
    console.log(`* ${str}`);
  }
}).run({
  async: true
});
