export const __webpack_ids__ = ["473"];
export const __webpack_modules__ = {
878: (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.d(__webpack_exports__, {
  b: () => (layout)
});
/* ESM import */var _layout_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(992);

function layout(slot) {
    let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    const { base = '/' } = options;
    // 判断链接是否激活
    const isActive = (path)=>{
        // 对于空路径的特殊处理
        if (!path) {
            return '';
        }
        // 如果 options.url 不存在，返回空字符串
        if (!options.url) {
            return '';
        }
        // 从 URL 中移除查询参数
        const urlWithoutQuery = options.url.split('?')[0];
        const pathWithoutQuery = path.startsWith('/') ? path : '/' + path;
        // 对于首页的特殊处理
        if (pathWithoutQuery === '/' && urlWithoutQuery === '/') {
            return 'active';
        }
        return urlWithoutQuery === pathWithoutQuery ? 'active' : '';
    };
    // 处理相对路径
    const resolvePath = (path)=>{
        if (path.startsWith('http')) return path;
        return base + (path.startsWith('/') ? path.slice(1) : path);
    };
    return '\n<div class="layout">\n    <header class="header">\n        <div class="container">\n            <h1><img src="https://www.esmnext.com/logo.svg" alt="Esmx Logo" width="48" height="48"></h1>\n            <nav class="nav">\n                <a href="'.concat(resolvePath('/'), ' " class="').concat(isActive('/'), '">\u9996\u9875</a>\n                <a href="').concat(resolvePath('about'), '" class="').concat(isActive('/about'), '">\u5173\u4E8E\u6211\u4EEC</a>\n                <a href="https://github.com/esmnext/esmx/tree/master/examples/ssr-html" target="_blank">\u793A\u4F8B\u4EE3\u7801</a>\n            </nav>\n        </div>\n    </header>\n    <main class="main">\n        <div class="container">\n            ').concat(slot, "\n        </div>\n    </main>\n</div>\n");
}


}),
286: (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.d(__webpack_exports__, {
  T: () => (Page)
});
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
class Page {
    get props() {
        if (this._props === null) {
            throw new Error("props is null");
        }
        return this._props;
    }
    set props(props) {
        this._props = props;
    }
    /**
     * 服务端渲染生成的 HTML
     */ render() {
        return "";
    }
    /**
     * 组件已经创建完成，props 和 state 已经准备就绪
     */ onCreated() {}
    /**
     * 客户端执行
     */ onClient() {}
    /**
     * 服务端执行
     */ async onServer() {
        this.importMetaSet.add(import.meta);
    }
    constructor(){
        _define_property(this, "importMetaSet", new Set());
        _define_property(this, "_props", null);
        _define_property(this, "title", '');
        /**
     * 自定义页面状态
     */ _define_property(this, "state", {});
    }
}


}),
896: (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
__webpack_require__.r(__webpack_exports__);
__webpack_require__.d(__webpack_exports__, {
  "default": () => (Home)
});
/* ESM import */var ssr_html_src_components_layout__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(878);
/* ESM import */var ssr_html_src_page__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(286);
/* ESM import */var _title__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(360);
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}



class Home extends ssr_html_src_page__WEBPACK_IMPORTED_MODULE_2__/* .Page */.T {
    render() {
        const { url, base } = this.props;
        return (0,ssr_html_src_components_layout__WEBPACK_IMPORTED_MODULE_0__/* .layout */.b)('<div class="about-page">\n                <section class="about-hero">\n                    <h2>\u5173\u4E8E Esmx</h2>\n                    <p>\u73B0\u4EE3\u5316\u7684\u5FAE\u524D\u7AEF\u6A21\u5757\u5171\u4EAB\u89E3\u51B3\u65B9\u6848</p>\n                </section>\n                \n                <section class="feature-grid">\n                    <div class="feature-card">\n                        <div class="icon">\u26A1\uFE0F</div>\n                        <div class="content">\n                            <h3>\u6781\u901F\u6784\u5EFA</h3>\n                            <p>\u57FA\u4E8E Rust \u5F00\u53D1\u7684 Rspack \u6784\u5EFA\u5F15\u64CE\uFF0C\u63D0\u4F9B\u6BD4\u4F20\u7EDF\u5DE5\u5177\u5FEB 10-100 \u500D\u7684\u6784\u5EFA\u6027\u80FD\u3002</p>\n                        </div>\n                    </div>\n\n                    <div class="feature-card">\n                        <div class="icon">\uD83D\uDD04</div>\n                        <div class="content">\n                            <h3>\u6A21\u5757\u5171\u4EAB</h3>\n                            <p>\u521B\u65B0\u7684\u6A21\u5757\u94FE\u63A5\u6280\u672F\uFF0C\u5B9E\u73B0\u591A\u4E2A\u5FAE\u524D\u7AEF\u5E94\u7528\u95F4\u65E0\u7F1D\u5171\u4EAB\u548C\u6309\u9700\u52A0\u8F7D\u6A21\u5757\uFF0C\u964D\u4F4E\u91CD\u590D\u4F9D\u8D56\u3002</p>\n                        </div>\n                    </div>\n\n                    <div class="feature-card">\n                        <div class="icon">\uD83D\uDE80</div>\n                        <div class="content">\n                            <h3>\u6027\u80FD\u4F18\u5316</h3>\n                            <p>\u57FA\u4E8E\u5185\u5BB9\u54C8\u5E0C\u7684\u667A\u80FD\u7F13\u5B58\u7B56\u7565\uFF0C\u914D\u5408 HTTP/3 \u548C ESM\uFF0C\u663E\u8457\u63D0\u5347\u5E94\u7528\u52A0\u8F7D\u6027\u80FD\u3002</p>\n                        </div>\n                    </div>\n\n                    <div class="feature-card">\n                        <div class="icon">\uD83D\uDEE0\uFE0F</div>\n                        <div class="content">\n                            <h3>\u7B80\u5355\u6613\u7528</h3>\n                            <p>\u96F6\u914D\u7F6E\u7684 importmap \u6A21\u5757\u6620\u5C04\uFF0C\u5F00\u7BB1\u5373\u7528\u7684\u6784\u5EFA\u4F18\u5316\uFF0C\u8BA9\u5F00\u53D1\u8005\u4E13\u6CE8\u4E8E\u4E1A\u52A1\u903B\u8F91\u3002</p>\n                        </div>\n                    </div>\n                </section>\n\n                <section class="about-footer">\n                    <div class="update-info">\n                        <span>\u6700\u540E\u66F4\u65B0\uFF1A'.concat(new Date(this.state.time).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }), "</span>\n                    </div>\n                </section>\n            </div>"), {
            url,
            base
        });
    }
    /**
     * 模拟服务端请求数据
     */ async onServer() {
        this.importMetaSet.add(import.meta);
        super.onServer();
        this.state.time = new Date().toISOString();
    }
    constructor(...args){
        super(...args), _define_property(this, "state", {
            time: ''
        }), _define_property(this, "title", _title__WEBPACK_IMPORTED_MODULE_1__.title.about);
    }
}



}),
992: (function (module, __unused_webpack_exports, __webpack_require__) {
module.exports = {};


}),

};
