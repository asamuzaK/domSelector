/**
 * event.js
 */

/* constants */
const KEYS_MODIFIER = new Set([
  'Alt',
  'AltGraph',
  'CapsLock',
  'Control',
  'Fn',
  'FnLock',
  'Hyper',
  'Meta',
  'NumLock',
  'ScrollLock',
  'Shift',
  'Super',
  'Symbol',
  'SymbolLock'
]);

/**
 * EventHandler
 */
export class EventHandler {
  /* private fields */
  #window;
  #event;
  #eventHandlers;
  #fucusEvent;
  #lastFocusVisible;
  #cleanupFunctions;

  /**
   * constructor
   * @param {object} window - The window object.
   */
  constructor(window) {
    this.#window = window;
    this.#event = null;
    this.#fucusEvent = null;
    this.#lastFocusVisible = null;
    this.#eventHandlers = [
      {
        keys: ['focus', 'focusin'],
        handler: this.handleFocusEvent
      },
      {
        keys: ['keydown', 'keyup'],
        handler: this.handleKeyboardEvent
      },
      {
        keys: ['mouseover', 'mousedown', 'mouseup', 'click', 'mouseout'],
        handler: this.handleMouseEvent
      }
    ];
    this.registerEventListeners();
  }

  get currentEvent() {
    return this.#event;
  }

  get currentFocus() {
    return this.#fucusEvent;
  }

  get lastFocusVisible() {
    return this.#lastFocusVisible;
  }

  set lastFocusVisible(node) {
    this.#lastFocusVisible = node;
  }

  handleFocusEvent = evt => {
    this.#fucusEvent = evt;
  };

  handleKeyboardEvent = evt => {
    const { key } = evt;
    if (!KEYS_MODIFIER.has(key)) {
      this.#event = evt;
    }
  };

  handleMouseEvent = evt => {
    this.#event = evt;
  };

  registerEventListeners = () => {
    if (!this.#cleanupFunctions) {
      this.#cleanupFunctions = [];
    }
    for (const { keys, handler } of this.#eventHandlers) {
      for (const key of keys) {
        this.#window.addEventListener(key, handler, {
          capture: true,
          passive: true
        });
        this.#cleanupFunctions.push(() => {
          this.#window.removeEventListener(key, handler, { capture: true });
        });
      }
    }
  };

  destroy = () => {
    if (this.#cleanupFunctions) {
      for (const cleanup of this.#cleanupFunctions) {
        cleanup();
      }
    }
    this.#cleanupFunctions = null;
    this.#event = null;
    this.#fucusEvent = null;
    this.#lastFocusVisible = null;
  };
}
