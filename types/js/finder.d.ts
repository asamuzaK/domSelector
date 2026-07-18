import { Evaluator } from './evaluator.js';
export declare class Finder extends Evaluator {
    #private;
    setup(selector: string, node: object, opt?: {
        check?: boolean;
        noexcept?: boolean;
        warn?: boolean;
    }): object;
    find: (targetType: string) => Set<object> | object;
    private _correspond;
    private _traverseAndCollectNodes;
    private _findPrecede;
    private _findNodeWalker;
    private _matchSelf;
    private _findLineal;
    private _findEntryNodesForPseudoElement;
    private _findEntryNodesForId;
    private _findEntryNodesForClass;
    private _findEntryNodesForType;
    private _findEntryNodesForOther;
    private _findEntryNodes;
    private _processPendingItems;
    private _collectNodes;
    private _matchNodeNext;
    private _hasValidPathPrev;
    private _processComplexBranchAll;
    private _processComplexBranchFirst;
}
