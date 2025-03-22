/**
 * wpt-runner.js
 */

import path from 'node:path';
import wptRunner from 'wpt-runner';
import { copyFile, removeFile } from '../../scripts/file-util.js';
import { DOMSelector } from '../../src/index.js';

/* constants */
const JSDOM_DIR = 'test/wpt/jsdom/';
const WPT_ALT_DIR = 'test/wpt/wpt-alt/';
const WPT_DIR = 'test/wpt/wpt/';
const HARNESS_JS = 'resources/testharness.js';
const REPORT_JS = 'resources/testharnessreport.js';

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

const rootURLs = [
  'css/css-scoping/',
  'css/selectors/',
  'html/semantics/selectors/'
];

const excludeFilter = testPath => {
  const ignoreDir = [
    'reference/',
    'resources/',
    'tentative/',
  ];
  for (const item of ignoreDir) {
    if (testPath.includes(item)) {
      return false;
    }
  }
  if (/(?:-crash|-manual|-(?:no)?ref|tentative|window)\.x?html$/.test(testPath)) {
    return false;
  }
  const ignoreFile = [
    // css/css-scoping
    'css-scoping-shadow-assigned-node-with-before-after.html',
    'css-scoping-shadow-assigned-node-with-rules.html',
    'css-scoping-shadow-dynamic-remove-style-detached.html',
    'css-scoping-shadow-host-functional-rule.html',
    'css-scoping-shadow-host-namespace.html',
    'css-scoping-shadow-host-rule.html',
    'css-scoping-shadow-host-with-before-after.html',
    'css-scoping-shadow-invisible-slot.html',
    'css-scoping-shadow-nested-slot-display-override.html',
    'css-scoping-shadow-root-hides-children.html',
    'css-scoping-shadow-slot-display-override.html',
    'css-scoping-shadow-slot-fallback.html',
    'css-scoping-shadow-slot-style.html',
    'css-scoping-shadow-slot.html',
    'css-scoping-shadow-slotted-nested.html',
    'css-scoping-shadow-slotted-rule.html',
    'css-scoping-shadow-with-outside-rules.html',
    'css-scoping-shadow-with-rules-no-style-leak.html',
    'css-scoping-shadow-with-rules.html',
    'font-face-001.html',
    'font-face-002.html',
    'font-face-003.html',
    'font-face-004.html',
    'font-face-005.html',
    'font-face-006.html',
    'font-face-007.html',
    'font-face-008.html',
    'font-face-009.html',
    'has-slotted-001.html',
    'has-slotted-002.html',
    'has-slotted-003.html',
    'has-slotted-changing-001.html',
    'has-slotted-changing-002.html',
    'has-slotted-flattened-001.html',
    'has-slotted-flattened-002.html',
    'has-slotted-flattened-003.html',
    'has-slotted-flattened-004.html',
    'has-slotted-manual-assignment.html',
    'has-slotted-query-selector.html',
    'host-context-parsing.html',
    'host-context-specificity-001.html',
    'host-context-specificity-002.html',
    'host-context-specificity-003.html',
    'host-defined.html',
    'host-descendant-001.html',
    'host-descendant-002.html',
    'host-descendant-003.html',
    'host-has-001.html',
    'host-has-002.html',
    'host-has-003.html',
    'host-is-001.html',
    'host-is-002.html',
    'host-is-003.html',
    'host-is-004.html',
    'host-is-005.html',
    'host-multiple-001.html',
    'host-multiple-002.html',
    'host-multiple-003.html',
    'host-multiple-004.html',
    'host-multiple-005.html',
    'host-multiple-006.html',
    'host-nested-001.html',
    'host-not-001.html',
    'host-parsing.html',
    'host-slotted-001.html',
    'host-specificity-002.html',
    'host-specificity-003.html',
    'host-specificity.html',
    'host-with-default-namespace-001.html',
    'keyframes-001.html',
    'keyframes-002.html',
    'keyframes-003.html',
    'keyframes-004.html',
    'keyframes-005.html',
    'keyframes-006.html',
    'reslot-text-inheritance.html',
    'scoped-reference-animation-001.html',
    'scoped-reference-animation-002.html',
    'shadow-assign-dynamic-001.html',
    'shadow-at-import.html',
    'shadow-disabled-sheet-001.html',
    'shadow-fallback-dynamic-001.html',
    'shadow-fallback-dynamic-002.html',
    'shadow-fallback-dynamic-003.html',
    'shadow-fallback-dynamic-004.html',
    'shadow-fallback-dynamic-005.html',
    'shadow-fallback-dynamic-006.html',
    'shadow-host-with-before-after.html',
    'shadow-link-rel-stylesheet-no-style-leak.html',
    'shadow-link-rel-stylesheet.html',
    'shadow-reassign-dynamic-001.html',
    'shadow-reassign-dynamic-002.html',
    'shadow-reassign-dynamic-003.html',
    'shadow-reassign-dynamic-004.html',
    'shadow-reassign-dynamic-006.html',
    'shadow-root-insert-into-document.html',
    'slotted-details-content.html',
    'slotted-file-selector-button.html',
    'slotted-has-001.html',
    'slotted-has-002.html',
    'slotted-has-003.html',
    'slotted-has-004.html',
    'slotted-parsing.html',
    'slotted-placeholder.html',
    'slotted-specificity-002.html',
    'slotted-specificity.html',
    'slotted-with-pseudo-element.html',
    'stylesheet-title-001.html',
    'stylesheet-title-002.html',
    'whitespace-crash-001.html',
    // css/selectors/
    'caret-color-visited-inheritance.html',
    'case-insensitive-parent.html',
    'child-indexed-no-parent.html',
    'dir-pseudo-in-has.html',
    'dir-pseudo-update-document-element.html',
    'dir-selector-auto-direction-change-001.html',
    'dir-selector-change-001.html',
    'dir-selector-change-002.html',
    'dir-selector-change-003.html',
    'dir-selector-change-004.html',
    'dir-selector-ltr-001.html',
    'dir-selector-ltr-002.html',
    'dir-selector-ltr-003.html',
    'dir-selector-rtl-001.html',
    'dir-selector-white-space-001.html',
    'dir-style-01a.html',
    'dir-style-01b.html',
    'dir-style-02a.html',
    'dir-style-02b.html',
    'dir-style-03a.html',
    'dir-style-03b.html',
    'dir-style-04.html',
    'featureless-001.html',
    'featureless-002.html',
    'featureless-003.html',
    'featureless-004.html',
    'featureless-005.html',
    'first-letter-flag-001.html',
    'first-line-bidi-001.html',
    'first-line-bidi-002.html',
    'floating-first-letter-05d0.html',
    'floating-first-letter-feff.html',
    'focus-visible-001.html',
    'focus-visible-002.html',
    'focus-visible-003.html',
    'focus-visible-004.html',
    'focus-visible-005.html',
    'focus-visible-006.html',
    'focus-visible-007.html',
    'focus-visible-008.html',
    'focus-visible-009.html',
    'focus-visible-010.html',
    'focus-visible-011.html',
    'focus-visible-012.html',
    'focus-visible-013.html',
    'focus-visible-014.html',
    'focus-visible-015.html',
    'focus-visible-016.html',
    'focus-visible-017-2.html',
    'focus-visible-017.html',
    'focus-visible-018-2.html',
    'focus-visible-018.html',
    'focus-visible-019.html',
    'focus-visible-020.html',
    'focus-visible-021.html',
    'focus-visible-022.html',
    'focus-visible-023.html',
    'focus-visible-024.html',
    'focus-visible-025.html',
    'focus-visible-026.html',
    'focus-visible-027.html',
    'focus-visible-028.html',
    'focus-visible-script-focus-001.html',
    'focus-visible-script-focus-002.html',
    'focus-visible-script-focus-003.html',
    'focus-visible-script-focus-004.html',
    'focus-visible-script-focus-005.html',
    'focus-visible-script-focus-006.html',
    'focus-visible-script-focus-007.html',
    'focus-visible-script-focus-008-b.html',
    'focus-visible-script-focus-008.html',
    'focus-visible-script-focus-009.html',
    'focus-visible-script-focus-010.html',
    'focus-visible-script-focus-011.html',
    'focus-visible-script-focus-012.html',
    'focus-visible-script-focus-013.html',
    'focus-visible-script-focus-014.html',
    'focus-visible-script-focus-015.html',
    'focus-visible-script-focus-016.html',
    'focus-visible-script-focus-017.html',
    'focus-visible-script-focus-018.html',
    'focus-visible-script-focus-019.html',
    'focus-visible-script-focus-020.html',
    'focus-within-001.html',
    'focus-within-002.html',
    'focus-within-003.html',
    'focus-within-004.html',
    'focus-within-005.html',
    'focus-within-006.html',
    'focus-within-007.html',
    'focus-within-008.html',
    'focus-within-009.html',
    'focus-within-010.html',
    'focus-within-011.html',
    'focus-within-012.html',
    'focus-within-013.html',
    'focus-within-shadow-001.html',
    'focus-within-shadow-002.html',
    'focus-within-shadow-003.html',
    'focus-within-shadow-004.html',
    'focus-within-shadow-005.html',
    'focus-within-shadow-006.html',
    'has-display-none-checked.html',
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
    'hover-002.html',
    'i18n/lang-pseudo-class-across-shadow-boundaries.html',
    'invalidation/any-link-attribute-removal.html',
    'invalidation/class-id-attr.html',
    'invalidation/dir-pseudo-class-in-has.html',
    'invalidation/has-append-first-node.html',
    'invalidation/has-complexity.html',
    'invalidation/has-pseudo-element.html',
    'invalidation/has-with-nesting-parent-containing-complex.html',
    'invalidation/has-with-nesting-parent-containing-hover.html',
    'invalidation/lang-pseudo-class-in-has-document-element.html',
    'invalidation/lang-pseudo-class-in-has-multiple-document-elements.html',
    'invalidation/lang-pseudo-class-in-has-xhtml.xhtml',
    'invalidation/lang-pseudo-class-in-has.html',
    'invalidation/media-loading-pseudo-classes-in-has.html',
    'invalidation/negated-always-matches-negated-first-of-type-when-ancestor-changes.html',
    'invalidation/negated-always-matches-negated-last-of-type-when-ancestor-changes.html',
    'invalidation/negated-is-always-matches-negated-first-of-type-when-ancestor-changes.html',
    'invalidation/negated-is-always-matches-negated-last-of-type-when-ancestor-changes.html',
    'invalidation/negated-is-never-matches-negated-first-of-type-when-ancestor-changes.html',
    'invalidation/negated-is-never-matches-negated-last-of-type-when-ancestor-changes.html',
    'invalidation/negated-negated-first-of-type-when-ancestor-changes.html',
    'invalidation/negated-negated-last-of-type-when-ancestor-changes.html',
    'invalidation/negated-never-matches-negated-first-of-type-when-ancestor-changes.html',
    'invalidation/negated-never-matches-negated-last-of-type-when-ancestor-changes.html',
    'invalidation/negated-nth-child-when-ancestor-changes.html',
    'invalidation/negated-nth-last-child-when-ancestor-changes.html',
    'invalidation/nth-child-containing-ancestor.html',
    'invalidation/nth-child-in-shadow-root.html',
    'invalidation/nth-child-of-attr-largedom.html',
    'invalidation/nth-child-of-attr.html',
    'invalidation/nth-child-of-class-prefix.html',
    'invalidation/nth-child-of-class.html',
    'invalidation/nth-child-of-has.html',
    'invalidation/nth-child-of-id-prefix.html',
    'invalidation/nth-child-of-ids.html',
    'invalidation/nth-child-of-in-ancestor.html',
    'invalidation/nth-child-of-in-is.html',
    'invalidation/nth-child-of-in-shadow-root.html',
    'invalidation/nth-child-of-is.html',
    'invalidation/nth-child-of-pseudo-class.html',
    'invalidation/nth-child-of-sibling.html',
    'invalidation/nth-child-when-ancestor-changes.html',
    'invalidation/nth-child-when-sibling-changes.html',
    'invalidation/nth-last-child-containing-ancestor.html',
    'invalidation/nth-last-child-in-shadow-root.html',
    'invalidation/nth-last-child-of-attr.html',
    'invalidation/nth-last-child-of-class-prefix.html',
    'invalidation/nth-last-child-of-class.html',
    'invalidation/nth-last-child-of-has.html',
    'invalidation/nth-last-child-of-id-prefix.html',
    'invalidation/nth-last-child-of-ids.html',
    'invalidation/nth-last-child-of-in-ancestor.html',
    'invalidation/nth-last-child-of-in-is.html',
    'invalidation/nth-last-child-of-in-shadow-root.html',
    'invalidation/nth-last-child-of-is.html',
    'invalidation/nth-last-child-of-pseudo-class.html',
    'invalidation/nth-last-child-of-sibling.html',
    'invalidation/nth-last-child-when-ancestor-changes.html',
    'invalidation/nth-last-child-when-sibling-changes.html',
    'invalidation/part-pseudo.html',
    'invalidation/sheet-going-away-002.html',
    'invalidation/user-action-pseudo-classes-in-has.html',
    'is-default-ns-001.html',
    'is-default-ns-002.html',
    'is-default-ns-003.html',
    'is-where-pseudo-elements.html',
    'is-where-visited.html',
    'media/media-loading-state.html',
    'media/media-playback-state.html',
    'media/sound-state.html',
    'not-default-ns-001.html',
    'not-default-ns-002.html',
    'not-default-ns-003.html',
    'not-links.html',
    'nth-child-and-nth-last-child.html',
    'nth-child-of-attribute.html',
    'nth-child-of-classname-002.html',
    'nth-child-of-classname.html',
    'nth-child-of-complex-selector-many-children-2.html',
    'nth-child-of-complex-selector-many-children.html',
    'nth-child-of-complex-selector.html',
    'nth-child-of-compound-selector.html',
    'nth-child-of-has.html',
    'nth-child-of-nesting.html',
    'nth-child-of-no-space-after-of.html',
    'nth-child-of-not.html',
    'nth-child-of-nth-child.html',
    'nth-child-of-pseudo.html',
    'nth-child-of-tagname.html',
    'nth-child-of-universal-selector.html',
    'nth-child-specificity-1.html',
    'nth-child-specificity-2.html',
    'nth-child-specificity-3.html',
    'nth-child-specificity-4.html',
    'nth-last-child-of-classname.html',
    'nth-last-child-of-complex-selector.html',
    'nth-last-child-of-compound-selector.html',
    'nth-last-child-of-nesting.html',
    'nth-last-child-of-no-space-after-of.html',
    'nth-last-child-of-style-sharing-1.html',
    'nth-last-child-of-style-sharing-2.html',
    'nth-last-child-of-tagname.html',
    'nth-last-child-specificity-1.html',
    'nth-last-child-specificity-2.html',
    'nth-last-child-specificity-3.html',
    'nth-last-child-specificity-4.html',
    'nth-of-invalid.html',
    'of-type-selectors.xhtml',
    'parsing/invalid-pseudos.html',
    'parsing/parse-attribute.html',
    'parsing/parse-child.html',
    'parsing/parse-class.html',
    'parsing/parse-descendant.html',
    'parsing/parse-focus-visible.html',
    'parsing/parse-has-disallow-nesting-has-inside-has.html',
    'parsing/parse-has-forgiving-selector.html',
    'parsing/parse-has.html',
    'parsing/parse-id.html',
    'parsing/parse-is-where.html',
    'parsing/parse-is.html',
    'parsing/parse-not.html',
    'parsing/parse-part.html',
    'parsing/parse-sibling.html',
    'parsing/parse-slotted.html',
    'parsing/parse-state.html',
    'parsing/parse-universal.html',
    'parsing/parse-where.html',
    'query/query-is.html',
    'query/query-where.html',
    'remove-hovered-element.html',
    'root-siblings.html',
    'scope-without-scoping.html',
    'selection-image-001.html',
    'selection-image-002.html',
    'selector-placeholder-shown-type-change-001.html',
    'selector-placeholder-shown-type-change-002.html',
    'selector-placeholder-shown-type-change-003.html',
    'selector-read-write-type-change-001.html',
    'selector-read-write-type-change-002.html',
    'selector-required-type-change-001.html',
    'selector-required-type-change-002.html',
    'selector-required.html',
    'selector-structural-pseudo-root.html',
    'selectors-4/details-open-pseudo-001.html',
    'selectors-4/details-open-pseudo-002.html',
    'selectors-4/details-open-pseudo-003.html',
    'selectors-4/lang-000.html',
    'selectors-4/lang-001.html',
    'selectors-4/lang-002.html',
    'selectors-4/lang-003.html',
    'selectors-4/lang-004.html',
    'selectors-4/lang-005.html',
    'selectors-4/lang-006.html',
    'selectors-4/lang-007.html',
    'selectors-4/lang-008.html',
    'selectors-4/lang-009.html',
    'selectors-4/lang-010.html',
    'selectors-4/lang-011.html',
    'selectors-4/lang-012.html',
    'selectors-4/lang-013.html',
    'selectors-4/lang-014.html',
    'selectors-4/lang-015.html',
    'selectors-4/lang-016.html',
    'selectors-4/lang-017.html',
    'selectors-4/lang-018.html',
    'selectors-4/lang-019.html',
    'selectors-4/lang-020.html',
    'selectors-4/lang-021.html',
    'selectors-4/lang-022.html',
    'selectors-4/lang-023.html',
    'selectors-4/lang-024.html',
    'selectors-4/lang-025.html',
    'selectors-attr-many.html',
    'selectors-attr-white-space-001.html',
    'sharing-in-svg-use.html',
    'text-emphasis-visited-inheritance.html',
    'text-fill-color-visited-inheritance.html',
    'text-stroke-color-visited-inheritance.html',
    'user-invalid-form-submission-invalidation.html',
    'visited-inheritance.html',
    'webkit-pseudo-element.html',
    'x-pseudo-element.html',
    // html/semantics/selectors/
    'case-sensitivity/values.window.html',
    'pseudo-classes/active-disabled.html',
    'pseudo-classes/autofill.html',
    'pseudo-classes/checked-indeterminate.window.html',
    'pseudo-classes/focus-autofocus.html',
    'pseudo-classes/focus-iframe.html',
    'pseudo-classes/focus.html',
    'pseudo-classes/indeterminate-radio-group.html',
    'pseudo-classes/link.html',
    // jsdom/issues/
    'xxx.html'
  ];
  if (ignoreFile.includes(testPath)) {
    return false;
  }
  const skipDirOrFile = [
    'insertion-removing-steps/',
    'MutationObserver-',
  ];
  for (const item of skipDirOrFile) {
    if (testPath.includes(item)) {
      return false;
    }
  }
  const skipList = [
    // css/css-scoping
    'host-defined.html',
    'host-dom-001.html',
    'host-has-001.html',
    'host-has-002.html',
    'host-has-003.html',
    'host-in-host-selector.html',
    'host-in-host-context-selector.html',
    'host-is-001.html',
    'host-is-003.html',
    'host-multiple-001.html',
    'slotted-matches.html',
    // css/selectors/
    'any-link-dynamic-001.html',
    'child-indexed-no-parent.html',
    'dir-pseudo-in-has.html',
    'dir-pseudo-on-bdi-element.html',
    'dir-pseudo-on-input-element.html',
    'dir-selector-auto.html',
    'dir-selector-querySelector.html',
    'featureless-001.html',
    'featureless-002.html',
    'featureless-003.html',
    'featureless-004.html',
    'featureless-005.html',
    'has-argument-with-explicit-scope.html',
    'has-basic.html',
    'has-matches-to-uninserted-elements.html',
    'has-relative-argument.html',
    'i18n/css3-selectors-lang-001.html',
    'i18n/css3-selectors-lang-002.html',
    'i18n/css3-selectors-lang-004.html',
    'i18n/css3-selectors-lang-005.html',
    'i18n/css3-selectors-lang-006.html',
    'i18n/css3-selectors-lang-007.html',
    'i18n/css3-selectors-lang-008.html',
    'i18n/css3-selectors-lang-009.html',
    'i18n/css3-selectors-lang-010.html',
    'i18n/css3-selectors-lang-011.html',
    'i18n/css3-selectors-lang-012.html',
    'i18n/css3-selectors-lang-014.html',
    'i18n/css3-selectors-lang-015.html',
    'i18n/css3-selectors-lang-016.html',
    'i18n/css3-selectors-lang-021.html',
    'i18n/css3-selectors-lang-022.html',
    'i18n/css3-selectors-lang-024.html',
    'i18n/css3-selectors-lang-025.html',
    'i18n/css3-selectors-lang-026.html',
    'i18n/css3-selectors-lang-027.html',
    'i18n/css3-selectors-lang-028.html',
    'i18n/css3-selectors-lang-029.html',
    'i18n/css3-selectors-lang-030.html',
    'i18n/css3-selectors-lang-031.html',
    'i18n/css3-selectors-lang-032.html',
    'i18n/css3-selectors-lang-034.html',
    'i18n/css3-selectors-lang-035.html',
    'i18n/css3-selectors-lang-036.html',
    'i18n/css3-selectors-lang-041.html',
    'i18n/css3-selectors-lang-042.html',
    'i18n/css3-selectors-lang-044.html',
    'i18n/css3-selectors-lang-045.html',
    'i18n/css3-selectors-lang-046.html',
    'i18n/css3-selectors-lang-047.html',
    'i18n/css3-selectors-lang-048.html',
    'i18n/css3-selectors-lang-049.html',
    'i18n/css3-selectors-lang-050.html',
    'i18n/css3-selectors-lang-051.html',
    'i18n/css3-selectors-lang-052.html',
    'i18n/css3-selectors-lang-054.html',
    'i18n/css3-selectors-lang-055.html',
    'i18n/css3-selectors-lang-056.html',
    'i18n/lang-pseudo-class-empty-attribute.xhtml',
    'invalidation/any-link-pseudo.html',
    'invalidation/attribute.html',
    'invalidation/defined-in-has.html',
    'invalidation/defined.html',
    'invalidation/dir-pseudo-class-in-has.html',
    'invalidation/empty-pseudo-in-has.html',
    'invalidation/has-complexity.html',
    'invalidation/has-unstyled.html',
    'invalidation/has-with-not.html',
    'invalidation/has-with-nth-child.html',
    'invalidation/has-with-pseudo-class.html',
    'invalidation/host-context-pseudo-class-in-has.html',
    'invalidation/host-has-shadow-tree-element-at-nonsubject-position.html',
    'invalidation/host-has-shadow-tree-element-at-subject-position.html',
    'invalidation/host-pseudo-class-in-has.html',
    'invalidation/input-pseudo-classes-in-has.html',
    'invalidation/is-pseudo-containing-complex-in-has.html',
    'invalidation/is-pseudo-containing-sibling-relationship-in-has.html',
    'invalidation/is-where-pseudo-containing-hard-pseudo-and-never-matching.html',
    'invalidation/is-where-pseudo-containing-hard-pseudo.html',
    'invalidation/is.html',
    'invalidation/link-pseudo-class-in-has.html',
    'invalidation/link-pseudo-in-has.html',
    'invalidation/negated-always-matches-negated-first-of-type-when-ancestor-changes.html',
    'invalidation/negated-is-always-matches-negated-first-of-type-when-ancestor-changes.html',
    'invalidation/negated-is-never-matches-negated-first-of-type-when-ancestor-changes.html',
    'invalidation/negated-negated-first-of-type-when-ancestor-changes.html',
    'invalidation/negated-never-matches-negated-first-of-type-when-ancestor-changes.html',
    'invalidation/not-002.html',
    'invalidation/not-pseudo-containing-complex-in-has.html',
    'invalidation/not-pseudo-containing-sibling-relationship-in-has.html',
    'invalidation/nth-child-whole-subtree.html',
    'invalidation/placeholder-shown.html',
    'invalidation/quirks-mode-stylesheet-dynamic-add-001.html',
    'invalidation/sibling.html',
    'invalidation/state-in-has.html',
    'invalidation/subject-has-invalidation-with-display-none-anchor-element.html',
    'invalidation/target-pseudo-in-has.html',
    'invalidation/typed-child-indexed-pseudo-classes-in-has.html',
    'invalidation/where.html',
    'is-nested.html',
    'is-specificity-shadow.html',
    'is-where-pseudo-classes.html',
    'is-where-shadow.html',
    'missing-right-token.html',
    'not-complex.html',
    'not-specificity.html',
    'nth-of-type-namespace.html',
    'parsing/parse-anplusb.html',
    'placeholder-shown.html',
    'pseudo-enabled-disabled.html',
    'scope-selector.html',
    'selector-read-write-type-change-001.html',
    'selectors-case-sensitive-001.html',
    // html/semantics/selectors/
    'pseudo-classes/checked-type-change.html',
    'pseudo-classes/checked.html',
    'pseudo-classes/disabled.html',
    'pseudo-classes/enabled.html',
    'pseudo-classes/indeterminate-radio.html',
    'pseudo-classes/indeterminate-type-change.html',
    'pseudo-classes/inrange-outofrange-type-change.html',
    'pseudo-classes/inrange-outofrange.html',
    'pseudo-classes/invalid-after-clone.html',
    'pseudo-classes/placeholder-shown-type-change.html',
    'pseudo-classes/readwrite-readonly-type-change.html',
    'pseudo-classes/required-optional-hidden.html',
    'pseudo-classes/valid-invalid.html',
  ];
  if (skipList.includes(testPath)) {
    return false;
  }
  const unsupportedList = [
    // css/selectors
    // || column combinator
    'is-where-error-recovery.html',
    // :muted, :playing, :paused, :seeking
    'invalidation/media-pseudo-classes-in-has.html',
    // :modal
    'invalidation/modal-pseudo-class-in-has.html',
    'modal-pseudo-class.html',
    // dialog:open, select:open
    'open-pseudo.html',
    // :user-valid, :user-invalid
    'invalidation/user-valid-user-invalid.html',
    'user-invalid.html',
    'user-valid.html',
    'valid-invalid-form-fieldset.html',
    // ::part()
    'invalidation/part-dir.html',
    'invalidation/part-lang.html',
  ];
  if (unsupportedList.includes(testPath)) {
    return false;
  }
  return true;
};

