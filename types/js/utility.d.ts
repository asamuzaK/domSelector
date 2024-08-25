export function getType(o: any): string;
export function resolveContent(node: object): Array<object>;
export function traverseNode(node: object, walker: object): object | null;
export function isCustomElement(node: object, opt?: object): boolean;
export function isInShadowTree(node: object): boolean;
export function getSlottedTextContent(node: object): string | null;
export function getDirectionality(node: object): string | null;
export function isContentEditable(node: object): boolean;
export function isVisible(node: object): boolean;
export function isFocusVisible(node: object): boolean;
export function isFocusable(node: object): boolean;
export function getNamespaceURI(ns: string, node: any[]): string | null;
export function isNamespaceDeclared(ns?: string, node?: object): boolean;
export function isPreceding(nodeA: object, nodeB: object): boolean;
export function sortNodes(nodes?: Array<object> | Set<object>): Array<object | undefined>;
export function initNwsapi(window: object, document: object): object;
export function filterSelector(selector: string, opt?: object): boolean;
