var a=Object.defineProperty;var f=Object.getOwnPropertyDescriptor;var i=Object.getOwnPropertyNames;var l=Object.prototype.hasOwnProperty;var m=(r,e)=>{for(var t in e)a(r,t,{get:e[t],enumerable:!0})},n=(r,e,t,c)=>{if(e&&typeof e=="object"||typeof e=="function")for(let o of i(e))!l.call(r,o)&&o!==t&&a(r,o,{get:()=>e[o],enumerable:!(c=f(e,o))||c.enumerable});return r};var p=r=>n(a({},"__esModule",{value:!0}),r);var s={};m(s,{DOMSelector:()=>d.Finder});module.exports=p(s);var d=require("./js/finder.js");/*!
 * DOM Selector - A CSS selector engine.
 * @license MIT
 * @copyright asamuzaK (Kazz)
 * @see {@link https://github.com/asamuzaK/domSelector/blob/main/LICENSE}
 */0&&(module.exports={DOMSelector});
//# sourceMappingURL=index.js.map
