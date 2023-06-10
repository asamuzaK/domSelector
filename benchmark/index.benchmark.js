/**
 * index.benchmark.js
 */
'use strict';

/* import */
const Benchmark = require('benchmark');
const { JSDOM } = require('jsdom');
const { name: packageName, version } = require('../package.json');
const {
  closest, matches, querySelector, querySelectorAll
} = require('../src/index.js');
const { parseSelector, walkAST } = require('../src/js/parser.js');

/* parser tests */
const parserParseSelector = () => {
  const opt = {
    setup: () => {
      const selector =
        '#foo * .bar > baz:not(:is(.qux, .quux)) + [corge] ~ .grault';
    },
    fn: () => {
      parseSelector(selector);
    }
  };
  return new Benchmark(opt);
};

const parserWalkAST = () => {
  const opt = {
    setup: () => {
      const selector =
        '#foo * .bar > baz:not(:is(.qux, .quux)) + [corge] ~ .grault';
      const ast = parseSelector(selector);
    },
    fn: () => {
      walkAST(ast);
    }
  }
  return new Benchmark(opt);
};

/* loop tests */
const forLoop = () => {
  const opt = {
    setup: () => {
      const {
        window
      } = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
        runScripts: 'dangerously',
        url: 'http://localhost'
      });
      const { document } = window;
      const x = 32;
      const y = 32;
      const xyFrag = document.createDocumentFragment();
      for (let i = 0; i < x; i++) {
        const xNode = document.createElement('div');
        xNode.id = `box${i}`;
        xNode.classList.add('box');
        xyFrag.appendChild(xNode);
        const yFrag = document.createDocumentFragment();
        for (let j = 0; j < y; j++) {
          const yNode = document.createElement('div');
          yNode.id = `div${i}-${j}`;
          if (j === 0) {
            yFrag.appendChild(yNode);
          } else if (j === y - 1) {
            yNode.classList.add('div');
            yNode.textContent = `${i}-${j}`;
            yFrag.appendChild(yNode);
            xNode.appendChild(yFrag);
          } else {
            const parent = yFrag.getElementById(`div${i}-${j - 1}`);
            parent.appendChild(yNode);
          }
        }
      }
      const container = document.createElement('div');
      container.classList.add('box-container');
      container.appendChild(xyFrag);
      document.body.append(container);
      const nodes = new Set();
      const [...items] = document.getElementsByTagName('*');
      const l = items.length;
    },
    fn: () => {
      for (let i = 0; i < l; i++) {
        const item = items[i];
        nodes.add(item);
      }
    }
  }
  return new Benchmark(opt);
};

const nodeIterator = () => {
  const opt = {
    setup: () => {
      const {
        window
      } = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
        runScripts: 'dangerously',
        url: 'http://localhost'
      });
      const { document } = window;
      const x = 32;
      const y = 32;
      const xyFrag = document.createDocumentFragment();
      for (let i = 0; i < x; i++) {
        const xNode = document.createElement('div');
        xNode.id = `box${i}`;
        xNode.classList.add('box');
        xyFrag.appendChild(xNode);
        const yFrag = document.createDocumentFragment();
        for (let j = 0; j < y; j++) {
          const yNode = document.createElement('div');
          yNode.id = `div${i}-${j}`;
          if (j === 0) {
            yFrag.appendChild(yNode);
          } else if (j === y - 1) {
            yNode.classList.add('div');
            yNode.textContent = `${i}-${j}`;
            yFrag.appendChild(yNode);
            xNode.appendChild(yFrag);
          } else {
            const parent = yFrag.getElementById(`div${i}-${j - 1}`);
            parent.appendChild(yNode);
          }
        }
      }
      const container = document.createElement('div');
      container.classList.add('box-container');
      container.appendChild(xyFrag);
      document.body.append(container);
      const nodes = new Set();
    },
    fn: () => {
      const iterator = document.createNodeIterator(document, 1);
      let nextNode = iterator.nextNode();
      while (nextNode) {
        nodes.add(nextNode);
        nextNode = iterator.nextNode();
      }
    }
  }
  return new Benchmark(opt);
};

