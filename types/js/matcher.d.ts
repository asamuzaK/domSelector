export class Matcher {
    constructor(selector: string, node: object, opt?: {
        sort?: boolean;
        warn?: boolean;
    });
    _onError(e: Error): void;
    _getRoot(node?: object): object;
    _sortLeaves(leaves: object): any[];
    _prepare(selector?: string): any[];
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
    _matchDirectionPseudoClass(ast: object, node: object): object | null;
    _matchLanguagePseudoClass(ast: object, node: object): object | null;
    _matchHasPseudoFunc(leaves: any[], node: object): boolean;
    _matchLogicalPseudoFunc(ast: object, node: object): object | null;
    _matchPseudoClassSelector(ast: object, node: object): object;
    _matchAttributeSelector(ast: object, node: object): object | null;
    _matchClassSelector(ast: object, node: object): object | null;
    _matchIDSelector(ast: object, node: object): object | null;
    _matchPseudoElementSelector(ast: object, node: object): void;
    _matchTypeSelector(ast: object, node: object): object | null;
    _matchSelector(ast: object, node: object): object;
    _matchLeaves(leaves: any[], node: object): boolean;
    _matchCombinator(twig: object, node: object, opt?: {
        find?: string;
    }): object;
    _findNodes(twig: object, targetType: string): object;
    _collectNodes(targetType: string): any[];
    _matchNodes(targetType: string): object;
    _find(targetType: string): object;
    _sortNodes(nodes: object): any[];
    matches(): boolean;
    closest(): object | null;
    querySelector(): object | null;
    querySelectorAll(): Array<object | undefined>;
    #private;
}
