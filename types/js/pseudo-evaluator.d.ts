export class PseudoClassEvaluator {
    constructor(finder: object);
    private _collectNthChild;
    private _collectNthOfType;
    private _matchAnPlusB;
    private _matchHasPseudoFunc;
    private _evaluateHasPseudo;
    private _matchLogicalPseudoFunc;
    evaluate(ast: object, node: object, opt?: object): Set<object>;
    #private;
}
