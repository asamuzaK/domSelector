export class Matcher {
    constructor(selector: string, node: object, opt?: {
        warn?: boolean;
    });
    _onError(e: Error): void;
    _getRoot(node?: object): object;
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
    _matchLogicalPseudoFunc(ast: object, node: object): object | null;
    _matchPseudoClassSelector(ast: object, node: object): object;
    _matchAttributeSelector(ast: object, node: object): object | null;
    _matchClassSelector(ast: object, node: object): object | null;
    _matchIDSelector(ast: object, node: object): object | null;
    _matchPseudoElementSelector(ast: object, node: object): void;
    _matchTypeSelector(ast: object, node: object): object | null;
    _matchSelector(ast: object, node: object): object;
    _matchLeaves(leaves: any[], node: object): boolean;
    _matchTwig(twig: object, node: object, opt?: {
        find?: string;
    }): object;
    _findNodes(twig: object, range: string): object;
    _collectNodes(range: string): any[];
    _matchCombo(combo: object, prevNodes: object, nextNodes: object): object;
    _matchNodes(range: string): object;
    _find(range: string): object;
    _sortNodes(nodes: object): any[];
    matches(): boolean;
    closest(): object | null;
    querySelector(): object | null;
    querySelectorAll(): Array<object | undefined>;
    #private;
}
export function isContentEditable(node?: object): boolean;
export function isDescendant(node?: object, root?: object): boolean;
export function isNamespaceDeclared(ns?: string, node?: object): boolean;
export function parseASTName(name: string, node?: object): object;
export function unescapeSelector(selector?: string): string | null;
