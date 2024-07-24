export class DOMSelector extends Finder {
    matches(selector: string, node: object, opt: object): boolean;
    closest(selector: string, node: object, opt: object): object | null;
    querySelector(selector: string, node: object, opt: object): object | null;
    querySelectorAll(selector: string, node: object, opt: object): Array<object | undefined>;
    #private;
}
import { Finder } from './js/finder.js';
