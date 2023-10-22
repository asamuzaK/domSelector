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

let document, divElm, patchedDoc, patchedDivElm;

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
        zNode.textContent = `${i}-${j}-${k}`;
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

  divElm = document.getElementById(`div${x - 1}-${y - 1}-${z - 1}`);

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
  patchedDivElm = patchedDoc.getElementById(`div${x - 1}-${y - 1}-${z - 1}`);
};

/* selectors */
const selectors = [
  '.container.box',
  '.container:not(.box)',
  '.box + .box',
  '.box ~ .box',
  '.box > .block',
  '.box .block.inner',
  '.box:nth-child(odd) + .box .block.inner'
];

/* matcher tests */
const elementMatches = (api, selector) => {
  let refPoint;
  if (api === 'patched-jsdom') {
    refPoint = patchedDivElm;
  } else {
    refPoint = divElm;
  }
  refPoint.matches(selector);
};

const elementClosest = (api, selector) => {
  let refPoint;
  if (api === 'patched-jsdom') {
    refPoint = patchedDivElm;
  } else {
    refPoint = divElm;
  }
  refPoint.closest(selector);
};

const refPointQuerySelector = (api, selector) => {
  let refPoint;
  if (api === 'patched-jsdom') {
    refPoint = patchedDoc;
  } else {
    refPoint = document;
  }
  refPoint.querySelector(selector);
};

