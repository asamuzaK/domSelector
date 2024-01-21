export class Finder {
    private _onError;
    private _setup;
    private _correspond;
    _prepareTreeWalkers(): any[];
    private _traverse;
    private _collectNthChild;
    private _collectNthOfType;
    private _matchAnPlusB;
    private _matchDirectionPseudoClass;
    private _matchLanguagePseudoClass;
    private _matchHasPseudoFunc;
    private _matchLogicalPseudoFunc;
    private _matchPseudoClassSelector;
    private _matchShadowHostPseudoClass;
    private _matchSelector;
    private _matchLeaves;
    _matchHTMLCollection(items: object, opt?: object): Set<object>;
    private _findDescendantNodes;
    private _matchCombinator;
    private _findNode;
    private _matchSelf;
    private _findLineal;
    private _findFirst;
    private _findFromHTMLCollection;
    private _findEntryNodes;
    private _getEntryTwig;
    private _collectNodes;
    private _matchNodes;
    private _find;
    matches(selector: string, node: object, opt: object): boolean;
    closest(selector: string, node: object, opt: object): object | null;
    querySelector(selector: string, node: object, opt: object): object | null;
    querySelectorAll(selector: string, node: object, opt: object): Array<object | undefined>;
    #private;
}
