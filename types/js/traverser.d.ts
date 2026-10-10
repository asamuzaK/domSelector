export type TraversalOptions = {
    force?: boolean;
    precede?: boolean;
    boundaryNode?: Element;
    startNode?: Element;
    targetType?: string;
};
export declare class DOMTraverser {
    #private;
    constructor(evaluator: import('./evaluator.js').Evaluator);
    reset(): void;
    createTreeWalker(node: Document | DocumentFragment | Element, opt?: {
        force?: boolean;
        whatToShow?: number;
    }): TreeWalker;
    findNodeWalker(leaves: Array<import('css-tree').CssNode>, node: Element, opt?: TraversalOptions): Array<Element>;
    findPrecede(leaves: Array<import('css-tree').CssNode>, node: Element, opt?: TraversalOptions): Array<Element>;
    traverseAndCollectNodes(walker: TreeWalker, leaves: Array<import('css-tree').CssNode>, opt?: TraversalOptions): Array<Element>;
    processComplexBranchAll(branch: Array<import('./processor.js').ProcessedBranch>, entryNodes: Array<Element>, dir: string): Set<Element>;
    matchComplexBranchNext(node: Element, index: number, currentCombo: import('css-tree').CssNode | null, branch: Array<import('./processor.js').ProcessedBranch>, lastIndex: number, matchedNodes: Set<Element>, dir: string): void;
    processComplexBranchFirst(branch: Array<import('./processor.js').ProcessedBranch>, entryNodes: Array<Element>, dir: string, targetType: string): Element | null;
    processComplexBranchFirstPrev(branch: Array<import('./processor.js').ProcessedBranch>, entryNodes: Array<Element>, targetType: string, lastIndex: number): Element | null;
    matchComplexBranchPrev(node: Element, branch: Array<import('./processor.js').ProcessedBranch>, index: number): boolean;
    processComplexBranchFirstNext(branch: Array<import('./processor.js').ProcessedBranch>, entryNodes: Array<Element>, targetType: string): Element | null;
    matchNodeNext(node: Element, branch: Array<import('./processor.js').ProcessedBranch>, index: number, combo: object): Element | null;
    yieldCombinatorMatches(twig: import('./processor.js').ProcessedBranch, node: Element, opt?: import('../index.js').FindOptions): Generator<any, void, unknown>;
    yieldDescendantMatches(leaves: Array<object>, baseNode: DocumentFragment | Element, opt: import('../index.js').FindOptions): Generator<any, void, unknown>;
    yieldFallbackDescendantMatches(baseNode: DocumentFragment | Element, leaves: Array<object>, opt: import('../index.js').FindOptions): Generator<Node, void, unknown>;
}
