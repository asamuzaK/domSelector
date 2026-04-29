/**
 * event-tracker.test.js
 */
import { strict as assert } from 'node:assert';
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { EventTracker } from '../src/js/event-tracker.js';

describe('EventTracker', () => {
  let window;

  beforeEach(() => {
    const dom = new JSDOM('<!doctype html><html><body></body></html>', {
      runScripts: 'dangerously',
      url: 'http://localhost/'
    });
    window = dom.window;
  });

  afterEach(() => {
    window.close();
  });

  /**
   * Tests state access via accessors (getters/setters).
   */
  describe('Getters and Setters', () => {
    it('should access state via getters', () => {
      const tracker = new EventTracker(window);
      assert.strictEqual(tracker.event, null, 'event initial');
      assert.strictEqual(tracker.focus, null, 'focus initial');
      assert.strictEqual(
        tracker.lastFocusVisible,
        null,
        'lastFocusVisible initial'
      );
    });

    it('should update lastFocusVisible via setter', () => {
      const tracker = new EventTracker(window);
      const node = window.document.createElement('div');
      tracker.lastFocusVisible = node;
      assert.strictEqual(
        tracker.lastFocusVisible,
        node,
        'lastFocusVisible updated via setter'
      );
    });
  });

  /**
   * Tests the behavior of internal event handler methods.
   */
  describe('Event Handlers', () => {
    it('should update focus state via _handleFocusEvent', () => {
      const tracker = new EventTracker(window);
      const mockEvent = new window.FocusEvent('focus');
      tracker._handleFocusEvent(mockEvent);
      assert.strictEqual(tracker.focus, mockEvent, 'focus updated');
    });

    it('should update event state via _handleMouseEvent', () => {
      const tracker = new EventTracker(window);
      const mockEvent = new window.MouseEvent('click');
      tracker._handleMouseEvent(mockEvent);
      assert.strictEqual(tracker.event, mockEvent, 'event updated');
    });

    it('should update event state via _handleKeyboardEvent if not a modifier', () => {
      const tracker = new EventTracker(window);
      const mockEvent = new window.KeyboardEvent('keydown', { key: 'a' });
      tracker._handleKeyboardEvent(mockEvent);
      assert.strictEqual(tracker.event, mockEvent, 'event updated');

      const modifierEvent = new window.KeyboardEvent('keydown', {
        key: 'Shift'
      });
      tracker._handleKeyboardEvent(modifierEvent);
      assert.strictEqual(
        tracker.event,
        mockEvent,
        'event not overwritten by modifier'
      );
    });
  });

  /**
   * Tests the listener registration process.
   */
  describe('_registerEventListeners', () => {
    it('should register listeners', () => {
      const tracker = new EventTracker(window);
      const res = tracker._registerEventListeners();
      assert.strictEqual(res.length, 9, 'should register 9 listeners');
    });
  });
});
