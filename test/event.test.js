/**
 * event.test.js
 */

/* api */
import { strict as assert } from 'node:assert';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';

/* test */
import { EventHandler } from '../src/js/event.js';

describe('EventHandler', () => {
  let window, document;

  beforeEach(() => {
    const dom = new JSDOM();
    window = dom.window;
    document = dom.window.document;
  });

  afterEach(() => {
    window.close();
    window = null;
    document = null;
  });

  describe('initialization', () => {
    it('should be instance of EventHandler', () => {
      const handler = new EventHandler(window);
      assert.strictEqual(handler instanceof EventHandler, true, 'result');
    });

    it('should initialize with null states', () => {
      const handler = new EventHandler(window);
      assert.strictEqual(handler.currentEvent, null, 'currentEvent');
      assert.strictEqual(handler.currentFocus, null, 'currentFocus');
      assert.strictEqual(handler.lastFocusVisible, null, 'lastFocusVisible');
    });

    it('should set and get lastFocusVisible correctly', () => {
      const handler = new EventHandler(window);
      const node = document.createElement('div');
      handler.lastFocusVisible = node;
      assert.strictEqual(handler.lastFocusVisible, node, 'lastFocusVisible');
    });
  });

  describe('direct event handlers', () => {
    it('should update currentFocus on focus events', () => {
      const handler = new EventHandler(window);
      const evt = new window.FocusEvent('focus');
      handler.handleFocusEvent(evt);
      assert.strictEqual(handler.currentFocus, evt, 'currentFocus');
    });

    it('should update currentEvent on mouse events', () => {
      const handler = new EventHandler(window);
      const evt = new window.MouseEvent('mousedown');
      handler.handleMouseEvent(evt);
      assert.strictEqual(handler.currentEvent, evt, 'currentEvent');
    });

    it('should update currentEvent for non-modifier key presses', () => {
      const handler = new EventHandler(window);
      const evt = new window.KeyboardEvent('keydown', { key: 'a' });
      handler.handleKeyboardEvent(evt);
      assert.strictEqual(handler.currentEvent, evt, 'currentEvent');
    });

    it('should retain currentEvent when a modifier key is pressed', () => {
      const handler = new EventHandler(window);
      const evt1 = new window.KeyboardEvent('keydown', { key: 'a' });
      handler.handleKeyboardEvent(evt1);
      const evt2 = new window.KeyboardEvent('keydown', { key: 'Shift' });
      handler.handleKeyboardEvent(evt2);
      assert.strictEqual(
        handler.currentEvent,
        evt1,
        'currentEvent remains unchanged'
      );
    });
  });

  describe('event listener integration', () => {
    it('should capture focus events triggered on window', () => {
      const handler = new EventHandler(window);
      const evt = new window.FocusEvent('focusin');
      window.dispatchEvent(evt);
      assert.strictEqual(handler.currentFocus, evt, 'currentFocus captured');
    });

    it('should capture mouse events triggered on window', () => {
      const handler = new EventHandler(window);
      const evt = new window.MouseEvent('click');
      window.dispatchEvent(evt);
      assert.strictEqual(handler.currentEvent, evt, 'currentEvent captured');
    });

    it('should capture keyboard events triggered on window', () => {
      const handler = new EventHandler(window);
      const evt = new window.KeyboardEvent('keyup', { key: 'Enter' });
      window.dispatchEvent(evt);
      assert.strictEqual(handler.currentEvent, evt, 'currentEvent captured');
    });
  });

  describe('register and destroy', () => {
    it('should register event listeners automatically on construction', () => {
      const stubAdd = sinon.stub(window, 'addEventListener');
      // eslint-disable-next-line no-unused-vars
      const handler = new EventHandler(window);
      const { called } = stubAdd;
      stubAdd.restore();
      assert.strictEqual(called, true, 'addEventListener was called');
    });

    it('should clear state and remove listeners on destroy', () => {
      const handler = new EventHandler(window);
      const spyRemove = sinon.spy(window, 'removeEventListener');
      handler.lastFocusVisible = document.createElement('div');
      window.dispatchEvent(new window.MouseEvent('mousedown'));
      window.dispatchEvent(new window.FocusEvent('focus'));
      assert.notStrictEqual(handler.currentEvent, null, 'event state is set');
      assert.notStrictEqual(handler.currentFocus, null, 'focus state is set');
      assert.notStrictEqual(
        handler.lastFocusVisible,
        null,
        'lastFocusVisible state is set'
      );
      handler.destroy();
      assert.strictEqual(
        spyRemove.called,
        true,
        'removeEventListener was called'
      );
      spyRemove.restore();
      assert.strictEqual(handler.currentEvent, null, 'event state reset');
      assert.strictEqual(handler.currentFocus, null, 'focus state reset');
      assert.strictEqual(
        handler.lastFocusVisible,
        null,
        'lastFocusVisible reset'
      );
      window.dispatchEvent(new window.MouseEvent('click'));
      window.dispatchEvent(new window.FocusEvent('focusin'));
      assert.strictEqual(
        handler.currentEvent,
        null,
        'event state is not updated after destroy'
      );
      assert.strictEqual(
        handler.currentFocus,
        null,
        'focus state is not updated after destroy'
      );
    });
  });
});
