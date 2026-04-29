/**
 * pseudo-evaluator.js
 */

/* import */
import {
  matchDirectionPseudoClass,
  matchLanguagePseudoClass,
  matchDisabledPseudoClass,
  matchReadOnlyPseudoClass
} from './matcher.js';
import { findAST, generateCSS, walkAST } from './parser.js';
import {
  filterNodesByAnB,
  findLogicalWithNestedHas,
  generateException,
  isCustomElement,
  isFocusVisible,
  isFocusableArea,
  traverseNode
} from './utility.js';

/* constants */
import {
  COMBINATOR,
  DOCUMENT_FRAGMENT_NODE,
  ELEMENT_NODE,
  FORM_PARTS,
  INPUT_CHECK,
  INPUT_DATE,
  INPUT_EDIT,
  INPUT_TEXT,
  KEYS_LOGICAL,
  NOT_SUPPORTED_ERR,
  PS_CLASS_SELECTOR,
  SYNTAX_ERR,
  TEXT_NODE,
  SHOW_ALL
} from './constant.js';
const DIR_NEXT = 'next';
const DIR_PREV = 'prev';
const KEYS_FORM_PS_VALID = new Set([...FORM_PARTS, 'form']);
const KEYS_INPUT_CHECK = new Set(INPUT_CHECK);
const KEYS_INPUT_PLACEHOLDER = new Set([...INPUT_TEXT, 'number']);
const KEYS_INPUT_RANGE = new Set([...INPUT_DATE, 'number', 'range']);
const KEYS_INPUT_REQUIRED = new Set([...INPUT_CHECK, ...INPUT_EDIT, 'file']);
const KEYS_INPUT_RESET = new Set(['button', 'reset']);
const KEYS_INPUT_SUBMIT = new Set(['image', 'submit']);
const KEYS_PS_NTH_OF_TYPE = new Set([
  'first-of-type',
  'last-of-type',
  'only-of-type'
]);

/**
 * A class dedicated to evaluating CSS pseudo-classes for the Finder.
 */
export class PseudoClassEvaluator {
  #finder;

  /**
   * Creates an instance of PseudoClassEvaluator.
   * @param {object} finder - The parent Finder instance.
   */
  constructor(finder) {
    this.#finder = finder;
  }

