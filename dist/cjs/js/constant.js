var $=Object.defineProperty;var H=Object.getOwnPropertyDescriptor;var f=Object.getOwnPropertyNames;var m=Object.prototype.hasOwnProperty;var w=(e,t)=>{for(var c in t)$(e,c,{get:t[c],enumerable:!0})},X=(e,t,c,P)=>{if(t&&typeof t=="object"||typeof t=="function")for(let E of f(t))!m.call(e,E)&&E!==c&&$(e,E,{get:()=>t[E],enumerable:!(P=H(t,E))||P.enumerable});return e};var g=e=>X($({},"__esModule",{value:!0}),e);var eo={};w(eo,{ALPHA_NUM:()=>T,ANB:()=>l,AN_PLUS_B:()=>h,BIT_01:()=>rt,BIT_02:()=>Et,BIT_04:()=>nt,BIT_08:()=>_t,BIT_16:()=>pt,BIT_32:()=>ct,BIT_FFFF:()=>xt,BIT_HYPHEN:()=>Ot,CHILD_IDX:()=>M,COMBINATOR:()=>b,COMBO_A:()=>O,COMBO_B:()=>C,COMPLEX_A:()=>L,COMPLEX_B:()=>A,COMPLEX_C:()=>G,COMPLEX_D:()=>D,COMPOUND:()=>s,COMPOUND_A:()=>N,COMPOUND_B:()=>S,COMPOUND_C:()=>I,COMPOUND_I:()=>B,DIGIT:()=>x,DOCUMENT_FRAGMENT_NODE:()=>St,DOCUMENT_NODE:()=>Nt,DOCUMENT_POSITION_CONTAINED_BY:()=>Dt,DOCUMENT_POSITION_CONTAINS:()=>Gt,DOCUMENT_POSITION_PRECEDING:()=>It,DUO:()=>$t,ELEMENT_NODE:()=>Lt,EMPTY:()=>W,HEX:()=>Tt,IDENTIFIER:()=>y,LANG_PART:()=>i,LOGICAL_COMPLEX_A:()=>F,LOGICAL_COMPLEX_B:()=>Y,LOGICAL_COMPOUND:()=>u,LOGICAL_KEY:()=>p,NESTED_LOGICAL_A:()=>a,NESTED_LOGICAL_B:()=>U,NESTED_LOGICAL_C:()=>d,NOT_SUPPORTED_ERR:()=>k,NTH:()=>K,N_TH:()=>_,PSEUDO_CLASSES:()=>n,RAW:()=>Z,REG_ANCHOR:()=>Ut,REG_CHILD_INDEXED:()=>dt,REG_COMPLEX:()=>Bt,REG_DIR:()=>Ft,REG_FORM:()=>Yt,REG_FORM_CTRL:()=>ut,REG_FORM_GROUP:()=>Ht,REG_FORM_VALID:()=>ft,REG_HEX:()=>mt,REG_INTERACT:()=>wt,REG_INVALID_SELECTOR:()=>Xt,REG_LANG:()=>gt,REG_LANG_QUOTED:()=>ht,REG_LOGICAL_COMPLEX_A:()=>bt,REG_LOGICAL_COMPLEX_B:()=>Wt,REG_LOGICAL_COMPOUND:()=>yt,REG_LOGICAL_EMPTY:()=>kt,REG_LOGICAL_KEY:()=>Kt,REG_LOGICAL_PSEUDO:()=>Zt,REG_SHADOW_HOST:()=>vt,REG_SHADOW_MODE:()=>zt,REG_SHADOW_PSEUDO:()=>Vt,REG_TYPE_CHECK:()=>Qt,REG_TYPE_DATE:()=>jt,REG_TYPE_RANGE:()=>qt,REG_TYPE_RESET:()=>Jt,REG_TYPE_SUBMIT:()=>to,REG_TYPE_TEXT:()=>oo,SELECTOR:()=>v,SELECTOR_ATTR:()=>z,SELECTOR_CLASS:()=>V,SELECTOR_ID:()=>Q,SELECTOR_LIST:()=>j,SELECTOR_PSEUDO_CLASS:()=>q,SELECTOR_PSEUDO_ELEMENT:()=>J,SELECTOR_TYPE:()=>tt,SHOW_ALL:()=>Pt,SHOW_DOCUMENT:()=>Mt,SHOW_DOCUMENT_FRAGMENT:()=>it,SHOW_ELEMENT:()=>lt,STRING:()=>ot,SUB_TYPE:()=>r,SYNTAX_ERR:()=>et,TAG_TYPE:()=>o,TAG_TYPE_I:()=>R,TEXT_NODE:()=>At,TYPE_FROM:()=>Rt,TYPE_TO:()=>Ct,U_FFFD:()=>st,WALKER_FILTER:()=>at});module.exports=g(eo);const h="AnPlusB",b="Combinator",W="__EMPTY__",y="Identifier",k="NotSupportedError",K="Nth",Z="Raw",v="Selector",z="AttributeSelector",V="ClassSelector",Q="IdSelector",j="SelectorList",q="PseudoClassSelector",J="PseudoElementSelector",tt="TypeSelector",ot="String",et="SyntaxError",st="\uFFFD",rt=1,Et=2,nt=4,_t=8,pt=16,ct=32,xt=65535,Ot=45,$t=2,Tt=16,Rt=8,Ct=-1,Lt=1,At=3,Nt=9,St=11,It=2,Gt=8,Dt=16,Pt=4294967295,Mt=256,it=1024,lt=1,at=1281,T="[A-Z\\d]+",M="(?:first|last|only)-(?:child|of-type)",x="(?:0|[1-9]\\d*)",i=`(?:-${T})*`,n=`(?:any-)?link|${M}|checked|empty|indeterminate|root|target|visited`,l=`[+-]?(?:${x}n?|n)|(?:[+-]?${x})?n\\s*[+-]\\s*${x}`,_=`nth-(?:last-)?(?:child|of-type)\\(\\s*(?:even|odd|${l})\\s*\\)`,r="\\[[^|\\]]+\\]|[#.:][\\w-]+",o="\\*|[A-Za-z][\\w-]*",R="\\*|[A-Z][\\w-]*",p="(?:is|not)",s=`(?:${o}|(?:${o})?(?:${r})+)`,O="\\s?[\\s>~+]\\s?",C="\\s?[~+]\\s?",L=`${s}(?:${O}${s})*`,A=`${s}(?:${C}${s})*`,a=`:is\\(\\s*${s}(?:\\s*,\\s*${s})*\\s*\\)`,U=`:is\\(\\s*${L}(?:\\s*,\\s*${L})*\\s*\\)`,d=`:is\\(\\s*${A}(?:\\s*,\\s*${A})*\\s*\\)`,N=`(?:${o}|(?:${o})?(?:${r}|${a})+)`,S=`(?:${o}|(?:${o})?(?:${r}|${U})+)`,I=`(?:${o}|(?:${o})?(?:${r}|${d})+)`,B=`(?:${R}|(?:${R})?(?:${r})+)`,G=`${S}(?:${O}${S})*`,D=`${I}(?:${C}${I})*`,F=`${p}\\(\\s*${G}(?:\\s*,\\s*${G})*\\s*\\)`,Y=`${p}\\(\\s*${D}(?:\\s*,\\s*${D})*\\s*\\)`,u=`${p}\\(\\s*${N}(?:\\s*,\\s*${N})*\\s*\\)`,Ut=/^a(?:rea)?$/,dt=new RegExp(`:(?!${n}|${_})`),Bt=new RegExp(`${O}${B}`,"i"),Ft=/^(?:ltr|rtl)$/,Yt=/^(?:(?:fieldse|inpu|selec)t|button|form|textarea)$/,ut=/^(?:button|fieldset|input|optgroup|option|select|textarea)$/,Ht=/^(?:fieldset|optgroup|select)$/,ft=/^(?:button|form|input|select|textarea)$/,mt=/^([\da-f]{1,6}\s?)/i,wt=/^(?:details|dialog)$/,Xt=/^$|^\s*>|,\s*$/,gt=new RegExp(`^(?:\\*-)?${T}${i}$`,"i"),ht=/(:lang\(\s*("[A-Za-z\d\-*]*")\s*\))/,bt=new RegExp(`:(?!${n}|${_}|${F})`),Wt=new RegExp(`:(?!${n}|${_}|${Y})`),yt=new RegExp(`:(?!${n}|${_}|${u})`),kt=/(:(is|where)\(\s*\))/,Kt=new RegExp(`:${p}\\(`),Zt=/^(?:has|is|not|where)$/,vt=/^host(?:-context)?$/,zt=/^(?:close|open)$/,Vt=/^part|slotted$/,Qt=/^(?:checkbox|radio)$/,jt=/^(?:date(?:time-local)?|month|time|week)$/,qt=/(?:date(?:time-local)?|month|number|range|time|week)$/,Jt=/^(?:button|reset)$/,to=/^(?:image|submit)$/,oo=/^(?:email|number|password|search|tel|text|url)$/;0&&(module.exports={ALPHA_NUM,ANB,AN_PLUS_B,BIT_01,BIT_02,BIT_04,BIT_08,BIT_16,BIT_32,BIT_FFFF,BIT_HYPHEN,CHILD_IDX,COMBINATOR,COMBO_A,COMBO_B,COMPLEX_A,COMPLEX_B,COMPLEX_C,COMPLEX_D,COMPOUND,COMPOUND_A,COMPOUND_B,COMPOUND_C,COMPOUND_I,DIGIT,DOCUMENT_FRAGMENT_NODE,DOCUMENT_NODE,DOCUMENT_POSITION_CONTAINED_BY,DOCUMENT_POSITION_CONTAINS,DOCUMENT_POSITION_PRECEDING,DUO,ELEMENT_NODE,EMPTY,HEX,IDENTIFIER,LANG_PART,LOGICAL_COMPLEX_A,LOGICAL_COMPLEX_B,LOGICAL_COMPOUND,LOGICAL_KEY,NESTED_LOGICAL_A,NESTED_LOGICAL_B,NESTED_LOGICAL_C,NOT_SUPPORTED_ERR,NTH,N_TH,PSEUDO_CLASSES,RAW,REG_ANCHOR,REG_CHILD_INDEXED,REG_COMPLEX,REG_DIR,REG_FORM,REG_FORM_CTRL,REG_FORM_GROUP,REG_FORM_VALID,REG_HEX,REG_INTERACT,REG_INVALID_SELECTOR,REG_LANG,REG_LANG_QUOTED,REG_LOGICAL_COMPLEX_A,REG_LOGICAL_COMPLEX_B,REG_LOGICAL_COMPOUND,REG_LOGICAL_EMPTY,REG_LOGICAL_KEY,REG_LOGICAL_PSEUDO,REG_SHADOW_HOST,REG_SHADOW_MODE,REG_SHADOW_PSEUDO,REG_TYPE_CHECK,REG_TYPE_DATE,REG_TYPE_RANGE,REG_TYPE_RESET,REG_TYPE_SUBMIT,REG_TYPE_TEXT,SELECTOR,SELECTOR_ATTR,SELECTOR_CLASS,SELECTOR_ID,SELECTOR_LIST,SELECTOR_PSEUDO_CLASS,SELECTOR_PSEUDO_ELEMENT,SELECTOR_TYPE,SHOW_ALL,SHOW_DOCUMENT,SHOW_DOCUMENT_FRAGMENT,SHOW_ELEMENT,STRING,SUB_TYPE,SYNTAX_ERR,TAG_TYPE,TAG_TYPE_I,TEXT_NODE,TYPE_FROM,TYPE_TO,U_FFFD,WALKER_FILTER});
//# sourceMappingURL=constant.js.map
