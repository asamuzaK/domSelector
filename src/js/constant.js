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
export const LANG_PART = `(?:-${ALPHA_NUM})*`;
export const N_ST = '(?:first|last|only)-(?:child|of-type)';
export const DIGIT = '(?:0|[1-9]\\d*)';
export const ANB =
  `[+-]?(?:${DIGIT}n?|n)|(?:[+-]?${DIGIT})?n\\s*[+-]\\s*${DIGIT}`;
// excludes An+B with selector list, e.g. :nth-child(2n+1 of .foo)
export const N_TH =
  `nth-(?:last-)?(?:child|of-type)\\(\\s*(?:even|odd|${ANB})\\s*\\)`;
// excludes :has()
export const LOGICAL_KEY = '(?:is|not|where)';
// attr, id, class, pseudo-class
export const SUB_TYPE = '\\[[^\\]]+\\]|[#.:][\\w-]+';
// *, tag
export const TAG_TYPE = '\\*|[A-Za-z][\\w-]*';
export const COMPOUND_A = `(?:${TAG_TYPE}|(?:${TAG_TYPE})?(?:${SUB_TYPE})+)`;
export const NESTED_LOGICAL_A =
  `:${LOGICAL_KEY}\\(\\s*${COMPOUND_A}(?:\\s*,\\s*${COMPOUND_A})*\\s*\\)`;
export const COMPOUND_B =
  `(?:${TAG_TYPE}|(?:${TAG_TYPE})?(?:${SUB_TYPE}|${NESTED_LOGICAL_A})+)`;
export const LOGICAL_COMPOUND =
  `${LOGICAL_KEY}\\(\\s*${COMPOUND_B}(?:\\s*,\\s*${COMPOUND_B})*\\s*\\)`;
export const COMBO_A = '\\s?[\\s>~+]\\s?';
export const COMPLEX_A = `${COMPOUND_A}(?:${COMBO_A}${COMPOUND_A})*`;
export const NESTED_LOGICAL_B =
  `:${LOGICAL_KEY}\\(\\s*${COMPLEX_A}(?:\\s*,\\s*${COMPLEX_A})*\\s*\\)`;
export const COMPOUND_C =
  `(?:${TAG_TYPE}|(?:${TAG_TYPE})?(?:${SUB_TYPE}|${NESTED_LOGICAL_B})+)`;
export const COMPLEX_C = `${COMPOUND_C}(?:${COMBO_A}${COMPOUND_C})*`;
export const LOGICAL_COMPLEX_A =
  `${LOGICAL_KEY}\\(\\s*${COMPLEX_C}(?:\\s*,\\s*${COMPLEX_C})*\\s*\\)`;
export const COMBO_B = '\\s?[~+]\\s?';
export const COMPLEX_B = `${COMPOUND_A}(?:${COMBO_B}${COMPOUND_A})*`;
export const NESTED_LOGICAL_C =
  `:${LOGICAL_KEY}\\(\\s*${COMPLEX_B}(?:\\s*,\\s*${COMPLEX_B})*\\s*\\)`;
export const COMPOUND_D =
  `(?:${TAG_TYPE}|(?:${TAG_TYPE})?(?:${SUB_TYPE}|${NESTED_LOGICAL_C})+)`;
export const COMPLEX_D = `${COMPOUND_D}(?:${COMBO_B}${COMPOUND_D})*`;
export const LOGICAL_COMPLEX_B =
  `${LOGICAL_KEY}\\(\\s*${COMPLEX_D}(?:\\s*,\\s*${COMPLEX_D})*\\s*\\)`;

/* regexp */
export const REG_ANCHOR = /^a(?:rea)?$/;
export const REG_CHILD_INDEXED = new RegExp(`:(?!${N_ST}|${N_TH})`);
export const REG_DIR = /^(?:ltr|rtl)$/;
export const REG_FORM = /^(?:(?:fieldse|inpu|selec)t|button|form|textarea)$/;
export const REG_FORM_CTRL =
  /^(?:button|fieldset|input|optgroup|option|select|textarea)$/;
export const REG_FORM_VALID = /^(?:button|form|input|select|textarea)$/;
export const REG_INTERACT = /^(?:details|dialog)$/;
export const REG_LANG = new RegExp(`^(?:\\*-)?${ALPHA_NUM}${LANG_PART}$`, 'i');
export const REG_LOGICAL_COMPLEX_A =
  new RegExp(`:(?!${N_ST}|${N_TH}|${LOGICAL_COMPLEX_A})`);
export const REG_LOGICAL_COMPLEX_B =
  new RegExp(`:(?!${N_ST}|${N_TH}|${LOGICAL_COMPLEX_B})`);
export const REG_LOGICAL_COMPOUND =
  new RegExp(`:(?!${N_ST}|${N_TH}|${LOGICAL_COMPOUND})`);
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
