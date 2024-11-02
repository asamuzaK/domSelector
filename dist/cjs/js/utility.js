var C=Object.create;var p=Object.defineProperty;var D=Object.getOwnPropertyDescriptor;var U=Object.getOwnPropertyNames;var _=Object.getPrototypeOf,I=Object.prototype.hasOwnProperty;var k=(e,r)=>{for(var t in r)p(e,t,{get:r[t],enumerable:!0})},E=(e,r,t,i)=>{if(r&&typeof r=="object"||typeof r=="function")for(let l of U(r))!I.call(e,l)&&l!==t&&p(e,l,{get:()=>r[l],enumerable:!(i=D(r,l))||i.enumerable});return e};var d=(e,r,t)=>(t=e!=null?C(_(e)):{},E(r||!e||!e.__esModule?p(t,"default",{value:e,enumerable:!0}):t,e)),$=e=>E(p({},"__esModule",{value:!0}),e);var j={};k(j,{filterSelector:()=>W,getDirectionality:()=>T,getNamespaceURI:()=>g,getSlottedTextContent:()=>y,getType:()=>u,initNwsapi:()=>X,isContentEditable:()=>m,isCustomElement:()=>S,isFocusVisible:()=>G,isFocusable:()=>V,isFocusableArea:()=>F,isNamespaceDeclared:()=>K,isPreceding:()=>O,isVisible:()=>v,resolveContent:()=>M,sortNodes:()=>Y,traverseNode:()=>P});module.exports=$(j);var w=d(require("@asamuzakjp/nwsapi"),1),h=d(require("bidi-js"),1),b=d(require("is-potential-custom-element-name"),1),s=require("./constant.js");const A=new RegExp(`:(?!${s.PSEUDO_CLASS}|${s.N_TH}|${s.LOGICAL_COMPLEX})`),L=new RegExp(`:(?!${s.PSEUDO_CLASS}|${s.N_TH}|${s.LOGICAL_COMPOUND})`),R=new RegExp(`:(?!${s.PSEUDO_CLASS}|${s.N_TH})`),u=e=>Object.prototype.toString.call(e).slice(s.TYPE_FROM,s.TYPE_TO),M=e=>{if(!e?.nodeType)throw new TypeError(`Unexpected type ${u(e)}`);let r,t,i;switch(e.nodeType){case s.DOCUMENT_NODE:{r=e,t=e;break}case s.DOCUMENT_FRAGMENT_NODE:{const{host:n,mode:a,ownerDocument:o}=e;r=o,t=e,i=n&&(a==="close"||a==="open");break}case s.ELEMENT_NODE:{r=e.ownerDocument;let n=e;for(;n;){const{host:a,mode:o,nodeType:f,parentNode:c}=n;if(f===s.DOCUMENT_FRAGMENT_NODE){i=a&&(o==="close"||o==="open");break}else if(c)n=c;else break}t=n;break}default:throw new TypeError(`Unexpected node ${e.nodeName}`)}const l=r.createTreeWalker(t,s.WALKER_FILTER);return[r,t,l,!!i]},P=(e,r)=>{if(!e?.nodeType)throw new TypeError(`Unexpected type ${u(e)}`);if(!r)return null;let t=r.currentNode;if(t===e)return t;if(t.contains(e)){for(t=r.nextNode();t&&t!==e;)t=r.nextNode();return t}else{if(t!==r.root){let i;for(;t;){if(t===e){i=!0;break}else if(t===r.root)break;t=r.parentNode()}if(i)return t}if(e.nodeType===s.ELEMENT_NODE){let i;for(;t;){if(t===e){i=!0;break}t=r.nextNode()}if(i)return t}}return null},S=(e,r={})=>{if(!e?.nodeType)throw new TypeError(`Unexpected type ${u(e)}`);if(e.nodeType!==s.ELEMENT_NODE)return!1;const{localName:t,ownerDocument:i}=e,{formAssociated:l}=r,n=i.defaultView;let a;const o=e.getAttribute("is");return o?a=(0,b.default)(o)&&n.customElements.get(o):a=(0,b.default)(t)&&n.customElements.get(t),a?l?!!a.formAssociated:!0:!1},y=e=>{if(!e?.nodeType)throw new TypeError(`Unexpected type ${u(e)}`);if(typeof e.assignedNodes!="function")return null;const r=e.assignedNodes();if(r.length){let t;for(const i of r)if(t=i.textContent.trim(),t)break;return t}return e.textContent.trim()},T=e=>{if(!e?.nodeType)throw new TypeError(`Unexpected type ${u(e)}`);if(e.nodeType!==s.ELEMENT_NODE)return null;const{dir:r,localName:t,parentNode:i}=e,{getEmbeddingLevels:l}=(0,h.default)();if(r==="ltr"||r==="rtl")return r;if(r==="auto"){let n;switch(t){case"input":{const a=[...s.KEY_INPUT_BUTTON,...s.KEY_INPUT_TEXT,"hidden"];if(!e.type||a.includes(e.type))n=e.value;else if(["checkbox","color","date","image","number","range","radio","time"].includes(e.type))return"ltr";break}case"slot":{n=y(e);break}case"textarea":{n=e.value;break}default:{const a=[].slice.call(e.childNodes);for(const o of a){const{dir:f,localName:c,nodeType:N,textContent:x}=o;if(N===s.TEXT_NODE?n=x.trim():N===s.ELEMENT_NODE&&!["bdi","script","style","textarea"].includes(c)&&(!f||f!=="ltr"&&f!=="rtl")&&(c==="slot"?n=y(o):n=x.trim()),n)break}}}if(n){const{paragraphs:[{level:a}]}=l(n);if(a%2===1)return"rtl"}else if(i){const{nodeType:a}=i;if(a===s.ELEMENT_NODE)return T(i)}}else{if(t==="input"&&e.type==="tel")return"ltr";if(t==="bdi"){const n=e.textContent.trim();if(n){const{paragraphs:[{level:a}]}=l(n);if(a%2===1)return"rtl"}}else if(i){if(t==="slot"){const a=y(e);if(a){const{paragraphs:[{level:o}]}=l(a);return o%2===1?"rtl":"ltr"}}const{nodeType:n}=i;if(n===s.ELEMENT_NODE)return T(i)}}return"ltr"},m=e=>{if(!e?.nodeType)throw new TypeError(`Unexpected type ${u(e)}`);if(e.nodeType!==s.ELEMENT_NODE)return!1;if(typeof e.isContentEditable=="boolean")return e.isContentEditable;if(e.ownerDocument.designMode==="on")return!0;{let r;switch(e.hasAttribute("contenteditable")?r=e.getAttribute("contenteditable"):r="inherit",r){case"":case"true":return!0;case"plaintext-only":return!0;case"false":return!1;default:return e?.parentNode?.nodeType===s.ELEMENT_NODE?m(e.parentNode):!1}}},v=e=>{if(e?.nodeType!==s.ELEMENT_NODE)return!1;const r=e.ownerDocument.defaultView,{display:t,visibility:i}=r.getComputedStyle(e);return t!=="none"&&i==="visible"},G=e=>{if(e?.nodeType!==s.ELEMENT_NODE)return!1;const{localName:r,type:t}=e;switch(r){case"input":return!!(!t||s.KEY_INPUT_EDIT.includes(t));case"textarea":return!0;default:return m(e)}},F=e=>{if(e?.nodeType!==s.ELEMENT_NODE||!e.isConnected)return!1;const r=e.ownerDocument.defaultView;if(e instanceof r.HTMLElement){if(Number.isInteger(parseInt(e.getAttribute("tabindex")))||m(e))return!0;const{localName:t,parentNode:i}=e;switch(t){case"a":return!!(e.href||e.hasAttribute("href"));case"iframe":return!0;case"input":return!(e.disabled||e.hasAttribute("disabled")||e.hidden||e.hasAttribute("hidden"));case"summary":{if(i.localName==="details"){let l=i.firstElementChild,n=!1;for(;l;){if(l.localName==="summary"){n=l===e;break}l=l.nextElementSibling}return n}return!1}default:if(["button","select","textarea"].includes(t)&&!(e.disabled||e.hasAttribute("disabled")))return!0}}else if(e instanceof r.SVGElement){if(Number.isInteger(parseInt(e.getAttributeNS(null,"tabindex")))){const t=["clipPath","defs","desc","linearGradient","marker","mask","metadata","pattern","radialGradient","script","style","symbol","title"],i="http://www.w3.org/2000/svg";let l,n=e;for(;n.namespaceURI===i&&(l=t.includes(n.localName),!l);)if(n?.parentNode?.namespaceURI===i)n=n.parentNode;else break;return!l}if(e.localName==="a"&&(e.href||e.hasAttributeNS(null,"href")))return!0}return!1},V=e=>{if(e?.nodeType!==s.ELEMENT_NODE)return!1;const r=e.ownerDocument.defaultView;let t=e,i=!0;for(;t;){if(t.disabled||t.hasAttribute("disabled")){i=!1;break}(t.hidden||t.hasAttribute("hidden"))&&(i=!1);const{contentVisibility:l,display:n,visibility:a}=r.getComputedStyle(t);if(n==="none"||a!=="visible"||l==="hidden"&&t!==e?i=!1:i=!0,i&&t?.parentNode?.nodeType===s.ELEMENT_NODE)t=t.parentNode;else break}return i},g=(e,r)=>{if(typeof e!="string")throw new TypeError(`Unexpected type ${u(e)}`);if(!r?.nodeType)throw new TypeError(`Unexpected type ${u(r)}`);if(!e||r.nodeType!==s.ELEMENT_NODE)return null;const{attributes:t}=r;let i;for(const l of t){const{name:n,namespaceURI:a,prefix:o,value:f}=l;if(n===`xmlns:${e}`?i=f:o===e&&(i=a),i)break}return i??null},K=(e="",r={})=>{if(!e||typeof e!="string"||r?.nodeType!==s.ELEMENT_NODE)return!1;if(r.lookupNamespaceURI(e))return!0;const t=r.ownerDocument.documentElement;let i=r,l;for(;i&&(l=g(e,i),!(l||i===t));)i=i.parentNode;return!!l},O=(e,r)=>{if(e?.nodeType){if(!r?.nodeType)throw new TypeError(`Unexpected type ${u(r)}`)}else throw new TypeError(`Unexpected type ${u(e)}`);if(e.nodeType!==s.ELEMENT_NODE||r.nodeType!==s.ELEMENT_NODE)return!1;const t=r.compareDocumentPosition(e);return!!(t&s.DOCUMENT_POSITION_PRECEDING||t&s.DOCUMENT_POSITION_CONTAINS)},Y=(e=[])=>{const r=[...e];return r.length>1&&r.sort((t,i)=>{let l;return O(i,t)?l=1:l=-1,l}),r},X=(e,r)=>{if(!e?.DOMException)throw new TypeError(`Unexpected global object ${u(e)}`);r?.nodeType!==s.DOCUMENT_NODE&&(r=e.document);const t=(0,w.default)({document:r,DOMException:e.DOMException});return t.configure({LOGERRORS:!1}),t},W=(e,r={})=>{if(!e||typeof e!="string")return!1;if(e.includes("[")){const t=e.lastIndexOf("[");if(e.substring(t).indexOf("]")<0)return!1}if(/[|\\]|::|[^\u0021-\u007F\s]|\[\s*[\w$*=^|~-]+(?:(?:"[\w$*=^|~\s'-]+"|'[\w$*=^|~\s"-]+')?(?:\s+[\w$*=^|~-]+)+|"[^"\]]{1,255}|'[^'\]]{1,255})\s*\]|:(?:is|where)\(\s*\)/.test(e))return!1;if(e.includes(":")){const{complex:t,descend:i}=r;return/:(?:is|not)\(/.test(e)?t?!A.test(e):!L.test(e):i?!1:!R.test(e)}return!0};0&&(module.exports={filterSelector,getDirectionality,getNamespaceURI,getSlottedTextContent,getType,initNwsapi,isContentEditable,isCustomElement,isFocusVisible,isFocusable,isFocusableArea,isNamespaceDeclared,isPreceding,isVisible,resolveContent,sortNodes,traverseNode});
//# sourceMappingURL=utility.js.map
