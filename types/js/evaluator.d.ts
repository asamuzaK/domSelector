export class Evaluator {
    constructor(window: object);
    window: object;
    documentCache: WeakMap<WeakKey, any>;
    onError: (e: Error, opt?: {
        noexcept?: boolean | undefined;
    }) => void;
    setup(selector: string, node: object, opt?: {
        check?: boolean | undefined;
        noexcept?: boolean | undefined;
        warn?: boolean | undefined;
    }): object;
    check: boolean | undefined;
    noexcept: boolean | undefined;
    warn: boolean | undefined;
    matchOpts: {
        warn: boolean;
    } | undefined;
    node: object | undefined;
    pseudoElements: any[] | undefined;
    invalidate: boolean | undefined;
    clearResults(all?: boolean): void;
    matchSelector: (ast: object, node: object, opt: object) => boolean;
    matchLeaves: (leaves: Array<object>, node: object, opt: object) => boolean;
    getFilterLeaves: (leaves: Array<object>) => Array<object>;
    evaluateShadowHost: (ast: object, node: object) => boolean;
    matchPseudoClassSelector: (ast: object, node: object, opt?: {
        forgive?: boolean | undefined;
        warn?: boolean | undefined;
    }) => Set<object> | boolean;
    createTreeWalker: (node: object, opt?: {
        force?: boolean | undefined;
        whatToShow?: number | undefined;
    }) => object;
    yieldCombinatorMatches(twig: object, node: object, opt?: {
        dir?: string | undefined;
    }): Generator<any, void, unknown>;
    private _handleFocusEvent;
    private _handleKeyboardEvent;
    private _handleMouseEvent;
    private _registerEventListeners;
    private _getSelectorBranches;
    private _matchAnPlusB;
    private _hasCombinatorMatch;
    private _matchHasPseudoFunc;
    private _buildHasAllowlist;
    private _evaluateHasPseudo;
    private _matchLogicalPseudoFunc;
    private _evaluateLogicalPseudo;
    private _evaluatePseudoClassFunc;
    private _evaluateHostPseudo;
    private _evaluateHostContextPseudo;
    private _matchSelectorForElement;
    private _matchSelectorForShadowRoot;
    private _traverseAllDescendants;
    private _findDescendantNodes;
    #private;
}
