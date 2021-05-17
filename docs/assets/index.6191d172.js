var e=Object.defineProperty,t=Object.prototype.hasOwnProperty,n=Object.getOwnPropertySymbols,r=Object.prototype.propertyIsEnumerable,o=(t,n,r)=>n in t?e(t,n,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[n]=r,a=(e,a)=>{for(var s in a||(a={}))t.call(a,s)&&o(e,s,a[s]);if(n)for(var s of n(a))r.call(a,s)&&o(e,s,a[s]);return e};import{v as s,D as i,a as d,b as c,t as l,T as u,h as g,S as m,P as p,c as f,f as h,E as v,d as w,e as b,g as y,s as k}from"./vendor.7eb6d781.js";!function(e=".",t="__import__"){try{self[t]=new Function("u","return import(u)")}catch(n){const r=new URL(e,location),o=e=>{URL.revokeObjectURL(e.src),e.remove()};self[t]=e=>new Promise(((n,a)=>{const s=new URL(e,r);if(self[t].moduleMap[s])return n(self[t].moduleMap[s]);const i=new Blob([`import * as m from '${s}';`,`${t}.moduleMap['${s}']=m;`],{type:"text/javascript"}),d=Object.assign(document.createElement("script"),{type:"module",src:URL.createObjectURL(i),onerror(){a(new Error(`Failed to import: ${e}`)),o(d)},onload(){n(self[t].moduleMap[s]),o(d)}});document.head.appendChild(d)})),self[t].moduleMap={}}}("/assets/");const M=(e,t,n,r,o=!1)=>{if(R(t,n,e.doc))throw new Error("Ranges can not be split in two parts.");return C(e,t,n,"range",r,o)},A=(e,t,n,r=!1)=>{const o=e.config.schema.marks.range;let a=r||e.tr;return a=a.removeMark(t,n,o),a},E=(e,t,n,r=!1)=>{const o=j(e.doc),a=L(o,t,n),s=r||e.tr,i=e.config.schema.marks[t];return Object.values(a).forEach((e=>{const{from:t,to:n}=e;s.removeMark(t,n,i)})),s},S=(e,t,n)=>(r,o)=>{const{dispatch:a,state:s}=e,i=t.getState(s)[r],{from:d,to:c,isConfirmed:l,rangeId:u}=i;if(!i)throw new Error("Range not found");let g=M(s,d,c,{rangeId:u,isConfirmed:l,isActive:o});g=g.setMeta(n,{editing:o,from:i.from,to:i.to,id:r}),a(g)},C=(e,t,n,r,o,i=!1)=>{const d=s(),c=a(a({},o),{pmId:d}),l=e.config.schema.marks[r];let u=i||e.tr;u=u.removeMark(t,n,l);const g=l.create(c);u=u.addMark(t,n,g);return L(j(u.doc),r,"pmId")[d].marks.forEach((e=>{u=u.removeMark(e.from,e.to,l);const t=l.create(a(a({},c),{pmId:s()}));u=u.addMark(e.from,e.to,t)})),u},I=e=>(t,n,r)=>{const{state:o,dispatch:a}=e;a(M(o,t,n,r))},O=(e,t,n=!1)=>{const r=document.createElement("button");r.setAttribute("class","range-decoration__button"),r.setAttribute("data-range-widget",e),r.setAttribute("data-range-widget-pos",t);const o=document.createElement("span"),a=n?"range-decoration__inner range-decoration__inner--active":"range-decoration__inner";return o.setAttribute("class",a),o.setAttribute("data-range-widget",e),o.setAttribute("data-range-widget-pos",t),r.appendChild(o),r},x=(e,t,n,r,o)=>{const a=d.widget(t,O(r,t,"from"===o),{id:r}),s=d.widget(n,O(r,n,"to"===o),{id:r});return i.create(e.doc,[a,s])};function j(e,t=!0){if(!e)throw new Error('Invalid "node" parameter');const n=[];return e.descendants(((e,r)=>{if(n.push({node:e,pos:r}),!t)return!1})),n}const L=(e,t,n)=>{let r={};return e.forEach((({node:e,pos:o})=>{e.marks.filter((e=>e.type.name===t)).forEach((t=>{let a=r[t.attrs[n]];a||(a={marks:[]},a.from=o,r[t.attrs[n]]=a),a.to=o+e.nodeSize,a.isConfirmed=t.attrs.isConfirmed,a.rangeId=t.attrs[n],a.marks=[...a.marks,{from:o,to:a.to}]}))})),r},T=(e,t,n)=>{const{doc:r}=t,{content:o}=r.slice(e.from,e.to);return((e,t)=>{let n=document.createElement("div");return c.fromSchema(t).serializeFragment(e,{document:window.document},n)})(o,n).innerHTML},R=(e,t,n)=>{const r=L(j(n),"range","rangeId");return 0!==Object.values(r).filter((n=>e>n.from&&t<n.to)).length},_=(e,t,n)=>{const r=t===n.from?n.to:n.from;return{from:Math.min(r,e),to:Math.max(r,e)}},D=(e,t,n=1)=>{let r=[];void 0===t&&(t=e,e=0);for(let o=e;o<t;o+=n)r.push(o);return r},U={attrs:{rangeId:{default:null},isActive:{default:!1},isMoving:{default:!1},isConfirmed:{default:!1},pmId:{default:null}},inclusive:!0,parseDOM:[{tag:"span[data-range]",getAttrs:e=>({rangeId:e.getAttribute("data-range"),isActive:e.getAttribute("data-range-active"),isMoving:e.getAttribute("data-range-moving"),isConfirmed:e.getAttribute("data-range-confirmed"),pmId:e.getAttribute("data-pm-id")})}],toDOM(e){const{rangeId:t,isActive:n,isConfirmed:r,isMoving:o,pmId:a}=e.attrs;return["span",{"data-range":t,"data-range-active":n,"data-range-moving":o,"data-range-confirmed":r,"data-pm-id":a},0]}},q={attrs:{active:{default:null},pmId:{default:null}},inclusive:!0,parseDOM:[{tag:"span[data-range-selected]",getAttrs:e=>({active:e.getAttribute("data-range-selected"),pmId:e.getAttribute("data-pm-id")})}],toDOM(e){const{active:t,pmId:n}=e.attrs;return["span",{"data-range-selected":t,"data-pm-id":n},0]}},$=(e,t,n=(()=>{}))=>new f({key:e,state:{init:(e,t)=>L(j(t.doc),"range","rangeId"),apply(e,r,o,a){const s=L(j(a.doc),"range","rangeId"),i=s&&r&&((e,t)=>Object.keys(e).filter((e=>t[e])).length===Object.keys(e).length&&(Object.keys(t).filter((t=>e[t])).length===Object.keys(t).length&&!(Object.entries(e).filter((([e,n])=>{const r=t[e];return r.from===n.from&&r.to===n.to&&r.isConfirmed===n.isConfirmed})).length!==Object.keys(e).length)))(r,s);return i?r:i?void 0:(Object.entries(s).forEach((([e,n])=>{s[e].txt=T(n,a,t)})),n(r,s),s)}}}),H=(e,t)=>{let n=null;return{update(e,r){const{state:o}=e,{doc:s,selection:i}=o;if(r&&r.doc.eq(s)&&r.selection.eq(i))return;const{empty:d,from:c,to:g,$anchor:m,$head:p}=i;if(d)return null==n||n.destroy(),void(n=null);const f=t.getState(o);let h=[];Object.values(f).forEach((({from:e,to:t})=>h.push(...D(e,t))));const v=new Set(D(c,g));h=new Set(h);if(((e,t)=>{for(let n of t)if(!e.has(n))return!1;return!0})(h,v))return null==n||n.destroy(),void(n=null);null==n||n.destroy(),n=((e,t,n)=>{const r=document.createElement("button");return r.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>',r.setAttribute("class","menu-btn"),r.addEventListener("click",(r=>{r.preventDefault();const o=Math.min(t,n),a=Math.max(t,n);I(e)(o,a,{rangeId:`${o}_${a}`});const{state:s,dispatch:i}=e;let{tr:d}=s;e.focus(),d=d.setSelection(new u(s.doc.resolve(n))),i(d)})),l(e.dom,{duration:0,arrow:!1,theme:"light-border",getReferenceClientRect:()=>{const t=e.coordsAtPos(n,-1);return a({height:10,width:0},t)},content:r,interactive:!0,trigger:"manual",showOnCreate:!0})})(e,m.pos,p.pos)}}};let B=(e,t,n)=>{let r=document.createElement("link");return r.setAttribute("rel","stylesheet"),r.setAttribute("type","text/css"),r.setAttribute("href","data:text/css;charset=UTF-8,"+encodeURIComponent("")),document.getElementsByTagName("head")[0].appendChild(r),new f({key:e,props:{handleDOMEvents:{mouseover(e,o){const{state:a}=e,{empty:s}=a.selection;if(!t.getState(a).isEditing&&s){const{target:a}=o;a.getAttribute("data-range")&&(g(),l(a,{arrow:!1,theme:"light-border",content(r){const o=r.getAttribute("data-range");return((e,t,n,r)=>{const o=document.createElement("div"),a=t.getState(e.state)[r];if(!a.isConfirmed){const t=document.createElement("button");t.setAttribute("class","menu-btn pr-5"),t.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-check"><polyline points="20 6 9 17 4 12"></polyline></svg>',t.addEventListener("click",(t=>{t.preventDefault(),I(e)(a.from,a.to,{rangeId:r,isActive:!1,isConfirmed:!0}),g()})),o.appendChild(t)}const s=document.createElement("button");s.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-3"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>',s.setAttribute("class","menu-btn pr-5"),s.addEventListener("click",(o=>{o.preventDefault(),S(e,t,n)(r,!0),g()})),o.appendChild(s);const i=document.createElement("button");return i.setAttribute("class","menu-btn"),i.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>',i.addEventListener("click",(t=>{t.preventDefault();const n=A(e.state,a.from,a.to);e.dispatch(n),g()})),o.appendChild(i),o})(e,n,t,o)},allowHTML:!0,interactive:!0,appendTo:()=>document.body,showOnCreate:!0,onHidden:e=>{e.destroy()},followCursor:"initial",duration:1,delay:100,placement:"auto",plugins:[h]}));const s=a.getAttribute("data-range"),i=s?`span[data-range="${s}"] { background-color: bisque; }`:"";r.setAttribute("href","data:text/css;charset=UTF-8,"+encodeURIComponent(i))}else r.setAttribute("href","data:text/css;charset=UTF-8,"+encodeURIComponent(""))}}}})};let F=null;const K=((e,t,n)=>{let r=e.spec.marks.addToStart("range",U);r=r.addToStart("rangeselection",q);const o=new m({nodes:e.spec.nodes,marks:r}),a=new p("editing-decorations"),s=new p("range-tracker"),i=new p("range-edit-state"),d=new p("range-creator"),c=new p("range-behaviour"),l=((e,t,n,r=(()=>{}))=>new f({key:e,state:{init:()=>({isEditing:!1,decorations:null,position:{}}),apply(o,a,s,i){const d=o.getMeta(e),c=t.getState(i);if(d&&d.editing)return r(n.getState(i)[d.id],!0),{isEditing:!0,decorations:x(i,d.from,d.to,d.id),position:{from:d.from,to:d.to}};if(d&&!d.editing)return r(n.getState(i)[d.id],!1),{isEditing:!1,decorations:a.decorations.remove(a.decorations.find(d.from,d.to)),position:{}};if(c){const e=n.getState(i)[c.id],t=o.selection.$head.pos,{from:r,to:a}=_(t,c.pos,e),s=c.pos===e.from?"from":"to";return{isEditing:!0,decorations:x(i,r,a,c.id,s),position:{from:r,to:a}}}return a}},props:{decorations:t=>e.getState(t).decorations,handleDOMEvents:{click(e,r){let{target:o}=r;if(o.getAttribute("data-range-widget")){const r=o.getAttribute("data-range-widget"),a=parseInt(o.getAttribute("data-range-widget-pos")),{dispatch:s,state:i}=e;let d=i.tr;d=d.setSelection(u.near(i.doc.resolve(a)));const c=n.getState(i)[r],l=t.getState(i);if(l){d=d.setMeta(t,"stop-editing"),d=A(e.state,c.from,c.to,d);const{from:n,to:r}=_(a,l.pos,c);d=M(e.state,n,r,{rangeId:l.id,isActive:!0},d),d=E(e.state,"rangeselection","active",d),e.dispatch(d),document.querySelector(`span[data-range-widget-pos="${a}"]`).classList.remove("range-decoration__inner--active")}else d=d.setMeta(t,{id:r,pos:a,moving:!0}),s(d),I(e)(c.from,c.to,{rangeId:r,isActive:!0,isMoving:!0});e.focus()}return!0}}},appendTransaction(n,r,o){const a=e.getState(o).position,s=t.getState(o);if(Object.keys(a).length&&s){let e=E(o,"rangeselection","active");return e=C(o,a.from,a.to,"rangeselection",{active:!0},e),e}}}))(a,i,s,n);var g;var h;return{plugins:[new f({key:g=i,state:{init:()=>null,apply(e,t){const n=e.getMeta(g);let r=t;return n&&(r="stop-editing"===n?null:n),r}}}),$(s,o,t),l,(h=s,new f({key:d,view:e=>H(0,h)})),B(c,a,s)],schema:o,keys:{rangeTrackerKey:s,editStateTrackerKey:i,editingDecorationsKey:a,rangeCreatorKey:d}}})(k,((e,t)=>{F&&(document.querySelector("pre").textContent=JSON.stringify(t[F],null,2))}),((e,t)=>{if(e&&t){F=e.rangeId,document.querySelector(".edit-container").classList.remove("display--none");const t=document.querySelector("#json"),n=document.createElement("pre");n.textContent=JSON.stringify(e,null,2),t.appendChild(n),document.querySelector(".edit-container button").addEventListener("click",(()=>{window.setRangeEditingState(e.rangeId,!1),t.innerHTML=""}))}else F=null,document.querySelector(".edit-container").classList.add("display--none")}));let P=window.view=new v(document.querySelector("#editor"),{state:w.create({doc:b.fromSchema(K.schema).parse(document.querySelector("#content")),plugins:y({schema:K.schema}).concat(...K.plugins)})});window.setRange=I(P),window.setRangeEditingState=S(P,K.keys.rangeTrackerKey,K.keys.editingDecorationsKey);