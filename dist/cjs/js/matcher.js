var y=Object.defineProperty;var N=Object.getOwnPropertyDescriptor;var T=Object.getOwnPropertyNames;var L=Object.prototype.hasOwnProperty;var A=(x,t)=>{for(var e in t)y(x,e,{get:t[e],enumerable:!0})},S=(x,t,e,s)=>{if(t&&typeof t=="object"||typeof t=="function")for(let l of T(t))!L.call(x,l)&&l!==e&&y(x,l,{get:()=>t[l],enumerable:!(s=N(t,l))||s.enumerable});return x};var _=x=>S(y({},"__esModule",{value:!0}),x);var O={};A(O,{Matcher:()=>R});module.exports=_(O);var b=require("./parser.js"),$=require("./utility.js"),a=require("./constant.js");class R{matchPseudoElementSelector(t,e={}){if(!t||typeof t!="string")throw new TypeError(`Unexpected type ${(0,$.getType)(t)}`);const{forgive:s,warn:l}=e;switch(t){case"after":case"backdrop":case"before":case"cue":case"cue-region":case"first-letter":case"first-line":case"file-selector-button":case"marker":case"placeholder":case"selection":case"target-text":{if(l)throw new DOMException(`Unsupported pseudo-element ::${t}`,a.NOT_SUPPORTED_ERR);break}case"part":case"slotted":{if(l)throw new DOMException(`Unsupported pseudo-element ::${t}()`,a.NOT_SUPPORTED_ERR);break}default:if(t.startsWith("-webkit-")){if(l)throw new DOMException(`Unsupported pseudo-element ::${t}`,a.NOT_SUPPORTED_ERR)}else if(!s)throw new DOMException(`Unknown pseudo-element ::${t}`,a.SYNTAX_ERR)}}_matchAttributeSelector(t,e){const{flags:s,matcher:l,name:n,value:m}=t;if(typeof s=="string"&&!/^[is]$/i.test(s)){const g=(0,b.generateCSS)(t);throw new DOMException(`Invalid selector ${g}`,a.SYNTAX_ERR)}const{attributes:d}=e;let w;if(d&&d.length){const g=e.ownerDocument.contentType;let o;g==="text/html"?typeof s=="string"&&/^s$/i.test(s)?o=!1:o=!0:typeof s=="string"&&/^i$/i.test(s)?o=!0:o=!1;let h=(0,b.unescapeSelector)(n.name);o&&(h=h.toLowerCase());const f=new Set;if(h.indexOf("|")>-1){const{prefix:c,localName:u}=(0,b.parseAstName)(h);for(const i of d){let{name:r,value:p}=i;switch(o&&(r=r.toLowerCase(),p=p.toLowerCase()),c){case"":{u===r&&f.add(p);break}case"*":{r.indexOf(":")>-1?r.endsWith(`:${u}`)&&f.add(p):u===r&&f.add(p);break}default:if(r.indexOf(":")>-1){const[E,k]=r.split(":");if(E==="xml"&&k==="lang")continue;c===E&&u===k&&(0,$.isNamespaceDeclared)(c,e)&&f.add(p)}}}}else for(let{name:c,value:u}of d)if(o&&(c=c.toLowerCase(),u=u.toLowerCase()),c.indexOf(":")>-1){const[i,r]=c.split(":");if(i==="xml"&&r==="lang")continue;h===r&&f.add(u)}else h===c&&f.add(u);if(f.size){const{name:c,value:u}=m??{};let i;switch(c?o?i=c.toLowerCase():i=c:u?o?i=u.toLowerCase():i=u:u===""&&(i=u),l){case"=":{typeof i=="string"&&f.has(i)&&(w=e);break}case"~=":{if(i&&typeof i=="string"){for(const r of f)if(new Set(r.split(/\s+/)).has(i)){w=e;break}}break}case"|=":{if(i&&typeof i=="string"){let r;for(const p of f)if(p===i||p.startsWith(`${i}-`)){r=p;break}r&&(w=e)}break}case"^=":{if(i&&typeof i=="string"){let r;for(const p of f)if(p.startsWith(`${i}`)){r=p;break}r&&(w=e)}break}case"$=":{if(i&&typeof i=="string"){let r;for(const p of f)if(p.endsWith(`${i}`)){r=p;break}r&&(w=e)}break}case"*=":{if(i&&typeof i=="string"){let r;for(const p of f)if(p.includes(`${i}`)){r=p;break}r&&(w=e)}break}case null:default:w=e}}}return w??null}_matchTypeSelector(t,e,s={}){const l=(0,b.unescapeSelector)(t.name),{localName:n,namespaceURI:m,prefix:d}=e,{forgive:w}=s;let{prefix:g,localName:o}=(0,b.parseAstName)(l,e);e.ownerDocument.contentType==="text/html"&&a.REG_TAG_NAME.test(n)&&(g=g.toLowerCase(),o=o.toLowerCase());let h,f;n.indexOf(":")>-1?[h,f]=n.split(":"):(h=d||"",f=n);let c;switch(g){case"":{!h&&!m&&(o==="*"||o===f)&&(c=e);break}case"*":{(o==="*"||o===f)&&(c=e);break}default:{const u=e.lookupNamespaceURI(g),i=e.lookupNamespaceURI(h);if(u===i&&g===h)(o==="*"||o===f)&&(c=e);else if(!w&&!u)throw new DOMException(`Undeclared namespace ${g}`,a.SYNTAX_ERR)}}return c??null}_matchDirectionPseudoClass(t,e){const s=(0,$.getDirectionality)(e);let l;return t.name===s&&(l=e),l??null}_matchLanguagePseudoClass(t,e){if(t.name===a.EMPTY)return null;const s=(0,b.unescapeSelector)(t.name);typeof s=="string"&&s!==t.name&&(t.name=s);let l;if(s==="*")if(e.hasAttribute("lang"))e.getAttribute("lang")&&(l=e);else{let n=e.parentNode;for(;n&&n.nodeType===a.ELEMENT_NODE;){if(n.hasAttribute("lang")){n.getAttribute("lang")&&(l=e);break}n=n.parentNode}}else if(s&&a.REG_LANG.test(s)){let n;if(s.indexOf("-")>-1){const[m,d,...w]=s.split("-");let g;m==="*"?g=`${a.ALPHA_NUM}${a.LANG_PART}`:g=`${m}${a.LANG_PART}`;const o=`-${d}${a.LANG_PART}`,h=w.length;let f="";if(h)for(let c=0;c<h;c++)f+=`-${w[c]}${a.LANG_PART}`;n=new RegExp(`^${g}${o}${f}$`,"i")}else n=new RegExp(`^${s}${a.LANG_PART}$`,"i");if(e.hasAttribute("lang"))n.test(e.getAttribute("lang"))&&(l=e);else{let m=e.parentNode;for(;m&&m.nodeType===a.ELEMENT_NODE;){if(m.hasAttribute("lang")){const d=m.getAttribute("lang");n.test(d)&&(l=e);break}m=m.parentNode}}}return l??null}matchSelector(t,e,s={},l=!1){if(!l){if(!t||!t.type)throw new TypeError(`Unexpected ast type ${(0,$.getType)(t)}`);if(!e||!e.nodeType)throw new TypeError(`Unexpected node type ${(0,$.getType)(e)}`);if(e.nodeType!==a.ELEMENT_NODE)throw new TypeError(`Unexpected node ${e.nodeName}`)}let n;switch(t.type){case a.SELECTOR_ATTR:{n=this._matchAttributeSelector(t,e);break}case a.SELECTOR_TYPE:{n=this._matchTypeSelector(t,e,s??{});break}default:{const{children:[m],name:d}=t;d==="dir"?n=this._matchDirectionPseudoClass(m,e):d==="lang"&&(n=this._matchLanguagePseudoClass(m,e))}}return n}}0&&(module.exports={Matcher});
//# sourceMappingURL=matcher.js.map
