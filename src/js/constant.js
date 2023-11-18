/**
 * constant.js
 */

/* string */
export const ALPHA_NUM = '[A-Z\\d]+';
export const AN_PLUS_B = 'AnPlusB';
export const ATTR_SELECTOR = 'AttributeSelector';
export const CLASS_SELECTOR = 'ClassSelector';
export const COMBINATOR = 'Combinator';
export const ID_SELECTOR = 'IdSelector';
export const IDENTIFIER = 'Identifier';
export const NOT_SUPPORTED_ERR = 'NotSupportedError';
export const NTH = 'Nth';
export const PSEUDO_CLASS_SELECTOR = 'PseudoClassSelector';
export const PSEUDO_ELEMENT_SELECTOR = 'PseudoElementSelector';
export const RAW = 'Raw';
export const SELECTOR = 'Selector';
export const SELECTOR_LIST = 'SelectorList';
export const STRING = 'String';
export const SYNTAX_ERR = 'SyntaxError';
export const TYPE_SELECTOR = 'TypeSelector';

/* numeric */
export const BIT_01 = 0x1;
export const BIT_02 = 0x2;
export const BIT_04 = 0x4;
export const BIT_08 = 0x8;
export const BIT_16 = 0x10;
export const BIT_32 = 0x20;
export const TYPE_FROM = 8;
export const TYPE_TO = -1;

/* Node */
export const ELEMENT_NODE = 1;
export const TEXT_NODE = 3;
export const DOCUMENT_NODE = 9;
export const DOCUMENT_FRAGMENT_NODE = 11;
export const DOCUMENT_POSITION_PRECEDING = 0x2;
export const DOCUMENT_POSITION_CONTAINS = 0x8;
export const DOCUMENT_POSITION_CONTAINED_BY = 0x10;

/* NodeFilter */
export const SHOW_ELEMENT = 0x1;

/* regexp */
export const REG_LOGICAL_PSEUDO = /^(?:(?:ha|i)s|not|where)$/;
export const REG_SHADOW_HOST = /^host(?:-context)?$/;
export const REG_SHADOW_MODE = /^(?:close|open)$/;
export const REG_SHADOW_PSEUDO = /^part|slotted$/;
