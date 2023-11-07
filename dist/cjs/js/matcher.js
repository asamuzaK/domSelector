var V=Object.create;var L=Object.defineProperty;var j=Object.getOwnPropertyDescriptor;var H=Object.getOwnPropertyNames;var W=Object.getPrototypeOf,q=Object.prototype.hasOwnProperty;var G=(y,a)=>{for(var e in a)L(y,e,{get:a[e],enumerable:!0})},P=(y,a,e,n)=>{if(a&&typeof a=="object"||typeof a=="function")for(let f of H(a))!q.call(y,f)&&f!==e&&L(y,f,{get:()=>a[f],enumerable:!(n=j(a,f))||n.enumerable});return y};var Y=(y,a,e)=>(e=y!=null?V(W(y)):{},P(a||!y||!y.__esModule?L(e,"default",{value:y,enumerable:!0}):e,y)),X=y=>P(L({},"__esModule",{value:!0}),y);var Q={};G(Q,{Matcher:()=>J});module.exports=X(Q);var D=Y(require("is-potential-custom-element-name"),1),g=require("./dom-util.js"),k=require("./parser.js"),b=require("./constant.js");const C="all",A="first",S="lineal",v="self",M=/^(?:(?:fieldse|inpu|selec)t|button|opt(?:group|ion)|textarea)$/,O=/^(?:(?:(?:in|out)pu|selec)t|button|form|textarea)$/,R=/^a(?:rea)?$/,U=/^d(?:etails|ialog)$/,$=/^(?:checkbox|radio)$/,x=/^(?:(?:emai|te|ur)l|number|password|search|text)$/,B=/(?:(?:rang|tim)e|date(?:time-local)?|month|number|week)$/,z=/^(?:button|reset)$/,F=/^(?:image|submit)$/,I=/^(?:date(?:time-local)?|month|time|week)$/,Z=/^(?:(?:ha|i)s|not|where)$/,K=/^nth-(?:last-)?(?:child|of-type)$/;class J{#a;#i;#e;#r;#t;#o;#l;#s;constructor(a,e,n={}){const{sort:f,warn:h}=n;this.#o=a,this.#e=e,[this.#a,this.#r]=this._prepare(a),this.#t=this._getRoot(e),this.#i=new WeakMap,this.#l=!!f,this.#s=!!h}_onError(a){if(a instanceof DOMException&&a.name===b.NOT_SUPPORTED_ERR)this.#s&&console.warn(a.message);else throw a}_getRoot(a=this.#e){let e,n;switch(a.nodeType){case b.DOCUMENT_NODE:{e=a,n=a;break}case b.DOCUMENT_FRAGMENT_NODE:{e=a.ownerDocument,n=a;break}case b.ELEMENT_NODE:{if((0,g.isSameOrDescendant)(a))e=a.ownerDocument,n=a.ownerDocument;else{let f=a;for(;f&&f.parentNode;)f=f.parentNode;e=f.ownerDocument,n=f}break}default:throw new TypeError(`Unexpected node ${a.nodeName}`)}return{document:e,root:n}}_sortLeaves(a){const e=[...a];if(e.length>1){const n=new Map([[b.ATTRIBUTE_SELECTOR,b.BIT_10000],[b.CLASS_SELECTOR,b.BIT_100],[b.ID_SELECTOR,b.BIT_10],[b.PSEUDO_CLASS_SELECTOR,b.BIT_100000],[b.PSEUDO_ELEMENT_SELECTOR,b.BIT_1],[b.TYPE_SELECTOR,b.BIT_1000]]);e.sort((f,h)=>{const{type:d}=f,{type:p}=h,u=n.get(d),t=n.get(p);let i;return u===t?i=0:u>t?i=1:i=-1,i})}return e}_prepare(a=this.#o){const e=(0,k.parseSelector)(a),n=(0,k.walkAST)(e),f=[],h=[];let d=0;for(const[...p]of n){const u=[];let t=p.shift();if(t&&t.type!==b.COMBINATOR){const i=new Set;for(;t;){if(t.type===b.COMBINATOR){const[l]=p;if(l.type===b.COMBINATOR){const c=`Invalid combinator ${t.name}${l.name}`;throw new DOMException(c,b.SYNTAX_ERR)}u.push({combo:t,leaves:this._sortLeaves(i)}),i.clear()}else t&&i.add(t);if(p.length)t=p.shift();else{u.push({combo:null,leaves:this._sortLeaves(i)}),i.clear();break}}}f.push({branch:u,skip:!1}),h[d]=new Set,d++}return[f,h]}_collectNthChild(a,e){const{a:n,b:f,reverse:h,selector:d}=a,{parentNode:p}=e,u=new Set;let t;if(d&&(this.#i.has(d)?t=this.#i.get(d):(t=(0,k.walkAST)(d),this.#i.set(d,t))),p){const i=[...p.children],l=i.length;if(l){const c=new Set;if(t){const o=t.length;for(const s of i){let r;for(let m=0;m<o;m++){const N=t[m];if(r=this._matchLeaves(N,s),!r)break}r&&c.add(s)}}if(h&&i.reverse(),n===0){if(f>0&&f<=l){if(c.size)for(let o=0;o<l;o++){const s=i[o];if(c.has(s)){u.add(s);break}}else if(!d){const o=i[f-1];u.add(o)}}}else{let o=0,s=f-1;if(n>0)for(;s<0;)s+=++o*n;if(s>=0&&s<l){let r=n>0?0:f-1;for(let m=0;m<l&&s>=0&&s<l;m++){const N=i[m];c.size?c.has(N)&&(r===s&&(u.add(N),s+=n),n>0?r++:r--):m===s&&(d||u.add(N),s+=n)}}}}}else{const{root:i}=this.#t;if(i.nodeType===b.ELEMENT_NODE&&e===i&&n+f===1)if(t){const l=t.length;let c;for(let o=0;o<l;o++){const s=t[o];if(c=this._matchLeaves(s,e),c)break}c&&u.add(e)}else u.add(e)}return u}_collectNthOfType(a,e){const{a:n,b:f,reverse:h}=a,{localName:d,parentNode:p,prefix:u}=e,t=new Set;if(p){const i=[...p.children],l=i.length;if(l)if(h&&i.reverse(),n===0){if(f>0&&f<=l){let c=0;for(let o=0;o<l;o++){const s=i[o],{localName:r,prefix:m}=s;if(r===d&&m===u){if(c===f-1){t.add(s);break}c++}}}}else{let c=f-1;if(n>0)for(;c<0;)c+=n;if(c>=0&&c<l){let o=n>0?0:f-1;for(let s=0;s<l;s++){const r=i[s],{localName:m,prefix:N}=r;if(m===d&&N===u){if(o===c&&(t.add(r),c+=n),c<0||c>=l)break;n>0?o++:o--}}}}}else{const{root:i}=this.#t;i.nodeType===b.ELEMENT_NODE&&e===i&&n+f===1&&t.add(e)}return t}_matchAnPlusB(a,e,n){const{nth:{a:f,b:h,name:d},selector:p}=a,u=(0,k.unescapeSelector)(d),t=new Map;u?(u==="even"?(t.set("a",2),t.set("b",0)):u==="odd"&&(t.set("a",2),t.set("b",1)),/last/.test(n)&&t.set("reverse",!0)):(typeof f=="string"&&/-?\d+/.test(f)?t.set("a",f*1):t.set("a",0),typeof h=="string"&&/-?\d+/.test(h)?t.set("b",h*1):t.set("b",0),/last/.test(n)&&t.set("reverse",!0));let i=new Set;if(t.has("a")&&t.has("b")){if(/^nth-(?:last-)?child$/.test(n)){p&&t.set("selector",p);const l=Object.fromEntries(t),c=this._collectNthChild(l,e);c.size&&(i=c)}else if(/^nth-(?:last-)?of-type$/.test(n)){const l=Object.fromEntries(t),c=this._collectNthOfType(l,e);c.size&&(i=c)}}return i}_matchPseudoElementSelector(a,e={}){const{forgive:n}=e;switch(a){case"after":case"backdrop":case"before":case"cue":case"cue-region":case"first-letter":case"first-line":case"file-selector-button":case"marker":case"part":case"placeholder":case"selection":case"slotted":case"target-text":{if(this.#s)throw new DOMException(`Unsupported pseudo-element ::${a}`,b.NOT_SUPPORTED_ERR);break}default:if(a.startsWith("-webkit-")){if(this.#s)throw new DOMException(`Unsupported pseudo-element ::${a}`,b.NOT_SUPPORTED_ERR)}else if(!n)throw new DOMException(`Unknown pseudo-element ::${a}`,b.SYNTAX_ERR)}}_matchDirectionPseudoClass(a,e){const n=(0,k.unescapeSelector)(a.name),f=(0,g.getDirectionality)(e);let h;return n===f&&(h=e),h??null}_matchLanguagePseudoClass(a,e){const{lang:n}=e,f=(0,k.unescapeSelector)(a.name);let h;if(f==="")e.getAttribute("lang")===""&&(h=e);else if(f==="*")e.hasAttribute("lang")||(h=e);else if(/[A-Z\d-]+/i.test(f)){const d="(?:-[A-Za-z\\d]+)?";let p;if(/-/.test(f)){const[u,t,...i]=f.split("-"),l=`${u}${d}`,c=`-${t}${d}`,o=i.length;let s="";if(o)for(let r=0;r<o;r++)s+=`-${i[r]}${d}`;p=new RegExp(`^${l}${c}${s}$`,"i")}else p=new RegExp(`^${f}${d}$`,"i");if(n)p.test(n)&&(h=e);else{let u=e;for(;u;){if(p.test(u.lang)){h=e;break}u=u.parentNode}}}return h??null}_matchHasPseudoFunc(a,e){let n;if(Array.isArray(a)&&a.length){const[f]=a,{type:h}=f;let d;h===b.COMBINATOR?d=a.shift():d={name:" ",type:b.COMBINATOR};const p=[];for(;a.length;){const[i]=a,{type:l}=i;if(l===b.COMBINATOR)break;p.push(a.shift())}const u={combo:d,leaves:p},t=this._matchCombinator(u,e,{find:"next"});if(t.size)if(a.length){for(const i of t)if(n=this._matchHasPseudoFunc(Object.assign([],a),i),n)break}else n=!0}return!!n}_matchLogicalPseudoFunc(a,e){const{astName:n="",branches:f=[],selector:h="",twigBranches:d=[]}=a;let p;if(n==="has")if(h.includes(":has("))p=null;else{let u;const t=f.length;for(let i=0;i<t;i++){const l=f[i];if(u=this._matchHasPseudoFunc(Object.assign([],l),e),u)break}u&&(p=e)}else{const u=/^(?:is|where)$/.test(n);let t;const i=d.length;for(let l=0;l<i;l++){const c=d[l],o=c.length-1,{leaves:s}=c[o];if(t=this._matchLeaves(s,e,{forgive:u}),t&&o>0){let r=new Set([e]);for(let m=o-1;m>=0;m--){const N=c[m],w=[];for(const E of r){const T=this._matchCombinator(N,E,{forgive:u,find:"prev"});T.size&&w.push(...T)}const _=new Set(w);if(_.size)if(m===0){t=!0;break}else r=_;else{t=!1;break}}}if(t)break}n==="not"?t||(p=e):t&&(p=e)}return p??null}_matchPseudoClassSelector(a,e,n={}){const{children:f}=a,{localName:h,parentNode:d}=e,{forgive:p}=n,u=(0,k.unescapeSelector)(a.name);let t=new Set;if(Z.test(u)){let i;if(this.#i.has(a))i=this.#i.get(a);else{const c=(0,k.walkAST)(a),o=[],s=[];for(const[...r]of c){for(const _ of r){const E=(0,k.generateCSS)(_);o.push(E)}const m=[],N=new Set;let w=r.shift();for(;w;)if(w.type===b.COMBINATOR?(m.push({combo:w,leaves:[...N]}),N.clear()):w&&N.add(w),r.length)w=r.shift();else{m.push({combo:null,leaves:[...N]}),N.clear();break}s.push(m)}i={astName:u,branches:c,twigBranches:s,selector:o.join(",")},this.#i.set(a,i)}const l=this._matchLogicalPseudoFunc(i,e);l&&t.add(l)}else if(Array.isArray(f)){const[i]=f;if(K.test(u)){const l=this._matchAnPlusB(i,e,u);l.size&&(t=l)}else if(u==="dir"){const l=this._matchDirectionPseudoClass(i,e);l&&t.add(l)}else if(u==="lang"){const l=this._matchLanguagePseudoClass(i,e);l&&t.add(l)}else switch(u){case"current":case"nth-col":case"nth-last-col":{if(this.#s)throw new DOMException(`Unsupported pseudo-class :${u}()`,b.NOT_SUPPORTED_ERR);break}default:if(!p)throw new DOMException(`Unknown pseudo-class :${u}()`,b.SYNTAX_ERR)}}else{const{document:i,root:l}=this.#t,{documentElement:c}=i,o=new URL(i.URL);switch(u){case"any-link":case"link":{R.test(h)&&e.hasAttribute("href")&&t.add(e);break}case"local-link":{if(R.test(h)&&e.hasAttribute("href")){const s=new URL(e.getAttribute("href"),o.href);s.origin===o.origin&&s.pathname===o.pathname&&t.add(e)}break}case"visited":break;case"target":{(0,g.isSameOrDescendant)(e)&&o.hash&&e.id&&o.hash===`#${e.id}`&&t.add(e);break}case"target-within":{if(o.hash){const s=o.hash.replace(/^#/,"");let r=i.getElementById(s);for(;r;){if(r===e){t.add(e);break}r=r.parentNode}}break}case"scope":{this.#e.nodeType===b.ELEMENT_NODE?e===this.#e&&t.add(e):e===c&&t.add(e);break}case"focus":{e===i.activeElement&&t.add(e);break}case"focus-within":{let s=i.activeElement;for(;s;){if(s===e){t.add(e);break}s=s.parentNode}break}case"open":{U.test(h)&&e.hasAttribute("open")&&t.add(e);break}case"closed":{U.test(h)&&!e.hasAttribute("open")&&t.add(e);break}case"disabled":{if(M.test(h)||(0,D.default)(h))if(e.disabled||e.hasAttribute("disabled"))t.add(e);else{let s=d;for(;s&&s.localName!=="fieldset";)s=s.parentNode;s&&s.hasAttribute("disabled")&&d.localName!=="legend"&&t.add(e)}break}case"enabled":{(M.test(h)||(0,D.default)(h))&&!(e.disabled&&e.hasAttribute("disabled"))&&t.add(e);break}case"read-only":{switch(h){case"textarea":{(e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled"))&&t.add(e);break}case"input":{(!e.type||x.test(e.type)||I.test(e.type))&&(e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled"))&&t.add(e);break}default:(0,g.isContentEditable)(e)||t.add(e)}break}case"read-write":{switch(h){case"textarea":{e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled")||t.add(e);break}case"input":{(!e.type||x.test(e.type)||I.test(e.type))&&!(e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled"))&&t.add(e);break}default:(0,g.isContentEditable)(e)&&t.add(e)}break}case"placeholder-shown":{let s;h==="textarea"?s=e:h==="input"&&(e.hasAttribute("type")?x.test(e.getAttribute("type"))&&(s=e):s=e),s&&e.hasAttribute("placeholder")&&e.getAttribute("placeholder").trim().length&&e.value===""&&t.add(e);break}case"checked":{(h==="input"&&e.hasAttribute("type")&&$.test(e.getAttribute("type"))&&e.checked||h==="option"&&e.selected)&&t.add(e);break}case"indeterminate":{if(h==="input"&&e.type==="checkbox"&&e.indeterminate||h==="progress"&&!e.hasAttribute("value"))t.add(e);else if(h==="input"&&e.type==="radio"&&!e.hasAttribute("checked")){const s=e.name;let r=e.parentNode;for(;r&&r.localName!=="form";)r=r.parentNode;r||(r=c);const m=[...r.getElementsByTagName("input")];let N;for(const w of m)if(w.getAttribute("type")==="radio"&&(s?w.getAttribute("name")===s&&(N=!!w.checked):w.hasAttribute("name")||(N=!!w.checked),N))break;N||t.add(e)}break}case"default":{if(h==="button"&&!(e.hasAttribute("type")&&z.test(e.getAttribute("type")))||h==="input"&&e.hasAttribute("type")&&F.test(e.getAttribute("type"))){let s=e.parentNode;for(;s&&s.localName!=="form";)s=s.parentNode;if(s){const r=i.createNodeIterator(s,b.SHOW_ELEMENT);let m=r.nextNode();for(;m;){const N=m.localName;let w;if(N==="button"?w=!(m.hasAttribute("type")&&z.test(m.getAttribute("type"))):N==="input"&&(w=m.hasAttribute("type")&&F.test(m.getAttribute("type"))),w){m===e&&t.add(e);break}m=r.nextNode()}}}else if(h==="input"&&e.hasAttribute("type")&&$.test(e.getAttribute("type"))&&e.hasAttribute("checked"))t.add(e);else if(h==="option"){let s=!1,r=d;for(;r&&r.localName!=="datalist";){if(r.localName==="select"){s=!!r.multiple;break}r=r.parentNode}if(s){if(this.#s)throw new DOMException(`Unsupported pseudo-class :${u}`,b.NOT_SUPPORTED_ERR)}else{const m=d.firstElementChild,N=new Set;let w=m;for(;w;){if(w.hasAttribute("selected")){N.add(w);break}w=w.nextElementSibling}N.size||N.add(m),N.has(e)&&t.add(e)}}break}case"valid":{if(O.test(h))e.checkValidity()&&t.add(e);else if(/^fieldset$/.test(h)){const s=i.createNodeIterator(e,b.SHOW_ELEMENT);let r=s.nextNode();r===e&&(r=s.nextNode());let m;for(;r&&!(O.test(r.localName)&&(m=r.checkValidity(),!m));)r=s.nextNode();m&&t.add(e)}break}case"invalid":{if(O.test(h))e.checkValidity()||t.add(e);else if(/^fieldset$/.test(h)){const s=i.createNodeIterator(e,b.SHOW_ELEMENT);let r=s.nextNode();r===e&&(r=s.nextNode());let m;for(;r&&!(O.test(r.localName)&&(m=r.checkValidity(),!m));)r=s.nextNode();m||t.add(e)}break}case"in-range":{h==="input"&&!(e.readonly||e.hasAttribute("readonly"))&&!(e.disabled||e.hasAttribute("disabled"))&&e.hasAttribute("type")&&B.test(e.getAttribute("type"))&&!(e.validity.rangeUnderflow||e.validity.rangeOverflow)&&(e.hasAttribute("min")||e.hasAttribute("max")||e.getAttribute("type")==="range")&&t.add(e);break}case"out-of-range":{h==="input"&&!(e.readonly||e.hasAttribute("readonly"))&&!(e.disabled||e.hasAttribute("disabled"))&&e.hasAttribute("type")&&B.test(e.getAttribute("type"))&&(e.validity.rangeUnderflow||e.validity.rangeOverflow)&&t.add(e);break}case"required":{let s;if(/^(?:select|textarea)$/.test(h))s=e;else if(h==="input")if(e.hasAttribute("type")){const r=e.getAttribute("type");(x.test(r)||$.test(r)||I.test(r)||r==="file")&&(s=e)}else s=e;s&&(e.required||e.hasAttribute("required"))&&t.add(e);break}case"optional":{let s;if(/^(?:select|textarea)$/.test(h))s=e;else if(h==="input")if(e.hasAttribute("type")){const r=e.getAttribute("type");(x.test(r)||$.test(r)||I.test(r)||r==="file")&&(s=e)}else s=e;s&&!(e.required||e.hasAttribute("required"))&&t.add(e);break}case"root":{e===c&&t.add(e);break}case"empty":{if(e.hasChildNodes()){const s=e.childNodes.values();let r;for(const m of s)if(r=m.nodeType!==b.ELEMENT_NODE&&m.nodeType!==b.TEXT_NODE,!r)break;r&&t.add(e)}else t.add(e);break}case"first-child":{(d&&e===d.firstElementChild||l.nodeType===b.ELEMENT_NODE&&e===l)&&t.add(e);break}case"last-child":{(d&&e===d.lastElementChild||l.nodeType===b.ELEMENT_NODE&&e===l)&&t.add(e);break}case"only-child":{(d&&e===d.firstElementChild&&e===d.lastElementChild||l.nodeType===b.ELEMENT_NODE&&e===l)&&t.add(e);break}case"first-of-type":{if(d){const[s]=this._collectNthOfType({a:0,b:1},e);s&&t.add(s)}else l.nodeType===b.ELEMENT_NODE&&e===l&&t.add(e);break}case"last-of-type":{if(d){const[s]=this._collectNthOfType({a:0,b:1,reverse:!0},e);s&&t.add(s)}else l.nodeType===b.ELEMENT_NODE&&e===l&&t.add(e);break}case"only-of-type":{if(d){const[s]=this._collectNthOfType({a:0,b:1},e);if(s===e){const[r]=this._collectNthOfType({a:0,b:1,reverse:!0},e);r===e&&t.add(e)}}else l.nodeType===b.ELEMENT_NODE&&e===l&&t.add(e);break}case"after":case"before":case"first-letter":case"first-line":{if(this.#s)throw new DOMException(`Unsupported pseudo-element ::${u}`,b.NOT_SUPPORTED_ERR);break}case"active":case"autofill":case"blank":case"buffering":case"current":case"focus-visible":case"fullscreen":case"future":case"hover":case"modal":case"muted":case"past":case"paused":case"picture-in-picture":case"playing":case"seeking":case"stalled":case"user-invalid":case"user-valid":case"volume-locked":case"-webkit-autofill":{if(this.#s)throw new DOMException(`Unsupported pseudo-class :${u}`,b.NOT_SUPPORTED_ERR);break}default:if(u.startsWith("-webkit-")){if(this.#s)throw new DOMException(`Unsupported pseudo-class :${u}`,b.NOT_SUPPORTED_ERR)}else if(!p)throw new DOMException(`Unknown pseudo-class :${u}`,b.SYNTAX_ERR)}}return t}_matchAttributeSelector(a,e){const{flags:n,matcher:f,name:h,value:d}=a;if(typeof n=="string"&&!/^[is]$/i.test(n))throw new DOMException("Invalid attribute selector",b.SYNTAX_ERR);const{attributes:p}=e;let u;if(p&&p.length){const{document:t}=this.#t;let i;t.contentType==="text/html"?typeof n=="string"&&/^s$/i.test(n)?i=!1:i=!0:typeof n=="string"&&/^i$/i.test(n)?i=!0:i=!1;let{name:l}=h;l=(0,k.unescapeSelector)(l),i&&(l=l.toLowerCase());const c=new Set;if(/\|/.test(l)){const{prefix:o,tagName:s}=(0,g.selectorToNodeProps)(l);for(let{name:r,value:m}of p)switch(i&&(r=r.toLowerCase(),m=m.toLowerCase()),o){case"":{s===r&&c.add(m);break}case"*":{/:/.test(r)?r.endsWith(`:${s}`)&&c.add(m):s===r&&c.add(m);break}default:if(/:/.test(r)){const[N,w]=r.split(":");o===N&&s===w&&(0,g.isNamespaceDeclared)(o,e)&&c.add(m)}}}else for(let{name:o,value:s}of p)if(i&&(o=o.toLowerCase(),s=s.toLowerCase()),/:/.test(o)){const[,r]=o.split(":");l===r&&c.add(s)}else l===o&&c.add(s);if(c.size){const{name:o,value:s}=d||{};let r;switch(o?i?r=o.toLowerCase():r=o:s?i?r=s.toLowerCase():r=s:s===""&&(r=s),f){case"=":{typeof r=="string"&&c.has(r)&&(u=e);break}case"~=":{if(r&&typeof r=="string"){for(const m of c)if(new Set(m.split(/\s+/)).has(r)){u=e;break}}break}case"|=":{if(r&&typeof r=="string"){let m;for(const N of c)if(N===r||N.startsWith(`${r}-`)){m=N;break}m&&(u=e)}break}case"^=":{if(r&&typeof r=="string"){let m;for(const N of c)if(N.startsWith(`${r}`)){m=N;break}m&&(u=e)}break}case"$=":{if(r&&typeof r=="string"){let m;for(const N of c)if(N.endsWith(`${r}`)){m=N;break}m&&(u=e)}break}case"*=":{if(r&&typeof r=="string"){let m;for(const N of c)if(N.includes(`${r}`)){m=N;break}m&&(u=e)}break}case null:default:u=e}}}return u??null}_matchClassSelector(a,e){const n=(0,k.unescapeSelector)(a.name);let f;return e.classList.contains(n)&&(f=e),f??null}_matchIDSelector(a,e){const{id:n}=e,f=(0,k.unescapeSelector)(a.name);let h;return f===n&&(h=e),h??null}_matchTypeSelector(a,e){const n=(0,k.unescapeSelector)(a.name),{localName:f,prefix:h}=e,{document:d}=this.#t;let{prefix:p,tagName:u}=(0,g.selectorToNodeProps)(n,e);d.contentType==="text/html"&&(p=p.toLowerCase(),u=u.toLowerCase());let t,i;/:/.test(f)?[t,i]=f.split(":"):(t=h||"",i=f);let l;return p===""&&t===""?e.namespaceURI===null&&(u==="*"||u===i)&&(l=e):p==="*"?(u==="*"||u===i)&&(l=e):p===t&&(0,g.isNamespaceDeclared)(p,e)&&(u==="*"||u===i)&&(l=e),l??null}_matchSelector(a,e,n){const{type:f}=a;let h=new Set;if(e.nodeType===b.ELEMENT_NODE)switch(f){case b.ATTRIBUTE_SELECTOR:{const d=this._matchAttributeSelector(a,e);d&&h.add(d);break}case b.CLASS_SELECTOR:{const d=this._matchClassSelector(a,e);d&&h.add(d);break}case b.ID_SELECTOR:{const d=this._matchIDSelector(a,e);d&&h.add(d);break}case b.PSEUDO_CLASS_SELECTOR:{const d=this._matchPseudoClassSelector(a,e,n);d.size&&(h=d);break}case b.PSEUDO_ELEMENT_SELECTOR:{const d=(0,k.unescapeSelector)(a.name);this._matchPseudoElementSelector(d,n);break}case b.TYPE_SELECTOR:default:{const d=this._matchTypeSelector(a,e);d&&h.add(d)}}return h}_matchLeaves(a,e,n){let f;for(const h of a)if(f=this._matchSelector(h,e,n).has(e),!f)break;return!!f}_findDescendantNodes(a,e){const[n,...f]=a,{type:h}=n,d=(0,k.unescapeSelector)(n.name),p=f.length>0,{document:u,root:t}=this.#t;let i=new Set,l=!1;switch(h){case b.ID_SELECTOR:{if(t.nodeType===b.ELEMENT_NODE)l=!0;else{const c=t.getElementById(d);if(c&&c!==e){const o=(0,g.isSameOrDescendant)(c,e);let s;o&&(s=c),s&&(p?this._matchLeaves(f,s)&&i.add(s):i.add(s))}}break}case b.CLASS_SELECTOR:{const c=[...e.getElementsByClassName(d)];if(c.length)if(p)for(const o of c)this._matchLeaves(f,o)&&i.add(o);else i=new Set(c);break}case b.TYPE_SELECTOR:{if(u.contentType!=="text/html"||/[*|]/.test(d))l=!0;else{const c=[...e.getElementsByTagName(d)];if(c.length)if(p)for(const o of c)this._matchLeaves(f,o)&&i.add(o);else i=new Set(c)}break}case b.PSEUDO_ELEMENT_SELECTOR:{this._matchPseudoElementSelector(d);break}default:l=!0}return{nodes:i,pending:l}}_matchCombinator(a,e,n={}){const{combo:f,leaves:h}=a,{name:d}=f,{find:p,forgive:u}=n;let t=new Set;if(p==="next")switch(d){case"+":{const i=e.nextElementSibling;i&&this._matchLeaves(h,i)&&t.add(i);break}case"~":{let i=e.nextElementSibling;for(;i;)this._matchLeaves(h,i)&&t.add(i),i=i.nextElementSibling;break}case">":{const i=[...e.children];for(const l of i)this._matchLeaves(h,l)&&t.add(l);break}case" ":default:{const{nodes:i,pending:l}=this._findDescendantNodes(h,e);if(i.size)t=i;else if(l){const{document:c}=this.#t,o=c.createNodeIterator(e,b.SHOW_ELEMENT);let s=o.nextNode();for(s===e&&(s=o.nextNode());s;)this._matchLeaves(h,s)&&t.add(s),s=o.nextNode()}}}else switch(d){case"+":{const i=e.previousElementSibling;i&&this._matchLeaves(h,i,{forgive:u})&&t.add(i);break}case"~":{const i=[];let l=e.previousElementSibling;for(;l;)this._matchLeaves(h,l,{forgive:u})&&i.push(l),l=l.previousElementSibling;i.length&&(t=new Set(i.reverse()));break}case">":{const i=e.parentNode;i&&this._matchLeaves(h,i,{forgive:u})&&t.add(i);break}case" ":default:{const i=[];let l=e.parentNode;for(;l;)this._matchLeaves(h,l,{forgive:u})&&i.push(l),l=l.parentNode;i.length&&(t=new Set(i.reverse()))}}return t}_findNodes(a,e){const{leaves:[n,...f]}=a,{type:h}=n,d=(0,k.unescapeSelector)(n.name),p=f.length>0,{document:u,root:t}=this.#t;let i=new Set,l=!1;switch(h){case b.ID_SELECTOR:{let c;if(e===v)this._matchLeaves([n],this.#e)&&(c=this.#e);else if(e===S){let o=this.#e;for(;o;){if(this._matchLeaves([n],o)){c=o;break}o=o.parentNode}}else t.nodeType===b.ELEMENT_NODE?l=!0:c=t.getElementById(d);c&&(p?this._matchLeaves(f,c)&&i.add(c):i.add(c));break}case b.CLASS_SELECTOR:{const c=[];if(e===v)this.#e.nodeType===b.ELEMENT_NODE&&this.#e.classList.contains(d)&&c.push(this.#e);else if(e===S){let o=this.#e;for(;o&&o.nodeType===b.ELEMENT_NODE;)o.classList.contains(d)&&c.push(o),o=o.parentNode}else if(t.nodeType===b.DOCUMENT_FRAGMENT_NODE){const o=[...t.children];for(const s of o){s.classList.contains(d)&&c.push(s);const r=[...s.getElementsByClassName(d)];c.push(...r)}}else{const o=[...t.getElementsByClassName(d)];c.push(...o)}if(c.length)if(p)for(const o of c)this._matchLeaves(f,o)&&i.add(o);else i=new Set(c);break}case b.TYPE_SELECTOR:{const c=[];if(e===v)this.#e.nodeType===b.ELEMENT_NODE&&this._matchLeaves([n],this.#e)&&c.push(this.#e);else if(e===S){let o=this.#e;for(;o&&o.nodeType===b.ELEMENT_NODE;)this._matchLeaves([n],o)&&c.push(o),o=o.parentNode}else if(u.contentType!=="text/html"||/[*|]/.test(d))l=!0;else if(t.nodeType===b.DOCUMENT_FRAGMENT_NODE){const o=d.toLowerCase(),s=[...t.children];for(const r of s){r.localName===o&&c.push(r);const m=[...r.getElementsByTagName(d)];c.push(...m)}}else{const o=[...t.getElementsByTagName(d)];c.push(...o)}if(c.length)if(p)for(const o of c)this._matchLeaves(f,o)&&i.add(o);else i=new Set(c);break}case b.PSEUDO_ELEMENT_SELECTOR:{this._matchPseudoElementSelector(d);break}default:{const c=[];if(e===v)this._matchLeaves([n],this.#e)&&c.push(this.#e);else if(e===S){let o=this.#e;for(;o;)this._matchLeaves([n],o)&&c.push(o),o=o.parentNode}else l=!0;if(c.length)if(p)for(const o of c)this._matchLeaves(f,o)&&i.add(o);else i=new Set(c)}}return{nodes:i,pending:l}}_collectNodes(a){const e=this.#a.values();if(a===C||a===A){const n=new Set;let f=0;for(const{branch:h}of e){const d=h[0],{nodes:p,pending:u}=this._findNodes(d,a);p.size?this.#r[f]=p:u?n.add(new Map([["index",f],["twig",d]])):this.#a[f].skip=!0,f++}if(n.size){const{document:h,root:d}=this.#t,p=h.createNodeIterator(d,b.SHOW_ELEMENT);let u=p.nextNode();for(;u;){let t=!1;if(this.#e.nodeType===b.ELEMENT_NODE?t=(0,g.isSameOrDescendant)(u,this.#e):t=!0,t)for(const i of n){const{leaves:l}=i.get("twig");if(this._matchLeaves(l,u)){const o=i.get("index");this.#r[o].add(u)}}u=p.nextNode()}}}else{let n=0;for(const{branch:f}of e){const h=f[f.length-1],{nodes:d}=this._findNodes(h,a);d.size?this.#r[n]=d:this.#a[n].skip=!0,n++}}return[this.#a,this.#r]}_matchNodes(a){const[...e]=this.#a,n=e.length;let f=new Set;for(let h=0;h<n;h++){const{branch:d,skip:p}=e[h],u=d.length;if(!p&&u){const t=this.#r[h],i=u-1;if(i===0)if((a===C||a===A)&&this.#e.nodeType===b.ELEMENT_NODE){for(const l of t)if(l!==this.#e&&(0,g.isSameOrDescendant)(l,this.#e)&&(f.add(l),a===A))break}else if(a===A){const[l]=[...t];f.add(l)}else{const l=[...f],c=[...t];f=new Set([...l,...c])}else if(a===C||a===A){let{combo:l}=d[0];for(const c of t){let o=new Set([c]);for(let s=1;s<u;s++){const{combo:r,leaves:m}=d[s],N=[];for(const _ of o){const E={combo:l,leaves:m},T=this._matchCombinator(E,_,{find:"next"});T.size&&N.push(...T)}const w=new Set(N);if(w.size)if(s===i){if(a===A){const[_]=[...w];f.add(_)}else{const _=[...f],E=[...w];f=new Set([..._,...E])}break}else l=r,o=w;else break}}}else for(const l of t){let c=new Set([l]),o;for(let s=i-1;s>=0;s--){const r=d[s],m=[];for(const w of c){const _=this._matchCombinator(r,w,{find:"prev"});_.size&&m.push(..._)}const N=new Set(m);if(N.size)if(o=!0,s===0){f.add(l);break}else c=N;else{o=!1;break}}if(o)break}}}return f}_find(a){return this._collectNodes(a),this._matchNodes(a)}_sortNodes(a){const e=[...a];return e.length>1&&e.sort((n,f)=>{let h;const d=n.compareDocumentPosition(f);return d&b.DOCUMENT_POSITION_PRECEDING||d&b.DOCUMENT_POSITION_CONTAINS?h=1:h=-1,h}),e}matches(){if(this.#e.nodeType!==b.ELEMENT_NODE)throw new TypeError(`Unexpected node ${this.#e.nodeName}`);let a;try{a=this._find(v).has(this.#e)}catch(e){this._onError(e)}return!!a}closest(){if(this.#e.nodeType!==b.ELEMENT_NODE)throw new TypeError(`Unexpected node ${this.#e.nodeName}`);let a;try{const e=this._find(S);let n=this.#e;for(;n;){if(e.has(n)){a=n;break}n=n.parentNode}}catch(e){this._onError(e)}return a??null}querySelector(){let a;try{const e=this._find(A);e.delete(this.#e),e.size>1?[a]=this._sortNodes(e):e.size&&([a]=[...e])}catch(e){this._onError(e)}return a??null}querySelectorAll(){const a=[];try{const e=this._find(C);e.delete(this.#e),e.size>1&&this.#l?a.push(...this._sortNodes(e)):e.size&&a.push(...e)}catch(e){this._onError(e)}return a}}0&&(module.exports={Matcher});
//# sourceMappingURL=matcher.js.map