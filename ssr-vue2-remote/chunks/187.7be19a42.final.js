export const __webpack_ids__=["187"];export const __webpack_modules__={43:function(s,t,i){s.exports={}},583:function(s,t,i){i.r(s.exports={})},19:function(s,t,i){i.r(t),i.d(t,{default:()=>o});var a=i(946),e=i(171);let n=(0,a.defineComponent)({__name:"app",setup:s=>({__sfc:!0,AppFooter:e.AppFooter,AppNav:e.AppNav,UiModuleHeader:e.UiModuleHeader,UiShowcaseSection:e.UiShowcaseSection})});i(43);let o=function(s,t,i,a,e,n,o,v){var _,c="function"==typeof s?s.options:s;if(t&&(c.render=t,c.staticRenderFns=i,c._compiled=!0),a&&(c.functional=!0),n&&(c._scopeId="data-v-"+n),_)if(c.functional){c._injectStyles=_;var p=c.render;c.render=function(s,t){return _.call(t),p(s,t)}}else{var h=c.beforeCreate;c.beforeCreate=h?[].concat(h,_):[_]}return{exports:s,options:c}}(n,function(){var s=this._self._c,t=this._self._setupProxy;return s("div",{staticClass:"app"},[s(t.AppNav,{attrs:{current:"remote"}}),this._v(" "),s(t.UiModuleHeader,{attrs:{title:"Esmx Module Link Remote",description:"这是一个 Module Link 远程模块示例，用于展示可复用的组件。通过 Module Link，你可以轻松地在不同项目间共享和复用组件，实现真正的模块化开发。"}}),this._v(" "),s("main",{staticClass:"app-main"},[s("div",{staticClass:"container"},[s("div",{staticClass:"showcase-grid"},[s(t.UiShowcaseSection,{attrs:{title:"Remote 服务"}},[s("p",{staticClass:"intro-text"},[this._v("Remote 服务是一个独立的微前端服务，可以：")]),this._v(" "),s("ul",{staticClass:"feature-list"},[s("li",[s("span",{staticClass:"bullet"},[this._v("•")]),this._v(" "),s("span",[this._v("将组件、函数导出给其他应用使用")])]),this._v(" "),s("li",[s("span",{staticClass:"bullet"},[this._v("•")]),this._v(" "),s("span",[this._v("支持运行时动态加载，实现代码共享")])]),this._v(" "),s("li",[s("span",{staticClass:"bullet"},[this._v("•")]),this._v(" "),s("span",[this._v("确保所有应用使用相同版本的依赖")])])])]),this._v(" "),s(t.UiShowcaseSection,{attrs:{title:"配置说明"}},[s("div",{staticClass:"demo-item"},[s("h3",[this._v("模块导出")]),this._v(" "),s("pre",{staticClass:"code-block"},[s("code",[s("span",{staticClass:"comment"},[this._v("// entry.node.ts")]),this._v("\n"),s("span",{staticClass:"keyword"},[this._v("export")]),this._v(" "),s("span",{staticClass:"keyword"},[this._v("default")]),this._v(" {\n  "),s("span",{staticClass:"property"},[this._v("modules")]),this._v(": {\n    "),s("span",{staticClass:"property"},[this._v("exports")]),this._v(": [\n      "),s("span",{staticClass:"comment"},[this._v("// 导出 Vue 实例")]),this._v("\n      "),s("span",{staticClass:"string"},[this._v("'npm:vue'")]),this._v(",\n      "),s("span",{staticClass:"comment"},[this._v("// UI 组件")]),this._v("\n      "),s("span",{staticClass:"string"},[this._v("'root:src/components/index.ts'")]),this._v(",\n      "),s("span",{staticClass:"comment"},[this._v("// 组合式函数")]),this._v("\n      "),s("span",{staticClass:"string"},[this._v("'root:src/composables/index.ts'")]),this._v(",\n      "),s("span",{staticClass:"comment"},[this._v("// 示例组件")]),this._v("\n      "),s("span",{staticClass:"string"},[this._v("'root:src/examples/index.ts'")]),this._v("\n    ]\n  }\n}")])]),this._v(" "),s("div",{staticClass:"tips"},[s("div",{staticClass:"tip-item"},[s("span",{staticClass:"tip-icon"},[this._v("\uD83D\uDCE6")]),this._v(" "),s("span",[this._v("需要支持 ESM 格式")])]),this._v(" "),s("div",{staticClass:"tip-item"},[s("span",{staticClass:"tip-icon"},[this._v("\uD83D\uDCDD")]),this._v(" "),s("span",[this._v("需要 TypeScript 类型定义")])])])]),this._v(" "),s("div",{staticClass:"demo-item"},[s("h3",[this._v("导出类型")]),this._v(" "),s("div",{staticClass:"export-types"},[s("div",{staticClass:"export-type"},[s("code",{staticClass:"highlight"},[this._v("npm:package")]),this._v(" "),s("p",[this._v("用于共享核心依赖包（如 Vue），确保所有应用使用相同版本。")])]),this._v(" "),s("div",{staticClass:"export-type"},[s("code",{staticClass:"highlight"},[this._v("root:path")]),this._v(" "),s("p",[this._v("用于共享项目内的组件、函数等可复用模块。")])])])]),this._v(" "),s("div",{staticClass:"demo-item"},[s("h3",[this._v("导出示例")]),this._v(" "),s("pre",{staticClass:"code-block"},[s("code",[s("span",{staticClass:"comment"},[this._v("// src/components/index.ts")]),this._v("\n"),s("span",{staticClass:"keyword"},[this._v("export")]),this._v(" { "),s("span",{staticClass:"property"},[this._v("UiButton")]),this._v(" } "),s("span",{staticClass:"keyword"},[this._v("from")]),this._v(" "),s("span",{staticClass:"string"},[this._v("'./ui-button.vue'")]),this._v(";\n"),s("span",{staticClass:"keyword"},[this._v("export")]),this._v(" { "),s("span",{staticClass:"property"},[this._v("UiCard")]),this._v(" } "),s("span",{staticClass:"keyword"},[this._v("from")]),this._v(" "),s("span",{staticClass:"string"},[this._v("'./ui-card.vue'")]),this._v(";\n\n"),s("span",{staticClass:"comment"},[this._v("// src/composables/index.ts")]),this._v("\n"),s("span",{staticClass:"keyword"},[this._v("export")]),this._v(" { "),s("span",{staticClass:"property"},[this._v("useTheme")]),this._v(" } "),s("span",{staticClass:"keyword"},[this._v("from")]),this._v(" "),s("span",{staticClass:"string"},[this._v("'./use-theme'")]),this._v(";")])])])])],1)])]),this._v(" "),s(t.AppFooter)],1)},[],!1,null,"1fb18fa9",0).exports}};