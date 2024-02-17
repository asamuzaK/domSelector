var y=Object.defineProperty;var L=Object.getOwnPropertyDescriptor;var N=Object.getOwnPropertyNames;var S=Object.prototype.hasOwnProperty;var O=(x,t)=>{for(var e in t)y(x,e,{get:t[e],enumerable:!0})},P=(x,t,e,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of N(t))!S.call(x,r)&&r!==e&&y(x,r,{get:()=>t[r],enumerable:!(n=L(t,r))||n.enumerable});return x};var R=x=>P(y({},"__esModule",{value:!0}),x);var A={};O(A,{Matcher:()=>k,default:()=>_});module.exports=R(A);var $=require("./dom-util.js"),b=require("./parser.js"),i=require("./constant.js");class k{matchPseudoElementSelector(t,e={}){if(!t||typeof t!="string"){const d=`Unexpected type ${Object.prototype.toString.call(t).slice(i.TYPE_FROM,i.TYPE_TO)}`;throw new TypeError(d)}const{forgive:n,warn:r}=e;switch(t){case"after":case"backdrop":case"before":case"cue":case"cue-region":case"first-letter":case"first-line":case"file-selector-button":case"marker":case"placeholder":case"selection":case"target-text":{if(r){const s=`Unsupported pseudo-element ::${t}`;throw new DOMException(s,i.NOT_SUPPORTED_ERR)}break}case"part":case"slotted":{if(r){const s=`Unsupported pseudo-element ::${t}()`;throw new DOMException(s,i.NOT_SUPPORTED_ERR)}break}default:if(t.startsWith("-webkit-")){if(r){const s=`Unsupported pseudo-element ::${t}`;throw new DOMException(s,i.NOT_SUPPORTED_ERR)}}else if(!n){const s=`Unknown pseudo-element ::${t}`;throw new DOMException(s,i.SYNTAX_ERR)}}}_matchAttributeSelector(t,e){const{flags:n,matcher:r,name:s,value:d}=t;if(typeof n=="string"&&!/^[is]$/i.test(n)){const o=`Invalid selector ${(0,b.generateCSS)(t)}`;throw new DOMException(o,i.SYNTAX_ERR)}const{attributes:w}=e;let m;if(w&&w.length){const h=e.ownerDocument.contentType;let o;h==="text/html"?typeof n=="string"&&/^s$/i.test(n)?o=!1:o=!0:typeof n=="string"&&/^i$/i.test(n)?o=!0:o=!1;let g=(0,b.unescapeSelector)(s.name);o&&(g=g.toLowerCase());const c=new Set;if(g.indexOf("|")>-1){const{prefix:f,localName:p}=(0,b.parseAstName)(g);for(const a of w){let{name:l,value:u}=a;switch(o&&(l=l.toLowerCase(),u=u.toLowerCase()),f){case"":{p===l&&c.add(u);break}case"*":{l.indexOf(":")>-1?l.endsWith(`:${p}`)&&c.add(u):p===l&&c.add(u);break}default:if(l.indexOf(":")>-1){const[T,E]=l.split(":");if(T==="xml"&&E==="lang")continue;f===T&&p===E&&(0,$.isNamespaceDeclared)(f,e)&&c.add(u)}}}}else for(let{name:f,value:p}of w)if(o&&(f=f.toLowerCase(),p=p.toLowerCase()),f.indexOf(":")>-1){const[a,l]=f.split(":");if(a==="xml"&&l==="lang")continue;g===l&&c.add(p)}else g===f&&c.add(p);if(c.size){const{name:f,value:p}=d??{};let a;switch(f?o?a=f.toLowerCase():a=f:p?o?a=p.toLowerCase():a=p:p===""&&(a=p),r){case"=":{typeof a=="string"&&c.has(a)&&(m=e);break}case"~=":{if(a&&typeof a=="string"){for(const l of c)if(new Set(l.split(/\s+/)).has(a)){m=e;break}}break}case"|=":{if(a&&typeof a=="string"){let l;for(const u of c)if(u===a||u.startsWith(`${a}-`)){l=u;break}l&&(m=e)}break}case"^=":{if(a&&typeof a=="string"){let l;for(const u of c)if(u.startsWith(`${a}`)){l=u;break}l&&(m=e)}break}case"$=":{if(a&&typeof a=="string"){let l;for(const u of c)if(u.endsWith(`${a}`)){l=u;break}l&&(m=e)}break}case"*=":{if(a&&typeof a=="string"){let l;for(const u of c)if(u.includes(`${a}`)){l=u;break}l&&(m=e)}break}case null:default:m=e}}}return m??null}_matchTypeSelector(t,e,n={}){const r=(0,b.unescapeSelector)(t.name),{localName:s,namespaceURI:d,prefix:w}=e,{forgive:m}=n;let{prefix:h,localName:o}=(0,b.parseAstName)(r,e);e.ownerDocument.contentType==="text/html"&&(h=h.toLowerCase(),o=o.toLowerCase());let g,c;s.indexOf(":")>-1?[g,c]=s.split(":"):(g=w||"",c=s);let f;switch(h){case"":{!g&&!d&&(o==="*"||o===c)&&(f=e);break}case"*":{(o==="*"||o===c)&&(f=e);break}default:{const p=e.lookupNamespaceURI(h),a=e.lookupNamespaceURI(g);if(p===a&&h===g)(o==="*"||o===c)&&(f=e);else if(!m&&!p){const l=`Undeclared namespace ${h}`;throw new DOMException(l,i.SYNTAX_ERR)}}}return f??null}_matchDirectionPseudoClass(t,e){const n=(0,$.getDirectionality)(e);let r;return t.name===n&&(r=e),r??null}_matchLanguagePseudoClass(t,e){if(t.name===i.EMPTY)return null;const n=(0,b.unescapeSelector)(t.name);typeof n=="string"&&n!==t.name&&(t.name=n);let r;if(n==="*")if(e.hasAttribute("lang"))e.getAttribute("lang")&&(r=e);else{let s=e.parentNode;for(;s&&s.nodeType===i.ELEMENT_NODE;){if(s.hasAttribute("lang")){s.getAttribute("lang")&&(r=e);break}s=s.parentNode}}else if(n){const s=`(?:-${i.ALPHA_NUM})*`;if(new RegExp(`^(?:\\*-)?${i.ALPHA_NUM}${s}$`,"i").test(n)){let w;if(n.indexOf("-")>-1){const[m,h,...o]=n.split("-");let g;m==="*"?g=`${i.ALPHA_NUM}${s}`:g=`${m}${s}`;const c=`-${h}${s}`,f=o.length;let p="";if(f)for(let a=0;a<f;a++)p+=`-${o[a]}${s}`;w=new RegExp(`^${g}${c}${p}$`,"i")}else w=new RegExp(`^${n}${s}$`,"i");if(e.hasAttribute("lang"))w.test(e.getAttribute("lang"))&&(r=e);else{let m=e.parentNode;for(;m&&m.nodeType===i.ELEMENT_NODE;){if(m.hasAttribute("lang")){const h=m.getAttribute("lang");w.test(h)&&(r=e);break}m=m.parentNode}}}}return r??null}matchSelector(t,e,n){if(!t||!t.type){const d=`Unexpected node ${Object.prototype.toString.call(t).slice(i.TYPE_FROM,i.TYPE_TO)}`;throw new TypeError(d)}else if(!e||!e.nodeType){const d=`Unexpected node ${Object.prototype.toString.call(e).slice(i.TYPE_FROM,i.TYPE_TO)}`;throw new TypeError(d)}else if(e.nodeType!==i.ELEMENT_NODE){const s=`Unexpected node ${e.nodeName}`;throw new TypeError(s)}let r;switch(t.type){case i.SELECTOR_ATTR:{r=this._matchAttributeSelector(t,e);break}case i.SELECTOR_TYPE:{r=this._matchTypeSelector(t,e,n);break}default:{const{children:[s],name:d}=t;d==="dir"?r=this._matchDirectionPseudoClass(s,e):d==="lang"&&(r=this._matchLanguagePseudoClass(s,e))}}return r}}var _=new k;0&&(module.exports={Matcher});
//# sourceMappingURL=matcher.js.map
