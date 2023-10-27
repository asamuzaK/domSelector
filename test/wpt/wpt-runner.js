/**
 * wpt-runner.js
 */

import wptRunner from 'wpt-runner';
import {
  closest, matches, querySelector, querySelectorAll
} from '../../src/index.js';

const setup = window => {
  window.Element.prototype.matches = function (...args) {
    if (!args.length) {
      throw new window.TypeError('1 argument required, but only 0 present.');
    }
    let res;
    try {
      const [selector] = args;
      res = matches(selector, this);
    } catch (e) {
      if (e instanceof globalThis.DOMException &&
          !(e instanceof window.DOMException)) {
        const { message, name } = e;
        throw new window.DOMException(message, name);
      } else {
        throw e;
      }
    }
    return !!res;
  };
  window.Element.prototype.closest = function (...args) {
    if (!args.length) {
      throw new window.TypeError('1 argument required, but only 0 present.');
    }
    let res;
    try {
      const [selector] = args;
      res = closest(selector, this);
    } catch (e) {
      if (e instanceof globalThis.DOMException &&
          !(e instanceof window.DOMException)) {
        const { message, name } = e;
        throw new window.DOMException(message, name);
      } else {
        throw e;
      }
    }
    return res ?? null;
  };
  window.Document.prototype.querySelector = function (...args) {
    if (!args.length) {
      throw new window.TypeError('1 argument required, but only 0 present.');
    }
    let res;
    try {
      const [selector] = args;
      res = querySelector(selector, this);
    } catch (e) {
      if (e instanceof globalThis.DOMException &&
          !(e instanceof window.DOMException)) {
        const { message, name } = e;
        throw new window.DOMException(message, name);
      } else {
        throw e;
      }
    }
    return res ?? null;
  };
  window.DocumentFragment.prototype.querySelector = function (...args) {
    if (!args.length) {
      throw new window.TypeError('1 argument required, but only 0 present.');
    }
    let res;
    try {
      const [selector] = args;
      res = querySelector(selector, this);
    } catch (e) {
      if (e instanceof globalThis.DOMException &&
          !(e instanceof window.DOMException)) {
        const { message, name } = e;
        throw new window.DOMException(message, name);
      } else {
        throw e;
      }
    }
    return res ?? null;
  };
  window.Element.prototype.querySelector = function (...args) {
    if (!args.length) {
      throw new window.TypeError('1 argument required, but only 0 present.');
    }
    let res;
    try {
      const [selector] = args;
      res = querySelector(selector, this);
    } catch (e) {
      if (e instanceof globalThis.DOMException &&
          !(e instanceof window.DOMException)) {
        const { message, name } = e;
        throw new window.DOMException(message, name);
      } else {
        throw e;
      }
    }
    return res ?? null;
  };
  window.Document.prototype.querySelectorAll = function (...args) {
    if (!args.length) {
      throw new window.TypeError('1 argument required, but only 0 present.');
    }
    const res = [];
    try {
      const [selector] = args;
      const arr = querySelectorAll(selector, this);
      if (arr.length) {
        res.push(...arr);
      }
    } catch (e) {
      if (e instanceof globalThis.DOMException &&
          !(e instanceof window.DOMException)) {
        const { message, name } = e;
        throw new window.DOMException(message, name);
      } else {
        throw e;
      }
    }
    return res;
  };
  window.DocumentFragment.prototype.querySelectorAll = function (...args) {
    if (!args.length) {
      throw new window.TypeError('1 argument required, but only 0 present.');
    }
    const res = [];
    try {
      const [selector] = args;
      const arr = querySelectorAll(selector, this);
      if (arr.length) {
        res.push(...arr);
      }
    } catch (e) {
      if (e instanceof globalThis.DOMException &&
          !(e instanceof window.DOMException)) {
        const { message, name } = e;
        throw new window.DOMException(message, name);
      } else {
        throw e;
      }
    }
    return res;
  };
  window.Element.prototype.querySelectorAll = function (...args) {
    if (!args.length) {
      throw new window.TypeError('1 argument required, but only 0 present.');
    }
    const res = [];
    try {
      const [selector] = args;
      const arr = querySelectorAll(selector, this);
      if (arr.length) {
        res.push(...arr);
      }
    } catch (e) {
      if (e instanceof globalThis.DOMException &&
          !(e instanceof window.DOMException)) {
        const { message, name } = e;
        throw new window.DOMException(message, name);
      } else {
        throw e;
      }
    }
    return res;
  };
  window.requestAnimationFrame = function (callback) {
    return callback(30);
  };
};

const filter = (testPath) => {
  // currently unsupported or fails due to upstream issues
  const skipList = [
    'invalidation/is-pseudo-containing-complex-in-has.html',
    'invalidation/lang-pseudo-class-in-has-multiple-document-elements.html',
    'invalidation/not-pseudo-containing-complex-in-has.html',
    'modal-pseudo-class.html',
    'nth-of-type-namespace.html',
    'placeholder-shown.html',
    'user-invalid.html',
    'user-valid-user-invalid-invalidation.html',
    'user-valid.html',
    'valid-invalid-form-fieldset.html'
  ];
  const includeList = [
    // dom/nodes
    'Element-webkitMatchesSelector.html',
    'query-target-in-load-event.html',
    // css/selectors
    'attribute-selectors/attribute-case/semantics.html',
    'attribute-selectors/attribute-case/syntax.html',
    'child-indexed-pseudo-class.html',
    'dir-pseudo-on-bdi-element.html',
    'dir-pseudo-on-input-element.html',
    'dir-selector-auto.html',
    'dir-selector-querySelector.html',
    'first-child.html',
    'first-of-type.html',
    'focus-display-none-001.html',
    'focus-in-focus-event-001.html',
    'focus-in-focusin-event-001.html',
    'focus-within-009.html',
    'focus-within-display-none-001.html',
    'has-argument-with-explicit-scope.html',
    'has-basic.html',
    'has-matches-to-uninserted-elements.html',
    'has-relative-argument.html',
    'i18n/lang-pseudo-class-disconnected.html',
    'invalidation/link-pseudo-in-has.html',
    'invalidation/target-pseudo-in-has.html',
    'is-where-basic.html',
    'is-where-error-recovery.html',
    'is-where-not.html',
    'last-child.html',
    'last-of-type.html',
    'missing-right-token.html',
    'not-complex.html',
    'only-child.html',
    'only-of-type.html',
    'pseudo-enabled-disabled.html',
    'scope-selector.html',
    'selector-placeholder-shown-emptify-placeholder.html',
    'webkit-pseudo-element.html'
  ];
  const excludeList = [
    'ParentNode-querySelector-All-content.html',
  ];
  let res;
  if (skipList.includes(testPath)) {
    res = false;
  } else if (includeList.includes(testPath)) {
    res = true;
  } else if (/(:closest|matches|querySelector(?:All)?)/.test(testPath)) {
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
  'dom/nodes/',
  'css/selectors/'
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
