/**
 * selectors.js
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
import {
  closest, matches, querySelector, querySelectorAll
} from '../src/index.js';

let document, happyDoc, linkedDoc, patchedDoc, selectors, total;
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

  /* prepare happy-dom */
  const { window: happyWin } = new happyDom.Window({
    url: 'http://localhost',
    width: 1024,
    height: 768
  });

  happyDoc = new happyWin.DOMParser().parseFromString(domstr, 'text/html');

  /* prepare linkedom */
  linkedDoc = linkedom.parseHTML(domstr).document;

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
};

const benchQuerySelectorAll = api => {
  let node;
  switch (api) {
    case 'jsdom':
      node = document;
      break;
    case 'happydom':
      node = happyDoc;
      break;
    case 'linkedom':
      node = linkedDoc;
      break;
    default:
      node = patchedDoc;
  }
  for (const selector of selectors) {
    try {
      node.querySelectorAll(selector);
    } catch (e) {
      errors.set(selector, [selector, e.message]);
    }
  }
};

const benchQuerySelector = api => {
  let node;
  switch (api) {
    case 'jsdom':
      node = document;
      break;
    case 'happydom':
      node = happyDoc;
      break;
    case 'linkedom':
      node = linkedDoc;
      break;
    default:
      node = patchedDoc;
  }
  for (const selector of selectors) {
    try {
      node.querySelector(selector);
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
    console.log(`* ${str} ${errors.size}/${total} fails.`);
    console.log(`* ${msg} ${elapsed}\n`);
    errors.clear();
  } else {
    const [, key] = /^([a-z-]+)\s/.exec(str);
    hz.set(key, target.hz);
    console.log(`* ${str} ${errors.size}/${total} fails.`);
    errors.clear();
  }
}).run({
  async: true
});
