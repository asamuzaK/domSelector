export function closest(selector: string, node: object, opt?: {
    warn?: object;
}): object | null;
export function matches(selector: string, node: object, opt?: {
    warn?: object;
}): boolean;
export function querySelector(selector: string, refPoint: object, opt?: {
    warn?: object;
}): object | null;
export function querySelectorAll(selector: string, refPoint: object, opt?: {
    warn?: object;
}): Array<object | undefined>;
