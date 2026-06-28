export class Finder extends Evaluator {
    private _processSelectorBranches;
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
    private _determineTraversalStrategy;
    private _processPendingItems;
    private _collectNodes;
    private _matchNodeNext;
    private _hasValidPathPrev;
    private _processComplexBranchAll;
    private _processComplexBranchFirst;
    find: (targetType: string) => Set<object> | object;
    getAST: (selector: string) => object;
    #private;
}
import { Evaluator } from './evaluator.js';
