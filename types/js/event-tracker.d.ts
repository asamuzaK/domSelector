export class EventTracker {
    constructor(window: object);
    get event(): Event | null;
    get focus(): FocusEvent | null;
    set lastFocusVisible(node: Element | null);
    get lastFocusVisible(): Element | null;
    private _handleFocusEvent;
    private _handleKeyboardEvent;
    private _handleMouseEvent;
    private _registerEventListeners;
    #private;
}
