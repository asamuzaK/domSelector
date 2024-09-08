var C=Object.defineProperty;var P=Object.getOwnPropertyDescriptor;var D=Object.getOwnPropertyNames;var U=Object.prototype.hasOwnProperty;var F=(x,c)=>{for(var e in c)C(x,e,{get:c[e],enumerable:!0})},W=(x,c,e,o)=>{if(c&&typeof c=="object"||typeof c=="function")for(let n of D(c))!U.call(x,n)&&n!==e&&C(x,n,{get:()=>c[n],enumerable:!(o=P(c,n))||o.enumerable});return x};var z=x=>W(C({},"__esModule",{value:!0}),x);var H={};F(H,{Finder:()=>$});module.exports=z(H);var O=require("./matcher.js"),y=require("./parser.js"),N=require("./utility.js"),r=require("./constant.js");const v="next",E="prev";class ${#a;#n;#k;#t;#h;#r;#N;#c;#m;#o;#d;#e;#u;#g;#p;#_;#s;#b;#y;#f;#w;#i;#l;constructor(c){this.#l=c,this.#d=new O.Matcher,this.#n=new WeakMap,this.#h=new WeakMap,this.#m=new WeakMap,this.#_=new WeakMap,this.#r=null,this.#N=null,this.#o=null,this._registerEventListeners()}onError(c,e){if(!(e?.noexcept??this.#g))if(c instanceof DOMException||c instanceof this.#l.DOMException)if(c.name===r.NOT_SUPPORTED_ERR)this.#i&&console.warn(c.message);else throw new this.#l.DOMException(c.message,c.name);else throw c.name in this.#l?new this.#l[c.name](c.message):c}setup(c,e,o={}){const{noexcept:n,warn:a}=o;return this.#g=!!n,this.#i=!!a,this.#e=e,[this.#t,this.#s,this.#f]=(0,N.resolveContent)(e),this.#b=(0,N.isInShadowTree)(e),[this.#a,this.#u]=this._correspond(c),this.#m=new WeakMap,this.#w=new WeakMap,this.#y=null,this}_registerEventListeners(){const c={capture:!0,passive:!0},e=[],o=["mouseover","mousedown","mouseup","mouseout"];for(const l of o)e.push(this.#l.addEventListener(l,f=>{this.#r=f},c));const n=["keydown","keyup"];for(const l of n)e.push(this.#l.addEventListener(l,f=>{f.key==="Tab"&&(this.#r=f)},c));const a=["focus","focusin"];for(const l of a)e.push(this.#l.addEventListener(l,f=>{this.#N=f},c));return e}_correspond(c){const e=[];this.#k=!1,this.#c=!1;let o;if(this.#h.has(this.#t)){const n=this.#h.get(this.#t);if(n&&n.has(`${c}`)){const a=n.get(`${c}`);o=a.ast,this.#k=a.descendant,this.#c=a.invalidate}}if(o){const n=o.length;for(let a=0;a<n;a++)o[a].collected=!1,o[a].dir=null,o[a].filtered=!1,o[a].find=!1,e[a]=[]}else{let n;try{n=(0,y.parseSelector)(c)}catch(b){this.onError(b)}const{branches:a,info:l}=(0,y.walkAST)(n),{hasHasPseudoFunc:f,hasLogicalPseudoFunc:u,hasNthChildOfSelector:d}=l;let i=f||!!(u&&d),t=!1,s=0;o=[];for(const[...b]of a){const m=[];let p=b.shift();if(p&&p.type!==r.COMBINATOR){const w=new Set;for(;p;){let k=p.name;if(p.type===r.COMBINATOR){const[_]=b;if(_.type===r.COMBINATOR)throw new DOMException(`Invalid selector ${c}`,r.SYNTAX_ERR);k==="+"||k==="~"?i=!0:t=!0,m.push({combo:p,leaves:(0,y.sortAST)(w)}),w.clear()}else p&&(k&&typeof k=="string"&&(k=(0,y.unescapeSelector)(k),typeof k=="string"&&k!==p.name&&(p.name=k),/[|:]/.test(k)&&(p.namespace=!0)),w.add(p));if(b.length)p=b.shift();else{m.push({combo:null,leaves:(0,y.sortAST)(w)}),w.clear();break}}}o.push({branch:m,collected:!1,dir:null,filtered:!1,find:!1}),e[s]=[],s++}let h;this.#h.has(this.#t)?h=this.#h.get(this.#t):h=new Map,h.set(`${c}`,{ast:o,descendant:t,invalidate:i}),this.#h.set(this.#t,h),this.#k=t,this.#c=i}return[o,e]}_createTreeWalker(c){let e;return this.#w.has(c)?e=this.#w.get(c):(e=this.#t.createTreeWalker(c,r.WALKER_FILTER),this.#w.set(c,e)),e}_prepareQuerySelectorWalker(){return this.#p=this._createTreeWalker(this.#e),this.#p}_collectNthChild(c,e,o){const{a:n,b:a,reverse:l,selector:f}=c,{parentNode:u}=e,d=new Set;let i;if(f){if(this.#n.has(f))i=this.#n.get(f);else{const{branches:s}=(0,y.walkAST)(f);i=s,this.#c||this.#n.set(f,i)}const{branches:t}=(0,y.walkAST)(f);i=t}if(u){const t=this.#f;let s=(0,N.traverseNode)(u,t);s=t.firstChild();let h=0;for(;s;)h++,s=t.nextSibling();const b=new Set;if(i)for(s=(0,N.traverseNode)(u,t),s=t.firstChild();s;){if((0,N.isVisible)(s)){let m;for(const p of i)if(m=this._matchLeaves(p,s,o),!m)break;m&&b.add(s)}s=t.nextSibling()}if(n===0){if(a>0&&a<=h){if(b.size){s=(0,N.traverseNode)(u,t),l?s=t.lastChild():s=t.firstChild();let m=0;for(;s;){if(b.has(s)){if(m===a-1){d.add(s);break}m++}l?s=t.previousSibling():s=t.nextSibling()}}else if(!f){s=(0,N.traverseNode)(u,t),l?s=t.lastChild():s=t.firstChild();let m=0;for(;s;){if(m===a-1){d.add(s);break}l?s=t.previousSibling():s=t.nextSibling(),m++}}}}else{let m=a-1;if(n>0)for(;m<0;)m+=n;if(m>=0&&m<h){s=(0,N.traverseNode)(u,t),l?s=t.lastChild():s=t.firstChild();let p=0,w=n>0?0:a-1;for(;s&&(s&&m>=0&&m<h);)b.size?b.has(s)&&(w===m&&(d.add(s),m+=n),n>0?w++:w--):p===m&&(f||d.add(s),m+=n),l?s=t.previousSibling():s=t.nextSibling(),p++}}if(l&&d.size>1){const m=[...d];return new Set(m.reverse())}}else if(e===this.#s&&n+a===1)if(i){let t;for(const s of i)if(t=this._matchLeaves(s,e,o),t)break;t&&d.add(e)}else d.add(e);return d}_collectNthOfType(c,e){const{a:o,b:n,reverse:a}=c,{localName:l,namespaceURI:f,parentNode:u,prefix:d}=e,i=new Set;if(u){const t=this.#f;let s=(0,N.traverseNode)(u,t);s=t.firstChild();let h=0;for(;s;)h++,s=t.nextSibling();if(o===0){if(n>0&&n<=h){s=(0,N.traverseNode)(u,t),a?s=t.lastChild():s=t.firstChild();let b=0;for(;s;){const{localName:m,namespaceURI:p,prefix:w}=s;if(m===l&&w===d&&p===f){if(b===n-1){i.add(s);break}b++}a?s=t.previousSibling():s=t.nextSibling()}}}else{let b=n-1;if(o>0)for(;b<0;)b+=o;if(b>=0&&b<h){s=(0,N.traverseNode)(u,t),a?s=t.lastChild():s=t.firstChild();let m=o>0?0:n-1;for(;s;){const{localName:p,namespaceURI:w,prefix:k}=s;if(p===l&&k===d&&w===f){if(m===b&&(i.add(s),b+=o),b<0||b>=h)break;o>0?m++:m--}a?s=t.previousSibling():s=t.nextSibling()}}}if(a&&i.size>1){const b=[...i];return new Set(b.reverse())}}else e===this.#s&&o+n===1&&i.add(e);return i}_matchAnPlusB(c,e,o,n){const{nth:{a,b:l,name:f},selector:u}=c,d=new Map;if(f?(f==="even"?(d.set("a",2),d.set("b",0)):f==="odd"&&(d.set("a",2),d.set("b",1)),o.indexOf("last")>-1&&d.set("reverse",!0)):(typeof a=="string"&&/-?\d+/.test(a)?d.set("a",a*1):d.set("a",0),typeof l=="string"&&/-?\d+/.test(l)?d.set("b",l*1):d.set("b",0),o.indexOf("last")>-1&&d.set("reverse",!0)),o==="nth-child"||o==="nth-last-child"){u&&d.set("selector",u);const i=Object.fromEntries(d);return this._collectNthChild(i,e,n)}else if(o==="nth-of-type"||o==="nth-last-of-type"){const i=Object.fromEntries(d);return this._collectNthOfType(i,e)}return new Set}_matchHasPseudoFunc(c,e,o){let n;if(Array.isArray(c)&&c.length){const a=[...c],[l]=a,{type:f}=l;let u;f===r.COMBINATOR?u=a.shift():u={name:" ",type:r.COMBINATOR};const d=[];for(;a.length;){const[s]=a,{type:h}=s;if(h===r.COMBINATOR)break;d.push(a.shift())}const i={combo:u,leaves:d};o.dir=v;const t=this._matchCombinator(i,e,o);if(t.size)if(a.length){for(const s of t)if(n=this._matchHasPseudoFunc(a,s,o),n)break}else n=!0}return!!n}_matchLogicalPseudoFunc(c,e,o){const{astName:n,branches:a,twigBranches:l}=c,{isShadowRoot:f}=o;let u;if(n==="has"){let d;for(const i of a)if(d=this._matchHasPseudoFunc(i,e,o),d)break;if(d)if(f){if(this.#y)return e}else return e}else{if(f){for(const t of a)if(t.length>1)return null}o.forgive=n==="is"||n==="where";const d=l.length;let i;for(let t=0;t<d;t++){const s=l[t],h=s.length-1,{leaves:b}=s[h];if(i=this._matchLeaves(b,e,o),i&&h>0){let m=new Set([e]);for(let p=h-1;p>=0;p--){const w=s[p],k=[];o.dir=E;for(const _ of m){const g=this._matchCombinator(w,_,o);g.size&&k.push(...g)}if(k.length)p===0?i=!0:m=new Set(k);else{i=!1;break}}}if(i)break}if(n==="not"){if(!i)return e}else if(i)return e}return u??null}_matchPseudoClassSelector(c,e,o){const{children:n,name:a}=c,{localName:l,parentNode:f}=e,{forgive:u,warn:d=this.#i}=o,i=new Set;if(r.KEY_LOGICAL.includes(a)){let t;if(this.#n.has(c))t=this.#n.get(c);else{const{branches:h}=(0,y.walkAST)(c);if(a==="has"){for(const b of n){const m=(0,y.findAST)(b,p=>r.KEY_LOGICAL.includes(p.name)&&(0,y.findAST)(p,w=>w.name==="has")?p:null);if(m){const p=m.name;if(p==="is"||p==="where")return i;{const w=(0,y.generateCSS)(c);throw new DOMException(`Invalid selector ${w}`,r.SYNTAX_ERR)}}}t={astName:a,branches:h}}else{const b=[];for(const[...m]of h){const p=[],w=new Set;let k=m.shift();for(;k;)if(k.type===r.COMBINATOR?(p.push({combo:k,leaves:[...w]}),w.clear()):k&&w.add(k),m.length)k=m.shift();else{p.push({combo:null,leaves:[...w]}),w.clear();break}b.push(p)}t={astName:a,branches:h,twigBranches:b},this.#c||this.#n.set(c,t)}}const s=this._matchLogicalPseudoFunc(t,e,o);s&&i.add(s)}else if(Array.isArray(n))if(/^nth-(?:last-)?(?:child|of-type)$/.test(a)){const[t]=n;return this._matchAnPlusB(t,e,a,o)}else switch(a){case"dir":case"lang":{const t=this.#d.matchSelector(c,e,o,!0);t&&i.add(t);break}case"state":{if((0,N.isCustomElement)(e)){const[{value:t}]=n;if(t)if(e[t])i.add(e);else for(const s in e){const h=e[s];if(h instanceof this.#l.ElementInternals){h?.states?.has(t)&&i.add(e);break}}}break}case"current":case"nth-col":case"nth-last-col":{if(d)throw new DOMException(`Unsupported pseudo-class :${a}()`,r.NOT_SUPPORTED_ERR);break}case"host":case"host-context":break;case"contains":{if(d)throw new DOMException(`Unknown pseudo-class :${a}()`,r.NOT_SUPPORTED_ERR);break}default:if(!u)throw new DOMException(`Unknown pseudo-class :${a}()`,r.SYNTAX_ERR)}else switch(a){case"any-link":case"link":{(l==="a"||l==="area")&&e.hasAttribute("href")&&i.add(e);break}case"local-link":{if((l==="a"||l==="area")&&e.hasAttribute("href")){const{href:t,origin:s,pathname:h}=new URL(this.#t.URL),b=new URL(e.getAttribute("href"),t);b.origin===s&&b.pathname===h&&i.add(e)}break}case"visited":break;case"hover":{const{target:t,type:s}=this.#r??{};["mousedown","mouseover","mouseup"].includes(s)&&e.contains(t)&&i.add(e);break}case"active":{const{buttons:t,target:s,type:h}=this.#r??{};h==="mousedown"&&t&r.BIT_01&&e.contains(s)&&i.add(e);break}case"target":{const{hash:t}=new URL(this.#t.URL);e.id&&t===`#${e.id}`&&this.#t.contains(e)&&i.add(e);break}case"target-within":{const{hash:t}=new URL(this.#t.URL);if(t){const s=t.replace(/^#/,"");let h=this.#t.getElementById(s);for(;h;){if(h===e){i.add(e);break}h=h.parentNode}}break}case"scope":{this.#e.nodeType===r.ELEMENT_NODE?!this.#b&&e===this.#e&&i.add(e):e===this.#t.documentElement&&i.add(e);break}case"focus":{e===this.#t.activeElement&&(0,N.isFocusableArea)(e)&&i.add(e);break}case"focus-visible":{if(e===this.#t.activeElement&&(0,N.isFocusableArea)(e)){let t;if((0,N.isFocusVisible)(e))t=!0;else{const{relatedTarget:s,target:h}=this.#N??{};if(h===e)if(this.#r){const{key:b,target:m,type:p}=this.#r;(b==="Tab"&&(p==="keydown"&&m!==e||p==="keyup"&&m===e)||!this.#o||s===this.#o)&&(t=!0)}else(s===null||s===this.#o)&&(t=!0)}t?(this.#o=e,i.add(e)):this.#o===e&&(this.#o=null)}break}case"focus-within":{let t,s=this.#t.activeElement;if((0,N.isFocusableArea)(s))for(;s;){if(s===e){t=!0;break}s=s.parentNode}t&&i.add(e);break}case"open":case"closed":{(l==="details"||l==="dialog")&&(e.hasAttribute("open")?a==="open"&&i.add(e):a==="closed"&&i.add(e));break}case"disabled":case"enabled":{if([...r.KEY_FORM_FOCUS,"fieldset","optgroup","option"].includes(l)||(0,N.isCustomElement)(e,{formAssociated:!0})){let s;if(e.disabled||e.hasAttribute("disabled"))s=!0;else if(e.localName==="option")f.localName==="optgroup"&&(f.disabled||f.hasAttribute("disabled"))&&(s=!0);else if(e.localName!=="optgroup"){let h=f;for(;h;)if(h.localName==="fieldset"&&(h.disabled||h.hasAttribute("disabled"))){const b=this.#f;let m=(0,N.traverseNode)(h,b);for(m=b.firstChild();m&&m.localName!=="legend";)m=b.nextSibling();m&&m.contains(e)||(s=!0);break}else{if(h.localName==="form")break;if(h.parentNode?.nodeType===r.ELEMENT_NODE){if(h.parentNode.localName==="form")break;h=h.parentNode}else break}}s?a==="disabled"&&i.add(e):a==="enabled"&&i.add(e)}break}case"read-only":case"read-write":{let t,s;switch(l){case"textarea":{e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled")?t=!0:s=!0;break}case"input":{(!e.type||r.KEY_INPUT_EDIT.includes(e.type))&&(e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled")?t=!0:s=!0);break}default:(0,N.isContentEditable)(e)?s=!0:t=!0}t?a==="read-only"&&i.add(e):a==="read-write"&&s&&i.add(e);break}case"placeholder-shown":{let t;if(e.placeholder?t=e.placeholder:e.hasAttribute("placeholder")&&(t=e.getAttribute("placeholder")),typeof t=="string"&&!/[\r\n]/.test(t)){let s;l==="textarea"?s=e:l==="input"&&(e.hasAttribute("type")?[...r.KEY_INPUT_TEXT,"number"].includes(e.getAttribute("type"))&&(s=e):s=e),s&&e.value===""&&i.add(e)}break}case"checked":{const t=e.getAttribute("type");(e.checked&&l==="input"&&(t==="checkbox"||t==="radio")||e.selected&&l==="option")&&i.add(e);break}case"indeterminate":{if(e.indeterminate&&l==="input"&&e.type==="checkbox"||l==="progress"&&!e.hasAttribute("value"))i.add(e);else if(l==="input"&&e.type==="radio"&&!e.hasAttribute("checked")){const t=e.name;let s=e.parentNode;for(;s&&s.localName!=="form";)s=s.parentNode;s||(s=this.#t.documentElement);const h=s.getElementsByTagName("input"),b=h.length;let m;for(let p=0;p<b;p++){const w=h[p];if(w.getAttribute("type")==="radio"&&(t?w.getAttribute("name")===t&&(m=!!w.checked):w.hasAttribute("name")||(m=!!w.checked),m))break}m||i.add(e)}break}case"default":{const t=["checkbox","radio"],s=["button","reset"],h=["image","submit"],b=e.getAttribute("type");if(l==="button"&&!(e.hasAttribute("type")&&s.includes(b))||l==="input"&&e.hasAttribute("type")&&h.includes(b)){let m=e.parentNode;for(;m&&m.localName!=="form";)m=m.parentNode;if(m){const p=this.#f;let w=(0,N.traverseNode)(m,p);for(w=p.firstChild();w&&m.contains(w);){const k=w.localName,_=w.getAttribute("type");let g;if(k==="button"?g=!(w.hasAttribute("type")&&s.includes(_)):k==="input"&&(g=w.hasAttribute("type")&&h.includes(_)),g){w===e&&i.add(e);break}w=p.nextNode()}}}else(l==="input"&&e.hasAttribute("type")&&t.includes(b)&&e.hasAttribute("checked")||l==="option"&&e.hasAttribute("selected"))&&i.add(e);break}case"valid":case"invalid":{const t=[...r.KEY_FORM_FOCUS,"form"];if(t.includes(l)){let s;e.checkValidity()&&(e.maxLength>=0?e.maxLength>=e.value.length&&(s=!0):s=!0),s?a==="valid"&&i.add(e):a==="invalid"&&i.add(e)}else if(l==="fieldset"){const s=this.#f;let h=(0,N.traverseNode)(e,s);h=s.firstChild();let b;if(!h)b=!0;else for(;h&&e.contains(h)&&!(t.includes(h.localName)&&(h.checkValidity()?h.maxLength>=0?b=h.maxLength>=h.value.length:b=!0:b=!1,!b));)h=s.nextNode();b?a==="valid"&&i.add(e):a==="invalid"&&i.add(e)}break}case"in-range":case"out-of-range":{const t=[...r.KEY_INPUT_DATE,"number","range"],s=e.getAttribute("type");if(l==="input"&&!(e.readonly||e.hasAttribute("readonly"))&&!(e.disabled||e.hasAttribute("disabled"))&&t.includes(s)){const h=e.validity.rangeUnderflow||e.validity.rangeOverflow;(a==="out-of-range"&&h||a==="in-range"&&!h&&(e.hasAttribute("min")||e.hasAttribute("max")||s==="range"))&&i.add(e)}break}case"required":case"optional":{let t;if(l==="select"||l==="textarea")t=e;else if(l==="input")if(e.hasAttribute("type")){const s=[...r.KEY_INPUT_EDIT,"checkbox","file","radio"],h=e.getAttribute("type");s.includes(h)&&(t=e)}else t=e;t&&(e.required||e.hasAttribute("required")?a==="required"&&i.add(e):a==="optional"&&i.add(e));break}case"root":{e===this.#t.documentElement&&i.add(e);break}case"empty":{if(e.hasChildNodes()){const t=this.#t.createTreeWalker(e,r.SHOW_ALL);let s=t.firstChild(),h;for(;s&&(h=s.nodeType!==r.ELEMENT_NODE&&s.nodeType!==r.TEXT_NODE,!!h);)s=t.nextSibling();h&&i.add(e)}else i.add(e);break}case"first-child":{(f&&e===f.firstElementChild||e===this.#s)&&i.add(e);break}case"last-child":{(f&&e===f.lastElementChild||e===this.#s)&&i.add(e);break}case"only-child":{(f&&e===f.firstElementChild&&e===f.lastElementChild||e===this.#s)&&i.add(e);break}case"first-of-type":{if(f){const[t]=this._collectNthOfType({a:0,b:1},e);t&&i.add(t)}else e===this.#s&&i.add(e);break}case"last-of-type":{if(f){const[t]=this._collectNthOfType({a:0,b:1,reverse:!0},e);t&&i.add(t)}else e===this.#s&&i.add(e);break}case"only-of-type":{if(f){const[t]=this._collectNthOfType({a:0,b:1},e);if(t===e){const[s]=this._collectNthOfType({a:0,b:1,reverse:!0},e);s===e&&i.add(e)}}else e===this.#s&&i.add(e);break}case"defined":{e.hasAttribute("is")||l.includes("-")?(0,N.isCustomElement)(e)&&i.add(e):(e instanceof this.#l.HTMLElement||e instanceof this.#l.SVGElement)&&i.add(e);break}case"popover-open":{e.popover&&(0,N.isVisible)(e)&&i.add(e);break}case"host":case"host-context":break;case"after":case"before":case"first-letter":case"first-line":{if(d)throw new DOMException(`Unsupported pseudo-element ::${a}`,r.NOT_SUPPORTED_ERR);break}case"autofill":case"blank":case"buffering":case"current":case"fullscreen":case"future":case"modal":case"muted":case"past":case"paused":case"picture-in-picture":case"playing":case"seeking":case"stalled":case"user-invalid":case"user-valid":case"volume-locked":case"-webkit-autofill":{if(d)throw new DOMException(`Unsupported pseudo-class :${a}`,r.NOT_SUPPORTED_ERR);break}default:if(a.startsWith("-webkit-")){if(d)throw new DOMException(`Unsupported pseudo-class :${a}`,r.NOT_SUPPORTED_ERR)}else if(!u)throw new DOMException(`Unknown pseudo-class :${a}`,r.SYNTAX_ERR)}return i}_matchShadowHostPseudoClass(c,e){const{children:o,name:n}=c;let a;if(Array.isArray(o)){const{branches:l}=(0,y.walkAST)(o[0]),[f]=l,[...u]=f,{host:d}=e;if(n==="host"){let i;for(const t of u){const{type:s}=t;if(s===r.COMBINATOR){const h=(0,y.generateCSS)(c);throw new DOMException(`Invalid selector ${h}`,r.SYNTAX_ERR)}if(i=this._matchSelector(t,d).has(d),!i)break}if(i)return e}else if(n==="host-context"){let i=d,t;for(;i;){for(const s of u){const{type:h}=s;if(h===r.COMBINATOR){const b=(0,y.generateCSS)(c);throw new DOMException(`Invalid selector ${b}`,r.SYNTAX_ERR)}if(t=this._matchSelector(s,i).has(i),!t)break}if(t)break;i=i.parentNode}if(t)return e}}else{if(n==="host")return e;throw new DOMException(`Invalid selector :${n}`,r.SYNTAX_ERR)}return a??null}_matchSelector(c,e,o={}){const{type:n}=c,a=new Set;if(c.name===r.EMPTY)return a;const l=(0,y.unescapeSelector)(c.name);if(typeof l=="string"&&l!==c.name&&(c.name=l),e.nodeType===r.ELEMENT_NODE)switch(n){case r.PS_ELEMENT_SELECTOR:{this.#d.matchPseudoElementSelector(l,o);break}case r.ID_SELECTOR:{e.id===l&&a.add(e);break}case r.CLASS_SELECTOR:{e.classList.contains(l)&&a.add(e);break}case r.PS_CLASS_SELECTOR:return this._matchPseudoClassSelector(c,e,o);default:{const f=this.#d.matchSelector(c,e,o,!0);f&&a.add(f)}}else if(this.#b&&n===r.PS_CLASS_SELECTOR&&e.nodeType===r.DOCUMENT_FRAGMENT_NODE){if(r.KEY_LOGICAL.includes(l))return o.isShadowRoot=!0,this._matchPseudoClassSelector(c,e,o);if(l==="host"||l==="host-context"){const f=this._matchShadowHostPseudoClass(c,e,o);f&&(this.#y=!0,a.add(f))}}return a}_matchLeaves(c,e,o){let n,a;if(this.#c?a=this.#m.get(c):a=this.#_.get(c),a&&a.has(e)){const{matched:l}=a.get(e);n=l}if(typeof n!="boolean"){let l=!0;const f=[...r.KEY_FORM_FOCUS,"fieldset","form"],u=["any-link","defined","dir","link"];e.nodeType===r.ELEMENT_NODE&&f.includes(e.localName)&&(l=!1);for(const d of c){switch(d.type){case r.ATTR_SELECTOR:case r.ID_SELECTOR:{l=!1;break}case r.PS_CLASS_SELECTOR:{u.includes(d.name)&&(l=!1);break}default:}if(n=this._matchSelector(d,e,o).has(e),!n)break}l&&(a||(a=new WeakMap),a.set(e,{matched:n}),this.#c?this.#m.set(c,a):this.#_.set(c,a))}return!!n}_matchHTMLCollection(c,e){const{compound:o,filterLeaves:n}=e,a=new Set,l=c.length;if(l)if(o)for(let f=0;f<l;f++){const u=c[f];this._matchLeaves(n,u,e)&&a.add(u)}else{const f=[].slice.call(c);return new Set(f)}return a}_findDescendantNodes(c,e,o){const[n,...a]=c,l=a.length>0,{type:f}=n,u=(0,y.unescapeSelector)(n.name);typeof u=="string"&&u!==n.name&&(n.name=u);let d=new Set,i=!1;if(this.#b)i=!0;else switch(f){case r.PS_ELEMENT_SELECTOR:{this.#d.matchPseudoElementSelector(u,o);break}case r.ID_SELECTOR:{if(this.#s.nodeType===r.ELEMENT_NODE)i=!0;else{const t=this.#s.getElementById(u);t&&t!==e&&e.contains(t)&&(l?this._matchLeaves(a,t,o)&&d.add(t):d.add(t))}break}case r.CLASS_SELECTOR:{const t=e.getElementsByClassName(u);d=this._matchHTMLCollection(t,{compound:l,filterLeaves:a});break}case r.TYPE_SELECTOR:{if(this.#t.contentType==="text/html"&&!/[*|]/.test(u)){const t=e.getElementsByTagName(u);d=this._matchHTMLCollection(t,{compound:l,filterLeaves:a})}else i=!0;break}default:i=!0}return{nodes:d,pending:i}}_matchCombinator(c,e,o){const{combo:n,leaves:a}=c,{name:l}=n,{parentNode:f}=e,{dir:u}=o,d=new Set;if(u===v)switch(l){case"+":{const i=e.nextElementSibling;i&&this._matchLeaves(a,i,o)&&d.add(i);break}case"~":{if(f){const i=this._createTreeWalker(f);let t=(0,N.traverseNode)(e,i);for(t=i.nextSibling();t;)this._matchLeaves(a,t,o)&&d.add(t),t=i.nextSibling()}break}case">":{const i=this._createTreeWalker(e);let t=(0,N.traverseNode)(e,i);for(t=i.firstChild();t;)this._matchLeaves(a,t,o)&&d.add(t),t=i.nextSibling();break}case" ":default:{const{nodes:i,pending:t}=this._findDescendantNodes(a,e);if(i.size)return i;if(t){const s=this._createTreeWalker(e);let h=(0,N.traverseNode)(e,s);for(h=s.nextNode();h&&e.contains(h);)this._matchLeaves(a,h,o)&&d.add(h),h=s.nextNode()}}}else switch(l){case"+":{const i=e.previousElementSibling;i&&this._matchLeaves(a,i,o)&&d.add(i);break}case"~":{if(f){const i=this._createTreeWalker(f);let t=(0,N.traverseNode)(f,i);for(t=i.firstChild();t&&t!==e;)this._matchLeaves(a,t,o)&&d.add(t),t=i.nextSibling()}break}case">":{f&&this._matchLeaves(a,f,o)&&d.add(f);break}case" ":default:{const i=[];let t=f;for(;t;)this._matchLeaves(a,t,o)&&i.push(t),t=t.parentNode;if(i.length)return new Set(i.reverse())}}return d}_findNode(c,e){const o=this.#p;let n=(0,N.traverseNode)(e,o),a;if(n)for((n.nodeType!==r.ELEMENT_NODE||n===e&&n!==this.#s)&&(n=o.nextNode());n;){if(this._matchLeaves(c,n,{warn:this.#i})){a=n;break}n=o.nextNode()}return a??null}_matchSelf(c){const e=[],o=this._matchLeaves(c,this.#e,{warn:this.#i});let n=!1;return o&&(e.push(this.#e),n=!0),[e,n]}_findLineal(c,e){const{complex:o}=e,n=[];let a=this._matchLeaves(c,this.#e,{warn:this.#i}),l=!1;if(a&&(n.push(this.#e),l=!0),!a||o){let f=this.#e.parentNode;for(;f&&(a=this._matchLeaves(c,f,{warn:this.#i}),a&&(n.push(f),l=!0),f.parentNode);)f=f.parentNode}return[n,l]}_findFirst(c){const e=[],o=this._findNode(c,this.#e);let n=!1;return o&&(e.push(o),n=!0),[e,n]}_findFromHTMLCollection(c,e){const{complex:o,compound:n,filterLeaves:a,targetType:l}=e;let f=[],u=!1,d=!1;const i=c.length;if(i)if(this.#e.nodeType===r.ELEMENT_NODE)for(let t=0;t<i;t++){const s=c[t];if(s!==this.#e&&(this.#e.contains(s)||s.contains(this.#e))){if(n){if(this._matchLeaves(a,s,{warn:this.#i})&&(f.push(s),u=!0,l===r.TARGET_FIRST))break}else if(f.push(s),u=!0,l===r.TARGET_FIRST)break}}else if(o)if(n)for(let t=0;t<i;t++){const s=c[t];if(this._matchLeaves(a,s,{warn:this.#i})&&(f.push(s),u=!0,l===r.TARGET_FIRST))break}else f=[].slice.call(c),u=!0,d=!0;else if(n)for(let t=0;t<i;t++){const s=c[t];if(this._matchLeaves(a,s,{warn:this.#i})&&(f.push(s),u=!0,l===r.TARGET_FIRST))break}else f=[].slice.call(c),u=!0,d=!0;return[f,u,d]}_findEntryNodes(c,e,o){const{leaves:n}=c,[a,...l]=n,f=l.length>0,{name:u,type:d}=a;let i=[],t=!1,s=!1,h=!1;switch(d){case r.PS_ELEMENT_SELECTOR:{this.#d.matchPseudoElementSelector(u,{warn:this.#i});break}case r.ID_SELECTOR:{if(e===r.TARGET_SELF)[i,s]=this._matchSelf(n);else if(e===r.TARGET_LINEAL)[i,s]=this._findLineal(n,{complex:o});else if(e===r.TARGET_FIRST&&this.#s.nodeType!==r.ELEMENT_NODE){const b=this.#s.getElementById(u);b&&(f?this._matchLeaves(l,b,{warn:this.#i})&&(i.push(b),s=!0):(i.push(b),s=!0))}else e===r.TARGET_FIRST?[i,s]=this._findFirst(n):h=!0;break}case r.CLASS_SELECTOR:{if(e===r.TARGET_SELF)[i,s]=this._matchSelf(n);else if(e===r.TARGET_LINEAL)[i,s]=this._findLineal(n,{complex:o});else if(this.#s.nodeType===r.DOCUMENT_NODE){const b=this.#s.getElementsByClassName(u);b.length&&([i,s,t]=this._findFromHTMLCollection(b,{complex:o,compound:f,filterLeaves:l,targetType:e}))}else e===r.TARGET_FIRST?[i,s]=this._findFirst(n):h=!0;break}case r.TYPE_SELECTOR:{if(e===r.TARGET_SELF)[i,s]=this._matchSelf(n);else if(e===r.TARGET_LINEAL)[i,s]=this._findLineal(n,{complex:o});else if(this.#t.contentType==="text/html"&&this.#s.nodeType===r.DOCUMENT_NODE&&!/[*|]/.test(u)){const b=this.#s.getElementsByTagName(u);b.length&&([i,s,t]=this._findFromHTMLCollection(b,{complex:o,compound:f,filterLeaves:l,targetType:e}))}else e===r.TARGET_FIRST?[i,s]=this._findFirst(n):h=!0;break}default:if(e!==r.TARGET_LINEAL&&(u==="host"||u==="host-context")){if(this.#b&&this.#e.nodeType===r.DOCUMENT_FRAGMENT_NODE){const b=this._matchShadowHostPseudoClass(a,this.#e);b&&(i.push(b),s=!0)}}else e===r.TARGET_SELF?[i,s]=this._matchSelf(n):e===r.TARGET_LINEAL?[i,s]=this._findLineal(n,{complex:o}):e===r.TARGET_FIRST?[i,s]=this._findFirst(n):h=!0}return{collected:t,compound:f,filtered:s,nodes:i,pending:h}}_collectNodes(c){const e=this.#a.values();if(c===r.TARGET_ALL||c===r.TARGET_FIRST){const o=new Set;let n=0;for(const{branch:a}of e){const l=a.length,f=l>1,u=a[0];let d,i;if(f){const{combo:p,leaves:[{name:w,type:k}]}=u,_=a[l-1],{leaves:[{name:g,type:L}]}=_;if(L===r.PS_ELEMENT_SELECTOR||L===r.ID_SELECTOR)d=E,i=_;else if(k===r.PS_ELEMENT_SELECTOR||k===r.ID_SELECTOR)d=v,i=u;else if(c===r.TARGET_ALL)if(w==="*"&&k===r.TYPE_SELECTOR)d=E,i=_;else if(g==="*"&&L===r.TYPE_SELECTOR)d=v,i=u;else if(l===2){const{name:S}=p;S==="+"||S==="~"?(d=E,i=_):(d=v,i=u)}else d=v,i=u;else if(w==="*"&&k===r.TYPE_SELECTOR)d=E,i=_;else if(g==="*"&&L===r.TYPE_SELECTOR)d=v,i=u;else{let S;for(const{combo:T,leaves:[M]}of a){const{name:R,type:I}=M;if(I===r.PS_CLASS_SELECTOR&&R==="dir"){S=!1;break}if(!S&&T){const{name:A}=T;(A==="+"||A==="~")&&(S=!0)}}S?(d=v,i=u):(d=E,i=_)}}else d=E,i=u;const{collected:t,compound:s,filtered:h,nodes:b,pending:m}=this._findEntryNodes(i,c,f);b.length?(this.#a[n].find=!0,this.#u[n]=b):m&&o.add(new Map([["index",n],["twig",i]])),this.#a[n].collected=t,this.#a[n].dir=d,this.#a[n].filtered=h||!s,n++}if(o.size){let a,l;this.#e!==this.#s&&this.#e.nodeType===r.ELEMENT_NODE?(a=this.#e,l=this.#p):(a=this.#s,l=this.#f);let f=(0,N.traverseNode)(a,l);for(;f;){let u=!1;if(this.#e.nodeType===r.ELEMENT_NODE?f===this.#e?u=!0:u=this.#e.contains(f):u=!0,u)for(const d of o){const{leaves:i}=d.get("twig");if(this._matchLeaves(i,f,{warn:this.#i})){const s=d.get("index");this.#a[s].filtered=!0,this.#a[s].find=!0,this.#u[s].push(f)}}f!==l.currentNode&&(f=(0,N.traverseNode)(f,l)),f=l.nextNode()}}}else{let o=0;for(const{branch:n}of e){const a=n[n.length-1],l=n.length>1,{compound:f,filtered:u,nodes:d}=this._findEntryNodes(a,c,l);d.length&&(this.#a[o].find=!0,this.#u[o]=d),this.#a[o].dir=E,this.#a[o].filtered=u||!f,o++}}return[this.#a,this.#u]}_getCombinedNodes(c,e,o){const n=[];for(const a of e){const l=this._matchCombinator(c,a,{dir:o,warn:this.#i});l.size&&n.push(...l)}return n.length?new Set(n):new Set}_matchNodeNext(c,e,o){const{combo:n,index:a}=o,{combo:l,leaves:f}=c[a],u={combo:n,leaves:f},d=this._getCombinedNodes(u,e,v);let i;if(d.size)if(a===c.length-1){const[t]=(0,N.sortNodes)(d);i=t}else i=this._matchNodeNext(c,d,{combo:l,index:a+1});return i??null}_matchNodePrev(c,e,o){const{index:n}=o,a=c[n],l=new Set([e]),f=this._getCombinedNodes(a,l,E);let u;if(f.size){if(n===0)u=e;else for(const d of f)if(this._matchNodePrev(c,d,{index:n-1}))return e}return u??null}find(c){(c===r.TARGET_ALL||c===r.TARGET_FIRST)&&this._prepareQuerySelectorWalker();const[[...e],o]=this._collectNodes(c),n=e.length;let a,l=new Set;for(let f=0;f<n;f++){const{branch:u,collected:d,dir:i,find:t}=e[f],s=u.length;if(s&&t){const h=o[f],b=h.length,m=s-1;if(m===0)if((c===r.TARGET_ALL||c===r.TARGET_FIRST)&&this.#e.nodeType===r.ELEMENT_NODE)for(let p=0;p<b;p++){const w=h[p];if(w!==this.#e&&this.#e.contains(w)&&(l.add(w),c===r.TARGET_FIRST))break}else if(c===r.TARGET_ALL)if(l.size){const p=[...l];l=new Set([...p,...h]),a=!0}else l=new Set(h);else{const[p]=h;l.add(p)}else if(c===r.TARGET_ALL)if(i===v){let{combo:p}=u[0];for(const w of h){let k=new Set([w]);for(let _=1;_<s;_++){const{combo:g,leaves:L}=u[_],S={combo:p,leaves:L};if(k=this._getCombinedNodes(S,k,i),k.size)if(_===m)if(l.size){const T=[...l];l=new Set([...T,...k]),a=!0}else l=k;else p=g;else break}}}else for(const p of h){let w=new Set([p]);for(let k=m-1;k>=0;k--){const _=u[k];if(w=this._getCombinedNodes(_,w,i),w.size)k===0&&(l.add(p),s>1&&l.size>1&&(a=!0));else break}}else if(c===r.TARGET_FIRST&&i===v){const{combo:p}=u[0];let w;for(const k of h)if(w=this._matchNodeNext(u,new Set([k]),{combo:p,index:1}),w){l.add(w);break}if(!w&&!d){const{leaves:k}=u[0],[_]=h;let g=this._findNode(k,_);for(;g;){if(w=this._matchNodeNext(u,new Set([g]),{combo:p,index:1}),w){l.add(w);break}g=this._findNode(k,g)}}}else{let p;for(const w of h)if(p=this._matchNodePrev(u,w,{index:m-1}),p){l.add(w);break}if(!p&&!d&&c===r.TARGET_FIRST){const{leaves:w}=u[m],[k]=h;let _=this._findNode(w,k);for(;_;){if(p=this._matchNodePrev(u,_,{index:m-1}),p){l.add(_);break}_=this._findNode(w,_)}}}}}return c===r.TARGET_FIRST?(l.delete(this.#e),l.size>1&&(l=new Set((0,N.sortNodes)(l)))):c===r.TARGET_ALL&&(l.delete(this.#e),a&&l.size>1&&(l=new Set((0,N.sortNodes)(l)))),l}}0&&(module.exports={Finder});
//# sourceMappingURL=finder.js.map
