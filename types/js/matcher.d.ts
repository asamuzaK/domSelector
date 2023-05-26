export class Matcher {
    constructor(selector: string, refPoint: object, opt?: {
        warn?: object;
    });
    _isAttached(): boolean;
    _match(ast: object, node: object): Array<object | undefined>;
    _getMatchedNodes(branch?: Array<object>, node?: object): Array<object | undefined>;
    _find(ast: object, node: object): Array<object | undefined>;
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
}, node?: object): Array<object | undefined>;
export function collectNthOfType(anb?: {
    a: number;
    b: number;
    reverse?: boolean;
}, node?: object): Array<object | undefined>;
export function createSelectorForNode(node?: object): string | null;
export function groupASTLeaves(branch?: Array<object>): Array<object>;
export function isContentEditable(node?: object): boolean;
export function isNamespaceDeclared(ns?: string, node?: object): boolean;
export function matchAnPlusB(nthName: string, ast?: object, node?: object): Array<object | undefined>;
export function matchAttributeSelector(ast?: object, node?: object): object | null;
export function matchClassSelector(ast?: object, node?: object): object | null;
export function matchCombinator(combo?: object, prevNodes?: Array<object>, nextNodes?: Array<object>): Array<object | undefined>;
export function matchDirectionPseudoClass(ast?: object, node?: object): object | null;
export function matchIDSelector(ast?: object, node?: object): object | null;
export function matchLanguagePseudoClass(ast?: object, node?: object): object | null;
export function matchLogicalPseudoFunc(ast?: object, node?: object, refPoint?: object): object | null;
export function matchPseudoClassSelector(ast?: object, node?: object, refPoint?: object): Array<object | undefined>;
export function matchPseudoElementSelector(ast?: object, node?: object): void;
export function matchTypeSelector(ast?: object, node?: object): object | null;
export function unescapeSelector(selector?: string): string | null;
