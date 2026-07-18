export declare const matchPseudoElementSelector: (astName: string, astType: string, { forgive, globalObject, warn }?: {
    forgive?: boolean;
    globalObject?: object;
    warn?: boolean;
}) => void;
export declare const matchDirectionPseudoClass: (ast: object, node: object, dirCache?: WeakMap<any, any>) => boolean;
export declare const matchLanguagePseudoClass: (ast: object, node: object, langCache?: WeakMap<any, any>) => boolean;
export declare const matchDisabledPseudoClass: (astName: string, node: object) => boolean;
export declare const matchReadOnlyPseudoClass: (astName: string, node: object) => boolean;
export declare const matchAttributeSelector: (ast: object, node: object, { check, forgive, globalObject }?: {
    check?: boolean;
    forgive?: boolean;
    globalObject?: object;
}) => boolean;
export declare const matchTypeSelector: (ast: object, node: object, { check, forgive, globalObject }?: {
    check?: boolean;
    forgive?: boolean;
    globalObject?: object;
}) => boolean;
