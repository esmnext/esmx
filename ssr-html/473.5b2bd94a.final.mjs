export const __webpack_ids__ = ['473'];
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
    return '\n<div class="layout">\n    <header class="header">\n        <div class="container">\n            <h1><img src="https://www.esmnext.com/logo.svg" alt="Esmx Logo" width="48" height="48"></h1>\n            <nav class="nav">\n                <a href="'.concat(resolvePath('/'), ' " class="').concat(isActive('/'), '">首页</a>\n                <a href="').concat(resolvePath('about'), '" class="').concat(isActive('/about'), '">关于我们</a>\n                <a href="https://github.com/esmnext/esmx/tree/master/examples/ssr-html" target="_blank">示例代码</a>\n            </nav>\n        </div>\n    </header>\n    <main class="main">\n        <div class="container">\n            ').concat(slot, "\n        </div>\n    </main>\n</div>\n");
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
        return (0,ssr_html_src_components_layout__WEBPACK_IMPORTED_MODULE_0__/* .layout */.b)('<div class="about-page">\n                <section class="about-hero">\n                    <h2>关于 Esmx</h2>\n                    <p>现代化的微前端模块共享解决方案</p>\n                </section>\n                \n                <section class="feature-grid">\n                    <div class="feature-card">\n                        <div class="icon">⚡️</div>\n                        <div class="content">\n                            <h3>极速构建</h3>\n                            <p>基于 Rust 开发的 Rspack 构建引擎，提供比传统工具快 10-100 倍的构建性能。</p>\n                        </div>\n                    </div>\n\n                    <div class="feature-card">\n                        <div class="icon">\uD83D\uDD04</div>\n                        <div class="content">\n                            <h3>模块共享</h3>\n                            <p>创新的 Module Link 技术，实现多个微前端应用间无缝共享和按需加载模块，降低重复依赖。</p>\n                        </div>\n                    </div>\n\n                    <div class="feature-card">\n                        <div class="icon">\uD83D\uDE80</div>\n                        <div class="content">\n                            <h3>性能优化</h3>\n                            <p>基于内容哈希的智能缓存策略，配合 HTTP/3 和 ESM，显著提升应用加载性能。</p>\n                        </div>\n                    </div>\n\n                    <div class="feature-card">\n                        <div class="icon">\uD83D\uDEE0️</div>\n                        <div class="content">\n                            <h3>简单易用</h3>\n                            <p>零配置的 importmap 模块映射，开箱即用的构建优化，让开发者专注于业务逻辑。</p>\n                        </div>\n                    </div>\n                </section>\n\n                <section class="about-footer">\n                    <div class="update-info">\n                        <span>最后更新：'.concat(new Date(this.state.time).toLocaleString('zh-CN', {
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
