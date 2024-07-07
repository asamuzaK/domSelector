/**
 * constant.js
 */

/* string */
export const AN_PLUS_B = 'AnPlusB';
export const COMBINATOR = 'Combinator';
export const EMPTY = '__EMPTY__';
export const IDENTIFIER = 'Identifier';
export const NOT_SUPPORTED_ERR = 'NotSupportedError';
export const NTH = 'Nth';
export const RAW = 'Raw';
export const SELECTOR = 'Selector';
export const SELECTOR_ATTR = 'AttributeSelector';
export const SELECTOR_CLASS = 'ClassSelector';
export const SELECTOR_ID = 'IdSelector';
export const SELECTOR_LIST = 'SelectorList';
export const SELECTOR_PSEUDO_CLASS = 'PseudoClassSelector';
export const SELECTOR_PSEUDO_ELEMENT = 'PseudoElementSelector';
export const SELECTOR_TYPE = 'TypeSelector';
export const STRING = 'String';
export const SYNTAX_ERR = 'SyntaxError';
export const U_FFFD = '\uFFFD';

/* numeric */
export const BIT_01 = 1;
export const BIT_02 = 2;
export const BIT_04 = 4;
export const BIT_08 = 8;
export const BIT_16 = 0x10;
export const BIT_32 = 0x20;
export const BIT_FFFF = 0xFFFF;
export const BIT_HYPHEN = 0x2D;
export const DUO = 2;
export const HEX = 16;
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
export const SHOW_ALL = 0xffffffff;
export const SHOW_DOCUMENT = 0x100;
export const SHOW_DOCUMENT_FRAGMENT = 0x400;
export const SHOW_ELEMENT = 1;
export const WALKER_FILTER = 0x501;

/* selectors */
export const ALPHA_NUM = '[A-Z\\d]+';
export const CHILD_IDX = '(?:first|last|only)-(?:child|of-type)';
export const DIGIT = '(?:0|[1-9]\\d*)';
export const LANG_PART = `(?:-${ALPHA_NUM})*`;
export const PSEUDO_CLASSES =
  `(?:any-)?link|${CHILD_IDX}|checked|empty|indeterminate|root|target|visited`;
export const ANB =
  `[+-]?(?:${DIGIT}n?|n)|(?:[+-]?${DIGIT})?n\\s*[+-]\\s*${DIGIT}`;
// N_TH: excludes An+B with selector list, e.g. :nth-child(2n+1 of .foo)
export const N_TH =
  `nth-(?:last-)?(?:child|of-type)\\(\\s*(?:even|odd|${ANB})\\s*\\)`;
// SUB_TYPE: attr, id, class, pseudo-class, note that [foo|=bar] is excluded
export const SUB_TYPE = '\\[[^|\\]]+\\]|[#.:][\\w-]+';
// TAG_TYPE: *, tag
export const TAG_TYPE = '\\*|[A-Za-z][\\w-]*';
export const TAG_TYPE_I = '\\*|[A-Z][\\w-]*';
// LOGICAL_KEY: excludes :has()
export const LOGICAL_KEY = '(?:is|not)';
export const COMPOUND = `(?:${TAG_TYPE}|(?:${TAG_TYPE})?(?:${SUB_TYPE})+)`;
export const COMBO = '\\s?[\\s>~+]\\s?';
export const COMPLEX = `${COMPOUND}(?:${COMBO}${COMPOUND})*`;
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
  `${LOGICAL_KEY}\\(\\s*${COMPLEX_L}(?:\\s*,\\s*${COMPLEX_L})*\\s*\\)`;
export const LOGICAL_COMPOUND =
  `${LOGICAL_KEY}\\(\\s*${COMPOUND_A}(?:\\s*,\\s*${COMPOUND_A})*\\s*\\)`;

/* regexp */
export const REG_ANCHOR = /^a(?:rea)?$/;
export const REG_CHILD_INDEXED = new RegExp(`:(?!${PSEUDO_CLASSES}|${N_TH})`);
export const REG_COMPLEX = new RegExp(`${COMBO}${COMPOUND_I}`, 'i');
export const REG_DIR = /^(?:ltr|rtl)$/;
export const REG_FORM = /^(?:(?:fieldse|inpu|selec)t|button|form|textarea)$/;
export const REG_FORM_CTRL =
  /^(?:button|fieldset|input|optgroup|option|select|textarea)$/;
export const REG_FORM_GROUP = /^(?:fieldset|optgroup|select)$/;
export const REG_FORM_VALID = /^(?:button|form|input|select|textarea)$/;
export const REG_HEX = /^([\da-f]{1,6}\s?)/i;
export const REG_INTERACT = /^(?:details|dialog)$/;
export const REG_INVALID_SELECTOR = /^$|^\s*>|,\s*$/;
export const REG_LANG = new RegExp(`^(?:\\*-)?${ALPHA_NUM}${LANG_PART}$`, 'i');
export const REG_LANG_QUOTED = /(:lang\(\s*("[A-Za-z\d\-*]*")\s*\))/;
export const REG_LOGICAL_COMPLEX =
  new RegExp(`:(?!${PSEUDO_CLASSES}|${N_TH}|${LOGICAL_COMPLEX})`);
export const REG_LOGICAL_COMPOUND =
  new RegExp(`:(?!${PSEUDO_CLASSES}|${N_TH}|${LOGICAL_COMPOUND})`);
export const REG_LOGICAL_EMPTY = /(:(is|where)\(\s*\))/;
export const REG_LOGICAL_KEY = new RegExp(`:${LOGICAL_KEY}\\(`);
export const REG_LOGICAL_PSEUDO = /^(?:has|is|not|where)$/;
export const REG_SHADOW_HOST = /^host(?:-context)?$/;
export const REG_SHADOW_MODE = /^(?:close|open)$/;
export const REG_SHADOW_PSEUDO = /^part|slotted$/;
export const REG_TYPE_CHECK = /^(?:checkbox|radio)$/;
export const REG_TYPE_DATE = /^(?:date(?:time-local)?|month|time|week)$/;
export const REG_TYPE_RANGE =
  /(?:date(?:time-local)?|month|number|range|time|week)$/;
export const REG_TYPE_RESET = /^(?:button|reset)$/;
export const REG_TYPE_SUBMIT = /^(?:image|submit)$/;
export const REG_TYPE_TEXT = /^(?:email|number|password|search|tel|text|url)$/;
