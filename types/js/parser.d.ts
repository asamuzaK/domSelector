export function unescapeSelector(selector?: string): string;
export function preprocess(value: string): string;
export function parseSelector(sel: string): object;
export function walkAST(ast?: object, toObject?: boolean, callback?: (arg0: object) => void): {
    branches: Array<object>;
    info: object;
};
export function compareASTNodes(a: object, b: object): number;
export function sortAST(asts: Array<object>): Array<object>;
export function parseAstName(selector: string): {
    prefix: string;
    localName: string;
};
export function extractSubjectsAst(ast: object): Array<{
    id: string | null;
    className: string | null;
    tag: string | null;
}>;
export { find as findAST, generate as generateCSS } from "css-tree";
