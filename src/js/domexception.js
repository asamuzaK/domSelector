/**
 * domexception.js
 */
'use strict';

// NOTE: Node.js has DOMException global since v17.0.0
if (!globalThis.DOMException) {
  /* import */
  const DOMException = require('domexception');
  globalThis.DOMException = DOMException;
}

module.exports = globalThis.DOMException;
