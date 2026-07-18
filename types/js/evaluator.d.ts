export declare class Evaluator {
    #private;
    window: object;
    documentCache: WeakMap<WeakKey, any>;
    check: boolean | undefined;
    noexcept: boolean | undefined;
    warn: boolean | undefined;
    matchOpts: {
        warn: boolean;
    } | undefined;
    node: object | undefined;
    pseudoElements: any[] | undefined;
    invalidate: boolean | undefined;
    constructor(window: object);
    setup(selector: string, node: object, opt?: {
        check?: boolean;
        noexcept?: boolean;
        warn?: boolean;
    }): object;
    onError: (e: Error, opt?: {
        noexcept?: boolean;
    }) => void;
    clearResults: (all?: boolean) => void;
    matchSelector: (ast: object, node: object, opt: object) => boolean;
    matchLeaves: (leaves: Array<object>, node: object, opt: object) => boolean;
    getFilterLeaves: (leaves: Array<object>) => Array<object>;
    evaluateShadowHost: (ast: object, node: object) => boolean;
    matchPseudoClassSelector: (ast: object, node: object, opt?: {
        forgive?: boolean;
        warn?: boolean;
    }) => Set<object> | boolean;
    private _matchDefaultPseudoClass;
    private _matchDisabledPseudoClass;
    private _matchIndeterminatePseudoClass;
    private _matchValidityPseudoClass;
    private _matchLocalLinkPseudoClass;
    private _matchTargetPseudoClass;
    private _matchEmptyPseudoClass;
    private _matchHoverPseudoClass;
    private _matchActivePseudoClass;
    private _matchFocusPseudoClass;
    private _matchFocusVisiblePseudoClass;
    private _matchFocusWithinPseudoClass;
    createTreeWalker: (node: object, opt?: {
        force?: boolean;
        whatToShow?: number;
    }) => object;
    yieldCombinatorMatches(twig: object, node: object, opt?: {
        dir?: string;
    }): Generator<any, void, unknown>;
    yieldTraverseAllDescendants(baseNode: object, leaves: Array<object>, opt: object): Generator<any, void, unknown>;
    yieldFindDescendantNodes(leaves: Array<object>, baseNode: object, opt: object): Generator<any, void, unknown>;
    private _getSelectorBranches;
    private _filterNthChildOfSelectorBranches;
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
}
