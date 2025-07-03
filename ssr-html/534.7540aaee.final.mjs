export const __webpack_ids__ = ["534"];
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
40: (function (__unused_webpack_module, __webpack_exports__, __webpack_require__) {
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "default": () => (/* binding */ Home)
});

// EXTERNAL MODULE: ./src/components/layout.ts
var layout = __webpack_require__(878);
;// CONCATENATED MODULE: ./src/images/cat.jpeg
const cat_namespaceObject = __webpack_require__.p + "images/cat.ed79ef6b.final.jpeg";
;// CONCATENATED MODULE: ./src/images/logo.svg
const logo_namespaceObject = __webpack_require__.p + "images/logo.3923d727.final.svg";
;// CONCATENATED MODULE: ./src/images/running-dog.gif
const running_dog_namespaceObject = __webpack_require__.p + "images/running-dog.76197e20.final.gif";
;// CONCATENATED MODULE: ./src/images/starry.jpg
const starry_namespaceObject = __webpack_require__.p + "images/starry.d914a632.final.jpg";
;// CONCATENATED MODULE: ./src/images/sun.png
const sun_namespaceObject = __webpack_require__.p + "images/sun.429a7bc5.final.png";
;// CONCATENATED MODULE: ./src/images/index.ts







// EXTERNAL MODULE: ./src/page.ts
var page = __webpack_require__(286);
// EXTERNAL MODULE: external "ssr-html/src/title/index"
var index_ = __webpack_require__(360);
;// CONCATENATED MODULE: ./src/views/home.ts
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




class Home extends page/* .Page */.T {
    render() {
        const { url, base } = this.props;
        const { count } = this.state;
        return (0,layout/* .layout */.b)('\n        <section>\n            <h2>\u8BA1\u6570\u5668</h2>\n            <div class="content-area counter">\n                <div id="count" class="counter-value">'.concat(count, '</div>\n            </div>\n        </section>\n\n        <section>\n            <h2>\u8BF7\u6C42\u5730\u5740</h2>\n            <div class="content-area url-section">\n                <pre>').concat(url, '</pre>\n            </div>\n        </section>\n\n        <section>\n            <h2>\u56FE\u7247\u5C55\u793A</h2>\n            <ul class="image-grid">\n                <li>\n                    <div class="image-wrapper">\n                        <img src="').concat(logo_namespaceObject, '" alt="SVG\u793A\u4F8B" width="200" height="200">\n                    </div>\n                    <div class="image-info">\n                        <h3>SVG \u793A\u4F8B</h3>\n                        <p>\u7C7B\u578B\uFF1ASVG</p>\n                        <p>\u5C3A\u5BF8\uFF1A200 x 200</p>\n                    </div>\n                </li>\n                <li>\n                    <div class="image-wrapper">\n                        <img src="').concat(starry_namespaceObject, '" alt="JPG\u793A\u4F8B" width="1024" height="768">\n                    </div>\n                    <div class="image-info">\n                        <h3>JPG \u793A\u4F8B</h3>\n                        <p>\u7C7B\u578B\uFF1AJPG</p>\n                        <p>\u5C3A\u5BF8\uFF1A1024 x 768</p>\n                    </div>\n                </li>\n                <li>\n                    <div class="image-wrapper">\n                        <img src="').concat(cat_namespaceObject, '" alt="\u732B\u54AA\u56FE\u7247" width="769" height="225">\n                    </div>\n                    <div class="image-info">\n                        <h3>\u732B\u54AA\u56FE\u7247</h3>\n                        <p>\u7C7B\u578B\uFF1APNG</p>\n                        <p>\u5C3A\u5BF8\uFF1A769 x 225</p>\n                    </div>\n                </li>\n                <li>\n                    <div class="image-wrapper">\n                        <img src="').concat(running_dog_namespaceObject, '" alt="\u75AF\u72C2\u7F16\u7801" width="480" height="297">\n                    </div>\n                    <div class="image-info">\n                        <h3>\u75AF\u72C2\u7F16\u7801</h3>\n                        <p>\u7C7B\u578B\uFF1AGIF</p>\n                        <p>\u5C3A\u5BF8\uFF1A480 x 297</p>\n                    </div>\n                </li>\n                <li>\n                    <div class="image-wrapper">\n                        <img src="').concat(sun_namespaceObject, '" alt="\u592A\u9633\u56FE\u6807" width="351" height="300">\n                    </div>\n                    <div class="image-info">\n                        <h3>\u592A\u9633\u56FE\u6807</h3>\n                        <p>\u7C7B\u578B\uFF1ASVG</p>\n                        <p>\u5C3A\u5BF8\uFF1A351 x 300</p>\n                    </div>\n                </li>\n            </ul>\n        </section>\n\n        <section class="update-section">\n            <div class="update-info">\n                <span>\u6700\u540E\u66F4\u65B0\uFF1A').concat(new Date(this.state.time).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }), "</span>\n            </div>\n        </section>\n"), {
            url: url,
            base: base
        });
    }
    onClient() {
        setInterval(()=>{
            this.state.count++;
            const countEl = document.querySelector('#count');
            if (countEl instanceof HTMLDivElement) {
                countEl.innerText = String(this.state.count);
            }
        }, 1000);
    }
    /**
     * 模拟服务端请求数据
     */ async onServer() {
        this.importMetaSet.add(import.meta);
        super.onServer();
        this.state.count = 1;
        this.state.time = new Date().toISOString();
    }
    constructor(...args){
        super(...args), _define_property(this, "state", {
            count: 0,
            time: ''
        }), _define_property(this, "title", index_.title.home);
    }
}



}),
992: (function (module, __unused_webpack_exports, __webpack_require__) {
module.exports = {};


}),

};
