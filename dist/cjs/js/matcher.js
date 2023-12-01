var F=Object.create;var P=Object.defineProperty;var V=Object.getOwnPropertyDescriptor;var j=Object.getOwnPropertyNames;var H=Object.getPrototypeOf,G=Object.prototype.hasOwnProperty;var W=(S,s)=>{for(var e in s)P(S,e,{get:s[e],enumerable:!0})},z=(S,s,e,n)=>{if(s&&typeof s=="object"||typeof s=="function")for(let h of j(s))!G.call(S,h)&&h!==e&&P(S,h,{get:()=>s[h],enumerable:!(n=V(s,h))||n.enumerable});return S};var q=(S,s,e)=>(e=S!=null?F(H(S)):{},z(s||!S||!S.__esModule?P(e,"default",{value:S,enumerable:!0}):e,S)),X=S=>z(P({},"__esModule",{value:!0}),S);var J={};W(J,{Matcher:()=>Y});module.exports=X(J);var B=q(require("is-potential-custom-element-name"),1),E=require("./dom-util.js"),y=require("./parser.js"),r=require("./constant.js");const R="next",M="prev",U="all",C="first",D="lineal",I="self";class Y{#i;#r;#a;#e;#l;#t;#o;#s;constructor(s,e,n={}){const{warn:h}=n;this.#r=new Map([[r.SELECTOR_PSEUDO_ELEMENT,r.BIT_01],[r.SELECTOR_ID,r.BIT_02],[r.SELECTOR_CLASS,r.BIT_04],[r.SELECTOR_TYPE,r.BIT_08],[r.SELECTOR_ATTR,r.BIT_16],[r.SELECTOR_PSEUDO_CLASS,r.BIT_32]]),this.#a=new WeakMap,this.#o=s,this.#e=e,this.#s=!!h,[this.#i,this.#l]=this._prepare(s),this.#t=this._getRoot(e)}_onError(s){if(s instanceof DOMException&&s.name===r.NOT_SUPPORTED_ERR)this.#s&&console.warn(s.message);else throw s}_getRoot(s=this.#e){let e,n;switch(s.nodeType){case r.DOCUMENT_NODE:{e=s,n=s;break}case r.DOCUMENT_FRAGMENT_NODE:{e=s.ownerDocument,n=s;break}case r.ELEMENT_NODE:{if((0,E.isSameOrDescendant)(s))e=s.ownerDocument,n=s.ownerDocument;else{let a=s;for(;a&&a.parentNode;)a=a.parentNode;e=a.ownerDocument,n=a}break}default:throw new TypeError(`Unexpected node ${s.nodeName}`)}const h=(0,E.isInShadowTree)(s);return{document:e,root:n,shadow:h}}_sortLeaves(s){const e=[...s];return e.length>1&&e.sort((n,h)=>{const{type:a}=n,{type:u}=h,m=this.#r.get(a),c=this.#r.get(u);let t;return m===c?t=0:m>c?t=1:t=-1,t}),e}_prepare(s=this.#o){const e=(0,y.parseSelector)(s),n=(0,y.walkAST)(e),h=[],a=[];let u=0;for(const[...m]of n){const c=[];let t=m.shift();if(t&&t.type!==r.COMBINATOR){const i=new Set;for(;t;){if(t.type===r.COMBINATOR){const[o]=m;if(o.type===r.COMBINATOR){const b=`Invalid combinator ${t.name}${o.name}`;throw new DOMException(b,r.SYNTAX_ERR)}c.push({combo:t,leaves:this._sortLeaves(i)}),i.clear()}else t&&i.add(t);if(m.length)t=m.shift();else{c.push({combo:null,leaves:this._sortLeaves(i)}),i.clear();break}}}h.push({branch:c,find:null,skip:!1}),a[u]=new Set,u++}return[h,a]}_collectNthChild(s,e){const{a:n,b:h,reverse:a,selector:u}=s,{parentNode:m}=e,c=new Set;let t;if(u&&(this.#a.has(u)?t=this.#a.get(u):(t=(0,y.walkAST)(u),this.#a.set(u,t))),m){const i=[].slice.call(m.children),o=i.length;if(o){const b=new Set;if(t){const l=t.length;for(const f of i){let d;for(let p=0;p<l;p++){const N=t[p];if(d=this._matchLeaves(N,f),!d)break}d&&b.add(f)}}if(a&&i.reverse(),n===0){if(h>0&&h<=o){if(b.size)for(let l=0;l<o;l++){const f=i[l];if(b.has(f)){c.add(f);break}}else if(!u){const l=i[h-1];c.add(l)}}}else{let l=h-1;if(n>0)for(;l<0;)l+=n;if(l>=0&&l<o){let f=n>0?0:h-1;for(let d=0;d<o&&l>=0&&l<o;d++){const p=i[d];b.size?b.has(p)&&(f===l&&(c.add(p),l+=n),n>0?f++:f--):d===l&&(u||c.add(p),l+=n)}}}}}else{const{root:i}=this.#t;if(e===i&&i.nodeType===r.ELEMENT_NODE&&n+h===1)if(t){const o=t.length;let b;for(let l=0;l<o;l++){const f=t[l];if(b=this._matchLeaves(f,e),b)break}b&&c.add(e)}else c.add(e)}return c}_collectNthOfType(s,e){const{a:n,b:h,reverse:a}=s,{localName:u,parentNode:m,prefix:c}=e,t=new Set;if(m){const i=[].slice.call(m.children),o=i.length;if(o)if(a&&i.reverse(),n===0){if(h>0&&h<=o){let b=0;for(let l=0;l<o;l++){const f=i[l],{localName:d,prefix:p}=f;if(d===u&&p===c){if(b===h-1){t.add(f);break}b++}}}}else{let b=h-1;if(n>0)for(;b<0;)b+=n;if(b>=0&&b<o){let l=n>0?0:h-1;for(let f=0;f<o;f++){const d=i[f],{localName:p,prefix:N}=d;if(p===u&&N===c){if(l===b&&(t.add(d),b+=n),b<0||b>=o)break;n>0?l++:l--}}}}}else{const{root:i}=this.#t;e===i&&i.nodeType===r.ELEMENT_NODE&&n+h===1&&t.add(e)}return t}_matchAnPlusB(s,e,n){const{nth:{a:h,b:a,name:u},selector:m}=s,c=(0,y.unescapeSelector)(u),t=new Map;c?(c==="even"?(t.set("a",2),t.set("b",0)):c==="odd"&&(t.set("a",2),t.set("b",1)),n.indexOf("last")>-1&&t.set("reverse",!0)):(typeof h=="string"&&/-?\d+/.test(h)?t.set("a",h*1):t.set("a",0),typeof a=="string"&&/-?\d+/.test(a)?t.set("b",a*1):t.set("b",0),n.indexOf("last")>-1&&t.set("reverse",!0));let i=new Set;if(t.has("a")&&t.has("b")){if(/^nth-(?:last-)?child$/.test(n)){m&&t.set("selector",m);const o=Object.fromEntries(t),b=this._collectNthChild(o,e);b.size&&(i=b)}else if(/^nth-(?:last-)?of-type$/.test(n)){const o=Object.fromEntries(t),b=this._collectNthOfType(o,e);b.size&&(i=b)}}return i}_matchPseudoElementSelector(s,e={}){const{forgive:n}=e;switch(s){case"after":case"backdrop":case"before":case"cue":case"cue-region":case"first-letter":case"first-line":case"file-selector-button":case"marker":case"placeholder":case"selection":case"target-text":{if(this.#s)throw new DOMException(`Unsupported pseudo-element ::${s}`,r.NOT_SUPPORTED_ERR);break}case"part":case"slotted":{if(this.#s)throw new DOMException(`Unsupported pseudo-element ::${s}()`,r.NOT_SUPPORTED_ERR);break}default:if(s.startsWith("-webkit-")){if(this.#s)throw new DOMException(`Unsupported pseudo-element ::${s}`,r.NOT_SUPPORTED_ERR)}else if(!n)throw new DOMException(`Unknown pseudo-element ::${s}`,r.SYNTAX_ERR)}}_matchDirectionPseudoClass(s,e){const n=(0,y.unescapeSelector)(s.name),h=(0,E.getDirectionality)(e);let a;return n===h&&(a=e),a??null}_matchLanguagePseudoClass(s,e){const n=(0,y.unescapeSelector)(s.name);let h;if(n)if(n==="*")if(e.hasAttribute("lang"))e.getAttribute("lang")&&(h=e);else{let a=e.parentNode;for(;a;){if(a.hasAttribute("lang")){a.getAttribute("lang")&&(h=e);break}a=a.parentNode}}else{const a=`(?:-${r.ALPHA_NUM})*`;if(new RegExp(`^(?:\\*-)?${r.ALPHA_NUM}${a}$`,"i").test(n)){let m;if(n.indexOf("-")>-1){const[c,t,...i]=n.split("-");let o;c==="*"?o=`${r.ALPHA_NUM}${a}`:o=`${c}${a}`;const b=`-${t}${a}`,l=i.length;let f="";if(l)for(let d=0;d<l;d++)f+=`-${i[d]}${a}`;m=new RegExp(`^${o}${b}${f}$`,"i")}else m=new RegExp(`^${n}${a}$`,"i");if(e.hasAttribute("lang"))m.test(e.getAttribute("lang"))&&(h=e);else{let c=e.parentNode;for(;c;){if(c.hasAttribute("lang")){const t=c.getAttribute("lang");m.test(t)&&(h=e);break}c=c.parentNode}}}}return h??null}_matchHasPseudoFunc(s,e){let n;if(Array.isArray(s)&&s.length){const[h]=s,{type:a}=h;let u;a===r.COMBINATOR?u=s.shift():u={name:" ",type:r.COMBINATOR};const m=[];for(;s.length;){const[i]=s,{type:o}=i;if(o===r.COMBINATOR)break;m.push(s.shift())}const c={combo:u,leaves:m},t=this._matchCombinator(c,e,{find:R});if(t.size)if(s.length){for(const i of t)if(n=this._matchHasPseudoFunc(Object.assign([],s),i),n)break}else n=!0}return!!n}_matchLogicalPseudoFunc(s,e){const{astName:n="",branches:h=[],selector:a="",twigBranches:u=[]}=s;let m;if(n==="has")if(a.includes(":has("))m=null;else{const c=h.length;let t;for(let i=0;i<c;i++){const o=h[i];if(t=this._matchHasPseudoFunc(Object.assign([],o),e),t)break}t&&(m=e)}else{const c=/^(?:is|where)$/.test(n),t=u.length;let i;for(let o=0;o<t;o++){const b=u[o],l=b.length-1,{leaves:f}=b[l];if(i=this._matchLeaves(f,e,{forgive:c}),i&&l>0){let d=new Set([e]);for(let p=l-1;p>=0;p--){const N=b[p],k=[];for(const x of d){const L=this._matchCombinator(N,x,{forgive:c,find:M});L.size&&k.push(...L)}if(k.length)if(p===0){i=!0;break}else d=new Set(k);else{i=!1;break}}}if(i)break}n==="not"?i||(m=e):i&&(m=e)}return m??null}_matchPseudoClassSelector(s,e,n={}){const{children:h}=s,{localName:a,parentNode:u}=e,{forgive:m}=n,c=(0,y.unescapeSelector)(s.name);let t=new Set;if(r.REG_LOGICAL_PSEUDO.test(c)){let i;if(this.#a.has(s))i=this.#a.get(s);else{const b=(0,y.walkAST)(s),l=[],f=[];for(const[...d]of b){for(const x of d){const L=(0,y.generateCSS)(x);l.push(L)}const p=[],N=new Set;let k=d.shift();for(;k;)if(k.type===r.COMBINATOR?(p.push({combo:k,leaves:[...N]}),N.clear()):k&&N.add(k),d.length)k=d.shift();else{p.push({combo:null,leaves:[...N]}),N.clear();break}f.push(p)}i={astName:c,branches:b,twigBranches:f,selector:l.join(",")},this.#a.set(s,i)}const o=this._matchLogicalPseudoFunc(i,e);o&&t.add(o)}else if(Array.isArray(h)){const[i]=h;if(/^nth-(?:last-)?(?:child|of-type)$/.test(c)){const o=this._matchAnPlusB(i,e,c);o.size&&(t=o)}else if(c==="dir"){const o=this._matchDirectionPseudoClass(i,e);o&&t.add(o)}else if(c==="lang"){const o=this._matchLanguagePseudoClass(i,e);o&&t.add(o)}else switch(c){case"current":case"nth-col":case"nth-last-col":{if(this.#s)throw new DOMException(`Unsupported pseudo-class :${c}()`,r.NOT_SUPPORTED_ERR);break}default:if(!m)throw new DOMException(`Unknown pseudo-class :${c}()`,r.SYNTAX_ERR)}}else{const{document:i,root:o}=this.#t,{documentElement:b}=i,l=new URL(i.URL),f=/^a(?:rea)?$/,d=/^(?:(?:fieldse|inpu|selec)t|button|opt(?:group|ion)|textarea)$/,p=/^(?:(?:inpu|selec)t|button|form|textarea)$/,N=/^d(?:etails|ialog)$/,k=/^(?:checkbox|radio)$/,x=/^(?:date(?:time-local)?|month|time|week)$/,L=/(?:(?:rang|tim)e|date(?:time-local)?|month|number|week)$/,O=/^(?:(?:emai|te|ur)l|number|password|search|text)$/;switch(c){case"any-link":case"link":{f.test(a)&&e.hasAttribute("href")&&t.add(e);break}case"local-link":{if(f.test(a)&&e.hasAttribute("href")){const g=new URL(e.getAttribute("href"),l.href);g.origin===l.origin&&g.pathname===l.pathname&&t.add(e)}break}case"visited":break;case"target":{e.id&&l.hash&&l.hash===`#${e.id}`&&(0,E.isSameOrDescendant)(e)&&t.add(e);break}case"target-within":{if(l.hash){const g=l.hash.replace(/^#/,"");let w=i.getElementById(g);for(;w;){if(w===e){t.add(e);break}w=w.parentNode}}break}case"scope":{this.#e.nodeType===r.ELEMENT_NODE?e===this.#e&&t.add(e):e===b&&t.add(e);break}case"focus":{e===i.activeElement&&t.add(e);break}case"focus-within":{let g=i.activeElement;for(;g;){if(g===e){t.add(e);break}g=g.parentNode}break}case"open":{N.test(a)&&e.hasAttribute("open")&&t.add(e);break}case"closed":{N.test(a)&&!e.hasAttribute("open")&&t.add(e);break}case"disabled":{if(d.test(a)||(0,B.default)(a))if(e.disabled||e.hasAttribute("disabled"))t.add(e);else{let g=u;for(;g&&g.localName!=="fieldset";)g=g.parentNode;g&&u.localName!=="legend"&&g.hasAttribute("disabled")&&t.add(e)}break}case"enabled":{(d.test(a)||(0,B.default)(a))&&!(e.disabled&&e.hasAttribute("disabled"))&&t.add(e);break}case"read-only":{switch(a){case"textarea":{(e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled"))&&t.add(e);break}case"input":{(!e.type||x.test(e.type)||O.test(e.type))&&(e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled"))&&t.add(e);break}default:(0,E.isContentEditable)(e)||t.add(e)}break}case"read-write":{switch(a){case"textarea":{e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled")||t.add(e);break}case"input":{(!e.type||x.test(e.type)||O.test(e.type))&&!(e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled"))&&t.add(e);break}default:(0,E.isContentEditable)(e)&&t.add(e)}break}case"placeholder-shown":{let g;a==="textarea"?g=e:a==="input"&&(e.hasAttribute("type")?O.test(e.getAttribute("type"))&&(g=e):g=e),g&&e.value===""&&e.hasAttribute("placeholder")&&e.getAttribute("placeholder").trim().length&&t.add(e);break}case"checked":{(e.checked&&a==="input"&&e.hasAttribute("type")&&k.test(e.getAttribute("type"))||e.selected&&a==="option")&&t.add(e);break}case"indeterminate":{if(e.indeterminate&&a==="input"&&e.type==="checkbox"||a==="progress"&&!e.hasAttribute("value"))t.add(e);else if(a==="input"&&e.type==="radio"&&!e.hasAttribute("checked")){const g=e.name;let w=e.parentNode;for(;w&&w.localName!=="form";)w=w.parentNode;w||(w=b);const _=[].slice.call(w.getElementsByTagName("input"));let T;for(const A of _)if(A.getAttribute("type")==="radio"&&(g?A.getAttribute("name")===g&&(T=!!A.checked):A.hasAttribute("name")||(T=!!A.checked),T))break;T||t.add(e)}break}case"default":{const g=/^(?:button|reset)$/,w=/^(?:image|submit)$/;if(a==="button"&&!(e.hasAttribute("type")&&g.test(e.getAttribute("type")))||a==="input"&&e.hasAttribute("type")&&w.test(e.getAttribute("type"))){let _=e.parentNode;for(;_&&_.localName!=="form";)_=_.parentNode;if(_){const T=i.createNodeIterator(_,r.SHOW_ELEMENT);let A=T.nextNode();for(;A;){const $=A.localName;let v;if($==="button"?v=!(A.hasAttribute("type")&&g.test(A.getAttribute("type"))):$==="input"&&(v=A.hasAttribute("type")&&w.test(A.getAttribute("type"))),v){A===e&&t.add(e);break}A=T.nextNode()}}}else if(a==="input"&&e.hasAttribute("type")&&k.test(e.getAttribute("type"))&&(e.checked||e.hasAttribute("checked")))t.add(e);else if(a==="option"){let _=!1,T=u;for(;T&&T.localName!=="datalist";){if(T.localName==="select"){(T.multiple||T.hasAttribute("multiple"))&&(_=!0);break}T=T.parentNode}if(_)(e.selected||e.hasAttribute("selected"))&&t.add(e);else{const A=u.firstElementChild,$=new Set;let v=A;for(;v;){if(v.selected||v.hasAttribute("selected")){$.add(v);break}v=v.nextElementSibling}$.size||$.add(A),$.has(e)&&t.add(e)}}break}case"valid":{if(p.test(a))e.checkValidity()&&t.add(e);else if(a==="fieldset"){const g=i.createNodeIterator(e,r.SHOW_ELEMENT);let w=g.nextNode();w===e&&(w=g.nextNode());let _;for(;w&&!(p.test(w.localName)&&(_=w.checkValidity(),!_));)w=g.nextNode();_&&t.add(e)}break}case"invalid":{if(p.test(a))e.checkValidity()||t.add(e);else if(a==="fieldset"){const g=i.createNodeIterator(e,r.SHOW_ELEMENT);let w=g.nextNode();w===e&&(w=g.nextNode());let _;for(;w&&!(p.test(w.localName)&&(_=w.checkValidity(),!_));)w=g.nextNode();_||t.add(e)}break}case"in-range":{a==="input"&&!(e.readonly||e.hasAttribute("readonly"))&&!(e.disabled||e.hasAttribute("disabled"))&&e.hasAttribute("type")&&L.test(e.getAttribute("type"))&&!(e.validity.rangeUnderflow||e.validity.rangeOverflow)&&(e.hasAttribute("min")||e.hasAttribute("max")||e.getAttribute("type")==="range")&&t.add(e);break}case"out-of-range":{a==="input"&&!(e.readonly||e.hasAttribute("readonly"))&&!(e.disabled||e.hasAttribute("disabled"))&&e.hasAttribute("type")&&L.test(e.getAttribute("type"))&&(e.validity.rangeUnderflow||e.validity.rangeOverflow)&&t.add(e);break}case"required":{let g;if(/^(?:select|textarea)$/.test(a))g=e;else if(a==="input")if(e.hasAttribute("type")){const w=e.getAttribute("type");(w==="file"||k.test(w)||x.test(w)||O.test(w))&&(g=e)}else g=e;g&&(e.required||e.hasAttribute("required"))&&t.add(e);break}case"optional":{let g;if(/^(?:select|textarea)$/.test(a))g=e;else if(a==="input")if(e.hasAttribute("type")){const w=e.getAttribute("type");(w==="file"||k.test(w)||x.test(w)||O.test(w))&&(g=e)}else g=e;g&&!(e.required||e.hasAttribute("required"))&&t.add(e);break}case"root":{e===b&&t.add(e);break}case"empty":{if(e.hasChildNodes()){const g=e.childNodes.values();let w;for(const _ of g)if(w=_.nodeType!==r.ELEMENT_NODE&&_.nodeType!==r.TEXT_NODE,!w)break;w&&t.add(e)}else t.add(e);break}case"first-child":{(u&&e===u.firstElementChild||e===o&&o.nodeType===r.ELEMENT_NODE)&&t.add(e);break}case"last-child":{(u&&e===u.lastElementChild||e===o&&o.nodeType===r.ELEMENT_NODE)&&t.add(e);break}case"only-child":{(u&&e===u.firstElementChild&&e===u.lastElementChild||e===o&&o.nodeType===r.ELEMENT_NODE)&&t.add(e);break}case"first-of-type":{if(u){const[g]=this._collectNthOfType({a:0,b:1},e);g&&t.add(g)}else e===o&&o.nodeType===r.ELEMENT_NODE&&t.add(e);break}case"last-of-type":{if(u){const[g]=this._collectNthOfType({a:0,b:1,reverse:!0},e);g&&t.add(g)}else e===o&&o.nodeType===r.ELEMENT_NODE&&t.add(e);break}case"only-of-type":{if(u){const[g]=this._collectNthOfType({a:0,b:1},e);if(g===e){const[w]=this._collectNthOfType({a:0,b:1,reverse:!0},e);w===e&&t.add(e)}}else e===o&&o.nodeType===r.ELEMENT_NODE&&t.add(e);break}case"host":case"host-context":break;case"after":case"before":case"first-letter":case"first-line":{if(this.#s)throw new DOMException(`Unsupported pseudo-element ::${c}`,r.NOT_SUPPORTED_ERR);break}case"active":case"autofill":case"blank":case"buffering":case"current":case"focus-visible":case"fullscreen":case"future":case"hover":case"modal":case"muted":case"past":case"paused":case"picture-in-picture":case"playing":case"seeking":case"stalled":case"user-invalid":case"user-valid":case"volume-locked":case"-webkit-autofill":{if(this.#s)throw new DOMException(`Unsupported pseudo-class :${c}`,r.NOT_SUPPORTED_ERR);break}default:if(c.startsWith("-webkit-")){if(this.#s)throw new DOMException(`Unsupported pseudo-class :${c}`,r.NOT_SUPPORTED_ERR)}else if(!m)throw new DOMException(`Unknown pseudo-class :${c}`,r.SYNTAX_ERR)}}return t}_matchAttributeSelector(s,e){const{flags:n,matcher:h,name:a,value:u}=s;if(typeof n=="string"&&!/^[is]$/i.test(n)){const t=(0,y.generateCSS)(s);throw new DOMException(`Invalid selector ${t}`,r.SYNTAX_ERR)}const{attributes:m}=e;let c;if(m&&m.length){const{document:t}=this.#t;let i;t.contentType==="text/html"?typeof n=="string"&&/^s$/i.test(n)?i=!1:i=!0:typeof n=="string"&&/^i$/i.test(n)?i=!0:i=!1;let o=(0,y.unescapeSelector)(a.name);i&&(o=o.toLowerCase());const b=new Set;if(o.indexOf("|")>-1){const{prefix:l,tagName:f}=(0,E.selectorToNodeProps)(o);for(let{name:d,value:p}of m)switch(i&&(d=d.toLowerCase(),p=p.toLowerCase()),l){case"":{f===d&&b.add(p);break}case"*":{d.indexOf(":")>-1?d.endsWith(`:${f}`)&&b.add(p):f===d&&b.add(p);break}default:if(d.indexOf(":")>-1){const[N,k]=d.split(":");l===N&&f===k&&(0,E.isNamespaceDeclared)(l,e)&&b.add(p)}}}else for(let{name:l,value:f}of m)if(i&&(l=l.toLowerCase(),f=f.toLowerCase()),l.indexOf(":")>-1){const[d,p]=l.split(":");if(d==="xml"&&p==="lang")continue;o===p&&b.add(f)}else o===l&&b.add(f);if(b.size){const{name:l,value:f}=u||{};let d;switch(l?i?d=l.toLowerCase():d=l:f?i?d=f.toLowerCase():d=f:f===""&&(d=f),h){case"=":{typeof d=="string"&&b.has(d)&&(c=e);break}case"~=":{if(d&&typeof d=="string"){for(const p of b)if(new Set(p.split(/\s+/)).has(d)){c=e;break}}break}case"|=":{if(d&&typeof d=="string"){let p;for(const N of b)if(N===d||N.startsWith(`${d}-`)){p=N;break}p&&(c=e)}break}case"^=":{if(d&&typeof d=="string"){let p;for(const N of b)if(N.startsWith(`${d}`)){p=N;break}p&&(c=e)}break}case"$=":{if(d&&typeof d=="string"){let p;for(const N of b)if(N.endsWith(`${d}`)){p=N;break}p&&(c=e)}break}case"*=":{if(d&&typeof d=="string"){let p;for(const N of b)if(N.includes(`${d}`)){p=N;break}p&&(c=e)}break}case null:default:c=e}}}return c??null}_matchClassSelector(s,e){const n=(0,y.unescapeSelector)(s.name);let h;return e.classList.contains(n)&&(h=e),h??null}_matchIDSelector(s,e){const n=(0,y.unescapeSelector)(s.name),{id:h}=e;let a;return n===h&&(a=e),a??null}_matchTypeSelector(s,e){const n=(0,y.unescapeSelector)(s.name),{localName:h,prefix:a}=e,{document:u}=this.#t;let{prefix:m,tagName:c}=(0,E.selectorToNodeProps)(n,e);u.contentType==="text/html"&&(m=m.toLowerCase(),c=c.toLowerCase());let t,i;h.indexOf(":")>-1?[t,i]=h.split(":"):(t=a||"",i=h);let o;if(m===""&&t==="")e.namespaceURI===null&&(c==="*"||c===i)&&(o=e);else if(m==="*")(c==="*"||c===i)&&(o=e);else if(m===t)if((0,E.isNamespaceDeclared)(m,e))(c==="*"||c===i)&&(o=e);else throw new DOMException(`Undeclared namespace ${m}`,r.SYNTAX_ERR);return o??null}_matchShadowHostPseudoClass(s,e){const{children:n}=s,h=(0,y.unescapeSelector)(s.name);let a;if(Array.isArray(n)){const[u]=(0,y.walkAST)(n[0]),[...m]=u,{host:c}=e;if(h==="host"){let t;for(const i of m){const{type:o}=i;if(o===r.COMBINATOR){const b=(0,y.generateCSS)(s);throw new DOMException(`Invalid selector ${b}`,r.SYNTAX_ERR)}if(t=this._matchSelector(i,c).has(c),!t)break}t&&(a=e)}else if(h==="host-context"){let t=c,i;for(;t;){for(const o of m){const{type:b}=o;if(b===r.COMBINATOR){const l=(0,y.generateCSS)(s);throw new DOMException(`Invalid selector ${l}`,r.SYNTAX_ERR)}if(i=this._matchSelector(o,t).has(t),!i)break}if(i)break;t=t.parentNode}i&&(a=e)}}else h==="host"&&(a=e);return a??null}_matchSelector(s,e,n){const{type:h}=s,a=(0,y.unescapeSelector)(s.name),{shadow:u}=this.#t;let m=new Set;if(e.nodeType===r.ELEMENT_NODE)switch(h){case r.SELECTOR_ATTR:{const c=this._matchAttributeSelector(s,e);c&&m.add(c);break}case r.SELECTOR_CLASS:{const c=this._matchClassSelector(s,e);c&&m.add(c);break}case r.SELECTOR_ID:{const c=this._matchIDSelector(s,e);c&&m.add(c);break}case r.SELECTOR_PSEUDO_CLASS:{const c=this._matchPseudoClassSelector(s,e,n);c.size&&(m=c);break}case r.SELECTOR_PSEUDO_ELEMENT:{this._matchPseudoElementSelector(a,n);break}case r.SELECTOR_TYPE:default:{const c=this._matchTypeSelector(s,e);c&&m.add(c)}}else if(u&&h===r.SELECTOR_PSEUDO_CLASS&&e.nodeType===r.DOCUMENT_FRAGMENT_NODE){if(a!=="has"&&r.REG_LOGICAL_PSEUDO.test(a)){const c=this._matchPseudoClassSelector(s,e,n);c.size&&(m=c)}else if(r.REG_SHADOW_HOST.test(a)){const c=this._matchShadowHostPseudoClass(s,e);c&&m.add(c)}}return m}_matchLeaves(s,e,n){let h;for(const a of s)if(h=this._matchSelector(a,e,n).has(e),!h)break;return!!h}_findDescendantNodes(s,e){const[n,...h]=s,{type:a}=n,u=(0,y.unescapeSelector)(n.name),m=h.length>0,{document:c,root:t,shadow:i}=this.#t;let o=new Set,b=!1;if(i)b=!0;else switch(a){case r.SELECTOR_ID:{if(t.nodeType===r.ELEMENT_NODE)b=!0;else{const l=t.getElementById(u);if(l&&l!==e){const f=(0,E.isSameOrDescendant)(l,e);let d;f&&(d=l),d&&(m?this._matchLeaves(h,d)&&o.add(d):o.add(d))}}break}case r.SELECTOR_CLASS:{const l=[].slice.call(e.getElementsByClassName(u));if(l.length)if(m)for(const f of l)this._matchLeaves(h,f)&&o.add(f);else o=new Set(l);break}case r.SELECTOR_TYPE:{if(c.contentType==="text/html"&&!/[*|]/.test(u)){const l=[].slice.call(e.getElementsByTagName(u));if(l.length)if(m)for(const f of l)this._matchLeaves(h,f)&&o.add(f);else o=new Set(l)}else b=!0;break}case r.SELECTOR_PSEUDO_ELEMENT:{this._matchPseudoElementSelector(u);break}default:b=!0}return{nodes:o,pending:b}}_matchCombinator(s,e,n={}){const{combo:h,leaves:a}=s,{name:u}=h,{find:m,forgive:c}=n;let t=new Set;if(m===R)switch(u){case"+":{const i=e.nextElementSibling;i&&this._matchLeaves(a,i,{forgive:c})&&t.add(i);break}case"~":{let i=e.nextElementSibling;for(;i;)this._matchLeaves(a,i,{forgive:c})&&t.add(i),i=i.nextElementSibling;break}case">":{const i=[].slice.call(e.children);for(const o of i)this._matchLeaves(a,o,{forgive:c})&&t.add(o);break}case" ":default:{const{nodes:i,pending:o}=this._findDescendantNodes(a,e);if(i.size)t=i;else if(o){const{document:b}=this.#t,l=b.createNodeIterator(e,r.SHOW_ELEMENT);let f=l.nextNode();for(f===e&&(f=l.nextNode());f;)this._matchLeaves(a,f,{forgive:c})&&t.add(f),f=l.nextNode()}}}else switch(u){case"+":{const i=e.previousElementSibling;i&&this._matchLeaves(a,i,{forgive:c})&&t.add(i);break}case"~":{const i=[];let o=e.previousElementSibling;for(;o;)this._matchLeaves(a,o,{forgive:c})&&i.push(o),o=o.previousElementSibling;i.length&&(t=new Set(i.reverse()));break}case">":{const i=e.parentNode;i&&this._matchLeaves(a,i,{forgive:c})&&t.add(i);break}case" ":default:{const i=[];let o=e.parentNode;for(;o;)this._matchLeaves(a,o,{forgive:c})&&i.push(o),o=o.parentNode;i.length&&(t=new Set(i.reverse()))}}return t}_findNodes(s,e){const{leaves:[n,...h]}=s,{type:a}=n,u=(0,y.unescapeSelector)(n.name),m=h.length>0,{document:c,root:t,shadow:i}=this.#t;let o=new Set,b=!1;switch(a){case r.SELECTOR_ID:{let l;if(e===I)this._matchLeaves([n],this.#e)&&(l=this.#e);else if(e===D){let f=this.#e;for(;f;){if(this._matchLeaves([n],f)){l=f;break}f=f.parentNode}}else t.nodeType===r.ELEMENT_NODE?b=!0:l=t.getElementById(u);l&&(m?this._matchLeaves(h,l)&&o.add(l):o.add(l));break}case r.SELECTOR_CLASS:{let l=[];if(e===I)this.#e.nodeType===r.ELEMENT_NODE&&this.#e.classList.contains(u)&&l.push(this.#e);else if(e===D){let f=this.#e;for(;f&&f.nodeType===r.ELEMENT_NODE;)f.classList.contains(u)&&l.push(f),f=f.parentNode}else if(t.nodeType===r.DOCUMENT_FRAGMENT_NODE){const f=[].slice.call(t.children);for(const d of f){d.classList.contains(u)&&l.push(d);const p=[].slice.call(d.getElementsByClassName(u));l.push(...p)}}else l=[].slice.call(t.getElementsByClassName(u));if(l.length)if(m)for(const f of l)this._matchLeaves(h,f)&&o.add(f);else o=new Set(l);break}case r.SELECTOR_TYPE:{let l=[];if(e===I)this.#e.nodeType===r.ELEMENT_NODE&&this._matchLeaves([n],this.#e)&&l.push(this.#e);else if(e===D){let f=this.#e;for(;f&&f.nodeType===r.ELEMENT_NODE;)this._matchLeaves([n],f)&&l.push(f),f=f.parentNode}else if(c.contentType!=="text/html"||/[*|]/.test(u))b=!0;else if(t.nodeType===r.DOCUMENT_FRAGMENT_NODE){const f=u.toLowerCase(),d=[].slice.call(t.children);for(const p of d){p.localName===f&&l.push(p);const N=[].slice.call(p.getElementsByTagName(u));l.push(...N)}}else l=[].slice.call(t.getElementsByTagName(u));if(l.length)if(m)for(const f of l)this._matchLeaves(h,f)&&o.add(f);else o=new Set(l);break}case r.SELECTOR_PSEUDO_ELEMENT:{this._matchPseudoElementSelector(u);break}default:{const l=[];if(e!==D&&r.REG_SHADOW_HOST.test(u)){if(i&&this.#e.nodeType===r.DOCUMENT_FRAGMENT_NODE){const f=this._matchShadowHostPseudoClass(n,this.#e);f&&l.push(f)}}else if(e===I)this._matchLeaves([n],this.#e)&&l.push(this.#e);else if(e===D){let f=this.#e;for(;f;)this._matchLeaves([n],f)&&l.push(f),f=f.parentNode}else b=!0;if(l.length)if(m)for(const f of l)this._matchLeaves(h,f)&&o.add(f);else o=new Set(l)}}return{nodes:o,pending:b}}_getFirstTwig(s){const e=s.length-1,n=s[0];let h,a;if(e){const u=s[e],{leaves:[{type:m}]}=u;m===r.SELECTOR_PSEUDO_ELEMENT||m===r.SELECTOR_ID?(h=M,a=u):(h=R,a=n)}else h=M,a=n;return{find:h,twig:a}}_collectNodes(s){const e=this.#i.values();if(s===U||s===C){const n=new Set;let h=0;for(const{branch:a}of e){const{find:u,twig:m}=this._getFirstTwig(a),{nodes:c,pending:t}=this._findNodes(m,s);c.size?this.#l[h]=c:t?n.add(new Map([["index",h],["twig",m]])):this.#i[h].skip=!0,this.#i[h].find=u,h++}if(n.size){const{document:a,root:u}=this.#t,m=a.createNodeIterator(u,r.SHOW_ELEMENT);let c=m.nextNode();for(;c;){let t=!1;if(this.#e.nodeType===r.ELEMENT_NODE?t=(0,E.isSameOrDescendant)(c,this.#e):t=!0,t)for(const i of n){const{leaves:o}=i.get("twig");if(this._matchLeaves(o,c)){const l=i.get("index");this.#l[l].add(c)}}c=m.nextNode()}}}else{let n=0;for(const{branch:h}of e){const a=h[h.length-1],{nodes:u}=this._findNodes(a,s);u.size?this.#l[n]=u:this.#i[n].skip=!0,this.#i[n].find=M,n++}}return[this.#i,this.#l]}_sortNodes(s){const e=[...s];return e.length>1&&e.sort((n,h)=>{const a=n.compareDocumentPosition(h);let u;return a&r.DOCUMENT_POSITION_PRECEDING||a&r.DOCUMENT_POSITION_CONTAINS?u=1:u=-1,u}),e}_matchNodes(s){const[...e]=this.#i,n=e.length;let h=new Set;for(let a=0;a<n;a++){const{branch:u,find:m,skip:c}=e[a],t=u.length;if(!c&&t){const i=this.#l[a],o=t-1;if(o===0)if((s===U||s===C)&&this.#e.nodeType===r.ELEMENT_NODE){for(const b of i)if(b!==this.#e&&(0,E.isSameOrDescendant)(b,this.#e)&&(h.add(b),s===C))break}else if(s===C){const[b]=this._sortNodes(i);h.add(b)}else{const b=[...h],l=[...i];h=new Set([...b,...l])}else if(m===R){let{combo:b}=u[0];for(const l of i){let f=new Set([l]);for(let d=1;d<t;d++){const{combo:p,leaves:N}=u[d],k=[];for(const x of f){const L={combo:b,leaves:N},O=this._matchCombinator(L,x,{find:m});O.size&&k.push(...O)}if(k.length)if(d===o){if(s===C){const[x]=this._sortNodes(k);h.add(x)}else{const x=[...h];h=new Set([...x,...k])}break}else b=p,f=new Set(k);else break}}}else for(const b of i){let l=new Set([b]),f;for(let d=o-1;d>=0;d--){const p=u[d],N=[];for(const k of l){const x=this._matchCombinator(p,k,{find:m});x.size&&N.push(...x)}if(N.length)if(f=!0,d===0){h.add(b);break}else l=new Set(N);else{f=!1;break}}if(f&&s!==U)break}}}return h}_find(s){return this._collectNodes(s),this._matchNodes(s)}matches(){if(this.#e.nodeType!==r.ELEMENT_NODE)throw new TypeError(`Unexpected node ${this.#e.nodeName}`);let s;try{s=this._find(I).has(this.#e)}catch(e){this._onError(e)}return!!s}closest(){if(this.#e.nodeType!==r.ELEMENT_NODE)throw new TypeError(`Unexpected node ${this.#e.nodeName}`);let s;try{const e=this._find(D);let n=this.#e;for(;n;){if(e.has(n)){s=n;break}n=n.parentNode}}catch(e){this._onError(e)}return s??null}querySelector(){let s;try{const e=this._find(C);e.delete(this.#e),e.size&&([s]=this._sortNodes(e))}catch(e){this._onError(e)}return s??null}querySelectorAll(){let s;try{const e=this._find(U);e.delete(this.#e),e.size&&(s=this._sortNodes(e))}catch(e){this._onError(e)}return s??[]}}0&&(module.exports={Matcher});
//# sourceMappingURL=matcher.js.map
