export function findNestedHas(leaf: object): object | null;
export function findLogicalWithNestedHas(leaf: object): object | null;
export function validateHasNesting(astChildren: Array<object>): boolean;
export function createHasValidator(globalObj: object): (arg0: object) => void;
export function isInvalidCombinator(type: string, prevType: string | null, isLast: boolean): boolean;
export function isSupportedAST(ast: object): boolean;
export function extractSubjectsRegExp(selector: string, caseSensitive: boolean): Array<{
    id: string | null;
    className: string | null;
    tag: string | null;
}>;
export function filterSelector(selector: string, target: string): boolean;
