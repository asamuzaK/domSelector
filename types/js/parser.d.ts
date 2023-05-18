import { generate } from "css-tree";
export function parseSelector(selector: string): object;
export function preprocess(...args: any[]): string;
export function walkAST(ast?: object): Array<object | undefined>;
export { generate as generateCSS };
