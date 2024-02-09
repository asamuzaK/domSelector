export function unescapeSelector(selector?: string): string | null;
export function preprocess(...args: any[]): string;
export function parseSelector(selector: string): object;
export function walkAST(ast?: object): Array<object | undefined>;
export function sortAST(asts: Array<object>): Array<object>;
export function parseAstName(selector: string): object;
export function filterSelector(selector: string): boolean;
export { generate as generateCSS } from "css-tree";
