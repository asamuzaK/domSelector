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

const errors = [];

/* parser tests */
const parserParseSelector = () => {
  const opt = {
    fn: () => {
      const selector =
        '#foo * .bar > baz:not(:is(.qux, .quux)) + [corge] ~ .grault';
      parseSelector(selector);
    },
    onError: e => {
      errors.push(e);
    }
  };
  return new Benchmark(opt);
};

const parserWalkAST = () => {
  let ast;
  const opt = {
    setup: () => {
      const selector =
        '#foo * .bar > baz:not(:is(.qux, .quux)) + [corge] ~ .grault';
      ast = parseSelector(selector);
    },
    fn: () => {
      walkAST(ast);
    },
    onError: e => {
      errors.push(e);
    }
  };
  return new Benchmark(opt);
};

/* loop tests */
const forLoop = () => {
  let document;
  const opt = {
    setup: () => {
      const {
        window
      } = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
        runScripts: 'dangerously',
        url: 'http://localhost'
      });
      document = window.document;
      const x = 1000;
      const y = 1000;
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
    },
    fn: () => {
      const [...items] = document.getElementsByTagName('*');
      const l = items.length;
      const nodes = new Set();
      for (let i = 0; i < l; i++) {
        const item = items[i];
        nodes.add(item);
      }
    },
    onError: e => {
      errors.push(e);
    }
  };
  return new Benchmark(opt);
};

const nodeIterator = () => {
  let document;
  const opt = {
    setup: () => {
      const {
        window
      } = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
        runScripts: 'dangerously',
        url: 'http://localhost'
      });
      document = window.document;
      const x = 1000;
      const y = 1000;
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
    },
    fn: () => {
      const iterator = document.createNodeIterator(document, 1);
      let nextNode = iterator.nextNode();
      const nodes = new Set();
      while (nextNode) {
        nodes.add(nextNode);
        nextNode = iterator.nextNode();
      }
    },
    onError: e => {
      errors.push(e);
    }
  };
  return new Benchmark(opt);
};

const setForEach = () => {
  let document;
  const opt = {
    setup: () => {
      const {
        window
      } = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
        runScripts: 'dangerously',
        url: 'http://localhost'
      });
      document = window.document;
      const x = 1000;
      const y = 1000;
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
    },
    fn: () => {
      const items = new Set([...document.getElementsByTagName('*')]);
      const nodes = new Set();
      items.forEach(item => {
        nodes.add(item);
      });
    },
    onError: e => {
      errors.push(e);
    }
  };
  return new Benchmark(opt);
};

const setForOf = () => {
  let document;
  const opt = {
    setup: () => {
      const {
        window
      } = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
        runScripts: 'dangerously',
        url: 'http://localhost'
      });
      document = window.document;
      const x = 1000;
      const y = 1000;
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
    },
    fn: () => {
      const items = new Set([...document.getElementsByTagName('*')]);
      const nodes = new Set();
      for (const item of items) {
        nodes.add(item);
      }
    },
    onError: e => {
      errors.push(e);
    }
  };
  return new Benchmark(opt);
};

/* matcher tests */
const elementMatches = (type, api) => {
  const patch = win => {
    win.Element.prototype.matches = function (selector) {
      return matches(selector, this);
    };
    win.Element.prototype.closest = function (selector) {
      return closest(selector, this);
    };
    win.Document.prototype.querySelector = function (selector) {
      return querySelector(selector, this);
    };
    win.DocumentFragment.prototype.querySelector = function (selector) {
      return querySelector(selector, this);
    };
    win.Element.prototype.querySelector = function (selector) {
      return querySelector(selector, this);
    };
    win.Document.prototype.querySelectorAll = function (selector) {
      return querySelectorAll(selector, this);
    };
    win.DocumentFragment.prototype.querySelectorAll =
      function (selector) {
        return querySelectorAll(selector, this);
      };
    win.Element.prototype.querySelectorAll = function (selector) {
      return querySelectorAll(selector, this);
    };
  };
  let window;
  let document;
  let box;
  let div;
  const opt = {
    setup: () => {
      const dom =
        new JSDOM('<!doctype html><html><head></head><body></body></html>', {
          runScripts: 'dangerously',
          url: 'http://localhost'
        });
      window = dom.window;
      document = dom.window.document;
      const x = 1000;
      const y = 1000;
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
        } else if (api === 'patched') {
          patch(window);
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
    },
    onError: e => {
      errors.push(e);
    }
  };
  return new Benchmark(opt);
};

