var g=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var x=Object.getOwnPropertyNames;var y=Object.prototype.hasOwnProperty;var A=(s,t)=>{for(var r in t)g(s,r,{get:t[r],enumerable:!0})},O=(s,t,r,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of x(t))!y.call(s,n)&&n!==r&&g(s,n,{get:()=>t[n],enumerable:!(i=S(t,n))||i.enumerable});return s};var T=s=>O(g({},"__esModule",{value:!0}),s);var C={};A(C,{filterSelector:()=>L,generateCSS:()=>u.generate,parseAstName:()=>I,parseSelector:()=>h,preprocess:()=>E,sortAST:()=>_,unescapeSelector:()=>$,walkAST:()=>m});module.exports=T(C);var d=require("css-tree"),e=require("./constant.js"),u=require("css-tree");const $=(s="")=>{if(typeof s=="string"&&s.indexOf("\\",0)>=0){const t=s.split("\\"),r=t.length;for(let i=1;i<r;i++){let n=t[i];if(n===""&&i===r-1)n=e.U_FFFD;else{const f=/^([\da-f]{1,6}\s?)/i.exec(n);if(f){const[,a]=f;let c;try{const o=parseInt("D800",e.HEX),p=parseInt("DFFF",e.HEX),w=parseInt(a,e.HEX);w===0||w>=o&&w<=p?c=e.U_FFFD:c=String.fromCodePoint(w)}catch{c=e.U_FFFD}let l="";n.length>a.length&&(l=n.substring(a.length)),n=`${c}${l}`}else/^[\n\r\f]/.test(n)&&(n="\\"+n)}t[i]=n}s=t.join("")}return s},E=(...s)=>{if(!s.length)throw new TypeError("1 argument required, but only 0 present.");let[t]=s;if(typeof t=="string"){let r=0;for(;r>=0&&(r=t.indexOf("#",r),!(r<0));){const i=t.substring(0,r+1);let n=t.substring(r+1);const f=n.codePointAt(0);if(f===e.BIT_HYPHEN){if(/^\d$/.test(n.substring(1,2)))throw new DOMException(`Invalid selector ${t}`,e.SYNTAX_ERR)}else if(f>e.BIT_FFFF){const a=`\\${f.toString(e.HEX)} `;n.length===e.DUO?n=a:n=`${a}${n.substring(e.DUO)}`}t=`${i}${n}`,r++}t=t.replace(/\f|\r\n?/g,`
`).replace(/[\0\uD800-\uDFFF]|\\$/g,e.U_FFFD)}else if(t==null)t=Object.prototype.toString.call(t).slice(e.TYPE_FROM,e.TYPE_TO).toLowerCase();else if(Array.isArray(t))t=t.join(",");else if(Object.prototype.hasOwnProperty.call(t,"toString"))t=t.toString();else throw new DOMException(`Invalid selector ${t}`,e.SYNTAX_ERR);return t},h=s=>{if(s=E(s),/^$|^\s*>|,\s*$/.test(s))throw new DOMException(`Invalid selector ${s}`,e.SYNTAX_ERR);let t;try{const r=(0,d.parse)(s,{context:"selectorList",parseCustomProperty:!0});t=(0,d.toPlainObject)(r)}catch(r){const{message:i}=r,n=/(:(is|where)\(\s*\))/,f=/(:lang\(\s*("[A-Za-z\d\-*]*")\s*\))/;if(i==="Identifier is expected"&&f.test(s)){const[,a,c]=f.exec(s),l=c.replaceAll("*","\\*").replace(/^"/,"").replace(/"$/,"");let o=a.replace(c,l);o===":lang()"&&(o=`:lang(${e.EMPTY})`),t=h(s.replace(a,o))}else if((i==="Identifier is expected"||i==="Selector is expected")&&n.test(s)){const[,a,c]=n.exec(s),l=`:${c}(${e.EMPTY})`;t=h(s.replace(a,l))}else if(i==='"]" is expected'&&!s.endsWith("]"))t=h(`${s}]`);else if(i==='")" is expected'&&!s.endsWith(")"))t=h(`${s})`);else throw new DOMException(i,e.SYNTAX_ERR)}return t},m=(s={})=>{const t=new Set;let r;return(0,d.walk)(s,{enter:n=>{n.type===e.SELECTOR?t.add(n.children):(n.type===e.SELECTOR_PSEUDO_CLASS&&e.REG_LOGICAL_PSEUDO.test(n.name)||n.type===e.SELECTOR_PSEUDO_ELEMENT&&e.REG_SHADOW_PSEUDO.test(n.name))&&(r=!0)}}),r&&(0,d.findAll)(s,(n,f,a)=>{if(a){if(n.type===e.SELECTOR_PSEUDO_CLASS&&e.REG_LOGICAL_PSEUDO.test(n.name)){const c=a.filter(l=>{const{name:o,type:p}=l;return p===e.SELECTOR_PSEUDO_CLASS&&e.REG_LOGICAL_PSEUDO.test(o)});for(const{children:l}of c)for(const{children:o}of l)for(const{children:p}of o)t.has(p)&&t.delete(p)}else if(n.type===e.SELECTOR_PSEUDO_ELEMENT&&e.REG_SHADOW_PSEUDO.test(n.name)){const c=a.filter(l=>{const{name:o,type:p}=l;return p===e.SELECTOR_PSEUDO_ELEMENT&&e.REG_SHADOW_PSEUDO.test(o)});for(const{children:l}of c)for(const{children:o}of l)t.has(o)&&t.delete(o)}}}),[...t]},_=s=>{const t=[...s];if(t.length>1){const r=new Map([[e.SELECTOR_PSEUDO_ELEMENT,e.BIT_01],[e.SELECTOR_ID,e.BIT_02],[e.SELECTOR_CLASS,e.BIT_04],[e.SELECTOR_TYPE,e.BIT_08],[e.SELECTOR_ATTR,e.BIT_16],[e.SELECTOR_PSEUDO_CLASS,e.BIT_32]]);t.sort((i,n)=>{const{type:f}=i,{type:a}=n,c=r.get(f),l=r.get(a);let o;return c===l?o=0:c>l?o=1:o=-1,o})}return t},I=s=>{let t,r;if(s&&typeof s=="string")s.indexOf("|")>-1?[t,r]=s.split("|"):(t="*",r=s);else throw new DOMException(`Invalid selector ${s}`,e.SYNTAX_ERR);return{prefix:t,localName:r}},L=s=>!(!s||typeof s!="string"||/\||::|\[\s*[\w$*=^|~-]+(?:(?:"[\w$*=^|~\s'-]+"|'[\w$*=^|~\s"-]+')?(?:\s+[\w$*=^|~-]+)+|"[^"\]]{1,255}|'[^'\]]{1,255})\s*\]/.test(s)||s.includes(":")&&/:(?!(?:first|last|only)-(?:child|of-type)|nth-(?:last-)?(?:child|of-type)\(\s*(?:even|odd|[+-]?(?:(?:0|[1-9]\d*)n?|n)|(?:[+-]?(?:0|[1-9]\d*))?n\s*[+-]\s*(?:0|[1-9]\d*))\s*\)|(?:is|not|where)\(\s*(?:\*|[A-Za-z][\w-]*|(?:\*|[A-Za-z][\w-]*)?(?:\[[^\]]+\]|[#.:][\w-]+|:(?:is|not|where)\(\s*(?:\*|[A-Za-z][\w-]*|(?:\*|[A-Za-z][\w-]*)?(?:\[[^\]]+\]|[#.:][\w-]+)+)(?:\s*,\s*(?:\*|[A-Za-z][\w-]*|(?:\*|[A-Za-z][\w-]*)?(?:\[[^\]]+\]|[#.:][\w-]+)+))*\s*\))+)(?:\s*,\s*(?:\*|[A-Za-z][\w-]*|(?:\*|[A-Za-z][\w-]*)?(?:\[[^\]]+\]|[#.:][\w-]+|:(?:is|not|where)\(\s*(?:\*|[A-Za-z][\w-]*|(?:\*|[A-Za-z][\w-]*)?(?:\[[^\]]+\]|[#.:][\w-]+)+)(?:\s*,\s*(?:\*|[A-Za-z][\w-]*|(?:\*|[A-Za-z][\w-]*)?(?:\[[^\]]+\]|[#.:][\w-]+)+))*\s*\))+))*\s*\))/.test(s));0&&(module.exports={filterSelector,generateCSS,parseAstName,parseSelector,preprocess,sortAST,unescapeSelector,walkAST});
//# sourceMappingURL=parser.js.map
