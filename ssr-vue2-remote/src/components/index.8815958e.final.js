import*as t from"ssr-vue2-remote/npm/vue";var s,e={229:function(t,s,e){t.exports={}},559:function(t,s,e){t.exports={}},721:function(t,s,e){t.exports={}},169:function(t,s,e){t.exports={}},367:function(t,s,e){t.exports={}},898:function(t,s,e){t.exports={}},868:function(t,s,e){t.exports={}},666:function(t,s,e){e.r(t.exports={})},984:function(t,s,e){e.r(t.exports={})},916:function(t,s,e){e.r(t.exports={})},757:function(t,s,e){e.r(t.exports={})},75:function(t,s,e){e.r(t.exports={})},343:function(t,s,e){e.r(t.exports={})},765:function(t,s,e){e.r(t.exports={})},884:function(t,s,e){t.exports={}}},i={};function a(t){var s=i[t];if(void 0!==s)return s.exports;var o=i[t]={exports:{}};return e[t](o,o.exports,a),o.exports}if(a.m=e,a.k=t=>""+t+".css",a.g=(()=>{if("object"==typeof globalThis)return globalThis;try{return this||Function("return this")()}catch(t){if("object"==typeof window)return window}})(),a.o=(t,s)=>Object.prototype.hasOwnProperty.call(t,s),a.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},"string"==typeof import.meta.url&&(s=import.meta.url),!s)throw Error("Automatic publicPath is not supported in this browser");a.p=(s=s.replace(/^blob:/,"").replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"))+"../../",a(884);let o=(0,t.defineComponent)({__name:"ui-button",props:{type:{default:"primary"},size:{default:"medium"},loading:{type:Boolean,default:!1},disabled:{type:Boolean,default:!1}},emits:["click"],setup(t,s){let{emit:e}=s;return{__sfc:!0,props:t,emit:e,handleClick:s=>{t.loading||t.disabled||e("click",s)}}}});function n(t,s,e,i,a,o,n,r){var l,c="function"==typeof t?t.options:t;if(s&&(c.render=s,c.staticRenderFns=e,c._compiled=!0),i&&(c.functional=!0),o&&(c._scopeId="data-v-"+o),n?c._ssrRegister=l=function(t){(t=t||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(t=__VUE_SSR_CONTEXT__),a&&a.call(this,t),t&&t._registeredComponents&&t._registeredComponents.add(n)}:a&&(l=r?function(){a.call(this,(c.functional?this.parent:this).$root.$options.shadowRoot)}:a),l)if(c.functional){c._injectStyles=l;var u=c.render;c.render=function(t,s){return l.call(s),u(t,s)}}else{var _=c.beforeCreate;c.beforeCreate=_?[].concat(_,l):[l]}return{exports:t,options:c}}a(721);let r=n(o,function(){var t=this._self._c,s=this._self._setupProxy;return t("button",{class:["button",`button--${this.type}`,`button--${this.size}`,{"is-loading":this.loading}],attrs:{disabled:this.loading||this.disabled},on:{click:s.handleClick}},[t("div",{staticClass:"button__content"},[this.loading?t("span",{staticClass:"button__loading"},[t("svg",{staticClass:"animate-spin",attrs:{viewBox:"0 0 24 24"}},[t("circle",{staticClass:"opacity-25",attrs:{cx:"12",cy:"12",r:"10",stroke:"currentColor","stroke-width":"3",fill:"none"}}),this._v(" "),t("path",{staticClass:"opacity-75",attrs:{fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"}})])]):this._e(),this._v(" "),this._t("default")],2)])},[],!1,null,null,null).exports,l=(0,t.defineComponent)({__name:"ui-card",props:{hoverable:{type:Boolean,default:!1}},setup:t=>({__sfc:!0})});a(169);let c=n(l,function(){var t=this._self._c;return this._self._setupProxy,t("div",{staticClass:"card",class:{"card--hoverable":this.hoverable}},[this.$slots.header?t("div",{staticClass:"card__header"},[this._t("header")],2):this._e(),this._v(" "),t("div",{staticClass:"card__body"},[this._t("default")],2),this._v(" "),this.$slots.footer?t("div",{staticClass:"card__footer"},[this._t("footer")],2):this._e()])},[],!1,null,null,null).exports,u=(0,t.defineComponent)({__name:"ui-module-guide",setup:t=>({__sfc:!0})});a(367);let _=n(u,function(){return this._self._c,this._self._setupProxy,this._m(0)},[function(){var t=this._self._c;return this._self._setupProxy,t("div",{staticClass:"ui-module-guide"},[t("h2",[this._v("模块导出配置")]),this._v(" "),t("div",{staticClass:"guide-content"},[t("div",{staticClass:"code-block"},[t("div",{staticClass:"code-text"},[t("span",{staticClass:"keyword"},[this._v("export")]),this._v(" "),t("span",{staticClass:"keyword"},[this._v("default")]),this._v(" {"),t("br"),this._v("\n        \xa0\xa0modules: {"),t("br"),this._v("\n        \xa0\xa0\xa0\xa0exports: ["),t("br"),this._v("\n        \xa0\xa0\xa0\xa0\xa0\xa0"),t("span",{staticClass:"comment"},[this._v("// Vue 实例")]),t("br"),this._v("\n        \xa0\xa0\xa0\xa0\xa0\xa0"),t("span",{staticClass:"string"},[this._v("'npm:vue'")]),t("br"),this._v("\n        \xa0\xa0\xa0\xa0\xa0\xa0"),t("span",{staticClass:"comment"},[this._v("// UI 组件")]),t("br"),this._v("\n        \xa0\xa0\xa0\xa0\xa0\xa0"),t("span",{staticClass:"string"},[this._v("'root:src/components/index.ts'")]),this._v(","),t("br"),this._v("\n        \xa0\xa0\xa0\xa0\xa0\xa0"),t("span",{staticClass:"comment"},[this._v("// 组合式函数")]),t("br"),this._v("\n        \xa0\xa0\xa0\xa0\xa0\xa0"),t("span",{staticClass:"string"},[this._v("'root:src/composables/index.ts'")]),t("br"),this._v("\n        \xa0\xa0\xa0\xa0]"),t("br"),this._v("\n        \xa0\xa0}"),t("br"),this._v("\n        }\n      ")])])])])}],!1,null,"7750e43b",null).exports,h=(0,t.defineComponent)({__name:"ui-showcase-section",props:{title:null},setup:t=>({__sfc:!0})});a(868);let p=n(h,function(){var t=this._self._c;return this._self._setupProxy,t("section",{staticClass:"showcase-section"},[this.$slots.header?[t("div",{staticClass:"section-header"},[this._t("header")],2)]:this.title?[t("h2",{staticClass:"section-title"},[this._v(this._s(this.title))])]:this._e(),this._v(" "),t("div",{staticClass:"section-content"},[this._t("default")],2)],2)},[],!1,null,"f711cbf2",null).exports,d=(0,t.defineComponent)({__name:"ui-module-header",props:{title:null,description:null,tags:{default:()=>["Vue 2.7","SSR","ESM"]}},setup:t=>({__sfc:!0})});a(898);let v=n(d,function(){var t=this,s=t._self._c;return t._self._setupProxy,s("header",{staticClass:"app-header"},[s("div",{staticClass:"container"},[s("div",{staticClass:"header-content"},[s("div",{staticClass:"header-info"},[s("h1",[t._v(t._s(t.title))]),t._v(" "),s("p",{staticClass:"header-description"},[t._v(t._s(t.description))]),t._v(" "),s("div",{staticClass:"version-tags"},t._l(t.tags,function(e){return s("span",{key:e,staticClass:"version-tag"},[t._v(t._s(e))])}),0)])])])])},[],!1,null,"dcc41034",null).exports,f=(0,t.defineComponent)({__name:"app-nav",props:{current:null},setup:t=>({__sfc:!0})});a(559);let m=n(f,function(){var t=this._self._c;return this._self._setupProxy,t("nav",{staticClass:"app-nav"},[t("div",{staticClass:"container"},[t("div",{staticClass:"nav-content"},[this._m(0),this._v(" "),t("div",{staticClass:"nav-links"},[t("a",{staticClass:"nav-link",class:{active:"home"===this.current},attrs:{href:"https://www.esmnext.com/"}},[this._v("首页")]),this._v(" "),t("a",{staticClass:"nav-link",class:{active:"remote"===this.current},attrs:{href:"https://www.esmnext.com/ssr-vue2-remote/"}},[this._v("Remote")]),this._v(" "),t("a",{staticClass:"nav-link",class:{active:"host"===this.current},attrs:{href:"https://www.esmnext.com/ssr-vue2-host/"}},[this._v("Host")])])])])])},[function(){var t=this._self._c;return this._self._setupProxy,t("div",{staticClass:"nav-brand"},[t("img",{staticClass:"nav-logo",attrs:{src:"https://www.esmnext.com/logo.svg",alt:"Esmx Logo"}}),this._v(" "),t("span",{staticClass:"nav-title"},[this._v("Esmx")])])}],!1,null,"8323f286",null).exports;a(229);let C=n({},function(){return this._self._c,this._m(0)},[function(){var t=this._self._c;return t("footer",{staticClass:"app-footer"},[t("div",{staticClass:"container"},[t("div",{staticClass:"footer-content"},[t("div",{staticClass:"footer-info"},[t("div",{staticClass:"footer-brand"},[t("img",{staticClass:"footer-logo",attrs:{src:"https://www.esmnext.com/logo.svg",alt:"Esmx Logo"}}),this._v(" "),t("span",{staticClass:"footer-title"},[this._v("Esmx")])]),this._v(" "),t("div",{staticClass:"source-links"},[t("a",{staticClass:"source-link",attrs:{href:"https://github.com/esmnext/esmx/tree/master/examples/ssr-vue2-host",target:"_blank",rel:"noopener"}},[t("span",{staticClass:"source-label"},[this._v("Host Source")]),this._v(" "),t("span",{staticClass:"source-path"},[this._v("/examples/ssr-vue2-host")])]),this._v(" "),t("a",{staticClass:"source-link",attrs:{href:"https://github.com/esmnext/esmx/tree/master/examples/ssr-vue2-remote",target:"_blank",rel:"noopener"}},[t("span",{staticClass:"source-label"},[this._v("Remote Source")]),this._v(" "),t("span",{staticClass:"source-path"},[this._v("/examples/ssr-vue2-remote")])])])])])])])}],!1,null,"938bcef4",null).exports;export{C as AppFooter,m as AppNav,r as UiButton,c as UiCard,_ as UiModuleGuide,v as UiModuleHeader,p as UiShowcaseSection};