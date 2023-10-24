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
      if (e instanceof globalThis.DOMException) {
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
      if (e instanceof globalThis.DOMException) {
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
      if (e instanceof globalThis.DOMException) {
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
      if (e instanceof globalThis.DOMException) {
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
      if (e instanceof globalThis.DOMException) {
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
      if (e instanceof globalThis.DOMException) {
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
      if (e instanceof globalThis.DOMException) {
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
      if (e instanceof globalThis.DOMException) {
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
  const filters = [
    'DOMImplementation-createDocument-with-null-browsing-context-crash.html',
    'DOMImplementation-createHTMLDocument-with-null-browsing-context-crash.html',
    'Document-URL.html',
    'Document-characterSet-normalization-1.html',
    'Document-characterSet-normalization-2.html',
    'Document-contentType/contentType/contenttype_mimeheader_01.html',
    'Document-contentType/contentType/contenttype_mimeheader_02.html',
    'Document-createElement-namespace-tests/bare_mathml.html',
    'Document-createElement-namespace-tests/bare_mathml.xhtml',
    'Document-createElement-namespace-tests/bare_svg.html',
    'Document-createElement-namespace-tests/bare_svg.xhtml',
    'Document-createElement-namespace-tests/bare_xhtml.html',
    'Document-createElement-namespace-tests/bare_xhtml.xhtml',
    'Document-createElement-namespace-tests/empty.html',
    'Document-createElement-namespace-tests/empty.xhtml',
    'Document-createElement-namespace-tests/mathml.html',
    'Document-createElement-namespace-tests/mathml.xhtml',
    'Document-createElement-namespace-tests/minimal_html.html',
    'Document-createElement-namespace-tests/minimal_html.xhtml',
    'Document-createElement-namespace-tests/svg.html',
    'Document-createElement-namespace-tests/svg.xhtml',
    'Document-createElement-namespace-tests/xhtml.html',
    'Document-createElement-namespace-tests/xhtml.xhtml',
    'Document-createElement-namespace-tests/xhtml_ns_changed.html',
    'Document-createElement-namespace-tests/xhtml_ns_changed.xhtml',
    'Document-createElement-namespace-tests/xhtml_ns_removed.html',
    'Document-createElement-namespace-tests/xhtml_ns_removed.xhtml',
    'Document-createElement.html',
    'Document-createElementNS.html',
    'Document-createEvent-touchevent.window.html',
    'Document-createEvent.https.html',
    'Document-getElementById.html',
    'Element-classlist.html',
    'Element-firstElementChild-entity-xhtml.xhtml',
    'Element-getElementsByTagName-change-document-HTMLNess.html',
    'MutationObserver-cross-realm-callback-report-exception.html',
    'MutationObserver-document.html',
    'MutationObserver-sanity.html',
    'Node-appendChild-cereactions-vs-script.window.html',
    'Node-cloneNode-on-inactive-document-crash.html',
    'Node-compareDocumentPosition.html',
    'Node-constants.html',
    'Node-contains.html',
    'Node-isConnected.html',
    'Node-lookupNamespaceURI.html',
    'Node-parentNode-iframe.html',
    'Node-properties.html',
    'NodeList-live-mutations.window.html',
    'NodeList-static-length-getter-tampered-1.html',
    'NodeList-static-length-getter-tampered-2.html',
    'NodeList-static-length-getter-tampered-3.html',
    'NodeList-static-length-getter-tampered-indexOf-1.html',
    'NodeList-static-length-getter-tampered-indexOf-2.html',
    'NodeList-static-length-getter-tampered-indexOf-3.html',
    'ParentNode-querySelector-All-content.html',
    'ProcessingInstruction-escapes-1.xhtml',
    'adoption.window.html',
    'node-appendchild-crash.html',
    'query-target-in-load-event.part.html',
    'remove-and-adopt-thcrash.html',
    'remove-from-shadow-host-and-adopt-into-iframe-ref.html',
    'remove-from-shadow-host-and-adopt-into-iframe.html'
  ];
  let res;
  if (filters.includes(testPath)) {
    res = false;
  } else {
    res = true;
  }
  return res;
};

const rootURL = 'dom/nodes/';

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
  console.log(msg);
  process.exit(failures);
}).catch(e => {
  console.error(e);
  process.exit(1);
});