  /**
   * Collects nth-child nodes based on An+B formula.
   * @private
   * @param {object} anb - An+B options.
   * @param {object} node - The Element node to evaluate.
   * @param {object} opt - Evaluation options.
   * @returns {Set<object>} A collection of matched nodes.
   */
  _collectNthChild(anb, node, opt) {
    const { a, b, selector } = anb;
    const { parentNode } = node;
    if (!parentNode) {
      const matchedNode = new Set();
      if (node === this.#finder.root && a * 1 + b * 1 === 1) {
        if (selector) {
          const selectorBranches = this.#finder._getSelectorBranches(selector);
          const l = selectorBranches.length;
          for (let i = 0; i < l; i++) {
            const leaves = selectorBranches[i];
            if (this.#finder._matchLeaves(leaves, node, opt)) {
              matchedNode.add(node);
              break;
            }
          }
        } else {
          matchedNode.add(node);
        }
      }
      return matchedNode;
    }
    const selectorBranches = selector
      ? this.#finder._getSelectorBranches(selector)
      : null;
    const children = this.#finder._getFilteredChildren(
      parentNode,
      selectorBranches,
      opt
    );
    const matchedNodes = filterNodesByAnB(children, anb);
    return new Set(matchedNodes);
  }

  /**
   * Collects nth-of-type nodes based on An+B formula.
   * @private
   * @param {object} anb - An+B options.
   * @param {object} node - The Element node to evaluate.
   * @returns {Set<object>} A collection of matched nodes.
   */
  _collectNthOfType(anb, node) {
    const { parentNode } = node;
    if (!parentNode) {
      if (node === this.#finder.root && anb.a * 1 + anb.b * 1 === 1) {
        return new Set([node]);
      }
      return new Set();
    }
    const typedSiblings = [];
    let sibling = parentNode.firstElementChild;
    while (sibling) {
      if (
        sibling.localName === node.localName &&
        sibling.namespaceURI === node.namespaceURI &&
        sibling.prefix === node.prefix
      ) {
        typedSiblings.push(sibling);
      }
      sibling = sibling.nextElementSibling;
    }
    const matchedNodes = filterNodesByAnB(typedSiblings, anb);
    return new Set(matchedNodes);
  }

  /**
   * Matches An+B pseudo-classes like :nth-child and :nth-of-type.
   * @private
   * @param {object} ast - The AST branch representing the argument.
   * @param {object} node - The Element node to evaluate.
   * @param {string} nthName - The name of the nth pseudo-class.
   * @param {object} opt - Evaluation options.
   * @returns {Set<object>} A collection of matched nodes.
   */
  _matchAnPlusB(ast, node, nthName, opt) {
    const {
      nth: { a, b, name: nthIdentName },
      selector
    } = ast;
    const anbMap = new Map();
    if (nthIdentName) {
      if (nthIdentName === 'even') {
        anbMap.set('a', 2);
        anbMap.set('b', 0);
      } else if (nthIdentName === 'odd') {
        anbMap.set('a', 2);
        anbMap.set('b', 1);
      }
      if (nthName.indexOf('last') > -1) {
        anbMap.set('reverse', true);
      }
    } else {
      if (typeof a === 'string' && /-?\d+/.test(a)) {
        anbMap.set('a', a * 1);
      } else {
        anbMap.set('a', 0);
      }
      if (typeof b === 'string' && /-?\d+/.test(b)) {
        anbMap.set('b', b * 1);
      } else {
        anbMap.set('b', 0);
      }
      if (nthName.indexOf('last') > -1) {
        anbMap.set('reverse', true);
      }
    }
    if (nthName === 'nth-child' || nthName === 'nth-last-child') {
      if (selector) {
        anbMap.set('selector', selector);
      }
      return this._collectNthChild(Object.fromEntries(anbMap), node, opt);
    } else if (nthName === 'nth-of-type' || nthName === 'nth-last-of-type') {
      return this._collectNthOfType(Object.fromEntries(anbMap), node);
    }
    return new Set();
  }

  /**
   * Matches the individual branches of a :has() pseudo-class function.
   * @private
   * @param {Array<object>} astLeaves - The AST leaves of the :has() argument.
   * @param {object} node - The Element node to evaluate.
   * @param {object} [opt] - Evaluation options.
   * @returns {boolean} True if the node matches the :has() condition.
   */
  _matchHasPseudoFunc(astLeaves, node, opt = {}) {
    if (!Array.isArray(astLeaves) || !astLeaves.length) {
      return false;
    }
    const hasLeadingCombinator = astLeaves[0].type === COMBINATOR;
    const combo = hasLeadingCombinator
      ? astLeaves[0]
      : { name: ' ', type: COMBINATOR };
    const startIndex = hasLeadingCombinator ? 1 : 0;
    const nextCombinatorIndex = astLeaves.findIndex(
      (leaf, i) => i >= startIndex && leaf.type === COMBINATOR
    );
    const endIndex =
      nextCombinatorIndex === -1 ? astLeaves.length : nextCombinatorIndex;
    const twigLeaves = astLeaves.slice(startIndex, endIndex);
    const twig = { combo, leaves: twigLeaves };
    opt.dir = DIR_NEXT;
    const nodes = this.#finder._collectCombinatorMatches(twig, node, opt);
    if (nodes.length) {
      if (nextCombinatorIndex !== -1) {
        const remainingLeaves = astLeaves.slice(nextCombinatorIndex);
        return nodes.some(nextNode =>
          this._matchHasPseudoFunc(remainingLeaves, nextNode, opt)
        );
      }
      return true;
    }
    return false;
  }

  /**
   * Evaluates the entire :has() pseudo-class against a node.
   * @private
   * @param {object} astData - The AST data for the :has() pseudo-class.
   * @param {object} node - The Element node to evaluate.
   * @param {object} [opt] - Evaluation options.
   * @returns {object|null} The matched node if successful, otherwise null.
   */
  _evaluateHasPseudo(astData, node, opt = {}) {
    const { branches } = astData;
    let bool = false;
    for (let i = 0; i < branches.length; i++) {
      bool = this._matchHasPseudoFunc(branches[i], node, opt);
      if (bool) {
        break;
      }
    }
    if (!bool) {
      return null;
    }
    if (
      (opt.isShadowRoot || this.#finder.shadow) &&
      node.nodeType === DOCUMENT_FRAGMENT_NODE
    ) {
      if (this.#finder.verifyShadowHost) {
        return node;
      } else {
        return null;
      }
    }
    return node;
  }

  /**
   * Matches logical pseudo-class functions like :is(), :not(), :where(),
   * and handles :has().
   * @private
   * @param {object} astData - The AST data for the logical pseudo-class.
   * @param {object} node - The Element node to evaluate.
   * @param {object} [opt] - Evaluation options.
   * @returns {object|null} The matched node if successful, otherwise null.
   */
  _matchLogicalPseudoFunc(astData, node, opt = {}) {
    const { astName, branches, twigBranches } = astData;
    if (astName === 'has') {
      return this._evaluateHasPseudo(astData, node, opt);
    }
    const isShadowRoot =
      (opt.isShadowRoot || this.#finder.shadow) &&
      node.nodeType === DOCUMENT_FRAGMENT_NODE;
    if (isShadowRoot) {
      let invalid = false;
      for (const branch of branches) {
        if (branch.length > 1) {
          invalid = true;
          break;
        } else if (astName === 'not' && branch[0].type !== PS_CLASS_SELECTOR) {
          invalid = true;
          break;
        }
      }
      if (invalid) {
        return null;
      }
    }
    opt.forgive = astName === 'is' || astName === 'where';
    let bool;
    for (let i = 0; i < twigBranches.length; i++) {
      const branch = twigBranches[i];
      const lastIndex = branch.length - 1;
      const { leaves } = branch[lastIndex];
      bool = this.#finder._matchLeaves(leaves, node, opt);
      if (bool && lastIndex > 0) {
        let nextNodes = new Set([node]);
        for (let j = lastIndex - 1; j >= 0; j--) {
          const twig = branch[j];
          const arr = [];
          opt.dir = DIR_PREV;
          for (const nextNode of nextNodes) {
            const matches = this.#finder._collectCombinatorMatches(
              twig,
              nextNode,
              opt
            );
            arr.push(...matches);
          }
          if (arr.length) {
            if (j === 0) {
              bool = true;
            } else {
              nextNodes = new Set(arr);
            }
          } else {
            bool = false;
            break;
          }
        }
      }
      if (bool) {
        break;
      }
    }
    if (astName === 'not') {
      if (bool) {
        return null;
      } else {
        return node;
      }
    }
    if (bool) {
      return node;
    } else {
      return null;
    }
  }

  /**
   * The primary entry point for evaluating any pseudo-class selector.
   * @see https://html.spec.whatwg.org/#pseudo-classes
   * @param {object} ast - The AST representing the pseudo-class.
   * @param {object} node - The Element node to evaluate.
   * @param {object} [opt] - Evaluation options.
   * @returns {Set<object>} A collection of matched nodes.
   */
  evaluate(ast, node, opt = {}) {
    const { children: astChildren, name: astName } = ast;
    const { localName, parentNode } = node;
    const { forgive, warn = this.#finder.warn } = opt;
    const matched = new Set();
    const window = this.#finder.window;
    if (Array.isArray(astChildren) && KEYS_LOGICAL.has(astName)) {
      if (!astChildren.length && astName !== 'is' && astName !== 'where') {
        return this.#finder.onError(
          generateException(
            `Invalid selector ${generateCSS(ast)}`,
            SYNTAX_ERR,
            window
          )
        );
      }
      let astData;
      if (this.#finder.astCache.has(ast)) {
        astData = this.#finder.astCache.get(ast);
      } else {
        const { branches } = walkAST(ast);
        if (astName === 'has') {
          let forgiven = false;
          for (let i = 0; i < astChildren.length; i++) {
            const item = findAST(astChildren[i], findLogicalWithNestedHas);
            if (item) {
              if (item.name === 'is' || item.name === 'where') {
                forgiven = true;
                break;
              } else {
                return this.#finder.onError(
                  generateException(
                    `Invalid selector ${generateCSS(ast)}`,
                    SYNTAX_ERR,
                    window
                  )
                );
              }
            }
          }
          if (forgiven) {
            return matched;
          }
          astData = { astName, branches };
        } else {
          const twigBranches = [];
          for (let i = 0; i < branches.length; i++) {
            const [...leaves] = branches[i];
            const branch = [];
            const leavesSet = new Set();
            for (const item of leaves) {
              if (item.type === COMBINATOR) {
                branch.push({ combo: item, leaves: [...leavesSet] });
                leavesSet.clear();
              } else {
                leavesSet.add(item);
              }
            }
            branch.push({ combo: null, leaves: [...leavesSet] });
            leavesSet.clear();
            twigBranches.push(branch);
          }
          astData = { astName, branches, twigBranches };
          this.#finder.astCache.set(ast, astData);
        }
      }
      const res = this._matchLogicalPseudoFunc(astData, node, opt);
      if (res) {
        matched.add(res);
      }
    } else if (Array.isArray(astChildren)) {
      if (/^nth-(?:last-)?(?:child|of-type)$/.test(astName)) {
        if (astChildren.length !== 1) {
          return this.#finder.onError(
            generateException(
              `Invalid selector ${generateCSS(ast)}`,
              SYNTAX_ERR,
              window
            )
          );
        }
        return this._matchAnPlusB(astChildren[0], node, astName, opt);
      } else {
        switch (astName) {
          case 'dir': {
            if (astChildren.length !== 1) {
              return this.#finder.onError(
                generateException(
                  `Invalid selector ${generateCSS(ast)}`,
                  SYNTAX_ERR,
                  window
                )
              );
            }
            if (matchDirectionPseudoClass(astChildren[0], node)) {
              matched.add(node);
            }
            break;
          }
          case 'lang': {
            if (!astChildren.length) {
              return this.#finder.onError(
                generateException(
                  `Invalid selector ${generateCSS(ast)}`,
                  SYNTAX_ERR,
                  window
                )
              );
            }
            for (const astChild of astChildren) {
              if (matchLanguagePseudoClass(astChild, node)) {
                matched.add(node);
                break;
              }
            }
            break;
          }
          case 'state': {
            if (isCustomElement(node) && astChildren[0].value) {
              const stateValue = astChildren[0].value;
              if (node[stateValue]) {
                matched.add(node);
              } else {
                for (const i in node) {
                  const prop = node[i];
                  if (
                    prop instanceof window.ElementInternals &&
                    prop?.states?.has(stateValue)
                  ) {
                    matched.add(node);
                    break;
                  }
                }
              }
            }
            break;
          }
          case 'current':
          case 'heading':
          case 'nth-col':
          case 'nth-last-col': {
            if (warn) {
              this.#finder.onError(
                generateException(
                  `Unsupported pseudo-class :${astName}()`,
                  NOT_SUPPORTED_ERR,
                  window
                )
              );
            }
            break;
          }
          case 'host':
          case 'host-context': {
            break;
          }
          case 'contains': {
            if (warn) {
              this.#finder.onError(
                generateException(
                  `Unknown pseudo-class :${astName}()`,
                  NOT_SUPPORTED_ERR,
                  window
                )
              );
            }
            break;
          }
          default: {
            if (!forgive) {
              this.#finder.onError(
                generateException(
                  `Unknown pseudo-class :${astName}()`,
                  SYNTAX_ERR,
                  window
                )
              );
            }
          }
        }
      }
    } else if (KEYS_PS_NTH_OF_TYPE.has(astName)) {
      if (node === this.#finder.root) {
        matched.add(node);
      } else if (parentNode) {
        switch (astName) {
          case 'first-of-type': {
            const [node1] = this._collectNthOfType({ a: 0, b: 1 }, node);
            if (node1) {
              matched.add(node1);
            }
            break;
          }
          case 'last-of-type': {
            const [node2] = this._collectNthOfType(
              { a: 0, b: 1, reverse: true },
              node
            );
            if (node2) {
              matched.add(node2);
            }
            break;
          }
          default: {
            const [node3] = this._collectNthOfType({ a: 0, b: 1 }, node);
            if (node3 === node) {
              const [node4] = this._collectNthOfType(
                { a: 0, b: 1, reverse: true },
                node
              );
              if (node4 === node) {
                matched.add(node);
              }
            }
          }
        }
      }
    } else {
      switch (astName) {
        case 'disabled':
        case 'enabled': {
          if (matchDisabledPseudoClass(astName, node)) {
            matched.add(node);
          }
          break;
        }
        case 'read-only':
        case 'read-write': {
          if (matchReadOnlyPseudoClass(astName, node)) {
            matched.add(node);
          }
          break;
        }
        case 'any-link':
        case 'link': {
          if (
            (localName === 'a' || localName === 'area') &&
            node.hasAttribute('href')
          ) {
            matched.add(node);
          }
          break;
        }
        case 'local-link': {
          if (
            (localName === 'a' || localName === 'area') &&
            node.hasAttribute('href')
          ) {
            const { href, origin, pathname } = this.#finder.getDocumentURL();
            const attrURL = new URL(node.getAttribute('href'), href);
            if (attrURL.origin === origin && attrURL.pathname === pathname) {
              matched.add(node);
            }
          }
          break;
        }
        case 'visited': {
          break;
        }
        case 'hover': {
          const { target, type } = this.#finder.tracker.event ?? {};
          if (
            /^(?:click|mouse(?:down|over|up))$/.test(type) &&
            target?.nodeType === ELEMENT_NODE &&
            node.contains(target)
          ) {
            matched.add(node);
          }
          break;
        }
        case 'active': {
          const {
            buttons,
            target: aTarget,
            type: aType
          } = this.#finder.tracker.event ?? {};
          if (
            aType === 'mousedown' &&
            buttons & 1 &&
            aTarget?.nodeType === ELEMENT_NODE &&
            node.contains(aTarget)
          ) {
            matched.add(node);
          }
          break;
        }
        case 'target': {
          const { hash } = this.#finder.getDocumentURL();
          if (
            node.id &&
            hash === `#${node.id}` &&
            this.#finder.document.contains(node)
          ) {
            matched.add(node);
          }
          break;
        }
        case 'target-within': {
          const { hash: twHash } = this.#finder.getDocumentURL();
          if (twHash) {
            const id = twHash.replace(/^#/, '');
            let current = this.#finder.document.getElementById(id);
            while (current) {
              if (current === node) {
                matched.add(node);
                break;
              }
              current = current.parentNode;
            }
          }
          break;
        }
        case 'scope': {
          if (this.#finder.node.nodeType === ELEMENT_NODE) {
            if (!this.#finder.shadow && node === this.#finder.node) {
              matched.add(node);
            }
          } else if (node === this.#finder.document.documentElement) {
            matched.add(node);
          }
          break;
        }
        case 'focus': {
          const activeElement = this.#finder.document.activeElement;
          if (node === activeElement && isFocusableArea(node)) {
            matched.add(node);
          } else if (activeElement.shadowRoot) {
            const activeShadowElement = activeElement.shadowRoot.activeElement;
            let current = activeShadowElement;
            while (current) {
              if (current.nodeType === DOCUMENT_FRAGMENT_NODE) {
                if (current.host === activeElement) {
                  if (isFocusableArea(node)) {
                    matched.add(node);
                  } else {
                    matched.add(current.host);
                  }
                }
                break;
              } else {
                current = current.parentNode;
              }
            }
          }
          break;
        }
        case 'focus-visible': {
          if (
            node === this.#finder.document.activeElement &&
            isFocusableArea(node)
          ) {
            let bool;
            if (isFocusVisible(node)) {
              bool = true;
            } else if (this.#finder.tracker.focus) {
              const { relatedTarget, target: focusTarget } =
                this.#finder.tracker.focus;
              if (focusTarget === node) {
                if (isFocusVisible(relatedTarget)) {
                  bool = true;
                } else if (this.#finder.tracker.event) {
                  const {
                    altKey,
                    ctrlKey,
                    key,
                    metaKey,
                    target: eventTarget,
                    type: eventType
                  } = this.#finder.tracker.event;
                  if (eventTarget === relatedTarget) {
                    if (
                      this.#finder.tracker.lastFocusVisible === null ||
                      focusTarget === this.#finder.tracker.lastFocusVisible
                    ) {
                      bool = true;
                    }
                  } else if (key === 'Tab') {
                    if (
                      (eventType === 'keydown' && eventTarget !== node) ||
                      (eventType === 'keyup' && eventTarget === node)
                    ) {
                      if (eventTarget === focusTarget) {
                        if (
                          this.#finder.tracker.lastFocusVisible === null ||
                          (eventTarget ===
                            this.#finder.tracker.lastFocusVisible &&
                            relatedTarget === null)
                        ) {
                          bool = true;
                        }
                      } else {
                        bool = true;
                      }
                    }
                  } else if (
                    key &&
                    (eventType === 'keydown' || eventType === 'keyup') &&
                    !altKey &&
                    !ctrlKey &&
                    !metaKey &&
                    eventTarget === node
                  ) {
                    bool = true;
                  }
                } else if (
                  relatedTarget === null ||
                  relatedTarget === this.#finder.tracker.lastFocusVisible
                ) {
                  bool = true;
                }
              }
            }
            if (bool) {
              this.#finder.tracker.lastFocusVisible = node;
              matched.add(node);
            } else if (this.#finder.tracker.lastFocusVisible === node) {
              this.#finder.tracker.lastFocusVisible = null;
            }
          }
          break;
        }
        case 'focus-within': {
          const ae = this.#finder.document.activeElement;
          if (node.contains(ae) && isFocusableArea(ae)) {
            matched.add(node);
          } else if (ae.shadowRoot) {
            const ase = ae.shadowRoot.activeElement;
            if (node.contains(ase)) {
              matched.add(node);
            } else {
              let current = ase;
              while (current) {
                if (current.nodeType === DOCUMENT_FRAGMENT_NODE) {
                  if (current.host === ae && node.contains(current.host)) {
                    matched.add(node);
                  }
                  break;
                } else {
                  current = current.parentNode;
                }
              }
            }
          }
          break;
        }
        case 'open':
        case 'closed': {
          if (localName === 'details' || localName === 'dialog') {
            if (node.hasAttribute('open')) {
              if (astName === 'open') {
                matched.add(node);
              }
            } else if (astName === 'closed') {
              matched.add(node);
            }
          }
          break;
        }
        case 'popover-open': {
          try {
            if (node.matches(':popover-open')) {
              matched.add(node);
            }
          } catch (e) {
            // fall through
          }
          break;
        }
        case 'placeholder-shown': {
          let placeholder;
          if (node.placeholder) {
            placeholder = node.placeholder;
          } else if (node.hasAttribute('placeholder')) {
            placeholder = node.getAttribute('placeholder');
          }
          if (typeof placeholder === 'string' && !/[\r\n]/.test(placeholder)) {
            let targetNode;
            if (localName === 'textarea') {
              targetNode = node;
            } else if (
              localName === 'input' &&
              (!node.hasAttribute('type') ||
                KEYS_INPUT_PLACEHOLDER.has(node.getAttribute('type')))
            ) {
              targetNode = node;
            }
            if (targetNode && node.value === '') {
              matched.add(node);
            }
          }
          break;
        }
        case 'checked': {
          const attrTypeChecked = node.getAttribute('type');
          if (
            (node.checked &&
              localName === 'input' &&
              (attrTypeChecked === 'checkbox' ||
                attrTypeChecked === 'radio')) ||
            (node.selected && localName === 'option')
          ) {
            matched.add(node);
          }
          break;
        }
        case 'indeterminate': {
          if (
            (node.indeterminate &&
              localName === 'input' &&
              node.type === 'checkbox') ||
            (localName === 'progress' && !node.hasAttribute('value'))
          ) {
            matched.add(node);
          } else if (
            localName === 'input' &&
            node.type === 'radio' &&
            !node.hasAttribute('checked')
          ) {
            const nodeName = node.name;
            let parent = node.parentNode;
            while (parent) {
              if (parent.localName === 'form') {
                break;
              }
              parent = parent.parentNode;
            }
            if (!parent) {
              parent = this.#finder.document.documentElement;
            }
            const walker = this.#finder._createTreeWalker(parent);
            let refNode = traverseNode(parent, walker);
            refNode = walker.firstChild();
            let checked;
            while (refNode) {
              if (
                refNode.localName === 'input' &&
                refNode.getAttribute('type') === 'radio'
              ) {
                if (
                  !refNode.hasAttribute('name') ||
                  refNode.getAttribute('name') === nodeName
                ) {
                  checked = !!refNode.checked;
                }
                if (checked) {
                  break;
                }
              }
              refNode = walker.nextNode();
            }
            if (!checked) {
              matched.add(node);
            }
          }
          break;
        }
        case 'default': {
          const attrTypeDefault = node.getAttribute('type');
          if (
            (localName === 'button' &&
              !(
                node.hasAttribute('type') &&
                KEYS_INPUT_RESET.has(attrTypeDefault)
              )) ||
            (localName === 'input' &&
              node.hasAttribute('type') &&
              KEYS_INPUT_SUBMIT.has(attrTypeDefault))
          ) {
            let form = node.parentNode;
            while (form) {
              if (form.localName === 'form') {
                break;
              }
              form = form.parentNode;
            }
            if (form) {
              const walker = this.#finder._createTreeWalker(form);
              let refNode = traverseNode(form, walker);
              refNode = walker.firstChild();
              while (refNode) {
                const nodeName = refNode.localName;
                const nodeAttrType = refNode.getAttribute('type');
                let m;
                if (nodeName === 'button') {
                  m = !(
                    refNode.hasAttribute('type') &&
                    KEYS_INPUT_RESET.has(nodeAttrType)
                  );
                } else if (nodeName === 'input') {
                  m =
                    refNode.hasAttribute('type') &&
                    KEYS_INPUT_SUBMIT.has(nodeAttrType);
                }
                if (m) {
                  if (refNode === node) {
                    matched.add(node);
                  }
                  break;
                }
                refNode = walker.nextNode();
              }
            }
          } else if (
            localName === 'input' &&
            node.hasAttribute('type') &&
            node.hasAttribute('checked') &&
            KEYS_INPUT_CHECK.has(attrTypeDefault)
          ) {
            matched.add(node);
          } else if (localName === 'option' && node.hasAttribute('selected')) {
            matched.add(node);
          }
          break;
        }
        case 'valid':
        case 'invalid': {
          if (KEYS_FORM_PS_VALID.has(localName)) {
            let valid;
            if (node.checkValidity()) {
              valid =
                node.maxLength >= 0
                  ? node.maxLength >= node.value.length
                  : true;
            }
            if (valid) {
              if (astName === 'valid') {
                matched.add(node);
              }
            } else if (astName === 'invalid') {
              matched.add(node);
            }
          } else if (localName === 'fieldset') {
            const walker = this.#finder._createTreeWalker(node);
            let refNode = traverseNode(node, walker);
            refNode = walker.firstChild();
            let valid = true;
            if (refNode) {
              while (refNode) {
                if (KEYS_FORM_PS_VALID.has(refNode.localName)) {
                  if (refNode.checkValidity()) {
                    valid =
                      refNode.maxLength >= 0
                        ? refNode.maxLength >= refNode.value.length
                        : true;
                  } else {
                    valid = false;
                  }
                  if (!valid) {
                    break;
                  }
                }
                refNode = walker.nextNode();
              }
            }
            if (valid) {
              if (astName === 'valid') {
                matched.add(node);
              }
            } else if (astName === 'invalid') {
              matched.add(node);
            }
          }
          break;
        }
        case 'in-range':
        case 'out-of-range': {
          const attrTypeRange = node.getAttribute('type');
          if (
            localName === 'input' &&
            !(node.readOnly || node.hasAttribute('readonly')) &&
            !(node.disabled || node.hasAttribute('disabled')) &&
            KEYS_INPUT_RANGE.has(attrTypeRange)
          ) {
            const flowed =
              node.validity.rangeUnderflow || node.validity.rangeOverflow;
            if (astName === 'out-of-range' && flowed) {
              matched.add(node);
            } else if (
              astName === 'in-range' &&
              !flowed &&
              (node.hasAttribute('min') ||
                node.hasAttribute('max') ||
                attrTypeRange === 'range')
            ) {
              matched.add(node);
            }
          }
          break;
        }
        case 'required':
        case 'optional': {
          let required, optional;
          if (localName === 'select' || localName === 'textarea') {
            if (node.required || node.hasAttribute('required')) {
              required = true;
            } else {
              optional = true;
            }
          } else if (localName === 'input') {
            if (node.hasAttribute('type')) {
              if (KEYS_INPUT_REQUIRED.has(node.getAttribute('type'))) {
                if (node.required || node.hasAttribute('required')) {
                  required = true;
                } else {
                  optional = true;
                }
              } else {
                optional = true;
              }
            } else if (node.required || node.hasAttribute('required')) {
              required = true;
            } else {
              optional = true;
            }
          }
          if (astName === 'required' && required) {
            matched.add(node);
          } else if (astName === 'optional' && optional) {
            matched.add(node);
          }
          break;
        }
        case 'root': {
          if (node === this.#finder.document.documentElement) {
            matched.add(node);
          }
          break;
        }
        case 'empty': {
          if (node.hasChildNodes()) {
            const walker = this.#finder._createTreeWalker(node, {
              force: true,
              whatToShow: SHOW_ALL
            });
            let refNode = walker.firstChild();
            let bool;
            while (refNode) {
              bool =
                refNode.nodeType !== ELEMENT_NODE &&
                refNode.nodeType !== TEXT_NODE;
              if (!bool) {
                break;
              }
              refNode = walker.nextSibling();
            }
            if (bool) {
              matched.add(node);
            }
          } else {
            matched.add(node);
          }
          break;
        }
        case 'first-child': {
          if (
            (parentNode && node === parentNode.firstElementChild) ||
            node === this.#finder.root
          ) {
            matched.add(node);
          }
          break;
        }
        case 'last-child': {
          if (
            (parentNode && node === parentNode.lastElementChild) ||
            node === this.#finder.root
          ) {
            matched.add(node);
          }
          break;
        }
        case 'only-child': {
          if (
            (parentNode &&
              node === parentNode.firstElementChild &&
              node === parentNode.lastElementChild) ||
            node === this.#finder.root
          ) {
            matched.add(node);
          }
          break;
        }
        case 'defined': {
          if (node.hasAttribute('is') || localName.includes('-')) {
            if (isCustomElement(node)) {
              matched.add(node);
            }
          } else if (
            node instanceof window.HTMLElement ||
            node instanceof window.SVGElement
          ) {
            matched.add(node);
          }
          break;
        }
        case 'host':
        case 'host-context': {
          break;
        }
        case 'after':
        case 'before':
        case 'first-letter':
        case 'first-line': {
          if (warn) {
            this.#finder.onError(
              generateException(
                `Unsupported pseudo-element ::${astName}`,
                NOT_SUPPORTED_ERR,
                window
              )
            );
          }
          break;
        }
        case 'autofill':
        case 'blank':
        case 'buffering':
        case 'current':
        case 'fullscreen':
        case 'future':
        case 'has-slotted':
        case 'heading':
        case 'modal':
        case 'muted':
        case 'past':
        case 'paused':
        case 'picture-in-picture':
        case 'playing':
        case 'seeking':
        case 'stalled':
        case 'user-invalid':
        case 'user-valid':
        case 'volume-locked':
        case '-webkit-autofill': {
          if (warn) {
            this.#finder.onError(
              generateException(
                `Unsupported pseudo-class :${astName}`,
                NOT_SUPPORTED_ERR,
                window
              )
            );
          }
          break;
        }
        default: {
          if (astName.startsWith('-webkit-')) {
            if (warn) {
              this.#finder.onError(
                generateException(
                  `Unsupported pseudo-class :${astName}`,
                  NOT_SUPPORTED_ERR,
                  window
                )
              );
            }
          } else if (!forgive) {
            this.#finder.onError(
              generateException(
                `Unknown pseudo-class :${astName}`,
                SYNTAX_ERR,
                window
              )
            );
          }
        }
      }
    }
    return matched;
  }
}
