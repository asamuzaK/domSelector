/**
 * wpt-runner.js
 */

import wptRunner from 'wpt-runner';
import {
  closest, matches, querySelector, querySelectorAll
} from '../../src/index.js';

const testsPath = 'test/wpt/wpt/dom/nodes';
await wptRunner(testsPath, {
  rootURL: 'dom/nodes/',
  setup: window => {
    window.Element.prototype.matches = function (...args) {
      if (!args.length) {
        throw new window.TypeError('1 argument required, but only 0 present');
      }
      const [selector] = args;
      return matches(selector, this);
    };
    window.Element.prototype.closest = function (...args) {
      if (!args.length) {
        throw new window.TypeError('1 argument required, but only 0 present');
      }
      const [selector] = args;
      return closest(selector, this);
    };
    window.Document.prototype.querySelector = function (...args) {
      if (!args.length) {
        throw new window.TypeError('1 argument required, but only 0 present');
      }
      const [selector] = args;
      return querySelector(selector, this);
    };
    window.DocumentFragment.prototype.querySelector = function (...args) {
      if (!args.length) {
        throw new window.TypeError('1 argument required, but only 0 present');
      }
      const [selector] = args;
      return querySelector(selector, this);
    };
    window.Element.prototype.querySelector = function (...args) {
      if (!args.length) {
        throw new window.TypeError('1 argument required, but only 0 present');
      }
      const [selector] = args;
      return querySelector(selector, this);
    };
    window.Document.prototype.querySelectorAll = function (...args) {
      if (!args.length) {
        throw new window.TypeError('1 argument required, but only 0 present');
      }
      const [selector] = args;
      return querySelectorAll(selector, this);
    };
    window.DocumentFragment.prototype.querySelectorAll = function (...args) {
      if (!args.length) {
        throw new window.TypeError('1 argument required, but only 0 present');
      }
      const [selector] = args;
      return querySelectorAll(selector, this);
    };
    window.Element.prototype.querySelectorAll = function (...args) {
      if (!args.length) {
        throw new window.TypeError('1 argument required, but only 0 present');
      }
      const [selector] = args;
      return querySelectorAll(selector, this);
    };
  },
  filter: (testPath, url) => {
    const filterList = [
      'Element-closest.html',
      'Element-matches.html',
      'Element-matches-namespaced-elements.html',
      //'ParentNode-querySelector-All.html',
      //'ParentNode-querySelector-All-content.html',
      'ParentNode-querySelector-All-content.xht',
      'ParentNode-querySelectorAll-removed-elements.html',
      'ParentNode-querySelector-All-xht.xht',
      'ParentNode-querySelector-case-insensitive.html',
      'ParentNode-querySelector-escapes.html',
      'ParentNode-querySelector-scope.html',
      'ParentNode-querySelectors-exclusive.html',
      'ParentNode-querySelectors-namespaces.html',
      'ParentNode-querySelectors-space-and-dash-attribute-value.html',
    ];
    let res;
    if (filterList.includes(testPath)) {
      res = true;
    } else {
      res = false;
    }
    return res;
  }
}).then(failures => {
  const msg = `\n${failures} failures.`;
  console.log(msg);
  process.exit(failures);
}).catch(e => {
  console.error(e);
});
