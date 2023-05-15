export function closest(selector: string, node: object, opt?: {
    globalObject?: object;
    jsdom?: boolean;
}): object | null;
export function matches(selector: string, node: object, opt?: {
    globalObject?: object;
    jsdom?: boolean;
}): boolean;
export function querySelector(selector: string, refPoint: object, opt?: {
    globalObject?: object;
    jsdom?: boolean;
}): object | null;
export function querySelectorAll(selector: string, refPoint: object, opt?: {
    globalObject?: object;
    jsdom?: boolean;
}): Array<object | undefined>;