const setForEach = () => {
  const opt = {
    setup: () => {
      const {
        window
      } = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
        runScripts: 'dangerously',
        url: 'http://localhost'
      });
      const { document } = window;
      const x = 32;
      const y = 32;
      const xyFrag = document.createDocumentFragment();
      for (let i = 0; i < x; i++) {
        const xNode = document.createElement('div');
        xNode.id = `box${i}`;
        xNode.classList.add('box');
        xyFrag.appendChild(xNode);
        const yFrag = document.createDocumentFragment();
        for (let j = 0; j < y; j++) {
          const yNode = document.createElement('div');
          yNode.id = `div${i}-${j}`;
          if (j === 0) {
            yFrag.appendChild(yNode);
          } else if (j === y - 1) {
            yNode.classList.add('div');
            yNode.textContent = `${i}-${j}`;
            yFrag.appendChild(yNode);
            xNode.appendChild(yFrag);
          } else {
            const parent = yFrag.getElementById(`div${i}-${j - 1}`);
            parent.appendChild(yNode);
          }
        }
      }
      const container = document.createElement('div');
      container.classList.add('box-container');
      container.appendChild(xyFrag);
      document.body.append(container);
      const nodes = new Set();
      const items = new Set([...document.getElementsByTagName('*')]);
    },
    fn: () => {
      items.forEach(item => {
        nodes.add(item);
      });
    }
  }
  return new Benchmark(opt);
};

const setForOf = () => {
  const opt = {
    setup: () => {
      const {
        window
      } = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
        runScripts: 'dangerously',
        url: 'http://localhost'
      });
      const { document } = window;
      const x = 32;
      const y = 32;
      const xyFrag = document.createDocumentFragment();
      for (let i = 0; i < x; i++) {
        const xNode = document.createElement('div');
        xNode.id = `box${i}`;
        xNode.classList.add('box');
        xyFrag.appendChild(xNode);
        const yFrag = document.createDocumentFragment();
        for (let j = 0; j < y; j++) {
          const yNode = document.createElement('div');
          yNode.id = `div${i}-${j}`;
          if (j === 0) {
            yFrag.appendChild(yNode);
          } else if (j === y - 1) {
            yNode.classList.add('div');
            yNode.textContent = `${i}-${j}`;
            yFrag.appendChild(yNode);
            xNode.appendChild(yFrag);
          } else {
            const parent = yFrag.getElementById(`div${i}-${j - 1}`);
            parent.appendChild(yNode);
          }
        }
      }
      const container = document.createElement('div');
      container.classList.add('box-container');
      container.appendChild(xyFrag);
      document.body.append(container);
      const nodes = new Set();
      const items = new Set([...document.getElementsByTagName('*')]);
    },
    fn: () => {
      for (const item of items) {
        nodes.add(item);
      }
    }
  }
  return new Benchmark(opt);
};

