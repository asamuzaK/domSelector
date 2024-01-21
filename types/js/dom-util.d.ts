export function verifyNode(node: any): object;
export function prepareDOMObjects(node: object): Array<object>;
export function isInShadowTree(node?: object): boolean;
export function getSlottedTextContent(node?: object): string | null;
export function getDirectionality(node?: object): string | null;
export function isContentEditable(node?: object): boolean;
export function isNamespaceDeclared(ns?: string, node?: object): boolean;
export function isInclusive(nodeA?: object, nodeB?: object): boolean;
export function isPreceding(nodeA?: object, nodeB?: object): boolean;
export function sortNodes(nodes?: Array<object> | Set<object>): Array<object | undefined>;
