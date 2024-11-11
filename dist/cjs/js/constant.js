var x=Object.defineProperty;var P=Object.getOwnPropertyDescriptor;var $=Object.getOwnPropertyNames;var R=Object.prototype.hasOwnProperty;var d=(o,t)=>{for(var c in t)x(o,c,{get:t[c],enumerable:!0})},F=(o,t,c,L)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of $(t))!R.call(o,r)&&r!==c&&x(o,r,{get:()=>t[r],enumerable:!(L=P(t,r))||L.enumerable});return o};var M=o=>F(x({},"__esModule",{value:!0}),o);var ft={};d(ft,{ALPHA_NUM:()=>A,ANB:()=>l,ATTR_SELECTOR:()=>U,BIT_01:()=>W,BIT_02:()=>Z,BIT_04:()=>v,BIT_08:()=>q,BIT_16:()=>J,BIT_32:()=>Q,BIT_FFFF:()=>V,CHILD_IDX:()=>I,CLASS_SELECTOR:()=>b,COMBINATOR:()=>G,COMBO:()=>T,COMPLEX:()=>_,COMPLEX_L:()=>N,COMPOUND:()=>n,COMPOUND_A:()=>O,COMPOUND_B:()=>S,COMPOUND_I:()=>Dt,DESCEND:()=>it,DIGIT:()=>p,DOCUMENT_FRAGMENT_NODE:()=>xt,DOCUMENT_NODE:()=>pt,DOCUMENT_POSITION_CONTAINED_BY:()=>_t,DOCUMENT_POSITION_CONTAINS:()=>Tt,DOCUMENT_POSITION_PRECEDING:()=>Et,DUO:()=>tt,ELEMENT_NODE:()=>nt,HEX:()=>ot,HYPHEN:()=>et,IDENT:()=>Y,ID_SELECTOR:()=>f,KEY_FORM_FOCUS:()=>Rt,KEY_INPUT_BUTTON:()=>dt,KEY_INPUT_DATE:()=>i,KEY_INPUT_EDIT:()=>Ft,KEY_INPUT_LTR:()=>Mt,KEY_INPUT_TEXT:()=>D,KEY_LOGICAL:()=>Ut,KEY_MODIFIER:()=>bt,KEY_PS_STATE:()=>Gt,KEY_SHADOW_HOST:()=>Yt,LANG_PART:()=>It,LOGICAL_COMPLEX:()=>Pt,LOGICAL_COMPOUND:()=>$t,NESTED_LOGICAL_A:()=>C,NESTED_LOGICAL_B:()=>a,NOT_SUPPORTED_ERR:()=>h,NTH:()=>m,N_TH:()=>Ct,OPERATOR:()=>B,PSEUDO_CLASS:()=>lt,PS_CLASS_SELECTOR:()=>u,PS_ELEMENT_SELECTOR:()=>H,SELECTOR:()=>y,SHOW_ALL:()=>Ot,SHOW_DOCUMENT:()=>St,SHOW_DOCUMENT_FRAGMENT:()=>Nt,SHOW_ELEMENT:()=>Lt,STRING:()=>z,SUB_TYPE:()=>s,SYNTAX_ERR:()=>w,TAG_ID_CLASS:()=>at,TAG_TYPE:()=>e,TAG_TYPE_I:()=>E,TARGET_ALL:()=>K,TARGET_FIRST:()=>j,TARGET_LINEAL:()=>k,TARGET_SELF:()=>X,TEXT_NODE:()=>ct,TYPE_FROM:()=>rt,TYPE_SELECTOR:()=>g,TYPE_TO:()=>st,WALKER_FILTER:()=>At});module.exports=M(ft);const U="AttributeSelector",b="ClassSelector",G="Combinator",Y="Identifier",f="IdSelector",h="NotSupportedError",m="Nth",B="Operator",u="PseudoClassSelector",H="PseudoElementSelector",y="Selector",z="String",w="SyntaxError",K="all",j="first",k="lineal",X="self",g="TypeSelector",W=1,Z=2,v=4,q=8,J=16,Q=32,V=65535,tt=2,ot=16,et=45,rt=8,st=-1,nt=1,ct=3,pt=9,xt=11,Et=2,Tt=8,_t=16,Ot=4294967295,St=256,Nt=1024,Lt=1,At=1281,A="[A-Z\\d]+",I="(?:first|last|only)-(?:child|of-type)",p="(?:0|[1-9]\\d*)",It=`(?:-${A})*`,lt=`(?:any-)?link|${I}|checked|empty|indeterminate|read-(?:only|write)|root|target`,l=`[+-]?(?:${p}n?|n)|(?:[+-]?${p})?n\\s*[+-]\\s*${p}`,Ct=`nth-(?:last-)?(?:child|of-type)\\(\\s*(?:even|odd|${l})\\s*\\)`,s="\\[[^|\\]]+\\]|[#.:][\\w-]+",at="(?:[A-Za-z][\\w-]*|[#.][\\w-]+)",e="\\*|[A-Za-z][\\w-]*",E="\\*|[A-Z][\\w-]*",n=`(?:${e}|(?:${e})?(?:${s})+)`,T="\\s?[\\s>~+]\\s?",_=`${n}(?:${T}${n})*`,it="\\s?[\\s>]\\s?",C=`:is\\(\\s*${n}(?:\\s*,\\s*${n})*\\s*\\)`,a=`:is\\(\\s*${_}(?:\\s*,\\s*${_})*\\s*\\)`,O=`(?:${e}|(?:${e})?(?:${s}|${C})+)`,S=`(?:${e}|(?:${e})?(?:${s}|${a})+)`,Dt=`(?:${E}|(?:${E})?(?:${s})+)`,N=`${S}(?:${T}${S})*`,Pt=`(?:is|not)\\(\\s*${N}(?:\\s*,\\s*${N})*\\s*\\)`,$t=`(?:is|not)\\(\\s*${O}(?:\\s*,\\s*${O})*\\s*\\)`,Rt=Object.freeze(["button","input","select","textarea"]),dt=Object.freeze(["button","reset","submit"]),i=Object.freeze(["date","datetime-local","month","time","week"]),D=Object.freeze(["email","password","search","tel","text","url"]),Ft=Object.freeze([...i,...D,"number"]),Mt=Object.freeze(["checkbox","color","date","image","number","range","radio","time"]),Ut=Object.freeze(["has","is","not","where"]),bt=Object.freeze(["Alt","AltGraph","CapsLock","Control","Fn","FnLock","Hyper","Meta","NumLock","ScrollLock","Shift","Super","Symbol","SymbolLock"]),Gt=Object.freeze(["enabled","disabled","valid","invalid","in-range","out-of-range","checked","indeterminate","read-only","read-write","open","closed","placeholder-shown"]),Yt=Object.freeze(["host","host-context"]);0&&(module.exports={ALPHA_NUM,ANB,ATTR_SELECTOR,BIT_01,BIT_02,BIT_04,BIT_08,BIT_16,BIT_32,BIT_FFFF,CHILD_IDX,CLASS_SELECTOR,COMBINATOR,COMBO,COMPLEX,COMPLEX_L,COMPOUND,COMPOUND_A,COMPOUND_B,COMPOUND_I,DESCEND,DIGIT,DOCUMENT_FRAGMENT_NODE,DOCUMENT_NODE,DOCUMENT_POSITION_CONTAINED_BY,DOCUMENT_POSITION_CONTAINS,DOCUMENT_POSITION_PRECEDING,DUO,ELEMENT_NODE,HEX,HYPHEN,IDENT,ID_SELECTOR,KEY_FORM_FOCUS,KEY_INPUT_BUTTON,KEY_INPUT_DATE,KEY_INPUT_EDIT,KEY_INPUT_LTR,KEY_INPUT_TEXT,KEY_LOGICAL,KEY_MODIFIER,KEY_PS_STATE,KEY_SHADOW_HOST,LANG_PART,LOGICAL_COMPLEX,LOGICAL_COMPOUND,NESTED_LOGICAL_A,NESTED_LOGICAL_B,NOT_SUPPORTED_ERR,NTH,N_TH,OPERATOR,PSEUDO_CLASS,PS_CLASS_SELECTOR,PS_ELEMENT_SELECTOR,SELECTOR,SHOW_ALL,SHOW_DOCUMENT,SHOW_DOCUMENT_FRAGMENT,SHOW_ELEMENT,STRING,SUB_TYPE,SYNTAX_ERR,TAG_ID_CLASS,TAG_TYPE,TAG_TYPE_I,TARGET_ALL,TARGET_FIRST,TARGET_LINEAL,TARGET_SELF,TEXT_NODE,TYPE_FROM,TYPE_SELECTOR,TYPE_TO,WALKER_FILTER});
//# sourceMappingURL=constant.js.map
