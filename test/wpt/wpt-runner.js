/**
 * wpt-runner.js
 */

import wptRunner from 'wpt-runner';
import { DOMSelector } from '../../src/index.js';

const setup = window => {
  const domSelector = new DOMSelector(window);
  window.Element.prototype.matches = function (...args) {
    if (!args.length) {
      throw new window.TypeError('1 argument required, but only 0 present.');
    }
    const [selector] = args;
    const res = domSelector.matches(selector, this);
    return !!res;
  };
  window.Element.prototype.closest = function (...args) {
    if (!args.length) {
      throw new window.TypeError('1 argument required, but only 0 present.');
    }
    const [selector] = args;
    const res = domSelector.closest(selector, this);
    return res ?? null;
  };
  window.Document.prototype.querySelector = function (...args) {
    if (!args.length) {
      throw new window.TypeError('1 argument required, but only 0 present.');
    }
    const [selector] = args;
    const res = domSelector.querySelector(selector, this);
    return res ?? null;
  };
  window.DocumentFragment.prototype.querySelector = function (...args) {
    if (!args.length) {
      throw new window.TypeError('1 argument required, but only 0 present.');
    }
    const [selector] = args;
    const res = domSelector.querySelector(selector, this);
    return res ?? null;
  };
  window.Element.prototype.querySelector = function (...args) {
    if (!args.length) {
      throw new window.TypeError('1 argument required, but only 0 present.');
    }
    const [selector] = args;
    const res = domSelector.querySelector(selector, this);
    return res ?? null;
  };
  window.Document.prototype.querySelectorAll = function (...args) {
    if (!args.length) {
      throw new window.TypeError('1 argument required, but only 0 present.');
    }
    const [selector] = args;
    const res = domSelector.querySelectorAll(selector, this);
    return res;
  };
  window.DocumentFragment.prototype.querySelectorAll = function (...args) {
    if (!args.length) {
      throw new window.TypeError('1 argument required, but only 0 present.');
    }
    const [selector] = args;
    const res = domSelector.querySelectorAll(selector, this);
    return res;
  };
  window.Element.prototype.querySelectorAll = function (...args) {
    if (!args.length) {
      throw new window.TypeError('1 argument required, but only 0 present.');
    }
    const [selector] = args;
    const res = domSelector.querySelectorAll(selector, this);
    return res;
  };
  window.requestAnimationFrame = function (callback) {
    return callback(30);
  };
};

const filter = testPath => {
  // fails due to upstream issues and/or not yet supported
  const skipList = [
    'has-display-none-checked-ref.html',
    'has-display-none-checked.html',
    'has-sibling-chrome-crash.html',
    'has-specificity.html',
    'has-style-sharing-001-ref.html',
    'has-style-sharing-001.html',
    'has-style-sharing-002-ref.html',
    'has-style-sharing-002.html',
    'has-style-sharing-003-ref.html',
    'has-style-sharing-003.html',
    'has-style-sharing-004-ref.html',
    'has-style-sharing-004.html',
    'has-style-sharing-005-ref.html',
    'has-style-sharing-005.html',
    'has-style-sharing-006-ref.html',
    'has-style-sharing-006.html',
    'has-style-sharing-007-ref.html',
    'has-style-sharing-007.html',
    'has-visited-ref.html',
    'has-visited.html',
    'is-where-error-recovery.html',
    'missing-right-token.html',
    'modal-pseudo-class.html',
    'nth-of-type-namespace.html',
    'placeholder-shown.html',
    'user-invalid.html',
    'user-valid-user-invalid-invalidation.html',
    'user-valid.html',
    'webkit-pseudo-element.html',
    'valid-invalid-form-fieldset.html'
  ];
  const includeList = [
    // css/css-scoping
    'host-dom-001.html',
    // css/selectors
    'child-indexed-pseudo-class.html',
    'dir-pseudo-on-bdi-element.html',
    'dir-pseudo-on-input-element.html',
    'first-child.html',
    'first-of-type.html',
    'is-where-basic.html',
    'is-where-not.html',
    'last-child.html',
    'last-of-type.html',
    'not-complex.html',
    'only-child.html',
    'only-of-type.html',
    'open-closed-pseudo.html',
    'pseudo-enabled-disabled.html',
    'scope-selector.html',
    'selector-placeholder-shown-emptify-placeholder.html',
    // dom/nodes
    'Element-webkitMatchesSelector.html',
    'query-target-in-load-event.html'
  ];
  const excludeList = [
    'ParentNode-querySelector-All-content.html'
  ];
  let res;
  if (skipList.includes(testPath)) {
    res = false;
  } else if (includeList.includes(testPath)) {
    res = true;
  } else if (testPath.startsWith('invalidation/') ||
             testPath.startsWith('parsing/')) {
    res = false;
  } else if (/closest|matches|querySelector(?:All)?|has-/.test(testPath)) {
    if (excludeList.includes(testPath)) {
      res = false;
    } else {
      res = true;
    }
  } else {
    res = false;
  }
  return res;
};

const rootURLs = [
  'css/css-scoping/',
  'css/selectors/',
  'dom/nodes/'
];

(async () => {
  const res = [];
  for (const rootURL of rootURLs) {
    await wptRunner(`test/wpt/wpt/${rootURL}`, {
      rootURL,
      setup,
      filter
    }).then(failures => {
      let msg;
      switch (failures) {
        case 0:
          msg = `\npassed ${rootURL}.`;
          break;
        case 1:
          msg = `\n1 failure in ${rootURL}.`;
          break;
        default:
          msg = `\n${failures} failures in ${rootURL}.`;
      }
      res.push(msg);
    }).catch(e => {
      console.error(e);
      process.exit(1);
    });
  }
  for (const msg of res) {
    console.log(msg);
  }
  process.exit();
})();
