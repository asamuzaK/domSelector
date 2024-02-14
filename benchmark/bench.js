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
import { DOMSelector } from '../src/index.js';

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
  const targetId = `p${x - 1}-${y - 1}-${z - 1}`;
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

  targetNode = document.getElementById(targetId);

  /* dom string */
  const domstr = new window.XMLSerializer().serializeToString(document);

  /* prepare happy-dom */
  const { window: happyWin } = new happyDom.Window({
    url: 'http://localhost',
    width: 1024,
    height: 768
  });

  happyDoc = new happyWin.DOMParser().parseFromString(domstr, 'text/html');
  happyTarget = happyDoc.getElementById(targetId);

  /* prepare linkedom */
  linkedDoc = linkedom.parseHTML(domstr).document;
  linkedTarget = linkedDoc.getElementById(targetId);

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
  patchedTarget = patchedDoc.getElementById(targetId);
};

/* selectors */
const selectors = [
  '.content',
  '.container',
  'p.content[id]:only-child',
  'p.content[id]:is(:last-child, :only-child)',
  'p.content[id]:is(:invalid-nth-child, :only-child)',
  'div.container[id]:only-child',
  'div.container[id]:not(.box)',
  'div.container[id]:not(.box):is(:invalid-nth-child, :only-child)',
  '.box:first-child ~ .box:nth-of-type(4n+1) + .box[id] .block.inner > .content',
  '.box:first-child~.box:nth-of-type(4n+1)+.box .block.inner:has(>.content)',
  '.box + .box',
  '.box ~ .box',
  '.box > .block',
  '.box .content',
];

/* matcher tests */
const elementMatchesRandom = (api, selector) => {
  let doc;
  if (api === 'jsdom') {
    doc = document;
  } else if (api === 'happydom') {
    doc = happyDoc;
  } else if (api === 'linkedom') {
    doc = linkedDoc;
  } else {
    doc = patchedDoc;
  }
  const i = Math.floor(Math.random()) * 2 + 5;
  const id = `p${i}-9-9`;
  const res = doc.getElementById(id).matches(selector);
  if (res !== true) {
    throw new Error('result does not match.');
  }
};

const elementMatches = (api, selector, result) => {
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
  const res = node.matches(selector);
  if (res !== result) {
    throw new Error('result does not match.');
  }
};

const elementClosestRandom = (api, selector, result) => {
  let doc;
  if (api === 'jsdom') {
    doc = document;
  } else if (api === 'happydom') {
    doc = happyDoc;
  } else if (api === 'linkedom') {
    doc = linkedDoc;
  } else {
    doc = patchedDoc;
  }
  const i = Math.floor(Math.random()) * 2 + 5;
  const id = `p${i}-9-9`;
  const res = doc.getElementById(id).closest(selector);
  switch (result) {
    case 'container': {
      if (res?.id !== result) {
        throw new Error('result does not match.');
      }
      break;
    }
    case 'box': {
      if (res?.id !== `${result}${i}`) {
        throw new Error('result does not match.');
      }
      break;
    }
    default: {
      if (res?.id !== `${result}${i}-9-9`) {
        throw new Error('result does not match.');
      }
    }
  }
};

const elementClosest = (api, selector, result) => {
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
  const res = node.closest(selector);
  if (res?.id !== result) {
    throw new Error('result does not match.');
  }
};

const parentNodeQuerySelectorRandom = (api, selector, result) => {
  let doc;
  if (api === 'jsdom') {
    doc = document;
  } else if (api === 'happydom') {
    doc = happyDoc;
  } else if (api === 'linkedom') {
    doc = linkedDoc;
  } else {
    doc = patchedDoc;
  }
  const i = Math.floor(Math.random()) * 2 + 5;
  const id = `box${i}`;
  const node = doc.getElementById(id);
  const res = node.querySelector(selector);
  if (res?.id !== `${result}${i}-0-0`) {
    throw new Error('result does not match.');
  }
};