/* matcher tests*/
const elementMatches = (type, api) => {
  const opt = {
    setup: () => {
      const {
        window
      } = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
        runScripts: 'dangerously',
        url: 'http://localhost'
      });
      const { document } = window;
      const x = 32;
      const y = 32;
      const xyFrag = document.createDocumentFragment();
      for (let i = 0; i < x; i++) {
        const xNode = document.createElement('div');
        xNode.id = `box${i}`;
        xNode.classList.add('box');
        xyFrag.appendChild(xNode);
        const yFrag = document.createDocumentFragment();
        for (let j = 0; j < y; j++) {
          const yNode = document.createElement('div');
          yNode.id = `div${i}-${j}`;
          if (j === 0) {
            yFrag.appendChild(yNode);
          } else if (j === y - 1) {
            yNode.classList.add('div');
            yNode.textContent = `${i}-${j}`;
            yFrag.appendChild(yNode);
            xNode.appendChild(yFrag);
          } else {
            const parent = yFrag.getElementById(`div${i}-${j - 1}`);
            parent.appendChild(yNode);
          }
        }
      }
      const container = document.createElement('div');
      container.classList.add('box-container');
      container.appendChild(xyFrag);
      const patch = () => {
        window.Element.prototype.matches = function (selector) {
          return matches(selector, this);
        };
        window.Element.prototype.closest = function (selector) {
          return closest(selector, this);
        };
        window.Document.prototype.querySelector = function (selector) {
          return querySelector(selector, this);
        };
        window.DocumentFragment.prototype.querySelector = function (selector) {
          return querySelector(selector, this);
        };
        window.Element.prototype.querySelector = function (selector) {
          return querySelector(selector, this);
        };
        window.Document.prototype.querySelectorAll = function (selector) {
          return querySelectorAll(selector, this);
        };
        window.DocumentFragment.prototype.querySelectorAll =
          function (selector) {
            return querySelectorAll(selector, this);
          };
        window.Element.prototype.querySelectorAll = function (selector) {
          return querySelectorAll(selector, this);
        };
      }
      let box;
      let div;
      switch (type) {
        case 'document': {
          document.body.append(container);
          box = document.getElementById(`box${x - 1}`);
          div = document.getElementById(`div${x - 1}-${y - 1}`);
          break;
        }
        case 'fragment': {
          const fragment = document.createDocumentFragment();
          fragment.append(container);
          box = fragment.getElementById(`box${x - 1}`);
          div = fragment.getElementById(`div${x - 1}-${y - 1}`);
          break;
        }
        case 'element':
        default: {
          document.body.append(container);
          box = document.getElementById(`box${x - 1}`);
          div = document.getElementById(`div${x - 1}-${y - 1}`);
          const root = document.createElement('div');
          root.append(document.body.removeChild(container));
        }
      }
    },
    fn: () => {
      const selectors = new Map([
        ['.box .div', 'div'],
        ['.box ~ .box', 'box']
      ]);
      for (const [key, value] of selectors) {
        if (api === 'jsdom') {
          if (value === 'box') {
            box.matches(key);
          } else if (value === 'div') {
            div.matches(key);
          }
        } else if ('patched') {
          patch();
          if (value === 'box') {
            box.matches(key);
          } else if (value === 'div') {
            div.matches(key);
          }
        } else {
          if (value === 'box') {
            matches(key, box);
          } else if (value === 'div') {
            matches(key, div);
          }
        }
      }
    }
  };
  return new Benchmark(opt);
};

