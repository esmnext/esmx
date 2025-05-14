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




class Home extends page/* Page */.T {
    render() {
        const { url, base } = this.props;
        const { count } = this.state;
        return (0,layout/* layout */.b)(`
        <section>
            <h2>\u{8BA1}\u{6570}\u{5668}</h2>
            <div class="content-area counter">
                <div id="count" class="counter-value">${count}</div>
            </div>
        </section>

        <section>
            <h2>\u{8BF7}\u{6C42}\u{5730}\u{5740}</h2>
            <div class="content-area url-section">
                <pre>${url}</pre>
            </div>
        </section>

        <section>
            <h2>\u{56FE}\u{7247}\u{5C55}\u{793A}</h2>
            <ul class="image-grid">
                <li>
                    <div class="image-wrapper">
                        <img src="${logo_namespaceObject}" alt="SVG\u{793A}\u{4F8B}" width="200" height="200">
                    </div>
                    <div class="image-info">
                        <h3>SVG \u{793A}\u{4F8B}</h3>
                        <p>\u{7C7B}\u{578B}\u{FF1A}SVG</p>
                        <p>\u{5C3A}\u{5BF8}\u{FF1A}200 x 200</p>
                    </div>
                </li>
                <li>
                    <div class="image-wrapper">
                        <img src="${starry_namespaceObject}" alt="JPG\u{793A}\u{4F8B}" width="1024" height="768">
                    </div>
                    <div class="image-info">
                        <h3>JPG \u{793A}\u{4F8B}</h3>
                        <p>\u{7C7B}\u{578B}\u{FF1A}JPG</p>
                        <p>\u{5C3A}\u{5BF8}\u{FF1A}1024 x 768</p>
                    </div>
                </li>
                <li>
                    <div class="image-wrapper">
                        <img src="${cat_namespaceObject}" alt="\u{732B}\u{54AA}\u{56FE}\u{7247}" width="769" height="225">
                    </div>
                    <div class="image-info">
                        <h3>\u{732B}\u{54AA}\u{56FE}\u{7247}</h3>
                        <p>\u{7C7B}\u{578B}\u{FF1A}PNG</p>
                        <p>\u{5C3A}\u{5BF8}\u{FF1A}769 x 225</p>
                    </div>
                </li>
                <li>
                    <div class="image-wrapper">
                        <img src="${running_dog_namespaceObject}" alt="\u{75AF}\u{72C2}\u{7F16}\u{7801}" width="480" height="297">
                    </div>
                    <div class="image-info">
                        <h3>\u{75AF}\u{72C2}\u{7F16}\u{7801}</h3>
                        <p>\u{7C7B}\u{578B}\u{FF1A}GIF</p>
                        <p>\u{5C3A}\u{5BF8}\u{FF1A}480 x 297</p>
                    </div>
                </li>
                <li>
                    <div class="image-wrapper">
                        <img src="${sun_namespaceObject}" alt="\u{592A}\u{9633}\u{56FE}\u{6807}" width="351" height="300">
                    </div>
                    <div class="image-info">
                        <h3>\u{592A}\u{9633}\u{56FE}\u{6807}</h3>
                        <p>\u{7C7B}\u{578B}\u{FF1A}SVG</p>
                        <p>\u{5C3A}\u{5BF8}\u{FF1A}351 x 300</p>
                    </div>
                </li>
            </ul>
        </section>

        <section class="update-section">
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
`, {
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
