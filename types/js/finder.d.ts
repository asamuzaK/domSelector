export class Finder {
    constructor(window: object);
    onError(e: Error, opt: object): void;
    setup(selector: string, node: object, opt?: {
        event?: object;
        noexcept?: boolean;
        warn?: boolean;
    }): object;
    private _registerEventListeners;
    private _setEvent;
    private _correspond;
    private _createTreeWalker;
    private _prepareQuerySelectorWalker;
    private _collectNthChild;
    private _collectNthOfType;
    private _matchAnPlusB;
    private _matchHasPseudoFunc;
    private _matchLogicalPseudoFunc;
    private _matchPseudoClassSelector;
    private _matchShadowHostPseudoClass;
    private _matchSelector;
    private _matchLeaves;
    private _matchHTMLCollection;
    private _findDescendantNodes;
    private _matchCombinator;
    private _findNode;
    private _matchSelf;
    private _findLineal;
    private _findFirst;
    private _findFromHTMLCollection;
    private _findEntryNodes;
    private _collectNodes;
    private _getCombinedNodes;
    private _matchNodeNext;
    private _matchNodePrev;
    find(targetType: string): Set<object>;
    #private;
}