const elementClosest = (type, api) => {
  const opt = {
    setup: () => {
      const {
        window
      } = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
        runScripts: 'dangerously',
        url: 'http://localhost'
      });
      const { document } = window;
      const x = 32;
      const y = 32;
      const xyFrag = document.createDocumentFragment();
      for (let i = 0; i < x; i++) {
        const xNode = document.createElement('div');
        xNode.id = `box${i}`;
        xNode.classList.add('box');
        xyFrag.appendChild(xNode);
        const yFrag = document.createDocumentFragment();
        for (let j = 0; j < y; j++) {
          const yNode = document.createElement('div');
          yNode.id = `div${i}-${j}`;
          if (j === 0) {
            yFrag.appendChild(yNode);
          } else if (j === y - 1) {
            yNode.classList.add('div');
            yNode.textContent = `${i}-${j}`;
            yFrag.appendChild(yNode);
            xNode.appendChild(yFrag);
          } else {
            const parent = yFrag.getElementById(`div${i}-${j - 1}`);
            parent.appendChild(yNode);
          }
        }
      }
      const container = document.createElement('div');
      container.classList.add('box-container');
      container.appendChild(xyFrag);
      const patch = () => {
        window.Element.prototype.matches = function (selector) {
          return matches(selector, this);
        };
        window.Element.prototype.closest = function (selector) {
          return closest(selector, this);
        };
        window.Document.prototype.querySelector = function (selector) {
          return querySelector(selector, this);
        };
        window.DocumentFragment.prototype.querySelector = function (selector) {
          return querySelector(selector, this);
        };
        window.Element.prototype.querySelector = function (selector) {
          return querySelector(selector, this);
        };
        window.Document.prototype.querySelectorAll = function (selector) {
          return querySelectorAll(selector, this);
        };
        window.DocumentFragment.prototype.querySelectorAll =
          function (selector) {
            return querySelectorAll(selector, this);
          };
        window.Element.prototype.querySelectorAll = function (selector) {
          return querySelectorAll(selector, this);
        };
      }
      let box;
      let div;
      switch (type) {
        case 'document': {
          document.body.append(container);
          box = document.getElementById(`box${x - 1}`);
          div = document.getElementById(`div${x - 1}-${y - 1}`);
          break;
        }
        case 'fragment': {
          const fragment = document.createDocumentFragment();
          fragment.append(container);
          box = fragment.getElementById(`box${x - 1}`);
          div = fragment.getElementById(`div${x - 1}-${y - 1}`);
          break;
        }
        case 'element':
        default: {
          document.body.append(container);
          box = document.getElementById(`box${x - 1}`);
          div = document.getElementById(`div${x - 1}-${y - 1}`);
          const root = document.createElement('div');
          root.append(document.body.removeChild(container));
        }
      }
    },
    fn: () => {
      const selectors = new Map([
        ['.box .div', 'div'],
        ['.box ~ .box', 'box']
      ]);
      for (const [key, value] of selectors) {
        if (api === 'jsdom') {
          if (value === 'box') {
            box.closest(key);
          } else if (value === 'div') {
            div.closest(key);
          }
        } else if ('patched') {
          patch();
          if (value === 'box') {
            box.closest(key);
          } else if (value === 'div') {
            div.closest(key);
          }
        } else {
          if (value === 'box') {
            closest(key, box);
          } else if (value === 'div') {
            closest(key, div);
          }
        }
      }
    }
  };
  return new Benchmark(opt);
};

const refPointQuerySelector = (type, api) => {
  const opt = {
    setup: () => {
      const {
        window
      } = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
        runScripts: 'dangerously',
        url: 'http://localhost'
      });
      const { document } = window;
      const x = 32;
      const y = 32;
      const xyFrag = document.createDocumentFragment();
      for (let i = 0; i < x; i++) {
        const xNode = document.createElement('div');
        xNode.id = `box${i}`;
        xNode.classList.add('box');
        xyFrag.appendChild(xNode);
        const yFrag = document.createDocumentFragment();
        for (let j = 0; j < y; j++) {
          const yNode = document.createElement('div');
          yNode.id = `div${i}-${j}`;
          if (j === 0) {
            yFrag.appendChild(yNode);
          } else if (j === y - 1) {
            yNode.classList.add('div');
            yNode.textContent = `${i}-${j}`;
            yFrag.appendChild(yNode);
            xNode.appendChild(yFrag);
          } else {
            const parent = yFrag.getElementById(`div${i}-${j - 1}`);
            parent.appendChild(yNode);
          }
        }
      }
      const container = document.createElement('div');
      container.classList.add('box-container');
      container.appendChild(xyFrag);
      const patch = () => {
        window.Element.prototype.matches = function (selector) {
          return matches(selector, this);
        };
        window.Element.prototype.closest = function (selector) {
          return closest(selector, this);
        };
        window.Document.prototype.querySelector = function (selector) {
          return querySelector(selector, this);
        };
        window.DocumentFragment.prototype.querySelector = function (selector) {
          return querySelector(selector, this);
        };
        window.Element.prototype.querySelector = function (selector) {
          return querySelector(selector, this);
        };
        window.Document.prototype.querySelectorAll = function (selector) {
          return querySelectorAll(selector, this);
        };
        window.DocumentFragment.prototype.querySelectorAll =
          function (selector) {
            return querySelectorAll(selector, this);
          };
        window.Element.prototype.querySelectorAll = function (selector) {
          return querySelectorAll(selector, this);
        };
      }
      let refPoint;
      switch (type) {
        case 'document': {
          document.body.append(container);
          refPoint = document;
          break;
        }
        case 'fragment': {
          const fragment = document.createDocumentFragment();
          fragment.append(container);
          refPoint = fragment;
          break;
        }
        case 'element':
        default: {
          const root = document.createElement('div');
          root.appendChild(container);
          refPoint = root;
        }
      }
    },
    fn: () => {
      const selectors = [
        '.box .div',
        '.box ~ .box'
      ];
      for (const selector of selectors) {
        if (api === 'jsdom') {
          refPoint.querySelector(selector);
        } else if ('patched') {
          patch();
          refPoint.querySelector(selector);
        } else {
          querySelector(selector, refPoint);
        }
      }
    }
  };
  return new Benchmark(opt);
};

