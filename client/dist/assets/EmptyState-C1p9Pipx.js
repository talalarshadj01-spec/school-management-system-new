import{c as o,j as e,B as m,C as h,U as s,h as p}from"./index-Bpe65B4e.js";/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]],u=o("FileText",f);/**
 * @license lucide-react v0.475.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=[["polyline",{points:"22 12 16 12 14 15 10 15 8 12 2 12",key:"o97t9d"}],["path",{d:"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",key:"oot6mr"}]],y=o("Inbox",b),a={students:s,teachers:s,fees:h,reports:u,books:m,default:y},N=({icon:l,iconKey:n="default",title:r="No data found",description:c="There are no records to display.",action:d=null,onRetry:t=null,retryLabel:i="Retry"})=>{const x=l||a[n]||a.default;return e.jsxs("div",{className:"flex flex-col items-center justify-center py-16 px-4 text-center",children:[e.jsx("div",{className:"p-4 bg-slate-100 rounded-full mb-4",children:e.jsx(x,{className:"w-10 h-10 text-slate-400"})}),e.jsx("h3",{className:"text-base font-semibold text-slate-700 mb-1",children:r}),e.jsx("p",{className:"text-sm text-slate-500 max-w-sm mb-6",children:c}),e.jsxs("div",{className:"flex items-center gap-3 flex-wrap justify-center",children:[t&&e.jsxs("button",{onClick:t,className:"flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors",children:[e.jsx(p,{className:"w-4 h-4"}),i]}),d]})]})};export{N as E};
