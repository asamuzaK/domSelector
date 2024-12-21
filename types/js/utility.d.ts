export function getType(o: any): string;
export function verifyArray(arr: any[], type: string): any[];
export function resolveContent(node: object): Array<object | boolean>;
export function traverseNode(node: object, walker: object, force?: boolean): object | null;
export function isCustomElement(node: object, opt?: object): boolean;
export function getSlottedTextContent(node: object): string | null;
export function getDirectionality(node: object): string | null;
export function isContentEditable(node: object): boolean;
export function isVisible(node: object): boolean;
export function isFocusVisible(node: object): boolean;
export function isFocusableArea(node: object): boolean;
export function isFocusable(node: object): boolean;
export function getNamespaceURI(ns: string, node: any[]): string | null;
export function isNamespaceDeclared(ns?: string, node?: object): boolean;
export function isPreceding(nodeA: object, nodeB: object): boolean;
export function sortNodes(nodes?: Array<object> | Set<object>): Array<object | undefined>;
export function concatNestedSelectors(selectors: Array<Array<string>>): string;
export function extractNestedSelectors(css: string): Array<Array<string>>;
export function initNwsapi(window: object, document: object): object;
export function filterSelector(selector: string, opt?: object): boolean;
