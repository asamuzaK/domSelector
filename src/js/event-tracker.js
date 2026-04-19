/**
 * event-tracker.js
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
 * A class to track and manage browser events for the Finder.
 */
export class EventTracker {
  /** @type {object} */
  #window;
  /** @type {Event|null} */
  #event = null;
  /** @type {FocusEvent|null} */
  #focus = null;
  /** @type {Element|null} */
  #lastFocusVisible = null;
  /** @type {Set<object>} */
  #eventHandlers;

  /**
   * Creates an instance of EventTracker.
   * @param {object} window - The browser window object.
   */
  constructor(window) {
    this.#window = window;
    this.#eventHandlers = new Set([
      { keys: ['focus', 'focusin'], handler: this._handleFocusEvent },
      { keys: ['keydown', 'keyup'], handler: this._handleKeyboardEvent },
      {
        keys: ['mouseover', 'mousedown', 'mouseup', 'click', 'mouseout'],
        handler: this._handleMouseEvent
      }
    ]);
    this._registerEventListeners();
  }

  /**
   * Gets the last significant UI event.
   * @returns {Event|null} The last event.
   */
  get event() {
    return this.#event;
  }

  /**
   * Gets the last focus event.
   * @returns {FocusEvent|null} The last focus event.
   */
  get focus() {
    return this.#focus;
  }

  /**
   * Gets the last element that had a focus-visible state.
   * @returns {Element|null} The last focus-visible element.
   */
  get lastFocusVisible() {
    return this.#lastFocusVisible;
  }

  /**
   * Sets the last element that had a focus-visible state.
   * @param {Element|null} node - The element to set.
   */
  set lastFocusVisible(node) {
    this.#lastFocusVisible = node;
  }

  /**
   * Handles focus events.
   * @private
   * @param {FocusEvent} evt - The focus event.
   */
  _handleFocusEvent = evt => {
    this.#focus = evt;
  };

  /**
   * Handles keyboard events. Modifier keys are ignored.
   * @private
   * @param {KeyboardEvent} evt - The keyboard event.
   */
  _handleKeyboardEvent = evt => {
    const { key } = evt;
    if (!KEYS_MODIFIER.has(key)) {
      this.#event = evt;
    }
  };

  /**
   * Handles mouse events.
   * @private
   * @param {MouseEvent} evt - The mouse event.
   */
  _handleMouseEvent = evt => {
    this.#event = evt;
  };

  /**
   * Registers event listeners to the window object.
   * @private
   * @returns {Array<void>} An array of return values from addEventListener.
   */
  _registerEventListeners = () => {
    const func = [];
    for (const { keys, handler } of this.#eventHandlers) {
      for (const key of keys) {
        func.push(
          this.#window.addEventListener(key, handler, {
            capture: true,
            passive: true
          })
        );
      }
    }
    return func;
  };
}
