var T=Object.defineProperty;var F=Object.getOwnPropertyDescriptor;var U=Object.getOwnPropertyNames;var d=Object.prototype.hasOwnProperty;var Y=(o,t)=>{for(var n in t)T(o,n,{get:t[n],enumerable:!0})},u=(o,t,n,I)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of U(t))!d.call(o,s)&&s!==n&&T(o,s,{get:()=>t[s],enumerable:!(I=F(t,s))||I.enumerable});return o};var B=o=>u(T({},"__esModule",{value:!0}),o);var qt={};Y(qt,{ALPHA_NUM:()=>O,ANB:()=>D,AN_PLUS_B:()=>H,BIT_01:()=>et,BIT_02:()=>st,BIT_04:()=>Et,BIT_08:()=>rt,BIT_16:()=>nt,BIT_32:()=>_t,BIT_FFFF:()=>ct,BIT_HYPHEN:()=>xt,CHILD_IDX:()=>C,COMBINATOR:()=>m,COMBO:()=>p,COMPLEX:()=>$,COMPLEX_L:()=>A,COMPOUND:()=>r,COMPOUND_A:()=>S,COMPOUND_B:()=>L,COMPOUND_I:()=>i,DIGIT:()=>_,DOCUMENT_FRAGMENT_NODE:()=>At,DOCUMENT_NODE:()=>Lt,DOCUMENT_POSITION_CONTAINED_BY:()=>Ct,DOCUMENT_POSITION_CONTAINS:()=>It,DOCUMENT_POSITION_PRECEDING:()=>Nt,DUO:()=>pt,ELEMENT_NODE:()=>$t,EMPTY:()=>w,HEX:()=>Tt,IDENTIFIER:()=>h,KEY_IS_NOT:()=>N,LANG_PART:()=>G,LOGICAL_COMPLEX:()=>a,LOGICAL_COMPOUND:()=>M,NESTED_LOGICAL_A:()=>P,NESTED_LOGICAL_B:()=>l,NOT_SUPPORTED_ERR:()=>g,NTH:()=>f,N_TH:()=>x,PSEUDO_CLASSES:()=>c,RAW:()=>X,REG_ANCHOR:()=>at,REG_COMPLEX:()=>Mt,REG_DIR:()=>Ft,REG_FILTER_COMPLEX:()=>Ut,REG_FILTER_COMPOUND:()=>dt,REG_FILTER_SIMPLE:()=>Yt,REG_FORM:()=>ut,REG_FORM_CTRL:()=>Bt,REG_FORM_VALID:()=>Ht,REG_HEX:()=>mt,REG_INTERACT:()=>wt,REG_INVALID_SELECTOR:()=>ht,REG_LANG:()=>gt,REG_LANG_QUOTED:()=>ft,REG_LOGICAL_EMPTY:()=>Xt,REG_LOGICAL_PSEUDO:()=>bt,REG_SHADOW_HOST:()=>Wt,REG_SHADOW_MODE:()=>yt,REG_SHADOW_PSEUDO:()=>kt,REG_TAG_NAME:()=>Zt,REG_TYPE_CHECK:()=>Kt,REG_TYPE_DATE:()=>vt,REG_TYPE_RANGE:()=>zt,REG_TYPE_RESET:()=>Vt,REG_TYPE_SUBMIT:()=>Qt,REG_TYPE_TEXT:()=>jt,SELECTOR:()=>b,SELECTOR_ATTR:()=>W,SELECTOR_CLASS:()=>y,SELECTOR_ID:()=>k,SELECTOR_LIST:()=>Z,SELECTOR_PSEUDO_CLASS:()=>K,SELECTOR_PSEUDO_ELEMENT:()=>v,SELECTOR_TYPE:()=>z,SHOW_ALL:()=>Gt,SHOW_DOCUMENT:()=>Dt,SHOW_DOCUMENT_FRAGMENT:()=>Pt,SHOW_ELEMENT:()=>lt,STRING:()=>V,SUB_TYPE:()=>E,SYNTAX_ERR:()=>Q,TAG_TYPE:()=>e,TAG_TYPE_I:()=>R,TARGET_ALL:()=>j,TARGET_FIRST:()=>q,TARGET_LINEAL:()=>J,TARGET_SELF:()=>tt,TEXT_NODE:()=>St,TYPE_FROM:()=>Ot,TYPE_TO:()=>Rt,U_FFFD:()=>ot,WALKER_FILTER:()=>it});module.exports=B(qt);const H="AnPlusB",m="Combinator",w="__EMPTY__",h="Identifier",g="NotSupportedError",f="Nth",X="Raw",b="Selector",W="AttributeSelector",y="ClassSelector",k="IdSelector",Z="SelectorList",K="PseudoClassSelector",v="PseudoElementSelector",z="TypeSelector",V="String",Q="SyntaxError",j="all",q="first",J="lineal",tt="self",ot="\uFFFD",et=1,st=2,Et=4,rt=8,nt=16,_t=32,ct=65535,xt=45,pt=2,Tt=16,Ot=8,Rt=-1,$t=1,St=3,Lt=9,At=11,Nt=2,It=8,Ct=16,Gt=4294967295,Dt=256,Pt=1024,lt=1,it=1281,O="[A-Z\\d]+",C="(?:first|last|only)-(?:child|of-type)",_="(?:0|[1-9]\\d*)",G=`(?:-${O})*`,c=`(?:any-)?link|${C}|checked|empty|indeterminate|root|target|visited`,D=`[+-]?(?:${_}n?|n)|(?:[+-]?${_})?n\\s*[+-]\\s*${_}`,x=`nth-(?:last-)?(?:child|of-type)\\(\\s*(?:even|odd|${D})\\s*\\)`,E="\\[[^|\\]]+\\]|[#.:][\\w-]+",e="\\*|[A-Za-z][\\w-]*",R="\\*|[A-Z][\\w-]*",r=`(?:${e}|(?:${e})?(?:${E})+)`,p="\\s?[\\s>~+]\\s?",$=`${r}(?:${p}${r})*`,P=`:is\\(\\s*${r}(?:\\s*,\\s*${r})*\\s*\\)`,l=`:is\\(\\s*${$}(?:\\s*,\\s*${$})*\\s*\\)`,S=`(?:${e}|(?:${e})?(?:${E}|${P})+)`,L=`(?:${e}|(?:${e})?(?:${E}|${l})+)`,i=`(?:${R}|(?:${R})?(?:${E})+)`,A=`${L}(?:${p}${L})*`,N="(?:is|not)",a=`${N}\\(\\s*${A}(?:\\s*,\\s*${A})*\\s*\\)`,M=`${N}\\(\\s*${S}(?:\\s*,\\s*${S})*\\s*\\)`,at=/^a(?:rea)?$/,Mt=new RegExp(`${p}${i}`,"i"),Ft=/^(?:ltr|rtl)$/,Ut=new RegExp(`:(?!${c}|${x}|${a})`),dt=new RegExp(`:(?!${c}|${x}|${M})`),Yt=new RegExp(`:(?!${c}|${x})`),ut=/^(?:button|fieldset|form|input|select|textarea)$/,Bt=/^(?:button|fieldset|input|optgroup|option|select|textarea)$/,Ht=/^(?:button|form|input|select|textarea)$/,mt=/^([\da-f]{1,6}\s?)/i,wt=/^(?:details|dialog)$/,ht=/^$|^\s*>|,\s*$/,gt=new RegExp(`^(?:\\*-)?${O}${G}$`,"i"),ft=/(:lang\(\s*("[A-Za-z\d\-*]*")\s*\))/,Xt=/(:(is|where)\(\s*\))/,bt=/^(?:has|is|not|where)$/,Wt=/^host(?:-context)?$/,yt=/^(?:close|open)$/,kt=/^part|slotted$/,Zt=/[A-Z][\\w-]*/i,Kt=/^(?:checkbox|radio)$/,vt=/^(?:date(?:time-local)?|month|time|week)$/,zt=/(?:date(?:time-local)?|month|number|range|time|week)$/,Vt=/^(?:button|reset)$/,Qt=/^(?:image|submit)$/,jt=/^(?:email|number|password|search|tel|text|url)$/;0&&(module.exports={ALPHA_NUM,ANB,AN_PLUS_B,BIT_01,BIT_02,BIT_04,BIT_08,BIT_16,BIT_32,BIT_FFFF,BIT_HYPHEN,CHILD_IDX,COMBINATOR,COMBO,COMPLEX,COMPLEX_L,COMPOUND,COMPOUND_A,COMPOUND_B,COMPOUND_I,DIGIT,DOCUMENT_FRAGMENT_NODE,DOCUMENT_NODE,DOCUMENT_POSITION_CONTAINED_BY,DOCUMENT_POSITION_CONTAINS,DOCUMENT_POSITION_PRECEDING,DUO,ELEMENT_NODE,EMPTY,HEX,IDENTIFIER,KEY_IS_NOT,LANG_PART,LOGICAL_COMPLEX,LOGICAL_COMPOUND,NESTED_LOGICAL_A,NESTED_LOGICAL_B,NOT_SUPPORTED_ERR,NTH,N_TH,PSEUDO_CLASSES,RAW,REG_ANCHOR,REG_COMPLEX,REG_DIR,REG_FILTER_COMPLEX,REG_FILTER_COMPOUND,REG_FILTER_SIMPLE,REG_FORM,REG_FORM_CTRL,REG_FORM_VALID,REG_HEX,REG_INTERACT,REG_INVALID_SELECTOR,REG_LANG,REG_LANG_QUOTED,REG_LOGICAL_EMPTY,REG_LOGICAL_PSEUDO,REG_SHADOW_HOST,REG_SHADOW_MODE,REG_SHADOW_PSEUDO,REG_TAG_NAME,REG_TYPE_CHECK,REG_TYPE_DATE,REG_TYPE_RANGE,REG_TYPE_RESET,REG_TYPE_SUBMIT,REG_TYPE_TEXT,SELECTOR,SELECTOR_ATTR,SELECTOR_CLASS,SELECTOR_ID,SELECTOR_LIST,SELECTOR_PSEUDO_CLASS,SELECTOR_PSEUDO_ELEMENT,SELECTOR_TYPE,SHOW_ALL,SHOW_DOCUMENT,SHOW_DOCUMENT_FRAGMENT,SHOW_ELEMENT,STRING,SUB_TYPE,SYNTAX_ERR,TAG_TYPE,TAG_TYPE_I,TARGET_ALL,TARGET_FIRST,TARGET_LINEAL,TARGET_SELF,TEXT_NODE,TYPE_FROM,TYPE_TO,U_FFFD,WALKER_FILTER});
//# sourceMappingURL=constant.js.map
