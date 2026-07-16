export class SelectorProcessor {
    constructor(context: import("./finder.js").Finder);
    process(branches: Array<object>, selector: string): object;
    #private;
}
