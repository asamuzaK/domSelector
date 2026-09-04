import { EventHandler } from './event.js';
export declare class Evaluator {
    #private;
    window: Window;
    documentCache: WeakMap<WeakKey, any>;
    check: boolean | undefined;
    noexcept: boolean | undefined;
    warn: boolean | undefined;
    matchOpts: {
        warn: boolean;
    } | undefined;
    node: Document | DocumentFragment | Element | undefined;
    pseudoElements: any[] | undefined;
    invalidate: boolean | undefined;
    constructor(window: Window);
    get eventHandler(): EventHandler;
    get verifyShadowHost(): boolean;
    setup(selector: string, node: Document | DocumentFragment | Element, opt?: {
        check?: boolean;
        noexcept?: boolean;
        warn?: boolean;
    }): Evaluator;
    onError(e: Error, opt?: {
        noexcept?: boolean;
    }): void;
    destroy(): void;
    clearResults(all?: boolean): void;
    matchSelector(ast: import('css-tree').CssNode, node: Document | DocumentFragment | Element, opt: object): boolean;
    matchLeaves(leaves: Array<import('css-tree').CssNode>, node: Element, opt: object): boolean;
    getFilterLeaves(leaves: Array<import('css-tree').CssNode>): Array<object>;
    getUnescapedName(ast: import('css-tree').CssNode): string;
    evaluateShadowHost(ast: import('css-tree').CssNode, node: DocumentFragment): boolean;
    matchPseudoClassSelector(ast: import('css-tree').CssNode, node: Element, opt?: {
        forgive?: boolean;
        warn?: boolean;
    }): boolean;
    createTreeWalker(node: Document | DocumentFragment | Element, opt?: {
        force?: boolean;
        whatToShow?: number;
    }): TreeWalker;
    yieldCombinatorMatches(twig: import('./processor.js').ProcessedBranch, node: Element, opt?: {
        dir?: string;
    }): Generator<any, void, unknown>;
    yieldFindDescendantNodes(leaves: Array<import('css-tree').CssNode>, baseNode: DocumentFragment | Element, opt: object): Generator<any, void, unknown>;
    private #matchSelectorForElement;
}
