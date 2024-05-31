export function unescapeSelector(selector?: string): string | null;
export function preprocess(...args: any[]): string;
export function parseSelector(selector: string): object;
export function walkAST(ast?: object): object;
export function sortAST(asts: Array<object>): Array<object>;
export function parseAstName(selector: string): object;
export function filterSelector(selector: string, opt?: object): boolean;
export { generate as generateCSS } from "css-tree";