const parentNodeQuerySelector = (api, selector, result) => {
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
  const res = node.querySelector(selector);
  if (res?.id !== result) {
    throw new Error('result does not match.');
  }
};

const parentNodeQuerySelectorAll = (api, selector, result) => {
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
  const res = node.querySelectorAll(selector);
  if (res.length !== result) {
    throw new Error('result does not match.');
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
  console.log(`benchmark ${pkgName} v${version}`);
  prepareDom();
}).add(`jsdom matches('${selectors[0]}')`, () => {
  elementMatchesRandom('jsdom', selectors[0], true);
}).add(`happydom matches('${selectors[0]}')`, () => {
  elementMatchesRandom('happydom', selectors[0], true);
}).add(`linkedom matches('${selectors[0]}')`, () => {
  elementMatchesRandom('linkedom', selectors[0], true);
}).add(`patched-jsdom matches('${selectors[0]}')`, () => {
  elementMatchesRandom('patched-jsdom', selectors[0], true);
}).add(`jsdom matches('${selectors[3]}')`, () => {
  elementMatchesRandom('jsdom', selectors[3], true);
}).add(`happydom matches('${selectors[3]}')`, () => {
  elementMatchesRandom('happydom', selectors[3], true);
}).add(`linkedom matches('${selectors[3]}')`, () => {
  elementMatchesRandom('linkedom', selectors[3], true);
}).add(`patched-jsdom matches('${selectors[3]}')`, () => {
  elementMatchesRandom('patched-jsdom', selectors[3], true);
}).add(`jsdom matches('${selectors[4]}')`, () => {
  elementMatchesRandom('jsdom', selectors[4], true);
}).add(`happydom matches('${selectors[4]}')`, () => {
  elementMatchesRandom('happydom', selectors[4], true);
}).add(`linkedom matches('${selectors[4]}')`, () => {
  elementMatchesRandom('linkedom', selectors[4], true);
}).add(`patched-jsdom matches('${selectors[4]}')`, () => {
  elementMatchesRandom('patched-jsdom', selectors[4], true);
}).add(`jsdom matches('${selectors[8]}')`, () => {
  elementMatchesRandom('jsdom', selectors[8], true);
}).add(`happydom matches('${selectors[8]}')`, () => {
  elementMatchesRandom('happydom', selectors[8], true);
}).add(`linkedom matches('${selectors[8]}')`, () => {
  elementMatchesRandom('linkedom', selectors[8], true);
}).add(`patched-jsdom matches('${selectors[8]}')`, () => {
  elementMatchesRandom('patched-jsdom', selectors[8], true);
}).add(`jsdom closest('${selectors[1]}')`, () => {
  elementClosestRandom('jsdom', selectors[1], 'box');
}).add(`happydom closest('${selectors[1]}')`, () => {
  elementClosestRandom('happydom', selectors[1], 'box');
}).add(`linkedom closest('${selectors[1]}')`, () => {
  elementClosestRandom('linkedom', selectors[1], 'box');
}).add(`patched-jsdom closest('${selectors[1]}')`, () => {
  elementClosestRandom('patched-jsdom', selectors[1], 'box');
}).add(`jsdom closest('${selectors[6]}')`, () => {
  elementClosestRandom('jsdom', selectors[6], 'container');
}).add(`happydom closest('${selectors[6]}')`, () => {
  elementClosestRandom('happydom', selectors[6], 'container');
}).add(`linkedom closest('${selectors[6]}')`, () => {
  elementClosestRandom('linkedom', selectors[6], 'container');
}).add(`patched-jsdom closest('${selectors[6]}')`, () => {
  elementClosestRandom('patched-jsdom', selectors[6], 'container');
}).add(`jsdom closest('${selectors[8]}')`, () => {
  elementClosestRandom('jsdom', selectors[8], 'p');
}).add(`happydom closest('${selectors[8]}')`, () => {
  elementClosestRandom('happydom', selectors[8], 'p');
}).add(`linkedom closest('${selectors[8]}')`, () => {
  elementClosestRandom('linkedom', selectors[8], 'p');
}).add(`patched-jsdom closest('${selectors[8]}')`, () => {
  elementClosestRandom('patched-jsdom', selectors[8], 'p');
}).add(`jsdom closest('${selectors[9]}')`, () => {
  elementClosestRandom('jsdom', selectors[9], 'div');
}).add(`happydom closest('${selectors[9]}')`, () => {
  elementClosestRandom('happydom', selectors[9], 'div');
}).add(`linkedom closest('${selectors[9]}')`, () => {
  elementClosestRandom('linkedom', selectors[9], 'div');
}).add(`patched-jsdom closest('${selectors[9]}')`, () => {
  elementClosestRandom('patched-jsdom', selectors[9], 'div');
}).add(`jsdom querySelector('${selectors[0]}')`, () => {
  parentNodeQuerySelectorRandom('jsdom', selectors[0], 'p');
}).add(`happydom querySelector('${selectors[0]}')`, () => {
  parentNodeQuerySelectorRandom('happydom', selectors[0], 'p');
}).add(`linkedom querySelectorRandom('${selectors[0]}')`, () => {
  parentNodeQuerySelectorRandom('linkedom', selectors[0], 'p');
}).add(`patched-jsdom querySelector('${selectors[0]}')`, () => {
  parentNodeQuerySelectorRandom('patched-jsdom', selectors[0], 'p');
}).add(`jsdom querySelector('${selectors[3]}')`, () => {
  parentNodeQuerySelectorRandom('jsdom', selectors[3], 'p');
}).add(`happydom querySelector('${selectors[3]}')`, () => {
  parentNodeQuerySelectorRandom('happydom', selectors[3], 'p');
}).add(`linkedom querySelector('${selectors[3]}')`, () => {
  parentNodeQuerySelectorRandom('linkedom', selectors[3], 'p');
}).add(`patched-jsdom querySelector('${selectors[3]}')`, () => {
  parentNodeQuerySelectorRandom('patched-jsdom', selectors[3], 'p');
}).add(`jsdom querySelector('${selectors[8]}')`, () => {
  parentNodeQuerySelector('jsdom', selectors[8], 'p5-0-0');
}).add(`happydom querySelector('${selectors[8]}')`, () => {
  parentNodeQuerySelector('happydom', selectors[8], 'p5-0-0');
}).add(`linkedom querySelector('${selectors[8]}')`, () => {
  parentNodeQuerySelector('linkedom', selectors[8], 'p5-0-0');
}).add(`patched-jsdom querySelector('${selectors[8]}')`, () => {
  parentNodeQuerySelector('patched-jsdom', selectors[8], 'p5-0-0');
}).add(`jsdom querySelector('${selectors[9]}')`, () => {
  parentNodeQuerySelector('jsdom', selectors[9], 'div5-0-0');
}).add(`happydom querySelector('${selectors[9]}')`, () => {
  parentNodeQuerySelector('happydom', selectors[9], 'div5-0-0');
}).add(`linkedom querySelector('${selectors[9]}')`, () => {
  parentNodeQuerySelector('linkedom', selectors[9], 'div5-0-0');
}).add(`patched-jsdom querySelector('${selectors[9]}')`, () => {
  parentNodeQuerySelector('patched-jsdom', selectors[9], 'div5-0-0');
}).add(`jsdom querySelectorAll('${selectors[0]}')`, () => {
  parentNodeQuerySelectorAll('jsdom', selectors[0], 1000);
}).add(`happydom querySelectorAll('${selectors[0]}')`, () => {
  parentNodeQuerySelectorAll('happydom', selectors[0], 1000);
}).add(`linkedom querySelectorAll('${selectors[0]}')`, () => {
  parentNodeQuerySelectorAll('linkedom', selectors[0], 1000);
}).add(`patched-jsdom querySelectorAll('${selectors[0]}')`, () => {
  parentNodeQuerySelectorAll('patched-jsdom', selectors[0], 1000);
}).add(`jsdom querySelectorAll('${selectors[3]}')`, () => {
  parentNodeQuerySelectorAll('jsdom', selectors[3], 1000);
}).add(`happydom querySelectorAll('${selectors[3]}')`, () => {
  parentNodeQuerySelectorAll('happydom', selectors[3], 1000);
}).add(`linkedom querySelectorAll('${selectors[3]}')`, () => {
  parentNodeQuerySelectorAll('linkedom', selectors[3], 1000);
}).add(`patched-jsdom querySelectorAll('${selectors[3]}')`, () => {
  parentNodeQuerySelectorAll('patched-jsdom', selectors[3], 1000);
}).add(`jsdom querySelectorAll('${selectors[8]}')`, () => {
  parentNodeQuerySelectorAll('jsdom', selectors[8], 200);
}).add(`happydom querySelectorAll('${selectors[8]}')`, () => {
  parentNodeQuerySelectorAll('happydom', selectors[8], 200);
}).add(`linkedom querySelectorAll('${selectors[8]}')`, () => {
  parentNodeQuerySelectorAll('linkedom', selectors[8], 200);
}).add(`patched-jsdom querySelectorAll('${selectors[8]}')`, () => {
  parentNodeQuerySelectorAll('patched-jsdom', selectors[8], 200);
}).add(`jsdom querySelectorAll('${selectors[9]}')`, () => {
  parentNodeQuerySelectorAll('jsdom', selectors[9], 200);
}).add(`happydom querySelectorAll('${selectors[9]}')`, () => {
  parentNodeQuerySelectorAll('happydom', selectors[9], 200);
}).add(`linkedom querySelectorAll('${selectors[9]}')`, () => {
  parentNodeQuerySelectorAll('linkedom', selectors[9], 200);
}).add(`patched-jsdom querySelectorAll('${selectors[9]}')`, () => {
  parentNodeQuerySelectorAll('patched-jsdom', selectors[9], 200);
/*
}).add(`jsdom matches('${selectors[10]}')`, () => {
  elementMatches('jsdom', selectors[10], false);
}).add(`happydom matches('${selectors[10]}')`, () => {
  elementMatches('happydom', selectors[10], false);
}).add(`linkedom matches('${selectors[10]}')`, () => {
  elementMatches('linkedom', selectors[10], false);
}).add(`patched-jsdom matches('${selectors[10]}')`, () => {
  elementMatches('patched-jsdom', selectors[10], false);
}).add(`jsdom matches('${selectors[11]}')`, () => {
  elementMatches('jsdom', selectors[11], false);
}).add(`happydom matches('${selectors[11]}')`, () => {
  elementMatches('happydom', selectors[11], false);
}).add(`linkedom matches('${selectors[11]}')`, () => {
  elementMatches('linkedom', selectors[11], false);
}).add(`patched-jsdom matches('${selectors[11]}')`, () => {
  elementMatches('patched-jsdom', selectors[11], false);
}).add(`jsdom matches('${selectors[12]}')`, () => {
  elementMatches('jsdom', selectors[12], false);
}).add(`happydom matches('${selectors[12]}')`, () => {
  elementMatches('happydom', selectors[12], false);
}).add(`linkedom matches('${selectors[12]}')`, () => {
  elementMatches('linkedom', selectors[12], false);
}).add(`patched-jsdom matches('${selectors[12]}')`, () => {
  elementMatches('patched-jsdom', selectors[12], false);
}).add(`jsdom matches('${selectors[13]}')`, () => {
  elementMatches('jsdom', selectors[13], true);
}).add(`happydom matches('${selectors[13]}')`, () => {
  elementMatches('happydom', selectors[13], true);
}).add(`linkedom matches('${selectors[13]}')`, () => {
  elementMatches('linkedom', selectors[13], true);
}).add(`patched-jsdom matches('${selectors[13]}')`, () => {
  elementMatches('patched-jsdom', selectors[13], true);
  elementClosest('jsdom', selectors[10], 'box9');
}).add(`happydom closest('${selectors[10]}')`, () => {
  elementClosest('happydom', selectors[10], 'box9');
}).add(`linkedom closest('${selectors[10]}')`, () => {
  elementClosest('linkedom', selectors[10], 'box9');
}).add(`patched-jsdom closest('${selectors[10]}')`, () => {
  elementClosest('patched-jsdom', selectors[10], 'box9');
}).add(`jsdom closest('${selectors[11]}')`, () => {
  elementClosest('jsdom', selectors[11], 'box9');
}).add(`happydom closest('${selectors[11]}')`, () => {
  elementClosest('happydom', selectors[11], 'box9');
}).add(`linkedom closest('${selectors[11]}')`, () => {
  elementClosest('linkedom', selectors[11], 'box9');
}).add(`patched-jsdom closest('${selectors[11]}')`, () => {
  elementClosest('patched-jsdom', selectors[11], 'box9');
}).add(`jsdom closest('${selectors[12]}')`, () => {
  elementClosest('jsdom', selectors[12], 'div9-9');
}).add(`happydom closest('${selectors[12]}')`, () => {
  elementClosest('happydom', selectors[12], 'div9-9');
}).add(`linkedom closest('${selectors[12]}')`, () => {
  elementClosest('linkedom', selectors[12], 'div9-9');
}).add(`patched-jsdom closest('${selectors[12]}')`, () => {
  elementClosest('patched-jsdom', selectors[12], 'div9-9');
}).add(`jsdom closest('${selectors[13]}')`, () => {
  elementClosest('jsdom', selectors[13], 'p9-9-9');
}).add(`happydom closest('${selectors[13]}')`, () => {
  elementClosest('happydom', selectors[13], 'p9-9-9');
}).add(`linkedom closest('${selectors[13]}')`, () => {
  elementClosest('linkedom', selectors[13], 'p9-9-9');
}).add(`patched-jsdom closest('${selectors[13]}')`, () => {
  elementClosest('patched-jsdom', selectors[13], 'p9-9-9');
}).add(`jsdom querySelector('${selectors[10]}')`, () => {
  parentNodeQuerySelector('jsdom', selectors[10], 'box1');
}).add(`happydom querySelector('${selectors[10]}')`, () => {
  parentNodeQuerySelector('happydom', selectors[10], 'box1');
}).add(`linkedom querySelector('${selectors[10]}')`, () => {
  parentNodeQuerySelector('linkedom', selectors[10], 'box1');
}).add(`patched-jsdom querySelector('${selectors[10]}')`, () => {
  parentNodeQuerySelector('patched-jsdom', selectors[10], 'box1');
}).add(`jsdom querySelector('${selectors[11]}')`, () => {
  parentNodeQuerySelector('jsdom', selectors[11], 'box1');
}).add(`happydom querySelector('${selectors[11]}')`, () => {
  parentNodeQuerySelector('happydom', selectors[11], 'box1');
}).add(`linkedom querySelector('${selectors[11]}')`, () => {
  parentNodeQuerySelector('linkedom', selectors[11], 'box1');
}).add(`patched-jsdom querySelector('${selectors[11]}')`, () => {
  parentNodeQuerySelector('patched-jsdom', selectors[11], 'box1');
}).add(`jsdom querySelector('${selectors[12]}')`, () => {
  parentNodeQuerySelector('jsdom', selectors[12], 'div0-0');
}).add(`happydom querySelector('${selectors[12]}')`, () => {
  parentNodeQuerySelector('happydom', selectors[12], 'div0-0');
}).add(`linkedom querySelector('${selectors[12]}')`, () => {
  parentNodeQuerySelector('linkedom', selectors[12], 'div0-0');
}).add(`patched-jsdom querySelector('${selectors[12]}')`, () => {
  parentNodeQuerySelector('patched-jsdom', selectors[12], 'div0-0');
}).add(`jsdom querySelector('${selectors[13]}')`, () => {
  parentNodeQuerySelector('jsdom', selectors[13], 'p0-0-0');
}).add(`happydom querySelector('${selectors[13]}')`, () => {
  parentNodeQuerySelector('happydom', selectors[13], 'p0-0-0');
}).add(`linkedom querySelector('${selectors[13]}')`, () => {
  parentNodeQuerySelector('linkedom', selectors[13], 'p0-0-0');
}).add(`patched-jsdom querySelector('${selectors[13]}')`, () => {
  parentNodeQuerySelector('patched-jsdom', selectors[13], 'p0-0-0');
}).add(`jsdom querySelectorAll('${selectors[10]}')`, () => {
  parentNodeQuerySelectorAll('jsdom', selectors[10], 9);
}).add(`happydom querySelectorAll('${selectors[10]}')`, () => {
  parentNodeQuerySelectorAll('happydom', selectors[10], 9);
}).add(`linkedom querySelectorAll('${selectors[10]}')`, () => {
  parentNodeQuerySelectorAll('linkedom', selectors[10], 9);
}).add(`patched-jsdom querySelectorAll('${selectors[10]}')`, () => {
  parentNodeQuerySelectorAll('patched-jsdom', selectors[10], 9);
}).add(`jsdom querySelectorAll('${selectors[11]}')`, () => {
  parentNodeQuerySelectorAll('jsdom', selectors[11], 9);
}).add(`happydom querySelectorAll('${selectors[11]}')`, () => {
  parentNodeQuerySelectorAll('happydom', selectors[11], 9);
}).add(`linkedom querySelectorAll('${selectors[11]}')`, () => {
  parentNodeQuerySelectorAll('linkedom', selectors[11], 9);
}).add(`patched-jsdom querySelectorAll('${selectors[11]}')`, () => {
  parentNodeQuerySelectorAll('patched-jsdom', selectors[11], 9);
}).add(`jsdom querySelectorAll('${selectors[12]}')`, () => {
  parentNodeQuerySelectorAll('jsdom', selectors[12], 100);
}).add(`happydom querySelectorAll('${selectors[12]}')`, () => {
  parentNodeQuerySelectorAll('happydom', selectors[12], 100);
}).add(`linkedom querySelectorAll('${selectors[12]}')`, () => {
  parentNodeQuerySelectorAll('linkedom', selectors[12], 100);
}).add(`patched-jsdom querySelectorAll('${selectors[12]}')`, () => {
  parentNodeQuerySelectorAll('patched-jsdom', selectors[12], 100);
}).add(`jsdom querySelectorAll('${selectors[13]}')`, () => {
  parentNodeQuerySelectorAll('jsdom', selectors[13], 1000);
}).add(`happydom querySelectorAll('${selectors[13]}')`, () => {
  parentNodeQuerySelectorAll('happydom', selectors[13], 1000);
}).add(`linkedom querySelectorAll('${selectors[13]}')`, () => {
  parentNodeQuerySelectorAll('linkedom', selectors[13], 1000);
}).add(`patched-jsdom querySelectorAll('${selectors[13]}')`, () => {
  parentNodeQuerySelectorAll('patched-jsdom', selectors[13], 1000);
*/
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
    const elapsed = 1000 / patchedHz;
    const figures = elapsed > 0.001 ? 3 : 6;
    const elapsedTime = `patched-jsdom took ${elapsed.toFixed(figures)}msec.`;
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
    console.log(`* ${msg} ${elapsedTime}\n`);
  } else {
    const [, key] = /^([a-z-]+)\s/.exec(str);
    hz.set(key, target.hz);
    console.log(`* ${str}`);
  }
}).run({
  async: true
});
