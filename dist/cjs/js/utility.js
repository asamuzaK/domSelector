var C=Object.create;var c=Object.defineProperty;var D=Object.getOwnPropertyDescriptor;var U=Object.getOwnPropertyNames;var _=Object.getPrototypeOf,I=Object.prototype.hasOwnProperty;var $=(e,t)=>{for(var i in t)c(e,i,{get:t[i],enumerable:!0})},w=(e,t,i,r)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of U(t))!I.call(e,n)&&n!==i&&c(e,n,{get:()=>t[n],enumerable:!(r=D(t,n))||r.enumerable});return e};var y=(e,t,i)=>(i=e!=null?C(_(e)):{},w(t||!e||!e.__esModule?c(i,"default",{value:e,enumerable:!0}):i,e)),k=e=>w(c({},"__esModule",{value:!0}),e);var H={};$(H,{filterSelector:()=>j,getDirectionality:()=>b,getNamespaceURI:()=>g,getSlottedTextContent:()=>p,getType:()=>u,initNwsapi:()=>X,isContentEditable:()=>m,isCustomElement:()=>S,isFocusVisible:()=>G,isFocusable:()=>F,isFocusableArea:()=>V,isNamespaceDeclared:()=>K,isPreceding:()=>O,isVisible:()=>v,resolveContent:()=>M,sortNodes:()=>Y,traverseNode:()=>P});module.exports=k(H);var E=y(require("@asamuzakjp/nwsapi"),1),h=y(require("bidi-js"),1),d=y(require("is-potential-custom-element-name"),1),s=require("./constant.js");const A=new RegExp(`:(?!${s.PSEUDO_CLASS}|${s.N_TH}|${s.LOGICAL_COMPLEX})`),L=new RegExp(`:(?!${s.PSEUDO_CLASS}|${s.N_TH}|${s.LOGICAL_COMPOUND})`),R=new RegExp(`:(?!${s.PSEUDO_CLASS}|${s.N_TH})`),u=e=>Object.prototype.toString.call(e).slice(s.TYPE_FROM,s.TYPE_TO),M=e=>{if(!e?.nodeType)throw new TypeError(`Unexpected type ${u(e)}`);let t,i,r;switch(e.nodeType){case s.DOCUMENT_NODE:{t=e,i=e;break}case s.DOCUMENT_FRAGMENT_NODE:{const{host:n,mode:l,ownerDocument:a}=e;t=a,i=e,r=n&&(l==="close"||l==="open");break}case s.ELEMENT_NODE:{t=e.ownerDocument;let n=e;for(;n;){const{host:l,mode:a,nodeType:o,parentNode:f}=n;if(o===s.DOCUMENT_FRAGMENT_NODE){r=l&&(a==="close"||a==="open");break}else if(f)n=f;else break}i=n;break}default:throw new TypeError(`Unexpected node ${e.nodeName}`)}return[t,i,!!r]},P=(e,t,i=!1)=>{if(!e?.nodeType)throw new TypeError(`Unexpected type ${u(e)}`);if(!t)return null;let r=t.currentNode;if(r===e)return r;if(i||r.contains(e)){for(r=t.nextNode();r&&r!==e;)r=t.nextNode();return r}else{if(r!==t.root){let n;for(;r;){if(r===e){n=!0;break}else if(r===t.root||r.contains(e))break;r=t.parentNode()}if(n)return r}if(e.nodeType===s.ELEMENT_NODE){let n;for(;r;){if(r===e){n=!0;break}r=t.nextNode()}if(n)return r}}return null},S=(e,t={})=>{if(!e?.nodeType)throw new TypeError(`Unexpected type ${u(e)}`);if(e.nodeType!==s.ELEMENT_NODE)return!1;const{localName:i,ownerDocument:r}=e,{formAssociated:n}=t,l=r.defaultView;let a;const o=e.getAttribute("is");return o?a=(0,d.default)(o)&&l.customElements.get(o):a=(0,d.default)(i)&&l.customElements.get(i),a?n?!!a.formAssociated:!0:!1},p=e=>{if(!e?.nodeType)throw new TypeError(`Unexpected type ${u(e)}`);if(typeof e.assignedNodes!="function")return null;const t=e.assignedNodes();if(t.length){let i;for(const r of t)if(i=r.textContent.trim(),i)break;return i}return e.textContent.trim()},b=e=>{if(!e?.nodeType)throw new TypeError(`Unexpected type ${u(e)}`);if(e.nodeType!==s.ELEMENT_NODE)return null;const{dir:t,localName:i,parentNode:r}=e,{getEmbeddingLevels:n}=(0,h.default)();if(t==="ltr"||t==="rtl")return t;if(t==="auto"){let l;switch(i){case"input":{const a=[...s.KEY_INPUT_BUTTON,...s.KEY_INPUT_TEXT,"hidden"];if(!e.type||a.includes(e.type))l=e.value;else if(["checkbox","color","date","image","number","range","radio","time"].includes(e.type))return"ltr";break}case"slot":{l=p(e);break}case"textarea":{l=e.value;break}default:{const a=[].slice.call(e.childNodes);for(const o of a){const{dir:f,localName:T,nodeType:N,textContent:x}=o;if(N===s.TEXT_NODE?l=x.trim():N===s.ELEMENT_NODE&&!["bdi","script","style","textarea"].includes(T)&&(!f||f!=="ltr"&&f!=="rtl")&&(T==="slot"?l=p(o):l=x.trim()),l)break}}}if(l){const{paragraphs:[{level:a}]}=n(l);if(a%2===1)return"rtl"}else if(r){const{nodeType:a}=r;if(a===s.ELEMENT_NODE)return b(r)}}else{if(i==="input"&&e.type==="tel")return"ltr";if(i==="bdi"){const l=e.textContent.trim();if(l){const{paragraphs:[{level:a}]}=n(l);if(a%2===1)return"rtl"}}else if(r){if(i==="slot"){const a=p(e);if(a){const{paragraphs:[{level:o}]}=n(a);return o%2===1?"rtl":"ltr"}}const{nodeType:l}=r;if(l===s.ELEMENT_NODE)return b(r)}}return"ltr"},m=e=>{if(!e?.nodeType)throw new TypeError(`Unexpected type ${u(e)}`);if(e.nodeType!==s.ELEMENT_NODE)return!1;if(typeof e.isContentEditable=="boolean")return e.isContentEditable;if(e.ownerDocument.designMode==="on")return!0;{let t;switch(e.hasAttribute("contenteditable")?t=e.getAttribute("contenteditable"):t="inherit",t){case"":case"true":return!0;case"plaintext-only":return!0;case"false":return!1;default:return e?.parentNode?.nodeType===s.ELEMENT_NODE?m(e.parentNode):!1}}},v=e=>{if(e?.nodeType!==s.ELEMENT_NODE)return!1;const t=e.ownerDocument.defaultView,{display:i,visibility:r}=t.getComputedStyle(e);return i!=="none"&&r==="visible"},G=e=>{if(e?.nodeType!==s.ELEMENT_NODE)return!1;const{localName:t,type:i}=e;switch(t){case"input":return!!(!i||s.KEY_INPUT_EDIT.includes(i));case"textarea":return!0;default:return m(e)}},V=e=>{if(e?.nodeType!==s.ELEMENT_NODE||!e.isConnected)return!1;const t=e.ownerDocument.defaultView;if(e instanceof t.HTMLElement){if(Number.isInteger(parseInt(e.getAttribute("tabindex")))||m(e))return!0;const{localName:i,parentNode:r}=e;switch(i){case"a":return!!(e.href||e.hasAttribute("href"));case"iframe":return!0;case"input":return!(e.disabled||e.hasAttribute("disabled")||e.hidden||e.hasAttribute("hidden"));case"summary":{if(r.localName==="details"){let n=r.firstElementChild,l=!1;for(;n;){if(n.localName==="summary"){l=n===e;break}n=n.nextElementSibling}return l}return!1}default:if(["button","select","textarea"].includes(i)&&!(e.disabled||e.hasAttribute("disabled")))return!0}}else if(e instanceof t.SVGElement){if(Number.isInteger(parseInt(e.getAttributeNS(null,"tabindex")))){const i=["clipPath","defs","desc","linearGradient","marker","mask","metadata","pattern","radialGradient","script","style","symbol","title"],r="http://www.w3.org/2000/svg";let n,l=e;for(;l.namespaceURI===r&&(n=i.includes(l.localName),!n);)if(l?.parentNode?.namespaceURI===r)l=l.parentNode;else break;return!n}if(e.localName==="a"&&(e.href||e.hasAttributeNS(null,"href")))return!0}return!1},F=e=>{if(e?.nodeType!==s.ELEMENT_NODE)return!1;const t=e.ownerDocument.defaultView;let i=e,r=!0;for(;i;){if(i.disabled||i.hasAttribute("disabled")){r=!1;break}(i.hidden||i.hasAttribute("hidden"))&&(r=!1);const{contentVisibility:n,display:l,visibility:a}=t.getComputedStyle(i);if(l==="none"||a!=="visible"||n==="hidden"&&i!==e?r=!1:r=!0,r&&i?.parentNode?.nodeType===s.ELEMENT_NODE)i=i.parentNode;else break}return r},g=(e,t)=>{if(typeof e!="string")throw new TypeError(`Unexpected type ${u(e)}`);if(!t?.nodeType)throw new TypeError(`Unexpected type ${u(t)}`);if(!e||t.nodeType!==s.ELEMENT_NODE)return null;const{attributes:i}=t;let r;for(const n of i){const{name:l,namespaceURI:a,prefix:o,value:f}=n;if(l===`xmlns:${e}`?r=f:o===e&&(r=a),r)break}return r??null},K=(e="",t={})=>{if(!e||typeof e!="string"||t?.nodeType!==s.ELEMENT_NODE)return!1;if(t.lookupNamespaceURI(e))return!0;const i=t.ownerDocument.documentElement;let r=t,n;for(;r&&(n=g(e,r),!(n||r===i));)r=r.parentNode;return!!n},O=(e,t)=>{if(e?.nodeType){if(!t?.nodeType)throw new TypeError(`Unexpected type ${u(t)}`)}else throw new TypeError(`Unexpected type ${u(e)}`);if(e.nodeType!==s.ELEMENT_NODE||t.nodeType!==s.ELEMENT_NODE)return!1;const i=t.compareDocumentPosition(e);return!!(i&s.DOCUMENT_POSITION_PRECEDING||i&s.DOCUMENT_POSITION_CONTAINS)},Y=(e=[])=>{const t=[...e];return t.length>1&&t.sort((i,r)=>{let n;return O(r,i)?n=1:n=-1,n}),t},X=(e,t)=>{if(!e?.DOMException)throw new TypeError(`Unexpected global object ${u(e)}`);t?.nodeType!==s.DOCUMENT_NODE&&(t=e.document);const i=(0,E.default)({document:t,DOMException:e.DOMException});return i.configure({LOGERRORS:!1}),i},j=(e,t={})=>{if(!e||typeof e!="string")return!1;const{complex:i,compound:r,descend:n,simple:l}=t;if(l||r)return!1;if(e.includes("[")){const a=e.lastIndexOf("[");if(e.substring(a).indexOf("]")<0)return!1}return/[|\\]|::|[^\u0021-\u007F\s]|\[\s*[\w$*=^|~-]+(?:(?:"[\w$*=^|~\s'-]+"|'[\w$*=^|~\s"-]+')?(?:\s+[\w$*=^|~-]+)+|"[^"\]]{1,255}|'[^'\]]{1,255})\s*\]|:(?:is|where)\(\s*\)/.test(e)?!1:e.includes(":")?n?!1:/:(?:is|not)\(/.test(e)?i?!A.test(e):!L.test(e):!R.test(e):!0};0&&(module.exports={filterSelector,getDirectionality,getNamespaceURI,getSlottedTextContent,getType,initNwsapi,isContentEditable,isCustomElement,isFocusVisible,isFocusable,isFocusableArea,isNamespaceDeclared,isPreceding,isVisible,resolveContent,sortNodes,traverseNode});
//# sourceMappingURL=utility.js.map