const refPointQuerySelectorAll = (type, api) => {
  const opt = {
    setup: () => {
      const {
        window
      } = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
        runScripts: 'dangerously',
        url: 'http://localhost'
      });
      const { document } = window;
      const x = 32;
      const y = 32;
      const xyFrag = document.createDocumentFragment();
      for (let i = 0; i < x; i++) {
        const xNode = document.createElement('div');
        xNode.id = `box${i}`;
        xNode.classList.add('box');
        xyFrag.appendChild(xNode);
        const yFrag = document.createDocumentFragment();
        for (let j = 0; j < y; j++) {
          const yNode = document.createElement('div');
          yNode.id = `div${i}-${j}`;
          if (j === 0) {
            yFrag.appendChild(yNode);
          } else if (j === y - 1) {
            yNode.classList.add('div');
            yNode.textContent = `${i}-${j}`;
            yFrag.appendChild(yNode);
            xNode.appendChild(yFrag);
          } else {
            const parent = yFrag.getElementById(`div${i}-${j - 1}`);
            parent.appendChild(yNode);
          }
        }
      }
      const container = document.createElement('div');
      container.classList.add('box-container');
      container.appendChild(xyFrag);
      const patch = () => {
        window.Element.prototype.matches = function (selector) {
          return matches(selector, this);
        };
        window.Element.prototype.closest = function (selector) {
          return closest(selector, this);
        };
        window.Document.prototype.querySelector = function (selector) {
          return querySelector(selector, this);
        };
        window.DocumentFragment.prototype.querySelector = function (selector) {
          return querySelector(selector, this);
        };
        window.Element.prototype.querySelector = function (selector) {
          return querySelector(selector, this);
        };
        window.Document.prototype.querySelectorAll = function (selector) {
          return querySelectorAll(selector, this);
        };
        window.DocumentFragment.prototype.querySelectorAll =
          function (selector) {
            return querySelectorAll(selector, this);
          };
        window.Element.prototype.querySelectorAll = function (selector) {
          return querySelectorAll(selector, this);
        };
      }
      let refPoint;
      switch (type) {
        case 'document': {
          document.body.append(container);
          refPoint = document;
          break;
        }
        case 'fragment': {
          const fragment = document.createDocumentFragment();
          fragment.append(container);
          refPoint = fragment;
          break;
        }
        case 'element':
        default: {
          const root = document.createElement('div');
          root.appendChild(container);
          refPoint = root;
        }
      }
    },
    fn: () => {
      const selectors = [
        '.box .div',
        '.box ~ .box'
      ];
      for (const selector of selectors) {
        if (api === 'jsdom') {
          refPoint.querySelectorAll(selector);
        } else if ('patched') {
          patch();
          refPoint.querySelectorAll(selector);
        } else {
          querySelectorAll(selector, refPoint);
        }
      }
    }
  };
  return new Benchmark(opt);
};

const suite = new Benchmark.Suite();

