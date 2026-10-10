import { EventHandler } from './event.js';
export declare class Evaluator {
    #private;
    window: Window;
    documentCache: WeakMap<WeakKey, any>;
    check: boolean | undefined;
    noexcept: boolean | undefined;
    warn: boolean | undefined;
    node: Document | DocumentFragment | Element | undefined;
    pseudoElements: any[] | undefined;
    constructor(window: Window);
    get eventHandler(): EventHandler;
    get invalidate(): boolean;
    set invalidate(value: boolean);
    get verifyShadowHost(): boolean;
    setup(selector: string, node: Document | DocumentFragment | Element, opt?: import('../index.js').FindOptions): Evaluator;
    onError(e: Error, opt?: import('../index.js').FindOptions): void;
    destroy(): void;
    clearResults(all?: boolean): void;
    matchSelector(ast: import('css-tree').CssNode, node: Document | DocumentFragment | Element, opt: import('../index.js').FindOptions): boolean;
    matchLeaves(leaves: Array<import('css-tree').CssNode>, node: Element, opt?: import('../index.js').FindOptions): boolean;
    getFilterLeaves(leaves: Array<import('css-tree').CssNode>): Array<object>;
    getUnescapedName(ast: import('css-tree').CssNode): string;
    evaluateShadowHost(ast: import('css-tree').CssNode, node: DocumentFragment): boolean;
    findSelfOrLinealTarget(leaves: Array<import('css-tree').CssNode>, targetType: string, complex: boolean, compound: boolean): object | null;
    matchSelf(leaves: Array<import('css-tree').CssNode>): any[];
    findLineal(leaves: Array<import('css-tree').CssNode>, opt?: {
        complex?: boolean;
    }): any[];
    matchPseudoClassSelector(ast: import('css-tree').CssNode, node: Element, opt: import('../index.js').FindOptions): boolean;
    createTreeWalker(node: Document | DocumentFragment | Element, opt: object): TreeWalker;
    findNodeWalker(leaves: Array<import('css-tree').CssNode>, node: Element, opt: import('./traverser.js').TraversalOptions): Array<Element>;
    processComplexBranchAll(branch: Array<import('./processor.js').ProcessedBranch>, entryNodes: Array<Element>, dir: string): Set<Element>;
    processComplexBranchFirst(branch: Array<import('./processor.js').ProcessedBranch>, entryNodes: Array<Element>, dir: string, targetType: string): Element | null;
    yieldCombinatorMatches(twig: import('./processor.js').ProcessedBranch, node: Element, opt: import('../index.js').FindOptions): Generator<any, void, unknown>;
    private #matchSelectorForElement;
}
