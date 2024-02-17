export class Matcher {
    matchPseudoElementSelector(astName: string, opt?: {
        forgive?: boolean;
        warn?: boolean;
    }): void;
    private _matchAttributeSelector;
    private _matchTypeSelector;
    private _matchDirectionPseudoClass;
    private _matchLanguagePseudoClass;
    matchSelector(ast: object, node: object, opt: object): object | null;
}
declare const _default: Matcher;
export default _default;
