var H=Object.create;var D=Object.defineProperty;var B=Object.getOwnPropertyDescriptor;var j=Object.getOwnPropertyNames;var Y=Object.getPrototypeOf,q=Object.prototype.hasOwnProperty;var V=(g,a)=>{for(var e in a)D(g,e,{get:a[e],enumerable:!0})},I=(g,a,e,o)=>{if(a&&typeof a=="object"||typeof a=="function")for(let r of j(a))!q.call(g,r)&&r!==e&&D(g,r,{get:()=>a[r],enumerable:!(o=B(a,r))||o.enumerable});return g};var U=(g,a,e)=>(e=g!=null?H(Y(g)):{},I(a||!g||!g.__esModule?D(e,"default",{value:g,enumerable:!0}):e,g)),X=g=>I(D({},"__esModule",{value:!0}),g);var Q={};V(Q,{Finder:()=>K});module.exports=X(Q);var M=U(require("is-potential-custom-element-name"),1),G=U(require("@asamuzakjp/nwsapi"),1),E=require("./dom-util.js"),O=require("./matcher.js"),k=require("./parser.js"),n=require("./constant.js");const x="next",S="prev",L="all",y="first",C="lineal",R="self";class K{#l;#r;#s;#p;#c;#b;#e;#h;#w;#f;#o;#_;#t;#d;#u;#n;#m;#i;#a;constructor(a,e){this.#a=a,this.#c=e??a.document,this.#r=new WeakMap,this.#_=new WeakMap,this._initNwsapi()}_onError(a){if(!this.#w)if(a instanceof DOMException||a instanceof this.#a.DOMException)if(a.name===n.NOT_SUPPORTED_ERR)this.#i&&console.warn(a.message);else throw new this.#a.DOMException(a.message,a.name);else throw a}_setup(a,e,o={}){const{event:r,invalidate:l,noexcept:f,warn:c}=o;return(typeof a=="string"&&a.includes(":has(")||l&&e.nodeType===n.ELEMENT_NODE)&&(this.#r=new WeakMap),this.#w=!!f,this.#i=!!c,this.#b=this._setEvent(r),this.#e=e,[this.#s,this.#t,this.#n]=(0,E.resolveContent)(e),this.#d=(0,E.isInShadowTree)(e),[this.#l,this.#h]=this._correspond(a),this.#m=new WeakMap,e}_initNwsapi(){return this.#f=(0,G.default)({DOMException:this.#a.DOMException,document:this.#c}),this.#f.configure({LOGERRORS:!1}),this.#f}_setEvent(a){return a instanceof this.#a.MouseEvent||a instanceof this.#a.KeyboardEvent?a:null}_correspond(a){const e=[];this.#p=!1;let o;if(this.#s){const r=this.#r.get(this.#s);if(r&&r.has(`${a}`)){const l=r.get(`${a}`);this.#p=l.descendant,o=l.ast}}if(o){const r=o.length;for(let l=0;l<r;l++)o[l].collected=!1,o[l].dir=null,o[l].filtered=!1,o[l].find=!1,e[l]=[]}else{let r;try{r=(0,k.parseSelector)(a)}catch(u){this._onError(u)}const l=(0,k.walkAST)(r);let f=!1,c=0;o=[];for(const[...u]of l){const h=[];let i=u.shift();if(i&&i.type!==n.COMBINATOR){const t=new Set;for(;i;){if(i.type===n.COMBINATOR){const[s]=u;if(s.type===n.COMBINATOR){const m=`Invalid selector ${a}`;throw new DOMException(m,n.SYNTAX_ERR)}const d=i.name;/^[\s>]$/.test(d)&&(f=!0),h.push({combo:i,leaves:(0,k.sortAST)(t)}),t.clear()}else if(i){let{name:s}=i;s&&typeof s=="string"&&(s=(0,k.unescapeSelector)(s),typeof s=="string"&&s!==i.name&&(i.name=s),/[|:]/.test(s)&&(i.namespace=!0)),t.add(i)}if(u.length)i=u.shift();else{h.push({combo:null,leaves:(0,k.sortAST)(t)}),t.clear();break}}}o.push({branch:h,collected:!1,dir:null,filtered:!1,find:!1}),e[c]=[],c++}if(this.#s){let u;this.#r.has(this.#s)?u=this.#r.get(this.#s):u=new Map,u.set(`${a}`,{ast:o,descendant:f}),this.#r.set(this.#s,u)}this.#p=f}return[o,e]}_createTreeWalker(a){let e;return this.#m.has(a)?e=this.#m.get(a):(e=this.#c.createTreeWalker(a,n.WALKER_FILTER),this.#m.set(a,e)),e}_prepareQuerySelectorWalker(){return this.#o=this._createTreeWalker(this.#e),this.#u=!1,this.#o}_traverse(a,e=this.#n){let o=e.currentNode,r;if(o===a)r=o;else if(o.contains(a))for(o=e.nextNode();o;){if(o===a){r=o;break}o=e.nextNode()}else{if(o!==e.root)for(;o&&!(o===e.root||o===a);)o=e.parentNode();if(a?.nodeType===n.ELEMENT_NODE)for(;o;){if(o===a){r=o;break}o=e.nextNode()}else r=o}return r??null}_collectNthChild(a,e,o){const{a:r,b:l,reverse:f,selector:c}=a,{parentNode:u}=e,h=new Set;let i;if(c&&(this.#r.has(c)?i=this.#r.get(c):(i=(0,k.walkAST)(c),this.#r.set(c,i))),u){const t=this.#n;let s=this._traverse(u,t);s=t.firstChild();let d=0;for(;s;)d++,s=t.nextSibling();s=this._traverse(u,t);const m=new Set;if(i)for(s=t.firstChild();s;){let b;for(const p of i)if(b=this._matchLeaves(p,s,o),!b)break;b&&m.add(s),s=t.nextSibling()}if(r===0){if(l>0&&l<=d){if(m.size){s=this._traverse(u,t),f?s=t.lastChild():s=t.firstChild();let b=0;for(;s;){if(m.has(s)){if(b===l-1){h.add(s);break}b++}f?s=t.previousSibling():s=t.nextSibling()}}else if(!c){s=this._traverse(u,t),f?s=t.lastChild():s=t.firstChild();let b=0;for(;s;){if(b===l-1){h.add(s);break}f?s=t.previousSibling():s=t.nextSibling(),b++}}}}else{let b=l-1;if(r>0)for(;b<0;)b+=r;if(b>=0&&b<d){s=this._traverse(u,t),f?s=t.lastChild():s=t.firstChild();let p=0,_=r>0?0:l-1;for(;s&&(s&&b>=0&&b<d);)m.size?m.has(s)&&(_===b&&(h.add(s),b+=r),r>0?_++:_--):p===b&&(c||h.add(s),b+=r),f?s=t.previousSibling():s=t.nextSibling(),p++}}if(f&&h.size>1){const b=[...h];return new Set(b.reverse())}}else if(e===this.#t&&r+l===1)if(i){let t;for(const s of i)if(t=this._matchLeaves(s,e,o),t)break;t&&h.add(e)}else h.add(e);return h}_collectNthOfType(a,e){const{a:o,b:r,reverse:l}=a,{localName:f,parentNode:c,prefix:u}=e,h=new Set;if(c){const i=this.#n;let t=this._traverse(c,i);t=i.firstChild();let s=0;for(;t;)s++,t=i.nextSibling();if(o===0){if(r>0&&r<=s){t=this._traverse(c,i),l?t=i.lastChild():t=i.firstChild();let d=0;for(;t;){const{localName:m,prefix:b}=t;if(m===f&&b===u){if(d===r-1){h.add(t);break}d++}l?t=i.previousSibling():t=i.nextSibling()}}}else{let d=r-1;if(o>0)for(;d<0;)d+=o;if(d>=0&&d<s){t=this._traverse(c,i),l?t=i.lastChild():t=i.firstChild();let m=o>0?0:r-1;for(;t;){const{localName:b,prefix:p}=t;if(b===f&&p===u){if(m===d&&(h.add(t),d+=o),d<0||d>=s)break;o>0?m++:m--}l?t=i.previousSibling():t=i.nextSibling()}}}if(l&&h.size>1){const d=[...h];return new Set(d.reverse())}}else e===this.#t&&o+r===1&&h.add(e);return h}_matchAnPlusB(a,e,o,r){const{nth:{a:l,b:f,name:c},selector:u}=a,h=new Map;if(c?(c==="even"?(h.set("a",2),h.set("b",0)):c==="odd"&&(h.set("a",2),h.set("b",1)),o.indexOf("last")>-1&&h.set("reverse",!0)):(typeof l=="string"&&/-?\d+/.test(l)?h.set("a",l*1):h.set("a",0),typeof f=="string"&&/-?\d+/.test(f)?h.set("b",f*1):h.set("b",0),o.indexOf("last")>-1&&h.set("reverse",!0)),/^nth-(?:last-)?child$/.test(o)){u&&h.set("selector",u);const i=Object.fromEntries(h);return this._collectNthChild(i,e,r)}else if(/^nth-(?:last-)?of-type$/.test(o)){const i=Object.fromEntries(h);return this._collectNthOfType(i,e)}return new Set}_matchHasPseudoFunc(a,e,o={}){let r;if(Array.isArray(a)&&a.length){const[l]=a,{type:f}=l;let c;f===n.COMBINATOR?c=a.shift():c={name:" ",type:n.COMBINATOR};const u=[];for(;a.length;){const[t]=a,{type:s}=t;if(s===n.COMBINATOR)break;u.push(a.shift())}const h={combo:c,leaves:u};o.dir=x;const i=this._matchCombinator(h,e,o);if(i.size)if(a.length){for(const t of i)if(r=this._matchHasPseudoFunc(Object.assign([],a),t,o),r)break}else r=!0}return!!r}_matchLogicalPseudoFunc(a,e,o={}){const{astName:r="",branches:l=[],selector:f="",twigBranches:c=[]}=a;let u;if(r==="has")if(f.includes(":has("))u=null;else{let h;for(const i of l)if(h=this._matchHasPseudoFunc(Object.assign([],i),e,o),h)break;h&&(u=e)}else{const h=/^(?:is|where)$/.test(r);o.forgive=h;const i=c.length;let t;for(let s=0;s<i;s++){const d=c[s],m=d.length-1,{leaves:b}=d[m];if(t=this._matchLeaves(b,e,o),t&&m>0){let p=new Set([e]);for(let _=m-1;_>=0;_--){const w=d[_],N=[];o.dir=S;for(const A of p){const v=this._matchCombinator(w,A,o);v.size&&N.push(...v)}if(N.length)_===0?t=!0:p=new Set(N);else{t=!1;break}}}if(t)break}r==="not"?t||(u=e):t&&(u=e)}return u??null}_matchPseudoClassSelector(a,e,o={}){const{children:r,name:l}=a,{localName:f,parentNode:c}=e,{forgive:u,warn:h=this.#i}=o,i=new Set;if(n.REG_LOGICAL_PSEUDO.test(l)){let t;if(this.#r.has(a))t=this.#r.get(a);else{const d=(0,k.walkAST)(a),m=[],b=[];for(const[...p]of d){for(const A of p){const v=(0,k.generateCSS)(A);m.push(v)}const _=[],w=new Set;let N=p.shift();for(;N;)if(N.type===n.COMBINATOR?(_.push({combo:N,leaves:[...w]}),w.clear()):N&&w.add(N),p.length)N=p.shift();else{_.push({combo:null,leaves:[...w]}),w.clear();break}b.push(_)}t={astName:l,branches:d,twigBranches:b,selector:m.join(",")},this.#r.set(a,t)}const s=this._matchLogicalPseudoFunc(t,e,o);s&&i.add(s)}else if(Array.isArray(r))if(/^nth-(?:last-)?(?:child|of-type)$/.test(l)){const[t]=r;return this._matchAnPlusB(t,e,l,o)}else switch(l){case"dir":case"lang":{const t=O.matcher.matchSelector(a,e);t&&i.add(t);break}case"current":case"nth-col":case"nth-last-col":{if(h){const t=`Unsupported pseudo-class :${l}()`;throw new DOMException(t,n.NOT_SUPPORTED_ERR)}break}case"host":case"host-context":break;case"contains":{if(h){const t=`Unknown pseudo-class :${l}()`;throw new DOMException(t,n.NOT_SUPPORTED_ERR)}break}default:if(!u){const t=`Unknown pseudo-class :${l}()`;throw new DOMException(t,n.SYNTAX_ERR)}}else switch(l){case"any-link":case"link":{n.REG_ANCHOR.test(f)&&e.hasAttribute("href")&&i.add(e);break}case"local-link":{if(n.REG_ANCHOR.test(f)&&e.hasAttribute("href")){const{href:t,origin:s,pathname:d}=new URL(this.#s.URL),m=new URL(e.getAttribute("href"),t);m.origin===s&&m.pathname===d&&i.add(e)}break}case"visited":break;case"hover":{const{target:t,type:s}=this.#b??{};(s==="mouseover"||s==="pointerover")&&e.contains(t)&&i.add(e);break}case"active":{const{buttons:t,target:s,type:d}=this.#b??{};(d==="mousedown"||d==="pointerdown")&&t&n.BIT_01&&e.contains(s)&&i.add(e);break}case"target":{const{hash:t}=new URL(this.#s.URL);e.id&&t===`#${e.id}`&&this.#s.contains(e)&&i.add(e);break}case"target-within":{const{hash:t}=new URL(this.#s.URL);if(t){const s=t.replace(/^#/,"");let d=this.#s.getElementById(s);for(;d;){if(d===e){i.add(e);break}d=d.parentNode}}break}case"scope":{this.#e.nodeType===n.ELEMENT_NODE?!this.#d&&e===this.#e&&i.add(e):e===this.#s.documentElement&&i.add(e);break}case"focus":case"focus-visible":{const{target:t,type:s}=this.#b??{};if(e===this.#s.activeElement&&e.tabIndex>=0&&(l==="focus"||s==="keydown"&&e.contains(t))){let d=e,m=!0;for(;d;){if(d.disabled||d.hasAttribute("disabled")||d.hidden||d.hasAttribute("hidden")){m=!1;break}else{const{display:b,visibility:p}=this.#a.getComputedStyle(d);if(m=!(b==="none"||p==="hidden"),!m)break}if(d.parentNode&&d.parentNode.nodeType===n.ELEMENT_NODE)d=d.parentNode;else break}m&&i.add(e)}break}case"focus-within":{let t,s=this.#s.activeElement;if(s.tabIndex>=0)for(;s;){if(s===e){t=!0;break}s=s.parentNode}if(t){let d=e,m=!0;for(;d;){if(d.disabled||d.hasAttribute("disabled")||d.hidden||d.hasAttribute("hidden")){m=!1;break}else{const{display:b,visibility:p}=this.#a.getComputedStyle(d);if(m=!(b==="none"||p==="hidden"),!m)break}if(d.parentNode&&d.parentNode.nodeType===n.ELEMENT_NODE)d=d.parentNode;else break}m&&i.add(e)}break}case"open":{n.REG_INTERACT.test(f)&&e.hasAttribute("open")&&i.add(e);break}case"closed":{n.REG_INTERACT.test(f)&&!e.hasAttribute("open")&&i.add(e);break}case"disabled":{if(n.REG_FORM_CTRL.test(f)||(0,M.default)(f))if(e.disabled||e.hasAttribute("disabled"))i.add(e);else{let t=c;for(;t;){if(n.REG_FORM_GROUP.test(t.localName))if(t.localName==="fieldset"){if(t.disabled&&t.hasAttribute("disabled"))break}else break;t=t.parentNode}t&&c.localName!=="legend"&&(t.disabled||t.hasAttribute("disabled"))&&i.add(e)}break}case"enabled":{(n.REG_FORM_CTRL.test(f)||(0,M.default)(f))&&!(e.disabled&&e.hasAttribute("disabled"))&&i.add(e);break}case"read-only":{switch(f){case"textarea":{(e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled"))&&i.add(e);break}case"input":{(!e.type||n.REG_TYPE_DATE.test(e.type)||n.REG_TYPE_TEXT.test(e.type))&&(e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled"))&&i.add(e);break}default:(0,E.isContentEditable)(e)||i.add(e)}break}case"read-write":{switch(f){case"textarea":{e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled")||i.add(e);break}case"input":{(!e.type||n.REG_TYPE_DATE.test(e.type)||n.REG_TYPE_TEXT.test(e.type))&&!(e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled"))&&i.add(e);break}default:(0,E.isContentEditable)(e)&&i.add(e)}break}case"placeholder-shown":{let t;if(e.placeholder?t=e.placeholder:e.hasAttribute("placeholder")&&(t=e.getAttribute("placeholder")),typeof t=="string"&&!/[\r\n]/.test(t)){let s;f==="textarea"?s=e:f==="input"&&(e.hasAttribute("type")?n.REG_TYPE_TEXT.test(e.getAttribute("type"))&&(s=e):s=e),s&&e.value===""&&i.add(e)}break}case"checked":{(e.checked&&f==="input"&&e.hasAttribute("type")&&n.REG_TYPE_CHECK.test(e.getAttribute("type"))||e.selected&&f==="option")&&i.add(e);break}case"indeterminate":{if(e.indeterminate&&f==="input"&&e.type==="checkbox"||f==="progress"&&!e.hasAttribute("value"))i.add(e);else if(f==="input"&&e.type==="radio"&&!e.hasAttribute("checked")){const t=e.name;let s=e.parentNode;for(;s&&s.localName!=="form";)s=s.parentNode;s||(s=this.#s.documentElement);const d=s.getElementsByTagName("input"),m=d.length;let b;for(let p=0;p<m;p++){const _=d[p];if(_.getAttribute("type")==="radio"&&(t?_.getAttribute("name")===t&&(b=!!_.checked):_.hasAttribute("name")||(b=!!_.checked),b))break}b||i.add(e)}break}case"default":{if(f==="button"&&!(e.hasAttribute("type")&&n.REG_TYPE_RESET.test(e.getAttribute("type")))||f==="input"&&e.hasAttribute("type")&&n.REG_TYPE_SUBMIT.test(e.getAttribute("type"))){let t=e.parentNode;for(;t&&t.localName!=="form";)t=t.parentNode;if(t){const s=this.#n;let d=this._traverse(t,s);for(d=s.firstChild();d&&t.contains(d);){const m=d.localName;let b;if(m==="button"?b=!(d.hasAttribute("type")&&n.REG_TYPE_RESET.test(d.getAttribute("type"))):m==="input"&&(b=d.hasAttribute("type")&&n.REG_TYPE_SUBMIT.test(d.getAttribute("type"))),b){d===e&&i.add(e);break}d=s.nextNode()}}}else if(f==="input"&&e.hasAttribute("type")&&n.REG_TYPE_CHECK.test(e.getAttribute("type"))&&(e.checked||e.hasAttribute("checked")))i.add(e);else if(f==="option"){let t=c,s=!1;for(;t&&t.localName!=="datalist";){if(t.localName==="select"){(t.multiple||t.hasAttribute("multiple"))&&(s=!0);break}t=t.parentNode}if(s)(e.selected||e.hasAttribute("selected"))&&i.add(e);else{const d=new Set,m=this.#n;let b=this._traverse(c,m);for(b=m.firstChild();b;){if(b.selected||b.hasAttribute("selected")){d.add(b);break}b=m.nextSibling()}d.size&&d.has(e)&&i.add(e)}}break}case"valid":{if(n.REG_FORM_VALID.test(f))e.checkValidity()&&(e.maxLength>=0?e.maxLength>=e.value.length&&i.add(e):i.add(e));else if(f==="fieldset"){const t=this.#n;let s=this._traverse(e,t);s=t.firstChild();let d;if(!s)d=!0;else for(;s&&e.contains(s)&&!(n.REG_FORM_VALID.test(s.localName)&&(s.checkValidity()?s.maxLength>=0?d=s.maxLength>=s.value.length:d=!0:d=!1,!d));)s=t.nextNode();d&&i.add(e)}break}case"invalid":{if(n.REG_FORM_VALID.test(f))e.checkValidity()?e.maxLength>=0&&e.maxLength<e.value.length&&i.add(e):i.add(e);else if(f==="fieldset"){const t=this.#n;let s=this._traverse(e,t);s=t.firstChild();let d;if(!s)d=!0;else for(;s&&e.contains(s)&&!(n.REG_FORM_VALID.test(s.localName)&&(s.checkValidity()?s.maxLength>=0?d=s.maxLength>=s.value.length:d=!0:d=!1,!d));)s=t.nextNode();d||i.add(e)}break}case"in-range":{f==="input"&&!(e.readonly||e.hasAttribute("readonly"))&&!(e.disabled||e.hasAttribute("disabled"))&&e.hasAttribute("type")&&n.REG_TYPE_RANGE.test(e.getAttribute("type"))&&!(e.validity.rangeUnderflow||e.validity.rangeOverflow)&&(e.hasAttribute("min")||e.hasAttribute("max")||e.getAttribute("type")==="range")&&i.add(e);break}case"out-of-range":{f==="input"&&!(e.readonly||e.hasAttribute("readonly"))&&!(e.disabled||e.hasAttribute("disabled"))&&e.hasAttribute("type")&&n.REG_TYPE_RANGE.test(e.getAttribute("type"))&&(e.validity.rangeUnderflow||e.validity.rangeOverflow)&&i.add(e);break}case"required":{let t;if(/^(?:select|textarea)$/.test(f))t=e;else if(f==="input")if(e.hasAttribute("type")){const s=e.getAttribute("type");(s==="file"||n.REG_TYPE_CHECK.test(s)||n.REG_TYPE_DATE.test(s)||n.REG_TYPE_TEXT.test(s))&&(t=e)}else t=e;t&&(e.required||e.hasAttribute("required"))&&i.add(e);break}case"optional":{let t;if(/^(?:select|textarea)$/.test(f))t=e;else if(f==="input")if(e.hasAttribute("type")){const s=e.getAttribute("type");(s==="file"||n.REG_TYPE_CHECK.test(s)||n.REG_TYPE_DATE.test(s)||n.REG_TYPE_TEXT.test(s))&&(t=e)}else t=e;t&&!(e.required||e.hasAttribute("required"))&&i.add(e);break}case"root":{e===this.#s.documentElement&&i.add(e);break}case"empty":{if(e.hasChildNodes()){const t=this.#c.createTreeWalker(e,n.SHOW_ALL);let s=t.firstChild(),d;for(;s&&(d=s.nodeType!==n.ELEMENT_NODE&&s.nodeType!==n.TEXT_NODE,!!d);)s=t.nextSibling();d&&i.add(e)}else i.add(e);break}case"first-child":{(c&&e===c.firstElementChild||e===this.#t)&&i.add(e);break}case"last-child":{(c&&e===c.lastElementChild||e===this.#t)&&i.add(e);break}case"only-child":{(c&&e===c.firstElementChild&&e===c.lastElementChild||e===this.#t)&&i.add(e);break}case"first-of-type":{if(c){const[t]=this._collectNthOfType({a:0,b:1},e);t&&i.add(t)}else e===this.#t&&i.add(e);break}case"last-of-type":{if(c){const[t]=this._collectNthOfType({a:0,b:1,reverse:!0},e);t&&i.add(t)}else e===this.#t&&i.add(e);break}case"only-of-type":{if(c){const[t]=this._collectNthOfType({a:0,b:1},e);if(t===e){const[s]=this._collectNthOfType({a:0,b:1,reverse:!0},e);s===e&&i.add(e)}}else e===this.#t&&i.add(e);break}case"defined":{const t=e.getAttribute("is");t?(0,M.default)(t)&&this.#a.customElements.get(t)&&i.add(e):(0,M.default)(f)?this.#a.customElements.get(f)&&i.add(e):(e instanceof this.#a.HTMLElement||e instanceof this.#a.SVGElement)&&i.add(e);break}case"popover-open":{if(e.popover){const{display:t}=this.#a.getComputedStyle(e);t!=="none"&&i.add(e)}break}case"host":case"host-context":break;case"after":case"before":case"first-letter":case"first-line":{if(h){const t=`Unsupported pseudo-element ::${l}`;throw new DOMException(t,n.NOT_SUPPORTED_ERR)}break}case"autofill":case"blank":case"buffering":case"current":case"fullscreen":case"future":case"modal":case"muted":case"past":case"paused":case"picture-in-picture":case"playing":case"seeking":case"stalled":case"user-invalid":case"user-valid":case"volume-locked":case"-webkit-autofill":{if(h){const t=`Unsupported pseudo-class :${l}`;throw new DOMException(t,n.NOT_SUPPORTED_ERR)}break}default:if(l.startsWith("-webkit-")){if(h){const t=`Unsupported pseudo-class :${l}`;throw new DOMException(t,n.NOT_SUPPORTED_ERR)}}else if(!u){const t=`Unknown pseudo-class :${l}`;throw new DOMException(t,n.SYNTAX_ERR)}}return i}_matchShadowHostPseudoClass(a,e){const{children:o,name:r}=a;let l;if(Array.isArray(o)){const[f]=(0,k.walkAST)(o[0]),[...c]=f,{host:u}=e;if(r==="host"){let h;for(const i of c){const{type:t}=i;if(t===n.COMBINATOR){const d=`Invalid selector ${(0,k.generateCSS)(a)}`;throw new DOMException(d,n.SYNTAX_ERR)}if(h=this._matchSelector(i,u).has(u),!h)break}h&&(l=e)}else if(r==="host-context"){let h=u,i;for(;h;){for(const t of c){const{type:s}=t;if(s===n.COMBINATOR){const m=`Invalid selector ${(0,k.generateCSS)(a)}`;throw new DOMException(m,n.SYNTAX_ERR)}if(i=this._matchSelector(t,h).has(h),!i)break}if(i)break;h=h.parentNode}i&&(l=e)}}else if(r==="host")l=e;else{const f=`Invalid selector :${r}`;throw new DOMException(f,n.SYNTAX_ERR)}return l??null}_matchSelector(a,e,o){const{type:r}=a,l=new Set;if(a.name===n.EMPTY)return l;const f=(0,k.unescapeSelector)(a.name);if(typeof f=="string"&&f!==a.name&&(a.name=f),e.nodeType===n.ELEMENT_NODE)switch(r){case n.SELECTOR_PSEUDO_ELEMENT:{O.matcher.matchPseudoElementSelector(f,o);break}case n.SELECTOR_ID:{e.id===f&&l.add(e);break}case n.SELECTOR_CLASS:{e.classList.contains(f)&&l.add(e);break}case n.SELECTOR_PSEUDO_CLASS:return this._matchPseudoClassSelector(a,e,o);default:{const c=O.matcher.matchSelector(a,e,o);c&&l.add(c)}}else if(this.#d&&r===n.SELECTOR_PSEUDO_CLASS&&e.nodeType===n.DOCUMENT_FRAGMENT_NODE){if(f!=="has"&&n.REG_LOGICAL_PSEUDO.test(f))return this._matchPseudoClassSelector(a,e,o);if(n.REG_SHADOW_HOST.test(f)){const c=this._matchShadowHostPseudoClass(a,e,o);c&&l.add(c)}}return l}_matchLeaves(a,e,o){const{attributes:r,localName:l,nodeType:f}=e;let c=this.#_.get(a),u;if(c&&c.has(e)){const{attr:h,matched:i}=c.get(e);r?.length===h&&(u=i)}if(typeof u!="boolean"){let h;f===n.ELEMENT_NODE&&n.REG_FORM.test(l)?h=!1:h=!0;for(const i of a){const{name:t,type:s}=i;if(s===n.SELECTOR_PSEUDO_CLASS&&t==="dir"&&(h=!1),u=this._matchSelector(i,e,o).has(e),!u)break}h&&(c||(c=new WeakMap),c.set(e,{attr:r?.length,matched:u}),this.#_.set(a,c))}return!!u}_matchHTMLCollection(a,e={}){const{compound:o,filterLeaves:r}=e,l=new Set,f=a.length;if(f)if(o)for(let c=0;c<f;c++){const u=a[c];this._matchLeaves(r,u,e)&&l.add(u)}else{const c=[].slice.call(a);return new Set(c)}return l}_findDescendantNodes(a,e,o){const[r,...l]=a,f=l.length>0,{type:c}=r,u=(0,k.unescapeSelector)(r.name);typeof u=="string"&&u!==r.name&&(r.name=u);let h=new Set,i=!1;if(this.#d)i=!0;else switch(c){case n.SELECTOR_PSEUDO_ELEMENT:{O.matcher.matchPseudoElementSelector(u,o);break}case n.SELECTOR_ID:{if(this.#t.nodeType===n.ELEMENT_NODE)i=!0;else{const t=this.#t.getElementById(u);t&&t!==e&&e.contains(t)&&(f?this._matchLeaves(l,t,o)&&h.add(t):h.add(t))}break}case n.SELECTOR_CLASS:{const t=e.getElementsByClassName(u);h=this._matchHTMLCollection(t,{compound:f,filterLeaves:l});break}case n.SELECTOR_TYPE:{if(this.#s.contentType==="text/html"&&!/[*|]/.test(u)){const t=e.getElementsByTagName(u);h=this._matchHTMLCollection(t,{compound:f,filterLeaves:l})}else i=!0;break}default:i=!0}return{nodes:h,pending:i}}_matchCombinator(a,e,o={}){const{combo:r,leaves:l}=a,{name:f}=r,{parentNode:c}=e,{dir:u}=o,h=new Set;if(u===x)switch(f){case"+":{const i=e.nextElementSibling;i&&this._matchLeaves(l,i,o)&&h.add(i);break}case"~":{if(c){const i=this._createTreeWalker(c);let t=this._traverse(e,i);for(t=i.nextSibling();t;)this._matchLeaves(l,t,o)&&h.add(t),t=i.nextSibling()}break}case">":{const i=this._createTreeWalker(e);let t=this._traverse(e,i);for(t=i.firstChild();t;)this._matchLeaves(l,t,o)&&h.add(t),t=i.nextSibling();break}case" ":default:{const{nodes:i,pending:t}=this._findDescendantNodes(l,e);if(i.size)return i;if(t){const s=this._createTreeWalker(e);let d=this._traverse(e,s);for(d=s.nextNode();d&&e.contains(d);)this._matchLeaves(l,d,o)&&h.add(d),d=s.nextNode()}}}else switch(f){case"+":{const i=e.previousElementSibling;i&&this._matchLeaves(l,i,o)&&h.add(i);break}case"~":{if(c){const i=this._createTreeWalker(c);let t=this._traverse(c,i);for(t=i.firstChild();t&&t!==e;)this._matchLeaves(l,t,o)&&h.add(t),t=i.nextSibling()}break}case">":{c&&this._matchLeaves(l,c,o)&&h.add(c);break}case" ":default:{const i=[];let t=c;for(;t;)this._matchLeaves(l,t,o)&&i.push(t),t=t.parentNode;if(i.length)return new Set(i.reverse())}}return h}_findNode(a,e){const{node:o}=e;let r=this._traverse(o,this.#o),l;if(r)for(r.nodeType!==n.ELEMENT_NODE?r=this.#o.nextNode():r===o&&r!==this.#t&&(r=this.#o.nextNode());r;){if(this._matchLeaves(a,r,{warn:this.#i})){l=r;break}r=this.#o.nextNode()}return l??null}_matchSelf(a){const e=[],o=this._matchLeaves(a,this.#e,{warn:this.#i});let r=!1;return o&&(e.push(this.#e),r=!0),[e,r]}_findLineal(a,e={}){const{complex:o}=e,r=[];let l=this._matchLeaves(a,this.#e,{warn:this.#i}),f=!1;if(l&&(r.push(this.#e),f=!0),!l||o){let c=this.#e.parentNode;for(;c&&(l=this._matchLeaves(a,c,{warn:this.#i}),l&&(r.push(c),f=!0),c.parentNode);)c=c.parentNode}return[r,f]}_findFirst(a){const e=[],o=this._findNode(a,{node:this.#e});let r=!1;return o&&(e.push(o),r=!0),[e,r]}_findFromHTMLCollection(a,e={}){const{complex:o,compound:r,filterLeaves:l,targetType:f}=e;let c=[],u=!1,h=!1;const i=a.length;if(i)if(this.#e.nodeType===n.ELEMENT_NODE)for(let t=0;t<i;t++){const s=a[t];if(s!==this.#e&&(this.#e.contains(s)||s.contains(this.#e))){if(r){if(this._matchLeaves(l,s,{warn:this.#i})&&(c.push(s),u=!0,f===y))break}else if(c.push(s),u=!0,f===y)break}}else if(o)if(r)for(let t=0;t<i;t++){const s=a[t];if(this._matchLeaves(l,s,{warn:this.#i})&&(c.push(s),u=!0,f===y))break}else c=[].slice.call(a),u=!0,h=!0;else if(r)for(let t=0;t<i;t++){const s=a[t];if(this._matchLeaves(l,s,{warn:this.#i})&&(c.push(s),u=!0,f===y))break}else c=[].slice.call(a),u=!0,h=!0;return[c,u,h]}_findEntryNodes(a,e,o){const{leaves:r}=a,[l,...f]=r,c=f.length>0,{name:u,type:h}=l;let i=[],t=!1,s=!1,d=!1;switch(h){case n.SELECTOR_PSEUDO_ELEMENT:{O.matcher.matchPseudoElementSelector(u,{warn:this.#i});break}case n.SELECTOR_ID:{if(e===R)[i,s]=this._matchSelf(r);else if(e===C)[i,s]=this._findLineal(r,{complex:o});else if(e===y&&this.#t.nodeType!==n.ELEMENT_NODE){const m=this.#t.getElementById(u);m&&(c?this._matchLeaves(f,m,{warn:this.#i})&&(i.push(m),s=!0):(i.push(m),s=!0))}else e===y?[i,s]=this._findFirst(r):d=!0;break}case n.SELECTOR_CLASS:{if(e===R)[i,s]=this._matchSelf(r);else if(e===C)[i,s]=this._findLineal(r,{complex:o});else if(this.#t.nodeType===n.DOCUMENT_NODE){const m=this.#t.getElementsByClassName(u);m.length&&([i,s,t]=this._findFromHTMLCollection(m,{complex:o,compound:c,filterLeaves:f,targetType:e}))}else e===y?[i,s]=this._findFirst(r):d=!0;break}case n.SELECTOR_TYPE:{if(e===R)[i,s]=this._matchSelf(r);else if(e===C)[i,s]=this._findLineal(r,{complex:o});else if(this.#s.contentType==="text/html"&&this.#t.nodeType===n.DOCUMENT_NODE&&!/[*|]/.test(u)){const m=this.#t.getElementsByTagName(u);m.length&&([i,s,t]=this._findFromHTMLCollection(m,{complex:o,compound:c,filterLeaves:f,targetType:e}))}else e===y?[i,s]=this._findFirst(r):d=!0;break}default:if(e!==C&&n.REG_SHADOW_HOST.test(u)){if(this.#d&&this.#e.nodeType===n.DOCUMENT_FRAGMENT_NODE){const m=this._matchShadowHostPseudoClass(l,this.#e);m&&(i.push(m),s=!0)}}else e===R?[i,s]=this._matchSelf(r):e===C?[i,s]=this._findLineal(r,{complex:o}):e===y?[i,s]=this._findFirst(r):d=!0}return{collected:t,compound:c,filtered:s,nodes:i,pending:d}}_collectNodes(a){const e=this.#l.values();if(a===L||a===y){const o=new Set;let r=0;for(const{branch:l}of e){const f=l.length,c=f>1,u=l[0];let h,i;if(c){const{combo:p,leaves:[{name:_,type:w}]}=u,N=l[f-1],{leaves:[{name:A,type:v}]}=N;if(v===n.SELECTOR_PSEUDO_ELEMENT||v===n.SELECTOR_ID)h=S,i=N;else if(w===n.SELECTOR_PSEUDO_ELEMENT||w===n.SELECTOR_ID)h=x,i=u;else if(a===L)if(_==="*"&&w===n.SELECTOR_TYPE)h=S,i=N;else if(A==="*"&&v===n.SELECTOR_TYPE)h=x,i=u;else if(f===2){const{name:T}=p;/^[+~]$/.test(T)?(h=S,i=N):(h=x,i=u)}else h=x,i=u;else if(A==="*"&&v===n.SELECTOR_TYPE)h=x,i=u;else if(_==="*"&&w===n.SELECTOR_TYPE)h=S,i=N;else{let T;for(const{combo:P,leaves:[$]}of l){const{name:F,type:z}=$;if(z===n.SELECTOR_PSEUDO_CLASS&&F==="dir"){T=!1;break}if(!T&&P){const{name:W}=P;/^[+~]$/.test(W)&&(T=!0)}}T?(h=x,i=u):(h=S,i=N)}}else h=S,i=u;const{collected:t,compound:s,filtered:d,nodes:m,pending:b}=this._findEntryNodes(i,a,c);m.length?(this.#l[r].find=!0,this.#h[r]=m):b&&o.add(new Map([["index",r],["twig",i]])),this.#l[r].collected=t,this.#l[r].dir=h,this.#l[r].filtered=d||!s,r++}if(o.size){let l,f;this.#e!==this.#t&&this.#e.nodeType===n.ELEMENT_NODE?(l=this.#e,f=this.#o):(l=this.#t,f=this.#n);let c=this._traverse(l,f);for(;c;){let u=!1;if(this.#e.nodeType===n.ELEMENT_NODE?c===this.#e?u=!0:u=this.#e.contains(c):u=!0,u)for(const h of o){const{leaves:i}=h.get("twig");if(this._matchLeaves(i,c,{warn:this.#i})){const s=h.get("index");this.#l[s].filtered=!0,this.#l[s].find=!0,this.#h[s].push(c)}}c!==f.currentNode&&(c=this._traverse(c,f)),c=f.nextNode()}}}else{let o=0;for(const{branch:r}of e){const l=r[r.length-1],f=r.length>1,{compound:c,filtered:u,nodes:h}=this._findEntryNodes(l,a,f);h.length&&(this.#l[o].find=!0,this.#h[o]=h),this.#l[o].dir=S,this.#l[o].filtered=u||!c,o++}}return[this.#l,this.#h]}_getCombinedNodes(a,e,o){const r=[];for(const l of e){const f=this._matchCombinator(a,l,{dir:o,warn:this.#i});f.size&&r.push(...f)}return r.length?new Set(r):new Set}_matchNodeNext(a,e,o){const{combo:r,index:l}=o,{combo:f,leaves:c}=a[l],u={combo:r,leaves:c},h=this._getCombinedNodes(u,e,x);let i;if(h.size)if(l===a.length-1){const[t]=(0,E.sortNodes)(h);i=t}else i=this._matchNodeNext(a,h,{combo:f,index:l+1});return i??null}_matchNodePrev(a,e,o){const{index:r}=o,l=a[r],f=new Set([e]),c=this._getCombinedNodes(l,f,S);let u;if(c.size){if(r===0)u=e;else for(const h of c)if(this._matchNodePrev(a,h,{index:r-1}))return e}return u??null}_find(a){(a===L||a===y)&&this._prepareQuerySelectorWalker();const[[...e],o]=this._collectNodes(a),r=e.length;let l=new Set;for(let f=0;f<r;f++){const{branch:c,collected:u,dir:h,find:i}=e[f],t=c.length;if(t&&i){const s=o[f],d=s.length,m=t-1;if(m===0)if((a===L||a===y)&&this.#e.nodeType===n.ELEMENT_NODE)for(let b=0;b<d;b++){const p=s[b];if(p!==this.#e&&this.#e.contains(p)&&(l.add(p),a!==L))break}else if(a===L)if(l.size){const b=[...l];l=new Set([...b,...s]),this.#u=!0}else l=new Set(s);else{const[b]=s;l.add(b)}else if(a===L)if(h===x){let{combo:b}=c[0];for(const p of s){let _=new Set([p]);for(let w=1;w<t;w++){const{combo:N,leaves:A}=c[w],v={combo:b,leaves:A};if(_=this._getCombinedNodes(v,_,h),_.size)if(w===m)if(l.size){const T=[...l];l=new Set([...T,..._]),this.#u=!0}else l=_;else b=N;else break}}}else for(const b of s){let p=new Set([b]);for(let _=m-1;_>=0;_--){const w=c[_];if(p=this._getCombinedNodes(w,p,h),p.size)_===0&&(l.add(b),t>1&&l.size>1&&(this.#u=!0));else break}}else if(a===y&&h===x){const{combo:b}=c[0];let p;for(const _ of s)if(p=this._matchNodeNext(c,new Set([_]),{combo:b,index:1}),p){l.add(p);break}if(!p&&!u){const{leaves:_}=c[0],[w]=s;let N=this._findNode(_,{node:w});for(;N;){if(p=this._matchNodeNext(c,new Set([N]),{combo:b,index:1}),p){l.add(p);break}N=this._findNode(_,{node:N})}}}else{let b;for(const p of s)if(b=this._matchNodePrev(c,p,{index:m-1}),b){l.add(p);break}if(!b&&!u&&a===y){const{leaves:p}=c[m],[_]=s;let w=this._findNode(p,{node:_});for(;w;){if(b=this._matchNodePrev(c,w,{index:m-1}),b){l.add(w);break}w=this._findNode(p,{node:w})}}}}}return l}matches(a,e,o){let r;try{if(e?.nodeType!==n.ELEMENT_NODE){const c=`Unexpected node ${e?.nodeName}`;throw new TypeError(c)}const l=e.ownerDocument;if(l===this.#c&&l.contentType==="text/html"&&(0,k.filterSelector)(a,{complex:n.REG_COMPLEX_A.test(a),descendant:!0}))return this.#f.match(a,e);this._setup(a,e,o),r=this._find(R).size}catch(l){this._onError(l)}return!!r}closest(a,e,o){let r;try{if(e?.nodeType!==n.ELEMENT_NODE){const c=`Unexpected node ${e?.nodeName}`;throw new TypeError(c)}const l=e.ownerDocument;if(l===this.#c&&l.contentType==="text/html"&&(0,k.filterSelector)(a,{complex:n.REG_COMPLEX_A.test(a),descendant:!0}))return this.#f.closest(a,e);this._setup(a,e,o);const f=this._find(C);if(f.size){let c=this.#e;for(;c;){if(f.has(c)){r=c;break}c=c.parentNode}}}catch(l){this._onError(l)}return r??null}querySelector(a,e,o){let r;try{(0,E.verifyNode)(e);let l;if(e.nodeType===n.DOCUMENT_NODE?l=e:l=e.ownerDocument,l===this.#c&&l.contentType==="text/html"&&(0,k.filterSelector)(a,{complex:n.REG_COMPLEX_B.test(a),descendant:!1}))return this.#f.first(a,e);this._setup(a,e,o);const f=this._find(y);f.delete(this.#e),f.size&&([r]=(0,E.sortNodes)(f))}catch(l){this._onError(l)}return r??null}querySelectorAll(a,e,o){let r;try{(0,E.verifyNode)(e);let l;if(e.nodeType===n.DOCUMENT_NODE?l=e:l=e.ownerDocument,l===this.#c&&l.contentType==="text/html"&&(0,k.filterSelector)(a,{complex:n.REG_COMPLEX_B.test(a),descendant:!0}))return this.#f.select(a,e);this._setup(a,e,o);const f=this._find(L);f.delete(this.#e),f.size&&(this.#u?r=(0,E.sortNodes)(f):r=[...f])}catch(l){this._onError(l)}return r??[]}}0&&(module.exports={Finder});
//# sourceMappingURL=finder.js.map
