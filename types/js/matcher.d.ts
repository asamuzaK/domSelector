export class Matcher {
    constructor(selector: string, refPoint: object);
    _createIterator(ast?: object, root?: object): object;
    _parseAst(ast: object, node: object): Array<object | undefined>;
    _matchAdjacentLeaves(leaves: Array<object>, node: object): object | null;
    _matchCombinator(leaves: Array<object>, prevNode: object): Array<object | undefined>;
    _matchArgumentLeaf(leaf: object, node: object): Array<object | undefined>;
    _matchLogicalPseudoFunc(leaf: object, node: object): object | null;
    _matchSelector(children: Array<object>, node: object): Array<object | undefined>;
    _match(ast?: object, node?: object): Array<object | undefined>;
    matches(): boolean;
    closest(): object | null;
    querySelector(): object | null;
    querySelectorAll(): Array<object | undefined>;
    #private;
}
export function collectNthChild(node?: object, opt?: {
    a: number;
    b: number;
    reverse?: boolean;
}): Array<object | undefined>;
export function collectNthOfType(node?: object, opt?: {
    a: number;
    b: number;
    reverse?: boolean;
}): Array<object | undefined>;
export function matchAnPlusB(leafName: string, leaf?: object, node?: object): Array<object | undefined>;
export function matchAttributeSelector(leaf?: object, node?: object): object | null;
export function matchClassSelector(leaf?: object, node?: object): object | null;
export function matchIdSelector(leaf?: object, node?: object): object | null;
export function matchLanguagePseudoClass(leaf?: object, node?: object): object | null;
export function matchPseudoClassSelector(leaf?: object, node?: object, refPoint?: object): Array<object | undefined>;
export function matchTypeSelector(leaf?: object, node?: object): object | null;
