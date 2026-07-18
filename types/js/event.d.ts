export declare class EventHandler {
    #private;
    constructor(window: object);
    get currentEvent(): any;
    get currentFocus(): any;
    get lastFocusVisible(): any;
    set lastFocusVisible(node: any);
    handleFocusEvent: (evt: any) => void;
    handleKeyboardEvent: (evt: any) => void;
    handleMouseEvent: (evt: any) => void;
    registerEventListeners: () => void;
    destroy: () => void;
}
