export class Matcher {
    constructor(selector: string, node: object, opt?: {
        warn?: boolean;
    });
    _onError(e: Error): void;
    _getRoot(node?: object): object;
    _prepare(selector?: string): any[];
    _matchSelector(ast: object, node: object): object;
    _matchLeaves(leaves: object, node: object): boolean;
    _findNodes(twig: object, range: string): object;
    _collectNodes(range: string): any[];
    _matchNodes(range: string): object;
    _find(range: string): object;
    _sortNodes(nodes: object): any[];
    matches(): boolean;
    closest(): object | null;
    querySelector(): object | null;
    querySelectorAll(): Array<object | undefined>;
    #private;
}
export function collectNthChild(anb?: {
    a: number;
    b: number;
    reverse?: boolean;
    selector?: string;
}, node?: object): object;
export function collectNthOfType(anb?: {
    a: number;
    b: number;
    reverse?: boolean;
}, node?: object): object;
export function createSelectorForNode(node?: object): string | null;
export function isContentEditable(node?: object): boolean;
export function isDescendant(node?: object, root?: object): boolean;
export function isNamespaceDeclared(ns?: string, node?: object): boolean;
export function matchAnPlusB(nthName: string, ast?: object, node?: object): object;
export function matchAttributeSelector(ast?: object, node?: object): object | null;
export function matchClassSelector(ast?: object, node?: object): object | null;
export function matchCombinator(combo?: object, prevNodes?: object, nextNodes?: object, opt?: {
    filter?: string;
}): object;
export function matchDirectionPseudoClass(ast?: object, node?: object): object | null;
export function matchIDSelector(ast?: object, node?: object): object | null;
export function matchLanguagePseudoClass(ast?: object, node?: object): object | null;
export function matchLogicalPseudoFunc(ast?: object, node?: object, refPoint?: object): object | null;
export function matchPseudoClassSelector(ast?: object, node?: object, refPoint?: object): object;
export function matchPseudoElementSelector(ast?: object, node?: object): void;
export function matchTypeSelector(ast?: object, node?: object): object | null;
export function parseASTName(name: string, node?: object): object;
export function unescapeSelector(selector?: string): string | null;
