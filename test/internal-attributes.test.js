import { strict as assert } from 'node:assert';
import { JSDOM } from 'jsdom';
import idlUtils from 'jsdom/lib/generated/idl/utils.js';
import internalConstants from 'jsdom/lib/jsdom/living/helpers/internal-constants.js';
import { describe, it } from 'mocha';
import { DOMSelector } from '../src/index.js';

const { domSymbolTree } = internalConstants;
const getAttributeList = element => element._attributeList;

const selectors = [
  '[data-testid]',
  '[data-testid="target"]',
  '[data-testid="missing"]',
  '[data-testid^="tar"]',
  '[data-testid$="get"]',
  '[data-testid*="arg"]',
  '[data-words~="two"]',
  '[data-dash|="en"]',
  '[data-testid="TARGET" i]',
  '[data-testid="TARGET" s]',
  '[DATA-TESTID]',
  '[lang]',
  '[lang="en"]',
  '[foo]',
  '[foo="target"]',
  '[*|foo]',
  '[*|foo="target"]',
  '[|foo]',
  '[data-testid]:not([missing])',
  'div[data-testid] > span'
];

describe('internal attribute access', () => {
  for (const contentType of [
    'text/html',
    'application/xhtml+xml',
    'application/xml'
  ]) {
    it(`preserves public matching results in ${contentType}`, () => {
      const { window } = new JSDOM('<root/>', { contentType });
      try {
        const document = window.document;
        const root = document.documentElement;
        const element = document.createElementNS(
          'http://www.w3.org/1999/xhtml',
          'div'
        );
        element.setAttribute('data-testid', 'target');
        element.setAttribute('data-words', 'one two three');
        element.setAttribute('data-dash', 'en-US');
        element.setAttributeNS('urn:one', 'x:foo', 'target');
        element.setAttributeNS('urn:two', 'foo', 'other');
        element.setAttributeNS(
          'http://www.w3.org/XML/1998/namespace',
          'xml:lang',
          'en'
        );
        element.appendChild(
          document.createElementNS('http://www.w3.org/1999/xhtml', 'span')
        );
        root.appendChild(element);
        const svg = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'svg'
        );
        svg.setAttribute('DATA-TESTID', 'target');
        svg.setAttributeNS('urn:one', 'x:foo', 'target');
        root.appendChild(svg);
        const plain = new DOMSelector(window, document);
        const internal = new DOMSelector(
          window,
          idlUtils.implForWrapper(document),
          { idlUtils, domSymbolTree, getAttributeList }
        );
        for (const selector of selectors) {
          assert.deepEqual(
            internal.querySelectorAll(selector, idlUtils.implForWrapper(root)),
            plain.querySelectorAll(selector, root),
            selector
          );
          for (const node of [element, svg]) {
            assert.equal(
              internal.matches(selector, idlUtils.implForWrapper(node)),
              plain.matches(selector, node),
              selector
            );
          }
        }
        for (const selector of ['[data-testid="target" z]', '[data-testid=']) {
          assert.throws(
            () =>
              internal.querySelectorAll(
                selector,
                idlUtils.implForWrapper(root)
              ),
            { name: 'SyntaxError' }
          );
        }
        element.removeAttribute('data-testid');
        plain.clear();
        internal.clear();
        assert.deepEqual(
          internal.querySelectorAll(
            '[data-testid]',
            idlUtils.implForWrapper(root)
          ),
          plain.querySelectorAll('[data-testid]', root)
        );
      } finally {
        window.close();
      }
    });
  }

  for (const kind of ['element', 'document', 'fragment', 'shadow']) {
    it(`preserves presence query order and boundaries in a ${kind} root`, () => {
      const { window } = new JSDOM('<main/>');
      try {
        const document = window.document;
        const host = document.body.appendChild(
          document.createElement('section')
        );
        const root =
          kind === 'document'
            ? document
            : kind === 'fragment'
              ? document.createDocumentFragment()
              : kind === 'shadow'
                ? host.attachShadow({ mode: 'closed' })
                : host;
        const parent = kind === 'document' ? document.body : root;
        if (kind === 'element') {
          root.setAttribute('data-testid', 'root');
        }
        parent.appendChild(document.createTextNode('text'));
        parent.appendChild(document.createComment('comment'));
        const first = parent.appendChild(document.createElement('div'));
        first.setAttribute('data-testid', 'first');
        const second = first.appendChild(document.createElement('span'));
        second.setAttribute('data-testid', 'second');
        const shadowHost = parent.appendChild(document.createElement('aside'));
        shadowHost
          .attachShadow({ mode: 'open' })
          .appendChild(document.createElement('b'))
          .setAttribute('data-testid', 'hidden');
        const plain = new DOMSelector(window, document);
        const internal = new DOMSelector(
          window,
          idlUtils.implForWrapper(document),
          { idlUtils, domSymbolTree, getAttributeList }
        );
        assert.deepEqual(
          internal.querySelectorAll(
            '[data-testid]',
            idlUtils.implForWrapper(root)
          ),
          [first, second]
        );
        second.remove();
        internal.clear();
        plain.clear();
        assert.deepEqual(
          internal.querySelectorAll(
            '[data-testid]',
            idlUtils.implForWrapper(root)
          ),
          plain.querySelectorAll('[data-testid]', root)
        );
      } finally {
        window.close();
      }
    });
  }

  it('accepts readonly attribute records without DOM wrappers', () => {
    const { window } = new JSDOM(
      '<main><div data-testid="target"></div></main>'
    );
    try {
      const document = window.document;
      const root = document.querySelector('main');
      const element = root.firstElementChild;
      const attributes = Object.freeze([
        Object.freeze({
          name: 'data-testid',
          value: 'target',
          namespaceURI: null,
          localName: 'data-testid'
        })
      ]);
      let reads = 0;
      const internal = new DOMSelector(
        window,
        idlUtils.implForWrapper(document),
        {
          idlUtils,
          getAttributeList(impl) {
            assert.equal(impl, idlUtils.implForWrapper(element));
            reads++;
            return attributes;
          }
        }
      );
      assert.deepEqual(
        internal.querySelectorAll(
          '[data-testid^="tar"]',
          idlUtils.implForWrapper(root)
        ),
        [element]
      );
      assert.equal(reads, 1);
    } finally {
      window.close();
    }
  });

  it('keeps the public attribute-list fallback when no callback is supplied', () => {
    const { window } = new JSDOM(
      '<main><div data-testid="target"></div></main>'
    );
    try {
      const document = window.document;
      const root = document.querySelector('main');
      const element = root.firstElementChild;
      const internal = new DOMSelector(
        window,
        idlUtils.implForWrapper(document),
        { idlUtils }
      );
      assert.deepEqual(
        internal.querySelectorAll(
          '[data-testid^="tar"]',
          idlUtils.implForWrapper(root)
        ),
        [element]
      );
      element.setAttribute('data-testid', 'other');
      internal.clear();
      assert.deepEqual(
        internal.querySelectorAll(
          '[data-testid^="tar"]',
          idlUtils.implForWrapper(root)
        ),
        []
      );
    } finally {
      window.close();
    }
  });

  it('uses the current document after adoption', () => {
    const { window } = new JSDOM('<main/>');
    try {
      const html = window.document;
      const xml = html.implementation.createDocument(null, 'root');
      const root = html.createElement('section');
      const child = root.appendChild(html.createElement('div'));
      child.setAttribute('data-testid', 'target');
      for (const document of [html, xml, html]) {
        document.adoptNode(root);
        const plain = new DOMSelector(window, document);
        const internal = new DOMSelector(
          window,
          idlUtils.implForWrapper(document),
          { idlUtils, domSymbolTree, getAttributeList }
        );
        for (const selector of [
          '[DATA-TESTID]',
          '[DATA-TESTID="target"]',
          '[data-testid^="tar"]'
        ]) {
          assert.deepEqual(
            internal.querySelectorAll(selector, idlUtils.implForWrapper(root)),
            plain.querySelectorAll(selector, root),
            selector
          );
        }
      }
    } finally {
      window.close();
    }
  });

  it('reads internal attributes without calling overridden public accessors', () => {
    const { window } = new JSDOM(
      '<main><div data-testid="target"></div></main>'
    );
    try {
      const document = window.document;
      const root = document.querySelector('main');
      const element = root.firstElementChild;
      const internal = new DOMSelector(
        window,
        idlUtils.implForWrapper(document),
        { idlUtils, domSymbolTree, getAttributeList }
      );
      const fail = () => {
        throw new Error('public attribute access');
      };
      for (const name of [
        'hasAttribute',
        'getAttribute',
        'getAttributeNames',
        'hasAttributeNS'
      ]) {
        element[name] = fail;
      }
      Object.defineProperty(element, 'attributes', { get: fail });
      for (const selector of [
        '[data-testid]',
        '[data-testid="target"]',
        '[data-testid^="tar"]'
      ]) {
        assert.deepEqual(
          internal.querySelectorAll(selector, idlUtils.implForWrapper(root)),
          [element]
        );
      }
    } finally {
      window.close();
    }
  });
});
