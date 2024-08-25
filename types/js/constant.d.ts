export const AN_PLUS_B: "AnPlusB";
export const COMBINATOR: "Combinator";
export const EMPTY: "__EMPTY__";
export const IDENTIFIER: "Identifier";
export const NOT_SUPPORTED_ERR: "NotSupportedError";
export const NTH: "Nth";
export const RAW: "Raw";
export const SELECTOR: "Selector";
export const SELECTOR_ATTR: "AttributeSelector";
export const SELECTOR_CLASS: "ClassSelector";
export const SELECTOR_ID: "IdSelector";
export const SELECTOR_LIST: "SelectorList";
export const SELECTOR_PSEUDO_CLASS: "PseudoClassSelector";
export const SELECTOR_PSEUDO_ELEMENT: "PseudoElementSelector";
export const SELECTOR_TYPE: "TypeSelector";
export const STRING: "String";
export const SYNTAX_ERR: "SyntaxError";
export const TARGET_ALL: "all";
export const TARGET_FIRST: "first";
export const TARGET_LINEAL: "lineal";
export const TARGET_SELF: "self";
export const U_FFFD: "�";
export const BIT_01: 1;
export const BIT_02: 2;
export const BIT_04: 4;
export const BIT_08: 8;
export const BIT_16: 16;
export const BIT_32: 32;
export const BIT_FFFF: 65535;
export const BIT_HYPHEN: 45;
export const DUO: 2;
export const HEX: 16;
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
export const PSEUDO_CLASSES: "(?:any-)?link|(?:first|last|only)-(?:child|of-type)|checked|empty|indeterminate|root|target|visited";
export const ANB: "[+-]?(?:(?:0|[1-9]\\d*)n?|n)|(?:[+-]?(?:0|[1-9]\\d*))?n\\s*[+-]\\s*(?:0|[1-9]\\d*)";
export const N_TH: "nth-(?:last-)?(?:child|of-type)\\(\\s*(?:even|odd|[+-]?(?:(?:0|[1-9]\\d*)n?|n)|(?:[+-]?(?:0|[1-9]\\d*))?n\\s*[+-]\\s*(?:0|[1-9]\\d*))\\s*\\)";
export const SUB_TYPE: "\\[[^|\\]]+\\]|[#.:][\\w-]+";
export const TAG_TYPE: "\\*|[A-Za-z][\\w-]*";
export const TAG_TYPE_I: "\\*|[A-Z][\\w-]*";
export const COMPOUND: "(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)";
export const COMBO: "\\s?[\\s>~+]\\s?";
export const COMPLEX: "(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*";
export const DESCEND: "\\s?[\\s>]\\s?";
export const NESTED_LOGICAL_A: ":is\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*\\s*\\)";
export const NESTED_LOGICAL_B: ":is\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*)*\\s*\\)";
export const COMPOUND_A: "(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+|:is\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*\\s*\\))+)";
export const COMPOUND_B: "(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+|:is\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*)*\\s*\\))+)";
export const COMPOUND_I: "(?:\\*|[A-Z][\\w-]*|(?:\\*|[A-Z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)";
export const COMPLEX_L: "(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+|:is\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*)*\\s*\\))+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+|:is\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*)*\\s*\\))+))*";
export const KEY_IS_NOT: "(?:is|not)";
export const LOGICAL_COMPLEX: "(?:is|not)\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+|:is\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*)*\\s*\\))+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+|:is\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*)*\\s*\\))+))*(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+|:is\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*)*\\s*\\))+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+|:is\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s?[\\s>~+]\\s?(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*)*\\s*\\))+))*)*\\s*\\)";
export const LOGICAL_COMPOUND: "(?:is|not)\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+|:is\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*\\s*\\))+)(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+|:is\\(\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+)(?:\\s*,\\s*(?:\\*|[A-Za-z][\\w-]*|(?:\\*|[A-Za-z][\\w-]*)?(?:\\[[^|\\]]+\\]|[#.:][\\w-]+)+))*\\s*\\))+))*\\s*\\)";
export const REG_ANCHOR: RegExp;
export const REG_COMPLEX: RegExp;
export const REG_DESCEND: RegExp;
export const REG_DIR: RegExp;
export const REG_FILTER_COMPLEX: RegExp;
export const REG_FILTER_COMPOUND: RegExp;
export const REG_FILTER_SIMPLE: RegExp;
export const REG_FORM: RegExp;
export const REG_FORM_CTRL: RegExp;
export const REG_FORM_VALID: RegExp;
export const REG_HEX: RegExp;
export const REG_INTERACT: RegExp;
export const REG_INVALID_SELECTOR: RegExp;
export const REG_LANG: RegExp;
export const REG_LANG_QUOTED: RegExp;
export const REG_LOGICAL_EMPTY: RegExp;
export const REG_LOGICAL_PSEUDO: RegExp;
export const REG_SHADOW_HOST: RegExp;
export const REG_SHADOW_MODE: RegExp;
export const REG_SHADOW_PSEUDO: RegExp;
export const REG_TAG_NAME: RegExp;
export const REG_TYPE_CHECK: RegExp;
export const REG_TYPE_INPUT: RegExp;
export const REG_TYPE_RANGE: RegExp;
export const REG_TYPE_RESET: RegExp;
export const REG_TYPE_SUBMIT: RegExp;
export const REG_TYPE_TEXT: RegExp;
