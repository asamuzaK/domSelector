var p=Object.create;var r=Object.defineProperty;var o=Object.getOwnPropertyDescriptor;var l=Object.getOwnPropertyNames;var a=Object.getPrototypeOf,_=Object.prototype.hasOwnProperty;var c=(t,n)=>{for(var e in n)r(t,e,{get:n[e],enumerable:!0})},E=(t,n,e,f)=>{if(n&&typeof n=="object"||typeof n=="function")for(let i of l(n))!_.call(t,i)&&i!==e&&r(t,i,{get:()=>n[i],enumerable:!(f=o(n,i))||f.enumerable});return t};var u=(t,n,e)=>(e=t!=null?p(a(t)):{},E(n||!t||!t.__esModule?r(e,"default",{value:t,enumerable:!0}):e,t)),L=t=>E(r({},"__esModule",{value:!0}),t);var D={};c(D,{filterSelector:()=>G,initNwsapi:()=>x});module.exports=L(D);var O=u(require("@asamuzakjp/nwsapi"),1),s=require("./constant.js");const x=(t,n)=>{if(!t||!t.DOMException){const i=`Unexpected global object ${Object.prototype.toString.call(t).slice(s.TYPE_FROM,s.TYPE_TO)}`;throw new TypeError(i)}n?.nodeType!==s.DOCUMENT_NODE&&(n=t.document);const e=(0,O.default)({document:n,DOMException:t.DOMException});return e.configure({LOGERRORS:!1}),e},G=(t,n={})=>{if(!t||typeof t!="string")return!1;if(t.includes("[")){const e=t.lastIndexOf("[");if(t.substring(e).lastIndexOf("]")<0)return!1}if(/\||::|\[\s*[\w$*=^|~-]+(?:(?:"[\w$*=^|~\s'-]+"|'[\w$*=^|~\s"-]+')?(?:\s+[\w$*=^|~-]+)+|"[^"\]]{1,255}|'[^'\]]{1,255})\s*\]/.test(t))return!1;if(t.includes(":")){let e;if(s.REG_LOGICAL_KEY.test(t)){if(s.REG_LOGICAL_EMPTY.test(t))return!1;const{complex:f,descendant:i}=n;f&&i?e=s.REG_LOGICAL_COMPLEX:e=s.REG_LOGICAL_COMPOUND}else e=s.REG_CHILD_INDEXED;if(e.test(t))return!1}return!0};0&&(module.exports={filterSelector,initNwsapi});
//# sourceMappingURL=nwsapi.js.map
