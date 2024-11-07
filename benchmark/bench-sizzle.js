/**
 * bench-sizzle.js
 * forked and modified from jquery/sizzle
 * @see {@link https://github.com/jquery/sizzle}
 */

/* import */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import Benchmark from 'benchmark';
import { JSDOM } from 'jsdom';
import * as happyDom from 'happy-dom';
import * as linkedom from 'linkedom';
import { DOMSelector } from '../src/index.js';

let document, reflowNode, patchedDoc, patchedReflow;
let happyDoc, happyReflow, linkedDoc, linkedReflow;
let selectors, total;
const errors = new Map();

const prepareDom = () => {
  const htmlFile =
    path.resolve(process.cwd(), 'benchmark', 'sizzle-speed/selector.html');
  const domstr = fs.readFileSync(htmlFile, {
    encoding: 'utf8',
    flag: 'r'
  });
  const cssFile =
    path.resolve(process.cwd(), 'benchmark', 'sizzle-speed/selectors.large.css');
  const css = fs.readFileSync(cssFile, {
    encoding: 'utf8',
    flag: 'r'
  });
  selectors = css.split('\n');
  total = selectors.length;

  /* prepare jsdom */
  const { window } = new JSDOM(domstr);
  document = window.document;
  reflowNode = document.createElement('div');

  /* prepare happy-dom */
  const { window: happyWin } = new happyDom.Window({
    url: 'http://localhost',
    width: 1024,
    height: 768
  });

  happyDoc = new happyWin.DOMParser().parseFromString(domstr, 'text/html');
  happyReflow = happyDoc.createElement('div');

  /* prepare linkedom */
  linkedDoc = linkedom.parseHTML(domstr).document;
  linkedReflow = linkedDoc.createElement('div');

  /* prepare patched jsdom */
  const { window: patchedWin } = new JSDOM(domstr, {
    runScripts: 'dangerously',
    url: 'http://localhost',
    beforeParse: window => {
      const domSelector = new DOMSelector(window);
      window.Element.prototype.matches = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return domSelector.matches(selector, this);
      };
      window.Element.prototype.closest = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return domSelector.closest(selector, this);
      };
      window.Document.prototype.querySelector = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return domSelector.querySelector(selector, this);
      };
      window.DocumentFragment.prototype.querySelector = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return domSelector.querySelector(selector, this);
      };
      window.Element.prototype.querySelector = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return domSelector.querySelector(selector, this);
      };
      window.Document.prototype.querySelectorAll = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return domSelector.querySelectorAll(selector, this);
      };
      window.DocumentFragment.prototype.querySelectorAll = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return domSelector.querySelectorAll(selector, this);
      };
      window.Element.prototype.querySelectorAll = function (...args) {
        if (!args.length) {
          const msg = '1 argument required, but only 0 present.';
          throw new window.TypeError(msg);
        }
        const [selector] = args;
        return domSelector.querySelectorAll(selector, this);
      };
    }
  });

  patchedDoc = patchedWin.document;
  patchedReflow = patchedDoc.createElement('div');
};

const benchQuerySelectorAll = api => {
  let doc, reflow;
  switch (api) {
    case 'jsdom':
      doc = document;
      reflow = reflowNode;
      break;
    case 'happydom':
      doc = happyDoc;
      reflow = happyReflow;
      break;
    case 'linkedom':
      doc = linkedDoc;
      reflow = linkedReflow;
      break;
    default:
      doc = patchedDoc;
      reflow = patchedReflow;
  }
  for (const selector of selectors) {
    try {
      doc.body.appendChild(reflow);
      doc.querySelectorAll(selector);
      doc.body.removeChild(reflow);
    } catch (e) {
      errors.set(selector, [selector, e.message]);
    }
  }
};

const benchQuerySelector = api => {
  let doc, reflow;
  switch (api) {
    case 'jsdom':
      doc = document;
      reflow = reflowNode;
      break;
    case 'happydom':
      doc = happyDoc;
      reflow = happyReflow;
      break;
    case 'linkedom':
      doc = linkedDoc;
      reflow = linkedReflow;
      break;
    default:
      doc = patchedDoc;
      reflow = patchedReflow;
  }
  for (const selector of selectors) {
    try {
      doc.body.appendChild(reflow);
      doc.querySelector(selector);
      doc.body.removeChild(reflow);
    } catch (e) {
      errors.set(selector, [selector, e.message]);
    }
  }
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
  console.log(`benchmark sizzle-speed ${pkgName} v${version}`);
  prepareDom();
}).add('jsdom querySelectorAll', () => {
  benchQuerySelectorAll('jsdom');
}).add('happydom querySelectorAll', () => {
  benchQuerySelectorAll('happydom');
}).add('linkedom querySelectorAll', () => {
  benchQuerySelectorAll('linkedom');
}).add('patched-jsdom querySelectorAll', () => {
  benchQuerySelectorAll('patched-jsdom');
}).add('jsdom querySelector', () => {
  benchQuerySelector('jsdom');
}).add('happydom querySelector', () => {
  benchQuerySelector('happydom');
}).add('linkedom querySelector', () => {
  benchQuerySelector('linkedom');
}).add('patched-jsdom querySelector', () => {
  benchQuerySelector('patched-jsdom');
}).on('cycle', evt => {
  const { target } = evt;
  const str = String(target);
  if (str.startsWith('patched-jsdom')) {
    const patchedHz = target.hz;
    const jsdomHz = hz.get('jsdom');
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
    let fastestMsg;
    if (fastestKey === 'patched-jsdom') {
      fastestMsg = 'patched-jsdom is the fastest.';
    } else {
      fastestMsg = `${fastestKey} is the fastest and ${(fastestHz / patchedHz).toFixed(1)} times faster than patched-jsdom.`;
    }
    let jsdomMsg = '';
    if (jsdomHz > patchedHz) {
      jsdomMsg = `jsdom is ${(jsdomHz / patchedHz).toFixed(1)} times faster than patched-jsdom.`;
    } else if (jsdomHz) {
      jsdomMsg = `patched-jsdom is ${(patchedHz / jsdomHz).toFixed(1)} times faster than jsdom.`;
    }
    let msg;
    if (fastestKey === 'jsdom') {
      msg = fastestMsg;
    } else {
      msg = `${fastestMsg} ${jsdomMsg}`;
    }
    hz.clear();
    console.log(`* ${str}`);
    /*
    console.log(`* ${errors.size}/${total} fails:`);
    const val = errors.values();
    for (const [key, value] of val) {
      console.log(`\t'${key}': ${value}`);
    }
    */
    console.log(`* ${msg} ${elapsed}\n`);
    errors.clear();
  } else {
    const [, key] = /^([a-z-]+)\s/.exec(str);
    hz.set(key, target.hz);
    console.log(`* ${str}`);
    /*
    console.log(`* ${errors.size}/${total} fails:`);
    const val = errors.values();
    for (const [key, value] of val) {
      console.log(`\t'${key}': ${value}`);
    }
    */
    errors.clear();
  }
}).run({
  async: true
});
