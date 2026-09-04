import { Evaluator } from './evaluator.js';
export declare class Finder extends Evaluator {
    #private;
    setup(selector: string, node: Document | DocumentFragment | Element, opt?: {
        check?: boolean;
        noexcept?: boolean;
        warn?: boolean;
    }): Finder;
    find(targetType: string): Set<Element> | import('../index.js').CheckResult;
    private #collectNodes;
    private #findEntryNodes;
    private #findEntryNodesForPseudoElement;
    private #findEntryNodesForId;
    private #findEntryNodesForClass;
    private #findEntryNodesForType;
    private #findEntryNodesForOther;
    private #processPendingItems;
    private #processComplexBranchAll;
    private #dfsComplexBranchNext;
    private #processComplexBranchFirst;
    private #processComplexBranchFirstNext;
    private #matchNodeNext;
    private #processComplexBranchFirstPrev;
    private #hasValidPathPrev;
    private #checkSelfOrLinealTarget;
    private #matchSelf;
    private #findLineal;
    private #filterAndFormatCollection;
    private #fallbackToWalkerResult;
    private #findNodeWalker;
    private #findPrecede;
    private #traverseAndCollectNodes;
}
