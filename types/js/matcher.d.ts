export function _matchAttributeSelector(ast: object, node: object): object | null;
export function _matchClassSelector(ast: object, node: object): object | null;
export function _matchIDSelector(ast: object, node: object): object | null;
export function _matchTypeSelector(ast: object, node: object, opt?: {
    forgive?: boolean;
}): object | null;
export function matchSelector(ast: object, node: object, opt: object): object | null;
export function matchPseudoElementSelector(astName: string, opt?: {
    forgive?: boolean;
    warn?: boolean;
}): void;
