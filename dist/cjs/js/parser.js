var E=Object.defineProperty;var D=Object.getOwnPropertyDescriptor;var $=Object.getOwnPropertyNames;var P=Object.prototype.hasOwnProperty;var w=(n,e)=>{for(var s in e)E(n,s,{get:e[s],enumerable:!0})},y=(n,e,s,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of $(e))!P.call(n,t)&&t!==s&&E(n,t,{get:()=>e[t],enumerable:!(i=D(e,t))||i.enumerable});return n};var C=n=>y(E({},"__esModule",{value:!0}),n);var R={};w(R,{generateCSS:()=>O.generate,parseSelector:()=>g,preprocess:()=>x,unescapeSelector:()=>L,walkAST:()=>b});module.exports=C(R);var h=require("css-tree"),r=require("./constant.js"),O=require("css-tree");const T=parseInt("10000",16),_=16,S=2,A=/^([\da-f]{1,6}\s?)/i,u=/^(?:(?:ha|i)s|not|where)$/,m=/^part|slotted$/,F=/(:lang\(\s*("[A-Z\d\-*]+")\s*\))/i,I=/^[\n\r\f]/,L=(n="")=>{if(typeof n=="string"&&n.indexOf("\\",0)>=0){const e=n.split("\\"),s=e.length;for(let i=1;i<s;i++){let t=e[i];if(t===""&&i===s-1)t="\uFFFD";else{const l=A.exec(t);if(l){const[,o]=l;let p;try{const c=parseInt("D800",16),f=parseInt("DFFF",16),d=parseInt(o,16);d===0||d>=c&&d<=f?p="\uFFFD":p=String.fromCodePoint(d)}catch{p="\uFFFD"}let a="";t.length>o.length&&(a=t.substring(o.length)),t=`${p}${a}`}else I.test(t)&&(t="\\"+t)}e[i]=t}n=e.join("")}return n},x=(...n)=>{if(!n.length)throw new TypeError("1 argument required, but only 0 present.");let[e]=n;if(typeof e=="string"){let s=0;for(;s>=0&&(s=e.indexOf("#",s),!(s<0));){const i=e.substring(0,s+1);let t=e.substring(s+1);const l=t.codePointAt(0);if(l>=T){const o=`\\${l.toString(_)} `;t.length===S?t=o:t=`${o}${t.substring(S)}`}e=`${i}${t}`,s++}e=e.replace(/\f|\r\n?/g,`
`).replace(/[\0\uD800-\uDFFF]|\\$/g,"\uFFFD")}else if(e==null)e=Object.prototype.toString.call(e).slice(r.TYPE_FROM,r.TYPE_TO).toLowerCase();else throw new DOMException(`Invalid selector ${e}`,r.SYNTAX_ERR);return e},g=n=>{if(n=x(n),/^$|^\s*>|,\s*$/.test(n))throw new DOMException(`Invalid selector ${n}`,r.SYNTAX_ERR);let e;try{const s=(0,h.parse)(n,{context:"selectorList",parseCustomProperty:!0});e=(0,h.toPlainObject)(s)}catch(s){if(s.message==="Identifier is expected"&&F.test(n)){const[,i,t]=F.exec(n),l=t.replace(/\s*\*/g,"\\*").replace(/^"/,"").replace(/"$/,""),o=i.replace(t,l);e=g(n.replace(i,o))}else if(s.message==='"]" is expected'&&!n.endsWith("]"))e=g(`${n}]`);else if(s.message==='")" is expected'&&!n.endsWith(")"))e=g(`${n})`);else throw new DOMException(s.message,r.SYNTAX_ERR)}return e},b=(n={})=>{const e=new Set;let s;return(0,h.walk)(n,{enter:t=>{t.type===r.SELECTOR?e.add(t.children):(t.type===r.PSEUDO_CLASS_SELECTOR&&u.test(t.name)||t.type===r.PSEUDO_ELEMENT_SELECTOR&&m.test(t.name))&&(s=!0)}}),s&&(0,h.findAll)(n,(t,l,o)=>{if(o){if(t.type===r.PSEUDO_CLASS_SELECTOR&&u.test(t.name)){const p=o.filter(a=>{const{name:c,type:f}=a;return f===r.PSEUDO_CLASS_SELECTOR&&u.test(c)});for(const{children:a}of p)for(const{children:c}of a)for(const{children:f}of c)e.has(f)&&e.delete(f)}else if(t.type===r.PSEUDO_ELEMENT_SELECTOR&&m.test(t.name)){const p=o.filter(a=>{const{name:c,type:f}=a;return f===r.PSEUDO_ELEMENT_SELECTOR&&m.test(c)});for(const{children:a}of p)for(const{children:c}of a)e.has(c)&&e.delete(c)}}}),[...e]};0&&(module.exports={generateCSS,parseSelector,preprocess,unescapeSelector,walkAST});
//# sourceMappingURL=parser.js.map
