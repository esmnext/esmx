export const __webpack_ids__ = ['534'];
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
                <a href="${resolvePath('/')} " class="${isActive('/')}">首页</a>
                <a href="${resolvePath('about')}" class="${isActive('/about')}">关于我们</a>
                <a href="https://github.com/esmnext/esmx/tree/master/examples/ssr-html" target="_blank">示例代码</a>
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
            <h2>计数器</h2>
            <div class="content-area counter">
                <div id="count" class="counter-value">${count}</div>
            </div>
        </section>

        <section>
            <h2>请求地址</h2>
            <div class="content-area url-section">
                <pre>${url}</pre>
            </div>
        </section>

        <section>
            <h2>图片展示</h2>
            <ul class="image-grid">
                <li>
                    <div class="image-wrapper">
                        <img src="${logo_namespaceObject}" alt="SVG示例" width="200" height="200">
                    </div>
                    <div class="image-info">
                        <h3>SVG 示例</h3>
                        <p>类型：SVG</p>
                        <p>尺寸：200 x 200</p>
                    </div>
                </li>
                <li>
                    <div class="image-wrapper">
                        <img src="${starry_namespaceObject}" alt="JPG示例" width="1024" height="768">
                    </div>
                    <div class="image-info">
                        <h3>JPG 示例</h3>
                        <p>类型：JPG</p>
                        <p>尺寸：1024 x 768</p>
                    </div>
                </li>
                <li>
                    <div class="image-wrapper">
                        <img src="${cat_namespaceObject}" alt="猫咪图片" width="769" height="225">
                    </div>
                    <div class="image-info">
                        <h3>猫咪图片</h3>
                        <p>类型：PNG</p>
                        <p>尺寸：769 x 225</p>
                    </div>
                </li>
                <li>
                    <div class="image-wrapper">
                        <img src="${running_dog_namespaceObject}" alt="疯狂编码" width="480" height="297">
                    </div>
                    <div class="image-info">
                        <h3>疯狂编码</h3>
                        <p>类型：GIF</p>
                        <p>尺寸：480 x 297</p>
                    </div>
                </li>
                <li>
                    <div class="image-wrapper">
                        <img src="${sun_namespaceObject}" alt="太阳图标" width="351" height="300">
                    </div>
                    <div class="image-info">
                        <h3>太阳图标</h3>
                        <p>类型：SVG</p>
                        <p>尺寸：351 x 300</p>
                    </div>
                </li>
            </ul>
        </section>

        <section class="update-section">
            <div class="update-info">
                <span>最后更新：${new Date(this.state.time).toLocaleString('zh-CN', {
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
