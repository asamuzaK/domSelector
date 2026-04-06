export class GenerationalCache {
    constructor(max: any);
    max: number;
    current: Map<any, any>;
    old: Map<any, any>;
    get(key: any): any;
    set(key: any, value: any): void;
    has(key: any): boolean;
    delete(key: any): void;
    clear(): void;
}
export class DOMSelector {
    constructor(window: Window, document: Document, opt?: object);
    clear: () => void;
    check: (selector: string, node: Element, opt?: object) => CheckResult;
    matches: (selector: string, node: Element, opt?: object) => boolean;
    closest: (selector: string, node: Element, opt?: object) => Element | null;
    querySelector: (selector: string, node: Document | DocumentFragment | Element, opt?: object) => Element | null;
    querySelectorAll: (selector: string, node: Document | DocumentFragment | Element, opt?: object) => Array<Element>;
    #private;
}
export type CheckResult = {
    match: boolean;
    pseudoElement: string | null;
    ast: object | null;
};
