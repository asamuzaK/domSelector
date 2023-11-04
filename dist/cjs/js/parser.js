var u=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var w=Object.getOwnPropertyNames;var O=Object.prototype.hasOwnProperty;var $=(n,e)=>{for(var s in e)u(n,s,{get:e[s],enumerable:!0})},D=(n,e,s,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let t of w(e))!O.call(n,t)&&t!==s&&u(n,t,{get:()=>e[t],enumerable:!(o=m(e,t))||o.enumerable});return n};var P=n=>D(u({},"__esModule",{value:!0}),n);var A={};$(A,{generateCSS:()=>S.generate,parseSelector:()=>F,preprocess:()=>x,unescapeSelector:()=>b,walkAST:()=>_});module.exports=P(A);var c=require("css-tree"),r=require("./constant.js"),S=require("css-tree");const C=parseInt("10000",16),y=16,E=2,T=/^([\da-f]{1,6}\s?)/i,g=/^(?:(?:ha|i)s|not|where)$/,I=/^[\n\r\f]/,b=(n="")=>{if(typeof n=="string"&&n.indexOf("\\",0)>=0){const e=n.split("\\"),s=e.length;for(let o=1;o<s;o++){let t=e[o];if(o===s-1&&t==="")t="\uFFFD";else{const l=T.exec(t);if(l){const[,i]=l;let a;try{const p=parseInt("D800",16),h=parseInt("DFFF",16),d=parseInt(i,16);d===0||d>=p&&d<=h?a="\uFFFD":a=String.fromCodePoint(d)}catch{a="\uFFFD"}let f="";t.length>i.length&&(f=t.substring(i.length)),t=`${a}${f}`}else I.test(t)&&(t="\\"+t)}e[o]=t}n=e.join("")}return n},x=(...n)=>{if(!n.length)throw new TypeError("1 argument required, but only 0 present.");let[e]=n;if(typeof e=="string"){let s=0;for(;s>=0&&(s=e.indexOf("#",s),!(s<0));){const o=e.substring(0,s+1);let t=e.substring(s+1);const l=t.codePointAt(0);if(l>=C){const i=`\\${l.toString(y)} `;t.length===E?t=i:t=`${i}${t.substring(E)}`}e=`${o}${t}`,s++}e=e.replace(/\f|\r\n?/g,`
`).replace(/[\0\uD800-\uDFFF]|\\$/g,"\uFFFD")}else if(e==null)e=Object.prototype.toString.call(e).slice(r.TYPE_FROM,r.TYPE_TO).toLowerCase();else throw new DOMException(`Invalid selector ${e}`,r.SYNTAX_ERR);return e},F=n=>{if(n=x(n),/^$|^\s*>|,\s*$/.test(n))throw new DOMException(`Invalid selector ${n}`,r.SYNTAX_ERR);let e;try{const s=(0,c.parse)(n,{context:"selectorList",parseCustomProperty:!0});e=(0,c.toPlainObject)(s)}catch(s){if(s.message==='"]" is expected'&&!n.endsWith("]"))e=F(`${n}]`);else if(s.message==='")" is expected'&&!n.endsWith(")"))e=F(`${n})`);else throw new DOMException(s.message,r.SYNTAX_ERR)}return e},_=(n={})=>{const e=new Set;let s;return(0,c.walk)(n,{enter:t=>{t.type===r.SELECTOR?e.add(t.children):t.type===r.PSEUDO_CLASS_SELECTOR&&g.test(t.name)&&(s=!0)}}),s&&(0,c.findAll)(n,(t,l,i)=>{if(t.type===r.PSEUDO_CLASS_SELECTOR&&g.test(t.name)&&i){const a=i.filter(f=>{const{name:p,type:h}=f;return h===r.PSEUDO_CLASS_SELECTOR&&g.test(p)});for(const{children:f}of a)for(const{children:p}of f)for(const{children:h}of p)e.has(h)&&e.delete(h)}}),[...e]};0&&(module.exports={generateCSS,parseSelector,preprocess,unescapeSelector,walkAST});
//# sourceMappingURL=parser.js.map
