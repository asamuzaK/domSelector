var E=Object.defineProperty;var x=Object.getOwnPropertyDescriptor;var S=Object.getOwnPropertyNames;var O=Object.prototype.hasOwnProperty;var $=(s,t)=>{for(var r in t)E(s,r,{get:t[r],enumerable:!0})},w=(s,t,r,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of S(t))!O.call(s,n)&&n!==r&&E(s,n,{get:()=>t[n],enumerable:!(i=x(t,n))||i.enumerable});return s};var y=s=>w(E({},"__esModule",{value:!0}),s);var L={};$(L,{generateCSS:()=>m.generate,parseSelector:()=>d,preprocess:()=>u,unescapeSelector:()=>D,walkAST:()=>_});module.exports=y(L);var g=require("css-tree"),e=require("./constant.js"),m=require("css-tree");const D=(s="")=>{if(typeof s=="string"&&s.indexOf("\\",0)>=0){const t=s.split("\\"),r=t.length;for(let i=1;i<r;i++){let n=t[i];if(n===""&&i===r-1)n=e.U_FFFD;else{const a=/^([\da-f]{1,6}\s?)/i.exec(n);if(a){const[,o]=a;let l;try{const c=parseInt("D800",e.HEX),p=parseInt("DFFF",e.HEX),h=parseInt(o,e.HEX);h===0||h>=c&&h<=p?l=e.U_FFFD:l=String.fromCodePoint(h)}catch{l=e.U_FFFD}let f="";n.length>o.length&&(f=n.substring(o.length)),n=`${l}${f}`}else/^[\n\r\f]/.test(n)&&(n="\\"+n)}t[i]=n}s=t.join("")}return s},u=(...s)=>{if(!s.length)throw new TypeError("1 argument required, but only 0 present.");let[t]=s;if(typeof t=="string"){let r=0;for(;r>=0&&(r=t.indexOf("#",r),!(r<0));){const i=t.substring(0,r+1);let n=t.substring(r+1);const a=n.codePointAt(0);if(a===e.BIT_HYPHEN){if(/^\d$/.test(n.substring(1,2)))throw new DOMException(`Invalid selector ${t}`,e.SYNTAX_ERR)}else if(a>e.MAX_BIT_16){const o=`\\${a.toString(e.HEX)} `;n.length===e.DUO?n=o:n=`${o}${n.substring(e.DUO)}`}t=`${i}${n}`,r++}t=t.replace(/\f|\r\n?/g,`
`).replace(/[\0\uD800-\uDFFF]|\\$/g,e.U_FFFD)}else if(t==null)t=Object.prototype.toString.call(t).slice(e.TYPE_FROM,e.TYPE_TO).toLowerCase();else throw new DOMException(`Invalid selector ${t}`,e.SYNTAX_ERR);return t},d=s=>{if(s=u(s),/^$|^\s*>|,\s*$/.test(s))throw new DOMException(`Invalid selector ${s}`,e.SYNTAX_ERR);let t;try{const r=(0,g.parse)(s,{context:"selectorList",parseCustomProperty:!0});t=(0,g.toPlainObject)(r)}catch(r){const i=/(:lang\(\s*("[A-Za-z\d\-*]+")\s*\))/;if(r.message==="Identifier is expected"&&i.test(s)){const[,n,a]=i.exec(s),o=a.replaceAll("*","\\*").replace(/^"/,"").replace(/"$/,""),l=n.replace(a,o);t=d(s.replace(n,l))}else if(r.message==='"]" is expected'&&!s.endsWith("]"))t=d(`${s}]`);else if(r.message==='")" is expected'&&!s.endsWith(")"))t=d(`${s})`);else throw new DOMException(r.message,e.SYNTAX_ERR)}return t},_=(s={})=>{const t=new Set;let r;return(0,g.walk)(s,{enter:n=>{n.type===e.SELECTOR?t.add(n.children):(n.type===e.SELECTOR_PSEUDO_CLASS&&e.REG_LOGICAL_PSEUDO.test(n.name)||n.type===e.SELECTOR_PSEUDO_ELEMENT&&e.REG_SHADOW_PSEUDO.test(n.name))&&(r=!0)}}),r&&(0,g.findAll)(s,(n,a,o)=>{if(o){if(n.type===e.SELECTOR_PSEUDO_CLASS&&e.REG_LOGICAL_PSEUDO.test(n.name)){const l=o.filter(f=>{const{name:c,type:p}=f;return p===e.SELECTOR_PSEUDO_CLASS&&e.REG_LOGICAL_PSEUDO.test(c)});for(const{children:f}of l)for(const{children:c}of f)for(const{children:p}of c)t.has(p)&&t.delete(p)}else if(n.type===e.SELECTOR_PSEUDO_ELEMENT&&e.REG_SHADOW_PSEUDO.test(n.name)){const l=o.filter(f=>{const{name:c,type:p}=f;return p===e.SELECTOR_PSEUDO_ELEMENT&&e.REG_SHADOW_PSEUDO.test(c)});for(const{children:f}of l)for(const{children:c}of f)t.has(c)&&t.delete(c)}}}),[...t]};0&&(module.exports={generateCSS,parseSelector,preprocess,unescapeSelector,walkAST});
//# sourceMappingURL=parser.js.map
