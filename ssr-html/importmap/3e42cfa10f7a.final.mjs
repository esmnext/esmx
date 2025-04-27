(() => {
const base = document.currentScript.getAttribute("data-base");
const importmap = {"scopes":{},"imports":{"ssr-html\u002Fsrc\u002Fentry.client":"\u002Fhome\u002Frunner\u002Fwork\u002Fesmx\u002Fesmx\u002Fexamples\u002Fssr-html\u002Fdist\u002Fserver\u002Fsrc\u002Fentry.client.d731ede7.final.mjs","ssr-html\u002Fsrc\u002Ftitle\u002Findex":"\u002Fhome\u002Frunner\u002Fwork\u002Fesmx\u002Fesmx\u002Fexamples\u002Fssr-html\u002Fdist\u002Fserver\u002Fsrc\u002Ftitle\u002Findex.2d79c0c2.final.mjs"}};
if (importmap.imports && base) {
    const imports = importmap.imports;
    Object.entries(imports).forEach(([k, v]) => {
        imports[k] = base + v;
    });
}
const script = document.createElement("script");
script.type = "importmap";
script.innerHTML = JSON.stringify(importmap);
document.head.appendChild(script);
})();