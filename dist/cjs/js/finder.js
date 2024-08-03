var C=Object.defineProperty;var I=Object.getOwnPropertyDescriptor;var D=Object.getOwnPropertyNames;var U=Object.prototype.hasOwnProperty;var $=(x,c)=>{for(var e in c)C(x,e,{get:c[e],enumerable:!0})},F=(x,c,e,h)=>{if(c&&typeof c=="object"||typeof c=="function")for(let f of D(c))!U.call(x,f)&&f!==e&&C(x,f,{get:()=>c[f],enumerable:!(h=I(c,f))||h.enumerable});return x};var G=x=>F(C({},"__esModule",{value:!0}),x);var H={};$(H,{Finder:()=>W});module.exports=G(H);var T=require("./matcher.js"),g=require("./parser.js"),k=require("./utility.js"),a=require("./constant.js");const v="next",S="prev";class W{#a;#n;#w;#t;#c;#b;#f;#u;#o;#e;#h;#N;#m;#k;#s;#d;#r;#p;#i;#l;constructor(c){this.#l=c,this.#o=new T.Matcher,this.#n=new WeakMap,this.#c=new WeakMap,this.#u=new WeakMap,this.#k=new WeakMap}onError(c,e={}){if(!(e.noexcept??this.#N))if(c instanceof DOMException||c instanceof this.#l.DOMException)if(c.name===a.NOT_SUPPORTED_ERR)this.#i&&console.warn(c.message);else throw new this.#l.DOMException(c.message,c.name);else throw c}setup(c,e,h={}){const{event:f,noexcept:l,warn:r}=h;return this.#N=!!l,this.#i=!!r,this.#b=this._setEvent(f),this.#e=e,[this.#t,this.#s,this.#r]=(0,k.resolveContent)(e),this.#d=(0,k.isInShadowTree)(e),[this.#a,this.#h]=this._correspond(c),this.#u=new WeakMap,this.#p=new WeakMap,e}_setEvent(c){return c instanceof this.#l.KeyboardEvent||c instanceof this.#l.MouseEvent?c:null}_correspond(c){const e=[];this.#w=!1,this.#f=!1;let h;if(this.#c.has(this.#t)){const f=this.#c.get(this.#t);if(f&&f.has(`${c}`)){const l=f.get(`${c}`);h=l.ast,this.#w=l.descendant,this.#f=l.invalidate}}if(h){const f=h.length;for(let l=0;l<f;l++)h[l].collected=!1,h[l].dir=null,h[l].filtered=!1,h[l].find=!1,e[l]=[]}else{let f;try{f=(0,g.parseSelector)(c)}catch(s){this.onError(s)}const{branches:l,info:{hasHasPseudoFunc:r}}=(0,g.walkAST)(f);let o=!!r,b=!1,d=0;h=[];for(const[...s]of l){const t=[];let n=s.shift();if(n&&n.type!==a.COMBINATOR){const u=new Set;for(;n;){if(n.type===a.COMBINATOR){const[m]=s;if(m.type===a.COMBINATOR)throw new DOMException(`Invalid selector ${c}`,a.SYNTAX_ERR);const w=n.name;/^[\s>]$/.test(w)?b=!0:o=!0,t.push({combo:n,leaves:(0,g.sortAST)(u)}),u.clear()}else if(n){let{name:m}=n;m&&typeof m=="string"&&(m=(0,g.unescapeSelector)(m),typeof m=="string"&&m!==n.name&&(n.name=m),/[|:]/.test(m)&&(n.namespace=!0)),u.add(n)}if(s.length)n=s.shift();else{t.push({combo:null,leaves:(0,g.sortAST)(u)}),u.clear();break}}}h.push({branch:t,collected:!1,dir:null,filtered:!1,find:!1}),e[d]=[],d++}let i;this.#c.has(this.#t)?i=this.#c.get(this.#t):i=new Map,i.set(`${c}`,{ast:h,descendant:b,invalidate:o}),this.#c.set(this.#t,i),this.#w=b,this.#f=o}return[h,e]}_createTreeWalker(c){let e;return this.#p.has(c)?e=this.#p.get(c):(e=this.#t.createTreeWalker(c,a.WALKER_FILTER),this.#p.set(c,e)),e}_prepareQuerySelectorWalker(){return this.#m=this._createTreeWalker(this.#e),this.#m}_collectNthChild(c,e,h){const{a:f,b:l,reverse:r,selector:o}=c,{parentNode:b}=e,d=new Set;let i;if(o)if(this.#n.has(o))i=this.#n.get(o);else{const{branches:s,info:t}=(0,g.walkAST)(o);i=s,this.#n.set(o,i),t.hasLogicalPseudoFunc&&(this.#f=!0)}if(b){const s=this.#r;let t=(0,k.traverseNode)(b,s);t=s.firstChild();let n=0;for(;t;)n++,t=s.nextSibling();const u=new Set;if(i)for(t=(0,k.traverseNode)(b,s),t=s.firstChild();t;){const{display:m,visibility:w}=this.#l.getComputedStyle(t);if(m!=="none"&&w!=="hidden"){let p;for(const N of i)if(p=this._matchLeaves(N,t,h),!p)break;p&&u.add(t)}t=s.nextSibling()}if(f===0){if(l>0&&l<=n){if(u.size){t=(0,k.traverseNode)(b,s),r?t=s.lastChild():t=s.firstChild();let m=0;for(;t;){if(u.has(t)){if(m===l-1){d.add(t);break}m++}r?t=s.previousSibling():t=s.nextSibling()}}else if(!o){t=(0,k.traverseNode)(b,s),r?t=s.lastChild():t=s.firstChild();let m=0;for(;t;){if(m===l-1){d.add(t);break}r?t=s.previousSibling():t=s.nextSibling(),m++}}}}else{let m=l-1;if(f>0)for(;m<0;)m+=f;if(m>=0&&m<n){t=(0,k.traverseNode)(b,s),r?t=s.lastChild():t=s.firstChild();let w=0,p=f>0?0:l-1;for(;t&&(t&&m>=0&&m<n);)u.size?u.has(t)&&(p===m&&(d.add(t),m+=f),f>0?p++:p--):w===m&&(o||d.add(t),m+=f),r?t=s.previousSibling():t=s.nextSibling(),w++}}if(r&&d.size>1){const m=[...d];return new Set(m.reverse())}}else if(e===this.#s&&f+l===1)if(i){let s;for(const t of i)if(s=this._matchLeaves(t,e,h),s)break;s&&d.add(e)}else d.add(e);return d}_collectNthOfType(c,e){const{a:h,b:f,reverse:l}=c,{localName:r,namespaceURI:o,parentNode:b,prefix:d}=e,i=new Set;if(b){const s=this.#r;let t=(0,k.traverseNode)(b,s);t=s.firstChild();let n=0;for(;t;)n++,t=s.nextSibling();if(h===0){if(f>0&&f<=n){t=(0,k.traverseNode)(b,s),l?t=s.lastChild():t=s.firstChild();let u=0;for(;t;){const{localName:m,namespaceURI:w,prefix:p}=t;if(m===r&&p===d&&w===o){if(u===f-1){i.add(t);break}u++}l?t=s.previousSibling():t=s.nextSibling()}}}else{let u=f-1;if(h>0)for(;u<0;)u+=h;if(u>=0&&u<n){t=(0,k.traverseNode)(b,s),l?t=s.lastChild():t=s.firstChild();let m=h>0?0:f-1;for(;t;){const{localName:w,namespaceURI:p,prefix:N}=t;if(w===r&&N===d&&p===o){if(m===u&&(i.add(t),u+=h),u<0||u>=n)break;h>0?m++:m--}l?t=s.previousSibling():t=s.nextSibling()}}}if(l&&i.size>1){const u=[...i];return new Set(u.reverse())}}else e===this.#s&&h+f===1&&i.add(e);return i}_matchAnPlusB(c,e,h,f){const{nth:{a:l,b:r,name:o},selector:b}=c,d=new Map;if(o?(o==="even"?(d.set("a",2),d.set("b",0)):o==="odd"&&(d.set("a",2),d.set("b",1)),h.indexOf("last")>-1&&d.set("reverse",!0)):(typeof l=="string"&&/-?\d+/.test(l)?d.set("a",l*1):d.set("a",0),typeof r=="string"&&/-?\d+/.test(r)?d.set("b",r*1):d.set("b",0),h.indexOf("last")>-1&&d.set("reverse",!0)),/^nth-(?:last-)?child$/.test(h)){b&&d.set("selector",b);const i=Object.fromEntries(d);return this._collectNthChild(i,e,f)}else if(/^nth-(?:last-)?of-type$/.test(h)){const i=Object.fromEntries(d);return this._collectNthOfType(i,e)}return new Set}_matchHasPseudoFunc(c,e,h={}){let f;if(Array.isArray(c)&&c.length){const l=c.map(t=>t),[r]=l,{type:o}=r;let b;o===a.COMBINATOR?b=l.shift():b={name:" ",type:a.COMBINATOR};const d=[];for(;l.length;){const[t]=l,{type:n}=t;if(n===a.COMBINATOR)break;d.push(l.shift())}const i={combo:b,leaves:d};h.dir=v;const s=this._matchCombinator(i,e,h);if(s.size)if(l.length){for(const t of s)if(f=this._matchHasPseudoFunc(l,t,h),f)break}else f=!0}return!!f}_matchLogicalPseudoFunc(c,e,h={}){const{astName:f="",branches:l=[],selector:r="",twigBranches:o=[]}=c;let b;if(f==="has")if(r.includes(":has("))b=null;else{let d;for(const i of l)if(d=this._matchHasPseudoFunc(i,e,h),d)break;d&&(b=e)}else{const d=/^(?:is|where)$/.test(f);h.forgive=d;const i=o.length;let s;for(let t=0;t<i;t++){const n=o[t],u=n.length-1,{leaves:m}=n[u];if(s=this._matchLeaves(m,e,h),s&&u>0){let w=new Set([e]);for(let p=u-1;p>=0;p--){const N=n[p],_=[];h.dir=S;for(const y of w){const E=this._matchCombinator(N,y,h);E.size&&_.push(...E)}if(_.length)p===0?s=!0:w=new Set(_);else{s=!1;break}}}if(s)break}f==="not"?s||(b=e):s&&(b=e)}return b??null}_matchPseudoClassSelector(c,e,h={}){const{children:f,name:l}=c,{localName:r,parentNode:o}=e,{forgive:b,warn:d=this.#i}=h,i=new Set;if(a.REG_LOGICAL_PSEUDO.test(l)){let s;if(this.#n.has(c))s=this.#n.get(c);else{const{branches:n}=(0,g.walkAST)(c),u=[],m=[];for(const[...w]of n){for(const y of w){const E=(0,g.generateCSS)(y);u.push(E)}const p=[],N=new Set;let _=w.shift();for(;_;)if(_.type===a.COMBINATOR?(p.push({combo:_,leaves:[...N]}),N.clear()):_&&N.add(_),w.length)_=w.shift();else{p.push({combo:null,leaves:[...N]}),N.clear();break}m.push(p)}s={astName:l,branches:n,twigBranches:m,selector:u.join(",")},this.#n.set(c,s)}const t=this._matchLogicalPseudoFunc(s,e,h);t&&i.add(t)}else if(Array.isArray(f))if(/^nth-(?:last-)?(?:child|of-type)$/.test(l)){const[s]=f;return this._matchAnPlusB(s,e,l,h)}else switch(l){case"dir":case"lang":{const s=this.#o.matchSelector(c,e,h,!0);s&&i.add(s);break}case"state":{if((0,k.isCustomElement)(e)){const[{value:s}]=f;if(s)if(e[s])i.add(e);else for(const t in e){const n=e[t];if(n instanceof this.#l.ElementInternals){n?.states?.has(s)&&i.add(e);break}}}break}case"current":case"nth-col":case"nth-last-col":{if(d)throw new DOMException(`Unsupported pseudo-class :${l}()`,a.NOT_SUPPORTED_ERR);break}case"host":case"host-context":break;case"contains":{if(d)throw new DOMException(`Unknown pseudo-class :${l}()`,a.NOT_SUPPORTED_ERR);break}default:if(!b)throw new DOMException(`Unknown pseudo-class :${l}()`,a.SYNTAX_ERR)}else switch(l){case"any-link":case"link":{a.REG_ANCHOR.test(r)&&e.hasAttribute("href")&&i.add(e);break}case"local-link":{if(a.REG_ANCHOR.test(r)&&e.hasAttribute("href")){const{href:s,origin:t,pathname:n}=new URL(this.#t.URL),u=new URL(e.getAttribute("href"),s);u.origin===t&&u.pathname===n&&i.add(e)}break}case"visited":break;case"hover":{const{target:s,type:t}=this.#b??{};(t==="mouseover"||t==="pointerover")&&e.contains(s)&&i.add(e);break}case"active":{const{buttons:s,target:t,type:n}=this.#b??{};(n==="mousedown"||n==="pointerdown")&&s&a.BIT_01&&e.contains(t)&&i.add(e);break}case"target":{const{hash:s}=new URL(this.#t.URL);e.id&&s===`#${e.id}`&&this.#t.contains(e)&&i.add(e);break}case"target-within":{const{hash:s}=new URL(this.#t.URL);if(s){const t=s.replace(/^#/,"");let n=this.#t.getElementById(t);for(;n;){if(n===e){i.add(e);break}n=n.parentNode}}break}case"scope":{this.#e.nodeType===a.ELEMENT_NODE?!this.#d&&e===this.#e&&i.add(e):e===this.#t.documentElement&&i.add(e);break}case"focus":case"focus-visible":{const{target:s,type:t}=this.#b??{};if(e===this.#t.activeElement&&e.tabIndex>=0&&(l==="focus"||t==="keydown"&&e.contains(s))){let n=e,u=!0;for(;n;){if(n.disabled||n.hasAttribute("disabled")||n.hidden||n.hasAttribute("hidden")){u=!1;break}else{const{display:m,visibility:w}=this.#l.getComputedStyle(n);if(u=!(m==="none"||w==="hidden"),!u)break}if(n.parentNode&&n.parentNode.nodeType===a.ELEMENT_NODE)n=n.parentNode;else break}u&&i.add(e)}break}case"focus-within":{let s,t=this.#t.activeElement;if(t.tabIndex>=0)for(;t;){if(t===e){s=!0;break}t=t.parentNode}if(s){let n=e,u=!0;for(;n;){if(n.disabled||n.hasAttribute("disabled")||n.hidden||n.hasAttribute("hidden")){u=!1;break}else{const{display:m,visibility:w}=this.#l.getComputedStyle(n);if(u=!(m==="none"||w==="hidden"),!u)break}if(n.parentNode&&n.parentNode.nodeType===a.ELEMENT_NODE)n=n.parentNode;else break}u&&i.add(e)}break}case"open":{a.REG_INTERACT.test(r)&&e.hasAttribute("open")&&i.add(e);break}case"closed":{a.REG_INTERACT.test(r)&&!e.hasAttribute("open")&&i.add(e);break}case"disabled":{if(a.REG_FORM_CTRL.test(r)||(0,k.isCustomElement)(e,{formAssociated:!0})){if(e.disabled||e.hasAttribute("disabled"))i.add(e);else if(e.localName==="option")o.localName==="optgroup"&&(o.disabled||o.hasAttribute("disabled"))&&i.add(e);else if(e.localName!=="optgroup"){let s,t=o;for(;t;)if(t.localName==="fieldset"&&(t.disabled||t.hasAttribute("disabled"))){const n=this.#r;let u=(0,k.traverseNode)(t,n);for(u=n.firstChild();u&&u.localName!=="legend";)u=n.nextSibling();u&&u.contains(e)||(s=!0);break}else{if(t.localName==="form")break;if(t.parentNode?.nodeType===a.ELEMENT_NODE){if(t.parentNode.localName==="form")break;t=t.parentNode}else break}s&&i.add(e)}}break}case"enabled":{if((a.REG_FORM_CTRL.test(r)||(0,k.isCustomElement)(e,{formAssociated:!0}))&&!(e.disabled&&e.hasAttribute("disabled")))if(e.localName==="optgroup")i.add(e);else if(e.localName==="option")(o.localName!=="optgroup"||!(o.disabled||o.hasAttribute("disabled")))&&i.add(e);else{let s,t=o;for(;t;)if(t.localName==="fieldset"&&(t.disabled||t.hasAttribute("disabled"))){const n=this.#r;let u=(0,k.traverseNode)(t,n);for(u=n.firstChild();u&&u.localName!=="legend";)u=n.nextSibling();u&&u.contains(e)||(s=!0);break}else{if(t.localName==="form")break;if(t.parentNode?.nodeType===a.ELEMENT_NODE){if(t.parentNode.localName==="form")break;t=t.parentNode}else break}s||i.add(e)}break}case"read-only":{switch(r){case"textarea":{(e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled"))&&i.add(e);break}case"input":{(!e.type||a.REG_TYPE_DATE.test(e.type)||a.REG_TYPE_TEXT.test(e.type))&&(e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled"))&&i.add(e);break}default:(0,k.isContentEditable)(e)||i.add(e)}break}case"read-write":{switch(r){case"textarea":{e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled")||i.add(e);break}case"input":{(!e.type||a.REG_TYPE_DATE.test(e.type)||a.REG_TYPE_TEXT.test(e.type))&&!(e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled"))&&i.add(e);break}default:(0,k.isContentEditable)(e)&&i.add(e)}break}case"placeholder-shown":{let s;if(e.placeholder?s=e.placeholder:e.hasAttribute("placeholder")&&(s=e.getAttribute("placeholder")),typeof s=="string"&&!/[\r\n]/.test(s)){let t;r==="textarea"?t=e:r==="input"&&(e.hasAttribute("type")?a.REG_TYPE_TEXT.test(e.getAttribute("type"))&&(t=e):t=e),t&&e.value===""&&i.add(e)}break}case"checked":{(e.checked&&r==="input"&&e.hasAttribute("type")&&a.REG_TYPE_CHECK.test(e.getAttribute("type"))||e.selected&&r==="option")&&i.add(e);break}case"indeterminate":{if(e.indeterminate&&r==="input"&&e.type==="checkbox"||r==="progress"&&!e.hasAttribute("value"))i.add(e);else if(r==="input"&&e.type==="radio"&&!e.hasAttribute("checked")){const s=e.name;let t=e.parentNode;for(;t&&t.localName!=="form";)t=t.parentNode;t||(t=this.#t.documentElement);const n=t.getElementsByTagName("input"),u=n.length;let m;for(let w=0;w<u;w++){const p=n[w];if(p.getAttribute("type")==="radio"&&(s?p.getAttribute("name")===s&&(m=!!p.checked):p.hasAttribute("name")||(m=!!p.checked),m))break}m||i.add(e)}break}case"default":{if(r==="button"&&!(e.hasAttribute("type")&&a.REG_TYPE_RESET.test(e.getAttribute("type")))||r==="input"&&e.hasAttribute("type")&&a.REG_TYPE_SUBMIT.test(e.getAttribute("type"))){let s=e.parentNode;for(;s&&s.localName!=="form";)s=s.parentNode;if(s){const t=this.#r;let n=(0,k.traverseNode)(s,t);for(n=t.firstChild();n&&s.contains(n);){const u=n.localName;let m;if(u==="button"?m=!(n.hasAttribute("type")&&a.REG_TYPE_RESET.test(n.getAttribute("type"))):u==="input"&&(m=n.hasAttribute("type")&&a.REG_TYPE_SUBMIT.test(n.getAttribute("type"))),m){n===e&&i.add(e);break}n=t.nextNode()}}}else(r==="input"&&e.hasAttribute("type")&&a.REG_TYPE_CHECK.test(e.getAttribute("type"))&&e.hasAttribute("checked")||r==="option"&&e.hasAttribute("selected"))&&i.add(e);break}case"valid":{if(a.REG_FORM_VALID.test(r))e.checkValidity()&&(e.maxLength>=0?e.maxLength>=e.value.length&&i.add(e):i.add(e));else if(r==="fieldset"){const s=this.#r;let t=(0,k.traverseNode)(e,s);t=s.firstChild();let n;if(!t)n=!0;else for(;t&&e.contains(t)&&!(a.REG_FORM_VALID.test(t.localName)&&(t.checkValidity()?t.maxLength>=0?n=t.maxLength>=t.value.length:n=!0:n=!1,!n));)t=s.nextNode();n&&i.add(e)}break}case"invalid":{if(a.REG_FORM_VALID.test(r))e.checkValidity()?e.maxLength>=0&&e.maxLength<e.value.length&&i.add(e):i.add(e);else if(r==="fieldset"){const s=this.#r;let t=(0,k.traverseNode)(e,s);t=s.firstChild();let n;if(!t)n=!0;else for(;t&&e.contains(t)&&!(a.REG_FORM_VALID.test(t.localName)&&(t.checkValidity()?t.maxLength>=0?n=t.maxLength>=t.value.length:n=!0:n=!1,!n));)t=s.nextNode();n||i.add(e)}break}case"in-range":{r==="input"&&!(e.readonly||e.hasAttribute("readonly"))&&!(e.disabled||e.hasAttribute("disabled"))&&e.hasAttribute("type")&&a.REG_TYPE_RANGE.test(e.getAttribute("type"))&&!(e.validity.rangeUnderflow||e.validity.rangeOverflow)&&(e.hasAttribute("min")||e.hasAttribute("max")||e.getAttribute("type")==="range")&&i.add(e);break}case"out-of-range":{r==="input"&&!(e.readonly||e.hasAttribute("readonly"))&&!(e.disabled||e.hasAttribute("disabled"))&&e.hasAttribute("type")&&a.REG_TYPE_RANGE.test(e.getAttribute("type"))&&(e.validity.rangeUnderflow||e.validity.rangeOverflow)&&i.add(e);break}case"required":{let s;if(/^(?:select|textarea)$/.test(r))s=e;else if(r==="input")if(e.hasAttribute("type")){const t=e.getAttribute("type");(t==="file"||a.REG_TYPE_CHECK.test(t)||a.REG_TYPE_DATE.test(t)||a.REG_TYPE_TEXT.test(t))&&(s=e)}else s=e;s&&(e.required||e.hasAttribute("required"))&&i.add(e);break}case"optional":{let s;if(/^(?:select|textarea)$/.test(r))s=e;else if(r==="input")if(e.hasAttribute("type")){const t=e.getAttribute("type");(t==="file"||a.REG_TYPE_CHECK.test(t)||a.REG_TYPE_DATE.test(t)||a.REG_TYPE_TEXT.test(t))&&(s=e)}else s=e;s&&!(e.required||e.hasAttribute("required"))&&i.add(e);break}case"root":{e===this.#t.documentElement&&i.add(e);break}case"empty":{if(e.hasChildNodes()){const s=this.#t.createTreeWalker(e,a.SHOW_ALL);let t=s.firstChild(),n;for(;t&&(n=t.nodeType!==a.ELEMENT_NODE&&t.nodeType!==a.TEXT_NODE,!!n);)t=s.nextSibling();n&&i.add(e)}else i.add(e);break}case"first-child":{(o&&e===o.firstElementChild||e===this.#s)&&i.add(e);break}case"last-child":{(o&&e===o.lastElementChild||e===this.#s)&&i.add(e);break}case"only-child":{(o&&e===o.firstElementChild&&e===o.lastElementChild||e===this.#s)&&i.add(e);break}case"first-of-type":{if(o){const[s]=this._collectNthOfType({a:0,b:1},e);s&&i.add(s)}else e===this.#s&&i.add(e);break}case"last-of-type":{if(o){const[s]=this._collectNthOfType({a:0,b:1,reverse:!0},e);s&&i.add(s)}else e===this.#s&&i.add(e);break}case"only-of-type":{if(o){const[s]=this._collectNthOfType({a:0,b:1},e);if(s===e){const[t]=this._collectNthOfType({a:0,b:1,reverse:!0},e);t===e&&i.add(e)}}else e===this.#s&&i.add(e);break}case"defined":{e.hasAttribute("is")||r.includes("-")?(0,k.isCustomElement)(e)&&i.add(e):(e instanceof this.#l.HTMLElement||e instanceof this.#l.SVGElement)&&i.add(e);break}case"popover-open":{if(e.popover){const{display:s}=this.#l.getComputedStyle(e);s!=="none"&&i.add(e)}break}case"host":case"host-context":break;case"after":case"before":case"first-letter":case"first-line":{if(d)throw new DOMException(`Unsupported pseudo-element ::${l}`,a.NOT_SUPPORTED_ERR);break}case"autofill":case"blank":case"buffering":case"current":case"fullscreen":case"future":case"modal":case"muted":case"past":case"paused":case"picture-in-picture":case"playing":case"seeking":case"stalled":case"user-invalid":case"user-valid":case"volume-locked":case"-webkit-autofill":{if(d)throw new DOMException(`Unsupported pseudo-class :${l}`,a.NOT_SUPPORTED_ERR);break}default:if(l.startsWith("-webkit-")){if(d)throw new DOMException(`Unsupported pseudo-class :${l}`,a.NOT_SUPPORTED_ERR)}else if(!b)throw new DOMException(`Unknown pseudo-class :${l}`,a.SYNTAX_ERR)}return i}_matchShadowHostPseudoClass(c,e){const{children:h,name:f}=c;let l;if(Array.isArray(h)){const{branches:r}=(0,g.walkAST)(h[0]),[o]=r,[...b]=o,{host:d}=e;if(f==="host"){let i;for(const s of b){const{type:t}=s;if(t===a.COMBINATOR){const n=(0,g.generateCSS)(c);throw new DOMException(`Invalid selector ${n}`,a.SYNTAX_ERR)}if(i=this._matchSelector(s,d).has(d),!i)break}i&&(l=e)}else if(f==="host-context"){let i=d,s;for(;i;){for(const t of b){const{type:n}=t;if(n===a.COMBINATOR){const u=(0,g.generateCSS)(c);throw new DOMException(`Invalid selector ${u}`,a.SYNTAX_ERR)}if(s=this._matchSelector(t,i).has(i),!s)break}if(s)break;i=i.parentNode}s&&(l=e)}}else if(f==="host")l=e;else throw new DOMException(`Invalid selector :${f}`,a.SYNTAX_ERR);return l??null}_matchSelector(c,e,h){const{type:f}=c,l=new Set;if(c.name===a.EMPTY)return l;const r=(0,g.unescapeSelector)(c.name);if(typeof r=="string"&&r!==c.name&&(c.name=r),e.nodeType===a.ELEMENT_NODE)switch(f){case a.SELECTOR_PSEUDO_ELEMENT:{this.#o.matchPseudoElementSelector(r,h);break}case a.SELECTOR_ID:{e.id===r&&l.add(e);break}case a.SELECTOR_CLASS:{e.classList.contains(r)&&l.add(e);break}case a.SELECTOR_PSEUDO_CLASS:return this._matchPseudoClassSelector(c,e,h);default:{const o=this.#o.matchSelector(c,e,h,!0);o&&l.add(o)}}else if(this.#d&&f===a.SELECTOR_PSEUDO_CLASS&&e.nodeType===a.DOCUMENT_FRAGMENT_NODE){if(r!=="has"&&a.REG_LOGICAL_PSEUDO.test(r))return this._matchPseudoClassSelector(c,e,h);if(a.REG_SHADOW_HOST.test(r)){const o=this._matchShadowHostPseudoClass(c,e,h);o&&l.add(o)}}return l}_matchLeaves(c,e,h){let f,l;if(this.#f?l=this.#u.get(c):l=this.#k.get(c),l&&l.has(e)){const{matched:r}=l.get(e);f=r}if(typeof f!="boolean"){let r=!0;e.nodeType===a.ELEMENT_NODE&&a.REG_FORM.test(e.localName)&&(r=!1);for(const o of c){switch(o.type){case a.SELECTOR_ATTR:case a.SELECTOR_ID:{r=!1;break}case a.SELECTOR_PSEUDO_CLASS:{/^(?:(?:any-)?link|defined|dir)$/.test(o.name)&&(r=!1);break}default:}if(f=this._matchSelector(o,e,h).has(e),!f)break}r&&(l||(l=new WeakMap),l.set(e,{matched:f}),this.#f?this.#u.set(c,l):this.#k.set(c,l))}return!!f}_matchHTMLCollection(c,e={}){const{compound:h,filterLeaves:f}=e,l=new Set,r=c.length;if(r)if(h)for(let o=0;o<r;o++){const b=c[o];this._matchLeaves(f,b,e)&&l.add(b)}else{const o=[].slice.call(c);return new Set(o)}return l}_findDescendantNodes(c,e,h){const[f,...l]=c,r=l.length>0,{type:o}=f,b=(0,g.unescapeSelector)(f.name);typeof b=="string"&&b!==f.name&&(f.name=b);let d=new Set,i=!1;if(this.#d)i=!0;else switch(o){case a.SELECTOR_PSEUDO_ELEMENT:{this.#o.matchPseudoElementSelector(b,h);break}case a.SELECTOR_ID:{if(this.#s.nodeType===a.ELEMENT_NODE)i=!0;else{const s=this.#s.getElementById(b);s&&s!==e&&e.contains(s)&&(r?this._matchLeaves(l,s,h)&&d.add(s):d.add(s))}break}case a.SELECTOR_CLASS:{const s=e.getElementsByClassName(b);d=this._matchHTMLCollection(s,{compound:r,filterLeaves:l});break}case a.SELECTOR_TYPE:{if(this.#t.contentType==="text/html"&&!/[*|]/.test(b)){const s=e.getElementsByTagName(b);d=this._matchHTMLCollection(s,{compound:r,filterLeaves:l})}else i=!0;break}default:i=!0}return{nodes:d,pending:i}}_matchCombinator(c,e,h={}){const{combo:f,leaves:l}=c,{name:r}=f,{parentNode:o}=e,{dir:b}=h,d=new Set;if(b===v)switch(r){case"+":{const i=e.nextElementSibling;i&&this._matchLeaves(l,i,h)&&d.add(i);break}case"~":{if(o){const i=this._createTreeWalker(o);let s=(0,k.traverseNode)(e,i);for(s=i.nextSibling();s;)this._matchLeaves(l,s,h)&&d.add(s),s=i.nextSibling()}break}case">":{const i=this._createTreeWalker(e);let s=(0,k.traverseNode)(e,i);for(s=i.firstChild();s;)this._matchLeaves(l,s,h)&&d.add(s),s=i.nextSibling();break}case" ":default:{const{nodes:i,pending:s}=this._findDescendantNodes(l,e);if(i.size)return i;if(s){const t=this._createTreeWalker(e);let n=(0,k.traverseNode)(e,t);for(n=t.nextNode();n&&e.contains(n);)this._matchLeaves(l,n,h)&&d.add(n),n=t.nextNode()}}}else switch(r){case"+":{const i=e.previousElementSibling;i&&this._matchLeaves(l,i,h)&&d.add(i);break}case"~":{if(o){const i=this._createTreeWalker(o);let s=(0,k.traverseNode)(o,i);for(s=i.firstChild();s&&s!==e;)this._matchLeaves(l,s,h)&&d.add(s),s=i.nextSibling()}break}case">":{o&&this._matchLeaves(l,o,h)&&d.add(o);break}case" ":default:{const i=[];let s=o;for(;s;)this._matchLeaves(l,s,h)&&i.push(s),s=s.parentNode;if(i.length)return new Set(i.reverse())}}return d}_findNode(c,e){const{node:h}=e,f=this.#m;let l=(0,k.traverseNode)(h,f),r;if(l)for((l.nodeType!==a.ELEMENT_NODE||l===h&&l!==this.#s)&&(l=f.nextNode());l;){if(this._matchLeaves(c,l,{warn:this.#i})){r=l;break}l=f.nextNode()}return r??null}_matchSelf(c){const e=[],h=this._matchLeaves(c,this.#e,{warn:this.#i});let f=!1;return h&&(e.push(this.#e),f=!0),[e,f]}_findLineal(c,e={}){const{complex:h}=e,f=[];let l=this._matchLeaves(c,this.#e,{warn:this.#i}),r=!1;if(l&&(f.push(this.#e),r=!0),!l||h){let o=this.#e.parentNode;for(;o&&(l=this._matchLeaves(c,o,{warn:this.#i}),l&&(f.push(o),r=!0),o.parentNode);)o=o.parentNode}return[f,r]}_findFirst(c){const e=[],h=this._findNode(c,{node:this.#e});let f=!1;return h&&(e.push(h),f=!0),[e,f]}_findFromHTMLCollection(c,e={}){const{complex:h,compound:f,filterLeaves:l,targetType:r}=e;let o=[],b=!1,d=!1;const i=c.length;if(i)if(this.#e.nodeType===a.ELEMENT_NODE)for(let s=0;s<i;s++){const t=c[s];if(t!==this.#e&&(this.#e.contains(t)||t.contains(this.#e))){if(f){if(this._matchLeaves(l,t,{warn:this.#i})&&(o.push(t),b=!0,r===a.TARGET_FIRST))break}else if(o.push(t),b=!0,r===a.TARGET_FIRST)break}}else if(h)if(f)for(let s=0;s<i;s++){const t=c[s];if(this._matchLeaves(l,t,{warn:this.#i})&&(o.push(t),b=!0,r===a.TARGET_FIRST))break}else o=[].slice.call(c),b=!0,d=!0;else if(f)for(let s=0;s<i;s++){const t=c[s];if(this._matchLeaves(l,t,{warn:this.#i})&&(o.push(t),b=!0,r===a.TARGET_FIRST))break}else o=[].slice.call(c),b=!0,d=!0;return[o,b,d]}_findEntryNodes(c,e,h){const{leaves:f}=c,[l,...r]=f,o=r.length>0,{name:b,type:d}=l;let i=[],s=!1,t=!1,n=!1;switch(d){case a.SELECTOR_PSEUDO_ELEMENT:{this.#o.matchPseudoElementSelector(b,{warn:this.#i});break}case a.SELECTOR_ID:{if(e===a.TARGET_SELF)[i,t]=this._matchSelf(f);else if(e===a.TARGET_LINEAL)[i,t]=this._findLineal(f,{complex:h});else if(e===a.TARGET_FIRST&&this.#s.nodeType!==a.ELEMENT_NODE){const u=this.#s.getElementById(b);u&&(o?this._matchLeaves(r,u,{warn:this.#i})&&(i.push(u),t=!0):(i.push(u),t=!0))}else e===a.TARGET_FIRST?[i,t]=this._findFirst(f):n=!0;break}case a.SELECTOR_CLASS:{if(e===a.TARGET_SELF)[i,t]=this._matchSelf(f);else if(e===a.TARGET_LINEAL)[i,t]=this._findLineal(f,{complex:h});else if(this.#s.nodeType===a.DOCUMENT_NODE){const u=this.#s.getElementsByClassName(b);u.length&&([i,t,s]=this._findFromHTMLCollection(u,{complex:h,compound:o,filterLeaves:r,targetType:e}))}else e===a.TARGET_FIRST?[i,t]=this._findFirst(f):n=!0;break}case a.SELECTOR_TYPE:{if(e===a.TARGET_SELF)[i,t]=this._matchSelf(f);else if(e===a.TARGET_LINEAL)[i,t]=this._findLineal(f,{complex:h});else if(this.#t.contentType==="text/html"&&this.#s.nodeType===a.DOCUMENT_NODE&&!/[*|]/.test(b)){const u=this.#s.getElementsByTagName(b);u.length&&([i,t,s]=this._findFromHTMLCollection(u,{complex:h,compound:o,filterLeaves:r,targetType:e}))}else e===a.TARGET_FIRST?[i,t]=this._findFirst(f):n=!0;break}default:if(e!==a.TARGET_LINEAL&&a.REG_SHADOW_HOST.test(b)){if(this.#d&&this.#e.nodeType===a.DOCUMENT_FRAGMENT_NODE){const u=this._matchShadowHostPseudoClass(l,this.#e);u&&(i.push(u),t=!0)}}else e===a.TARGET_SELF?[i,t]=this._matchSelf(f):e===a.TARGET_LINEAL?[i,t]=this._findLineal(f,{complex:h}):e===a.TARGET_FIRST?[i,t]=this._findFirst(f):n=!0}return{collected:s,compound:o,filtered:t,nodes:i,pending:n}}_collectNodes(c){const e=this.#a.values();if(c===a.TARGET_ALL||c===a.TARGET_FIRST){const h=new Set;let f=0;for(const{branch:l}of e){const r=l.length,o=r>1,b=l[0];let d,i;if(o){const{combo:w,leaves:[{name:p,type:N}]}=b,_=l[r-1],{leaves:[{name:y,type:E}]}=_;if(E===a.SELECTOR_PSEUDO_ELEMENT||E===a.SELECTOR_ID)d=S,i=_;else if(N===a.SELECTOR_PSEUDO_ELEMENT||N===a.SELECTOR_ID)d=v,i=b;else if(c===a.TARGET_ALL)if(p==="*"&&N===a.SELECTOR_TYPE)d=S,i=_;else if(y==="*"&&E===a.SELECTOR_TYPE)d=v,i=b;else if(r===2){const{name:A}=w;/^[+~]$/.test(A)?(d=S,i=_):(d=v,i=b)}else d=v,i=b;else if(y==="*"&&E===a.SELECTOR_TYPE)d=v,i=b;else if(p==="*"&&N===a.SELECTOR_TYPE)d=S,i=_;else{let A;for(const{combo:L,leaves:[R]}of l){const{name:O,type:M}=R;if(M===a.SELECTOR_PSEUDO_CLASS&&O==="dir"){A=!1;break}if(!A&&L){const{name:P}=L;/^[+~]$/.test(P)&&(A=!0)}}A?(d=v,i=b):(d=S,i=_)}}else d=S,i=b;const{collected:s,compound:t,filtered:n,nodes:u,pending:m}=this._findEntryNodes(i,c,o);u.length?(this.#a[f].find=!0,this.#h[f]=u):m&&h.add(new Map([["index",f],["twig",i]])),this.#a[f].collected=s,this.#a[f].dir=d,this.#a[f].filtered=n||!t,f++}if(h.size){let l,r;this.#e!==this.#s&&this.#e.nodeType===a.ELEMENT_NODE?(l=this.#e,r=this.#m):(l=this.#s,r=this.#r);let o=(0,k.traverseNode)(l,r);for(;o;){let b=!1;if(this.#e.nodeType===a.ELEMENT_NODE?o===this.#e?b=!0:b=this.#e.contains(o):b=!0,b)for(const d of h){const{leaves:i}=d.get("twig");if(this._matchLeaves(i,o,{warn:this.#i})){const t=d.get("index");this.#a[t].filtered=!0,this.#a[t].find=!0,this.#h[t].push(o)}}o!==r.currentNode&&(o=(0,k.traverseNode)(o,r)),o=r.nextNode()}}}else{let h=0;for(const{branch:f}of e){const l=f[f.length-1],r=f.length>1,{compound:o,filtered:b,nodes:d}=this._findEntryNodes(l,c,r);d.length&&(this.#a[h].find=!0,this.#h[h]=d),this.#a[h].dir=S,this.#a[h].filtered=b||!o,h++}}return[this.#a,this.#h]}_getCombinedNodes(c,e,h){const f=[];for(const l of e){const r=this._matchCombinator(c,l,{dir:h,warn:this.#i});r.size&&f.push(...r)}return f.length?new Set(f):new Set}_matchNodeNext(c,e,h){const{combo:f,index:l}=h,{combo:r,leaves:o}=c[l],b={combo:f,leaves:o},d=this._getCombinedNodes(b,e,v);let i;if(d.size)if(l===c.length-1){const[s]=(0,k.sortNodes)(d);i=s}else i=this._matchNodeNext(c,d,{combo:r,index:l+1});return i??null}_matchNodePrev(c,e,h){const{index:f}=h,l=c[f],r=new Set([e]),o=this._getCombinedNodes(l,r,S);let b;if(o.size){if(f===0)b=e;else for(const d of o)if(this._matchNodePrev(c,d,{index:f-1}))return e}return b??null}find(c){(c===a.TARGET_ALL||c===a.TARGET_FIRST)&&this._prepareQuerySelectorWalker();const[[...e],h]=this._collectNodes(c),f=e.length;let l,r=new Set;for(let o=0;o<f;o++){const{branch:b,collected:d,dir:i,find:s}=e[o],t=b.length;if(t&&s){const n=h[o],u=n.length,m=t-1;if(m===0)if((c===a.TARGET_ALL||c===a.TARGET_FIRST)&&this.#e.nodeType===a.ELEMENT_NODE)for(let w=0;w<u;w++){const p=n[w];if(p!==this.#e&&this.#e.contains(p)&&(r.add(p),c!==a.TARGET_ALL))break}else if(c===a.TARGET_ALL)if(r.size){const w=[...r];r=new Set([...w,...n]),l=!0}else r=new Set(n);else{const[w]=n;r.add(w)}else if(c===a.TARGET_ALL)if(i===v){let{combo:w}=b[0];for(const p of n){let N=new Set([p]);for(let _=1;_<t;_++){const{combo:y,leaves:E}=b[_],A={combo:w,leaves:E};if(N=this._getCombinedNodes(A,N,i),N.size)if(_===m)if(r.size){const L=[...r];r=new Set([...L,...N]),l=!0}else r=N;else w=y;else break}}}else for(const w of n){let p=new Set([w]);for(let N=m-1;N>=0;N--){const _=b[N];if(p=this._getCombinedNodes(_,p,i),p.size)N===0&&(r.add(w),t>1&&r.size>1&&(l=!0));else break}}else if(c===a.TARGET_FIRST&&i===v){const{combo:w}=b[0];let p;for(const N of n)if(p=this._matchNodeNext(b,new Set([N]),{combo:w,index:1}),p){r.add(p);break}if(!p&&!d){const{leaves:N}=b[0],[_]=n;let y=this._findNode(N,{node:_});for(;y;){if(p=this._matchNodeNext(b,new Set([y]),{combo:w,index:1}),p){r.add(p);break}y=this._findNode(N,{node:y})}}}else{let w;for(const p of n)if(w=this._matchNodePrev(b,p,{index:m-1}),w){r.add(p);break}if(!w&&!d&&c===a.TARGET_FIRST){const{leaves:p}=b[m],[N]=n;let _=this._findNode(p,{node:N});for(;_;){if(w=this._matchNodePrev(b,_,{index:m-1}),w){r.add(_);break}_=this._findNode(p,{node:_})}}}}}return c===a.TARGET_FIRST?(r.delete(this.#e),r.size>1&&(r=new Set((0,k.sortNodes)(r)))):c===a.TARGET_ALL&&(r.delete(this.#e),l&&r.size>1&&(r=new Set((0,k.sortNodes)(r)))),r}}0&&(module.exports={Finder});
//# sourceMappingURL=finder.js.map
