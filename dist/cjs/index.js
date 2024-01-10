var s=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var u=Object.getOwnPropertyNames;var w=Object.prototype.hasOwnProperty;var a=(r,e)=>{for(var o in e)s(r,o,{get:e[o],enumerable:!0})},y=(r,e,o,l)=>{if(e&&typeof e=="object"||typeof e=="function")for(let c of u(e))!w.call(r,c)&&c!==o&&s(r,c,{get:()=>e[c],enumerable:!(l=h(e,c))||l.enumerable});return r};var f=r=>y(s({},"__esModule",{value:!0}),r);var x={};a(x,{closest:()=>m,matches:()=>i,querySelector:()=>p,querySelectorAll:()=>q});module.exports=f(x);var n=require("./js/matcher.js");/*!
 * DOM Selector - A CSS selector engine.
 * @license MIT
 * @copyright asamuzaK (Kazz)
 * @see {@link https://github.com/asamuzaK/domSelector/blob/main/LICENSE}
 */let t=new n.Matcher;const i=(r,e,o)=>{let l;try{t||(t=new n.Matcher),l=t.matches(e,r,o)}catch(c){throw t=null,c}return l},m=(r,e,o)=>{let l;try{t||(t=new n.Matcher),l=t.closest(e,r,o)}catch(c){throw t=null,c}return l},p=(r,e,o)=>{let l;try{t||(t=new n.Matcher),l=t.querySelector(e,r,o)}catch(c){throw t=null,c}return l},q=(r,e,o)=>{let l;try{t||(t=new n.Matcher),l=t.querySelectorAll(e,r,o)}catch(c){throw t=null,c}return l};0&&(module.exports={closest,matches,querySelector,querySelectorAll});
//# sourceMappingURL=index.js.map
