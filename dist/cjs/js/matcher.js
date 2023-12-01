var F=Object.create;var P=Object.defineProperty;var V=Object.getOwnPropertyDescriptor;var j=Object.getOwnPropertyNames;var H=Object.getPrototypeOf,G=Object.prototype.hasOwnProperty;var W=(S,s)=>{for(var e in s)P(S,e,{get:s[e],enumerable:!0})},z=(S,s,e,c)=>{if(s&&typeof s=="object"||typeof s=="function")for(let h of j(s))!G.call(S,h)&&h!==e&&P(S,h,{get:()=>s[h],enumerable:!(c=V(s,h))||c.enumerable});return S};var q=(S,s,e)=>(e=S!=null?F(H(S)):{},z(s||!S||!S.__esModule?P(e,"default",{value:S,enumerable:!0}):e,S)),X=S=>z(P({},"__esModule",{value:!0}),S);var J={};W(J,{Matcher:()=>Y});module.exports=X(J);var B=q(require("is-potential-custom-element-name"),1),E=require("./dom-util.js"),y=require("./parser.js"),r=require("./constant.js");const R="next",M="prev",U="all",C="first",D="lineal",I="self";class Y{#i;#r;#a;#e;#l;#t;#o;#s;constructor(s,e,c={}){const{warn:h}=c;this.#r=new Map([[r.SELECTOR_PSEUDO_ELEMENT,r.BIT_01],[r.SELECTOR_ID,r.BIT_02],[r.SELECTOR_CLASS,r.BIT_04],[r.SELECTOR_TYPE,r.BIT_08],[r.SELECTOR_ATTR,r.BIT_16],[r.SELECTOR_PSEUDO_CLASS,r.BIT_32]]),this.#a=new WeakMap,this.#o=s,this.#e=e,this.#s=!!h,[this.#i,this.#l]=this._prepare(s),this.#t=this._getRoot(e)}_onError(s){if(s instanceof DOMException&&s.name===r.NOT_SUPPORTED_ERR)this.#s&&console.warn(s.message);else throw s}_getRoot(s=this.#e){let e,c;switch(s.nodeType){case r.DOCUMENT_NODE:{e=s,c=s;break}case r.DOCUMENT_FRAGMENT_NODE:{e=s.ownerDocument,c=s;break}case r.ELEMENT_NODE:{if((0,E.isSameOrDescendant)(s))e=s.ownerDocument,c=s.ownerDocument;else{let l=s;for(;l&&l.parentNode;)l=l.parentNode;e=l.ownerDocument,c=l}break}default:throw new TypeError(`Unexpected node ${s.nodeName}`)}const h=(0,E.isInShadowTree)(s);return{document:e,root:c,shadow:h}}_sortLeaves(s){const e=[...s];return e.length>1&&e.sort((c,h)=>{const{type:l}=c,{type:u}=h,m=this.#r.get(l),n=this.#r.get(u);let t;return m===n?t=0:m>n?t=1:t=-1,t}),e}_prepare(s=this.#o){const e=(0,y.parseSelector)(s),c=(0,y.walkAST)(e),h=[],l=[];let u=0;for(const[...m]of c){const n=[];let t=m.shift();if(t&&t.type!==r.COMBINATOR){const i=new Set;for(;t;){if(t.type===r.COMBINATOR){const[o]=m;if(o.type===r.COMBINATOR){const d=`Invalid combinator ${t.name}${o.name}`;throw new DOMException(d,r.SYNTAX_ERR)}n.push({combo:t,leaves:this._sortLeaves(i)}),i.clear()}else t&&i.add(t);if(m.length)t=m.shift();else{n.push({combo:null,leaves:this._sortLeaves(i)}),i.clear();break}}}h.push({branch:n,find:null,skip:!1}),l[u]=new Set,u++}return[h,l]}_collectNthChild(s,e){const{a:c,b:h,reverse:l,selector:u}=s,{parentNode:m}=e,n=new Set;let t;if(u&&(this.#a.has(u)?t=this.#a.get(u):(t=(0,y.walkAST)(u),this.#a.set(u,t))),m){const i=[].slice.call(m.children),o=i.length;if(o){const d=new Set;if(t){const a=t.length;for(const f of i){let b;for(let p=0;p<a;p++){const N=t[p];if(b=this._matchLeaves(N,f),!b)break}b&&d.add(f)}}if(l&&i.reverse(),c===0){if(h>0&&h<=o){if(d.size)for(let a=0;a<o;a++){const f=i[a];if(d.has(f)){n.add(f);break}}else if(!u){const a=i[h-1];n.add(a)}}}else{let a=h-1;if(c>0)for(;a<0;)a+=c;if(a>=0&&a<o){let f=c>0?0:h-1;for(let b=0;b<o&&a>=0&&a<o;b++){const p=i[b];d.size?d.has(p)&&(f===a&&(n.add(p),a+=c),c>0?f++:f--):b===a&&(u||n.add(p),a+=c)}}}}}else{const{root:i}=this.#t;if(e===i&&i.nodeType===r.ELEMENT_NODE&&c+h===1)if(t){const o=t.length;let d;for(let a=0;a<o;a++){const f=t[a];if(d=this._matchLeaves(f,e),d)break}d&&n.add(e)}else n.add(e)}return n}_collectNthOfType(s,e){const{a:c,b:h,reverse:l}=s,{localName:u,parentNode:m,prefix:n}=e,t=new Set;if(m){const i=[].slice.call(m.children),o=i.length;if(o)if(l&&i.reverse(),c===0){if(h>0&&h<=o){let d=0;for(let a=0;a<o;a++){const f=i[a],{localName:b,prefix:p}=f;if(b===u&&p===n){if(d===h-1){t.add(f);break}d++}}}}else{let d=h-1;if(c>0)for(;d<0;)d+=c;if(d>=0&&d<o){let a=c>0?0:h-1;for(let f=0;f<o;f++){const b=i[f],{localName:p,prefix:N}=b;if(p===u&&N===n){if(a===d&&(t.add(b),d+=c),d<0||d>=o)break;c>0?a++:a--}}}}}else{const{root:i}=this.#t;e===i&&i.nodeType===r.ELEMENT_NODE&&c+h===1&&t.add(e)}return t}_matchAnPlusB(s,e,c){const{nth:{a:h,b:l,name:u},selector:m}=s,n=(0,y.unescapeSelector)(u),t=new Map;n?(n==="even"?(t.set("a",2),t.set("b",0)):n==="odd"&&(t.set("a",2),t.set("b",1)),c.indexOf("last")>-1&&t.set("reverse",!0)):(typeof h=="string"&&/-?\d+/.test(h)?t.set("a",h*1):t.set("a",0),typeof l=="string"&&/-?\d+/.test(l)?t.set("b",l*1):t.set("b",0),c.indexOf("last")>-1&&t.set("reverse",!0));let i=new Set;if(t.has("a")&&t.has("b")){if(/^nth-(?:last-)?child$/.test(c)){m&&t.set("selector",m);const o=Object.fromEntries(t),d=this._collectNthChild(o,e);d.size&&(i=d)}else if(/^nth-(?:last-)?of-type$/.test(c)){const o=Object.fromEntries(t),d=this._collectNthOfType(o,e);d.size&&(i=d)}}return i}_matchPseudoElementSelector(s,e={}){const{forgive:c}=e;switch(s){case"after":case"backdrop":case"before":case"cue":case"cue-region":case"first-letter":case"first-line":case"file-selector-button":case"marker":case"placeholder":case"selection":case"target-text":{if(this.#s)throw new DOMException(`Unsupported pseudo-element ::${s}`,r.NOT_SUPPORTED_ERR);break}case"part":case"slotted":{if(this.#s)throw new DOMException(`Unsupported pseudo-element ::${s}()`,r.NOT_SUPPORTED_ERR);break}default:if(s.startsWith("-webkit-")){if(this.#s)throw new DOMException(`Unsupported pseudo-element ::${s}`,r.NOT_SUPPORTED_ERR)}else if(!c)throw new DOMException(`Unknown pseudo-element ::${s}`,r.SYNTAX_ERR)}}_matchDirectionPseudoClass(s,e){const c=(0,y.unescapeSelector)(s.name),h=(0,E.getDirectionality)(e);let l;return c===h&&(l=e),l??null}_matchLanguagePseudoClass(s,e){const c=(0,y.unescapeSelector)(s.name);let h;if(c)if(c==="*")if(e.hasAttribute("lang"))e.getAttribute("lang")&&(h=e);else{let l=e.parentNode;for(;l;){if(l.hasAttribute("lang")){l.getAttribute("lang")&&(h=e);break}l=l.parentNode}}else{const l=`(?:-${r.ALPHA_NUM})*`;if(new RegExp(`^(?:\\*-)?${r.ALPHA_NUM}${l}$`,"i").test(c)){let m;if(c.indexOf("-")>-1){const[n,t,...i]=c.split("-");let o;n==="*"?o=`${r.ALPHA_NUM}${l}`:o=`${n}${l}`;const d=`-${t}${l}`,a=i.length;let f="";if(a)for(let b=0;b<a;b++)f+=`-${i[b]}${l}`;m=new RegExp(`^${o}${d}${f}$`,"i")}else m=new RegExp(`^${c}${l}$`,"i");if(e.hasAttribute("lang"))m.test(e.getAttribute("lang"))&&(h=e);else{let n=e.parentNode;for(;n;){if(n.hasAttribute("lang")){const t=n.getAttribute("lang");m.test(t)&&(h=e);break}n=n.parentNode}}}}return h??null}_matchHasPseudoFunc(s,e){let c;if(Array.isArray(s)&&s.length){const[h]=s,{type:l}=h;let u;l===r.COMBINATOR?u=s.shift():u={name:" ",type:r.COMBINATOR};const m=[];for(;s.length;){const[i]=s,{type:o}=i;if(o===r.COMBINATOR)break;m.push(s.shift())}const n={combo:u,leaves:m},t=this._matchCombinator(n,e,{find:R});if(t.size)if(s.length){for(const i of t)if(c=this._matchHasPseudoFunc(Object.assign([],s),i),c)break}else c=!0}return!!c}_matchLogicalPseudoFunc(s,e){const{astName:c="",branches:h=[],selector:l="",twigBranches:u=[]}=s;let m;if(c==="has")if(l.includes(":has("))m=null;else{const n=h.length;let t;for(let i=0;i<n;i++){const o=h[i];if(t=this._matchHasPseudoFunc(Object.assign([],o),e),t)break}t&&(m=e)}else{const n=/^(?:is|where)$/.test(c),t=u.length;let i;for(let o=0;o<t;o++){const d=u[o],a=d.length-1,{leaves:f}=d[a];if(i=this._matchLeaves(f,e,{forgive:n}),i&&a>0){let b=new Set([e]);for(let p=a-1;p>=0;p--){const N=d[p],k=[];for(const x of b){const L=this._matchCombinator(N,x,{forgive:n,find:M});L.size&&k.push(...L)}if(k.length)if(p===0){i=!0;break}else b=new Set(k);else{i=!1;break}}}if(i)break}c==="not"?i||(m=e):i&&(m=e)}return m??null}_matchPseudoClassSelector(s,e,c={}){const{children:h}=s,{localName:l,parentNode:u}=e,{forgive:m}=c,n=(0,y.unescapeSelector)(s.name);let t=new Set;if(r.REG_LOGICAL_PSEUDO.test(n)){let i;if(this.#a.has(s))i=this.#a.get(s);else{const d=(0,y.walkAST)(s),a=[],f=[];for(const[...b]of d){for(const x of b){const L=(0,y.generateCSS)(x);a.push(L)}const p=[],N=new Set;let k=b.shift();for(;k;)if(k.type===r.COMBINATOR?(p.push({combo:k,leaves:[...N]}),N.clear()):k&&N.add(k),b.length)k=b.shift();else{p.push({combo:null,leaves:[...N]}),N.clear();break}f.push(p)}i={astName:n,branches:d,twigBranches:f,selector:a.join(",")},this.#a.set(s,i)}const o=this._matchLogicalPseudoFunc(i,e);o&&t.add(o)}else if(Array.isArray(h)){const[i]=h;if(/^nth-(?:last-)?(?:child|of-type)$/.test(n)){const o=this._matchAnPlusB(i,e,n);o.size&&(t=o)}else if(n==="dir"){const o=this._matchDirectionPseudoClass(i,e);o&&t.add(o)}else if(n==="lang"){const o=this._matchLanguagePseudoClass(i,e);o&&t.add(o)}else switch(n){case"current":case"nth-col":case"nth-last-col":{if(this.#s)throw new DOMException(`Unsupported pseudo-class :${n}()`,r.NOT_SUPPORTED_ERR);break}default:if(!m)throw new DOMException(`Unknown pseudo-class :${n}()`,r.SYNTAX_ERR)}}else{const{document:i,root:o}=this.#t,{documentElement:d}=i,a=new URL(i.URL),f=/^a(?:rea)?$/,b=/^(?:(?:fieldse|inpu|selec)t|button|opt(?:group|ion)|textarea)$/,p=/^(?:(?:inpu|selec)t|button|form|textarea)$/,N=/^d(?:etails|ialog)$/,k=/^(?:checkbox|radio)$/,x=/^(?:date(?:time-local)?|month|time|week)$/,L=/(?:(?:rang|tim)e|date(?:time-local)?|month|number|week)$/,O=/^(?:(?:emai|te|ur)l|number|password|search|text)$/;switch(n){case"any-link":case"link":{f.test(l)&&e.hasAttribute("href")&&t.add(e);break}case"local-link":{if(f.test(l)&&e.hasAttribute("href")){const g=new URL(e.getAttribute("href"),a.href);g.origin===a.origin&&g.pathname===a.pathname&&t.add(e)}break}case"visited":break;case"target":{e.id&&a.hash&&a.hash===`#${e.id}`&&(0,E.isSameOrDescendant)(e)&&t.add(e);break}case"target-within":{if(a.hash){const g=a.hash.replace(/^#/,"");let w=i.getElementById(g);for(;w;){if(w===e){t.add(e);break}w=w.parentNode}}break}case"scope":{this.#e.nodeType===r.ELEMENT_NODE?e===this.#e&&t.add(e):e===d&&t.add(e);break}case"focus":{e===i.activeElement&&t.add(e);break}case"focus-within":{let g=i.activeElement;for(;g;){if(g===e){t.add(e);break}g=g.parentNode}break}case"open":{N.test(l)&&e.hasAttribute("open")&&t.add(e);break}case"closed":{N.test(l)&&!e.hasAttribute("open")&&t.add(e);break}case"disabled":{if(b.test(l)||(0,B.default)(l))if(e.disabled||e.hasAttribute("disabled"))t.add(e);else{let g=u;for(;g&&g.localName!=="fieldset";)g=g.parentNode;g&&u.localName!=="legend"&&g.hasAttribute("disabled")&&t.add(e)}break}case"enabled":{(b.test(l)||(0,B.default)(l))&&!(e.disabled&&e.hasAttribute("disabled"))&&t.add(e);break}case"read-only":{switch(l){case"textarea":{(e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled"))&&t.add(e);break}case"input":{(!e.type||x.test(e.type)||O.test(e.type))&&(e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled"))&&t.add(e);break}default:(0,E.isContentEditable)(e)||t.add(e)}break}case"read-write":{switch(l){case"textarea":{e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled")||t.add(e);break}case"input":{(!e.type||x.test(e.type)||O.test(e.type))&&!(e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled"))&&t.add(e);break}default:(0,E.isContentEditable)(e)&&t.add(e)}break}case"placeholder-shown":{let g;l==="textarea"?g=e:l==="input"&&(e.hasAttribute("type")?O.test(e.getAttribute("type"))&&(g=e):g=e),g&&e.value===""&&e.hasAttribute("placeholder")&&e.getAttribute("placeholder").trim().length&&t.add(e);break}case"checked":{(e.checked&&l==="input"&&e.hasAttribute("type")&&k.test(e.getAttribute("type"))||e.selected&&l==="option")&&t.add(e);break}case"indeterminate":{if(e.indeterminate&&l==="input"&&e.type==="checkbox"||l==="progress"&&!e.hasAttribute("value"))t.add(e);else if(l==="input"&&e.type==="radio"&&!e.hasAttribute("checked")){const g=e.name;let w=e.parentNode;for(;w&&w.localName!=="form";)w=w.parentNode;w||(w=d);const _=[].slice.call(w.getElementsByTagName("input"));let v;for(const A of _)if(A.getAttribute("type")==="radio"&&(g?A.getAttribute("name")===g&&(v=!!A.checked):A.hasAttribute("name")||(v=!!A.checked),v))break;v||t.add(e)}break}case"default":{const g=/^(?:button|reset)$/,w=/^(?:image|submit)$/;if(l==="button"&&!(e.hasAttribute("type")&&g.test(e.getAttribute("type")))||l==="input"&&e.hasAttribute("type")&&w.test(e.getAttribute("type"))){let _=e.parentNode;for(;_&&_.localName!=="form";)_=_.parentNode;if(_){const v=i.createNodeIterator(_,r.SHOW_ELEMENT);let A=v.nextNode();for(;A;){const $=A.localName;let T;if($==="button"?T=!(A.hasAttribute("type")&&g.test(A.getAttribute("type"))):$==="input"&&(T=A.hasAttribute("type")&&w.test(A.getAttribute("type"))),T){A===e&&t.add(e);break}A=v.nextNode()}}}else if(l==="input"&&e.hasAttribute("type")&&k.test(e.getAttribute("type"))&&(e.checked||e.hasAttribute("checked")))t.add(e);else if(l==="option"){let _=!1,v=u;for(;v&&v.localName!=="datalist";){if(v.localName==="select"){(v.multiple||v.hasAttribute("multiple"))&&(_=!0);break}v=v.parentNode}if(_)(e.selected||e.hasAttribute("selected"))&&t.add(e);else{const A=u.firstElementChild,$=new Set;let T=A;for(;T;){if(T.selected||T.hasAttribute("selected")){$.add(T);break}T=T.nextElementSibling}$.size||$.add(A),$.has(e)&&t.add(e)}}break}case"valid":{if(p.test(l))e.checkValidity()&&t.add(e);else if(l==="fieldset"){const g=i.createNodeIterator(e,r.SHOW_ELEMENT);let w=g.nextNode();w===e&&(w=g.nextNode());let _;for(;w&&!(p.test(w.localName)&&(_=w.checkValidity(),!_));)w=g.nextNode();_&&t.add(e)}break}case"invalid":{if(p.test(l))e.checkValidity()||t.add(e);else if(l==="fieldset"){const g=i.createNodeIterator(e,r.SHOW_ELEMENT);let w=g.nextNode();w===e&&(w=g.nextNode());let _;for(;w&&!(p.test(w.localName)&&(_=w.checkValidity(),!_));)w=g.nextNode();_||t.add(e)}break}case"in-range":{l==="input"&&!(e.readonly||e.hasAttribute("readonly"))&&!(e.disabled||e.hasAttribute("disabled"))&&e.hasAttribute("type")&&L.test(e.getAttribute("type"))&&!(e.validity.rangeUnderflow||e.validity.rangeOverflow)&&(e.hasAttribute("min")||e.hasAttribute("max")||e.getAttribute("type")==="range")&&t.add(e);break}case"out-of-range":{l==="input"&&!(e.readonly||e.hasAttribute("readonly"))&&!(e.disabled||e.hasAttribute("disabled"))&&e.hasAttribute("type")&&L.test(e.getAttribute("type"))&&(e.validity.rangeUnderflow||e.validity.rangeOverflow)&&t.add(e);break}case"required":{let g;if(/^(?:select|textarea)$/.test(l))g=e;else if(l==="input")if(e.hasAttribute("type")){const w=e.getAttribute("type");(w==="file"||k.test(w)||x.test(w)||O.test(w))&&(g=e)}else g=e;g&&(e.required||e.hasAttribute("required"))&&t.add(e);break}case"optional":{let g;if(/^(?:select|textarea)$/.test(l))g=e;else if(l==="input")if(e.hasAttribute("type")){const w=e.getAttribute("type");(w==="file"||k.test(w)||x.test(w)||O.test(w))&&(g=e)}else g=e;g&&!(e.required||e.hasAttribute("required"))&&t.add(e);break}case"root":{e===d&&t.add(e);break}case"empty":{if(e.hasChildNodes()){const g=e.childNodes.values();let w;for(const _ of g)if(w=_.nodeType!==r.ELEMENT_NODE&&_.nodeType!==r.TEXT_NODE,!w)break;w&&t.add(e)}else t.add(e);break}case"first-child":{(u&&e===u.firstElementChild||e===o&&o.nodeType===r.ELEMENT_NODE)&&t.add(e);break}case"last-child":{(u&&e===u.lastElementChild||e===o&&o.nodeType===r.ELEMENT_NODE)&&t.add(e);break}case"only-child":{(u&&e===u.firstElementChild&&e===u.lastElementChild||e===o&&o.nodeType===r.ELEMENT_NODE)&&t.add(e);break}case"first-of-type":{if(u){const[g]=this._collectNthOfType({a:0,b:1},e);g&&t.add(g)}else e===o&&o.nodeType===r.ELEMENT_NODE&&t.add(e);break}case"last-of-type":{if(u){const[g]=this._collectNthOfType({a:0,b:1,reverse:!0},e);g&&t.add(g)}else e===o&&o.nodeType===r.ELEMENT_NODE&&t.add(e);break}case"only-of-type":{if(u){const[g]=this._collectNthOfType({a:0,b:1},e);if(g===e){const[w]=this._collectNthOfType({a:0,b:1,reverse:!0},e);w===e&&t.add(e)}}else e===o&&o.nodeType===r.ELEMENT_NODE&&t.add(e);break}case"host":case"host-context":break;case"after":case"before":case"first-letter":case"first-line":{if(this.#s)throw new DOMException(`Unsupported pseudo-element ::${n}`,r.NOT_SUPPORTED_ERR);break}case"active":case"autofill":case"blank":case"buffering":case"current":case"focus-visible":case"fullscreen":case"future":case"hover":case"modal":case"muted":case"past":case"paused":case"picture-in-picture":case"playing":case"seeking":case"stalled":case"user-invalid":case"user-valid":case"volume-locked":case"-webkit-autofill":{if(this.#s)throw new DOMException(`Unsupported pseudo-class :${n}`,r.NOT_SUPPORTED_ERR);break}default:if(n.startsWith("-webkit-")){if(this.#s)throw new DOMException(`Unsupported pseudo-class :${n}`,r.NOT_SUPPORTED_ERR)}else if(!m)throw new DOMException(`Unknown pseudo-class :${n}`,r.SYNTAX_ERR)}}return t}_matchAttributeSelector(s,e){const{flags:c,matcher:h,name:l,value:u}=s;if(typeof c=="string"&&!/^[is]$/i.test(c)){const t=(0,y.generateCSS)(s);throw new DOMException(`Invalid selector ${t}`,r.SYNTAX_ERR)}const{attributes:m}=e;let n;if(m&&m.length){const{document:t}=this.#t;let i;t.contentType==="text/html"?typeof c=="string"&&/^s$/i.test(c)?i=!1:i=!0:typeof c=="string"&&/^i$/i.test(c)?i=!0:i=!1;let o=(0,y.unescapeSelector)(l.name);i&&(o=o.toLowerCase());const d=new Set;if(o.indexOf("|")>-1){const{prefix:a,tagName:f}=(0,E.selectorToNodeProps)(o);for(let{name:b,value:p}of m)switch(i&&(b=b.toLowerCase(),p=p.toLowerCase()),a){case"":{f===b&&d.add(p);break}case"*":{b.indexOf(":")>-1?b.endsWith(`:${f}`)&&d.add(p):f===b&&d.add(p);break}default:if(b.indexOf(":")>-1){const[N,k]=b.split(":");a===N&&f===k&&(0,E.isNamespaceDeclared)(a,e)&&d.add(p)}}}else for(let{name:a,value:f}of m)if(i&&(a=a.toLowerCase(),f=f.toLowerCase()),a.indexOf(":")>-1){const[b,p]=a.split(":");if(b==="xml"&&p==="lang")continue;o===p&&d.add(f)}else o===a&&d.add(f);if(d.size){const{name:a,value:f}=u||{};let b;switch(a?i?b=a.toLowerCase():b=a:f?i?b=f.toLowerCase():b=f:f===""&&(b=f),h){case"=":{typeof b=="string"&&d.has(b)&&(n=e);break}case"~=":{if(b&&typeof b=="string"){for(const p of d)if(new Set(p.split(/\s+/)).has(b)){n=e;break}}break}case"|=":{if(b&&typeof b=="string"){let p;for(const N of d)if(N===b||N.startsWith(`${b}-`)){p=N;break}p&&(n=e)}break}case"^=":{if(b&&typeof b=="string"){let p;for(const N of d)if(N.startsWith(`${b}`)){p=N;break}p&&(n=e)}break}case"$=":{if(b&&typeof b=="string"){let p;for(const N of d)if(N.endsWith(`${b}`)){p=N;break}p&&(n=e)}break}case"*=":{if(b&&typeof b=="string"){let p;for(const N of d)if(N.includes(`${b}`)){p=N;break}p&&(n=e)}break}case null:default:n=e}}}return n??null}_matchClassSelector(s,e){const c=(0,y.unescapeSelector)(s.name);let h;return e.classList.contains(c)&&(h=e),h??null}_matchIDSelector(s,e){const c=(0,y.unescapeSelector)(s.name),{id:h}=e;let l;return c===h&&(l=e),l??null}_matchTypeSelector(s,e,c={}){const h=(0,y.unescapeSelector)(s.name),{localName:l,prefix:u}=e,{forgive:m}=c,{document:n}=this.#t;let{prefix:t,tagName:i}=(0,E.selectorToNodeProps)(h,e);n.contentType==="text/html"&&(t=t.toLowerCase(),i=i.toLowerCase());let o,d;l.indexOf(":")>-1?[o,d]=l.split(":"):(o=u||"",d=l);let a;if(t===""&&o==="")e.namespaceURI===null&&(i==="*"||i===d)&&(a=e);else if(t==="*")(i==="*"||i===d)&&(a=e);else if(t===o){if((0,E.isNamespaceDeclared)(t,e))(i==="*"||i===d)&&(a=e);else if(!m)throw new DOMException(`Undeclared namespace ${t}`,r.SYNTAX_ERR)}else if(t&&!m&&!(0,E.isNamespaceDeclared)(t,e))throw new DOMException(`Undeclared namespace ${t}`,r.SYNTAX_ERR);return a??null}_matchShadowHostPseudoClass(s,e){const{children:c}=s,h=(0,y.unescapeSelector)(s.name);let l;if(Array.isArray(c)){const[u]=(0,y.walkAST)(c[0]),[...m]=u,{host:n}=e;if(h==="host"){let t;for(const i of m){const{type:o}=i;if(o===r.COMBINATOR){const d=(0,y.generateCSS)(s);throw new DOMException(`Invalid selector ${d}`,r.SYNTAX_ERR)}if(t=this._matchSelector(i,n).has(n),!t)break}t&&(l=e)}else if(h==="host-context"){let t=n,i;for(;t;){for(const o of m){const{type:d}=o;if(d===r.COMBINATOR){const a=(0,y.generateCSS)(s);throw new DOMException(`Invalid selector ${a}`,r.SYNTAX_ERR)}if(i=this._matchSelector(o,t).has(t),!i)break}if(i)break;t=t.parentNode}i&&(l=e)}}else h==="host"&&(l=e);return l??null}_matchSelector(s,e,c){const{type:h}=s,l=(0,y.unescapeSelector)(s.name),{shadow:u}=this.#t;let m=new Set;if(e.nodeType===r.ELEMENT_NODE)switch(h){case r.SELECTOR_ATTR:{const n=this._matchAttributeSelector(s,e);n&&m.add(n);break}case r.SELECTOR_CLASS:{const n=this._matchClassSelector(s,e);n&&m.add(n);break}case r.SELECTOR_ID:{const n=this._matchIDSelector(s,e);n&&m.add(n);break}case r.SELECTOR_PSEUDO_CLASS:{const n=this._matchPseudoClassSelector(s,e,c);n.size&&(m=n);break}case r.SELECTOR_PSEUDO_ELEMENT:{this._matchPseudoElementSelector(l,c);break}case r.SELECTOR_TYPE:default:{const n=this._matchTypeSelector(s,e,c);n&&m.add(n)}}else if(u&&h===r.SELECTOR_PSEUDO_CLASS&&e.nodeType===r.DOCUMENT_FRAGMENT_NODE){if(l!=="has"&&r.REG_LOGICAL_PSEUDO.test(l)){const n=this._matchPseudoClassSelector(s,e,c);n.size&&(m=n)}else if(r.REG_SHADOW_HOST.test(l)){const n=this._matchShadowHostPseudoClass(s,e);n&&m.add(n)}}return m}_matchLeaves(s,e,c){let h;for(const l of s)if(h=this._matchSelector(l,e,c).has(e),!h)break;return!!h}_findDescendantNodes(s,e){const[c,...h]=s,{type:l}=c,u=(0,y.unescapeSelector)(c.name),m=h.length>0,{document:n,root:t,shadow:i}=this.#t;let o=new Set,d=!1;if(i)d=!0;else switch(l){case r.SELECTOR_ID:{if(t.nodeType===r.ELEMENT_NODE)d=!0;else{const a=t.getElementById(u);if(a&&a!==e){const f=(0,E.isSameOrDescendant)(a,e);let b;f&&(b=a),b&&(m?this._matchLeaves(h,b)&&o.add(b):o.add(b))}}break}case r.SELECTOR_CLASS:{const a=[].slice.call(e.getElementsByClassName(u));if(a.length)if(m)for(const f of a)this._matchLeaves(h,f)&&o.add(f);else o=new Set(a);break}case r.SELECTOR_TYPE:{if(n.contentType==="text/html"&&!/[*|]/.test(u)){const a=[].slice.call(e.getElementsByTagName(u));if(a.length)if(m)for(const f of a)this._matchLeaves(h,f)&&o.add(f);else o=new Set(a)}else d=!0;break}case r.SELECTOR_PSEUDO_ELEMENT:{this._matchPseudoElementSelector(u);break}default:d=!0}return{nodes:o,pending:d}}_matchCombinator(s,e,c={}){const{combo:h,leaves:l}=s,{name:u}=h,{find:m,forgive:n}=c;let t=new Set;if(m===R)switch(u){case"+":{const i=e.nextElementSibling;i&&this._matchLeaves(l,i,{forgive:n})&&t.add(i);break}case"~":{let i=e.nextElementSibling;for(;i;)this._matchLeaves(l,i,{forgive:n})&&t.add(i),i=i.nextElementSibling;break}case">":{const i=[].slice.call(e.children);for(const o of i)this._matchLeaves(l,o,{forgive:n})&&t.add(o);break}case" ":default:{const{nodes:i,pending:o}=this._findDescendantNodes(l,e);if(i.size)t=i;else if(o){const{document:d}=this.#t,a=d.createNodeIterator(e,r.SHOW_ELEMENT);let f=a.nextNode();for(f===e&&(f=a.nextNode());f;)this._matchLeaves(l,f,{forgive:n})&&t.add(f),f=a.nextNode()}}}else switch(u){case"+":{const i=e.previousElementSibling;i&&this._matchLeaves(l,i,{forgive:n})&&t.add(i);break}case"~":{const i=[];let o=e.previousElementSibling;for(;o;)this._matchLeaves(l,o,{forgive:n})&&i.push(o),o=o.previousElementSibling;i.length&&(t=new Set(i.reverse()));break}case">":{const i=e.parentNode;i&&this._matchLeaves(l,i,{forgive:n})&&t.add(i);break}case" ":default:{const i=[];let o=e.parentNode;for(;o;)this._matchLeaves(l,o,{forgive:n})&&i.push(o),o=o.parentNode;i.length&&(t=new Set(i.reverse()))}}return t}_findNodes(s,e){const{leaves:[c,...h]}=s,{type:l}=c,u=(0,y.unescapeSelector)(c.name),m=h.length>0,{document:n,root:t,shadow:i}=this.#t;let o=new Set,d=!1;switch(l){case r.SELECTOR_ID:{let a;if(e===I)this._matchLeaves([c],this.#e)&&(a=this.#e);else if(e===D){let f=this.#e;for(;f;){if(this._matchLeaves([c],f)){a=f;break}f=f.parentNode}}else t.nodeType===r.ELEMENT_NODE?d=!0:a=t.getElementById(u);a&&(m?this._matchLeaves(h,a)&&o.add(a):o.add(a));break}case r.SELECTOR_CLASS:{let a=[];if(e===I)this.#e.nodeType===r.ELEMENT_NODE&&this.#e.classList.contains(u)&&a.push(this.#e);else if(e===D){let f=this.#e;for(;f&&f.nodeType===r.ELEMENT_NODE;)f.classList.contains(u)&&a.push(f),f=f.parentNode}else if(t.nodeType===r.DOCUMENT_FRAGMENT_NODE){const f=[].slice.call(t.children);for(const b of f){b.classList.contains(u)&&a.push(b);const p=[].slice.call(b.getElementsByClassName(u));a.push(...p)}}else a=[].slice.call(t.getElementsByClassName(u));if(a.length)if(m)for(const f of a)this._matchLeaves(h,f)&&o.add(f);else o=new Set(a);break}case r.SELECTOR_TYPE:{let a=[];if(e===I)this.#e.nodeType===r.ELEMENT_NODE&&this._matchLeaves([c],this.#e)&&a.push(this.#e);else if(e===D){let f=this.#e;for(;f&&f.nodeType===r.ELEMENT_NODE;)this._matchLeaves([c],f)&&a.push(f),f=f.parentNode}else if(n.contentType!=="text/html"||/[*|]/.test(u))d=!0;else if(t.nodeType===r.DOCUMENT_FRAGMENT_NODE){const f=u.toLowerCase(),b=[].slice.call(t.children);for(const p of b){p.localName===f&&a.push(p);const N=[].slice.call(p.getElementsByTagName(u));a.push(...N)}}else a=[].slice.call(t.getElementsByTagName(u));if(a.length)if(m)for(const f of a)this._matchLeaves(h,f)&&o.add(f);else o=new Set(a);break}case r.SELECTOR_PSEUDO_ELEMENT:{this._matchPseudoElementSelector(u);break}default:{const a=[];if(e!==D&&r.REG_SHADOW_HOST.test(u)){if(i&&this.#e.nodeType===r.DOCUMENT_FRAGMENT_NODE){const f=this._matchShadowHostPseudoClass(c,this.#e);f&&a.push(f)}}else if(e===I)this._matchLeaves([c],this.#e)&&a.push(this.#e);else if(e===D){let f=this.#e;for(;f;)this._matchLeaves([c],f)&&a.push(f),f=f.parentNode}else d=!0;if(a.length)if(m)for(const f of a)this._matchLeaves(h,f)&&o.add(f);else o=new Set(a)}}return{nodes:o,pending:d}}_getFirstTwig(s){const e=s.length-1,c=s[0];let h,l;if(e){const u=s[e],{leaves:[{type:m}]}=u;m===r.SELECTOR_PSEUDO_ELEMENT||m===r.SELECTOR_ID?(h=M,l=u):(h=R,l=c)}else h=M,l=c;return{find:h,twig:l}}_collectNodes(s){const e=this.#i.values();if(s===U||s===C){const c=new Set;let h=0;for(const{branch:l}of e){const{find:u,twig:m}=this._getFirstTwig(l),{nodes:n,pending:t}=this._findNodes(m,s);n.size?this.#l[h]=n:t?c.add(new Map([["index",h],["twig",m]])):this.#i[h].skip=!0,this.#i[h].find=u,h++}if(c.size){const{document:l,root:u}=this.#t,m=l.createNodeIterator(u,r.SHOW_ELEMENT);let n=m.nextNode();for(;n;){let t=!1;if(this.#e.nodeType===r.ELEMENT_NODE?t=(0,E.isSameOrDescendant)(n,this.#e):t=!0,t)for(const i of c){const{leaves:o}=i.get("twig");if(this._matchLeaves(o,n)){const a=i.get("index");this.#l[a].add(n)}}n=m.nextNode()}}}else{let c=0;for(const{branch:h}of e){const l=h[h.length-1],{nodes:u}=this._findNodes(l,s);u.size?this.#l[c]=u:this.#i[c].skip=!0,this.#i[c].find=M,c++}}return[this.#i,this.#l]}_sortNodes(s){const e=[...s];return e.length>1&&e.sort((c,h)=>{const l=c.compareDocumentPosition(h);let u;return l&r.DOCUMENT_POSITION_PRECEDING||l&r.DOCUMENT_POSITION_CONTAINS?u=1:u=-1,u}),e}_matchNodes(s){const[...e]=this.#i,c=e.length;let h=new Set;for(let l=0;l<c;l++){const{branch:u,find:m,skip:n}=e[l],t=u.length;if(!n&&t){const i=this.#l[l],o=t-1;if(o===0)if((s===U||s===C)&&this.#e.nodeType===r.ELEMENT_NODE){for(const d of i)if(d!==this.#e&&(0,E.isSameOrDescendant)(d,this.#e)&&(h.add(d),s===C))break}else if(s===C){const[d]=this._sortNodes(i);h.add(d)}else{const d=[...h],a=[...i];h=new Set([...d,...a])}else if(m===R){let{combo:d}=u[0];for(const a of i){let f=new Set([a]);for(let b=1;b<t;b++){const{combo:p,leaves:N}=u[b],k=[];for(const x of f){const L={combo:d,leaves:N},O=this._matchCombinator(L,x,{find:m});O.size&&k.push(...O)}if(k.length)if(b===o){if(s===C){const[x]=this._sortNodes(k);h.add(x)}else{const x=[...h];h=new Set([...x,...k])}break}else d=p,f=new Set(k);else break}}}else for(const d of i){let a=new Set([d]),f;for(let b=o-1;b>=0;b--){const p=u[b],N=[];for(const k of a){const x=this._matchCombinator(p,k,{find:m});x.size&&N.push(...x)}if(N.length)if(f=!0,b===0){h.add(d);break}else a=new Set(N);else{f=!1;break}}if(f&&s!==U)break}}}return h}_find(s){return this._collectNodes(s),this._matchNodes(s)}matches(){if(this.#e.nodeType!==r.ELEMENT_NODE)throw new TypeError(`Unexpected node ${this.#e.nodeName}`);let s;try{s=this._find(I).has(this.#e)}catch(e){this._onError(e)}return!!s}closest(){if(this.#e.nodeType!==r.ELEMENT_NODE)throw new TypeError(`Unexpected node ${this.#e.nodeName}`);let s;try{const e=this._find(D);let c=this.#e;for(;c;){if(e.has(c)){s=c;break}c=c.parentNode}}catch(e){this._onError(e)}return s??null}querySelector(){let s;try{const e=this._find(C);e.delete(this.#e),e.size&&([s]=this._sortNodes(e))}catch(e){this._onError(e)}return s??null}querySelectorAll(){let s;try{const e=this._find(U);e.delete(this.#e),e.size&&(s=this._sortNodes(e))}catch(e){this._onError(e)}return s??[]}}0&&(module.exports={Matcher});
//# sourceMappingURL=matcher.js.map
