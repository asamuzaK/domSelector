var a=Object.create;var r=Object.defineProperty;var o=Object.getOwnPropertyDescriptor;var l=Object.getOwnPropertyNames;var L=Object.getPrototypeOf,_=Object.prototype.hasOwnProperty;var w=(e,n)=>{for(var i in n)r(e,i,{get:n[i],enumerable:!0})},E=(e,n,i,f)=>{if(n&&typeof n=="object"||typeof n=="function")for(let t of l(n))!_.call(e,t)&&t!==i&&r(e,t,{get:()=>n[t],enumerable:!(f=o(n,t))||f.enumerable});return e};var G=(e,n,i)=>(i=e!=null?a(L(e)):{},E(n||!e||!e.__esModule?r(i,"default",{value:e,enumerable:!0}):i,e)),x=e=>E(r({},"__esModule",{value:!0}),e);var D={};w(D,{filterSelector:()=>C,initNwsapi:()=>d});module.exports=x(D);var p=G(require("@asamuzakjp/nwsapi"),1),O=require("./dom-util.js"),s=require("./constant.js");const d=e=>{if(!e||!e.nodeType)(0,O.verifyNode)(e);else if(e.nodeType!==s.DOCUMENT_NODE){const i=`Unexpected node ${e.nodeName}`;throw new TypeError(i)}const n=(0,p.default)({document:e,DOMException:e.defaultView.DOMException});return n.configure({LOGERRORS:!1}),n},C=(e,n={})=>{if(!e||typeof e!="string")return!1;if(e.includes("[")){const i=e.lastIndexOf("[");if(e.substring(i).lastIndexOf("]")<0)return!1}if(/\||::|\[\s*[\w$*=^|~-]+(?:(?:"[\w$*=^|~\s'-]+"|'[\w$*=^|~\s"-]+')?(?:\s+[\w$*=^|~-]+)+|"[^"\]]{1,255}|'[^'\]]{1,255})\s*\]/.test(e))return!1;if(e.includes(":")){let i;if(s.REG_LOGICAL_KEY.test(e)){if(s.REG_LOGICAL_EMPTY.test(e))return!1;const{complex:f,descendant:t}=n;f&&t?i=s.REG_LOGICAL_COMPLEX:i=s.REG_LOGICAL_COMPOUND}else i=s.REG_CHILD_INDEXED;if(i.test(e))return!1}return!0};0&&(module.exports={filterSelector,initNwsapi});
//# sourceMappingURL=nwsapi.js.map
