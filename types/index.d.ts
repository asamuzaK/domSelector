export function matches(selector: string, node: object, opt?: {
    warn?: boolean;
}): boolean;
export function closest(selector: string, node: object, opt?: {
    warn?: boolean;
}): object | null;
export function querySelector(selector: string, refPoint: object, opt?: {
    warn?: boolean;
}): object | null;
export function querySelectorAll(selector: string, refPoint: object, opt?: {
    sort?: boolean;
    warn?: boolean;
}): Array<object | undefined>;