suite.on('start', () => {
  console.log(`benchmark ${packageName} v${version}`);
}).add('for loop', () => {
  forLoop();
}).add('node iterator', () => {
  nodeIterator();
}).add('set forEach', () => {
  setForEach();
}).add('set for of', () => {
  setForOf();
}).add('parser parseSelector', () => {
  parserParseSelector();
}).add('parser walkAST', () => {
  parserWalkAST();
}).add('dom-selector matches - document', () => {
  elementMatches('document');
}).add('jsdom matches - document', () => {
  elementMatches('document', 'jsdom');
}).add('patched jsdom matches - document', () => {
  elementMatches('document', 'patched');
}).add('dom-selector matches - fragment', () => {
  elementMatches('fragment');
}).add('jsdom matches - fragment', () => {
  elementMatches('fragment', 'jsdom');
}).add('patched jsdom matches - fragment', () => {
  elementMatches('fragment', 'patched');
}).add('dom-selector matches - element', () => {
  elementMatches('element');
}).add('jsdom matches - element', () => {
  elementMatches('element', 'jsdom');
}).add('patched jsdom matches - element', () => {
  elementMatches('element', 'patched');
}).add('dom-selector closest - document', () => {
  elementClosest('document');
}).add('jsdom closest - document', () => {
  elementClosest('document', 'jsdom');
}).add('patched jsdom closest - document', () => {
  elementClosest('document', 'patched');
}).add('dom-selector closest - fragment', () => {
  elementClosest('fragment');
}).add('jsdom closest - fragment', () => {
  elementClosest('fragment', 'jsdom');
}).add('patched jsdom closest - fragment', () => {
  elementClosest('fragment', 'patched');
}).add('dom-selector closest - element', () => {
  elementClosest('element');
}).add('jsdom closest - element', () => {
  elementClosest('element', 'jsdom');
}).add('patched jsdom closest - element', () => {
  elementClosest('element', 'patched');
}).add('dom-selector querySelector - document', () => {
  refPointQuerySelector('document');
}).add('jsdom querySelector - document', () => {
  refPointQuerySelector('document', 'jsdom');
}).add('patched jsdom querySelector - document', () => {
  refPointQuerySelector('document', 'patched');
}).add('dom-selector querySelector - fragment', () => {
  refPointQuerySelector('fragment');
}).add('jsdom querySelector - fragment', () => {
  refPointQuerySelector('fragment', 'jsdom');
}).add('patched jsdom querySelector - fragment', () => {
  refPointQuerySelector('fragment', 'patched');
}).add('dom-selector querySelector - element', () => {
  refPointQuerySelector('element');
}).add('jsdom querySelector - element', () => {
  refPointQuerySelector('element', 'jsdom');
}).add('patched jsdom querySelector - element', () => {
  refPointQuerySelector('element', 'patched');
}).add('dom-selector querySelectorAll - document', () => {
  refPointQuerySelectorAll('document');
}).add('jsdom querySelectorAll - document', () => {
  refPointQuerySelectorAll('document', 'jsdom');
}).add('patched jsdom querySelectorAll - document', () => {
  refPointQuerySelectorAll('document', 'patched');
}).add('dom-selector querySelectorAll - fragment', () => {
  refPointQuerySelectorAll('fragment');
}).add('jsdom querySelectorAll - fragment', () => {
  refPointQuerySelectorAll('fragment', 'jsdom');
}).add('patched jsdom querySelectorAll - fragment', () => {
  refPointQuerySelectorAll('fragment', 'patched');
}).add('dom-selector querySelectorAll - element', () => {
  refPointQuerySelectorAll('element');
}).add('jsdom querySelectorAll - element', () => {
  refPointQuerySelectorAll('element', 'jsdom');
}).add('patched jsdom querySelectorAll - element', () => {
  refPointQuerySelectorAll('element', 'patched');
}).on('cycle', (evt) => {
  console.log(`* ${String(evt.target)}`);
}).run({
  async: true
});
