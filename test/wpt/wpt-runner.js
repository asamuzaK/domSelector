/**
 * wpt-runner.js
 */

import wptRunner from 'wpt-runner';
import { DOMSelector } from '../../src/index.js';

const setup = window => {
  const domSelector = new DOMSelector(window);

  const matches = domSelector.matches.bind(domSelector);
  window.Element.prototype.matches = function (...args) {
    if (!args.length) {
      throw new window.TypeError('1 argument required, but only 0 present.');
    }
    const [selector] = args;
    const res = matches(selector, this);
    return !!res;
  };

  const closest = domSelector.closest.bind(domSelector);
  window.Element.prototype.closest = function (...args) {
    if (!args.length) {
      throw new window.TypeError('1 argument required, but only 0 present.');
    }
    const [selector] = args;
    const res = closest(selector, this);
    return res ?? null;
  };

  const querySelector = domSelector.querySelector.bind(domSelector);
  window.Document.prototype.querySelector = function (...args) {
    if (!args.length) {
      throw new window.TypeError('1 argument required, but only 0 present.');
    }
    const [selector] = args;
    const res = querySelector(selector, this);
    return res ?? null;
  };
  window.DocumentFragment.prototype.querySelector = function (...args) {
    if (!args.length) {
      throw new window.TypeError('1 argument required, but only 0 present.');
    }
    const [selector] = args;
    const res = querySelector(selector, this);
    return res ?? null;
  };
  window.Element.prototype.querySelector = function (...args) {
    if (!args.length) {
      throw new window.TypeError('1 argument required, but only 0 present.');
    }
    const [selector] = args;
    const res = querySelector(selector, this);
    return res ?? null;
  };

  const querySelectorAll = domSelector.querySelectorAll.bind(domSelector);
  window.Document.prototype.querySelectorAll = function (...args) {
    if (!args.length) {
      throw new window.TypeError('1 argument required, but only 0 present.');
    }
    const [selector] = args;
    const res = querySelectorAll(selector, this);
    return res;
  };
  window.DocumentFragment.prototype.querySelectorAll = function (...args) {
    if (!args.length) {
      throw new window.TypeError('1 argument required, but only 0 present.');
    }
    const [selector] = args;
    const res = querySelectorAll(selector, this);
    return res;
  };
  window.Element.prototype.querySelectorAll = function (...args) {
    if (!args.length) {
      throw new window.TypeError('1 argument required, but only 0 present.');
    }
    const [selector] = args;
    const res = querySelectorAll(selector, this);
    return res;
  };

  window.requestAnimationFrame = function (callback) {
    return callback(30);
  };
};

const filter = testPath => {
  // fails due to upstream issues and/or not yet supported
  const skipList = [
    'has-display-none-checked.html',
    'has-nth-of-crash.html',
    'has-sibling-chrome-crash.html',
    'has-specificity.html',
    'has-style-sharing-001.html',
    'has-style-sharing-002.html',
    'has-style-sharing-003.html',
    'has-style-sharing-004.html',
    'has-style-sharing-005.html',
    'has-style-sharing-006.html',
    'has-style-sharing-007.html',
    'has-style-sharing-pseudo-001.html',
    'has-style-sharing-pseudo-002.html',
    'has-style-sharing-pseudo-003.html',
    'has-style-sharing-pseudo-004.html',
    'has-style-sharing-pseudo-005.html',
    'has-style-sharing-pseudo-006.html',
    'has-style-sharing-pseudo-007.html',
    'has-style-sharing-pseudo-008.html',
    'has-visited.html',
    'is-where-error-recovery.html',
    'modal-pseudo-class.html',
    'nth-of-type-namespace.html',
    'placeholder-shown.html',
    'user-invalid.html',
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
    'missing-right-token.html',
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
    'ParentNode-querySelector-All-content.html',
    'has-slotted-001.html',
    'has-slotted-002.html',
    'has-slotted-003.html',
    'has-slotted-changing-001.html',
    'has-slotted-changing-002.html',
    'has-slotted-flattened-001.html',
    'has-slotted-flattened-002.html',
    'has-slotted-flattened-003.html',
    'has-slotted-flattened-004.html',
    'host-has-001.html',
    'host-has-002.html',
    'host-has-003.html',
    'pseudo-classes/active-disabled.html',
    'pseudo-classes/autofill.html',
    'pseudo-classes/checked-indeterminate.window.html',
    'pseudo-classes/checked-type-change.html',
    'pseudo-classes/checked.html',
    'pseudo-classes/focus-autofocus.html',
    'pseudo-classes/focus-iframe.html',
    'pseudo-classes/focus.html',
    'pseudo-classes/indeterminate-radio-group.html',
    'pseudo-classes/link.html',
    'pseudo-classes/indeterminate-radio.html',
    'pseudo-classes/indeterminate-type-change.html',
    'pseudo-classes/inrange-outofrange-type-change.html',
    'pseudo-classes/invalid-after-clone.html',
    'pseudo-classes/placeholder-shown-type-change.html',
    'pseudo-classes/readwrite-readonly.html',
    'pseudo-classes/readwrite-readonly-type-change.html',
    'pseudo-classes/required-optional-hidden.html',
    'pseudo-classes/valid-invalid.html',
    'slotted-has-001.html',
    'slotted-has-002.html',
    'slotted-has-003.html',
    'slotted-has-004.html',
  ];
  let res;
  if (/(?:-ref|-manual)\.html$|tentative/.test(testPath)) {
    res = false;
  } else if (skipList.includes(testPath)) {
    res = false;
  } else if (includeList.includes(testPath)) {
    res = true;
  } else if (testPath.startsWith('invalidation/') ||
             testPath.startsWith('parsing/')) {
    res = false;
  } else if (/closest|matches|querySelector(?:All)?|has-|pseudo-classes/.test(testPath)) {
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
  'dom/nodes/',
  'html/semantics/selectors/'
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
