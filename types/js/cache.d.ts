export class GenerationalCache {
    constructor(max: number);
    max: number;
    current: Map<any, any>;
    old: Map<any, any>;
    get(key: any): any;
    set(key: any, value: any): void;
    has(key: any): boolean;
    delete(key: any): void;
    clear(): void;
}
