export type MapperResult = {
    ast: Array<import('./processor.js').ProcessedASTNode>;
    invalidate: boolean;
    nodes: Array<Array<Element>>;
    selectorAST: import('css-tree').CssNode;
};
export declare class Mapper {
    #private;
    constructor(context: import('./finder.js').Finder);
    correspond(selector: string): MapperResult;
    private #prepareResult;
}
