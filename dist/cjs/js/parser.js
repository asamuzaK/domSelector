var d=Object.defineProperty;var _=Object.getOwnPropertyDescriptor;var x=Object.getOwnPropertyNames;var S=Object.prototype.hasOwnProperty;var I=(s,t)=>{for(var r in t)d(s,r,{get:t[r],enumerable:!0})},L=(s,t,r,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of x(t))!S.call(s,n)&&n!==r&&d(s,n,{get:()=>t[n],enumerable:!(i=_(t,n))||i.enumerable});return s};var T=s=>L(d({},"__esModule",{value:!0}),s);var A={};I(A,{filterSelector:()=>C,generateCSS:()=>O.generate,parseAstName:()=>w,parseSelector:()=>h,preprocess:()=>g,sortAST:()=>m,unescapeSelector:()=>$,walkAST:()=>y});module.exports=T(A);var u=require("css-tree"),e=require("./constant.js"),O=require("css-tree");const $=(s="")=>{if(typeof s=="string"&&s.indexOf("\\",0)>=0){const t=s.split("\\"),r=t.length;for(let i=1;i<r;i++){let n=t[i];if(n===""&&i===r-1)n=e.U_FFFD;else{const f=e.REG_HEX.exec(n);if(f){const[,a]=f;let l;try{const o=parseInt("D800",e.HEX),p=parseInt("DFFF",e.HEX),E=parseInt(a,e.HEX);E===0||E>=o&&E<=p?l=e.U_FFFD:l=String.fromCodePoint(E)}catch{l=e.U_FFFD}let c="";n.length>a.length&&(c=n.substring(a.length)),n=`${l}${c}`}else/^[\n\r\f]/.test(n)&&(n="\\"+n)}t[i]=n}s=t.join("")}return s},g=(...s)=>{if(!s.length)throw new TypeError("1 argument required, but only 0 present.");let[t]=s;if(typeof t=="string"){let r=0;for(;r>=0&&(r=t.indexOf("#",r),!(r<0));){const i=t.substring(0,r+1);let n=t.substring(r+1);if(/^\d$/.test(n.substring(0,1)))throw new DOMException(`Invalid selector ${t}`,e.SYNTAX_ERR);const f=n.codePointAt(0);if(f===e.BIT_HYPHEN){if(/^\d$/.test(n.substring(1,2)))throw new DOMException(`Invalid selector ${t}`,e.SYNTAX_ERR)}else if(f>e.BIT_FFFF){const a=`\\${f.toString(e.HEX)} `;n.length===e.DUO?n=a:n=`${a}${n.substring(e.DUO)}`}t=`${i}${n}`,r++}t=t.replace(/\f|\r\n?/g,`
`).replace(/[\0\uD800-\uDFFF]|\\$/g,e.U_FFFD)}else if(t==null)t=Object.prototype.toString.call(t).slice(e.TYPE_FROM,e.TYPE_TO).toLowerCase();else if(Array.isArray(t))t=t.join(",");else if(Object.prototype.hasOwnProperty.call(t,"toString"))t=t.toString();else throw new DOMException(`Invalid selector ${t}`,e.SYNTAX_ERR);return t},h=s=>{if(s=g(s),e.REG_INVALID_SELECTOR.test(s))throw new DOMException(`Invalid selector ${s}`,e.SYNTAX_ERR);let t;try{const r=(0,u.parse)(s,{context:"selectorList",parseCustomProperty:!0});t=(0,u.toPlainObject)(r)}catch(r){const{message:i}=r;if(i==="Identifier is expected"&&e.REG_LANG_QUOTED.test(s)){const[,n,f]=e.REG_LANG_QUOTED.exec(s),a=f.replaceAll("*","\\*").replace(/^"/,"").replace(/"$/,"");let l=n.replace(f,a);l===":lang()"&&(l=`:lang(${e.EMPTY})`),t=h(s.replace(n,l))}else if(/^(?:Identifier|Selector) is expected$/.test(i)&&e.REG_LOGICAL_EMPTY.test(s)){const[,n,f]=e.REG_LOGICAL_EMPTY.exec(s);t=h(s.replace(n,`:${f}(${e.EMPTY})`))}else if(/^(?:"\]"|Attribute selector [()\s,=~^$*|]+) is expected$/.test(i)&&!s.endsWith("]")){const n=s.lastIndexOf("["),f=s.substring(n);f.includes('"')?f.match(/"/g).length%2?t=h(`${s}"]`):t=h(`${s}]`):t=h(`${s}]`)}else if(i==='")" is expected'&&!s.endsWith(")"))t=h(`${s})`);else throw new DOMException(i,e.SYNTAX_ERR)}return t},y=(s={})=>{const t=new Set,r=new Map;return(0,u.walk)(s,{enter:n=>{n.type===e.SELECTOR?t.add(n.children):n.type===e.SELECTOR_PSEUDO_CLASS?(r.set("hasPseudo",!0),e.REG_LOGICAL_PSEUDO.test(n.name)&&(r.set("hasPseudoFunc",!0),n.name==="has"&&r.set("hasHasPseudoFunc",!0))):n.type===e.SELECTOR_PSEUDO_ELEMENT?(r.set("hasPseudo",!0),e.REG_SHADOW_PSEUDO.test(n.name)&&r.set("hasPseudoFunc",!0)):n.type===e.SELECTOR_ATTR&&n.matcher==="|="&&r.set("hasHyphenSepAttr",!0)}}),r.get("hasPseudoFunc")&&(0,u.findAll)(s,(n,f,a)=>{if(a){if(n.type===e.SELECTOR_PSEUDO_CLASS&&e.REG_LOGICAL_PSEUDO.test(n.name)){const l=a.filter(c=>{const{name:o,type:p}=c;return p===e.SELECTOR_PSEUDO_CLASS&&e.REG_LOGICAL_PSEUDO.test(o)});for(const{children:c}of l)for(const{children:o}of c)for(const{children:p}of o)t.has(p)&&t.delete(p)}else if(n.type===e.SELECTOR_PSEUDO_ELEMENT&&e.REG_SHADOW_PSEUDO.test(n.name)){const l=a.filter(c=>{const{name:o,type:p}=c;return p===e.SELECTOR_PSEUDO_ELEMENT&&e.REG_SHADOW_PSEUDO.test(o)});for(const{children:c}of l)for(const{children:o}of c)t.has(o)&&t.delete(o)}else if(n.type===e.NTH&&n.selector){const l=a.filter(c=>{const{selector:o,type:p}=c;return p===e.NTH&&o});for(const{selector:c}of l){const{children:o}=c;for(const{children:p}of o)t.has(p)&&t.delete(p)}}}}),{branches:[...t],info:Object.fromEntries(r)}},m=s=>{const t=[...s];if(t.length>1){const r=new Map([[e.SELECTOR_PSEUDO_ELEMENT,e.BIT_01],[e.SELECTOR_ID,e.BIT_02],[e.SELECTOR_CLASS,e.BIT_04],[e.SELECTOR_TYPE,e.BIT_08],[e.SELECTOR_ATTR,e.BIT_16],[e.SELECTOR_PSEUDO_CLASS,e.BIT_32]]);t.sort((i,n)=>{const{type:f}=i,{type:a}=n,l=r.get(f),c=r.get(a);let o;return l===c?o=0:l>c?o=1:o=-1,o})}return t},w=s=>{let t,r;if(s&&typeof s=="string")s.indexOf("|")>-1?[t,r]=s.split("|"):(t="*",r=s);else throw new DOMException(`Invalid selector ${s}`,e.SYNTAX_ERR);return{prefix:t,localName:r}},C=(s,t={})=>{if(!s||typeof s!="string")return!1;if(s.includes("[")){const r=s.lastIndexOf("[");if(s.substring(r).lastIndexOf("]")<0)return!1}if(/\||::|\[\s*[\w$*=^|~-]+(?:(?:"[\w$*=^|~\s'-]+"|'[\w$*=^|~\s"-]+')?(?:\s+[\w$*=^|~-]+)+|"[^"\]]{1,255}|'[^'\]]{1,255})\s*\]/.test(s))return!1;if(s.includes(":")){let r;if(e.REG_LOGICAL_KEY.test(s)){if(e.REG_LOGICAL_EMPTY.test(s))return!1;const{complex:i,descendant:n,qsa:f}=t;i&&n||f?r=e.REG_LOGICAL_COMPLEX:r=e.REG_LOGICAL_COMPOUND}else r=e.REG_CHILD_INDEXED;if(r.test(s))return!1}return!0};0&&(module.exports={filterSelector,generateCSS,parseAstName,parseSelector,preprocess,sortAST,unescapeSelector,walkAST});
//# sourceMappingURL=parser.js.map
