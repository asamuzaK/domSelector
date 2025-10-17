declare class DOMSelector {
    constructor(window: Window, document: Document, opt?: object);
    clear: () => void;
    check: (selector: string, node: Element, opt?: object) => CheckResult;
    matches: (selector: string, node: Element, opt?: object) => boolean;
    closest: (selector: string, node: Element, opt?: object) => Element | null;
    querySelector: (selector: string, node: Document | DocumentFragment | Element, opt?: object) => Element | null;
    querySelectorAll: (selector: string, node: Document | DocumentFragment | Element, opt?: object) => Array<Element>;
    #private;
}
type CheckResult = {
    match: boolean;
    pseudoElement: string | null;
};

export { type CheckResult, DOMSelector };
