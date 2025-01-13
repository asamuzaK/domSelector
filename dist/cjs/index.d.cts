declare class DOMSelector {
    constructor(window: object, document: object);
    matches(selector: string, node: object, opt: object): boolean;
    closest(selector: string, node: object, opt: object): object | null;
    querySelector(selector: string, node: object, opt: object): object | null;
    querySelectorAll(selector: string, node: object, opt: object): Array<object | undefined>;
    #private;
}

export { DOMSelector };
