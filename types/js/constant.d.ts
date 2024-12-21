export const ATRULE: "Atrule";
export const ATTR_SELECTOR: "AttributeSelector";
export const CLASS_SELECTOR: "ClassSelector";
export const COMBINATOR: "Combinator";
export const IDENT: "Identifier";
export const ID_SELECTOR: "IdSelector";
export const NOT_SUPPORTED_ERR: "NotSupportedError";
export const NTH: "Nth";
export const OPERATOR: "Operator";
export const PS_CLASS_SELECTOR: "PseudoClassSelector";
export const PS_ELEMENT_SELECTOR: "PseudoElementSelector";
export const RULE: "Rule";
export const SCOPE: "Scope";
export const SELECTOR: "Selector";
export const SELECTOR_LIST: "SelectorList";
export const STRING: "String";
export const SYNTAX_ERR: "SyntaxError";
export const TARGET_ALL: "all";
export const TARGET_FIRST: "first";
export const TARGET_LINEAL: "lineal";
export const TARGET_SELF: "self";
export const TYPE_SELECTOR: "TypeSelector";
export const BIT_01: 1;
export const BIT_02: 2;
export const BIT_04: 4;
export const BIT_08: 8;
export const BIT_16: 16;
export const BIT_32: 32;
export const BIT_FFFF: 65535;
export const DUO: 2;
export const HEX: 16;
export const HYPHEN: 45;
export const TYPE_FROM: 8;
export const TYPE_TO: -1;
export const ELEMENT_NODE: 1;
export const TEXT_NODE: 3;
export const DOCUMENT_NODE: 9;
export const DOCUMENT_FRAGMENT_NODE: 11;
export const DOCUMENT_POSITION_PRECEDING: 2;
export const DOCUMENT_POSITION_CONTAINS: 8;
export const DOCUMENT_POSITION_CONTAINED_BY: 16;
export const SHOW_ALL: 4294967295;
export const SHOW_DOCUMENT: 256;
export const SHOW_DOCUMENT_FRAGMENT: 1024;
export const SHOW_ELEMENT: 1;
export const WALKER_FILTER: 1281;
export const ALPHA_NUM: "[A-Z\\d]+";
export const CHILD_IDX: "(?:first|last|only)-(?:child|of-type)";
export const DIGIT: "(?:0|[1-9]\\d*)";
export const LANG_PART: "(?:-[A-Z\\d]+)*";
export const PSEUDO_CLASS: "(?:any-)?link|(?:first|last|only)-(?:child|of-type)|checked|empty|indeterminate|read-(?:only|write)|root|target";
export const ANB: "[+-]?(?:(?:0|[1-9]\\d*)n?|n)|(?:[+-]?(?:0|[1-9]\\d*))?n\\s*[+-]\\s*(?:0|[1-9]\\d*)";
export const N_TH: "nth-(?:last-)?(?:child|of-type)\\(\\s*(?:even|odd|[+-]?(?:(?:0|[1-9]\\d*)n?|n)|(?:[+-]?(?:0|[1-9]\\d*))?n\\s*[+-]\\s*(?:0|[1-9]\\d*))\\s*\\)";
export const SUB_TYPE: "\\[[^|\\]]+\\]|[#.:][\\w-]+";
export const SUB_TYPE_WO_PSEUDO: "\\[[^|\\]]+\\]|[#.][\\w-]+";
export const TAG_ID_CLASS: "(?:[A-Za-z][\\w-]*|[#.][\\w-]+)";
export const TAG_TYPE: "\\*|[A-Za-z][\\w-]*";
export const TAG_TYPE_I: "\\*|[A-Z][\\w-]*";
export const COMPOUND: "(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)";
export const COMPOUND_WO_PSEUDO: "(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.][\\w-]+)+)";
export const COMBO: "\\s?[\\s>~+]\\s?";
export const COMPLEX: "(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*";
export const DESCEND: "\\s?[\\s>]\\s?";
export const NESTED_LOGIC_A: ":is\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*\\s*\\)";
export const NESTED_LOGIC_B: ":is\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*)*\\s*\\)";
export const COMPOUND_A: "(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+|:is\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*\\s*\\))+)";
export const COMPOUND_B: "(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+|:is\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*)*\\s*\\))+)";
export const COMPOUND_I: "(?:\\*|[A-Z][\\w-]*|(?:\\*|[A-Z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)";
export const COMPLEX_L: "(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+|:is\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*)*\\s*\\))+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+|:is\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*)*\\s*\\))+))*";
export const LOGIC_COMPLEX: "(?:is|not)\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+|:is\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*)*\\s*\\))+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+|:is\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*)*\\s*\\))+))*(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+|:is\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*)*\\s*\\))+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+|:is\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*)*\\s*\\))+))*)*\\s*\\)";
export const LOGIC_COMPOUND: "(?:is|not)\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+|:is\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*\\s*\\))+)(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+|:is\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*\\s*\\))+))*\\s*\\)";
export const HAS_COMPOUND: "has\\([\\s>~+]?\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.][\\w-]+)+)\\s*\\)";
export const KEY_FORM_FOCUS: readonly string[];
export const KEY_INPUT_BUTTON: readonly string[];
export const KEY_INPUT_DATE: readonly string[];
export const KEY_INPUT_TEXT: readonly string[];
export const KEY_INPUT_EDIT: readonly string[];
export const KEY_INPUT_LTR: readonly string[];
export const KEY_LOGICAL: readonly string[];
export const KEY_MODIFIER: readonly string[];
export const KEY_PS_STATE: readonly string[];
export const KEY_SHADOW_HOST: readonly string[];
