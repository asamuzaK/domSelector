/**
 * constant.js
 */

/* string */
export const ATTR_SELECTOR = 'AttributeSelector';
export const CLASS_SELECTOR = 'ClassSelector';
export const COMBINATOR = 'Combinator';
export const IDENT = 'Identifier';
export const ID_SELECTOR = 'IdSelector';
export const NOT_SUPPORTED_ERR = 'NotSupportedError';
export const NTH = 'Nth';
export const OPERATOR = 'Operator';
export const PS_CLASS_SELECTOR = 'PseudoClassSelector';
export const PS_ELEMENT_SELECTOR = 'PseudoElementSelector';
export const SELECTOR = 'Selector';
export const STRING = 'String';
export const SYNTAX_ERR = 'SyntaxError';
export const TARGET_ALL = 'all';
export const TARGET_FIRST = 'first';
export const TARGET_LINEAL = 'lineal';
export const TARGET_SELF = 'self';
export const TYPE_SELECTOR = 'TypeSelector';

/* numeric */
export const BIT_01 = 1;
export const BIT_02 = 2;
export const BIT_04 = 4;
export const BIT_08 = 8;
export const BIT_16 = 0x10;
export const BIT_32 = 0x20;
export const BIT_FFFF = 0xFFFF;
export const DUO = 2;
export const HEX = 16;
export const HYPHEN = 0x2D;
export const TYPE_FROM = 8;
export const TYPE_TO = -1;

/* Node */
export const ELEMENT_NODE = 1;
export const TEXT_NODE = 3;
export const DOCUMENT_NODE = 9;
export const DOCUMENT_FRAGMENT_NODE = 11;
export const DOCUMENT_POSITION_PRECEDING = 2;
export const DOCUMENT_POSITION_CONTAINS = 8;
export const DOCUMENT_POSITION_CONTAINED_BY = 0x10;

/* NodeFilter */
export const SHOW_ALL = 0xFFFFFFFF;
export const SHOW_DOCUMENT = 0x100;
export const SHOW_DOCUMENT_FRAGMENT = 0x400;
export const SHOW_ELEMENT = 1;
export const WALKER_FILTER = 0x501;

/* selectors */
export const ALPHA_NUM = '[A-Z\\d]+';
export const CHILD_IDX = '(?:first|last|only)-(?:child|of-type)';
export const DIGIT = '(?:0|[1-9]\\d*)';
export const LANG_PART = `(?:-${ALPHA_NUM})*`;
export const PSEUDO_CLASS = `(?:any-)?link|${CHILD_IDX}|checked|empty|indeterminate|read-(?:only|write)|root|target`;
export const ANB =
  `[+-]?(?:${DIGIT}n?|n)|(?:[+-]?${DIGIT})?n\\s*[+-]\\s*${DIGIT}`;
// N_TH: excludes An+B with selector list, e.g. :nth-child(2n+1 of .foo)
export const N_TH =
  `nth-(?:last-)?(?:child|of-type)\\(\\s*(?:even|odd|${ANB})\\s*\\)`;
// SUB_TYPE: attr, id, class, pseudo-class, note that [foo|=bar] is excluded
export const SUB_TYPE = '\\[[^|\\]]+\\]|[#.:][\\w-]+';
// TAG_TYPE: *, tag
export const TAG_ID_CLASS = '(?:[A-Za-z][\\w-]*|[#.][\\w-]+)';
export const TAG_TYPE = '\\*|[A-Za-z][\\w-]*';
export const TAG_TYPE_I = '\\*|[A-Z][\\w-]*';
export const COMPOUND = `(?:${TAG_TYPE}|(?:${TAG_TYPE})?(?:${SUB_TYPE})+)`;
export const COMBO = '\\s?[\\s>~+]\\s?';
export const COMPLEX = `${COMPOUND}(?:${COMBO}${COMPOUND})*`;
export const DESCEND = '\\s?[\\s>]\\s?';
export const NESTED_LOGICAL_A =
  `:is\\(\\s*${COMPOUND}(?:\\s*,\\s*${COMPOUND})*\\s*\\)`;
export const NESTED_LOGICAL_B =
  `:is\\(\\s*${COMPLEX}(?:\\s*,\\s*${COMPLEX})*\\s*\\)`;
export const COMPOUND_A =
  `(?:${TAG_TYPE}|(?:${TAG_TYPE})?(?:${SUB_TYPE}|${NESTED_LOGICAL_A})+)`;
export const COMPOUND_B =
  `(?:${TAG_TYPE}|(?:${TAG_TYPE})?(?:${SUB_TYPE}|${NESTED_LOGICAL_B})+)`;
export const COMPOUND_I =
  `(?:${TAG_TYPE_I}|(?:${TAG_TYPE_I})?(?:${SUB_TYPE})+)`;
export const COMPLEX_L = `${COMPOUND_B}(?:${COMBO}${COMPOUND_B})*`;
export const LOGICAL_COMPLEX =
  `(?:is|not)\\(\\s*${COMPLEX_L}(?:\\s*,\\s*${COMPLEX_L})*\\s*\\)`;
export const LOGICAL_COMPOUND =
  `(?:is|not)\\(\\s*${COMPOUND_A}(?:\\s*,\\s*${COMPOUND_A})*\\s*\\)`;

/* array */
export const KEY_FORM_FOCUS =
  Object.freeze(['button', 'input', 'select', 'textarea']);
export const KEY_INPUT_BUTTON = Object.freeze(['button', 'reset', 'submit']);
export const KEY_INPUT_DATE =
  Object.freeze(['date', 'datetime-local', 'month', 'time', 'week']);
export const KEY_INPUT_TEXT =
  Object.freeze(['email', 'password', 'search', 'tel', 'text', 'url']);
export const KEY_INPUT_EDIT =
  Object.freeze([...KEY_INPUT_DATE, ...KEY_INPUT_TEXT, 'number']);
export const KEY_INPUT_LTR = Object.freeze([
  'checkbox', 'color', 'date', 'image', 'number', 'range', 'radio', 'time'
]);
export const KEY_LOGICAL = Object.freeze(['has', 'is', 'not', 'where']);
export const KEY_MODIFIER = Object.freeze([
  'Alt', 'AltGraph', 'CapsLock', 'Control', 'Fn', 'FnLock', 'Hyper', 'Meta',
  'NumLock', 'ScrollLock', 'Shift', 'Super', 'Symbol', 'SymbolLock'
]);
export const KEY_SHADOW_HOST = Object.freeze(['host', 'host-context']);
