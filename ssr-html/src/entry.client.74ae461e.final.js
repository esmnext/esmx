import * as __WEBPACK_EXTERNAL_MODULE_ssr_html_src_title_index_b0dadcd5__ from "ssr-html/src/title/index";
var __webpack_modules__ = ({
612: (function (module, __unused_webpack_exports, __webpack_require__) {
module.exports = {};


}),
360: (function (module) {

module.exports = __WEBPACK_EXTERNAL_MODULE_ssr_html_src_title_index_b0dadcd5__;


}),

});
/************************************************************************/
// The module cache
var __webpack_module_cache__ = {};

// The require function
function __webpack_require__(moduleId) {

// Check if module is in cache
var cachedModule = __webpack_module_cache__[moduleId];
if (cachedModule !== undefined) {
return cachedModule.exports;
}
// Create a new module (and put it into the cache)
var module = (__webpack_module_cache__[moduleId] = {
exports: {}
});
// Execute the module function
__webpack_modules__[moduleId](module, module.exports, __webpack_require__);

// Return the exports of the module
return module.exports;

}

// expose the modules object (__webpack_modules__)
__webpack_require__.m = __webpack_modules__;

/************************************************************************/
// webpack/runtime/define_property_getters
(() => {
__webpack_require__.d = (exports, definition) => {
	for(var key in definition) {
        if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
            Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
    }
};
})();
// webpack/runtime/ensure_chunk
(() => {
__webpack_require__.f = {};
// This file contains only the entry chunk.
// The chunk loading function for additional chunks
__webpack_require__.e = (chunkId) => {
	return Promise.all(
		Object.keys(__webpack_require__.f).reduce((promises, key) => {
			__webpack_require__.f[key](chunkId, promises);
			return promises;
		}, [])
	);
};
})();
// webpack/runtime/get css chunk filename
(() => {
// This function allow to reference chunks
__webpack_require__.k = (chunkId) => {
  // return url for filenames not based on template
  
  // return url for filenames based on template
  return "chunks/" + chunkId + "." + {"473": "63b8fd4f","534": "63b8fd4f","830": "63b8fd4f",}[chunkId] + ".final.css"
}
})();
// webpack/runtime/get javascript chunk filename
(() => {
// This function allow to reference chunks
__webpack_require__.u = (chunkId) => {
  // return url for filenames not based on template
  
  // return url for filenames based on template
  return "chunks/" + chunkId + "." + {"473": "c6f811ea","534": "82a3bdb1","830": "b760cb75",}[chunkId] + ".final.js"
}
})();
// webpack/runtime/global
(() => {
__webpack_require__.g = (() => {
	if (typeof globalThis === 'object') return globalThis;
	try {
		return this || new Function('return this')();
	} catch (e) {
		if (typeof window === 'object') return window;
	}
})();
})();
// webpack/runtime/has_own_property
(() => {
__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
})();
// webpack/runtime/make_namespace_object
(() => {
// define __esModule on exports
__webpack_require__.r = (exports) => {
	if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
	}
	Object.defineProperty(exports, '__esModule', { value: true });
};
})();
// webpack/runtime/auto_public_path
(() => {
var scriptUrl;

if (typeof import.meta.url === "string") scriptUrl = import.meta.url

// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration",
// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.',
if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
scriptUrl = scriptUrl.replace(/^blob:/, "").replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
__webpack_require__.p = scriptUrl + '../'
})();
// webpack/runtime/css_loading
(() => {
var installedChunks = {"891": 0,};
var uniqueName = "__ssr_html__";
function handleCssComposes(exports, composes) {
  for (var i = 0; i < composes.length; i += 3) {
    var moduleId = composes[i];
    var composeFrom = composes[i + 1];
    var composeVar = composes[i + 2];
    var composedId = __webpack_require__(composeFrom)[composeVar];
    exports[moduleId] = exports[moduleId] + " " + composedId
  }
}
var loadCssChunkData = (target, chunkId) => {

installedChunks[chunkId] = 0;

}
var loadingAttribute = "data-webpack-loading";
var loadStylesheet = function (chunkId, url, done, hmr, fetchPriority) {
	var link,
		needAttach,
		key = "chunk-" + chunkId;
	if (!hmr) {
		var links = document.getElementsByTagName("link");
		for (var i = 0; i < links.length; i++) {
			var l = links[i];
			var href = l.getAttribute("href") || l.href;
			if (href && !href.startsWith(__webpack_require__.p)) {
				href =
					__webpack_require__.p + (href.startsWith("/") ? href.slice(1) : href);
			}
			if (
				l.rel == "stylesheet" &&
				((href && href.startsWith(url)) ||
					l.getAttribute("data-webpack") == uniqueName + ":" + key)
			) {
				link = l;
				break;
			}
		}
		if (!done) return link;
	}
	if (!link) {
		needAttach = true;
		link = document.createElement("link");
		if (__webpack_require__.nc) {
			link.setAttribute("nonce", __webpack_require__.nc);
		}
		link.setAttribute("data-webpack", uniqueName + ":" + key);
		if (fetchPriority) {
			link.setAttribute("fetchpriority", fetchPriority);
		}
		link.setAttribute(loadingAttribute, 1);
		link.rel = "stylesheet";
		link.href = url;

		
	}
	var onLinkComplete = function (prev, event) {
		link.onerror = link.onload = null;
		link.removeAttribute(loadingAttribute);
		clearTimeout(timeout);
		if (event && event.type != "load") link.parentNode.removeChild(link);
		done(event);
		if (prev) return prev(event);
	};
	if (link.getAttribute(loadingAttribute)) {
		var timeout = setTimeout(
			onLinkComplete.bind(null, undefined, { type: "timeout", target: link }),
			120000
		);
		link.onerror = onLinkComplete.bind(null, link.onerror);
		link.onload = onLinkComplete.bind(null, link.onload);
	} else onLinkComplete(undefined, { type: "load", target: link });
	hmr ? document.head.insertBefore(link, hmr) : needAttach && document.head.appendChild(link);
	return link;
};
loadCssChunkData(__webpack_require__.m, 0, "891");
__webpack_require__.f.css = function (chunkId, promises, fetchPriority) {
	// css chunk loading
	var installedChunkData = __webpack_require__.o(installedChunks, chunkId)
		? installedChunks[chunkId]
		: undefined;
	if (installedChunkData !== 0) {
		// 0 means "already installed".

		// a Promise means "currently loading".
		if (installedChunkData) {
			promises.push(installedChunkData[2]);
		} else {
			if (true) {
				// setup Promise in chunk cache
				var promise = new Promise(function (resolve, reject) {
					installedChunkData = installedChunks[chunkId] = [resolve, reject];
				});
				promises.push((installedChunkData[2] = promise));

				// start chunk loading
				var url = __webpack_require__.p + __webpack_require__.k(chunkId);
				// create error before stack unwound to get useful stacktrace later
				var error = new Error();
				var loadingEnded = function (event) {
					if (__webpack_require__.o(installedChunks, chunkId)) {
						installedChunkData = installedChunks[chunkId];
						if (installedChunkData !== 0) installedChunks[chunkId] = undefined;
						if (installedChunkData) {
							if (event.type !== "load") {
								var errorType = event && event.type;
								var realSrc = event && event.target && event.target.src;
								error.message =
									"Loading css chunk " +
									chunkId +
									" failed.\n(" +
									errorType +
									": " +
									realSrc +
									")";
								error.name = "ChunkLoadError";
								error.type = errorType;
								error.request = realSrc;
								installedChunkData[1](error);
							} else {
								loadCssChunkData(__webpack_require__.m, chunkId);
								installedChunkData[0]();
							}
						}
					}
				};
				var link = loadStylesheet(chunkId, url, loadingEnded, undefined, fetchPriority);
			} else installedChunks[chunkId] = 0;
		}
	}
};

})();
// webpack/runtime/module_chunk_loading
(() => {

      // object to store loaded and loading chunks
      // undefined = chunk not loaded, null = chunk preloaded/prefetched
      // [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
      var installedChunks = {"891": 0,};
      var installChunk = (data) => {
    var __webpack_ids__ = data.__webpack_ids__;
    var __webpack_modules__ = data.__webpack_modules__;
    var __webpack_runtime__ = data.__webpack_runtime__;
    // add "modules" to the modules object,
    // then flag all "ids" as loaded and fire callback
    var moduleId, chunkId, i = 0;
    for (moduleId in __webpack_modules__) {
        if (__webpack_require__.o(__webpack_modules__, moduleId)) {
            __webpack_require__.m[moduleId] = __webpack_modules__[moduleId];
        }
    }
    if (__webpack_runtime__) __webpack_runtime__(__webpack_require__);
    for (; i < __webpack_ids__.length; i++) {
        chunkId = __webpack_ids__[i];
        if (__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
            installedChunks[chunkId][0]();
        }
        installedChunks[__webpack_ids__[i]] = 0;
    }
    
};
        __webpack_require__.f.j = function (chunkId, promises) {
          // import() chunk loading for javascript
var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
if (installedChunkData !== 0) { // 0 means "already installed".'
    // a Promise means "currently loading".
    if (installedChunkData) {
        promises.push(installedChunkData[1]);
    } else {
        if (true) {
            // setup Promise in chunk cache
            var promise = import("../" + __webpack_require__.u(chunkId)).then(installChunk, (e) => {
                if (installedChunks[chunkId] !== 0) installedChunks[chunkId] = undefined;
                throw e;
            });
            var promise = Promise.race([promise, new Promise((resolve) => {
                installedChunkData = installedChunks[chunkId] = [resolve];
            })]);
            promises.push(installedChunkData[1] = promise);
        }
        
    }
}
        }
        
})();
/************************************************************************/
var __webpack_exports__ = {};

// EXTERNAL MODULE: ./src/styles/global.css
var global = __webpack_require__(612);
;// CONCATENATED MODULE: ./src/routes.ts

async function getRoutePage(path) {
    const routes = [
        {
            path: '/',
            page: ()=>__webpack_require__.e(/* import() */ "534").then(__webpack_require__.bind(__webpack_require__, 40)).then((m)=>m.default)
        },
        {
            path: '/about',
            page: ()=>__webpack_require__.e(/* import() */ "473").then(__webpack_require__.bind(__webpack_require__, 896)).then((m)=>m.default)
        }
    ];
    const route = routes.find((item)=>{
        return item.path === path;
    });
    if (route) {
        return route.page();
    }
    return __webpack_require__.e(/* import() */ "830").then(__webpack_require__.bind(__webpack_require__, 654)).then((m)=>m.default);
}

;// CONCATENATED MODULE: ./src/entry.client.ts

async function init() {
    const props = window.__INIT_PROPS__;
    const pathname = new URL(props.url, 'file:').pathname;
    const Page = await getRoutePage(pathname);
    const page = new Page();
    page.props = props;
    page.state = window.__INIT_STATE__;
    page.onCreated();
    // 执行客户端初始化逻辑
    page.onClient();
}
init();

