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
    return `
<div class="layout">
    <header class="header">
        <div class="container">
            <h1><img src="https://www.esmnext.com/logo.svg" alt="Esmx Logo" width="48" height="48"></h1>
            <nav class="nav">
                <a href="${resolvePath('/')} " class="${isActive('/')}">\u{9996}\u{9875}</a>
                <a href="${resolvePath('about')}" class="${isActive('/about')}">\u{5173}\u{4E8E}\u{6211}\u{4EEC}</a>
                <a href="https://github.com/esmnext/esmx/tree/master/examples/ssr-html" target="_blank">\u{793A}\u{4F8B}\u{4EE3}\u{7801}</a>
            </nav>
        </div>
    </header>
    <main class="main">
        <div class="container">
            ${slot}
        </div>
    </main>
</div>
`;
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
            throw new Error(`props is null`);
        }
        return this._props;
    }
    set props(props) {
        this._props = props;
    }
    /**
     * 服务端渲染生成的 HTML
     */ render() {
        return ``;
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
        return (0,ssr_html_src_components_layout__WEBPACK_IMPORTED_MODULE_0__/* .layout */.b)(`<div class="about-page">
                <section class="about-hero">
                    <h2>\u{5173}\u{4E8E} Esmx</h2>
                    <p>\u{73B0}\u{4EE3}\u{5316}\u{7684}\u{5FAE}\u{524D}\u{7AEF}\u{6A21}\u{5757}\u{5171}\u{4EAB}\u{89E3}\u{51B3}\u{65B9}\u{6848}</p>
                </section>
                
                <section class="feature-grid">
                    <div class="feature-card">
                        <div class="icon">\u{26A1}\u{FE0F}</div>
                        <div class="content">
                            <h3>\u{6781}\u{901F}\u{6784}\u{5EFA}</h3>
                            <p>\u{57FA}\u{4E8E} Rust \u{5F00}\u{53D1}\u{7684} Rspack \u{6784}\u{5EFA}\u{5F15}\u{64CE}\u{FF0C}\u{63D0}\u{4F9B}\u{6BD4}\u{4F20}\u{7EDF}\u{5DE5}\u{5177}\u{5FEB} 10-100 \u{500D}\u{7684}\u{6784}\u{5EFA}\u{6027}\u{80FD}\u{3002}</p>
                        </div>
                    </div>

                    <div class="feature-card">
                        <div class="icon">\u{1F504}</div>
                        <div class="content">
                            <h3>\u{6A21}\u{5757}\u{5171}\u{4EAB}</h3>
                            <p>\u{521B}\u{65B0}\u{7684} Module Link \u{6280}\u{672F}\u{FF0C}\u{5B9E}\u{73B0}\u{591A}\u{4E2A}\u{5FAE}\u{524D}\u{7AEF}\u{5E94}\u{7528}\u{95F4}\u{65E0}\u{7F1D}\u{5171}\u{4EAB}\u{548C}\u{6309}\u{9700}\u{52A0}\u{8F7D}\u{6A21}\u{5757}\u{FF0C}\u{964D}\u{4F4E}\u{91CD}\u{590D}\u{4F9D}\u{8D56}\u{3002}</p>
                        </div>
                    </div>

                    <div class="feature-card">
                        <div class="icon">\u{1F680}</div>
                        <div class="content">
                            <h3>\u{6027}\u{80FD}\u{4F18}\u{5316}</h3>
                            <p>\u{57FA}\u{4E8E}\u{5185}\u{5BB9}\u{54C8}\u{5E0C}\u{7684}\u{667A}\u{80FD}\u{7F13}\u{5B58}\u{7B56}\u{7565}\u{FF0C}\u{914D}\u{5408} HTTP/3 \u{548C} ESM\u{FF0C}\u{663E}\u{8457}\u{63D0}\u{5347}\u{5E94}\u{7528}\u{52A0}\u{8F7D}\u{6027}\u{80FD}\u{3002}</p>
                        </div>
                    </div>

                    <div class="feature-card">
                        <div class="icon">\u{1F6E0}\u{FE0F}</div>
                        <div class="content">
                            <h3>\u{7B80}\u{5355}\u{6613}\u{7528}</h3>
                            <p>\u{96F6}\u{914D}\u{7F6E}\u{7684} importmap \u{6A21}\u{5757}\u{6620}\u{5C04}\u{FF0C}\u{5F00}\u{7BB1}\u{5373}\u{7528}\u{7684}\u{6784}\u{5EFA}\u{4F18}\u{5316}\u{FF0C}\u{8BA9}\u{5F00}\u{53D1}\u{8005}\u{4E13}\u{6CE8}\u{4E8E}\u{4E1A}\u{52A1}\u{903B}\u{8F91}\u{3002}</p>
                        </div>
                    </div>
                </section>

                <section class="about-footer">
                    <div class="update-info">
                        <span>\u{6700}\u{540E}\u{66F4}\u{65B0}\u{FF1A}${new Date(this.state.time).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })}</span>
                    </div>
                </section>
            </div>`, {
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
