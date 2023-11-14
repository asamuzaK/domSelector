export class Matcher {
    constructor(selector: string, node: object, opt?: {
        sort?: boolean;
        warn?: boolean;
    });
    _onError(e: Error): void;
    _getRoot(node?: object): object;
    _sortLeaves(leaves: Array<object>): Array<object>;
    _prepare(selector?: string): Array<Array<object | undefined>>;
    _collectNthChild(anb: {
        a: number;
        b: number;
        reverse?: boolean;
        selector?: object;
    }, node: object): object;
    _collectNthOfType(anb: {
        a: number;
        b: number;
        reverse?: boolean;
    }, node: object): object;
    _matchAnPlusB(ast: object, node: object, nthName: string): object;
    _matchPseudoElementSelector(astName: string, opt?: {
        forgive?: boolean;
    }): void;
    _matchDirectionPseudoClass(ast: object, node: object): object | null;
    _matchLanguagePseudoClass(ast: object, node: object): object | null;
    _matchHasPseudoFunc(leaves: Array<object>, node: object): boolean;
    _matchLogicalPseudoFunc(astData: object, node: object): object | null;
    _matchPseudoClassSelector(ast: object, node: object, opt?: {
        forgive?: boolean;
    }): object;
    _matchAttributeSelector(ast: object, node: object): object | null;
    _matchClassSelector(ast: object, node: object): object | null;
    _matchIDSelector(ast: object, node: object): object | null;
    _matchTypeSelector(ast: object, node: object): object | null;
    _matchSelector(ast: object, node: object, opt?: object): object;
    _matchLeaves(leaves: Array<object>, node: object, opt?: object): boolean;
    _findDescendantNodes(leaves: Array<object>, baseNode: object): object;
    _matchCombinator(twig: object, node: object, opt?: {
        find?: string;
        forgive?: boolean;
    }): object;
    _findNodes(twig: object, targetType: string): object;
    _getFirstTwig(branch: Array<object>): object;
    _collectNodes(targetType: string): Array<Array<object | undefined>>;
    _sortNodes(nodes: object): Array<object | undefined>;
    _matchNodes(targetType: string): object;
    _find(targetType: string): object;
    matches(): boolean;
    closest(): object | null;
    querySelector(): object | null;
    querySelectorAll(): Array<object | undefined>;
    #private;
}