const refPointQuerySelectorAll = (api, selector) => {
  let refPoint;
  if (api === 'patched-jsdom') {
    refPoint = patchedDoc;
  } else {
    refPoint = document;
  }
  refPoint.querySelectorAll(selector);
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
}).add(`jsdom matches - ${selectors[0]}`, () => {
  elementMatches('jsdom', selectors[0]);
}).add(`patched-jsdom matches - ${selectors[0]}`, () => {
  elementMatches('patched-jsdom', selectors[0]);
}).add(`jsdom matches - ${selectors[1]}`, () => {
  elementMatches('jsdom', selectors[1]);
}).add(`patched-jsdom matches - ${selectors[1]}`, () => {
  elementMatches('patched-jsdom', selectors[1]);
}).add(`jsdom matches - ${selectors[2]}`, () => {
  elementMatches('jsdom', selectors[2]);
}).add(`patched-jsdom matches - ${selectors[2]}`, () => {
  elementMatches('patched-jsdom', selectors[2]);
}).add(`jsdom matches - ${selectors[3]}`, () => {
  elementMatches('jsdom', selectors[3]);
}).add(`patched-jsdom matches - ${selectors[3]}`, () => {
  elementMatches('patched-jsdom', selectors[3]);
}).add(`jsdom matches - ${selectors[4]}`, () => {
  elementMatches('jsdom', selectors[4]);
}).add(`patched-jsdom matches - ${selectors[4]}`, () => {
  elementMatches('patched-jsdom', selectors[4]);
}).add(`jsdom matches - ${selectors[5]}`, () => {
  elementMatches('jsdom', selectors[5]);
}).add(`patched-jsdom matches - ${selectors[5]}`, () => {
  elementMatches('patched-jsdom', selectors[5]);
}).add(`jsdom matches - ${selectors[6]}`, () => {
  elementMatches('jsdom', selectors[6]);
}).add(`patched-jsdom matches - ${selectors[6]}`, () => {
  elementMatches('patched-jsdom', selectors[6]);
}).add(`jsdom closest - ${selectors[0]}`, () => {
  elementClosest('jsdom', selectors[0]);
}).add(`patched-jsdom closest - ${selectors[0]}`, () => {
  elementClosest('patched-jsdom', selectors[0]);
}).add(`jsdom closest - ${selectors[1]}`, () => {
  elementClosest('jsdom', selectors[1]);
}).add(`patched-jsdom closest - ${selectors[1]}`, () => {
  elementClosest('patched-jsdom', selectors[1]);
}).add(`jsdom closest - ${selectors[2]}`, () => {
  elementClosest('jsdom', selectors[2]);
}).add(`patched-jsdom closest - ${selectors[2]}`, () => {
  elementClosest('patched-jsdom', selectors[2]);
}).add(`jsdom closest - ${selectors[3]}`, () => {
  elementClosest('jsdom', selectors[3]);
}).add(`patched-jsdom closest - ${selectors[3]}`, () => {
  elementClosest('patched-jsdom', selectors[3]);
}).add(`jsdom closest - ${selectors[4]}`, () => {
  elementClosest('jsdom', selectors[4]);
}).add(`patched-jsdom closest - ${selectors[4]}`, () => {
  elementClosest('patched-jsdom', selectors[4]);
}).add(`jsdom closest - ${selectors[5]}`, () => {
  elementClosest('jsdom', selectors[5]);
}).add(`patched-jsdom closest - ${selectors[5]}`, () => {
  elementClosest('patched-jsdom', selectors[5]);
}).add(`jsdom closest - ${selectors[6]}`, () => {
  elementClosest('jsdom', selectors[6]);
}).add(`patched-jsdom closest - ${selectors[6]}`, () => {
  elementClosest('patched-jsdom', selectors[6]);
}).add(`jsdom querySelector - ${selectors[0]}`, () => {
  refPointQuerySelector('jsdom', selectors[0]);
}).add(`patched-jsdom querySelector - ${selectors[0]}`, () => {
  refPointQuerySelector('patched-jsdom', selectors[0]);
}).add(`jsdom querySelector - ${selectors[1]}`, () => {
  refPointQuerySelector('jsdom', selectors[1]);
}).add(`patched-jsdom querySelector - ${selectors[1]}`, () => {
  refPointQuerySelector('patched-jsdom', selectors[1]);
}).add(`jsdom querySelector - ${selectors[2]}`, () => {
  refPointQuerySelector('jsdom', selectors[2]);
}).add(`patched-jsdom querySelector - ${selectors[2]}`, () => {
  refPointQuerySelector('patched-jsdom', selectors[2]);
}).add(`jsdom querySelector - ${selectors[3]}`, () => {
  refPointQuerySelector('jsdom', selectors[3]);
}).add(`patched-jsdom querySelector - ${selectors[3]}`, () => {
  refPointQuerySelector('patched-jsdom', selectors[3]);
}).add(`jsdom querySelector - ${selectors[4]}`, () => {
  refPointQuerySelector('jsdom', selectors[4]);
}).add(`patched-jsdom querySelector - ${selectors[4]}`, () => {
  refPointQuerySelector('patched-jsdom', selectors[4]);
}).add(`jsdom querySelector - ${selectors[5]}`, () => {
  refPointQuerySelector('jsdom', selectors[5]);
}).add(`patched-jsdom querySelector - ${selectors[5]}`, () => {
  refPointQuerySelector('patched-jsdom', selectors[5]);
}).add(`jsdom querySelector - ${selectors[6]}`, () => {
  refPointQuerySelector('jsdom', selectors[6]);
}).add(`patched-jsdom querySelector - ${selectors[6]}`, () => {
  refPointQuerySelector('patched-jsdom', selectors[6]);
}).add(`jsdom querySelectorAll - ${selectors[0]}`, () => {
  refPointQuerySelectorAll('jsdom', selectors[0]);
}).add(`patched-jsdom querySelectorAll - ${selectors[0]}`, () => {
  refPointQuerySelectorAll('patched-jsdom', selectors[0]);
}).add(`jsdom querySelectorAll - ${selectors[1]}`, () => {
  refPointQuerySelectorAll('jsdom', selectors[1]);
}).add(`patched-jsdom querySelectorAll - ${selectors[1]}`, () => {
  refPointQuerySelectorAll('patched-jsdom', selectors[1]);
}).add(`jsdom querySelectorAll - ${selectors[2]}`, () => {
  refPointQuerySelectorAll('jsdom', selectors[2]);
}).add(`patched-jsdom querySelectorAll - ${selectors[2]}`, () => {
  refPointQuerySelectorAll('patched-jsdom', selectors[2]);
}).add(`jsdom querySelectorAll - ${selectors[3]}`, () => {
  refPointQuerySelectorAll('jsdom', selectors[3]);
}).add(`patched-jsdom querySelectorAll - ${selectors[3]}`, () => {
  refPointQuerySelectorAll('patched-jsdom', selectors[3]);
}).add(`jsdom querySelectorAll - ${selectors[4]}`, () => {
  refPointQuerySelectorAll('jsdom', selectors[4]);
}).add(`patched-jsdom querySelectorAll - ${selectors[4]}`, () => {
  refPointQuerySelectorAll('patched-jsdom', selectors[4]);
}).add(`jsdom querySelectorAll - ${selectors[5]}`, () => {
  refPointQuerySelectorAll('jsdom', selectors[5]);
}).add(`patched-jsdom querySelectorAll - ${selectors[5]}`, () => {
  refPointQuerySelectorAll('patched-jsdom', selectors[5]);
}).add(`jsdom querySelectorAll - ${selectors[6]}`, () => {
  refPointQuerySelectorAll('jsdom', selectors[6]);
}).add(`patched-jsdom querySelectorAll - ${selectors[6]}`, () => {
  refPointQuerySelectorAll('patched-jsdom', selectors[6]);
}).on('cycle', evt => {
  const { target } = evt;
  const str = String(target);
  if (str.startsWith('jsdom')) {
    hz.set('jsdom', target.hz);
    console.log(`\n* ${str}`);
  } else {
    const jsdomHz = hz.get('jsdom');
    const patchedHz = evt.target.hz;
    let msg;
    if (jsdomHz > patchedHz) {
      msg = `jsdom is ${(jsdomHz / patchedHz).toFixed(1)} times faster.`;
    } else {
      msg =
        `patched-jsdom is ${(patchedHz / jsdomHz).toFixed(1)} times faster.`;
    }
    hz.clear();
    console.log(`* ${str}`);
    console.log(`* ${msg}`);
  }
}).run({
  async: true
});