const elementClosest = (type, api) => {
  const patch = win => {
    win.Element.prototype.matches = function (selector) {
      return matches(selector, this);
    };
    win.Element.prototype.closest = function (selector) {
      return closest(selector, this);
    };
    win.Document.prototype.querySelector = function (selector) {
      return querySelector(selector, this);
    };
    win.DocumentFragment.prototype.querySelector = function (selector) {
      return querySelector(selector, this);
    };
    win.Element.prototype.querySelector = function (selector) {
      return querySelector(selector, this);
    };
    win.Document.prototype.querySelectorAll = function (selector) {
      return querySelectorAll(selector, this);
    };
    win.DocumentFragment.prototype.querySelectorAll =
      function (selector) {
        return querySelectorAll(selector, this);
      };
    win.Element.prototype.querySelectorAll = function (selector) {
      return querySelectorAll(selector, this);
    };
  };
  let window;
  let document;
  let box;
  let div;
  const opt = {
    setup: () => {
      const dom =
        new JSDOM('<!doctype html><html><head></head><body></body></html>', {
          runScripts: 'dangerously',
          url: 'http://localhost'
        });
      window = dom.window;
      document = dom.window.document;
      const x = 1000;
      const y = 1000;
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
        } else if (api === 'patched') {
          patch(window);
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
    },
    onError: e => {
      errors.push(e);
    }
  };
  return new Benchmark(opt);
};

const refPointQuerySelector = (type, api) => {
  const patch = win => {
    win.Element.prototype.matches = function (selector) {
      return matches(selector, this);
    };
    win.Element.prototype.closest = function (selector) {
      return closest(selector, this);
    };
    win.Document.prototype.querySelector = function (selector) {
      return querySelector(selector, this);
    };
    win.DocumentFragment.prototype.querySelector = function (selector) {
      return querySelector(selector, this);
    };
    win.Element.prototype.querySelector = function (selector) {
      return querySelector(selector, this);
    };
    win.Document.prototype.querySelectorAll = function (selector) {
      return querySelectorAll(selector, this);
    };
    win.DocumentFragment.prototype.querySelectorAll =
      function (selector) {
        return querySelectorAll(selector, this);
      };
    win.Element.prototype.querySelectorAll = function (selector) {
      return querySelectorAll(selector, this);
    };
  };
  let window;
  let document;
  let refPoint;
  const opt = {
    setup: () => {
      const dom =
        new JSDOM('<!doctype html><html><head></head><body></body></html>', {
          runScripts: 'dangerously',
          url: 'http://localhost'
        });
      window = dom.window;
      document = dom.window.document;
      const x = 1000;
      const y = 1000;
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
        } else if (api === 'patched') {
          patch(window);
          refPoint.querySelector(selector);
        } else {
          querySelector(selector, refPoint);
        }
      }
    },
    onError: e => {
      errors.push(e);
    }
  };
  return new Benchmark(opt);
};

const refPointQuerySelectorAll = (type, api) => {
  const patch = win => {
    win.Element.prototype.matches = function (selector) {
      return matches(selector, this);
    };
    win.Element.prototype.closest = function (selector) {
      return closest(selector, this);
    };
    win.Document.prototype.querySelector = function (selector) {
      return querySelector(selector, this);
    };
    win.DocumentFragment.prototype.querySelector = function (selector) {
      return querySelector(selector, this);
    };
    win.Element.prototype.querySelector = function (selector) {
      return querySelector(selector, this);
    };
    win.Document.prototype.querySelectorAll = function (selector) {
      return querySelectorAll(selector, this);
    };
    win.DocumentFragment.prototype.querySelectorAll =
      function (selector) {
        return querySelectorAll(selector, this);
      };
    win.Element.prototype.querySelectorAll = function (selector) {
      return querySelectorAll(selector, this);
    };
  };
  let window;
  let document;
  let refPoint;
  const opt = {
    setup: () => {
      const dom =
        new JSDOM('<!doctype html><html><head></head><body></body></html>', {
          runScripts: 'dangerously',
          url: 'http://localhost'
        });
      window = dom.window;
      document = dom.window.document;
      const x = 1000;
      const y = 1000;
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
        } else if (api === 'patched') {
          patch(window);
          refPoint.querySelectorAll(selector);
        } else {
          querySelectorAll(selector, refPoint);
        }
      }
    },
    onError: e => {
      errors.push(e);
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
}).on('cycle', evt => {
  console.log(`* ${String(evt.target)}`);
}).on('complete', evt => {
  console.log(`errors: ${errors.length}`);
  for (const e of errors) {
    console.error(e);
  }
}).run({
  async: true
});
