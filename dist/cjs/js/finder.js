var B=Object.create;var I=Object.defineProperty;var j=Object.getOwnPropertyDescriptor;var G=Object.getOwnPropertyNames;var q=Object.getPrototypeOf,V=Object.prototype.hasOwnProperty;var X=(A,a)=>{for(var e in a)I(A,e,{get:a[e],enumerable:!0})},U=(A,a,e,r)=>{if(a&&typeof a=="object"||typeof a=="function")for(let l of G(a))!V.call(A,l)&&l!==e&&I(A,l,{get:()=>a[l],enumerable:!(r=j(a,l))||r.enumerable});return A};var z=(A,a,e)=>(e=A!=null?B(q(A)):{},U(a||!A||!A.__esModule?I(e,"default",{value:A,enumerable:!0}):e,A)),Y=A=>U(I({},"__esModule",{value:!0}),A);var Q={};X(Q,{Finder:()=>K});module.exports=Y(Q);var P=z(require("is-potential-custom-element-name"),1),F=z(require("@asamuzakjp/nwsapi"),1),C=require("./dom-util.js"),$=require("./matcher.js"),x=require("./parser.js"),b=require("./constant.js");const T="next",O="prev",M="all",L="first",R="lineal",D="self";class K{#a;#r;#c;#t;#h;#d;#p;#e;#b;#k;#f;#o;#_;#s;#u;#m;#n;#w;#i;#l;constructor(a){this.#l=a,this.#d=a.document,this.#r=new WeakMap,this.#_=new WeakMap,this.#f=(0,F.default)({document:a.document,DOMException:a.DOMException}),this.#f.configure({LOGERRORS:!1})}_onError(a){if(!this.#k)if(a instanceof DOMException||a instanceof this.#l.DOMException)if(a.name===b.NOT_SUPPORTED_ERR)this.#i&&console.warn(a.message);else throw new this.#l.DOMException(a.message,a.name);else throw a}_setup(a,e,r={}){const{event:l,noexcept:i,warn:c}=r;return this.#k=!!i,this.#i=!!c,this.#p=this._setEvent(l),this.#e=e,[this.#t,this.#s,this.#n]=(0,C.resolveContent)(e),this.#u=(0,C.isInShadowTree)(e),[this.#a,this.#b]=this._correspond(a),this.#w=new WeakMap,e}_setEvent(a){return a instanceof this.#l.MouseEvent||a instanceof this.#l.KeyboardEvent?a:null}_correspond(a){const e=[];this.#c=!1,this.#h=!1;let r;if(this.#t){const l=this.#r.get(this.#t);if(l&&l.has(`${a}`)){const i=l.get(`${a}`);this.#c=i.complex,this.#h=i.descendant,r=i.ast}}if(r){const l=r.length;for(let i=0;i<l;i++)r[i].collected=!1,r[i].dir=null,r[i].filtered=!1,r[i].find=!1,e[i]=[]}else{let l;try{l=(0,x.parseSelector)(a)}catch(f){this._onError(f)}const{branches:i,complex:c}=(0,x.walkAST)(l);let n=!1,d=0;r=[];for(const[...f]of i){const t=[];let s=f.shift();if(s&&s.type!==b.COMBINATOR){const o=new Set;for(;s;){if(s.type===b.COMBINATOR){const[p]=f;if(p.type===b.COMBINATOR){const w=`Invalid selector ${a}`;throw new DOMException(w,b.SYNTAX_ERR)}const _=s.name;/^[\s>]$/.test(_)&&(n=!0),t.push({combo:s,leaves:(0,x.sortAST)(o)}),o.clear()}else if(s){let{name:p}=s;p&&typeof p=="string"&&(p=(0,x.unescapeSelector)(p),typeof p=="string"&&p!==s.name&&(s.name=p),/[|:]/.test(p)&&(s.namespace=!0)),o.add(s)}if(f.length)s=f.shift();else{t.push({combo:null,leaves:(0,x.sortAST)(o)}),o.clear();break}}}r.push({branch:t,collected:!1,dir:null,filtered:!1,find:!1}),e[d]=[],d++}if(this.#t){let f;this.#r.has(this.#t)?f=this.#r.get(this.#t):f=new Map,f.set(`${a}`,{ast:r,complex:c,descendant:n}),this.#r.set(this.#t,f)}this.#c=c,this.#h=n}return[r,e]}_createTreeWalker(a){let e;return this.#w.has(a)?e=this.#w.get(a):(e=this.#d.createTreeWalker(a,b.WALKER_FILTER),this.#w.set(a,e)),e}_prepareQuerySelectorWalker(){return this.#o=this._createTreeWalker(this.#e),this.#m=!1,this.#o}_traverse(a,e=this.#n){let r=e.currentNode,l;if(r===a)l=r;else if(r.contains(a))for(r=e.nextNode();r;){if(r===a){l=r;break}r=e.nextNode()}else{if(r!==e.root)for(;r&&!(r===e.root||r===a);)r=e.parentNode();if(a?.nodeType===b.ELEMENT_NODE)for(;r;){if(r===a){l=r;break}r=e.nextNode()}else l=r}return l??null}_collectNthChild(a,e,r){const{a:l,b:i,reverse:c,selector:n}=a,{parentNode:d}=e,f=new Set;let t;if(n)if(this.#r.has(n))t=this.#r.get(n);else{const{branches:s}=(0,x.walkAST)(n);t=s,this.#r.set(n,t)}if(d){const s=this.#n;let o=this._traverse(d,s);o=s.firstChild();let p=0;for(;o;)p++,o=s.nextSibling();o=this._traverse(d,s);const _=new Set;if(t)for(o=s.firstChild();o;){let w;for(const k of t)if(w=this._matchLeaves(k,o,r),!w)break;w&&_.add(o),o=s.nextSibling()}if(l===0){if(i>0&&i<=p){if(_.size){o=this._traverse(d,s),c?o=s.lastChild():o=s.firstChild();let w=0;for(;o;){if(_.has(o)){if(w===i-1){f.add(o);break}w++}c?o=s.previousSibling():o=s.nextSibling()}}else if(!n){o=this._traverse(d,s),c?o=s.lastChild():o=s.firstChild();let w=0;for(;o;){if(w===i-1){f.add(o);break}c?o=s.previousSibling():o=s.nextSibling(),w++}}}}else{let w=i-1;if(l>0)for(;w<0;)w+=l;if(w>=0&&w<p){o=this._traverse(d,s),c?o=s.lastChild():o=s.firstChild();let k=0,N=l>0?0:i-1;for(;o&&(o&&w>=0&&w<p);)_.size?_.has(o)&&(N===w&&(f.add(o),w+=l),l>0?N++:N--):k===w&&(n||f.add(o),w+=l),c?o=s.previousSibling():o=s.nextSibling(),k++}}if(c&&f.size>1){const w=[...f];return new Set(w.reverse())}}else if(e===this.#s&&l+i===1)if(t){let s;for(const o of t)if(s=this._matchLeaves(o,e,r),s)break;s&&f.add(e)}else f.add(e);return f}_collectNthOfType(a,e){const{a:r,b:l,reverse:i}=a,{localName:c,parentNode:n,prefix:d}=e,f=new Set;if(n){const t=this.#n;let s=this._traverse(n,t);s=t.firstChild();let o=0;for(;s;)o++,s=t.nextSibling();if(r===0){if(l>0&&l<=o){s=this._traverse(n,t),i?s=t.lastChild():s=t.firstChild();let p=0;for(;s;){const{localName:_,prefix:w}=s;if(_===c&&w===d){if(p===l-1){f.add(s);break}p++}i?s=t.previousSibling():s=t.nextSibling()}}}else{let p=l-1;if(r>0)for(;p<0;)p+=r;if(p>=0&&p<o){s=this._traverse(n,t),i?s=t.lastChild():s=t.firstChild();let _=r>0?0:l-1;for(;s;){const{localName:w,prefix:k}=s;if(w===c&&k===d){if(_===p&&(f.add(s),p+=r),p<0||p>=o)break;r>0?_++:_--}i?s=t.previousSibling():s=t.nextSibling()}}}if(i&&f.size>1){const p=[...f];return new Set(p.reverse())}}else e===this.#s&&r+l===1&&f.add(e);return f}_matchAnPlusB(a,e,r,l){const{nth:{a:i,b:c,name:n},selector:d}=a,f=new Map;if(n?(n==="even"?(f.set("a",2),f.set("b",0)):n==="odd"&&(f.set("a",2),f.set("b",1)),r.indexOf("last")>-1&&f.set("reverse",!0)):(typeof i=="string"&&/-?\d+/.test(i)?f.set("a",i*1):f.set("a",0),typeof c=="string"&&/-?\d+/.test(c)?f.set("b",c*1):f.set("b",0),r.indexOf("last")>-1&&f.set("reverse",!0)),/^nth-(?:last-)?child$/.test(r)){d&&f.set("selector",d);const t=Object.fromEntries(f);return this._collectNthChild(t,e,l)}else if(/^nth-(?:last-)?of-type$/.test(r)){const t=Object.fromEntries(f);return this._collectNthOfType(t,e)}return new Set}_matchHasPseudoFunc(a,e,r={}){let l;if(Array.isArray(a)&&a.length){const[i]=a,{type:c}=i;let n;c===b.COMBINATOR?n=a.shift():n={name:" ",type:b.COMBINATOR};const d=[];for(;a.length;){const[s]=a,{type:o}=s;if(o===b.COMBINATOR)break;d.push(a.shift())}const f={combo:n,leaves:d};r.dir=T;const t=this._matchCombinator(f,e,r);if(t.size)if(a.length){for(const s of t)if(l=this._matchHasPseudoFunc(Object.assign([],a),s,r),l)break}else l=!0}return!!l}_matchLogicalPseudoFunc(a,e,r={}){const{astName:l="",branches:i=[],selector:c="",twigBranches:n=[]}=a;let d;if(l==="has")if(c.includes(":has("))d=null;else{let f;for(const t of i)if(f=this._matchHasPseudoFunc(Object.assign([],t),e,r),f)break;f&&(d=e)}else{const f=/^(?:is|where)$/.test(l);r.forgive=f;const t=n.length;let s;for(let o=0;o<t;o++){const p=n[o],_=p.length-1,{leaves:w}=p[_];if(s=this._matchLeaves(w,e,r),s&&_>0){let k=new Set([e]);for(let N=_-1;N>=0;N--){const g=p[N],h=[];r.dir=O;for(const m of k){const u=this._matchCombinator(g,m,r);u.size&&h.push(...u)}if(h.length)N===0?s=!0:k=new Set(h);else{s=!1;break}}}if(s)break}l==="not"?s||(d=e):s&&(d=e)}return d??null}_matchPseudoClassSelector(a,e,r={}){const{children:l,name:i}=a,{localName:c,parentNode:n}=e,{forgive:d,warn:f=this.#i}=r,t=new Set;if(b.REG_LOGICAL_PSEUDO.test(i)){let s;if(this.#r.has(a))s=this.#r.get(a);else{const{branches:p}=(0,x.walkAST)(a),_=[],w=[];for(const[...k]of p){for(const m of k){const u=(0,x.generateCSS)(m);_.push(u)}const N=[],g=new Set;let h=k.shift();for(;h;)if(h.type===b.COMBINATOR?(N.push({combo:h,leaves:[...g]}),g.clear()):h&&g.add(h),k.length)h=k.shift();else{N.push({combo:null,leaves:[...g]}),g.clear();break}w.push(N)}s={astName:i,branches:p,twigBranches:w,selector:_.join(",")},this.#r.set(a,s)}const o=this._matchLogicalPseudoFunc(s,e,r);o&&t.add(o)}else if(Array.isArray(l))if(/^nth-(?:last-)?(?:child|of-type)$/.test(i)){const[s]=l;return this._matchAnPlusB(s,e,i,r)}else switch(i){case"dir":case"lang":{const s=$.matcher.matchSelector(a,e);s&&t.add(s);break}case"current":case"nth-col":case"nth-last-col":{if(f){const s=`Unsupported pseudo-class :${i}()`;throw new DOMException(s,b.NOT_SUPPORTED_ERR)}break}case"host":case"host-context":break;default:if(!d){const s=`Unknown pseudo-class :${i}()`;throw new DOMException(s,b.SYNTAX_ERR)}}else{const s=/^a(?:rea)?$/,o=/^(?:button|fieldset|input|optgroup|option|select|textarea)$/,p=/^(?:button|form|input|select|textarea)$/,_=/^(?:details|dialog)$/,w=/^(?:checkbox|radio)$/,k=/^(?:date(?:time-local)?|month|time|week)$/,N=/(?:date(?:time-local)?|month|number|range|time|week)$/,g=/^(?:email|number|password|search|tel|text|url)$/;switch(i){case"any-link":case"link":{s.test(c)&&e.hasAttribute("href")&&t.add(e);break}case"local-link":{if(s.test(c)&&e.hasAttribute("href")){const{href:h,origin:m,pathname:u}=new URL(this.#t.URL),y=new URL(e.getAttribute("href"),h);y.origin===m&&y.pathname===u&&t.add(e)}break}case"visited":break;case"hover":{const{target:h,type:m}=this.#p??{};(m==="mouseover"||m==="pointerover")&&e.contains(h)&&t.add(e);break}case"active":{const{buttons:h,target:m,type:u}=this.#p??{};(u==="mousedown"||u==="pointerdown")&&h&b.BIT_01&&e.contains(m)&&t.add(e);break}case"target":{const{hash:h}=new URL(this.#t.URL);e.id&&h===`#${e.id}`&&this.#t.contains(e)&&t.add(e);break}case"target-within":{const{hash:h}=new URL(this.#t.URL);if(h){const m=h.replace(/^#/,"");let u=this.#t.getElementById(m);for(;u;){if(u===e){t.add(e);break}u=u.parentNode}}break}case"scope":{this.#e.nodeType===b.ELEMENT_NODE?!this.#u&&e===this.#e&&t.add(e):e===this.#t.documentElement&&t.add(e);break}case"focus":case"focus-visible":{const{target:h,type:m}=this.#p??{};if(e===this.#t.activeElement&&e.tabIndex>=0&&(i==="focus"||m==="keydown"&&e.contains(h))){let u=e,y=!0;for(;u;){if(u.disabled||u.hasAttribute("disabled")||u.hidden||u.hasAttribute("hidden")){y=!1;break}else{const{display:v,visibility:E}=this.#l.getComputedStyle(u);if(y=!(v==="none"||E==="hidden"),!y)break}if(u.parentNode&&u.parentNode.nodeType===b.ELEMENT_NODE)u=u.parentNode;else break}y&&t.add(e)}break}case"focus-within":{let h,m=this.#t.activeElement;if(m.tabIndex>=0)for(;m;){if(m===e){h=!0;break}m=m.parentNode}if(h){let u=e,y=!0;for(;u;){if(u.disabled||u.hasAttribute("disabled")||u.hidden||u.hasAttribute("hidden")){y=!1;break}else{const{display:v,visibility:E}=this.#l.getComputedStyle(u);if(y=!(v==="none"||E==="hidden"),!y)break}if(u.parentNode&&u.parentNode.nodeType===b.ELEMENT_NODE)u=u.parentNode;else break}y&&t.add(e)}break}case"open":{_.test(c)&&e.hasAttribute("open")&&t.add(e);break}case"closed":{_.test(c)&&!e.hasAttribute("open")&&t.add(e);break}case"disabled":{if(o.test(c)||(0,P.default)(c))if(e.disabled||e.hasAttribute("disabled"))t.add(e);else{let h=n;for(;h&&h.localName!=="fieldset";)h=h.parentNode;h&&n.localName!=="legend"&&h.hasAttribute("disabled")&&t.add(e)}break}case"enabled":{(o.test(c)||(0,P.default)(c))&&!(e.disabled&&e.hasAttribute("disabled"))&&t.add(e);break}case"read-only":{switch(c){case"textarea":{(e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled"))&&t.add(e);break}case"input":{(!e.type||k.test(e.type)||g.test(e.type))&&(e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled"))&&t.add(e);break}default:(0,C.isContentEditable)(e)||t.add(e)}break}case"read-write":{switch(c){case"textarea":{e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled")||t.add(e);break}case"input":{(!e.type||k.test(e.type)||g.test(e.type))&&!(e.readonly||e.hasAttribute("readonly")||e.disabled||e.hasAttribute("disabled"))&&t.add(e);break}default:(0,C.isContentEditable)(e)&&t.add(e)}break}case"placeholder-shown":{let h;c==="textarea"?h=e:c==="input"&&(e.hasAttribute("type")?g.test(e.getAttribute("type"))&&(h=e):h=e),h&&e.value===""&&e.hasAttribute("placeholder")&&e.getAttribute("placeholder").trim().length&&t.add(e);break}case"checked":{(e.checked&&c==="input"&&e.hasAttribute("type")&&w.test(e.getAttribute("type"))||e.selected&&c==="option")&&t.add(e);break}case"indeterminate":{if(e.indeterminate&&c==="input"&&e.type==="checkbox"||c==="progress"&&!e.hasAttribute("value"))t.add(e);else if(c==="input"&&e.type==="radio"&&!e.hasAttribute("checked")){const h=e.name;let m=e.parentNode;for(;m&&m.localName!=="form";)m=m.parentNode;m||(m=this.#t.documentElement);const u=m.getElementsByTagName("input"),y=u.length;let v;for(let E=0;E<y;E++){const S=u[E];if(S.getAttribute("type")==="radio"&&(h?S.getAttribute("name")===h&&(v=!!S.checked):S.hasAttribute("name")||(v=!!S.checked),v))break}v||t.add(e)}break}case"default":{const h=/^(?:button|reset)$/,m=/^(?:image|submit)$/;if(c==="button"&&!(e.hasAttribute("type")&&h.test(e.getAttribute("type")))||c==="input"&&e.hasAttribute("type")&&m.test(e.getAttribute("type"))){let u=e.parentNode;for(;u&&u.localName!=="form";)u=u.parentNode;if(u){const y=this.#n;let v=this._traverse(u,y);for(v=y.firstChild();v&&u.contains(v);){const E=v.localName;let S;if(E==="button"?S=!(v.hasAttribute("type")&&h.test(v.getAttribute("type"))):E==="input"&&(S=v.hasAttribute("type")&&m.test(v.getAttribute("type"))),S){v===e&&t.add(e);break}v=y.nextNode()}}}else if(c==="input"&&e.hasAttribute("type")&&w.test(e.getAttribute("type"))&&(e.checked||e.hasAttribute("checked")))t.add(e);else if(c==="option"){let u=n,y=!1;for(;u&&u.localName!=="datalist";){if(u.localName==="select"){(u.multiple||u.hasAttribute("multiple"))&&(y=!0);break}u=u.parentNode}if(y)(e.selected||e.hasAttribute("selected"))&&t.add(e);else{const v=new Set,E=this.#n;let S=this._traverse(n,E);for(S=E.firstChild();S;){if(S.selected||S.hasAttribute("selected")){v.add(S);break}S=E.nextSibling()}v.size&&v.has(e)&&t.add(e)}}break}case"valid":{if(p.test(c))e.checkValidity()&&t.add(e);else if(c==="fieldset"){const h=this.#n;let m=this._traverse(e,h);m=h.firstChild();let u;for(;m&&e.contains(m)&&!(p.test(m.localName)&&(u=m.checkValidity(),!u));)m=h.nextNode();u&&t.add(e)}break}case"invalid":{if(p.test(c))e.checkValidity()||t.add(e);else if(c==="fieldset"){const h=this.#n;let m=this._traverse(e,h);m=h.firstChild();let u;for(;m&&e.contains(m)&&!(p.test(m.localName)&&(u=m.checkValidity(),!u));)m=h.nextNode();u||t.add(e)}break}case"in-range":{c==="input"&&!(e.readonly||e.hasAttribute("readonly"))&&!(e.disabled||e.hasAttribute("disabled"))&&e.hasAttribute("type")&&N.test(e.getAttribute("type"))&&!(e.validity.rangeUnderflow||e.validity.rangeOverflow)&&(e.hasAttribute("min")||e.hasAttribute("max")||e.getAttribute("type")==="range")&&t.add(e);break}case"out-of-range":{c==="input"&&!(e.readonly||e.hasAttribute("readonly"))&&!(e.disabled||e.hasAttribute("disabled"))&&e.hasAttribute("type")&&N.test(e.getAttribute("type"))&&(e.validity.rangeUnderflow||e.validity.rangeOverflow)&&t.add(e);break}case"required":{let h;if(/^(?:select|textarea)$/.test(c))h=e;else if(c==="input")if(e.hasAttribute("type")){const m=e.getAttribute("type");(m==="file"||w.test(m)||k.test(m)||g.test(m))&&(h=e)}else h=e;h&&(e.required||e.hasAttribute("required"))&&t.add(e);break}case"optional":{let h;if(/^(?:select|textarea)$/.test(c))h=e;else if(c==="input")if(e.hasAttribute("type")){const m=e.getAttribute("type");(m==="file"||w.test(m)||k.test(m)||g.test(m))&&(h=e)}else h=e;h&&!(e.required||e.hasAttribute("required"))&&t.add(e);break}case"root":{e===this.#t.documentElement&&t.add(e);break}case"empty":{if(e.hasChildNodes()){const h=this.#d.createTreeWalker(e,b.SHOW_ALL);let m=h.firstChild(),u;for(;m&&(u=m.nodeType!==b.ELEMENT_NODE&&m.nodeType!==b.TEXT_NODE,!!u);)m=h.nextSibling();u&&t.add(e)}else t.add(e);break}case"first-child":{(n&&e===n.firstElementChild||e===this.#s)&&t.add(e);break}case"last-child":{(n&&e===n.lastElementChild||e===this.#s)&&t.add(e);break}case"only-child":{(n&&e===n.firstElementChild&&e===n.lastElementChild||e===this.#s)&&t.add(e);break}case"first-of-type":{if(n){const[h]=this._collectNthOfType({a:0,b:1},e);h&&t.add(h)}else e===this.#s&&t.add(e);break}case"last-of-type":{if(n){const[h]=this._collectNthOfType({a:0,b:1,reverse:!0},e);h&&t.add(h)}else e===this.#s&&t.add(e);break}case"only-of-type":{if(n){const[h]=this._collectNthOfType({a:0,b:1},e);if(h===e){const[m]=this._collectNthOfType({a:0,b:1,reverse:!0},e);m===e&&t.add(e)}}else e===this.#s&&t.add(e);break}case"defined":{const h=e.getAttribute("is");h?(0,P.default)(h)&&this.#l.customElements.get(h)&&t.add(e):(0,P.default)(c)?this.#l.customElements.get(c)&&t.add(e):(e instanceof this.#l.HTMLElement||e instanceof this.#l.SVGElement)&&t.add(e);break}case"popover-open":{if(e.popover){const{display:h}=this.#l.getComputedStyle(e);h!=="none"&&t.add(e)}break}case"host":case"host-context":break;case"after":case"before":case"first-letter":case"first-line":{if(f){const h=`Unsupported pseudo-element ::${i}`;throw new DOMException(h,b.NOT_SUPPORTED_ERR)}break}case"autofill":case"blank":case"buffering":case"current":case"fullscreen":case"future":case"modal":case"muted":case"past":case"paused":case"picture-in-picture":case"playing":case"seeking":case"stalled":case"user-invalid":case"user-valid":case"volume-locked":case"-webkit-autofill":{if(f){const h=`Unsupported pseudo-class :${i}`;throw new DOMException(h,b.NOT_SUPPORTED_ERR)}break}default:if(i.startsWith("-webkit-")){if(f){const h=`Unsupported pseudo-class :${i}`;throw new DOMException(h,b.NOT_SUPPORTED_ERR)}}else if(!d){const h=`Unknown pseudo-class :${i}`;throw new DOMException(h,b.SYNTAX_ERR)}}}return t}_matchShadowHostPseudoClass(a,e){const{children:r,name:l}=a;let i;if(Array.isArray(r)){const{branches:c}=(0,x.walkAST)(r[0]),[n]=c,[...d]=n,{host:f}=e;if(l==="host"){let t;for(const s of d){const{type:o}=s;if(o===b.COMBINATOR){const _=`Invalid selector ${(0,x.generateCSS)(a)}`;throw new DOMException(_,b.SYNTAX_ERR)}if(t=this._matchSelector(s,f).has(f),!t)break}t&&(i=e)}else if(l==="host-context"){let t=f,s;for(;t;){for(const o of d){const{type:p}=o;if(p===b.COMBINATOR){const w=`Invalid selector ${(0,x.generateCSS)(a)}`;throw new DOMException(w,b.SYNTAX_ERR)}if(s=this._matchSelector(o,t).has(t),!s)break}if(s)break;t=t.parentNode}s&&(i=e)}}else if(l==="host")i=e;else{const c=`Invalid selector :${l}`;throw new DOMException(c,b.SYNTAX_ERR)}return i??null}_matchSelector(a,e,r){const{type:l}=a,i=new Set;if(a.name===b.EMPTY)return i;const c=(0,x.unescapeSelector)(a.name);if(typeof c=="string"&&c!==a.name&&(a.name=c),e.nodeType===b.ELEMENT_NODE)switch(l){case b.SELECTOR_PSEUDO_ELEMENT:{$.matcher.matchPseudoElementSelector(c,r);break}case b.SELECTOR_ID:{e.id===c&&i.add(e);break}case b.SELECTOR_CLASS:{e.classList.contains(c)&&i.add(e);break}case b.SELECTOR_PSEUDO_CLASS:return this._matchPseudoClassSelector(a,e,r);default:{const n=$.matcher.matchSelector(a,e,r);n&&i.add(n)}}else if(this.#u&&l===b.SELECTOR_PSEUDO_CLASS&&e.nodeType===b.DOCUMENT_FRAGMENT_NODE){if(c!=="has"&&b.REG_LOGICAL_PSEUDO.test(c))return this._matchPseudoClassSelector(a,e,r);if(b.REG_SHADOW_HOST.test(c)){const n=this._matchShadowHostPseudoClass(a,e,r);n&&i.add(n)}}return i}_matchLeaves(a,e,r){const{attributes:l,localName:i,nodeType:c}=e;let n=this.#_.get(a),d;if(n&&n.has(e)){const{attr:f,matched:t}=n.get(e);l?.length===f&&(d=t)}if(typeof d!="boolean"){const f=/^(?:(?:fieldse|inpu|selec)t|button|form|textarea)$/;let t;c===b.ELEMENT_NODE&&f.test(i)?t=!1:t=!0;for(const s of a){const{name:o,type:p}=s;if(p===b.SELECTOR_PSEUDO_CLASS&&o==="dir"&&(t=!1),d=this._matchSelector(s,e,r).has(e),!d)break}t&&(n||(n=new WeakMap),n.set(e,{attr:l?.length,matched:d}),this.#_.set(a,n))}return!!d}_matchHTMLCollection(a,e={}){const{compound:r,filterLeaves:l}=e,i=new Set,c=a.length;if(c)if(r)for(let n=0;n<c;n++){const d=a[n];this._matchLeaves(l,d,e)&&i.add(d)}else{const n=[].slice.call(a);return new Set(n)}return i}_findDescendantNodes(a,e,r){const[l,...i]=a,c=i.length>0,{type:n}=l,d=(0,x.unescapeSelector)(l.name);typeof d=="string"&&d!==l.name&&(l.name=d);let f=new Set,t=!1;if(this.#u)t=!0;else switch(n){case b.SELECTOR_PSEUDO_ELEMENT:{$.matcher.matchPseudoElementSelector(d,r);break}case b.SELECTOR_ID:{if(this.#s.nodeType===b.ELEMENT_NODE)t=!0;else{const s=this.#s.getElementById(d);s&&s!==e&&e.contains(s)&&(c?this._matchLeaves(i,s,r)&&f.add(s):f.add(s))}break}case b.SELECTOR_CLASS:{const s=e.getElementsByClassName(d);f=this._matchHTMLCollection(s,{compound:c,filterLeaves:i});break}case b.SELECTOR_TYPE:{if(this.#t.contentType==="text/html"&&!/[*|]/.test(d)){const s=e.getElementsByTagName(d);f=this._matchHTMLCollection(s,{compound:c,filterLeaves:i})}else t=!0;break}default:t=!0}return{nodes:f,pending:t}}_matchCombinator(a,e,r={}){const{combo:l,leaves:i}=a,{name:c}=l,{parentNode:n}=e,{dir:d}=r,f=new Set;if(d===T)switch(c){case"+":{const t=e.nextElementSibling;t&&this._matchLeaves(i,t,r)&&f.add(t);break}case"~":{if(n){const t=this._createTreeWalker(n);let s=this._traverse(e,t);for(s=t.nextSibling();s;)this._matchLeaves(i,s,r)&&f.add(s),s=t.nextSibling()}break}case">":{const t=this._createTreeWalker(e);let s=this._traverse(e,t);for(s=t.firstChild();s;)this._matchLeaves(i,s,r)&&f.add(s),s=t.nextSibling();break}case" ":default:{const{nodes:t,pending:s}=this._findDescendantNodes(i,e);if(t.size)return t;if(s){const o=this._createTreeWalker(e);let p=this._traverse(e,o);for(p=o.nextNode();p&&e.contains(p);)this._matchLeaves(i,p,r)&&f.add(p),p=o.nextNode()}}}else switch(c){case"+":{const t=e.previousElementSibling;t&&this._matchLeaves(i,t,r)&&f.add(t);break}case"~":{if(n){const t=this._createTreeWalker(n);let s=this._traverse(n,t);for(s=t.firstChild();s&&s!==e;)this._matchLeaves(i,s,r)&&f.add(s),s=t.nextSibling()}break}case">":{n&&this._matchLeaves(i,n,r)&&f.add(n);break}case" ":default:{const t=[];let s=n;for(;s;)this._matchLeaves(i,s,r)&&t.push(s),s=s.parentNode;if(t.length)return new Set(t.reverse())}}return f}_findNode(a,e){const{node:r}=e;let l=this._traverse(r,this.#o),i;if(l)for(l.nodeType!==b.ELEMENT_NODE?l=this.#o.nextNode():l===r&&l!==this.#s&&(l=this.#o.nextNode());l;){if(this._matchLeaves(a,l,{warn:this.#i})){i=l;break}l=this.#o.nextNode()}return i??null}_matchSelf(a){const e=[],r=this._matchLeaves(a,this.#e,{warn:this.#i});let l=!1;return r&&(e.push(this.#e),l=!0),[e,l]}_findLineal(a,e={}){const{complex:r}=e,l=[];let i=this._matchLeaves(a,this.#e,{warn:this.#i}),c=!1;if(i&&(l.push(this.#e),c=!0),!i||r){let n=this.#e.parentNode;for(;n&&(i=this._matchLeaves(a,n,{warn:this.#i}),i&&(l.push(n),c=!0),n.parentNode);)n=n.parentNode}return[l,c]}_findFirst(a){const e=[],r=this._findNode(a,{node:this.#e});let l=!1;return r&&(e.push(r),l=!0),[e,l]}_findFromHTMLCollection(a,e={}){const{complex:r,compound:l,filterLeaves:i,targetType:c}=e;let n=[],d=!1,f=!1;const t=a.length;if(t)if(this.#e.nodeType===b.ELEMENT_NODE)for(let s=0;s<t;s++){const o=a[s];if(o!==this.#e&&(this.#e.contains(o)||o.contains(this.#e))){if(l){if(this._matchLeaves(i,o,{warn:this.#i})&&(n.push(o),d=!0,c===L))break}else if(n.push(o),d=!0,c===L)break}}else if(r)if(l)for(let s=0;s<t;s++){const o=a[s];if(this._matchLeaves(i,o,{warn:this.#i})&&(n.push(o),d=!0,c===L))break}else n=[].slice.call(a),d=!0,f=!0;else if(l)for(let s=0;s<t;s++){const o=a[s];if(this._matchLeaves(i,o,{warn:this.#i})&&(n.push(o),d=!0,c===L))break}else n=[].slice.call(a),d=!0,f=!0;return[n,d,f]}_findEntryNodes(a,e,r){const{leaves:l}=a,[i,...c]=l,n=c.length>0,{name:d,type:f}=i;let t=[],s=!1,o=!1,p=!1;switch(f){case b.SELECTOR_PSEUDO_ELEMENT:{$.matcher.matchPseudoElementSelector(d,{warn:this.#i});break}case b.SELECTOR_ID:{if(e===D)[t,o]=this._matchSelf(l);else if(e===R)[t,o]=this._findLineal(l,{complex:r});else if(e===L&&this.#s.nodeType!==b.ELEMENT_NODE){const _=this.#s.getElementById(d);_&&(n?this._matchLeaves(c,_,{warn:this.#i})&&(t.push(_),o=!0):(t.push(_),o=!0))}else e===L?[t,o]=this._findFirst(l):p=!0;break}case b.SELECTOR_CLASS:{if(e===D)[t,o]=this._matchSelf(l);else if(e===R)[t,o]=this._findLineal(l,{complex:r});else if(this.#s.nodeType===b.DOCUMENT_NODE){const _=this.#s.getElementsByClassName(d);_.length&&([t,o,s]=this._findFromHTMLCollection(_,{complex:r,compound:n,filterLeaves:c,targetType:e}))}else e===L?[t,o]=this._findFirst(l):p=!0;break}case b.SELECTOR_TYPE:{if(e===D)[t,o]=this._matchSelf(l);else if(e===R)[t,o]=this._findLineal(l,{complex:r});else if(this.#t.contentType==="text/html"&&this.#s.nodeType===b.DOCUMENT_NODE&&!/[*|]/.test(d)){const _=this.#s.getElementsByTagName(d);_.length&&([t,o,s]=this._findFromHTMLCollection(_,{complex:r,compound:n,filterLeaves:c,targetType:e}))}else e===L?[t,o]=this._findFirst(l):p=!0;break}default:if(e!==R&&b.REG_SHADOW_HOST.test(d)){if(this.#u&&this.#e.nodeType===b.DOCUMENT_FRAGMENT_NODE){const _=this._matchShadowHostPseudoClass(i,this.#e);_&&(t.push(_),o=!0)}}else e===D?[t,o]=this._matchSelf(l):e===R?[t,o]=this._findLineal(l,{complex:r}):e===L?[t,o]=this._findFirst(l):p=!0}return{collected:s,compound:n,filtered:o,nodes:t,pending:p}}_collectNodes(a){const e=this.#a.values();if(a===M||a===L){const r=new Set;let l=0;for(const{branch:i}of e){const c=i.length,n=c>1,d=i[0];let f,t;if(n){const{combo:k,leaves:[{name:N,type:g}]}=d,h=i[c-1],{leaves:[{name:m,type:u}]}=h;if(u===b.SELECTOR_PSEUDO_ELEMENT||u===b.SELECTOR_ID)f=O,t=h;else if(g===b.SELECTOR_PSEUDO_ELEMENT||g===b.SELECTOR_ID)f=T,t=d;else if(a===M)if(N==="*"&&g===b.SELECTOR_TYPE)f=O,t=h;else if(m==="*"&&u===b.SELECTOR_TYPE)f=T,t=d;else if(c===2){const{name:y}=k;/^[+~]$/.test(y)?(f=O,t=h):(f=T,t=d)}else f=T,t=d;else if(m==="*"&&u===b.SELECTOR_TYPE)f=T,t=d;else if(N==="*"&&g===b.SELECTOR_TYPE)f=O,t=h;else{let y;for(const{combo:v,leaves:[E]}of i){const{name:S,type:W}=E;if(W===b.SELECTOR_PSEUDO_CLASS&&S==="dir"){y=!1;break}if(!y&&v){const{name:H}=v;/^[+~]$/.test(H)&&(y=!0)}}y?(f=T,t=d):(f=O,t=h)}}else f=O,t=d;const{collected:s,compound:o,filtered:p,nodes:_,pending:w}=this._findEntryNodes(t,a,n);_.length?(this.#a[l].find=!0,this.#b[l]=_):w&&r.add(new Map([["index",l],["twig",t]])),this.#a[l].collected=s,this.#a[l].dir=f,this.#a[l].filtered=p||!o,l++}if(r.size){let i,c;this.#e!==this.#s&&this.#e.nodeType===b.ELEMENT_NODE?(i=this.#e,c=this.#o):(i=this.#s,c=this.#n);let n=this._traverse(i,c);for(;n;){let d=!1;if(this.#e.nodeType===b.ELEMENT_NODE?n===this.#e?d=!0:d=this.#e.contains(n):d=!0,d)for(const f of r){const{leaves:t}=f.get("twig");if(this._matchLeaves(t,n,{warn:this.#i})){const o=f.get("index");this.#a[o].filtered=!0,this.#a[o].find=!0,this.#b[o].push(n)}}n!==c.currentNode&&(n=this._traverse(n,c)),n=c.nextNode()}}}else{let r=0;for(const{branch:l}of e){const i=l[l.length-1],c=l.length>1,{compound:n,filtered:d,nodes:f}=this._findEntryNodes(i,a,c);f.length&&(this.#a[r].find=!0,this.#b[r]=f),this.#a[r].dir=O,this.#a[r].filtered=d||!n,r++}}return[this.#a,this.#b]}_getCombinedNodes(a,e,r){const l=[];for(const i of e){const c=this._matchCombinator(a,i,{dir:r,warn:this.#i});c.size&&l.push(...c)}return l.length?new Set(l):new Set}_matchNodeNext(a,e,r){const{combo:l,index:i}=r,{combo:c,leaves:n}=a[i],d={combo:l,leaves:n},f=this._getCombinedNodes(d,e,T);let t;if(f.size)if(i===a.length-1){const[s]=(0,C.sortNodes)(f);t=s}else t=this._matchNodeNext(a,f,{combo:c,index:i+1});return t??null}_matchNodePrev(a,e,r){const{index:l}=r,i=a[l],c=new Set([e]),n=this._getCombinedNodes(i,c,O);let d;if(n.size){if(l===0)d=e;else for(const f of n)if(this._matchNodePrev(a,f,{index:l-1}))return e}return d??null}_find(a){(a===M||a===L)&&this._prepareQuerySelectorWalker();const[[...e],r]=this._collectNodes(a),l=e.length;let i=new Set;for(let c=0;c<l;c++){const{branch:n,collected:d,dir:f,find:t}=e[c],s=n.length;if(s&&t){const o=r[c],p=o.length,_=s-1;if(_===0)if((a===M||a===L)&&this.#e.nodeType===b.ELEMENT_NODE)for(let w=0;w<p;w++){const k=o[w];if(k!==this.#e&&this.#e.contains(k)&&(i.add(k),a!==M))break}else if(a===M)if(i.size){const w=[...i];i=new Set([...w,...o]),this.#m=!0}else i=new Set(o);else{const[w]=o;i.add(w)}else if(a===M)if(f===T){let{combo:w}=n[0];for(const k of o){let N=new Set([k]);for(let g=1;g<s;g++){const{combo:h,leaves:m}=n[g],u={combo:w,leaves:m};if(N=this._getCombinedNodes(u,N,f),N.size)if(g===_)if(i.size){const y=[...i];i=new Set([...y,...N]),this.#m=!0}else i=N;else w=h;else break}}}else for(const w of o){let k=new Set([w]);for(let N=_-1;N>=0;N--){const g=n[N];if(k=this._getCombinedNodes(g,k,f),k.size)N===0&&(i.add(w),s>1&&i.size>1&&(this.#m=!0));else break}}else if(a===L&&f===T){const{combo:w}=n[0];let k;for(const N of o)if(k=this._matchNodeNext(n,new Set([N]),{combo:w,index:1}),k){i.add(k);break}if(!k&&!d){const{leaves:N}=n[0],[g]=o;let h=this._findNode(N,{node:g});for(;h;){if(k=this._matchNodeNext(n,new Set([h]),{combo:w,index:1}),k){i.add(k);break}h=this._findNode(N,{node:h})}}}else{let w;for(const k of o)if(w=this._matchNodePrev(n,k,{index:_-1}),w){i.add(k);break}if(!w&&!d&&a===L){const{leaves:k}=n[_],[N]=o;let g=this._findNode(k,{node:N});for(;g;){if(w=this._matchNodePrev(n,g,{index:_-1}),w){i.add(g);break}g=this._findNode(k,{node:g})}}}}}return i}matches(a,e,r){let l;try{if(e?.nodeType!==b.ELEMENT_NODE){const i=`Unexpected node ${e?.nodeName}`;throw new TypeError(i)}(0,x.filterSelector)(a,{complex:this.#c,descendant:!0})?l=this.#f.match(a,e):(this._setup(a,e,r),l=this._find(D).size)}catch(i){this._onError(i)}return!!l}closest(a,e,r){let l;try{if(e?.nodeType!==b.ELEMENT_NODE){const i=`Unexpected node ${e?.nodeName}`;throw new TypeError(i)}if((0,x.filterSelector)(a,{complex:this.#c,descendant:!0}))l=this.#f.closest(a,e);else{this._setup(a,e,r);const i=this._find(R);if(i.size){let c=this.#e;for(;c;){if(i.has(c)){l=c;break}c=c.parentNode}}}}catch(i){this._onError(i)}return l??null}querySelector(a,e,r){let l;try{if(this._setup(a,e,r),this.#d===this.#t&&!this.#h&&(0,x.filterSelector)(a,{complex:this.#c,descendant:!1}))l=this.#f.first(a,e);else{const i=this._find(L);i.delete(this.#e),i.size&&([l]=(0,C.sortNodes)(i))}}catch(i){this._onError(i)}return l??null}querySelectorAll(a,e,r){let l;try{if(this._setup(a,e,r),this.#d===this.#t&&!this.#h&&(0,x.filterSelector)(a,{complex:this.#c,descendant:!1}))l=this.#f.select(a,e);else{const i=this._find(M);i.delete(this.#e),i.size&&(this.#m?l=(0,C.sortNodes)(i):l=[...i])}}catch(i){this._onError(i)}return l??[]}}0&&(module.exports={Finder});
//# sourceMappingURL=finder.js.map
