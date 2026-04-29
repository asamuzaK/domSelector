export function matchPseudoElementSelector(astName: string, astType: string, { forgive, globalObject, warn }?: {
    forgive?: boolean | undefined;
    globalObject?: object | undefined;
    warn?: boolean | undefined;
}): void;
export function matchDirectionPseudoClass(ast: object, node: object): boolean;
export function matchLanguagePseudoClass(ast: object, node: object): boolean;
export function matchDisabledPseudoClass(astName: string, node: object): boolean;
export function matchReadOnlyPseudoClass(astName: string, node: object): boolean;
export function matchAttributeSelector(ast: object, node: object, { check, forgive, globalObject }?: {
    check?: boolean | undefined;
    forgive?: boolean | undefined;
    globalObject?: object | undefined;
}): boolean;
export function matchTypeSelector(ast: object, node: object, { check, forgive, globalObject }?: {
    check?: boolean | undefined;
    forgive?: boolean | undefined;
    globalObject?: object | undefined;
}): boolean;