const includeFilter = testPath => {
  const ignoreDir = [
    'reference/',
    'resources/',
    'tentative/',
  ];
  for (const item of ignoreDir) {
    if (testPath.includes(item)) {
      return false;
    }
  }
  if (/(?:-manual|-(?:no)?ref|tentative)\.x?html$/.test(testPath)) {
    return false;
  }
  const includeFile = [
    'Element-closest.html',
    'Element-matches.html',
    'Element-webkitMatchesSelector.html',
    'ParentNode-querySelector-All.html',
    'ParentNode-querySelector-case-insensitive.html',
    'ParentNode-querySelector-escapes.html',
    'ParentNode-querySelector-scope.html',
    'ParentNode-querySelectorAll-removed-elements.html',
    'ParentNode-querySelectors-exclusive.html',
    'ParentNode-querySelectors-namespaces.html',
    'ParentNode-querySelectors-space-and-dash-attribute-value.html',
    'query-target-in-load-event.html',
  ];
  if (includeFile.includes(testPath)) {
    return true;
  }
  // jsdom/issues
  if (/^\d+(?:-crash)?\.html$/.test(testPath)) {
    return true;
  }
  return false;
}

(async () => {
  const res = [];
  await Promise.all([
    copyFile(
      path.resolve(WPT_DIR, HARNESS_JS),
      path.resolve(JSDOM_DIR, HARNESS_JS)
    ),
    copyFile(
      path.resolve(WPT_DIR, REPORT_JS),
      path.resolve(JSDOM_DIR, REPORT_JS)
    )
  ]);
  // dom/nodes
  await wptRunner(`${WPT_DIR}dom/nodes/`, {
    rootURL: 'dom/nodes/',
    setup,
    filter: includeFilter
  }).then(failures => {
    const rootURL = 'dom/nodes/';
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

  // css/ and html/
  for (const rootURL of rootURLs) {
    await wptRunner(`${WPT_DIR}${rootURL}`, {
      rootURL,
      setup,
      filter: excludeFilter
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

  // wpt alternative tests
  await wptRunner(WPT_ALT_DIR, {
    rootURL: '/',
    setup
  }).then(failures => {
    const rootURL = 'wpt-alt/';
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

  // jsdom issues
  await wptRunner(`${JSDOM_DIR}issues/`, {
    rootURL: 'issues/',
    setup,
    filter: includeFilter
  }).then(failures => {
    const rootURL = 'jsdom/issues/';
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
  for (const msg of res) {
    console.log(msg);
  }
  await Promise.all([
    removeFile(path.resolve(JSDOM_DIR, HARNESS_JS)),
    removeFile(path.resolve(JSDOM_DIR, REPORT_JS))
  ]);
  process.exit();
})();
