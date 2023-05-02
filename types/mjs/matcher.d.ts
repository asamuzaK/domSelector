export function collectNthChild(node?: object, opt?: {
    a: number;
    b: number;
    reverse?: boolean;
}): Array<object>;
export function collectNthOfType(node?: object, opt?: {
    a: number;
    b: number;
    reverse?: boolean;
}): Array<object>;
export function matchTypeSelector(leaf?: object, node?: object): object | null;
export function matchClassSelector(leaf?: object, node?: object): object | null;
export function matchIdSelector(leaf?: object, node?: object): object | null;
export function matchAttributeSelector(leaf?: object, node?: object): object | null;
export function matchAnPlusB(leafName: string, leaf?: object, node?: object): Array<object | undefined> | null;
export function matchLanguagePseudoClass(leaf?: object, node?: object): object | null;
export function matchPseudoClassSelector(leaf?: object, node?: object, refPoint?: object): object | Array<object | undefined> | null;
export class Matcher {
    constructor(sel: string, refPoint: object);
    selector: string;
    node: any;
    ownerDocument: any;
    _createAst(): object | null;
    _walkAst(ast: object): Array<object>;
    _parseAst(ast: object, node: object): object | null;
    _createIterator(root: object): object;
    _matchCombinator(leaves: Array<object>, node: object): object | null;
    _matchSelectorChild(child: Array<object>, node: object): object | null;
    _matchLogicalCombinationPseudoClass(leaf: object, node: object): object | null;
    _matchRelationalPseudoClass(selectors: object, node: object): object | null;
    _match(ast?: object, node?: object): object | null;
    matches(): object | null;
    closest(): object | null;
    querySelector(): object | null;
    querySelectorAll(): Array<object | undefined>;
}
