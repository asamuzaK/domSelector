var z=Object.create;var M=Object.defineProperty;var H=Object.getOwnPropertyDescriptor;var W=Object.getOwnPropertyNames;var B=Object.getPrototypeOf,j=Object.prototype.hasOwnProperty;var Y=(g,l)=>{for(var e in l)M(g,e,{get:l[e],enumerable:!0})},D=(g,l,e,h)=>{if(l&&typeof l=="object"||typeof l=="function")for(let n of W(l))!j.call(g,n)&&n!==e&&M(g,n,{get:()=>l[n],enumerable:!(h=H(l,n))||h.enumerable});return g};var q=(g,l,e)=>(e=g!=null?z(B(g)):{},D(l||!g||!g.__esModule?M(e,"default",{value:g,enumerable:!0}):e,g)),V=g=>D(M({},"__esModule",{value:!0}),g);var K={};Y(K,{Finder:()=>X});module.exports=V(K);var I=q(require("@asamuzakjp/nwsapi"),1),_=require("./dom-util.js"),O=require("./matcher.js"),y=require("./parser.js"),c=require("./constant.js");const x="next",S="prev",L="all",E="first",C="lineal",R="self";class X{#a;#c;#s;#h;#w;#r;#m;#e;#d;#k;#f;#o;#_;#t;#u;#b;#n;#p;#i;#l;constructor(l,e){this.#l=l,this.#r=e??l.document,this.#c=new WeakMap,this.#h=new WeakMap,this.#_=new WeakMap,this._initNwsapi()}_onError(l){if(!this.#k)if(l instanceof DOMException||l instanceof this.#l.DOMException)if(l.name===c.NOT_SUPPORTED_ERR)this.#i&&console.warn(l.message);else throw new this.#l.DOMException(l.message,l.name);else throw l}_setup(l,e,h={}){const{event:n,noexcept:a,warn:f}=h;return this.#k=!!a,this.#i=!!f,this.#m=this._setEvent(n),this.#e=e,[this.#s,this.#t,this.#n]=(0,_.resolveContent)(e),this.#u=(0,_.isInShadowTree)(e),[this.#a,this.#d]=this._correspond(l),this.#p=new WeakMap,e}_initNwsapi(){return this.#f=(0,I.default)({DOMException:this.#l.DOMException,document:this.#r}),this.#f.configure({LOGERRORS:!1}),this.#f}_setEvent(l){return l instanceof this.#l.KeyboardEvent||l instanceof this.#l.MouseEvent?l:null}_correspond(l){const e=[];this.#w=!1;let h;if(this.#h.has(this.#s)){const n=this.#h.get(this.#s);if(n&&n.has(`${l}`)){const a=n.get(`${l}`);this.#w=a.descendant,h=a.ast}}if(h){const n=h.length;for(let a=0;a<n;a++)h[a].collected=!1,h[a].dir=null,h[a].filtered=!1,h[a].find=!1,e[a]=[]}else{let n;try{n=(0,y.parseSelector)(l)}catch(t){this._onError(t)}const{branches:a,info:{hasHasPseudoFunc:f,hasHyphenSepAttr:r}}=(0,y.walkAST)(n);let u;f||r?u=!1:u=!0;let d=!1,i=0;h=[];for(const[...t]of a){const s=[];let o=t.shift();if(o&&o.type!==c.COMBINATOR){const m=new Set;for(;o;){if(o.type===c.COMBINATOR){const[b]=t;if(b.type===c.COMBINATOR){const w=`Invalid selector ${l}`;throw new DOMException(w,c.SYNTAX_ERR)}const p=o.name;/^[\s>]$/.test(p)&&(d=!0),s.push({combo:o,leaves:(0,y.sortAST)(m)}),m.clear()}else if(o){let{name:b}=o;b&&typeof b=="string"&&(b=(0,y.unescapeSelector)(b),typeof b=="string"&&b!==o.name&&(o.name=b),/[|:]/.test(b)&&(o.namespace=!0)),m.add(o)}if(t.length)o=t.shift();else{s.push({combo:null,leaves:(0,y.sortAST)(m)}),m.clear();break}}}h.push({branch:s,collected:!1,dir:null,filtered:!1,find:!1}),e[i]=[],i++}if(u){let t;this.#h.has(this.#s)?t=this.#h.get(this.#s):t=new Map,t.set(`${l}`,{ast:h,descendant:d}),this.#h.set(this.#s,t)}this.#w=d}return[h,e]}_createTreeWalker(l){let e;return this.#p.has(l)?e=this.#p.get(l):(e=this.#r.createTreeWalker(l,c.WALKER_FILTER),this.#p.set(l,e)),e}_prepareQuerySelectorWalker(){return this.#o=this._createTreeWalker(this.#e),this.#b=!1,this.#o}_collectNthChild(l,e,h){const{a:n,b:a,reverse:f,selector:r}=l,{parentNode:u}=e,d=new Set;let i;if(r)if(this.#c.has(r))i=this.#c.get(r);else{const{branches:t}=(0,y.walkAST)(r);i=t,this.#c.set(r,i)}if(u){const t=this.#n;let s=(0,_.traverseNode)(u,t);s=t.firstChild();let o=0;for(;s;)o++,s=t.nextSibling();s=(0,_.traverseNode)(u,t);const m=new Set;if(i)for(s=t.firstChild();s;){let b;for(const p of i)if(b=this._matchLeaves(p,s,h),!b)break;b&&m.add(s),s=t.nextSibling()}if(n===0){if(a>0&&a<=o){if(m.size){s=(0,_.traverseNode)(u,t),f?s=t.lastChild():s=t.firstChild();let b=0;for(;s;){if(m.has(s)){if(b===a-1){d.add(s);break}b++}f?s=t.previousSibling():s=t.nextSibling()}}else if(!r){s=(0,_.traverseNode)(u,t),f?s=t.lastChild():s=t.firstChild();let b=0;for(;s;){if(b===a-1){d.add(s);break}f?s=t.previousSibling():s=t.nextSibling(),b++}}}}else{let b=a-1;if(n>0)for(;b<0;)b+=n;if(b>=0&&b<o){s=(0,_.traverseNode)(u,t),f?s=t.lastChild():s=t.firstChild();let p=0,w=n>0?0:a-1;for(;s&&(s&&b>=0&&b<o);)m.size?m.has(s)&&(w===b&&(d.add(s),b+=n),n>0?w++:w--):p===b&&(r||d.add(s),b+=n),f?s=t.previousSibling():s=t.nextSibling(),p++}}if(f&&d.size>1){const b=[...d];return new Set(b.reverse())}}else if(e===this.#t&&n+a===1)if(i){let t;for(const s of i)if(t=this._matchLeaves(s,e,h),t)break;t&&d.add(e)}else d.add(e);return d}_collectNthOfType(l,e){const{a:h,b:n,reverse:a}=l,{localName:f,parentNode:r,prefix:u}=e,d=new Set;if(r){const i=this.#n;let t=(0,_.traverseNode)(r,i);t=i.firstChild();let s=0;for(;t;)s++,t=i.nextSibling();if(h===0){if(n>0&&n<=s){t=(0,_.traverseNode)(r,i),a?t=i.lastChild():t=i.firstChild();let o=0;for(;t;){const{localName:m,prefix:b}=t;if(m===f&&b===u){if(o===n-1){d.add(t);break}o++}a?t=i.previousSibling():t=i.nextSibling()}}}else{let o=n-1;if(h>0)for(;o<0;)o+=h;if(o>=0&&o<s){t=(0,_.traverseNode)(r,i),a?t=i.lastChild():t=i.firstChild();let m=h>0?0:n-1;for(;t;){const{localName:b,prefix:p}=t;if(b===f&&p===u){if(m===o&&(d.add(t),o+=h),o<0||o>=s)break;h>0?m++:m--}a?t=i.previousSibling():t=i.nextSibling()}}}if(a&&d.size>1){const o=[...d];return new Set(o.reverse())}}else e===this.#t&&h+n===1&&d.add(e);return d}_matchAnPlusB(l,e,h,n){const{nth:{a,b:f,name:r},selector:u}=l,d=new Map;if(r?(r==="even"?(d.set("a",2),d.set("b",0)):r==="odd"&&(d.set("a",2),d.set("b",1)),h.indexOf("last")>-1&&d.set("reverse",!0)):(typeof a=="string"&&/-?\d+/.test(a)?d.set("a",a*1):d.set("a",0),typeof f=="string"&&/-?\d+/.test(f)?d.set("b",f*1):d.set("b",0),h.indexOf("last")>-1&&d.set("reverse",!0)),/^nth-(?:last-)?child$/.test(h)){u&&d.set("selector",u);const i=Object.fromEntries(d);return this._collectNthChild(i,e,n)}else if(/^nth-(?:last-)?of-type$/.test(h)){const i=Object.fromEntries(d);return this._collectNthOfType(i,e)}return new Set}_matchHasPseudoFunc(l,e,h={}){let n;if(Array.isArray(l)&&l.length){const a=l.map(s=>s),[f]=a,{type:r}=f;let u;r===c.COMBINATOR?u=a.shift():u={name:" ",type:c.COMBINATOR};const d=[];for(;a.length;){const[s]=a,{type:o}=s;if(o===c.COMBINATOR)break;d.push(a.shift())}const i={combo:u,leaves:d};h.dir=x;const t=this._matchCombinator(i,e,h);if(t.size)if(a.length){for(const s of t)if(n=this._matchHasPseudoFunc(a,s,h),n)break}else n=!0}return!!n}_matchLogicalPseudoFunc(l,e,h={}){const{astName:n="",branches:a=[],selector:f="",twigBranches:r=[]}=l;let u;if(n==="has")if(f.includes(":has("))u=null;else{let d;for(const i of a)if(d=this._matchHasPseudoFunc(i,e,h),d)break;d&&(u=e)}else{const d=/^(?:is|where)$/.test(n);h.forgive=d;const i=r.length;let t;for(let s=0;s<i;s++){const o=r[s],m=o.length-1,{leaves:b}=o[m];if(t=this._matchLeaves(b,e,h),t&&m>0){let p=new Set([e]);for(let w=m-1;w>=0;w--){const k=o[w],N=[];h.dir=S;for(const A of p){const v=this._matchCombinator(k,A,h);v.size&&N.push(...v)}if(N.length)w===0?t=!0:p=new Set(N);else{t=!1;break}}}if(t)break}n==="not"?t||(u=e):t&&(u=e)}return u??null}_matchPseudoClassSelector(l,e,h={}){const{children:n,name:a}=l,{localName:f,parentNode:r}=e,{forgive:u,warn:d=this.#i}=h,i=new Set;if(c.REG_LOGICAL_PSEUDO.test(a)){let t;if(this.#c.has(l))t=this.#c.get(l);else{const{branches:o}=(0,y.walkAST)(l),m=[],b=[];for(const[...p]of o){for(const A of p){const v=(0,y.generateCSS)(A);m.push(v)}const w=[],k=new Set;let N=p.shift();for(;N;)if(N.type===c.COMBINATOR?(w.push({combo:N,leaves:[...k]}),k.clear()):N&&k.add(N),p.length)N=p.shift();else{w.push({combo:null,leaves:[...k]}),k.clear();break}b.push(w)}t={astName:a,branches:o,twigBranches:b,selector:m.join(",")},this.#c.set(l,t)}const s=this._matchLogicalPseudoFunc(t,e,h);s&&i.add(s)}else if(Array.isArray(n))if(/^nth-(?:last-)?(?:child|of-type)$/.test(a)){const[t]=n;return this._matchAnPlusB(t,e,a,h)}else switch(a){case"dir":case"lang":{const t=O.matcher.matchSelector(l,e);t&&i.add(t);break}case"state":{if((0,_.isCustomElement)(e)){const[{value:t}]=n;t&&e[t]&&i.add(e)}break}case"current":case"nth-col":case"nth-last-col":{if(d){const t=`Unsupported pseudo-class :${a}()`;throw new DOMException(t,c.NOT_SUPPORTED_ERR)}break}case"host":case"host-context":break;case"contains":{if(d){const t=`Unknown pseudo-class :${a}()`;throw new DOMException(t,c.NOT_SUPPORTED_ERR)}break}default:if(!u){const t=`Unknown pseudo-class :${a}()`;throw new DOMException(t,c.SYNTAX_ERR)}}else switch(a){case"any-link":case"link":{c.REG_ANCHOR.test(f)&&e.hasAttribute("href")&&i.add(e);break}case"local-link":{if(c.REG_ANCHOR.test(f)&&e.hasAttribute("href")){const{href:t,origin:s,pathname:o}=new URL(this.#s.URL),m=new URL(e.getAttribute("href"),t);m.origin===s&&m.pathname===o&&i.add(e)}break}case"visited":break;case"hover":{const{target:t,type:s}=this.#m??{};(s==="mouseover"||s==="pointerover")&&e.contains(t)&&i.add(e);break}case"active":{const{buttons:t,target:s,type:o}=this.#m??{};(o==="mousedown"||o==="pointerdown")&&t&c.BIT_01&&e.contains(s)&&i.add(e);break}case"target":{const{hash:t}=new URL(this.#s.URL);e.id&&t===`#${e.id}`&&this.#s.contains(e)&&i.add(e);break}case"target-within":{const{hash:t}=new URL(this.#s.URL);if(t){const s=t.replace(/^#/,"");let o=this.#s.getElementById(s);for(;o;){if(o===e){i.add(e);break}o=o.parentNode}}break}case"scope":{this.#e.nodeType===c.ELEMENT_NODE?!this.#u&&e===this.#e&&i.add(e):e===this.#s.documentElement&&i.add(e);break}case"focus":case"focus-visible":{const{target:t,type:s}=this.#m??{};if(e===this.#s.activeElement&&e.tabIndex>=0&&(a==="focus"||s==="keydown"&&e.contains(t))){let o=e,m=!0;for(;o;){if(o.disabled||o.hasAttribute("disabled")||o.hidden||o.hasAttribute("hidden")){m=!1;break}else{const{display:b,visibility:p}=this.#l.getComputedStyle(o);if(m=!(b==="none"||p==="hidden"),!m)break}if(o.parentNode&&o.parentNode.nodeType===c.ELEMENT_NODE)o=o.parentNode;else break}m&&i.add(e)}break}case"focus-within":{let t,s=this.#s.activeElement;if(s.tabIndex>=0)for(;s;){if(s===e){t=!0;break}s=s.parentNode}if(t){let o=e,m=!0;for(;o;){if(o.disabled||o.hasAttribute("disabled")||o.hidden||o.hasAttribute("hidden")){m=!1;break}else{const{display:b,visibility:p}=this.#l.getComputedStyle(o);if(m=!(b==="none"||p==="hidden"),!m)break}if(o.parentNode&&o.parentNode.nodeType===c.ELEMENT_NODE)o=o.parentNode;else break}m&&i.add(e)}break}case"open":{c.REG_INTERACT.test(f)&&e.hasAttribute("open")&&i.add(e);break}case"closed":{c.REG_INTERACT.test(f)&&!e.hasAttribute("open")&&i.add(e);break}case"disabled":{if(c.REG_FORM_CTRL.test(f)||(0,_.isCustomElement)(e,{formAssociated:!0}))if(e.disabled||e.hasAttribute("disabled"))i.add(e);else{let t=r;for(;t;){if(c.REG_FORM_GROUP.test(t.localName))if(t.localName==="fieldset"){if(t.disabled&&t.hasAttribute("disabled"))break}else break;t=t.parentNode}t&&r.localName!=="legend"&&(t.disabled||t.hasAttribute("disabled"))&&i.add(e)}break}case"enabled":{(c.REG_FORM_CTRL.test(f)||(0,_.isCustomElement)(e,{formAssociated:!0}))&&!(e.disabled&&e.hasAttribute("disabled"))&&i.add(e);break}case"read-only":{switch(f){case"textarea":{(e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled"))&&i.add(e);break}case"input":{(!e.type||c.REG_TYPE_DATE.test(e.type)||c.REG_TYPE_TEXT.test(e.type))&&(e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled"))&&i.add(e);break}default:(0,_.isContentEditable)(e)||i.add(e)}break}case"read-write":{switch(f){case"textarea":{e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled")||i.add(e);break}case"input":{(!e.type||c.REG_TYPE_DATE.test(e.type)||c.REG_TYPE_TEXT.test(e.type))&&!(e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled"))&&i.add(e);break}default:(0,_.isContentEditable)(e)&&i.add(e)}break}case"placeholder-shown":{let t;if(e.placeholder?t=e.placeholder:e.hasAttribute("placeholder")&&(t=e.getAttribute("placeholder")),typeof t=="string"&&!/[\r\n]/.test(t)){let s;f==="textarea"?s=e:f==="input"&&(e.hasAttribute("type")?c.REG_TYPE_TEXT.test(e.getAttribute("type"))&&(s=e):s=e),s&&e.value===""&&i.add(e)}break}case"checked":{(e.checked&&f==="input"&&e.hasAttribute("type")&&c.REG_TYPE_CHECK.test(e.getAttribute("type"))||e.selected&&f==="option")&&i.add(e);break}case"indeterminate":{if(e.indeterminate&&f==="input"&&e.type==="checkbox"||f==="progress"&&!e.hasAttribute("value"))i.add(e);else if(f==="input"&&e.type==="radio"&&!e.hasAttribute("checked")){const t=e.name;let s=e.parentNode;for(;s&&s.localName!=="form";)s=s.parentNode;s||(s=this.#s.documentElement);const o=s.getElementsByTagName("input"),m=o.length;let b;for(let p=0;p<m;p++){const w=o[p];if(w.getAttribute("type")==="radio"&&(t?w.getAttribute("name")===t&&(b=!!w.checked):w.hasAttribute("name")||(b=!!w.checked),b))break}b||i.add(e)}break}case"default":{if(f==="button"&&!(e.hasAttribute("type")&&c.REG_TYPE_RESET.test(e.getAttribute("type")))||f==="input"&&e.hasAttribute("type")&&c.REG_TYPE_SUBMIT.test(e.getAttribute("type"))){let t=e.parentNode;for(;t&&t.localName!=="form";)t=t.parentNode;if(t){const s=this.#n;let o=(0,_.traverseNode)(t,s);for(o=s.firstChild();o&&t.contains(o);){const m=o.localName;let b;if(m==="button"?b=!(o.hasAttribute("type")&&c.REG_TYPE_RESET.test(o.getAttribute("type"))):m==="input"&&(b=o.hasAttribute("type")&&c.REG_TYPE_SUBMIT.test(o.getAttribute("type"))),b){o===e&&i.add(e);break}o=s.nextNode()}}}else if(f==="input"&&e.hasAttribute("type")&&c.REG_TYPE_CHECK.test(e.getAttribute("type"))&&(e.checked||e.hasAttribute("checked")))i.add(e);else if(f==="option"){let t=r,s=!1;for(;t&&t.localName!=="datalist";){if(t.localName==="select"){(t.multiple||t.hasAttribute("multiple"))&&(s=!0);break}t=t.parentNode}if(s)(e.selected||e.hasAttribute("selected"))&&i.add(e);else{const o=new Set,m=this.#n;let b=(0,_.traverseNode)(r,m);for(b=m.firstChild();b;){if(b.selected||b.hasAttribute("selected")){o.add(b);break}b=m.nextSibling()}o.size&&o.has(e)&&i.add(e)}}break}case"valid":{if(c.REG_FORM_VALID.test(f))e.checkValidity()&&(e.maxLength>=0?e.maxLength>=e.value.length&&i.add(e):i.add(e));else if(f==="fieldset"){const t=this.#n;let s=(0,_.traverseNode)(e,t);s=t.firstChild();let o;if(!s)o=!0;else for(;s&&e.contains(s)&&!(c.REG_FORM_VALID.test(s.localName)&&(s.checkValidity()?s.maxLength>=0?o=s.maxLength>=s.value.length:o=!0:o=!1,!o));)s=t.nextNode();o&&i.add(e)}break}case"invalid":{if(c.REG_FORM_VALID.test(f))e.checkValidity()?e.maxLength>=0&&e.maxLength<e.value.length&&i.add(e):i.add(e);else if(f==="fieldset"){const t=this.#n;let s=(0,_.traverseNode)(e,t);s=t.firstChild();let o;if(!s)o=!0;else for(;s&&e.contains(s)&&!(c.REG_FORM_VALID.test(s.localName)&&(s.checkValidity()?s.maxLength>=0?o=s.maxLength>=s.value.length:o=!0:o=!1,!o));)s=t.nextNode();o||i.add(e)}break}case"in-range":{f==="input"&&!(e.readonly||e.hasAttribute("readonly"))&&!(e.disabled||e.hasAttribute("disabled"))&&e.hasAttribute("type")&&c.REG_TYPE_RANGE.test(e.getAttribute("type"))&&!(e.validity.rangeUnderflow||e.validity.rangeOverflow)&&(e.hasAttribute("min")||e.hasAttribute("max")||e.getAttribute("type")==="range")&&i.add(e);break}case"out-of-range":{f==="input"&&!(e.readonly||e.hasAttribute("readonly"))&&!(e.disabled||e.hasAttribute("disabled"))&&e.hasAttribute("type")&&c.REG_TYPE_RANGE.test(e.getAttribute("type"))&&(e.validity.rangeUnderflow||e.validity.rangeOverflow)&&i.add(e);break}case"required":{let t;if(/^(?:select|textarea)$/.test(f))t=e;else if(f==="input")if(e.hasAttribute("type")){const s=e.getAttribute("type");(s==="file"||c.REG_TYPE_CHECK.test(s)||c.REG_TYPE_DATE.test(s)||c.REG_TYPE_TEXT.test(s))&&(t=e)}else t=e;t&&(e.required||e.hasAttribute("required"))&&i.add(e);break}case"optional":{let t;if(/^(?:select|textarea)$/.test(f))t=e;else if(f==="input")if(e.hasAttribute("type")){const s=e.getAttribute("type");(s==="file"||c.REG_TYPE_CHECK.test(s)||c.REG_TYPE_DATE.test(s)||c.REG_TYPE_TEXT.test(s))&&(t=e)}else t=e;t&&!(e.required||e.hasAttribute("required"))&&i.add(e);break}case"root":{e===this.#s.documentElement&&i.add(e);break}case"empty":{if(e.hasChildNodes()){const t=this.#r.createTreeWalker(e,c.SHOW_ALL);let s=t.firstChild(),o;for(;s&&(o=s.nodeType!==c.ELEMENT_NODE&&s.nodeType!==c.TEXT_NODE,!!o);)s=t.nextSibling();o&&i.add(e)}else i.add(e);break}case"first-child":{(r&&e===r.firstElementChild||e===this.#t)&&i.add(e);break}case"last-child":{(r&&e===r.lastElementChild||e===this.#t)&&i.add(e);break}case"only-child":{(r&&e===r.firstElementChild&&e===r.lastElementChild||e===this.#t)&&i.add(e);break}case"first-of-type":{if(r){const[t]=this._collectNthOfType({a:0,b:1},e);t&&i.add(t)}else e===this.#t&&i.add(e);break}case"last-of-type":{if(r){const[t]=this._collectNthOfType({a:0,b:1,reverse:!0},e);t&&i.add(t)}else e===this.#t&&i.add(e);break}case"only-of-type":{if(r){const[t]=this._collectNthOfType({a:0,b:1},e);if(t===e){const[s]=this._collectNthOfType({a:0,b:1,reverse:!0},e);s===e&&i.add(e)}}else e===this.#t&&i.add(e);break}case"defined":{e.hasAttribute("is")||f.includes("-")?(0,_.isCustomElement)(e)&&i.add(e):(e instanceof this.#l.HTMLElement||e instanceof this.#l.SVGElement)&&i.add(e);break}case"popover-open":{if(e.popover){const{display:t}=this.#l.getComputedStyle(e);t!=="none"&&i.add(e)}break}case"host":case"host-context":break;case"after":case"before":case"first-letter":case"first-line":{if(d){const t=`Unsupported pseudo-element ::${a}`;throw new DOMException(t,c.NOT_SUPPORTED_ERR)}break}case"autofill":case"blank":case"buffering":case"current":case"fullscreen":case"future":case"modal":case"muted":case"past":case"paused":case"picture-in-picture":case"playing":case"seeking":case"stalled":case"user-invalid":case"user-valid":case"volume-locked":case"-webkit-autofill":{if(d){const t=`Unsupported pseudo-class :${a}`;throw new DOMException(t,c.NOT_SUPPORTED_ERR)}break}default:if(a.startsWith("-webkit-")){if(d){const t=`Unsupported pseudo-class :${a}`;throw new DOMException(t,c.NOT_SUPPORTED_ERR)}}else if(!u){const t=`Unknown pseudo-class :${a}`;throw new DOMException(t,c.SYNTAX_ERR)}}return i}_matchShadowHostPseudoClass(l,e){const{children:h,name:n}=l;let a;if(Array.isArray(h)){const{branches:f}=(0,y.walkAST)(h[0]),[r]=f,[...u]=r,{host:d}=e;if(n==="host"){let i;for(const t of u){const{type:s}=t;if(s===c.COMBINATOR){const m=`Invalid selector ${(0,y.generateCSS)(l)}`;throw new DOMException(m,c.SYNTAX_ERR)}if(i=this._matchSelector(t,d).has(d),!i)break}i&&(a=e)}else if(n==="host-context"){let i=d,t;for(;i;){for(const s of u){const{type:o}=s;if(o===c.COMBINATOR){const b=`Invalid selector ${(0,y.generateCSS)(l)}`;throw new DOMException(b,c.SYNTAX_ERR)}if(t=this._matchSelector(s,i).has(i),!t)break}if(t)break;i=i.parentNode}t&&(a=e)}}else if(n==="host")a=e;else{const f=`Invalid selector :${n}`;throw new DOMException(f,c.SYNTAX_ERR)}return a??null}_matchSelector(l,e,h){const{type:n}=l,a=new Set;if(l.name===c.EMPTY)return a;const f=(0,y.unescapeSelector)(l.name);if(typeof f=="string"&&f!==l.name&&(l.name=f),e.nodeType===c.ELEMENT_NODE)switch(n){case c.SELECTOR_PSEUDO_ELEMENT:{O.matcher.matchPseudoElementSelector(f,h);break}case c.SELECTOR_ID:{e.id===f&&a.add(e);break}case c.SELECTOR_CLASS:{e.classList.contains(f)&&a.add(e);break}case c.SELECTOR_PSEUDO_CLASS:return this._matchPseudoClassSelector(l,e,h);default:{const r=O.matcher.matchSelector(l,e,h);r&&a.add(r)}}else if(this.#u&&n===c.SELECTOR_PSEUDO_CLASS&&e.nodeType===c.DOCUMENT_FRAGMENT_NODE){if(f!=="has"&&c.REG_LOGICAL_PSEUDO.test(f))return this._matchPseudoClassSelector(l,e,h);if(c.REG_SHADOW_HOST.test(f)){const r=this._matchShadowHostPseudoClass(l,e,h);r&&a.add(r)}}return a}_matchLeaves(l,e,h){const{attributes:n,localName:a,nodeType:f}=e;let r=this.#_.get(l),u;if(r&&r.has(e)){const{attr:d,matched:i}=r.get(e);n?.length===d&&(u=i)}if(typeof u!="boolean"){let d;f===c.ELEMENT_NODE&&c.REG_FORM.test(a)?d=!1:d=!0;for(const i of l){const{name:t,type:s}=i;if(s===c.SELECTOR_PSEUDO_CLASS&&t==="dir"&&(d=!1),u=this._matchSelector(i,e,h).has(e),!u)break}d&&(r||(r=new WeakMap),r.set(e,{attr:n?.length,matched:u}),this.#_.set(l,r))}return!!u}_matchHTMLCollection(l,e={}){const{compound:h,filterLeaves:n}=e,a=new Set,f=l.length;if(f)if(h)for(let r=0;r<f;r++){const u=l[r];this._matchLeaves(n,u,e)&&a.add(u)}else{const r=[].slice.call(l);return new Set(r)}return a}_findDescendantNodes(l,e,h){const[n,...a]=l,f=a.length>0,{type:r}=n,u=(0,y.unescapeSelector)(n.name);typeof u=="string"&&u!==n.name&&(n.name=u);let d=new Set,i=!1;if(this.#u)i=!0;else switch(r){case c.SELECTOR_PSEUDO_ELEMENT:{O.matcher.matchPseudoElementSelector(u,h);break}case c.SELECTOR_ID:{if(this.#t.nodeType===c.ELEMENT_NODE)i=!0;else{const t=this.#t.getElementById(u);t&&t!==e&&e.contains(t)&&(f?this._matchLeaves(a,t,h)&&d.add(t):d.add(t))}break}case c.SELECTOR_CLASS:{const t=e.getElementsByClassName(u);d=this._matchHTMLCollection(t,{compound:f,filterLeaves:a});break}case c.SELECTOR_TYPE:{if(this.#s.contentType==="text/html"&&!/[*|]/.test(u)){const t=e.getElementsByTagName(u);d=this._matchHTMLCollection(t,{compound:f,filterLeaves:a})}else i=!0;break}default:i=!0}return{nodes:d,pending:i}}_matchCombinator(l,e,h={}){const{combo:n,leaves:a}=l,{name:f}=n,{parentNode:r}=e,{dir:u}=h,d=new Set;if(u===x)switch(f){case"+":{const i=e.nextElementSibling;i&&this._matchLeaves(a,i,h)&&d.add(i);break}case"~":{if(r){const i=this._createTreeWalker(r);let t=(0,_.traverseNode)(e,i);for(t=i.nextSibling();t;)this._matchLeaves(a,t,h)&&d.add(t),t=i.nextSibling()}break}case">":{const i=this._createTreeWalker(e);let t=(0,_.traverseNode)(e,i);for(t=i.firstChild();t;)this._matchLeaves(a,t,h)&&d.add(t),t=i.nextSibling();break}case" ":default:{const{nodes:i,pending:t}=this._findDescendantNodes(a,e);if(i.size)return i;if(t){const s=this._createTreeWalker(e);let o=(0,_.traverseNode)(e,s);for(o=s.nextNode();o&&e.contains(o);)this._matchLeaves(a,o,h)&&d.add(o),o=s.nextNode()}}}else switch(f){case"+":{const i=e.previousElementSibling;i&&this._matchLeaves(a,i,h)&&d.add(i);break}case"~":{if(r){const i=this._createTreeWalker(r);let t=(0,_.traverseNode)(r,i);for(t=i.firstChild();t&&t!==e;)this._matchLeaves(a,t,h)&&d.add(t),t=i.nextSibling()}break}case">":{r&&this._matchLeaves(a,r,h)&&d.add(r);break}case" ":default:{const i=[];let t=r;for(;t;)this._matchLeaves(a,t,h)&&i.push(t),t=t.parentNode;if(i.length)return new Set(i.reverse())}}return d}_findNode(l,e){const{node:h}=e;let n=(0,_.traverseNode)(h,this.#o),a;if(n)for(n.nodeType!==c.ELEMENT_NODE?n=this.#o.nextNode():n===h&&n!==this.#t&&(n=this.#o.nextNode());n;){if(this._matchLeaves(l,n,{warn:this.#i})){a=n;break}n=this.#o.nextNode()}return a??null}_matchSelf(l){const e=[],h=this._matchLeaves(l,this.#e,{warn:this.#i});let n=!1;return h&&(e.push(this.#e),n=!0),[e,n]}_findLineal(l,e={}){const{complex:h}=e,n=[];let a=this._matchLeaves(l,this.#e,{warn:this.#i}),f=!1;if(a&&(n.push(this.#e),f=!0),!a||h){let r=this.#e.parentNode;for(;r&&(a=this._matchLeaves(l,r,{warn:this.#i}),a&&(n.push(r),f=!0),r.parentNode);)r=r.parentNode}return[n,f]}_findFirst(l){const e=[],h=this._findNode(l,{node:this.#e});let n=!1;return h&&(e.push(h),n=!0),[e,n]}_findFromHTMLCollection(l,e={}){const{complex:h,compound:n,filterLeaves:a,targetType:f}=e;let r=[],u=!1,d=!1;const i=l.length;if(i)if(this.#e.nodeType===c.ELEMENT_NODE)for(let t=0;t<i;t++){const s=l[t];if(s!==this.#e&&(this.#e.contains(s)||s.contains(this.#e))){if(n){if(this._matchLeaves(a,s,{warn:this.#i})&&(r.push(s),u=!0,f===E))break}else if(r.push(s),u=!0,f===E)break}}else if(h)if(n)for(let t=0;t<i;t++){const s=l[t];if(this._matchLeaves(a,s,{warn:this.#i})&&(r.push(s),u=!0,f===E))break}else r=[].slice.call(l),u=!0,d=!0;else if(n)for(let t=0;t<i;t++){const s=l[t];if(this._matchLeaves(a,s,{warn:this.#i})&&(r.push(s),u=!0,f===E))break}else r=[].slice.call(l),u=!0,d=!0;return[r,u,d]}_findEntryNodes(l,e,h){const{leaves:n}=l,[a,...f]=n,r=f.length>0,{name:u,type:d}=a;let i=[],t=!1,s=!1,o=!1;switch(d){case c.SELECTOR_PSEUDO_ELEMENT:{O.matcher.matchPseudoElementSelector(u,{warn:this.#i});break}case c.SELECTOR_ID:{if(e===R)[i,s]=this._matchSelf(n);else if(e===C)[i,s]=this._findLineal(n,{complex:h});else if(e===E&&this.#t.nodeType!==c.ELEMENT_NODE){const m=this.#t.getElementById(u);m&&(r?this._matchLeaves(f,m,{warn:this.#i})&&(i.push(m),s=!0):(i.push(m),s=!0))}else e===E?[i,s]=this._findFirst(n):o=!0;break}case c.SELECTOR_CLASS:{if(e===R)[i,s]=this._matchSelf(n);else if(e===C)[i,s]=this._findLineal(n,{complex:h});else if(this.#t.nodeType===c.DOCUMENT_NODE){const m=this.#t.getElementsByClassName(u);m.length&&([i,s,t]=this._findFromHTMLCollection(m,{complex:h,compound:r,filterLeaves:f,targetType:e}))}else e===E?[i,s]=this._findFirst(n):o=!0;break}case c.SELECTOR_TYPE:{if(e===R)[i,s]=this._matchSelf(n);else if(e===C)[i,s]=this._findLineal(n,{complex:h});else if(this.#s.contentType==="text/html"&&this.#t.nodeType===c.DOCUMENT_NODE&&!/[*|]/.test(u)){const m=this.#t.getElementsByTagName(u);m.length&&([i,s,t]=this._findFromHTMLCollection(m,{complex:h,compound:r,filterLeaves:f,targetType:e}))}else e===E?[i,s]=this._findFirst(n):o=!0;break}default:if(e!==C&&c.REG_SHADOW_HOST.test(u)){if(this.#u&&this.#e.nodeType===c.DOCUMENT_FRAGMENT_NODE){const m=this._matchShadowHostPseudoClass(a,this.#e);m&&(i.push(m),s=!0)}}else e===R?[i,s]=this._matchSelf(n):e===C?[i,s]=this._findLineal(n,{complex:h}):e===E?[i,s]=this._findFirst(n):o=!0}return{collected:t,compound:r,filtered:s,nodes:i,pending:o}}_collectNodes(l){const e=this.#a.values();if(l===L||l===E){const h=new Set;let n=0;for(const{branch:a}of e){const f=a.length,r=f>1,u=a[0];let d,i;if(r){const{combo:p,leaves:[{name:w,type:k}]}=u,N=a[f-1],{leaves:[{name:A,type:v}]}=N;if(v===c.SELECTOR_PSEUDO_ELEMENT||v===c.SELECTOR_ID)d=S,i=N;else if(k===c.SELECTOR_PSEUDO_ELEMENT||k===c.SELECTOR_ID)d=x,i=u;else if(l===L)if(w==="*"&&k===c.SELECTOR_TYPE)d=S,i=N;else if(A==="*"&&v===c.SELECTOR_TYPE)d=x,i=u;else if(f===2){const{name:T}=p;/^[+~]$/.test(T)?(d=S,i=N):(d=x,i=u)}else d=x,i=u;else if(A==="*"&&v===c.SELECTOR_TYPE)d=x,i=u;else if(w==="*"&&k===c.SELECTOR_TYPE)d=S,i=N;else{let T;for(const{combo:P,leaves:[U]}of a){const{name:G,type:$}=U;if($===c.SELECTOR_PSEUDO_CLASS&&G==="dir"){T=!1;break}if(!T&&P){const{name:F}=P;/^[+~]$/.test(F)&&(T=!0)}}T?(d=x,i=u):(d=S,i=N)}}else d=S,i=u;const{collected:t,compound:s,filtered:o,nodes:m,pending:b}=this._findEntryNodes(i,l,r);m.length?(this.#a[n].find=!0,this.#d[n]=m):b&&h.add(new Map([["index",n],["twig",i]])),this.#a[n].collected=t,this.#a[n].dir=d,this.#a[n].filtered=o||!s,n++}if(h.size){let a,f;this.#e!==this.#t&&this.#e.nodeType===c.ELEMENT_NODE?(a=this.#e,f=this.#o):(a=this.#t,f=this.#n);let r=(0,_.traverseNode)(a,f);for(;r;){let u=!1;if(this.#e.nodeType===c.ELEMENT_NODE?r===this.#e?u=!0:u=this.#e.contains(r):u=!0,u)for(const d of h){const{leaves:i}=d.get("twig");if(this._matchLeaves(i,r,{warn:this.#i})){const s=d.get("index");this.#a[s].filtered=!0,this.#a[s].find=!0,this.#d[s].push(r)}}r!==f.currentNode&&(r=(0,_.traverseNode)(r,f)),r=f.nextNode()}}}else{let h=0;for(const{branch:n}of e){const a=n[n.length-1],f=n.length>1,{compound:r,filtered:u,nodes:d}=this._findEntryNodes(a,l,f);d.length&&(this.#a[h].find=!0,this.#d[h]=d),this.#a[h].dir=S,this.#a[h].filtered=u||!r,h++}}return[this.#a,this.#d]}_getCombinedNodes(l,e,h){const n=[];for(const a of e){const f=this._matchCombinator(l,a,{dir:h,warn:this.#i});f.size&&n.push(...f)}return n.length?new Set(n):new Set}_matchNodeNext(l,e,h){const{combo:n,index:a}=h,{combo:f,leaves:r}=l[a],u={combo:n,leaves:r},d=this._getCombinedNodes(u,e,x);let i;if(d.size)if(a===l.length-1){const[t]=(0,_.sortNodes)(d);i=t}else i=this._matchNodeNext(l,d,{combo:f,index:a+1});return i??null}_matchNodePrev(l,e,h){const{index:n}=h,a=l[n],f=new Set([e]),r=this._getCombinedNodes(a,f,S);let u;if(r.size){if(n===0)u=e;else for(const d of r)if(this._matchNodePrev(l,d,{index:n-1}))return e}return u??null}_find(l){(l===L||l===E)&&this._prepareQuerySelectorWalker();const[[...e],h]=this._collectNodes(l),n=e.length;let a=new Set;for(let f=0;f<n;f++){const{branch:r,collected:u,dir:d,find:i}=e[f],t=r.length;if(t&&i){const s=h[f],o=s.length,m=t-1;if(m===0)if((l===L||l===E)&&this.#e.nodeType===c.ELEMENT_NODE)for(let b=0;b<o;b++){const p=s[b];if(p!==this.#e&&this.#e.contains(p)&&(a.add(p),l!==L))break}else if(l===L)if(a.size){const b=[...a];a=new Set([...b,...s]),this.#b=!0}else a=new Set(s);else{const[b]=s;a.add(b)}else if(l===L)if(d===x){let{combo:b}=r[0];for(const p of s){let w=new Set([p]);for(let k=1;k<t;k++){const{combo:N,leaves:A}=r[k],v={combo:b,leaves:A};if(w=this._getCombinedNodes(v,w,d),w.size)if(k===m)if(a.size){const T=[...a];a=new Set([...T,...w]),this.#b=!0}else a=w;else b=N;else break}}}else for(const b of s){let p=new Set([b]);for(let w=m-1;w>=0;w--){const k=r[w];if(p=this._getCombinedNodes(k,p,d),p.size)w===0&&(a.add(b),t>1&&a.size>1&&(this.#b=!0));else break}}else if(l===E&&d===x){const{combo:b}=r[0];let p;for(const w of s)if(p=this._matchNodeNext(r,new Set([w]),{combo:b,index:1}),p){a.add(p);break}if(!p&&!u){const{leaves:w}=r[0],[k]=s;let N=this._findNode(w,{node:k});for(;N;){if(p=this._matchNodeNext(r,new Set([N]),{combo:b,index:1}),p){a.add(p);break}N=this._findNode(w,{node:N})}}}else{let b;for(const p of s)if(b=this._matchNodePrev(r,p,{index:m-1}),b){a.add(p);break}if(!b&&!u&&l===E){const{leaves:p}=r[m],[w]=s;let k=this._findNode(p,{node:w});for(;k;){if(b=this._matchNodePrev(r,k,{index:m-1}),b){a.add(k);break}k=this._findNode(p,{node:k})}}}}}return a}matches(l,e,h){let n;try{if(e?.nodeType!==c.ELEMENT_NODE){const r=`Unexpected node ${e?.nodeName}`;throw new TypeError(r)}const a=e.ownerDocument;if(a===this.#r&&a.contentType==="text/html"){const r={complex:c.REG_COMPLEX_A.test(l),descendant:!0};if((0,y.filterSelector)(l,r))return this.#f.match(l,e)}this._setup(l,e,h),n=this._find(R).size}catch(a){this._onError(a)}return!!n}closest(l,e,h){let n;try{if(e?.nodeType!==c.ELEMENT_NODE){const r=`Unexpected node ${e?.nodeName}`;throw new TypeError(r)}const a=e.ownerDocument;if(a===this.#r&&a.contentType==="text/html"){const r={complex:c.REG_COMPLEX_A.test(l),descendant:!0};if((0,y.filterSelector)(l,r))return this.#f.closest(l,e)}this._setup(l,e,h);const f=this._find(C);if(f.size){let r=this.#e;for(;r;){if(f.has(r)){n=r;break}r=r.parentNode}}}catch(a){this._onError(a)}return n??null}querySelector(l,e,h){let n;try{(0,_.verifyNode)(e);let a;if(e.nodeType===c.DOCUMENT_NODE?a=e:a=e.ownerDocument,a===this.#r&&a.contentType==="text/html"){const r={complex:c.REG_COMPLEX_B.test(l),descendant:!1};if((0,y.filterSelector)(l,r))return this.#f.first(l,e)}this._setup(l,e,h);const f=this._find(E);f.delete(this.#e),f.size&&([n]=(0,_.sortNodes)(f))}catch(a){this._onError(a)}return n??null}querySelectorAll(l,e,h){let n;try{(0,_.verifyNode)(e);let a;if(e.nodeType===c.DOCUMENT_NODE?a=e:a=e.ownerDocument,a===this.#r&&a.contentType==="text/html"){const r={complex:c.REG_COMPLEX_B.test(l),descendant:!0};if((0,y.filterSelector)(l,r))return this.#f.select(l,e)}this._setup(l,e,h);const f=this._find(L);f.delete(this.#e),f.size&&(this.#b?n=(0,_.sortNodes)(f):n=[...f])}catch(a){this._onError(a)}return n??[]}}0&&(module.exports={Finder});
//# sourceMappingURL=finder.js.map
