export { Finder };
export let finder: Finder;
export function matches(selector: string, node: object, opt?: {
    noexcept?: boolean;
    warn?: boolean;
}): boolean;
export function closest(selector: string, node: object, opt?: {
    noexcept?: boolean;
    warn?: boolean;
}): object | null;
export function querySelector(selector: string, node: object, opt?: {
    noexcept?: boolean;
    warn?: boolean;
}): object | null;
export function querySelectorAll(selector: string, node: object, opt?: {
    noexcept?: boolean;
    warn?: boolean;
}): Array<object | undefined>;
import { Finder } from './js/finder.js';
