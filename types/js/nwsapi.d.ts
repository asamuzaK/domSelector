export declare const concatCall: (nodes: Array<Element> | NodeList, callback?: ((element: Element) => boolean | void) | undefined) => Array<Element>;
export declare const isHTML: (node: Element | Document) => boolean;
export declare const isTarget: (node: Element) => boolean;
export declare const isIndeterminate: (node: Element) => boolean;
export declare const optimize: (selector: string, tokens: Array<string>) => string;
export declare const matchAssert: (factory: Array<(c: Element, f?: ((element: Element) => boolean | void), x?: null, r?: boolean) => boolean>, element: Element, callback?: ((element: Element) => boolean | void) | undefined) => boolean;
export declare const solveNth: (element: Element, dir: boolean | number, state: object, isOfType: boolean) => number;
export declare class Nwsapi {
    #private;
    hasDupes: boolean | undefined;
    constructor(window: object, document: object, cacheSize?: number);
    private _documentOrder;
    private _unique;
    private _byId;
    private _byTag;
    private _byClass;
    private _emit;
    private _switchContext;
    private _compileSelector;
    _compileUniversal(selector: string, source: string): {
        source: string;
        selector: string;
    };
    _compileId(selector: string, source: string): {
        source: string;
        selector: string;
    };
    _compileClass(selector: string, source: string): {
        source: string;
        selector: string;
    };
    _compileTag(selector: string, source: string): {
        source: string;
        selector: string;
    };
    _compileAttribute(selector: string, source: string): {
        source: string;
        selector: string;
    };
    _compileCombinator(symbol: string, selector: string, source: string): {
        source: string;
        selector: string;
    };
    _compilePseudo(selector: string, source: string, selectorString: string): {
        source: string;
        selector: string;
    };
    _compilePseudoStructural(match: Array<string>, source: string): string;
    _compilePseudoTreeStruct(match: Array<string>, source: string, selectorString: string): string;
    _compilePseudoLogical(match: Array<string>, source: string): string;
    _compilePseudoLocation(match: Array<string>, source: string): string;
    _compilePseudoInputState(match: Array<string>, source: string): string;
    _compilePseudoInputValue(match: Array<string>, source: string): string;
    _compile(selector: string, mode: boolean): (c: Element | Element[] | NodeList, f?: ((element: Element) => boolean | void), x?: Element | Document | null, r?: boolean | Element[]) => boolean | Element[];
    _collect(selectors: Array<string>, context: Element | Document, callback?: ((element: Element) => boolean | void) | undefined): object;
    _matchCollect(selectors: Array<string>): object;
    _parseSelector(selectors: string): Array<string>;
    match(selectors: string, element: Element, callback?: ((element: Element) => boolean | void) | undefined): boolean;
    closest(selectors: string, element: Element, callback?: ((element: Element) => boolean | void) | undefined): Element | null;
    select(selectors: string, context: Element | Document, callback?: ((element: Element) => boolean | void) | undefined): Array<Element>;
    first(selectors: string, context: Element | Document, callback?: ((element: Element) => boolean | void) | undefined): Element | null;
}
